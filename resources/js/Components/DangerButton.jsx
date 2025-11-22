export default function DangerButton({
    className = '',
    disabled,
    children,
    ...props
}) {
    return (
        <button
            {...props}
            className={
                `inline-flex items-center rounded-md border border-transparent bg-[var(--color-danger)] px-4 py-2 text-xs font-semibold uppercase tracking-widest text-white transition duration-150 ease-in-out hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-[var(--color-danger)] focus:ring-offset-2 active:opacity-80 disabled:opacity-50 disabled:cursor-not-allowed ${className
                }`
            }
            disabled={disabled}
        >
            {children}
        </button>
    );
}
