<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Comprobante de Pago #{{ substr($payment->uuid, 0, 8) }}</title>
    <style>
        /* Variables de Color (simulando Tailwind) */
        :root {
            --brand-primary: #3292b3;
            --brand-primary-light: #e0f2f7; /* bg-brand-primary/10 */
            --gray-900: #111827;
            --gray-800: #1f2937;
            --gray-700: #374151;
            --gray-600: #4b5563;
            --gray-500: #6b7280;
            --gray-400: #9ca3af;
            --gray-300: #d1d5db;
            --gray-200: #e5e7eb;
            --gray-100: #f3f4f6;
            --gray-50: #f9fafb;
            --green-600: #16a34a;
            --green-50: #f0fdf4;
            --orange-600: #ea580c;
            --orange-50: #fff7ed;
            --red-600: #dc2626;
            --red-50: #fef2f2;
        }

        body {
            font-family: 'Inter', 'Helvetica', 'Arial', sans-serif;
            font-size: 10px; /* Base más pequeña */
            color: var(--gray-700);
            margin: 0;
            padding: 0;
            /* background-color: var(--gray-50); */ /* Eliminado */
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
        }
        .container {
            max-width: 800px;
            margin: 20px auto;
            background-color: #ffffff;
            border-radius: 1rem; /* rounded-xl */
            box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1); /* shadow-lg */
            padding: 40px; /* Más padding */
            border: 1px solid var(--gray-100);
        }

        /* Header */
        .header-section {
            display: flex;
            justify-content: space-between;
            align-items: flex-start; /* Alineación superior */
            padding-bottom: 25px; /* Más espacio */
            margin-bottom: 25px;
            border-bottom: 2px solid var(--gray-100); /* Borde más grueso */
        }
        .header-left .title {
            font-size: 28px; /* Más grande */
            font-weight: 800; /* Extra bold */
            color: var(--brand-primary);
            text-transform: uppercase;
            letter-spacing: -0.04em; /* Más tracking-tight */
            line-height: 1.1;
        }
        .header-left .subtitle {
            font-size: 11px; /* Ligeramente más grande */
            color: var(--gray-600);
            text-transform: uppercase;
            letter-spacing: 0.15em; /* Más tracking-widest */
            font-weight: 700;
            margin-top: 5px;
        }
        .header-right {
            text-align: right;
        }
        .header-right .company-name {
            font-size: 16px; /* Más grande */
            font-weight: 800;
            color: var(--gray-900);
            line-height: 1.3;
        }
        .header-right .company-rut {
            font-size: 11px;
            color: var(--gray-600);
            font-weight: 500;
            margin-top: 3px;
        }

        /* Section Title */
        .section-title {
            font-size: 11px;
            font-weight: 800;
            text-transform: uppercase;
            color: var(--gray-800);
            margin-bottom: 20px; /* Más espacio */
            border-bottom: 1px solid var(--gray-200); /* Borde sólido, más claro */
            padding-bottom: 10px;
            letter-spacing: 0.05em;
        }

        /* Details Table (Ahora para ambas secciones de tabla) */
        .details-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 40px;
            background-color: var(--gray-50);
            border-radius: 1rem; /* rounded-xl */
            overflow: hidden;
            border: 1px solid var(--gray-100);
        }
        .details-table th, .details-table td {
            padding: 15px 20px; /* Más padding */
            text-align: left; /* Asegurar alineación izquierda por defecto para headers */
        }
        .details-table th {
            background-color: var(--brand-primary-light);
            font-size: 10px;
            font-weight: 800;
            text-transform: uppercase;
            color: var(--brand-primary);
            letter-spacing: 0.08em;
            border-bottom: 1px solid var(--gray-200);
        }
        .details-table td {
            border-bottom: 1px solid var(--gray-200); /* Borde más visible */
            font-size: 11px;
            color: var(--gray-700);
        }
        .details-table tbody tr:last-child td {
            border-bottom: none;
        }
        /* Estilos para los contenidos dentro de las celdas de las details-table */
        .details-table .service-name {
            font-weight: 700;
            color: var(--gray-900);
            font-size: 12px;
            line-height: 1.3;
        }
        .details-table .service-code {
            font-size: 9px;
            color: var(--gray-500);
            margin-top: 2px;
        }

        /* Summary */
        .summary-wrapper {
            background-color: var(--gray-50);
            border: 1px solid var(--gray-200);
            border-radius: 1rem; /* rounded-xl */
            padding: 25px; /* Más padding */
            width: 350px; /* Un poco más ancho */
            margin-left: auto;
            box-shadow: inset 0 2px 4px 0 rgba(0,0,0,0.06); /* shadow-inner más pronunciado */
            /* Se añade un div clear-fix al final del HTML de summary-wrapper */
        }
        .summary-item {
            margin-bottom: 12px;
            font-size: 13px; /* Más grande */
            clear: both; /* Asegurar que cada item empiece en nueva línea */
        }
        .summary-item:last-of-type {
            margin-bottom: 0;
        }
        .summary-item .summary-label {
            float: left;
            color: var(--gray-700);
            font-weight: 500;
        }
        .summary-item .summary-value {
            float: right;
            font-weight: 700;
            color: var(--gray-900);
        }
        .summary-total-item {
            border-top: 2px solid var(--brand-primary-light); /* Borde más grueso y de color */
            padding-top: 20px; /* Más padding */
            margin-top: 20px;
            font-size: 18px; /* Mucho más grande */
            font-weight: 800;
            color: var(--brand-primary);
            clear: both; /* Asegurar que empiece en nueva línea */
        }
        .summary-total-item .summary-label {
            float: left;
             color: var(--brand-primary); /* Asegurar color principal */
        }
        .summary-total-item .summary-value {
            float: right;
             color: var(--brand-primary); /* Asegurar color principal */
        }


        /* Footer */
        .footer-section {
            margin-top: 50px; /* Más espacio */
            text-align: center;
            font-size: 9px;
            color: var(--gray-500);
            padding-top: 25px;
            border-top: 1px solid var(--gray-100); /* Borde sólido más claro */
            font-weight: 500;
        }
        .footer-section p {
            margin: 3px 0;
        }
        .app-name {
            font-weight: bold;
            color: var(--gray-700);
        }

        /* Utilidades */
        .text-right { text-align: right !important; }
        .text-left { text-align: left; }
        .font-bold { font-weight: bold; }
        .font-semibold { font-weight: 600; }
        .font-medium { font-weight: 500; }
        .text-primary { color: var(--brand-primary); }
        .text-green { color: var(--green-600); }
        .text-orange { color: var(--orange-600); }
        .text-red { color: var(--red-600); }
        .text-capitalize { text-transform: capitalize; }
        .text-sm { font-size: 11px; }
        .text-xs { font-size: 10px; }


        /* Flexbox fallbacks para PDF */
        .flex { display: flex; }
        .justify-between { justify-content: space-between; }
        .items-center { align-items: center; }
        .items-flex-start { align-items: flex-start; }
        .w-full { width: 100%; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header-section">
            <div class="header-left">
                <div class="title">Comprobante de Pago</div>
                <div class="subtitle">Transacción #{{ strtoupper(substr($payment->uuid, 0, 8)) }}</div>
            </div>
            <div class="header-right">
                <div class="company-name">{{ $payment->company->business_name }}</div>
                <div class="company-rut">RUT: {{ $payment->company->rut }}</div>
            </div>
        </div>

        <div class="section-title">Información del Pago</div>
        <table class="details-table"> <!-- Usar clase details-table para su estructura y estilos -->
            <thead>
                <tr>
                    <th style="width: 33%;">Paciente</th>
                    <th style="width: 33%;">Fecha y Hora</th>
                    <th style="width: 34%;">Método de Pago</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td style="width: 33%;">
                        <div class="service-name">{{ $payment->patient->full_name }}</div>
                        <div class="service-code">RUT: {{ $payment->patient->rut }}</div>
                    </td>
                    <td style="width: 33%;">
                        <div class="service-name">{{ $payment->paid_at ? $payment->paid_at->format('d/m/Y H:i') : $payment->created_at->format('d/m/Y H:i') }}</div>
                        <div class="service-code">Sucursal: {{ $payment->branch->name ?? 'Casa Central' }}</div>
                    </td>
                    <td style="width: 34%;">
                        <div class="service-name text-capitalize">
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
                            <div class="service-code">Ref: {{ $payment->transaction_reference }}</div>
                        @endif
                    </td>
                </tr>
            </tbody>
        </table>

        <div class="section-title">Detalle de Prestaciones</div>
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
                        <div class="service-name">{{ $alloc->treatmentSession->sessionType->name ?? 'Atención Médica' }}</div>
                        <div class="service-code">SESIÓN ID: {{ $alloc->treatment_session_id }} | COD: {{ $alloc->treatmentSession->sessionType->code ?? 'N/A' }}</div>
                    </td>
                    <td class="text-right font-bold">
                        ${{ number_format($alloc->amount_clp, 0, ',', '.') }}
                    </td>
                </tr>
                @endforeach
            </tbody>
        </table>

        <div class="summary-wrapper">
            <div class="summary-item">
                <span class="summary-label">Total Bruto</span>
                <span class="summary-value">${{ number_format($payment->amount_gross_clp, 0, ',', '.') }}</span>
            </div>
            
            @foreach($payment->receivables as $rec)
            <div class="summary-item text-green">
                <span class="summary-label">Cobertura {{ $rec->insurance->name }}</span>
                <span class="summary-value">-${{ number_format($rec->amount_clp, 0, ',', '.') }}</span>
            </div>
            @endforeach

            @if($payment->discount_clp > 0)
            <div class="summary-item text-orange">
                <span class="summary-label">Descuento Aplicado</span>
                <span class="summary-value">-${{ number_format($payment->discount_clp, 0, ',', '.') }}</span>
            </div>
            @endif

            <div class="summary-total-item">
                <span class="summary-label text-primary">COPAGO PAGADO</span>
                <span class="summary-value text-primary">${{ number_format($payment->amount_clp, 0, ',', '.') }}</span>
            </div>
            <div style="clear: both;"></div>
        </div>

        <div class="footer-section">
            <p>Este documento es un comprobante interno de recepción de pago. No tiene validez tributaria.</p>
            <p>Generado por <span class="app-name">{{ config('app.name') }}</span> el {{ date('d/m/Y H:i:s') }}</p>
        </div>
    </div>
</body>
</html>
