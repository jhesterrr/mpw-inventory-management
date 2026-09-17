import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/utils';

interface AnimatedInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  id: string;
  isDark?: boolean;
  icon?: React.ReactNode;
  rightElement?: React.ReactNode;
  hint?: React.ReactNode;
}

export default function AnimatedInput({
  label,
  id,
  isDark = false,
  icon,
  rightElement,
  hint,
  value,
  onChange,
  className,
  placeholder,
  ...props
}: AnimatedInputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [isTypingRecently, setIsTypingRecently] = useState(false);
  const [typingTimer, setTypingTimer] = useState<ReturnType<typeof setTimeout> | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsTypingRecently(true);
    if (typingTimer) clearTimeout(typingTimer);
    const timer = setTimeout(() => {
      setIsTypingRecently(false);
    }, 450);
    setTypingTimer(timer);

    if (onChange) {
      onChange(e);
    }
  };

  const stringVal = String(value ?? '');
  const charCount = stringVal.length;

  return (
    <div className="group/field relative">
      <div className="flex items-center justify-between mb-1.5">
        <label
          htmlFor={id}
          className={cn(
            'block text-[11px] font-semibold uppercase tracking-wider transition-colors duration-200',
            isFocused
              ? isDark
                ? 'text-[#E8D499]'
                : 'text-[#500B18]'
              : 'text-gray-500 dark:text-gray-400'
          )}
        >
          {label}
        </label>
        {hint}
      </div>

      <div className="relative">
        {/* Active Typing Glow Ring animation */}
        <AnimatePresence>
          {isTypingRecently && (
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.01 }}
              transition={{ duration: 0.2 }}
              className={cn(
                'absolute -inset-0.5 rounded-xl pointer-events-none blur-[2px]',
                isDark
                  ? 'bg-gradient-to-r from-[#D4AF37]/30 via-[#E8D499]/20 to-[#800020]/40'
                  : 'bg-gradient-to-r from-[#500B18]/25 via-[#D4AF37]/20 to-[#800020]/20'
              )}
            />
          )}
        </AnimatePresence>

        <input
          id={id}
          value={value}
          onChange={handleChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          className={cn(
            'w-full h-11 px-4 rounded-xl text-sm transition-all outline-none border relative z-10',
            isDark
              ? 'bg-[#1D1F24] border-[#2E3138] text-white placeholder-gray-500 focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20'
              : 'bg-[#F7F9FC] border-[#E2E8F0] text-gray-900 placeholder-gray-400 focus:bg-white focus:border-[#500B18] focus:ring-2 focus:ring-[#500B18]/15',
            rightElement || icon ? 'pr-11' : '',
            isTypingRecently && (isDark ? 'border-[#D4AF37]/80' : 'border-[#500B18]/70'),
            className
          )}
          {...props}
        />

        {/* Right Icon or Element */}
        {rightElement ? (
          <div className="absolute right-3.5 top-1/2 -translate-y-1/2 z-20 flex items-center gap-1.5">
            {isTypingRecently && (
              <motion.span
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                className={cn(
                  'w-1.5 h-1.5 rounded-full animate-ping mr-1',
                  isDark ? 'bg-[#D4AF37]' : 'bg-[#500B18]'
                )}
              />
            )}
            {rightElement}
          </div>
        ) : icon ? (
          <div className="absolute right-4 top-1/2 -translate-y-1/2 z-20 text-gray-400 pointer-events-none flex items-center gap-1.5">
            {isTypingRecently && (
              <motion.span
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                className={cn(
                  'w-1.5 h-1.5 rounded-full animate-ping mr-1',
                  isDark ? 'bg-[#D4AF37]' : 'bg-[#500B18]'
                )}
              />
            )}
            {icon}
          </div>
        ) : isTypingRecently ? (
          <div className="absolute right-3.5 top-1/2 -translate-y-1/2 z-20 pointer-events-none flex items-center">
            <motion.span
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              className={cn(
                'w-2 h-2 rounded-full animate-ping',
                isDark ? 'bg-[#D4AF37]' : 'bg-[#500B18]'
              )}
            />
          </div>
        ) : null}
      </div>

      {/* Typing character pulse indicator line */}
      <div className="relative h-0.5 w-full mt-0.5 overflow-hidden rounded-full">
        {isTypingRecently && (
          <motion.div
            layoutId={`typing-bar-${id}`}
            initial={{ x: '-100%' }}
            animate={{ x: '100%' }}
            transition={{ repeat: Infinity, duration: 0.85, ease: 'easeInOut' }}
            className={cn(
              'h-full w-1/3 rounded-full',
              isDark
                ? 'bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent'
                : 'bg-gradient-to-r from-transparent via-[#500B18] to-transparent'
            )}
          />
        )}
      </div>
    </div>
  );
}
