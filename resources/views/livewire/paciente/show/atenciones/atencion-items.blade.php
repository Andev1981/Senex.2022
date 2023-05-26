<div>
    <button type="button" wire:click="$set('openItem','')"
        class="px-2 py-1 flex items-center text-sm font-medium text-center text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-primary-700 focus:z-10 focus:ring-4 focus:ring-gray-200 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-4 h-4 mr-2 -ml-0.5">
            <path d="M12 15a3 3 0 100-6 3 3 0 000 6z"></path>
            <path fill-rule="evenodd" clip-rule="evenodd"
                d="M1.323 11.447C2.811 6.976 7.028 3.75 12.001 3.75c4.97 0 9.185 3.223 10.675 7.69.12.362.12.752 0 1.113-1.487 4.471-5.705 7.697-10.677 7.697-4.97 0-9.186-3.223-10.675-7.69a1.762 1.762 0 010-1.113zM17.25 12a5.25 5.25 0 11-10.5 0 5.25 5.25 0 0110.5 0z">
            </path>
        </svg>
        Resumen
    </button>
    <div
        class="{{ $openItem }} bg-gray-600 bg-opacity-50 overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 z-50 justify-center w-full md:inset-0 h-modal md:h-full flex">
        <div class="relative w-full md:max-w-7xl h-full p-4 md:h-auto">

            <!-- Modal content -->
            <div class="relative p-4 bg-white rounded-lg shadow dark:bg-gray-800 sm:p-5">
                <!-- Modal header -->
                <div
                    class="flex items-center justify-between pb-4 mb-4 border-b rounded-t sm:mb-5 dark:border-gray-600">
                    <h3 class="text-base text-gray-700 dark:text-white">
                        Resumen de Sesiones
                    </h3>
                    {{--  <h3 class="ml-3 text-lg font-semibold text-slate-800">
                        "{{ $keeper->user->name . ' ' . $keeper->user->last_name }}"
                    </h3> --}}
                    <button wire:click="$set('openItem','hidden')" type="button"
                        class="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center dark:hover:bg-gray-600 dark:hover:text-white">
                        <svg aria-hidden="true" class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"
                            xmlns="http://www.w3.org/2000/svg">
                            <path fill-rule="evenodd"
                                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                                clip-rule="evenodd"></path>
                        </svg>
                        <span class="sr-only">Close modal</span>
                    </button>
                </div>



                <div>
                    <div class="grid gap-4 mb-4 sm:grid-cols-4">
                        <div class="flex items-center rounded-xl shadow-lg">
                            @if ($paciente->avatar)
                                <img class="w-10 h-10 rounded-full" src="{{ $paciente->avatar }}" alt="Old avatar">
                            @else
                                <svg class="w-10 h-10 rounded-full text-gray-400" fill="currentColor"
                                    viewBox="0 0 22 22" xmlns="http://www.w3.org/2000/svg">
                                    <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                                        clip-rule="evenodd">
                                    </path>
                                </svg>
                            @endif
                            <div class="font-medium dark:text-white">
                                <div>{{ $paciente->name . ' ' . $paciente->last_name }}</div>
                                <div class="text-sm text-gray-500 dark:text-gray-400">{{ $paciente->email }}</div>
                            </div>
                        </div>
                        <div class="flex items-center bg-slate-600 rounded-xl shadow-lg">
                            <div class="px-2">

                                <table class="w-full text-sm text-gray-500 dark:text-gray-400">
                                    <thead
                                        class="text-xs text-gray-700 uppercase bg-teal-100 dark:bg-gray-700 dark:text-gray-400">
                                        <tr class="text-center text-white bg-sky-500">
                                            <th colspan="3" class="px-6 py-1">Atenciones</th>
                                        </tr>
                                        <tr class="text-center">
                                            <th scope="col" class="px-6 py-1">Total</th>
                                            <th scope="col" class="px-6 py-1">Atendidas</th>
                                            <th scope="col" class="px-6 py-1">Pendientes</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr class="bg-white border-b dark:border-gray-700 text-center hover:bg-cyan-50">
                                            <td class="py-1 pl-2 mx-2">
                                                {{ count($items) }}
                                            </td>
                                            <td class="px-6 py-1">
                                                {{ count($atendidas) }}
                                            </td>
                                            <td class="px-6 py-1">
                                                {{ $pendientes }}
                                            </td>
                                        </tr>

                                    </tbody>
                                </table>
                            </div>
                        </div>

                    </div>
                    <div class="grid gap-4 sm:grid-cols-2 sm:gap-6 shadow-xl">
                        <div class="space-y-4 sm:col-span-2 sm:space-y-6 px-5">

                            <div class="overflow-x-auto w-full">
                                <table class="w-full text-sm text-gray-500 dark:text-gray-400">
                                    <thead
                                        class="text-xs text-gray-700 uppercase bg-teal-100 dark:bg-gray-700 dark:text-gray-400">
                                        <tr class="">
                                            <th scope="col" class="px-6 py-3">Kine</th>
                                            <th scope="col" class="px-6 py-3">Fecha&nbsp;Atención</th>
                                            <th scope="col" class="px-6 py-3">Estado</th>
                                            <th colspan="2" class="px-6 py-3">
                                                <span class="sr-only">Actions</span>
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        @forelse ($items as $item)
                                            <tr class="bg-white border-b dark:border-gray-700 hover:bg-cyan-50">
                                                <td class="py-2 pl-2 mx-2">
                                                    {{ $item->user->name }}
                                                </td>
                                                <td class="px-6 py-4">
                                                    {{ $item->fecha_atencion }}
                                                </td>
                                                <td class="px-6 py-4">
                                                    {{ $item->status }}
                                                </td>
                                                <td class="px-6 py-4">
                                                    {{ $item->comments }}
                                                </td>
                                                <td colspan="2" class="flex px-6 py-4">
                                                    {{-- <div class="px-2">
                                                        @livewire('paciente.show.atenciones.atencion-items', ['application' => $application], key($application->id))
                                                    </div>
                                                    @livewire('paciente.show.atenciones.atenciones-editar', ['application' => $application], key($application->id)) --}}
                                                </td>
                                            </tr>
                                        @empty
                                            <tr class="bg-white border-b dark:border-gray-700 hover:bg-cyan-50">
                                                <td colspan="8" class="text-center py-2 pl-2 mx-2">
                                                    Sin sesiones agregadas
                                                </td>
                                            </tr>
                                        @endforelse

                                    </tbody>
                                </table>
                            </div>
                            <div class="mb-5">
                                {{ $items->links() }}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
