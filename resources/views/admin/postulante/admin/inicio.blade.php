@extends('layouts.admin')

@section('content')

<div class="container-fluid">

        @php
            $bloqueo = true;
            $visible = 'visible';
        @endphp


    <!-- DataTales Example -->
    <div class="card shadow mb-4">
        <div class="card-header py-3">
            <h2 class="h4 mb-2 text-gray-800">Formulario de Postulación</h2>Datos del Postulante
        </div>
        <form method="POST" action="{{ route('postular.data') }}" enctype='multipart/form-data'>
            @csrf
            <input type="hidden" name="apply_id" value="{{ $apply->id }}"/>
            <input type="hidden" name="postulante_id" value="{{ $apply->user_id }}"/>
        <div class="card-body">
            <h6 class="m-0 font-weight-bold text-primary mb-2">
                {{ $apply->user->name }}  {{ $apply->user->last_name }}
                <hr>
            </h6>
            <div class="row">
                <div class="col-md-4 mb-4">
                    <small>Nombre de la empresa o proyecto con el que postula</small><br>
                    <input class="form-control" type="text" name='project_name' value="{{$apply->project_name}}" {{ $bloqueo == true ? 'readonly' : '' }}>
                </div>
                <div class="col-md-4 mb-4">
                    <small>Tipo persona</small><br>
                    @if (!$bloqueo == true)
                        <select class="form-control"  name="person" {{ $bloqueo == true ? 'readonly' : '' }}>

                                @if ($apply->person == 0)
                                    <option value="0">Persona natural</option>
                                    <option value="1">Persona juridica</option>
                                @elseif ($apply->person ==1)
                                    <option value="1">Persona juridica</option>
                                    <option value="0">Persona natural</option>
                                @else
                                    <option value="">Selecciona</option>
                                    <option value="0">Persona natural</option>
                                    <option value="1">Persona juridica</option>
                                @endif


                        </select>
                    @else
                        @if ($apply->person == 0)
                            <input class="form-control" type="text" name='person' value="Persona natural" {{ $bloqueo == true ? 'readonly' : '' }}>
                        @elseif ($apply->person ==1)
                            <input class="form-control" type="text" name='person' value="Persona juridica" {{ $bloqueo == true ? 'readonly' : '' }}>
                        @else
                            <input class="form-control" type="text" name='person' value="" {{ $bloqueo == true ? 'readonly' : '' }}>
                        @endif


                    @endif

                </div>
                <div class="col-md-4 mb-4">
                    <small>Nombre representante</small><br>
                    <input class="form-control" type="text" name="representante_legal" value="{{ $apply->representante_legal }}" {{ $bloqueo == true ? 'readonly' : '' }}>
                </div>
                <div class="col-md-4 mb-4">
                    <small>Rut representante</small><br>
                    <input class="form-control" type="text" name="rut_representante" placeholder="ej: 12345678-9" value="{{ $apply->rut_representante }}" {{ $bloqueo == true ? 'readonly' : '' }}>
                </div>
                <div class="col-md-4 mb-4">
                    <small>Telefono representante</small><br>
                    <input class="form-control" type="text" name="telefono_representante" value="{{ $apply->telefono_representante }}" {{ $bloqueo == true ? 'readonly' : '' }}>
                </div>
                <div class="col-md-4 mb-4">
                    <small>Email representante</small><br>
                    <input class="form-control" type="email" name="email_representante" value="{{ $apply->email_representante }}" {{ $bloqueo == true ? 'readonly' : '' }}>
                </div>
                <div class="col-md-4 mb-4">
                    <small>Domicilio de la empresa</small><br>
                    <input class="form-control" type="text" name="domicilio"  placeholder="ej: Calle 1, #123" value="{{ $apply->domicilio }}" {{ $bloqueo == true ? 'readonly' : '' }}>
                </div>
                <div class="col-md-4 mb-4">
                    <small>Razón social de la empresa</small><br>
                    <input class="form-control" type="text" name="razon_social" value="{{ $apply->razon_social}}" {{ $bloqueo == true ? 'readonly' : '' }}>
                </div>
                <div class="col-md-4 mb-4">
                    <small>Rut de la empresa</small><br>
                    <input class="form-control" type="text" name="rut_sociedad" placeholder="ej:12345678-9" value="{{ $apply->rut_sociedad }}" {{ $bloqueo == true ? 'readonly' : '' }}>
                </div>
                <div class="col-md-4 mb-4">
                    <small>Giro del negocio</small><br>
                    <input class="form-control" type="text" name="giro" value="{{ $apply->giro }}" {{ $bloqueo == true ? 'readonly' : '' }}>
                </div>
                <div class="col-md-4 mb-4">
                    <small>Fecha constitucion de la empresa</small><br>
                    <input class="form-control" type="date" value="{{ $apply->fecha_constitucion }}" name="fecha_constitucion" {{ $bloqueo == true ? 'readonly' : '' }} min="{{ \Carbon\Carbon::now()->subYears(6)->format('Y-m-d') }}" max="{{ \Carbon\Carbon::now()->format('Y-m-d') }}">
                </div>
                <div class="col-md-12 mb-4">
                    <br>
                    <small>Descripcion del proyecto</small><br>
                    <textarea class="form-control text-left" type="text" name="descripcion" {{ $bloqueo == true ? 'readonly' : '' }}>{{ $apply->descripcion }}</textarea>
                </div>

                @foreach ($applyDetails as $applyDetail)



                @switch($applyDetail->type)
                    @case(0)
                                @php
                                    $answer = null;
                                    $visible = 'visible';
                                @endphp

                                @foreach($applyAnswers as $applyAnswer)
                                    @if($applyAnswer->apply_detail_id == $applyDetail->id)
                                        @php
                                            $answer = $applyAnswer->answer;
                                        @endphp
                                    @endif
                                @endforeach

                        @if ($applyDetail->relation != null)
                            @if ($applyDetail->relation->estado == 1)
                                @if (!$applyDetail->apply_answer == null)
                                        @php
                                            $visible = '';
                                        @endphp
                                    @else
                                        @php
                                            $visible = 'invisible';
                                        @endphp
                                    @endif
                                <div class="col-md-4 mb-4 {{$visible}} section-{{$applyDetail->relation->apply_detail_option->apply_detail->id}}" id="hidden-{{$applyDetail->relation->apply_detail_option_id}}" name="{{$applyDetail->relation->estado}}">
                                    <small>{{$applyDetail->question}}</small><br>
                                    <input class="form-control" {{ $bloqueo == true ? 'readonly' : '' }} placeholder="{{$applyDetail->placeholder}}" type="text" {{ $applyDetail->obligatorio == 1 ? 'required' : '' }} name="{{ $applyDetail->id }}" value="{{ $answer == null ? '' : $answer }}">
                                </div>
                                @else
                                    <div class="col-md-4 mb-4 {{$visible}} section-{{$applyDetail->relation->apply_detail_option->apply_detail->id}}" id="hidden-{{$applyDetail->relation->apply_detail_option_id}}" name="{{$applyDetail->relation->estado}}">
                                        <small>{{$applyDetail->question}}</small><br>
                                        <input class="form-control" {{ $bloqueo == true ? 'readonly' : '' }} placeholder="{{$applyDetail->placeholder}}" type="text" {{ $applyDetail->obligatorio == 1 ? 'required' : '' }} name="{{ $applyDetail->id }}" value="{{ $answer == null ? '' : $answer }}">
                                    </div>
                                @endif
                            @else

                                <div class="col-md-4 mb-4">
                                    <small>{{$applyDetail->question}}</small><br>
                                    <input class="form-control" {{ $bloqueo == true ? 'readonly' : '' }} placeholder="{{$applyDetail->placeholder}}" type="text" {{ $applyDetail->obligatorio == 1 ? 'required' : '' }} name="{{ $applyDetail->id }}" value="{{ $answer == null ? '' : $answer }}">
                                </div>
                        @endif

                    @break
                    @case(1)
                                @php
                                    $answer = null;
                                    $visible = 'visible';
                                @endphp

                                @foreach($applyAnswers as $applyAnswer)

                                    @if($applyAnswer->apply_detail_id == $applyDetail->id)
                                        @php
                                            $answer = $applyAnswer->answer;
                                        @endphp
                                    @endif

                                @endforeach

                                @if ($applyDetail->relation != null)

                                    @if ($applyDetail->relation->estado == 1)

                                        @if (!$applyDetail->apply_answer == null)
                                                @php
                                                    $visible = '';
                                                @endphp
                                            @else
                                                @php
                                                    $visible = 'invisible';
                                                @endphp
                                            @endif

                                            <div class="col-md-12 mb-4 {{$visible}} section-{{$applyDetail->relation->apply_detail_option->apply_detail->id}}" id="hidden-{{$applyDetail->relation->apply_detail_option_id}}" name="{{$applyDetail->relation->estado}}">
                                                <small>{{$applyDetail->question}}</small><br>
                                                <textarea class="form-control" {{ $bloqueo == true ? 'readonly' : '' }} placeholder="{{$applyDetail->placeholder}}" type="text" {{ $applyDetail->obligatorio == 1 ? 'required' : '' }} name="{{ $applyDetail->id }}">{{ $answer == null ? '' : $answer }}</textarea>
                                            </div>
                                        @else
                                    @if (!$applyDetail->apply_answer == null)
                                            @php
                                                $visible = '';
                                            @endphp
                                        @else
                                            @php
                                                $visible = 'invisible';
                                            @endphp
                                        @endif

                                        <div class="col-md-12 mb-4 {{$visible}} section-{{$applyDetail->relation->apply_detail_option->apply_detail->id}}" id="hidden-{{$applyDetail->relation->apply_detail_option_id}}" name="{{$applyDetail->relation->estado}}">
                                            <small>{{$applyDetail->question}}</small><br>
                                            <textarea class="form-control" {{ $bloqueo == true ? 'readonly' : '' }} placeholder="{{$applyDetail->placeholder}}" type="text" {{ $applyDetail->obligatorio == 1 ? 'required' : '' }} name="{{ $applyDetail->id }}">{{ $answer == null ? '' : $answer }}</textarea>
                                        </div>
                                    @endif
                                @else
                                    <div class="col-md-12 mb-4">
                                        <small>{{$applyDetail->question}}</small><br>
                                        <textarea class="form-control" {{ $bloqueo == true ? 'readonly' : '' }} placeholder="{{$applyDetail->placeholder}}" type="text" {{ $applyDetail->obligatorio == 1 ? 'required' : '' }} name="{{ $applyDetail->id }}">{{ $answer == null ? '' : $answer }}</textarea>
                                    </div>
                                @endif
                    @break

                    @case(2)
                                @php
                                    $answer = null;
                                    $visible = 'visible';
                                @endphp

                                @foreach($applyAnswers as $applyAnswer)

                                    @if($applyAnswer->apply_detail_id == $applyDetail->id)
                                        @php
                                            $answer = $applyAnswer->answer;
                                        @endphp
                                    @endif
                                @endforeach

                                @if ($applyDetail->relation != null)
                                    <h1>no null</h1>
                                @else
                                    <div class="col-md-4 mb-4">
                                        <small>{{$applyDetail->question}}</small><br>
                                        <input type="number" {{ $bloqueo == true ? 'readonly' : '' }} min="{{$applyDetail->min}}" max="{{$applyDetail->max}}" placeholder="{{$applyDetail->placeholder}}" class="form-control" type="text" {{ $applyDetail->obligatorio == 1 ? 'required' : '' }} name="{{ $applyDetail->id }}" value="{{ $answer == null ? '' : $answer }}" />
                                    </div>
                                @endif

                    @break

                    @case(3)
                                    @php
                                        $answer = null;
                                        $visible = 'visible';
                                    @endphp

                                    @foreach($applyAnswers as $applyAnswer)

                                        @if($applyAnswer->apply_detail_id == $applyDetail->id)
                                            @php
                                                $answer = $applyAnswer->answer;
                                            @endphp
                                        @endif
                                    @endforeach

                        @if ($applyDetail->relation != null)
                            @if ($applyDetail->relation->estado == 1)
                                @if (!$applyDetail->apply_answer == null)
                                    @php
                                        $visible = '';
                                    @endphp
                                @else
                                    @php
                                        $visible = 'invisible';
                                    @endphp
                                @endif
                                <div class="col-md-4 mb-4 {{$visible}} section-{{$applyDetail->relation->apply_detail_option->apply_detail->id}}" id="hidden-{{$applyDetail->relation->apply_detail_option_id}}" name="{{$applyDetail->relation->estado}}">

                                    <small>{{$applyDetail->question}}</small><br>
                                    @if (!$bloqueo == true)
                                        <select id="select-{{$applyDetail->id}}" {{ $bloqueo == true ? 'readonly' : '' }} class="form-control selector" type="text" {{ $applyDetail->obligatorio == 1 ? 'required' : '' }} name="{{ $applyDetail->id }}">
                                            <option value="{{ $answer == null ? '' : $answer }}">{{ $applyDetail->apply_answer == null ? '' : $applyDetail->apply_answer->answer }}</option>
                                            <option>---Selecciona---</option>
                                            @foreach ($applyDetail->apply_detail_options as $applyOption)
                                                <option value="{{$applyOption->id}}">{{ $applyOption->name }}</option>
                                            @endforeach

                                        </select>
                                    @else
                                        <input {{ $bloqueo == true ? 'readonly' : '' }} class="form-control" type="text"   {{ $applyDetail->obligatorio == 1 ? 'required' : '' }} placeholder="{{$applyDetail->placeholder}}" name="{{  $applyDetail->id }}" value="{{ $answer == null ? '' : $answer }}">
                                    @endif
                                </div>
                            @endif
                        @else
                            <div class="col-md-4 mb-4">
                                <small>{{$applyDetail->question}}</small><br>
                                @if (!$bloqueo == true)
                                        @php
                                           $valor='';
                                        @endphp
                                        @foreach ($applyDetail->apply_detail_options as $applyOption)
                                            @if(!$applyOption->relation == null)
                                               @php
                                                   $valor = $applyOption->relation->estado;
                                               @endphp
                                            @endif
                                        @endforeach
                                        <input type="hidden" id="estado-{{$applyDetail->id}}" value="{{$valor}}" />
                                        <select id="select-{{$applyDetail->id}}" {{ $bloqueo == true ? 'readonly' : '' }} class="form-control selector" type="text" {{ $applyDetail->obligatorio == 1 ? 'required' : '' }} name="{{ $applyDetail->id }}">
                                        <option value="{{ $answer == null ? '' : $answer }}">{{ $answer == null ? '' : $answer }}</option>
                                        <option>---Selecciona---</option>
                                        @foreach ($applyDetail->apply_detail_options as $applyOption)
                                            <option value="{{$applyOption->id}}">{{ $applyOption->name }}</option>
                                        @endforeach

                                    </select>
                                    @foreach ($applyDetail->apply_detail_options as $applyOption)
                                        @empty ( $applyOption->reation)
                                            <input type="hidden" name="evento-{{$applyOption->id}}" value="{{$applyOption->id}}"/>
                                        @endempty
                                    @endforeach
                                @else
                                    <input {{ $bloqueo == true ? 'readonly' : '' }} class="form-control" type="text"   {{ $applyDetail->obligatorio == 1 ? 'required' : '' }} placeholder="{{$applyDetail->placeholder}}" name="{{  $applyDetail->id }}" value="{{ $answer == null ? '' : $answer }}">
                                @endif
                            </div>

                        @endif

                    @break

                    @case(4)
                        <div class="col-md-4 mb-4">
                            <small>{{$applyDetail->question}}</small><br>
                            <select {{ $bloqueo == true ? 'readonly' : '' }} class="form-control" type="text" {{ $applyDetail->obligatorio == 1 ? 'required' : '' }} name="{{ $applyDetail->id }}">

                                <option>---Selecciona---</option>
                                @foreach ($applyDetail->apply_detail_options as $applyOption)

                                    <option value="{{$applyOption->id}}">{{ $applyOption->name }}</option>
                                @endforeach

                            </select>
                        </div>
                    @break

                    @case(5)
                                    @php
                                        $answer = null;
                                        $visible = 'visible';
                                    @endphp

                            @foreach($applyAnswers as $applyAnswer)

                                @if($applyAnswer->apply_detail_id == $applyDetail->id)
                                    @php
                                        $answer = $applyAnswer->answer;
                                    @endphp
                                @endif
                            @endforeach
                    @if ($applyDetail->relation != null)
                        @if ($applyDetail->relation->estado == 1)
                            @if (!$applyDetail->apply_answer == null)
                                @php
                                    $visible = '';
                                @endphp
                            @else
                                @php
                                    $visible = 'invisible';
                                @endphp
                            @endif
                            <div class="col-md-4 mb-4  {{$visible}} section-{{$applyDetail->relation->apply_detail_option->apply_detail->id}}" id="hidden-{{$applyDetail->relation->apply_detail_option_id}}" name="{{$applyDetail->relation->estado}}">
                                <small>{{$applyDetail->question}}</small><br>
                                 @if (!$bloqueo == true && !$answer == null)
                                    <input {{ $bloqueo == true ? 'disabled' : '' }} class="form-control" type="file" placeholder="{{$applyDetail->placeholder}}" name="{{  $applyDetail->id }}" value="{{ $answer == null ? '' : $answer }}">
                                @else
                                    <input {{ $bloqueo == true ? 'disabled' : '' }} class="form-control" type="file"   {{ $applyDetail->obligatorio == 1 ? 'required' : '' }} placeholder="{{$applyDetail->placeholder}}" name="{{  $applyDetail->id }}" value="{{ $answer == null ? '' : $answer }}">
                                @endif
                                @if (!$answer == null)
                                    <div>
                                        <br>
                                        <a class="bg-exito px-2 py-1 rounded text-sm text-white" href="{{ asset($answer)}}" target="_blank">Ver archivo</a>
                                    </div>
                                @else
                                No se ha subido ningun archivo
                                @endif
                            </div>
                        @else
                            @if (!$answer == null)
                                @php
                                    $visible = '';
                                @endphp
                            @else
                                @php
                                    $visible = 'invisible';
                                @endphp
                            @endif

                        <div class="col-md-4 mb-4 {{$visible}} section-{{$applyDetail->relation->apply_detail_option->apply_detail->id}}" id="hidden-{{$applyDetail->relation->apply_detail_option_id}}" name="{{$applyDetail->relation->estado}}">
                            <small>{{$applyDetail->question}}</small><br>
                                @if (!$bloqueo == true && !$applyDetail->apply_answer == null)
                                <input {{ $bloqueo == true ? 'disabled' : '' }} class="form-control" type="file" placeholder="{{$applyDetail->placeholder}}" name="{{  $applyDetail->id }}" value="{{ $answer == null ? '' : $answer }}">
                                @else
                                    <input {{ $bloqueo == true ? 'disabled' : '' }} class="form-control" type="file"   {{ $applyDetail->obligatorio == 1 ? 'required' : '' }} placeholder="{{$applyDetail->placeholder}}" name="{{  $applyDetail->id }}" value="{{ $answer == null ? '' : $answer }}">
                                @endif
                            @if (!$answer == null)
                                <div>
                                    <br>
                                    <a class="bg-exito px-2 py-1 rounded text-sm text-white" href="{{ asset($answer)}}" target="_blank">Ver archivo</a>
                                </div>
                            @else
                            No se ha subido ningun archivo
                            @endif
                        </div>
                        @endif
                    @else
                        <div class="col-md-4 mb-4">
                            <small>{{$applyDetail->question}}</small><br>
                            @if (!$bloqueo == true && !$answer == null)
                                <input {{ $bloqueo == true ? 'disabled' : '' }} class="form-control" type="file" placeholder="{{$applyDetail->placeholder}}" name="{{  $applyDetail->id }}" value="{{ $answer == null ? '' : $answer }}">
                            @else
                                <input {{ $bloqueo == true ? 'disabled' : '' }} class="form-control" type="file"   {{ $applyDetail->obligatorio == 1 ? 'required' : '' }} placeholder="{{$applyDetail->placeholder}}" name="{{  $applyDetail->id }}" value="{{ $answer == null ? '' : $answer }}">
                            @endif
                            @if (!$answer == null)
                                <div>
                                    <br>
                                    <a class="bg-exito px-2 py-1 rounded text-sm text-white" href="{{ asset($answer)}}" target="_blank">Ver archivo</a>
                                </div>
                            @else
                            No se ha subido ningun archivo
                            @endif
                        </div>
                    @endif
                    @break

                    @case(6)
                                    @php
                                        $answer = null;
                                        $visible = 'visible';
                                    @endphp

                            @foreach($applyAnswers as $applyAnswer)

                                @if($applyAnswer->apply_detail_id == $applyDetail->id)
                                    @php
                                        $answer = $applyAnswer->answer;
                                    @endphp
                                @endif
                            @endforeach
                        <div class="col-md-4 mb-4">
                            <small>{{$applyDetail->question}}</small><br>
                            <input {{ $bloqueo == true ? 'readonly' : '' }} class="form-control" type="text"   {{ $applyDetail->obligatorio == 1 ? 'required' : '' }} placeholder="{{$applyDetail->placeholder}}" name="{{  $applyDetail->id }}" value="{{ $answer == null ? '' : $answer }}">
                        </div>
                    @break

                    @case(7)
                                @php
                                        $answer = null;
                                @endphp

                            @foreach($applyAnswers as $applyAnswer)

                                @if($applyAnswer->apply_detail_id == $applyDetail->id)
                                    @php
                                        $answer = $applyAnswer->answer;
                                    @endphp
                                @endif
                            @endforeach
                        <div class="col-md-4 mb-4">
                            <small>{{$applyDetail->question}}</small><br>
                            @if (!$bloqueo == true)
                            <select
                                class="form-control"
                                type="text"
                                {{ $applyDetail->obligatorio == 1 ? 'required' : '' }}
                                {{ $bloqueo == true ? 'readonly' : '' }}
                                name="{{ $applyDetail->id }}">

                                <option value="{{ $answer == null ? '' : $answer }}">{{ $answer == null ? '' : $answer }}</option>
                                <option>---Selecciona---</option>
                                @foreach ($applyDetail->apply_detail_options as $applyOption)

                                    @if ( $applyOption->valor > 0)
                                        <option value="{{$applyOption->id}}">{{ $applyOption->name }}</option>
                                    @endif
                                @endforeach

                            </select>
                            @else
                                <input {{ $bloqueo == true ? 'readonly' : '' }} class="form-control" type="text"   {{ $applyDetail->obligatorio == 1 ? 'required' : '' }} placeholder="{{$applyDetail->placeholder}}" name="{{  $applyDetail->id }}" value="{{ $answer == null ? '' : $answer }}">
                            @endif
                        </div>
                        @foreach ($applyDetail->apply_detail_options as $applyOption)
                            @if ( $applyOption->valor == 0)
                                <div class="col-md-4 mb-4">
                                    <small>{{$applyDetail->question}} | Ingresar otra opcion</small><br>
                                    <input
                                        class="form-control"
                                        type="text"
                                        placeholder="{{$applyDetail->placeholder}}"
                                        {{ $applyDetail->obligatorio == 1 ? 'required' : '' }}
                                        name="{{ $applyDetail->id  }}"
                                        value="{{ $answer == null ? '' : $answer }}">
                                </div>
                            @endif
                        @endforeach
                    @break

                    @case(8)
                        <div class="col-md-12 mb-4">
                            <h6 class="m-0 font-weight-bold text-primary">
                                {{$applyDetail->question}}
                                <hr>
                            </h6>
                        </div>
                    @break
                    @case(9)
                        <div class="col-md-12 mb-4">
                            <h6 class="m-0 font-weight-bold text-base text-primary">
                                {{$applyDetail->question}}
                                <hr>
                            </h6>
                        </div>
                    @break

                    @case(11)
                                    @php
                                        $answer = null;
                                        $visible = 'visible';
                                    @endphp

                            @foreach($applyAnswers as $applyAnswer)

                                @if($applyAnswer->apply_detail_id == $applyDetail->id)
                                    @php
                                        $answer = $applyAnswer->answer;
                                    @endphp
                                @endif
                            @endforeach
                        <div class="col-md-4 mb-4">
                            <small>{{$applyDetail->question}}</small><br>
                            +56 <input {{ $bloqueo == true ? 'readonly' : '' }} class="form-control" type="number"   {{ $applyDetail->obligatorio == 0 ? 'required' : '' }} placeholder="{{$applyDetail->placeholder}}" name="{{  $applyDetail->id }}" value="{{ $answer == null ? '' : $answer }}" min="7" max="9">
                        </div>
                    @break

                    @default

                @endswitch

                @endforeach

            </div>
            <div>
                @if (!$bloqueo == true)
                <p class="mt-2">Quieres enviar tu postulacion? <input type="checkbox" name="enviar"/><br><small> ***Si seleccionas este campo, no podras editar el formulario posteriormente</small>  </p>
                @else
                Su postulacion ya esta enviada!!
                @endif
            </div>

        </div>
        <div class="card-footer">
            @if (!$bloqueo == true)
            <button type="submit" class="btn bg-exito btn-success btn-sm float-right mb-2">Guardar</button>
            @endif
        </div>
        </form>
    </div>
