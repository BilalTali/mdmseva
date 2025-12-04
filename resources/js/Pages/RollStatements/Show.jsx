import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

export default function Show({ auth, statements, date, academic_year, school_info }) {

    // Calculate totals
    const totalBoys = statements.reduce((sum, stmt) => sum + stmt.boys, 0);
    const totalGirls = statements.reduce((sum, stmt) => sum + stmt.girls, 0);
    const grandTotal = totalBoys + totalGirls;

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="View Roll Statement" />

            <div className="py-12">
                <div className="max-w-4xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">

                        {/* Header Section */}
                        <div className="p-6 bg-gray-50 border-b border-gray-200">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h2 className="text-xl font-bold text-gray-800">Roll Statement Details</h2>
                                    <p className="text-sm text-gray-600 mt-1">{school_info.name}</p>
                                    <p className="text-xs text-gray-500">UDISE: {school_info.udise}</p>
                                </div>
                                <div className="text-right">
                                    <div className="mb-2">
                                        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</span>
                                        <p className="text-lg font-bold text-gray-900">{formatDate(date)}</p>
                                    </div>
                                    <div>
                                        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Academic Year</span>
                                        <p className="text-md font-medium text-gray-900">{academic_year}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Table Section */}
                        <div className="p-6">
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200 border border-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">Class</th>
                                            <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">Boys</th>
                                            <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">Girls</th>
                                            <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {statements.map((stmt) => (
                                            <tr key={stmt.id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 border-r border-gray-200">
                                                    {stmt.class_label}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center border-r border-gray-200">
                                                    {stmt.boys}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center border-r border-gray-200">
                                                    {stmt.girls}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900 text-center">
                                                    {stmt.total}
                                                </td>
                                            </tr>
                                        ))}
                                        {/* Total Row */}
                                        <tr className="bg-gray-100 font-bold">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 border-r border-gray-200 text-right">
                                                Grand Total
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center border-r border-gray-200">
                                                {totalBoys}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center border-r border-gray-200">
                                                {totalGirls}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
                                                {grandTotal}
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>

                            {/* Last Updated Info */}
                            {statements[0]?.last_updated_at && (
                                <div className="mt-4 text-xs text-gray-500 text-right">
                                    <i className="fas fa-clock mr-1"></i>
                                    Last Updated: {statements[0].last_updated_at}
                                    {statements[0].updated_by_name && ` by ${statements[0].updated_by_name}`}
                                </div>
                            )}

                            {/* Actions */}
                            <div className="mt-8 flex justify-end space-x-3">
                                <Link
                                    href={route('roll-statements.index')}
                                    className="inline-flex items-center px-4 py-2 bg-gray-200 border border-transparent rounded-md font-semibold text-xs text-gray-700 uppercase tracking-widest hover:bg-gray-300 focus:bg-gray-300 active:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition ease-in-out duration-150"
                                >
                                    Back to List
                                </Link>
                                <Link
                                    href={route('roll-statements.edit', statements[0].id)}
                                    className="inline-flex items-center px-4 py-2 bg-indigo-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-indigo-700 focus:bg-indigo-700 active:bg-indigo-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition ease-in-out duration-150"
                                >
                                    Edit
                                </Link>
                                <a
                                    href={route('roll-statements.download-pdf', { date: date, academic_year: academic_year })}
                                    className="inline-flex items-center px-4 py-2 bg-green-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-green-700 focus:bg-green-700 active:bg-green-900 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition ease-in-out duration-150"
                                >
                                    <i className="fas fa-file-pdf mr-2"></i>
                                    Download PDF
                                </a>
                                <a
                                    href={route('roll-statements.download-pdf', { date: date, academic_year: academic_year, action: 'preview' })}
                                    target="_blank"
                                    className="inline-flex items-center px-4 py-2 bg-gray-800 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-gray-700 focus:bg-gray-700 active:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition ease-in-out duration-150"
                                >
                                    <i className="fas fa-eye mr-2"></i>
                                    Preview PDF
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
