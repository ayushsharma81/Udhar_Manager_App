import React, { useState } from 'react';
import { X, CheckCircle, ShieldCheck, AlertCircle } from 'lucide-react';
import confetti from 'canvas-confetti';
import { Person, Transaction } from '../types';
import { calculatePersonBalance, formatRupee } from '../utils/calculator';

interface SettlementModalProps {
  isOpen: boolean;
  onClose: () => void;
  person: Person;
  transactions: Transaction[];
  onConfirmSettlement: (finalAmount: number, notes: string) => void;
  isDarkMode: boolean;
}

export const SettlementModal: React.FC<SettlementModalProps> = ({
  isOpen,
  onClose,
  person,
  transactions,
  onConfirmSettlement,
  isDarkMode,
}) => {
  if (!isOpen) return null;

  const [notes, setNotes] = useState('');
  const summary = calculatePersonBalance(person.id, transactions, false);
  const outstandingAmount =
    summary.outstandingOwedToUser > 0
      ? summary.outstandingOwedToUser
      : summary.liabilityOwedByUser;

  const isOwedToUser = summary.outstandingOwedToUser > 0;

  const handleSettle = () => {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
    });
    onConfirmSettlement(outstandingAmount, notes);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div
        className={`w-full max-w-md rounded-3xl p-5 shadow-2xl border transition-all animate-in zoom-in-95 duration-200 ${
          isDarkMode
            ? 'bg-[#181A20] border-neutral-800 text-neutral-100'
            : 'bg-white border-neutral-200 text-neutral-900'
        }`}
      >
        <div className="flex items-center justify-between pb-3 border-b border-neutral-200 dark:border-neutral-800">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-emerald-500/15 text-emerald-400">
              <ShieldCheck size={18} />
            </div>
            <div>
              <h3 className="font-bold text-lg">Account Settlement</h3>
              <p className="text-xs text-neutral-400">{person.name}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-full text-neutral-400 hover:text-neutral-100">
            <X size={18} />
          </button>
        </div>

        <div className="py-4 space-y-3.5">
          {/* Summary Breakdown */}
          <div className="p-3.5 rounded-2xl bg-neutral-900/60 border border-neutral-800 space-y-2 text-xs font-medium">
            <div className="flex items-center justify-between text-neutral-400">
              <span>Money Lent</span>
              <span className="font-mono text-emerald-400 font-semibold">{formatRupee(summary.totalLent)}</span>
            </div>
            <div className="flex items-center justify-between text-neutral-400">
              <span>Money Received</span>
              <span className="font-mono text-blue-400 font-semibold">{formatRupee(summary.totalReceived)}</span>
            </div>
            {summary.totalInterestAccrued > 0 && (
              <div className="flex items-center justify-between text-neutral-400">
                <span>Interest Accrued</span>
                <span className="font-mono text-amber-400 font-semibold">+{formatRupee(summary.totalInterestAccrued)}</span>
              </div>
            )}
            {summary.totalBorrowed > 0 && (
              <div className="flex items-center justify-between text-neutral-400">
                <span>Money Borrowed</span>
                <span className="font-mono text-rose-400 font-semibold">{formatRupee(summary.totalBorrowed)}</span>
              </div>
            )}
            {summary.totalRepaid > 0 && (
              <div className="flex items-center justify-between text-neutral-400">
                <span>Money Repaid</span>
                <span className="font-mono text-emerald-400 font-semibold">{formatRupee(summary.totalRepaid)}</span>
              </div>
            )}

            <div className="pt-2 border-t border-neutral-800 flex items-center justify-between text-sm font-bold">
              <span>Final Outstanding:</span>
              <span className={`text-base font-mono ${isOwedToUser ? 'text-emerald-400' : 'text-rose-400'}`}>
                {formatRupee(outstandingAmount)}
              </span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/25 text-amber-300 text-xs flex items-start gap-2">
            <AlertCircle size={16} className="shrink-0 mt-0.5" />
            <span>
              All historical transactions will remain completely preserved in the ledger. The account balance will be marked as <strong>₹0 Settled</strong>.
            </span>
          </div>

          <div>
            <label className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider block mb-1">
              Settlement Closing Note (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Paid in full via cash / UPI"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className={`w-full px-3 py-2 rounded-xl text-xs border ${
                isDarkMode ? 'bg-neutral-900 border-neutral-700 text-white' : 'bg-neutral-50 border-neutral-200'
              }`}
            />
          </div>

          <button
            type="button"
            onClick={handleSettle}
            className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-lg shadow-emerald-950/40 active:scale-[0.99] transition-all flex items-center justify-center gap-2"
          >
            <CheckCircle size={18} />
            <span>Mark as Settled ({formatRupee(outstandingAmount)})</span>
          </button>
        </div>
      </div>
    </div>
  );
};
