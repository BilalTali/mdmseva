import React from 'react';
import { colors, components, typography, spacing, borderRadius, animations } from '@/lib/design-system';

/**
 * Professional Button Component
 * Unified button component with consistent styling across the application
 */
const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  disabled = false,
  loading = false,
  fullWidth = false,
  icon,
  iconPosition = 'left',
  className = '',
  onClick,
  type = 'button',
  ...props 
}) => {
  // Size configurations
  const sizeStyles = {
    xs: {
      padding: `${spacing[1]} ${spacing[2]}`,
      fontSize: typography.fontSize.xs,
      height: '24px',
    },
    sm: {
      padding: `${spacing[2]} ${spacing[3]}`,
      fontSize: typography.fontSize.sm,
      height: '32px',
    },
    md: {
      padding: `${spacing[2]} ${spacing[4]}`,
      fontSize: typography.fontSize.base,
      height: '40px',
    },
    lg: {
      padding: `${spacing[3]} ${spacing[6]}`,
      fontSize: typography.fontSize.lg,
      height: '48px',
    },
    xl: {
      padding: `${spacing[4]} ${spacing[8]}`,
      fontSize: typography.fontSize.xl,
      height: '56px',
    },
  };

  // Variant configurations
  const variantStyles = {
    primary: {
      backgroundColor: components.button.primary.background,
      color: components.button.primary.color,
      borderColor: components.button.primary.borderColor,
      hover: {
        backgroundColor: components.button.primary.hoverBackground,
        borderColor: components.button.primary.hoverBackground,
      },
      active: {
        backgroundColor: components.button.primary.activeBackground,
        borderColor: components.button.primary.activeBackground,
      },
    },
    secondary: {
      backgroundColor: components.button.secondary.background,
      color: components.button.secondary.color,
      borderColor: components.button.secondary.borderColor,
      hover: {
        backgroundColor: components.button.secondary.hoverBackground,
        color: colors.secondary[800],
      },
      active: {
        backgroundColor: components.button.secondary.activeBackground,
        color: colors.secondary[900],
      },
    },
    success: {
      backgroundColor: components.button.success.background,
      color: components.button.success.color,
      borderColor: components.button.success.borderColor,
      hover: {
        backgroundColor: components.button.success.hoverBackground,
        borderColor: components.button.success.hoverBackground,
      },
      active: {
        backgroundColor: components.button.success.activeBackground,
        borderColor: components.button.success.activeBackground,
      },
    },
    warning: {
      backgroundColor: components.button.warning.background,
      color: components.button.warning.color,
      borderColor: components.button.warning.borderColor,
      hover: {
        backgroundColor: components.button.warning.hoverBackground,
        borderColor: components.button.warning.hoverBackground,
      },
      active: {
        backgroundColor: components.button.warning.activeBackground,
        borderColor: components.button.warning.activeBackground,
      },
    },
    error: {
      backgroundColor: components.button.error.background,
      color: components.button.error.color,
      borderColor: components.button.error.borderColor,
      hover: {
        backgroundColor: components.button.error.hoverBackground,
        borderColor: components.button.error.hoverBackground,
      },
      active: {
        backgroundColor: components.button.error.activeBackground,
        borderColor: components.button.error.activeBackground,
      },
    },
    ghost: {
      backgroundColor: components.button.ghost.background,
      color: components.button.ghost.color,
      borderColor: components.button.ghost.borderColor,
      hover: {
        backgroundColor: components.button.ghost.hoverBackground,
        color: colors.secondary[800],
      },
      active: {
        backgroundColor: components.button.ghost.activeBackground,
        color: colors.secondary[900],
      },
    },
    outline: {
      backgroundColor: 'transparent',
      color: colors.secondary[700],
      borderColor: colors.secondary[300],
      hover: {
        backgroundColor: colors.secondary[50],
        color: colors.secondary[800],
        borderColor: colors.secondary[400],
      },
      active: {
        backgroundColor: colors.secondary[100],
        color: colors.secondary[900],
        borderColor: colors.secondary[500],
      },
    },
  };

  const currentSize = sizeStyles[size];
  const currentVariant = variantStyles[variant];

  // Base styles
  const baseStyles = `
    inline-flex items-center justify-center
    font-medium leading-none
    border rounded-md
    transition-all duration-200
    focus:outline-none focus:ring-2 focus:ring-offset-2
    disabled:opacity-50 disabled:cursor-not-allowed
    ${fullWidth ? 'w-full' : ''}
  `;

  // Focus ring colors based on variant
  const focusRingColors = {
    primary: 'focus:ring-primary-500',
    secondary: 'focus:ring-secondary-500',
    success: 'focus:ring-success-500',
    warning: 'focus:ring-warning-500',
    error: 'focus:ring-error-500',
    ghost: 'focus:ring-secondary-500',
    outline: 'focus:ring-secondary-500',
  };

  // Loading spinner
  const LoadingSpinner = () => (
    <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
  );

  // Icon rendering
  const renderIcon = () => {
    if (!icon) return null;
    
    const iconClass = `h-4 w-4 ${iconPosition === 'left' ? 'mr-2' : 'ml-2'}`;
    
    return (
      <span className={iconClass}>
        {icon}
      </span>
    );
  };

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={`
        ${baseStyles}
        ${focusRingColors[variant]}
        ${className}
      `}
      style={{
        backgroundColor: currentVariant.backgroundColor,
        color: currentVariant.color,
        borderColor: currentVariant.borderColor,
        padding: currentSize.padding,
        fontSize: currentSize.fontSize,
        minHeight: currentSize.height,
        borderRadius: borderRadius.md,
        ...props.style,
      }}
      onMouseEnter={(e) => {
        if (!disabled && !loading) {
          e.target.style.backgroundColor = currentVariant.hover.backgroundColor;
          e.target.style.borderColor = currentVariant.hover.borderColor;
          if (currentVariant.hover.color) {
            e.target.style.color = currentVariant.hover.color;
          }
        }
      }}
      onMouseLeave={(e) => {
        if (!disabled && !loading) {
          e.target.style.backgroundColor = currentVariant.backgroundColor;
          e.target.style.borderColor = currentVariant.borderColor;
          e.target.style.color = currentVariant.color;
        }
      }}
      onMouseDown={(e) => {
        if (!disabled && !loading) {
          e.target.style.backgroundColor = currentVariant.active.backgroundColor;
          e.target.style.borderColor = currentVariant.active.borderColor;
          if (currentVariant.active.color) {
            e.target.style.color = currentVariant.active.color;
          }
        }
      }}
      onMouseUp={(e) => {
        if (!disabled && !loading) {
          e.target.style.backgroundColor = currentVariant.hover.backgroundColor;
          e.target.style.borderColor = currentVariant.hover.borderColor;
          if (currentVariant.hover.color) {
            e.target.style.color = currentVariant.hover.color;
          }
        }
      }}
      {...props}
    >
      {loading && <LoadingSpinner />}
      {iconPosition === 'left' && renderIcon()}
      <span className="flex-1">{children}</span>
      {iconPosition === 'right' && renderIcon()}
    </button>
  );
};

export default Button;