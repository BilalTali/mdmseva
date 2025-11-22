// File: resources/js/Components/DailyConsumption/Utils/constants.js

/**
 * Constants and Configuration for Daily Consumption
 * 
 * Centralized configuration for rice consumption tracking
 * Supports different school types and calculation methods
 */

// ============================================================================
// SCHOOL TYPES
// ============================================================================

export const SCHOOL_TYPES = {
    PRIMARY: 'primary',
    MIDDLE: 'middle',
    PRIMARY_MIDDLE: 'primary_middle'
};

export const SCHOOL_TYPE_LABELS = {
    [SCHOOL_TYPES.PRIMARY]: 'Primary School',
    [SCHOOL_TYPES.MIDDLE]: 'Middle School',
    [SCHOOL_TYPES.PRIMARY_MIDDLE]: 'Primary & Middle School'
};

// ============================================================================
// RICE CALCULATION RATES (grams per student)
// ============================================================================

export const RICE_RATES = {
    PRIMARY: 100,    // 100g per primary student
    MIDDLE: 150      // 150g per middle student
};

export const RICE_RATES_DISPLAY = {
    PRIMARY: '100g',
    MIDDLE: '150g'
};

// ============================================================================
// AMOUNT CALCULATION RATES (rupees per student)
// ============================================================================

export const AMOUNT_RATES = {
    PRIMARY: 5.94,   // ₹5.94 per primary student
    MIDDLE: 8.91     // ₹8.91 per middle student
};

export const AMOUNT_RATES_DISPLAY = {
    PRIMARY: '₹5.94',
    MIDDLE: '₹8.91'
};

// ============================================================================
// SECTIONS (Student Categories)
// ============================================================================

export const SECTIONS = {
    PRIMARY: 'primary',
    MIDDLE: 'middle'
};

export const SECTION_LABELS = {
    [SECTIONS.PRIMARY]: 'Primary (1-5)',
    [SECTIONS.MIDDLE]: 'Middle (6-8)'
};

export const SECTION_LABELS_SHORT = {
    [SECTIONS.PRIMARY]: 'Primary',
    [SECTIONS.MIDDLE]: 'Middle'
};

// ============================================================================
// TABLE COLUMN TYPES
// ============================================================================

export const COLUMN_TYPES = {
    DATE: 'date',
    NUMBER: 'number',
    WEIGHT: 'weight',
    AMOUNT: 'amount',
    BALANCE: 'balance',
    ACTIONS: 'actions'
};

// ============================================================================
// FIELD NAMES (Standardized Database Columns)
// ============================================================================

export const FIELDS = {
    // Date
    CONSUMPTION_DATE: 'consumption_date',
    
    // Students Served
    SERVED_PRIMARY: 'served_primary',
    SERVED_MIDDLE: 'served_middle',
    TOTAL_STUDENTS_SERVED: 'total_students_served',
    
    // Rice Amounts (kg)
    AMOUNT_PRIMARY: 'amount_primary',
    AMOUNT_MIDDLE: 'amount_middle',
    TOTAL_AMOUNT_CONSUMED: 'total_amount_consumed',
    
    // Monetary Amounts (₹)
    AMOUNT_PRIMARY_MONEY: 'amount_primary',
    AMOUNT_MIDDLE_MONEY: 'amount_middle',
    TOTAL_AMOUNT_MONEY: 'total_amount_consumed',
    
    // Balances
    OPENING_BALANCE: 'opening_balance',
    REMAINING_BALANCE: 'remaining_balance',
    
    // Cumulative
    CUMULATIVE_AMOUNT: 'cumulative_amount'
};

// ============================================================================
// DISPLAY FORMATS
// ============================================================================

export const FORMATS = {
    DATE: {
        DISPLAY: 'MMM DD, YYYY',     // Jan 15, 2024
        INPUT: 'YYYY-MM-DD',         // 2024-01-15
        SHORT: 'MM/DD/YY'            // 01/15/24
    },
    NUMBER: {
        LOCALE: 'en-IN',             // Indian number format
        DECIMAL_PLACES: 2
    },
    CURRENCY: {
        SYMBOL: '₹',
        LOCALE: 'en-IN',
        STYLE: 'currency',
        CURRENCY_CODE: 'INR'
    },
    WEIGHT: {
        UNIT: 'kg',
        GRAM_UNIT: 'g',
        DECIMAL_PLACES: 2
    }
};

// ============================================================================
// VALIDATION RULES
// ============================================================================

