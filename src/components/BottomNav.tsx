import React from 'react';
import {
  LayoutDashboard,
  Receipt,
  MessageSquareQuote,
  Scale,
  Users2,
  PieChart,
  Landmark,
  GraduationCap,
  Settings,
  ShieldCheck
} from 'lucide-react';
import { useApp, TabType } from '../context/AppContext';
import { getTranslation } from '../i18n/translations';

interface NavItem {
  key: TabType;
  label: string;
  icon: React.ElementType;
  badge?: number;
}

export const BottomNav: React.FC = () => {
  const { activeTab, setActiveTab, language, newSmsCount } = useApp();
  const t = getTranslation(language);

  // Core 5 mobile bottom bar tabs
  const primaryMobileTabs: NavItem[] = [
    { key: 'dashboard', label: t.tabs.dashboard, icon: LayoutDashboard },
    { key: 'expenses', label: t.tabs.expenses, icon: Receipt },
    { key: 'sms', label: t.tabs.sms, icon: MessageSquareQuote, badge: newSmsCount },
    { key: 'afford', label: t.tabs.afford, icon: Scale },
    { key: 'split', label: t.tabs.split, icon: Users2 }
  ];

  const secondaryTabs: NavItem[] = [
    { key: 'budget', label: t.tabs.budget, icon: PieChart },
    { key: 'loans', label: t.tabs.loans, icon: Landmark },
    { key: 'schemes', label: t.tabs.schemes, icon: GraduationCap },
    { key: 'permissions', label: 'Privacy', icon: ShieldCheck },
    { key: 'settings', label: t.tabs.settings, icon: Settings }
  ];

  return (
    <>
      {/* Secondary Quick-Chips for Mobile (horizontal scrollable above bottom bar) */}
      <div className="md:hidden fixed bottom-16 left-0 right-0 z-20 px-3 py-1.5 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border-t border-white/50 dark:border-white/10 overflow-x-auto no-scrollbar flex items-center gap-1.5">
        {secondaryTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-teal-600 text-white shadow-md shadow-teal-600/30'
                  : 'glass-pill text-slate-600 dark:text-slate-300 hover:border-teal-400'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Primary Mobile Bottom Floating Glass Dock */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 h-16 glass-nav-dock flex items-center justify-around px-2 pb-[env(safe-area-inset-bottom,0px)]">
        {primaryMobileTabs.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.key;
          return (
            <button
              key={item.key}
              onClick={() => setActiveTab(item.key)}
              className="relative flex flex-col items-center justify-center flex-1 py-1 transition-all group"
            >
              <div
                className={`p-1.5 rounded-2xl transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-tr from-teal-500/20 to-teal-600/30 text-teal-700 dark:text-teal-300 border border-teal-500/40 shadow-sm scale-105'
                    : 'text-slate-500 dark:text-slate-400 group-hover:text-slate-700'
                }`}
              >
                <Icon className="w-5 h-5" />
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="absolute top-0 right-4 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-md">
                    {item.badge}
                  </span>
                )}
              </div>
              <span
                className={`text-[10px] font-bold mt-0.5 tracking-tight ${
                  isActive ? 'text-teal-700 dark:text-teal-300' : 'text-slate-500 dark:text-slate-400'
                }`}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </nav>

      {/* Desktop / Tablet Frosted Sidebar Rail */}
      <aside className="hidden md:flex flex-col w-64 glass-card my-4 ml-4 mr-2 border border-white/70 dark:border-white/10 p-4 shrink-0 h-[calc(100vh-6rem)] sticky top-20 overflow-y-auto">
        <div className="space-y-1">
          <p className="px-3 text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">
            Finance & Tracking
          </p>
          {primaryMobileTabs.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.key;
            return (
              <button
                key={item.key}
                onClick={() => setActiveTab(item.key)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-sm font-bold transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-teal-600 to-teal-700 text-white shadow-lg shadow-teal-700/25 border border-teal-400/40 scale-[1.02]'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-white/60 dark:hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="px-1.5 py-0.5 text-xs font-bold rounded-full bg-rose-500 text-white shadow-sm">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}

          <p className="px-3 text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mt-6 mb-2">
            Planning & Tools
          </p>
          {secondaryTabs.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.key;
            return (
              <button
                key={item.key}
                onClick={() => setActiveTab(item.key)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-sm font-bold transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-teal-600 to-teal-700 text-white shadow-lg shadow-teal-700/25 border border-teal-400/40 scale-[1.02]'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-white/60 dark:hover:bg-slate-800/60'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </aside>
    </>
  );
};
