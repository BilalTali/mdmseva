
// File: resources/js/Pages/Dashboard/components/ConsumptionTable.jsx

import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

/**
 * ConsumptionTable Component
 * 
 * Displays paginated consumption records with proper field mapping
 * 
 * @param {number} selectedMonth - Currently selected month (1-12)
 * @param {number} selectedYear - Currently selected year
 * @param {string} schoolType - 'primary', 'middle', or 'both'
 */
const ConsumptionTable = ({ selectedMonth, selectedYear, schoolType = 'both' }) => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalRecords, setTotalRecords] = useState(0);
    const [perPage] = useState(10);

    // Determine which columns to show
    const hasPrimary = schoolType === 'primary' || schoolType === 'middle';
    const hasMiddle = schoolType === 'middle';

    useEffect(() => {
        fetchConsumptions();
    }, [selectedMonth, selectedYear, currentPage]);

    const fetchConsumptions = async () => {
        setLoading(true);
        setError(null);

        try {
            const params = new URLSearchParams({
                page: currentPage,
                per_page: perPage,
            });

            if (selectedMonth) params.append('month', selectedMonth);
            if (selectedYear) params.append('year', selectedYear);

            const response = await fetch(`/ api / dashboard / consumptions ? ${params} `, {
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                credentials: 'include'
            });

            if (!response.ok) throw new Error('Failed to fetch consumptions');

            const result = await response.json();

            setData(result.data || []);
            setCurrentPage(result.current_page || 1);
            setTotalPages(result.last_page || 1);
            setTotalRecords(result.total || 0);
        } catch (err) {
            setError(err.message);
            console.error('Error fetching consumptions:', err);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return 'Invalid Date';
            return date.toLocaleDateString('en-IN', {
                day: '2-digit',
                month: 'short',
                year: 'numeric'
            });
        } catch (error) {
            console.error('Date formatting error:', error);
            return 'Invalid Date';
        }
    };

    const formatDay = (dateString) => {
        if (!dateString) return 'N/A';
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return 'Invalid Date';
            return date.toLocaleDateString('en-IN', { weekday: 'short' });
        } catch (error) {
            return 'N/A';
        }
    };

    const formatNumber = (number) => {
        return new Intl.NumberFormat('en-IN', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(number || 0);
    };

    const goToPage = (page) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

    if (loading) {
        return (
            <div className="bg-[var(--surface-00)] rounded-lg shadow-sm border border-[var(--border-light)] p-8 transition-colors duration-200">
                <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 dark:border-blue-400"></div>
                    <span className="ml-3 text-[var(--text-secondary)]">Loading consumptions...</span>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-[var(--surface-00)] rounded-lg shadow-sm border border-[var(--border-light)] p-6 transition-colors duration-200">
                <div className="text-center text-red-600 ">
                    <p className="font-medium">Error loading data</p>
                    <p className="text-sm mt-1">{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-[var(--surface-00)] rounded-lg shadow-sm border border-[var(--border-light)] transition-colors duration-200">
            {/* Header */}
            <div className="px-6 py-4 border-b border-[var(--border-light)]">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-lg font-semibold text-[var(--text-primary)]">
                            Daily Consumption Records
                        </h3>
                        <p className="text-sm text-[var(--text-tertiary)] mt-1">
                            Showing {data.length > 0 ? ((currentPage - 1) * perPage + 1) : 0} to {Math.min(currentPage * perPage, totalRecords)} of {totalRecords} records
                        </p>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-[var(--border-light)]">
                    <thead className="bg-gray-50 ">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-[var(--text-tertiary)] uppercase tracking-wider">
                                Date
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-[var(--text-tertiary)] uppercase tracking-wider">
                                Day
                            </th>
                            {hasPrimary && (
                                <th className="px-6 py-3 text-right text-xs font-medium text-[var(--text-tertiary)] uppercase tracking-wider">
                                    Primary Students
                                </th>
                            )}
                            {hasMiddle && (
                                <th className="px-6 py-3 text-right text-xs font-medium text-[var(--text-tertiary)] uppercase tracking-wider">
                                    Middle Students
                                </th>
                            )}
                            <th className="px-6 py-3 text-right text-xs font-medium text-[var(--text-tertiary)] uppercase tracking-wider">
                                Rice (kg)
                            </th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-[var(--text-tertiary)] uppercase tracking-wider">
                                Amount (₹)
                            </th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-[var(--text-tertiary)] uppercase tracking-wider">
                                Balance (kg)
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-[var(--surface-00)] divide-y divide-[var(--border-light)]">
                        {data.length === 0 ? (
                            <tr>
                                <td colSpan="7" className="px-6 py-12 text-center">
                                    <div className="text-[var(--text-muted)]">
                                        <p className="text-lg font-medium">No records found</p>
                                        <p className="text-sm mt-1">Try adjusting your filters or add new consumption records</p>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            data.map((record) => (
                                <tr key={record.id} className="hover:bg-[var(--surface-10)]/50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-[var(--text-primary)]">
                                            {formatDate(record.date)}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800  ">
                                            {record.day || formatDay(record.date)}
                                        </span>
                                    </td>
                                    {hasPrimary && (
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900 ">
                                            {record.served_primary || 0}
                                        </td>
                                    )}
                                    {hasMiddle && (
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900 ">
                                            {record.served_middle || 0}
                                        </td>
                                    )}
                                    <td className="px-6 py-4 whitespace-nowrap text-right">
                                        <span className="text-sm font-medium text-[var(--text-primary)]">
                                            {formatNumber(record.rice_consumed)}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right">
                                        <span className="text-sm font-medium text-[var(--color-success)]">
                                            ₹{formatNumber(record.amount_consumed)}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right">
                                        <span className={`text - sm font - medium ${record.rice_balance_after < 50 ? 'text-red-600 ' :
                                            record.rice_balance_after < 100 ? 'text-yellow-600 dark:text-yellow-400' :
                                                'text-[var(--text-primary)]'
                                            } `}>
                                            {formatNumber(record.rice_balance_after)}
                                        </span>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="px-6 py-4 border-t border-[var(--border-light)] bg-gray-50 dark:bg-gray-700/30">
                    <div className="flex items-center justify-between">
                        <div className="text-sm text-[var(--text-secondary)]">
                            Page <span className="font-medium">{currentPage}</span> of{' '}
                            <span className="font-medium">{totalPages}</span>
                        </div>

                        <div className="flex items-center space-x-2">
                            {/* First Page */}
                            <button
                                onClick={() => goToPage(1)}
                                disabled={currentPage === 1}
                                className="p-2 rounded-md border border-[var(--border-light)] bg-[var(--surface-00)] hover:bg-[var(--surface-10)] text-[var(--text-tertiary)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                title="First Page"
                            >
                                <ChevronsLeft className="w-4 h-4" />
                            </button>

                            {/* Previous Page */}
                            <button
                                onClick={() => goToPage(currentPage - 1)}
                                disabled={currentPage === 1}
                                className="p-2 rounded-md border border-[var(--border-light)] bg-[var(--surface-00)] hover:bg-[var(--surface-10)] text-[var(--text-tertiary)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                title="Previous Page"
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </button>

                            {/* Page Numbers */}
                            <div className="flex items-center space-x-1">
                                {[...Array(totalPages)].map((_, index) => {
                                    const page = index + 1;
                                    // Show first, last, current, and adjacent pages
                                    if (
                                        page === 1 ||
                                        page === totalPages ||
                                        (page >= currentPage - 1 && page <= currentPage + 1)
                                    ) {
                                        return (
                                            <button
                                                key={page}
                                                onClick={() => goToPage(page)}
                                                className={`px - 3 py - 1 rounded - md text - sm font - medium transition - colors ${page === currentPage
                                                    ? 'bg-blue-600 text-white'
                                                    : 'bg-[var(--surface-00)] border border-[var(--border-light)] text-[var(--text-secondary)] hover:bg-[var(--surface-10)]'
                                                    } `}
                                            >
                                                {page}
                                            </button>
                                        );
                                    } else if (
                                        page === currentPage - 2 ||
                                        page === currentPage + 2
                                    ) {
                                        return <span key={page} className="px-2 text-[var(--text-muted)]">...</span>;
                                    }
                                    return null;
                                })}
                            </div>

                            {/* Next Page */}
                            <button
                                onClick={() => goToPage(currentPage + 1)}
                                disabled={currentPage === totalPages}
                                className="p-2 rounded-md border border-[var(--border-light)] bg-[var(--surface-00)] hover:bg-[var(--surface-10)] text-[var(--text-tertiary)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                title="Next Page"
                            >
                                <ChevronRight className="w-4 h-4" />
                            </button>

                            {/* Last Page */}
                            <button
                                onClick={() => goToPage(totalPages)}
                                disabled={currentPage === totalPages}
                                className="p-2 rounded-md border border-[var(--border-light)] bg-[var(--surface-00)] hover:bg-[var(--surface-10)] text-[var(--text-tertiary)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                title="Last Page"
                            >
                                <ChevronsRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ConsumptionTable;
