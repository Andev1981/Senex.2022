<div>
    <div class="bg-white p-3 shadow-sm rounded-sm">
        <div class="w-full mx-auto mt-4  rounded">
            <!-- Tabs -->
            <ul id="tabs" class="inline-flex w-full px-1 pt-2 ">
              <li class="px-4 py-2 font-semibold text-gray-800 rounded-t opacity-50"><a id="default-tab" href="#second">Tratamientos</a></li>
              {{-- <li class="px-4 py-2 font-semibold text-gray-800 rounded-t opacity-50"><a href="#fivth">Agenda</a></li> --}}
              @can('role-delete')
              <li class="px-4 py-2 font-semibold text-gray-800 rounded-t opacity-50"><a href="#sixth">Servicios</a></li>
              @endcan
              <li class="px-4 py-2 -mb-px font-semibold text-gray-800 border-b-2 border-blue-400 rounded-t opacity-50"><a  href="#first">Cuentas/Pagos</a></li>
            </ul>

            <!-- Tab Contents -->
            <div id="tab-contents">
              <div id="second" class="hidden p-4">
                @livewire('doctor.tabs.atendidas',['doctor' => $doctor])
              </div>
              {{--      <div id="fivth" class="hidden p-4">
                @livewire('doctor.tabs.agenda',['doctor' => $doctor])
              </div> --}}
              @can('role-delete')
              <div id="sixth" class="hidden p-4">
                @livewire('doctor.tabs.services',['doctor' => $doctor])
              </div>
              @endcan
              <div id="first" class="p-4">
                    @livewire('doctor.tabs.cuentas',['doctor' => $doctor])
              </div>
            </div>
          </div>
    </div>
</div>
