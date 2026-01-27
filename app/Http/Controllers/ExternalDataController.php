<?php

namespace App\Http\Controllers;

use App\Services\CompanyDataService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class ExternalDataController extends Controller
{
    protected $companyService;

    public function __construct(CompanyDataService $companyService)
    {
        $this->companyService = $companyService;
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
}
