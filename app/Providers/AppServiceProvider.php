<?php

namespace App\Providers;

use App\Models\Doctor;
use App\Models\Patient;
use Carbon\Carbon;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\ServiceProvider;
use App\Models\PaymentAllocation;
use App\Models\User;
use App\Observers\PaymentAllocationObserver;
use App\Services\TwilioService;
use Illuminate\Database\Eloquent\Relations\Relation;
use Illuminate\Support\Facades\Schema;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     *
     * @return void
     */
    public function register()
    {
        Schema::defaultStringLength(191);

        if (config('app.env') === 'production') {
            URL::forceScheme('https');
        }
        if (config('app.env') === 'local') {
            URL::forceScheme('http');
        }

        $this->app->singleton(TwilioService::class, function ($app) {
        return new TwilioService();
    });
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

        Relation::enforceMorphMap([
            'Patient' => Patient::class,
            'Doctor' => Doctor::class,
            'User' => User::class,
        ]);
        
    }
}
