import React from 'react';

/**
 * SaltBreakdownDisplay Component
 * 
 * Displays salt subcategory breakdown in a read-only format.
 * Used in reports and view pages to show calculated salt amounts.
 * 
 * Props:
 * - breakdown: object with salt subcategory amounts
 * - total: total salt amount
 * - section: 'primary' or 'middle' (for styling)
 * - showPercentages: boolean to show percentage alongside amounts
 */
export default function SaltBreakdownDisplay({ 
    breakdown = {}, 
    total = 0, 
    section = 'primary',
    showPercentages = false 
}) {
    const subcategories = [
        { key: 'common_salt', label: 'Common Salt', icon: '🧂' },
        { key: 'chilli_powder', label: 'Chilli Powder', icon: '🌶️' },
        { key: 'turmeric', label: 'Turmeric', icon: '💛' },
        { key: 'coriander', label: 'Ingredients', icon: '🌿' },
        { key: 'other_condiments', label: 'Other Condiments', icon: '🧄' },
    ];

    const calculatePercentage = (amount) => {
        if (total === 0) return 0;
        return ((amount / total) * 100).toFixed(1);
    };

    return (
        <div className="space-y-3">
            {/* Header */}
            <div className="flex items-center justify-between pb-2 border-b border-gray-200">
                <h4 className="text-sm font-semibold text-gray-700 capitalize">
                    {section} Salt Breakdown
                </h4>
                <span className="text-sm font-medium text-gray-900">
                    Total: ₹{total.toFixed(2)}
                </span>
            </div>

            {/* Breakdown items */}
            <div className="space-y-2">
                {subcategories.map((sub) => {
                    const amount = parseFloat(breakdown[sub.key]) || 0;
                    const percentage = calculatePercentage(amount);

                    return (
                        <div 
                            key={sub.key}
                            className="flex items-center justify-between p-2 bg-gray-50 rounded-md hover:bg-gray-100 transition-colors"
                        >
                            <div className="flex items-center space-x-2">
                                <span className="text-lg">{sub.icon}</span>
                                <span className="text-sm font-medium text-gray-700">
                                    {sub.label}
                                </span>
                            </div>
                            
                            <div className="flex items-center space-x-3">
                                {showPercentages && (
                                    <span className="text-xs text-gray-500">
                                        {percentage}%
                                    </span>
                                )}
                                <span className="text-sm font-semibold text-gray-900 min-w-[80px] text-right">
                                    ₹{amount.toFixed(2)}
                                </span>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Visual chart */}
            <div className="mt-4">
                <div className="h-8 flex rounded-lg overflow-hidden shadow-sm">
                    {subcategories.map((sub, index) => {
                        const amount = parseFloat(breakdown[sub.key]) || 0;
                        const percentage = calculatePercentage(amount);
                        
                        const colors = ['bg-blue-500', 'bg-red-500', 'bg-yellow-500', 'bg-green-500', 'bg-purple-500'];
                        
                        return percentage > 0 ? (
                            <div
                                key={sub.key}
                                className={`${colors[index]} flex items-center justify-center text-white text-xs font-medium transition-all duration-300`}
                                style={{ width: `${percentage}%` }}
                                title={`${sub.label}: ${percentage}%`}
                            >
                                {percentage > 10 && `${percentage}%`}
                            </div>
                        ) : null;
                    })}
                </div>
            </div>
        </div>
    );
}