import React, { useState } from 'react';
import {
  CheckCircle,
  AlertTriangle,
  XCircle
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { getTranslation } from '../i18n/translations';
import { evaluateAffordability, AffordVerdict } from '../services/financeMath';
import { ExpenseCategory } from '../types';

const CATEGORIES: ExpenseCategory[] = [
  'Food',
  'Entertainment',
  'Shopping',
  'Books/Tuition',
  'Transport',
  'Health',
  'Housing',
  'Misc'
];

export const AffordSimulatorScreen: React.FC = () => {
  const { profile, transactions, budgets, goals, language } = useApp();
  const t = getTranslation(language);

  const [itemName, setItemName] = useState<string>('Wireless Earbuds');
  const [itemPrice, setItemPrice] = useState<string>('1200');
  const [category, setCategory] = useState<ExpenseCategory>('Shopping');
  const [verdictResult, setVerdictResult] = useState<AffordVerdict | null>(() =>
    evaluateAffordability(1200, 'Shopping', profile, transactions, budgets, goals, language)
  );

  const handleEvaluate = (e: React.FormEvent) => {
    e.preventDefault();
    const price = parseFloat(itemPrice);
    if (isNaN(price) || price <= 0) {
      alert('Please enter a valid price.');
      return;
    }

    const result = evaluateAffordability(
      price,
      category,
      profile,
      transactions,
      budgets,
      goals,
      language
    );
    setVerdictResult(result);
  };

  return (
    <div className="space-y-4 pb-24">
      {/* Title */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300">
            Decision Intelligence
          </span>
        </div>
        <h2 className="font-heading font-extrabold text-2xl text-slate-800 dark:text-white">
          {t.afford.title}
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          {t.afford.headline}
        </p>
      </div>

      {/* Input Simulator Card */}
      <div className="glass-card p-5">
        <form onSubmit={handleEvaluate} className="space-y-3.5">
          <div>
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
              {t.afford.itemName}
            </label>
            <input
              type="text"
              required
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
              placeholder="e.g. Mechanical Keyboard, Concert Ticket, Weekend Trip"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                {t.afford.itemPrice}
              </label>
              <input
                type="number"
                step="1"
                required
                value={itemPrice}
                onChange={(e) => setItemPrice(e.target.value)}
                placeholder="e.g. 800"
                className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-extrabold font-heading text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                {t.afford.category}
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 rounded-xl bg-teal-600 text-white text-xs font-bold hover:bg-teal-700 active:scale-95 transition-all shadow-md shadow-teal-700/20"
          >
            {t.afford.checkVerdict}
          </button>
        </form>
      </div>

      {/* Verdict Result Display */}
      {verdictResult && (
        <div
          className={`glass-card p-6 border-2 transition-all animate-fadeIn ${
            verdictResult.verdict === 'YES'
              ? 'border-emerald-500 bg-emerald-50/20 dark:bg-emerald-950/20'
              : verdictResult.verdict === 'CAUTION'
              ? 'border-amber-500 bg-amber-50/20 dark:bg-amber-950/20'
              : 'border-rose-500 bg-rose-50/20 dark:bg-rose-950/20'
          }`}
        >
          <div className="flex items-center gap-3 mb-3">
            {verdictResult.verdict === 'YES' ? (
              <CheckCircle className="w-8 h-8 text-emerald-600 shrink-0" />
            ) : verdictResult.verdict === 'CAUTION' ? (
              <AlertTriangle className="w-8 h-8 text-amber-500 shrink-0" />
            ) : (
              <XCircle className="w-8 h-8 text-rose-600 shrink-0" />
            )}

            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Mitra Recommendation
              </p>
              <h3
                className={`font-heading font-extrabold text-xl ${
                  verdictResult.verdict === 'YES'
                    ? 'text-emerald-700 dark:text-emerald-400'
                    : verdictResult.verdict === 'CAUTION'
                    ? 'text-amber-700 dark:text-amber-400'
                    : 'text-rose-700 dark:text-rose-400'
                }`}
              >
                {verdictResult.verdict === 'YES'
                  ? t.afford.verdictYes
                  : verdictResult.verdict === 'CAUTION'
                  ? t.afford.verdictCaution
                  : t.afford.verdictNo}
              </h3>
            </div>
          </div>

          <p className="text-xs text-slate-700 dark:text-slate-200 font-medium leading-relaxed bg-white/70 dark:bg-slate-800/70 p-3 rounded-xl border border-slate-200/60 dark:border-slate-700 mb-4">
            {verdictResult.reason}
          </p>

          {/* Metrics: Confidence, Runway, Goals */}
          <div className="grid grid-cols-3 gap-2.5 pt-2 border-t border-slate-200/60 dark:border-slate-700/60 text-center">
            <div className="p-2 rounded-xl bg-white/50 dark:bg-slate-800/50">
              <p className="text-[10px] font-bold text-slate-400">
                {t.afford.confidence}
              </p>
              <p className="font-heading font-extrabold text-base text-teal-700 dark:text-teal-400">
                {verdictResult.confidenceScore}%
              </p>
            </div>

            <div className="p-2 rounded-xl bg-white/50 dark:bg-slate-800/50">
              <p className="text-[10px] font-bold text-slate-400">
                {t.afford.burnRateImpact}
              </p>
              <p
                className={`font-heading font-extrabold text-base ${
                  verdictResult.runwayImpactDays > 0 ? 'text-rose-500' : 'text-emerald-500'
                }`}
              >
                {verdictResult.runwayImpactDays > 0
                  ? `-${verdictResult.runwayImpactDays} Days`
                  : 'Safe'}
              </p>
            </div>

            <div className="p-2 rounded-xl bg-white/50 dark:bg-slate-800/50">
              <p className="text-[10px] font-bold text-slate-400">
                {t.afford.savingsGoalImpact}
              </p>
              <p
                className={`font-heading font-extrabold text-base ${
                  verdictResult.savingsGoalDelayDays > 0 ? 'text-amber-500' : 'text-emerald-500'
                }`}
              >
                {verdictResult.savingsGoalDelayDays > 0
                  ? `+${verdictResult.savingsGoalDelayDays}d Delay`
                  : 'None'}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
