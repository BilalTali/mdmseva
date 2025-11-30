import { useEffect, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import GuestLayout from '@/Layouts/GuestLayout';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { Head, Link, useForm } from '@inertiajs/react';
import axios from 'axios';

export default function Register() {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        phone: '',
        date_of_birth: '',
        state: 'Jammu and Kashmir',
        district_id: '',
        zone_id: '',
        udise_code: '',
        school_name: '',
        school_type: 'primary',
        institute_address: '',
        school_pincode: '',
    });

    const [step, setStep] = useState(1);
    const [districts, setDistricts] = useState([]);
    const [zones, setZones] = useState([]);
    const [loadingDistricts, setLoadingDistricts] = useState(false);
    const [loadingZones, setLoadingZones] = useState(false);
    const [locationError, setLocationError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // Load districts when component mounts and when state changes
    useEffect(() => {
        if (data.state) {
            loadDistricts(data.state);
        }
    }, [data.state]);

    const loadDistricts = async (state) => {
        setLoadingDistricts(true);
        setLocationError('');
        try {
            const response = await axios.get('/api/districts', {
                params: { state }
            });
            setDistricts(response.data.data || []);
            setData('district_id', '');
            setData('zone_id', '');
            setZones([]);
        } catch (error) {
            console.error('Failed to load districts:', error);
            setLocationError('Failed to load districts. Please refresh the page.');
            setDistricts([]);
        } finally {
            setLoadingDistricts(false);
        }
    };

    const handleDistrictChange = async (districtId) => {
        setData('district_id', districtId);
        setData('zone_id', '');
        setZones([]);

        if (!districtId) return;

        setLoadingZones(true);
        setLocationError('');
        try {
            const response = await axios.get(`/api/zones/${districtId}`);
            setZones(response.data.data || []);
        } catch (error) {
            console.error('Failed to load zones:', error);
            setLocationError('Failed to load zones. Please try again.');
            setZones([]);
        } finally {
            setLoadingZones(false);
        }
    };

    const submit = (e) => {
        e.preventDefault();

        const step1Fields = [
            'name',
            'email',
            'password',
            'password_confirmation',
            'phone',
            'date_of_birth',
        ];

        const step2Fields = [
            'state',
            'district_id',
            'zone_id',
        ];

        const step3Fields = [
            'udise_code',
            'school_name',
            'school_type',
            'institute_address',
            'school_pincode',
        ];

        post(route('register'), {
            preserveScroll: true,
            onError: (errs) => {
                const errorKeys = Object.keys(errs || {});

                if (errorKeys.length === 0) return;

                // If any school fields have errors, jump to Step 3
                if (errorKeys.some((k) => step3Fields.includes(k))) {
                    setStep(3);
                    return;
                }

                // Else if any location fields have errors, jump to Step 2
                if (errorKeys.some((k) => step2Fields.includes(k))) {
                    setStep(2);
                    return;
                }

                // Otherwise default to Step 1 for personal info errors
                setStep(1);
            },
        });
    };

    return (
        <GuestLayout>
            <Head title="Register" />

            {/* Step indicator */}
            <div className="mb-6 grid gap-3 sm:grid-cols-3">
                <div className="flex items-center gap-3">
                    <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-semibold ${step === 1 ? 'bg-primary-600 text-white' : 'bg-secondary-200 dark:bg-secondary-700 text-[var(--text-secondary)]'}`}>
                        1
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-[var(--text-primary)]">Personal details</p>
                        <p className="text-xs text-[var(--text-tertiary)]">Account &amp; contact information</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-semibold ${step === 2 ? 'bg-primary-600 text-white' : 'bg-secondary-200 dark:bg-secondary-700 text-[var(--text-secondary)]'}`}>
                        2
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-[var(--text-primary)]">Location</p>
                        <p className="text-xs text-[var(--text-tertiary)]">State, district &amp; zone</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-semibold ${step === 3 ? 'bg-primary-600 text-white' : 'bg-secondary-200 dark:bg-secondary-700 text-[var(--text-secondary)]'}`}>
                        3
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-[var(--text-primary)]">School details</p>
                        <p className="text-xs text-[var(--text-tertiary)]">Institute details for MDM</p>
                    </div>
                </div>
            </div>

            <form onSubmit={submit} className="space-y-6">
                {errors.registration && (
                    <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                        {errors.registration}
                    </div>
                )}
                {/* Step 1: Personal Information Section */}
                {step === 1 && (
                    <div className="bg-[var(--surface-00)] shadow sm:rounded-lg p-6 border border-[var(--border-light)]">
                        <h3 className="text-lg font-medium text-[var(--text-primary)] mb-4">Personal Information</h3>

                        <div className="space-y-4">
                            {/* Name */}
                            <div>
                                <InputLabel htmlFor="name" value="Full Name *" />
                                <TextInput
                                    id="name"
                                    name="name"
                                    value={data.name}
                                    className="mt-1 block w-full"
                                    autoComplete="name"
                                    isFocused={true}
                                    onChange={(e) => setData('name', e.target.value)}
                                    required
                                />
                                <InputError message={errors.name} className="mt-2" />
                            </div>

                            {/* Email */}
                            <div>
                                <InputLabel htmlFor="email" value="Email Address *" />
                                <TextInput
                                    id="email"
                                    type="email"
                                    name="email"
                                    value={data.email}
                                    className="mt-1 block w-full"
                                    autoComplete="username"
                                    onChange={(e) => setData('email', e.target.value)}
                                    required
                                />
                                <InputError message={errors.email} className="mt-2" />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Password */}
                                <div>
                                    <InputLabel htmlFor="password" value="Password *" />
                                    <div className="relative">
                                        <TextInput
                                            id="password"
                                            type={showPassword ? 'text' : 'password'}
                                            name="password"
                                            value={data.password}
                                            className="mt-1 block w-full pr-10"
                                            autoComplete="new-password"
                                            onChange={(e) => setData('password', e.target.value)}
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword((v) => !v)}
                                            className="absolute inset-y-0 right-2 flex items-center text-[var(--text-tertiary)] hover:text-secondary-700 dark:hover:text-secondary-200"
                                            aria-label={showPassword ? 'Hide password' : 'Show password'}
                                        >
                                            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                        </button>
                                    </div>
                                    <InputError message={errors.password} className="mt-2" />
                                </div>

                                {/* Confirm Password */}
                                <div>
                                    <InputLabel htmlFor="password_confirmation" value="Confirm Password *" />
                                    <div className="relative">
                                        <TextInput
                                            id="password_confirmation"
                                            type={showConfirmPassword ? 'text' : 'password'}
                                            name="password_confirmation"
                                            value={data.password_confirmation}
                                            className="mt-1 block w-full pr-10"
                                            autoComplete="new-password"
                                            onChange={(e) => setData('password_confirmation', e.target.value)}
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowConfirmPassword((v) => !v)}
                                            className="absolute inset-y-0 right-2 flex items-center text-[var(--text-tertiary)] hover:text-secondary-700 dark:hover:text-secondary-200"
                                            aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                                        >
                                            {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                        </button>
                                    </div>
                                    <InputError message={errors.password_confirmation} className="mt-2" />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Phone */}
                                <div>
                                    <InputLabel htmlFor="phone" value="Phone Number" />
                                    <TextInput
                                        id="phone"
                                        type="tel"
                                        name="phone"
                                        value={data.phone}
                                        inputMode="numeric"
                                        pattern="[0-9]{10}"
                                        maxLength={10}
                                        className="mt-1 block w-full"
                                        onChange={(e) => {
                                            const digits = e.target.value.replace(/\D/g, '').slice(0, 10);
                                            setData('phone', digits);
                                        }}
                                    />
                                    <InputError message={errors.phone} className="mt-2" />
                                </div>

                                {/* Date of Birth */}
                                <div>
                                    <InputLabel htmlFor="date_of_birth" value="Date of Birth" />
                                    <TextInput
                                        id="date_of_birth"
                                        type="date"
                                        name="date_of_birth"
                                        value={data.date_of_birth}
                                        className="mt-1 block w-full"
                                        onChange={(e) => setData('date_of_birth', e.target.value)}
                                    />
                                    <InputError message={errors.date_of_birth} className="mt-2" />
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Step 2: Location Information Section */}
                {step === 2 && (
                    <div className="bg-[var(--surface-00)] shadow sm:rounded-lg p-6 border border-[var(--border-light)]">
                        <h3 className="text-lg font-medium text-[var(--text-primary)] mb-4">Location Information</h3>

                        {locationError && (
                            <div className="mb-4 bg-error-50 border border-error-200 text-error-600 px-4 py-3 rounded relative">
                                <span className="block sm:inline">{locationError}</span>
                            </div>
                        )}

                        <div className="space-y-4">
                            {/* State/UT Selection */}
                            <div>
                                <InputLabel htmlFor="state" value="State/Union Territory *" />
                                <select
                                    id="state"
                                    name="state"
                                    value={data.state}
                                    onChange={(e) => setData('state', e.target.value)}
                                    className="mt-1 block w-full border-[var(--border-light)] dark:bg-secondary-900 dark:text-secondary-100 focus:border-[var(--primary-500)] focus:ring-[var(--primary-500)] rounded-md shadow-sm"
                                    required
                                >
                                    <option value="Jammu and Kashmir">Jammu and Kashmir</option>
                                    <option value="Ladakh">Ladakh</option>
                                </select>
                                <InputError message={errors.state} className="mt-2" />
                            </div>

                            {/* District Selection */}
                            <div>
                                <InputLabel htmlFor="district_id" value="District *" />
                                <select
                                    id="district_id"
                                    name="district_id"
                                    value={data.district_id}
                                    onChange={(e) => handleDistrictChange(e.target.value)}
                                    disabled={loadingDistricts}
                                    className="mt-1 block w-full border-[var(--border-light)] dark:bg-secondary-900 dark:text-secondary-100 focus:border-[var(--primary-500)] focus:ring-[var(--primary-500)] rounded-md shadow-sm disabled:bg-secondary-100 dark:disabled:bg-secondary-800"
                                    required
                                >
                                    <option value="">
                                        {loadingDistricts ? 'Loading districts...' : 'Select District'}
                                    </option>
                                    {districts.map((district) => (
                                        <option key={district.id} value={district.id}>
                                            {district.name}
                                        </option>
                                    ))}
                                </select>
                                <InputError message={errors.district_id} className="mt-2" />
                            </div>

                            {/* Zone Selection */}
                            <div>
                                <InputLabel htmlFor="zone_id" value="Zone *" />
                                <select
                                    id="zone_id"
                                    name="zone_id"
                                    value={data.zone_id}
                                    onChange={(e) => setData('zone_id', e.target.value)}
                                    disabled={!data.district_id || loadingZones}
                                    className="mt-1 block w-full border-[var(--border-light)] dark:bg-secondary-900 dark:text-secondary-100 focus:border-[var(--primary-500)] focus:ring-[var(--primary-500)] rounded-md shadow-sm disabled:bg-secondary-100 dark:disabled:bg-secondary-800"
                                    required
                                >
                                    <option value="">
                                        {loadingZones ? 'Loading zones...' :
                                            !data.district_id ? 'Select district first' :
                                                'Select Zone'}
                                    </option>
                                    {zones.map((zone) => (
                                        <option key={zone.id} value={zone.id}>
                                            {zone.name}
                                        </option>
                                    ))}
                                </select>
                                <InputError message={errors.zone_id} className="mt-2" />
                            </div>
                        </div>
                    </div>
                )}

                {/* Step 3: School Information Section */}
                {step === 3 && (
                    <div className="bg-[var(--surface-00)] shadow sm:rounded-lg p-6 border border-[var(--border-light)]">
                        <h3 className="text-lg font-medium text-[var(--text-primary)] mb-4">School Information</h3>

                        <div className="space-y-4">
                            <div>
                                <InputLabel htmlFor="udise_code" value="UDISE Code *" />
                                <TextInput
                                    id="udise_code"
                                    type="text"
                                    name="udise_code"
                                    value={data.udise_code}
                                    className="mt-1 block w-full"
                                    maxLength={20}
                                    onChange={(e) => setData('udise_code', e.target.value)}
                                    required
                                />
                                <p className="mt-1 text-sm text-[var(--text-tertiary)]">
                                    Unified District Information System for Education code
                                </p>
                                <InputError message={errors.udise_code} className="mt-2" />
                            </div>

                            {/* School Name */}
                            <div>
                                <InputLabel htmlFor="school_name" value="School Name *" />
                                <TextInput
                                    id="school_name"
                                    type="text"
                                    name="school_name"
                                    value={data.school_name}
                                    className="mt-1 block w-full"
                                    onChange={(e) => setData('school_name', e.target.value)}
                                    required
                                />
                                <InputError message={errors.school_name} className="mt-2" />
                            </div>

                            {/* School Type */}
                            <div>
                                <InputLabel htmlFor="school_type" value="School Type *" />
                                <select
                                    id="school_type"
                                    name="school_type"
                                    value={data.school_type}
                                    onChange={(e) => setData('school_type', e.target.value)}
                                    className="mt-1 block w-full border-[var(--border-light)] dark:bg-secondary-900 dark:text-secondary-100 focus:border-[var(--primary-500)] focus:ring-[var(--primary-500)] rounded-md shadow-sm"
                                    required
                                >
                                    <option value="primary">Primary (Class 1-5)</option>
                                    <option value="middle">Middle (Class 1-8)</option>
                                    <option value="secondary">Secondary (Class 1-10/12)</option>
                                </select>
                                <InputError message={errors.school_type} className="mt-2" />
                            </div>

                            {/* Institute Address */}
                            <div>
                                <InputLabel htmlFor="institute_address" value="School Address *" />
                                <textarea
                                    id="institute_address"
                                    name="institute_address"
                                    value={data.institute_address}
                                    className="mt-1 block w-full border-[var(--border-light)] dark:bg-secondary-900 dark:text-secondary-100 focus:border-[var(--primary-500)] focus:ring-[var(--primary-500)] rounded-md shadow-sm"
                                    rows="3"
                                    onChange={(e) => setData('institute_address', e.target.value)}
                                    required
                                />
                                <InputError message={errors.institute_address} className="mt-2" />
                            </div>

                            {/* School Pincode */}
                            <div>
                                <InputLabel htmlFor="school_pincode" value="Pincode *" />
                                <TextInput
                                    id="school_pincode"
                                    type="text"
                                    name="school_pincode"
                                    value={data.school_pincode}
                                    className="mt-1 block w-full"
                                    maxLength="6"
                                    onChange={(e) => setData('school_pincode', e.target.value)}
                                    required
                                />
                                <InputError message={errors.school_pincode} className="mt-2" />
                            </div>
                        </div>
                    </div>
                )}

                {/* Step navigation */}
                {step === 1 && (
                    <div className="flex items-center justify-between">
                        <Link
                            href={route('login')}
                            className="text-sm text-[var(--text-secondary)] hover:text-secondary-900 dark:hover:text-secondary-100 underline"
                        >
                            Already registered?
                        </Link>

                        <button
                            type="button"
                            className="px-4 py-2 text-sm font-medium rounded-md bg-primary-600 dark:bg-primary-500 text-white hover:bg-primary-700 dark:hover:bg-primary-400"
                            onClick={() => setStep(2)}
                        >
                            Next
                        </button>
                    </div>
                )}

                {step === 2 && (
                    <div className="flex items-center justify-between">
                        <button
                            type="button"
                            className="px-4 py-2 text-sm font-medium rounded-md border border-secondary-300 dark:border-secondary-600 text-[var(--text-secondary)] hover:bg-secondary-50 dark:hover:bg-secondary-700"
                            onClick={() => setStep(1)}
                            disabled={processing}
                        >
                            Back
                        </button>

                        <button
                            type="button"
                            className="px-4 py-2 text-sm font-medium rounded-md bg-primary-600 dark:bg-primary-500 text-white hover:bg-primary-700 dark:hover:bg-primary-400"
                            onClick={() => setStep(3)}
                            disabled={processing}
                        >
                            Next
                        </button>
                    </div>
                )}

                {step === 3 && (
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <Link
                            href={route('login')}
                            className="text-sm text-[var(--text-secondary)] hover:text-secondary-900 dark:hover:text-secondary-100 underline"
                        >
                            Already registered?
                        </Link>

                        <div className="flex gap-3 justify-end">
                            <button
                                type="button"
                                className="px-4 py-2 text-sm font-medium rounded-md border border-secondary-300 dark:border-secondary-600 text-[var(--text-secondary)] hover:bg-secondary-50 dark:hover:bg-secondary-700"
                                onClick={() => setStep(2)}
                                disabled={processing}
                            >
                                Back
                            </button>
                            <PrimaryButton disabled={processing}>
                                {processing ? 'Registering...' : 'Register'}
                            </PrimaryButton>
                        </div>
                    </div>
                )}
            </form>
        </GuestLayout>
    );
}