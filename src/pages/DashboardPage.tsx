import { useMemo, useEffect, useRef, useState } from 'react';
import {
  Package,
  ClipboardList,
  Boxes,
  AlertTriangle,
  Users,
  TrendingUp,
  FileWarning,
  Sparkles,
  Activity,
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  AreaChart,
  Area,
  CartesianGrid,
  Label,
  Legend,
} from 'recharts';
import { motion } from 'motion/react';
import StatCard from '@/components/common/StatCard';
import { useAppStore, useHasRole } from '@/store';
import { useAppStore as store } from '@/store';
import { cn, formatCurrency, formatNumber } from '@/utils';

const PIE_COLORS = ['#500B18', '#D4AF37', '#16A34A', '#D97706', '#64748B'];
const DONUT_COLORS = ['#D4AF37', '#800020'];
const STATUS_COLORS: Record<string, string> = {
  InStock: '#16A34A',
  Reorder: '#D97706',
  OutOfStock: '#DC2626',
};

/* ── stagger helpers ── */
const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.05 },
  },
};
const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: 'easeOut' as const } },
};
const scaleIn = {
  hidden: { opacity: 0, scale: 0.92 },
  show: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: 'easeOut' as const } },
};

/* ── Animated counter ── */
function AnimatedCounter({ value, formatter }: { value: number; formatter?: (n: number) => string }) {
  const [display, setDisplay] = useState(0);
  const ref = useRef<number | null>(null);
  useEffect(() => {
    const start = display;
    const diff = value - start;
    if (diff === 0) return;
    const duration = 900;
    const startTime = performance.now();
    const step = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(start + diff * eased));
      if (progress < 1) ref.current = requestAnimationFrame(step);
    };
    ref.current = requestAnimationFrame(step);
    return () => { if (ref.current) cancelAnimationFrame(ref.current); };
  }, [value]);
  return <>{formatter ? formatter(display) : formatNumber(display)}</>;
}

/* ── Peak badge for chart ── */
function PeakBadge({
  x,
  y,
  label,
  tone,
  left,
}: {
  x: number;
  y: number;
  label: string;
  tone: 'profit' | 'expense';
  left?: boolean;
}) {
  return (
    <g transform={`translate(${x}, ${y})`}>
      <g transform={`translate(${left ? -120 : -20}, -48)`}>
        <rect
          width="100"
          height="36"
          rx="8"
          fill={tone === 'profit' ? '#16A34A' : '#B22234'}
          opacity="0.92"
        />
        <text x="50" y="16" textAnchor="middle" fill="#fff" fontSize="10" fontWeight="700">
          {label}
        </text>
        <text x="50" y="29" textAnchor="middle" fill="#fff" fontSize="11" fontWeight="800">
          Peak
        </text>
        <polygon
          points={`50,36 44,36 50,44 56,36`}
          fill={tone === 'profit' ? '#16A34A' : '#B22234'}
          opacity="0.92"
        />
      </g>
    </g>
  );
}

