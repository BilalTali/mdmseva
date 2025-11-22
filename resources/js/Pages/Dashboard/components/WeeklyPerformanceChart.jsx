// File: resources/js/Pages/Dashboard/components/WeeklyPerformanceChart.jsx

import React from 'react';
import {
    RadarChart,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis,
    Radar,
    ResponsiveContainer,
    Legend,
    Tooltip
} from 'recharts';
import { useTheme } from '@/Contexts/ThemeContext';

/**
 * WeeklyPerformanceChart Component
 * 
 * Displays weekly performance metrics in a radar chart format
 * 
 * @param {Array} data - Array of weekly performance data
 */
const WeeklyPerformanceChart = ({
    data = []
}) => {
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    const colors = {
        text: isDark ? '#cbd5e1' : '#475569',
        grid: isDark ? '#334155' : '#e2e8f0',
        axis: isDark ? '#94a3b8' : '#94a3b8',
        tooltipBg: isDark ? '#1e293b' : '#ffffff',
        tooltipBorder: isDark ? '#334155' : '#e2e8f0',
        tooltipText: isDark ? '#ffffff' : '#0f172a',
        tooltipLabel: isDark ? '#cbd5e1' : '#475569',
    };

    // Format data for radar chart
    const radarData = [
        {
            metric: 'Attendance Rate',
            thisWeek: parseFloat(data.attendance_rate_current) || 0,
            lastWeek: parseFloat(data.attendance_rate_previous) || 0,
            fullMark: 100
        },
        {
            metric: 'Meal Quality',
            thisWeek: parseFloat(data.meal_quality_current) || 0,
            lastWeek: parseFloat(data.meal_quality_previous) || 0,
            fullMark: 100
        },
        {
            metric: 'Budget Efficiency',
            thisWeek: parseFloat(data.budget_efficiency_current) || 0,
            lastWeek: parseFloat(data.budget_efficiency_previous) || 0,
            fullMark: 100
        },
        {
            metric: 'Stock Management',
            thisWeek: parseFloat(data.stock_management_current) || 0,
            lastWeek: parseFloat(data.stock_management_previous) || 0,
            fullMark: 100
        },
        {
            metric: 'Nutrition Score',
            thisWeek: parseFloat(data.nutrition_score_current) || 0,
            lastWeek: parseFloat(data.nutrition_score_previous) || 0,
            fullMark: 100
        },
        {
            metric: 'Compliance Rate',
            thisWeek: parseFloat(data.compliance_rate_current) || 0,
            lastWeek: parseFloat(data.compliance_rate_previous) || 0,
            fullMark: 100
        }
    ];

    // Custom tooltip
    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
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
                        📊 {label}
                    </p>

                    <div className="space-y-2 text-sm">
                        {payload.map((entry, index) => (
                            <div key={index} className="flex justify-between gap-6">
                                <span style={{ color: entry.color }} className="font-medium">
                                    {entry.name}:
                                </span>
                                <span className="font-semibold" style={{ color: colors.tooltipText }}>
                                    {entry.value}%
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            );
        }
        return null;
    };

    // If no meaningful data, return null
    if (!radarData || radarData.every(item => item.thisWeek === 0 && item.lastWeek === 0)) {
        return null;
    }

    return (
        <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={radarData} margin={{ top: 20, right: 30, bottom: 20, left: 30 }}>
                <PolarGrid stroke={colors.grid} />

                <PolarAngleAxis
                    dataKey="metric"
                    tick={{ fontSize: 12, fill: colors.text, fontWeight: '500' }}
                />

                <PolarRadiusAxis
                    angle={90}
                    domain={[0, 100]}
                    tick={{ fontSize: 10, fill: colors.axis }}
                />

                <Radar
                    name="This Week"
                    dataKey="thisWeek"
                    stroke="#3b82f6"
                    fill="#3b82f6"
                    fillOpacity={0.3}
                    strokeWidth={2}
                    dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                />

                <Radar
                    name="Last Week"
                    dataKey="lastWeek"
                    stroke="#10b981"
                    fill="#10b981"
                    fillOpacity={0.2}
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    dot={{ fill: '#10b981', strokeWidth: 2, r: 3 }}
                />

                <Tooltip content={<CustomTooltip />} />

                <Legend
                    wrapperStyle={{
                        paddingTop: '20px',
                        fontSize: '14px',
                        fontWeight: '500',
                        color: colors.text
                    }}
                />
            </RadarChart>
        </ResponsiveContainer>
    );
};

export default WeeklyPerformanceChart;
