@extends('layouts.admin')

@section('content')

            @php
                    $suma=0;
            @endphp
            @foreach ($dimension as $detalle)
                @php
                    $suma+=$detalle->porcentage;//sumanos los valores, ahora solo fata mostrar dicho valor
                @endphp
            @endforeach

<div class="container-fluid">

    <!-- Page Heading -->

        @if ($resumen!== null)
            <h1 class="h3 mb-2 text-gray-800">Evaluador de Postulación <small>(Editando)</small></h1>
        @else
            <h1 class="h3 mb-2 text-gray-800">Evaluador de Postulación</h1>
        @endif

    <!-- DataTales Example -->
    <div class="card shadow mb-4">
        <div class="card-header py-3">
            @if ($resumen!== null)

                <div class="alert alert-primary float-left" role="alert">
                    Puntaje Obtenido {{$resumen->puntaje_total}}pts. equivalentes al {{$resumen->porcentage}}% / {{ $suma }}%
                </div>

                    @if ($announcement->status == 0)
                        <div class="alert alert-light float-right" role="alert">
                            No publicada
                        </div>
                    @elseif($announcement->status == 1)
                        <div class="alert alert-success float-right" role="alert">
                            Postulaciones Abiertas
                        </div>
                    @elseif($announcement->status == 2)
                        <div class="alert alert-primary float-right" role="alert">
                            Proceso de Evaluación
                        </div>
                    @elseif($announcement->status == 3)
                        <div class="alert alert-warning float-right" role="alert">
                            Selección
                        </div>
                    @elseif($announcement->status == 4)
                        <div class="alert alert-danger float-right" role="alert">
                            Cerrara / Finalizada
                        </div>
                    @endif


            @endif
        </div>
        <div class="card-body">
            <h6 class="m-0 font-weight-bold text-primary">Postulante</h6>
            <div class="row">
                <div class="col-md-4">
                    <label>Nombre</label><br>
                    <input class="form-control form-control-user" type="text" value="{{ $postulante->name }}" readonly>
                </div>
                <div class="col-md-4">
                    <label>Apellido</label><br>
                    <input class="form-control form-control-user" type="text" value="{{ $postulante->last_name }}" readonly>
                </div>
                <div class="col-md-4">
                    <label>Nombre del proyecto</label><br>
                    <input class="form-control form-control-user" type="text" value="{{ $postulacion->project_name }}" readonly>
                </div>

            </div>
            <div>
                <hr>
                <div class="col-md-12">
                    <label><b>Descripción del Proyecto</b></label><br>
                    <label class="text-justify">
                        {{ $postulacion->descripcion }}
                    </label>
                </div>
            </div>
        </div>
        <div class="card-footer">
            <div>
                <a class="dropdown-item bg-success" href="{{ route('postulacion.show.admin', $postulacion->id) }}" target="_blank">
                    <i class="fas fa-sign-out-alt fa-sm fa-fw mr-2 text-gray-400"></i>
                    Click acá para ver el detalle de la postulación
                </a>
            </div>
        </div>
    </div>
<hr>
 <!-- Page Heading -->
 <h1 class="h3 mb-2 text-gray-800">Criterios</h1>
