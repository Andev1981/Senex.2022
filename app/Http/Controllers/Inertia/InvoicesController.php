<?php

namespace App\Http\Controllers\Inertia;

use App\Http\Controllers\Controller;
use App\Http\Requests\InvoiceIssueRequest;
use App\Models\Invoice;
use App\Models\TreatmentSession;
use App\Models\PatientPlan;
use App\Services\InvoiceService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class InvoicesController extends Controller
{
  public function index(Request $req)
  {
    $q = Invoice::query()
      ->with(['patient', 'treatmentSession', 'items'])
      ->latest('id');

    if ($req->filled('status'))    $q->where('status', $req->status);
    if ($req->filled('sii_status')) $q->where('sii_status', $req->sii_status);

    dd($q->toSql(), $q->getBindings());

    return inertia('Invoices/Index', [
      'invoices' => $q->paginate(20),
      'filters'  => $req->only(['status', 'sii_status']),
    ]);
  }

  public function issueForSession(InvoiceIssueRequest $req, InvoiceService $svc, TreatmentSession $session)
  {
    $this->authorize('update', $session);
    $invoice = $svc->issueForSession($session, $req->input('type', 'boleta'));

    return back()->with('ok', "Documento emitido (#{$invoice->document_number})");
  }

  public function issueForPlan(InvoiceIssueRequest $req, InvoiceService $svc, PatientPlan $patientPlan)
  {
    $this->authorize('update', $patientPlan);
    $invoice = $svc->issueForPlan($patientPlan, $req->input('type', 'factura'));

    return back()->with('ok', "Documento emitido (#{$invoice->document_number})");
  }

  public function cancel(Request $req, InvoiceService $svc, Invoice $invoice)
  {
    $this->authorize('update', $invoice);
    $svc->cancelWithCreditNote($invoice, $req->input('reason', 'Anulación por solicitud'));
    return back()->with('ok', 'Documento anulado.');
  }

  public function show(Invoice $invoice)
  {
    $this->authorize('view', $invoice);
    $invoice->load(['patient', 'items', 'treatmentSession']);
    return inertia('Invoices/Show', ['invoice' => $invoice]);
  }

  public function downloadPdf(Invoice $invoice)
  {
    $this->authorize('view', $invoice);
    abort_unless($invoice->pdf_path, 404);
    return Storage::download($invoice->pdf_path);
  }
}
