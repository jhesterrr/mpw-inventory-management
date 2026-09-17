import React, { useState } from 'react';
import {
  LayoutDashboard,
  Package,
  ClipboardList,
  ShoppingCart,
  BarChart3,
  Headphones,
  Settings,
  LogOut,
  ScanLine,
  FileBadge,
  History,
  ChevronLeft,
  ChevronRight,
  Layers,
  ArrowUpRight,
  Sun,
  Moon,
  Clock,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAppStore } from '@/store';
import type { ActivePage, UserRole } from '@/types';
import { cn } from '@/utils';

interface NavGroup {
  groupTitle: string;
  items: {
    id: ActivePage;
    label: string;
    Icon: typeof LayoutDashboard;
    roles: UserRole[];
    badgeCount?: (state: ReturnType<typeof useAppStore.getState>) => number;
  }[];
}

const NAV_GROUPS: NavGroup[] = [
  {
    groupTitle: 'Core Operations',
    items: [
      { id: 'dashboard', label: 'Dashboard', Icon: LayoutDashboard, roles: ['editor', 'warehouse', 'customer'] },
      { id: 'inventory', label: 'Inventory Catalog', Icon: Package, roles: ['editor', 'warehouse', 'customer'] },
      { id: 'scanner', label: 'Barcode Scanner', Icon: ScanLine, roles: ['editor', 'warehouse'] },
    ],
  },
  {
    groupTitle: 'Logistics & Stock',
    items: [
      {
        id: 'requisitions',
        label: 'Requisitions',
        Icon: FileBadge,
        roles: ['editor', 'warehouse'],
        badgeCount: s => s.requisitions.filter(r => r.status === 'Pending').length,
      },
      {
        id: 'my-requisitions',
        label: 'My Requisitions',
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
        Icon: ShoppingCart,
        roles: ['customer'],
        badgeCount: s => s.getCartCount(),
      },
      { id: 'orders', label: 'Order Processing', Icon: ClipboardList, roles: ['editor', 'warehouse'] },
      { id: 'purchase', label: 'Stock Reorder', Icon: ShoppingCart, roles: ['editor', 'warehouse'] },
      { id: 'issuance-history', label: 'Issuance Audit', Icon: History, roles: ['editor', 'warehouse'] },
    ],
  },
  {
    groupTitle: 'Insights & System',
    items: [
      { id: 'reporting', label: 'Analytics & Reports', Icon: BarChart3, roles: ['editor', 'warehouse'] },
      {
        id: 'support',
        label: 'Support & Alerts',
        Icon: Headphones,
        roles: ['editor', 'warehouse', 'customer'],
        badgeCount: s => s.getUnreadEmailCount(),
      },
      { id: 'settings', label: 'System Settings', Icon: Settings, roles: ['editor', 'warehouse', 'customer'] },
    ],
  },
];

const ROLE_BADGE: Record<UserRole, { label: string; chipClass: string }> = {
  editor: {
    label: 'Admin / Editor',
    chipClass: 'bg-gradient-to-r from-[#D4AF37]/25 to-[#D4AF37]/10 text-[#F5DEB3] border border-[#D4AF37]/40',
  },
  warehouse: {
    label: 'Warehouse Staff',
    chipClass: 'bg-gradient-to-r from-sky-500/20 to-sky-600/10 text-sky-200 border border-sky-400/30',
  },
  customer: {
    label: 'Customer Account',
    chipClass: 'bg-gradient-to-r from-emerald-500/20 to-teal-500/10 text-emerald-200 border border-emerald-400/30',
  },
};

