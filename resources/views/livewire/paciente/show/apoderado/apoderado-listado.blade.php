<div>
  <section class="p-2 dark:bg-gray-900 sm:p-5">
    <div class="max-w-screen-xl px-1 mx-auto lg:px-2">
        <!-- Start coding here -->

        <div class="relative overflow-hidden bg-white shadow-md dark:bg-gray-800 sm:rounded-lg">
            <div class="flex flex-col items-center justify-between p-4 space-y-3 md:flex-row md:space-y-0 md:space-x-4">
                    <div class="w-full md:w-5/6">
                        <div class="flex items-center">
                            <label  class="sr-only">Buscar</label>
                            <div class="relative w-full">
                                 <div class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                         
                                </div>
                               
                            </div>
                        </div>
                    </div>
                    <div class="flex flex-col items-stretch justify-end flex-shrink-0 w-full space-y-2 md:w-auto md:flex-row md:space-y-0 md:items-center md:space-x-3">
                    @livewire('paciente.show.apoderado.apoderado-crear', ['paciente' => $paciente])

                    </div>
            </div>
            <div class="w-full overflow-x-auto">
                <table class="w-full text-sm text-gray-500 dark:text-gray-400">
                    <thead class="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                        <tr class="text-center">
                            <th scope="col" class="px-4 py-3">Nombre</th>
                            <th scope="col" class="px-4 py-3">Parentesco</th>
                            <th scope="col" class="px-4 py-3">Correo</th>
                            <th scope="col" class="px-4 py-3">Teléfono</th>
                            <th colspan="2" class="px-4 py-3">
                                <span class="sr-only">Actions</span>
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                      
                        @if ($keepers->count())
                              
                        @foreach ($keepers as $keeper)
                        <tr class="bg-white border-b dark:border-gray-700 hover:bg-cyan-50">
                            <td class="items-center flex-1 py-2 pl-2 mx-2 font-medium uppercase">
                                {!! $keeper->name . '&nbsp;' . $keeper->last_name !!}
                            </td>
                            <td class="px-6 py-4 uppercase">{{ $keeper->parentesco }}</td>
                            <td class="px-6 py-4 uppercase">
                                {{ $keeper->email }}
                            </td>
                            <td class="px-6 py-4 uppercase">
                                {!! '+56&nbsp;' . $keeper->phone !!}
                            </td>
                        

                            <td colspan="2" class="px-6 py-4">
                                @livewire('paciente.show.apoderado.apoderado-editar', ['keeper' => $keeper], key($keeper->id))
                            </td>
                        </tr>
                        @endforeach
                               
                        @else
                        <tr class="text-center">
                            <td colspan="6 uppercase">
                                No hay datos aún...
                            </td>
                        </tr>
                        @endif
                            
                    </tbody>
                </table>
            </div>
            <nav class="flex flex-col items-start justify-between p-4 space-y-3 md:flex-row md:items-center md:space-y-0" aria-label="Table navigation"> {{ $keepers->links() }}

            </nav>
        </div>
    </div>
  </section>
</div>

           