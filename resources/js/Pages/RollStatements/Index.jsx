import React from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

export default function Index({ auth, rollStatements, filters }) {
    // Safely access data
    const statements = rollStatements?.data || [];
    const schoolType = auth.user.school_type || 'primary';
    
    // Group roll statements by date and academic year
    const groupedStatements = statements.reduce((acc, statement) => {
        const key = `${statement.date}|${statement.academic_year}`;
        if (!acc[key]) {
            acc[key] = [];
        }
        acc[key].push(statement);
        return acc;
    }, {});

    const handleDelete = (firstStatementId) => {
        if (confirm('Are you sure you want to delete this roll statement?')) {
            router.delete(route('roll-statements.destroy', firstStatementId));
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    };

    // Class mapping - lowercase to display format
    const classMapping = {
        'kg': 'KG',
        '1': '1st',
        '2': '2nd',
        '3': '3rd',
        '4': '4th',
        '5': '5th',
        '6': '6th',
        '7': '7th',
        '8': '8th',
        '9': '9th',
        '10': '10th',
        '11': '11th',
        '12': '12th'
    };

    // Define class ranges based on school type
    const getClassRanges = () => {
        switch(schoolType) {
            case 'primary':
                return {
                    all: ['kg', '1', '2', '3', '4', '5'],
                    primary: ['kg', '1', '2', '3', '4', '5'],
                    upperPrimary: []
                };
            case 'middle':
                return {
                    all: ['kg', '1', '2', '3', '4', '5', '6', '7', '8'],
                    primary: ['kg', '1', '2', '3', '4', '5'],
                    upperPrimary: ['6', '7', '8']
                };
            case 'secondary':
                return {
                    all: ['6', '7', '8', '9', '10'],
                    primary: ['6', '7', '8'],
                    upperPrimary: ['9', '10']
                };
            case 'senior_secondary':
                return {
                    all: ['6', '7', '8', '9', '10', '11', '12'],
                    primary: ['6', '7', '8', '9', '10'],
                    upperPrimary: ['11', '12']
                };
            default:
                return {
                    all: ['kg', '1', '2', '3', '4', '5'],
                    primary: ['kg', '1', '2', '3', '4', '5'],
                    upperPrimary: []
                };
        }
    };

    const classRanges = getClassRanges();
    const classOrder = classRanges.all;
    const primaryClasses = classRanges.primary;
    const upperPrimaryClasses = classRanges.upperPrimary;

    const getClassLabel = (classValue) => {
        return classMapping[classValue?.toLowerCase()] || classValue;
    };

    const sortStatements = (statements) => {
        return [...statements].sort((a, b) => {
            const aClass = a.class?.toLowerCase();
            const bClass = b.class?.toLowerCase();
            return classOrder.indexOf(aClass) - classOrder.indexOf(bClass);
        });
    };

    const calculateTotals = (statements, classes) => {
        const filtered = statements.filter(s => classes.includes(s.class?.toLowerCase()));
        return {
            boys: filtered.reduce((sum, s) => sum + (parseInt(s.boys) || 0), 0),
            girls: filtered.reduce((sum, s) => sum + (parseInt(s.girls) || 0), 0),
            total: filtered.reduce((sum, s) => sum + (parseInt(s.total) || 0), 0)
        };
    };
    
    // Get total label based on school type
    const getTotalLabels = () => {
        switch(schoolType) {
            case 'primary':
                return {
                    primary: 'PRIMARY TOTAL (KG - 5th)',
                    upperPrimary: null
                };
            case 'middle':
                return {
                    primary: 'PRIMARY TOTAL (KG - 5th)',
                    upperPrimary: 'UPPER PRIMARY TOTAL (6th - 8th)'
                };
            case 'secondary':
                return {
                    primary: 'LOWER SECONDARY TOTAL (6th - 8th)',
                    upperPrimary: 'UPPER SECONDARY TOTAL (9th - 10th)'
                };
            case 'senior_secondary':
                return {
                    primary: 'SECONDARY TOTAL (6th - 10th)',
                    upperPrimary: 'HIGHER SECONDARY TOTAL (11th - 12th)'
                };
            default:
                return {
                    primary: 'PRIMARY TOTAL',
                    upperPrimary: null
                };
        }
    };
    
    const totalLabels = getTotalLabels();

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="All Roll Statements" />

            <div className="py-8">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header with Create Button */}
                    <div className="mb-6 flex justify-between items-center">
                        <h2 className="text-2xl font-semibold text-gray-800">All Roll Statements</h2>
                        <Link
                            href={route('roll-statements.create')}
                            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-lg transition-colors"
                        >
                            <i className="fas fa-plus-circle"></i>
                            Create Roll Statement
                        </Link>
                    </div>

                    {Object.keys(groupedStatements).length === 0 ? (
                        <div className="bg-white rounded-lg shadow-lg p-12 text-center">
                            <div className="text-gray-400 mb-4">
                                <svg className="mx-auto h-24 w-24 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                            </div>
                            <p className="text-xl text-gray-600 font-semibold">No Roll Statements Found</p>
                            <p className="text-gray-500 mt-2">Create your first roll statement to get started.</p>
                            <Link
                                href={route('roll-statements.create')}
                                className="inline-flex items-center gap-2 mt-6 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-lg transition-colors"
                            >
                                <i className="fas fa-plus-circle"></i>
                                Create Roll Statement
                            </Link>
                        </div>
                    ) : (
                        <>
                            {Object.entries(groupedStatements).map(([key, statements]) => {
                                const [date, academicYear] = key.split('|');
                                const sortedStatements = sortStatements(statements);
                                const primaryTotals = calculateTotals(sortedStatements, primaryClasses);
                                const upperPrimaryTotals = calculateTotals(sortedStatements, upperPrimaryClasses);
                                const grandTotals = {
                                    boys: primaryTotals.boys + upperPrimaryTotals.boys,
                                    girls: primaryTotals.girls + upperPrimaryTotals.girls,
                                    total: primaryTotals.total + upperPrimaryTotals.total
                                };

                                // Get the first statement ID for delete action
                                const firstStatementId = sortedStatements[0]?.id;

                                return (
                                    <div
                                        key={key}
                                        className="bg-white rounded-lg shadow-2xl mb-12 overflow-hidden border-4 border-gray-800"
                                        style={{ aspectRatio: '210/297' }}
                                    >
                                        {/* Decorative Top Border */}
                                        <div className="h-3 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600"></div>

                                        {/* Header Section */}
                                        <div className="px-8 py-6 border-b-4 border-double border-gray-800">
                                            <div className="text-center mb-4">
                                                <h1 className="text-3xl font-bold text-gray-900 mb-2 tracking-wide">
                                                    INSTITUTE ROLL STATEMENT
                                                </h1>
                                                <div className="h-1 w-32 bg-gradient-to-r from-blue-600 to-purple-600 mx-auto rounded-full"></div>
                                            </div>

                                            {/* Institution Details */}
                                            <div className="grid grid-cols-3 gap-4 text-center mb-4">
                                                <div className="border-2 border-gray-300 rounded-lg p-2">
                                                    <p className="text-xs text-gray-600 font-semibold">STATE</p>
                                                    <p className="text-sm font-bold text-gray-900">{auth.user.state || 'J&K'}</p>
                                                </div>
                                                <div className="border-2 border-gray-300 rounded-lg p-2">
                                                    <p className="text-xs text-gray-600 font-semibold">DISTRICT</p>
                                                    <p className="text-sm font-bold text-gray-900">{auth.user.district || 'Not Set'}</p>
                                                </div>
                                                <div className="border-2 border-gray-300 rounded-lg p-2">
                                                    <p className="text-xs text-gray-600 font-semibold">ZONE</p>
                                                    <p className="text-sm font-bold text-gray-900">{auth.user.zone || 'Not Set'}</p>
                                                </div>
                                            </div>

                                            <div className="border-2 border-gray-300 rounded-lg p-3 bg-gray-50">
                                                <p className="text-lg font-bold text-center text-gray-900">{auth.user.school_name}</p>
                                                <p className="text-xs text-center text-gray-600 mt-1">
                                                    UDISE: <span className="font-bold">{auth.user.udise}</span>
                                                </p>
                                            </div>

                                            <div className="grid grid-cols-2 gap-4 mt-3 text-sm">
                                                <div className="text-left">
                                                    <span className="font-semibold text-gray-700">Academic Year:</span>
                                                    <span className="font-bold text-gray-900 ml-2">{academicYear}</span>
                                                </div>
                                                <div className="text-right">
                                                    <span className="font-semibold text-gray-700">Date:</span>
                                                    <span className="font-bold text-gray-900 ml-2">{formatDate(date)}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Roll Statement Table */}
                                        <div className="px-8 py-6">
                                            <table className="w-full border-2 border-gray-800">
                                                <thead>
                                                    <tr className="bg-gray-800 text-white">
                                                        <th className="border-2 border-gray-700 px-3 py-2 text-sm font-bold text-left w-16">S.No</th>
                                                        <th className="border-2 border-gray-700 px-3 py-2 text-sm font-bold text-left">Class</th>
                                                        <th className="border-2 border-gray-700 px-3 py-2 text-sm font-bold text-center w-24">Boys</th>
                                                        <th className="border-2 border-gray-700 px-3 py-2 text-sm font-bold text-center w-24">Girls</th>
                                                        <th className="border-2 border-gray-700 px-3 py-2 text-sm font-bold text-center w-24">Total</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {sortedStatements.map((statement, index) => (
                                                        <React.Fragment key={statement.id}>
                                                            <tr className="hover:bg-gray-50">
                                                                <td className="border-2 border-gray-300 px-3 py-2 text-sm text-center">{index + 1}</td>
                                                                <td className="border-2 border-gray-300 px-3 py-2 text-sm font-semibold">{getClassLabel(statement.class)}</td>
                                                                <td className="border-2 border-gray-300 px-3 py-2 text-sm text-center">{statement.boys}</td>
                                                                <td className="border-2 border-gray-300 px-3 py-2 text-sm text-center">{statement.girls}</td>
                                                                <td className="border-2 border-gray-300 px-3 py-2 text-sm text-center font-bold">{statement.total}</td>
                                                            </tr>

                                                            {/* Primary Total after 5th class */}
                                                            {statement.class?.toLowerCase() === '5' && (
                                                                <tr className="bg-blue-100">
                                                                    <td colSpan="2" className="border-2 border-gray-400 px-3 py-2 text-sm font-bold text-right">
                                                                        PRIMARY TOTAL (KG - 5th):
                                                                    </td>
                                                                    <td className="border-2 border-gray-400 px-3 py-2 text-sm font-bold text-center">{primaryTotals.boys}</td>
                                                                    <td className="border-2 border-gray-400 px-3 py-2 text-sm font-bold text-center">{primaryTotals.girls}</td>
                                                                    <td className="border-2 border-gray-400 px-3 py-2 text-sm font-bold text-center">{primaryTotals.total}</td>
                                                                </tr>
                                                            )}
                                                        </React.Fragment>
                                                    ))}

                                                    {/* Upper Primary Total */}
                                                    {upperPrimaryTotals.total > 0 && (
                                                        <tr className="bg-green-100">
                                                            <td colSpan="2" className="border-2 border-gray-400 px-3 py-2 text-sm font-bold text-right">
                                                                UPPER PRIMARY TOTAL (6th - 8th):
                                                            </td>
                                                            <td className="border-2 border-gray-400 px-3 py-2 text-sm font-bold text-center">{upperPrimaryTotals.boys}</td>
                                                            <td className="border-2 border-gray-400 px-3 py-2 text-sm font-bold text-center">{upperPrimaryTotals.girls}</td>
                                                            <td className="border-2 border-gray-400 px-3 py-2 text-sm font-bold text-center">{upperPrimaryTotals.total}</td>
                                                        </tr>
                                                    )}

                                                    {/* Grand Total */}
                                                    <tr className="bg-gradient-to-r from-purple-200 via-purple-300 to-purple-200">
                                                        <td colSpan="2" className="border-4 border-gray-600 px-3 py-3 text-base font-extrabold text-right text-gray-900">
                                                            GRAND TOTAL:
                                                        </td>
                                                        <td className="border-4 border-gray-600 px-3 py-3 text-base font-extrabold text-center text-gray-900">{grandTotals.boys}</td>
                                                        <td className="border-4 border-gray-600 px-3 py-3 text-base font-extrabold text-center text-gray-900">{grandTotals.girls}</td>
                                                        <td className="border-4 border-gray-600 px-3 py-3 text-base font-extrabold text-center text-gray-900">{grandTotals.total}</td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </div>

                                        {/* Action Buttons */}
                                        <div className="px-8 pb-6">
                                            <div className="flex justify-center gap-3 pt-4 border-t-2 border-gray-200">
                                                <Link
                                                    href={route('roll-statements.create')}
                                                    className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold rounded-lg shadow-md transition-colors"
                                                >
                                                    <i className="fas fa-edit"></i>
                                                    Edit
                                                </Link>
                                                <a
                                                    href={route('roll-statements.print', { date, academic_year: academicYear })}
                                                    className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-lg shadow-md transition-colors"
                                                    target="_blank"
                                                >
                                                    <i className="fas fa-file-pdf"></i>
                                                    Download PDF
                                                </a>
                                                <button
                                                    onClick={() => handleDelete(firstStatementId)}
                                                    className="inline-flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white text-sm font-semibold rounded-lg shadow-md transition-colors"
                                                >
                                                    <i className="fas fa-trash"></i>
                                                    Delete
                                                </button>
                                            </div>
                                        </div>

                                        {/* Decorative Bottom Border */}
                                        <div className="h-3 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600"></div>
                                    </div>
                                );
                            })}
                        </>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}