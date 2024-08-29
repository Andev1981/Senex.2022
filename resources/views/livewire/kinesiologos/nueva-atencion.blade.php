<div>

  <button type="button" wire:click="openModal"
    class="text-gray-400  bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center dark:hover:bg-gray-400 dark:hover:text-white">
    <svg class="w-6 h-6 text-gray-400 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24"
      height="24" fill="none" viewBox="0 0 24 24">
      <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
        d="M18 9V4a1 1 0 0 0-1-1H8.914a1 1 0 0 0-.707.293L4.293 7.207A1 1 0 0 0 4 7.914V20a1 1 0 0 0 1 1h4M9 3v4a1 1 0 0 1-1 1H4m11 6v4m-2-2h4m3 0a5 5 0 1 1-10 0 5 5 0 0 1 10 0Z" />
    </svg>


    <span class="sr-only">Filtro</span>
  </button>

  @if($isOpen)
  {{-- Modal --}}
  <div aria-hidden="true"
    class="bg-gray-600 bg-opacity-50 overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 z-50 justify-center items-center w-full md:inset-0 h-[calc(100%-1rem)] flex"
    aria-modal="true" aria-hidden="false" role="dialog">
    <div class="relative w-full h-full max-w-5xl p-4 md:h-auto">
      <div
        class="bg-gray-600 bg-opacity-50 overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 z-50 justify-center w-full md:inset-0 h-modal md:h-full flex">
        <div class="relative w-full h-full p-4 md:max-w-5xl md:h-auto">

          <!-- Modal content -->
          <div class="relative p-4 bg-white rounded-lg shadow dark:bg-gray-800 sm:p-5">
            <!-- Modal header -->
            <div class="flex items-center justify-between pb-4 mb-4 border-b rounded-t sm:mb-5 dark:border-gray-600">
              <div>
                <h3 class="text-base text-gray-700 dark:text-white">
                  Creando Sesión
                </h3>
                <div class="text-sm font-semibold">
                  {{ \Carbon\Carbon::parse($fecha_atencion)->format('d/m/Y') }}
                </div>
              </div>
              <x-button-modal-close wire:click="closeModal" />
            </div>
            <form wire:submit.prevent="save">
              <div class="grid gap-4 mb-4 sm:grid-cols-3">
                <div>
                  <label class="block text-sm font-medium text-gray-900 dark:text-white"> Paciente</label>
                  <div class="relative">
                    <div class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
                        stroke="currentColor" class="w-6 h-6">
                        <path stroke-linecap="round" stroke-linejoin="round"
                          d="M19 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM4 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 0110.374 21c-2.331 0-4.512-.645-6.374-1.766z" />
                      </svg>
                    </div>
                    <select required wire:model.defer="paciente"
                      class="bg-gray-50 border border-gray-300 text-gray-900 text-sm pl-10 pr-4 rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500">
                      <option>
                        ---selecciona---
                      </option>
                      @foreach ($pacientes as $paciente)
                      <option class="uppercase" value="{{ $paciente->paciente->id }}">
                        {{ $paciente->paciente->name }}
                        {{ $paciente->paciente->last_name }}
                      </option>
                      @endforeach
                    </select>
                  </div>
                  @error('paciente')
                  <p class="mt-2 text-sm text-red-600 dark:text-red-500">
                    {{ $message }}.
                  </p>
                  @enderror
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-900 dark:text-white">
                    Tipo de
                    Atención</label>
                  <div class="relative">
                    <div class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <svg class="w-6 h-6 text-gray-800 dark:text-white" aria-hidden="true"
                        xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                        <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                          d="M10 3v4a1 1 0 0 1-1 1H5m8-2h3m-3 3h3m-4 3v6m4-3H8M19 4v16a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V7.914a1 1 0 0 1 .293-.707l3.914-3.914A1 1 0 0 1 9.914 3H18a1 1 0 0 1 1 1ZM8 12v6h8v-6H8Z" />
                      </svg>

                    </div>
                    <select required wire:model.defer="tipo_atencion"
                      class="bg-gray-50 border border-gray-300 text-gray-900 text-sm pl-10 pr-4 rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500">
                      <option>
                        ---selecciona---
                      </option>
                      @foreach ($tipo_atenciones as $tipo_atencion)
                      <option class="uppercase" value="{{ $tipo_atencion->id }}">
                        {{ $tipo_atencion->name }}
                      </option>
                      @endforeach
                    </select>
                  </div>
                  @error('tipo_atencion')
                  <p class="mt-2 text-sm text-red-600 dark:text-red-500">
                    {{ $message }}.
                  </p>
                  @enderror
                </div>

                <div>

                  {{-- <x-input-field label="Fecha de la atención" name="fecha_atencion" type="date"
                    wire:model.defer="fecha_atencion" placeholder="" readonly>

                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor"
                      class="bi bi-hospital" viewBox="0 0 16 16">
                      <path
                        d="M10.854 7.146a.5.5 0 0 1 0 .708l-3 3a.5.5 0 0 1-.708 0l-1.5-1.5a.5.5 0 1 1 .708-.708L7.5 9.793l2.646-2.647a.5.5 0 0 1 .708 0z" />
                      <path
                        d="M3.5 0a.5.5 0 0 1 .5.5V1h8V.5a.5.5 0 0 1 1 0V1h1a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V3a2 2 0 0 1 2-2h1V.5a.5.5 0 0 1 .5-.5zM1 4v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V4H1z" />
                    </svg>

                  </x-input-field> --}}
                  {{-- @error('fecha_atencion')
                  <p class="text-sm text-red-600 dark:text-red-500">
                    {{ $message }}.
                  </p>
                  @enderror --}}
                </div>
              </div>

              <label for="message" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Tu
                comentario</label>
              <textarea id="message" rows="4" wire:model.defer="mensaje"
                class="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                placeholder="Escriba si hay detalles importantes..."></textarea>
              @error('mensaje')
              <p class="text-sm text-red-600 dark:text-red-500">
                {{ $message }}.
              </p>
              @enderror

              <hr>
              <div class="mt-5">

                <x-button-update wire:loading.remove wire:click="save" wire:target="save" innerText="Guardar" />


                <x-button-loading wire:loading wire:target="save" innerText="Guardando" />
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
  @endif
</div>