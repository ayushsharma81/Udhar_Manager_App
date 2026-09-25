import React from 'react';
import { Bell, ArrowRight, X } from 'lucide-react';

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  personId?: string;
  amount?: number;
  dateStr?: string;
}

interface NotificationBannerProps {
  notification: NotificationItem | null;
  onDismiss: () => void;
  onAction?: (notification: NotificationItem) => void;
  isDarkMode: boolean;
}

export const NotificationBanner: React.FC<NotificationBannerProps> = ({
  notification,
  onDismiss,
  onAction,
  isDarkMode,
}) => {
  if (!notification) return null;

  return (
    <div className="absolute top-12 left-3 right-3 z-40 transition-all animate-in slide-in-from-top-4 duration-300">
      <div
        className={`p-3.5 rounded-2xl shadow-2xl border flex items-start gap-3 backdrop-blur-md ${
          isDarkMode
            ? 'bg-[#1E2028]/95 border-neutral-700/80 text-neutral-100'
            : 'bg-white/95 border-neutral-200 text-neutral-900'
        }`}
      >
        <div className="p-2 rounded-xl bg-amber-500/15 text-amber-500 shrink-0 mt-0.5">
          <Bell size={18} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-emerald-500 uppercase tracking-wider">
              {notification.title}
            </h4>
            <span className="text-[10px] text-neutral-400">now</span>
          </div>
          <p className="text-xs text-neutral-300 font-medium mt-0.5 leading-snug">
            {notification.message}
          </p>

          <div className="flex items-center gap-2 mt-2">
            {onAction && notification.personId && (
              <button
                onClick={() => onAction(notification)}
                className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-[11px] flex items-center gap-1 transition-colors"
              >
                <span>Send Reminder</span>
                <ArrowRight size={12} />
              </button>
            )}
            <button
              onClick={onDismiss}
              className="px-2 py-1 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-[11px] transition-colors"
            >
              Dismiss
            </button>
          </div>
        </div>

        <button
          onClick={onDismiss}
          className="text-neutral-400 hover:text-neutral-200 p-1"
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
};
