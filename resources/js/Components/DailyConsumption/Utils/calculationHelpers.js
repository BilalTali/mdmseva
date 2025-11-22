// File: resources/js/Components/DailyConsumption/Utils/calculationHelpers.js

/**
 * Calculation Helper Utilities
 * 
 * Standardized naming conventions aligned with PHP backend
 * All rice calculations in kg (as per backend standard)
 */

/**
 * Rice consumption rates per student (in kg)
 */
const RICE_RATES = {
    primary: 0.1,   // 0.1 kg per primary student
    middle: 0.15,   // 0.15 kg per middle student
};

/**
 * Amount consumption rates per student (in rupees)
 */
const AMOUNT_RATES = {
    primary: {
        pulses: 4.81,
        vegetables: 3.56,
        oil: 1.78,
        salt: 0.89,
        fuel: 1.78,
    },
    middle: {
        pulses: 7.22,
        vegetables: 5.34,
        oil: 2.67,
        salt: 1.34,
        fuel: 2.67,
    },
};

/**
 * Calculate rice consumption for a section (in kg)
 * @param {number} students - Number of students (servedPrimary or servedMiddle)
 * @param {string} section - 'primary' or 'middle'
 * @returns {number} Rice consumption in kg (primaryRice or middleRice)
 */
export const calculateRiceConsumption = (students, section) => {
    const studentCount = parseInt(students) || 0;
    const rate = RICE_RATES[section] || 0;
    return studentCount * rate;
};

/**
 * Calculate total rice consumption for all sections
 * @param {Object} data - { servedPrimary, servedMiddle }
 * @param {Array<string>} sections - ['primary', 'middle']
 * @returns {number} totalRiceConsumed in kg
 */
export const calculateTotalRice = (data, sections) => {
    let totalRiceConsumed = 0;
    
    if (sections.includes('primary')) {
        const servedPrimary = parseInt(data.servedPrimary || data.served_primary) || 0;
        totalRiceConsumed += calculateRiceConsumption(servedPrimary, 'primary');
    }
    
    if (sections.includes('middle')) {
        const servedMiddle = parseInt(data.servedMiddle || data.served_middle) || 0;
        totalRiceConsumed += calculateRiceConsumption(servedMiddle, 'middle');
    }
    
    return totalRiceConsumed;
};

/**
 * Calculate running balance for rice consumption records
 * @param {Array} records - Array of consumption records
 * @param {number} openingBalance - Opening balance in kg
 * @param {Object} schoolConfig - School configuration object
 * @returns {Array} Records with calculated balance fields
 */
export const calculateRunningBalance = (records, openingBalance, schoolConfig) => {
    let currentBalance = parseFloat(openingBalance) || 0;
    const { hasPrimary, hasMiddle } = schoolConfig;
    
    return records.map(record => {
        // Calculate rice consumption (primaryRice, middleRice)
        const primaryRice = hasPrimary 
            ? calculateRiceConsumption(record.served_primary || record.servedPrimary || 0, 'primary') 
            : 0;
        const middleRice = hasMiddle 
            ? calculateRiceConsumption(record.served_middle || record.servedMiddle || 0, 'middle') 
            : 0;
        const totalRice = primaryRice + middleRice;
        
        // Calculate remaining balance
        const remainingBalance = currentBalance - totalRice;
        currentBalance = remainingBalance;
        
        return {
            ...record,
            primary_rice: primaryRice,
            middle_rice: middleRice,
            total_rice: totalRice,
            remaining_balance: remainingBalance
        };
    });
};

/**
 * Calculate amount consumption for a section
 * @param {number} students - Number of students (servedPrimary or servedMiddle)
 * @param {string} section - 'primary' or 'middle'
 * @returns {Object} { pulses, vegetables, oil, salt, fuel, total }
 */
