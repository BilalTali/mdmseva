# Script to replace RiceConfiguration with MonthlyRiceConfiguration
# This is a comprehensive fix for the entire project

$files = @(
    "app\Services\ConsumptionCalculationService.php",
    "app\Services\RiceReportService.php",
    "app\Observers\AmountConfigurationObserver.php",
    "app\Models\User.php",
    "app\Models\MonthlyConfiguration.php",
    "app\Http\Middleware\EnsureRiceConfiguration.php",
    "app\Http\Controllers\RiceReportController.php",
    "app\Http\Controllers\DailyConsumptionController.php",
    "app\Http\Controllers\Api\DashboardApiController.php",
    "app\Http\Controllers\AmountReportController.php",
    "app\Http\Controllers\Admin\SchoolsController.php",
    "app\Http\Controllers\Admin\DashboardController.php"
)

Write-Host "Files with RiceConfiguration references:"
foreach ($file in $files) {
    $fullPath = Join-Path $PSScriptRoot $file
    if (Test-Path $fullPath) {
        $content = Get-Content $fullPath -Raw
        if ($content -match "RiceConfiguration" -and $content -notmatch "MonthlyRiceConfiguration") {
            Write-Host "  - $file" -ForegroundColor Yellow
        }
    }
}
