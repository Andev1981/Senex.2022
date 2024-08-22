<div>
  <section>
    <div class="max-w-5xl p-5 mx-auto bg-slate-100 rounded-xl">
      <div class="flex pb-2 pl-1 lg:flex lg:items-center lg:justify-between">
        <svg class="w-6 h-6 pt-1 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"
          width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
          <path fill-rule="evenodd"
            d="M12 6a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7Zm-1.5 8a4 4 0 0 0-4 4 2 2 0 0 0 2 2h7a2 2 0 0 0 2-2 4 4 0 0 0-4-4h-3Zm6.82-3.096a5.51 5.51 0 0 0-2.797-6.293 3.5 3.5 0 1 1 2.796 6.292ZM19.5 18h.5a2 2 0 0 0 2-2 4 4 0 0 0-4-4h-1.1a5.503 5.503 0 0 1-.471.762A5.998 5.998 0 0 1 19.5 18ZM4 7.5a3.5 3.5 0 0 1 5.477-2.889 5.5 5.5 0 0 0-2.796 6.293A3.501 3.501 0 0 1 4 7.5ZM7.1 12H6a4 4 0 0 0-4 4 2 2 0 0 0 2 2h.5a5.998 5.998 0 0 1 3.071-5.238A5.505 5.505 0 0 1 7.1 12Z"
            clip-rule="evenodd" />
        </svg>
        <h2 class="text-xl font-semibold text-gray-900 dark:text-white sm:text-2xl">Mis pacientes</h2>
      </div>

      <table class="w-full text-sm text-left text-gray-500 dark:text-gray-400">
        <thead class="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
          <tr>
            <th class="sr-only">Paciente</th>
            <th>
              <span class="sr-only">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody>
          @foreach ($items as $item)
          <tr class="uppercase bg-white border-b dark:border-gray-700 hover:bg-cyan-50"
            wire:key="{{ time().$item->id.'-1' }}" wire:click="selectPaciente({{ $item->paciente->id }})">
            <td scope="row" class="gap-2 px-4 py-3 text-gray-900 font-sm whitespace-nowrap">
              <div class="flex">
                <svg class="w-5 h-5 text-gray-900 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"
                  width="24" height="24" fill="none" viewBox="0 0 24 24">
                  <path stroke="currentColor" stroke-width="1"
                    d="M7 17v1a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1v-1a3 3 0 0 0-3-3h-4a3 3 0 0 0-3 3Zm8-9a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                </svg>
                {{ $item->paciente->name }} {{ $item->paciente->last_name }}
              </div>
              <span class="flex pt-2 text-xs text-gray-400">
                <svg class="w-4 h-4 text-gray-400 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"
                  width="24" height="24" fill="none" viewBox="0 0 24 24">
                  <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M12 13a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />
                  <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M17.8 13.938h-.011a7 7 0 1 0-11.464.144h-.016l.14.171c.1.127.2.251.3.371L12 21l5.13-6.248c.194-.209.374-.429.54-.659l.13-.155Z" />
                </svg>
                {{ $item->paciente->address->street }} #{{ $item->paciente->number }} | {{
                $item->paciente->address->comuna->name
                }}
              </span>
            </td>
            <td class="px-6 py-4 cursor-pointer bg-slate-300">
              <svg class="w-6 h-6 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"
                width="24" height="24" fill="none" viewBox="0 0 24 24">
                <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="m9 5 7 7-7 7" />
              </svg>
            </td>
          </tr>
          @endforeach
        </tbody>
      </table>
      <nav class="flex justify-between p-4" aria-label="Table navigation">
        {{ $items->links() }}
      </nav>
    </div>
  </section>
</div>