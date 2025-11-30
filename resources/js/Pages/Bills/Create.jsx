// Location: resources/js/Pages/Bills/Create.jsx
import React, { useState, useEffect } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import {
    ArrowLeftIcon,
    ShoppingBagIcon,
    FireIcon,
    ExclamationCircleIcon,
    PlusIcon,
    TrashIcon
} from '@heroicons/react/24/outline';

export default function Create({
    auth,
    report,
    billType,
    billTypeLabel,
    prefillItems,
    schoolType,
    hasPrimary,
    hasMiddle,
    saltPercentages = null,
}) {
    const { data, setData, post, processing, errors } = useForm({
        amount_report_id: report.id,
        bill_type: billType,
        shop_name: '',
        address: '',
        shop_gstin: '',
        shopkeeper_name: '',
        phone: '',
        shop_license_no: '',
        payment_mode: '',
        fuel_type: billType === 'fuel' ? '' : null,
        deals_with: '',
        items: prefillItems.map(item => ({
            ...item,
            rate_per_unit: '',
            quantity: 0
        }))
    });

    const [totalAmount, setTotalAmount] = useState(0);

    const reportMonth = Number(report.month ?? 1);
    const reportYear = Number(report.year ?? new Date().getFullYear());
    const billDate = new Date(reportYear, reportMonth, 0);
    const billDateDisplay = billDate.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
    });

    // Calculate total amount whenever items change
    useEffect(() => {
        const total = data.items.reduce((sum, item) => sum + parseFloat(item.amount || 0), 0);
        setTotalAmount(total);
    }, [data.items]);

    const handleRateChange = (index, rate) => {
        const updated = [...data.items];
        const item = updated[index];

        // For OTHER ITEMS: Quantity = Amount ÷ Rate (existing behavior)
        if (item.item_name !== 'Other Condiments') {
            const amount = parseFloat(item.amount) || 0;
            const rateNum = parseFloat(rate) || 0;

            item.rate_per_unit = rate;
            item.quantity = rateNum > 0 ? (amount / rateNum).toFixed(2) : 0;
        } else {
            // For Other Condiments, rate is derived from Amount ÷ Quantity, so we do not
            // auto-recalculate here. Allow manual override if user really edits it.
            item.rate_per_unit = rate;
        }

        updated[index] = item;
        setData('items', updated);
    };

    const handleAmountChange = (index, amount) => {
        const updated = [...data.items];
        const item = updated[index];
        const amountNum = parseFloat(amount) || 0;

        item.amount = amount;

        // For OTHER ITEMS: Quantity = Amount ÷ Rate (existing behavior)
        if (item.item_name !== 'Other Condiments') {
            const rate = parseFloat(item.rate_per_unit) || 0;
            item.quantity = rate > 0 ? (amountNum / rate).toFixed(2) : 0;
        } else {
            // For Other Condiments: Rate = Amount ÷ Quantity
            const qtyNum = parseFloat(item.quantity) || 0;
            item.rate_per_unit = qtyNum > 0 ? (amountNum / qtyNum).toFixed(2) : 0;
        }

        updated[index] = item;
        setData('items', updated);
    };

    const handleQuantityChange = (index, quantity) => {
        const updated = [...data.items];
        const item = updated[index];
        const qtyNum = parseFloat(quantity) || 0;
        const amountNum = parseFloat(item.amount) || 0;

        item.quantity = quantity;

        // Only special-case Other Condiments: Rate = Amount ÷ Quantity
        if (item.item_name === 'Other Condiments') {
            item.rate_per_unit = qtyNum > 0 ? (amountNum / qtyNum).toFixed(2) : 0;
        }

        updated[index] = item;
        setData('items', updated);
    };

    const handleUnitChange = (index, unit) => {
        const updated = [...data.items];
        updated[index].unit = unit;
        setData('items', updated);
    };

    const addItem = () => {
        setData('items', [
            ...data.items,
            {
                item_name: '',
                amount: 0,
                rate_per_unit: 0,
                quantity: 0,
                unit: 'kg'
            }
        ]);
    };

    const removeItem = (index) => {
        const updated = data.items.filter((_, i) => i !== index);
        setData('items', updated);
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        // Validate that all items have rate > 0
        const invalidItems = data.items.filter(item => parseFloat(item.rate_per_unit) <= 0);
        if (invalidItems.length > 0) {
            alert('Please enter valid rates for all items (rate must be greater than 0)');
            return;
        }

        post(route('bills.store'));
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title={`Create ${billTypeLabel} Bill`} />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="mb-8">
                        <Link
                            href={route('amount-reports.bills.index', report.id)}
                            className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4"
                        >
                            <ArrowLeftIcon className="h-4 w-4 mr-2" />
                            Back to Bills
                        </Link>

                        <div className="flex items-center space-x-3">
                            {billType === 'kiryana' ? (
                                <ShoppingBagIcon className="h-8 w-8 text-green-600" />
                            ) : (
                                <FireIcon className="h-8 w-8 text-orange-600" />
                            )}
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900">Create {billTypeLabel} Bill</h1>
                                <p className="mt-1 text-sm text-gray-600">
                                    For {report.month_name} {report.year}
                                </p>
                            </div>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Vendor Details Section */}
                        <div className="bg-white shadow-sm rounded-lg p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold text-gray-900">🏪 VENDOR INFORMATION</h3>
                                <div className="text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                                    Bill Date auto-set to <span className="font-semibold">{billDateDisplay}</span>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Shop Name */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Shop Name <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={data.shop_name}
                                        onChange={(e) => setData('shop_name', e.target.value.toUpperCase())}
                                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 uppercase ${errors.shop_name ? 'border-red-500' : 'border-gray-300'
                                            }`}
                                        required
                                        placeholder="E.G., ABC TRADERS"
                                    />
                                    {errors.shop_name && (
                                        <p className="mt-1 text-sm text-red-600">{errors.shop_name}</p>
                                    )}
                                </div>

                                {/* Shop Address */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Shop Address <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={data.address}
                                        onChange={(e) => setData('address', e.target.value.toUpperCase())}
                                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 uppercase ${errors.address ? 'border-red-500' : 'border-gray-300'
                                            }`}
                                        required
                                        placeholder="E.G., MARKET STREET, SRINAGAR"
                                    />
                                    {errors.address && (
                                        <p className="mt-1 text-sm text-red-600">{errors.address}</p>
                                    )}
                                </div>

                                {/* Shop GSTIN */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Shop GSTIN
                                    </label>
                                    <input
                                        type="text"
                                        value={data.shop_gstin}
                                        onChange={(e) => setData('shop_gstin', e.target.value.toUpperCase())}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 uppercase"
                                        placeholder="E.G., 22AAAAA0000A1Z5"
                                        maxLength="15"
                                        pattern="[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}"
                                    />
                                    {errors.shop_gstin && (
                                        <p className="mt-1 text-sm text-red-600">{errors.shop_gstin}</p>
                                    )}
                                </div>

                                {/* Contact Person */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Contact Person <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={data.shopkeeper_name}
                                        onChange={(e) => setData('shopkeeper_name', e.target.value.toUpperCase())}
                                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 uppercase ${errors.shopkeeper_name ? 'border-red-500' : 'border-gray-300'
                                            }`}
                                        required
                                        placeholder="E.G., MR. VENDOR NAME"
                                    />
                                    {errors.shopkeeper_name && (
                                        <p className="mt-1 text-sm text-red-600">{errors.shopkeeper_name}</p>
                                    )}
                                </div>

                                {/* Contact Number */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Contact Number <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="tel"
                                        value={data.phone}
                                        onChange={(e) => {
                                            const digits = e.target.value.replace(/\D/g, '').slice(0, 10);
                                            setData('phone', digits);
                                        }}
                                        inputMode="numeric"
                                        pattern="[0-9]{10}"
                                        maxLength={10}
                                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 ${errors.phone ? 'border-red-500' : 'border-gray-300'
                                            }`}
                                        required
                                        placeholder="e.g., 9876543210"
                                    />
                                    {errors.phone && (
                                        <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
                                    )}
                                </div>

                                {/* Shop License No */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Shop License No
                                    </label>
                                    <input
                                        type="text"
                                        value={data.shop_license_no}
                                        onChange={(e) => setData('shop_license_no', e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                        placeholder="e.g., LIC/SR/2024/001"
                                    />
                                    {errors.shop_license_no && (
                                        <p className="mt-1 text-sm text-red-600">{errors.shop_license_no}</p>
                                    )}
                                </div>

                                {/* Payment Mode */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Payment Mode <span className="text-red-500">*</span>
                                    </label>
                                    <div className="flex items-center space-x-6">
                                        <label className="inline-flex items-center">
                                            <input
                                                type="radio"
                                                value="cash"
                                                checked={data.payment_mode === 'cash'}
                                                onChange={(e) => setData('payment_mode', e.target.value)}
                                                className="form-radio h-4 w-4 text-indigo-600"
                                                required
                                            />
                                            <span className="ml-2 text-sm text-gray-700">Cash</span>
                                        </label>
                                        <label className="inline-flex items-center">
                                            <input
                                                type="radio"
                                                value="upi"
                                                checked={data.payment_mode === 'upi'}
                                                onChange={(e) => setData('payment_mode', e.target.value)}
                                                className="form-radio h-4 w-4 text-indigo-600"
                                            />
                                            <span className="ml-2 text-sm text-gray-700">UPI</span>
                                        </label>
                                        <label className="inline-flex items-center">
                                            <input
                                                type="radio"
                                                value="credit"
                                                checked={data.payment_mode === 'credit'}
                                                onChange={(e) => setData('payment_mode', e.target.value)}
                                                className="form-radio h-4 w-4 text-indigo-600"
                                            />
                                            <span className="ml-2 text-sm text-gray-700">Credit</span>
                                        </label>
                                    </div>
                                    {errors.payment_mode && (
                                        <p className="mt-1 text-sm text-red-600">{errors.payment_mode}</p>
                                    )}
                                </div>

                                {/* Fuel Type - Only for Fuel Bills */}
                                {billType === 'fuel' && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Fuel Type <span className="text-red-500">*</span>
                                        </label>
                                        <div className="flex items-center space-x-6">
                                            <label className="inline-flex items-center">
                                                <input
                                                    type="radio"
                                                    value="GAS"
                                                    checked={data.fuel_type === 'GAS'}
                                                    onChange={(e) => setData('fuel_type', e.target.value)}
                                                    className="form-radio h-4 w-4 text-orange-600"
                                                    required
                                                />
                                                <span className="ml-2 text-sm text-gray-700">GAS</span>
                                            </label>
                                            <label className="inline-flex items-center">
                                                <input
                                                    type="radio"
                                                    value="FIREWOOD"
                                                    checked={data.fuel_type === 'FIREWOOD'}
                                                    onChange={(e) => setData('fuel_type', e.target.value)}
                                                    className="form-radio h-4 w-4 text-orange-600"
                                                />
                                                <span className="ml-2 text-sm text-gray-700">FIREWOOD</span>
                                            </label>
                                        </div>
                                        {errors.fuel_type && (
                                            <p className="mt-1 text-sm text-red-600">{errors.fuel_type}</p>
                                        )}
                                    </div>
                                )}

                                {/* Deals With */}
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Deals With
                                    </label>
                                    <textarea
                                        value={data.deals_with}
                                        onChange={(e) => setData('deals_with', e.target.value)}
                                        rows={3}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                        placeholder="E.g., Pulses, Vegetables, Oil, Condiments"
                                    />
                                    <p className="mt-1 text-xs text-gray-500">Specify the categories/items this vendor deals with. This appears on the bill.</p>
                                    {errors.deals_with && (
                                        <p className="mt-1 text-sm text-red-600">{errors.deals_with}</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Bill Items Section */}
                        <div className="bg-white shadow-sm rounded-lg p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-lg font-semibold text-gray-900">Bill Items</h3>
                                <button
                                    type="button"
                                    onClick={addItem}
                                    className="inline-flex items-center px-3 py-2 border border-indigo-600 rounded-md 
                                        text-sm font-medium text-indigo-600 hover:bg-indigo-50"
                                >
                                    <PlusIcon className="h-4 w-4 mr-2" />
                                    Add Item
                                </button>
                            </div>

                            {/* Info Banner */}
                            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                <div className="flex">
                                    <ExclamationCircleIcon className="h-5 w-5 text-blue-500 mr-3 flex-shrink-0 mt-0.5" />
                                    <div className="text-sm text-blue-700">
                                        <p className="font-medium mb-1">Auto-calculation enabled</p>
                                        <p>Enter the <strong>Rate per Unit</strong> and the <strong>Quantity</strong> will be calculated automatically using: Quantity = Amount ÷ Rate</p>
                                    </div>
                                </div>
                            </div>

                            {billType === 'kiryana' && saltPercentages && (
                                <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                                    <div className="flex justify-between items-center mb-3">
                                        <div className="flex items-center space-x-3">
                                            <span className="text-amber-600 font-semibold">Salt Percentage Breakdown</span>
                                        </div>
                                        <span className="text-xs text-amber-700 uppercase tracking-wide">
                                            Applies to all salt line items
                                        </span>
                                    </div>
                                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                                        {Object.entries(saltPercentages).map(([key, value]) => (
                                            <div key={key} className="bg-white rounded-lg p-3 shadow-sm border border-amber-100">
                                                <p className="text-xs text-gray-500 uppercase">{key.replace('_', ' ')}</p>
                                                <p className="text-lg font-semibold text-gray-900">{Number(value).toFixed(2)}%</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Items Table */}
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                                Item Name
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                                Amount (₹)
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                                Rate (₹/unit)
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                                Quantity
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                                Unit
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                                Action
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {data.items.map((item, index) => (
                                            <tr key={index}>
                                                <td className="px-4 py-3">
                                                    <input
                                                        type="text"
                                                        value={item.item_name}
                                                        onChange={(e) => {
                                                            const updated = [...data.items];
                                                            updated[index].item_name = e.target.value;
                                                            setData('items', updated);
                                                        }}
                                                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                                                        required
                                                        // Lock default prefilled items EXCEPT for 'Coriander' and 'Other Condiments'
                                                        disabled={prefillItems.some(p => (
                                                            p.item_name === item.item_name &&
                                                            !['Coriander', 'Other Condiments'].includes(p.item_name)
                                                        ))}
                                                    />
                                                </td>

                                                <td className="px-4 py-3">
                                                    <input
                                                        type="number"
                                                        value={item.amount}
                                                        onChange={(e) => handleAmountChange(index, e.target.value)}
                                                        step="0.01"
                                                        min="0"
                                                        className="w-24 px-2 py-1 border border-gray-300 rounded text-sm"
                                                        required
                                                    />
                                                </td>
                                                <td className="px-4 py-3">
                                                    <input
                                                        type="number"
                                                        value={item.rate_per_unit}
                                                        onChange={(e) => handleRateChange(index, e.target.value)}
                                                        step="0.01"
                                                        min="0.01"
                                                        className={`w-24 px-2 py-1 border border-gray-300 rounded text-sm ${item.item_name === 'Other Condiments' ? 'bg-gray-100' : 'bg-yellow-50'}`}
                                                        required
                                                        placeholder={item.item_name === 'Other Condiments' ? 'Auto (Amt ÷ Qty)' : 'Enter rate'}
                                                        readOnly={item.item_name === 'Other Condiments'}
                                                    />
                                                </td>
                                                <td className="px-4 py-3">
                                                    {item.item_name === 'Other Condiments' ? (
                                                        <input
                                                            type="number"
                                                            value={item.quantity}
                                                            onChange={(e) => handleQuantityChange(index, e.target.value)}
                                                            step="0.01"
                                                            min="0"
                                                            className="w-24 px-2 py-1 border border-green-300 rounded text-sm bg-green-50"
                                                            required
                                                            placeholder="Qty"
                                                        />
                                                    ) : (
                                                        <span className="inline-flex items-center px-2 py-1 bg-green-50 text-green-700 rounded text-sm font-medium">
                                                            {item.quantity || 0}
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <select
                                                        value={item.unit}
                                                        onChange={(e) => handleUnitChange(index, e.target.value)}
                                                        className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
                                                    >
                                                        <option value="kg">KG</option>
                                                        <option value="litre">LITRE</option>
                                                        <option value="quintal">QUINTAL</option>
                                                        <option value="gram">GRAM</option>
                                                        <option value="piece">PIECE</option>
                                                        <option value="cylinder">CYLINDER</option>
                                                        <option value="box">BOX</option>
                                                        <option value="item">ITEM</option>
                                                        <option value="auto_fare">AUTO FARE</option>
                                                    </select>
                                                </td>
                                                <td className="px-4 py-3">
                                                    {data.items.length > 1 && (
                                                        <button
                                                            type="button"
                                                            onClick={() => removeItem(index)}
                                                            className="text-red-600 hover:text-red-900"
                                                        >
                                                            <TrashIcon className="h-5 w-5" />
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                    <tfoot className="bg-gray-50">
                                        <tr>
                                            <td colSpan="1" className="px-4 py-3 text-right font-bold">
                                                TOTAL:
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className="text-lg font-bold text-indigo-600">
                                                    ₹ {totalAmount.toFixed(2)}
                                                </span>
                                            </td>
                                            <td colSpan="4"></td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>

                            {errors.items && (
                                <p className="mt-2 text-sm text-red-600">{errors.items}</p>
                            )}
                        </div>

                        {/* Form Actions */}
                        <div className="bg-white shadow-sm rounded-lg p-6">
                            <div className="flex items-center justify-between">
                                <Link
                                    href={route('amount-reports.bills.index', report.id)}
                                    className="text-sm text-gray-600 hover:text-gray-900"
                                >
                                    Cancel
                                </Link>
                                <button
                                    type="submit"
                                    disabled={processing || data.items.length === 0}
                                    className="inline-flex items-center px-6 py-3 bg-indigo-600 border border-transparent 
                                        rounded-md font-semibold text-sm text-white uppercase tracking-widest 
                                        hover:bg-indigo-700 focus:bg-indigo-700 active:bg-indigo-900 
                                        focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 
                                        transition-all ease-in-out duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {processing ? 'Creating Bill...' : 'Create Bill'}
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}