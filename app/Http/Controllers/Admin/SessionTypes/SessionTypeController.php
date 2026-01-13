<?php

namespace App\Http\Controllers\Admin\SessionTypes;

use App\Http\Controllers\Controller;
use App\Models\SessionType;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Http\Requests\StoreSessionTypeRequest;
use App\Http\Requests\UpdateSessionTypeRequest;
use Illuminate\Support\Facades\Log;

class SessionTypeController extends Controller
{
    public function index(Request $request)
    {
        $sessionTypes = SessionType::get();
        return Inertia::render('sessionTypes/Index', [
            'sessionTypes' => $sessionTypes,
        ]);
    }

    public function store(StoreSessionTypeRequest $request)
    {
        try {
            SessionType::create($request->validated());
        } catch (\Exception $e) {
            Log::info('Error al crear tipo de sesión', [
                $e->getMessage()
            ]);
        }
    }

    public function update(UpdateSessionTypeRequest $request, SessionType $sessionType)
    {


        try {
            $sessionType->update($request->validated());
        } catch (\Exception $e) {
            Log::info('Error al actualizar tipo de sesión', [
                $e->getMessage()
            ]);
        }
    }

    public function destroy(SessionType $sessionType)
    {
        // Si quieres protección de integridad, valida que no tenga sesiones asociadas
        if ($sessionType->treatmentSessions()->count() > 0) {


            return back();
        }

        try {

            $sessionType->delete();
        } catch (\Exception $e) {
            Log::info('Error al actualizar tipo de sesión', [
                $e->getMessage()
            ]);
        }
    }
}
