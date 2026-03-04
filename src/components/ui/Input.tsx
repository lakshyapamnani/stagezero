import React from 'react';
import { cn } from './Button';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input: React.FC<InputProps> = ({ className, label, error, ...props }) => {
  return (
    <div className="w-full space-y-2">
      {label && (
        <label className="text-sm font-medium text-secondary-text">
          {label}
        </label>
      )}
      <input
        className={cn(
          'flex h-10 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-primary-text placeholder:text-secondary-text/50 focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-150',
          error && 'border-red-500 focus:ring-red-500/50',
          className
        )}
        {...props}
      />
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
};
