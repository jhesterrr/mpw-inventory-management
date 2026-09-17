import { LayoutDashboard, Package, ScanLine, FileBadge, Settings, ShoppingCart } from 'lucide-react';
import { useAppStore, useHasRole } from '@/store';
import type { ActivePage, UserRole } from '@/types';
import { cn } from '@/utils';

interface BtmItem {
  id: ActivePage;
  label: string;
  Icon: typeof LayoutDashboard;
  roles: UserRole[];
}

const items: BtmItem[] = [
  { id: 'dashboard', label: 'Home', Icon: LayoutDashboard, roles: ['editor', 'warehouse', 'customer'] },
  { id: 'inventory', label: 'Stock', Icon: Package, roles: ['editor', 'warehouse', 'customer'] },
  { id: 'scanner', label: 'Scan', Icon: ScanLine, roles: ['editor', 'warehouse'] },
  { id: 'cart', label: 'Cart', Icon: ShoppingCart, roles: ['customer'] },
  { id: 'requisitions', label: 'Reqs', Icon: FileBadge, roles: ['editor', 'warehouse'] },
  { id: 'my-requisitions', label: 'Orders', Icon: FileBadge, roles: ['customer'] },
  { id: 'settings', label: 'Settings', Icon: Settings, roles: ['editor', 'warehouse', 'customer'] },
];

export default function BottomMobileNav() {
  const activePage = useAppStore(s => s.activePage);
  const setActivePage = useAppStore(s => s.setActivePage);
  const cartCount = useAppStore(s => s.getCartCount());
  const currentRole = useAppStore(s => s.currentUser?.role);

  const visible = items.filter(i => currentRole && i.roles.includes(currentRole));
  // Cap at 5 for bottom nav ergonomics
  const trimmed = visible.slice(0, 5);

  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 surface border-t surface-border">
      <ul
        className="grid"
        style={{ gridTemplateColumns: `repeat(${Math.max(1, trimmed.length)}, minmax(0, 1fr))` }}
      >
        {trimmed.map(i => {
          const active = activePage === i.id || (i.id === 'my-requisitions' && activePage === 'requisitions');
          return (
            <li key={i.id}>
              <button
                type="button"
                onClick={() => setActivePage(i.id)}
                className={cn(
                  'relative w-full flex flex-col items-center justify-center gap-1 py-2 min-h-[60px] transition-colors',
                  active ? 'text-primary' : 'text-muted',
                )}
              >
                <div className="relative">
                  <i.Icon className="w-6 h-6" />
                  {i.id === 'cart' && cartCount > 0 && (
                    <span className="absolute -top-2 -right-3 min-w-[18px] h-[18px] rounded-full bg-highlight text-white text-[10px] font-bold px-1 flex items-center justify-center">
                      {cartCount > 99 ? '99+' : cartCount}
                    </span>
                  )}
                </div>
                <span className="text-[11px] font-medium truncate max-w-[60px]">{i.label}</span>
                {active && <span className="absolute top-0 w-10 h-1 rounded-b-full bg-primary" />}
              </button>
            </li>
          );
        })}
      </ul>
      <div className="h-[env(safe-area-inset-bottom)]" />
    </nav>
  );
}
