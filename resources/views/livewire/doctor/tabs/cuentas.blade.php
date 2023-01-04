<div>
    <div class="w-full mx-auto">
      <div class="overflow-x-auto shadow-md sm:rounded-lg">
          <table class="w-full text-sm text-left text-gray-500 dark:text-gray-400">
              <thead class="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                  <tr>
                      <th scope="col" class="px-6 py-3">
                          Tipo de atención
                      </th>
                      <th scope="col" class="px-6 py-3">
                          Fecha
                      </th>
                  </tr>
              </thead>
              <tbody>
                  @forelse($payments as $payment)
                    <tr class="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">

                        <th scope="row" class="px-6 py-4 font-medium text-gray-900 dark:text-white whitespace-nowrap">
                            {{$payment->total}}
                        </th>
                        <td class="px-6 py-4">
                            {{\Carbon\Carbon::parse($payment->created_at)->format('d-m-Y H:i')}}
                        </td>
                    </tr>
                  @empty
                    <tr>
                        <td>Sin datos para mostrar</td>
                    </tr>
                  @endforelse
              </tbody>
          </table>
      </div>
  </div>
</div>
