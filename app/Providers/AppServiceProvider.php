<?php

namespace App\Providers;

use Carbon\Carbon;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\ServiceProvider;
use App\Services\Dte\DteProvider;
use App\Services\Dte\LibreDteProvider;
use App\Models\PaymentAllocation;
use App\Observers\PaymentAllocationObserver;


class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     *
     * @return void
     */
    public function register()
    {
        if (config('app.env') === 'production') {
            URL::forceScheme('https');
        }
    }

    /**
     * Bootstrap any application services.
     *
     * @return void
     */
    public function boot()
    {
        // Configuración para fechas en español
        Carbon::setLocale(config('app.locale'));
        /*      setlocale(LC_ALL, 'es_CL', 'es', 'ES'); */
        PaymentAllocation::observe(PaymentAllocationObserver::class);
        
    }
}
