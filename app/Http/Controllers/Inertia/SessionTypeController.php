<?php

namespace App\Http\Controllers\Inertia;

use App\Http\Controllers\Controller;
use App\Models\SessionType;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Http\Requests\StoreSessionTypeRequest;
use App\Http\Requests\UpdateSessionTypeRequest;

class SessionTypeController extends Controller
{
    public function index(Request $request)
    {
        $q = SessionType::query()
            ->when($request->get('search'), fn($qq, $s) => $qq->where('name', 'like', "%{$s}%"))
            ->orderBy('name');

        return Inertia::render('Admin/SessionTypes/IndexSessionTypes', [
            'filters' => $request->only('search'),
            'items'   => $q->paginate(15)->withQueryString(),
        ]);
    }

    public function store(StoreSessionTypeRequest $request)
    {
        SessionType::create($request->validated());
        return back()->with('success', 'Tipo de sesión creado.');
    }

    public function update(UpdateSessionTypeRequest $request, SessionType $sessionType)
    {
        $sessionType->update($request->validated());
        return back()->with('success', 'Tipo de sesión actualizado.');
    }

    public function destroy(SessionType $sessionType)
    {
        // Si quieres protección de integridad, valida que no tenga sesiones asociadas
        $sessionType->delete();
        return back()->with('success', 'Tipo de sesión eliminado.');
    }
}
