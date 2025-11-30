import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

export default function AdminSchoolShow(props) {
    const {
        school = {},
        consumptionsWithCalculations = [],
        schoolType,
        sections = [],
        openingBalance = 0,
        riceReports = null,
        amountReports = null,
        bills = null,
    } = props;

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <div className="flex items-center">
                        <Link
                            href={route('admin.schools.index')}
                            className="mr-4 text-gray-600 hover:text-gray-900"
                        >
                            Back
                        </Link>
                        <h2 className="text-xl font-semibold text-gray-800">
                            School Details{school?.school_name ? ` - ${school.school_name}` : ''}
                        </h2>
                    </div>
                    <div className="text-sm text-gray-500">
                        {school?.district?.name ? `District: ${school.district.name}` : ''}
                    </div>
                </div>
            }
        >
            <Head title={`Admin - School Details ${school?.school_name || school?.name || ''}`} />

            <div className="py-8">
                <div className="max-w-6xl mx-auto sm:px-6 lg:px-8 space-y-8">
                    {/* Rice Reports (monthly, read-only) */}
                    <div className="bg-white shadow-sm rounded-lg overflow-hidden">
                        <div className="px-6 py-4 border-b">
                            <h3 className="text-lg font-semibold text-gray-900">Rice Reports</h3>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">S.No</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Year</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Month</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Primary Rice (kg)</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Middle Rice (kg)</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Rice (kg)</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Working Days</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {(riceReports?.data || []).map((r, index) => (
                                        <tr key={r.id}>
                                            <td className="px-6 py-4 text-sm text-gray-900">
                                                {(riceReports.from || 0) + index}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-700">{r.year}</td>
                                            <td className="px-6 py-4 text-sm text-gray-700">{r.month}</td>
                                            <td className="px-6 py-4 text-sm text-gray-700">
                                                {Number(r.total_primary_rice || 0).toFixed(2)}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-700">
                                                {Number(r.total_middle_rice || 0).toFixed(2)}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-700">
                                                {Number(r.total_rice_consumed || 0).toFixed(2)}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-700">{r.total_serving_days ?? '-'}</td>
                                            <td className="px-6 py-4 text-sm text-right">
                                                {route().has && route().has('admin.rice-reports.show') ? (
                                                    <Link
                                                        href={route('admin.rice-reports.show', r.id)}
                                                        className="inline-flex items-center px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md text-xs font-semibold"
                                                    >
                                                        View
                                                    </Link>
                                                ) : (
                                                    <span className="text-xs text-gray-400">View</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                    {(riceReports?.data || []).length === 0 && (
                                        <tr>
                                            <td className="px-6 py-8 text-center text-sm text-gray-500" colSpan="8">
                                                No rice reports found for this school.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                        {riceReports && (
                            <div className="px-6 py-4 border-t text-sm text-gray-700">
                                Showing <span className="font-medium">{riceReports.from || 0}</span> to{' '}
                                <span className="font-medium">{riceReports.to || 0}</span> of{' '}
                                <span className="font-medium">{riceReports.total || 0}</span> results
                            </div>
                        )}
                    </div>

                    {/* Amount Reports (read-only) */}
                    <div className="bg-white shadow-sm rounded-lg overflow-hidden">
                        <div className="px-6 py-4 border-b">
                            <h3 className="text-lg font-semibold text-gray-900">Amount Reports</h3>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">S.No</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Year</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Month</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Primary Utilized</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Middle Utilized</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Utilized</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Working Days</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {(amountReports?.data || []).map((r, index) => (
                                        <tr key={r.id}>
                                            <td className="px-6 py-4 text-sm text-gray-900">
                                                {(amountReports.from || 0) + index}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-700">{r.year}</td>
                                            <td className="px-6 py-4 text-sm text-gray-700">{r.month}</td>
                                            <td className="px-6 py-4 text-sm text-gray-700">
                                                ₹{Number(r.total_primary_amount || 0).toFixed(2)}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-700">
                                                ₹{Number(r.total_middle_amount || 0).toFixed(2)}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-700">
                                                ₹{Number(r.grand_total_amount || r.total_amount || 0).toFixed(2)}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-700">{r.total_serving_days ?? '-'}</td>
                                            <td className="px-6 py-4 text-sm text-right">
                                                <Link
                                                    href={route('admin.amount-reports.show', r.id)}
                                                    className="inline-flex items-center px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md text-xs font-semibold"
                                                >
                                                    View
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                    {(amountReports?.data || []).length === 0 && (
                                        <tr>
                                            <td className="px-6 py-8 text-center text-sm text-gray-500" colSpan="8">
                                                No amount reports found for this school.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                        {amountReports && (
                            <div className="px-6 py-4 border-t text-sm text-gray-700">
                                Showing <span className="font-medium">{amountReports.from || 0}</span> to{' '}
                                <span className="font-medium">{amountReports.to || 0}</span> of{' '}
                                <span className="font-medium">{amountReports.total || 0}</span> results
                            </div>
                        )}
                    </div>

                    {/* Bills (read-only) */}
                    <div className="bg-white shadow-sm rounded-lg overflow-hidden">
                        <div className="px-6 py-4 border-b">
                            <h3 className="text-lg font-semibold text-gray-900">Bills</h3>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">S.No</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Month/Year</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Shop</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {(bills?.data || []).map((b, index) => (
                                        <tr key={b.id}>
                                            <td className="px-6 py-4 text-sm text-gray-900">{(bills.from || 0) + index}</td>
                                            <td className="px-6 py-4 text-sm text-gray-900">{b.month}/{b.year}</td>
                                            <td className="px-6 py-4 text-sm text-gray-700">
                                                <span
                                                    className={`px-2 py-1 text-xs font-semibold rounded ${
                                                        b.bill_type === 'kiryana'
                                                            ? 'bg-green-100 text-green-800'
                                                            : 'bg-orange-100 text-orange-800'
                                                    }`}
                                                >
                                                    {b.bill_type}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-700">{b.shop_name}</td>
                                            <td className="px-6 py-4 text-sm text-gray-700">
                                                ₹{Number(b.total_amount || 0).toFixed(2)}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-right">
                                                <Link
                                                    href={`/admin/bills/${b.id}`}
                                                    className="inline-flex items-center px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md text-xs font-semibold"
                                                >
                                                    View
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                    {(bills?.data || []).length === 0 && (
                                        <tr>
                                            <td className="px-6 py-8 text-center text-sm text-gray-500" colSpan="6">
                                                No bills found for this school.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                        {bills && (
                            <div className="px-6 py-4 border-t text-sm text-gray-700">
                                Showing <span className="font-medium">{bills.from || 0}</span> to{' '}
                                <span className="font-medium">{bills.to || 0}</span> of{' '}
                                <span className="font-medium">{bills.total || 0}</span> results
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}