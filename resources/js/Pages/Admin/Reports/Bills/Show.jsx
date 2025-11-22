import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';

export default function AdminBillShow({ bill }) {
    return (
        <AuthenticatedLayout header={
            <div className="flex items-center justify-between">
                <div className="flex items-center">
                    <Link href={route('admin.bills.index')} className="mr-4 text-gray-600 hover:text-gray-900">Back</Link>
                    <h2 className="text-xl font-semibold text-gray-800">Bill - {bill?.shop_name}</h2>
                </div>
                <div className="text-sm text-gray-500">School: {bill?.user?.school_name || bill?.user?.name}</div>
            </div>
        }>
            <Head title={`Admin - Bill ${bill?.shop_name || ''}`} />
            <div className="py-8">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">
                    <div className="bg-white shadow-sm rounded-lg p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <p className="text-sm text-gray-500">Date</p>
                                <p className="text-lg font-semibold text-gray-900">{bill?.date || `${bill?.month}/${bill?.year}`}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Type</p>
                                <p className="text-lg font-semibold text-gray-900">{bill?.type}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Shop Name</p>
                                <p className="text-lg font-semibold text-gray-900">{bill?.shop_name}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Total Amount</p>
                                <p className="text-lg font-semibold text-gray-900">₹{Number(bill?.total_amount || 0).toFixed(2)}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}