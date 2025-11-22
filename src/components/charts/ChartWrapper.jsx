/**
 * ChartWrapper.jsx
 * 
 * A wrapper component for Recharts that automatically applies theme-aware colors
 * and re-renders charts when the theme changes.
 * 
 * Usage:
 * <ChartWrapper>
 *   <BarChart data={data}>
 *     <Bar dataKey="value" />
 *   </BarChart>
 * </ChartWrapper>
 */

import { useEffect, useState, cloneElement, Children } from 'react';
import { getChartColorsHex, subscribeToThemeChange } from '@/../../src/theme/themeClient';
import { useTheme } from '@/Contexts/ThemeContext';

export default function ChartWrapper({ children, colors }) {
    const { theme } = useTheme();
    const [chartColors, setChartColors] = useState(colors || getChartColorsHex());

    useEffect(() => {
        // Update colors when theme changes
        if (!colors) {
            setChartColors(getChartColorsHex());
        }
    }, [theme, colors]);

    // Clone children and inject theme-aware colors
    const enhancedChildren = Children.map(children, (child) => {
        if (!child) return child;

        // Pass chart colors as a prop that can be used in child components
        return cloneElement(child, {
            ...child.props,
            themeColors: chartColors,
        });
    });

    return <>{enhancedChildren}</>;
}

/**
 * Hook to get current chart colors
 * Use this inside chart components to access theme-aware colors
 */
export function useChartColors() {
    const { theme } = useTheme();
    const [colors, setColors] = useState(getChartColorsHex());

    useEffect(() => {
        setColors(getChartColorsHex());

        const unsubscribe = subscribeToThemeChange(() => {
            setColors(getChartColorsHex());
        });

        return unsubscribe;
    }, [theme]);

    return colors;
}

/**
 * Get theme-aware Recharts color palette
 * Returns an object with common Recharts color properties
 */
export function getRechartsTheme() {
    const colors = getChartColorsHex();

    return {
        colors,
        backgroundColor: 'transparent',
        textColor: getComputedStyle(document.documentElement).getPropertyValue('--text-primary').trim(),
        gridColor: getComputedStyle(document.documentElement).getPropertyValue('--border-light').trim(),
    };
}
