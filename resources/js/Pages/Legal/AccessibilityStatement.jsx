import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link } from '@inertiajs/react';

export default function AccessibilityStatement() {
    return (
        <GuestLayout>
            <Head title="Accessibility Statement" />
            <div className="min-h-screen py-12 bg-gray-50">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="bg-white shadow-sm rounded-lg overflow-hidden">
                        <div className="p-6 sm:p-10">
                            <h1 className="text-3xl font-bold text-gray-900 mb-6">
                                Accessibility Statement
                            </h1>

                            <div className="prose max-w-none text-gray-700">
                                <p className="text-lg mb-4">
                                    MDM SEVA Portal is committed to ensuring digital accessibility for people with
                                    disabilities. We are continually working to improve the user experience for
                                    everyone and apply relevant accessibility standards where possible.
                                </p>

                                <h2 className="text-2xl font-semibold mt-8 mb-3">Conformance Status</h2>
                                <p className="mb-4">
                                    Our goal is to conform to the Web Content Accessibility Guidelines (WCAG) 2.1
                                    Level AA. These guidelines explain how to make web content more accessible for
                                    people with disabilities.
                                </p>

                                <h2 className="text-2xl font-semibold mt-8 mb-3">Measures to Support Accessibility</h2>
                                <ul className="list-disc pl-6 space-y-2 mb-4">
                                    <li>Keyboard navigation support in forms and navigation.</li>
                                    <li>Clear form labels and inline error messages.</li>
                                    <li>Consistent layouts and navigation structure.</li>
                                    <li>Use of ARIA landmarks for main navigation and content.</li>
                                </ul>

                                <h2 className="text-2xl font-semibold mt-8 mb-3">Feedback</h2>
                                <p className="mb-4">
                                    We welcome your feedback on the accessibility of MDM SEVA Portal. If you
                                    encounter any barriers, please contact us:
                                </p>
                                <ul className="space-y-2 mb-4">
                                    <li>
                                        <strong>Email:</strong>{' '}
                                        <a
                                            href="mailto:accessibility@mdmseva.gov.in"
                                            className="text-blue-600 hover:text-blue-800 hover:underline"
                                        >
                                            accessibility@mdmseva.gov.in
                                        </a>
                                    </li>
                                    <li>
                                        <strong>Contact Form:</strong>{' '}
                                        <Link
                                            href="/contact"
                                            className="text-blue-600 hover:text-blue-800 hover:underline"
                                        >
                                            Contact Us
                                        </Link>
                                    </li>
                                </ul>

                                <h2 className="text-2xl font-semibold mt-8 mb-3">Technical Specifications</h2>
                                <p className="mb-4">
                                    The accessibility of the portal relies on the following technologies:
                                </p>
                                <ul className="list-disc pl-6 space-y-1 mb-6">
                                    <li>HTML5</li>
                                    <li>CSS3</li>
                                    <li>JavaScript (React/Inertia)</li>
                                    <li>WAI-ARIA where appropriate</li>
                                </ul>

                                <p className="text-sm text-gray-500 mt-8">
                                    <strong>Last Updated:</strong>{' '}
                                    {new Date().toLocaleDateString('en-IN', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric',
                                    })}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </GuestLayout>
    );
}
