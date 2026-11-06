import React, { useState } from 'react';
import { Lock, Fingerprint, Delete } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const PinLockModal: React.FC = () => {
  const { isLocked, unlockApp, profile } = useApp();
  const [pinInput, setPinInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  if (!isLocked) return null;

  const handleKeyPress = (num: string) => {
    if (pinInput.length < 4) {
      const nextPin = pinInput + num;
      setPinInput(nextPin);
      setErrorMsg('');

      if (nextPin.length === 4) {
        // Simple hash check (or stored pinHash)
        const expectedPin = profile.pinHash || '1234';
        if (nextPin === expectedPin) {
          setTimeout(() => {
            setPinInput('');
            unlockApp();
          }, 150);
        } else {
          setErrorMsg('Incorrect PIN. Try again.');
          setTimeout(() => setPinInput(''), 400);
        }
      }
    }
  };

  const handleDelete = () => {
    setPinInput((prev) => prev.slice(0, -1));
    setErrorMsg('');
  };

  const handleBiometric = () => {
    // Biometric instant simulated / native unlock
    unlockApp();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/90 backdrop-blur-xl flex items-center justify-center p-4">
      <div className="w-full max-w-xs bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 text-center">
        <div className="w-14 h-14 mx-auto rounded-2xl bg-teal-100 dark:bg-teal-950/80 text-teal-700 dark:text-teal-400 flex items-center justify-center mb-3">
          <Lock className="w-7 h-7" />
        </div>
        <h2 className="font-heading font-bold text-xl text-slate-800 dark:text-white">
          BudgetMitra Locked
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-6">
          Enter 4-digit PIN to access your student records
        </p>

        {/* PIN Dots */}
        <div className="flex justify-center items-center gap-3 mb-6">
          {[0, 1, 2, 3].map((idx) => (
            <div
              key={idx}
              className={`w-4 h-4 rounded-full border-2 transition-all ${
                pinInput.length > idx
                  ? 'bg-teal-600 border-teal-600 scale-110'
                  : 'border-slate-300 dark:border-slate-600'
              }`}
            />
          ))}
        </div>

        {errorMsg && (
          <p className="text-xs font-semibold text-rose-500 mb-4 animate-shake">
            {errorMsg}
          </p>
        )}

        {/* Numeric Keypad */}
        <div className="grid grid-cols-3 gap-3 max-w-[240px] mx-auto mb-4">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
            <button
              key={digit}
              onClick={() => handleKeyPress(digit)}
              className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-white font-heading font-bold text-xl hover:bg-slate-200 dark:hover:bg-slate-700 active:scale-95 transition-all flex items-center justify-center mx-auto"
            >
              {digit}
            </button>
          ))}
          <button
            onClick={handleBiometric}
            className="w-16 h-16 rounded-2xl bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 hover:bg-teal-100 active:scale-95 transition-all flex items-center justify-center mx-auto"
            title="Biometric unlock"
          >
            <Fingerprint className="w-6 h-6" />
          </button>
          <button
            onClick={() => handleKeyPress('0')}
            className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-white font-heading font-bold text-xl hover:bg-slate-200 dark:hover:bg-slate-700 active:scale-95 transition-all flex items-center justify-center mx-auto"
          >
            0
          </button>
          <button
            onClick={handleDelete}
            className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-rose-50 hover:text-rose-600 active:scale-95 transition-all flex items-center justify-center mx-auto"
            title="Delete"
          >
            <Delete className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};
