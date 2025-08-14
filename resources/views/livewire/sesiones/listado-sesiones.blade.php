<section class="p-2 dark:bg-gray-900 sm:p-5">
    <div class="max-w-screen-xl px-1 mx-auto lg:px-2">
        <div class="relative overflow-hidden bg-white shadow-md dark:bg-gray-800 sm:rounded-lg">
            <div
                class="flex flex-row items-center justify-between w-full p-4 align-middle md:flex-row md:space-y-0 md:space-x-4">
                <div class="flex items-center">
                    <img src="{{ asset('icons/libro-medico.gif') }}" alt="" class="w-10 h-10">
                    <label class="text-lg font-semibold">Sesiones</label>
                </div>
                <div
                    class="flex justify-end flex-shrink-0 w-full space-y-2 md:w-auto md:flex-row md:space-y-0 md:items-center md:space-x-3">
                </div>
            </div>

            <div class="max-w-screen-xl px-1 mx-auto lg:px-2">
                <div class="relative overflow-hidden bg-white shadow-md dark:bg-gray-800 sm:rounded-lg">

                    <div class="flex flex-row items-center p-4 bg-slate-200 md:flex-row md:space-y-0 md:space-x-4">
                        <select
                            class="block w-full p-1 ml-4 text-xs text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                            wire:model="year">

                            <option value="2023">2023</option>
                            <option selected value="2024">2024</option>
                            <option value="2025">2025</option>
                            <option value="2026">2026</option>
                            <option value="2028">2028</option>
                            <option value="2029">2029</option>
                            <option value="2030">2030</option>
                        </select>
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

                        {{-- <select
                            class="block w-full p-1 ml-4 text-xs text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                            wire:model="sort">
                            <option value="created_at">Fecha&nbsp;Creación</option>
                            <option value="fecha_atencion">Fecha&nbsp;Atención</option>
                        </select> --}}
                        <select
                            class="block w-full p-1 ml-4 text-xs text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                            wire:model="dia">
                            <option value='0'>
                                <span class="text-gray-500">--Día--</span>
                            </option>
                            @foreach ($dias as $dia)

                            <option value='{{$dia}}'>{{$dia}}</option>
                            @endforeach
                        </select>
                        <select
                            class="block w-full p-1 ml-4 text-xs text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                            wire:model="selPaciente">
                            <option value='0'>
                                <span class="text-gray-500">--paciente--</span>
                            </option>
                            @foreach ($pacientes as $paciente)

                            <option value='{{$paciente->id}}'>{{$paciente->name}}&nbsp;{{$paciente->last_name}}</option>
                            @endforeach
                        </select>
                        <select
                            class="block w-full p-1 ml-4 text-xs text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                            wire:model="selKine">
                            <option value='0'>
                                <span class="text-gray-500">--kine--</span>
                            </option>
                            @foreach ($kines as $kine)

                            <option value='{{$kine->id}}'>{{$kine->name}}&nbsp;{{$kine->last_name}}</option>
                            @endforeach
                        </select>
                        <select
                            class="block w-full p-1 ml-4 text-xs text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                            wire:model="quantity">
                            <option value="5">5</option>
                            <option value="10">10</option>
                            <option value="15">15</option>
                            <option value="20">20</option>
                            <option value="30">30</option>
                            <option value="40">40</option>
                            <option value="50">50</option>
                        </select>
                    </div>

                    <div class="p-5 border border-gray-200 rounded-b-xl dark:border-gray-700 dark:bg-gray-900">
                        <div class="flex">
                            <table class="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                                <thead
                                    class="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                                    <tr class="text-center">
                                        <th colspan="1" class="px-3 py-2">
                                            <span class="sr-only">Actions</span>
                                        </th>
                                        <th scope="col" class="px-4 py-3">
                                            #
                                        </th>
                                        <th scope="col" class="px-4 py-3">
                                            Fecha&nbsp;Atención
                                        </th>
                                        <th scope="col" class="px-4 py-3">Paciente</th>
                                        <th scope="col" class="px-4 py-3">Kine</th>
                                        <th scope="col" class="px-4 py-3">Tipo</th>

                                        <th scope="col" class="px-4 py-3">Valor&nbsp;Paciente</th>
                                        <th scope="col" class="px-4 py-3">
                                            Estado
                                        </th>

                                    </tr>
                                </thead>
                                <tbody>
                                    @forelse ($applyItems as $applyItem)

                                    <tr
                                        class="text-center uppercase bg-white border-b dark:border-gray-700 hover:bg-cyan-50">
                                        <td>
                                            @livewire('sesiones.editar-sesion', ['applyItem' =>
                                            $applyItem], key($applyItem->id))
                                        


                                        </td>
                                        <td class="px-1 py-1">
                                            {{ $applyItem->numero_sesion }}
                                        </td>
                                        <td class="px-1 py-1">{{
                                            \Carbon\Carbon::parse(strtotime($applyItem->fecha_atencion))->format('d/m/Y')
                                            ?? ''}}</td>
                                        <td scope="row"
                                            class="px-1 py-1 text-gray-900 font-sm text-['9px'] whitespace-nowrap dark:text-white">
                                            {{ $applyItem->patient_name ?? '' }} {{ $applyItem->patient_last_name ??
                                            '' }}
                                        </td>
                                        <td scope="row"
                                            class="px-1 py-1 text-gray-900 font-sm text-['9px'] whitespace-nowrap dark:text-white">
                                            {{ $applyItem->doctor_name ?? '' }} {{ $applyItem->doctor_last_name ?? ''
                                            }}
                                        </td>

                                        <td class="px-1 py-1">
                                            {{ $applyItem->type_name ?? '' }}
                                        </td>

                                        <td class="px-1 py-1">
                                            ${{ number_format($applyItem->price,0,',','.') }}.-
                                        </td>


                                        <td class="flex px-1 py-1">


                                            @if ($applyItem->status === 0 )
                                            Pendiente
                                            @elseif($applyItem->status == 1)
                                            Atendido
                                            @elseif($applyItem->status == 2)
                                            Cancelado
                                            @elseif($applyItem->status == 3)
                                            Reagendado
                                            @endif

                                        </td>

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

                </div>
            </div>
            <nav class="flex flex-col items-start justify-between p-4 space-y-3 md:flex-row md:items-center md:space-y-0"
                aria-label="Table navigation">
                {{ $applyItems->links() }}
            </nav>
        </div>
    </div>
</section>