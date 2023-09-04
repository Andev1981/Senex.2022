<aside class="fixed top-0 left-0 z-40 w-64 h-screen transition-transform -translate-x-full bg-white border-r border-gray-200 pt-14 md:translate-x-0 dark:bg-gray-800 dark:border-gray-700" aria-label="Sidenav" id="drawer-navigation">
    <div class="h-full px-3 py-5 overflow-y-auto bg-white dark:bg-gray-800">
        <form action="#" method="GET" class="mb-2 md:hidden">

        </form>
        <ul class="space-y-2">
            <li>
                <a href="{{ route('pacientes') }}" class="flex items-center p-2 text-base font-medium text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group {{ Request::path() == 'pacientes' ? 'border-2 border-sky-600' : ''}}">
                    <img class="w-6 h-6 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white" src="{{ asset('icons/usuario.gif') }}" alt="Icono Pacientes">
                    <span class="ml-3">Pacientes</span>
                </a>
            </li>
            <li>
                <a href="{{ route('kines') }}" class="flex items-center p-2 text-base font-medium text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group {{ Request::path() == 'kines' ? 'border-2 border-sky-600' : ''}}">
                       <img class="w-6 h-6 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white" src="{{ asset('icons/medicamento.gif') }}" alt="Icono Kines">
                    <span class="ml-3">Kines</span>
                </a>
            </li>
            <li>
                <a href="{{ route('types') }}" class="flex items-center p-2 text-base font-medium text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group {{ Request::path() == 'types' ? 'border-2 border-sky-600' : ''}}">
                      <img class="w-6 h-6 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white" src="{{ asset('icons/controlar.gif') }}" alt="Icono Atenciones">
                    <span class="ml-3">Tipo&nbsp;Atenciones</span>
                </a>
            </li>
            <hr>
            <li>
                <form method="POST" action="{{ route('logout') }}">
                @csrf
                 
                    <a href="route('logout')" 
                        onclick="event.preventDefault();
                        this.closest('form').submit();" class="flex items-center p-2 text-base font-medium text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group">
                         <img class="w-6 h-6 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white" src="{{ asset('icons/cerrar-sesion.gif') }}" alt="Icono Cerrar Sesion">
                          <span class="ml-3">Cerrar&nbsp;Sesión</span>
                    </a>
                </form>
            </li>
            <hr>
            @if (auth()->user()->email == 'javt1981@gmail.com')
             <li>
                <a href="{{ route('andres') }}" class="flex items-center p-2 text-base font-medium text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group {{ Request::path() == 'andres' ? 'border-2 border-sky-600' : ''}}">
                      <img class="w-6 h-6 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white" src="{{ asset('icons/controlar.gif') }}" alt="Icono Atenciones">
                    <span class="ml-3">Andres</span>
                </a>
            </li>   
            @endif

             
        </ul>
        <ul class="pt-5 mt-5 space-y-2 border-t border-gray-200 dark:border-gray-700">

        </ul>
    </div>

</aside>