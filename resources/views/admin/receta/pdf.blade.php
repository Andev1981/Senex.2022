<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>Receta </title>
    <link href="{{public_path('css/invoice.css')}}" rel="stylesheet">
</head>
<body>


    <div class="invoice-box">
        <table cellpadding="0" cellspacing="0">
            <tr>
                

                <td class="w-50 text-center">
                    <div> <h4 class="bold"> </h4></div>
                </td>

                <td class="w-35">
                    {{-- @if($inBackground)
                    <img src="{{ public_path('img//LogoBlanco.png') }}" style="width: 100%; max-width: 300px">

                    @else
                        <img src=""{{ asset('img/LogoBlanco.png') }}" style="width: 100%; max-width: 300px">

                    @endif --}}
                    <table class="mt-20" cellpadding="0" cellspacing="0">
                        <tr class="bg-gris">
                            <td class="text-center">
                                2022-08-02
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>
        </table>

<div class="container">
    <div class="row">
        <div class="col">
            <!--button class="btn btn-success btn-sm float-end mt-4" type="button" onclick="window.print();">Imprimir</!--button-->
            {{-- <button class="btn btn-warning btn-sm" type="button">Enviar</button> --}}
         {{--   {{$data}} --}}
        </div>
    </div>
</div>
<div class="container border mt-2 shadow rounded">
  <hr>
  <div class="row">
    <div class="col">
        <strong>Dr.Javier Larraín Amigo</strong><br>
        Rut: 13.895.657-1<br>
        R.C.M: 24.718-9<br>
    </div>
    <div class="col justify-content-end">
  
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

</body>
</html>
