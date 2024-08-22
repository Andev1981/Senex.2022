<li {{ $attributes->merge(['role'=>'status','disabled' => 'disabled','type' => 'button', 'class' => 'inline-flex
  items-center px-4 py-2 bg-sky-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase
  tracking-widest hover:bg-blue-800 active:bg-sky-600 focus:outline-none focus:border-gray-900 focus:ring ring-gray-300
  disabled:opacity-25 transition ease-in-out duration-150 w-full border-b border-gray-200 rounded-t-lg
  dark:border-gray-600']) }}>
  <div class="flex items-center pl-3">
    <input id="list-radio-agosto" type="radio" value="08" name="list-radio"
      class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-700 dark:focus:ring-offset-gray-700 focus:ring-2 dark:bg-gray-600 dark:border-gray-500"
      @if ($month=="08" ) checked @endif>
    <label for="list-radio-agosto" class="w-full py-1 ml-2 text-sm font-medium text-gray-900 dark:text-gray-300">
      {{ $label ?? '' }}
    </label>
  </div>
</li>