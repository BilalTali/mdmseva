<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\RollStatement;

class VerifyDelete extends Command
{
    protected $signature = 'verify:delete';
    protected $description = 'Verify delete logic';

    public function handle()
    {
        $date = '2025-01-01';
        $academicYear = '2024-2025';
        $udise = 'TEST_UDISE_123';

        $this->info("Creating dummy record for $date...");

        try {
            RollStatement::create([
                'date' => $date,
                'academic_year' => $academicYear,
                'udise' => $udise,
                'class' => '1',
                'boys' => 10,
                'girls' => 10,
                'created_by' => 1,
                'updated_by' => 1,
            ]);
            $this->info("Created.");
        } catch (\Throwable $e) {
            $this->error("Create failed: " . $e->getMessage());
            return 1;
        }

        $this->info("Attempting to delete...");

        try {
            $deleted = RollStatement::where('date', $date)
                ->where('academic_year', $academicYear)
                ->where('udise', $udise)
                ->delete();
            
            $this->info("Deleted count: $deleted");
        } catch (\Throwable $e) {
            $this->error("Delete failed: " . $e->getMessage());
            return 1;
        }

        $finalCount = RollStatement::where('date', $date)
            ->where('academic_year', $academicYear)
            ->where('udise', $udise)
            ->count();

        if ($finalCount === 0) {
            $this->info("Verification Passed: Record is gone.");
        } else {
            $this->error("Verification Failed: Record still exists.");
        }
    }
}
