<div>
    <div class="grid grid-cols-1 gap-2">
        @foreach ($respuestas as $key => $respuesta )
            @if($key == 9)
            
                    <div class="grid grid-cols-1">
                        <div class="font-bold"> 1) Medicamentos frecuentes</div>
                        <input type="text" placeholder ="{{$respuesta->p1}}" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500">
                    </div>
        
                    <div class="grid grid-cols-1">
                        <div class="font-bold"> 2) Es alérgico</div>
                        <input type="text"   placeholder ="{{$respuesta->p2}}" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500">
                    </div>
                  
                    <div class="grid grid-cols-1">
                        <div class="font-bold"> 3) Indique patologías previas</div>
                        <input type="text"   placeholder ="{{$respuesta->p3}}" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500">
                    </div>
                 
                    <div class="grid grid-cols-1">
                        <div class="font-bold"> 4) Se ha realizado cirugías </div>
                        <input type="text"   placeholder ="{{$respuesta->p4}}" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500">
                    </div>
               
                    <div class="grid grid-cols-1">
                        <div class="font-bold"> 5) Tiene algunas observaciones</div>
                        <input type="text"  placeholder ="{{$respuesta->p5}}"  class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500">
                    </div>

                  
            @else
           
              
            @endif
        @endforeach
    </div>
</div>
