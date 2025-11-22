// File: resources/js/Components/DailyConsumption/Cards/StockDisplayCard.jsx
// Generic reusable card for displaying stock/balance information

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { colors, spacing, borderRadius, shadows, typography } from '@/lib/design-system';

/**
 * Generic Stock Display Card Component
 * 
 * A reusable card component for displaying stock, balance, or any numeric value
 * with an icon. Supports multiple color variants for different contexts.
 * 
 * @param {React.ComponentType} icon - Lucide icon component
 * @param {string} label - Label text to display
 * @param {number|string} value - Numeric value to display
 * @param {string} unit - Unit label (e.g., "kg", "days", etc.)
 * @param {string} variant - Color variant: "blue" | "green" | "red"
 * @param {string} className - Additional CSS classes
 * 
 * @example
 * // Blue variant (default) - for current/available stock
 * <StockDisplayCard
 *     icon={Scale}
 *     label="Available Rice Stock"
 *     value={100}
 *     unit="kg"
 * />
 * 
 * @example
 * // Green variant - for opening balance/positive values
 * <StockDisplayCard
 *     icon={TrendingUp}
 *     label="Opening Balance"
 *     value={150}
 *     unit="kg"
 *     variant="green"
 * />
 * 
 * @example
 * // Red variant - for closing balance/consumed values
 * <StockDisplayCard
 *     icon={TrendingDown}
 *     label="Closing Balance"
 *     value={50}
 *     unit="kg"
 *     variant="red"
 * />
 */
export default function StockDisplayCard({
    icon: Icon,
    label,
    value,
    unit,
    variant = "blue",
    className = ''
}) {
    // Color mapping for different variants
    const variantStyles = {
        blue: {
            bg: { backgroundColor: colors.info[50] },
            iconBg: { backgroundColor: colors.info[100] },
            iconColor: { color: colors.info[600] },
            border: { borderColor: colors.info[200] },
            textColor: { color: colors.info[900] },
            unitColor: { color: colors.info[600] },
        },
        green: {
            bg: { backgroundColor: colors.success[50] },
            iconBg: { backgroundColor: colors.success[100] },
            iconColor: { color: colors.success[600] },
            border: { borderColor: colors.success[200] },
            textColor: { color: colors.success[900] },
            unitColor: { color: colors.success[600] },
        },
        red: {
            bg: { backgroundColor: colors.error[50] },
            iconBg: { backgroundColor: colors.error[100] },
            iconColor: { color: colors.error[600] },
            border: { borderColor: colors.error[200] },
            textColor: { color: colors.error[900] },
            unitColor: { color: colors.error[600] },
        },
    };

    // Get styles for current variant
    const styles = variantStyles[variant] || variantStyles.blue;

    // Format the value for display
    const formattedValue = typeof value === 'number' 
        ? value.toLocaleString('en-IN', { 
            minimumFractionDigits: 0,
            maximumFractionDigits: 2 
        })
        : value;

    return (
        <Card 
            className={`${className} shadow-lg hover:shadow-xl transition-all duration-300 border-0`} 
            style={{ 
                background: `linear-gradient(135deg, ${styles.bg.backgroundColor} 0%, ${variant === 'blue' ? colors.info[100] : variant === 'green' ? colors.success[100] : colors.error[100]} 100%)`,
                borderRadius: borderRadius.xl,
                boxShadow: shadows.lg
            }}
        >
            <CardHeader className={`pb-${spacing[2]}`}>
                <CardTitle className={`text-[${typography.fontSize.sm}] font-medium flex items-center justify-center`} style={{ color: colors.text.secondary }}>
                    <div className={`p-${spacing[1]} rounded-md mr-${spacing[2]}`} style={{ ...styles.iconBg, borderRadius: borderRadius.md }}>
                        <Icon className={`w-4 h-4`} style={styles.iconColor} />
                    </div>
                    {label}
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className={`flex items-baseline justify-center space-x-${spacing[2]}`}>
                    <span className={`text-[${typography.fontSize['3xl']}] font-bold`} style={styles.textColor}>
                        {formattedValue}
                    </span>
                    <span className={`text-[${typography.fontSize.sm}] font-medium`} style={styles.unitColor}>
                        {unit}
                    </span>
                </div>
            </CardContent>
        </Card>
    );
}