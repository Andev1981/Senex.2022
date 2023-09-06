<div>

    <!-- Main Modal -->
    <div class="bg-gray-600 bg-opacity-50 overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 z-50 justify-center w-full md:inset-0 h-modal md:h-full flex">
        <div class="relative w-full h-full p-4 max-full md:h-auto">
            <!-- Modal content -->
            <div class="relative p-4 bg-white rounded-lg shadow dark:bg-gray-800 sm:p-5">
                <!-- Modal header -->
                <div class="flex items-center justify-between pb-4 mb-4 border-b rounded-t sm:mb-5 dark:border-gray-600">
                    <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
                        Detalles / Tratamientos
                    </h3>
                    <a href="{{ route('pacientes') }}" type="button" class="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center dark:hover:bg-gray-600 dark:hover:text-white">
                            <svg aria-hidden="true" class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path>
                            </svg>
                            <span class="sr-only">Close</span>
                        </a>
                </div>

                <!-- Modal Body -->
                <div class="flex flex-row mb-5">
                    <div class="p-2 shadow-xl basis-1/4 rounded-xl">

                        <div class="mt-2 uppercase">{{ $paciente->name ?? '' . ' ' . $paciente->last_name ?? '' }}</div>
                        <div class="font-medium uppercase">{{ $paciente->email ?? '' }}</div>
                        <div class="text-sm text-gray-500 uppercase dark:text-gray-400">{{ $paciente->rut ?? '' }}</div>
                        <div class="text-sm text-gray-500 uppercase dark:text-gray-400">{{ $paciente->phone ?? '' }}</div>

                        <hr class="mt-4">



                        <hr>
                        <h4 class="mt-4 mb-2 text-lg font-bold text-gray-900 dark:text-white">Datos Generales</h4>
                        @livewire('paciente.modal-editar',['paciente' => $paciente])
                        <hr>
                        <div class="grid grid-cols-1">
                            @foreach ($answers as $answer)
                            <div class="z-0 w-full my-2 group">
                                <label class="block text-xs font-medium text-gray-400 dark:text-white">{{ $answer->question->name  ?? '' }}</label>
                                <div class="text-base text-gray-800">
                                    {{ $answer->name ?? '--' }}
                                </div>
                            </div>
                            @endforeach
                        </div>

                    </div>
                    <div class="ml-2 border border-gray-300 shadow-lg grow rounded-xl">
                        <div class="mb-4 border-b border-gray-200 dark:border-gray-700">
                            <ul class="flex flex-wrap -mb-px text-sm font-medium text-center" id="myTab" data-tabs-toggle="#myTabContent{{$paciente->id ?? ''}}" role="tablist">
                                <li class="mr-2" role="presentation">
                                    <button class="{{$cssTratamientos}}" id="atenciones-tab" data-tabs-target="#atenciones{{$paciente->id}}" wire:click="setTab(1)" type="button" role="tab" aria-controls="atenciones" aria-selected="true">Tratamientos</button>
                                </li>
                                <li class="mr-2" role="presentation">
                                    <button class="{{$cssApoderados}}" id="apoderados-tab" data-tabs-target="#apoderados{{$paciente->id}}" wire:click="setTab(2)" type="button" role="tab" aria-controls="apoderados" aria-selected="false">Apoderados</button>
                                </li>
                            </ul>
                        </div>
                        <div id="myTabContent{{$paciente->id ?? ''}}">
                            <div class="{{$tratamientos}} p-4 rounded-lg bg-gray-50 dark:bg-gray-800" id="atenciones{{$paciente->id}}" role="tabpanel" aria-labelledby="atenciones-tab">
                                @livewire('paciente.show.atenciones.atenciones-listado', ['paciente' => $paciente])
                            </div>
                            <div class="{{$apoderados}} p-4 rounded-lg bg-gray-50 dark:bg-gray-800" id="apoderados{{$paciente->id}}" role="tabpanel" aria-labelledby="apoderados-tab">
                                @livewire('paciente.show.apoderado.apoderado-listado', ['paciente' => $paciente])
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

   
</div>