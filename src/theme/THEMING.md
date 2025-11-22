# Theming Guide for MDM Seva

This document explains how the theme system works in MDM Seva and how to use it effectively in your components.

## Table of Contents

1. [Overview](#overview)
2. [Quick Start](#quick-start)
3. [Using the Theme in Components](#using-the-theme-in-components)
4. [CSS Variables Reference](#css-variables-reference)
5. [Working with Charts](#working-with-charts)
6. [Adding New Tokens](#adding-new-tokens)
7. [Best Practices](#best-practices)

## Overview

MDM Seva uses a centralized theme system with:
- **CSS Custom Properties** (variables) for all design tokens
- **React Context** (`ThemeProvider`) for theme state management
- **localStorage** persistence for user preferences
- **System preference detection** (`prefers-color-scheme`)
- **400+ design tokens** covering colors, typography, spacing, shadows, and more

## Quick Start

### 1. Use the theme hook in React components

```jsx
import { useTheme } from '@/Contexts/ThemeContext';

function MyComponent() {
  const { theme, toggleTheme, setTheme } = useTheme();
  
  return (
    <div>
      <p>Current theme: {theme}</p>
      <button onClick={toggleTheme}>Toggle Theme</button>
    </div>
  );
}
```

### 2. Use CSS variables in styles

```jsx
// Using Tailwind with CSS variables
<div className="bg-[var(--bg-primary)] text-[var(--text-primary)]">
  Content
</div>

// Or create utility classes
<div className="surface-primary">
  Content
</div>
```

```css
/* In your CSS */
.surface-primary {
  background-color: var(--surface-00);
  color: var(--text-primary);
  border: 1px solid var(--border-light);
}
```

### 3. For charts and runtime colors

```jsx
import { useChartColors } from '@/../../src/components/charts/ChartWrapper';
import { BarChart, Bar } from 'recharts';

function MyChart() {
  const colors = useChartColors();
  
  return (
    <BarChart data={data}>
      <Bar dataKey="value" fill={colors[0]} />
      <Bar dataKey="value2" fill={colors[1]} />
    </BarChart>
  );
}
```

## Using the Theme in Components

### React Context API

The `ThemeProvider` wraps your entire app (in `app.jsx`) and provides:

- `theme`: Current theme (`'light'` or `'dark'`)
- `setTheme(newTheme)`: Set theme explicitly
- `toggleTheme()`: Toggle between light and dark

### Accessing Runtime Colors

For components that need actual color values (not just CSS variables):

```javascript
import { getCssVar, getThemeColors, getChartColors } from '@/../../src/theme/themeClient';

// Get a single CSS variable
const primaryColor = getCssVar('--primary-500'); // "#0ea5e9"

// Get all theme colors as an object
const colors = getThemeColors();
console.log(colors.primary, colors.success, colors.textPrimary);

// Get chart-specific colors (array of 6)
const chartPalette = getChartColors(); // ["#7C5CFF", "#06B6D4", ...]
```

### Subscribing to Theme Changes

For components that need to react to theme changes:

```javascript
import { subscribeToThemeChange } from '@/../../src/theme/themeClient';

useEffect(() => {
  const unsubscribe = subscribeToThemeChange((newTheme) => {
    console.log('Theme changed to:', newTheme);
    // Update chart, recalculate colors, etc.
  });
  
  return unsubscribe; // Cleanup
}, []);
```

## CSS Variables Reference

### Colors

#### Background Colors
```css
--bg-primary       /* Main background (#ffffff in light, #0f172a in dark) */
--bg-secondary     /* Secondary background */
--bg-tertiary      /* Tertiary background */

--surface-00       /* Card/surface background */
--surface-10       /* Elevated surface */
--surface-20       /* More elevated surface */
```

#### Text Colors
```css
--text-primary     /* Primary text (#0f172a in light, #ffffff in dark) */
--text-secondary   /* Secondary text */
--text-tertiary    /* Tertiary text */
--text-muted       /* Muted/disabled text */
```

#### Brand Colors
```css
--accent-primary        /* #7C5CFF - Violet brand color */
--accent-primary-hover  /* Hover state */
--accent-secondary      /* #00C2A8 - Teal accent */
```

#### Semantic Colors
```css
--color-success   /* #00C2A8 */
--color-danger    /* #FF5C7C */
--color-warning   /* #FFB86B */
--color-info      /* #5C9CFF */
```

#### Chart Colors (6 colors for data visualization)
```css
--chart-1   /* #7C5CFF (light) / #8B5CF6 (dark) */
--chart-2   /* #06B6D4 (light) / #22D3EE (dark) */
--chart-3   /* #10B981 (light) / #34D399 (dark) */
--chart-4   /* #F59E0B (light) / #FBBF24 (dark) */
--chart-5   /* #EF4444 (light) / #F87171 (dark) */
--chart-6   /* #64748B (light) / #94A3B8 (dark) */
```

### Component-Specific Tokens

#### Table
```css
--table-header-bg   /* Table header background */
--table-row-hover   /* Row hover state */
--table-border      /* Table borders */
```

#### Forms
```css
--input-bg            /* Input background */
--input-border        /* Input border */
--input-focus-ring    /* Focus ring color */
--input-disabled-bg   /* Disabled input background */
```

#### Sidebar
```css
--sidebar-bg           /* Sidebar background */
--sidebar-item-hover   /* Sidebar item hover */
--sidebar-item-active  /* Active sidebar item */
--sidebar-text         /* Sidebar text color */
--sidebar-text-active  /* Active item text color */
```

#### Modal
```css
--modal-backdrop   /* Modal backdrop overlay */
--modal-bg         /* Modal content background */
```

### Borders & Shadows
```css
--border-light    /* Light border */
--border-medium   /* Medium border */
--border-dark     /* Dark border */

--elevation-1         /* Subtle elevation */
--elevation-2         /* Medium elevation */
--elevation-3         /* High elevation */
--elevation-floating  /* Floating elements (modals, popovers) */
```

### Spacing & Layout
```css
--space-0 through --space-24   /* Spacing scale (0 to 6rem) */
--radius-sm through --radius-full   /* Border radius scale */
```

## Working with Charts

### Using ChartWrapper

Wrap your Recharts components with `ChartWrapper` to automatically apply theme colors:

```jsx
import ChartWrapper, { useChartColors } from '@/../../src/components/charts/ChartWrapper';
import { BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';

function MyChart({ data }) {
  const colors = useChartColors();
  
  return (
    <ChartWrapper>
      <BarChart data={data}>
        <XAxis />
        <YAxis />
        <Tooltip />
        <Bar dataKey="sales" fill={colors[0]} />
        <Bar dataKey="revenue" fill={colors[1]} />
      </BarChart>
    </ChartWrapper>
  );
}
```

### Direct Color Access

If you need to configure chart options with colors:

```javascript
import { getChartColorsHex, getRechartsTheme } from '@/../../src/theme/themeClient';

const chartOptions = {
  colors: getChartColorsHex(), // Array of 6 hex colors
  backgroundColor: 'transparent',
  // ... other options
};

// Or get a full Recharts theme object
const rechartsTheme = getRechartsTheme();
```

## Adding New Tokens

To add new design tokens:

### 1. Add to CSS (`resources/css/app.css`)

```css
:root {
  /* Your new token */
  --my-custom-color: #ff6b9d;
}

:root[data-theme="dark"] {
  /* Dark theme variant */
  --my-custom-color: #ff8fb3;
}
```

### 2. Add to themeClient.js (if needed for runtime)

```javascript
// In src/theme/themeClient.js, add to getThemeColors():
export function getThemeColors() {
  return {
    // ... existing colors
    myCustom: getCssVar('--my-custom-color'),
  };
}
```

### 3. Document in design-tokens.json

```json
{
  "tokens": {
    "colors": {
      "custom": {
        "myCustomColor": "#ff6b9d"
      }
    }
  }
}
```

## Best Practices

### ✅ DO

- **Use CSS variables** for all colors, not hardcoded hex values
- **Use semantic tokens** (`--color-success`) instead of color names (`--green-500`) when possible
- **Test in both themes** before committing
- **Use component-specific tokens** (`--table-header-bg`) for consistency
- **Respect user preferences** - don't force a theme

### ❌ DON'T

- **Don't hardcode colors**: `bg-blue-500` → Use `bg-[var(--primary-500)]`
- **Don't use `dark:` variants everywhere**: Create reusable classes with CSS variables instead
- **Don't assume theme**: Always design for both light and dark
- **Don't forget contrast**: Ensure WCAG AA compliance (4.5:1 for text)

### Migration Pattern

When converting existing components:

```jsx
// ❌ Before (hardcoded Tailwind colors)
<div className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
  
// ✅ After (CSS variables)
<div className="bg-[var(--surface-00)] text-[var(--text-primary)]">

// ✅ Even better (utility class)
<div className="surface-primary">
```

## Troubleshooting

### Theme not persisting?
Check that localStorage is enabled and `mdm-theme` key exists.

### Colors not updating on theme change?
Ensure you're using CSS variables, not inline styles with hardcoded values.

### Charts not changing colors?
Use `useChartColors()` hook or `ChartWrapper` component.

### CSS variables not working?
Check browser support (95%+ supported). Fallbacks are built into Tailwind config.

## File Locations

- **Theme Provider**: `resources/js/Contexts/ThemeContext.jsx`
- **Theme Toggle**: `resources/js/Components/ThemeToggle.jsx`
- **CSS Variables**: `resources/css/app.css`
- **Runtime Utilities**: `src/theme/themeClient.js`
- **Chart Wrapper**: `src/components/charts/ChartWrapper.jsx`
- **Design Tokens JSON**: `src/styles/design-tokens.json`

## Need Help?

- Check `implementation_plan.md` for architecture details
- See `migrations.md` for step-by-step migration guide
- Review existing migrated components for patterns
