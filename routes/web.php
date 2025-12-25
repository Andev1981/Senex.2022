<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Artisan;

/* Inertia */
use App\Http\Controllers\Inertia\{
  InvoicesController,
  TreatmentController,
  VitalController,
};

use App\Http\Controllers\Attendances\AttendancesController;
use App\Http\Controllers\Patient\AuthController as PatientAuthController;

use App\Http\Controllers\{
  HomeController,
  AddressController,
  AuthorizedFolioController,
  CompanyController,
  DteConfigurationController,
  DteController,
  DteFolioController,
  PatientContactController,
  ProductController,
  TreatmentSessionController,
};
use App\Http\Controllers\Admin\Agreements\AgreementController;
use App\Http\Controllers\Admin\Agreements\AgreementRuleController;
use App\Http\Controllers\Admin\CompanySwitchController;
use App\Http\Controllers\Admin\Doctors\DoctorAdminController;
use App\Http\Controllers\Admin\Patients\PatientAdminController;
use App\Http\Controllers\Admin\SessionTypes\SessionTypeController;
use App\Http\Controllers\Admin\Treatments\TreatmentAdminController;
use App\Http\Controllers\Admin\TreatmentSessions\TreatmentSessionAdminController;
use App\Http\Controllers\Admin\Insurances\InsuranceController;
use App\Http\Controllers\Admin\Plans\PlanController;
use App\Http\Controllers\Patient\PatientDashboardController;
use App\Http\Controllers\Payments\WebpayController;
use App\Http\Controllers\Admin\Payments\PaymentsController;
use App\Http\Controllers\Admin\Plans\FamilyPlanController;
use App\Http\Controllers\Admin\SessionTypes\BranchSessionTypeController;
use App\Http\Controllers\KineMobile\DashboardController;
use App\Http\Controllers\KineMobile\PatientController;
use App\Http\Controllers\KineMobile\ProfileController;
use App\Http\Controllers\KineMobile\SessionController;
use App\Http\Controllers\PatientSearchController;

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

Route::post('/heartbeat', function () {
  return response()->json(['status' => 'ok']);
})->name('heartbeat');

Route::get('/admin/sessions/auto-update', function () {
  Artisan::call('sessions:auto-update-status');
  return 'Comando ejecutado. Ver logs en storage/logs/laravel.log';
})->middleware('auth');

Route::post('switch-company', [CompanySwitchController::class, 'switchCompany'])
  ->name('admin.switch-company')
  ->middleware(['auth', 'role:superadmin']);
Route::post('switch-branch', [CompanySwitchController::class, 'switchBranch'])
  ->name('admin.switch-branch')
  ->middleware(['auth', 'role:admin|superadmin']);



