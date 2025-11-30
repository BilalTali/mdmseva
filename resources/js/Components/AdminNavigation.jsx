import { useState } from 'react';
import { Link, usePage, router } from '@inertiajs/react';
import Dropdown from '@/Components/Dropdown';


export default function AdminNavigation({ user }) {
    const [showingNavigationDropdown, setShowingNavigationDropdown] = useState(false);
    const { url } = usePage();

    const isActive = (routeName) => {
        return url.startsWith(routeName);
    };

    return (
        <nav className="bg-primary-800 border-b border-primary-900 transition-colors duration-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex">
                        {/* Logo */}
                        <div className="shrink-0 flex items-center">
                            <Link href={route('admin.dashboard')} className="text-white font-bold text-xl flex items-center gap-2">
                                <span className="bg-white/10 p-1.5 rounded-lg">MDM</span>
                                <span>Admin</span>
                            </Link>
                        </div>

                        {/* Desktop Navigation Links */}
                        <div className="hidden space-x-8 sm:-my-px sm:ml-10 sm:flex">
                            <Link
                                href={route('admin.dashboard')}
                                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium leading-5 transition duration-150 ease-in-out ${isActive('/admin/dashboard')
                                    ? 'border-white text-white'
                                    : 'border-transparent text-primary-200 hover:text-white hover:border-primary-300'
                                    }`}
                            >
                                Dashboard
                            </Link>

                            <Link
                                href={route('admin.schools.index')}
                                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium leading-5 transition duration-150 ease-in-out ${isActive('/admin/schools')
                                    ? 'border-white text-white'
                                    : 'border-transparent text-primary-200 hover:text-white hover:border-primary-300'
                                    }`}
                            >
                                Schools
                            </Link>

                            {/* Reports Dropdown */}
                            <div className="inline-flex items-center">
                                <Dropdown>
                                    <Dropdown.Trigger>
                                        <button className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium leading-5 text-primary-200 hover:text-white hover:border-primary-300 transition duration-150 ease-in-out">
                                            <span>Reports</span>
                                            <svg
                                                className="ml-2 -mr-0.5 h-4 w-4"
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
                                    </Dropdown.Trigger>

                                    <Dropdown.Content>
                                        <Dropdown.Link href="/admin/rice-reports">
                                            Rice Reports
                                        </Dropdown.Link>
                                        <Dropdown.Link href="/admin/amount-reports">
                                            Amount Reports
                                        </Dropdown.Link>
                                        <Dropdown.Link href="/admin/daily-consumptions">
                                            Daily Consumptions
                                        </Dropdown.Link>
                                        <Dropdown.Link href="/admin/bills">
                                            Bills
                                        </Dropdown.Link>
                                    </Dropdown.Content>
                                </Dropdown>
                            </div>

                            <Link
                                href={route('admin.ai-config.index')}
                                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium leading-5 transition duration-150 ease-in-out ${isActive('/admin/ai-config')
                                    ? 'border-white text-white'
                                    : 'border-transparent text-primary-200 hover:text-white hover:border-primary-300'
                                    }`}
                            >
                                AI Config
                            </Link>

                            <Link
                                href={route('admin.developer-messages.index')}
                                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium leading-5 transition duration-150 ease-in-out ${isActive('/admin/developer-messages')
                                    ? 'border-white text-white'
                                    : 'border-transparent text-primary-200 hover:text-white hover:border-primary-300'
                                    }`}
                            >
                                Messages
                            </Link>
                        </div>
                    </div>

                    {/* User Dropdown */}
                    <div className="hidden sm:flex sm:items-center sm:ml-6 gap-4">


                        <div className="flex items-center">
                            <span className="bg-primary-700 text-white text-xs font-semibold px-2.5 py-1 rounded mr-3 border border-primary-600">
                                Admin
                            </span>
                            <Dropdown>
                                <Dropdown.Trigger>
                                    <button className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white hover:bg-primary-700 focus:outline-none transition-all ease-in-out duration-150">
                                        {user.name}
                                        <svg
                                            className="ml-2 -mr-0.5 h-4 w-4"
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
                                </Dropdown.Trigger>

                                <Dropdown.Content>
                                    <Dropdown.Link href={route('profile.edit')}>Profile</Dropdown.Link>
                                    <button
                                        onClick={(e) => {
                                            e.preventDefault();
                                            router.post(route('logout'));
                                        }}
                                        className="block w-full text-left px-4 py-2 text-sm leading-5 text-secondary-700 hover:bg-secondary-100 focus:outline-none focus:bg-secondary-100 transition duration-150 ease-in-out"
                                    >
                                        Log Out
                                    </button>
                                </Dropdown.Content>
                            </Dropdown>
                        </div>
                    </div>

                    {/* Hamburger (Mobile) */}
                    <div className="-mr-2 flex items-center sm:hidden gap-2">

                        <button
                            onClick={() => setShowingNavigationDropdown((prev) => !prev)}
                            className="inline-flex items-center justify-center p-2 rounded-md text-primary-200 hover:text-white hover:bg-primary-700 focus:outline-none focus:bg-primary-700 focus:text-white transition duration-150 ease-in-out"
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
            <div className={(showingNavigationDropdown ? 'block' : 'hidden') + ' sm:hidden bg-primary-800'}>
                <div className="pt-2 pb-3 space-y-1">
                    <Link
                        href={route('admin.dashboard')}
                        className="block w-full pl-3 pr-4 py-2 border-l-4 text-left text-base font-medium text-primary-200 hover:text-white hover:bg-primary-700 hover:border-white focus:outline-none focus:text-white focus:bg-primary-700 focus:border-white transition duration-150 ease-in-out"
                    >
                        Dashboard
                    </Link>
                    <Link
                        href={route('admin.schools.index')}
                        className="block w-full pl-3 pr-4 py-2 border-l-4 text-left text-base font-medium text-primary-200 hover:text-white hover:bg-primary-700 hover:border-white focus:outline-none focus:text-white focus:bg-primary-700 focus:border-white transition duration-150 ease-in-out"
                    >
                        Schools
                    </Link>
                    <div className="pl-3 pr-4 py-2 text-xs font-semibold text-primary-300 uppercase tracking-wide">
                        Reports
                    </div>
                    <Link
                        href="/admin/rice-reports"
                        className="block w-full pl-6 pr-4 py-2 border-l-4 text-left text-base font-medium text-primary-200 hover:text-white hover:bg-primary-700 hover:border-white focus:outline-none focus:text-white focus:bg-primary-700 focus:border-white transition duration-150 ease-in-out"
                    >
                        Rice Reports
                    </Link>
                    <Link
                        href="/admin/amount-reports"
                        className="block w-full pl-6 pr-4 py-2 border-l-4 text-left text-base font-medium text-primary-200 hover:text-white hover:bg-primary-700 hover:border-white focus:outline-none focus:text-white focus:bg-blue-700 focus:border-white transition duration-150 ease-in-out"
                    >
                        Amount Reports
                    </Link>
                    <Link
                        href="/admin/daily-consumptions"
                        className="block w-full pl-6 pr-4 py-2 border-l-4 text-left text-base font-medium text-primary-200 hover:text-white hover:bg-primary-700 hover:border-white focus:outline-none focus:text-white focus:bg-blue-700 focus:border-white transition duration-150 ease-in-out"
                    >
                        Daily Consumptions
                    </Link>
                    <Link
                        href="/admin/bills"
                        className="block w-full pl-6 pr-4 py-2 border-l-4 text-left text-base font-medium text-primary-200 hover:text-white hover:bg-primary-700 hover:border-white focus:outline-none focus:text-white focus:bg-blue-700 focus:border-white transition duration-150 ease-in-out"
                    >
                        Bills
                    </Link>
                    <Link
                        href={route('admin.ai-config.index')}
                        className="block w-full pl-3 pr-4 py-2 border-l-4 text-left text-base font-medium text-primary-200 hover:text-white hover:bg-primary-700 hover:border-white focus:outline-none focus:text-white focus:bg-blue-700 focus:border-white transition duration-150 ease-in-out"
                    >
                        AI Configuration
                    </Link>
                    <Link
                        href={route('admin.developer-messages.index')}
                        className="block w-full pl-3 pr-4 py-2 border-l-4 text-left text-base font-medium text-primary-200 hover:text-white hover:bg-primary-700 hover:border-white focus:outline-none focus:text-white focus:bg-blue-700 focus:border-white transition duration-150 ease-in-out"
                    >
                        Developer Messages
                    </Link>
                </div>

                {/* Mobile User Section */}
                <div className="pt-4 pb-1 border-t border-primary-700">
                    <div className="px-4">
                        <div className="font-medium text-base text-white flex items-center">
                            {user.name}
                            <span className="ml-2 bg-primary-600 text-white text-xs font-semibold px-2 py-0.5 rounded">
                                Admin
                            </span>
                        </div>
                        <div className="font-medium text-sm text-primary-300">{user.email}</div>
                    </div>

                    <div className="mt-3 space-y-1">
                        <Link
                            href={route('profile.edit')}
                            className="block w-full pl-3 pr-4 py-2 border-l-4 text-left text-base font-medium text-primary-200 hover:text-white hover:bg-primary-700 hover:border-white focus:outline-none focus:text-white focus:bg-primary-700 focus:border-white transition duration-150 ease-in-out"
                        >
                            Profile
                        </Link>
                        <button
                            onClick={() => router.post(route('logout'))}
                            className="block w-full pl-3 pr-4 py-2 border-l-4 text-left text-base font-medium text-primary-200 hover:text-white hover:bg-primary-700 hover:border-white focus:outline-none focus:text-white focus:bg-primary-700 focus:border-white transition duration-150 ease-in-out"
                        >
                            Log Out
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    );
}