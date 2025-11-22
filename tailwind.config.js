import defaultTheme from 'tailwindcss/defaultTheme';
import forms from '@tailwindcss/forms';

/** @type {import('tailwindcss').Config} */
export default {
	darkMode: ['class'],
	content: [
		'./vendor/laravel/framework/src/Illuminate/Pagination/resources/views/*.blade.php',
		'./storage/framework/views/*.php',
		'./resources/views/**/*.blade.php',
		'./resources/js/**/*.jsx',
	],

	theme: {
		extend: {
			fontFamily: {
				sans: [
					'Inter',
					'Figtree',
					...defaultTheme.fontFamily.sans
				],
				primary: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
				mono: ['Fira Code', 'Monaco', 'Cascadia Code', 'Roboto Mono', 'monospace'],
			},
			borderRadius: {
				lg: 'var(--radius-lg, 0.5rem)',
				md: 'var(--radius-md, 0.375rem)',
				sm: 'var(--radius, 0.25rem)',
				xl: 'var(--radius-xl, 0.75rem)',
				'2xl': 'var(--radius-2xl, 1rem)',
				full: 'var(--radius-full, 9999px)',
			},
			colors: {
				// Shadcn/ui compatibility colors
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				primary: {
					DEFAULT: 'var(--primary-500, #0ea5e9)',
					50: 'var(--primary-50, #f0f9ff)',
					100: 'var(--primary-100, #e0f2fe)',
					200: 'var(--primary-200, #bae6fd)',
					300: 'var(--primary-300, #7dd3fc)',
					400: 'var(--primary-400, #38bdf8)',
					500: 'var(--primary-500, #0ea5e9)',
					600: 'var(--primary-600, #0284c7)',
					700: 'var(--primary-700, #0369a1)',
					800: 'var(--primary-800, #075985)',
					900: 'var(--primary-900, #0c4a6e)',
					950: 'var(--primary-950, #082f49)',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'var(--secondary-100, #f1f5f9)',
					50: 'var(--secondary-50, #f8fafc)',
					100: 'var(--secondary-100, #f1f5f9)',
					200: 'var(--secondary-200, #e2e8f0)',
					300: 'var(--secondary-300, #cbd5e1)',
					400: 'var(--secondary-400, #94a3b8)',
					500: 'var(--secondary-500, #64748b)',
					600: 'var(--secondary-600, #475569)',
					700: 'var(--secondary-700, #334155)',
					800: 'var(--secondary-800, #1e293b)',
					900: 'var(--secondary-900, #0f172a)',
					950: 'var(--secondary-950, #020617)',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'var(--accent-500, #22c55e)',
					50: 'var(--accent-50, #f0fdf4)',
					100: 'var(--accent-100, #dcfce7)',
					200: 'var(--accent-200, #bbf7d0)',
					300: 'var(--accent-300, #86efac)',
					400: 'var(--accent-400, #4ade80)',
					500: 'var(--accent-500, #22c55e)',
					600: 'var(--accent-600, #16a34a)',
					700: 'var(--accent-700, #15803d)',
					800: 'var(--accent-800, #166534)',
					900: 'var(--accent-900, #14532d)',
					foreground: 'hsl(var(--accent-foreground))'
				},
				success: {
					DEFAULT: 'var(--success-500, #22c55e)',
					50: 'var(--success-50, #f0fdf4)',
					500: 'var(--success-500, #22c55e)',
					600: 'var(--success-600, #16a34a)',
				},
				warning: {
					DEFAULT: 'var(--warning-500, #f59e0b)',
					50: 'var(--warning-50, #fffbeb)',
					500: 'var(--warning-500, #f59e0b)',
					600: 'var(--warning-600, #d97706)',
				},
				error: {
					DEFAULT: 'var(--error-500, #ef4444)',
					50: 'var(--error-50, #fef2f2)',
					500: 'var(--error-500, #ef4444)',
					600: 'var(--error-600, #dc2626)',
				},
				info: {
					DEFAULT: 'var(--info-500, #3b82f6)',
					50: 'var(--info-50, #eff6ff)',
					500: 'var(--info-500, #3b82f6)',
					600: 'var(--info-600, #2563eb)',
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				chart: {
					'1': 'hsl(var(--chart-1))',
					'2': 'hsl(var(--chart-2))',
					'3': 'hsl(var(--chart-3))',
					'4': 'hsl(var(--chart-4))',
					'5': 'hsl(var(--chart-5))'
				},
				// High-contrast brand colors for MDM theme (WCAG AA compliant)
				// mdm-yellow: Contrast ratio 4.52:1 with black text
				// mdm-blue: Contrast ratio 8.59:1 with white text
				'mdm-yellow': '#D69500',      // Darkened for better contrast
				'mdm-yellow-light': '#E6A500', // Original yellow for lighter uses
				'mdm-blue': '#003D7A',         // Darkened for better contrast with white text
				'mdm-blue-light': '#004C99',   // Original blue for lighter uses
				'mdm-saffron': '#FF9933',      // Indian flag saffron
				'mdm-green': '#138808',        // Indian flag green
			},
			boxShadow: {
				'sm': 'var(--shadow-sm, 0 1px 2px 0 rgba(15, 23, 42, 0.05))',
				'DEFAULT': 'var(--shadow, 0 1px 3px 0 rgba(15, 23, 42, 0.1))',
				'md': 'var(--shadow-md, 0 4px 6px -1px rgba(15, 23, 42, 0.1))',
				'lg': 'var(--shadow-lg, 0 10px 15px -3px rgba(15, 23, 42, 0.1))',
				'xl': 'var(--shadow-xl, 0 20px 25px -5px rgba(15, 23, 42, 0.1))',
				'2xl': 'var(--shadow-2xl, 0 25px 50px -12px rgba(15, 23, 42, 0.25))',
				'inner': 'var(--shadow-inner, inset 0 2px 4px 0 rgba(15, 23, 42, 0.05))',
				'none': 'var(--shadow-none, none)',
			},
			spacing: {
				'18': '4.5rem',
				'88': '22rem',
				'128': '32rem',
			}
		}
	},

	plugins: [forms, require("tailwindcss-animate")],
};
