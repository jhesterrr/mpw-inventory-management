import { useMemo, useState } from 'react';
import { History, Search, Calendar, User, ClipboardList, PackageOpen, Layers, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAppStore } from '@/store';
import type { TimePeriodFilter } from '@/store';
import { cn, formatCurrency, formatDateTime, formatNumber } from '@/utils';

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

const periods: TimePeriodFilter[] = ['Current Shift', 'Today', 'This Week', 'This Month', 'This Year'];

export default function IssuanceHistoryPage() {
  const s = useAppStore(state => state);
  const [period, setPeriod] = useState<TimePeriodFilter>('This Month');
  const [shiftA, setShiftA] = useState(true);
  const [shiftB, setShiftB] = useState(true);
  const [search, setSearch] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const setActiveShift = s.setActiveShift;
  const activeShift = s.activeShift;

  const logs = useMemo(() => {
    const base = s.getIssuanceLogsByPeriod(period);
    return base
      .filter(l => (shiftA && l.shiftId === 'Shift A') || (shiftB && l.shiftId === 'Shift B'))
      .filter(l => {
        if (!search.trim()) return true;
        const t = search.toLowerCase();
        return (
          l.itemName.toLowerCase().includes(t) ||
          l.sku.toLowerCase().includes(t) ||
          l.requestorName.toLowerCase().includes(t) ||
          l.issuingStaff.toLowerCase().includes(t) ||
          l.purpose.toLowerCase().includes(t)
        );
      })
      .sort((a, b) => b.timestamp - a.timestamp);
  }, [s.issuanceLogs, period, shiftA, shiftB, search, s.activeShift]);

  const totals = useMemo(() => {
    const units = logs.reduce((sum, l) => sum + l.qtyIssued, 0);
    const value = logs.reduce((sum, l) => sum + l.qtyIssued * l.unitCost, 0);
    const shiftACount = logs.filter(l => l.shiftId === 'Shift A').length;
    const shiftBCount = logs.filter(l => l.shiftId === 'Shift B').length;
    return { rows: logs.length, units, value, shiftACount, shiftBCount };
  }, [logs]);

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
            <History className="w-3.5 h-3.5" /> Audit Trail
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">History of Issuance</h2>
          <p className="text-xs sm:text-sm text-muted mt-1">
            Every fulfilled stock deduction with timestamp, staff, and shift context.
          </p>
        </div>
      </motion.div>

      <motion.div variants={fadeUpVariants} className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <MetricCard label="Issuance Records" value={totals.rows} icon={History} tone="info" />
        <MetricCard label="Units Issued" value={totals.units} icon={PackageOpen} tone="success" />
        <MetricCard label="Total Value" value={totals.value} icon={Layers} formatter={formatCurrency} />
        <MetricCard label="Shift A Rows" value={totals.shiftACount} icon={Calendar} tone={activeShift === 'Shift A' ? 'warning' : 'default'} />
        <MetricCard label="Shift B Rows" value={totals.shiftBCount} icon={Calendar} tone={activeShift === 'Shift B' ? 'warning' : 'default'} />
      </motion.div>

      <section className="stat-card shadow-card space-y-4">
        <div className="flex flex-col lg:flex-row gap-3 items-stretch">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by item, SKU, requestor, staff, purpose..."
              className="w-full h-11 pl-11 pr-4 rounded-xl border surface-border surface outline-none focus:ring-2 focus:ring-royal-primary/30"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <div className="inline-flex rounded-xl border surface-border overflow-hidden">
              {(['Shift A', 'Shift B'] as const).map(sh => {
                const active = sh === 'Shift A' ? shiftA : shiftB;
                return (
                  <button
                    key={sh}
                    type="button"
                    onClick={() => {
                      if (sh === 'Shift A') setShiftA(a => !a);
                      else setShiftB(b => !b);
                      setActiveShift(sh);
                    }}
                    className={cn(
                      'h-11 px-4 text-sm font-semibold transition-colors',
                      active && activeShift === sh ? 'bg-royal-primary text-white' : active ? 'bg-royal-primary/10 text-royal-primary dark:bg-crimson-primary/20 dark:text-white' : 'text-muted hover:bg-black/5 dark:hover:bg-white/5',
                    )}
                  >
                    {sh}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {periods.map(p => {
            const active = period === p;
            return (
              <button
                key={p}
                type="button"
                onClick={() => setPeriod(p)}
                className={cn('chip surface-border', active && 'chip-active')}
              >
                <Calendar className="w-3.5 h-3.5" /> {p}
              </button>
            );
          })}
        </div>
      </section>

      <section className="hidden md:block stat-card shadow-card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b surface-border text-xs uppercase tracking-wider text-muted">
                <th className="text-left font-semibold px-5 py-4">Timestamp</th>
                <th className="text-left font-semibold px-3 py-4">Item</th>
                <th className="text-right font-semibold px-3 py-4">Qty Issued</th>
                <th className="text-left font-semibold px-3 py-4">Requestor</th>
                <th className="text-left font-semibold px-3 py-4">Issuing Staff</th>
                <th className="text-left font-semibold px-3 py-4">Shift</th>
                <th className="text-left font-semibold px-3 py-4">Purpose</th>
                <th className="text-right font-semibold px-5 py-4">Updated Stock</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((l, idx) => (
                <tr
                  key={l.id}
                  className={cn('border-b surface-border last:border-0', idx % 2 && 'bg-black/[0.02] dark:bg-white/[0.02]')}
                >
                  <td className="px-5 py-3.5 whitespace-nowrap text-xs text-muted">{formatDateTime(l.timestamp)}</td>
                  <td className="px-3 py-3.5">
                    <p className="font-semibold truncate max-w-[220px]">{l.itemName}</p>
                    <p className="font-mono text-[11px] text-muted">{l.sku}</p>
                  </td>
                  <td className="px-3 py-3.5 text-right">
                    <span className="inline-flex flex-col items-end">
                      <span className="font-black tabular-nums text-lg">{formatNumber(l.qtyIssued)}</span>
                      <span className="text-[11px] text-muted tabular-nums">{formatCurrency(l.qtyIssued * l.unitCost)}</span>
                    </span>
                  </td>
                  <td className="px-3 py-3.5 font-medium truncate max-w-[160px]">{l.requestorName}</td>
                  <td className="px-3 py-3.5 text-muted truncate max-w-[160px]">{l.issuingStaff}</td>
                  <td className="px-3 py-3.5">
                    <span className={cn(
                      'badge-pill',
                      l.shiftId === 'Shift A' ? 'bg-royal-primary/10 text-royal-primary dark:text-white dark:bg-crimson-primary/20' : 'bg-sky-500/15 text-sky-600 dark:text-sky-400',
                    )}>
                      {l.shiftId}
                    </span>
                  </td>
                  <td className="px-3 py-3.5 text-muted truncate max-w-[240px]">{l.purpose}</td>
                  <td className="px-5 py-3.5 text-right">
                    <span className="font-bold tabular-nums">{formatNumber(l.updatedStockLevel)}</span>
                  </td>
                </tr>
              ))}
              {logs.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-5 py-16 text-center text-muted">
                    <History className="w-10 h-10 mx-auto mb-3 opacity-60" />
                    <p className="font-semibold">No issuance records match your filters</p>
                    <p className="text-xs mt-1">Try a broader time period or clear your search.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="md:hidden space-y-3">
        {logs.map(l => {
          const open = expandedId === l.id;
          return (
            <div key={l.id} className="stat-card shadow-card overflow-hidden">
              <button type="button" onClick={() => setExpandedId(open ? null : l.id)} className="w-full text-left p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="font-bold truncate">{l.itemName}</p>
                    <p className="text-xs text-muted">
                      <span className="font-mono mr-2">{l.sku}</span>
                      {formatDateTime(l.timestamp)}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-[10px] uppercase tracking-wider text-muted">Issued</p>
                    <p className="text-xl font-black tabular-nums">{formatNumber(l.qtyIssued)}</p>
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-between text-xs">
                  <span className={cn('badge-pill', l.shiftId === 'Shift A' ? 'bg-royal-primary/10 text-royal-primary dark:text-white dark:bg-crimson-primary/20' : 'bg-sky-500/15 text-sky-600 dark:text-sky-400')}>
                    {l.shiftId}
                  </span>
                  <span className="text-muted">By {l.issuingStaff}</span>
                </div>
              </button>
              {open && (
                <div className="px-4 pb-4 border-t surface-border pt-3 space-y-2 text-sm">
                  <Row label="Requestor" value={l.requestorName} icon={<User className="w-3.5 h-3.5" />} />
                  <Row label="Purpose" value={l.purpose} icon={<ClipboardList className="w-3.5 h-3.5" />} />
                  <Row label="Updated Stock Level" value={formatNumber(l.updatedStockLevel)} highlight />
                  <Row label="Total Issue Value" value={formatCurrency(l.qtyIssued * l.unitCost)} highlight />
                </div>
              )}
            </div>
          );
        })}
        {logs.length === 0 && (
          <div className="stat-card p-12 text-center text-muted">
            <History className="w-10 h-10 mx-auto mb-3 opacity-60" />
            No issuance records for current filters.
          </div>
        )}
      </section>
    </motion.div>
  );
}

function MetricCard({
  label, value, icon: Icon, tone, formatter,
}: {
  label: string; value: number; icon: any; tone?: 'default' | 'success' | 'warning' | 'alert' | 'info'; formatter?: (n: number) => string;
}) {
  const tones = {
    default: 'bg-royal-primary/10 text-royal-primary dark:bg-crimson-primary/20 dark:text-white',
    success: 'bg-status-green/10 text-status-green',
    warning: 'bg-status-yellow/15 text-status-yellow',
    alert: 'bg-status-red/15 text-status-red',
    info: 'bg-sky-500/15 text-sky-600 dark:text-sky-400',
  } as const;
  const t = tones[tone ?? 'default'];
  return (
    <div className="stat-card shadow-card">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted">{label}</p>
          <p className="mt-2 text-2xl font-black tabular-nums truncate">{formatter ? formatter(value) : formatNumber(value)}</p>
        </div>
        <div className={cn('w-11 h-11 rounded-xl flex items-center justify-center shrink-0', t)}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
}

function Row({ label, value, icon, highlight }: { label: string; value: React.ReactNode; icon?: React.ReactNode; highlight?: boolean }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <span className="text-muted flex items-center gap-1.5 shrink-0">{icon}{label}</span>
      <span className={cn('font-semibold text-right', highlight && 'text-primary')}>{value}</span>
    </div>
  );
}
