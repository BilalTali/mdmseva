import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';

import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import FilterPanel from '@/Components/Admin/FilterPanel';
import StatusBadge from '@/Components/Admin/StatusBadge';
import ConfirmDialog from '@/Components/Admin/ConfirmDialog';

// Decode Laravel pagination labels (&laquo;, &raquo;, etc.) and strip any HTML tags
const decodeLabel = (label) => {
    if (typeof label !== 'string') return '';
    const textarea = document.createElement('textarea');
    textarea.innerHTML = label;
    return textarea.value.replace(/<[^>]*>/g, '');
};

export default function SchoolsIndex({
    auth,
    schools,
    filters = {},
    stats = {}
}) {
    const [confirmDialog, setConfirmDialog] = useState({
        isOpen: false,
        school: null,
        action: null
    });
    const [processing, setProcessing] = useState(false);

    const handleFilterApply = (newFilters) => {
        router.get(route('admin.schools.index'), newFilters, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleFilterReset = () => {
        router.get(route('admin.schools.index'), {}, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleSort = (field) => {
        const direction = filters.sort === field && filters.direction === 'asc' ? 'desc' : 'asc';
        router.get(route('admin.schools.index'), {
            ...filters,
            sort: field,
            direction: direction
        }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const openConfirmDialog = (school, action) => {
        setConfirmDialog({
            isOpen: true,
            school: school,
            action: action
        });
    };

    const closeConfirmDialog = () => {
        setConfirmDialog({
            isOpen: false,
            school: null,
            action: null
        });
    };

    const handleActivate = () => {
        setProcessing(true);
        router.post(route('admin.schools.activate', confirmDialog.school.id), {}, {
            preserveScroll: true,
            onSuccess: () => {
                // Force a full page reload to ensure fresh data
                router.reload({ only: ['schools'] });
                closeConfirmDialog();
                setProcessing(false);
            },
            onError: (errors) => {
                setProcessing(false);
                console.error('Activation failed:', errors);
            }
        });
    };

    const handleDeactivate = () => {
        setProcessing(true);
        router.post(route('admin.schools.deactivate', confirmDialog.school.id), {}, {
            preserveScroll: true,
            onSuccess: () => {
                // Force a full page reload to ensure fresh data
                router.reload({ only: ['schools'] });
                closeConfirmDialog();
                setProcessing(false);
            },
            onError: (errors) => {
                setProcessing(false);
                console.error('Deactivation failed:', errors);
            }
        });
    };

    const handleExport = () => {
        window.location.href = route('admin.schools.export', filters);
    };

    // DELETE USER HANDLER
    const handleDelete = () => {
        setProcessing(true);
        router.delete(route('admin.schools.destroy', confirmDialog.school.id), {
            onFinish: () => {
                setProcessing(false);
                closeConfirmDialog();
            }
        });
    };


    const getSortIcon = (field) => {
        if (filters.sort !== field) {
            return (
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                </svg>
            );
        }

        if (filters.direction === 'asc') {
            return (
                <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7" />
                </svg>
            );
        }

        return (
            <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
        );
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-semibold leading-tight text-gray-800">
                            Manage Schools
                        </h2>
                        <p className="mt-1 text-sm text-gray-600">
                            Showing {schools.data.length} of {schools.total} schools
                        </p>
                    </div>
                    <button
                        onClick={handleExport}
                        className="inline-flex items-center px-4 py-2 bg-indigo-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-indigo-700 active:bg-indigo-900 focus:outline-none focus:border-indigo-900 focus:ring ring-indigo-300 transition-all ease-in-out duration-150"
                    >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        Export CSV
                    </button>
                </div>
            }
        >
            <Head title="Manage Schools" />

            <div className="py-6">
                {/* Filters */}
                <FilterPanel
                    onApply={handleFilterApply}
                    onReset={handleFilterReset}
                    showDateFilters={false}
                    showSchoolTypeFilter={true}
                    showStatusFilter={true}
                    defaultFilters={filters}
                />

                {/* Schools Table */}
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        #
                                    </th>
                                    <th
                                        scope="col"
                                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                                        onClick={() => handleSort('school_name')}
                                    >
                                        <div className="flex items-center space-x-1">
                                            <span>School Name</span>
                                            {getSortIcon('school_name')}
                                        </div>
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        User Name
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        UDISE
                                    </th>
                                    <th
                                        scope="col"
                                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                                        onClick={() => handleSort('district')}
                                    >
                                        <div className="flex items-center space-x-1">
                                            <span>Location</span>
                                            {getSortIcon('district')}
                                        </div>
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        School Type
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th
                                        scope="col"
                                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                                        onClick={() => handleSort('created_at')}
                                    >
                                        <div className="flex items-center space-x-1">
                                            <span>Registered</span>
                                            {getSortIcon('created_at')}
                                        </div>
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Profile
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {schools.data.length > 0 ? (
                                    schools.data.map((school, index) => (
                                        <tr key={school.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {schools.from + index}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <Link
                                                    href={route('admin.schools.show', school.id)}
                                                    className="text-sm font-medium text-indigo-600 hover:text-indigo-900"
                                                >
                                                    {school.school_name}
                                                </Link>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {school.name}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {school.udise}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                <div>
                                                    <div className="font-medium text-gray-900">
                                                        {school.district?.name || school.district || 'N/A'}
                                                    </div>
                                                    <div className="text-xs text-gray-500">
                                                        {school.zone?.name || school.zone || 'N/A'} · {school.state}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800 capitalize">
                                                    {school.school_type}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <StatusBadge status={school.is_active} />
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {new Date(school.created_at).toLocaleDateString('en-IN', {
                                                    day: '2-digit',
                                                    month: 'short',
                                                    year: 'numeric'
                                                })}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <Link
                                                    href={route('admin.schools.profile', school.id)}
                                                    className="text-indigo-600 hover:text-indigo-900"
                                                >
                                                    Profile
                                                </Link>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <div className="flex items-center justify-end space-x-2">
                                                    <Link
                                                        href={route('admin.schools.show', school.id)}
                                                        className="text-indigo-600 hover:text-indigo-900"
                                                    >
                                                        View
                                                    </Link>
                                                    {school.is_active ? (
                                                        <button
                                                            onClick={() => openConfirmDialog(school, 'deactivate')}
                                                            className="text-red-600 hover:text-red-900"
                                                        >
                                                            Deactivate
                                                        </button>
                                                    ) : (
                                                        <button
                                                            onClick={() => openConfirmDialog(school, 'activate')}
                                                            className="text-green-600 hover:text-green-900"
                                                        >
                                                            Activate
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={() => openConfirmDialog(school, 'delete')}
                                                        className="text-red-700 hover:text-red-900 font-semibold"
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="9" className="px-6 py-12 text-center text-sm text-gray-500">
                                            No schools found matching your filters.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {schools.total > schools.per_page && (
                        <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                            <div className="flex-1 flex justify-between sm:hidden">
                                {schools.prev_page_url && (
                                    <Link
                                        href={schools.prev_page_url}
                                        className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                                    >
                                        Previous
                                    </Link>
                                )}
                                {schools.next_page_url && (
                                    <Link
                                        href={schools.next_page_url}
                                        className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                                    >
                                        Next
                                    </Link>
                                )}
                            </div>
                            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                                <div>
                                    <p className="text-sm text-gray-700">
                                        Showing <span className="font-medium">{schools.from}</span> to{' '}
                                        <span className="font-medium">{schools.to}</span> of{' '}
                                        <span className="font-medium">{schools.total}</span> results
                                    </p>
                                </div>
                                <div>
                                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                                        {schools.links.map((link, index) => (
                                            link.url ? (
                                                <Link
                                                    key={index}
                                                    href={link.url}
                                                    className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${link.active
                                                        ? 'z-10 bg-indigo-50 border-indigo-500 text-indigo-600'
                                                        : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                                                        }`}
                                                >
                                                    {decodeLabel(link.label)}
                                                </Link>
                                            ) : (
                                                <span
                                                    key={index}
                                                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-gray-100 text-sm font-medium text-gray-400"
                                                >
                                                    {decodeLabel(link.label)}
                                                </span>
                                            )
                                        ))}
                                    </nav>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Confirmation Dialogs */}
            {confirmDialog.action === 'activate' && (
                <ConfirmDialog
                    isOpen={confirmDialog.isOpen}
                    onClose={closeConfirmDialog}
                    onConfirm={handleActivate}
                    title="Activate School"
                    message={`Are you sure you want to activate ${confirmDialog.school?.school_name}? This will allow the school to access the system again.`}
                    variant="info"
                    confirmText="Activate"
                    processing={processing}
                />
            )}

            {confirmDialog.action === 'deactivate' && (
                <ConfirmDialog
                    isOpen={confirmDialog.isOpen}
                    onClose={closeConfirmDialog}
                    onConfirm={handleDeactivate}
                    title="Deactivate School"
                    message={`Are you sure you want to deactivate ${confirmDialog.school?.school_name}? This will prevent the school from accessing the system. The school's data will be preserved and can be accessed when reactivated.`}
                    variant="danger"
                    confirmText="Deactivate"
                    processing={processing}
                />
            )}

            {confirmDialog.action === 'delete' && (
                <ConfirmDialog
                    isOpen={confirmDialog.isOpen}
                    onClose={closeConfirmDialog}
                    onConfirm={handleDelete}
                    title="⚠️ Permanently Delete School"
                    message={`Are you ABSOLUTELY sure you want to delete "${confirmDialog.school?.school_name}"?\n\nThis will PERMANENTLY DELETE:\n• All daily consumption records\n• All rice reports and amount reports\n• All configurations and settings\n• All bill records\n• All historical data\n\n⚠️ THIS ACTION CANNOT BE UNDONE!`}
                    variant="danger"
                    confirmText="Yes, Delete Permanently"
                    processing={processing}
                />
            )}
        </AuthenticatedLayout>
    );
}