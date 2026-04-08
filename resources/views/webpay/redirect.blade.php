<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Redirigiendo a Webpay...</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            height: 100vh;
            margin: 0;
            background-color: #f8fafc;
            color: #1e293b;
        }
        .loader {
            border: 3px solid #e2e8f0;
            border-top: 3px solid #6366f1;
            border-radius: 50%;
            width: 40px;
            height: 40px;
            animation: spin 1s linear infinite;
            margin-bottom: 20px;
        }
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        h1 { font-size: 1.25rem; font-weight: 700; margin: 0; }
        p { font-size: 0.875rem; color: #64748b; margin-top: 8px; }
    </style>
</head>
<body>
    <div class="loader"></div>
    <h1>Conectando con Webpay Plus</h1>
    <p>Por favor, no cierres esta ventana...</p>

    <form id="webpay-form" action="{{ $url }}" method="POST">
        <input type="hidden" name="token_ws" value="{{ $token }}">
    </form>

    <script>
        window.onload = function() {
            document.getElementById('webpay-form').submit();
        };
    </script>
</body>
</html>
