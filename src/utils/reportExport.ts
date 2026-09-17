import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { InventoryItem, IssuanceLog, DashboardStats } from '@/types';
import { formatCurrency, formatNumber, formatDate } from './index';

export interface ReportData {
  stats: DashboardStats;
  inventory: InventoryItem[];
  issuanceLogs: IssuanceLog[];
  byCategory: { category: string; value: number }[];
  staffRanking: { name: string; qty: number; rows: number; value: number }[];
  topItems: { name: string; qty: number; value: number }[];
  months: { label: string; UnitsIssued: number; IssueValue: number; TopCatName: string }[];
  categoryPerformance: {
    category: string;
    skus: number;
    unitsOnHand: number;
    onHandValue: number;
    green: number;
    yellow: number;
    red: number;
    unitsIssued: number;
  }[];
  totalIssueValue: number;
  totalIssueUnits: number;
  getItemStatus: (item: InventoryItem) => 'green' | 'yellow' | 'red';
  getCategories: () => string[];
}

type Rgb = readonly [number, number, number];

const C: Record<string, Rgb> = {
  primary: [80, 11, 24],
  gold: [212, 175, 55],
  green: [22, 163, 74],
  yellow: [234, 179, 8],
  red: [220, 38, 38],
  muted: [107, 114, 128],
  lightBg: [250, 250, 250],
  border: [230, 230, 230],
};

const setF = (d: jsPDF, c: Rgb) => d.setFillColor(c[0], c[1], c[2]);
const setD = (d: jsPDF, c: Rgb) => d.setDrawColor(c[0], c[1], c[2]);
const setT = (d: jsPDF, c: Rgb) => d.setTextColor(c[0], c[1], c[2]);

const PAD = { top: 3.5, right: 7, bottom: 3.5, left: 5 };
const PAD_HEAD = { top: 4.5, right: 7, bottom: 4.5, left: 5 };

export function generateAnalyticsReport(data: ReportData): void {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pw = doc.internal.pageSize.getWidth();
  const m = 18;

  addReportHeader(doc, pw, m);
  addQuickOverview(doc, pw, m, data);
  addInventorySummary(doc, pw, m, data);
  addIssuanceSummary(doc, pw, m, data);
  addTopPerformers(doc, pw, m, data);
  addStockStatusSummary(doc, pw, m, data);
  addReportFooter(doc, pw);

  const fileName = `MPW_Inventory_Report_${new Date().toISOString().slice(0, 10)}.pdf`;
  doc.save(fileName);
}

