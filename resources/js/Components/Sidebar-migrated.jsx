import { useState, useEffect } from 'react';

export default function Sidebar({ currentRoute }) {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    // Auto-open School Configuration dropdown if on related routes
    const shouldSchoolConfigBeOpen = () => {
        const rollStatementRoutes = [
            'roll-statements.index',
            'roll-statements.create',
            'roll-statements.edit',
            'roll-statements.show'
        ];
        const riceConfigRoutes = [
            'rice-configuration.index',
            'rice-configuration.create',
            'rice-configuration.edit'
        ];
        const amountConfigRoutes = [
            'amount-config.index',
            'amount-config.create',
            'amount-config.edit',
            'amount-config.show'
        ];
        return rollStatementRoutes.some(route => currentRoute && currentRoute.startsWith(route)) ||
            riceConfigRoutes.some(route => currentRoute && currentRoute.startsWith(route)) ||
            amountConfigRoutes.some(route => currentRoute && currentRoute.startsWith(route));
    };

    // Auto-open Monthly Reports dropdown if on related routes
    const shouldMonthlyReportsBeOpen = () => {
        return currentRoute && (
            currentRoute.startsWith('rice-reports') ||
            currentRoute.startsWith('amount-reports') ||
            currentRoute.includes('bills')
        );
    };

    const [isSchoolConfigOpen, setIsSchoolConfigOpen] = useState(shouldSchoolConfigBeOpen());
    const [isMonthlyReportsOpen, setIsMonthlyReportsOpen] = useState(shouldMonthlyReportsBeOpen());

    // Update dropdown state when route changes
    useEffect(() => {
        setIsSchoolConfigOpen(shouldSchoolConfigBeOpen());
        setIsMonthlyReportsOpen(shouldMonthlyReportsBeOpen());
    }, [currentRoute]);

    // Close mobile menu when route changes
    useEffect(() => {
        setIsMobileMenuOpen(false);
    }, [currentRoute]);

    // Prevent body scroll when mobile menu is open
    useEffect(() => {
        if (isMobileMenuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isMobileMenuOpen]);

    const isActive = (routeName) => {
        return currentRoute === routeName;
    };

    const isSchoolConfigActive = () => {
        return shouldSchoolConfigBeOpen();
    };

    const isMonthlyReportsActive = () => {
        return shouldMonthlyReportsBeOpen();
    };

    const SidebarContent = () => (
        <>
            {/* Sidebar Header */}
            <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-blue-700">
                <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-white/20 shadow-lg backdrop-blur-sm">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-white tracking-tight">MDM SEVA</h2>
                        <p className="text-xs text-blue-100 font-medium opacity-90">School Management</p>
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <nav className="p-4 overflow-y-auto flex-1 bg-white scrollbar-thin scrollbar-thumb-gray-300">
                {/* Dashboard */}
                <a
                    href="/dashboard"
                    className={`flex items-center px-4 py-3 rounded-xl mb-2 transition-all duration-200 font-medium ${isActive('dashboard')
                        ? 'bg-blue-50 text-blue-700 shadow-md shadow-blue-500/20'
                        : 'text-gray-700 hover:bg-gray-50 hover:text-blue-600'
                        }`}
                >
                    <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                    <span>Dashboard</span>
                </a>

                {/* School Configuration Dropdown */}
                <div className="mb-2">
                    <button
                        onClick={() => setIsSchoolConfigOpen(!isSchoolConfigOpen)}
                        className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 font-medium ${isSchoolConfigActive()
                            ? 'bg-blue-50 text-blue-700'
                            : 'text-gray-700 hover:bg-gray-50'
                            }`}
                    >
                        <div className="flex items-center">
                            <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                            <span>School Configuration</span>
                        </div>
                        <svg
                            className={`w-4 h-4 transition-transform duration-200 ${isSchoolConfigOpen ? 'rotate-180' : ''}`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                    </button>

                    {/* Submenu with animation */}
                    <div className={`overflow-hidden transition-all duration-300 ${isSchoolConfigOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}>
                        <div className="ml-4 mt-2 space-y-1 pl-4 border-l-2 border-gray-200">
                            {/* Roll Statement */}
                            <a
                                href="/roll-statements"
                                className={`flex items-center px-4 py-2.5 rounded-lg transition-all duration-200 ${currentRoute && currentRoute.startsWith('roll-statements')
                                    ? 'bg-blue-100 text-blue-700 font-medium'
                                    : 'text-gray-600 hover:bg-gray-50 hover:text-blue-600'
                                    }`}
                            >
                                <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                <span className="text-sm">Roll Statements</span>
                            </a>

                            {/* Rice Configuration */}
                            <a
                                href="/rice-configuration/create"
                                className={`flex items-center px-4 py-2.5 rounded-lg transition-all duration-200 ${currentRoute && currentRoute.startsWith('rice-configuration')
                                    ? 'bg-blue-100 text-blue-700 font-medium'
                                    : 'text-gray-600 hover:bg-gray-50 hover:text-blue-600'
                                    }`}
                            >
                                <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                                </svg>
                                <span className="text-sm">Rice Configuration</span>
                            </a>

                            {/* Amount Configuration */}
                            <a
                                href="/amount-config"
                                className={`flex items-center px-4 py-2.5 rounded-lg transition-all duration-200 ${currentRoute && currentRoute.startsWith('amount-config')
                                    ? 'bg-blue-100 text-blue-700 font-medium'
                                    : 'text-gray-600 hover:bg-gray-50 hover:text-blue-600'
                                    }`}
                            >
                                <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span className="text-sm">Amount Configuration</span>
                            </a>
                        </div>
                    </div>
                </div>

                {/* Daily Consumption */}
                <a
                    href="/daily-consumptions"
                    className={`flex items-center px-4 py-3 rounded-xl mb-2 transition-all duration-200 font-medium ${currentRoute && currentRoute.startsWith('daily-consumptions')
                        ? 'bg-blue-50 text-blue-700 shadow-md shadow-blue-500/20'
                        : 'text-gray-700 hover:bg-gray-50 hover:text-blue-600'
                        }`}
                >
                    <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                    </svg>
                    <span>Daily Consumption</span>
                </a>

                {/* Monthly Reports Dropdown */}
                <div className="mb-2">
                    <button
                        onClick={() => setIsMonthlyReportsOpen(!isMonthlyReportsOpen)}
                        className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 font-medium ${isMonthlyReportsActive()
                            ? 'bg-blue-50 text-blue-700'
                            : 'text-gray-700 hover:bg-gray-50'
                            }`}
                    >
                        <div className="flex items-center">
                            <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <span>Monthly Reports</span>
                        </div>
                        <svg
                            className={`w-4 h-4 transition-transform duration-200 ${isMonthlyReportsOpen ? 'rotate-180' : ''}`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                    </button>

                    {/* Submenu with animation */}
                    <div className={`overflow-hidden transition-all duration-300 ${isMonthlyReportsOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}>
                        <div className="ml-4 mt-2 space-y-1 border-l-2 border-gray-200 pl-4">
                            {/* Rice Report */}
                            <a
                                href="/rice-reports"
                                className={`flex items-center px-4 py-2.5 rounded-lg transition-all duration-200 ${currentRoute && currentRoute.startsWith('rice-reports')
                                    ? 'bg-blue-100 text-blue-700 font-medium'
                                    : 'text-gray-600 hover:bg-gray-50 hover:text-blue-600'
                                    }`}
                            >
                                <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                <span className="text-sm">Rice Report</span>
                            </a>

                            {/* Amount Report */}
                            <a
                                href="/amount-reports"
                                className={`flex items-center px-4 py-2.5 rounded-lg transition-all duration-200 ${currentRoute && currentRoute.startsWith('amount-reports')
                                    ? 'bg-blue-100 text-blue-700 font-medium'
                                    : 'text-gray-600 hover:bg-gray-50 hover:text-blue-600'
                                    }`}
                            >
                                <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span className="text-sm">Amount Report</span>
                            </a>
                        </div>
                    </div>
                </div>

                {/* Vendor Bills Section */}
                <div className="mb-2">
                    <div className="px-4 py-2 mb-1">
                        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center">
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                            Vendor Bills
                        </h3>
                    </div>
                    <div className="ml-4 space-y-2">
                        {/* Info Message */}
                        <div className="px-4 py-3 bg-blue-50 border border-blue-100 rounded-lg">
                            <div className="flex items-start space-x-2">
                                <svg className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <p className="text-xs text-blue-700 leading-relaxed">
                                    Bills are created within Amount Reports. First create or select an Amount Report, then add bills.
                                </p>
                            </div>
                        </div>
                        {/* Quick Access Buttons */}
                        <div className="space-y-1">
                            <a
                                href="/amount-reports"
                                className="flex items-center px-4 py-2.5 text-gray-600 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-all duration-200 group"
                            >
                                <svg className="w-4 h-4 mr-3 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                <span className="text-sm font-medium">View All Reports</span>
                                <svg className="w-3 h-3 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </a>
                            <a
                                href="/amount-reports/create"
                                className="flex items-center px-4 py-2.5 text-gray-600 hover:bg-green-50 hover:text-green-600 rounded-lg transition-all duration-200 group"
                            >
                                <svg className="w-4 h-4 mr-3 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                                <span className="text-sm font-medium">Create New Report</span>
                                <svg className="w-3 h-3 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </a>
                        </div>
                        {/* Bill Types Info */}
                        <div className="px-4 pt-2 space-y-1">
                            <div className="flex items-center text-xs text-gray-500">
                                <svg className="w-3 h-3 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                </svg>
                                <span>Kiryana Bills</span>
                            </div>
                            <div className="flex items-center text-xs text-gray-500">
                                <svg className="w-3 h-3 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                                <span>Fuel Bills</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Divider */}
                <div className="border-t border-gray-200 my-4"></div>

                {/* Documents Section */}
                <div className="px-4 mb-3">
                    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
                        </svg>
                        Documents
                    </h3>
                </div>

                <a
                    href="/user-guide"
                    className="flex items-center px-4 py-2.5 text-gray-600 hover:bg-gray-50 hover:text-blue-600 rounded-lg mb-1 transition-all duration-200 group"
                >
                    <svg className="w-4 h-4 mr-3 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                    <span className="text-sm font-medium">User Guide</span>
                </a>

                <a
                    href="/guidelines"
                    className="flex items-center px-4 py-2.5 text-gray-600 hover:bg-gray-50 hover:text-blue-600 rounded-lg mb-1 transition-all duration-200 group"
                >
                    <svg className="w-4 h-4 mr-3 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span className="text-sm font-medium">MDM Guidelines</span>
                </a>
            </nav>
        </>
    );

    return (
        <>
            {/* Mobile Menu Button - Fixed at top */}
            <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden fixed top-4 left-4 z-50 p-2.5 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 bg-white border border-gray-200 text-gray-700"
                aria-label="Toggle menu"
            >
                <svg
                    className={`w-6 h-6 transition-transform duration-300 ${isMobileMenuOpen ? 'rotate-90' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    {isMobileMenuOpen ? (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    ) : (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    )}
                </svg>
            </button>

            {/* Overlay for mobile */}
            {isMobileMenuOpen && (
                <div
                    className="lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity duration-300"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}

            {/* Desktop Sidebar */}
            <aside className="hidden lg:flex lg:flex-col w-full h-full shadow-xl bg-white border-r border-gray-200">
                <SidebarContent />
            </aside>

            {/* Mobile Sidebar */}
            <aside
                className={`lg:hidden fixed top-0 left-0 z-40 w-72 min-h-screen flex flex-col transform transition-transform duration-300 ease-in-out shadow-2xl bg-white ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
                    }`}
            >
                <SidebarContent />
            </aside>
        </>
    );
}