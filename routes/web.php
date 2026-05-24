<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\App;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

/* Acquisitions */
use App\Http\Controllers\Admin\Acquisitions\{
  AcquisitionController,
  SupplierController,
  PurchaseOrderController
};

use App\Http\Controllers\Admin\UserManagementController;

/* Addresses */
use App\Http\Controllers\Admin\Addresses\{
  AddressController
};

/* Admin */
use App\Http\Controllers\Admin\Agreements\{
  AgreementController,
  AgreementRuleController
};

/* Attendances - DEFUNCT (Merged into TreatmentSessions) */

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

/* Companies */
use App\Http\Controllers\Admin\Branches\{
    BranchController
};

/* Doctors */
use App\Http\Controllers\Admin\Doctors\{
  DoctorAdminController,
  KineController
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

/* Invoices */
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


//Reoptimized class loader:
Route::get('/optimize', function () {
    $optimize = Artisan::call('optimize');
    $routeCache = Artisan::call('route:cache');
    $routeCache = Artisan::call('route:clear');
    $viewClear = Artisan::call('view:clear');
    $configCache = Artisan::call('config:cache');
    return '<h1>Reoptimized class loader</h1>';
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


  //Linkear imagenes:
  Route::get('/storage-link', function () {
    $exitCode = Artisan::call('storage:link');
    return '<h1>Storage Link</h1>';
  });
  
/* Auth */
require __DIR__ . '/auth.php';

// =============================================================================
// RUTAS PÚBLICAS Y UTILIDADES
// =============================================================================

Route::post('/heartbeat', function () {
  return response()->json(['status' => 'ok']);
})->name('heartbeat');

Route::get('/session-keep-alive', function () {
    return response()->json(['status' => 'alive']);
})->middleware(['web']);

// =============================================================================
// CERTIFICACIÓN TRANSBANK (PÚBLICO)
// =============================================================================
Route::prefix('certificacion/webpay')->name('public.webpay.')->group(function () {
    Route::get('/checkout', [WebpayController::class, 'checkoutView'])->name('checkout');
    Route::post('/product', [WebpayController::class, 'initiateProductPayment'])->name('init-product');
});

// Retorno público para Certificación o Links Mágicos (Sin Auth)
Route::match(['GET', 'POST'], '/webpay/public/return', [WebpayController::class, 'publicReturn'])
  ->name('public.webpay.return');

// =============================================================================
// CONFIRMACIÓN DE CITAS (PÚBLICO CON FIRMA)
// =============================================================================
Route::get('/confirmar-cita/{appointment}', [\App\Http\Controllers\Public\AppointmentConfirmationController::class, 'confirm'])
    ->name('appointment.confirm')
    ->middleware('signed');

Route::get('/cancelar-cita/{appointment}', [\App\Http\Controllers\Public\AppointmentConfirmationController::class, 'cancel'])
    ->name('appointment.cancel')
    ->middleware('signed');

// =============================================================================
// PORTAL DE PAGOS PACIENTES (PÚBLICO)
// =============================================================================
Route::get('/pagar', [WebpayController::class, 'portalPagosIndex'])->name('portal.pago');
Route::post('/pagar', [WebpayController::class, 'consultarDeudas'])->name('portal.pago.consultar');
Route::get('/pagar/auto/{rut}', [WebpayController::class, 'magicLink'])->name('portal.pago.magic')->middleware('signed');

// =============================================================================
// GRUPO AUTENTICADO (ADMIN / KINES)
// =============================================================================
Route::middleware(['auth'])->group(function () {

Route::get('/', [HomeController::class, 'index'])->name('/');
Route::get('/dashboard', [HomeController::class, 'index'])->name('dashboard');

  // ÁREA ADMINISTRATIVA (Solo Admin y Superadmin)
  Route::middleware(['role:admin|superadmin'])->group(function () {
    // Gestión de Compañía/Sucursal
    Route::post('switch-company', [CompanySwitchController::class, 'switchCompany'])->name('admin.switch-company')->middleware('role:superadmin');
    Route::post('switch-branch', [CompanySwitchController::class, 'switchBranch'])->name('admin.switch-branch');

    // Pacientes (Mantenimiento completo solo admin)
    Route::resource('patients', PatientAdminController::class)->except(['index', 'show'])->names('patients');

    // Tratamientos y Sesiones
    Route::resource('treatments', TreatmentAdminController::class)->names('treatments');
    Route::resource('sessions', TreatmentSessionController::class)->names('sessions');
    Route::post('/sessions/{session}/notify', [TreatmentSessionController::class, 'notify'])->name('sessions.notify');
    Route::post('/sessions/{session}/move-to-room', [TreatmentSessionController::class, 'moveToRoom'])->name('sessions.move-to-room');
    Route::post('/sessions/{session}/duplicate', [TreatmentSessionController::class, 'duplicate'])->name('sessions.duplicate');

    // Finanzas e Invoices
    Route::get('/invoices', [InvoicesController::class, 'index'])->name('invoices.index');
    Route::post('/invoices/{invoice}/cancel', [InvoicesController::class, 'cancel'])->name('invoices.cancel');
    Route::get('/invoices/{invoice}/pdf', [InvoicesController::class, 'downloadPdf'])->name('invoices.pdf');

    // Liquidaciones (Payroll)
    Route::prefix('payrolls')->name('payrolls.')->group(function () {
        Route::post('preview', [PayrollController::class, 'preview'])->name('preview');
        Route::post('{payroll}/approve', [PayrollController::class, 'approve'])->name('approve');
        Route::post('{payroll}/paid', [PayrollController::class, 'markPaid'])->name('paid');
        Route::get('{payroll}/pdf', [PayrollController::class, 'downloadPdf'])->name('pdf');
    });
    Route::resource('payrolls', PayrollController::class)->names('payrolls');

    // Adquisiciones y Proveedores
    Route::prefix('acquisitions')->name('acquisitions.')->group(function () {
        Route::resource('suppliers', SupplierController::class)->names('suppliers');
        Route::resource('purchase-orders', PurchaseOrderController::class)->names('purchase-orders');
    });

    // Finanzas / Cuentas por Cobrar
    Route::prefix('finance')->name('finance.')->group(function () {
        Route::get('receivables', [ReceivablesController::class, 'index'])->name('receivables.index');
        Route::post('receivables/{receivable}/settle', [ReceivablesController::class, 'settle'])->name('receivables.settle');
    });

    // Catálogo Unificado (Productos y Servicios)
    Route::resource('products', ProductController::class);
    Route::resource('categories', \App\Http\Controllers\Admin\Products\CategoryController::class);

    // Otros Módulos Maestros
    Route::resource('companies', CompanyController::class);
    Route::resource('branches', BranchController::class);
    Route::put('branches/{branch}/schedule', [\App\Http\Controllers\Admin\Calendars\AvailabilityController::class, 'updateBranchSchedule'])->name('branches.schedule.update');
    Route::resource('availabilities', \App\Http\Controllers\Admin\Calendars\AvailabilityController::class);
    Route::post('availabilities/exceptions', [\App\Http\Controllers\Admin\Calendars\AvailabilityController::class, 'storeException'])->name('availabilities.exceptions.store');
    Route::delete('availabilities/exceptions/{exception}', [\App\Http\Controllers\Admin\Calendars\AvailabilityController::class, 'destroyException'])->name('availabilities.exceptions.destroy');
    Route::post('availabilities/holidays', [\App\Http\Controllers\Admin\Calendars\AvailabilityController::class, 'storeHoliday'])->name('availabilities.holidays.store');
    Route::delete('availabilities/holidays/{holiday}', [\App\Http\Controllers\Admin\Calendars\AvailabilityController::class, 'destroyHoliday'])->name('availabilities.holidays.destroy');
    Route::post('branches/{branch}/rooms', [\App\Http\Controllers\Admin\Branches\RoomController::class, 'store'])->name('branches.rooms.store');
    Route::put('rooms/{room}', [\App\Http\Controllers\Admin\Branches\RoomController::class, 'update'])->name('rooms.update');
    Route::delete('rooms/{room}', [\App\Http\Controllers\Admin\Branches\RoomController::class, 'destroy'])->name('rooms.destroy');    Route::resource('doctors', DoctorAdminController::class)->names('doctors');
    Route::resource('plans', PlanController::class)->names('plans');
    Route::post('patient-plans', [\App\Http\Controllers\Admin\Plans\PatientPlanController::class, 'store'])->name('patient-plans.store');
    Route::resource('insurances', InsuranceController::class)->names('insurances');
    Route::resource('agreements', AgreementController::class)->names('agreements');
    Route::post('agreement-rules/upsert', [AgreementRuleController::class, 'upsert'])->name('agreement.rules.upsert');
    Route::resource('agreement-rules', AgreementRuleController::class)->names('agreement.rules');
    Route::get('informes', [ReportsController::class, 'index'])->name('informes');

    // Módulo DTE / Documentos
    Route::get('documents', [DteController::class, 'index'])->name('documents');
    Route::post('documents', [DteController::class, 'store'])->name('documents.store');
    Route::post('documents/{invoice}/issue', [DteController::class, 'issueDte'])->name('dte.issue');
    Route::get('documents/{invoice}/status', [DteController::class, 'checkDteStatus'])->name('dte.status');
  });

    // ÁREA COMPARTIDA (Admin, Superadmin y Cajero)
    Route::middleware(['role:admin|superadmin|cajero|kine'])->group(function () {
    Route::get('agendas/available-slots', [\App\Http\Controllers\Admin\Calendars\AppointmentController::class, 'getAvailableSlots'])->name('agendas.available-slots');
    Route::get('agendas', [\App\Http\Controllers\Admin\Calendars\AppointmentController::class, 'index'])->name('agendas.index');
    Route::post('agendas', [\App\Http\Controllers\Admin\Calendars\AppointmentController::class, 'store'])->name('agendas.store');
    Route::post('agendas/{appointment}/checkin', [\App\Http\Controllers\Admin\Calendars\AppointmentController::class, 'checkin'])->name('agendas.checkin');
    Route::post('agendas/{appointment}/absent', [\App\Http\Controllers\Admin\Calendars\AppointmentController::class, 'absent'])->name('agendas.absent');
    Route::post('agendas/{appointment}/cancel', [\App\Http\Controllers\Admin\Calendars\AppointmentController::class, 'cancel'])->name('agendas.cancel');
    Route::delete('agendas/{appointment}', [\App\Http\Controllers\Admin\Calendars\AppointmentController::class, 'destroy'])->name('agendas.destroy');
    
    Route::get('patients', [PatientAdminController::class, 'index'])->name('patients.index');
    Route::get('patients/{patient}', [PatientAdminController::class, 'show'])->name('patients.show');
    Route::post('patients/validate-rut', [PatientAdminController::class, 'checkExisting'])->name('patients.check-existing');
    Route::post('patients/quick-store', [PatientAdminController::class, "quickStore"])->name('patients.quick_store');
    Route::get('/patients/search', [PatientSearchController::class, 'search']);
    
    Route::get('/invoices/{invoice}', [InvoicesController::class, 'show'])->name('invoices.show');
    Route::post('/invoices/{invoice}/send-email', [InvoicesController::class, 'sendEmail'])->name('invoices.send_email');
    Route::get('/invoices/{invoice}/pdf', [InvoicesController::class, 'downloadPdf'])->name('invoices.pdf');

    Route::get('external-data/company/{rut}', [DteController::class, 'consultContribuyente'])->name('external-data.company');
    Route::get('external-data/search-name', [ExternalDataController::class, 'searchByName'])->name('external-data.search-name');
    Route::get('documents/lookup/{folio}', [DteController::class, 'lookupByFolio'])->name('dte.lookup');
  });

  // ÁREA DEL KINESIÓLOGO (Accesible por Kine, Admin y Superadmin)
  Route::middleware(['role:kine|admin|superadmin'])->prefix('kine')->name('kine.')->group(function () {
      Route::get('/dashboard', [DashboardMobileController::class, 'index'])->name('dashboard');
      Route::get('/pending-sessions', [DashboardMobileController::class, 'pendingSessions'])->name('pending-sessions');
      Route::post('/dashboard/refresh', [DashboardMobileController::class, 'refreshKpis'])->name('dashboard.refresh');
      
      // Rutas de Atención Móvil
      Route::get('/sessions/create', [SessionMobileController::class, 'showForm'])->name('sessions.create');
      Route::get('/sessions/form/{id?}', [SessionMobileController::class, 'showForm'])->name('sessions.form');
      Route::get('/sessions/{id}', [SessionMobileController::class, 'show'])->name('sessions.show');
      Route::post('/sessions/{id}/start', [SessionMobileController::class, 'startSession'])->name('sessions.start');
      Route::post('/sessions/{id}/complete', [SessionMobileController::class, 'completeSession'])->name('sessions.complete');
      Route::post('/sessions/{id}/cancel', [SessionMobileController::class, 'cancelSession'])->name('sessions.cancel');
      Route::put('/sessions/{id}/notes', [SessionMobileController::class, 'updateNotes'])->name('sessions.update-notes');

      // Gestión de Pacientes y Sesiones
      Route::get('/my-patients', [PatientMobileController::class, 'index'])->name('my-patients'); 
      Route::get('/patient/{patient}', [PatientMobileController::class, 'show'])->name('patient.show');
      Route::get('/my-sessions', [KineController::class, 'mySessions'])->name('my-sessions');
      
      // Perfil y Finanzas
      Route::get('/my-profile', [ProfileMobileController::class, 'index'])->name('my-profile');
      Route::get('/my-wallet', [ProfileMobileController::class, 'wallet'])->name('my-wallet');
      Route::get('/my-schedule', [\App\Http\Controllers\KineMobile\ScheduleMobileController::class, 'index'])->name('my-schedule');
      Route::post('/my-schedule/availability', [\App\Http\Controllers\KineMobile\ScheduleMobileController::class, 'storeAvailability'])->name('my-schedule.availability.store');
      Route::delete('/my-schedule/availability/{availability}', [\App\Http\Controllers\KineMobile\ScheduleMobileController::class, 'destroyAvailability'])->name('my-schedule.availability.destroy');
      Route::post('/my-schedule/exception', [\App\Http\Controllers\KineMobile\ScheduleMobileController::class, 'storeException'])->name('my-schedule.exception.store');
      Route::delete('/my-schedule/exception/{exception}', [\App\Http\Controllers\KineMobile\ScheduleMobileController::class, 'destroyException'])->name('my-schedule.exception.destroy');
      Route::get('/my-schedule-new', [\App\Http\Controllers\KineMobile\ScheduleMobileController::class, 'testIndex'])->name('my-schedule-new');
      Route::post('/my-profile/update', [ProfileMobileController::class, 'update'])->name('profile.update');
      Route::post('/my-profile/password', [ProfileMobileController::class, 'updatePassword'])->name('profile.password');
  });

  // =============================================================================
  // RUTAS COMUNES (Atenciones, Pagos y Consultas)
  // =============================================================================
  
  // Sesiones Clínicas (Presencial)
  Route::get('/clinical-sessions', [TreatmentSessionController::class, 'index'])->name('treatment-sessions.index');
  Route::post('/clinical-sessions/{session}/start', [TreatmentSessionController::class, 'start'])->name('treatment-sessions.start');
  Route::post('/clinical-sessions/{session}/complete', [TreatmentSessionController::class, 'complete'])->name('treatment-sessions.complete');
  Route::post('/clinical-sessions/{session}/cancel', [TreatmentSessionController::class, 'cancel'])->name('treatment-sessions.cancel');
  Route::post('/clinical-sessions/{session}/absent', [TreatmentSessionController::class, 'absent'])->name('treatment-sessions.absent');

  // Pagos Internos (Caja)
  Route::resource('payments', PaymentsController::class)->names('payments');
  Route::post('payment/process', [PaymentsController::class, 'processPayment'])->name('payments.process');
  Route::get('patients/{id}/status', [PaymentsController::class, 'getPatientStatus'])->name('patients.status');
  Route::post('payments/pos/abort', [PaymentsController::class, 'abortPos'])->name('payments.pos.abort');
  Route::get('payments/{uuid}/success', [PaymentsController::class, 'success'])->name('payments.success');
  Route::get('payments/{uuid}/pdf/{download?}', [PaymentsController::class, 'downloadReceiptPdf'])->name('payments.receipt.pdf');
  Route::get('payments/{uuid}/receipt-pdf', [PaymentsController::class, 'downloadReceiptPdf'])->name('payments.pdf');

  // Webpay Administrativo
  Route::prefix('payments/webpay')->name('payments.webpay.')->group(function () {
      Route::post('/session/{session}', [WebpayController::class, 'initSessionPayment'])->name('session');
      Route::post('/sessions/multiple', [WebpayController::class, 'initMultipleSessionsPayment'])->name('sessions.multiple');
      Route::post('/debts', [WebpayController::class, 'initDebtsPayment'])->name('debts');
      Route::post('/plan/{plan}', [WebpayController::class, 'initPlanPayment'])->name('plan');
      Route::get('/{token}/status', [WebpayController::class, 'status'])->name('status');
  });
  Route::match(['GET', 'POST'], '/payments/webpay/return', [WebpayController::class, 'return'])->name('payments.webpay.return');

  // Datos Externos y DTE Utility
  Route::get('external-data/company/{rut}', [DteController::class, 'consultContribuyente'])->name('external-data.company');
  Route::get('external-data/search-name', [ExternalDataController::class, 'searchByName'])->name('external-data.search-name');
  Route::get('documents/lookup/{folio}', [DteController::class, 'lookupByFolio'])->name('dte.lookup');

  // Perfil de Doctor (Asignaciones)
  Route::prefix('doctors')->name('doctors.')->group(function () {
      Route::post('{doctor}/assign-patient', [DoctorAdminController::class, 'assignPatient'])->name('patients.assign');
      Route::delete('{doctor}/unassign-patient/{patient}', [DoctorAdminController::class, 'unassignPatient'])->name('patients.unassign');
      Route::post('check-existing', [DoctorAdminController::class, 'checkExisting'])->name('check-existing');
      Route::post('{doctor}/commission-rules', [DoctorAdminController::class, 'updateCommissionRules'])->name('commissions.update');
  });

  // Developer Utils
  Route::prefix('dev')->group(function () {
      Route::post('optimize', function () { Artisan::call('optimize:clear'); return response()->json(['message' => 'Cleaned']); });
      Route::post('login-as/{user}', [\App\Http\Controllers\DevController::class, 'loginAs'])->name('dev.login-as');
      Route::post('rebuild-app', function () {
          Artisan::call('migrate:fresh --seed --seeder=InitialSetupSeeder');
          return redirect()->route('dashboard');
      });
  });

  // Gestión de Usuarios y Permisos (Superadmin y Admin)
  Route::prefix('admin/users-management')->name('admin.users-management.')->middleware('role:superadmin|admin')->group(function () {
      Route::get('/', [UserManagementController::class, 'index'])->name('index');
      Route::post('/', [UserManagementController::class, 'store'])->name('store');
      Route::put('/{user}', [UserManagementController::class, 'update'])->name('update');
      Route::delete('/{user}', [UserManagementController::class, 'destroy'])->name('destroy');
      Route::post('/roles/update-permissions', [UserManagementController::class, 'updateRoles'])->name('roles.update-permissions');
  });
});

// ============================================================================
// AUTENTICACIÓN DE PACIENTES
// ============================================================================
Route::prefix('patient')->name('patient.')->group(function () {
  Route::middleware('guest:patient')->group(function () {
    Route::get('/login', [ClientAuthController::class, 'showLogin'])->name('login');
    Route::post('/request-code', [ClientAuthController::class, 'requestCode'])->name('request-code');
    Route::post('/verify-code', [ClientAuthController::class, 'verifyCode'])->name('verify-code');
    Route::get('/verify-code', [ClientAuthController::class, 'showVerifyCode'])->name('verify-code.show');
  });

  Route::middleware('auth:patient')->group(function () {
    Route::get('/dashboard', [ClientDashboardController::class, 'index'])->name('dashboard');
    Route::post('/logout', [ClientAuthController::class, 'logout'])->name('logout');
  });
});
