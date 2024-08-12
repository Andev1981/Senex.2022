<button {{ $attributes->merge(['type' => 'button', 'class' => 'flex items-center px-2 py-1 text-xs font-medium
   text-center text-red-700 border border-red-700 rounded-lg hover:text-white hover:bg-red-800 focus:ring-4
   focus:outline-none focus:ring-red-300 dark:border-red-500 dark:text-red-500 dark:hover:text-white
   dark:hover:bg-red-600 dark:focus:ring-red-900 ']) }}>
   <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 -ml-0.5" viewbox="0 0 20 20" fill="currentColor"
      aria-hidden="true">
      <path fill-rule="evenodd"
         d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
         clip-rule="evenodd" />
   </svg>
   {{ $innerText ?? '' }}
</button>