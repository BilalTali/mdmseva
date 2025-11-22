// File: resources/js/Components/DailyConsumption/Cards/CumulativeTotalCard.jsx

import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { TrendingUp } from 'lucide-react';
import { colors, spacing, borderRadius, shadows, typography } from '@/lib/design-system';
import { formatCurrency } from '../Utils/calculationHelpers';

/**
 * Cumulative Total Card Component
 * 
 * Shows the cumulative total amount from the last consumption entry
 */
export default function CumulativeTotalCard({ 
    consumptions = [],
    className = ''
}) {
    // Calculate cumulative total using the same logic as AmountSummaryCards Period Total
    const cumulativeTotal = useMemo(() => {
        if (consumptions.length === 0) return 0;
        
        console.log('🔍 CumulativeTotalCard - Processing consumptions:', consumptions.length, 'entries');
        
        // Use the same calculation as AmountSummaryCards Period Total
        const periodTotal = consumptions.reduce((total, entry) => {
            const primaryTotal = parseFloat(entry.primary_total || entry.primary_subtotal) || 0;
            const middleTotal = parseFloat(entry.middle_total || entry.middle_subtotal) || 0;
            const entryTotal = primaryTotal + middleTotal;
            
            console.log(`Entry ID ${entry.id}: Primary=${primaryTotal}, Middle=${middleTotal}, Entry Total=${entryTotal}`);
            
            return total + entryTotal;
        }, 0);
        
        console.log('📊 CumulativeTotalCard - Period Total (should match AmountSummaryCards):', periodTotal);
        return periodTotal;
    }, [consumptions]);

    return (
        <Card 
            className={`${className} shadow-lg hover:shadow-xl transition-all duration-300 border-0`}
            style={{
                background: `linear-gradient(135deg, ${colors.success[50]} 0%, ${colors.success[100]} 100%)`,
                borderRadius: borderRadius.xl,
                boxShadow: shadows.lg
            }}
        >
            <CardHeader className={`pb-${spacing[2]}`}>
                <CardTitle className={`text-[${typography.fontSize.sm}] font-medium flex items-center justify-center`} style={{ color: colors.text.secondary }}>
                    <div className={`p-${spacing[1]} rounded-md mr-${spacing[2]}`} style={{ backgroundColor: colors.success[100], borderRadius: borderRadius.md }}>
                        <TrendingUp className={`w-4 h-4`} style={{ color: colors.success[600] }} />
                    </div>
                    Cumulative Total
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className={`space-y-${spacing[2]} text-center`}>
                    <div className={`text-[${typography.fontSize['3xl']}] font-bold tracking-tight`} style={{ color: colors.success[800] }}>
                        {formatCurrency(cumulativeTotal)}
                    </div>
                    <div className={`text-[${typography.fontSize.xs}]`} style={{ color: colors.success[600] }}>
                        Total amount spent to date
                    </div>
                    {consumptions.length > 0 && (
                        <div className={`text-[${typography.fontSize.xs}] mt-${spacing[2]}`} style={{ color: colors.success[500] }}>
                            Based on {consumptions.length} {consumptions.length === 1 ? 'entry' : 'entries'}
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