function addReportHeader(doc: jsPDF, pw: number, m: number) {
  setF(doc, C.primary);
  doc.rect(0, 0, pw, 50, 'F');
  setF(doc, C.gold);
  doc.rect(0, 50, pw, 2, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(24);
  doc.text('MPW Inventory Report', m, 22);

  doc.setFontSize(12);
  setT(doc, C.gold);
  doc.setFont('helvetica', 'normal');
  doc.text('Simple overview of your inventory performance', m, 32);

  doc.setFontSize(10);
  doc.setTextColor(230, 230, 230);
  doc.text(`Date: ${formatDate(Date.now())}`, m, 42);
  doc.text(`Confidential | For internal use`, pw - m - 52, 42);

  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  setT(doc, C.primary);
  doc.text('Report Summary', m, 66);
  setD(doc, C.gold);
  doc.setLineWidth(0.6);
  doc.line(m, 70, pw - m, 70);
}

function sectionTitle(doc: jsPDF, m: number, num: string, title: string, y: number) {
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  setT(doc, C.gold);
  doc.text(num, m, y);
  setT(doc, C.primary);
  doc.text(title, m + 8, y);
}

function addQuickOverview(doc: jsPDF, pw: number, m: number, data: ReportData) {
  let y = 78;
  sectionTitle(doc, m, '1.', 'Quick Overview', y);
  y += 8;

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  setT(doc, C.muted);
  doc.text('The most important numbers at a glance', m, y);
  y += 8;

  const bigNumbers = [
    { label: 'Total Value in Stock', value: formatCurrency(data.stats.totalInventoryValue), hint: 'All inventory combined' },
    { label: 'Items Given Out (6 mo)', value: formatNumber(data.totalIssueUnits), hint: `${formatCurrency(data.totalIssueValue)} total value` },
    { label: 'Products Tracked', value: formatNumber(data.stats.totalProducts), hint: 'Unique items in inventory' },
    { label: 'Requests Waiting', value: formatNumber(data.stats.pendingRequisitions), hint: 'Requisitions to review' },
  ];

  const bw = (pw - m * 2 - 6) / 2;
  const bh = 24;
  bigNumbers.forEach((item, i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const cx = m + col * (bw + 6);
    const cy = y + row * (bh + 6);

    setD(doc, C.border);
    setF(doc, C.lightBg);
    doc.roundedRect(cx, cy, bw, bh, 2, 2, 'FD');
    setF(doc, C.gold);
    doc.rect(cx, cy, 2, bh, 'F');

    setT(doc, C.muted);
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'normal');
    doc.text(item.label, cx + 6, cy + 7.5);

    setT(doc, C.primary);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text(item.value, cx + 6, cy + 16, { maxWidth: bw - 12 });

    setT(doc, C.muted);
    doc.setFontSize(7);
    doc.setFont('helvetica', 'italic');
    doc.text(item.hint, cx + 6, cy + 22, { maxWidth: bw - 12 });
  });

  y += 2 * (bh + 6) + 6;

  const totalSkus = data.stats.inStock + data.stats.lowStock + data.stats.outOfStock;
  const okPct = totalSkus > 0 ? Math.round((data.stats.inStock / totalSkus) * 100) : 0;

  setF(doc, [245, 248, 250]);
  doc.roundedRect(m, y, pw - m * 2, 22, 2, 2, 'F');
  setF(doc, okPct >= 80 ? C.green : okPct >= 50 ? C.yellow : C.red);
  doc.roundedRect(m, y, 5, 22, 2, 2, 'F');

  setT(doc, C.primary);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text(`Inventory Health: ${okPct}%`, m + 10, y + 8);

  const healthMsg =
    okPct >= 80 ? `Most items (${data.stats.inStock}) are well stocked.` :
    okPct >= 50 ? `Some items need attention — ${data.stats.lowStock} running low.` :
    `Action required — ${data.stats.outOfStock} items are out of stock.`;
  setT(doc, C.muted);
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.text(healthMsg, m + 10, y + 15, { maxWidth: pw - m * 2 - 20 });

  y += 32;
  return y;
}

function addInventorySummary(doc: jsPDF, pw: number, m: number, data: ReportData) {
  let y = (doc as any).lastAutoTable ? (doc as any).lastAutoTable.finalY + 18 : 210;
  if (y > 240) { doc.addPage(); addPageHeader(doc, pw, m); y = 38; }

  sectionTitle(doc, m, '2.', 'Inventory by Category', y);
  y += 8;

  setT(doc, C.muted);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('What categories hold the most value', m, y);
  y += 8;

  const sorted = [...data.byCategory].sort((a, b) => b.value - a.value);
  const total = sorted.reduce((s, c) => s + c.value, 0);

  const rows: (string | number)[][] = sorted.map((c, i) => {
    const skus = data.inventory.filter(it => it.category === c.category).length;
    const pct = total > 0 ? Math.round((c.value / total) * 100) : 0;
    return [i + 1, c.category, formatNumber(skus), formatCurrency(c.value), `${pct}%`];
  });

  autoTable(doc, {
    startY: y,
    head: [['#', 'Category', 'Products', 'Total Value', 'Share']],
    body: rows,
    theme: 'grid',
    styles: { lineColor: C.border as [number, number, number], lineWidth: 0.2, cellPadding: PAD, fontSize: 9, overflow: 'linebreak' },
    headStyles: {
      fillColor: C.primary as [number, number, number],
      textColor: 255,
      fontSize: 9,
      fontStyle: 'bold',
      halign: 'left',
      cellPadding: PAD_HEAD,
    },
    bodyStyles: { cellPadding: PAD },
    alternateRowStyles: { fillColor: C.lightBg as [number, number, number] },
    columnStyles: {
      0: { halign: 'center', cellWidth: 13 },
      1: { cellWidth: 'auto' },
      2: { halign: 'right', cellWidth: 26 },
      3: { halign: 'right', fontStyle: 'bold', cellWidth: 45 },
      4: { halign: 'center', cellWidth: 22 },
    },
    margin: { left: m, right: m },
    tableWidth: 'wrap',
  });

  y = (doc as any).lastAutoTable.finalY + 6;
  setD(doc, C.primary);
  doc.setLineWidth(0.3);
  doc.line(m, y, pw - m, y);
  y += 5;

  setT(doc, C.primary);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text(`Total Inventory Value`, m, y);
  setT(doc, C.primary);
  doc.text(formatCurrency(total), pw - m, y, { align: 'right' });
}

