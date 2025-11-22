import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import RiceConsumptionTable from '@/Components/DailyConsumption/Tables/RiceConsumptionTable';
import AmountConsumptionTable from '@/Components/DailyConsumption/Tables/AmountConsumptionTable';

export default function AdminSchoolShow(props) {
    const {
        school = {},
        riceConfiguration = null,
        dailyConsumptions = [],
        consumptionsWithCalculations = [],
        consumptionSummary = {},
        riceReports = [],
        amountReports = [],
        bills = [],
        rollStatement = null,
        schoolStats = {},
        filters = {},
        schoolType = null,
        sections = [],
        openingBalance = 0,
    } = props;

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <div className="flex items-center">
                        <Link
                            href={route('admin.schools.index')}
                            className="mr-4 text-gray-600 hover:text-gray-900"
                        >
                            Back
                        </Link>
                        <h2 className="text-xl font-semibold text-gray-800">
                            School Details{school?.school_name ? ` - ${school.school_name}` : ''}
                        </h2>
                    </div>
                    <div className="text-sm text-gray-500">
                        {school?.district?.name ? `District: ${school.district.name}` : ''}
                    </div>
                </div>
            }
        >
            <Head title={`Admin - School ${school?.school_name || school?.name || ''}`} />

            <div className="py-8">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">
                    {/* Summary */}
                    {/* Summary cards removed as per request */}

                    {/* Daily consumptions list removed as per request */}

                    {/* Read-only Rice Consumption Details */}
                    <div className="bg-white shadow-sm rounded-lg p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-gray-900">Rice Consumption (Read-only)</h3>
                            {(filters?.date_from || filters?.date_to) && (
                                <div className="text-sm text-gray-600">
                                    {filters?.date_from ? `From: ${filters.date_from}` : ''}
                                    {filters?.date_to ? ` To: ${filters.date_to}` : ''}
                                </div>
                            )}
                        </div>
                        <RiceConsumptionTable
                            consumptions={Array.isArray(consumptionsWithCalculations) ? consumptionsWithCalculations : []}
                            schoolType={schoolType || school?.school_type}
                            sections={Array.isArray(sections) && sections.length ? sections : (school?.sections || ['primary','middle'])}
                            openingBalance={typeof openingBalance === 'number' ? openingBalance : 0}
                            showActions={false}
                        />
                    </div>

                    {/* Read-only Amount Consumption Details */}
                    <div className="bg-white shadow-sm rounded-lg p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-gray-900">Amount Consumption (Read-only)</h3>
                            {(filters?.date_from || filters?.date_to) && (
                                <div className="text-sm text-gray-600">
                                    {filters?.date_from ? `From: ${filters.date_from}` : ''}
                                    {filters?.date_to ? ` To: ${filters.date_to}` : ''}
                                </div>
                            )}
                        </div>
                        <AmountConsumptionTable
                            entries={Array.isArray(consumptionsWithCalculations) ? consumptionsWithCalculations : []}
                            schoolType={schoolType || school?.school_type}
                            sections={Array.isArray(sections) ? sections : []}
                            className=""
                        />
                    </div>

                    {/* Bills, Amount Reports, and Rice Reports sections removed as requested */}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}