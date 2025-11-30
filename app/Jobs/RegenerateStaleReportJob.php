<?php

namespace App\Jobs;

use App\Models\User;
use App\Services\AmountReportService;
use App\Services\RiceReportService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class RegenerateStaleReportJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    protected $userId;
    protected $month;
    protected $year;

    /**
     * Create a new job instance.
     *
     * @return void
     */
    public function __construct(int $userId, int $month, int $year)
    {
        $this->userId = $userId;
        $this->month = $month;
        $this->year = $year;
    }

    /**
     * Execute the job.
     *
     * @return void
     */
    public function handle(RiceReportService $riceReportService, AmountReportService $amountReportService)
    {
        $user = User::find($this->userId);
        
        if (!$user) {
            Log::warning("RegenerateStaleReportJob: User {$this->userId} not found.");
            return;
        }

        Log::info("RegenerateStaleReportJob: Starting regeneration for User {$this->userId}, {$this->month}/{$this->year}");

        try {
            // 1. Regenerate Rice Report if it exists
            // RiceReportService doesn't have explicit regenerate, so we delete and recreate
            $existingRiceReport = \App\Models\RiceReport::where('user_id', $this->userId)
                ->where('month', $this->month)
                ->where('year', $this->year)
                ->first();

            if ($existingRiceReport) {
                Log::info("RegenerateStaleReportJob: Regenerating Rice Report");
                $existingRiceReport->delete();
                $riceReportService->generateReport($user, $this->month, $this->year);
            }

            // 2. Regenerate Amount Report if it exists
            $existingAmountReport = \App\Models\AmountReport::where('user_id', $this->userId)
                ->where('month', $this->month)
                ->where('year', $this->year)
                ->first();

            if ($existingAmountReport) {
                Log::info("RegenerateStaleReportJob: Regenerating Amount Report");
                $amountReportService->regenerateReport($this->userId, $this->month, $this->year);
            }

            Log::info("RegenerateStaleReportJob: Completed successfully.");

        } catch (\Exception $e) {
            Log::error("RegenerateStaleReportJob: Failed to regenerate reports.", [
                'user_id' => $this->userId,
                'month' => $this->month,
                'year' => $this->year,
                'error' => $e->getMessage()
            ]);
            // We don't rethrow to avoid infinite retry loops for logic errors, 
            // but in a real production system we might want to retry transient errors.
        }
    }
}
