<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Validation\Rules\Password;
use App\Models\MonthlyAmountConfiguration;
use App\Models\DailyConsumption;
use App\Observers\MonthlyAmountConfigurationObserver;
use App\Observers\DailyConsumptionObserver;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Register observer for automatic recalculation
        MonthlyAmountConfiguration::observe(MonthlyAmountConfigurationObserver::class);
        DailyConsumption::observe(DailyConsumptionObserver::class);
        
        // Configure strong password rules
        Password::defaults(function () {
            return Password::min(12)
                ->mixedCase()
                ->numbers()
                ->symbols()
                ->uncompromised();
        });
        
        // Configure rate limiting
        RateLimiter::for('login', function (Request $request) {
            $email = (string) $request->email;
            return Limit::perMinute(5)->by($email.$request->ip())
                ->response(function (Request $request, array $headers) {
                    return response('Too many login attempts. Please try again later.', 429, $headers);
                });
        });
        
        RateLimiter::for('api', function (Request $request) {
            return Limit::perMinute(60)->by($request->user()?->id ?: $request->ip());
        });
    }
}