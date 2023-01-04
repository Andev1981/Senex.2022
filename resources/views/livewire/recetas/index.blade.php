<div>
        <x-slot name="header">
            <h2 class="font-semibold text-xl text-gray-800 leading-tight">
                <nav class="flex" aria-label="Breadcrumb">
                    <ol class="inline-flex items-center space-x-1 md:space-x-3">
                        <li class="inline-flex items-center">
                            <a href="{{route('doctores')}}" class="inline-flex items-center text-sm font-medium text-gray-700 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white">
                                <svg xmlns="http://www.w3.org/2000/svg" class="mr-2 h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                    <path d="M5 4a1 1 0 00-2 0v7.268a2 2 0 000 3.464V16a1 1 0 102 0v-1.268a2 2 0 000-3.464V4zM11 4a1 1 0 10-2 0v1.268a2 2 0 000 3.464V16a1 1 0 102 0V8.732a2 2 0 000-3.464V4zM16 3a1 1 0 011 1v7.268a2 2 0 010 3.464V16a1 1 0 11-2 0v-1.268a2 2 0 010-3.464V4a1 1 0 011-1z" />
                                </svg>
                                Detalle de Solicitud
                            </a>
                        </li>
                    </ol>
                </nav>
            </h2>
        </x-slot>

        <div class="container mx-auto my-5 p-5">
            <div class="md:flex no-wrap md:-mx-2 ">
                <!-- Left Side -->
                <div class="w-full md:w-3/12 md:mx-2">
                    <!-- Profile Card -->
                @livewire('recetas.user',['solicitud' => $solicitud])
                    <!-- End of profile card -->
                </div>
                <!-- Right Side -->
                <div class="w-full md:w-9/12 mx-2 h-64">
                    <!-- Profile tab -->
                    <!-- About Section -->
                    <div class="bg-white p-3 shadow-sm rounded-sm">

                        <!-- Experience and education -->
                        <div class="bg-white p-3 shadow-sm rounded-sm">
                            <label>Kine Asignado: {{$this->kine->user->name}}</label>
                            <div class="w-full mx-auto mt-4  rounded">
                                @if ($solicitud->status == 0)
                                    <span class="bg-yellow-100 text-yellow-800 text-xs font-semibold mr-2 px-3.5 py-1.5 rounded dark:bg-yellow-200 dark:text-yellow-900">Pendiente</span>
                                @elseif($solicitud->status == 1)
                                    <span class="bg-green-100 text-green-800 text-xs font-semibold mr-2 px-2.5 py-0.5 rounded dark:bg-green-200 dark:text-green-900">Atendida</span>
                                @endif
                                <a wire:click="open()" class="float-right px-3 py-1 text-xs rounded-lg bg-sky-700 text-white cursor-pointer">Cambiar estado</a>
                                <hr class="mt-2">

                                <!-- Tabs -->
                                <ul class="inline-flex w-full px-1 pt-2 ">
                                    <li @if($first == 'true') class="px-4 py-2 -mb-px font-semibold text-gray-800 border-b-2 border-blue-400 rounded-t opacity-50" @else class="px-4 py-2 font-semibold text-gray-800 rounded-t opacity-50" @endif><a class="cursor-pointer" wire:click="tabs(1)">Sesiones</a></li>
                                    <li @if($second == 'true') class="px-4 py-2 -mb-px font-semibold text-gray-800 border-b-2 border-blue-400 rounded-t opacity-50" @else class="px-4 py-2 font-semibold text-gray-800 rounded-t opacity-50" @endif><a class="cursor-pointer" wire:click="tabs(2)">Antecedentes</a></li>
                                    <li @if($third == 'true') class="px-4 py-2 -mb-px font-semibold text-gray-800 border-b-2 border-blue-400 rounded-t opacity-50" @else class="px-4 py-2 font-semibold text-gray-800 rounded-t opacity-50" @endif><a class="cursor-pointer" wire:click="tabs(3)">Imágenes</a></li>
                                    <li @if($fourth == 'true') class="px-4 py-2 -mb-px font-semibold text-gray-800 border-b-2 border-blue-400 rounded-t opacity-50" @else class="px-4 py-2 font-semibold text-gray-800 rounded-t opacity-50" @endif><a class="cursor-pointer" wire:click="tabs(4)">Documentos</a></li>
                                
                                </ul>

                                <!-- Tab Contents -->
                                <div>

                                    {{-- First Tab --}}
                                    <div @if($first == 'true') active @else class="hidden" @endif class="p-4">
                                            
                                        @livewire('recetas.tabs.fourth',['solicitud' => $solicitud])
                                    </div>

                                    {{--  Second Tab --}}
                                    <div @if($second == 'true') active @else class="hidden" @endif  class="p-4">
                                        @livewire('recetas.tabs.first',['solicitud' => $solicitud])
                                    </div>
                                    
                                    {{-- Third Tab --}}
                                    <div @if($third == 'true') active @else class="hidden" @endif  class="p-4">
                                        @livewire('recetas.tabs.second',['solicitud' => $solicitud])
                                    </div>
                                    
                                    {{-- Fourth Tab --}}
                                    <div @if($fourth == 'true') active @else class="hidden" @endif  class="p-4">
                                        @livewire('recetas.tabs.third',['solicitud' => $solicitud])
                                    </div>

                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        @if($open)
        <div tabindex="-1" class="bg-[#4d515dab] overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 z-50 w-full md:inset-0 h-modal md:h-full justify-center items-center flex" aria-modal="true" role="dialog">
                    <!-- Modal content -->
            <div class="relative bg-white rounded-lg shadow dark:bg-gray-700">
                    <!-- Modal header -->
                    <div class="flex justify-between items-center p-5 rounded-t border-b dark:border-gray-600">
                        <h3 class="text-xl font-medium text-gray-900 dark:text-white">
                           Cambiar estado
                        </h3>
                        <button wire:click="cerrar" type="button" class="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center dark:hover:bg-gray-600 dark:hover:text-white" data-modal-toggle="medium-modal">
                            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path></svg>
                        </button>
                    </div>
            <!-- Modal body -->
            <form wire:submit.prevent="save" >
                    <div class="p-6 space-y-6">
                        <div class="grid xl:grid-cols-1 xl:gap-1">
                            <div class="relative z-0 w-full mb-6 group">
                                    <select wire:model="status" required class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500">
                                        <option value="">Selecciona</option>
                                        <option value="0">Pendiente</option>
                                        <option value="1">Atendida</option>
                                    </select>
                            </div>
                        </div>
                    </div>
                        <!-- Modal footer -->
                        <div class="flex items-center p-6 space-x-2 rounded-b border-t border-gray-200 dark:border-gray-600">
                            <button type="submit" class="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">Actualizar</button>
                            <button wire:click="cerrar" type="button" class="text-gray-500 bg-white hover:bg-gray-100 focus:ring-4 focus:outline-none focus:ring-gray-200 rounded-lg border border-gray-200 text-sm font-medium px-5 py-2.5 hover:text-gray-900 focus:z-10 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-500 dark:hover:text-white dark:hover:bg-gray-600 dark:focus:ring-gray-600">Cerrar</button>
                        </div>
                    </form>
                </div>
            </div>
    @endif


</div>

