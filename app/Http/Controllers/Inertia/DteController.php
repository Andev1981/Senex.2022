<?php

namespace App\Http\Controllers\Inertia;

use App\Http\Controllers\Controller;
use App\Models\ApplicationType;
use App\Models\Patient;
use App\Services\DteService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DteController extends Controller
{
    public function crear()
    {
        $pacientes = Patient::orderBy('name')->get();
        $productos = ApplicationType::orderBy('name')->get();
        return Inertia::render('Boletas/Crear', [
            'pacientes' => $pacientes,
            'productos' => $productos,
        ]);
    }

    public function emitir(Request $request)
    {
        $request->validate([
            'detalles.*.NmbItem' => 'required',
            'detalles.*.QtyItem' => 'required|numeric',
            'detalles.*.PrcItem' => 'required|numeric',
        ]);

        $datos = [
            'receptor' => [
                'rut' => $request->receptor_rut ?? '66.666.666-6',
                'nombre' => $request->receptor_nombre ?? 'Cliente Final',
                'giro' => $request->receptor_giro ?? 'Consumo Final',
                'direccion' => $request->receptor_direccion ?? 'Sin dirección',
                'comuna' => $request->receptor_comuna ?? 'Santiago',
            ],
            'detalles' => collect($request->detalles)->map(function ($item) {
                return [
                    'NmbItem' => $item['NmbItem'],
                    'QtyItem' => $item['QtyItem'],
                    'PrcItem' => $item['PrcItem'],
                    'MontoItem' => $item['QtyItem'] * $item['PrcItem'],
                ];
            })->toArray(),
        ];

        $servicio = new DteService();
        $resultado = $servicio->emitirBoletaElectronica($datos);

        if (isset($resultado['error'])) {
            return response()->json(['error' => $resultado['error']], 500);
        }

        return response()->json([
            'mensaje' => 'Boleta emitida con éxito',
            'folio' => $resultado['folio'],
            'url_xml' => $resultado['url_xml'],
        ]);
    }
}
