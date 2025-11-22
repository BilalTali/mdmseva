import ApplicationLogo from '@/Components/ApplicationLogo';
import Dropdown from '@/Components/Dropdown';
import ResponsiveNavLink from '@/Components/ResponsiveNavLink';
import { Link, usePage, router } from '@inertiajs/react';
import { useState } from 'react';
import Sidebar from '@/Components/Sidebar';
import AdminNavigation from '@/Components/AdminNavigation';


export default function AuthenticatedLayout({ header, children }) {
    const { auth } = usePage().props;
    const user = auth.user;
    const [showingNavigationDropdown, setShowingNavigationDropdown] = useState(false);

    // Check if user is admin using shared flag
    const isAdmin = auth.isAdmin === true;

    // If admin, render admin layout
    if (isAdmin) {
        return (
            <div className="min-h-screen bg-secondary-50">
                <AdminNavigation user={user} />

                {header && (
                    <header className="bg-card shadow-sm border-b border-secondary-200">
                        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                            {header}
                        </div>
                    </header>
                )}

                <main className="min-h-screen bg-secondary-50">
                    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                        {children}
                    </div>
                </main>
            </div>
        );
    }

    // School user layout (existing layout)
    return (
        <div className="min-h-screen bg-secondary-50 flex flex-col">
            {/* Skip to main content link */}
            <a
                href="#main-content"
                className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary-600 focus:text-white focus:rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
                Skip to main content
            </a>

            {/* Top Navigation Bar */}
            <nav
                className="bg-[var(--surface-00)] border-b border-[var(--border-light)] sticky top-0 z-40 transition-colors duration-200"
                role="navigation"
                aria-label="Main navigation"
            >
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex h-16 justify-between">
                        <div className="flex items-center">
                            <Link href="/" className="flex items-center gap-3 group">
                                <div className="bg-[var(--primary-50)] p-1.5 rounded-lg hover:bg-[var(--primary-100)] transition-colors">
                                    <ApplicationLogo className="block h-8 w-auto fill-current text-[var(--primary-600)]" />
                                </div>
                                <span className="text-xl font-bold text-[var(--text-primary)] tracking-tight">
                                    MDM <span className="text-[var(--primary-600)]">SEVA</span>
                                </span>
                            </Link>
                        </div>

                        {/* Desktop User Dropdown */}
                        <div className="hidden sm:ms-6 sm:flex sm:items-center gap-4">


                            <div className="relative ms-3">
                                <Dropdown>
                                    <Dropdown.Trigger>
                                        <span className="inline-flex rounded-md">
                                            <button
                                                type="button"
                                                className="inline-flex items-center gap-2 rounded-full border border-transparent px-3 py-2 text-sm font-medium leading-4 transition duration-150 ease-in-out focus:outline-none text-[var(--text-secondary)] bg-[var(--surface-00)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-10)]"
                                            >
                                                <div className="w-8 h-8 rounded-full bg-[var(--primary-100)] flex items-center justify-center text-[var(--primary-700)] font-bold">
                                                    {user.name.charAt(0)}
                                                </div>
                                                <span className="hidden md:inline-block">{user.name}</span>
                                                <svg
                                                    className="-me-0.5 ms-2 h-4 w-4 text-secondary-400"
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    viewBox="0 0 20 20"
                                                    fill="currentColor"
                                                >
                                                    <path
                                                        fillRule="evenodd"
                                                        d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                                                        clipRule="evenodd"
                                                    />
                                                </svg>
                                            </button>
                                        </span>
                                    </Dropdown.Trigger>

                                    <Dropdown.Content>
                                        <div className="px-4 py-3 border-b border-[var(--border-light)]">
                                            <p className="text-sm font-medium text-[var(--text-primary)] truncate">{user.name}</p>
                                            <p className="text-xs text-[var(--text-secondary)] truncate">{user.email}</p>
                                        </div>
                                        <Dropdown.Link href={route('profile.edit')}>
                                            Profile Settings
                                        </Dropdown.Link>
                                        <Dropdown.Link href={route('logout')} method="post" as="button">
                                            Log Out
                                        </Dropdown.Link>
                                    </Dropdown.Content>
                                </Dropdown>
                            </div>
                        </div>

                        {/* Mobile menu button */}
                        <div className="-me-2 flex items-center sm:hidden gap-2">

                            <button
                                onClick={() => setShowingNavigationDropdown(!showingNavigationDropdown)}
                                className="inline-flex items-center justify-center rounded-md p-2 transition duration-150 ease-in-out text-[var(--text-secondary)] hover:bg-[var(--surface-10)] hover:text-[var(--text-primary)] focus:bg-[var(--surface-10)] focus:text-[var(--text-primary)] focus:outline-none"
                            >
                                <svg className="h-6 w-6" stroke="currentColor" fill="none" viewBox="0 0 24 24">
                                    <path
                                        className={!showingNavigationDropdown ? 'inline-flex' : 'hidden'}
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M4 6h16M4 12h16M4 18h16"
                                    />
                                    <path
                                        className={showingNavigationDropdown ? 'inline-flex' : 'hidden'}
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M6 18L18 6M6 6l12 12"
                                    />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile Navigation Menu */}
                <div className={(showingNavigationDropdown ? 'block' : 'hidden') + ' sm:hidden bg-[var(--surface-00)] border-b border-[var(--border-light)]'}>
                    <div className="space-y-1 pb-3 pt-2">
                        <ResponsiveNavLink
                            href={route('dashboard')}
                            active={route().current('dashboard')}
                        >
                            Dashboard
                        </ResponsiveNavLink>
                    </div>

                    <div className="border-t border-[var(--border-light)] pb-1 pt-4">
                        <div className="px-4 flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-[var(--primary-100)] flex items-center justify-center text-[var(--primary-700)] font-bold text-lg">
                                {user.name.charAt(0)}
                            </div>
                            <div>
                                <div className="text-base font-medium text-[var(--text-primary)]">
                                    {user.name}
                                </div>
                                <div className="text-sm font-medium text-[var(--text-secondary)]">
                                    {user.email}
                                </div>
                            </div>
                        </div>

                        <div className="mt-3 space-y-1">
                            <ResponsiveNavLink href={route('profile.edit')}>
                                Profile
                            </ResponsiveNavLink>
                            <ResponsiveNavLink method="post" href={route('logout')} as="button">
                                Log Out
                            </ResponsiveNavLink>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Main Content with Fixed Sidebar (20% sidebar, 80% content on large screens) */}
            <div className="flex overflow-x-hidden flex-1 lg:pl-[20%]">
                {/* Sidebar container: fixed on large screens, mobile menu on small screens */}
                <div className="lg:fixed lg:left-0 lg:top-16 lg:h-[calc(100vh-4rem)] lg:w-[20%] lg:overflow-y-auto">
                    <Sidebar currentRoute={route().current()} />
                </div>

                {/* Main Content Area */}
                <div className="flex-1 min-w-0 overflow-x-hidden">
                    {header && (
                        <header className="bg-card shadow-sm border-b border-secondary-200">
                            <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                                {header}
                            </div>
                        </header>
                    )}

                    <main
                        id="main-content"
                        role="main"
                        className="min-h-screen bg-secondary-50"
                    >
                        {children}
                    </main>
                </div>
            </div>
            {/* Footer */}
            <footer
                role="contentinfo"
                className="mt-auto py-8 lg:pl-[20%] bg-gradient-to-br from-amber-900 via-amber-950 to-amber-900 text-gray-200"
            >
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 gap-8 md:grid-cols-3 mb-4">
                        <div>
                            <h3 className="font-semibold mb-2 text-white">MDM SEVA Portal</h3>
                            <p className="text-sm text-gray-400">
                                Mid Day Meal Management System
                            </p>
                        </div>
                        <div>
                            <h3 className="font-semibold mb-2 text-white">Quick Links</h3>
                            <ul className="space-y-1 text-sm">
                                <li>
                                    <Link href="/about" className="text-gray-300 hover:text-amber-400 hover:underline transition-colors">
                                        About
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/contact" className="text-gray-300 hover:text-amber-400 hover:underline transition-colors">
                                        Contact
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/privacy-policy" className="text-gray-300 hover:text-amber-400 hover:underline transition-colors">
                                        Privacy Policy
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/terms-of-service" className="text-gray-300 hover:text-amber-400 hover:underline transition-colors">
                                        Terms of Service
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/accessibility-statement" className="text-gray-300 hover:text-amber-400 hover:underline transition-colors">
                                        Accessibility
                                    </Link>
                                </li>
                            </ul>
                        </div>
                        <div>
                            <h3 className="font-semibold mb-2 text-white">Contact</h3>
                            <p className="text-sm text-gray-300">
                                Email:{' '}
                                <a
                                    href="mailto:support@mdmseva.gov.in"
                                    className="hover:text-amber-400 hover:underline transition-colors"
                                >
                                    support@mdmseva.gov.in
                                </a>
                            </p>
                        </div>
                    </div>
                    <div className="pt-4 border-t border-amber-700/70 text-center text-sm text-gray-400">
                        &copy; {new Date().getFullYear()} MDM SEVA Portal. All rights reserved.
                    </div>
                </div>
            </footer>
        </div>
    );
}