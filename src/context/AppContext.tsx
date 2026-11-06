import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import confetti from 'canvas-confetti';
import {
  BudgetEnvelope,
  FinancialHealthScore,
  GamificationState,
  Language,
  SavingsGoal,
  StudentLoan,
  StudentProfile,
  Transaction
} from '../types';
import {
  StorageService,
  DEMO_ENGINEERING_PROFILE,
  DEMO_TRANSACTIONS,
  DEMO_BUDGETS,
  DEMO_SAVINGS_GOALS,
  DEMO_LOANS,
  INITIAL_GAMIFICATION
} from '../services/storage';
import { calculateHealthScore, detectAnomaly } from '../services/financeMath';
import { parseBankSms } from '../services/smsParser';
import { NativeBridgeService } from '../services/nativeBridge';

export type TabType =
  | 'dashboard'
  | 'expenses'
  | 'sms'
  | 'afford'
  | 'split'
  | 'budget'
  | 'loans'
  | 'schemes'
  | 'permissions'
  | 'settings';

interface AppContextType {
  profile: StudentProfile;
  setProfile: (p: StudentProfile) => void;
  updateProfile: (p: Partial<StudentProfile>) => void;
  language: Language;
  setLanguage: (l: Language) => void;
  theme: 'light' | 'dark';
  setTheme: (t: 'light' | 'dark') => void;
  toggleTheme: () => void;
  activeTab: TabType;
  setActiveTab: (t: TabType) => void;
  transactions: Transaction[];
  addTransaction: (t: Omit<Transaction, 'id' | 'createdAt'>) => Transaction;
  editTransaction: (t: Transaction) => void;
  deleteTransaction: (id: string) => void;
  undoTransaction: (id: string) => void;
  budgets: BudgetEnvelope[];
  setBudgets: (b: BudgetEnvelope[]) => void;
  updateBudget: (category: BudgetEnvelope['category'], amount: number) => void;
  goals: SavingsGoal[];
  addGoal: (g: Omit<SavingsGoal, 'id'>) => void;
  updateGoalProgress: (id: string, amountToAdd: number) => void;
  loans: StudentLoan[];
  addLoan: (l: Omit<StudentLoan, 'id'>) => void;
  updateLoan: (l: StudentLoan) => void;
  gamification: GamificationState;
  addXp: (pts: number, reason?: string) => void;
  financialHealth: FinancialHealthScore;
  newSmsCount: number;
  scanSmsNow: (daysBack?: number) => Promise<number>;
  dismissSmsBanner: () => void;
  isLocked: boolean;
  unlockApp: () => void;
  lockApp: () => void;
  resetToDemo: () => void;
  resetToGuest: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [profile, setProfileState] = useState<StudentProfile>(DEMO_ENGINEERING_PROFILE);
  const [transactions, setTransactionsState] = useState<Transaction[]>([]);
  const [budgets, setBudgetsState] = useState<BudgetEnvelope[]>([]);
  const [goals, setGoalsState] = useState<SavingsGoal[]>([]);
  const [loans, setLoansState] = useState<StudentLoan[]>([]);
  const [gamification, setGamificationState] = useState<GamificationState>(INITIAL_GAMIFICATION);
  const [language, setLanguageState] = useState<Language>('en');
  const [theme, setThemeState] = useState<'light' | 'dark'>('light');
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [newSmsCount, setNewSmsCount] = useState<number>(0);
  const [isLocked, setIsLocked] = useState<boolean>(false);

