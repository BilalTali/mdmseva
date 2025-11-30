import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm, router } from '@inertiajs/react';
import { toast } from 'react-toastify';

export default function AmountConfigIndex({ configuration, currentMonth, currentYear, isCompleted, schoolType, hasPrimary, hasMiddle }) {
    const { delete: destroy } = useForm();

    const handleDelete = (id) => {
        if (confirm(`Are you sure you want to delete this configuration? You can create a new one after deletion.`)) {
            destroy(route('amount-config.destroy', id), {
                onSuccess: () => {
                    toast.success('Configuration deleted successfully.');
                },
                onError: () => {
                    toast.error('Failed to delete configuration.');
                },
            });
        }
    };

    const handleConfirm = () => {
        if (!configuration) {
            toast.error('Please create the configuration for this month before confirming.');
            return;
        }

        const confirmMessage = isCompleted
            ? `Configuration for ${monthName} ${currentYear} is already confirmed. Proceed to Daily Consumption?`
            : `Confirm amount configuration for ${monthName} ${currentYear} and proceed to Daily Consumption?`;

        if (!confirm(confirmMessage)) {
            return;
        }

        router.post(route('amount-config.confirm'), {
            month: currentMonth,
            year: currentYear
        }, {
            onError: () => toast.error('Failed to confirm configuration. Please review and try again.'),
        });
    };

    const handleMonthChange = (e) => {
        const newMonth = parseInt(e.target.value);
        router.get(route('amount-config.index'), {
            month: newMonth,
            year: currentYear
        }, { preserveState: true });
    };

    // Get school type display text
    const getSchoolTypeText = () => {
        switch (schoolType) {
            case 'primary': return 'Primary School (I-V)';
            case 'middle': return 'Middle School (I-VIII)';
            case 'secondary': return 'Secondary School (VI-VIII)';
            default: return '';
        }
    };

    const ingredientLabels = {
        pulses: 'Pulses',
        vegetables: 'Vegetables',
        oil: 'Oil/Fat',
        salt: 'Ingredients',
        fuel: 'Fuel'
    };

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

    const monthName = months.find(m => m.value === currentMonth)?.label || 'Unknown';

    return (
        <AuthenticatedLayout header={
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-xl font-semibold text-[var(--text-primary)]">Amount Configuration</h2>
                    <p className="text-sm text-[var(--text-secondary)] mt-1">{getSchoolTypeText()}</p>
                </div>
                <div className="flex items-center space-x-4">
                    <div className="flex items-center bg-white dark:bg-gray-800 rounded-md shadow-sm border border-gray-300 dark:border-gray-600 px-3 py-1">
                        <span className="text-sm text-gray-500 dark:text-gray-400 mr-2">Month:</span>
                        <select
                            value={currentMonth}
                            onChange={handleMonthChange}
                            className="border-none bg-transparent text-sm font-medium text-gray-700 dark:text-gray-200 focus:ring-0 cursor-pointer py-1 pl-0 pr-8"
                        >
                            {months.map((m) => (
                                <option key={m.value} value={m.value}>{m.label}</option>
                            ))}
                        </select>
                    </div>
                    <div className="text-lg font-bold text-gray-700 dark:text-gray-200">
                        {currentYear}
                    </div>
                </div>
            </div>
        }>
            <Head title={`Amount Configuration - ${monthName} ${currentYear}`} />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">

                    {/* Pending Confirmation Banner */}
                    {!isCompleted && configuration && (
                        <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-400 p-4 mb-6 shadow-sm rounded-r-md">
                            <div className="flex">
                                <div className="flex-shrink-0">
                                    <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <div className="ml-3">
                                    <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                                        Configuration Pending Confirmation
                                    </h3>
                                    <div className="mt-2 text-sm text-yellow-700 dark:text-yellow-300">
                                        <p>
                                            The amount configuration for {monthName} {currentYear} has not been confirmed yet.
                                            Daily consumption entries are disabled until you review and confirm these rates.
                                        </p>
                                    </div>
                                    <div className="mt-4">
                                        <Link
                                            href={route('amount-config.edit', configuration.id)}
                                            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-yellow-700 bg-yellow-100 hover:bg-yellow-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 dark:bg-yellow-800 dark:text-yellow-100 dark:hover:bg-yellow-700"
                                        >
                                            Review & Confirm Configuration
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* No Configuration - Show Create Button */}
                    {!configuration ? (
                        <div className="bg-[var(--surface-00)] shadow-sm sm:rounded-lg p-12 text-center">
                            <svg className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <h3 className="mt-2 text-sm font-medium text-[var(--text-primary)]">No configuration found for {monthName} {currentYear}</h3>
                            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                Get started by creating your amount configuration for this month.
                            </p>
                            <div className="mt-6">
                                <Link
                                    href={route('amount-config.create', { month: currentMonth, year: currentYear })}
                                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-800"
                                >
                                    <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                                    </svg>
                                    Create Configuration
                                </Link>
                            </div>
                        </div>
                    ) : (
                        /* Configuration Exists - Show Details */
                        <div className="space-y-6">
                            {/* Header Card with Edit Button */}
                            <div className="bg-[var(--surface-00)] shadow-sm sm:rounded-lg overflow-hidden">
                                <div className="px-6 py-5 border-b border-[var(--border-light)] flex items-center justify-between">
                                    <div>
                                        <h3 className="text-lg leading-6 font-medium text-[var(--text-primary)]">
                                            Configuration Details
                                        </h3>
                                        <div className="mt-1 flex items-center space-x-2">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${isCompleted
                                                    ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                                                    : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
                                                }`}>
                                                {isCompleted ? 'Confirmed' : 'Pending Confirmation'}
                                            </span>
                                            <span className="text-sm text-gray-500 dark:text-gray-400">
                                                • Last updated: {configuration.updated_at}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex gap-3">
                                        <Link
                                            href={route('amount-config.edit', configuration.id)}
                                            className={`inline-flex items-center px-4 py-2 border shadow-sm text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 ${!isCompleted
                                                    ? 'border-transparent text-white bg-blue-600 hover:bg-blue-700 focus:ring-blue-500'
                                                    : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:ring-blue-500'
                                                }`}
                                        >
                                            <svg className="-ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                                            </svg>
                                            {isCompleted ? 'Edit Configuration' : 'Update / Confirm'}
                                        </Link>
                                        <button
                                            onClick={() => handleDelete(configuration.id)}
                                            className="inline-flex items-center px-4 py-2 border border-red-300 dark:border-red-700 shadow-sm text-sm font-medium rounded-md text-red-700 dark:text-red-400 bg-white dark:bg-secondary-700 hover:bg-red-50 dark:hover:bg-red-900/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 dark:focus:ring-offset-gray-800"
                                        >
                                            <svg className="-ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                                            </svg>
                                            Delete
                                        </button>
                                    </div>
                                </div>

                                {/* Configuration Details */}
                                <div className="px-6 py-5 bg-gray-50 dark:bg-gray-700">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {/* Period Info */}
                                        <div className="bg-white dark:bg-secondary-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                                            <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Configuration Period</h4>
                                            <p className="text-2xl font-bold text-[var(--text-primary)]">{configuration.formatted_period}</p>
                                        </div>

                                        {/* Total Summary */}
                                        <div className="bg-white dark:bg-secondary-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                                            <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Daily Rates Summary</h4>
                                            <div className="space-y-1">
                                                {hasPrimary && (
                                                    <div className="flex justify-between items-center">
                                                        <span className="text-sm text-gray-600 dark:text-gray-300">Primary (I-V):</span>
                                                        <span className="text-lg font-semibold text-yellow-600 dark:text-yellow-400">
                                                            ₹{configuration.total_daily_primary?.toFixed(2)}
                                                        </span>
                                                    </div>
                                                )}
                                                {hasMiddle && (
                                                    <div className="flex justify-between items-center">
                                                        <span className="text-sm text-gray-600 dark:text-gray-300">Middle (VI-VIII):</span>
                                                        <span className="text-lg font-semibold text-blue-600 dark:text-blue-400">
                                                            ₹{configuration.total_daily_middle?.toFixed(2)}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Detailed Rates Tables */}
                            <div className={`grid grid-cols-1 ${hasPrimary && hasMiddle ? 'lg:grid-cols-2' : ''} gap-6`}>
                                {/* Primary Rates Table */}
                                {hasPrimary && (
                                    <div className="bg-[var(--surface-00)] shadow-sm sm:rounded-lg overflow-hidden">
                                        <div className="px-6 py-4 bg-yellow-50 dark:bg-yellow-900/20 border-b border-yellow-200 dark:border-yellow-800">
                                            <h3 className="text-lg font-semibold text-[var(--text-primary)]">
                                                Primary (I-V) Daily Rates per Student
                                            </h3>
                                        </div>
                                        <div className="overflow-hidden">
                                            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                                <thead className="bg-gray-50 dark:bg-gray-700">
                                                    <tr>
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                            Item
                                                        </th>
                                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                            Rate (₹)
                                                        </th>
                                                    </tr>
                                                </thead>
                                                <tbody className="bg-[var(--surface-00)] divide-y divide-gray-200 dark:divide-gray-700">
                                                    {['pulses', 'vegetables', 'oil', 'salt', 'fuel'].map((item) => (
                                                        <tr key={item} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[var(--text-primary)]">
                                                                {ingredientLabels[item]}
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-[var(--text-primary)]">
                                                                ₹{configuration[`daily_${item}_primary`]?.toFixed(2)}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                    <tr className="bg-yellow-50 dark:bg-yellow-900/10 font-bold">
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-[var(--text-primary)]">
                                                            Total
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-yellow-700 dark:text-yellow-400">
                                                            ₹{configuration.total_daily_primary?.toFixed(2)}
                                                        </td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                )}

                                {/* Middle Rates Table */}
                                {hasMiddle && (
                                    <div className="bg-[var(--surface-00)] shadow-sm sm:rounded-lg overflow-hidden">
                                        <div className="px-6 py-4 bg-blue-50 dark:bg-blue-900/20 border-b border-blue-200 dark:border-blue-800">
                                            <h3 className="text-lg font-semibold text-[var(--text-primary)]">
                                                Middle (VI-VIII) Daily Rates per Student
                                            </h3>
                                        </div>
                                        <div className="overflow-hidden">
                                            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                                <thead className="bg-gray-50 dark:bg-gray-700">
                                                    <tr>
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                            Item
                                                        </th>
                                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                            Rate (₹)
                                                        </th>
                                                    </tr>
                                                </thead>
                                                <tbody className="bg-[var(--surface-00)] divide-y divide-gray-200 dark:divide-gray-700">
                                                    {['pulses', 'vegetables', 'oil', 'salt', 'fuel'].map((item) => (
                                                        <tr key={item} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[var(--text-primary)]">
                                                                {ingredientLabels[item]}
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-[var(--text-primary)]">
                                                                ₹{configuration[`daily_${item}_middle`]?.toFixed(2)}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                    <tr className="bg-blue-50 dark:bg-blue-900/10 font-bold">
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-[var(--text-primary)]">
                                                            Total
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-blue-700 dark:text-blue-400">
                                                            ₹{configuration.total_daily_middle?.toFixed(2)}
                                                        </td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Unified Salt & Condiments Percentage Breakdown */}
                            <div className="bg-[var(--surface-00)] shadow-sm sm:rounded-lg overflow-hidden">
                                <div className="px-6 py-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-b border-green-200 dark:border-green-800">
                                    <h3 className="text-lg font-semibold text-[var(--text-primary)] flex items-center">
                                        <svg className="w-5 h-5 mr-2 text-green-600 dark:text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        Salt &amp; Condiments Percentage Breakdown
                                    </h3>
                                    <p className="text-sm text-[var(--text-secondary)] mt-1">
                                        Unified distribution applies to both Primary and Middle students
                                    </p>
                                </div>
                                <div className="p-6">
                                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                                        {/* Common Salt */}
                                        <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600 hover:shadow-md transition-shadow">
                                            <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                                                Common Salt
                                            </div>
                                            <div className="text-2xl font-bold text-[var(--text-primary)]">
                                                {configuration.salt_percentage_common?.toFixed(1)}%
                                            </div>
                                        </div>

                                        {/* Chilli Powder */}
                                        <div className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 rounded-lg p-4 border border-red-200 dark:border-red-800 hover:shadow-md transition-shadow">
                                            <div className="text-xs font-medium text-red-700 dark:text-red-400 uppercase tracking-wider mb-2">
                                                Chilli Powder
                                            </div>
                                            <div className="text-2xl font-bold text-red-900 dark:text-red-200">
                                                {configuration.salt_percentage_chilli?.toFixed(1)}%
                                            </div>
                                        </div>

                                        {/* Turmeric */}
                                        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20 rounded-lg p-4 border border-yellow-200 dark:border-yellow-800 hover:shadow-md transition-shadow">
                                            <div className="text-xs font-medium text-yellow-700 dark:text-yellow-400 uppercase tracking-wider mb-2">
                                                Turmeric
                                            </div>
                                            <div className="text-2xl font-bold text-yellow-900 dark:text-yellow-200">
                                                {configuration.salt_percentage_turmeric?.toFixed(1)}%
                                            </div>
                                        </div>

                                        {/* Coriander */}
                                        <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-lg p-4 border border-green-200 dark:border-green-800 hover:shadow-md transition-shadow">
                                            <div className="text-xs font-medium text-green-700 dark:text-green-400 uppercase tracking-wider mb-2">
                                                Coriander
                                            </div>
                                            <div className="text-2xl font-bold text-green-900 dark:text-green-200">
                                                {configuration.salt_percentage_coriander?.toFixed(1)}%
                                            </div>
                                        </div>

                                        {/* Other Condiments */}
                                        <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-lg p-4 border border-purple-200 dark:border-purple-800 hover:shadow-md transition-shadow">
                                            <div className="text-xs font-medium text-purple-700 dark:text-purple-400 uppercase tracking-wider mb-2">
                                                Other Condiments
                                            </div>
                                            <div className="text-2xl font-bold text-purple-900 dark:text-purple-200">
                                                {configuration.salt_percentage_other?.toFixed(1)}%
                                            </div>
                                        </div>
                                    </div>

                                    {/* Total Verification */}
                                    <div className="mt-6 bg-green-100 dark:bg-green-900/30 border-2 border-green-400 dark:border-green-600 rounded-lg p-4">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center">
                                                <svg className="w-6 h-6 text-green-600 dark:text-green-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                                <span className="text-sm font-semibold text-green-800 dark:text-green-200">
                                                    Total Percentage
                                                </span>
                                            </div>
                                            <div className="text-2xl font-bold text-green-900 dark:text-green-100">
                                                {(
                                                    (configuration.salt_percentage_common || 0) +
                                                    (configuration.salt_percentage_chilli || 0) +
                                                    (configuration.salt_percentage_turmeric || 0) +
                                                    (configuration.salt_percentage_coriander || 0) +
                                                    (configuration.salt_percentage_other || 0)
                                                ).toFixed(1)}%
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Update Button at Bottom (as requested) */}
                            {!isCompleted && (
                                <div className="flex justify-center pt-4 pb-8">
                                    <Link
                                        href={route('amount-config.edit', configuration.id)}
                                        className="inline-flex items-center px-8 py-4 border border-transparent shadow-lg text-lg font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transform hover:scale-105 transition-all duration-200"
                                    >
                                        <svg className="-ml-1 mr-3 h-6 w-6" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                        Confirm Configuration for {monthName}
                                    </Link>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Confirm CTA */}
            <div className="bg-white shadow-sm sm:rounded-lg p-6 mt-6">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                            {isCompleted ? 'Proceed to Daily Consumption' : 'Confirm & Continue to Daily Consumption'}
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">
                            Complete this step to start recording daily consumption for {monthName} {currentYear}.
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={handleConfirm}
                        disabled={!configuration}
                        className={`inline-flex items-center justify-center px-5 py-2.5 rounded-md font-semibold text-sm uppercase tracking-widest transition-colors ${isCompleted
                                ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                                : 'bg-indigo-600 text-white hover:bg-indigo-700'} ${!configuration ? 'opacity-60 cursor-not-allowed' : ''}`}
                    >
                        {isCompleted ? 'Go to Daily Consumption' : 'Confirm Configuration'}
                    </button>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}