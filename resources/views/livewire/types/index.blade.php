<div>
    <section class="p-2 dark:bg-gray-900 sm:p-5">
        <div class="max-w-screen-xl px-1 mx-auto lg:px-2">
            <div class="relative overflow-hidden bg-white shadow-md dark:bg-gray-800 sm:rounded-lg">
                <div class="flex flex-row items-center justify-between p-4 md:flex-row md:space-y-0 md:space-x-4">
                    <div class="flex flex-row items-center">
                        <img src="{{ asset('icons/lista.gif') }}" alt="" class="w-10 h-10">
                        <label class="text-lg font-semibold">Tipos de Atención</label>
                    </div>
                    
                     <div class="flex flex-col items-stretch justify-end flex-shrink-0 w-full space-y-2 md:w-auto md:flex-row md:space-y-0 md:items-center md:space-x-3">
                    @livewire('types.create-type')

                    </div>
                </div>
                
            <div class="w-full overflow-x-auto">
                <table class="w-full text-sm text-gray-500 dark:text-gray-400">
                    <thead class="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                        <tr class="text-left">
                            <th scope="col" class="px-4 py-3">Nombre</th>
                            <th scope="col" class="px-4 py-3">Descripción</th>
                            <th colspan="2" class="px-4 py-3">
                                <span class="sr-only">Actions</span>
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                      
                        @if ($types->count())
                              
                        @foreach ($types as $type)
                        <tr class="bg-white border-b dark:border-gray-700 hover:bg-cyan-50">
                            <td class="items-center flex-1 py-2 pl-2 mx-2 font-medium uppercase">
                               {{  $type->name  }}
                            </td>
                            <td class="px-6 py-4 uppercase">
                            {{      $type->description }}
                            </td>
                            <td colspan="2" class="px-6 py-4">
                            @livewire('types.create-type', ['type' => $type], key($type->id))
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
            <nav class="flex flex-col items-start justify-between p-4 space-y-3 md:flex-row md:items-center md:space-y-0" aria-label="Table navigation"> {{ $types->links() }}

            </nav>
        </div>
        </div>
    </section>
</div>

           