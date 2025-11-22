import React from 'react';
import { Card, CardContent } from '@/Components/ui/card';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

const StatCard = ({
    title,
    value,
    subtitle,
    icon: Icon,
    loading = false,
    variant = 'primary',
    trend,
    badgeText = null,
    className = ''
}) => {
    // Variant colors - using CSS variables directly
    const variantStyles = {
        primary: {
            bg: 'bg-gradient-to-br from-[var(--primary-50)] to-[var(--primary-100)]',
            iconBg: 'bg-white/60',
            iconColor: 'text-[var(--primary-600)]',
            titleColor: 'text-[var(--primary-700)]',
            valueColor: 'text-[var(--primary-900)]',
            subtitleColor: 'text-[var(--primary-600)]',
        },
        success: {
            bg: 'bg-gradient-to-br from-[var(--success-50)] to-[var(--success-100)]',
            iconBg: 'bg-white/60',
            iconColor: 'text-[var(--color-success)]',
            titleColor: 'text-[var(--color-success)]',
            valueColor: 'text-[var(--color-success)]',
            subtitleColor: 'text-[var(--color-success)]',
        },
        warning: {
            bg: 'bg-gradient-to-br from-[var(--warning-50)] to-[var(--warning-100)]',
            iconBg: 'bg-white/60',
            iconColor: 'text-[var(--color-warning)]',
            titleColor: 'text-[var(--color-warning)]',
            valueColor: 'text-[var(--color-warning)]',
            subtitleColor: 'text-[var(--color-warning)]',
        },
        error: {
            bg: 'bg-gradient-to-br from-[var(--error-50)] to-[var(--error-100)]',
            iconBg: 'bg-white/60',
            iconColor: 'text-[var(--color-danger)]',
            titleColor: 'text-[var(--color-danger)]',
            valueColor: 'text-[var(--color-danger)]',
            subtitleColor: 'text-[var(--color-danger)]',
        },
        info: {
            bg: 'bg-gradient-to-br from-[var(--info-50)] to-[var(--info-100)]',
            iconBg: 'bg-white/60',
            iconColor: 'text-[var(--color-info)]',
            titleColor: 'text-[var(--color-info)]',
            valueColor: 'text-[var(--color-info)]',
            subtitleColor: 'text-[var(--color-info)]',
        },
    };

    const styles = variantStyles[variant] || variantStyles.primary;

    // Loading state
    if (loading) {
        return (
            <Card className={`border-0 shadow-lg ${styles.bg} ${className}`}>
                <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                        <div className="flex-1 animate-pulse">
                            <div className="h-4 bg-white/40 rounded w-24 mb-3"></div>
                            <div className="h-8 bg-white/40 rounded w-32 mb-2"></div>
                            <div className="h-3 bg-white/40 rounded w-20"></div>
                        </div>
                        <div className={`p-3 ${styles.iconBg} rounded-xl shadow-sm animate-pulse`}>
                            <div className="w-6 h-6 bg-white/40 rounded"></div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className={`border-0 shadow-lg hover:shadow-xl transition-shadow ${styles.bg} ${className}`}>
            <CardContent className="p-6">
                <div className="flex items-start justify-between">
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                            <p className={`text-sm font-medium ${styles.titleColor}`}>
                                {title}
                            </p>
                            {badgeText && (
                                <span className="text-xs font-medium bg-white/60 text-[var(--text-secondary)] px-2 py-0.5 rounded">
                                    {badgeText}
                                </span>
                            )}
                        </div>

                        <p className={`text-3xl font-bold ${styles.valueColor} mb-2`}>
                            {value}
                        </p>

                        {subtitle && (
                            <div className="flex items-center gap-2">
                                <p className={`text-xs font-medium ${styles.subtitleColor}`}>
                                    {subtitle}
                                </p>
                                {trend && (
                                    <div className={`flex items-center gap-1 text-xs font-medium ${trend.direction === 'up'
                                        ? trend.value >= 0 ? 'text-[var(--color-success)]' : 'text-[var(--color-danger)]'
                                        : trend.value >= 0 ? 'text-[var(--color-danger)]' : 'text-[var(--color-success)]'
                                        }`}>
                                        {trend.direction === 'up' ? (
                                            <ArrowUpRight className="w-3 h-3" />
                                        ) : (
                                            <ArrowDownRight className="w-3 h-3" />
                                        )}
                                        <span>{Math.abs(trend.value)}%</span>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {Icon && (
                        <div className={`p-3 ${styles.iconBg} rounded-xl shadow-sm`}>
                            <Icon className={`w-6 h-6 ${styles.iconColor}`} />
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
};

export default StatCard;
