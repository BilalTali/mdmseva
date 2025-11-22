import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { Plus, Calendar, TrendingDown } from 'lucide-react';

export default function Index({
    auth,
    consumptions = [],
    schoolType,
    sections,
    enrollment,
    currentMonth,
    currentYear,
    monthName = '',
    openingBalance = 0,
    closingBalance = 0,
    totalPrimaryStudents = 0,
    totalMiddleStudents = 0,
    totalStudents = 0,
    totalRiceConsumed = 0,
    totalAmountConsumed = 0,
    totalDays = 0,
    primaryRiceRate = 0.1,
    middleRiceRate = 0.15,
    error
}) {
    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex justify-between items-center">
                    <h2 className="font-semibold text-xl text-[var(--text-primary)] leading-tight">
                        Daily Consumption - {monthName} {currentYear}
                    </h2>
                    <div className="flex gap-2">
                        <Link
                            href={route('daily-consumptions.index')}
                            className="inline-flex items-center px-4 py-2 bg-gray-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-gray-700 transition"
                        >
                            <Calendar className="w-4 h-4 mr-2" />
                            Change Month
                        </Link>
                        <Link
                            href={route('daily-consumptions.create', { month: currentMonth, year: currentYear })}
                            className="inline-flex items-center px-4 py-2 bg-blue-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-blue-700 transition"
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            Add Entry
                        </Link>
                    </div>
                </div>
            }
        >
            <Head title={`Daily Consumption - ${monthName} ${currentYear}`} />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">

                    {error && (
                        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
                            <p className="text-red-700">{error}</p>
                        </div>
                    )}

                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="bg-white rounded-lg shadow p-4">
                            <p className="text-sm text-gray-600">Opening Balance</p>
                            <p className="text-2xl font-bold text-blue-600">{openingBalance} kg</p>
                        </div>
                        <div className="bg-white rounded-lg shadow p-4">
                            <p className="text-sm text-gray-600">Total Rice Consumed</p>
                            <p className="text-2xl font-bold text-orange-600">{totalRiceConsumed} kg</p>
                        </div>
                        <div className="bg-white rounded-lg shadow p-4">
                            <p className="text-sm text-gray-600">Closing Balance</p>
                            <p className={`text-2xl font-bold ${closingBalance < 0 ? 'text-red-600' : 'text-green-600'}`}>
                                {closingBalance} kg
                            </p>
                            {closingBalance < 0 && (
                                <div className="flex items-center text-red-600 text-xs mt-1">
                                    <TrendingDown className="w-3 h-3 mr-1" />
                                    Deficit
                                </div>
                            )}
                        </div>
                        <div className="bg-white rounded-lg shadow p-4">
                            <p className="text-sm text-gray-600">Total Amount Spent</p>
                            <p className="text-2xl font-bold text-purple-600">₹{totalAmountConsumed.toFixed(2)}</p>
                        </div>
                    </div>

                    {/* Rice Consumption Details Table */}
                    <div className="bg-white rounded-lg shadow overflow-hidden">
                        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
                            <h3 className="text-lg font-bold text-white flex items-center">
                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                </svg>
                                Rice Consumption Details - {monthName} {currentYear}
                            </h3>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase">S.No.</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Date</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Day</th>
                                        <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase">Primary</th>
                                        <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase">Middle</th>
                                        <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase">Total</th>
                                        <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase">Primary Rice (kg)</th>
                                        <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase">Middle Rice (kg)</th>
                                        <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase">Total Rice (kg)</th>
                                        <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase">Balance (kg)</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {consumptions.length === 0 ? (
                                        <tr>
                                            <td colSpan="10" className="px-4 py-8 text-center text-gray-500">
                                                No consumption records for {monthName} {currentYear}. Click "Add Entry" to start.
                                            </td>
                                        </tr>
                                    ) : (
                                        consumptions.map((item, index) => (
                                            <tr key={index} className="hover:bg-gray-50 transition">
                                                <td className="px-4 py-3 text-sm text-center text-gray-600 font-medium">{index + 1}</td>
                                                <td className="px-4 py-3 text-sm text-gray-900">{item.day || ''}</td>
                                                <td className="px-4 py-3 text-sm text-gray-600">{item.dayName || ''}</td>
                                                <td className="px-4 py-3 text-sm text-right text-gray-900">{item.served_primary || 0}</td>
                                                <td className="px-4 py-3 text-sm text-right text-gray-900">{item.served_middle || 0}</td>
                                                <td className="px-4 py-3 text-sm text-right font-semibold text-gray-900">{item.total_served || 0}</td>
                                                <td className="px-4 py-3 text-sm text-right text-blue-600 font-medium">{Number(item.rice_primary || 0).toFixed(2)}</td>
                                                <td className="px-4 py-3 text-sm text-right text-indigo-600 font-medium">{Number(item.rice_middle || 0).toFixed(2)}</td>
                                                <td className="px-4 py-3 text-sm text-right text-orange-600 font-semibold">{Number(item.rice_consumed || 0).toFixed(2)}</td>
                                                <td className={`px-4 py-3 text-sm text-right font-semibold ${Number(item.rice_balance || 0) < 0 ? 'text-red-600' : 'text-green-600'}`}>
                                                    {Number(item.rice_balance || 0).toFixed(2)}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                                {consumptions.length > 0 && (
                                    <tfoot className="bg-blue-50 border-t-2 border-blue-200">
                                        <tr>
                                            <td className="px-4 py-3 text-sm font-bold text-gray-900" colSpan="3">TOTAL ({totalDays} days)</td>
                                            <td className="px-4 py-3 text-sm font-bold text-right text-gray-900">{totalPrimaryStudents}</td>
                                            <td className="px-4 py-3 text-sm font-bold text-right text-gray-900">{totalMiddleStudents}</td>
                                            <td className="px-4 py-3 text-sm font-bold text-right text-gray-900">{totalStudents}</td>
                                            <td className="px-4 py-3 text-sm font-bold text-right text-blue-600">-</td>
                                            <td className="px-4 py-3 text-sm font-bold text-right text-indigo-600">-</td>
                                            <td className="px-4 py-3 text-sm font-bold text-right text-orange-600">{totalRiceConsumed.toFixed(2)}</td>
                                            <td className={`px-4 py-3 text-sm font-bold text-right ${closingBalance < 0 ? 'text-red-600' : 'text-green-600'}`}>
                                                {closingBalance.toFixed(2)}
                                            </td>
                                        </tr>
                                    </tfoot>
                                )}
                            </table>
                        </div>
                    </div>

                    {/* Amount Consumption Details Table */}
                    <div className="bg-white rounded-lg shadow overflow-hidden">
                        <div className="bg-gradient-to-r from-purple-600 to-purple-700 px-6 py-4">
                            <h3 className="text-lg font-bold text-white flex items-center">
                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                Amount Consumption Details - {monthName} {currentYear}
                            </h3>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase">S.No.</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Date</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Day</th>
                                        <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase">Primary Students</th>
                                        <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase">Middle Students</th>
                                        <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase">Total Students</th>
                                        <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase">Amount (₹)</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {consumptions.length === 0 ? (
                                        <tr>
                                            <td colSpan="7" className="px-4 py-8 text-center text-gray-500">
                                                No consumption records for {monthName} {currentYear}. Click "Add Entry" to start.
                                            </td>
                                        </tr>
                                    ) : (
                                        consumptions.map((item, index) => (
                                            <tr key={index} className="hover:bg-gray-50 transition">
                                                <td className="px-4 py-3 text-sm text-center text-gray-600 font-medium">{index + 1}</td>
                                                <td className="px-4 py-3 text-sm text-gray-900">{item.day || ''}</td>
                                                <td className="px-4 py-3 text-sm text-gray-600">{item.dayName || ''}</td>
                                                <td className="px-4 py-3 text-sm text-right text-gray-900">{item.served_primary || 0}</td>
                                                <td className="px-4 py-3 text-sm text-right text-gray-900">{item.served_middle || 0}</td>
                                                <td className="px-4 py-3 text-sm text-right font-semibold text-gray-900">{item.total_served || 0}</td>
                                                <td className="px-4 py-3 text-sm text-right text-purple-600 font-semibold">₹{Number(item.amount_consumed || 0).toFixed(2)}</td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                                {consumptions.length > 0 && (
                                    <tfoot className="bg-purple-50 border-t-2 border-purple-200">
                                        <tr>
                                            <td className="px-4 py-3 text-sm font-bold text-gray-900" colSpan="3">TOTAL ({totalDays} days)</td>
                                            <td className="px-4 py-3 text-sm font-bold text-right text-gray-900">{totalPrimaryStudents}</td>
                                            <td className="px-4 py-3 text-sm font-bold text-right text-gray-900">{totalMiddleStudents}</td>
                                            <td className="px-4 py-3 text-sm font-bold text-right text-gray-900">{totalStudents}</td>
                                            <td className="px-4 py-3 text-sm font-bold text-right text-purple-600">₹{totalAmountConsumed.toFixed(2)}</td>
                                        </tr>
                                    </tfoot>
                                )}
                            </table>
                        </div>
                    </div>

                    {/* Info Box */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="flex items-start">
                            <svg className="w-5 h-5 text-blue-600 mr-2 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <div className="text-sm text-blue-800">
                                <p className="font-semibold mb-1">Rice Consumption Rates:</p>
                                <p>• Primary: {(primaryRiceRate * 1000).toFixed(0)}g per student per day</p>
                                <p>• Middle: {(middleRiceRate * 1000).toFixed(0)}g per student per day</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}