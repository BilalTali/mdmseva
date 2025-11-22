import React from 'react';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head } from '@inertiajs/react';

export default function About() {
  return (
    <GuestLayout>
      <Head title="About MDM SEVA" />
      <div className="space-y-4">
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2">About MDM SEVA Portal</h1>
        <p className="text-sm text-slate-700 leading-relaxed">
          MDM SEVA is a school-focused portal designed to support Mid-Day Meal (MDM) operations, including
          stock management, daily consumption, reporting, and monitoring across schools.
        </p>
        <p className="text-sm text-slate-700 leading-relaxed">
          The system aims to reduce paperwork, improve data accuracy, and provide timely insights to education
          department officials while keeping the experience simple for school users.
        </p>
      </div>
    </GuestLayout>
  );
}
