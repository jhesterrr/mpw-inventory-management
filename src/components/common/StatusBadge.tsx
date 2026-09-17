import type { StockStatus } from '@/types';
import { cn } from '@/utils';

interface Props {
  status: StockStatus;
  size?: 'sm' | 'md';
}

const styles: Record<StockStatus, { bg: string; text: string; dot: string; label: string }> = {
  green: {
    bg: 'bg-status-green/10 dark:bg-status-green/20',
    text: 'text-status-green',
    dot: 'bg-status-green',
    label: 'In Stock',
  },
  yellow: {
    bg: 'bg-status-yellow/10 dark:bg-status-yellow/20',
    text: 'text-status-yellow',
    dot: 'bg-status-yellow',
    label: 'Reorder Point',
  },
  red: {
    bg: 'bg-status-red/10 dark:bg-status-red/20',
    text: 'text-status-red',
    dot: 'bg-status-red',
    label: 'Out of Stock',
  },
};

export default function StatusBadge({ status, size = 'sm' }: Props) {
  const s = styles[status];
  return (
    <span
      className={cn(
        'badge-pill',
        s.bg,
        s.text,
        size === 'md' ? 'px-3 py-1.5 text-sm' : 'px-2.5 py-1 text-xs',
      )}
    >
      <span className={cn('w-2 h-2 rounded-full', s.dot)} />
      {s.label}
    </span>
  );
}
