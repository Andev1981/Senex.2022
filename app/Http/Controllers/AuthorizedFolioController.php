<?php

namespace App\Http\Controllers;

use App\Models\AuthorizedFolio;
use App\Models\Company;
use Illuminate\Http\Request;
use sasco\LibreDTE\Sii\Folios;
use Illuminate\Support\Facades\DB;

class AuthorizedFolioController extends Controller
{
    public function index(Company $company)
    {
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
            'archivo_caf' => 'required|file|mimes:xml,txt', // El CAF es un XML
        ]);

        try {
            // 1. Leer el contenido del XML
            $xmlContent = file_get_contents($request->file('archivo_caf')->getRealPath());

            // 2. Parsear con LibreDTE
            // Nota: Folios hace validaciones internas de firma.
            $foliosDte = new Folios($xmlContent);

            // 3. Extraer datos automáticamente
            $rutEmisor = $foliosDte->getEmisor();
            $tipoDte = $foliosDte->getTipo();
            $desde = $foliosDte->getDesde();
            $hasta = $foliosDte->getHasta();
            $fechaVenc = $foliosDte->getFechaVencimiento(); // Puede retornar string Y-m-d

            // Validar que el CAF corresponda a la empresa actual
            // Asumimos que company->rut tiene formato 12345678-9, LibreDTE suele devolver lo mismo
            // Es buena práctica normalizar ambos antes de comparar.

            // 4. Guardar en Base de Datos
            AuthorizedFolio::create([
                'company_id' => $company->id,
                'rut_emisor' => $rutEmisor,
                'tipo_dte' => $tipoDte,
                'folio_desde' => $desde,
                'folio_hasta' => $hasta,
                'ultimo_folio_usado' => $desde - 1, // Inicializamos antes del primero
                'caf_xml' => $xmlContent, // Guardamos el XML crudo para firmar después
                'fecha_vencimiento' => $fechaVenc,
                'activo' => true
            ]);

            return back()->with('success', "CAF cargado: Tipo $tipoDte, Rango [$desde - $hasta]");
        } catch (\Exception $e) {
            return back()->withErrors(['archivo_caf' => 'Error al procesar el CAF: ' . $e->getMessage()]);
        }
    }
}
