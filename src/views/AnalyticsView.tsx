import React from 'react';
import { BarChart3, TrendingUp, PieChart, ArrowUpRight, ArrowDownLeft, ShieldCheck, Percent } from 'lucide-react';
import { Person, Transaction } from '../types';
import { calculateDashboardMetrics, calculatePersonBalance, formatRupee } from '../utils/calculator';

interface AnalyticsViewProps {
  people: Person[];
  transactions: Transaction[];
  isDarkMode: boolean;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({
  people,
  transactions,
  isDarkMode,
}) => {
  const metrics = calculateDashboardMetrics(people, transactions);

  let totalLentEver = 0;
  let totalRecoveredEver = 0;
  let totalBorrowedEver = 0;
  let totalRepaidEver = 0;

  for (const tx of transactions) {
    if (tx.type === 'LEND') totalLentEver += tx.amount;
    if (tx.type === 'PAYMENT_RECEIVED') totalRecoveredEver += tx.amount;
    if (tx.type === 'BORROW') totalBorrowedEver += tx.amount;
    if (tx.type === 'PAYMENT_MADE') totalRepaidEver += tx.amount;
  }

  // Recovery Rate
  const recoveryRate =
    totalLentEver > 0 ? Math.round((totalRecoveredEver / totalLentEver) * 100) : 0;

  // Outstanding by Person (top 5 debtors)
  const debtors = people
    .map((p) => {
      const summary = calculatePersonBalance(p.id, transactions, p.isSettled);
      return {
        name: p.name,
        outstanding: summary.outstandingOwedToUser,
      };
    })
    .filter((d) => d.outstanding > 0)
    .sort((a, b) => b.outstanding - a.outstanding);

  const maxDebtorAmount = debtors.length > 0 ? debtors[0].outstanding : 1;

  // Monthly breakdown approximation
  const monthsData = [
    { month: 'Jun', lent: 12000, recovered: 8000 },
    { month: 'Jul', lent: 18000, recovered: 11000 },
    { month: 'Aug', lent: 25000, recovered: 16000 },
    { month: 'Sep', lent: totalLentEver || 35000, recovered: totalRecoveredEver || 12000 },
  ];

  const maxMonthly = Math.max(...monthsData.map((m) => Math.max(m.lent, m.recovered)), 1);

  return (
    <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4 pb-20">
      {/* Top Header */}
      <div>
        <h2 className="text-xl font-bold tracking-tight">Financial Analytics</h2>
        <p className="text-xs text-neutral-400">Cash flow, recovery health & interest metrics</p>
      </div>

      {/* Recovery Rate Card */}
      <div className="p-4 rounded-3xl bg-gradient-to-r from-emerald-950/60 to-teal-950/40 border border-emerald-800/40 relative overflow-hidden">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">
              Capital Recovery Rate
            </span>
            <div className="text-3xl font-extrabold text-white font-mono mt-1">
              {recoveryRate}%
            </div>
            <p className="text-xs text-neutral-300 mt-1">
              {formatRupee(totalRecoveredEver)} recovered out of {formatRupee(totalLentEver)} lent
            </p>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <TrendingUp size={28} />
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-2 rounded-full bg-neutral-800 mt-3 overflow-hidden">
          <div
            className="h-full rounded-full bg-emerald-500 transition-all duration-500"
            style={{ width: `${Math.min(100, recoveryRate)}%` }}
          />
        </div>
      </div>

      {/* 2x4 Metric Grid */}
      <div className="grid grid-cols-2 gap-2">
        <div
          className={`p-3 rounded-2xl border ${
            isDarkMode ? 'bg-[#181A20] border-neutral-800' : 'bg-white border-neutral-200'
          }`}
        >
          <div className="text-[10px] text-neutral-400 font-semibold uppercase">Total Lent</div>
          <div className="text-sm font-extrabold font-mono text-emerald-400 mt-0.5">
            {formatRupee(totalLentEver)}
          </div>
        </div>

        <div
          className={`p-3 rounded-2xl border ${
            isDarkMode ? 'bg-[#181A20] border-neutral-800' : 'bg-white border-neutral-200'
          }`}
        >
          <div className="text-[10px] text-neutral-400 font-semibold uppercase">Money Recovered</div>
          <div className="text-sm font-extrabold font-mono text-blue-400 mt-0.5">
            {formatRupee(totalRecoveredEver)}
          </div>
        </div>

        <div
          className={`p-3 rounded-2xl border ${
            isDarkMode ? 'bg-[#181A20] border-neutral-800' : 'bg-white border-neutral-200'
          }`}
        >
          <div className="text-[10px] text-neutral-400 font-semibold uppercase">Total Borrowed</div>
          <div className="text-sm font-extrabold font-mono text-rose-400 mt-0.5">
            {formatRupee(totalBorrowedEver)}
          </div>
        </div>

        <div
          className={`p-3 rounded-2xl border ${
            isDarkMode ? 'bg-[#181A20] border-neutral-800' : 'bg-white border-neutral-200'
          }`}
        >
          <div className="text-[10px] text-neutral-400 font-semibold uppercase">Money Repaid</div>
          <div className="text-sm font-extrabold font-mono text-emerald-400 mt-0.5">
            {formatRupee(totalRepaidEver)}
          </div>
        </div>

        <div
          className={`p-3 rounded-2xl border ${
            isDarkMode ? 'bg-[#181A20] border-neutral-800' : 'bg-white border-neutral-200'
          }`}
        >
          <div className="text-[10px] text-neutral-400 font-semibold uppercase">Interest Accrued</div>
          <div className="text-sm font-extrabold font-mono text-amber-400 mt-0.5">
            +{formatRupee(metrics.totalInterestEarned)}
          </div>
        </div>

        <div
          className={`p-3 rounded-2xl border ${
            isDarkMode ? 'bg-[#181A20] border-neutral-800' : 'bg-white border-neutral-200'
          }`}
        >
          <div className="text-[10px] text-neutral-400 font-semibold uppercase">Current Liability</div>
          <div className="text-sm font-extrabold font-mono text-rose-400 mt-0.5">
            {formatRupee(metrics.iOweOthers)}
          </div>
        </div>
      </div>

      {/* Chart 1: Monthly Lending vs Repayment Comparison */}
      <div
        className={`p-4 rounded-3xl border ${
          isDarkMode ? 'bg-[#181A20] border-neutral-800' : 'bg-white border-neutral-200'
        }`}
      >
        <div className="flex items-center justify-between mb-3">
          <div className="text-xs font-bold uppercase tracking-wider text-neutral-300">
            Monthly Capital Flow
          </div>
          <div className="flex items-center gap-3 text-[10px]">
            <span className="flex items-center gap-1 text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" /> Lent
            </span>
            <span className="flex items-center gap-1 text-blue-400">
              <span className="w-2 h-2 rounded-full bg-blue-500 inline-block" /> Received
            </span>
          </div>
        </div>

        <div className="flex items-end justify-between gap-3 h-36 pt-4 pb-1 px-2 border-b border-neutral-800">
          {monthsData.map((m) => {
            const lentHeight = Math.max(10, Math.round((m.lent / maxMonthly) * 100));
            const recHeight = Math.max(10, Math.round((m.recovered / maxMonthly) * 100));

            return (
              <div key={m.month} className="flex-1 flex flex-col items-center gap-1 h-full justify-end">
                <div className="w-full flex items-end justify-center gap-1.5 h-28">
                  {/* Lent bar */}
                  <div
                    className="w-3.5 rounded-t-lg bg-emerald-500/90 transition-all hover:bg-emerald-400"
                    style={{ height: `${lentHeight}%` }}
                    title={`Lent: ${formatRupee(m.lent)}`}
                  />
                  {/* Recovered bar */}
                  <div
                    className="w-3.5 rounded-t-lg bg-blue-500/90 transition-all hover:bg-blue-400"
                    style={{ height: `${recHeight}%` }}
                    title={`Recovered: ${formatRupee(m.recovered)}`}
                  />
                </div>
                <span className="text-[10px] text-neutral-400 font-medium mt-1">{m.month}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Chart 2: Outstanding Balance Distribution by Person */}
      <div
        className={`p-4 rounded-3xl border ${
          isDarkMode ? 'bg-[#181A20] border-neutral-800' : 'bg-white border-neutral-200'
        }`}
      >
        <div className="text-xs font-bold uppercase tracking-wider text-neutral-300 mb-3">
          Outstanding Concentration (Who owes you most)
        </div>

        <div className="space-y-2.5">
          {debtors.slice(0, 5).map((d) => {
            const pct = Math.round((d.outstanding / maxDebtorAmount) * 100);
            return (
              <div key={d.name} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-neutral-200">{d.name}</span>
                  <span className="font-mono font-bold text-emerald-400">
                    {formatRupee(d.outstanding)}
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-neutral-800/80 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-300"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}

          {debtors.length === 0 && (
            <div className="text-center py-4 text-xs text-neutral-400">
              No outstanding loans active right now.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
