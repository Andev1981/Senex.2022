<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Reporte PDF</title>
    <style>
        /* Estilos para el header */
        header {
            text-align: center;
            margin-bottom: 20px;
        }

        .logo {
            width: 100px;
            height: auto;
            margin: 0 auto;
        }

        /* Estilos para el cuerpo */
        table {
            border-collapse: collapse;
            width: 100%;
            margin-bottom: 20px;
        }

        th, td {
            border: 1px solid black;
            padding: 4px;
        }

        th {
            background-color: #ccc;
            text-align: left;
        }

        /* Estilos para el footer */
        footer {
            margin-top: 20px;
            padding-top: 10px;
            border-top: 1px solid black;
            text-align: center;
            font-size: 12px;
        }
        .totalText {
            font-weight: 600;
        }
        .totalNumber{
            font-weight: 600;
        }
    </style>
</head>
<body>
    <header>
        <img src="/public/img/logo-cabecera.png" alt="Logo Empresa" class="logo">
        <h1>Reporte Resumen Senex</h1>
        <p>Usuario: {{ $nameUser }}</p>
        <p>Fecha: {{ $fecha }}</p>
    </header>

    <table>
        <thead>
            <tr>
                <th>Fecha</th>
                <th>Paciente</th>
                <th>Tipo</th>
                <th>Sesión</th>
                <th>Valor</th>
            </tr>
        </thead>
        <tbody>
           @forelse ($applyItems as $applyItem)
                                                <tr>
                                                    <td scope="row">
                                                        {{ \Carbon\Carbon::parse(strtotime($applyItem->fecha_atencion))->format('d/m/Y') }}

                                                    </td>
                                                    <td >
                                                        {{ $applyItem->application->user->name ?? '' }}
                                                        {{ $applyItem->application->user->last_name ?? '' }}
                                                    </td>
                                                        
                                                    <td>
                                                    {{ $applyItem->applicationType->name }}
                                                    </td>
                                                    <td>{{ $applyItem->numero_sesion ?? ''}}</td>
                                                    <td>
                                                     @forelse ($kineValues as $kineValue)
                                                        @if($kineValue->application_type_id == $applyItem->application_type_id)
                                                        ${{ number_format($kineValue->price,0,',','.') ?? '0' }}.-
                                                        @endif

                                                    @empty
                                                        Sin Datos
                                                    @endforelse
                                                    </td>
                                                </tr>
                                                @empty
                                                <tr>
                                                    <td col="5">
                                                       Sin Datos
                                                    </td>
                                                </tr>
                                        @endforelse
                                        <tr>
                                          <td colspan="3"></td>
                                          <td class="totalText">Total</td>
                                          <td class="totalNumber"> ${{  number_format($totalKine,0,',','.') }}.-</td>  
                                        </tr>
        </tbody>
    </table>

    <footer>
        <p>Información extra</p>
    </footer>
</body>
</html>