import { useMemo, useState } from 'react';
import {
  Bell, Mail, CheckCheck, Filter, Headphones, HelpCircle, BookOpen,
  MessageSquareText, Info, AlertCircle, ThumbsUp, ShoppingCart, Truck, CheckCircle2, XCircle, Sparkles,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAppStore } from '@/store';
import type { EmailEventType } from '@/types';
import { cn, formatDateTime, formatTimeAgo } from '@/utils';

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.05 },
  },
};
const fadeUpVariants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: 'easeOut' as const } },
};

const eventMeta: Record<EmailEventType, { Icon: any; tone: string; subject: string }> = {
  RequisitionSubmitted: { Icon: ShoppingCart, tone: 'bg-status-yellow/15 text-status-yellow', subject: 'New Requisition Submitted' },
  RequisitionApproved: { Icon: CheckCircle2, tone: 'bg-sky-500/15 text-sky-600 dark:text-sky-400', subject: 'Requisition Approved' },
  RequisitionFulfilled: { Icon: Truck, tone: 'bg-status-green/15 text-status-green', subject: 'Requisition Fulfilled' },
  RequisitionRejected: { Icon: XCircle, tone: 'bg-status-red/15 text-status-red', subject: 'Requisition Rejected' },
  IssuanceProcessed: { Icon: CheckCircle2, tone: 'bg-royal-primary/10 text-royal-primary dark:bg-crimson-primary/20 dark:text-white', subject: 'Quick Issuance Processed' },
  LowStockAlert: { Icon: AlertCircle, tone: 'bg-status-yellow/15 text-status-yellow', subject: 'Low Stock Alert' },
  StockAdjusted: { Icon: Info, tone: 'bg-indigo-500/15 text-indigo-600 dark:text-indigo-400', subject: 'Stock Level Adjusted' },
  Welcome: { Icon: ThumbsUp, tone: 'bg-sky-500/15 text-sky-600 dark:text-sky-400', subject: 'Welcome to MPW Inventory' },
  PasswordReset: { Icon: Mail, tone: 'bg-purple-500/15 text-purple-600 dark:text-purple-400', subject: 'Password Reset Request' },
  UserCreated: { Icon: CheckCircle2, tone: 'bg-status-green/15 text-status-green', subject: 'New User Created' },
  System: { Icon: Bell, tone: 'bg-muted/30 text-muted', subject: 'System Notification' },
};

type Tab = 'notifications' | 'email-log' | 'support';

