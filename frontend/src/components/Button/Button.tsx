import React from 'react';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'glow';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  children: React.ReactNode;
  fullWidth?: boolean;
}

const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  children,
  fullWidth = false,
  className = '',
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-display font-bold rounded-full transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background';

  const variantStyles = {
    primary: 'bg-accent-blue text-white hover:bg-blue-600 hover:-translate-y-0.5',
    secondary: 'bg-background-elevated text-white hover:bg-background-card hover:-translate-y-0.5',
    outline: 'bg-transparent border border-border text-white hover:border-accent-blue hover:text-accent-blue',
    ghost: 'bg-transparent text-white hover:-translate-y-0.5',
    glow: 'bg-[rgba(1,56,59)] backdrop-blur-xs text-[#E5FFFF] border border-[#60C9CD] shadow-glow-blue shadow-inset-teal hover:shadow-glow-blue-hover hover:shadow-inset-teal-hover hover:-translate-y-0.5',
  };

  const sizeStyles = {
    sm: 'px-4 py-2 text-sm gap-2',
    md: 'px-6 py-3 text-base gap-2',
    lg: 'px-8 py-3.5 text-lg gap-2',
  };

  const widthStyles = fullWidth ? 'w-full' : '';

  return (
    <button
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${widthStyles} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
