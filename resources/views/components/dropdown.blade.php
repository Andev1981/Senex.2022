<div>
    <label
        class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">{{ $label }}</label>
    <div class="relative">
        <div class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <img src="{{ asset('icons/family.png') }}" alt="falimiar" class="w-5 h-5 mr-2">
        </div>
        <select id="{{ $name }}"
            class="bg-gray-50 border border-gray-300 text-gray-900 text-sm pl-10 pr-4 rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500">
            <option selected>-- seleccione una opción -</option>
            {{ $slot }}
        </select>
    </div>
</div>
