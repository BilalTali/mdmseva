import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, Link } from '@inertiajs/react';
import { Calendar, ArrowLeft, Plus } from 'lucide-react';

export default function Create({ auth, month, year, previousConfig, suggestedOpening, schoolTypes, carriedBalance = null, userSchoolType }) {
    const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    const { data, setData, post, processing, errors } = useForm({
        month: month,
        year: year,
        school_type: auth.user.school_type || 'primary',
        daily_consumption_primary: 100,
        daily_consumption_upper_primary: 150,
        opening_balance_primary: carriedBalance?.primary ?? (suggestedOpening.primary || 0),
        opening_balance_upper_primary: carriedBalance?.upper_primary ?? (suggestedOpening.upper_primary || 0),
        rice_lifted_primary: 0,
        rice_lifted_upper_primary: 0,
        rice_arranged_primary: 0,
        rice_arranged_upper_primary: 0,
    });

    // Helper function to determine if upper primary fields should be shown
    const showUpperPrimary = () => {
        return data.school_type !== 'primary';
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('monthly-rice-config.store'));
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex justify-between items-center">
                    <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                        Create Rice Configuration - {monthNames[month - 1]} {year}
                    </h2>
                    <Link
                        href={route('monthly-rice-config.index')}
                        className="inline-flex items-center px-4 py-2 bg-gray-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-gray-700"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back
                    </Link>
                </div>
            }
        >
            <Head title={`Create Configuration - ${monthNames[month - 1]} ${year}`} />

            <div className="py-12">
                <div className="max-w-4xl mx-auto sm:px-6 lg:px-8">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Period Information */}
                        <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
                            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                                <Calendar className="w-5 h-5 mr-2" />
                                Period Information
                            </h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Month</label>
                                    <input
                                        type="text"
                                        value={monthNames[month - 1]}
                                        disabled
                                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm bg-gray-50"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Year</label>
                                    <input
                                        type="text"
                                        value={year}
                                        disabled
                                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm bg-gray-50"
                                    />
                                </div>
                            </div>
                        </div>

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
                            {previousConfig && (
                                <div className="mb-4 p-4 bg-green-50 border-l-4 border-green-500 rounded-md">
                                    <p className="text-sm text-green-800 font-medium mb-1">
                                        ✓ Auto-filled from {monthNames[(month === 1 ? 12 : month - 1) - 1]} {month === 1 ? year - 1 : year}:
                                    </p>
                                    <div className="text-sm text-green-700">
                                        <span>Primary: <strong>{suggestedOpening.primary} kg</strong></span>
                                        {showUpperPrimary() && (
                                            <span className="ml-4">Middle: <strong>{suggestedOpening.upper_primary} kg</strong></span>
                                        )}
                                    </div>
                                    <p className="text-xs text-green-600 mt-1">✎ You can edit these values if needed</p>
                                </div>
                            )}
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
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Rice Lifted (kg) - Optional</h3>
                            <div className={`grid ${showUpperPrimary() ? 'grid-cols-2' : 'grid-cols-1'} gap-4`}>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Primary (kg)</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={data.rice_lifted_primary}
                                        onChange={(e) => setData('rice_lifted_primary', parseFloat(e.target.value) || 0)}
                                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                    />
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
                                        />
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Rice Arranged (Optional) */}
                        <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Rice Arranged (kg) - Optional</h3>
                            <div className={`grid ${showUpperPrimary() ? 'grid-cols-2' : 'grid-cols-1'} gap-4`}>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Primary (kg)</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={data.rice_arranged_primary}
                                        onChange={(e) => setData('rice_arranged_primary', parseFloat(e.target.value) || 0)}
                                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                    />
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
                                        />
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex justify-end space-x-3">
                            <Link
                                href={route('monthly-rice-config.index')}
                                className="inline-flex items-center px-4 py-2 bg-gray-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-gray-700"
                            >
                                Cancel
                            </Link>
                            <button
                                type="submit"
                                disabled={processing}
                                className="inline-flex items-center px-4 py-2 bg-indigo-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-indigo-700 disabled:opacity-50"
                            >
                                <Plus className="w-4 h-4 mr-2" />
                                {processing ? 'Creating...' : 'Create Configuration'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
