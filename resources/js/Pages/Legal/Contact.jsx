import React from 'react';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head } from '@inertiajs/react';

export default function Contact() {
  return (
    <GuestLayout>
      <Head title="Contact" />
      <div className="space-y-4">
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2">Contact</h1>
        <p className="text-sm text-slate-700 leading-relaxed">
          For support or feedback regarding the MDM SEVA portal, please reach out using the details below.
        </p>
        <ul className="text-sm text-slate-700 space-y-1">
          <li><span className="font-semibold">Email:</span> support@mdmseva.com</li>
        </ul>
      </div>
    </GuestLayout>
  );
}
