// ============================================
// FILE 2 of 2: resources/js/Pages/Admin/Dashboard.jsx
// Location: resources/js/Pages/Admin/Dashboard.jsx
// 
// INSTRUCTIONS:
// 1. Replace your existing Dashboard.jsx with this complete file
// 2. This adds the feedback card between stat cards and charts
// 3. Import lucide-react icons at the top
// 4. Add feedbackStats to component props
// ============================================

import { Head, router, Link } from '@inertiajs/react';
import { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import FilterPanel from '@/Components/Admin/FilterPanel';
import StatCard from '@/Components/Admin/StatCard';
import { MessageCircle, AlertCircle, CheckCircle, Clock, Star, TrendingUp } from 'lucide-react';

export default function AdminDashboard({
    auth,
    statistics = {},
    filters = {},
    feedbackStats = {} // ADD THIS PROP
}) {
    const [isExporting, setIsExporting] = useState(false);

    const handleFilterApply = (newFilters) => {
        router.get(route('admin.dashboard'), newFilters, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleFilterReset = () => {
        router.get(route('admin.dashboard'), {}, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleExport = () => {
        setIsExporting(true);
        window.location.href = route('admin.dashboard.export', filters);
        setTimeout(() => setIsExporting(false), 2000);
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold leading-tight text-gray-800">
                        Admin Dashboard
                    </h2>
                    <button
                        onClick={handleExport}
                        disabled={isExporting}
                        className="inline-flex items-center px-4 py-2 bg-indigo-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-indigo-700 active:bg-indigo-900 focus:outline-none focus:border-indigo-900 focus:ring ring-indigo-300 disabled:opacity-50 transition-all ease-in-out duration-150"
                    >
                        {isExporting ? (
                            <>
                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Exporting...
                            </>
                        ) : (
                            <>
                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                Export Data
                            </>
                        )}
                    </button>
                </div>
            }
        >
            <Head title="Admin Dashboard" />

            <div className="py-6">
                {/* Filters */}
                <FilterPanel
                    onApply={handleFilterApply}
                    onReset={handleFilterReset}
                    showDateFilters={true}
                    showSchoolTypeFilter={false}
                    showStatusFilter={false}
                    defaultFilters={filters}
                />

                {/* Summary Statistics Cards */}
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-6">
                    {(() => {
                        const schoolStats = statistics.school_stats || {};
                        const periodStats = statistics.period_stats || {};
                        const totalSchools = schoolStats.total || 0;
                        const activeSchools = schoolStats.active || 0;
                        const inactiveSchools = schoolStats.inactive || 0;
                        const riceConsumed = Number(periodStats.rice_consumed || 0);
                        const amountSpent = Number(periodStats.amount_spent || 0);
                        const totalStudentsServed = Number(periodStats.students_served || 0);
                        const primaryStudents = Number(periodStats.primary_students || 0);
                        const middleStudents = Number(periodStats.middle_students || 0);

                        const ricePrimary = Number(periodStats.rice_primary || 0);
                        const riceMiddle = Number(periodStats.rice_middle || 0);
                        const amountPrimary = Number(periodStats.amount_primary || 0);
                        const amountMiddle = Number(periodStats.amount_middle || 0);

                        return (
                            <>
                                <StatCard
                                    title="Total Schools"
                                    value={totalSchools}
                                    subtitle={`Active: ${activeSchools} | Inactive: ${inactiveSchools}`}
                                    icon={
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                        </svg>
                                    }
                                    color="blue"
                                    onClick={() => router.visit(route('admin.schools.index'))}
                                />

                                <StatCard
                                    title="Rice Consumed"
                                    value={riceConsumed.toFixed(2)}
                                    unit="kg"
                                    subtitle={`Primary: ${ricePrimary.toFixed(2)} | Middle: ${riceMiddle.toFixed(2)}`}
                                    icon={
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                        </svg>
                                    }
                                    color="green"
                                    trend={statistics.rice_trend}
                                />

                                <StatCard
                                    title="Amount Spent"
                                    value={`₹${amountSpent.toLocaleString('en-IN')}`}
                                    subtitle={`Primary: ₹${amountPrimary.toLocaleString('en-IN')} | Middle: ₹${amountMiddle.toLocaleString('en-IN')}`}
                                    icon={
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    }
                                    color="orange"
                                    trend={statistics.amount_trend}
                                />

                                <StatCard
                                    title="Students Served"
                                    value={totalStudentsServed.toLocaleString('en-IN')}
                                    subtitle={`Primary: ${primaryStudents.toLocaleString('en-IN')} | Middle: ${middleStudents.toLocaleString('en-IN')}`}
                                    icon={
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                        </svg>
                                    }
                                    color="purple"
                                />
                            </>
                        );
                    })()}
                </div>

                {/* ========================================
                    NEW: FEEDBACK MANAGEMENT CARD 
                    ======================================== */}
                <div className="mb-6">
                    <div className="bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 rounded-xl shadow-lg p-6 text-white relative overflow-hidden">
                        {/* Background decoration */}
                        <div className="absolute top-0 right-0 -mt-4 -mr-4 w-40 h-40 bg-white opacity-10 rounded-full"></div>
                        <div className="absolute bottom-0 left-0 -mb-8 -ml-8 w-32 h-32 bg-white opacity-10 rounded-full"></div>

                        <div className="relative z-10">
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center space-x-3">
                                    <div className="p-3 bg-white bg-opacity-20 rounded-lg backdrop-blur-sm">
                                        <MessageCircle className="w-8 h-8" />
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-bold">User Feedback & Support</h3>
                                        <p className="text-purple-100 mt-1">
                                            Manage feedback, bug reports, and support requests
                                        </p>
                                    </div>
                                </div>
                                <Link
                                    href={route('admin.feedback.index')}
                                    className="px-6 py-3 bg-white text-indigo-600 rounded-lg font-semibold hover:bg-gray-100 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                                >
                                    Manage Feedback →
                                </Link>
                            </div>

                            {/* Feedback Stats Grid */}
                            <div className="grid grid-cols-2 md:grid-cols-6 gap-3 mb-4">
                                <div className="bg-white bg-opacity-20 rounded-lg p-3 backdrop-blur-sm hover:bg-opacity-30 transition-all">
                                    <div className="flex items-center space-x-2 mb-1">
                                        <MessageCircle className="w-4 h-4" />
                                        <p className="text-xs uppercase tracking-wide opacity-90">Total</p>
                                    </div>
                                    <p className="text-2xl font-bold">{feedbackStats.total || 0}</p>
                                </div>

                                <div className="bg-blue-500 bg-opacity-40 rounded-lg p-3 backdrop-blur-sm hover:bg-opacity-50 transition-all">
                                    <div className="flex items-center space-x-2 mb-1">
                                        <Clock className="w-4 h-4" />
                                        <p className="text-xs uppercase tracking-wide opacity-90">New</p>
                                    </div>
                                    <p className="text-2xl font-bold">{feedbackStats.new || 0}</p>
                                </div>

                                <div className="bg-yellow-500 bg-opacity-40 rounded-lg p-3 backdrop-blur-sm hover:bg-opacity-50 transition-all">
                                    <div className="flex items-center space-x-2 mb-1">
                                        <TrendingUp className="w-4 h-4" />
                                        <p className="text-xs uppercase tracking-wide opacity-90">In Progress</p>
                                    </div>
                                    <p className="text-2xl font-bold">{feedbackStats.in_progress || 0}</p>
                                </div>

                                <div className="bg-green-500 bg-opacity-40 rounded-lg p-3 backdrop-blur-sm hover:bg-opacity-50 transition-all">
                                    <div className="flex items-center space-x-2 mb-1">
                                        <CheckCircle className="w-4 h-4" />
                                        <p className="text-xs uppercase tracking-wide opacity-90">Resolved</p>
                                    </div>
                                    <p className="text-2xl font-bold">{feedbackStats.resolved || 0}</p>
                                </div>

                                <div className="bg-red-500 bg-opacity-40 rounded-lg p-3 backdrop-blur-sm hover:bg-opacity-50 transition-all">
                                    <div className="flex items-center space-x-2 mb-1">
                                        <AlertCircle className="w-4 h-4" />
                                        <p className="text-xs uppercase tracking-wide opacity-90">Urgent</p>
                                    </div>
                                    <p className="text-2xl font-bold">{feedbackStats.urgent || 0}</p>
                                </div>

                                <div className="bg-amber-500 bg-opacity-40 rounded-lg p-3 backdrop-blur-sm hover:bg-opacity-50 transition-all">
                                    <div className="flex items-center space-x-2 mb-1">
                                        <Star className="w-4 h-4" />
                                        <p className="text-xs uppercase tracking-wide opacity-90">Avg Rating</p>
                                    </div>
                                    <p className="text-2xl font-bold">{feedbackStats.average_rating || 0}/5</p>
                                </div>
                            </div>

                            {/* Recent Feedback Preview */}
                            {feedbackStats.recent && feedbackStats.recent.length > 0 && (
                                <div className="bg-white bg-opacity-10 rounded-lg p-4 backdrop-blur-sm">
                                    <h4 className="font-semibold mb-3 flex items-center">
                                        <Clock className="w-4 h-4 mr-2" />
                                        Recent Feedback
                                    </h4>
                                    <div className="space-y-2">
                                        {feedbackStats.recent.slice(0, 3).map((feedback) => (
                                            <div key={feedback.id} className="flex items-center justify-between text-sm bg-white bg-opacity-10 rounded p-2 hover:bg-opacity-20 transition-all">
                                                <div className="flex items-center space-x-3 flex-1 min-w-0">
                                                    <span className={`px-2 py-1 rounded text-xs font-medium ${feedback.status === 'new' ? 'bg-blue-500 bg-opacity-50' :
                                                        feedback.status === 'in_progress' ? 'bg-yellow-500 bg-opacity-50' :
                                                            'bg-green-500 bg-opacity-50'
                                                        }`}>
                                                        {feedback.status.replace('_', ' ')}
                                                    </span>
                                                    <span className="truncate">{feedback.name}</span>
                                                    <span className="text-xs opacity-75">{feedback.created_at}</span>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <span className={`text-xs px-2 py-1 rounded ${feedback.priority === 'urgent' ? 'bg-red-500' :
                                                        feedback.priority === 'high' ? 'bg-orange-500' :
                                                            'bg-gray-500'
                                                        } bg-opacity-50`}>
                                                        {feedback.priority}
                                                    </span>
                                                    <div className="flex items-center">
                                                        <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                                                        <span className="ml-1 text-xs">{feedback.rating}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <Link
                                        href={route('admin.feedback.index')}
                                        className="text-sm mt-3 inline-block hover:underline opacity-90 hover:opacity-100"
                                    >
                                        View all feedback →
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                {/* ======================================== 
                    END OF FEEDBACK CARD 
                    ======================================== */}

                {/* Charts Section - KEEP EXISTING CODE */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                    {/* Schools Distribution Chart */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">
                            {filters.district_id ? 'Schools by Zone' : 'Schools by District'}
                        </h3>

                        {(() => {
                            const breakdowns = statistics.breakdowns || {};
                            const isZone = Boolean(filters.district_id);
                            const source = isZone ? (breakdowns.schools_by_zone || []) : (breakdowns.schools_by_district || []);
                            const display = source.map((item) => ({
                                name: isZone ? (item.zone_name || 'Unknown') : (item.district_name || 'Unknown'),
                                count: item.count || 0,
                            }));
                            return display && display.length > 0 ? (
                                <div className="space-y-3">
                                    {display.map((item, index) => (
                                        <div key={index}>
                                            <div className="flex items-center justify-between mb-1">
                                                <span className="text-sm font-medium text-gray-700">
                                                    {item.name}
                                                </span>
                                                <span className="text-sm font-semibold text-gray-900">
                                                    {item.count} schools
                                                </span>
                                            </div>
                                            <div className="w-full bg-gray-200 rounded-full h-2.5">
                                                <div
                                                    className="bg-blue-600 h-2.5 rounded-full transition-all duration-500"
                                                    style={{
                                                        width: `${(item.count / Math.max(...display.map(d => d.count))) * 100}%`
                                                    }}
                                                ></div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8 text-gray-500">
                                    No data available for selected filters
                                </div>
                            );
                        })()}
                    </div>

                    {/* Top Schools by Rice Consumption */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">
                            Top 5 Schools by Rice Consumption
                        </h3>

                        {(() => {
                            const list = (statistics.top_schools || []).map((s) => ({
                                id: s.user_id,
                                school_name: s.school_name,
                                district: s.district_name,
                                zone: s.zone_name,
                                total_rice: s.total_rice,
                                serving_days: s.serving_days || 0,
                            }));
                            return list && list.length > 0 ? (
                                <div className="space-y-3">
                                    {list.map((school, index) => (
                                        <div key={school.id} className="flex items-start space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                                            <div className="flex-shrink-0 w-8 h-8 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center font-bold text-sm">
                                                {index + 1}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <Link
                                                    href={route('admin.schools.show', school.id)}
                                                    className="text-sm font-medium text-gray-900 hover:text-indigo-600 truncate block"
                                                >
                                                    {school.school_name}
                                                </Link>
                                                {((school.district && school.district !== 'Unknown') || (school.zone && school.zone !== 'Unknown')) && (
                                                    <p className="text-xs text-gray-500">
                                                        {[school.district, school.zone].filter(v => v && v !== 'Unknown').join(' · ')}
                                                    </p>
                                                )}
                                            </div>
                                            <div className="flex-shrink-0 text-right">
                                                {Number(school.total_rice || 0) > 0 && (
                                                    <p className="text-sm font-semibold text-gray-900">
                                                        {Number(school.total_rice).toFixed(2)} kg
                                                    </p>
                                                )}
                                                <p className="text-xs text-gray-500">
                                                    {school.serving_days} days
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8 text-gray-500">
                                    No consumption data for selected period
                                </div>
                            );
                        })()}
                    </div>
                </div>

                {/* Recent Activity Feed - KEEP EXISTING CODE */}
                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-900">
                            Recent Activity
                        </h3>
                        <button
                            onClick={() => router.visit(route('admin.daily-consumptions.index'))}
                            className="text-sm text-indigo-600 hover:text-indigo-900 font-medium"
                        >
                            View All →
                        </button>
                    </div>

                    {(() => {
                        const activityList = (statistics.recent_activity || []).map((a) => ({
                            id: a.id,
                            user_id: a.user_id,
                            date: a.date,
                            udise: a.udise,
                            served_primary: a.served_primary,
                            served_middle: a.served_middle,
                            students_served: a.students_served,
                            rice_consumed: a.rice_consumed,
                            amount_consumed: a.amount_consumed,
                            enrollment_primary: a.enrollment_primary,
                            enrollment_middle: a.enrollment_middle,
                            rice_primary: a.rice_primary,
                            rice_middle: a.rice_middle,
                            amount_primary: a.amount_primary,
                            amount_middle: a.amount_middle,
                        }));
                        return activityList && activityList.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">sno</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">date</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">udise</th>
                                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">students enrolled M|P</th>
                                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">students served M|P</th>
                                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">rice consumed M|P</th>
                                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">amount M|P</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {activityList.map((activity, index) => (
                                            <tr key={activity.id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{index + 1}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {new Date(activity.date).toLocaleDateString('en-IN', {
                                                        day: '2-digit', month: 'short', year: 'numeric'
                                                    })}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{activity.udise || '—'}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                                                    {`${Number(activity.enrollment_middle || 0).toLocaleString('en-IN')} | ${Number(activity.enrollment_primary || 0).toLocaleString('en-IN')}`}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                                                    {`${Number(activity.served_middle || 0).toLocaleString('en-IN')} | ${Number(activity.served_primary || 0).toLocaleString('en-IN')}`}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                                                    {`${Number(activity.rice_middle || 0).toFixed(2)} | ${Number(activity.rice_primary || 0).toFixed(2)} kg`}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                                                    {`₹${Number(activity.amount_middle || 0).toLocaleString('en-IN')} | ₹${Number(activity.amount_primary || 0).toLocaleString('en-IN')}`}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="text-center py-8 text-gray-500">
                                No recent activity to display
                            </div>
                        );
                    })()}
                </div>

                {/* Quick Actions - KEEP EXISTING CODE */}
                <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <button
                        onClick={() => router.visit(route('admin.schools.index'))}
                        className="flex items-center justify-center px-6 py-4 bg-white rounded-lg shadow hover:shadow-lg transition-shadow group"
                    >
                        <svg className="w-8 h-8 text-blue-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                        <span className="text-lg font-semibold text-gray-700 group-hover:text-blue-600">
                            Manage Schools
                        </span>
                    </button>

                    <button
                        onClick={() => router.visit(route('admin.rice-reports.index'))}
                        className="flex items-center justify-center px-6 py-4 bg-white rounded-lg shadow hover:shadow-lg transition-shadow group"
                    >
                        <svg className="w-8 h-8 text-green-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <span className="text-lg font-semibold text-gray-700 group-hover:text-green-600">
                            View All Reports
                        </span>
                    </button>

                    <button
                        onClick={handleExport}
                        className="flex items-center justify-center px-6 py-4 bg-white rounded-lg shadow hover:shadow-lg transition-shadow group"
                    >
                        <svg className="w-8 h-8 text-orange-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <span className="text-lg font-semibold text-gray-700 group-hover:text-orange-600">
                            Export Dashboard Data
                        </span>
                    </button>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}