export default function SupportPage() {
  const s = useAppStore(state => state);
  const [tab, setTab] = useState<Tab>('notifications');
  const [eventFilter, setEventFilter] = useState<EmailEventType | 'ALL'>('ALL');
  const [onlyUnread, setOnlyUnread] = useState(false);
  const [search, setSearch] = useState('');

  const events: (EmailEventType | 'ALL')[] = ['ALL', 'RequisitionSubmitted', 'RequisitionApproved', 'RequisitionFulfilled', 'RequisitionRejected', 'IssuanceProcessed', 'LowStockAlert', 'StockAdjusted'];

  const list = useMemo(() => {
    const base = [...s.emailLogs].sort((a, b) => b.timestamp - a.timestamp);
    return base.filter(l => {
      if (eventFilter !== 'ALL' && l.eventType !== eventFilter) return false;
      if (onlyUnread && l.read) return false;
      if (search.trim()) {
        const t = search.toLowerCase();
        if (!(l.subject.toLowerCase().includes(t) || l.from.toLowerCase().includes(t) || l.to.toLowerCase().includes(t) || l.body.toLowerCase().includes(t))) return false;
      }
      return true;
    });
  }, [s.emailLogs, eventFilter, onlyUnread, search]);

  const unread = s.emailLogs.filter(e => !e.read).length;
  const byEvent = useMemo(() => {
    const m = new Map<string, number>();
    for (const e of s.emailLogs) m.set(e.eventType, (m.get(e.eventType) || 0) + 1);
    return m;
  }, [s.emailLogs]);

  const markAll = () => s.emailLogs.forEach(e => !e.read && s.markEmailRead(e.id));

  return (
    <motion.div
      className="space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      <motion.div variants={fadeUpVariants} className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-royal-primary/10 dark:bg-crimson-primary/20 text-primary text-xs font-bold uppercase tracking-widest mb-2 border surface-border">
            <Bell className="w-3.5 h-3.5" /> Communication Hub
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">Notifications &amp; Support</h2>
          <p className="text-xs sm:text-sm text-muted mt-1">Simulated email log, audit events, and warehouse knowledgebase.</p>
        </div>
        <div className="flex gap-2">
          <span className="h-11 badge-pill bg-status-yellow/15 text-status-yellow">
            <Bell className="w-3.5 h-3.5" />
            {unread} Unread
          </span>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={markAll}
            className="btn-outline h-11 px-5"
          >
            <CheckCheck className="w-4 h-4" /> Mark All Read
          </motion.button>
        </div>
      </motion.div>

      <div className="inline-flex rounded-2xl border surface-border p-1 overflow-hidden">
        {([
          { id: 'notifications', label: 'Notifications', icon: <Bell className="w-4 h-4" />, badge: unread } as const,
          { id: 'email-log', label: 'Email Log', icon: <Mail className="w-4 h-4" />, badge: s.emailLogs.length } as const,
          { id: 'support', label: 'Support & Help', icon: <Headphones className="w-4 h-4" /> } as const,
        ]).map(t => (
          <button key={t.id} onClick={() => setTab(t.id as Tab)} className={cn('h-10 px-4 rounded-xl text-sm font-semibold transition-colors flex items-center gap-2',
            tab === t.id ? 'bg-royal-primary text-white shadow-sm' : 'text-muted hover:bg-black/5 dark:hover:bg-white/5',
          )}>
            {t.icon} {t.label} {t.badge && <span className={cn('text-[10px] px-2 py-0.5 rounded-full font-bold tabular-nums', tab === t.id ? 'bg-white/20' : 'bg-black/10 dark:bg-white/10')}>{t.badge}</span>}
          </button>
        ))}
      </div>

      {tab === 'notifications' && (
        <section className="stat-card shadow-card space-y-4">
          <div className="flex flex-col lg:flex-row gap-3">
            <div className="relative flex-1">
              <Mail className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search notifications..." className="w-full h-11 pl-11 pr-4 rounded-xl border surface-border surface outline-none focus:ring-2 focus:ring-royal-primary/30" />
            </div>
            <label className="h-11 px-4 rounded-xl border surface-border inline-flex items-center gap-2 cursor-pointer select-none surface">
              <input type="checkbox" checked={onlyUnread} onChange={e => setOnlyUnread(e.target.checked)} className="rounded" />
              <span className="text-sm font-medium">Unread only</span>
            </label>
          </div>
          <div className="flex flex-wrap gap-2">
            {events.map(ev => (
              <button key={ev} onClick={() => setEventFilter(ev)} className={cn('chip surface-border', eventFilter === ev && 'chip-active')}>
                {ev === 'ALL' ? <Filter className="w-3.5 h-3.5" /> : (() => { const m = eventMeta[ev as EmailEventType]; return <m.Icon className="w-3.5 h-3.5" />; })()}
                {ev === 'ALL' ? 'All Events' : ev}
                <span className="text-[10px] px-1.5 py-0.5 rounded-full tabular-nums bg-black/5 dark:bg-white/10 ml-1">
                  {ev === 'ALL' ? s.emailLogs.length : byEvent.get(ev) || 0}
                </span>
              </button>
            ))}
          </div>
        </section>
      )}

      {(tab === 'notifications' || tab === 'email-log') && (
        <section className="stat-card shadow-card divide-y surface-border divide-solid">
          {list.map(e => {
            const meta = eventMeta[e.eventType] || eventMeta.System;
            const Icon = meta.Icon;
            return (
              <article key={e.id} className={cn('p-5 flex gap-4 hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors', !e.read && 'bg-royal-primary/[0.03] dark:bg-crimson-primary/5')}>
                <div className="shrink-0">
                  <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center', meta.tone)}>
                    <Icon className="w-6 h-6" />
                  </div>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <h4 className="font-extrabold truncate">{meta.subject}</h4>
                    {!e.read && <span className="badge-pill bg-status-red/15 text-status-red text-[10px] px-2 py-0 font-black uppercase tracking-wider">New</span>}
                    <span className={cn('badge-pill text-[10px] uppercase tracking-wider', meta.tone)}>{e.eventType}</span>
                  </div>
                  <p className="text-xs text-muted mb-2 truncate">
                    <span className="font-semibold">{e.from}</span>
                    <span className="mx-1">→</span>
                    <span className="font-semibold">{e.to}</span>
                    <span className="mx-2">·</span>
                    <span title={formatDateTime(e.timestamp)}>{formatTimeAgo(e.timestamp)}</span>
                  </p>
                  <p className="text-sm leading-relaxed">{e.body}</p>
                  <div className="mt-3 flex items-center gap-2 flex-wrap">
                    <button onClick={() => s.markEmailRead(e.id)} disabled={e.read} className={cn('btn-outline h-8 px-3 text-xs', e.read && 'opacity-50 cursor-default')}>
                      {e.read ? 'Marked Read' : 'Mark Read'}
                    </button>
                    {e.requisitionId && (
                      <button onClick={() => s.setActivePage('requisitions')} className="btn-outline h-8 px-3 text-xs">
                        View Requisition {e.requisitionId}
                      </button>
                    )}
                    <span className="text-[10px] text-muted font-mono ml-auto">MSG-{e.id}</span>
                  </div>
                </div>
              </article>
            );
          })}
          {list.length === 0 && (
            <div className="p-16 text-center text-muted">
              <Mail className="w-12 h-12 mx-auto mb-3 opacity-60" />
              <p className="font-semibold">No messages match your filters</p>
              <p className="text-xs mt-1">Try removing filters or clearing the search.</p>
            </div>
          )}
        </section>
      )}

      {tab === 'support' && <SupportCenter />}
    </motion.div>
  );
}

