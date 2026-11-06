export type Language = 'en' | 'hi' | 'mr';

export type ExpenseCategory =
  | 'Housing'
  | 'Food'
  | 'Books/Tuition'
  | 'Entertainment'
  | 'Transport'
  | 'Shopping'
  | 'Health'
  | 'Misc';

export type TransactionType = 'debit' | 'credit';
export type TransactionSource = 'manual' | 'sms' | 'statement' | 'split';

export interface Transaction {
  id: string;
  amount: number;
  category: ExpenseCategory;
  type: TransactionType;
  note: string;
  merchant: string;
  source: TransactionSource;
  date: string; // ISO date YYYY-MM-DD
  time?: string; // HH:mm
  refId?: string; // UPI ref / Bank txn ID
  isAnomaly?: boolean;
  anomalyReason?: string;
  createdAt: number;
}

export interface StudentProfile {
  id: string;
  name: string;
  course: string;
  year: '1st Year' | '2nd Year' | '3rd Year' | '4th Year' | 'Postgraduate' | 'Other';
  state: string;
  incomeBracket: '< 1.5 Lakh' | '1.5 - 3 Lakh' | '3 - 6 Lakh' | '6 - 10 Lakh' | '> 10 Lakh';
  category: 'General' | 'OBC' | 'SC' | 'ST' | 'EWS';
  gender?: 'Male' | 'Female' | 'Other';
  monthlyAllowance: number;
  upiId: string;
  language: Language;
  pinHash?: string;
  isPinEnabled: boolean;
  isBiometricEnabled: boolean;
  onboardingCompleted: boolean;
  createdAt: number;
}

export interface BudgetEnvelope {
  id: string;
  category: ExpenseCategory;
  allocatedAmount: number;
  spentAmount?: number;
  month: number; // 1-12
  year: number;
}

export interface SavingsGoal {
  id: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: string;
  icon: string;
  category?: string;
}

export interface StudentLoan {
  id: string;
  title: string;
  principal: number;
  interestRate: number; // Annual %
  tenureMonths: number;
  loanType: 'education' | 'laptop_0pct' | 'personal' | 'friend_loan';
  extraMonthlyPayment: number;
  startDate: string;
  lenderName: string;
}

export interface ScholarshipScheme {
  id: string;
  title: string;
  provider: string;
  benefitAmount: string;
  deadline: string;
  categoryTags: string[];
  eligibleStates: string[]; // ['All'] or specific states
  eligibleCategories: string[]; // General, OBC, SC, ST, EWS, Girls
  incomeLimit: number; // max income in INR
  applyUrl: string;
  requiredDocuments: string[];
  description: string;
  matchScore?: 'Strong' | 'Likely' | 'Possible';
}

export interface ParsedSmsResult {
  amount: number;
  merchant: string;
  bankName: string;
  refNumber: string;
  category: ExpenseCategory;
  date: string;
  rawText: string;
  messageHash: string;
  isDebit: boolean;
  isIgnored: boolean;
  ignoreReason?: string;
}

export interface ImportedSmsRecord {
  id: string;
  messageHash: string;
  sender: string;
  amount: number;
  merchant: string;
  rawText: string;
  dateReceived: string;
  status: 'imported' | 'undone' | 'dismissed';
}

export interface SplitMember {
  id: string;
  name: string;
  phone?: string;
  upiId?: string;
  percentage: number;
  amount: number;
  paidStatus: 'unpaid' | 'paid';
}

export interface BillSplit {
  id: string;
  title: string;
  totalAmount: number;
  date: string;
  splitType: 'equal' | 'custom';
  members: SplitMember[];
  myShare: number;
  receiptImage?: string;
  createdAt: number;
}

export interface GamificationState {
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: string; // YYYY-MM-DD
  xp: number;
  level: 'Budget Rookie' | 'Finance Apprentice' | 'Budget Master' | 'Finance Guru';
  unlockedBadgeIds: string[];
  activityMap: Record<string, number>; // date YYYY-MM-DD -> count of transactions/activities
}

export interface Badge {
  id: string;
  title: string;
  description: string;
  icon: string;
  xpReward: number;
}

export interface FinancialHealthScore {
  overallScore: number; // 0 - 100
  grade: 'A+' | 'A' | 'B' | 'C' | 'D';
  savingsRateScore: number; // 0 - 25
  budgetAdherenceScore: number; // 0 - 25
  anomalyRiskScore: number; // 0 - 25
  consistencyScore: number; // 0 - 25
  savingsRatePercentage: number;
  insight: string;
}

export type PermissionType =
  | 'sms'
  | 'camera'
  | 'notifications'
  | 'photos';

export interface PermissionDetail {
  type: PermissionType;
  title: string;
  reasonEn: string;
  reasonHi: string;
  reasonMr: string;
  status: 'granted' | 'denied' | 'not_asked' | 'permanently_denied';
  isMandatory: boolean;
}
