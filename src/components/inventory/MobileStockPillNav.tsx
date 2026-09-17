import React from 'react';
import { motion } from 'motion/react';
import { Boxes, CheckCircle2, AlertTriangle, XCircle, Sparkles } from 'lucide-react';

export type StockFilterType = 'all' | 'in-stock' | 'reorder' | 'out-of-stock';

export interface MobileStockFilterOption {
  id: StockFilterType;
  label: string;
  count: number;
  icon: React.ComponentType<{ className?: string }>;
  accentColor: string;
  badgeBg: string;
  badgeText: string;
}

interface MobileStockPillNavProps {
  currentFilter: StockFilterType;
  onFilterChange: (filter: StockFilterType) => void;
  counts: {
    all: number;
    inStock: number;
    reorder: number;
    outOfStock: number;
  };
}

export const MobileStockPillNav: React.FC<MobileStockPillNavProps> = ({
  currentFilter,
  onFilterChange,
  counts,
}) => {
  const options: MobileStockFilterOption[] = [
    {
      id: 'all',
      label: 'All Items',
      count: counts.all,
      icon: Boxes,
      accentColor: 'from-[#800020] via-[#A0153E] to-[#D4AF37]',
      badgeBg: 'bg-white/20 text-white',
      badgeText: 'text-white',
    },
    {
      id: 'in-stock',
      label: 'In Stock',
      count: counts.inStock,
      icon: CheckCircle2,
      accentColor: 'from-[#059669] via-[#10B981] to-[#34D399]',
      badgeBg: 'bg-white/20 text-white',
      badgeText: 'text-white',
    },
    {
      id: 'reorder',
      label: 'Reorder',
      count: counts.reorder,
      icon: AlertTriangle,
      accentColor: 'from-[#D97706] via-[#F59E0B] to-[#FBBF24]',
      badgeBg: 'bg-white/20 text-white',
      badgeText: 'text-white',
    },
    {
      id: 'out-of-stock',
      label: 'Out of Stock',
      count: counts.outOfStock,
      icon: XCircle,
      accentColor: 'from-[#E11D48] via-[#F43F5E] to-[#FB7185]',
      badgeBg: 'bg-white/20 text-white',
      badgeText: 'text-white',
    },
  ];

  const activeOption = options.find(o => o.id === currentFilter) || options[0];

  return (
    <div className="w-full flex flex-col gap-2.5">
      {/* Header bar with luxury brand indicator and current status */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-[#D4AF37] to-[#800020] flex items-center justify-center text-white shadow-md shadow-[#800020]/20">
            <Sparkles className="w-3.5 h-3.5 text-[#FFF9E6]" />
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-muted">Stock Status</span>
            <span className="text-[11px] text-muted mx-1.5">•</span>
            <span className="text-xs font-semibold text-[var(--text)]">{activeOption.label}</span>
          </div>
        </div>
        <div className="text-[11px] font-medium text-muted px-2.5 py-0.5 rounded-full bg-black/5 dark:bg-white/5 border border-white/10">
          <span className="font-bold text-[var(--text)]">{activeOption.count}</span> total
        </div>
      </div>

      {/* Horizontal pill navigation track */}
      <div className="relative w-full overflow-x-auto no-scrollbar py-1 px-0.5 -mx-0.5">
        <div className="flex items-center gap-2 min-w-max">
          {options.map(option => {
            const isActive = currentFilter === option.id;
            const Icon = option.icon;

            return (
              <button
                key={option.id}
                type="button"
                onClick={() => onFilterChange(option.id)}
                className={`relative px-3.5 py-2 rounded-full text-xs font-semibold transition-all duration-300 flex items-center gap-2 select-none shrink-0 ${
                  isActive
                    ? 'text-white shadow-lg shadow-[#800020]/15'
                    : 'text-muted hover:text-[var(--text)] bg-[var(--surface-color,rgba(255,255,255,0.06))] hover:bg-black/5 dark:hover:bg-white/10 border border-black/5 dark:border-white/10'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="mobilePillActiveGlaze"
                    className={`absolute inset-0 rounded-full bg-gradient-to-r ${option.accentColor} -z-10 shadow-md`}
                    transition={{
                      type: 'spring',
                      stiffness: 400,
                      damping: 32,
                    }}
                  >
                    {/* Subtle inner gloss highlight */}
                    <div className="absolute inset-0 rounded-full bg-gradient-to-b from-white/25 via-transparent to-black/10 pointer-events-none" />
                  </motion.div>
                )}

                <Icon
                  className={`w-3.5 h-3.5 transition-transform duration-200 ${
                    isActive ? 'text-white scale-110' : 'text-muted'
                  }`}
                />

                <span className="tracking-tight whitespace-nowrap">{option.label}</span>

                <span
                  className={`px-1.5 py-0.5 rounded-full text-[10px] font-extrabold min-w-[20px] text-center transition-all ${
                    isActive
                      ? 'bg-white/25 text-white backdrop-blur-sm'
                      : 'bg-black/10 dark:bg-white/15 text-[var(--text)]'
                  }`}
                >
                  {option.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default MobileStockPillNav;
