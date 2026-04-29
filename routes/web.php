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
    });

    // Catálogo Unificado (Productos y Servicios)
    Route::resource('products', ProductController::class);
    Route::resource('categories', \App\Http\Controllers\Admin\Products\CategoryController::class);

    // Otros Módulos Maestros
    Route::resource('companies', CompanyController::class);
    Route::resource('branches', BranchController::class);
    Route::resource('doctors', DoctorAdminController::class)->names('doctors');
    Route::resource('plans', PlanController::class)->names('plans');
    Route::resource('insurances', InsuranceController::class)->names('insurances');
    Route::resource('agreements', AgreementController::class)->names('agreements');
    Route::resource('agreement-rules', AgreementRuleController::class)->names('agreement.rules');
    Route::get('informes', [ReportsController::class, 'index'])->name('informes');

    // Módulo DTE / Documentos
    Route::get('documents', [DteController::class, 'index'])->name('documents');
    Route::post('documents', [DteController::class, 'store'])->name('documents.store');
    Route::post('documents/{invoice}/issue', [DteController::class, 'issueDte'])->name('dte.issue');
    Route::get('documents/{invoice}/status', [DteController::class, 'checkDteStatus'])->name('dte.status');
  });

  // ÁREA COMPARTIDA (Admin, Superadmin y Cajero)
  Route::middleware(['role:admin|superadmin|cajero'])->group(function () {
    Route::get('patients', [PatientAdminController::class, 'index'])->name('patients.index');
    Route::get('patients/{patient}', [PatientAdminController::class, 'show'])->name('patients.show');
    Route::post('patients/validate-rut', [PatientAdminController::class, 'checkExisting'])->name('patients.check-existing');
    Route::post('patient/quick/store', [PatientAdminController::class, "quickStore"])->name('patients.quick_store');
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
      Route::post('/dashboard/refresh', [DashboardMobileController::class, 'refreshKpis'])->name('dashboard.refresh');
      
      // Rutas de Atención Móvil
      Route::get('/sessions/create', [SessionMobileController::class, 'showForm'])->name('sessions.create');
      Route::get('/sessions/form/{id?}', [SessionMobileController::class, 'showForm'])->name('sessions.form');
      Route::get('/sessions/{session}', [SessionMobileController::class, 'show'])->name('sessions.show');
      Route::post('/sessions/{session}/complete', [SessionMobileController::class, 'completeSession'])->name('sessions.complete');
      Route::post('/sessions/{session}/cancel', [SessionMobileController::class, 'cancelSession'])->name('sessions.cancel');
      Route::put('/sessions/{session}/notes', [SessionMobileController::class, 'updateNotes'])->name('sessions.update-notes');

      // Gestión de Pacientes y Sesiones
      Route::get('/my-patients', [PatientMobileController::class, 'index'])->name('my-patients'); 
      Route::get('/patient/{patient}', [PatientMobileController::class, 'show'])->name('patient.show');
      Route::get('/my-sessions', [KineController::class, 'mySessions'])->name('my-sessions');
      
      // Perfil y Finanzas
      Route::get('/my-profile', [ProfileMobileController::class, 'index'])->name('my-profile');
      Route::get('/my-wallet', [ProfileMobileController::class, 'wallet'])->name('my-wallet');
      Route::post('/my-profile/update', [ProfileMobileController::class, 'update'])->name('profile.update');
      Route::post('/my-profile/password', [ProfileMobileController::class, 'updatePassword'])->name('profile.password');
  });

  // =============================================================================
  // RUTAS COMUNES (Atenciones, Pagos y Consultas)
  // =============================================================================
  
  // Atenciones (Presencial)
  Route::get('/attendances', [AttendancesController::class, 'index'])->name('attendances.index');
  Route::patch('/attendances/{id}/start', [AttendancesController::class, 'startSession'])->name('attendances.start');
  Route::patch('/attendances/{id}/complete', [AttendancesController::class, 'completeSession'])->name('attendances.complete');
  Route::patch('/attendances/{id}/cancel', [AttendancesController::class, 'cancelSession'])->name('attendances.cancel');
  Route::patch('/attendances/{id}/absent', [AttendancesController::class, 'markAbsent'])->name('attendances.absent');

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
