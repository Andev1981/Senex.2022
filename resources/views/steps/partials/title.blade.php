@auth
<div class="text-center mb-4">
    <h1 class="text-center font-black text-gray-700">Comencemos con tu diagnóstico online</h1>
    <small class="text-center">{{auth()->user()->name}}</small><br>
</div>
@endauth

@guest
@if (Session::get('currentPage') === 1)
<div class="text-center mb-4">
    <h1 class="text-center font-black text-gray-700">Comencemos con tu diagnóstico online 1</h1>
    <small class="text-center">Si ya tienes una cuenta, <a href="{{ route('login') }}" class="text-sky-600">inicia
            sesión</a></small><br>
    <small class="text-center">Si deseas crear una cuenta, <a href="{{ route('register') }}" class="text-sky-600">crear
            cuenta</a></small>
</div>
@elseif(Session::get('currentPage') === 2)
<div class="text-center mb-4">
    <h1 class="text-center font-black text-gray-700">Comencemos con tu diagnóstico online 2</h1>
    <small class="text-center">Si ya tienes una cuenta, <a href="{{ route('login') }}" class="text-sky-600">inicia
            sesión</a></small><br>
    <small class="text-center">Si deseas crear una cuenta, <a href="{{ route('register') }}" class="text-sky-600">crear
            cuenta</a></small>
</div>
@elseif(Session::get('currentPage') === 3)
<div class="text-center mb-4">
    <h1 class="text-center font-black text-gray-700">Comencemos con tu diagnóstico online 3</h1>
    <small class="text-center">Si ya tienes una cuenta, <a href="{{ route('login') }}" class="text-sky-600">inicia
            sesión</a></small><br>
    <small class="text-center">Si deseas crear una cuenta, <a href="{{ route('register') }}" class="text-sky-600">crear
            cuenta</a></small>
</div>
@elseif(Session::get('currentPage') === 4)
<div class="text-center mb-4">
    <h1 class="text-center font-black text-gray-700">Comencemos con tu diagnóstico online 4</h1>
    <small class="text-center">Si ya tienes una cuenta, <a href="{{ route('login') }}" class="text-sky-600">inicia
            sesión</a></small><br>
    <small class="text-center">Si deseas crear una cuenta, <a href="{{ route('register') }}" class="text-sky-600">crear
            cuenta</a></small>
</div>
@elseif(Session::get('currentPage') === 5)
<div class="text-center mb-4">
    <h1 class="text-center font-black text-gray-700">Comencemos con tu diagnóstico online 5</h1>
    <small class="text-center">Si ya tienes una cuenta, <a href="{{ route('login') }}" class="text-sky-600">inicia
            sesión</a></small><br>
    <small class="text-center">Si deseas crear una cuenta, <a href="{{ route('register') }}" class="text-sky-600">crear
            cuenta</a></small>
</div>
@endif
@endguest