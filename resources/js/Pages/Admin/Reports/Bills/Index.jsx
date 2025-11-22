import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';

export default function AdminBillsIndex({ bills, aggregations, vendorBreakdown, districts = [], zones = [], filters = {} }) {
    const items = bills?.data || [];

    return (
        <AuthenticatedLayout header={<div>
            <h2 className="text-xl font-semibold text-gray-800">Admin: Bills</h2>
            <p className="text-sm text-gray-600 mt-1">Vendor bills across schools</p>
        </div>}>
            <Head title="Admin - Bills" />
            <div className="py-8">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">
                    {/* Aggregations */}
                    {aggregations && (
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                            <div className="bg-white shadow-sm rounded-lg p-6">
                                <p className="text-sm text-gray-500">Total Bills</p>
                                <p className="text-2xl font-bold text-gray-900">{aggregations.total_bills || 0}</p>
                            </div>
                            <div className="bg-white shadow-sm rounded-lg p-6">
                                <p className="text-sm text-gray-500">Total Amount</p>
                                <p className="text-2xl font-bold text-gray-900">₹{Number(aggregations.total_amount || 0).toFixed(2)}</p>
                            </div>
                            <div className="bg-white shadow-sm rounded-lg p-6">
                                <p className="text-sm text-gray-500">Avg Bill Amount</p>
                                <p className="text-2xl font-bold text-gray-900">₹{Number(aggregations.avg_bill_amount || 0).toFixed(2)}</p>
                            </div>
                        </div>
                    )}

                    {/* Bills Table */}
                    <div className="bg-white shadow-sm rounded-lg overflow-hidden">
                        <div className="px-6 py-4 border-b">
                            <h3 className="text-lg font-semibold text-gray-900">Bills</h3>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Shop</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">School</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {items.map((b) => (
                                        <tr key={b.id}>
                                            <td className="px-6 py-4 text-sm text-gray-900">{b.date || `${b.month}/${b.year}`}</td>
                                            <td className="px-6 py-4 text-sm text-gray-700">{b.type}</td>
                                            <td className="px-6 py-4 text-sm text-gray-700">{b.shop_name}</td>
                                            <td className="px-6 py-4 text-sm text-gray-700">{b.user?.school_name || b.user?.name || 'School'}</td>
                                            <td className="px-6 py-4 text-sm text-gray-700">₹{Number(b.total_amount || 0).toFixed(2)}</td>
                                            <td className="px-6 py-4 text-sm text-right">
                                                <Link href={route('admin.bills.show', b.id)} className="inline-flex items-center px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md text-xs font-semibold">View</Link>
                                            </td>
                                        </tr>
                                    ))}
                                    {items.length === 0 && (
                                        <tr>
                                            <td className="px-6 py-8 text-center text-sm text-gray-500" colSpan="6">No bills found.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                        {bills && (
                            <div className="px-6 py-4 border-t text-sm text-gray-700">
                                Showing <span className="font-medium">{bills.from || 0}</span> to <span className="font-medium">{bills.to || 0}</span> of <span className="font-medium">{bills.total || 0}</span> results
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}