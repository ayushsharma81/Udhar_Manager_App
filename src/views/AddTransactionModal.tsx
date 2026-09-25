import React, { useState } from 'react';
import { X, ArrowUpRight, ArrowDownLeft, CheckCircle2, CreditCard, Percent, Calendar, IndianRupee, AlertCircle } from 'lucide-react';
import { InterestPeriod, PaymentMethod, Person, TransactionType } from '../types';
import { computeInterestAmount, formatRupee } from '../utils/calculator';

interface AddTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  people: Person[];
  preselectedPersonId?: string;
  initialType?: TransactionType;
  onSaveTransaction: (tx: {
    personId: string;
    type: TransactionType;
    amount: number;
    description: string;
    paymentMethod: PaymentMethod;
    interestRate?: number;
    interestPeriod?: InterestPeriod;
    dueDate?: number | null;
  }) => void;
  isDarkMode: boolean;
}

export const AddTransactionModal: React.FC<AddTransactionModalProps> = ({
  isOpen,
  onClose,
  people,
  preselectedPersonId,
  initialType = 'LEND',
  onSaveTransaction,
  isDarkMode,
}) => {
  if (!isOpen) return null;

  const [personId, setPersonId] = useState(preselectedPersonId || people[0]?.id || '');
  const [type, setType] = useState<TransactionType>(initialType);
  const [amountStr, setAmountStr] = useState('');
  const [description, setDescription] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('UPI');
  const [showInterest, setShowInterest] = useState(false);
  const [interestRateStr, setInterestRateStr] = useState('2');
  const [interestPeriod, setInterestPeriod] = useState<InterestPeriod>('MONTHLY');
  const [dueDateOption, setDueDateOption] = useState<'none' | 'tomorrow' | '3days' | '7days' | 'custom'>('none');
  const [customDueDate, setCustomDueDate] = useState('');
  const [error, setError] = useState<string | null>(null);

  const amount = parseFloat(amountStr) || 0;
  const interestRate = parseFloat(interestRateStr) || 0;

  const calculatedInterest = showInterest && amount > 0 && interestRate > 0
    ? computeInterestAmount(amount, interestRate, interestPeriod, 1)
    : 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!personId) {
      setError('Please select a person');
      return;
    }
    if (amount <= 0 || isNaN(amount)) {
      setError('Amount must be greater than ₹0');
      return;
    }

    let computedDueDate: number | null = null;
    const now = Date.now();
    if (dueDateOption === 'tomorrow') {
      computedDueDate = now + 86400000;
    } else if (dueDateOption === '3days') {
      computedDueDate = now + 3 * 86400000;
    } else if (dueDateOption === '7days') {
      computedDueDate = now + 7 * 86400000;
    } else if (dueDateOption === 'custom' && customDueDate) {
      computedDueDate = new Date(customDueDate).getTime();
    }

    onSaveTransaction({
      personId,
      type,
      amount,
      description: description.trim() || getDefaultDescription(type),
      paymentMethod,
      interestRate: showInterest ? interestRate : undefined,
      interestPeriod: showInterest ? interestPeriod : undefined,
      dueDate: computedDueDate,
    });

    onClose();
  };

  const getDefaultDescription = (txType: TransactionType): string => {
    switch (txType) {
      case 'LEND': return 'Money Lent';
      case 'BORROW': return 'Money Borrowed';
      case 'PAYMENT_RECEIVED': return 'Payment Received';
      case 'PAYMENT_MADE': return 'Payment Made';
      case 'INTEREST': return 'Interest Added';
      case 'ADJUSTMENT': return 'Ledger Adjustment';
    }
  };

  const quickAmounts = [500, 1000, 2000, 5000, 10000];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div
        className={`w-full max-w-md max-h-[92vh] rounded-3xl p-5 shadow-2xl border flex flex-col overflow-hidden transition-all animate-in zoom-in-95 duration-200 ${
          isDarkMode
            ? 'bg-[#181A20] border-neutral-800 text-neutral-100'
            : 'bg-white border-neutral-200 text-neutral-900'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-neutral-200 dark:border-neutral-800 shrink-0">
          <h3 className="font-bold text-lg">Record Transaction</h3>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-neutral-400 hover:text-neutral-100"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto py-3 space-y-4 pr-1">
          {error && (
            <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
              <AlertCircle size={15} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Transaction Type Pills */}
          <div>
            <label className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider block mb-1.5">
              Transaction Type
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setType('LEND')}
                className={`p-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 border transition-all ${
                  type === 'LEND'
                    ? 'bg-emerald-500 text-white border-emerald-600 shadow-sm'
                    : 'bg-neutral-800/40 border-neutral-700/60 text-neutral-300 hover:bg-neutral-800'
                }`}
              >
                <ArrowUpRight size={16} />
                <span>Lend (Given)</span>
              </button>

              <button
                type="button"
                onClick={() => setType('BORROW')}
                className={`p-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 border transition-all ${
                  type === 'BORROW'
                    ? 'bg-rose-500 text-white border-rose-600 shadow-sm'
                    : 'bg-neutral-800/40 border-neutral-700/60 text-neutral-300 hover:bg-neutral-800'
                }`}
              >
                <ArrowDownLeft size={16} />
                <span>Borrow (Taken)</span>
              </button>

              <button
                type="button"
                onClick={() => setType('PAYMENT_RECEIVED')}
                className={`p-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 border transition-all ${
                  type === 'PAYMENT_RECEIVED'
                    ? 'bg-blue-500 text-white border-blue-600 shadow-sm'
                    : 'bg-neutral-800/40 border-neutral-700/60 text-neutral-300 hover:bg-neutral-800'
                }`}
              >
                <CheckCircle2 size={16} />
                <span>Receive Payment</span>
              </button>

              <button
                type="button"
                onClick={() => setType('PAYMENT_MADE')}
                className={`p-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 border transition-all ${
                  type === 'PAYMENT_MADE'
                    ? 'bg-amber-500 text-white border-amber-600 shadow-sm'
                    : 'bg-neutral-800/40 border-neutral-700/60 text-neutral-300 hover:bg-neutral-800'
                }`}
              >
                <CreditCard size={16} />
                <span>Make Payment</span>
              </button>
            </div>
          </div>

          {/* Person Selector */}
          <div>
            <label className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider block mb-1">
              Select Person
            </label>
            <select
              value={personId}
              onChange={(e) => setPersonId(e.target.value)}
              className={`w-full p-2.5 rounded-xl text-sm font-medium border transition-colors ${
                isDarkMode
                  ? 'bg-neutral-900 border-neutral-700 text-neutral-100'
                  : 'bg-neutral-50 border-neutral-200 text-neutral-900'
              }`}
            >
              {people.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.phone}) - {p.category}
                </option>
              ))}
            </select>
          </div>

          {/* Amount Input */}
          <div>
            <label className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider block mb-1">
              Amount (₹)
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-lg font-bold text-neutral-400">
                ₹
              </span>
              <input
                type="number"
                placeholder="0"
                min="1"
                step="any"
                value={amountStr}
                onChange={(e) => {
                  setAmountStr(e.target.value);
                  setError(null);
                }}
                className={`w-full pl-8 pr-4 py-2.5 rounded-xl text-lg font-bold tracking-tight border transition-colors ${
                  isDarkMode
                    ? 'bg-neutral-900 border-neutral-700 text-neutral-100 placeholder:text-neutral-600'
                    : 'bg-neutral-50 border-neutral-200 text-neutral-900 placeholder:text-neutral-400'
                }`}
                autoFocus
              />
            </div>

            {/* Quick Amount Buttons */}
            <div className="flex flex-wrap gap-1.5 mt-2">
              {quickAmounts.map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => setAmountStr((prev) => ((parseFloat(prev) || 0) + q).toString())}
                  className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-neutral-800/50 hover:bg-neutral-800 text-emerald-400 border border-neutral-700/60"
                >
                  +{formatRupee(q)}
                </button>
              ))}
            </div>
          </div>

          {/* Payment Method */}
          <div>
            <label className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider block mb-1">
              Payment Method
            </label>
            <div className="grid grid-cols-4 gap-1.5">
              {(['UPI', 'CASH', 'BANK_TRANSFER', 'OTHER'] as PaymentMethod[]).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setPaymentMethod(m)}
                  className={`py-1.5 px-2 rounded-xl text-xs font-medium border text-center transition-all ${
                    paymentMethod === m
                      ? 'bg-emerald-500 text-white border-emerald-600 font-semibold'
                      : 'bg-neutral-800/40 border-neutral-700/60 text-neutral-300'
                  }`}
                >
                  {m.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider block mb-1">
              Notes / Description (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Grocery bill, Emergency loan, GPay transfer"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={`w-full px-3.5 py-2 rounded-xl text-sm border transition-colors ${
                isDarkMode
                  ? 'bg-neutral-900 border-neutral-700 text-neutral-100 placeholder:text-neutral-600'
                  : 'bg-neutral-50 border-neutral-200 text-neutral-900 placeholder:text-neutral-400'
              }`}
            />
          </div>

          {/* Due Date Option */}
          <div>
            <label className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider block mb-1">
              Payment Due Date
            </label>
            <div className="grid grid-cols-4 gap-1.5 mb-2">
              <button
                type="button"
                onClick={() => setDueDateOption('none')}
                className={`py-1.5 rounded-lg text-xs font-medium border ${
                  dueDateOption === 'none'
                    ? 'bg-emerald-500 text-white border-emerald-600'
                    : 'bg-neutral-800/40 border-neutral-700/60 text-neutral-300'
                }`}
              >
                No Due Date
              </button>
              <button
                type="button"
                onClick={() => setDueDateOption('tomorrow')}
                className={`py-1.5 rounded-lg text-xs font-medium border ${
                  dueDateOption === 'tomorrow'
                    ? 'bg-emerald-500 text-white border-emerald-600'
                    : 'bg-neutral-800/40 border-neutral-700/60 text-neutral-300'
                }`}
              >
                Tomorrow
              </button>
              <button
                type="button"
                onClick={() => setDueDateOption('3days')}
                className={`py-1.5 rounded-lg text-xs font-medium border ${
                  dueDateOption === '3days'
                    ? 'bg-emerald-500 text-white border-emerald-600'
                    : 'bg-neutral-800/40 border-neutral-700/60 text-neutral-300'
                }`}
              >
                In 3 Days
              </button>
              <button
                type="button"
                onClick={() => setDueDateOption('custom')}
                className={`py-1.5 rounded-lg text-xs font-medium border ${
                  dueDateOption === 'custom'
                    ? 'bg-emerald-500 text-white border-emerald-600'
                    : 'bg-neutral-800/40 border-neutral-700/60 text-neutral-300'
                }`}
              >
                Custom Date
              </button>
            </div>

            {dueDateOption === 'custom' && (
              <input
                type="date"
                value={customDueDate}
                onChange={(e) => setCustomDueDate(e.target.value)}
                className={`w-full p-2 rounded-xl text-sm border ${
                  isDarkMode ? 'bg-neutral-900 border-neutral-700 text-neutral-100' : 'bg-neutral-50 border-neutral-200'
                }`}
              />
            )}
          </div>

          {/* Optional Interest Section */}
          <div className="pt-1">
            <button
              type="button"
              onClick={() => setShowInterest(!showInterest)}
              className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400 hover:underline"
            >
              <Percent size={14} />
              <span>{showInterest ? '- Hide Interest Calculator' : '+ Configure Optional Interest'}</span>
            </button>

            {showInterest && (
              <div className="mt-2.5 p-3 rounded-2xl bg-emerald-950/20 border border-emerald-800/40 space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] text-neutral-400 block mb-0.5">Rate (%)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={interestRateStr}
                      onChange={(e) => setInterestRateStr(e.target.value)}
                      className="w-full p-1.5 rounded-lg text-xs bg-neutral-900 border border-neutral-700"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-neutral-400 block mb-0.5">Period</label>
                    <select
                      value={interestPeriod}
                      onChange={(e) => setInterestPeriod(e.target.value as InterestPeriod)}
                      className="w-full p-1.5 rounded-lg text-xs bg-neutral-900 border border-neutral-700"
                    >
                      <option value="MONTHLY">Monthly</option>
                      <option value="YEARLY">Yearly</option>
                      <option value="CUSTOM">Custom</option>
                    </select>
                  </div>
                </div>

                {calculatedInterest > 0 && (
                  <div className="text-[11px] text-emerald-400 font-mono flex items-center justify-between pt-1 border-t border-emerald-800/40">
                    <span>Computed 1-Month Interest:</span>
                    <span className="font-bold">+{formatRupee(calculatedInterest)}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </form>

        {/* Footer Submit */}
        <div className="pt-3 border-t border-neutral-200 dark:border-neutral-800 shrink-0">
          <button
            type="button"
            onClick={handleSubmit}
            className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-lg shadow-emerald-950/40 active:scale-[0.99] transition-all"
          >
            Save Transaction ({formatRupee(amount)})
          </button>
        </div>
      </div>
    </div>
  );
};
