<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Liquidación de Honorarios</title>
    <style>
        body { font-family: sans-serif; font-size: 12px; color: #333; }
        .header { margin-bottom: 20px; border-bottom: 2px solid #eee; padding-bottom: 10px; }
        .header h1 { margin: 0; color: #1a1a1a; font-size: 24px; }
        .header p { margin: 5px 0 0; color: #666; }
        
        .info-grid { display: table; width: 100%; margin-bottom: 30px; }
        .info-col { display: table-cell; width: 50%; vertical-align: top; }
        .label { font-weight: bold; color: #666; font-size: 10px; text-transform: uppercase; }
        .value { font-size: 14px; margin-bottom: 10px; font-weight: 500; }

        table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
        th { background: #f8f9fa; padding: 10px; text-align: left; font-size: 10px; text-transform: uppercase; border-bottom: 1px solid #ddd; }
        td { padding: 10px; border-bottom: 1px solid #eee; }
        .text-right { text-align: right; }
        .text-center { text-align: center; }
        .font-mono { font-family: monospace; }
        
        .totals { float: right; width: 300px; }
        .total-row { display: flex; justify-content: space-between; padding: 5px 0; }
        .total-row.final { border-top: 2px solid #333; font-weight: bold; font-size: 16px; margin-top: 10px; padding-top: 10px; }
        
        .footer { position: fixed; bottom: 0; left: 0; right: 0; text-align: center; font-size: 10px; color: #999; border-top: 1px solid #eee; padding-top: 10px; }
    </style>
</head>
<body>
    <div class="header">
        <h1>Liquidación de Honorarios</h1>
        <p>Folio #{{ $payroll->id }} • Fecha de emisión: {{ now()->format('d/m/Y H:i') }}</p>
    </div>

    <div class="info-grid">
        <div class="info-col">
            <div class="label">Profesional</div>
            <div class="value">{{ $payroll->doctor->full_name }}</div>
            <div class="label">RUT</div>
            <div class="value">{{ $payroll->doctor->rut ?? 'N/A' }}</div>
        </div>
        <div class="info-col text-right">
            <div class="label">Período</div>
            <div class="value">{{ $payroll->period_start->format('d/m/Y') }} - {{ $payroll->period_end->format('d/m/Y') }}</div>
            <div class="label">Estado</div>
            <div class="value">{{ strtoupper($payroll->status) }}</div>
        </div>
    </div>

    <table>
        <thead>
            <tr>
                <th>Fecha</th>
                <th>Paciente</th>
                <th>Tipo Sesión</th>
                <th class="text-right">Valor Paciente</th>
                <th class="text-right">Comisión</th>
                <th class="text-right">A Pagar</th>
            </tr>
        </thead>
        <tbody>
            @foreach($payroll->details as $detail)
            <tr>
                <td>{{ \Carbon\Carbon::parse($detail->service_date)->format('d/m/Y') }}</td>
                <td>{{ $detail->patient->full_name ?? 'N/A' }}</td>
                <td>{{ $detail->sessionType->name ?? 'Consulta' }}</td>
                <td class="text-right font-mono">${{ number_format($detail->patient_amount_clp, 0, ',', '.') }}</td>
                <td class="text-right font-mono text-red-500">-${{ number_format($detail->commission_amount_clp, 0, ',', '.') }}</td>
                <td class="text-right font-mono font-bold">${{ number_format($detail->subtotal_clp, 0, ',', '.') }}</td>
            </tr>
            @endforeach
        </tbody>
    </table>

    <div class="totals">
        <table style="width: 100%">
            <tr>
                <td style="border: none; padding: 5px;">Total Pacientes:</td>
                <td style="border: none; padding: 5px;" class="text-right font-mono">${{ number_format($payroll->total_patient_amount_clp, 0, ',', '.') }}</td>
            </tr>
            <tr>
                <td style="border: none; padding: 5px;">Total Comisiones:</td>
                <td style="border: none; padding: 5px;" class="text-right font-mono">-${{ number_format($payroll->total_commission_amount_clp, 0, ',', '.') }}</td>
            </tr>
            @if($payroll->total_adjustments_clp != 0)
            <tr>
                <td style="border: none; padding: 5px;">Ajustes:</td>
                <td style="border: none; padding: 5px;" class="text-right font-mono">-${{ number_format($payroll->total_adjustments_clp, 0, ',', '.') }}</td>
            </tr>
            @endif
            <tr style="font-weight: bold; font-size: 1.2em;">
                <td style="border-top: 2px solid #000; padding: 10px 5px;">Total a Pagar:</td>
                <td style="border-top: 2px solid #000; padding: 10px 5px;" class="text-right font-mono">${{ number_format($payroll->total_payable_clp, 0, ',', '.') }}</td>
            </tr>
        </table>
    </div>

    <div class="footer">
        Documento generado internamente por Senex Enterprise. No válido para efectos tributarios sin boleta de honorarios asociada.
    </div>
</body>
</html>
