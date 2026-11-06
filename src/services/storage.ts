import {
  BudgetEnvelope,
  GamificationState,
  ImportedSmsRecord,
  SavingsGoal,
  StudentLoan,
  StudentProfile,
  Transaction
} from '../types';

const STORAGE_KEYS = {
  PROFILE: 'budgetmitra_profile_v1',
  TRANSACTIONS: 'budgetmitra_transactions_v1',
  BUDGETS: 'budgetmitra_budgets_v1',
  SAVINGS_GOALS: 'budgetmitra_goals_v1',
  LOANS: 'budgetmitra_loans_v1',
  SMS_IMPORTED: 'budgetmitra_sms_imported_v1',
  GAMIFICATION: 'budgetmitra_gamification_v1',
  APP_SETTINGS: 'budgetmitra_settings_v1',
  SCHEMA_VERSION: 'budgetmitra_schema_version'
};

const CURRENT_SCHEMA_VERSION = 1;

/**
 * Pre-configured Demo Student Persona: Engineering Hosteller
 */
export const DEMO_ENGINEERING_PROFILE: StudentProfile = {
  id: 'student_demo_eng',
  name: 'Aman Sharma',
  course: 'B.Tech Computer Science',
  year: '3rd Year',
  state: 'Maharashtra',
  incomeBracket: '1.5 - 3 Lakh',
  category: 'OBC',
  gender: 'Male',
  monthlyAllowance: 6500,
  upiId: 'amansharma@oksbi',
  language: 'en',
  isPinEnabled: false,
  isBiometricEnabled: false,
  onboardingCompleted: true,
  createdAt: Date.now() - 30 * 86400000
};

export const DEMO_TRANSACTIONS: Transaction[] = [
  {
    id: 'txn_1',
    amount: 2800,
    category: 'Housing',
    type: 'debit',
    note: 'Hostel Mess Fee (Monthly Advance)',
    merchant: 'Hostel 3 Mess',
    source: 'manual',
    date: new Date(Date.now() - 5 * 86400000).toISOString().split('T')[0],
    isAnomaly: false,
    createdAt: Date.now() - 5 * 86400000
  },
  {
    id: 'txn_2',
    amount: 450,
    category: 'Books/Tuition',
    type: 'debit',
    note: 'Operating Systems & Algorithm Textbooks',
    merchant: 'Student Book Depot',
    source: 'manual',
    date: new Date(Date.now() - 4 * 86400000).toISOString().split('T')[0],
    isAnomaly: false,
    createdAt: Date.now() - 4 * 86400000
  },
  {
    id: 'txn_3',
    amount: 140,
    category: 'Food',
    type: 'debit',
    note: 'Evening Canteen Samosa & Chai with study group',
    merchant: 'Campus Canteen',
    source: 'sms',
    date: new Date(Date.now() - 3 * 86400000).toISOString().split('T')[0],
    isAnomaly: false,
    createdAt: Date.now() - 3 * 86400000
  },
  {
    id: 'txn_4',
    amount: 60,
    category: 'Transport',
    type: 'debit',
    note: 'Shared Auto from Railway Station to Campus',
    merchant: 'Auto Rickshaw UPI',
    source: 'sms',
    date: new Date(Date.now() - 2 * 86400000).toISOString().split('T')[0],
    isAnomaly: false,
    createdAt: Date.now() - 2 * 86400000
  },
  {
    id: 'txn_5',
    amount: 120,
    category: 'Books/Tuition',
    type: 'debit',
    note: 'Lab Manual Xerox & Spiral Binding',
    merchant: 'Shree Xerox Point',
    source: 'manual',
    date: new Date(Date.now() - 1 * 86400000).toISOString().split('T')[0],
    isAnomaly: false,
    createdAt: Date.now() - 1 * 86400000
  },
  {
    id: 'txn_6',
    amount: 220,
    category: 'Food',
    type: 'debit',
    note: 'Hostel late night Maggi & snacks',
    merchant: 'Night Canteen',
    source: 'sms',
    date: new Date().toISOString().split('T')[0],
    isAnomaly: false,
    createdAt: Date.now()
  }
];

