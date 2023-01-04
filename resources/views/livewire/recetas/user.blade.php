<div class="bg-white p-3 border-t-4 border-blue-600">
    <div class="image overflow-hidden center">
        @if ($solicitud->patient->user->image)
            <img class="w-full p-10 rounded-full" src="" alt="Rounded avatar">
        @else
            <img class="h-auto w-full mx-auto rounded-full"
            src="{{ asset('img/avatarUser.PNG') }}"
            alt="">
        @endif
    </div>
    <div class="text-center">
        <h1 class="text-gray-900 font-bold text-xl leading-8 my-1">{{ $solicitud->patient->user->name}}</h1>
        <h3 class="text-gray-600 font-lg text-semibold leading-6">{{$solicitud->patient->user->rut}}</h3>
    </div>
        {{-- <p class="text-sm text-gray-500 hover:text-gray-600 leading-6">Lorem ipsum dolor sit amet
        consectetur adipisicing elit.
        Reprehenderit, eligendi dolorum sequi illum qui unde aspernatur non deserunt</p> --}}
    <ul class="bg-gray-100 text-gray-600 hover:text-gray-700 hover:shadow py-2 px-3 mt-3 divide-y rounded shadow-sm">
        <li class="flex items-center py-3">
            <span>Tipo Atención</span>
            <span class="ml-auto text-green-500 text-sm">{{$solicitud->solicitud_type->name}}</span>
        </li>
    </ul>
</div>
