import React from 'react';
import { Link } from '@inertiajs/react';

export default function Footer({ withSidebar = false }) {
    return (
        <footer
            role="contentinfo"
            className={`mt-auto py-8 bg-[#efeae2] text-amber-900 ${withSidebar ? 'lg:pl-[20%]' : ''}`}
        >
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 gap-8 md:grid-cols-3 mb-4">
                    <div>
                        <h3 className="font-semibold mb-2 text-amber-900">MDM SEVA Portal</h3>
                        <p className="text-sm text-stone-700">
                            Mid Day Meal Management System
                        </p>
                    </div>
                    <div>
                        <h3 className="font-semibold mb-2 text-amber-900">Quick Links</h3>
                        <ul className="space-y-1 text-sm">
                            <li>
                                <Link href="/about" className="text-amber-800 hover:text-amber-600 hover:underline transition-colors">
                                    About
                                </Link>
                            </li>
                            <li>
                                <Link href="/contact" className="text-amber-800 hover:text-amber-600 hover:underline transition-colors">
                                    Contact
                                </Link>
                            </li>
                            <li>
                                <Link href="/privacy-policy" className="text-amber-800 hover:text-amber-600 hover:underline transition-colors">
                                    Privacy Policy
                                </Link>
                            </li>
                            <li>
                                <Link href="/terms-of-service" className="text-amber-800 hover:text-amber-600 hover:underline transition-colors">
                                    Terms of Service
                                </Link>
                            </li>
                            <li>
                                <Link href="/accessibility-statement" className="text-amber-800 hover:text-amber-600 hover:underline transition-colors">
                                    Accessibility
                                </Link>
                            </li>
                        </ul>
                    </div>
                    <div>
                        <h3 className="font-semibold mb-2 text-amber-900">Contact</h3>
                        <p className="text-sm text-stone-700">
                            Email:{' '}
                            <a
                                href="mailto:talibilal342@gmail.com"
                                className="text-amber-800 hover:text-amber-600 hover:underline transition-colors"
                            >
                                talibilal342@gmail.com
                            </a>
                        </p>
                    </div>
                </div>
                <div className="pt-4 border-t border-amber-300 text-center text-sm text-amber-800">
                    &copy; {new Date().getFullYear()} MDM SEVA Portal. All rights reserved.
                </div>
            </div>
        </footer>
    );
}
