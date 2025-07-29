<div>
  <section class="p-2 dark:bg-gray-900">
    <div class="max-w-screen-xl px-1 mx-auto lg:px-2">
      <div class="relative overflow-hidden bg-white rounded-lg shadow-md">
        <div class="flex flex-row items-center gap-2 p-4">
          <img src="{{ asset('icons/lista.gif') }}" alt="" class="w-10 h-10">
          <label class="text-lg font-semibold">Listado de Kines</label>
        </div>
        <div class="flex flex-col justify-between p-4 space-y-3 md:flex-row md:space-y-0">
          <div class="w-full md:w-5/6">
            <div class="flex items-center">
              <label class="uppercase sr-only">Buscar</label>
              <div class="relative w-full">
                <div class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <svg aria-hidden="true" class="w-5 h-5 text-gray-500 dark:text-gray-400" fill="currentColor"
                    viewbox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path fill-rule="evenodd"
                      d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                      clip-rule="evenodd" />
                  </svg>
                </div>
                <input type="text" wire:model.debounce.300ms="search" autocomplete="false"
                  class="block w-full p-2 pl-10 text-sm text-gray-900 uppercase border border-gray-300 rounded-lg bg-gray-50 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                  placeholder="Buscar..." required="">
              </div>
            </div>
          </div>
          <div
            class="flex flex-col items-stretch justify-end flex-shrink-0 w-full space-y-2 md:w-auto md:flex-row md:space-y-0 md:items-center">
            @livewire('kine.crear')
          </div>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-sm text-left text-gray-500 dark:text-gray-400">
            <thead class="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
              <tr>
                <th scope="col" class="px-6 py-3">Nombre</th>
                <th scope="col" class="px-6 py-3">
                  Estado
                </th>
                <th scope="col" class="px-6 py-3">
                  AccesoApp
                </th>
                <th colspan="3" class="px-6 py-3">
                  <span class="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody>
              @foreach ($doctores as $doctor)
              <tr class="uppercase bg-white border-b dark:border-gray-700 hover:bg-cyan-50"
                wire:key="{{ time().$doctor->id.'-1' }}">
                <td scope="row" class="flex items-center gap-2 px-4 py-3 text-gray-900 font-sm whitespace-nowrap">
                  <livewire:kine.kines-pacientes :doctor="$doctor" :key="time().$doctor->id.'-2'" />
                  <div class="">
                    <div>
                      {{ $doctor->name }} {{ $doctor->last_name }}
                    </div>
                    <span class="text-xs text-gray-400">
                      {{ $doctor->address->street }} #{{ $doctor->address->number }} | {{
                      $doctor->address->comuna->name
                      }}
                    </span>
                  </div>
                </td>
                <td class="px-6 py-4">
                  @if ($doctor->status === 1)
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
                <td class="px-6 py-4">
                  @if ($doctor->user->status === 1)
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
                <td class="py-0">
{{--                   <livewire:kine.atenciones :doctor="$doctor" :key="time().$doctor->id.'-3'" />
 --}}                </td>

                <td class="py-0">
{{--                   <livewire:kine.editar :doctor="$doctor" :key="time().$doctor->id.'-5'" />
 --}}                </td>
                <td class="py-0">
{{--                   <livewire:kine.eliminar :doctor="$doctor" :key="time().$doctor->id.'-6'" />
 --}}                </td>
              </tr>
              @endforeach
            </tbody>
          </table>
        </div>
        <nav class="flex justify-between p-4" aria-label="Table navigation">
          @if (count($doctores) > 0)
          {{ $doctores->links() }}
          @endif
        </nav>
      </div>
    </div>
  </section>
</div>