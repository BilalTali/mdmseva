
import React, { useState, useEffect } from 'react';
import {
    Activity,
    Plus,
    Edit,
    Trash2,
    RefreshCw,
    Clock,
    Package,
    Users,
    TrendingUp,
    AlertCircle
} from 'lucide-react';

/**
 * ActivityFeed Component
 * 
 * Displays a chronological feed of recent activities/events in the system
 * 
 * @param {number} userId - Current user ID
 * @param {number} limit - Number of activities to show (default: 5)
 * @param {boolean} autoRefresh - Auto refresh every X seconds (default: false)
 * @param {number} refreshInterval - Refresh interval in seconds (default: 30)
 */
const ActivityFeed = ({
    userId,
    limit = 5,
    autoRefresh = false,
    refreshInterval = 30
}) => {
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [refreshing, setRefreshing] = useState(false);

    // Fetch activities
    const fetchActivities = async (isRefresh = false) => {
        try {
            setLoading(!isRefresh);
            setRefreshing(isRefresh);

            const response = await fetch(
                `/ api / dashboard / activity ? limit = ${limit} `,
                {
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json',
                    },
                    credentials: 'include'
                }
            );

            if (!response.ok) {
                throw new Error('Failed to fetch activities');
            }

            const data = await response.json();
            setActivities(data || []);
            setError(null);
        } catch (err) {
            console.error('Error fetching activities:', err);
            setError(err.message);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    // Load data on mount
    useEffect(() => {
        fetchActivities(false);
    }, [userId, limit]);

    // Auto-refresh setup
    useEffect(() => {
        if (!autoRefresh) return;

        const intervalId = setInterval(() => {
            fetchActivities(true);
        }, refreshInterval * 1000);

        return () => clearInterval(intervalId);
    }, [autoRefresh, refreshInterval]);

    // Handle manual refresh
    const handleRefresh = () => {
        fetchActivities(true);
    };

    // Get icon for activity type
    const getActivityIcon = (type) => {
        switch (type) {
            case 'consumption_added':
                return <Plus className="h-4 w-4" />;
            case 'consumption_edited':
                return <Edit className="h-4 w-4" />;
            case 'consumption_deleted':
                return <Trash2 className="h-4 w-4" />;
            case 'rice_lifted':
                return <Package className="h-4 w-4" />;
            case 'students_updated':
                return <Users className="h-4 w-4" />;
            case 'threshold_alert':
                return <AlertCircle className="h-4 w-4" />;
            default:
                return <Activity className="h-4 w-4" />;
        }
    };

    // Get color for activity type
    const getActivityColor = (type) => {
        switch (type) {
            case 'consumption_added':
                return 'bg-green-100 text-green-600 dark:bg-green-900/30 ';
            case 'consumption_edited':
                return 'bg-blue-100 text-blue-600  ';
            case 'consumption_deleted':
                return 'bg-red-100 text-red-600 dark:bg-red-900/30 ';
            case 'rice_lifted':
                return 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 ';
            case 'students_updated':
                return 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400';
            case 'threshold_alert':
                return 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400';
            default:
                return 'bg-gray-100 text-gray-600 dark:bg-gray-700 ';
        }
    };

    // Format timestamp
    const formatTimestamp = (timestamp) => {
        const date = new Date(timestamp);
        const now = new Date();
        const diffInSeconds = Math.floor((now - date) / 1000);

        if (diffInSeconds < 60) {
            return 'Just now';
        } else if (diffInSeconds < 3600) {
            const minutes = Math.floor(diffInSeconds / 60);
            return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'} ago`;
        } else if (diffInSeconds < 86400) {
            const hours = Math.floor(diffInSeconds / 3600);
            return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
        } else if (diffInSeconds < 604800) {
            const days = Math.floor(diffInSeconds / 86400);
            return `${days} ${days === 1 ? 'day' : 'days'} ago`;
        } else {
            return date.toLocaleDateString('en-IN', {
                day: '2-digit',
                month: 'short',
                year: 'numeric'
            });
        }
    };

    // Loading state
    if (loading) {
        return (
            <div className="bg-[var(--surface-00)] rounded-lg shadow p-6 transition-colors duration-200">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-[var(--text-primary)]">Activity Feed</h3>
                </div>
                <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="flex gap-3 animate-pulse">
                            <div className="h-8 w-8 bg-[var(--surface-10)] rounded-full flex-shrink-0"></div>
                            <div className="flex-1">
                                <div className="h-4 bg-[var(--surface-10)] rounded w-3/4 mb-2"></div>
                                <div className="h-3 bg-[var(--surface-10)] rounded w-1/2"></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="bg-[var(--surface-00)] rounded-lg shadow p-6 transition-colors duration-200">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-[var(--text-primary)]">Activity Feed</h3>
                </div>
                <div className="text-center py-8">
                    <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                    <p className="text-[var(--text-secondary)] mb-4">{error}</p>
                    <button
                        onClick={handleRefresh}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    // Empty state
    if (!activities || activities.length === 0) {
        return (
            <div className="bg-[var(--surface-00)] rounded-lg shadow p-6 transition-colors duration-200">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-[var(--text-primary)]">Activity Feed</h3>
                    <button
                        onClick={handleRefresh}
                        disabled={refreshing}
                        className="p-2 hover:bg-[var(--surface-10)] rounded-md transition-colors"
                        title="Refresh"
                    >
                        <RefreshCw className={`h - 4 w - 4 text - gray - 600 dark: text - gray - 400 ${refreshing ? 'animate-spin' : ''} `} />
                    </button>
                </div>
                <div className="text-center py-12">
                    <Activity className="h-12 w-12 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
                    <p className="text-[var(--text-tertiary)] font-medium mb-2">No recent activity</p>
                    <p className="text-sm text-[var(--text-muted)]">Activities will appear here as you use the system</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-[var(--surface-00)] rounded-lg shadow p-6 transition-colors duration-200">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <h3 className="text-lg font-semibold text-[var(--text-primary)]">Activity Feed</h3>
                    {autoRefresh && (
                        <span className="text-xs text-[var(--text-tertiary)] bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                            Auto-refresh
                        </span>
                    )}
                </div>
                <button
                    onClick={handleRefresh}
                    disabled={refreshing}
                    className="p-2 hover:bg-[var(--surface-10)] rounded-md transition-colors"
                    title="Refresh"
                >
                    <RefreshCw className={`h - 4 w - 4 text - gray - 600 dark: text - gray - 400 ${refreshing ? 'animate-spin' : ''} `} />
                </button>
            </div>

            {/* Activity list */}
            <div className="space-y-4">
                {activities.map((activity, index) => (
                    <div
                        key={index}
                        className="flex gap-3 group hover:bg-[var(--surface-10)]/50 -mx-3 px-3 py-2 rounded-lg transition-colors"
                    >
                        {/* Icon */}
                        <div className={`
                            flex items - center justify - center h - 8 w - 8 rounded - full flex - shrink - 0
                            ${getActivityColor(activity.type)}
`}>
                            {getActivityIcon(activity.type)}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                            <p className="text-sm text-gray-900 dark:text-gray-200 font-medium">
                                {activity.description}
                            </p>

                            {/* Activity data/details */}
                            {activity.data && (
                                <div className="mt-1 flex flex-wrap gap-3 text-xs text-[var(--text-tertiary)]">
                                    {activity.data.rice_consumed && (
                                        <span className="flex items-center gap-1">
                                            <Package className="h-3 w-3" />
                                            {activity.data.rice_consumed} kg rice
                                        </span>
                                    )}
                                    {activity.data.students_served && (
                                        <span className="flex items-center gap-1">
                                            <Users className="h-3 w-3" />
                                            {activity.data.students_served} students
                                        </span>
                                    )}
                                    {activity.data.served_primary > 0 && (
                                        <span className="text-[var(--text-muted)]">
                                            (P: {activity.data.served_primary}, M: {activity.data.served_middle || 0})
                                        </span>
                                    )}
                                </div>
                            )}

                            {/* Timestamp */}
                            <div className="mt-1 flex items-center gap-1 text-xs text-[var(--text-muted)]">
                                <Clock className="h-3 w-3" />
                                <span>{formatTimestamp(activity.timestamp)}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* View all link */}
            {activities.length >= limit && (
                <div className="mt-4 pt-4 border-t border-[var(--border-light)]">
                    <button className="text-sm text-[var(--color-info)] hover:text-blue-700 dark:hover:text-blue-300 font-medium w-full text-center">
                        View all activities →
                    </button>
                </div>
            )}
        </div>
    );
};

export default ActivityFeed;
