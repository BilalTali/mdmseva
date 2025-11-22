// File: resources/js/Pages/Dashboard/components/AmountBreakdownChart.jsx

import React from 'react';
import {
    PieChart,
    Pie,
    Cell,
    ResponsiveContainer,
    Tooltip,
    Legend
} from 'recharts';
import { useTheme } from '@/Contexts/ThemeContext';

/**
 * AmountBreakdownChart Component
 * 
 * Displays amount breakdown by component (Pulses, Vegetables, Oil, Salt, Fuel) as pie/donut chart
 * 
 * @param {Object} data - Data object with structure:
 *   { pulses_total: 5000, vegetables_total: 3000, oil_total: 1000, salt_total: 500, fuel_total: 2000 }
 * @param {boolean} isDonut - Show as donut chart (default: true)
 * @param {boolean} showPercentages - Show percentages in labels (default: true)
 */
const AmountBreakdownChart = ({
    data = {},
    isDonut = true,
    showPercentages = true
}) => {
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    // Theme colors
    const colors = {
        tooltipBg: isDark ? '#1f2937' : '#ffffff',
        tooltipBorder: isDark ? '#374151' : '#e5e7eb',
        tooltipText: isDark ? '#f3f4f6' : '#111827',
        text: isDark ? '#d1d5db' : '#374151',
        textSecondary: isDark ? '#9ca3af' : '#6b7280',
        totalText: isDark ? '#f3f4f6' : '#111827',
        totalLabel: isDark ? '#9ca3af' : '#6b7280',
        legendBg: isDark ? '#374151' : '#f9fafb',
        border: isDark ? '#374151' : '#e5e7eb',
    };

    // Define colors for each component
    const COLORS = {
        pulses: '#3b82f6',      // Blue
        vegetables: '#10b981',   // Green
        oil: '#f59e0b',          // Orange
        salt: '#ec4899',         // Pink
        fuel: '#8b5cf6'          // Purple
    };

    // Format data for pie chart
    const chartData = [
        {
            name: 'Pulses',
            value: parseFloat(data.pulses_total) || 0,
            color: COLORS.pulses
        },
        {
            name: 'Vegetables',
            value: parseFloat(data.vegetables_total) || 0,
            color: COLORS.vegetables
        },
        {
            name: 'Oil',
            value: parseFloat(data.oil_total) || 0,
            color: COLORS.oil
        },
        {
            name: 'Salt',
            value: parseFloat(data.salt_total) || 0,
            color: COLORS.salt
        },
        {
            name: 'Fuel',
            value: parseFloat(data.fuel_total) || 0,
            color: COLORS.fuel
        }
    ].filter(item => item.value > 0); // Only show items with values

    // Calculate total
    const total = chartData.reduce((sum, item) => sum + item.value, 0);

    // Calculate percentage
    const getPercentage = (value) => {
        if (total === 0) return 0;
        return ((value / total) * 100).toFixed(1);
    };

    // Custom tooltip
    const CustomTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            const data = payload[0];
            return (
                <div className="p-3 rounded-lg shadow-lg border" style={{ backgroundColor: colors.tooltipBg, borderColor: colors.tooltipBorder }}>
                    <p className="font-semibold mb-1" style={{ color: colors.tooltipText }}>{data.name}</p>
                    <p className="text-sm" style={{ color: colors.textSecondary }}>
                        Amount: <span className="font-semibold">₹{data.value.toFixed(2)}</span>
                    </p>
                    <p className="text-sm" style={{ color: colors.textSecondary }}>
                        Percentage: <span className="font-semibold">{getPercentage(data.value)}%</span>
                    </p>
                </div>
            );
        }
        return null;
    };

    // Custom label for pie slices
    const renderCustomLabel = (entry) => {
        if (!showPercentages) return null;
        const percentage = getPercentage(entry.value);
        // Only show label if percentage is significant enough
        return percentage > 5 ? `${percentage}%` : '';
    };

    // Custom legend
    const CustomLegend = () => {
        return (
            <div className="flex flex-col gap-2 mt-4">
                {chartData.map((entry, index) => (
                    <div key={index} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                            <div
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: entry.color }}
                            ></div>
                            <span style={{ color: colors.text }}>{entry.name}</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="font-semibold" style={{ color: colors.totalText }}>
                                ₹{entry.value.toFixed(2)}
                            </span>
                            <span className="w-12 text-right" style={{ color: colors.textSecondary }}>
                                {getPercentage(entry.value)}%
                            </span>
                        </div>
                    </div>
                ))}
                <div className="pt-2 mt-2 border-t" style={{ borderColor: colors.border }}>
                    <div className="flex items-center justify-between font-semibold">
                        <span style={{ color: colors.totalText }}>Total</span>
                        <span className="text-blue-600">₹{total.toFixed(2)}</span>
                    </div>
                </div>
            </div>
        );
    };

    // If no data, return null (parent ChartCard will show empty state)
    if (!chartData || chartData.length === 0) {
        return null;
    }

    return (
        <div className="w-full h-full flex flex-col relative">
            {/* Pie Chart - Reduced height to make room for legend */}
            <div className="flex-shrink-0" style={{ height: '180px' }}>
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={chartData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={renderCustomLabel}
                            outerRadius="65%"
                            innerRadius={isDonut ? "40%" : "0%"}
                            fill="#8884d8"
                            dataKey="value"
                            paddingAngle={2}
                        >
                            {chartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                    </PieChart>
                </ResponsiveContainer>
            </div>

            {/* Center label for donut chart */}
            {isDonut && total > 0 && (
                <div className="absolute top-0 left-0 right-0" style={{ height: '180px', pointerEvents: 'none' }}>
                    <div className="w-full h-full flex items-center justify-center">
                        <div className="text-center">
                            <p className="text-xs uppercase tracking-wide" style={{ color: colors.totalLabel }}>Total</p>
                            <p className="text-lg font-bold" style={{ color: colors.totalText }}>
                                ₹{total.toFixed(0)}
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Custom Legend - Scrollable if needed */}
            <div className="flex-1 overflow-y-auto px-4 pb-2">
                <CustomLegend />
            </div>
        </div>
    );
};

export default AmountBreakdownChart;