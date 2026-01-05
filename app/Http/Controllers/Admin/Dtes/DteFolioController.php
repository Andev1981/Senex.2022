<?php

namespace App\Http\Controllers\Admin\Dtes;

use App\Http\Controllers\Controller;    
use App\Services\Dte\DteFoliosService; // El servicio que interactúa con la DB y la clase Folios
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;

class DteFolioController extends Controller
{
    protected DteFoliosService $foliosService;

    /**
     * Inyección del servicio de gestión de folios.
     */
    public function __construct(DteFoliosService $foliosService)
    {
        $this->foliosService = $foliosService;
    }

    /**
     * Endpoint para cargar y guardar un archivo CAF (XML) en la DB.
     *
     * @param Request $request Debe contener el archivo 'caf_file'.
     */
    public function uploadCaf(Request $request)
    {
        // 1. Validar la solicitud: asegurar que el archivo XML esté presente.
        $request->validate([
            'caf_file' => 'required|file|mimes:xml,txt', // Aceptamos XML o TXT (algunos lo suben como .txt)
        ]);

        try {
            // 2. Obtener la ruta temporal del archivo subido.
            $path = $request->file('caf_file')->getRealPath();
            
            // 3. Llamar al servicio para que procese, valide y guarde el CAF.
            // El servicio se encarga de: leer el XML, validar la firma del SII (implícito en Folios::__construct), 
            // extraer los datos (RUT, folios, tipo DTE) e insertarlos en la tabla 'dte_folios'.
            $tipoDte = $this->foliosService->cargarCAF($path);

            return response()->json([
                'message' => 'CAF cargado y folios disponibles para Tipo DTE: ' . $tipoDte,
                'tipo_dte' => $tipoDte
            ], 201);

        } catch (\Exception $e) {
            // Esto captura errores lanzados desde DteFoliosService, 
            // como "Archivo CAF no encontrado", "CAF no válido", o fallos de DB.
            Log::error('CAF Upload Failed', ['error' => $e->getMessage()]);

            return response()->json([
                'error' => 'Error al cargar CAF: ' . $e->getMessage()
            ], 500);
        }
    }

}
