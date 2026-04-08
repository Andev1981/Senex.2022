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

  // Gestión de Compañía/Sucursal
  Route::post('switch-company', [CompanySwitchController::class, 'switchCompany'])->name('admin.switch-company')->middleware('role:superadmin');
  Route::post('switch-branch', [CompanySwitchController::class, 'switchBranch'])->name('admin.switch-branch')->middleware('role:admin|superadmin');

  // Pacientes
  Route::resource('patients', PatientAdminController::class)->names('patients');
  Route::post('patients/validate-rut', [PatientAdminController::class, 'checkExisting'])->name('patients.check-existing');
  Route::post('patient/quick/store', [PatientAdminController::class, "quickStore"])->name('patients.quick_store');
  Route::get('/patients/search', [PatientSearchController::class, 'search']);
  
  // Tratamientos y Sesiones
  Route::resource('treatments', TreatmentAdminController::class)->names('treatments');
  Route::resource('sessions', TreatmentSessionController::class)->names('sessions');
  Route::post('/sessions/{session}/notify', [TreatmentSessionController::class, 'notify'])->name('sessions.notify');
  Route::put('/sessions/{session}/complete', [TreatmentSessionController::class, 'complete'])->name('sessions.complete');
  Route::put('/sessions/{session}/cancel', [TreatmentSessionController::class, 'cancel'])->name('sessions.cancel');
  Route::post('/sessions/{session}/duplicate', [TreatmentSessionController::class, 'duplicate'])->name('sessions.duplicate');

  // Atenciones (Presencial)
  Route::get('/attendances', [AttendancesController::class, 'index'])->name('attendances.index');
  Route::patch('/attendances/{id}/start', [AttendancesController::class, 'startSession'])->name('attendances.start');
  Route::patch('/attendances/{id}/complete', [AttendancesController::class, 'completeSession'])->name('attendances.complete');
  Route::patch('/attendances/{id}/cancel', [AttendancesController::class, 'cancelSession'])->name('attendances.cancel');
  Route::patch('/attendances/{id}/absent', [AttendancesController::class, 'markAbsent'])->name('attendances.absent');

  // Finanzas e Invoices
  Route::get('/invoices', [InvoicesController::class, 'index'])->name('invoices.index');
  Route::get('/invoices/{invoice}', [InvoicesController::class, 'show'])->name('invoices.show');
  Route::post('/invoices/{invoice}/cancel', [InvoicesController::class, 'cancel'])->name('invoices.cancel');
  Route::get('/invoices/{invoice}/pdf', [InvoicesController::class, 'downloadPdf'])->name('invoices.pdf');

  // Pagos Internos
  Route::resource('payments', PaymentsController::class)->names('payments');
  Route::post('payment/process', [PaymentsController::class, 'processPayment'])->name('payments.process');
  
  // Webpay Administrativo (Autenticado)
  Route::prefix('payments/webpay')->name('payments.webpay.')->group(function () {
      Route::post('/session/{session}', [WebpayController::class, 'initSessionPayment'])->name('session');
      Route::post('/sessions/multiple', [WebpayController::class, 'initMultipleSessionsPayment'])->name('sessions.multiple');
      Route::post('/debts', [WebpayController::class, 'initDebtsPayment'])->name('debts');
      Route::post('/plan/{plan}', [WebpayController::class, 'initPlanPayment'])->name('plan');
      Route::get('/{token}/status', [WebpayController::class, 'status'])->name('status');
  });

  // Retorno Webpay Administrativo
  Route::match(['GET', 'POST'], '/payments/webpay/return', [WebpayController::class, 'return'])->name('payments.webpay.return');

  // Productos
  Route::resource('products', ProductController::class);

  // Otros Módulos
  Route::resource('companies', CompanyController::class);
  Route::resource('doctors', DoctorAdminController::class)->names('doctors');
  Route::resource('plans', PlanController::class)->names('plans');
  Route::resource('insurances', InsuranceController::class)->names('insurances');
  Route::resource('agreements', AgreementController::class)->names('agreements');
  Route::resource('session-types', SessionTypeController::class)->names('session-types');
  Route::get('informes', [ReportsController::class, 'index'])->name('informes');

  // Developer Utils
  Route::prefix('dev')->group(function () {
      Route::post('optimize', function () { Artisan::call('optimize:clear'); return response()->json(['message' => 'Cleaned']); });
      Route::post('route-clear', function () { Artisan::call('route:clear'); return response()->json(['message' => 'Routes Cleaned']); });
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
