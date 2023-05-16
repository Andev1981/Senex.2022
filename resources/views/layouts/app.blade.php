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
    <body class="font-sans antialiased h-screen bg-zinc-300">

            @livewire('layout.navigation')

            <main>

                {{ $slot }}

            </main>

        @include('sweetalert::alert')
        @yield('scripts')
        @livewireScripts

    </body>
</html>

