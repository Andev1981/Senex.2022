<div>
    <div class="bg-white p-3 shadow-sm rounded-sm">
        <div class="flex items-center space-x-2 font-semibold text-gray-900 leading-8">
            <span clas="text-green-500">
                <svg class="h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                    stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
            </span>
            <span class="tracking-wide">Perfil&nbsp;de&nbsp;{!!$name!!}</span>
            
            <button wire:click="openModal"
            class="block w-full text-blue-800 text-sm font-semibold rounded-lg hover:bg-gray-300 bg-gray-200 focus:outline-none focus:shadow-outline focus:bg-gray-100 hover:shadow-xs p-3 my-4">Agregar Apoderado</button>
          
        </div>
        @if ($open)
            <div class="text-gray-700">
                <div class="grid md:grid-cols-2 text-sm">
                    <div class="grid grid-cols-1">
                        <div class="px-2 py-2 font-bold">Nombre</div>
                        <input type="text" wire:model="name" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500">
                    </div>
                
                    <div class="grid grid-cols-1">
                        <div class="px-4 py-2 font-bold">Rut</div>
                        <input type="text" wire:model="rut" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500">
                    </div>
                    
                    <div class="grid grid-cols-1">
                        <div class="px-4 py-2 font-bold">Email</div>
                            <input type="email" wire:model="email" id="email" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" required>
                        </div>
                    <div class="grid grid-cols-1">
                        <div class="px-4 py-2 font-bold">Fecha de Nacimiento</div>
                        <input type="date" wire:model="birthday" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" value="{{$user->birtday}}">
                    </div>

                    <div class="grid grid-cols-1">
                        <div class="px-4 py-2 font-bold">Teléfono</div>
                            <input type="text" wire:model="phone" id="phone" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" required>
                        </div>
                    <div class="grid grid-cols-1">
                        <div class="px-4 py-2 font-bold">Dirección</div>
                        <input type="text" wire:model="direccion" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500">
                    </div>

                    <div class="grid grid-cols-1">
                        <div class="px-4 py-2 font-bold">Comuna</div>
                        <input type="text" wire:model="comuna" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500">
                    </div>
                </div>
            </div>
            <button wire:click="update"
            class="block w-full text-blue-800 text-sm font-semibold rounded-lg hover:bg-gray-300 bg-gray-200 focus:outline-none focus:shadow-outline focus:bg-gray-100 hover:shadow-xs p-3 my-4">Actualizar</button>
            <button wire:click="cancel"
            class="block w-full text-yellow-500 text-sm font-semibold rounded-lg hover:bg-gray-300 bg-gray-200 focus:outline-none focus:shadow-outline focus:bg-gray-100 hover:shadow-xs p-3 my-4">Cancelar</button>
        @else
            <div class="text-gray-700">
                <div class="grid md:grid-cols-2 text-sm">
                    <div class="grid grid-cols-1">
                        <div class="px-4 py-2 font-bold">Nombre</div>
                        <div class="px-4 py-2">{{ $name}}</div>
                    </div>
                    <div class="grid grid-cols-1">
                        <div class="px-4 py-2 font-bold">Rut</div>
                        <div class="px-4 py-2">{{$rut}}</div>
                    </div>
                    <div class="grid grid-cols-1">
                        <div class="px-4 py-2 font-bold">Email.</div>
                        <div class="px-4 py-2">
                            <a class="text-blue-800" href="mailto:{{$email}}">{{$email}}</a>
                        </div>
                    </div>
                    <div class="grid grid-cols-1">
                        <div class="px-4 py-2 font-bold">Fecha de Nacimiento</div>
                        <div class="px-4 py-2">{{ \Carbon\Carbon::parse($birthday)->format('j \\d\e F Y')}}</div>
                    </div>
                    <div class="grid grid-cols-1">
                        <div class="px-4 py-2 font-bold">Teléfono</div>
                        <div class="px-4 py-2">{{ $phone}}</div>
                    </div>
                    <div class="grid grid-cols-1">
                        <div class="px-4 py-2 font-bold">Dirección</div>
                        <div class="px-4 py-2">{{$direccion}}</div>
                    </div>
                    <div class="grid grid-cols-1">
                        <div class="px-4 py-2 font-bold">Comuna</div>
                        <div class="px-4 py-2">
                            <a class="text-blue-800">{{$comuna}}</a>
                        </div>
                    </div>
                </div>
            </div>
         
            <button wire:click="open"
            class="block w-full text-blue-800 text-sm font-semibold rounded-lg hover:bg-gray-300 bg-gray-200 focus:outline-none focus:shadow-outline focus:bg-gray-100 hover:shadow-xs p-3 my-4">Editar Información</button>
           
        @endif


    </div>
    @if($modal)
            <div tabindex="-1" class="bg-[#4d515dab] overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 z-50 w-full md:inset-0 h-modal md:h-full justify-center items-center flex" aria-modal="true" role="dialog">
                        <!-- Modal content -->
                <div class="relative bg-white rounded-lg shadow dark:bg-gray-700">
                        <!-- Modal header -->
                        <div class="flex justify-between items-center p-5 rounded-t border-b dark:border-gray-600">
                            <h3 class="text-xl font-medium text-gray-900 dark:text-white">
                               Asignar Apoderado
                            </h3>
                            <button wire:click="closeModal" type="button" class="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center dark:hover:bg-gray-600 dark:hover:text-white" data-modal-toggle="medium-modal">
                                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path></svg>
                            </button>
                        </div>
                        <!-- Modal body -->
                        <div class="relative p-5 overflow-x-auto shadow-md sm:rounded-lg">        
                            <table class="w-full shadow-md text-sm text-left text-gray-500 dark:text-gray-400">
                          
                            
                            <thead class="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                            <tr class="text-center">
                                <th scope="col" class="px-6 py-3">#</th>
                                <th scope="col" class="px-6 py-3">Nombre</th>
                                <th scope="col" class="px-6 py-3">Rut</th>
                                <th scope="col" class="px-6 py-3">Estado</th>
                                <th scope="col" class="px-6 py-3">Asignar</th>
                            </tr>
                            </thead>
                            <tbody>
                                @foreach ($patients as $patient)
                                <tr class="bg-white border-b text-center dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">

                                    <td class="px-6 py-4">{{$patient->id}}</td>
                                    <td class="px-6 py-4">{{$patient->user->name}}</td>
                                    <td class="px-6 py-4">{{$patient->user->rut}}</td>
                                    <td class="px-6 py-4">
                                    @if ($patient->state == 0)
                                        <span class="bg-red-500 text-white uppercase text-xs font-semibold mr-2 px-2 py-0 rounded-full dark:bg-red-200 dark:text-red-900">Inactivo</span>
                                    @else
                                        <span class="bg-green-500 text-white uppercase text-xs font-semibold mr-2 px-2 py-0 rounded-full dark:bg-red-200 dark:text-red-900">Activo</span>
                                    @endif
                                    </td>
                                    <td class="px-6 py-4">

                                        <button wire:click="asignarApoderado({{$patient->user->id}})"" type="button"class="font-medium text-blue-600 dark:text-blue-500 hover:underline">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-check2-square" viewBox="0 0 16 16">
                                                <path d="M3 14.5A1.5 1.5 0 0 1 1.5 13V3A1.5 1.5 0 0 1 3 1.5h8a.5.5 0 0 1 0 1H3a.5.5 0 0 0-.5.5v10a.5.5 0 0 0 .5.5h10a.5.5 0 0 0 .5-.5V8a.5.5 0 0 1 1 0v5a1.5 1.5 0 0 1-1.5 1.5H3z"/>
                                                <path d="m8.354 10.354 7-7a.5.5 0 0 0-.708-.708L8 9.293 5.354 6.646a.5.5 0 1 0-.708.708l3 3a.5.5 0 0 0 .708 0z"/>
                                              </svg>
                                        </button>

                                    </td>
                                </tr>
                            @endforeach
                            </tr>
                            </tbody>
                            </table>
                        </div>
                    </div>
                </div>
        @endif

</div>