Route::group(['middleware' => ['auth']], function () {


  Route::get('/', [HomeController::class, 'index'])->name('/');

  Route::get('informes', [PatientAdminController::class, 'informes'])->name('informes');
  Route::get('agenda', [PatientAdminController::class, 'agenda'])->name('agenda');
  Route::get('tratamientos', [PatientAdminController::class, 'tratamientos'])->name('tratamientos');
  Route::post('patients-documents', [PatientAdminController::class, 'document_post'])->name('patient.documents.store');

  Route::post('patients/{patient}/addresses', [AddressController::class, 'store'])->name('patients.addresses.store');
  Route::patch('patients/{patient}/addresses', [AddressController::class, 'update'])->name('patients.addresses.update');
  Route::post('patients/{patient}/contacts', [PatientContactController::class, 'store'])->name('patients.contacts.store');
  Route::patch('patients/{patientContact}/contacts', [PatientContactController::class, 'update'])->name('patients.contacts.update');
  Route::post('patients/vitals', [VitalController::class, 'store'])->name('patients.vitals.store');
  Route::patch('patients/{vital}/vitals', [VitalController::class, 'update'])->name('patients.vitals.update');


  /* Crear Tratamiento */
  Route::post('patients/treatments', [TreatmentController::class, 'store'])->name('patients.treatments.store');
  Route::patch('patients/{treatment}/treatments', [TreatmentController::class, 'update'])->name('patients.treatments.update');



  // CRUD básico de treatment sessions
  Route::resource('treatment-sessions', TreatmentSessionController::class)
    ->names('treatment.sessions');

  // Rutas adicionales para funcionalidad avanzada
  Route::post('/treatment-sessions/bulk-update', [TreatmentSessionController::class, 'bulkUpdate'])
    ->name('treatment_sessions.bulk_update');

  Route::get('/treatment-sessions/{session}/stats', [TreatmentSessionController::class, 'getSessionStatistics'])
    ->name('treatment_sessions.stats');

  // Crear sesión desde appointment
  Route::get('/treatment-sessions/create-from-appointment/{appointment}', [TreatmentSessionController::class, 'createFromAppointment'])
    ->name('treatment_sessions.create_from_appointment');

  /* kines */
  Route::get('doctors', [DoctorAdminController::class, 'index'])->name('doctors');
  Route::get('doctors/{id}', [DoctorAdminController::class, 'edit'])->name('doctors.edit');

  // =============================================================================
  // RUTAS NUEVAS
  // =============================================================================

  Route::resource('patients', PatientAdminController::class)->names('patients');
  Route::post('patients/validate-rut', [PatientAdminController::class, 'checkExisting'])->name('patients.check-existing');


  Route::resource('doctors', DoctorAdminController::class)->names('doctors');
  Route::post('doctors/validate-rut', [DoctorAdminController::class, 'checkExisting'])->name('doctors.check-existing');
  // Comisiones
  Route::post('{doctor}/commission-rules', [DoctorAdminController::class, 'updateCommissionRules'])->name('doctors.commission-rules.update');
  // Asignación de pacientes
  Route::post('{doctor}/patients/assign', [DoctorAdminController::class, 'assignPatient'])->name('doctors.patients.assign');
  Route::delete('{doctor}/patients/{patient}', [DoctorAdminController::class, 'unassignPatient'])->name('doctors.patients.unassign');
  // Toggle activo/inactivo
  Route::patch('{doctor}/toggle-active', [DoctorAdminController::class, 'toggleActive'])->name('toggle-active');


  Route::resource('treatments', TreatmentAdminController::class)->names('treatments');


  Route::resource('sessions', TreatmentSessionAdminController::class)->names('sessions');

  /* RUTAS PARA CONFIGURAR EXCEPCIONES POR SUCURSAL EN TIPOS DE SESIÓN */
  // Ruta para OBTENER la configuración (para llenar el formulario)
  Route::get('/session-types/{sessionType}/branches/{branch}/config', [BranchSessionTypeController::class, 'show'])
    ->name('session-types.branch.show');

  // Ruta para GUARDAR la configuración
  Route::put('/session-types/{sessionType}/branches/{branch}/config', [BranchSessionTypeController::class, 'update'])
    ->name('session-types.branch.update');


  Route::resource('insurances', InsuranceController::class)->names('insurances');


  Route::resource('agreements', AgreementController::class)->names('agreements');


  Route::resource('agreement/rules', AgreementRuleController::class)->names('agreement.rules');


  Route::resource('plans', PlanController::class)->names('plans');
  Route::post('/plans/{plan}/assign-family', [FamilyPlanController::class, 'assign'])
    ->name('plans.assign.family');

  Route::get('/patients/search', [PatientSearchController::class, 'search']);


  Route::resource('patients', PatientAdminController::class)->names('patients');
  Route::post('patient/quick/store', [PatientAdminController::class, "quickStore"])->name('patients.quick_store');


  Route::resource('addresses', PatientAdminController::class)->names('addresses');


  Route::resource('payments', PaymentsController::class)->names('payments');
  Route::get('patient/status/{id}', [PaymentsController::class, 'getPatientStatus'])->name('patients.status');
  Route::post('payment/process', [PaymentsController::class, 'processPayment'])->name('payments.process');
  Route::get('/payments/success/{uuid}', [PaymentsController::class, 'success'])->name('payments.success');
  Route::post('/payments/pos/abort', [PaymentsController::class, 'abortPos'])->name('payments.pos.abort');



  // CRUD Básico de Empresas (Index, Create, Edit, Update)
  Route::resource('companies', CompanyController::class);

  // CRUD Básico de Productos (Index, Create, Edit, Update)
  Route::resource('products', ProductController::class);

  // Rutas para DTE y CAFs (Anidadas a una empresa específica)
  Route::prefix('companies/{company}')->name('companies.')->group(function () {

    // Guardar/Actualizar Configuración DTE (Certificado, Ambiente, Rut)
    Route::post('/dte-config', [DteConfigurationController::class, 'storeOrUpdate'])
      ->name('dte_config.store');

    // Subir CAF (XML)
    Route::post('/caf', [AuthorizedFolioController::class, 'store'])
      ->name('caf.store');
  });



  // Dashboard-kines (próxima fase)
  Route::get('/doctor/dashboard', [DashboardController::class, 'index'])
    ->name('kine.dashboard');

  Route::get('/doctor/dashboard/patients', [PatientController::class, 'index'])
    ->name('kine.my-patients');

  Route::get('/doctor/dashboard/sessions', [SessionController::class, 'index'])
    ->name('kine.my-sessions');
  Route::get('/doctor/dashboard/session/create', [SessionController::class, 'create'])
    ->name('kine.sessions.create');

  Route::get('/doctor/dashboard/profile', [ProfileController::class, 'index'])
    ->name('kine.my-profile');




  // Pagos
  Route::post('/sessions/{session}/pay/now', [PaymentsController::class, 'chargeNowForSession'])->name('sessions.pay.now');
  Route::post('/sessions/{session}/pay/webpay', [PaymentsController::class, 'createWebpay'])->name('sessions.pay.webpay');

  // Callback/return de WebPay (debe estar sin CSRF si es externo, usualmente en routes/web con except en VerifyCsrfToken)
  Route::match(['GET', 'POST'], '/payments/webpay/confirm', [PaymentsController::class, 'commit'])->name('payments.webpay.confirm');

  // Asignaciones de pagos
  Route::post('/invoices/{invoice}/allocate', [PaymentsController::class, 'allocateToInvoice'])->name('invoices.allocate');
  Route::post('/debts/{debt}/settle', [PaymentsController::class, 'settleDebt'])->name('debts.settle');


  Route::get('insurances/{insurance}/plans', [PlanController::class, 'index'])->name('insurances.plans');



  /* DOCUMENTOS TRIBUTARIOS */

  // Rutas de emisión y consulta (generalmente protegidas con middleware 'auth')
  /* CAF */
  // Ruta administrativa para cargar nuevos rangos de folios
  Route::post('/dte/admin/caf/upload', [DteFolioController::class, 'uploadCaf'])
    ->name('dte.admin.caf.upload');

  /* DTE */
  Route::get('/documents', [DteController::class, 'index'])->name('documents');
  Route::post('/dte/emit', [DteController::class, 'enviarDte'])->name('dte.emit');
  Route::post('/dte/check', [DteController::class, 'checkDteStatus'])->name('dte.check');

  /* Nuevas dte */
  Route::post('/dte/issue/{invoiceId}', [DteController::class, 'issueDte'])->name('dte.issue');
  Route::get('/dte/status/{invoiceId}', [DteController::class, 'checkDteStatus'])->name('dte.status');

  /* Payments */
  Route::post('/payments', [PaymentsController::class, 'store'])
    ->name('payments.store');

  /* Session Type */
  /* Route::get('/session-types',[SessionTypeController::class, 'index'])->name('sessions.types');

Route::post('/session-types',[SessionTypeController::class, 'store'])->name('sessions.types.store');

Route::put('/session-types/{session_type}',[SessionTypeController::class, 'update'])->name('sessions.types.update');

Route::delete('/session-types/{session_type}',[SessionTypeController::class, 'destroy'])->name('sessions.types.destroy'); */





  /* Route::resource('health-insurers', HealthInsurerController::class)->names('health-insurers');
  Route::resource('insurance-companies', InsuranceCompanyController::class)->names('insurance-companies');
  Route::resource('plans', PlanController::class)->names('plans');
 */













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




  /* Nuevos tratamientos */
  Route::resource('/session-types', SessionTypeController::class)->names('session-types');
  /*   Route::post('/admin/session-types',              [SessionTypeController::class, 'store'])->name('session-types.store');
  Route::put('/admin/session-types/{sessionType}', [SessionTypeController::class, 'update'])->name('session-types.update');
  Route::delete('/admin/session-types/{sessionType}', [SessionTypeController::class, 'destroy'])->name('session-types.destroy'); */


  Route::get('/fix', [HomeController::class, 'fix']);


  /* SeniorSenex */
  // Gestión de atenciones (presencial)
  // Vista principal de atenciones
  Route::get('/attendances', [AttendancesController::class, 'index'])->name('attendances.index');

  // Acciones sobre sesiones
  Route::post('/attendances/store', [AttendancesController::class, 'store'])->name('attendances.store');
  Route::patch('/attendances/{id}/patch', [AttendancesController::class, 'update'])->name('attendances.update');
  Route::patch('/attendances/{id}/start', [AttendancesController::class, 'startSession'])->name('attendances.start');
  Route::patch('/attendances/{id}/complete', [AttendancesController::class, 'completeSession'])->name('attendances.complete');
  Route::patch('/attendances/{id}/cancel', [AttendancesController::class, 'cancelSession'])->name('attendances.cancel');
  Route::patch('/attendances/{id}/absent', [AttendancesController::class, 'markAbsent'])->name('attendances.absent');





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




// =============================================================================
// PAGOS AUTENTICADOS - Sistema Interno
// =============================================================================

Route::middleware(['auth', 'verified'])->prefix('payments/webpay')->name('payments.webpay.')->group(function () {

  // Iniciar pagos (usuarios autenticados)
  Route::post('/session/{session}', [WebpayController::class, 'initSessionPayment'])
    ->name('session');

  Route::post('/sessions/multiple', [WebpayController::class, 'initMultipleSessionsPayment'])
    ->name('sessions.multiple');

  Route::post('/debts', [WebpayController::class, 'initDebtsPayment'])
    ->name('debts');

  Route::post('/plan/{plan}', [WebpayController::class, 'initPlanPayment'])
    ->name('plan');

  Route::get('/{token}/status', [WebpayController::class, 'status'])
    ->name('status');
});

// Retorno desde Transbank para USUARIOS AUTENTICADOS
// ⚠️ SIN MIDDLEWARE - Transbank hace el callback sin autenticación
Route::match(['GET', 'POST'], '/payments/webpay/return', [WebpayController::class, 'return'])
  ->name('payments.webpay.return');



// Ruta de prueba Webpay (solo desarrollo)
if (app()->environment('local', 'development')) {
  Route::middleware(['auth', 'verified'])
    ->get('/test/webpay', [App\Http\Controllers\Test\WebpayTestController::class, 'index'])
    ->name('test.webpay');

  Route::get('/test/pos', [WebpayController::class, 'paymentPos'])
    ->name('test.pos');
}


// Página principal del portal
Route::get('/pagar', [WebpayController::class, 'portalPagosIndex'])
  ->name('portal.pago');

// API: Consultar deudas por RUT
Route::post('/pagar', [WebpayController::class, 'consultarDeudas'])
  ->name('portal.pago.consultar');

Route::get('/pagar/auto/{rut}', [WebpayController::class, 'magicLink'])
  ->name('portal.pago.magic')
  ->middleware('signed');

// ============================================================================
// AUTENTICACIÓN DE PACIENTES - Rutas Públicas
// ============================================================================

Route::prefix('patient')->name('patient.')->group(function () {

  // Rutas sin autenticación (guest)
  Route::middleware('guest:patient')->group(function () {

    // Mostrar formulario de login
    Route::get('/login', [PatientAuthController::class, 'showLogin'])
      ->name('login');

    // Solicitar código de acceso
    Route::post('/request-code', [PatientAuthController::class, 'requestCode'])
      ->name('request-code');

    // Verificar código
    Route::post('/verify-code', [PatientAuthController::class, 'verifyCode'])
      ->name('verify-code');

    // ✅ NUEVO: Mostrar formulario de verificación
    Route::get('/verify-code', [PatientAuthController::class, 'showVerifyCode'])
      ->name('verify-code.show');

    // Reenviar código
    Route::post('/resend-code', [PatientAuthController::class, 'resendCode'])
      ->name('resend-code');
  });

  // Rutas con autenticación (auth:patient)
  Route::middleware('auth:patient')->group(function () {

    // Cerrar sesión
    Route::post('/logout', [PatientAuthController::class, 'logout'])
      ->name('logout');

    // Dashboard (próxima fase)
    Route::get('/dashboard', [PatientDashboardController::class, 'index'])
      ->name('dashboard');
  });



  // Cerrar sesión
  Route::post('/logout', [PatientAuthController::class, 'logout'])
    ->name('logout');
});


    

/* Tareas pendientes */
/* Igualar formularios de creación de sesiones en tratamientos y pacientes */
/* Traducir estados en patient/treatments */
/* Número de sesión mejorar para casos en que se pone una sesion entre medio y que vuelva a ordenar los numero de sesión global y del mes */