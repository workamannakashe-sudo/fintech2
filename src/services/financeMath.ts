import {
  BudgetEnvelope,
  ExpenseCategory,
  FinancialHealthScore,
  Language,
  SavingsGoal,
  StudentProfile,
  Transaction
} from '../types';

/**
 * 1. Financial Health Score (0–100, Grade A+ to D)
 * Pillars:
 * - Savings Rate: 0-25
 * - Budget Adherence: 0-25
 * - Anomaly & Risk: 0-25
 * - Logging Consistency: 0-25
 */
export function calculateHealthScore(
  profile: StudentProfile,
  transactions: Transaction[],
  budgets: BudgetEnvelope[],
  currentStreak: number,
  lang: Language = 'en'
): FinancialHealthScore {
  const allowance = profile.monthlyAllowance || 5000;
  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();

  // Filter current month debits
  const currentMonthDebits = transactions.filter((t) => {
    if (t.type !== 'debit') return false;
    const [y, m] = t.date.split('-').map(Number);
    return y === currentYear && m === currentMonth;
  });

  const totalSpent = currentMonthDebits.reduce((acc, t) => acc + t.amount, 0);

  // 1. Savings Rate Score (0-25)
  const savings = Math.max(0, allowance - totalSpent);
  const savingsRate = Math.min(100, Math.round((savings / allowance) * 100));
  let savingsScore = 0;
  if (savingsRate >= 30) savingsScore = 25;
  else if (savingsRate >= 20) savingsScore = 20;
  else if (savingsRate >= 10) savingsScore = 15;
  else if (savingsRate > 0) savingsScore = 10;
  else savingsScore = 5;

  // 2. Budget Adherence Score (0-25)
  let budgetScore = 25;
  if (budgets.length > 0) {
    let overBudgetCount = 0;
    budgets.forEach((b) => {
      const catSpent = currentMonthDebits
        .filter((t) => t.category === b.category)
        .reduce((sum, t) => sum + t.amount, 0);
      if (b.allocatedAmount > 0 && catSpent > b.allocatedAmount) {
        overBudgetCount++;
      }
    });
    if (overBudgetCount === 0) budgetScore = 25;
    else if (overBudgetCount === 1) budgetScore = 18;
    else if (overBudgetCount === 2) budgetScore = 12;
    else budgetScore = 6;
  } else {
    // If no explicit envelopes set, check if total spent < allowance
    budgetScore = totalSpent <= allowance ? 20 : 8;
  }

  // 3. Anomaly & Risk Score (0-25)
  const anomalyCount = currentMonthDebits.filter((t) => t.isAnomaly).length;
  let anomalyScore = 25;
  if (anomalyCount === 0) anomalyScore = 25;
  else if (anomalyCount === 1) anomalyScore = 18;
  else if (anomalyCount === 2) anomalyScore = 12;
  else anomalyScore = 6;

  // 4. Logging Consistency Score (0-25)
  let consistencyScore = 10;
  if (currentStreak >= 14) consistencyScore = 25;
  else if (currentStreak >= 7) consistencyScore = 20;
  else if (currentStreak >= 3) consistencyScore = 16;
  else if (currentStreak >= 1) consistencyScore = 12;

  const overall = Math.min(100, savingsScore + budgetScore + anomalyScore + consistencyScore);

  let grade: 'A+' | 'A' | 'B' | 'C' | 'D' = 'C';
  if (overall >= 90) grade = 'A+';
  else if (overall >= 80) grade = 'A';
  else if (overall >= 65) grade = 'B';
  else if (overall >= 50) grade = 'C';
  else grade = 'D';

  // Rule-based daily insight
  let insight = '';
  if (lang === 'hi') {
    if (grade === 'A+' || grade === 'A') {
      insight = `शानदार! आप ₹${savings.toLocaleString('en-IN')} की बचत दर पर हैं। अपनी पॉकेट मनी का अनुशासन बनाए रखें।`;
    } else if (grade === 'B') {
      insight = `अच्छा नियंत्रण है! कैंटीन और छोटे खर्चों पर ध्यान देकर आप 'A' ग्रेड हासिल कर सकते हैं।`;
    } else {
      insight = `सावधान! आपका खर्च तेज गति से हो रहा है। गैर-जरूरी खर्चों को सीमित करें।`;
    }
  } else if (lang === 'mr') {
    if (grade === 'A+' || grade === 'A') {
      insight = `उत्कृष्ट! तुमची ₹${savings.toLocaleString('en-IN')} ची बचत सुरू आहे. हीच आर्थिक शिस्त कायम ठेवा.`;
    } else if (grade === 'B') {
      insight = `चांगले नियंत्रण आहे! किरकोळ खर्च थोडे कमी केल्यास 'A' श्रेणी सहज मिळेल.`;
    } else {
      insight = `सावध राहा! खर्च वेगाने होत आहे. अनावश्यक खर्च काही दिवस टाळा.`;
    }
  } else {
    if (grade === 'A+' || grade === 'A') {
      insight = `Outstanding! You have a projected ₹${savings.toLocaleString('en-IN')} monthly cushion. Keep up the disciplined tracking!`;
    } else if (grade === 'B') {
      insight = `Solid stability! Trimming small canteen or impulse buys could easily push you to Grade A.`;
    } else {
      insight = `Caution: spending velocity is elevated. Enforce category caps to protect your emergency cash.`;
    }
  }

  return {
    overallScore: overall,
    grade,
    savingsRateScore: savingsScore,
    budgetAdherenceScore: budgetScore,
    anomalyRiskScore: anomalyScore,
    consistencyScore,
    savingsRatePercentage: savingsRate,
    insight
  };
}

