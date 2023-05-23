<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">

<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>{{ config('app.name', 'Senex-App') }}</title>
    @vite(['resources/css/app.css', 'resources/js/app.js'])
    @livewireStyles
</head>

<body class="antialiased">
    <section class="bg-gray-50 dark:bg-gray-900">
        @livewire('layout.navigation')
        @livewire('layout.sidebar')

        <main class="h-auto p-4 pt-20 md:ml-64">

            {{ $slot }}

        </main>
    </section>

    @livewireScripts

    <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>


    @stack('scripts')
    <script>
        window.addEventListener('swal-success', () => {
            Swal.fire({
                title: 'Ok!',
                text: 'Acción realizada correctamente',
                icon: 'success',
                confirmButtonText: 'ok'
            })
        });
        window.addEventListener('swal-error', () => {
            Swal.fire({
                title: 'Lo Sentimos :(',
                text: 'La acción realizada no pudo realizarse correctamente',
                icon: 'error',
                confirmButtonText: 'Cerrar'
            })
        });
        window.addEventListener('swal-warning', () => {
            Swal.fire({
                title: 'Error!',
                text: 'Do you want to continue',
                icon: 'warning',
                confirmButtonText: 'Cool'
            })
        });
        window.addEventListener('swal-info', () => {
            Swal.fire({
                title: 'Registro Eliminado!',
                text: 'Acción realizada correctament',
                icon: 'info',
                confirmButtonText: 'Cool'
            })
        });
        window.addEventListener('swal-question', () => {
            Swal.fire({
                title: 'Error!',
                text: 'Do you want to continue',
                icon: 'question',
                confirmButtonText: 'Cool'
            })
        });
    </script>
</body>

</html>
