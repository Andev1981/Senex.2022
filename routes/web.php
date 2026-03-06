<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\App;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;


/* Acquisitions */
use App\Http\Controllers\Admin\Acquisitions\{
  AcquisitionController,
  SupplierController,
  PurchaseOrderController
};

/* Addresses */
use App\Http\Controllers\Admin\Addresses\{
  AddressController
};

/* Admin */
use App\Http\Controllers\Admin\Agreements\{
  AgreementController,
  AgreementRuleController
};

/* Attendances */
use App\Http\Controllers\Admin\Attendances\{
  AttendancesController
};

/* Calendars */
use App\Http\Controllers\Admin\Calendars\{
  AgendaSlotController,
  CalendarAccountController,
  CalendarEventController,
  ScheduleController
};

/* KineMobile */
use App\Http\Controllers\Admin\Clients\{
  ClientAuthController,
  ClientDashboardController
};

/* Companies */
use App\Http\Controllers\Admin\Companies\{
  CompanyController,
  CompanySwitchController
};

/* Doctors */
use App\Http\Controllers\Admin\Doctors\{
  DoctorAdminController
};

/* Dtes */
use App\Http\Controllers\Admin\Dtes\{
  AuthorizedFolioController,
  DteCongratulationController,
  DteController,
  DteFolioController,
  DteConfigurationController
};

/* Finance */
use App\Http\Controllers\Admin\Finance\{
  ReceivablesController
};

/* MedicalHistorials */
use App\Http\Controllers\Admin\MedicalHistorials\{
  MedicalHistoryController
};

/* Insurances */
use App\Http\Controllers\Admin\Insurances\{
  InsuranceController
};

/* Insurances */
use App\Http\Controllers\Admin\Invoices\{
  InvoicesController
};

/* Patients */
use App\Http\Controllers\Admin\Patients\{
  PatientAdminController, 
  PatientContactController, 
  PatientController, 
  PatientSearchController,
  VitalSignController
};

/* Payments */
use App\Http\Controllers\Admin\Payments\{
  PaymentReminderController, 
  PaymentsController, 
  WebpayController
};

/* Payroll */
use App\Http\Controllers\Admin\Payroll\{
  PayrollController
};

/* Plans */
use App\Http\Controllers\Admin\Plans\{
  FamilyPlanController, 
  PlanController,
  PatientPlansController
};

/* Products */
use App\Http\Controllers\Admin\Products\{
  ProductController
};

/* Reports */
use App\Http\Controllers\Admin\Reports\{
  ReportsController
};

/* Roles */
use App\Http\Controllers\Admin\Roles\{
  RoleController
};

/* SessionTypes */
use App\Http\Controllers\Admin\SessionTypes\{
  BranchSessionTypeController, 
  SessionTypeController
};

/* Subscription */
use App\Http\Controllers\Admin\Subscription\{
  SubscriptionController
};

/* Treatments */
use App\Http\Controllers\Admin\Treatments\{
  TreatmentAdminController
};

/* TreatmentSessions */
use App\Http\Controllers\Admin\TreatmentSessions\{
  TreatmentSessionController
};

/* KineMobile */
use App\Http\Controllers\KineMobile\{
  DashboardMobileController, 
  PatientMobileController, 
  ProfileMobileController, 
  SessionMobileController
};

/* Commons */
use App\Http\Controllers\{
  ExternalDataController,
  FileProxyController,
  HomeController,
  SesionController,
  UserController,
};

