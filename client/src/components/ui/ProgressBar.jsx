import React from 'react';

const ProgressBar = ({ 
  value = 0, 
  max = 100, 
  variant = 'primary',
  size = 'md',
  showValue = false,
  animated = true,
  glow = false,
  className = "",
  ...props 
}) => {
  const percentage = Math.min((value / max) * 100, 100);
  
  const baseClasses = `
    w-full bg-neutral-200 dark:bg-neutral-700 
    rounded-full overflow-hidden
    transition-all duration-300
  `;

  const variants = {
    primary: 'bg-gradient-to-r from-primary-400 to-primary-600',
    success: 'bg-gradient-to-r from-success-400 to-success-600',
    warning: 'bg-gradient-to-r from-warning-400 to-warning-600',
    danger: 'bg-gradient-to-r from-danger-400 to-danger-600',
    income: 'bg-gradient-to-r from-green-400 to-green-600',
    expense: 'bg-gradient-to-r from-amber-400 to-amber-600',
    default: 'bg-gradient-to-r from-neutral-400 to-neutral-600',
  };

  const sizes = {
    sm: 'h-2',
    md: 'h-3',
    lg: 'h-4',
    xl: 'h-6'
  };

  const animatedClass = animated ? 'transition-all duration-700 ease-out' : '';
  const glowClass = glow ? 'shadow-glow' : '';

  // Determine color based on percentage for smart psychology
  const getSmartVariant = () => {
    if (percentage >= 100) return 'danger';
    if (percentage >= 80) return 'warning';
    if (percentage >= 60) return 'primary';
    return 'success';
  };

  const finalVariant = variant === 'smart' ? getSmartVariant() : (variants[variant] ? variant : 'default');

  return (
    <div className={`${className}`} {...props}>
      <div className={`${baseClasses} ${sizes[size]} ${glowClass}`}>
        <div
          className={`
            h-full ${variants[finalVariant]} ${animatedClass}
            ${animated ? 'bg-gradient-to-r animate-shimmer bg-[length:200%_100%]' : ''}
          `}
          style={{ width: `${percentage}%` }}
        >
          {animated && (
            <div className="h-full w-full bg-gradient-to-r from-transparent via-white/20 to-transparent" />
          )}
        </div>
      </div>
      
      {showValue && (
        <div className="flex justify-between items-center mt-1 text-xs text-neutral-600 dark:text-neutral-400">
          <span>{value.toLocaleString()}</span>
          <span>{max.toLocaleString()}</span>
        </div>
      )}
    </div>
  );
};

export default ProgressBar;