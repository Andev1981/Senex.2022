<nav x-data="{ open: false }" class="bg-white border-b border-gray-100">
    <!-- Primary Navigation Menu -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
            
            <div class="flex">
                <!-- Logo -->
                <div class="shrink-0 flex items-center">
                    <a href="{{ route('/') }}">
                        <x-application-logo class="block h-10 w-auto fill-current text-gray-600" />
                    </a>
                </div>
                @auth
                @if (auth()->user()->roles[0]->id === 1)
                        <!-- Navigation Links -->
                        <div class="hidden space-x-8 sm:-my-px sm:ml-10 sm:flex">
                            <x-nav-link :href="route('pacientes.index')" :active="request()->routeIs(['pacientes','paciente.show'])">
                                {{ __('Pacientes') }}
                            </x-nav-link>
                            <x-nav-link :href="route('doctores')" :active="request()->routeIs(['doctores','doctor.show'])">
                                {{ __('Kinesiólogos') }}
                            </x-nav-link>
                        </div>
                @elseif(auth()->user()->roles[0]->id === 2)
                        <!-- Navigation Links -->
                        <div class="hidden space-x-8 sm:-my-px sm:ml-10 sm:flex">
                            <x-nav-link :href="route('admin')" :active="request()->routeIs('admin')">
                                {{ __('Dashboard') }}
                            </x-nav-link>
                            <x-nav-link :href="route('users.index')" :active="request()->routeIs('users.index')">
                                {{ __('Usuarios') }}
                            </x-nav-link>
                        </div>

                @elseif(auth()->user()->roles[0]->id === 3)
                        <!-- Navigation Links -->
                        <div class="hidden space-x-8 sm:-my-px sm:ml-10 sm:flex">
                            <x-nav-link :href="route('pacientes.index')" :active="request()->routeIs(['pacientes','paciente.show'])">
                                {{ __('Mis Pacientes') }}
                            </x-nav-link>
                            <x-nav-link :href="route('doctor.show')" :active="request()->routeIs(['doctores','doctor.show'])">
                                {{ __('Mi perfil') }}
                            </x-nav-link>
                        </div>
                @endif
                @endauth

            </div>

            <!-- Settings Dropdown -->
            <div class="hidden sm:flex sm:items-center sm:ml-6">
                @auth
                <x-dropdown align="middle" width="48">
                    <x-slot name="trigger">
                        <button class="flex items-center text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300 focus:outline-none focus:text-gray-700 focus:border-gray-300 transition duration-150 ease-in-out">
                            <div>{{ Auth::user()->name }}</div>

                            <div class="ml-1">
                                <svg class="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                                    <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
                                </svg>
                            </div>
                        </button>
                    </x-slot>

                    <x-slot name="content">
                        <!-- Authentication -->
                        <x-responsive-nav-link :href="route('dashboard')" :active="request()->routeIs('dashboard')">
                            {{ __('Inicio') }}
                        </x-responsive-nav-link>
                        <x-dropdown-link :href="route('ayudaVideo')">
                            {{ __('Ayuda') }}
                        </x-dropdown-link>
                     
                        <form method="POST" action="{{ route('logout') }}">
                            @csrf

                            <x-dropdown-link :href="route('logout')"
                                    onclick="event.preventDefault();
                                                this.closest('form').submit();">
                                {{ __('Cerrar sesión') }}
                            </x-dropdown-link>
                        </form>

                    </x-slot>
                </x-dropdown>
                @else
                        <a href="{{ route('login') }}" class="text-sm text-gray-700 dark:text-gray-500 underline"> {{ __('Ingreso') }}</a>
                @endauth
            </div>

            <!-- Hamburger -->
            <div class="-mr-2 flex items-center sm:hidden">
                <button @click="open = ! open" class="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:bg-gray-100 focus:text-gray-500 transition duration-150 ease-in-out">
                    <svg class="h-6 w-6" stroke="currentColor" fill="none" viewBox="0 0 24 24">
                        <path :class="{'hidden': open, 'inline-flex': ! open }" class="inline-flex" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
                        <path :class="{'hidden': ! open, 'inline-flex': open }" class="hidden" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>
        </div>
    </div>

    <!-- Responsive Navigation Menu -->
    <div :class="{'block': open, 'hidden': ! open}" class="hidden sm:hidden">
        <div class="pt-2 pb-3 space-y-1">
            @if(!auth()->user())
            <x-responsive-nav-link :href="route('dashboard')" :active="request()->routeIs('dashboard')">
                {{ __('Ingresar') }}
            </x-responsive-nav-link>
            @else 
           <x-responsive-nav-link :href="route('dashboard')" :active="request()->routeIs('dashboard')">
                {{ __('Inicio') }}
            </x-responsive-nav-link>
            <x-responsive-nav-link :href="route('ayudaVideo')" :active="request()->routeIs('ayudaVideo')">
                {{ __('Ayuda') }}
            </x-responsive-nav-link>
            
            <form method="POST" action="{{ route('logout') }}">
                @csrf
                <x-dropdown-link :href="route('logout')"
                         onclick="event.preventDefault();
                          this.closest('form').submit();">
                        {{ __('Cerrar sesión') }}
                </x-dropdown-link>
            </form>
             
            
            @endif
            
        </div>

        <!-- Responsive Settings Options -->
        <div class="pt-4 pb-1 border-t border-gray-200">

                <div class="hidden fixed top-0 right-0 px-6 py-4 sm:block">
                    @auth
                        <a href="{{ url('/dashboard') }}" class="text-sm text-gray-700 dark:text-gray-500 underline">Mi cuenta</a>
                        <div class="px-4">
                            <div class="font-medium text-base text-gray-800">{{ Auth::user()->name }}</div>
                            <div class="font-medium text-sm text-gray-500">{{ Auth::user()->email }}</div>
                        </div>

                        <div class="mt-3 space-y-1">
                            <!-- Authentication -->
                            <form method="POST" action="{{ route('logout') }}">
                                @csrf

                                <x-responsive-nav-link :href="route('logout')"
                                        onclick="event.preventDefault();
                                                    this.closest('form').submit();">
                                    {{ __('Cerrar sesión') }}
                                </x-responsive-nav-link>
                            </form>
                        </div>
                    @else
                        <a href="{{ route('login') }}" class="text-sm negro dark:text-gray-500 hover:underline"> {{ __('Ingreso') }}</a>
                    @endauth
                </div>
        </div>
    </div>
</nav>
