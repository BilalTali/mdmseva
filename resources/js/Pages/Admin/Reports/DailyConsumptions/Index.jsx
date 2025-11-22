import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';

export default function AdminDailyConsumptionsIndex({ consumptions, aggregations }) {
    const items = consumptions?.data || [];

    return (
        <AuthenticatedLayout header={<div>
            <h2 className="text-xl font-semibold text-gray-800">Admin: Daily Consumptions</h2>
            <p className="text-sm text-gray-600 mt-1">Overview of daily servings across schools</p>
        </div>}>
            <Head title="Admin - Daily Consumptions" />
            <div className="py-8">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">
                    {/* Aggregations */}
                    {aggregations && (
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                            <div className="bg-white shadow-sm rounded-lg p-6">
                                <p className="text-sm text-gray-500">Total Records</p>
                                <p className="text-2xl font-bold text-gray-900">{aggregations.total_records || 0}</p>
                            </div>
                            <div className="bg-white shadow-sm rounded-lg p-6">
                                <p className="text-sm text-gray-500">Total Students Served</p>
                                <p className="text-2xl font-bold text-gray-900">{aggregations.total_students_served || 0}</p>
                            </div>
                            <div className="bg-white shadow-sm rounded-lg p-6">
                                <p className="text-sm text-gray-500">Total Rice Consumed</p>
                                <p className="text-2xl font-bold text-gray-900">{Number(aggregations.total_rice_consumed || 0).toFixed(2)} kg</p>
                            </div>
                        </div>
                    )}

                    {/* Table */}
                    <div className="bg-white shadow-sm rounded-lg overflow-hidden">
                        <div className="px-6 py-4 border-b">
                            <h3 className="text-lg font-semibold text-gray-900">Records</h3>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">School</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Primary</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Upper Primary</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rice</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {items.map((c) => (
                                        <tr key={c.id}>
                                            <td className="px-6 py-4 text-sm text-gray-900">{c.date}</td>
                                            <td className="px-6 py-4 text-sm text-gray-700">{c.user?.school_name || c.user?.name || 'School'}</td>
                                            <td className="px-6 py-4 text-sm text-gray-700">{c.primary_served || 0}</td>
                                            <td className="px-6 py-4 text-sm text-gray-700">{c.upper_primary_served || 0}</td>
                                            <td className="px-6 py-4 text-sm text-gray-700">{Number(c.total_rice_consumed || 0).toFixed(2)} kg</td>
                                            <td className="px-6 py-4 text-sm text-right">
                                                <Link href={route('admin.daily-consumptions.show', c.id)} className="inline-flex items-center px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md text-xs font-semibold">View</Link>
                                            </td>
                                        </tr>
                                    ))}
                                    {items.length === 0 && (
                                        <tr>
                                            <td className="px-6 py-8 text-center text-sm text-gray-500" colSpan="6">No records found.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                        {consumptions && (
                            <div className="px-6 py-4 border-t text-sm text-gray-700">
                                Showing <span className="font-medium">{consumptions.from || 0}</span> to <span className="font-medium">{consumptions.to || 0}</span> of <span className="font-medium">{consumptions.total || 0}</span> results
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}