function addIssuanceSummary(doc: jsPDF, pw: number, m: number, data: ReportData) {
  let y = (doc as any).lastAutoTable ? (doc as any).lastAutoTable.finalY + 18 : 100;
  if (y > 230) { doc.addPage(); addPageHeader(doc, pw, m); y = 38; }

  sectionTitle(doc, m, '3.', 'Items Given Out — Past 6 Months', y);
  y += 8;

  setT(doc, C.muted);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('Monthly activity at a glance', m, y);
  y += 8;

  const totalUnits = data.months.reduce((s, mo) => s + mo.UnitsIssued, 0);
  const totalVal = data.months.reduce((s, mo) => s + mo.IssueValue, 0);
  const avgUnits = data.months.length > 0 ? Math.round(totalUnits / data.months.length) : 0;

  const summary = [
    { k: 'Total items given out', v: formatNumber(totalUnits) },
    { k: 'Total value issued', v: formatCurrency(totalVal) },
    { k: 'Average per month', v: formatNumber(avgUnits) },
  ];
  summary.forEach((s, i) => {
    const sy = y + i * 6;
    setT(doc, C.muted);
    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'normal');
    doc.text(s.k, m, sy);
    setT(doc, C.primary);
    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'bold');
    doc.text(s.v, pw - m, sy, { align: 'right' });
  });
  y += summary.length * 6 + 6;

  const rows: (string | number)[][] = data.months.map((mo, i) => [
    i + 1, mo.label, formatNumber(mo.UnitsIssued), formatCurrency(mo.IssueValue),
  ]);

  autoTable(doc, {
    startY: y,
    head: [['#', 'Month', 'Items Sent Out', 'Value (PHP)']],
    body: rows,
    theme: 'grid',
    styles: { lineColor: C.border as [number, number, number], lineWidth: 0.2, cellPadding: PAD, fontSize: 9, overflow: 'linebreak' },
    headStyles: {
      fillColor: C.primary as [number, number, number],
      textColor: 255,
      fontSize: 9,
      fontStyle: 'bold',
      halign: 'left',
      cellPadding: PAD_HEAD,
    },
    bodyStyles: { cellPadding: PAD },
    alternateRowStyles: { fillColor: C.lightBg as [number, number, number] },
    columnStyles: {
      0: { halign: 'center', cellWidth: 13 },
      1: { cellWidth: 34 },
      2: { halign: 'right', cellWidth: 36 },
      3: { halign: 'right', fontStyle: 'bold', cellWidth: 46 },
    },
    margin: { left: m, right: m },
    tableWidth: 'wrap',
  });
}

