@extends('layouts.admin')


@section('content')
@if ($convocatoria->status == 2)
@php
    $bloqueo = true;
@endphp
@elseif ($convocatoria->status == 3)
 @php
     $bloqueo = true;
 @endphp
@elseif ($convocatoria->status == 4)
 @php
     $bloqueo = true;
 @endphp
@elseif ($convocatoria->status == 5)
 @php
     $bloqueo = true;
 @endphp
@else
 @php
     $bloqueo = false;
 @endphp
@endif
<div class="container-fluid">

    <!-- Page Heading -->
    <h1 class="h3 mb-2 text-gray-800">Nueva Convocatoria3</h1>

    <!-- DataTales Example -->
    <div class="card shadow mb-4">
        <div class="card-header py-3">
            <h6 class="m-0 font-weight-bold text-primary float-left">Paso 2 Dimensiones</h6>
            <a href="#" class="btn btn-primary btn-sm float-right">Nueva Dimensión</a>
        </div>
        <div id="steptwo"></div>
        <div class="card-body">

            <table class="table table-bordered" id="dataTableUsuarios" width="100%" cellspacing="0">
                <thead>
                    <tr>
                        <th>Nombre&nbsp;Dimensión</th>
                        <th>Descripción</th>
                        <th>Preguntas</th>
                    </tr>
                </thead>
                <tbody>
                    @foreach ($convocatoria->dimensions as $dimension)
                        <tr>
                            <td><b>{{$dimension->name}}</b></td>
                            <td>{{$dimension->description}}</b></td>
                            <td>
                                <button type="button" class="btn btn-sm btn-warning" data-toggle="modal" data-target="#modal-{{$dimension->id}}">
                                    Ver <span class="badge badge-light">{{count($dimension->dimension_details)}}</span>
                                  </button>
                            </td>
                        </tr>
                    @endforeach
                </tbody>
            </table>

        </div>
        <div class="card-footer">
            <div class="row">
                <div class="col-lg-12 margin-tb">
                    <div class="pull-left">
                        <a class="btn btn-primary" href="{{ route('users.index') }}"> Volver</a>
                        @if($bloqueo == true)
                            <a type="button" class="btn btn-primary float-lg-right">Ver mas</a>
                        @else
                            <button type="submit" class="btn btn-primary float-lg-right">Guardar</button>
                        @endif
                    </div>
                </div>
            </div>
        </div>
    </div>

</div>

@foreach ($convocatoria->dimensions as $dimension)
<!-- Modal -->
<div class="modal fade" id="modal-{{$dimension->id}}" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
    <div class="modal-dialog modal-lg">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" id="exampleModalLabel">{{$dimension->name}}</h5>
          <button type="button" class="close" data-dismiss="modal" aria-label="Close">
            <span aria-hidden="true">&times;</span>
          </button>
        </div>
        <div class="modal-body">
            <table class="table table-bordered" id="dataTableUsuarios" width="100%" cellspacing="0">
                <thead>
                    <tr>

                        <th>Pregunta o Requisito</th>
                        <th>Valor</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    @foreach ($dimension->dimension_details as $detail)
                        <tr>
                            <td><b>{{$detail->question}}</b></td>
                            <td>{{$detail->value}} {{$detail->id}}</b></td>
                            <td>
                                <button type="button" class="btn btn-sm btn-warning" data-toggle="modal" data-target="#modal-edit-{{$detail->id}}">
                                    Editar
                                  </button>
                            </td>
                        </tr>
                    @endforeach
                </tbody>
            </table>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" data-dismiss="modal">Cerrar</button>
        </div>
      </div>
    </div>
  </div>
@endforeach


@foreach ($convocatoria->dimensions as $detail)
    <div class="modal fade" id="modal-edit-{{$detail->id}}" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
        <div class="modal-dialog modal-lg">
        <div class="modal-content">
            <div class="modal-header">
            <h5 class="modal-title" id="exampleModalLabel">{{$dimension->name}}</h5>
            <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                <span aria-hidden="true">&times;</span>
            </button>
            </div>
            <div class="modal-body">
                <table class="table table-bordered" id="dataTableUsuarios" width="100%" cellspacing="0">
                    <thead>
                        <tr>

                            <th>Pregunta o Requisito</th>
                            <th>Valor</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        @foreach ($dimension->dimension_details as $detail)
                            <tr>
                                <td><b>{{$detail->question}}</b></td>
                                <td>{{$detail->value}}</b></td>
                                <td>
                                    <button type="button" class="btn btn-sm btn-warning" data-toggle="modal" data-target="#modal-{{$dimension->id}}">
                                        Editar <span class="badge badge-light">{{count($dimension->dimension_details)}}</span>
                                    </button>
                                </td>
                            </tr>
                        @endforeach
                    </tbody>
                </table>
            </div>
            <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-dismiss="modal">Cerrar</button>
            </div>
        </div>
        </div>
    </div>
@endforeach

@endsection
