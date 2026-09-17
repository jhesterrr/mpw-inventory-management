import { ShoppingCart } from 'lucide-react';
import { useAppStore, useHasRole } from '@/store';
import { cn } from '@/utils';

export default function CartBadge() {
  const isCustomer = useHasRole(['customer']);
  const count = useAppStore(s => s.getCartCount());
  const setActivePage = useAppStore(s => s.setActivePage);
  if (!isCustomer) return null;
  return (
    <button
      type="button"
      onClick={() => setActivePage('cart')}
      className="relative w-11 h-11 rounded-xl border surface surface-border flex items-center justify-center hover:border-royal-primary/40 transition-colors"
      aria-label="Cart"
    >
      <ShoppingCart className="w-5 h-5" />
      {count > 0 && (
        <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-highlight text-white text-[10px] font-bold flex items-center justify-center">
          {count > 99 ? '99+' : count}
        </span>
      )}
    </button>
  );
}
