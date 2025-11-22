// File: resources/js/Components/DailyConsumption/Cards/RiceCalculationCard.jsx

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Calculator } from 'lucide-react';
import { colors, spacing, borderRadius, shadows, typography } from '@/lib/design-system';
import { getSectionLabel, getStockColorClass } from '../Utils/schoolTypeHelpers';
import { calculateRiceConsumption, formatWeight } from '../Utils/calculationHelpers';

/**
 * Rice Calculation Card Component
 * 
 * Shows real-time rice consumption calculation and remaining stock preview.
 * Displays warnings for insufficient or low stock conditions.
 * 
 * @param {Object} formData - Form data containing student counts
 * @param {number} formData.served_primary - Primary students count
 * @param {number} formData.served_middle - Middle students count
 * @param {Array<string>} sections - Active sections for this school type
 * @param {number} availableStock - Current rice stock in kg
 * @param {string} className - Additional CSS classes
 * 
 * @example
 * <RiceCalculationCard 
 *   formData={{ served_primary: 50, served_middle: 30 }}
 *   sections={['primary', 'middle']}
 *   availableStock={100}
 * />
 */
export default function RiceCalculationCard({ 
    formData,
    sections = [],
    availableStock,
    className = '' 
}) {
    const stock = parseFloat(availableStock || 0);
    
    // Calculate total rice consumption across all sections
    const totalRice = sections.reduce((sum, section) => {
        // Support both naming conventions: served_primary and primary_students
        const students = parseInt(
            formData[`served_${section}`] || 
            formData[`${section}_students`] || 
            0
        );
        const rice = calculateRiceConsumption(students, section);
        return sum + rice;
    }, 0);

    // Calculate remaining balance after this consumption
    const remainingBalance = stock - totalRice;
    const balanceColorClass = getStockColorClass(remainingBalance);

    // Check for warning conditions
    const hasInsufficientStock = remainingBalance < 0;
    const hasLowStock = remainingBalance >= 0 && remainingBalance < 10;
    const hasNoStudents = totalRice === 0;

    return (
        <Card className={className}>
            <CardHeader className={`pb-${spacing[3]}`}>
                <CardTitle className={`text-[${typography.fontSize.sm}] font-medium flex items-center`}>
                    <Calculator className={`w-4 h-4 mr-${spacing[2]}`} style={{ color: colors.info[600] }} />
                    Rice Consumption Preview
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className={`space-y-${spacing[4]}`}>
                    {/* Section-wise Breakdown (only show sections with students) */}
                    {sections.map(section => {
                        const students = parseInt(
                            formData[`served_${section}`] || 
                            formData[`${section}_students`] || 
                            0
                        );
                        const rice = calculateRiceConsumption(students, section);
                        
                        // Skip sections with no students
                        if (students === 0) return null;

                        return (
                            <div key={section} className={`space-y-${spacing[1]}`}>
                                <div className={`flex justify-between items-center text-[${typography.fontSize.sm}]`}>
                                    <span style={{ color: colors.text.tertiary }}>
                                        {getSectionLabel(section)}
                                    </span>
                                    <span style={{ color: colors.text.quaternary }}>
                                        {students.toLocaleString('en-IN')} students
                                    </span>
                                </div>
                                <div className={`text-[${typography.fontSize.lg}] font-semibold`} style={{ color: colors.text.primary }}>
                                    {formatWeight(rice)}
                                </div>
                            </div>
                        );
                    })}

                    {/* Total Rice Consumption */}
                    {!hasNoStudents && (
                        <div className={`pt-${spacing[3]} border-t space-y-${spacing[1]}`} style={{ borderColor: colors.border.light }}>
                            <div className="flex justify-between items-center">
                                <span className={`text-[${typography.fontSize.sm}] font-medium`} style={{ color: colors.text.secondary }}>
                                    Total Rice Required
                                </span>
                                <span className={`text-[${typography.fontSize.xl}] font-bold`} style={{ color: colors.info[600] }}>
                                    {formatWeight(totalRice)}
                                </span>
                            </div>
                        </div>
                    )}

                    {/* Remaining Balance */}
                    {!hasNoStudents && (
                        <div className={`pt-${spacing[3]} border-t space-y-${spacing[1]}`} style={{ borderColor: colors.border.light }}>
                            <div className="flex justify-between items-center">
                                <span className={`text-[${typography.fontSize.sm}] font-medium`} style={{ color: colors.text.secondary }}>
                                    Remaining Stock
                                </span>
                                <span className={`text-[${typography.fontSize.xl}] font-bold ${balanceColorClass}`}>
                                    {formatWeight(remainingBalance)}
                                </span>
                            </div>
                        </div>
                    )}

                    {/* Warning Messages */}
                    {hasInsufficientStock && (
                        <div className={`border p-${spacing[3]}`} style={{ backgroundColor: colors.error[50], borderColor: colors.error[200], borderRadius: borderRadius.lg }}>
                            <p className={`text-[${typography.fontSize.sm}] font-medium`} style={{ color: colors.error[800] }}>
                                ⚠️ Insufficient Stock!
                            </p>
                            <p className={`text-[${typography.fontSize.xs}] mt-${spacing[1]}`} style={{ color: colors.error[600] }}>
                                You need {formatWeight(Math.abs(remainingBalance))} more rice to complete this entry.
                            </p>
                        </div>
                    )}

                    {hasLowStock && (
                        <div className={`border p-${spacing[3]}`} style={{ backgroundColor: colors.warning[50], borderColor: colors.warning[200], borderRadius: borderRadius.lg }}>
                            <p className={`text-[${typography.fontSize.sm}] font-medium`} style={{ color: colors.warning[800] }}>
                                ⚠️ Low Stock Warning
                            </p>
                            <p className={`text-[${typography.fontSize.xs}] mt-${spacing[1]}`} style={{ color: colors.warning[600] }}>
                                Only {formatWeight(remainingBalance)} will remain after this entry.
                            </p>
                        </div>
                    )}

                    {/* No Students Warning */}
                    {hasNoStudents && (
                        <div className={`border p-${spacing[3]}`} style={{ backgroundColor: colors.background.tertiary, borderColor: colors.border.light, borderRadius: borderRadius.lg }}>
                            <p className={`text-[${typography.fontSize.sm}] text-center`} style={{ color: colors.text.secondary }}>
                                📝 Enter student counts to see rice calculation
                            </p>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}