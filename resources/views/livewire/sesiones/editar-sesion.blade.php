<div>
    <div class="flex items-center pl-2 space-x-2">
        <x-button-edit wire:click="$set('openItem','')" innerText="" />

        {{-- @if ($applyItem->status == 0 || $applyItem->status == 2 || $applyItem->status == 3)
        @endif --}}
        <x-button-delete wire:click="$set('openDelItem','')" innerText="" />
    </div>
    <div
        class="{{ $openItem }} bg-gray-600 bg-opacity-50 overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 z-50 justify-center w-full md:inset-0 h-modal md:h-full flex">
        <div class="relative w-full h-full p-4 md:max-w-3xl md:h-auto">

            <!-- Modal content -->
            <div class="relative p-4 bg-white rounded-lg shadow dark:bg-gray-800 sm:p-5">
                <!-- Modal header -->
                <div
                    class="flex items-center justify-between pb-4 mb-4 border-b rounded-t sm:mb-5 dark:border-gray-600">
                    <div>
                        <h3 class="text-lg font-semibold text-gray-700 dark:text-white">
                            Editando Sesión.
                        </h3>
                        <span>{{ $patient->name ?? '' }} {{ $patient->last_name ?? '' }}</span>
                    </div>
                    <x-button-modal-close wire:click="$set('openItem','hidden')" />
                </div>
                <form wire:submit.prevent="save">
                    <div class="grid gap-4 mb-4 sm:grid-cols-2">
                        <div>
                            <label class="block text-sm font-medium text-gray-900 dark:text-white"> Kine</label>
                            <div class="relative">
                                <div class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                                        stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
                                        <path stroke-linecap="round" stroke-linejoin="round"
                                            d="M19 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM4 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 0110.374 21c-2.331 0-4.512-.645-6.374-1.766z" />
                                    </svg>


                                </div>
                                <select wire:model.defer="selectedKine"
                                    class="bg-gray-50 border border-gray-300 text-gray-900 text-sm pl-10 pr-4 rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500">
                                    <option class="uppercase" value="{{ $applyItem->doctor->id ?? ''}}">
                                        {{ $applyItem->doctor->name ?? '' }} {{ $applyItem->doctor->last_name ?? '' }}
                                    </option>
                                    @foreach ($kines as $kine)
                                    <option class="uppercase" value="{{ $kine->id }}">
                                        {{ $kine->name }} {{ $kine->last_name }}
                                    </option>
                                    @endforeach
                                </select>
                            </div>
                            @error('selectedKine')
                            <p class="mt-2 text-sm text-red-600 dark:text-red-500">
                                {{ $message }}.
                            </p>
                            @enderror
                        </div>

                        <div>
                            <label class="block text-sm font-medium text-gray-900 dark:text-white"> Tipo de
                                Atención</label>
                            <div class="relative">
                                <div class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                                        stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
                                        <path stroke-linecap="round" stroke-linejoin="round"
                                            d="M19 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM4 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 0110.374 21c-2.331 0-4.512-.645-6.374-1.766z" />
                                    </svg>


                                </div>
                                <select wire:model.defer="selectedType"
                                    class="bg-gray-50 border border-gray-300 text-gray-900 text-sm pl-10 pr-4 rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500">

                                    @foreach ($types as $type)
                                    <option class="uppercase" value="{{ $type->id }}">
                                        {{ $type->name }}
                                    </option>
                                    @endforeach
                                </select>
                            </div>
                            @error('selectedType')
                            <p class="mt-2 text-sm text-red-600 dark:text-red-500">
                                {{ $message }}.
                            </p>
                            @enderror
                        </div>

                        <div>
                            <label class="block text-sm font-medium text-gray-900 dark:text-white"> Estado</label>
                            <div class="relative">
                                <div class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">

                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                                        stroke-width="0.5" stroke="currentColor" class="w-6 h-6">
                                        <path
                                            d="M14.5 3a.5.5 0 0 1 .5.5v9a.5.5 0 0 1-.5.5h-13a.5.5 0 0 1-.5-.5v-9a.5.5 0 0 1 .5-.5h13zm-13-1A1.5 1.5 0 0 0 0 3.5v9A1.5 1.5 0 0 0 1.5 14h13a1.5 1.5 0 0 0 1.5-1.5v-9A1.5 1.5 0 0 0 14.5 2h-13z" />
                                        <path
                                            d="M7 5.5a.5.5 0 0 1 .5-.5h5a.5.5 0 0 1 0 1h-5a.5.5 0 0 1-.5-.5zm-1.496-.854a.5.5 0 0 1 0 .708l-1.5 1.5a.5.5 0 0 1-.708 0l-.5-.5a.5.5 0 1 1 .708-.708l.146.147 1.146-1.147a.5.5 0 0 1 .708 0zM7 9.5a.5.5 0 0 1 .5-.5h5a.5.5 0 0 1 0 1h-5a.5.5 0 0 1-.5-.5zm-1.496-.854a.5.5 0 0 1 0 .708l-1.5 1.5a.5.5 0 0 1-.708 0l-.5-.5a.5.5 0 0 1 .708-.708l.146.147 1.146-1.147a.5.5 0 0 1 .708 0z" />
                                    </svg>

                                </div>
                                <select wire:model.defer="selectedStatus"
                                    class="bg-gray-50 border border-gray-300 text-gray-900 text-sm pl-10 pr-4 rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500">

                                    <option class="uppercase" value="0" @if ($applyItem->status === 0) selected @endif
                                        >
                                        Pendiente
                                    </option>
                                    <option class="uppercase" value="1" @if ($applyItem->status === 1) selected @endif>
                                        Atendida
                                    </option>
                                    <option class="uppercase" value="2" @if ($applyItem->status === 2) selected @endif>
                                        Cancelada
                                    </option>
                                    <option class="uppercase" value="3" @if ($applyItem->status === 3) selected @endif>
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
                            <x-input-field label="Fecha de la atención" name="fecha_atencion" type="date"
                                wire:model.defer="fecha_atencion" placeholder="" class="uppercase">

                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor"
                                    class="bi bi-hospital" viewBox="0 0 16 16">
                                    <path
                                        d="M10.854 7.146a.5.5 0 0 1 0 .708l-3 3a.5.5 0 0 1-.708 0l-1.5-1.5a.5.5 0 1 1 .708-.708L7.5 9.793l2.646-2.647a.5.5 0 0 1 .708 0z" />
                                    <path
                                        d="M3.5 0a.5.5 0 0 1 .5.5V1h8V.5a.5.5 0 0 1 1 0V1h1a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V3a2 2 0 0 1 2-2h1V.5a.5.5 0 0 1 .5-.5zM1 4v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V4H1z" />
                                </svg>

                            </x-input-field>
                            @error('fecha_atencion')
                            <p class="text-sm text-red-600 dark:text-red-500">
                                {{ $message }}.
                            </p>
                            @enderror
                        </div>

                        <div>
                            <x-input-field-required label="Valor de la sesión" type="float" wire:model.defer="price"
                                placeholder="">
                                <svg aria-hidden="true" class="w-5 h-5 text-gray-500 dark:text-gray-400"
                                    fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                    <path
                                        d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z">
                                    </path>
                                    <path fill-rule="evenodd"
                                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z"
                                        clip-rule="evenodd"></path>
                                </svg>
                            </x-input-field-required>
                            @error('price')
                            <p class="text-sm text-red-600 dark:text-red-500">
                                {{ $message }}.
                            </p>
                            @enderror
                        </div>

                        <div>
                            <x-input-field-required label="Número de Sesión" type="number"
                                wire:model.defer="numero_sesion" placeholder="">
                            </x-input-field-required>
                        </div>

                    </div>
                    <div>
                        <x-input-field-required label="Observaciones" type="text" wire:model.defer="comments"
                            placeholder="Observaciones">
                        </x-input-field-required>
                        @error('comments')
                        <p class="text-sm text-red-600 dark:text-red-500">
                            {{ $message }}.
                        </p>
                        @enderror
                    </div>

                    <hr>
                    <div class="mt-5">

                        <x-button-update wire:loading.remove wire:click="save" wire:target="save"
                            innerText="Actualizar" />


                        <x-button-loading wire:loading wire:target="save" innerText="Actualizando" />
                    </div>
                </form>
            </div>
        </div>
    </div>

    <!-- Modal Eliminar -->
    <div
        class="{{ $openDelItem }} bg-gray-600 bg-opacity-50 overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 z-50 justify-center items-center w-full md:inset-0 h-modal md:h-full flex">
        <div class="relative w-full h-full max-w-2xl p-4 md:h-auto">
            <div class="relative bg-white rounded-lg shadow dark:bg-gray-700">
                <button type="button" wire:click="$set('openDelItem','hidden')"
                    class="absolute top-3 right-2.5 text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center dark:hover:bg-gray-800 dark:hover:text-white">
                    <svg aria-hidden="true" class="w-5 h-5" fill="currentColor" viewbox="0 0 20 20"
                        xmlns="http://www.w3.org/2000/svg">
                        <path fill-rule="evenodd"
                            d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                            clip-rule="evenodd" />
                    </svg>
                    <span class="sr-only">Close modal</span>
                </button>
                <div class="p-6 text-center">
                    <svg aria-hidden="true" class="mx-auto mb-4 text-gray-400 w-14 h-14 dark:text-gray-200" fill="none"
                        stroke="currentColor" viewbox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <h3 class="mb-5 text-lg font-normal text-gray-500 dark:text-gray-400">Seguro que desea eliminar al
                        el registro?</h3>
                    <button type="button" wire:click="delete"
                        class="text-white bg-red-600 hover:bg-red-800 focus:ring-4 focus:outline-none focus:ring-red-300 dark:focus:ring-red-800 font-medium rounded-lg text-sm inline-flex items-center px-5 py-2.5 text-center mr-2">Si,
                        Estoy Seguro</button>
                    <button wire:click="$set('openDelItem','hidden')" type="button"
                        class="text-gray-500 bg-white hover:bg-gray-100 focus:ring-4 focus:outline-none focus:ring-gray-200 rounded-lg border border-gray-200 text-sm font-medium px-5 py-2.5 hover:text-gray-900 focus:z-10 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-500 dark:hover:text-white dark:hover:bg-gray-600 dark:focus:ring-gray-600">No,
                        cancelar</button>
                </div>
            </div>
        </div>
    </div>
</div>