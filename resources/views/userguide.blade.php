<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>MDM SEVA Portal - User Guide</title>
    <style>
        :root {
            --bg: #f5f7fb;
            --card-bg: #ffffff;
            --primary: #2563eb;
            --primary-soft: #dbeafe;
            --accent: #10b981;
            --text-main: #111827;
            --text-muted: #6b7280;
            --border-subtle: #e5e7eb;
        }

        * {
            box-sizing: border-box;
        }

        body {
            margin: 0;
            padding: 24px;
            font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            background: #e5e7eb;
            color: var(--text-main);
        }

        .layout {
            max-width: 210mm;
            margin: 0 auto;
        }

        .guide-card {
            background: var(--card-bg);
            border-radius: 12px;
            box-shadow: 0 12px 30px rgba(15, 23, 42, 0.18);
            border: 1px solid rgba(148, 163, 184, 0.35);
            padding: 24px 26px 26px;
            min-height: 297mm;
        }

        .guide-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            gap: 16px;
            margin-bottom: 24px;
        }

        .guide-title-block h1 {
            margin: 0 0 8px;
            font-size: 26px;
            letter-spacing: 0.02em;
        }

        .guide-title-block p {
            margin: 0;
            color: var(--text-muted);
            font-size: 13px;
        }

        .guide-badge {
            padding: 6px 10px;
            border-radius: 999px;
            font-size: 11px;
            font-weight: 600;
            color: var(--primary);
            background: linear-gradient(90deg, rgba(37,99,235,0.08), rgba(16,185,129,0.08));
            border: 1px solid rgba(59,130,246,0.3);
        }

        .meta-row {
            display: flex;
            flex-wrap: wrap;
            gap: 10px;
            margin-bottom: 22px;
            font-size: 11px;
            color: var(--text-muted);
        }

        .meta-chip {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            padding: 5px 10px;
            border-radius: 999px;
            background: #f3f4ff;
            border: 1px solid #e5e7eb;
        }

        .meta-dot {
            width: 6px;
            height: 6px;
            border-radius: 999px;
            background: var(--primary);
        }

        .two-column {
            display: grid;
            grid-template-columns: minmax(0, 2.1fr) minmax(0, 1fr);
            gap: 24px;
        }

        @media (max-width: 900px) {
            .guide-card {
                padding: 20px 18px 22px;
            }
            .two-column {
                grid-template-columns: minmax(0, 1fr);
            }
        }

        .toc-card,
        .section-card {
            background: #f9fafb;
            border-radius: 12px;
            border: 1px solid var(--border-subtle);
            padding: 14px 16px;
        }

        .toc-card h2 {
            margin: 0 0 10px;
            font-size: 13px;
            text-transform: uppercase;
            letter-spacing: 0.08em;
            color: var(--text-muted);
        }

        .toc-list {
            list-style: none;
            padding: 0;
            margin: 0;
            font-size: 13px;
        }

        .toc-list li {
            margin-bottom: 6px;
        }

        .toc-anchor {
            text-decoration: none;
            color: var(--text-main);
        }

        .toc-anchor span {
            color: var(--text-muted);
            margin-right: 4px;
        }

        .toc-anchor:hover {
            color: var(--primary);
        }

        .section-card + .section-card {
            margin-top: 12px;
        }

        .section-title-row {
            display: flex;
            align-items: center;
            gap: 8px;
            margin-bottom: 6px;
        }

        .section-title-row h2 {
            margin: 0;
            font-size: 16px;
        }

        .section-tag {
            padding: 2px 8px;
            border-radius: 999px;
            font-size: 10px;
            text-transform: uppercase;
            letter-spacing: 0.08em;
            background: #eff6ff;
            color: #1d4ed8;
        }

        .section-body p {
            margin: 6px 0 8px;
            font-size: 13px;
            color: var(--text-muted);
        }

        .steps {
            margin: 4px 0 6px;
            padding-left: 18px;
            font-size: 13px;
        }

        .steps li {
            margin: 3px 0;
        }

        .pill-list {
            display: flex;
            flex-wrap: wrap;
            gap: 6px;
            margin-top: 6px;
        }

        .pill {
            padding: 4px 8px;
            border-radius: 999px;
            font-size: 11px;
            border: 1px solid var(--border-subtle);
            background: #ffffff;
            color: var(--text-muted);
        }

        .highlight-box {
            margin-top: 6px;
            padding: 8px 10px;
            border-radius: 10px;
            border: 1px dashed rgba(37, 99, 235, 0.4);
            background: #eff6ff;
            font-size: 12px;
            color: #1d4ed8;
        }

        .callout {
            margin-top: 8px;
            padding: 8px 10px;
            border-radius: 10px;
            background: #ecfdf5;
            border: 1px solid #bbf7d0;
            font-size: 12px;
            color: #166534;
        }

        .subsection-title {
            margin: 10px 0 4px;
            font-size: 13px;
            font-weight: 600;
        }

        .muted {
            color: var(--text-muted);
        }

        .footer-note {
            margin-top: 18px;
            font-size: 11px;
            color: var(--text-muted);
            text-align: right;
        }
    </style>
