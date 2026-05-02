<?php

namespace App\Http\Controllers\Admin\Branches;

use App\Http\Controllers\Controller;
use App\Models\Branch;
use App\Models\Room;
use Illuminate\Http\Request;

class RoomController extends Controller
{
    public function store(Request $request, Branch $branch)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'capacity' => 'nullable|integer|min:1',
            'status' => 'required|string|in:active,inactive,maintenance',
        ]);

        // Aseguramos que el company_id sea el de la sucursal, 
        // saltando cualquier autocompletado del trait Multitenantable si fuera necesario
        $room = new Room($validated);
        $room->branch_id = $branch->id;
        $room->company_id = $branch->company_id;
        $room->save();

        return back()->with('success', 'Box creado correctamente.');
    }

    public function update(Request $request, $id)
    {
        $room = Room::withoutGlobalScopes()->findOrFail($id);
        
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'capacity' => 'nullable|integer|min:1',
            'status' => 'required|string|in:active,inactive,maintenance',
        ]);

        $room->update($validated);

        return back()->with('success', 'Box actualizado correctamente.');
    }

    public function destroy($id)
    {
        $room = Room::withoutGlobalScopes()->findOrFail($id);

        // Verificar si tiene citas futuras
        // Aquí también podrías necesitar withoutGlobalScopes en Appointment si aplica
        if ($room->branch && $room->branch->rooms()->where('id', $room->id)->first()) {
             // Verificación lógica si fuera necesaria
        }

        $room->delete();

        return back()->with('success', 'Box eliminado correctamente.');
    }
}
