// File: resources/js/Components/DailyConsumption/Charts/RiceStockChart.jsx
// Chart component for visualizing rice stock trends
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import {
    LineChart,
    Line,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from 'recharts';
import {
    TrendingUp,
    BarChart3,
    LineChart as LineChartIcon,
} from 'lucide-react';

/**
 * Rice Stock Chart Component
 * 
 * Displays rice stock data in various chart formats:
 * - Line chart for trends over time
 * - Bar chart for comparisons
 * 
 * @param {Array} data - Array of data points with:
 *   - date: Date string
 *   - opening: Opening balance
 *   - received: Rice received
 *   - consumed: Rice consumed
 *   - closing: Closing balance
 * @param {string} chartType - Type of chart: "line" | "bar"
 * @param {string} title - Chart title
 * @param {boolean} showControls - Whether to show chart type controls
 * @param {string} className - Additional CSS classes
 * 
 * @example
 * <RiceStockChart
 *     data={chartData}
 *     chartType="line"
 *     title="Rice Stock Trends"
 *     showControls={true}
 * />
 */
export default function RiceStockChart({
    data = [],
    chartType: initialChartType = 'line',
    title = 'Rice Stock Trends',
    showControls = true,
    className = '',
}) {
    const [chartType, setChartType] = useState(initialChartType);

    // Format data for chart
    const formattedData = data.map((entry) => {
        const date = new Date(entry.date);
        return {
            date: date.toLocaleDateString('en-IN', {
                day: '2-digit',
                month: 'short',
            }),
            fullDate: entry.date,
            'Opening Balance': parseFloat(entry.opening || entry.opening_balance || 0),
            'Received': parseFloat(entry.received || entry.rice_received || 0),
            'Consumed': parseFloat(entry.consumed || entry.rice_consumed || 0),
            'Closing Balance': parseFloat(entry.closing || entry.closing_balance || 0),
        };
    });

    // Custom tooltip
    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
                    <p className="font-semibold text-gray-900 mb-2">{label}</p>
                    {payload.map((entry, index) => (
                        <p key={index} className="text-sm" style={{ color: entry.color }}>
                            {entry.name}: <span className="font-semibold">
                                {entry.value.toFixed(2)} kg
                            </span>
                        </p>
                    ))}
                </div>
            );
        }
        return null;
    };

    // Empty state
    if (!data || data.length === 0) {
        return (
            <Card className={className}>
                <CardHeader>
                    <CardTitle className="text-lg font-semibold flex items-center">
                        <TrendingUp className="w-5 h-5 mr-2 text-blue-600" />
                        {title}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-12">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                            <BarChart3 className="w-8 h-8 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                            No Data Available
                        </h3>
                        <p className="text-sm text-gray-500">
                            Add rice stock entries to see trends and visualizations.
                        </p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className={className}>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle className="text-lg font-semibold flex items-center">
                        <TrendingUp className="w-5 h-5 mr-2 text-blue-600" />
                        {title}
                    </CardTitle>
                    
                    {showControls && (
                        <div className="flex items-center gap-2">
                            <Button
                                variant={chartType === 'line' ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => setChartType('line')}
                            >
                                <LineChartIcon className="w-4 h-4 mr-2" />
                                Line
                            </Button>
                            <Button
                                variant={chartType === 'bar' ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => setChartType('bar')}
                            >
                                <BarChart3 className="w-4 h-4 mr-2" />
                                Bar
                            </Button>
                        </div>
                    )}
                </div>
            </CardHeader>
            <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                    {chartType === 'line' ? (
                        <LineChart data={formattedData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                            <XAxis
                                dataKey="date"
                                stroke="#6b7280"
                                style={{ fontSize: '12px' }}
                            />
                            <YAxis
                                stroke="#6b7280"
                                style={{ fontSize: '12px' }}
                                label={{
                                    value: 'Quantity (kg)',
                                    angle: -90,
                                    position: 'insideLeft',
                                    style: { fontSize: '12px', fill: '#6b7280' },
                                }}
                            />
                            <Tooltip content={<CustomTooltip />} />
                            <Legend
                                wrapperStyle={{ fontSize: '12px' }}
                                iconType="line"
                            />
                            <Line
                                type="monotone"
                                dataKey="Opening Balance"
                                stroke="#10b981"
                                strokeWidth={2}
                                dot={{ r: 4 }}
                                activeDot={{ r: 6 }}
                            />
                            <Line
                                type="monotone"
                                dataKey="Received"
                                stroke="#3b82f6"
                                strokeWidth={2}
                                dot={{ r: 4 }}
                                activeDot={{ r: 6 }}
                            />
                            <Line
                                type="monotone"
                                dataKey="Consumed"
                                stroke="#f59e0b"
                                strokeWidth={2}
                                dot={{ r: 4 }}
                                activeDot={{ r: 6 }}
                            />
                            <Line
                                type="monotone"
                                dataKey="Closing Balance"
                                stroke="#ef4444"
                                strokeWidth={2}
                                dot={{ r: 4 }}
                                activeDot={{ r: 6 }}
                            />
                        </LineChart>
                    ) : (
                        <BarChart data={formattedData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                            <XAxis
                                dataKey="date"
                                stroke="#6b7280"
                                style={{ fontSize: '12px' }}
                            />
                            <YAxis
                                stroke="#6b7280"
                                style={{ fontSize: '12px' }}
                                label={{
                                    value: 'Quantity (kg)',
                                    angle: -90,
                                    position: 'insideLeft',
                                    style: { fontSize: '12px', fill: '#6b7280' },
                                }}
                            />
                            <Tooltip content={<CustomTooltip />} />
                            <Legend
                                wrapperStyle={{ fontSize: '12px' }}
                                iconType="rect"
                            />
                            <Bar
                                dataKey="Opening Balance"
                                fill="#10b981"
                                radius={[4, 4, 0, 0]}
                            />
                            <Bar
                                dataKey="Received"
                                fill="#3b82f6"
                                radius={[4, 4, 0, 0]}
                            />
                            <Bar
                                dataKey="Consumed"
                                fill="#f59e0b"
                                radius={[4, 4, 0, 0]}
                            />
                            <Bar
                                dataKey="Closing Balance"
                                fill="#ef4444"
                                radius={[4, 4, 0, 0]}
                            />
                        </BarChart>
                    )}
                </ResponsiveContainer>

                {/* Chart Legend Description */}
                <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-green-500"></div>
                        <span className="text-sm text-gray-600">Opening Balance</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                        <span className="text-sm text-gray-600">Received</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                        <span className="text-sm text-gray-600">Consumed</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-red-500"></div>
                        <span className="text-sm text-gray-600">Closing Balance</span>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}