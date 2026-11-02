import React from 'react';
import { cn } from '@/shared/lib/cn';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'primary' | 'success' | 'warning' | 'neutral' | 'subtle';
  className?: string;
}

export function Badge({ children, variant = 'primary', className }: BadgeProps) {
  const variantStyles = {
    primary: 'bg-aqua-100 text-aqua-800 border-aqua-200/60',
    success: 'bg-emerald-100 text-emerald-800 border-emerald-200/60',
    warning: 'bg-amber-100 text-amber-800 border-amber-200/60',
    neutral: 'bg-slate-100 text-slate-700 border-slate-200',
    subtle: 'bg-white/80 text-slate-600 border-white/60 shadow-sm',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border',
        variantStyles[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
