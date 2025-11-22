import React, { useEffect, useState } from 'react';

/**
 * SaltSubcategoryInputs Component
 * 
 * Displays 5 percentage input fields for salt subcategories.
 * Validates that the sum equals 100% and shows visual feedback.
 * Computes actual amounts based on total salt per student.
 * 
 * Props:
 * - section: 'primary' or 'middle'
 * - values: object with percentage values
 * - onChange: callback(field, value)
 * - totalSaltPerStudent: total salt amount per student
 * - errors: validation errors object
 */
export default function SaltSubcategoryInputs({ 
    section = 'primary', 
    values = {}, 
    onChange, 
    totalSaltPerStudent = 0,
    errors = {} 
}) {
    const [percentageTotal, setPercentageTotal] = useState(0);
    const [isValid, setIsValid] = useState(true);

    const subcategories = [
        { key: 'common_salt', label: 'Common Salt', color: 'blue' },
        { key: 'chilli_powder', label: 'Chilli Powder', color: 'red' },
        { key: 'turmeric', label: 'Turmeric', color: 'yellow' },
        { key: 'coriander', label: 'Coriander', color: 'green' },
        { key: 'other_condiments', label: 'Other Condiments', color: 'purple' },
    ];

    // Calculate percentage total whenever values change
    useEffect(() => {
        const total = subcategories.reduce((sum, sub) => {
            const fieldName = `salt_percentage_${sub.key}_${section}`;
            return sum + (parseFloat(values[fieldName]) || 0);
        }, 0);

        setPercentageTotal(total);
        setIsValid(Math.abs(total - 100) < 0.01);
    }, [values, section]);

    // Calculate amount for a subcategory
    const calculateAmount = (percentage) => {
        const amount = (totalSaltPerStudent * percentage) / 100;
        return amount.toFixed(2);
    };

    const handleChange = (fieldName, value) => {
        // Ensure value is between 0 and 100
        const numValue = parseFloat(value) || 0;
        const clampedValue = Math.max(0, Math.min(100, numValue));
        onChange(fieldName, clampedValue);
    };

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium text-gray-700 capitalize">
                    {section} Section - Salt Breakdown
                </h4>
                <div className={`text-sm font-semibold ${
                    isValid ? 'text-green-600' : 'text-red-600'
                }`}>
                    Total: {percentageTotal.toFixed(2)}%
                    {isValid && <span className="ml-2">✓</span>}
                    {!isValid && <span className="ml-2">✗</span>}
                </div>
            </div>

            {/* Error message if sum is not 100% */}
            {!isValid && (
                <div className="bg-red-50 border border-red-200 rounded-md p-3">
                    <p className="text-sm text-red-700">
                        Salt percentages must sum to 100%. Current total: {percentageTotal.toFixed(2)}%
                    </p>
                </div>
            )}

            {/* Display validation errors from server */}
            {errors[`salt_percentage_${section}`] && (
                <div className="bg-red-50 border border-red-200 rounded-md p-3">
                    <p className="text-sm text-red-700">
                        {errors[`salt_percentage_${section}`]}
                    </p>
                </div>
            )}

            {/* Input fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {subcategories.map((sub) => {
                    const fieldName = `salt_percentage_${sub.key}_${section}`;
                    const percentage = parseFloat(values[fieldName]) || 0;
                    const amount = calculateAmount(percentage);

                    return (
                        <div key={sub.key} className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">
                                {sub.label}
                            </label>
                            
                            <div className="flex items-center space-x-2">
                                {/* Percentage input */}
                                <div className="flex-1">
                                    <div className="relative">
                                        <input
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            max="100"
                                            value={percentage}
                                            onChange={(e) => handleChange(fieldName, e.target.value)}
                                            className={`block w-full rounded-md border-gray-300 shadow-sm 
                                                focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm
                                                ${errors[fieldName] ? 'border-red-300' : ''}`}
                                        />
                                        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                            <span className="text-gray-500 sm:text-sm">%</span>
                                        </div>
                                    </div>
                                    {errors[fieldName] && (
                                        <p className="mt-1 text-xs text-red-600">{errors[fieldName]}</p>
                                    )}
                                </div>

                                {/* Calculated amount display */}
                                {totalSaltPerStudent > 0 && (
                                    <div className="flex-shrink-0 w-24">
                                        <div className="text-right">
                                            <div className="text-xs text-gray-500">Amount</div>
                                            <div className="text-sm font-medium text-gray-900">
                                                ₹{amount}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Visual percentage bar */}
                            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                <div 
                                    className={`h-full bg-${sub.color}-500 transition-all duration-300`}
                                    style={{ width: `${percentage}%` }}
                                />
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Total salt per student display */}
            {totalSaltPerStudent > 0 && (
                <div className="mt-4 p-3 bg-gray-50 rounded-md">
                    <div className="flex justify-between items-center text-sm">
                        <span className="font-medium text-gray-700">
                            Total Salt per Student ({section}):
                        </span>
                        <span className="font-semibold text-gray-900">
                            ₹{totalSaltPerStudent.toFixed(2)}
                        </span>
                    </div>
                </div>
            )}

            {/* Quick preset buttons */}
            <div className="mt-4 flex flex-wrap gap-2">
                <button
                    type="button"
                    onClick={() => {
                        onChange(`salt_percentage_common_salt_${section}`, 30);
                        onChange(`salt_percentage_chilli_powder_${section}`, 20);
                        onChange(`salt_percentage_turmeric_${section}`, 20);
                        onChange(`salt_percentage_coriander_${section}`, 15);
                        onChange(`salt_percentage_other_condiments_${section}`, 15);
                    }}
                    className="px-3 py-1 text-xs font-medium text-indigo-700 bg-indigo-50 
                        rounded-md hover:bg-indigo-100 transition-colors"
                >
                    Use Default (30/20/20/15/15)
                </button>
                
                <button
                    type="button"
                    onClick={() => {
                        subcategories.forEach(sub => {
                            onChange(`salt_percentage_${sub.key}_${section}`, 20);
                        });
                    }}
                    className="px-3 py-1 text-xs font-medium text-gray-700 bg-gray-50 
                        rounded-md hover:bg-gray-100 transition-colors"
                >
                    Equal Split (20% each)
                </button>
            </div>
        </div>
    );
}