<form method="POST" action="{{ route('calificacion.store') }}">
    @csrf
    <input type="hidden" name="apply_id" value="{{ $postulacion->id }}"/>
    <input type="hidden" name="postulante_id" value="{{ $postulante->id }}"/>
    @if ($resumen!== null)
        <input type="hidden" name="resumen_id" value="{{ $resumen->id }}"/>
    @endif
    <div>
        @foreach ($dimension as $detalle)

                <!-- DataTales Example -->
                <div class="card shadow mb-4">
                    <div class="card-header py-3">
                        <h6 class="m-0 font-weight-bold text-primary">{{ $detalle->name }}</h6>
                        <small>**{{ $detalle->description }} / equivalente al {{$detalle->porcentage}}%</small>
                        <div class="float-right">
                            <!--button type="button" class="btn btn-outline-danger" data-toggle="modal" data-target="#infoPuntajes">Información sobre puntajes
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-info-square" viewBox="0 0 16 16">
                                    <path d="M14 1a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1h12zM2 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2H2z"/>
                                    <path d="m8.93 6.588-2.29.287-.082.38.45.083c.294.07.352.176.288.469l-.738 3.468c-.194.897.105 1.319.808 1.319.545 0 1.178-.252 1.465-.598l.088-.416c-.2.176-.492.246-.686.246-.275 0-.375-.193-.304-.533L8.93 6.588zM9 4.5a1 1 0 1 1-2 0 1 1 0 0 1 2 0z"/>
                                </svg>
                            </button-->
                        </div>
                    </div>
                    <div class="card-body">

                            <table class="table table-bordered" id="dataTable" width="100%" cellspacing="0">
                                <thead>
                                    <tr>
                                        <th>Pregunta</th>
                                        @if ($resumen!== null)
                                            <th class="text-right">Calificación&nbsp;Actua</th>
                                        @endif
                                        @if($announcement->status != 4)
                                            <th class="text-right">Puntajes
                                            </th>
                                        @endif
                                    </tr>
                                </thead>
                                <tbody>
                                    @foreach($detalle->dimension_details as $preguntas)


                                    <tr>
                                        <td>
                                            {{$preguntas->question}}
                                        </td>

                                        @if ($resumen!== null)
                                            @foreach ($resumen->detalle_puntajes as $puntaje)
                                                @if ($puntaje->dimension_detail_id == $preguntas->id)
                                                <td class="text-center">
                                                    <span class="badge badge-success">{{$puntaje->puntaje}}</span>
                                                </td>
                                                @endif
                                            @endforeach
                                        @endif

                                        @if($announcement->status != 4)
                                        <td class="text-right">

                                            @if ($resumen!== null)

                                                @if ($preguntas->tipo_calificacion == 1)

                                                <select name="{{$preguntas->id}}" class="form-control form-control-user">
                                                    @if ($resumen!== null)
                                                        @foreach ($resumen->detalle_puntajes as $puntaje)
                                                            @if ($puntaje->dimension_detail_id == $preguntas->id)
                                                                <option value='{{$puntaje->puntaje}}'></option>
                                                            @endif
                                                        @endforeach
                                                    @endif

                                                    @for ($i = 1; $i <= $preguntas->value; $i++)
                                                        <option value="{{$i}}"> {{$i}}</option>
                                                    @endfor
                                                </select>
                                                @elseif ($preguntas->tipo_calificacion == 2)
                                                    <select name="{{$preguntas->id}}" class="form-control form-control-user">
                                                        @if ($resumen!== null)
                                                        @foreach ($resumen->detalle_puntajes as $puntaje)
                                                            @if ($puntaje->dimension_detail_id == $preguntas->id)
                                                                <option value='{{$puntaje->puntaje}}'></option>
                                                            @endif
                                                        @endforeach
                                                    @endif
                                                        <option value="{{$preguntas->value}}">Si</option>
                                                        @if ($preguntas->value == 1)
                                                            <option value="0">No</option>
                                                            @else
                                                            <option value="1">No</option>
                                                        @endif

                                                    </select>
                                                    @elseif ($preguntas->tipo_calificacion == 3)
                                                    <select required name="{{$preguntas->id}}" class="form-control form-control-user">
                                                        @if ($resumen!== null)
                                                        @foreach ($resumen->detalle_puntajes as $puntaje)
                                                            @if ($puntaje->dimension_detail_id == $preguntas->id)
                                                                <option value='{{$puntaje->puntaje}}'></option>
                                                            @endif
                                                        @endforeach
                                                    @endif
                                                        <option value="1">Bajo</option>
                                                        <option value="{{$preguntas->value/2}}">Medio</option>
                                                        <option value="{{$preguntas->value}}">Alto</option>
                                                    </select>
                                                @endif
                                            @else
                                                @if ($preguntas->tipo_calificacion == 1)
                                                    <select required name="{{$preguntas->id}}" class="form-control form-control-user">
                                                        @if ($resumen!== null)
                                                        @foreach ($resumen->detalle_puntajes as $puntaje)
                                                            @if ($puntaje->dimension_detail_id == $preguntas->id)
                                                                <option value='{{$puntaje->puntaje}}'></option>
                                                            @endif
                                                        @endforeach
                                                    @endif
                                                        @for ($i = 1; $i <= $preguntas->value; $i++)
                                                            <option value="{{$i}}"> {{$i}}</option>
                                                        @endfor
                                                    </select>
                                                @elseif ($preguntas->tipo_calificacion == 2)
                                                    <select required name="{{$preguntas->id}}" class="form-control form-control-user">
                                                        @if ($resumen!== null)
                                                        @foreach ($resumen->detalle_puntajes as $puntaje)
                                                            @if ($puntaje->dimension_detail_id == $preguntas->id)
                                                                <option value='{{$puntaje->puntaje}}'></option>
                                                            @endif
                                                        @endforeach
                                                    @endif
                                                        <option value="{{$preguntas->value}}">Si</option>
                                                        @if ($preguntas->value == 1)
                                                            <option value="0">No</option>
                                                            @else
                                                            <option value="1">No</option>
                                                        @endif
                                                    </select>
                                                    @elseif ($preguntas->tipo_calificacion == 3)
                                                    <select required name="{{$preguntas->id}}" class="form-control form-control-user">
                                                        @if ($resumen!== null)
                                                        @foreach ($resumen->detalle_puntajes as $puntaje)
                                                            @if ($puntaje->dimension_detail_id == $preguntas->id)
                                                                <option value='{{$puntaje->puntaje}}'></option>
                                                            @endif
                                                        @endforeach
                                                    @endif
                                                        <option value="1">Bajo</option>
                                                        <option value="{{$preguntas->value/2}}">Medio</option>
                                                        <option value="{{$preguntas->value}}">Alto</option>
                                                    </select>
                                                @endif
                                            @endif
                                        </td>
                                        @endif
                                    </tr>
                                    @endforeach

                                </tbody>
                            </table>

                    </div>
                </div>
        @endforeach
    </div>

     <!-- DataTales Example -->
     <div class="card shadow mb-4">
        <div class="card-header py-3">
            <div class="row">
                <div class="col-md-9">
                    *El puntaje máximo para esta convocatoria es de {{ $announcement->puntaje_maximo }} puntos.
                </div>
                <div class="col-md-3 text-right">
                    @if($announcement->status == 4)
                        <div class="alert alert-danger float-right" role="alert">
                            Cerrada / Finalizada
                        </div>
                    @else
                        @if ($resumen!== null)
                            <button type="submit" class="btn btn-primary bg-exito text-white">Actualizar</button>
                        @else
                            <button type="submit" class="btn btn-success bg-exito text-white">Guardar</button>
                        @endif
                    @endif

                </div>
            </div>

            <h6 class="m-0 font-weight-bold text-primary">
            </h6>
        </div>
    </div>
