import React from 'react';
import { Head } from '@inertiajs/react';

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Head title="Privacy Policy" />
      <div className="max-w-4xl mx-auto px-6 py-12">
        <header className="mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">Privacy Policy</h1>
          <p className="text-sm text-gray-500">Last updated: {new Date().getFullYear()}</p>
        </header>

        <div className="space-y-8 bg-white rounded-2xl shadow-sm border border-gray-200 p-6 md:p-8">
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">1. Introduction</h2>
            <p className="text-sm text-gray-700 leading-relaxed">
              This Privacy Policy explains how the MDM SEVA portal ("we", "our", "us") collects, uses, and protects
              information in connection with the Mid-Day Meal (MDM) management services we provide to schools and
              education departments.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">2. Data We Collect</h2>
            <ul className="list-disc pl-5 space-y-1 text-sm text-gray-700">
              <li>School profile data (school name, district/zone, contact information).</li>
              <li>User account data (name, email address, mobile number, role).</li>
              <li>Operational data related to MDM (roll statements, daily consumption, rice and amount reports, vendor bills).</li>
              <li>Technical data such as IP address, browser type, and usage logs for security and audit purposes.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">3. How We Use Data</h2>
            <p className="text-sm text-gray-700 leading-relaxed mb-2">
              We process data strictly to support Mid-Day Meal operations and statutory compliance:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-sm text-gray-700">
              <li>To provide core features such as stock management, daily consumption recording, and report generation.</li>
              <li>To maintain audit trails and historical accuracy for government inspections.</li>
              <li>To monitor system usage, detect misuse, and improve performance and reliability.</li>
              <li>To provide user support and communicate important updates about the system.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">4. Data Sharing</h2>
            <p className="text-sm text-gray-700 leading-relaxed mb-2">
              We do not sell personal data. Data may be shared only in the following situations:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-sm text-gray-700">
              <li>With authorized education department officials for monitoring and reporting.</li>
              <li>With service providers who support hosting, backup, or security—bound by confidentiality obligations.</li>
              <li>Where required by law, court order, or competent government authority.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">5. Data Security & Retention</h2>
            <ul className="list-disc pl-5 space-y-1 text-sm text-gray-700">
              <li>Access is restricted through authenticated accounts and role-based permissions.</li>
              <li>Operational data is retained for as long as required by applicable education department guidelines and audit rules.</li>
              <li>Backups are maintained to ensure continuity in case of technical failures.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">6. Your Responsibilities</h2>
            <p className="text-sm text-gray-700 leading-relaxed">
              School administrators are responsible for maintaining correct user details, keeping login credentials
              confidential, and ensuring that information entered into the system is accurate and lawful.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">7. Contact</h2>
            <p className="text-sm text-gray-700 leading-relaxed">
              For any questions or requests related to this Privacy Policy, please contact us at
              <span className="font-semibold"> support@mdmseva.com</span>.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
