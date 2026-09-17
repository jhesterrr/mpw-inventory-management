import { useEffect, useRef, useState } from 'react';
import { ScanLine, Camera, Search, User, FileSignature, Send, AlertCircle, CameraOff, Sparkles, CheckCircle2, ShieldAlert } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAppStore } from '@/store';
import type { InventoryItem } from '@/types';
import StatusBadge from '@/components/common/StatusBadge';
import BarcodeDisplay from '@/components/common/BarcodeDisplay';
import Drawer from '@/components/common/Drawer';
import { cn, formatNumber, formatCurrency } from '@/utils';

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.05 },
  },
};
const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: 'easeOut' as const } },
};
const scaleIn = {
  hidden: { opacity: 0, scale: 0.95 },
  show: { opacity: 1, scale: 1, transition: { duration: 0.4, ease: 'easeOut' as const } },
};

export default function ScannerPage() {
  const s = useAppStore(state => state);
  const activeShift = s.activeShift;
  const [code, setCode] = useState('');
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [match, setMatch] = useState<InventoryItem | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const scannerRef = useRef<HTMLDivElement>(null);
  const scannerInstance = useRef<any>(null);

  useEffect(() => {
    return () => {
      if (scannerInstance.current) {
        try { scannerInstance.current.clear(); } catch {}
        scannerInstance.current = null;
      }
    };
  }, []);

  const startCamera = async () => {
    setCameraError(null);
    if (!scannerRef.current) return;
    try {
      const { Html5Qrcode } = await import('html5-qrcode');
      const html5Qr = new Html5Qrcode('qr-reader-region');
      scannerInstance.current = html5Qr;
      await html5Qr.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 280, height: 180 } },
        (decoded: string) => {
          setCode(decoded);
          handleLookup(decoded);
        },
        () => {},
      );
      setCameraActive(true);
    } catch (e: any) {
      setCameraActive(false);
      setCameraError(e?.message || 'Camera permission denied or unavailable. Please use manual SKU entry below.');
    }
  };

  const stopCamera = async () => {
    if (scannerInstance.current) {
      try { await scannerInstance.current.stop(); scannerInstance.current.clear(); } catch {}
      scannerInstance.current = null;
    }
    setCameraActive(false);
  };

  const handleLookup = (rawCode: string) => {
    const found = s.findItemByBarcodeOrSku(rawCode);
    if (found) {
      setMatch(found);
      s.setHighlightedItem(found.id);
      setTimeout(() => setDrawerOpen(true), 200);
    } else {
      setMatch(null);
      setCameraError(`No item matches code: ${rawCode}`);
      setTimeout(() => setCameraError(null), 2800);
    }
  };

  const onSubmitManual = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;
    handleLookup(code.trim());
  };

  return (
    <motion.div
      className="space-y-6"
      variants={container}
      initial="hidden"
      animate="show"
    >
      {/* Header with decorative badge */}
      <motion.div variants={fadeUp} className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-royal-primary/10 dark:bg-crimson-primary/20 text-primary text-xs font-bold uppercase tracking-widest mb-2 border surface-border">
            <ScanLine className="w-3.5 h-3.5" /> Warehouse Tooling
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">Camera QR & Barcode Scanner</h2>
          <p className="text-muted text-xs sm:text-sm mt-1">
            Scan optical bar/QR tags to immediately dispatch or adjust stock levels in real time.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3.5 py-1.5 rounded-full border surface-border text-xs font-semibold text-muted inline-flex items-center gap-1.5 bg-black/[0.02] dark:bg-white/[0.02]">
            <span className="w-2 h-2 rounded-full bg-[#D4AF37] animate-pulse" />
            Active Shift: <strong className="text-[var(--text)]">{activeShift}</strong>
          </span>
        </div>
      </motion.div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        {/* Scanner Viewport Section */}
        <motion.section variants={fadeUp} className="lg:col-span-3 stat-card shadow-card p-5 relative overflow-hidden">
          {/* Subtle accent glow */}
          <div
            className="absolute -top-12 -right-12 w-40 h-40 rounded-full opacity-10 blur-3xl pointer-events-none"
            style={{ background: 'radial-gradient(circle, #D4AF37 0%, transparent 70%)' }}
          />

          <div className="flex flex-wrap items-center justify-between gap-3 mb-4 relative z-10">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-royal-primary/10 dark:bg-crimson-primary/20 text-primary flex items-center justify-center ring-1 ring-royal-primary/20">
                <ScanLine className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base">Optical Scanner</h3>
                <p className="text-xs text-muted">High-speed hardware camera viewfinder & input</p>
              </div>
            </div>

            {!cameraActive ? (
              <motion.button
                type="button"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={startCamera}
                className="btn-primary h-11 px-5 shadow-lg flex items-center gap-2"
              >
                <Camera className="w-4 h-4" /> Start Camera
              </motion.button>
            ) : (
              <motion.button
                type="button"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={stopCamera}
                className="btn-outline h-11 px-5 text-status-red border-status-red/30 hover:bg-status-red/5 flex items-center gap-2"
              >
                <CameraOff className="w-4 h-4" /> Stop Camera
              </motion.button>
            )}
          </div>

          {/* Camera Viewport Canvas */}
          <div
            id="qr-reader-region"
            ref={scannerRef}
            className={cn(
              'w-full aspect-video md:aspect-[16/9] rounded-2xl flex items-center justify-center border relative overflow-hidden transition-all duration-300',
              cameraActive
                ? 'border-[#D4AF37]/50 shadow-[0_0_30px_rgba(212,175,55,0.2)] bg-black'
                : 'surface-border bg-black/[0.02] dark:bg-white/[0.02]',
            )}
          >
            {cameraActive ? (
              <div
                id="qr-reader-region-inner"
                className="absolute inset-0 [& video]:!w-full [& video]:!h-full [& video]:!object-cover [& video]:rounded-2xl"
              />
            ) : (
              <div className="text-center p-6 relative z-10">
                <div className="w-20 h-20 rounded-3xl bg-royal-primary/10 dark:bg-crimson-primary/20 text-primary mx-auto flex items-center justify-center mb-3 ring-1 ring-royal-primary/20">
                  <ScanLine className="w-9 h-9" />
                </div>
                <p className="font-extrabold text-base">Scanner Standby</p>
                <p className="text-xs text-muted mt-1 max-w-sm mx-auto leading-relaxed">
                  Click "Start Camera" to initialize the optical scanner. Point your camera at standard Code128, EAN, or QR codes.
                </p>
                {cameraError && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-4 inline-flex items-start gap-2 max-w-md text-left p-3 rounded-xl bg-status-red/10 border border-status-red/30 text-status-red"
                  >
                    <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                    <div className="text-xs">{cameraError}</div>
                  </motion.div>
                )}
              </div>
            )}

            {/* Target Reticle Overlay with Moving Laser */}
            {cameraActive && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-3/4 h-1/2 border-2 border-[#D4AF37]/80 rounded-2xl shadow-[0_0_0_9999px_rgba(0,0,0,0.5)] relative overflow-hidden">
                  {/* Corner brackets */}
                  <span className="absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 border-[#D4AF37] rounded-tl-xl" />
                  <span className="absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 border-[#D4AF37] rounded-tr-xl" />
                  <span className="absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 border-[#D4AF37] rounded-bl-xl" />
                  <span className="absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 border-[#D4AF37] rounded-br-xl" />

                  {/* Animated laser beam */}
                  <motion.div
                    animate={{
                      y: ['0%', '280%', '0%'],
                      opacity: [0.4, 1, 0.4],
                    }}
                    transition={{
                      duration: 2.2,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    }}
                    className="w-full h-1 bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent shadow-[0_0_12px_#D4AF37]"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Manual Input Form */}
          <form onSubmit={onSubmitManual} className="mt-5 space-y-3">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
              <input
                type="text"
                value={code}
                onChange={e => setCode(e.target.value)}
                placeholder="Enter SKU or barcode manually (e.g. OFF-001, IT-003)..."
                className="w-full h-12 pl-11 pr-32 rounded-2xl border surface-border surface outline-none focus:ring-2 focus:ring-royal-primary/30 text-sm font-medium transition-shadow"
              />
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 h-9 px-5 rounded-xl font-bold text-xs bg-royal-primary text-white hover:brightness-110 transition-all shadow-sm"
              >
                Look Up
              </motion.button>
            </div>
            <div className="flex flex-wrap items-center gap-1.5 text-xs text-muted">
              <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>Quick tests:</span>
              {['OFF-001', 'IT-003', 'CON-002', 'SAF-007'].map(sample => (
                <button
                  key={sample}
                  type="button"
                  onClick={() => {
                    setCode(sample);
                    handleLookup(sample);
                  }}
                  className="px-2 py-0.5 rounded-lg bg-black/[0.04] dark:bg-white/[0.06] font-mono text-[11px] font-bold hover:text-primary transition-colors border surface-border"
                >
                  {sample}
                </button>
              ))}
            </div>
          </form>
        </motion.section>

        {/* Recently Scanned / Match Card */}
        <motion.aside
          variants={scaleIn}
          className="lg:col-span-2 stat-card shadow-card p-5 h-fit sticky top-24 relative overflow-hidden"
        >
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="font-bold text-base">Active Result</h3>
              <p className="text-xs text-muted">Identified inventory details</p>
            </div>
            {match && (
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
            )}
          </div>

          <div className="mt-4">
            <AnimatePresence mode="wait">
              {match ? (
                <motion.div
                  key={match.id}
                  initial={{ opacity: 0, scale: 0.95, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                  className="p-5 rounded-2xl border border-[#D4AF37]/40 bg-gradient-to-br from-[#D4AF37]/10 via-transparent to-transparent shadow-lg space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] uppercase tracking-widest text-[#D4AF37] font-extrabold inline-flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Match Found
                    </span>
                    <StatusBadge status={s.getItemStatus(match)} size="sm" />
                  </div>

                  <div>
                    <h4 className="font-black text-xl leading-snug">{match.name}</h4>
                    <p className="text-xs font-mono text-muted mt-1">{match.sku} · {match.category}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-black/[0.02] dark:bg-white/[0.03] border surface-border">
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-muted font-bold">In Stock</p>
                      <p className="text-xl font-black tabular-nums mt-0.5">{formatNumber(match.quantity)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] uppercase tracking-wider text-muted font-bold">Unit Cost</p>
                      <p className="text-xl font-black tabular-nums mt-0.5 text-primary">{formatCurrency(match.unitCost)}</p>
                    </div>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="button"
                    onClick={() => setDrawerOpen(true)}
                    className="btn-primary w-full h-12 text-xs font-bold uppercase tracking-wider shadow-lg flex items-center justify-center gap-2"
                  >
                    <FileSignature className="w-4 h-4" /> Process Quick Issuance
                  </motion.button>
                </motion.div>
              ) : (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="p-10 text-center text-muted"
                >
                  <div className="w-16 h-16 rounded-2xl bg-black/[0.02] dark:bg-white/[0.03] flex items-center justify-center mx-auto mb-3 border surface-border">
                    <ScanLine className="w-8 h-8 opacity-40" />
                  </div>
                  <p className="font-bold text-sm text-[var(--text)]">No Item Scanned</p>
                  <p className="text-xs text-muted mt-1 max-w-xs mx-auto">
                    Point camera at a barcode or submit a SKU to verify specifications and inventory levels.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.aside>
      </div>

      <ProcessIssuanceDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        item={match}
        onProcessed={() => {
          setMatch(null);
          setCode('');
        }}
      />
    </motion.div>
  );
}

function ProcessIssuanceDrawer({
  open, onClose, item, onProcessed,
}: {
  open: boolean;
  onClose: () => void;
  item: InventoryItem | null;
  onProcessed: () => void;
}) {
  const s = useAppStore(state => state);
  const shift = s.activeShift;
  const user = s.currentUser;
  const [qty, setQty] = useState(1);
  const [requestor, setRequestor] = useState('');
  const [purpose, setPurpose] = useState('');
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    if (item && open) setQty(Math.min(1, Math.max(0, item.quantity)));
  }, [item, open]);

  if (!item) return null;
  const max = item.quantity;
  const status = s.getItemStatus(item);
  const disabled = status === 'red' || qty <= 0 || qty > max || !requestor.trim() || !purpose.trim();

  const submit = () => {
    if (disabled) return;
    s.processQuickIssuance({
      itemId: item.id,
      qty,
      requestorName: requestor.trim(),
      purpose: purpose.trim(),
    });
    setToast(`Issued ${qty} × ${item.name} successfully`);
    onProcessed();
    setTimeout(() => {
      setToast(null);
      onClose();
    }, 1500);
  };

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title="Process Quick Issuance"
      footer={
        <>
          <button type="button" onClick={onClose} className="btn-outline h-11 px-5">Cancel</button>
          <button
            type="button"
            onClick={submit}
            disabled={disabled}
            className={cn('btn-primary h-11 px-6', disabled && 'opacity-50 cursor-not-allowed')}
          >
            <Send className="w-4 h-4" /> Confirm Issuance
          </button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="p-4 rounded-2xl border surface-border">
          <div className="flex items-start gap-4">
            <div className="shrink-0"><BarcodeDisplay code={item.barcodeString} height={38} showText={false} /></div>
            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-2">
                <h4 className="font-extrabold truncate">{item.name}</h4>
                <StatusBadge status={status} />
              </div>
              <p className="font-mono text-xs text-muted mt-0.5">{item.sku}</p>
              <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-[11px] uppercase tracking-wider text-muted">Stock Available</p>
                  <p className="text-xl font-black tabular-nums">{formatNumber(max)}</p>
                </div>
                <div>
                  <p className="text-[11px] uppercase tracking-wider text-muted">Unit Cost</p>
                  <p className="text-xl font-black tabular-nums">{formatCurrency(item.unitCost)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <FormField label="Quantity to Issue" required>
          <div className="flex items-center gap-2">
            <button type="button" onClick={() => setQty(q => Math.max(1, q - 1))} className="w-11 h-11 rounded-xl border surface-border hover:bg-black/5 dark:hover:bg-white/5 flex items-center justify-center">
              -
            </button>
            <input
              type="number"
              min={1}
              max={max}
              value={qty}
              onChange={e => setQty(Math.max(1, Math.min(max, Number(e.target.value) || 1)))}
              className="h-11 flex-1 rounded-xl border surface-border surface text-center text-xl font-black tabular-nums outline-none focus:ring-2 focus:ring-royal-primary/30"
            />
            <button type="button" onClick={() => setQty(q => Math.min(max, q + 1))} disabled={qty >= max} className={cn('w-11 h-11 rounded-xl border surface-border hover:bg-black/5 dark:hover:bg-white/5 flex items-center justify-center', qty >= max && 'opacity-40 cursor-not-allowed')}>
              +
            </button>
          </div>
          <p className="text-xs text-muted mt-1">Max allowed: {max}. Total value: {formatCurrency(qty * item.unitCost)}</p>
        </FormField>

        <FormField label="Requestor Name" icon={<User className="w-4 h-4" />} required>
          <input
            type="text"
            value={requestor}
            onChange={e => setRequestor(e.target.value)}
            placeholder="Person receiving the items"
            className="h-11 w-full rounded-xl border surface-border surface px-3 outline-none focus:ring-2 focus:ring-royal-primary/30"
          />
        </FormField>

        <FormField label="Purpose / Notes" icon={<FileSignature className="w-4 h-4" />} required>
          <textarea
            value={purpose}
            onChange={e => setPurpose(e.target.value)}
            placeholder="Job, task, or request reference..."
            className="h-24 w-full rounded-xl border surface-border surface p-3 outline-none focus:ring-2 focus:ring-royal-primary/30"
          />
        </FormField>

        <div className="p-4 rounded-2xl bg-black/[0.03] dark:bg-white/[0.04] grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-[11px] uppercase tracking-wider text-muted">Issuing Staff</p>
            <p className="font-bold mt-0.5">{user?.name ?? 'Warehouse'}</p>
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-wider text-muted">Shift</p>
            <p className="font-bold mt-0.5">{shift}</p>
          </div>
        </div>

        {toast && <p className="p-3 rounded-xl bg-status-green/10 border border-status-green/30 text-status-green text-sm font-semibold">{toast}</p>}
      </div>
    </Drawer>
  );
}

function FormField({ label, children, icon, required }: { label: string; children: React.ReactNode; icon?: React.ReactNode; required?: boolean }) {
  return (
    <label className="block">
      <span className="text-xs font-semibold uppercase tracking-wider text-muted flex items-center gap-1.5">
        {icon}{label}{required && <span className="text-status-red normal-case text-[13px]">*</span>}
      </span>
      <div className="mt-2">{children}</div>
    </label>
  );
}
