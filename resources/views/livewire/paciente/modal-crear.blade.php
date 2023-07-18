<div>
    <button wire:click="$set('open','')" class="flex items-center text-white bg-sky-700 hover:bg-sky-800 focus:ring-4 focus:outline-none focus:ring-sky-300 font-medium rounded-lg text-sm px-2 py-1.5 text-center dark:bg-sky-600 dark:hover:bg-sky-700 dark:focus:ring-sky-800" type="button">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5 mr-2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M19 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM4 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 0110.374 21c-2.331 0-4.512-.645-6.374-1.766z" />
        </svg>

        Nuevo paciente
    </button>

    <!-- Main modal -->
    <div class="{{ $open }} bg-gray-600 bg-opacity-50 overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 z-50 justify-center w-full md:inset-0 h-modal md:h-full flex">
        <div class="relative w-full h-full max-w-4xl p-4 md:h-auto">

            <!-- Modal content -->
            <div class="relative p-4 bg-white rounded-lg shadow dark:bg-gray-800 sm:p-5">
                <!-- Modal header -->
                <div class="flex items-center justify-between pb-4 mb-4 border-b rounded-t sm:mb-5 dark:border-gray-600">
                    <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
                        Creando nuevo paciente
                    </h3>
                    <button wire:click="$set('open','hidden')" type="button" class="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center dark:hover:bg-gray-600 dark:hover:text-white">
                        <svg aria-hidden="true" class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                            <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path>
                        </svg>
                        <span class="sr-only">Close modal</span>
                    </button>
                </div>
                <form wire:submit.prevent="save">

                    <div class="grid gap-4 mb-4 sm:grid-cols-1 md:grid-cols-3">
                        <div>
                            <x-input-field-required label="Nombre" type="text" wire:model.defer="name" placeholder="">
                                <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-gray-500 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                                            <path stroke-linecap="round" stroke-linejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                            </x-input-field-required>
                            @error('name')
                            <p class="text-sm text-red-600 dark:text-red-500">
                                {{ $message }}.
                            </p>
                            @enderror
                        </div>
                        <div>
                            <x-input-field-required label="Apellido" type="text" wire:model.defer="last_name" placeholder="">
                                    <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-gray-500 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                                            <path stroke-linecap="round" stroke-linejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                                    </svg>
                            </x-input-field-required>
                            @error('last_name')
                            <p class="text-sm text-red-600 dark:text-red-500">
                                {{ $message }}.
                            </p>
                            @enderror
                        </div> 
                        <div>
                            <x-input-field-required label="Fecha de nacimiento" type="date" wire:model.defer="fecha_nacimiento" placeholder="">
                                    <svg xmlns="http://www.w3.org/2000/svg"  fill="none" class="bi bi-calendar2-plus w-5 h-5 text-gray-500 dark:text-gray-400" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1">
                                    <path d="M3.5 0a.5.5 0 0 1 .5.5V1h8V.5a.5.5 0 0 1 1 0V1h1a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V3a2 2 0 0 1 2-2h1V.5a.5.5 0 0 1 .5-.5zM2 2a1 1 0 0 0-1 1v11a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V3a1 1 0 0 0-1-1H2z"/>
                                    <path d="M2.5 4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5H3a.5.5 0 0 1-.5-.5V4zM8 8a.5.5 0 0 1 .5.5V10H10a.5.5 0 0 1 0 1H8.5v1.5a.5.5 0 0 1-1 0V11H6a.5.5 0 0 1 0-1h1.5V8.5A.5.5 0 0 1 8 8z"/>
                                    </svg>
                            </x-input-field-required>
                            @error('fecha_nacimiento')
                            <p class="text-sm text-red-600 dark:text-red-500">
                                {{ $message }}.
                            </p>
                            @enderror
                        </div>       
                    </div>
                        
                    <div class="grid gap-4 mb-4 sm:grid-cols-1 md:grid-cols-3">
                   
                            <div>
                                <label for="rut" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Rut
                                    <small class="italic text-gray-500">(ej: 12345678-9)</small>
                                </label>
                                <div class="relative">
                                    <div class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5 text-gray-500 dark:text-gray-400">
                                            <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
                                        </svg>

                                    </div>
                                    <input type="text" wire:model.defer="rut" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-sky-500 focus:border-sky-500 block w-full pl-10 p-2.5  dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-sky-500 dark:focus:border-sky-500 uppercase" placeholder="">
                                </div>
                                @error('rut')
                                <p class="mt-2 text-xs text-red-600 dark:text-red-500">
                                    {{ $message }}
                                </p>
                                @enderror
                            </div>
                            <div>
                                <label  class="block mb-2 text-sm font-medium text-gray-400 dark:text-white">Correo</label>
                                <div class="relative">
                                    <div class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                        <svg aria-hidden="true" class="w-5 h-5 text-gray-400 dark:text-gray-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z">
                                            </path>
                                            <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"></path>
                                        </svg>
                                    </div>
                                    <input type="email" wire:model.defer="correo" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-sky-500 focus:border-sky-500 block w-full pl-10 p-2.5  dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-sky-500 dark:focus:border-sky-500 uppercase" placeholder="">
                                </div>
                                @error('email')
                                <p class="mt-2 text-xs text-red-600 dark:text-red-500">
                                    {{ $message }}
                                </p>
                                @enderror
                            </div>
                            <div>
                                <label  class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                                    Teléfono
                                    <small class="italic text-gray-400">ej:(912345678)</small>
                                </label>
                                <div class="relative">
                                    <div class="absolute inset-y-0 left-0 flex items-center pl-2 mr-6 rounded-l-lg pointer-events-none bg-sky-200">
                                        <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-gray-500 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                                            <path stroke-linecap="round" stroke-linejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                        </svg>
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1" stroke="currentColor" class="w-3 h-3">
                                            <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />

                                        </svg>
                                        <h5 class="pr-2 text-xs text-gray-500">56</h5>
                                    </div>

                                    <small class="absolute inset-y-0 right-0 flex pt-2 pr-6 italic text-gray-400 right">{{ strlen($telefono) }}
                                        /9</small>
                                    <input wire:model="telefono" type="text" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-sky-500 focus:border-sky-500 block w-full pl-16 p-2.5  dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-sky-500 dark:focus:border-sky-500 uppercase">
                                </div>

                                @error('telefono')
                                <p class="mt-2 text-xs text-red-600 dark:text-red-500">
                                    {{ $message }}
                                </p>
                                @enderror
                            </div>
                      
                    </div>
                   
                    <div class="grid gap-4 mb-4 sm:grid-cols-1">
                        <div class="relative">
                            <div>
                                <label  class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                                    Región + Comuna
                                </label>
                                <div class="flex">
                                    <button id="dropdown-button-2" data-dropdown-toggle="dropdown-search-city" class="flex-shrink-0 z-10 inline-flex items-center py-2.5 px-4 text-sm font-medium text-center text-gray-500 bg-gray-100 border border-gray-300 rounded-l-lg hover:bg-gray-200 focus:ring-4 focus:outline-none focus:ring-gray-100 dark:bg-gray-700 dark:hover:bg-gray-600 dark:focus:ring-gray-700 dark:text-white dark:border-gray-600" type="button">
                                        <img src="{{ asset('icons/flags/area-with-pins.png') }}" alt="Flag chile" class="w-4 h-4 mr-2">

                                        {{ $regiones[0]->name }} <svg aria-hidden="true" class="w-4 h-4 ml-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                            <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd"></path>
                                        </svg>
                                    </button>
                                    <div id="dropdown-search-city" class="z-10 hidden bg-white divide-y divide-gray-100 rounded-lg shadow w-44 dark:bg-gray-700" wire:model.defer="regiones">
                                        <ul class="py-2 text-sm text-gray-700 dark:text-gray-200" aria-labelledby="dropdown-button-2">
                                            @foreach ($regiones as $region)
                                            <li>
                                                <button type="button" {{--  wire:click="$set('selectedRegion', {{ $region->id }})" --}} class="inline-flex w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-600 dark:hover:text-white" role="menuitem">
                                                    <div class="inline-flex items-center">
                                                        {{ $region->name }}
                                                    </div>
                                                </button>
                                            </li>
                                            @endforeach
                                        </ul>
                                    </div>


                                    <label class="sr-only">Seleccione comuna</label>
                                    <select wire:model="comuna" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-r-lg border-l-gray-100 dark:border-l-gray-700 border-l-2 focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500">
                                        <option selected readonly> -- seleccione comuna --</option>
                                        @foreach ($comunas as $comuna)
                                        <option class="uppercase" value="{{ $comuna->id }}">
                                            {{ $comuna->name }}
                                        </option>
                                        @endforeach
                                    </select>
                                </div>
                            </div>
                            @error('comuna')
                            <p class="mt-2 text-xs text-red-600 dark:text-red-500">
                                {{ $message }}
                            </p>
                            @enderror
                        </div>
                    </div>

                    <div class="grid gap-4 mb-4 sm:grid-cols-2">
                        <div>
                            <label  class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Calle /
                                Pasaje / Avenida</label>
                            <div class="relative">
                                <div class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                    <img src="{{ asset('icons/location-pin.png') }}" class="w-5 h-5" alt="">
                                </div>
                                <input type="text" name="calle" wire:model.defer="calle" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-sky-500 focus:border-sky-500 block w-full pl-10 p-2.5  dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-sky-500 dark:focus:border-sky-500 uppercase" placeholder="">

                            </div>
                            @error('calle')
                            <p class="mt-2 text-xs text-red-600 dark:text-red-500">
                                {{ $message }}
                            </p>
                            @enderror
                        </div>
                        <div>
                            <label  class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Número</label>
                            <div class="relative">
                                <div class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
                                        <path stroke-linecap="round" stroke-linejoin="round" d="M5.25 8.25h15m-16.5 7.5h15m-1.8-13.5l-3.9 19.5m-2.1-19.5l-3.9 19.5" />
                                    </svg>

                                </div>
                                <input type="number" name="numero" wire:model.defer="numero" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-sky-500 focus:border-sky-500 block w-full pl-10 p-2.5  dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-sky-500 dark:focus:border-sky-500 uppercase" placeholder="">
                            </div>
                            @error('numero')
                            <p class="mt-2 text-xs text-red-600 dark:text-red-500">
                                {{ $message }}
                            </p>
                            @enderror
                        </div>

                    </div>

                    <div class="grid gap-4 mb-4 sm:grid-cols-1">
                        <div>
                            <label  class="block mb-1 ml-2 text-sm font-medium text-gray-900 dark:text-white">Detalles de Dirección</label>
                            <div class="relative">
                                <div class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
                                        <path stroke-linecap="round" stroke-linejoin="round" d="M9 6.75V15m6-6v8.25m.503 3.498l4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 00-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0z" />
                                    </svg>

                                </div>
                                <input type="detalle_direccion" wire:model.defer="detalle_direccion" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-sky-500 focus:border-sky-500 block w-full pl-10 p-2.5  dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-sky-500 dark:focus:border-sky-500 uppercase" placeholder="">
                            </div>
                            @error('detalle_direccion')
                            <p class="mt-2 text-xs text-red-600 dark:text-red-500">
                                {{ $message }}
                            </p>
                            @enderror
                        </div>
                    </div>
                    
                    <div class="flex items-center pt-5 space-x-4 border-t-2">


                        <button type="submit" wire:loading.remove wire:target="save" class="inline-flex items-center px-2 py-1 text-sm font-medium text-center text-white rounded-lg bg-sky-700 hover:bg-sky-800 focus:ring-4 focus:outline-none focus:ring-sky-300 dark:bg-sky-600 dark:hover:bg-sky-700 dark:focus:ring-sky-800">
                            <svg class="w-6 h-6 mr-1 -ml-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                <path fill-rule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clip-rule="evenodd"></path>
                            </svg>
                            Guardar Nuevo Cliente
                        </button>

                        <div wire:loading wire:target="['save','avatar']">

                            <button disabled type="button" class="inline-flex items-center px-2 py-1 mr-2 text-sm font-medium text-center text-white rounded-lg bg-sky-700 hover:bg-sky-800 focus:ring-4 focus:ring-sky-300 dark:bg-sky-600 dark:hover:bg-sky-700 dark:focus:ring-sky-800">
                                <svg aria-hidden="true" role="status" class="inline w-4 h-4 mr-3 text-white animate-spin" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="#E5E7EB" />
                                    <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentColor" />
                                </svg>
                                Cargando...
                            </button>
                        </div>

                    </div>
                
                </form>

            </div>
        </div>
    </div>
</div>