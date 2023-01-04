@extends('layouts.admin')

@section('content')

<div class="container-fluid">

    <!-- Page Heading -->
    <h1 class="h3 mb-2 text-gray-800"></h1>

    <!-- DataTales Example -->
    <div class="card shadow mb-4">
        <div class="card-header py-3">
            <h6 class="m-0 font-weight-bold text-gray">Convocatorias <b>"{{$announcement->name}}"</b></h6>
        </div>
        <div class="card-body">

                <table class="table table-bordered" id="dataTableUsuarios" width="100%" cellspacing="0">
                    <thead>
                        <tr>
                            <th>Postulante</th>
                            <th>Nombre&nbsp;Proyecto</th>
                            <th>Email</th>
                            <th>Telefono</th>
                            <th>Descripción</th>
                            <th>Fecha</th>
                            <th>Estado</th>
                            <th></th>

                        </tr>
                    </thead>
                    <tbody>
                        @foreach ($applies as $apply)
                            <tr>
                                <td><b>{{ $apply->user->name }} {{ $apply->user->last_name }}</b></td>
                                <td><b>{{ $apply->project_name }}</b></td>
                                <td><b>{{ $apply->email_representante }}</b></td>
                                <td><b>{{ $apply->telefono_representante }}</b></td>
                                <td>{{ $apply->descripcion }}</td>

                                    @for($i = 0; $i < count($apply->apply_answers); $i++)
                                        <td class="px-5 py-5 border-b border-gray-200 bg-white text-xs w-2/8">
                                            <div class="flex items-center">
                                                <div class="ml-3">
                                                    <p class="text-gray-900 whitespace-no-wrap">
                                                        {{ $apply->apply_answers[$i]->answer }}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                    @endfor

                                <td>{{ $apply->created_at->format('d/m/Y') }}</td>
                                <td>
                                    @if ($apply->status == 0)
                                        <p class="pl-1 px-1 bg-error text-white rounded text-xs text-center">iniciada</p>
                                    @elseif ($apply->status == 1)
                                        <div class="pl-1 px-1 bg-gris text-white rounded text-xs text-center">incompleta</div>
                                    @elseif ($apply->status == 2)
                                        <div class="pl-1 px-1 bg-yellow text-black rounded text-xs text-center">enviada</div>
                                    @elseif ($apply->status == 3)
                                        <div class="pl-1 px-1 bg-exito text-white rounded text-xs text-center">asignada</div>
                                    @elseif ($apply->status == 4)
                                        <div class="pl-1 px-1 bg-red-500 text-white rounded text-xs text-center">evaluacion</div>
                                    @elseif ($apply->status == 5)
                                        <div class="pl-1 px-1 bg-red-500 text-white rounded text-xs text-center">evaluado</div>
                                    @elseif ($apply->status == 6)
                                        <div class="pl-1 px-1 bg-red-500 text-white rounded text-xs text-center">seleccionado</div>
                                    @elseif ($apply->status == 7)
                                        <div class="pl-1 px-1 bg-red-500 text-white rounded text-xs text-center">rechazada</div>
                                    @endif
                                </td>
                                <td>
                                    <a href="{{ route('postulacion.show.admin',[$apply->id]) }}" type="button" class="pl-1 px-1 rounded bg-exito text-white text-sm">Revisar</a>
                                </td>
                            </tr>
                        @endforeach
                    </tbody>
                </table>

        </div>
    </div>

</div>

@endsection

@section('scripts')
<script>

    $(document).ready(function () {
        $('#dataTableUsuarios').DataTable({
            responsive: true,
        dom: 'Bfrtip',
        buttons: [
            'excel'
        ],
        language: {
            "lengthMenu": "Mostrar _MENU_ registros",
            "zeroRecords": "No se encuentra resultado",
            "info": "Registros del _START_ al _END_ de un total de _TOTAL_",
            "infoEmpty": "Registros del 0 al 0 de un total de 0 registros",
            "infoFiltered": "(filtrado de un total de _MAX_ registros)",
            "sSearch": "Buscar:",
            "oPaginate": {
                "sFirst": "Primero",
                "sLast": "Ultimo",
                "sNext": "Siguente",
                "sPrevious": "Anterior"

            },
            "sProcessing": "Procesando...",
        },
        responsive: "true",
        dom: 'Bfrtilp',
        buttons:[
            {
                extend:     'excelHtml5',
                text:       "<button class='btn btn-success'>Exportar a Excel <i class='fas fa-file-excel'></i></button>",
                titleAttr:  'Exportar a Excel',
                class:  'btn btn-success'
            }
        ]
        });
    });

</script>
@endsection
