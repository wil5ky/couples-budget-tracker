import React from 'react';

const Badge = ({ 
  children, 
  variant = 'default', 
  size = 'md',
  pulse = false,
  className = "",
  ...props 
}) => {
  const baseClasses = `
    inline-flex items-center justify-center
    font-medium rounded-full
    transition-all duration-200
  `;

  const variants = {
    default: 'bg-neutral-100 text-neutral-800 dark:bg-neutral-700 dark:text-neutral-200',
    primary: 'bg-primary-100 text-primary-800 dark:bg-primary-900/30 dark:text-primary-200',
    success: 'bg-success-100 text-success-800 dark:bg-success-900/30 dark:text-success-200',
    warning: 'bg-warning-100 text-warning-800 dark:bg-warning-900/30 dark:text-warning-200',
    danger: 'bg-danger-100 text-danger-800 dark:bg-danger-900/30 dark:text-danger-200',
    income: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200',
    expense: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-200',
  };

  const sizes = {
    sm: 'px-2 py-1 text-2xs',
    md: 'px-2.5 py-1 text-xs',
    lg: 'px-3 py-1.5 text-sm'
  };

  const pulseClass = pulse ? 'animate-pulse-slow' : '';

  return (
    <span
      className={`
        ${baseClasses}
        ${variants[variant] || variants.default}
        ${sizes[size]}
        ${pulseClass}
        ${className}
      `}
      {...props}
    >
      {children}
    </span>
  );
};

export default Badge;