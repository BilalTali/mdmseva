import { Head, Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Plus, Eye, FileDown, Trash2, BarChart3, Calendar, TrendingUp, Package, Users, Scale } from 'lucide-react';

/**
 * RiceReport Index Page - WITH RICE CONFIG DISPLAY
 * 
 * ✅ Shows synced rice configuration details
 * ✅ Displays rice rates per student
 * ✅ Shows opening/closing balances by section
 * ✅ FIXED: Changed "Received" to "Rice Lifted"
 */
export default function Index({ 
    reports, 
    schoolType, 
    sections,
    enrollment,
    availableStock,
    rollStatements,
    statistics,
    riceConfig,        // ✅ Rice configuration details
    riceRates          // ✅ Rice rates per student
}) {
    // Safely decode any HTML entities from paginator labels
    const decodeLabel = (label) => {
        if (typeof label !== 'string') return '';
        const textarea = document.createElement('textarea');
        textarea.innerHTML = label;
        return textarea.value.replace(/<[^>]*>/g, '');
    };
    const handleDelete = (reportId, period) => {
        if (confirm(`Are you sure you want to delete the report for ${period}?`)) {
            router.delete(`/rice-reports/${reportId}`, {
                preserveScroll: true,
            });
        }
    };

    const handleDownload = (reportId, theme = 'bw') => {
        window.open(`/rice-reports/${reportId}/generate-pdf?theme=${theme}&download=1`, '_blank');
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold leading-tight text-gray-800">
                        Rice Reports
                    </h2>
                    <Link
                        href="/rice-reports/create"
                        className="inline-flex items-center px-4 py-2 bg-indigo-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-indigo-700"
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Generate New Report
                    </Link>
                </div>
            }
        >
            <Head title="Rice Reports" />

            <div className="py-6">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">
                    
                    {/* STATISTICS CARDS */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="bg-white shadow-sm sm:rounded-lg p-6">
                            <div className="flex items-center">
                                <div className="flex-shrink-0 p-3 bg-blue-100 rounded-lg">
                                    <BarChart3 className="w-6 h-6 text-blue-600" />
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-500">Total Reports</p>
                                    <p className="text-2xl font-bold text-gray-900">
                                        {statistics?.total_reports || 0}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white shadow-sm sm:rounded-lg p-6">
                            <div className="flex items-center">
                                <div className="flex-shrink-0 p-3 bg-green-100 rounded-lg">
                                    <Package className="w-6 h-6 text-green-600" />
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-500">Available Stock</p>
                                    <p className="text-2xl font-bold text-green-600">
                                        {availableStock?.toFixed(2) || '0.00'} kg
                                    </p>
                                    <p className="text-xs text-gray-500 mt-1">Live balance</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white shadow-sm sm:rounded-lg p-6">
                            <div className="flex items-center">
                                <div className="flex-shrink-0 p-3 bg-red-100 rounded-lg">
                                    <TrendingUp className="w-6 h-6 text-red-600" />
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-500">Total Consumed</p>
                                    <p className="text-2xl font-bold text-red-600">
                                        {statistics?.total_rice_consumed?.toFixed(2) || '0.00'} kg
                                    </p>
                                    <p className="text-xs text-gray-500 mt-1">All time</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white shadow-sm sm:rounded-lg p-6">
                            <div className="flex items-center">
                                <div className="flex-shrink-0 p-3 bg-purple-100 rounded-lg">
                                    <Calendar className="w-6 h-6 text-purple-600" />
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-500">Avg Daily</p>
                                    <p className="text-2xl font-bold text-purple-600">
                                        {statistics?.average_daily_consumption?.toFixed(2) || '0.00'} kg
                                    </p>
                                    <p className="text-xs text-gray-500 mt-1">
                                        {statistics?.latest_period || 'No reports'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ============================================
                        RICE CONFIGURATION DETAILS CARD
                        Shows synced rice config (like Dashboard)
                        ✅ FIXED: Changed "Received" to "Rice Lifted"
                        ============================================ */}
                    {riceConfig && (
                        <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-lg p-6">
                            <div className="flex items-start">
                                <Scale className="w-8 h-8 text-amber-600 mr-4 flex-shrink-0 mt-1" />
                                <div className="flex-1">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                        Rice Configuration Details (Synced)
                                    </h3>
                                    
                                    {/* Rice Rates */}
                                    {riceRates && (
                                        <div className="mb-4 p-3 bg-white rounded-lg border border-amber-200">
                                            <h4 className="text-sm font-semibold text-gray-700 mb-2">Daily Rice Rates per Student</h4>
                                            <div className="grid grid-cols-2 gap-3">
                                                {sections?.includes('primary') && (
                                                    <div>
                                                        <p className="text-xs text-gray-600">Primary (I-V)</p>
                                                        <p className="text-lg font-bold text-blue-700">
                                                            {riceRates.primary?.toFixed(3) || '0.000'} kg
                                                        </p>
                                                    </div>
                                                )}
                                                {sections?.includes('middle') && (
                                                    <div>
                                                        <p className="text-xs text-gray-600">Middle (VI-VIII)</p>
                                                        <p className="text-lg font-bold text-indigo-700">
                                                            {riceRates.middle?.toFixed(3) || '0.000'} kg
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                    
                                    {/* Balance Details */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {/* Primary Section */}
                                        {sections?.includes('primary') && (
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
                                        )}
                                        
                                        {/* Middle Section */}
                                        {sections?.includes('middle') && (
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
                                        )}
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
                                    
                                    <p className="text-xs text-amber-700 mt-3 flex items-center">
                                        <span className="inline-block w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
                                        ✓ All values are synced with live RiceConfiguration data
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ENROLLMENT CARD */}
                    {enrollment && (
                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6">
                            <div className="flex items-center">
                                <Users className="w-8 h-8 text-blue-600 mr-4" />
                                <div className="flex-1">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                        Current Enrollment
                                    </h3>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        {sections?.includes('primary') && (
                                            <div>
                                                <p className="text-sm text-gray-600">Primary (I-V)</p>
                                                <p className="text-2xl font-bold text-blue-700">
                                                    {enrollment.primary || 0}
                                                </p>
                                            </div>
                                        )}
                                        {sections?.includes('middle') && (
                                            <div>
                                                <p className="text-sm text-gray-600">Middle (VI-VIII)</p>
                                                <p className="text-2xl font-bold text-indigo-700">
                                                    {enrollment.middle || 0}
                                                </p>
                                            </div>
                                        )}
                                        <div>
                                            <p className="text-sm text-gray-600">Total Students</p>
                                            <p className="text-2xl font-bold text-purple-700">
                                                {(enrollment.primary || 0) + (enrollment.middle || 0)}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* REPORTS TABLE */}
                    <div className="bg-white shadow-sm sm:rounded-lg">
                        <div className="p-6">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Generated Reports</h3>
                            
                            {reports.data.length === 0 ? (
                                <div className="text-center py-12">
                                    <BarChart3 className="mx-auto h-12 w-12 text-gray-400" />
                                    <h3 className="mt-2 text-sm font-medium text-gray-900">No reports yet</h3>
                                    <p className="mt-1 text-sm text-gray-500">
                                        Get started by generating your first rice consumption report.
                                    </p>
                                    <div className="mt-6">
                                        <Link
                                            href="/rice-reports/create"
                                            className="inline-flex items-center px-4 py-2 bg-indigo-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-indigo-700"
                                        >
                                            <Plus className="w-4 h-4 mr-2" />
                                            Generate Report
                                        </Link>
                                    </div>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Period
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Opening Balance
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Consumed
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Closing Balance
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Serving Days
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Generated
                                                </th>
                                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Actions
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {reports.data.map((report) => (
                                                <tr key={report.id} className="hover:bg-gray-50">
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm font-medium text-gray-900">
                                                            {report.month_name} {report.year}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {report.opening_balance} kg
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600 font-medium">
                                                        {report.total_rice_consumed} kg
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-medium">
                                                        {report.closing_balance} kg
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {report.total_serving_days} days
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {new Date(report.created_at).toLocaleDateString()}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                        <div className="flex items-center justify-end gap-2">
                                                            <Link
                                                                href={`/rice-reports/${report.id}/view-pdf`}
                                                                className="text-indigo-600 hover:text-indigo-900"
                                                                title="View PDF"
                                                            >
                                                                <Eye className="w-5 h-5" />
                                                            </Link>
                                                            <button
                                                                onClick={() => handleDownload(report.id)}
                                                                className="text-green-600 hover:text-green-900"
                                                                title="Download PDF"
                                                            >
                                                                <FileDown className="w-5 h-5" />
                                                            </button>
                                                            <button
                                                                onClick={() => handleDelete(report.id, `${report.month_name} ${report.year}`)}
                                                                className="text-red-600 hover:text-red-900"
                                                                title="Delete"
                                                            >
                                                                <Trash2 className="w-5 h-5" />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}

                            {/* Pagination */}
                            {reports.data.length > 0 && reports.links && (
                                <div className="mt-4 flex items-center justify-between border-t border-gray-200 pt-4">
                                    <div className="text-sm text-gray-700">
                                        Showing <span className="font-medium">{reports.from}</span> to{' '}
                                        <span className="font-medium">{reports.to}</span> of{' '}
                                        <span className="font-medium">{reports.total}</span> reports
                                    </div>
                                    <div className="flex gap-2">
                                        {reports.links.map((link, index) => (
                                            <Link
                                                key={index}
                                                href={link.url || '#'}
                                                preserveScroll
                                                className={`px-3 py-2 rounded-md text-sm font-medium ${
                                                    link.active
                                                        ? 'bg-indigo-600 text-white'
                                                        : link.url
                                                        ? 'bg-white text-gray-700 hover:bg-gray-50'
                                                        : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                                }`}
                                            >
                                                {decodeLabel(link.label)}
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                </div>
            </div>
        </AuthenticatedLayout>
    );
}