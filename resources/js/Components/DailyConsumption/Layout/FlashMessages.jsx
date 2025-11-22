// File: resources/js/Components/DailyConsumption/Layout/FlashMessages.jsx

import React, { useEffect, useState } from 'react';
import { usePage } from '@inertiajs/react';
import { CheckCircle, XCircle, Info, AlertTriangle, X } from 'lucide-react';

/**
 * FlashMessages Component
 * 
 * Displays flash messages from Laravel session
 * Supports success, error, info, and warning types
 */
export default function FlashMessages() {
    const { flash } = usePage().props;
    const [visible, setVisible] = useState(true);
    const [message, setMessage] = useState(null);

    useEffect(() => {
        // Check for flash messages
        if (flash?.success) {
            setMessage({ type: 'success', text: flash.success });
            setVisible(true);
        } else if (flash?.error) {
            setMessage({ type: 'error', text: flash.error });
            setVisible(true);
        } else if (flash?.info) {
            setMessage({ type: 'info', text: flash.info });
            setVisible(true);
        } else if (flash?.warning) {
            setMessage({ type: 'warning', text: flash.warning });
            setVisible(true);
        } else {
            setMessage(null);
        }

        // Auto-hide after 5 seconds
        if (flash?.success || flash?.info) {
            const timer = setTimeout(() => {
                setVisible(false);
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [flash]);

    if (!message || !visible) return null;

    const config = {
        success: {
            icon: CheckCircle,
            bgColor: 'bg-green-50',
            borderColor: 'border-green-200',
            iconColor: 'text-green-600',
            textColor: 'text-green-800',
            titleColor: 'text-green-900'
        },
        error: {
            icon: XCircle,
            bgColor: 'bg-red-50',
            borderColor: 'border-red-200',
            iconColor: 'text-red-600',
            textColor: 'text-red-800',
            titleColor: 'text-red-900'
        },
        info: {
            icon: Info,
            bgColor: 'bg-blue-50',
            borderColor: 'border-blue-200',
            iconColor: 'text-blue-600',
            textColor: 'text-blue-800',
            titleColor: 'text-blue-900'
        },
        warning: {
            icon: AlertTriangle,
            bgColor: 'bg-yellow-50',
            borderColor: 'border-yellow-200',
            iconColor: 'text-yellow-600',
            textColor: 'text-yellow-800',
            titleColor: 'text-yellow-900'
        }
    };

    const { icon: Icon, bgColor, borderColor, iconColor, textColor, titleColor } = config[message.type];

    const titles = {
        success: 'Success',
        error: 'Error',
        info: 'Information',
        warning: 'Warning'
    };

    return (
        <div className="mb-6 animate-in slide-in-from-top duration-300">
            <div className={`${bgColor} ${borderColor} border-l-4 rounded-lg p-4 shadow-sm`}>
                <div className="flex items-start">
                    <div className="flex-shrink-0">
                        <Icon className={`w-5 h-5 ${iconColor}`} />
                    </div>
                    <div className="ml-3 flex-1">
                        <h3 className={`text-sm font-medium ${titleColor}`}>
                            {titles[message.type]}
                        </h3>
                        <div className={`mt-1 text-sm ${textColor}`}>
                            {message.text}
                        </div>
                    </div>
                    <div className="ml-auto pl-3">
                        <button
                            onClick={() => setVisible(false)}
                            className={`inline-flex rounded-md ${bgColor} ${textColor} hover:bg-opacity-75 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-${message.type}-50 focus:ring-${message.type}-600`}
                        >
                            <span className="sr-only">Dismiss</span>
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}