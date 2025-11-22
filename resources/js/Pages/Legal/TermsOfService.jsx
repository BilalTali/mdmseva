import React from 'react';
import { Head } from '@inertiajs/react';

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Head title="Terms of Service" />
      <div className="max-w-4xl mx-auto px-6 py-12">
        <header className="mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">Terms of Service</h1>
          <p className="text-sm text-gray-500">Last updated: {new Date().getFullYear()}</p>
        </header>

        <div className="space-y-8 bg-white rounded-2xl shadow-sm border border-gray-200 p-6 md:p-8">
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">1. Purpose of the Service</h2>
            <p className="text-sm text-gray-700 leading-relaxed">
              The MDM SEVA portal is provided to schools and education departments to manage Mid-Day Meal operations,
              including stock, consumption, and reporting. By accessing or using the portal, you agree to these Terms
              of Service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">2. Authorized Users</h2>
            <ul className="list-disc pl-5 space-y-1 text-sm text-gray-700">
              <li>The portal may be used only by registered schools and authorized department officials.</li>
              <li>You are responsible for all activity performed under your account and login credentials.</li>
              <li>You must not share passwords or misuse any access granted to you.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">3. Acceptable Use</h2>
            <ul className="list-disc pl-5 space-y-1 text-sm text-gray-700">
              <li>Use the system only for genuine MDM data and official school records.</li>
              <li>Do not attempt to bypass security, access other schools' data, or interfere with system operation.</li>
              <li>Do not upload malicious code or content that is unlawful, abusive, or misleading.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">4. Availability & Changes</h2>
            <p className="text-sm text-gray-700 leading-relaxed">
              We strive to maintain high availability, but the service may be temporarily unavailable due to maintenance
              windows, infrastructure upgrades, or circumstances beyond our control. Features may change or improve
              over time, and we may update these Terms as required by policy or law.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">5. Data Ownership</h2>
            <p className="text-sm text-gray-700 leading-relaxed">
              The operational and student-related data entered into the portal remains the property of the respective
              education department / school, subject to applicable government rules. We act as a technical service
              provider for processing and storing this data on their behalf.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">6. Limitation of Liability</h2>
            <p className="text-sm text-gray-700 leading-relaxed">
              While reasonable care is taken to keep the system secure and accurate, the service is provided on an
              "as-is" basis. To the maximum extent permitted by law, we are not liable for any indirect, incidental,
              or consequential loss arising from use of, or inability to use, the portal.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">7. Termination of Access</h2>
            <p className="text-sm text-gray-700 leading-relaxed">
              Access may be suspended or revoked where accounts are inactive, misused, or when directed by the
              competent authority. Schools should ensure that all required reports are downloaded and archived
              according to departmental guidelines.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">8. Contact</h2>
            <p className="text-sm text-gray-700 leading-relaxed">
              For questions regarding these Terms of Service, please reach out to
              <span className="font-semibold"> support@mdmseva.com</span>.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
