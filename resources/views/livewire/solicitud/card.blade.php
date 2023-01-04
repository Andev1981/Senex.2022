<div>
    <div>
        <div class="bg-white p-3 border-t-4 border-blue-600">
            <div class="image overflow-hidden">
                <img class="h-auto w-full mx-auto rounded-full"
                    src="{{ asset('img/avatarUser.PNG') }}"
                    alt="">
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
                    @if ($paciente->status == 1)
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
        </div>
    </div>

</div>
