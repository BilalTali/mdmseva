<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Roll Statement - <?php echo e($date); ?></title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        @page {
            size: A4;
            margin: 0;
        }
        
        body {
            font-family: 'DejaVu Sans', sans-serif;
            font-size: 12px;
            color: #333;
            line-height: 1.3;
            padding: 0;
            margin: 0;
            width: 210mm;
            height: 297mm;
            overflow: hidden;
        }
        
        .document-border {
            padding: 0;
            position: relative;
            width: 100%;
            max-width: 210mm;
            height: 297mm;
            margin: 0 auto;
            background: white;
            display: flex;
            flex-direction: column;
        }
        
        .decorative-top {
            height: 4px;
            background: linear-gradient(to right, #2563eb, #9333ea, #2563eb);
        }
        
        .decorative-bottom {
            height: 4px;
            background: linear-gradient(to right, #2563eb, #9333ea, #2563eb);
            margin-top: auto;
        }
        
        .header {
            text-align: center;
            padding: 8px 15px 6px 15px;
            border-bottom: 2px solid #000;
        }
        
        .header h1 {
            font-size: 18px;
            font-weight: bold;
            margin-bottom: 3px;
            color: #000;
            letter-spacing: 1px;
        }
        
        .header-line {
            height: 2px;
            width: 80px;
            background: linear-gradient(to right, #2563eb, #9333ea);
            margin: 5px auto;
            border-radius: 2px;
        }
        
        .location-grid {
            display: table;
            width: 100%;
            margin: 6px 0;
        }
        
        .location-item {
            display: table-cell;
            width: 33.33%;
            padding: 4px;
            text-align: center;
            border: 1px solid #666;
        }
        
        .location-item .label {
            font-size: 8px;
            color: #666;
            font-weight: bold;
        }
        
        .location-item .value {
            font-size: 9px;
            font-weight: bold;
            color: #000;
            margin-top: 2px;
        }
        
        .school-box {
            border: 1px solid #666;
            padding: 5px;
            background-color: #f5f5f5;
            margin: 6px 0;
            text-align: center;
        }
        
        .school-box .school-name {
            font-size: 12px;
            font-weight: bold;
            color: #000;
            margin-bottom: 2px;
        }
        
        .school-box .udise {
            font-size: 8px;
            color: #666;
        }
        
        .school-box .udise strong {
            color: #000;
        }
        
        .date-info {
            display: table;
            width: 100%;
            margin-top: 6px;
            font-size: 9px;
        }
        
        .date-info .left {
            display: table-cell;
            text-align: left;
        }
        
        .date-info .right {
            display: table-cell;
            text-align: right;
        }
        
        .date-info strong {
            font-weight: bold;
            color: #000;
        }
        
        .content-section {
            padding: 10px 15px;
            flex: 1;
        }
        
        table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 0;
        }
        
        table th {
            background-color: #1f2937;
            color: white;
            padding: 7px 5px;
            text-align: left;
            font-size: 10px;
            font-weight: bold;
            border: 2px solid #000;
        }
        
        table th.text-center {
            text-align: center;
        }
        
        table td {
            padding: 5px;
            border: 1px solid #666;
            font-size: 10px;
        }
        
        table td.text-center {
            text-align: center;
        }
        
        table td.font-bold {
            font-weight: bold;
        }
        
        .primary-total-row {
            background-color: #dbeafe !important;
            font-weight: bold;
        }
        
        .primary-total-row td {
            border: 1px solid #666 !important;
            font-weight: bold;
            text-align: right;
            padding: 6px 5px;
        }
        
        .upper-primary-total-row {
            background-color: #d1fae5 !important;
            font-weight: bold;
        }
        
        .upper-primary-total-row td {
            border: 1px solid #666 !important;
            font-weight: bold;
            text-align: right;
            padding: 6px 5px;
        }
        
        .grand-total-row {
            background: linear-gradient(to right, #e9d5ff, #f3e8ff, #e9d5ff) !important;
            font-weight: bold;
            font-size: 11px;
        }
        
        .grand-total-row td {
            border: 2px solid #4b5563 !important;
            font-weight: bold;
            text-align: right;
            padding: 7px 5px;
        }
        
        .footer {
            padding: 10px 15px;
            border-top: 2px solid #ddd;
        }
        
        .signature-section {
            display: table;
            width: 100%;
            margin-top: 20px;
        }
        
        .signature-box {
            display: table-cell;
            width: 50%;
            padding: 10px;
            text-align: center;
        }
        
        .signature-line {
            border-top: 2px solid #000;
            margin-top: 35px;
            padding-top: 6px;
            font-size: 10px;
            font-weight: bold;
        }
        
        .footer-note {
            font-size: 8px;
            color: #666;
            margin-top: 12px;
            text-align: center;
            font-style: italic;
        }
    </style>
</head>
<body>
    <div class="document-border">
        <!-- Decorative Top Border -->
        <div class="decorative-top"></div>
        
        <!-- Header Section -->
        <div class="header" >
            <h1>OFFICE OF THE HEADMASTER -<?php echo e(strtoupper($user->school_name)); ?></h1>
            <div class="header-line"></div>
           <h2>
    <span style="float: left;">Ref :_____________</span>
    <span style="float: right;"><?php echo e(\Carbon\Carbon::parse($date)->format('d-M-Y')); ?></span>
    <div style="clear: both;"></div>
</h2>
            <!-- Location Grid -->
            <div class="location-grid">
                <div class="location-item">
                    <div class="label">STATE</div>
                    <div class="value"><?php echo e($user->state ?? 'JAMMU & KASHMIR'); ?></div>
                </div>
                <div class="location-item">
                    <div class="label">DISTRICT</div>
                    <div class="value"><?php echo e(strtoupper($user->district ?? 'NOT SET')); ?></div>
                </div>
                <div class="location-item">
                    <div class="label">ZONE</div>
                    <div class="value"><?php echo e(strtoupper($user->zone ?? 'NOT SET')); ?></div>
                </div>
            </div>
            
            <!-- School Information -->
            <div class="school-box">
                <div class="school-name"><?php echo e(strtoupper($user->school_name)); ?></div>
                <div class="udise">UDISE: <strong><?php echo e($user->udise); ?></strong></div>
            </div>
            
            <!-- Date Information -->
            <div class="date-info">
                <div class="left">
                    <span style="color: #666;">Academic Year:</span>
                    <strong><?php echo e($academic_year); ?></strong>
                </div>
                <div class="right">
                    <span style="color: #666;">Date:</span>
                    <strong><?php echo e(\Carbon\Carbon::parse($date)->format('d-M-Y')); ?></strong>
                </div>
            </div>
        </div>

        <!-- Roll Statement Table -->
        <div class="content-section">
            <table>
                <thead>
                    <tr>
                        <th style="width: 10%;">S.No</th>
                        <th style="width: 30%;">Class</th>
                        <th class="text-center" style="width: 20%;">Boys</th>
                        <th class="text-center" style="width: 20%;">Girls</th>
                        <th class="text-center" style="width: 20%;">Total</th>
                    </tr>
                </thead>
                <tbody>
                    <?php
                        $classOrder = ['kg', '1', '2', '3', '4', '5', '6', '7', '8'];
                        $classLabels = [
                            'kg' => 'KG',
                            '1' => '1st',
                            '2' => '2nd',
                            '3' => '3rd',
                            '4' => '4th',
                            '5' => '5th',
                            '6' => '6th',
                            '7' => '7th',
                            '8' => '8th'
                        ];
                        $sortedStatements = $rollStatements->sortBy(function($statement) use ($classOrder) {
                            return array_search(strtolower($statement->class), $classOrder);
                        });
                        $counter = 1;
                    ?>
                    
                    <?php $__currentLoopData = $sortedStatements; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $statement): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
                    <tr>
                        <td class="text-center"><?php echo e($counter++); ?></td>
                        <td class="font-bold"><?php echo e($classLabels[strtolower($statement->class)] ?? $statement->class); ?></td>
                        <td class="text-center"><?php echo e($statement->boys); ?></td>
                        <td class="text-center"><?php echo e($statement->girls); ?></td>
                        <td class="text-center font-bold"><?php echo e($statement->total); ?></td>
                    </tr>
                    
                    <?php if(strtolower($statement->class) === '5'): ?>
                    <!-- Primary Total Row -->
                    <tr class="primary-total-row">
                        <td colspan="2">PRIMARY TOTAL (KG - 5th):</td>
                        <td class="text-center"><?php echo e($primaryTotalBoys); ?></td>
                        <td class="text-center"><?php echo e($primaryTotalGirls); ?></td>
                        <td class="text-center"><?php echo e($primaryGrandTotal); ?></td>
                    </tr>
                    <?php endif; ?>
                    <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>
                    
                    <?php if($upperPrimaryStatements->isNotEmpty()): ?>
                    <!-- Upper Primary Total Row -->
                    <tr class="upper-primary-total-row">
                        <td colspan="2">UPPER PRIMARY TOTAL (6th - 8th):</td>
                        <td class="text-center"><?php echo e($upperPrimaryTotalBoys); ?></td>
                        <td class="text-center"><?php echo e($upperPrimaryTotalGirls); ?></td>
                        <td class="text-center"><?php echo e($upperPrimaryGrandTotal); ?></td>
                    </tr>
                    <?php endif; ?>
                    
                    <!-- Grand Total Row -->
                    <tr class="grand-total-row">
                        <td colspan="2">GRAND TOTAL:</td>
                        <td class="text-center"><?php echo e($totalBoys); ?></td>
                        <td class="text-center"><?php echo e($totalGirls); ?></td>
                        <td class="text-center"><?php echo e($grandTotal); ?></td>
                    </tr>
                </tbody>
            </table>
        </div>

        <!-- Footer with Signatures -->
        <div class="footer">
            <div class="signature-section">
                <div class="signature-box">
                    <div class="signature-line">
                        Prepared By<br>
                        (Teacher/Staff)
                    </div>
                </div>
                <div class="signature-box">
                    <div class="signature-line">
                        Verified By<br>
                        (Head of Institution)
                    </div>
                </div>
            </div>
            
            <div class="footer-note">
                This is a computer-generated document. No signature is required.<br>
                Generated on: <?php echo e(\Carbon\Carbon::now()->format('d-M-Y h:i A')); ?>

            </div>
        </div>

        <!-- Decorative Bottom Border -->
        <div class="decorative-bottom"></div>
    </div>
</body>
</html><?php /**PATH C:\Users\TASLEEMAH\Documents\mdmseva\resources\views/pdf/roll-statement.blade.php ENDPATH**/ ?>