export const VALIDATION = {
    MIN_STUDENTS: 0,
    MAX_STUDENTS: 10000,
    MIN_WEIGHT: 0,
    MAX_WEIGHT: 100000,  // 100 tons
    MIN_AMOUNT: 0,
    MAX_AMOUNT: 1000000, // ₹10 lakhs
    DATE_MAX: 'today',
    REQUIRED_FIELDS: {
        RICE: ['consumption_date', 'opening_balance'],
        AMOUNT: ['consumption_date']
    }
};

// ============================================================================
// UI CONSTANTS
// ============================================================================

export const UI = {
    PAGINATION: {
        PER_PAGE: 15,
        MAX_VISIBLE_PAGES: 7
    },
    TOAST: {
        DURATION: 5000,  // 5 seconds
        POSITION: 'top-right'
    },
    DEBOUNCE: {
        SEARCH: 300,     // 300ms
        INPUT: 500       // 500ms
    }
};

// ============================================================================
// STATUS INDICATORS
// ============================================================================

export const STATUS = {
    BALANCE_LOW: 'low',      // < 20% of opening
    BALANCE_MEDIUM: 'medium', // 20-50%
    BALANCE_GOOD: 'good'     // > 50%
};

export const STATUS_COLORS = {
    [STATUS.BALANCE_LOW]: {
        bg: 'bg-red-100',
        text: 'text-red-800',
        border: 'border-red-200'
    },
    [STATUS.BALANCE_MEDIUM]: {
        bg: 'bg-yellow-100',
        text: 'text-yellow-800',
        border: 'border-yellow-200'
    },
    [STATUS.BALANCE_GOOD]: {
        bg: 'bg-green-100',
        text: 'text-green-800',
        border: 'border-green-200'
    }
};

// ============================================================================
// ERROR MESSAGES
// ============================================================================

export const ERROR_MESSAGES = {
    REQUIRED_FIELD: 'This field is required',
    INVALID_DATE: 'Please enter a valid date',
    DATE_FUTURE: 'Date cannot be in the future',
    NEGATIVE_NUMBER: 'Value cannot be negative',
    INSUFFICIENT_BALANCE: 'Insufficient balance for this consumption',
    DUPLICATE_DATE: 'Entry already exists for this date',
    NETWORK_ERROR: 'Network error. Please try again.',
    SERVER_ERROR: 'Server error. Please contact support.'
};

// ============================================================================
// SUCCESS MESSAGES
// ============================================================================

export const SUCCESS_MESSAGES = {
    ENTRY_CREATED: 'Consumption entry created successfully',
    ENTRY_UPDATED: 'Consumption entry updated successfully',
    ENTRY_DELETED: 'Consumption entry deleted successfully',
    BULK_DELETE: 'Selected entries deleted successfully'
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get balance status based on percentage
 */
export function getBalanceStatus(current, opening) {
    if (!opening || opening === 0) return STATUS.BALANCE_GOOD;
    
    const percentage = (current / opening) * 100;
    
    if (percentage < 20) return STATUS.BALANCE_LOW;
    if (percentage < 50) return STATUS.BALANCE_MEDIUM;
    return STATUS.BALANCE_GOOD;
}

/**
 * Check if school type has primary section
 */
export function hasPrimarySection(schoolType) {
    return [SCHOOL_TYPES.PRIMARY, SCHOOL_TYPES.PRIMARY_MIDDLE].includes(schoolType);
}

/**
 * Check if school type has middle section
 */
export function hasMiddleSection(schoolType) {
    return [SCHOOL_TYPES.MIDDLE, SCHOOL_TYPES.PRIMARY_MIDDLE].includes(schoolType);
}

/**
 * Get active sections for school type
 */
export function getActiveSections(schoolType) {
    const sections = [];
    if (hasPrimarySection(schoolType)) sections.push(SECTIONS.PRIMARY);
    if (hasMiddleSection(schoolType)) sections.push(SECTIONS.MIDDLE);
    return sections;
}

export default {
    SCHOOL_TYPES,
    SCHOOL_TYPE_LABELS,
    RICE_RATES,
    RICE_RATES_DISPLAY,
    AMOUNT_RATES,
    AMOUNT_RATES_DISPLAY,
    SECTIONS,
    SECTION_LABELS,
    SECTION_LABELS_SHORT,
    COLUMN_TYPES,
    FIELDS,
    FORMATS,
    VALIDATION,
    UI,
    STATUS,
    STATUS_COLORS,
    ERROR_MESSAGES,
    SUCCESS_MESSAGES,
    getBalanceStatus,
    hasPrimarySection,
    hasMiddleSection,
    getActiveSections
};