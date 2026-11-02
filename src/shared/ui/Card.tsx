import React from 'react';
import { cn } from '@/shared/lib/cn';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'flat' | 'gradient' | 'glass';
}

export function Card({ children, className, variant = 'default', ...props }: CardProps) {
  const variantStyles = {
    default: 'bg-white border border-slate-100 shadow-soft-card rounded-3xl p-5',
    flat: 'bg-slate-50/80 border border-slate-100 rounded-3xl p-5',
    gradient: 'bg-gradient-to-br from-aqua-50 via-white to-sky-50/50 border border-aqua-100 shadow-soft-card rounded-3xl p-5',
    glass: 'bg-white/80 backdrop-blur-md border border-white/60 shadow-soft-card rounded-3xl p-5',
  };

  return (
    <div className={cn(variantStyles[variant], className)} {...props}>
      {children}
    </div>
  );
}
