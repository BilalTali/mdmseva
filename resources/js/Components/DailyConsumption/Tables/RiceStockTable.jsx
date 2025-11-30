// File: resources/js/Components/DailyConsumption/Tables/RiceStockTable.jsx
// Main table component for displaying rice stock entries
import React, { useState, useMemo } from 'react';

import Button from '@/Components/ui/button';

import {
    ArrowUpDown,
    ArrowUp,
    ArrowDown,
    MoreVertical,
    Eye,
    Edit,
    Trash2,
    Download,
} from 'lucide-react';

/**
 * Rice Stock Table Component
 * 
 * Displays rice stock entries in a sortable table with actions
 * 
 * @param {Array} data - Array of rice stock entries
 * @param {Function} onEdit - Callback when edit is clicked
 * @param {Function} onDelete - Callback when delete is clicked
 * @param {Function} onView - Callback when view is clicked
 * @param {boolean} canEdit - Whether user can edit entries
 * @param {boolean} canDelete - Whether user can delete entries
 * @param {string} className - Additional CSS classes
 * 
 * @example
 * <RiceStockTable
 *     data={riceStockEntries}
 *     onEdit={(entry) => handleEdit(entry)}
 *     onDelete={(entry) => handleDelete(entry)}
 *     onView={(entry) => handleView(entry)}
 *     canEdit={true}
 *     canDelete={true}
 * />
 */
export default function RiceStockTable({
    data = [],
    onEdit,
    onDelete,
    onView,
    canEdit = false,
    canDelete = false,
    className = '',
}) {
    // Sorting state
    const [sortConfig, setSortConfig] = useState({
        key: 'date',
        direction: 'desc',
    });

    // Handle sorting
    const handleSort = (key) => {
        setSortConfig((prevConfig) => ({
            key,
            direction:
                prevConfig.key === key && prevConfig.direction === 'asc'
                    ? 'desc'
                    : 'asc',
        }));
    };

    // Sort data
    const sortedData = useMemo(() => {
        if (!sortConfig.key) return data;

        return [...data].sort((a, b) => {
            const aValue = a[sortConfig.key];
            const bValue = b[sortConfig.key];

            // Handle null/undefined values
            if (aValue == null) return 1;
            if (bValue == null) return -1;

            // Compare values
            if (aValue < bValue) {
                return sortConfig.direction === 'asc' ? -1 : 1;
            }
            if (aValue > bValue) {
                return sortConfig.direction === 'asc' ? 1 : -1;
            }
            return 0;
        });
    }, [data, sortConfig]);

    // Render sort icon
    const renderSortIcon = (columnKey) => {
        if (sortConfig.key !== columnKey) {
            return <ArrowUpDown className="ml-2 h-4 w-4" />;
        }
        return sortConfig.direction === 'asc' ? (
            <ArrowUp className="ml-2 h-4 w-4" />
        ) : (
            <ArrowDown className="ml-2 h-4 w-4" />
        );
    };

    // Format date
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
        });
    };

    // Format number with commas
    const formatNumber = (num) => {
        return num?.toLocaleString('en-IN', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }) || '0.00';
    };

    // Get status badge classes
    const getStatusClasses = (status) => {
        switch (status?.toLowerCase()) {
            case 'approved':
                return 'bg-green-100 text-green-800';
            case 'pending':
                return 'bg-yellow-100 text-yellow-800';
            case 'rejected':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    if (!data || data.length === 0) {
        return (
            <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed">
                <p className="text-gray-500 text-lg">No rice stock entries found</p>
                <p className="text-gray-400 text-sm mt-2">
                    Create your first entry to get started
                </p>
            </div>
        );
    }

    return (
        <div className={`rounded-md border ${className}`}>
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 font-semibold"
                                onClick={() => handleSort('date')}
                            >
                                Date
                                {renderSortIcon('date')}
                            </Button>
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 font-semibold"
                                onClick={() => handleSort('opening_balance')}
                            >
                                Opening Balance
                                {renderSortIcon('opening_balance')}
                            </Button>
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 font-semibold"
                                onClick={() => handleSort('rice_received')}
                            >
                                Received
                                {renderSortIcon('rice_received')}
                            </Button>
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 font-semibold"
                                onClick={() => handleSort('rice_consumed')}
                            >
                                Consumed
                                {renderSortIcon('rice_consumed')}
                            </Button>
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 font-semibold"
                                onClick={() => handleSort('closing_balance')}
                            >
                                Closing Balance
                                {renderSortIcon('closing_balance')}
                            </Button>
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            <span className="font-semibold">Status</span>
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            <span className="font-semibold">Actions</span>
                        </th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {sortedData.map((entry) => (
                        <tr key={entry.id} className="hover:bg-gray-50">
                            <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                                {formatDate(entry.date)}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm">
                                <span className="font-semibold text-green-600">
                                    {formatNumber(entry.opening_balance)} kg
                                </span>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm">
                                <span className="font-semibold text-blue-600">
                                    {formatNumber(entry.rice_received)} kg
                                </span>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm">
                                <span className="font-semibold text-orange-600">
                                    {formatNumber(entry.rice_consumed)} kg
                                </span>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm">
                                <span className="font-semibold text-red-600">
                                    {formatNumber(entry.closing_balance)} kg
                                </span>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm">
                                <span
                                    className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${getStatusClasses(
                                        entry.status
                                    )}`}
                                >
                                    {entry.status || 'Pending'}
                                </span>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-right">
                                <div className="flex items-center justify-end space-x-2">
                                    {onView && (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => onView(entry)}
                                        >
                                            <Eye className="h-4 w-4 mr-1" />
                                            View
                                        </Button>
                                    )}
                                    {canEdit && onEdit && (
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => onEdit(entry)}
                                        >
                                            <Edit className="h-4 w-4 mr-1" />
                                            Edit
                                        </Button>
                                    )}
                                    {canDelete && onDelete && (
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => onDelete(entry)}
                                            className="text-red-600"
                                        >
                                            <Trash2 className="h-4 w-4 mr-1" />
                                            Delete
                                        </Button>
                                    )}
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}