// File: resources/js/Pages/Dashboard/Dashboard.jsx

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import DashboardWidget from './components/DashboardWidget';
import axios from 'axios';
import { format, startOfMonth, endOfMonth } from 'date-fns';

import {
    Filter,
    RefreshCw
} from 'lucide-react';

const Dashboard = ({ auth, initialSummary, currentYear, currentMonth, schoolType, monthlyReportStatus = {} }) => {
    const [stats, setStats] = useState(initialSummary || {});
    const [loading, setLoading] = useState(false);
    const [selectedMonth, setSelectedMonth] = useState(currentMonth);
    const [selectedYear, setSelectedYear] = useState(currentYear);
    const [showCharts, setShowCharts] = useState(false);
    const [riceBalanceData, setRiceBalanceData] = useState([]);
    const [amountBreakdownData, setAmountBreakdownData] = useState({});
    const [dailyAmountData, setDailyAmountData] = useState([]);
    const [monthlyTrendsData, setMonthlyTrendsData] = useState([]);
    const [studentAttendanceData, setStudentAttendanceData] = useState([]);

    // Month options
    const monthOptions = [
        { value: 1, label: 'January' },
        { value: 2, label: 'February' },
        { value: 3, label: 'March' },
        { value: 4, label: 'April' },
        { value: 5, label: 'May' },
        { value: 6, label: 'June' },
        { value: 7, label: 'July' },
        { value: 8, label: 'August' },
        { value: 9, label: 'September' },
        { value: 10, label: 'October' },
        { value: 11, label: 'November' },
        { value: 12, label: 'December' },
    ];

    // Generate year options (current year and 5 years back)
    const yearOptions = Array.from({ length: 6 }, (_, i) => currentYear - i);

    // Lightweight data fetching - prioritize stats first, charts later
    const fetchDashboardData = useCallback(async () => {
        setLoading(true);

        try {
            // First, fetch only the essential summary data
            const summaryResponse = await axios.get('/api/dashboard/summary', {
                params: {
                    year: selectedYear,
                    month: selectedMonth,
                },
                timeout: 8000 // Reduced timeout
            });

            // Handle summary response immediately
            if (summaryResponse.data) {
                const statsData = summaryResponse.data.success ? summaryResponse.data.data : summaryResponse.data;

                if (statsData && typeof statsData === 'object') {
                    setStats({
                        rice_available: statsData.rice_available || 0,
                        rice_consumed: statsData.rice_consumed || 0,
                        amount_spent: statsData.amount_spent || 0,
                        students_served: statsData.students_served || 0,
                        days_served: statsData.days_served || 0,
                        total_students: statsData.total_students || 0,
                        student_serving_target: statsData.student_serving_target || statsData.total_students || 0,
                        closing_balance: statsData.closing_balance || 0,
                    });
                }
            }

            setLoading(false);

            // Load charts in background after main content is ready
            setTimeout(() => {
                fetchChartData();
            }, 100);

        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            setLoading(false);
        }
    }, [selectedYear, selectedMonth]);

    // Separate function for chart data - loads after main content
    const fetchChartData = useCallback(async () => {
        try {
            const [riceBalanceResponse, amountBreakdownResponse, dailyAmountResponse, trendsResponse, attendanceResponse] = await Promise.allSettled([
                axios.get('/api/dashboard/rice-balance-timeseries', {
                    params: {
                        year: selectedYear,
                        month: selectedMonth
                    },
                    timeout: 8000
                }),
                axios.get('/api/dashboard/amount-breakdown', {
                    params: {
                        year: selectedYear,
                        month: selectedMonth
                    },
                    timeout: 8000
                }),
                axios.get('/api/dashboard/daily-amount-chart', {
                    params: {
                        year: selectedYear,
                        month: selectedMonth
                    },
                    timeout: 8000
                }),
                axios.get('/api/dashboard/monthly-trends', {
                    params: {
                        year: selectedYear,
                        month: selectedMonth,
                    },
                    timeout: 8000
                }),
                axios.get('/api/dashboard/student-attendance', {
                    params: {
                        year: selectedYear,
                        month: selectedMonth
                    },
                    timeout: 8000
                })
            ]);

            // Handle rice balance response
            if (riceBalanceResponse.status === 'fulfilled') {
                const responseData = riceBalanceResponse.value.data;
                const riceData = responseData.success ? responseData.data : responseData;
                if (Array.isArray(riceData)) {
                    setRiceBalanceData(riceData);
                }
            }

            // Handle amount breakdown response
            if (amountBreakdownResponse.status === 'fulfilled') {
                const responseData = amountBreakdownResponse.value.data;
                const amountData = responseData.success ? responseData.data : responseData;
                if (amountData && typeof amountData === 'object' && !Array.isArray(amountData)) {
                    setAmountBreakdownData(amountData);
                }
            }

            // Handle daily amount response
            if (dailyAmountResponse.status === 'fulfilled') {
                const responseData = dailyAmountResponse.value.data;
                const dailyData = responseData.success ? responseData.data : responseData;
                if (Array.isArray(dailyData)) {
                    setDailyAmountData(dailyData);
                }
            }

            // Handle monthly trends response
            if (trendsResponse.status === 'fulfilled') {
                const responseData = trendsResponse.value.data;
                const trendsData = responseData.success ? responseData.data : responseData;
                if (Array.isArray(trendsData)) {
                    setMonthlyTrendsData(trendsData);
                }
            }

            // Handle student attendance response
            if (attendanceResponse.status === 'fulfilled') {
                const responseData = attendanceResponse.value.data;
                const attendanceData = responseData.success ? responseData.data : responseData;
                if (Array.isArray(attendanceData)) {
                    setStudentAttendanceData(attendanceData);
                }
            }

            // Show charts after data is loaded
            setShowCharts(true);

        } catch (error) {
            console.error('Error fetching chart data:', error);
        }
    }, [selectedYear, selectedMonth]);

    // Load data on mount and when filters change
    useEffect(() => {
        fetchDashboardData();
    }, [fetchDashboardData]);

    const applyFilters = (month, year) => {
        router.get(route('dashboard'), { month, year }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleMonthChange = (e) => {
        const newMonth = parseInt(e.target.value);
        setSelectedMonth(newMonth);
        applyFilters(newMonth, selectedYear);
    };

    const handleYearChange = (e) => {
        const newYear = parseInt(e.target.value);
        setSelectedYear(newYear);
        applyFilters(selectedMonth, newYear);
    };

    const handleRefresh = () => {
        applyFilters(selectedMonth, selectedYear);
    };

    // Calculate percentage for students served
    const studentTarget = stats.student_serving_target || 0;
    const studentsPercentage = studentTarget > 0
        ? Math.min(100, Math.round((stats.students_served / studentTarget) * 100))
        : 0;

    // Format currency
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0,
        }).format(amount);
    };

    const getMonthStatus = (year, month) => {
        if (!monthlyReportStatus || !monthlyReportStatus[year]) {
            return {};
        }
        return monthlyReportStatus[year][month] || {};
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={null}
        >
            <Head title="Dashboard" />

            <div className="py-6">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">

                    {/* Filters Section */}
                    <div className="mb-6 flex justify-end">
                        <div className="flex items-center gap-3 bg-white p-2 rounded-lg shadow-sm border border-gray-200">
                            <div className="flex items-center gap-2 bg-[var(--surface-00)] border border-[var(--border-light)] rounded-lg px-3 py-2">
                                <Filter className="w-4 h-4 text-[var(--text-tertiary)]" />
                                <select
                                    value={selectedMonth}
                                    onChange={handleMonthChange}
                                    className="border-0 bg-transparent text-sm font-medium text-[var(--text-secondary)] focus:outline-none focus:ring-0 cursor-pointer"
                                    disabled={loading}
                                >
                                    {monthOptions.map((month) => (
                                        <option key={month.value} value={month.value}>
                                            {month.label}
                                        </option>
                                    ))}
                                </select>

                                <select
                                    value={selectedYear}
                                    onChange={handleYearChange}
                                    className="border-0 bg-transparent text-sm font-medium text-[var(--text-secondary)] focus:outline-none focus:ring-0 cursor-pointer"
                                    disabled={loading}
                                >
                                    {yearOptions.map((year) => (
                                        <option key={year} value={year}>
                                            {year}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <button
                                onClick={handleRefresh}
                                disabled={loading}
                                className="inline-flex items-center justify-center px-4 py-2 bg-[var(--primary-600)] text-white font-medium rounded-lg hover:bg-[var(--primary-700)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm hover:shadow"
                            >
                                <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                                Refresh
                            </button>
                        </div>
                    </div>

                    {/* Loading Overlay */}
                    {loading && (
                        <div className="mb-6 bg-[var(--info-50)] border border-[var(--color-info)] text-[var(--color-info)] px-4 py-3 rounded-lg flex items-center">
                            <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                            <span className="text-sm font-medium">Loading dashboard data...</span>
                        </div>
                    )}

                    {/* Dashboard Widget */}
                    <DashboardWidget
                        stats={stats}
                        loading={loading}
                        showCharts={showCharts}
                        riceBalanceData={riceBalanceData}
                        amountBreakdownData={amountBreakdownData}
                        dailyAmountData={dailyAmountData}
                        monthlyTrendsData={monthlyTrendsData}
                        studentAttendanceData={studentAttendanceData}
                        schoolType={schoolType}
                        formatCurrency={formatCurrency}
                        studentsPercentage={studentsPercentage}
                        studentTarget={studentTarget}
                    />

                    {/* Monthly Report Status Table */}
                    <div className="mt-8 bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 bg-white border-b border-gray-200">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Monthly Report Status ({selectedYear})</h3>
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Month</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rice Report</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount Report</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {monthOptions.map((month) => {
                                            const status = getMonthStatus(selectedYear, month.value);
                                            return (
                                                <tr key={month.value}>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                        {month.label}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                        {status.has_rice_report ? (
                                                            <Link
                                                                href={route('rice-reports.index', { month: month.value, year: currentYear })}
                                                                className="text-blue-600 hover:text-blue-900 hover:underline"
                                                            >
                                                                View Report
                                                            </Link>
                                                        ) : (
                                                            <span className="text-gray-400">Not generated</span>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                        {status.has_amount_report ? (
                                                            <Link
                                                                href={route('amount-reports.index', { month: month.value, year: currentYear })}
                                                                className="text-blue-600 hover:text-blue-900 hover:underline"
                                                            >
                                                                View Report
                                                            </Link>
                                                        ) : (
                                                            <span className="text-gray-400">Not generated</span>
                                                        )}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </AuthenticatedLayout>
    );
};

export default Dashboard;