export default function DashboardPage() {
  const showWarehouse = useHasRole(['editor', 'warehouse']);
  const isDark = store(s => s.theme) === 'dark';
  const s = useAppStore(state => state);
  const stats = s.getDashboardStats();
  const warehouse = s.getWarehouseMetrics();
  const donut = s.getInventoryValuesDonut();
  const categoryVol = s.getCategoryVolumes();
  const trend = s.getMonthlyTrendData();

  const peakPoints = useMemo(() => {
    let peakProfit = { label: trend[0]?.label ?? '', value: 0, idx: 0 };
    let peakExpense = { label: trend[0]?.label ?? '', value: 0, idx: 0 };
    trend.forEach((t, idx) => {
      if (t.profit > peakProfit.value) peakProfit = { label: t.label, value: t.profit, idx };
      if (t.expense > peakExpense.value) peakExpense = { label: t.label, value: t.expense, idx };
    });
    return { peakProfit, peakExpense };
  }, [trend]);

  const inventoryStatus = s.getInventoryByStatus();
  const statusPie = useMemo(
    () => [
      { name: 'In Stock', value: inventoryStatus.green.length, key: 'InStock' },
      { name: 'Reorder', value: inventoryStatus.yellow.length, key: 'Reorder' },
      { name: 'Out of Stock', value: inventoryStatus.red.length, key: 'OutOfStock' },
    ],
    [inventoryStatus],
  );

  const textColor = isDark ? '#F5F5F7' : '#121212';
  const mutedColor = isDark ? '#8E8E93' : '#6B7280';
  const gridColor = isDark ? '#2A2A2E' : '#EFECE6';
  const cardBg = isDark ? '#18181A' : '#FFFFFF';
  const border = isDark ? '#2A2A2E' : '#EFECE6';

  return (
    <motion.div
      className="space-y-6 md:space-y-8"
      variants={container}
      initial="hidden"
      animate="show"
    >
      {/* ═══ Hero Section ═══ */}
      <motion.section variants={fadeUp}>
        <div className="relative overflow-hidden rounded-3xl p-6 md:p-8"
          style={{
            background: isDark
              ? 'linear-gradient(135deg, #1a0a0f 0%, #18181A 50%, #1a1510 100%)'
              : 'linear-gradient(135deg, #fdf8f5 0%, #FFFFFF 50%, #faf7f0 100%)',
            border: `1px solid ${border}`,
          }}
        >
          {/* Decorative gradient orbs */}
          <div className="absolute -top-20 -right-20 w-48 h-48 rounded-full opacity-20 blur-3xl pointer-events-none"
            style={{ background: 'radial-gradient(circle, #D4AF37 0%, transparent 70%)' }}
          />
          <div className="absolute -bottom-16 -left-16 w-36 h-36 rounded-full opacity-15 blur-3xl pointer-events-none"
            style={{ background: 'radial-gradient(circle, #800020 0%, transparent 70%)' }}
          />

          <div className="relative z-10 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider"
                  style={{
                    background: isDark ? 'rgba(212,175,55,0.15)' : 'rgba(80,11,24,0.08)',
                    color: isDark ? '#D4AF37' : '#500B18',
                  }}
                >
                  <Activity className="w-3 h-3" />
                  Live Dashboard
                </span>
              </div>
              <h2 className="text-2xl md:text-4xl font-extrabold tracking-tight">
                Inventory Performance
              </h2>
              <p className="text-muted mt-1.5 text-sm md:text-base max-w-lg">
                Real-time overview of your inventory metrics, stock health, and operational analytics.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-2xl text-xs font-semibold border surface-border backdrop-blur-sm"
                style={{ background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.8)' }}
              >
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                </span>
                Live metrics
              </span>
            </div>
          </div>
        </div>
      </motion.section>

      {/* ═══ KPI Cards ═══ */}
      <motion.section variants={fadeUp}>
        <motion.div
          className="grid grid-cols-2 lg:grid-cols-4 gap-4"
          variants={container}
          initial="hidden"
          animate="show"
        >
          <motion.div variants={fadeUp}>
            <StatCard
              label="Total Products"
              value={stats.totalProducts}
              icon={Package}
              tone="info"
              subtitle="Unique SKUs tracked"
            />
          </motion.div>
          <motion.div variants={fadeUp}>
            <StatCard
              label="Orders Fulfilled"
              value={stats.orders}
              icon={ClipboardList}
              tone="success"
              subtitle="Completed requisitions"
            />
          </motion.div>
          <motion.div variants={fadeUp}>
            <StatCard
              label="Total Stock Units"
              value={stats.totalStock}
              icon={Boxes}
              tone="default"
              subtitle={`Worth ${formatCurrency(stats.totalInventoryValue)}`}
            />
          </motion.div>
          <motion.div variants={fadeUp}>
            <StatCard
              label="Out of Stock"
              value={stats.outOfStock}
              icon={AlertTriangle}
              tone={stats.outOfStock > 0 ? 'alert' : 'default'}
              subtitle={
                stats.lowStock > 0
                  ? `+${stats.lowStock} at reorder point`
                  : 'No low stock warnings'
              }
            />
          </motion.div>
        </motion.div>
      </motion.section>

      {/* ═══ Analytics Row ═══ */}
      <motion.section
        className="grid grid-cols-1 lg:grid-cols-3 gap-5"
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: '-40px' }}
      >
        {/* Customer Base */}
        <motion.div variants={scaleIn} className="stat-card shadow-card relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-10 blur-2xl pointer-events-none"
            style={{ background: 'radial-gradient(circle, #16A34A 0%, transparent 70%)' }}
          />
          <div className="relative z-10">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="font-bold text-lg">Customer Base</h3>
                <p className="text-sm text-muted">Total registered customers</p>
              </div>
              <div className="w-11 h-11 rounded-xl bg-status-green/10 text-status-green flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
                <Users className="w-5 h-5" />
              </div>
            </div>
            <div className="flex items-end gap-4">
              <div className="flex-1">
                <p className="text-4xl md:text-5xl font-black tabular-nums">
                  <AnimatedCounter value={stats.totalCustomers} />
                  <span className="text-2xl font-bold text-muted ml-1">K</span>
                </p>
                <p className="mt-2 text-xs text-muted">
                  Total customer accounts in MPW directory
                </p>
              </div>
              <div className="flex flex-col items-end gap-1 text-xs">
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-royal-primary/10 text-royal-primary dark:bg-crimson-primary/20 dark:text-white font-semibold">
                  <FileWarning className="w-3 h-3" /> {stats.pendingRequisitions} pending
                </span>
              </div>
            </div>
            <div className="mt-5 pt-4 border-t surface-border space-y-2.5 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted">Active users this week</span>
                <span className="font-bold tabular-nums">{Math.max(2, stats.totalCustomers - 1)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted">Avg requests / customer</span>
                <span className="font-bold tabular-nums">{(stats.orders / Math.max(1, stats.totalCustomers)).toFixed(1)}</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Inventory Values Donut */}
        <motion.div variants={scaleIn} className="stat-card shadow-card relative overflow-hidden group">
          <div className="absolute -bottom-10 -left-10 w-28 h-28 rounded-full opacity-10 blur-2xl pointer-events-none"
            style={{ background: 'radial-gradient(circle, #D4AF37 0%, transparent 70%)' }}
          />
          <div className="relative z-10">
            <div className="mb-3">
              <h3 className="font-bold text-lg">Inventory Values</h3>
              <p className="text-sm text-muted">Sold vs Total units (6-mo)</p>
            </div>
            <div className="h-[240px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={donut}
                    cx="50%"
                    cy="50%"
                    innerRadius={62}
                    outerRadius={92}
                    paddingAngle={4}
                    dataKey="value"
                    stroke="none"
                    animationBegin={200}
                    animationDuration={1200}
                    animationEasing="ease-out"
                  >
                    {donut.map((d, i) => (
                      <Cell key={d.name} fill={DONUT_COLORS[i % DONUT_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(v: number, n: string) => [`${formatNumber(v)} units`, n]}
                    contentStyle={{
                      background: cardBg,
                      border: `1px solid ${border}`,
                      borderRadius: 14,
                      boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
                      backdropFilter: 'blur(12px)',
                    }}
                    labelStyle={{ color: textColor }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              {donut.map((d, i) => (
                <div key={d.name} className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-sm shrink-0" style={{ background: DONUT_COLORS[i] }} />
                  <div className="min-w-0">
                    <p className="truncate font-semibold">{d.name}</p>
                    <p className="text-xs text-muted">{d.percent}% · {formatNumber(d.value)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Category Volume */}
        <motion.div variants={scaleIn} className="stat-card shadow-card relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-28 h-28 rounded-full opacity-10 blur-2xl pointer-events-none"
            style={{ background: 'radial-gradient(circle, #800020 0%, transparent 70%)' }}
          />
          <div className="relative z-10">
            <div className="mb-3">
              <h3 className="font-bold text-lg">Top Categories by Volume</h3>
              <p className="text-sm text-muted">Stock quantity across categories</p>
            </div>
            <div className="h-[260px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={categoryVol}
                  layout="vertical"
                  margin={{ top: 6, right: 14, bottom: 6, left: 6 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke={gridColor} horizontal={false} />
                  <XAxis type="number" tick={{ fill: mutedColor, fontSize: 11 }} />
                  <YAxis
                    dataKey="category"
                    type="category"
                    width={120}
                    tick={{ fill: textColor, fontSize: 11 }}
                    tickLine={false}
                    axisLine={{ stroke: gridColor }}
                  />
                  <Tooltip
                    cursor={{ fill: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(80,11,24,0.05)' }}
                    contentStyle={{
                      background: cardBg,
                      border: `1px solid ${border}`,
                      borderRadius: 14,
                      boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
                    }}
                    labelStyle={{ color: textColor }}
                  />
                  <Bar dataKey="value" radius={[0, 8, 8, 0]} fill={isDark ? '#B22234' : '#500B18'}
                    animationBegin={300}
                    animationDuration={1000}
                  >
                    {categoryVol.map((_, idx) => (
                      <Cell key={idx} fill={PIE_COLORS[idx % PIE_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </motion.div>
      </motion.section>

      {/* ═══ Expense vs Profit Trend ═══ */}
      <motion.section
        className="stat-card shadow-card relative overflow-hidden"
        variants={fadeUp}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: '-40px' }}
      >
        {/* Decorative accent */}
        <div className="absolute top-0 left-0 right-0 h-[2px]"
          style={{ background: 'linear-gradient(90deg, #500B18 0%, #D4AF37 50%, #500B18 100%)', opacity: 0.5 }}
        />

        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-5 gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="w-4 h-4 text-[#D4AF37]" />
              <span className="text-[11px] font-bold uppercase tracking-widest text-muted">Financial Analytics</span>
            </div>
            <h3 className="font-bold text-xl">Expense vs Profit</h3>
            <p className="text-sm text-muted">Performance trend over the last 6 months</p>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-status-green shadow-sm shadow-emerald-500/30" />
              <span className="text-muted font-medium">Profit</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-status-red shadow-sm shadow-rose-500/30" />
              <span className="text-muted font-medium">Expense</span>
            </div>
            <span className="px-3 py-1.5 rounded-xl border surface-border text-muted font-medium backdrop-blur-sm"
              style={{ background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.6)' }}
            >
              Last 6 months
            </span>
          </div>
        </div>

        <div className="h-[360px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trend} margin={{ top: 40, right: 20, bottom: 10, left: 10 }}>
              <defs>
                <linearGradient id="profit-grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#16A34A" stopOpacity={0.45} />
                  <stop offset="95%" stopColor="#16A34A" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="expense-grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#B22234" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#B22234" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 5" stroke={gridColor} />
              <XAxis
                dataKey="label"
                tick={{ fill: mutedColor, fontSize: 12 }}
                tickLine={false}
                axisLine={{ stroke: gridColor }}
              />
              <YAxis
                tick={{ fill: mutedColor, fontSize: 11 }}
                tickLine={false}
                axisLine={{ stroke: gridColor }}
                tickFormatter={(v: number) => `${Math.round(v / 1000)}k`}
              />
              <Tooltip
                contentStyle={{
                  background: cardBg,
                  border: `1px solid ${border}`,
                  borderRadius: 14,
                  boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
                  backdropFilter: 'blur(12px)',
                }}
                labelStyle={{ color: textColor, fontWeight: 700 }}
                formatter={(v: number, n: string) => [formatCurrency(v), n]}
              />
              <Legend
                verticalAlign="top"
                align="right"
                iconType="circle"
                wrapperStyle={{ color: textColor, fontSize: 12 }}
              />
              <Area
                type="monotone"
                dataKey="expense"
                name="Expense"
                stroke="#B22234"
                strokeWidth={2.5}
                fill="url(#expense-grad)"
                dot={{ r: 3, fill: '#B22234' }}
                activeDot={{ r: 6, strokeWidth: 2, stroke: '#fff' }}
                animationDuration={1200}
              >
                <Label value="Expense" position="insideTopLeft" fill={mutedColor} />
              </Area>
              <Area
                type="monotone"
                dataKey="profit"
                name="Profit"
                stroke="#16A34A"
                strokeWidth={2.5}
                fill="url(#profit-grad)"
                dot={{ r: 3, fill: '#16A34A' }}
                activeDot={{ r: 6, strokeWidth: 2, stroke: '#fff' }}
                animationDuration={1200}
              >
                {peakPoints.peakProfit.idx !== undefined && (
                  <PeakBadge
                    x={(peakPoints.peakProfit.idx / Math.max(1, trend.length - 1)) * 920 + 10}
                    y={80}
                    label={formatCurrency(peakPoints.peakProfit.value)}
                    tone="profit"
                  />
                )}
                {peakPoints.peakExpense.idx !== undefined && (
                  <PeakBadge
                    x={(peakPoints.peakExpense.idx / Math.max(1, trend.length - 1)) * 920 + 10}
                    y={120}
                    label={formatCurrency(peakPoints.peakExpense.value)}
                    tone="expense"
                    left
                  />
                )}
              </Area>
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </motion.section>

      {/* ═══ Warehouse Operations ═══ */}
      {showWarehouse && (
        <motion.section
          className="space-y-5"
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-40px' }}
        >
          <motion.div variants={fadeUp} className="flex items-end justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="w-4 h-4 text-[#D4AF37]" />
                <span className="text-[11px] font-bold uppercase tracking-widest text-muted">Operations</span>
              </div>
              <h2 className="text-2xl md:text-3xl font-extrabold mt-1">Live Stock Status</h2>
            </div>
          </motion.div>

          <motion.div
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4"
            variants={container}
          >
            <motion.div variants={fadeUp}>
              <StatCard label="Unique SKUs" value={warehouse.uniqueSkus} icon={Package} tone="info" />
            </motion.div>
            <motion.div variants={fadeUp}>
              <StatCard label="In Stock" value={warehouse.greenCount} icon={Boxes} tone="success" />
            </motion.div>
            <motion.div variants={fadeUp}>
              <StatCard
                label="Low Stock"
                value={warehouse.yellowCount}
                icon={AlertTriangle}
                tone={warehouse.yellowCount > 0 ? 'warning' : 'default'}
              />
            </motion.div>
            <motion.div variants={fadeUp}>
              <StatCard
                label="Out of Stock"
                value={warehouse.redCount}
                icon={FileWarning}
                tone={warehouse.redCount > 0 ? 'alert' : 'default'}
              />
            </motion.div>
            <motion.div variants={fadeUp}>
              <StatCard
                label="Pending Requests"
                value={warehouse.pendingRequisitions}
                icon={ClipboardList}
                tone={warehouse.pendingRequisitions > 0 ? 'warning' : 'default'}
              />
            </motion.div>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 lg:grid-cols-2 gap-5"
            variants={container}
          >
            {/* Inventory Distribution Pie */}
            <motion.div variants={scaleIn} className="stat-card shadow-card relative overflow-hidden group">
              <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full opacity-10 blur-2xl pointer-events-none"
                style={{ background: 'radial-gradient(circle, #16A34A 0%, transparent 70%)' }}
              />
              <div className="relative z-10">
                <div className="mb-3 flex items-start justify-between">
                  <div>
                    <h3 className="font-bold text-lg">Inventory Distribution</h3>
                    <p className="text-sm text-muted">Stock status distribution overview</p>
                  </div>
                </div>
                <div className="h-[260px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={statusPie}
                        cx="50%"
                        cy="50%"
                        outerRadius={95}
                        dataKey="value"
                        stroke={cardBg}
                        strokeWidth={3}
                        animationBegin={400}
                        animationDuration={1200}
                      >
                        {statusPie.map(d => (
                          <Cell key={d.key} fill={STATUS_COLORS[d.key]} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          background: cardBg,
                          border: `1px solid ${border}`,
                          borderRadius: 14,
                          boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
                        }}
                        labelStyle={{ color: textColor }}
                      />
                      <Legend
                        iconType="circle"
                        wrapperStyle={{ color: textColor, fontSize: 12 }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </motion.div>

            {/* Stock Health Bars */}
            <motion.div variants={scaleIn} className="stat-card shadow-card relative overflow-hidden group">
              <div className="absolute -bottom-10 -left-10 w-28 h-28 rounded-full opacity-10 blur-2xl pointer-events-none"
                style={{ background: 'radial-gradient(circle, #D97706 0%, transparent 70%)' }}
              />
              <div className="relative z-10">
                <div className="mb-3">
                  <h3 className="font-bold text-lg">Quick Stock Health Bars</h3>
                  <p className="text-sm text-muted">Status breakdown per category</p>
                </div>
                <div className="space-y-4">
                  {s.getCategories().map((cat, catIdx) => {
                    const items = s.inventory.filter(i => i.category === cat);
                    const g = items.filter(i => s.getItemStatus(i) === 'green').length;
                    const y = items.filter(i => s.getItemStatus(i) === 'yellow').length;
                    const r = items.filter(i => s.getItemStatus(i) === 'red').length;
                    const t = items.length || 1;
                    return (
                      <motion.div
                        key={cat}
                        initial={{ opacity: 0, x: -12 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: catIdx * 0.08, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                      >
                        <div className="flex items-center justify-between mb-1.5 text-sm">
                          <span className="font-semibold truncate">{cat}</span>
                          <span className="text-muted tabular-nums">{t} SKUs</span>
                        </div>
                        <div className="flex h-3 rounded-full overflow-hidden bg-black/5 dark:bg-white/5">
                          <motion.div
                            className="bg-status-green transition-all duration-700"
                            initial={{ width: 0 }}
                            whileInView={{ width: `${(g / t) * 100}%` }}
                            viewport={{ once: true }}
                            transition={{ delay: catIdx * 0.08 + 0.2, duration: 0.8, ease: 'easeOut' }}
                          />
                          <motion.div
                            className="bg-status-yellow transition-all duration-700"
                            initial={{ width: 0 }}
                            whileInView={{ width: `${(y / t) * 100}%` }}
                            viewport={{ once: true }}
                            transition={{ delay: catIdx * 0.08 + 0.3, duration: 0.8, ease: 'easeOut' }}
                          />
                          <motion.div
                            className="bg-status-red transition-all duration-700"
                            initial={{ width: 0 }}
                            whileInView={{ width: `${(r / t) * 100}%` }}
                            viewport={{ once: true }}
                            transition={{ delay: catIdx * 0.08 + 0.4, duration: 0.8, ease: 'easeOut' }}
                          />
                        </div>
                        <div className="mt-1.5 flex items-center gap-3 text-[11px] text-muted">
                          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-status-green" />{g} OK</span>
                          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-status-yellow" />{y} Low</span>
                          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-status-red" />{r} OOS</span>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          </motion.div>
        </motion.section>
      )}
    </motion.div>
  );
}
