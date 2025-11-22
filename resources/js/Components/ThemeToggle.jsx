import { Moon, Sun } from 'lucide-react';
import { useTheme } from '@/Contexts/ThemeContext';

export default function ThemeToggle({ className = '' }) {
    const { theme, toggleTheme } = useTheme();

    const handleKeyDown = (e) => {
        // Support Enter and Space keys for accessibility
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            toggleTheme();
        }
    };

    return (
        <button
            onClick={toggleTheme}
            onKeyDown={handleKeyDown}
            className={`relative inline-flex items-center justify-center rounded-lg p-2 transition-all duration-200 hover:bg-secondary-100 dark:hover:bg-secondary-800 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 focus:ring-offset-2 ${className}`}
            aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            aria-pressed={theme === 'dark'}
            title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            type="button"
            role="switch"
            aria-checked={theme === 'dark'}
        >
            <span className="sr-only">
                {theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
            </span>
            {theme === 'light' ? (
                <Moon className="h-5 w-5 text-secondary-700 dark:text-secondary-300 transition-transform duration-200 hover:scale-110" />
            ) : (
                <Sun className="h-5 w-5 text-yellow-400 transition-all duration-200 hover:scale-110 hover:rotate-90" />
            )}
        </button>
    );
}