/**
 * 2. Anomaly Spike Detection: checks if an amount is >= 2x the category average
 */
export function detectAnomaly(
  amount: number,
  category: ExpenseCategory,
  allTransactions: Transaction[]
): { isAnomaly: boolean; reason?: string } {
  const catTxns = allTransactions.filter((t) => t.category === category && t.type === 'debit');
  if (catTxns.length < 3) {
    return { isAnomaly: false };
  }

  const avg = catTxns.reduce((sum, t) => sum + t.amount, 0) / catTxns.length;
  if (amount >= avg * 2.0 && amount > 150) {
    return {
      isAnomaly: true,
      reason: `Amount (₹${amount}) is over 2x your average ${category} spend (₹${Math.round(avg)}).`
    };
  }

  return { isAnomaly: false };
}

/**
 * 3. "Can I Afford This?" Pre-Purchase Simulator
 */
export interface AffordVerdict {
  verdict: 'YES' | 'CAUTION' | 'NO';
  confidenceScore: number; // 0 - 100
  runwayImpactDays: number;
  savingsGoalDelayDays: number;
  remainingAfterPurchase: number;
  reason: string;
}

export function evaluateAffordability(
  itemPrice: number,
  category: ExpenseCategory,
  profile: StudentProfile,
  transactions: Transaction[],
  budgets: BudgetEnvelope[],
  goals: SavingsGoal[],
  lang: Language = 'en'
): AffordVerdict {
  const allowance = profile.monthlyAllowance || 5000;
  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();

  const currentMonthDebits = transactions.filter((t) => {
    if (t.type !== 'debit') return false;
    const [y, m] = t.date.split('-').map(Number);
    return y === currentYear && m === currentMonth;
  });

  const totalSpent = currentMonthDebits.reduce((acc, t) => acc + t.amount, 0);
  const currentBalance = Math.max(0, allowance - totalSpent);
  const remainingAfter = currentBalance - itemPrice;

  // Days remaining in month
  const today = new Date();
  const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
  const daysLeft = Math.max(1, lastDayOfMonth - today.getDate());

  const dailyBurn = totalSpent / Math.max(1, today.getDate());
  const newBalance = remainingAfter;
  const projectedRunwayDays = dailyBurn > 0 ? Math.floor(newBalance / dailyBurn) : daysLeft;
  const runwayDeficit = Math.max(0, daysLeft - projectedRunwayDays);

  // Goal impact
  const totalGoalTarget = goals.reduce((sum, g) => sum + (g.targetAmount - g.currentAmount), 0);
  const savingsGoalDelay = itemPrice > 500 && totalGoalTarget > 0 ? Math.round(itemPrice / 150) : 0;

  // Envelope check
  const envelope = budgets.find((b) => b.category === category);
  const catSpent = currentMonthDebits
    .filter((t) => t.category === category)
    .reduce((s, t) => s + t.amount, 0);
  const envelopeRemaining = envelope ? envelope.allocatedAmount - catSpent : currentBalance;

  let verdict: 'YES' | 'CAUTION' | 'NO' = 'YES';
  let confidence = 90;
  let reason = '';

  if (remainingAfter < 0 || itemPrice > currentBalance * 0.75) {
    verdict = 'NO';
    confidence = 94;
    reason =
      lang === 'hi'
        ? 'यह खरीदारी आपके वर्तमान बैलेंस से अधिक है। इसे खरीदने से आप इस महीने कर्ज में चले जाएंगे।'
        : lang === 'mr'
        ? 'ही खरेदी आपल्या शिल्लक रकमेपेक्षा जास्त आहे. यामुळे तुमचे मासिक बजेट तुटवड्यात जाईल.'
        : 'This purchase exceeds safe cash limits and will leave you in a deficit before month-end.';
  } else if (remainingAfter < currentBalance * 0.25 || (envelope && itemPrice > envelopeRemaining)) {
    verdict = 'CAUTION';
    confidence = 78;
    reason =
      lang === 'hi'
        ? 'इसे खरीदने के बाद आपके पास आपातकालीन खर्च के लिए बहुत कम राशि बचेगी। सोच-समझकर निर्णय लें।'
        : lang === 'mr'
        ? 'ही खरेदी केल्यावर महिन्यातील बाकी दिवसांसाठी अगदी कमी रक्कम उरेल. विचार करून निर्णय घ्या.'
        : 'This leaves an uncomfortably thin buffer for emergencies and breaches your category allocation.';
  } else {
    verdict = 'YES';
    confidence = 92;
    reason =
      lang === 'hi'
        ? 'बधाई! यह आपकी पॉकेट मनी सीमा के भीतर है। आप इसे सुरक्षित रूप से खरीद सकते हैं।'
        : lang === 'mr'
        ? 'छान! ही खरेदी तुमच्या मासिक भत्त्यामध्ये सहज बसत आहे. तुम्ही हे घेऊ शकता.'
        : 'Safe to purchase! You maintain a comfortable runway and positive savings margin.';
  }

  return {
    verdict,
    confidenceScore: confidence,
    runwayImpactDays: runwayDeficit,
    savingsGoalDelayDays: savingsGoalDelay,
    remainingAfterPurchase: remainingAfter,
    reason
  };
}

