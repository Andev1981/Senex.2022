<div class="mt-3">
  <x-button-add wire:click="$set('openModalPago','')" class="gap-2" innerText="Agregar Pago" />

 <div class="{{ $openModalPago }} bg-gray-600 bg-opacity-50 overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 z-50 justify-center w-full md:inset-0 h-modal md:h-full flex">
        <div class="relative w-full h-full p-4 md:max-w-5xl md:h-auto">

            <!-- Modal content -->
            <div class="relative p-4 bg-white rounded-lg shadow dark:bg-gray-800 sm:p-5">
                <!-- Modal header -->
                <div class="flex items-center justify-between pb-4 mb-4 border-b rounded-t sm:mb-5 dark:border-gray-600">
                    <div>
                        <h3 class="text-sm text-gray-500 dark:text-white">
                            Pagos realizados
                        </h3>
                        <span class="font-semibold text-lg">{{ $paciente->name }} {{ $paciente->last_name}}</span>
                    </div>
                    <x-button-modal-close wire:click="$set('openModalPago','hidden')" />
                </div>

                <div class="grid grid-flow-row-dense grid-cols-6 gap-4">
                    <div class="col-span-2">
                        <form wire:submit.prevent="savePay">

                            <div>
                                <x-input-field-required label="Valor" name="valor" type="number" wire:model.defer="valor" placeholder="">

                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
                                        <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>

                                    </x-input-required>
                                    @error('valor')
                                    <p class="text-sm text-red-600 dark:text-red-500">
                                        {{ $message }}.
                                    </p>
                                    @enderror
                            </div>

                            <div>
                                <x-input-field-required label="Fecha de Pago" name="fecha_pago" type="date" wire:model.defer="fecha_pago" placeholder="">

                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-hospital" viewBox="0 0 16 16">
                                        <path d="M10.854 7.146a.5.5 0 0 1 0 .708l-3 3a.5.5 0 0 1-.708 0l-1.5-1.5a.5.5 0 1 1 .708-.708L7.5 9.793l2.646-2.647a.5.5 0 0 1 .708 0z" />
                                        <path d="M3.5 0a.5.5 0 0 1 .5.5V1h8V.5a.5.5 0 0 1 1 0V1h1a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V3a2 2 0 0 1 2-2h1V.5a.5.5 0 0 1 .5-.5zM1 4v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V4H1z" />
                                    </svg>

                                </x-input-field-required>
                                @error('fecha_pago')
                                <p class="text-sm text-red-600 dark:text-red-500">
                                    {{ $message }}.
                                </p>
                                @enderror
                            </div>

                            
                            <!-- <div class="flex items-center justify-center w-full mt-3">
                                <label for="dropzone-file" class="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-bray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500 dark:hover:bg-gray-600">
                                    <div class="flex flex-col items-center justify-center pt-2 pb-2">
                                        <svg class="w-8 h-8 mb-2 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                                            <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/>
                                        </svg>
                                        <p class="mb-2 text-sm text-gray-500 dark:text-gray-400"><span class="font-semibold">Click para cargar</span> o arrastre y suelte acá</p>
                                        <p class="text-xs text-gray-500 dark:text-gray-400">Suba un comprobante de pago si lo requiere</p>
                                    </div>
                                    <input id="dropzone-file" wire:model="comprobante" type="file" class="hidden" />
                                </label>
                            </div>  -->
                            <div class="mt-3">
                                <label  class="block text-sm font-medium text-gray-900 dark:text-white">Comentario o
                                    detalles</label>
                                <textarea wire:model.defer="mensaje" rows="2" class="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="Si tiene algún comentario, ingreselo acá...">
                                </textarea>
                            </div>

                            <hr>

                            <div class="mt-5">

                                <x-button-update wire:loading.remove wire:click="savePay" wire:target="savePay" innerText="Agregar" />


                                <x-button-loading wire:loading wire:target="savePay" innerText="Agregando" />
                            </div>
                        </form>
                    </div>
                    <div class="col-span-4">
                        <div class="flex w-full justify-center items-center">
                            <div role="status" wire:loading class="mt-10">
                                <svg aria-hidden="true" class="w-8 h-8 mr-2 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor" />
                                    <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill" />
                                </svg>
                                <span class="sr-only">Loading...</span>
                            </div>
                        </div>


                        <div class="shadow-md rounded-xl" wire:loading.remove>
                            <table class="w-full text-sm text-gray-500 dark:text-gray-400">
                                <thead class="text-xs text-gray-700 uppercase bg-teal-100 dark:bg-gray-700 dark:text-gray-400 py-4">
                                    <tr class="">
                                        <th scope="col" class="px-6 py-2 text-start">Fecha&nbsp;de&nbsp;Pago</th>
                                        <th scope="col" class="px-6 py-2 text-start">Valor</th>
                                        <th>Mensaje</th>

                                        <th scope="col" class="px-6 py-2">
                                            <span class="sr-only">Actions</span>
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    @forelse ($payments as $payment)

                                    <tr class="uppercase bg-white border-b dark:border-gray-700 hover:bg-cyan-50">
                                        <td class="px-6 py-2">
                                            {{ \Carbon\Carbon::parse(strtotime($payment->fecha_pago))->format('d/m/Y') }}
                                        </td>
                                        <td class="py-2 pl-2 mx-2">
                                            ${{ number_format($payment->pay,0,',','.') }}.-
                                        </td>
                                        <td>{{$payment->mensaje ?? ''}}</td>
                                        <td class="px-6 py-2">

                                            <x-button-delete wire:click="deletePay({{ $payment }})" innerText="" class="gap-2" />

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
                            <div class="mb-5 p-4">

                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
 </div>
</div>