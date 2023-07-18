<div>
    <label  class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">{{ $label }} <small class="text-gray-400 italic">
        (Obligatorio)
    </small></label>
    <div class="relative mb-2">
        <div class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">

            {{ $slot }}
        </div>
        <input type="{{ $type }}" id="" {!! $attributes->merge([
            'class' =>
                'bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 p-2.5  dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 uppercase',
        ]) !!} placeholder="{{ $placeholder }}">
    </div>
</div>