@endsection
@push('my-scripts')
<script>

window.addEventListener("load",function(){

     const elementos =  document.getElementsByClassName('selector');

    for(i=0;i<elementos.length;i++){

        const el = document.getElementById(elementos[i].id);

            const el2 = document.getElementById('hidden-'+el.value);
            const el3 = document.getElementsByClassName('section-'+el.name);
            const estado = document.getElementById('estado-'+el.name);

                console.log(el2);

                if(estado){
                    if(estado.value == 1){
                        for(ii =0; ii<el3.length;ii++){
                            el3[ii].classList.remove('invisible');
                            el3[ii].classList.add('invisible');
                        }

                        if(el3.length == 1){
                            if(el2){
                                el3[0].classList.remove('invisible');

                            }else{
                                el3[0].classList.add('invisible');

                            }



                        }else if(el3.length == 2){
                            el3[0].classList.add('invisible');

                        }

                    }else{
                        console.log(2)
                        for(iii =0; iii<el3.length;iii++){
                            el3[iii].classList.add('invisible');
                            el3[iii].classList.remove('invisible');
                        }

                        if(el3.length == 1){

                            if(el2){
                                el3[0].classList.add('invisible');

                            }else{
                                el3[0].classList.remove('invisible');

                            }

                        }else if(el3.length == 2){
                            el2.classList.add('invisible');
                            console.log(4)
                        }

                    }
                }else{
                    for(iiii =0; iiii<el3.length;iiii++){
                            el3[iiii].classList.add('invisible');
                            el3[iiii].classList.remove('invisible');
                        }

                        console.log(el3[0]);

                        if(el3[0] != undefined){
                            el3[0].classList.add('invisible');
                            console.log(5)
                        }


                }




    }
});

    const elementos =  document.getElementsByClassName('selector');

    for(i=0;i<elementos.length;i++){

        const el = document.getElementById(elementos[i].id);
        $(el).on('change',function(){

            const el2 = document.getElementById('hidden-'+el.value);
            const el3 = document.getElementsByClassName('section-'+el.name);
            const estado = document.getElementById('estado-'+el.name);

                console.log(estado.value, el2, el3);

                if(estado){
                    if(estado.value == 1){
                        for(ii =0; ii<el3.length;ii++){
                            el3[ii].classList.remove('invisible');
                            el3[ii].classList.add('invisible');
                        }

                        if(el3.length == 1){
                            if(el2){
                                el3[0].classList.remove('invisible');

                            }else{
                                el3[0].classList.add('invisible');

                            }



                        }else if(el3.length == 2){
                            el2.classList.remove('invisible');


                        }

                    }else{
                        console.log(2)
                        for(iii =0; iii<el3.length;iii++){
                            el3[iii].classList.add('invisible');
                            el3[iii].classList.remove('invisible');
                        }

                        if(el3.length == 1){

                            if(el2){
                                el3[0].classList.add('invisible');

                            }else{
                                el3[0].classList.remove('invisible');

                            }

                        }else if(el3.length == 2){
                            el2.classList.add('invisible');
                            console.log(4)
                        }

                    }
                }else{
                    for(iiii =0; iiii<el3.length;iiii++){
                            el3[iiii].classList.add('invisible');
                            el3[iiii].classList.remove('invisible');
                        }


                        if(el3[0].name == undefined){
                            el3[0].classList.add('invisible');
                            console.log(5)
                        }else{
                                console.log(6)
                            if(el3[0].name == 2){
                                el3[0].classList.remove('invisible');
                                console.log(7)
                            }else{
                                el3[0].classList.add('invisible');
                                console.log(8)
                            }
                        }

                }

        })
    }
</script>
<style>
    .invisible{
        display: none;
    }
    .visible{
        display: block;
    }
</style>
@endpush
