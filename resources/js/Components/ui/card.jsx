import React from 'react';

/**
 * Professional Card Component - Theme-Aware
 * Uses CSS variables for automatic dark mode support
 */

// Main Card Container
export const Card = ({
  children,
  className = '',
  variant = 'default',
  padding = 'md',
  shadow = 'md',
  hover = false,
  onClick,
  ...props
}) => {
  const variantClasses = {
    default: 'bg-[var(--surface-00)] border-[var(--border-light)]',
    elevated: 'bg-[var(--surface-00)] border-[var(--border-light)] shadow-lg',
    outline: 'bg-transparent border-[var(--border-medium)] border-2',
    ghost: 'bg-transparent border-[var(--border-light)]',
  };

  const paddingClasses = {
    xs: 'p-2',
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6',
    xl: 'p-8',
  };

  const shadowClasses = {
    sm: 'shadow-sm',
    md: 'shadow-md',
    lg: 'shadow-lg',
    xl: 'shadow-xl',
    none: 'shadow-none',
  };

  return (
    <div
      className={`
        rounded-lg border
        transition-all duration-200
        ${variantClasses[variant]}
        ${paddingClasses[padding]}
        ${shadowClasses[shadow]}
        ${hover ? 'hover:shadow-lg hover:-translate-y-1 cursor-pointer' : ''}
        ${className}
      `}
      onClick={onClick}
      {...props}
    >
      {children}
    </div>
  );
};

// Card Header
export const CardHeader = ({
  children,
  className = '',
  bordered = false,
  ...props
}) => {
  return (
    <div
      className={`
        ${bordered ? 'border-b border-[var(--border-light)] pb-4 mb-4' : 'mb-4'}
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  );
};

// Card Title
export const CardTitle = ({
  children,
  className = '',
  size = 'lg',
  ...props
}) => {
  const sizeClasses = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl',
    xl: 'text-3xl',
  };

  return (
    <h3
      className={`
        font-semibold text-[var(--text-primary)]
        ${sizeClasses[size]}
        ${className}
      `}
      {...props}
    >
      {children}
    </h3>
  );
};

// Card Description
export const CardDescription = ({
  children,
  className = '',
  ...props
}) => {
  return (
    <p
      className={`
        text-sm text-[var(--text-secondary)] mt-1
        ${className}
      `}
      {...props}
    >
      {children}
    </p>
  );
};

// Card Content
export const CardContent = ({
  children,
  className = '',
  ...props
}) => {
  return (
    <div
      className={className}
      {...props}
    >
      {children}
    </div>
  );
};

// Card Footer
export const CardFooter = ({
  children,
  className = '',
  bordered = false,
  ...props
}) => {
  return (
    <div
      className={`
        ${bordered ? 'border-t border-[var(--border-light)] pt-4 mt-4' : 'mt-4'}
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  );
};

// Stat Card (Enhanced version)
export const StatCard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  loading = false,
  variant = 'default',
  onClick,
  className = '',
  ...props
}) => {
  // Loading skeleton
  if (loading) {
    return (
      <Card variant="default" className={`animate-pulse ${className}`}>
        <div className="flex items-center justify-between mb-4">
          <div className="h-4 bg-[var(--surface-10)] rounded w-24"></div>
          <div className="h-10 w-10 bg-[var(--surface-10)] rounded-full"></div>
        </div>
        <div className="h-8 bg-[var(--surface-10)] rounded w-32 mb-2"></div>
        <div className="h-3 bg-[var(--surface-10)] rounded w-40"></div>
      </Card>
    );
  }

  const variantColors = {
    default: { bg: 'bg-[var(--primary-100)]', color: 'text-[var(--primary-600)]' },
    success: { bg: 'bg-[var(--success-50)]', color: 'text-[var(--color-success)]' },
    warning: { bg: 'bg-[var(--warning-50)]', color: 'text-[var(--color-warning)]' },
    error: { bg: 'bg-[var(--error-50)]', color: 'text-[var(--color-danger)]' },
    info: { bg: 'bg-[var(--info-50)]', color: 'text-[var(--color-info)]' },
  };

  const currentColors = variantColors[variant] || variantColors.default;

  return (
    <Card
      variant="default"
      hover={!!onClick}
      onClick={onClick}
      className={className}
      {...props}
    >
      {/* Header with title and icon */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-sm font-medium text-[var(--text-tertiary)] uppercase tracking-wide">
            {title}
          </h3>
        </div>
        {Icon && (
          <div className={`flex items-center justify-center h-10 w-10 rounded-full flex-shrink-0 ${currentColors.bg}`}>
            <Icon className={`h-5 w-5 ${currentColors.color}`} />
          </div>
        )}
      </div>

      {/* Main value */}
      <div className="text-3xl font-bold text-[var(--text-primary)] mb-2 break-words">
        {value !== null && value !== undefined ? value : '—'}
      </div>

      {/* Subtitle and trend */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <p className="text-sm text-[var(--text-tertiary)]">
          {subtitle}
        </p>

        {trend && (
          <div className="flex items-center gap-1">
            <div className={`flex items-center text-sm font-medium ${trend.direction === 'up'
                ? trend.value >= 0 ? 'text-[var(--color-success)]' : 'text-[var(--color-danger)]'
                : trend.value >= 0 ? 'text-[var(--color-danger)]' : 'text-[var(--color-success)]'
              }`}>
              {trend.direction === 'up' ? (
                <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              ) : (
                <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
                </svg>
              )}
              <span>{Math.abs(trend.value)}%</span>
            </div>
            {trend.label && (
              <span className="text-xs text-[var(--text-muted)] ml-1">
                {trend.label}
              </span>
            )}
          </div>
        )}
      </div>
    </Card>
  );
};

export default Card;