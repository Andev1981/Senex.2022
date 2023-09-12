<div>
    <button wire:click="$set('open','')" class="flex items-center text-white bg-sky-700 hover:bg-sky-800 focus:ring-4 focus:outline-none focus:ring-sky-300 font-medium rounded-lg text-sm px-2 py-1.5 text-center dark:bg-sky-600 dark:hover:bg-sky-700 dark:focus:ring-sky-800" type="button">

        Fix
    </button>

    <!-- Main modal -->
    <div class="{{ $open }} bg-gray-600 bg-opacity-50 overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 z-50 justify-center w-full md:inset-0 h-modal md:h-full flex">
        <div class="relative w-full h-full max-w-4xl p-4 md:h-auto">

            <!-- Modal content -->
            <div class="relative p-4 bg-white rounded-lg shadow dark:bg-gray-800 sm:p-5">
                <!-- Modal header -->
                <div class="flex items-center justify-between pb-4 mb-4 border-b rounded-t sm:mb-5 dark:border-gray-600">
                    <div>
                        <h3 class="text-base text-gray-700 dark:text-white">
                            Fix Sessions
                        </h3>
                        <span class="font-semibold text-lg">{{ $user->name }} {{ $user->last_name}}</span>
                    </div>
                    <button wire:click="$set('open','hidden')" type="button" class="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center dark:hover:bg-gray-600 dark:hover:text-white">
                        <svg aria-hidden="true" class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                            <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path>
                        </svg>
                        <span class="sr-only">Close modal</span>
                    </button>
                </div>
                    <div class="grid gap-4 mb-4 sm:grid-cols-2">
                        <div class="relative">
                            <div>
                                <label  class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                                    Applications
                                </label>
                                <div class="flex">
                                    <select wire:model="applicationSet" wire:change="cambioId" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-r-lg border-l-gray-100 dark:border-l-gray-700 border-l-2 focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500">
                                        <option selected readonly> -- seleccion --</option>
                                        @foreach ($applications as $application)
                                        <option class="uppercase" value="{{ $application->id }}">
                                            {{ $application->id }}
                                        </option>
                                        @endforeach
                                    </select>
                                </div>
                            </div>
                            @error('applicationSet')
                            <p class="mt-2 text-xs text-red-600 dark:text-red-500">
                                {{ $message }}
                            </p>
                            @enderror
                        </div>

                        <div class="relative">
                            <ul>
                                @foreach ($items as $item)
                                    <li>{{$item->id}}</li>
                                @endforeach
                            </ul>
                        </div>
                    </div>
                    
                    <div class="flex items-center pt-5 space-x-4 border-t-2">


                        <button type="button" wire:loading.remove wire:click="save" class="inline-flex items-center px-2 py-1 text-sm font-medium text-center text-white rounded-lg bg-sky-700 hover:bg-sky-800 focus:ring-4 focus:outline-none focus:ring-sky-300 dark:bg-sky-600 dark:hover:bg-sky-700 dark:focus:ring-sky-800">
                            <svg class="w-6 h-6 mr-1 -ml-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                <path fill-rule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clip-rule="evenodd"></path>
                            </svg>
                           Fix it
                        </button>

                        @if(count($items) == 0)
                         <button type="button" wire:loading.remove wire:click="aplicationDel" class="inline-flex items-center px-2 py-1 text-sm font-medium text-center text-white rounded-lg bg-sky-700 hover:bg-sky-800 focus:ring-4 focus:outline-none focus:ring-sky-300 dark:bg-sky-600 dark:hover:bg-sky-700 dark:focus:ring-sky-800">
                            <svg class="w-6 h-6 mr-1 -ml-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                <path fill-rule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clip-rule="evenodd"></path>
                            </svg>
                           Borrar Application
                        </button>
                        @endif
                        

                        <div wire:loading wire:target="['save','aplicationDel']">

                            <button disabled type="button" class="inline-flex items-center px-2 py-1 mr-2 text-sm font-medium text-center text-white rounded-lg bg-sky-700 hover:bg-sky-800 focus:ring-4 focus:ring-sky-300 dark:bg-sky-600 dark:hover:bg-sky-700 dark:focus:ring-sky-800">
                                <svg aria-hidden="true" role="status" class="inline w-4 h-4 mr-3 text-white animate-spin" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="#E5E7EB" />
                                    <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentColor" />
                                </svg>
                                Cargando...
                            </button>
                        </div>

                    </div>
                
                </form>

            </div>
        </div>
    </div>
</div>