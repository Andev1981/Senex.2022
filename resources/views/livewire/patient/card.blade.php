<div>
    <div class="bg-white p-3 border-t-4 border-blue-600">
                            <div class="image overflow-hidden">
                                @if ($name)
                                <a wire:click="changeAvatar" class="absolute mb-10 mr-10 rounded-full bg-yellow-300 p-2 text-white cursor-pointer">

                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-pencil" viewBox="0 0 16 16">
                                        <path d="M12.146.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1 0 .708l-10 10a.5.5 0 0 1-.168.11l-5 2a.5.5 0 0 1-.65-.65l2-5a.5.5 0 0 1 .11-.168l10-10zM11.207 2.5 13.5 4.793 14.793 3.5 12.5 1.207 11.207 2.5zm1.586 3L10.5 3.207 4 9.707V10h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.293l6.5-6.5zm-9.761 5.175-.106.106-1.528 3.821 3.821-1.528.106-.106A.5.5 0 0 1 5 12.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.468-.325z"/>
                                      </svg>

                            </a>
                                    <img class="h-auto w-full mx-auto rounded-full"
                                    src="{{ Storage::url($paciente->user->avatar) }}"
                                    alt="">
                                @else
                                <a wire:click="changeAvatar" class="absolute mb-10 mr-10 rounded-full bg-yellow-300 p-2 text-white cursor-pointer">

                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-pencil" viewBox="0 0 16 16">
                                            <path d="M12.146.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1 0 .708l-10 10a.5.5 0 0 1-.168.11l-5 2a.5.5 0 0 1-.65-.65l2-5a.5.5 0 0 1 .11-.168l10-10zM11.207 2.5 13.5 4.793 14.793 3.5 12.5 1.207 11.207 2.5zm1.586 3L10.5 3.207 4 9.707V10h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.293l6.5-6.5zm-9.761 5.175-.106.106-1.528 3.821 3.821-1.528.106-.106A.5.5 0 0 1 5 12.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.468-.325z"/>
                                          </svg>

                                </a>
                                    <img class="h-auto w-full mx-auto rounded-full"
                                        src="{{ asset('img/avatarUser.PNG')}}"
                                        alt="">

                                @endif

                            </div>
                            <div class="text-center">
                                <h1 class="text-gray-900 font-bold text-xl leading-8 my-1">{{ $paciente->user->name}}</h1>
                                <h3 class="text-gray-600 font-lg text-semibold leading-6">{{$paciente->user->rut}}</h3>
                            </div>

        {{--                     <p class="text-sm text-gray-500 hover:text-gray-600 leading-6">Lorem ipsum dolor sit amet
                                consectetur adipisicing elit.
                                Reprehenderit, eligendi dolorum sequi illum qui unde aspernatur non deserunt</p> --}}
                            <ul
                                class="bg-gray-100 text-gray-600 hover:text-gray-700 hover:shadow py-2 px-3 mt-3 divide-y rounded shadow-sm">
                                <li class="flex items-center py-3">
                                    <span>Estado</span>
                                    @if ($paciente->state == 0)
                                        <span class="ml-auto"><span class="bg-red-500 py-1 px-2 rounded text-white text-sm">Inactivo</span></span>
                                    @else
                                        <span class="ml-auto"><span class="bg-green-500 py-1 px-2 rounded text-white text-sm">Activo</span></span>
                                    @endif
                                </li>
                                <li class="flex items-center py-3">
                                    <span>Miembro desde</span>
                                    <span class="ml-auto float-right">{{ \Carbon\Carbon::parse($paciente->created_at)->format('j \\d\e F Y')}}</span>
                                </li>
                            </ul>

                            <div class="relative p-5 overflow-x-auto shadow-md sm:rounded-lg">        
                                <table class="w-full shadow-md text-sm text-left text-gray-500 dark:text-gray-400">
                              
                                
                                <thead class="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                                    <tr>Apoderados</tr>
                                <tr class="text-center">
                                  
                                    <th scope="col" class="px-6 py-3">Nombre</th>
                                    <th scope="col" class="px-6 py-3">Rut</th>
                                </tr>
                                </thead>
                                <tbody>
                                    @foreach ($assignates as $assign)
                                    <tr class="bg-white border-b text-center dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                                        
                                        <td class="px-6 py-4">{{$assign->user->name}}</td>
                                        <td class="px-6 py-4">{{$assign->user->rut}}</td>
                                    </tr>
                                @endforeach
                                </tr>
                                </tbody>
                                </table>
                            </div>
                        </div>

                        @if($open)
                        <div tabindex="-1" class="bg-[#4d515dab] overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 z-50 w-full md:inset-0 h-modal md:h-full justify-center items-center flex" aria-modal="true" role="dialog">
                                    <!-- Modal content -->
                            <div class="relative bg-white rounded-lg shadow dark:bg-gray-700">
                                    <!-- Modal header -->
                                    <div class="flex justify-between items-center p-5 rounded-t border-b dark:border-gray-600">
                                        <h3 class="text-xl font-medium text-gray-900 dark:text-white">
                                           Cambiar avatar
                                        </h3>
                                        <button wire:click="cerrar" type="button" class="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center dark:hover:bg-gray-600 dark:hover:text-white" data-modal-toggle="medium-modal">
                                            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path></svg>
                                        </button>
                                    </div>
                                <!-- Modal body -->
                                <form wire:submit.prevent="save" >
                                        <div class="flex items-center justify-center w-full">
                                            <label class="flex flex-col w-full h-42 border-4 border-dashed hover:bg-gray-100 hover:border-gray-300 px-4">
                                                <div class="flex flex-col items-center justify-center pt-7">
                                                    <div wire:loading wire:target="img" wire:click="img" class="flex flex-col items-center justify-center text-center">
                                                        <i class="fa fa-spinner fa-spin"></i>
                                                        Subiendo Imágen
                                                    </div>
                                                @if($img)
                                                    <div class="flex flex-col items-center justify-center">
                                                        <img  src="{{ $img->temporaryUrl()}}" alt="" width="250">
                                                    </div>
                                                @else
                                                    <svg xmlns="http://www.w3.org/2000/svg"
                                                    class="w-12 h-12 text-gray-400 group-hover:text-gray-600" viewBox="0 0 20 20"
                                                    fill="currentColor">
                                                        <path fill-rule="evenodd"
                                                            d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
                                                            clip-rule="evenodd" />
                                                    </svg>
                                                    <p class="pt-1 text-sm tracking-wider text-gray-400 h-auto group-hover:text-gray-600">
                                                        Subir imagen
                                                    </p>
                                                @endif

                                            </div>
                                                <input wire:model="img" type="file" class="opacity-0" />
                                            </label>
                                        </div>
                                        <!-- Modal footer -->
                                        <div class="flex items-center p-6 space-x-2 rounded-b border-t border-gray-200 dark:border-gray-600">
                                            <button type="submit" class="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">Guardar</button>
                                            <button wire:click="cerrar" type="button" class="text-gray-500 bg-white hover:bg-gray-100 focus:ring-4 focus:outline-none focus:ring-gray-200 rounded-lg border border-gray-200 text-sm font-medium px-5 py-2.5 hover:text-gray-900 focus:z-10 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-500 dark:hover:text-white dark:hover:bg-gray-600 dark:focus:ring-gray-600">Cerrar</button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                    @endif
    </div>
