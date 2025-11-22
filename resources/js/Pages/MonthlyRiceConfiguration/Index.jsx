import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import { Calendar, Plus, Edit, Check, Lock, Unlock, TrendingUp, TrendingDown, Package, Eye } from 'lucide-react';

export default function Index({ auth, config, currentMonth, currentYear, activities, completedMonths, amountConfig, canEnterConsumption, schoolTypes }) {
    const [selectedMonth, setSelectedMonth] = useState(currentMonth);
    const [selectedYear, setSelectedYear] = useState(currentYear);

    const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    const handleMonthChange = (month, year) => {
        router.visit(route('monthly-rice-config.index', { month, year }));
    };

    const handleCompleteMonth = () => {
        if (!confirm('Are you sure you want to complete this month? This cannot be undone.')) {
            return;
        }

        router.post(route('monthly-rice-config.complete'), {
            month: config.month,
            year: config.year
        });
    };

    const handleToggleLock = () => {
        if (!config) return;

        const shouldLock = !config.is_locked;
        let reason = null;

        if (shouldLock) {
            reason = prompt('Add a reason for locking this month (optional):') ?? null;
        }

        router.post(route('monthly-rice-config.toggle-lock'), {
            month: config.month,
            year: config.year,
            lock: shouldLock,
            reason,
        }, {
            preserveScroll: true,
        });
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex justify-between items-center">
                    <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                        Monthly Rice Configuration
                    </h2>
                    {!config && (
                        <Link
                            href={route('monthly-rice-config.create', { month: currentMonth, year: currentYear })}
                            className="inline-flex items-center px-4 py-2 bg-indigo-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-indigo-700"
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            Create Configuration
                        </Link>
                    )}
                </div>
            }
        >
            <Head title="Monthly Rice Configuration" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    {/* Month/Year Selector */}
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg mb-6 p-6">
                        <div className="flex items-center gap-4">
                            <Calendar className="w-6 h-6 text-indigo-600" />
                            <div className="flex-1">
                                <label className="text-sm font-medium text-gray-700 mr-3">Select Month:</label>
                                <select
                                    value={selectedMonth}
                                    onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                                    className="border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                >
                                    {monthNames.map((name, index) => (
                                        <option key={index + 1} value={index + 1}>
                                            {name}
                                        </option>
                                    ))}
                                </select>
                                <select
                                    value={selectedYear}
                                    onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                                    className="ml-2 border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                >
                                    {Array.from({ length: 11 }, (_, i) => 2020 + i).map(year => (
                                        <option key={year} value={year}>{year}</option>
                                    ))}
                                </select>
                                <button
                                    onClick={() => handleMonthChange(selectedMonth, selectedYear)}
                                    className="ml-3 inline-flex items-center px-4 py-2 bg-gray-800 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-gray-700"
                                >
                                    View
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Configuration Display */}
                    {config ? (
                        <>
                            {/* Status Banner */}
                            <div className={`p-4 mb-6 rounded-lg ${config.is_completed ? 'bg-green-50 border border-green-200' : 'bg-blue-50 border border-blue-200'}`}>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        {config.is_completed ? (
                                            <>
                                                <Check className="w-5 h-5 text-green-600" />
                                                <span className="text-green-800 font-medium">Month Completed</span>
                                            </>
                                        ) : (
                                            <>
                                                <Package className="w-5 h-5 text-blue-600" />
                                                <span className="text-blue-800 font-medium">Month Active</span>
                                            </>
                                        )}
                                    </div>
                                    {config.is_locked && (
                                        <div className="flex items-center gap-2 text-yellow-700">
                                            <Lock className="w-4 h-4" />
                                            <span className="text-sm">Locked</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Detailed Configuration Table */}
                            <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg mb-6">
                                <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                                    <h3 className="text-lg font-medium text-gray-900">Configuration Details</h3>
                                    <span className="px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
                                        School Type: {schoolTypes[config.school_type]}
                                    </span>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Metric</th>
                                                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Primary</th>
                                                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Upper Primary</th>
                                                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            <tr>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Daily Consumption Rate</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">{config.daily_consumption_primary} g</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">{config.daily_consumption_upper_primary} g</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">-</td>
                                            </tr>
                                            <tr className="bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Opening Balance</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">{parseFloat(config.opening_balance_primary).toFixed(2)} kg</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">{parseFloat(config.opening_balance_upper_primary).toFixed(2)} kg</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900 text-right">
                                                    {(parseFloat(config.opening_balance_primary) + parseFloat(config.opening_balance_upper_primary)).toFixed(2)} kg
                                                </td>
                                            </tr>
                                            <tr>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Rice Lifted</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 text-right">+{parseFloat(config.rice_lifted_primary).toFixed(2)} kg</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 text-right">+{parseFloat(config.rice_lifted_upper_primary).toFixed(2)} kg</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-green-600 text-right">
                                                    +{(parseFloat(config.rice_lifted_primary) + parseFloat(config.rice_lifted_upper_primary)).toFixed(2)} kg
                                                </td>
                                            </tr>
                                            <tr>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Rice Arranged</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600 text-right">+{parseFloat(config.rice_arranged_primary).toFixed(2)} kg</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600 text-right">+{parseFloat(config.rice_arranged_upper_primary).toFixed(2)} kg</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-blue-600 text-right">
                                                    +{(parseFloat(config.rice_arranged_primary) + parseFloat(config.rice_arranged_upper_primary)).toFixed(2)} kg
                                                </td>
                                            </tr>
                                            <tr className="bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Total Available</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">{parseFloat(config.total_available_primary).toFixed(2)} kg</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">{parseFloat(config.total_available_upper_primary).toFixed(2)} kg</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900 text-right">
                                                    {(parseFloat(config.total_available_primary) + parseFloat(config.total_available_upper_primary)).toFixed(2)} kg
                                                </td>
                                            </tr>
                                            <tr>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Consumed</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600 text-right">-{parseFloat(config.consumed_primary).toFixed(2)} kg</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600 text-right">-{parseFloat(config.consumed_upper_primary).toFixed(2)} kg</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-red-600 text-right">
                                                    -{(parseFloat(config.consumed_primary) + parseFloat(config.consumed_upper_primary)).toFixed(2)} kg
                                                </td>
                                            </tr>
                                            <tr className="bg-gray-100 border-t-2 border-gray-200">
                                                <td className="px-6 py-4 whitespace-nowrap text-base font-bold text-gray-900">Closing Balance</td>
                                                <td className={`px-6 py-4 whitespace-nowrap text-base font-bold text-right ${parseFloat(config.closing_balance_primary) < 0 ? 'text-red-600' : 'text-gray-900'}`}>
                                                    {parseFloat(config.closing_balance_primary).toFixed(2)} kg
                                                </td>
                                                <td className={`px-6 py-4 whitespace-nowrap text-base font-bold text-right ${parseFloat(config.closing_balance_upper_primary) < 0 ? 'text-red-600' : 'text-gray-900'}`}>
                                                    {parseFloat(config.closing_balance_upper_primary).toFixed(2)} kg
                                                </td>
                                                <td className={`px-6 py-4 whitespace-nowrap text-base font-bold text-right ${parseFloat(config.closing_balance_primary) + parseFloat(config.closing_balance_upper_primary) < 0 ? 'text-red-600' : 'text-gray-900'}`}>
                                                    {(parseFloat(config.closing_balance_primary) + parseFloat(config.closing_balance_upper_primary)).toFixed(2)} kg
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg mb-6 p-6">
                                <h3 className="text-lg font-medium text-gray-900 mb-4">Actions</h3>
                                <div className="flex flex-wrap gap-3">
                                    {!config.is_locked && (
                                        <Link
                                            href={route('monthly-rice-config.edit', { month: config.month, year: config.year })}
                                            className="inline-flex items-center px-4 py-2 bg-gray-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-gray-700"
                                        >
                                            <Edit className="w-4 h-4 mr-2" />
                                            Edit Configuration
                                        </Link>
                                    )}
                                    {!config.is_completed && !config.is_locked && (
                                        <button
                                            onClick={handleCompleteMonth}
                                            className="inline-flex items-center px-4 py-2 bg-green-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-green-700"
                                        >
                                            <Check className="w-4 h-4 mr-2" />
                                            Complete Month
                                        </button>
                                    )}
                                    <button
                                        onClick={handleToggleLock}
                                        className={`inline-flex items-center px-4 py-2 border border-transparent rounded-md font-semibold text-xs uppercase tracking-widest text-white ${config.is_locked ? 'bg-blue-600 hover:bg-blue-700' : 'bg-yellow-600 hover:bg-yellow-700'}`}
                                    >
                                        {config.is_locked ? (
                                            <>
                                                <Unlock className="w-4 h-4 mr-2" />
                                                Unlock Editing
                                            </>
                                        ) : (
                                            <>
                                                <Lock className="w-4 h-4 mr-2" />
                                                Lock Editing
                                            </>
                                        )}
                                    </button>
                                </div>
                                <p className="text-sm text-gray-500 mt-3">
                                    Lock the month when you want to freeze data. Unlock to make corrections even after completion.
                                </p>
                                {config.is_locked && config.locked_reason && (
                                    <p className="text-sm text-yellow-700 mt-2">
                                        Lock reason: {config.locked_reason}
                                    </p>
                                )}
                            </div>

                            {config.is_completed && (
                                <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg mb-6 p-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h3 className="text-lg font-medium text-gray-900">Month Completed</h3>
                                            <p className="text-sm text-gray-600 mt-1">
                                                Completed on {new Date(config.completed_at).toLocaleDateString()}
                                            </p>
                                        </div>
                                        <Link
                                            href={route('monthly-rice-config.create-next')}
                                            className="inline-flex items-center px-4 py-2 bg-indigo-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-indigo-700"
                                        >
                                            <Plus className="w-4 h-4 mr-2" />
                                            Create Next Month
                                        </Link>
                                    </div>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-12 text-center">
                            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No Configuration Found</h3>
                            <p className="text-gray-600 mb-6">
                                No rice configuration exists for {monthNames[currentMonth - 1]} {currentYear}
                            </p>
                            <Link
                                href={route('monthly-rice-config.create', { month: currentMonth, year: currentYear })}
                                className="inline-flex items-center px-4 py-2 bg-indigo-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-indigo-700"
                            >
                                <Plus className="w-4 h-4 mr-2" />
                                Create Configuration
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
