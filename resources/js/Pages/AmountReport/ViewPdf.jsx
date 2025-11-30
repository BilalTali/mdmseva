import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import {
    ArrowLeftIcon,
    DocumentArrowDownIcon,
    ArrowPathIcon,
    PrinterIcon,
    ChartBarIcon,
    CalendarIcon,
    UserGroupIcon,
    CurrencyRupeeIcon,
    EyeIcon,
    Cog6ToothIcon
} from '@heroicons/react/24/outline';

export default function ViewPdf({ auth, report, user, schoolType, hasPrimary, hasMiddle }) {
    const [selectedTheme, setSelectedTheme] = useState('bw');
    const [isLoading, setIsLoading] = useState(false);

    // Dynamic PDF URL for inline preview
    const pdfUrl = `/amount-reports/${report.id}/generate-pdf?theme=${selectedTheme}&preview=1`;

    const themes = [
        { id: 'bw', name: 'Black & White', color: 'bg-gray-700', preview: 'Professional', description: 'Clean and printable' },
        { id: 'blue', name: 'Blue Theme', color: 'bg-blue-600', preview: 'Classic', description: 'Traditional corporate' },
        { id: 'green', name: 'Green Theme', color: 'bg-green-600', preview: 'Fresh', description: 'Natural and calming' },
        { id: 'purple', name: 'Purple Theme', color: 'bg-purple-600', preview: 'Modern', description: 'Contemporary style' },
    ];

    const handleThemeChange = (themeId) => {
        setSelectedTheme(themeId);
    };

    // Download PDF
    const handleDownload = () => {
        setIsLoading(true);
        const downloadUrl = `/amount-reports/${report.id}/generate-pdf?theme=${selectedTheme}&download=1`;
        window.open(downloadUrl, '_blank');
        setTimeout(() => setIsLoading(false), 2000);
    };

    // Regenerate report
    const handleRegenerate = () => {
        if (confirm('Regenerate this report with fresh data? The existing report will be replaced.')) {
            setIsLoading(true);
            router.post(route('amount-reports.regenerate', report.id), {}, {
                onFinish: () => setIsLoading(false)
            });
        }
    };

    // Print page
    const handlePrint = () => {
        const printWindow = window.open(pdfUrl, '_blank');
        if (printWindow) {
            printWindow.onload = () => {
                printWindow.print();
            };
        }
    };

    const handlePreview = () => {
        window.open(pdfUrl, '_blank');
    };

    // Salt breakdown subcategories with colors and icons
    const saltCategories = [
        { key: 'common_salt', label: 'Common Salt', color: 'bg-blue-500', icon: '🧂' },
        { key: 'chilli_powder', label: 'Chilli Powder', color: 'bg-red-500', icon: '🌶️' },
        { key: 'turmeric', label: 'Turmeric', color: 'bg-yellow-500', icon: '💛' },
        { key: 'coriander', label: 'Ingredients', color: 'bg-green-500', icon: '🌿' },
        { key: 'other_condiments', label: 'Other Condiments', color: 'bg-purple-500', icon: '🧄' }
    ];

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title={`Amount Report - ${report.period}`} />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    {/* Header with Action Buttons */}
                    <div className="mb-8 print:hidden">
                        <Link
                            href={route('amount-reports.index')}
                            className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4"
                        >
                            <ArrowLeftIcon className="h-4 w-4 mr-2" />
                            Back to Reports
                        </Link>
                        
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900">
                                    Amount Report - {report.period}
                                </h1>
                                <p className="mt-2 text-sm text-gray-600">
                                    Generated on {report.created_at}
                                </p>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex space-x-3">
                                <button
                                    onClick={handlePrint}
                                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                                >
                                    <PrinterIcon className="h-5 w-5 mr-2" />
                                    Print
                                </button>
                                <button
                                    onClick={handleDownload}
                                    disabled={isLoading}
                                    className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
                                >
                                    <DocumentArrowDownIcon className="h-5 w-5 mr-2" />
                                    {isLoading ? 'Downloading...' : 'Download PDF'}
                                </button>
                                <button
                                    onClick={handleRegenerate}
                                    disabled={isLoading}
                                    className="inline-flex items-center px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 disabled:opacity-50"
                                >
                                    <ArrowPathIcon className={`h-5 w-5 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                                    Regenerate
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Summary Statistics Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                        <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-lg shadow-lg p-6 text-white">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-indigo-100 text-sm font-medium">Serving Days</p>
                                    <p className="text-3xl font-bold mt-2">{report.total_serving_days}</p>
                                </div>
                                <CalendarIcon className="h-12 w-12 text-indigo-200 opacity-80" />
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-lg p-6 text-white">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-green-100 text-sm font-medium">Total Students</p>
                                    <p className="text-3xl font-bold mt-2">
                                        {(report.primary?.students || 0) + (report.middle?.students || 0)}
                                    </p>
                                </div>
                                <UserGroupIcon className="h-12 w-12 text-green-200 opacity-80" />
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-lg shadow-lg p-6 text-white">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-yellow-100 text-sm font-medium">Grand Total</p>
                                    <p className="text-3xl font-bold mt-2">
                                        ₹{parseFloat(report.grand_total_amount || 0).toFixed(2)}
                                    </p>
                                </div>
                                <CurrencyRupeeIcon className="h-12 w-12 text-yellow-200 opacity-80" />
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow-lg p-6 text-white">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-purple-100 text-sm font-medium">Avg Daily</p>
                                    <p className="text-3xl font-bold mt-2">
                                        ₹{parseFloat(report.average_daily_amount || 0).toFixed(2)}
                                    </p>
                                </div>
                                <ChartBarIcon className="h-12 w-12 text-purple-200 opacity-80" />
                            </div>
                        </div>
                    </div>

                    {/* PDF Theme Picker */}
                    <div className="bg-white shadow-lg rounded-lg p-6 mb-8 border-2 border-indigo-200">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                                <Cog6ToothIcon className="w-5 h-5 mr-2 text-indigo-600" />
                                PDF Theme Selection
                            </h3>
                            <span className="text-sm text-gray-500">
                                Current Theme: {themes.find(t => t.id === selectedTheme)?.name}
                            </span>
                        </div>
                        
                        <p className="text-sm text-gray-600 mb-4">
                            Choose a theme for your PDF report. The preview will reflect your selection when opened.
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            {themes.map((theme) => (
                                <button
                                    key={theme.id}
                                    onClick={() => handleThemeChange(theme.id)}
                                    className={`p-4 rounded-lg border-2 transition-all ${
                                        selectedTheme === theme.id
                                            ? 'border-indigo-600 shadow-lg bg-indigo-50'
                                            : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                                    }`}
                                >
                                    <div className={`w-full h-12 rounded ${theme.color} mb-3 shadow-sm`}></div>
                                    <p className="text-sm font-semibold text-gray-900">{theme.name}</p>
                                    <p className="text-xs text-gray-500 mt-1">{theme.description}</p>
                                    {selectedTheme === theme.id && (
                                        <p className="text-xs text-indigo-600 font-semibold mt-2">✓ Selected</p>
                                    )}
                                </button>
                            ))}
                        </div>

                        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
                            <p className="text-xs text-blue-800">
                                <strong>Tip:</strong> The Black & White theme is recommended for printing to save ink.
                            </p>
                        </div>
                    </div>

                    {/* PDF Preview */}
                    <div className="bg-white shadow-sm rounded-lg p-6 mb-8">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-medium text-gray-900 flex items-center">
                                <EyeIcon className="w-5 h-5 mr-2 text-indigo-600" />
                                PDF Preview
                                <span className="ml-3 px-2 py-1 text-xs bg-indigo-100 text-indigo-700 rounded">
                                    Theme: {themes.find(t => t.id === selectedTheme)?.name}
                                </span>
                            </h3>
                        </div>
                        <div className="border-2 border-dashed border-indigo-200 rounded-lg p-8 text-center">
                            <p className="text-sm text-gray-600 mb-4">
                                Click the button below to preview the PDF in a new browser tab.
                            </p>
                            <button
                                type="button"
                                onClick={handlePreview}
                                className="inline-flex items-center px-5 py-2.5 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                            >
                                <EyeIcon className="w-5 h-5 mr-2" />
                                Preview PDF
                            </button>
                            <p className="text-xs text-gray-500 mt-3">
                                The preview respects your current theme selection.
                            </p>
                        </div>
                    </div>

                    {/* Detailed Breakdown Sections */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                        {/* Primary Section */}
                        {hasPrimary && report.primary && (
                            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                                <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 px-6 py-4">
                                    <h2 className="text-xl font-bold text-white flex items-center">
                                        <span className="w-2 h-2 bg-white rounded-full mr-3"></span>
                                        Primary Section (Class 1-5)
                                    </h2>
                                    <p className="text-indigo-100 text-sm mt-1">
                                        {report.primary.students} Students • ₹{parseFloat(report.primary.total || 0).toFixed(2)}
                                    </p>
                                </div>

                                <div className="p-6">
                                    {/* Ingredient Breakdown */}
                                    <div className="grid grid-cols-2 gap-3 mb-6">
                                        <div className="border border-gray-200 rounded-lg p-3 hover:shadow-md transition-shadow">
                                            <p className="text-xs text-gray-500 mb-1">Pulses</p>
                                            <p className="text-lg font-bold text-gray-900">
                                                ₹{parseFloat(report.primary.pulses || 0).toFixed(2)}
                                            </p>
                                        </div>
                                        <div className="border border-gray-200 rounded-lg p-3 hover:shadow-md transition-shadow">
                                            <p className="text-xs text-gray-500 mb-1">Vegetables</p>
                                            <p className="text-lg font-bold text-gray-900">
                                                ₹{parseFloat(report.primary.vegetables || 0).toFixed(2)}
                                            </p>
                                        </div>
                                        <div className="border border-gray-200 rounded-lg p-3 hover:shadow-md transition-shadow">
                                            <p className="text-xs text-gray-500 mb-1">Oil/Fat</p>
                                            <p className="text-lg font-bold text-gray-900">
                                                ₹{parseFloat(report.primary.oil || 0).toFixed(2)}
                                            </p>
                                        </div>
                                        <div className="border border-gray-200 rounded-lg p-3 hover:shadow-md transition-shadow">
                                            <p className="text-xs text-gray-500 mb-1">Fuel</p>
                                            <p className="text-lg font-bold text-gray-900">
                                                ₹{parseFloat(report.primary.fuel || 0).toFixed(2)}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="border-2 border-indigo-200 rounded-lg p-4 bg-indigo-50 mb-6">
                                        <p className="text-sm text-indigo-700 mb-1 font-semibold">Total Salt & Condiments</p>
                                        <p className="text-2xl font-bold text-indigo-900">
                                            ₹{parseFloat(report.primary.salt_total || 0).toFixed(2)}
                                        </p>
                                    </div>

                                    {/* Salt Breakdown */}
                                    {report.primary.salt_breakdown && (
                                        <div className="border-t border-gray-200 pt-6">
                                            <h3 className="text-md font-semibold text-gray-900 mb-4">
                                                Salt & Condiments Distribution
                                            </h3>
                                            
                                            <div className="space-y-2 mb-4">
                                                {saltCategories.map((cat) => {
                                                    const amount = parseFloat(report.primary.salt_breakdown[cat.key] || 0);
                                                    const percentage = report.primary.salt_total > 0 
                                                        ? (amount / report.primary.salt_total * 100).toFixed(1)
                                                        : 0;

                                                    return (
                                                        <div key={cat.key} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                                                            <div className="flex items-center space-x-3">
                                                                <span className="text-xl">{cat.icon}</span>
                                                                <span className="text-sm font-medium text-gray-700">{cat.label}</span>
                                                            </div>
                                                            <div className="flex items-center space-x-3">
                                                                <span className="text-xs text-gray-500 bg-white px-2 py-1 rounded">{percentage}%</span>
                                                                <span className="text-sm font-bold text-gray-900 min-w-[80px] text-right">
                                                                    ₹{amount.toFixed(2)}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>

                                            {/* Visual Bar */}
                                            <div className="h-8 flex rounded-lg overflow-hidden shadow-md">
                                                {saltCategories.map((cat) => {
                                                    const amount = parseFloat(report.primary.salt_breakdown[cat.key] || 0);
                                                    const percentage = report.primary.salt_total > 0 
                                                        ? (amount / report.primary.salt_total * 100)
                                                        : 0;

                                                    return percentage > 0 ? (
                                                        <div
                                                            key={cat.key}
                                                            className={`${cat.color} flex items-center justify-center text-white text-xs font-bold transition-all hover:opacity-80`}
                                                            style={{ width: `${percentage}%` }}
                                                            title={`${cat.label}: ${percentage.toFixed(1)}%`}
                                                        >
                                                            {percentage > 10 && `${percentage.toFixed(0)}%`}
                                                        </div>
                                                    ) : null;
                                                })}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Middle Section */}
                        {hasMiddle && report.middle && (
                            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                                <div className="bg-gradient-to-r from-purple-600 to-purple-700 px-6 py-4">
                                    <h2 className="text-xl font-bold text-white flex items-center">
                                        <span className="w-2 h-2 bg-white rounded-full mr-3"></span>
                                        Middle Section (Class 6-8)
                                    </h2>
                                    <p className="text-purple-100 text-sm mt-1">
                                        {report.middle.students} Students • ₹{parseFloat(report.middle.total || 0).toFixed(2)}
                                    </p>
                                </div>

                                <div className="p-6">
                                    {/* Ingredient Breakdown */}
                                    <div className="grid grid-cols-2 gap-3 mb-6">
                                        <div className="border border-gray-200 rounded-lg p-3 hover:shadow-md transition-shadow">
                                            <p className="text-xs text-gray-500 mb-1">Pulses</p>
                                            <p className="text-lg font-bold text-gray-900">
                                                ₹{parseFloat(report.middle.pulses || 0).toFixed(2)}
                                            </p>
                                        </div>
                                        <div className="border border-gray-200 rounded-lg p-3 hover:shadow-md transition-shadow">
                                            <p className="text-xs text-gray-500 mb-1">Vegetables</p>
                                            <p className="text-lg font-bold text-gray-900">
                                                ₹{parseFloat(report.middle.vegetables || 0).toFixed(2)}
                                            </p>
                                        </div>
                                        <div className="border border-gray-200 rounded-lg p-3 hover:shadow-md transition-shadow">
                                            <p className="text-xs text-gray-500 mb-1">Oil/Fat</p>
                                            <p className="text-lg font-bold text-gray-900">
                                                ₹{parseFloat(report.middle.oil || 0).toFixed(2)}
                                            </p>
                                        </div>
                                        <div className="border border-gray-200 rounded-lg p-3 hover:shadow-md transition-shadow">
                                            <p className="text-xs text-gray-500 mb-1">Fuel</p>
                                            <p className="text-lg font-bold text-gray-900">
                                                ₹{parseFloat(report.middle.fuel || 0).toFixed(2)}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="border-2 border-purple-200 rounded-lg p-4 bg-purple-50 mb-6">
                                        <p className="text-sm text-purple-700 mb-1 font-semibold">Total Salt & Condiments</p>
                                        <p className="text-2xl font-bold text-purple-900">
                                            ₹{parseFloat(report.middle.salt_total || 0).toFixed(2)}
                                        </p>
                                    </div>

                                    {/* Salt Breakdown */}
                                    {report.middle.salt_breakdown && (
                                        <div className="border-t border-gray-200 pt-6">
                                            <h3 className="text-md font-semibold text-gray-900 mb-4">
                                                Salt & Condiments Distribution
                                            </h3>
                                            
                                            <div className="space-y-2 mb-4">
                                                {saltCategories.map((cat) => {
                                                    const amount = parseFloat(report.middle.salt_breakdown[cat.key] || 0);
                                                    const percentage = report.middle.salt_total > 0 
                                                        ? (amount / report.middle.salt_total * 100).toFixed(1)
                                                        : 0;

                                                    return (
                                                        <div key={cat.key} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                                                            <div className="flex items-center space-x-3">
                                                                <span className="text-xl">{cat.icon}</span>
                                                                <span className="text-sm font-medium text-gray-700">{cat.label}</span>
                                                            </div>
                                                            <div className="flex items-center space-x-3">
                                                                <span className="text-xs text-gray-500 bg-white px-2 py-1 rounded">{percentage}%</span>
                                                                <span className="text-sm font-bold text-gray-900 min-w-[80px] text-right">
                                                                    ₹{amount.toFixed(2)}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>

                                            {/* Visual Bar */}
                                            <div className="h-8 flex rounded-lg overflow-hidden shadow-md">
                                                {saltCategories.map((cat) => {
                                                    const amount = parseFloat(report.middle.salt_breakdown[cat.key] || 0);
                                                    const percentage = report.middle.salt_total > 0 
                                                        ? (amount / report.middle.salt_total * 100)
                                                        : 0;

                                                    return percentage > 0 ? (
                                                        <div
                                                            key={cat.key}
                                                            className={`${cat.color} flex items-center justify-center text-white text-xs font-bold transition-all hover:opacity-80`}
                                                            style={{ width: `${percentage}%` }}
                                                            title={`${cat.label}: ${percentage.toFixed(1)}%`}
                                                        >
                                                            {percentage > 10 && `${percentage.toFixed(0)}%`}
                                                        </div>
                                                    ) : null;
                                                })}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Daily Records Table */}
                    {report.daily_records && report.daily_records.length > 0 && (
                        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                            <div className="bg-gradient-to-r from-gray-700 to-gray-800 px-6 py-4 border-b border-gray-600">
                                <h2 className="text-xl font-bold text-white">
                                    Daily Consumption Records
                                </h2>
                                <p className="text-gray-300 text-sm">
                                    {report.daily_records.length} days of detailed consumption data
                                </p>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Day</th>
                                            {hasPrimary && <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Primary Students</th>}
                                            {hasMiddle && <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Middle Students</th>}
                                            {hasPrimary && <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Primary Amount</th>}
                                            {hasMiddle && <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Middle Amount</th>}
                                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Daily Total</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {report.daily_records.map((record, index) => (
                                            <tr key={index} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                                                    {new Date(record.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{record.day}</td>
                                                {hasPrimary && <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">{record.served_primary || 0}</td>}
                                                {hasMiddle && <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">{record.served_middle || 0}</td>}
                                                {hasPrimary && <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium text-gray-900">₹{parseFloat(record.primary?.total || 0).toFixed(2)}</td>}
                                                {hasMiddle && <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium text-gray-900">₹{parseFloat(record.middle?.total || 0).toFixed(2)}</td>}
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-bold text-gray-900">₹{parseFloat(record.grand_total || 0).toFixed(2)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                    <tfoot className="bg-gray-50">
                                        <tr className="border-t-2 border-gray-300">
                                            <td colSpan="2" className="px-6 py-4 text-sm font-bold text-gray-900 uppercase">Grand Total</td>
                                            {hasPrimary && <td className="px-6 py-4 text-sm text-right font-bold text-indigo-600">{report.primary?.students || 0}</td>}
                                            {hasMiddle && <td className="px-6 py-4 text-sm text-right font-bold text-purple-600">{report.middle?.students || 0}</td>}
                                            {hasPrimary && <td className="px-6 py-4 text-sm text-right font-bold text-indigo-600">₹{parseFloat(report.primary?.total || 0).toFixed(2)}</td>}
                                            {hasMiddle && <td className="px-6 py-4 text-sm text-right font-bold text-purple-600">₹{parseFloat(report.middle?.total || 0).toFixed(2)}</td>}
                                            <td className="px-6 py-4 text-sm text-right font-bold text-green-600">₹{parseFloat(report.grand_total_amount || 0).toFixed(2)}</td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Footer Info */}
                    <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="flex items-start">
                            <div className="flex-shrink-0">
                                <svg className="h-5 w-5 text-blue-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div className="ml-3">
                                <h3 className="text-sm font-medium text-blue-800">
                                    About This Report
                                </h3>
                                <div className="mt-2 text-sm text-blue-700">
                                    <p>
                                        This report uses salt & condiments breakdown percentages from your 
                                        <Link 
                                            href={route('amount-config.index')} 
                                            className="font-semibold underline hover:text-blue-900 ml-1 mr-1"
                                        >
                                            Amount Configuration
                                        </Link>
                                        to distribute costs across different condiment categories.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}