<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Roll Statement - {{ $academic_year }}</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=Inter:wght@400;600;700&display=swap');

        @page { 
            size: A4 portrait; 
            margin: 20mm;
        }

        body {
            font-family: 'Inter', sans-serif;
        }

        .content-wrapper {
            width: 100%;
            margin: 0 auto;
        }
        
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        .report-header {
            text-align: center;
            margin-bottom: 25px;
            border-bottom: 2px solid #e2e8f0;
            padding-bottom: 20px;
        }

        .state-name {
            font-family: 'Playfair Display', serif;
            font-size: 22pt;
            font-weight: 700;
            color: #b91c1c; /* Red 700 */
            text-transform: uppercase;
            margin-bottom: 8px;
            margin-top: 40px; /* Added top spacing */
            letter-spacing: 0.5px;
            line-height: 1.2;
        }

        .district-zone-row {
            font-size: 10pt;
            color: #1e40af; /* Indigo 800 */
            font-weight: 600;
            margin-bottom: 12px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        .heading-separator {
            margin: 0 10px;
            color: #cbd5e1; /* Slate 300 */
            font-weight: 300;
        }

        .school-name-wrapper {
            margin: 15px 0;
        }

        .school-name-header {
            display: inline-block;
            padding: 10px 25px;
            background-color: #eff6ff; /* Blue 50 */
            border-radius: 8px;
            font-size: 14pt;
            font-weight: 800;
            text-transform: uppercase;
            color: #1e3a8a; /* Blue 900 */
            border: 1px solid #dbeafe; /* Blue 100 */
            box-shadow: 0 2px 4px rgba(0,0,0,0.05);
        }

        .single-line-info {
            font-size: 10pt;
            font-weight: 500;
            color: #475569; /* Slate 600 */
            margin-top: 8px;
            background-color: #f8fafc;
            display: inline-block;
            padding: 4px 15px;
            border-radius: 20px;
            border: 1px solid #e2e8f0;
        }
        
        h3 {
            font-size: 12pt;
            margin-top: 25px;
            margin-bottom: 15px;
            color: #b91c1c; /* Red 700 */
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 1px;
            text-align: center;
            border-bottom: 1px solid #fee2e2;
            display: inline-block;
            padding-bottom: 5px;
            position: relative;
            left: 50%;
            transform: translateX(-50%);
        }
        
        /* Tables */
        table {
            width: 90%; /* Reduced width for side margins */
            margin: 0 auto 20px auto; /* Center table */
            border-collapse: collapse;
            font-size: 10pt;
            background-color: #fff;
            border: 1px solid #cbd5e1;
            box-shadow: 0 1px 3px rgba(0,0,0,0.05);
        }
        
        th, td {
            padding: 10px 12px;
            text-align: center;
            border: 1px solid #e2e8f0;
        }
        
        th {
            background-color: #f1f5f9; /* Slate 100 */
            color: #0f172a; /* Slate 900 */
            font-weight: 700;
            font-size: 9pt;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            border-bottom: 2px solid #94a3b8;
        }
        
        td {
            color: #334155;
        }

        .cell-left {
            text-align: left;
            padding-left: 20px;
        }

        .class-cell {
            text-align: center;
            font-weight: 600;
            color: #1e40af;
        }

        .class-pill {
            /* Removed pill style for cleaner table look, kept class for targeting */
            background: none;
            border: none;
            padding: 0;
            font-size: 10pt;
        }

        /* Subtotal Rows */
        .primary-subtotal-row, .upper-subtotal-row {
            background-color: #eff6ff; /* Blue 50 */
            font-weight: 700;
            color: #1e3a8a;
        }
        
        .grand-total-row {
            background-color: #f0fdf4; /* Green 50 */
            font-weight: 800;
            color: #14532d; /* Green 900 */
            border-top: 2px solid #166534;
        }

        .footer {
            width: 90%;
            display: table;
            margin: 60px auto 0 auto;
        }

        .footer > div {
            display: table-cell;
            width: 50%;
            vertical-align: top;
        }

        .signature-box {
            border-top: 2px solid #94a3b8;
            width: 70%;
            padding-top: 10px;
            font-weight: 600;
            color: #1e293b;
        }
        
        /* Print Optimization */
        @media print {
            body {
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
            }
        }
    </style>
</head>
<body class="theme-{{ $theme ?? 'bw' }}">
<div class="content-wrapper">

    @php
        // Ensure rollStatements is a collection
        $rollStatements = $rollStatements ?? collect([]);

        // Use lowercase class values as stored in database
        $primaryClassNames = ['kg', '1', '2', '3', '4', '5'];
        $upperClassNames = ['6', '7', '8'];
        
        // Group roll statements by level
        $primaryStatements = $rollStatements->filter(function($stmt) use ($primaryClassNames) {
            return in_array(strtolower($stmt->class ?? ''), $primaryClassNames);
        });
        
        $upperStatements = $rollStatements->filter(function($stmt) use ($upperClassNames) {
            return in_array(strtolower($stmt->class ?? ''), $upperClassNames);
        });
        
        $showPrimary = $primaryStatements->count() > 0;
        $showUpper = $upperStatements->count() > 0;
    @endphp

        <div class="report-header">
            <h1 class="state-name">Government of Jammu and Kashmir</h1>
            
            <div class="district-zone-row">
                District: {{ $user->district->name ?? $user->district ?? 'N/A' }} 
                <span class="heading-separator">|</span>
                Zone: {{ $user->zone->name ?? $user->zone ?? 'N/A' }} 
                <span class="heading-separator">|</span>
                UDISE: {{ $user->udise_code ?? $user->udise ?? 'N/A' }}
            </div>
            
            <div class="school-name-wrapper">
                <div class="school-name-header">
                    {{ strtoupper($user->school_name ?? 'School Name') }}
                </div>
            </div>
            
            <div class="single-line-info">
                Monthly Roll Statement <span class="heading-separator">•</span> 
                Academic Year: {{ $academic_year }} <span class="heading-separator">•</span> 
                Date: {{ \Carbon\Carbon::parse($date)->format('F d, Y') }}
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
    <div class="footer">
        <div style="text-align: left;">
            <div class="signature-box">
                <div style="height: 40px;"></div>
                <strong> Admission Incharge</strong>
            </div>
        </div>
        <div style="text-align: right;">
            <div class="signature-box" style="margin-left: auto;">
                <div style="height: 40px;"></div>
                <strong> Head of Institution</strong>
            </div>
        </div>
    </div>
    
</div>
</body>
</html>
