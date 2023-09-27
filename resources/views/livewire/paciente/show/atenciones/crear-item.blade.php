<div>
    <div class="flex items-center pl-2 space-x-2">
        <x-button-add wire:click="$set('openItemCreate','')" class="gap-1" innerText="Nueva Sesión" />
    </div>
    <div class="{{ $openItemCreate }} bg-gray-600 bg-opacity-50 overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 z-50 justify-center w-full md:inset-0 h-modal md:h-full flex">
        <div class="relative w-full h-full p-4 md:max-w-5xl md:h-auto">

            <!-- Modal content -->
            <div class="relative p-4 bg-white rounded-lg shadow dark:bg-gray-800 sm:p-5">
                <!-- Modal header -->
                <div class="flex items-center justify-between pb-4 mb-4 border-b rounded-t sm:mb-5 dark:border-gray-600">
                <div>
                    <h3 class="text-base text-gray-700 dark:text-white">
                    @if ($estado == 0)
                        Creando Sesión
                    @else
                         Creando Tratamiento y primera sesión
                    @endif
                    </h3>
                    <span class="font-semibold text-lg">{{ $paciente->name }} {{ $paciente->last_name}}</span>
                    {{ $estado }}
                </div>
                <x-button-modal-close wire:click="$set('openItemCreate','hidden')" />
                </div>
                <form wire:submit.prevent="save">

                    <div class="grid gap-4 mb-4 sm:grid-cols-3">

                        <div>
                            <label class="block text-sm font-medium text-gray-900 dark:text-white"> Kine</label>
                            <div class="relative">
                                <div class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
                                        <path stroke-linecap="round" stroke-linejoin="round" d="M19 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM4 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 0110.374 21c-2.331 0-4.512-.645-6.374-1.766z" />
                                    </svg>


                                </div>
                                <select wire:model.defer="kine" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm pl-10 pr-4 rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500">
                                    <option>
                                        ---selecciona kine---
                                    </option>
                                    @foreach ($kines as $kine)
                                    <option value="{{ $kine->id }}">
                                        {!! $kine->name . '&nbsp;' .$kine->last_name !!}
                                    </option>
                                    @endforeach
                                </select>
                            </div>
                            @error('kine')
                            <p class="mt-2 text-sm text-red-600 dark:text-red-500">
                                {{ $message }}.
                            </p>
                            @enderror
                        </div>

                        <div>
                            <label class="block text-sm font-medium text-gray-900 dark:text-white"> Tipo de Atención</label>
                            <div class="relative">
                                <div class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
                                        <path stroke-linecap="round" stroke-linejoin="round" d="M19 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM4 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 0110.374 21c-2.331 0-4.512-.645-6.374-1.766z" />
                                    </svg>


                                </div>
                                <select wire:model.defer="tipo_atencion" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm pl-10 pr-4 rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500">
                                    <option>
                                        ---selecciona---
                                    </option>
                                    @foreach ($tipo_atenciones as $tipo_atencion)
                                    <option class="uppercase" value="{{ $tipo_atencion->id }}">
                                        {{ $tipo_atencion->name }}
                                    </option>
                                    @endforeach
                                </select>
                            </div>
                            @error('tipo_atencion')
                            <p class="mt-2 text-sm text-red-600 dark:text-red-500">
                                {{ $message }}.
                            </p>
                            @enderror
                        </div>
                       
                        <div>
                            <label class="block text-sm font-medium text-gray-900 dark:text-white"> Estado</label>
                            <div class="relative">
                                <div class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">

                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="0.5" stroke="currentColor" class="w-6 h-6">
                                        <path d="M14.5 3a.5.5 0 0 1 .5.5v9a.5.5 0 0 1-.5.5h-13a.5.5 0 0 1-.5-.5v-9a.5.5 0 0 1 .5-.5h13zm-13-1A1.5 1.5 0 0 0 0 3.5v9A1.5 1.5 0 0 0 1.5 14h13a1.5 1.5 0 0 0 1.5-1.5v-9A1.5 1.5 0 0 0 14.5 2h-13z" />
                                        <path d="M7 5.5a.5.5 0 0 1 .5-.5h5a.5.5 0 0 1 0 1h-5a.5.5 0 0 1-.5-.5zm-1.496-.854a.5.5 0 0 1 0 .708l-1.5 1.5a.5.5 0 0 1-.708 0l-.5-.5a.5.5 0 1 1 .708-.708l.146.147 1.146-1.147a.5.5 0 0 1 .708 0zM7 9.5a.5.5 0 0 1 .5-.5h5a.5.5 0 0 1 0 1h-5a.5.5 0 0 1-.5-.5zm-1.496-.854a.5.5 0 0 1 0 .708l-1.5 1.5a.5.5 0 0 1-.708 0l-.5-.5a.5.5 0 0 1 .708-.708l.146.147 1.146-1.147a.5.5 0 0 1 .708 0z" />
                                    </svg>

                                </div>
                                <select wire:model.defer="status" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm pl-10 pr-4 rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500">
                                    <option>
                                        ---selecciona---
                                    </option>
                                    <option selected value="0">
                                        Pendiente
                                    </option>
                                    <option value="1">
                                        Atendida
                                    </option>
                                    <option value="1">
                                        Cancelada
                                    </option>
                                    <option value="1">
                                        Reagendado
                                    </option>

                                </select>
                            </div>
                            @error('status')
                            <p class="mt-2 text-sm text-red-600 dark:text-red-500">
                                {{ $message }}.
                            </p>
                            @enderror
                        </div>

                        <div>
                            <x-input-field label="Fecha de la atención" name="fecha_atencion" type="date" wire:model.defer="fecha_atencion" placeholder="">

                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-hospital" viewBox="0 0 16 16">
                                    <path d="M10.854 7.146a.5.5 0 0 1 0 .708l-3 3a.5.5 0 0 1-.708 0l-1.5-1.5a.5.5 0 1 1 .708-.708L7.5 9.793l2.646-2.647a.5.5 0 0 1 .708 0z" />
                                    <path d="M3.5 0a.5.5 0 0 1 .5.5V1h8V.5a.5.5 0 0 1 1 0V1h1a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V3a2 2 0 0 1 2-2h1V.5a.5.5 0 0 1 .5-.5zM1 4v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V4H1z" />
                                </svg>

                            </x-input-field>
                            @error('fecha_atencion')
                            <p class="text-sm text-red-600 dark:text-red-500">
                                {{ $message }}.
                            </p>
                            @enderror
                        </div>
                        
                        <div>
                            <x-input-field label="Valor de la sesión" type="number" wire:model.defer="valor" placeholder="">
                                <svg aria-hidden="true" class="w-5 h-5 text-gray-500 dark:text-gray-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z">
                                    </path>
                                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clip-rule="evenodd"></path>
                                </svg>
                            </x-input-field>
                            @error('valor')
                            <p class="text-sm text-red-600 dark:text-red-500">
                                {{ $message }}.
                            </p>
                            @enderror
                        </div>

                        <div>
                            <label class="block text-sm font-medium text-gray-900 dark:text-white"> Número de Sesión</label>
                            <div class="relative">
                                <div class="absolute inset-y-0 left-0 flex items-center pb-2 pl-3 pointer-events-none">

                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="0.5" stroke="currentColor" class="w-6 h-6">
                                        <path d="M14.5 3a.5.5 0 0 1 .5.5v9a.5.5 0 0 1-.5.5h-13a.5.5 0 0 1-.5-.5v-9a.5.5 0 0 1 .5-.5h13zm-13-1A1.5 1.5 0 0 0 0 3.5v9A1.5 1.5 0 0 0 1.5 14h13a1.5 1.5 0 0 0 1.5-1.5v-9A1.5 1.5 0 0 0 14.5 2h-13z" />
                                        <path d="M7 5.5a.5.5 0 0 1 .5-.5h5a.5.5 0 0 1 0 1h-5a.5.5 0 0 1-.5-.5zm-1.496-.854a.5.5 0 0 1 0 .708l-1.5 1.5a.5.5 0 0 1-.708 0l-.5-.5a.5.5 0 1 1 .708-.708l.146.147 1.146-1.147a.5.5 0 0 1 .708 0zM7 9.5a.5.5 0 0 1 .5-.5h5a.5.5 0 0 1 0 1h-5a.5.5 0 0 1-.5-.5zm-1.496-.854a.5.5 0 0 1 0 .708l-1.5 1.5a.5.5 0 0 1-.708 0l-.5-.5a.5.5 0 0 1 .708-.708l.146.147 1.146-1.147a.5.5 0 0 1 .708 0z" />
                                    </svg>

                                </div>
                                <select wire:model.defer="numero_sesion" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm pl-10 pr-4 rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500">
                                    <option>--</option>
                                    @for ($i = 1; $i <= 100; $i++) <option class="uppercase" value="{{$i}}">
                                        {{ $i }}
                                        </option>
                                        @endfor
                                </select>
                            </div>
                            @error('numero_sesion')
                            <p class="mt-2 text-sm text-red-600 dark:text-red-500">
                                {{ $message }}.
                            </p>
                            @enderror
                            @if($errorNumSesion)
                            <p class="mt-2 text-sm text-red-600 dark:text-red-500">
                                Número de sesión duplicado.
                            </p>
                            @endif
                        </div>

                        @if ($estado == 1)
                        <div>
                            <label  class="block text-sm font-medium text-gray-900 dark:text-white">Forma de Pago</label>
                            <div class="relative">
                                <div class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4">
                                        <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
                                    </svg>
                                </div>
                                <select wire:model.defer="forma_de_pago" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm pl-10 pr-4 rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500">
                                    <option selected>-seleccione-</option>
                                    <option value="0">Por sesión</option>
                                    <option value="1">Por tratamiento</option>
                                    <option value="2">Mensual por sesiones</option>
                                    <option value="3">50% y 50%</option>
                                    <option value="4">Tarjeta de Crédito</option>
                                    <option value="5">Abonos parciales</option>
                                </select>
                            </div>
                            @error('forma_de_pago')
                            <p class="mt-2 text-sm text-red-600 dark:text-red-500">
                                {{ $message }}.
                            </p>
                            @enderror
                        </div>

                        <div>
                            <x-input-field label="Profesional que deriva" type="text" obligatorio="Obligatorio" wire:model.defer="profesional_derivacion" placeholder="Ingrese nombre">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-person-fill-down" viewBox="0 0 16 16">
                                    <path d="M12.5 9a3.5 3.5 0 1 1 0 7 3.5 3.5 0 0 1 0-7Zm.354 5.854 1.5-1.5a.5.5 0 0 0-.708-.708l-.646.647V10.5a.5.5 0 0 0-1 0v2.793l-.646-.647a.5.5 0 0 0-.708.708l1.5 1.5a.5.5 0 0 0 .708 0ZM11 5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                                    <path d="M2 13c0 1 1 1 1 1h5.256A4.493 4.493 0 0 1 8 12.5a4.49 4.49 0 0 1 1.544-3.393C9.077 9.038 8.564 9 8 9c-5 0-6 3-6 4Z" />
                                </svg>
                            </x-input-field>
                            @error('profesional_derivacion')
                            <p class="text-sm text-red-600 dark:text-red-500">
                                {{ $message }}.
                            </p>
                            @enderror
                        </div>

                        <div>
                            <x-input-field label="Lugar desde donde es derivado" type="text" wire:model.defer="lugar_derivacion" placeholder="Ingrese nombre del lugar">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-hospital" viewBox="0 0 16 16">
                                    <path d="M8.5 5.034v1.1l.953-.55.5.867L9 7l.953.55-.5.866-.953-.55v1.1h-1v-1.1l-.953.55-.5-.866L7 7l-.953-.55.5-.866.953.55v-1.1h1ZM13.25 9a.25.25 0 0 0-.25.25v.5c0 .138.112.25.25.25h.5a.25.25 0 0 0 .25-.25v-.5a.25.25 0 0 0-.25-.25h-.5ZM13 11.25a.25.25 0 0 1 .25-.25h.5a.25.25 0 0 1 .25.25v.5a.25.25 0 0 1-.25.25h-.5a.25.25 0 0 1-.25-.25v-.5Zm.25 1.75a.25.25 0 0 0-.25.25v.5c0 .138.112.25.25.25h.5a.25.25 0 0 0 .25-.25v-.5a.25.25 0 0 0-.25-.25h-.5Zm-11-4a.25.25 0 0 0-.25.25v.5c0 .138.112.25.25.25h.5A.25.25 0 0 0 3 9.75v-.5A.25.25 0 0 0 2.75 9h-.5Zm0 2a.25.25 0 0 0-.25.25v.5c0 .138.112.25.25.25h.5a.25.25 0 0 0 .25-.25v-.5a.25.25 0 0 0-.25-.25h-.5ZM2 13.25a.25.25 0 0 1 .25-.25h.5a.25.25 0 0 1 .25.25v.5a.25.25 0 0 1-.25.25h-.5a.25.25 0 0 1-.25-.25v-.5Z" />
                                    <path d="M5 1a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v1a1 1 0 0 1 1 1v4h3a1 1 0 0 1 1 1v7a1 1 0 0 1-1 1H1a1 1 0 0 1-1-1V8a1 1 0 0 1 1-1h3V3a1 1 0 0 1 1-1V1Zm2 14h2v-3H7v3Zm3 0h1V3H5v12h1v-3a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v3Zm0-14H6v1h4V1Zm2 7v7h3V8h-3Zm-8 7V8H1v7h3Z" />
                                </svg>

                            </x-input-field>
                            @error('lugar_derivacion')
                            <p class="text-sm text-red-600 dark:text-red-500">
                                {{ $message }}.
                            </p>
                            @enderror
                        </div>
                        @endif
                    </div>

                    <div class="space-y-4 sm:col-span- sm:space-y-6">
                    @if ($estado == 1)
                         <div>
                            <label  class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Si tiene
                                documentos
                                ingreselos acá</label>
                            <div class="flex items-center justify-center w-full">
                                <label  class="flex flex-col items-center justify-center w-full border-2 border-gray-300 border-dashed rounded-lg cursor-pointer h-36 bg-gray-50 dark:hover:bg-bray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500 dark:hover:bg-gray-600">
                                    <div class="flex flex-col items-center justify-center pt-5 pb-6">
                                        <svg aria-hidden="true" class="w-10 h-10 mb-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12">
                                            </path>
                                        </svg>
                                        <p class="mb-2 text-sm text-gray-500 dark:text-gray-400">
                                            <span class="font-semibold">Click para subir</span>
                                        </p>
                                        <p class="text-xs text-gray-500 dark:text-gray-400">SVG, PNG, JPG o GIF
                                            (MAX. 1MB)</p>
                                    </div>
                                    <input id="dropzone-file" wire:model="documentos" type="file" class="hidden" multiple>
                                </label>
                            </div>
                        </div>
                        <div role="status" wire:loading wire:target="documentos">
                            <svg aria-hidden="true" class="w-8 h-8 mr-2 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor" />
                                <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill" />
                            </svg>
                            <span class="sr-only">Loading...</span>
                        </div>
                        <span class="block mb-2 text-sm font-medium text-gray-900 dark:text-white"></span>
                        @if (count($documentos) > 0)
                        Imagenes o
                        Documentos
                        Previsualizacion:
                        <div class="grid grid-cols-4 gap-4 mb-4">
                            @foreach ($documentos as $documento)
                            <div class="relative p-2 bg-gray-100 rounded-lg sm:w-36 sm:h-36 dark:bg-gray-700">
                                @if ($documento->extension() !== 'pdf')
                                <img src="{{ $documento->temporaryUrl() }}" alt="imac image">
                                @else
                                <img class="w-full h-auto" src="{{ asset('icons/pdf.png') }}" alt="imac image">
                                <label class="absolute ml-5" >{{ $documento->getClientOriginalName() }}</label>
                                @endif
                                <button type="button" class="absolute text-red-600 dark:text-red-500 hover:text-red-500 dark:hover:text-red-400 bottom-1 left-1">
                                    <svg aria-hidden="true" class="w-5 h-5" fill="currentColor" viewbox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                        <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" />
                                    </svg>
                                    <span class="sr-only">Remove image</span>
                                </button>
                            </div>
                            @endforeach
                        </div>
                        @endif
                    @endif
                       
                    <div>
                            <label  class="block text-sm font-medium text-gray-900 dark:text-white">Comentario o
                                detalles</label>
                            <textarea wire:model.defer="mensaje" rows="4" class="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="Si tiene algún comentario, ingreselo acá...">
                                    </textarea>
                    </div>

                    </div>

                    <hr>
                    <div class="mt-5">

                          <x-button-update 
                            wire:loading.remove 
                            wire:click="save" 
                            wire:target="save" 
                            innerText="Guardar" />
                            

                        <x-button-loading 
                            wire:loading 
                            wire:target="save" 
                            innerText="Guardando" />
                    </div>
                </form>
            </div>
        </div>
    </div>

</div>