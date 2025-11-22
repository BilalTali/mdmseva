import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import { 
    Package,
    TrendingUp,
    TrendingDown,
    Users,
    DollarSign,
    Calendar,
    RefreshCw,
    Filter,
    ChevronRight,
    ArrowUpRight,
    ArrowDownRight,
    Activity,
    BarChart3,
    PieChart
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/Components/ui/card';
import StatCard from './components/StatCard';
import ChartCard from './components/ChartCard';
import RiceBalanceChart from './components/RiceBalanceChart';
import AmountBreakdownChart from './components/AmountBreakdownChart';
import DailyAmountChart from './components/DailyAmountChart';
import RecentConsumptions from './components/RecentConsumptions';
import ActivityFeed from './components/ActivityFeed';
import { dashboardApi } from './api';
import SupportChatWidget from '@/Components/SupportChatWidget.jsx';

export default function Dashboard({ auth, defaults, quickStats, schoolTypes }) {
    // State Management
    const [loading, setLoading] = useState(false);
    const [selectedMonth, setSelectedMonth] = useState(defaults.month);
    const [selectedYear, setSelectedYear] = useState(defaults.year);
    const [dateRange, setDateRange] = useState({
        start: defaults.dateRange.start,
        end: defaults.dateRange.end,
    });
    
    // Dashboard data state
    const [stats, setStats] = useState(quickStats || {
        totalRiceAvailable: 0,
        monthlyConsumption: 0,
        monthlySpending: 0,
        studentsServedThisMonth: 0,
        daysServedThisMonth: 0,
        totalStudents: 0,
    });
    const [riceBalanceData, setRiceBalanceData] = useState([]);
    const [amountBreakdownData, setAmountBreakdownData] = useState({});
    const [dailyAmountData, setDailyAmountData] = useState([]);

    // Generate year options (current year and 5 years back)
    const yearOptions = Array.from({ length: 6 }, (_, i) => defaults.year - i);
    
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

    // Get school type
    const schoolType = defaults.schoolType || 'primary';

    // Fetch all dashboard data
    const fetchDashboardData = async () => {
        setLoading(true);
        console.log(' Fetching dashboard data for:', { year: selectedYear, month: selectedMonth });
        
        try {
            // Fetch summary statistics
            console.log(' Fetching summary statistics...');
            const summaryResponse = await dashboardApi.getSummary({
                year: selectedYear,
                month: selectedMonth,
            });
            console.log(' Summary response:', summaryResponse);
            if (summaryResponse.success) {
                setStats({
                    totalRiceAvailable: summaryResponse.data.rice_available || 0,
                    monthlyConsumption: summaryResponse.data.rice_consumed || 0,
                    monthlySpending: summaryResponse.data.amount_spent || 0,
                    studentsServedThisMonth: summaryResponse.data.students_served || 0,
                    daysServedThisMonth: summaryResponse.data.days_served || 0,
                    totalStudents: summaryResponse.data.total_students || 0,
                });
            } else {
                console.error(' Summary API failed:', summaryResponse.error);
            }

            // Fetch rice balance timeseries
            console.log(' Fetching rice balance chart data...');
            const riceBalanceResponse = await dashboardApi.getRiceBalanceTimeseries({
                year: selectedYear,
                month: selectedMonth,
            });
            console.log(' Rice balance response:', riceBalanceResponse);
            if (riceBalanceResponse.success) {
                setRiceBalanceData(riceBalanceResponse.data || []);
                console.log(' Rice balance data set:', riceBalanceResponse.data?.length || 0, 'entries');
            } else {
                console.error(' Rice balance API failed:', riceBalanceResponse.error);
                setRiceBalanceData([]);
            }

            // Fetch amount breakdown
            console.log(' Fetching amount breakdown chart data...');
            const amountBreakdownResponse = await dashboardApi.getAmountBreakdown({
                year: selectedYear,
                month: selectedMonth,
            });
            console.log(' Amount breakdown response:', amountBreakdownResponse);
            if (amountBreakdownResponse.success) {
                setAmountBreakdownData(amountBreakdownResponse.data || {});
                console.log(' Amount breakdown data set:', amountBreakdownResponse.data);
            } else {
                console.error(' Amount breakdown API failed:', amountBreakdownResponse.error);
                setAmountBreakdownData({});
            }

            // Fetch daily amount chart
            console.log(' Fetching daily amount chart data...');
            const dailyAmountResponse = await dashboardApi.getDailyAmountChart({
                year: selectedYear,
                month: selectedMonth,
            });
            console.log(' Daily amount response:', dailyAmountResponse);
            if (dailyAmountResponse.success) {
                setDailyAmountData(dailyAmountResponse.data || []);
                console.log(' Daily amount data set:', dailyAmountResponse.data?.length || 0, 'entries');
            } else {
                console.error(' Daily amount API failed:', dailyAmountResponse.error);
                setDailyAmountData([]);
            }

        } catch (error) {
            console.error(' Critical error fetching dashboard data:', error);
            // Reset data on error
            setRiceBalanceData([]);
            setAmountBreakdownData({});
            setDailyAmountData([]);
        } finally {
            setLoading(false);
            console.log(' Dashboard data fetch completed');
        }
    };

    // Update date range when month/year changes
    useEffect(() => {
        const date = new Date(selectedYear, selectedMonth - 1, 1);
        const start = format(startOfMonth(date), 'yyyy-MM-dd');
        const end = format(endOfMonth(date), 'yyyy-MM-dd');
        setDateRange({ start, end });
    }, [selectedMonth, selectedYear]);

    // Fetch data when date range changes
    useEffect(() => {
        fetchDashboardData();
    }, [dateRange]);

    // Handle month change
    const handleMonthChange = (e) => {
        setSelectedMonth(parseInt(e.target.value));
    };

    // Handle year change
    const handleYearChange = (e) => {
        setSelectedYear(parseInt(e.target.value));
    };

    // Refresh data
    const handleRefresh = () => {
        fetchDashboardData();
    };

    // Calculate percentage for students served
    const studentsPercentage = stats.totalStudents > 0 
        ? Math.round((stats.studentsServedThisMonth / stats.totalStudents) * 100)
        : 0;

    // Format currency
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0,
        }).format(amount);
    };

    // Check if amount breakdown data is effectively empty (all totals are zero or missing)
    const isAmountBreakdownEmpty = !amountBreakdownData || [
        'pulses_total',
        'vegetables_total',
        'oil_total',
        'salt_total',
        'fuel_total',
    ].every((key) => {
        const value = parseFloat(amountBreakdownData[key] ?? 0);
        return !value || value <= 0;
    });

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h2 className="text-3xl font-bold text-secondary-900">
                            Dashboard
                        </h2>
                        <p className="text-sm text-secondary-600 mt-1">
                            Welcome back, <span className="font-semibold text-primary-600">{auth.user.name}</span>
                        </p>
                    </div>
                    
                    {/* Filters */}
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2 bg-card border border-secondary-200 rounded-lg px-3 py-2">
                            <Filter className="w-4 h-4 text-secondary-500" />
                            <select
                                value={selectedMonth}
                                onChange={handleMonthChange}
                                className="border-0 bg-transparent text-sm font-medium text-secondary-700 focus:outline-none focus:ring-0 cursor-pointer"
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
                                className="border-0 bg-transparent text-sm font-medium text-secondary-700 focus:outline-none focus:ring-0 cursor-pointer"
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
                            className="inline-flex items-center justify-center px-4 py-2 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm hover:shadow"
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
                        <div className="mb-6 bg-info-50 border border-info-200 text-info-700 px-4 py-3 rounded-lg flex items-center">
                            <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                            <span className="text-sm font-medium">Loading dashboard data...</span>
                        </div>
                    )}

                    {/* Stats Cards Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        {/* Rice Available Card */}
                        <StatCard
                            title="Rice Available"
                            value={`${stats.totalRiceAvailable?.toLocaleString() || 0} kg`}
                            subtitle="Current Stock"
                            icon={Package}
                            variant="primary"
                            loading={loading}
                        />

                        {/* Monthly Consumption Card */}
                        <StatCard
                            title="Monthly Consumption"
                            value={`${stats.monthlyConsumption?.toLocaleString() || 0} kg`}
                            subtitle={`${stats.daysServedThisMonth || 0} days served`}
                            icon={TrendingDown}
                            variant="warning"
                            loading={loading}
                        />

                        {/* Monthly Spending Card */}
                        <StatCard
                            title="Monthly Spending"
                            value={formatCurrency(stats.monthlySpending || 0).replace('₹', '₹')}
                            subtitle="This Month"
                            icon={DollarSign}
                            variant="success"
                            loading={loading}
                        />

                        {/* Students Served Card */}
                        <StatCard
                            title="Students Served"
                            value={stats.studentsServedThisMonth?.toLocaleString() || 0}
                            subtitle={`${studentsPercentage}% of ${stats.totalStudents || 0} total`}
                            icon={Users}
                            variant="info"
                            loading={loading}
                        />
                    </div>

                    {/* Charts Section */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                        {/* Rice Balance Chart */}
                        <ChartCard
                            title="Rice Balance Trend"
                            subtitle="Last 30 Days"
                            icon={BarChart3}
                            loading={loading}
                            isEmpty={!riceBalanceData || riceBalanceData.length === 0}
                            emptyMessage="No rice balance data available"
                            height="h-80"
                        >
                            <RiceBalanceChart 
                                data={riceBalanceData}
                                schoolType={schoolType}
                            />
                        </ChartCard>

                        {/* Amount Breakdown Chart */}
                        <ChartCard
                            title="Amount Breakdown"
                            subtitle="This Month"
                            icon={PieChart}
                            loading={loading}
                            isEmpty={isAmountBreakdownEmpty}
                            emptyMessage="No amount breakdown data available"
                            height="h-80"
                        >
                            <AmountBreakdownChart 
                                data={amountBreakdownData}
                                isDonut={true}
                            />
                        </ChartCard>
                    </div>

                    {/* Daily Amount Chart */}
                    <div className="mb-8">
                        <ChartCard
                            title="Daily Spending"
                            subtitle="Last 30 Days"
                            icon={BarChart3}
                            loading={loading}
                            isEmpty={!dailyAmountData || dailyAmountData.length === 0}
                            emptyMessage="No daily spending data available"
                            height="h-80"
                        >
                            <DailyAmountChart 
                                data={dailyAmountData}
                                schoolType={schoolType}
                            />
                        </ChartCard>
                    </div>

                    {/* Recent Activity Section */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Recent Consumptions */}
                        <RecentConsumptions
                            selectedMonth={selectedMonth}
                            selectedYear={selectedYear}
                            schoolType={schoolType}
                            limit={5}
                            showPagination={false}
                        />

                        {/* Activity Feed */}
                        <ActivityFeed
                            userId={auth.user.id}
                            limit={10}
                            autoRefresh={false}
                        />
                    </div>

                </div>
            </div>
            <SupportChatWidget />
        </AuthenticatedLayout>
    );
}