import React, { useState, useEffect } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, router, Link } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import Input from '@/components/ui/input';
import Button from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle2 } from 'lucide-react';

export default function Create({
    auth,
    schoolType,
    sections,
    enrollment,
    riceRates,
    amountRates,
    consumption = null,
    currentMonth: initialMonth,
    currentYear: initialYear,
    flash,
    existingDates = []
}) {
    const isEditing = consumption !== null;
    const defaultMonth = initialMonth || new Date().getMonth() + 1;
    const defaultYear = initialYear || new Date().getFullYear();

    const { data, setData, post, put, processing, errors, transform } = useForm({
        date: consumption?.date || '',
        month: consumption?.date ? parseInt(consumption.date.substring(5, 7)) : defaultMonth,
        year: consumption?.date ? parseInt(consumption.date.substring(0, 4)) : defaultYear,
        day: consumption?.date ? consumption.date.substring(8, 10) : '',
        served_primary: consumption?.served_primary?.toString() || '',
        served_middle: consumption?.served_middle?.toString() || '',
    });

    const hasPrimary = sections.includes('primary');
    const hasMiddle = sections.includes('middle');

    const [riceConsumption, setRiceConsumption] = useState({ primary: 0, middle: 0, total: 0 });

    useEffect(() => {
        const primaryStudents = parseInt(data.served_primary) || 0;
        const middleStudents = parseInt(data.served_middle) || 0;

        const primaryRice = riceRates ? primaryStudents * riceRates.primary : 0;
        const middleRice = riceRates ? middleStudents * riceRates.middle : 0;

        setRiceConsumption({
            primary: primaryRice,
            middle: middleRice,
            total: primaryRice + middleRice
        });
    }, [data.served_primary, data.served_middle, riceRates]);

    const handleSubmit = (e) => {
        e.preventDefault();

        const monthStr = String(data.month).padStart(2, '0');
        const dayStr = String(data.day).padStart(2, '0');
        const fullDate = `${data.year}-${monthStr}-${dayStr}`;

        transform((formData) => ({
            ...formData,
            date: fullDate,
        }));

        if (isEditing) {
            put(route('daily-consumptions.update', consumption.id), {
                preserveScroll: true,
            });
        } else {
            post(route('daily-consumptions.store'), {
                preserveScroll: true,
                onSuccess: () => {
                    setData(prev => ({
                        ...prev,
                        day: '',
                        served_primary: '',
                        served_middle: '',
                    }));
                }
            });
        }
    };

    const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    const getDaysInMonth = () => {
        if (!data.month || !data.year) return 31;
        return new Date(data.year, data.month, 0).getDate();
    };

    const getYearOptions = () => {
        const currentYear = new Date().getFullYear();
        return [currentYear - 1, currentYear, currentYear + 1];
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Add Daily Consumption" />

            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-8">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">

                    {/* Success Message */}
                    {flash?.success && (
                        <Alert className="mb-6 bg-green-50 border-green-200">
                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                            <AlertDescription className="text-green-800">{flash.success}</AlertDescription>
                        </Alert>
                    )}

                    {/* Main Card */}
                    <Card className="border-0 shadow-xl bg-white/80 backdrop-blur">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <CardHeader className="space-y-3 border-b border-gray-100 pb-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle className="text-2xl font-bold text-gray-900">
                                            {isEditing ? 'Update Daily Consumption' : 'Add Daily Consumption'}
                                        </CardTitle>
                                    </div>
                                    <Link
                                        href={route('daily-consumptions.list', { month: data.month, year: data.year })}
                                        className="text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline flex items-center"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                        </svg>
                                        Back to List
                                    </Link>
                                </div>
                            </CardHeader>
                            <CardContent>
                                {/* Date Selection */}
                                <div className="space-y-4">
                                    <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                                        Select Date
                                    </h3>

                                    {/* Year and Month - Same Row */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <Label htmlFor="year" className="text-sm font-medium text-gray-700">Year</Label>
                                            <select
                                                id="year"
                                                value={data.year}
                                                onChange={(e) => setData('year', parseInt(e.target.value))}
                                                className="w-full mt-1 px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                                            >
                                                {getYearOptions().map((year) => (
                                                    <option key={year} value={year}>{year}</option>
                                                ))}
                                            </select>
                                        </div>

                                        <div>
                                            <Label htmlFor="month" className="text-sm font-medium text-gray-700">Month</Label>
                                            <select
                                                id="month"
                                                value={data.month}
                                                onChange={(e) => {
                                                    const selected = parseInt(e.target.value);
                                                    setData('month', selected || '');
                                                }}
                                                className="w-full mt-1 px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                                            >
                                                {monthNames.map((month, index) => (
                                                    <option key={index + 1} value={index + 1}>{month}</option>
                                                ))}
                                            </select>
                                            {errors.date && <p className="text-sm text-red-600 mt-1">{errors.date}</p>}
                                        </div>
                                    </div>
                                </div>

                                {/* Main Content Grid: Inputs (Left) and Calendar (Right) */}
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                    {/* Left Column: Students Served */}
                                    <div className="space-y-4">
                                        <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                                            Students Served
                                        </h3>
                                        <div className="space-y-4">
                                            {hasPrimary && (
                                                <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200">
                                                    <Label htmlFor="served_primary" className="text-sm font-medium text-blue-900">
                                                        Primary (I-V) *
                                                    </Label>
                                                    <Input
                                                        id="served_primary"
                                                        type="number"
                                                        min="0"
                                                        max={enrollment.primary}
                                                        value={data.served_primary}
                                                        onChange={(e) => setData('served_primary', e.target.value)}
                                                        className="mt-2 bg-white border-blue-300 focus:ring-blue-500"
                                                        placeholder="0"
                                                    />
                                                    <p className="text-xs text-blue-700 mt-1">Max: {enrollment.primary}</p>
                                                    {riceConsumption.primary > 0 && (
                                                        <p className="text-xs text-blue-600 mt-2 font-medium">
                                                            Rice: {riceConsumption.primary.toFixed(2)} kg
                                                        </p>
                                                    )}
                                                    {errors.served_primary && <p className="text-sm text-red-600 mt-1">{errors.served_primary}</p>}
                                                </div>
                                            )}
                                            {hasMiddle && (
                                                <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl border border-purple-200">
                                                    <Label htmlFor="served_middle" className="text-sm font-medium text-purple-900">
                                                        Middle (VI-VIII) *
                                                    </Label>
                                                    <Input
                                                        id="served_middle"
                                                        type="number"
                                                        min="0"
                                                        max={enrollment.middle}
                                                        value={data.served_middle}
                                                        onChange={(e) => setData('served_middle', e.target.value)}
                                                        className="mt-2 bg-white border-purple-300 focus:ring-purple-500"
                                                        placeholder="0"
                                                    />
                                                    <p className="text-xs text-purple-700 mt-1">Max: {enrollment.middle}</p>
                                                    {riceConsumption.middle > 0 && (
                                                        <p className="text-xs text-purple-600 mt-2 font-medium">
                                                            Rice: {riceConsumption.middle.toFixed(2)} kg
                                                        </p>
                                                    )}
                                                    {errors.served_middle && <p className="text-sm text-red-600 mt-1">{errors.served_middle}</p>}
                                                </div>
                                            )}

                                            {/* Total Rice Display */}
                                            {riceConsumption.total > 0 && (
                                                <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200">
                                                    <div className="flex items-center justify-between">
                                                        <div>
                                                            <p className="text-xs uppercase tracking-wide text-green-700 font-semibold">Total Rice</p>
                                                            <p className="text-2xl font-bold text-green-900 mt-1">{riceConsumption.total.toFixed(2)} kg</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {/* Action Button Moved Here (Left Column) */}
                                        <div className="pt-2">
                                            <Button
                                                type="submit"
                                                disabled={processing || !data.year || !data.month || !data.day}
                                                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg py-6 text-base font-semibold"
                                            >
                                                {processing ? 'Saving...' : (isEditing ? 'Update Record' : 'Save Record')}
                                            </Button>

                                            {/* General Error Message */}
                                            {Object.keys(errors).length > 0 && (
                                                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm text-center">
                                                    Please correct the errors above to save.
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Right Column: Calendar Grid */}
                                    {data.month && (
                                        <div className="space-y-4">
                                            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                                                Select Day
                                            </h3>
                                            <div className="p-4 border border-gray-300 rounded-lg bg-gradient-to-br from-blue-50 to-purple-50 w-full max-w-md mx-auto">
                                                <div className="grid grid-cols-7 gap-1">
                                                    {/* Day headers */}
                                                    {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
                                                        <div key={i} className="text-xs font-semibold text-gray-600 text-center py-1">
                                                            {day}
                                                        </div>
                                                    ))}

                                                    {/* Empty cells for offset */}
                                                    {Array.from({ length: new Date(data.year, data.month - 1, 1).getDay() }).map((_, i) => (
                                                        <div key={`empty-${i}`} />
                                                    ))}

                                                    {/* Day buttons */}
                                                    {Array.from({ length: getDaysInMonth() }, (_, i) => {
                                                        const dayNum = i + 1;
                                                        const dayStr = String(dayNum).padStart(2, '0');
                                                        const isSelected = data.day === dayStr;
                                                        const isServed = existingDates.includes(String(dayNum)); // Check if day is served

                                                        return (
                                                            <button
                                                                key={dayNum}
                                                                type="button"
                                                                onClick={() => setData('day', dayStr)}
                                                                className={`
                                                                    aspect-square rounded-lg text-sm font-medium transition-all flex items-center justify-center relative
                                                                    ${isSelected
                                                                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md scale-110 z-10'
                                                                        : isServed
                                                                            ? 'bg-green-100 text-green-800 border border-green-300 hover:bg-green-200'
                                                                            : 'bg-white hover:bg-blue-100 text-gray-700 border border-gray-200'
                                                                    }
                                                                `}
                                                            >
                                                                {dayNum}
                                                                {isServed && !isSelected && (
                                                                    <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full" />
                                                                )}
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                                <div className="mt-4 flex items-center gap-4 text-xs text-gray-600 justify-center">
                                                    <div className="flex items-center gap-1">
                                                        <div className="w-3 h-3 bg-green-100 border border-green-300 rounded"></div>
                                                        <span>Served</span>
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <div className="w-3 h-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded"></div>
                                                        <span>Selected</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </form>
                    </Card>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}