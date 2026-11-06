import React from 'react';
import { ShieldCheck, Moon, Sun, Lock, Flame, Bell } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Language } from '../types';

export const Header: React.FC = () => {
  const {
    profile,
    language,
    setLanguage,
    theme,
    toggleTheme,
    gamification,
    lockApp,
    newSmsCount,
    setActiveTab
  } = useApp();

  return (
    <header className="sticky top-0 z-30 glass-header px-4 py-3 transition-all duration-200">
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-2">
        {/* Logo and Tagline with Glass Icon */}
        <div
          className="flex items-center gap-2.5 cursor-pointer select-none group"
          onClick={() => setActiveTab('dashboard')}
        >
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-teal-500 via-teal-600 to-teal-800 flex items-center justify-center text-white shadow-lg shadow-teal-700/25 border border-white/30 group-hover:scale-105 transition-transform">
            <span className="font-heading font-extrabold text-xl">₹</span>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-heading font-bold text-lg text-teal-900 dark:text-teal-300 tracking-tight">
                BudgetMitra
              </span>
              <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-50/80 dark:bg-teal-950/70 text-teal-700 dark:text-teal-300 border border-teal-200/60 dark:border-teal-700/50 backdrop-blur-md">
                <ShieldCheck className="w-3 h-3 text-teal-600 dark:text-teal-400" />
                100% Private
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
              {profile.name} • {profile.course}
            </p>
          </div>
        </div>

        {/* Right Glass Pills: Streak, SMS alert, Language, Theme, Lock */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Day Streak Glass Pill */}
          <div
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full glass-pill text-amber-700 dark:text-amber-300 text-xs font-bold"
            title={`${gamification.currentStreak} day streak`}
          >
            <Flame className="w-4 h-4 text-amber-500 fill-amber-500 animate-pulse" />
            <span>{gamification.currentStreak}d</span>
          </div>

          {/* SMS Notification Catch-up Glass Pill */}
          {newSmsCount > 0 && (
            <button
              onClick={() => setActiveTab('sms')}
              className="relative p-2 rounded-2xl glass-pill text-teal-700 dark:text-teal-300 hover:border-teal-400 transition-all"
              title={`${newSmsCount} new debit SMS detected`}
            >
              <Bell className="w-4 h-4" />
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center animate-bounce shadow-md">
                {newSmsCount}
              </span>
            </button>
          )}

          {/* Language Selector Glass Pill */}
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value as Language)}
            className="px-2.5 py-1.5 text-xs font-bold rounded-xl glass-pill text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 cursor-pointer"
            aria-label="App Language"
          >
            <option value="en" className="bg-white dark:bg-slate-900">English</option>
            <option value="hi" className="bg-white dark:bg-slate-900">हिन्दी</option>
            <option value="mr" className="bg-white dark:bg-slate-900">मराठी</option>
          </select>

          {/* Dark / Light Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl glass-pill text-slate-600 dark:text-slate-300 hover:text-teal-600 transition-colors"
            title="Toggle Light / Dark mode"
            aria-label="Toggle theme"
          >
            {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4 text-amber-400" />}
          </button>

          {/* Lock App PIN Trigger */}
          {profile.isPinEnabled && (
            <button
              onClick={lockApp}
              className="p-2 rounded-xl glass-pill text-slate-600 dark:text-slate-300 hover:text-rose-500 transition-colors"
              title="Lock BudgetMitra"
              aria-label="Lock App"
            >
              <Lock className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
