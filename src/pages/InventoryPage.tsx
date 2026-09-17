import { useEffect, useMemo, useState } from 'react';
import {
  Search,
  Filter,
  ArrowUpDown,
  Plus,
  Pencil,
  Trash2,
  Info,
  ShoppingCart,
  Minus,
  PlusCircle,
  X,
  MapPin,
  Truck,
  LayoutList,
  Table as TableIcon,
  Boxes,
  CheckCircle2,
  AlertTriangle,
  XCircle,
} from 'lucide-react';
import StatusBadge from '@/components/common/StatusBadge';
import BarcodeDisplay from '@/components/common/BarcodeDisplay';
import AnimatedList from '@/components/common/AnimatedList';
import PillNav from '@/components/common/PillNav';
import Modal from '@/components/common/Modal';
import { useAppStore, useHasRole } from '@/store';
import type { InventoryItem, SortDir, SortField } from '@/types';
import { cn, formatCurrency, formatNumber, generateBarcodeString } from '@/utils';

const categories = ['All', 'Common', 'Assembly', 'Painting', 'Welding', 'Press', 'Conversion'];

const sortOptions: { value: `${SortField}-${SortDir}`; label: string }[] = [
  { value: 'name-asc', label: 'Name (A-Z)' },
  { value: 'name-desc', label: 'Name (Z-A)' },
  { value: 'quantity-asc', label: 'Qty (Low → High)' },
  { value: 'quantity-desc', label: 'Qty (High → Low)' },
  { value: 'sku-asc', label: 'SKU (A-Z)' },
  { value: 'unitCost-desc', label: 'Unit Cost (High → Low)' },
];

const emptyItem: Omit<InventoryItem, 'id' | 'barcodeString' | 'createdAt'> = {
  sku: '',
  name: '',
  category: 'Common',
  unit: 'Piece',
  quantity: 0,
  reorderPoint: 0,
  unitCost: 0,
  supplier: '',
  location: '',
};