export const DEMO_BUDGETS: BudgetEnvelope[] = [
  { id: 'b_1', category: 'Housing', allocatedAmount: 3000, month: new Date().getMonth() + 1, year: new Date().getFullYear() },
  { id: 'b_2', category: 'Food', allocatedAmount: 1800, month: new Date().getMonth() + 1, year: new Date().getFullYear() },
  { id: 'b_3', category: 'Books/Tuition', allocatedAmount: 800, month: new Date().getMonth() + 1, year: new Date().getFullYear() },
  { id: 'b_4', category: 'Transport', allocatedAmount: 500, month: new Date().getMonth() + 1, year: new Date().getFullYear() },
  { id: 'b_5', category: 'Entertainment', allocatedAmount: 300, month: new Date().getMonth() + 1, year: new Date().getFullYear() },
  { id: 'b_6', category: 'Misc', allocatedAmount: 300, month: new Date().getMonth() + 1, year: new Date().getFullYear() }
];

export const DEMO_SAVINGS_GOALS: SavingsGoal[] = [
  {
    id: 'goal_1',
    title: 'Laptop SSD & RAM Upgrade',
    targetAmount: 5000,
    currentAmount: 2600,
    targetDate: '2026-12-31',
    icon: 'laptop',
    category: 'Academic Equipment'
  },
  {
    id: 'goal_2',
    title: 'Emergency Medical & Travel Fund',
    targetAmount: 3000,
    currentAmount: 1500,
    targetDate: '2027-04-30',
    icon: 'shield',
    category: 'Emergency'
  }
];

export const DEMO_LOANS: StudentLoan[] = [
  {
    id: 'loan_sbi_edu',
    title: 'SBI Scholar Loan (B.Tech Tuition)',
    principal: 150000,
    interestRate: 8.65,
    tenureMonths: 60,
    loanType: 'education',
    extraMonthlyPayment: 500,
    startDate: '2025-08-01',
    lenderName: 'State Bank of India'
  }
];

export const INITIAL_GAMIFICATION: GamificationState = {
  currentStreak: 4,
  longestStreak: 8,
  lastActiveDate: new Date().toISOString().split('T')[0],
  xp: 420,
  level: 'Finance Apprentice',
  unlockedBadgeIds: ['first_log', 'streak_3', 'budget_created'],
  activityMap: {
    [new Date(Date.now() - 4 * 86400000).toISOString().split('T')[0]]: 2,
    [new Date(Date.now() - 3 * 86400000).toISOString().split('T')[0]]: 1,
    [new Date(Date.now() - 2 * 86400000).toISOString().split('T')[0]]: 3,
    [new Date(Date.now() - 1 * 86400000).toISOString().split('T')[0]]: 1,
    [new Date().toISOString().split('T')[0]]: 2
  }
};

/**
 * Storage Abstraction with fallback to robust local IndexedDB/localStorage
 */
class LocalStorageService {
  private isInitialized = false;

  public async init(): Promise<void> {
    if (this.isInitialized) return;

    // Check version migration
    const savedVer = localStorage.getItem(STORAGE_KEYS.SCHEMA_VERSION);
    if (!savedVer) {
      // First run: initialize with demo engineering student dataset
      this.saveProfile(DEMO_ENGINEERING_PROFILE);
      this.saveTransactions(DEMO_TRANSACTIONS);
      this.saveBudgets(DEMO_BUDGETS);
      this.saveSavingsGoals(DEMO_SAVINGS_GOALS);
      this.saveLoans(DEMO_LOANS);
      this.saveGamification(INITIAL_GAMIFICATION);
      localStorage.setItem(STORAGE_KEYS.SCHEMA_VERSION, CURRENT_SCHEMA_VERSION.toString());
    } else {
      const verNum = parseInt(savedVer, 10);
      if (verNum < CURRENT_SCHEMA_VERSION) {
        // Run migration hooks if future schema changes exist
        localStorage.setItem(STORAGE_KEYS.SCHEMA_VERSION, CURRENT_SCHEMA_VERSION.toString());
      }
    }

    this.isInitialized = true;
  }

