import React from 'react';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { PinLockModal } from './components/PinLockModal';
import { useApp } from './context/AppContext';

// Screens
import { DashboardScreen } from './screens/DashboardScreen';
import { ExpensesScreen } from './screens/ExpensesScreen';
import { SmsTrackerScreen } from './screens/SmsTrackerScreen';
import { AffordSimulatorScreen } from './screens/AffordSimulatorScreen';
import { SplitBillScreen } from './screens/SplitBillScreen';
import { BudgetPlannerScreen } from './screens/BudgetPlannerScreen';
import { LoanCalculatorScreen } from './screens/LoanCalculatorScreen';
import { SchemesScreen } from './screens/SchemesScreen';
import { PermissionsScreen } from './screens/PermissionsScreen';
import { SettingsScreen } from './screens/SettingsScreen';

export const AppContent: React.FC = () => {
  const { activeTab } = useApp();

  const renderActiveScreen = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardScreen />;
      case 'expenses':
        return <ExpensesScreen />;
      case 'sms':
        return <SmsTrackerScreen />;
      case 'afford':
        return <AffordSimulatorScreen />;
      case 'split':
        return <SplitBillScreen />;
      case 'budget':
        return <BudgetPlannerScreen />;
      case 'loans':
        return <LoanCalculatorScreen />;
      case 'schemes':
        return <SchemesScreen />;
      case 'permissions':
        return <PermissionsScreen />;
      case 'settings':
        return <SettingsScreen />;
      default:
        return <DashboardScreen />;
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] dark:bg-[#0B1120] flex flex-col antialiased relative overflow-hidden transition-colors duration-300">
      {/* Ambient Glowing Glassmorphism Background Orbs */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        {/* Teal Cyan Orb (Top Left) */}
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-gradient-to-br from-teal-400/25 to-cyan-400/20 dark:from-teal-500/18 dark:to-cyan-500/12 blur-[100px]" />
        
        {/* Amber Orange Orb (Bottom Right) */}
        <div className="absolute top-1/3 -right-32 w-[30rem] h-[30rem] rounded-full bg-gradient-to-bl from-amber-400/20 to-orange-400/15 dark:from-amber-500/12 dark:to-orange-500/8 blur-[120px]" />
        
        {/* Emerald Indigo Glow (Bottom Center) */}
        <div className="absolute -bottom-32 left-1/4 w-[28rem] h-[28rem] rounded-full bg-gradient-to-tr from-emerald-400/20 via-teal-400/15 to-indigo-400/15 dark:from-emerald-500/10 dark:to-indigo-500/10 blur-[110px]" />
      </div>

      {/* Main Glass Shell */}
      <div className="relative z-10 flex flex-col min-h-screen">
        <Header />
        <div className="flex-1 max-w-6xl w-full mx-auto flex">
          <BottomNav />
          <main className="flex-1 p-4 md:p-6 max-w-4xl w-full mx-auto">
            {renderActiveScreen()}
          </main>
        </div>
        <PinLockModal />
      </div>
    </div>
  );
};
