import React, { forwardRef, useState } from 'react';
import { Eye, EyeOff, Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Secure Password Input Component with strength indicator
 */
const PasswordInput = forwardRef(({ 
    className,
    error,
    label = 'Password',
    required = false,
    showStrength = false,
    minLength = 8,
    ...props 
}, ref) => {
    
    const [showPassword, setShowPassword] = useState(false);
    const [password, setPassword] = useState('');
    
    const passwordRequirements = [
        { regex: /.{8,}/, text: 'At least 8 characters' },
        { regex: /[a-z]/, text: 'One lowercase letter' },
        { regex: /[A-Z]/, text: 'One uppercase letter' },
        { regex: /\d/, text: 'One number' },
        { regex: /[^A-Za-z0-9]/, text: 'One special character' }
    ];
    
    const checkRequirement = (requirement) => {
        return requirement.regex.test(password);
    };
    
    const getPasswordStrength = () => {
        const metRequirements = passwordRequirements.filter(req => checkRequirement(req)).length;
        if (metRequirements < 2) return { level: 'weak', color: 'bg-red-500', text: 'Weak' };
        if (metRequirements < 4) return { level: 'medium', color: 'bg-yellow-500', text: 'Medium' };
        if (metRequirements < 5) return { level: 'strong', color: 'bg-blue-500', text: 'Strong' };
        return { level: 'very-strong', color: 'bg-green-500', text: 'Very Strong' };
    };
    
    const handleChange = (e) => {
        const value = e.target.value;
        setPassword(value);
        
        if (props.onChange) {
            props.onChange(e);
        }
    };
    
    const inputId = props.id || `password-${Math.random().toString(36).substr(2, 9)}`;
    const strength = getPasswordStrength();
    
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
            
            <div className="relative">
                <input
                    {...props}
                    ref={ref}
                    id={inputId}
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    minLength={minLength}
                    required={required}
                    onChange={handleChange}
                    className={cn(
                        "flex h-10 w-full rounded-md border border-secondary-300 bg-white px-3 py-2 pr-10 text-sm",
                        "placeholder:text-secondary-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent",
                        "disabled:cursor-not-allowed disabled:opacity-50",
                        error && "border-red-500 focus:ring-red-500",
                        className
                    )}
                    aria-invalid={error ? 'true' : 'false'}
                    aria-describedby={error ? `${inputId}-error` : showStrength ? `${inputId}-strength` : undefined}
                />
                
                <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-secondary-400 hover:text-secondary-600"
                    tabIndex={-1}
                >
                    {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                    ) : (
                        <Eye className="h-4 w-4" />
                    )}
                </button>
            </div>
            
            {showStrength && password && (
                <div id={`${inputId}-strength`} className="space-y-2">
                    <div className="flex items-center space-x-2">
                        <div className="flex-1 bg-secondary-200 rounded-full h-2">
                            <div 
                                className={cn("h-2 rounded-full transition-all", strength.color)}
                                style={{ width: `${(passwordRequirements.filter(req => checkRequirement(req)).length / passwordRequirements.length) * 100}%` }}
                            />
                        </div>
                        <span className="text-xs font-medium text-secondary-600">
                            {strength.text}
                        </span>
                    </div>
                    
                    <div className="grid grid-cols-1 gap-1 text-xs">
                        {passwordRequirements.map((requirement, index) => (
                            <div key={index} className="flex items-center space-x-2">
                                {checkRequirement(requirement) ? (
                                    <Check className="h-3 w-3 text-green-500" />
                                ) : (
                                    <X className="h-3 w-3 text-red-500" />
                                )}
                                <span className={checkRequirement(requirement) ? 'text-green-600' : 'text-secondary-500'}>
                                    {requirement.text}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
            
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

PasswordInput.displayName = 'PasswordInput';

export default PasswordInput;
