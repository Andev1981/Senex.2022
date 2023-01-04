@extends('layouts.admin')

@section('content')

<div class="container-fluid">

    <!-- Page Heading -->
    <h1 class="h3 mb-2 text-gray-800">Listado Postulantes</h1>

    <!-- DataTales Example -->
    <div class="card shadow mb-4">
        <div class="card-header py-3">
            <h6 class="m-0 font-weight-bold text-primary">Postulantes </h6>
        </div>
        <div class="card-body">
            <div class="table-responsive">
                <table class="table table-bordered" id="dataTable" width="100%" cellspacing="0">
                    <thead>
                        <tr>
                            <th>Nombre</th>
                            <th class="text-center">Fecha Postulación</th>
                            <th class="text-center">Estado de evaluación</th>
                            <th class="text-center">Calificación Actual</th>
                            <th class="text-center">Evaluar</th>
                        </tr>
                    </thead>
                    <!--tfoot>
                        <tr>
                            <th>Nombre</th>
                            <th>Fecha Postulación</th>
                            <th>Estado de evaluación</th>
                            <th>Evaluar</th>
                        </tr>
                    </tfoot-->
                    <tbody>
                        <tr>
                            <td>Juan Vergara</td>
                            <td class="text-center">14 de Marzo 2021</td>
                            <td class="text-center"><span class="badge badge-warning">En Proceso</span></td>
                            <td class="text-center"><span class="badge badge-success">22/30 pts.</span></td>
                            <td class="text-center"><a href="{{route('criterios.evaluacion')}}" type="button" class="btn btn-success btn-sm">Continuar</a></td>
                        </tr>
                        <tr>
                            <td>Juan Vergara</td>
                            <td class="text-center">14 de Marzo 2021</td>
                            <td class="text-center"><span class="badge badge-success">Evaluado</span></td>
                            <td class="text-center"><span class="badge badge-success">19/30 pts.</span></td>
                            <td class="text-center"><a href="{{route('criterios.evaluacion')}}" type="button" class="btn btn-warning btn-sm">Modificar</a></td>
                        </tr>
                        <tr>
                            <td>Juan Vergara</td>
                            <td class="text-center">14 de Marzo 2021</td>
                            <td class="text-center"><span class="badge badge-primary">Sin evaluar</span></td>
                            <td class="text-center"><span class="badge badge-danger">--</span></td>
                            <td class="text-center"><a href="{{route('criterios.evaluacion')}}" type="button" class="btn btn-primary btn-sm">Comenzar</a></td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    </div>

</div>

@endsection
