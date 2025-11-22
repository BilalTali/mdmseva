import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link } from '@inertiajs/react';

export default function NotFound() {
    return (
        <GuestLayout>
            <Head title="Page Not Found" />
            <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-md w-full text-center">
                    <h1 className="text-6xl md:text-7xl font-bold text-primary-600">404</h1>
                    <h2 className="mt-4 text-2xl md:text-3xl font-bold text-gray-900">
                        Page Not Found
                    </h2>
                    <p className="mt-4 text-gray-600">
                        Sorry, we couldn't find the page you're looking for. It may have been moved or deleted.
                    </p>
                    <div className="mt-8 space-x-4">
                        <Link
                            href="/"
                            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
                        >
                            Go Home
                        </Link>
                        <Link
                            href="/contact"
                            className="inline-flex items-center px-6 py-3 border border-secondary-300 text-base font-medium rounded-md text-secondary-700 bg-white hover:bg-secondary-50"
                        >
                            Contact Support
                        </Link>
                    </div>
                </div>
            </div>
        </GuestLayout>
    );
}
