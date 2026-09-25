import React from 'react';
import { ArrowUpRight, ArrowDownLeft, CheckCircle2, CreditCard, UserPlus, Clock, Bell, ChevronRight, IndianRupee, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';
import { Person, Transaction, TransactionType } from '../types';
import { calculateDashboardMetrics, calculatePersonBalance, formatRupee } from '../utils/calculator';

interface HomeViewProps {
  people: Person[];
  transactions: Transaction[];
  onOpenAddTransaction: (type?: TransactionType, personId?: string) => void;
  onOpenAddPerson: () => void;
  onOpenPersonDetail: (person: Person) => void;
  onSendReminder: (person: Person, amount: number, dueDate?: number | null) => void;
  onNavigateTab: (tab: 'people' | 'transactions') => void;
  isDarkMode: boolean;
}

export const HomeView: React.FC<HomeViewProps> = ({
  people,
  transactions,
  onOpenAddTransaction,
  onOpenAddPerson,
  onOpenPersonDetail,
  onSendReminder,
  onNavigateTab,
  isDarkMode,
}) => {
  const metrics = calculateDashboardMetrics(people, transactions);

  // Compute upcoming payments due (transactions with dueDate in future or near past)
  const now = Date.now();
  const upcomingList = people
    .map((p) => {
      const summary = calculatePersonBalance(p.id, transactions, p.isSettled);
      const personTxs = transactions.filter((t) => t.personId === p.id);
      const dueTx = personTxs.find((t) => t.dueDate != null && t.dueDate > 0);
      return {
        person: p,
        summary,
        dueTx,
        dueDate: dueTx?.dueDate || null,
      };
    })
    .filter((item) => !item.person.isSettled && (item.summary.outstandingOwedToUser > 0 || item.summary.liabilityOwedByUser > 0))
    .sort((a, b) => (a.dueDate || Infinity) - (b.dueDate || Infinity));

  // Latest 5 transactions
  const recentTransactions = [...transactions]
    .sort((a, b) => b.date - a.date)
    .slice(0, 5);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning 👋';
    if (hour < 17) return 'Good Afternoon ☀️';
    return 'Good Evening 🌙';
  };

  const formatDueDateLabel = (timestamp: number | null) => {
    if (!timestamp) return 'No due date';
    const diffDays = Math.round((timestamp - now) / 86400000);
    if (diffDays === 0) return 'Due Today';
    if (diffDays === 1) return 'Due Tomorrow';
    if (diffDays === -1) return 'Overdue by 1 day';
    if (diffDays < -1) return `Overdue (${Math.abs(diffDays)}d)`;
    return `Due in ${diffDays} days`;
  };

  return (
    <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4 pb-20">
      {/* Top Welcome */}
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs font-semibold text-neutral-400">{getGreeting()}</span>
          <h2 className="text-xl font-bold tracking-tight">Your Udhar Ledger</h2>
        </div>
        <div className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-500 text-[11px] font-semibold border border-emerald-500/20 flex items-center gap-1">
          <ShieldCheck size={13} />
          <span>Offline Room DB</span>
        </div>
      </div>

      {/* Main Net Balance Hero Card */}
      <div className="relative overflow-hidden p-5 rounded-3xl bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-800 text-white shadow-xl shadow-emerald-950/30">
        <div className="relative z-10">
          <div className="text-xs font-medium text-emerald-100 uppercase tracking-wider">
            Total Net Balance
          </div>
          <div className="text-3xl font-extrabold tracking-tight mt-1 mb-2 font-mono">
            {formatRupee(metrics.netBalance)}
          </div>
          <p className="text-xs text-emerald-100/90 leading-relaxed">
            {metrics.netBalance >= 0
              ? 'You are in a positive net lending position.'
              : 'You have a net borrowing liability.'}
          </p>
        </div>

        {/* Decorative background circle */}
        <div className="absolute -right-6 -bottom-8 w-36 h-36 rounded-full bg-white/10 blur-xl pointer-events-none" />
      </div>

      {/* 3 Summary Cards: Others Owe Me, I Owe Others, Interest */}
      <div className="grid grid-cols-3 gap-2">
        {/* Others Owe Me */}
        <div
          className={`p-3 rounded-2xl border transition-all ${
            isDarkMode ? 'bg-[#181A20] border-neutral-800/80' : 'bg-white border-neutral-200'
          }`}
        >
          <div className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider truncate">
            Others Owe Me
          </div>
          <div className="text-sm font-extrabold font-mono text-emerald-500 mt-1 truncate">
            {formatRupee(metrics.othersOweMe)}
          </div>
          <div className="text-[10px] text-neutral-400 mt-0.5">Asset ledger</div>
        </div>

        {/* I Owe Others */}
        <div
          className={`p-3 rounded-2xl border transition-all ${
            isDarkMode ? 'bg-[#181A20] border-neutral-800/80' : 'bg-white border-neutral-200'
          }`}
        >
          <div className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider truncate">
            I Owe Others
          </div>
          <div className="text-sm font-extrabold font-mono text-rose-500 mt-1 truncate">
            {formatRupee(metrics.iOweOthers)}
          </div>
          <div className="text-[10px] text-neutral-400 mt-0.5">Your liability</div>
        </div>

        {/* Interest */}
        <div
          className={`p-3 rounded-2xl border transition-all ${
            isDarkMode ? 'bg-[#181A20] border-neutral-800/80' : 'bg-white border-neutral-200'
          }`}
        >
          <div className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider truncate">
            Interest
          </div>
          <div className="text-sm font-extrabold font-mono text-amber-500 mt-1 truncate">
            +{formatRupee(metrics.totalInterestEarned)}
          </div>
          <div className="text-[10px] text-neutral-400 mt-0.5">Accrued</div>
        </div>
      </div>

      {/* Quick Action Buttons Grid */}
      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={() => onOpenAddTransaction('LEND')}
          className="flex items-center gap-2 p-3 rounded-2xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/25 transition-all text-left group"
        >
          <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 group-hover:scale-105 transition-transform">
            <ArrowUpRight size={18} />
          </div>
          <div>
            <div className="text-xs font-bold text-white">+ Lend Money</div>
            <div className="text-[10px] text-neutral-400">Give cash/UPI</div>
          </div>
        </button>

        <button
          onClick={() => onOpenAddTransaction('BORROW')}
          className="flex items-center gap-2 p-3 rounded-2xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/25 transition-all text-left group"
        >
          <div className="p-2 rounded-xl bg-rose-500/20 text-rose-400 group-hover:scale-105 transition-transform">
            <ArrowDownLeft size={18} />
          </div>
          <div>
            <div className="text-xs font-bold text-white">+ Borrow Money</div>
            <div className="text-[10px] text-neutral-400">Take loan</div>
          </div>
        </button>
      </div>

      {/* Upcoming Payments Section */}
      <div>
        <div className="flex items-center justify-between mb-2 px-1">
          <div className="flex items-center gap-1.5">
            <Clock size={16} className="text-amber-500" />
            <h3 className="text-sm font-bold tracking-tight">Upcoming Payments</h3>
          </div>
          <button
            onClick={() => onNavigateTab('people')}
            className="text-xs font-semibold text-emerald-400 hover:underline flex items-center gap-0.5"
          >
            <span>View All</span>
            <ChevronRight size={14} />
          </button>
        </div>

        <div className="space-y-2">
          {upcomingList.slice(0, 3).map(({ person, summary, dueDate }) => {
            const amount = summary.outstandingOwedToUser || summary.liabilityOwedByUser;
            const isTheyOweMe = summary.outstandingOwedToUser > 0;
            const dueLabel = formatDueDateLabel(dueDate);
            const isOverdue = dueLabel.includes('Overdue');

            return (
              <div
                key={person.id}
                className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between ${
                  isDarkMode
                    ? 'bg-[#181A20] border-neutral-800/80 hover:border-neutral-700'
                    : 'bg-white border-neutral-200 hover:border-neutral-300'
                }`}
              >
                <div
                  className="flex items-center gap-3 cursor-pointer flex-1 min-w-0"
                  onClick={() => onOpenPersonDetail(person)}
                >
                  <div
                    className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-sm shrink-0 ${
                      isTheyOweMe
                        ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20'
                        : 'bg-rose-500/15 text-rose-400 border border-rose-500/20'
                    }`}
                  >
                    {person.name.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-bold truncate">{person.name}</div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs font-mono font-bold text-emerald-400">
                        {formatRupee(amount)}
                      </span>
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-md ${
                          isOverdue
                            ? 'bg-rose-500/15 text-rose-400 border border-rose-500/25'
                            : 'bg-amber-500/15 text-amber-400 border border-amber-500/25'
                        }`}
                      >
                        {dueLabel}
                      </span>
                    </div>
                  </div>
                </div>

                {isTheyOweMe && (
                  <button
                    onClick={() => onSendReminder(person, amount, dueDate)}
                    className="ml-2 px-3 py-1.5 rounded-xl bg-emerald-600/90 hover:bg-emerald-500 text-white font-semibold text-xs shrink-0 flex items-center gap-1 shadow-sm transition-all active:scale-95"
                  >
                    <Bell size={13} />
                    <span>Send Reminder</span>
                  </button>
                )}
              </div>
            );
          })}

          {upcomingList.length === 0 && (
            <div className="p-4 rounded-2xl text-center text-xs text-neutral-400 border border-neutral-800/60 bg-neutral-900/30">
              No upcoming payments due. All accounts are settled or on schedule!
            </div>
          )}
        </div>
      </div>

      {/* Recent Transactions Feed */}
      <div>
        <div className="flex items-center justify-between mb-2 px-1">
          <h3 className="text-sm font-bold tracking-tight">Recent Transactions</h3>
          <button
            onClick={() => onNavigateTab('transactions')}
            className="text-xs font-semibold text-emerald-400 hover:underline flex items-center gap-0.5"
          >
            <span>Ledger</span>
            <ChevronRight size={14} />
          </button>
        </div>

        <div className="space-y-1.5">
          {recentTransactions.map((tx) => {
            const person = people.find((p) => p.id === tx.personId);
            const isLendOrInterest = tx.type === 'LEND' || tx.type === 'INTEREST';
            const dateStr = new Date(tx.date).toLocaleDateString('en-IN', {
              day: 'numeric',
              month: 'short',
            });

            return (
              <div
                key={tx.id}
                className={`p-3 rounded-2xl border flex items-center justify-between transition-colors ${
                  isDarkMode ? 'bg-[#181A20] border-neutral-800/80' : 'bg-white border-neutral-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`p-2 rounded-xl text-xs font-bold ${
                      isLendOrInterest
                        ? 'bg-emerald-500/15 text-emerald-400'
                        : 'bg-rose-500/15 text-rose-400'
                    }`}
                  >
                    {isLendOrInterest ? <ArrowUpRight size={16} /> : <ArrowDownLeft size={16} />}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-neutral-200">
                      {person?.name || 'Unknown Contact'}
                    </div>
                    <div className="text-[11px] text-neutral-400">
                      {tx.type.replace('_', ' ')} • {tx.paymentMethod}
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div
                    className={`text-xs font-bold font-mono ${
                      isLendOrInterest ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {isLendOrInterest ? '+' : '-'}
                    {formatRupee(tx.amount)}
                  </div>
                  <div className="text-[10px] text-neutral-500">{dateStr}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
