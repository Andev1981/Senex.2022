<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Comprobante de Pago #{{ substr($payment->uuid, 0, 8) }}</title>
    <style>
        body {
            font-family: 'Helvetica', 'Arial', sans-serif;
            font-size: 12px;
            color: #333;
            margin: 0;
            padding: 0;
        }
        .container {
            padding: 30px;
        }
        .header {
            border-bottom: 2px solid #3292b3;
            padding-bottom: 10px;
            margin-bottom: 20px;
        }
        .header table {
            width: 100%;
        }
        .header .title {
            font-size: 20px;
            font-weight: bold;
            color: #3292b3;
            text-transform: uppercase;
        }
        .header .subtitle {
            font-size: 10px;
            color: #858793;
            text-transform: uppercase;
            letter-spacing: 1px;
        }
        .info-section {
            margin-bottom: 30px;
        }
        .info-section table {
            width: 100%;
        }
        .info-label {
            font-size: 10px;
            font-weight: 900;
            text-transform: uppercase;
            color: #858793;
            margin-bottom: 5px;
        }
        .info-value {
            font-weight: bold;
            font-size: 12px;
            color: #111;
        }
        .details-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 30px;
        }
        .details-table th {
            background-color: #f9fafb;
            border-bottom: 1px solid #e5e7eb;
            padding: 10px;
            text-align: left;
            font-size: 10px;
            font-weight: 900;
            text-transform: uppercase;
            color: #858793;
        }
        .details-table td {
            padding: 12px 10px;
            border-bottom: 1px solid #f3f4f6;
        }
        .summary-section {
            width: 300px;
            margin-left: auto;
            background-color: #f9fafb;
            padding: 20px;
            border-radius: 15px;
        }
        .summary-row {
            margin-bottom: 8px;
            clear: both;
        }
        .summary-label {
            float: left;
            color: #6b7280;
        }
        .summary-value {
            float: right;
            font-weight: bold;
        }
        .total-row {
            margin-top: 15px;
            padding-top: 15px;
            border-top: 1px dashed #d1d5db;
            font-weight: 900;
            color: #3292b3;
            font-size: 16px;
        }
        .footer {
            margin-top: 50px;
            text-align: center;
            font-size: 10px;
            color: #9ca3af;
        }
        .brand-primary { color: #3292b3; }
        .brand-secondary { color: #79d0ec; }
        .text-right { text-align: right; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <table>
                <tr>
                    <td>
                        <div class="title">Comprobante de Pago</div>
                        <div class="subtitle">Transacción #{{ strtoupper(substr($payment->uuid, 0, 8)) }}</div>
                    </td>
                    <td class="text-right">
                        <div class="info-value">{{ $payment->company->business_name }}</div>
                        <div class="subtitle">{{ $payment->company->rut }}</div>
                    </td>
                </tr>
            </table>
        </div>

        <div class="info-section">
            <table>
                <tr>
                    <td width="33%">
                        <div class="info-label">Paciente</div>
                        <div class="info-value">{{ $payment->patient->full_name }}</div>
                        <div class="subtitle">RUT: {{ $payment->patient->rut }}</div>
                    </td>
                    <td width="33%">
                        <div class="info-label">Fecha y Hora</div>
                        <div class="info-value">{{ $payment->paid_at ? $payment->paid_at->format('d/m/Y H:i') : $payment->created_at->format('d/m/Y H:i') }}</div>
                        <div class="subtitle">Sucursal: {{ $payment->branch->name ?? 'Casa Central' }}</div>
                    </td>
                    <td width="33%">
                        <div class="info-label">Método de Pago</div>
                        <div class="info-value" style="text-transform: capitalize;">
                            @php
                                $methods = [
                                    'cash' => 'Efectivo',
                                    'pos_integrado' => 'Tarjeta (POS)',
                                    'transfer' => 'Transferencia',
                                    'clinic_plan' => 'Plan Clínica',
                                    'webpay' => 'Webpay Online'
                                ];
                                echo $methods[$payment->payment_method] ?? $payment->payment_method;
                            @endphp
                        </div>
                        @if($payment->transaction_reference)
                            <div class="subtitle">Ref: {{ $payment->transaction_reference }}</div>
                        @endif
                    </td>
                </tr>
            </table>
        </div>

        <div class="info-label" style="margin-bottom: 10px;">Detalle de Prestaciones</div>
        <table class="details-table">
            <thead>
                <tr>
                    <th>Servicio / Descripción</th>
                    <th class="text-right">Monto</th>
                </tr>
            </thead>
            <tbody>
                @foreach($payment->paymentAllocation as $alloc)
                <tr>
                    <td>
                        <div style="font-weight: bold; font-size: 11px;">{{ $alloc->treatmentSession->sessionType->name ?? 'Atención Médica' }}</div>
                        <div class="subtitle" style="font-size: 8px;">SESIÓN ID: {{ $alloc->treatment_session_id }} | COD: {{ $alloc->treatmentSession->sessionType->code ?? 'N/A' }}</div>
                    </td>
                    <td class="text-right font-bold" style="font-weight: bold;">
                        ${{ number_format($alloc->amount_clp, 0, ',', '.') }}
                    </td>
                </tr>
                @endforeach
            </tbody>
        </table>

        <div class="summary-section">
            <div class="summary-row">
                <span class="summary-label">Total Bruto</span>
                <span class="summary-value">${{ number_format($payment->amount_gross_clp, 0, ',', '.') }}</span>
            </div>
            
            @foreach($payment->receivables as $rec)
            <div class="summary-row" style="color: #059669;">
                <span class="summary-label">Cobertura {{ $rec->insurance->name }}</span>
                <span class="summary-value">-${{ number_format($rec->amount_clp, 0, ',', '.') }}</span>
            </div>
            @endforeach

            @if($payment->discount_clp > 0)
            <div class="summary-row" style="color: #d97706;">
                <span class="summary-label">Descuento Aplicado</span>
                <span class="summary-value">-${{ number_format($payment->discount_clp, 0, ',', '.') }}</span>
            </div>
            @endif

            <div class="summary-row total-row">
                <span class="summary-label" style="color: #3292b3;">COPAGO PAGADO</span>
                <span class="summary-value">${{ number_format($payment->amount_clp, 0, ',', '.') }}</span>
            </div>
            <div style="clear: both;"></div>
        </div>

        <div class="footer">
            <p>Este documento es un comprobante interno de recepción de pago.</p>
            <p>Emitido por {{ config('app.name') }} el {{ date('d/m/Y H:i:s') }}</p>
        </div>
    </div>
</body>
</html>
