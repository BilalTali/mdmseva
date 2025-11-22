import React, { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { ArrowLeftIcon, PrinterIcon, DocumentArrowDownIcon, Cog6ToothIcon, EyeIcon } from '@heroicons/react/24/outline';

export default function ViewPdf({ auth, bill, report }) {
    const [selectedTheme, setSelectedTheme] = useState('bw');
    const [showPdfOptions, setShowPdfOptions] = useState(false);
    const pdfUrl = `/bills/${bill.id}/pdf?theme=${selectedTheme}&preview=1`;

    const themes = [
        { id: 'bw', name: 'Black & White', color: 'bg-gray-700' },
        { id: 'blue', name: 'Blue Theme', color: 'bg-blue-600' },
        { id: 'green', name: 'Green Theme', color: 'bg-green-600' },
        { id: 'purple', name: 'Purple Theme', color: 'bg-purple-600' },
    ];

    const handleDownload = () => {
        const downloadUrl = `/bills/${bill.id}/pdf?theme=${selectedTheme}&download=1`;
        window.open(downloadUrl, '_blank');
    };

    const handlePrint = () => {
        const w = window.open(pdfUrl, '_blank');
        if (w) {
            w.onload = () => w.print();
        }
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title={`Bill ${bill.bill_number}`} />
            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="mb-8">
                        <Link
                            href={route('amount-reports.bills.index', report.id)}
                            className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4"
                        >
                            <ArrowLeftIcon className="h-4 w-4 mr-2" />
                            Back to Bills
                        </Link>

                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900">{bill.bill_number}</h1>
                                <p className="mt-2 text-sm text-gray-600">Period {report.period} • {bill.type_label}</p>
                            </div>
                            <div className="flex space-x-3">
                                <button onClick={() => setShowPdfOptions(!showPdfOptions)} className="inline-flex items-center px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700">
                                    <Cog6ToothIcon className="h-5 w-5 mr-2" />
                                    PDF Options
                                </button>
                                <button onClick={handlePrint} className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                                    <PrinterIcon className="h-5 w-5 mr-2" />
                                    Print
                                </button>
                                <button onClick={handleDownload} className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">
                                    <DocumentArrowDownIcon className="h-5 w-5 mr-2" />
                                    Download PDF
                                </button>
                            </div>
                        </div>
                    </div>

                    {showPdfOptions && (
                        <div className="bg-white shadow-lg rounded-lg p-6 mb-8 border-2 border-indigo-200">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                                    <EyeIcon className="w-5 h-5 mr-2 text-indigo-600" />
                                    PDF Theme Selection
                                </h3>
                                <button onClick={() => setShowPdfOptions(false)} className="text-gray-400 hover:text-gray-600">✕</button>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                {themes.map((t) => (
                                    <button
                                        key={t.id}
                                        onClick={() => setSelectedTheme(t.id)}
                                        className={`p-4 rounded-lg border-2 transition-all ${selectedTheme === t.id ? 'border-indigo-600 shadow-lg bg-indigo-50' : 'border-gray-200 hover:border-gray-300 hover:shadow-md'}`}
                                    >
                                        <div className={`w-full h-12 rounded ${t.color} mb-3 shadow-sm`}></div>
                                        <p className="text-sm font-semibold text-gray-900">{t.name}</p>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="bg-white shadow-sm rounded-lg p-6 mb-8">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-medium text-gray-900 flex items-center">
                                <EyeIcon className="w-5 h-5 mr-2 text-indigo-600" />
                                PDF Preview
                                <span className="ml-3 px-2 py-1 text-xs bg-indigo-100 text-indigo-700 rounded">Theme: {themes.find(t => t.id === selectedTheme)?.name}</span>
                            </h3>
                            <button onClick={() => setShowPdfOptions(!showPdfOptions)} className="text-sm text-indigo-600 hover:text-indigo-800 font-medium">Change Theme</button>
                        </div>
                        <div className="border-2 border-gray-300 rounded-lg overflow-hidden shadow-inner" style={{ height: '800px' }}>
                            <iframe key={pdfUrl} src={pdfUrl} className="w-full h-full" title={`Bill PDF ${bill.bill_number}`} allow="fullscreen" />
                        </div>
                        <div className="mt-4 flex items-center justify-center space-x-4 text-sm text-gray-600">
                            <span>Use mouse wheel to zoom</span>
                            <span>•</span>
                            <span>Click fullscreen in viewer for better experience</span>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}