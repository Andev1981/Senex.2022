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
            height: 100px;
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
            padding: 8px;
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
    </style>
</head>
<body>
    <header>
   <!--      <img src="./public/img/logo-cabecera.png" alt="Logo Empresa" class="logo"> -->
        <h1>Reporte PDF</h1>
        <p>Usuario: Nombre Usuario</p>
        <p>Fecha: 01/01/2021</p>
    </header>

    <table>
        <thead>
            <tr>
                <th>Columna 1</th>
                <th>Columna 2</th>
                <th>Columna 3</th>
            </tr>
        </thead>
        <tbody>
            @foreach ($applyItems as $dato)
                <tr>
                    <td>{{ $dato->id }}</td>
                    <td>{{ $dato->id }}</td>
                    <td>{{ $dato->id }}</td>
                </tr>
            @endforeach
        </tbody>
    </table>

    <footer>
        <p>Información extra</p>
    </footer>
</body>
</html>