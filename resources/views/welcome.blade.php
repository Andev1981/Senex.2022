<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@4.0.0/dist/css/bootstrap.min.css" integrity="sha384-Gn5384xqQ1aoWXA+058RXPxPg6fy4IWvTNh0E263XmFcJlSAwiGgFAW/dAiS6JXm" crossorigin="anonymous">
<x-admin-layout>
    <x-slot name="header">
        <h2 class="font-semibold text-xl text-gray-800 leading-tight">
            {{ __('Dashboard') }}
        </h2>
    </x-slot>

      <div class="jumbotron">
            <h1 class="display-4">Hola Senex</h1>
            <p class="lead"> Bienvenido al panel de administración de tu cuenta</p>
            <hr class="my-4">
            <p></p>
            
            <br>
            <a href="pacientes" class="btn btn-info" role="button" aria-pressed="true">Ver Pacientes</a>
            <a href="kine" class="btn btn-info" role="button" aria-pressed="true">Ver Kinesiólogos</a>
            <br>
            <br>
            <a href="ayuda" class="btn btn-dark" role="button" aria-pressed="true">¿ Necesitas alguna ayuda ?</a>
        </div>

</x-admin-layout>
