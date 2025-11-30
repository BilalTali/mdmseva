import React from 'react';
import StatCard from './StatCard';
import {
    Package,
    TrendingDown,
    Users,
    DollarSign,
    RefreshCw
} from 'lucide-react';

// Lazy load charts
const LazyChartCard = React.lazy(() => import('./ChartCard'));
const LazyRiceBalanceChart = React.lazy(() => import('./RiceBalanceChart'));
const LazyAmountBreakdownChart = React.lazy(() => import('./AmountBreakdownChart'));
const LazyDailyAmountChart = React.lazy(() => import('./DailyAmountChart'));
const LazyMonthlyTrendsChart = React.lazy(() => import('./MonthlyTrendsChart'));
const LazyStudentAttendanceChart = React.lazy(() => import('./StudentAttendanceChart'));

const DashboardWidget = ({
    stats,
    loading,
    showCharts,
    riceBalanceData,
    amountBreakdownData,
    dailyAmountData,
    monthlyTrendsData,
    studentAttendanceData,
    schoolType,
    formatCurrency,
    studentsPercentage,
    studentTarget
}) => {
    return (
        <div className="space-y-6">
            {/* Stats Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Rice Available Card */}
                <StatCard
                    title="Rice Available"
                    value={`${(stats.rice_available || 0).toLocaleString()} kg`}
                    subtitle="Current Stock"
                    icon={Package}
                    variant="primary"
                    loading={loading}
                />

                {/* Total Rice Consumption & Closing Balance Card */}
                <StatCard
                    title="Total Rice"
                    value={`${(stats.rice_consumed || 0).toLocaleString()} kg`}
                    subtitle={`Closing balance: ${(stats.closing_balance || 0).toLocaleString()} kg`}
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
                    subtitle={`${studentsPercentage}% of ${(studentTarget || stats.total_students || 0).toLocaleString()} target`}
                    icon={Users}
                    variant="info"
                    loading={loading}
                />
            </div>

            {/* Charts Section */}
            {showCharts && (
                <React.Suspense fallback={
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Rice Balance Chart */}
                        <LazyChartCard
                            title="Rice Balance Trend"
                            subtitle="Opening vs Closing Balance"
                        >
                            <LazyRiceBalanceChart
                                data={riceBalanceData}
                                schoolType={schoolType}
                                useAreaChart={true}
                            />
                        </LazyChartCard>

                        {/* Daily Amount Chart */}
                        <LazyChartCard
                            title="Daily Expenditure"
                            subtitle="Cost per day vs Limit"
                        >
                            <LazyDailyAmountChart
                                data={dailyAmountData}
                                schoolType={schoolType}
                                showBreakdown={true}
                            />
                        </LazyChartCard>

                        {/* Amount Breakdown Chart */}
                        <LazyChartCard
                            title="Cost Distribution"
                            subtitle="Expenditure by Component"
                        >
                            <LazyAmountBreakdownChart
                                data={amountBreakdownData}
                            />
                        </LazyChartCard>

                        {/* Monthly Trends Chart */}
                        <LazyChartCard
                            title="Weekly Performance"
                            subtitle="Consumption & Attendance Trends"
                        >
                            <LazyMonthlyTrendsChart
                                data={monthlyTrendsData}
                            />
                        </LazyChartCard>

                        {/* Student Attendance Chart */}
                        <LazyChartCard
                            title="Student Attendance"
                            subtitle="Daily Attendance vs Enrollment"
                            className="lg:col-span-2"
                        >
                            <LazyStudentAttendanceChart
                                data={studentAttendanceData}
                            />
                        </LazyChartCard>
                    </div>
                </React.Suspense>
            )}
        </div>
    );
};

export default DashboardWidget;
