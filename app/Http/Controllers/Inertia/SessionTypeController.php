<?php

namespace App\Http\Controllers\Inertia;

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
        return Inertia::render('SessionTypes/SessionTypesIndex', [
            'sessionTypes' => $sessionTypes,
        ]);
    }

    public function store(StoreSessionTypeRequest $request)
    {
        try{
            SessionType::create($request->validated());
            
            session()->flash('message', 'Tipo de sesión agregado correctamente');
            session()->flash('type', 'success');
        } 
        catch (\Exception $e) {
                Log::info('Error al crear tipo de sesión', [
                    $e->getMessage()
                ]);
                
                session()->flash('message', 'Error al crear el tipo de sesión: ' . $e->getMessage());
                session()->flash('type', 'error');
        }
    }

    public function update(UpdateSessionTypeRequest $request, SessionType $sessionType)
    {
        
 
        try{
            $sessionType->update($request->validated());
            
            session()->flash('message', 'Tipo de sesión actualizada correctamente');
            session()->flash('type', 'success');
        } 
        catch (\Exception $e) {
                Log::info('Error al actualizar tipo de sesión', [
                    $e->getMessage()
                ]);
                
                session()->flash('message', 'Error al actualizar el tipo de sesión: ' . $e->getMessage());
                session()->flash('type', 'error');
        }
    }

    public function destroy(SessionType $sessionType)
    {
        // Si quieres protección de integridad, valida que no tenga sesiones asociadas
         if ($sessionType->treatmentSessions()->count() > 0) {
            session()->flash('message', 'No se puede eliminar este tipo de sesión porque tiene sesiones asociadas');
                session()->flash('type', 'error');

            return back();
        }

         try{

            $sessionType->delete();
            
            session()->flash('message', 'Tipo de sesión actualizada correctamente');
            session()->flash('type', 'success');
        } 
        catch (\Exception $e) {
                Log::info('Error al actualizar tipo de sesión', [
                    $e->getMessage()
                ]);
                
                session()->flash('message', 'Error al actualizar el tipo de sesión: ' . $e->getMessage());
           
        
        }
    }
}