function addTopPerformers(doc: jsPDF, pw: number, m: number, data: ReportData) {
  let y = (doc as any).lastAutoTable ? (doc as any).lastAutoTable.finalY + 18 : 100;
  if (y > 230) { doc.addPage(); addPageHeader(doc, pw, m); y = 38; }

  sectionTitle(doc, m, '4.', 'Top Performers', y);
  y += 8;

  setT(doc, C.muted);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('Staff and products moving the most inventory', m, y);
  y += 8;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  setT(doc, C.primary);
  doc.text('Staff Who Issued the Most', m, y);
  y += 7;

  if (data.staffRanking.length === 0) {
    setT(doc, C.muted);
    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'italic');
    doc.text('No staff activity in this period yet.', m + 2, y);
    y += 10;
  } else {
    const staffRows: (string | number)[][] = data.staffRanking.slice(0, 3).map((r, i) => [
      i === 0 ? '1st' : i === 1 ? '2nd' : '3rd',
      r.name,
      formatNumber(r.qty) + ' items',
      formatCurrency(r.value),
    ]);
    autoTable(doc, {
      startY: y,
      head: [['Rank', 'Name', 'Items Handled', 'Total Value']],
      body: staffRows,
      theme: 'grid',
      styles: { lineColor: C.border as [number, number, number], lineWidth: 0.2, cellPadding: PAD, fontSize: 8.5, overflow: 'linebreak' },
      headStyles: {
        fillColor: [60, 60, 60] as [number, number, number],
        textColor: 255,
        fontSize: 8.5,
        fontStyle: 'bold',
        halign: 'left',
        cellPadding: PAD_HEAD,
      },
      bodyStyles: { cellPadding: PAD },
      alternateRowStyles: { fillColor: C.lightBg as [number, number, number] },
      columnStyles: {
        0: { halign: 'center', fontStyle: 'bold', cellWidth: 17 },
        1: { cellWidth: 'auto' },
        2: { halign: 'right', cellWidth: 34 },
        3: { halign: 'right', fontStyle: 'bold', cellWidth: 42 },
      },
      margin: { left: m, right: m },
      tableWidth: 'wrap',
    });
    y = (doc as any).lastAutoTable.finalY + 8;
  }

  if (y > 240) { doc.addPage(); addPageHeader(doc, pw, m); y = 38; }

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  setT(doc, C.primary);
  doc.text('Most Requested Items', m, y);
  y += 7;

  if (data.topItems.length === 0) {
    setT(doc, C.muted);
    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'italic');
    doc.text('No items have been issued in this period.', m + 2, y);
  } else {
    const itemRows: (string | number)[][] = data.topItems.slice(0, 5).map((it, i) => [
      i + 1, it.name, formatNumber(it.qty), formatCurrency(it.value),
    ]);
    autoTable(doc, {
      startY: y,
      head: [['#', 'Item Name', 'Qty Given', 'Total Value']],
      body: itemRows,
      theme: 'grid',
      styles: { lineColor: C.border as [number, number, number], lineWidth: 0.2, cellPadding: PAD, fontSize: 8.5, overflow: 'linebreak' },
      headStyles: {
        fillColor: [60, 60, 60] as [number, number, number],
        textColor: 255,
        fontSize: 8.5,
        fontStyle: 'bold',
        halign: 'left',
        cellPadding: PAD_HEAD,
      },
      bodyStyles: { cellPadding: PAD },
      alternateRowStyles: { fillColor: C.lightBg as [number, number, number] },
      columnStyles: {
        0: { halign: 'center', cellWidth: 13 },
        1: { cellWidth: 'auto' },
        2: { halign: 'right', cellWidth: 28 },
        3: { halign: 'right', fontStyle: 'bold', cellWidth: 42 },
      },
      margin: { left: m, right: m },
      tableWidth: 'wrap',
    });
  }
}