</form>

</div>

 <!-- Detalle Postulación Modal-->
 <div class="modal fade" id="resumen" tabindex="-1" role="dialog" aria-labelledby="exampleModalLabel"
 aria-hidden="true">
    <div class="modal-dialog modal-lg" role="document">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title" id="exampleModalLabel">Detalle de postulación de {{$postulante->name}} {{$postulante->last_name}}</h5>
                <button class="close" type="button" data-dismiss="modal" aria-label="Close">
                    <span aria-hidden="true">×</span>
                </button>
            </div>
            <div class="modal-body">
                        <div class="accordion" id="accordionExample">
                            @foreach ($postulacion->apply_answers as $key => $postulacion_apply )
                            <div class="card">
                            <div class="card-header" id="headingOne">
                                <h2 class="mb-0">
                                <button class="btn btn-link btn-block text-left" type="button" data-toggle="collapse" data-target="#collapse{{$postulacion_apply->id}}" aria-expanded="true" aria-controls="collapse{{$postulacion_apply->id}}">
                                        {{$postulacion_apply->apply_detail->question}}
                                </button>
                                </h2>
                            </div>

                            <div id="collapse{{$postulacion_apply->id}}"  @if($key == 0) class="collapse show" @else class="collapse" @endif aria-labelledby="heading{{$postulacion_apply->id}}" data-parent="#accordionExample">
                                <div class="card-body">
                                    <span>R.- {{$postulacion_apply->answer}}</span>
                                </div>
                            </div>
                            </div>

                            @endforeach
                        </div>
            </div>
            <div class="modal-footer">
                <button class="btn btn-secondary" type="button" data-dismiss="modal">Cerrar</button>
            </div>
        </div>
    </div>
</div>

<!--Información puntajes Modal-->
<div class="modal fade" id="infoPuntajes" tabindex="-1" aria-labelledby="infoPuntajesLabel" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" id="infoPuntajesLabel"><b>Escala de Evaluación</b></h5>
          <button type="button" class="close" data-dismiss="modal" aria-label="Close">
            <span aria-hidden="true">&times;</span>
          </button>
        </div>
        <div class="modal-body">

          <table class="table table-bordered" id="dataTable" width="100%" cellspacing="0">
            <thead>
                <tr>
                    <th>Nota&nbsp;o&nbsp;Puntaje</th>
                    <th>Descripción</th>
                </tr>
            </thead>
            <tbody>

                <tr>
                    <td class="text-center">
                        1
                    </td>

                    <td>
                        El proyecto postulado no cumple con lo esperado
                    </td>

                </tr>

                <tr>
                    <td class="text-center">
                        2
                    </td>

                    <td>
                        El proyecto postulado cumple débilmente  con lo esperado
                    </td>

                </tr>

                <tr>
                    <td class="text-center">
                        3
                    </td>

                    <td>
                        El proyecto postulado cumple medianamente con lo esperado
                    </td>

                </tr>

                <tr>
                    <td class="text-center">
                        4
                    </td>

                    <td>
                        El proyecto postulado cumple mayoritariamente con lo esperado
                    </td>

                </tr>

                <tr>
                    <td class="text-center">
                        5
                    </td>

                    <td>
                        El proyecto postulado cumple completamente con lo esperado
                    </td>

                </tr>

                <tr>
                    <td class="text-center">
                        1
                    </td>

                    <td>
                       No
                    </td>

                </tr>

                <tr>
                    <td class="text-center">
                        5
                    </td>

                    <td>
                        Si
                    </td>

                </tr>

            </tbody>
        </table>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-primary" data-dismiss="modal">OK</button>
        </div>
      </div>
    </div>
  </div>

@endsection
