// src/components/ui/Card.tsx
import React from 'react';
import { cn } from "../../utils/cn";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'bordered' | 'elevated';
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export const Card: React.FC<CardProps> = ({
  className,
  variant = 'default',
  padding = 'md',
  children,
  ...props
}) => {
  const paddingClasses = {
    none: 'p-0',
    sm: 'p-3',
    md: 'p-6',
    lg: 'p-8',
  };

  const variantClasses = {
    default: 'bg-white border border-[#C3DACB] shadow-sm',
    bordered: 'bg-white border-2 border-[#C3DACB]',
    elevated: 'bg-white shadow-lg hover:shadow-xl transition-shadow',
  };

  return (
    <div
      className={cn(
        'rounded-3xl relative overflow-hidden',
        variantClasses[variant],
        paddingClasses[padding],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardAccent: React.FC<{ className?: string }> = ({ className }) => (
  <div className={cn('absolute top-0 left-0 w-1.5 h-full bg-[#3B7A57]', className)} />
);

export const CardHeader: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className,
  children,
  ...props
}) => (
  <div className={cn('flex items-center justify-between mb-4', className)} {...props}>
    {children}
  </div>
);

export const CardTitle: React.FC<React.HTMLAttributes<HTMLHeadingElement>> = ({
  className,
  children,
  ...props
}) => (
  <h3 className={cn('text-lg font-bold text-[#1B2A23]', className)} {...props}>
    {children}
  </h3>
);

export const CardBody: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className,
  children,
  ...props
}) => (
  <div className={cn('space-y-4', className)} {...props}>
    {children}
  </div>
);