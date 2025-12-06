import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import {
    DocumentTextIcon,
    PlusIcon,
    TrashIcon,
    EyeIcon,
    ArrowPathIcon,
    ChartBarIcon,
    ChevronDownIcon,
    ChevronUpIcon,
    DocumentArrowDownIcon,
    ShoppingBagIcon,
    BoltIcon,
    ReceiptPercentIcon,
    ArrowDownTrayIcon
} from '@heroicons/react/24/outline';

export default function Index({
    auth,
    reports,
    availableMonths,
    statistics,
    schoolType,
    hasPrimary,
    hasMiddle
}) {
    const [deletingId, setDeletingId] = useState(null);
    const [expandedReport, setExpandedReport] = useState(null);

    const handleDelete = (reportId) => {
        if (confirm('Are you sure you want to delete this report? This action cannot be undone.')) {
            setDeletingId(reportId);
            router.delete(route('amount-reports.destroy', reportId), {
                onFinish: () => setDeletingId(null),
            });
        }
    };

    const handleRegenerate = (reportId) => {
        if (confirm('Regenerate this report with current data? The existing report will be replaced.')) {
            router.post(route('amount-reports.regenerate', reportId));
        }
    };

    const handleDownloadPdf = (reportId) => {
        window.open(`/amount-reports/${reportId}/generate-pdf?theme=bw&download=1`, '_blank');
    };

    const handlePreviewPdf = (reportId) => {
        window.open(route('amount-reports.view-pdf', reportId), '_blank');
    };

    const toggleExpand = (reportId) => {
        setExpandedReport(expandedReport === reportId ? null : reportId);
    };

    // Salt breakdown categories
    const saltCategories = [
        { key: 'common_salt', label: 'Common Salt', icon: '🧂' },
        { key: 'chilli_powder', label: 'Chilli', icon: '🌶️' },
        { key: 'turmeric', label: 'Turmeric', icon: '💛' },
        { key: 'coriander', label: 'Ingredients', icon: '🌿' },
        { key: 'other_condiments', label: 'Other', icon: '🧄' }
    ];

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Amount Reports" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="mb-8">
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900">Amount Reports</h1>
                                <p className="mt-2 text-sm text-gray-600">
                                    Monthly consumption reports with detailed salt &amp; condiments breakdown,
                                    using the unified percentages from your Amount Configuration (applied to both Primary and Middle).
                                </p>
                            </div>
                            <Link
                                href={route('amount-reports.create')}
                                className="inline-flex items-center px-4 py-2 bg-indigo-600 border border-transparent 
                                    rounded-md font-semibold text-xs text-white uppercase tracking-widest 
                                    hover:bg-indigo-700 focus:bg-indigo-700 active:bg-indigo-900 
                                    focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 
                                    transition-all ease-in-out duration-150"
                            >
                                <PlusIcon className="h-4 w-4 mr-2" />
                                Generate New Report
                            </Link>
                        </div>
                    </div>

                    {/* Statistics Cards */}
                    {statistics && statistics.total_reports > 0 && (
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                            <div className="bg-white overflow-hidden shadow-sm rounded-lg p-6">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0 bg-indigo-500 rounded-md p-3">
                                        <DocumentTextIcon className="h-6 w-6 text-white" />
                                    </div>
                                    <div className="ml-4">
                                        <p className="text-sm font-medium text-gray-500">Total Reports</p>
                                        <p className="text-2xl font-semibold text-gray-900">
                                            {statistics.total_reports}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white overflow-hidden shadow-sm rounded-lg p-6">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0 bg-green-500 rounded-md p-3">
                                        <ChartBarIcon className="h-6 w-6 text-white" />
                                    </div>
                                    <div className="ml-4">
                                        <p className="text-sm font-medium text-gray-500">Total Amount</p>
                                        <p className="text-2xl font-semibold text-gray-900">
                                            ₹{statistics.total_amount_consumed.toFixed(2)}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white overflow-hidden shadow-sm rounded-lg p-6">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0 bg-yellow-500 rounded-md p-3">
                                        <ChartBarIcon className="h-6 w-6 text-white" />
                                    </div>
                                    <div className="ml-4">
                                        <p className="text-sm font-medium text-gray-500">Avg Monthly</p>
                                        <p className="text-2xl font-semibold text-gray-900">
                                            ₹{statistics.average_monthly_amount.toFixed(2)}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white overflow-hidden shadow-sm rounded-lg p-6">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0 bg-purple-500 rounded-md p-3">
                                        <ChartBarIcon className="h-6 w-6 text-white" />
                                    </div>
                                    <div className="ml-4">
                                        <p className="text-sm font-medium text-gray-500">Serving Days</p>
                                        <p className="text-2xl font-semibold text-gray-900">
                                            {statistics.total_serving_days}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Reports List */}
                    <div className="bg-white shadow-sm rounded-lg overflow-hidden">
                        {reports.data.length === 0 ? (
                            <div className="text-center py-12">
                                <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
                                <h3 className="mt-2 text-sm font-medium text-gray-900">No reports</h3>
                                <p className="mt-1 text-sm text-gray-500">
                                    Get started by generating your first amount report.
                                </p>
                                <div className="mt-6">
                                    <Link
                                        href={route('amount-reports.create')}
                                        className="inline-flex items-center px-4 py-2 bg-indigo-600 border border-transparent 
                                            rounded-md font-semibold text-xs text-white uppercase tracking-widest 
                                            hover:bg-indigo-700"
                                    >
                                        <PlusIcon className="h-4 w-4 mr-2" />
                                        Generate Report
                                    </Link>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-4 p-4">
                                {reports.data.map((report) => (
                                    <div key={report.id} className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                                        {/* Report Header */}
                                        <div className="bg-gray-50 px-6 py-4">
                                            <div className="flex items-center justify-between">
                                                <div className="flex-1">
                                                    <div className="flex items-center space-x-4">
                                                        <div>
                                                            <h3 className="text-lg font-bold text-gray-900">
                                                                {report.period}
                                                            </h3>
                                                            <p className="text-sm text-gray-500">
                                                                {report.month_name} {report.year} • Generated {report.created_at_human}
                                                            </p>
                                                        </div>
                                                        <span className="px-3 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                                                            {report.school_type}
                                                        </span>
                                                    </div>

                                                    {/* Quick Stats */}
                                                    <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-4">
                                                        {hasPrimary && (
                                                            <div className="bg-white rounded px-3 py-2 border border-indigo-100">
                                                                <p className="text-xs text-gray-500">Primary Students</p>
                                                                <p className="text-lg font-bold text-indigo-600">{report.total_primary_students}</p>
                                                            </div>
                                                        )}
                                                        {hasMiddle && (
                                                            <div className="bg-white rounded px-3 py-2 border border-purple-100">
                                                                <p className="text-xs text-gray-500">Middle Students</p>
                                                                <p className="text-lg font-bold text-purple-600">{report.total_middle_students}</p>
                                                            </div>
                                                        )}
                                                        <div className="bg-white rounded px-3 py-2 border border-green-100">
                                                            <p className="text-xs text-gray-500">Serving Days</p>
                                                            <p className="text-lg font-bold text-green-600">{report.total_serving_days}</p>
                                                        </div>
                                                        <div className="bg-white rounded px-3 py-2 border border-yellow-100">
                                                            <p className="text-xs text-gray-500">Grand Total</p>
                                                            <p className="text-lg font-bold text-yellow-600">₹{report.grand_total_amount.toFixed(2)}</p>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Actions */}
                                                <div className="flex items-center space-x-2 ml-4">
                                                    <a
                                                        href={`/amount-reports/export?month=${report.month}&year=${report.year}&format=xlsx`}
                                                        className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                                                        title="Export to Excel"
                                                    >
                                                        <ArrowDownTrayIcon className="h-5 w-5" />
                                                    </a>
                                                    <button
                                                        onClick={() => handleDownloadPdf(report.id)}
                                                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                                        title="Download PDF"
                                                    >
                                                        <DocumentArrowDownIcon className="h-5 w-5" />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => handlePreviewPdf(report.id)}
                                                        className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                                        title="Preview Report"
                                                    >
                                                        <EyeIcon className="h-5 w-5" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleRegenerate(report.id)}
                                                        className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors"
                                                        title="Regenerate Report"
                                                    >
                                                        <ArrowPathIcon className="h-5 w-5" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(report.id)}
                                                        disabled={deletingId === report.id}
                                                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                                                        title="Delete Report"
                                                    >
                                                        <TrashIcon className="h-5 w-5" />
                                                    </button>
                                                    <button
                                                        onClick={() => toggleExpand(report.id)}
                                                        className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                                                        title={expandedReport === report.id ? "Collapse" : "Expand Details"}
                                                    >
                                                        {expandedReport === report.id ? (
                                                            <ChevronUpIcon className="h-5 w-5" />
                                                        ) : (
                                                            <ChevronDownIcon className="h-5 w-5" />
                                                        )}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>



                                        {/* Expanded Details */}
                                        {expandedReport === report.id && (
                                            <div className="px-6 py-4 bg-white border-t border-gray-200">
                                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                                    {/* Primary Section Details */}
                                                    {hasPrimary && report.primary_breakdown && (
                                                        <div className="space-y-4">
                                                            <h4 className="font-semibold text-gray-900 flex items-center">
                                                                <span className="w-2 h-2 bg-indigo-600 rounded-full mr-2"></span>
                                                                Primary (Class 1-5) Breakdown
                                                            </h4>

                                                            {/* Ingredient Breakdown */}
                                                            <div className="space-y-2">
                                                                <div className="flex justify-between text-sm">
                                                                    <span className="text-gray-600">Pulses:</span>
                                                                    <span className="font-semibold text-gray-900">
                                                                        ₹{parseFloat(report.primary_breakdown?.pulses || 0).toFixed(2)}
                                                                    </span>
                                                                </div>
                                                                <div className="flex justify-between text-sm">
                                                                    <span className="text-gray-600">Vegetables:</span>
                                                                    <span className="font-semibold text-gray-900">
                                                                        ₹{parseFloat(report.primary_breakdown?.vegetables || 0).toFixed(2)}
                                                                    </span>
                                                                </div>
                                                                <div className="flex justify-between text-sm">
                                                                    <span className="text-gray-600">Oil/Fat:</span>
                                                                    <span className="font-semibold text-gray-900">
                                                                        ₹{parseFloat(report.primary_breakdown?.oil || 0).toFixed(2)}
                                                                    </span>
                                                                </div>
                                                                <div className="flex justify-between text-sm">
                                                                    <span className="text-gray-600">Fuel:</span>
                                                                    <span className="font-semibold text-gray-900">
                                                                        ₹{parseFloat(report.primary_breakdown?.fuel || 0).toFixed(2)}
                                                                    </span>
                                                                </div>
                                                                <div className="flex justify-between text-sm pt-2 border-t border-indigo-100">
                                                                    <span className="text-indigo-700 font-semibold">Total Salt & Condiments:</span>
                                                                    <span className="font-bold text-indigo-900">
                                                                        ₹{parseFloat(report.primary_breakdown?.salt_total || 0).toFixed(2)}
                                                                    </span>
                                                                </div>
                                                            </div>

                                                            {/* Salt Breakdown */}
                                                            {report.primary_breakdown?.salt_breakdown && (
                                                                <div className="mt-4 p-3 bg-indigo-50 rounded-lg">
                                                                    <p className="text-xs font-semibold text-indigo-900 mb-2">Salt & Condiments Distribution</p>
                                                                    <div className="space-y-1">
                                                                        {saltCategories.map((cat) => {
                                                                            const amount = parseFloat(report.primary_breakdown.salt_breakdown[cat.key] || 0);
                                                                            const percentage = report.primary_breakdown.salt_total > 0
                                                                                ? (amount / report.primary_breakdown.salt_total * 100).toFixed(1)
                                                                                : 0;

                                                                            return amount > 0 ? (
                                                                                <div key={cat.key} className="flex justify-between text-xs">
                                                                                    <span className="text-gray-700">
                                                                                        {cat.icon} {cat.label}:
                                                                                    </span>
                                                                                    <span className="font-semibold text-gray-900">
                                                                                        ₹{amount.toFixed(2)} ({percentage}%)
                                                                                    </span>
                                                                                </div>
                                                                            ) : null;
                                                                        })}
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}

                                                    {/* Middle Section Details */}
                                                    {hasMiddle && report.middle_breakdown && (
                                                        <div className="space-y-4">
                                                            <h4 className="font-semibold text-gray-900 flex items-center">
                                                                <span className="w-2 h-2 bg-purple-600 rounded-full mr-2"></span>
                                                                Middle (Class 6-8) Breakdown
                                                            </h4>

                                                            {/* Ingredient Breakdown */}
                                                            <div className="space-y-2">
                                                                <div className="flex justify-between text-sm">
                                                                    <span className="text-gray-600">Pulses:</span>
                                                                    <span className="font-semibold text-gray-900">
                                                                        ₹{parseFloat(report.middle_breakdown?.pulses || 0).toFixed(2)}
                                                                    </span>
                                                                </div>
                                                                <div className="flex justify-between text-sm">
                                                                    <span className="text-gray-600">Vegetables:</span>
                                                                    <span className="font-semibold text-gray-900">
                                                                        ₹{parseFloat(report.middle_breakdown?.vegetables || 0).toFixed(2)}
                                                                    </span>
                                                                </div>
                                                                <div className="flex justify-between text-sm">
                                                                    <span className="text-gray-600">Oil/Fat:</span>
                                                                    <span className="font-semibold text-gray-900">
                                                                        ₹{parseFloat(report.middle_breakdown?.oil || 0).toFixed(2)}
                                                                    </span>
                                                                </div>
                                                                <div className="flex justify-between text-sm">
                                                                    <span className="text-gray-600">Fuel:</span>
                                                                    <span className="font-semibold text-gray-900">
                                                                        ₹{parseFloat(report.middle_breakdown?.fuel || 0).toFixed(2)}
                                                                    </span>
                                                                </div>
                                                                <div className="flex justify-between text-sm pt-2 border-t border-purple-100">
                                                                    <span className="text-purple-700 font-semibold">Total Salt & Condiments:</span>
                                                                    <span className="font-bold text-purple-900">
                                                                        ₹{parseFloat(report.middle_breakdown?.salt_total || 0).toFixed(2)}
                                                                    </span>
                                                                </div>
                                                            </div>

                                                            {/* Salt Breakdown */}
                                                            {report.middle_breakdown?.salt_breakdown && (
                                                                <div className="mt-4 p-3 bg-purple-50 rounded-lg">
                                                                    <p className="text-xs font-semibold text-purple-900 mb-2">Salt & Condiments Distribution</p>
                                                                    <div className="space-y-1">
                                                                        {saltCategories.map((cat) => {
                                                                            const amount = parseFloat(report.middle_breakdown.salt_breakdown[cat.key] || 0);
                                                                            const percentage = report.middle_breakdown.salt_total > 0
                                                                                ? (amount / report.middle_breakdown.salt_total * 100).toFixed(1)
                                                                                : 0;

                                                                            return amount > 0 ? (
                                                                                <div key={cat.key} className="flex justify-between text-xs">
                                                                                    <span className="text-gray-700">
                                                                                        {cat.icon} {cat.label}:
                                                                                    </span>
                                                                                    <span className="font-semibold text-gray-900">
                                                                                        ₹{amount.toFixed(2)} ({percentage}%)
                                                                                    </span>
                                                                                </div>
                                                                            ) : null;
                                                                        })}
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Pagination */}
                        {reports.data.length > 0 && reports.last_page > 1 && (
                            <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
                                <div className="flex items-center justify-between">
                                    <div className="text-sm text-gray-700">
                                        Showing <span className="font-medium">{reports.from}</span> to{' '}
                                        <span className="font-medium">{reports.to}</span> of{' '}
                                        <span className="font-medium">{reports.total}</span> results
                                    </div>
                                    <div className="flex space-x-2">
                                        {reports.current_page > 1 && (
                                            <Link
                                                href={route('amount-reports.index', { page: reports.current_page - 1 })}
                                                className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                                            >
                                                Previous
                                            </Link>
                                        )}
                                        {reports.current_page < reports.last_page && (
                                            <Link
                                                href={route('amount-reports.index', { page: reports.current_page + 1 })}
                                                className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                                            >
                                                Next
                                            </Link>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}