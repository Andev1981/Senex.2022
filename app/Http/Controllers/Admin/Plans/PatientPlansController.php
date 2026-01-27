<?php

namespace App\Http\Controllers\Admin\Plans;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Services\Payments\PaymentService;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;

class PatientPlansController extends Controller
{
    protected $paymentService;

    public function __construct(PaymentService $paymentService)
    {
        $this->paymentService = $paymentService;
    }

    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        //
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'patient_id' => 'required|integer|exists:patients,id',
                'plan_id' => 'required|integer|exists:plans,id',
                'payment_details' => 'required|array',
                'payment_details.branch_id' => 'required|integer|exists:branches,id',
                'payment_details.payment_method' => 'required|string',
                'payment_details.payment_date' => 'nullable|date',
                'payment_details.transaction_reference' => 'nullable|string',
            ]);

            $payment = $this->paymentService->processPlanPurchase(
                $validated['patient_id'],
                $validated['plan_id'],
                $validated['payment_details']
            );

            return response()->json([
                'success' => true,
                'message' => 'Plan comprado exitosamente.',
                'payment_id' => $payment->id,
            ], 201);

        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error de validación.',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            Log::error('Error al comprar el plan: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Ocurrió un error al procesar la compra del plan.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
    }
}
