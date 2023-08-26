<div>
    <section class="p-2 dark:bg-gray-900 sm:p-5">
        <div class="max-w-screen-xl px-1 mx-auto lg:px-2">
            <!-- Start coding here -->

            <div class="relative overflow-hidden bg-white shadow-md dark:bg-gray-800 sm:rounded-lg">
                <div class="flex flex-col items-center justify-between p-4 space-y-3 md:flex-row md:space-y-0 md:space-x-4">
                    <div class="w-full md:w-5/6">
                        
                    </div>
                    <div class="flex flex-col items-stretch justify-end flex-shrink-0 w-full space-y-2 md:w-auto md:flex-row md:space-y-0 md:items-center md:space-x-3">
                    @livewire('paciente.show.atenciones.atenciones-crear',['paciente' => $paciente])

                    </div>
                </div>
                <div class="w-full overflow-x-auto">
                    <table class="w-full text-sm text-gray-500 dark:text-gray-400">
                        <thead class="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                            <tr class="text-center">
                                <th scope="col" class="px-6 py-3">Kine</th>

                                <th scope="col" class="px-6 py-3">Estado</th>
                                <th scope="col" class="px-6 py-3">Comentarios</th>
                                <th colspan="3" scope="col" class="px-6 py-3 sr-only">
                                    ver
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                 
                                @if ($atenciones->count() > 0)
                              
                                    @foreach ($atenciones as $application)
                                    <tr class="bg-white border-b dark:border-gray-700 hover:bg-cyan-50">
                                        <td class="px-6 py-4 text-center uppercase">
                                            @if (count($application->items) > 0)
                                                
                                                {{ $application->items[(count($application->items)-1)]->user->name ?? '' }}
                                                {{ $application->items[(count($application->items)-1)]->user->last_name ?? '' }}
                                            @endif
                                        </td>

                                        <td class="px-6 py-4 text-center  uppercase">
                                            <div>
                                                @if ($application->status === 0)
                                                <span class="inline-flex items-center bg-yellow-100 text-yellow-800 text-xs font-medium mr-2 px-2.5 py-0.5 rounded-full dark:bg-yellow-900 dark:text-yellow-300">
                                                    <span class="w-2 h-2 mr-1 bg-yellow-500 rounded-full"></span>
                                                    Pendiente
                                                </span>
                                                @elseif ($application->status === 1)
                                                <span class="inline-flex items-center bg-green-100 text-green-800 text-xs font-medium mr-2 px-2.5 py-0.5 rounded-full dark:bg-green-900 dark:text-green-300">
                                                    <span class="w-2 h-2 mr-1 bg-green-500 rounded-full"></span>
                                                    En&nbsp;proceso
                                                </span>
                                                @elseif ($application->status === 2)
                                                <span class="inline-flex items-center bg-teal-100 text-teal-800 text-xs font-medium mr-2 px-2.5 py-0.5 rounded-full dark:bg-teal-900 dark:text-teal-300">
                                                    <span class="w-2 h-2 mr-1 bg-teal-500 rounded-full"></span>
                                                    Finalizada
                                                </span>
                                                @endif
                                            </div>

                                        </td>
                                        <td class="px-6 py-4 text-center  uppercase">
                                        {{ $application->comments ?? '' }}
                                        </td>
                                        <td class="flex px-6 py-4  uppercase">
                                     
                                                @livewire('paciente.show.atenciones.atenciones-editar', ['application' => $application], key($application->id))
                                            
                                        </td>
                                    </tr>
                                    @endforeach
                               
                                @else
                                <tr class="text-center">
                                    <td colspan="6">
                                        No hay datos aún...
                                    </td>
                                </tr>
                                @endif
                         
                        </tbody>
                    </table>
                </div>
                <nav class="flex flex-col items-start justify-between p-4 space-y-3 md:flex-row md:items-center md:space-y-0" aria-label="Table navigation">
                    {{ $atenciones->links() }}
                </nav>
            </div>
        </div>
    </section>
</div>