'use client';

import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'accent' | 'outline';
  className?: string;
}

export default function Badge({ children, variant = 'primary', className }: BadgeProps) {
  const variants = {
    primary: 'bg-indigo-600 text-white',
    secondary: 'bg-slate-700 text-slate-300',
    accent: 'bg-fuchsia-600 text-white',
    outline: 'border border-white/10 text-slate-400',
  };

  return (
    <span className={cn(
      'inline-flex items-center justify-center px-1.5 py-0.5 rounded-full text-[10px] font-bold min-w-[20px]',
      variants[variant],
      className
    )}>
      {children}
    </span>
  );
}
