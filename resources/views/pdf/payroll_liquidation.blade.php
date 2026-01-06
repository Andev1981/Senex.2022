<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Liquidación de Honorarios</title>
    <style>
        body { font-family: sans-serif; font-size: 11px; color: #333; line-height: 1.4; }
        
        .header-container { width: 100%; border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 30px; }
        .logo-box { width: 150px; height: auto; vertical-align: top; }
        .logo-img { max-width: 100%; max-height: 60px; object-fit: contain; }
        .title-box { text-align: right; vertical-align: top; }
        .title-box h1 { margin: 0; color: #1a1a1a; font-size: 22px; text-transform: uppercase; letter-spacing: 1px; }
        .title-box p { margin: 5px 0 0; color: #666; font-size: 10px; }

        .info-grid { width: 100%; margin-bottom: 30px; }
        .info-col { width: 48%; vertical-align: top; }
        .label { font-weight: bold; color: #888; font-size: 9px; text-transform: uppercase; margin-bottom: 2px; }
        .value { font-size: 13px; font-weight: 600; color: #000; margin-bottom: 12px; }

        table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
        th { background: #f4f4f4; padding: 8px 10px; text-align: left; font-size: 9px; font-weight: bold; text-transform: uppercase; color: #555; border-bottom: 1px solid #ddd; }
        td { padding: 8px 10px; border-bottom: 1px solid #eee; vertical-align: middle; }
        .text-right { text-align: right; }
        .text-center { text-align: center; }
        .font-mono { font-family: monospace; font-size: 11px; }
        .subtle { color: #888; font-size: 10px; }
        
        .totals-container { width: 100%; margin-top: 20px; border-top: 1px solid #eee; padding-top: 20px; }
        .totals-table { width: 250px; float: right; }
        .totals-table td { padding: 4px 0; border: none; }
        .grand-total { border-top: 2px solid #333 !important; font-size: 14px; font-weight: bold; padding-top: 10px !important; margin-top: 5px; }
        
        .footer { position: fixed; bottom: 0; left: 0; right: 0; text-align: center; font-size: 9px; color: #aaa; border-top: 1px solid #eee; padding-top: 15px; }
    </style>
</head>
<body>
    <table class="header-container">
        <tr>
            <td class="logo-box">
                @if($payroll->company && $payroll->company->logo)
                    <img src="{{ public_path('storage/' . $payroll->company->logo->path) }}" class="logo-img" alt="Logo">
                @endif
            </td>
            <td class="title-box">
                <h1>Detalle de Honorarios</h1>
                <p>Folio Interno #{{ str_pad($payroll->id, 6, '0', STR_PAD_LEFT) }}</p>
                <p>Fecha Emisión: {{ now()->format('d/m/Y H:i') }}</p>
            </td>
        </tr>
    </table>

    <table class="info-grid">
        <tr>
            <td class="info-col">
                <div class="label">Profesional</div>
                <div class="value">{{ $payroll->doctor->full_name }}</div>
                
                <div class="label">RUT</div>
                <div class="value">{{ $payroll->doctor->rut ?? '-' }}</div>
            </td>
            <td class="info-col text-right">
                <div class="label">Período Auditado</div>
                <div class="value">{{ $payroll->period_start->format('d/m/Y') }} — {{ $payroll->period_end->format('d/m/Y') }}</div>
                
                <div class="label">Estado Documento</div>
                <div class="value" style="color: {{ $payroll->status == 'paid' ? '#10B981' : '#6B7280' }}">
                    {{ match($payroll->status) {
                        'draft' => 'BORRADOR',
                        'approved' => 'APROBADO',
                        'paid' => 'PAGADO',
                        default => strtoupper($payroll->status)
                    } }}
                </div>
            </td>
        </tr>
    </table>

    <table>
        <thead>
            <tr>
                <th style="width: 20%">Fecha / Hora</th>
                <th style="width: 40%">Paciente</th>
                <th style="width: 20%">Prestación</th>
                <!-- Se eliminó Valor Base -->
                <th class="text-right" style="width: 20%">Honorario</th>
            </tr>
        </thead>
        <tbody>
            @foreach($payroll->details as $detail)
            <tr>
                <td>
                    <div style="font-weight: 600;">{{ \Carbon\Carbon::parse($detail->service_date)->format('d/m/Y') }}</div>
                    @if($detail->treatmentSession && $detail->treatmentSession->time)
                        <div class="subtle">{{ \Carbon\Carbon::parse($detail->treatmentSession->time)->format('H:i') }} hrs</div>
                    @endif
                </td>
                <td>
                    <div style="font-weight: 600;">{{ $detail->patient->full_name ?? 'Paciente Eliminado' }}</div>
                    <div class="subtle">{{ $detail->patient->rut ?? '' }}</div>
                </td>
                <td>
                    {{ $detail->sessionType->name ?? 'Consulta' }}
                </td>
                <!-- Se eliminó celda de Valor Base -->
                <td class="text-right font-mono" style="font-weight: bold;">
                    ${{ number_format($detail->subtotal_clp, 0, ',', '.') }}
                </td>
            </tr>
            @endforeach
        </tbody>
    </table>

    <div class="totals-container">
        <table class="totals-table">
            <!-- Se eliminaron filas de Producción y Retención -->
            @if($payroll->total_adjustments_clp != 0)
            <tr>
                <td>Ajustes Varios:</td>
                <td class="text-right font-mono">-${{ number_format($payroll->total_adjustments_clp, 0, ',', '.') }}</td>
            </tr>
            @endif
            <tr>
                <td class="grand-total">Total a Pagar:</td>
                <td class="text-right font-mono grand-total">${{ number_format($payroll->total_payable_clp, 0, ',', '.') }}</td>
            </tr>
        </table>
        <div style="clear: both;"></div>
    </div>

    <div class="footer">
        Informe generado automáticamente. Este documento detalla los honorarios a pagar por las atenciones realizadas.
    </div>
</body>
</html>
