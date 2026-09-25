import React from 'react';
import { Plus, ArrowUpRight, ArrowDownLeft, CheckCircle2, CreditCard, UserPlus, X } from 'lucide-react';
import { TransactionType } from '../types';

interface FabSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenAddTransaction: (preselectedType: TransactionType) => void;
  onOpenAddPerson: () => void;
  isDarkMode: boolean;
}

export const FabSheet: React.FC<FabSheetProps> = ({
  isOpen,
  onClose,
  onOpenAddTransaction,
  onOpenAddPerson,
  isDarkMode,
}) => {
  if (!isOpen) return null;

  const actions = [
    {
      title: 'Lend Money',
      subtitle: 'You gave money to someone (increases their debt)',
      icon: ArrowUpRight,
      color: 'bg-emerald-500/15 text-emerald-500 border-emerald-500/30',
      onClick: () => {
        onClose();
        onOpenAddTransaction('LEND');
      },
    },
    {
      title: 'Borrow Money',
      subtitle: 'You received money from someone (increases your debt)',
      icon: ArrowDownLeft,
      color: 'bg-rose-500/15 text-rose-500 border-rose-500/30',
      onClick: () => {
        onClose();
        onOpenAddTransaction('BORROW');
      },
    },
    {
      title: 'Receive Payment',
      subtitle: 'Other person paid you back (decreases their debt)',
      icon: CheckCircle2,
      color: 'bg-blue-500/15 text-blue-500 border-blue-500/30',
      onClick: () => {
        onClose();
        onOpenAddTransaction('PAYMENT_RECEIVED');
      },
    },
    {
      title: 'Make Payment',
      subtitle: 'You paid other person back (decreases your debt)',
      icon: CreditCard,
      color: 'bg-amber-500/15 text-amber-500 border-amber-500/30',
      onClick: () => {
        onClose();
        onOpenAddTransaction('PAYMENT_MADE');
      },
    },
    {
      title: 'Add New Person',
      subtitle: 'Create a new contact ledger profile',
      icon: UserPlus,
      color: 'bg-purple-500/15 text-purple-500 border-purple-500/30',
      onClick: () => {
        onClose();
        onOpenAddPerson();
      },
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-150">
      <div
        className="absolute inset-0"
        onClick={onClose}
      />

      <div
        className={`relative z-10 w-full rounded-t-[28px] p-5 pb-8 shadow-2xl transition-transform animate-in slide-in-from-bottom duration-200 ${
          isDarkMode ? 'bg-[#181A20] text-neutral-100' : 'bg-white text-neutral-900'
        }`}
      >
        {/* Android drag pill */}
        <div className="w-12 h-1.5 rounded-full bg-neutral-400/40 mx-auto mb-4" />

        <div className="flex items-center justify-between mb-4 px-1">
          <div>
            <h3 className="text-lg font-bold">Quick Actions</h3>
            <p className="text-xs text-neutral-400">Record a financial transaction or contact</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-neutral-200/50 dark:bg-neutral-800 text-neutral-400 hover:text-neutral-100"
          >
            <X size={18} />
          </button>
        </div>

        <div className="space-y-2">
          {actions.map((act) => {
            const Icon = act.icon;
            return (
              <button
                key={act.title}
                onClick={act.onClick}
                className={`w-full flex items-center gap-3.5 p-3 rounded-2xl transition-all text-left border ${
                  isDarkMode
                    ? 'hover:bg-neutral-800/70 border-neutral-800/80'
                    : 'hover:bg-neutral-100 border-neutral-200'
                }`}
              >
                <div className={`p-2.5 rounded-xl border ${act.color}`}>
                  <Icon size={20} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold">{act.title}</div>
                  <div className="text-xs text-neutral-400 truncate">{act.subtitle}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
