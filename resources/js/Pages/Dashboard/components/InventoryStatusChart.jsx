// File: resources/js/Pages/Dashboard/components/InventoryStatusChart.jsx

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
 * InventoryStatusChart Component
 * 
 * Displays current inventory status for all food items
 * 
 * @param {Object} data - Inventory data object
 */
const InventoryStatusChart = ({
    data = {}
}) => {
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    const colors = {
        text: isDark ? '#cbd5e1' : '#475569', // Use our CSS variable colors
        grid: isDark ? '#334155' : '#e2e8f0',
        axis: isDark ? '#94a3b8' : '#64748b',
        tooltipBg: isDark ? '#1e293b' : '#ffffff',
        tooltipBorder: isDark ? '#334155' : '#e2e8f0',
        tooltipText: isDark ? '#ffffff' : '#0f172a',
        tooltipLabel: isDark ? '#cbd5e1' : '#475569',
    };

    // Define colors for different inventory levels
    const getBarColor = (current, minimum) => {
        const ratio = current / (minimum || 1);
        if (ratio >= 2) return '#10b981'; // Green - Good stock
        if (ratio >= 1) return '#f59e0b'; // Orange - Adequate stock
        return '#ef4444'; // Red - Low stock
    };

    // Format data for chart
    const chartData = [
        {
            name: 'Rice',
            current: parseFloat(data.rice_current) || 0,
            minimum: parseFloat(data.rice_minimum) || 0,
            unit: 'kg'
        },
        {
            name: 'Pulses',
            current: parseFloat(data.pulses_current) || 0,
            minimum: parseFloat(data.pulses_minimum) || 0,
            unit: 'kg'
        },
        {
            name: 'Vegetables',
            current: parseFloat(data.vegetables_current) || 0,
            minimum: parseFloat(data.vegetables_minimum) || 0,
            unit: 'kg'
        },
        {
            name: 'Oil',
            current: parseFloat(data.oil_current) || 0,
            minimum: parseFloat(data.oil_minimum) || 0,
            unit: 'L'
        },
        {
            name: 'Salt',
            current: parseFloat(data.salt_current) || 0,
            minimum: parseFloat(data.salt_minimum) || 0,
            unit: 'kg'
        },
        {
            name: 'Fuel',
            current: parseFloat(data.fuel_current) || 0,
            minimum: parseFloat(data.fuel_minimum) || 0,
            unit: 'L'
        }
    ].filter(item => item.current > 0 || item.minimum > 0);

    // Custom tooltip
    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload;
            const ratio = data.current / (data.minimum || 1);
            const status = ratio >= 2 ? 'Good Stock' : ratio >= 1 ? 'Adequate Stock' : 'Low Stock';
            const statusColor = ratio >= 2 ? 'text-green-600 dark:text-green-400' : ratio >= 1 ? 'text-orange-600 dark:text-orange-400' : 'text-red-600 dark:text-red-400';

            return (
                <div
                    className="p-4 rounded-lg shadow-xl border-2"
                    style={{
                        backgroundColor: colors.tooltipBg,
                        borderColor: colors.tooltipBorder
                    }}
                >
                    <p
                        className="font-bold mb-3 pb-2 border-b"
                        style={{
                            color: colors.tooltipText,
                            borderColor: colors.tooltipBorder
                        }}
                    >
                        📦 {label}
                    </p>

                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between gap-6">
                            <span style={{ color: colors.tooltipLabel }}>Current Stock:</span>
                            <span className="font-semibold" style={{ color: colors.tooltipText }}>{data.current} {data.unit}</span>
                        </div>
                        <div className="flex justify-between gap-6">
                            <span style={{ color: colors.tooltipLabel }}>Minimum Required:</span>
                            <span className="font-semibold" style={{ color: colors.tooltipText }}>{data.minimum} {data.unit}</span>
                        </div>
                        <div className="flex justify-between gap-6">
                            <span style={{ color: colors.tooltipLabel }}>Days Supply:</span>
                            <span className="font-semibold" style={{ color: colors.tooltipText }}>{Math.floor(ratio * 30)} days</span>
                        </div>
                        <div className="pt-2 border-t" style={{ borderColor: colors.tooltipBorder }}>
                            <div className="flex justify-between gap-4 font-bold">
                                <span style={{ color: colors.tooltipText }}>Status:</span>
                                <span className={statusColor}>{status}</span>
                            </div>
                        </div>
                    </div>
                </div>
            );
        }
        return null;
    };

    // If no data, return null
    if (!chartData || chartData.length === 0) {
        return null;
    }

    return (
        <ResponsiveContainer width="100%" height="100%">
            <BarChart
                data={chartData}
                margin={{ top: 10, right: 30, left: 20, bottom: 60 }}
            >
                <CartesianGrid strokeDasharray="3 3" stroke={colors.grid} vertical={false} />

                <XAxis
                    dataKey="name"
                    stroke={colors.axis}
                    style={{ fontSize: '12px', fontWeight: '500' }}
                    tick={{ fill: colors.text }}
                />

                <YAxis
                    stroke={colors.axis}
                    style={{ fontSize: '12px', fontWeight: '500' }}
                    tick={{ fill: colors.text }}
                    label={{
                        value: 'Stock Level',
                        angle: -90,
                        position: 'insideLeft',
                        style: { fontSize: '13px', fill: colors.text, fontWeight: '600' }
                    }}
                />

                <Tooltip content={<CustomTooltip />} />

                <Legend wrapperStyle={{ color: colors.text }} />

                {/* Current Stock Bars */}
                <Bar
                    dataKey="current"
                    name="Current Stock"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={60}
                >
                    {chartData.map((entry, index) => (
                        <Cell
                            key={`cell-${index}`}
                            fill={getBarColor(entry.current, entry.minimum)}
                        />
                    ))}
                </Bar>

                {/* Minimum Required Line */}
                <Bar
                    dataKey="minimum"
                    name="Minimum Required"
                    fill={isDark ? "rgba(156, 163, 175, 0.3)" : "rgba(107, 114, 128, 0.3)"}
                    radius={[2, 2, 0, 0]}
                    maxBarSize={60}
                />
            </BarChart>
        </ResponsiveContainer>
    );
};

export default InventoryStatusChart;
