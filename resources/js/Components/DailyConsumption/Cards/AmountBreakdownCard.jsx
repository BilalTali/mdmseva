// File: resources/js/Components/DailyConsumption/Cards/AmountBreakdownCard.jsx

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { IndianRupee } from 'lucide-react';
import { colors, spacing, borderRadius, shadows, typography } from '@/lib/design-system';
import { getSectionLabel } from '../Utils/schoolTypeHelpers';
import { calculateAmountConsumption, formatCurrency } from '../Utils/calculationHelpers';

/**
 * Amount Breakdown Card Component
 * 
 * Displays detailed cost breakdown by section and ingredient (Pulses, Vegetables, Oil, Salt, Fuel).
 * Shows subtotals per section and grand total across all sections.
 * 
 * @param {Object} formData - Form data containing student counts
 * @param {number} formData.served_primary - Primary students count
 * @param {number} formData.served_middle - Middle students count
 * @param {Array<string>} sections - Active sections for this school type
 * @param {string} className - Additional CSS classes
 * 
 * @example
 * <AmountBreakdownCard 
 *   formData={{ served_primary: 50, served_middle: 30 }}
 *   sections={['primary', 'middle']}
 * />
 */
export default function AmountBreakdownCard({ 
    formData,
    sections = [],
    className = '' 
}) {
    // Calculate amounts for each section
    const sectionAmounts = sections.map(section => {
        // Support both naming conventions
        const students = parseInt(
            formData[`served_${section}`] || 
            formData[`${section}_students`] || 
            0
        );
        const amounts = calculateAmountConsumption(students, section);
        
        return {
            section,
            students,
            ...amounts
        };
    });

    // Calculate grand total across all sections
    const grandTotal = sectionAmounts.reduce((sum, item) => sum + item.total, 0);

    // Check if any students entered
    const hasStudents = sectionAmounts.some(item => item.students > 0);

    return (
        <Card className={className}>
            <CardHeader className={`pb-${spacing[3]}`}>
                <CardTitle className={`text-[${typography.fontSize.sm}] font-medium flex items-center`}>
                    <IndianRupee className={`w-4 h-4 mr-${spacing[2]}`} style={{ color: colors.success[600] }} />
                    Cost Breakdown
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className={`space-y-${spacing[4]}`}>
                    {/* Section-wise Breakdown */}
                    {sectionAmounts.map(({ section, students, pulses, vegetables, oil, salt, fuel, total }) => {
                        // Skip sections with no students
                        if (students === 0) return null;

                        return (
                            <div key={section} className={`space-y-${spacing[2]}`}>
                                {/* Section Header */}
                                <div className={`flex justify-between items-center pb-${spacing[2]} border-b`} style={{ borderColor: colors.border.light }}>
                                    <span className={`text-[${typography.fontSize.sm}] font-semibold`} style={{ color: colors.text.secondary }}>
                                        {getSectionLabel(section)}
                                    </span>
                                    <span className={`text-[${typography.fontSize.xs}]`} style={{ color: colors.text.tertiary }}>
                                        {students.toLocaleString('en-IN')} students
                                    </span>
                                </div>

                                {/* Ingredient Breakdown */}
                                <div className={`space-y-${spacing[1]} pl-${spacing[3]}`}>
                                    <IngredientRow label="Pulses" amount={pulses} />
                                    <IngredientRow label="Vegetables" amount={vegetables} />
                                    <IngredientRow label="Oil" amount={oil} />
                                    <IngredientRow label="Salt" amount={salt} />
                                    <IngredientRow label="Fuel" amount={fuel} />
                                </div>

                                {/* Section Subtotal */}
                                <div className={`flex justify-between items-center pt-${spacing[2]} border-t`} style={{ borderColor: colors.border.light }}>
                                    <span className={`text-[${typography.fontSize.sm}] font-semibold`} style={{ color: colors.text.secondary }}>
                                        Subtotal
                                    </span>
                                    <span className={`text-[${typography.fontSize.base}] font-bold`} style={{ color: colors.text.primary }}>
                                        {formatCurrency(total)}
                                    </span>
                                </div>
                            </div>
                        );
                    })}

                    {/* Grand Total */}
                    {hasStudents && (
                        <div className={`pt-${spacing[3]} border-t-2`} style={{ borderColor: colors.border.medium }}>
                            <div className="flex justify-between items-center">
                                <span className={`text-[${typography.fontSize.base}] font-bold`} style={{ color: colors.text.primary }}>
                                    Total Amount
                                </span>
                                <span className={`text-[${typography.fontSize['2xl']}] font-bold`} style={{ color: colors.success[600] }}>
                                    {formatCurrency(grandTotal)}
                                </span>
                            </div>
                        </div>
                    )}

                    {/* No Students Message */}
                    {!hasStudents && (
                        <div className={`bg-[${colors.background.tertiary}] border p-${spacing[3]}`} style={{ borderColor: colors.border.light, borderRadius: borderRadius.lg }}>
                            <p className={`text-[${typography.fontSize.sm}] text-center`} style={{ color: colors.text.secondary }}>
                                💰 Enter student counts to see cost breakdown
                            </p>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}

/**
 * Ingredient Row Component
 * Reusable row for displaying ingredient costs
 */
function IngredientRow({ label, amount }) {
    return (
        <div className={`flex justify-between items-center text-[${typography.fontSize.sm}]`}>
            <span style={{ color: colors.text.tertiary }}>{label}</span>
            <span className={`font-medium`} style={{ color: colors.text.primary }}>
                {formatCurrency(amount)}
            </span>
        </div>
    );
}