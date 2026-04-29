<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <style>
        body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #333; line-height: 1.6; margin: 0; padding: 0; background-color: #f4f7f6; }
        .wrapper { width: 100%; background-color: #f4f7f6; padding: 40px 0; }
        .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; shadow: 0 4px 6px rgba(0,0,0,0.05); }
        .header { background-color: #3292b3; padding: 40px 20px; text-align: center; color: #ffffff; }
        .header h1 { margin: 0; font-size: 20px; font-weight: 900; text-transform: uppercase; letter-spacing: 2px; }
        .content { padding: 40px; }
        .greeting { font-size: 18px; font-weight: bold; color: #1a202c; margin-bottom: 16px; }
        .message { font-size: 16px; color: #4a5568; margin-bottom: 24px; }
        .feature-list { list-style: none; padding: 0; margin-bottom: 32px; }
        .feature-item { display: flex; align-items: center; gap: 12px; margin-bottom: 12px; font-size: 14px; color: #4a5568; }
        .feature-icon { color: #3292b3; font-weight: bold; }
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
                @if($company && $company->logo_url)
                    <img src="{{ $company->logo_url }}" alt="{{ $company->business_name }}" style="max-height: 70px; margin-bottom: 10px;">
                @endif
                <h1>{{ $company->business_name ?? config('app.name') }}</h1>
            </div>
            
            <div class="content">
                <div class="greeting">¡Te damos la bienvenida, {{ $patient->name }}!</div>
                <div class="message">
                    Es un placer saludarte. Te informamos que hemos activado exitosamente tu ficha digital en nuestra plataforma médica.
                </div>

                <div class="message">
                    A partir de ahora, este será nuestro canal oficial para mantenerte informado sobre tu tratamiento y gestiones administrativas:
                </div>

                <ul class="feature-list">
                    <li class="feature-item">
                        <span class="feature-icon">✓</span> 
                        Confirmación y recordatorios de citas.
                    </li>
                    <li class="feature-item">
                        <span class="feature-icon">✓</span> 
                        Envío de documentos tributarios y comprobantes de pago.
                    </li>
                    <li class="feature-item">
                        <span class="feature-icon">✓</span> 
                        Seguimiento de tu plan de salud y evolución clínica.
                    </li>
                </ul>

                <div class="button-container">
                    <a href="{{ url('/') }}" class="button">Acceder a mi Ficha</a>
                </div>

                <p class="message">
                    Estamos comprometidos con tu bienestar y listos para acompañarte en tu recuperación.
                </p>
            </div>

            <div class="footer">
                <p>Gracias por confiar en el equipo de profesionales de <span class="brand">{{ $company->business_name ?? config('app.name') }}</span>.</p>
                <p style="margin-top: 8px;">&copy; {{ date('Y') }} Todos los derechos reservados.</p>
            </div>
        </div>
    </div>
</body>
</html>
