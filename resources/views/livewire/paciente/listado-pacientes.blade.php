<div>
    <section class="p-2 dark:bg-gray-900 sm:p-5">
        <div class="max-w-screen-xl px-1 mx-auto lg:px-2">
            <div class="relative overflow-hidden bg-white shadow-md dark:bg-gray-800 sm:rounded-lg">
                <div class="w-full flex flex-row align-middle justify-between items-center p-4 md:flex-row md:space-y-0 md:space-x-4">
                    <div class="flex items-center">
                        <img src="{{ asset('icons/lista.gif') }}" alt="" class="w-10 h-10">
                        <label class="text-lg font-semibold">Pacientes</label>
                    </div>
                    <div class="flex justify-end flex-shrink-0 w-full space-y-2 md:w-auto md:flex-row md:space-y-0 md:items-center md:space-x-3">
                    </div>
                </div>

                <div class="flex flex-col items-center justify-between p-4 space-y-3 md:flex-row md:space-y-0 md:space-x-4">
                    <div class="w-full md:w-5/6">
                        <div class="flex items-center">
                            <label class="sr-only">Buscar</label>
                            <div class="relative w-full">
                                <div class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                    <svg aria-hidden="true" class="w-5 h-5 text-gray-500 dark:text-gray-400" fill="currentColor" viewbox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                        <path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd" />
                                    </svg>
                                </div>

                                <input type="text" wire:model="search" class="block w-full p-2 pl-10 text-sm text-gray-900 uppercase border border-gray-300 rounded-lg bg-gray-50 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500" placeholder="Buscar..." required="">
                            </div>
                        </div>
                    </div>
                    <div>
                        <select class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" wire:model="quantity">
                            <option value="5">5</option>
                            <option value="10">10</option>
                            <option value="15">15</option>
                            <option value="20">20</option>
                            <option value="30">30</option>
                        </select>
                    </div>
                </div>
                <div class="mx-2 overflow-x-auto shadow-md">
                    <table class="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                        <thead class="text-xs font-bold text-gray-700 bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                            <tr>
                                <th wire:click="order('name')" scope="col" class="px-4 py-3 cursor-pointer">
                                    NOMBRE
                                    @if ($sort == 'name')
                                    @if ($direction == 'asc')
                                    <svg xmlns="http://www.w3.org/2000/svg" class="float-right w-4 h-4" viewBox="0 0 576 512">
                                        <path d="M183.6 42.4C177.5 35.8 169 32 160 32s-17.5 3.8-23.6 10.4l-88 96c-11.9 13-11.1 33.3 2 45.2s33.3 11.1 45.2-2L128 146.3V448c0 17.7 14.3 32 32 32s32-14.3 32-32V146.3l32.4 35.4c11.9 13 32.2 13.9 45.2 2s13.9-32.2 2-45.2l-88-96zM320 320c0 17.7 14.3 32 32 32h50.7l-73.4 73.4c-9.2 9.2-11.9 22.9-6.9 34.9s16.6 19.8 29.6 19.8H480c17.7 0 32-14.3 32-32s-14.3-32-32-32H429.3l73.4-73.4c9.2-9.2 11.9-22.9 6.9-34.9s-16.6-19.8-29.6-19.8H352c-17.7 0-32 14.3-32 32zM416 32c-12.1 0-23.2 6.8-28.6 17.7l-64 128-16 32c-7.9 15.8-1.5 35 14.3 42.9s35 1.5 42.9-14.3l7.2-14.3h88.4l7.2 14.3c7.9 15.8 27.1 22.2 42.9 14.3s22.2-27.1 14.3-42.9l-16-32-64-128C439.2 38.8 428.1 32 416 32zM395.8 176L416 135.6 436.2 176H395.8z" />
                                    </svg>
                                    @else
                                    <svg xmlns="http://www.w3.org/2000/svg" class="float-right w-4 h-4" viewBox="0 0 576 512">
                                        <path d="M183.6 469.6C177.5 476.2 169 480 160 480s-17.5-3.8-23.6-10.4l-88-96c-11.9-13-11.1-33.3 2-45.2s33.3-11.1 45.2 2L128 365.7V64c0-17.7 14.3-32 32-32s32 14.3 32 32V365.7l32.4-35.4c11.9-13 32.2-13.9 45.2-2s13.9 32.2 2 45.2l-88 96zM320 320c0-17.7 14.3-32 32-32H480c12.9 0 24.6 7.8 29.6 19.8s2.2 25.7-6.9 34.9L429.3 416H480c17.7 0 32 14.3 32 32s-14.3 32-32 32H352c-12.9 0-24.6-7.8-29.6-19.8s-2.2-25.7 6.9-34.9L402.7 352H352c-17.7 0-32-14.3-32-32zM416 32c12.1 0 23.2 6.8 28.6 17.7l64 128 16 32c7.9 15.8 1.5 35-14.3 42.9s-35 1.5-42.9-14.3L460.2 224H371.8l-7.2 14.3c-7.9 15.8-27.1 22.2-42.9 14.3s-22.2-27.1-14.3-42.9l16-32 64-128C392.8 38.8 403.9 32 416 32zM395.8 176h40.4L416 135.6 395.8 176z" />
                                    </svg>
                                    @endif
                                    @else
                                    <svg xmlns="http://www.w3.org/2000/svg" class="float-right w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                                        <path stroke-linecap="round" stroke-linejoin="round" d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
                                    </svg>
                                    @endif
                                </th>

                                <th scope="col" class="px-6 py-3 cursor-pointer">
                                    <span class="sr-only">Actions</span>
                                </th>
                                @if (auth()->user()->email == 'javt1981@gmail.com')
                                <th></th>
                                @endif
                            </tr>
                        </thead>
                        <tbody>
                            @forelse ( $pacientes as $paciente)
                            <tr class="items-center justify-between bg-white border-b dark:border-gray-700 hover:bg-cyan-50">
                                <td class="flex items-center py-2 pl-2 mx-2">
                                    <div class="ml-2 font-medium uppercase dark:text-white">
                                        {{ $paciente->name }} {{ $paciente->last_name }}
                                    </div>
                                </td>
                                <td>
                                    @foreach ($paciente->applications as $application)
                                   
                                        @if ($application->status == 2)
                                            <div class="flex flex-row gap-4">
                                                    @livewire('paciente.show.atenciones.atenciones-crear',['user' => $paciente], key($paciente->id))
                                            </div>
                                        @else
                                            <div class="flex flex-row gap-4">      
                                                        @livewire('paciente.show.atenciones.crear-item',['user' => $paciente], key($paciente->id))
                                            </div>
                                        @endif
                                    @endforeach
                                </td>
                                     @if (auth()->user()->email == 'javt1981@gmail.com')
                                <td>
                                         @livewire('paciente.modal-fix',['user' => $paciente], key($paciente->id))
                                </td>
                                    @endif
                            </tr>
                            @empty
                            <tr>
                                <td colspan="5" class="text-center">
                                    No hay registros para su busqueda...
                                </td>
                            </tr>
                            @endforelse
                        </tbody>
                    </table>
                </div>
                <nav class="flex flex-col items-start justify-between p-4 space-y-3 md:flex-row md:items-center md:space-y-0" aria-label="Table navigation"> {{ $pacientes->links() }}

                </nav>
            </div>
        </div>
    </section>
</div>