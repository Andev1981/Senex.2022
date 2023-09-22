<div>
    <div class="flex flex-row">
        @if ($status === 1)
        <button wire:click="$set('opendetalles','')" class="flex items-center px-2 py-1 mr-2 text-sm font-medium text-center text-gray-900 bg-white border border-gray-200 rounded-lg focus:outline-none hover:bg-gray-100 hover:text-primary-700 focus:z-10 focus:ring-4 focus:ring-gray-200 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700" type="button">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-4 h-4 mr-2 -ml-0.5">
                <path d="M12 15a3 3 0 100-6 3 3 0 000 6z"></path>
                <path fill-rule="evenodd" clip-rule="evenodd" d="M1.323 11.447C2.811 6.976 7.028 3.75 12.001 3.75c4.97 0 9.185 3.223 10.675 7.69.12.362.12.752 0 1.113-1.487 4.471-5.705 7.697-10.677 7.697-4.97 0-9.186-3.223-10.675-7.69a1.762 1.762 0 010-1.113zM17.25 12a5.25 5.25 0 11-10.5 0 5.25 5.25 0 0110.5 0z">
                </path>
            </svg>
            Detalles
        </button>

        @endif

        @livewire('kine.create-edit-kine', ['doctor' => $kine], key($kine->id))

    </div>
    <!-- Main modal -->
    <div tabindex="-1" data-modal-placement="top" aria-hidden="true" class="{{ $opendetalles }} bg-gray-600 bg-opacity-50  top-0 right-0 left-0 z-50 justify-center items-center  md:h-full  fixed w-full p-4 overflow-x-hidden overflow-y-auto md:inset-0 h-[calc(100%-1rem)] max-h-full">
        <div class="relative w-full h-full p-4 max-w-7xl md:h-auto">

            <!-- Modal content -->
            <div class="relative p-4 bg-white rounded-lg shadow dark:bg-gray-800 sm:p-5">
                <!-- Modal header -->
               
                <div class="flex items-center justify-between pb-2 mb-2 border-b rounded-t sm:mb-2 dark:border-gray-600">
                    <div class="justify-start">
                      <span class="text-base text-gray-700">{{ $kine->name }}&nbsp;{{$kine->last_name}}</span>
                     <h4 class="text-xs font-semibold text-gray-500 dark:text-white">
                       Resumen Mensual Atenciones Kine
                     </h4>      
                    </div>
                    

                    <button wire:click="$set('opendetalles', 'hidden')" type="button" class="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center dark:hover:bg-gray-600 dark:hover:text-white">
                        <svg aria-hidden="true" class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                            <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path>
                        </svg>
                        <span class="sr-only">Close modal</span>
                    </button>
                </div>
                    <div class="max-w-screen-xl px-1 mx-auto lg:px-2">
                        <div class="relative overflow-hidden bg-white shadow-md dark:bg-gray-800 sm:rounded-lg">

                            <div class="flex flex-row items-center p-4 bg-slate-200 md:flex-row md:space-y-0 md:space-x-4">

                                <span>Tratamientos </span>
                                <select class="block w-full p-1 ml-4 text-xs text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" wire:model="year">

                                    <option selected value="2023">2023</option>
                                    <option value="2024">2024</option>
                                    <option value="2025">2025</option>
                                    <option value="2026">2026</option>
                                    <option value="2028">2028</option>
                                    <option value="2029">2029</option>
                                    <option value="2030">2030</option>
                                </select>
                                <select class="block w-full p-1 ml-4 text-xs text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" wire:model="month">
                                    <option value="01">Enero</option>
                                    <option value="02">Febrero</option>
                                    <option value="03">Marzo</option>
                                    <option value="04">Abril</option>
                                    <option value="05">Mayo</option>
                                    <option value="06">Junio</option>
                                    <option value="07">Julio</option>
                                    <option value="08">Agosto</option>
                                    <option value="09">Septiembre</option>
                                    <option value="10">Octubre</option>
                                    <option value="11">Noviembre</option>
                                    <option value="12">Diciembre</option>
                                </select>

                                <button wire:click="searchByItems" type="button" class="inline-flex items-center px-2 py-1 ml-5 text-sm font-medium text-center text-white rounded-lg bg-sky-700 hover:bg-sky-800 focus:ring-4 focus:outline-none focus:ring-sky-300 dark:bg-sky-600 dark:hover:bg-sky-700 dark:focus:ring-sky-800">Buscar</button>
                                @livewire('kine.values-kine',['doctor' => $kine])
                            </div>

                            <div class="p-5 border border-gray-200 rounded-b-xl dark:border-gray-700 dark:bg-gray-900">
                                <div class="flex">
                                    <table class="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                                        <thead class="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                                            <tr class="text-center">
                                                <th scope="col" class="px-6 py-3">Paciente</th>
                                                <th scope="col" class="px-6 py-3">Tipo</th>
                                                <th scope="col" class="px-6 py-3">N°&nbsp;Sesión</th>
                                                <th scope="col" class="px-6 py-3">Valor&nbsp;Cliente</th>
                                                <th scope="col" class="px-6 py-3">
                                                    Valor&nbsp;Kine
                                                </th>
                                                <th scope="col" class="px-6 py-3">
                                                    Resultado
                                                </th>
                                                <th scope="col" class="px-6 py-3">
                                                    Estado
                                                </th>
                                                <th colspan="2" class="px-6 py-3">
                                                    <span class="sr-only">Actions</span>
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            @forelse ($applyItems as $applyItem)

                                            <tr class="text-center uppercase bg-white border-b dark:border-gray-700 hover:bg-cyan-50">
                                                <td scope="row" class="px-1 py-1 text-gray-900 font-sm text-['9px'] whitespace-nowrap dark:text-white">
                                                    {{ $applyItem->application->user->name ?? '' }}
                                                    {{ $applyItem->application->user->last_name ?? '' }}
                                                </td class="px-1 py-1">

                                                <td>
                                                    {{ $applyItem->applicationType->name ?? '' }}
                                                </td>
                                                <td class="px-1 py-1">{{ $applyItem->numero_sesion ?? ''}}</td>
                                                <td class="px-1 py-1">
                                                    ${{ number_format($applyItem->price,0,',','.') }}.-
                                                </td>
                                                <td class="px-1 py-1">
                                                   @forelse ($kineValues as $kineValue)
                                                        @if($kineValue->application_type_id == $applyItem->application_type_id)
                                                        ${{ number_format($kineValue->price,0,',','.') ?? '0' }}.-
                                                        @endif

                                                    @empty
                                                        Sin Datos
                                                    @endforelse
                                                    
                                                </td>
                                                <td>
                                                    @forelse ($kineValues as $kineValue)
                                                        @if($kineValue->application_type_id == $applyItem->application_type_id)
                                                        ${{ number_format($applyItem->price-$kineValue->price,0,',','.') ?? '0' }}.-
                                                        @endif

                                                    @empty
                                                        Sin Datos
                                                    @endforelse


                                                </td>
                                                <td class="flex px-1 py-1">
                                                    @if ($applyItem)

                                                    @if ($applyItem->status === 0 )
                                                    Pendiente
                                                    @elseif($applyItem->status === 1)
                                                    Atendido
                                                    @endif
                                                    @endif
                                                </td>
                                                <td>
                                                </td>
                                            </tr>
                                            @if ($loop->last)
                                            <tr class="text-center uppercase border-b dark:border-gray-700 hover:bg-cyan-50 bg-cyan-200">
                                            <td colspan="3">
                                            <span class="text-slate-900 font-semibold py-2">Totales</span>
                                            </td>
                                            <td class="text-slate-900 font-semibold py-2">
                                            ${{ number_format($totalPacientes,0,',','.') ?? '0' }}.-
                                            </td>
                                            <td class="text-slate-900 font-semibold py-3">
                                            ${{ number_format($totalKine,0,',','.') ?? '0' }}.-
                                            </td>
                                            <td class="text-slate-900 font-semibold py-3">
                                              ${{ number_format($totalPacientes-$totalKine,0,',','.') ?? '0' }}.-
                                            </td>
                                            <td class="text-slate-900 font-semibold py-2 flex">
                                            @if ($totalKine > 0)
                                                
                                            <a href="reporte-pdf/{{ $this->buscarFecha }}/{{$this->kine->id}}" target="_blank" type="button" class="inline-flex items-center px-2 py-1 my-2 ml-5 text-sm font-medium text-center text-white rounded-lg bg-sky-700 hover:bg-sky-800 focus:ring-4 focus:outline-none focus:ring-sky-300 dark:bg-sky-600 dark:hover:bg-sky-700 dark:focus:ring-sky-800">Pdf</a>
                                            @endif
                                            </td>
                                            </tr>
                                            @endif
                                            @empty
                                            <tr class="text-center">
                                                <td colspan="7" class="my-2">
                                                    Sin Datos
                                                </td>
                                            </tr>

                                            @endforelse
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                        </div>
                    </div>
            </div>
        </div>
    </div>

</div>