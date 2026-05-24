<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Recibo de Pago #{{ substr($payment->uuid, 0, 8) }}</title>
    <style>
        :root {
            --brand-primary: #3292b3;
            --brand-secondary: #e0f2f7;
            --gray-900: #111827;
            --gray-600: #4b5563;
            --gray-100: #f3f4f6;
        }

        body {
            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
            margin: 0;
            padding: 0;
            color: var(--gray-900);
            background: white;
        }

        .receipt-container {
            max-width: 700px;
            margin: 20px auto;
            border: 1px solid var(--gray-100);
            border-radius: 2rem;
            overflow: hidden;
            box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
        }

        .header {
            padding: 40px;
            text-align: center;
            background-color: #f9fafb;
            border-bottom: 1px solid var(--gray-100);
        }

        .header .logo {
            max-width: 150px;
            margin-bottom: 15px;
        }

        .header h1 {
            margin: 0;
            font-size: 24px;
            font-weight: 900;
            text-transform: uppercase;
            letter-spacing: -0.025em;
        }

        .header p {
            margin: 5px 0 0;
            font-size: 10px;
            font-weight: 900;
            color: var(--gray-600);
            text-transform: uppercase;
            letter-spacing: 0.2em;
        }

        .content {
            padding: 40px;
        }

        .grid {
            display: table;
            width: 100%;
            margin-bottom: 30px;
            border-bottom: 1px solid var(--gray-100);
            padding-bottom: 20px;
        }

        .grid-col {
            display: table-cell;
            width: 33%;
            vertical-align: top;
        }

        .label {
            font-size: 9px;
            font-weight: 900;
            color: var(--brand-primary);
            text-transform: uppercase;
            letter-spacing: 0.1em;
            margin-bottom: 5px;
            display: block;
        }

        .value {
            font-size: 12px;
            font-weight: 700;
            text-transform: uppercase;
        }

        .sub-value {
            font-size: 10px;
            color: var(--gray-600);
            font-family: monospace;
        }

        table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
        }

        th {
            background-color: #f9fafb;
            padding: 12px 20px;
            text-align: left;
            font-size: 9px;
            font-weight: 900;
            text-transform: uppercase;
            color: var(--brand-primary);
            border-bottom: 1px solid var(--gray-100);
        }

        td {
            padding: 15px 20px;
            border-bottom: 1px solid var(--gray-100);
            font-size: 11px;
        }

        .item-name {
            font-weight: 900;
            text-transform: uppercase;
        }

        .item-details {
            font-size: 9px;
            color: var(--gray-600);
            font-family: monospace;
        }

        .amount {
            font-weight: 700;
            text-align: right;
            font-family: monospace;
        }

        .summary-box {
            margin-top: 30px;
            background-color: #f9fafb;
            border-radius: 1.5rem;
            padding: 25px;
            width: 300px;
            float: right;
        }

        .summary-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 8px;
            font-size: 11px;
        }

        .summary-total {
            margin-top: 15px;
            padding-top: 15px;
            border-top: 2px dashed #d1d5db;
            color: var(--brand-primary);
            font-weight: 900;
            font-size: 18px;
        }

        .footer {
            margin-top: 50px;
            text-align: center;
            font-size: 9px;
            color: var(--gray-600);
            text-transform: uppercase;
            letter-spacing: 0.1em;
            padding-bottom: 40px;
        }
    </style>
