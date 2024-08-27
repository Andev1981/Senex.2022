<div>
  <!-- Modal content -->
  <div class="relative p-4 bg-white rounded-lg shadow dark:bg-gray-800 sm:p-5">
    <!-- Modal header -->

    <div class="flex items-center justify-between pb-2 mb-2 border-b rounded-t sm:mb-2 dark:border-gray-600">
      <div class="justify-start">
        <span class="text-base text-gray-700">{{ $kine->name }}&nbsp;{{ $kine->last_name }}</span>
        <h4 class="text-xs font-semibold text-gray-500 dark:text-white">
          Mis Atenciones
        </h4>
      </div>
      <livewire:kinesiologos.nueva-atencion />
    </div>
    {{-- Filtro --}}
    <div class="flex items-center pb-2">
      <select
        class="block w-full p-1 text-xs text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
        wire:model="year">

        <option selected value="2023">2023</option>
        <option value="2024">2024</option>
        <option value="2025">2025</option>
        <option value="2026">2026</option>
        <option value="2028">2028</option>
        <option value="2029">2029</option>
        <option value="2030">2030</option>
      </select>
      <select
        class="block w-full p-1 text-xs text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
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

      <select
        class="block w-full p-1 text-xs text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
        wire:model="dia">
        <option value='0'>
          <span class="text-gray-500">--Todos los días--</span>
        </option>
        @foreach ($dias as $dia)
        <option value='{{$dia}}'>{{$dia}}</option>
        @endforeach
      </select>

      <select
        class="block w-full p-1 text-xs text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
        wire:model="selPaciente">
        <option value="0">
          <span class="text-gray-500">--paciente--</span>
        </option>
        @foreach ($pacientes as $paciente)
        <option value="{{ $paciente->paciente->id }}">
          {{ $paciente->paciente->name }}&nbsp;{{ $paciente->paciente->last_name }}</option>
        @endforeach
      </select>
    </div>
    <hr>
    <div>
      <div class="py-2 mb-2 border-b rounded-t sm:mb-2 dark:border-gray-600">
        <table class="w-full text-sm text-left text-gray-500 dark:text-gray-400">
          <thead class="pt-5 text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
            <tr class="text-center">

            </tr>
          </thead>
          <tbody>
            @forelse ($applyItems as $applyItem)

            <tr class="bg-white border-b dark:border-gray-700 hover:bg-cyan-50">
              <td class="px-1 py-2 text-gray-900 font-sm text-['9px'] whitespace-nowrap dark:text-white">
                <div>
                  <div class="flex justify-between">
                    <div>
                      <div class="text-sm font-bold text-gray-800">
                        {{ $applyItem->patient->name ?? '' }}
                        {{ $applyItem->patient->last_name ?? '' }}
                      </div>
                      <div class="text-xs text-gray-500">
                        {{ $applyItem->applicationType->name ?? '' }}
                        #{{ $applyItem->numero_sesion ?? '' }}
                      </div>
                    </div>

                    <div class="text-right">
                      <div>
                        <livewire:kinesiologos.atencion-detalle :applyItem="$applyItem" :key="time().$applyItem->id">
                      </div>
                      <div class="pt-1 text-xs text-gray-500">
                        {{
                        \Carbon\Carbon::parse(strtotime($applyItem->fecha_atencion))->format('d/m/Y')
                        ?? '' }}
                      </div>
                    </div>
                  </div>
                  <div>

                  </div>

                </div>

              </td class="px-1 py-1">
            </tr>

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
    <div>
      {{-- Seccion de resumen --}}
      @if (count($applyItems) > 0)
      <div class="items-center justify-center w-full text-center">
        <span class="py-2 text-sm font-semibold text-slate-900">
          Atenciones : {{ count($applyItems) }}
        </span>
      </div>
      <div class="items-center justify-center w-full text-center">
        <span class="py-2 text-sm font-semibold text-slate-900">
          Total: ${{ number_format($totalKine, 0, ',', '.') ?? '0' }}.-
        </span>
      </div>

      @if ($totalKine > 0)
      <a href="reporte-pdf/{{ $this->buscarFecha }}/{{ $this->kine->id }}" target="_blank" type="button"
        class="inline-flex items-center px-2 py-1 my-2 ml-5 text-sm font-medium text-center text-white rounded-lg bg-sky-700 hover:bg-sky-800 focus:ring-4 focus:outline-none focus:ring-sky-300 dark:bg-sky-600 dark:hover:bg-sky-700 dark:focus:ring-sky-800">Pdf</a>
      @endif

      @endif
    </div>
  </div>
</div>