<div>
    <!-- This is an example component -->
    <div class="w-full mx-auto">
        <div class="overflow-x-auto shadow-md sm:rounded-lg">
          <table class="w-full text-sm text-left text-gray-500 dark:text-gray-400">
              <thead class="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                <tr class="text-center">
                    <th scope="col" class="px-6 py-3">Nombre del paciente</th>
                    <th scope="col" class="px-6 py-3">Tipo de solicitud</th>
                    <th scope="col" class="px-6 py-3">Dia y Hora</th>
                   {{--  <th scope="col" class="px-6 py-3">Prioridad</th> --}}
                    <th scope="col" class="px-6 py-3"></th>
                </tr>
              </thead>
              <tbody>
                  @unless (count($solicitudes) > 0)
                                    <tr class="bg-white border-b text-center dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                                        <td class="px-6 py-4"> No existen atenciones pendientes</td>
                                    </tr>
                                @else
                                    @foreach ($solicitudes as $solicitud)
                                        <tr class="bg-white border-b text-center dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                                            <td class="px-6 py-4">  {{$solicitud->patient->user->name}}</td>
                                            <td class="px-6 py-4">  {{$solicitud->solicitud_type->name}}</td>
                                            <td class="px-6 py-4">   {{Carbon\Carbon::parse($solicitud->attention_date)->format('h:i | d-m-Y')}}</td>
                                        {{--   <td class="px-6 py-4">
                                                <span class="bg-red-600 text-red-800 text-xs font-semibold mr-2 px-2 py-0 rounded-full dark:bg-red-200 dark:text-red-900"></span>
                                            </td> --}}
                                            <td class="px-6 py-4">

                                                <a href="{{ route('solicitud.show',$solicitud->id) }}" type="button"class="font-medium text-blue-600 dark:text-blue-500 hover:underline">
                                                    <svg xmlns="http://www.w3.org/2000/svg" class="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                                                        <path stroke-linecap="round" stroke-linejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                                    </svg>
                                                </a>
                                               {{--  <a href="#" type="button"class="font-medium text-blue-600 dark:text-blue-500 hover:underline">
                                                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                                                        <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                        <path stroke-linecap="round" stroke-linejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                    </svg>
                                                </a> --}}
                                            </td>
                                        </tr>
                                    @endforeach
                            @endunless
              </tbody>
          </table>
      </div>
  </div>
</div>
