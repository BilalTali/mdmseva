// File: resources/js/Components/DailyConsumption/Cards/EnrollmentCard.jsx

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Users } from 'lucide-react';
import { colors, spacing, borderRadius, shadows, typography } from '@/lib/design-system';
import { getSectionLabel } from '../Utils/schoolTypeHelpers';

/**
 * Enrollment Card Component
 * 
 * Displays student enrollment numbers by section (Primary/Middle).
 * Shows breakdown when school has multiple sections.
 * 
 * Supports two data formats:
 * 1. With underscore: { primary_enrollment: 100, middle_enrollment: 60 }
 * 2. Without underscore: { primary: 100, middle: 60 }
 * 
 * @param {Object} enrollment - Enrollment data object
 * @param {Array<string>} sections - Active sections for this school type
 * @param {string} className - Additional CSS classes
 * 
 * @example
 * // Primary School
 * <EnrollmentCard 
 *   enrollment={{ primary: 100 }}
 *   sections={['primary']}
 * />
 * 
 * @example
 * // Middle School (shows both sections)
 * <EnrollmentCard 
 *   enrollment={{ primary: 100, middle: 60 }}
 *   sections={['primary', 'middle']}
 * />
 */
export default function EnrollmentCard({ 
    enrollment, 
    sections = [],
    className = '' 
}) {
    /**
     * Get enrollment count for a section
     * Supports both naming conventions:
     * - enrollment.primary_enrollment (with underscore)
     * - enrollment.primary (without underscore)
     */
    const getEnrollmentCount = (section) => {
        return parseInt(
            enrollment?.[`${section}_enrollment`] ||  // Try with underscore first
            enrollment?.[section] ||                   // Fall back to without underscore
            0
        );
    };

    // Calculate total enrollment across all active sections
    const totalEnrollment = sections.reduce((sum, section) => {
        return sum + getEnrollmentCount(section);
    }, 0);

    return (
        <Card
            className={`${className} shadow-lg hover:shadow-xl transition-all duration-300 border-0`}
            style={{
                background: `linear-gradient(135deg, ${colors.primary[50]} 0%, ${colors.primary[100]} 100%)`,
                borderRadius: borderRadius.xl,
                boxShadow: shadows.lg
            }}
        >
            <CardHeader className={`pb-${spacing[4]}`}>
                <CardTitle className={`text-[${typography.fontSize.sm}] font-medium flex items-center justify-center`}>
                    <Users
                        className={`w-4 h-4 mr-${spacing[2]}`}
                        style={{ color: colors.primary[600] }}
                    />
                    Student Enrollment
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className={`space-y-${spacing[4]} px-1 sm:px-${spacing[2]}`}>


                    {/* Total Enrollment Display */}
                    <div className="text-center">
                        <div
                            className={`text-[${typography.fontSize['3xl']}] font-bold tracking-tight`}
                            style={{ color: colors.primary[600] }}
                        >

                            {totalEnrollment.toLocaleString('en-IN')}
                        </div>
                        <p
                            className={`text-[${typography.fontSize.xs}] mt-${spacing[2]}`}
                            style={{ color: colors.text.secondary }}
                        >

                            Total Students
                        </p>
                    </div>

                    {/* Section Breakdown (only show if multiple sections) */}
                    {sections.length > 1 && (
                        <div
                            className={`pt-${spacing[3]} space-y-${spacing[2]}`}
                            style={{ borderTop: `1px solid ${colors.border.light}` }}

                        >

                            {sections.map(section => {
                                const count = getEnrollmentCount(section);
                                return (
                                    <div 
                                        key={section} 
                                        className="flex justify-between items-center"

                                    >
                                        <span
                                            className={`text-[${typography.fontSize.sm}]`}
                                            style={{ color: colors.text.secondary }}
                                        >
                                            {getSectionLabel(section)}
                                        </span>
                                        <span
                                            className={`text-[${typography.fontSize.sm}] font-semibold`}
                                            style={{ color: colors.text.primary }}
                                        >
                                            {count.toLocaleString('en-IN')}
                                        </span>

                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {/* No Enrollment Warning */}
                    {totalEnrollment === 0 && (
                        <div className={`text-[${typography.fontSize.xs}] font-medium px-${spacing[3]} py-${spacing[2]} rounded text-center mt-${spacing[1]}`} style={{ backgroundColor: colors.warning[50], color: colors.warning[700], borderRadius: borderRadius.md }}>
                            ⚠️ No enrollment data available
                        </div>

                    )}
                </div>
            </CardContent>
        </Card>

    );
}