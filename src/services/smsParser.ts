import { ExpenseCategory, ParsedSmsResult } from '../types';

/**
 * Deterministic hash for deduplicating incoming SMS records
 */
export function generateMessageHash(rawText: string, sender: string, date: string): string {
  const clean = `${sender}_${date}_${rawText.replace(/\s+/g, ' ').trim().toLowerCase()}`;
  let hash = 0;
  for (let i = 0; i < clean.length; i++) {
    const char = clean.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0; // Convert to 32bit integer
  }
  return `sms_${Math.abs(hash).toString(16)}`;
}

/**
 * Categorize expense based on merchant name or SMS text keywords
 */
export function categorizeByKeywords(text: string, merchant: string = ''): ExpenseCategory {
  const combined = `${text} ${merchant}`.toLowerCase();

  // Housing, Rent & Utilities (Check first before generic canteen/mess)
  if (
    /hostel|rent|landlord|room|pg fee|paying guest|electricity|power|bescom|msedcl|tneb|water|gas|indane|hp gas|maintenance|society/i.test(
      combined
    )
  ) {
    return 'Housing';
  }

  // Food & Dining
  if (
    /swiggy|zomato|mess|canteen|canteen lunch|tea|chai|coffee|mcdonald|dominos|kfc|burger|pizza|restaurant|cafe|dhaba|bhojanalay|bakery|snack|eats|food|hotel/i.test(
      combined
    )
  ) {
    return 'Food';
  }

  // Transport & Travel
  if (
    /uber|ola|rapido|metro|irctc|auto|bus|petrol|fuel|diesel|indian oil|bpcl|hpcl|train|railway|redbus|transit|toll|fastag/i.test(
      combined
    )
  ) {
    return 'Transport';
  }

  // Books, College & Tuition
  if (
    /college|tuition|fee|fees|xerox|print|photocopy|stationery|book|books|library|exam|semester|form|udemy|coursera|unacademy|coaching|school|university/i.test(
      combined
    )
  ) {
    return 'Books/Tuition';
  }

  // Entertainment & Subscriptions
  if (
    /netflix|prime|hotstar|spotify|youtube|movie|pvr|inox|cinepolis|bookmyshow|gaming|steam|playstation|arcade|concert/i.test(
      combined
    )
  ) {
    return 'Entertainment';
  }

  // Shopping & Essentials
  if (
    /amazon|flipkart|myntra|ajio|meesho|tata cliq|zepto|blinkit|instamart|dmart|reliance|smart bazaar|zudio|pantaloons|h&m|zara|mall|store|supermarket/i.test(
      combined
    )
  ) {
    return 'Shopping';
  }

  // Health & Medicine
  if (
    /apollo|1mg|pharmeasy|hospital|clinic|doctor|pharmacy|chemist|medicine|meds|dentist|optical|lenskart|test lab|pathology/i.test(
      combined
    )
  ) {
    return 'Health';
  }

  return 'Misc';
}

/**
 * Bank and UPI Debit SMS Detection Engine
 */
