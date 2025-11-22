export default function Checkbox({ className = '', ...props }) {
    return (
        <input
            {...props}
            type="checkbox"
            className={
                'rounded border border-[var(--input-border)] bg-[var(--input-bg)] text-[var(--primary-600)] shadow-sm focus:ring-2 focus:ring-[var(--input-focus-ring)] disabled:opacity-50 disabled:cursor-not-allowed ' +
                className
            }
        />
    );
}
