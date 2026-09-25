import React from 'react';
import { Search, Bell, ShieldCheck, Code2 } from 'lucide-react';

interface TopBarProps {
  title: string;
  subtitle?: string;
  isDarkMode: boolean;
  onOpenSearch: () => void;
  onOpenNotifications: () => void;
  onOpenSourceInspector: () => void;
  pendingDueCount: number;
}

export const TopBar: React.FC<TopBarProps> = ({
  title,
  subtitle,
  isDarkMode,
  onOpenSearch,
  onOpenNotifications,
  onOpenSourceInspector,
  pendingDueCount,
}) => {
  return (
    <div
      className={`px-5 pt-2 pb-3 flex items-center justify-between shrink-0 transition-colors z-20 ${
        isDarkMode ? 'bg-[#121316] border-b border-neutral-800/80' : 'bg-white border-b border-neutral-200/80'
      }`}
    >
      <div>
        <h1 className="text-xl font-bold tracking-tight flex items-center gap-1.5">
          <span>{title}</span>
          {subtitle && (
            <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
              {subtitle}
            </span>
          )}
        </h1>
        <p className="text-[11px] font-medium text-neutral-400 mt-0.5">
          Personal Udhar Ledger & Outstanding Tracker
        </p>
      </div>

      <div className="flex items-center gap-1">
        <button
          onClick={onOpenSearch}
          className={`p-2 rounded-full transition-colors ${
            isDarkMode ? 'hover:bg-neutral-800 text-neutral-300' : 'hover:bg-neutral-100 text-neutral-700'
          }`}
          title="Search People and Transactions"
        >
          <Search size={18} />
        </button>

        <button
          onClick={onOpenNotifications}
          className={`relative p-2 rounded-full transition-colors ${
            isDarkMode ? 'hover:bg-neutral-800 text-neutral-300' : 'hover:bg-neutral-100 text-neutral-700'
          }`}
          title="Payment Due Notifications"
        >
          <Bell size={18} />
          {pendingDueCount > 0 && (
            <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-rose-500 text-[9px] font-bold text-white flex items-center justify-center animate-pulse">
              {pendingDueCount}
            </span>
          )}
        </button>

        <button
          onClick={onOpenSourceInspector}
          className={`p-2 rounded-full transition-colors text-emerald-500 ${
            isDarkMode ? 'hover:bg-neutral-800' : 'hover:bg-emerald-50'
          }`}
          title="Kotlin & Room Source Files"
        >
          <Code2 size={18} />
        </button>
      </div>
    </div>
  );
};
