<div>
  <section class="p-2 dark:bg-gray-900 sm:p-5">
    <div class="max-w-screen-xl px-1 mx-auto lg:px-2">
        <!-- Start coding here -->

        <div class="relative overflow-hidden bg-white shadow-md dark:bg-gray-800 sm:rounded-lg">
            <div class="flex flex-col items-center justify-end md:flex-row md:space-y-0 md:space-x-4">
                <div class="flex justify-end pt-2 pr-2 shadow-xl">
                    @livewire('paciente.show.apoderado.apoderado-crear', ['paciente' => $paciente])
                </div>
            </div>
            <div class="w-full overflow-x-auto">
            <table class="text-sm text-gray-500 w-fit dark:text-gray-400">
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
                       <div>
                            @if ($keepers->count())
                                <div>
                        @foreach ($keepers as $keeper)
                        <tr class="bg-white border-b dark:border-gray-700 hover:bg-cyan-50">
                            <td class="items-center flex-1 py-2 pl-2 mx-2 font-medium">
                                {!! $keeper->name . '&nbsp;' . $keeper->last_name !!}
                            </td>
                            <td class="px-6 py-4">{{ $keeper->parentesco }}</td>
                            <td class="px-6 py-4">
                                {{ $keeper->email }}
                            </td>
                            <td class="px-6 py-4">
                                {!! '+56&nbsp;' . $keeper->phone !!}
                            </td>
                        

                            <td colspan="2" class="px-6 py-4">
                                @livewire('paciente.show.apoderado.apoderado-editar', ['keeper' => $keeper], key($keeper->id))
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
            <nav class="flex flex-col items-start justify-between p-4 space-y-3 md:flex-row md:items-center md:space-y-0" aria-label="Table navigation"> {{ $keepers->links() }}

            </nav>
        </div>
    </div>
</section
>
</div>

           