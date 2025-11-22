export default function SecondaryButton({
    type = 'button',
    className = '',
    disabled,
    children,
    ...props
}) {
    return (
        <button
            {...props}
            type={type}
            className={
                `inline-flex items-center rounded-md border border-[var(--border-medium)] bg-[var(--surface-00)] px-4 py-2 text-xs font-semibold uppercase tracking-widest text-[var(--text-secondary)] shadow-sm transition duration-150 ease-in-out hover:bg-[var(--surface-10)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-500)] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${
                    className
                }`
            }
            disabled={disabled}
        >
            {children}
        </button>
    );
}
