import React, { useState, useEffect } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { 
    ArrowLeftIcon, 
    ExclamationCircleIcon,
    CheckCircleIcon,
    InformationCircleIcon
} from '@heroicons/react/24/outline';
import axios from 'axios';

export default function Create({ 
    auth, 
    currentMonth, 
    currentYear, 
    availableMonths,
    schoolType,
    hasPrimary,
    hasMiddle 
}) {
    const { data, setData, post, processing, errors } = useForm({
        month: currentMonth,
        year: currentYear,
    });

    const [checking, setChecking] = useState(false);
    const [existingReport, setExistingReport] = useState(null);
    const [selectedPeriod, setSelectedPeriod] = useState(null);

    // Check if report exists when month/year changes
    useEffect(() => {
        if (data.month && data.year) {
            checkExistingReport();
        }
    }, [data.month, data.year]);

    const checkExistingReport = async () => {
        setChecking(true);
        setExistingReport(null);

        try {
            const response = await axios.get(route('amount-reports.find-report'), {
                params: {
                    month: data.month,
                    year: data.year,
                },
            });

            if (response.data.exists) {
                setExistingReport(response.data.report);
            }

            // Find selected period info
            const period = availableMonths.find(
                m => m.month === parseInt(data.month) && m.year === parseInt(data.year)
            );
            setSelectedPeriod(period);

        } catch (error) {
            console.error('Error checking report:', error);
        } finally {
            setChecking(false);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('amount-reports.store'));
    };

    const getMonthName = (monthNum) => {
        const months = ['January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'];
        return months[monthNum - 1];
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Generate Amount Report" />

            <div className="py-12">
                <div className="max-w-5xl mx-auto sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="mb-8">
                        <Link
                            href={route('amount-reports.index')}
                            className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4"
                        >
                            <ArrowLeftIcon className="h-4 w-4 mr-2" />
                            Back to Reports
                        </Link>
                        <h1 className="text-3xl font-bold text-gray-900">Generate Amount Report</h1>
                        <p className="mt-2 text-sm text-gray-600">
                            Create a monthly consumption report with detailed salt breakdown
                        </p>
                    </div>

                    {/* Info Alert - Salt breakdown comes from configuration */}
                    <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="flex">
                            <InformationCircleIcon className="h-5 w-5 text-blue-500 mr-3 flex-shrink-0 mt-0.5" />
                            <div>
                                <h3 className="text-sm font-medium text-blue-800">
                                    Salt Breakdown from Configuration
                                </h3>
                                <p className="mt-1 text-sm text-blue-700">
                                    This report will use the unified salt &amp; condiments percentages from your
                                    <Link 
                                        href={route('amount-config.index')} 
                                        className="font-semibold underline hover:text-blue-900 ml-1"
                                    >
                                        Amount Configuration
                                    </Link> 
                                    (applied to both Primary and Middle). Make sure your configuration is up to date before generating the report.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Main Form */}
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Period Selection */}
                        <div className="bg-white shadow-sm rounded-lg p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Report Period</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Month Selection */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Month
                                    </label>
                                    <select
                                        value={data.month}
                                        onChange={(e) => setData('month', parseInt(e.target.value))}
                                        className="block w-full rounded-md border-gray-300 shadow-sm 
                                            focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                        disabled={processing}
                                    >
                                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((m) => (
                                            <option key={m} value={m}>
                                                {getMonthName(m)}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.month && (
                                        <p className="mt-1 text-sm text-red-600">{errors.month}</p>
                                    )}
                                </div>

                                {/* Year Selection */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Year
                                    </label>
                                    <select
                                        value={data.year}
                                        onChange={(e) => setData('year', parseInt(e.target.value))}
                                        className="block w-full rounded-md border-gray-300 shadow-sm 
                                            focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                        disabled={processing}
                                    >
                                        {Array.from({ length: 5 }, (_, i) => currentYear - 2 + i).map((y) => (
                                            <option key={y} value={y}>
                                                {y}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.year && (
                                        <p className="mt-1 text-sm text-red-600">{errors.year}</p>
                                    )}
                                </div>
                            </div>

                            {/* Checking Status */}
                            {checking && (
                                <div className="mt-4 flex items-center p-4 bg-blue-50 border border-blue-200 rounded-md">
                                    <InformationCircleIcon className="h-5 w-5 text-blue-500 mr-3" />
                                    <span className="text-sm text-blue-700">Checking report status...</span>
                                </div>
                            )}

                            {/* Existing Report Warning */}
                            {existingReport && (
                                <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
                                    <div className="flex">
                                        <ExclamationCircleIcon className="h-5 w-5 text-yellow-500 mr-3" />
                                        <div className="flex-1">
                                            <h3 className="text-sm font-medium text-yellow-800">
                                                Report Already Exists
                                            </h3>
                                            <p className="mt-1 text-sm text-yellow-700">
                                                A report for {existingReport.period} already exists. 
                                                You can view it or regenerate with fresh data.
                                            </p>
                                            <div className="mt-3 flex space-x-3">
                                                <Link
                                                    href={route('amount-reports.view-pdf', existingReport.id)}
                                                    className="text-sm font-medium text-yellow-800 hover:text-yellow-900 underline"
                                                >
                                                    View Existing Report
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Period Information */}
                            {selectedPeriod && !checking && (
                                <div className={`mt-4 p-4 rounded-md ${
                                    selectedPeriod.has_report 
                                        ? 'bg-yellow-50 border border-yellow-200' 
                                        : selectedPeriod.record_count > 0
                                            ? 'bg-green-50 border border-green-200'
                                            : 'bg-red-50 border border-red-200'
                                }`}>
                                    <div className="flex">
                                        {selectedPeriod.record_count > 0 ? (
                                            <CheckCircleIcon className={`h-5 w-5 mr-3 ${
                                                selectedPeriod.has_report ? 'text-yellow-500' : 'text-green-500'
                                            }`} />
                                        ) : (
                                            <ExclamationCircleIcon className="h-5 w-5 text-red-500 mr-3" />
                                        )}
                                        <div>
                                            <h3 className="text-sm font-medium">
                                                {selectedPeriod.period}
                                            </h3>
                                            <p className="mt-1 text-sm">
                                                {selectedPeriod.record_count > 0 ? (
                                                    <>
                                                        <strong>{selectedPeriod.record_count}</strong> consumption records found
                                                        {selectedPeriod.has_report && ' (Report exists)'}
                                                    </>
                                                ) : (
                                                    'No consumption records found for this period'
                                                )}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Validation Errors */}
                        {errors.generation && (
                            <div className="p-4 bg-red-50 border border-red-200 rounded-md">
                                <div className="flex">
                                    <ExclamationCircleIcon className="h-5 w-5 text-red-500 mr-3 flex-shrink-0" />
                                    <div className="flex-1">
                                        <h3 className="text-sm font-medium text-red-800">
                                            Cannot Generate Report
                                        </h3>
                                        <div className="mt-2 text-sm text-red-700">
                                            <ul className="list-disc list-inside space-y-1">
                                                {Array.isArray(errors.generation) ? (
                                                    errors.generation.map((error, index) => (
                                                        <li key={index}>{error}</li>
                                                    ))
                                                ) : (
                                                    <li>{errors.generation}</li>
                                                )}
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Action Buttons */}
                        <div className="bg-white shadow-sm rounded-lg p-6">
                            <div className="flex items-center justify-between">
                                <Link
                                    href={route('amount-reports.index')}
                                    className="text-sm text-gray-600 hover:text-gray-900"
                                >
                                    Cancel
                                </Link>
                                <button
                                    type="submit"
                                    disabled={
                                        processing || 
                                        checking || 
                                        (selectedPeriod && selectedPeriod.record_count === 0)
                                    }
                                    className="inline-flex items-center px-6 py-3 bg-indigo-600 border border-transparent 
                                        rounded-md font-semibold text-sm text-white uppercase tracking-widest 
                                        hover:bg-indigo-700 focus:bg-indigo-700 active:bg-indigo-900 
                                        focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 
                                        transition-all ease-in-out duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {processing ? 'Generating...' : 'Generate Report'}
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}