import React, { useState } from 'react';
import {
  MessageSquareQuote,
  ShieldCheck,
  RefreshCw,
  Undo2,
  CheckCircle2,
  Clock,
  Sparkles,
  Smartphone
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { getTranslation } from '../i18n/translations';
import { StorageService } from '../services/storage';
import { ImportedSmsRecord } from '../types';
import { parseBankSms } from '../services/smsParser';

export const SmsTrackerScreen: React.FC = () => {
  const {
    language,
    scanSmsNow,
    undoTransaction,
    addTransaction
  } = useApp();
  const t = getTranslation(language);

  const [daysBack, setDaysBack] = useState<number>(30);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [lastScannedCount, setLastScannedCount] = useState<number | null>(null);
  const [importedList, setImportedList] = useState<ImportedSmsRecord[]>(() =>
    StorageService.getImportedSmsRecords()
  );
  const [simulatedInput, setSimulatedInput] = useState<string>('');
  const [showSimulateModal, setShowSimulateModal] = useState<boolean>(false);

  const refreshImportedList = () => {
    setImportedList(StorageService.getImportedSmsRecords());
  };

  const handleScan = async (days: number) => {
    setIsScanning(true);
    try {
      const count = await scanSmsNow(days);
      setLastScannedCount(count);
      refreshImportedList();
    } finally {
      setIsScanning(false);
    }
  };

  const handleUndo = (record: ImportedSmsRecord) => {
    // Mark as undone in imported records
    const updated = importedList.map((r) =>
      r.id === record.id ? { ...r, status: 'undone' as const } : r
    );
    setImportedList(updated);
    StorageService.saveImportedSmsRecords(updated);

    // Also remove from transactions
    undoTransaction(record.id);
  };

  // Browser test simulator: simulate incoming bank SMS
  const handleSimulateSms = () => {
    if (!simulatedInput.trim()) return;

    const parsed = parseBankSms(simulatedInput, 'BANK_SMS', new Date().toISOString().split('T')[0]);
    if (!parsed.isDebit || parsed.isIgnored) {
      alert(`Message Ignored: ${parsed.ignoreReason || 'Not a valid debit SMS'}`);
      return;
    }

    // Add to transactions
    const newTx = addTransaction({
      amount: parsed.amount,
      category: parsed.category,
      type: 'debit',
      note: `SMS Debit: ${parsed.merchant}`,
      merchant: parsed.merchant,
      source: 'sms',
      date: parsed.date,
      refId: parsed.refNumber
    });

    // Record in sms_imported
    const newRecord: ImportedSmsRecord = {
      id: newTx.id,
      messageHash: parsed.messageHash,
      sender: parsed.bankName,
      amount: parsed.amount,
      merchant: parsed.merchant,
      rawText: simulatedInput,
      dateReceived: parsed.date,
      status: 'imported'
    };

    const updated = [newRecord, ...importedList];
    setImportedList(updated);
    StorageService.saveImportedSmsRecords(updated);

    setSimulatedInput('');
    setShowSimulateModal(false);
    alert(`Successfully parsed and logged debit of ₹${parsed.amount} to ${parsed.category}!`);
  };

  return (
    <div className="space-y-4 pb-24">
      {/* Top Banner & Privacy Pledge */}
      <div className="glass-card p-5 relative overflow-hidden">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-teal-600" />
                100% On-Device Parser
              </span>
            </div>
            <h2 className="font-heading font-extrabold text-2xl text-slate-800 dark:text-white">
              {t.sms.title}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-lg leading-relaxed">
              {t.sms.privacyNotice}
            </p>
          </div>

          <button
            onClick={() => setShowSimulateModal(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-200 transition-all shrink-0"
            title="Test SMS Parsing"
          >
            <Smartphone className="w-4 h-4 text-teal-600" />
            <span>Test SMS</span>
          </button>
        </div>

        {/* Scan Actions & History Range */}
        <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-slate-400 mr-1">
              <Clock className="w-3.5 h-3.5 inline mr-1" />
              {t.sms.scanRange}:
            </span>
            {[
              { days: 7, label: t.sms.past7Days },
              { days: 30, label: t.sms.past30Days },
              { days: 90, label: t.sms.past90Days }
            ].map((r) => (
              <button
                key={r.days}
                onClick={() => {
                  setDaysBack(r.days);
                  handleScan(r.days);
                }}
                disabled={isScanning}
                className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                  daysBack === r.days
                    ? 'bg-teal-600 text-white shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>

          <button
            onClick={() => handleScan(daysBack)}
            disabled={isScanning}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-teal-600 text-white text-xs font-bold hover:bg-teal-700 active:scale-95 transition-all shadow-md shadow-teal-700/20 disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin' : ''}`} />
            <span>{isScanning ? t.sms.scanning : t.sms.scanNow}</span>
          </button>
        </div>

        {lastScannedCount !== null && (
          <div className="mt-3 p-2.5 rounded-xl bg-teal-50 dark:bg-teal-950/40 text-teal-800 dark:text-teal-200 text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
            <span>
              Scan completed: {lastScannedCount} new debits added. Deduplication active.
            </span>
          </div>
        )}
      </div>

      {/* Supported Banks List Pill */}
      <div className="p-3 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-800 flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
        <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
        <span className="font-medium">{t.sms.supportedBanks}</span>
      </div>

      {/* Imported SMS Review Rows */}
      <div>
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5">
          Imported SMS History ({importedList.length})
        </h3>

        {importedList.length === 0 ? (
          <div className="glass-card p-12 text-center">
            <MessageSquareQuote className="w-12 h-12 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-500">
              {t.sms.noSmsFound}
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Tap "Scan SMS Now" or use the "Test SMS" simulator to test bank formats.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {importedList.map((item) => (
              <div
                key={item.id}
                className={`glass-card p-4 transition-all ${
                  item.status === 'undone' ? 'opacity-50 border-dashed' : ''
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        {item.sender}
                      </span>
                      <span className="text-xs font-bold text-slate-800 dark:text-white">
                        {item.merchant}
                      </span>
                      {item.status === 'undone' && (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-rose-100 text-rose-700">
                          {t.sms.undone}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 font-mono text-[11px] bg-slate-50 dark:bg-slate-800/50 p-2 rounded-lg mt-1 border border-slate-100 dark:border-slate-800">
                      "{item.rawText}"
                    </p>
                    <p className="text-[10px] text-slate-400 mt-1">
                      Received: {item.dateReceived}
                    </p>
                  </div>

                  <div className="text-right shrink-0">
                    <p className="font-heading font-extrabold text-base text-slate-800 dark:text-white">
                      -₹{item.amount.toLocaleString('en-IN')}
                    </p>
                    {item.status !== 'undone' && (
                      <button
                        onClick={() => handleUndo(item)}
                        className="mt-2 inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors"
                        title="Remove this imported transaction"
                      >
                        <Undo2 className="w-3.5 h-3.5" />
                        <span>{t.sms.undo}</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Test / Simulate Bank SMS Modal */}
      {showSimulateModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800">
            <h3 className="font-heading font-bold text-lg text-slate-800 dark:text-white mb-2">
              {t.sms.simulatedDemo}
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Paste or click any real bank SMS template to test the debit-only parser in real time:
            </p>

            {/* Quick Templates */}
            <div className="space-y-1.5 mb-4">
              {[
                'SBI: Your A/C 9912 debited by Rs 180.00 on 05-Nov-26 via UPI to ZOMATO. Ref: 63102910.',
                'HDFC: Rs 120.00 debited from A/C XX4412 on 04-Nov-26 at AUTO RICKSHAW. Bal: Rs 2800.',
                'Paytm: Paid Rs 50.00 from Paytm Wallet to CAMPUS XEROX. UPI Ref: 102938491.',
                'ICICI: Acct XX102 debited for Rs 450.00 on 02-Nov-26; at BOOK STORE. Avl Bal: Rs 4,100.'
              ].map((template, idx) => (
                <button
                  key={idx}
                  onClick={() => setSimulatedInput(template)}
                  className="w-full text-left p-2 rounded-xl bg-slate-50 dark:bg-slate-800 text-[11px] text-slate-700 dark:text-slate-300 font-mono hover:bg-teal-50 dark:hover:bg-teal-950/50 hover:text-teal-700"
                >
                  {template}
                </button>
              ))}
            </div>

            <textarea
              rows={3}
              value={simulatedInput}
              onChange={(e) => setSimulatedInput(e.target.value)}
              placeholder="Paste raw bank alert message here..."
              className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500 mb-4"
            />

            <div className="flex gap-2">
              <button
                onClick={() => setShowSimulateModal(false)}
                className="flex-1 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold"
              >
                {t.common.cancel}
              </button>
              <button
                onClick={handleSimulateSms}
                className="flex-1 py-2.5 rounded-xl bg-teal-600 text-white text-xs font-bold hover:bg-teal-700"
              >
                Parse & Import
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