/**
 * 4. Loan & EMI Calculator (Simple, Compound, 0% EMI, and Accelerated Payoff)
 */
export interface EmiResult {
  monthlyEmi: number;
  totalInterest: number;
  totalPayment: number;
  interestSavedWithExtra: number;
  monthsSavedWithExtra: number;
  schedule: Array<{
    month: number;
    principalPaid: number;
    interestPaid: number;
    balance: number;
  }>;
}

export function calculateLoanEmi(
  principal: number,
  annualRate: number,
  tenureMonths: number,
  extraMonthlyPayment: number = 0
): EmiResult {
  if (principal <= 0 || tenureMonths <= 0) {
    return {
      monthlyEmi: 0,
      totalInterest: 0,
      totalPayment: 0,
      interestSavedWithExtra: 0,
      monthsSavedWithExtra: 0,
      schedule: []
    };
  }

  // 0% interest case
  if (annualRate <= 0) {
    const monthlyEmi = Math.round((principal / tenureMonths) * 100) / 100;
    return {
      monthlyEmi,
      totalInterest: 0,
      totalPayment: principal,
      interestSavedWithExtra: 0,
      monthsSavedWithExtra: 0,
      schedule: Array.from({ length: tenureMonths }, (_, i) => ({
        month: i + 1,
        principalPaid: monthlyEmi,
        interestPaid: 0,
        balance: Math.max(0, principal - monthlyEmi * (i + 1))
      }))
    };
  }

  const monthlyRate = annualRate / 12 / 100;
  // Standard EMI Formula: [P * r * (1 + r)^n] / [(1 + r)^n - 1]
  const factor = Math.pow(1 + monthlyRate, tenureMonths);
  const monthlyEmi = Math.round(((principal * monthlyRate * factor) / (factor - 1)) * 100) / 100;

  // Baseline schedule
  let balance = principal;
  let totalInterest = 0;
  const schedule: EmiResult['schedule'] = [];

  for (let m = 1; m <= tenureMonths; m++) {
    const interest = Math.round(balance * monthlyRate * 100) / 100;
    const principalPaid = Math.min(balance, Math.round((monthlyEmi - interest) * 100) / 100);
    balance = Math.max(0, Math.round((balance - principalPaid) * 100) / 100);
    totalInterest += interest;

    if (m <= 60) {
      schedule.push({
        month: m,
        principalPaid,
        interestPaid: interest,
        balance
      });
    }
  }

  // Accelerated Payoff Simulation
  let interestSavedWithExtra = 0;
  let monthsSavedWithExtra = 0;

  if (extraMonthlyPayment > 0) {
    let accBalance = principal;
    let accInterest = 0;
    let accMonths = 0;
    const totalMonthly = monthlyEmi + extraMonthlyPayment;

    while (accBalance > 0 && accMonths < tenureMonths * 2) {
      accMonths++;
      const interest = accBalance * monthlyRate;
      accInterest += interest;
      const principalPaid = Math.min(accBalance, totalMonthly - interest);
      accBalance -= principalPaid;
    }

    interestSavedWithExtra = Math.max(0, Math.round(totalInterest - accInterest));
    monthsSavedWithExtra = Math.max(0, tenureMonths - accMonths);
  }

  return {
    monthlyEmi,
    totalInterest: Math.round(totalInterest),
    totalPayment: Math.round(principal + totalInterest),
    interestSavedWithExtra,
    monthsSavedWithExtra,
    schedule
  };
}

