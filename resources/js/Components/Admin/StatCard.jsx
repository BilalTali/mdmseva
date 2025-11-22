export default function StatCard({ 
    title, 
    value, 
    unit = '', 
    icon, 
    color = 'blue',
    subtitle = '',
    trend = null,
    onClick = null
}) {
    const colorClasses = {
        blue: 'bg-blue-50 text-blue-600',
        green: 'bg-green-50 text-green-600',
        orange: 'bg-orange-50 text-orange-600',
        purple: 'bg-purple-50 text-purple-600',
        red: 'bg-red-50 text-red-600',
    };

    const iconBgClass = colorClasses[color] || colorClasses.blue;

    return (
        <div 
            className={`bg-white rounded-lg shadow p-6 ${onClick ? 'cursor-pointer hover:shadow-lg transition-shadow' : ''}`}
            onClick={onClick}
        >
            <div className="flex items-center justify-between">
                <div className="flex-1">
                    <p className="text-sm font-medium text-gray-600 uppercase tracking-wider">
                        {title}
                    </p>
                    <div className="mt-2 flex items-baseline">
                        <p className="text-3xl font-semibold text-gray-900">
                            {value}
                        </p>
                        {unit && (
                            <span className="ml-2 text-lg text-gray-500">
                                {unit}
                            </span>
                        )}
                    </div>
                    {subtitle && (
                        <p className="mt-1 text-sm text-gray-500">
                            {subtitle}
                        </p>
                    )}
                    {trend && (
                        <div className="mt-2 flex items-center">
                            {trend.direction === 'up' ? (
                                <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                                </svg>
                            ) : (
                                <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 12.586V5a1 1 0 012 0v7.586l2.293-2.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                            )}
                            <span className={`ml-1 text-sm ${trend.direction === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                                {trend.value}
                            </span>
                            <span className="ml-1 text-sm text-gray-500">
                                from last period
                            </span>
                        </div>
                    )}
                </div>
                {icon && (
                    <div className={`flex-shrink-0 ${iconBgClass} rounded-full p-3`}>
                        {icon}
                    </div>
                )}
            </div>
        </div>
    );
}