<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Estado de Cita - Senex</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap" rel="stylesheet">
    <style>
        body { font-family: 'Inter', sans-serif; }
    </style>
</head>
<body class="bg-gray-50 flex items-center justify-center min-h-screen p-4">
    <div class="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 text-center">
        <div class="mb-6 flex justify-center">
            @if($type === 'success')
                <div class="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                    <svg class="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                </div>
            @elseif($type === 'warning')
                <div class="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center">
                    <svg class="w-10 h-10 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                </div>
            @else
                <div class="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center">
                    <svg class="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                </div>
            @endif
        </div>

        <h1 class="text-2xl font-bold text-gray-900 mb-2">
            @if($type === 'success') ¡Cita Confirmada! @elseif($type === 'warning') Cita Cancelada @else Información @endif
        </h1>
        
        <p class="text-gray-600 mb-8">
            {{ $message }}
        </p>

        <div class="space-y-3">
            <a href="/" class="block w-full py-3 px-4 bg-brand-primary text-white rounded-xl font-semibold bg-[#21235b] hover:opacity-90 transition-all">
                Ir al sitio principal
            </a>
            <p class="text-xs text-gray-400">© {{ date('Y') }} Senex Clinical Management System</p>
        </div>
    </div>
</body>
</html>
