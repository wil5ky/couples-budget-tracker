import React from 'react';
import { Loader2 } from 'lucide-react';

const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  loading = false, 
  disabled = false,
  icon,
  className = "",
  onClick,
  ...props 
}) => {
  const baseClasses = `
    inline-flex items-center justify-center
    font-medium rounded-xl
    transition-all duration-200
    focus:outline-none focus:ring-4 focus:ring-opacity-50
    disabled:opacity-50 disabled:cursor-not-allowed
    transform active:scale-95
  `;

  const variants = {
    primary: `
      bg-gradient-to-r from-primary-500 to-primary-600 
      text-white 
      hover:from-primary-600 hover:to-primary-700 
      focus:ring-primary-500
      shadow-soft hover:shadow-medium
    `,
    secondary: `
      bg-neutral-100 dark:bg-neutral-700 
      text-neutral-900 dark:text-neutral-100 
      hover:bg-neutral-200 dark:hover:bg-neutral-600
      focus:ring-neutral-500
    `,
    success: `
      bg-gradient-to-r from-success-500 to-success-600 
      text-white 
      hover:from-success-600 hover:to-success-700 
      focus:ring-success-500
      shadow-success-glow
    `,
    danger: `
      bg-gradient-to-r from-danger-500 to-danger-600 
      text-white 
      hover:from-danger-600 hover:to-danger-700 
      focus:ring-danger-500
      shadow-danger-glow
    `,
    warning: `
      bg-gradient-to-r from-warning-400 to-warning-500 
      text-white 
      hover:from-warning-500 hover:to-warning-600 
      focus:ring-warning-500
    `,
    ghost: `
      text-neutral-700 dark:text-neutral-300 
      hover:bg-neutral-100 dark:hover:bg-neutral-800
      focus:ring-neutral-500
    `,
    outline: `
      border-2 border-primary-500 
      text-primary-500 
      hover:bg-primary-500 hover:text-white
      focus:ring-primary-500
    `
  };

  const sizes = {
    sm: 'px-3 py-2 text-sm gap-2',
    md: 'px-4 py-2.5 text-sm gap-2',
    lg: 'px-6 py-3 text-base gap-3',
    xl: 'px-8 py-4 text-lg gap-3'
  };

  return (
    <button
      className={`
        ${baseClasses}
        ${variants[variant]}
        ${sizes[size]}
        ${className}
      `}
      disabled={disabled || loading}
      onClick={onClick}
      {...props}
    >
      {loading ? (
        <Loader2 size={16} className="animate-spin" />
      ) : icon ? (
        <span className="flex items-center">{icon}</span>
      ) : null}
      {children}
    </button>
  );
};

export default Button;