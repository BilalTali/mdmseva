import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/Components/ui/card';
import { AlertCircle, BarChart3 } from 'lucide-react';

const ChartCard = ({
    title,
    subtitle,
    children,
    loading = false,
    error = null,
    isEmpty = false,
    emptyMessage = "No data available",
    height = "h-64",
    headerActions = null,
    icon: Icon = BarChart3,
    className = ''
}) => {
    // Loading state
    if (loading) {
        return (
            <Card className={`shadow-sm min-w-0 bg-[var(--surface-00)] border-[var(--border-light)] ${className}`}>
                <CardHeader className="border-b border-[var(--border-light)]">
                    <div className="flex items-center justify-between animate-pulse">
                        <div className="flex items-center gap-2">
                            <div className="w-5 h-5 rounded bg-[var(--surface-10)]"></div>
                            <div className="h-5 rounded w-32 bg-[var(--surface-10)]"></div>
                        </div>
                        <div className="h-5 rounded w-20 bg-[var(--surface-10)]"></div>
                    </div>
                </CardHeader>
                <CardContent className="p-6">
                    <div className={`${height} flex items-center justify-center rounded-lg animate-pulse bg-[var(--bg-secondary)]`}>
                        <div className="w-full h-full rounded bg-[var(--surface-10)]"></div>
                    </div>
                </CardContent>
            </Card>
        );
    }

    // Error state
    if (error) {
        return (
            <Card className={`shadow-sm min-w-0 bg-[var(--surface-00)] border-[var(--border-light)] ${className}`}>
                <CardHeader className="border-b border-[var(--border-light)]">
                    <div className="flex items-center gap-2">
                        <Icon className="w-5 h-5 text-[var(--color-danger)]" />
                        <CardTitle className="text-lg font-semibold text-[var(--text-primary)]">
                            {title}
                        </CardTitle>
                    </div>
                    {subtitle && (
                        <p className="text-sm mt-1 text-[var(--text-secondary)]">
                            {subtitle}
                        </p>
                    )}
                </CardHeader>
                <CardContent className="p-6">
                    <div className={`${height} flex items-center justify-center`}>
                        <div className="text-center">
                            <AlertCircle className="w-12 h-12 mx-auto mb-4 text-[var(--color-danger)]" />
                            <p className="font-medium mb-2 text-[var(--color-danger)]">
                                Unable to load chart
                            </p>
                            <p className="text-sm text-[var(--text-secondary)]">
                                {error}
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        );
    }

    // Empty state
    if (isEmpty) {
        return (
            <Card className={`shadow-sm min-w-0 bg-[var(--surface-00)] border-[var(--border-light)] ${className}`}>
                <CardHeader className="border-b border-[var(--border-light)]">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Icon className="w-5 h-5 text-[var(--text-tertiary)]" />
                            <CardTitle className="text-lg font-semibold text-[var(--text-primary)]">
                                {title}
                            </CardTitle>
                        </div>
                        {headerActions && (
                            <div>{headerActions}</div>
                        )}
                    </div>
                    {subtitle && (
                        <p className="text-sm mt-1 text-[var(--text-secondary)]">
                            {subtitle}
                        </p>
                    )}
                </CardHeader>
                <CardContent className="p-6">
                    <div className={`${height} flex items-center justify-center rounded-lg border-2 border-dashed bg-[var(--bg-secondary)] border-[var(--border-light)]`}>
                        <div className="text-center">
                            <Icon className="w-12 h-12 mx-auto mb-4 text-[var(--text-tertiary)]" />
                            <p className="font-medium mb-2 text-[var(--text-secondary)]">
                                {emptyMessage}
                            </p>
                            <p className="text-sm text-[var(--text-tertiary)]">
                                Try selecting a different period or adding data
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        );
    }

    // Normal state with chart
    return (
        <Card className={`shadow-sm hover:shadow-md transition-shadow duration-200 min-w-0 bg-[var(--surface-00)] border-[var(--border-light)] ${className}`}>
            <CardHeader className="border-b border-[var(--border-light)]">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Icon className="w-5 h-5 text-[var(--primary-600)]" />
                        <CardTitle className="text-lg font-semibold text-[var(--text-primary)]">
                            {title}
                        </CardTitle>
                    </div>
                    {headerActions && (
                        <div>{headerActions}</div>
                    )}
                </div>
                {subtitle && (
                    <p className="text-sm mt-1 text-[var(--text-secondary)]">
                        {subtitle}
                    </p>
                )}
            </CardHeader>
            <CardContent className="p-6">
                <div className={`${height} w-full`} style={{ minHeight: '320px', minWidth: '100%' }}>
                    {children}
                </div>
            </CardContent>
        </Card>
    );
};

export default ChartCard;