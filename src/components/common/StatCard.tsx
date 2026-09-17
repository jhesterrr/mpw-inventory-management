import React from 'react';
import type { LucideIcon } from 'lucide-react';
import { motion } from 'motion/react';
import { cn, formatNumber } from '@/utils';

interface Props {
  label: string;
  value: number;
  icon: LucideIcon;
  tone?: 'default' | 'success' | 'alert' | 'warning' | 'info';
  subtitle?: string;
  formatter?: (n: number) => string;
  trend?: string;
  trendPositive?: boolean;
}

const tones: Record<
  NonNullable<Props['tone']>,
  { iconBg: string; gradient: string; glow: string; border: string }
> = {
  default: {
    iconBg: 'bg-royal-primary/10 text-royal-primary dark:bg-crimson-primary/25 dark:text-[#E8D499]',
    gradient: 'from-royal-primary/5 via-transparent to-transparent',
    glow: 'group-hover:border-royal-primary/30',
    border: 'border-[#EFECE6] dark:border-white/10',
  },
  success: {
    iconBg: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400',
    gradient: 'from-emerald-500/5 via-transparent to-transparent',
    glow: 'group-hover:border-emerald-500/40',
    border: 'border-[#EFECE6] dark:border-white/10',
  },
  info: {
    iconBg: 'bg-sky-500/15 text-sky-600 dark:text-sky-400',
    gradient: 'from-sky-500/5 via-transparent to-transparent',
    glow: 'group-hover:border-sky-500/40',
    border: 'border-[#EFECE6] dark:border-white/10',
  },
  warning: {
    iconBg: 'bg-amber-500/15 text-amber-600 dark:text-amber-400',
    gradient: 'from-amber-500/5 via-transparent to-transparent',
    glow: 'group-hover:border-amber-500/40 ring-1 ring-amber-500/25',
    border: 'border-amber-500/30',
  },
  alert: {
    iconBg: 'bg-rose-500/15 text-rose-600 dark:text-rose-400',
    gradient: 'from-rose-500/10 via-transparent to-transparent',
    glow: 'group-hover:border-rose-500/40 ring-1 ring-rose-500/30',
    border: 'border-rose-500/30',
  },
};

export default function StatCard({
  label,
  value,
  icon: Icon,
  tone = 'default',
  subtitle,
  formatter,
  trend,
  trendPositive = true,
}: Props) {
  const t = tones[tone];
  const formatted = formatter ? formatter(value) : formatNumber(value);

  return (
    <motion.div
      whileHover={{ y: -3, transition: { duration: 0.2 } }}
      className={cn(
        'group relative rounded-2xl p-5 border transition-all duration-300 overflow-hidden select-none',
        'bg-white dark:bg-[#18181A] shadow-sm hover:shadow-xl',
        t.border,
        t.glow,
      )}
    >
      {/* Background ambient radial gradient */}
      <div
        className={cn(
          'absolute -top-12 -right-12 w-28 h-28 rounded-full opacity-35 blur-2xl pointer-events-none transition-opacity group-hover:opacity-70',
          `bg-gradient-to-br ${t.gradient}`,
        )}
      />

      <div className="relative z-10 flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted truncate">
            {label}
          </p>
          <div className="flex items-baseline gap-2 mt-2">
            <p className="text-2xl sm:text-3xl font-extrabold tracking-tight font-sans">
              {formatted}
            </p>
            {trend && (
              <span
                className={cn(
                  'text-[11px] font-bold px-1.5 py-0.5 rounded-md font-mono inline-flex items-center',
                  trendPositive
                    ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10'
                    : 'text-rose-600 dark:text-rose-400 bg-rose-500/10',
                )}
              >
                {trend}
              </span>
            )}
          </div>
          {subtitle && (
            <p className="mt-1.5 text-xs text-muted truncate font-medium">
              {subtitle}
            </p>
          )}
        </div>

        <div
          className={cn(
            'shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110 shadow-sm',
            t.iconBg,
          )}
        >
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </motion.div>
  );
}
