import React, { useEffect } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

export default function Create({ 
    auth, 
    academic_years = [], 
    classes = [], 
    user_udise = '', 
    school_name = '',
    school_type = '',
    existing_statement = null
}) {
    const isEditMode = !!existing_statement;
    
    // Filter classes based on school type
    const getFilteredClasses = () => {
        const classRanges = {
            'primary': ['kg', '1', '2', '3', '4', '5'],
            'middle': ['kg', '1', '2', '3', '4', '5', '6', '7', '8'],
            'secondary': ['6', '7', '8', '9', '10'],
            'senior_secondary': ['6', '7', '8', '9', '10', '11', '12']
        };
        
        const allowedClasses = classRanges[school_type] || [];
        return classes.filter(cls => allowedClasses.includes(cls.value));
    };
    
    const filteredClasses = getFilteredClasses();
    
    // Initialize form data
    const getInitialEntries = () => {
        if (existing_statement && existing_statement.entries) {
            const existingMap = {};
            existing_statement.entries.forEach(entry => {
                existingMap[entry.class] = {
                    boys: entry.boys,
                    girls: entry.girls
                };
            });
            
            return filteredClasses.map(cls => ({
                class: cls.value,
                class_label: cls.label,
                boys: existingMap[cls.value]?.boys || 0,
                girls: existingMap[cls.value]?.girls || 0
            }));
        }
        
        return filteredClasses.map(cls => ({
            class: cls.value,
            class_label: cls.label,
            boys: 0,
            girls: 0
        }));
    };

    const { data, setData, post, put, processing, errors } = useForm({
        date: existing_statement?.date || '',
        udise: user_udise,
        academic_year: existing_statement?.academic_year || '',
        is_bulk: true,
        entries: getInitialEntries()
    });

    const handleEntryChange = (index, field, value) => {
        const newEntries = [...data.entries];
        newEntries[index][field] = parseInt(value) || 0;
        setData('entries', newEntries);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        // Filter entries with students
        const filledEntries = data.entries.filter(entry => entry.boys > 0 || entry.girls > 0);
        
        if (filledEntries.length === 0) {
            alert('Please enter student counts for at least one class');
            return;
        }

        // Submit with filtered entries
        const submitData = {
            ...data,
            entries: filledEntries
        };

        if (isEditMode) {
            put(route('roll-statements.update', existing_statement.id), {
                preserveScroll: true,
                onError: (errors) => {
                    console.error('Update errors:', errors);
                }
            });
        } else {
            post(route('roll-statements.store'), {
                preserveScroll: true,
                onError: (errors) => {
                    console.error('Store errors:', errors);
                }
            });
        }
    };

    const getTotals = () => {
        return data.entries.reduce((acc, entry) => ({
            boys: acc.boys + entry.boys,
            girls: acc.girls + entry.girls,
            total: acc.total + entry.boys + entry.girls
        }), { boys: 0, girls: 0, total: 0 });
    };

    const totals = getTotals();
    const filledClasses = data.entries.filter(e => e.boys + e.girls > 0).length;

    const formatDate = (dateString) => {
        if (!dateString) return '';
        try {
            return new Date(dateString).toLocaleDateString('en-IN', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
            });
        } catch (e) {
            return dateString;
        }
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title={isEditMode ? "Edit Roll Statement" : "Create Roll Statement"} />

            <div className="py-6">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    {/* Header with Basic Information */}
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg mb-4">
                        <div className="p-4">
                            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                                {/* Left: Title and School Info */}
                                <div className="flex-shrink-0">
                                    <h2 className="text-xl font-semibold text-gray-800">
                                        {isEditMode ? 'Edit Roll Statement' : 'Create Roll Statement'}
                                    </h2>
                                    {school_name && (
                                        <p className="text-sm text-gray-600 mt-1">
                                            {school_name} • UDISE: {user_udise}
                                        </p>
                                    )}
                                    {isEditMode && (
                                        <span className="inline-flex mt-1 items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                                            Edit Mode - Date & Year Locked
                                        </span>
                                    )}
                                </div>

                                {/* Center: Basic Information Fields */}
                                <div className="flex-grow max-w-2xl">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Date <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="date"
                                                value={data.date}
                                                onChange={(e) => setData('date', e.target.value)}
                                                disabled={isEditMode}
                                                className={`w-full rounded-md shadow-sm border-gray-300 text-sm ${
                                                    isEditMode ? 'bg-gray-100 cursor-not-allowed' : ''
                                                }`}
                                                required
                                            />
                                            {errors.date && <p className="mt-1 text-xs text-red-600">{errors.date}</p>}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Academic Year <span className="text-red-500">*</span>
                                            </label>
                                            <select
                                                value={data.academic_year}
                                                onChange={(e) => setData('academic_year', e.target.value)}
                                                disabled={isEditMode}
                                                className={`w-full rounded-md shadow-sm border-gray-300 text-sm ${
                                                    isEditMode ? 'bg-gray-100 cursor-not-allowed' : ''
                                                }`}
                                                required
                                            >
                                                <option value="">Select Academic Year</option>
                                                {academic_years.map((year) => (
                                                    <option key={year} value={year}>{year}</option>
                                                ))}
                                            </select>
                                            {errors.academic_year && <p className="mt-1 text-xs text-red-600">{errors.academic_year}</p>}
                                        </div>
                                    </div>
                                </div>

                                {/* Right: View All Button */}
                                <Link
                                    href={route('roll-statements.index')}
                                    className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 text-sm font-medium whitespace-nowrap self-start"
                                >
                                    View All Records
                                </Link>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Left Side - Class Entries */}
                        <div className="space-y-6">
                            {/* Class Entries */}
                            <div className="bg-white shadow-sm sm:rounded-lg p-6 flex flex-col">
                                <h3 className="text-lg font-semibold text-gray-800 mb-4">Student Enrollment</h3>
                                
                                <div className="space-y-2 flex-grow overflow-y-auto" style={{maxHeight: 'calc(100vh - 350px)'}}>
                                    {data.entries.map((entry, index) => (
                                        <div 
                                            key={index}
                                            className={`border rounded-lg p-2 ${
                                                entry.boys + entry.girls > 0 
                                                    ? 'border-blue-300 bg-blue-50' 
                                                    : 'border-gray-200'
                                            }`}
                                        >
                                            <div className="grid grid-cols-3 gap-2 items-center">
                                                <div className="text-sm font-semibold text-gray-900">
                                                    {entry.class_label}
                                                </div>
                                                <input
                                                    type="number"
                                                    placeholder="Boys"
                                                    value={entry.boys}
                                                    onChange={(e) => handleEntryChange(index, 'boys', e.target.value)}
                                                    min="0"
                                                    className="w-full rounded-md shadow-sm border-gray-300 text-sm py-1"
                                                />
                                                <input
                                                    type="number"
                                                    placeholder="Girls"
                                                    value={entry.girls}
                                                    onChange={(e) => handleEntryChange(index, 'girls', e.target.value)}
                                                    min="0"
                                                    className="w-full rounded-md shadow-sm border-gray-300 text-sm py-1"
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex justify-end space-x-3">
                                <Link
                                    href={route('roll-statements.index')}
                                    className="px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                                >
                                    Cancel
                                </Link>
                                <button
                                    type="button"
                                    onClick={handleSubmit}
                                    disabled={processing || totals.total === 0}
                                    className="px-6 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {processing ? 'Saving...' : (isEditMode ? 'Update Statement' : 'Save Statement')}
                                </button>
                            </div>
                        </div>

                        {/* Right Side - Preview */}
                        <div className="space-y-6">
                            {/* Details Card */}
                            <div className="bg-white shadow-sm sm:rounded-lg p-6 sticky top-6 flex flex-col" style={{maxHeight: 'calc(100vh - 200px)'}}>
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-sm font-semibold text-gray-800">Roll Statement Preview</h3>
                                    {data.academic_year && (
                                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                                            {data.academic_year}
                                        </span>
                                    )}
                                </div>

                                <div className="space-y-2 flex-grow overflow-y-auto">
                                    {data.entries.filter(e => e.boys + e.girls > 0).length > 0 ? (
                                        data.entries
                                            .filter(e => e.boys + e.girls > 0)
                                            .map((entry, index) => (
                                                <div 
                                                    key={index}
                                                    className="border rounded-lg p-3 bg-gradient-to-r from-blue-50 to-indigo-50"
                                                >
                                                    <div className="flex justify-between items-center mb-2">
                                                        <p className="text-sm font-semibold text-gray-900">{entry.class_label}</p>
                                                        <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded font-medium">
                                                            Total: {entry.boys + entry.girls}
                                                        </span>
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-2">
                                                        <div className="bg-white rounded p-2 text-center">
                                                            <p className="text-xs text-gray-500">Boys</p>
                                                            <p className="text-lg font-bold text-blue-600">{entry.boys}</p>
                                                        </div>
                                                        <div className="bg-white rounded p-2 text-center">
                                                            <p className="text-xs text-gray-500">Girls</p>
                                                            <p className="text-lg font-bold text-pink-600">{entry.girls}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))
                                    ) : (
                                        <div className="text-center py-8">
                                            <p className="text-sm text-gray-500">No entries yet</p>
                                            <p className="text-xs text-gray-400 mt-1">Fill in student counts to see preview</p>
                                        </div>
                                    )}
                                </div>

                                {data.entries.filter(e => e.boys + e.girls > 0).length > 0 && (
                                    <div className="mt-4 pt-4 border-t-2 flex-shrink-0">
                                        <div className="bg-gradient-to-r from-blue-100 to-indigo-100 rounded-lg p-4">
                                            <p className="text-xs text-gray-600 font-medium mb-2 uppercase">Grand Total</p>
                                            <div className="grid grid-cols-3 gap-3">
                                                <div className="text-center">
                                                    <p className="text-xs text-gray-600">Boys</p>
                                                    <p className="text-xl font-bold text-blue-600">{totals.boys}</p>
                                                </div>
                                                <div className="text-center border-x border-gray-300">
                                                    <p className="text-xs text-gray-600">Girls</p>
                                                    <p className="text-xl font-bold text-pink-600">{totals.girls}</p>
                                                </div>
                                                <div className="text-center">
                                                    <p className="text-xs text-gray-600">Total</p>
                                                    <p className="text-xl font-bold text-indigo-600">{totals.total}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}