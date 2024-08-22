<div>
    <section>
        <div class="max-w-5xl p-5 mx-auto bg-slate-100 rounded-xl">
            <div class="flex pb-2 lg:flex lg:items-center lg:justify-between">

                <svg class="w-6 h-6 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"
                    width="24" height="24" fill="none" viewBox="0 0 24 24">
                    <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M10 3v4a1 1 0 0 1-1 1H5m8-2h3m-3 3h3m-4 3v6m4-3H8M19 4v16a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V7.914a1 1 0 0 1 .293-.707l3.914-3.914A1 1 0 0 1 9.914 3H18a1 1 0 0 1 1 1ZM8 12v6h8v-6H8Z" />
                </svg>


                <h2 class="text-xl font-semibold text-gray-900 dark:text-white sm:text-2xl">Paciente</h2>
            </div>
            <hr>
            <div class="pt-2">
                {{ $paciente->name }}
                {{ $paciente->last_name }}
            </div>
            <div>
                <button>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
                        stroke="currentColor" class="w-6 h-6">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                    </svg>
                </button>
            </div>
            <div>
                <input type="date"
                    class="w-full px-4 py-2 mt-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent">
            </div>
        </div>
    </section>
</div>