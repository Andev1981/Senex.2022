<!DOCTYPE html>
<html>

<head>
  <meta charset="UTF-8">
  <title>Reporte Total PDF</title>
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

    th,
    td {
      border: 1px solid black;
      padding: 4px;
      font-size: 12px;
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

    .totalNumber {
      font-weight: 600;
    }
  </style>
</head>

<body>
  <header>
    <img src="{{ asset('img/logo-cabecera.png') }}" alt="Logo Empresa" class="logo">
    <h1>Reporte Resumen Senex</h1>
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
        <th>ValorSesión</th>
        <th>ValorPaciente</th>
        <th>ValorKine</th>
      </tr>
    </thead>
    <tbody>
      @forelse ($applyItems as $applyItem)
      <tr style="background-color: #ecfeff ">
        <td scope="row">
          {{ $applyItem->doctor->name ?? '' }}
          {{ $applyItem->doctor->last_name ?? '' }}
        </td>
        <td scope="row">
          {{ $applyItem->patient->name ?? '' }}
          {{ $applyItem->patient->last_name ?? '' }}
        </td>
        <td>
          {{ \Carbon\Carbon::parse(strtotime($applyItem->fecha_atencion))->format('d/m/Y') }}

        </td>

        <td>
          {{ $applyItem->applicationType->name }}
        </td>
        <td>{{ $applyItem->numero_sesion ?? '' }}</td>
        <td>
          {{ $applyItem->applicationType->name ?? '' }}
        </td>
        <td>
          @forelse ($applyItem->doctor->applyTypes as $kineValue)
          @if ($kineValue->application_type_id == $applyItem->application_type_id)
          ${{ number_format($kineValue->price, 0, ',', '.') ?? '0' }}.-
          @endif

          @empty
          Sin Datos
          @endforelse

        </td>
        <td>
          @forelse ($applyItem->doctor->applyTypes as $kineValue)
          @if ($kineValue->application_type_id == $applyItem->application_type_id)
          ${{ number_format($applyItem->price - $kineValue->price, 0, ',', '.') ??
          '0' }}.-
          @endif

          @empty
          Sin Datos
          @endforelse
        </td>
      </tr>
      @empty
      <tr>
        <td col="8">
          Sin Datos
        </td>
      </tr>
      @endforelse
      <tr>
        <td colspan="4">
          <span class="py-2 font-semibold text-slate-900">Totales</span>
        </td>
        <td>
          <span class="py-2 text-sm font-semibold text-slate-900">
            Total Atenciones : {{ count($applyItems) }}
          </span>
        </td>
        <td class="py-2 font-semibold text-slate-900">
          ${{ number_format($totalPacientes, 0, ',', '.') ?? '0' }}.-
        </td>
        <td class="py-3 font-semibold text-slate-900">
          ${{ number_format($totalKine, 0, ',', '.') ?? '0' }}.-
        </td>
        <td class="py-3 font-semibold text-slate-900">
          ${{ number_format($totalPacientes - $totalKine, 0, ',', '.') ?? '0' }}.-
        </td>

      </tr>
    </tbody>
  </table>

  <footer>
    <p>Senex</p>
  </footer>
</body>

</html>