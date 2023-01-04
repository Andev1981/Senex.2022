<x-admin-layout>
    <x-slot name="header">
        <h2 class="font-semibold text-xl text-gray-800 leading-tight">
              <nav class="flex" aria-label="Breadcrumb">
                <ol class="inline-flex items-center space-x-1 md:space-x-3">
                    <li class="inline-flex items-center">
                        <a class="inline-flex items-center text-sm font-medium text-gray-700 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white">
                            <svg xmlns="http://www.w3.org/2000/svg" class="mr-2 h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                              </svg>
                            Pacientes
                            
                        </a>
                        
                    </li>
                   
                      
                </ol>
            </nav>
        </h2>
        
    </x-slot>

    
    
    <div class="py-6">
        <div class="w-full mx-auto sm:px-6 lg:px-8">
            <div class="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                <div class=" bg-white border-b border-gray-200">
                   <!-- <form class="p-5">
                           <label for="default-search" class="mb-2 text-sm font-medium text-gray-900 sr-only dark:text-gray-300">Buscar</label>
                            <div class="relative">
                            <div class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">    
                            <svg class="w-5 h-5 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>        
                        </div>
                            <input type="search" id="datatable-search-input" class="block w-full p-4 pl-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="Ingrese parametros de búsqueda..." required="">
                            <button namee ="buscarpor" for ="datatable-search-input" type="submit" class="text-white absolute right-2.5 bottom-2.5 bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-4 py-2 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">Buscar</button>
                            <div id="datatable"></div>    
                        </div>
                        
                    </form> -->
              
                       
                    <div class="relative p-5 overflow-x-auto shadow-md sm:rounded-lg">
                  
                            
                        <table class="w-full shadow-md text-sm text-left text-gray-500 dark:text-gray-400">
                        <a href="{{ route('pacientes.create') }}" class="text-white float-right bg-blue-700 hover:bg-blue-800 my-2 mr-2 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-2 py-1 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">Agregar Paciente</a>
                        
                        <thead class="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                        <tr class="text-center">
                            <th scope="col" class="px-6 py-3">Nombre del paciente</th>
                            <th scope="col" class="px-6 py-3">Rut</th>
                            <th scope="col" class="px-6 py-3">Email</th>
                            <th scope="col" class="px-6 py-3">Fecha nacimiento</th>
                            <th scope="col" class="px-6 py-3">Solicitudes</th>
                            <th scope="col" class="px-6 py-3"></th>
                        </tr>
                        </thead>
                        <tbody>
                            @foreach ($pacientes as $paciente)
                            <tr class="bg-white border-b text-center dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                                <td class="px-6 py-4">{{$paciente->user->name}}</td>
                                <td class="px-6 py-4">{{$paciente->user->rut}}</td>
                                <td class="px-6 py-4">{{$paciente->user->email}}</td>
                                <td class="px-6 py-4">{{$paciente->user->birthday}}</td>
                                <td class="px-6 py-4">
                                    <span class="bg-green-600 text-white text-xs font-semibold mr-2 px-2 py-0 rounded-full dark:bg-red-200 dark:text-red-900">
                                        {{count($paciente->solicitudes)}}
                                    </span>
                                </td>
                                <td class="px-6 py-4">

                                    {{-- <a href="" type="button"class="font-medium text-blue-600 dark:text-blue-500 hover:underline">
                                        <svg xmlns="http://www.w3.org/2000/svg" class="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                                            <path stroke-linecap="round" stroke-linejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                          </svg>
                                    </a> --}}
                                    <a href="{{ route('paciente.show',$paciente->id) }}" type="button"class="font-medium text-blue-600 dark:text-blue-500 hover:underline">
                                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                                            <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            <path stroke-linecap="round" stroke-linejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                        </svg>
                                    </a>

                                </td>
                            </tr>
                            @endforeach

                        </tbody>
                        </table>
                       {{--  <div class="flex flex-col items-center p-5">

                            <span class="text-sm text-gray-700 dark:text-gray-400">
                            Mostrando <span class="font-semibold text-gray-900 dark:text-white">1</span> de <span class="font-semibold text-gray-900 dark:text-white">10</span> de <span class="font-semibold text-gray-900 dark:text-white">100</span> registros
                            </span>

                            <div class="inline-flex mt-2 xs:mt-0">
                            <button class="py-2 px-4 text-sm font-medium text-white bg-gray-800 rounded-l hover:bg-gray-900 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white">
                            Anterior
                            </button>
                            <button class="py-2 px-4 text-sm font-medium text-white bg-gray-800 rounded-r border-0 border-l border-gray-700 hover:bg-gray-900 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white">
                            Próxima
                            </button>
                            </div>
                            </div> --}}
                        </div>
                </div>
            </div>
        </div>
    </div>
    @section('scripts')
{{-- <script>

    $(document).ready(function () {
        $('#dataTableUsers').DataTable({
            responsive: true,
        dom: 'Bfrtip',
        buttons: [
            'excel'
        ],
        language: {
            "lengthMenu": "Mostrar _MENU_ registros",
            "zeroRecords": "No se encuentra resultado",
            "info": "Registros del _START_ al _END_ de un total de _TOTAL_",
            "infoEmpty": "Registros del 0 al 0 de un total de 0 registros",
            "infoFiltered": "(filtrado de un total de _MAX_ registros)",
            "sSearch": "Buscar:",
            "oPaginate": {
                "sFirst": "Primero",
                "sLast": "Ultimo",
                "sNext": "Siguente",
                "sPrevious": "Anterior"

            },
            "sProcessing": "Procesando...",
        },
        responsive: "true",
        dom: 'Bfrtilp',
        buttons:[
            {
                extend:     'excelHtml5',
                text:       "<button class='btn btn-success'>Exportar a Excel <i class='fas fa-file-excel'></i></button>",
                titleAttr:  'Exportar a Excel',
                class:  'btn btn-success'
            }
        ]
        });
    });

</script> --}}
@endsection
</x-admin-layout>
