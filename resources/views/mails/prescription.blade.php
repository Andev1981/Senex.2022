<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>https://senex.cl </title>
</head>
<body>
    <h3>{{$prescription->solicitud->solicitud_type->name}} - Senex</h3>
    <h4>Hola {{$prescription->solicitud->patient->user->name}},
    </h4>Hemos generado un documento/receta a partir de consulta online realizada en nuestras plataformas. Revisa el archivo adjunto</h4>
    <h5>Derechos reservados <a href="https://senex.cl">Senex.cl</a> </h5>
</body>
</html>
