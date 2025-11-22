// File: resources/js/Pages/Dashboard/Dashboard.jsx

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import StatCard from './components/StatCard';
import SupportChatWidget from '@/Components/SupportChatWidget.jsx';
import axios from 'axios';
import { format, startOfMonth, endOfMonth } from 'date-fns';

// Lightweight chart components - load only when needed
const LazyChartCard = React.lazy(() => import('./components/ChartCard'));
const LazyRiceBalanceChart = React.lazy(() => import('./components/RiceBalanceChart'));
const LazyAmountBreakdownChart = React.lazy(() => import('./components/AmountBreakdownChart'));
const LazyDailyAmountChart = React.lazy(() => import('./components/DailyAmountChart'));
const LazyMonthlyTrendsChart = React.lazy(() => import('./components/MonthlyTrendsChart'));
const LazyStudentAttendanceChart = React.lazy(() => import('./components/StudentAttendanceChart'));

import {
    Package,
    TrendingDown,
    Users,
    DollarSign,
    Calendar,
    RefreshCw,
    Filter,
    BarChart3,
    PieChart
} from 'lucide-react';

const Dashboard = ({ auth, initialSummary, currentYear, currentMonth, schoolType, monthlyReportStatus = {} }) => {
    const [stats, setStats] = useState(initialSummary || {});
    const [loading, setLoading] = useState(false);
    const [selectedMonth, setSelectedMonth] = useState(currentMonth);
    const [selectedYear, setSelectedYear] = useState(currentYear);
    const [dateRange, setDateRange] = useState({
        start: format(startOfMonth(new Date(currentYear, currentMonth - 1, 1)), 'yyyy-MM-dd'),
        end: format(endOfMonth(new Date(currentYear, currentMonth - 1, 1)), 'yyyy-MM-dd'),
    });
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

    // Simplified time display - no real-time updates to reduce re-renders
    const currentTime = useMemo(() => {
        const now = new Date();
        return now.toLocaleString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }, []);

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

    // Memoize date range calculation
    const memoizedDateRange = useMemo(() => {
        const date = new Date(selectedYear, selectedMonth - 1, 1);
        const start = format(startOfMonth(date), 'yyyy-MM-dd');
        const end = format(endOfMonth(date), 'yyyy-MM-dd');
        return { start, end };
    }, [selectedMonth, selectedYear]);

    // Update date range when month/year changes
    useEffect(() => {
        setDateRange(memoizedDateRange);
    }, [memoizedDateRange]);

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
    const studentsPercentage = stats.total_students > 0
        ? Math.round((stats.students_served / stats.total_students) * 100)
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
            header={
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h2 className="text-3xl font-bold text-[var(--text-primary)]">
                            Dashboard
                        </h2>
                        <p className="text-sm text-[var(--text-secondary)] mt-1">
                            {currentTime}
                        </p>
                    </div>

                    {/* Filters */}
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2 bg-[var(--surface-00)] border border-[var(--border-light)] rounded-lg px-3 py-2">
                            <Filter className="w-4 h-4 text-[var(--text-tertiary)]" />
                            <select
                                value={selectedMonth}
                                onChange={handleMonthChange}
                                className="border-0 bg-transparent text-sm font-medium text-[var(--text-secondary)] focus:outline-none focus:ring-0 cursor-pointer"
                                disabled={loading}
                            >
                                {monthOptions.map((month) => (
                                    <option key={month.value} value={month.value} className="">
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
                                    <option key={year} value={year} className="">
                                        {year}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <button
                            onClick={handleRefresh}
                            disabled={loading}
                            className="inline-flex items-center justify-center px-4 py-2 bg-[var(--primary-600)] text-white font-medium rounded-lg hover:bg-[var(--primary-700)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500  disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm hover:shadow"
                        >
                            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                            Refresh
                        </button>
                    </div>
                </div>
            }
        >
            <Head title="Dashboard" />

            <div className="py-6">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">

                    {/* Loading Overlay */}
                    {loading && (
                        <div className="mb-6 bg-[var(--info-50)] border border-[var(--color-info)] text-[var(--color-info)] px-4 py-3 rounded-lg flex items-center">
                            <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                            <span className="text-sm font-medium">Loading dashboard data...</span>
                        </div>
                    )}

                    {/* Stats Cards Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        {/* Rice Available Card */}
                        <StatCard
                            title="Rice Available"
                            value={`${(stats.rice_available || 0).toLocaleString()} kg`}
                            subtitle="Current Stock"
                            icon={Package}
                            variant="primary"
                            loading={loading}
                        />

                        {/* Monthly Consumption Card */}
                        <StatCard
                            title="Monthly Consumption"
                            value={`${(stats.rice_consumed || 0).toLocaleString()} kg`}
                            subtitle={`${stats.days_served || 0} days served`}
                            icon={TrendingDown}
                            variant="warning"
                            loading={loading}
                        />

                        {/* Monthly Spending Card */}
                        <StatCard
                            title="Monthly Spending"
                            value={formatCurrency(stats.amount_spent || 0).replace('₹', '₹')}
                            subtitle="This Month"
                            icon={DollarSign}
                            variant="success"
                            loading={loading}
                        />

                        {/* Students Served Card */}
                        <StatCard
                            title="Students Served"
                            value={(stats.students_served || 0).toLocaleString()}
                            subtitle={`${studentsPercentage}% of ${stats.total_students || 0} total`}
                            icon={Users}
                            variant="info"
                            loading={loading}
                        />
                    </div>

                    {/* Charts Section - Load only when ready */}
                    {showCharts && (
                        <React.Suspense fallback={
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                                {[1, 2].map(i => (
                                    <div key={i} className="bg-[var(--surface-00)] rounded-lg shadow p-6 h-80">
                                        <div className="animate-pulse">
                                            <div className="h-6 bg-[var(--surface-10)] rounded w-1/3 mb-4"></div>
                                            <div className="h-64 bg-[var(--surface-10)] rounded"></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        }>
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                                {/* Rice Balance Chart */}
                                <LazyChartCard
                                    title="Rice Balance Trend"
                                    subtitle="Last 30 Days"
                                    icon={BarChart3}
                                    isEmpty={!riceBalanceData || riceBalanceData.length === 0}
                                    emptyMessage="No rice balance data available"
                                    height="h-80"
                                >
                                    {riceBalanceData && riceBalanceData.length > 0 && (
                                        <LazyRiceBalanceChart
                                            data={riceBalanceData}
                                            schoolType={schoolType}
                                        />
                                    )}
                                </LazyChartCard>

                                {/* Amount Breakdown Chart */}
                                <LazyChartCard
                                    title="Amount Breakdown"
                                    subtitle="This Month"
                                    icon={PieChart}
                                    isEmpty={!amountBreakdownData || Object.keys(amountBreakdownData).length === 0}
                                    emptyMessage="No amount breakdown data available"
                                    height="h-80"
                                >
                                    {amountBreakdownData && Object.keys(amountBreakdownData).length > 0 && (
                                        <LazyAmountBreakdownChart
                                            data={amountBreakdownData}
                                            isDonut={true}
                                        />
                                    )}
                                </LazyChartCard>
                            </div>

                            {/* Daily Amount Chart */}
                            <div className="mb-8">
                                <LazyChartCard
                                    title="Daily Spending"
                                    subtitle="Last 30 Days"
                                    icon={BarChart3}
                                    isEmpty={!dailyAmountData || dailyAmountData.length === 0}
                                    emptyMessage="No daily spending data available"
                                    height="h-80"
                                >
                                    {dailyAmountData && dailyAmountData.length > 0 && (
                                        <LazyDailyAmountChart
                                            data={dailyAmountData}
                                            schoolType={schoolType}
                                        />
                                    )}
                                </LazyChartCard>
                            </div>



                            {/* Performance and Trends Row */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                                {/* Weekly Trends Chart (for current month) */}
                                <LazyChartCard
                                    title="Weekly Trends"
                                    subtitle="Current Month"
                                    icon={TrendingDown}
                                    isEmpty={!monthlyTrendsData || monthlyTrendsData.length === 0}
                                    emptyMessage="No monthly trends data available"
                                    height="h-80"
                                >
                                    {monthlyTrendsData && monthlyTrendsData.length > 0 && (
                                        <LazyMonthlyTrendsChart
                                            data={monthlyTrendsData}
                                        />
                                    )}
                                </LazyChartCard>

                                {/* Student Attendance Chart */}
                                <LazyChartCard
                                    title="Student Attendance"
                                    subtitle="This Month"
                                    icon={BarChart3}
                                    isEmpty={!studentAttendanceData || studentAttendanceData.length === 0}
                                    emptyMessage="No attendance data available"
                                    height="h-80"
                                >
                                    {studentAttendanceData && studentAttendanceData.length > 0 && (
                                        <LazyStudentAttendanceChart
                                            data={studentAttendanceData}
                                            schoolType={schoolType}
                                        />
                                    )}
                                </LazyChartCard>
                            </div>

                            {/* Reports Table */}
                            <div className="bg-white overflow-hidden shadow-sm rounded-lg mb-8">
                                <div className="p-6 border-b border-gray-200">
                                    <h3 className="text-lg font-medium text-gray-900">Monthly Reports</h3>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">S.No</th>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Month</th>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rice Report</th>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount Report</th>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kiryana Bill</th>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fuel Bill</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {monthOptions.map((month, index) => {
                                                const status = getMonthStatus(currentYear, month.value);

                                                return (
                                                    <tr key={month.value}>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{index + 1}</td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{month.label}</td>
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
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                            {status.has_kiryana_bill ? (
                                                                <Link
                                                                    href={route('amount-reports.index', { month: month.value, year: currentYear })}
                                                                    className="text-blue-600 hover:text-blue-900 hover:underline"
                                                                >
                                                                    View Bills
                                                                </Link>
                                                            ) : (
                                                                <span className="text-gray-400">Not generated</span>
                                                            )}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                            {status.has_fuel_bill ? (
                                                                <Link
                                                                    href={route('amount-reports.index', { month: month.value, year: currentYear })}
                                                                    className="text-blue-600 hover:text-blue-900 hover:underline"
                                                                >
                                                                    View Bills
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
                        </React.Suspense>
                    )}

                    {/* Show Charts Button */}
                    {!showCharts && (
                        <div className="text-center mb-8">
                            <button
                                onClick={() => setShowCharts(true)}
                                className="inline-flex items-center px-6 py-3 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition-colors"
                            >
                                <BarChart3 className="w-5 h-5 mr-2" />
                                Load Charts
                            </button>
                        </div>
                    )}
                </div>
            </div>
            <SupportChatWidget />
        </AuthenticatedLayout>
    );
};

export default Dashboard;