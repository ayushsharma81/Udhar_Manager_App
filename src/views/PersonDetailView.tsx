import React, { useState } from 'react';
import { ArrowLeft, Phone, Share2, Download, Bell, Plus, CheckCircle2, ShieldCheck, ArrowUpRight, ArrowDownLeft, Trash2, Calendar, MessageSquare, AlertCircle } from 'lucide-react';
import { Person, Transaction, TransactionType } from '../types';
import { calculatePersonBalance, formatRupee } from '../utils/calculator';
import { generatePersonStatementPdf } from '../utils/pdfExport';

interface PersonDetailViewProps {
  person: Person;
  transactions: Transaction[];
  onBack: () => void;
  onSendReminder: (person: Person, amount: number, dueDate?: number | null) => void;
  onOpenAddTransaction: (type: TransactionType, personId: string) => void;
  onOpenSettlement: (person: Person) => void;
  onDeleteTransaction: (tx: Transaction) => void;
  onDeletePerson: (person: Person) => void;
  isDarkMode: boolean;
}

export const PersonDetailView: React.FC<PersonDetailViewProps> = ({
  person,
  transactions,
  onBack,
  onSendReminder,
  onOpenAddTransaction,
  onOpenSettlement,
  onDeleteTransaction,
  onDeletePerson,
  isDarkMode,
}) => {
  const [shareSuccess, setShareSuccess] = useState(false);

  const summary = calculatePersonBalance(person.id, transactions, person.isSettled);
  const personTxs = transactions
    .filter((tx) => tx.personId === person.id)
    .sort((a, b) => b.date - a.date);

  const dueTx = personTxs.find((tx) => tx.dueDate != null && tx.dueDate > 0);
  const dueDate = dueTx?.dueDate;

  const isTheyOweMe = summary.outstandingOwedToUser > 0;
  const isIOweThem = summary.liabilityOwedByUser > 0;
  const mainBalance = isTheyOweMe ? summary.outstandingOwedToUser : summary.liabilityOwedByUser;

  const handleShareStatement = async () => {
    const textStatement = `UDHAR MANAGER LEDGER: ${person.name}
Total Lent: ${formatRupee(summary.totalLent)}
Total Received: ${formatRupee(summary.totalReceived)}
Interest: +${formatRupee(summary.totalInterestAccrued)}
Current Outstanding: ${formatRupee(mainBalance)}
Status: ${person.isSettled ? 'SETTLED' : 'ACTIVE'}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: `Udhar Statement - ${person.name}`,
          text: textStatement,
        });
        setShareSuccess(true);
        setTimeout(() => setShareSuccess(false), 2000);
      } catch {
        // user cancelled share
      }
    } else {
      navigator.clipboard.writeText(textStatement);
      setShareSuccess(true);
      setTimeout(() => setShareSuccess(false), 2000);
    }
  };

  const handleExportPdf = () => {
    generatePersonStatementPdf(person, transactions);
  };

  return (
    <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4 pb-20">
      {/* Top Android App Bar Back Nav */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs font-semibold text-neutral-400 hover:text-neutral-100 transition-colors"
        >
          <ArrowLeft size={16} />
          <span>Back to People</span>
        </button>

        <div className="flex items-center gap-1.5">
          <button
            onClick={handleShareStatement}
            className="p-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 transition-colors text-xs flex items-center gap-1"
            title="Share Statement"
          >
            <Share2 size={15} />
            <span className="hidden sm:inline">{shareSuccess ? 'Copied!' : 'Share'}</span>
          </button>
          <button
            onClick={handleExportPdf}
            className="p-2 rounded-xl bg-emerald-600/90 hover:bg-emerald-500 text-white transition-colors text-xs flex items-center gap-1 font-semibold"
            title="Export PDF Statement"
          >
            <Download size={15} />
            <span>Export PDF</span>
          </button>
        </div>
      </div>

      {/* Person Profile Header */}
      <div
        className={`p-4 rounded-3xl border transition-all ${
          isDarkMode ? 'bg-[#181A20] border-neutral-800' : 'bg-white border-neutral-200'
        }`}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/25 flex items-center justify-center text-xl font-bold">
              {person.name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold">{person.name}</h2>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold bg-neutral-800 text-neutral-400 border border-neutral-700">
                  {person.category}
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-neutral-400 mt-0.5">
                <Phone size={12} />
                <span>{person.phone}</span>
                <span>•</span>
                <span className="uppercase text-[10px] text-emerald-500 font-semibold">
                  {person.defaultLanguage} SMS
                </span>
              </div>
            </div>
          </div>

          {person.isSettled ? (
            <span className="px-2.5 py-1 rounded-full bg-neutral-800 text-emerald-400 border border-emerald-500/30 text-xs font-bold flex items-center gap-1">
              <CheckCircle2 size={13} />
              <span>Settled</span>
            </span>
          ) : (
            <button
              onClick={() => onOpenSettlement(person)}
              className="px-2.5 py-1 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-semibold border border-neutral-700"
            >
              Settle Account
            </button>
          )}
        </div>

        {/* Big Balance Banner */}
        <div className="mt-4 pt-4 border-t border-neutral-800 flex items-center justify-between">
          <div>
            <div className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">
              {person.isSettled
                ? 'Account Status'
                : isTheyOweMe
                ? 'They owe you'
                : isIOweThem
                ? 'You owe them'
                : 'Zero Balance'}
            </div>
            <div
              className={`text-2xl font-extrabold font-mono mt-0.5 ${
                person.isSettled
                  ? 'text-neutral-400'
                  : isTheyOweMe
                  ? 'text-emerald-400'
                  : isIOweThem
                  ? 'text-rose-400'
                  : 'text-neutral-400'
              }`}
            >
              {person.isSettled ? '₹0 (Settled)' : formatRupee(mainBalance)}
            </div>
          </div>

          {dueDate && !person.isSettled && (
            <div className="text-right">
              <div className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
                Due Date
              </div>
              <div className="text-xs font-bold text-amber-400 mt-0.5">
                {new Date(dueDate).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'short',
                })}
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons Row */}
        <div className="grid grid-cols-3 gap-2 mt-4">
          <button
            onClick={() => onSendReminder(person, mainBalance, dueDate)}
            className="py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all active:scale-95"
          >
            <Bell size={13} />
            <span>Reminder</span>
          </button>

          <button
            onClick={() => onOpenAddTransaction('PAYMENT_RECEIVED', person.id)}
            className="py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all active:scale-95"
          >
            <CheckCircle2 size={13} />
            <span>Receive</span>
          </button>

          <button
            onClick={() => onOpenAddTransaction('LEND', person.id)}
            className="py-2 px-3 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-semibold text-xs flex items-center justify-center gap-1.5 border border-neutral-700 transition-all active:scale-95"
          >
            <Plus size={13} />
            <span>Add Tx</span>
          </button>
        </div>
      </div>

      {/* Financial Summary 4-box Grid */}
      <div>
        <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-2 px-1">
          Financial Summary
        </h3>
        <div className="grid grid-cols-4 gap-1.5">
          <div
            className={`p-2.5 rounded-2xl border text-center ${
              isDarkMode ? 'bg-[#181A20] border-neutral-800' : 'bg-white border-neutral-200'
            }`}
          >
            <div className="text-[10px] text-neutral-400 font-medium">Lent</div>
            <div className="text-xs font-bold font-mono text-emerald-400 mt-1">
              {formatRupee(summary.totalLent)}
            </div>
          </div>
          <div
            className={`p-2.5 rounded-2xl border text-center ${
              isDarkMode ? 'bg-[#181A20] border-neutral-800' : 'bg-white border-neutral-200'
            }`}
          >
            <div className="text-[10px] text-neutral-400 font-medium">Received</div>
            <div className="text-xs font-bold font-mono text-blue-400 mt-1">
              {formatRupee(summary.totalReceived)}
            </div>
          </div>
          <div
            className={`p-2.5 rounded-2xl border text-center ${
              isDarkMode ? 'bg-[#181A20] border-neutral-800' : 'bg-white border-neutral-200'
            }`}
          >
            <div className="text-[10px] text-neutral-400 font-medium">Interest</div>
            <div className="text-xs font-bold font-mono text-amber-400 mt-1">
              +{formatRupee(summary.totalInterestAccrued)}
            </div>
          </div>
          <div
            className={`p-2.5 rounded-2xl border text-center ${
              isDarkMode ? 'bg-[#181A20] border-neutral-800' : 'bg-white border-neutral-200'
            }`}
          >
            <div className="text-[10px] text-neutral-400 font-medium">Outstanding</div>
            <div className="text-xs font-bold font-mono text-emerald-400 mt-1">
              {formatRupee(mainBalance)}
            </div>
          </div>
        </div>
      </div>

      {/* Transaction History Ledger */}
      <div>
        <div className="flex items-center justify-between mb-2 px-1">
          <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400">
            Transaction History ({personTxs.length})
          </h3>
        </div>

        <div className="space-y-1.5">
          {personTxs.map((tx) => {
            const isCredit = tx.type === 'LEND' || tx.type === 'INTEREST';
            const dateStr = new Date(tx.date).toLocaleDateString('en-IN', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            });

            return (
              <div
                key={tx.id}
                className={`p-3 rounded-2xl border flex items-center justify-between transition-colors ${
                  isDarkMode ? 'bg-[#181A20] border-neutral-800' : 'bg-white border-neutral-200'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className={`p-2 rounded-xl text-xs font-bold shrink-0 ${
                      isCredit
                        ? 'bg-emerald-500/15 text-emerald-400'
                        : 'bg-rose-500/15 text-rose-400'
                    }`}
                  >
                    {isCredit ? <ArrowUpRight size={16} /> : <ArrowDownLeft size={16} />}
                  </div>

                  <div className="min-w-0">
                    <div className="text-xs font-bold text-neutral-200 truncate">
                      {tx.description || tx.type.replace('_', ' ')}
                    </div>
                    <div className="text-[10px] text-neutral-400 flex items-center gap-1.5 mt-0.5">
                      <span>{dateStr}</span>
                      <span>•</span>
                      <span>{tx.paymentMethod}</span>
                      {tx.interestRate && tx.interestRate > 0 && (
                        <span>• {tx.interestRate}% interest</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-right">
                    <div
                      className={`text-xs font-bold font-mono ${
                        isCredit ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {isCredit ? '+' : '-'}
                      {formatRupee(tx.amount)}
                    </div>
                    <div className="text-[10px] text-neutral-500 font-medium">
                      {tx.type.replace('_', ' ')}
                    </div>
                  </div>

                  <button
                    onClick={() => onDeleteTransaction(tx)}
                    className="p-1 rounded-lg text-neutral-500 hover:text-rose-400 hover:bg-neutral-800 transition-colors"
                    title="Delete Transaction"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            );
          })}

          {personTxs.length === 0 && (
            <div className="p-4 rounded-2xl text-center text-xs text-neutral-400 border border-neutral-800 bg-neutral-900/30">
              No transactions recorded for this contact yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
