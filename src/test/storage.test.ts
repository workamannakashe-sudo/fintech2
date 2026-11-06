import { describe, it, expect, beforeEach } from 'vitest';
import { StorageService, DEMO_ENGINEERING_PROFILE } from '../services/storage';

describe('Storage Layer - On-Device Migrations & Backup/Restore', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('initializes default student dataset on first run', async () => {
    await StorageService.init();
    const profile = StorageService.getProfile();
    expect(profile.name).toBe('Aman Sharma');
    expect(profile.monthlyAllowance).toBe(6500);

    const txns = StorageService.getTransactions();
    expect(txns.length).toBeGreaterThan(0);

    const budgets = StorageService.getBudgets();
    expect(budgets.length).toBeGreaterThan(0);
  });

  it('exports valid JSON backup archive', async () => {
    await StorageService.init();
    const jsonStr = StorageService.exportBackupJson();
    expect(jsonStr).toBeDefined();

    const parsed = JSON.parse(jsonStr);
    expect(parsed.appName).toBe('BudgetMitra');
    expect(parsed.version).toBe(1);
    expect(parsed.profile.name).toBe('Aman Sharma');
    expect(Array.isArray(parsed.transactions)).toBe(true);
  });

  it('restores backup accurately from valid JSON payload', async () => {
    await StorageService.init();
    const mockBackup = JSON.stringify({
      version: 1,
      appName: 'BudgetMitra',
      exportedAt: new Date().toISOString(),
      profile: {
        ...DEMO_ENGINEERING_PROFILE,
        name: 'Rohan Gupta',
        monthlyAllowance: 8000
      },
      transactions: [
        {
          id: 'test_tx_1',
          amount: 500,
          category: 'Books/Tuition',
          type: 'debit',
          note: 'Engineering Mathematics Vol 1',
          merchant: 'Campus Books',
          source: 'manual',
          date: '2026-11-06',
          createdAt: Date.now()
        }
      ],
      budgets: [],
      goals: [],
      loans: [],
      smsRecords: [],
      gamification: {
        currentStreak: 5,
        longestStreak: 5,
        lastActiveDate: '2026-11-06',
        xp: 250,
        level: 'Finance Apprentice',
        unlockedBadgeIds: [],
        activityMap: {}
      }
    });

    const res = StorageService.importBackupJson(mockBackup);
    expect(res.success).toBe(true);

    const restoredProfile = StorageService.getProfile();
    expect(restoredProfile.name).toBe('Rohan Gupta');
    expect(restoredProfile.monthlyAllowance).toBe(8000);

    const restoredTxns = StorageService.getTransactions();
    expect(restoredTxns.length).toBe(1);
    expect(restoredTxns[0].note).toBe('Engineering Mathematics Vol 1');
  });

  it('rejects foreign invalid JSON backup', () => {
    const invalidPayload = JSON.stringify({ app: 'SomeOtherApp', data: [1, 2, 3] });
    const res = StorageService.importBackupJson(invalidPayload);
    expect(res.success).toBe(false);
    expect(res.error).toContain('Not a recognized BudgetMitra archive');
  });

  it('clears all user records on delete all data action', async () => {
    await StorageService.init();
    StorageService.clearAllData();

    const profile = StorageService.getProfile();
    expect(profile.name).toBe('Guest Student');

    const txns = StorageService.getTransactions();
    expect(txns.length).toBe(0);
  });
});
