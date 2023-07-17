<div>
    <button type="button" wire:click="$set('openItem','')" class="flex items-center px-2 py-1 text-xs font-medium text-center text-gray-900 bg-white border border-gray-200 rounded-lg focus:outline-none hover:bg-gray-100 hover:text-primary-700 focus:z-10 focus:ring-4 focus:ring-gray-200 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-4 h-4 mr-2 -ml-0.5">
            <path d="M12 15a3 3 0 100-6 3 3 0 000 6z"></path>
            <path fill-rule="evenodd" clip-rule="evenodd" d="M1.323 11.447C2.811 6.976 7.028 3.75 12.001 3.75c4.97 0 9.185 3.223 10.675 7.69.12.362.12.752 0 1.113-1.487 4.471-5.705 7.697-10.677 7.697-4.97 0-9.186-3.223-10.675-7.69a1.762 1.762 0 010-1.113zM17.25 12a5.25 5.25 0 11-10.5 0 5.25 5.25 0 0110.5 0z">
            </path>
        </svg>
        Resumen
    </button>
    <div class="{{ $openItem }} bg-gray-600 bg-opacity-50 overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 z-50 justify-center w-full md:inset-0 h-modal md:h-full flex">
        <div class="relative w-full h-full p-4 md:max-w-7xl md:h-auto">

            <!-- Modal content -->
            <div class="relative p-4 bg-white rounded-lg shadow dark:bg-gray-800 sm:p-5">
                <!-- Modal header -->
                <div class="flex items-center justify-between pb-4 mb-4 border-b rounded-t sm:mb-5 dark:border-gray-600">
                    <h3 class="text-base text-gray-700 dark:text-white">
                        Resumen de Sesiones
                    </h3>
                    <button wire:click="$set('openItem','hidden')" type="button" class="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center dark:hover:bg-gray-600 dark:hover:text-white">
                        <svg aria-hidden="true" class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                            <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path>
                        </svg>
                        <span class="sr-only">Close modal</span>
                    </button>
                </div>
                <div>
                    <div class="grid gap-4 mb-4 sm:grid-cols-4">
                        <div class="flex items-center shadow-lg rounded-xl">
                            <div class="font-medium dark:text-white pl-5">
                                <div>{{ $paciente->name . ' ' . $paciente->last_name }}</div>
                                <div class="text-sm text-gray-500 dark:text-gray-400">{{ $paciente->email }}</div>
                            </div>
                        </div>
                        <div class="flex items-center shadow-lg bg-slate-600 rounded-xl">
                            <div class="px-2">

                                <table class="w-full text-sm text-gray-500 dark:text-gray-400">
                                    <thead class="text-xs text-gray-700 uppercase bg-teal-100 dark:bg-gray-700 dark:text-gray-400">
                                        <tr class="text-center text-white bg-sky-500">
                                            <th colspan="3" class="px-6 py-1">Atenciones</th>
                                        </tr>
                                        <tr class="text-center">
                                            <th scope="col" class="px-6 py-1">
                                                Total</th>
                                            <th scope="col" class="px-6 py-1">Atendidas</th>
                                            <th scope="col" class="px-6 py-1">Pendientes</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr class="text-center bg-white border-b dark:border-gray-700 hover:bg-cyan-50">
                                            <td class="py-1 pl-2 mx-2">
                                                {{ count($items) }}
                                            </td>
                                            <td class="px-6 py-1">
                                                {{ count($atendidas) }}
                                            </td>
                                            <td class="px-6 py-1">
                                                {{ $pendientes }}
                                            </td>
                                        </tr>

                                    </tbody>
                                </table>
                            </div>
                        </div>

                    </div>
                    <div class="grid gap-4 shadow-xl sm:grid-cols-2 sm:gap-6">
                        <div class="px-5 space-y-4 sm:col-span-2 sm:space-y-6">

                            <div class="w-full overflow-x-auto">
                                <table class="w-full text-sm text-gray-500 dark:text-gray-400">
                                    <thead class="text-xs text-gray-700 uppercase bg-teal-100 dark:bg-gray-700 dark:text-gray-400">
                                        <tr class="">
                                            <th scope="col" class="px-6 py-3">Kine</th>
                                            <th scope="col" class="px-6 py-3">Estado</th>
                                            <th scope="col" class="px-6 py-3">Fecha&nbsp;Atención</th>
                                            
                                            <th scope="col" class="px-6 py-3">Comentarios</th>
                                            <th scope="col" class="px-6 py-3">
                                                <span class="sr-only">Actions</span>
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <div>
                                            @forelse ($items as $item)
                                            <tr class="bg-white border-b dark:border-gray-700 hover:bg-cyan-50">
                                                <td class="py-2 pl-2 mx-2">
                                                    {{ $item->user->name }}
                                                </td>
                                                <td class="px-6 py-4">
                                                @if ($application->status === 0)
                                                    
                                                <span class="inline-flex items-center bg-yellow-100 text-yellow-800 text-xs font-medium mr-2 px-2.5 py-0.5 rounded-full dark:bg-yellow-900 dark:text-yellow-300">
                                                    <span class="w-2 h-2 mr-1 bg-yellow-500 rounded-full"></span>
                                                    Pendiente
                                                </span>
                                                    @elseif ($application->status === 1)
                                                    <span class="inline-flex items-center bg-teal-100 text-teal-800 text-xs font-medium mr-2 px-2.5 py-0.5 rounded-full dark:bg-teal-900 dark:text-teal-300">
                                                    <span class="w-2 h-2 mr-1 bg-teal-500 rounded-full text-white"></span>
                                                    Atendida
                                                </span>
                                                    @elseif ($application->status === 2)
                                                    <span class="inline-flex items-center bg-red-100 text-red-800 text-xs font-medium mr-2 px-2.5 py-0.5 rounded-full dark:bg-red-900 dark:text-red-300">
                                                    <span class="w-2 h-2 mr-1 bg-red-500 rounded-full text-white"></span>
                                                    Cancelada
                                                </span>
                                                    @elseif ($application->status === 3)
                                                    <span class="inline-flex items-center bg-gray-100 text-gray-800 text-xs font-medium mr-2 px-2.5 py-0.5 rounded-full dark:bg-gray-900 dark:text-gray-300">
                                                    <span class="w-2 h-2 mr-1 bg-gray-500 rounded-full text-white"></span>
                                                    Reagendado
                                                </span>
                                                        
                                                @endif
                                                </td>
                                                <td class="px-6 py-4">
                                                    @if ($item->fecha_atencion)
                                                        
                                                    {{ $item->fecha_atencion }}
                                                    @else
                                                        ---------
                                                    @endif
                                                </td>
                                                
                                                <td class="px-6 py-4">
                                                @if ($item->fecha_atencion)
                                                        
                                                        {{ $item->comments }}
                                                        @else
                                                            ---------
                                                        @endif
                                                </td>
                                                <td class="px-6 py-4">

                                                    @livewire('paciente.show.atenciones.editar-item', ['applyItem' => $item], key($item->id))


                                                </td>
                                            </tr>
                                            @empty
                                            <tr class="bg-white border-b dark:border-gray-700 hover:bg-cyan-50">
                                                <td colspan="8" class="py-2 pl-2 mx-2 text-center">
                                                    Sin sesiones agregadas
                                                </td>
                                            </tr>
                                            @endforelse
                                        </div>
                                    </tbody>
                                </table>
                            </div>
                            <div class="mb-5">
                                {{ $items->links() }}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>