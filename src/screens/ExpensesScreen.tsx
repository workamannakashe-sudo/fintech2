import React, { useState } from 'react';
import Papa from 'papaparse';
import {
  Plus,
  Upload,
  AlertTriangle,
  Trash2,
  Edit2,
  X,
  Search
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { getTranslation } from '../i18n/translations';
import { ExpenseCategory, Transaction } from '../types';
import { categorizeByKeywords } from '../services/smsParser';

const CATEGORIES: ExpenseCategory[] = [
  'Housing',
  'Food',
  'Books/Tuition',
  'Entertainment',
  'Transport',
  'Shopping',
  'Health',
  'Misc'
];

export const ExpensesScreen: React.FC = () => {
  const {
    transactions,
    addTransaction,
    editTransaction,
    deleteTransaction,
    language
  } = useApp();
  const t = getTranslation(language);

  // States
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isCsvModalOpen, setIsCsvModalOpen] = useState<boolean>(false);
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);

  // Form Fields
  const [amount, setAmount] = useState<string>('');
  const [category, setCategory] = useState<ExpenseCategory>('Food');
  const [note, setNote] = useState<string>('');
  const [merchant, setMerchant] = useState<string>('');
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);

  // Handle Note / Merchant change with offline auto-categorization
  const handleNoteChange = (val: string) => {
    setNote(val);
    const guessed = categorizeByKeywords(val, merchant);
    if (guessed !== 'Misc') {
      setCategory(guessed);
    }
  };

  const handleMerchantChange = (val: string) => {
    setMerchant(val);
    const guessed = categorizeByKeywords(note, val);
    if (guessed !== 'Misc') {
      setCategory(guessed);
    }
  };

  const openAddModal = () => {
    setEditingTx(null);
    setAmount('');
    setCategory('Food');
    setNote('');
    setMerchant('');
    setDate(new Date().toISOString().split('T')[0]);
    setIsModalOpen(true);
  };

  const openEditModal = (tx: Transaction) => {
    setEditingTx(tx);
    setAmount(tx.amount.toString());
    setCategory(tx.category);
    setNote(tx.note || '');
    setMerchant(tx.merchant || '');
    setDate(tx.date);
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      alert('Please enter a valid amount.');
      return;
    }

    if (editingTx) {
      editTransaction({
        ...editingTx,
        amount: numAmount,
        category,
        note,
        merchant: merchant || 'Expense',
        date
      });
    } else {
      addTransaction({
        amount: numAmount,
        category,
        type: 'debit',
        note,
        merchant: merchant || 'Expense',
        source: 'manual',
        date
      });
    }

    setIsModalOpen(false);
  };

  // CSV Bulk Import Handler
  const handleCsvUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        let count = 0;
        const rows = results.data as Array<Record<string, string>>;
        rows.forEach((row) => {
          // Normalize header keys
          const amtVal = parseFloat(row.amount || row.Amount || row.Debit || row.debit || '0');
          if (!isNaN(amtVal) && amtVal > 0) {
            const rawDesc = row.note || row.Description || row.Narration || row.merchant || row.Merchant || 'CSV Import';
            const rawCat = (row.category || row.Category || categorizeByKeywords(rawDesc)) as ExpenseCategory;
            const rawDate = row.date || row.Date || new Date().toISOString().split('T')[0];

            addTransaction({
              amount: amtVal,
              category: CATEGORIES.includes(rawCat) ? rawCat : 'Misc',
              type: 'debit',
              note: rawDesc,
              merchant: row.merchant || row.Merchant || rawDesc,
              source: 'statement',
              date: rawDate
            });
            count++;
          }
        });

        alert(`Successfully imported ${count} expenses from CSV!`);
        setIsCsvModalOpen(false);
      },
      error: () => {
        alert('Could not parse CSV file. Please ensure it has columns: amount, category, note, date.');
      }
    });
  };

  // Filtered transactions
  const filtered = transactions.filter((tx) => {
    if (selectedCategory !== 'All' && tx.category !== selectedCategory) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchNote = (tx.note || '').toLowerCase().includes(q);
      const matchMerchant = (tx.merchant || '').toLowerCase().includes(q);
      if (!matchNote && !matchMerchant) return false;
    }
    return true;
  });

  return (
    <div className="space-y-4 pb-24">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div>
          <h2 className="font-heading font-extrabold text-2xl text-slate-800 dark:text-white">
            {t.expenses.title}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {transactions.length} total student expenses logged
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsCsvModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-200 transition-all"
            title="Import expenses from CSV"
          >
            <Upload className="w-4 h-4" />
            <span>CSV</span>
          </button>

          <button
            onClick={openAddModal}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-teal-600 text-white text-xs font-bold hover:bg-teal-700 active:scale-95 transition-all shadow-md shadow-teal-700/20"
          >
            <Plus className="w-4 h-4" />
            <span>{t.expenses.addExpense}</span>
          </button>
        </div>
      </div>

      {/* Search Bar & Category Filter Pills */}
      <div className="space-y-2">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by merchant, chai, mess, books..."
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
          <button
            onClick={() => setSelectedCategory('All')}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold shrink-0 transition-all ${
              selectedCategory === 'All'
                ? 'bg-teal-600 text-white'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
            }`}
          >
            {t.expenses.filterAll}
          </button>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold shrink-0 transition-all ${
                selectedCategory === cat
                  ? 'bg-teal-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Transactions List */}
      {filtered.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <p className="text-sm font-medium text-slate-400">
            {t.expenses.noResults}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((tx) => (
            <div
              key={tx.id}
              className="glass-card p-3.5 flex items-center justify-between gap-3 hover:border-teal-500 transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-950/70 text-teal-700 dark:text-teal-300 font-heading font-extrabold flex items-center justify-center shrink-0">
                  {tx.category.charAt(0)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-bold text-slate-800 dark:text-white leading-tight">
                      {tx.merchant}
                    </p>
                    {tx.isAnomaly && (
                      <span
                        className="flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300"
                        title={tx.anomalyReason || t.expenses.anomalyText}
                      >
                        <AlertTriangle className="w-3 h-3" />
                        Spike
                      </span>
                    )}
                  </div>
                  {tx.note && tx.note !== tx.merchant && (
                    <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-1">
                      {tx.note}
                    </p>
                  )}
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {tx.date} • {tx.category} • {tx.source.toUpperCase()}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <p className="font-heading font-extrabold text-base text-slate-800 dark:text-white">
                  -₹{tx.amount.toLocaleString('en-IN')}
                </p>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => openEditModal(tx)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-teal-600 transition-colors"
                    title={t.expenses.editExpense}
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => deleteTransaction(tx.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 transition-colors"
                    title={t.expenses.delete}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Expense Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 animate-fadeIn">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-heading font-bold text-lg text-slate-800 dark:text-white">
                {editingTx ? t.expenses.editExpense : t.expenses.addExpense}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                  {t.expenses.amount} *
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="e.g. 150"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white font-heading font-extrabold text-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                  {t.expenses.note} (Auto-categorizes!)
                </label>
                <input
                  type="text"
                  value={note}
                  onChange={(e) => handleNoteChange(e.target.value)}
                  placeholder="e.g. Samosa & chai at college canteen"
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                  {t.expenses.merchant}
                </label>
                <input
                  type="text"
                  value={merchant}
                  onChange={(e) => handleMerchantChange(e.target.value)}
                  placeholder="e.g. Campus Canteen / Swiggy / Metro"
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                    {t.expenses.category}
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

                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                    {t.expenses.date}
                  </label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                  </input>
                </div>
              </div>

              <div className="pt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-200"
                >
                  {t.expenses.cancel}
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-teal-600 text-white text-xs font-bold hover:bg-teal-700 shadow-md shadow-teal-700/20"
                >
                  {t.expenses.save}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CSV Bulk Upload Modal */}
      {isCsvModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 text-center">
            <Upload className="w-10 h-10 text-teal-600 mx-auto mb-2" />
            <h3 className="font-heading font-bold text-base text-slate-800 dark:text-white mb-1">
              {t.expenses.bulkCsv}
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Select a CSV file containing columns like amount, category, note, and date.
            </p>

            <input
              type="file"
              accept=".csv"
              onChange={handleCsvUpload}
              className="text-xs file:mr-2 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100 mb-4"
            />

            <button
              onClick={() => setIsCsvModalOpen(false)}
              className="w-full py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold"
            >
              {t.expenses.cancel}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
