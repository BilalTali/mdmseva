<?php

namespace App\Traits;

use Illuminate\Http\Request;

trait TracksSelectedPeriod
{
    /**
     * Get the selected month from session or default to current month
     */
    protected function getSelectedMonth(Request $request): int
    {
        // Priority: 1. Request parameter, 2. Session, 3. Current month
        if ($request->has('month')) {
            $month = (int) $request->input('month');
            session(['selected_month' => $month]);
            return $month;
        }
        
        return session('selected_month', now()->month);
    }

    /**
     * Get the selected year from session or default to current year
     */
    protected function getSelectedYear(Request $request): int
    {
        // Priority: 1. Request parameter, 2. Session, 3. Current year
        if ($request->has('year')) {
            $year = (int) $request->input('year');
            session(['selected_year' => $year]);
            return $year;
        }
        
        return session('selected_year', now()->year);
    }

    /**
     * Set the selected period in session
     */
    protected function setSelectedPeriod(int $month, int $year): void
    {
        session([
            'selected_month' => $month,
            'selected_year' => $year,
        ]);
    }

    /**
     * Get both month and year at once
     */
    protected function getSelectedPeriod(Request $request): array
    {
        return [
            'month' => $this->getSelectedMonth($request),
            'year' => $this->getSelectedYear($request),
        ];
    }
}
