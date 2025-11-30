import AuthLogo from '@/Components/AuthLogo';
import { Link } from '@inertiajs/react';
import ThemeToggle from '@/Components/ThemeToggle';

export default function GuestLayout({ children }) {
    return (
        <div className="min-h-screen flex flex-col sm:justify-center items-center pt-6 sm:pt-0 bg-[var(--bg-secondary)] transition-colors duration-200 relative">
            <div className="absolute top-4 right-4">
                <ThemeToggle />
            </div>

            <div>
                <Link href="/" aria-label="Go to homepage">
                    <AuthLogo className="w-48" />
                </Link>
            </div>

            <div className="w-full sm:max-w-md mt-6 px-6 py-4 bg-[var(--surface-00)] shadow-[var(--elevation-2)] overflow-hidden sm:rounded-lg border border-[var(--border-light)] transition-colors duration-200">
                {children}
            </div>
        </div>
    );
}