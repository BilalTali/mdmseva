// Location: resources/js/Pages/Bills/Index.jsx
import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { 
    DocumentTextIcon, 
    PlusIcon, 
    TrashIcon, 
    EyeIcon,
    ArrowLeftIcon,
    ShoppingBagIcon,
    FireIcon,
    DocumentArrowDownIcon,
    XMarkIcon
} from '@heroicons/react/24/outline';

export default function Index({ 
    auth, 
    report,
    bills,
    hasKiryanaBill,
    hasFuelBill
}) {
    const [deletingId, setDeletingId] = useState(null);
    const [filter, setFilter] = useState('all');
    const [previewBill, setPreviewBill] = useState(null);
    const [previewTheme, setPreviewTheme] = useState('bw');

    const handleDelete = (billId) => {
        if (confirm('Are you sure you want to delete this bill? This action cannot be undone.')) {
            setDeletingId(billId);
            router.delete(route('bills.destroy', billId), {
                onFinish: () => setDeletingId(null),
            });
        }
    };

    const handleDownloadPdf = (billId, theme = 'bw') => {
        window.open(`/bills/${billId}/pdf?theme=${theme}&download=1`, '_blank');
    };

    const handlePreviewPdf = (bill, theme = 'bw') => {
        setPreviewBill(bill);
        setPreviewTheme(theme);
    };

    const closePreview = () => {
        setPreviewBill(null);
    };

    const filteredBills = bills.filter(bill => {
        if (filter === 'all') return true;
        return bill.type === filter;
    });

    const kiryanaBills = bills.filter(b => b.type === 'kiryana');
    const fuelBills = bills.filter(b => b.type === 'fuel');

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title={`Bills - ${report.period}`} />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="mb-8">
                        <Link
                            href={route('amount-reports.view-pdf', report.id)}
                            className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4"
                        >
                            <ArrowLeftIcon className="h-4 w-4 mr-2" />
                            Back to Amount Report
                        </Link>
                        
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900">Vendor Bills</h1>
                                <p className="mt-2 text-sm text-gray-600">
                                    Purchase bills for {report.period}
                                </p>
                            </div>
                            
                            <div className="flex space-x-3">
                                <Link
                                    href={route('amount-reports.bills.create', { amountReport: report.id, type: 'kiryana' })}
                                    className="inline-flex items-center px-4 py-2 bg-indigo-600 border border-transparent 
                                        rounded-md font-semibold text-xs text-white uppercase tracking-widest 
                                        hover:bg-indigo-700 transition-colors"
                                >
                                    <ShoppingBagIcon className="h-4 w-4 mr-2" />
                                    Add Kiryana Bill
                                </Link>
                                
                                <Link
                                    href={route('amount-reports.bills.create', { amountReport: report.id, type: 'fuel' })}
                                    className="inline-flex items-center px-4 py-2 bg-orange-600 border border-transparent 
                                        rounded-md font-semibold text-xs text-white uppercase tracking-widest 
                                        hover:bg-orange-700 transition-colors"
                                >
                                    <FireIcon className="h-4 w-4 mr-2" />
                                    Add Fuel Bill
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* Statistics Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <div className="bg-white overflow-hidden shadow-sm rounded-lg p-6">
                            <div className="flex items-center">
                                <div className="flex-shrink-0 bg-indigo-500 rounded-md p-3">
                                    <DocumentTextIcon className="h-6 w-6 text-white" />
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-500">Total Bills</p>
                                    <p className="text-2xl font-semibold text-gray-900">{bills.length}</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white overflow-hidden shadow-sm rounded-lg p-6">
                            <div className="flex items-center">
                                <div className="flex-shrink-0 bg-green-500 rounded-md p-3">
                                    <ShoppingBagIcon className="h-6 w-6 text-white" />
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-500">Kiryana Bills</p>
                                    <p className="text-2xl font-semibold text-gray-900">{kiryanaBills.length}</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white overflow-hidden shadow-sm rounded-lg p-6">
                            <div className="flex items-center">
                                <div className="flex-shrink-0 bg-orange-500 rounded-md p-3">
                                    <FireIcon className="h-6 w-6 text-white" />
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-500">Fuel Bills</p>
                                    <p className="text-2xl font-semibold text-gray-900">{fuelBills.length}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Filter Tabs */}
                    {bills.length > 0 && (
                        <div className="mb-6">
                            <div className="border-b border-gray-200">
                                <nav className="-mb-px flex space-x-8">
                                    <button
                                        onClick={() => setFilter('all')}
                                        className={`${
                                            filter === 'all'
                                                ? 'border-indigo-500 text-indigo-600'
                                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                        } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                                    >
                                        All Bills ({bills.length})
                                    </button>
                                    <button
                                        onClick={() => setFilter('kiryana')}
                                        className={`${
                                            filter === 'kiryana'
                                                ? 'border-green-500 text-green-600'
                                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                        } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                                    >
                                        Kiryana ({kiryanaBills.length})
                                    </button>
                                    <button
                                        onClick={() => setFilter('fuel')}
                                        className={`${
                                            filter === 'fuel'
                                                ? 'border-orange-500 text-orange-600'
                                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                        } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                                    >
                                        Fuel ({fuelBills.length})
                                    </button>
                                </nav>
                            </div>
                        </div>
                    )}

                    {/* Bills List */}
                    {filteredBills.length === 0 ? (
                        <div className="bg-white shadow-sm rounded-lg p-12 text-center">
                            <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
                            <h3 className="mt-2 text-sm font-medium text-gray-900">No bills found</h3>
                            <p className="mt-1 text-sm text-gray-500">
                                {filter === 'all' 
                                    ? 'Get started by creating a kiryana or fuel bill.'
                                    : `No ${filter} bills found. Create one to get started.`}
                            </p>
                            <div className="mt-6 flex justify-center space-x-3">
                                <Link
                                    href={route('amount-reports.bills.create', { amountReport: report.id, type: 'kiryana' })}
                                    className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                                >
                                    <ShoppingBagIcon className="h-4 w-4 mr-2" />
                                    Add Kiryana Bill
                                </Link>
                                <Link
                                    href={route('amount-reports.bills.create', { amountReport: report.id, type: 'fuel' })}
                                    className="inline-flex items-center px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700"
                                >
                                    <FireIcon className="h-4 w-4 mr-2" />
                                    Add Fuel Bill
                                </Link>
                            </div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {filteredBills.map((bill) => (
                                <div key={bill.id} className="bg-white shadow-sm rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                                    <div className={`p-6 border-l-4 ${
                                        bill.type === 'kiryana' 
                                            ? 'border-green-500' 
                                            : 'border-orange-500'
                                    }`}>
                                        {/* Bill Header */}
                                        <div className="flex items-start justify-between mb-4">
                                            <div>
                                                <div className="flex items-center space-x-2 mb-1">
                                                    {bill.type === 'kiryana' ? (
                                                        <ShoppingBagIcon className="h-5 w-5 text-green-600" />
                                                    ) : (
                                                        <FireIcon className="h-5 w-5 text-orange-600" />
                                                    )}
                                                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                                        bill.type === 'kiryana'
                                                            ? 'bg-green-100 text-green-800'
                                                            : 'bg-orange-100 text-orange-800'
                                                    }`}>
                                                        {bill.type_label}
                                                    </span>
                                                </div>
                                                <h3 className="text-lg font-semibold text-gray-900">
                                                    {bill.bill_number}
                                                </h3>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-2xl font-bold text-gray-900">
                                                    {bill.formatted_total}
                                                </p>
                                                <p className="text-xs text-gray-500 mt-1">
                                                    {bill.items_count} items
                                                </p>
                                            </div>
                                        </div>

                                        {/* Vendor Details */}
                                        <div className="border-t border-gray-200 pt-4 mb-4">
                                            <div className="space-y-2 text-sm">
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600">Shop:</span>
                                                    <span className="font-medium text-gray-900">{bill.shop_name}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600">Vendor:</span>
                                                    <span className="font-medium text-gray-900">{bill.shopkeeper_name}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600">Phone:</span>
                                                    <span className="font-medium text-gray-900">{bill.phone}</span>
                                                </div>
                                                {bill.address && (
                                                    <div className="flex justify-between">
                                                        <span className="text-gray-600">Address:</span>
                                                        <span className="font-medium text-gray-900 text-right max-w-xs truncate">
                                                            {bill.address}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Timestamp */}
                                        <div className="text-xs text-gray-500 mb-4">
                                            Created {bill.created_at_human}
                                        </div>

                                        {/* Actions */}
                                        <div className="flex items-center space-x-2 pt-4 border-t border-gray-200">
                                            <Link
                                                href={route('bills.show', bill.id)}
                                                className="flex-1 inline-flex items-center justify-center px-3 py-2 border border-gray-300 
                                                    rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                                            >
                                                <EyeIcon className="h-4 w-4 mr-2" />
                                                View
                                            </Link>
                                            
                                            <button
                                                onClick={() => handlePreviewPdf(bill)}
                                                className="flex-1 inline-flex items-center justify-center px-3 py-2 border border-indigo-600 
                                                    rounded-md text-sm font-medium text-indigo-600 bg-white hover:bg-indigo-50"
                                            >
                                                <DocumentTextIcon className="h-4 w-4 mr-2" />
                                                Preview
                                            </button>
                                            
                                            <button
                                                onClick={() => handleDownloadPdf(bill.id)}
                                                className="px-3 py-2 border border-green-600 rounded-md text-sm font-medium 
                                                    text-green-600 bg-white hover:bg-green-50"
                                                title="Download PDF"
                                            >
                                                <DocumentArrowDownIcon className="h-4 w-4" />
                                            </button>
                                            
                                            <button
                                                onClick={() => handleDelete(bill.id)}
                                                disabled={deletingId === bill.id}
                                                className="px-3 py-2 border border-red-300 rounded-md text-sm font-medium 
                                                    text-red-600 bg-white hover:bg-red-50 disabled:opacity-50"
                                                title="Delete Bill"
                                            >
                                                <TrashIcon className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* PDF Preview Modal */}
            {previewBill && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="flex min-h-screen items-center justify-center p-4">
                        {/* Backdrop */}
                        <div 
                            className="fixed inset-0 bg-black bg-opacity-75 transition-opacity"
                            onClick={closePreview}
                        ></div>

                        {/* Modal */}
                        <div className="relative w-full max-w-6xl bg-white rounded-lg shadow-xl">
                            {/* Header */}
                            <div className="flex items-center justify-between p-4 border-b border-gray-200">
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900">
                                        PDF Preview: {previewBill.bill_number}
                                    </h3>
                                    <p className="text-sm text-gray-500 mt-1">
                                        {previewBill.shop_name} - {previewBill.formatted_total}
                                    </p>
                                </div>
                                <div className="flex items-center space-x-3">
                                    {/* Theme Selector */}
                                    <select
                                        value={previewTheme}
                                        onChange={(e) => setPreviewTheme(e.target.value)}
                                        className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    >
                                        <option value="bw">Black & White</option>
                                        <option value="blue">Blue</option>
                                        <option value="green">Green</option>
                                        <option value="purple">Purple</option>
                                    </select>

                                    {/* Download Button */}
                                    <button
                                        onClick={() => handleDownloadPdf(previewBill.id, previewTheme)}
                                        className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                                    >
                                        <DocumentArrowDownIcon className="h-4 w-4 mr-2" />
                                        Download
                                    </button>

                                    {/* Close Button */}
                                    <button
                                        onClick={closePreview}
                                        className="text-gray-400 hover:text-gray-600"
                                    >
                                        <XMarkIcon className="h-6 w-6" />
                                    </button>
                                </div>
                            </div>

                            {/* PDF Viewer */}
                            <div className="p-4 bg-gray-100" style={{ height: '80vh' }}>
                                <iframe
                                    key={`${previewBill.id}-${previewTheme}`}
                                    src={`/bills/${previewBill.id}/pdf?theme=${previewTheme}&download=0`}
                                    className="w-full h-full rounded border-2 border-gray-300"
                                    title={`PDF Preview: ${previewBill.bill_number}`}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}