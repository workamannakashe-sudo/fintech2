import React from 'react';
import confetti from 'canvas-confetti';
import { Flame, Calendar, Trophy, Sparkles } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { getTranslation } from '../i18n/translations';
import { Badge } from '../types';

const BADGES: Badge[] = [
  {
    id: 'first_log',
    title: 'First Step',
    description: 'Logged your very first expense on BudgetMitra',
    icon: '🌱',
    xpReward: 50
  },
  {
    id: 'streak_3',
    title: '3-Day Discipline',
    description: 'Maintained a 3-day consecutive expense logging streak',
    icon: '🔥',
    xpReward: 100
  },
  {
    id: 'streak_7',
    title: 'Weekly Warrior',
    description: 'Tracked expenses 7 days in a row without breaking',
    icon: '⚡',
    xpReward: 250
  },
  {
    id: 'budget_created',
    title: 'Envelope Master',
    description: 'Customized category budgets for your semester',
    icon: '📊',
    xpReward: 80
  },
  {
    id: 'sms_synced',
    title: 'Automation Pioneer',
    description: 'Imported bank debits directly from on-device SMS',
    icon: '🤖',
    xpReward: 120
  },
  {
    id: 'bill_split',
    title: 'Fair Friend',
    description: 'Split a hostel or canteen bill and shared on WhatsApp',
    icon: '🤝',
    xpReward: 90
  }
];

export const GamificationView: React.FC = () => {
  const { gamification, language } = useApp();
  const t = getTranslation(language);

  // Generate last 90 days date keys for GitHub-style activity heatmap
  const daysList: Array<{ date: string; count: number }> = [];
  const now = new Date();
  for (let i = 89; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 86400000);
    const dateKey = d.toISOString().split('T')[0];
    daysList.push({
      date: dateKey,
      count: gamification.activityMap[dateKey] || 0
    });
  }

  const triggerConfetti = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
  };

  return (
    <div className="space-y-4 pb-24">
      {/* Title */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300">
            Student Achievements
          </span>
        </div>
        <h2 className="font-heading font-extrabold text-2xl text-slate-800 dark:text-white">
          Gamification & Streaks
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Earn XP, unlock milestones, and keep your financial health streak alive
        </p>
      </div>

      {/* Hero Stats Card */}
      <div className="glass-card p-5 bg-gradient-to-r from-teal-600 to-teal-800 text-white relative overflow-hidden">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Trophy className="w-5 h-5 text-amber-300" />
              <span className="text-xs font-bold text-teal-200 uppercase tracking-wider">
                {t.gamification.level}
              </span>
            </div>
            <h3 className="font-heading font-extrabold text-2xl text-white">
              {gamification.level}
            </h3>
            <p className="text-xs text-teal-100 mt-0.5">
              {gamification.xp} Total XP Points Earned
            </p>
          </div>

          <div className="flex flex-col items-center justify-center p-3 rounded-2xl bg-white/20 backdrop-blur-md">
            <Flame className="w-8 h-8 text-amber-300 fill-amber-300 animate-pulse" />
            <span className="font-heading font-extrabold text-xl leading-none mt-1">
              {gamification.currentStreak}
            </span>
            <span className="text-[10px] font-bold text-teal-100 uppercase tracking-tighter">
              Days Streak
            </span>
          </div>
        </div>

        {/* Level XP Progress Bar */}
        <div className="mt-4 pt-4 border-t border-white/20">
          <div className="flex justify-between text-xs font-semibold text-teal-100 mb-1">
            <span>Progress to Next Tier</span>
            <span>{gamification.xp} / 1,500 XP</span>
          </div>
          <div className="w-full bg-white/20 h-2 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-amber-400 to-emerald-400 rounded-full"
              style={{ width: `${Math.min(100, (gamification.xp / 1500) * 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* GitHub-style Activity Heatmap (Last 90 Days) */}
      <div className="glass-card p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-teal-600" />
            <h3 className="font-heading font-bold text-sm text-slate-800 dark:text-white">
              {t.gamification.heatmapTitle}
            </h3>
          </div>
          <span className="text-[11px] font-bold text-slate-400">90 Days</span>
        </div>

        {/* Heatmap Grid: 7 rows (days of week) x ~13 columns */}
        <div className="grid grid-flow-col grid-rows-7 gap-1.5 overflow-x-auto no-scrollbar py-2">
          {daysList.map((item) => {
            let color = 'bg-slate-100 dark:bg-slate-800';
            if (item.count >= 3) color = 'bg-teal-600';
            else if (item.count === 2) color = 'bg-teal-400';
            else if (item.count === 1) color = 'bg-teal-200 dark:bg-teal-800';

            return (
              <div
                key={item.date}
                className={`w-3.5 h-3.5 rounded-sm ${color} transition-all hover:scale-125 cursor-pointer`}
                title={`${item.date}: ${item.count} activity/logging entries`}
              />
            );
          })}
        </div>

        <div className="flex items-center justify-end gap-1.5 text-[10px] text-slate-400 font-semibold mt-2">
          <span>Less</span>
          <div className="w-2.5 h-2.5 rounded-sm bg-slate-100 dark:bg-slate-800" />
          <div className="w-2.5 h-2.5 rounded-sm bg-teal-200 dark:bg-teal-800" />
          <div className="w-2.5 h-2.5 rounded-sm bg-teal-400" />
          <div className="w-2.5 h-2.5 rounded-sm bg-teal-600" />
          <span>More</span>
        </div>
      </div>

      {/* Badges Showcase */}
      <div>
        <div className="flex items-center justify-between mb-2.5">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            {t.gamification.badges} ({gamification.unlockedBadgeIds.length} / {BADGES.length})
          </h3>
          <button
            onClick={triggerConfetti}
            className="text-xs font-bold text-teal-600 hover:underline flex items-center gap-1"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Celebrate</span>
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {BADGES.map((b) => {
            const isUnlocked = gamification.unlockedBadgeIds.includes(b.id);
            return (
              <div
                key={b.id}
                className={`glass-card p-3.5 flex items-start gap-3 transition-all ${
                  isUnlocked ? 'border-teal-500/80' : 'opacity-40 grayscale'
                }`}
              >
                <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-xl shrink-0">
                  {b.icon}
                </div>
                <div>
                  <h4 className="font-heading font-bold text-xs text-slate-800 dark:text-white">
                    {b.title}
                  </h4>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-2 mt-0.5">
                    {b.description}
                  </p>
                  <span className="inline-block mt-1 text-[10px] font-extrabold text-teal-600 dark:text-teal-400">
                    +{b.xpReward} XP
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
