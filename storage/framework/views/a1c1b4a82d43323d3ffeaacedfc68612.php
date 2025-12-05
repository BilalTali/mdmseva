
<?php
    // Helper function to convert number to words (Indian format)
    function numberToWords($number) {
        $ones = ['', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine',
                 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen',
                 'seventeen', 'eighteen', 'nineteen'];
        
        $tens = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];
        
        if ($number == 0) return 'zero';
        
        $number = (int) $number;
        
        if ($number < 0) {
            return 'minus ' . numberToWords(abs($number));
        }
        
        if ($number < 20) {
            return $ones[$number];
        }
        
        if ($number < 100) {
            return $tens[(int)($number / 10)] . (($number % 10 != 0) ? ' ' . $ones[$number % 10] : '');
        }
        
        if ($number < 1000) {
            return $ones[(int)($number / 100)] . ' hundred' . (($number % 100 != 0) ? ' and ' . numberToWords($number % 100) : '');
        }
        
        if ($number < 100000) {
            return numberToWords((int)($number / 1000)) . ' thousand' . (($number % 1000 != 0) ? ' ' . numberToWords($number % 1000) : '');
        }
        
        if ($number < 10000000) {
            return numberToWords((int)($number / 100000)) . ' lakh' . (($number % 100000 != 0) ? ' ' . numberToWords($number % 100000) : '');
        }
        
        return numberToWords((int)($number / 10000000)) . ' crore' . (($number % 10000000 != 0) ? ' ' . numberToWords($number % 10000000) : '');
    }

    // Get theme from request or default to 'blue'
    $theme = request('theme', 'blue');
    
    // Define theme colors
    $themeColors = [
        'bw' => [
            'primary' => '#000000',
            'secondary' => '#333333',
            'light' => '#f5f5f5',
            'lighter' => '#ffffff',
            'border' => '#666666',
            'text' => '#000000',
        ],
        'blue' => [
            'primary' => '#1e40af',
            'secondary' => '#2563eb',
            'light' => '#eff6ff',
            'lighter' => '#dbeafe',
            'border' => '#2563eb',
            'text' => '#1e40af',
        ],
        'green' => [
            'primary' => '#166534',
            'secondary' => '#16a34a',
            'light' => '#f0fdf4',
            'lighter' => '#dcfce7',
            'border' => '#16a34a',
            'text' => '#166534',
        ],
        'purple' => [
            'primary' => '#6b21a8',
            'secondary' => '#9333ea',
            'light' => '#faf5ff',
            'lighter' => '#f3e8ff',
            'border' => '#9333ea',
            'text' => '#6b21a8',
        ],
    ];
    
    $colors = $themeColors[$theme] ?? $themeColors['blue'];
    $billDateDisplay = $bill->bill_date
        ? $bill->bill_date->format('d F Y')
        : $bill->created_at->format('d F Y');
