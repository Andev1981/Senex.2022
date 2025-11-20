{{-- resources/views/emails/kines/welcome.blade.php --}}
@component('mail::message')
# ¡Bienvenido al Portal Kine!

Hola **{{ $user->name }}**,

Tu cuenta ha sido creada exitosamente. Aquí están tus credenciales de acceso:

@component('mail::panel')
**Email:** {{ $user->email }}  
**Contraseña temporal:** `{{ $temporalPassword }}`
@endcomponent

## Acceder al Portal

Puedes acceder desde tu móvil o computador en:

@component('mail::button', ['url' => route('login')])
Ingresar al Portal
@endcomponent

⚠️ **Importante:** Por seguridad, te recomendamos cambiar tu contraseña en el primer inicio de sesión.

## Portal Móvil

Desde tu móvil, podrás:
- ✅ Ver tu dashboard con estadísticas
- ✅ Crear sesiones de pacientes
- ✅ Ver historial de sesiones
- ✅ Consultar tus pagos y comisiones
- ✅ Gestionar tu perfil

¿Necesitas ayuda? Contáctanos.

Saludos,  
{{ config('app.name') }}
@endcomponent