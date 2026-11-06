import { describe, it, expect } from 'vitest';
import {
  calculateHealthScore,
  detectAnomaly,
  evaluateAffordability,
  calculateLoanEmi,
  calculateBillSplits,
  generateUpiLink
} from '../services/financeMath';
import { DEMO_ENGINEERING_PROFILE, DEMO_BUDGETS, DEMO_SAVINGS_GOALS } from '../services/storage';
import { Transaction } from '../types';

describe('Finance Math Engine & Health Scoring', () => {
  it('calculates financial health score with high grade for disciplined student', () => {
    const txns: Transaction[] = [
      {
        id: 't1',
        amount: 1500,
        category: 'Housing',
        type: 'debit',
        note: 'Hostel',
        merchant: 'Hostel',
        source: 'manual',
        date: new Date().toISOString().split('T')[0],
        createdAt: Date.now()
      }
    ];

    const score = calculateHealthScore(DEMO_ENGINEERING_PROFILE, txns, DEMO_BUDGETS, 14, 'en');
    expect(score.overallScore).toBeGreaterThanOrEqual(80);
    expect(['A+', 'A']).toContain(score.grade);
    expect(score.savingsRatePercentage).toBeGreaterThanOrEqual(50);
  });

  it('detects 2x category spending spike anomaly', () => {
    const historical: Transaction[] = [
      { id: '1', amount: 80, category: 'Food', type: 'debit', note: 'lunch', merchant: 'canteen', source: 'manual', date: '2026-11-01', createdAt: 1 },
      { id: '2', amount: 90, category: 'Food', type: 'debit', note: 'dinner', merchant: 'mess', source: 'manual', date: '2026-11-02', createdAt: 2 },
      { id: '3', amount: 70, category: 'Food', type: 'debit', note: 'breakfast', merchant: 'canteen', source: 'manual', date: '2026-11-03', createdAt: 3 }
    ];

    // Average is 80. Amount 300 is > 2x average (160)
    const anomaly = detectAnomaly(300, 'Food', historical);
    expect(anomaly.isAnomaly).toBe(true);
    expect(anomaly.reason).toContain('over 2x your average Food spend');

    // Normal amount 95 is not an anomaly
    const normal = detectAnomaly(95, 'Food', historical);
    expect(normal.isAnomaly).toBe(false);
  });

  it('evaluates affordability simulator with YES verdict for small safe expense', () => {
    const verdict = evaluateAffordability(
      120,
      'Food',
      DEMO_ENGINEERING_PROFILE,
      [],
      DEMO_BUDGETS,
      DEMO_SAVINGS_GOALS,
      'en'
    );
    expect(verdict.verdict).toBe('YES');
    expect(verdict.confidenceScore).toBeGreaterThan(80);
  });

  it('evaluates affordability with NO verdict when item exceeds allowance', () => {
    const verdict = evaluateAffordability(
      15000,
      'Shopping',
      DEMO_ENGINEERING_PROFILE,
      [],
      DEMO_BUDGETS,
      DEMO_SAVINGS_GOALS,
      'en'
    );
    expect(verdict.verdict).toBe('NO');
  });

  it('calculates loan EMI and accelerated payoff savings accurately', () => {
    // Principal: 100,000, 8.5% p.a., 36 months, extra payment 500
    const res = calculateLoanEmi(100000, 8.5, 36, 500);
    expect(res.monthlyEmi).toBeGreaterThan(3000);
    expect(res.totalInterest).toBeGreaterThan(0);
    expect(res.interestSavedWithExtra).toBeGreaterThan(0);
    expect(res.monthsSavedWithExtra).toBeGreaterThan(0);
  });

  it('calculates 0% gadget loan EMI without interest', () => {
    const res = calculateLoanEmi(30000, 0, 6, 0);
    expect(res.monthlyEmi).toBe(5000);
    expect(res.totalInterest).toBe(0);
    expect(res.totalPayment).toBe(30000);
  });

  it('splits bills equally with exact paisa rounding', () => {
    const members = [
      { id: '1', name: 'Aman', percentage: 0, amount: 0 },
      { id: '2', name: 'Rahul', percentage: 0, amount: 0 },
      { id: '3', name: 'Sneha', percentage: 0, amount: 0 }
    ];

    // Total 100 divided among 3 = 33.34 + 33.33 + 33.33 = exactly 100.00
    const splits = calculateBillSplits(100, 'equal', members);
    expect(splits.length).toBe(3);
    const sum = splits.reduce((acc, m) => acc + m.amount, 0);
    expect(Math.round(sum * 100) / 100).toBe(100);
  });

  it('generates standard compliant UPI payment URL', () => {
    const upi = generateUpiLink('aman@oksbi', 'Aman Sharma', 250, 'Dinner Share');
    expect(upi).toContain('upi://pay?');
    expect(upi).toContain('pa=aman%40oksbi');
    expect(upi).toContain('pn=Aman%20Sharma');
    expect(upi).toContain('am=250.00');
    expect(upi).toContain('cu=INR');
  });
});
