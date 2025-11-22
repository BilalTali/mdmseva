import { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext({
    theme: 'light',
    toggleTheme: () => { },
    setTheme: () => { },
});

export function ThemeProvider({ children }) {
    const [theme, setThemeState] = useState(() => {
        // Check localStorage first
        if (typeof window !== 'undefined') {
            const stored = localStorage.getItem('mdm-theme');
            if (stored && (stored === 'light' || stored === 'dark')) {
                return stored;
            }

            // Check system preference
            if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
                return 'dark';
            }
        }
        return 'light';
    });

    useEffect(() => {
        const root = window.document.documentElement;

        // Remove both classes first
        root.classList.remove('light', 'dark');

        // Add current theme class (for backward compatibility)
        root.classList.add(theme);

        // Set data-theme attribute (preferred method for CSS variable scoping)
        root.setAttribute('data-theme', theme);

        // Store in localStorage
        localStorage.setItem('mdm-theme', theme);

        // Debug mode: expose theme to window for development
        if (import.meta.env.DEV) {
            window.__THEME__ = theme;
        }
    }, [theme]);

    // Listen for system theme changes
    useEffect(() => {
        // Only listen if user hasn't explicitly set a preference
        const hasExplicitPreference = localStorage.getItem('mdm-theme');
        if (hasExplicitPreference) return;

        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

        const handleChange = (e) => {
            setThemeState(e.matches ? 'dark' : 'light');
        };

        // Modern browsers
        if (mediaQuery.addEventListener) {
            mediaQuery.addEventListener('change', handleChange);
            return () => mediaQuery.removeEventListener('change', handleChange);
        }
        // Legacy browsers
        else if (mediaQuery.addListener) {
            mediaQuery.addListener(handleChange);
            return () => mediaQuery.removeListener(handleChange);
        }
    }, []);

    const setTheme = (newTheme) => {
        if (newTheme !== 'light' && newTheme !== 'dark') {
            console.warn(`Invalid theme "${newTheme}". Must be "light" or "dark". Defaulting to "light".`);
            setThemeState('light');
            return;
        }
        setThemeState(newTheme);
    };

    const toggleTheme = () => {
        setThemeState(prev => prev === 'light' ? 'dark' : 'light');
    };

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
}

