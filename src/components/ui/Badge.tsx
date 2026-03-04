import React from 'react';
import { cn } from './Button';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'outline' | 'secondary' | 'accent' | 'success' | 'warning';
}

export const Badge: React.FC<BadgeProps> = ({ className, variant = 'default', ...props }) => {
  const variants = {
    default: 'bg-surface text-primary-text border-border',
    outline: 'text-primary-text border-border',
    secondary: 'bg-secondary-text/10 text-secondary-text border-transparent',
    accent: 'bg-accent/10 text-accent border-accent/20',
    success: 'bg-green-500/10 text-green-500 border-green-500/20',
    warning: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
        variants[variant],
        className
      )}
      {...props}
    />
  );
};
