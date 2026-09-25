import React from 'react';
import { Home, Users, Receipt, BarChart3, Settings } from 'lucide-react';

export type NavTab = 'home' | 'people' | 'transactions' | 'analytics' | 'settings';

interface BottomNavProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  isDarkMode: boolean;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onTabChange,
  isDarkMode,
}) => {
  const tabs = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'people', label: 'People', icon: Users },
    { id: 'transactions', label: 'Ledger', icon: Receipt },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: Settings },
  ] as const;

  return (
    <nav
      className={`px-3 py-2 flex items-center justify-around shrink-0 z-20 border-t transition-colors ${
        isDarkMode
          ? 'bg-[#15171B] border-neutral-800/80 text-neutral-400'
          : 'bg-white border-neutral-200/80 text-neutral-600'
      }`}
    >
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className="flex flex-col items-center gap-1 py-1 px-3 group transition-transform active:scale-95"
          >
            <div
              className={`px-4 py-1 rounded-full transition-all duration-200 flex items-center justify-center ${
                isActive
                  ? 'bg-emerald-500/20 text-emerald-500 font-semibold'
                  : 'group-hover:bg-neutral-800/40 text-current'
              }`}
            >
              <Icon size={20} strokeWidth={isActive ? 2.4 : 1.9} />
            </div>
            <span
              className={`text-[11px] tracking-tight transition-colors ${
                isActive
                  ? 'text-emerald-500 font-bold'
                  : 'text-neutral-400 group-hover:text-neutral-300'
              }`}
            >
              {tab.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
};
