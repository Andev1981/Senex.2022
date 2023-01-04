<div>
    <div class="bg-white p-3 shadow-sm rounded-sm">
        <div class="flex items-center space-x-2 font-semibold text-gray-900 leading-8">
            <span clas="text-green-500">
                <svg class="h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                    stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
            </span>
            <span class="tracking-wide"> Perfil de {{$user->name}} </span>
        </div>
        @if ($open)
        <div class="text-gray-700">
            <div class="grid md:grid-cols-2 text-sm">
                <div class="grid grid-cols-1">
                    <div class="px-2 py-2 font-bold">Nombre</div>
                    <input type="text" wire:model="name" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500">
                </div>
              
                <div class="grid grid-cols-1">
                    <div class="px-4 py-2 font-bold">Rut</div>
                    <input type="text" wire:model="rut" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500">
                </div>
                
                <div class="grid grid-cols-1">
                    <div class="px-4 py-2 font-bold">Email</div>
                        <input type="email" wire:model="email" id="email" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" required>
                    </div>
                <div class="grid grid-cols-1">
                    <div class="px-4 py-2 font-bold">Fecha de Nacimiento</div>
                    <input type="date" wire:model="birthday" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" value="{{$doctor->user->birtday}}">
                </div>
            </div>
        </div>
        <button wire:click="update"
        class="block w-full text-blue-800 text-sm font-semibold rounded-lg hover:bg-gray-300 bg-gray-200 focus:outline-none focus:shadow-outline focus:bg-gray-100 hover:shadow-xs p-3 my-4">Actualizar</button>
        <button wire:click="cancel"
        class="block w-full text-yellow-500 text-sm font-semibold rounded-lg hover:bg-gray-300 bg-gray-200 focus:outline-none focus:shadow-outline focus:bg-gray-100 hover:shadow-xs p-3 my-4">Cancelar</button>
            @else
            <div class="text-gray-700">
                <div class="grid md:grid-cols-2 text-sm">
                    <div class="grid grid-cols-1">
                        <div class="px-4 py-2 font-bold">Nombre</div>
                        <div class="px-4 py-2">{{ $doctor->user->name}}</div>
                    </div>
                    <div class="grid grid-cols-1">
                        <div class="px-4 py-2 font-bold">Rut</div>
                        <div class="px-4 py-2">{{$doctor->user->rut}}</div>
                    </div>
                    <div class="grid grid-cols-1">
                        <div class="px-4 py-2 font-bold">Email.</div>
                        <div class="px-4 py-2">
                            <a class="text-blue-800" href="mailto:{{$doctor->user->email}}">{{$doctor->user->email}}</a>
                        </div>
                    </div>
                    <div class="grid grid-cols-1">
                        <div class="px-4 py-2 font-bold">Fecha de Nacimiento</div>
                        <div class="px-4 py-2">{{ \Carbon\Carbon::parse($doctor->user->birthday)->format('j \\d\e F Y')}}</div>
                    </div>
                </div>
            </div>
           
            <button wire:click="open"
            class="block w-full text-blue-800 text-sm font-semibold rounded-lg hover:bg-gray-300 bg-gray-200 focus:outline-none focus:shadow-outline focus:bg-gray-100 hover:shadow-xs p-3 my-4">Editar Información</button>
          
        @endif


    </div>

</div>
