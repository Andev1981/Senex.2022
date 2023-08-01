<div>
    <label  class="block text-xs font-medium text-left text-gray-900 dark:text-white"><small>{{ $label }}</small></label>
    <div class="relative mb-2">
        <div class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            {{ $slot }}
        </div>
        <input type="{{ $type }}" id="" {!! $attributes->merge([
            'class' =>
                'bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 p-1  dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 mb-2',
        ]) !!} placeholder="{{ $placeholder }}">
    </div>
</div>
