import React, { useState } from 'react';
import {
  User,
  Shield,
  Download,
  Upload,
  Trash2,
  Lock,
  Fingerprint,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { getTranslation } from '../i18n/translations';
import { StorageService } from '../services/storage';

export const SettingsScreen: React.FC = () => {
  const {
    profile,
    updateProfile,
    language,
    resetToDemo,
    resetToGuest
  } = useApp();
  const t = getTranslation(language);

  // Profile Edit States
  const [name, setName] = useState(profile.name);
  const [course, setCourse] = useState(profile.course);
  const [year, setYear] = useState(profile.year);
  const [state, setState] = useState(profile.state);
  const [incomeBracket, setIncomeBracket] = useState(profile.incomeBracket);
  const [category, setCategory] = useState(profile.category);
  const [monthlyAllowance, setMonthlyAllowance] = useState(profile.monthlyAllowance.toString());
  const [upiId, setUpiId] = useState(profile.upiId || '');

  // PIN Setup States
  const [pinEnabled, setPinEnabled] = useState(profile.isPinEnabled);
  const [newPin, setNewPin] = useState(profile.pinHash || '');
  const [biometricEnabled, setBiometricEnabled] = useState(profile.isBiometricEnabled);

  // Status message
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const allowanceNum = parseFloat(monthlyAllowance);
    if (isNaN(allowanceNum) || allowanceNum <= 0) {
      setStatusMsg({ type: 'error', text: 'Please enter a valid monthly allowance.' });
      return;
    }

    updateProfile({
      name,
      course,
      year: year as typeof profile.year,
      state,
      incomeBracket: incomeBracket as typeof profile.incomeBracket,
      category: category as typeof profile.category,
      monthlyAllowance: allowanceNum,
      upiId,
      isPinEnabled: pinEnabled,
      pinHash: pinEnabled ? (newPin || '1234') : undefined,
      isBiometricEnabled: biometricEnabled
    });

    setStatusMsg({ type: 'success', text: 'Settings updated successfully!' });
    setTimeout(() => setStatusMsg(null), 3000);
  };

  // Export Backup JSON
  const handleExportBackup = () => {
    const jsonStr = StorageService.exportBackupJson();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `BudgetMitra_Backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setStatusMsg({ type: 'success', text: t.settings.backupSuccess });
    setTimeout(() => setStatusMsg(null), 3000);
  };

  // Import Backup JSON
  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const res = StorageService.importBackupJson(content);
      if (res.success) {
        setStatusMsg({ type: 'success', text: t.settings.importSuccess });
        setTimeout(() => window.location.reload(), 1000);
      } else {
        setStatusMsg({ type: 'error', text: res.error || 'Failed to import backup' });
      }
    };
    reader.readAsText(file);
  };

  // Delete All Data
  const handleDeleteAll = () => {
    if (confirm(t.settings.deleteConfirmPrompt)) {
      resetToGuest();
      setStatusMsg({ type: 'success', text: 'All local data wiped.' });
    }
  };

  return (
    <div className="space-y-4 pb-24">
      {/* Title */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300">
            Control Center
          </span>
        </div>
        <h2 className="font-heading font-extrabold text-2xl text-slate-800 dark:text-white">
          {t.settings.title}
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Manage local profile, PIN security & device backup
        </p>
      </div>

      {statusMsg && (
        <div
          className={`p-3 rounded-2xl flex items-center gap-2 text-xs font-bold animate-fadeIn ${
            statusMsg.type === 'success'
              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
              : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
          }`}
        >
          {statusMsg.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 shrink-0" />
          ) : (
            <AlertTriangle className="w-4 h-4 shrink-0" />
          )}
          <span>{statusMsg.text}</span>
        </div>
      )}

      {/* Student Profile Form */}
      <form onSubmit={handleSaveProfile} className="glass-card p-5 space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
          <User className="w-4 h-4 text-teal-600" />
          <h3 className="font-heading font-bold text-sm text-slate-800 dark:text-white">
            {t.settings.profile}
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
              Full Name
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
              Course / Degree
            </label>
            <input
              type="text"
              required
              value={course}
              onChange={(e) => setCourse(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
              Academic Year
            </label>
            <select
              value={year}
              onChange={(e) => setYear(e.target.value as typeof profile.year)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-white"
            >
              <option value="1st Year">1st Year</option>
              <option value="2nd Year">2nd Year</option>
              <option value="3rd Year">3rd Year</option>
              <option value="4th Year">4th Year</option>
              <option value="Postgraduate">Postgraduate</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
              Home State
            </label>
            <input
              type="text"
              required
              value={state}
              onChange={(e) => setState(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
              Category (for scholarship match)
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as typeof profile.category)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-white"
            >
              <option value="General">General</option>
              <option value="OBC">OBC</option>
              <option value="SC">SC</option>
              <option value="ST">ST</option>
              <option value="EWS">EWS</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
              Family Income Bracket
            </label>
            <select
              value={incomeBracket}
              onChange={(e) => setIncomeBracket(e.target.value as typeof profile.incomeBracket)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-white"
            >
              <option value="< 1.5 Lakh">&lt; 1.5 Lakh</option>
              <option value="1.5 - 3 Lakh">1.5 - 3 Lakh</option>
              <option value="3 - 6 Lakh">3 - 6 Lakh</option>
              <option value="6 - 10 Lakh">6 - 10 Lakh</option>
              <option value="> 10 Lakh">&gt; 10 Lakh</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
              Monthly Allowance (₹) *
            </label>
            <input
              type="number"
              required
              value={monthlyAllowance}
              onChange={(e) => setMonthlyAllowance(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-extrabold font-heading text-slate-800 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
              {t.settings.upiSettings}
            </label>
            <input
              type="text"
              value={upiId}
              onChange={(e) => setUpiId(e.target.value)}
              placeholder="e.g. yourname@oksbi"
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-white"
            />
          </div>
        </div>

        {/* Security / PIN Lock Section */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-3">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-teal-600" />
            <h4 className="font-heading font-bold text-xs uppercase tracking-wider text-slate-400">
              {t.settings.security}
            </h4>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-slate-500" />
              <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
                {t.settings.pinLock}
              </span>
            </div>
            <input
              type="checkbox"
              checked={pinEnabled}
              onChange={(e) => setPinEnabled(e.target.checked)}
              className="w-4 h-4 accent-teal-600"
            />
          </div>

          {pinEnabled && (
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-between gap-3">
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                Set 4-Digit PIN:
              </label>
              <input
                type="password"
                maxLength={4}
                value={newPin}
                onChange={(e) => setNewPin(e.target.value)}
                placeholder="1234"
                className="w-24 px-3 py-1 text-center font-heading font-extrabold text-sm rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white"
              />
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Fingerprint className="w-4 h-4 text-slate-500" />
              <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
                {t.settings.biometricLock}
              </span>
            </div>
            <input
              type="checkbox"
              checked={biometricEnabled}
              onChange={(e) => setBiometricEnabled(e.target.checked)}
              className="w-4 h-4 accent-teal-600"
            />
          </div>
        </div>

        <button
          type="submit"
          className="w-full py-2.5 rounded-xl bg-teal-600 text-white text-xs font-bold hover:bg-teal-700 active:scale-95 transition-all shadow-md shadow-teal-700/20"
        >
          {t.common.save}
        </button>
      </form>

      {/* Backup & Restore Section */}
      <div className="glass-card p-5 space-y-3">
        <h3 className="font-heading font-bold text-sm text-slate-800 dark:text-white flex items-center gap-2">
          <Download className="w-4 h-4 text-teal-600" />
          <span>{t.settings.dataManagement}</span>
        </h3>
        <p className="text-xs text-slate-500 leading-relaxed">
          Because your data lives only on your phone, uninstalling the app deletes local data. Use Backup & Restore to keep safe JSON archives.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
          <button
            onClick={handleExportBackup}
            className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-teal-50 dark:bg-teal-950 text-teal-700 dark:text-teal-300 text-xs font-bold hover:bg-teal-100 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>{t.settings.exportBackup}</span>
          </button>

          <label className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-200 transition-colors cursor-pointer">
            <Upload className="w-4 h-4" />
            <span>{t.settings.importBackup}</span>
            <input
              type="file"
              accept=".json"
              onChange={handleImportBackup}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {/* Mode Switches & Danger Zone */}
      <div className="glass-card p-5 space-y-3">
        <h3 className="font-heading font-bold text-sm text-slate-800 dark:text-white">
          Data Personas & Reset
        </h3>

        <div className="flex flex-wrap items-center gap-2 pt-1">
          <button
            onClick={resetToDemo}
            className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-teal-50 hover:text-teal-700 transition-colors"
          >
            {t.settings.demoMode}
          </button>

          <button
            onClick={resetToGuest}
            className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-200 transition-colors"
          >
            {t.settings.guestMode}
          </button>

          <button
            onClick={handleDeleteAll}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-400 text-xs font-bold hover:bg-rose-100 transition-colors ml-auto"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>{t.settings.deleteAllData}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
