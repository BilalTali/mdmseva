// File: resources/js/Components/DailyConsumption/Stats/RiceStockStats.jsx
// Statistics dashboard for rice stock overview
import React from 'react';
import StockDisplayCard from '../Cards/StockDisplayCard';
import {
    Scale,
    TrendingUp,
    TrendingDown,
    Package,
    Utensils,
    AlertTriangle,
    Calendar,
    CheckCircle,
} from 'lucide-react';

/**
 * Rice Stock Statistics Component
 * 
 * Displays key metrics and statistics for rice stock management
 * in a responsive grid layout
 * 
 * @param {Object} stats - Statistics object containing:
 *   - currentStock: Current available stock
 *   - openingBalance: Opening balance for period
 *   - closingBalance: Closing balance for period
 *   - totalReceived: Total rice received
 *   - totalConsumed: Total rice consumed
 *   - avgDailyConsumption: Average daily consumption
 *   - daysRemaining: Estimated days of stock remaining
 *   - totalEntries: Total number of entries
 * @param {string} className - Additional CSS classes
 * 
 * @example
 * <RiceStockStats
 *     stats={{
 *         currentStock: 500,
 *         openingBalance: 400,
 *         closingBalance: 300,
 *         totalReceived: 200,
 *         totalConsumed: 300,
 *         avgDailyConsumption: 15,
 *         daysRemaining: 20,
 *         totalEntries: 30,
 *     }}
 * />
 */
export default function RiceStockStats({
    stats = {},
    className = '',
}) {
    // Destructure stats with defaults
    const {
        currentStock = 0,
        openingBalance = 0,
        closingBalance = 0,
        totalReceived = 0,
        totalConsumed = 0,
        avgDailyConsumption = 0,
        daysRemaining = 0,
        totalEntries = 0,
    } = stats;

    // Determine if stock is low (less than 7 days remaining)
    const isLowStock = daysRemaining < 7 && daysRemaining > 0;
    const isCriticalStock = daysRemaining < 3 && daysRemaining > 0;

    return (
        <div className={className}>
            {/* Main Stock Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <StockDisplayCard
                    icon={Scale}
                    label="Current Stock"
                    value={currentStock}
                    unit="kg"
                    variant="blue"
                />

                <StockDisplayCard
                    icon={TrendingUp}
                    label="Opening Balance"
                    value={openingBalance}
                    unit="kg"
                    variant="green"
                />

                <StockDisplayCard
                    icon={TrendingDown}
                    label="Closing Balance"
                    value={closingBalance}
                    unit="kg"
                    variant="red"
                />

                <StockDisplayCard
                    icon={Calendar}
                    label="Days Remaining"
                    value={daysRemaining}
                    unit={daysRemaining === 1 ? 'day' : 'days'}
                    variant={isCriticalStock ? 'red' : isLowStock ? 'red' : 'green'}
                />
            </div>

            {/* Secondary Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StockDisplayCard
                    icon={Package}
                    label="Total Received"
                    value={totalReceived}
                    unit="kg"
                    variant="green"
                />

                <StockDisplayCard
                    icon={Utensils}
                    label="Total Consumed"
                    value={totalConsumed}
                    unit="kg"
                    variant="red"
                />

                <StockDisplayCard
                    icon={TrendingDown}
                    label="Avg. Daily Consumption"
                    value={avgDailyConsumption}
                    unit="kg/day"
                    variant="blue"
                />

                <StockDisplayCard
                    icon={CheckCircle}
                    label="Total Entries"
                    value={totalEntries}
                    unit={totalEntries === 1 ? 'entry' : 'entries'}
                    variant="blue"
                />
            </div>

            {/* Warning Messages */}
            {isCriticalStock && (
                <div className="mt-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-r">
                    <div className="flex items-start">
                        <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 mr-3" />
                        <div>
                            <h3 className="text-sm font-semibold text-red-800">
                                Critical Stock Level
                            </h3>
                            <p className="text-sm text-red-700 mt-1">
                                Only {daysRemaining} {daysRemaining === 1 ? 'day' : 'days'} of rice stock remaining. 
                                Please arrange for immediate replenishment.
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {isLowStock && !isCriticalStock && (
                <div className="mt-6 p-4 bg-yellow-50 border-l-4 border-yellow-500 rounded-r">
                    <div className="flex items-start">
                        <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5 mr-3" />
                        <div>
                            <h3 className="text-sm font-semibold text-yellow-800">
                                Low Stock Warning
                            </h3>
                            <p className="text-sm text-yellow-700 mt-1">
                                Rice stock is running low. Approximately {daysRemaining} days remaining. 
                                Consider ordering more stock soon.
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}