@extends("layouts.layout_imprimir")

@section('titulo')
    Senex | Receta
@endsection

@section('contenido')

<div class="container">
    <div class="row">
        <div class="col">
            <button class="btn btn-success btn-sm float-end mt-4" type="button" onclick="window.print();">Imprimir</button>
            {{-- <button class="btn btn-warning btn-sm" type="button">Enviar</button> --}}
        </div>
    </div>
</div>
<div class="container border mt-2 shadow rounded">
  <div class="row">
    <div class="col">

    </div>
   
    <div class="col">

    </div>
  </div>
  <hr>
  <div class="row">
    <div class="col">
        <strong>Dr. Javier Larraín Amigo</strong><br>
        Rut: 13.895.657-1<br>
        R.C.M: 24.718-9<br>
    </div>
   
  </div>
<hr>
<div class="row mb-2">

</div>
<div class="row mb-2 justify-between">
    <div class="col">
        Nombre: ________________________________________
    </div>
    <div class="col">
        Edad: ______________
    </div>
    <div class="col">
        R.U.T: ___________________-__
    </div>
</div>
<hr>
<div class="row">
    <div class="col">
            <label class="mb-2">Texto de muestra de la receta</label>
            <ul>
                <li>Medicamento 1: cantidad 1</li>
                <li>Medicamento 2: cantidad 2</li>
                <li>Medicamento 3: cantidad 3</li>
                <li>Medicamento 4: cantidad 4</li>
                <li>.....</li>
            </ul>

    </div>
</div>
<hr>
<div class="row text-center">
    <div class="col">
        <img src="{{asset('img/firmas/firmaPrincipal.PNG')}}" alt=""><br>
        <span>Firma</span>
    </div>
</div>
<hr>
<div class="row text-center mb-4">
    <div class="col">
        Senex | 2022
    </div>
</div>
</div>

@endsection