</head>
<body>
    <div class="receipt-container">
        <div class="header">
            <img src="{{ public_path('img/logo-cabecera.png') }}" alt="Senex Logo" class="logo">
            <h1>¡Pago Recibido!</h1>
            <p>Transacción #{{ strtoupper(substr($payment->uuid, 0, 8)) }}</p>
        </div>

        <div class="content">
            <div class="grid">
                <div class="grid-col">
                    <span class="label">Paciente</span>
                    <div class="value">{{ $payment->patient->full_name }}</div>
                    <div class="sub-value">RUT: {{ $payment->patient->rut }}</div>
                </div>
                <div class="grid-col">
                    <span class="label">Sucursal</span>
                    <div class="value">{{ $payment->branch->name ?? 'Casa Central' }}</div>
                    <div class="sub-value">{{ $payment->paid_at ? $payment->paid_at->format('d/m/Y H:i') : $payment->created_at->format('d/m/Y H:i') }}</div>
                </div>
                <div class="grid-col">
                    <span class="label">Método</span>
                    <div class="value">
                        @php
                            $methods = ['cash' => 'Efectivo', 'pos_integrado' => 'Tarjeta (POS)', 'transfer' => 'Transferencia', 'clinic_plan' => 'Plan Clínica'];
                            echo $methods[$payment->payment_method] ?? $payment->payment_method;
                        @endphp
                    </div>
                    @if($payment->transaction_reference)
                        <div class="sub-value">Ref: {{ $payment->transaction_reference }}</div>
                    @endif
                </div>
            </div>

            <span class="label">Detalle de Prestaciones</span>
            <table>
                <thead>
                    <tr>
                        <th>Descripción</th>
                        <th style="text-align: center;">Cant.</th>
                        <th style="text-align: right;">Total Item</th>
                    </tr>
                </thead>
                <tbody>
                    @php $hasDetail = false; @endphp
                    @foreach($payment->allocations as $alloc)
                        @php $hasDetail = true; @endphp
                        @if($alloc->invoice)
                            @foreach($alloc->invoice->items as $item)
                            <tr>
                                <td>
                                    <div class="item-name">{{ $item->description }}</div>
                                    <div class="item-details">
                                        @if($item->sellable_type === 'App\Models\Plan')
                                            Plan de Tratamiento
                                        @else
                                            {{ $item->treatmentSession ? "Sesión ID: {$item->treatment_session_id}" : "Producto/Servicio" }}
                                        @endif
                                    </div>
                                </td>
                                <td style="text-align: center; font-weight: 700;">{{ $item->quantity }}</td>
                                <td class="amount">${{ number_format($item->total_patient_clp, 0, ',', '.') }}</td>
                            </tr>
                            @endforeach
                        @elseif($alloc->treatmentSession)
                            @php
                                $serviceName = $alloc->treatmentSession->item->name ?? 'Servicio Médico';
                                $serviceDetails = "Sesión ID: {$alloc->treatment_session_id}";
                            @endphp
                            <tr>
                                <td>
                                    <div class="item-name">{{ $serviceName }}</div>
                                    <div class="item-details">{{ $serviceDetails }}</div>
                                </td>
                                <td style="text-align: center; font-weight: 700;">1</td>
                                <td class="amount">${{ number_format($alloc->amount_clp, 0, ',', '.') }}</td>
                            </tr>
                        @endif
                    @endforeach

                    {{-- 🎯 NUEVO: Mostrar planes comprados directamente si no hay allocations aún --}}
                    @if(!$hasDetail && $payment->patient_id)
                        @php
                            $plans = \App\Models\PatientPlan::where('payment_id', $payment->id)->with('plan')->get();
                        @endphp
                        @foreach($plans as $pp)
                            <tr>
                                <td>
                                    <div class="item-name">COMPRA DE PACK: {{ $pp->plan->name }}</div>
                                    <div class="item-details">
                                        {{ $pp->sessions_included }} sesiones incluidas. 
                                        Las boletas tributarias se emitirán al momento de cada atención.
                                    </div>
                                </td>
                                <td style="text-align: center; font-weight: 700;">1</td>
                                <td class="amount">${{ number_format($payment->amount_clp, 0, ',', '.') }}</td>
                            </tr>
                        @endforeach
                    @endif
                </tbody>
            </table>

            <div style="width: 100%; display: inline-block;">
                <div class="summary-box">
                    <div style="overflow: hidden; margin-bottom: 5px;">
                        <span style="float: left; font-size: 9px; font-weight: 900; color: #6b7280; text-transform: uppercase;">Total Bruto</span>
                        <span style="float: right; font-weight: 700;">${{ number_format($payment->amount_gross_clp, 0, ',', '.') }}</span>
                    </div>

                    @if($payment->discount_clp > 0)
                    <div style="overflow: hidden; margin-bottom: 5px; color: #ea580c;">
                        <span style="float: left; font-size: 9px; font-weight: 900; text-transform: uppercase;">Descuento</span>
                        <span style="float: right; font-weight: 900;">-${{ number_format($payment->discount_clp, 0, ',', '.') }}</span>
                    </div>
                    @endif

                    <div class="summary-total" style="overflow: hidden;">
                        <span style="float: left;">COPAGO</span>
                        <span style="float: right;">${{ number_format($payment->amount_clp, 0, ',', '.') }}</span>
                    </div>
                </div>
            </div>
        </div>

        <div class="footer">
            <p>Gracias por confiar en {{ $payment->company->business_name }}</p>
            <p style="font-size: 7px; margin-top: 10px; opacity: 0.5;">Comprobante Interno de Pago</p>
        </div>
    </div>
</body>
</html>
