@extends('layouts.admin')

@section('content')

<div class="container-fluid">

    <!-- Page Heading -->
    <h1 class="h3 mb-2 text-gray-800">Mis postulaciones</h1>

    <!-- DataTales Example -->
    <div class="card shadow mb-4">
        <div class="card-header py-3">
            <h6 class="m-0 font-weight-bold text-primary">Listado de mis convocatorias</h6>
        </div>
        <div class="card-body">
            <div class="table-responsive">
                <table class="table table-bordered" id="dataTable" width="100%" cellspacing="0">
                    <thead>
                        <tr>
                            <th>Nombre</th>
                            <th>Descripción</th>
                            <th>Estado</th>
                            <th>Ver</th>
                        </tr>
                    </thead>
                    <tbody>
                        @foreach ($postulaciones as $postulacion)
                        <tr>
                            <td>{{ $postulacion->announcement->name }}</td>
                            <td>{{ $postulacion->announcement->presentacion }}</td>
                            </td>
                            <td>

                                @if ($postulacion->announcement->status == 1)

                                        @if ($postulacion->status == 0)
                                            <span class="badge badge-default bg-error text-white px-2 py-1">Postular</span>

                                        @elseif($postulacion->status == 1)
                                            <span class="badge badge-default bg-yellow text-black px-2 py-1">Postulación incompleta</span>

                                        @else
                                        <span class="badge badge-default bg-exito text-white px-2 py-1">Postulación enviada</span>

                                        @endif

                                @elseif ($postulacion->announcement->status == 2)
                                    <span class="badge badge-success">Asiganda a evaluador</span>
                                @elseif ($postulacion->announcement->status == 3)
                                    <span class="badge badge-warning">En Evaluacion</span>
                                @elseif ($postulacion->announcement->status == 4)
                                    <span class="badge badge-danger">Evaluado</span>
                                @elseif ($postulacion->announcement->status == 5)
                                    <span class="badge badge-danger">Seleccionado</span>
                                @elseif ($postulacion->announcement->status == 6)
                                    <span class="badge badge-danger">Postulación Rechazada</span>
                                @endif
                            </td>
                            <td>
                                @if ($postulacion->status == 0)
                                        <a href="{{ route('postulacion.show',$postulacion) }}" type="button" class="bg-exito text-white px-2 py-1 rounded">Postular</a>
                                    @elseif($postulacion->status == 1)
                                        <a href="{{ route('postulacion.show',$postulacion) }}" type="button" class="bg-exito text-white px-2 py-1 rounded">Editar</a>
                                    @else
                                        <a href="{{ route('postulacion.show',$postulacion) }}" type="button" class="bg-exito text-white px-2 py-1 rounded">Ver</a>
                                @endif
                            </td>
                        </tr>
                        @endforeach
                    </tbody>
                </table>
                {{ $postulaciones->links('pagination::bootstrap-4')}}
            </div>
        </div>
    </div>

</div>

@endsection
