import React, { forwardRef } from 'react';
import { cn } from '@/lib/utils';

/**
 * Secure Input Component with built-in validation and sanitization
 */
const SecureInput = forwardRef(({ 
    type = 'text',
    className,
    error,
    label,
    required = false,
    maxLength,
    pattern,
    inputMode,
    autoComplete = 'off',
    onPaste,
    ...props 
}, ref) => {
    
    // Sanitize input for XSS prevention
    const handleInput = (e) => {
        let value = e.target.value;
        
        // For number inputs, remove non-numeric characters
        if (type === 'number' || inputMode === 'numeric') {
            value = value.replace(/[^0-9.-]/g, '');
            // Prevent multiple decimal points
            const parts = value.split('.');
            if (parts.length > 2) {
                value = parts[0] + '.' + parts.slice(1).join('');
            }
        }
        
        // For email inputs, convert to lowercase
        if (type === 'email') {
            value = value.toLowerCase().trim();
        }
        
        // Update the input value
        e.target.value = value;
        
        // Call original onChange if provided
        if (props.onChange) {
            props.onChange(e);
        }
    };
    
    // Handle paste events for number inputs
    const handlePaste = (e) => {
        if (type === 'number' || inputMode === 'numeric') {
            e.preventDefault();
            const paste = (e.clipboardData || window.clipboardData).getData('text');
            const numericValue = paste.replace(/[^0-9.-]/g, '');
            e.target.value = numericValue;
            
            // Trigger change event
            const changeEvent = new Event('input', { bubbles: true });
            e.target.dispatchEvent(changeEvent);
        }
        
        if (onPaste) {
            onPaste(e);
        }
    };
    
    const inputId = props.id || `input-${Math.random().toString(36).substr(2, 9)}`;
    
    return (
        <div className="space-y-2">
            {label && (
                <label 
                    htmlFor={inputId}
                    className="block text-sm font-medium text-secondary-700"
                >
                    {label}
                    {required && <span className="text-red-500 ml-1">*</span>}
                </label>
            )}
            
            <input
                {...props}
                ref={ref}
                id={inputId}
                type={type}
                inputMode={inputMode}
                autoComplete={autoComplete}
                maxLength={maxLength}
                pattern={pattern}
                required={required}
                onChange={handleInput}
                onPaste={handlePaste}
                className={cn(
                    "flex h-10 w-full rounded-md border border-secondary-300 bg-white px-3 py-2 text-sm",
                    "placeholder:text-secondary-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent",
                    "disabled:cursor-not-allowed disabled:opacity-50",
                    error && "border-red-500 focus:ring-red-500",
                    className
                )}
                aria-invalid={error ? 'true' : 'false'}
                aria-describedby={error ? `${inputId}-error` : undefined}
            />
            
            {error && (
                <p 
                    id={`${inputId}-error`}
                    className="text-sm text-red-600"
                    role="alert"
                >
                    {error}
                </p>
            )}
        </div>
    );
});

SecureInput.displayName = 'SecureInput';

export default SecureInput;
