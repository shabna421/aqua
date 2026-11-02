import React from 'react';
import { cn } from '@/shared/lib/cn';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'soft';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  isLoading?: boolean;
}

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  className,
  disabled,
  type = 'button',
  ...props
}: ButtonProps) {
  const variantStyles = {
    primary:
      'bg-aqua-500 hover:bg-aqua-600 active:bg-aqua-700 text-white shadow-md shadow-aqua-500/25 border border-aqua-400/30',
    secondary:
      'bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-700 border border-slate-200/60',
    outline:
      'bg-white hover:bg-slate-50 active:bg-slate-100 text-slate-700 border border-slate-200 shadow-sm',
    ghost: 'bg-transparent hover:bg-slate-100 text-slate-600',
    soft: 'bg-aqua-50 hover:bg-aqua-100 text-aqua-700 border border-aqua-200/60',
  };

  const sizeStyles = {
    sm: 'text-xs px-3 py-1.5 rounded-xl font-medium gap-1.5',
    md: 'text-sm px-4 py-2.5 rounded-2xl font-semibold gap-2',
    lg: 'text-base px-6 py-3.5 rounded-2xl font-bold gap-2.5 shadow-lg',
    icon: 'p-2 rounded-2xl',
  };

  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      className={cn(
        'inline-flex items-center justify-center transition-all duration-200 select-none cursor-pointer',
        'active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none disabled:active:scale-100',
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
      {...props}
    >
      {isLoading ? (
        <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent mr-2" />
      ) : null}
      {children}
    </button>
  );
}
