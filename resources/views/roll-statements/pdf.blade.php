<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Roll Statement - {{ $academic_year }}</title>
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
            margin-top: 15px;
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
        
        h3 {
            font-size: 9pt;
            margin-top: 10px;
            margin-bottom: 6px;
            color: var(--primary-color);
            border-bottom: 1.5px solid var(--border-color);
            padding-bottom: 2px;
        }
        
        /* Tables */
        table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 8px;
            font-size: 9pt;
            border: 1.5px solid #000;
        }
        
        th, td {
            border: 1.5px solid #000 !important;
            padding: 5px 3px;
            text-align: center;
        }
        
        th {
            background-color: var(--table-header-bg);
            color: var(--table-header-text);
            font-weight: bold;
            font-size: 8pt;
            border: 1.5px solid #000 !important;
        }
        
        td {
            font-size: 7pt;
            font-weight: bold;
        }

        .cell-left {
            text-align: left;
            padding-left: 4px;
        }

        .class-cell {
            text-align: center;
            background-color: #fffefc;
            padding-left: 0 !important;
        }

        .class-pill {
            display: inline-block;
            padding: 3px 10px;
            border-radius: 999px;
            font-weight: 800;
            font-size: 7pt;
            letter-spacing: 0.5px;
            text-transform: uppercase;
            border: 1px solid #c084fc;
            background: linear-gradient(135deg, #fef3c7, #fde68a);
            color: #78350f;
            min-width: 40px;
            text-align: center;
        }

        /* Subtotal Rows */
        .primary-subtotal-row {
            background-color: var(--primary-total-bg) !important;
            font-weight: bold;
        }

        .primary-subtotal-row td {
            border: 1.5px solid #000 !important;
            font-weight: bold;
            font-size: 7pt;
            padding: 4px 3px;
        }

        .upper-subtotal-row {
            background-color: var(--upper-total-bg) !important;
            font-weight: bold;
        }

        .upper-subtotal-row td {
            border: 1.5px solid #000 !important;
            font-weight: bold;
            font-size: 7pt;
            padding: 4px 3px;
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
            font-size: 8pt;
            padding: 5px 3px;
        }
        
        /* Footer Signatures */
        .footer {
            margin-top: 20px;
            text-align: center;
            font-size: 7pt;
            color: #666;
            border-top: 1px solid #000;
            padding-top: 6px;
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

    @php
        // Use lowercase class values as stored in database
        $primaryClassNames = ['kg', '1', '2', '3', '4', '5'];
        $upperClassNames = ['6', '7', '8'];
        
        // Group roll statements by level
        $primaryStatements = $rollStatements->filter(function($stmt) use ($primaryClassNames) {
            return in_array(strtolower($stmt->class), $primaryClassNames);
        });
        
        $upperStatements = $rollStatements->filter(function($stmt) use ($upperClassNames) {
            return in_array(strtolower($stmt->class), $upperClassNames);
        });
        
        $showPrimary = $primaryStatements->count() > 0;
        $showUpper = $upperStatements->count() > 0;
    @endphp

    {{-- Header --}}
    <div class="report-header">
        <div class="state-name">Government of {{ $user->state ?? 'State' }}</div>
        <div class="district-zone-row">
            District: {{ optional($user->district)->name ?? $user->district ?? 'N/A' }} <span class="heading-separator">|</span>
            Zone: {{ optional($user->zone)->name ?? $user->zone ?? 'N/A' }} <span class="heading-separator">|</span>
            UDISE: {{ $user->udise_code ?? $user->udise ?? 'N/A' }}
        </div>
        <div class="school-name-wrapper">
            <div class="school-name-header">
                {{ strtoupper($user->school_name ?? 'School Name') }}
            </div>
        </div>
        <div class="single-line-info">
         Monthly Roll Statement | Academic Year: {{ $academic_year }} | Date: {{ \Carbon\Carbon::parse($date)->format('d-m-Y') }}
        </div>
    </div>
    {{-- Roll Statement Table --}}
    <h3>Class-wise Student Strength</h3>
    <table>
        <thead>
            <tr>
                <th>S.No</th>
                <th>Class</th>
                <th>Boys</th>
                <th>Girls</th>
                <th>Total</th>
            </tr>
        </thead>
        <tbody>
            @php
                $serialNo = 1;
                $primaryBoys = 0;
                $primaryGirls = 0;
                $primaryTotal = 0;
                $upperBoys = 0;
                $upperGirls = 0;
                $upperTotal = 0;
            @endphp
            
            {{-- Primary Classes --}}
            @if($showPrimary)
                @foreach($primaryClassNames as $className)
                    @php
                        $stmt = $rollStatements->first(function($s) use ($className) {
                            return strtolower($s->class) === strtolower($className);
                        });
                    @endphp
                    @if($stmt)
                        @php
                            $primaryBoys += $stmt->boys;
                            $primaryGirls += $stmt->girls;
                            $primaryTotal += $stmt->total;
                        @endphp
                        <tr>
                            <td>{{ $serialNo++ }}</td>
                            <td class="class-cell">
                                <span class="class-pill">{{ $stmt->class_label }}</span>
                            </td>
                            <td>{{ $stmt->boys }}</td>
                            <td>{{ $stmt->girls }}</td>
                            <td><strong>{{ $stmt->total }}</strong></td>
                        </tr>
                    @endif
                @endforeach
                
                {{-- Primary Subtotal --}}
                @if($primaryTotal > 0)
                <tr class="primary-subtotal-row">
                    <td colspan="2" class="cell-left"><strong>PRIMARY TOTAL (KG-5th)</strong></td>
                    <td><strong>{{ $primaryBoys }}</strong></td>
                    <td><strong>{{ $primaryGirls }}</strong></td>
                    <td><strong>{{ $primaryTotal }}</strong></td>
                </tr>
                @endif
            @endif
            
            {{-- Upper Primary Classes --}}
            @if($showUpper)
                @foreach($upperClassNames as $className)
                    @php
                        $stmt = $rollStatements->first(function($s) use ($className) {
                            return strtolower($s->class) === strtolower($className);
                        });
                    @endphp
                    @if($stmt)
                        @php
                            $upperBoys += $stmt->boys;
                            $upperGirls += $stmt->girls;
                            $upperTotal += $stmt->total;
                        @endphp
                        <tr>
                            <td>{{ $serialNo++ }}</td>
                            <td class="class-cell">
                                <span class="class-pill">{{ $stmt->class_label }}</span>
                            </td>
                            <td>{{ $stmt->boys }}</td>
                            <td>{{ $stmt->girls }}</td>
                            <td><strong>{{ $stmt->total }}</strong></td>
                        </tr>
                    @endif
                @endforeach
                
                {{-- Upper Primary Subtotal --}}
                @if($upperTotal > 0)
                <tr class="upper-subtotal-row">
                    <td colspan="2" class="cell-left"><strong>UPPER PRIMARY TOTAL (6th-8th)</strong></td>
                    <td><strong>{{ $upperBoys }}</strong></td>
                    <td><strong>{{ $upperGirls }}</strong></td>
                    <td><strong>{{ $upperTotal }}</strong></td>
                </tr>
                @endif
            @endif
            
            {{-- Grand Total --}}
            <tr class="grand-total-row">
                <td colspan="2" class="cell-left"><strong>GRAND TOTAL</strong></td>
                <td><strong>{{ $rollStatements->sum('boys') }}</strong></td>
                <td><strong>{{ $rollStatements->sum('girls') }}</strong></td>
                <td><strong>{{ $rollStatements->sum('total') }}</strong></td>
            </tr>
        </tbody>
    </table>

    {{-- Footer Signatures --}}
    <div class="footer" style="background: linear-gradient(120deg, var(--accent-light), #fff); border: 1px solid var(--border-color); border-radius: 6px; margin-top: 24px;">
        <div style="text-align:center; border-right: 1px dashed var(--border-color);">
            <div style="height: 60px;"></div>
            <strong>MDM Incharge</strong>
        </div>
        <div style="text-align:center;">
            <div style="height: 60px;"></div>
            <strong>Headmaster</strong>
        </div>
    </div>
    <div class="footer-note">
        Generated via MDMSeva | Date: {{ \Carbon\Carbon::parse($date)->format('F Y') }}
    </div>
</div>
</body>
</html>
