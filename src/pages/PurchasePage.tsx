import React, { useMemo, useState } from 'react';
import {
  ShoppingCart,
  ArrowRight,
  Truck,
  DollarSign,
  PackageOpen,
  Filter,
  CheckCircle2,
  Download,
  CheckSquare,
  Square,
  Sparkles,
  Building,
  FileText,
  Clock,
  Send,
  ChevronDown,
  ChevronUp,
  Trash2,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAppStore } from '@/store';
import StatusBadge from '@/components/common/StatusBadge';
import { cn, formatCurrency, formatNumber } from '@/utils';

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

interface DraftPOLine {
  itemId: string;
  sku: string;
  name: string;
  unit: string;
  supplier: string;
  currentQty: number;
  orderQty: number;
  unitCost: number;
  lineTotal: number;
}

interface DraftPO {
  id: string;
  createdAt: number;
  status: 'Draft' | 'Sent' | 'Received';
  lines: DraftPOLine[];
  total: number;
  expanded: boolean;
}

let poCounter = 1;

export default function PurchasePage() {
  const s = useAppStore(state => state);
  const status = s.getInventoryByStatus();
  const [toast, setToast] = useState<string | null>(null);
  const [draftPOs, setDraftPOs] = useState<DraftPO[]>([]);

  const suggestions = useMemo(() => {
    const candidates = [...status.red, ...status.yellow]
      .sort((a, b) => a.quantity - b.quantity)
      .slice(0, 12);
    return candidates.map(it => ({
      item: it,
      recommendedQty: Math.max(10, it.reorderPoint * 2 - it.quantity + 5),
      lineTotal: Math.max(10, it.reorderPoint * 2 - it.quantity + 5) * it.unitCost,
    }));
  }, [status]);

  const suggestedTotal = suggestions.reduce((sum, r) => sum + r.lineTotal, 0);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const toggle = (id: string) =>
    setSelected(prev => {
      const n = new Set(prev);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });

  const selectAll = () => {
    if (selected.size === suggestions.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(suggestions.map(sg => sg.item.id)));
    }
  };

  const selectedItems = suggestions.filter(x => selected.has(x.item.id));
  const selectedTotal = selectedItems.reduce((sum, r) => sum + r.lineTotal, 0);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  const handleCreateDraft = () => {
    if (selected.size === 0) return;
    const lines: DraftPOLine[] = selectedItems.map(r => ({
      itemId: r.item.id,
      sku: r.item.sku,
      name: r.item.name,
      unit: r.item.unit,
      supplier: r.item.supplier || 'Standard Vendor',
      currentQty: r.item.quantity,
      orderQty: r.recommendedQty,
      unitCost: r.item.unitCost,
      lineTotal: r.lineTotal,
    }));

    const newPO: DraftPO = {
      id: `PO-${String(poCounter++).padStart(4, '0')}`,
      createdAt: Date.now(),
      status: 'Draft',
      lines,
      total: selectedTotal,
      expanded: true,
    };

    setDraftPOs(prev => [newPO, ...prev]);
    setSelected(new Set());
    showToast(`Draft PO ${newPO.id} created with ${lines.length} line items (${formatCurrency(selectedTotal)})`);
  };

  const toggleExpand = (id: string) => {
    setDraftPOs(prev => prev.map(po => (po.id === id ? { ...po, expanded: !po.expanded } : po)));
  };

  const markAsSent = (id: string) => {
    setDraftPOs(prev => prev.map(po => (po.id === id ? { ...po, status: 'Sent' } : po)));
    showToast(`PO ${id} has been marked as Sent to supplier.`);
  };

  const markAsReceived = (id: string) => {
    const po = draftPOs.find(p => p.id === id);
    if (po) {
      po.lines.forEach(line => {
        s.adjustStock(line.itemId, line.orderQty);
      });
    }
    setDraftPOs(prev => prev.map(p => (p.id === id ? { ...p, status: 'Received' } : p)));
    showToast(`PO ${id} marked as Received. Inventory has been updated.`);
  };

  const deletePO = (id: string) => {
    setDraftPOs(prev => prev.filter(po => po.id !== id));
    showToast(`PO ${id} has been deleted.`);
  };

  const draftCount = draftPOs.filter(p => p.status === 'Draft').length;
  const sentCount = draftPOs.filter(p => p.status === 'Sent').length;

  return (
    <motion.div className="space-y-6" variants={containerVariants} initial="hidden" animate="show">
      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-6 right-6 z-50 px-4 py-3 rounded-2xl bg-emerald-600 text-white font-semibold text-xs shadow-2xl flex items-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4" />
            {toast}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <motion.div variants={fadeUpVariants} className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-royal-primary/10 dark:bg-crimson-primary/20 text-primary text-xs font-bold uppercase tracking-widest mb-2 border surface-border">
            <DollarSign className="w-3.5 h-3.5" /> Supply Chain &amp; Procurement
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">Purchase Reorder Center</h2>
          <p className="text-xs sm:text-sm text-muted mt-1">
            Algorithmic stock replenishment suggestions based on dynamic reorder points.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3.5 py-1.5 rounded-full border surface-border text-xs font-semibold text-muted inline-flex items-center gap-1.5 bg-black/[0.02] dark:bg-white/[0.02]">
            <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
            <strong className="text-[var(--text)]">{suggestions.length}</strong> Replenishment Alerts
          </span>
        </div>
      </motion.div>

      {/* KPI Cards */}
      <motion.div variants={fadeUpVariants} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MiniCard label="Reorder Suggestions" value={suggestions.length} icon={<PackageOpen className="w-5 h-5" />} tone="warning" subtitle="Critical and low inventory" />
        <MiniCard label="Total Replenish Cost" value={suggestedTotal} icon={<DollarSign className="w-5 h-5" />} tone="info" formatter={formatCurrency} subtitle="Estimated purchase value" />
        <MiniCard label="Draft POs" value={draftCount} icon={<FileText className="w-5 h-5" />} tone="default" subtitle="Pending approval / send" />
        <MiniCard label="Sent to Supplier" value={sentCount} icon={<Truck className="w-5 h-5" />} tone="success" subtitle="Awaiting delivery" />
      </motion.div>

      {/* Reorder Suggestions Table */}
      <motion.section variants={fadeUpVariants} className="stat-card shadow-card p-0 overflow-hidden border surface-border">
        <div className="p-4 sm:p-5 border-b surface-border flex flex-wrap items-center justify-between gap-3 bg-black/[0.01] dark:bg-white/[0.01]">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-royal-primary/10 dark:bg-crimson-primary/20 text-primary flex items-center justify-center">
              <Filter className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base">Reorder Queue</h3>
              <p className="text-xs text-muted">
                Select items below, then click <strong>Create Draft PO</strong>
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={selectAll}
            className="text-xs font-semibold px-3 py-1.5 rounded-xl border surface-border surface hover:border-royal-primary/30 text-muted hover:text-[var(--text)] transition-colors flex items-center gap-1.5"
          >
            {selected.size === suggestions.length && suggestions.length > 0
              ? <CheckSquare className="w-4 h-4 text-royal-primary" />
              : <Square className="w-4 h-4 text-muted" />}
            Select All ({suggestions.length})
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b surface-border text-[11px] font-bold uppercase tracking-wider text-muted bg-black/[0.02] dark:bg-white/[0.02]">
                <th className="px-5 py-3.5 w-12 text-center">Select</th>
                <th className="text-left px-3 py-3.5">Inventory Item</th>
                <th className="text-left px-3 py-3.5">Assigned Supplier</th>
                <th className="text-center px-3 py-3.5">Available Stock</th>
                <th className="text-center px-3 py-3.5">Reorder Point</th>
                <th className="text-center px-3 py-3.5">Status</th>
                <th className="text-center px-3 py-3.5">Order Qty</th>
                <th className="text-right px-5 py-3.5">Est. Total</th>
              </tr>
            </thead>
            <tbody>
              {suggestions.map((r, idx) => {
                const isChecked = selected.has(r.item.id);
                return (
                  <tr
                    key={r.item.id}
                    onClick={() => toggle(r.item.id)}
                    className={cn(
                      'border-b surface-border last:border-0 transition-colors duration-150 cursor-pointer',
                      isChecked ? 'bg-royal-primary/[0.06] dark:bg-crimson-primary/15' : 'hover:bg-black/[0.02] dark:hover:bg-white/[0.02]',
                      idx % 2 && !isChecked && 'bg-black/[0.01] dark:bg-white/[0.01]',
                    )}
                  >
                    <td className="px-5 py-3.5 text-center" onClick={e => e.stopPropagation()}>
                      <input type="checkbox" checked={isChecked} onChange={() => toggle(r.item.id)} className="rounded border-gray-300 text-royal-primary focus:ring-royal-primary/40 cursor-pointer" />
                    </td>
                    <td className="px-3 py-3.5">
                      <p className="font-semibold text-xs sm:text-sm">{r.item.name}</p>
                      <p className="text-[11px] text-muted font-mono mt-0.5">{r.item.sku} · {r.item.unit} · {r.item.category}</p>
                    </td>
                    <td className="px-3 py-3.5">
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-muted">
                        <Building className="w-3 h-3 text-muted/70" />
                        {r.item.supplier || 'Standard Vendor'}
                      </span>
                    </td>
                    <td className="px-3 py-3.5 text-center font-bold tabular-nums text-xs">{formatNumber(r.item.quantity)}</td>
                    <td className="px-3 py-3.5 text-center text-muted tabular-nums font-mono text-xs">{formatNumber(r.item.reorderPoint)}</td>
                    <td className="px-3 py-3.5 text-center"><StatusBadge status={s.getItemStatus(r.item)} size="sm" /></td>
                    <td className="px-3 py-3.5 text-center">
                      <span className="inline-flex items-center font-bold font-mono text-xs px-2.5 py-1 rounded-lg bg-royal-primary/10 text-royal-primary dark:bg-white/10 dark:text-[#E8D499]">
                        +{formatNumber(r.recommendedQty)}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right font-extrabold tabular-nums text-xs sm:text-sm">{formatCurrency(r.lineTotal)}</td>
                  </tr>
                );
              })}
              {suggestions.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-5 py-16 text-center text-muted">
                    <CheckCircle2 className="w-10 h-10 mx-auto mb-2 text-emerald-500 opacity-80" />
                    <p className="font-semibold">All inventory items are healthy!</p>
                    <p className="text-xs mt-1">No items have reached their reorder threshold.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {suggestions.length > 0 && (
          <div className="p-4 sm:p-5 border-t surface-border flex flex-col sm:flex-row items-center justify-between gap-3 bg-black/[0.01] dark:bg-white/[0.01]">
            <div className="text-xs text-muted">
              Selected: <strong className="text-[var(--text)]">{selected.size}</strong> items · Total Value:{' '}
              <strong className="text-primary">{formatCurrency(selectedTotal)}</strong>
            </div>
            <div className="flex items-center gap-2">
              <button type="button" className="btn-outline h-11 px-4 text-xs font-semibold flex items-center gap-1.5">
                <Download className="w-4 h-4" /> Export CSV
              </button>
              <button
                type="button"
                onClick={handleCreateDraft}
                disabled={selected.size === 0}
                className={cn('btn-primary h-11 px-5 text-xs font-bold flex items-center gap-2', selected.size === 0 && 'opacity-40 cursor-not-allowed')}
              >
                Create Draft PO ({selected.size}) <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </motion.section>

      {/* Purchase Orders Section */}
      <motion.section variants={fadeUpVariants} className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-base flex items-center gap-2">
            <Truck className="w-5 h-5 text-primary" /> Purchase Orders
          </h3>
          {draftPOs.length > 0 && (
            <span className="text-xs text-muted">{draftPOs.length} PO{draftPOs.length !== 1 ? 's' : ''} total</span>
          )}
        </div>

        {draftPOs.length === 0 ? (
          <div className="stat-card shadow-card p-6 border surface-border">
            <div className="flex flex-col items-center justify-center py-10 text-center gap-3">
              <div className="w-16 h-16 rounded-2xl bg-royal-primary/10 dark:bg-crimson-primary/20 text-primary flex items-center justify-center">
                <FileText className="w-8 h-8 text-primary" />
              </div>
              <p className="font-bold text-base">No Purchase Orders Yet</p>
              <p className="text-muted max-w-sm text-xs leading-relaxed">
                Select items from the queue above and click <strong>Create Draft PO</strong> to generate a vendor order.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {draftPOs.map(po => (
              <div key={po.id} className="stat-card shadow-card border surface-border overflow-hidden">
                {/* PO Header Row */}
                <div className="p-4 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      'w-10 h-10 rounded-xl flex items-center justify-center shrink-0',
                      po.status === 'Draft' && 'bg-amber-500/15 text-amber-600 dark:text-amber-400',
                      po.status === 'Sent' && 'bg-sky-500/15 text-sky-600 dark:text-sky-400',
                      po.status === 'Received' && 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400',
                    )}>
                      {po.status === 'Draft' && <FileText className="w-5 h-5" />}
                      {po.status === 'Sent' && <Send className="w-5 h-5" />}
                      {po.status === 'Received' && <CheckCircle2 className="w-5 h-5" />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-sm">{po.id}</span>
                        <span className={cn(
                          'text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full',
                          po.status === 'Draft' && 'bg-amber-500/15 text-amber-600 dark:text-amber-400',
                          po.status === 'Sent' && 'bg-sky-500/15 text-sky-600 dark:text-sky-400',
                          po.status === 'Received' && 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400',
                        )}>
                          {po.status}
                        </span>
                      </div>
                      <p className="text-xs text-muted flex items-center gap-1 mt-0.5">
                        <Clock className="w-3 h-3" />
                        {new Date(po.createdAt).toLocaleString()} · {po.lines.length} line items · {formatCurrency(po.total)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {po.status === 'Draft' && (
                      <>
                        <button
                          type="button"
                          onClick={() => markAsSent(po.id)}
                          className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-sky-500/15 text-sky-600 dark:text-sky-400 hover:bg-sky-500/25 transition-colors flex items-center gap-1.5"
                        >
                          <Send className="w-3.5 h-3.5" /> Mark as Sent
                        </button>
                        <button
                          type="button"
                          onClick={() => deletePO(po.id)}
                          className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 transition-colors flex items-center gap-1.5"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Delete
                        </button>
                      </>
                    )}
                    {po.status === 'Sent' && (
                      <button
                        type="button"
                        onClick={() => markAsReceived(po.id)}
                        className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/25 transition-colors flex items-center gap-1.5"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" /> Mark as Received
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => toggleExpand(po.id)}
                      className="text-xs font-semibold px-2.5 py-1.5 rounded-lg border surface-border surface hover:border-royal-primary/30 text-muted transition-colors"
                    >
                      {po.expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* PO Lines (expandable) */}
                <AnimatePresence>
                  {po.expanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="border-t surface-border overflow-x-auto">
                        <table className="w-full text-xs">
                          <thead>
                            <tr className="text-[10px] font-bold uppercase tracking-wider text-muted bg-black/[0.02] dark:bg-white/[0.02]">
                              <th className="text-left px-5 py-2.5">Item / SKU</th>
                              <th className="text-left px-3 py-2.5">Supplier</th>
                              <th className="text-center px-3 py-2.5">Current Stock</th>
                              <th className="text-center px-3 py-2.5">Order Qty</th>
                              <th className="text-right px-3 py-2.5">Unit Cost</th>
                              <th className="text-right px-5 py-2.5">Line Total</th>
                            </tr>
                          </thead>
                          <tbody>
                            {po.lines.map((line, i) => (
                              <tr key={line.itemId} className={cn('border-b surface-border last:border-0', i % 2 && 'bg-black/[0.01] dark:bg-white/[0.01]')}>
                                <td className="px-5 py-2.5">
                                  <p className="font-semibold">{line.name}</p>
                                  <p className="font-mono text-muted text-[10px]">{line.sku} · {line.unit}</p>
                                </td>
                                <td className="px-3 py-2.5 text-muted">
                                  <span className="flex items-center gap-1">
                                    <Building className="w-3 h-3" />
                                    {line.supplier}
                                  </span>
                                </td>
                                <td className="px-3 py-2.5 text-center font-bold tabular-nums">{line.currentQty}</td>
                                <td className="px-3 py-2.5 text-center">
                                  <span className="inline-flex items-center font-bold font-mono px-2 py-0.5 rounded-md bg-royal-primary/10 text-royal-primary dark:bg-white/10 dark:text-[#E8D499]">
                                    +{line.orderQty}
                                  </span>
                                </td>
                                <td className="px-3 py-2.5 text-right text-muted tabular-nums">{formatCurrency(line.unitCost)}</td>
                                <td className="px-5 py-2.5 text-right font-extrabold tabular-nums">{formatCurrency(line.lineTotal)}</td>
                              </tr>
                            ))}
                          </tbody>
                          <tfoot>
                            <tr className="border-t surface-border bg-black/[0.02] dark:bg-white/[0.02]">
                              <td colSpan={5} className="px-5 py-3 text-right font-bold text-xs uppercase tracking-wider text-muted">Grand Total</td>
                              <td className="px-5 py-3 text-right font-extrabold text-sm text-primary">{formatCurrency(po.total)}</td>
                            </tr>
                          </tfoot>
                        </table>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        )}
      </motion.section>
    </motion.div>
  );
}

function MiniCard({
  label,
  value,
  icon,
  tone,
  formatter,
  subtitle,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
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
    <div className="stat-card shadow-card p-5 group hover:border-royal-primary/30 transition-all">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted truncate">{label}</p>
          <p className="mt-2 text-2xl md:text-3xl font-extrabold tabular-nums tracking-tight">
            {formatter ? formatter(value) : formatNumber(value)}
          </p>
          {subtitle && <p className="mt-1 text-xs text-muted truncate">{subtitle}</p>}
        </div>
        <div className={cn('w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border transition-transform duration-300 group-hover:scale-110 shadow-sm', map[tone])}>
          {icon}
        </div>
      </div>
    </div>
  );
}
