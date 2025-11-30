<?php

namespace App\Exports;

use App\Models\RiceReport;
use App\Models\User;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\WithTitle;
use Maatwebsite\Excel\Concerns\WithStyles;
use Maatwebsite\Excel\Concerns\WithColumnFormatting;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;
use PhpOffice\PhpSpreadsheet\Style\NumberFormat;

class RiceReportExport implements FromCollection, WithHeadings, WithMapping, WithTitle, WithStyles, WithColumnFormatting
{
    protected $userId;
    protected $month;
    protected $year;
    protected $user;

    public function __construct($userId, $month, $year)
    {
        $this->userId = $userId;
        $this->month = $month;
        $this->year = $year;
        $this->user = User::find($userId);
    }

    /**
     * Get the data collection
     */
    public function collection()
    {
        $report = RiceReport::where('user_id', $this->userId)
            ->where('month', $this->month)
            ->where('year', $this->year)
            ->with('dailyConsumptions')
            ->first();

        if (!$report) {
            return collect([]);
        }

        return $report->dailyConsumptions->sortBy('date');
    }

    /**
     * Define column headings
     */
    public function headings(): array
    {
        $monthName = date('F', mktime(0, 0, 0, $this->month, 1));
        $schoolName = $this->user ? $this->user->school_name : '';
        
        return [
            ['Rice Report - ' . $monthName . ' ' . $this->year],
            ['School: ' . $schoolName],
            [],
            [
                'Date',
                'Day',
                'Opening Balance (kg)',
                'Primary Students',
                'Middle Students',
                'Rice Consumed (kg)',
                'Closing Balance (kg)',
                'Remarks'
            ]
        ];
    }

    /**
     * Map each row
     */
    public function map($consumption): array
    {
        // Get rice configuration for this month
        $config = \App\Models\MonthlyRiceConfiguration::where('user_id', $this->userId)
            ->where('month', $this->month)
            ->where('year', $this->year)
            ->first();

        if (!$config) {
            return [];
        }

        // Calculate rice consumed
        $primaryRate = $config->daily_consumption_primary / 1000; // Convert grams to kg
        $middleRate = $config->daily_consumption_upper_primary / 1000;
        
        $riceConsumed = (($consumption->served_primary ?? 0) * $primaryRate) +
                       (($consumption->served_middle ?? 0) * $middleRate);

        // For simplicity, we'll calculate opening/closing per day
        // In a real implementation, you'd track running balance
        static $runningBalance = null;
        if ($runningBalance === null) {
            $runningBalance = $config->opening_balance_primary + 
                            $config->opening_balance_upper_primary +
                            $config->rice_lifted_primary +
                            $config->rice_lifted_upper_primary +
                            $config->rice_arranged_primary +
                            $config->rice_arranged_upper_primary;
        }

        $opening = $runningBalance;
        $closing = $opening - $riceConsumed;
        $runningBalance = $closing;

        return [
            $consumption->date->format('Y-m-d'),
            $consumption->date->format('l'),
            round($opening, 2),
            $consumption->served_primary ?? 0,
            $consumption->served_middle ?? 0,
            round($riceConsumed, 2),
            round($closing, 2),
            $consumption->remarks ?? ''
        ];
    }

    /**
     * Set worksheet title
     */
    public function title(): string
    {
        return date('F Y', mktime(0, 0, 0, $this->month, 1, $this->year));
    }

    /**
     * Apply styles to worksheet
     */
    public function styles(Worksheet $sheet)
    {
        return [
            1 => ['font' => ['bold' => true, 'size' => 14]],
            2 => ['font' => ['bold' => true, 'size' => 12]],
            4 => ['font' => ['bold' => true], 'fill' => [
                'fillType' => \PhpOffice\PhpSpreadsheet\Style\Fill::FILL_SOLID,
                'startColor' => ['rgb' => 'E2EFDA']
            ]],
        ];
    }

    /**
     * Format columns
     */
    public function columnFormats(): array
    {
        return [
            'C' => NumberFormat::FORMAT_NUMBER_00,
            'D' => NumberFormat::FORMAT_NUMBER,
            'E' => NumberFormat::FORMAT_NUMBER,
            'F' => NumberFormat::FORMAT_NUMBER_00,
            'G' => NumberFormat::FORMAT_NUMBER_00,
        ];
    }
}
