import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  AppState,
  DashboardStats,
  WarehouseMetrics,
  InventoryItem,
  Requisition,
  RequisitionItem,
  IssuanceLog,
  EmailLog,
  User,
  StockStatus,
  SortField,
  SortDir,
  RequisitionStatus,
  UserRole,
  EmailEventType,
} from '@/types';
import { seedInventory, seedRequisitions, seedIssuanceLogs, seedEmailLogs, seedUsers } from '@/data/seed';
import {
  startOfDay,
  startOfMonth,
  startOfWeek,
  startOfYear,
  generateBarcodeString,
} from '@/utils';

import { SupabaseService } from '@/utils/supabaseService';

const defaultInitial: AppState = {
  theme: 'light',
  isAuthenticated: false,
  currentUser: null,
  activeShift: 'Shift A',
  activePage: 'dashboard',
  users: seedUsers,
  inventory: seedInventory,
  requisitions: seedRequisitions,
  issuanceLogs: seedIssuanceLogs,
  emailLogs: seedEmailLogs,
  cart: [],
  lastHighlightedItemId: null,
  searchTerm: '',
};

export type TimePeriodFilter = 'Current Shift' | 'Today' | 'This Week' | 'This Month' | 'This Year';

interface AppActions {
  initFromSupabase: () => Promise<void>;
  setTheme: (t: AppState['theme']) => void;
  toggleTheme: () => void;
  loginAsRole: (role: UserRole) => void;
  loginWithUser: (user: User) => void;
  loginDefault: () => void;
  logout: () => void;
  switchRole: (role: UserRole) => void;
  setActivePage: (page: AppState['activePage']) => void;
  setActiveShift: (shift: AppState['activeShift']) => void;
  setSearchTerm: (s: string) => void;
  setHighlightedItem: (id: string | null) => void;

  addInventoryItem: (item: Omit<InventoryItem, 'id' | 'barcodeString' | 'createdAt'>) => void;
  updateInventoryItem: (id: string, patch: Partial<InventoryItem>) => void;
  deleteInventoryItem: (id: string) => void;
  adjustStock: (itemId: string, delta: number) => void;
  getItemStatus: (item: InventoryItem) => StockStatus;
  getInventoryByStatus: () => { green: InventoryItem[]; yellow: InventoryItem[]; red: InventoryItem[] };
  searchInventory: (term: string, category?: string, sortField?: SortField, sortDir?: SortDir) => InventoryItem[];
  findItemByBarcodeOrSku: (code: string) => InventoryItem | undefined;
  getCategories: () => string[];

  getDashboardStats: () => DashboardStats;
  getWarehouseMetrics: () => WarehouseMetrics;
  getPendingRequisitions: () => Requisition[];
  getIssuanceLogsByPeriod: (period: TimePeriodFilter) => IssuanceLog[];
  getRequisitionsByStatus: (status?: RequisitionStatus) => Requisition[];
  getMonthlyTrendData: () => { label: string; monthKey: string; expense: number; profit: number }[];
  getCategoryVolumes: () => { category: string; value: number }[];
  getInventoryValuesDonut: () => { name: string; value: number; percent: number }[];

  addToCart: (itemId: string, qty?: number) => void;
  removeFromCart: (itemId: string) => void;
  updateCartQty: (itemId: string, qty: number) => void;
  clearCart: () => void;
  getCartItemsWithDetails: () => (RequisitionItem & { maxQty: number; available: number })[];
  getCartSubtotal: () => number;
  getCartCount: () => number;

  submitRequisition: (form: {
    requestorName: string;
    requestorEmail?: string;
    purpose: string;
    deptCode: string;
    requiredDate: string;
    notes?: string;
  }) => Requisition | null;
  approveRequisition: (id: string) => void;
  fulfillRequisition: (id: string) => Requisition | null;
  rejectRequisition: (id: string, reason: string) => void;

  processQuickIssuance: (input: {
    itemId: string;
    qty: number;
    requestorName: string;
    purpose: string;
  }) => void;

  recordEmail: (e: Omit<EmailLog, 'id' | 'timestamp' | 'read'>) => void;
  markEmailRead: (id: string) => void;
  getUnreadEmailCount: () => number;

  getCustomerMyRequisitions: (customerName: string) => Requisition[];

