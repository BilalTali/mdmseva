// Location: resources/js/Pages/AmountConfiguration/Form.jsx
import { useForm } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';

export default function Form({ auth, config, schoolType, hasPrimary, hasMiddle }) {
    const isEdit = !!config;

    const { data, setData, post, put, processing, errors } = useForm({
        year: config?.year || new Date().getFullYear(),
        month: config?.month || new Date().getMonth() + 1,

        // Primary (Class 1-5)
        daily_pulses_primary: config?.daily_pulses_primary || '',
        daily_vegetables_primary: config?.daily_vegetables_primary || '',
        daily_oil_primary: config?.daily_oil_primary || '',
        daily_salt_primary: config?.daily_salt_primary || '',
        daily_fuel_primary: config?.daily_fuel_primary || '',

        // Middle (Class 6-8)
        daily_pulses_middle: config?.daily_pulses_middle || '',
        daily_vegetables_middle: config?.daily_vegetables_middle || '',
        daily_oil_middle: config?.daily_oil_middle || '',
        daily_salt_middle: config?.daily_salt_middle || '',
        daily_fuel_middle: config?.daily_fuel_middle || '',

        // ✅ UNIFIED Salt Percentages (apply to both Primary and Middle)
        salt_percentage_common: config?.salt_percentage_common || 30,
        salt_percentage_chilli: config?.salt_percentage_chilli || 20,
        salt_percentage_turmeric: config?.salt_percentage_turmeric || 20,
        salt_percentage_coriander: config?.salt_percentage_coriander || 15,
        salt_percentage_other: config?.salt_percentage_other || 15,
    });

    const [saltTotal, setSaltTotal] = useState(100);
    const [primaryAmountTotal, setPrimaryAmountTotal] = useState(0);
    const [middleAmountTotal, setMiddleAmountTotal] = useState(0);

    // Calculate unified salt percentage total
    const recalculateSaltTotal = (currentData) => {
        const total =
            parseFloat(currentData.salt_percentage_common || 0) +
            parseFloat(currentData.salt_percentage_chilli || 0) +
            parseFloat(currentData.salt_percentage_turmeric || 0) +
            parseFloat(currentData.salt_percentage_coriander || 0) +
            parseFloat(currentData.salt_percentage_other || 0);

        setSaltTotal(total);
    };

    // Initialize salt total on mount
    useEffect(() => {
        recalculateSaltTotal(data);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Calculate daily amount totals
    useEffect(() => {
        const primaryTotal =
            parseFloat(data.daily_pulses_primary || 0) +
            parseFloat(data.daily_vegetables_primary || 0) +
            parseFloat(data.daily_oil_primary || 0) +
            parseFloat(data.daily_salt_primary || 0) +
            parseFloat(data.daily_fuel_primary || 0);
        setPrimaryAmountTotal(primaryTotal);

        const middleTotal =
            parseFloat(data.daily_pulses_middle || 0) +
            parseFloat(data.daily_vegetables_middle || 0) +
            parseFloat(data.daily_oil_middle || 0) +
            parseFloat(data.daily_salt_middle || 0) +
            parseFloat(data.daily_fuel_middle || 0);
        setMiddleAmountTotal(middleTotal);
    }, [
        data.daily_pulses_primary,
        data.daily_vegetables_primary,
        data.daily_oil_primary,
        data.daily_salt_primary,
        data.daily_fuel_primary,
        data.daily_pulses_middle,
        data.daily_vegetables_middle,
        data.daily_oil_middle,
        data.daily_salt_middle,
        data.daily_fuel_middle,
    ]);

    const handleSubmit = (e) => {
        e.preventDefault();

        const round2 = (value) => {
            const num = parseFloat(value ?? 0);
            if (Number.isNaN(num)) return '';
            return Number(num.toFixed(2));
        };

        const payload = {
            year: data.year,
            month: data.month,
            // Primary amounts
            daily_pulses_primary: round2(data.daily_pulses_primary),
            daily_vegetables_primary: round2(data.daily_vegetables_primary),
            daily_oil_primary: round2(data.daily_oil_primary),
            daily_salt_primary: round2(data.daily_salt_primary),
            daily_fuel_primary: round2(data.daily_fuel_primary),
            // Middle amounts
            daily_pulses_middle: round2(data.daily_pulses_middle),
            daily_vegetables_middle: round2(data.daily_vegetables_middle),
            daily_oil_middle: round2(data.daily_oil_middle),
            daily_salt_middle: round2(data.daily_salt_middle),
            daily_fuel_middle: round2(data.daily_fuel_middle),
            // ✅ Unified salt percentages
            salt_percentage_common: round2(data.salt_percentage_common),
            salt_percentage_chilli: round2(data.salt_percentage_chilli),
            salt_percentage_turmeric: round2(data.salt_percentage_turmeric),
            salt_percentage_coriander: round2(data.salt_percentage_coriander),
            salt_percentage_other: round2(data.salt_percentage_other),
        };

        console.log('Submitting payload:', payload);

        if (isEdit) {
            put(route('amount-config.update', config.id), {
                data: payload,
                onSuccess: () => console.log('Update successful'),
                onError: (errors) => console.error('Update failed:', errors),
            });
        } else {
            post(route('amount-config.store'), {
                data: payload,
                onSuccess: () => console.log('Create successful'),
                onError: (errors) => console.error('Create failed:', errors),
            });
        }
    };

    const months = [
        { value: 1, label: 'January' },
        { value: 2, label: 'February' },
        { value: 3, label: 'March' },
        { value: 4, label: 'April' },
        { value: 5, label: 'May' },
        { value: 6, label: 'June' },
        { value: 7, label: 'July' },
        { value: 8, label: 'August' },
        { value: 9, label: 'September' },
        { value: 10, label: 'October' },
        { value: 11, label: 'November' },
        { value: 12, label: 'December' },
    ];

    const InputField = ({ label, name, value, onChange, error, type = "number", step = "0.01", required = true, helpText, onBlur }) => (
        <div className="w-full">
            <label htmlFor={name} className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
                {label} {required && <span className="text-red-500">*</span>}
            </label>
            <input
                id={name}
                type={type}
                value={value}
                onChange={(e) => onChange(name, e.target.value)}
                onBlur={onBlur}
                step={step}
                required={required}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-900 dark:text-gray-100 ${error ? 'border-red-500 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'
                    }`}
            />
            {helpText && <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{helpText}</p>}
            {error && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{error}</p>}
        </div>
    );

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <h2 className="font-semibold text-xl text-[var(--text-primary)] leading-tight">
                    {isEdit ? 'Edit Amount Configuration' : 'Create Amount Configuration'}
                </h2>
            }
        >
            <Head title={isEdit ? 'Edit Amount Configuration' : 'Create Amount Configuration'} />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-[var(--surface-00)] overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6">
                            <form onSubmit={handleSubmit} className="space-y-8">
                                {/* Period Selection */}
                                <div className="bg-gray-50 dark:bg-gray-900/50 p-6 rounded-lg">
                                    <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">Configuration Period</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label htmlFor="month" className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
                                                Month <span className="text-red-500">*</span>
                                            </label>
                                            <select
                                                id="month"
                                                value={data.month}
                                                onChange={(e) => setData('month', e.target.value)}
                                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-900 dark:text-gray-100"
                                                required
                                            >
                                                {months.map((month) => (
                                                    <option key={month.value} value={month.value}>
                                                        {month.label}
                                                    </option>
                                                ))}
                                            </select>
                                            {errors.month && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.month}</p>}
                                        </div>

                                        <div>
                                            <label htmlFor="year" className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
                                                Year <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                id="year"
                                                type="number"
                                                value={data.year}
                                                onChange={(e) => setData('year', e.target.value)}
                                                min="2020"
                                                max="2100"
                                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-900 dark:text-gray-100"
                                                required
                                            />
                                            {errors.year && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.year}</p>}
                                        </div>
                                    </div>
                                </div>

                                {/* Primary (Class 1-5) */}
                                {hasPrimary && (
                                    <div className="bg-indigo-50 dark:bg-indigo-900/20 p-6 rounded-lg">
                                        <div className="flex items-center justify-between mb-4">
                                            <h3 className="text-lg font-semibold text-indigo-900 dark:text-indigo-200">
                                                Primary (Class 1-5) - Daily Amount Configuration
                                            </h3>
                                            <div className="bg-indigo-200 dark:bg-indigo-800 px-4 py-2 rounded-lg border border-indigo-400 dark:border-indigo-600">
                                                <span className="text-sm font-medium text-indigo-800 dark:text-indigo-200 mr-2">Total:</span>
                                                <span className="text-lg font-bold text-indigo-900 dark:text-indigo-100">₹ {primaryAmountTotal.toFixed(2)}</span>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                            <InputField
                                                label="Daily Pulses Amount"
                                                name="daily_pulses_primary"
                                                value={data.daily_pulses_primary}
                                                onChange={setData}
                                                error={errors.daily_pulses_primary}
                                                helpText="Amount in ₹"
                                            />
                                            <InputField
                                                label="Daily Vegetables Amount"
                                                name="daily_vegetables_primary"
                                                value={data.daily_vegetables_primary}
                                                onChange={setData}
                                                error={errors.daily_vegetables_primary}
                                                helpText="Amount in ₹"
                                            />
                                            <InputField
                                                label="Daily Oil Amount"
                                                name="daily_oil_primary"
                                                value={data.daily_oil_primary}
                                                onChange={setData}
                                                error={errors.daily_oil_primary}
                                                helpText="Amount in ₹"
                                            />
                                            <InputField
                                                label="Ingredients Amount"
                                                name="daily_salt_primary"
                                                value={data.daily_salt_primary}
                                                onChange={setData}
                                                error={errors.daily_salt_primary}
                                                helpText="Total salt amount in ₹"
                                            />
                                            <InputField
                                                label="Daily Fuel Amount"
                                                name="daily_fuel_primary"
                                                value={data.daily_fuel_primary}
                                                onChange={setData}
                                                error={errors.daily_fuel_primary}
                                                helpText="Amount in ₹"
                                            />
                                        </div>
                                    </div>
                                )}

                                {/* Middle (Class 6-8) */}
                                {hasMiddle && (
                                    <div className="bg-purple-50 dark:bg-purple-900/20 p-6 rounded-lg">
                                        <div className="flex items-center justify-between mb-4">
                                            <h3 className="text-lg font-semibold text-purple-900 dark:text-purple-200">
                                                Middle (Class 6-8) - Daily Amount Configuration
                                            </h3>
                                            <div className="bg-purple-200 dark:bg-purple-800 px-4 py-2 rounded-lg border border-purple-400 dark:border-purple-600">
                                                <span className="text-sm font-medium text-purple-800 dark:text-purple-200 mr-2">Total:</span>
                                                <span className="text-lg font-bold text-purple-900 dark:text-purple-100">₹ {middleAmountTotal.toFixed(2)}</span>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                            <InputField
                                                label="Daily Pulses Amount"
                                                name="daily_pulses_middle"
                                                value={data.daily_pulses_middle}
                                                onChange={setData}
                                                error={errors.daily_pulses_middle}
                                                helpText="Amount in ₹"
                                            />
                                            <InputField
                                                label="Daily Vegetables Amount"
                                                name="daily_vegetables_middle"
                                                value={data.daily_vegetables_middle}
                                                onChange={setData}
                                                error={errors.daily_vegetables_middle}
                                                helpText="Amount in ₹"
                                            />
                                            <InputField
                                                label="Daily Oil Amount"
                                                name="daily_oil_middle"
                                                value={data.daily_oil_middle}
                                                onChange={setData}
                                                error={errors.daily_oil_middle}
                                                helpText="Amount in ₹"
                                            />
                                            <InputField
                                                label="Ingredients Amount"
                                                name="daily_salt_middle"
                                                value={data.daily_salt_middle}
                                                onChange={setData}
                                                error={errors.daily_salt_middle}
                                                helpText="Total salt amount in ₹"
                                            />
                                            <InputField
                                                label="Daily Fuel Amount"
                                                name="daily_fuel_middle"
                                                value={data.daily_fuel_middle}
                                                onChange={setData}
                                                error={errors.daily_fuel_middle}
                                                helpText="Amount in ₹"
                                            />
                                        </div>
                                    </div>
                                )}

                                {/* ✅ UNIFIED Salt & Condiments Percentage Breakdown */}
                                <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 p-6 rounded-lg border-2 border-green-300 dark:border-green-700 shadow-sm">
                                    <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2 flex items-center">
                                        <svg className="w-6 h-6 mr-2 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        Salt &amp; Condiments Percentage Breakdown
                                    </h3>
                                    <div className="bg-white dark:bg-gray-800 p-4 rounded-md mb-4 border border-green-200 dark:border-green-800">
                                        <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                                            <span className="font-semibold text-green-700 dark:text-green-400">✓ Unified Configuration:</span> Set the percentage distribution <span className="font-bold">once</span> below.
                                            The same percentages will automatically apply to <span className="font-semibold">both Primary (I-V)</span> and <span className="font-semibold">Middle (VI-VIII)</span> students.
                                            <span className="block mt-2 text-xs text-[var(--text-secondary)]">📊 Total must equal exactly 100%</span>
                                        </p>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        <InputField
                                            label="Common Salt %"
                                            name="salt_percentage_common"
                                            value={data.salt_percentage_common}
                                            onChange={setData}
                                            onBlur={() => recalculateSaltTotal(data)}
                                            error={errors.salt_percentage_common}
                                            helpText="Default: 30%"
                                        />
                                        <InputField
                                            label="Chilli Powder %"
                                            name="salt_percentage_chilli"
                                            value={data.salt_percentage_chilli}
                                            onChange={setData}
                                            onBlur={() => recalculateSaltTotal(data)}
                                            error={errors.salt_percentage_chilli}
                                            helpText="Default: 20%"
                                        />
                                        <InputField
                                            label="Turmeric %"
                                            name="salt_percentage_turmeric"
                                            value={data.salt_percentage_turmeric}
                                            onChange={setData}
                                            onBlur={() => recalculateSaltTotal(data)}
                                            error={errors.salt_percentage_turmeric}
                                            helpText="Default: 20%"
                                        />
                                        <InputField
                                            label="Coriander %"
                                            name="salt_percentage_coriander"
                                            value={data.salt_percentage_coriander}
                                            onChange={setData}
                                            onBlur={() => recalculateSaltTotal(data)}
                                            error={errors.salt_percentage_coriander}
                                            helpText="Default: 15%"
                                        />
                                        <InputField
                                            label="Other Condiments %"
                                            name="salt_percentage_other"
                                            value={data.salt_percentage_other}
                                            onChange={setData}
                                            onBlur={() => recalculateSaltTotal(data)}
                                            error={errors.salt_percentage_other}
                                            helpText="Default: 15%"
                                        />
                                    </div>
                                    <div className={`mt-4 p-4 rounded-lg border-2 ${Math.abs(saltTotal - 100) < 0.01
                                            ? 'bg-green-100 dark:bg-green-900/30 border-green-400 dark:border-green-600'
                                            : 'bg-yellow-100 dark:bg-yellow-900/30 border-yellow-400 dark:border-yellow-600'
                                        }`}>
                                        <div className="flex items-center justify-between">
                                            <p className={`text-sm font-semibold ${Math.abs(saltTotal - 100) < 0.01 ? 'text-green-800 dark:text-green-200' : 'text-yellow-800 dark:text-yellow-200'
                                                }`}>
                                                <span className="mr-2">
                                                    {Math.abs(saltTotal - 100) < 0.01 ? '✓' : '⚠'}
                                                </span>
                                                Total (applies to Primary &amp; Middle): {saltTotal.toFixed(2)}%
                                            </p>
                                            {Math.abs(saltTotal - 100) < 0.01 ? (
                                                <span className="text-green-700 dark:text-green-300 font-bold text-lg">Perfect! ✓</span>
                                            ) : (
                                                <span className="text-yellow-700 dark:text-yellow-300 font-semibold">Must equal 100%</span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Form Actions */}
                                <div className="flex justify-end space-x-4 pt-6 border-t border-[var(--border-light)]">
                                    <button
                                        type="button"
                                        onClick={() => window.history.back()}
                                        className="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-[var(--text-secondary)] hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={processing || Math.abs(saltTotal - 100) > 0.01}
                                        className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center"
                                    >
                                        {processing ? (
                                            <>
                                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                                Saving...
                                            </>
                                        ) : (
                                            isEdit ? 'Update Configuration' : 'Create Configuration'
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}