// File: resources/js/Components/DailyConsumption/Cards/AmountSummaryCards.jsx

import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { TrendingUp, Calculator, PieChart } from 'lucide-react';
import { colors, spacing, borderRadius, shadows, typography } from '@/lib/design-system';
import { formatCurrency } from '../Utils/calculationHelpers';
import { getSchoolTypeConfig } from '../Utils/schoolTypeHelpers';

/**
 * Amount Summary Cards Component
 * 
 * Displays summary statistics and ingredient breakdown for amount consumption data
 */
export default function AmountSummaryCards({ 
    consumptions = [],
    schoolType,
    sections = [],
    className = ''
}) {
    // Get school configuration
    const config = getSchoolTypeConfig(schoolType);
    const { hasPrimary, hasMiddle } = config;
    
    // Calculate totals
    const totals = useMemo(() => {
        const initialTotals = {
            primary_students: 0,
            primary_pulses: 0,
            primary_vegetables: 0,
            primary_oil: 0,
            primary_salt: 0,
            primary_fuel: 0,
            primary_subtotal: 0,
            middle_students: 0,
            middle_pulses: 0,
            middle_vegetables: 0,
            middle_oil: 0,
            middle_salt: 0,
            middle_fuel: 0,
            middle_subtotal: 0,
            total_amount: 0,
        };

        return consumptions.reduce((acc, entry) => {
            if (hasPrimary) {
                acc.primary_students += parseInt(entry.served_primary || entry.primary_students) || 0;
                acc.primary_pulses += parseFloat(entry.primary_pulses) || 0;
                acc.primary_vegetables += parseFloat(entry.primary_vegetables) || 0;
                acc.primary_oil += parseFloat(entry.primary_oil) || 0;
                acc.primary_salt += parseFloat(entry.primary_salt) || 0;
                acc.primary_fuel += parseFloat(entry.primary_fuel) || 0;
                acc.primary_subtotal += parseFloat(entry.primary_subtotal || entry.primary_total) || 0;
            }
            if (hasMiddle) {
                acc.middle_students += parseInt(entry.served_middle || entry.middle_students) || 0;
                acc.middle_pulses += parseFloat(entry.middle_pulses) || 0;
                acc.middle_vegetables += parseFloat(entry.middle_vegetables) || 0;
                acc.middle_oil += parseFloat(entry.middle_oil) || 0;
                acc.middle_salt += parseFloat(entry.middle_salt) || 0;
                acc.middle_fuel += parseFloat(entry.middle_fuel) || 0;
                acc.middle_subtotal += parseFloat(entry.middle_subtotal || entry.middle_total) || 0;
            }
            
            const primaryTotal = parseFloat(entry.primary_total || entry.primary_subtotal) || 0;
            const middleTotal = parseFloat(entry.middle_total || entry.middle_subtotal) || 0;
            acc.total_amount += primaryTotal + middleTotal;
            
            return acc;
        }, initialTotals);
    }, [consumptions, hasPrimary, hasMiddle]);

    // Calculate grand cumulative total
    const grandCumulativeTotal = useMemo(() => {
        if (consumptions.length === 0) return 0;
        return consumptions[consumptions.length - 1]?.cumulative_amount || totals.total_amount;
    }, [consumptions, totals.total_amount]);

    // Calculate ingredient totals
    const ingredientTotals = useMemo(() => {
        return {
            pulses: (totals.primary_pulses || 0) + (totals.middle_pulses || 0),
            vegetables: (totals.primary_vegetables || 0) + (totals.middle_vegetables || 0),
            oil: (totals.primary_oil || 0) + (totals.middle_oil || 0),
            salt: (totals.primary_salt || 0) + (totals.middle_salt || 0),
            fuel: (totals.primary_fuel || 0) + (totals.middle_fuel || 0),
        };
    }, [totals]);

    if (consumptions.length === 0) {
        return null;
    }

    return (
        <div className={`space-y-6 ${className}`}>
            {/* Summary Statistics Cards */}
            <Card style={{ backgroundColor: colors.background.primary, borderColor: colors.border.light }}>
                <CardHeader className={`pb-${spacing[4]}`}>
                    <CardTitle className={`text-[${typography.fontSize.lg}] font-semibold flex items-center`} style={{ color: colors.text.primary }}>
                        <div className={`p-${spacing[1]} rounded-md mr-${spacing[2]}`} style={{ backgroundColor: colors.info[100], borderRadius: borderRadius.md }}>
                            <TrendingUp className={`w-5 h-5`} style={{ color: colors.info[600] }} />
                        </div>
                        Amount Summary Statistics
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-${spacing[4]}`}>
                        <div className={`text-center p-${spacing[4]} rounded-lg`} style={{ backgroundColor: colors.background.tertiary, borderRadius: borderRadius.lg }}>
                            <p className={`text-[${typography.fontSize.sm}] mb-${spacing[1]}`} style={{ color: colors.text.tertiary }}>Total Entries</p>
                            <p className={`text-[${typography.fontSize['2xl']}] font-bold tracking-tight`} style={{ color: colors.text.primary }}>{consumptions.length}</p>
                        </div>
                        
                        <div className={`text-center p-${spacing[4]} rounded-lg`} style={{ backgroundColor: colors.info[50], borderRadius: borderRadius.lg }}>
                            <p className={`text-[${typography.fontSize.sm}] mb-${spacing[1]}`} style={{ color: colors.info[600] }}>Period Total</p>
                            <p className={`text-[${typography.fontSize['2xl']}] font-bold tracking-tight`} style={{ color: colors.info[700] }}>
                                {formatCurrency(totals.total_amount)}
                            </p>
                        </div>
                        
                        {hasPrimary && (
                            <div className={`text-center p-${spacing[4]} rounded-lg`} style={{ backgroundColor: colors.primary[50], borderRadius: borderRadius.lg }}>
                                <p className={`text-[${typography.fontSize.sm}] mb-${spacing[1]}`} style={{ color: colors.primary[600] }}>Primary Total</p>
                                <p className={`text-[${typography.fontSize['2xl']}] font-bold tracking-tight`} style={{ color: colors.primary[700] }}>
                                    {formatCurrency(totals.primary_subtotal)}
                                </p>
                            </div>
                        )}
                        
                        {hasMiddle && (
                            <div className={`text-center p-${spacing[4]} rounded-lg`} style={{ backgroundColor: colors.secondary[50], borderRadius: borderRadius.lg }}>
                                <p className={`text-[${typography.fontSize.sm}] mb-${spacing[1]}`} style={{ color: colors.secondary[600] }}>Middle Total</p>
                                <p className={`text-[${typography.fontSize['2xl']}] font-bold tracking-tight`} style={{ color: colors.secondary[700] }}>
                                    {formatCurrency(totals.middle_subtotal)}
                                </p>
                            </div>
                        )}
                        
                    </div>
                </CardContent>
            </Card>

            {/* Ingredient Breakdown Card */}
            <Card style={{ backgroundColor: colors.background.primary, borderColor: colors.border.light }}>
                <CardHeader className={`pb-${spacing[4]}`}>
                    <CardTitle className={`text-[${typography.fontSize.lg}] font-semibold flex items-center`} style={{ color: colors.text.primary }}>
                        <div className={`p-${spacing[1]} rounded-md mr-${spacing[2]}`} style={{ backgroundColor: colors.success[100], borderRadius: borderRadius.md }}>
                            <PieChart className={`w-5 h-5`} style={{ color: colors.success[600] }} />
                        </div>
                        Ingredient Breakdown (Period Total)
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className={`grid grid-cols-2 md:grid-cols-5 gap-${spacing[4]}`}>
                        <div className={`text-center p-${spacing[4]} border rounded-lg`} style={{ backgroundColor: colors.background.primary, borderColor: colors.border.light, borderRadius: borderRadius.lg }}>
                            <p className={`text-[${typography.fontSize.xs}] mb-${spacing[1]}`} style={{ color: colors.text.tertiary }}>Pulses</p>
                            <p className={`text-[${typography.fontSize.lg}] font-semibold`} style={{ color: colors.text.primary }}>
                                {formatCurrency(ingredientTotals.pulses)}
                            </p>
                        </div>
                        
                        <div className={`text-center p-${spacing[4]} border rounded-lg`} style={{ backgroundColor: colors.background.primary, borderColor: colors.border.light, borderRadius: borderRadius.lg }}>
                            <p className={`text-[${typography.fontSize.xs}] mb-${spacing[1]}`} style={{ color: colors.text.tertiary }}>Vegetables</p>
                            <p className={`text-[${typography.fontSize.lg}] font-semibold`} style={{ color: colors.text.primary }}>
                                {formatCurrency(ingredientTotals.vegetables)}
                            </p>
                        </div>
                        
                        <div className={`text-center p-${spacing[4]} border rounded-lg`} style={{ backgroundColor: colors.background.primary, borderColor: colors.border.light, borderRadius: borderRadius.lg }}>
                            <p className={`text-[${typography.fontSize.xs}] mb-${spacing[1]}`} style={{ color: colors.text.tertiary }}>Oil</p>
                            <p className={`text-[${typography.fontSize.lg}] font-semibold`} style={{ color: colors.text.primary }}>
                                {formatCurrency(ingredientTotals.oil)}
                            </p>
                        </div>
                        
                        <div className={`text-center p-${spacing[4]} border rounded-lg`} style={{ backgroundColor: colors.background.primary, borderColor: colors.border.light, borderRadius: borderRadius.lg }}>
                            <p className={`text-[${typography.fontSize.xs}] mb-${spacing[1]}`} style={{ color: colors.text.tertiary }}>Salt</p>
                            <p className={`text-[${typography.fontSize.lg}] font-semibold`} style={{ color: colors.text.primary }}>
                                {formatCurrency(ingredientTotals.salt)}
                            </p>
                        </div>
                        
                        <div className={`text-center p-${spacing[4]} border rounded-lg`} style={{ backgroundColor: colors.background.primary, borderColor: colors.border.light, borderRadius: borderRadius.lg }}>
                            <p className={`text-[${typography.fontSize.xs}] mb-${spacing[1]}`} style={{ color: colors.text.tertiary }}>Fuel</p>
                            <p className={`text-[${typography.fontSize.lg}] font-semibold`} style={{ color: colors.text.primary }}>
                                {formatCurrency(ingredientTotals.fuel)}
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
