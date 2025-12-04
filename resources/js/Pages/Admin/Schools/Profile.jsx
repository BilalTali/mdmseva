import React from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

export default function AdminSchoolProfile(props) {
    const { school = {} } = props;

    const { data, setData, patch, processing, errors } = useForm({
        name: school.name || '',
        email: school.email || '',
        phone: school.phone || '',
        state: school.state || 'Jammu and Kashmir',
        district_id: school.district_id || '',
        zone_id: school.zone_id || '',
        udise_code: school.udise_code || school.udise || '',
        school_name: school.school_name || '',
        school_type: school.school_type || 'primary',
        institute_address: school.institute_address || '',
        school_pincode: school.school_pincode || '',
        password: '',
        password_confirmation: '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        patch(route('admin.schools.update', school.id), {
            preserveScroll: true,
        });
    };

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
                            Edit School Profile{school?.school_name ? ` - ${school.school_name}` : ''}
                        </h2>
                    </div>
                    <div className="text-sm text-gray-500">
                        {school?.district?.name ? `District: ${school.district.name}` : ''}
                    </div>
                </div>
            }
        >
            <Head title={`Admin - Edit School ${school?.school_name || school?.name || ''}`} />

            <div className="py-8">
                <div className="max-w-4xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white shadow-sm rounded-lg p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">School &amp; User Profile</h3>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Personal / account details */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                                    <input
                                        type="text"
                                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        required
                                    />
                                    {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                    <input
                                        type="email"
                                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                                        value={data.email}
                                        onChange={(e) => setData('email', e.target.value)}
                                        required
                                    />
                                    {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                                    <input
                                        type="tel"
                                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                                        value={data.phone}
                                        onChange={(e) => setData('phone', e.target.value.replace(/\D/g, '').slice(0, 10))}
                                    />
                                    {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone}</p>}
                                </div>

                            </div>

                            {/* Password reset (optional) */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">New Password (optional)</label>
                                    <input
                                        type="password"
                                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                                        value={data.password}
                                        onChange={(e) => setData('password', e.target.value)}
                                    />
                                    {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                                    <input
                                        type="password"
                                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                                        value={data.password_confirmation}
                                        onChange={(e) => setData('password_confirmation', e.target.value)}
                                    />
                                    {errors.password_confirmation && <p className="mt-1 text-sm text-red-600">{errors.password_confirmation}</p>}
                                </div>
                            </div>

                            {/* School details */}
                            <div className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">UDISE Code</label>
                                        <input
                                            type="text"
                                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                                            value={data.udise_code}
                                            onChange={(e) => setData('udise_code', e.target.value)}
                                            required
                                        />
                                        {errors.udise_code && <p className="mt-1 text-sm text-red-600">{errors.udise_code}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">School Name</label>
                                        <input
                                            type="text"
                                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                                            value={data.school_name}
                                            onChange={(e) => setData('school_name', e.target.value)}
                                            required
                                        />
                                        {errors.school_name && <p className="mt-1 text-sm text-red-600">{errors.school_name}</p>}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">School Type</label>
                                        <select
                                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                                            value={data.school_type}
                                            onChange={(e) => setData('school_type', e.target.value)}
                                        >
                                            <option value="primary">Primary (Class 1-5)</option>
                                            <option value="middle">Middle (Class 1-8)</option>
                                            <option value="secondary">Secondary (Class 1-10/12)</option>
                                        </select>
                                        {errors.school_type && <p className="mt-1 text-sm text-red-600">{errors.school_type}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Pincode</label>
                                        <input
                                            type="text"
                                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                                            value={data.school_pincode}
                                            onChange={(e) => setData('school_pincode', e.target.value)}
                                        />
                                        {errors.school_pincode && <p className="mt-1 text-sm text-red-600">{errors.school_pincode}</p>}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">School Address</label>
                                    <textarea
                                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                                        rows={3}
                                        value={data.institute_address}
                                        onChange={(e) => setData('institute_address', e.target.value)}
                                    />
                                    {errors.institute_address && <p className="mt-1 text-sm text-red-600">{errors.institute_address}</p>}
                                </div>
                            </div>

                            {/* Location (simple text fields for admin) */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                                    <input
                                        type="text"
                                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                                        value={data.state}
                                        onChange={(e) => setData('state', e.target.value)}
                                    />
                                    {errors.state && <p className="mt-1 text-sm text-red-600">{errors.state}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">District ID</label>
                                    <input
                                        type="number"
                                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                                        value={data.district_id || ''}
                                        onChange={(e) => setData('district_id', e.target.value)}
                                    />
                                    {errors.district_id && <p className="mt-1 text-sm text-red-600">{errors.district_id}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Zone ID</label>
                                    <input
                                        type="number"
                                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                                        value={data.zone_id || ''}
                                        onChange={(e) => setData('zone_id', e.target.value)}
                                    />
                                    {errors.zone_id && <p className="mt-1 text-sm text-red-600">{errors.zone_id}</p>}
                                </div>
                            </div>

                            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 mt-4">
                                <Link
                                    href={route('admin.schools.index')}
                                    className="px-4 py-2 text-sm rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50"
                                >
                                    Cancel
                                </Link>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="px-4 py-2 text-sm font-semibold rounded-md bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50"
                                >
                                    {processing ? 'Saving...' : 'Save Changes'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