/**
 * 5. Split Bill Calculation with exact paisa rounding
 */
export function calculateBillSplits(
  totalAmount: number,
  splitType: 'equal' | 'custom',
  members: Array<{ id: string; name: string; percentage: number; amount: number }>
): Array<{ id: string; name: string; percentage: number; amount: number }> {
  if (members.length === 0 || totalAmount <= 0) return [];

  if (splitType === 'equal') {
    const count = members.length;
    const baseShare = Math.floor((totalAmount / count) * 100) / 100;
    // Remainder in paise distributed to the first few
    const totalAssigned = Math.round(baseShare * count * 100) / 100;
    let remainder = Math.round((totalAmount - totalAssigned) * 100) / 100;

    return members.map((m, idx) => {
      let share = baseShare;
      if (remainder > 0 && idx === 0) {
        share = Math.round((share + remainder) * 100) / 100;
        remainder = 0;
      }
      return {
        ...m,
        percentage: Math.round((100 / count) * 10) / 10,
        amount: share
      };
    });
  } else {
    // Custom percentage split
    return members.map((m) => {
      const share = Math.round(((totalAmount * (m.percentage || 0)) / 100) * 100) / 100;
      return {
        ...m,
        amount: share
      };
    });
  }
}

/**
 * 6. Generate UPI Payment Deep Link
 */
export function generateUpiLink(
  vpa: string,
  payeeName: string,
  amount: number,
  note: string = 'BudgetMitra Bill Split'
): string {
  const cleanVpa = encodeURIComponent(vpa.trim());
  const cleanName = encodeURIComponent(payeeName.trim());
  const cleanNote = encodeURIComponent(note.trim());
  const cleanAmount = amount.toFixed(2);

  return `upi://pay?pa=${cleanVpa}&pn=${cleanName}&am=${cleanAmount}&cu=INR&tn=${cleanNote}`;
}
