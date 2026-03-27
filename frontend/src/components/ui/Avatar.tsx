'use client';

import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface AvatarProps {
  name: string;
  src?: string;
  status?: 'ONLINE' | 'OFFLINE';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export default function Avatar({ name, src, status, size = 'md', className }: AvatarProps) {
  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
  };

  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className={cn('relative inline-block', className)}>
      <div className={cn(
        'rounded-full flex items-center justify-center font-bold text-white shadow-inner overflow-hidden',
        'bg-linear-to-br from-indigo-500 to-purple-600',
        sizeClasses[size]
      )}>
        {src ? (
          <img src={src} alt={name} className="w-full h-full object-cover" />
        ) : (
          initials
        )}
      </div>
      {status && (
        <span className={cn(
          'absolute bottom-0 right-0 block rounded-full border-2 border-slate-950',
          status === 'ONLINE' ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]' : 'bg-slate-500',
          size === 'sm' ? 'w-2.5 h-2.5' : 'w-3 h-3'
        )} />
      )}
    </div>
  );
}
