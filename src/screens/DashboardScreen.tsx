import React from 'react';
import {
  TrendingDown,
  Wallet,
  Sparkles,
  FileDown,
  Coffee,
  UtensilsCrossed,
  Car,
  Printer,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Bell
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { getTranslation } from '../i18n/translations';
import { generateMonthlyHealthPdf } from '../services/pdfGenerator';
import { ExpenseCategory } from '../types';

export const DashboardScreen: React.FC = () => {
  const {
    profile,
    transactions,
    financialHealth,
    language,
    setActiveTab,
    addTransaction,
    newSmsCount
  } = useApp();
  const t = getTranslation(language);

  // Month calculations
  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const currentMonthName = monthNames[currentMonth - 1];

  const currentMonthDebits = transactions.filter((t) => {
    if (t.type !== 'debit') return false;
    const [y, m] = t.date.split('-').map(Number);
    return y === currentYear && m === currentMonth;
  });

  const totalSpent = currentMonthDebits.reduce((acc, t) => acc + t.amount, 0);
  const remaining = Math.max(0, profile.monthlyAllowance - totalSpent);
  const spentPct = Math.min(100, Math.round((totalSpent / (profile.monthlyAllowance || 1)) * 100));

  // Quick-Log Presets
  const handleQuickLog = (amount: number, category: ExpenseCategory, note: string, merchant: string) => {
    addTransaction({
      amount,
      category,
      type: 'debit',
      note,
      merchant,
      source: 'manual',
      date: new Date().toISOString().split('T')[0]
    });
  };

  const handleDownloadPdf = () => {
    generateMonthlyHealthPdf(
      profile,
      financialHealth,
      currentMonthDebits,
      currentMonthName,
      currentYear
    );
  };

  return (
    <div className="space-y-5 pb-24">
      {/* SMS Catch-up Notification Banner */}
      {newSmsCount > 0 && (
        <div className="bg-gradient-to-r from-teal-600 to-teal-800 text-white rounded-2xl p-4 shadow-lg flex items-center justify-between gap-3 animate-fadeIn">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
              <Bell className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <p className="font-heading font-bold text-sm">
                {newSmsCount} New Bank & UPI Debits Detected
              </p>
              <p className="text-xs text-teal-100">
                Parsed automatically on-device. Review and approve or undo in 1 tap.
              </p>
            </div>
          </div>
          <button
            onClick={() => setActiveTab('sms')}
            className="px-3.5 py-1.5 rounded-xl bg-white text-teal-800 text-xs font-bold hover:bg-teal-50 transition-all shrink-0"
          >
            Review Now
          </button>
        </div>
      )}

      {/* Hero Financial Health Card */}
      <div className="glass-card p-5 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold uppercase tracking-wider text-teal-700 dark:text-teal-400">
                {t.dashboard.healthScore}
              </span>
              <span className="px-2 py-0.5 rounded-md text-[11px] font-extrabold bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300">
                {t.dashboard.grade} {financialHealth.grade}
              </span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="font-heading font-extrabold text-4xl text-slate-800 dark:text-white">
                {financialHealth.overallScore}
              </span>
              <span className="text-sm font-semibold text-slate-400">/ 100</span>
            </div>
          </div>

          {/* Action to download Monthly PDF */}
          <button
            onClick={handleDownloadPdf}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-teal-600 text-white text-xs font-bold hover:bg-teal-700 active:scale-95 transition-all shadow-md shadow-teal-700/20"
          >
            <FileDown className="w-4 h-4" />
            <span>{t.dashboard.downloadReport}</span>
          </button>
        </div>

        {/* 4 Pillars Breakdown */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
          <div>
            <div className="flex justify-between text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
              <span>{t.dashboard.savingsRate}</span>
              <span className="text-teal-600 dark:text-teal-400">{financialHealth.savingsRateScore}/25</span>
            </div>
            <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-teal-500 rounded-full transition-all"
                style={{ width: `${(financialHealth.savingsRateScore / 25) * 100}%` }}
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
              <span>{t.dashboard.budgetAdherence}</span>
              <span className="text-teal-600 dark:text-teal-400">{financialHealth.budgetAdherenceScore}/25</span>
            </div>
            <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-teal-500 rounded-full transition-all"
                style={{ width: `${(financialHealth.budgetAdherenceScore / 25) * 100}%` }}
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
              <span>{t.dashboard.anomalyRisk}</span>
              <span className="text-teal-600 dark:text-teal-400">{financialHealth.anomalyRiskScore}/25</span>
            </div>
            <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-teal-500 rounded-full transition-all"
                style={{ width: `${(financialHealth.anomalyRiskScore / 25) * 100}%` }}
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
              <span>{t.dashboard.consistency}</span>
              <span className="text-teal-600 dark:text-teal-400">{financialHealth.consistencyScore}/25</span>
            </div>
            <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-teal-500 rounded-full transition-all"
                style={{ width: `${(financialHealth.consistencyScore / 25) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Daily Rule-based Insight */}
        <div className="mt-4 p-3 rounded-xl bg-teal-50/70 dark:bg-teal-950/40 border border-teal-100 dark:border-teal-900/60 flex items-start gap-2.5">
          <Sparkles className="w-4 h-4 text-teal-600 dark:text-teal-400 mt-0.5 shrink-0" />
          <p className="text-xs text-teal-900 dark:text-teal-200 font-medium leading-relaxed">
            {financialHealth.insight}
          </p>
        </div>
      </div>

      {/* Monthly Balance & Burn Rate */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="glass-card p-4">
          <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-xs font-semibold mb-1">
            <Wallet className="w-4 h-4 text-teal-600" />
            <span>{t.dashboard.monthlyAllowance}</span>
          </div>
          <p className="font-heading font-extrabold text-2xl text-slate-800 dark:text-white">
            ₹{profile.monthlyAllowance.toLocaleString('en-IN')}
          </p>
        </div>

        <div className="glass-card p-4">
          <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-xs font-semibold mb-1">
            <TrendingDown className="w-4 h-4 text-rose-500" />
            <span>{t.dashboard.totalSpent}</span>
          </div>
          <p className="font-heading font-extrabold text-2xl text-slate-800 dark:text-white">
            ₹{totalSpent.toLocaleString('en-IN')}
          </p>
          <div className="w-full bg-slate-100 dark:bg-slate-700 h-1.5 rounded-full mt-2 overflow-hidden">
            <div
              className={`h-full rounded-full ${spentPct > 80 ? 'bg-rose-500' : 'bg-teal-500'}`}
              style={{ width: `${spentPct}%` }}
            />
          </div>
        </div>

        <div className="glass-card p-4">
          <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-xs font-semibold mb-1">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span>{t.dashboard.remainingBalance}</span>
          </div>
          <p className="font-heading font-extrabold text-2xl text-emerald-600 dark:text-emerald-400">
            ₹{remaining.toLocaleString('en-IN')}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">
            {spentPct}% allowance consumed
          </p>
        </div>
      </div>

      {/* Quick-Log Presets */}
      <div>
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5">
          {t.dashboard.quickLogTitle}
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <button
            onClick={() => handleQuickLog(20, 'Food', 'Chai & biscuit at stall', 'Tea Stall')}
            className="glass-card p-3 flex items-center gap-3 text-left hover:border-teal-500 active:scale-95 transition-all"
          >
            <div className="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 flex items-center justify-center shrink-0">
              <Coffee className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-800 dark:text-white leading-tight">
                {t.dashboard.chaiSnacks}
              </p>
              <p className="text-[11px] text-slate-500 font-semibold">₹20</p>
            </div>
          </button>

          <button
            onClick={() => handleQuickLog(80, 'Food', 'Campus canteen thali lunch', 'College Canteen')}
            className="glass-card p-3 flex items-center gap-3 text-left hover:border-teal-500 active:scale-95 transition-all"
          >
            <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 flex items-center justify-center shrink-0">
              <UtensilsCrossed className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-800 dark:text-white leading-tight">
                {t.dashboard.canteenLunch}
              </p>
              <p className="text-[11px] text-slate-500 font-semibold">₹80</p>
            </div>
          </button>

          <button
            onClick={() => handleQuickLog(40, 'Transport', 'Auto / Metro ride to campus', 'Metro UPI')}
            className="glass-card p-3 flex items-center gap-3 text-left hover:border-teal-500 active:scale-95 transition-all"
          >
            <div className="w-9 h-9 rounded-xl bg-teal-100 dark:bg-teal-950/80 text-teal-700 dark:text-teal-300 flex items-center justify-center shrink-0">
              <Car className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-800 dark:text-white leading-tight">
                {t.dashboard.autoMetro}
              </p>
              <p className="text-[11px] text-slate-500 font-semibold">₹40</p>
            </div>
          </button>

          <button
            onClick={() => handleQuickLog(50, 'Books/Tuition', 'Lecture notes printout', 'Campus Xerox')}
            className="glass-card p-3 flex items-center gap-3 text-left hover:border-teal-500 active:scale-95 transition-all"
          >
            <div className="w-9 h-9 rounded-xl bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 flex items-center justify-center shrink-0">
              <Printer className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-800 dark:text-white leading-tight">
                {t.dashboard.xeroxPrint}
              </p>
              <p className="text-[11px] text-slate-500 font-semibold">₹50</p>
            </div>
          </button>
        </div>
      </div>

      {/* Recent Transactions List */}
      <div>
        <div className="flex items-center justify-between mb-2.5">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            {t.dashboard.recentTransactions}
          </h3>
          <button
            onClick={() => setActiveTab('expenses')}
            className="text-xs font-bold text-teal-600 dark:text-teal-400 flex items-center gap-1 hover:underline"
          >
            <span>{t.dashboard.viewAll}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {transactions.length === 0 ? (
          <div className="glass-card p-8 text-center">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {t.dashboard.noTransactions}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {transactions.slice(0, 5).map((txn) => (
              <div
                key={txn.id}
                className="glass-card p-3.5 flex items-center justify-between gap-3 hover:border-teal-500 transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-teal-700 dark:text-teal-400 text-sm shrink-0">
                    {txn.category.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-bold text-slate-800 dark:text-white leading-tight">
                        {txn.merchant || txn.note}
                      </p>
                      {txn.isAnomaly && (
                        <span className="flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300">
                          <AlertTriangle className="w-3 h-3" />
                          Spike
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      {txn.date} • {txn.category} • {txn.source.toUpperCase()}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <p
                    className={`font-heading font-extrabold text-sm ${
                      txn.type === 'debit' ? 'text-slate-800 dark:text-white' : 'text-emerald-600'
                    }`}
                  >
                    {txn.type === 'debit' ? '-' : '+'}₹{txn.amount.toLocaleString('en-IN')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
