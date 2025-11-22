// File: resources/js/Pages/Dashboard/components/DateFilter.jsx

import React from 'react';
import { Calendar } from 'lucide-react';

/**
 * DateFilter Component
 * 
 * A component for filtering dashboard data by month and year
 * 
 * @param {number} selectedYear - Currently selected year
 * @param {number} selectedMonth - Currently selected month (1-12)
 * @param {Function} onYearChange - Callback when year changes
 * @param {Function} onMonthChange - Callback when month changes
 * @param {number} minYear - Minimum year to show (default: 2020)
 */
const DateFilter = ({
    selectedYear,
    selectedMonth,
    onYearChange,
    onMonthChange,
    minYear = 2025,
    maxYear = 2030
}) => {
    // Generate year options
    const yearOptions = [];
    for (let year = maxYear; year >= minYear; year--) {
        yearOptions.push(year);
    }

    // Month names
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
        { value: 12, label: 'December' }
    ];

    const handleYearChange = (e) => {
        const year = parseInt(e.target.value);
        onYearChange(year);
    };

    const handleMonthChange = (e) => {
        const month = parseInt(e.target.value);
        onMonthChange(month);
    };

    // Quick navigation buttons
    const goToPreviousMonth = () => {
        if (selectedMonth === 1) {
            onMonthChange(12);
            onYearChange(selectedYear - 1);
        } else {
            onMonthChange(selectedMonth - 1);
        }
    };

    const goToNextMonth = () => {
        if (selectedMonth === 12) {
            onMonthChange(1);
            onYearChange(selectedYear + 1);
        } else {
            onMonthChange(selectedMonth + 1);
        }
    };

    const goToCurrentMonth = () => {
        const now = new Date();
        onYearChange(now.getFullYear());
        onMonthChange(now.getMonth() + 1);
    };

    const isCurrentMonth = () => {
        const now = new Date();
        return selectedYear === now.getFullYear() &&
            selectedMonth === now.getMonth() + 1;
    };

    return (
        <div className="bg-[var(--surface-00)] rounded-lg shadow p-4 mb-6 transition-colors duration-200">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                {/* Left side: Icon and label */}
                <div className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-[var(--text-secondary)]" />
                    <span className="text-sm font-medium text-[var(--text-secondary)]">
                        Filter by Period
                    </span>
                </div>

                {/* Center: Dropdowns and navigation */}
                <div className="flex items-center gap-2">
                    {/* Previous month button */}
                    <button
                        onClick={goToPreviousMonth}
                        className="p-2 rounded-md hover:bg-[var(--surface-10)] transition-colors"
                        title="Previous month"
                    >
                        <svg className="h-5 w-5 text-[var(--text-secondary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>

                    {/* Month selector */}
                    <select
                        value={selectedMonth}
                        onChange={handleMonthChange}
                        className="block w-40 rounded-md border-[var(--border-light)] shadow-sm focus:border-blue-500 focus:ring-blue-500   bg-white dark:bg-gray-700 text-[var(--text-primary)] sm:text-sm transition-colors"
                    >
                        {months.map((month) => (
                            <option key={month.value} value={month.value}>
                                {month.label}
                            </option>
                        ))}
                    </select>

                    {/* Year selector */}
                    <select
                        value={selectedYear}
                        onChange={handleYearChange}
                        className="block w-24 rounded-md border-[var(--border-light)] shadow-sm focus:border-blue-500 focus:ring-blue-500   bg-white dark:bg-gray-700 text-[var(--text-primary)] sm:text-sm transition-colors"
                    >
                        {yearOptions.map((year) => (
                            <option key={year} value={year}>
                                {year}
                            </option>
                        ))}
                    </select>

                    {/* Next month button */}
                    <button
                        onClick={goToNextMonth}
                        className="p-2 rounded-md hover:bg-[var(--surface-10)] transition-colors"
                        title="Next month"
                    >
                        <svg className="h-5 w-5 text-[var(--text-secondary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </button>
                </div>

                {/* Right side: Current month button */}
                {!isCurrentMonth() && (
                    <button
                        onClick={goToCurrentMonth}
                        className="px-4 py-2 text-sm font-medium text-[var(--color-info)] bg-[var(--primary-50)] rounded-md hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors"
                    >
                        Current Month
                    </button>
                )}
            </div>
        </div>
    );
};

export default DateFilter;