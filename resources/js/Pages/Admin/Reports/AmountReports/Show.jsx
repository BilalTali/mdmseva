import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';

export default function AdminAmountReportShow({ report }) {
    return (
        <AuthenticatedLayout header={
            <div className="flex items-center justify-between">
                <div className="flex items-center">
                    <Link href={route('admin.amount-reports.index')} className="mr-4 text-gray-600 hover:text-gray-900">Back</Link>
                    <h2 className="text-xl font-semibold text-gray-800">Amount Report - {report?.period || `${report?.month}/${report?.year}`}</h2>
                </div>
                <div className="text-sm text-gray-500">School: {report?.user?.school_name || report?.user?.name}</div>
            </div>
        }>
            <Head title={`Admin - Amount Report ${report?.period || ''}`} />
            <div className="py-8">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">
                    <div className="bg-white shadow-sm rounded-lg p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <p className="text-sm text-gray-500">Period</p>
                                <p className="text-lg font-semibold text-gray-900">{report?.period || `${report?.month}/${report?.year}`}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">District</p>
                                <p className="text-lg font-semibold text-gray-900">{report?.user?.district?.name || '-'}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Total Amount</p>
                                <p className="text-lg font-semibold text-gray-900">₹{Number(report?.total_amount || 0).toFixed(2)}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Breakdown</p>
                                <p className="text-sm text-gray-700">Pulses: ₹{Number(report?.pulses_amount || 0).toFixed(2)}, Vegetables: ₹{Number(report?.vegetables_amount || 0).toFixed(2)}, Oil: ₹{Number(report?.oil_amount || 0).toFixed(2)}, Salt: ₹{Number(report?.salt_amount || 0).toFixed(2)}, Fuel: ₹{Number(report?.fuel_amount || 0).toFixed(2)}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}