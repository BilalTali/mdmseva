// File: resources/js/Components/DailyConsumption/Filters/RiceStockFilters.jsx
// Filter component for rice stock entries
import React, { useState } from 'react';
import { Card, CardContent } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/Components/ui/select';
import {
    Search,
    Filter,
    X,
    Calendar,
    RotateCcw,
} from 'lucide-react';

/**
 * Rice Stock Filters Component
 * 
 * Provides filtering options for rice stock entries including:
 * - Date range filtering
 * - Status filtering
 * - Search functionality
 * - Quick filter presets
 * 
 * @param {Function} onFilterChange - Callback when filters change
 * @param {Object} initialFilters - Initial filter values
 * @param {boolean} showSearch - Whether to show search input
 * @param {boolean} showDateRange - Whether to show date range filters
 * @param {boolean} showStatus - Whether to show status filter
 * @param {string} className - Additional CSS classes
 * 
 * @example
 * <RiceStockFilters
 *     onFilterChange={(filters) => handleFilterChange(filters)}
 *     initialFilters={{ status: 'approved' }}
 *     showSearch={true}
 *     showDateRange={true}
 *     showStatus={true}
 * />
 */
export default function RiceStockFilters({
    onFilterChange,
    initialFilters = {},
    showSearch = true,
    showDateRange = true,
    showStatus = true,
    className = '',
}) {
    const [filters, setFilters] = useState({
        search: initialFilters.search || '',
        dateFrom: initialFilters.dateFrom || '',
        dateTo: initialFilters.dateTo || '',
        status: initialFilters.status || 'all',
        quickFilter: initialFilters.quickFilter || 'all',
    });

    const [isExpanded, setIsExpanded] = useState(false);

    // Handle filter change
    const handleFilterChange = (key, value) => {
        const newFilters = { ...filters, [key]: value };
        setFilters(newFilters);
        onFilterChange?.(newFilters);
    };

    // Handle quick filter (preset date ranges)
    const handleQuickFilter = (preset) => {
        const today = new Date();
        let dateFrom = '';
        let dateTo = today.toISOString().split('T')[0];

        switch (preset) {
            case 'today':
                dateFrom = dateTo;
                break;
            case 'yesterday':
                const yesterday = new Date(today);
                yesterday.setDate(yesterday.getDate() - 1);
                dateFrom = yesterday.toISOString().split('T')[0];
                dateTo = dateFrom;
                break;
            case 'week':
                const weekAgo = new Date(today);
                weekAgo.setDate(weekAgo.getDate() - 7);
                dateFrom = weekAgo.toISOString().split('T')[0];
                break;
            case 'month':
                const monthAgo = new Date(today);
                monthAgo.setMonth(monthAgo.getMonth() - 1);
                dateFrom = monthAgo.toISOString().split('T')[0];
                break;
            case 'quarter':
                const quarterAgo = new Date(today);
                quarterAgo.setMonth(quarterAgo.getMonth() - 3);
                dateFrom = quarterAgo.toISOString().split('T')[0];
                break;
            case 'all':
            default:
                dateFrom = '';
                dateTo = '';
        }

        const newFilters = {
            ...filters,
            quickFilter: preset,
            dateFrom,
            dateTo,
        };
        setFilters(newFilters);
        onFilterChange?.(newFilters);
    };

    // Reset all filters
    const handleReset = () => {
        const resetFilters = {
            search: '',
            dateFrom: '',
            dateTo: '',
            status: 'all',
            quickFilter: 'all',
        };
        setFilters(resetFilters);
        onFilterChange?.(resetFilters);
    };

    // Check if any filters are active
    const hasActiveFilters = 
        filters.search || 
        filters.dateFrom || 
        filters.dateTo || 
        (filters.status && filters.status !== 'all') ||
        (filters.quickFilter && filters.quickFilter !== 'all');

    return (
        <Card className={className}>
            <CardContent className="pt-6">
                {/* Quick Filters Row */}
                <div className="flex flex-wrap items-center gap-2 mb-4">
                    <Button
                        variant={filters.quickFilter === 'all' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => handleQuickFilter('all')}
                    >
                        All Time
                    </Button>
                    <Button
                        variant={filters.quickFilter === 'today' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => handleQuickFilter('today')}
                    >
                        Today
                    </Button>
                    <Button
                        variant={filters.quickFilter === 'yesterday' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => handleQuickFilter('yesterday')}
                    >
                        Yesterday
                    </Button>
                    <Button
                        variant={filters.quickFilter === 'week' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => handleQuickFilter('week')}
                    >
                        Last 7 Days
                    </Button>
                    <Button
                        variant={filters.quickFilter === 'month' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => handleQuickFilter('month')}
                    >
                        Last 30 Days
                    </Button>
                    <Button
                        variant={filters.quickFilter === 'quarter' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => handleQuickFilter('quarter')}
                    >
                        Last 90 Days
                    </Button>

                    <div className="ml-auto flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setIsExpanded(!isExpanded)}
                        >
                            <Filter className="w-4 h-4 mr-2" />
                            {isExpanded ? 'Hide Filters' : 'More Filters'}
                        </Button>
                        {hasActiveFilters && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleReset}
                            >
                                <RotateCcw className="w-4 h-4 mr-2" />
                                Reset
                            </Button>
                        )}
                    </div>
                </div>

                {/* Advanced Filters */}
                {isExpanded && (
                    <div className="space-y-4 pt-4 border-t">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            {/* Search */}
                            {showSearch && (
                                <div className="space-y-2">
                                    <Label htmlFor="search">Search</Label>
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                        <Input
                                            id="search"
                                            placeholder="Search entries..."
                                            value={filters.search}
                                            onChange={(e) => handleFilterChange('search', e.target.value)}
                                            className="pl-9"
                                        />
                                        {filters.search && (
                                            <button
                                                onClick={() => handleFilterChange('search', '')}
                                                className="absolute right-3 top-1/2 transform -translate-y-1/2"
                                            >
                                                <X className="w-4 h-4 text-gray-400 hover:text-gray-600" />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Date From */}
                            {showDateRange && (
                                <div className="space-y-2">
                                    <Label htmlFor="dateFrom">From Date</Label>
                                    <div className="relative">
                                        <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                        <Input
                                            id="dateFrom"
                                            type="date"
                                            value={filters.dateFrom}
                                            onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                                            className="pl-9"
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Date To */}
                            {showDateRange && (
                                <div className="space-y-2">
                                    <Label htmlFor="dateTo">To Date</Label>
                                    <div className="relative">
                                        <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                        <Input
                                            id="dateTo"
                                            type="date"
                                            value={filters.dateTo}
                                            onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                                            className="pl-9"
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Status */}
                            {showStatus && (
                                <div className="space-y-2">
                                    <Label htmlFor="status">Status</Label>
                                    <Select
                                        value={filters.status}
                                        onValueChange={(value) => handleFilterChange('status', value)}
                                    >
                                        <SelectTrigger id="status">
                                            <SelectValue placeholder="Select status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Statuses</SelectItem>
                                            <SelectItem value="approved">Approved</SelectItem>
                                            <SelectItem value="pending">Pending</SelectItem>
                                            <SelectItem value="rejected">Rejected</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Active Filters Display */}
                {hasActiveFilters && !isExpanded && (
                    <div className="flex flex-wrap items-center gap-2 mt-3 pt-3 border-t">
                        <span className="text-sm text-gray-500">Active filters:</span>
                        {filters.search && (
                            <div className="flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 rounded text-sm">
                                Search: {filters.search}
                                <button onClick={() => handleFilterChange('search', '')}>
                                    <X className="w-3 h-3" />
                                </button>
                            </div>
                        )}
                        {filters.status && filters.status !== 'all' && (
                            <div className="flex items-center gap-1 px-2 py-1 bg-green-50 text-green-700 rounded text-sm">
                                Status: {filters.status}
                                <button onClick={() => handleFilterChange('status', 'all')}>
                                    <X className="w-3 h-3" />
                                </button>
                            </div>
                        )}
                        {(filters.dateFrom || filters.dateTo) && (
                            <div className="flex items-center gap-1 px-2 py-1 bg-purple-50 text-purple-700 rounded text-sm">
                                Date Range: {filters.dateFrom || '∞'} to {filters.dateTo || 'Today'}
                                <button onClick={() => {
                                    handleFilterChange('dateFrom', '');
                                    handleFilterChange('dateTo', '');
                                }}>
                                    <X className="w-3 h-3" />
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}