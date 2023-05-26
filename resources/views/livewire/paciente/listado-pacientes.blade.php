<div>
    <section class="p-2 dark:bg-gray-900 sm:p-5">
        <div class="max-w-screen-xl px-1 mx-auto lg:px-2">
            <div class="relative overflow-hidden bg-white shadow-md dark:bg-gray-800 sm:rounded-lg">
                <div class="flex flex-row items-center p-4 bg-slate-200 md:flex-row md:space-y-0 md:space-x-4">
                    <img src="{{ asset('icons/lista.gif') }}" alt="" class="w-10 h-10">
                    <label class="text-lg font-semibold">Listado de Pacientes</label>
                </div>
                <div
                    class="flex flex-col items-center justify-between p-4 space-y-3 md:flex-row md:space-y-0 md:space-x-4">
                    <div class="w-full md:w-5/6">
                        <div class="flex items-center">
                            <label for="simple-search" class="sr-only">Buscar</label>
                            <div class="relative w-full">
                                <div class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                    <svg aria-hidden="true" class="w-5 h-5 text-gray-500 dark:text-gray-400"
                                        fill="currentColor" viewbox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                        <path fill-rule="evenodd"
                                            d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                                            clip-rule="evenodd" />
                                    </svg>
                                </div>
                                <input type="text" wire:model="search"
                                    class="block w-full p-2 pl-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                                    placeholder="Buscar..." required="">
                            </div>
                        </div>
                    </div>
                    <div
                        class="flex flex-col items-stretch justify-end flex-shrink-0 w-full space-y-2 md:w-auto md:flex-row md:space-y-0 md:items-center md:space-x-3">
                        @livewire('paciente.modal-crear')

                    </div>
                </div>
                <div class="overflow-x-auto">
                    <table class="w-full text-sm text-gray-500 dark:text-gray-400">
                        <thead class="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                            <tr class="text-center">
                                <th scope="col" class="px-6 py-3">Nombre</th>
                                <th scope="col" class="px-6 py-3">Teléfono</th>
                                <th scope="col" class="px-6 py-3">Dirección</th>
                                <th scope="col" class="px-6 py-3">Estado</th>
                                <th scope="col" class="px-6 py-3">
                                    <span class="sr-only">Actions</span>
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            @foreach ($pacientes as $paciente)
                                @if ($paciente->user_type === 'Paciente')
                                    <tr class="bg-white border-b dark:border-gray-700 hover:bg-cyan-50">
                                        <td class="flex items-center py-2 pl-2 mx-2">
                                            @if ($paciente->avatar)
                                                <img class="w-10 h-auto rounded-full shadow-xl"
                                                    src="{{ asset($paciente->avatar) }}" alt="">
                                            @else
                                                <svg class="w-10 h-auto text-gray-400  rounded-full shadow-xl"
                                                    fill="currentColor" viewBox="0 0 20 20"
                                                    xmlns="http://www.w3.org/2000/svg">
                                                    <path fill-rule="evenodd"
                                                        d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                                                        clip-rule="evenodd"></path>
                                                </svg>
                                            @endif
                                            <div class="font-medium dark:text-white ml-2">
                                                <div class="">{{ $paciente->name }} {{ $paciente->last_name }}
                                                </div>
                                                <div class="font-medium">{{ $paciente->email }}</div>
                                                <div class="text-sm text-gray-500 dark:text-gray-400">
                                                    {{ $paciente->rut }}</div>
                                            </div>


                                        </td>
                                        <td class="px-6 py-4">{{ $paciente->phone }}</td>
                                        <td class="px-6 py-4">{{ $paciente->address->street }}</td>
                                        <td class="px-6 py-4">
                                            @if ($paciente->status === 1)
                                                <span
                                                    class="px-2 py-0 mr-2 text-xs font-semibold text-white bg-green-600 rounded-full dark:bg-green-200 dark:text-green-900">
                                                    Activo
                                                </span>
                                            @else
                                                <span
                                                    class="px-2 py-0 mr-2 text-xs font-semibold text-white bg-red-600 rounded-full dark:bg-green-200 dark:text-red-900">
                                                    Deshabilitado
                                                </span>
                                            @endif

                                        </td>

                                        <td colspan="2" class="flex px-6 py-4 gap-2">
                                            @livewire('paciente.modal-editar', ['paciente' => $paciente], key($paciente->id))
                                            @livewire('paciente.show.index', ['paciente' => $paciente], key($paciente->id))
                                        </td>
                                    </tr>
                                @endif
                            @endforeach
                        </tbody>
                    </table>
                </div>
                <nav class="flex flex-col items-start justify-between p-4 space-y-3 md:flex-row md:items-center md:space-y-0"
                    aria-label="Table navigation"> {{ $pacientes->links() }}

                </nav>
            </div>
        </div>
    </section>
</div>
