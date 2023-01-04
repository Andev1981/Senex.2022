<div>
     <!-- Section 1 -->
    <section class="py-5 sm:py-2 bg-white">
        <div class="max-w-7xl px-10 mx-auto sm:text-center">
            <div class="grid grid-cols-1 sm:grid-cols-1 lg:grid-cols-1 gap-10 my-12 sm:my-16">
                @forelse ($images as $image)
                    <div class="rounded-lg py-10 flex flex-col items-center justify-center shadow-lg border border-gray-100">
                        {{-- <p class="font-bold mt-4">Zapier</p>
                        <p class="mt-2 text-sm text-gray-500">Connect to 1,000+ apps</p> --}}
                        <iframe class="rounded w-full h-52 inline-block" src="{{ Storage::url($image->name) }}"></iframe>
                    </div>
                    @empty
                    <div class="mx-auto">
                        No se han cargado documentos o recetas
                    </div>
                @endforelse
            </div>
        </div>
    </section>
</div>
