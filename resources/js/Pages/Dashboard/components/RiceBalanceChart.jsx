
// File: resources/js/Pages/Dashboard/components/RiceBalanceChart.jsx

import React from 'react';
import {
    LineChart,
    Line,
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer
} from 'recharts';
import { useTheme } from '@/Contexts/ThemeContext';

/**
 * Enhanced RiceBalanceChart Component
 * 
 * Displays rice balance over time with opening balance, consumption, and closing balance
 * Shows separate lines for Primary and Middle consumption based on school type
 * 
 * @param {Array} data - Array of data points with structure:
 *   [{ date: '2024-11-01', opening: 500, consumed: 50, closing: 450, primary_consumed: 30, middle_consumed: 20 }, ...]
 * @param {string} schoolType - 'primary', 'middle', or 'both'
 * @param {string} dateFormat - Format for displaying dates (default: 'DD/MM')
 * @param {boolean} useAreaChart - Use area chart instead of line chart (default: false)
 */
const RiceBalanceChart = ({
    data = [],
    schoolType = 'both',
    dateFormat = 'DD/MM',
    useAreaChart = false
}) => {
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    // Theme colors
    const colors = {
        text: isDark ? '#9ca3af' : '#374151', // gray-400 : gray-700
        grid: isDark ? '#374151' : '#e5e7eb', // gray-700 : gray-200
        tooltipBg: isDark ? '#1f2937' : '#ffffff', // gray-800 : white
        tooltipBorder: isDark ? '#374151' : '#e5e7eb', // gray-700 : gray-200
        tooltipText: isDark ? '#f3f4f6' : '#111827', // gray-100 : gray-900
        opening: '#3b82f6', // blue-500
        closing: '#10b981', // emerald-500
        primary: '#06b6d4', // cyan-500
        middle: '#d946ef', // fuchsia-500
        consumed: '#ef4444', // red-500
    };

    // Format date for display
    const formatDate = (dateString) => {
        if (!dateString) return '';

        const date = new Date(dateString);
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');

        if (dateFormat === 'DD/MM') {
            return `${day}/${month}`;
        } else if (dateFormat === 'DD MMM') {
            const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            return `${day} ${monthNames[date.getMonth()]}`;
        }

        return dateString;
    };

    // Format the data for the chart
    const formattedData = data.map(item => ({
        ...item,
        displayDate: formatDate(item.date),
        // Ensure numeric values - Total
        opening: parseFloat(item.opening) || 0,
        consumed: parseFloat(item.consumed) || 0,
        closing: parseFloat(item.closing) || 0,
        // Primary and Middle breakdown
        primary_consumed: parseFloat(item.primary_consumed) || 0,
        middle_consumed: parseFloat(item.middle_consumed) || 0,
    }));

    // Determine which lines to show based on school type
    const hasPrimary = schoolType === 'primary' || schoolType === 'middle';
    const hasMiddle = schoolType === 'middle';

    // Custom tooltip with enhanced styling
    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="p-4 rounded-lg shadow-xl border-2" style={{ backgroundColor: colors.tooltipBg, borderColor: colors.tooltipBorder }}>
                    <p className="font-bold mb-3 pb-2 border-b" style={{ color: colors.tooltipText, borderColor: colors.tooltipBorder }}>
                        📅 {label}
                    </p>
                    <div className="space-y-1.5">
                        {payload.map((entry, index) => (
                            <div
                                key={index}
                                className="flex items-center justify-between gap-6 text-sm"
                            >
                                <span className="flex items-center gap-2">
                                    <span
                                        className="w-3 h-3 rounded-full shadow-sm"
                                        style={{ backgroundColor: entry.color }}
                                    ></span>
                                    <span className="font-medium" style={{ color: isDark ? '#d1d5db' : '#374151' }}>
                                        {entry.name}:
                                    </span>
                                </span>
                                <span className="font-bold" style={{ color: colors.tooltipText }}>
                                    {entry.value.toFixed(2)} kg
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            );
        }
        return null;
    };

    // Custom Legend with enhanced styling
    const CustomLegend = ({ payload }) => {
        return (
            <div className="flex flex-wrap items-center justify-center gap-4 mt-6 pb-2">
                {payload.map((entry, index) => (
                    <div
                        key={index}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-full"
                        style={{ backgroundColor: isDark ? '#374151' : '#f9fafb' }}
                    >
                        <span
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: entry.color }}
                        />
                        <span className="text-sm font-medium" style={{ color: isDark ? '#e5e7eb' : '#374151' }}>
                            {entry.value}
                        </span>
                    </div>
                ))}
            </div>
        );
    };

    // If no data, return null (parent ChartCard will show empty state)
    if (!formattedData || formattedData.length === 0) {
        return null;
    }

    // Chart configuration
    const chartProps = {
        data: formattedData,
        margin: { top: 10, right: 30, left: 20, bottom: 60 }
    };

    const ChartComponent = useAreaChart ? AreaChart : LineChart;
    const DataComponent = useAreaChart ? Area : Line;

    return (
        <ResponsiveContainer width="100%" height="100%">
            <ChartComponent {...chartProps}>
                <defs>
                    {/* Gradients for area chart */}
                    <linearGradient id="colorOpening" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={colors.opening} stopOpacity={0.3} />
                        <stop offset="95%" stopColor={colors.opening} stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorClosing" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={colors.closing} stopOpacity={0.3} />
                        <stop offset="95%" stopColor={colors.closing} stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorPrimary" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={colors.primary} stopOpacity={0.3} />
                        <stop offset="95%" stopColor={colors.primary} stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorMiddle" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={colors.middle} stopOpacity={0.3} />
                        <stop offset="95%" stopColor={colors.middle} stopOpacity={0} />
                    </linearGradient>
                </defs>

                <CartesianGrid
                    strokeDasharray="3 3"
                    stroke={colors.grid}
                    vertical={false}
                />

                <XAxis
                    dataKey="displayDate"
                    stroke={colors.text}
                    style={{ fontSize: '12px', fontWeight: '500' }}
                    angle={-45}
                    textAnchor="end"
                    height={80}
                    tick={{ fill: colors.text }}
                />

                <YAxis
                    stroke={colors.text}
                    style={{ fontSize: '12px', fontWeight: '500' }}
                    tick={{ fill: colors.text }}
                    label={{
                        value: 'Rice Stock (kg)',
                        angle: -90,
                        position: 'insideLeft',
                        style: {
                            fontSize: '13px',
                            fill: colors.text,
                            fontWeight: '600'
                        }
                    }}
                />

                <Tooltip content={<CustomTooltip />} />

                <Legend content={<CustomLegend />} />

                {/* Opening Balance - Dashed Line for Reference */}
                <DataComponent
                    type="monotone"
                    dataKey="opening"
                    stroke={colors.opening}
                    fill="none"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    name="Opening Balance"
                    dot={{ fill: colors.opening, r: 4 }}
                    activeDot={{ r: 6 }}
                />

                {/* Primary Consumed - Show if data includes it */}
                {hasPrimary && formattedData[0]?.primary_consumed !== undefined && (
                    <DataComponent
                        type="monotone"
                        dataKey="primary_consumed"
                        stroke={colors.primary}
                        fill="none"
                        strokeWidth={2}
                        strokeDasharray="3 3"
                        name="Primary Consumed"
                        dot={false}
                        activeDot={{ r: 4 }}
                    />
                )}

                {/* Middle Consumed - Show if data includes it */}
                {hasMiddle && formattedData[0]?.middle_consumed !== undefined && (
                    <DataComponent
                        type="monotone"
                        dataKey="middle_consumed"
                        stroke={colors.middle}
                        fill="none"
                        strokeWidth={2}
                        strokeDasharray="3 3"
                        name="Middle Consumed"
                        dot={false}
                        activeDot={{ r: 4 }}
                    />
                )}

                {/* Closing Balance - Solid Area with Gradient */}
                <DataComponent
                    type="monotone"
                    dataKey="closing"
                    stroke={colors.closing}
                    fill={useAreaChart ? "url(#colorClosing)" : undefined}
                    strokeWidth={3}
                    name="Closing Balance"
                    dot={{ fill: colors.closing, strokeWidth: 2, r: 4, stroke: '#fff' }}
                    activeDot={{ r: 6, strokeWidth: 2 }}
                />
            </ChartComponent>
        </ResponsiveContainer>
    );
};

export default RiceBalanceChart;
