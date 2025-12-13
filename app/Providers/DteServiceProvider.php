<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
// ⚠️ Importa la Interfaz (Contrato)
use App\Contracts\DteServiceProvider as DteContract;
// ⚠️ Importa la Implementación (Clase Concreta)
use App\Services\Dte\LibreDteLocalProvider;

class DteServiceProvider extends ServiceProvider // Este es tu Provider de Laravel
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        // 🎯 AÑADE ESTA LÍNEA DE VINCULACIÓN (BINDING)
        // Le dice a Laravel: "Cuando te pidan la Interfaz (DteContract), entrégales la Implementación (LibreDteLocalProvider)".
        $this->app->bind(
            DteContract::class,
            LibreDteLocalProvider::class
        );
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        //
    }
}