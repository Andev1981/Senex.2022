<div>

    <div class="flex h-auto flex-col items-center justify-center space-y-6 bg-gray-100 px-4 sm:flex-row sm:space-x-6 sm:space-y-0">
        <div class="w-full my-10 max-w-sm overflow-hidden rounded-lg bg-white shadow-md duration-300 hover:scale-105 hover:shadow-xl">
            <form wire:submit.prevent="save">
            @if ($subirImagen)
            <div class="flex items-center justify-center w-full">
                <label class="flex flex-col w-full h-42 border-4 border-dashed hover:bg-gray-100 hover:border-gray-300">
                    <div class="flex flex-col items-center justify-center pt-7">
                        <div wire:loading wire:target="img" wire:click="img" class="flex flex-col items-center justify-center text-center mt-5">
                            <i class="fa fa-spinner fa-spin"></i>
                            Subiendo Imágen
                        </div>
                    @if ($img)
                    <div class="flex flex-col items-center justify-center">
                        <img  src="{{ $img->temporaryUrl()}}" alt="" width="100%">
                    </div>

                    @else

                    <svg xmlns="http://www.w3.org/2000/svg"
                    class="w-12 h-12 text-gray-400 group-hover:text-gray-600" viewBox="0 0 20 20"
                    fill="currentColor">
                            <path fill-rule="evenodd"
                                d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
                                clip-rule="evenodd" />
                        </svg>
                        <p class="pt-1 text-sm tracking-wider text-gray-400 h-auto group-hover:text-gray-600">
                            Subir imagen</p>

                    @endif

                </div>
                    <input wire:model="img" type="file" class="opacity-0" />
                </label>
            </div>
            @elseif($firmaDigital)
            <div class="">
                <span class="pb-2">Tu firma aquí</span>
                <div id="first">
                        <div class="signature mb-2" style="width: 100%; height: 150px;">
                            <canvas id="signature-canvas"
                                style="width: 100%; height: 200px;background-color:#efeeee;"></canvas>
                        </div>
                        @error('firmaDigitalizada')
                            <span style="color: red">Debe ingresar su firma para poder validar la atención</span>
                            <br>
                        @enderror
                        <button type="button" class="btn btn-primary mb-4 float-left bg-sky-700" id="btnLimpiar">Limpiar</button>
                        <button type="button" class="btn btn-primary mb-4 float-right bg-sky-700" id="btnFirmar" disabled>Firmar y continuar</button>
                        <button type="submit" class="btn btn-primary mb-4 float-right bg-sky-700" id="btnEnviar" style="display: none">Continuar</button>
                    </div>
                <div class="card-footer">
                    <div class="form-group row mb-0">
                        <div class="col-md-12">
                            <button type="button" class="btn btn-primary mb-4 float-left bg-sky-700" id="btnLimpiar">Limpiar</button>
                            <button type="button" class="btn btn-primary mb-4 float-right bg-sky-700" id="btnFirmar" disabled>Firmar y continuar</button>
                            <button type="submit" class="btn btn-primary mb-4 float-right bg-sky-700" id="btnEnviar" style="display: none">Continuar</button>
                        {{--     <button type="submit" class="btn btn-primary btn-block" style="background-color: #59738c;">
                                {{ __('Continuar') }}
                            </button> --}}
                        </div>
                    </div>
                </div>
            </div>

                @else
                    @if ($firma)
                        <img width="100%" src="{{ Storage::url($firma) }}" alt="">
                    @else
                    <svg xmlns="http://www.w3.org/2000/svg" class="mx-auto mt-8 h-16 w-16 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
                    </svg>
                    <h1 class="mt-2 text-center text-2xl font-bold text-gray-500">Sin Firma</h1>
                    <p class="my-4 text-center text-sm text-gray-500">Aún no has cargado tu firma</p>

                    @endif

                @endif

          <div class="space-x-4 bg-gray-100 py-4 text-center">
            @if ($subirImagen)
                <button wire:click="resetear()" class="inline-block rounded-md bg-red-500 px-10 py-2 font-semibold text-red-100 shadow-md duration-75 hover:bg-red-400">Cancelar</button>
                <button type="submit" class="inline-block rounded-md bg-green-500 px-6 py-2 font-semibold text-green-100 shadow-md duration-75 hover:bg-green-400">Guardar</button>
            @elseif ($firmaDigital)
                <button wire:click="resetear()" class="inline-block rounded-md bg-red-500 px-10 py-2 font-semibold text-red-100 shadow-md duration-75 hover:bg-red-400">Cancelar</button>
                <button class="inline-block rounded-md bg-green-500 px-6 py-2 font-semibold text-green-100 shadow-md duration-75 hover:bg-green-400">Guardar</button>
            @elseif ($editar)
                <button wire:click="imagen()" class="inline-block rounded-md bg-green-500 px-6 py-2 font-semibold text-green-100 shadow-md duration-75 hover:bg-green-400">Subir Imagen</button>
{{--                 <button wire:click="firma()" class="inline-block rounded-md bg-green-500 px-6 py-2 font-semibold text-green-100 shadow-md duration-75 hover:bg-green-400">Firma Digital</button>
 --}}            @else
                <button wire:click="editar()" class="inline-block rounded-md bg-green-500 px-6 py-2 font-semibold text-green-100 shadow-md duration-75 hover:bg-green-400">Editar</button>
            @endif
          </div>
        </form>
        </div>
  {{--       <div class="w-full max-w-sm overflow-hidden rounded-lg bg-white shadow-md duration-300 hover:scale-105 hover:shadow-xl">
          <svg xmlns="http://www.w3.org/2000/svg" class="mx-auto mt-8 h-16 w-16 text-red-500" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
          </svg>
           <svg xmlns="http://www.w3.org/2000/svg" class="mx-auto mt-8 h-16 w-16 text-green-400" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
          </svg>
          <h1 class="mt-2 text-center text-2xl font-bold text-gray-500">Cancel</h1>
          <p class="my-4 text-center text-sm text-gray-500">Just a small miss, 2/5 Tasks</p>
          <div class="space-x-4 bg-gray-100 py-4 text-center">
            <button class="inline-block rounded-md bg-red-500 px-10 py-2 font-semibold text-red-100 shadow-md duration-75 hover:bg-red-400">Cancel</button>
            <button class="inline-block rounded-md bg-green-500 px-6 py-2 font-semibold text-green-100 shadow-md duration-75 hover:bg-green-400">Try Again</button>
          </div>
        </div> --}}
      </div>
</div>

