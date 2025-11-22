// Location: resources/js/Pages/Bills/Show.jsx
import React, { useState, useEffect } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { 
    ArrowLeftIcon,
    ShoppingBagIcon,
    FireIcon,
    DocumentArrowDownIcon,
    PrinterIcon,
    EyeIcon,
    XMarkIcon
} from '@heroicons/react/24/outline';

export default function Show({ auth, bill, report, user }) {
    const [showPreview, setShowPreview] = useState(false);
    const [showThemeOptions, setShowThemeOptions] = useState(false);
    const [previewTheme, setPreviewTheme] = useState('bw');
    const [iframeKey, setIframeKey] = useState(0);

    // Force iframe reload when theme changes
    useEffect(() => {
        if (showPreview) {
            setIframeKey(prev => prev + 1);
        }
    }, [previewTheme, showPreview]);

    const handleDownloadPdf = (theme = 'bw') => {
        window.open(`/bills/${bill.id}/pdf?theme=${theme}&download=1`, '_blank');
    };

    const handlePrintPdf = (theme = 'bw') => {
        window.open(`/bills/${bill.id}/pdf?theme=${theme}&preview=1`, '_blank');
    };

    const handlePreviewPdf = () => {
        setShowThemeOptions(true);
    };

    const handleThemeSelect = (theme) => {
        setPreviewTheme(theme);
        setShowThemeOptions(false);
        setShowPreview(true);
    };

    const closePreview = () => {
        setShowPreview(false);
    };

    const closeThemeOptions = () => {
        setShowThemeOptions(false);
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title={`Bill ${bill.bill_number}`} />

            <div className="py-12">
                <div className="max-w-5xl mx-auto sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="mb-8">
                        <Link
                            href={route('amount-reports.bills.index', report.id)}
                            className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4"
                        >
                            <ArrowLeftIcon className="h-4 w-4 mr-2" />
                            Back to Bills
                        </Link>
                        
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                                {bill.type === 'kiryana' ? (
                                    <ShoppingBagIcon className="h-8 w-8 text-green-600" />
                                ) : (
                                    <FireIcon className="h-8 w-8 text-orange-600" />
                                )}
                                <div>
                                    <div className="flex items-center space-x-2">
                                        <h1 className="text-3xl font-bold text-gray-900">{bill.bill_number}</h1>
                                        <span className={`px-3 py-1 text-sm font-semibold rounded-full ${
                                            bill.type === 'kiryana'
                                                ? 'bg-green-100 text-green-800'
                                                : 'bg-orange-100 text-orange-800'
                                        }`}>
                                            {bill.type_label}
                                        </span>
                                    </div>
                                    <p className="mt-1 text-sm text-gray-600">
                                        Created {bill.created_at_human}
                                    </p>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex space-x-3">
                                <button
                                    type="button"
                                    onClick={handlePreviewPdf}
                                    className="inline-flex items-center px-4 py-2 bg-indigo-600 border border-transparent 
                                        rounded-md text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none 
                                        focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                >
                                    <EyeIcon className="h-4 w-4 mr-2" />
                                    Preview PDF
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handlePrintPdf()}
                                    className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md 
                                        text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none 
                                        focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                >
                                    <PrinterIcon className="h-4 w-4 mr-2" />
                                    Print
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handleDownloadPdf()}
                                    className="inline-flex items-center px-4 py-2 bg-green-600 border border-transparent 
                                        rounded-md text-sm font-medium text-white hover:bg-green-700 focus:outline-none 
                                        focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                                >
                                    <DocumentArrowDownIcon className="h-4 w-4 mr-2" />
                                    Download
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Bill Summary Card */}
                    <div className="bg-white shadow-sm rounded-lg p-6 mb-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="text-center p-4 bg-gray-50 rounded-lg">
                                <p className="text-sm font-medium text-gray-500">Report Period</p>
                                <p className="mt-1 text-lg font-semibold text-gray-900">
                                    {report.period}
                                </p>
                            </div>
                            <div className="text-center p-4 bg-gray-50 rounded-lg">
                                <p className="text-sm font-medium text-gray-500">Total Items</p>
                                <p className="mt-1 text-lg font-semibold text-gray-900">
                                    {bill.items.length}
                                </p>
                            </div>
                            <div className="text-center p-4 bg-indigo-50 rounded-lg">
                                <p className="text-sm font-medium text-indigo-600">Total Amount</p>
                                <p className="mt-1 text-2xl font-bold text-indigo-900">
                                    {bill.formatted_total}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Vendor Details */}
                    <div className="bg-white shadow-sm rounded-lg p-6 mb-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Vendor Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm font-medium text-gray-500">Shop Name</p>
                                <p className="mt-1 text-base text-gray-900">{bill.shop_name}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-500">Contact Person</p>
                                <p className="mt-1 text-base text-gray-900">{bill.shopkeeper_name}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-500">Phone Number</p>
                                <p className="mt-1 text-base text-gray-900">{bill.phone}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-500">Shop Address</p>
                                <p className="mt-1 text-base text-gray-900">{bill.address}</p>
                            </div>
                            {bill.shop_gstin && (
                                <div>
                                    <p className="text-sm font-medium text-gray-500">GSTIN</p>
                                    <p className="mt-1 text-base text-gray-900">{bill.shop_gstin}</p>
                                </div>
                            )}
                            {bill.shop_license_no && (
                                <div>
                                    <p className="text-sm font-medium text-gray-500">License No</p>
                                    <p className="mt-1 text-base text-gray-900">{bill.shop_license_no}</p>
                                </div>
                            )}
                            {bill.payment_mode && (
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Payment Mode</p>
                                    <p className="mt-1 text-base text-gray-900 uppercase">{bill.payment_mode}</p>
                                </div>
                            )}
                            {bill.fuel_type && (
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Fuel Type</p>
                                    <p className="mt-1 text-base text-gray-900 uppercase">{bill.fuel_type}</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Bill Items */}
                    <div className="bg-white shadow-sm rounded-lg overflow-hidden">
                        <div className="p-6 border-b border-gray-200">
                            <h3 className="text-lg font-semibold text-gray-900">Bill Items</h3>
                        </div>
                        
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            S.No
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Item Name
                                        </th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Amount (₹)
                                        </th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Rate (₹/unit)
                                        </th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Quantity
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Unit
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {bill.items.map((item, index) => (
                                        <tr key={item.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {index + 1}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-gray-900">
                                                    {item.item_name}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right">
                                                <div className="text-sm font-semibold text-gray-900">
                                                    {item.formatted_amount}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right">
                                                <div className="text-sm text-gray-900">
                                                    {item.formatted_rate}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right">
                                                <div className="text-sm font-medium text-gray-900">
                                                    {item.formatted_quantity}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                                                    {item.unit}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                                <tfoot className="bg-gray-50">
                                    <tr>
                                        <td colSpan="2" className="px-6 py-4 text-right">
                                            <span className="text-base font-bold text-gray-900">TOTAL:</span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <span className="text-lg font-bold text-indigo-600">
                                                {bill.formatted_total}
                                            </span>
                                        </td>
                                        <td colSpan="3"></td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    </div>

                    {/* Theme Selection for PDF */}
                    <div className="mt-6 bg-white shadow-sm rounded-lg p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">PDF Theme Options</h3>
                        <p className="text-sm text-gray-600 mb-4">
                            Preview or download your PDF in different color themes:
                        </p>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            <button
                                onClick={() => handleDownloadPdf('bw')}
                                className="px-4 py-3 border-2 border-gray-300 rounded-lg hover:border-gray-500 
                                    transition-colors text-sm font-medium hover:bg-gray-50"
                            >
                                <div className="w-6 h-6 bg-gray-800 rounded mx-auto mb-2"></div>
                                Black & White
                            </button>
                            <button
                                onClick={() => handleDownloadPdf('blue')}
                                className="px-4 py-3 border-2 border-blue-300 rounded-lg hover:border-blue-500 
                                    transition-colors text-sm font-medium hover:bg-blue-50"
                            >
                                <div className="w-6 h-6 bg-blue-600 rounded mx-auto mb-2"></div>
                                Blue
                            </button>
                            <button
                                onClick={() => handleDownloadPdf('green')}
                                className="px-4 py-3 border-2 border-green-300 rounded-lg hover:border-green-500 
                                    transition-colors text-sm font-medium hover:bg-green-50"
                            >
                                <div className="w-6 h-6 bg-green-600 rounded mx-auto mb-2"></div>
                                Green
                            </button>
                            <button
                                onClick={() => handleDownloadPdf('purple')}
                                className="px-4 py-3 border-2 border-purple-300 rounded-lg hover:border-purple-500 
                                    transition-colors text-sm font-medium hover:bg-purple-50"
                            >
                                <div className="w-6 h-6 bg-purple-600 rounded mx-auto mb-2"></div>
                                Purple
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Theme Selection Modal */}
            {showThemeOptions && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="flex min-h-screen items-center justify-center p-4">
                        {/* Backdrop */}
                        <div 
                            className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
                            onClick={closeThemeOptions}
                        ></div>

                        {/* Modal */}
                        <div className="relative w-full max-w-2xl bg-white rounded-lg shadow-xl p-6">
                            {/* Header */}
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900">
                                        Select PDF Theme
                                    </h3>
                                    <p className="text-sm text-gray-500 mt-1">
                                        Choose a theme for your PDF preview
                                    </p>
                                </div>
                                <button
                                    onClick={closeThemeOptions}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    <XMarkIcon className="h-6 w-6" />
                                </button>
                            </div>

                            {/* Theme Options Grid */}
                            <div className="grid grid-cols-2 gap-4">
                                <button
                                    onClick={() => handleThemeSelect('bw')}
                                    className="group p-6 border-2 border-gray-300 rounded-lg hover:border-gray-500 
                                        hover:shadow-lg transition-all text-center"
                                >
                                    <div className="w-16 h-16 bg-gray-800 rounded-lg mx-auto mb-3 group-hover:scale-110 transition-transform"></div>
                                    <h4 className="text-lg font-semibold text-gray-900 mb-1">Black & White</h4>
                                    <p className="text-sm text-gray-500">Classic professional look</p>
                                </button>

                                <button
                                    onClick={() => handleThemeSelect('blue')}
                                    className="group p-6 border-2 border-blue-300 rounded-lg hover:border-blue-500 
                                        hover:shadow-lg transition-all text-center"
                                >
                                    <div className="w-16 h-16 bg-blue-600 rounded-lg mx-auto mb-3 group-hover:scale-110 transition-transform"></div>
                                    <h4 className="text-lg font-semibold text-gray-900 mb-1">Blue</h4>
                                    <p className="text-sm text-gray-500">Cool and corporate</p>
                                </button>

                                <button
                                    onClick={() => handleThemeSelect('green')}
                                    className="group p-6 border-2 border-green-300 rounded-lg hover:border-green-500 
                                        hover:shadow-lg transition-all text-center"
                                >
                                    <div className="w-16 h-16 bg-green-600 rounded-lg mx-auto mb-3 group-hover:scale-110 transition-transform"></div>
                                    <h4 className="text-lg font-semibold text-gray-900 mb-1">Green</h4>
                                    <p className="text-sm text-gray-500">Fresh and vibrant</p>
                                </button>

                                <button
                                    onClick={() => handleThemeSelect('purple')}
                                    className="group p-6 border-2 border-purple-300 rounded-lg hover:border-purple-500 
                                        hover:shadow-lg transition-all text-center"
                                >
                                    <div className="w-16 h-16 bg-purple-600 rounded-lg mx-auto mb-3 group-hover:scale-110 transition-transform"></div>
                                    <h4 className="text-lg font-semibold text-gray-900 mb-1">Purple</h4>
                                    <p className="text-sm text-gray-500">Modern and elegant</p>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* PDF Preview Modal */}
            {showPreview && (
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
                                        PDF Preview: {bill.bill_number}
                                    </h3>
                                    <p className="text-sm text-gray-500 mt-1">
                                        {bill.shop_name} - {bill.formatted_total}
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

                                    {/* Print Button */}
                                    <button
                                        onClick={() => handlePrintPdf(previewTheme)}
                                        className="inline-flex items-center px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
                                    >
                                        <PrinterIcon className="h-4 w-4 mr-2" />
                                        Print
                                    </button>

                                    {/* Download Button */}
                                    <button
                                        onClick={() => handleDownloadPdf(previewTheme)}
                                        className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
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
                                    key={iframeKey}
                                    src={`/bills/${bill.id}/pdf?theme=${previewTheme}&preview=1`}
                                    className="w-full h-full rounded border-2 border-gray-300"
                                    title={`PDF Preview: ${bill.bill_number}`}
                                />
                            </div>

                            {/* Footer Info */}
                            <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 rounded-b-lg">
                                <div className="flex items-center justify-between text-sm text-gray-600">
                                    <div>
                                        <span className="font-medium">Period:</span> {report.period}
                                    </div>
                                    <div>
                                        <span className="font-medium">Items:</span> {bill.items.length}
                                    </div>
                                    <div>
                                        <span className="font-medium">Total:</span> {bill.formatted_total}
                                    </div>
                                    <div>
                                        <span className="font-medium">Theme:</span> {previewTheme.toUpperCase()}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}