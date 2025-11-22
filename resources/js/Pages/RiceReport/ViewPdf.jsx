import { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import {
    FileDown,
    RefreshCw,
    Eye,
    Palette,
    TrendingUp,
    Calendar,
    Package,
    AlertCircle,
    Droplets,
} from 'lucide-react';

export default function ViewPdf({
    report,
    allReports,
    schoolType,
    schoolInfo,
    currentAvailableStock,
    statistics,
}) {
    const [selectedTheme, setSelectedTheme] = useState('bw');
    const [selectedReportId, setSelectedReportId] = useState(report.id);
    const [isLoading, setIsLoading] = useState(false);

    // ✅ Dynamic PDF URL for inline preview
    const pdfUrl = `/rice-reports/${selectedReportId}/generate-pdf?theme=${selectedTheme}&preview=1`;

    const themes = [
        { id: 'bw', name: 'Black & White', color: 'bg-gray-700', preview: 'Professional' },
        { id: 'blue', name: 'Blue Theme', color: 'bg-blue-600', preview: 'Classic' },
        { id: 'green', name: 'Green Theme', color: 'bg-green-600', preview: 'Fresh' },
        { id: 'purple', name: 'Purple Theme', color: 'bg-purple-600', preview: 'Modern' },
    ];

    const handleThemeChange = (themeId) => setSelectedTheme(themeId);

    const handleReportChange = (e) => {
        const reportId = e.target.value;
        setSelectedReportId(reportId);
        router.visit(`/rice-reports/${reportId}/view-pdf`, { preserveScroll: true });
    };

    const handleDownload = () => {
        const downloadUrl = `/rice-reports/${selectedReportId}/generate-pdf?theme=${selectedTheme}&download=1`;
        window.open(downloadUrl, '_blank');
    };

    const handlePreview = () => {
        window.open(pdfUrl, '_blank');
    };

    const handleRegenerate = () => {
        if (confirm('Are you sure you want to regenerate this report? This will recalculate all data.')) {
            setIsLoading(true);
            router.post(`/rice-reports/${selectedReportId}/regenerate`, {}, {
                onFinish: () => setIsLoading(false),
            });
        }
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold leading-tight text-gray-800">
                        Rice Report - {report.period}
                    </h2>
                    <div className="flex gap-2">
                        <button
                            onClick={handleRegenerate}
                            disabled={isLoading}
                            className="inline-flex items-center px-4 py-2 bg-yellow-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-yellow-700 disabled:opacity-50"
                        >
                            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                            Regenerate
                        </button>
                        <button
                            onClick={handleDownload}
                            className="inline-flex items-center px-4 py-2 bg-green-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-green-700"
                        >
                            <FileDown className="w-4 h-4 mr-2" />
                            Download PDF
                        </button>
                    </div>
                </div>
            }
        >
            <Head title={`Rice Report - ${report.period}`} />

            <div className="py-6">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">

                    {/* ============================================
                        LIVE STATISTICS
                    ============================================ */}
                    {statistics && (
                        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg p-6 text-white">
                            <div className="flex items-center mb-4">
                                <AlertCircle className="w-5 h-5 mr-2" />
                                <p className="text-sm font-medium">Live System Statistics (Real-time Data)</p>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="flex items-center">
                                    <Package className="w-8 h-8 mr-3 opacity-80" />
                                    <div>
                                        <p className="text-sm opacity-90">Current Available Stock</p>
                                        <p className="text-2xl font-bold">
                                            {currentAvailableStock?.toFixed(2) || '0.00'} kg
                                        </p>
                                        <p className="text-xs opacity-75 mt-1">Live closing balance</p>
                                    </div>
                                </div>
                                <div className="flex items-center">
                                    <TrendingUp className="w-8 h-8 mr-3 opacity-80" />
                                    <div>
                                        <p className="text-sm opacity-90">Total Consumed (All Time)</p>
                                        <p className="text-2xl font-bold">
                                            {statistics.total_rice_consumed?.toFixed(2) || '0.00'} kg
                                        </p>
                                        <p className="text-xs opacity-75 mt-1">Calculated from daily records</p>
                                    </div>
                                </div>
                                <div className="flex items-center">
                                    <Calendar className="w-8 h-8 mr-3 opacity-80" />
                                    <div>
                                        <p className="text-sm opacity-90">Average Daily Consumption</p>
                                        <p className="text-2xl font-bold">
                                            {statistics.average_daily_consumption?.toFixed(2) || '0.00'} kg
                                        </p>
                                        <p className="text-xs opacity-75 mt-1">All-time average per day</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ============================================
                        CONTROL PANEL
                    ============================================ */}
                    <div className="bg-white shadow-sm sm:rounded-lg p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    <Eye className="w-4 h-4 inline mr-2" />
                                    Select Report
                                </label>
                                <select
                                    value={selectedReportId}
                                    onChange={handleReportChange}
                                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                >
                                    {allReports.map((r) => (
                                        <option key={r.id} value={r.id}>
                                            {r.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    <Palette className="w-4 h-4 inline mr-2" />
                                    Select Theme
                                </label>
                                <div className="grid grid-cols-4 gap-2">
                                    {themes.map((theme) => (
                                        <button
                                            key={theme.id}
                                            onClick={() => handleThemeChange(theme.id)}
                                            className={`p-3 rounded-lg border-2 transition-all ${
                                                selectedTheme === theme.id
                                                    ? 'border-indigo-600 shadow-md'
                                                    : 'border-gray-200 hover:border-gray-300'
                                            }`}
                                        >
                                            <div className={`w-full h-8 rounded ${theme.color} mb-2`}></div>
                                            <p className="text-xs font-medium text-gray-700">{theme.name}</p>
                                            <p className="text-xs text-gray-500">{theme.preview}</p>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ============================================
                        PDF PREVIEW
                    ============================================ */}
                    <div className="bg-white shadow-sm sm:rounded-lg p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-medium text-gray-900">PDF Preview</h3>
                            <span className="text-sm text-indigo-600 font-medium">
                                Theme: {themes.find((t) => t.id === selectedTheme)?.name}
                            </span>
                        </div>
                        <div className="border-2 border-dashed border-indigo-200 rounded-lg p-8 text-center">
                            <p className="text-sm text-gray-600 mb-4">
                                Use the buttons above to pick a theme, then click below to open the live preview in a new browser tab.
                            </p>
                            <button
                                type="button"
                                onClick={handlePreview}
                                className="inline-flex items-center px-5 py-2.5 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                            >
                                <Eye className="w-5 h-5 mr-2" />
                                Preview PDF
                            </button>
                            <p className="text-xs text-gray-500 mt-3">
                                The preview reflects your latest theme selection instantly.
                            </p>
                        </div>
                    </div>

                    {/* ============================================
                        SECTION-WISE SUMMARY
                    ============================================ */}
                    <div className="bg-white shadow-sm sm:rounded-lg p-6">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">
                            Section-wise Summary for {report.period}
                        </h3>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Section</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Students</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rice Consumed (kg)</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    <tr>
                                        <td className="px-6 py-4 text-sm font-medium text-gray-900">Primary (Class 1-5)</td>
                                        <td className="px-6 py-4 text-sm text-gray-500">{report.totals_by_section?.primary?.students || 0}</td>
                                        <td className="px-6 py-4 text-sm text-gray-500">{report.totals_by_section?.primary?.formatted_rice || '0.00 kg'}</td>
                                    </tr>
                                    <tr>
                                        <td className="px-6 py-4 text-sm font-medium text-gray-900">Middle (Class 6-8)</td>
                                        <td className="px-6 py-4 text-sm text-gray-500">{report.totals_by_section?.middle?.students || 0}</td>
                                        <td className="px-6 py-4 text-sm text-gray-500">{report.totals_by_section?.middle?.formatted_rice || '0.00 kg'}</td>
                                    </tr>
                                    <tr className="bg-gray-50">
                                        <td className="px-6 py-4 text-sm font-bold text-gray-900">Grand Total</td>
                                        <td className="px-6 py-4 text-sm font-bold text-gray-900">{report.totals_by_section?.grand_total?.students || 0}</td>
                                        <td className="px-6 py-4 text-sm font-bold text-gray-900">{report.totals_by_section?.grand_total?.formatted_rice || '0.00 kg'}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* ============================================
                        SALT & CONDIMENT BREAKDOWN (TWO COLUMNS)
                    ============================================ */}
                    <div className="bg-white shadow-sm sm:rounded-lg p-6">
                        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                            <Droplets className="w-5 h-5 mr-2 text-indigo-600" />
                            Salt & Condiment Breakdown
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* LEFT: Primary */}
                            <div>
                                <h4 className="text-md font-semibold text-gray-800 mb-3">Primary (Class 1–5)</h4>
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between border-b pb-1">
                                        <span>Salt Used:</span>
                                        <span>{report.breakdown?.salt?.primary || '0.00 kg'}</span>
                                    </div>
                                    <div className="flex justify-between border-b pb-1">
                                        <span>Condiments Used:</span>
                                        <span>{report.breakdown?.condiment?.primary || '0.00 kg'}</span>
                                    </div>
                                </div>
                            </div>

                            {/* RIGHT: Middle */}
                            <div>
                                <h4 className="text-md font-semibold text-gray-800 mb-3">Middle (Class 6–8)</h4>
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between border-b pb-1">
                                        <span>Salt Used:</span>
                                        <span>{report.breakdown?.salt?.middle || '0.00 kg'}</span>
                                    </div>
                                    <div className="flex justify-between border-b pb-1">
                                        <span>Condiments Used:</span>
                                        <span>{report.breakdown?.condiment?.middle || '0.00 kg'}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ============================================
                        REPORT METADATA
                    ============================================ */}
                    <div className="bg-white shadow-sm sm:rounded-lg p-6">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Report Information</h3>
                        <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <dt className="text-sm font-medium text-gray-500">Report Period</dt>
                                <dd className="mt-1 text-sm text-gray-900">{report.period}</dd>
                            </div>
                            <div>
                                <dt className="text-sm font-medium text-gray-500">School Type</dt>
                                <dd className="mt-1 text-sm text-gray-900 capitalize">{report.school_type}</dd>
                            </div>
                            <div>
                                <dt className="text-sm font-medium text-gray-500">Opening Balance</dt>
                                <dd className="mt-1 text-sm text-gray-900">{report.opening_balance} kg</dd>
                            </div>
                            <div>
                                <dt className="text-sm font-medium text-gray-500">Closing Balance</dt>
                                <dd className="mt-1 text-sm text-gray-900">{report.closing_balance} kg</dd>
                            </div>
                            <div>
                                <dt className="text-sm font-medium text-gray-500">Total Rice Consumed</dt>
                                <dd className="mt-1 text-sm text-gray-900">{report.total_rice_consumed} kg</dd>
                            </div>
                            <div>
                                <dt className="text-sm font-medium text-gray-500">Serving Days</dt>
                                <dd className="mt-1 text-sm text-gray-900">{report.total_serving_days} days</dd>
                            </div>
                            <div>
                                <dt className="text-sm font-medium text-gray-500">Average Daily Consumption</dt>
                                <dd className="mt-1 text-sm text-gray-900">{report.average_daily_consumption} kg</dd>
                            </div>
                            <div>
                                <dt className="text-sm font-medium text-gray-500">Generated On</dt>
                                <dd className="mt-1 text-sm text-gray-900">{new Date(report.created_at).toLocaleString()}</dd>
                            </div>
                        </dl>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
