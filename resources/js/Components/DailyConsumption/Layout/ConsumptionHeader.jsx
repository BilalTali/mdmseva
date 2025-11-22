// File: resources/js/Components/DailyConsumption/Layout/ConsumptionHeader.jsx

import React from 'react';
import { Link } from '@inertiajs/react';
import { Calendar, Plus, FileText } from 'lucide-react';

/**
 * ConsumptionHeader Component
 * 
 * Displays page header with title, breadcrumbs, and action buttons
 */
export default function ConsumptionHeader({ 
    title = "Daily Consumption Tracking",
    subtitle = "Track and manage daily rice consumption records",  // ✅ NEW: Made dynamic with default
    showAddButton = true,
    showReportsButton = false,
    addButtonRoute = 'daily-consumption.create',
    reportsButtonRoute = 'daily-consumption.reports',
    breadcrumbs = []
}) {
    return (
        <div className="mb-6">
            {/* Breadcrumbs */}
            {breadcrumbs.length > 0 && (
                <nav className="mb-4 text-sm">
                    <ol className="flex items-center space-x-2 text-gray-500">
                        {breadcrumbs.map((crumb, index) => (
                            <React.Fragment key={index}>
                                {index > 0 && (
                                    <span className="text-gray-400">/</span>
                                )}
                                <li>
                                    {crumb.url ? (
                                        <Link 
                                            href={crumb.url}
                                            className="hover:text-blue-600 transition-colors"
                                        >
                                            {crumb.label}
                                        </Link>
                                    ) : (
                                        <span className="text-gray-900 font-medium">
                                            {crumb.label}
                                        </span>
                                    )}
                                </li>
                            </React.Fragment>
                        ))}
                    </ol>
                </nav>
            )}

            {/* Header with Title and Actions */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                {/* Title */}
                <div className="flex items-center">
                    <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-blue-100 mr-4">
                        <Calendar className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">
                            {title}
                        </h1>
                        {/* ✅ MODIFIED: Now uses dynamic subtitle prop */}
                        {subtitle && (
                            <p className="text-sm text-gray-600 mt-1">
                                {subtitle}
                            </p>
                        )}
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-3">
                    {showReportsButton && (
                        <Link
                            href={route(reportsButtonRoute)}
                            className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                        >
                            <FileText className="w-4 h-4 mr-2" />
                            Reports
                        </Link>
                    )}
                    
                    {showAddButton && (
                        <Link
                            href={route(addButtonRoute)}
                            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors shadow-sm"
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            Add Entry
                        </Link>
                    )}
                </div>
            </div>
        </div>
    );
}

/**
 * USAGE EXAMPLES:
 * 
 * // Daily Consumption (uses default subtitle)
 * <ConsumptionHeader
 *     title="Daily Consumption Records"
 *     addButtonRoute="daily-consumptions.create"
 * />
 * 
 * // Rice Report Index (custom subtitle)
 * <ConsumptionHeader
 *     title="Monthly Rice Reports"
 *     subtitle="View and download consolidated monthly reports"
 *     addButtonRoute="rice-reports.create"
 * />
 * 
 * // Rice Report View (dynamic subtitle, no add button)
 * <ConsumptionHeader
 *     title="Rice Consumption Report"
 *     subtitle={`Monthly Report for ${report.period}`}
 *     showAddButton={false}
 * />
 * 
 * // No subtitle at all
 * <ConsumptionHeader
 *     title="Reports"
 *     subtitle={null}
 * />
 */