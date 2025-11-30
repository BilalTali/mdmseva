<?php

namespace App\Exports;

use App\Models\AmountReport;
use App\Models\User;
use App\Models\MonthlyAmountConfiguration;
use App\Models\DailyConsumption;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\WithTitle;
use Maatwebsite\Excel\Concerns\WithStyles;
use Maatwebsite\Excel\Concerns\WithColumnFormatting;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;
use PhpOffice\PhpSpreadsheet\Style\NumberFormat;

class AmountReportExport implements FromCollection, WithHeadings, WithMapping, WithTitle, WithStyles, WithColumnFormatting
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

    public function collection()
    {
        $consumptions = DailyConsumption::where('user_id', $this->userId)
            ->whereYear('date', $this->year)
            ->whereMonth('date', $this->month)
            ->orderBy('date')
            ->get();

        return $consumptions;
    }

    public function headings(): array
    {
        $monthName = date('F', mktime(0, 0, 0, $this->month, 1));
        $schoolName = $this->user ? $this->user->school_name : '';
        
        return [
            ['Amount/Expenditure Report - ' . $monthName . ' ' . $this->year],
            ['School: ' . $schoolName],
            [],
            [
                'Date',
                'Day',
                'Primary Students',
                'Middle Students',
                'Pulses (₹)',
                'Vegetables (₹)',
                'Oil (₹)',
                'Salt (₹)',
                'Fuel (₹)',
                'Total (₹)'
            ]
        ];
    }

    public function map($consumption): array
    {
        $config = MonthlyAmountConfiguration::where('user_id', $this->userId)
            ->where('month', $this->month)
            ->where('year', $this->year)
            ->first();

        if (!$config) {
            return [];
        }

        $primaryStudents = $consumption->served_primary ?? 0;
        $middleStudents = $consumption->served_middle ?? 0;

        $pulses = ($primaryStudents * $config->daily_pulses_primary) +
                 ($middleStudents * $config->daily_pulses_middle);
        
        $vegetables = ($primaryStudents * $config->daily_vegetables_primary) +
                     ($middleStudents * $config->daily_vegetables_middle);
        
        $oil = ($primaryStudents * $config->daily_oil_primary) +
              ($middleStudents * $config->daily_oil_middle);
        
        $salt = ($primaryStudents * $config->daily_salt_primary) +
               ($middleStudents * $config->daily_salt_middle);
        
        $fuel = ($primaryStudents * $config->daily_fuel_primary) +
               ($middleStudents * $config->daily_fuel_middle);

        $total = $pulses + $vegetables + $oil + $salt + $fuel;

        return [
            $consumption->date->format('Y-m-d'),
            $consumption->date->format('l'),
            $primaryStudents,
            $middleStudents,
            round($pulses, 2),
            round($vegetables, 2),
            round($oil, 2),
            round($salt, 2),
            round($fuel, 2),
            round($total, 2)
        ];
    }

    public function title(): string
    {
        return date('F Y', mktime(0, 0, 0, $this->month, 1, $this->year));
    }

    public function styles(Worksheet $sheet)
    {
        return [
            1 => ['font' => ['bold' => true, 'size' => 14]],
            2 => ['font' => ['bold' => true, 'size' => 12]],
            4 => ['font' => ['bold' => true], 'fill' => [
                'fillType' => \PhpOffice\PhpSpreadsheet\Style\Fill::FILL_SOLID,
                'startColor' => ['rgb' => 'FFF2CC']
            ]],
        ];
    }

    public function columnFormats(): array
    {
        return [
            'E' => NumberFormat::FORMAT_NUMBER_00,
            'F' => NumberFormat::FORMAT_NUMBER_00,
            'G' => NumberFormat::FORMAT_NUMBER_00,
            'H' => NumberFormat::FORMAT_NUMBER_00,
            'I' => NumberFormat::FORMAT_NUMBER_00,
            'J' => NumberFormat::FORMAT_NUMBER_00,
        ];
    }
}
