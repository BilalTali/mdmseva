// File: resources/js/Components/DailyConsumption/Utils/schoolTypeHelpers.js

/**
 * School Type Helper Utilities
 * 
 * Standardized naming conventions aligned with PHP backend
 */

/**
 * School type constants
 */
export const SCHOOL_TYPES = {
    PRIMARY: 'primary',
    MIDDLE: 'middle',
    SECONDARY: 'secondary'
};

/**
 * Get complete school type configuration
 * @param {string} schoolType - 'primary', 'middle', or 'secondary'
 * @returns {Object} Complete configuration object
 */
export const getSchoolTypeConfig = (schoolType) => {
    const configs = {
        primary: {
            type: SCHOOL_TYPES.PRIMARY,
            label: 'Primary School (Classes I-V)',
            sections: ['primary'],
            hasPrimary: true,
            hasMiddle: false,
            riceColumns: ['date', 'day', 'served_primary', 'primary_rice', 'total_rice', 'remaining_balance', 'actions'],
            amountColumns: ['date', 'served_primary', 'primary_pulses', 'primary_vegetables', 'primary_oil', 'primary_salt', 'primary_fuel', 'amount_primary', 'total_amount_consumed', 'cumulative_amount']
        },
        middle: {
            type: SCHOOL_TYPES.MIDDLE,
            label: 'Primary + Middle School (Classes I-VIII)',
            sections: ['primary', 'middle'],
            hasPrimary: true,
            hasMiddle: true,
            riceColumns: ['date', 'day', 'served_primary', 'primary_rice', 'served_middle', 'middle_rice', 'total_rice', 'remaining_balance', 'actions'],
            amountColumns: ['date', 'served_primary', 'primary_pulses', 'primary_vegetables', 'primary_oil', 'primary_salt', 'primary_fuel', 'amount_primary', 'served_middle', 'middle_pulses', 'middle_vegetables', 'middle_oil', 'middle_salt', 'middle_fuel', 'amount_middle', 'total_amount_consumed', 'cumulative_amount']
        },
        secondary: {
            type: SCHOOL_TYPES.SECONDARY,
            label: 'Middle School (Classes VI-VIII)',
            sections: ['middle'],
            hasPrimary: false,
            hasMiddle: true,
            riceColumns: ['date', 'day', 'served_middle', 'middle_rice', 'total_rice', 'remaining_balance', 'actions'],
            amountColumns: ['date', 'served_middle', 'middle_pulses', 'middle_vegetables', 'middle_oil', 'middle_salt', 'middle_fuel', 'amount_middle', 'total_amount_consumed', 'cumulative_amount']
        }
    };
    return configs[schoolType] || configs.primary;
};

/**
 * Get school type display name
 * @param {string} schoolType - 'primary', 'middle', or 'secondary'
 * @returns {string} Human-readable school type
 */
export const getSchoolTypeDisplay = (schoolType) => {
    return getSchoolTypeConfig(schoolType).label;
};

/**
 * Check if school has primary section
 * @param {string|Object} schoolType - School type or config object
 * @returns {boolean}
 */
export const hasPrimarySection = (schoolType) => {
    if (typeof schoolType === 'object') {
        return schoolType.hasPrimary;
    }
    return getSchoolTypeConfig(schoolType).hasPrimary;
};

/**
 * Check if school has middle section
 * @param {string|Object} schoolType - School type or config object
 * @returns {boolean}
 */
export const hasMiddleSection = (schoolType) => {
    if (typeof schoolType === 'object') {
        return schoolType.hasMiddle;
    }
    return getSchoolTypeConfig(schoolType).hasMiddle;
};

/**
 * Check if should show primary columns
 * @param {string} schoolType
 * @returns {boolean}
 */
export const shouldShowPrimaryColumns = (schoolType) => {
    return ['primary', 'middle'].includes(schoolType);
};

/**
 * Check if should show middle columns
 * @param {string} schoolType
 * @returns {boolean}
 */
export const shouldShowMiddleColumns = (schoolType) => {
    return ['middle', 'secondary'].includes(schoolType);
};

/**
 * Get visible columns for rice consumption table
 * @param {string} schoolType - 'primary', 'middle', or 'secondary'
 * @returns {Array<string>} Column identifiers
 */
export const getRiceTableColumns = (schoolType) => {
    return getSchoolTypeConfig(schoolType).riceColumns;
};

/**
 * Get visible columns for amount consumption table
 * @param {string} schoolType - 'primary', 'middle', or 'secondary'
 * @returns {Array<string>} Column identifiers
 */
export const getAmountTableColumns = (schoolType) => {
    return getSchoolTypeConfig(schoolType).amountColumns;
};

/**
 * Get sections array from school type
 * @param {string} schoolType
 * @returns {Array<string>} ['primary'] or ['middle'] or ['primary', 'middle']
 */
export const getSections = (schoolType) => {
    return getSchoolTypeConfig(schoolType).sections;
};

/**
 * Get section label
 * @param {string} section - 'primary' or 'middle'
 * @returns {string} Display label
 */
export const getSectionLabel = (section) => {
    const labels = {
        primary: 'Primary (I-V)',
        middle: 'Middle (VI-VIII)',
    };
    return labels[section] || section;
};

/**
 * Get stock status color class
 * @param {number} stock - Current stock level in kg
 * @returns {string} Tailwind color class
 */
export const getStockColorClass = (stock) => {
    const stockKg = parseFloat(stock) || 0;
    if (stockKg < 0) return 'text-red-600';
    if (stockKg < 10) return 'text-red-600';  // Less than 10kg
    if (stockKg < 50) return 'text-orange-600'; // Less than 50kg
    return 'text-green-600';
};

/**
 * Get stock status badge
 * @param {number} stock - Current stock level in kg
 * @returns {Object} { text, className }
 */
export const getStockStatus = (stock) => {
    const stockKg = parseFloat(stock) || 0;
    if (stockKg < 0) {
        return { text: 'Negative Stock', className: 'bg-red-100 text-red-800' }; // FIXED: Changed from "Insufficient"
    }
    if (stockKg < 10) {
        return { text: 'Critical', className: 'bg-red-100 text-red-800' };
    }
    if (stockKg < 50) {
        return { text: 'Low Stock', className: 'bg-orange-100 text-orange-800' };
    }
    if (stockKg < 100) {
        return { text: 'Moderate', className: 'bg-yellow-100 text-yellow-800' };
    }
    return { text: 'Healthy', className: 'bg-green-100 text-green-800' }; // ENHANCED: Changed from "Good"
};

/**
 * Check if stock is at critical or negative level
 * @param {number} stock - Current stock level in kg
 * @returns {boolean} True if stock needs immediate attention
 */
export const isStockCritical = (stock) => {
    const stockKg = parseFloat(stock) || 0;
    return stockKg < 10; // Critical threshold
};

/**
 * Get stock warning message
 * @param {number} stock - Current stock level in kg
 * @returns {string|null} Warning message or null if stock is adequate
 */
export const getStockWarning = (stock) => {
    const stockKg = parseFloat(stock) || 0;
    
    if (stockKg < 0) {
        return 'Negative stock! Please add rice inventory immediately.';
    }
    if (stockKg < 10) {
        return 'Critical level! Stock needs immediate replenishment.';
    }
    if (stockKg < 50) {
        return 'Low stock. Consider ordering more rice soon.';
    }
    return null; // No warning needed
};

/**
 * Format sections array for display
 * @param {Array<string>} sections - ['primary', 'middle']
 * @returns {string} Formatted string
 */
export const formatSections = (sections) => {
    return sections.map(getSectionLabel).join(' + ');
};