<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <style>
        body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #333; line-height: 1.6; margin: 0; padding: 0; background-color: #f4f7f6; }
        .wrapper { width: 100%; background-color: #f4f7f6; padding: 40px 0; }
        .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; shadow: 0 4px 6px rgba(0,0,0,0.05); }
        .header { background-color: #3292b3; padding: 40px 20px; text-align: center; color: #ffffff; }
        .header h1 { margin: 0; font-size: 24px; font-weight: 900; text-transform: uppercase; letter-spacing: 2px; }
        .content { padding: 40px; }
        .greeting { font-size: 18px; font-weight: bold; color: #1a202c; margin-bottom: 16px; }
        .message { font-size: 16px; color: #4a5568; margin-bottom: 32px; }
        .summary-card { background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px; text-align: center; margin-bottom: 32px; }
        .summary-label { font-size: 12px; font-weight: 900; color: #858793; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px; }
        .summary-total { font-size: 32px; font-weight: 900; color: #3292b3; margin: 0; }
        .summary-detail { font-size: 14px; color: #718096; margin-top: 8px; }
        .button-container { text-align: center; margin-bottom: 32px; }
        .button { background-color: #3292b3; color: #ffffff; padding: 16px 32px; border-radius: 12px; text-decoration: none; font-weight: bold; font-size: 14px; text-transform: uppercase; display: inline-block; }
        .footer { background-color: #f8fafc; padding: 32px; text-align: center; border-top: 1px solid #e2e8f0; }
        .footer p { margin: 0; font-size: 12px; color: #a0aec0; }
        .brand { font-weight: bold; color: #3292b3; }
    </style>
</head>
<body>
    <div class="wrapper">
        <div class="container">
            <div class="header">
                <h1>{{ config('app.name') }}</h1>
            </div>
            
            <div class="content">
                <div class="greeting">¡Hola, {{ $invoice->patient->name }}!</div>
                <div class="message">
                    Confirmamos la recepción de tu pago. Adjunto a este correo encontrarás tu <strong>{{ $invoice->type_name }}</strong> oficial emitida ante el SII.
                </div>

                <div class="summary-card">
                    <div class="summary-label">Monto de la Transacción</div>
                    <div class="summary-total">${{ number_format($invoice->amount_total_clp, 0, ',', '.') }}</div>
                    <div class="summary-detail">Documento: {{ $invoice->type_name }} #{{ $invoice->dte_folio ?? 'S/N' }}</div>
                </div>

                <p class="message">
                    Si tienes cualquier duda sobre este comprobante o tu tratamiento, por favor contáctanos respondiendo a este mismo correo o a través de nuestros canales oficiales.
                </p>
            </div>

            <div class="footer">
                <p>Este es un mensaje automático generado por el sistema de gestión de <span class="brand">{{ config('app.name') }}</span>.</p>
                <p style="margin-top: 8px;">&copy; {{ date('Y') }} Todos los derechos reservados.</p>
            </div>
        </div>
    </div>
</body>
</html>