import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';

export default function AdminRiceReportShow({ report }) {
    return (
        <AuthenticatedLayout header={
            <div className="flex items-center justify-between">
                <div className="flex items-center">
                    <Link href={route('admin.rice-reports.index')} className="mr-4 text-gray-600 hover:text-gray-900">Back</Link>
                    <h2 className="text-xl font-semibold text-gray-800">Rice Report - {report?.period}</h2>
                </div>
                <div className="text-sm text-gray-500">School: {report?.user?.school_name || report?.user?.name}</div>
            </div>
        }>
            <Head title={`Admin - Rice Report ${report?.period || ''}`} />

            <div className="py-8">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">
                    <div className="bg-white shadow-sm rounded-lg p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <p className="text-sm text-gray-500">Period</p>
                                <p className="text-lg font-semibold text-gray-900">{report?.period}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">District</p>
                                <p className="text-lg font-semibold text-gray-900">{report?.user?.district?.name || '-'}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Total Rice Consumed</p>
                                <p className="text-lg font-semibold text-gray-900">{Number(report?.total_rice_consumed || 0).toFixed(2)} kg</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Serving Days</p>
                                <p className="text-lg font-semibold text-gray-900">{report?.total_serving_days || '-'}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}