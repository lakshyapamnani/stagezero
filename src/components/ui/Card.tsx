import React from 'react';
import { cn } from './Button';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hover?: boolean;
}

export const Card: React.FC<CardProps> = ({ className, hover, ...props }) => {
  return (
    <div
      className={cn(
        'bg-card border border-border rounded-xl p-6',
        hover && 'transition-all duration-150 hover:border-accent/50 hover:shadow-lg hover:shadow-accent/5',
        className
      )}
      {...props}
    />
  );
};

export const CardHeader: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className, ...props }) => (
  <div className={cn('flex flex-col space-y-1.5 mb-4', className)} {...props} />
);

export const CardTitle: React.FC<React.HTMLAttributes<HTMLHeadingElement>> = ({ className, ...props }) => (
  <h3 className={cn('text-lg font-semibold leading-none tracking-tight text-primary-text', className)} {...props} />
);

export const CardDescription: React.FC<React.HTMLAttributes<HTMLParagraphElement>> = ({ className, ...props }) => (
  <p className={cn('text-sm text-secondary-text', className)} {...props} />
);

export const CardContent: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className, ...props }) => (
  <div className={cn('text-primary-text', className)} {...props} />
);

export const CardFooter: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className, ...props }) => (
  <div className={cn('flex items-center mt-4 pt-4 border-t border-border', className)} {...props} />
);
