<x-admin-layout>
    <x-slot name="header">
        <h2 class="font-semibold text-xl text-gray-800 leading-tight">
            <nav class="flex" aria-label="Breadcrumb">
                <ol class="inline-flex items-center space-x-1 md:space-x-3">
                    <li class="inline-flex items-center">
                        <a href="{{route('pacientes.index')}}" class="inline-flex items-center text-sm font-medium text-gray-700 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white">
                            <svg xmlns="http://www.w3.org/2000/svg" class="mr-2 h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                              </svg>
                            Paciente
                        </a>
                    </li>
                    <li>
                        <div class="flex items-center">
                            <svg class="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd"></path></svg>
                            <span class="ml-1 text-sm font-medium text-gray-400 md:ml-2 dark:text-gray-500">Guardar</span>
                        </div>
                        
                    </li>
                    <li>
                        <div class="flex items-center">
                            <svg class="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd"></path></svg>
                            <span class="ml-1 text-sm font-medium text-gray-400 md:ml-2 dark:text-gray-500">Preguntas</span>
                        </div>
                    </li>
                </ol>
            </nav>
        </h2>
    </x-slot>

    <div class="py-6 ">
        <div class="w-full mx-auto sm:px-6 lg:px-8">
            <div class="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                <div class=" bg-white border-b border-gray-200">
                    <div class="relative overflow-x-auto shadow-md sm:rounded-lg p-6">
                        <div class="relative overflow-x-auto shadow-md sm:rounded-lg p-6">
                        <span class="bg-red-500 text-white uppercase text-xs font-semibold mr-2 px-2 py-0 rounded-full dark:bg-red-200 dark:text-red-900">Completa las pregunta para que podamos agregar al paciente sin problemas :) , gracias</span>
                        <form class="form-horizontal" method="GET" action="{{ route('pacientes.preguntas') }}">
                        {{ csrf_field() }}
                            <input type="hidden" name="paciente" id="paciente" value="{{ $paciente->id }}">
                            {{$paciente->id}}
                                <div class="grid xl:grid-cols-1 xl:gap-6">
                                            
                                <div class="form-group">
                                <div class="col-sm-6">
                                    <label class="control-label">Pregunta 1 / 5 : Medicamentos frecuentes</label>
                                    <textarea   id="p1" name="p1" rows="2" class="mt-2 block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="Cuéntanos cual..."></textarea> 
                                </div>
                                <br>
                                <div class="col-sm-6">
                                    <label class="control-label">Pregunta 2 / 5 : Es alérgico a algún medicamento</label>
                                    <textarea   id="p1" name="p1" rows="2" class="mt-2 block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="Cuéntanos cual..."></textarea> 
                                </div>
                                <br>
                                <div class="col-sm-6">
                                    <label class="control-label">Pregunta 3 / 5 : Indique patologías previas</label>
                                    <textarea   id="p1" name="p1" rows="2" class="mt-2 block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="Cuéntanos cual..."></textarea> 
                                </div>
                                <br>
                                <div class="col-sm-6">
                                    <label class="control-label">Pregunta 4 / 5 : Se ha realizado cirugías anteriormente , indique cuales</label>
                                    <textarea   id="p1" name="p1" rows="2" class="mt-2 block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="Cuéntanos cual..."></textarea> 
                                </div>
                                <br>
                                <div class="col-sm-6">
                                    <label class="control-label">Pregunta 5 / 5 : Tiene algunas observaciones</label>
                                    <textarea   id="p1" name="p1" rows="2" class="mt-2 block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="Cuéntanos cual..."></textarea> 
                                </div>
                                </div>     
                                </div>
                          
                                <button type="submit" class="text-white bg-blue-700 hover:bg-blue-800 mt-5 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">Completar ingreso de paciente</button>
                        </form>
                        </div>
                    </div>
                   
                </div>
            </div>
        </div>
    </div>

         

</x-admin-layout>
