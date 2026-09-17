import { FileBadge, ChevronDown, ClipboardCheck, PackageOpen, XCircle, Eye, Sparkles } from 'lucide-react';
import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import StatusBadge from '@/components/common/StatusBadge';
import Modal from '@/components/common/Modal';
import { useAppStore, useHasRole } from '@/store';
import type { Requisition, RequisitionStatus } from '@/types';
import { cn, formatCurrency, formatDateTime, formatDate } from '@/utils';

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

const statusStyles: Record<RequisitionStatus, string> = {
  Pending: 'bg-status-yellow/15 text-status-yellow',
  Approved: 'bg-sky-500/15 text-sky-600 dark:text-sky-400',
  Fulfilled: 'bg-status-green/15 text-status-green',
  Rejected: 'bg-status-red/15 text-status-red',
};

export function MyRequisitionsPage() {
  const s = useAppStore(state => state);
  const user = s.currentUser;
  const list = useMemo(
    () => user ? s.getCustomerMyRequisitions(user.name) : [],
    [s.requisitions, user],
  );
  const [filter, setFilter] = useState<RequisitionStatus | 'All'>('All');
  const [expanded, setExpanded] = useState<string | null>(null);
  const filtered = filter === 'All' ? list : list.filter(r => r.status === filter);
  const countByStatus = (st: RequisitionStatus) => list.filter(r => r.status === st).length;

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
            <FileBadge className="w-3.5 h-3.5" /> Customer Portal
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">
            My Requisitions
          </h2>
          <p className="text-xs sm:text-sm text-muted mt-1">
            Track status, fulfillment dates, and internal approval milestones for your requests.
          </p>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {(['All', 'Pending', 'Approved', 'Fulfilled', 'Rejected'] as const).map(st => (
            <button
              key={st}
              type="button"
              onClick={() => setFilter(st)}
              className={cn(
                'px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all duration-200',
                filter === st
                  ? 'bg-royal-primary text-white border-royal-primary shadow-sm'
                  : 'surface-border surface text-muted hover:text-[var(--text)]',
              )}
            >
              {st}
              <span className={cn('ml-1.5 text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold', filter === st ? 'bg-white/20' : 'bg-black/5 dark:bg-white/10')}>
                {st === 'All' ? list.length : countByStatus(st)}
              </span>
            </button>
          ))}
        </div>
      </motion.div>

      <motion.div variants={fadeUpVariants} className="space-y-3">
        {filtered.map(r => {
          const totalQty = r.items.reduce((s, i) => s + i.qty, 0);
          const total = r.items.reduce((sum, i) => sum + i.qty * i.unitCost, 0);
          const open = expanded === r.id;
          return (
            <div key={r.id} className="stat-card shadow-card overflow-hidden">
              <button
                type="button"
                onClick={() => setExpanded(open ? null : r.id)}
                className="w-full text-left p-4 md:p-5 flex flex-col md:flex-row md:items-center gap-3 md:gap-5"
              >
                <div className="w-12 h-12 rounded-xl bg-royal-primary/10 dark:bg-crimson-primary/20 text-primary flex items-center justify-center shrink-0">
                  <FileBadge className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0 grid grid-cols-2 md:grid-cols-5 gap-3 md:gap-4 items-center">
                  <div className="col-span-2 md:col-span-1 min-w-0">
                    <p className="text-[11px] uppercase tracking-wider text-muted">Req ID</p>
                    <p className="font-mono font-bold truncate">{r.id}</p>
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] uppercase tracking-wider text-muted">Requestor</p>
                    <p className="font-semibold truncate">{r.requestorName}</p>
                  </div>
                  <div>
                    <p className="text-[11px] uppercase tracking-wider text-muted">Items</p>
                    <p className="font-bold">{r.items.length} · {totalQty} units</p>
                  </div>
                  <div>
                    <p className="text-[11px] uppercase tracking-wider text-muted">Required</p>
                    <p className="font-semibold">{formatDate(r.requiredDate)}</p>
                  </div>
                  <div className="col-span-2 md:col-span-1 md:text-right">
                    <span className={cn('badge-pill', statusStyles[r.status])}>
                      <span className={cn(
                        'w-2 h-2 rounded-full',
                        r.status === 'Pending' && 'bg-status-yellow animate-pulse',
                        r.status === 'Fulfilled' && 'bg-status-green',
                        r.status === 'Approved' && 'bg-sky-500',
                        r.status === 'Rejected' && 'bg-status-red',
                      )} />
                      {r.status}
                    </span>
                    <p className="mt-1 text-xs text-muted">{formatCurrency(total)}</p>
                  </div>
                </div>
                <ChevronDown className={cn('w-5 h-5 text-muted shrink-0 transition-transform', open && 'rotate-180')} />
              </button>
              {open && (
                <div className="px-4 md:px-5 pb-5 border-t surface-border pt-4 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-[11px] uppercase tracking-wider text-muted">Purpose</p>
                      <p className="font-semibold mt-1">{r.purpose}</p>
                    </div>
                    <div>
                      <p className="text-[11px] uppercase tracking-wider text-muted">Department</p>
                      <p className="font-semibold mt-1">{r.deptCode}</p>
                    </div>
                    <div>
                      <p className="text-[11px] uppercase tracking-wider text-muted">Submitted</p>
                      <p className="font-semibold mt-1">{formatDateTime(r.submittedAt)}</p>
                    </div>
                    {r.notes && (
                      <div className="md:col-span-3">
                        <p className="text-[11px] uppercase tracking-wider text-muted">Notes</p>
                        <p className="mt-1 text-muted">{r.notes}</p>
                      </div>
                    )}
                    {r.rejectionReason && (
                      <div className="md:col-span-3 p-3 rounded-xl bg-status-red/10 border border-status-red/30">
                        <p className="text-[11px] uppercase tracking-wider text-status-red font-bold">Rejection Reason</p>
                        <p className="mt-1 font-semibold">{r.rejectionReason}</p>
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="text-[11px] uppercase tracking-wider text-muted mb-2">Items Requested</p>
                    <div className="rounded-xl border surface-border divide-y surface-border overflow-hidden">
                      {r.items.map(it => {
                        const inv = s.inventory.find(i => i.id === it.itemId);
                        const status = inv ? s.getItemStatus(inv) : null;
                        return (
                          <div key={it.itemId} className="px-4 py-3 flex items-center justify-between gap-3">
                            <div className="min-w-0">
                              <p className="font-semibold truncate">{it.itemName}</p>
                              <p className="text-xs text-muted font-mono">{it.sku} · {formatCurrency(it.unitCost)} ea</p>
                            </div>
                            <div className="flex items-center gap-3 shrink-0">
                              {status && <StatusBadge status={status} />}
                              <div className="text-right">
                                <p className="font-bold tabular-nums">× {it.qty}</p>
                                <p className="text-xs text-muted tabular-nums">{formatCurrency(it.qty * it.unitCost)}</p>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div className="stat-card p-16 text-center">
            <FileBadge className="w-10 h-10 text-muted mx-auto mb-3 opacity-60" />
            <p className="font-semibold">No requisitions match this filter</p>
            <p className="text-sm text-muted mt-1">Browse inventory and add items to cart to get started.</p>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}

export function RequisitionsPageWarehouse() {
  const s = useAppStore(state => state);
  const canEdit = useHasRole(['editor', 'warehouse']);
  const [filter, setFilter] = useState<RequisitionStatus | 'All'>('Pending');
  const [selected, setSelected] = useState<Requisition | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [toast, setToast] = useState<string | null>(null);
  const list = filter === 'All' ? s.requisitions : s.requisitions.filter(r => r.status === filter);

  const counts = useMemo(() => ({
    Pending: s.requisitions.filter(r => r.status === 'Pending').length,
    Approved: s.requisitions.filter(r => r.status === 'Approved').length,
    Fulfilled: s.requisitions.filter(r => r.status === 'Fulfilled').length,
    Rejected: s.requisitions.filter(r => r.status === 'Rejected').length,
  }), [s.requisitions]);

  const approve = (r: Requisition) => {
    s.approveRequisition(r.id);
    setToast(`Requisition ${r.id} approved.`);
    setSelected(null);
    setTimeout(() => setToast(null), 2200);
  };
  const fulfill = (r: Requisition) => {
    s.fulfillRequisition(r.id);
    setToast(`Requisition ${r.id} fulfilled. Stock deducted & logs recorded.`);
    setSelected(null);
    setTimeout(() => setToast(null), 2200);
  };
  const reject = (r: Requisition) => {
    if (!rejectReason.trim()) return;
    s.rejectRequisition(r.id, rejectReason.trim());
    setToast(`Requisition ${r.id} rejected.`);
    setSelected(null);
    setRejectReason('');
    setTimeout(() => setToast(null), 2200);
  };

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
            <ClipboardCheck className="w-3.5 h-3.5" /> Warehouse Operations
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">
            Requisition Approval Desk
          </h2>
          <p className="text-xs sm:text-sm text-muted mt-1">
            Authorize department order vouchers and release stock inventory.
          </p>
        </div>
        <div>
          <span className="px-3.5 py-1.5 rounded-full border surface-border text-xs font-semibold text-muted inline-flex items-center gap-1.5 bg-black/[0.02] dark:bg-white/[0.02]">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            <strong className="text-[var(--text)]">{s.requisitions.length}</strong> Total Requisitions
          </span>
        </div>
      </motion.div>

      <motion.div variants={fadeUpVariants} className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {(['Pending', 'Approved', 'Fulfilled', 'Rejected'] as const).map(st => {
          const n = counts[st];
          const active = filter === st;
          return (
            <button
              key={st}
              type="button"
              onClick={() => setFilter(st)}
              className={cn(
                'stat-card text-left p-4 transition-all',
                active && 'ring-2 ring-royal-primary/30',
              )}
            >
              <p className="text-xs uppercase tracking-wider text-muted">{st}</p>
              <p className="text-2xl font-black mt-1 tabular-nums">{n}</p>
            </button>
          );
        })}
      </motion.div>

      <div className="hidden md:block stat-card shadow-card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b surface-border text-xs uppercase tracking-wider text-muted">
                <th className="text-left font-semibold px-5 py-4">Ref</th>
                <th className="text-left font-semibold px-3 py-4">Requestor</th>
                <th className="text-left font-semibold px-3 py-4">Dept</th>
                <th className="text-left font-semibold px-3 py-4">Date Submitted</th>
                <th className="text-center font-semibold px-3 py-4">Items</th>
                <th className="text-left font-semibold px-3 py-4">Status</th>
                <th className="text-right font-semibold px-5 py-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {list.map(r => (
                <tr key={r.id} className="border-b surface-border last:border-0 hover:bg-black/[0.02] dark:hover:bg-white/[0.02]">
                  <td className="px-5 py-4 font-mono text-xs font-bold">{r.id}</td>
                  <td className="px-3 py-4 font-semibold truncate max-w-[180px]">{r.requestorName}</td>
                  <td className="px-3 py-4 text-muted">{r.deptCode}</td>
                  <td className="px-3 py-4 text-muted">{formatDate(r.submittedAt)}</td>
                  <td className="px-3 py-4 text-center font-bold">{r.items.reduce((sum, i) => sum + i.qty, 0)}</td>
                  <td className="px-3 py-4"><span className={cn('badge-pill', statusStyles[r.status])}>{r.status}</span></td>
                  <td className="px-5 py-4 text-right">
                    <div className="inline-flex items-center gap-2 justify-end">
                      <button type="button" onClick={() => setSelected(r)} className="btn-outline h-10 px-3 text-xs">
                        <Eye className="w-3.5 h-3.5" /> Review
                      </button>
                      {canEdit && r.status === 'Pending' && (
                        <button type="button" onClick={() => approve(r)} className="h-10 px-4 rounded-full bg-sky-500 hover:bg-sky-600 text-white text-xs font-bold inline-flex items-center gap-1">
                          <ClipboardCheck className="w-3.5 h-3.5" /> Approve
                        </button>
                      )}
                      {(r.status === 'Approved' || r.status === 'Pending') && canEdit && (
                        <button
                          type="button"
                          onClick={() => fulfill(r)}
                          className="h-10 px-4 rounded-full bg-status-green hover:brightness-110 text-white text-xs font-bold inline-flex items-center gap-1"
                        >
                          <PackageOpen className="w-3.5 h-3.5" /> Issue
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {list.length === 0 && (
                <tr><td colSpan={7} className="px-5 py-12 text-center text-muted">No requisitions in this category.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="md:hidden space-y-3">
        {list.map(r => (
          <div key={r.id} className="stat-card p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="font-mono text-xs font-bold text-muted">{r.id}</p>
                <p className="font-bold truncate mt-0.5">{r.requestorName}</p>
                <p className="text-xs text-muted">{r.deptCode} · {formatDate(r.submittedAt)}</p>
              </div>
              <span className={cn('badge-pill shrink-0', statusStyles[r.status])}>{r.status}</span>
            </div>
            <div className="mt-3 flex items-center justify-between text-sm">
              <span className="text-muted">{r.items.length} lines · {r.items.reduce((s, i) => s + i.qty, 0)} units</span>
              <div className="flex items-center gap-1">
                <button type="button" onClick={() => setSelected(r)} className="btn-outline h-9 px-3 text-xs">Review</button>
                {canEdit && r.status === 'Pending' && (
                  <button type="button" onClick={() => approve(r)} className="h-9 px-3 rounded-full bg-sky-500 text-white text-xs font-bold">Approve</button>
                )}
                {(r.status === 'Approved' || r.status === 'Pending') && canEdit && (
                  <button type="button" onClick={() => fulfill(r)} className="h-9 px-3 rounded-full bg-status-green text-white text-xs font-bold">Issue</button>
                )}
              </div>
            </div>
          </div>
        ))}
        {list.length === 0 && <div className="stat-card p-10 text-center text-muted">No requisitions to show.</div>}
      </div>

      <Modal
        open={!!selected}
        onClose={() => { setSelected(null); setRejectReason(''); }}
        title="Requisition Review"
        maxWidthClass="max-w-3xl"
        footer={
          selected ? (
            <div className="flex flex-wrap justify-between gap-2 items-center">
              {selected.status === 'Pending' ? (
                <div className="flex gap-2 items-center max-w-full">
                  <input
                    type="text"
                    placeholder="Rejection reason (if rejecting)..."
                    value={rejectReason}
                    onChange={e => setRejectReason(e.target.value)}
                    className="h-10 w-[240px] max-w-[50vw] rounded-xl border surface-border surface px-3 text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => reject(selected)}
                    disabled={!rejectReason.trim()}
                    className={cn('h-10 px-4 rounded-full bg-status-red text-white text-xs font-bold inline-flex items-center gap-1',
                      !rejectReason.trim() && 'opacity-50 cursor-not-allowed',
                    )}
                  >
                    <XCircle className="w-3.5 h-3.5" /> Reject
                  </button>
                </div>
              ) : <div />}
              <div className="flex items-center gap-2">
                {canEdit && selected.status === 'Pending' && (
                  <button type="button" onClick={() => approve(selected)} className="h-11 px-5 rounded-full bg-sky-500 text-white font-bold inline-flex items-center gap-2">
                    <ClipboardCheck className="w-4 h-4" /> Approve
                  </button>
                )}
                {canEdit && (selected.status === 'Approved' || selected.status === 'Pending') && (
                  <button type="button" onClick={() => fulfill(selected)} className="btn-primary h-11 px-5">
                    <PackageOpen className="w-4 h-4" /> Fulfill & Issue Stock
                  </button>
                )}
              </div>
            </div>
          ) : null
        }
      >
        {selected && (
          <RequisitionDetails r={selected} />
        )}
      </Modal>

      {toast && (
        <div className="fixed bottom-24 md:bottom-8 left-1/2 -translate-x-1/2 z-[120] animate-fade-in">
          <div className="px-4 py-3 rounded-xl surface shadow-card-lg border surface-border text-sm font-semibold inline-flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-status-green" /> {toast}
          </div>
        </div>
      )}
    </motion.div>
  );
}

function RequisitionDetails({ r }: { r: Requisition }) {
  const s = useAppStore(state => state);
  const total = r.items.reduce((sum, i) => sum + i.qty * i.unitCost, 0);
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3 p-4 rounded-xl bg-black/[0.03] dark:bg-white/[0.04]">
        <div>
          <p className="text-[11px] uppercase tracking-wider text-muted">Reference</p>
          <p className="font-mono font-bold text-lg">{r.id}</p>
        </div>
        <div className="mx-2 h-10 w-px surface-border hidden sm:block" />
        <div>
          <p className="text-[11px] uppercase tracking-wider text-muted">Requestor</p>
          <p className="font-bold">{r.requestorName}</p>
        </div>
        <div className="mx-2 h-10 w-px surface-border hidden sm:block" />
        <div>
          <p className="text-[11px] uppercase tracking-wider text-muted">Status</p>
          <span className={cn('badge-pill mt-1', statusStyles[r.status])}>{r.status}</span>
        </div>
        <div className="flex-1 md:text-right">
          <p className="text-[11px] uppercase tracking-wider text-muted">Estimated Value</p>
          <p className="font-black text-2xl tabular-nums">{formatCurrency(total)}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
        <div><p className="text-[11px] uppercase tracking-wider text-muted">Department</p><p className="font-semibold mt-1">{r.deptCode}</p></div>
        <div><p className="text-[11px] uppercase tracking-wider text-muted">Required Date</p><p className="font-semibold mt-1">{formatDate(r.requiredDate)}</p></div>
        <div><p className="text-[11px] uppercase tracking-wider text-muted">Submitted</p><p className="font-semibold mt-1">{formatDateTime(r.submittedAt)}</p></div>
        <div className="md:col-span-3"><p className="text-[11px] uppercase tracking-wider text-muted">Purpose</p><p className="mt-1">{r.purpose}</p></div>
        {r.notes && <div className="md:col-span-3"><p className="text-[11px] uppercase tracking-wider text-muted">Notes</p><p className="mt-1 text-muted">{r.notes}</p></div>}
        {r.processedAt && (
          <div className="md:col-span-3"><p className="text-[11px] uppercase tracking-wider text-muted">Processed By</p><p className="mt-1">{r.processedBy} on {formatDateTime(r.processedAt)}</p></div>
        )}
      </div>

      <div>
        <p className="text-[11px] uppercase tracking-wider text-muted mb-2">Line Items & Stock Availability</p>
        <div className="rounded-xl border surface-border divide-y surface-border overflow-hidden">
          {r.items.map(it => {
            const inv = s.inventory.find(i => i.id === it.itemId);
            const available = inv?.quantity ?? 0;
            const short = available < it.qty;
            const status = inv ? s.getItemStatus(inv) : null;
            return (
              <div key={it.itemId} className="px-4 py-3 flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="font-semibold truncate">{it.itemName}</p>
                  <p className="text-xs text-muted font-mono">{it.sku} · Unit: {formatCurrency(it.unitCost)}</p>
                </div>
                <div className="flex items-center gap-4 shrink-0">
                  {status && <StatusBadge status={status} />}
                  <div className="text-right text-sm">
                    <p className="text-muted">Requested: <span className="font-bold text-theme">{it.qty}</span></p>
                    <p className={cn(short ? 'text-status-red font-bold' : 'text-muted')}>In Stock: {available}</p>
                  </div>
                  <div className="text-right min-w-[90px]">
                    <p className="text-xs text-muted">Line Total</p>
                    <p className="font-bold tabular-nums">{formatCurrency(it.qty * it.unitCost)}</p>
                  </div>
                </div>
                {short && (
                  <div className="md:hidden text-xs font-bold text-status-red bg-status-red/10 inline-flex items-center gap-1 px-2 py-1 rounded-full self-start">
                    ⚠ Shortage of {it.qty - available} units
                  </div>
                )}
              </div>
            );
          })}
        </div>
        {r.items.some(it => (s.inventory.find(i => i.id === it.itemId)?.quantity ?? 0) < it.qty) && (
          <div className="mt-4 p-4 rounded-xl bg-status-yellow/10 border border-status-yellow/30 text-sm flex items-start gap-3">
            <span className="text-2xl">⚠️</span>
            <div>
              <p className="font-bold text-status-yellow">Insufficient Stock Warning</p>
              <p className="text-muted mt-1">
                One or more lines requested more than the current available quantity. Fulfilling will issue the stock currently available. Consider partial fulfillment or restocking first.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function RequisitionsPage() {
  const isCustomer = useHasRole(['customer']);
  if (isCustomer) return <MyRequisitionsPage />;
  return <RequisitionsPageWarehouse />;
}
