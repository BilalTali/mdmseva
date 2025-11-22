import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

export default function AdminLayout({ children, ...props }) {
    return (
        <AuthenticatedLayout {...props}>
            {children}
        </AuthenticatedLayout>
    );
}
