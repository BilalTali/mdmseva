// File: resources/js/Pages/Dashboard/components/DailyAmountChart.jsx

import React from 'react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    Cell
} from 'recharts';
import { useTheme } from '@/Contexts/ThemeContext';

/**
 * Enhanced DailyAmountChart Component
 * 
 * Displays daily expenditure as a bar chart with Primary/Middle breakdown option
 * 
 * @param {Array} data - Array of data points
 * @param {string} schoolType - 'primary', 'middle', or 'both'
 * @param {string} dateFormat - Format for displaying dates (default: 'DD/MM')
 * @param {number} threshold - Optional threshold for color coding bars
 * @param {boolean} showBreakdown - Show stacked breakdown by Primary/Middle sections
 */
const DailyAmountChart = ({
    data = [],
    schoolType = 'both',
    dateFormat = 'DD/MM',
    threshold = null,
    showBreakdown = false
}) => {
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    // Theme colors
    const colors = {
        text: isDark ? '#9ca3af' : '#374151',
        grid: isDark ? '#374151' : '#e5e7eb',
        tooltipBg: isDark ? '#1f2937' : '#ffffff',
        tooltipBorder: isDark ? '#374151' : '#e5e7eb',
        tooltipText: isDark ? '#f3f4f6' : '#111827',
        tooltipTextSecondary: isDark ? '#9ca3af' : '#6b7280',
        primary: '#3b82f6',
        middle: '#8b5cf6',
        total: '#3b82f6',
        legendBg: isDark ? '#374151' : '#f9fafb',
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
        amount: parseFloat(item.amount) || 0,
        primary_amount: parseFloat(item.primary_amount) || 0,
        middle_amount: parseFloat(item.middle_amount) || 0,
        pulses: parseFloat(item.pulses) || 0,
        vegetables: parseFloat(item.vegetables) || 0,
        oil: parseFloat(item.oil) || 0,
        salt: parseFloat(item.salt) || 0,
        fuel: parseFloat(item.fuel) || 0
    }));

    const hasPrimary = schoolType === 'primary' || schoolType === 'middle';
    const hasMiddle = schoolType === 'middle';

    // Determine bar color based on threshold
    const getBarColor = (amount) => {
        if (!threshold) return colors.total; // Default blue
        return amount > threshold ? '#ef4444' : '#10b981'; // Red if over, green if under
    };

    // Custom tooltip
    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload;

            return (
                <div className="p-4 rounded-lg shadow-xl border-2" style={{ backgroundColor: colors.tooltipBg, borderColor: colors.tooltipBorder }}>
                    <p className="font-bold mb-3 pb-2 border-b" style={{ color: colors.tooltipText, borderColor: colors.tooltipBorder }}>
                        📅 {label}
                    </p>

                    {showBreakdown && hasPrimary && hasMiddle ? (
                        // Show Primary/Middle breakdown
                        <>
                            <div className="space-y-2 text-sm mb-3">
                                <div className="flex justify-between gap-6 p-2 rounded" style={{ backgroundColor: isDark ? 'rgba(59, 130, 246, 0.2)' : '#eff6ff' }}>
                                    <span className="font-semibold" style={{ color: isDark ? '#93c5fd' : '#1d4ed8' }}>Primary:</span>
                                    <span className="font-bold" style={{ color: isDark ? '#bfdbfe' : '#1e3a8a' }}>₹{data.primary_amount.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between gap-6 p-2 rounded" style={{ backgroundColor: isDark ? 'rgba(139, 92, 246, 0.2)' : '#f5f3ff' }}>
                                    <span className="font-semibold" style={{ color: isDark ? '#c4b5fd' : '#6d28d9' }}>Middle:</span>
                                    <span className="font-bold" style={{ color: isDark ? '#ddd6fe' : '#4c1d95' }}>₹{data.middle_amount.toFixed(2)}</span>
                                </div>
                            </div>
                            <div className="pt-2 border-t" style={{ borderColor: colors.tooltipBorder }}>
                                <div className="flex justify-between gap-4 font-bold">
                                    <span style={{ color: colors.tooltipText }}>Total:</span>
                                    <span className="text-green-600">₹{data.amount.toFixed(2)}</span>
                                </div>
                            </div>
                        </>
                    ) : data.pulses !== undefined ? (
                        // Show component breakdown
                        <>
                            <div className="space-y-1.5 text-sm mb-2">
                                <div className="flex justify-between gap-4">
                                    <span style={{ color: colors.tooltipTextSecondary }}>Pulses:</span>
                                    <span className="font-semibold" style={{ color: colors.tooltipText }}>₹{data.pulses.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between gap-4">
                                    <span style={{ color: colors.tooltipTextSecondary }}>Vegetables:</span>
                                    <span className="font-semibold" style={{ color: colors.tooltipText }}>₹{data.vegetables.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between gap-4">
                                    <span style={{ color: colors.tooltipTextSecondary }}>Oil:</span>
                                    <span className="font-semibold" style={{ color: colors.tooltipText }}>₹{data.oil.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between gap-4">
                                    <span style={{ color: colors.tooltipTextSecondary }}>Salt:</span>
                                    <span className="font-semibold" style={{ color: colors.tooltipText }}>₹{data.salt.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between gap-4">
                                    <span style={{ color: colors.tooltipTextSecondary }}>Fuel:</span>
                                    <span className="font-semibold" style={{ color: colors.tooltipText }}>₹{data.fuel.toFixed(2)}</span>
                                </div>
                            </div>
                            <div className="pt-2 border-t" style={{ borderColor: colors.tooltipBorder }}>
                                <div className="flex justify-between gap-4 font-semibold">
                                    <span style={{ color: colors.tooltipText }}>Total:</span>
                                    <span className="text-blue-600">₹{data.amount.toFixed(2)}</span>
                                </div>
                            </div>
                        </>
                    ) : (
                        // Show total only
                        <div className="flex justify-between gap-4 text-sm">
                            <span style={{ color: colors.tooltipTextSecondary }}>Amount Spent:</span>
                            <span className="font-semibold" style={{ color: colors.tooltipText }}>
                                ₹{data.amount.toFixed(2)}
                            </span>
                        </div>
                    )}

                    {threshold && (
                        <p className="text-xs mt-2" style={{ color: colors.tooltipTextSecondary }}>
                            {data.amount > threshold ? 'Above' : 'Below'} threshold (₹{threshold})
                        </p>
                    )}
                </div>
            );
        }
        return null;
    };

    // Custom Legend
    const CustomLegend = ({ payload }) => {
        return (
            <div className="flex flex-wrap items-center justify-center gap-4 mt-6 pb-2">
                {payload.map((entry, index) => (
                    <div
                        key={index}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-full"
                        style={{ backgroundColor: colors.legendBg }}
                    >
                        <span
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: entry.color }}
                        />
                        <span className="text-sm font-medium" style={{ color: colors.text }}>
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

    return (
        <ResponsiveContainer width="100%" height="100%">
            {/* Always show separate bars for Primary and Middle when data is available */}
            {formattedData[0]?.primary_amount !== undefined && formattedData[0]?.middle_amount !== undefined ? (
                // Separate side-by-side bars for Primary/Middle breakdown
                <BarChart
                    data={formattedData}
                    margin={{ top: 10, right: 30, left: 20, bottom: 60 }}
                >
                    <CartesianGrid strokeDasharray="3 3" stroke={colors.grid} vertical={false} />

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
                            value: 'Amount (₹)',
                            angle: -90,
                            position: 'insideLeft',
                            style: { fontSize: '13px', fill: colors.text, fontWeight: '600' }
                        }}
                    />

                    <Tooltip content={<CustomTooltip />} />

                    <Legend content={<CustomLegend />} />

                    {/* Separate bars - no stackId for side-by-side display */}
                    <Bar
                        dataKey="primary_amount"
                        fill={colors.primary}
                        name="Primary Spending"
                        radius={[4, 4, 0, 0]}
                        maxBarSize={40}
                    />
                    <Bar
                        dataKey="middle_amount"
                        fill={colors.middle}
                        name="Middle Spending"
                        radius={[4, 4, 0, 0]}
                        maxBarSize={40}
                    />
                </BarChart>
            ) : (
                // Simple bar chart for total amount when breakdown data is not available
                <BarChart
                    data={formattedData}
                    margin={{ top: 10, right: 30, left: 20, bottom: 60 }}
                >
                    <CartesianGrid strokeDasharray="3 3" stroke={colors.grid} vertical={false} />

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
                            value: 'Amount (₹)',
                            angle: -90,
                            position: 'insideLeft',
                            style: { fontSize: '13px', fill: colors.text, fontWeight: '600' }
                        }}
                    />

                    <Tooltip content={<CustomTooltip />} />

                    <Legend content={<CustomLegend />} />

                    <Bar dataKey="amount" name="Daily Expenditure" radius={[8, 8, 0, 0]} maxBarSize={60}>
                        {formattedData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={getBarColor(entry.amount)} />
                        ))}
                    </Bar>
                </BarChart>
            )}
        </ResponsiveContainer>
    );
};

export default DailyAmountChart;