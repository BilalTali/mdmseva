// File: resources/js/Pages/Dashboard/components/MonthlyTrendsChart.jsx

import React from 'react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer
} from 'recharts';


/**
 * MonthlyTrendsChart Component
 * 
 * Displays monthly trends for rice consumption, spending, and student attendance
 * 
 * @param {Array} data - Array of monthly trend data
 */
const MonthlyTrendsChart = ({
    data = []
}) => {
    const colors = {
        text: '#475569',
        grid: '#e2e8f0',
        axis: '#94a3b8',
        tooltipBg: '#ffffff',
        tooltipBorder: '#e2e8f0',
        tooltipText: '#0f172a',
        tooltipLabel: '#475569',
    };

    // Format the data for the chart (now weekly)
    const formattedData = data.map(item => ({
        ...item,
        week_label: item.week_label || `Week ${item.week}`,
        rice_consumed: parseFloat(item.rice_consumed) || 0,
        amount_spent: parseFloat(item.amount_spent) || 0,
        students_served: parseFloat(item.students_served) || 0,
        avg_attendance_rate: parseFloat(item.avg_attendance_rate) || 0
    }));

    // Custom tooltip
    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload;

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
                        <div className="flex justify-between gap-6">
                            <span style={{ color: colors.tooltipLabel }}>Rice Consumed:</span>
                            <span className="font-semibold text-[var(--color-warning)]">{data.rice_consumed} kg</span>
                        </div>
                        <div className="flex justify-between gap-6">
                            <span style={{ color: colors.tooltipLabel }}>Amount Spent:</span>
                            <span className="font-semibold text-[var(--color-success)]">₹{data.amount_spent}</span>
                        </div>
                        <div className="flex justify-between gap-6">
                            <span style={{ color: colors.tooltipLabel }}>Students Served:</span>
                            <span className="font-semibold text-[var(--color-info)]">{data.students_served}</span>
                        </div>
                        <div className="flex justify-between gap-6">
                            <span style={{ color: colors.tooltipLabel }}>Avg Attendance:</span>
                            <span className="font-semibold text-[var(--primary-600)]">{data.avg_attendance_rate}%</span>
                        </div>
                    </div>
                </div>
            );
        }
        return null;
    };

    // If no data, return null
    if (!formattedData || formattedData.length === 0) {
        return null;
    }

    return (
        <ResponsiveContainer width="100%" height="100%">
            <LineChart
                data={formattedData}
                margin={{ top: 10, right: 30, left: 20, bottom: 60 }}
            >
                <CartesianGrid strokeDasharray="3 3" stroke={colors.grid} />

                <XAxis
                    dataKey="week_label"
                    stroke={colors.axis}
                    style={{ fontSize: '12px', fontWeight: '500' }}
                    angle={-45}
                    textAnchor="end"
                    height={80}
                    tick={{ fill: colors.text }}
                />

                <YAxis
                    yAxisId="left"
                    stroke={colors.axis}
                    style={{ fontSize: '12px', fontWeight: '500' }}
                    tick={{ fill: colors.text }}
                />

                <YAxis
                    yAxisId="right"
                    orientation="right"
                    stroke={colors.axis}
                    style={{ fontSize: '12px', fontWeight: '500' }}
                    tick={{ fill: colors.text }}
                />

                <Tooltip content={<CustomTooltip />} />

                <Legend wrapperStyle={{ color: colors.text }} />

                <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="rice_consumed"
                    stroke="#f97316"
                    strokeWidth={3}
                    name="Rice Consumed (kg)"
                    dot={{ fill: '#f97316', strokeWidth: 2, r: 5 }}
                    activeDot={{ r: 7, strokeWidth: 2 }}
                />

                <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="amount_spent"
                    stroke="#10b981"
                    strokeWidth={3}
                    name="Amount Spent (₹)"
                    dot={{ fill: '#10b981', strokeWidth: 2, r: 5 }}
                    activeDot={{ r: 7, strokeWidth: 2 }}
                />

                <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="students_served"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    name="Students Served"
                    dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6 }}
                />
            </LineChart>
        </ResponsiveContainer>
    );
};

export default MonthlyTrendsChart;
