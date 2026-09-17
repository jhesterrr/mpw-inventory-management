import { useEffect, useRef, useState } from 'react';
import { Bell, Check, Mail, ChevronRight } from 'lucide-react';
import { useAppStore } from '@/store';
import { cn, timeAgo } from '@/utils';
import type { EmailLog } from '@/types';

const subjectStyles: Record<EmailLog['eventType'], string> = {
  RequisitionSubmitted: 'bg-status-yellow/15 text-status-yellow',
  RequisitionApproved: 'bg-sky-500/15 text-sky-600 dark:text-sky-400',
  RequisitionFulfilled: 'bg-status-green/15 text-status-green',
  RequisitionRejected: 'bg-status-red/15 text-status-red',
  IssuanceProcessed: 'bg-royal-gold/20 text-royal-gold',
  LowStockAlert: 'bg-status-yellow/15 text-status-yellow',
  StockAdjusted: 'bg-indigo-500/15 text-indigo-600 dark:text-indigo-400',
  Welcome: 'bg-sky-500/15 text-sky-600 dark:text-sky-400',
  PasswordReset: 'bg-purple-500/15 text-purple-600 dark:text-purple-400',
  UserCreated: 'bg-status-green/15 text-status-green',
  System: 'bg-muted/20 text-muted',
};

export default function NotificationBell() {
  const { emailLogs, unreadCount, markRead, activePage, goNotifications } = useAppStore(s => ({
    emailLogs: s.emailLogs.slice(0, 12),
    unreadCount: s.getUnreadEmailCount(),
    markRead: s.markEmailRead,
    activePage: s.activePage,
    goNotifications: () => s.setActivePage('support'),
  }));
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    window.addEventListener('mousedown', h);
    return () => window.removeEventListener('mousedown', h);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className={cn(
          'relative w-11 h-11 rounded-xl border surface surface-border flex items-center justify-center transition-colors',
          open && 'ring-1 ring-royal-primary/40',
          'hover:border-royal-primary/40',
        )}
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-highlight text-white text-[10px] font-bold flex items-center justify-center">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-[380px] max-w-[calc(100vw-24px)] rounded-2xl surface shadow-card-lg border surface-border z-40 animate-fade-in">
          <div className="flex items-center justify-between p-4 border-b surface-border">
            <div>
              <p className="font-semibold">Notifications</p>
              <p className="text-xs text-muted">{unreadCount} unread messages</p>
            </div>
            <Mail className="w-5 h-5 text-primary" />
          </div>
          <div className="max-h-[420px] overflow-y-auto">
            {emailLogs.length === 0 ? (
              <div className="p-8 text-center text-sm text-muted">No notifications yet.</div>
            ) : (
              <ul className="divide-y surface-border">
                {emailLogs.map(e => (
                  <li key={e.id}>
                    <button
                      type="button"
                      onClick={() => markRead(e.id)}
                      className="w-full text-left p-4 flex gap-3 hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                    >
                      <span
                        className={cn(
                          'shrink-0 w-9 h-9 rounded-xl flex items-center justify-center',
                          subjectStyles[e.eventType],
                        )}
                      >
                        <Mail className="w-4 h-4" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          {!e.read && <span className="w-2 h-2 rounded-full bg-highlight" />}
                          <p className="font-medium text-sm truncate">{e.subject}</p>
                        </div>
                        <p className="text-xs text-muted mt-1 line-clamp-2">{e.body}</p>
                        <p className="text-[11px] text-muted mt-1 flex items-center justify-between">
                          <span>From: {e.from}</span>
                          <span>{timeAgo(e.timestamp)}</span>
                        </p>
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="p-3 border-t surface-border">
            <button
              type="button"
              onClick={() => {
                goNotifications();
                setOpen(false);
              }}
              className={cn(
                'w-full h-11 rounded-xl border surface-border flex items-center justify-center gap-1 text-sm font-medium hover:bg-black/5 dark:hover:bg-white/5',
                activePage === 'support' && 'bg-royal-primary/10 text-primary',
              )}
            >
              View all notifications <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
