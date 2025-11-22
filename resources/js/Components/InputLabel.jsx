export default function InputLabel({
    value,
    className = '',
    children,
    ...props
}) {
    return (
        <label
            {...props}
            className={
                `block text-sm font-semibold text-[var(--text-secondary)] mb-1 ` +
                className
            }
        >
            {value ? value : children}
        </label>
    );
}