/* Auth */
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

  Route::get('informes', [ReportsController::class, 'index'])->name('informes');
  Route::get('agenda', [PatientAdminController::class, 'agenda'])->name('agenda');
  Route::get('tratamientos', [PatientAdminController::class, 'tratamientos'])->name('tratamientos');
  Route::post('patients-documents', [PatientAdminController::class, 'document_post'])->name('patient.documents.store');

  Route::post('patients/{patient}/addresses', [AddressController::class, 'store'])->name('patients.addresses.store');
  Route::patch('patients/{patient}/addresses', [AddressController::class, 'update'])->name('patients.addresses.update');
  Route::post('patients/{patient}/contacts', [PatientContactController::class, 'store'])->name('patients.contacts.store');
  Route::patch('patients/{patientContact}/contacts', [PatientContactController::class, 'update'])->name('patients.contacts.update');
  Route::post('patients/vitals', [VitalSignController::class, 'store'])->name('patients.vitals.store');
  Route::patch('patients/{vital}/vitals', [VitalSignController::class, 'update'])->name('patients.vitals.update');


  /* Crear Tratamiento */
  Route::post('patients/treatments', [TreatmentAdminController::class, 'store'])->name('patients.treatments.store');
  Route::patch('patients/{treatment}/treatments', [TreatmentAdminController::class, 'update'])->name('patients.treatments.update');



  // CRUD básico de treatment sessions
  Route::resource('treatment-sessions', TreatmentSessionController::class)
    ->names('treatment.sessions');

  /* kines */
  /*  Route::get('doctors', [DoctorAdminController::class, 'index'])->name('doctors');
  Route::get('doctors/{id}', [DoctorAdminController::class, 'edit'])->name('doctors.edit'); */

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


  Route::resource('sessions', TreatmentSessionController::class)->names('sessions');
  Route::post('/sessions/{session}/notify', [TreatmentSessionController::class, 'notify'])->name('sessions.notify');

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


  Route::post('payrolls/preview', [PayrollController::class, 'preview'])->name('payrolls.preview');
  Route::resource('payrolls', PayrollController::class)->names('payrolls');
  Route::get('payrolls/{payroll}/pdf', [PayrollController::class, 'downloadPdf'])->name('payrolls.pdf');
  Route::post('payrolls/{payroll}/approve', [PayrollController::class, 'approve'])->name('payrolls.approve');
  Route::post('payrolls/{payroll}/pay', [PayrollController::class, 'markPaid'])->name('payrolls.pay');


  Route::resource('plans', PlanController::class)->names('plans');
  Route::resource('patient-plans', PatientPlansController::class)->names('patient-plans');
  Route::post('/plans/{plan}/assign-family', [FamilyPlanController::class, 'assign'])
    ->name('plans.assign.family');

  // New: Acquisitions Module Routes
  Route::prefix('acquisitions')->name('acquisitions.')->group(function () {
    Route::resource('suppliers', SupplierController::class);
    Route::resource('purchase-orders', PurchaseOrderController::class);
    Route::post('purchase-orders/{order}/status', [PurchaseOrderController::class, 'updateStatus'])->name('purchase-orders.status');
  });

  // New: Finance Module Routes
  Route::prefix('finance')->name('finance.')->group(function () {
    Route::get('receivables', [\App\Http\Controllers\Admin\Finance\ReceivablesController::class, 'index'])->name('receivables.index');
  });

  // New: Subscription Module Routes
  Route::prefix('subscription')->name('subscription.')->group(function () {
    Route::get('/', [\App\Http\Controllers\Admin\Subscription\SubscriptionController::class, 'index'])->name('index');
    Route::post('/', [\App\Http\Controllers\Admin\Subscription\SubscriptionController::class, 'store'])->name('store');
  });

  Route::get('/patients/search', [PatientSearchController::class, 'search']);
  Route::get('/external-data/company/{rut}', [ExternalDataController::class, 'getCompanyByRut'])->name('external-data.company');


  Route::resource('patients', PatientAdminController::class)->names('patients');
  Route::post('patient/quick/store', [PatientAdminController::class, "quickStore"])->name('patients.quick_store');


  Route::resource('addresses', PatientAdminController::class)->names('addresses');


  Route::resource('payments', PaymentsController::class)->names('payments');
  Route::get('/payments/{uuid}/pdf/{download?}', [PaymentsController::class, 'downloadReceiptPdf'])->name('payments.pdf');
  Route::get('patient/status/{id}', [PaymentsController::class, 'getPatientStatus'])->name('patients.status');
  Route::post('payment/process', [PaymentsController::class, 'processPayment'])->name('payments.process');
  Route::get('/payments/success/{uuid}', [PaymentsController::class, 'success'])->name('payments.success');
  Route::post('/payments/pos/abort', [PaymentsController::class, 'abortPos'])->name('payments.pos.abort');



  // CRUD Básico de Empresas (Index, Create, Edit, Update)
  Route::resource('companies', CompanyController::class);

  // CRUD Básico de Productos (Index, Create, Edit, Update)
  Route::post('companies/{company}/branches', [CompanyController::class, 'storeBranch'])->name('companies.branches.store');
  Route::put('companies/{company}/branches/{branch}', [CompanyController::class, 'updateBranch'])->name('companies.branches.update');
  Route::delete('companies/{company}/branches/{branch}', [CompanyController::class, 'destroyBranch'])->name('companies.branches.destroy');

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
  Route::get('/doctor/dashboard', [DashboardMobileController::class, 'index'])
    ->name('kine.dashboard');

  Route::get('/doctor/dashboard/patients', [PatientMobileController::class, 'index'])
    ->name('kine.my-patients');

  Route::get('/doctor/dashboard/sessions', [SessionMobileController::class, 'index'])
    ->name('kine.my-sessions');
  Route::get('/doctor/dashboard/session/create', [SessionMobileController::class, 'create'])
    ->name('kine.sessions.create');

  Route::get('/doctor/dashboard/profile', [ProfileMobileController::class, 'index'])
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
  Route::post('/documents', [DteController::class, 'store'])->name('documents.store');
  Route::post('/dte/emit', [DteController::class, 'enviarDte'])->name('dte.emit');
  Route::post('/dte/check', [DteController::class, 'checkDteStatus'])->name('dte.check');
  Route::get('/dte/lookup/{folio}', [DteController::class, 'lookupByFolio'])->name('dte.lookup');
  Route::get('/dte/consultar-rut/{rut}', [DteController::class, 'consultContribuyente'])->name('dte.consultar_rut');

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
  Route::post('/treatments/{treatment}/recalculate-kpis', [TreatmentAdminController::class, 'recalculateKPIs'])
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
  /* Route::post('/attendances/store', [AttendancesController::class, 'store'])->name('attendances.store');
  Route::patch('/attendances/{id}/patch', [AttendancesController::class, 'update'])->name('attendances.update'); */
  Route::patch('/attendances/{id}/start', [AttendancesController::class, 'startSession'])->name('attendances.start');
  Route::patch('/attendances/{id}/complete', [AttendancesController::class, 'completeSession'])->name('attendances.complete');
  Route::patch('/attendances/{id}/cancel', [AttendancesController::class, 'cancelSession'])->name('attendances.cancel');
  Route::patch('/attendances/{id}/absent', [AttendancesController::class, 'markAbsent'])->name('attendances.absent');





  // File Proxy (Secure Access)
  Route::get('/attachments/{attachment}/stream', [\App\Http\Controllers\FileProxyController::class, 'streamAttachment'])->name('attachments.stream');
  Route::get('/invoices/{invoice}/pdf/stream', [\App\Http\Controllers\FileProxyController::class, 'streamInvoicePdf'])->name('invoices.pdf.stream');
  Route::get('/doctors/{doctor}/signature', [\App\Http\Controllers\FileProxyController::class, 'streamDoctorSignature'])->name('doctors.signature.stream');

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
  Route::post('/invoices/{invoice}/send-email', [InvoicesController::class, 'sendEmail'])
    ->name('invoices.send_email');
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
/* if (app()->environment('local', 'development')) {
  Route::middleware(['auth', 'verified'])
    ->get('/test/webpay', [App\Http\Controllers\Test\WebpayTestController::class, 'index'])
    ->name('test.webpay');

  Route::get('/test/pos', [WebpayController::class, 'paymentPos'])
    ->name('test.pos');
} */