  // Initialize from storage on mount
  useEffect(() => {
    const initData = async () => {
      await StorageService.init();
      const p = StorageService.getProfile();
      setProfileState(p);
      setLanguageState(p.language || 'en');
      setTransactionsState(StorageService.getTransactions());
      setBudgetsState(StorageService.getBudgets());
      setGoalsState(StorageService.getSavingsGoals());
      setLoansState(StorageService.getLoans());
      setGamificationState(StorageService.getGamification());

      // Check PIN lock
      if (p.isPinEnabled && p.pinHash) {
        setIsLocked(true);
      }

      // Check system theme preference
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        setThemeState('dark');
        document.documentElement.classList.add('dark');
      }

      // Automatic background SMS catch-up scan on app launch (Confirmed in Q2)
      runBackgroundSmsCheck();
    };

    initData();
  }, []);

  // Update theme class on <html>
  const setTheme = (t: 'light' | 'dark') => {
    setThemeState(t);
    if (t === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  const setLanguage = (l: Language) => {
    setLanguageState(l);
    const updated = { ...profile, language: l };
    setProfileState(updated);
    StorageService.saveProfile(updated);
  };

  const setProfile = (p: StudentProfile) => {
    setProfileState(p);
    StorageService.saveProfile(p);
  };

  const updateProfile = (p: Partial<StudentProfile>) => {
    const updated = { ...profile, ...p };
    setProfileState(updated);
    StorageService.saveProfile(updated);
  };

  // Gamification & XP
  const addXp = (pts: number, _reason?: string) => {
    const current = gamification;
    const newXp = current.xp + pts;
    let newLevel = current.level;
    if (newXp >= 1500) newLevel = 'Finance Guru';
    else if (newXp >= 800) newLevel = 'Budget Master';
    else if (newXp >= 300) newLevel = 'Finance Apprentice';
    else newLevel = 'Budget Rookie';

    const today = new Date().toISOString().split('T')[0];
    const prevCount = current.activityMap[today] || 0;
    const updatedMap = { ...current.activityMap, [today]: prevCount + 1 };

    // Update streak if first log today
    let streak = current.currentStreak;
    if (current.lastActiveDate !== today) {
      const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
      if (current.lastActiveDate === yesterday) {
        streak += 1;
      } else {
        streak = 1;
      }
    }

    const updatedState: GamificationState = {
      ...current,
      xp: newXp,
      level: newLevel,
      currentStreak: streak,
      longestStreak: Math.max(streak, current.longestStreak),
      lastActiveDate: today,
      activityMap: updatedMap
    };

    setGamificationState(updatedState);
    StorageService.saveGamification(updatedState);

    // Trigger celebratory confetti if leveling up or achieving streak milestone
    if (newLevel !== current.level || streak === 7 || streak === 30) {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.7 }
      });
    }
  };

  // Transactions management
  const addTransaction = (t: Omit<Transaction, 'id' | 'createdAt'>): Transaction => {
    const anomalyCheck = detectAnomaly(t.amount, t.category, transactions);
    const newTx: Transaction = {
      ...t,
      id: `txn_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      createdAt: Date.now(),
      isAnomaly: anomalyCheck.isAnomaly,
      anomalyReason: anomalyCheck.reason
    };

    const updated = [newTx, ...transactions];
    setTransactionsState(updated);
    StorageService.saveTransactions(updated);
    addXp(15, 'Logged expense');
    return newTx;
  };

  const editTransaction = (t: Transaction) => {
    const anomalyCheck = detectAnomaly(t.amount, t.category, transactions);
    const updated = transactions.map((item) =>
      item.id === t.id
        ? { ...t, isAnomaly: anomalyCheck.isAnomaly, anomalyReason: anomalyCheck.reason }
        : item
    );
    setTransactionsState(updated);
    StorageService.saveTransactions(updated);
  };

  const deleteTransaction = (id: string) => {
    const updated = transactions.filter((t) => t.id !== id);
    setTransactionsState(updated);
    StorageService.saveTransactions(updated);
  };

  const undoTransaction = (id: string) => {
    deleteTransaction(id);
  };

  // Budgets
  const setBudgets = (b: BudgetEnvelope[]) => {
    setBudgetsState(b);
    StorageService.saveBudgets(b);
  };

  const updateBudget = (category: BudgetEnvelope['category'], amount: number) => {
    const existing = budgets.find((b) => b.category === category);
    let updated: BudgetEnvelope[];
    if (existing) {
      updated = budgets.map((b) => (b.category === category ? { ...b, allocatedAmount: amount } : b));
    } else {
      updated = [
        ...budgets,
        {
          id: `b_${Date.now()}`,
          category,
          allocatedAmount: amount,
          month: new Date().getMonth() + 1,
          year: new Date().getFullYear()
        }
      ];
    }
    setBudgetsState(updated);
    StorageService.saveBudgets(updated);
  };

  // Goals
  const addGoal = (g: Omit<SavingsGoal, 'id'>) => {
    const newGoal: SavingsGoal = {
      ...g,
      id: `goal_${Date.now()}`
    };
    const updated = [...goals, newGoal];
    setGoalsState(updated);
    StorageService.saveSavingsGoals(updated);
    addXp(30, 'Created savings goal');
  };

  const updateGoalProgress = (id: string, amountToAdd: number) => {
    const updated = goals.map((g) => {
      if (g.id !== id) return g;
      const newAmt = Math.min(g.targetAmount, g.currentAmount + amountToAdd);
      if (newAmt >= g.targetAmount && g.currentAmount < g.targetAmount) {
        confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
        addXp(100, 'Goal achieved!');
      }
      return { ...g, currentAmount: newAmt };
    });
    setGoalsState(updated);
    StorageService.saveSavingsGoals(updated);
  };

  // Loans
  const addLoan = (l: Omit<StudentLoan, 'id'>) => {
    const newLoan: StudentLoan = {
      ...l,
      id: `loan_${Date.now()}`
    };
    const updated = [...loans, newLoan];
    setLoansState(updated);
    StorageService.saveLoans(updated);
  };

  const updateLoan = (l: StudentLoan) => {
    const updated = loans.map((item) => (item.id === l.id ? l : item));
    setLoansState(updated);
    StorageService.saveLoans(updated);
  };

  // Automatic Background SMS Scan
  const runBackgroundSmsCheck = async () => {
    try {
      const messages = await NativeBridgeService.fetchDeviceSms(7);
      const importedRecords = StorageService.getImportedSmsRecords();
      const existingHashes = new Set(importedRecords.map((r) => r.messageHash));

      let freshCount = 0;
      messages.forEach((m) => {
        const parsed = parseBankSms(m.body, m.address, m.date);
        if (parsed.isDebit && !parsed.isIgnored && !existingHashes.has(parsed.messageHash)) {
          freshCount++;
        }
      });

      if (freshCount > 0) {
        setNewSmsCount(freshCount);
      }
    } catch {
      // safe fallback
    }
  };

  // Manual SMS Scan
  const scanSmsNow = async (daysBack: number = 30): Promise<number> => {
    const messages = await NativeBridgeService.fetchDeviceSms(daysBack);
    const importedRecords = StorageService.getImportedSmsRecords();
    const existingHashes = new Set(importedRecords.map((r) => r.messageHash));

    const newTxns: Transaction[] = [];
    const newRecords = [...importedRecords];

    messages.forEach((m) => {
      const parsed = parseBankSms(m.body, m.address, m.date);
      if (parsed.isDebit && !parsed.isIgnored && !existingHashes.has(parsed.messageHash)) {
        existingHashes.add(parsed.messageHash);

        const newTx: Transaction = {
          id: `sms_tx_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          amount: parsed.amount,
          category: parsed.category,
          type: 'debit',
          note: `Auto-detected via ${parsed.bankName} SMS`,
          merchant: parsed.merchant,
          source: 'sms',
          date: parsed.date,
          refId: parsed.refNumber,
          createdAt: Date.now()
        };

        newTxns.push(newTx);
        newRecords.push({
          id: `rec_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          messageHash: parsed.messageHash,
          sender: m.address,
          amount: parsed.amount,
          merchant: parsed.merchant,
          rawText: m.body,
          dateReceived: parsed.date,
          status: 'imported'
        });
      }
    });

    if (newTxns.length > 0) {
      const updatedTxns = [...newTxns, ...transactions];
      setTransactionsState(updatedTxns);
      StorageService.saveTransactions(updatedTxns);
      StorageService.saveImportedSmsRecords(newRecords);
      addXp(newTxns.length * 10, 'Imported SMS debits');
    }

    setNewSmsCount(0);
    return newTxns.length;
  };

  const dismissSmsBanner = () => setNewSmsCount(0);

  // App Lock PIN Handlers
  const unlockApp = () => setIsLocked(false);
  const lockApp = () => {
    if (profile.isPinEnabled) setIsLocked(true);
  };

  // Reset to Demo or Guest
  const resetToDemo = () => {
    StorageService.saveProfile(DEMO_ENGINEERING_PROFILE);
    StorageService.saveTransactions(DEMO_TRANSACTIONS);
    StorageService.saveBudgets(DEMO_BUDGETS);
    StorageService.saveSavingsGoals(DEMO_SAVINGS_GOALS);
    StorageService.saveLoans(DEMO_LOANS);
    StorageService.saveGamification(INITIAL_GAMIFICATION);

    setProfileState(DEMO_ENGINEERING_PROFILE);
    setTransactionsState(DEMO_TRANSACTIONS);
    setBudgetsState(DEMO_BUDGETS);
    setGoalsState(DEMO_SAVINGS_GOALS);
    setLoansState(DEMO_LOANS);
    setGamificationState(INITIAL_GAMIFICATION);
    setNewSmsCount(0);
    setIsLocked(false);
  };

  const resetToGuest = () => {
    StorageService.clearAllData();
    const p = StorageService.getProfile();
    setProfileState(p);
    setTransactionsState([]);
    setBudgetsState([]);
    setGoalsState([]);
    setLoansState([]);
    setGamificationState(StorageService.getGamification());
    setNewSmsCount(0);
    setIsLocked(false);
  };

  // Financial health score
  const financialHealth = useMemo(() => {
    return calculateHealthScore(profile, transactions, budgets, gamification.currentStreak, language);
  }, [profile, transactions, budgets, gamification.currentStreak, language]);

  return (
    <AppContext.Provider
      value={{
        profile,
        setProfile,
        updateProfile,
        language,
        setLanguage,
        theme,
        setTheme,
        toggleTheme,
        activeTab,
        setActiveTab,
        transactions,
        addTransaction,
        editTransaction,
        deleteTransaction,
        undoTransaction,
        budgets,
        setBudgets,
        updateBudget,
        goals,
        addGoal,
        updateGoalProgress,
        loans,
        addLoan,
        updateLoan,
        gamification,
        addXp,
        financialHealth,
        newSmsCount,
        scanSmsNow,
        dismissSmsBanner,
        isLocked,
        unlockApp,
        lockApp,
        resetToDemo,
        resetToGuest
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};
