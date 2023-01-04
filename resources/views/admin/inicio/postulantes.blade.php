@extends('layouts.admin')

@section('content')

<div class="container-fluid">

    <!-- Page Heading -->
    <h1 class="h3 mb-2 text-gray-800"></h1>

    <!-- DataTales Example -->
    <div class="card shadow mb-4">
        <div class="card-header py-3">
            <h6 class="m-0 font-weight-bold text-primary">Convocatorias <b>"{{$announcement->name}}"</b> Asignadas para Evaluación</h6>

        </div>
        <div class="card-body">

                <table class="table table-bordered" id="dataTableUsuarios" width="100%" cellspacing="0">
                    <thead>
                        <tr>
                            <th>Nombre&nbsp;Proyecto</th>
                            <!--th>Descripción</th-->
                            <th>Fecha</th>
                            <th></th>

                        </tr>
                    </thead>
                    <tbody>
                        @foreach ($asignaciones as $asignacion)
                            <tr>
                                <td><b>{{ $asignacion->apply->project_name }}</b></td>
                                <!--td>{{ $asignacion->apply->descripcion }}</td-->
                                <td>{{ $asignacion->created_at->format('d/m/Y') }}</td>

                                <td>
                                    <a href="{{ route('detalle.postulacion',[$asignacion->announcement_id,$asignacion->apply->user_id]) }}" type="button" class="bg-exito text-white px-2 py-0 rounded-full">Evaluar</a>
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
