<div>
    <div
        class="fixed top-0 left-0 right-0 z-50 flex justify-center w-full overflow-x-hidden overflow-y-auto bg-gray-600 bg-opacity-50 md:inset-0 h-modal md:h-full">
        <div class="relative w-full h-full p-4 md:max-w-7xl md:h-auto">

            <!-- Modal content -->
            <div class="relative h-screen p-4 bg-white rounded-lg shadow dark:bg-gray-800 sm:p-5">
                <!-- Modal header -->
                <div
                    class="flex items-center justify-between pb-2 mb-2 border-b rounded-t sm:mb-2 dark:border-gray-600">
                    <h3 class="text-lg font-semibold text-gray-700 dark:text-white">
                        Pagos Paciente
                    </h3>
                    @if (auth()->user()->email == 'javt1981@gmail.com')
                    {{ $items->count() }}|{{$itemsFechas->count()}}
                    @endif

                    <a wire:click="returRedirect" type="button"
                        class="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center dark:hover:bg-gray-600 dark:hover:text-white cursor-pointer">
                        <svg aria-hidden="true" class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"
                            xmlns="http://www.w3.org/2000/svg">
                            <path fill-rule="evenodd"
                                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                                clip-rule="evenodd"></path>
                        </svg>
                        <span class="sr-only">Close</span>
                    </a>

                </div>
                <div>
                    <div class="grid gap-4 mb-4 sm:grid-cols-2">
                        <div class="flex items-center shadow-lg rounded-xl">
                            <div class="py-4 pl-5 font-medium dark:text-white">
                                <div>
                                    {{ $paciente->name .' '. $paciente->last_name }}
                                </div>
                                <div class="text-sm text-gray-500 dark:text-gray-400">
                                    {{ $paciente->email }}
                                </div>
                            </div>
                        </div>
                        <div class="flex items-center shadow-lg rounded-xl">
                            <div class="pl-5 text-sm text-gray-500 dark:text-gray-400">
                                <div>
                                    @if($typePayment)

                                    <span
                                        class="inline-flex items-center bg-sky-100 text-sky-800 text-sm font-medium mr-2 px-2.5 py-0.5 rounded-full dark:bg-sky-900 dark:text-sky-300">
                                        Billetera Paciente
                                    </span>

                                    @endisset
                                </div>

                                <div class="flex items-between ">
                                    <div class="px-2 mt-2 mb-1 mr-2 text-sm text-white bg-green-500 rounded-full">
                                        Saldo a favor ${{ number_format($wallet->balance,0,',','.') }}.-
                                    </div>
                                    <x-button-edit wire:click="inputSaldo" />
                                </div>
                                @if ($verSaldo)
                                <div>
                                    <x-input type="number" wire:model.defer="saldo" />
                                </div>
                                <x-button-update wire:click="saveSaldo" innerText="Guardar" class="my-2" />
                                @endif


                            </div>

                        </div>
                        @if (auth()->user()->email == 'javt1981@gmail.com')
                        <div class="flex items-center shadow-lg rounded-xl">
                            <div class="py-4 pl-5 font-normal dark:text-white">
                                <div class="flex-col px-3 py-1 mb-2 text-sm text-white bg-black rounded-full">Total
                                    Pagos del Mes
                                </div>

                                <div class="px-2 mb-1 text-sm text-white bg-green-500 rounded-full">
                                    Pagado ${{ number_format($valorTotalAtendidas,0,',','.') }}.-
                                </div>
                                <div class="px-2 text-sm text-white bg-red-500 rounded-full">
                                    Pendiente ${{ number_format($valorTotalAtenciones-$valorTotalAtendidas,0,',','.')
                                    }}.-
                                </div>

                            </div>
                        </div>
                        <div class="flex items-center shadow-lg rounded-xl">
                            <div class="py-4 pl-5 font-normal dark:text-white">
                                <div class="flex-col px-3 py-1 mb-2 text-sm text-white bg-black rounded-full">Total
                                    Sesiones Del Mes</div>
                                <div class="px-2 mb-1 text-sm text-white bg-green-500 rounded-full">
                                    {{ $applyItemsCount }} Sesiones
                                </div>
                            </div>
                        </div>
                        @endif
                    </div>
                    <div class="grid grid-flow-row-dense grid-cols-6">
                        <div class="col-span-1">
                            <ul
                                class="w-48 text-sm font-medium text-gray-900 bg-white border border-gray-200 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                                <li class="mb-3">
                                    <select id="countries" wire:model="year"
                                        class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500">
                                        <option class="pl-6" value="2023">2023</option>
                                        <option class="pl-6" value="2024">2024</option>
                                        <option class="pl-6" value="2025">2025</option>
                                    </select>

                                </li>
                                <li wire:click="$set('month','01')"
                                    class="w-full border-b border-gray-200 rounded-t-lg dark:border-gray-600">
                                    <div class="flex items-center pl-3">
                                        <input id="list-radio-enero" type="radio" value="01" name="list-radio"
                                            class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-700 dark:focus:ring-offset-gray-700 focus:ring-2 dark:bg-gray-600 dark:border-gray-500"
                                            @if ($month=="01" ) checked @endif>
                                        <label for="list-radio-enero"
                                            class="w-full py-1 ml-2 text-sm font-medium text-gray-900 dark:text-gray-300">Enero</label>
                                    </div>
                                </li>
                                <li wire:click="$set('month','02')"
                                    class="w-full border-b border-gray-200 rounded-t-lg dark:border-gray-600">
                                    <div class="flex items-center pl-3">
                                        <input id="list-radio-febrero" type="radio" value="02" name="list-radio"
                                            class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-700 dark:focus:ring-offset-gray-700 focus:ring-2 dark:bg-gray-600 dark:border-gray-500"
                                            @if ($month=="02" ) checked @endif>
                                        <label for="list-radio-febrero"
                                            class="w-full py-1 ml-2 text-sm font-medium text-gray-900 dark:text-gray-300">Febrero</label>
                                    </div>
                                </li>
                                <li wire:click="$set('month','03')"
                                    class="w-full border-b border-gray-200 rounded-t-lg dark:border-gray-600">
                                    <div class="flex items-center pl-3">
                                        <input id="list-radio-marzo" type="radio" value="03" name="list-radio"
                                            class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-700 dark:focus:ring-offset-gray-700 focus:ring-2 dark:bg-gray-600 dark:border-gray-500"
                                            @if ($month=="03" ) checked @endif>
                                        <label for="list-radio-marzo"
                                            class="w-full py-1 ml-2 text-sm font-medium text-gray-900 dark:text-gray-300">Marzo</label>
                                    </div>
                                </li>
                                <li wire:click="$set('month','04')"
                                    class="w-full border-b border-gray-200 rounded-t-lg dark:border-gray-600">
                                    <div class="flex items-center pl-3">
                                        <input id="list-radio-abril" type="radio" value="04" name="list-radio"
                                            class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-700 dark:focus:ring-offset-gray-700 focus:ring-2 dark:bg-gray-600 dark:border-gray-500"
                                            @if ($month=="04" ) checked @endif>
                                        <label for="list-radio-abril"
                                            class="w-full py-1 ml-2 text-sm font-medium text-gray-900 dark:text-gray-300">Abril</label>
                                    </div>
                                </li>
                                <li wire:click="$set('month','05')"
                                    class="w-full border-b border-gray-200 rounded-t-lg dark:border-gray-600">
                                    <div class="flex items-center pl-3">
                                        <input id="list-radio-mayo" type="radio" value="05" name="list-radio"
                                            class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-700 dark:focus:ring-offset-gray-700 focus:ring-2 dark:bg-gray-600 dark:border-gray-500"
                                            @if ($month=="05" ) checked @endif>
                                        <label for="list-radio-mayo"
                                            class="w-full py-1 ml-2 text-sm font-medium text-gray-900 dark:text-gray-300">Mayo</label>
                                    </div>
                                </li>
                                <li wire:click="$set('month','06')"
                                    class="w-full border-b border-gray-200 rounded-t-lg dark:border-gray-600">
                                    <div class="flex items-center pl-3">
                                        <input id="list-radio-junio" type="radio" value="06" name="list-radio"
                                            class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-700 dark:focus:ring-offset-gray-700 focus:ring-2 dark:bg-gray-600 dark:border-gray-500"
                                            @if ($month=="06" ) checked @endif>
                                        <label for="list-radio-junio"
                                            class="w-full py-1 ml-2 text-sm font-medium text-gray-900 dark:text-gray-300">Junio</label>
                                    </div>
                                </li>
                                <li wire:click="$set('month','07')"
                                    class="w-full border-b border-gray-200 rounded-t-lg dark:border-gray-600">
                                    <div class="flex items-center pl-3">
                                        <input id="list-radio-julio" type="radio" value="07" name="list-radio"
                                            class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-700 dark:focus:ring-offset-gray-700 focus:ring-2 dark:bg-gray-600 dark:border-gray-500"
                                            @if ($month=="07" ) checked @endif>
                                        <label for="list-radio-julio"
                                            class="w-full py-1 ml-2 text-sm font-medium text-gray-900 dark:text-gray-300">Julio</label>
                                    </div>
                                </li>
                                <li wire:click="$set('month','08')"
                                    class="w-full border-b border-gray-200 rounded-t-lg dark:border-gray-600">
                                    <div class="flex items-center pl-3">
                                        <input id="list-radio-agosto" type="radio" value="08" name="list-radio"
                                            class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-700 dark:focus:ring-offset-gray-700 focus:ring-2 dark:bg-gray-600 dark:border-gray-500"
                                            @if ($month=="08" ) checked @endif>
                                        <label for="list-radio-agosto"
                                            class="w-full py-1 ml-2 text-sm font-medium text-gray-900 dark:text-gray-300">Agosto</label>
                                    </div>
                                </li>
                                <li wire:click="$set('month','09')"
                                    class="w-full border-b border-gray-200 rounded-t-lg dark:border-gray-600">
                                    <div class="flex items-center pl-3">
                                        <input id="list-radio-septiembre" type="radio" value="09" name="list-radio"
                                            class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-700 dark:focus:ring-offset-gray-700 focus:ring-2 dark:bg-gray-600 dark:border-gray-500"
                                            @if ($month=="09" ) checked @endif>
                                        <label for="list-radio-septiembre"
                                            class="w-full py-1 ml-2 text-sm font-medium text-gray-900 dark:text-gray-300">Septiembre</label>
                                    </div>
                                </li>
                                <li wire:click="$set('month','10')"
                                    class="w-full border-b border-gray-200 rounded-t-lg dark:border-gray-600">
                                    <div class="flex items-center pl-3">
                                        <input id="list-radio-octubre" type="radio" value="10" name="list-radio"
                                            class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-700 dark:focus:ring-offset-gray-700 focus:ring-2 dark:bg-gray-600 dark:border-gray-500"
                                            @if ($month=="10" ) checked @endif>
                                        <label for="list-radio-octubre"
                                            class="w-full py-1 ml-2 text-sm font-medium text-gray-900 dark:text-gray-300">Octubre</label>
                                    </div>
                                </li>
                                <li wire:click="$set('month','11')"
                                    class="w-full border-b border-gray-200 rounded-t-lg dark:border-gray-600">
                                    <div class="flex items-center pl-3">
                                        <input id="list-radio-noviembre" type="radio" value="11" name="list-radio"
                                            class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-700 dark:focus:ring-offset-gray-700 focus:ring-2 dark:bg-gray-600 dark:border-gray-500"
                                            @if ($month=="11" ) checked @endif>
                                        <label for="list-radio-noviembre"
                                            class="w-full py-1 ml-2 text-sm font-medium text-gray-900 dark:text-gray-300">Noviembre</label>
                                    </div>
                                </li>
                                <li wire:click="$set('month','12')"
                                    class="w-full border-b border-gray-200 rounded-t-lg dark:border-gray-600">
                                    <div class="flex items-center pl-3">
                                        <input id="list-radio-diciembre" type="radio" value="12" name="list-radio"
                                            class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-700 dark:focus:ring-offset-gray-700 focus:ring-2 dark:bg-gray-600 dark:border-gray-500"
                                            @if ($month=="12" ) checked @endif>
                                        <label for="list-radio-diciembre"
                                            class="w-full py-1 ml-2 text-sm font-medium text-gray-900 dark:text-gray-300">Diciembre</label>
                                    </div>
                                </li>
                            </ul>

                        </div>
                        <div class="col-span-5">
                            <div class="flex items-center justify-center w-full">
                                <div role="status" wire:loading="month" class="mt-10">
                                    <svg aria-hidden="true"
                                        class="w-8 h-8 mr-2 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600"
                                        viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path
                                            d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                                            fill="currentColor" />
                                        <path
                                            d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                                            fill="currentFill" />
                                    </svg>
                                    <span class="sr-only">Loading...</span>
                                </div>
                            </div>


                            <div class="shadow-md rounded-xl" wire:loading.remove>
                                <table class="w-full text-sm text-gray-500 dark:text-gray-400">
                                    <thead
                                        class="py-4 text-xs text-gray-700 uppercase bg-teal-100 dark:bg-gray-700 dark:text-gray-400">
                                        <tr class="">
                                            <th scope="col" class="px-6 py-2">Fecha&nbsp;Atención</th>
                                            <th scope="col" class="px-6 py-2">Kine</th>
                                            <th scope="col" class="px-6 py-2">Estado</th>

                                            <th scope="col" class="px-6 py-2">Tipo&nbsp;de&nbsp;Atención</th>
                                            <th scope="col" class="px-6 py-3">N°</th>
                                            <th scope="col" class="px-6 py-2">Valor</th>
                                            <th scope="col" class="px-6 py-2">
                                                <span class="sr-only">Actions</span>
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        @forelse ($applyItems as $applyItem)

                                        <tr class="uppercase bg-white border-b dark:border-gray-700 hover:bg-cyan-50">
                                            <td class="px-6 py-2">
                                                @if ($applyItem->fecha_atencion)
                                                {{
                                                \Carbon\Carbon::parse(strtotime($applyItem->fecha_atencion))->format('d/m/Y')
                                                }}

                                                @else
                                                ---------
                                                @endif
                                            </td>
                                            <td class="py-2 pl-2 mx-2">

                                                {{ $applyItem->doctor->name ?? '' }}
                                                {{ $applyItem->doctor->last_name ?? '' }}

                                            </td>
                                            <td class="px-6 py-2">
                                                @if ($applyItem->status == 0)
                                                <span
                                                    class="inline-flex items-center bg-yellow-100 text-yellow-800 text-xs font-medium mr-2 px-2.5 py-0.5 rounded-full dark:bg-yellow-900 dark:text-yellow-300">
                                                    <span class="w-2 h-2 mr-1 bg-yellow-500 rounded-full"></span>
                                                    Pendiente
                                                </span>
                                                @elseif ($applyItem->status == 1)
                                                <span
                                                    class="inline-flex items-center bg-teal-100 text-teal-800 text-xs font-medium mr-2 px-2.5 py-0.5 rounded-full dark:bg-teal-900 dark:text-teal-300">
                                                    <span
                                                        class="w-2 h-2 mr-1 text-white bg-teal-500 rounded-full"></span>
                                                    Atendida
                                                </span>
                                                @elseif ($applyItem->status == 2)
                                                <span
                                                    class="inline-flex items-center bg-red-100 text-red-800 text-xs font-medium mr-2 px-2.5 py-0.5 rounded-full dark:bg-red-900 dark:text-red-300">
                                                    <span
                                                        class="w-2 h-2 mr-1 text-white bg-red-500 rounded-full"></span>
                                                    Cancelada
                                                </span>

                                                @elseif ($applyItem->status == 3)
                                                <span
                                                    class="inline-flex items-center bg-gray-100 text-gray-800 text-xs font-medium mr-2 px-2.5 py-0.5 rounded-full dark:bg-gray-900 dark:text-gray-300">
                                                    <span
                                                        class="w-2 h-2 mr-1 text-white bg-gray-500 rounded-full"></span>
                                                    Reagendada
                                                </span>
                                                @endif

                                            </td>
                                            <td class="px-6 py-2 uppercase">
                                                @if ($applyItem->applicationType)

                                                {{$applyItem->applicationType->name ?? '' }}
                                                @else
                                                ---------
                                                @endif
                                            </td>
                                            <td class="px-6 py-2 uppercase">
                                                @if ($applyItem->numero_sesion > 0)

                                                {{$applyItem->numero_sesion ?? ''}}
                                                @else
                                                ---------
                                                @endif
                                            </td>
                                            <td class="px-6 py-2">

                                                @if ($applyItem->price)

                                                ${{ number_format($applyItem->price,0,',','.') }}.-
                                                @else
                                                ---------
                                                @endif

                                            </td>

                                            <td class="px-6 py-2">

                                                @livewire('pagos-paciente.switch-pago', ['item' => $applyItem],
                                                key($applyItem->id))

                                            </td>

                                        </tr>

                                        @empty
                                        <tr class="text-center">
                                            <td colspan="7">
                                                Sin datos
                                            </td>
                                        </tr>
                                        @endforelse
                                    </tbody>
                                </table>
                                <div class="p-4 mb-5">
                                    @if (auth()->user()->email == 'javt1981@gmail.com')
                                    <span>Items: </span>
                                    @foreach ($itemsApllys as $item )
                                    <li>{{ $item }} || </li>
                                    @endforeach
                                    @endif
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>