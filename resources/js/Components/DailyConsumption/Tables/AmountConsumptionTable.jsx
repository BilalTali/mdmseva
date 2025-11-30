// File: resources/js/Components/DailyConsumption/Tables/AmountConsumptionTable.jsx

import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { IndianRupee } from 'lucide-react';
import { colors, spacing, borderRadius, shadows, typography } from '@/lib/design-system';
import TableHeader from './TableHeader';
import TableRow from './TableRow';
import TableFooter from './TableFooter';
import { getSchoolTypeConfig } from '../Utils/schoolTypeHelpers';
import { formatCurrency } from '../Utils/calculationHelpers';

/**
 * Amount Consumption Table Component
 * FIXED: Cumulative calculation uses backend data correctly
 */
export default function AmountConsumptionTable({
    entries = [],
    consumptions = [], // Alternative prop name
    schoolType,
    schoolConfig, // Can pass config directly
    sections = [],
    className = ''
}) {
    // Use provided config or generate from schoolType
    const config = schoolConfig || getSchoolTypeConfig(schoolType);
    const { hasPrimary, hasMiddle, amountColumns, sections: configSections } = config;

    // Support both prop names for entries
    const records = entries.length > 0 ? entries : consumptions;

    // Use sections from config if not provided
    const activeSections = sections.length > 0 ? sections : configSections;

    // CRITICAL FIX: Backend already sends cumulative_amount calculated correctly
    // We just need to use the records as-is, not recalculate
    const recordsWithCumulative = useMemo(() => {
        // Check if backend already provided cumulative_amount
        if (records.length > 0 && records[0].cumulative_amount !== undefined) {
            // Backend already calculated it, use as-is

            return records;
        }

        // Fallback: Calculate on frontend if backend didn't send it

        let cumulativeSum = 0;

        return records.map(entry => {
            // Calculate current row total
            const primaryTotal = parseFloat(entry.primary_total || entry.primary_subtotal) || 0;
            const middleTotal = parseFloat(entry.middle_total || entry.middle_subtotal) || 0;
            const rowTotal = primaryTotal + middleTotal;

            // Add to cumulative
            cumulativeSum += rowTotal;

            return {
                ...entry,
                cumulative_amount: cumulativeSum
            };
        });
    }, [records]);

    // Calculate totals for footer
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

        return recordsWithCumulative.reduce((acc, entry) => {
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
    }, [recordsWithCumulative, hasPrimary, hasMiddle]);

    // Calculate grand total from last entry's cumulative total
    const grandCumulativeTotal = useMemo(() => {
        if (recordsWithCumulative.length === 0) return 0;
        return recordsWithCumulative[recordsWithCumulative.length - 1]?.cumulative_amount || 0;
    }, [recordsWithCumulative]);

    // Calculate ingredient totals across both sections
    const ingredientTotals = useMemo(() => {
        return {
            pulses: (totals.primary_pulses || 0) + (totals.middle_pulses || 0),
            vegetables: (totals.primary_vegetables || 0) + (totals.middle_vegetables || 0),
            oil: (totals.primary_oil || 0) + (totals.middle_oil || 0),
            salt: (totals.primary_salt || 0) + (totals.middle_salt || 0),
            fuel: (totals.primary_fuel || 0) + (totals.middle_fuel || 0),
        };
    }, [totals]);

    // Empty state
    if (records.length === 0) {
        return (
            <Card className={className}>
                <CardHeader>
                    <CardTitle className={`text-[${typography.fontSize.lg}] font-semibold flex items-center`} style={{ color: colors.success[600] }}>
                        <IndianRupee className={`w-5 h-5 mr-${spacing[2]}`} />
                        Amount Consumption Records
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-12">
                        <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-${spacing[4]}`} style={{ backgroundColor: colors.background.tertiary }}>
                            <IndianRupee className={`w-8 h-8`} style={{ color: colors.text.quaternary }} />
                        </div>
                        <h3 className={`text-[${typography.fontSize.lg}] font-medium mb-${spacing[2]}`} style={{ color: colors.text.primary }}>
                            No Records Yet
                        </h3>
                        <p className={`text-[${typography.fontSize.sm}]`} style={{ color: colors.text.tertiary }}>
                            Amount consumption records will appear here once you add daily entries.
                        </p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className={className}>
            <CardHeader>
                <CardTitle className={`text-[${typography.fontSize.lg}] font-semibold flex items-center justify-between`} style={{ color: colors.text.primary }}>
                    <span className="flex items-center">
                        <IndianRupee className={`w-5 h-5 mr-${spacing[2]}`} style={{ color: colors.success[600] }} />
                        Amount Consumption Details
                    </span>
                    <span className={`text-[${typography.fontSize.sm}] font-normal`} style={{ color: colors.text.tertiary }}>
                        {records.length} {records.length === 1 ? 'entry' : 'entries'}
                    </span>
                </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
                {/* Scrollable table container */}
                <div className={`overflow-x-auto max-h-[500px] overflow-y-auto`}>
                    <table className="min-w-full divide-y" style={{ borderColor: colors.border.light }}>
                        <TableHeader
                            columns={amountColumns}
                            tableType="amount"
                            sections={activeSections}
                        />

                        <tbody className={`divide-y`} style={{ backgroundColor: colors.background.primary, borderColor: colors.border.light }}>
                            {recordsWithCumulative.map((entry) => (
                                <TableRow
                                    key={entry.id}
                                    entry={entry}
                                    columns={amountColumns}
                                    tableType="amount"
                                    sections={activeSections}
                                    showActions={false}
                                />
                            ))}
                        </tbody>

                        <TableFooter
                            columns={amountColumns}
                            tableType="amount"
                            totals={totals}
                            sections={activeSections}
                        />
                    </table>
                </div>
            </CardContent>
        </Card>
    );
}