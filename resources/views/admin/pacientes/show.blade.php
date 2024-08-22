<x-app-layout>
    <x-slot name="header">
        <h2 class="font-semibold text-xl text-gray-800 leading-tight">
            <nav class="flex" aria-label="Breadcrumb">
                <ol class="inline-flex items-center space-x-1 md:space-x-3">
                    <li class="inline-flex items-center">
                        <a
                            class="inline-flex items-center text-sm font-medium text-gray-700 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white">
                            <svg xmlns="http://www.w3.org/2000/svg" class="mr-2 h-4 w-4" viewBox="0 0 20 20"
                                fill="currentColor">
                                <path
                                    d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                            </svg>
                            Perfil Paciente
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
                @livewire('patient.card',['paciente' => $paciente->id])
                <!-- End of profile card -->
                <div class="my-4"></div>

            </div>

            <!-- Right Side -->
            <div class="w-full md:w-9/12 mx-2 h-64">
                <!-- Profile tab -->
                <!-- About Section -->
                @livewire('patient.detail',['paciente' => $paciente])

                <div class="my-4"></div>

                <!-- Experience and education -->
                <div class="bg-white p-3 shadow-sm rounded-sm">
                    <div class="w-full mx-auto mt-4  rounded">
                        <a type="button" href="{{ route('step.one', $paciente) }}"
                            class="bg-sky-600 hover:bg-blue-800 mx-auto lg:mx-0 text-white font-bold rounded-full my-2 py-2 px-2 shadow-lg float-right text-sm">Nuevo
                            Tratamiento</a>
                        <!-- Tabs -->
                        <ul id="tabs" class="inline-flex w-full px-1 pt-2 ">
                            <li
                                class="px-4 py-2 -mb-px font-semibold text-gray-800 border-b-2 border-blue-400 rounded-t opacity-50">
                                <a id="default-tab" href="#first">Tratamientos</a></li>
                        </ul>

                        <!-- Tab Contents -->
                        <div id="tab-contents">
                            <div id="first" class="p-4">
                                <div class="overflow-x-auto relative">
                                    <table class="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                                        <thead
                                            class="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                                            <tr>
                                                <th scope="col" class="py-3 px-6">
                                                    Tipo
                                                </th>
                                                <th scope="col" class="py-3 px-6">
                                                    Kinesiólogo
                                                </th>

                                                <th scope="col" class="py-3 px-6">
                                                    Estado
                                                </th>
                                                <th scope="col" class="py-3 px-6">
                                                    Sesiones
                                                </th>
                                                <th scope="col" class="py-3 px-6">
                                                    Pagos
                                                </th>
                                                <th scope="col" class="py-3 px-6">
                                                    Fecha&nbsp;Solicitud
                                                </th>
                                                <th scope="col" class="py-3 px-6">
                                                    Detalle
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            @forelse ($solicitudes as $solicitud)
                                            <tr class="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                                                <th scope="row"
                                                    class="py-4 px-6 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                                                    {{$solicitud->solicitud_type->name}}
                                                </th>
                                                <td class="py-4 px-6">
                                                    {{$solicitud->doctor->user->name}}
                                                </td>

                                                <td class="py-4 px-6">
                                                    @if ( $solicitud->status == 0)
                                                    <span class="bg-red-500 px-2 rounded-xl text-white text-xs">No
                                                        Iniciada</span>
                                                    @elseif ( $solicitud->status ==1)
                                                    <span
                                                        class="bg-yellow-400 px-2 rounded-xl text-white text-xs">En&nbsp;Proceso</span>
                                                    @elseif($solicitud->status == 2)
                                                    <span
                                                        class="bg-green-400 px-2 rounded-xl text-white text-xs">Atendida</span>
                                                    @elseif($solicitud->status == 3)
                                                    <span
                                                        class="bg-gray-200 px-2 rounded-xl text-gray-900 text-xs">Suspendida</span>
                                                    @endif
                                                </td>
                                                <td class="px-6 py-4">
                                                    <span
                                                        class="bg-indigo-600 text-white text-xs font-semibold mr-2 px-3 py-1 rounded-full dark:bg-red-200 dark:text-red-900">
                                                        0&nbsp;/&nbsp;{{$solicitud->sessions_count}}
                                                    </span>
                                                </td>
                                                <td class="py-4 px-6">
                                                    @if ($solicitud->payment !== null)
                                                    @if ($solicitud->payment->status == 0)
                                                    <span class="bg-red-500 px-2 rounded-xl text-white text-xs">
                                                        0
                                                    </span>
                                                    @elseif ( $solicitud->payment->status ==1)
                                                    <span class="bg-yellow-400 px-2 rounded-xl text-white text-xs">
                                                        1
                                                    </span>
                                                    @elseif($solicitud->payment->status == 2)
                                                    <span class="bg-yellow-400 px-2 rounded-xl text-white text-xs">
                                                        2
                                                    </span>
                                                    @endif
                                                    @else
                                                    <span class="bg-red-500 px-2 rounded-xl text-white text-xs">
                                                        Sin&nbsp;pagos
                                                    </span>
                                                    @endif
                                                </td>
                                                <td class="py-4 px-6">
                                                    {{\Carbon\Carbon::parse($solicitud->attention_date)->format('d-m-Y')}}
                                                </td>
                                                <td class="px-6 py-4">
                                                    <a href="{{ route('solicitud.show',$solicitud->id) }}" type="button"
                                                        class="font-medium text-blue-600 dark:text-blue-500 hover:underline">
                                                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4"
                                                            fill="none" viewBox="0 0 24 24" stroke="currentColor"
                                                            stroke-width="2">
                                                            <path stroke-linecap="round" stroke-linejoin="round"
                                                                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                            <path stroke-linecap="round" stroke-linejoin="round"
                                                                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                        </svg>
                                                    </a>
                                                </td>
                                            </tr>
                                            @empty
                                            <tr>
                                                <td>Sin datos</td>
                                            </tr>
                                            @endforelse
                                        </tbody>
                                    </table>
                                    {{$solicitudes->links()}}
                                </div>
                            </div>
                            <div id="second" class="hidden p-4">
                                <div class="overflow-x-auto relative">
                                    <table class="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                                        <thead
                                            class="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                                            <tr>
                                                <th>Tipo</th>
                                                <th scope="col" class="py-3 px-6">
                                                    Monto
                                                </th>
                                                <th scope="col" class="py-3 px-6">
                                                    Estado
                                                </th>
                                                <th scope="col" class="py-3 px-6">
                                                    Fecha
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            @foreach ($pagos as $pago)
                                            <tr class="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                                                <th scope="row"
                                                    class="py-4 px-6 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                                                    Webpay
                                                </th>
                                                <td scope="row">
                                                    {{$pago->total}}
                                                </td>
                                                <td class="py-4 px-6">
                                                    @if ($pago->status == 0)
                                                    Pago no realizado
                                                    @elseif($pago->status == 1)
                                                    Pendiente
                                                    @elseif($pago->status == 2)
                                                    Aprobada
                                                    @elseif($pago->status == 3)
                                                    Pago cancelado o fallido
                                                    @endif
                                                </td>
                                                <td class="py-4 px-6">
                                                    {{$pago->created_at}}
                                                </td>
                                            </tr>
                                            @endforeach
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
                <!-- End of profile tab -->
            </div>
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