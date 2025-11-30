import React from 'react';
import { colors, spacing, borderRadius, shadows, typography } from '@/lib/design-system';

/**
 * ✅ FIXED: Rice Consumption Table with CORRECT Balance Calculation
 * Formula: Opening Balance = Rice Lifted + Opening Stock
 * Balance After Each Day = Previous Balance - Rice Consumed
 */
export default function RiceConsumptionTable({
    consumptions,
    schoolType,
    sections,
    openingBalance = 0,
    onEdit,
    onDelete,
    showActions = true
}) {


    // ✅ SAFETY CHECK: Ensure consumptions is an array
    if (!Array.isArray(consumptions) || consumptions.length === 0) {
        return (
            <div className="bg-white rounded-xl shadow-lg p-8 text-center">
                <p className="text-gray-500">No consumption records available.</p>
            </div>
        );
    }

    // ✅ CORRECT LOGIC: Running balance starts with opening balance
    // Opening Balance = Rice Lifted + Opening Stock (from RiceConfiguration)
    let runningBalance = openingBalance;



    // Add balance calculations to each row
    const rowsWithBalance = consumptions.map((consumption, index) => {
        const opening = runningBalance;

        // ✅ Use the CALCULATED total_rice field from ConsumptionCalculationService
        const consumed = consumption.total_rice || 0;

        // ✅ Calculate closing balance: Opening - Consumed
        const closing = Math.max(0, opening - consumed);



        // ✅ Update running balance for next row
        runningBalance = closing;

        return {
            ...consumption,
            opening_balance: opening,
            closing_balance: closing
        };
    });

    // ✅ Calculate totals correctly
    const totalConsumed = consumptions.reduce((sum, c) => sum + (c.total_rice || 0), 0);
    const finalBalance = rowsWithBalance[rowsWithBalance.length - 1]?.closing_balance || 0;
    const avgDaily = consumptions.length > 0 ? totalConsumed / consumptions.length : 0;



    return (
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
                <h3 className="text-xl font-bold text-white flex items-center">
                    <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    Rice Consumption Details
                </h3>
                <p className="text-blue-100 text-sm mt-1">
                    Opening Balance (Rice Lifted + Opening Stock): <span className="font-semibold">{openingBalance.toFixed(2)} kg</span>
                </p>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                Date/Day
                            </th>

                            {/* Students Columns */}
                            {sections.includes('primary') && (
                                <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                    <div>Primary</div>
                                    <div className="text-gray-500 font-normal">(Students)</div>
                                </th>
                            )}
                            {sections.includes('middle') && (
                                <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                    <div>Middle</div>
                                    <div className="text-gray-500 font-normal">(Students)</div>
                                </th>
                            )}

                            {/* Rice Columns */}
                            {sections.includes('primary') && (
                                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                    <div>Primary</div>
                                    <div className="text-gray-500 font-normal">(Rice KG)</div>
                                </th>
                            )}
                            {sections.includes('middle') && (
                                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                    <div>Middle</div>
                                    <div className="text-gray-500 font-normal">(Rice KG)</div>
                                </th>
                            )}

                            <th className="px-6 py-3 text-right text-xs font-semibold text-blue-700 uppercase tracking-wider bg-blue-50">
                                <div>Total</div>
                                <div className="text-blue-600 font-normal">(Consumed KG)</div>
                            </th>

                            <th className="px-6 py-3 text-right text-xs font-semibold text-green-700 uppercase tracking-wider bg-green-50">
                                <div>Balance After</div>
                                <div className="text-green-600 font-normal">(Stock KG)</div>
                            </th>

                            {showActions && (
                                <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                    Actions
                                </th>
                            )}
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {rowsWithBalance.map((consumption, index) => {
                            // ✅ Use calculated fields from service
                            const primaryRice = consumption.primary_rice || 0;
                            const middleRice = consumption.middle_rice || 0;
                            const totalRice = consumption.total_rice || 0;

                            return (
                                <tr
                                    key={consumption.id}
                                    className={`hover:bg-gray-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                                        }`}
                                >
                                    {/* Date/Day */}
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-semibold text-gray-900">
                                            {new Date(consumption.date).toLocaleDateString('en-GB', {
                                                day: '2-digit',
                                                month: 'short',
                                                year: 'numeric'
                                            })}
                                        </div>
                                        <div className="text-xs text-gray-500">{consumption.day}</div>
                                    </td>

                                    {/* Primary Students */}
                                    {sections.includes('primary') && (
                                        <td className="px-6 py-4 text-center">
                                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-purple-100 text-purple-800">
                                                {consumption.served_primary || 0}
                                            </span>
                                        </td>
                                    )}

                                    {/* Middle Students */}
                                    {sections.includes('middle') && (
                                        <td className="px-6 py-4 text-center">
                                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-indigo-100 text-indigo-800">
                                                {consumption.served_middle || 0}
                                            </span>
                                        </td>
                                    )}

                                    {/* Primary Rice - ✅ USING CALCULATED VALUE */}
                                    {sections.includes('primary') && (
                                        <td className="px-6 py-4 text-right">
                                            <span className="text-sm font-semibold text-gray-900">
                                                {primaryRice.toFixed(2)}
                                            </span>
                                        </td>
                                    )}

                                    {/* Middle Rice - ✅ USING CALCULATED VALUE */}
                                    {sections.includes('middle') && (
                                        <td className="px-6 py-4 text-right">
                                            <span className="text-sm font-semibold text-gray-900">
                                                {middleRice.toFixed(2)}
                                            </span>
                                        </td>
                                    )}

                                    {/* Total Consumed - ✅ USING CALCULATED VALUE */}
                                    <td className="px-6 py-4 text-right bg-blue-50">
                                        <span className="text-sm font-bold text-blue-700">
                                            {totalRice.toFixed(2)} kg
                                        </span>
                                    </td>

                                    {/* Balance After Consumption - ✅ CORRECT CALCULATION */}
                                    <td className="px-6 py-4 text-right bg-green-50">
                                        <span className={`text-sm font-bold ${consumption.closing_balance < 10
                                                ? 'text-red-600'
                                                : consumption.closing_balance < 50
                                                    ? 'text-orange-600'
                                                    : 'text-green-700'
                                            }`}>
                                            {consumption.closing_balance.toFixed(2)} kg
                                        </span>
                                    </td>

                                    {/* Actions */}
                                    {showActions && (
                                        <td className="px-6 py-4 text-center whitespace-nowrap">
                                            <div className="flex items-center justify-center gap-2">
                                                <button
                                                    onClick={() => onEdit(consumption)}
                                                    className="inline-flex items-center px-3 py-1.5 bg-blue-100 text-blue-700 text-sm font-medium rounded-lg hover:bg-blue-200 transition-colors"
                                                >
                                                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                    </svg>
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => onDelete(consumption)}
                                                    className="inline-flex items-center px-3 py-1.5 bg-red-100 text-red-700 text-sm font-medium rounded-lg hover:bg-red-200 transition-colors"
                                                >
                                                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
                                                    Delete
                                                </button>
                                            </div>
                                        </td>
                                    )}
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {/* Summary Footer */}
            <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                    <div>
                        <div className="text-xs text-gray-500 uppercase tracking-wider">Total Records</div>
                        <div className="text-lg font-bold text-gray-900">{consumptions.length}</div>
                    </div>
                    <div>
                        <div className="text-xs text-gray-500 uppercase tracking-wider">Total Consumed</div>
                        <div className="text-lg font-bold text-blue-700">
                            {totalConsumed.toFixed(2)} kg
                        </div>
                    </div>
                    <div>
                        <div className="text-xs text-gray-500 uppercase tracking-wider">Final Balance</div>
                        <div className="text-lg font-bold text-green-700">
                            {finalBalance.toFixed(2)} kg
                        </div>
                    </div>
                    <div>
                        <div className="text-xs text-gray-500 uppercase tracking-wider">Avg Daily</div>
                        <div className="text-lg font-bold text-gray-900">
                            {avgDaily.toFixed(2)} kg
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}