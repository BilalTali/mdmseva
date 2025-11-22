import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import { Calendar, ArrowRight, CheckCircle, XCircle } from 'lucide-react';

export default function MonthSelector({ auth, availableMonths = [] }) {
    const currentDate = new Date();
    const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth() + 1);
    const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());

    const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    const currentYear = currentDate.getFullYear();
    const years = Array.from({ length: 10 }, (_, i) => currentYear - 5 + i);

    const handleProceed = () => {
        router.get(route('daily-consumptions.select-month'), {
            month: selectedMonth,
            year: selectedYear,
        });
    };

    const getMonthStatus = (month, year) => {
        const monthData = availableMonths.find(
            m => m.month === month && m.year === year
        );
        return monthData || null;
    };

    const selectedMonthStatus = getMonthStatus(selectedMonth, selectedYear);

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <h2 className="font-semibold text-xl text-[var(--text-primary)] leading-tight">
                    Select Month for Daily Consumption
                </h2>
            }
        >
            <Head title="Select Month - Daily Consumption" />

            <div className="py-12">
                <div className="max-w-4xl mx-auto sm:px-6 lg:px-8">
                    {/* Instructions Card */}
                    <div className="bg-blue-50 border-l-4 border-blue-500 rounded-lg p-6 mb-6">
                        <div className="flex items-start">
                            <Calendar className="w-6 h-6 text-blue-600 mr-3 flex-shrink-0 mt-0.5" />
                            <div>
                                <h3 className="text-lg font-bold text-blue-900 mb-2">
                                    How It Works
                                </h3>
                                <ol className="text-blue-800 space-y-2 text-sm">
                                    <li className="flex items-start">
                                        <span className="font-bold mr-2">1.</span>
                                        <span>Select the month and year you want to work with</span>
                                    </li>
                                    <li className="flex items-start">
                                        <span className="font-bold mr-2">2.</span>
                                        <span>System will check if rice and amount configurations are set</span>
                                    </li>
                                    <li className="flex items-start">
                                        <span className="font-bold mr-2">3.</span>
                                        <span>You'll be guided to complete any missing configurations</span>
                                    </li>
                                    <li className="flex items-start">
                                        <span className="font-bold mr-2">4.</span>
                                        <span>Once configured, enter daily consumption for that month</span>
                                    </li>
                                </ol>
                            </div>
                        </div>
                    </div>

                    {/* Month/Year Selection Card */}
                    <div className="bg-[var(--surface-00)] overflow-hidden shadow-lg sm:rounded-lg">
                        <div className="p-8">
                            <h3 className="text-2xl font-bold text-[var(--text-primary)] mb-6">
                                Select Month & Year
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                                {/* Month Selector */}
                                <div>
                                    <label className="block text-sm font-semibold text-[var(--text-secondary)] mb-2">
                                        Month
                                    </label>
                                    <select
                                        value={selectedMonth}
                                        onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                                        className="w-full px-4 py-3 text-lg border-2 border-[var(--border-light)] rounded-lg shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                                    >
                                        {months.map((month, index) => (
                                            <option key={index + 1} value={index + 1}>
                                                {month}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Year Selector */}
                                <div>
                                    <label className="block text-sm font-semibold text-[var(--text-secondary)] mb-2">
                                        Year
                                    </label>
                                    <select
                                        value={selectedYear}
                                        onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                                        className="w-full px-4 py-3 text-lg border-2 border-[var(--border-light)] rounded-lg shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                                    >
                                        {years.map((year) => (
                                            <option key={year} value={year}>
                                                {year}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Selected Month Display */}
                            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 mb-6">
                                <p className="text-sm text-gray-600 mb-1">You've selected:</p>
                                <p className="text-3xl font-bold text-blue-900">
                                    {months[selectedMonth - 1]} {selectedYear}
                                </p>
                            </div>

                            {/* Status Display (if available) */}
                            {selectedMonthStatus && (
                                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                                    <h4 className="font-semibold text-gray-700 mb-3">Configuration Status:</h4>
                                    <div className="space-y-2">
                                        <div className="flex items-center">
                                            {selectedMonthStatus.rice_config_completed ? (
                                                <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                                            ) : (
                                                <XCircle className="w-5 h-5 text-red-600 mr-2" />
                                            )}
                                            <span className="text-sm">
                                                Rice Configuration: {selectedMonthStatus.rice_config_completed ? 'Completed' : 'Not Completed'}
                                            </span>
                                        </div>
                                        <div className="flex items-center">
                                            {selectedMonthStatus.amount_config_completed ? (
                                                <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                                            ) : (
                                                <XCircle className="w-5 h-5 text-red-600 mr-2" />
                                            )}
                                            <span className="text-sm">
                                                Amount Configuration: {selectedMonthStatus.amount_config_completed ? 'Completed' : 'Not Completed'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Proceed Button */}
                            <button
                                onClick={handleProceed}
                                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-4 px-6 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center group"
                            >
                                <span className="text-lg">Proceed to Daily Consumption</span>
                                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                            </button>
                        </div>
                    </div>

                    {/* Recent Months */}
                    {availableMonths.length > 0 && (
                        <div className="mt-6 bg-[var(--surface-00)] rounded-lg shadow p-6">
                            <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">
                                Recent Months
                            </h3>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                                {availableMonths.slice(0, 8).map((monthData) => (
                                    <button
                                        key={`${monthData.year}-${monthData.month}`}
                                        onClick={() => {
                                            setSelectedMonth(monthData.month);
                                            setSelectedYear(monthData.year);
                                        }}
                                        className={`p-3 rounded-lg border-2 transition-all text-left ${selectedMonth === monthData.month && selectedYear === monthData.year
                                                ? 'border-blue-500 bg-blue-50'
                                                : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                                            }`}
                                    >
                                        <p className="text-sm font-semibold text-gray-900">
                                            {months[monthData.month - 1]}
                                        </p>
                                        <p className="text-xs text-gray-600">{monthData.year}</p>
                                        {monthData.rice_config_completed && monthData.amount_config_completed && (
                                            <CheckCircle className="w-4 h-4 text-green-600 mt-1" />
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