export const calculateAmountConsumption = (students, section) => {
    const studentCount = parseInt(students) || 0;
    const rates = AMOUNT_RATES[section] || {};
    
    const pulses = studentCount * (rates.pulses || 0);
    const vegetables = studentCount * (rates.vegetables || 0);
    const oil = studentCount * (rates.oil || 0);
    const salt = studentCount * (rates.salt || 0);
    const fuel = studentCount * (rates.fuel || 0);
    
    const total = pulses + vegetables + oil + salt + fuel;
    
    return {
        pulses: parseFloat(pulses.toFixed(2)),
        vegetables: parseFloat(vegetables.toFixed(2)),
        oil: parseFloat(oil.toFixed(2)),
        salt: parseFloat(salt.toFixed(2)),
        fuel: parseFloat(fuel.toFixed(2)),
        total: parseFloat(total.toFixed(2)),
    };
};

/**
 * Calculate amount breakdown for all sections
 * @param {Object} data - { servedPrimary, servedMiddle }
 * @param {Array<string>} sections - ['primary', 'middle']
 * @returns {Object} amountBreakdown { primary: {...}, middle: {...}, grandTotal }
 */
export const calculateAmountBreakdown = (data, sections) => {
    const breakdown = {
        primary: null,
        middle: null,
        grandTotal: 0
    };
    
    if (sections.includes('primary')) {
        const servedPrimary = parseInt(data.servedPrimary || data.served_primary) || 0;
        breakdown.primary = calculateAmountConsumption(servedPrimary, 'primary');
        breakdown.grandTotal += breakdown.primary.total;
    }
    
    if (sections.includes('middle')) {
        const servedMiddle = parseInt(data.servedMiddle || data.served_middle) || 0;
        breakdown.middle = calculateAmountConsumption(servedMiddle, 'middle');
        breakdown.grandTotal += breakdown.middle.total;
    }
    
    return breakdown;
};

/**
 * Calculate total amount consumption for all sections
 * @param {Object} data - { servedPrimary, servedMiddle }
 * @param {Array<string>} sections - ['primary', 'middle']
 * @returns {number} totalAmountConsumed in rupees
 */
export const calculateTotalAmount = (data, sections) => {
    const breakdown = calculateAmountBreakdown(data, sections);
    return breakdown.grandTotal;
};

/**
 * Calculate remaining rice balance after consumption
 * @param {number} currentBalance - Current stock in kg
 * @param {number} consumption - Consumption amount in kg (totalRiceConsumed)
 * @returns {number} remainingBalance in kg
 */
export const calculateRemainingBalance = (currentBalance, consumption) => {
    const balance = parseFloat(currentBalance) || 0;
    const consumed = parseFloat(consumption) || 0;
    return balance - consumed;
};

/**
 * Format weight in kg
 * @param {number} kg - Weight in kg
 * @returns {string} Formatted weight (e.g., "15.50 kg")
 */
export const formatWeight = (kg) => {
    const weight = parseFloat(kg) || 0;
    return `${weight.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} kg`;
};

/**
 * Format currency amount
 * @param {number} amount - Amount in rupees
 * @returns {string} Formatted currency (e.g., "₹1,234.56")
 */
export const formatCurrency = (amount) => {
    const value = parseFloat(amount) || 0;
    return `₹${value.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

/**
 * Format date to DD/MM/YYYY
 * @param {string|Date} date - Date to format
 * @returns {string} Formatted date
 */
export const formatDate = (date) => {
    if (!date) return '';
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
};

/**
 * Get day name from date
 * @param {string|Date} date - Date
 * @returns {string} Day name (e.g., "Monday")
 */
export const getDayName = (date) => {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleDateString('en-US', { weekday: 'long' });
};

/**
 * Validate student count
 * @param {number} count - Student count
 * @returns {boolean} Is valid
 */
export const isValidStudentCount = (count) => {
    const num = parseInt(count);
    return !isNaN(num) && num >= 0;
};

/**
 * Validate if sufficient stock is available
 * @param {number} openingBalance - Current stock in kg
 * @param {number} estimatedRice - Required amount in kg
 * @returns {boolean} Has sufficient stock
 */
export const hasSufficientStock = (openingBalance, estimatedRice) => {
    const stock = parseFloat(openingBalance) || 0;
    const required = parseFloat(estimatedRice) || 0;
    return stock >= required;
};

/**
 * Get rates for display/reference
 * @returns {Object} { rice: {...}, amount: {...} }
 */
export const getRates = () => {
    return {
        rice: RICE_RATES,
        amount: AMOUNT_RATES,
    };
};