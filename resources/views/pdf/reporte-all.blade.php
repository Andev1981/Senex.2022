<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Reporte Total PDF</title>
  <style>
    body {
      font-family: sans-serif;
      font-size: 12px;
    }
    header {
      text-align: center;
      margin-bottom: 20px;
    }
    .logo {
      width: 100px;
      height: auto;
    }
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
      background-color: #ddd;
    }
    footer {
      margin-top: 20px;
      padding-top: 10px;
      border-top: 1px solid black;
      text-align: center;
    }
  </style>
</head>
<body>
  <header>
    @if($logo)
      <img src="data:image/png;base64,{{ $logo }}" alt="Logo Empresa" class="logo">
    @endif
    <h2>Reporte Resumen Senex</h2>
    <p>Fecha: {{ $fecha }}</p>
  </header>

  <table>
    <thead>
      <tr>
        <th>Kine</th>
        <th>Paciente</th>
        <th>Fecha</th>
        <th>Tipo</th>
        <th>Sesión</th>
        <th>Valor Paciente</th>
        <th>Valor Kine</th>
        <th>Saldo Senex</th>
      </tr>
    </thead>
    <tbody>
      @foreach ($applyItems as $item)
      <tr>
        <td>{{ $item->doctor->name ?? '' }} {{ $item->doctor->last_name ?? '' }}</td>
        <td>{{ $item->patient->name ?? '' }} {{ $item->patient->last_name ?? '' }}</td>
        <td>{{ \Carbon\Carbon::parse($item->fecha_atencion)->format('d/m/Y') }}</td>
        <td>{{ $item->applicationType->name ?? '' }}</td>
        <td>{{ $item->numero_sesion ?? '' }}</td>
        <td>${{ number_format($item->price, 0, ',', '.') }}</td>
        <td>${{ number_format($item->kine_price ?? 0, 0, ',', '.') }}</td>
        <td>${{ number_format($item->saldo_senex ?? 0, 0, ',', '.') }}</td>
      </tr>
      @endforeach

      <tr style="background-color: #e0f7f9">
        <td colspan="4"><strong>Totales</strong></td>
        <td>Total Atenciones: {{ count($applyItems) }}</td>
        <td><strong>${{ number_format($totalPacientes, 0, ',', '.') }}</strong></td>
        <td><strong>${{ number_format($totalKine, 0, ',', '.') }}</strong></td>
        <td><strong>${{ number_format($totalPacientes - $totalKine, 0, ',', '.') }}</strong></td>
      </tr>
    </tbody>
  </table>

  <footer>
    <p>Senex - Generado automáticamente</p>
  </footer>
</body>
</html>
