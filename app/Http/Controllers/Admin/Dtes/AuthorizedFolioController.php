<?php

namespace App\Http\Controllers\Admin\Dtes;

use App\Http\Controllers\Controller;
use App\Models\AuthorizedFolio;
use App\Models\Company;
use App\Services\Dte\DteFoliosService;
use Illuminate\Http\Request;
use sasco\LibreDTE\Sii\Folios;
use Illuminate\Support\Facades\Log;

class AuthorizedFolioController extends Controller
{
    protected DteFoliosService $foliosService;

    public function __construct(DteFoliosService $foliosService)
    {
        $this->foliosService = $foliosService;
    }

    public function index(Company $company)
    {
        $this->authorize('view', $company);

        return inertia('Dte/Folios/Index', [
            'company' => $company,
            'folios' => AuthorizedFolio::where('company_id', $company->id)
                ->orderByDesc('created_at')
                ->get()
        ]);
    }

    public function store(Request $request, Company $company)
    {
        $this->authorize('update', $company);

        $request->validate([
            'archivo_caf' => 'required|file|mimes:xml,txt',
        ]);

        try {
            $xmlContent = file_get_contents($request->file('archivo_caf')->getRealPath());
            $foliosDte = new Folios($xmlContent);

            // 1. Validar que el CAF sea para el RUT de la empresa
            $rutCaf = preg_replace('/[^0-9Kk]/', '', $foliosDte->getEmisor());
            $rutEmpresa = preg_replace('/[^0-9Kk]/', '', $company->rut);

            if ($rutCaf !== $rutEmpresa) {
                return back()->withErrors([
                    'archivo_caf' => "El RUT del CAF ($rutCaf) no coincide con el RUT de la empresa ($rutEmpresa)."
                ]);
            }

            // 2. Determinar ambiente (mapear de DteConfiguration a estándar inglés)
            $ambienteSii = $company->dteConfiguration->ambiente ?? 'homologacion';
            $environment = ($ambienteSii === 'produccion') ? 'production' : 'certification';

            // 3. Delegar al servicio para guardar
            $tipoDte = $this->foliosService->cargarCAF($company->id, $xmlContent, $environment);

            $desde = $foliosDte->getDesde();
            $hasta = $foliosDte->getHasta();

            return back()->with('success', "CAF cargado exitosamente: Tipo $tipoDte, Rango [$desde - $hasta], Ambiente: $environment");

        } catch (\Exception $e) {
            Log::error("Error al cargar CAF para Empresa #{$company->id}: " . $e->getMessage());
            return back()->withErrors(['archivo_caf' => 'Error al procesar el CAF: ' . $e->getMessage()]);
        }
    }
}
