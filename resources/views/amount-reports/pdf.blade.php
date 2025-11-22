<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>MDM Amount Statement PDF</title>
    <style>
        @page { 
            size: A4 landscape;
            margin: 5mm;
        }
        
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Arial', 'Helvetica', sans-serif;
            font-size: 11px;
            margin: 0;
            line-height: 1.2;
        }

        /* Inner page wrapper to keep layout strictly within A4 content area */
        .page {
            width: 287mm;
            min-height: 190mm;
            padding: 5mm;
            border: 3px solid #000;
            box-sizing: border-box;
            position: relative;
        }
        
        /* Header Section */
        .report-header {
            text-align: center;
            margin-bottom: 10px;
            padding-bottom: 6px;
            border-bottom: 2px solid #000;
        }

        .state-name {
            font-size: 16pt;
            font-weight: bold;
            color: #000;
            margin-bottom: 2px;
            text-transform: uppercase;
            letter-spacing: 1px;
        }

        .district-zone-row {
            font-size: 12pt;
            margin: 2px 0;
            color: #000;
            font-weight: 600;
        }

        .heading-separator {
            margin: 0 8px;
            color: #000;
        }

        .school-name-wrapper {
            margin: 8px 0 10px;
        }

        .school-name-header {
            display: inline-block;
            padding: 7px 26px;
            border: 2px solid #000;
            border-radius: 999px;
            background: linear-gradient(120deg, #f5f5f5, #ffffff);
            font-size: 14pt;
            font-weight: 800;
            text-transform: uppercase;
            letter-spacing: 1.2px;
            color: #000;
            box-shadow: 0 3px 8px rgba(0, 0, 0, 0.12);
        }

        .single-line-info {
            font-size: 11pt;
            color: #000;
            margin-top: 2px;
            line-height: 1.2;
            font-weight: 600;
            text-align: center;
        }

        .single-line-info strong {
            color: #000;
            font-weight: bold;
        }
        
        h3, h4 { 
            margin: 3px 0; 
            text-align: center; 
            font-weight: bold;
        }
        h3 { font-size: 12pt; }
        h4 { font-size: 11pt; }
        
        table { 
            width: 100%; 
            border-collapse: collapse; 
            font-size: 10px; 
            margin-bottom: 4px; 
            table-layout: fixed;
        }
        table, th, td { border: 1px solid #000; }
        th, td { 
            padding: 2px 1px; 
            text-align: center; 
            vertical-align: middle;
            word-wrap: break-word;
        }
        th { 
            font-weight: bold; 
            font-size: 10px;
            background-color: #f0f0f0;
            white-space: normal;
            height: 30px;
        }
        
        td strong {
            font-weight: bold;
            font-size: 10px;
        }
        
        td small {
            font-size: 8px;
        }
        
        .section-title {
            font-size: 12pt;
            font-weight: bold;
            text-align: center;
            margin: 4px 0 3px 0;
            padding: 2px;
            background-color: #e0e0e0;
            border: 1px solid #000;
        }
        
        .certification {
            font-size: 11px;
            text-align: left;
            line-height: 1.4;
            margin-top: 10px;
            width: 100%;
        }
        
        .certification p {
            margin: 2px 0;
            font-size: 11px;
        }
        
        .certification strong {
            font-weight: bold;
            font-size: 11px;
        }
        
        .signatures {
            margin-top: 30px;
            display: table;
            width: 100%;
            font-size: 11px;
        }
        
        .signature-left {
            display: table-cell;
            width: 50%;
            text-align: left;
        }
        
        .signature-right {
            display: table-cell;
            width: 50%;
            text-align: right;
        }
        
        .signature-left strong,
        .signature-right strong {
            font-weight: bold;
            font-size: 11px;
        }

        /* Column Widths */
        .col-sno { width: 3%; }
        .col-month { width: 8%; }
        .col-roll { width: 5%; }
        .col-days { width: 5%; }
        .col-rice-ob { width: 6%; }
        .col-rice-lift { width: 7%; }
        .col-rice-con { width: 6%; }
        .col-rice-cb { width: 6%; }
        .col-exp { width: 9%; }
    </style>

    <style>
        {!! $themeCss ?? '' !!}
    </style>
</head>
<body>
    <div class="page">

    {{-- Header --}}
    <div class="report-header">
        <!-- First Row: State Name -->
        <div class="state-name">
            Government of {{ $user->state ?? 'N/A' }}
        </div>

        <!-- Second Row: District and Zone -->
        <div class="district-zone-row">
            District: {{ $user->district ?? 'N/A' }}
            <span class="heading-separator">|</span>
            Zone: {{ $user->zone ?? 'N/A' }}
            <span class="heading-separator">|</span>
            UDISE: {{ $user->udise ?? 'N/A' }}
        </div>

        <!-- Third Row: School Name -->
        <div class="school-name-wrapper">
            <div class="school-name-header">{{ strtoupper($user->school_name ?? 'School Name') }}</div>
        </div>

        <!-- Single Line: UDISE + Report Month + Title -->
        <div class="single-line-info">
            Report Month: {{ $report->month_name }} {{ $report->year }}
            <span class="heading-separator">|</span>
            Amount Statement of Mid-Day-Meals
        </div>
    </div>

    {{-- Upper Primary (Classes 6-8) Section --}}
    @if($totalStudentsMiddle > 0)
    <div class="section-title">UPPER PRIMARY (Classes VI - VIII)</div>
    <table>
        <colgroup>
            <col class="col-sno">
            <col class="col-month">
            <col class="col-roll">
            <col class="col-days">
            <col class="col-rice-ob">
            <col class="col-rice-lift">
            <col class="col-rice-con">
            <col class="col-rice-cb">
            <col class="col-exp">
            <col class="col-exp">
            <col class="col-exp">
            <col class="col-exp">
            <col class="col-exp">
            <col class="col-exp">
        </colgroup>
        <thead>
            <tr>
                <th rowspan="2">S. No</th>
                <th rowspan="2">Month</th>
                <th rowspan="2">Students Served</th>
                <th rowspan="2">No. of working Days</th>
                <th rowspan="2">OB of Rice</th>
                <th rowspan="2">Rice lifted{{ ($arrangedMiddle ?? 0) > 0 ? ' | Rice Arranged' : '' }}</th>
                <th rowspan="2">Rice consumed</th>
                <th rowspan="2">Closing Bal. of Rice</th>
                <th colspan="6">Expenditure as per format</th>
            </tr>
            <tr>
                <th>Pulses @ {{ number_format($pulsesVariableMiddle, 2) }}</th>
                <th>Vegetables @ {{ number_format($vegetablesVariableMiddle, 2) }}</th>
                <th>Oil/Fat @ {{ number_format($oilVariableMiddle, 2) }}</th>
                <th>Salt & condiments @ {{ number_format($saltVariableMiddle, 2) }}</th>
                <th>Fuel @ {{ number_format($fuelVariableMiddle, 2) }}</th>
                <th>Total @ {{ number_format($totalVariableMiddle, 2) }}</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td>1</td>
                <td>{{ $report->month_name }} {{ $report->year }}</td>
                <td><strong>{{ $totalStudentsMiddle }}</strong></td>
                <td><strong>{{ $workingDays }}</strong></td>
                <td><strong>{{ number_format($openingMiddle, 3) }}</strong></td>
                <td>
                    <strong>{{ number_format($liftedMiddle + $arrangedMiddle, 3) }}</strong>
                    @if($arrangedMiddle > 0)
                        <br><small>(Incl. arranged: {{ number_format($arrangedMiddle, 3) }})</small>
                    @endif
                </td>
                <td><strong>{{ number_format($riceConsumedMiddle, 3) }}</strong></td>
                <td><strong>{{ number_format($riceClosingMiddle, 3) }}</strong></td>
                <td><strong>{{ number_format($pulsesConsumedMiddle, 2) }}</strong></td>
                <td><strong>{{ number_format($vegetablesConsumedMiddle, 2) }}</strong></td>
                <td><strong>{{ number_format($oilConsumedMiddle, 2) }}</strong></td>
                <td><strong>{{ number_format($saltConsumedMiddle, 2) }}</strong></td>
                <td><strong>{{ number_format($fuelConsumedMiddle, 2) }}</strong></td>
                <td><strong>{{ number_format($totalExpenditureMiddle, 2) }}</strong></td>
            </tr>
        </tbody>
    </table>
    @endif

    {{-- Primary (Classes 1-5) Section --}}
    @if($totalStudentsPrimary > 0)
    <div class="section-title">PRIMARY (Classes I - V)</div>
    <table>
        <colgroup>
            <col class="col-sno">
            <col class="col-month">
            <col class="col-roll">
            <col class="col-days">
            <col class="col-rice-ob">
            <col class="col-rice-lift">
            <col class="col-rice-con">
            <col class="col-rice-cb">
            <col class="col-exp">
            <col class="col-exp">
            <col class="col-exp">
            <col class="col-exp">
            <col class="col-exp">
            <col class="col-exp">
        </colgroup>
        <thead>
            <tr>
                <th rowspan="2">S. No</th>
                <th rowspan="2">Month</th>
                <th rowspan="2">Students Served</th>
                <th rowspan="2">No. of working Days</th>
                <th rowspan="2">OB of Rice</th>
                <th rowspan="2">Rice lifted{{ ($arrangedPrimary ?? 0) > 0 ? ' | Rice Arranged' : '' }}</th>
                <th rowspan="2">Rice consumed</th>
                <th rowspan="2">Closing Bal. of Rice</th>
                <th colspan="6">Expenditure as per format</th>
            </tr>
            <tr>
                <th>Pulses @ {{ number_format($pulsesVariablePrimary, 2) }}</th>
                <th>Vegetables @ {{ number_format($vegetablesVariablePrimary, 2) }}</th>
                <th>Oil/Fat @ {{ number_format($oilVariablePrimary, 2) }}</th>
                <th>Salt & condiments @ {{ number_format($saltVariablePrimary, 2) }}</th>
                <th>Fuel @ {{ number_format($fuelVariablePrimary, 2) }}</th>
                <th>Total @ {{ number_format($totalVariablePrimary, 2) }}</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td>1</td>
                <td>{{ $report->month_name }} {{ $report->year }}</td>
                <td><strong>{{ $totalStudentsPrimary }}</strong></td>
                <td><strong>{{ $workingDays }}</strong></td>
                <td><strong>{{ number_format($openingPrimary, 3) }}</strong></td>
                <td>
                    <strong>{{ number_format($liftedPrimary + $arrangedPrimary, 3) }}</strong>
                    @if($arrangedPrimary > 0)
                        <br><small>(Incl. arranged: {{ number_format($arrangedPrimary, 3) }})</small>
                    @endif
                </td>
                <td><strong>{{ number_format($riceConsumedPrimary, 3) }}</strong></td>
                <td><strong>{{ number_format($riceClosingPrimary, 3) }}</strong></td>
                <td><strong>{{ number_format($pulsesConsumedPrimary, 2) }}</strong></td>
                <td><strong>{{ number_format($vegetablesConsumedPrimary, 2) }}</strong></td>
                <td><strong>{{ number_format($oilConsumedPrimary, 2) }}</strong></td>
                <td><strong>{{ number_format($saltConsumedPrimary, 2) }}</strong></td>
                <td><strong>{{ number_format($fuelConsumedPrimary, 2) }}</strong></td>
                <td><strong>{{ number_format($totalExpenditurePrimary, 2) }}</strong></td>
            </tr>
        </tbody>
    </table>
    @endif

    {{-- Rice Summary Table --}}
    <div style="width: 45%;">
        <div class="section-title" style="margin-top: 5px;">Rice Summary Statement</div>
        <table>
            <thead>
                <tr>
                    <th>Category</th>
                    <th>Rice Lifted{{ (($arrangedPrimary ?? 0) + ($arrangedMiddle ?? 0)) > 0 ? '/Rice Arranged' : '' }} kg</th>
                    <th>Opening Balance (kg)</th>
                    <th>Rice Consumed (kg)</th>
                    <th>Rice Balance (kg)</th>
                </tr>
            </thead>
            <tbody>
                @if($totalStudentsPrimary > 0)
                <tr>
                    <td><strong>Primary</strong></td>
                    <td>
                        <strong>{{ number_format($liftedPrimary + $arrangedPrimary, 3) }}</strong>
                        @if($arrangedPrimary > 0)
                            <br><small>(Incl. arranged: {{ number_format($arrangedPrimary, 3) }})</small>
                        @endif
                    </td>
                    <td><strong>{{ number_format($openingPrimary, 3) }}</strong></td>
                    <td><strong>{{ number_format($riceConsumedPrimary, 3) }}</strong></td>
                    <td><strong>{{ number_format($riceClosingPrimary, 3) }}</strong></td>
                </tr>
                @endif
                @if($totalStudentsMiddle > 0)
                <tr>
                    <td><strong>Upper Primary</strong></td>
                    <td>
                        <strong>{{ number_format($liftedMiddle + $arrangedMiddle, 3) }}</strong>
                        @if($arrangedMiddle > 0)
                            <br><small>(Incl. arranged: {{ number_format($arrangedMiddle, 3) }})</small>
                        @endif
                    </td>
                    <td><strong>{{ number_format($openingMiddle, 3) }}</strong></td>
                    <td><strong>{{ number_format($riceConsumedMiddle, 3) }}</strong></td>
                    <td><strong>{{ number_format($riceClosingMiddle, 3) }}</strong></td>
                </tr>
                @endif
                <tr style="font-weight: bold; background-color: #f0f0f0;">
                    <td><strong>Total</strong></td>
                    <td>
                        <strong>{{ number_format(($liftedPrimary + $arrangedPrimary) + ($liftedMiddle + $arrangedMiddle), 3) }}</strong>
                        @if($arrangedTotal > 0)
                            <br><small>(Incl. arranged: {{ number_format($arrangedTotal, 3) }})</small>
                        @endif
                    </td>
                    <td><strong>{{ number_format($openingPrimary + $openingMiddle, 3) }}</strong></td>
                    <td><strong>{{ number_format($riceConsumedPrimary + $riceConsumedMiddle, 3) }}</strong></td>
                    <td><strong>{{ number_format($riceClosingPrimary + $riceClosingMiddle, 3) }}</strong></td>
                </tr>
            </tbody>
        </table>
    </div>

    {{-- Certification Section --}}
    <div class="certification">
        <p><strong>It is certified that:</strong></p>
        <p><strong>1.</strong> Rice lifted <strong>{{ number_format(($liftedPrimary + $arrangedPrimary) + ($liftedMiddle + $arrangedMiddle), 3) }} kg</strong> quantity of rice (including arranged <strong>{{ number_format($arrangedTotal, 3) }} kg</strong>) has been made available under the Mid Day Meals Programme out of which <strong>{{ number_format($riceConsumedPrimary + $riceConsumedMiddle, 3) }} kg</strong> consumed.</p>
        <p><strong>2.</strong> Quantity has been consumed in Presence of VEC / Mid Day meals students committee leaving a balance of <strong>{{ number_format($riceClosingPrimary + $riceClosingMiddle, 3) }} Kgs.</strong></p>
        <p><strong>3.</strong> Total <strong>{{ number_format($totalStudentsPrimary, 0) }}</strong> primary + <strong>{{ number_format($totalStudentsMiddle, 0) }}</strong> middle students have been served. Total expenditure of <strong>Rs{{ number_format($totalExpenditurePrimary + $totalExpenditureMiddle, 2) }}</strong> has been utilized on account of cooking cost.</p>
    </div>

    {{-- Footer Signatures --}}
    <div class="signatures">
        <div class="signature-left">
            __________________________<br>
            <strong>Signature of MDM Incharge</strong>
        </div>
        <div class="signature-right">
            __________________________<br>
            <strong>Signature of Headmaster</strong>
        </div>
    </div>

    </div>

</body>
</html>