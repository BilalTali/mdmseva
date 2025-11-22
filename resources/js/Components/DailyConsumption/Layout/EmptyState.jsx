// File: resources/js/Components/DailyConsumption/Layout/EmptyState.jsx

import React from 'react';
import { Link } from '@inertiajs/react';
import { Calendar, Plus, FileText, Database } from 'lucide-react';

/**
 * EmptyState Component
 * 
 * Displays when no consumption records exist
 * Provides helpful guidance and quick actions
 */
export default function EmptyState({ 
    variant = 'default',
    showAddButton = true,
    addButtonRoute = 'daily-consumption.create',
    className = ''
}) {
    const variants = {
        default: {
            icon: Calendar,
            title: 'No Consumption Records Yet',
            description: 'Start tracking your daily rice consumption by adding your first entry.',
            iconBg: 'bg-blue-100',
            iconColor: 'text-blue-600'
        },
        filtered: {
            icon: FileText,
            title: 'No Records Found',
            description: 'No consumption records match your current filters. Try adjusting your search criteria.',
            iconBg: 'bg-gray-100',
            iconColor: 'text-gray-600'
        },
        error: {
            icon: Database,
            title: 'Unable to Load Records',
            description: 'There was a problem loading your consumption records. Please try refreshing the page.',
            iconBg: 'bg-red-100',
            iconColor: 'text-red-600'
        }
    };

    const { icon: Icon, title, description, iconBg, iconColor } = variants[variant];

    return (
        <div className={`bg-white rounded-lg shadow-sm border border-gray-200 ${className}`}>
            <div className="text-center py-16 px-6">
                {/* Icon */}
                <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full ${iconBg} mb-6`}>
                    <Icon className={`w-10 h-10 ${iconColor}`} />
                </div>

                {/* Title */}
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    {title}
                </h3>

                {/* Description */}
                <p className="text-gray-600 max-w-md mx-auto mb-8">
                    {description}
                </p>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                    {showAddButton && variant === 'default' && (
                        <Link
                            href={route(addButtonRoute)}
                            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors shadow-sm"
                        >
                            <Plus className="w-5 h-5 mr-2" />
                            Add First Entry
                        </Link>
                    )}

                    {variant === 'error' && (
                        <button
                            onClick={() => window.location.reload()}
                            className="inline-flex items-center px-6 py-3 bg-gray-600 text-white rounded-lg text-sm font-medium hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
                        >
                            Refresh Page
                        </button>
                    )}
                </div>

                {/* Help Text */}
                {variant === 'default' && (
                    <div className="mt-8 pt-8 border-t border-gray-200">
                        <h4 className="text-sm font-medium text-gray-900 mb-3">
                            Getting Started
                        </h4>
                        <ul className="text-sm text-gray-600 space-y-2 max-w-lg mx-auto text-left">
                            <li className="flex items-start">
                                <span className="inline-block w-5 h-5 rounded-full bg-blue-100 text-blue-600 text-xs font-semibold flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">
                                    1
                                </span>
                                <span>Click "Add Entry" to create your first consumption record</span>
                            </li>
                            <li className="flex items-start">
                                <span className="inline-block w-5 h-5 rounded-full bg-blue-100 text-blue-600 text-xs font-semibold flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">
                                    2
                                </span>
                                <span>Enter the number of students served and rice consumed</span>
                            </li>
                            <li className="flex items-start">
                                <span className="inline-block w-5 h-5 rounded-full bg-blue-100 text-blue-600 text-xs font-semibold flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">
                                    3
                                </span>
                                <span>Track your opening and remaining balance automatically</span>
                            </li>
                        </ul>
                    </div>
                )}
            </div>
        </div>
    );
}