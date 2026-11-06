import React, { useState } from 'react';
import {
  MessageSquare,
  Camera,
  Bell,
  Image,
  Wifi,
  CheckCircle2,
  ExternalLink,
  Info
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { getTranslation } from '../i18n/translations';
import { NativeBridgeService, SmsReader } from '../services/nativeBridge';
import { LocalNotifications } from '@capacitor/local-notifications';

interface PermissionCardItem {
  id: string;
  icon: React.ElementType;
  titleKey: string;
  reasonEn: string;
  reasonHi: string;
  reasonMr: string;
  status: 'granted' | 'denied' | 'not_asked';
  isAutoGranted?: boolean;
}

export const PermissionsScreen: React.FC = () => {
  const { language } = useApp();
  const t = getTranslation(language);

  const [permissions, setPermissions] = useState<PermissionCardItem[]>([
    {
      id: 'sms',
      icon: MessageSquare,
      titleKey: t.permissions.smsTitle,
      reasonEn: t.permissions.smsReason,
      reasonHi: 'बैंक डेबिट संदेशों को स्वतः दर्ज करने के लिए। व्यक्तिगत संदेश कभी नहीं पढ़े जाते।',
      reasonMr: 'बँकेचे डेबिट संदेश स्वयंचलित नोंदवण्यासाठी. वैयक्तिक संदेश कधीही उघडले जात नाहीत.',
      status: 'not_asked'
    },
    {
      id: 'camera',
      icon: Camera,
      titleKey: t.permissions.cameraTitle,
      reasonEn: t.permissions.cameraReason,
      reasonHi: 'रसीद और बिल की फ़ोटो लेने के लिए।',
      reasonMr: 'पावत्यांचे फोटो काढण्यासाठी.',
      status: 'not_asked'
    },
    {
      id: 'notifications',
      icon: Bell,
      titleKey: t.permissions.notificationTitle,
      reasonEn: t.permissions.notificationReason,
      reasonHi: 'दैनिक खर्च दर्ज करने और बजट चेतावनियों के लिए।',
      reasonMr: 'दैनिक खर्च नोंदणी आठवण आणि बजेट सूचनांसाठी.',
      status: 'not_asked'
    },
    {
      id: 'photos',
      icon: Image,
      titleKey: t.permissions.photoTitle,
      reasonEn: t.permissions.photoReason,
      reasonHi: 'रसीद जोड़ने और बैकअप PDF सुरक्षित करने के लिए।',
      reasonMr: 'पावती जोडण्यासाठी आणि अहवाल सुरक्षित करण्यासाठी.',
      status: 'not_asked'
    },
    {
      id: 'internet',
      icon: Wifi,
      titleKey: 'Internet & Network Access',
      reasonEn: 'Auto-granted by Android for WhatsApp/UPI deep-linking and offline fonts. BudgetMitra never uploads your financial data anywhere.',
      reasonHi: 'WhatsApp/UPI लिंक और फ़ॉन्ट्स के लिए Android द्वारा स्वतः स्वीकृत। आपका डेटा कभी इंटरनेट पर अपलोड नहीं होता।',
      reasonMr: 'WhatsApp/UPI आणि फॉन्टसाठी Android द्वारे स्वयंचलित मंजूर. कोणताही डेटा इंटरनेटवर पाठवला जात नाही.',
      status: 'granted',
      isAutoGranted: true
    }
  ]);

  const handleGrant = async (id: string) => {
    if (id === 'sms') {
      try {
        if (NativeBridgeService.isNativeAndroid()) {
          const res = await SmsReader.requestPermissions();
          updateStatus('sms', res.readSms === 'granted' ? 'granted' : 'denied');
        } else {
          // Web preview simulation
          updateStatus('sms', 'granted');
        }
      } catch {
        updateStatus('sms', 'granted');
      }
    } else if (id === 'notifications') {
      try {
        const res = await LocalNotifications.requestPermissions();
        updateStatus('notifications', res.display === 'granted' ? 'granted' : 'denied');
      } catch {
        updateStatus('notifications', 'granted');
      }
    } else if (id === 'camera') {
      try {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          await navigator.mediaDevices.getUserMedia({ video: true });
          updateStatus('camera', 'granted');
        } else {
          updateStatus('camera', 'granted');
        }
      } catch {
        updateStatus('camera', 'denied');
      }
    } else if (id === 'photos') {
      updateStatus('photos', 'granted');
    }
  };

  const updateStatus = (id: string, status: 'granted' | 'denied') => {
    setPermissions((prev) =>
      prev.map((p) => (p.id === id ? { ...p, status } : p))
    );
  };

  const handleOpenAppSettings = async () => {
    if (NativeBridgeService.isNativeAndroid()) {
      try {
        await SmsReader.openAppSettings();
      } catch {
        alert('Please open your phone Settings → Apps → BudgetMitra → Permissions.');
      }
    } else {
      alert('On mobile, this opens the system app settings to toggle permanently denied permissions.');
    }
  };

  const getReason = (item: PermissionCardItem) => {
    if (language === 'hi') return item.reasonHi;
    if (language === 'mr') return item.reasonMr;
    return item.reasonEn;
  };

  return (
    <div className="space-y-4 pb-24">
      {/* Title */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300">
            Privacy First Architecture
          </span>
        </div>
        <h2 className="font-heading font-extrabold text-2xl text-slate-800 dark:text-white">
          {t.permissions.title}
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
          {t.permissions.explainer}
        </p>
      </div>

      {/* Android 13+ Restricted Settings Callout */}
      <div className="glass-card p-4 bg-amber-50/60 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800 flex items-start gap-3">
        <Info className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
        <div className="text-xs text-amber-900 dark:text-amber-200 leading-relaxed">
          <p className="font-bold mb-0.5">Android 13+ Setup Note:</p>
          <p>{t.permissions.restrictedNote}</p>
        </div>
      </div>

      {/* Permissions List */}
      <div className="space-y-3">
        {permissions.map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.id} className="glass-card p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-teal-50 dark:bg-teal-950 text-teal-700 dark:text-teal-300 flex items-center justify-center shrink-0">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-heading font-bold text-sm text-slate-800 dark:text-white">
                        {item.titleKey}
                      </h4>
                      <span
                        className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                          item.status === 'granted'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : item.status === 'denied'
                            ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                            : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                        }`}
                      >
                        {item.status === 'granted'
                          ? t.permissions.granted
                          : item.status === 'denied'
                          ? t.permissions.denied
                          : t.permissions.notAsked}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                      {getReason(item)}
                    </p>
                  </div>
                </div>

                <div className="shrink-0 flex items-center gap-2">
                  {item.isAutoGranted ? (
                    <span className="text-[11px] font-semibold text-emerald-600 flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4" />
                      Active
                    </span>
                  ) : item.status === 'granted' ? (
                    <span className="text-[11px] font-semibold text-emerald-600 flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4" />
                      {t.permissions.granted}
                    </span>
                  ) : (
                    <button
                      onClick={() => handleGrant(item.id)}
                      className="px-3 py-1.5 rounded-xl bg-teal-600 text-white text-xs font-bold hover:bg-teal-700 active:scale-95 transition-all shadow-sm"
                    >
                      {t.permissions.grant}
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Button to open system settings for permanently denied permissions */}
      <div className="pt-2 text-center">
        <button
          onClick={handleOpenAppSettings}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-200 transition-colors"
        >
          <span>{t.permissions.openSettings}</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
