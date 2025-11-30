import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, Link } from '@inertiajs/react';
import { Calendar, ArrowLeft, Save } from 'lucide-react';

export default function Edit({ auth, config, schoolTypes, userSchoolType }) {
    const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    const { data, setData, put, processing, errors } = useForm({
        month: config.month,
        year: config.year,
        school_type: config.school_type,
        daily_consumption_primary: config.daily_consumption_primary,
        daily_consumption_upper_primary: config.daily_consumption_upper_primary,
        opening_balance_primary: config.opening_balance_primary,
        opening_balance_upper_primary: config.opening_balance_upper_primary,
        rice_lifted_primary: config.rice_lifted_primary,
        rice_lifted_upper_primary: config.rice_lifted_upper_primary,
        rice_arranged_primary: config.rice_arranged_primary,
        rice_arranged_upper_primary: config.rice_arranged_upper_primary,
    });

    // Helper function to determine if upper primary fields should be shown
    const showUpperPrimary = () => {
        return data.school_type !== 'primary';
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        put(route('monthly-rice-config.update'));
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex justify-between items-center">
                    <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                        Edit Rice Configuration - {monthNames[config.month - 1]} {config.year}
                    </h2>
                    <Link
                        href={route('monthly-rice-config.index', { month: config.month, year: config.year })}
                        className="inline-flex items-center px-4 py-2 bg-gray-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-gray-700"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back
                    </Link>
                </div>
            }
        >
            <Head title={`Edit Configuration - ${monthNames[config.month - 1]} ${config.year}`} />

            <div className="py-12">
                <div className="max-w-4xl mx-auto sm:px-6 lg:px-8">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* School Configuration */}
                        <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">School Configuration</h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">School Type</label>
                                    <select
                                        value={data.school_type}
                                        onChange={(e) => setData('school_type', e.target.value)}
                                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                    >
                                        {Object.entries(schoolTypes).map(([key, value]) => (
                                            <option key={key} value={key}>{value}</option>
                                        ))}
                                    </select>
                                    {errors.school_type && <p className="mt-1 text-sm text-red-600">{errors.school_type}</p>}
                                </div>
                            </div>
                        </div>

                        {/* Daily Consumption Rates */}
                        <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Daily Consumption Rates (grams per student)</h3>
                            <div className={`grid ${showUpperPrimary() ? 'grid-cols-2' : 'grid-cols-1'} gap-4`}>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Primary (Grades 1-5)</label>
                                    <input
                                        type="number"
                                        value={data.daily_consumption_primary}
                                        onChange={(e) => setData('daily_consumption_primary', parseInt(e.target.value))}
                                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                        min="0"
                                        max="500"
                                    />
                                    {errors.daily_consumption_primary && <p className="mt-1 text-sm text-red-600">{errors.daily_consumption_primary}</p>}
                                </div>
                                {showUpperPrimary() && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Middle (Grades 6-8)</label>
                                        <input
                                            type="number"
                                            value={data.daily_consumption_upper_primary}
                                            onChange={(e) => setData('daily_consumption_upper_primary', parseInt(e.target.value))}
                                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                            min="0"
                                            max="500"
                                        />
                                        {errors.daily_consumption_upper_primary && <p className="mt-1 text-sm text-red-600">{errors.daily_consumption_upper_primary}</p>}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Opening Balance */}
                        <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Opening Balance (kg)</h3>
                            <div className={`grid ${showUpperPrimary() ? 'grid-cols-2' : 'grid-cols-1'} gap-4`}>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Primary (kg)</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={data.opening_balance_primary}
                                        onChange={(e) => setData('opening_balance_primary', parseFloat(e.target.value))}
                                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                    />
                                    {errors.opening_balance_primary && <p className="mt-1 text-sm text-red-600">{errors.opening_balance_primary}</p>}
                                </div>
                                {showUpperPrimary() && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Middle (kg)</label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            value={data.opening_balance_upper_primary}
                                            onChange={(e) => setData('opening_balance_upper_primary', parseFloat(e.target.value))}
                                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                        />
                                        {errors.opening_balance_upper_primary && <p className="mt-1 text-sm text-red-600">{errors.opening_balance_upper_primary}</p>}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Rice Lifted (Optional) */}
                        <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Rice Lifted (kg)</h3>
                            <div className={`grid ${showUpperPrimary() ? 'grid-cols-2' : 'grid-cols-1'} gap-4`}>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Primary (kg)</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={data.rice_lifted_primary}
                                        onChange={(e) => setData('rice_lifted_primary', parseFloat(e.target.value) || 0)}
                                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                        min="0"
                                    />
                                    {errors.rice_lifted_primary && <p className="mt-1 text-sm text-red-600">{errors.rice_lifted_primary}</p>}
                                </div>
                                {showUpperPrimary() && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Middle (kg)</label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            value={data.rice_lifted_upper_primary}
                                            onChange={(e) => setData('rice_lifted_upper_primary', parseFloat(e.target.value) || 0)}
                                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                            min="0"
                                        />
                                        {errors.rice_lifted_upper_primary && <p className="mt-1 text-sm text-red-600">{errors.rice_lifted_upper_primary}</p>}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Rice Arranged (Optional) */}
                        <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Rice Arranged (kg)</h3>
                            <div className={`grid ${showUpperPrimary() ? 'grid-cols-2' : 'grid-cols-1'} gap-4`}>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Primary (kg)</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={data.rice_arranged_primary}
                                        onChange={(e) => setData('rice_arranged_primary', parseFloat(e.target.value) || 0)}
                                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                        min="0"
                                    />
                                    {errors.rice_arranged_primary && <p className="mt-1 text-sm text-red-600">{errors.rice_arranged_primary}</p>}
                                </div>
                                {showUpperPrimary() && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Middle (kg)</label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            value={data.rice_arranged_upper_primary}
                                            onChange={(e) => setData('rice_arranged_upper_primary', parseFloat(e.target.value) || 0)}
                                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                            min="0"
                                        />
                                        {errors.rice_arranged_upper_primary && <p className="mt-1 text-sm text-red-600">{errors.rice_arranged_upper_primary}</p>}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex justify-end space-x-3">
                            <Link
                                href={route('monthly-rice-config.index', { month: config.month, year: config.year })}
                                className="inline-flex items-center px-4 py-2 bg-gray-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-gray-700"
                            >
                                Cancel
                            </Link>
                            <button
                                type="submit"
                                disabled={processing}
                                className="inline-flex items-center px-4 py-2 bg-indigo-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-indigo-700 disabled:opacity-50"
                            >
                                <Save className="w-4 h-4 mr-2" />
                                {processing ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
