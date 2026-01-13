<?php
// app/Http/Controllers/KineMobile/ProfileController.php

namespace App\Http\Controllers\KineMobile;

use App\Http\Controllers\Controller;
use App\Models\TreatmentSession;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;
use Inertia\Response;

class ProfileMobileController extends Controller
{
    /**
     * Perfil del kinesiólogo
     */
    public function index(): Response
    {
        $doctor = Auth::user()->doctor;
        $user = Auth::user();

        $doctor->load(['commissionRates.sessionType']);

        // Estadísticas del mes actual
        $currentMonth = Carbon::now()->startOfMonth();
        $sessions = TreatmentSession::where('doctor_id', $doctor->id)
            ->where('status', 'Completada')
            ->where('date', '>=', $currentMonth)
            ->get();

        // Estadísticas mensuales (últimos 6 meses)
        $monthlyData = [];
        for ($i = 5; $i >= 0; $i--) {
            $month = Carbon::now()->subMonths($i);
            $monthSessions = TreatmentSession::where('doctor_id', $doctor->id)
                ->where('status', 'Completada')
                ->whereYear('date', $month->year)
                ->whereMonth('date', $month->month)
                ->get();

            $monthlyData[] = [
                'month' => $month->format('M'),
                'sessions' => $monthSessions->count(),
                'earnings' => $monthSessions->sum('doctor_amount_clp'),
            ];
        }

        // Ranking del mes (opcional)
        $allDoctors = TreatmentSession::where('status', 'Completada')
            ->whereMonth('date', Carbon::now()->month)
            ->whereYear('date', Carbon::now()->year)
            ->select('doctor_id', DB::raw('COUNT(*) as session_count'))
            ->groupBy('doctor_id')
            ->orderBy('session_count', 'desc')
            ->pluck('doctor_id')
            ->toArray();

        $ranking = array_search($doctor->id, $allDoctors) + 1;

        $stats = [
            'sessions_month' => $sessions->count(),
            'patients_month' => $sessions->pluck('patient_id')->unique()->count(),
            'revenue_month' => $sessions->sum('patient_amount_clp'),
            'commission_month' => $sessions->sum('doctor_amount_clp'),
            'ranking' => $ranking ?: '-',
            'total_kines' => count($allDoctors),
        ];

        return Inertia::render('kineMobile/MyProfile', [
            'doctor' => [
                'id' => $doctor->id,
                'name' => $doctor->name,
                'last_name' => $doctor->last_name,
                'rut' => $doctor->rut,
                'email' => $doctor->email,
                'phone' => $doctor->phone,
                'speciality' => $doctor->speciality,
                'branch' => $doctor->branch->name ?? 'Sin sucursal',
                'commission_rates' => $doctor->commissionRates->map(function ($rate) {
                    return [
                        'session_type' => $rate->sessionType->name,
                        'type' => $rate->commission_type,
                        'value' => $rate->commission_value,
                    ];
                }),
            ],
            'user' => [
                'email' => $user->email,
                'last_login_at' => $user->last_login_at,
            ],
            'stats' => $stats,
            'monthlyData' => $monthlyData,
        ]);
    }

    /**
     * Actualizar perfil
     */
    public function update(Request $request)
    {
        $doctor = Auth::user()->doctor;

        $validated = $request->validate([
            'phone' => 'nullable|string|max:20',
            'email' => 'required|email|unique:doctors,email,' . $doctor->id,
        ]);

        try {
            $doctor->update($validated);

            return response()->json([
                'success' => true,
                'message' => 'Perfil actualizado correctamente'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al actualizar perfil'
            ], 500);
        }
    }

    /**
     * Cambiar contraseña
     */
    public function updatePassword(Request $request)
    {
        $validated = $request->validate([
            'current_password' => 'required|string',
            'password' => ['required', 'confirmed', Password::defaults()],
        ]);

        $user = Auth::user();

        // Verificar contraseña actual
        if (!Hash::check($validated['current_password'], $user->password)) {
            return response()->json([
                'success' => false,
                'message' => 'La contraseña actual es incorrecta'
            ], 400);
        }

        try {
            $user->update([
                'password' => Hash::make($validated['password'])
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Contraseña actualizada correctamente'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al actualizar contraseña'
            ], 500);
        }
    }
}
