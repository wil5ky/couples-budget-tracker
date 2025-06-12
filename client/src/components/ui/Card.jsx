import React from 'react';

const Card = ({ 
  children, 
  className = "", 
  hover = true, 
  padding = "p-6", 
  shadow = "soft",
  glow = false,
  onClick,
  ...props 
}) => {
  const baseClasses = `
    bg-white dark:bg-neutral-800 
    border border-neutral-200 dark:border-neutral-700 
    rounded-2xl 
    transition-all duration-200 
    ${padding}
  `;

  const shadowClasses = {
    none: '',
    soft: 'shadow-soft',
    medium: 'shadow-medium',
    hard: 'shadow-hard'
  };

  const hoverClasses = hover ? `
    hover:shadow-medium 
    hover:-translate-y-1 
    hover:border-neutral-300 
    dark:hover:border-neutral-600
    ${onClick ? 'cursor-pointer' : ''}
  ` : '';

  const glowClasses = glow ? 'shadow-glow' : '';

  return (
    <div 
      className={`
        ${baseClasses} 
        ${shadowClasses[shadow]} 
        ${hoverClasses} 
        ${glowClasses} 
        ${className}
      `}
      onClick={onClick}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;