export default function InventoryPage() {
  const s = useAppStore(state => state);
  const canEdit = useHasRole(['editor']);
  const isCustomer = useHasRole(['customer']);
  const [search, setSearch] = useState(s.searchTerm || '');
  const [category, setCategory] = useState<string>('All');
  const [sort, setSort] = useState<`${SortField}-${SortDir}`>('name-asc');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'animated' | 'table'>('animated');
  const [mobileExpandedId, setMobileExpandedId] = useState<string | null>(null);
  const [highlightId, setHighlightId] = useState<string | null>(null);

  useEffect(() => {
    if (s.searchTerm !== search) {
      setSearch(s.searchTerm);
    }
  }, [s.searchTerm]);

  const lastHighlight = useAppStore(st => st.lastHighlightedItemId);
  useEffect(() => {
    if (lastHighlight) {
      setHighlightId(lastHighlight);
      const el = document.getElementById(`inv-item-${lastHighlight}`);
      el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      const t = setTimeout(() => setHighlightId(null), 3200);
      return () => clearTimeout(t);
    }
  }, [lastHighlight]);

  type StockFilter = 'all' | 'in-stock' | 'reorder' | 'out-of-stock';
  const [stockFilter, setStockFilter] = useState<StockFilter>('all');

  const stockCounts = useMemo(() => {
    let inStock = 0;
    let reorder = 0;
    let outOfStock = 0;
    for (const item of s.inventory) {
      const st = s.getItemStatus(item);
      if (st === 'green') inStock++;
      else if (st === 'yellow') reorder++;
      else if (st === 'red') outOfStock++;
    }
    return {
      all: s.inventory.length,
      inStock,
      reorder,
      outOfStock,
    };
  }, [s.inventory]);

  const items = useMemo(() => {
    const [field, dir] = sort.split('-') as [SortField, SortDir];
    const baseList = s.searchInventory(search, category, field, dir);
    if (stockFilter === 'all') return baseList;
    return baseList.filter(it => {
      const st = s.getItemStatus(it);
      if (stockFilter === 'in-stock') return st === 'green';
      if (stockFilter === 'reorder') return st === 'yellow';
      if (stockFilter === 'out-of-stock') return st === 'red';
      return true;
    });
  }, [search, category, sort, stockFilter, s.inventory]);

  const [selected, setSelected] = useState<InventoryItem | null>(null);
  const [editing, setEditing] = useState<InventoryItem | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState(emptyItem);
  const [adjustItem, setAdjustItem] = useState<InventoryItem | null>(null);
  const [adjustDelta, setAdjustDelta] = useState(0);
  const [toast, setToast] = useState<string | null>(null);
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2600);
    return () => clearTimeout(t);
  }, [toast]);

  const startCreate = () => {
    setForm(emptyItem);
    setCreating(true);
    setEditing(null);
  };
  const startEdit = (it: InventoryItem) => {
    setEditing(it);
    setCreating(false);
    setForm({
      sku: it.sku,
      name: it.name,
      category: it.category,
      unit: it.unit,
      quantity: it.quantity,
      reorderPoint: it.reorderPoint,
      unitCost: it.unitCost,
      supplier: it.supplier,
      location: it.location,
    });
  };
  const saveForm = () => {
    if (!form.name || !form.sku) {
      setToast('SKU and Name are required');
      return;
    }
    if (creating) {
      s.addInventoryItem(form);
      setToast('Item added');
    } else if (editing) {
      s.updateInventoryItem(editing.id, {
        ...form,
        barcodeString: editing.sku === form.sku ? editing.barcodeString : generateBarcodeString(form.sku),
      });
      setToast('Item updated');
    }
    setCreating(false);
    setEditing(null);
  };

  const confirmDelete = (it: InventoryItem) => {
    if (!window.confirm(`Delete ${it.name} (${it.sku})? This cannot be undone.`)) return;
    s.deleteInventoryItem(it.id);
    setToast('Item deleted');
  };

  const saveAdjust = () => {
    if (!adjustItem) return;
    s.adjustStock(adjustItem.id, adjustDelta);
    setToast(`Stock adjusted: ${adjustDelta > 0 ? '+' : ''}${adjustDelta}`);
    setAdjustItem(null);
    setAdjustDelta(0);
  };

  const addToCart = (it: InventoryItem, qty = 1) => {
    s.addToCart(it.id, qty);
    setToast(`${qty} × ${it.name} added to cart`);
  };

  const totalValue = items.reduce((sum, i) => sum + i.quantity * i.unitCost, 0);

  return (
    <div className="space-y-5">
      <section className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-widest text-muted">Inventory</p>
          <h2 className="text-2xl md:text-3xl font-extrabold mt-1">
            {items.length === s.inventory.length ? 'Masterlist' : 'Search Results'}
            <span className="ml-3 text-sm font-medium text-muted">
              {items.length} SKU{items.length === 1 ? '' : 's'} · Worth {formatCurrency(totalValue)}
            </span>
          </h2>
        </div>
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-start sm:justify-end">
          {/* View Mode Toggle */}
          <div className="flex items-center p-1 rounded-xl border surface surface-border">
            <button
              type="button"
              onClick={() => setViewMode('animated')}
              className={cn(
                'px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all whitespace-nowrap',
                viewMode === 'animated'
                  ? 'bg-royal-primary text-white shadow-sm'
                  : 'text-muted hover:text-[var(--text)]',
              )}
              title="Animated Stream View"
            >
              <LayoutList className="w-3.5 h-3.5" /> <span className="hidden xs:inline sm:inline">Animated</span> List
            </button>
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={cn(
                'px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all whitespace-nowrap',
                viewMode === 'table'
                  ? 'bg-royal-primary text-white shadow-sm'
                  : 'text-muted hover:text-[var(--text)]',
              )}
              title="Table View"
            >
              <TableIcon className="w-3.5 h-3.5" /> Table
            </button>
          </div>

          <button
            type="button"
            onClick={() => setFiltersOpen(o => !o)}
            className={cn(
              'h-11 px-3 sm:px-4 rounded-xl border surface surface-border flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm font-medium hover:border-royal-primary/40 transition-colors whitespace-nowrap',
              (category !== 'All' || filtersOpen) && 'ring-1 ring-royal-primary/30',
            )}
          >
            <Filter className="w-4 h-4" /> Filters
          </button>
          {canEdit && (
            <button
              type="button"
              onClick={startCreate}
              className="btn-primary h-11 px-4 sm:px-6 whitespace-nowrap shrink-0 text-xs sm:text-sm"
            >
              <Plus className="w-4 h-4 shrink-0" />
              <span>New Item</span>
            </button>
          )}
        </div>
      </section>

      {/* PillNav Categorization Component from React Bits */}
      <section className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-2 sm:p-2.5 rounded-2xl surface surface-border shadow-sm">
        <div className="flex items-center gap-2 min-w-0 w-full sm:w-auto">
          <PillNav
            logo={
              <div className="w-full h-full rounded-full bg-gradient-to-tr from-[#D4AF37] to-[#800020] flex items-center justify-center text-white shadow-sm">
                <Boxes className="w-4 h-4 text-white" />
              </div>
            }
            logoAlt="MPW Inventory Status"
            items={[
              {
                label: 'All Items',
                href: 'all',
                badge: stockCounts.all,
                onClick: () => setStockFilter('all'),
              },
              {
                label: 'In Stock',
                href: 'in-stock',
                badge: stockCounts.inStock,
                onClick: () => setStockFilter('in-stock'),
              },
              {
                label: 'Reorder Point',
                href: 'reorder',
                badge: stockCounts.reorder,
                onClick: () => setStockFilter('reorder'),
              },
              {
                label: 'Out of Stock',
                href: 'out-of-stock',
                badge: stockCounts.outOfStock,
                onClick: () => setStockFilter('out-of-stock'),
              },
            ]}
            activeHref={stockFilter}
            baseColor={s.theme === 'dark' ? '#1E2026' : '#500B18'}
            pillColor={s.theme === 'dark' ? '#2A2D35' : '#FFFFFF'}
            pillTextColor={s.theme === 'dark' ? '#F5F5F7' : '#500B18'}
            hoveredPillTextColor={s.theme === 'dark' ? '#D4AF37' : '#FFFFFF'}
            ease="power2.easeOut"
            initialLoadAnimation={true}
          />
        </div>

        {/* Live Filter Indicator Pill */}
        <div className="hidden lg:flex items-center gap-2 text-xs text-muted pr-2">
          {stockFilter === 'all' && (
            <span className="flex items-center gap-1.5 font-medium">
              <span className="w-2 h-2 rounded-full bg-slate-400" />
              Showing all inventory items ({items.length})
            </span>
          )}
          {stockFilter === 'in-stock' && (
            <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Healthy stock levels &gt; reorder point ({items.length})
            </span>
          )}
          {stockFilter === 'reorder' && (
            <span className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 font-semibold">
              <AlertTriangle className="w-3.5 h-3.5" />
              Items at or below reorder threshold ({items.length})
            </span>
          )}
          {stockFilter === 'out-of-stock' && (
            <span className="flex items-center gap-1.5 text-rose-600 dark:text-rose-400 font-semibold">
              <XCircle className="w-3.5 h-3.5" />
              Depleted inventory items ({items.length})
            </span>
          )}
        </div>
      </section>

      <section className="stat-card shadow-card space-y-4">
        <div className="flex flex-col lg:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
            <input
              id="mobile-search-focus"
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by Item Name or SKU..."
              className="w-full h-11 pl-11 pr-4 rounded-xl border surface-border surface outline-none focus:ring-2 focus:ring-royal-primary/30"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <select
              value={category}
              onChange={e => setCategory(e.target.value)}
              className="h-11 min-w-[160px] rounded-xl border surface-border surface px-3 text-sm outline-none focus:ring-2 focus:ring-royal-primary/30"
            >
              {categories.map(c => (
                <option key={c}>{c}</option>
              ))}
            </select>
            <div className="relative flex items-center">
              <ArrowUpDown className="w-4 h-4 absolute left-3 text-muted pointer-events-none" />
              <select
                value={sort}
                onChange={e => setSort(e.target.value as `${SortField}-${SortDir}`)}
                className="h-11 min-w-[180px] rounded-xl border surface-border surface pl-10 pr-8 text-sm outline-none focus:ring-2 focus:ring-royal-primary/30 appearance-none"
              >
                {sortOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {filtersOpen && (
          <div className="flex flex-wrap gap-2 pt-2 border-t surface-border">
            {s.getCategories().map(cat => {
              const active = category === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(active ? 'All' : cat)}
                  className={cn('chip surface-border', active && 'chip-active')}
                >
                  {cat}
                  <span className="ml-1 text-[10px] opacity-70">
                    ({s.inventory.filter(i => i.category === cat).length})
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </section>

      {/* Animated List View */}
      {viewMode === 'animated' && (
        <section className="stat-card shadow-card p-2 md:p-4">
          <div className="flex items-center justify-between px-3 py-2 text-xs text-muted font-medium border-b surface-border mb-2">
            <span>Scroll or use ↑/↓ Arrow keys & Enter to select items</span>
            <span>{items.length} items</span>
          </div>

          {items.length === 0 ? (
            <div className="py-16 text-center text-muted">
              <Search className="w-10 h-10 mx-auto mb-3 opacity-60" />
              <p className="font-semibold">No inventory items found</p>
              <p className="text-xs mt-1">Try adjusting your search or filters.</p>
            </div>
          ) : (
            <AnimatedList
              items={items}
              onItemSelect={item => setSelected(item)}
              showGradients={true}
              enableArrowNavigation={true}
              displayScrollbar={true}
              className="w-full"
              renderItem={(it, index, isSelected) => {
                const status = s.getItemStatus(it);
                const isHi = highlightId === it.id;
                return (
                  <div
                    id={`inv-item-${it.id}`}
                    className={cn(
                      'p-4 rounded-2xl border transition-all surface flex flex-col md:flex-row md:items-center justify-between gap-4',
                      isSelected
                        ? 'border-royal-primary dark:border-crimson-alert ring-2 ring-royal-primary/20 bg-royal-primary/[0.03] dark:bg-crimson-primary/10 shadow-md'
                        : 'surface-border hover:border-royal-primary/40',
                      isHi && 'ring-2 ring-royal-gold animate-pulse-highlight bg-royal-gold/5',
                    )}
                  >
                    <div className="flex items-start md:items-center gap-3 min-w-0 flex-1">
                      <div className="hidden sm:block shrink-0">
                        <BarcodeDisplay code={it.barcodeString} height={28} showText={false} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-bold text-base truncate">{it.name}</span>
                          <StatusBadge status={status} />
                          <span className="font-mono text-xs text-muted">({it.sku})</span>
                        </div>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-xs text-muted">
                          <span>Category: <strong className="text-[var(--text)]">{it.category}</strong></span>
                          <span>Unit: <strong className="text-[var(--text)]">{it.unit}</strong></span>
                          {it.location && <span>Loc: <strong className="text-[var(--text)]">{it.location}</strong></span>}
                          {it.supplier && <span>Supplier: <strong className="text-[var(--text)]">{it.supplier}</strong></span>}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between md:justify-end gap-4 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 surface-border">
                      <div className="text-left md:text-right">
                        <p className="text-xs text-muted">Stock Level</p>
                        <p className="font-bold text-base tabular-nums">
                          {formatNumber(it.quantity)} <span className="text-xs font-normal text-muted">{it.unit}</span>
                        </p>
                      </div>

                      <div className="text-right">
                        <p className="text-xs text-muted">Total Value</p>
                        <p className="font-bold text-base text-primary tabular-nums">
                          {formatCurrency(it.quantity * it.unitCost)}
                        </p>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={e => {
                            e.stopPropagation();
                            setSelected(it);
                          }}
                          className="w-9 h-9 rounded-xl flex items-center justify-center hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                          title="View Details"
                        >
                          <Info className="w-4 h-4" />
                        </button>

                        {canEdit && (
                          <>
                            <button
                              type="button"
                              onClick={e => {
                                e.stopPropagation();
                                startEdit(it);
                              }}
                              className="w-9 h-9 rounded-xl flex items-center justify-center text-sky-600 dark:text-sky-400 hover:bg-sky-500/10 transition-colors"
                              title="Edit"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={e => {
                                e.stopPropagation();
                                setAdjustItem(it);
                                setAdjustDelta(0);
                              }}
                              className="w-9 h-9 rounded-xl flex items-center justify-center text-royal-primary hover:bg-royal-primary/10 transition-colors"
                              title="Stock Adjust"
                            >
                              <ArrowUpDown className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={e => {
                                e.stopPropagation();
                                confirmDelete(it);
                              }}
                              className="w-9 h-9 rounded-xl flex items-center justify-center text-status-red hover:bg-status-red/10 transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        )}

                        {isCustomer && (
                          <button
                            type="button"
                            onClick={e => {
                              e.stopPropagation();
                              addToCart(it, 1);
                            }}
                            disabled={status === 'red'}
                            className={cn(
                              'h-9 px-3 rounded-xl inline-flex items-center gap-1.5 text-xs font-semibold transition-all',
                              status === 'red'
                                ? 'bg-muted/10 text-muted cursor-not-allowed'
                                : 'bg-royal-primary text-white hover:brightness-110',
                            )}
                          >
                            <ShoppingCart className="w-3.5 h-3.5" />
                            Add
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              }}
            />
          )}
        </section>
      )}

      {/* Desktop Table View */}
      {viewMode === 'table' && (
        <section className="hidden md:block stat-card shadow-card overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b surface-border text-muted uppercase text-xs tracking-wider">
                  <th className="text-left font-semibold px-5 py-4">Code</th>
                  <th className="text-left font-semibold px-3 py-4">SKU</th>
                  <th className="text-left font-semibold px-3 py-4">Item Name</th>
                  <th className="text-left font-semibold px-3 py-4">Category</th>
                  <th className="text-left font-semibold px-3 py-4">Unit</th>
                  <th className="text-right font-semibold px-3 py-4">Qty</th>
                  <th className="text-right font-semibold px-3 py-4">Reorder Pt</th>
                  <th className="text-left font-semibold px-3 py-4">Status</th>
                  <th className="text-right font-semibold px-3 py-4">Value</th>
                  <th className="text-right font-semibold px-5 py-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map((it, idx) => {
                  const status = s.getItemStatus(it);
                  const isHi = highlightId === it.id;
                  return (
                    <tr
                      key={it.id}
                      id={`inv-item-${it.id}`}
                      className={cn(
                        'border-b surface-border last:border-0 transition-colors',
                        idx % 2 && 'bg-black/[0.02] dark:bg-white/[0.02]',
                        isHi && 'ring-2 ring-inset ring-royal-gold animate-pulse-highlight bg-royal-gold/5 dark:bg-royal-gold/10',
                      )}
                    >
                      <td className="px-5 py-3.5"><BarcodeDisplay code={it.barcodeString} height={28} /></td>
                      <td className="px-3 py-3.5 font-mono text-xs text-muted">{it.sku}</td>
                      <td className="px-3 py-3.5 font-semibold">{it.name}</td>
                      <td className="px-3 py-3.5 text-muted">{it.category}</td>
                      <td className="px-3 py-3.5 text-muted">{it.unit}</td>
                      <td className="px-3 py-3.5 text-right font-bold tabular-nums">
                        {formatNumber(it.quantity)}
                      </td>
                      <td className="px-3 py-3.5 text-right text-muted tabular-nums">
                        {formatNumber(it.reorderPoint)}
                      </td>
                      <td className="px-3 py-3.5"><StatusBadge status={status} /></td>
                      <td className="px-3 py-3.5 text-right tabular-nums font-semibold">
                        {formatCurrency(it.quantity * it.unitCost)}
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => setSelected(it)}
                            className="w-10 h-10 rounded-lg flex items-center justify-center hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                            title="View Details"
                          >
                            <Info className="w-4 h-4" />
                          </button>
                          {canEdit && (
                            <>
                              <button
                                type="button"
                                onClick={() => startEdit(it)}
                                className="w-10 h-10 rounded-lg flex items-center justify-center text-sky-600 dark:text-sky-400 hover:bg-sky-500/10 transition-colors"
                                title="Edit"
                              >
                                <Pencil className="w-4 h-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() => { setAdjustItem(it); setAdjustDelta(0); }}
                                className="w-10 h-10 rounded-lg flex items-center justify-center text-royal-primary hover:bg-royal-primary/10 transition-colors"
                                title="Stock Adjust"
                              >
                                <ArrowUpDown className="w-4 h-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() => confirmDelete(it)}
                                className="w-10 h-10 rounded-lg flex items-center justify-center text-status-red hover:bg-status-red/10 transition-colors"
                                title="Delete"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </>
                          )}
                          {isCustomer && (
                            <button
                              type="button"
                              onClick={() => addToCart(it, 1)}
                              disabled={status === 'red'}
                              className={cn(
                                'h-10 px-3 rounded-lg inline-flex items-center gap-2 text-sm font-semibold transition-all',
                                status === 'red'
                                  ? 'bg-muted/10 text-muted cursor-not-allowed'
                                  : 'bg-royal-primary text-white hover:brightness-110',
                              )}
                            >
                              <ShoppingCart className="w-4 h-4" />
                              Add
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {items.length === 0 && (
                  <tr>
                    <td colSpan={10} className="px-5 py-16 text-center text-muted">
                      <Search className="w-10 h-10 mx-auto mb-3 opacity-60" />
                      <p className="font-semibold">No inventory items found</p>
                      <p className="text-xs mt-1">Try adjusting your search or filters.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Mobile card list (when in table mode on mobile) */}
      {viewMode === 'table' && (
        <section className="md:hidden space-y-3">
        {items.map(it => {
          const status = s.getItemStatus(it);
          const open = mobileExpandedId === it.id;
          const isHi = highlightId === it.id;
          return (
            <div
              key={it.id}
              id={`inv-item-${it.id}`}
              className={cn(
                'stat-card shadow-card overflow-hidden',
                isHi && 'ring-2 ring-royal-gold animate-pulse-highlight',
              )}
            >
              <button
                type="button"
                onClick={() => setMobileExpandedId(open ? null : it.id)}
                className="w-full text-left p-4 flex items-start gap-3"
              >
                <div className="shrink-0">
                  <BarcodeDisplay code={it.barcodeString} height={30} showText={false} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-bold truncate">{it.name}</p>
                      <p className="text-[11px] font-mono text-muted">{it.sku} · {it.category}</p>
                    </div>
                    <StatusBadge status={status} />
                  </div>
                  <div className="mt-2 flex items-center justify-between text-sm">
                    <div>
                      <span className="text-muted">Stock: </span>
                      <span className="font-bold tabular-nums">{formatNumber(it.quantity)}</span>
                      <span className="text-muted ml-1">{it.unit}</span>
                    </div>
                    <span className="font-semibold">{formatCurrency(it.quantity * it.unitCost)}</span>
                  </div>
                </div>
              </button>
              {open && (
                <div className="px-4 pb-4 pt-0 border-t surface-border space-y-3">
                  <dl className="grid grid-cols-2 gap-3 pt-3 text-xs">
                    <div>
                      <dt className="text-muted">Reorder Point</dt>
                      <dd className="font-semibold mt-0.5">{formatNumber(it.reorderPoint)}</dd>
                    </div>
                    <div>
                      <dt className="text-muted">Unit Cost</dt>
                      <dd className="font-semibold mt-0.5">{formatCurrency(it.unitCost)}</dd>
                    </div>
                    <div>
                      <dt className="text-muted flex items-center gap-1"><Truck className="w-3 h-3" /> Supplier</dt>
                      <dd className="font-semibold mt-0.5 truncate">{it.supplier || '—'}</dd>
                    </div>
                    <div>
                      <dt className="text-muted flex items-center gap-1"><MapPin className="w-3 h-3" /> Location</dt>
                      <dd className="font-semibold mt-0.5 truncate">{it.location || '—'}</dd>
                    </div>
                  </dl>
                  <div className="flex flex-wrap gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setSelected(it)}
                      className="btn-outline h-10 px-4 text-xs"
                    >
                      <Info className="w-3.5 h-3.5" /> Details
                    </button>
                    {canEdit && (
                      <>
                        <button type="button" onClick={() => startEdit(it)} className="btn-outline h-10 px-4 text-xs">
                          <Pencil className="w-3.5 h-3.5" /> Edit
                        </button>
                        <button type="button" onClick={() => confirmDelete(it)} className="h-10 px-4 rounded-full border border-status-red/40 text-status-red hover:bg-status-red/10 text-xs font-semibold">
                          <Trash2 className="w-3.5 h-3.5 inline mr-1" /> Delete
                        </button>
                      </>
                    )}
                    {isCustomer && (
                      <button
                        type="button"
                        onClick={() => addToCart(it)}
                        disabled={status === 'red'}
                        className={cn(
                          'h-10 px-4 rounded-full text-xs font-bold inline-flex items-center gap-1',
                          status === 'red' ? 'bg-muted/10 text-muted cursor-not-allowed' : 'bg-royal-primary text-white',
                        )}
                      >
                        <ShoppingCart className="w-3.5 h-3.5" />
                        {status === 'red' ? 'Out of Stock' : 'Add to Cart'}
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
        {items.length === 0 && (
          <div className="stat-card p-10 text-center text-muted">
            <Search className="w-10 h-10 mx-auto mb-2 opacity-60" />
            <p className="font-semibold">No items match your filters.</p>
          </div>
        )}
        </section>
      )}

      {/* Item Details Modal */}
      <Modal
        open={!!selected}
        onClose={() => setSelected(null)}
        title="Item Details"
        maxWidthClass="max-w-xl"
      >
        {selected && (
          <div className="space-y-5">
            <div className="flex items-start gap-4">
              <div className="shrink-0 w-20 h-20 rounded-2xl bg-royal-primary/10 dark:bg-crimson-primary/20 flex items-center justify-center">
                <BarcodeDisplay code={selected.barcodeString} height={44} showText={false} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-xl font-extrabold truncate">{selected.name}</h3>
                  <StatusBadge status={s.getItemStatus(selected)} size="md" />
                </div>
                <p className="text-sm font-mono text-muted mt-1">{selected.sku}</p>
                <p className="text-sm text-muted mt-1">{selected.category} · Unit: {selected.unit}</p>
              </div>
            </div>
            <dl className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-black/[0.03] dark:bg-white/[0.04]">
              <div>
                <dt className="text-xs uppercase tracking-wider text-muted">In Stock</dt>
                <dd className="text-2xl font-black mt-1 tabular-nums">{formatNumber(selected.quantity)}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wider text-muted">Reorder Point</dt>
                <dd className="text-2xl font-black mt-1 tabular-nums">{formatNumber(selected.reorderPoint)}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wider text-muted">Unit Cost</dt>
                <dd className="text-lg font-bold mt-1">{formatCurrency(selected.unitCost)}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wider text-muted">Total Value</dt>
                <dd className="text-lg font-bold mt-1">{formatCurrency(selected.quantity * selected.unitCost)}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wider text-muted flex items-center gap-1"><Truck className="w-3 h-3" /> Supplier</dt>
                <dd className="font-semibold mt-1">{selected.supplier || '—'}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wider text-muted flex items-center gap-1"><MapPin className="w-3 h-3" /> Location</dt>
                <dd className="font-semibold mt-1">{selected.location || '—'}</dd>
              </div>
            </dl>
            <div>
              <p className="text-xs uppercase tracking-wider text-muted mb-2">Barcode</p>
              <div className="p-4 rounded-xl border surface-border flex items-center justify-center bg-white">
                <BarcodeDisplay code={selected.barcodeString} height={56} />
              </div>
            </div>
            {isCustomer && (
              <div className="flex items-center justify-between gap-4 p-4 rounded-xl border border-status-green/30 bg-status-green/5">
                <div>
                  <p className="text-xs uppercase tracking-wider text-status-green font-bold">Customer Action</p>
                  <p className="font-semibold mt-1">Add to shopping cart</p>
                </div>
                <QtyPicker
                  qty={1}
                  max={selected.quantity}
                  disabled={s.getItemStatus(selected) === 'red'}
                  onConfirm={qty => addToCart(selected, qty)}
                />
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Create / Edit Modal */}
      <Modal
        open={creating || !!editing}
        onClose={() => { setCreating(false); setEditing(null); }}
        title={creating ? 'Add New Item' : 'Edit Item'}
        maxWidthClass="max-w-2xl"
        footer={
          <>
            <button type="button" onClick={() => { setCreating(false); setEditing(null); }} className="btn-outline h-11 px-5">
              Cancel
            </button>
            <button type="button" onClick={saveForm} className="btn-primary h-11 px-6">
              {creating ? 'Create Item' : 'Save Changes'}
            </button>
          </>
        }
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="SKU *" required>
            <input className="input" value={form.sku} onChange={e => setForm({ ...form, sku: e.target.value })} placeholder="e.g. OFF-010" />
          </Field>
          <Field label="Category *">
            <select className="input" value={form.category} onChange={e => setForm({ ...form, category: e.target.value as InventoryItem['category'] })}>
              {categories.filter(c => c !== 'All').map(c => <option key={c}>{c}</option>)}
            </select>
          </Field>
          <div className="sm:col-span-2">
            <Field label="Item Name *" required>
              <input className="input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. Wireless Mouse Ergonomic" />
            </Field>
          </div>
          <Field label="Unit of Measure">
            <input className="input" value={form.unit} onChange={e => setForm({ ...form, unit: e.target.value })} placeholder="Piece, Box, Ream..." />
          </Field>
          <Field label="Unit Cost (₱)">
            <input type="number" min="0" step="0.01" className="input" value={form.unitCost} onChange={e => setForm({ ...form, unitCost: Number(e.target.value) })} />
          </Field>
          <Field label="Quantity on Hand" required>
            <input type="number" min="0" className="input" value={form.quantity} onChange={e => setForm({ ...form, quantity: Number(e.target.value) })} />
          </Field>
          <Field label="Reorder Point Threshold" required>
            <input type="number" min="0" className="input" value={form.reorderPoint} onChange={e => setForm({ ...form, reorderPoint: Number(e.target.value) })} />
          </Field>
          <Field label="Supplier">
            <input className="input" value={form.supplier} onChange={e => setForm({ ...form, supplier: e.target.value })} />
          </Field>
          <Field label="Warehouse Location">
            <input className="input" value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} placeholder="e.g. Shelf A-12" />
          </Field>
        </div>
      </Modal>

      {/* Stock Adjust Modal */}
      <Modal
        open={!!adjustItem}
        onClose={() => { setAdjustItem(null); setAdjustDelta(0); }}
        title={`Adjust Stock: ${adjustItem?.name ?? ''}`}
        maxWidthClass="max-w-md"
        footer={
          <>
            <button type="button" onClick={() => { setAdjustItem(null); setAdjustDelta(0); }} className="btn-outline h-11 px-5">Cancel</button>
            <button type="button" onClick={saveAdjust} disabled={adjustDelta === 0} className="btn-primary h-11 px-6">Apply Adjustment</button>
          </>
        }
      >
        {adjustItem && (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-black/[0.03] dark:bg-white/[0.04] flex items-center justify-between">
              <div>
                <p className="text-xs text-muted uppercase tracking-wider">Current Stock</p>
                <p className="text-3xl font-black mt-1 tabular-nums">{formatNumber(adjustItem.quantity)}</p>
              </div>
              <StatusBadge status={s.getItemStatus(adjustItem)} size="md" />
            </div>
            <div>
              <label className="text-sm font-semibold">Adjustment Quantity</label>
              <div className="mt-2 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setAdjustDelta(d => d - 1)}
                  className="w-11 h-11 rounded-xl border surface-border flex items-center justify-center hover:bg-black/5 dark:hover:bg-white/5"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <input
                  type="number"
                  className="input flex-1 h-11 text-center text-xl font-black tabular-nums"
                  value={adjustDelta}
                  onChange={e => setAdjustDelta(Number(e.target.value))}
                />
                <button
                  type="button"
                  onClick={() => setAdjustDelta(d => d + 1)}
                  className="w-11 h-11 rounded-xl border surface-border flex items-center justify-center hover:bg-black/5 dark:hover:bg-white/5"
                >
                  <PlusCircle className="w-4 h-4" />
                </button>
              </div>
              <div className="mt-3 flex items-center justify-between text-sm p-3 rounded-xl border surface-border">
                <span className="text-muted">New Stock Level:</span>
                <span className={cn('text-xl font-black tabular-nums', (adjustItem.quantity + adjustDelta) < 0 && 'text-status-red')}>
                  {formatNumber(Math.max(0, adjustItem.quantity + adjustDelta))}
                </span>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-24 md:bottom-8 left-1/2 -translate-x-1/2 z-[120] animate-fade-in">
          <div className="px-4 py-3 rounded-xl surface shadow-card-lg border surface-border text-sm font-semibold inline-flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-status-green" />
            {toast}
          </div>
        </div>
      )}

      <style>{`
        .input {
          width: 100%; height: 44px; border-radius: 12px; padding: 0 14px;
          outline: none; border: 1px solid var(--border); background: var(--card);
          color: var(--text); font-size: 14px; transition: all .15s ease;
        }
        .input:focus { border-color: #500B18; box-shadow: 0 0 0 3px rgba(80,11,24,0.12); }
      `}</style>
    </div>
  );
}

function Field({ label, children, required }: { label: string; children: React.ReactNode; required?: boolean }) {
  return (
    <label className="block">
      <span className="text-xs font-semibold uppercase tracking-wider text-muted flex items-center gap-1">
        {label} {required && <span className="text-status-red">*</span>}
      </span>
      <div className="mt-2">{children}</div>
    </label>
  );
}

function QtyPicker({
  qty: initial,
  max,
  disabled,
  onConfirm,
}: {
  qty: number;
  max: number;
  disabled?: boolean;
  onConfirm: (qty: number) => void;
}) {
  const [qty, setQty] = useState(Math.max(1, Math.min(initial, max || 1)));
  useEffect(() => { setQty(q => Math.max(1, Math.min(q, Math.max(1, max || 1)))); }, [max]);
  return (
    <div className="flex items-center gap-2">
      <div className="inline-flex items-center rounded-xl border surface-border overflow-hidden">
        <button
          type="button"
          onClick={() => setQty(q => Math.max(1, q - 1))}
          disabled={disabled || qty <= 1}
          className="w-10 h-10 flex items-center justify-center hover:bg-black/5 dark:hover:bg-white/5 disabled:opacity-40"
        >
          <Minus className="w-4 h-4" />
        </button>
        <input
          type="number"
          className="h-10 w-14 text-center border-0 bg-transparent focus:ring-0 font-bold tabular-nums"
          value={qty}
          min={1}
          max={max}
          disabled={disabled}
          onChange={e => setQty(Math.max(1, Math.min(max, Number(e.target.value) || 1)))}
        />
        <button
          type="button"
          onClick={() => setQty(q => Math.min(max, q + 1))}
          disabled={disabled || qty >= max}
          className="w-10 h-10 flex items-center justify-center hover:bg-black/5 dark:hover:bg-white/5 disabled:opacity-40"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>
      <button
        type="button"
        onClick={() => onConfirm(qty)}
        disabled={disabled}
        className={cn('h-10 px-4 rounded-xl font-bold text-sm inline-flex items-center gap-1 transition-colors',
          disabled ? 'bg-muted/10 text-muted cursor-not-allowed' : 'bg-royal-primary text-white hover:brightness-110',
        )}
      >
        <ShoppingCart className="w-4 h-4" /> Add
      </button>
      {disabled && (
        <span className="text-xs text-status-red font-semibold">Unavailable</span>
      )}
    </div>
  );
}
