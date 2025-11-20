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
  VitalController,
};


use App\Http\Controllers\{
  HomeController,
  AddressController,
    HealthInsurerController,
    InsuranceCompanyController,
    PatientContactController,
    PlanController,
    TreatmentSessionController,
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

Route::post('/heartbeat', function() {
    return response()->json(['status' => 'ok']);
})->name('heartbeat');

Route::group(['middleware' => ['auth']], function () {


  Route::get('/', [HomeController::class, 'index'])->name('/');

  /* Rutas React Inertia */
  /* pacientes */
 /*  Route::get('pacientes', [PatientController::class, 'index'])->name('pacientes'); */
  Route::get('pacientes/{patient}', [PatientController::class, 'show'])->name('pacientes.show');
  Route::post('pacientes-update/{patient}', [PatientController::class, 'update'])->name('pacientes.update');
  Route::post('pacientes-store', [PatientController::class, 'store'])->name('pacientes.store');
  Route::get('pacientes-destroy/{patient}', [PatientController::class, 'destroy'])->name('pacientes.destroy');
  Route::get('informes', [PatientController::class, 'informes'])->name('informes');
  Route::get('pos', [PatientController::class, 'pos'])->name('pos');
  Route::get('agenda', [PatientController::class, 'agenda'])->name('agenda');
  Route::get('tratamientos', [PatientController::class, 'tratamientos'])->name('tratamientos');


  Route::post('patients-documents', [PatientController::class, 'document_post'])->name('patient.documents.store');
  //Route::resource('treatment-sessions', PatientController::class)->names('treatment_sessions');
  Route::resource('payments', PatientController::class)->names('payments');
  Route::resource('patients', PatientController::class)->names('patients');
  Route::resource('addresses', AddressController::class)->names('addresses');
  Route::post('patients/{patient}/addresses', [AddressController::class, 'store'])->name('patients.addresses.store');
  Route::patch('patients/{patient}/addresses', [AddressController::class, 'update'])->name('patients.addresses.update');
  Route::post('patients/{patient}/contacts', [PatientContactController::class, 'store'])->name('patients.contacts.store');
  Route::patch('patients/{patientContact}/contacts', [PatientContactController::class, 'update'])->name('patients.contacts.update');
  Route::post('patients/vitals', [VitalController::class, 'store'])->name('patients.vitals.store');
  Route::patch('patients/{vital}/vitals', [VitalController::class, 'update'])->name('patients.vitals.update');


  Route::post('patients/treatments', [TreatmentController::class, 'store'])->name('patients.treatments.store');
  Route::patch('patients/{treatment}/treatments', [TreatmentController::class, 'update'])->name('patients.treatments.update');



  // CRUD básico de treatment sessions
    Route::resource('treatment-sessions', TreatmentSessionController::class)
        ->names('treatment_sessions');
    
    // Rutas adicionales para funcionalidad avanzada
    Route::post('/treatment-sessions/bulk-update', [TreatmentSessionController::class, 'bulkUpdate'])
        ->name('treatment_sessions.bulk_update');
    
    Route::get('/treatment-sessions/{session}/stats', [TreatmentSessionController::class, 'getSessionStatistics'])
        ->name('treatment_sessions.stats');
    
    // Crear sesión desde appointment
    Route::get('/treatment-sessions/create-from-appointment/{appointment}', [TreatmentSessionController::class, 'createFromAppointment'])
        ->name('treatment_sessions.create_from_appointment');

  /* kines */
  Route::get('doctors', [DoctorController::class, 'index'])->name('doctors');
  Route::get('doctors/{id}', [DoctorController::class, 'edit'])->name('doctors.edit');

  /* DTE */
  Route::get('/boleta-crear', [DteController::class, 'crear'])->name('boleta');
  Route::post('/dte/emit', [DteController::class, 'emit'])->name('dte.emit');
  Route::post('/dte/check', [DteController::class, 'check'])->name('dte.check');


  /* Treatments */
/*   Route::resource('treatments', TreatmentController::class)->names('treatments');
 */




/*
|--------------------------------------------------------------------------
| RUTAS PARA TRATAMIENTOS Y SESIONES - PATRÓN MIXTO
|--------------------------------------------------------------------------
| 
| PATRÓN MIXTO (Hybrid Pattern):
| - GET requests -> Inertia::render() (navegación SEO-friendly)
| - POST/PUT/DELETE requests -> JsonResponse (manejo de formularios modales)
|
| Estructura de URLs:
| - /patients/{patient}/treatments - Lista de tratamientos del paciente
| - /treatments/{treatment} - Detalle de un tratamiento específico
| - /patients/{patient}/sessions - Lista de sesiones del paciente  
| - /sessions/{session} - Detalle de una sesión específica
|
*/

// =============================================================================
// RUTAS DE TRATAMIENTOS
// =============================================================================

/**
 * RUTAS DE NAVEGACIÓN (GET) - Inertia::render()
 * Estas rutas devuelven vistas completas para navegación tradicional
 */

 Route::get('/patients', [PatientController::class, 'index'])->name('patients.index');

Route::get('/patients/{patient}/treatments', [TreatmentController::class, 'index'])
    ->name('patients.treatments.index');

Route::get('/treatments/{treatment}', [TreatmentController::class, 'show'])
    ->name('patients.treatments.show');

/**
 * RUTAS DE API (POST/PUT/DELETE) - JsonResponse
 * Estas rutas manejan formularios modales sin recargar la página
 */
Route::post('/treatments', [TreatmentController::class, 'store'])
    ->name('treatments.store');

Route::put('/treatments/{treatment}', [TreatmentController::class, 'update'])
    ->name('treatments.update');

Route::patch('/treatments/{treatment}', [TreatmentController::class, 'update'])
    ->name('treatments.update');

Route::delete('/treatments/{treatment}', [TreatmentController::class, 'destroy'])
    ->name('treatments.destroy');

// =============================================================================
// RUTAS DE SESIONES
// =============================================================================

/**
 * RUTAS DE NAVEGACIÓN (GET) - Inertia::render()
 */
Route::get('/patients/{patient}/sessions', [TreatmentSessionController::class, 'index'])
    ->name('sessions.index');

Route::get('/sessions/{session}', [TreatmentSessionController::class, 'show'])
    ->name('sessions.show');

/**
 * RUTAS DE API (POST/PUT/DELETE) - JsonResponse
 */
Route::post('/sessions', [TreatmentSessionController::class, 'store'])
    ->name('sessions.store');

Route::put('/sessions/{session}', [TreatmentSessionController::class, 'update'])
    ->name('sessions.update');

Route::delete('/sessions/{session}', [TreatmentSessionController::class, 'destroy'])
    ->name('sessions.destroy');

/* Route::patch('/sessions/{session}', [TreatmentSessionController::class, 'update'])
    ->name('sessions.update'); */

    
/* Payments */
Route::post('/payments', [PaymentsController::class, 'store'])
    ->name('payments.store');



/* Session Type */
Route::get('/session-types',[SessionTypeController::class, 'index'])->name('sessions.types');

Route::post('/session-types',[SessionTypeController::class, 'store'])->name('sessions.types.store');

Route::put('/session-types/{session_type}',[SessionTypeController::class, 'update'])->name('sessions.types.update');

Route::delete('/session-types/{session_type}',[SessionTypeController::class, 'destroy'])->name('sessions.types.destroy');




/* Doctors Kine */
Route::prefix('doctors')->name('doctors.')->group(function () {

    Route::post('/',[DoctorController::class, 'store'])->name('store');

    Route::put('/{doctor}',[DoctorController::class, 'update'])->name('update');

    // Comisiones
    Route::post('{doctor}/commission-rules', [DoctorController::class, 'updateCommissionRules'])
        ->name('commission-rules.update');
    
    // Asignación de pacientes
    Route::post('{doctor}/patients/assign', [DoctorController::class, 'assignPatient'])
        ->name('patients.assign');
    Route::delete('{doctor}/patients/{patient}', [DoctorController::class, 'unassignPatient'])
        ->name('patients.unassign');
    
    // Toggle activo/inactivo
    Route::patch('{doctor}/toggle-active', [DoctorController::class, 'toggleActive'])
        ->name('toggle-active');
});



  Route::resource('health-insurers', HealthInsurerController::class)->names('health-insurers');
  Route::resource('insurance-companies', InsuranceCompanyController::class)->names('insurance-companies');
  Route::resource('plans', PlanController::class)->names('plans');














// =============================================================================
// RUTAS ADICIONALES PARA OPERACIONES ESPECÍFICAS
// =============================================================================

// Completar sesión
Route::put('/sessions/{session}/complete', [TreatmentSessionController::class, 'complete'])
    ->name('sessions.complete');

// Cancelar sesión
Route::put('/sessions/{session}/cancel', [TreatmentSessionController::class, 'cancel'])
    ->name('sessions.cancel');

// Duplicar sesión
Route::post('/sessions/{session}/duplicate', [TreatmentSessionController::class, 'duplicate'])
    ->name('sessions.duplicate');

// Recalcular KPIs del tratamiento
Route::post('/treatments/{treatment}/recalculate-kpis', [TreatmentController::class, 'recalculateKPIs'])
    ->name('treatments.recalculate-kpis');

// =============================================================================
// RUTAS DE API PARA BÚSQUEDAS Y FILTROS
// =============================================================================

// API para obtener tratamientos filtrados de un paciente
Route::get('/api/patients/{patient}/treatments', [TreatmentController::class, 'apiIndex'])
    ->name('api.treatments.index');

// API para obtener resumen de sesiones de un paciente
Route::get('/api/patients/{patient}/sessions/summary', [TreatmentSessionController::class, 'summary'])
    ->name('api.sessions.summary');















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


// routes/web.php

use App\Http\Controllers\Kine\KineMobileController;
use Inertia\Inertia;

// Portal Kine (requiere auth + rol kine)
Route::middleware(['auth', 'verified', 'kine'])
    ->prefix('kine')
    ->name('kine.')
    ->group(function () {
        
        Route::get('/dashboard', [KineMobileController::class, 'dashboard'])
            ->name('dashboard');
        
        Route::get('/sessions/create', [KineMobileController::class, 'createSession'])
            ->name('sessions.create');
        
        Route::post('/sessions', [KineMobileController::class, 'storeSession'])
            ->name('sessions.store');
        
        Route::get('/sessions', [KineMobileController::class, 'sessions'])
            ->name('sessions.index');
        
        Route::get('/payments', [KineMobileController::class, 'payments'])
            ->name('payments');
        
        Route::get('/profile', [KineMobileController::class, 'profile'])
            ->name('profile');
        
        Route::put('/profile', [KineMobileController::class, 'updateProfile'])
            ->name('profile.update');
    });

// Página de acceso denegado
Route::get('/kine/access-denied', function() {
    return Inertia::render('Kine/Mobile/AccessDenied');
})->name('kine.access-denied')->middleware('auth');