import React from 'react';
import {
  ShoppingCart,
  Minus,
  Plus,
  Trash2,
  ArrowRight,
  Package,
  ShieldCheck,
  Building2,
  FileCheck,
  Sparkles,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAppStore } from '@/store';
import { cn, formatCurrency } from '@/utils';

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

export default function CartPage() {
  const s = useAppStore(state => state);
  const cartItems = s.getCartItemsWithDetails();
  const subtotal = s.getCartSubtotal();
  const setActivePage = s.setActivePage;

  if (cartItems.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col items-center justify-center py-20 md:py-28 text-center max-w-lg mx-auto"
      >
        <div className="w-24 h-24 rounded-3xl bg-royal-primary/10 dark:bg-crimson-primary/25 flex items-center justify-center mb-6 shadow-inner ring-1 ring-royal-primary/20">
          <ShoppingCart className="w-12 h-12 text-primary dark:text-[#E8D499]" />
        </div>
        <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">Your Cart is Empty</h2>
        <p className="mt-2 text-xs sm:text-sm text-muted leading-relaxed">
          You have not selected any items for requisition yet. Explore the inventory catalog to pick what you need.
        </p>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          type="button"
          onClick={() => setActivePage('inventory')}
          className="btn-primary mt-6 h-12 px-7 text-xs font-bold uppercase tracking-wider shadow-lg flex items-center gap-2"
        >
          <Package className="w-4 h-4" /> Browse Catalog
        </motion.button>
      </motion.div>
    );
  }

  const totalUnits = cartItems.reduce((sum, l) => sum + l.qty, 0);

  return (
    <motion.div
      className="space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      {/* Header */}
      <motion.div variants={fadeUpVariants} className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-royal-primary/10 dark:bg-crimson-primary/20 text-primary text-xs font-bold uppercase tracking-widest mb-2 border surface-border">
            <ShoppingCart className="w-3.5 h-3.5" /> Requisition Desk
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">
            Shopping Cart Review
          </h2>
          <p className="text-xs sm:text-sm text-muted mt-1">
            Verify requested item quantities before generating your formal internal approval voucher.
          </p>
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          type="button"
          onClick={() => s.clearCart()}
          className="btn-outline h-10 px-4 text-xs font-bold text-status-red border-status-red/30 hover:bg-status-red/5 flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Trash2 className="w-4 h-4" /> Clear All
        </motion.button>
      </motion.div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Cart Item Cards */}
        <div className="lg:col-span-2 space-y-3.5">
          {cartItems.map((line, idx) => (
            <div
              key={line.itemId}
              className="stat-card shadow-card p-4 sm:p-5 flex flex-col sm:flex-row gap-4 sm:items-center border surface-border"
            >
              <div className="w-14 h-14 rounded-2xl bg-royal-primary/10 dark:bg-white/10 flex items-center justify-center shrink-0 border surface-border overflow-hidden">
                {line.imageUrl ? (
                  <img src={line.imageUrl} alt={line.itemName} className="w-full h-full object-cover" />
                ) : (
                  <span className="font-extrabold text-sm text-primary dark:text-[#E8D499]">
                    {idx + 1}
                  </span>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-base truncate">{line.itemName}</p>
                    <p className="text-xs font-mono text-muted mt-0.5">
                      {line.sku} · Unit Cost: {formatCurrency(line.unitCost)}
                    </p>
                    {line.qty > line.available && (
                      <p className="mt-1 text-xs font-semibold text-amber-500 flex items-center gap-1">
                        ⚠ Exceeds available stock; capped to {line.available}
                      </p>
                    )}
                  </div>

                  <div className="text-right shrink-0">
                    <p className="text-[10px] uppercase font-bold text-muted">Line Value</p>
                    <p className="text-lg font-black tabular-nums text-primary">
                      {formatCurrency(line.qty * line.unitCost)}
                    </p>
                  </div>
                </div>

                {/* Bottom Row: Stepper and Remove */}
                <div className="mt-3 pt-3 border-t surface-border flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <div className="inline-flex items-center rounded-xl border surface-border overflow-hidden bg-black/[0.02] dark:bg-white/[0.03]">
                      <button
                        type="button"
                        onClick={() => s.updateCartQty(line.itemId, line.qty - 1)}
                        className="w-9 h-9 flex items-center justify-center hover:bg-black/5 dark:hover:bg-white/10 text-muted hover:text-[var(--text)] transition-colors"
                        aria-label="Decrease quantity"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <input
                        type="number"
                        min={1}
                        max={line.maxQty}
                        value={line.qty}
                        onChange={e => s.updateCartQty(line.itemId, Number(e.target.value) || 0)}
                        className="h-9 w-14 text-center border-0 bg-transparent focus:ring-0 font-bold tabular-nums text-xs"
                      />
                      <button
                        type="button"
                        onClick={() => s.updateCartQty(line.itemId, line.qty + 1)}
                        disabled={line.qty >= line.maxQty}
                        className={cn(
                          'w-9 h-9 flex items-center justify-center hover:bg-black/5 dark:hover:bg-white/10 text-muted hover:text-[var(--text)] transition-colors',
                          line.qty >= line.maxQty && 'opacity-30 cursor-not-allowed',
                        )}
                        aria-label="Increase quantity"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <span className="text-xs text-muted">
                      Max: <strong className="font-mono">{line.maxQty}</strong>
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => s.removeFromCart(line.itemId)}
                    className="h-9 px-3 rounded-xl border border-rose-500/20 text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 inline-flex items-center gap-1.5 text-xs font-semibold transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Sticky Summary Card */}
        <aside className="stat-card shadow-card p-6 h-fit sticky top-24 border surface-border space-y-4">
          <div className="flex items-center gap-2">
            <FileCheck className="w-5 h-5 text-primary" />
            <h3 className="font-bold text-base">Requisition Summary</h3>
          </div>

          <div className="space-y-2.5 text-xs">
            <div className="flex items-center justify-between py-1 border-b surface-border">
              <span className="text-muted">Unique Items</span>
              <span className="font-bold font-mono text-sm">{cartItems.length}</span>
            </div>
            <div className="flex items-center justify-between py-1 border-b surface-border">
              <span className="text-muted">Total Requested Units</span>
              <span className="font-bold font-mono text-sm">{totalUnits}</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-muted font-medium">Estimated Value</span>
              <span className="text-2xl font-black tabular-nums text-primary">
                {formatCurrency(subtotal)}
              </span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-black/[0.03] dark:bg-white/[0.03] border surface-border text-[11px] text-muted space-y-1.5">
            <div className="flex items-center gap-1.5 font-semibold text-[var(--text)]">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              Direct Voucher Routing
            </div>
            <p>
              Proceeding generates an approval ticket dispatched to department editors and warehouse managers.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setActivePage('approval-form')}
            className="btn-primary w-full h-12 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg"
          >
            Submit Approval Voucher <ArrowRight className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setActivePage('inventory')}
            className="btn-outline w-full h-11 text-xs font-semibold"
          >
            Continue Browsing Catalog
          </button>
        </aside>
      </div>
    </motion.div>
  );
}
