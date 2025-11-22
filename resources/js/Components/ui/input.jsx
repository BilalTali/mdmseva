import React, { forwardRef } from 'react';
import { colors, components, typography, spacing, borderRadius } from '@/lib/design-system';

/**
 * Professional Input Component
 * Unified input component with consistent styling across the application
 */
const Input = forwardRef(({
  label,
  error,
  helperText,
  required = false,
  disabled = false,
  className = '',
  labelClassName = '',
  containerClassName = '',
  leftIcon,
  rightIcon,
  size = 'md',
  variant = 'outline',
  ...props
}, ref) => {
  // Size configurations
  const sizeStyles = {
    sm: {
      padding: `${spacing[2]} ${spacing[3]}`,
      fontSize: typography.fontSize.sm,
      height: '32px',
    },
    md: {
      padding: `${spacing[3]} ${spacing[4]}`,
      fontSize: typography.fontSize.base,
      height: '40px',
    },
    lg: {
      padding: `${spacing[4]} ${spacing[5]}`,
      fontSize: typography.fontSize.lg,
      height: '48px',
    },
  };

  // Variant configurations
  const variantStyles = {
    outline: {
      borderColor: error ? colors.error[500] : components.input.borderColor,
      backgroundColor: disabled ? colors.neutral[100] : components.input.background,
      focusBorderColor: error ? colors.error[500] : components.input.focusBorderColor,
      focusRingColor: error ? colors.error[200] : components.input.focusRingColor,
    },
    filled: {
      borderColor: 'transparent',
      backgroundColor: disabled ? colors.neutral[100] : colors.neutral[50],
      focusBorderColor: colors.primary[500],
      focusRingColor: colors.primary[200],
    },
    flushed: {
      borderColor: error ? colors.error[500] : colors.border.light,
      backgroundColor: 'transparent',
      focusBorderColor: error ? colors.error[500] : colors.primary[500],
      focusRingColor: 'transparent',
      borderWidth: '0 0 2px 0',
      borderRadius: '0',
    },
  };

  const currentSize = sizeStyles[size];
  const currentVariant = variantStyles[variant];

  const baseStyles = `
    w-full border rounded-md
    font-normal leading-normal
    transition-all duration-200
    focus:outline-none focus:ring-2
    disabled:cursor-not-allowed disabled:opacity-60
    placeholder:text-secondary-400
    ${className}
  `;

  return (
    <div className={`space-y-2 ${containerClassName}`}>
      {/* Label */}
      {label && (
        <label className={`block text-sm font-medium text-secondary-700 ${labelClassName}`}>
          {label}
          {required && <span className="text-error-500 ml-1">*</span>}
        </label>
      )}

      {/* Input Container */}
      <div className="relative">
        {/* Left Icon */}
        {leftIcon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span className="text-secondary-400">
              {leftIcon}
            </span>
          </div>
        )}

        {/* Input */}
        <input
          ref={ref}
          className={baseStyles}
          style={{
            borderColor: currentVariant.borderColor,
            backgroundColor: currentVariant.backgroundColor,
            padding: currentSize.padding,
            fontSize: currentSize.fontSize,
            minHeight: currentSize.height,
            borderRadius: currentVariant.borderRadius || borderRadius.md,
            paddingLeft: leftIcon ? '2.5rem' : currentSize.padding.split(' ')[1],
            paddingRight: rightIcon ? '2.5rem' : currentSize.padding.split(' ')[1],
          }}
          disabled={disabled}
          required={required}
          {...props}
          onFocus={(e) => {
            e.target.style.borderColor = currentVariant.focusBorderColor;
            e.target.style.boxShadow = `0 0 0 3px ${currentVariant.focusRingColor}`;
            if (props.onFocus) props.onFocus(e);
          }}
          onBlur={(e) => {
            e.target.style.borderColor = currentVariant.borderColor;
            e.target.style.boxShadow = 'none';
            if (props.onBlur) props.onBlur(e);
          }}
        />

        {/* Right Icon */}
        {rightIcon && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            <span className="text-secondary-400">
              {rightIcon}
            </span>
          </div>
        )}
      </div>

      {/* Helper Text or Error */}
      {(helperText || error) && (
        <div className="text-sm">
          {error ? (
            <p className="text-error-600">{error}</p>
          ) : (
            <p className="text-secondary-500">{helperText}</p>
          )}
        </div>
      )}
    </div>
  );
});

Input.displayName = 'Input';

// Textarea Component
export const Textarea = forwardRef(({
  label,
  error,
  helperText,
  required = false,
  disabled = false,
  rows = 4,
  className = '',
  labelClassName = '',
  containerClassName = '',
  size = 'md',
  variant = 'outline',
  ...props
}, ref) => {
  const sizeStyles = {
    sm: typography.fontSize.sm,
    md: typography.fontSize.base,
    lg: typography.fontSize.lg,
  };

  const variantStyles = {
    outline: {
      borderColor: error ? colors.error[500] : components.input.borderColor,
      backgroundColor: disabled ? colors.neutral[100] : components.input.background,
      focusBorderColor: error ? colors.error[500] : components.input.focusBorderColor,
      focusRingColor: error ? colors.error[200] : components.input.focusRingColor,
    },
    filled: {
      borderColor: 'transparent',
      backgroundColor: disabled ? colors.neutral[100] : colors.neutral[50],
      focusBorderColor: colors.primary[500],
      focusRingColor: colors.primary[200],
    },
  };

  const currentSize = sizeStyles[size];
  const currentVariant = variantStyles[variant];

  const baseStyles = `
    w-full border rounded-md
    font-normal leading-normal
    transition-all duration-200
    focus:outline-none focus:ring-2
    disabled:cursor-not-allowed disabled:opacity-60
    placeholder:text-secondary-400
    resize-vertical
    ${className}
  `;

  return (
    <div className={`space-y-2 ${containerClassName}`}>
      {label && (
        <label className={`block text-sm font-medium text-secondary-700 ${labelClassName}`}>
          {label}
          {required && <span className="text-error-500 ml-1">*</span>}
        </label>
      )}
      
      <textarea
        ref={ref}
        className={baseStyles}
        style={{
          borderColor: currentVariant.borderColor,
          backgroundColor: currentVariant.backgroundColor,
          fontSize: currentSize,
          borderRadius: borderRadius.md,
          padding: spacing[3],
        }}
        rows={rows}
        disabled={disabled}
        required={required}
        {...props}
        onFocus={(e) => {
          e.target.style.borderColor = currentVariant.focusBorderColor;
          e.target.style.boxShadow = `0 0 0 3px ${currentVariant.focusRingColor}`;
          if (props.onFocus) props.onFocus(e);
        }}
        onBlur={(e) => {
          e.target.style.borderColor = currentVariant.borderColor;
          e.target.style.boxShadow = 'none';
          if (props.onBlur) props.onBlur(e);
        }}
      />
      
      {(helperText || error) && (
        <div className="text-sm">
          {error ? (
            <p className="text-error-600">{error}</p>
          ) : (
            <p className="text-secondary-500">{helperText}</p>
          )}
        </div>
      )}
    </div>
  );
});

Textarea.displayName = 'Textarea';

export default Input;