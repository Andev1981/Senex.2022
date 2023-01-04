@extends('layouts.admin')

@section('content')

<div class="container-fluid">

    <!-- Page Heading -->
    <h1 class="h3 mb-2 text-gray-800">Evaluador de Postulación (Editando)</h1>

    <!-- DataTales Example -->
    <div class="card shadow mb-4">
        <div class="card-header py-3">
            <h6 class="m-0 font-weight-bold text-primary">Postulante</h6>

        </div>
        <div class="card-body">
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
                    <label>Fecha Postulación</label><br>
                    <input class="form-control form-control-user" type="text" value="{{ $postulacion->created_at->format('d-m-Y') }}" readonly>
                </div>

            </div>
        </div>
        <div class="card-footer">
            <div>
                <a class="dropdown-item" href="#" data-toggle="modal" data-target="#resumen">
                    <i class="fas fa-sign-out-alt fa-sm fa-fw mr-2 text-gray-400"></i>
                    Detalle de la postulación
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
    <div>
        @foreach ($dimension as $detalle)

                <!-- DataTales Example -->
                <div class="card shadow mb-4">
                    <div class="card-header py-3">
                        <h6 class="m-0 font-weight-bold text-primary">{{ $detalle->name }}</h6>
                        <small>**{{ $detalle->description }}</small>
                    </div>
                    <div class="card-body">
                        <div class="table-responsive">
                            <table class="table table-bordered" id="dataTable" width="100%" cellspacing="0">
                                <thead>
                                    <tr>
                                        <th>Pregunta</th>
                                        <th class="text-right">Calificación&nbsp;Actual</th>
                                        <th class="text-right">Editar</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    @foreach($detalle->dimension_details as $preguntas)

                                    @dd($detalle->domension_details)
                                    <tr>
                                        <td>
                                            {{$preguntas->question}}
                                        </td>
                                        <td class="text-center">
                                            <div class="alert alert-success" role="alert">
                                                {{$preguntas->detalle_puntaje->puntaje}}
                                            </div>
                                        </td>

                                        <td class="text-right">
                                                <select required name="{{$preguntas->id}}" class="form-control form-control-user">
                                                    <option></option>
                                                    @for ($i = 1; $i <= $preguntas->value; $i++)
                                                        <option value="{{$i}}"> {{$i}}</option>
                                                    @endfor
                                                </select>


                                                @if ($preguntas->value == 0)
                                                    <input type="float" value="0.0" min="0" max="10"/>
                                                @elseif ($preguntas->value == 1)
                                                    <input type="number" min="0" max="10"/>
                                                @elseif ($preguntas->value == 2)
                                                    <select class="form-control form-control-user">
                                                        <option default>--</option>
                                                        <option value="{{$preguntas->value}}">Si</option>
                                                        <option value="{{$preguntas->qualification->q_boolean_y_n_2}}">No</option>
                                                    </select>
                                                @elseif ($preguntas->value == 3)
                                                    <select class="form-control form-control-user">
                                                        <option default>--</option>
                                                        <option value="{{$preguntas->qualification->q_boolean_b_1}}">Bajo</option>
                                                        <option value="{{$preguntas->qualification->q_boolean_m_2}}">Medio</option>
                                                        <option value="{{$preguntas->qualification->q_boolean_a_3}}">Alto</option>
                                                    </select>
                                                @endif
                                        </td>
                                    </tr>
                                    @endforeach

                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
        @endforeach
    </div>

     <!-- DataTales Example -->
     <div class="card shadow mb-4">
        <div class="card-header py-3">
            <div class="row">
                <div class="col-md-9">
                    *Se selecciona a las empresas que suman más de {{ $dimension[0]->announcement->puntaje_minimo }} de un total de {{ $dimension[0]->announcement->puntaje_maximo }}
                </div>
                <div class="col-md-3 text-right">
                    <button type="submit" class="btn btn-success">Guardar</button>
                </div>
            </div>

            <h6 class="m-0 font-weight-bold text-primary">
            </h6>
        </div>
    </div>
</form>

</div>

 <!-- Logout Modal-->
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

@endsection
