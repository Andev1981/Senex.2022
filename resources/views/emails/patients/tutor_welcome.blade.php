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
        .info-card { background-color: #f8fafc; border-left: 4px solid #3292b3; padding: 20px; margin-bottom: 32px; border-radius: 0 12px 12px 0; }
        .info-label { font-size: 11px; font-weight: 900; color: #858793; text-transform: uppercase; margin-bottom: 4px; }
        .info-value { font-size: 16px; font-weight: bold; color: #1a202c; }
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
                <div class="greeting">¡Hola, {{ explode(' ', $contact->name)[0] }}!</div>
                <div class="message">
                    Te damos la bienvenida a nuestra plataforma. Este correo confirma que has sido registrado como el <strong>Tutor Responsable</strong> de la ficha clínica de:
                </div>

                <div class="info-card">
                    <div class="info-label">Paciente a Cargo</div>
                    <div class="info-value">{{ $patient->full_name }}</div>
                </div>

                <div class="message">
                    Como apoderado, centralizaremos contigo toda la información técnica y administrativa relacionada con el tratamiento. A partir de ahora, recibirás notificaciones sobre:
                </div>

                <p class="message" style="font-size: 14px;">
                    • Agendamiento y confirmación de citas.<br>
                    • Estados de cuenta y documentos de recaudación.<br>
                    • Seguimiento y objetivos del plan de salud.
                </p>

                <div class="button-container">
                    <a href="{{ url('/') }}" class="button">Acceder al Portal</a>
                </div>

                <p class="message">
                    Agradecemos la confianza depositada en nuestro equipo de profesionales.
                </p>
            </div>

            <div class="footer">
                <p>Este es un mensaje enviado por <span class="brand">{{ $company->business_name ?? config('app.name') }}</span>.</p>
                <p style="margin-top: 8px;">&copy; {{ date('Y') }} Todos los derechos reservados.</p>
            </div>
        </div>
    </div>
</body>
</html>
