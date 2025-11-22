export default function StatusBadge({ status, size = 'md' }) {
    const isActive = status === 'active' || status === true || status === 1;
    
    const sizeClasses = {
        sm: 'px-2 py-0.5 text-xs',
        md: 'px-2.5 py-1 text-sm',
        lg: 'px-3 py-1.5 text-base',
    };

    const baseClasses = 'inline-flex items-center font-medium rounded-full';
    const statusClasses = isActive
        ? 'bg-green-100 text-green-800'
        : 'bg-red-100 text-red-800';

    return (
        <span className={`${baseClasses} ${sizeClasses[size]} ${statusClasses}`}>
            <span className={`w-1.5 h-1.5 mr-1.5 rounded-full ${isActive ? 'bg-green-600' : 'bg-red-600'}`}></span>
            {isActive ? 'Active' : 'Inactive'}
        </span>
    );
}