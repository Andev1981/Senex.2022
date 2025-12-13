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
use sasco\LibreDTE\FirmaElectronica;
use App\Services\Dte\LibreDteLocalProvider; // Tu implementación
use App\Services\Dte\DteServiceProvider as DteServiceContract; // La

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

        $firmaConfig = [
            'file' => config('dte.certificado.path'),
            'pass' => config('dte.certificado.pass'),
        ];

        // Binding de la FirmaElectrónica (sin cambios)
        $this->app->singleton(FirmaElectronica::class, function ($app)  use ($firmaConfig){
            // ... [Tu código para crear la instancia de FirmaElectronica con el constructor] ...
            // (Este código es el que revisamos en el paso anterior y ya está bien)
            $firma = new FirmaElectronica($firmaConfig); 
            return $firma;
        });

        // Binding de la Implementación
        // Aquí le dices a Laravel que si alguien pide la Interface, le dé la implementación.
        $this->app->bind(DteServiceContract::class, LibreDteLocalProvider::class);

   
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