function SupportCenter() {
  const topics = [
    { title: 'Getting Started Guide', desc: 'Learn the dashboard, navigation, and basic workflows.', Icon: BookOpen, tone: 'bg-royal-primary/10 text-royal-primary dark:bg-crimson-primary/20 dark:text-white' },
    { title: 'Approving &amp; Fulfilling Requisitions', desc: 'Step-by-step for Warehouse Staff and Editors.', Icon: Truck, tone: 'bg-status-green/15 text-status-green' },
    { title: 'Using the QR/Barcode Scanner', desc: 'Camera permissions, manual SKU fallback, and quick issuance.', Icon: Bell, tone: 'bg-sky-500/15 text-sky-600 dark:text-sky-400' },
    { title: 'Inventory Masterlist &amp; CRUD', desc: 'Add, edit, delete, and adjust stock quantities.', Icon: MessageSquareText, tone: 'bg-indigo-500/15 text-indigo-600 dark:text-indigo-400' },
    { title: 'Role-Based Access Explained', desc: 'Editor, Warehouse Staff, and Customer permissions.', Icon: HelpCircle, tone: 'bg-status-yellow/15 text-status-yellow' },
    { title: 'FAQ &amp; Troubleshooting', desc: 'Common issues and their resolutions.', Icon: ThumbsUp, tone: 'bg-purple-500/15 text-purple-600 dark:text-purple-400' },
  ];
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="stat-card shadow-card md:col-span-2">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-widest text-muted font-bold">Support Desk</p>
              <h3 className="text-2xl font-black mt-1">How can we help you today?</h3>
              <p className="text-muted mt-1 max-w-xl">
                This inventory app ships with built-in role switcher for testing, persistent localStorage state, and
                centralized zero-placeholder data computed from the zustand store.
              </p>
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-xl">
                <div className="rounded-xl border surface-border p-3 surface">
                  <p className="font-semibold flex items-center gap-2"><Headphones className="w-4 h-4 text-primary" /> System Admin</p>
                  <p className="text-xs text-muted mt-1">editor@mpw-inv.app</p>
                </div>
                <div className="rounded-xl border surface-border p-3 surface">
                  <p className="font-semibold flex items-center gap-2"><MessageSquareText className="w-4 h-4 text-primary" /> Warehouse Desk</p>
                  <p className="text-xs text-muted mt-1">warehouse@mpw-inv.app</p>
                </div>
              </div>
            </div>
            <div className="hidden sm:flex w-28 h-28 rounded-2xl bg-royal-primary/10 dark:bg-crimson-primary/20 items-center justify-center shrink-0">
              <Headphones className="w-14 h-14 text-primary" />
            </div>
          </div>
        </div>
        <div className="stat-card shadow-card">
          <h4 className="font-bold mb-3">Quick Diagnostics</h4>
          <ul className="space-y-2 text-sm">
            {(() => {
              const s = useAppStore.getState();
              const r = [
                ['Inventory SKUs', s.inventory.length],
                ['Active Users', s.users.filter(u => u.active).length],
                ['Open Requisitions', s.requisitions.filter(rq => rq.status !== 'Fulfilled' && rq.status !== 'Rejected').length],
                ['Issuance Logs', s.issuanceLogs.length],
                ['Email Notifications', s.emailLogs.length],
              ];
              return r.map(([k, v]) => (
                <li key={k as string} className="flex items-center justify-between rounded-xl border surface-border px-3 py-2 surface">
                  <span className="text-muted">{k}</span>
                  <span className="font-black tabular-nums">{v}</span>
                </li>
              ));
            })()}
          </ul>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {topics.map(t => (
          <article key={t.title} className="stat-card shadow-card p-5 hover:shadow-xl transition-shadow cursor-pointer">
            <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center mb-4', t.tone)}><t.Icon className="w-6 h-6" /></div>
            <h4 className="font-extrabold text-lg mb-1">{t.title}</h4>
            <p className="text-muted text-sm mb-3">{t.desc}</p>
            <button className="text-primary text-sm font-bold inline-flex items-center gap-1 hover:gap-2 transition-all">
              Open article →
            </button>
          </article>
        ))}
      </div>
    </div>
  );
}
