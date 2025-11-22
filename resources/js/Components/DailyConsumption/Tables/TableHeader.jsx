// File: resources/js/Components/DailyConsumption/Tables/TableHeader.jsx

import React from 'react';
import { getSectionLabel } from '../Utils/schoolTypeHelpers';

/**
 * Table Header Component - FIXED: Single TOTAL and CUMULATIVE columns
 * 
 * Renders dynamic table headers with proper column grouping
 * Amount Table: All ingredients (P|M) → Amount Consumed (P|M) → TOTAL → CUMULATIVE
 */
export default function TableHeader({ 
    columns = [], 
    tableType = 'rice', // 'rice' or 'amount'
    sections = [] // ['primary', 'middle']
}) {
    const hasPrimary = sections.includes('primary');
    const hasMiddle = sections.includes('middle');
    const hasBothSections = hasPrimary && hasMiddle;

    /**
     * Render GROUPED headers for Rice table
     * 
     * Layout:
     * | Date/day | Students (Middle|Primary) | Rice consumed (Middle|Primary) | Total Consumed | Remaining Balance | Actions |
     */
    const renderRiceHeaders = () => {
        const studentColSpan = hasBothSections ? 2 : 1;
        const riceColSpan = hasBothSections ? 2 : 1;

        return (
            <>
                {/* First row: Main grouped headers */}
                <tr className="bg-gray-100 border-b-2 border-gray-300">
                    <th 
                        rowSpan="2" 
                        className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider border-r"
                    >
                        Date/day
                    </th>
                    
                    <th 
                        colSpan={studentColSpan}
                        className="px-4 py-3 text-center text-xs font-bold text-gray-700 uppercase tracking-wider border-r bg-blue-50"
                    >
                        Students
                    </th>
                    
                    <th 
                        colSpan={riceColSpan}
                        className="px-4 py-3 text-center text-xs font-bold text-gray-700 uppercase tracking-wider border-r bg-purple-50"
                    >
                        Rice consumed
                    </th>
                    
                    <th 
                        rowSpan="2"
                        className="px-4 py-3 text-center text-xs font-bold text-gray-700 uppercase tracking-wider border-r bg-green-50"
                    >
                        Total<br/>Consumed (kg)
                    </th>
                    
                    <th 
                        rowSpan="2"
                        className="px-4 py-3 text-center text-xs font-bold text-gray-700 uppercase tracking-wider border-r bg-yellow-50"
                    >
                        Remaining<br/>Balance (kg)
                    </th>
                    
                    <th 
                        rowSpan="2"
                        className="px-4 py-3 text-center text-xs font-bold text-gray-700 uppercase tracking-wider"
                    >
                        Actions
                    </th>
                </tr>

                {/* Second row: Sub-column headers (Middle/Primary) */}
                <tr className="bg-gray-50 border-b">
                    {/* Students sub-columns */}
                    {hasMiddle && (
                        <th className="px-4 py-2 text-center text-xs font-medium text-gray-600 uppercase">
                            Middle
                        </th>
                    )}
                    {hasPrimary && (
                        <th className="px-4 py-2 text-center text-xs font-medium text-gray-600 uppercase border-r">
                            Primary
                        </th>
                    )}
                    
                    {/* Rice consumed sub-columns */}
                    {hasMiddle && (
                        <th className="px-4 py-2 text-right text-xs font-medium text-gray-600 uppercase">
                            Middle (kg)
                        </th>
                    )}
                    {hasPrimary && (
                        <th className="px-4 py-2 text-right text-xs font-medium text-gray-600 uppercase border-r">
                            Primary (kg)
                        </th>
                    )}
                </tr>
            </>
        );
    };

    /**
     * Render GROUPED headers for Amount table - FIXED VERSION
     * 
     * Layout:
     * | Date | Students (P|M) | Pulses (P|M) | Vegetables (P|M) | Oil (P|M) | 
     * | Salt (P|M) | Fuel (P|M) | Amount Consumed (P|M) | TOTAL | CUMULATIVE |
     * 
     * CRITICAL CHANGES:
     * - "Middle" renamed to "Amount Consumed"
     * - "Total" is now a SINGLE column (no P|M split)
     * - "Cumulative" is a SINGLE column (rowSpan=2)
     */
    const renderAmountHeaders = () => {
        return (
            <>
                {/* First row: Main category headers */}
                <tr className="bg-gray-100 border-b-2 border-gray-300">
                    <th 
                        rowSpan="2" 
                        className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider border-r"
                    >
                        Date
                    </th>
                    
                    <th 
                        colSpan={hasBothSections ? 2 : 1}
                        className="px-4 py-3 text-center text-xs font-bold text-gray-700 uppercase tracking-wider border-r bg-blue-50"
                    >
                        Students
                    </th>
                    
                    <th 
                        colSpan={hasBothSections ? 2 : 1}
                        className="px-4 py-3 text-center text-xs font-bold text-gray-700 uppercase tracking-wider border-r bg-purple-50"
                    >
                        Pulses
                    </th>
                    
                    <th 
                        colSpan={hasBothSections ? 2 : 1}
                        className="px-4 py-3 text-center text-xs font-bold text-gray-700 uppercase tracking-wider border-r bg-indigo-50"
                    >
                        Vegetables
                    </th>
                    
                    <th 
                        colSpan={hasBothSections ? 2 : 1}
                        className="px-4 py-3 text-center text-xs font-bold text-gray-700 uppercase tracking-wider border-r bg-pink-50"
                    >
                        Oil
                    </th>
                    
                    <th 
                        colSpan={hasBothSections ? 2 : 1}
                        className="px-4 py-3 text-center text-xs font-bold text-gray-700 uppercase tracking-wider border-r bg-orange-50"
                    >
                        Ingredients
                    </th>
                    
                    <th 
                        colSpan={hasBothSections ? 2 : 1}
                        className="px-4 py-3 text-center text-xs font-bold text-gray-700 uppercase tracking-wider border-r bg-red-50"
                    >
                        Fuel
                    </th>
                    
                    {/* RENAMED: "Middle" → "Amount Consumed" */}
                    <th 
                        colSpan={hasBothSections ? 2 : 1}
                        className="px-4 py-3 text-center text-xs font-bold text-gray-700 uppercase tracking-wider border-r bg-cyan-50"
                    >
                        Amount Consumed
                    </th>
                    
                    {/* FIXED: TOTAL is now a single column (rowSpan=2, no sub-columns) */}
                    <th 
                        rowSpan="2"
                        className="px-4 py-3 text-center text-xs font-bold text-gray-700 uppercase tracking-wider border-r bg-green-50"
                    >
                        Total
                    </th>
                    
                    {/* FIXED: CUMULATIVE is a single column (rowSpan=2) */}
                    <th 
                        rowSpan="2"
                        className="px-4 py-3 text-center text-xs font-bold text-gray-700 uppercase tracking-wider bg-yellow-50"
                    >
                        Cumulative
                    </th>
                </tr>

                {/* Second row: Primary/Middle sub-columns (NOT for Total and Cumulative) */}
                <tr className="bg-gray-50 border-b">
                    {/* Students */}
                    {hasPrimary && <th className="px-3 py-2 text-center text-xs font-medium text-gray-600 uppercase">P</th>}
                    {hasMiddle && <th className="px-3 py-2 text-center text-xs font-medium text-gray-600 uppercase border-r">M</th>}
                    
                    {/* Pulses */}
                    {hasPrimary && <th className="px-3 py-2 text-right text-xs font-medium text-gray-600 uppercase">P</th>}
                    {hasMiddle && <th className="px-3 py-2 text-right text-xs font-medium text-gray-600 uppercase border-r">M</th>}
                    
                    {/* Vegetables */}
                    {hasPrimary && <th className="px-3 py-2 text-right text-xs font-medium text-gray-600 uppercase">P</th>}
                    {hasMiddle && <th className="px-3 py-2 text-right text-xs font-medium text-gray-600 uppercase border-r">M</th>}
                    
                    {/* Oil */}
                    {hasPrimary && <th className="px-3 py-2 text-right text-xs font-medium text-gray-600 uppercase">P</th>}
                    {hasMiddle && <th className="px-3 py-2 text-right text-xs font-medium text-gray-600 uppercase border-r">M</th>}
                    
                    {/* Ingredients */}
                    {hasPrimary && <th className="px-3 py-2 text-right text-xs font-medium text-gray-600 uppercase">P</th>}
                    {hasMiddle && <th className="px-3 py-2 text-right text-xs font-medium text-gray-600 uppercase border-r">M</th>}
                    
                    {/* Fuel */}
                    {hasPrimary && <th className="px-3 py-2 text-right text-xs font-medium text-gray-600 uppercase">P</th>}
                    {hasMiddle && <th className="px-3 py-2 text-right text-xs font-medium text-gray-600 uppercase border-r">M</th>}
                    
                    {/* Amount Consumed (formerly "Middle") */}
                    {hasPrimary && <th className="px-3 py-2 text-right text-xs font-medium text-gray-600 uppercase">P</th>}
                    {hasMiddle && <th className="px-3 py-2 text-right text-xs font-medium text-gray-600 uppercase border-r">M</th>}
                    
                    {/* REMOVED: No sub-columns for Total and Cumulative */}
                </tr>
            </>
        );
    };

    return (
        <thead>
            {tableType === 'amount' ? renderAmountHeaders() : renderRiceHeaders()}
        </thead>
    );
}