import React from 'react';
import { Download } from 'lucide-react';

export default function ExportButton({ month, year, route, label = "Export to Excel", className = "" }) {
    const handleExport = (format = 'xlsx') => {
        const url = route('export', { month, year, format });
        window.location.href = url;
    };

    return (
        <div className="relative inline-block">
            <button
                onClick={() => handleExport('xlsx')}
                className={`inline-flex items-center px-4 py-2 bg-emerald-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-emerald-700 active:bg-emerald-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 transition ease-in-out duration-150 ${className}`}
            >
                <Download className="w-4 h-4 mr-2" />
                {label}
            </button>
        </div>
    );
}
