
// File: resources/js/Pages/Dashboard/components/RecentConsumptions.jsx

import React, { useState, useEffect } from 'react';
import { Calendar, Users, Package, RefreshCw } from 'lucide-react';

/**
 * RecentConsumptions Component
 * 
 * Displays a list of recent daily consumption records with pagination
 * Shows Primary/Middle breakdown based on school type
 * 
 * @param {number} selectedMonth - Currently selected month (1-12)
 * @param {number} selectedYear - Currently selected year
 * @param {string} schoolType - 'primary', 'middle', or 'both'
 * @param {number} limit - Number of records to show per page (default: 10)
 * @param {boolean} showPagination - Whether to show pagination controls (default: true)
 */
const RecentConsumptions = ({
    selectedMonth,
    selectedYear,
    schoolType = 'both',
    limit = 10,
    showPagination = true
}) => {
    const [consumptions, setConsumptions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [refreshing, setRefreshing] = useState(false);

    // Determine which sections to show
    const hasPrimary = schoolType === 'primary' || schoolType === 'middle';
    const hasMiddle = schoolType === 'middle';

    // Fetch recent consumptions
    const fetchConsumptions = async (page = 1) => {
        try {
            setLoading(page === 1);
            setRefreshing(page !== 1);

            const params = new URLSearchParams({
                per_page: limit,
                page: page,
            });

            if (selectedMonth) params.append('month', selectedMonth);
            if (selectedYear) params.append('year', selectedYear);

            const response = await fetch(
                `/ api / dashboard / recent ? ${params} `,
                {
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json',
                    },
                    credentials: 'include'
                }
            );

            if (!response.ok) {
                throw new Error('Failed to fetch recent consumptions');
            }

            const data = await response.json();

            setConsumptions(data.data || []);
            setCurrentPage(data.current_page || 1);
            setTotalPages(data.last_page || 1);
            setError(null);
        } catch (err) {
            console.error('Error fetching consumptions:', err);
            setError(err.message);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    // Load data on mount and when filters change
    useEffect(() => {
        fetchConsumptions(1);
    }, [selectedMonth, selectedYear, limit]);

    // Format date
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        const options = {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        };
        return date.toLocaleDateString('en-IN', options);
    };

    // Format day name
    const formatDay = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-IN', { weekday: 'short' });
    };

    // Calculate total students served
    const getTotalStudents = (consumption) => {
        return (consumption.served_primary || 0) + (consumption.served_middle || 0);
    };

    // Handle page change
    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            fetchConsumptions(newPage);
        }
    };

    // Handle refresh
    const handleRefresh = () => {
        fetchConsumptions(currentPage);
    };

    // Loading state
    if (loading) {
        return (
            <div className="bg-[var(--surface-00)] rounded-lg shadow p-6 transition-colors duration-200">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-[var(--text-primary)]">Recent Consumptions</h3>
                </div>
                <div className="space-y-3">
                    {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="border border-[var(--border-light)] rounded-lg p-4 animate-pulse">
                            <div className="flex items-center justify-between">
                                <div className="flex-1">
                                    <div className="h-4 bg-[var(--surface-10)] rounded w-32 mb-2"></div>
                                    <div className="h-3 bg-[var(--surface-10)] rounded w-48"></div>
                                </div>
                                <div className="h-6 bg-[var(--surface-10)] rounded w-20"></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="bg-[var(--surface-00)] rounded-lg shadow p-6 transition-colors duration-200">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-[var(--text-primary)]">Recent Consumptions</h3>
                </div>
                <div className="text-center py-8">
                    <div className="text-[var(--color-danger)] mb-2">
                        <svg className="h-12 w-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <p className="text-[var(--text-secondary)] mb-4">{error}</p>
                    <button
                        onClick={handleRefresh}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    // Empty state
    if (!consumptions || consumptions.length === 0) {
        return (
            <div className="bg-[var(--surface-00)] rounded-lg shadow p-6 transition-colors duration-200">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-[var(--text-primary)]">Recent Consumptions</h3>
                    <button
                        onClick={handleRefresh}
                        disabled={refreshing}
                        className="p-2 hover:bg-[var(--surface-10)] rounded-md transition-colors"
                        title="Refresh"
                    >
                        <RefreshCw className={`h - 4 w - 4 text - gray - 600 dark: text - gray - 400 ${refreshing ? 'animate-spin' : ''} `} />
                    </button>
                </div>
                <div className="text-center py-12 bg-gray-50  rounded-lg">
                    <Package className="h-12 w-12 text-[var(--text-muted)] mx-auto mb-4" />
                    <p className="text-[var(--text-tertiary)] font-medium mb-2">No consumption records yet</p>
                    <p className="text-sm text-[var(--text-muted)]">Start adding daily consumption data to see records here</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-[var(--surface-00)] rounded-lg shadow p-6 transition-colors duration-200">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-[var(--text-primary)]">Recent Consumptions</h3>
                <button
                    onClick={handleRefresh}
                    disabled={refreshing}
                    className="p-2 hover:bg-[var(--surface-10)] rounded-md transition-colors"
                    title="Refresh"
                >
                    <RefreshCw className={`h - 4 w - 4 text - gray - 600 dark: text - gray - 400 ${refreshing ? 'animate-spin' : ''} `} />
                </button>
            </div>

            {/* Consumptions list */}
            <div className="space-y-3">
                {consumptions.map((consumption) => (
                    <div
                        key={consumption.id}
                        className="border border-[var(--border-light)] rounded-lg p-4 hover:border-blue-300  hover:shadow-sm transition-all duration-200"
                    >
                        <div className="flex items-center justify-between">
                            {/* Left side: Date and details */}
                            <div className="flex items-start gap-3 flex-1">
                                {/* Date badge */}
                                <div className="flex flex-col items-center justify-center bg-[var(--primary-50)] rounded-lg px-3 py-2 min-w-[70px]">
                                    <span className="text-xs font-medium text-blue-600  uppercase">
                                        {consumption.day || formatDay(consumption.date)}
                                    </span>
                                    <span className="text-lg font-bold text-[var(--primary-900)]">
                                        {new Date(consumption.date).getDate()}
                                    </span>
                                    <span className="text-xs text-blue-600 ">
                                        {new Date(consumption.date).toLocaleDateString('en-IN', { month: 'short' })}
                                    </span>
                                </div>

                                {/* Details */}
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <Calendar className="h-4 w-4 text-[var(--text-muted)]" />
                                        <span className="text-sm font-medium text-[var(--text-primary)]">
                                            {formatDate(consumption.date)}
                                        </span>
                                    </div>

                                    <div className="flex flex-wrap items-center gap-4 text-sm text-[var(--text-secondary)]">
                                        <div className="flex items-center gap-1">
                                            <Users className="h-4 w-4 text-[var(--text-muted)]" />
                                            <span>{getTotalStudents(consumption)} students</span>
                                            {hasPrimary && hasMiddle && consumption.served_primary > 0 && consumption.served_middle > 0 && (
                                                <span className="text-xs text-[var(--text-muted)] ml-1">
                                                    (P: {consumption.served_primary}, M: {consumption.served_middle})
                                                </span>
                                            )}
                                        </div>

                                        <div className="flex items-center gap-1">
                                            <Package className="h-4 w-4 text-[var(--text-muted)]" />
                                            <span>{consumption.rice_consumed} kg rice</span>
                                        </div>
                                    </div>

                                    {consumption.remarks && (
                                        <p className="text-xs text-[var(--text-tertiary)] mt-2 italic">
                                            {consumption.remarks}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Right side: Amount */}
                            <div className="flex flex-col items-end gap-1">
                                <span className="text-lg font-bold text-[var(--text-primary)]">
                                    ₹{parseFloat(consumption.amount_consumed).toFixed(2)}
                                </span>
                                <span className="text-xs text-[var(--text-tertiary)]">
                                    Total spent
                                </span>

                                {/* Show breakdown if both sections exist */}
                                {hasPrimary && hasMiddle && consumption.served_primary > 0 && consumption.served_middle > 0 && (
                                    <div className="text-xs text-[var(--text-muted)] mt-1">
                                        <div>P: ₹{(consumption.served_primary * 0.1 * 5).toFixed(0)}</div>
                                        <div>M: ₹{(consumption.served_middle * 0.15 * 5).toFixed(0)}</div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Pagination */}
            {showPagination && totalPages > 1 && (
                <div className="mt-6 flex items-center justify-between border-t border-[var(--border-light)] pt-4">
                    <div className="text-sm text-[var(--text-secondary)]">
                        Page {currentPage} of {totalPages}
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                            className={`px - 3 py - 2 rounded - md text - sm font - medium transition - colors ${currentPage === 1
                                ? 'bg-gray-100 dark:bg-gray-900 text-gray-400 dark:text-gray-600 cursor-not-allowed'
                                : 'bg-[var(--surface-00)] border border-[var(--border-light)] text-[var(--text-secondary)] hover:bg-[var(--surface-10)]'
                                } `}
                        >
                            Previous
                        </button>

                        <button
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            className={`px - 3 py - 2 rounded - md text - sm font - medium transition - colors ${currentPage === totalPages
                                ? 'bg-gray-100 dark:bg-gray-900 text-gray-400 dark:text-gray-600 cursor-not-allowed'
                                : 'bg-[var(--surface-00)] border border-[var(--border-light)] text-[var(--text-secondary)] hover:bg-[var(--surface-10)]'
                                } `}
                        >
                            Next
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RecentConsumptions;
