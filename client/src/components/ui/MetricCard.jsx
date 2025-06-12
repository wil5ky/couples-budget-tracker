import React from 'react';
import Card from './Card';
import Badge from './Badge';
import { TrendingUp, TrendingDown } from 'lucide-react';

const MetricCard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  trendValue,
  variant = 'default',
  currency = false,
  large = false,
  className = "",
  onClick,
  ...props
}) => {
  const formatValue = (val) => {
    if (currency && typeof val === 'number') {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(val);
    }
    return val;
  };

  const variants = {
    default: {
      iconBg: 'bg-neutral-100 dark:bg-neutral-700',
      iconColor: 'text-neutral-600 dark:text-neutral-300',
    },
    primary: {
      iconBg: 'bg-primary-100 dark:bg-primary-900/30',
      iconColor: 'text-primary-600 dark:text-primary-400',
    },
    success: {
      iconBg: 'bg-success-100 dark:bg-success-900/30',
      iconColor: 'text-success-600 dark:text-success-400',
    },
    warning: {
      iconBg: 'bg-warning-100 dark:bg-warning-900/30',
      iconColor: 'text-warning-600 dark:text-warning-400',
    },
    danger: {
      iconBg: 'bg-danger-100 dark:bg-danger-900/30',
      iconColor: 'text-danger-600 dark:text-danger-400',
    },
    income: {
      iconBg: 'bg-green-100 dark:bg-green-900/30',
      iconColor: 'text-green-600 dark:text-green-400',
    },
    expense: {
      iconBg: 'bg-amber-100 dark:bg-amber-900/30',
      iconColor: 'text-amber-600 dark:text-amber-400',
    },
  };

  const currentVariant = variants[variant] || variants.default;

  return (
    <Card 
      className={`group ${className}`} 
      hover={!!onClick}
      onClick={onClick}
      {...props}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-3">
            {Icon && (
              <div className={`
                p-3 rounded-xl transition-all duration-200 group-hover:scale-110
                ${currentVariant.iconBg}
              `}>
                <Icon size={large ? 28 : 24} className={currentVariant.iconColor} />
              </div>
            )}
            
            <div className="flex-1">
              <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400 mb-1">
                {title}
              </p>
              <p className={`font-bold text-neutral-900 dark:text-neutral-100 ${
                large ? 'text-3xl' : 'text-2xl'
              } transition-all duration-200 group-hover:scale-105`}>
                {formatValue(value)}
              </p>
              {subtitle && (
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                  {subtitle}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Trend Indicator */}
        {trend && trendValue !== undefined && (
          <div className="flex flex-col items-end">
            <div className={`flex items-center space-x-1 ${
              trend === 'up' ? 'text-success-600' : 'text-danger-600'
            }`}>
              {trend === 'up' ? (
                <TrendingUp size={16} />
              ) : (
                <TrendingDown size={16} />
              )}
              <span className="text-sm font-medium">
                {Math.abs(trendValue)}%
              </span>
            </div>
            <Badge 
              variant={trend === 'up' ? 'success' : 'danger'} 
              size="sm"
              className="mt-1"
            >
              {trend === 'up' ? 'Increase' : 'Decrease'}
            </Badge>
          </div>
        )}
      </div>
    </Card>
  );
};

export default MetricCard;