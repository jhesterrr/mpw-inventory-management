import React, { useState, useMemo } from 'react';
import {
  ClipboardList,
  ArrowUpDown,
  Truck,
  Clock,
  CheckCircle2,
  Loader,
  Search,
  Filter,
  Eye,
  Calendar,
  Layers,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAppStore } from '@/store';
import type { Requisition, RequisitionStatus } from '@/types';
import Modal from '@/components/common/Modal';
import { cn, formatCurrency, formatDate, formatDateTime } from '@/utils';

const statusStyles: Record<
  RequisitionStatus,
  { bg: string; dot: string; text: string; border: string }
> = {
  Pending: {
    bg: 'bg-amber-500/15',
    dot: 'bg-amber-400 animate-pulse',
    text: 'text-amber-600 dark:text-amber-400',
    border: 'border-amber-500/30',
  },
  Approved: {
    bg: 'bg-sky-500/15',
    dot: 'bg-sky-400',
    text: 'text-sky-600 dark:text-sky-400',
    border: 'border-sky-500/30',
  },
  Fulfilled: {
    bg: 'bg-emerald-500/15',
    dot: 'bg-emerald-400',
    text: 'text-emerald-600 dark:text-emerald-400',
    border: 'border-emerald-500/30',
  },
  Rejected: {
    bg: 'bg-rose-500/15',
    dot: 'bg-rose-400',
    text: 'text-rose-600 dark:text-rose-400',
    border: 'border-rose-500/30',
  },
};

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