export default function SidebarNav() {
  const store = useAppStore();
  const {
    currentUser,
    activePage,
    setActivePage,
    logout,
    activeShift,
    theme,
    toggleTheme,
  } = store;

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [hoveredNavId, setHoveredNavId] = useState<string | null>(null);

  const roleInfo = currentUser ? ROLE_BADGE[currentUser.role] : ROLE_BADGE.editor;
  const initials = currentUser?.avatarInitials || 'U';

  return (
    <motion.aside
      animate={{ width: isCollapsed ? 80 : 270 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className={cn(
        'hidden md:flex md:flex-col shrink-0 h-screen sticky top-0 z-30 select-none overflow-hidden',
        'border-r border-white/10 dark:border-white/5',
        'bg-gradient-to-b from-[#3D0812] via-[#520C19] to-[#24040A]',
        'dark:from-[#141519] dark:via-[#1A1C22] dark:to-[#0F1013]',
        'text-white transition-colors duration-500',
        'shadow-[4px_0_24px_rgba(0,0,0,0.35)]',
      )}
    >
      {/* Subtle background glow orbs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-30">
        <div className="absolute -top-16 -left-16 w-52 h-52 rounded-full bg-[#D4AF37] blur-[70px] opacity-25" />
        <div className="absolute bottom-20 -right-16 w-60 h-60 rounded-full bg-[#800020] blur-[80px] opacity-40" />
      </div>

      {/* Header section: Brand emblem & collapse button */}
      <div className="relative z-10 p-4 border-b border-white/10 dark:border-white/5 flex items-center justify-between min-h-[72px]">
        <div
          onClick={() => setActivePage('dashboard')}
          className="flex items-center gap-3 cursor-pointer group min-w-0"
        >
          <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-[#D4AF37] via-[#B89025] to-[#8C6D1B] flex items-center justify-center shadow-lg shadow-black/30 border border-white/20 shrink-0 group-hover:scale-105 transition-transform duration-300">
            <Layers className="w-5 h-5 text-white drop-shadow" />
            <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 ring-2 ring-[#3D0812] dark:ring-[#141519]" />
          </div>

          <AnimatePresence>
            {!isCollapsed && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
                className="min-w-0"
              >
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-sm tracking-wider uppercase text-white font-sans truncate">
                    MPW System
                  </span>
                </div>
                <p className="text-[10px] text-white/60 truncate font-medium">Enterprise Inventory</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Floating collapse toggle */}
        <button
          type="button"
          onClick={() => setIsCollapsed(v => !v)}
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className={cn(
            'w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 border border-white/15 flex items-center justify-center text-white/80 hover:text-white transition-all shadow-sm shrink-0',
            isCollapsed ? 'mx-auto' : '',
          )}
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* User profile card */}
      <div className="relative z-10 px-3 py-3 border-b border-white/10 dark:border-white/5">
        <motion.div
          className={cn(
            'rounded-2xl p-2.5 border transition-all relative overflow-hidden',
            'bg-white/[0.07] hover:bg-white/[0.1] border-white/10 shadow-inner backdrop-blur-md',
          )}
        >
          <div className="flex items-center gap-3">
            <div className="relative w-10 h-10 rounded-full bg-gradient-to-tr from-[#D4AF37] via-[#800020] to-[#500B18] text-white flex items-center justify-center font-bold text-sm shadow-md shrink-0 ring-2 ring-white/20">
              {initials}
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-400 ring-2 ring-[#500B18]" />
            </div>

            <AnimatePresence>
              {!isCollapsed && (
                <motion.div
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: 'auto' }}
                  exit={{ opacity: 0, width: 0 }}
                  transition={{ duration: 0.2 }}
                  className="min-w-0 flex-1"
                >
                  <p className="font-bold text-xs text-white truncate leading-tight">
                    {currentUser?.name ?? 'Authorized User'}
                  </p>
                  <p className="text-[10px] text-white/50 truncate font-mono mt-0.5">
                    {currentUser?.email ?? 'user@mpw.com'}
                  </p>
                  <div className="mt-1 flex items-center gap-1.5">
                    <span className={cn('px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider', roleInfo.chipClass)}>
                      {roleInfo.label}
                    </span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Shift badge bar for warehouse and admin */}
          {!isCollapsed && currentUser?.role !== 'customer' && (
            <div className="mt-2.5 pt-2 border-t border-white/10 flex items-center gap-1.5 text-[10px] text-white/70">
              <Clock className="w-3 h-3 text-[#D4AF37]" />
              <span className="font-mono text-white/90 font-medium">{activeShift}</span>
            </div>
          )}
        </motion.div>
      </div>

      {/* Navigation items categorized with animated sliding indicator */}
      <nav className="flex-1 overflow-y-auto px-2 py-3 space-y-4 relative z-10 custom-scrollbar">
        {NAV_GROUPS.map(group => {
          const groupItems = group.items.filter(
            item => currentUser && item.roles.includes(currentUser.role),
          );
          if (!groupItems.length) return null;

          return (
            <div key={group.groupTitle} className="space-y-1">
              {!isCollapsed && (
                <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-white/40 mb-1.5 select-none">
                  {group.groupTitle}
                </p>
              )}

              {groupItems.map(item => {
                const active = activePage === item.id;
                const badge = item.badgeCount ? item.badgeCount(store) : 0;

                return (
                  <div
                    key={item.id}
                    className="relative"
                    onMouseEnter={() => setHoveredNavId(item.id)}
                    onMouseLeave={() => setHoveredNavId(null)}
                  >
                    <button
                      type="button"
                      onClick={() => setActivePage(item.id)}
                      className={cn(
                        'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 relative group text-left outline-none',
                        active
                          ? 'text-white font-semibold'
                          : 'text-white/75 hover:text-white',
                        isCollapsed ? 'justify-center px-0' : '',
                      )}
                    >
                      {/* Active indicator bar / pill with layoutId for fluid morphing transition */}
                      {active && (
                        <motion.div
                          layoutId="active-sidebar-pill"
                          className={cn(
                            'absolute inset-0 rounded-xl shadow-lg',
                            'bg-gradient-to-r from-white/20 via-white/15 to-white/10',
                            'border border-white/20 backdrop-blur-md',
                          )}
                          transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                        />
                      )}

                      {/* Golden active left border accent */}
                      {active && (
                        <motion.div
                          layoutId="active-gold-accent"
                          className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 rounded-r-full bg-[#D4AF37] shadow-[0_0_8px_#D4AF37]"
                          transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                        />
                      )}

                      {/* Hover subtle glow if not active */}
                      {!active && hoveredNavId === item.id && (
                        <motion.div
                          layoutId="hover-sidebar-pill"
                          className="absolute inset-0 rounded-xl bg-white/[0.06] border border-white/5"
                          transition={{ duration: 0.15 }}
                        />
                      )}

                      {/* Icon */}
                      <span className="relative z-10 shrink-0">
                        <item.Icon
                          className={cn(
                            'w-5 h-5 transition-transform duration-300 group-hover:scale-110',
                            active ? 'text-[#E8D499]' : 'text-white/75 group-hover:text-white',
                          )}
                        />
                      </span>

                      {/* Label */}
                      {!isCollapsed && (
                        <span className="relative z-10 text-xs tracking-wide truncate flex-1 font-medium">
                          {item.label}
                        </span>
                      )}

                      {/* Notification / Count Badge */}
                      {badge > 0 && (
                        <span
                          className={cn(
                            'relative z-10 font-mono font-bold rounded-full flex items-center justify-center transition-all',
                            isCollapsed
                              ? 'absolute top-1 right-1 w-4 h-4 text-[9px] bg-[#D4AF37] text-black ring-2 ring-[#3D0812]'
                              : 'px-1.5 py-0.5 text-[10px] min-w-[20px] h-5 bg-[#D4AF37] text-black font-extrabold shadow-sm',
                          )}
                        >
                          {badge > 99 ? '99+' : badge}
                        </span>
                      )}
                    </button>

                    {/* Floating Tooltip when collapsed */}
                    {isCollapsed && hoveredNavId === item.id && (
                      <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 z-50 px-3 py-1.5 rounded-xl bg-[#1D1F24] border border-white/15 text-white text-xs font-semibold whitespace-nowrap shadow-2xl pointer-events-none flex items-center gap-1.5 animate-fadeIn">
                        <span>{item.label}</span>
                        {badge > 0 && (
                          <span className="px-1.5 py-0.2 bg-[#D4AF37] text-black text-[10px] rounded-full font-bold">
                            {badge}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          );
        })}
      </nav>

      {/* Footer controls: Theme toggle, quick logout, and version tag */}
      <div className="relative z-10 p-3 border-t border-white/10 dark:border-white/5 space-y-2 bg-black/15">
        {/* Theme switcher button */}
        <button
          type="button"
          onClick={toggleTheme}
          className={cn(
            'w-full flex items-center gap-3 px-3 py-2 rounded-xl text-white/70 hover:text-white hover:bg-white/10 transition-all text-left text-xs font-medium',
            isCollapsed ? 'justify-center px-0' : '',
          )}
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
        >
          {theme === 'dark' ? (
            <Sun className="w-4 h-4 text-amber-400 shrink-0" />
          ) : (
            <Moon className="w-4 h-4 text-sky-300 shrink-0" />
          )}
          {!isCollapsed && <span>{theme === 'dark' ? 'Light Theme' : 'Dark Theme'}</span>}
        </button>

        {/* Logout button */}
        <button
          type="button"
          onClick={logout}
          className={cn(
            'w-full flex items-center gap-3 px-3 py-2 rounded-xl text-rose-300 hover:text-rose-100 hover:bg-rose-500/20 border border-rose-500/20 transition-all text-left text-xs font-semibold',
            isCollapsed ? 'justify-center px-0' : '',
          )}
          title="Sign out of system"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          {!isCollapsed && <span>Sign Out</span>}
        </button>
      </div>
    </motion.aside>
  );
}
