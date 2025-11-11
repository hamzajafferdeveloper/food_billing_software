<?php

namespace App\Providers;

use Cache;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\ServiceProvider;

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
        $this->app->singleton('siteSettings', function () {
            return Cache::rememberForever('site_settings', function () {
                return \App\Models\Setting::pluck('value', 'key')->toArray();
            });
        });
    }
}
