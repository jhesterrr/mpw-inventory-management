import React, { useState } from 'react';
import {
  LayoutDashboard,
  Package,
  ScanLine,
  FileBadge,
  ShoppingCart,
  MoreHorizontal,
  X,
  ClipboardList,
  BarChart3,
  Headphones,
  Settings,
  History,
  LogOut,
  Sun,
  Moon,
  ChevronRight,
  ShieldCheck,
  UserCircle2,
  Clock,
} from 'lucide-react';
import { useAppStore } from '@/store';
import type { ActivePage, UserRole } from '@/types';
import { cn } from '@/utils';
import { motion, AnimatePresence } from 'motion/react';

interface NavItemDef {
  id: ActivePage;
  label: string;
  category: string;
  Icon: typeof LayoutDashboard;
  roles: UserRole[];
  badgeCount?: (state: ReturnType<typeof useAppStore.getState>) => number;
}

const ALL_ITEMS: NavItemDef[] = [
  // Core Operations
  { id: 'dashboard', label: 'Dashboard', category: 'Core Operations', Icon: LayoutDashboard, roles: ['editor', 'warehouse', 'customer'] },
  { id: 'inventory', label: 'Inventory Catalog', category: 'Core Operations', Icon: Package, roles: ['editor', 'warehouse', 'customer'] },
  { id: 'scanner', label: 'Barcode Scanner', category: 'Core Operations', Icon: ScanLine, roles: ['editor', 'warehouse'] },

  // Logistics & Stock
  {
    id: 'requisitions',
    label: 'Requisitions',
    category: 'Logistics & Stock',
    Icon: FileBadge,
    roles: ['editor', 'warehouse'],
    badgeCount: s => s.requisitions.filter(r => r.status === 'Pending').length,
  },
  {
    id: 'my-requisitions',
    label: 'My Requisitions',
    category: 'Logistics & Stock',
    Icon: FileBadge,
    roles: ['customer'],
    badgeCount: s =>
      s.requisitions.filter(
        r =>
          (r.submittedBy === s.currentUser?.name || r.requestorEmail === s.currentUser?.email) &&
          r.status === 'Pending',
      ).length,
  },
  {
    id: 'cart',
    label: 'Requisition Cart',
    category: 'Logistics & Stock',
    Icon: ShoppingCart,
    roles: ['customer'],
    badgeCount: s => s.getCartCount(),
  },
  { id: 'orders', label: 'Order Processing', category: 'Logistics & Stock', Icon: ClipboardList, roles: ['editor', 'warehouse'] },
  { id: 'purchase', label: 'Stock Reorder', category: 'Logistics & Stock', Icon: ShoppingCart, roles: ['editor', 'warehouse'] },
  { id: 'issuance-history', label: 'Issuance Audit', category: 'Logistics & Stock', Icon: History, roles: ['editor', 'warehouse'] },

  // Insights & System
  { id: 'reporting', label: 'Analytics & Reports', category: 'Insights & System', Icon: BarChart3, roles: ['editor', 'warehouse'] },
  {
    id: 'support',
    label: 'Support & Alerts',
    category: 'Insights & System',
    Icon: Headphones,
    roles: ['editor', 'warehouse', 'customer'],
    badgeCount: s => s.getUnreadEmailCount(),
  },
  { id: 'settings', label: 'System Settings', category: 'Insights & System', Icon: Settings, roles: ['editor', 'warehouse', 'customer'] },
];

