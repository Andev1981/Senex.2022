<?php

use App\Models\Doctor;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Artisan;
use App\Http\Controllers\HomeController;
use App\Http\Controllers\RoleController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\VideoController;
use App\Http\Controllers\DoctorController;
use App\Http\Controllers\SesionController;
use App\Http\Controllers\ResumenController;
use App\Http\Controllers\SolicitudController;
use App\Http\Controllers\TransbankController;
use App\Http\Controllers\Auth\RegisteredUserController;
use App\Http\Livewire\Inicio;
use App\Http\Livewire\Kine\ListadoKines;
use App\Http\Livewire\Paciente\ListadoPacientes;
use App\Http\Livewire\Types\Index;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| contains the "web" middleware group. Now create something great!
|
*/

Route::get('storage-link', function () {
    Artisan::call('storage:link');
    return '<h1>Storage link creado</h1>';
})->middleware('auth');




require __DIR__ . '/auth.php';

Route::group(['middleware' => ['auth']], function () {

    Route::get('/', function () {
        $doctores = Doctor::where('state', 1)->get();
        return view('welcome', compact('doctores'));
    })->name('/');

    Route::get('/dashboard', Inicio::class)->name('dashboard');
    Route::get('/', Inicio::class)->name('/');

  
    Route::middleware('guest')->group(function () {

        Route::get('register/doctor', [RegisteredUserController::class, 'create_doc'])
            ->name('register.doc');
    });

    Route::get('/admin', [HomeController::class, 'index'])->name('admin');
    Route::resource('roles', RoleController::class)->middleware(['role:Admin']);
    Route::resource('users', UserController::class)->middleware(['role:Admin']);
    Route::get('solicitudes', [SolicitudController::class, 'index'])->name('solicitudes');
    /*   Route::get('pacientes/show',[PatientController::class, 'show'])->name('pacientes.show');
    Route::get('pacientes/crear',[PatientController::class, 'create'])->name('pacientes.create');
    Route::get('pacientes/preguntas',[PatientController::class, 'preguntas'])->name('pacientes.preguntas');
    Route::post('pacientes/store',[PatientController::class, 'store'])->name('pacientes.store'); */
    /*     Route::get('doctores',[DoctorController::class, 'index'])->name('doctores'); */
    Route::get('kine/crear', [DoctorController::class, 'create'])->name('doctor.create');
    Route::get('kine', [DoctorController::class, 'index'])->name('doctor.index');
    Route::post('kine/store', [DoctorController::class, 'store'])->name('doctor.store');

    Route::get('resumen', [ResumenController::class, 'index'])->name('resumen');
    Route::get('resumen-show/{res}', [ResumenController::class, 'show'])->name('resumen.show');
    Route::get('receta', [ResumenController::class, 'receta'])->name('receta.demo');
    Route::post('crear/receta', [ResumenController::class, 'crearReceta'])->name('crear.receta');
    Route::post('crear/receta', [SesionController::class, 'crearSesion'])->name('sesion.crear');

    Route::get('repetir/{id}/receta', [SolicitudController::class, 'repetir'])->name('repetir.receta');

    //Livewire full page components
    Route::get('pacientes', ListadoPacientes::class)->name('pacientes');
    Route::get('kines', ListadoKines::class)->name('kines');
    Route::get('types', Index::class)->name('types');
    Route::get('kines/{kine?}/ver/', \App\Http\Livewire\Doctor\Index::class)->name('doctor.show');

    Route::get('ayuda', [VideoController::class, 'index'])->name('ayudaVideo');
});

//Transbank
Route::post('iniciar-compra', [TransbankController::class, 'iniciarCompra'])->name('iniciar.compra');
Route::match(array('GET', 'POST'), '/confirmar-pago', [TransbankController::class, 'confirmar_pago'])->name('confirmar.pago');

Route::get('/pago-ok/{id_transaccion}', [TransbankController::class, 'pago_ok'])->name('pago.ok');
Route::get('/pago-fallido', [TransbankController::class, 'pago_fallido'])->name('pago.fallido');
