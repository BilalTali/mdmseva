import React from 'react';
import { Head } from '@inertiajs/react';

export default function CookiePolicy() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Head title="Cookie Policy" />
      <div className="max-w-4xl mx-auto px-6 py-12">
        <header className="mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">Cookie Policy</h1>
          <p className="text-sm text-gray-500">Last updated: {new Date().getFullYear()}</p>
        </header>

        <div className="space-y-8 bg-white rounded-2xl shadow-sm border border-gray-200 p-6 md:p-8">
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">1. What Are Cookies?</h2>
            <p className="text-sm text-gray-700 leading-relaxed">
              Cookies are small text files stored on your device when you access the MDM SEVA portal. They help the
              system remember your session and preferences so that you can navigate securely between pages.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">2. Cookies We Use</h2>
            <ul className="list-disc pl-5 space-y-1 text-sm text-gray-700">
              <li>
                <span className="font-semibold">Session cookies</span> to maintain your login session and protect
                against unauthorized access.
              </li>
              <li>
                <span className="font-semibold">Security cookies</span> to help detect suspicious activity and
                maintain system integrity.
              </li>
              <li>
                <span className="font-semibold">Preference cookies</span> (where enabled) to remember basic interface
                settings.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">3. Analytics</h2>
            <p className="text-sm text-gray-700 leading-relaxed">
              The platform may use basic usage metrics (for example, page visit counts or performance measurements)
              to understand how the system is being used and to improve reliability. Any such analytics are focused on
              system performance and not on profiling individual users.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">4. Managing Cookies</h2>
            <p className="text-sm text-gray-700 leading-relaxed mb-2">
              Most browsers allow you to control cookies through their settings. However, disabling essential cookies
              may prevent you from logging in or using certain features of the MDM SEVA portal.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">5. Updates to This Policy</h2>
            <p className="text-sm text-gray-700 leading-relaxed">
              We may update this Cookie Policy from time to time to reflect changes in how the portal uses cookies or
              in line with regulatory requirements. Material changes will be communicated through the portal or via the
              concerned department.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">6. Contact</h2>
            <p className="text-sm text-gray-700 leading-relaxed">
              If you have questions about this Cookie Policy, please write to
              <span className="font-semibold"> support@mdmseva.com</span>.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
