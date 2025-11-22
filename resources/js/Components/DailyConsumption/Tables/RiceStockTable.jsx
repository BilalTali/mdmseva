
// File: resources/js/Components/DailyConsumption/Tables/RiceStockTable.jsx
// Main table component for displaying rice stock entries
import React, { useState, useMemo } from 'react';
import { router } from '@inertiajs/react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/Components/ui/table';
import { Button } from '@/Components/ui/button';
import { Badge } from '@/Components/ui/badge';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/Components/ui/dropdown-menu';
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

    // Get status badge variant
    const getStatusVariant = (status) => {
        switch (status?.toLowerCase()) {
            case 'approved':
                return 'default'; // Green
            case 'pending':
                return 'secondary'; // Yellow
            case 'rejected':
                return 'destructive'; // Red
            default:
                return 'outline';
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
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 font-semibold"
                                onClick={() => handleSort('date')}
                            >
                                Date
                                {renderSortIcon('date')}
                            </Button>
                        </TableHead>
                        <TableHead>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 font-semibold"
                                onClick={() => handleSort('opening_balance')}
                            >
                                Opening Balance
                                {renderSortIcon('opening_balance')}
                            </Button>
                        </TableHead>
                        <TableHead>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 font-semibold"
                                onClick={() => handleSort('rice_received')}
                            >
                                Received
                                {renderSortIcon('rice_received')}
                            </Button>
                        </TableHead>
                        <TableHead>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 font-semibold"
                                onClick={() => handleSort('rice_consumed')}
                            >
                                Consumed
                                {renderSortIcon('rice_consumed')}
                            </Button>
                        </TableHead>
                        <TableHead>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 font-semibold"
                                onClick={() => handleSort('closing_balance')}
                            >
                                Closing Balance
                                {renderSortIcon('closing_balance')}
                            </Button>
                        </TableHead>
                        <TableHead>
                            <span className="font-semibold">Status</span>
                        </TableHead>
                        <TableHead className="text-right">
                            <span className="font-semibold">Actions</span>
                        </TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {sortedData.map((entry) => (
                        <TableRow key={entry.id}>
                            <TableCell className="font-medium">
                                {formatDate(entry.date)}
                            </TableCell>
                            <TableCell>
                                <span className="font-semibold text-green-600">
                                    {formatNumber(entry.opening_balance)} kg
                                </span>
                            </TableCell>
                            <TableCell>
                                <span className="font-semibold text-blue-600">
                                    {formatNumber(entry.rice_received)} kg
                                </span>
                            </TableCell>
                            <TableCell>
                                <span className="font-semibold text-orange-600">
                                    {formatNumber(entry.rice_consumed)} kg
                                </span>
                            </TableCell>
                            <TableCell>
                                <span className="font-semibold text-red-600">
                                    {formatNumber(entry.closing_balance)} kg
                                </span>
                            </TableCell>
                            <TableCell>
                                <Badge variant={getStatusVariant(entry.status)}>
                                    {entry.status || 'Pending'}
                                </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-8 w-8 p-0"
                                        >
                                            <MoreVertical className="h-4 w-4" />
                                            <span className="sr-only">Open menu</span>
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        {onView && (
                                            <DropdownMenuItem
                                                onClick={() => onView(entry)}
                                            >
                                                <Eye className="mr-2 h-4 w-4" />
                                                View Details
                                            </DropdownMenuItem>
                                        )}
                                        {canEdit && onEdit && (
                                            <DropdownMenuItem
                                                onClick={() => onEdit(entry)}
                                            >
                                                <Edit className="mr-2 h-4 w-4" />
                                                Edit
                                            </DropdownMenuItem>
                                        )}
                                        <DropdownMenuItem>
                                            <Download className="mr-2 h-4 w-4" />
                                            Download
                                        </DropdownMenuItem>
                                        {canDelete && onDelete && (
                                            <>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem
                                                    onClick={() => onDelete(entry)}
                                                    className="text-red-600 focus:text-red-600"
                                                >
                                                    <Trash2 className="mr-2 h-4 w-4" />
                                                    Delete
                                                </DropdownMenuItem>
                                            </>
                                        )}
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}