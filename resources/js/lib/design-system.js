/**
 * Professional Design System for MDM SEVA Portal
 * Centralized theme tokens for consistent UI across all React components
 */

// Color Palette - Professional & Modern
export const colors = {
  // Primary Brand Colors
  primary: {
    50: '#f0f9ff',
    100: '#e0f2fe',
    200: '#bae6fd',
    300: '#7dd3fc',
    400: '#38bdf8',
    500: '#0ea5e9', // Main primary
    600: '#0284c7',
    700: '#0369a1',
    800: '#075985',
    900: '#0c4a6e',
  },
  
  // Secondary/Accent Colors
  secondary: {
    50: '#f8fafc',
    100: '#f1f5f9',
    200: '#e2e8f0',
    300: '#cbd5e1',
    400: '#94a3b8',
    500: '#64748b', // Main secondary
    600: '#475569',
    700: '#334155',
    800: '#1e293b',
    900: '#0f172a',
  },
  
  // Success/Positive Colors
  success: {
    50: '#f0fdf4',
    100: '#dcfce7',
    200: '#bbf7d0',
    300: '#86efac',
    400: '#4ade80',
    500: '#22c55e', // Main success
    600: '#16a34a',
    700: '#15803d',
    800: '#166534',
    900: '#14532d',
  },
  
  // Warning/Attention Colors
  warning: {
    50: '#fffbeb',
    100: '#fef3c7',
    200: '#fde68a',
    300: '#fcd34d',
    400: '#fbbf24',
    500: '#f59e0b', // Main warning
    600: '#d97706',
    700: '#b45309',
    800: '#92400e',
    900: '#78350f',
  },
  
  // Error/Danger Colors
  error: {
    50: '#fef2f2',
    100: '#fee2e2',
    200: '#fecaca',
    300: '#fca5a5',
    400: '#f87171',
    500: '#ef4444', // Main error
    600: '#dc2626',
    700: '#b91c1c',
    800: '#991b1b',
    900: '#7f1d1d',
  },
  
  // Information Colors
  info: {
    50: '#eff6ff',
    100: '#dbeafe',
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#3b82f6', // Main info
    600: '#2563eb',
    700: '#1d4ed8',
    800: '#1e40af',
    900: '#1e3a8a',
  },
  
  // Neutral Grays
  neutral: {
    50: '#fafafa',
    100: '#f4f4f5',
    200: '#e4e4e7',
    300: '#d4d4d8',
    400: '#a1a1aa',
    500: '#71717a', // Main neutral
    600: '#52525b',
    700: '#3f3f46',
    800: '#27272a',
    900: '#18181b',
  },
  
  // Background Colors
  background: {
    primary: '#ffffff',
    secondary: '#f8fafc',
    tertiary: '#f1f5f9',
    elevated: '#ffffff',
    overlay: 'rgba(0, 0, 0, 0.5)',
  },
  
  // Text Colors
  text: {
    primary: '#0f172a',
    secondary: '#475569',
    tertiary: '#64748b',
    quaternary: '#94a3b8',
    inverse: '#ffffff',
    muted: '#64748b',
  },
  
  // Border Colors
  border: {
    light: '#e2e8f0',
    medium: '#cbd5e1',
    strong: '#94a3b8',
    focus: '#0ea5e9',
  },
};

// Typography System
export const typography = {
  // Font Families
  fontFamily: {
    sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'Noto Sans', 'sans-serif'],
    mono: ['JetBrains Mono', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'Liberation Mono', 'Courier New', 'monospace'],
  },
  
  // Font Sizes
  fontSize: {
    xs: '0.75rem',    // 12px
    sm: '0.875rem',   // 14px
    base: '1rem',     // 16px
    lg: '1.125rem',   // 18px
    xl: '1.25rem',    // 20px
    '2xl': '1.5rem',  // 24px
    '3xl': '1.875rem', // 30px
    '4xl': '2.25rem', // 36px
    '5xl': '3rem',    // 48px
    '6xl': '3.75rem', // 60px
  },
  
  // Line Heights
  lineHeight: {
    tight: 1.25,
    normal: 1.5,
    relaxed: 1.75,
  },
  
  // Font Weights
  fontWeight: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    extrabold: 800,
  },
  
  // Letter Spacing
  letterSpacing: {
    tighter: '-0.05em',
    tight: '-0.025em',
    normal: '0em',
    wide: '0.025em',
    wider: '0.05em',
    widest: '0.1em',
  },
};

// Spacing System
export const spacing = {
  // Base spacing unit: 4px
  0: '0px',
  1: '0.25rem',   // 4px
  2: '0.5rem',    // 8px
  3: '0.75rem',   // 12px
  4: '1rem',      // 16px
  5: '1.25rem',   // 20px
  6: '1.5rem',    // 24px
  8: '2rem',      // 32px
  10: '2.5rem',   // 40px
  12: '3rem',     // 48px
  16: '4rem',     // 64px
  20: '5rem',     // 80px
  24: '6rem',     // 96px
  32: '8rem',     // 128px
};