function addStockStatusSummary(doc: jsPDF, pw: number, m: number, data: ReportData) {
  let y = (doc as any).lastAutoTable ? (doc as any).lastAutoTable.finalY + 18 : 100;
  if (y > 210) { doc.addPage(); addPageHeader(doc, pw, m); y = 38; }

  sectionTitle(doc, m, '5.', 'Stock Status by Category', y);
  y += 8;

  setT(doc, C.muted);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('Check which categories are running low', m, y);
  y += 8;

  const rows: (string | number)[][] = data.categoryPerformance.map((cp, i) => [
    i + 1, cp.category,
    `${cp.green} OK`,
    `${cp.yellow} Low`,
    `${cp.red} Out`,
    formatCurrency(cp.onHandValue),
  ]);

  autoTable(doc, {
    startY: y,
    head: [['#', 'Category', 'In Stock', 'Low Stock', 'Out of Stock', 'On-Hand Value']],
    body: rows,
    theme: 'grid',
    styles: { lineColor: C.border as [number, number, number], lineWidth: 0.2, cellPadding: PAD, fontSize: 8.5, overflow: 'linebreak' },
    headStyles: {
      fillColor: C.primary as [number, number, number],
      textColor: 255,
      fontSize: 8.5,
      fontStyle: 'bold',
      halign: 'left',
      cellPadding: PAD_HEAD,
    },
    bodyStyles: { cellPadding: PAD },
    alternateRowStyles: { fillColor: C.lightBg as [number, number, number] },
    columnStyles: {
      0: { halign: 'center', cellWidth: 13 },
      1: { cellWidth: 'auto' },
      2: { halign: 'center', cellWidth: 26, textColor: C.green as [number, number, number] },
      3: { halign: 'center', cellWidth: 26, textColor: C.yellow as [number, number, number] },
      4: { halign: 'center', cellWidth: 26, textColor: C.red as [number, number, number] },
      5: { halign: 'right', fontStyle: 'bold', cellWidth: 42 },
    },
    margin: { left: m, right: m },
    tableWidth: 'wrap',
  });

  y = (doc as any).lastAutoTable.finalY + 12;

  if (data.stats.outOfStock > 0 || data.stats.lowStock > 0) {
    setF(doc, [255, 249, 235]);
    doc.roundedRect(m, y, pw - m * 2, 22, 2, 2, 'F');
    setF(doc, C.yellow);
    doc.roundedRect(m, y, 4, 22, 2, 2, 'F');

    setT(doc, C.primary);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('Things to check:', m + 10, y + 7);

    const notes = [];
    if (data.stats.outOfStock > 0) notes.push(`${data.stats.outOfStock} item(s) out of stock — reorder soon`);
    if (data.stats.lowStock > 0) notes.push(`${data.stats.lowStock} item(s) running low — review reorder points`);
    if (data.stats.pendingRequisitions > 0) notes.push(`${data.stats.pendingRequisitions} pending request(s) waiting for action`);
    if (notes.length === 0) notes.push('No urgent issues right now. Keep up the good work!');

    setT(doc, C.muted);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text(notes.join('  ·  '), m + 10, y + 15, { maxWidth: pw - m * 2 - 20 });
  }
}

function addPageHeader(doc: jsPDF, pw: number, m: number) {
  setF(doc, C.primary);
  doc.rect(0, 0, pw, 12, 'F');
  setF(doc, C.gold);
  doc.rect(0, 12, pw, 1.2, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text('MPW Inventory Report', m, 8);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text(formatDate(Date.now()), pw - m - 28, 8);
}

function addReportFooter(doc: jsPDF, pw: number) {
  const pageCount = (doc.internal as any).pages.length;
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    const ph = doc.internal.pageSize.getHeight();
    setD(doc, C.border);
    doc.setLineWidth(0.2);
    doc.line(18, ph - 16, pw - 18, ph - 16);

    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    setT(doc, C.muted);
    doc.text('MPW Inventory Management System', 18, ph - 10);
    doc.text(`Page ${i} of ${pageCount}`, pw - 18, ph - 10, { align: 'right' });
  }
}

export function printReport(): void {
  window.print();
}
