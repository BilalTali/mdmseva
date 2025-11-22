<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Rice Report - {{ $report->month_name }} {{ $report->year }}</title>
    <style>
        @page { 
            size: A4 portrait; 
            margin: 12mm 10mm;
        }

        .content-wrapper {
            width: 92%;
            margin: 0 auto;
        }
        
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'DejaVu Sans', 'Arial', sans-serif;
            font-size: 8pt;
            line-height: 1.3;
            color: #000;
        }
        
        /* Theme Classes */
        body.theme-bw {
            --primary-color: #000;
            --primary-bg: #fff;
            --header-bg: #f5f5f5;
            --table-header-bg: #e0e0e0;
            --table-header-text: #000;
            --border-color: #000;
            --accent-light: #f9f9f9;
            --primary-total-bg: #e0e0e0;
            --upper-total-bg: #d0d0d0;
        }
        
        body.theme-blue {
            --primary-color: #1e40af;
            --primary-bg: #fff;
            --header-bg: #dbeafe;
            --table-header-bg: #2563eb;
            --table-header-text: #fff;
            --border-color: #2563eb;
            --accent-light: #eff6ff;
            --primary-total-bg: #dbeafe;
            --upper-total-bg: #bfdbfe;
        }
        
        body.theme-green {
            --primary-color: #047857;
            --primary-bg: #fff;
            --header-bg: #d1fae5;
            --table-header-bg: #059669;
            --table-header-text: #fff;
            --border-color: #059669;
            --accent-light: #ecfdf5;
            --primary-total-bg: #d1fae5;
            --upper-total-bg: #a7f3d0;
        }
        
        body.theme-purple {
            --primary-color: #6b21a8;
            --primary-bg: #fff;
            --header-bg: #e9d5ff;
            --table-header-bg: #7c3aed;
            --table-header-text: #fff;
            --border-color: #7c3aed;
            --accent-light: #f5f3ff;
            --primary-total-bg: #e9d5ff;
            --upper-total-bg: #d8b4fe;
        }
        
        /* Header Section */
        .report-header {
            text-align: center;
            margin-bottom: 8px;
            padding-bottom: 6px;
            border-bottom: 2px solid var(--border-color);
        }

        .state-name {
            font-size: 16pt;
            font-weight: bold;
            text-transform: uppercase;
            letter-spacing: 1px;
            color: var(--primary-color);
            margin-bottom: 3px;
        }

        .district-zone-row {
            font-size: 11pt;
            font-weight: 600;
            color: #111;
            margin-bottom: 3px;
        }

        .heading-separator {
            margin: 0 8px;
        }

        .school-name-wrapper {
            margin: 6px 0 8px;
        }

        .school-name-header {
            display: inline-block;
            padding: 7px 26px;
            border: 2px solid var(--primary-color);
            border-radius: 999px;
            background: linear-gradient(120deg, var(--accent-light), #fff);
            font-size: 14pt;
            font-weight: 800;
            text-transform: uppercase;
            letter-spacing: 1.4px;
            color: #111;
            box-shadow: 0 3px 8px rgba(0, 0, 0, 0.15);
        }

        .school-name-tagline {
            margin-top: 4px;
            font-size: 8pt;
            font-weight: 600;
            color: #444;
            letter-spacing: 0.6px;
        }

        .single-line-info {
            font-size: 10pt;
            font-weight: 600;
            color: #222;
            margin-bottom: 4px;
        }
        
        .header-details {
            font-size: 7pt;
            color: #333;
            line-height: 1.4;
        }
        
        .header-details span {
            margin: 0 5px;
        }

        /* Live Stats Banner */
        .live-stats-banner {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 6px 8px;
            margin-bottom: 8px;
            border-radius: 4px;
            font-size: 6.5pt;
            display: table;
            width: 100%;
        }

        .live-stats-banner > div {
            display: table-cell;
            width: 33.33%;
            text-align: center;
            vertical-align: middle;
            padding: 2px;
        }

        .live-stats-banner strong {
            display: block;
            font-size: 9pt;
            margin-top: 2px;
        }
        
        h3 {
            font-size: 9pt;
            margin-top: 6px;
            margin-bottom: 4px;
            color: var(--primary-color);
            border-bottom: 1.5px solid var(--border-color);
            padding-bottom: 2px;
        }
        
        /* Tables - ALL CELLS BORDERED */
        table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 8px;
            font-size: 9pt;
            border: 1.5px solid #000;
        }
        
        table.no-border {
            border: none !important;
        }
        
        table.no-border > tr > td,
        table.no-border > tbody > tr > td {
            border: none !important;
            padding: 0 3px;
        }
        
        th, td {
            border: 1.5px solid #000 !important;
            padding: 3px 2px;
            text-align: center;
        }
        
        th {
            background-color: var(--table-header-bg);
            color: var(--table-header-text);
            font-weight: bold;
            font-size: 7pt;
            border: 1.5px solid #000 !important;
        }
        
        td {
            font-size: 6.5pt;
        }
        
        tfoot td {
            background-color: var(--accent-light);
            font-weight: bold;
            font-size: 7pt;
        }
        
        .cell-right {
            text-align: right;
        }
        
        .cell-left {
            text-align: left;
            padding-left: 4px;
        }
        
        /* Compact table for daily entries */
        .daily-table {
            font-size: 6pt;
            border: 1.5px solid #000;
        }
        
        .daily-table th {
            font-size: 6pt;
            padding: 2px 1px;
            border: 1px solid #000;
        }
        
        .daily-table td {
            font-size: 5.5pt;
            padding: 2px 1px;
            border: 1px solid #000;
        }

        /* Subtotal Rows */
        .primary-subtotal-row {
            background-color: var(--primary-total-bg) !important;
            font-weight: bold;
        }

        .primary-subtotal-row td {
            border: 1.5px solid #000 !important;
            font-weight: bold;
            font-size: 6pt;
            padding: 3px 2px;
        }

        .upper-subtotal-row {
            background-color: var(--upper-total-bg) !important;
            font-weight: bold;
        }

        .upper-subtotal-row td {
            border: 1.5px solid #000 !important;
            font-weight: bold;
            font-size: 6pt;
            padding: 3px 2px;
        }

        .grand-total-row {
            background-color: #f3e8ff !important;
            font-weight: bold;
        }

        body.theme-bw .grand-total-row {
            background-color: #c0c0c0 !important;
        }

        .grand-total-row td {
            border: 1.5px solid #000 !important;
            font-weight: bold;
            font-size: 7pt;
            padding: 4px 2px;
        }
        
        /* Summary Tables */
        .summary-table {
            margin-bottom: 8px;
            font-size: 6.5pt;
            border: 1.5px solid #000;
        }
        
        .summary-table td {
            font-size: 6pt;
            padding: 2px 3px;
        }
        
        .summary-table th {
        }
        
        .summary-header-primary {
            background-color: var(--table-header-bg) !important;
            color: var(--table-header-text) !important;
        }
        
        .summary-header-middle {
            background-color: #047857 !important;
            color: white !important;
        }
        
        body.theme-bw .summary-header-middle {
            background-color: #666 !important;
        }
        
        .summary-header-total {
            background-color: #7c3aed !important;
            color: white !important;
        }
        
        body.theme-bw .summary-header-total {
            background-color: #333 !important;
        }

        /* Roll Statement Table */
        .roll-table {
            font-size: 6pt;
            margin-bottom: 8px;
            border: 1.5px solid #000;
        }

        .roll-table th {
            font-size: 6pt;
            padding: 2px 1px;
        }

        .roll-table td {
            font-size: 5.5pt;
            padding: 2px 1px;
        }

        .roll-header {
            background-color: #d97706 !important;
            color: white !important;
            border: 1px solid #000;
        }

        body.theme-bw .roll-header {
            background-color: #555 !important;
        }

        /* Roll Statement Subtotal Rows */
        .roll-primary-total {
            background-color: var(--primary-total-bg) !important;
            font-weight: bold;
        }

        .roll-primary-total td {
            border: 1.5px solid #000 !important;
            font-weight: bold;
            font-size: 6pt;
        }

        .roll-upper-total {
            background-color: var(--upper-total-bg) !important;
            font-weight: bold;
        }

        .roll-upper-total td {
            border: 1.5px solid #000 !important;
            font-weight: bold;
            font-size: 6pt;
        }

        .roll-grand-total {
            background-color: #f3e8ff !important;
            font-weight: bold;
        }

        body.theme-bw .roll-grand-total {
            background-color: #c0c0c0 !important;
        }

        .roll-grand-total td {
            border: 1.5px solid #000 !important;
            font-weight: bold;
            font-size: 6.5pt;
        }
        
        /* Info Box */
        .info-box {
            margin-top: 8px;
            padding: 4px;
            background-color: var(--accent-light);
            border: 1px solid #000;
            border-radius: 3px;
            font-size: 6pt;
        }
        
        .info-box p {
            margin-bottom: 2px;
        }
        
        /* Footer Signatures */
        .footer {
            margin-top: 112px;
            display: table;
            width: 100%;
            page-break-inside: avoid;
        }
        
        .footer > div {
            display: table-cell;
            width: 50%;
            vertical-align: top;
            padding: 6px;
            font-size: 7pt;
        }
        
        .footer-note {
            text-align: center;
            margin-top: 8px;
            font-size: 6pt;
            color: #666;
            border-top: 1px solid #000;
            padding-top: 4px;
        }
        
        /* Print Optimization */
        @media print {
            body {
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
            }
            
            table, th, td {
                border: 1px solid #000 !important;
            }
        }
    </style>
