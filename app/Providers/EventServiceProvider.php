<?php

namespace App\Providers;

use Illuminate\Foundation\Support\Providers\EventServiceProvider as ServiceProvider;

class EventServiceProvider extends ServiceProvider
{
    /**
     * The event listener mappings for the application.
     *
     * @var array
     */
    protected $listen = [
        //
    ];

    // ... rest of the file
    /**
     * Register any events for your application.
     *
     * @return void
     */
    public function boot()
    {
        \App\Models\DailyConsumption::observe(\App\Observers\DailyConsumptionObserver::class);
        \App\Models\MonthlyRiceConfiguration::observe(\App\Observers\MonthlyRiceConfigurationObserver::class);
    }
}