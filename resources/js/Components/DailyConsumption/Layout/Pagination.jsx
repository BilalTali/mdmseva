// File: resources/js/Components/DailyConsumption/Layout/Pagination.jsx

import React from 'react';
import { Link } from '@inertiajs/react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

/**
 * Pagination Component
 * 
 * Handles pagination for consumption records
 * Works with Laravel's paginate() response
 */
export default function Pagination({ links, meta, className = '' }) {
    if (!links || links.length <= 3) return null;

    const { current_page, last_page, from, to, total } = meta;

    // Generate page numbers to show
    const getPageNumbers = () => {
        const pages = [];
        const showPages = 7; // Show 7 page numbers max
        
        if (last_page <= showPages) {
            // Show all pages if total is less than showPages
            for (let i = 1; i <= last_page; i++) {
                pages.push(i);
            }
        } else {
            // Always show first page
            pages.push(1);
            
            // Calculate range around current page
            let start = Math.max(2, current_page - 1);
            let end = Math.min(last_page - 1, current_page + 1);
            
            // Adjust range if near start or end
            if (current_page <= 3) {
                end = 5;
            } else if (current_page >= last_page - 2) {
                start = last_page - 4;
            }
            
            // Add ellipsis after first page if needed
            if (start > 2) {
                pages.push('...');
            }
            
            // Add page numbers in range
            for (let i = start; i <= end; i++) {
                pages.push(i);
            }
            
            // Add ellipsis before last page if needed
            if (end < last_page - 1) {
                pages.push('...');
            }
            
            // Always show last page
            pages.push(last_page);
        }
        
        return pages;
    };

    const pageNumbers = getPageNumbers();

    return (
        <div className={`bg-white border-t border-gray-200 px-4 py-3 sm:px-6 ${className}`}>
            <div className="flex items-center justify-between">
                {/* Mobile: Simple prev/next */}
                <div className="flex flex-1 justify-between sm:hidden">
                    <Link
                        href={links[0].url}
                        preserveScroll
                        className={`relative inline-flex items-center px-4 py-2 text-sm font-medium rounded-md ${
                            links[0].url
                                ? 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                                : 'bg-gray-100 border border-gray-200 text-gray-400 cursor-not-allowed'
                        }`}
                        disabled={!links[0].url}
                    >
                        Previous
                    </Link>
                    <Link
                        href={links[links.length - 1].url}
                        preserveScroll
                        className={`relative ml-3 inline-flex items-center px-4 py-2 text-sm font-medium rounded-md ${
                            links[links.length - 1].url
                                ? 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                                : 'bg-gray-100 border border-gray-200 text-gray-400 cursor-not-allowed'
                        }`}
                        disabled={!links[links.length - 1].url}
                    >
                        Next
                    </Link>
                </div>

                {/* Desktop: Full pagination */}
                <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                    {/* Results info */}
                    <div>
                        <p className="text-sm text-gray-700">
                            Showing <span className="font-medium">{from}</span> to{' '}
                            <span className="font-medium">{to}</span> of{' '}
                            <span className="font-medium">{total}</span> results
                        </p>
                    </div>

                    {/* Page numbers */}
                    <div>
                        <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                            {/* First page button */}
                            <Link
                                href={links[0].url}
                                preserveScroll
                                className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 text-sm font-medium ${
                                    current_page === 1
                                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                        : 'bg-white text-gray-500 hover:bg-gray-50'
                                }`}
                                disabled={current_page === 1}
                            >
                                <span className="sr-only">First</span>
                                <ChevronsLeft className="h-5 w-5" />
                            </Link>

                            {/* Previous button */}
                            <Link
                                href={links[0].url}
                                preserveScroll
                                className={`relative inline-flex items-center px-2 py-2 border border-gray-300 text-sm font-medium ${
                                    !links[0].url
                                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                        : 'bg-white text-gray-500 hover:bg-gray-50'
                                }`}
                                disabled={!links[0].url}
                            >
                                <span className="sr-only">Previous</span>
                                <ChevronLeft className="h-5 w-5" />
                            </Link>

                            {/* Page numbers */}
                            {pageNumbers.map((page, index) => {
                                if (page === '...') {
                                    return (
                                        <span
                                            key={`ellipsis-${index}`}
                                            className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700"
                                        >
                                            ...
                                        </span>
                                    );
                                }

                                const isActive = page === current_page;
                                const pageLink = links.find(link => {
                                    const url = new URL(link.url || '', window.location.origin);
                                    return parseInt(url.searchParams.get('page')) === page || (page === 1 && !url.searchParams.has('page'));
                                });

                                return (
                                    <Link
                                        key={page}
                                        href={pageLink?.url || '#'}
                                        preserveScroll
                                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                                            isActive
                                                ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                                                : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                                        }`}
                                    >
                                        {page}
                                    </Link>
                                );
                            })}

                            {/* Next button */}
                            <Link
                                href={links[links.length - 1].url}
                                preserveScroll
                                className={`relative inline-flex items-center px-2 py-2 border border-gray-300 text-sm font-medium ${
                                    !links[links.length - 1].url
                                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                        : 'bg-white text-gray-500 hover:bg-gray-50'
                                }`}
                                disabled={!links[links.length - 1].url}
                            >
                                <span className="sr-only">Next</span>
                                <ChevronRight className="h-5 w-5" />
                            </Link>

                            {/* Last page button */}
                            <Link
                                href={links[links.length - 1].url}
                                preserveScroll
                                className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 text-sm font-medium ${
                                    current_page === last_page
                                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                        : 'bg-white text-gray-500 hover:bg-gray-50'
                                }`}
                                disabled={current_page === last_page}
                            >
                                <span className="sr-only">Last</span>
                                <ChevronsRight className="h-5 w-5" />
                            </Link>
                        </nav>
                    </div>
                </div>
            </div>
        </div>
    );
}