import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';

export default function AdminRiceReportsIndex({ reports, aggregations, districtBreakdown = [], zoneBreakdown = [], districts = [], zones = [], filters = {} }) {
    const items = reports?.data || [];

    return (
        <AuthenticatedLayout header={<div>
            <h2 className="text-xl font-semibold text-gray-800">Admin: Rice Reports</h2>
            <p className="text-sm text-gray-600 mt-1">Cross-school monthly rice consumption reports</p>
        </div>}>
            <Head title="Admin - Rice Reports" />

            <div className="py-8">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">
                    {/* Aggregations */}
                    {aggregations && (
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                            <div className="bg-white shadow-sm rounded-lg p-6">
                                <p className="text-sm text-gray-500">Total Reports</p>
                                <p className="text-2xl font-bold text-gray-900">{aggregations.total_reports || 0}</p>
                            </div>
                            <div className="bg-white shadow-sm rounded-lg p-6">
                                <p className="text-sm text-gray-500">Total Rice Consumed</p>
                                <p className="text-2xl font-bold text-gray-900">{Number(aggregations.total_rice || 0).toFixed(2)} kg</p>
                            </div>
                            <div className="bg-white shadow-sm rounded-lg p-6">
                                <p className="text-sm text-gray-500">Average Per School</p>
                                <p className="text-2xl font-bold text-gray-900">{Number(aggregations.avg_per_school || 0).toFixed(2)} kg</p>
                            </div>
                        </div>
                    )}

                    {/* Reports Table */}
                    <div className="bg-white shadow-sm rounded-lg overflow-hidden">
                        <div className="px-6 py-4 border-b">
                            <h3 className="text-lg font-semibold text-gray-900">Reports</h3>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Period</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">School</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">District</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rice Consumed</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {items.map((r) => (
                                        <tr key={r.id}>
                                            <td className="px-6 py-4 text-sm text-gray-900">{r.period || `${r.month}/${r.year}`}</td>
                                            <td className="px-6 py-4 text-sm text-gray-700">{r.user?.school_name || r.user?.name || 'School'}</td>
                                            <td className="px-6 py-4 text-sm text-gray-700">{r.user?.district?.name || '-'}</td>
                                            <td className="px-6 py-4 text-sm text-gray-700">{Number(r.total_rice_consumed || 0).toFixed(2)} kg</td>
                                            <td className="px-6 py-4 text-sm text-right">
                                                <Link href={route('admin.rice-reports.show', r.id)} className="inline-flex items-center px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md text-xs font-semibold">View</Link>
                                            </td>
                                        </tr>
                                    ))}
                                    {items.length === 0 && (
                                        <tr>
                                            <td className="px-6 py-8 text-center text-sm text-gray-500" colSpan="5">No reports found for selected filters.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                        {/* Pagination summary */}
                        {reports && (
                            <div className="px-6 py-4 border-t text-sm text-gray-700">
                                Showing <span className="font-medium">{reports.from || 0}</span> to <span className="font-medium">{reports.to || 0}</span> of <span className="font-medium">{reports.total || 0}</span> results
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}