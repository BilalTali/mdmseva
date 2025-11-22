<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>MDM SEVA Portal - User Guide (PDF)</title>
    <style>
        @page {
            size: A4;
            margin: 20mm 18mm 20mm 18mm;
        }

        * {
            box-sizing: border-box;
        }

        body {
            font-family: DejaVu Sans, sans-serif;
            font-size: 10px;
            line-height: 1.4;
            color: #111827;
        }

        h1, h2, h3 {
            margin: 0 0 6px;
            font-weight: bold;
        }

        h1 {
            font-size: 18px;
        }

        h2 {
            font-size: 14px;
            border-bottom: 1px solid #d1d5db;
            padding-bottom: 3px;
        }

        h3 {
            font-size: 12px;
        }

        p {
            margin: 3px 0 5px;
        }

        ul, ol {
            margin: 3px 0 5px 16px;
            padding: 0;
        }

        li {
            margin: 2px 0;
        }

        .page-header {
            text-align: center;
            margin-bottom: 10px;
        }

        .page-header-title {
            font-size: 18px;
            font-weight: bold;
        }

        .page-header-subtitle {
            font-size: 11px;
            color: #4b5563;
        }

        .section-box {
            border: 1px solid #e5e7eb;
            border-radius: 6px;
            padding: 8px 10px;
            margin-bottom: 8px;
            background-color: #f9fafb;
        }

        .badge-row {
            margin-bottom: 6px;
        }

        .badge {
            display: inline-block;
            padding: 2px 6px;
            border-radius: 999px;
            border: 1px solid #dbeafe;
            background-color: #eff6ff;
            font-size: 8px;
            margin-right: 4px;
            color: #1d4ed8;
        }

        .callout {
            border-left: 3px solid #2563eb;
            background-color: #eff6ff;
            padding: 6px 8px;
            margin: 5px 0;
            font-size: 9px;
        }

        .note {
            border-left: 3px solid #10b981;
            background-color: #ecfdf5;
            padding: 6px 8px;
            margin: 5px 0;
            font-size: 9px;
        }

        .muted {
            color: #6b7280;
        }

        .table-like {
            width: 100%;
            border-collapse: collapse;
            margin: 5px 0;
        }

        .table-like th,
        .table-like td {
            border: 1px solid #e5e7eb;
            padding: 4px 5px;
            font-size: 9px;
        }

        .table-like th {
            background-color: #f3f4f6;
            font-weight: bold;
        }

        .pill-row {
            margin: 4px 0 2px;
        }

        .pill {
            display: inline-block;
            border-radius: 999px;
            border: 1px solid #e5e7eb;
            padding: 2px 6px;
            margin: 1px 2px;
            font-size: 8px;
            color: #4b5563;
            background-color: #ffffff;
        }

        .page-break {
            page-break-after: always;
        }

        .small-heading {
            font-weight: bold;
            font-size: 10px;
            text-transform: uppercase;
            letter-spacing: 0.06em;
            color: #374151;
        }

        .number-badge {
            display: inline-block;
            width: 14px;
            height: 14px;
            border-radius: 999px;
            background-color: #2563eb;
            color: #ffffff;
            text-align: center;
            line-height: 14px;
            font-size: 9px;
            margin-right: 4px;
        }
    </style>
</head>
<body>

<div class="page-header">
    <div class="page-header-title">MDM SEVA Portal &mdash; School User Guide</div>
    <div class="page-header-subtitle">How to register, record meals, manage rice and generate reports</div>
</div>

<div class="section-box">
    <div class="badge-row">
        <span class="badge">For school-level users</span>
        <span class="badge">Daily Consumption</span>
        <span class="badge">Rice &amp; Amount Reports</span>
        <span class="badge">Monthly Workflow</span>
    </div>
    <p>
        This guide explains how to use the MDM SEVA portal to manage Mid-Day Meal (MDM) data at school level.
        It covers registration, configuration of rice and amount settings, daily consumption entry, and generating
        official rice and amount statement PDFs.
    </p>
</div>

<h2>1. Getting Started</h2>

