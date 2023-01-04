
<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <meta name="csrf-token" content="{{ csrf_token() }}">

        <title>{{ config('app.name', 'Senex-App') }}</title>

        <!-- Fonts -->
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700&display=swap">

        <!-- Styles -->
        <link rel="stylesheet" href="{{ asset('css/app.css') }}">
        @livewireStyles
    </head>
    <body class="font-sans antialiased">
        <div class="min-h-screen bg-gray-100">

            @include('layouts.partials.navigation')

            @isset($header)
                 <!-- Page Heading -->
            <header class="bg-white shadow">
                <div class="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
                    {{ $header }}
                </div>
            </header>
            @endisset
            <!-- Page Content -->
  
            <main>
               
                <section class="bg-white dark:bg-gray-900">
                    <div class="container px-6 py-10 mx-auto p-6">
                        <h1 class="text-3xl font-semibold text-gray-800  lg:text-4xl dark:text-white">Servicio de ayuda </h1>

                        <div class="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-3 gap-6 p-6">
                            <div class="lg:flex">
                                <video width="560" height="720" src="{{asset('videos/Ingreso_al_sistema.mov')}}" preload controls> </video>
                                <div class="flex flex-col justify-between py-6 lg:mx-6">
                                    <a href="#" class="text-xl font-semibold text-gray-800 hover:underline dark:text-white ">
                                        Ingresar al sistema
                                    </a>
                                    
                                    <span class="text-sm text-gray-500 dark:text-gray-300">Enfoque : Como ingresar al sistema senex con los perfiles de administradores</span>
                                </div>
                            </div>

                            <div class="lg:flex">
                                <video width="560" height="720" src="{{asset('videos/Agregar_paciente.mov')}}" preload controls> </video>
                                <div class="flex flex-col justify-between py-6 lg:mx-6">
                                    <a href="#" class="text-xl font-semibold text-gray-800 hover:underline dark:text-white ">
                                        Agregar Paciente
                                    </a>
                                    
                                    <span class="text-sm text-gray-500 dark:text-gray-300">Enfoque : Agregar paciente con datos correctos en el perfil administrativo</span>
                                </div>
                            </div>

                            <div class="lg:flex">
                                <video width="560" height="720" src="{{asset('videos/Actualizar_datos_pacientes.mov')}}" preload controls> </video>
                                <div class="flex flex-col justify-between py-6 lg:mx-6">
                                    <a href="#" class="text-xl font-semibold text-gray-800 hover:underline dark:text-white ">
                                        Actualizar Paciente
                                    </a>
                                    
                                    <span class="text-sm text-gray-500 dark:text-gray-300">Enfoque : Editar información de paciente ej: nombre, telefono, correo , entre otros</span>
                                </div>
                            </div>
                            <div class="lg:flex">
                                <video width="560" height="720" src="{{asset('videos/Asignar_apoderado.mov')}}" preload controls> </video>
                                <div class="flex flex-col justify-between py-6 lg:mx-6">
                                    <a href="#" class="text-xl font-semibold text-gray-800 hover:underline dark:text-white ">
                                        Asignar apoderado al paciente
                                    </a>
                                    
                                    <span class="text-sm text-gray-500 dark:text-gray-300">Enfoque : Como asignar un apoderado a un paciente X desde 0</span>
                                </div>
                            </div>


                            <div class="lg:flex">
                                <video width="560" height="720" src="{{asset('videos/Agregar_kinesiologo.mov')}}" preload controls> </video>
                                <div class="flex flex-col justify-between py-6 lg:mx-6">
                                    <a href="#" class="text-xl font-semibold text-gray-800 hover:underline dark:text-white ">
                                        Agregar Kinesiólogo
                                    </a>
                                    
                                    <span class="text-sm text-gray-500 dark:text-gray-300">Enfoque : Agregar kinesiólogo con perfil administrativo</span>
                                </div>
                            </div>

                         

                            <div class="lg:flex">
                                <video width="560" height="720" src="{{asset('videos/Actualizar_datos_kine.mov')}}" preload controls> </video>
                                <div class="flex flex-col justify-between py-6 lg:mx-6">
                                    <a href="#" class="text-xl font-semibold text-gray-800 hover:underline dark:text-white ">
                                        Actualizar Kinesiólogo
                                    </a>
                                    
                                    <span class="text-sm text-gray-500 dark:text-gray-300">Enfoque : Editar información de kinesiólogo</span>
                                </div>
                            </div>


                        </div>
                    </div>
                </section>
            </main>
        </div>
        <!-- Scripts -->
        <script src="{{ asset('js/app.js') }}" defer></script>
        <script src="https://kit.fontawesome.com/8973bdb340.js" crossorigin="anonymous"></script>
        {{-- <script src="https://unpkg.com/flowbite@1.4.2/dist/flowbite.js"></script>
        <script src="https://unpkg.com/flowbite@1.5.1/dist/datepicker.js"></script> --}}
        <script src="https://code.jquery.com/jquery-3.5.1.js"></script>
    
        @include('sweetalert::alert')
        @yield('scripts')
        @livewireScripts

    </body>
</html>

<!-- Gogole Fonts -->