</head>
<body>
<div class="layout">
    <div class="guide-card">
        <div class="guide-header">
            <div class="guide-title-block">
                <div class="guide-badge">MDM SEVA Portal &mdash; School User Guide</div>
                <h1>How to Use the Mid-Day Meal Reporting System</h1>
                <p>
                    This guide explains how a school user can register, record daily meals, manage rice stock
                    and generate official Rice and Amount Statements from the MDM SEVA portal.
                </p>
            </div>
            <div class="meta-row">
                <div class="meta-chip"><span class="meta-dot"></span> For school-level users</div>
                <div class="meta-chip">Covers Daily Consumption, Rice Reports &amp; Amount Reports</div>
                <div class="meta-chip">Recommended monthly workflow included</div>
                <a href="/user-guide/pdf" style="margin-left:auto; padding:6px 12px; border-radius:999px; font-size:11px; font-weight:600; text-decoration:none; background:linear-gradient(90deg,#2563eb,#7c3aed); color:#fff; box-shadow:0 8px 18px rgba(37,99,235,0.35); border:1px solid rgba(59,130,246,0.6);">
                    Download PDF Guide
                </a>
            </div>
        </div>

        <div class="two-column">
            <!-- Left: Main content -->
            <div>
                <!-- 1. Getting Started -->
                <div id="getting-started" class="section-card">
                    <div class="section-title-row">
                        <h2>1. Getting Started</h2>
                        <span class="section-tag">Basics</span>
                    </div>
                    <div class="section-body">
                        <p>
                            Access the portal using a modern browser (Chrome, Edge or Firefox). Visit your official portal
                            URL (for example, <span class="muted">http://127.0.0.1:8000/</span> or the domain shared by
                            your district/state).
                        </p>

                        <div class="subsection-title">1.1 Registration</div>
                        <p class="muted">
                            Depending on how your deployment is configured, school accounts may be self-registered or
                            created by an administrator.
                        </p>
                        <ol class="steps">
                            <li>Open the portal home page.</li>
                            <li>Click <strong>Register</strong> / <strong>Sign Up</strong> (if available).</li>
                            <li>Fill in your <strong>School Name</strong>, <strong>UDISE</strong>, district, zone, state,
                                email, phone and password.</li>
                            <li>Submit the form. If email verification is enabled, confirm your email.</li>
                        </ol>
                        <div class="highlight-box">
                            If you do not see a registration option, your account is likely created by an
                            administrator. Ask your Block / District MDM in‑charge for your login credentials.
                        </div>

                        <div class="subsection-title">1.2 Login &amp; Logout</div>
                        <ol class="steps">
                            <li>Click <strong>Login</strong> on the portal.</li>
                            <li>Enter your registered email and password.</li>
                            <li>Click <strong>Login</strong> to open the main application.</li>
                            <li>To logout, use the <strong>Logout</strong> option in the navigation or profile menu.</li>
                        </ol>
                    </div>
                </div>

                <!-- 2. Configuration -->
                <div id="configuration" class="section-card">
                    <div class="section-title-row">
                        <h2>2. School Configuration</h2>
                        <span class="section-tag">One-time Setup</span>
                    </div>
                    <div class="section-body">
                        <p>
                            Before generating reliable reports, configure your <strong>Amount</strong> and
                            <strong>Rice</strong> settings so that the system knows the correct rates and stock values
                            for your school.
                        </p>

                        <div class="subsection-title">2.1 Amount Configuration</div>
                        <p class="muted">
                            Amount configuration defines per-child, per-day cooking cost norms for each section.
                        </p>
                        <ul class="steps">
                            <li>Open the <strong>Amount Configuration</strong> section from the navigation.</li>
                            <li>For <strong>Primary (Class I–V)</strong>, enter rates for:
                                <div class="pill-list">
                                    <span class="pill">Pulses per child per day</span>
                                    <span class="pill">Vegetables per child per day</span>
                                    <span class="pill">Oil / Fat per child per day</span>
                                    <span class="pill">Salt &amp; condiments per child per day</span>
                                    <span class="pill">Fuel per child per day</span>
                                    <span class="pill">Total variable cost per child</span>
                                </div>
                            </li>
                            <li>Repeat the same for <strong>Upper Primary (Class VI–VIII)</strong> with its own rates.</li>
                            <li>Save the configuration. These values are used automatically in Amount Reports.</li>
                        </ul>

                        <div class="subsection-title">2.2 Rice Configuration</div>
                        <p class="muted">
                            Rice configuration captures your stock position for a month, including lifted and arranged rice.
                        </p>
                        <ul class="steps">
                            <li>Open the <strong>Rice Configuration</strong> page or the configuration section inside
                                Rice Reports.</li>
                            <li>For <strong>Primary</strong> and <strong>Upper Primary</strong>, fill:
                                <div class="pill-list">
                                    <span class="pill">Opening balance</span>
                                    <span class="pill">Rice lifted</span>
                                    <span class="pill">Rice arranged</span>
                                    <span class="pill">Total available</span>
                                    <span class="pill">Rice consumed</span>
                                    <span class="pill">Closing balance</span>
                                </div>
                            </li>
                            <li>Ensure <strong>Rice Arranged</strong> values are entered when additional rice beyond
                                normal lifting is arranged. This is reflected in both rice and amount PDFs.</li>
                            <li>Save the configuration for the selected month and year.</li>
                        </ul>
                    </div>
                </div>

                <!-- 3. Daily Consumption -->
                <div id="daily-consumption" class="section-card">
                    <div class="section-title-row">
                        <h2>3. Daily Consumption</h2>
                        <span class="section-tag">Daily Work</span>
                    </div>
                    <div class="section-body">
                        <p>
                            Record how many students were actually served the mid-day meal each day. These entries power
                            your monthly Rice and Amount reports.
                        </p>

                        <div class="subsection-title">3.1 Adding a New Entry</div>
                        <ol class="steps">
                            <li>Go to <strong>Daily Consumption &rarr; Create</strong>.</li>
                            <li>Select the correct <strong>Year</strong>, <strong>Month</strong> and <strong>Day</strong>
                                for the meal.</li>
                            <li>Fill in:
                                <ul class="steps">
                                    <li><strong>Served Primary</strong> – number of primary students served.</li>
                                    <li><strong>Served Middle / Upper Primary</strong> – number of upper primary students served.</li>
                                    <li><strong>Remarks</strong> (optional) – e.g., holiday, no meal due to supply issues.</li>
                                </ul>
                            </li>
                            <li>Click <strong>Save / Submit</strong> to store the record.</li>
                        </ol>

                        <div class="subsection-title">3.2 Editing an Existing Entry</div>
                        <ol class="steps">
                            <li>Open <strong>Daily Consumption &rarr; List / Index</strong>.</li>
                            <li>Find the entry by date and click <strong>Edit</strong>.</li>
                            <li>Correct the served numbers or remarks and save.</li>
                        </ol>

                        <div class="callout">
                            Tip: Update daily consumption <strong>every school day</strong>. This makes end-of-month
                            reporting much easier and more accurate.
                        </div>
                    </div>
                </div>

                <!-- 4. Rice Reports -->
                <div id="rice-reports" class="section-card">
                    <div class="section-title-row">
                        <h2>4. Rice Reports</h2>
                        <span class="section-tag">Stock &amp; Consumption</span>
                    </div>
                    <div class="section-body">
                        <p>
                            Rice Reports summarize the rice stock and consumption for a month, using both rice
                            configuration and daily consumption data.
                        </p>

                        <div class="subsection-title">4.1 Rice Reports Index</div>
                        <ul class="steps">
                            <li>Go to <strong>Rice Reports</strong> from the navigation.</li>
                            <li>View the list of existing monthly reports.</li>
                            <li>Read the <strong>Rice Configuration Details</strong> card to see opening, lifted,
                                arranged, consumed and closing balances for Primary and Upper Primary.</li>
                            <li>Click a report to open its detailed view or PDF.</li>
                        </ul>

                        <div class="subsection-title">4.2 Detailed View</div>
                        <p class="muted">
                            The Rice Report detail page usually shows:
                        </p>
                        <ul class="steps">
                            <li>Daily consumption breakdown by date.</li>
                            <li>Totals per section (Primary, Upper Primary).</li>
                            <li>A <strong>Rice Configuration Snapshot</strong> including arranged rice totals.</li>
                        </ul>

                        <div class="subsection-title">4.3 Rice Report PDF</div>
                        <ol class="steps">
                            <li>From the Rice Report index or detail page, click <strong>View PDF</strong>.</li>
                            <li>The system opens a PDF preview (inside an iframe) from the URL
                                <span class="muted">/rice-reports/{id}/generate-pdf</span>.</li>
                            <li>Use the browser / PDF viewer controls to print or download the report.</li>
                        </ol>
                        <div class="highlight-box">
                            The PDF shows your original two-column layout with stock summary, including
                            <strong>Rice Arranged</strong> for Primary, Upper Primary and Grand Total.
                        </div>
                    </div>
                </div>

                <!-- 5. Amount Reports -->
                <div id="amount-reports" class="section-card">
                    <div class="section-title-row">
                        <h2>5. Amount Reports</h2>
                        <span class="section-tag">Financial Statement</span>
                    </div>
                    <div class="section-body">
                        <p>
                            Amount Reports provide the monthly financial statement of cooking cost and rice usage,
                            derived from daily consumption, amount configuration and rice data.
                        </p>

                        <div class="subsection-title">5.1 Amount Reports Index</div>
                        <ul class="steps">
                            <li>Open <strong>Amount Reports</strong> from the navigation.</li>
                            <li>See a list of generated monthly amount statements.</li>
                            <li>Choose a report to view details or open the PDF.</li>
                        </ul>

                        <div class="subsection-title">5.2 Detailed View</div>
                        <p class="muted">
                            A typical Amount Report shows, for Primary and Upper Primary:
                        </p>
                        <ul class="steps">
                            <li>Total students and number of working days.</li>
                            <li>Opening balance, rice lifted, rice consumed and closing balance of rice.</li>
                            <li>Amount spent on pulses, vegetables, oil, salt &amp; condiments, fuel and total cooking cost.</li>
                        </ul>

                        <div class="subsection-title">5.3 Amount Report PDF</div>
                        <ol class="steps">
                            <li>Click <strong>View PDF</strong> for the selected amount report.</li>
                            <li>The PDF is loaded from
                                <span class="muted">/amount-reports/{id}/generate-pdf</span> into a preview frame.</li>
                            <li>Print or save the PDF as your official monthly statement.</li>
                        </ol>
                        <div class="highlight-box">
                            The Amount PDF includes a detailed header, section-wise tables and a
                            <strong>Rice Summary Statement</strong>. "Rice lifted" columns now show
                            <strong>Rice lifted (incl. arranged)</strong>, clearly indicating the portion of arranged rice.
                        </div>
                    </div>
                </div>

                <!-- 6. Monthly Workflow -->
                <div id="workflow" class="section-card">
                    <div class="section-title-row">
                        <h2>6. Recommended Monthly Workflow</h2>
                        <span class="section-tag">Best Practice</span>
                    </div>
                    <div class="section-body">
                        <ol class="steps">
                            <li><strong>Start of Month</strong>
                                <ul class="steps">
                                    <li>Update Rice Configuration with opening balances and expected lifted/arranged rice.</li>
                                    <li>Confirm Amount Configuration rates are correct.</li>
                                </ul>
                            </li>
                            <li><strong>Daily</strong>
                                <ul class="steps">
                                    <li>Enter Daily Consumption for Primary and Upper Primary students.</li>
                                    <li>Add remarks for holidays or special situations.</li>
                                </ul>
                            </li>
                            <li><strong>Mid‑Month (optional)</strong>
                                <ul class="steps">
                                    <li>Preview Rice Reports to monitor stock and usage.</li>
                                </ul>
                            </li>
                            <li><strong>End of Month</strong>
                                <ul class="steps">
                                    <li>Finalize Rice Configuration (actual lifted, arranged, consumed, closing).</li>
                                    <li>Generate Rice Report PDF and Amount Report PDF.</li>
                                </ul>
                            </li>
                            <li><strong>Submission</strong>
                                <ul class="steps">
                                    <li>Print the PDFs and submit them as per departmental guidelines.</li>
                                    <li>Keep digital or physical copies for your records.</li>
                                </ul>
                            </li>
                        </ol>
                    </div>
                </div>

                <!-- 7. Troubleshooting -->
                <div id="troubleshooting" class="section-card">
                    <div class="section-title-row">
                        <h2>7. Troubleshooting</h2>
                        <span class="section-tag">Help</span>
                    </div>
                    <div class="section-body">
                        <div class="subsection-title">7.1 PDF Preview Does Not Load</div>
                        <p class="muted">
                            If you see an error like <em>"Refused to display in a frame because it set
                            'X-Frame-Options' to 'deny'"</em>:
                        </p>
                        <ul class="steps">
                            <li>Ensure you are opening the dedicated PDF preview pages, such as
                                <span class="muted">/rice-reports/{id}/view-pdf</span> or
                                <span class="muted">/amount-reports/{id}/view-pdf</span>.</li>
                            <li>Do not try to embed the homepage <span class="muted">/</span> itself inside an iframe.</li>
                        </ul>

                        <div class="subsection-title">7.2 Numbers Look Incorrect</div>
                        <ul class="steps">
                            <li>Review Daily Consumption entries for missing or wrong dates.</li>
                            <li>Check Amount Configuration rates for both sections.</li>
                            <li>Verify Rice Configuration values (opening, lifted, arranged, consumed, closing).</li>
                            <li>Regenerate the report if there is an option to do so.</li>
                        </ul>

                        <div class="subsection-title">7.3 Upper Primary Section Missing</div>
                        <p class="muted">
                            If no middle / upper primary students are configured, Upper Primary sections may be hidden
                            in reports and PDFs. This is expected behaviour.
                        </p>
                    </div>
                </div>

                <!-- 8. FAQs -->
                <div id="faqs" class="section-card">
                    <div class="section-title-row">
                        <h2>8. FAQs</h2>
                        <span class="section-tag">Common Questions</span>
                    </div>
                    <div class="section-body">
                        <div class="subsection-title">8.1 Do I need to re-enter old data when rates change?</div>
                        <p class="muted">
                            No. Old reports keep using the configuration that was active when they were generated.
                            When rates change, update the Amount / Rice Configuration and generate new reports for
                            future months only.
                        </p>

                        <div class="subsection-title">8.2 Can I regenerate a report after fixing data?</div>
                        <p class="muted">
                            Yes, if the module provides a <strong>Regenerate</strong> or <strong>Find &amp; Rebuild</strong>
                            option. First correct Daily Consumption and Configuration values, then regenerate the report
                            so it uses the latest data.
                        </p>

                        <div class="subsection-title">8.3 What happens if I miss a day of daily consumption?</div>
                        <p class="muted">
                            You can always go back to the missed date, add a record, and then regenerate the monthly
                            reports. It is better to fill data as soon as possible to avoid gaps.
                        </p>

                        <div class="subsection-title">8.4 How is arranged rice reflected in amount reports?</div>
                        <p class="muted">
                            Arranged rice is added to standard lifted rice and shown as
                            <strong>"Rice lifted (incl. arranged)"</strong> in the Amount PDF, with a separate note
                            indicating the arranged quantity. This keeps the format familiar but still transparent.
                        </p>

                        <div class="subsection-title">8.5 Who should I contact for technical issues?</div>
                        <p class="muted">
                            Use the <strong>Contact</strong> section on the welcome page to send feedback through the
                            Feedback Wizard, or reach out via the email and phone listed there. For school‑specific
                            permissions, contact your Block / District MDM coordinator.
                        </p>
                    </div>
                </div>

                <!-- 9. Documentation -->
                <div id="documentation" class="section-card">
                    <div class="section-title-row">
                        <h2>9. Documentation</h2>
                        <span class="section-tag">Reference</span>
                    </div>
                    <div class="section-body">
                        <p>
                            This user guide is the primary documentation for school users. For quick reference, keep both
                            the <strong>online guide</strong> and the <strong>PDF guide</strong> available:
                        </p>
                        <ul class="steps">
                            <li><strong>Online User Guide</strong> &mdash; open from the home page footer under
                                <em>Resources &rarr; User Guide</em>. Use the quick navigation panel to jump between
                                sections like Daily Consumption, Rice Reports and FAQs.</li>
                            <li><strong>PDF User Guide</strong> &mdash; click <em>Download PDF Guide</em> at the top of the
                                online guide. This version is formatted for A4 printing and can be shared or filed with
                                school records.</li>
                        </ul>

                        <div class="subsection-title">9.1 Other Helpful Pages</div>
                        <ul class="steps">
                            <li><strong>Welcome / Landing Page</strong> &mdash; shows public statistics and gives access
                                to login, registration and contact information.</li>
                            <li><strong>Legal Pages</strong> (Privacy Policy, Terms of Service, Cookie Policy) &mdash;
                                available from the footer to explain how data and cookies are handled.</li>
                            <li><strong>In‑app Screens</strong> (Daily Consumption, Rice Reports, Amount Reports) &mdash;
                                each screen closely follows the structure described in this guide so fields are easy to
                                match.</li>
                        </ul>

                        <div class="callout">
                            If you introduce new features later (for example, additional reports or dashboards), add a
                            short note in this Documentation section so users always know where to look for help.
                        </div>
                    </div>
                </div>
            </div>

            <!-- Right: Table of contents / quick links -->
            <aside>
                <div class="toc-card">
                    <h2>Quick Navigation</h2>
                    <ul class="toc-list">
                        <li><a class="toc-anchor" href="#getting-started"><span>1.</span> Getting Started</a></li>
                        <li><a class="toc-anchor" href="#configuration"><span>2.</span> School Configuration</a></li>
                        <li><a class="toc-anchor" href="#daily-consumption"><span>3.</span> Daily Consumption</a></li>
                        <li><a class="toc-anchor" href="#rice-reports"><span>4.</span> Rice Reports</a></li>
                        <li><a class="toc-anchor" href="#amount-reports"><span>5.</span> Amount Reports</a></li>
                        <li><a class="toc-anchor" href="#workflow"><span>6.</span> Monthly Workflow</a></li>
                        <li><a class="toc-anchor" href="#troubleshooting"><span>7.</span> Troubleshooting</a></li>
                        <li><a class="toc-anchor" href="#faqs"><span>8.</span> FAQs</a></li>
                        <li><a class="toc-anchor" href="#documentation"><span>9.</span> Documentation</a></li>
                    </ul>
                </div>
            </aside>
        </div>

        <div class="footer-note">
            This guide is intended for school-level users of the MDM SEVA portal to simplify
            day-to-day reporting and monthly compliance.
        </div>
    </div>
</div>
</body>
</html>
