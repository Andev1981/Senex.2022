@extends('layouts.admin')

@section('content')

<div class="container-fluid">

    <!-- Page Heading -->


    <!-- DataTables Example -->
    <div class="card shadow mb-4">

        <div class="card-header py-3">
            <h3 class="h3 text-gray-800 mx-2">Criterios de evaluación para convocatoria</h3><h5 class="mx-2">--{{ $announcement->name}}--</h5>
            @php
                $suma=0;
            @endphp
            @foreach ($dimension as $detalle)
                @php
                $suma+=$detalle->porcentage;//sumanos los valores, ahora solo fata mostrar dicho valor
                @endphp
            @endforeach
            <div class="mx-2">**La suma de los porcentajes es  {{$suma}}%</div>

            @if ($announcement !== null )

                    @if ($announcement->status == 0)
                        <div class="alert alert-light float-right -mt-14" role="alert">
                            No publicada
                        </div>
                    @elseif($announcement->status == 1)
                        <div class="alert alert-success float-right -mt-14" role="alert">
                            Postulaciones Abiertas
                        </div>
                    @elseif($announcement->status == 2)
                        <div class="alert alert-primary float-right -mt-14" role="alert">
                            Proceso de Evaluación
                        </div>
                    @elseif($announcement->status == 3)
                        <div class="alert alert-warning float-right -mt-14" role="alert">
                            Selección
                        </div>
                    @elseif($announcement->status == 4)
                        <div class="alert alert-danger float-right -mt-14" role="alert">
                            Cerrara / Finalizada
                        </div>
                    @endif
                    @if ($suma == 100)
                        @else
                        <button type="button" class="bg-exito text-white rounded-xl px-2 py-0 hover:bg-green-600 ml-2 text-base  mt-2" data-toggle="modal" data-target="#agregarModal">Agregar</button>
                    @endif

            @endif
        </div>


        <div class="card-body py-3">
            <div class="row">

            <div class="col-md-12">
                @foreach ($dimension as $detalle)
                        <!-- DataTales Example -->
                        <div class="card shadow mb-4">
                            <div class="card-header py-3">
                                <h6 class="m-0 font-weight-bold text-primary">{{ $detalle->name }}</h6>
                                <small>**{{ $detalle->description }} / equivalente al {{$detalle->porcentage}}%</small>
                                <div class="float-right">
                                    <button type="button" class="btn btn-outline-success" data-toggle="modal" data-target="#modalDetalleCriterio-{{$detalle->id}}">Agregar pregunta o criterio
                                    </button>
                                </div>
                            </div>
                            <div class="card-body">

                                    <table class="table table-bordered" id="dataTable" width="100%" cellspacing="0">
                                        <thead>
                                            <tr>
                                                <th>Pregunta o Criterio</th>
                                                <th class="text-center">Tipo&nbsp;de&nbsp;Calificacion</th>
                                                <th class="text-center">Valor</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            @foreach($detalle->dimension_details as $preguntas)
                                            <tr>
                                                    <td>
                                                        {{$preguntas->question}}
                                                    </td>

                                                    <td class="text-center">

                                                        @if ($preguntas->tipo_calificacion === 0)
                                                            Porcentaje %
                                                        @elseif($preguntas->tipo_calificacion === 1)
                                                            Puntos
                                                        @elseif($preguntas->tipo_calificacion === 2)
                                                            Si / No
                                                        @elseif($preguntas->tipo_calificacion === 3)
                                                            Bajo / Medio / Alto
                                                        @endif

                                                    </td>
                                                    <td class="text-center">
                                                        <span class="badge badge-success">{{$preguntas->value}}</span>
                                                    </td>
                                            </tr>
                                            @endforeach

                                        </tbody>
                                    </table>

                            </div>
                        </div>
                @endforeach
            </div>
        </div>

    </div>
<hr>



 <!-- Detalle Postulación Modal-->
 <div class="modal fade" id="agregarModal" tabindex="-1" role="dialog" aria-labelledby="agregarModal"
 aria-hidden="true">
    <div class="modal-dialog" role="document">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title" id="exampleModalLabel">Detalle de Sección o Dimensión</h5>
                <button class="close" type="button" data-dismiss="modal" aria-label="Close">
                    <span aria-hidden="true">×</span>
                </button>
            </div>
            <form method="POST" action="{{ route('criterios.store') }}">
                @csrf
                <input type="hidden" name="convocatoria_id" value="{{ $announcement->id}}">
                    <div class="modal-body">
                        <div class="row">
                            <div class="col-md-12 mb-2">
                                <label>Nombre</label>
                                <input type="text" name="name" class="form-control" />
                            </div>
                            <div class="col-md-12 mb-2">
                                <label>Descripcion</label>
                                <input type="text" name="description" class="form-control" />
                            </div>
                            <div class="col-md-12 mb-2">
                                <label>Porcentage para ponderación %</label>
                                <input type="number" name="porcentage" class="form-control" />
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn-secondary bg-slate-700" type="button" data-dismiss="modal">Cerrar</button>
                        <button class="btn btn-success bg-exito" type="submit">Guardar</button>
                    </div>
            </form>
        </div>
    </div>
</div>



@foreach ($dimension as $detalle)
<!--Información puntajes Modal-->
    <div class="modal fade" id="modalDetalleCriterio-{{$detalle->id}}" tabindex="-1" aria-labelledby="modalDetalleCriterioLabel" aria-hidden="true">
        <div class="modal-dialog">
        <div class="modal-content">
            <div class="modal-header">
            <h5 class="modal-title" id="modalDetalleCriterioLabel"> {{$detalle->name}}</h5>
            <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                <span aria-hidden="true">&times;</span>
            </button>
            </div>
            <form method="POST" action="{{ route('detalle.criterios.store') }}">
                @csrf
                <input type="hidden" name="convocatoria_id" value="{{ $announcement->id}}">
                <input type="hidden" name="dimension_id" value="{{ $detalle->id}}">
                    <div class="modal-body">
                        <div class="row">
                            <div class="col-md-12 mb-2">
                                <label>Pregunta o criterio</label>
                                <input type="text" name="question" class="form-control" required/>
                            </div>
                            <div class="col-md-12 mb-2">
                                <label>Tipo</label>
                                <select name="tipo_calificacion" class="form-control" required>
                                    <option value="">--selecciona--</option>
                                    <option value="1">Puntos</option>
                                    <option value="2">Si / No</option>
                                    <option value="3">Bajo / Medio / Alto</option>
                                    <option value="0">Porcentaje %</option>
                                </select>
                            </div>
                            <div class="col-md-12 mb-2">
                                <label>Valor</label>
                                <input type="number" name="value" class="form-control" required/>
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn-secondary bg-slate-700" type="button" data-dismiss="modal">Cerrar</button>
                        <button class="btn btn-success bg-exito" type="submit">Guardar</button>
                    </div>
            </form>
        </div>
        </div>
    </div>
  @endforeach

@endsection
