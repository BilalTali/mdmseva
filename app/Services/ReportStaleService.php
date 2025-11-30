<?php

namespace App\Services;

use App\Models\AmountReport;
use App\Models\DailyConsumption;
use App\Models\User;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class ReportStaleService
{
    /**
     * Mark a specific Amount Report as stale.
     *
     * @param AmountReport $report
     * @param string $reason
     * @return void
     */
    public function markAmountReportStale(AmountReport $report, string $reason): void
    {
        if ($report->is_stale) {
            // Append reason if already stale, avoiding duplicates
            if (!str_contains($report->stale_reason, $reason)) {
                $report->update([
                    'stale_reason' => $report->stale_reason . ' | ' . $reason,
                ]);
            }
            return;
        }

        $report->update([
            'is_stale' => true,
            'stale_reason' => $reason,
            'stale_since' => now(),
        ]);

        Log::info("Marked Amount Report #{$report->id} as stale. Reason: {$reason}");
    }

    /**
     * Mark future Amount Reports as stale (cascading effect).
     *
     * @param User $user
     * @param int $month
     * @param int $year
     * @param string $reason
     * @return void
     */
    public function markFutureReportsStale(User $user, int $month, int $year, string $reason): void
    {
        // Find reports after the given month/year
        // Logic: (year > given_year) OR (year = given_year AND month > given_month)
        
        $futureReports = AmountReport::where('user_id', $user->id)
            ->where(function ($query) use ($month, $year) {
                $query->where('year', '>', $year)
                      ->orWhere(function ($q) use ($month, $year) {
                          $q->where('year', $year)
                            ->where('month', '>', $month);
                      });
            })
            ->get();

        foreach ($futureReports as $report) {
            $this->markAmountReportStale($report, "Cascade: {$reason}");
        }
    }

    /**
     * Check if a report should be stale based on current daily consumption data.
     *
     * @param AmountReport $report
     * @return bool
     */
    public function checkAndMarkStale(AmountReport $report): bool
    {
        if ($report->is_stale) {
            return true;
        }

        $currentHash = $this->generateSourceHashForPeriod($report->user_id, $report->month, $report->year);

        if ($currentHash !== $report->source_daily_hash) {
            $this->markAmountReportStale($report, "Data Mismatch: Underlying daily consumption data has changed.");
            return true;
        }

        return false;
    }

    /**
     * Generate a hash of relevant fields from daily consumptions to detect changes.
     *
     * @param Collection $dailyConsumptions
     * @return string
     */
    public function generateSourceHash(Collection $dailyConsumptions): string
    {
        // We only care about fields that affect the amount calculation:
        // - served_primary
        // - served_middle
        // - date (implicit in the collection)
        
        $dataToHash = $dailyConsumptions->map(function ($consumption) {
            return [
                'id' => $consumption->id,
                'served_primary' => $consumption->served_primary,
                'served_middle' => $consumption->served_middle,
            ];
        })->values()->toArray();

        return md5(json_encode($dataToHash));
    }

    /**
     * Generate hash for a specific period by fetching data.
     *
     * @param int $userId
     * @param int $month
     * @param int $year
     * @return string
     */
    public function generateSourceHashForPeriod(int $userId, int $month, int $year): string
    {
        $consumptions = DailyConsumption::where('user_id', $userId)
            ->whereMonth('date', $month)
            ->whereYear('date', $year)
            ->orderBy('date')
            ->get();

        return $this->generateSourceHash($consumptions);
    }

    /**
     * Clear stale status after regeneration.
     *
     * @param AmountReport $report
     * @return void
     */
    public function clearStaleStatus(AmountReport $report): void
    {
        $report->update([
            'is_stale' => false,
            'stale_reason' => null,
            'stale_since' => null,
        ]);
        
        Log::info("Cleared stale status for Amount Report #{$report->id}");
    }
}
