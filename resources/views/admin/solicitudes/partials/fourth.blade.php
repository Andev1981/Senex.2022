<button class="block w-full md:w-auto mb-5 text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-2 py-1 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800" type="button" data-modal-toggle="medium-modal">
    Crear receta
    </button>
<!-- Default Modal -->
    <div id="medium-modal" tabindex="-1" class="hidden overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 z-50 w-full md:inset-0 h-modal md:h-full">
            @livewire('recetas.index',[ 'solicitud' => $solicitud])
    </div>
    @unless (count($solicitud->prescriptions) > 0)
        <tr class="bg-white border-b text-center dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 mt-5">
            <td class="px-6 py-4"> No existen recetas activas</td>
        </tr>
    @else
    <table id="dataTableSolicitudes" class="w-full shadow-md text-sm text-left text-gray-500 dark:text-gray-400">
        <thead class="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
        <tr class="text-center">
            <th scope="col" class="px-6 py-3">Fecha de creación</th>
            <th scope="col" class="px-6 py-3">Repetir</th>
            <th scope="col" class="px-6 py-3">Rango</th>
            <th scope="col" class="px-6 py-3">Estado</th>
           {{--  <th scope="col" class="px-6 py-3">Prioridad</th> --}}
            <th scope="col" class="px-6 py-3"></th>
        </tr>
        </thead>
        <tbody>
                    @foreach ($solicitud->prescriptions as $receta)
                        <tr class="bg-white border-b text-center dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                            <td class="px-6 py-4">   {{Carbon\Carbon::parse($receta->prescription_send)->format('h:i | d-m-Y')}}</td>
                            <td class="px-6 py-4">
                            @if ($receta->repeat == 1)
                                <span>Repetición</span>
                            @endif
                            </td>
                            <td class="px-6 py-4">
                                @if ($receta->repeat == 1)
                                    @if ($receta->range == 0)
                                        <span>3 Meses</span>
                                    @elseif($receta->range == 1)
                                        <span>6 Meses</span>
                                    @elseif($receta->range == 2)
                                        <span>12 Meses</span>
                                    @elseif($receta->range == 3)
                                        <span>Sin límite</span>
                                    @endif
                                @endif
                            </td>
                            <td class="px-6 py-4">
                                @if ($receta->state == 1)
                                    <span>Activa</span>
                                    @else
                                    <span>Inactiva</span>
                                @endif
                            </td>
                            <td class="px-6 py-4">
                                @livewire('recetas.edit')
                                <a href="#" type="button"class="font-medium text-blue-600 dark:text-blue-500 hover:underline" type="button" data-modal-toggle="defaultModal">
                                    <svg xmlns="http://www.w3.org/2000/svg" class="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                                        <path stroke-linecap="round" stroke-linejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                    </svg>
                                </a>
                                <a href="#" type="button"class="font-medium text-blue-600 dark:text-blue-500 hover:underline">
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

        @endunless