  // Profile
  public getProfile(): StudentProfile {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PROFILE);
      return data ? JSON.parse(data) : DEMO_ENGINEERING_PROFILE;
    } catch {
      return DEMO_ENGINEERING_PROFILE;
    }
  }

  public saveProfile(profile: StudentProfile): void {
    localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
  }

  // Transactions
  public getTransactions(): Transaction[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  public saveTransactions(txns: Transaction[]): void {
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(txns));
  }

  // Budgets
  public getBudgets(): BudgetEnvelope[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.BUDGETS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  public saveBudgets(budgets: BudgetEnvelope[]): void {
    localStorage.setItem(STORAGE_KEYS.BUDGETS, JSON.stringify(budgets));
  }

  // Savings Goals
  public getSavingsGoals(): SavingsGoal[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SAVINGS_GOALS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  public saveSavingsGoals(goals: SavingsGoal[]): void {
    localStorage.setItem(STORAGE_KEYS.SAVINGS_GOALS, JSON.stringify(goals));
  }

  // Loans
  public getLoans(): StudentLoan[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.LOANS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  public saveLoans(loans: StudentLoan[]): void {
    localStorage.setItem(STORAGE_KEYS.LOANS, JSON.stringify(loans));
  }

  // SMS Imported Table (deduplication)
  public getImportedSmsRecords(): ImportedSmsRecord[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SMS_IMPORTED);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  public saveImportedSmsRecords(records: ImportedSmsRecord[]): void {
    localStorage.setItem(STORAGE_KEYS.SMS_IMPORTED, JSON.stringify(records));
  }

  // Gamification
  public getGamification(): GamificationState {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.GAMIFICATION);
      return data ? JSON.parse(data) : INITIAL_GAMIFICATION;
    } catch {
      return INITIAL_GAMIFICATION;
    }
  }

  public saveGamification(state: GamificationState): void {
    localStorage.setItem(STORAGE_KEYS.GAMIFICATION, JSON.stringify(state));
  }

  // Complete Backup & Restore Engine
  public exportBackupJson(): string {
    const payload = {
      version: CURRENT_SCHEMA_VERSION,
      appName: 'BudgetMitra',
      exportedAt: new Date().toISOString(),
      profile: this.getProfile(),
      transactions: this.getTransactions(),
      budgets: this.getBudgets(),
      goals: this.getSavingsGoals(),
      loans: this.getLoans(),
      smsRecords: this.getImportedSmsRecords(),
      gamification: this.getGamification()
    };
    return JSON.stringify(payload, null, 2);
  }

  public importBackupJson(jsonString: string): { success: boolean; error?: string } {
    try {
      const payload = JSON.parse(jsonString);
      if (!payload || !payload.appName || payload.appName !== 'BudgetMitra') {
        return { success: false, error: 'Invalid backup file: Not a recognized BudgetMitra archive.' };
      }

      if (payload.profile) this.saveProfile(payload.profile);
      if (Array.isArray(payload.transactions)) this.saveTransactions(payload.transactions);
      if (Array.isArray(payload.budgets)) this.saveBudgets(payload.budgets);
      if (Array.isArray(payload.goals)) this.saveSavingsGoals(payload.goals);
      if (Array.isArray(payload.loans)) this.saveLoans(payload.loans);
      if (Array.isArray(payload.smsRecords)) this.saveImportedSmsRecords(payload.smsRecords);
      if (payload.gamification) this.saveGamification(payload.gamification);

      return { success: true };
    } catch (err: unknown) {
      return { success: false, error: err instanceof Error ? err.message : 'JSON parse failure' };
    }
  }

  public clearAllData(): void {
    Object.values(STORAGE_KEYS).forEach((k) => localStorage.removeItem(k));
    // Re-init with empty guest state
    const guestProfile: StudentProfile = {
      ...DEMO_ENGINEERING_PROFILE,
      id: 'guest_user',
      name: 'Guest Student',
      monthlyAllowance: 5000,
      onboardingCompleted: true
    };
    this.saveProfile(guestProfile);
    this.saveTransactions([]);
    this.saveBudgets([]);
    this.saveSavingsGoals([]);
    this.saveLoans([]);
    this.saveImportedSmsRecords([]);
    this.saveGamification({
      currentStreak: 1,
      longestStreak: 1,
      lastActiveDate: new Date().toISOString().split('T')[0],
      xp: 50,
      level: 'Budget Rookie',
      unlockedBadgeIds: ['first_log'],
      activityMap: {}
    });
  }
}

export const StorageService = new LocalStorageService();
