import React, { useState, useEffect } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, router } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import Input, { Textarea } from '@/components/ui/input';
import Button from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Info, Users, Package, Calculator, ArrowLeft, AlertTriangle, Calendar } from 'lucide-react';

export default function Create({
    auth,
    schoolType,
    sections,
    enrollment,
    availableStock,
    previousDate,
    riceRates,
    amountRates,
    consumption = null,
    error = null,
    currentMonth: initialMonth,
    currentYear: initialYear
}) {
    const isEditing = consumption !== null;

    // Use passed props for month/year if available (new entry context), otherwise default to today
    const defaultMonth = initialMonth || new Date().getMonth() + 1;
    const defaultYear = initialYear || new Date().getFullYear();

    const { data, setData, post, put, processing, errors, reset, transform } = useForm({
        date: consumption?.date || '',
        month: consumption?.date ? parseInt(consumption.date.substring(5, 7)) : defaultMonth,
        year: consumption?.date ? parseInt(consumption.date.substring(0, 4)) : defaultYear,
        day: consumption?.date ? consumption.date.substring(8, 10) : '',
        served_primary: consumption?.served_primary?.toString() || '',
        served_middle: consumption?.served_middle?.toString() || '',
        remarks: consumption?.remarks || '',
    });

    const hasPrimary = sections.includes('primary');
    const hasMiddle = sections.includes('middle');

    const [calculations, setCalculations] = useState({
        primaryRice: 0,
        middleRice: 0,
        totalRice: 0,
        primaryAmount: 0,
        middleAmount: 0,
        totalAmount: 0,
        remainingStock: availableStock,
        primaryBreakdown: {},
        middleBreakdown: {}
    });

    // Build date string for display and validation
    const buildDateString = () => {
        if (data.year && data.month && data.day) {
            const monthStr = String(data.month).padStart(2, '0');
            const dayStr = String(data.day).padStart(2, '0');
            return `${data.year}-${monthStr}-${dayStr}`;
        }
        return '';
    };

    const dateString = buildDateString();

    // Calculate consumption in real-time
    useEffect(() => {
        const primaryStudents = parseInt(data.served_primary) || 0;
        const middleStudents = parseInt(data.served_middle) || 0;

        const primaryRice = riceRates ? primaryStudents * riceRates.primary : 0;
        const middleRice = riceRates ? middleStudents * riceRates.middle : 0;
        const totalRice = primaryRice + middleRice;

        let primaryBreakdown = {};
        let middleBreakdown = {};
        let primaryAmount = 0;
        let middleAmount = 0;

        if (amountRates) {
            primaryBreakdown = {
                pulses: primaryStudents * amountRates.primary.pulses,
                vegetables: primaryStudents * amountRates.primary.vegetables,
                oil: primaryStudents * amountRates.primary.oil,
                common_salt: primaryStudents * amountRates.primary.common_salt,
                chilli_powder: primaryStudents * amountRates.primary.chilli_powder,
                turmeric: primaryStudents * amountRates.primary.turmeric,
                coriander: primaryStudents * amountRates.primary.coriander,
                other_condiments: primaryStudents * amountRates.primary.other_condiments,
                fuel: primaryStudents * amountRates.primary.fuel,
            };
            primaryAmount = Object.values(primaryBreakdown).reduce((sum, val) => sum + val, 0);

            middleBreakdown = {
                pulses: middleStudents * amountRates.middle.pulses,
                vegetables: middleStudents * amountRates.middle.vegetables,
                oil: middleStudents * amountRates.middle.oil,
                common_salt: middleStudents * amountRates.middle.common_salt,
                chilli_powder: middleStudents * amountRates.middle.chilli_powder,
                turmeric: middleStudents * amountRates.middle.turmeric,
                coriander: middleStudents * amountRates.middle.coriander,
                other_condiments: middleStudents * amountRates.middle.other_condiments,
                fuel: middleStudents * amountRates.middle.fuel,
            };
            middleAmount = Object.values(middleBreakdown).reduce((sum, val) => sum + val, 0);
        }

        const totalAmount = primaryAmount + middleAmount;
        const remainingStock = availableStock - totalRice;

        setCalculations({
            primaryRice,
            middleRice,
            totalRice,
            primaryAmount,
            middleAmount,
            totalAmount,
            remainingStock,
            primaryBreakdown,
            middleBreakdown
        });
    }, [data.served_primary, data.served_middle, riceRates, amountRates, availableStock]);

    // Get days in selected month
    const getDaysInMonth = () => {
        if (!data.year || !data.month) return 31;
        return new Date(data.year, data.month, 0).getDate();
    };

    // Get years for dropdown (last 5 years)
    const getYearOptions = () => {
        const currentYear = new Date().getFullYear();
        const years = [];
        for (let i = 0; i < 5; i++) {
            years.push(currentYear - i);
        }
        return years;
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        // Build the date string from components
        const monthStr = String(data.month).padStart(2, '0');
        const dayStr = String(data.day).padStart(2, '0');
        const fullDate = `${data.year}-${monthStr}-${dayStr}`;

        // Ensure the computed date is actually sent in the payload
        transform((formData) => ({
            ...formData,
            date: fullDate,
        }));

        console.log('Submitting data with date:', fullDate);

        if (isEditing) {
            put(route('daily-consumptions.update', consumption.id), {
                preserveScroll: true,
                onSuccess: () => {
                    console.log('Update successful');
                },
                onError: (errors) => {
                    console.error('Update errors:', errors);
                }
            });
        } else {
            post(route('daily-consumptions.store'), {
                preserveScroll: true,
                onSuccess: () => {
                    console.log('Create successful');
                    // Only reset student counts and remarks, keep month/year
                    setData(prev => ({
                        ...prev,
                        day: '',
                        served_primary: '',
                        served_middle: '',
                        remarks: ''
                    }));
                },
                onError: (errors) => {
                    console.error('Create errors:', errors);
                }
            });
        }
    };

    const getSchoolTypeDisplay = () => {
        switch (schoolType) {
            case 'primary':
                return 'Primary (Classes I-V)';
            case 'middle':
                return 'Primary + Middle (Classes I-VIII)';
            case 'secondary':
                return 'Middle (Classes VI-VIII)';
            default:
                return schoolType;
        }
    };

    const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    // Use "today" variables for validation against future dates
    const today = new Date();
    const todayYear = today.getFullYear();
    const todayMonth = today.getMonth() + 1;
    const todayDay = today.getDate();

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title={isEditing ? "Edit Daily Consumption" : "Add Daily Consumption"} />

            <div className="py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="mb-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-3xl font-bold text-gray-900">
                                    {isEditing ? 'Edit Daily Consumption Record' : 'Add Daily Consumption Record'}
                                </h2>
                                <p className="text-sm text-gray-600 mt-1">
                                    School Type: <span className="font-semibold">{getSchoolTypeDisplay()}</span>
                                </p>
                            </div>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => router.visit(route('daily-consumptions.index'))}
                                className="inline-flex items-center"
                            >
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Back to List
                            </Button>
                        </div>
                    </div>

                    {/* Error Alert */}
                    {error && (
                        <Alert variant="destructive" className="mb-6">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}

                    {/* Info Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-sm font-medium flex items-center">
                                    <Users className="w-4 h-4 mr-2 text-blue-600" />
                                    Current Enrollment
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    {hasPrimary && (
                                        <div className="flex justify-between">
                                            <span className="text-sm text-gray-600">Primary:</span>
                                            <span className="text-sm font-semibold">{enrollment.primary} students</span>
                                        </div>
                                    )}
                                    {hasMiddle && (
                                        <div className="flex justify-between">
                                            <span className="text-sm text-gray-600">Middle:</span>
                                            <span className="text-sm font-semibold">{enrollment.middle} students</span>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-sm font-medium flex items-center">
                                    <Package className="w-4 h-4 mr-2 text-green-600" />
                                    Available Rice Stock
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className={`text-2xl font-bold ${availableStock < 0 ? 'text-red-600' : 'text-green-600'}`}>
                                    {availableStock.toFixed(2)} kg
                                </div>
                                {previousDate && (
                                    <p className="text-xs text-gray-500 mt-1">
                                        Last entry: {new Date(previousDate).toLocaleDateString('en-GB')}
                                    </p>
                                )}
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-sm font-medium flex items-center">
                                    <Calculator className="w-4 h-4 mr-2 text-purple-600" />
                                    Daily Rates
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    {riceRates && (
                                        <>
                                            {hasPrimary && (
                                                <div className="flex justify-between">
                                                    <span className="text-sm text-gray-600">Primary Rice:</span>
                                                    <span className="text-sm font-semibold">{riceRates.primary} kg</span>
                                                </div>
                                            )}
                                            {hasMiddle && (
                                                <div className="flex justify-between">
                                                    <span className="text-sm text-gray-600">Middle Rice:</span>
                                                    <span className="text-sm font-semibold">{riceRates.middle} kg</span>
                                                </div>
                                            )}
                                        </>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Left Column - Form Inputs */}
                            <div className="space-y-6">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Record Details</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        {/* Date selectors with dropdowns */}
                                        <div>
                                            <Label className="mb-2 block">Date *</Label>
                                            <div className="grid grid-cols-3 gap-3">
                                                <div>
                                                    <Label htmlFor="month" className="text-xs text-gray-600">Month</Label>
                                                    <select
                                                        id="month"
                                                        value={data.month}
                                                        onChange={(e) => {
                                                            setData('month', parseInt(e.target.value));
                                                            // Reset day if it's invalid for new month
                                                            const daysInNewMonth = new Date(data.year, parseInt(e.target.value), 0).getDate();
                                                            if (data.day > daysInNewMonth) {
                                                                setData('day', '');
                                                            }
                                                        }}
                                                        className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100 disabled:text-gray-500"
                                                        required
                                                        disabled={!isEditing && initialMonth}
                                                    >
                                                        <option value="">Select</option>
                                                        {monthNames.map((month, index) => {
                                                            const monthNum = index + 1;
                                                            // Disable future months
                                                            const isDisabled = data.year == todayYear && monthNum > todayMonth;
                                                            return (
                                                                <option key={monthNum} value={monthNum} disabled={isDisabled}>
                                                                    {month}
                                                                </option>
                                                            );
                                                        })}
                                                    </select>
                                                </div>

                                                <div>
                                                    <Label htmlFor="day" className="text-xs text-gray-600">Day</Label>
                                                    <select
                                                        id="day"
                                                        value={data.day}
                                                        onChange={(e) => setData('day', e.target.value)}
                                                        className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                                        required
                                                        disabled={!data.month}
                                                    >
                                                        <option value="">Day</option>
                                                        {Array.from({ length: getDaysInMonth() }, (_, i) => i + 1).map(day => {
                                                            // Disable future dates
                                                            const isDisabled = data.year == todayYear &&
                                                                data.month == todayMonth &&
                                                                day > todayDay;
                                                            return (
                                                                <option key={day} value={String(day).padStart(2, '0')} disabled={isDisabled}>
                                                                    {day}
                                                                </option>
                                                            );
                                                        })}
                                                    </select>
                                                </div>

                                                <div>
                                                    <Label htmlFor="year" className="text-xs text-gray-600">Year</Label>
                                                    <select
                                                        id="year"
                                                        value={data.year}
                                                        onChange={(e) => setData('year', parseInt(e.target.value))}
                                                        className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100 disabled:text-gray-500"
                                                        required
                                                        disabled={!isEditing && initialYear}
                                                    >
                                                        {getYearOptions().map(year => (
                                                            <option key={year} value={year}>
                                                                {year}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>
                                            </div>
                                            {data.month && data.year && (
                                                <p className="text-xs text-blue-600 mt-2 font-medium">
                                                    Selected: {monthNames[data.month - 1]} {data.year}
                                                    {data.day && ` - Day ${parseInt(data.day)}`}
                                                </p>
                                            )}
                                            {errors.date && (
                                                <p className="text-sm text-red-600 mt-1">{errors.date}</p>
                                            )}
                                        </div>

                                        {hasPrimary && (
                                            <div>
                                                <Label htmlFor="served_primary">
                                                    Primary Students Served (I-V) *
                                                </Label>
                                                <Input
                                                    id="served_primary"
                                                    type="number"
                                                    min="0"
                                                    max={enrollment.primary}
                                                    value={data.served_primary}
                                                    onChange={(e) => setData('served_primary', e.target.value)}
                                                    className="mt-1"
                                                    required
                                                />
                                                <p className="text-xs text-gray-500 mt-1">
                                                    Maximum: {enrollment.primary} students
                                                </p>
                                                {errors.served_primary && (
                                                    <p className="text-sm text-red-600 mt-1">{errors.served_primary}</p>
                                                )}
                                            </div>
                                        )}

                                        {hasMiddle && (
                                            <div>
                                                <Label htmlFor="served_middle">
                                                    Middle Students Served (VI-VIII) *
                                                </Label>
                                                <Input
                                                    id="served_middle"
                                                    type="number"
                                                    min="0"
                                                    max={enrollment.middle}
                                                    value={data.served_middle}
                                                    onChange={(e) => setData('served_middle', e.target.value)}
                                                    className="mt-1"
                                                    required
                                                />
                                                <p className="text-xs text-gray-500 mt-1">
                                                    Maximum: {enrollment.middle} students
                                                </p>
                                                {errors.served_middle && (
                                                    <p className="text-sm text-red-600 mt-1">{errors.served_middle}</p>
                                                )}
                                            </div>
                                        )}

                                        <div>
                                            <Label htmlFor="remarks">Remarks (Optional)</Label>
                                            <Textarea
                                                id="remarks"
                                                value={data.remarks}
                                                onChange={(e) => setData('remarks', e.target.value)}
                                                rows={3}
                                                className="mt-1"
                                                placeholder="Any additional notes..."
                                            />
                                            {errors.remarks && (
                                                <p className="text-sm text-red-600 mt-1">{errors.remarks}</p>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Right Column - Calculations Preview */}
                            <div className="space-y-6">
                                {/* Rice Consumption Card */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-blue-700">Rice Consumption Preview</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                        {hasPrimary && (
                                            <div className="flex justify-between items-center py-2 border-b">
                                                <span className="text-sm font-medium">Primary Rice:</span>
                                                <span className="text-lg font-bold text-blue-600">
                                                    {calculations.primaryRice.toFixed(2)} kg
                                                </span>
                                            </div>
                                        )}
                                        {hasMiddle && (
                                            <div className="flex justify-between items-center py-2 border-b">
                                                <span className="text-sm font-medium">Middle Rice:</span>
                                                <span className="text-lg font-bold text-blue-600">
                                                    {calculations.middleRice.toFixed(2)} kg
                                                </span>
                                            </div>
                                        )}
                                        <div className="flex justify-between items-center py-2 bg-blue-50 px-3 rounded-lg">
                                            <span className="font-semibold">Total Rice Consumed:</span>
                                            <span className="text-xl font-bold text-blue-700">
                                                {calculations.totalRice.toFixed(2)} kg
                                            </span>
                                        </div>

                                        <div className={`flex justify-between items-center py-2 px-3 rounded-lg ${calculations.remainingStock < 0
                                            ? 'bg-red-50'
                                            : calculations.remainingStock < 50
                                                ? 'bg-orange-50'
                                                : 'bg-green-50'
                                            }`}>
                                            <span className="font-semibold">Remaining Stock:</span>
                                            <span className={`text-xl font-bold ${calculations.remainingStock < 0
                                                ? 'text-red-600'
                                                : calculations.remainingStock < 50
                                                    ? 'text-orange-600'
                                                    : 'text-green-600'
                                                }`}>
                                                {calculations.remainingStock.toFixed(2)} kg
                                            </span>
                                        </div>

                                        {calculations.remainingStock < 0 && (
                                            <Alert variant="warning" className="bg-amber-50 border-amber-200">
                                                <AlertTriangle className="h-4 w-4 text-amber-600" />
                                                <AlertDescription className="text-amber-800">
                                                    <strong>Warning:</strong> Stock will be negative by {Math.abs(calculations.remainingStock).toFixed(2)} kg.
                                                    This indicates insufficient rice stock. Please ensure rice is lifted/received soon.
                                                </AlertDescription>
                                            </Alert>
                                        )}
                                    </CardContent>
                                </Card>

                                {/* Amount Consumption Card */}
                                {amountRates && (
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="text-green-700">Amount Consumption Preview</CardTitle>
                                        </CardHeader>
                                        <CardContent className="p-0">
                                            {hasPrimary && calculations.primaryAmount > 0 && (
                                                <div className="p-4 border-b">
                                                    <h4 className="text-sm font-semibold text-gray-700 mb-3">Primary (I-V):</h4>
                                                    <div className="overflow-x-auto">
                                                        <table className="min-w-full divide-y divide-gray-200">
                                                            <thead className="bg-gray-50">
                                                                <tr>
                                                                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">S.No</th>
                                                                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Item Name</th>
                                                                    <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase">Amount (₹)</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody className="bg-white divide-y divide-gray-200">
                                                                {[
                                                                    { name: 'Pulses', key: 'pulses' },
                                                                    { name: 'Vegetables', key: 'vegetables' },
                                                                    { name: 'Oil', key: 'oil' },
                                                                    { name: 'Common Salt', key: 'common_salt' },
                                                                    { name: 'Chilli Powder', key: 'chilli_powder' },
                                                                    { name: 'Turmeric', key: 'turmeric' },
                                                                    { name: 'Coriander', key: 'coriander' },
                                                                    { name: 'Other Condiments', key: 'other_condiments' },
                                                                    { name: 'Fuel', key: 'fuel' }
                                                                ].map((item, index) => (
                                                                    <tr key={item.key}>
                                                                        <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">{index + 1}</td>
                                                                        <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">{item.name}</td>
                                                                        <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900 text-right">
                                                                            ₹{calculations.primaryBreakdown[item.key]?.toFixed(2)}
                                                                        </td>
                                                                    </tr>
                                                                ))}
                                                                <tr className="bg-gray-50 font-semibold">
                                                                    <td colSpan="2" className="px-3 py-2 text-right text-sm text-blue-700">Primary Subtotal:</td>
                                                                    <td className="px-3 py-2 text-right text-sm text-blue-700">₹{calculations.primaryAmount.toFixed(2)}</td>
                                                                </tr>
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                </div>
                                            )}

                                            {hasMiddle && calculations.middleAmount > 0 && (
                                                <div className="p-4 border-b">
                                                    <h4 className="text-sm font-semibold text-gray-700 mb-3">Middle (VI-VIII):</h4>
                                                    <div className="overflow-x-auto">
                                                        <table className="min-w-full divide-y divide-gray-200">
                                                            <thead className="bg-gray-50">
                                                                <tr>
                                                                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">S.No</th>
                                                                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Item Name</th>
                                                                    <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase">Amount (₹)</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody className="bg-white divide-y divide-gray-200">
                                                                {[
                                                                    { name: 'Pulses', key: 'pulses' },
                                                                    { name: 'Vegetables', key: 'vegetables' },
                                                                    { name: 'Oil', key: 'oil' },
                                                                    { name: 'Common Salt', key: 'common_salt' },
                                                                    { name: 'Chilli Powder', key: 'chilli_powder' },
                                                                    { name: 'Turmeric', key: 'turmeric' },
                                                                    { name: 'Coriander', key: 'coriander' },
                                                                    { name: 'Other Condiments', key: 'other_condiments' },
                                                                    { name: 'Fuel', key: 'fuel' }
                                                                ].map((item, index) => (
                                                                    <tr key={item.key}>
                                                                        <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">{index + 1}</td>
                                                                        <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">{item.name}</td>
                                                                        <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900 text-right">
                                                                            ₹{calculations.middleBreakdown[item.key]?.toFixed(2)}
                                                                        </td>
                                                                    </tr>
                                                                ))}
                                                                <tr className="bg-gray-50 font-semibold">
                                                                    <td colSpan="2" className="px-3 py-2 text-right text-sm text-purple-700">Middle Subtotal:</td>
                                                                    <td className="px-3 py-2 text-right text-sm text-purple-700">₹{calculations.middleAmount.toFixed(2)}</td>
                                                                </tr>
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                </div>
                                            )}

                                            <div className="flex justify-between items-center py-3 bg-green-50 px-4 rounded-b-lg">
                                                <span className="font-bold">Total Amount:</span>
                                                <span className="text-xl font-bold text-green-700">
                                                    ₹{calculations.totalAmount.toFixed(2)}
                                                </span>
                                            </div>
                                        </CardContent>
                                    </Card>
                                )}
                            </div>
                        </div>

                        {/* Form Actions */}
                        <div className="flex items-center justify-end space-x-4 pt-4">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => router.visit(route('daily-consumptions.index'))}
                                disabled={processing}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={processing || !data.year || !data.month || !data.day}
                                className="min-w-[150px]"
                            >
                                {processing ? 'Saving...' : (isEditing ? 'Update Record' : 'Save Record')}
                            </Button>
                        </div>

                        {/* General Error */}
                        {errors.error && (
                            <Alert variant="destructive">
                                <AlertCircle className="h-4 w-4" />
                                <AlertDescription>{errors.error}</AlertDescription>
                            </Alert>
                        )}
                    </form>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}