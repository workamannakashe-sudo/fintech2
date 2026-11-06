import React, { useState } from 'react';
import {
  Target,
  Sliders,
  AlertCircle,
  Plus,
  CheckCircle2
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { getTranslation } from '../i18n/translations';
import { ExpenseCategory } from '../types';

const CATEGORIES: ExpenseCategory[] = [
  'Housing',
  'Food',
  'Books/Tuition',
  'Transport',
  'Entertainment',
  'Shopping',
  'Health',
  'Misc'
];

export const BudgetPlannerScreen: React.FC = () => {
  const {
    profile,
    transactions,
    budgets,
    updateBudget,
    goals,
    addGoal,
    updateGoalProgress,
    language
  } = useApp();
  const t = getTranslation(language);

  // States
  const [burnCutPct, setBurnCutPct] = useState<number>(15);
  const [isGoalModalOpen, setIsGoalModalOpen] = useState<boolean>(false);
  const [newGoalTitle, setNewGoalTitle] = useState<string>('');
  const [newGoalTarget, setNewGoalTarget] = useState<string>('');
  const [newGoalDate, setNewGoalDate] = useState<string>('2026-12-31');

  // Month stats
  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();
  const today = new Date();
  const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
  const dayOfMonth = Math.max(1, today.getDate());
  const daysRemaining = Math.max(1, daysInMonth - dayOfMonth);

  const currentMonthDebits = transactions.filter((t) => {
    if (t.type !== 'debit') return false;
    const [y, m] = t.date.split('-').map(Number);
    return y === currentYear && m === currentMonth;
  });

  const totalSpent = currentMonthDebits.reduce((acc, t) => acc + t.amount, 0);
  const dailyBurn = totalSpent / dayOfMonth;
  const remainingCash = Math.max(0, profile.monthlyAllowance - totalSpent);

  // Projected exhaustion
  const projectedSurvivalDays = dailyBurn > 0 ? Math.floor(remainingCash / dailyBurn) : daysRemaining;
  const isDeficitExpected = projectedSurvivalDays < daysRemaining;

  // What-if burn reduction
  const reducedDailyBurn = dailyBurn * (1 - burnCutPct / 100);
  const extendedDays =
    reducedDailyBurn > 0 ? Math.floor(remainingCash / reducedDailyBurn) : daysRemaining;

  const handleAddGoalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const target = parseFloat(newGoalTarget);
    if (!newGoalTitle || isNaN(target) || target <= 0) return;

    addGoal({
      title: newGoalTitle,
      targetAmount: target,
      currentAmount: 0,
      targetDate: newGoalDate,
      icon: 'target'
    });

    setNewGoalTitle('');
    setNewGoalTarget('');
    setIsGoalModalOpen(false);
  };

  return (
    <div className="space-y-4 pb-24">
      {/* Title */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300">
            Envelope System
          </span>
        </div>
        <h2 className="font-heading font-extrabold text-2xl text-slate-800 dark:text-white">
          {t.tabs.budget} Planner
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Envelopes, velocity burn-rate & target savings goals
        </p>
      </div>

      {/* Spending Velocity & Exhaustion Card */}
      <div className="glass-card p-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-3">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Spending Velocity
            </span>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="font-heading font-extrabold text-2xl text-slate-800 dark:text-white">
                ₹{Math.round(dailyBurn)}
              </span>
              <span className="text-xs font-semibold text-slate-400">/ day</span>
            </div>
          </div>

          <div
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 ${
              isDeficitExpected
                ? 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300'
                : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
            }`}
          >
            {isDeficitExpected ? (
              <AlertCircle className="w-4 h-4 text-rose-500" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            )}
            <span>
              {isDeficitExpected
                ? `Exhaustion projected in ${projectedSurvivalDays} days`
                : `Runway covers all ${daysRemaining} days remaining`}
            </span>
          </div>
        </div>

        {/* What-If Burn Slider */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2">
          <div className="flex justify-between items-center text-xs font-bold">
            <span className="text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-teal-600" />
              What-If: Cut daily spend by {burnCutPct}%
            </span>
            <span className="text-teal-700 dark:text-teal-400">
              Survives {extendedDays} days (+{Math.max(0, extendedDays - projectedSurvivalDays)}d)
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="40"
            step="5"
            value={burnCutPct}
            onChange={(e) => setBurnCutPct(Number(e.target.value))}
            className="w-full accent-teal-600"
          />
        </div>
      </div>

      {/* Category Envelopes */}
      <div>
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5">
          Monthly Category Envelopes
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {CATEGORIES.map((cat) => {
            const envelope = budgets.find((b) => b.category === cat);
            const allocated = envelope?.allocatedAmount || 0;
            const spent = currentMonthDebits
              .filter((t) => t.category === cat)
              .reduce((s, t) => s + t.amount, 0);
            const pct = allocated > 0 ? Math.min(100, Math.round((spent / allocated) * 100)) : 0;
            const isOver = allocated > 0 && spent > allocated;

            return (
              <div key={cat} className="glass-card p-3.5">
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-xs font-bold text-slate-800 dark:text-white">
                    {cat}
                  </span>
                  <div className="flex items-center gap-1">
                    <span className="text-xs font-extrabold text-slate-800 dark:text-white">
                      ₹{spent.toLocaleString('en-IN')}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      / ₹{allocated.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>

                <div className="w-full bg-slate-100 dark:bg-slate-700 h-2 rounded-full overflow-hidden mb-2">
                  <div
                    className={`h-full rounded-full transition-all ${
                      isOver ? 'bg-rose-500' : pct > 80 ? 'bg-amber-500' : 'bg-teal-500'
                    }`}
                    style={{ width: `${pct}%` }}
                  />
                </div>

                {/* Edit Allocation inline */}
                <div className="flex items-center justify-between text-[11px]">
                  <span className={isOver ? 'text-rose-600 font-bold' : 'text-slate-400'}>
                    {isOver ? `Over by ₹${(spent - allocated).toLocaleString('en-IN')}` : `${pct}% used`}
                  </span>
                  <button
                    onClick={() => {
                      const newAmt = prompt(`Set monthly budget for ${cat} (₹):`, allocated.toString());
                      if (newAmt !== null) {
                        const parsed = parseFloat(newAmt);
                        if (!isNaN(parsed) && parsed >= 0) {
                          updateBudget(cat, parsed);
                        }
                      }
                    }}
                    className="text-teal-600 dark:text-teal-400 font-bold hover:underline"
                  >
                    Edit Cap
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Savings Goals Section */}
      <div>
        <div className="flex items-center justify-between mb-2.5">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Student Savings Goals ({goals.length})
          </h3>
          <button
            onClick={() => setIsGoalModalOpen(true)}
            className="flex items-center gap-1 text-xs font-bold text-teal-600 hover:underline"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Goal</span>
          </button>
        </div>

        <div className="space-y-2.5">
          {goals.map((g) => {
            const goalPct = Math.min(100, Math.round((g.currentAmount / g.targetAmount) * 100));
            return (
              <div key={g.id} className="glass-card p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded-xl bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-300 flex items-center justify-center font-bold">
                      <Target className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-heading font-bold text-sm text-slate-800 dark:text-white">
                        {g.title}
                      </h4>
                      <p className="text-[11px] text-slate-400">
                        Target by {g.targetDate}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="font-heading font-extrabold text-sm text-teal-700 dark:text-teal-400">
                      ₹{g.currentAmount.toLocaleString('en-IN')} / ₹{g.targetAmount.toLocaleString('en-IN')}
                    </p>
                    <p className="text-[10px] text-slate-400 font-bold">
                      {goalPct}% Achieved
                    </p>
                  </div>
                </div>

                <div className="w-full bg-slate-100 dark:bg-slate-700 h-2 rounded-full overflow-hidden mb-3">
                  <div
                    className="h-full bg-gradient-to-r from-teal-500 to-emerald-500 rounded-full transition-all"
                    style={{ width: `${goalPct}%` }}
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => {
                      const addAmt = prompt(`Add saved money to ${g.title} (₹):`, '200');
                      if (addAmt) {
                        const parsed = parseFloat(addAmt);
                        if (!isNaN(parsed) && parsed > 0) {
                          updateGoalProgress(g.id, parsed);
                        }
                      }
                    }}
                    className="px-3 py-1 rounded-lg bg-teal-50 dark:bg-teal-950 text-teal-700 dark:text-teal-300 text-xs font-bold hover:bg-teal-100"
                  >
                    + Add Saved Funds
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Add Goal Modal */}
      {isGoalModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800">
            <h3 className="font-heading font-bold text-lg text-slate-800 dark:text-white mb-3">
              Add New Savings Goal
            </h3>

            <form onSubmit={handleAddGoalSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                  Goal Title *
                </label>
                <input
                  type="text"
                  required
                  value={newGoalTitle}
                  onChange={(e) => setNewGoalTitle(e.target.value)}
                  placeholder="e.g. Semester Fee, New Laptop, Bike Fund"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                  Target Amount (₹) *
                </label>
                <input
                  type="number"
                  required
                  value={newGoalTarget}
                  onChange={(e) => setNewGoalTarget(e.target.value)}
                  placeholder="e.g. 5000"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-heading font-extrabold text-slate-800 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                  Target Date
                </label>
                <input
                  type="date"
                  value={newGoalDate}
                  onChange={(e) => setNewGoalDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-white"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsGoalModalOpen(false)}
                  className="flex-1 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold"
                >
                  {t.common.cancel}
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl bg-teal-600 text-white text-xs font-bold hover:bg-teal-700"
                >
                  Create Goal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
