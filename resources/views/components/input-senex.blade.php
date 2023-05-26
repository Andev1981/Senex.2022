@props([
    'label',
    'required' => false,
    'placeholder' => '',
    'id' => '',
    'type' => 'text',
    'wireModel',
    'wireModelKey',
])

@php
    $iterator = $attributes->getIterator();
    while($iterator->valid())  {
        if(\Str::contains($iterator->key(), 'wire:model')) {
            $wireModel = $iterator->key() . '=' . $iterator->current();
            $wireModelKey = $iterator->current();
        }
        $iterator->next();
    }
@endphp

<div>
    <label for="{{$id}}" class="block text-sm font-medium leading-5 text-gray-700">{{$label}}
    </label>
    <div class="relative mt-1 rounded-md shadow-sm">
        <input {{$wireModel}}
               id="{{$id}}" required="{{$required}}"
               type="{{$type}}"
               @if($errors->has($wireModelKey))
               class="block w-full pr-10 text-red-900 placeholder-red-300 border-red-300 form-input focus:border-red-300 focus:shadow-outline-red sm:text-sm sm:leading-5"
               @else
               class="block w-full px-3 py-2 placeholder-gray-400 transition duration-150 ease-in-out border border-gray-300 rounded-md appearance-none focus:outline-none focus:shadow-outline-blue focus:border-blue-300 sm:text-sm sm:leading-5"
               @endif
               placeholder="{{$placeholder}}"
               aria-invalid="true"
               aria-describedby="email-error"/>
        @error($wireModelKey)
        <div class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            <svg class="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                      clip-rule="evenodd"/>
            </svg>
        </div>
        @enderror
    </div>
    @error($wireModelKey)
    <p class="mt-2 text-sm text-red-600" id="email-error">{{$message}}
    </p>
    @enderror
</div>