<h3>1.1 Accessing the Portal</h3>
<p>
    Use a modern browser such as Chrome, Edge or Firefox. Open the official portal URL provided by your
    Block / District / State (for example, <span class="muted">http://127.0.0.1:8000/</span> or a hosted domain).
</p>

<h3>1.2 Registration</h3>
<p class="muted">
    In some deployments, registration is open to schools; in others, accounts are created by administrators.
</p>
<ol>
    <li>Open the portal home page.</li>
    <li>Click <strong>Register</strong> / <strong>Sign Up</strong> (if visible).</li>
    <li>Fill the form with:
        <ul>
            <li>School Name, UDISE, District, Zone, State</li>
            <li>Contact Email and Phone</li>
            <li>Password and Password Confirmation</li>
        </ul>
    </li>
    <li>Submit. If email verification is enabled, confirm your email using the link sent.</li>
</ol>

<div class="callout">
    If you do not see a registration option, your school account is likely created by the admin.
    Request your login credentials from the Block / District MDM in‑charge.
</div>

<h3>1.3 Login &amp; Logout</h3>
<ol>
    <li>Click <strong>Login</strong> on the portal.</li>
    <li>Enter your registered email and password.</li>
    <li>Click <strong>Login</strong> to open the main application dashboard.</li>
    <li>Use the <strong>Logout</strong> option in the menu when you are done.</li>
</ol>

<div class="page-break"></div>

<h2>2. School Configuration</h2>

<p>
    Before you can generate accurate reports, configure your <strong>Amount</strong> and <strong>Rice</strong>
    settings so that the system knows the correct rates and stock values for your school.
</p>

<h3>2.1 Amount Configuration</h3>
<p class="muted">
    Amount configuration defines per‑child, per‑day cooking cost norms for both Primary and Upper Primary sections.
</p>

<table class="table-like">
    <thead>
    <tr>
        <th>Section</th>
        <th>Cost Components</th>
        <th>Purpose</th>
    </tr>
    </thead>
    <tbody>
    <tr>
        <td>Primary (I–V)</td>
        <td>
            <div class="pill-row">
                <span class="pill">Pulses per child/day</span>
                <span class="pill">Vegetables per child/day</span>
                <span class="pill">Oil/Fat per child/day</span>
                <span class="pill">Salt &amp; condiments per child/day</span>
                <span class="pill">Fuel per child/day</span>
                <span class="pill">Total variable cost</span>
            </div>
        </td>
        <td>Used to compute total cooking cost in the monthly Amount Report.</td>
    </tr>
    <tr>
        <td>Upper Primary (VI–VIII)</td>
        <td>
            <div class="pill-row">
                <span class="pill">Pulses per child/day</span>
                <span class="pill">Vegetables per child/day</span>
                <span class="pill">Oil/Fat per child/day</span>
                <span class="pill">Salt &amp; condiments per child/day</span>
                <span class="pill">Fuel per child/day</span>
                <span class="pill">Total variable cost</span>
            </div>
        </td>
        <td>Separate rates allow different norms for upper primary students.</td>
    </tr>
    </tbody>
</table>

<ol>
    <li>Open the <strong>Amount Configuration</strong> page from the navigation.</li>
    <li>Enter the official rates for Primary and Upper Primary sections.</li>
    <li>Save. The system will automatically use these values in amount calculations.</li>
</ol>

<h3>2.2 Rice Configuration</h3>
<p class="muted">
    Rice configuration captures your stock position for a month, including lifted and arranged rice for both sections.
</p>

<table class="table-like">
    <thead>
    <tr>
        <th>Field</th>
        <th>Description</th>
        <th>Section(s)</th>
    </tr>
    </thead>
    <tbody>
    <tr>
        <td>Opening balance</td>
        <td>Rice available at the start of the month.</td>
        <td>Primary, Upper Primary</td>
    </tr>
    <tr>
        <td>Rice lifted</td>
        <td>Quantity lifted from the FEO/godown during the month.</td>
        <td>Primary, Upper Primary</td>
    </tr>
    <tr>
        <td>Rice arranged</td>
        <td>Additional rice arranged beyond regular lifting (e.g., adjustments).</td>
        <td>Primary, Upper Primary</td>
    </tr>
    <tr>
        <td>Total available</td>
        <td>Computed as Opening + Lifted + Arranged.</td>
        <td>Primary, Upper Primary</td>
    </tr>
    <tr>
        <td>Rice consumed</td>
        <td>Total quantity used for serving meals in the month.</td>
        <td>Primary, Upper Primary</td>
    </tr>
    <tr>
        <td>Closing balance</td>
        <td>Remaining stock at the end of the month.</td>
        <td>Primary, Upper Primary</td>
    </tr>
    </tbody>
</table>

<div class="note">
    <strong>Rice Arranged</strong> is shown separately in rice reports and included in
    <em>"Rice lifted (incl. arranged)"</em> in amount reports. Always enter it when extra rice is arranged.
</div>

<div class="page-break"></div>

<h2>3. Daily Consumption</h2>

<p>
    Daily consumption entries record how many students were actually served the mid‑day meal each day.
    These records drive both rice and amount calculations.
</p>

<h3>3.1 Adding a New Daily Entry</h3>
<ol>
    <li>Go to <strong>Daily Consumption &rarr; Create</strong>.</li>
    <li>Select the <strong>Year</strong>, <strong>Month</strong> and <strong>Day</strong> for the meal.</li>
    <li>Enter:
        <ul>
            <li><strong>Served Primary</strong> &mdash; number of primary students who ate.</li>
            <li><strong>Served Middle / Upper Primary</strong> &mdash; number of upper primary students who ate.</li>
            <li><strong>Remarks</strong> (optional) &mdash; holiday, no meal, partial serving, etc.</li>
        </ul>
    </li>
    <li>Click <strong>Save / Submit</strong> to store the record.</li>
</ol>

<h3>3.2 Editing an Existing Entry</h3>
<ol>
    <li>Open <strong>Daily Consumption &rarr; List / Index</strong>.</li>
    <li>Locate the entry by date and click <strong>Edit</strong>.</li>
    <li>Correct the numbers or remarks and save.</li>
</ol>

<div class="callout">
    <span class="small-heading">Tip</span><br>
    Update daily consumption on every school day. This ensures that monthly totals are correct and reduces
    the chance of last‑minute errors at the end of the month.
</div>

<div class="page-break"></div>

<h2>4. Rice Reports</h2>

<p>
    Rice Reports summarize monthly stock and consumption using rice configuration and daily consumption data.
</p>

<h3>4.1 Rice Reports Index</h3>
<ul>
    <li>Navigate to the <strong>Rice Reports</strong> section.</li>
    <li>Review the list of monthly reports already generated.</li>
    <li>Check the <strong>Rice Configuration Details</strong> card to see opening, lifted, arranged,
        consumed and closing balances for both sections.</li>
    <li>Click on a report to open its detailed view or PDF preview.</li>
</ul>

<h3>4.2 Rice Report Detailed View</h3>
<p class="muted">
    The detailed view typically includes:
</p>
<ul>
    <li>Daily consumption breakdown by date.</li>
    <li>Totals for Primary and Upper Primary.</li>
    <li>A <strong>Rice Configuration Snapshot</strong> summarizing opening, lifted, arranged, consumed and closing stock.</li>
</ul>

<h3>4.3 Rice Report PDF</h3>
<ol>
    <li>From the index or detail page, click <strong>View PDF</strong>.</li>
    <li>The system opens a PDF preview from
        <span class="muted">/rice-reports/{id}/generate-pdf</span> inside an embedded frame.</li>
    <li>Use the browser or PDF viewer menu to download or print.</li>
</ol>

<div class="note">
    The Rice Report PDF uses a two‑column layout and includes <strong>Rice Arranged</strong> rows for
    Primary, Upper Primary and Grand Total, keeping your departmental format intact.
</div>

<div class="page-break"></div>

<h2>5. Amount Reports</h2>

<p>
    Amount Reports provide the monthly financial statement of cooking cost and rice usage, based on daily
    consumption, amount configuration and rice data.
</p>

<h3>5.1 Amount Reports Index</h3>
<ul>
    <li>Go to the <strong>Amount Reports</strong> section.</li>
    <li>Review the list of existing monthly amount statements.</li>
    <li>Select a report to see details or open the PDF.</li>
</ul>

<h3>5.2 Amount Report Detailed View</h3>
<p class="muted">
    A typical amount report shows (for both Primary and Upper Primary):
</p>
<ul>
    <li>Total students and number of working days.</li>
    <li>Opening balance, rice lifted, rice consumed and closing balance.</li>
    <li>Cooking cost breakup: pulses, vegetables, oil, salt &amp; condiments, fuel and total.</li>
</ul>

<h3>5.3 Amount Report PDF</h3>
<ol>
    <li>Click <strong>View PDF</strong> on the chosen amount report.</li>
    <li>The PDF is loaded from <span class="muted">/amount-reports/{id}/generate-pdf</span> into a preview frame.</li>
    <li>Use the PDF toolbar to save or print.</li>
</ol>

<table class="table-like">
    <thead>
    <tr>
        <th>Component</th>
        <th>What you see in the PDF</th>
    </tr>
    </thead>
    <tbody>
    <tr>
        <td>Header</td>
        <td>State, District, Zone, School Name, UDISE and report month/year.</td>
    </tr>
    <tr>
        <td>Section tables</td>
        <td>Rows for Primary and Upper Primary with students, days, rice balances and expenditure columns.</td>
    </tr>
    <tr>
        <td>Rice lifted</td>
        <td>
            Displayed as <strong>Rice lifted (incl. arranged)</strong> &mdash; standard lifting plus arranged rice,
            with a note showing the arranged quantity if present.
        </td>
    </tr>
    <tr>
        <td>Rice summary</td>
        <td>Primary, Upper Primary and Total rows summarizing lifted (incl. arranged), consumed and balance.</td>
    </tr>
    <tr>
        <td>Certification</td>
        <td>Text confirming total rice made available (including arranged), consumed quantity and closing balance,
            along with total students served and cooking cost used.</td>
    </tr>
    </tbody>
</table>

<div class="page-break"></div>

<h2>6. Recommended Monthly Workflow</h2>

<p>
    The following workflow helps you use the system smoothly and reduce last‑minute corrections.
</p>

<ol>
    <li>
        <span class="number-badge">1</span>
        <strong>Start of Month</strong>
        <ul>
            <li>Update Rice Configuration with opening balances and expected lifted/arranged rice.</li>
            <li>Confirm Amount Configuration rates for both sections.</li>
        </ul>
    </li>
    <li>
        <span class="number-badge">2</span>
        <strong>Daily</strong>
        <ul>
            <li>Enter Daily Consumption for Primary and Upper Primary students.</li>
            <li>Add remarks for holidays, supply issues or special events.</li>
        </ul>
    </li>
    <li>
        <span class="number-badge">3</span>
        <strong>Mid‑Month (optional)</strong>
        <ul>
            <li>Preview Rice Reports to check if consumption and stock look reasonable.</li>
        </ul>
    </li>
    <li>
        <span class="number-badge">4</span>
        <strong>End of Month</strong>
        <ul>
            <li>Finalize Rice Configuration (actual lifted, arranged, consumed and closing balances).</li>
            <li>Generate Rice Report PDF and Amount Report PDF.</li>
        </ul>
    </li>
    <li>
        <span class="number-badge">5</span>
        <strong>Submission</strong>
        <ul>
            <li>Print the PDFs and submit them to the relevant authority.</li>
            <li>Store digital copies safely for future audits.</li>
        </ul>
    </li>
</ol>

<div class="page-break"></div>

<h2>7. Troubleshooting</h2>

<h3>7.1 PDF Preview Error in Browser</h3>
<p class="muted">
    If you see a message like <em>"Refused to display in a frame because it set 'X-Frame-Options' to 'deny'"</em>:
</p>
<ul>
    <li>Ensure you are using the dedicated preview pages:
        <ul>
            <li><span class="muted">/rice-reports/{id}/view-pdf</span> for rice report previews.</li>
            <li><span class="muted">/amount-reports/{id}/view-pdf</span> for amount report previews.</li>
        </ul>
    </li>
    <li>Do not attempt to embed the root home page (<span class="muted">/</span>) inside an iframe.</li>
</ul>

<h3>7.2 Numbers Look Incorrect</h3>
<ul>
    <li>Confirm that daily consumption entries exist for all teaching days and that dates are correct.</li>
    <li>Recheck Amount Configuration rates for both sections.</li>
    <li>Verify Rice Configuration fields (opening, lifted, arranged, consumed, closing) for the month.</li>
    <li>Regenerate the report if there is an option to do so.</li>
</ul>

<h3>7.3 Upper Primary Section Missing</h3>
<p class="muted">
    If there are no upper primary students configured, Upper Primary sections may be hidden in reports and PDFs.
    This is expected behaviour and does not indicate an error.
</p>

<div class="page-break"></div>

<h2>8. FAQs</h2>

<h3>8.1 Do I need to re-enter old data when rates change?</h3>
<p class="muted">
    No. Old reports continue to reflect the configuration that was active when they were generated.
    When rates change, update the Amount and Rice Configuration and generate new reports for future months.
    Historical reports remain consistent for audit purposes.
</p>

<h3>8.2 Can I regenerate a report after fixing data?</h3>
<p class="muted">
    Yes, if the module offers a <strong>Regenerate</strong> or similar option. First correct Daily Consumption
    entries and configuration values (rates and stock). Then regenerate the report so it recalculates from the
    updated data. Always verify the regenerated PDF before submission.
</p>

<h3>8.3 What happens if I miss a day of daily consumption?</h3>
<p class="muted">
    You can go back to the missed date, create the missing daily consumption entry, and then regenerate your
    monthly rice and amount reports. It is still best practice to enter data daily to avoid gaps and last‑minute work.
</p>

<h3>8.4 How is arranged rice reflected in amount reports?</h3>
<p class="muted">
    Arranged rice is added to standard lifted rice and shown as <strong>"Rice lifted (incl. arranged)"</strong>
    in the Amount Report PDF. The PDF also displays a note indicating how many kilograms were arranged. This keeps
    the existing format recognizable while making arranged rice fully transparent.
</p>

<h3>8.5 Who should I contact for technical issues?</h3>
<p class="muted">
    For portal issues (login, errors, unexpected behaviour), use the <strong>Get In Touch</strong> section on the
    welcome page and submit feedback through the Feedback Wizard, or contact the email/phone shown there.
    For permissions and school profile matters, reach out to your Block / District MDM coordinator.
</p>

<div class="note">
    This user guide is intended as a companion for school‑level operators of the MDM SEVA portal. Keep a printed or
    digital copy available for quick reference while working with daily entries and monthly reports.
</div>

</body>
</html>
