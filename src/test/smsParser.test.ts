import { describe, it, expect } from 'vitest';
import { parseBankSms, generateMessageHash } from '../services/smsParser';

describe('SMS Parser - 40+ Real-World Indian Bank & UPI Messages', () => {
  // 1-10: State Bank of India (SBI)
  it('parses SBI UPI debit with merchant', () => {
    const text = 'Dear SBI User, your A/C ending 8492 has been debited by Rs 140.00 on 05-Nov-26 via UPI to CAMPUS CANTEEN Ref: 631289104. Avl Bal: Rs 4,120.00';
    const res = parseBankSms(text, 'SBIINB');
    expect(res.isDebit).toBe(true);
    expect(res.isIgnored).toBe(false);
    expect(res.amount).toBe(140);
    expect(res.category).toBe('Food');
    expect(res.bankName).toBe('SBI');
  });

  it('parses SBI ATM cash withdrawal', () => {
    const text = 'Your A/C 9942 is debited with INR 500.00 on 01-Nov-26 at SBI ATM NEW DELHI. Bal: INR 3,200.00';
    const res = parseBankSms(text, 'SBI');
    expect(res.isDebit).toBe(true);
    expect(res.amount).toBe(500);
  });

  it('ignores SBI credit salary alert', () => {
    const text = 'Your A/C 8492 is credited with Rs 15,000.00 on 01-Nov-26 by Salary/Stipend. Avl Bal: Rs 18,200.00';
    const res = parseBankSms(text, 'SBI');
    expect(res.isDebit).toBe(false);
    expect(res.isIgnored).toBe(true);
  });

  it('ignores SBI login OTP message', () => {
    const text = '194820 is your secret OTP for login to SBI YONO. Valid for 10 mins. Do not share with anyone.';
    const res = parseBankSms(text, 'SBIOTP');
    expect(res.isDebit).toBe(false);
    expect(res.isIgnored).toBe(true);
  });

  it('ignores SBI failed UPI transaction', () => {
    const text = 'Transaction of Rs 350.00 via SBI UPI failed due to incorrect PIN. No amount was debited.';
    const res = parseBankSms(text, 'SBI');
    expect(res.isDebit).toBe(false);
    expect(res.isIgnored).toBe(true);
  });

  // 11-15: HDFC Bank
  it('parses HDFC debit card swipe at grocery', () => {
    const text = 'Alert: Rs. 420.50 was spent on your HDFC Bank Card ending 1029 on 04-Nov-26 at RELIANCE SMART. Avl Bal: Rs 4,200.';
    const res = parseBankSms(text, 'HDFCBK');
    expect(res.isDebit).toBe(true);
    expect(res.amount).toBe(420.5);
    expect(res.category).toBe('Shopping');
    expect(res.bankName).toBe('HDFC Bank');
  });

  it('parses HDFC UPI payment to Auto Rickshaw', () => {
    const text = 'Alert: Rs 60.00 debited from HDFC Bank A/C XX4412 on 04-Nov-26 towards AUTO RICKSHAW UPI. Info: UPI/631289190/Auto. Bal: Rs 3,850.';
    const res = parseBankSms(text, 'HDFCBK');
    expect(res.isDebit).toBe(true);
    expect(res.amount).toBe(60);
    expect(res.category).toBe('Transport');
  });

  it('ignores HDFC inward UPI credit', () => {
    const text = 'Rs 500.00 deposited to your HDFC Bank A/C XX4412 on 03-Nov-26 by Ramesh via UPI. Bal: Rs 4,500.';
    const res = parseBankSms(text, 'HDFCBK');
    expect(res.isDebit).toBe(false);
    expect(res.isIgnored).toBe(true);
  });

  it('ignores HDFC pre-approved loan promo', () => {
    const text = 'Congratulations! You are pre-approved for an instant loan of Rs 50,000. Apply now at hdfc.com/loan.';
    const res = parseBankSms(text, 'HDFCPR');
    expect(res.isDebit).toBe(false);
    expect(res.isIgnored).toBe(true);
  });

  it('ignores HDFC declined transaction', () => {
    const text = 'Your purchase of Rs 2500 on HDFC Card 1029 was declined due to insufficient limit.';
    const res = parseBankSms(text, 'HDFCBK');
    expect(res.isDebit).toBe(false);
    expect(res.isIgnored).toBe(true);
  });

  // 16-20: ICICI Bank
  it('parses ICICI debit at book store', () => {
    const text = 'ICICI Bank Acct XX102 debited for Rs 450.00 on 02-Nov-26; at STUDENT BOOK DEPOT. Avl Balance: Rs 5,200.00.';
    const res = parseBankSms(text, 'ICICIB');
    expect(res.isDebit).toBe(true);
    expect(res.amount).toBe(450);
    expect(res.category).toBe('Books/Tuition');
  });

  it('parses ICICI UPI debit to hostel mess', () => {
    const text = 'Dear Customer, your ICICI Bank A/C XX901 is debited for Rs 2800.00 on 01-Nov-26 towards HOSTEL MESS FEE. Ref: 981203.';
    const res = parseBankSms(text, 'ICICIB');
    expect(res.isDebit).toBe(true);
    expect(res.amount).toBe(2800);
    expect(res.category).toBe('Housing');
  });

  it('ignores ICICI refund credit', () => {
    const text = 'Refund received: Rs 150.00 credited to ICICI Bank Acct XX102 from Swiggy on 03-Nov-26.';
    const res = parseBankSms(text, 'ICICIB');
    expect(res.isDebit).toBe(false);
  });

  it('ignores ICICI OTP alert', () => {
    const text = '839210 is your One Time Password (OTP) for ICICI Netbanking txn of Rs 1,000. Valid for 5 mins.';
    const res = parseBankSms(text, 'ICICIOTP');
    expect(res.isDebit).toBe(false);
  });

  it('ignores ICICI credit card bill reminder', () => {
    const text = 'Your ICICI Bank Credit Card statement is generated. Total amount due is Rs 4,500 by 15-Nov.';
    const res = parseBankSms(text, 'ICICIB');
    expect(res.isDebit).toBe(false);
  });

  // 21-25: Axis Bank
  it('parses Axis Bank debit at cafeteria', () => {
    const text = 'Rs 120.00 spent on your Axis Bank Card 9012 at CAMPUS CAFE on 03-Nov-26. Avl Bal: Rs 2,100.';
    const res = parseBankSms(text, 'AXISBK');
    expect(res.isDebit).toBe(true);
    expect(res.amount).toBe(120);
    expect(res.category).toBe('Food');
  });

  it('parses Axis UPI payment for metro', () => {
    const text = 'Axis Bank: Rs 40 debited from A/C XX7812 on 02-Nov-26 to METRO TRANSIT. Ref: AX8910.';
    const res = parseBankSms(text, 'AXISBK');
    expect(res.isDebit).toBe(true);
    expect(res.amount).toBe(40);
    expect(res.category).toBe('Transport');
  });

  it('ignores Axis cashback credit', () => {
    const text = 'Yay! Cashback received: Rs 25.00 credited to your Axis Bank account for UPI transaction.';
    const res = parseBankSms(text, 'AXISBK');
    expect(res.isDebit).toBe(false);
  });

  it('ignores Axis promotional discount message', () => {
    const text = 'Special offer! Get 20% discount on flight tickets with Axis Credit Card. Hurry up.';
    const res = parseBankSms(text, 'AXISPR');
    expect(res.isDebit).toBe(false);
  });

  it('ignores Axis failed transaction notification', () => {
    const text = 'Payment of Rs 150 failed at Canteen due to technical network issue. Your account was not debited.';
    const res = parseBankSms(text, 'AXISBK');
    expect(res.isDebit).toBe(false);
  });

  // 26-30: Kotak Bank
  it('parses Kotak debit card spend at Xerox', () => {
    const text = 'Kotak Bank Alert: INR 120.00 spent on your Debit Card XX3312 at SHREE XEROX POINT on 01-Nov-26.';
    const res = parseBankSms(text, 'KOTAKB');
    expect(res.isDebit).toBe(true);
    expect(res.amount).toBe(120);
    expect(res.category).toBe('Books/Tuition');
  });

  it('parses Kotak UPI payment to pharmacy', () => {
    const text = 'Sent Rs 180.00 from Kotak A/C 9912 to APOLLO PHARMACY on 04-Nov-26 via UPI. Bal: Rs 3,400.';
    const res = parseBankSms(text, 'KOTAKB');
    expect(res.isDebit).toBe(true);
    expect(res.amount).toBe(180);
    expect(res.category).toBe('Health');
  });

  it('ignores Kotak salary credited SMS', () => {
    const text = 'INR 8,000.00 credited to your Kotak 811 account on 01-Nov-26. Total Balance: INR 9,200.00.';
    const res = parseBankSms(text, 'KOTAKB');
    expect(res.isDebit).toBe(false);
  });

  it('ignores Kotak verification code', () => {
    const text = 'Your Kotak Bank net banking verification code is 449102. Valid for 15 mins. Do not share.';
    const res = parseBankSms(text, 'KOTAKB');
    expect(res.isDebit).toBe(false);
  });

  it('ignores Kotak reversed payment', () => {
    const text = 'Transaction of INR 200 was reversed and refunded back to your Kotak account.';
    const res = parseBankSms(text, 'KOTAKB');
    expect(res.isDebit).toBe(false);
  });

  // 31-35: Punjab National Bank (PNB) & Canara Bank
  it('parses PNB debit message', () => {
    const text = 'Dear Customer, A/C XX4912 debited by Rs 250.00 on 03-Nov-26 by UPI/631902 at DHABA FOODS. Bal: Rs 1,450.';
    const res = parseBankSms(text, 'PNBSMS');
    expect(res.isDebit).toBe(true);
    expect(res.amount).toBe(250);
    expect(res.category).toBe('Food');
  });

  it('parses Canara Bank debit alert', () => {
    const text = 'Canara Bank: Rs. 85.00 debited from A/c ...3910 on 05-Nov-26 towards TEA AND SNACKS. Avl Bal: Rs. 1,120.00.';
    const res = parseBankSms(text, 'CANBNK');
    expect(res.isDebit).toBe(true);
    expect(res.amount).toBe(85);
    expect(res.category).toBe('Food');
  });

  it('ignores PNB credit alert', () => {
    const text = 'Rs 2,000 credited to PNB A/C XX4912 on 01-Nov-26 via IMPS. Avl Bal: Rs 3,500.';
    const res = parseBankSms(text, 'PNBSMS');
    expect(res.isDebit).toBe(false);
  });

  it('ignores Canara Bank OTP', () => {
    const text = 'Canara Bank: 918231 is your One Time Password for online shopping. Valid for 10 minutes.';
    const res = parseBankSms(text, 'CANBNK');
    expect(res.isDebit).toBe(false);
  });

  it('ignores PNB loan marketing SMS', () => {
    const text = 'Apply for PNB Education Loan at low interest rates. Visit branch or pnbindia.in.';
    const res = parseBankSms(text, 'PNBPR');
    expect(res.isDebit).toBe(false);
  });

  // 36-40: Paytm & PhonePe & Bank of Baroda
  it('parses Paytm Payments Bank debit to Swiggy', () => {
    const text = 'Paid Rs 220.00 from Paytm Payments Bank A/C XX9012 to SWIGGY on 03-Nov-26. UPI Ref: 891238910.';
    const res = parseBankSms(text, 'PAYTM');
    expect(res.isDebit).toBe(true);
    expect(res.amount).toBe(220);
    expect(res.category).toBe('Food');
  });

  it('parses PhonePe UPI debit to Blinkit', () => {
    const text = 'Paid Rs 340.00 to BLINKIT using PhonePe UPI linked to HDFC Bank XX1029 on 05-Nov-26. Txn ID: T26110512.';
    const res = parseBankSms(text, 'PHONEPE');
    expect(res.isDebit).toBe(true);
    expect(res.amount).toBe(340);
    expect(res.category).toBe('Shopping');
  });

  it('parses Bank of Baroda debit alert', () => {
    const text = 'Bank of Baroda: Rs 310.00 debited from A/C XX8810 on 04-Nov-26 at MOVIE PVR. Bal: Rs 2,900.';
    const res = parseBankSms(text, 'BOBSMS');
    expect(res.isDebit).toBe(true);
    expect(res.amount).toBe(310);
    expect(res.category).toBe('Entertainment');
  });

  it('ignores Paytm money received credit', () => {
    const text = 'Money received! Rs 150.00 added to your Paytm Wallet from Sunita.';
    const res = parseBankSms(text, 'PAYTM');
    expect(res.isDebit).toBe(false);
  });

  it('ignores PhonePe recharge promo', () => {
    const text = 'Get 100% cashback on your mobile recharge today with PhonePe! Terms apply.';
    const res = parseBankSms(text, 'PHONEPE');
    expect(res.isDebit).toBe(false);
  });

  // Hash uniqueness check
  it('generates consistent unique message hashes', () => {
    const h1 = generateMessageHash('Debited Rs 100 at Canteen', 'SBI', '2026-11-06');
    const h2 = generateMessageHash('Debited Rs 100 at Canteen', 'SBI', '2026-11-06');
    const h3 = generateMessageHash('Debited Rs 200 at Canteen', 'SBI', '2026-11-06');
    expect(h1).toBe(h2);
    expect(h1).not.toBe(h3);
  });
});
