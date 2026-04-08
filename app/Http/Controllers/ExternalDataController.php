<?php

namespace App\Http\Controllers;

use App\Services\CompanyDataService;
use App\Services\RutSearchService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class ExternalDataController extends Controller
{
    protected $companyService;
    protected $rutSearchService;

    public function __construct(CompanyDataService $companyService, RutSearchService $rutSearchService)
    {
        $this->companyService = $companyService;
        $this->rutSearchService = $rutSearchService;
    }

    /**
     * Get company data from RUT.
     *
     * @param string $rut
     * @return JsonResponse
     */
    public function getCompanyByRut(string $rut): JsonResponse
    {
        $company = $this->companyService->getByRut($rut);

        if (!$company) {
            return response()->json([
                'success' => false,
                'message' => 'No se pudo obtener información para el RUT proporcionado.'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => [
                'razon_social' => $company->business_name,
                'giro' => $company->activity,
            ]
        ]);
    }

    /**
     * Search RUT by name (Prueba).
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function searchByName(Request $request): JsonResponse
    {
        $name = $request->query('name');

        if (!$name || strlen($name) < 3) {
            return response()->json([
                'success' => false,
                'message' => 'Debe ingresar al menos 3 caracteres para la búsqueda.'
            ], 400);
        }

        $results = $this->rutSearchService->searchByName($name);

        return response()->json([
            'success' => true,
            'data' => $results
        ]);
    }
}
