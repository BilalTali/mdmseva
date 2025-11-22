import React from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import { colors, spacing, borderRadius, shadows, typography } from '@/lib/design-system';
import { formatWeight, formatCurrency, formatDate, getDayName } from '../Utils/calculationHelpers';
import { getStockColorClass } from '../Utils/schoolTypeHelpers';

/**
 * TableRow Component
 * 
 * Renders table rows for Rice and Amount consumption tables.
 * 
 * Amount Table Structure:
 * Date | Students (P|M) | Pulses (P|M) | Vegetables (P|M) | Oil (P|M) | 
 * Salt (P|M) | Fuel (P|M) | Amount Consumed (P|M) | TOTAL | CUMULATIVE | Actions
 */
export default function TableRow({ 
    entry,
    columns = [],
    tableType = 'rice',
    sections = [],
    onEdit,
    onDelete,
    showActions = true
}) {
    const hasPrimary = sections.includes('primary');
    const hasMiddle = sections.includes('middle');

    /**
     * Rice Table Row
     */
    const renderRiceRow = () => {
        const remaining = parseFloat(entry.remaining_balance || entry.rice_balance_after || 0);
        const colorClass = getStockColorClass(remaining);

        return (
            <>
                <td className={`px-${spacing[4]} py-${spacing[3]} text-[${typography.fontSize.sm}] font-medium border-r`} style={{ color: colors.text.primary }}>
                    <div>{formatDate(entry.date)}</div>
                    <div className={`text-[${typography.fontSize.xs}]`} style={{ color: colors.text.quaternary }}>{getDayName(entry.date)}</div>
                </td>

                {hasMiddle && (
                    <td className={`px-${spacing[4]} py-${spacing[3]} text-[${typography.fontSize.sm}] text-center font-medium`} style={{ color: colors.text.primary }}>
                        {parseInt(entry.served_middle) || 0}
                    </td>
                )}

                {hasPrimary && (
                    <td className={`px-${spacing[4]} py-${spacing[3]} text-[${typography.fontSize.sm}] text-center font-medium border-r`} style={{ color: colors.text.primary }}>
                        {parseInt(entry.served_primary) || 0}
                    </td>
                )}

                {hasMiddle && (
                    <td className={`px-${spacing[4]} py-${spacing[3]} text-[${typography.fontSize.sm}] text-right`} style={{ color: colors.text.secondary }}>
                        {formatWeight(entry.middle_rice || 0)}
                    </td>
                )}

                {hasPrimary && (
                    <td className={`px-${spacing[4]} py-${spacing[3]} text-[${typography.fontSize.sm}] text-right border-r`} style={{ color: colors.text.secondary }}>
                        {formatWeight(entry.primary_rice || 0)}
                    </td>
                )}

                <td className={`px-${spacing[4]} py-${spacing[3]} text-[${typography.fontSize.sm}] text-right font-semibold border-r`} style={{ backgroundColor: colors.success[50], color: colors.text.primary }}>
                    {formatWeight(entry.total_rice || entry.rice_consumed || 0)}
                </td>

                <td className={`px-${spacing[4]} py-${spacing[3]} text-[${typography.fontSize.sm}] text-right font-bold border-r ${colorClass}`}>
                    {formatWeight(remaining)}
                </td>

                {showActions && renderActionsCell()}
            </>
        );
    };

    /**
     * Amount Table Row
     * 
     * Shows:
     * - All ingredient costs split by Primary/Middle
     * - Amount Consumed (P|M) - renamed from "Middle"
     * - Single TOTAL column (sum of Primary + Middle)
     * - Single CUMULATIVE column (running total)
     */
    const renderAmountRow = () => {
        const primaryTotal = parseFloat(entry.primary_total || 0);
        const middleTotal = parseFloat(entry.middle_total || 0);
        const grandTotal = primaryTotal + middleTotal;
        const cumulative = parseFloat(
            entry.cumulative_amount || 
            entry.cumulative_total || 
            entry.cumulativeAmount || 
            0
        );

        return (
            <>
                {/* Date */}
                <td className={`px-${spacing[4]} py-${spacing[3]} text-[${typography.fontSize.sm}] font-medium border-r`} style={{ color: colors.text.primary }}>
                    {formatDate(entry.date)}
                </td>

                {/* Students Served */}
                {hasPrimary && (
                    <td className={`px-${spacing[3]} py-${spacing[3]} text-[${typography.fontSize.sm}] text-center font-medium`} style={{ color: colors.text.primary }}>
                        {parseInt(entry.served_primary) || 0}
                    </td>
                )}
                {hasMiddle && (
                    <td className={`px-${spacing[3]} py-${spacing[3]} text-[${typography.fontSize.sm}] text-center font-medium border-r`} style={{ color: colors.text.primary }}>
                        {parseInt(entry.served_middle) || 0}
                    </td>
                )}

                {/* Pulses */}
                {hasPrimary && (
                    <td className={`px-${spacing[3]} py-${spacing[3]} text-[${typography.fontSize.sm}] text-right`} style={{ color: colors.text.secondary }}>
                        {formatCurrency(entry.primary_pulses || 0)}
                    </td>
                )}
                {hasMiddle && (
                    <td className={`px-${spacing[3]} py-${spacing[3]} text-[${typography.fontSize.sm}] text-right border-r`} style={{ color: colors.text.secondary }}>
                        {formatCurrency(entry.middle_pulses || 0)}
                    </td>
                )}

                {/* Vegetables */}
                {hasPrimary && (
                    <td className={`px-${spacing[3]} py-${spacing[3]} text-[${typography.fontSize.sm}] text-right`} style={{ color: colors.text.secondary }}>
                        {formatCurrency(entry.primary_vegetables || 0)}
                    </td>
                )}
                {hasMiddle && (
                    <td className={`px-${spacing[3]} py-${spacing[3]} text-[${typography.fontSize.sm}] text-right border-r`} style={{ color: colors.text.secondary }}>
                        {formatCurrency(entry.middle_vegetables || 0)}
                    </td>
                )}

                {/* Oil */}
                {hasPrimary && (
                    <td className={`px-${spacing[3]} py-${spacing[3]} text-[${typography.fontSize.sm}] text-right`} style={{ color: colors.text.secondary }}>
                        {formatCurrency(entry.primary_oil || 0)}
                    </td>
                )}
                {hasMiddle && (
                    <td className={`px-${spacing[3]} py-${spacing[3]} text-[${typography.fontSize.sm}] text-right border-r`} style={{ color: colors.text.secondary }}>
                        {formatCurrency(entry.middle_oil || 0)}
                    </td>
                )}

                {/* Salt */}
                {hasPrimary && (
                    <td className={`px-${spacing[3]} py-${spacing[3]} text-[${typography.fontSize.sm}] text-right`} style={{ color: colors.text.secondary }}>
                        {formatCurrency(entry.primary_salt || 0)}
                    </td>
                )}
                {hasMiddle && (
                    <td className={`px-${spacing[3]} py-${spacing[3]} text-[${typography.fontSize.sm}] text-right border-r`} style={{ color: colors.text.secondary }}>
                        {formatCurrency(entry.middle_salt || 0)}
                    </td>
                )}

                {/* Fuel */}
                {hasPrimary && (
                    <td className={`px-${spacing[3]} py-${spacing[3]} text-[${typography.fontSize.sm}] text-right`} style={{ color: colors.text.secondary }}>
                        {formatCurrency(entry.primary_fuel || 0)}
                    </td>
                )}
                {hasMiddle && (
                    <td className={`px-${spacing[3]} py-${spacing[3]} text-[${typography.fontSize.sm}] text-right border-r`} style={{ color: colors.text.secondary }}>
                        {formatCurrency(entry.middle_fuel || 0)}
                    </td>
                )}

                {/* Amount Consumed (Previously called "Middle") - Split by P and M */}
                {hasPrimary && (
                    <td className={`px-${spacing[3]} py-${spacing[3]} text-[${typography.fontSize.sm}] text-right font-semibold`} style={{ backgroundColor: colors.info[50], color: colors.info[700] }}>
                        {formatCurrency(primaryTotal)}
                    </td>
                )}
                {hasMiddle && (
                    <td className={`px-${spacing[3]} py-${spacing[3]} text-[${typography.fontSize.sm}] text-right font-semibold border-r`} style={{ backgroundColor: colors.secondary[50], color: colors.secondary[700] }}>
                        {formatCurrency(middleTotal)}
                    </td>
                )}

                {/* TOTAL - Single column showing sum of Primary + Middle */}
                <td className={`px-${spacing[4]} py-${spacing[3]} text-[${typography.fontSize.sm}] text-right font-bold border-r`} style={{ backgroundColor: colors.success[50], color: colors.success[700] }}>
                    {formatCurrency(grandTotal)}
                </td>

                {/* CUMULATIVE - Single column showing running total */}
                <td className={`px-${spacing[4]} py-${spacing[3]} text-[${typography.fontSize.sm}] text-right font-bold border-r`} style={{ backgroundColor: colors.warning[50], color: colors.warning[700] }}>
                    {formatCurrency(cumulative)}
                </td>

                {showActions && renderActionsCell()}
            </>
        );
    };

    /**
     * Action Buttons Cell
     */
    const renderActionsCell = () => (
        <td className={`px-${spacing[4]} py-${spacing[3]} text-[${typography.fontSize.sm}] text-center whitespace-nowrap`}>
            <div className={`flex items-center justify-center gap-${spacing[2]}`}>
                {onEdit && (
                    <button
                        onClick={() => onEdit(entry)}
                        className={`inline-flex items-center px-${spacing[3]} py-${spacing[2]} border text-[${typography.fontSize.xs}] font-medium rounded transition-colors`}
                        style={{
                            backgroundColor: colors.background.primary,
                            borderColor: colors.border.medium,
                            color: colors.text.secondary,
                            boxShadow: shadows.sm,
                            borderRadius: borderRadius.md
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = colors.secondary[100];
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = colors.background.primary;
                        }}
                        title="Edit entry"
                    >
                        <Pencil className={`w-3.5 h-3.5 mr-${spacing[1]}`} />
                        Edit
                    </button>
                )}
                
                {onDelete && (
                    <button
                        onClick={() => onDelete(entry)}
                        className={`inline-flex items-center px-${spacing[3]} py-${spacing[2]} border text-[${typography.fontSize.xs}] font-medium rounded transition-colors`}
                        style={{
                            backgroundColor: colors.background.primary,
                            borderColor: colors.error[300],
                            color: colors.error[700],
                            boxShadow: shadows.sm,
                            borderRadius: borderRadius.md
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = colors.error[50];
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = colors.background.primary;
                        }}
                        title="Delete entry"
                    >
                        <Trash2 className={`w-3.5 h-3.5 mr-${spacing[1]}`} />
                        Delete
                    </button>
                )}
            </div>
        </td>
    );

    return (
        <tr className={`border-b transition-colors`} style={{ borderColor: colors.border.light }} onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = colors.background.secondary;
        }} onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
        }}>
            {tableType === 'amount' ? renderAmountRow() : renderRiceRow()}
        </tr>
    );
}