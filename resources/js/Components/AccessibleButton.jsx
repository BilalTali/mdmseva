import { forwardRef } from 'react';

/**
 * AccessibleButton Component
 * 
 * WCAG 2.1 AA compliant button component with proper ARIA attributes
 * Supports loading states, disabled states, and keyboard navigation
 */
const AccessibleButton = forwardRef(({
    children,
    type = 'button',
    variant = 'primary',
    size = 'md',
    loading = false,
    disabled = false,
    ariaLabel,
    ariaDescribedBy,
    onClick,
    className = '',
    ...props
}, ref) => {
    const baseClasses = 'inline-flex items-center justify-center font-medium rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';

    const variantClasses = {
        primary: 'bg-primary-600 text-white hover:bg-primary-700 focus-visible:ring-primary-500',
        secondary: 'bg-secondary-200 text-secondary-900 hover:bg-secondary-300 focus-visible:ring-secondary-500',
        success: 'bg-success-600 text-white hover:bg-success-700 focus-visible:ring-success-500',
        danger: 'bg-error-600 text-white hover:bg-error-700 focus-visible:ring-error-500',
        outline: 'border-2 border-primary-600 text-primary-600 hover:bg-primary-50 focus-visible:ring-primary-500',
        ghost: 'text-primary-600 hover:bg-primary-50 focus-visible:ring-primary-500',
    };

    const sizeClasses = {
        sm: 'px-3 py-1.5 text-sm',
        md: 'px-4 py-2 text-base',
        lg: 'px-6 py-3 text-lg',
    };

    const classes = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`;

    return (
        <button
            ref={ref}
            type={type}
            className={classes}
            disabled={disabled || loading}
            aria-label={ariaLabel}
            aria-describedby={ariaDescribedBy}
            aria-busy={loading}
            aria-disabled={disabled || loading}
            onClick={onClick}
            {...props}
        >
            {loading && (
                <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
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
            )}
            {loading && <span className="sr-only">Loading...</span>}
            {children}
        </button>
    );
});

AccessibleButton.displayName = 'AccessibleButton';

export default AccessibleButton;

/**
 * Usage Examples:
 * 
 * // Primary button
 * <AccessibleButton onClick={handleClick}>
 *   Submit
 * </AccessibleButton>
 * 
 * // Loading state
 * <AccessibleButton loading={isLoading}>
 *   Save Changes
 * </AccessibleButton>
 * 
 * // With ARIA label for icon-only button
 * <AccessibleButton ariaLabel="Close dialog" variant="ghost">
 *   <XIcon className="h-5 w-5" />
 * </AccessibleButton>
 * 
 * // Disabled state
 * <AccessibleButton disabled>
 *   Cannot Click
 * </AccessibleButton>
 */
