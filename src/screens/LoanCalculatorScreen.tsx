import React, { useState, useMemo } from 'react';
import {
  Zap,
  Layers,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { getTranslation } from '../i18n/translations';
import { calculateLoanEmi } from '../services/financeMath';

export const LoanCalculatorScreen: React.FC = () => {
  const { language } = useApp();
  const t = getTranslation(language);

  // States
  const [principal, setPrincipal] = useState<number>(150000);
  const [interestRate, setInterestRate] = useState<number>(8.5);
  const [tenureMonths, setTenureMonths] = useState<number>(48);
  const [extraPayment, setExtraPayment] = useState<number>(500);
  const [showAmortization, setShowAmortization] = useState<boolean>(false);

  const emiData = useMemo(() => {
    return calculateLoanEmi(principal, interestRate, tenureMonths, extraPayment);
  }, [principal, interestRate, tenureMonths, extraPayment]);

  return (
    <div className="space-y-4 pb-24">
      {/* Title */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300">
            Smart Debt Management
          </span>
        </div>
        <h2 className="font-heading font-extrabold text-2xl text-slate-800 dark:text-white">
          {t.loans.title}
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          {t.loans.headline}
        </p>
      </div>

      {/* Calculator Sliders Card */}
      <div className="glass-card p-5 space-y-4">
        {/* Principal */}
        <div>
          <div className="flex justify-between items-center mb-1">
            <label className="text-xs font-bold text-slate-600 dark:text-slate-300">
              {t.loans.loanAmount}
            </label>
            <span className="font-heading font-extrabold text-base text-teal-700 dark:text-teal-400">
              ₹{principal.toLocaleString('en-IN')}
            </span>
          </div>
          <input
            type="range"
            min="5000"
            max="1500000"
            step="5000"
            value={principal}
            onChange={(e) => setPrincipal(Number(e.target.value))}
            className="w-full accent-teal-600"
          />
          <div className="flex justify-between text-[10px] text-slate-400 font-semibold">
            <span>₹5,000</span>
            <span>₹15 Lakhs</span>
          </div>
        </div>

        {/* Interest Rate */}
        <div>
          <div className="flex justify-between items-center mb-1">
            <div className="flex items-center gap-2">
              <label className="text-xs font-bold text-slate-600 dark:text-slate-300">
                {t.loans.interestRate}
              </label>
              {interestRate === 0 && (
                <span className="px-1.5 py-0.2 rounded text-[10px] font-extrabold bg-emerald-100 text-emerald-800">
                  0% No-Cost EMI
                </span>
              )}
            </div>
            <span className="font-heading font-extrabold text-base text-teal-700 dark:text-teal-400">
              {interestRate}% p.a.
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="18"
            step="0.25"
            value={interestRate}
            onChange={(e) => setInterestRate(Number(e.target.value))}
            className="w-full accent-teal-600"
          />
          <div className="flex justify-between text-[10px] text-slate-400 font-semibold">
            <span>0% (Gadget)</span>
            <span>8.5% (SBI Edu)</span>
            <span>18%</span>
          </div>
        </div>

        {/* Tenure */}
        <div>
          <div className="flex justify-between items-center mb-1">
            <label className="text-xs font-bold text-slate-600 dark:text-slate-300">
              {t.loans.tenureMonths}
            </label>
            <span className="font-heading font-extrabold text-base text-teal-700 dark:text-teal-400">
              {tenureMonths} Months ({Math.round((tenureMonths / 12) * 10) / 10} yrs)
            </span>
          </div>
          <input
            type="range"
            min="3"
            max="120"
            step="3"
            value={tenureMonths}
            onChange={(e) => setTenureMonths(Number(e.target.value))}
            className="w-full accent-teal-600"
          />
          <div className="flex justify-between text-[10px] text-slate-400 font-semibold">
            <span>3m</span>
            <span>48m (4 yrs)</span>
            <span>120m (10 yrs)</span>
          </div>
        </div>
      </div>

      {/* Calculated Results Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="glass-card p-4">
          <p className="text-xs font-bold text-slate-400 mb-1">
            {t.loans.monthlyEmi}
          </p>
          <p className="font-heading font-extrabold text-2xl text-teal-700 dark:text-teal-400">
            ₹{emiData.monthlyEmi.toLocaleString('en-IN')}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">Per month payment</p>
        </div>

        <div className="glass-card p-4">
          <p className="text-xs font-bold text-slate-400 mb-1">
            {t.loans.totalInterest}
          </p>
          <p className="font-heading font-extrabold text-2xl text-amber-600 dark:text-amber-400">
            ₹{emiData.totalInterest.toLocaleString('en-IN')}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">Cost of borrowing</p>
        </div>

        <div className="glass-card p-4">
          <p className="text-xs font-bold text-slate-400 mb-1">
            {t.loans.totalPayment}
          </p>
          <p className="font-heading font-extrabold text-2xl text-slate-800 dark:text-white">
            ₹{emiData.totalPayment.toLocaleString('en-IN')}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">Principal + Total Interest</p>
        </div>
      </div>

      {/* Accelerated Payoff Simulator */}
      <div className="glass-card p-5 bg-gradient-to-br from-teal-500/10 via-transparent to-amber-500/10 border border-teal-200/80 dark:border-teal-800/80">
        <div className="flex items-center gap-2 mb-3">
          <Zap className="w-5 h-5 text-amber-500" />
          <h3 className="font-heading font-bold text-base text-slate-800 dark:text-white">
            {t.loans.payoffSimulation}
          </h3>
        </div>
        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
          See the impact of paying just a few hundred rupees extra every month towards your loan principal:
        </p>

        <div className="space-y-2 mb-4">
          <div className="flex justify-between items-center text-xs font-bold">
            <span className="text-slate-600 dark:text-slate-300">
              {t.loans.extraPayment}:
            </span>
            <span className="font-heading font-extrabold text-sm text-teal-700 dark:text-teal-400">
              +₹{extraPayment.toLocaleString('en-IN')}/mo
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="5000"
            step="100"
            value={extraPayment}
            onChange={(e) => setExtraPayment(Number(e.target.value))}
            className="w-full accent-teal-600"
          />
        </div>

        <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-200/60 dark:border-slate-700/60 text-center">
          <div className="p-3 rounded-2xl bg-white/70 dark:bg-slate-800/70 border border-slate-100 dark:border-slate-800">
            <p className="text-[10px] font-bold text-slate-400 uppercase">
              {t.loans.interestSaved}
            </p>
            <p className="font-heading font-extrabold text-xl text-emerald-600 dark:text-emerald-400 mt-0.5">
              ₹{emiData.interestSavedWithExtra.toLocaleString('en-IN')}
            </p>
          </div>

          <div className="p-3 rounded-2xl bg-white/70 dark:bg-slate-800/70 border border-slate-100 dark:border-slate-800">
            <p className="text-[10px] font-bold text-slate-400 uppercase">
              {t.loans.monthsSaved}
            </p>
            <p className="font-heading font-extrabold text-xl text-amber-600 dark:text-amber-400 mt-0.5">
              {emiData.monthsSavedWithExtra} Months
            </p>
          </div>
        </div>
      </div>

      {/* Amortization Schedule Toggle */}
      <div className="glass-card overflow-hidden">
        <button
          onClick={() => setShowAmortization(!showAmortization)}
          className="w-full p-4 flex items-center justify-between text-left hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
        >
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-teal-600" />
            <span className="font-heading font-bold text-sm text-slate-800 dark:text-white">
              {t.loans.amortizationSchedule}
            </span>
          </div>
          {showAmortization ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {showAmortization && (
          <div className="border-t border-slate-100 dark:border-slate-800 p-3 max-h-72 overflow-y-auto">
            <table className="w-full text-[11px] text-left">
              <thead className="text-slate-400 font-bold border-b border-slate-100 dark:border-slate-800">
                <tr>
                  <th className="pb-2">{t.loans.month}</th>
                  <th className="pb-2">{t.loans.principalPaid}</th>
                  <th className="pb-2">{t.loans.interestPaid}</th>
                  <th className="pb-2 text-right">{t.loans.balanceRemaining}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                {emiData.schedule.slice(0, 36).map((row) => (
                  <tr key={row.month} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                    <td className="py-2 font-bold text-slate-500">M{row.month}</td>
                    <td className="py-2 font-medium text-teal-700 dark:text-teal-400">
                      ₹{row.principalPaid.toFixed(0)}
                    </td>
                    <td className="py-2 font-medium text-amber-600">
                      ₹{row.interestPaid.toFixed(0)}
                    </td>
                    <td className="py-2 font-extrabold text-right text-slate-700 dark:text-slate-200">
                      ₹{row.balance.toFixed(0)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
