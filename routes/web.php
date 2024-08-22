<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Artisan;
use App\Http\Controllers\HomeController;
use App\Http\Controllers\RoleController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\Auth\RegisteredUserController;
use App\Http\Controllers\PaymentIncomeController;
use App\Http\Controllers\ReportePdfController;
use App\Http\Livewire\Inicio;
use App\Http\Livewire\Kine\ListadoKines;
use App\Http\Livewire\Kinesiologos\AtencionDetalle;
use App\Http\Livewire\Paciente\ListadosIndex;
use App\Http\Livewire\Paciente\Resumen;
use App\Http\Livewire\PagosPaciente\IndexPagos;
use App\Http\Livewire\PagosPaciente\DetallePagos;
use App\Http\Livewire\Sesiones\IndexSesiones;
use App\Http\Livewire\Types\Index;
use App\Http\Livewire\Kinesiologos\KineIndex;
use App\Http\Livewire\Kinesiologos\ListadoPacientes;
use App\Http\Livewire\Kinesiologos\NoAutorizado;
use App\Http\Livewire\Kinesiologos\Resumenes;
use App\Http\Livewire\Prueba\Medikal;



Route::get('storage-link', function () {
  Artisan::call('storage:link');
  return '<h1>Storage link creado</h1>';
})->middleware('auth');


require __DIR__ . '/auth.php';

Route::group(['middleware' => ['auth']], function () {

  /* 
    $appUser = auth();
    dd(auth());
    */

  Route::get('/dashboard', Inicio::class)->name('dashboard');
  Route::get('/', Inicio::class)->name('/');


  Route::get('/my-app', KineIndex::class)->name('my-app');
  Route::get('/no-autorizado', NoAutorizado::class)->name('no-autorizado');
  Route::get('/mis-pacientes', ListadoPacientes::class)->name('mis-pacientes');
  Route::get('/mis-atenciones', Resumenes::class)->name('mis-atenciones');
  Route::get('/kinesiologos/pacientes/{paciente}', AtencionDetalle::class);



  Route::middleware('guest')->group(function () {

    Route::get('register/doctor', [RegisteredUserController::class, 'create_doc'])
      ->name('register.doc');
  });

  Route::get('/admin', [HomeController::class, 'index'])->name('admin');
  Route::resource('roles', RoleController::class)->middleware(['role:Admin']);
  Route::resource('users', UserController::class)->middleware(['role:Admin']);

  //Livewire full page components
  Route::get('pacientes', ListadosIndex::class)->name('pacientes');

  Route::get('kines', ListadoKines::class)->name('kines');
  Route::get('types', Index::class)->name('types');

  //Livewire componentes app kines
  Route::get('kinesiologos', KineIndex::class)->name('kinesiologos');



  /* RUTAS PARA PDF */
  Route::get('/reporte-pdf/{applyItems}/{kine}', [ReportePdfController::class, 'generarReporte']);

  Route::get('/andres', [ReportePdfController::class, 'arreglo'])->name('andres');


  /* Verificar Pagos */
  Route::get('/verificar-pagos', [PaymentIncomeController::class, 'verifyPayment'])->name('verificar.pagos');


  /* RUTAS DE PRUEBA NORMALIZACION DE VISTAS LIVEWIRE */
  Route::get('sesiones', IndexSesiones::class)->name('sesiones'); /* Revisar ruta en funcionalidad */

  Route::get('pagos', IndexPagos::class)->name('pacientes.pagos');/* Revisar ruta en funcionalidad */

  Route::get('{paciente}/pagos', DetallePagos::class)->name('pagos');/* Revisar ruta en funcionalidad */

  Route::get('{paciente}/detalles', Resumen::class)->name('detalles');
});



//Transbank
/* Route::post('iniciar-compra', [TransbankController::class, 'iniciarCompra'])->name('iniciar.compra');
Route::match(array('GET', 'POST'), '/confirmar-pago', [TransbankController::class, 'confirmar_pago'])->name('confirmar.pago');

Route::get('/pago-ok/{id_transaccion}', [TransbankController::class, 'pago_ok'])->name('pago.ok');
Route::get('/pago-fallido', [TransbankController::class, 'pago_fallido'])->name('pago.fallido'); */
