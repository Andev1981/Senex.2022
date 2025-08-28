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
            'tipo_documento' => 'required|integer|in:33,34,39,41,43,46,52,56,61',
            'receptor.name' => 'required|string|max:255',
            'receptor.rut' => 'nullable|string|max:20',
            'receptor.giro' => 'nullable|string|max:255',
            'receptor.direccion' => 'nullable|string|max:255',
            'receptor.comuna' => 'nullable|string|max:255',
            'detalles' => 'required|array|min:1',
            'detalles.*.nombre' => 'required|string|max:255',
            'detalles.*.cantidad' => 'required|numeric|min:1',
            'detalles.*.precio' => 'required|numeric|min:0',
            // Validaciones condicionales según tipo de documento
            'condiciones_pago' => 'nullable|string|max:100',
            'fecha_vencimiento' => 'nullable|date|after:today',
            'direccion_entrega' => 'nullable|string|max:500',
            'transportista' => 'nullable|string|max:255',
            'fecha_entrega' => 'nullable|date|after:today',
            'folio_referencia' => 'nullable|string|max:100',
            'fecha_referencia' => 'nullable|date',
            'motivo' => 'nullable|string|max:255',
        ]);

        // Validaciones específicas según tipo de documento
        if (in_array($request->tipo_documento, [33, 34, 43, 46])) {
            // Facturas requieren RUT válido
            if (empty($request->receptor['rut']) || $request->receptor['rut'] === '66.666.666-6') {
                return response()->json(['error' => 'Las facturas requieren un RUT válido del receptor'], 422);
            }
        }

        if (in_array($request->tipo_documento, [56, 61])) {
            // Notas de crédito/débito requieren folio de referencia y motivo
            if (empty($request->folio_referencia)) {
                return response()->json(['error' => 'Las notas de crédito/débito requieren el folio del documento referenciado'], 422);
            }
            if (empty($request->motivo)) {
                return response()->json(['error' => 'Las notas de crédito/débito requieren especificar el motivo'], 422);
            }
        }

        $datos = [
            'tipo_documento' => $request->tipo_documento,
            'receptor' => [
                'rut' => $request->receptor['rut'] ?? '66.666.666-6',
                'nombre' => $request->receptor['name'],
                'giro' => $request->receptor['giro'] ?? 'Consumo Final',
                'direccion' => $request->receptor['direccion'] ?? 'Sin dirección',
                'comuna' => $request->receptor['comuna'] ?? 'Santiago',
            ],
            'detalles' => collect($request->detalles)->map(function ($item) {
                return [
                    'nombre' => $item['nombre'],
                    'cantidad' => $item['cantidad'],
                    'precio' => $item['precio'],
                ];
            })->toArray(),
            // Campos adicionales según tipo de documento
            'condiciones_pago' => $request->condiciones_pago,
            'fecha_vencimiento' => $request->fecha_vencimiento,
            'direccion_entrega' => $request->direccion_entrega,
            'transportista' => $request->transportista,
            'fecha_entrega' => $request->fecha_entrega,
            'folio_referencia' => $request->folio_referencia,
            'fecha_referencia' => $request->fecha_referencia,
            'motivo' => $request->motivo,
        ];

        $servicio = new DteService();
        
        // Determinar qué método usar según el tipo de documento
        switch ($request->tipo_documento) {
            case 39: // Boleta Electrónica
                $resultado = $servicio->emitirBoletaElectronica($datos);
                break;
            case 41: // Boleta Exenta Electrónica
                $resultado = $servicio->emitirBoletaExenta($datos);
                break;
            case 33: // Factura Electrónica
                $resultado = $servicio->emitirFacturaElectronica($datos);
                break;
            case 34: // Factura Exenta Electrónica
                $resultado = $servicio->emitirFacturaExenta($datos);
                break;
            case 52: // Guía de Despacho Electrónica
                $resultado = $servicio->emitirGuiaDespacho($datos);
                break;
            case 56: // Nota de Débito Electrónica
                $resultado = $servicio->emitirNotaDebito($datos);
                break;
            case 61: // Nota de Crédito Electrónica
                $resultado = $servicio->emitirNotaCredito($datos);
                break;
            default:
                return response()->json(['error' => 'Tipo de documento no soportado'], 400);
        }

        if (isset($resultado['error'])) {
            return response()->json(['error' => $resultado['error']], 500);
        }

        return response()->json([
            'mensaje' => 'Documento emitido con éxito',
            'folio' => $resultado['folio'],
            'total' => $resultado['total'] ?? 0,
            'url_xml' => $resultado['url_xml'],
        ]);
    }
}
