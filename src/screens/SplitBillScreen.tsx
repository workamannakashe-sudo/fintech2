import React, { useState } from 'react';
import {
  Plus,
  Trash2,
  FileText,
  Camera,
  MessageCircle,
  Wallet
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { getTranslation } from '../i18n/translations';
import { calculateBillSplits, generateUpiLink } from '../services/financeMath';
import { NativeBridgeService } from '../services/nativeBridge';
import { generateSplitBillPdf } from '../services/pdfGenerator';
import { BillSplit, SplitMember } from '../types';

export const SplitBillScreen: React.FC = () => {
  const { profile, addTransaction, language } = useApp();
  const t = getTranslation(language);

  const [title, setTitle] = useState<string>('Hostel Dinner & Swiggy');
  const [totalAmount, setTotalAmount] = useState<string>('750');
  const [splitType, setSplitType] = useState<'equal' | 'custom'>('equal');
  const [members, setMembers] = useState<SplitMember[]>([
    { id: 'm1', name: 'Me (Aman)', percentage: 33.33, amount: 250, paidStatus: 'paid' },
    { id: 'm2', name: 'Rahul Verma', phone: '9876543210', percentage: 33.33, amount: 250, paidStatus: 'unpaid' },
    { id: 'm3', name: 'Sneha Patil', phone: '9123456780', percentage: 33.34, amount: 250, paidStatus: 'unpaid' }
  ]);
  const [hasLoggedMyShare, setHasLoggedMyShare] = useState<boolean>(false);
  const [receiptImageName, setReceiptImageName] = useState<string | null>(null);

  // Recalculate splits whenever total or members change
  const handleTotalChange = (val: string) => {
    setTotalAmount(val);
    const num = parseFloat(val) || 0;
    const recomputed = calculateBillSplits(num, splitType, members);
    setMembers(recomputed.map((m, idx) => ({ ...members[idx], amount: m.amount, percentage: m.percentage })));
  };

  const handleSplitTypeChange = (type: 'equal' | 'custom') => {
    setSplitType(type);
    const num = parseFloat(totalAmount) || 0;
    const recomputed = calculateBillSplits(num, type, members);
    setMembers(recomputed.map((m, idx) => ({ ...members[idx], amount: m.amount, percentage: m.percentage })));
  };

  const addFriend = () => {
    const newMember: SplitMember = {
      id: `m_${Date.now()}`,
      name: `Friend ${members.length + 1}`,
      percentage: 0,
      amount: 0,
      paidStatus: 'unpaid'
    };
    const updated = [...members, newMember];
    const num = parseFloat(totalAmount) || 0;
    const recomputed = calculateBillSplits(num, splitType, updated);
    setMembers(recomputed.map((m, idx) => ({ ...updated[idx], amount: m.amount, percentage: m.percentage })));
  };

  const removeMember = (id: string) => {
    if (members.length <= 1) return;
    const updated = members.filter((m) => m.id !== id);
    const num = parseFloat(totalAmount) || 0;
    const recomputed = calculateBillSplits(num, splitType, updated);
    setMembers(recomputed.map((m, idx) => ({ ...updated[idx], amount: m.amount, percentage: m.percentage })));
  };

  const updateMemberName = (id: string, name: string) => {
    setMembers(members.map((m) => (m.id === id ? { ...m, name } : m)));
  };

  const updateMemberPercent = (id: string, pct: number) => {
    const updated = members.map((m) => (m.id === id ? { ...m, percentage: pct } : m));
    const num = parseFloat(totalAmount) || 0;
    const recomputed = calculateBillSplits(num, 'custom', updated);
    setMembers(recomputed.map((m, idx) => ({ ...updated[idx], amount: m.amount })));
  };

  // WhatsApp formatted share text
  const getShareText = () => {
    const upiVpa = profile.upiId || 'myupi@okhdfcbank';
    let text = `*BudgetMitra Bill Split: ${title}*\nTotal Bill: ₹${totalAmount}\n\n*Amount Due per person:*\n`;

    members.forEach((m) => {
      const upiUrl = generateUpiLink(upiVpa, profile.name, m.amount, `${title} - ${m.name}`);
      text += `• ${m.name}: *₹${m.amount.toFixed(2)}*\n  Pay UPI: ${upiUrl}\n\n`;
    });

    text += `Please settle directly via UPI to: ${upiVpa}\nShared with BudgetMitra on-device student app.`;
    return text;
  };

  const handleShareWhatsApp = async () => {
    const text = getShareText();
    await NativeBridgeService.shareViaWhatsApp(text);
  };

  const handleSharePdf = () => {
    const billObj: BillSplit = {
      id: `split_${Date.now()}`,
      title,
      totalAmount: parseFloat(totalAmount) || 0,
      date: new Date().toISOString().split('T')[0],
      splitType,
      members,
      myShare: members[0]?.amount || 0,
      createdAt: Date.now()
    };

    generateSplitBillPdf(billObj, profile.upiId || '');
  };

  const handleLogMyShare = () => {
    const myShare = members[0]?.amount || 0;
    if (myShare > 0) {
      addTransaction({
        amount: myShare,
        category: 'Food',
        type: 'debit',
        note: `My share of ${title}`,
        merchant: 'Bill Split',
        source: 'split',
        date: new Date().toISOString().split('T')[0]
      });
      setHasLoggedMyShare(true);
      alert(t.split.loggedSuccessfully);
    }
  };

  const handleReceiptUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setReceiptImageName(file.name);
      // Simulate automatic line-item detection: e.g. set bill to 750
      setTotalAmount('750');
      handleTotalChange('750');
      alert(`Receipt attached: ${file.name}. Total extracted: ₹750.`);
    }
  };

  return (
    <div className="space-y-4 pb-24">
      {/* Title */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300">
            UPI & WhatsApp
          </span>
        </div>
        <h2 className="font-heading font-extrabold text-2xl text-slate-800 dark:text-white">
          {t.split.title}
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          {t.split.headline}
        </p>
      </div>

      {/* Bill Details Input */}
      <div className="glass-card p-5 space-y-3.5">
        <div>
          <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
            {t.split.billTitle}
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-white font-bold focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
              {t.split.totalAmount}
            </label>
            <input
              type="number"
              step="0.01"
              value={totalAmount}
              onChange={(e) => handleTotalChange(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-lg font-extrabold font-heading text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
              {t.split.splitType}
            </label>
            <div className="grid grid-cols-2 gap-1.5 pt-0.5">
              <button
                type="button"
                onClick={() => handleSplitTypeChange('equal')}
                className={`py-2 rounded-xl text-xs font-bold transition-all ${
                  splitType === 'equal'
                    ? 'bg-teal-600 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                Equal
              </button>
              <button
                type="button"
                onClick={() => handleSplitTypeChange('custom')}
                className={`py-2 rounded-xl text-xs font-bold transition-all ${
                  splitType === 'custom'
                    ? 'bg-teal-600 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                Custom %
              </button>
            </div>
          </div>
        </div>

        {/* Receipt Upload button */}
        <div className="pt-2">
          <label className="flex items-center justify-center gap-2 p-3 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 hover:border-teal-500 cursor-pointer transition-colors bg-slate-50/50 dark:bg-slate-800/30">
            <Camera className="w-4 h-4 text-teal-600" />
            <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
              {receiptImageName ? `Attached: ${receiptImageName}` : t.split.uploadReceipt}
            </span>
            <input
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleReceiptUpload}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {/* Friends & Split Breakdown List */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Friends in this Bill ({members.length})
          </h3>
          <button
            onClick={addFriend}
            className="flex items-center gap-1 text-xs font-bold text-teal-600 hover:underline"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{t.split.addFriend}</span>
          </button>
        </div>

        <div className="space-y-2">
          {members.map((member, idx) => (
            <div
              key={member.id}
              className="glass-card p-3.5 flex items-center justify-between gap-3"
            >
              <div className="flex-1 flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-300 font-bold text-xs flex items-center justify-center shrink-0">
                  {idx + 1}
                </div>
                <input
                  type="text"
                  value={member.name}
                  onChange={(e) => updateMemberName(member.id, e.target.value)}
                  className="px-2.5 py-1 text-xs font-bold rounded-lg bg-transparent border border-transparent hover:border-slate-200 dark:hover:border-slate-700 text-slate-800 dark:text-white focus:bg-white dark:focus:bg-slate-800"
                />
              </div>

              <div className="flex items-center gap-3">
                {splitType === 'custom' && (
                  <div className="flex items-center gap-1 w-20">
                    <input
                      type="number"
                      value={member.percentage}
                      onChange={(e) => updateMemberPercent(member.id, parseFloat(e.target.value) || 0)}
                      className="w-12 px-1.5 py-1 text-xs text-right rounded bg-slate-100 dark:bg-slate-800 font-bold"
                    />
                    <span className="text-xs text-slate-400">%</span>
                  </div>
                )}
                <p className="font-heading font-extrabold text-base text-slate-800 dark:text-white w-20 text-right">
                  ₹{member.amount.toFixed(2)}
                </p>
                {members.length > 1 && (
                  <button
                    onClick={() => removeMember(member.id)}
                    className="p-1 rounded text-slate-400 hover:text-rose-500"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Share and Action Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2">
        <button
          onClick={handleShareWhatsApp}
          className="flex items-center justify-center gap-2 py-3 rounded-2xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 active:scale-95 transition-all shadow-md shadow-emerald-700/20"
        >
          <MessageCircle className="w-4 h-4" />
          <span>{t.split.shareWhatsApp}</span>
        </button>

        <button
          onClick={handleSharePdf}
          className="flex items-center justify-center gap-2 py-3 rounded-2xl bg-teal-600 text-white text-xs font-bold hover:bg-teal-700 active:scale-95 transition-all shadow-md shadow-teal-700/20"
        >
          <FileText className="w-4 h-4" />
          <span>{t.split.sharePdf}</span>
        </button>

        <button
          onClick={handleLogMyShare}
          disabled={hasLoggedMyShare}
          className="flex items-center justify-center gap-2 py-3 rounded-2xl bg-slate-800 dark:bg-slate-700 text-white text-xs font-bold hover:bg-slate-900 active:scale-95 transition-all disabled:opacity-50"
        >
          <Wallet className="w-4 h-4 text-teal-400" />
          <span>{hasLoggedMyShare ? 'Share Logged' : t.split.logMyShare}</span>
        </button>
      </div>

      <div className="p-3 rounded-xl bg-teal-50 dark:bg-teal-950/40 border border-teal-100 dark:border-teal-900/60 text-xs text-teal-900 dark:text-teal-200">
        <p className="font-semibold">{t.split.upiNotice}</p>
        <p className="text-[11px] text-teal-700 dark:text-teal-400 mt-0.5">
          Receiving UPI ID configured: {profile.upiId || 'amansharma@oksbi'} (update anytime in Settings).
        </p>
      </div>
    </div>
  );
};
