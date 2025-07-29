<div>
  <div>
    @if ($status === 1)
    <button wire:click="openModal" type="button"
      class="flex items-center gap-1 px-2 py-1 text-sm font-medium text-center text-gray-900 bg-white border border-gray-200 rounded-lg focus:outline-none hover:bg-gray-100 hover:text-primary-700 focus:z-10 focus:ring-4 focus:ring-gray-200 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700"
      type="button">
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
        class="icon icon-tabler icons-tabler-outline icon-tabler-list-check">
        <path stroke="none" d="M0 0h24v24H0z" fill="none" />
        <path d="M3.5 5.5l1.5 1.5l2.5 -2.5" />
        <path d="M3.5 11.5l1.5 1.5l2.5 -2.5" />
        <path d="M3.5 17.5l1.5 1.5l2.5 -2.5" />
        <path d="M11 6l9 0" />
        <path d="M11 12l9 0" />
        <path d="M11 18l9 0" />
      </svg>
      Atenciones
    </button>
    @endif
  </div>

  @if ($isOpen)
  <!-- Main modal -->
  <div
    class="bg-gray-600 bg-opacity-50 overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 z-50 justify-center items-center w-full md:inset-0 h-[calc(100%-1rem)] flex"
    aria-modal="true" aria-hidden="false" role="dialog">
    <div class="relative w-full h-full p-4 max-w-7xl">

      <!-- Modal content -->
      <div class="relative p-4 bg-white rounded-lg shadow dark:bg-gray-800 sm:p-5">
        <!-- Modal header -->

        <div class="flex items-center justify-between pb-2 mb-2 border-b rounded-t sm:mb-2 dark:border-gray-600">
          <div class="justify-start">
            <span class="text-base text-gray-700">{{ $kine->name }}&nbsp;{{ $kine->last_name }}</span>
            <h4 class="text-xs font-semibold text-gray-500 dark:text-white">
              Resumen Mensual Atenciones Kine
            </h4>
            {{ $selPaciente }}
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
        <div>
          <div class="flex items-center justify-between pb-2 mb-2 border-b rounded-t sm:mb-2 dark:border-gray-600">
            <table class="w-full text-sm text-left text-gray-500 dark:text-gray-400">
              <thead class="pb-5">
                <tr class="px-2 py-5 text-xs text-gray-700 uppercase dark:bg-gray-700 dark:text-gray-400">
                  <th scope="col" colspan="2">
                    <select
                      class="block w-full p-1 ml-4 text-xs text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                      wire:model="year">
                      <option value="2024">2024</option>
                      <option selected value="2025">2025</option>
                      <option value="2026">2026</option>
                      <option value="2028">2028</option>
                      <option value="2029">2029</option>
                      <option value="2030">2030</option>
                    </select>
                  </th>
                  <th scope="col" colspan="2">
                    <select
                      class="block w-full p-1 ml-4 text-xs text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                      wire:model="month">
                      <option value="01">Enero</option>
                      <option value="02">Febrero</option>
                      <option value="03">Marzo</option>
                      <option value="04">Abril</option>
                      <option value="05">Mayo</option>
                      <option value="06">Junio</option>
                      <option value="07">Julio</option>
                      <option value="08">Agosto</option>
                      <option value="09">Septiembre</option>
                      <option value="10">Octubre</option>
                      <option value="11">Noviembre</option>
                      <option value="12">Diciembre</option>
                    </select>
                  </th>

                  <th scope="col" colspan="2">
                    <select
                      class="block w-full p-1 ml-4 text-xs text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                      wire:model="selPaciente">
                      <option value="0">
                        <span class="text-gray-500">--paciente--</span>
                      </option>
                      @foreach ($pacientes as $paciente)
                      <option value="{{ $paciente->id }}">
                        {{ $paciente->name }}&nbsp;{{ $paciente->last_name }}</option>
                      @endforeach
                    </select>
                  </th>

                  <th scope="col">
                    <button wire:click="searchByItems" type="button"
                      class="inline-flex items-center px-2 py-1 ml-5 text-sm font-medium text-center text-white rounded-lg bg-sky-700 hover:bg-sky-800 focus:ring-4 focus:outline-none focus:ring-sky-300 dark:bg-sky-600 dark:hover:bg-sky-700 dark:focus:ring-sky-800">Buscar</button>
                  </th>
                  <th></th>
                  <th scope="col" class="text-right">
                    @livewire('kine.values-kine', ['doctor' => $kine])
                  </th>

                </tr>
              </thead>
              <thead class="pt-5 text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                <tr class="text-center">
                  <th scope="col" class="px-6 py-3">Paciente</th>
                  <th scope="col" class="px-6 py-3">Fecha</th>
                  <th scope="col" class="px-6 py-3">Tipo</th>
                  <th scope="col" class="px-6 py-3">N°&nbsp;Sesión</th>
                  <th scope="col" class="px-6 py-3">Valor&nbsp;Cliente</th>
                  <th scope="col" class="px-6 py-3">
                    Valor&nbsp;Kine
                  </th>
                  <th scope="col" class="px-6 py-3">
                    Resultado
                  </th>
                  <th scope="col" class="px-6 py-3">
                    Estado
                  </th>
                </tr>
              </thead>
              <tbody>
                @forelse ($applyItems as $applyItem)

                <tr class="text-center uppercase bg-white border-b dark:border-gray-700 hover:bg-cyan-50">
                  <td scope="row"
                    class="px-1 py-1 text-gray-900 font-sm text-['9px'] whitespace-nowrap dark:text-white">
                    {{ $applyItem->patient->name ?? '' }}
                    {{ $applyItem->patient->last_name ?? '' }}
                  </td class="px-1 py-1">
                  <td>
                    {{
                    \Carbon\Carbon::parse(strtotime($applyItem->fecha_atencion))->format('d/m/Y')
                    ?? '' }}
                  </td>

                  <td>
                    {{ $applyItem->applicationType->name ?? '' }}
                  </td>
                  <td class="px-1 py-1">{{ $applyItem->numero_sesion ?? '' }}</td>
                  <td class="px-1 py-1">
                    ${{ number_format($applyItem->price, 0, ',', '.') }}.-
                  </td>
                  <td class="px-1 py-1">
                    @forelse ($kineValues as $kineValue)
                    @if ($kineValue->application_type_id == $applyItem->application_type_id)
                    ${{ number_format($kineValue->price, 0, ',', '.') ?? '0' }}.-
                    @endif

                    @empty
                    Sin Datos
                    @endforelse

                  </td>
                  <td>
                    @forelse ($kineValues as $kineValue)
                    @if ($kineValue->application_type_id == $applyItem->application_type_id)
                    ${{ number_format($applyItem->price - $kineValue->price, 0, ',', '.') ??
                    '0' }}.-
                    @endif

                    @empty
                    Sin Datos
                    @endforelse


                  </td>
                  <td class="flex px-1 py-1">
                    @if ($applyItem)
                    @if ($applyItem->status === 0)
                    Pendiente
                    @elseif($applyItem->status === 1)
                    Atendido
                    @endif
                    @endif
                  </td>
                </tr>
                @if ($loop->last && $selPaciente == '')
                <tr class="text-center uppercase border-b dark:border-gray-700 hover:bg-cyan-50 bg-cyan-200">
                  <td colspan="3">
                    <span class="py-2 font-semibold text-slate-900">Totales</span>
                  </td>
                  <td>
                    <span class="py-2 text-sm font-semibold text-slate-900">
                      Total Atenciones : {{ count($applyItems) }}
                    </span>
                  </td>
                  <td class="py-2 font-semibold text-slate-900">
                    ${{ number_format($totalPacientes, 0, ',', '.') ?? '0' }}.-
                  </td>
                  <td class="py-3 font-semibold text-slate-900">
                    ${{ number_format($totalKine, 0, ',', '.') ?? '0' }}.-
                  </td>
                  <td class="py-3 font-semibold text-slate-900">
                    ${{ number_format($totalPacientes - $totalKine, 0, ',', '.') ?? '0' }}.-
                  </td>
                  <td class="flex py-2 font-semibold text-slate-900">
                    @if ($totalKine > 0)
                    <a href="reporte-pdf/{{ $this->buscarFecha }}/{{ $this->kine->id }}" target="_blank" type="button"
                      class="inline-flex items-center px-2 py-1 my-2 ml-5 text-sm font-medium text-center text-white rounded-lg bg-sky-700 hover:bg-sky-800 focus:ring-4 focus:outline-none focus:ring-sky-300 dark:bg-sky-600 dark:hover:bg-sky-700 dark:focus:ring-sky-800">Pdf</a>
                    @endif
                  </td>
                </tr>
                @endif
                @empty
                <tr class="text-center">
                  <td colspan="7" class="my-2">
                    Sin Datos
                  </td>
                </tr>
                @endforelse
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </div>
  @endif

</div>