export default function OrdersPage() {
  const s = useAppStore(state => state);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<RequisitionStatus | 'ALL'>('ALL');
  const [selectedOrder, setSelectedOrder] = useState<Requisition | null>(null);

  const orders = useMemo(() => {
    return s.requisitions.filter(r => {
      if (statusFilter !== 'ALL' && r.status !== statusFilter) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        return (
          r.id.toLowerCase().includes(q) ||
          r.requestorName.toLowerCase().includes(q) ||
          r.deptCode.toLowerCase().includes(q) ||
          r.purpose.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [s.requisitions, statusFilter, search]);

  const fulfilled = s.requisitions.filter(r => r.status === 'Fulfilled').length;
  const pending = s.requisitions.filter(r => r.status === 'Pending').length;
  const approved = s.requisitions.filter(r => r.status === 'Approved').length;
  const totalValue = s.requisitions.reduce(
    (sum, r) => sum + r.items.reduce((a, i) => a + i.qty * i.unitCost, 0),
    0,
  );

  return (
    <motion.div
      className="space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      {/* Page Header */}
      <motion.div variants={fadeUpVariants} className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-royal-primary/10 dark:bg-crimson-primary/20 text-primary text-xs font-bold uppercase tracking-widest mb-2 border surface-border">
            <ClipboardList className="w-3.5 h-3.5" /> Logistics &amp; Operations
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">
            Order Fulfillment Pipeline
          </h2>
          <p className="text-xs sm:text-sm text-muted mt-1">
            Real-time requisition tracking from department request to warehouse dispatch.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3.5 py-1.5 rounded-full border surface-border text-xs font-semibold text-muted inline-flex items-center gap-2 bg-black/[0.02] dark:bg-white/[0.02]">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <strong className="text-[var(--text)]">{s.requisitions.length}</strong> Total Pipeline Records
          </span>
        </div>
      </motion.div>

      {/* Metric Cards Row */}
      <motion.div variants={fadeUpVariants} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          icon={<Clock className="w-5 h-5" />}
          tone="warning"
          label="Pending Review"
          value={pending}
          subtitle="Awaiting authorization"
        />
        <MetricCard
          icon={<Loader className="w-5 h-5" />}
          tone="info"
          label="Approved / Dispatch"
          value={approved}
          subtitle="Ready for stock issuance"
        />
        <MetricCard
          icon={<CheckCircle2 className="w-5 h-5" />}
          tone="success"
          label="Fulfilled Orders"
          value={fulfilled}
          subtitle="Completed issuances"
        />
        <MetricCard
          icon={<Truck className="w-5 h-5" />}
          tone="default"
          label="Total Pipeline Value"
          value={totalValue}
          formatter={formatCurrency}
          subtitle="Aggregated stock cost"
        />
      </motion.div>

      {/* Filter and Search Bar */}
      <motion.div variants={fadeUpVariants} className="stat-card shadow-card p-4 space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by Order Ref, Requestor, Department, or Purpose..."
              className="w-full h-11 pl-11 pr-4 rounded-xl border surface-border surface text-xs sm:text-sm outline-none focus:ring-2 focus:ring-royal-primary/30 transition-all"
            />
          </div>

          <div className="flex flex-wrap gap-1.5 items-center">
            {(['ALL', 'Pending', 'Approved', 'Fulfilled', 'Rejected'] as const).map(tab => {
              const active = statusFilter === tab;
              const count =
                tab === 'ALL'
                  ? s.requisitions.length
                  : s.requisitions.filter(r => r.status === tab).length;

              return (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setStatusFilter(tab)}
                  className={cn(
                    'px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all duration-200 flex items-center gap-1.5',
                    active
                      ? 'bg-royal-primary text-white border-royal-primary shadow-sm'
                      : 'surface-border surface text-muted hover:text-[var(--text)]',
                  )}
                >
                  <span>{tab === 'ALL' ? 'All Orders' : tab}</span>
                  <span
                    className={cn(
                      'text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold',
                      active
                        ? 'bg-white/20 text-white'
                        : 'bg-black/5 dark:bg-white/10 text-muted',
                    )}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </motion.div>

      {/* Orders Data Table */}
      <motion.section variants={fadeUpVariants} className="stat-card shadow-card p-0 overflow-hidden border surface-border">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b surface-border text-[11px] font-bold uppercase tracking-wider text-muted bg-black/[0.02] dark:bg-white/[0.02]">
                <th className="text-left px-5 py-3.5">Ref No</th>
                <th className="text-left px-3 py-3.5">Requestor</th>
                <th className="text-left px-3 py-3.5">Department & Purpose</th>
                <th className="text-center px-3 py-3.5">SKU Items</th>
                <th className="text-right px-3 py-3.5">Order Value</th>
                <th className="text-left px-3 py-3.5">Required Date</th>
                <th className="text-left px-3 py-3.5">Status</th>
                <th className="text-right px-5 py-3.5">Action</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o, idx) => {
                const st = statusStyles[o.status];
                const totalUnits = o.items.reduce((sum, i) => sum + i.qty, 0);
                const orderSum = o.items.reduce((sum, i) => sum + i.qty * i.unitCost, 0);

                return (
                  <tr
                    key={o.id}
                    className={cn(
                      'border-b surface-border last:border-0 transition-colors duration-150',
                      'hover:bg-royal-primary/[0.03] dark:hover:bg-white/[0.03]',
                      idx % 2 && 'bg-black/[0.01] dark:bg-white/[0.01]',
                    )}
                  >
                    <td className="px-5 py-4 font-mono font-bold text-xs text-primary">
                      {o.id}
                    </td>
                    <td className="px-3 py-4">
                      <p className="font-semibold text-xs sm:text-sm">{o.requestorName}</p>
                      {o.requestorEmail && (
                        <p className="text-[11px] text-muted font-mono truncate">{o.requestorEmail}</p>
                      )}
                    </td>
                    <td className="px-3 py-4">
                      <span className="inline-block px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-black/5 dark:bg-white/10 font-mono mb-0.5">
                        {o.deptCode}
                      </span>
                      <p className="text-xs text-muted truncate max-w-[280px]">
                        {o.purpose}
                      </p>
                    </td>
                    <td className="px-3 py-4 text-center">
                      <span className="inline-flex items-center gap-1 font-bold font-mono text-xs px-2 py-1 rounded-lg bg-black/5 dark:bg-white/10">
                        {totalUnits} units
                      </span>
                    </td>
                    <td className="px-3 py-4 text-right font-bold tabular-nums text-xs sm:text-sm">
                      {formatCurrency(orderSum)}
                    </td>
                    <td className="px-3 py-4 text-xs text-muted font-mono">
                      {formatDate(o.requiredDate)}
                    </td>
                    <td className="px-3 py-4">
                      <span
                        className={cn(
                          'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border',
                          st.bg,
                          st.text,
                          st.border,
                        )}
                      >
                        <span className={cn('w-2 h-2 rounded-full', st.dot)} />
                        {o.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <button
                        type="button"
                        onClick={() => setSelectedOrder(o)}
                        className="w-9 h-9 rounded-xl flex items-center justify-center border surface-border hover:border-royal-primary/40 hover:bg-royal-primary/10 text-muted hover:text-royal-primary transition-colors ml-auto"
                        title="View Order Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}

              {orders.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-5 py-16 text-center text-muted">
                    <ArrowUpDown className="w-10 h-10 mx-auto mb-3 opacity-60" />
                    <p className="font-semibold">No orders matched criteria</p>
                    <p className="text-xs mt-1">Try clearing your search query or status filter.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.section>

      {/* Order Details Modal */}
      {selectedOrder && (
        <Modal
          title={`Order Reference: ${selectedOrder.id}`}
          open={true}
          onClose={() => setSelectedOrder(null)}
          maxWidthClass="max-w-4xl"
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-3.5 rounded-2xl bg-black/[0.02] dark:bg-white/[0.02] border surface-border text-xs">
              <div>
                <p className="text-muted uppercase font-bold text-[10px]">Requestor</p>
                <p className="font-semibold text-sm mt-0.5">{selectedOrder.requestorName}</p>
              </div>
              <div>
                <p className="text-muted uppercase font-bold text-[10px]">Department</p>
                <p className="font-semibold text-sm mt-0.5">{selectedOrder.deptCode}</p>
              </div>
              <div>
                <p className="text-muted uppercase font-bold text-[10px]">Submitted Date</p>
                <p className="font-mono text-sm mt-0.5">{formatDateTime(selectedOrder.submittedAt)}</p>
              </div>
              <div>
                <p className="text-muted uppercase font-bold text-[10px]">Current Status</p>
                <p className="font-bold text-sm mt-0.5">{selectedOrder.status}</p>
              </div>
            </div>

            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-muted mb-2">
                Order Items ({selectedOrder.items.length})
              </p>
              <div className="rounded-xl border surface-border overflow-hidden">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b surface-border text-muted uppercase bg-black/[0.02] dark:bg-white/[0.02]">
                      <th className="text-left px-3 py-2 font-semibold">SKU</th>
                      <th className="text-left px-3 py-2 font-semibold">Description</th>
                      <th className="text-right px-3 py-2 font-semibold">Qty</th>
                      <th className="text-right px-3 py-2 font-semibold">Unit Cost</th>
                      <th className="text-right px-3 py-2 font-semibold">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedOrder.items.map(item => (
                      <tr key={item.itemId} className="border-b surface-border last:border-0">
                        <td className="px-3 py-2.5 font-mono text-muted">{item.sku}</td>
                        <td className="px-3 py-2.5 font-medium">{item.itemName}</td>
                        <td className="px-3 py-2.5 text-right font-bold tabular-nums">{item.qty}</td>
                        <td className="px-3 py-2.5 text-right tabular-nums">{formatCurrency(item.unitCost)}</td>
                        <td className="px-3 py-2.5 text-right font-bold tabular-nums">
                          {formatCurrency(item.qty * item.unitCost)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex justify-between items-center pt-2 border-t surface-border text-sm">
              <span className="text-muted">Total Order Valuation</span>
              <span className="font-black text-lg text-primary">
                {formatCurrency(
                  selectedOrder.items.reduce((sum, i) => sum + i.qty * i.unitCost, 0),
                )}
              </span>
            </div>
          </div>
        </Modal>
      )}
    </motion.div>
  );
}

function MetricCard({
  icon,
  label,
  value,
  tone,
  formatter,
  subtitle,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  tone: 'success' | 'warning' | 'info' | 'default';
  formatter?: (n: number) => string;
  subtitle?: string;
}) {
  const map = {
    success: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
    warning: 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30',
    info: 'bg-sky-500/15 text-sky-600 dark:text-sky-400 border-sky-500/30',
    default: 'bg-royal-primary/10 text-royal-primary dark:bg-crimson-primary/20 dark:text-white border-royal-primary/20',
  } as const;

  return (
    <div className="stat-card shadow-card p-3.5 sm:p-5 group hover:border-royal-primary/30 transition-all flex flex-col justify-between min-w-0">
      <div className="flex items-start justify-between gap-2 sm:gap-3">
        <p className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-muted truncate flex-1 min-w-0">
          {label}
        </p>
        <div
          className={cn(
            'w-9 h-9 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl flex items-center justify-center shrink-0 border transition-transform duration-300 group-hover:scale-105 shadow-sm',
            map[tone],
          )}
        >
          {icon}
        </div>
      </div>

      <div className="mt-2 min-w-0">
        <p className="text-xl sm:text-2xl md:text-3xl font-extrabold tabular-nums tracking-tight break-all">
          {formatter ? formatter(value) : value}
        </p>
        {subtitle && <p className="mt-1 text-[11px] sm:text-xs text-muted truncate">{subtitle}</p>}
      </div>
    </div>
  );
}
