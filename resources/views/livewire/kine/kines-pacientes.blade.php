<div>

  <button type="button" wire:click="openModal"
    class="flex items-center gap-1 px-2 py-1 text-sm font-medium text-center text-white rounded-lg bg-sky-700 hover:bg-sky-800 focus:ring-4 focus:outline-none focus:ring-sky-300 dark:bg-sky-600 dark:hover:bg-sky-700 dark:focus:ring-sky-800">
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
      class="icon icon-tabler icons-tabler-outline icon-tabler-users-plus">
      <path stroke="none" d="M0 0h24v24H0z" fill="none" />
      <path d="M5 7a4 4 0 1 0 8 0a4 4 0 0 0 -8 0" />
      <path d="M3 21v-2a4 4 0 0 1 4 -4h4c.96 0 1.84 .338 2.53 .901" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      <path d="M16 19h6" />
      <path d="M19 16v6" />
    </svg>
  </button>

  @if ($isOpen)

  {{-- Modal Kine Paciente Asignaciones --}}
  <div aria-hidden="true"
    class="bg-gray-600 bg-opacity-50 overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 z-50 justify-center items-center w-full md:inset-0 h-[calc(100%-1rem)] flex"
    aria-modal="true" aria-hidden="false" role="dialog">
    <div class="relative w-full h-full max-w-3xl p-4">

      <!-- Modal content -->
      <div class="relative p-4 bg-white rounded-lg shadow dark:bg-gray-800 sm:p-5">
        <!-- Modal header -->
        <div class="flex justify-between pb-4 mb-4 border-b rounded-t sm:mb-5 dark:border-gray-600">
          <div>
            <h3 class="text-xs text-gray-400 uppercase dark:text-white">
              kine
            </h3>
            <label class="text-lg font-semibold text-gray-600" for="">{{ $doctor->name }} &nbsp;{{ $doctor->last_name
              }}</label>
          </div>
          <button wire:click="closeModal" type="button"
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

        <div class="grid gap-4 mb-4 sm:grid-cols-2">
          <div>
            @if ($error !== "")
            <label class="text-red-500" for="">{{ $error }}</label>
            @endif
            <div class="relative">
              <div class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-gray-500 dark:text-gray-400" fill="none"
                  viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round"
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <input type="text" wire:model.debounce.300ms="search" type="text"
                class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-sky-500 focus:border-sky-500 block w-full pl-10 p-2.5  dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-sky-500 dark:focus:border-sky-500"
                placeholder="Buscar pacientes...">

            </div>
            <ul>
              @foreach($pacientes as $paciente)
              <li class="flex items-center justify-between w-full gap-4">
                <div wire:click="guardarPaciente({{ $paciente->id }})"
                  class="p-1 ml-4 text-xs text-gray-900 border border-gray-300 bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500">
                  {{ $paciente->name }}&nbsp;{{ $paciente->last_name }} <button
                    class="px-2 ml-5 text-white bg-green-500 rounded-lg"><svg xmlns="http://www.w3.org/2000/svg"
                      width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                      stroke-linecap="round" stroke-linejoin="round"
                      class="icon icon-tabler icons-tabler-outline icon-tabler-corner-down-right">
                      <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                      <path d="M6 6v6a3 3 0 0 0 3 3h10l-4 -4m0 8l4 -4" />
                    </svg>
                    </svg></button>
                </div>
              </li>
              @endforeach
            </ul>

          </div>
          <div>
            <span class="my-2 mb-5 text-sm font-medium text-gray-900 dark:text-white">
              Pacientes
            </span>
            <ul class="mt-5">
              @forelse ($misPacientes as $miPaciente)
              <li class="flex items-center justify-between w-full gap-4">
                <div
                  class="p-1 ml-4 text-xs text-gray-900 border border-gray-300 bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500">
                  <button wire:click="quitarPaciente({{ $miPaciente->id }})"
                    class="px-2 mr-5 text-white bg-red-500 rounded-lg"><svg xmlns="http://www.w3.org/2000/svg"
                      width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                      stroke-linecap="round" stroke-linejoin="round"
                      class="icon icon-tabler icons-tabler-outline icon-tabler-x">
                      <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                      <path d="M18 6l-12 12" />
                      <path d="M6 6l12 12" />
                    </svg>
                    </svg>
                    </svg></button>
                  {{ $miPaciente->paciente->name }}&nbsp;{{ $miPaciente->paciente->last_name }}
                </div>
              </li>
              @empty
              <li class="flex items-center justify-between w-full gap-4">
                <div
                  class="p-1 ml-4 text-xs text-gray-900 border border-gray-300 bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500">
                  <span>No hay Pacientes Asignados</span>
                </div>
              </li>

              @endforelse
            </ul>
          </div>
        </div>

        <div class="flex items-center pt-5 border-t-2">

        </div>

      </div>
    </div>
  </div>
  @endif
</div>