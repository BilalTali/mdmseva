export default function PrimaryButton({
    className = '',
    disabled,
    children,
    ...props
}) {
    return (
        <button
            {...props}
            className={
                `inline-flex items-center rounded-lg px-6 py-3 bg-gradient-to-r from-[var(--primary-600)] to-[var(--primary-700)] font-semibold text-sm text-white uppercase tracking-widest shadow-lg hover:shadow-xl hover:from-[var(--primary-700)] hover:to-[var(--primary-800)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-500)] focus:ring-offset-2 active:from-[var(--primary-800)] active:to-[var(--primary-900)] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${className
                }`
            }
            disabled={disabled}
        >
            {children}
        </button>
    );
}