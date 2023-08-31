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
    <div class="{{ $opendetalles }} bg-gray-600 bg-opacity-50 overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 z-50 justify-center items-center w-full md:inset-0 h-modal md:h-full flex">
        <div class="relative w-full h-full p-4 max-w-7xl md:h-auto">

            <!-- Modal content -->
            <div class="relative p-4 bg-white rounded-lg shadow dark:bg-gray-800 sm:p-5">
                <!-- Modal header -->
                <div class="flex items-center justify-between pb-2 mb-2 border-b rounded-t sm:mb-2 dark:border-gray-600">
                    <h4 class="text-base font-semibold text-gray-900 dark:text-white">
                        Detalles Kine


                    </h4>
                    <button wire:click="$set('opendetalles', 'hidden')" type="button" class="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center dark:hover:bg-gray-600 dark:hover:text-white">
                        <svg aria-hidden="true" class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                            <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path>
                        </svg>
                        <span class="sr-only">Close modal</span>
                    </button>
                </div>
                <div class="grid gap-2 mb-4 sm:grid-cols-4">
                    <form wire:submit.prevent="saveKine">
                        <div class="col-span-2">

                            <!--    <div class="mb-4">
                                <div
                                    class="relative w-16 h-16 overflow-hidden bg-gray-100 rounded-full shadow-xl dark:bg-gray-600">
                                    <div wire:loading wire:target='file_path'>
                                        <svg aria-hidden="true" role="status"
                                            class="inline w-16 h-16 p-4 text-center text-primary animate-spin"
                                            viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path
                                                d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                                                fill="#E5E7EB" />
                                            <path
                                                d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                                                fill="currentColor" />
                                        </svg>
                                    </div>
                                    @if ($kine->avatar || $file_path)

                                        @if ($file_path)
                                            <img class="w-16 h-16 rounded" src="{{ $file_path->temporaryURL() }}"
                                                alt="New Avatar">
                                        @else
                                            <img class="w-16 h-16 rounded" src="{{ $kine->avatar }}" alt="Old avatar">
                                        @endif
                                    @else
                                        <svg wire:loading.remove wire:target='kine.avatar'
                                            class="absolute w-16 h-16 text-gray-400 -left-1" fill="currentColor"
                                            viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
                                            <path fill-rule="evenodd"
                                                d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                                                clip-rule="evenodd">
                                            </path>
                                        </svg>
                                    @endif


                                </div>
                                <input
                                    class="mt-2 text-['9px'] text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 dark:text-gray-400 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400"
                                    aria-describedby="file_input_help" wire:model="file_path" id="file_input"
                                    type="file">
                                @error('kine.avatar')
                                    <p class="mt-2 text-xs text-red-600 dark:text-red-500">
                                        {{ $message }}
                                    </p>
                                @enderror

                            </div> -->

                            <div>
                                <x-input-field-senex label="Nombre" placeholder="" type="text" wire:model.defer="kine.name">
                                    <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-gray-500 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" class="text-gray-500" stroke-width="2">
                                        <path stroke-linecap="round" stroke-linejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                </x-input-field-senex>
                                @error('kine.name')
                                <p class="mt-2 text-xs text-red-600 dark:text-red-500">
                                    {{ $message }}
                                </p>
                                @enderror
                            </div>

                            <div>
                                <x-input-field-senex label="Apellido" placeholder="" type="text" wire:model.defer="kine.last_name">
                                    <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-gray-500 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" class="text-gray-500" stroke-width="2">
                                        <path stroke-linecap="round" stroke-linejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                </x-input-field-senex>
                                @error('kine.last_name')
                                <p class="mt-2 text-xs text-red-600 dark:text-red-500">
                                    {{ $message }}
                                </p>
                                @enderror
                            </div>

                            <div>
                                <x-input-field-senex label="Rut" placeholder="" type="text" wire:model.defer="kine.rut">
                                    <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-gray-500 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" class="text-gray-500" stroke-width="2">
                                        <path stroke-linecap="round" stroke-linejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                </x-input-field-senex>
                                @error('kine.rut')
                                <p class="mt-2 text-xs text-red-600 dark:text-red-500">
                                    {{ $message }}
                                </p>
                                @enderror
                            </div>

                            <div>
                                <x-input-field-senex label="Email" placeholder="" type="text" wire:model.defer="kine.email">
                                    <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-gray-500 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" class="text-gray-500" stroke-width="2">
                                        <path stroke-linecap="round" stroke-linejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                </x-input-field-senex>
                                @error('kine.email')
                                <p class="mt-2 text-xs text-red-600 dark:text-red-500">
                                    {{ $message }}
                                </p>
                                @enderror
                            </div>

                            <div>
                                <x-input-field-senex label="Teléfono" placeholder="" type="number" wire:model.defer="kine.phone">
                                    <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-gray-500 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" class="text-gray-500" stroke-width="2">
                                        <path stroke-linecap="round" stroke-linejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                </x-input-field-senex>
                                @error('kine.phone')
                                <p class="mt-2 text-xs text-red-600 dark:text-red-500">
                                    {{ $message }}
                                </p>
                                @enderror
                            </div>

                            <div>
                                <x-input-field-senex label="Fecha de Nacimiento" placeholder="" type="date" wire:model.defer="kine.birth">
                                    <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-gray-500 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" class="text-gray-500" stroke-width="2">
                                        <path stroke-linecap="round" stroke-linejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                </x-input-field-senex>
                                @error('kine.birth')
                                <p class="mt-2 text-xs text-red-600 dark:text-red-500">
                                    {{ $message }}
                                </p>
                                @enderror
                            </div>

                            <div class="flex items-center pt-5 space-x-4 border-t-1">
                                <button type="submit" wire:loading.remove wire:target="saveKine" class="inline-flex items-center px-2 py-1 text-sm font-medium text-center text-white rounded-lg bg-sky-700 hover:bg-sky-800 focus:ring-4 focus:outline-none focus:ring-sky-300 dark:bg-sky-600 dark:hover:bg-sky-700 dark:focus:ring-sky-800">
                                    Actualizar
                                </button>

                                <div wire:loading wire:target="saveKine">

                                    <button disabled type="button" class="inline-flex items-center px-2 py-1 text-sm font-medium text-center text-white rounded-lg bg-sky-700 hover:bg-sky-800 focus:ring-4 focus:outline-none focus:ring-sky-300 dark:bg-sky-600 dark:hover:bg-sky-700 dark:focus:ring-sky-800">

                                        Actualizando...
                                        <svg aria-hidden="true" role="status" class="inline w-4 h-4 mr-3 text-white animate-spin" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="#E5E7EB" />
                                            <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentColor" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </form>
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
                                                    {{ $applyItem->applicationTypeUser->application_type->name ?? '' }}
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
                                                        ${{ number_format($applyItem->price-$applyItem->applicationTypeUser->price,0,',','.') ?? '0' }}.-
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
                                            <!-- <tr class="text-center uppercase bg-white border-b dark:border-gray-700 hover:bg-cyan-50">
                                                <td colspan="6"></td>
                                                <td>
                                                    <a href="reporte-pdf/{{ $this->buscarFecha }}/{{$this->kine->id}}" target="_blank" type="button" class="inline-flex items-center px-2 py-1 my-2 ml-5 text-sm font-medium text-center text-white rounded-lg bg-sky-700 hover:bg-sky-800 focus:ring-4 focus:outline-none focus:ring-sky-300 dark:bg-sky-600 dark:hover:bg-sky-700 dark:focus:ring-sky-800">Pdf</a>
                                                </td>
                                            </tr> -->
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
                <div class="flex items-center pt-5 space-x-4 border-t-2">

                </div>


            </div>
        </div>
    </div>

</div>