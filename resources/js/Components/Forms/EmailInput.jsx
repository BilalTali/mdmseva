import React, { forwardRef } from 'react';
import SecureInput from './SecureInput';

/**
 * Secure Email Input Component
 */
const EmailInput = forwardRef(({ 
    ...props 
}, ref) => {
    
    const validateEmail = (email) => {
        // RFC 5322 compliant email regex (simplified)
        const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
        return emailRegex.test(email);
    };
    
    const handleBlur = (e) => {
        const email = e.target.value.trim().toLowerCase();
        
        if (email && !validateEmail(email)) {
            // Set custom validity message
            e.target.setCustomValidity('Please enter a valid email address');
        } else {
            e.target.setCustomValidity('');
        }
        
        if (props.onBlur) {
            props.onBlur(e);
        }
    };
    
    return (
        <SecureInput
            {...props}
            ref={ref}
            type="email"
            inputMode="email"
            autoComplete="email"
            maxLength={255}
            pattern="[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$"
            onBlur={handleBlur}
        />
    );
});

EmailInput.displayName = 'EmailInput';

export default EmailInput;