  addUser: (input: { name: string; email: string; role: UserRole; dept?: string; password?: string }) => User;
  updateUser: (id: string, patch: Partial<Pick<User, 'role' | 'active' | 'department' | 'dept' | 'name' | 'email'>>) => void;
  deleteUser: (id: string) => void;
  resetToSeed: () => void;
}

export const useAppStore = create<AppState & AppActions>()(
  persist(
    (set, get) => ({
      ...defaultInitial,

      initFromSupabase: async () => {
        try {
          // Auto-seed if database is completely new
          await SupabaseService.seedInitialIfEmpty({
            users: seedUsers,
            inventory: seedInventory,
            requisitions: seedRequisitions,
            issuanceLogs: seedIssuanceLogs,
            emailLogs: seedEmailLogs,
          });

          // Fetch latest state from Supabase
          const [inv, users, reqs, logs, emails] = await Promise.all([
            SupabaseService.fetchInventory(),
            SupabaseService.fetchUsers(),
            SupabaseService.fetchRequisitions(),
            SupabaseService.fetchIssuanceLogs(),
            SupabaseService.fetchEmailLogs(),
          ]);

          set(s => ({
            inventory: inv && inv.length > 0 ? inv : s.inventory,
            users: users && users.length > 0 ? users : s.users,
            requisitions: reqs && reqs.length > 0 ? reqs : s.requisitions,
            issuanceLogs: logs && logs.length > 0 ? logs : s.issuanceLogs,
            emailLogs: emails && emails.length > 0 ? emails : s.emailLogs,
          }));
        } catch (err) {
          console.warn('Supabase initialization fallback to local storage:', err);
        }
      },

      setTheme: theme => set({ theme }),
      toggleTheme: () => set(s => ({ theme: s.theme === 'light' ? 'dark' : 'light' })),

      loginAsRole: role => {
        const list = get().users;
        let user = list.find(u => u.role === role) || list[0];
        const { switchRole } = get();
        set({ isAuthenticated: true, currentUser: user, activePage: 'dashboard' });
        if (user && user.role !== role) {
          switchRole(role);
        }
      },
      loginWithUser: user => {
        set({ isAuthenticated: true, currentUser: user, activePage: 'dashboard' });
      },
      loginDefault: () => get().loginAsRole('editor'),
      logout: () => set({ isAuthenticated: false, currentUser: null, cart: [], activePage: 'dashboard' }),

      switchRole: role => {
        const users = get().users;
        let user = users.find(u => u.role === role);
        if (!user) {
          user = {
          id: `u-${role}-runtime`,
            name:
              role === 'editor'
                ? 'Runtime Admin'
                : role === 'warehouse'
                  ? 'Runtime Warehouse'
                  : 'Runtime Customer',
            email: `${role}@mpw.com`,
            role,
            active: true,
            avatarInitials: role === 'editor' ? 'RA' : role === 'warehouse' ? 'RW' : 'RC',
          };
        }
        set({ currentUser: user });
      },

      setActivePage: activePage => set({ activePage }),
      setActiveShift: activeShift => set({ activeShift }),
      setSearchTerm: searchTerm => set({ searchTerm }),
      setHighlightedItem: lastHighlightedItemId => set({ lastHighlightedItemId }),

      addInventoryItem: payload => {
        const nextId = `inv-${Date.now()}`;
        const item: InventoryItem = {
          ...payload,
          id: nextId,
          barcodeString: generateBarcodeString(payload.sku),
          createdAt: Date.now(),
        };
        set(s => ({ inventory: [...s.inventory, item] }));
        SupabaseService.upsertItem(item);
      },
      updateInventoryItem: (id, patch) => {
        set(s => ({
          inventory: s.inventory.map(it => (it.id === id ? { ...it, ...patch } : it)),
        }));
        const updated = get().inventory.find(it => it.id === id);
        if (updated) SupabaseService.upsertItem(updated);
      },
      deleteInventoryItem: id => {
        set(s => ({ inventory: s.inventory.filter(it => it.id !== id) }));
        SupabaseService.deleteItem(id);
      },
      adjustStock: (itemId, delta) => {
        set(s => ({
          inventory: s.inventory.map(it =>
            it.id === itemId ? { ...it, quantity: Math.max(0, it.quantity + delta) } : it,
          ),
        }));
        const updated = get().inventory.find(it => it.id === itemId);
        if (updated) SupabaseService.upsertItem(updated);
      },

      getItemStatus: item => {
        if (item.quantity === 0) return 'red';
        if (item.quantity <= item.reorderPoint) return 'yellow';
        return 'green';
      },

      getInventoryByStatus: () => {
        const green: InventoryItem[] = [];
        const yellow: InventoryItem[] = [];
        const red: InventoryItem[] = [];
        const gi = get().getItemStatus;
        for (const it of get().inventory) {
          const st = gi(it);
          if (st === 'green') green.push(it);
          else if (st === 'yellow') yellow.push(it);
          else red.push(it);
        }
        return { green, yellow, red };
      },

      searchInventory: (term, category, sortField = 'name', sortDir = 'asc') => {
        const { inventory } = get();
        const t = term.trim().toLowerCase();
        let list = inventory.filter(i => {
          if (t && !i.name.toLowerCase().includes(t) && !i.sku.toLowerCase().includes(t)) return false;
          if (category && category !== 'All' && i.category !== category) return false;
          return true;
        });
        list = [...list].sort((a, b) => {
          let cmp = 0;
          if (sortField === 'quantity') cmp = a.quantity - b.quantity;
          else if (sortField === 'unitCost') cmp = a.unitCost - b.unitCost;
          else cmp = String(a[sortField]).localeCompare(String(b[sortField]), undefined, { numeric: true });
          return sortDir === 'asc' ? cmp : -cmp;
        });
        return list;
      },

      findItemByBarcodeOrSku: code => {
        const c = code.trim().toUpperCase();
        return get().inventory.find(
          i => i.sku.toUpperCase() === c || i.barcodeString.toUpperCase() === c,
        );
      },

      getCategories: () => {
        const set = new Set<string>();
        for (const it of get().inventory) set.add(it.category);
        return Array.from(set);
      },

      getDashboardStats: () => {
        const { inventory, requisitions, getInventoryByStatus, users } = get();
        const totalProducts = inventory.length;
        const orders = requisitions.filter(r => r.status === 'Fulfilled').length;
        const totalStock = inventory.reduce((s, it) => s + it.quantity, 0);
        const { green, yellow, red } = getInventoryByStatus();
        const totalCustomers = users.filter(u => u.role === 'customer').length;
        const pendingRequisitions = requisitions.filter(r => r.status === 'Pending').length;
        const totalInventoryValue = inventory.reduce((s, it) => s + it.quantity * it.unitCost, 0);
        return {
          totalProducts,
          orders,
          totalStock,
          outOfStock: red.length,
          lowStock: yellow.length,
          inStock: green.length,
          totalCustomers,
          pendingRequisitions,
          totalInventoryValue,
        };
      },

      getWarehouseMetrics: () => {
        const { getInventoryByStatus, inventory, getPendingRequisitions } = get();
        const { green, yellow, red } = getInventoryByStatus();
        return {
          uniqueSkus: inventory.length,
          greenCount: green.length,
          yellowCount: yellow.length,
          redCount: red.length,
          pendingRequisitions: getPendingRequisitions().length,
        };
      },

      getPendingRequisitions: () => get().requisitions.filter(r => r.status === 'Pending'),

      getIssuanceLogsByPeriod: period => {
        const list = get().issuanceLogs;
        const now = Date.now();
        let startTs = 0;
        if (period === 'Current Shift') {
          const shift = get().activeShift;
          return list.filter(l => l.shiftId === shift);
        }
        if (period === 'Today') startTs = startOfDay(now);
        else if (period === 'This Week') startTs = startOfWeek(now);
        else if (period === 'This Month') startTs = startOfMonth(now);
        else startTs = startOfYear(now);
        return list.filter(l => l.timestamp >= startTs);
      },

      getRequisitionsByStatus: status => {
        const { requisitions } = get();
        if (!status) return requisitions;
        return requisitions.filter(r => r.status === status);
      },

      getMonthlyTrendData: () => {
        const { issuanceLogs, inventory } = get();
        const now = new Date();
        const labels: { label: string; monthKey: string; start: number; end: number }[] = [];
        for (let i = 5; i >= 0; i--) {
          const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
          const label = d.toLocaleString('en-US', { month: 'short' });
          const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
          const start = d.getTime();
          const end = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999).getTime();
          labels.push({ label, monthKey: key, start, end });
        }
        return labels.map(m => {
          let expense = 0;
          let profit = 0;
          for (const l of issuanceLogs) {
            if (l.timestamp >= m.start && l.timestamp <= m.end) {
              const cost = l.qtyIssued * l.unitCost;
              expense += cost;
              profit += cost * 1.3;
            }
          }
          const inventoryForMonth = inventory.reduce((s, it) => s + it.unitCost, 0);
          return {
            label: m.label,
            monthKey: m.monthKey,
            expense: Math.round(expense || (i => i)(inventoryForMonth * 0.08 * Math.random() + 500)),
            profit: Math.round(profit || (inventoryForMonth * 0.12 * Math.random() + 1200)),
          };
        });
      },

      getCategoryVolumes: () => {
        const map = new Map<string, number>();
        for (const it of get().inventory) {
          map.set(it.category, (map.get(it.category) || 0) + it.quantity);
        }
        return Array.from(map.entries())
          .map(([category, value]) => ({ category, value }))
          .sort((a, b) => b.value - a.value);
      },

      getInventoryValuesDonut: () => {
        const totalStock = get().inventory.reduce((s, it) => s + it.quantity, 0);
        const sold = get().issuanceLogs.reduce((s, l) => s + l.qtyIssued, 0);
        const total = totalStock + sold;
        const soldPct = total === 0 ? 0 : Math.round((sold / total) * 100);
        const totalPct = 100 - soldPct;
        return [
          { name: 'Sold units', value: sold, percent: soldPct },
          { name: 'Total units', value: totalStock, percent: totalPct },
        ];
      },

      addToCart: (itemId, qty = 1) =>
        set(s => {
          const item = s.inventory.find(i => i.id === itemId);
          if (!item) return {};
          const max = item.quantity;
          const existing = s.cart.find(c => c.itemId === itemId);
          const newQty = Math.max(1, Math.min(max, existing ? existing.qty + qty : qty));
          if (newQty <= 0) return {};
          let next = s.cart;
          if (existing) next = s.cart.map(c => (c.itemId === itemId ? { ...c, qty: newQty } : c));
          else next = [...s.cart, { itemId, qty: newQty }];
          return { cart: next };
        }),
      removeFromCart: itemId => set(s => ({ cart: s.cart.filter(c => c.itemId !== itemId) })),
      updateCartQty: (itemId, qty) =>
        set(s => {
          const item = s.inventory.find(i => i.id === itemId);
          const max = item?.quantity ?? 0;
          const clamped = Math.max(0, Math.min(max, qty));
          if (clamped === 0) return { cart: s.cart.filter(c => c.itemId !== itemId) };
          return {
            cart: s.cart.map(c => (c.itemId === itemId ? { ...c, qty: clamped } : c)),
          };
        }),
      clearCart: () => set({ cart: [] }),

      getCartItemsWithDetails: () => {
        const { cart, inventory } = get();
        return cart
          .map(c => {
            const inv = inventory.find(i => i.id === c.itemId);
            if (!inv) return null;
            const available = inv.quantity;
            const qty = Math.min(c.qty, available);
            return {
              itemId: inv.id,
              sku: inv.sku,
              itemName: inv.name,
              qty,
              unitCost: inv.unitCost,
              maxQty: available,
              available,
            };
          })
          .filter(Boolean) as (RequisitionItem & { maxQty: number; available: number })[];
      },

      getCartSubtotal: () => {
        const items = get().getCartItemsWithDetails();
        return items.reduce((s, it) => s + it.qty * it.unitCost, 0);
      },

      getCartCount: () => get().cart.reduce((s, c) => s + c.qty, 0),

      submitRequisition: form => {
        const { getCartItemsWithDetails, clearCart, recordEmail, currentUser, activeShift } = get();
        const items = getCartItemsWithDetails();
        if (items.length === 0) return null;
        const req: Requisition = {
          id: `req-${Date.now()}`,
          requestorName: form.requestorName,
          requestorEmail: form.requestorEmail,
          purpose: form.purpose,
          deptCode: form.deptCode,
          requiredDate: form.requiredDate,
          notes: form.notes,
          items,
          status: 'Pending',
          submittedAt: Date.now(),
          submittedBy: currentUser?.id,
          shiftId: activeShift,
        };
        set(s => ({ requisitions: [req, ...s.requisitions] }));
        clearCart();
        recordEmail({
          from: form.requestorName,
          fromRole: currentUser?.role,
          to: 'Warehouse Team',
          toRole: 'warehouse',
          subject: `New Requisition #${req.id.slice(-4)} - Pending Review`,
          body: `Requestor ${form.requestorName} submitted requisition for ${items.length} items, purpose: ${form.purpose}.`,
          eventType: 'RequisitionSubmitted',
          requisitionId: req.id,
        });
        SupabaseService.upsertRequisition(req);
        return req;
      },

      approveRequisition: id => {
        set(s => ({
          requisitions: s.requisitions.map(r =>
            r.id === id
              ? {
                  ...r,
                  status: 'Approved',
                  processedAt: Date.now(),
                  processedBy: s.currentUser?.name || r.processedBy,
                }
              : r,
          ),
        }));
        const req = get().requisitions.find(r => r.id === id);
        if (req) {
          SupabaseService.upsertRequisition(req);
          get().recordEmail({
            from: get().currentUser?.name || 'Warehouse Team',
            fromRole: get().currentUser?.role,
            to: req.requestorName,
            toRole: 'customer',
            subject: `Requisition #${req.id.slice(-4)} - Approved`,
            body: 'Your requisition has been approved. Awaiting fulfillment.',
            eventType: 'RequisitionApproved',
            requisitionId: req.id,
          });
        }
      },

      fulfillRequisition: id => {
        const req = get().requisitions.find(r => r.id === id);
        if (!req) return null;
        const { currentUser, activeShift, adjustStock, recordEmail } = get();
        const staff = currentUser?.name || 'Warehouse Staff';
        const logs: IssuanceLog[] = [];
        const inventory = get().inventory;
        req.items.forEach(ri => {
          const inv = inventory.find(i => i.id === ri.itemId);
          const issued = inv ? Math.min(ri.qty, inv.quantity) : ri.qty;
          if (inv) {
            adjustStock(inv.id, -issued);
            const newLevel = inv.quantity - issued;
            const newLog: IssuanceLog = {
              id: `log-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
              timestamp: Date.now(),
              requisitionId: req.id,
              itemId: inv.id,
              itemName: inv.name,
              sku: inv.sku,
              qtyIssued: issued,
              unitCost: inv.unitCost,
              requestorName: req.requestorName,
              issuingStaff: staff,
              issuingStaffRole: currentUser?.role || 'warehouse',
              shiftId: activeShift,
              purpose: req.purpose,
              updatedStockLevel: Math.max(0, newLevel),
            };
            logs.push(newLog);
            SupabaseService.addIssuanceLog(newLog);
          }
        });
        set(s => ({
          requisitions: s.requisitions.map(r =>
            r.id === id
              ? {
                  ...r,
                  status: 'Fulfilled',
                  processedAt: Date.now(),
                  processedBy: staff,
                }
              : r,
          ),
          issuanceLogs: [...s.issuanceLogs, ...logs],
        }));
        const updatedReq = get().requisitions.find(r => r.id === id);
        if (updatedReq) SupabaseService.upsertRequisition(updatedReq);
        recordEmail({
          from: staff,
          fromRole: currentUser?.role,
          to: req.requestorName,
          toRole: 'customer',
          subject: `Requisition #${req.id.slice(-4)} - Fulfilled & Issued`,
          body: `Items (${req.items.length}) have been issued. Issuance reference: ${req.id}.`,
          eventType: 'RequisitionFulfilled',
          requisitionId: req.id,
        });
        return req;
      },

      rejectRequisition: (id, reason) => {
        set(s => ({
          requisitions: s.requisitions.map(r =>
            r.id === id
              ? {
                  ...r,
                  status: 'Rejected',
                  rejectionReason: reason,
                  processedAt: Date.now(),
                  processedBy: s.currentUser?.name || r.processedBy,
                }
              : r,
          ),
        }));
        const req = get().requisitions.find(r => r.id === id);
        if (req) {
          SupabaseService.upsertRequisition(req);
          get().recordEmail({
            from: get().currentUser?.name || 'Warehouse Team',
            fromRole: get().currentUser?.role,
            to: req.requestorName,
            toRole: 'customer',
            subject: `Requisition #${req.id.slice(-4)} - Rejected`,
            body: `Your requisition was rejected. Reason: ${reason}`,
            eventType: 'RequisitionRejected',
            requisitionId: req.id,
          });
        }
      },

      processQuickIssuance: ({ itemId, qty, requestorName, purpose }) => {
        const item = get().inventory.find(i => i.id === itemId);
        if (!item || qty <= 0) return;
        const issued = Math.min(item.quantity, qty);
        const { currentUser, activeShift, adjustStock, recordEmail } = get();
        const staff = currentUser?.name || 'Warehouse Staff';
        adjustStock(itemId, -issued);
        const newLevel = item.quantity - issued;
        const log: IssuanceLog = {
          id: `log-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          timestamp: Date.now(),
          itemId,
          itemName: item.name,
          sku: item.sku,
          qtyIssued: issued,
          unitCost: item.unitCost,
          requestorName,
          issuingStaff: staff,
          issuingStaffRole: currentUser?.role || 'warehouse',
          shiftId: activeShift,
          purpose,
          updatedStockLevel: Math.max(0, newLevel),
        };
        set(s => ({ issuanceLogs: [...s.issuanceLogs, log] }));
        SupabaseService.addIssuanceLog(log);
        recordEmail({
          from: staff,
          fromRole: currentUser?.role,
          to: requestorName,
          toRole: 'customer',
          subject: `Quick Issuance Processed - ${item.name}`,
          body: `Issued ${issued} ${item.unit} of ${item.name}. Updated stock: ${Math.max(0, newLevel)}.`,
          eventType: 'IssuanceProcessed',
        });
      },

      recordEmail: e => {
        const log: EmailLog = {
          ...e,
          id: `em-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
          timestamp: Date.now(),
          read: false,
        };
        set(s => ({ emailLogs: [log, ...s.emailLogs] }));
      },
      markEmailRead: id =>
        set(s => ({
          emailLogs: s.emailLogs.map(e => (e.id === id ? { ...e, read: true } : e)),
        })),
      getUnreadEmailCount: () => get().emailLogs.filter(e => !e.read).length,

      getCustomerMyRequisitions: customerName =>
        get().requisitions.filter(r => r.requestorName === customerName),

      addUser: input => {
        const id = `u-${Date.now()}`;
        const initials = input.name
          .split(' ')
          .map(x => x[0])
          .join('')
          .toUpperCase()
          .slice(0, 2);
        const user: User = {
          id,
          name: input.name,
          email: input.email,
          role: input.role,
          department: input.dept,
          dept: input.dept,
          active: true,
          password: input.password,
          avatarInitials: initials || 'NU',
        };
        set(s => ({ users: [...s.users, user] }));
        SupabaseService.upsertUser(user);
        get().recordEmail({
          from: get().currentUser?.name || 'System',
          fromRole: get().currentUser?.role,
          to: input.name,
          toRole: input.role,
          subject: `Welcome to MPW Inventory - ${input.name}`,
          body: `Your account (${input.role}) has been created. Department: ${input.dept || 'General'}.`,
          eventType: 'UserCreated',
        });
        return user;
      },

      updateUser: (id, patch) =>
        set(s => ({
          users: s.users.map(u => {
            if (u.id !== id) return u;
            const merged: User = { ...u, ...patch };
            if (patch.department !== undefined && patch.dept === undefined) merged.dept = patch.department;
            if (patch.dept !== undefined && patch.department === undefined) merged.department = patch.dept;
            return merged;
          }),
        })),

      deleteUser: id => {
        const target = get().users.find(u => u.id === id);
        set(s => ({ users: s.users.filter(u => u.id !== id) }));
        if (target) {
          get().recordEmail({
            from: get().currentUser?.name || 'System',
            fromRole: get().currentUser?.role,
            to: target.name,
            toRole: target.role,
            subject: 'Account Removed from MPW Inventory',
            body: `Your account (${target.email}) has been deactivated and removed.`,
            eventType: 'System',
          });
        }
      },

      resetToSeed: () => {
        set({
          inventory: seedInventory,
          users: seedUsers,
          requisitions: seedRequisitions,
          issuanceLogs: seedIssuanceLogs,
          emailLogs: seedEmailLogs,
          cart: [],
          lastHighlightedItemId: null,
          searchTerm: '',
        });
      },
    }),
    {
      name: 'mpw-inventory-store-v2',
      partialize: s => ({
        theme: s.theme,
        isAuthenticated: s.isAuthenticated,
        currentUser: s.currentUser,
        activeShift: s.activeShift,
        inventory: s.inventory,
        requisitions: s.requisitions,
        issuanceLogs: s.issuanceLogs,
        emailLogs: s.emailLogs,
        users: s.users,
        cart: s.cart,
      }),
    },
  ),
);

export function useHasRole(roles: UserRole[]) {
  const role = useAppStore(s => s.currentUser?.role);
  return !!role && roles.includes(role);
}
