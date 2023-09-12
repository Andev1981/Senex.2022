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
                                <div class="text-sm text-gray-500 dark:text-gray-400">Total Pagos</div>
                                <div>
                                 Pagado ${{ number_format($totalAtenciones,0,',','.') }}.- de un total de $ {{ number_format($totalAtendidas,0,',','.') }}.-
                                </div>
                                <div>
                                    @if ($totalAtenciones < $totalAtendidas)
                                        <span class="inline-flex items-center bg-red-100 text-red-800 text-xs font-medium mr-2 px-2.5 py-0.5 rounded-full dark:bg-red-900 dark:text-red-300">
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
                                <div class="text-sm text-gray-500 dark:text-gray-400">Total Sesiones Atendidas</div>
                                <div>
                                 {{ $itemsSuma }} de {{ $countSuma }}
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="grid gap-4 shadow-xl sm:grid-cols-2 sm:gap-6">
                        <div class="px-5 space-y-4 sm:col-span-2 sm:space-y-6">

                            <div class="w-full overflow-x-auto">
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
                                   @forelse ($applications as $application)
                                        @foreach ($application->items->where('status','=', $type) as $item)
                                            <tr class="uppercase bg-white border-b dark:border-gray-700 hover:bg-cyan-50">
                                            <td class="px-6 py-4">
                                                    @if ($item->fecha_atencion)
                                                     {{ \Carbon\Carbon::parse(strtotime($item->fecha_atencion))->format('d/m/Y') }}
                                                        
                                                    @else
                                                        ---------
                                                    @endif
                                                </td>
                                                <td class="py-2 pl-2 mx-2">
                                                    
                                                         {{ $item->user->name ?? '' }}
                                                         {{ $item->user->last_name ?? '' }}
                                                  
                                                </td>
                                                <td class="px-6 py-4">
                                               @if ($item->status == 0)
                                                   <span class="inline-flex items-center bg-yellow-100 text-yellow-800 text-xs font-medium mr-2 px-2.5 py-0.5 rounded-full dark:bg-yellow-900 dark:text-yellow-300">
                                                        <span class="w-2 h-2 mr-1 bg-yellow-500 rounded-full"></span>
                                                        Pendiente
                                                    </span>
                                                @elseif ($item->status == 1)
                                                <span class="inline-flex items-center bg-teal-100 text-teal-800 text-xs font-medium mr-2 px-2.5 py-0.5 rounded-full dark:bg-teal-900 dark:text-teal-300">
                                                        <span class="w-2 h-2 mr-1 text-white bg-teal-500 rounded-full"></span>
                                                        Atendida
                                                    </span>
                                                @elseif ($item->status == 2)
                                                <span class="inline-flex items-center bg-red-100 text-red-800 text-xs font-medium mr-2 px-2.5 py-0.5 rounded-full dark:bg-red-900 dark:text-red-300">
                                                        <span class="w-2 h-2 mr-1 text-white bg-red-500 rounded-full"></span>
                                                        Cancelada
                                                    </span>

                                                @elseif ($item->status == 3)
                                                 <span class="inline-flex items-center bg-gray-100 text-gray-800 text-xs font-medium mr-2 px-2.5 py-0.5 rounded-full dark:bg-gray-900 dark:text-gray-300">
                                                        <span class="w-2 h-2 mr-1 text-white bg-gray-500 rounded-full"></span>
                                                    Reagendada
                                                    </span>
                                               @endif
                                                    
                                                </td>
                                               
                                                <td class="px-6 py-4 uppercase">
                                                    @if ($item->applicationType)
                                                        
                                                        {{$item->applicationType->name }}
                                                    @else
                                                        ---------
                                                    @endif
                                                </td>
                                                <td class="px-6 py-4 uppercase">
                                                    @if ($item->numero_sesion > 0)
                                                        
                                                        {{$item->numero_sesion }}
                                                    @else
                                                        ---------
                                                    @endif
                                                </td>
                                                 <td class="px-6 py-4">
                                                
                                                        @if ($item->price)
                                                        
                                                        ${{ number_format($item->price,0,',','.') }}.-
                                                    @else
                                                            ---------
                                                    @endif
                                           
                                                </td>
                                                 <td class="px-6 py-4 uppercase">
                                                    @if ($item->payment)
                                                        
                                                         ${{ number_format($item->payment->pay,0,',','.') }}.-
                                                    @else
                                                        ---------
                                                    @endif
                                                </td>
                                                
                                                <td class="px-6 py-4">

                                            
                                                        @livewire('paciente.pagos.modal-pago', ['item' => $item], key($item->id))

                                                </td>
                                            </tr>
                                        @endforeach
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
                             {{ $applications->links() }}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>