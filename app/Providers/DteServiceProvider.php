<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use App\Services\Dte\DteProvider;
use App\Services\Dte\LibreDteProvider;

class DteServiceProvider extends ServiceProvider
{
  public function register()
  {
    $this->app->singleton(DteProvider::class, function () {
      // Podrías hacer un switch por config('dte.provider') si tuvieras más proveedores
      return new LibreDteProvider();
    });
  }

  public function boot()
  {
    //
  }
}
