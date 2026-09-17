import React from 'react';
import { motion } from 'motion/react';
import { Boxes, CheckCircle2, AlertTriangle, XCircle, Sparkles } from 'lucide-react';

export type StockFilterType = 'all' | 'in-stock' | 'reorder' | 'out-of-stock';

export interface MobileStockFilterOption {
  id: StockFilterType;
  label: string;
  count: number;
  icon: React.ComponentType<{ className?: string }>;
  activeBgLight: string;
  activeBgDark: string;
  activeText: string;
  borderLight: string;
  badgeBgActive: string;
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
      activeBgLight: 'bg-[#500B18]',
      activeBgDark: 'bg-[#801B2C]',
      activeText: 'text-[#FFFFFF]',
      borderLight: 'border-[#500B18]',
      badgeBgActive: 'bg-white/20 text-[#FFFFFF]',
    },
    {
      id: 'in-stock',
      label: 'In Stock',
      count: counts.inStock,
      icon: CheckCircle2,
      activeBgLight: 'bg-[#065F46]',
      activeBgDark: 'bg-[#047857]',
      activeText: 'text-[#FFFFFF]',
      borderLight: 'border-[#065F46]',
      badgeBgActive: 'bg-white/20 text-[#FFFFFF]',
    },
    {
      id: 'reorder',
      label: 'Reorder Point',
      count: counts.reorder,
      icon: AlertTriangle,
      activeBgLight: 'bg-[#B45309]',
      activeBgDark: 'bg-[#D97706]',
      activeText: 'text-[#FFFFFF]',
      borderLight: 'border-[#B45309]',
      badgeBgActive: 'bg-white/20 text-[#FFFFFF]',
    },
    {
      id: 'out-of-stock',
      label: 'Out of Stock',
      count: counts.outOfStock,
      icon: XCircle,
      activeBgLight: 'bg-[#BE123C]',
      activeBgDark: 'bg-[#E11D48]',
      activeText: 'text-[#FFFFFF]',
      borderLight: 'border-[#BE123C]',
      badgeBgActive: 'bg-white/20 text-[#FFFFFF]',
    },
  ];

  const activeOption = options.find(o => o.id === currentFilter) || options[0];

  return (
    <div className="w-full flex flex-col gap-2">
      {/* Mini status indicator header */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-1.5 min-w-0">
          <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-[#D4AF37] to-[#800020] flex items-center justify-center text-white shrink-0 shadow-sm">
            <Sparkles className="w-3 h-3 text-[#FFF9E6]" />
          </div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-muted truncate">
            Category: <strong className="text-[var(--text)] normal-case font-semibold">{activeOption.label}</strong>
          </span>
        </div>
        <span className="text-[11px] font-medium text-muted shrink-0">
          Showing <span className="font-bold text-[var(--text)]">{activeOption.count}</span>
        </span>
      </div>

      {/* Horizontal pill navigation track */}
      <div className="relative w-full overflow-x-auto no-scrollbar py-1 px-0.5">
        <div className="flex items-center gap-2 min-w-max">
          {options.map(option => {
            const isActive = currentFilter === option.id;
            const Icon = option.icon;

            return (
              <button
                key={option.id}
                type="button"
                onClick={() => onFilterChange(option.id)}
                className={`relative px-3.5 py-2 rounded-full text-xs font-semibold flex items-center gap-2 select-none shrink-0 transition-colors duration-200 ${
                  isActive
                    ? 'text-white shadow-md shadow-black/10'
                    : 'text-[var(--text)] bg-[var(--card)] hover:bg-black/5 dark:hover:bg-white/5 border border-black/10 dark:border-white/10'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="mobileActiveStockPillIndicator"
                    className={`absolute inset-0 rounded-full ${option.activeBgLight} dark:${option.activeBgDark} shadow-sm z-0`}
                    transition={{
                      type: 'spring',
                      stiffness: 450,
                      damping: 35,
                    }}
                  />
                )}

                <div className="relative z-10 flex items-center gap-1.5">
                  <Icon
                    className={`w-3.5 h-3.5 shrink-0 ${
                      isActive ? 'text-white' : 'text-muted'
                    }`}
                  />
                  <span className={`whitespace-nowrap tracking-tight font-semibold ${isActive ? 'text-white' : 'text-[var(--text)]'}`}>
                    {option.label}
                  </span>
                  <span
                    className={`ml-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-extrabold min-w-[18px] text-center leading-none ${
                      isActive
                        ? 'bg-white/25 text-white'
                        : 'bg-black/10 dark:bg-white/15 text-[var(--text)]'
                    }`}
                  >
                    {option.count}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default MobileStockPillNav;
