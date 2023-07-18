<div>
    <div>
        <button wire:click="$set('opendetalles', '')" class="flex items-center px-2 py-1 text-sm font-medium text-center text-gray-900 bg-white border border-gray-200 rounded-lg focus:outline-none hover:bg-gray-100 hover:text-primary-700 focus:z-10 focus:ring-4 focus:ring-gray-200 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700" type="button">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-4 h-4 mr-2 -ml-0.5">
                <path d="M12 15a3 3 0 100-6 3 3 0 000 6z"></path>
                <path fill-rule="evenodd" clip-rule="evenodd" d="M1.323 11.447C2.811 6.976 7.028 3.75 12.001 3.75c4.97 0 9.185 3.223 10.675 7.69.12.362.12.752 0 1.113-1.487 4.471-5.705 7.697-10.677 7.697-4.97 0-9.186-3.223-10.675-7.69a1.762 1.762 0 010-1.113zM17.25 12a5.25 5.25 0 11-10.5 0 5.25 5.25 0 0110.5 0z">
                </path>
            </svg>
            Detalles
        </button>

    </div>
    <!-- Main Modal -->
    <div class="{{ $opendetalles }}  bg-gray-600 bg-opacity-50 overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 z-50 justify-center w-full md:inset-0 h-modal md:h-full flex">
        <div class="relative w-full h-full p-4 max-full md:h-auto">
            <!-- Modal content -->
            <div class="relative p-4 bg-white rounded-lg shadow dark:bg-gray-800 sm:p-5">
                <!-- Modal header -->
                <div class="flex items-center justify-between pb-4 mb-4 border-b rounded-t sm:mb-5 dark:border-gray-600">
                    <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
                        Detalles / Atenciones
                    </h3>
                    <button wire:click="$set('opendetalles','hidden')" type="button" class="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center dark:hover:bg-gray-600 dark:hover:text-white">
                        <svg aria-hidden="true" class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                            <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path>
                        </svg>
                        <span class="sr-only">Close modal</span>
                    </button>
                </div>

                <!-- Modal Body -->
                <div class="flex flex-row mb-5">
                    <div class="p-2 shadow-xl basis-1/4 rounded-xl">
                  
                        <div class="mt-2 uppercase">{{ $paciente->name . ' ' . $paciente->last_name }}</div>
                        <div class="font-medium uppercase">{{ $paciente->email }}</div>
                        <div class="text-sm text-gray-500 dark:text-gray-400 uppercase">{{ $paciente->rut }}</div>
                        <div class="text-sm text-gray-500 dark:text-gray-400 uppercase">{{ $paciente->phone }}</div>

                        <hr class="mt-4">

                        

                        <hr>
                        <h4 class="mt-4 mb-2 text-lg font-bold text-gray-900 dark:text-white">Datos Generales</h4>
                        @livewire('paciente.modal-editar',['paciente' => $paciente])
                        <hr>
                        <div class="grid grid-cols-1">
                            @foreach ($answers as $answer)
                            <div class="z-0 w-full my-2 group">
                                <label for="message" class="block text-xs font-medium text-gray-400 dark:text-white">{{ $answer->question->name }}</label>
                                <div class="text-base text-gray-800">
                                    {{ $answer->name ?? '--' }}
                                </div>
                            </div>
                            @endforeach
                        </div>

                    </div>
                    <div class="ml-2 border border-gray-300 shadow-lg grow rounded-xl">
                        <div class="mb-4 border-b border-gray-200 dark:border-gray-700">
                            <ul class="flex flex-wrap -mb-px text-sm font-medium text-center" id="myTab" data-tabs-toggle="#myTabContent{{$paciente->id}}" role="tablist">
                                <li class="mr-2" role="presentation">
                                    <button class="inline-block p-4 text-blue-600 border-b-2 border-blue-600 rounded-t-lg hover:text-blue-600 dark:text-blue-500 dark:hover:text-blue-500 dark:border-blue-500" id="atenciones-tab" data-tabs-target="#atenciones{{$paciente->id}}" type="button" role="tab" aria-controls="atenciones" aria-selected="true">Atenciones</button>
                                </li>
                                <li class="mr-2" role="presentation">
                                    <button class="inline-block p-4 text-gray-500 border-b-2 border-gray-100 rounded-t-lg dark:border-transparent hover:text-gray-600 dark:text-gray-400 hover:border-gray-300 dark:border-gray-700 dark:hover:text-gray-300" id="apoderados-tab" data-tabs-target="#apoderados{{$paciente->id}}" type="button" role="tab" aria-controls="apoderados" aria-selected="false">Apoderados</button>
                                </li>
                            </ul>
                        </div>
                        <div id="myTabContent{{$paciente->id}}">
                            <div class="p-4 rounded-lg bg-gray-50 dark:bg-gray-800" id="atenciones{{$paciente->id}}" role="tabpanel" aria-labelledby="atenciones-tab">
                                @livewire('paciente.show.atenciones.atenciones-listado', ['paciente' => $paciente])
                            </div>
                            <div class="hidden p-4 rounded-lg bg-gray-50 dark:bg-gray-800" id="apoderados{{$paciente->id}}" role="tabpanel" aria-labelledby="apoderados-tab">
                                @livewire('paciente.show.apoderado.apoderado-listado', ['paciente' => $paciente])
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>