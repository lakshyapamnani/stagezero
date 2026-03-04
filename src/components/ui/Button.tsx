import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
}

export const Button: React.FC<ButtonProps> = ({ 
  className, 
  variant = 'primary', 
  size = 'md', 
  ...props 
}) => {
  const variants = {
    primary: 'bg-accent text-white hover:bg-accent-hover shadow-sm',
    secondary: 'bg-surface text-primary-text hover:bg-card border border-border',
    outline: 'bg-transparent border border-border text-primary-text hover:bg-surface',
    ghost: 'bg-transparent text-secondary-text hover:text-primary-text hover:bg-surface/50',
    danger: 'bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500/20',
  };

  const sizes = {
    sm: 'h-8 px-3 text-xs',
    md: 'h-10 px-4 text-sm',
    lg: 'h-12 px-6 text-base',
  };

  return (
    <button
      className={cn(
        'inline-flex items-center justify-center rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-accent/50 disabled:opacity-50 disabled:pointer-events-none',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    />
  );
};
