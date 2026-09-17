import { useEffect, useRef, useState } from 'react';
import { ChevronDown, ShieldCheck, Warehouse, UserCircle2 } from 'lucide-react';
import { useAppStore } from '@/store';
import type { UserRole } from '@/types';
import { cn } from '@/utils';

const roles: { id: UserRole; label: string; desc: string; Icon: typeof ShieldCheck }[] = [
  { id: 'editor', label: 'Editor / Admin', desc: 'Full system access', Icon: ShieldCheck },
  { id: 'warehouse', label: 'Warehouse Staff', desc: 'Process issues & approvals', Icon: Warehouse },
  { id: 'customer', label: 'Customer', desc: 'Browse & submit requisitions', Icon: UserCircle2 },
];

export default function RoleSwitcher() {
  const { currentUser, switchRole } = useAppStore(s => ({
    currentUser: s.currentUser,
    switchRole: s.switchRole,
  }));
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    window.addEventListener('mousedown', handler);
    return () => window.removeEventListener('mousedown', handler);
  }, []);

  const current = roles.find(r => r.id === currentUser?.role) ?? roles[0];

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className={cn(
          'flex items-center gap-2 rounded-xl px-3 py-2 min-h-[44px] min-w-[120px] border transition-colors',
          'surface surface-border hover:border-royal-primary/40',
        )}
        title="Switch role"
      >
        <current.Icon className="w-4 h-4 text-primary" />
        <span className="hidden sm:block text-sm font-medium truncate max-w-[140px]">{current.label.split(' / ')[0]}</span>
        <ChevronDown className={cn('w-4 h-4 text-muted transition-transform', open && 'rotate-180')} />
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-72 rounded-2xl surface shadow-card-lg border surface-border z-40 animate-fade-in">
          <div className="p-2">
            <p className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-muted">Role Switcher (Testing)</p>
            {roles.map(r => {
              const active = currentUser?.role === r.id;
              return (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => {
                    switchRole(r.id);
                    setOpen(false);
                  }}
                  className={cn(
                    'w-full flex items-start gap-3 rounded-xl p-3 text-left transition-colors',
                    active ? 'bg-royal-primary/10 dark:bg-crimson-primary/20 ring-1 ring-inset ring-royal-primary/30' : 'hover:bg-black/5 dark:hover:bg-white/5',
                  )}
                >
                  <div
                    className={cn(
                      'w-10 h-10 rounded-xl flex items-center justify-center shrink-0',
                      active ? 'bg-royal-primary text-white' : 'surface-border bg-black/5 dark:bg-white/5',
                    )}
                  >
                    <r.Icon className="w-5 h-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className={cn('font-semibold text-sm', active && 'text-primary')}>{r.label}</p>
                    <p className="text-xs text-muted mt-0.5">{r.desc}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
