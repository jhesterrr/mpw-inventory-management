import { useEffect } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/utils';

interface Props {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  widthClass?: string;
  footer?: React.ReactNode;
}

export default function Drawer({ open, onClose, title, children, widthClass = 'w-full max-w-md', footer }: Props) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[90] animate-fade-in">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px]" onClick={onClose} />
      <aside
        className={cn(
          'absolute top-0 right-0 h-full surface shadow-card-lg flex flex-col animate-slide-in-right',
          widthClass,
        )}
      >
        <div className="flex items-center justify-between p-5 border-b surface-border">
          <h3 className="font-semibold text-lg">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            className="w-11 h-11 rounded-xl flex items-center justify-center hover:bg-black/5 dark:hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-5">{children}</div>
        {footer && <div className="p-5 border-t surface-border flex justify-end gap-3">{footer}</div>}
      </aside>
    </div>
  );
}
