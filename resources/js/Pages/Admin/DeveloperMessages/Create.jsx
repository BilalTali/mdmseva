import React, { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { ArrowLeft, Upload, X } from 'lucide-react';

export default function CreateTeamMember() {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        designation: '',
        role: '',
        message: '',
        image: null,
        status: false
    });

    const [imagePreview, setImagePreview] = useState(null);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setData('image', file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const removeImage = () => {
        setData('image', null);
        setImagePreview(null);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('admin.developer-messages.store'));
    };

    return (
        <AdminLayout>
            <Head title="Add Team Member" />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center space-x-4">
                    <Link
                        href={route('admin.developer-messages.index')}
                        className="text-gray-600 hover:text-gray-900"
                    >
                        <ArrowLeft className="w-6 h-6" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Add Team Member</h1>
                        <p className="text-gray-600">Add a new team member to display on homepage</p>
                    </div>
                </div>

                {/* Form */}
                <div className="bg-white rounded-lg shadow-sm border p-6">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Name & Designation Row */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Name */}
                            <div>
                                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                                    Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    id="name"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.name ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                    placeholder="Enter member name"
                                />
                                {errors.name && (
                                    <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                                )}
                            </div>

                            {/* Designation */}
                            <div>
                                <label htmlFor="designation" className="block text-sm font-medium text-gray-700 mb-2">
                                    Designation <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    id="designation"
                                    value={data.designation}
                                    onChange={(e) => setData('designation', e.target.value)}
                                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.designation ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                    placeholder="e.g., Lead Developer"
                                />
                                {errors.designation && (
                                    <p className="mt-1 text-sm text-red-600">{errors.designation}</p>
                                )}
                            </div>
                        </div>

                        {/* Role */}
                        <div>
                            <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-2">
                                Role (Optional)
                            </label>
                            <input
                                type="text"
                                id="role"
                                value={data.role}
                                onChange={(e) => setData('role', e.target.value)}
                                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.role ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                placeholder="e.g., Backend Specialist, Frontend Expert"
                            />
                            {errors.role && (
                                <p className="mt-1 text-sm text-red-600">{errors.role}</p>
                            )}
                        </div>

                        {/* Message */}
                        <div>
                            <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                                Message <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                id="message"
                                rows="4"
                                value={data.message}
                                onChange={(e) => setData('message', e.target.value)}
                                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.message ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                placeholder="Short message from this team member"
                            />
                            {errors.message && (
                                <p className="mt-1 text-sm text-red-600">{errors.message}</p>
                            )}
                        </div>

                        {/* Image Upload */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Profile Image (Optional)
                            </label>

                            {!imagePreview ? (
                                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                                    <div className="flex flex-col items-center">
                                        <Upload className="w-12 h-12 text-gray-400 mb-3" />
                                        <label
                                            htmlFor="image"
                                            className="cursor-pointer text-blue-600 hover:text-blue-700 font-medium"
                                        >
                                            Click to upload
                                            <input
                                                type="file"
                                                id="image"
                                                accept="image/jpeg,image/jpg,image/png"
                                                onChange={handleImageChange}
                                                className="hidden"
                                            />
                                        </label>
                                        <p className="text-xs text-gray-500 mt-1">
                                            JPG, JPEG, PNG (Max 2MB) - Square images work best
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <div className="relative inline-block">
                                    <img
                                        src={imagePreview}
                                        alt="Preview"
                                        className="h-32 w-32 rounded-full object-cover shadow-md border-4 border-white"
                                    />
                                    <button
                                        type="button"
                                        onClick={removeImage}
                                        className="absolute top-0 right-0 bg-red-600 text-white rounded-full p-1 hover:bg-red-700"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            )}

                            {errors.image && (
                                <p className="mt-1 text-sm text-red-600">{errors.image}</p>
                            )}
                        </div>

                        {/* Status */}
                        <div>
                            <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
                                Status <span className="text-red-500">*</span>
                            </label>
                            <select
                                id="status"
                                value={data.status ? '1' : '0'}
                                onChange={(e) => setData('status', e.target.value === '1')}
                                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.status ? 'border-red-500' : 'border-gray-300'
                                    }`}
                            >
                                <option value="0">Inactive</option>
                                <option value="1">Active</option>
                            </select>
                            <p className="mt-1 text-xs text-gray-500">
                                Multiple team members can be active at once
                            </p>
                            {errors.status && (
                                <p className="mt-1 text-sm text-red-600">{errors.status}</p>
                            )}
                        </div>

                        {/* Actions */}
                        <div className="flex items-center space-x-4 pt-4 border-t">
                            <button
                                type="submit"
                                disabled={processing}
                                className="px-6 py-2 bg-gradient-to-r from-amber-600 to-orange-600 text-white rounded-lg hover:from-amber-700 hover:to-orange-700 transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {processing ? 'Adding...' : 'Add Team Member'}
                            </button>
                            <Link
                                href={route('admin.developer-messages.index')}
                                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </Link>
                        </div>
                    </form>
                </div>
            </div>
        </AdminLayout>
    );
}
