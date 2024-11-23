<div>
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

                                    <option selected value="2023">2023</option>
                                    <option value="2024">2024</option>
                                    <option value="2025">2025</option>
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
                                    <option value="00">Año Completo</option>
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
                                {{-- <select
                                    class="block w-full p-1 ml-4 text-xs text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                    wire:model="selPaciente">
                                    <option value="0">
                                        <span class="text-gray-500">--paciente--</span>
                                    </option>
                                    @foreach ($pacientes as $paciente)
                                    <option value="{{ $paciente->id }}">
                                        {{ $paciente->name }}&nbsp;{{ $paciente->last_name }}</option>
                                    @endforeach
                                </select> --}}
                            </th>

                            <th scope="col">
                                <button wire:click="searchByItems" type="button"
                                    class="inline-flex items-center px-2 py-1 ml-5 text-sm font-medium text-center text-white rounded-lg bg-sky-700 hover:bg-sky-800 focus:ring-4 focus:outline-none focus:ring-sky-300 dark:bg-sky-600 dark:hover:bg-sky-700 dark:focus:ring-sky-800">Buscar</button>
                            </th>
                            <th></th>
                            <th scope="col" class="text-right">

                            </th>

                        </tr>
                    </thead>
                    <thead class="pt-5 text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                        <tr class="text-center">
                            <th scope="col" class="px-6 py-3">Paciente</th>
                            <th scope="col" class="px-6 py-3">Kine</th>
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
                            </td>
                            <td scope="row"
                                class="px-1 py-1 text-gray-900 font-sm text-['9px'] whitespace-nowrap dark:text-white">
                                {{ $applyItem->doctor->name ?? '' }}
                                {{ $applyItem->doctor->last_name ?? '' }}
                            </td>
                            <td class="px-1 py-1">
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

                                @forelse ($applyItem->doctor->applyTypes as $kineValue)
                                @if ($kineValue->application_type_id == $applyItem->application_type_id)
                                ${{ number_format($kineValue->price, 0, ',', '.') ?? '0' }}.-
                                @endif

                                @empty
                                Sin Datos
                                @endforelse

                            </td>
                            <td>
                                @forelse ($applyItem->doctor->applyTypes as $kineValue)
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
                            <td colspan="4">
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
                                <a href="reporte-pdf/{{ $this->buscarFecha }}/{{ $this->kine->id }}" target="_blank"
                                    type="button"
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