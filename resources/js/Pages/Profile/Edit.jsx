import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import { useState } from 'react';
import axios from 'axios';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { Transition } from '@headlessui/react';

export default function Edit({ mustVerifyEmail, status, user, states, districts, zones, schoolTypes }) {
    const { data, setData, patch, errors, processing, recentlySuccessful } = useForm({
        // Personal Information
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        date_of_birth: user.date_of_birth || '',
        address: user.address || '',

        // Institutional Information
        school_name: user.school_name || '',
        school_type: user.school_type || '',
        institute_address: user.institute_address || '',
        school_pincode: user.school_pincode || '',

        // Location Information
        state: user.state || '',
        district: user.district || '',
        zone: user.zone || '',
        district_id: user.district_id || '',
        zone_id: user.zone_id || '',
    });

    const [step, setStep] = useState(1);
    const totalSteps = 3;

    const [zonesList, setZonesList] = useState(zones || []);
    const [loadingZones, setLoadingZones] = useState(false);
    const [locationError, setLocationError] = useState('');

    const nextStep = () => setStep((current) => Math.min(totalSteps, current + 1));
    const prevStep = () => setStep((current) => Math.max(1, current - 1));

    const handleDistrictChange = async (districtId) => {
        setData('district_id', districtId);
        setData('zone_id', '');
        setZonesList([]);

        if (!districtId) {
            return;
        }

        setLoadingZones(true);
        setLocationError('');

        try {
            const response = await axios.get(`/api/zones/${districtId}`);
            const apiZones = response.data?.data || response.data || [];
            setZonesList(apiZones);
        } catch (error) {
            console.error('Failed to load zones:', error);
            setLocationError('Failed to load zones. Please try again.');
            setZonesList([]);
        } finally {
            setLoadingZones(false);
        }
    };

    const submit = (e) => {
        e.preventDefault();
        patch(route('profile.update'), {
            preserveScroll: true,
        });
    };

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-[var(--text-primary)]">
                    Profile Settings
                </h2>
            }
        >
            <Head title="Profile" />

            <div className="py-12">
                <div className="mx-auto max-w-4xl space-y-6 sm:px-6 lg:px-8 flex flex-col items-center">
                    <div className="mb-6 grid gap-3 sm:grid-cols-3">
                        <div className="flex items-center gap-3">
                            <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-semibold ${step === 1 ? 'bg-primary-600 text-white' : 'bg-secondary-200 dark:bg-secondary-700 text-[var(--text-secondary)]'}`}>
                                1
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-[var(--text-primary)]">Personal details</p>
                                <p className="text-xs text-[var(--text-tertiary)]">Account & contact information</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-semibold ${step === 2 ? 'bg-primary-600 text-white' : 'bg-secondary-200 dark:bg-secondary-700 text-[var(--text-secondary)]'}`}>
                                2
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-[var(--text-primary)]">Institution</p>
                                <p className="text-xs text-[var(--text-tertiary)]">School details</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-semibold ${step === 3 ? 'bg-primary-600 text-white' : 'bg-secondary-200 dark:bg-secondary-700 text-[var(--text-secondary)]'}`}>
                                3
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-[var(--text-primary)]">Location</p>
                                <p className="text-xs text-[var(--text-tertiary)]">State, district & zone</p>
                            </div>
                        </div>
                    </div>

                    <form onSubmit={submit} className="space-y-6">
                        {/* Personal Information Section */}
                        {step === 1 && (
                            <div className="bg-[var(--surface-00)] shadow sm:rounded-lg p-6 border border-[var(--border-light)]">
                                <section className="max-w-xl">
                                    <header>
                                        <h2 className="text-lg font-medium text-[var(--text-primary)] mb-4">
                                            Personal Information
                                        </h2>
                                        <p className="mt-1 text-sm text-[var(--text-secondary)]">
                                            Update your personal details and contact information.
                                        </p>
                                    </header>

                                    <div className="mt-6 space-y-4">
                                        {locationError && (
                                            <div className="mb-4 rounded-md border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/50 px-4 py-3 text-sm text-red-700 dark:text-red-400">
                                                {locationError}
                                            </div>
                                        )}
                                        {/* Name */}
                                        <div>
                                            <InputLabel htmlFor="name" value="Full Name" />
                                            <TextInput
                                                id="name"
                                                className="mt-1 block w-full"
                                                value={data.name}
                                                onChange={(e) => setData('name', e.target.value)}
                                                required
                                                autoComplete="name"
                                            />
                                            <InputError className="mt-2" message={errors.name} />
                                        </div>

                                        {/* Email */}
                                        <div>
                                            <InputLabel htmlFor="email" value="Email" />
                                            <TextInput
                                                id="email"
                                                type="email"
                                                className="mt-1 block w-full"
                                                value={data.email}
                                                onChange={(e) => setData('email', e.target.value)}
                                                required
                                                autoComplete="username"
                                            />
                                            <InputError className="mt-2" message={errors.email} />
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {/* Phone */}
                                            <div>
                                                <InputLabel htmlFor="phone" value="Phone Number" />
                                                <TextInput
                                                    id="phone"
                                                    type="tel"
                                                    className="mt-1 block w-full"
                                                    value={data.phone}
                                                    onChange={(e) => setData('phone', e.target.value)}
                                                    autoComplete="tel"
                                                />
                                                <InputError className="mt-2" message={errors.phone} />
                                            </div>

                                            {/* Date of Birth */}
                                            <div>
                                                <InputLabel htmlFor="date_of_birth" value="Date of Birth" />
                                                <TextInput
                                                    id="date_of_birth"
                                                    type="date"
                                                    className="mt-1 block w-full"
                                                    value={data.date_of_birth}
                                                    onChange={(e) => setData('date_of_birth', e.target.value)}
                                                />
                                                <InputError className="mt-2" message={errors.date_of_birth} />
                                            </div>
                                        </div>

                                        {/* Address */}
                                        <div>
                                            <InputLabel htmlFor="address" value="Address" />
                                            <textarea
                                                id="address"
                                                className="mt-1 block w-full rounded-md border-[var(--border-light)] dark:bg-gray-900 dark:text-gray-300 shadow-sm focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-indigo-500 dark:focus:ring-indigo-400"
                                                rows="3"
                                                value={data.address}
                                                onChange={(e) => setData('address', e.target.value)}
                                            />
                                            <InputError className="mt-2" message={errors.address} />
                                        </div>

                                    </div>
                                </section>
                            </div>
                        )}

                        {/* Institutional Information Section */}
                        {step === 2 && (
                            <div className="bg-[var(--surface-00)] shadow sm:rounded-lg p-6 border border-[var(--border-light)]">
                                <section className="max-w-xl">
                                    <header>
                                        <h2 className="text-lg font-medium text-[var(--text-primary)] mb-4">
                                            Institutional Information
                                        </h2>
                                        <p className="mt-1 text-sm text-[var(--text-secondary)]">
                                            Update your school and institutional details.
                                        </p>
                                    </header>

                                    <div className="mt-6 space-y-4">
                                        {/* UDISE (Read-only) */}
                                        <div>
                                            <InputLabel htmlFor="udise" value="UDISE Code" />
                                            <TextInput
                                                id="udise"
                                                className="mt-1 block w-full bg-gray-100 dark:bg-gray-800"
                                                value={user.udise || 'Not Set'}
                                                disabled
                                                readOnly
                                            />
                                            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                                UDISE code cannot be changed once set
                                            </p>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {/* School Name */}
                                            <div>
                                                <InputLabel htmlFor="school_name" value="School Name" />
                                                <TextInput
                                                    id="school_name"
                                                    className="mt-1 block w-full"
                                                    value={data.school_name}
                                                    onChange={(e) => setData('school_name', e.target.value)}
                                                />
                                                <InputError className="mt-2" message={errors.school_name} />
                                            </div>

                                            {/* School Type */}
                                            <div>
                                                <InputLabel htmlFor="school_type" value="School Type" />
                                                <select
                                                    id="school_type"
                                                    className="mt-1 block w-full rounded-md border-[var(--border-light)] dark:bg-secondary-900 dark:text-secondary-300 shadow-sm focus:border-[var(--primary-500)] focus:ring-[var(--primary-500)]"
                                                    value={data.school_type}
                                                    onChange={(e) => setData('school_type', e.target.value)}
                                                >
                                                    <option value="">Select School Type</option>
                                                    {schoolTypes.map((type) => (
                                                        <option key={type.value} value={type.value}>
                                                            {type.label}
                                                        </option>
                                                    ))}
                                                </select>
                                                <InputError className="mt-2" message={errors.school_type} />
                                            </div>
                                        </div>

                                        {/* Institute Address */}
                                        <div>
                                            <InputLabel htmlFor="institute_address" value="Institute Address" />
                                            <textarea
                                                id="institute_address"
                                                className="mt-1 block w-full rounded-md border-[var(--border-light)] dark:bg-gray-900 dark:text-gray-300 shadow-sm focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-indigo-500 dark:focus:ring-indigo-400"
                                                rows="3"
                                                value={data.institute_address}
                                                onChange={(e) => setData('institute_address', e.target.value)}
                                            />
                                            <InputError className="mt-2" message={errors.institute_address} />
                                        </div>

                                        {/* School Pincode */}
                                        <div>
                                            <InputLabel htmlFor="school_pincode" value="School Pincode" />
                                            <TextInput
                                                id="school_pincode"
                                                className="mt-1 block w-full"
                                                value={data.school_pincode}
                                                onChange={(e) => setData('school_pincode', e.target.value)}
                                                maxLength="10"
                                            />
                                            <InputError className="mt-2" message={errors.school_pincode} />
                                        </div>

                                    </div>
                                </section>
                            </div>
                        )}

                        {/* Location Information Section */}
                        {step === 3 && (
                            <div className="bg-[var(--surface-00)] shadow sm:rounded-lg p-6 border border-[var(--border-light)]">
                                <section className="max-w-xl">
                                    <header>
                                        <h2 className="text-lg font-medium text-[var(--text-primary)] mb-4">
                                            Location Information
                                        </h2>
                                        <p className="mt-1 text-sm text-[var(--text-secondary)]">
                                            Update your location and administrative details.
                                        </p>
                                    </header>

                                    <div className="mt-6 space-y-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {/* State (Dropdown from seeder) */}
                                            <div>
                                                <InputLabel htmlFor="state" value="State" />
                                                <select
                                                    id="state"
                                                    className="mt-1 block w-full rounded-md border-[var(--border-light)] dark:bg-gray-900 dark:text-gray-300 shadow-sm focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-indigo-500 dark:focus:ring-indigo-400"
                                                    value={data.state}
                                                    onChange={(e) => setData('state', e.target.value)}
                                                >
                                                    <option value="">Select State</option>
                                                    {states && states.map((state) => (
                                                        <option key={state} value={state}>
                                                            {state}
                                                        </option>
                                                    ))}
                                                </select>
                                                <InputError className="mt-2" message={errors.state} />
                                            </div>

                                            {/* District (Dropdown from seeder only) */}
                                            <div>
                                                <InputLabel htmlFor="district_id" value="District" />
                                                <select
                                                    id="district_id"
                                                    className="mt-1 block w-full rounded-md border-[var(--border-light)] dark:bg-gray-900 dark:text-gray-300 shadow-sm focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-indigo-500 dark:focus:ring-indigo-400"
                                                    value={data.district_id}
                                                    onChange={(e) => handleDistrictChange(e.target.value)}
                                                >
                                                    <option value="">Select District</option>
                                                    {districts.map((district) => (
                                                        <option key={district.id} value={district.id}>
                                                            {district.name}
                                                        </option>
                                                    ))}
                                                </select>
                                                <InputError className="mt-2" message={errors.district_id} />
                                            </div>

                                            {/* Zone (Dropdown from seeder only) */}
                                            <div className="md:col-span-2">
                                                <InputLabel htmlFor="zone_id" value="Zone" />
                                                <select
                                                    id="zone_id"
                                                    className="mt-1 block w-full rounded-md border-[var(--border-light)] dark:bg-gray-900 dark:text-gray-300 shadow-sm focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-indigo-500 dark:focus:ring-indigo-400 disabled:bg-gray-100 dark:disabled:bg-gray-800"
                                                    value={data.zone_id}
                                                    onChange={(e) => setData('zone_id', e.target.value)}
                                                    disabled={!data.district_id || loadingZones}
                                                >
                                                    <option value="">
                                                        {loadingZones
                                                            ? 'Loading zones...'
                                                            : !data.district_id
                                                                ? 'Select district first'
                                                                : 'Select Zone'}
                                                    </option>
                                                    {zonesList.map((zone) => (
                                                        <option key={zone.id} value={zone.id}>
                                                            {zone.name}
                                                        </option>
                                                    ))}
                                                </select>
                                                <InputError className="mt-2" message={errors.zone_id} />
                                            </div>
                                        </div>

                                    </div>
                                </section>
                            </div>
                        )}

                        <div className="mt-4 w-full max-w-xl">
                            <div className="flex items-center justify-between">
                                <button
                                    type="button"
                                    onClick={prevStep}
                                    disabled={step === 1}
                                    className={`inline-flex items-center rounded-md border px-4 py-2 text-sm font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:ring-offset-2 dark:focus:ring-offset-gray-800 ${step === 1
                                            ? 'cursor-not-allowed border-[var(--border-light)] bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500'
                                            : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-[var(--text-secondary)] hover:bg-gray-50 dark:hover:bg-gray-700'
                                        }`}
                                >
                                    Previous
                                </button>

                                <div className="flex items-center gap-4">
                                    {step < totalSteps && (
                                        <button
                                            type="button"
                                            onClick={nextStep}
                                            className="inline-flex items-center rounded-md border border-transparent bg-indigo-600 dark:bg-indigo-500 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 dark:hover:bg-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
                                        >
                                            Next
                                        </button>
                                    )}

                                    {step === totalSteps && (
                                        <PrimaryButton disabled={processing}>
                                            Update
                                        </PrimaryButton>
                                    )}

                                    <Transition
                                        show={recentlySuccessful}
                                        enter="transition ease-in-out duration-300"
                                        enterFrom="opacity-0 translate-y-1"
                                        leave="transition ease-in-out duration-300"
                                        leaveTo="opacity-0 translate-y-1"
                                    >
                                        <div className="inline-flex items-center rounded-md border border-green-300 dark:border-green-800 bg-green-50 dark:bg-green-900/50 px-3 py-1 text-xs font-semibold text-green-800 dark:text-green-400 shadow-sm">
                                            <span>Profile updated successfully.</span>
                                        </div>
                                    </Transition>
                                </div>
                            </div>
                        </div>

                    </form>

                    {/* Delete Account Section placeholder removed to avoid empty card */}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}