Route::middleware(['auth'])->prefix('dev')->group(function () {
  if (App::isLocal()) {
    Route::post('optimize', function () {
      Artisan::call('optimize:clear');
      return response()->json(['message' => 'Optimización (Limpieza) completada']);
    });

    Route::post('route-clear', function () {
      Artisan::call('route:clear');
      return response()->json(['message' => 'Caché de rutas limpiada']);
    });

    Route::post('view-clear', function () {
      Artisan::call('view:clear');
      return response()->json(['message' => 'Caché de vistas limpiada']);
    });

    Route::post('config-cache', function () {
      Artisan::call('config:clear');
      return response()->json(['message' => 'Caché de configuración eliminada']);
    });

    Route::post('storage-link', function () {
      Artisan::call('storage:link');
      return response()->json(['message' => 'Link de almacenamiento creado']);
    });

    Route::post('/login-as/{id}', function ($id) {
      Auth::loginUsingId($id);

      // Limpiar contexto de sesión para que HandleInertiaRequests recargue los datos del nuevo usuario
      session()->forget(['current_company_id', 'active_branch_id']);

      return back()->with('success', 'Login como ID: ' . $id);
    });

    Route::post('/migrate-fresh', function () {
      Artisan::call('migrate:fresh --seed');
      return back()->with('success', 'DB Reiniciada y Sembrada');
    });

    Route::post('/rebuild-app', function () {
      // 1. Evitar que el navegador mate el proceso (5 minutos máximo)
      set_time_limit(300); 
      ini_set('memory_limit', '512M'); // Darle más memoria RAM por si acaso

      try {
          // 2. Usar migrate:fresh en lugar de db:seed
          // Esto borra las tablas físicamente y las vuelve a crear.
          // Es mucho más seguro que un truncate manual.
          Artisan::call('migrate:fresh', [
              '--seed' => true,
              '--seeder' => 'Database\\Seeders\\AllSeeder', // Especificamos tu clase
              '--force' => true // Necesario si estás en producción/staging
          ]);
          
          // Opcional: Limpiar caché para que no queden datos viejos pegados
          Artisan::call('cache:clear');
          Artisan::call('config:clear');

          \Log::warning('success');
          return back()->with('success', '¡Base de datos nuclearizada y regenerada exitosamente!');

      } catch (\Exception $e) {
          \Log::error('error: '. $e->getMessage());
          // Si falla, mostramos el error real en pantalla
          return back()->with('error', 'Error crítico al reconstruir: ' . $e->getMessage());
      }
    });

    Route::post('/run-jobs', function () {
      Artisan::call('queue:work --stop-when-empty');
      return back()->with('success', 'Jobs procesados exitosamente');
    });

    Route::post('/dispatch-test-job', function () {
      dispatch(function () {
        logger('Test job executed');
      });
      return back()->with('success', 'Test Job despachado a la cola');
    });

    Route::get('/debug-db', function () {
      $db = DB::connection()->getDatabaseName();
      $columns = \Illuminate\Support\Facades\Schema::getColumnListing('patients');
      return response()->json([
        'database' => $db,
        'columns_in_patients_table' => $columns,
        'has_user_id' => in_array('user_id', $columns)
      ]);
    });
  }
});


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
    Route::get('/login', [ClientAuthController::class, 'showLogin'])
      ->name('login');

    // Solicitar código de acceso
    Route::post('/request-code', [ClientAuthController::class, 'requestCode'])
      ->name('request-code');

    // Verificar código
    Route::post('/verify-code', [ClientAuthController::class, 'verifyCode'])
      ->name('verify-code');

    // ✅ NUEVO: Mostrar formulario de verificación
    Route::get('/verify-code', [ClientAuthController::class, 'showVerifyCode'])
      ->name('verify-code.show');

    // Reenviar código
    Route::post('/resend-code', [ClientAuthController::class, 'resendCode'])
      ->name('resend-code');
  });

  // Rutas con autenticación (auth:patient)
  Route::middleware('auth:patient')->group(function () {

    // Cerrar sesión
    Route::post('/logout', [ClientAuthController::class, 'logout'])
      ->name('logout');

    // Dashboard (próxima fase)
    Route::get('/dashboard', [ClientDashboardController::class, 'index'])
      ->name('dashboard');
  });



  // Cerrar sesión
  Route::post('/logout', [ClientAuthController::class, 'logout'])
    ->name('logout');
});


// Ruta ligera para mantener la sesión activa
Route::get('/session-keep-alive', function () {
    return response()->json(['status' => 'alive']);
})->middleware(['web']);

    

/* Tareas pendientes */
/* Igualar formularios de creación de sesiones en tratamientos y pacientes */
/* Traducir estados en patient/treatments */
/* Número de sesión mejorar para casos en que se pone una sesion entre medio y que vuelva a ordenar los numero de sesión global y del mes */