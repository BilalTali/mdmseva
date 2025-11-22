import React, { forwardRef } from 'react';
import SecureInput from './SecureInput';

/**
 * Secure Number Input Component
 */
const NumberInput = forwardRef(({ 
    min = 0,
    max,
    step = 1,
    decimals = 2,
    ...props 
}, ref) => {
    
    const handleKeyDown = (e) => {
        // Allow: backspace, delete, tab, escape, enter
        if ([8, 9, 27, 13, 46].indexOf(e.keyCode) !== -1 ||
            // Allow: Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X
            (e.keyCode === 65 && e.ctrlKey === true) ||
            (e.keyCode === 67 && e.ctrlKey === true) ||
            (e.keyCode === 86 && e.ctrlKey === true) ||
            (e.keyCode === 88 && e.ctrlKey === true) ||
            // Allow: home, end, left, right
            (e.keyCode >= 35 && e.keyCode <= 39)) {
            return;
        }
        
        // Ensure that it is a number and stop the keypress
        if ((e.shiftKey || (e.keyCode < 48 || e.keyCode > 57)) && (e.keyCode < 96 || e.keyCode > 105)) {
            // Allow decimal point
            if (decimals > 0 && (e.keyCode === 190 || e.keyCode === 110)) {
                // Only allow one decimal point
                if (e.target.value.indexOf('.') !== -1) {
                    e.preventDefault();
                }
                return;
            }
            // Allow minus sign for negative numbers (if min < 0)
            if (min < 0 && (e.keyCode === 189 || e.keyCode === 109)) {
                // Only allow at the beginning
                if (e.target.selectionStart !== 0) {
                    e.preventDefault();
                }
                return;
            }
            e.preventDefault();
        }
    };
    
    const handleBlur = (e) => {
        let value = parseFloat(e.target.value);
        
        if (isNaN(value)) {
            value = min || 0;
        }
        
        // Apply min/max constraints
        if (min !== undefined && value < min) {
            value = min;
        }
        if (max !== undefined && value > max) {
            value = max;
        }
        
        // Round to specified decimals
        value = Math.round(value * Math.pow(10, decimals)) / Math.pow(10, decimals);
        
        e.target.value = value.toFixed(decimals);
        
        if (props.onBlur) {
            props.onBlur(e);
        }
    };
    
    return (
        <SecureInput
            {...props}
            ref={ref}
            type="number"
            inputMode="decimal"
            min={min}
            max={max}
            step={step}
            onKeyDown={handleKeyDown}
            onBlur={handleBlur}
            autoComplete="off"
        />
    );
});

NumberInput.displayName = 'NumberInput';

export default NumberInput;
