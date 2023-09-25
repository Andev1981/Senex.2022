<div>
    <div class="bg-gray-600 bg-opacity-50 overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 z-50 justify-center w-full md:inset-0 h-modal md:h-full flex">
        <div class="relative w-full h-full p-4 md:max-w-7xl md:h-auto">

            <!-- Modal content -->
            <div class="relative h-screen p-4 bg-white rounded-lg shadow dark:bg-gray-800 sm:p-5">
                <!-- Modal header -->
                <div class="flex items-center justify-between pb-4 mb-4 border-b rounded-t sm:mb-5 dark:border-gray-600">
                    <h3 class="text-lg font-semibold text-gray-700 dark:text-white">
                        Pagos Paciente
                    </h3>

                    <a href="{{ route('pacientes.pagos') }}" type="button" class="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center dark:hover:bg-gray-600 dark:hover:text-white">
                        <svg aria-hidden="true" class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                            <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path>
                        </svg>
                        <span class="sr-only">Close</span>
                    </a>

                </div>
                <div>
                    <div class="grid gap-4 mb-4 sm:grid-cols-3">
                        <div class="flex items-center shadow-lg rounded-xl">
                            <div class="pl-5 font-medium dark:text-white py-4">
                                <div>
                                    {{ $paciente->name .' '.  $paciente->last_name }}
                                </div>
                                <div class="text-sm text-gray-500 dark:text-gray-400">
                                    {{ $paciente->email }}
                                </div>
                            </div>
                        </div>
                        <div class="flex items-center shadow-lg rounded-xl">
                            <div class="pl-5 font-medium dark:text-white py-4">
                                <div class="text-sm text-gray-500 dark:text-gray-400">Total Pagos
                                    @if($typePayment)
                                    @if ($typePayment->type_payment == 1)
                                    <span>(Pagos por Sesión)</span>
                                    @elseif ($typePayment->type_payment == 2)
                                    <span>(Pago por tratamiento)</span>
                                    @elseif ($typePayment->type_payment == 3)
                                    <span>(Pago por tratamiento)</span>
                                    @endif
                                    @endisset
                                </div>
                                <div>
                                    Pagado ${{ number_format($totalAtendidas,0,',','.') }}.- de un total de $ {{ number_format($totalAtenciones,0,',','.') }}.-
                                </div>
                                <div>
                                    @if ($totalAtenciones < $totalAtendidas) <span class="inline-flex items-center bg-red-100 text-red-800 text-xs font-medium mr-2 px-2.5 py-0.5 rounded-full dark:bg-red-900 dark:text-red-300">
                                        <span class="w-3 h-2 mr-1 bg-red-500 rounded-full"></span>
                                        - ${{ number_format($totalAtendidas-$totalAtenciones,0,',','.') }}.-
                                        </span>
                                        @elseif ($totalAtenciones == $totalAtendidas)
                                        <span class="inline-flex items-center bg-teal-100 text-teal-800 text-xs font-medium mr-2 px-2.5 py-0.5 rounded-full dark:bg-teal-900 dark:text-teal-300">
                                            <span class="w-2 h-2 mr-1 text-white bg-teal-500 rounded-full"></span>
                                            OK
                                        </span>
                                        @endif
                                </div>
                            </div>
                        </div>
                        <div class="flex items-center shadow-lg rounded-xl">
                            <div class="pl-5 font-medium dark:text-white py-4">
                                <div class="text-sm text-gray-500 dark:text-gray-400">Total Sesiones Pagadas</div>
                                <div>
                                    {{ $countSuma }} de {{ $itemsSuma }}
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="grid grid-flow-row-dense grid-cols-6">
                        <div class="col-span-1">
                        {{ $month }}
                            <ul class="w-48 text-sm font-medium text-gray-900 bg-white border border-gray-200 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                                <li class="mb-3">
                                    <select id="countries" wire:model="year" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500">
                                    <option class="pl-6" value="2023">2023</option>
                                    <option class="pl-6" value="2024">2024</option>
                                    </select>

                                </li>
                                <li class="w-full border-b border-gray-200 rounded-t-lg dark:border-gray-600">
                                    <div class="flex items-center pl-3">
                                        <input wire:click="$set($month,'01')" id="list-radio-license" type="radio" value="01" name="list-radio" class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-700 dark:focus:ring-offset-gray-700 focus:ring-2 dark:bg-gray-600 dark:border-gray-500" 
                                        @if ($month == "01")
                                            checked="checked"    
                                        @endif>
                                        <label for="list-radio-license" class="w-full py-1 ml-2 text-sm font-medium text-gray-900 dark:text-gray-300">Enero</label>
                                    </div>
                                </li>
                                <li class="w-full border-b border-gray-200 rounded-t-lg dark:border-gray-600">
                                    <div class="flex items-center pl-3">
                                        <input id="list-radio-id" type="radio" value="02" name="list-radio" class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-700 dark:focus:ring-offset-gray-700 focus:ring-2 dark:bg-gray-600 dark:border-gray-500"
                                         @if ($month == "02")
                                            checked="checked"    
                                        @endif>
                                        <label for="list-radio-id" class="w-full py-1 ml-2 text-sm font-medium text-gray-900 dark:text-gray-300">Febrero</label>
                                    </div>
                                </li>
                                <li class="w-full border-b border-gray-200 rounded-t-lg dark:border-gray-600">
                                    <div class="flex items-center pl-3">
                                        <input id="list-radio-millitary" type="radio" value="03" name="list-radio" class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-700 dark:focus:ring-offset-gray-700 focus:ring-2 dark:bg-gray-600 dark:border-gray-500"
                                         @if ($month == "03")
                                            checked="checked"    
                                        @endif>
                                        <label for="list-radio-millitary" class="w-full py-1 ml-2 text-sm font-medium text-gray-900 dark:text-gray-300">Marzo</label>
                                    </div>
                                </li>
                                <li class="w-full border-b border-gray-200 rounded-t-lg dark:border-gray-600">
                                    <div class="flex items-center pl-3">
                                        <input id="list-radio-passport" type="radio" value="04" name="list-radio" class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-700 dark:focus:ring-offset-gray-700 focus:ring-2 dark:bg-gray-600 dark:border-gray-500"
                                         @if ($month == "04")
                                            checked="checked"    
                                        @endif>
                                        <label for="list-radio-passport" class="w-full py-1 ml-2 text-sm font-medium text-gray-900 dark:text-gray-300">Abril</label>
                                    </div>
                                </li>
                                <li class="w-full border-b border-gray-200 rounded-t-lg dark:border-gray-600">
                                    <div class="flex items-center pl-3">
                                        <input id="list-radio-passport" type="radio" value="05" name="list-radio" class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-700 dark:focus:ring-offset-gray-700 focus:ring-2 dark:bg-gray-600 dark:border-gray-500"
                                         @if ($month == "05")
                                            checked="checked"    
                                        @endif>
                                        <label for="list-radio-passport" class="w-full py-1 ml-2 text-sm font-medium text-gray-900 dark:text-gray-300">Mayo</label>
                                    </div>
                                </li>
                                <li class="w-full border-b border-gray-200 rounded-t-lg dark:border-gray-600">
                                    <div class="flex items-center pl-3">
                                        <input id="list-radio-passport" type="radio" value="06" name="list-radio" class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-700 dark:focus:ring-offset-gray-700 focus:ring-2 dark:bg-gray-600 dark:border-gray-500"
                                         @if ($month == "06")
                                            checked="checked"    
                                        @endif>
                                        <label for="list-radio-passport" class="w-full py-1 ml-2 text-sm font-medium text-gray-900 dark:text-gray-300">Junio</label>
                                    </div>
                                </li>
                                <li class="w-full border-b border-gray-200 rounded-t-lg dark:border-gray-600">
                                    <div class="flex items-center pl-3">
                                        <input id="list-radio-passport" type="radio" value="07" name="list-radio" class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-700 dark:focus:ring-offset-gray-700 focus:ring-2 dark:bg-gray-600 dark:border-gray-500"
                                         @if ($month == "07")
                                            checked="checked"    
                                        @endif>
                                        <label for="list-radio-passport" class="w-full py-1 ml-2 text-sm font-medium text-gray-900 dark:text-gray-300">Julio</label>
                                    </div>
                                </li>
                                <li class="w-full border-b border-gray-200 rounded-t-lg dark:border-gray-600">
                                    <div class="flex items-center pl-3">
                                        <input id="list-radio-passport" type="radio" value="08" name="list-radio" class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-700 dark:focus:ring-offset-gray-700 focus:ring-2 dark:bg-gray-600 dark:border-gray-500" 
                                         @if ($month == "08")
                                            checked="checked"    
                                        @endif>
                                        <label for="list-radio-passport" class="w-full py-1 ml-2 text-sm font-medium text-gray-900 dark:text-gray-300">Agosto</label>
                                    </div>
                                </li>
                                <li class="w-full border-b border-gray-200 rounded-t-lg dark:border-gray-600">
                                    <div class="flex items-center pl-3">
                                        <input id="list-radio-passport" type="radio" value="09" name="list-radio" class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-700 dark:focus:ring-offset-gray-700 focus:ring-2 dark:bg-gray-600 dark:border-gray-500"
                                         @if ($month == "09")
                                            checked="checked"    
                                        @endif>
                                        <label for="list-radio-passport" class="w-full py-1 ml-2 text-sm font-medium text-gray-900 dark:text-gray-300">Septiembre</label>
                                    </div>
                                </li>
                                <li class="w-full border-b border-gray-200 rounded-t-lg dark:border-gray-600">
                                    <div class="flex items-center pl-3">
                                        <input id="list-radio-passport" type="radio" value="10" name="list-radio" class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-700 dark:focus:ring-offset-gray-700 focus:ring-2 dark:bg-gray-600 dark:border-gray-500" 
                                         @if ($month == "10")
                                            checked="checked"    
                                        @endif>
                                        <label for="list-radio-passport" class="w-full py-1 ml-2 text-sm font-medium text-gray-900 dark:text-gray-300">Octubre</label>
                                    </div>
                                </li>
                                <li class="w-full border-b border-gray-200 rounded-t-lg dark:border-gray-600">
                                    <div class="flex items-center pl-3">
                                        <input id="list-radio-passport" type="radio" value="11" name="list-radio" class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-700 dark:focus:ring-offset-gray-700 focus:ring-2 dark:bg-gray-600 dark:border-gray-500" 
                                         @if ($month == "11")
                                            checked="checked"    
                                        @endif>
                                        <label for="list-radio-passport" class="w-full py-1 ml-2 text-sm font-medium text-gray-900 dark:text-gray-300">Noviembre</label>
                                    </div>
                                </li>
                                <li class="w-full border-b border-gray-200 rounded-t-lg dark:border-gray-600">
                                    <div class="flex items-center pl-3">
                                        <input id="list-radio-passport" type="radio" value="12" name="list-radio" class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-700 dark:focus:ring-offset-gray-700 focus:ring-2 dark:bg-gray-600 dark:border-gray-500" 
                                         @if ($month == "12")
                                            checked="checked"    
                                        @endif>
                                        <label for="list-radio-passport" class="w-full py-1 ml-2 text-sm font-medium text-gray-900 dark:text-gray-300">Diciembre</label>
                                    </div>
                                </li>
                            </ul>

                        </div>
                        <div class="col-span-5">

                            <div>
                                <table class="w-full text-sm text-gray-500 dark:text-gray-400">
                                    <thead class="text-xs text-gray-700 uppercase bg-teal-100 dark:bg-gray-700 dark:text-gray-400 py-4">
                                        <tr class="">
                                            <th scope="col" class="px-6 py-3">Fecha&nbsp;Atención</th>
                                            <th scope="col" class="px-6 py-3">Kine</th>
                                            <th scope="col" class="px-6 py-3">Estado</th>

                                            <th scope="col" class="px-6 py-3">Tipo&nbsp;de&nbsp;Atención</th>
                                            <th scope="col" class="px-6 py-3">N°</th>
                                            <th scope="col" class="px-6 py-3">Valor</th>

                                            <th scope="col" class="px-6 py-3">Pagos</th>

                                            <th scope="col" class="px-6 py-3">
                                                <span class="sr-only">Actions</span>
                                                <div class="justify-items-end">



                                                </div>

                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        @forelse ($applyItems as $applyItem)

                                        <tr class="uppercase bg-white border-b dark:border-gray-700 hover:bg-cyan-50">
                                            <td class="px-6 py-4">
                                                @if ($applyItem->fecha_atencion)
                                                {{ \Carbon\Carbon::parse(strtotime($applyItem->fecha_atencion))->format('d/m/Y') }}

                                                @else
                                                ---------
                                                @endif
                                            </td>
                                            <td class="py-2 pl-2 mx-2">

                                                {{ $applyItem->doctor->name ?? '' }}
                                                {{ $applyItem->doctor->last_name ?? '' }}

                                            </td>
                                            <td class="px-6 py-4">
                                                @if ($applyItem->status == 0)
                                                <span class="inline-flex items-center bg-yellow-100 text-yellow-800 text-xs font-medium mr-2 px-2.5 py-0.5 rounded-full dark:bg-yellow-900 dark:text-yellow-300">
                                                    <span class="w-2 h-2 mr-1 bg-yellow-500 rounded-full"></span>
                                                    Pendiente
                                                </span>
                                                @elseif ($applyItem->status == 1)
                                                <span class="inline-flex items-center bg-teal-100 text-teal-800 text-xs font-medium mr-2 px-2.5 py-0.5 rounded-full dark:bg-teal-900 dark:text-teal-300">
                                                    <span class="w-2 h-2 mr-1 text-white bg-teal-500 rounded-full"></span>
                                                    Atendida
                                                </span>
                                                @elseif ($applyItem->status == 2)
                                                <span class="inline-flex items-center bg-red-100 text-red-800 text-xs font-medium mr-2 px-2.5 py-0.5 rounded-full dark:bg-red-900 dark:text-red-300">
                                                    <span class="w-2 h-2 mr-1 text-white bg-red-500 rounded-full"></span>
                                                    Cancelada
                                                </span>

                                                @elseif ($applyItem->status == 3)
                                                <span class="inline-flex items-center bg-gray-100 text-gray-800 text-xs font-medium mr-2 px-2.5 py-0.5 rounded-full dark:bg-gray-900 dark:text-gray-300">
                                                    <span class="w-2 h-2 mr-1 text-white bg-gray-500 rounded-full"></span>
                                                    Reagendada
                                                </span>
                                                @endif

                                            </td>

                                            <td class="px-6 py-4 uppercase">
                                                @if ($applyItem->applicationType)

                                                {{$applyItem->applicationType->name }}
                                                @else
                                                ---------
                                                @endif
                                            </td>
                                            <td class="px-6 py-4 uppercase">
                                                @if ($applyItem->numero_sesion > 0)

                                                {{$applyItem->numero_sesion }}
                                                @else
                                                ---------
                                                @endif
                                            </td>
                                            <td class="px-6 py-4">

                                                @if ($applyItem->price)

                                                ${{ number_format($applyItem->price,0,',','.') }}.-
                                                @else
                                                ---------
                                                @endif

                                            </td>
                                            <td class="px-6 py-4 uppercase">
                                                @if ($applyItem->payment->status == 2)

                                                ${{ number_format($applyItem->payment->pay,0,',','.') }}.-
                                                @else
                                                ---------
                                                @endif
                                            </td>

                                            <td class="px-6 py-4">


                                                @livewire('paciente.pagos.modal-pago', ['item' => $applyItem], key($applyItem->id))

                                            </td>
                                        </tr>

                                        @empty
                                        <tr>
                                            <td>
                                                Sin datos
                                            </td>
                                        </tr>

                                        @endforelse


                                    </tbody>
                                </table>
                            </div>
                            <div class="mb-5">

                                {{ $applyItems->links() }}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>