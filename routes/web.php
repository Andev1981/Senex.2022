<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Artisan;


/* Livewire */
use App\Http\Livewire\{
  Informes\IndexInformes,
  Kine\Atenciones,
  Kine\ListadoKines,
  Kinesiologos\AtencionDetalle,
  Paciente\ListadosIndex,
  Paciente\Resumen,
  PagosPaciente\IndexPagos,
  PagosPaciente\DetallePagos,
  Sesiones\IndexSesiones,
  Types\Index,
  Kinesiologos\KineIndex,
  Kinesiologos\ListadoPacientes,
  Kinesiologos\NoAutorizado,
  Kinesiologos\Resumenes
};

/* Inertia */
use App\Http\Controllers\Inertia\{
  ApplyItemController,
  DteController,
  SessionTypeController,
  PatientController,
  PaymentsController,
  InvoicesController,
  AttendancesController,
};


use App\Http\Controllers\{
  HomeController,
  RoleController,
  UserController,
  PaymentIncomeController,
  ReportePdfController,
  Auth\RegisteredUserController
};


//Reoptimized class loader:
Route::get('/optimize', function () {
  $exitCode = Artisan::call('optimize');
  return '<h1>Reoptimized class loader</h1>';
});

//Route cache:
Route::get('/route-cache', function () {
  $exitCode = Artisan::call('route:cache');
  return '<h1>Routes cached</h1>';
});

//Clear Route cache:
Route::get('/route-clear', function () {
  $exitCode = Artisan::call('route:clear');
  return '<h1>Route cache cleared</h1>';
});

//Clear View cache:
Route::get('/view-clear', function () {
  $exitCode = Artisan::call('view:clear');
  return '<h1>View cache cleared</h1>';
});

//Clear Config cache:
Route::get('/config-cache', function () {
  $exitCode = Artisan::call('config:cache');
  return '<h1>Clear Config cleared</h1>';
});

//Clear Config cache:
Route::get('/system-up', function () {
  $exitCode = Artisan::call('up');
  return '<h1>Clear Config cleared</h1>';
});

//Clear Config cache:
Route::get('/system-down', function () {
  $exitCode = Artisan::call('down');
  return '<h1>Clear Config cleared</h1>';
});


Route::get('storage-link', function () {
  Artisan::call('storage:link');
  return '<h1>Storage link creado</h1>';
})->middleware('auth');


require __DIR__ . '/auth.php';

