<div>
    @if ($question->id === 1)
    <div>
        <label class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">{{ $question->name }}</label>
        <select wire:model.debounce.200ms="answer.name" wire:change="guardar" class="block w-full p-1 text-sm text-gray-900 border border-l-2 border-gray-300 rounded-r-lg bg-gray-50 border-l-gray-100 dark:border-l-gray-700 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500">
            <option selected readonly>--seleccione--</option>
            <option value="Mujer">Mujer</option>
            <option value="Hombre">Hombre</option>
            <option value="Otro">Otro</option>
        </select>
    </div>
    @elseif ($question->id === 2)
    <div>
        <label class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">{{ $question->name }}</label>
        <input type="number" wire:model.debounce.200ms="answer.name" wire:change="guardar" class="block w-full p-1 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-sky-500 focus:border-sky-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-sky-500 dark:focus:border-sky-500" placeholder="peso en kgs.">
    </div>
    @else
    <div>
        <label class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">{{ $question->name }}</label>
        <input type="text" wire:model.debounce.200ms="answer.name" wire:change="guardar" aria-multiline="true" class="block w-full p-1 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-sky-500 focus:border-sky-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-sky-500 dark:focus:border-sky-500">
    </div>
    @endif
</div>