// Border Radius System
export const borderRadius = {
  none: '0px',
  sm: '0.125rem',  // 2px
  DEFAULT: '0.25rem', // 4px
  md: '0.375rem',  // 6px
  lg: '0.5rem',    // 8px
  xl: '0.75rem',   // 12px
  '2xl': '1rem',   // 16px
  '3xl': '1.5rem', // 24px
  full: '9999px',
};

// Shadow System
export const shadows = {
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  DEFAULT: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
  '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
  inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
  none: 'none',
};

// Animation & Transitions
export const animations = {
  duration: {
    fast: '150ms',
    normal: '200ms',
    slow: '300ms',
    slower: '500ms',
  },
  easing: {
    DEFAULT: 'cubic-bezier(0.4, 0, 0.2, 1)',
    linear: 'linear',
    in: 'cubic-bezier(0.4, 0, 1, 1)',
    out: 'cubic-bezier(0, 0, 0.2, 1)',
    'in-out': 'cubic-bezier(0.4, 0, 0.2, 1)',
  },
};

// Breakpoints for Responsive Design
export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
};

// Z-Index System
export const zIndex = {
  hide: -1,
  auto: 'auto',
  base: 0,
  docked: 10,
  dropdown: 1000,
  sticky: 1100,
  banner: 1200,
  overlay: 1300,
  modal: 1400,
  popover: 1500,
  skipLink: 1600,
  toast: 1700,
  tooltip: 1800,
};

// Component-Specific Design Tokens
export const components = {
  // Button Variants
  button: {
    primary: {
      background: colors.primary[600],
      color: colors.text.inverse,
      hoverBackground: colors.primary[700],
      activeBackground: colors.primary[800],
      borderColor: colors.primary[600],
    },
    secondary: {
      background: colors.secondary[100],
      color: colors.secondary[700],
      hoverBackground: colors.secondary[200],
      activeBackground: colors.secondary[300],
      borderColor: colors.secondary[300],
    },
    success: {
      background: colors.success[600],
      color: colors.text.inverse,
      hoverBackground: colors.success[700],
      activeBackground: colors.success[800],
      borderColor: colors.success[600],
    },
    warning: {
      background: colors.warning[500],
      color: colors.text.primary,
      hoverBackground: colors.warning[600],
      activeBackground: colors.warning[700],
      borderColor: colors.warning[500],
    },
    error: {
      background: colors.error[600],
      color: colors.text.inverse,
      hoverBackground: colors.error[700],
      activeBackground: colors.error[800],
      borderColor: colors.error[600],
    },
    ghost: {
      background: 'transparent',
      color: colors.text.secondary,
      hoverBackground: colors.secondary[100],
      activeBackground: colors.secondary[200],
      borderColor: 'transparent',
    },
  },
  
  // Card Styles
  card: {
    background: colors.background.primary,
    borderColor: colors.border.light,
    borderRadius: borderRadius.lg,
    shadow: shadows.md,
    hoverShadow: shadows.lg,
    padding: spacing[6],
  },
  
  // Input Styles
  input: {
    background: colors.background.primary,
    borderColor: colors.border.medium,
    borderRadius: borderRadius.md,
    focusBorderColor: colors.border.focus,
    focusRingColor: colors.primary[200],
    placeholderColor: colors.text.tertiary,
  },
  
  // Navigation Styles
  navigation: {
    background: colors.background.primary,
    borderColor: colors.border.light,
    activeBackground: colors.primary[50],
    activeColor: colors.primary[600],
    hoverBackground: colors.secondary[50],
    hoverColor: colors.secondary[700],
  },
};

// Utility Functions for Design System
export const designUtils = {
  // Convert hex to RGB
  hexToRgb: (hex) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  },
  
  // Convert hex to RGBA
  hexToRgba: (hex, alpha) => {
    const rgb = designUtils.hexToRgb(hex);
    return rgb ? `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})` : null;
  },
  
  // Get contrasting text color
  getContrastColor: (hexColor) => {
    const rgb = designUtils.hexToRgb(hexColor);
    if (!rgb) return '#000000';
    
    const luminance = (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255;
    return luminance > 0.5 ? '#000000' : '#ffffff';
  },
  
  // Generate gradient classes
  getGradientClasses: (fromColor, toColor, direction = 'to-r') => {
    return `bg-gradient-${direction} ${fromColor} ${toColor}`;
  },
};

// Responsive Design Utilities
export const responsive = {
  // Mobile-first media queries
  mobile: '@media (min-width: 640px)',
  tablet: '@media (min-width: 768px)',
  desktop: '@media (min-width: 1024px)',
  large: '@media (min-width: 1280px)',
  
  // Container queries (when supported)
  container: {
    sm: '@container (min-width: 20rem)',
    md: '@container (min-width: 24rem)',
    lg: '@container (min-width: 32rem)',
  },
};

// Export all design tokens as default
export default {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
  animations,
  breakpoints,
  zIndex,
  components,
  designUtils,
  responsive,
};