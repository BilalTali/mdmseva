// File: resources/js/Pages/Dashboard/components/StudentAttendanceChart.jsx

import React from 'react';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer
} from 'recharts';


/**
 * StudentAttendanceChart Component
 * 
 * Displays student attendance trends over time with Primary/Middle breakdown
 * 
 * @param {Array} data - Array of attendance data points
 * @param {string} schoolType - 'primary', 'middle', or 'both'
 */
const StudentAttendanceChart = ({
    data = [],
    schoolType = 'both'
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

    // Format date for display
    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        return `${day}/${month}`;
    };

    // Format the data for the chart
    const formattedData = data.map(item => ({
        ...item,
        displayDate: formatDate(item.date),
        total_students: parseFloat(item.total_students) || 0,
        present_students: parseFloat(item.present_students) || 0,
        primary_present: parseFloat(item.primary_present) || 0,
        middle_present: parseFloat(item.middle_present) || 0,
        attendance_rate: ((parseFloat(item.present_students) || 0) / (parseFloat(item.total_students) || 1) * 100).toFixed(1)
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
                        📅 {label}
                    </p>

                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between gap-6">
                            <span style={{ color: colors.tooltipLabel }}>Total Students:</span>
                            <span className="font-semibold" style={{ color: colors.tooltipText }}>{data.total_students}</span>
                        </div>
                        <div className="flex justify-between gap-6">
                            <span style={{ color: colors.tooltipLabel }}>Present Students:</span>
                            <span className="font-semibold text-[var(--color-success)]">{data.present_students}</span>
                        </div>
                        {data.primary_present > 0 && (
                            <div className="flex justify-between gap-6">
                                <span className="text-[var(--color-info)]">Primary Present:</span>
                                <span className="font-semibold text-[var(--color-info)]">{data.primary_present}</span>
                            </div>
                        )}
                        {data.middle_present > 0 && (
                            <div className="flex justify-between gap-6">
                                <span className="text-[var(--primary-600)]">Middle Present:</span>
                                <span className="font-semibold text-[var(--primary-600)]">{data.middle_present}</span>
                            </div>
                        )}
                        <div className="pt-2 border-t" style={{ borderColor: colors.tooltipBorder }}>
                            <div className="flex justify-between gap-4 font-bold">
                                <span style={{ color: colors.tooltipText }}>Attendance Rate:</span>
                                <span className="text-[var(--color-success)]">{data.attendance_rate}%</span>
                            </div>
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
            <AreaChart
                data={formattedData}
                margin={{ top: 10, right: 30, left: 20, bottom: 60 }}
            >
                <defs>
                    <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorPresent" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                </defs>

                <CartesianGrid strokeDasharray="3 3" stroke={colors.grid} vertical={false} />

                <XAxis
                    dataKey="displayDate"
                    stroke={colors.axis}
                    style={{ fontSize: '12px', fontWeight: '500' }}
                    angle={-45}
                    textAnchor="end"
                    height={80}
                    tick={{ fill: colors.text }}
                />

                <YAxis
                    stroke={colors.axis}
                    style={{ fontSize: '12px', fontWeight: '500' }}
                    tick={{ fill: colors.text }}
                    label={{
                        value: 'Students',
                        angle: -90,
                        position: 'insideLeft',
                        style: { fontSize: '13px', fill: colors.text, fontWeight: '600' }
                    }}
                />

                <Tooltip content={<CustomTooltip />} />

                <Legend wrapperStyle={{ color: colors.text }} />

                <Area
                    type="monotone"
                    dataKey="total_students"
                    stroke="#3b82f6"
                    fill="url(#colorTotal)"
                    strokeWidth={2}
                    name="Total Students"
                />

                <Area
                    type="monotone"
                    dataKey="present_students"
                    stroke="#10b981"
                    fill="url(#colorPresent)"
                    strokeWidth={3}
                    name="Present Students"
                />
            </AreaChart>
        </ResponsiveContainer>
    );
};

export default StudentAttendanceChart;
