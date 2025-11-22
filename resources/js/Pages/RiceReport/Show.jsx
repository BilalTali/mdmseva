import { Head, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { ArrowLeft, Calendar, Users, Package, TrendingDown, Eye, Scale } from 'lucide-react';

/**
 * RiceReport Show Page
 * Displays detailed view of a single report
 * 
 * ✅ Already correct - no changes needed
 */
export default function Show({ report, schoolType, riceConfig }) {
    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <div className="flex items-center">
                        <Link
                            href="/rice-reports"
                            className="mr-4 text-gray-600 hover:text-gray-900"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                        <h2 className="text-xl font-semibold leading-tight text-gray-800">
                            Report Details - {report.period}
                        </h2>
                    </div>
                    <Link
                        href={`/rice-reports/${report.id}/view-pdf`}
                        className="inline-flex items-center px-4 py-2 bg-indigo-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-indigo-700"
                    >
                        <Eye className="w-4 h-4 mr-2" />
                        View PDF
                    </Link>
                </div>
            }
        >
            <Head title={`Report - ${report.period}`} />

            <div className="py-6">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">
                    
                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="bg-white shadow-sm sm:rounded-lg p-6">
                            <div className="flex items-center">
                                <div className="flex-shrink-0 p-3 bg-blue-100 rounded-lg">
                                    <Package className="w-6 h-6 text-blue-600" />
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-500">Opening Balance</p>
                                    <p className="text-2xl font-bold text-gray-900">{report.opening_balance} kg</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white shadow-sm sm:rounded-lg p-6">
                            <div className="flex items-center">
                                <div className="flex-shrink-0 p-3 bg-red-100 rounded-lg">
                                    <TrendingDown className="w-6 h-6 text-red-600" />
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-500">Total Consumed</p>
                                    <p className="text-2xl font-bold text-red-600">{report.total_rice_consumed} kg</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white shadow-sm sm:rounded-lg p-6">
                            <div className="flex items-center">
                                <div className="flex-shrink-0 p-3 bg-green-100 rounded-lg">
                                    <Package className="w-6 h-6 text-green-600" />
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-500">Closing Balance</p>
                                    <p className="text-2xl font-bold text-green-600">{report.closing_balance} kg</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white shadow-sm sm:rounded-lg p-6">
                            <div className="flex items-center">
                                <div className="flex-shrink-0 p-3 bg-purple-100 rounded-lg">
                                    <Calendar className="w-6 h-6 text-purple-600" />
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-500">Serving Days</p>
                                    <p className="text-2xl font-bold text-gray-900">{report.total_serving_days}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Rice Configuration Details (with Arranged Rice) */}
                    {riceConfig && (
                        <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-lg p-6">
                            <div className="flex items-start">
                                <Scale className="w-8 h-8 text-amber-600 mr-4 flex-shrink-0 mt-1" />
                                <div className="flex-1">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                        Rice Configuration Snapshot (This Report)
                                    </h3>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {/* Primary Section */}
                                        <div className="p-3 bg-white rounded-lg border border-blue-200">
                                            <h4 className="text-sm font-semibold text-blue-900 mb-2">Primary (KG-5th)</h4>
                                            <div className="space-y-1 text-xs">
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600">Opening:</span>
                                                    <span className="font-semibold">{riceConfig.opening_balance_primary?.toFixed(2) || '0.00'} kg</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600">Rice Lifted:</span>
                                                    <span className="font-semibold text-green-600">{riceConfig.rice_lifted_primary?.toFixed(2) || '0.00'} kg</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600">Rice Arranged:</span>
                                                    <span className="font-semibold text-amber-600">{riceConfig.rice_arranged_primary?.toFixed(2) || '0.00'} kg</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600">Consumed:</span>
                                                    <span className="font-semibold text-red-600">{riceConfig.consumed_primary?.toFixed(2) || '0.00'} kg</span>
                                                </div>
                                                <div className="flex justify-between pt-1 border-t border-blue-200">
                                                    <span className="text-gray-600 font-medium">Closing:</span>
                                                    <span className="font-bold text-blue-700">{riceConfig.closing_balance_primary?.toFixed(2) || '0.00'} kg</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Upper Primary Section */}
                                        <div className="p-3 bg-white rounded-lg border border-indigo-200">
                                            <h4 className="text-sm font-semibold text-indigo-900 mb-2">Upper Primary (6th-8th)</h4>
                                            <div className="space-y-1 text-xs">
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600">Opening:</span>
                                                    <span className="font-semibold">{riceConfig.opening_balance_upper_primary?.toFixed(2) || '0.00'} kg</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600">Rice Lifted:</span>
                                                    <span className="font-semibold text-green-600">{riceConfig.rice_lifted_upper_primary?.toFixed(2) || '0.00'} kg</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600">Rice Arranged:</span>
                                                    <span className="font-semibold text-amber-600">{riceConfig.rice_arranged_upper_primary?.toFixed(2) || '0.00'} kg</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600">Consumed:</span>
                                                    <span className="font-semibold text-red-600">{riceConfig.consumed_upper_primary?.toFixed(2) || '0.00'} kg</span>
                                                </div>
                                                <div className="flex justify-between pt-1 border-t border-indigo-200">
                                                    <span className="text-gray-600 font-medium">Closing:</span>
                                                    <span className="font-bold text-indigo-700">{riceConfig.closing_balance_upper_primary?.toFixed(2) || '0.00'} kg</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Grand Total */}
                                    <div className="mt-4 p-3 bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg border border-purple-300">
                                        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-center">
                                            <div>
                                                <p className="text-xs text-purple-700">Total Opening</p>
                                                <p className="text-sm font-bold text-purple-900">
                                                    {riceConfig.total_opening_balance?.toFixed(2) || '0.00'} kg
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-purple-700">Total Lifted</p>
                                                <p className="text-sm font-bold text-green-700">
                                                    {riceConfig.total_rice_lifted?.toFixed(2) || '0.00'} kg
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-purple-700">Total Arranged</p>
                                                <p className="text-sm font-bold text-amber-700">
                                                    {riceConfig.total_rice_arranged?.toFixed(2) || '0.00'} kg
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-purple-700">Total Consumed</p>
                                                <p className="text-sm font-bold text-red-700">
                                                    {riceConfig.total_consumed?.toFixed(2) || '0.00'} kg
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-purple-700">Total Closing</p>
                                                <p className="text-sm font-bold text-green-700">
                                                    {riceConfig.total_closing_balance?.toFixed(2) || '0.00'} kg
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Section Totals */}
                    <div className="bg-white shadow-sm sm:rounded-lg p-6">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Section-wise Summary</h3>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Section
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Total Students
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Rice Consumed (kg)
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    <tr>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            Primary (Class 1-5)
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {report.totals_by_section?.primary?.students || 0}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {report.totals_by_section?.primary?.formatted_rice || '0.00 kg'}
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            Middle (Class 6-8)
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {report.totals_by_section?.middle?.students || 0}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {report.totals_by_section?.middle?.formatted_rice || '0.00 kg'}
                                        </td>
                                    </tr>
                                    <tr className="bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                                            Grand Total
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                                            {report.totals_by_section?.grand_total?.students || 0}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                                            {report.totals_by_section?.grand_total?.formatted_rice || '0.00 kg'}
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Daily Breakdown */}
                    <div className="bg-white shadow-sm sm:rounded-lg p-6">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Daily Consumption Breakdown</h3>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Date
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Day
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Primary
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Middle
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Primary Rice
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Middle Rice
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Total Rice
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Balance After
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {report.daily_summary && report.daily_summary.map((day, index) => (
                                        <tr key={index} className="hover:bg-gray-50">
                                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                                                {day.date}
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                                                {day.day}
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                                                {day.served_primary}
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                                                {day.served_middle}
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                                                {day.primary_rice} kg
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                                                {day.middle_rice} kg
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                                                {day.total_rice} kg
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap text-sm text-green-600">
                                                {day.balance_after} kg
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Metadata */}
                    <div className="bg-white shadow-sm sm:rounded-lg p-6">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Report Information</h3>
                        <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <dt className="text-sm font-medium text-gray-500">School Type</dt>
                                <dd className="mt-1 text-sm text-gray-900 capitalize">{report.school_type}</dd>
                            </div>
                            <div>
                                <dt className="text-sm font-medium text-gray-500">Average Daily Consumption</dt>
                                <dd className="mt-1 text-sm text-gray-900">{report.average_daily_consumption} kg</dd>
                            </div>
                            <div>
                                <dt className="text-sm font-medium text-gray-500">Generated On</dt>
                                <dd className="mt-1 text-sm text-gray-900">
                                    {new Date(report.created_at).toLocaleString()}
                                </dd>
                            </div>
                            <div>
                                <dt className="text-sm font-medium text-gray-500">Last Updated</dt>
                                <dd className="mt-1 text-sm text-gray-900">
                                    {new Date(report.updated_at).toLocaleString()}
                                </dd>
                            </div>
                        </dl>
                    </div>

                </div>
            </div>
        </AuthenticatedLayout>
    );
}