export default function BottomMobileNav() {
  const store = useAppStore();
  const {
    activePage,
    setActivePage,
    currentUser,
    logout,
    theme,
    toggleTheme,
    activeShift,
  } = store;

  const [menuOpen, setMenuOpen] = useState(false);

  const userRole = currentUser?.role;
  const userItems = ALL_ITEMS.filter(i => userRole && i.roles.includes(userRole));

  // Determine top 4 primary bar items depending on role
  const primaryKeys: ActivePage[] =
    userRole === 'customer'
      ? ['dashboard', 'inventory', 'cart', 'my-requisitions']
      : ['dashboard', 'inventory', 'scanner', 'requisitions'];

  const primaryItems = primaryKeys
    .map(key => userItems.find(i => i.id === key))
    .filter((i): i is NavItemDef => Boolean(i));

  // Check if active page is not in primary items (e.g. settings, orders, reports, etc.)
  const isSecondaryActive = !primaryItems.some(i => i.id === activePage);

  // Group all user items for the full drawer sheet
  const categories = Array.from(new Set(userItems.map(i => i.category)));

  const handleSelectPage = (id: ActivePage) => {
    setActivePage(id);
    setMenuOpen(false);
  };

  return (
    <>
      {/* Bottom Floating/Docked Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 surface border-t surface-border backdrop-blur-xl bg-white/95 dark:bg-[#141519]/95 shadow-[0_-4px_25px_rgba(0,0,0,0.08)] dark:shadow-[0_-4px_25px_rgba(0,0,0,0.45)]">
        <ul className="grid grid-cols-5 h-[64px] items-center">
          {primaryItems.map(item => {
            const active = activePage === item.id;
            const badge = item.badgeCount ? item.badgeCount(store) : 0;

            return (
              <li key={item.id} className="h-full">
                <button
                  type="button"
                  onClick={() => setActivePage(item.id)}
                  className={cn(
                    'relative w-full h-full flex flex-col items-center justify-center gap-1 transition-all duration-200 outline-none',
                    active ? 'text-primary font-bold' : 'text-muted hover:text-[var(--text)]',
                  )}
                >
                  <div className="relative">
                    <item.Icon className={cn('w-5 h-5 transition-transform', active && 'scale-110')} />
                    {badge > 0 && (
                      <span className="absolute -top-1.5 -right-2.5 min-w-[17px] h-[17px] rounded-full bg-[#D4AF37] text-black text-[9px] font-extrabold px-1 flex items-center justify-center ring-2 ring-white dark:ring-[#141519]">
                        {badge > 99 ? '99+' : badge}
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] tracking-tight truncate max-w-[56px]">
                    {item.label.split(' ')[0]}
                  </span>
                  {active && (
                    <span className="absolute top-0 w-8 h-1 rounded-b-full bg-primary" />
                  )}
                </button>
              </li>
            );
          })}

          {/* 5th Button: More / Menu to open drawer with ALL pages */}
          <li className="h-full">
            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              className={cn(
                'relative w-full h-full flex flex-col items-center justify-center gap-1 transition-all duration-200 outline-none',
                menuOpen || isSecondaryActive ? 'text-primary font-bold' : 'text-muted hover:text-[var(--text)]',
              )}
            >
              <div className="relative">
                <MoreHorizontal className={cn('w-5 h-5 transition-transform', (menuOpen || isSecondaryActive) && 'scale-110')} />
                {/* Show indicator dot if current active page is inside the More menu */}
                {isSecondaryActive && (
                  <span className="absolute -top-0.5 -right-1 w-2 h-2 rounded-full bg-primary ring-2 ring-white dark:ring-[#141519]" />
                )}
              </div>
              <span className="text-[10px] tracking-tight truncate max-w-[56px]">
                {isSecondaryActive ? 'More *' : 'More'}
              </span>
              {isSecondaryActive && (
                <span className="absolute top-0 w-8 h-1 rounded-b-full bg-primary" />
              )}
            </button>
          </li>
        </ul>
        <div className="h-[env(safe-area-inset-bottom)]" />
      </nav>

      {/* Full-Feature Mobile Navigation Drawer (Modal Sheet) */}
      <AnimatePresence>
        {menuOpen && (
          <div className="fixed inset-0 z-50 md:hidden flex flex-col justify-end">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMenuOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />

            {/* Bottom Sheet Modal */}
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 280 }}
              className="relative z-10 w-full max-h-[85vh] flex flex-col rounded-t-3xl surface shadow-2xl border-t surface-border overflow-hidden bg-white dark:bg-[#16181D]"
            >
              {/* Sheet Drag Pill & Header */}
              <div className="p-4 pb-3 border-b surface-border flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-royal-primary/10 dark:bg-white/10 flex items-center justify-center text-primary">
                    <LayoutDashboard className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm tracking-tight">Navigation & Functions</h3>
                    <p className="text-[11px] text-muted">All system modules for {currentUser?.role} role</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setMenuOpen(false)}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-muted hover:text-[var(--text)] hover:bg-black/5 dark:hover:bg-white/10"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Scrollable list of modules grouped by category */}
              <div className="flex-1 overflow-y-auto p-4 space-y-5 custom-scrollbar">
                {categories.map(cat => {
                  const itemsInCat = userItems.filter(i => i.category === cat);
                  if (!itemsInCat.length) return null;

                  return (
                    <div key={cat} className="space-y-1.5">
                      <p className="px-2 text-[10px] font-bold uppercase tracking-wider text-muted select-none">
                        {cat}
                      </p>
                      <div className="grid grid-cols-1 gap-1">
                        {itemsInCat.map(item => {
                          const active = activePage === item.id;
                          const badge = item.badgeCount ? item.badgeCount(store) : 0;

                          return (
                            <button
                              key={item.id}
                              type="button"
                              onClick={() => handleSelectPage(item.id)}
                              className={cn(
                                'w-full flex items-center justify-between p-3 rounded-2xl transition-all duration-150 text-left outline-none',
                                active
                                  ? 'bg-royal-primary/10 dark:bg-royal-primary/20 text-primary font-bold ring-1 ring-royal-primary/30'
                                  : 'hover:bg-black/[0.04] dark:hover:bg-white/[0.05] text-[var(--text)]',
                              )}
                            >
                              <div className="flex items-center gap-3 min-w-0">
                                <div
                                  className={cn(
                                    'w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-colors',
                                    active
                                      ? 'bg-primary text-white shadow-md'
                                      : 'bg-black/5 dark:bg-white/5 text-muted',
                                  )}
                                >
                                  <item.Icon className="w-4 h-4" />
                                </div>
                                <div className="truncate">
                                  <p className="text-xs font-semibold truncate leading-tight">{item.label}</p>
                                </div>
                              </div>

                              <div className="flex items-center gap-2 shrink-0">
                                {badge > 0 && (
                                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#D4AF37] text-black">
                                    {badge}
                                  </span>
                                )}
                                <ChevronRight className="w-4 h-4 text-muted/60" />
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Drawer Footer: User Profile, Shift, Theme & Logout */}
              <div className="p-4 border-t surface-border bg-black/[0.02] dark:bg-white/[0.02] space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#D4AF37] to-[#800020] text-white flex items-center justify-center font-bold text-xs shrink-0">
                      {currentUser?.avatarInitials || 'U'}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold truncate leading-tight">{currentUser?.name}</p>
                      <p className="text-[10px] text-muted truncate">{currentUser?.email}</p>
                    </div>
                  </div>

                  {currentUser?.role !== 'customer' && (
                    <div className="flex items-center gap-1 text-[10px] font-mono text-muted bg-black/5 dark:bg-white/5 px-2 py-1 rounded-lg">
                      <Clock className="w-3 h-3 text-[#D4AF37]" />
                      <span>{activeShift}</span>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    type="button"
                    onClick={toggleTheme}
                    className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border surface-border text-xs font-medium hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                  >
                    {theme === 'dark' ? (
                      <>
                        <Sun className="w-3.5 h-3.5 text-amber-400" />
                        <span>Light Mode</span>
                      </>
                    ) : (
                      <>
                        <Moon className="w-3.5 h-3.5 text-sky-400" />
                        <span>Dark Mode</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setMenuOpen(false);
                      logout();
                    }}
                    className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border border-rose-500/20 text-rose-500 hover:bg-rose-500/10 text-xs font-semibold transition-colors"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
