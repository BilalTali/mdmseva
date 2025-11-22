// File: resources/js/Components/DailyConsumption/Tables/TableFooter.jsx

import React from 'react';
import { formatWeight, formatCurrency } from '../Utils/calculationHelpers';

/**
 * Table Footer Component - FIXED FOR GROUPED COLUMN LAYOUT
 * 
 * Renders totals footer matching the Word document structure
 */
export default function TableFooter({ 
    columns = [],
    tableType = 'rice', // 'rice' or 'amount'
    totals = {},
    sections = [] // ['primary', 'middle']
}) {
    const hasPrimary = sections.includes('primary');
    const hasMiddle = sections.includes('middle');

    /**
     * Render Rice table footer
     */
    const renderRiceFooter = () => {
        const totalPrimaryStudents = totals.served_primary || 0;
        const totalMiddleStudents = totals.served_middle || 0;
        const totalPrimaryRice = totals.amount_primary || 0;
        const totalMiddleRice = totals.amount_middle || 0;
        const grandTotalRice = totals.total_amount_consumed || 0;

        return (
            <tr className="bg-gray-100 border-t-2 border-gray-300">
                {/* Label */}
                <td className="px-4 py-4 text-sm font-bold text-gray-900 uppercase border-r">
                    Total Summary
                </td>

                {/* Total students */}
                {hasMiddle && (
                    <td className="px-4 py-4 text-sm text-center font-bold text-gray-900">
                        {totalMiddleStudents.toLocaleString()}
                    </td>
                )}
                {hasPrimary && (
                    <td className="px-4 py-4 text-sm text-center font-bold text-gray-900 border-r">
                        {totalPrimaryStudents.toLocaleString()}
                    </td>
                )}

                {/* Total rice consumed */}
                {hasMiddle && (
                    <td className="px-4 py-4 text-sm text-right font-bold text-gray-900">
                        {formatWeight(totalMiddleRice)}
                    </td>
                )}
                {hasPrimary && (
                    <td className="px-4 py-4 text-sm text-right font-bold text-gray-900 border-r">
                        {formatWeight(totalPrimaryRice)}
                    </td>
                )}

                {/* Grand total */}
                <td className="px-4 py-4 text-sm text-right font-bold text-green-900 bg-green-100 border-r">
                    {formatWeight(grandTotalRice)}
                </td>

                {/* Final balance (calculated from opening - total consumed) */}
                <td className="px-4 py-4 text-sm text-right font-bold text-yellow-900 bg-yellow-100 border-r">
                    {/* This is shown but calculated elsewhere */}
                    -
                </td>

                {/* Actions column (empty) */}
                <td className="px-4 py-4"></td>
            </tr>
        );
    };

    /**
     * Render Amount table footer
     */
    const renderAmountFooter = () => {
        return (
            <tr className="bg-gray-100 border-t-2 border-gray-300">
                {/* Date label */}
                <td className="px-4 py-4 text-sm font-bold text-gray-900 uppercase border-r">
                    Total Summary
                </td>

                {/* Students totals */}
                {hasPrimary && (
                    <td className="px-3 py-4 text-sm text-center font-bold text-gray-900">
                        {(totals.primary_students || 0).toLocaleString()}
                    </td>
                )}
                {hasMiddle && (
                    <td className="px-3 py-4 text-sm text-center font-bold text-gray-900 border-r">
                        {(totals.middle_students || 0).toLocaleString()}
                    </td>
                )}

                {/* Pulses */}
                {hasPrimary && (
                    <td className="px-3 py-4 text-sm text-right font-bold text-gray-900">
                        {formatCurrency(totals.primary_pulses || 0)}
                    </td>
                )}
                {hasMiddle && (
                    <td className="px-3 py-4 text-sm text-right font-bold text-gray-900 border-r">
                        {formatCurrency(totals.middle_pulses || 0)}
                    </td>
                )}

                {/* Vegetables */}
                {hasPrimary && (
                    <td className="px-3 py-4 text-sm text-right font-bold text-gray-900">
                        {formatCurrency(totals.primary_vegetables || 0)}
                    </td>
                )}
                {hasMiddle && (
                    <td className="px-3 py-4 text-sm text-right font-bold text-gray-900 border-r">
                        {formatCurrency(totals.middle_vegetables || 0)}
                    </td>
                )}

                {/* Oil */}
                {hasPrimary && (
                    <td className="px-3 py-4 text-sm text-right font-bold text-gray-900">
                        {formatCurrency(totals.primary_oil || 0)}
                    </td>
                )}
                {hasMiddle && (
                    <td className="px-3 py-4 text-sm text-right font-bold text-gray-900 border-r">
                        {formatCurrency(totals.middle_oil || 0)}
                    </td>
                )}

                {/* Salt */}
                {hasPrimary && (
                    <td className="px-3 py-4 text-sm text-right font-bold text-gray-900">
                        {formatCurrency(totals.primary_salt || 0)}
                    </td>
                )}
                {hasMiddle && (
                    <td className="px-3 py-4 text-sm text-right font-bold text-gray-900 border-r">
                        {formatCurrency(totals.middle_salt || 0)}
                    </td>
                )}

                {/* Fuel */}
                {hasPrimary && (
                    <td className="px-3 py-4 text-sm text-right font-bold text-gray-900">
                        {formatCurrency(totals.primary_fuel || 0)}
                    </td>
                )}
                {hasMiddle && (
                    <td className="px-3 py-4 text-sm text-right font-bold text-gray-900 border-r">
                        {formatCurrency(totals.middle_fuel || 0)}
                    </td>
                )}

                {/* Subtotals */}
                {hasPrimary && (
                    <td className="px-3 py-4 text-sm text-right font-bold text-blue-900 bg-blue-100">
                        {formatCurrency(totals.primary_subtotal || 0)}
                    </td>
                )}
                {hasMiddle && (
                    <td className="px-3 py-4 text-sm text-right font-bold text-purple-900 bg-purple-100 border-r">
                        {formatCurrency(totals.middle_subtotal || 0)}
                    </td>
                )}

                {/* Grand total */}
                {hasPrimary && (
                    <td className="px-3 py-4 text-sm text-right font-bold text-green-900 bg-green-100">
                        {formatCurrency(totals.total_amount || 0)}
                    </td>
                )}
                {hasMiddle && !hasPrimary && (
                    <td className="px-3 py-4 text-sm text-right font-bold text-green-900 bg-green-100 border-r">
                        {formatCurrency(totals.middle_subtotal || 0)}
                    </td>
                )}

                {/* Cumulative (same as total for footer) */}
                <td className="px-4 py-4 text-sm text-right font-bold text-yellow-900 bg-yellow-100">
                    {formatCurrency(totals.total_amount || 0)}
                </td>
            </tr>
        );
    };

    return (
        <tfoot>
            {tableType === 'amount' ? renderAmountFooter() : renderRiceFooter()}
        </tfoot>
    );
}