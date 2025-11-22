import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';

export default forwardRef(function TextInput(
    { type = 'text', className = '', isFocused = false, ...props },
    ref,
) {
    const localRef = useRef(null);

    useImperativeHandle(ref, () => ({
        focus: () => localRef.current?.focus(),
    }));

    useEffect(() => {
        if (isFocused) {
            localRef.current?.focus();
        }
    }, [isFocused]);

    return (
        <input
            {...props}
            type={type}
            className={
                'rounded-lg border border-[var(--input-border)] shadow-sm focus:border-[var(--primary-500)] focus:ring-2 focus:ring-[var(--input-focus-ring)] bg-[var(--input-bg)] text-[var(--text-primary)] transition-all duration-200 disabled:bg-[var(--input-disabled-bg)] disabled:cursor-not-allowed ' +
                className
            }
            ref={localRef}
        />
    );
});