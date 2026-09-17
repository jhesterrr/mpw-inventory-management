import { useMemo, useCallback } from 'react';
import {
  BarChart3, TrendingUp, Layers, Package, AlertTriangle, Activity, Users, Sparkles,
  Printer, FileText,
} from 'lucide-react';
import {
  ComposedChart,
  BarChart as ReBar,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Cell,
  LineChart,
  Line,
  Legend,
  Area,
  AreaChart,
  PieChart,
  Pie,
} from 'recharts';
import { motion } from 'motion/react';
import { useAppStore } from '@/store';
import type { IssuanceLog } from '@/types';
import { cn, formatCurrency, formatNumber, formatDate, lastNMonths } from '@/utils';
import { generateAnalyticsReport, printReport, type ReportData } from '@/utils/reportExport';

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

const CAT_COLORS = ['#500B18', '#D4AF37', '#800020', '#16A34A', '#64748B'];
const LINE_COLORS = ['#800020', '#D4AF37', '#16A34A', '#0EA5E9', '#B22234'];

export default function ReportingPage() {
  const s = useAppStore(state => state);
  const logs = s.issuanceLogs;
  const inv = s.inventory;
  const users = s.users;
  const stats = s.getDashboardStats();

  const byCategory = useMemo(() => {
    const totals = new Map<string, number>();
    for (const it of inv) totals.set(it.category, (totals.get(it.category) || 0) + it.quantity * it.unitCost);
    return Array.from(totals.entries()).map(([category, value]) => ({ category, value }));
  }, [inv]);

  const months = useMemo(() => {
    const m = lastNMonths(6);
    return m.map(b => {
      const bucket = logs.filter(l => l.timestamp >= b.start && l.timestamp <= b.end);
      const issueUnits = bucket.reduce((sum, l) => sum + l.qtyIssued, 0);
      const issueValue = bucket.reduce((sum, l) => sum + l.qtyIssued * l.unitCost, 0);
      const catByIssue = new Map<string, number>();
      bucket.forEach(l => {
        const item = inv.find(i => i.id === l.itemId);
        if (item) catByIssue.set(item.category, (catByIssue.get(item.category) || 0) + l.qtyIssued);
      });
      const topCat = Array.from(catByIssue.entries()).sort((a, b) => b[1] - a[1])[0];
      return {
        label: b.label,
        monthKey: b.monthKey,
        UnitsIssued: issueUnits,
        IssueValue: issueValue,
        TopCategory: topCat ? topCat[1] : 0,
        TopCatName: topCat ? topCat[0] : '—',
      };
    });
  }, [logs, inv]);

  const staffRanking = useMemo(() => {
    const map = new Map<string, { qty: number; rows: number; value: number }>();
    logs.forEach(l => {
      const m = map.get(l.issuingStaff) ?? { qty: 0, rows: 0, value: 0 };
      m.qty += l.qtyIssued; m.rows += 1; m.value += l.qtyIssued * l.unitCost;
      map.set(l.issuingStaff, m);
    });
    return Array.from(map.entries())
      .map(([name, d]) => ({ name, ...d }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
  }, [logs]);

  const topItems = useMemo(() => {
    const map = new Map<string, { name: string; qty: number; value: number }>();
    logs.forEach(l => {
      const m = map.get(l.itemName) ?? { name: l.itemName, qty: 0, value: 0 };
      m.qty += l.qtyIssued; m.value += l.qtyIssued * l.unitCost;
      map.set(l.itemName, m);
    });
    return Array.from(map.values()).sort((a, b) => b.value - a.value).slice(0, 6);
  }, [logs]);

  const totalIssueValue = logs.reduce((sum, l) => sum + l.qtyIssued * l.unitCost, 0);
  const totalIssueUnits = logs.reduce((sum, l) => sum + l.qtyIssued, 0);

  const categoryPerformance = useMemo(() => {
    return s.getCategories().map(cat => {
      const items = inv.filter(i => i.category === cat);
      const perfStats = {
        g: items.filter(i => s.getItemStatus(i) === 'green').length,
        y: items.filter(i => s.getItemStatus(i) === 'yellow').length,
        r: items.filter(i => s.getItemStatus(i) === 'red').length,
      };
      const units = items.reduce((sum, i) => sum + i.quantity, 0);
      const val = items.reduce((sum, i) => sum + i.quantity * i.unitCost, 0);
      const ids = new Set(items.map(i => i.id));
      const issued = logs.reduce((sum, l) => sum + (ids.has(l.itemId) ? l.qtyIssued : 0), 0);
      return {
        category: cat,
        skus: items.length,
        unitsOnHand: units,
        onHandValue: val,
        green: perfStats.g,
        yellow: perfStats.y,
        red: perfStats.r,
        unitsIssued: issued,
      };
    });
  }, [s, inv, logs]);

  const buildReportData = useCallback((): ReportData => ({
    stats,
    inventory: inv,
    issuanceLogs: logs,
    byCategory,
    staffRanking,
    topItems,
    months,
    categoryPerformance,
    totalIssueValue,
    totalIssueUnits,
    getItemStatus: s.getItemStatus,
    getCategories: s.getCategories,
  }), [stats, inv, logs, byCategory, staffRanking, topItems, months, categoryPerformance, totalIssueValue, totalIssueUnits, s]);

  const handleExportPDF = useCallback(() => {
    generateAnalyticsReport(buildReportData());
  }, [buildReportData]);

  const handlePrint = useCallback(() => {
    printReport();
  }, []);

  return (
    <motion.div
      className="space-y-6 reporting-page-container"
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      <div className="hidden print-header print:block">
        <h1>MPW Inventory Report</h1>
        <p>Simple overview of your inventory performance</p>
        <p>Date: {formatDate(Date.now())}  ·  Confidential — For internal use only</p>
      </div>

      <motion.div variants={fadeUpVariants} className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 print-hide">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-royal-primary/10 dark:bg-crimson-primary/20 text-primary text-xs font-bold uppercase tracking-widest mb-2 border surface-border">
            <BarChart3 className="w-3.5 h-3.5" /> Enterprise Insights
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">Reporting &amp; Analytics</h2>
          <p className="text-xs sm:text-sm text-muted mt-1">
            Real-time aggregate intelligence on inventory valuation, issuance volume, and staff activity.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="px-3.5 py-1.5 rounded-full border surface-border text-xs font-semibold text-muted inline-flex items-center gap-2 bg-black/[0.02] dark:bg-white/[0.02]">
            <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
            Active Metrics Stream
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={handleExportPDF}
              className="btn-primary text-xs sm:text-sm !px-4 !py-2 gap-1.5"
              title="Export report as professional PDF"
            >
              <FileText className="w-4 h-4" />
              <span className="hidden sm:inline">Export PDF</span>
              <span className="sm:hidden">PDF</span>
            </button>
            <button
              onClick={handlePrint}
              className="btn-outline text-xs sm:text-sm !px-4 !py-2 gap-1.5"
              title="Print this report"
            >
              <Printer className="w-4 h-4" />
              <span className="hidden sm:inline">Print</span>
              <span className="sm:hidden">Print</span>
            </button>
          </div>
        </div>
      </motion.div>

      <motion.div variants={fadeUpVariants} className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Kpi label="Inventory Value" value={stats.totalInventoryValue} icon={<Layers className="w-5 h-5" />} tone="default" formatter={formatCurrency} />
        <Kpi label="6-mo Issue Value" value={totalIssueValue} icon={<TrendingUp className="w-5 h-5" />} tone="success" formatter={formatCurrency} />
        <Kpi label="Units Issued (6-mo)" value={totalIssueUnits} icon={<Package className="w-5 h-5" />} tone="info" />
        <Kpi label="Active SKUs at Risk" value={stats.lowStock + stats.outOfStock} icon={<AlertTriangle className="w-5 h-5" />} tone="warning" />
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="stat-card shadow-card lg:col-span-2 p-5">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="font-bold text-lg">Monthly Issuance Trend</h3>
              <p className="text-sm text-muted">Units and Issue Value over the last 6 months</p>
            </div>
            <Activity className="w-5 h-5 text-primary" />
          </div>
          <div className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={months}>
                <defs>
                  <linearGradient id="valueGradient" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="5%" stopColor="#500B18" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#500B18" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 5" stroke="var(--border)" />
                <XAxis dataKey="label" tick={{ fill: 'var(--muted)', fontSize: 12 }} />
                <YAxis yAxisId="left" tick={{ fill: 'var(--muted)', fontSize: 11 }} />
                <YAxis yAxisId="right" orientation="right" tick={{ fill: 'var(--muted)', fontSize: 11 }} tickFormatter={v => `${Math.round(v / 1000)}k`} />
                <Tooltip
                  contentStyle={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 12 }}
                  labelStyle={{ color: 'var(--text)', fontWeight: 700 }}
                  formatter={(v: any, n: any) => n === 'IssueValue' ? [formatCurrency(v as number), n] : [formatNumber(v as number), n]}
                />
                <Legend />
                <Area yAxisId="right" type="monotone" dataKey="IssueValue" name="Issue Value (₱)" fill="url(#valueGradient)" stroke="#500B18" strokeWidth={2.5} />
                <Line yAxisId="left" type="monotone" dataKey="UnitsIssued" name="Units Issued" stroke="#D4AF37" strokeWidth={3} dot={{ r: 4, fill: '#D4AF37' }} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="stat-card shadow-card p-5">
          <h3 className="font-bold text-lg mb-1">Inventory by Category (₱)</h3>
          <p className="text-sm text-muted mb-3">On-hand value distribution</p>
          <div className="h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={byCategory} dataKey="value" nameKey="category" outerRadius={80} innerRadius={40} stroke="none" paddingAngle={3}>
                  {byCategory.map((_, i) => <Cell key={i} fill={CAT_COLORS[i % CAT_COLORS.length]} />)}
                </Pie>
                <Tooltip formatter={(v: any) => formatCurrency(v as number)} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <ul className="mt-2 space-y-1.5">
            {byCategory.map((c, i) => (
              <li key={c.category} className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-2"><span className="w-3 h-3 rounded-sm" style={{ background: CAT_COLORS[i % CAT_COLORS.length] }} />{c.category}</span>
                <span className="font-bold tabular-nums">{formatCurrency(c.value)}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="stat-card shadow-card p-5">
          <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" /> Staff Issuance Ranking (6-mo)
          </h3>
          <div className="space-y-3">
            {staffRanking.map((row, idx) => {
              const max = Math.max(...staffRanking.map(r => r.value), 1);
              return (
                <div key={row.name}>
                  <div className="flex items-center justify-between text-sm mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className={cn('w-6 h-6 rounded-md text-[10px] font-black flex items-center justify-center',
                        idx === 0 ? 'bg-royal-gold text-white' : idx === 1 ? 'bg-slate-400 text-white' : idx === 2 ? 'bg-[#CD7F32] text-white' : 'bg-black/5 dark:bg-white/10',
                      )}>#{idx + 1}</span>
                      <span className="font-semibold">{row.name}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-bold tabular-nums">{formatCurrency(row.value)}</span>
                      <span className="text-muted ml-2 text-xs">{row.rows} logs · {row.qty} units</span>
                    </div>
                  </div>
                  <div className="h-2 rounded-full bg-black/5 dark:bg-white/5 overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${(row.value / max) * 100}%`, background: LINE_COLORS[idx % LINE_COLORS.length] }} />
                  </div>
                </div>
              );
            })}
            {staffRanking.length === 0 && <p className="text-center text-muted p-6">No issuance data yet.</p>}
          </div>
        </div>

        <div className="stat-card shadow-card p-5">
          <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-primary" /> Top Items by Issue Value
          </h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <ReBar data={topItems} layout="vertical" margin={{ top: 2, right: 20, bottom: 2, left: 4 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
                <XAxis type="number" tick={{ fill: 'var(--muted)', fontSize: 11 }} tickFormatter={v => `${v / 1000}k`} />
                <YAxis type="category" dataKey="name" tick={{ fill: 'var(--text)', fontSize: 11 }} width={170} />
                <Tooltip
                  contentStyle={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 12 }}
                  formatter={(v: any) => formatCurrency(v as number)}
                />
                <Bar dataKey="value" radius={[0, 8, 8, 0]}>
                  {topItems.map((_, i) => <Cell key={i} fill={CAT_COLORS[i % CAT_COLORS.length]} />)}
                </Bar>
              </ReBar>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <section className="stat-card shadow-card p-5">
        <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-primary" /> Inventory Category Performance Table
        </h3>
        <div className="overflow-x-auto -mx-5">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b surface-border text-xs uppercase tracking-wider text-muted">
                <th className="text-left font-semibold px-5 py-3">Category</th>
                <th className="text-center font-semibold px-3 py-3">SKUs</th>
                <th className="text-right font-semibold px-3 py-3">Units On Hand</th>
                <th className="text-right font-semibold px-3 py-3">On-Hand Value</th>
                <th className="text-center font-semibold px-3 py-3">Green</th>
                <th className="text-center font-semibold px-3 py-3">Yellow</th>
                <th className="text-center font-semibold px-3 py-3">Red</th>
                <th className="text-right font-semibold px-5 py-3">Units Issued (6-mo)</th>
              </tr>
            </thead>
            <tbody>
              {categoryPerformance.map(cp => (
                <tr key={cp.category} className="border-b surface-border last:border-0">
                  <td className="px-5 py-3 font-bold">{cp.category}</td>
                  <td className="px-3 py-3 text-center tabular-nums">{cp.skus}</td>
                  <td className="px-3 py-3 text-right font-bold tabular-nums">{formatNumber(cp.unitsOnHand)}</td>
                  <td className="px-3 py-3 text-right font-bold tabular-nums">{formatCurrency(cp.onHandValue)}</td>
                  <td className="px-3 py-3 text-center tabular-nums text-status-green font-semibold">{cp.green}</td>
                  <td className="px-3 py-3 text-center tabular-nums text-status-yellow font-semibold">{cp.yellow}</td>
                  <td className="px-3 py-3 text-center tabular-nums text-status-red font-semibold">{cp.red}</td>
                  <td className="px-5 py-3 text-right font-bold tabular-nums">{formatNumber(cp.unitsIssued)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </motion.div>
  );
}

function Kpi({ label, value, icon, tone, formatter }: { label: string; value: number; icon: React.ReactNode; tone: 'success' | 'warning' | 'info' | 'default'; formatter?: (n: number) => string }) {
  const map = {
    success: 'bg-status-green/10 text-status-green',
    warning: 'bg-status-yellow/15 text-status-yellow',
    info: 'bg-sky-500/15 text-sky-600 dark:text-sky-400',
    default: 'bg-royal-primary/10 text-royal-primary dark:bg-crimson-primary/20 dark:text-white',
  } as const;
  return (
    <div className="stat-card shadow-card">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted truncate">{label}</p>
          <p className="mt-2 text-2xl font-black tabular-nums truncate">{formatter ? formatter(value) : formatNumber(value)}</p>
        </div>
        <div className={cn('w-11 h-11 rounded-xl flex items-center justify-center shrink-0', map[tone])}>{icon}</div>
      </div>
    </div>
  );
}
