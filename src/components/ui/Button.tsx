// src/components/ui/Button.tsx
import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../utils/cn';

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-2xl font-bold transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3B7A57] focus-visible:ring-offset-2',
  {
    variants: {
      variant: {
        // Primary action button
        primary: 'bg-[#234E35] text-white hover:bg-[#1A3D28] shadow-sm hover:shadow-md',
        // Secondary/alternative action
        secondary: 'bg-[#F2F8F4] text-[#1B2A23] border border-[#C3DACB] hover:bg-[#E3EFE6] hover:border-[#3B7A57]',
        // Danger/destructive action
        danger: 'bg-[#E79897] text-white hover:bg-[#d88786] shadow-sm hover:shadow-md',
        // Warning/caution action
        warning: 'bg-[#FADEC9] text-[#1B2A23] border border-[#F5C29B] hover:bg-[#f5d4b0]',
        // Success/confirm action
        success: 'bg-[#3B7A57] text-white hover:bg-[#2E6045] shadow-sm hover:shadow-md',
        // Ghost/transparent button
        ghost: 'bg-transparent text-[#557060] hover:text-[#1B2A23] hover:bg-[#E3EFE6]/50',
        // Outline button
        outline: 'bg-transparent text-[#1B2A23] border-2 border-[#C3DACB] hover:bg-[#F2F8F4] hover:border-[#3B7A57]',
        // Link style button
        link: 'bg-transparent text-[#3B7A57] underline-offset-4 hover:underline p-0 h-auto font-semibold',
      },
      size: {
        xs: 'px-2 py-1 text-[10px] rounded-xl',
        sm: 'px-3.5 py-2 text-xs',
        md: 'px-5 py-2.5 text-sm',
        lg: 'px-7 py-3.5 text-base',
        xl: 'px-8 py-4 text-lg',
        icon: 'p-2 w-10 h-10',
        'icon-sm': 'p-1.5 w-8 h-8 rounded-xl',
        'icon-lg': 'p-3 w-12 h-12',
      },
      fullWidth: {
        true: 'w-full',
      },
      loading: {
        true: 'cursor-wait opacity-70',
      },
      pill: {
        true: 'rounded-full',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  children?: React.ReactNode;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  isLoading?: boolean;
  loadingText?: string;
}

export const Button: React.FC<ButtonProps> = React.memo(({
  className,
  variant,
  size,
  fullWidth,
  loading,
  isLoading,
  loadingText = 'Loading...',
  pill,
  children,
  leftIcon,
  rightIcon,
  disabled,
  onClick,
  type = 'button',
  ...props
}) => {
  // Handle loading state
  const isDisabled = disabled || isLoading || loading ? true : undefined;
  const isFullWidth = fullWidth;

  // Render loading spinner
  const renderLoadingSpinner = () => (
    <svg 
      className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" 
      xmlns="http://www.w3.org/2000/svg" 
      fill="none" 
      viewBox="0 0 24 24"
    >
      <circle 
        className="opacity-25" 
        cx="12" 
        cy="12" 
        r="10" 
        stroke="currentColor" 
        strokeWidth="4"
      />
      <path 
        className="opacity-75" 
        fill="currentColor" 
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );

  return (
    <button
      type={type}
      className={cn(
        buttonVariants({ 
          variant, 
          size, 
          fullWidth: isFullWidth,
          loading: isLoading || loading,
          pill,
          className 
        })
      )}
      disabled={isDisabled}
      onClick={onClick}
      {...props}
    >
      {isLoading || loading ? (
        <>
          {renderLoadingSpinner()}
          {loadingText || children}
        </>
      ) : (
        <>
          {leftIcon && <span className="mr-2 shrink-0">{leftIcon}</span>}
          {children}
          {rightIcon && <span className="ml-2 shrink-0">{rightIcon}</span>}
        </>
      )}
    </button>
  );
});

Button.displayName = 'Button';

// Export variants for use in other components
export { buttonVariants };

// Icon-only button component
interface IconButtonProps extends Omit<ButtonProps, 'children' | 'leftIcon' | 'rightIcon'> {
  icon: React.ReactNode;
  label: string;
}

export const IconButton: React.FC<IconButtonProps> = React.memo(({
  icon,
  label,
  size = 'icon',
  variant = 'ghost',
  className,
  ...props
}) => {
  return (
    <Button
      size={size}
      variant={variant}
      className={cn('shrink-0', className)}
      aria-label={label}
      {...props}
    >
      {icon}
      <span className="sr-only">{label}</span>
    </Button>
  );
});

IconButton.displayName = 'IconButton';

// Primary action button with loading state
export const PrimaryButton: React.FC<Omit<ButtonProps, 'variant'>> = (props) => (
  <Button variant="primary" {...props} />
);

// Secondary action button
export const SecondaryButton: React.FC<Omit<ButtonProps, 'variant'>> = (props) => (
  <Button variant="secondary" {...props} />
);

// Danger button
export const DangerButton: React.FC<Omit<ButtonProps, 'variant'>> = (props) => (
  <Button variant="danger" {...props} />
);

// Success button
export const SuccessButton: React.FC<Omit<ButtonProps, 'variant'>> = (props) => (
  <Button variant="success" {...props} />
);

// Warning button
export const WarningButton: React.FC<Omit<ButtonProps, 'variant'>> = (props) => (
  <Button variant="warning" {...props} />
);

// Ghost button
export const GhostButton: React.FC<Omit<ButtonProps, 'variant'>> = (props) => (
  <Button variant="ghost" {...props} />
);

// Outline button
export const OutlineButton: React.FC<Omit<ButtonProps, 'variant'>> = (props) => (
  <Button variant="outline" {...props} />
);

// Link button
export const LinkButton: React.FC<Omit<ButtonProps, 'variant'>> = (props) => (
  <Button variant="link" {...props} />
);

// Button group component
interface ButtonGroupProps {
  children: React.ReactNode;
  orientation?: 'horizontal' | 'vertical';
  spacing?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const ButtonGroup: React.FC<ButtonGroupProps> = ({
  children,
  orientation = 'horizontal',
  spacing = 'md',
  className,
}) => {
  const spacingClasses = {
    sm: orientation === 'horizontal' ? 'space-x-1' : 'space-y-1',
    md: orientation === 'horizontal' ? 'space-x-2' : 'space-y-2',
    lg: orientation === 'horizontal' ? 'space-x-3' : 'space-y-3',
  };

  return (
    <div
      className={cn(
        'flex',
        orientation === 'horizontal' ? 'flex-row' : 'flex-col',
        spacingClasses[spacing],
        className
      )}
    >
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          return child;
        }
        return child;
      })}
    </div>
  );
};

ButtonGroup.displayName = 'ButtonGroup';