?>
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title><?php echo e($bill->getTypeLabel()); ?> - <?php echo e($bill->getBillNumber()); ?></title>
    <style>
        @page { 
            size: A4 portrait; 
            margin: 12mm 15mm 12mm 15mm; 
        }
        
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'DejaVu Sans', 'Arial', sans-serif;
            font-size: 7.5pt;
            line-height: 1.25;
            color: #1f2937;
            background: <?php echo e($colors['light']); ?>;
            border: 4px solid <?php echo e($colors['border']); ?>;
            padding: 8mm;
        }
        
        /* Professional Header with Border Design */
        .header-border {
            border: 2px solid <?php echo e($colors['border']); ?>;
            border-radius: 0;
            padding: 0;
            margin-bottom: 0;
            margin-left: 5mm;
            margin-right: 5mm;
            position: relative;
            overflow: hidden;
        }
        
        .header-top-bar {
            background: linear-gradient(90deg, <?php echo e($colors['primary']); ?> 0%, <?php echo e($colors['secondary']); ?> 50%, <?php echo e($colors['secondary']); ?> 100%);
            padding: 2px 0;
        }
        
        .header-content {
            padding: 8px 12px;
            background: <?php echo e($colors['light']); ?>;
            border-bottom: 2px solid <?php echo e($colors['border']); ?>;
        }
        
        .header-title {
            text-align: center;
            font-size: 16pt;
            font-weight: bold;
            color: <?php echo e($colors['text']); ?>;
            margin-bottom: 3px;
            padding-bottom: 3px;
            border-bottom: 2px solid <?php echo e($colors['border']); ?>;
            text-transform: uppercase;
            letter-spacing: 0.8px;
        }
        
        .header-subtitle {
            text-align: center;
            font-size: 7pt;
            color: #374151;
            margin-bottom: 2px;
            line-height: 1.3;
            font-weight: 500;
        }
        
        .header-subtitle .deals-line {
            font-weight: 700;
            color: <?php echo e($colors['text']); ?>;
            margin-top: 2px;
            font-size: 7pt;
            letter-spacing: 0.4px;
        }
        
        .header-info {
            display: table;
            width: 100%;
            margin-top: 5px;
            padding-top: 5px;
            border-top: 1px dashed <?php echo e($colors['border']); ?>;
        }
        
        .header-info > div {
            display: table-cell;
            text-align: center;
            padding: 2px;
            font-size: 6.5pt;
            color: <?php echo e($colors['secondary']); ?>;
        }
        
        .header-info-2col > div {
            width: 50%;
        }
        
        .header-info-3col > div {
            width: 33.33%;
        }
        
        .header-info-4col > div {
            width: 25%;
        }
        
        .header-info strong {
            display: block;
            font-weight: 700;
            margin-bottom: 1px;
            color: <?php echo e($colors['text']); ?>;
            font-size: 7pt;
        }
        
        .invoice-badge {
            background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
            color: #1a1717ff;
            padding: 6px 12px;
            text-align: center;
            font-weight: bold;
            font-size: 9pt;
            letter-spacing: 0.8px;
        }
        
        /* Content Wrapper for Consistent Margins */
        .content-wrapper {
            padding-left: 5mm;
            padding-right: 5mm;
        }
        
        /* Bill Section with Modern Cards */
        .bill-section {
            display: table;
            width: 100%;
            margin-top: 0;
            margin-bottom: 0;
        }
        
        .bill-to, .invoice-info {
            display: table-cell;
            width: 50%;
            vertical-align: top;
            padding: 8px;
            border: 2px solid <?php echo e($colors['border']); ?>;
            border-top: none;
            position: relative;
        }
        
        .bill-to {
            margin-right: 4px;
            background: <?php echo e($colors['light']); ?>;
            border-left: 3px solid <?php echo e($colors['secondary']); ?>;
        }
        
        .invoice-info {
            margin-left: 4px;
            background: <?php echo e($colors['lighter']); ?>;
            border-left: 3px solid <?php echo e($colors['primary']); ?>;
        }
        
        .section-title {
            font-size: 8.5pt;
            font-weight: bold;
            color: <?php echo e($colors['text']); ?>;
            margin-bottom: 5px;
            padding-bottom: 3px;
            border-bottom: 2px solid <?php echo e($colors['border']); ?>;
            text-transform: uppercase;
            letter-spacing: 0.6px;
        }
        
        .invoice-info .section-title {
            color: <?php echo e($colors['text']); ?>;
            border-bottom-color: <?php echo e($colors['primary']); ?>;
        }
        
        .info-line {
            margin-bottom: 3px;
            font-size: 6.5pt;
            line-height: 1.4;
            color: #374151;
        }
        
        .info-line strong {
            color: #0f172a;
            font-weight: 700;
        }
        
        /* Modern Table Design */
        table { 
            width: 100%;
            border-collapse: collapse; 
            margin-top: 0;
            margin-bottom: 0;
            border: 2px solid <?php echo e($colors['border']); ?>;
        }
        
        table thead {
            background-color: <?php echo e($colors['primary']); ?>;
        }
        
        table thead th {
            padding: 8px 6px;
            text-align: left;
            font-size: 8pt;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.3px;
            border-right: 1px solid #ecdfdfff;
            color: #e0d7d7ff;
            background-color: <?php echo e($colors['primary']); ?>;
        }
        
        table thead th:first-child {
            width: 8%;
            text-align: center;
        }
        
        table thead th:nth-child(2) {
            width: 30%;
        }
        
        table thead th:nth-child(3) {
            width: 18%;
            text-align: right;
        }
        
        table thead th:nth-child(4) {
            width: 18%;
            text-align: right;
        }
        
        table thead th:nth-child(5) {
            width: 16%;
            text-align: right;
        }
        
        table thead th:nth-child(6) {
            width: 10%;
            text-align: center;
        }
        
        table thead th:last-child {
            border-right: none;
        }
        
        table tbody td {
            padding: 5px 6px;
            border: 1px solid <?php echo e($colors['lighter']); ?>;
            font-size: 7pt;
            color: #374151;
        }
        
        table tbody tr:nth-child(odd) {
            background-color: <?php echo e($colors['light']); ?>;
        }
        
        table tbody tr:nth-child(even) {
            background-color: #f5f0f0ff;
        }
        
        /* Totals Row within Table - Override all backgrounds */
        table tbody tr.total-row {
            background: linear-gradient(135deg, <?php echo e($colors['primary']); ?> 0%, <?php echo e($colors['secondary']); ?> 100%) !important;
        }
        
        table tbody tr.total-row td {
            padding: 7px 8px;
            font-size: 9pt;
            font-weight: 700;
            background: linear-gradient(135deg, <?php echo e($colors['primary']); ?> 0%, <?php echo e($colors['secondary']); ?> 100%) !important;
            color: #1a1818ff !important;
            border-top: 2px solid <?php echo e($colors['primary']); ?>;
            border: 1px solid <?php echo e($colors['primary']); ?> !important;
        }
        
        /* Amount in Words Box */
        .amount-words-box {
            margin-top: 0;
            padding: 8px;
            border: 2px solid <?php echo e($colors['border']); ?>;
            border-top: none;
            background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
            font-size: 7.5pt;
            font-weight: 700;
            color: #78350f;
        }
        
        /* Bill Details Box */
        .bill-details-box {
            margin-top: 0;
            padding: 8px;
            border: 2px solid <?php echo e($colors['border']); ?>;
            border-top: none;
            background: linear-gradient(135deg, <?php echo e($colors['light']); ?> 0%, <?php echo e($colors['lighter']); ?> 100%);
            border-left: 3px solid <?php echo e($colors['secondary']); ?>;
        }
        
        .bill-details-title {
            font-size: 8pt;
            font-weight: bold;
            color: <?php echo e($colors['text']); ?>;
            margin-bottom: 4px;
            padding-bottom: 3px;
            border-bottom: 2px solid <?php echo e($colors['border']); ?>;
            text-transform: uppercase;
            letter-spacing: 0.4px;
        }
        
        .bill-details-box ul {
            list-style: none;
            padding-left: 0;
            margin: 0;
        }
        
        .bill-details-box li {
            margin-bottom: 3px;
            padding-left: 10px;
            position: relative;
            line-height: 1.4;
            font-size: 6.5pt;
        }
        
        .bill-details-box li:before {
            content: "▪";
            color: <?php echo e($colors['secondary']); ?>;
            font-weight: bold;
            position: absolute;
            left: 0;
            font-size: 9pt;
        }
        
        /* Signature Sections */
        .signature-section {
            display: table;
            width: 100%;
            margin-top: 8px;
        }
        
        .vendor-signature, .institution-verification {
            display: table-cell;
            width: 50%;
            vertical-align: top;
            padding: 10px;
            border: 2px solid <?php echo e($colors['border']); ?>;
            min-height: 80px;
        }
        
        .vendor-signature {
            margin-right: 4px;
            background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
            border-left: 3px solid #f59e0b;
        }
        
        .institution-verification {
            margin-left: 4px;
            background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
            border-left: 3px solid <?php echo e($colors['primary']); ?>;
        }
        
        .signature-box-title {
            font-size: 8.5pt;
            font-weight: bold;
            margin-bottom: 6px;
            padding-bottom: 3px;
            border-bottom: 2px solid <?php echo e($colors['border']); ?>;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        
        .vendor-signature .signature-box-title {
            color: #92400e;
            border-bottom-color: #f59e0b;
        }
        
        .institution-verification .signature-box-title {
            color: <?php echo e($colors['text']); ?>;
            border-bottom-color: <?php echo e($colors['primary']); ?>;
        }
        
        .signature-field {
            margin-top: 8px;
            padding-top: 15px;
            border-top: 1px dashed #9ca3af;
        }
        
        .signature-field-label {
            font-size: 7pt;
            font-weight: bold;
            color: #374151;
            margin-bottom: 2px;
        }
        
        .signature-field-value {
            font-size: 7.5pt;
            font-weight: bold;
            color: #0f172a;
        }
        
        .verification-fields {
            margin-top: 6px;
        }
        
        .verification-line {
            margin-bottom: 6px;
            font-size: 6.5pt;
            color: #374151;
        }
        
        .verification-line strong {
            color: #0f172a;
            font-weight: 700;
        }
        
        .signature-line {
            display: inline-block;
            width: 140px;
            border-bottom: 1px solid #6b7280;
            margin-left: 4px;
        }
        
        /* Utility Classes */
        .text-center { text-align: center; }
        .text-right { text-align: right; }
        .text-left { text-align: left; }
        .font-bold { font-weight: bold; }
        
        /* Print Optimization */
        @media print {
            body {
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
            }
        }
    </style>
</head>
<body>

    <!-- Vendor Header Section -->
    <div class="header-border">
        <div class="header-top-bar"></div>
        <div class="header-content">
            <div class="header-title"><?php echo e(strtoupper($bill->shop_name)); ?></div>
            <div class="header-subtitle">
                <div><?php echo e(strtoupper($bill->address)); ?></div>
                <?php if(!empty($bill->deals_with)): ?>
                    <div class="deals-line">Deals With: <span><?php echo e($bill->deals_with); ?></span></div>
                <?php endif; ?>

            </div>

            <?php
                $headerInfoCount = 2; // Bill Date and Period are always shown
                if (!empty($bill->phone)) $headerInfoCount++;
                if (!empty($bill->shop_gstin)) $headerInfoCount++;
                if (!empty($bill->shop_license_no)) $headerInfoCount++;
                if (!empty($bill->payment_mode)) $headerInfoCount++;
                if (!empty($bill->fuel_type)) $headerInfoCount++;
                
                $headerClass = 'header-info-2col';
                if ($headerInfoCount == 3) $headerClass = 'header-info-3col';
                if ($headerInfoCount >= 4) $headerClass = 'header-info-4col';
            ?>
            <div class="header-info <?php echo e($headerClass); ?>">
                <div>
                    <strong>Bill Date</strong>
                    <?php echo e($billDateDisplay); ?>

                </div>
                <div>
                    <strong>Month</strong>
                    <?php echo e($report->period); ?>

                </div>
                <?php if(!empty($bill->phone)): ?>
                <div>
                    <strong>Contact</strong>
                    <?php echo e($bill->phone); ?>

                </div>
                <?php endif; ?>
                <?php if(!empty($bill->shop_gstin)): ?>
                <div>
                    <strong>GSTIN</strong>
                    <?php echo e($bill->shop_gstin); ?>

                </div>
                <?php endif; ?>
                <?php if(!empty($bill->shop_license_no)): ?>
                <div>
                    <strong>License No</strong>
                    <?php echo e($bill->shop_license_no); ?>

                </div>
                <?php endif; ?>
                <?php if(!empty($bill->payment_mode)): ?>
                <div>
                    <strong>Payment Mode</strong>
                    <?php echo e(strtoupper($bill->payment_mode)); ?>

                </div>
                <?php endif; ?>
                <?php if(!empty($bill->fuel_type)): ?>
                <div>
                    <strong>Fuel Type</strong>
                    <?php echo e(strtoupper($bill->fuel_type)); ?>

                </div>
                <?php endif; ?>
            </div>
        </div>
        <div class="invoice-badge">
            <?php echo e(strtoupper($bill->getTypeLabel())); ?> #<?php echo e($bill->getBillNumber()); ?>

        </div>
    </div>

    <!-- Content Wrapper -->
    <div class="content-wrapper">
        <!-- Bill To Section (School Details) -->
        <div class="bill-section">
            <div class="bill-to">
                <div class="section-title">Bill To (School Information)</div>
                <div class="info-line">
                    <strong><?php echo e($user->school_name ?? $user->name); ?></strong>
                </div>
                <?php if($user->udise): ?>
                <div class="info-line">
                    <strong>UDISE Code:</strong> <?php echo e($user->udise); ?>

                </div>
                <?php endif; ?>
                <div class="info-line">
                    <strong>Bill For Month:</strong> <?php echo e($report->period); ?>

                </div>
              
            </div>
            
            <div class="invoice-info">
                <div class="section-title">Vendor Details</div>
                <div class="info-line">
                    <strong>Shop Name:</strong><br>
                    <?php echo e($bill->shop_name); ?>

                </div>
                <div class="info-line">
                    <strong>Address:</strong><br>
                    <?php echo e($bill->address); ?>

                </div>
             
                <div class="info-line">
                    <strong>Contact Person:</strong><br>
                    <?php echo e($bill->shopkeeper_name); ?>

                </div>
                <div class="info-line">
                    <strong>Phone:</strong> <?php echo e($bill->phone); ?>

                </div>
                <?php if(!empty($bill->shop_gstin)): ?>
                <div class="info-line">
                    <strong>GSTIN:</strong> <?php echo e($bill->shop_gstin); ?>

                </div>
                <?php endif; ?>
                <?php if(!empty($bill->shop_license_no)): ?>
                <div class="info-line">
                    <strong>License No:</strong> <?php echo e($bill->shop_license_no); ?>

                </div>
                <?php endif; ?>
                <?php if(!empty($bill->payment_mode)): ?>
                <div class="info-line">
                    <strong>Payment Mode:</strong> <?php echo e(strtoupper($bill->payment_mode)); ?>

                </div>
                <?php endif; ?>
                <?php if(!empty($bill->fuel_type)): ?>
                <div class="info-line">
                    <strong>Fuel Type:</strong> <?php echo e(strtoupper($bill->fuel_type)); ?>

                </div>
                <?php endif; ?>
            </div>
        </div>

        <!-- Items Table -->
        <table>
            <thead>
                <tr>
                    <th class="text-center">S.No</th>
                    <th>Item Name</th>
                    <th class="text-right">Amount (₹)</th>
                    <th class="text-right">Rate (₹/unit)</th>
                    <th class="text-right">Quantity</th>
                    <th class="text-center">Unit</th>
                </tr>
            </thead>
            <tbody>
                <?php $__currentLoopData = $bill->items; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $index => $item): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
                <tr>
                    <td class="text-center"><?php echo e($index + 1); ?></td>
                    <td><?php echo e($item->item_name); ?></td>
                    <td class="text-right">₹ <?php echo e(number_format($item->amount, 2)); ?></td>
                    <td class="text-right">₹ <?php echo e(number_format($item->rate_per_unit, 2)); ?></td>
                    <td class="text-right"><?php echo e(number_format($item->quantity, 2)); ?></td>
                    <td class="text-center"><?php echo e($item->unit); ?></td>
                </tr>
                <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>
                
                <!-- Total Row -->
                <tr class="total-row">
                    <td colspan="2" class="text-right font-bold">TOTAL AMOUNT</td>
                    <td class="text-right font-bold">₹ <?php echo e(number_format($bill->total_amount, 2)); ?></td>
                    <td colspan="3"></td>
                </tr>
            </tbody>
        </table>

        <!-- Amount in Words and Vendor Verification -->
        <div class="amount-words-box">
            <div style="margin-bottom: 8px;">
                Amount in Words: <span style="text-transform: uppercase;"><?php echo e(ucwords(numberToWords($bill->total_amount))); ?> Rupees Only</span>
            </div>
            
            <!-- Vendor Verification in Same Box -->
            <div style="margin-top: 10px; padding-top: 10px; border-top: 2px dashed #d97706;">
                <div style="font-size: 7.5pt; font-weight: bold; color: #92400e; margin-bottom: 5px;">
                    Authorized Signatory (Vendor)
                </div>
                <div style="font-size: 7.5pt; font-weight: bold; color: #0f172a;">
                    <?php echo e($bill->shopkeeper_name); ?>

                </div>
                <div style="font-size: 6pt; color: #78716c; margin-top: 1px;">
                    <?php echo e($bill->shop_name); ?>

                </div>
            </div>
        </div>

        <!-- Bill Details and Verification Section -->
        <div class="signature-section">
            <!-- Bill Details Box -->
            <div class="vendor-signature">
                <div class="signature-box-title">Bill Details</div>
                <ul style="list-style: none; padding: 0; margin: 0;">
                    <li style="margin-bottom: 3px; padding-left: 10px; position: relative; line-height: 1.4; font-size: 6.5pt;">
                        <span style="position: absolute; left: 0; color: #f59e0b; font-weight: bold; font-size: 9pt;">▪</span>
                        This is an official Mid-Day Meal Scheme purchase bill
                    </li>
                    <li style="margin-bottom: 3px; padding-left: 10px; position: relative; line-height: 1.4; font-size: 6.5pt;">
                        <span style="position: absolute; left: 0; color: #f59e0b; font-weight: bold; font-size: 9pt;">▪</span>
                        All items purchased are for the school meal program
                    </li>
                    <li style="margin-bottom: 3px; padding-left: 10px; position: relative; line-height: 1.4; font-size: 6.5pt;">
                        <span style="position: absolute; left: 0; color: #f59e0b; font-weight: bold; font-size: 9pt;">▪</span>
                        Bill Number: <?php echo e($bill->getBillNumber()); ?>

                    </li>
                    <li style="margin-bottom: 3px; padding-left: 10px; position: relative; line-height: 1.4; font-size: 6.5pt;">
                        <span style="position: absolute; left: 0; color: #f59e0b; font-weight: bold; font-size: 9pt;">▪</span>
                        Bill Date: <?php echo e($billDateDisplay); ?>

                    </li>
                </ul>
            </div>
            
            <!-- Institution Verification Box -->
            <div class="institution-verification">
                <div class="signature-box-title">Verification & Approval</div>
                
                <!-- Institution Section -->
                <div class="verification-fields">
                    <div class="verification-line">
                        <strong>School Verified By:</strong> <span class="signature-line"></span>
                    </div>
                    <div class="verification-line">
                        <strong>Date:</strong> <span class="signature-line"></span>
                    </div>
                    <div class="verification-line" style="margin-top: 8px; padding-top: 8px; border-top: 1px dashed <?php echo e($colors['primary']); ?>;">
                        <strong>Headmaster/Principal:</strong> <span class="signature-line"></span>
                    </div>
                    <div class="verification-line">
                        <strong>Date:</strong> <span class="signature-line"></span>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <!-- End Content Wrapper -->

        <!-- Footer Note -->
      
    </div>
    <!-- End Content Wrapper -->

</body>
</html><?php /**PATH C:\Users\TASLEEMAH\Documents\mdmseva\resources\views/bills/pdf.blade.php ENDPATH**/ ?>