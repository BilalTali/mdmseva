<?php

namespace App\Exports;

use App\Models\DailyConsumption;
use App\Models\User;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\WithTitle;
use Maatwebsite\Excel\Concerns\WithStyles;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class DailyConsumptionExport implements FromCollection, WithHeadings, WithMapping, WithTitle, WithStyles
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
        return DailyConsumption::where('user_id', $this->userId)
            ->whereYear('date', $this->year)
            ->whereMonth('date', $this->month)
            ->orderBy('date')
            ->get();
    }

    public function headings(): array
    {
        $monthName = date('F', mktime(0, 0, 0, $this->month, 1));
        $schoolName = $this->user ? $this->user->school_name : '';
        
        return [
            ['Daily Consumption Records - ' . $monthName . ' ' . $this->year],
            ['School: ' . $schoolName],
            [],
            [
                'Date',
                'Day',
                'Primary Students Served',
                'Middle Students Served',
                'Total Students',
                'Remarks'
            ]
        ];
    }

    public function map($consumption): array
    {
        $primaryStudents = $consumption->served_primary ?? 0;
        $middleStudents = $consumption->served_middle ?? 0;
        $total = $primaryStudents + $middleStudents;

        return [
            $consumption->date->format('Y-m-d'),
            $consumption->date->format('l'),
            $primaryStudents,
            $middleStudents,
            $total,
            $consumption->remarks ?? ''
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
                'startColor' => ['rgb' => 'D9EAD3']
            ]],
        ];
    }
}
