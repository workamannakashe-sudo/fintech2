import { Capacitor, registerPlugin } from '@capacitor/core';
import { Share } from '@capacitor/share';
import { LocalNotifications } from '@capacitor/local-notifications';

export interface NativeSmsPlugin {
  checkPermissions(): Promise<{ readSms: 'granted' | 'denied' | 'prompt' }>;
  requestPermissions(): Promise<{ readSms: 'granted' | 'denied' }>;
  getSmsList(options: { daysBack: number }): Promise<{
    messages: Array<{
      address: string;
      body: string;
      date: string;
    }>;
  }>;
  openAppSettings(): Promise<void>;
}

export const SmsReader = registerPlugin<NativeSmsPlugin>('SmsReader');

// Global interface for Android WebView bridge
interface WindowWithAndroid extends Window {
  AndroidBridge?: {
    hasSmsPermission(): boolean;
    requestSmsPermission(): void;
    getSmsListJson(daysBack: number): string;
    openAppSettings(): void;
    shareViaWhatsApp(text: string): boolean;
    shareBillPdf(base64Data: string, filename: string): boolean;
  };
}

/**
 * Native Bridge for WhatsApp sharing, SMS reading, notifications, and device permissions
 */
export class NativeBridgeService {
  public static isNativeAndroid(): boolean {
    const win = window as WindowWithAndroid;
    return (
      !!win.AndroidBridge ||
      (Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'android')
    );
  }

  /**
   * Share text with recipient via WhatsApp deep-link or fall back to system Share Sheet
   */
  public static async shareViaWhatsApp(text: string): Promise<boolean> {
    const win = window as WindowWithAndroid;
    if (win.AndroidBridge) {
      return win.AndroidBridge.shareViaWhatsApp(text);
    }

    const encoded = encodeURIComponent(text);
    const whatsappUrl = `whatsapp://send?text=${encoded}`;
    const webWhatsAppUrl = `https://wa.me/?text=${encoded}`;

    if (this.isNativeAndroid()) {
      try {
        window.location.href = whatsappUrl;
        return true;
      } catch {
        return this.openShareSheet('BudgetMitra Bill Split', text);
      }
    } else {
      try {
        window.open(webWhatsAppUrl, '_blank');
        return true;
      } catch {
        return this.openShareSheet('BudgetMitra Bill Split', text);
      }
    }
  }

  /**
   * Open standard system share sheet
   */
  public static async openShareSheet(title: string, text: string, url?: string): Promise<boolean> {
    try {
      if (await Share.canShare().then((res) => res.value).catch(() => false)) {
        await Share.share({
          title,
          text,
          url,
          dialogTitle: title
        });
        return true;
      } else if (navigator.share) {
        await navigator.share({ title, text, url });
        return true;
      } else {
        await navigator.clipboard.writeText(text);
        alert('Details copied to clipboard! You can paste it into WhatsApp.');
        return true;
      }
    } catch {
      return false;
    }
  }

  /**
   * Schedule a local notification
   */
  public static async scheduleNotification(title: string, body: string, delayMinutes: number = 0): Promise<void> {
    try {
      const perm = await LocalNotifications.checkPermissions();
      if (perm.display !== 'granted') {
        const req = await LocalNotifications.requestPermissions();
        if (req.display !== 'granted') return;
      }

      const scheduleAt = new Date(Date.now() + delayMinutes * 60 * 1000);
      await LocalNotifications.schedule({
        notifications: [
          {
            id: Math.floor(Math.random() * 100000),
            title,
            body,
            schedule: { at: scheduleAt }
          }
        ]
      });
    } catch {
      // safe fallback on browsers
    }
  }

  /**
   * Fetch SMS from device (Android native or simulated web fallback)
   */
  public static async fetchDeviceSms(daysBack: number = 30): Promise<Array<{ address: string; body: string; date: string }>> {
    const win = window as WindowWithAndroid;
    if (win.AndroidBridge) {
      try {
        const jsonStr = win.AndroidBridge.getSmsListJson(daysBack);
        const list = JSON.parse(jsonStr);
        if (Array.isArray(list) && list.length > 0) {
          return list;
        }
      } catch (err) {
        console.warn('AndroidBridge SMS query failed:', err);
      }
    }

    if (Capacitor.isNativePlatform()) {
      try {
        const res = await SmsReader.getSmsList({ daysBack });
        if (res.messages && res.messages.length > 0) {
          return res.messages;
        }
      } catch (err) {
        console.warn('Native SMS plugin call failed:', err);
      }
    }

    // Realistic Web / Demo Fallback simulating Indian Bank & UPI debit messages
    return [
      {
        address: 'SBIINB',
        body: 'Dear SBI User, your A/C ending 8492 has been debited by Rs 140.00 on 05-Nov-26 via UPI to CAMPUS CANTEEN Ref: 631289104. Avl Bal: Rs 4,120.00',
        date: new Date(Date.now() - 1 * 86400000).toISOString().split('T')[0]
      },
      {
        address: 'HDFCBK',
        body: 'Alert: Rs 60.00 debited from HDFC Bank A/C XX4412 on 04-Nov-26 towards AUTO RICKSHAW UPI. Info: UPI/631289190/Auto. Bal: Rs 3,850.',
        date: new Date(Date.now() - 2 * 86400000).toISOString().split('T')[0]
      },
      {
        address: 'PAYTM',
        body: 'Paid Rs 220.00 from Paytm Payments Bank A/C XX9012 to SWIGGY on 03-Nov-26. UPI Ref: 891238910.',
        date: new Date(Date.now() - 3 * 86400000).toISOString().split('T')[0]
      },
      {
        address: 'ICICIB',
        body: 'ICICI Bank Acct XX102 debited for Rs 450.00 on 02-Nov-26; at STUDENT BOOK DEPOT. Avl Balance: Rs 5,200.00.',
        date: new Date(Date.now() - 4 * 86400000).toISOString().split('T')[0]
      },
      {
        address: 'AXISBK',
        body: 'Rs 2800 debited from your Axis Bank A/C XX7812 on 01-Nov-26 towards HOSTEL MESS FEE. Ref: AX99120.',
        date: new Date(Date.now() - 5 * 86400000).toISOString().split('T')[0]
      },
      {
        address: 'KOTAKB',
        body: 'Kotak Bank Alert: INR 120.00 spent on your Debit Card XX3312 at SHREE XEROX POINT on 01-Nov-26.',
        date: new Date(Date.now() - 5 * 86400000).toISOString().split('T')[0]
      },
      {
        address: 'SBIOTP',
        body: '194820 is your secret OTP for login to SBI YONO. Valid for 10 mins. Do not share with anyone.',
        date: new Date().toISOString().split('T')[0]
      },
      {
        address: 'HDFCPR',
        body: 'Congratulations! You are pre-approved for an instant loan of Rs 50,000. Apply now at hdfc.com/loan.',
        date: new Date().toISOString().split('T')[0]
      }
    ];
  }
}
