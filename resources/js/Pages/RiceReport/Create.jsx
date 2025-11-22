import { useState } from 'react';
import { Head, router, usePage } from '@inertiajs/react';

import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { FileBarChart, Calendar, AlertCircle, CheckCircle2, Package, Info } from 'lucide-react';

/**
 * Rice Report Create Page
 * 
 * Receives currentAvailableStock from ConsumptionCalculationService
 * Shows same stock value as Dashboard and Daily Consumption
 * All data comes from synced RiceConfiguration
 * Fully aligned with DailyConsumptionController pattern
 */
export default function Create({ 
    currentMonth, 
    currentYear, 
    availableMonths, 
    schoolType,
    currentAvailableStock,  // From ConsumptionCalculationService::getAvailableStock()
    hasRiceConfig           // Boolean: RiceConfiguration exists
}) {
    const { props } = usePage();
    const flash = props.flash || {};
    const errors = props.errors || {};
    const [formData, setFormData] = useState({
        month: currentMonth,
        year: currentYear,
    });
    const [isChecking, setIsChecking] = useState(false);
    const [existingReport, setExistingReport] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const months = [
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

    const years = Array.from({ length: 10 }, (_, i) => currentYear - 5 + i);

    /**
     * Check if a report already exists for the selected month/year
     */
    const handleCheckReport = async () => {
        setIsChecking(true);
        setExistingReport(null);

        try {
            const response = await fetch(
                `/rice-reports/find-report?month=${formData.month}&year=${formData.year}`
            );
            const data = await response.json();

            if (data.exists) {
                setExistingReport(data);
            }
        } catch (error) {
            console.error('Error checking report:', error);
        } finally {
            setIsChecking(false);
        }
    };

    /**
     * Submit form to generate new report
     */
    const handleSubmit = (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        
        router.post('/rice-reports', formData, {
            onFinish: () => setIsSubmitting(false),
        });
    };

    /**
     * Handle month/year selection change
     */
    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: parseInt(value) }));
        setExistingReport(null);
    };

    /**
     * Quick select a month from available months list
     */
    const handleQuickSelect = (month, year) => {
        setFormData({ month, year });
        setExistingReport(null);
    };

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Generate Rice Report
                </h2>
            }
        >
            <Head title="Generate Rice Report" />

            <div className="py-6">
                <div className="max-w-3xl mx-auto sm:px-6 lg:px-8 space-y-6">
                    
                    {/* ============================================
                        CURRENT STOCK DISPLAY
                        Shows live stock from ConsumptionCalculationService
                        Same value as Dashboard and Daily Consumption
                        ============================================ */}
                    {hasRiceConfig && (
                        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-5 shadow-sm">
                            <div className="flex items-center">
                                <div className="flex-shrink-0 p-3 bg-green-100 rounded-lg">
                                    <Package className="w-7 h-7 text-green-600" />
                                </div>
                                <div className="ml-4 flex-1">
                                    <h3 className="text-sm font-medium text-green-900">
                                        Current Available Stock
                                    </h3>
                                    <p className="mt-1 text-3xl font-bold text-green-700">
                                        {currentAvailableStock} kg
                                    </p>
                                    <p className="mt-1 text-xs text-green-600">
                                        Live data from RiceConfiguration (Primary + Upper Primary closing balances)
                                    </p>
                                </div>
                                <div className="ml-auto">
                                    <div className="inline-flex items-center px-3 py-1 bg-green-100 rounded-full">
                                        <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                                        <span className="text-xs font-medium text-green-700">Live</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ============================================
                        AVAILABLE MONTHS QUICK SELECTOR
                        Shows months with consumption data
                        ============================================ */}
                    {availableMonths.length > 0 && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-5 shadow-sm">
                            <div className="flex items-start">
                                <Info className="w-5 h-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
                                <div className="flex-1">
                                    <h3 className="text-sm font-medium text-blue-900 mb-3">
                                        Available Months for Report Generation
                                    </h3>
                                    <div className="flex flex-wrap gap-2">
                                        {availableMonths.map((month) => (
                                            <button
                                                key={`${month.year}-${month.month}`}
                                                onClick={() => handleQuickSelect(month.month, month.year)}
                                                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                                                    formData.month === month.month && formData.year === month.year
                                                        ? 'bg-blue-600 text-white shadow-md'
                                                        : 'bg-white text-blue-700 border border-blue-300 hover:bg-blue-50 hover:border-blue-400'
                                                }`}
                                            >
                                                {month.label}
                                            </button>
                                        ))}
                                    </div>
                                    <p className="mt-3 text-xs text-blue-600">
                                        These months have daily consumption records available for report generation
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ============================================
                        WARNING: NO RICE CONFIGURATION
                        ============================================ */}
                    {!hasRiceConfig && (
                        <div className="bg-yellow-50 border border-yellow-300 rounded-lg p-5 shadow-sm">
                            <div className="flex items-start">
                                <AlertCircle className="w-6 h-6 text-yellow-600 mt-0.5 mr-3 flex-shrink-0" />
                                <div className="flex-1">
                                    <h3 className="text-sm font-semibold text-yellow-900">
                                        Rice Configuration Required
                                    </h3>
                                    <p className="mt-2 text-sm text-yellow-700">
                                        You need to set up your rice configuration before generating reports. 
                                        This includes opening balance, rice lifted, and consumption rates.
                                    </p>
                                    <a
                                        href="/rice-configuration/edit"
                                        className="mt-3 inline-flex items-center px-4 py-2 bg-yellow-600 text-white text-sm font-medium rounded-md hover:bg-yellow-700 transition-colors"
                                    >
                                        Configure Rice Settings →
                                    </a>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ============================================
                        FLASH & VALIDATION MESSAGES
                        ============================================ */}
                    {(flash.error || flash.success || Object.keys(errors).length > 0) && (
                        <div className="space-y-3">
                            {flash.error && (
                                <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex">
                                    <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 mr-3" />
                                    <div>
                                        <p className="text-sm font-semibold text-red-800">Unable to generate report</p>
                                        <p className="text-sm text-red-700 mt-1">{flash.error}</p>
                                    </div>
                                </div>
                            )}
                            {flash.success && (
                                <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex">
                                    <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 mr-3" />
                                    <div>
                                        <p className="text-sm font-semibold text-green-800">{flash.success}</p>
                                    </div>
                                </div>
                            )}
                            {Object.values(errors).length > 0 && (
                                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                                    <p className="text-sm font-semibold text-yellow-800">Please fix the following:</p>
                                    <ul className="mt-2 text-sm text-yellow-700 list-disc list-inside space-y-1">
                                        {Object.entries(errors).map(([key, message]) => (
                                            <li key={key}>{message}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    )}

                    {/* ============================================
                        MAIN FORM: MONTH & YEAR SELECTION
                        ============================================ */}
                    <div className="bg-white shadow-sm sm:rounded-lg">
                        <div className="p-6">
                            <div className="flex items-center mb-6">
                                <FileBarChart className="w-6 h-6 text-indigo-600 mr-3" />
                                <div>
                                    <h3 className="text-lg font-medium text-gray-900">
                                        Select Month and Year
                                    </h3>
                                    <p className="text-sm text-gray-500 mt-1">
                                        Choose the period for which you want to generate the report
                                    </p>
                                </div>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                
                                {/* Month and Year Selectors */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Month <span className="text-red-500">*</span>
                                        </label>
                                        <select
                                            value={formData.month}
                                            onChange={(e) => handleChange('month', e.target.value)}
                                            className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                            required
                                        >
                                            {months.map((month) => (
                                                <option key={month.value} value={month.value}>
                                                    {month.label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Year <span className="text-red-500">*</span>
                                        </label>
                                        <select
                                            value={formData.year}
                                            onChange={(e) => handleChange('year', e.target.value)}
                                            className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                            required
                                        >
                                            {years.map((year) => (
                                                <option key={year} value={year}>
                                                    {year}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                {/* Check Report Button */}
                                <div>
                                    <button
                                        type="button"
                                        onClick={handleCheckReport}
                                        disabled={isChecking}
                                        className="w-full inline-flex justify-center items-center px-4 py-3 bg-gray-100 border border-gray-300 rounded-md font-semibold text-xs text-gray-700 uppercase tracking-widest hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                    >
                                        <Calendar className={`w-4 h-4 mr-2 ${isChecking ? 'animate-spin' : ''}`} />
                                        {isChecking ? 'Checking...' : 'Check if Report Exists'}
                                    </button>
                                </div>

                                {/* ============================================
                                    EXISTING REPORT ALERT
                                    ============================================ */}
                                {existingReport && (
                                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                                        <div className="flex items-start">
                                            <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 mr-3 flex-shrink-0" />
                                            <div className="flex-1">
                                                <h4 className="text-sm font-medium text-yellow-900">
                                                    Report Already Exists
                                                </h4>
                                                <p className="mt-1 text-sm text-yellow-700">
                                                    A report for <strong>{existingReport.month_name}</strong> already exists. 
                                                    You can view or regenerate it.
                                                </p>
                                                <div className="mt-3 flex gap-2">
                                                    <a
                                                        href={existingReport.url}
                                                        className="inline-flex items-center px-3 py-1.5 bg-yellow-600 text-white text-sm font-medium rounded hover:bg-yellow-700 transition-colors"
                                                    >
                                                        View Existing Report →
                                                    </a>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* ============================================
                                    READY TO GENERATE CONFIRMATION
                                    ============================================ */}
                                {!isChecking && existingReport === null && formData.month && formData.year && (
                                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                        <div className="flex items-start">
                                            <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 mr-3 flex-shrink-0" />
                                            <div>
                                                <h4 className="text-sm font-medium text-green-900">
                                                    Ready to Generate
                                                </h4>
                                                <p className="mt-1 text-sm text-green-700">
                                                    No report exists for <strong>{months.find(m => m.value === formData.month)?.label} {formData.year}</strong>. 
                                                    You can generate a new report now.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* ============================================
                                    ACTION BUTTONS
                                    ============================================ */}
                                <div className="flex items-center justify-end gap-4 pt-4 border-t border-gray-200">
                                    <a
                                        href="/rice-reports"
                                        className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-md font-semibold text-xs text-gray-700 uppercase tracking-widest hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all"
                                    >
                                        Cancel
                                    </a>
                                    <button
                                        type="submit"
                                        disabled={isSubmitting || existingReport !== null || !hasRiceConfig}
                                        className="inline-flex items-center px-4 py-2 bg-indigo-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                    >
                                        <FileBarChart className="w-4 h-4 mr-2" />
                                        {isSubmitting ? 'Generating...' : 'Generate Report'}
                                    </button>
                                </div>

                            </form>
                        </div>
                    </div>

                    {/* ============================================
                        INFORMATION BOX
                        ============================================ */}
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-5 shadow-sm">
                        <div className="flex items-start">
                            <Info className="w-5 h-5 text-gray-500 mt-0.5 mr-3 flex-shrink-0" />
                            <div>
                                <h4 className="text-sm font-medium text-gray-900 mb-3">
                                    About Report Generation
                                </h4>
                                <ul className="text-sm text-gray-600 space-y-2">
                                    <li className="flex items-start">
                                        <span className="text-indigo-600 mr-2">•</span>
                                        <span>Reports are generated from daily consumption records for the selected month</span>
                                    </li>
                                    <li className="flex items-start">
                                        <span className="text-indigo-600 mr-2">•</span>
                                        <span>Each month can only have one report (regeneration is allowed)</span>
                                    </li>
                                    <li className="flex items-start">
                                        <span className="text-indigo-600 mr-2">•</span>
                                        <span>You need daily consumption data for the selected month to generate a report</span>
                                    </li>
                                    <li className="flex items-start">
                                        <span className="text-indigo-600 mr-2">•</span>
                                        <span>Rice configuration must be set up before generating any reports</span>
                                    </li>
                                    <li className="flex items-start">
                                        <span className="text-indigo-600 mr-2">•</span>
                                        <span>Current available stock shown above is synced with live data from RiceConfiguration</span>
                                    </li>
                                    <li className="flex items-start">
                                        <span className="text-indigo-600 mr-2">•</span>
                                        <span>All stock values are calculated using ConsumptionCalculationService (same as Dashboard)</span>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* ============================================
                        TECHNICAL NOTE (Only visible in development)
                        ============================================ */}
                    {process.env.NODE_ENV === 'development' && (
                        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                            <h4 className="text-xs font-mono font-semibold text-purple-900 mb-2">
                                🔧 Technical Info (Dev Only)
                            </h4>
                            <div className="text-xs font-mono text-purple-700 space-y-1">
                                <div>Current Stock: {currentAvailableStock} kg</div>
                                <div>Has Rice Config: {hasRiceConfig ? '✓ Yes' : '✗ No'}</div>
                                <div>Available Months: {availableMonths.length}</div>
                                <div>Selected: {months.find(m => m.value === formData.month)?.label} {formData.year}</div>
                                <div>Data Source: ConsumptionCalculationService::getAvailableStock()</div>
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </AuthenticatedLayout>
    );
}