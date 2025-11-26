{{-- <!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Redirigiendo a Webpay...</title>
</head>
<body>
    <form id="webpay-form" action="{{ $url }}" method="POST">
        <input type="hidden" name="token_ws" value="{{ $token }}">
    </form>

    <script>
        document.getElementById('webpay-form').submit();
    </script>
</body>
</html>
 --}}

 <!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Redirigiendo a Webpay…</title>
</head>
<body>
    <script>
        // Abrir Webpay en nueva pestaña
        const win = window.open("{{ $url }}", "_blank");

        // Si el navegador bloqueó el popup, redirigimos en la misma pestaña
        if (!win) {
            window.location.href = "{{ $url }}";
        } else {
            // Opcional: cerrar la pestaña Inertia si es un modal o ventana secundaria
            window.close();
        }
    </script>

    <p>Redirigiendo a Webpay…</p>
</body>
</html>
