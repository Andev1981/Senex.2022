<div>
    <section class="p-2 dark:bg-gray-900 sm:p-5">
        <div class="max-w-screen-xl px-1 mx-auto lg:px-2">
            <!-- Start coding here -->

            <div class="relative overflow-hidden bg-white shadow-md dark:bg-gray-800 sm:rounded-lg">
                <div class="flex flex-col items-center justify-between p-4 space-y-3 md:flex-row md:space-y-0 md:space-x-4">
                    <div class="w-full md:w-5/6">
                        <div class="flex items-center">
                            <label for="simple-search" class="sr-only">Buscar</label>
                            <div class="relative w-full">
                                <div class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                    <svg aria-hidden="true" class="w-5 h-5 text-gray-500 dark:text-gray-400" fill="currentColor" viewbox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                        <path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd" />
                                    </svg>
                                </div>
                                <input type="text" wire:model="search" class="block w-full p-2 pl-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500" placeholder="Buscar..." required="">
                            </div>
                        </div>
                    </div>
                    <div class="flex flex-col items-stretch justify-end flex-shrink-0 w-full space-y-2 md:w-auto md:flex-row md:space-y-0 md:items-center md:space-x-3">
                        @livewire('paciente.show.atenciones.atenciones-crear',['paciente' => $paciente])

                    </div>
                </div>
                <div class="w-full overflow-x-auto">
                    <table class="w-full text-sm text-gray-500 dark:text-gray-400">
                        <thead class="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                            <tr class="text-center">
                                <th scope="col" class="px-6 py-3">Fecha&nbsp;Creación</th>
                                <th scope="col" class="px-6 py-3">Derivado</th>
                                <th scope="col" class="px-6 py-3">Desde</th>
                                <th scope="col" class="px-6 py-3">Valor</th>
                                <th scope="col" class="px-6 py-3">Estado</th>
                                <th colspan="2" class="px-6 py-3">
                                    <span class="sr-only">Actions</span>
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            <div>
                                @if ($atenciones->count())
                                <div>
                                    @foreach ($atenciones as $application)
                                    <tr class="bg-white border-b dark:border-gray-700 hover:bg-cyan-50">
                                        <td class="px-6 py-4">
                                            {{ date('d-m-Y', strtotime($application->created_at)) }}
                                        </td>
                                        <td class="py-2 pl-2 mx-2">
                                            {{ $application->derivado }}
                                        </td>
                                        <td class="px-6 py-4">
                                            {{ $application->desde }}
                                        </td>
                                        <td class="px-6 py-4">
                                            ${{ number_format($application->price, 0) }}
                                        </td>
                                        <td class="px-6 py-4">
                                            <div>
                                                @if ($application->status === 0)
                                                <span class="inline-flex items-center bg-yellow-100 text-yellow-800 text-xs font-medium mr-2 px-2.5 py-0.5 rounded-full dark:bg-yellow-900 dark:text-yellow-300">
                                                    <span class="w-2 h-2 mr-1 bg-yellow-500 rounded-full"></span>
                                                    No&nbsp;iniciada
                                                </span>
                                                @elseif ($application->status === 1)
                                                <span class="inline-flex items-center bg-green-100 text-green-800 text-xs font-medium mr-2 px-2.5 py-0.5 rounded-full dark:bg-green-900 dark:text-green-300">
                                                    <span class="w-2 h-2 mr-1 bg-green-500 rounded-full"></span>
                                                    En&nbsp;proceso
                                                </span>
                                                @elseif ($application->status === 2)
                                                <span class="inline-flex items-center bg-teal-100 text-teal-800 text-xs font-medium mr-2 px-2.5 py-0.5 rounded-full dark:bg-teal-900 dark:text-teal-300">
                                                    <span class="w-2 h-2 mr-1 bg-teal-500 rounded-full"></span>
                                                    Finalizada
                                                </span>
                                                @endif
                                            </div>

                                        </td>
                                        <td class="flex px-6 py-4">
                                            <div>

                                                @livewire('paciente.show.atenciones.atenciones-items', ['application' => $application], key($application->id))

                                            </div>
                                        </td>
                                        <td>
                                            <div>

                                                @livewire('paciente.show.atenciones.atenciones-editar', ['application' => $application], key($application->id))
                                            </div>
                                        </td>
                                    </tr>
                                    @endforeach
                                </div>
                                @else
                                <tr class="text-center">
                                    <td colspan="6">
                                        No hay datos aún...
                                    </td>
                                </tr>
                                @endif
                            </div>
                        </tbody>
                    </table>
                </div>
                <nav class="flex flex-col items-start justify-between p-4 space-y-3 md:flex-row md:items-center md:space-y-0" aria-label="Table navigation">
                    {{ $atenciones->links() }}
                </nav>
            </div>
        </div>
    </section>
</div>