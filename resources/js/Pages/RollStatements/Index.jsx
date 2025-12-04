import React from 'react';
import { Head, Link, router, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

const DeleteButton = ({ date, academicYear, udise }) => {
    // Safe date parsing to prevent render crashes
    let formattedDate = '';
    try {
        if (date) {
            formattedDate = new Date(date).toISOString().split('T')[0];
        }
    } catch (e) {
        console.error('Invalid date for delete button:', date, e);
    }

    const { delete: destroy, processing } = useForm({
        date: formattedDate,
        academic_year: academicYear,
        udise: udise
    });

    const handleDelete = (e) => {
        e.preventDefault();

        if (!formattedDate) {
            alert('Error: Invalid date record. Cannot delete.');
            return;
        }

        if (confirm('Are you sure you want to delete this entire roll statement? This will remove all class entries for this date.')) {
            destroy(route('roll-statements.bulk-destroy'), {
                preserveScroll: true,
                onError: (errors) => {
                    console.error('Delete errors:', errors);
                    alert('Failed to delete. Please try again.');
                }
            });
        }
    };

    return (
        <button
            onClick={handleDelete}
            disabled={processing || !formattedDate}
            className={`text-red-600 hover:text-red-900 ${processing || !formattedDate ? 'opacity-50 cursor-not-allowed' : ''}`}
            title={!formattedDate ? "Invalid Date" : "Delete"}
            type="button"
        >
            <i className="fas fa-trash"></i> {processing ? 'Deleting...' : 'Delete'}
        </button>
    );
};

export default function Index({ auth, rollStatements, filters, schoolInfo }) {

    // Safely access data
    const statements = rollStatements?.data || [];

    // Group roll statements by date and academic year
    const groupedStatements = statements.reduce((acc, statement) => {
        const key = `${statement.date}|${statement.academic_year}`;
        if (!acc[key]) {
            acc[key] = [];
        }
        acc[key].push(statement);
        return acc;
    }, {});

    // Convert grouped object to array for rendering
    const statementGroups = Object.entries(groupedStatements).map(([key, stmts]) => {
        const [date, academicYear] = key.split('|');
        return {
            key,
            date,
            academicYear,
            statements: stmts,
            firstStatement: stmts[0] // Use first statement for ID, UDISE, etc.
        };
    });

    // Sort groups by date descending
    statementGroups.sort((a, b) => new Date(b.date) - new Date(a.date));

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    };

    const getMonthName = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-IN', {
            month: 'long',
            year: 'numeric'
        });
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Roll Statements" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">

                    {/* Header Actions */}
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold text-gray-800">Roll Statements</h2>
                        <Link
                            href={route('roll-statements.create')}
                            className="inline-flex items-center px-4 py-2 bg-indigo-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-indigo-700 focus:bg-indigo-700 active:bg-indigo-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition ease-in-out duration-150"
                        >
                            <i className="fas fa-plus mr-2"></i>
                            Create New
                        </Link>
                    </div>

                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 bg-white border-b border-gray-200">

                            {statementGroups.length === 0 ? (
                                <div className="text-center py-10 text-gray-500">
                                    No roll statements found. Create one to get started.
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    S.No
                                                </th>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Academic Year
                                                </th>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Month / Date
                                                </th>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Last Updated
                                                </th>
                                                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Actions
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {statementGroups.map((group, index) => (
                                                <tr key={group.key} className="hover:bg-gray-50">
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {index + 1}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                        {group.academicYear}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        <div className="font-medium text-gray-900">{getMonthName(group.date)}</div>
                                                        <div className="text-xs text-gray-500">{formatDate(group.date)}</div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {group.firstStatement.last_updated_at ? (
                                                            <div className="text-xs">
                                                                <div>{group.firstStatement.last_updated_at}</div>
                                                                {group.firstStatement.updated_by_name && (
                                                                    <div className="text-gray-400">by {group.firstStatement.updated_by_name}</div>
                                                                )}
                                                            </div>
                                                        ) : (
                                                            <span className="text-gray-400">-</span>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-3">
                                                        <Link
                                                            href={route('roll-statements.show', group.firstStatement.id)}
                                                            className="text-indigo-600 hover:text-indigo-900"
                                                            title="View Details"
                                                        >
                                                            <i className="fas fa-eye"></i> View
                                                        </Link>
                                                        <Link
                                                            href={route('roll-statements.edit', group.firstStatement.id)}
                                                            className="text-blue-600 hover:text-blue-900"
                                                            title="Edit"
                                                        >
                                                            <i className="fas fa-edit"></i> Edit
                                                        </Link>
                                                        <DeleteButton
                                                            date={group.date}
                                                            academicYear={group.academicYear}
                                                            udise={group.firstStatement.udise}
                                                        />
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}