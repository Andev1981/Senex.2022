<x-app-layout>
    <x-slot name="header">
        <h2 class="font-semibold text-xl text-gray-800 leading-tight">
              <nav class="flex" aria-label="Breadcrumb">
                <ol class="inline-flex items-center space-x-1 md:space-x-3">
                    <li class="inline-flex items-center">
                        <a href="{{route('doctores')}}" class="inline-flex items-center text-sm font-medium text-gray-700 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white">
                            <svg xmlns="http://www.w3.org/2000/svg" class="mr-2 h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M5 4a1 1 0 00-2 0v7.268a2 2 0 000 3.464V16a1 1 0 102 0v-1.268a2 2 0 000-3.464V4zM11 4a1 1 0 10-2 0v1.268a2 2 0 000 3.464V16a1 1 0 102 0V8.732a2 2 0 000-3.464V4zM16 3a1 1 0 011 1v7.268a2 2 0 010 3.464V16a1 1 0 11-2 0v-1.268a2 2 0 010-3.464V4a1 1 0 011-1z" />
                              </svg>
                            Perfil Kinesiólogo
                        </a>
                    </li>
                </ol>
            </nav>
        </h2>
    </x-slot>

    <div class="container mx-auto my-5 p-5">
        <div class="md:flex no-wrap md:-mx-2 ">
            <!-- Left Side -->
            <div class="w-full md:w-3/12 md:mx-2">
                <!-- Profile Card -->
                <div class="bg-white p-3 border-t-4 border-blue-600">
                    <div class="image overflow-hidden">
                        <img class="h-auto w-full mx-auto"
                            src="{{ asset('img/icon-doctor.png')}}"
                            alt="">
                    </div>
                    <div class="text-center">
                        <h1 class="text-gray-900 font-bold text-xl leading-8 my-1">{{ $doctor->user->name}}</h1>
                        <h3 class="text-gray-600 font-lg text-semibold leading-6">{{$doctor->user->rut}}</h3>
                    </div>

{{--                     <p class="text-sm text-gray-500 hover:text-gray-600 leading-6">Lorem ipsum dolor sit amet
                        consectetur adipisicing elit.
                        Reprehenderit, eligendi dolorum sequi illum qui unde aspernatur non deserunt</p> --}}
                    <ul
                        class="bg-gray-100 text-gray-600 hover:text-gray-700 hover:shadow py-2 px-3 mt-3 divide-y rounded shadow-sm">
                        <li class="flex items-center py-3">
                            {{-- <span>Estado</span>
                            @if ($doctor->status == 1)
                                <span class="ml-auto"><span class="bg-red-500 py-1 px-2 rounded text-white text-sm">Inactivo</span></span>
                            @else
                                <span class="ml-auto"><span class="bg-green-500 py-1 px-2 rounded text-white text-sm">Activo</span></span>
                            @endif --}}
                        </li>
                        <li class="flex items-center py-3">
                            <span>Miembro desde</span>
                            <span class="ml-auto float-right">{{ \Carbon\Carbon::parse($doctor->created_at)->format('j \\d\e F Y')}}</span>
                        </li>
                    </ul>
                </div>
                <!-- End of profile card -->
                <div class="my-4"></div>

            </div>
            <!-- Right Side -->
            <div class="w-full md:w-9/12 mx-2 h-64">
                <!-- Profile tab -->
                <!-- About Section -->
               @livewire('doctor.detail',['doctor' => $doctor])
                <!-- End of about section -->

                <div class="my-4"></div>

                <!-- Experience and education -->
                <div class="bg-white p-3 shadow-sm rounded-sm">
                    <div class="w-full mx-auto mt-4  rounded">
                        <!-- Tabs -->
                        <ul id="tabs" class="inline-flex w-full px-1 pt-2 ">
                          <li class="px-4 py-2 -mb-px font-semibold text-gray-800 border-b-2 border-blue-400 rounded-t opacity-50"><a id="default-tab" href="#first">Cuentas</a></li>
                          <li class="px-4 py-2 font-semibold text-gray-800 rounded-t opacity-50"><a href="#second">Solicitudes Atendidas</a></li>
                          <li class="px-4 py-2 font-semibold text-gray-800 rounded-t opacity-50"><a href="#third">Solicitudes Pendientes</a></li>
                          <li class="px-4 py-2 font-semibold text-gray-800 rounded-t opacity-50"><a href="#fourth">Pacientes</a></li>
                        </ul>

                        <!-- Tab Contents -->
                        <div id="tab-contents">
                          <div id="first" class="p-4">
                            Resumen de cuentas
                          </div>
                          <div id="second" class="hidden p-4">
                            Resumen Solicitudes Atendidas
                          </div>
                          <div id="third" class="hidden p-4">
                            Resumen Solicitudes Pendientes
                          </div>
                          <div id="fourth" class="hidden p-4">
                           Pacientes
                          </div>

                        </div>
                      </div>
                </div>
                <!-- End of profile tab -->
@section('scripts')
    <script>
    let tabsContainer = document.querySelector("#tabs");

    let tabTogglers = tabsContainer.querySelectorAll("a");
    console.log(tabTogglers);

    tabTogglers.forEach(function(toggler) {
    toggler.addEventListener("click", function(e) {
        e.preventDefault();

        let tabName = this.getAttribute("href");

        let tabContents = document.querySelector("#tab-contents");

        for (let i = 0; i < tabContents.children.length; i++) {

        tabTogglers[i].parentElement.classList.remove("border-blue-400", "border-b",  "-mb-px", "opacity-100");  tabContents.children[i].classList.remove("hidden");
        if ("#" + tabContents.children[i].id === tabName) {
            continue;
        }
        tabContents.children[i].classList.add("hidden");

        }
            e.target.parentElement.classList.add("border-blue-400", "border-b-4", "-mb-px", "opacity-100");
        });
    });

    document.getElementById("default-tab").click();
    </script>
@endsection
</x-admin-layout>

