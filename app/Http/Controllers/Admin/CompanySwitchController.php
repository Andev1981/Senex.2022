<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Branch;
use App\Models\Company;
use Illuminate\Http\Request;

class CompanySwitchController extends Controller
{

    public function switchCompany(Request $request)
    {
        // 1. Validación: Permitimos null si quieres soportar "Vista Global" 
        // o required si siempre debe haber una empresa.
        $validated = $request->validate([
            'company_id' => ['required', 'integer', 'exists:companies,id'], 
        ]);

        $user = auth()->user();

        // 2. 🛡️ SEGURIDAD: Solo Superadmin puede saltar entre empresas
        if (!$user->isSuperAdmin()) {
            abort(403, 'No tienes permisos para cambiar el contexto de empresa.');
        }

        try {
            $companyId = $validated['company_id'];

            // 3. ACTUALIZAR SESIÓN (Solo IDs)
            // Limpiamos sucursal vieja para evitar que quede una sucursal de la Empresa A en la Empresa B
            $request->session()->forget(['active_branch_id', 'current_company_id']);
            
            $request->session()->put('current_company_id', (int) $companyId);

            // 4. BUSCAR SUCURSAL POR DEFECTO
            // Al cambiar de empresa, lo ideal es mandar al usuario a la sucursal principal de esa nueva empresa
            $firstBranch = Branch::where('company_id', $companyId)->first();
            
            if ($firstBranch) {
                $request->session()->put('active_branch_id', $firstBranch->id);
            }

            // 5. 🎯 PERSISTENCIA CRUCIAL
            // Forzamos el guardado físico antes de devolver la respuesta
            $request->session()->save();
            /* dd("Sesion"); */
            session()->flash('message', 'Ha cambiado de empresa');
            session()->flash('type', 'success');
            
            // Usar redirect()->intended() o back() es más seguro que route('/') a veces
            return redirect()->to('/'); 

        } catch (\Throwable $th) {
            session()->flash('message', 'No se ha podido cambiar de empresa');
            session()->flash('type', 'error');
            return back(); 
        }
    }

    public function switchBranch(Request $request)
    {
             // 1. Validar la entrada
        $validated = $request->validate([
            // La ID debe ser un entero, puede ser nulo (para la vista global) y debe existir en la tabla 'companies'
            'branch_id' => ['nullable', 'integer', 'exists:branches,id'], 
        ]);

        try {
       

        $user = auth()->user();

        // 1. Seguridad: Verificar que el usuario tenga acceso a esa sucursal
        // Esto consulta la tabla pivot branch_user que creamos
        $hasAccess = $user->branches()->where('branches.id', $request->branch_id)->exists();

        // Si es Superadmin, le permitimos entrar aunque no esté en la pivot 
        // (porque el superadmin es dueño de todo el ecosistema)
        if (!$hasAccess && !$user->isSuperAdmin()) {
            abort(403, 'No tienes permiso para acceder a esta sucursal.');
        }

        // 2. Actualizar Sucursal en Sesión
        session(['active_branch_id' => $request->branch_id]);

        // 3. Responder a Inertia (recarga la página para aplicar el nuevo contexto global)
        //code...
        //code...
        session()->flash('message', 'Ha cambiado de sucursal');
        session()->flash('type', 'success');
            return redirect()->to('/'); 
            /* return back();  */
        } catch (\Throwable $th) {
            //throw $th;
            session()->flash('message', 'No se ha podido cambiar de sucursal');
            session()->flash('type', 'error');
            return back(); 

        }
        
    }

}