</head>
<body class="theme-{{ $theme ?? 'bw' }}">
<div class="content-wrapper">

    {{-- Header --}}
    <div class="report-header">
        <div class="state-name"> Government of {{ $user->state ?? 'State' }}</div>
        <div class="district-zone-row">
            District: {{ $user->district ?? 'N/A' }} <span class="heading-separator">|</span>
            Zone: {{ $user->zone ?? 'N/A' }} <span class="heading-separator">|</span>
            UDISE: {{ $user->udise ?? 'N/A' }}
        </div>
        <div class="school-name-wrapper">
            <div class="school-name-header">
                {{ strtoupper($user->school_name ?? 'School Name') }}
            </div>
            
        </div>
        <div class="single-line-info">
            Report Month: {{ $report->month_name }} {{ $report->year }} <span class="heading-separator"></span>
                  </div>
       
    </div>

    

    {{-- 2-COLUMN LAYOUT --}}
    <table class="no-border">
        <tr>
            {{-- LEFT COLUMN: Daily Consumption Table (60% width) --}}
            <td width="58%" valign="top" class="no-border">
                <h3>Daily Consumption Report - {{ $report->month_name }} {{ $report->year }}</h3>
                <table class="daily-table">
                    <thead>
                        <tr>
                            <th rowspan="2">S.No</th>
                            <th rowspan="2">Date</th>
                            <th colspan="2">Students Served</th>
                            <th colspan="2">Rice Consumed (kg)</th>
                        </tr>
                        <tr>
                            <th>Primary</th>
                            <th>Middle</th>
                            <th>Primary</th>
                            <th>Middle</th>
                        </tr>
                    </thead>
                    <tbody>
                        @php
                            $totalPrimaryStudents = 0;
                            $totalMiddleStudents = 0;
                            $totalPrimaryRice = 0;
                            $totalMiddleRice = 0;
                        @endphp

                        @foreach($report->daily_records as $index => $day)
                        @php
                            $totalPrimaryStudents += $day['served_primary'] ?? 0;
                            $totalMiddleStudents += $day['served_middle'] ?? 0;
                            $totalPrimaryRice += $day['primary_rice'] ?? 0;
                            $totalMiddleRice += $day['middle_rice'] ?? 0;
                        @endphp
                        <tr>
                            <td>{{ str_pad($index + 1, 2, '0', STR_PAD_LEFT) }}</td>
                            <td>{{ \Carbon\Carbon::parse($day['date'])->format('d/m') }}</td>
                            <td>{{ $day['served_primary'] ?? 0 }}</td>
                            <td>{{ $day['served_middle'] ?? 0 }}</td>
                            <td>{{ number_format($day['primary_rice'] ?? 0, 2) }}</td>
                            <td>{{ number_format($day['middle_rice'] ?? 0, 2) }}</td>
                        </tr>
                        @endforeach

                        {{-- Primary Subtotal Row --}}
                        <tr class="primary-subtotal-row">
                            <td colspan="2"><strong>PRIMARY TOTAL (KG-5th)</strong></td>
                            <td><strong>{{ $totalPrimaryStudents }}</strong></td>
                            <td>-</td>
                            <td><strong>{{ number_format($totalPrimaryRice, 2) }}</strong></td>
                            <td>-</td>
                        </tr>

                        {{-- Upper Primary Subtotal Row --}}
                        <tr class="upper-subtotal-row">
                            <td colspan="2"><strong>UPPER PRIMARY TOTAL (6th-8th)</strong></td>
                            <td>-</td>
                            <td><strong>{{ $totalMiddleStudents }}</strong></td>
                            <td>-</td>
                            <td><strong>{{ number_format($totalMiddleRice, 2) }}</strong></td>
                        </tr>

                        {{-- Grand Total Row --}}
                        <tr class="grand-total-row">
                            <td colspan="2"><strong>GRAND TOTAL</strong></td>
                            <td><strong>{{ $totalPrimaryStudents }}</strong></td>
                            <td><strong>{{ $totalMiddleStudents }}</strong></td>
                            <td><strong>{{ number_format($totalPrimaryRice, 2) }}</strong></td>
                            <td><strong>{{ number_format($totalMiddleRice, 2) }}</strong></td>
                        </tr>
                    </tbody>
                </table>
            </td>

            {{-- RIGHT COLUMN: Summary + Roll Statement (40% width) --}}
            <td width="42%" valign="top" class="no-border">
                
                {{-- ✅ RICE SUMMARY SECTION -  DATA FROM RICE CONFIGURATION --}}
                <h3>Rice Stock Summary ( Data)</h3>
                
                {{-- Primary Summary --}}
                <table class="summary-table">
                    <tr><th colspan="2" class="summary-header-primary">Primary (KG-5th)</th></tr>
                    <tr>
                        <td class="cell-left"><strong>Opening Rice Balance:</strong></td>
                        <td class="cell-right">{{ number_format($computedBalances['opening_balance_primary'] ?? 0, 2) }} kg</td>
                    </tr>
                    <tr>
                        <td class="cell-left"><strong>Rice Lifted:</strong></td>
                        <td class="cell-right">{{ number_format($computedBalances['rice_lifted_primary'] ?? 0, 2) }} kg</td>
                    </tr>
                    @if(($computedBalances['rice_arranged_primary'] ?? 0) > 0)
                    <tr>
                        <td class="cell-left"><strong>Rice Arranged:</strong></td>
                        <td class="cell-right">{{ number_format($computedBalances['rice_arranged_primary'] ?? 0, 2) }} kg</td>
                    </tr>
                    @endif
                    <tr>
                        <td class="cell-left"><strong>Rice Consumed :</strong></td>
                        <td class="cell-right">{{ number_format($riceConfig->consumed_primary ?? 0, 2) }} kg</td>
                    </tr>
                    <tr style="background-color: #f0f0f0;">
                        <td class="cell-left"><strong>Closing Rice Balance :</strong></td>
                        <td class="cell-right"><strong>{{ number_format($computedBalances['closing_balance_primary'] ?? 0, 2) }} kg</strong></td>
                    </tr>
                </table>

                {{-- Middle Summary --}}
                <table class="summary-table">
                    <tr><th colspan="2" class="summary-header-middle">Upper Primary (6th-8th)</th></tr>
                    <tr>
                        <td class="cell-left"><strong>Opening Rice Balance:</strong></td>
                        <td class="cell-right">{{ number_format($computedBalances['opening_balance_upper_primary'] ?? 0, 2) }} kg</td>
                    </tr>
                    <tr>
                        <td class="cell-left"><strong>Rice Lifted:</strong></td>
                        <td class="cell-right">{{ number_format($computedBalances['rice_lifted_upper_primary'] ?? 0, 2) }} kg</td>
                    </tr>
                    @if(($computedBalances['rice_arranged_upper_primary'] ?? 0) > 0)
                    <tr>
                        <td class="cell-left"><strong>Rice Arranged:</strong></td>
                        <td class="cell-right">{{ number_format($computedBalances['rice_arranged_upper_primary'] ?? 0, 2) }} kg</td>
                    </tr>
                    @endif
                    <tr>
                        <td class="cell-left"><strong>Rice Consumed </strong></td>
                        <td class="cell-right">{{ number_format($riceConfig->consumed_upper_primary ?? 0, 2) }} kg</td>
                    </tr>
                    <tr style="background-color: #f0f0f0;">
                        <td class="cell-left"><strong>Closing Rice Balance :</strong></td>
                        <td class="cell-right"><strong>{{ number_format($computedBalances['closing_balance_upper_primary'] ?? 0, 2) }} kg</strong></td>
                    </tr>
                </table>

                {{-- Grand Total Summary - LIVE DATA --}}
                <table class="summary-table">
                    <tr><th colspan="2" class="summary-header-total">Grand Total </th></tr>
                    <tr>
                        <td class="cell-left"><strong>Total Opening Rice Balance:</strong></td>
                        <td class="cell-right">{{ number_format(($computedBalances['opening_balance_primary'] ?? 0) + ($computedBalances['opening_balance_upper_primary'] ?? 0), 2) }} kg</td>
                    </tr>
                    <tr>
                        <td class="cell-left"><strong>Total Rice Lifted:</strong></td>
                        <td class="cell-right">{{ number_format(($computedBalances['rice_lifted_primary'] ?? 0) + ($computedBalances['rice_lifted_upper_primary'] ?? 0), 2) }} kg</td>
                    </tr>
                    @php
                        $totalArranged = ($computedBalances['rice_arranged_primary'] ?? 0) + ($computedBalances['rice_arranged_upper_primary'] ?? 0);
                    @endphp
                    @if($totalArranged > 0)
                    <tr>
                        <td class="cell-left"><strong>Total Rice Arranged:</strong></td>
                        <td class="cell-right">{{ number_format($totalArranged, 2) }} kg</td>
                    </tr>
                    @endif
                    <tr>
                        <td class="cell-left"><strong>Total Rice Consumed :</strong></td>
                        <td class="cell-right">{{ number_format(($riceConfig->consumed_primary ?? 0) + ($riceConfig->consumed_upper_primary ?? 0), 2) }} kg</td>
                    </tr>
                    <tr style="background-color: #f0f0f0;">
                        <td class="cell-left"><strong>Total Closing Rice Balance :</strong></td>
                        <td class="cell-right"><strong>{{ number_format($liveStatistics['current_available_stock'] ?? 0, 2) }} kg</strong></td>
                    </tr>
                </table>

                {{-- ROLL STATEMENT SECTION --}}
                <h3 style="margin-top: 10px;">Roll Statement (Class Strength)</h3>
                <table class="roll-table">
                    <thead>
                        <tr>
                            <th class="roll-header">Class</th>
                            <th class="roll-header">Boys</th>
                            <th class="roll-header">Girls</th>
                            <th class="roll-header">Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        @php
                            $totalBoys = 0;
                            $totalGirls = 0;
                            $totalStudents = 0;
                            
                            $primaryBoys = 0;
                            $primaryGirls = 0;
                            $primaryTotal = 0;
                            
                            $upperBoys = 0;
                            $upperGirls = 0;
                            $upperTotal = 0;
                            
                            // Define class order
                            $classOrder = ['KG', '1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th'];
                        @endphp
                        
                        @if($rollStatements->count() > 0)
                            @foreach($classOrder as $className)
                                @php
                                    $roll = $rollStatements->firstWhere('class', $className);
                                @endphp
                                @if($roll)
                                    @php
                                        $boys = $roll->boys ?? 0;
                                        $girls = $roll->girls ?? 0;
                                        $total = $roll->total ?? 0;
                                        
                                        $totalBoys += $boys;
                                        $totalGirls += $girls;
                                        $totalStudents += $total;
                                        
                                        // Categorize by level
                                        if(in_array($className, ['KG', '1st', '2nd', '3rd', '4th', '5th'])) {
                                            $primaryBoys += $boys;
                                            $primaryGirls += $girls;
                                            $primaryTotal += $total;
                                        } else {
                                            $upperBoys += $boys;
                                            $upperGirls += $girls;
                                            $upperTotal += $total;
                                        }
                                    @endphp
                                    <tr>
                                        <td class="cell-left">{{ $className }}</td>
                                        <td>{{ $boys }}</td>
                                        <td>{{ $girls }}</td>
                                        <td><strong>{{ $total }}</strong></td>
                                    </tr>
                                    
                                    {{-- Primary Subtotal after 5th class --}}
                                    @if($className === '5th')
                                    <tr class="roll-primary-total">
                                        <td class="cell-left"><strong>PRIMARY TOTAL</strong></td>
                                        <td><strong>{{ $primaryBoys }}</strong></td>
                                        <td><strong>{{ $primaryGirls }}</strong></td>
                                        <td><strong>{{ $primaryTotal }}</strong></td>
                                    </tr>
                                    @endif
                                @else
                                    <tr>
                                        <td class="cell-left">{{ $className }}</td>
                                        <td>-</td>
                                        <td>-</td>
                                        <td><strong>-</strong></td>
                                    </tr>
                                @endif
                            @endforeach
                            
                            {{-- Upper Primary Subtotal --}}
                            @if($upperTotal > 0)
                            <tr class="roll-upper-total">
                                <td class="cell-left"><strong>UPPER PRIMARY TOTAL</strong></td>
                                <td><strong>{{ $upperBoys }}</strong></td>
                                <td><strong>{{ $upperGirls }}</strong></td>
                                <td><strong>{{ $upperTotal }}</strong></td>
                            </tr>
                            @endif
                            
                            {{-- Grand Total --}}
                            <tr class="roll-grand-total">
                                <td class="cell-left"><strong>GRAND TOTAL</strong></td>
                                <td><strong>{{ $totalBoys }}</strong></td>
                                <td><strong>{{ $totalGirls }}</strong></td>
                                <td><strong>{{ $totalStudents }}</strong></td>
                            </tr>
                        @else
                            {{-- Show placeholder if no roll data --}}
                            @foreach($classOrder as $className)
                                <tr>
                                    <td class="cell-left">{{ $className }}</td>
                                    <td>-</td>
                                    <td>-</td>
                                    <td><strong>-</strong></td>
                                </tr>
                            @endforeach
                        @endif
                    </tbody>
                </table>

               

            </td>
        </tr>
    </table>

    {{-- Footer Signatures --}}
    <div class="footer">
        <div>
            _______________________<br>
            <strong>MDM Incharge</strong>
        </div>
        <div style="text-align:right;">
            _______________________<br>
            <strong>Headmaster</strong>
        </div>
    

</div>
</body>
</html>