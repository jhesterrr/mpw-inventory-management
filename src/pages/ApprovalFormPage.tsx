import { useMemo, useState } from 'react';
import { ArrowLeft, ClipboardCheck, FileSignature, Send, Building, Calendar, User, StickyNote, ShoppingCart, CheckCircle2, Sparkles } from 'lucide-react';
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

export default function ApprovalFormPage() {
  const s = useAppStore(state => state);
  const currentUser = s.currentUser;
  const setActivePage = s.setActivePage;
  const items = s.getCartItemsWithDetails();
  const subtotal = s.getCartSubtotal();

  const [form, setForm] = useState({
    requestorName: currentUser?.role === 'customer' ? currentUser.name : '',
    purpose: '',
    deptCode: currentUser?.department ?? '',
    requiredDate: new Date(Date.now() + 2 * 86_400_000).toISOString().slice(0, 10),
    notes: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState<null | { id: string }>(null);

  const todayISO = new Date().toISOString().slice(0, 10);

  const valid = useMemo(() => {
    return !!form.requestorName.trim() && !!form.purpose.trim() && !!form.deptCode.trim() && !!form.requiredDate && items.length > 0;
  }, [form, items.length]);

  if (items.length === 0 && !submitted) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center py-20 text-center max-w-md mx-auto"
      >
        <div className="w-20 h-20 rounded-3xl bg-royal-primary/10 dark:bg-crimson-primary/20 flex items-center justify-center mb-4 ring-1 ring-royal-primary/20">
          <ShoppingCart className="w-10 h-10 text-primary" />
        </div>
        <h2 className="text-2xl font-extrabold">No Items in Cart</h2>
        <p className="mt-2 text-muted text-xs sm:text-sm">
          Please add items to your cart before submitting an approval requisition form.
        </p>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          type="button"
          onClick={() => setActivePage('inventory')}
          className="btn-primary mt-6 h-11 px-6 text-xs font-bold uppercase tracking-wider"
        >
          Browse Inventory
        </motion.button>
      </motion.div>
    );
  }

  if (submitted) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' as const }}
        className="stat-card shadow-card max-w-xl mx-auto p-8 md:p-10 text-center relative overflow-hidden"
      >
        <div
          className="absolute -top-16 -right-16 w-48 h-48 rounded-full opacity-15 blur-3xl pointer-events-none"
          style={{ background: 'radial-gradient(circle, #16A34A 0%, transparent 70%)' }}
        />

        <div className="w-20 h-20 rounded-3xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto mb-5 ring-1 ring-emerald-500/30">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">Requisition Submitted</h2>
        <p className="mt-2 text-xs sm:text-sm text-muted max-w-sm mx-auto leading-relaxed">
          Your approval form has been routed to the Warehouse Operations desk for stock verification.
        </p>
        <div className="mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 text-xs font-bold border border-amber-500/30">
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
          Status: Pending Review &amp; Dispatch
        </div>
        <div className="mt-5 p-3.5 rounded-2xl border surface-border bg-black/[0.02] dark:bg-white/[0.02]">
          <p className="text-[11px] uppercase tracking-wider text-muted font-bold">Reference Tracking ID</p>
          <p className="font-mono font-black text-xl text-primary mt-0.5">{submitted.id}</p>
        </div>
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="button"
            onClick={() => setActivePage('my-requisitions')}
            className="btn-primary h-12 px-6 w-full sm:w-auto text-xs font-bold uppercase tracking-wider shadow-lg"
          >
            Track My Requisitions
          </motion.button>
          <button
            type="button"
            onClick={() => setActivePage('dashboard')}
            className="btn-outline h-12 px-6 w-full sm:w-auto text-xs font-semibold"
          >
            Back to Dashboard
          </button>
        </div>
      </motion.div>
    );
  }

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.requestorName.trim()) e.requestorName = 'Requestor name is required';
    if (!form.purpose.trim()) e.purpose = 'Purpose is required';
    if (!form.deptCode.trim()) e.deptCode = 'Department / Project code is required';
    if (!form.requiredDate) e.requiredDate = 'Required date is required';
    else if (form.requiredDate < todayISO) e.requiredDate = 'Required date must be today or later';
    if (items.length === 0) e.items = 'Cart is empty';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = () => {
    if (!validate()) return;
    const req = s.submitRequisition({
      requestorName: form.requestorName.trim(),
      requestorEmail: currentUser?.email,
      purpose: form.purpose.trim(),
      deptCode: form.deptCode.trim(),
      requiredDate: form.requiredDate,
      notes: form.notes.trim() || undefined,
    });
    if (req) {
      setSubmitted({ id: req.id });
    }
  };

  const totalUnits = items.reduce((sum, l) => sum + l.qty, 0);

  return (
    <motion.div
      className="space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      <motion.div variants={fadeUpVariants} className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => setActivePage('cart')}
          className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted hover:text-primary transition-colors h-10 px-3 rounded-xl border surface-border surface"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Cart
        </button>
        <span className="text-xs text-muted">
          Requisition voucher step <strong>2 of 2</strong>
        </span>
      </motion.div>

      <motion.div variants={fadeUpVariants} className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        <section className="lg:col-span-3 stat-card shadow-card p-5 md:p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-11 h-11 rounded-xl bg-royal-primary/10 dark:bg-crimson-primary/20 text-primary flex items-center justify-center">
              <FileSignature className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl md:text-2xl font-extrabold">Requisition Approval Form</h2>
              <p className="text-sm text-muted">Complete the details below for warehouse review.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Requestor Name" icon={<User className="w-4 h-4" />} required error={errors.requestorName}>
              <input
                className="field-input"
                placeholder="Full name"
                value={form.requestorName}
                onChange={e => setForm({ ...form, requestorName: e.target.value })}
              />
            </FormField>
            <FormField label="Department / Project Code" icon={<Building className="w-4 h-4" />} required error={errors.deptCode}>
              <input
                className="field-input"
                placeholder="e.g. ENG-010, PROJ-A"
                value={form.deptCode}
                onChange={e => setForm({ ...form, deptCode: e.target.value })}
              />
            </FormField>
            <FormField label="Required Date" icon={<Calendar className="w-4 h-4" />} required error={errors.requiredDate} full>
              <input
                type="date"
                className="field-input"
                min={todayISO}
                value={form.requiredDate}
                onChange={e => setForm({ ...form, requiredDate: e.target.value })}
              />
            </FormField>
            <div className="sm:col-span-2">
              <FormField label="Purpose of Request" required error={errors.purpose} full>
                <textarea
                  className="field-input min-h-[100px] py-3"
                  placeholder="Describe the project, task, or justification..."
                  value={form.purpose}
                  onChange={e => setForm({ ...form, purpose: e.target.value })}
                />
              </FormField>
            </div>
            <div className="sm:col-span-2">
              <FormField label="Requestor Notes" icon={<StickyNote className="w-4 h-4" />} full>
                <textarea
                  className="field-input min-h-[80px] py-3"
                  placeholder="Optional notes, location, urgency, handling instructions..."
                  value={form.notes}
                  onChange={e => setForm({ ...form, notes: e.target.value })}
                />
              </FormField>
            </div>
          </div>

          <div className="mt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-5 border-t surface-border">
            <div>
              {errors.items && <p className="text-xs text-status-red font-semibold">{errors.items}</p>}
              <p className="text-xs text-muted">
                By submitting, warehouse will be notified via in-app notification.
              </p>
            </div>
            <button
              type="button"
              onClick={submit}
              disabled={!valid}
              className={cn(
                'btn-primary h-12 px-7 text-base font-black inline-flex items-center gap-2',
                !valid && 'opacity-50 cursor-not-allowed',
              )}
            >
              <Send className="w-4 h-4" /> Submit for Approval
            </button>
          </div>
        </section>

        <aside className="lg:col-span-2 stat-card shadow-card p-5 h-fit sticky top-24">
          <h3 className="font-bold text-lg flex items-center gap-2">
            <ShoppingCart className="w-4 h-4" /> Items Summary
          </h3>
          <ul className="mt-4 divide-y surface-border max-h-[420px] overflow-y-auto -mx-5 px-5">
            {items.map(l => (
              <li key={l.itemId} className="py-3 flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-semibold text-sm truncate">{l.itemName}</p>
                  <p className="text-[11px] text-muted font-mono">{l.sku} · {formatCurrency(l.unitCost)} each</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs text-muted tabular-nums">× {l.qty}</p>
                  <p className="font-bold text-sm tabular-nums">{formatCurrency(l.qty * l.unitCost)}</p>
                </div>
              </li>
            ))}
          </ul>
          <div className="pt-4 mt-4 border-t surface-border space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted">Total Units</span>
              <span className="font-bold tabular-nums">{totalUnits}</span>
            </div>
            <div className="flex justify-between text-lg">
              <span className="text-muted">Estimated Value</span>
              <span className="font-black tabular-nums">{formatCurrency(subtotal)}</span>
            </div>
          </div>
        </aside>
      </motion.div>

      <style>{`
        .field-input {
          width: 100%; height: 44px; border-radius: 12px; padding: 0 14px;
          outline: none; border: 1px solid var(--border); background: var(--card);
          color: var(--text); font-size: 14px;
        }
        .field-input:focus { border-color: #500B18; box-shadow: 0 0 0 3px rgba(80,11,24,0.12); }
        textarea.field-input { height: auto; }
      `}</style>
    </motion.div>
  );
}

function FormField({
  label,
  children,
  icon,
  required,
  error,
  full,
}: {
  label: string;
  children: React.ReactNode;
  icon?: React.ReactNode;
  required?: boolean;
  error?: string;
  full?: boolean;
}) {
  return (
    <label className={cn('block', full && 'sm:col-span-2')}>
      <span className="text-xs font-semibold uppercase tracking-wider text-muted flex items-center gap-1.5">
        {icon} {label}
        {required && <span className="text-status-red normal-case text-[13px]">*</span>}
      </span>
      <div className="mt-2">{children}</div>
      {error && <p className="mt-1.5 text-xs text-status-red font-semibold">{error}</p>}
    </label>
  );
}
