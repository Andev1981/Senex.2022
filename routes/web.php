<?php

use App\Models\Doctor;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Artisan;
use App\Http\Controllers\HomeController;
use App\Http\Controllers\RoleController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\VideoController;
use App\Http\Controllers\Auth\RegisteredUserController;
use App\Http\Controllers\ReportePdfController;
use App\Http\Livewire\Inicio;
use App\Http\Livewire\Kine\ListadoKines;
use App\Http\Livewire\Paciente\ListadoPagosPaciente;
use App\Http\Livewire\Paciente\ListadosIndex;
use App\Http\Livewire\PagosPaciente\IndexPagos;
use App\Http\Livewire\Paciente\Show\Index as ShowIndex;
use App\Http\Livewire\Types\Index;


Route::get('storage-link', function () {
    Artisan::call('storage:link');
    return '<h1>Storage link creado</h1>';
})->middleware('auth');


require __DIR__ . '/auth.php';

Route::group(['middleware' => ['auth']], function () {


    Route::get('/dashboard', Inicio::class)->name('dashboard');
    Route::get('/', Inicio::class)->name('/');

  
    Route::middleware('guest')->group(function () {

        Route::get('register/doctor', [RegisteredUserController::class, 'create_doc'])
            ->name('register.doc');
    });

    Route::get('/admin', [HomeController::class, 'index'])->name('admin');
    Route::resource('roles', RoleController::class)->middleware(['role:Admin']);
    Route::resource('users', UserController::class)->middleware(['role:Admin']);

    //Livewire full page components
    Route::get('pacientes', ListadosIndex::class)->name('pacientes');
    Route::get('pagos', ListadoPagosPaciente::class)->name('pacientes.pagos');
    Route::get('kines', ListadoKines::class)->name('kines');
    Route::get('types', Index::class)->name('types');
    Route::get('{paciente}/pagos', IndexPagos::class)->name('pagos');
    Route::get('{paciente}/detalles', ShowIndex::class)->name('detalles');

    Route::get('/reporte-pdf/{applyItems}/{kine}',[ReportePdfController::class,'generarReporte']);

    Route::get('/andres',[ReportePdfController::class,'arreglo'])->name('andres');

    Route::get('ayuda', [VideoController::class, 'index'])->name('ayudaVideo');
});

//Transbank
/* Route::post('iniciar-compra', [TransbankController::class, 'iniciarCompra'])->name('iniciar.compra');
Route::match(array('GET', 'POST'), '/confirmar-pago', [TransbankController::class, 'confirmar_pago'])->name('confirmar.pago');

Route::get('/pago-ok/{id_transaccion}', [TransbankController::class, 'pago_ok'])->name('pago.ok');
Route::get('/pago-fallido', [TransbankController::class, 'pago_fallido'])->name('pago.fallido'); */