Route::group(['middleware' => ['auth']], function () {

  Route::get('/dashboard', [HomeController::class, 'index'])->name('dashboard');
  Route::get('/', [HomeController::class, 'index'])->name('/');

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
  Route::get('kines-detalles/{id}', Atenciones::class)->name('kines-detalles');
  Route::get('types', Index::class)->name('types');

  //Livewire componentes app kines
  Route::get('kinesiologos', KineIndex::class)->name('kinesiologos');



  /* RUTAS PARA PDF */
  Route::get('/reporte-pdf-all/{applyItems}/{selTipo}', [ReportePdfController::class, 'generarReporteGeneral']);
  Route::get('/reporte-pdf/{applyItems}/{kine}', [ReportePdfController::class, 'generarReporte']);

  Route::get('/andres', [ReportePdfController::class, 'arreglo'])->name('andres');


  /* Verificar Pagos */
  Route::get('/verificar-pagos', [PaymentIncomeController::class, 'verifyPayment'])->name('verificar.pagos');


  /* RUTAS DE PRUEBA NORMALIZACION DE VISTAS LIVEWIRE */
  Route::get('sesiones', IndexSesiones::class)->name('sesiones'); /* Revisar ruta en funcionalidad */

  Route::get('pagos', IndexPagos::class)->name('pacientes.pagos');/* Revisar ruta en funcionalidad */

  Route::get('{paciente}/pagos', DetallePagos::class)->name('pagos');/* Revisar ruta en funcionalidad */

  Route::get('{paciente}/detalles', Resumen::class)->name('detalles');


  /* RUTAS DE KINESIOLOGOS */
  Route::get('/my-app', KineIndex::class)->name('my-app');
  Route::get('/no-autorizado', NoAutorizado::class)->name('no-autorizado');
  Route::get('/mis-pacientes', ListadoPacientes::class)->name('mis-pacientes');
  Route::get('/mis-atenciones', Resumenes::class)->name('mis-atenciones');
  Route::get('/kinesiologos/pacientes/{paciente}', AtencionDetalle::class);

  Route::get('informes', IndexInformes::class)->name('informes');

  /* Rutas React Inertia */
  /* pacientes */
  Route::get('listado-pacientes', [PatientController::class, 'index'])->name('listado.pacientes');
  Route::post('pacientes-update/{patient}', [PatientController::class, 'update'])->name('pacientes.update');
  Route::post('pacientes-store', [PatientController::class, 'store'])->name('pacientes.store');
  Route::get('pacientes-destroy/{patient}', [PatientController::class, 'destroy'])->name('pacientes.destroy');

  /* kines */
  Route::get('listado-kines', [PatientController::class, 'kines'])->name('listado.kines');
  /* sesiones, applyitems */
  /* Route::get('apply-items', [ApplyItemController::class, 'index'])->name('apply.items');
  Route::post('apply-items-store', [ApplyItemController::class, 'store'])->name('apply.items.store');
  Route::post('apply-items-update/{applyItem}', [ApplyItemController::class, 'update'])->name('apply.items.update');
  Route::get('apply-items-borrar/{applyItem}', [ApplyItemController::class, 'destroy'])->name('apply.items.destroy');
 */

  /* DTE */
  Route::get('/boleta-crear', [DteController::class, 'crear'])->name('boleta');
  Route::post('/dte/emit', [DteController::class, 'emit'])->name('dte.emit');
  Route::post('/dte/check', [DteController::class, 'check'])->name('dte.check');

  /* Nuevos tratamientos */
  Route::get('/admin/session-types',              [SessionTypeController::class, 'index'])->name('session-types.index');
  Route::post('/admin/session-types',              [SessionTypeController::class, 'store'])->name('session-types.store');
  Route::put('/admin/session-types/{sessionType}', [SessionTypeController::class, 'update'])->name('session-types.update');
  Route::delete('/admin/session-types/{sessionType}', [SessionTypeController::class, 'destroy'])->name('session-types.destroy');

  Route::get('/fix', [HomeController::class, 'fix']);


  /* SeniorSenex */
  // Gestión de atenciones (presencial)
  Route::get('/attendances', [AttendancesController::class, 'index'])->name('attendances.index');
  Route::post('/attendances', [AttendancesController::class, 'store'])->name('attendances.store');

  // Check-in de citas
  Route::post('/appointments/{appointment}/check-in', [AttendancesController::class, 'checkInAppointment'])
    ->name('appointments.checkin');

  // Pagos
  Route::post('/sessions/{session}/pay/now', [PaymentsController::class, 'chargeNowForSession'])->name('sessions.pay.now');
  Route::post('/sessions/{session}/pay/webpay', [PaymentsController::class, 'createWebpay'])->name('sessions.pay.webpay');

  // Callback/return de WebPay (debe estar sin CSRF si es externo, usualmente en routes/web con except en VerifyCsrfToken)
  Route::match(['GET', 'POST'], '/payments/webpay/confPaymentsControllerirm', [PaymentsController::class, 'confirmWebpay'])->name('payments.webpay.confirm');

  // Asignaciones de pagos
  Route::post('/invoices/{invoice}/allocate', [PaymentsController::class, 'allocateToInvoice'])->name('invoices.allocate');
  Route::post('/debts/{debt}/settle', [PaymentsController::class, 'settleDebt'])->name('debts.settle');

  // DTE / Documentos
  Route::get('/invoices', [InvoicesController::class, 'index'])->name('invoices.index');
  Route::get('/invoices/{invoice}', [InvoicesController::class, 'show'])->name('invoices.show');
  Route::post('/invoices/sessions/{session}/issue', [InvoicesController::class, 'issueForSession'])
    ->name('invoices.issue.session');
  Route::post('/invoices/plans/{patientPlan}/issue', [InvoicesController::class, 'issueForPlan'])
    ->name('invoices.issue.plan');
  Route::post('/invoices/{invoice}/cancel', [InvoicesController::class, 'cancel'])
    ->name('invoices.cancel');
  Route::get('/invoices/{invoice}/pdf', [InvoicesController::class, 'downloadPdf'])
    ->name('invoices.pdf');
});
