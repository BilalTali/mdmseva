// File: resources/js/Pages/Dashboard/api.js

/**
 * Dashboard API Helper
 * 
 * Centralized API calls for dashboard data fetching
 * Handles error handling and response formatting
 */

/**
 * Base API request handler with error handling
 */
const apiRequest = async (url, options = {}) => {
    try {
        const response = await fetch(url, {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                ...options.headers,
            },
            credentials: 'include',
            ...options,
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        return { success: true, data };
    } catch (error) {
        console.error('API Request Error:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Build query string from params object
 */
const buildQueryString = (params) => {
    const queryParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== '') {
            queryParams.append(key, value);
        }
    });
    
    const queryString = queryParams.toString();
    return queryString ? `?${queryString}` : '';
};

/**
 * Dashboard API methods
 */
export const dashboardApi = {
    /**
     * Get dashboard summary statistics
     * @param {Object} params - { year, month }
     * @returns {Promise<Object>} Summary data with totals and breakdowns
     */
    getSummary: async (params = {}) => {
        const queryString = buildQueryString(params);
        return apiRequest(`/api/dashboard/summary${queryString}`);
    },

    /**
     * Get rice balance timeseries for chart
     * @param {Object} params - { year, month }
     * @returns {Promise<Array>} Array of daily balance data
     */
    getRiceBalanceTimeseries: async (params = {}) => {
        const queryString = buildQueryString(params);
        return apiRequest(`/api/dashboard/rice-balance${queryString}`);
    },

    /**
     * Get daily amount chart data
     * @param {Object} params - { year, month }
     * @returns {Promise<Array>} Array of daily expenditure data
     */
    getDailyAmountChart: async (params = {}) => {
        const queryString = buildQueryString(params);
        return apiRequest(`/api/dashboard/daily-amount${queryString}`);
    },

    /**
     * Get amount breakdown by component
     * @param {Object} params - { year, month }
     * @returns {Promise<Object>} Breakdown by pulses, vegetables, oil, salt, fuel
     */
    getAmountBreakdown: async (params = {}) => {
        const queryString = buildQueryString(params);
        return apiRequest(`/api/dashboard/breakdown${queryString}`);
    },

    /**
     * Get recent consumptions
     * @param {Object} params - { year, month, per_page, page }
     * @returns {Promise<Object>} Paginated consumption data
     */
    getRecentConsumptions: async (params = {}) => {
        const queryString = buildQueryString(params);
        return apiRequest(`/api/dashboard/recent${queryString}`);
    },

    /**
     * Get paginated consumption records
     * @param {Object} params - { year, month, per_page, page }
     * @returns {Promise<Object>} Paginated consumption records
     */
    getConsumptions: async (params = {}) => {
        const queryString = buildQueryString(params);
        return apiRequest(`/api/dashboard/consumptions${queryString}`);
    },

    /**
     * Get activity feed
     * @param {Object} params - { limit }
     * @returns {Promise<Array>} Recent activities
     */
    getActivityFeed: async (params = {}) => {
        const queryString = buildQueryString(params);
        return apiRequest(`/api/dashboard/activity${queryString}`);
    },
};

/**
 * Format error message for display
 * @param {string} error - Error message
 * @returns {string} Formatted error message
 */
export const formatErrorMessage = (error) => {
    if (!error) return 'An unknown error occurred';
    
    // Handle common error patterns
    if (error.includes('Failed to fetch')) {
        return 'Network error. Please check your connection.';
    }
    
    if (error.includes('401')) {
        return 'Authentication required. Please log in again.';
    }
    
    if (error.includes('403')) {
        return 'You do not have permission to access this data.';
    }
    
    if (error.includes('404')) {
        return 'Data not found. Please check your filters.';
    }
    
    if (error.includes('500')) {
        return 'Server error. Please try again later.';
    }
    
    return error;
};

/**
 * Retry failed API request with exponential backoff
 * @param {Function} apiCall - API call function to retry
 * @param {number} maxRetries - Maximum number of retries (default: 3)
 * @param {number} delay - Initial delay in ms (default: 1000)
 * @returns {Promise<Object>} API response
 */
export const retryApiCall = async (apiCall, maxRetries = 3, delay = 1000) => {
    let lastError;
    
    for (let i = 0; i < maxRetries; i++) {
        const result = await apiCall();
        
        if (result.success) {
            return result;
        }
        
        lastError = result.error;
        
        // Don't retry on client errors (4xx)
        if (result.error && result.error.includes('4')) {
            break;
        }
        
        // Wait before retrying with exponential backoff
        if (i < maxRetries - 1) {
            await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i)));
        }
    }
    
    return { success: false, error: lastError };
};

/**
 * Batch multiple API calls
 * @param {Array<Function>} apiCalls - Array of API call functions
 * @returns {Promise<Array>} Array of results
 */
export const batchApiCalls = async (apiCalls) => {
    return Promise.all(apiCalls.map(call => call()));
};

/**
 * Cache API responses (simple in-memory cache)
 */
class ApiCache {
    constructor(ttl = 60000) { // Default TTL: 60 seconds
        this.cache = new Map();
        this.ttl = ttl;
    }

    get(key) {
        const cached = this.cache.get(key);
        
        if (!cached) return null;
        
        if (Date.now() > cached.expiry) {
            this.cache.delete(key);
            return null;
        }
        
        return cached.data;
    }

    set(key, data) {
        this.cache.set(key, {
            data,
            expiry: Date.now() + this.ttl
        });
    }

    clear() {
        this.cache.clear();
    }

    delete(key) {
        this.cache.delete(key);
    }
}

// Export cache instance
export const apiCache = new ApiCache(60000); // 60 second TTL

/**
 * Cached API request wrapper
 * @param {string} cacheKey - Unique cache key
 * @param {Function} apiCall - API call function
 * @param {boolean} useCache - Whether to use cache (default: true)
 * @returns {Promise<Object>} API response
 */
export const cachedApiCall = async (cacheKey, apiCall, useCache = true) => {
    if (useCache) {
        const cached = apiCache.get(cacheKey);
        if (cached) {
            return { success: true, data: cached, fromCache: true };
        }
    }
    
    const result = await apiCall();
    
    if (result.success && useCache) {
        apiCache.set(cacheKey, result.data);
    }
    
    return result;
};

/**
 * Format date for API requests
 * @param {Date} date - Date object
 * @returns {Object} { year, month }
 */
export const formatDateForApi = (date) => {
    return {
        year: date.getFullYear(),
        month: date.getMonth() + 1
    };
};

/**
 * Get current period params
 * @returns {Object} { year, month }
 */
export const getCurrentPeriod = () => {
    return formatDateForApi(new Date());
};

/**
 * Get previous period params
 * @param {number} year - Current year
 * @param {number} month - Current month
 * @returns {Object} { year, month }
 */
export const getPreviousPeriod = (year, month) => {
    if (month === 1) {
        return { year: year - 1, month: 12 };
    }
    return { year, month: month - 1 };
};

/**
 * Get next period params
 * @param {number} year - Current year
 * @param {number} month - Current month
 * @returns {Object} { year, month }
 */
export const getNextPeriod = (year, month) => {
    if (month === 12) {
        return { year: year + 1, month: 1 };
    }
    return { year, month: month + 1 };
};

/**
 * Validate period params
 * @param {number} year - Year
 * @param {number} month - Month
 * @returns {boolean} Is valid
 */
export const isValidPeriod = (year, month) => {
    return year >= 2020 && 
           year <= new Date().getFullYear() + 1 && 
           month >= 1 && 
           month <= 12;
};

export default dashboardApi;