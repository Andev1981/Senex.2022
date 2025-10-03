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
  DteController,
  SessionTypeController,
  PatientController,
  PaymentsController,
  InvoicesController,
  AttendancesController,
  DoctorController,
  TreatmentController,
};


use App\Http\Controllers\{
  HomeController,
  RoleController,
  UserController,
  PaymentIncomeController,
  ReportePdfController,
  Auth\RegisteredUserController,
  TreatmentSessionController
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


  Route::get('/', [HomeController::class, 'index'])->name('/');

  /* Rutas React Inertia */
  /* pacientes */
  Route::get('pacientes', [PatientController::class, 'index'])->name('pacientes');
  Route::get('pacientes/{patient}', [PatientController::class, 'show'])->name('pacientes.show');
  Route::post('pacientes-update/{patient}', [PatientController::class, 'update'])->name('pacientes.update');
  Route::post('pacientes-store', [PatientController::class, 'store'])->name('pacientes.store');
  Route::get('pacientes-destroy/{patient}', [PatientController::class, 'destroy'])->name('pacientes.destroy');
  Route::get('informes', [PatientController::class, 'informes'])->name('informes');
  Route::get('pos', [PatientController::class, 'pos'])->name('pos');
  Route::get('agenda', [PatientController::class, 'agenda'])->name('agenda');
  Route::get('tratamientos', [PatientController::class, 'tratamientos'])->name('tratamientos');


  Route::post('patients-documents', [PatientController::class, 'document_post'])->name('patient.documents.store');
  Route::resource('treatment-sessions', PatientController::class)->names('treatment_sessions');
  Route::resource('payments', PatientController::class)->names('payments');
  Route::resource('patients', PatientController::class)->names('patients');

  /* kines */
  Route::get('doctors', [DoctorController::class, 'index'])->name('doctors');
  Route::get('doctors/{id}', [DoctorController::class, 'edit'])->name('doctors.edit');

  /* DTE */
  Route::get('/boleta-crear', [DteController::class, 'crear'])->name('boleta');
  Route::post('/dte/emit', [DteController::class, 'emit'])->name('dte.emit');
  Route::post('/dte/check', [DteController::class, 'check'])->name('dte.check');


  /* Treatments */
  Route::resource('treatments', TreatmentController::class)->names('treatments');


















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
