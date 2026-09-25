import React, { useState } from 'react';
import { Search, Plus, ArrowUpRight, ArrowDownLeft, Trash2, Filter } from 'lucide-react';
import { Person, Transaction, TransactionType } from '../types';
import { formatRupee } from '../utils/calculator';

interface TransactionsViewProps {
  transactions: Transaction[];
  people: Person[];
  onOpenAddTransaction: () => void;
  onDeleteTransaction: (tx: Transaction) => void;
  isDarkMode: boolean;
}

export const TransactionsView: React.FC<TransactionsViewProps> = ({
  transactions,
  people,
  onOpenAddTransaction,
  onDeleteTransaction,
  isDarkMode,
}) => {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');

  const filteredTransactions = transactions
    .filter((tx) => {
      const person = people.find((p) => p.id === tx.personId);
      const matchesSearch =
        tx.description.toLowerCase().includes(search.toLowerCase()) ||
        tx.paymentMethod.toLowerCase().includes(search.toLowerCase()) ||
        (person && person.name.toLowerCase().includes(search.toLowerCase()));

      if (!matchesSearch) return false;

      if (typeFilter !== 'ALL' && tx.type !== typeFilter) {
        return false;
      }
      return true;
    })
    .sort((a, b) => b.date - a.date);

  const totalVolume = filteredTransactions.reduce((acc, curr) => acc + curr.amount, 0);

  return (
    <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 pb-20">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight">Ledger Transactions</h2>
          <p className="text-xs text-neutral-400">Complete immutable record of all funds</p>
        </div>
        <button
          onClick={onOpenAddTransaction}
          className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center gap-1.5 shadow-sm transition-all active:scale-95"
        >
          <Plus size={14} />
          <span>New Entry</span>
        </button>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search
          size={16}
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400"
        />
        <input
          type="text"
          placeholder="Search by contact, description, or payment method..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className={`w-full pl-9 pr-4 py-2.5 rounded-2xl text-xs border transition-colors ${
            isDarkMode
              ? 'bg-[#181A20] border-neutral-800 text-neutral-100 placeholder:text-neutral-500'
              : 'bg-white border-neutral-200 text-neutral-900 placeholder:text-neutral-400'
          }`}
        />
      </div>

      {/* Filter Type Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
        {[
          { id: 'ALL', label: 'All Entries' },
          { id: 'LEND', label: 'Lent' },
          { id: 'BORROW', label: 'Borrowed' },
          { id: 'PAYMENT_RECEIVED', label: 'Received' },
          { id: 'PAYMENT_MADE', label: 'Repaid' },
          { id: 'INTEREST', label: 'Interest' },
        ].map((f) => (
          <button
            key={f.id}
            onClick={() => setTypeFilter(f.id)}
            className={`px-3 py-1 rounded-xl whitespace-nowrap font-medium transition-all ${
              typeFilter === f.id
                ? 'bg-emerald-500 text-white shadow-sm font-semibold'
                : isDarkMode
                ? 'bg-neutral-800/80 text-neutral-400 hover:text-neutral-200'
                : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Metrics Banner */}
      <div className="flex items-center justify-between text-[11px] text-neutral-400 px-1">
        <span>Showing {filteredTransactions.length} transactions</span>
        <span>
          Total Volume: <strong className="text-emerald-400 font-mono">{formatRupee(totalVolume)}</strong>
        </span>
      </div>

      {/* Transactions List */}
      <div className="space-y-2">
        {filteredTransactions.map((tx) => {
          const person = people.find((p) => p.id === tx.personId);
          const isCredit = tx.type === 'LEND' || tx.type === 'INTEREST';
          const dateStr = new Date(tx.date).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
          });

          return (
            <div
              key={tx.id}
              className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between ${
                isDarkMode ? 'bg-[#181A20] border-neutral-800/80' : 'bg-white border-neutral-200'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className={`p-2.5 rounded-xl text-xs font-bold shrink-0 ${
                    isCredit
                      ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20'
                      : 'bg-rose-500/15 text-rose-400 border border-rose-500/20'
                  }`}
                >
                  {isCredit ? <ArrowUpRight size={18} /> : <ArrowDownLeft size={18} />}
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-neutral-100 truncate">
                      {person?.name || 'Contact'}
                    </span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded font-semibold bg-neutral-800 text-neutral-400 border border-neutral-700/60">
                      {tx.type.replace('_', ' ')}
                    </span>
                  </div>

                  <div className="text-xs text-neutral-400 truncate mt-0.5">
                    {tx.description}
                  </div>

                  <div className="flex items-center gap-2 text-[10px] text-neutral-500 mt-0.5">
                    <span>{dateStr}</span>
                    <span>•</span>
                    <span>{tx.paymentMethod}</span>
                    {tx.interestRate && tx.interestRate > 0 && (
                      <span>• {tx.interestRate}% Interest</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <div className="text-right">
                  <div
                    className={`text-sm font-extrabold font-mono ${
                      isCredit ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {isCredit ? '+' : '-'}
                    {formatRupee(tx.amount)}
                  </div>
                </div>

                <button
                  onClick={() => onDeleteTransaction(tx)}
                  className="p-1.5 rounded-lg text-neutral-500 hover:text-rose-400 hover:bg-neutral-800 transition-colors"
                  title="Delete Entry"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          );
        })}

        {filteredTransactions.length === 0 && (
          <div className="p-8 text-center rounded-2xl border border-neutral-800/80 bg-neutral-900/30">
            <p className="text-xs text-neutral-400">No transactions found matching criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
};
