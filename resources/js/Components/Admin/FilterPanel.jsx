import { useState, useEffect } from 'react';
import axios from 'axios';

export default function FilterPanel({ 
    onApply, 
    onReset, 
    showDateFilters = false,
    showSchoolTypeFilter = false,
    showStatusFilter = false,
    defaultFilters = {}
}) {
    // Normalize defaults to avoid null values in controlled selects
    const [filters, setFilters] = useState(() => ({
        ...defaultFilters,
        state: defaultFilters.state ?? '',
        district_id: defaultFilters.district_id ?? '',
        zone_id: defaultFilters.zone_id ?? '',
        month: defaultFilters.month ?? (new Date().getMonth() + 1),
        year: defaultFilters.year ?? new Date().getFullYear(),
        school_type: defaultFilters.school_type ?? '',
        status: defaultFilters.status ?? 'all',
    }));

    const [districts, setDistricts] = useState([]);
    const [zones, setZones] = useState([]);
    const [loadingDistricts, setLoadingDistricts] = useState(false);
    const [loadingZones, setLoadingZones] = useState(false);

    // Load districts when state changes
    useEffect(() => {
        if (filters.state) {
            loadDistricts(filters.state);
        } else {
            loadAllDistricts();
        }
    }, [filters.state]);

    // Load zones when district changes
    useEffect(() => {
        if (filters.district_id) {
            loadZones(filters.district_id);
        } else {
            setZones([]);
        }
    }, [filters.district_id]);

    const loadAllDistricts = async () => {
        setLoadingDistricts(true);
        try {
            const response = await axios.get('/api/districts');
            setDistricts(response.data.data || []);
        } catch (error) {
            console.error('Failed to load districts:', error);
        } finally {
            setLoadingDistricts(false);
        }
    };

    const loadDistricts = async (state) => {
        setLoadingDistricts(true);
        try {
            const response = await axios.get('/api/districts', {
                params: { state }
            });
            setDistricts(response.data.data || []);
        } catch (error) {
            console.error('Failed to load districts:', error);
        } finally {
            setLoadingDistricts(false);
        }
    };

    const loadZones = async (districtId) => {
        setLoadingZones(true);
        try {
            const response = await axios.get(`/api/zones/${districtId}`);
            setZones(response.data.data || []);
        } catch (error) {
            console.error('Failed to load zones:', error);
        } finally {
            setLoadingZones(false);
        }
    };

    const handleStateChange = (state) => {
        setFilters(prev => ({
            ...prev,
            state,
            district_id: '',
            zone_id: ''
        }));
        setZones([]);
    };

    const handleDistrictChange = (districtId) => {
        setFilters(prev => ({
            ...prev,
            district_id: districtId,
            zone_id: ''
        }));
    };

    const handleApply = () => {
        onApply(filters);
    };

    const handleReset = () => {
        const resetFilters = {
            state: '',
            district_id: '',
            zone_id: '',
            month: new Date().getMonth() + 1,
            year: new Date().getFullYear(),
            school_type: '',
            status: 'all',
        };
        setFilters(resetFilters);
        setZones([]);
        onReset(resetFilters);
    };

    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 10 }, (_, i) => currentYear - 5 + i);

    return (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Filters</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* State Filter */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        State/UT
                    </label>
                    <select
                        value={filters.state}
                        onChange={(e) => handleStateChange(e.target.value)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    >
                        <option value="">All States</option>
                        <option value="Jammu and Kashmir">Jammu and Kashmir</option>
                        <option value="Ladakh">Ladakh</option>
                    </select>
                </div>

                {/* District Filter */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        District
                    </label>
                    <select
                        value={filters.district_id}
                        onChange={(e) => handleDistrictChange(e.target.value)}
                        disabled={loadingDistricts}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 disabled:bg-gray-100"
                    >
                        <option value="">
                            {loadingDistricts ? 'Loading...' : 'All Districts'}
                        </option>
                        {districts.map((district) => (
                            <option key={district.id} value={district.id}>
                                {district.name}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Zone Filter */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Zone
                    </label>
                    <select
                        value={filters.zone_id}
                        onChange={(e) => setFilters(prev => ({ ...prev, zone_id: e.target.value }))}
                        disabled={!filters.district_id || loadingZones}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 disabled:bg-gray-100"
                    >
                        <option value="">
                            {loadingZones ? 'Loading...' : 'All Zones'}
                        </option>
                        {zones.map((zone) => (
                            <option key={zone.id} value={zone.id}>
                                {zone.name}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Date Filters */}
                {showDateFilters && (
                    <>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Month
                            </label>
                            <select
                                value={filters.month}
                                onChange={(e) => setFilters(prev => ({ ...prev, month: e.target.value }))}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                            >
                                <option value="1">January</option>
                                <option value="2">February</option>
                                <option value="3">March</option>
                                <option value="4">April</option>
                                <option value="5">May</option>
                                <option value="6">June</option>
                                <option value="7">July</option>
                                <option value="8">August</option>
                                <option value="9">September</option>
                                <option value="10">October</option>
                                <option value="11">November</option>
                                <option value="12">December</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Year
                            </label>
                            <select
                                value={filters.year}
                                onChange={(e) => setFilters(prev => ({ ...prev, year: e.target.value }))}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                            >
                                {years.map(year => (
                                    <option key={year} value={year}>{year}</option>
                                ))}
                            </select>
                        </div>
                    </>
                )}

                {/* School Type Filter */}
                {showSchoolTypeFilter && (
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            School Type
                        </label>
                        <select
                            value={filters.school_type}
                            onChange={(e) => setFilters(prev => ({ ...prev, school_type: e.target.value }))}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                        >
                            <option value="">All Types</option>
                            <option value="primary">Primary</option>
                            <option value="middle">Middle</option>
                            <option value="secondary">Secondary</option>
                        </select>
                    </div>
                )}

                {/* Status Filter */}
                {showStatusFilter && (
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Status
                        </label>
                        <select
                            value={filters.status}
                            onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                        >
                            <option value="all">All Schools</option>
                            <option value="active">Active Only</option>
                            <option value="inactive">Inactive Only</option>
                        </select>
                    </div>
                )}
            </div>

            {/* Action Buttons */}
            <div className="mt-6 flex items-center justify-end space-x-3">
                <button
                    type="button"
                    onClick={handleReset}
                    className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                    Reset
                </button>
                <button
                    type="button"
                    onClick={handleApply}
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                    Apply Filters
                </button>
            </div>
        </div>
    );
}