<section class="p-2 dark:bg-gray-900 sm:p-5">
  <div class="max-w-screen-xl px-1 mx-auto lg:px-2">
    <div class="relative overflow-hidden bg-white shadow-md dark:bg-gray-800 sm:rounded-lg">
      <div
        class="flex flex-row items-center justify-between w-full p-4 align-middle md:flex-row md:space-y-0 md:space-x-4">
        <div class="flex items-center">
          <img src="{{ asset('icons/lista.gif') }}" alt="" class="w-10 h-10">
          <label class="text-lg font-semibold">Listado de Atenciones</label>
        </div>

        <div
          class="flex justify-end flex-shrink-0 w-full space-y-2 md:w-auto md:flex-row md:space-y-0 md:items-center md:space-x-3">

        </div>
      </div>

      <div class="flex flex-col items-center justify-between p-4 space-y-3 md:flex-row md:space-y-0 md:space-x-4">




      </div>

      <div class="grid grid-flow-row-dense grid-cols-6">
        <div class="col-span-1">
          <ul
            class="w-full text-sm font-medium text-gray-900 bg-white border border-gray-200 rounded-lg  dark:bg-gray-700 dark:border-gray-600 dark:text-white">
            <li class="mb-3">
              <select id="countries" wire:model="year"
                class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500">
                <option class="pl-6" value="2023">2023</option>
                <option class="pl-6" value="2024">2024</option>
                <option class="pl-6" value="2025">2025</option>
              </select>

            </li>
            <li wire:click="$set('month','01')"
              class="w-full border-b border-gray-200 rounded-t-lg dark:border-gray-600">
              <div class="flex items-center pl-3">
                <input id="list-radio-enero" type="radio" value="01" name="list-radio"
                  class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-700 dark:focus:ring-offset-gray-700 focus:ring-2 dark:bg-gray-600 dark:border-gray-500"
                  @if ($month=="01" ) checked @endif>
                <label for="list-radio-enero"
                  class="w-full py-1 ml-2 text-sm font-medium text-gray-900 dark:text-gray-300">Enero</label>
              </div>
            </li>
            <li wire:click="$set('month','02')"
              class="w-full border-b border-gray-200 rounded-t-lg dark:border-gray-600">
              <div class="flex items-center pl-3">
                <input id="list-radio-febrero" type="radio" value="02" name="list-radio"
                  class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-700 dark:focus:ring-offset-gray-700 focus:ring-2 dark:bg-gray-600 dark:border-gray-500"
                  @if ($month=="02" ) checked @endif>
                <label for="list-radio-febrero"
                  class="w-full py-1 ml-2 text-sm font-medium text-gray-900 dark:text-gray-300">Febrero</label>
              </div>
            </li>
            <li wire:click="$set('month','03')"
              class="w-full border-b border-gray-200 rounded-t-lg dark:border-gray-600">
              <div class="flex items-center pl-3">
                <input id="list-radio-marzo" type="radio" value="03" name="list-radio"
                  class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-700 dark:focus:ring-offset-gray-700 focus:ring-2 dark:bg-gray-600 dark:border-gray-500"
                  @if ($month=="03" ) checked @endif>
                <label for="list-radio-marzo"
                  class="w-full py-1 ml-2 text-sm font-medium text-gray-900 dark:text-gray-300">Marzo</label>
              </div>
            </li>
            <li wire:click="$set('month','04')"
              class="w-full border-b border-gray-200 rounded-t-lg dark:border-gray-600">
              <div class="flex items-center pl-3">
                <input id="list-radio-abril" type="radio" value="04" name="list-radio"
                  class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-700 dark:focus:ring-offset-gray-700 focus:ring-2 dark:bg-gray-600 dark:border-gray-500"
                  @if ($month=="04" ) checked @endif>
                <label for="list-radio-abril"
                  class="w-full py-1 ml-2 text-sm font-medium text-gray-900 dark:text-gray-300">Abril</label>
              </div>
            </li>
            <li wire:click="$set('month','05')"
              class="w-full border-b border-gray-200 rounded-t-lg dark:border-gray-600">
              <div class="flex items-center pl-3">
                <input id="list-radio-mayo" type="radio" value="05" name="list-radio"
                  class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-700 dark:focus:ring-offset-gray-700 focus:ring-2 dark:bg-gray-600 dark:border-gray-500"
                  @if ($month=="05" ) checked @endif>
                <label for="list-radio-mayo"
                  class="w-full py-1 ml-2 text-sm font-medium text-gray-900 dark:text-gray-300">Mayo</label>
              </div>
            </li>
            <li wire:click="$set('month','06')"
              class="w-full border-b border-gray-200 rounded-t-lg dark:border-gray-600">
              <div class="flex items-center pl-3">
                <input id="list-radio-junio" type="radio" value="06" name="list-radio"
                  class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-700 dark:focus:ring-offset-gray-700 focus:ring-2 dark:bg-gray-600 dark:border-gray-500"
                  @if ($month=="06" ) checked @endif>
                <label for="list-radio-junio"
                  class="w-full py-1 ml-2 text-sm font-medium text-gray-900 dark:text-gray-300">Junio</label>
              </div>
            </li>
            <li wire:click="$set('month','07')"
              class="w-full border-b border-gray-200 rounded-t-lg dark:border-gray-600">
              <div class="flex items-center pl-3">
                <input id="list-radio-julio" type="radio" value="07" name="list-radio"
                  class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-700 dark:focus:ring-offset-gray-700 focus:ring-2 dark:bg-gray-600 dark:border-gray-500"
                  @if ($month=="07" ) checked @endif>
                <label for="list-radio-julio"
                  class="w-full py-1 ml-2 text-sm font-medium text-gray-900 dark:text-gray-300">Julio</label>
              </div>
            </li>
            <li wire:click="$set('month','08')"
              class="w-full border-b border-gray-200 rounded-t-lg dark:border-gray-600">
              <div class="flex items-center pl-3">
                <input id="list-radio-agosto" type="radio" value="08" name="list-radio"
                  class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-700 dark:focus:ring-offset-gray-700 focus:ring-2 dark:bg-gray-600 dark:border-gray-500"
                  @if ($month=="08" ) checked @endif>
                <label for="list-radio-agosto"
                  class="w-full py-1 ml-2 text-sm font-medium text-gray-900 dark:text-gray-300">Agosto</label>
              </div>
            </li>
            <li wire:click="$set('month','09')"
              class="w-full border-b border-gray-200 rounded-t-lg dark:border-gray-600">
              <div class="flex items-center pl-3">
                <input id="list-radio-septiembre" type="radio" value="09" name="list-radio"
                  class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-700 dark:focus:ring-offset-gray-700 focus:ring-2 dark:bg-gray-600 dark:border-gray-500"
                  @if ($month=="09" ) checked @endif>
                <label for="list-radio-septiembre"
                  class="w-full py-1 ml-2 text-sm font-medium text-gray-900 dark:text-gray-300">Septiembre</label>
              </div>
            </li>
            <li wire:click="$set('month','10')"
              class="w-full border-b border-gray-200 rounded-t-lg dark:border-gray-600">
              <div class="flex items-center pl-3">
                <input id="list-radio-octubre" type="radio" value="10" name="list-radio"
                  class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-700 dark:focus:ring-offset-gray-700 focus:ring-2 dark:bg-gray-600 dark:border-gray-500"
                  @if ($month=="10" ) checked @endif>
                <label for="list-radio-octubre"
                  class="w-full py-1 ml-2 text-sm font-medium text-gray-900 dark:text-gray-300">Octubre</label>
              </div>
            </li>
            <li wire:click="$set('month','11')"
              class="w-full border-b border-gray-200 rounded-t-lg dark:border-gray-600">
              <div class="flex items-center pl-3">
                <input id="list-radio-noviembre" type="radio" value="11" name="list-radio"
                  class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-700 dark:focus:ring-offset-gray-700 focus:ring-2 dark:bg-gray-600 dark:border-gray-500"
                  @if ($month=="11" ) checked @endif>
                <label for="list-radio-noviembre"
                  class="w-full py-1 ml-2 text-sm font-medium text-gray-900 dark:text-gray-300">Noviembre</label>
              </div>
            </li>
            <li wire:click="$set('month','12')"
              class="w-full border-b border-gray-200 rounded-t-lg dark:border-gray-600">
              <div class="flex items-center pl-3">
                <input id="list-radio-diciembre" type="radio" value="12" name="list-radio"
                  class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-700 dark:focus:ring-offset-gray-700 focus:ring-2 dark:bg-gray-600 dark:border-gray-500"
                  @if ($month=="12" ) checked @endif>
                <label for="list-radio-diciembre"
                  class="w-full py-1 ml-2 text-sm font-medium text-gray-900 dark:text-gray-300">Diciembre</label>
              </div>
            </li>
          </ul>

        </div>
        <div class="col-span-5">
          <div class="mx-2 overflow-x-auto shadow-md">
            <table class="w-full text-sm text-left text-gray-500 dark:text-gray-400">
              <thead class="text-xs font-bold text-gray-700 bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                <tr>
                  <th wire:click="order('updated_at')" scope="col" class="px-4 py-3 cursor-pointer">
                    FECHA&nbsp;EDICIÓN
                    @if ($sort == 'updated_at')
                    @if ($direction == 'asc')
                    <svg xmlns="http://www.w3.org/2000/svg" class="float-right w-4 h-4" viewBox="0 0 576 512">
                      <path
                        d="M183.6 42.4C177.5 35.8 169 32 160 32s-17.5 3.8-23.6 10.4l-88 96c-11.9 13-11.1 33.3 2 45.2s33.3 11.1 45.2-2L128 146.3V448c0 17.7 14.3 32 32 32s32-14.3 32-32V146.3l32.4 35.4c11.9 13 32.2 13.9 45.2 2s13.9-32.2 2-45.2l-88-96zM320 320c0 17.7 14.3 32 32 32h50.7l-73.4 73.4c-9.2 9.2-11.9 22.9-6.9 34.9s16.6 19.8 29.6 19.8H480c17.7 0 32-14.3 32-32s-14.3-32-32-32H429.3l73.4-73.4c9.2-9.2 11.9-22.9 6.9-34.9s-16.6-19.8-29.6-19.8H352c-17.7 0-32 14.3-32 32zM416 32c-12.1 0-23.2 6.8-28.6 17.7l-64 128-16 32c-7.9 15.8-1.5 35 14.3 42.9s35 1.5 42.9-14.3l7.2-14.3h88.4l7.2 14.3c7.9 15.8 27.1 22.2 42.9 14.3s22.2-27.1 14.3-42.9l-16-32-64-128C439.2 38.8 428.1 32 416 32zM395.8 176L416 135.6 436.2 176H395.8z" />
                    </svg>
                    @else
                    <svg xmlns="http://www.w3.org/2000/svg" class="float-right w-4 h-4" viewBox="0 0 576 512">
                      <path
                        d="M183.6 469.6C177.5 476.2 169 480 160 480s-17.5-3.8-23.6-10.4l-88-96c-11.9-13-11.1-33.3 2-45.2s33.3-11.1 45.2 2L128 365.7V64c0-17.7 14.3-32 32-32s32 14.3 32 32V365.7l32.4-35.4c11.9-13 32.2-13.9 45.2-2s13.9 32.2 2 45.2l-88 96zM320 320c0-17.7 14.3-32 32-32H480c12.9 0 24.6 7.8 29.6 19.8s2.2 25.7-6.9 34.9L429.3 416H480c17.7 0 32 14.3 32 32s-14.3 32-32 32H352c-12.9 0-24.6-7.8-29.6-19.8s-2.2-25.7 6.9-34.9L402.7 352H352c-17.7 0-32-14.3-32-32zM416 32c12.1 0 23.2 6.8 28.6 17.7l64 128 16 32c7.9 15.8 1.5 35-14.3 42.9s-35 1.5-42.9-14.3L460.2 224H371.8l-7.2 14.3c-7.9 15.8-27.1 22.2-42.9 14.3s-22.2-27.1-14.3-42.9l16-32 64-128C392.8 38.8 403.9 32 416 32zM395.8 176h40.4L416 135.6 395.8 176z" />
                    </svg>
                    @endif
                    @else
                    <svg xmlns="http://www.w3.org/2000/svg" class="float-right w-4 h-4" fill="none" viewBox="0 0 24 24"
                      stroke="currentColor" stroke-width="2">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
                    </svg>
                    @endif
                  </th>
                  <th wire:click="order('doctor_id')" scope="col" class="px-4 py-3 cursor-pointer">
                    KINE
                    @if ($sort == 'doctor_id')
                    @if ($direction == 'asc')
                    <svg xmlns="http://www.w3.org/2000/svg" class="float-right w-4 h-4" viewBox="0 0 576 512">
                      <path
                        d="M183.6 42.4C177.5 35.8 169 32 160 32s-17.5 3.8-23.6 10.4l-88 96c-11.9 13-11.1 33.3 2 45.2s33.3 11.1 45.2-2L128 146.3V448c0 17.7 14.3 32 32 32s32-14.3 32-32V146.3l32.4 35.4c11.9 13 32.2 13.9 45.2 2s13.9-32.2 2-45.2l-88-96zM320 320c0 17.7 14.3 32 32 32h50.7l-73.4 73.4c-9.2 9.2-11.9 22.9-6.9 34.9s16.6 19.8 29.6 19.8H480c17.7 0 32-14.3 32-32s-14.3-32-32-32H429.3l73.4-73.4c9.2-9.2 11.9-22.9 6.9-34.9s-16.6-19.8-29.6-19.8H352c-17.7 0-32 14.3-32 32zM416 32c-12.1 0-23.2 6.8-28.6 17.7l-64 128-16 32c-7.9 15.8-1.5 35 14.3 42.9s35 1.5 42.9-14.3l7.2-14.3h88.4l7.2 14.3c7.9 15.8 27.1 22.2 42.9 14.3s22.2-27.1 14.3-42.9l-16-32-64-128C439.2 38.8 428.1 32 416 32zM395.8 176L416 135.6 436.2 176H395.8z" />
                    </svg>
                    @else
                    <svg xmlns="http://www.w3.org/2000/svg" class="float-right w-4 h-4" viewBox="0 0 576 512">
                      <path
                        d="M183.6 469.6C177.5 476.2 169 480 160 480s-17.5-3.8-23.6-10.4l-88-96c-11.9-13-11.1-33.3 2-45.2s33.3-11.1 45.2 2L128 365.7V64c0-17.7 14.3-32 32-32s32 14.3 32 32V365.7l32.4-35.4c11.9-13 32.2-13.9 45.2-2s13.9 32.2 2 45.2l-88 96zM320 320c0-17.7 14.3-32 32-32H480c12.9 0 24.6 7.8 29.6 19.8s2.2 25.7-6.9 34.9L429.3 416H480c17.7 0 32 14.3 32 32s-14.3 32-32 32H352c-12.9 0-24.6-7.8-29.6-19.8s-2.2-25.7 6.9-34.9L402.7 352H352c-17.7 0-32-14.3-32-32zM416 32c12.1 0 23.2 6.8 28.6 17.7l64 128 16 32c7.9 15.8 1.5 35-14.3 42.9s-35 1.5-42.9-14.3L460.2 224H371.8l-7.2 14.3c-7.9 15.8-27.1 22.2-42.9 14.3s-22.2-27.1-14.3-42.9l16-32 64-128C392.8 38.8 403.9 32 416 32zM395.8 176h40.4L416 135.6 395.8 176z" />
                    </svg>
                    @endif
                    @else
                    <svg xmlns="http://www.w3.org/2000/svg" class="float-right w-4 h-4" fill="none" viewBox="0 0 24 24"
                      stroke="currentColor" stroke-width="2">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
                    </svg>
                    @endif
                  </th>
                  <th wire:click="order('patient_id')" scope="col" class="px-4 py-3 cursor-pointer">
                    PACIENTE
                    @if ($sort == 'patient_id')
                    @if ($direction == 'asc')
                    <svg xmlns="http://www.w3.org/2000/svg" class="float-right w-4 h-4" viewBox="0 0 576 512">
                      <path
                        d="M183.6 42.4C177.5 35.8 169 32 160 32s-17.5 3.8-23.6 10.4l-88 96c-11.9 13-11.1 33.3 2 45.2s33.3 11.1 45.2-2L128 146.3V448c0 17.7 14.3 32 32 32s32-14.3 32-32V146.3l32.4 35.4c11.9 13 32.2 13.9 45.2 2s13.9-32.2 2-45.2l-88-96zM320 320c0 17.7 14.3 32 32 32h50.7l-73.4 73.4c-9.2 9.2-11.9 22.9-6.9 34.9s16.6 19.8 29.6 19.8H480c17.7 0 32-14.3 32-32s-14.3-32-32-32H429.3l73.4-73.4c9.2-9.2 11.9-22.9 6.9-34.9s-16.6-19.8-29.6-19.8H352c-17.7 0-32 14.3-32 32zM416 32c-12.1 0-23.2 6.8-28.6 17.7l-64 128-16 32c-7.9 15.8-1.5 35 14.3 42.9s35 1.5 42.9-14.3l7.2-14.3h88.4l7.2 14.3c7.9 15.8 27.1 22.2 42.9 14.3s22.2-27.1 14.3-42.9l-16-32-64-128C439.2 38.8 428.1 32 416 32zM395.8 176L416 135.6 436.2 176H395.8z" />
                    </svg>
                    @else
                    <svg xmlns="http://www.w3.org/2000/svg" class="float-right w-4 h-4" viewBox="0 0 576 512">
                      <path
                        d="M183.6 469.6C177.5 476.2 169 480 160 480s-17.5-3.8-23.6-10.4l-88-96c-11.9-13-11.1-33.3 2-45.2s33.3-11.1 45.2 2L128 365.7V64c0-17.7 14.3-32 32-32s32 14.3 32 32V365.7l32.4-35.4c11.9-13 32.2-13.9 45.2-2s13.9 32.2 2 45.2l-88 96zM320 320c0-17.7 14.3-32 32-32H480c12.9 0 24.6 7.8 29.6 19.8s2.2 25.7-6.9 34.9L429.3 416H480c17.7 0 32 14.3 32 32s-14.3 32-32 32H352c-12.9 0-24.6-7.8-29.6-19.8s-2.2-25.7 6.9-34.9L402.7 352H352c-17.7 0-32-14.3-32-32zM416 32c12.1 0 23.2 6.8 28.6 17.7l64 128 16 32c7.9 15.8 1.5 35-14.3 42.9s-35 1.5-42.9-14.3L460.2 224H371.8l-7.2 14.3c-7.9 15.8-27.1 22.2-42.9 14.3s-22.2-27.1-14.3-42.9l16-32 64-128C392.8 38.8 403.9 32 416 32zM395.8 176h40.4L416 135.6 395.8 176z" />
                    </svg>
                    @endif
                    @else
                    <svg xmlns="http://www.w3.org/2000/svg" class="float-right w-4 h-4" fill="none" viewBox="0 0 24 24"
                      stroke="currentColor" stroke-width="2">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
                    </svg>
                    @endif
                  </th>



                  <th wire:click="order('application_type_id')" scope="col" class="px-4 py-3 cursor-pointer">
                    TIPO&nbsp;DE&nbsp;ATENCIÓN
                    @if ($sort == 'application_type_id')
                    @if ($direction == 'asc')
                    <svg xmlns="http://www.w3.org/2000/svg" class="float-right w-4 h-4" viewBox="0 0 576 512">
                      <path
                        d="M183.6 42.4C177.5 35.8 169 32 160 32s-17.5 3.8-23.6 10.4l-88 96c-11.9 13-11.1 33.3 2 45.2s33.3 11.1 45.2-2L128 146.3V448c0 17.7 14.3 32 32 32s32-14.3 32-32V146.3l32.4 35.4c11.9 13 32.2 13.9 45.2 2s13.9-32.2 2-45.2l-88-96zM320 320c0 17.7 14.3 32 32 32h50.7l-73.4 73.4c-9.2 9.2-11.9 22.9-6.9 34.9s16.6 19.8 29.6 19.8H480c17.7 0 32-14.3 32-32s-14.3-32-32-32H429.3l73.4-73.4c9.2-9.2 11.9-22.9 6.9-34.9s-16.6-19.8-29.6-19.8H352c-17.7 0-32 14.3-32 32zM416 32c-12.1 0-23.2 6.8-28.6 17.7l-64 128-16 32c-7.9 15.8-1.5 35 14.3 42.9s35 1.5 42.9-14.3l7.2-14.3h88.4l7.2 14.3c7.9 15.8 27.1 22.2 42.9 14.3s22.2-27.1 14.3-42.9l-16-32-64-128C439.2 38.8 428.1 32 416 32zM395.8 176L416 135.6 436.2 176H395.8z" />
                    </svg>
                    @else
                    <svg xmlns="http://www.w3.org/2000/svg" class="float-right w-4 h-4" viewBox="0 0 576 512">
                      <path
                        d="M183.6 469.6C177.5 476.2 169 480 160 480s-17.5-3.8-23.6-10.4l-88-96c-11.9-13-11.1-33.3 2-45.2s33.3-11.1 45.2 2L128 365.7V64c0-17.7 14.3-32 32-32s32 14.3 32 32V365.7l32.4-35.4c11.9-13 32.2-13.9 45.2-2s13.9 32.2 2 45.2l-88 96zM320 320c0-17.7 14.3-32 32-32H480c12.9 0 24.6 7.8 29.6 19.8s2.2 25.7-6.9 34.9L429.3 416H480c17.7 0 32 14.3 32 32s-14.3 32-32 32H352c-12.9 0-24.6-7.8-29.6-19.8s-2.2-25.7 6.9-34.9L402.7 352H352c-17.7 0-32-14.3-32-32zM416 32c12.1 0 23.2 6.8 28.6 17.7l64 128 16 32c7.9 15.8 1.5 35-14.3 42.9s-35 1.5-42.9-14.3L460.2 224H371.8l-7.2 14.3c-7.9 15.8-27.1 22.2-42.9 14.3s-22.2-27.1-14.3-42.9l16-32 64-128C392.8 38.8 403.9 32 416 32zM395.8 176h40.4L416 135.6 395.8 176z" />
                    </svg>
                    @endif
                    @else
                    <svg xmlns="http://www.w3.org/2000/svg" class="float-right w-4 h-4" fill="none" viewBox="0 0 24 24"
                      stroke="currentColor" stroke-width="2">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
                    </svg>
                    @endif
                  </th>

                </tr>
              </thead>
              <tbody>
                @forelse ( $applyItems as $applyItem)
                <tr class="items-center justify-between bg-white border-b dark:border-gray-700 hover:bg-cyan-50">
                  <td class="px-6 py-4 uppercase whitespace-nowrap">
                    {{ \Carbon\Carbon::parse(strtotime($applyItem->updated_at))->format('d/m/Y H:i') }}
                  </td>
                  <td class="items-center py-2 pl-2 mx-2">
                    <div class="ml-2 font-medium uppercase dark:text-white">
                      {{ $applyItem->doctor->name ?? '' }} {{ $applyItem->doctor->last_name ?? '' }}
                    </div>
                  </td>
                  <td class="items-center py-2 pl-2 mx-2">
                    <div class="ml-2 font-medium uppercase dark:text-white">
                      {{ $applyItem->patient->name ?? '' }} {{ $applyItem->patient->last_name ?? '' }}
                    </div>
                  </td>
                  <td class="px-6 py-4 uppercase">
                    {{ $applyItem->applicationType->name ?? '' }}
                  </td>
                </tr>
                @empty
                <tr>
                  <td colspan="5" class="text-center">
                    No hay registros para su busqueda...
                  </td>
                </tr>
                @endforelse
              </tbody>
            </table>
          </div>
          <nav class="flex flex-col items-start justify-between p-4 space-y-3 md:flex-row md:items-center md:space-y-0"
            aria-label="Table navigation"> {{ $applyItems->links() }}

          </nav>

        </div>
      </div>



    </div>
  </div>
</section>