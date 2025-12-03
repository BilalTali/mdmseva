<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>PM POSHAN Guidelines & Resources | MDM-SEVA</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
    <style>
        :root {
            --primary: #2563eb;
            --primary-dark: #1e40af;
            --secondary: #10b981;
            --accent: #8b5cf6;
            --bg-main: #f8fafc;
            --bg-card: #ffffff;
            --text-primary: #0f172a;
            --text-secondary: #475569;
            --text-muted: #64748b;
            --border: #e2e8f0;
            --shadow-sm: 0 1px 3px rgba(0,0,0,0.1);
            --shadow-md: 0 4px 6px rgba(0,0,0,0.07);
            --shadow-lg: 0 10px 25px rgba(0,0,0,0.1);
            --shadow-xl: 0 20px 40px rgba(0,0,0,0.15);
        }

        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: var(--text-primary);
            line-height: 1.6;
            min-height: 100vh;
            padding: 2rem 1rem;
        }

        .container {
            max-width: 1200px;
            margin: 0 auto;
        }

        /* Header Section */
        .header {
            background: var(--bg-card);
            border-radius: 20px;
            padding: 3rem 2.5rem;
            margin-bottom: 2rem;
            box-shadow: var(--shadow-xl);
            border: 1px solid rgba(255,255,255,0.1);
        }

        .header-badge {
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            padding: 0.5rem 1.25rem;
            background: linear-gradient(135deg, rgba(37,99,235,0.1), rgba(139,92,246,0.1));
            border: 2px solid rgba(37,99,235,0.2);
            border-radius: 50px;
            font-size: 0.875rem;
            font-weight: 600;
            color: var(--primary);
            margin-bottom: 1.5rem;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        .header h1 {
            font-size: 2.5rem;
            font-weight: 800;
            background: linear-gradient(135deg, #667eea, #764ba2);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            margin-bottom: 1rem;
            line-height: 1.2;
        }

        .header-subtitle {
            font-size: 1.125rem;
            color: var(--text-secondary);
            max-width: 800px;
            line-height: 1.7;
        }

        /* Main Content Grid */
        .content-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
            gap: 2rem;
            margin-bottom: 2rem;
        }

        .card {
            background: var(--bg-card);
            border-radius: 16px;
            padding: 2rem;
            box-shadow: var(--shadow-lg);
            border: 1px solid var(--border);
            transition: all 0.3s ease;
        }

        .card:hover {
            transform: translateY(-4px);
            box-shadow: var(--shadow-xl);
        }

        .card-icon {
            width: 60px;
            height: 60px;
            background: linear-gradient(135deg, var(--primary), var(--accent));
            border-radius: 14px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.75rem;
            margin-bottom: 1.5rem;
            box-shadow: 0 8px 16px rgba(37,99,235,0.3);
        }

        .card h2 {
            font-size: 1.5rem;
            font-weight: 700;
            color: var(--text-primary);
            margin-bottom: 1rem;
        }

        .card p {
            color: var(--text-secondary);
            margin-bottom: 1.5rem;
            font-size: 0.95rem;
        }

        .card ul {
            list-style: none;
            margin: 1rem 0;
        }

        .card li {
            padding: 0.75rem 0;
            color: var(--text-secondary);
            font-size: 0.95rem;
            border-bottom: 1px solid var(--border);
            display: flex;
            align-items: start;
            gap: 0.75rem;
        }

        .card li:last-child {
            border-bottom: none;
        }

        .card li::before {
            content: "→";
            color: var(--secondary);
            font-weight: 700;
            flex-shrink: 0;
        }

        .card li strong {
            color: var(--text-primary);
            font-weight: 600;
        }

        /* Nutritional Guidelines Table */
        .nutrition-table {
            width: 100%;
            border-collapse: separate;
            border-spacing: 0;
            margin: 1.5rem 0;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: var(--shadow-sm);
        }

        .nutrition-table thead {
            background: linear-gradient(135deg, var(--primary), var(--accent));
        }

        .nutrition-table th {
            padding: 1rem;
            text-align: left;
            color: white;
            font-weight: 600;
            font-size: 0.9rem;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        .nutrition-table td {
            padding: 1rem;
            border-bottom: 1px solid var(--border);
            color: var(--text-secondary);
            font-size: 0.95rem;
        }

        .nutrition-table tbody tr:hover {
            background: rgba(37,99,235,0.03);
        }

        .nutrition-table tbody tr:last-child td {
            border-bottom: none;
        }

        /* Timeline Section */
        .timeline {
            background: var(--bg-card);
            border-radius: 16px;
            padding: 2rem;
            box-shadow: var(--shadow-lg);
            margin-bottom: 2rem;
        }

        .timeline h2 {
            font-size: 1.75rem;
            font-weight: 700;
            margin-bottom: 2rem;
            color: var(--text-primary);
        }

        .timeline-item {
            display: grid;
            grid-template-columns: 120px 1fr;
            gap: 1.5rem;
            margin-bottom: 1.5rem;
            padding-bottom: 1.5rem;
            border-bottom: 1px solid var(--border);
        }

        .timeline-item:last-child {
            border-bottom: none;
            margin-bottom: 0;
            padding-bottom: 0;
        }

        .timeline-year {
            font-weight: 700;
            color: var(--primary);
            font-size: 1.125rem;
        }

        .timeline-content {
            color: var(--text-secondary);
            font-size: 0.95rem;
        }

        /* Resources Section */
        .resources {
            background: var(--bg-card);
            border-radius: 16px;
            padding: 2rem;
            box-shadow: var(--shadow-lg);
            margin-bottom: 2rem;
        }

        .resources h2 {
            font-size: 1.75rem;
            font-weight: 700;
            margin-bottom: 2rem;
            color: var(--text-primary);
        }

        .resource-grid {
            display: grid;
            gap: 1rem;
        }

        .resource-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 1.25rem;
            background: linear-gradient(135deg, rgba(37,99,235,0.03), rgba(139,92,246,0.03));
            border: 1px solid var(--border);
            border-radius: 12px;
            transition: all 0.3s ease;
            gap: 1rem;
        }

        .resource-item:hover {
            background: linear-gradient(135deg, rgba(37,99,235,0.08), rgba(139,92,246,0.08));
            border-color: var(--primary);
        }

        .resource-info {
            flex: 1;
        }

        .resource-title {
            font-weight: 600;
            color: var(--text-primary);
            margin-bottom: 0.25rem;
            font-size: 0.95rem;
        }

        .resource-meta {
            font-size: 0.875rem;
            color: var(--text-muted);
        }

        .resource-link {
            padding: 0.625rem 1.25rem;
            background: linear-gradient(135deg, var(--primary), var(--accent));
            color: white;
            text-decoration: none;
            border-radius: 8px;
            font-size: 0.875rem;
            font-weight: 600;
            transition: all 0.3s ease;
            white-space: nowrap;
            box-shadow: 0 4px 12px rgba(37,99,235,0.3);
        }

        .resource-link:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(37,99,235,0.4);
        }

        /* Download Section */
        .download-section {
            background: linear-gradient(135deg, rgba(37,99,235,0.95), rgba(139,92,246,0.95));
            border-radius: 16px;
            padding: 3rem 2.5rem;
            text-align: center;
            box-shadow: var(--shadow-xl);
            margin-bottom: 2rem;
        }

        .download-section h2 {
            font-size: 2rem;
            font-weight: 700;
            color: white;
            margin-bottom: 1rem;
        }

        .download-section p {
            color: rgba(255,255,255,0.9);
            font-size: 1.125rem;
            margin-bottom: 2rem;
            max-width: 600px;
            margin-left: auto;
            margin-right: auto;
        }

        .download-buttons {
            display: flex;
            gap: 1rem;
            justify-content: center;
            flex-wrap: wrap;
        }

        .btn {
            display: inline-flex;
            align-items: center;
            gap: 0.75rem;
            padding: 1rem 2rem;
            border-radius: 12px;
            font-weight: 600;
            font-size: 1rem;
            text-decoration: none;
            transition: all 0.3s ease;
            cursor: pointer;
            border: none;
            box-shadow: var(--shadow-md);
        }

        .btn-primary {
            background: white;
            color: var(--primary);
        }

        .btn-primary:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 24px rgba(255,255,255,0.3);
        }

        .btn-secondary {
            background: rgba(255,255,255,0.2);
            color: white;
            border: 2px solid rgba(255,255,255,0.3);
        }

        .btn-secondary:hover {
            background: rgba(255,255,255,0.3);
            transform: translateY(-2px);
        }

        /* Footer */
        .footer {
            background: var(--bg-card);
            border-radius: 16px;
            padding: 2rem;
            text-align: center;
            box-shadow: var(--shadow-lg);
        }

        .footer p {
            color: var(--text-muted);
            font-size: 0.875rem;
            line-height: 1.6;
        }

        /* Responsive Design */
        @media (max-width: 768px) {
            body {
                padding: 1rem 0.5rem;
            }

            .header {
                padding: 2rem 1.5rem;
            }

            .header h1 {
                font-size: 1.875rem;
            }

            .content-grid {
                grid-template-columns: 1fr;
                gap: 1.5rem;
            }

            .timeline-item {
                grid-template-columns: 1fr;
                gap: 0.5rem;
            }

            .resource-item {
                flex-direction: column;
                align-items: flex-start;
            }

            .download-section {
                padding: 2rem 1.5rem;
            }

            .download-section h2 {
                font-size: 1.5rem;
            }

            .download-buttons {
                flex-direction: column;
            }

            .btn {
                width: 100%;
                justify-content: center;
            }
        }

        @media print {
            body {
                background: white;
                padding: 0;
            }

            .download-section,
            .resource-link,
            .btn {
                display: none;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <!-- Header -->
        <header class="header">
            <div class="header-badge">
                📚 PM POSHAN Guidelines
            </div>
            <h1>PM POSHAN Scheme Guidelines & Resources</h1>
            <p class="header-subtitle">
                Comprehensive guidelines for the Pradhan Mantri Poshan Shakti Nirman (PM POSHAN) scheme, formerly known as the Mid-Day Meal Scheme. Access official circulars, nutritional norms, implementation guidelines, and monitoring frameworks for India's largest school feeding program.
            </p>
        </header>
<!-- Official Resources -->
        <div class="resources">
            <h2>📑 Official Guidelines & Circulars</h2>
            <p style="margin-bottom: 2rem; color: var(--text-secondary);">Access the latest official documents, circulars, and guidelines from the Ministry of Education and PM POSHAN portal.</p>
            
            <div class="resource-grid">
                <div class="resource-item">
                    <div class="resource-info">
                        <div class="resource-title">Annual Revision of Material Cost (May 2025)</div>
                        <div class="resource-meta">Official circular for cooking cost revision effective May 1, 2025</div>
                    </div>
                    <a href="https://pmposhan.education.gov.in/Files/Cooking_Cost_Revision/Revision%20of%20Material%20Cost_wef-1-may-2025.pdf" target="_blank" rel="noopener noreferrer" class="resource-link">View PDF</a>
                </div>

                <div class="resource-item">
                    <div class="resource-info">
                        <div class="resource-title">Quality, Safety & Hygiene Guidelines</div>
                        <div class="resource-meta">PIB Press Release - December 2024</div>
                    </div>
                    <a href="https://www.pib.gov.in/PressReleasePage.aspx?PRID=2082323" target="_blank" rel="noopener noreferrer" class="resource-link">Read More</a>
                </div>

                <div class="resource-item">
                    <div class="resource-info">
                        <div class="resource-title">PM POSHAN Latest Updates</div>
                        <div class="resource-meta">Official portal with all recent circulars and notifications</div>
                    </div>
                    <a href="https://pmposhan.education.gov.in/latest_update.html" target="_blank" rel="noopener noreferrer" class="resource-link">Visit Portal</a>
                </div>

                <div class="resource-item">
                    <div class="resource-info">
                        <div class="resource-title">Food Grains Allocation FY 2025-26</div>
                        <div class="resource-meta">Quarterly breakup including coarse grains (Ragi & Jowar) - March 2025</div>
                    </div>
                    <a href="https://www.scribd.com/document/886242341/PM-POSHAN-1st-Half-FY-25-26-Alltoment" target="_blank" rel="noopener noreferrer" class="resource-link">View Document</a>
                </div>

                

                <div class="resource-item">
                    <div class="resource-info">
                        <div class="resource-title">PM POSHAN Scheme Overview</div>
                        <div class="resource-meta">Comprehensive scheme details by Drishti IAS</div>
                    </div>
                    <a href="https://www.drishtiias.com/daily-news-analysis/midday-meal-scheme" target="_blank" rel="noopener noreferrer" class="resource-link">Read Article</a>
                </div>

                <div class="resource-item">
                    <div class="resource-info">
                        <div class="resource-title">State Circulars & Government Orders</div>
                        <div class="resource-meta">Karnataka State Education Department</div>
                    </div>
                    <a href="https://schooleducation.karnataka.gov.in/346/circulars-and-go's/en" target="_blank" rel="noopener noreferrer" class="resource-link">Access Portal</a>
                </div>

                <div class="resource-item">
                    <div class="resource-info">
                        <div class="resource-title">Rashtriya Poshan Maah 2025</div>
                        <div class="resource-meta">Celebration directives and official letters - September 2025</div>
                    </div>
                    <a href="https://pmposhan.education.gov.in" target="_blank" rel="noopener noreferrer" class="resource-link">Visit Site</a>
                </div>

                <div class="resource-item">
                    <div class="resource-info">
                        <div class="resource-title">Scheme Guidelines - MyScheme Portal</div>
                        <div class="resource-meta">Government of India's official scheme information portal</div>
                    </div>
                    <a href="https://www.myscheme.gov.in/schemes/pm-poshan" target="_blank" rel="noopener noreferrer" class="resource-link">Explore</a>
                </div>

                <div class="resource-item">
                    <div class="resource-info">
                        <div class="resource-title">Mid-Day Meal Circulars - Haryana</div>
                        <div class="resource-meta">State-level implementation guidelines and monitoring</div>
                    </div>
                    <a href="https://harprathmik.gov.in/mid-day-meal-circulars/" target="_blank" rel="noopener noreferrer" class="resource-link">View Circulars</a>
                </div>

                <div class="resource-item">
                    <div class="resource-info">
                        <div class="resource-title">PM POSHAN Implementation Guide</div>
                        <div class="resource-meta">Detailed operational guidelines from Vikaspedia</div>
                    </div>
                    <a href="https://education.vikaspedia.in/viewcontent/education/policies-and-schemes/national-scheme-for-pm-poshan-in-school?lgn=en" target="_blank" rel="noopener noreferrer" class="resource-link">Read Guide</a>
                </div>

                <div class="resource-item">
                    <div class="resource-info">
                        <div class="resource-title">Delhi DSEL PM POSHAN Portal</div>
                        <div class="resource-meta">Delhi State Education Department scheme details</div>
                    </div>
                    <a href="http://dsel.education.gov.in/en/scheme/pm-poshan-scheme" target="_blank" rel="noopener noreferrer" class="resource-link">Access Portal</a>
                </div>
            </div>
        </div>

        <!-- Overview Cards -->
        <div class="content-grid">
            <div class="card">
                <div class="card-icon">🎯</div>
                <h2>Scheme Objectives</h2>
                <p>The PM POSHAN scheme aims to address hunger and malnutrition while promoting educational outcomes.</p>
                <ul>
                    <li>Improve <strong>nutritional status</strong> of children in classes I-VIII</li>
                    <li>Increase school <strong>enrolment, attendance & retention</strong></li>
                    <li>Provide <strong>nutritional support</strong> during droughts/summer</li>
                    <li>Combat <strong>classroom hunger</strong> and improve learning</li>
                </ul>
            </div>

            <div class="card">
                <div class="card-icon">👥</div>
                <h2>Target Beneficiaries</h2>
                <p>The scheme covers children aged 6-14 years across various educational institutions.</p>
                <ul>
                    <li>Government and <strong>government-aided schools</strong></li>
                    <li><strong>Local body schools</strong> (Municipal/Panchayat)</li>
                    <li><strong>Special Training Centers</strong> (STCs)</li>
                    <li><strong>Madarsas & Maqtabs</strong> under SSA support</li>
                </ul>
            </div>

            <div class="card">
                <div class="card-icon">💰</div>
                <h2>Financial Framework</h2>
                <p>Central and state funding allocation for the 2021-22 to 2025-26 period.</p>
                <ul>
                    <li>Total Outlay: <strong>₹85,794.90 crore</strong></li>
                    <li>Central Share: <strong>₹54,061.73 crore</strong> (90%)</li>
                    <li>State/UT Share: <strong>₹31,733.17 crore</strong> (10%)</li>
                    <li>Material Cost (May 2025): <strong>₹6.78/child/day</strong></li>
                </ul>
            </div>
        </div>

        <!-- Nutritional Guidelines -->
        <div class="card">
            <div class="card-icon">🍽️</div>
            <h2>Nutritional Guidelines Per Child Per Day</h2>
            <p>Scientifically determined nutritional norms to ensure adequate caloric intake and balanced nutrition for growing children.</p>
            
            <table class="nutrition-table">
                <thead>
                    <tr>
                        <th>Category</th>
                        <th>Calories</th>
                        <th>Protein</th>
                        <th>Rice/Wheat</th>
                        <th>Dal</th>
                        <th>Vegetables</th>
                        <th>Oil/Fat</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td><strong>Primary (I-V)</strong></td>
                        <td>450 kcal</td>
                        <td>12g</td>
                        <td>100g</td>
                        <td>20g</td>
                        <td>50g</td>
                        <td>5g</td>
                    </tr>
                    <tr>
                        <td><strong>Upper Primary (VI-VIII)</strong></td>
                        <td>700 kcal</td>
                        <td>20g</td>
                        <td>150g</td>
                        <td>30g</td>
                        <td>75g</td>
                        <td>7.5g</td>
                    </tr>
                </tbody>
            </table>
            <p style="margin-top: 1rem; font-size: 0.875rem; color: var(--text-muted);">
                <em>Note: Salt and condiments are provided as needed. Recent updates include millet-based alternatives (ragi, jowar) for nutritional diversity.</em>
            </p>
        </div>

        <!-- Historical Timeline -->
        <div class="timeline">
            <h2>📅 Historical Timeline & Key Updates</h2>
            
            <div class="timeline-item">
                <div class="timeline-year">1925</div>
                <div class="timeline-content">First introduced in Madras (Chennai) for disadvantaged children - pioneering effort in India.</div>
            </div>

            <div class="timeline-item">
                <div class="timeline-year">1955</div>
                <div class="timeline-content">Tamil Nadu became the first state to implement a comprehensive statewide mid-day meal scheme.</div>
            </div>

            <div class="timeline-item">
                <div class="timeline-year">1995</div>
                <div class="timeline-content">Launched nationally as the National Programme of Nutritional Support to Primary Education (NP-NSPE).</div>
            </div>

            <div class="timeline-item">
                <div class="timeline-year">2001</div>
                <div class="timeline-content">Supreme Court mandated cooked mid-day meals in all government primary schools across India.</div>
            </div>

            <div class="timeline-item">
                <div class="timeline-year">2008-09</div>
                <div class="timeline-content">Scheme extended to upper primary classes (VI-VIII), significantly expanding coverage.</div>
            </div>

            <div class="timeline-item">
                <div class="timeline-year">2021</div>
                <div class="timeline-content">Renamed as PM POSHAN (Pradhan Mantri Poshan Shakti Nirman), covering period 2021-22 to 2025-26.</div>
            </div>

            <div class="timeline-item">
                <div class="timeline-year">May 2025</div>
                <div class="timeline-content">Material cost revised to ₹6.78 per child per day - annual revision to account for inflation.</div>
            </div>

            <div class="timeline-item">
                <div class="timeline-year">Nov 2025</div>
                <div class="timeline-content">Delhi introduces millet-based menu including ragi, wheat flour halwa, masala chana, and millet daliya for improved nutrition.</div>
            </div>
        </div>

        
       
      
<footer class="footer">
    <p>
        This page collates key information about the PM POSHAN / Mid-Day Meal scheme and links to official
        Government resources. For any doubts, always refer to the latest circulars issued by the Ministry of
        Education and your State / UT Education Department.
    </p>
</footer>
</div>
</body>
</html><?php /**PATH C:\Users\TASLEEMAH\Documents\mdmseva\resources\views\guidelines.blade.php ENDPATH**/ ?>