export function parseBankSms(rawText: string, sender: string = '', timestamp: string = ''): ParsedSmsResult {
  const dateStr = timestamp || new Date().toISOString().split('T')[0];
  const messageHash = generateMessageHash(rawText, sender, dateStr);

  const result: ParsedSmsResult = {
    amount: 0,
    merchant: 'Merchant',
    bankName: 'Bank',
    refNumber: '',
    category: 'Misc',
    date: dateStr,
    rawText,
    messageHash,
    isDebit: false,
    isIgnored: true,
    ignoreReason: 'Not a debit transaction'
  };

  const text = rawText.trim();

  // 1. Filter out OTPs
  if (
    /otp|one time password|verification code|secret code|valid for|do not share|auth code/i.test(text) &&
    !/debited|paid|spent|transferred/i.test(text)
  ) {
    result.ignoreReason = 'OTP security code ignored';
    return result;
  }

  // 2. Filter out Credits & Deposits
  if (
    /credited|deposited|salary credited|refund received|cashback received|money received|received rs|inward remittance/i.test(
      text
    ) &&
    !/debited|paid|withdrawn/i.test(text)
  ) {
    result.ignoreReason = 'Credit / refund transaction ignored';
    return result;
  }

  // 3. Filter out Failed / Declined / Cancelled
  if (
    /failed|declined|unsuccessful|rejected|reversed|could not be processed|incomplete txn/i.test(text)
  ) {
    result.ignoreReason = 'Failed / reversed transaction ignored';
    return result;
  }

  // 4. Filter out Promos, Loan offers & Bill reminders
  if (
    /pre-approved|loan offer|apply for credit|special discount|hurry up|exclusive deal|bill generated|due date is|reminder to pay/i.test(
      text
    ) &&
    !/debited|paid rs|sent rs/i.test(text)
  ) {
    result.ignoreReason = 'Promotional or bill reminder ignored';
    return result;
  }

  // 5. Must contain debit keywords
  const hasDebitKeyword =
    /debited|debit|paid|spent|sent|transferred|withdrawn|purchase|txn of|charged/i.test(text);

  if (!hasDebitKeyword) {
    result.ignoreReason = 'No debit keyword detected';
    return result;
  }

  // Detect Bank Name from sender or text
  const senderLower = sender.toLowerCase();
  if (/sbi|sbin/i.test(senderLower) || /state bank of india|sbi/i.test(text)) {
    result.bankName = 'SBI';
  } else if (/hdfc/i.test(senderLower) || /hdfc bank|hdfc/i.test(text)) {
    result.bankName = 'HDFC Bank';
  } else if (/icici/i.test(senderLower) || /icici bank|icici/i.test(text)) {
    result.bankName = 'ICICI Bank';
  } else if (/axis/i.test(senderLower) || /axis bank|axis/i.test(text)) {
    result.bankName = 'Axis Bank';
  } else if (/kotak/i.test(senderLower) || /kotak bank|kotak/i.test(text)) {
    result.bankName = 'Kotak Bank';
  } else if (/pnb/i.test(senderLower) || /punjab national bank|pnb/i.test(text)) {
    result.bankName = 'PNB';
  } else if (/canara/i.test(senderLower) || /canara bank/i.test(text)) {
    result.bankName = 'Canara Bank';
  } else if (/bob|baroda/i.test(senderLower) || /bank of baroda/i.test(text)) {
    result.bankName = 'Bank of Baroda';
  } else if (/paytm/i.test(senderLower) || /paytm/i.test(text)) {
    result.bankName = 'Paytm';
  } else if (/phonepe/i.test(senderLower) || /phonepe/i.test(text)) {
    result.bankName = 'PhonePe';
  } else if (/upi/i.test(text) || /vpa/i.test(text)) {
    result.bankName = 'UPI Transfer';
  } else {
    result.bankName = sender || 'Bank Alert';
  }

  // Extract Amount: matches "Rs. 250", "Rs 250.00", "INR 1,200", "₹500"
  const amountRegex =
    /(?:rs\.?|inr|₹)\s*([\d,]+(?:\.\d{1,2})?)|(?:debited|paid|spent|sent)\s*(?:by|for|of)?\s*(?:rs\.?|inr|₹)?\s*([\d,]+(?:\.\d{1,2})?)/i;

  const amountMatch = text.match(amountRegex);
  if (amountMatch) {
    const rawVal = amountMatch[1] || amountMatch[2];
    if (rawVal) {
      const cleanVal = parseFloat(rawVal.replace(/,/g, ''));
      if (!isNaN(cleanVal) && cleanVal > 0) {
        result.amount = cleanVal;
      }
    }
  }

  if (result.amount <= 0) {
    result.ignoreReason = 'Could not parse positive debit amount';
    return result;
  }

  // Extract Merchant / Beneficiary / VPA
  // Patterns like: "to VPA xyz@upi", "at SWIGGY", "to Ramesh", "towards Canteen"
  const merchantRegexes = [
    /(?:to\s+vpa|to\s+upi|to)\s+([a-zA-Z0-9.\-_@]+(?:\s+[a-zA-Z0-9]+)?)/i,
    /(?:at|towards|info:)\s+([a-zA-Z0-9\s.\-_]{3,25})/i,
    /(?:paid\s+to)\s+([a-zA-Z0-9\s.\-_]{3,25})/i
  ];

  for (const reg of merchantRegexes) {
    const match = text.match(reg);
    if (match && match[1]) {
      let candidate = match[1].trim();
      // clean trailing punctuation or common filler words
      candidate = candidate.replace(/\s+(on|via|ref|bal|using|from|avl|upi).*$/i, '').trim();
      if (candidate.length >= 2 && !/^(the|a|an|your|account|acc|bank)$/i.test(candidate)) {
        result.merchant = candidate;
        break;
      }
    }
  }

  // Fallback merchant if none found
  if (result.merchant === 'Merchant' && result.bankName !== 'Bank') {
    result.merchant = `${result.bankName} Payment`;
  }

  // Extract Reference / UPI Ref / Txn ID
  const refMatch = text.match(/(?:ref\s*(?:no|num)?|upi\s*ref|txn\s*(?:id)?|rrn)[:\s]*([0-9a-zA-Z]{6,16})/i);
  if (refMatch && refMatch[1]) {
    result.refNumber = refMatch[1];
  }

  // Determine category from merchant and text
  result.category = categorizeByKeywords(text, result.merchant);
  result.isDebit = true;
  result.isIgnored = false;
  delete result.ignoreReason;

  return result;
}
