@extends('layouts.admin')


@section('content')


    @if ($convocatoria->status === 0)
        @php
             $estado = 'Incompleta'
         @endphp
    @elseif($convocatoria->status === 1)
        @php
            $estado = 'Abierta'
        @endphp
    @endif


@if ($convocatoria->status == 2)
@php
    $bloqueo = true;
    $estado = 'Evaluación'
@endphp
@elseif ($convocatoria->status == 3)
 @php
     $bloqueo = true;
     $estado = 'Selección'
 @endphp
@elseif ($convocatoria->status == 4)
 @php
     $bloqueo = true;
     $estado = 'Finalizada'
 @endphp
@elseif ($convocatoria->status == 5)
 @php
     $bloqueo = true;
     $estado = 'En espera'
 @endphp
@else
 @php
     $bloqueo = false;
 @endphp
@endif
<div class="container-fluid">
    <!-- DataTales Example -->
    <div class="card shadow mb-4">
        <div class="card-header py-3">
            <div class="grid grid-cols-2">
                <div class="col-span-1">
                    <h5 class="mb-2 text-gray-800">Editando Convocatoria</h5>
                    {{$convocatoria->name}}<br>
                    @if(Auth::user()->roles[0]->id == 1 || Auth::user()->roles[0]->id == 4)
                     <a type="button" href="{{ route('criterios.evaluacion', $convocatoria->id) }}" class="text-center mt-2 bg-exito text-white rounded-lg px-2 py-1">Criterios de evaluación</a>
                    @endauth
                </div>
                <div class="col-span-1">
                    @if(Auth::user()->roles[0]->id == 1 || Auth::user()->roles[0]->id == 4)
                    <div class="float-right text-center">
                        <form action="{{ route('cambiar.estado.convocatoria') }}" method="POST">
                            <input type="hidden" name="id" value="{{$convocatoria->id}}"/>
                            @csrf
                            <label class=""><b>Estado actual</b> <p class="px-2 py-1 bg-yellow text-black text-xs rounded-xl text-center">{{ $estado }}</p></label>
                            <select name="status" class="form-control" required>
                                <option value="">--selecciona---</option>
                                <option value="0">Incompleta</option>
                                <option value="1">Abierta</option>
                                <option value="2">Evaluación</option>
                                <option value="3">Selección</option>
                                <option value="4">Finalizada</option>
                                <option value="5">En espera</option>
                            </select>
                            <button type="submit" class="text-center mt-2 bg-exito text-white rounded-lg px-2 py-1">Cambiar</button>
                        </form>
                    </div>
                    @endauth
                </div>
            </div>




        </div>
        {!! Form::open(['method' => 'PATCH','route' => ['announcement.update'],'enctype'=>'multipart/form-data']) !!}

        <input value="{{ $convocatoria->id }}" name="convocatoria" type="hidden"/>
            <div class="card-body">
                <div class="row">
                    <div class="col-xs-12 col-sm-12 col-md-12">
                        <div class="form-group">
                            <small><b>Nombre</b> (*Obligatorio)</small>
                            <input type="text" class="form-control" id="name" name="name" value="{{ $convocatoria->name}}" required {{ $bloqueo == true ? 'readonly' : '' }}/>
                        </div>
                    </div>
                    <div class="col-xs-12 col-sm-12 col-md-12">
                        <div class="form-group">
                            <small><b>Slug</b></small>
                            <input readonly type="text" class="form-control" id="slug" name="slug" required value="{{$convocatoria->slug}}"/>
                        </div>
                        @error('slug')
                            <span>{{$error}}</span>
                        @enderror
                    </div>
                    <div class="col-xs-6 col-sm-6 col-md-6">
                        <div class="form-group">
                            <small><b>Categoria</b> (*Obligatorio)</small>
                            <select type="text" class="form-control" name="category" required {{ $bloqueo == true ? 'disabled' : '' }}>
                                @if ($convocatoria->category)
                                    <option value="{{ $convocatoria->category->id}}">{{ $convocatoria->category->name}}</option>
                                @else
                                    <option value="">--Selecciona--</option>
                                @endif

                                @foreach ($categories as $category)
                                    <option value="{{$category->id}}">{{$category->name}}</option>
                                @endforeach
                            </select>
                        </div>
                    </div>
                    <div class="col-xs-12 col-sm-12 col-md-12">
                        <div class="form-group">
                            <small><b>Presentacion</b> (*presentacion para tarjeta principal)</small>
                            <textarea type="text" class="form-control" name="presentacion" required {{ $bloqueo == true ? 'readonly' : '' }}>{{ $convocatoria->presentacion}}</textarea>
                        </div>
                    </div>
                    <div class="col-xs-12 col-sm-12 col-md-12">
                        <div class="form-group">
                            <small><b>Bienvenida</b> (*texto de bienvenida en detalle de la postulacion)</small>
                            <textarea type="text" class="form-control" name="bienvenida" required {{ $bloqueo == true ? 'readonly' : '' }}>{{ $convocatoria->bienvenida}}</textarea>
                        </div>
                    </div>
                    <div class="col-xs-12 col-sm-12 col-md-12">
                        <div class="form-group">
                            <small><b>Descripción</b> (*Obligatorio)</small>
                            <textarea name="description" id="description" class="form-control" required {{ $bloqueo == true ? 'readonly' : '' }}>{{ $convocatoria->description}}</textarea>
                        </div>
                    </div>
                    <div class="col-xs-12 col-sm-12 col-md-12">
                        <div class="form-group">
                            <small><b>Caracteristicas</b> (*Obligatorio)</small>
                            <textarea name="caracteristicas" id="caracteristicas" class="form-control" required {{ $bloqueo == true ? 'readonly' : '' }}>{{ $convocatoria->caracteristicas}}</textarea>
                        </div>
                    </div>
                    <div class="col-xs-12 col-sm-12 col-md-12">
                        <div class="form-group">
                            <small><b>Premios</b></small>
                            <textarea name="price" class="form-control" {{ $bloqueo == true ? 'readonly' : '' }}>{{ $convocatoria->price}}</textarea>
                        </div>
                    </div>
                    <div class="col-xs-12 col-sm-3 col-md-3">
                        <div class="form-group">
                            <small><b>Correo para postulacion</b> (*Obligatorio)</small>
                            <input type="email" class="form-control" name="correo" name="correo" value="{{ $convocatoria->correo }}" required  {{ $bloqueo == true ? 'readonly' : '' }}/>
                        </div>
                    </div>
                    <div class="col-xs-12 col-sm-3 col-md-3">
                        <div class="form-group">
                            <small><b>Puntaje maximo</b> (*Obligatorio)</small>
                            <input type="number" class="form-control" name="puntaje_maximo" value="{{ $convocatoria->puntaje_maximo}}" {{ $bloqueo == true ? 'readonly' : '' }}/>
                        </div>
                    </div>
                    <div class="col-xs-12 col-sm-3 col-md-3">
                        <div class="form-group">
                            <small><b>Fecha Inicio</b> ({{  \Carbon\Carbon::parse($convocatoria->fecha_inicio)->format('d-m-Y H:i')}})</small>
                            <input type="datetime-local" class="form-control" name="fecha_inicio" value="{{  \Carbon\Carbon::parse($convocatoria->fecha_inicio)->format('d-m-Y H:i')}}" {{ $bloqueo == true ? 'readonly' : '' }}/>
                        </div>
                    </div>
                    <div class="col-xs-12 col-sm-3 col-md-3">
                        <div class="form-group">
                            <small><b>Fecha Termino</b> ({{ \Carbon\Carbon::parse( $convocatoria->fecha_termino)->format('d-m-Y H:i') }})</small>
                            <input type="datetime-local" class="form-control" name="fecha_termino" value="{{ \Carbon\Carbon::parse( $convocatoria->fecha_termino)->format('d-m-Y H:i') }}" {{ $bloqueo == true ? 'readonly' : '' }}/>
                        </div>
                    </div>

                    <div class="col-xs-12 col-sm-6 col-md-6 mb-4">
                        <div class="form-group">
                            <small><b>Imagen Banner</b></small>
                            @if ($convocatoria->banner != '')
                            <div>
                                    <img src="{{asset($convocatoria->banner)}}" />
                                    <a href="{{ route('banner.remove', $convocatoria->id)}}" class="float-left absolute top-7 pl-1">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-x-circle bg-red-600 hover:bg-red-500 text-white rounded-full" viewBox="0 0 16 16">
                                            <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
                                            <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/>
                                          </svg>
                                    </a>
                            </div>
                            @endif
                            <input class="form-control" type="file" name="banner" {{ $bloqueo == true ? 'disabled' : '' }} />
                            @error('image')
                                <small>Verifique el archivo que esta intentando subir</small>
                            @enderror
                        </div>
                    </div>
                    <div class="col-xs-12 col-sm-6 col-md-6">
                        <div class="form-group">
                            <small><b>Imagen principal</b></small>
                            @if ($convocatoria->img != '')
                            <div>
                                <img src="{{asset($convocatoria->img)}}" />
                                <a href="{{ route('imagen.remove', $convocatoria->id)}}" class="float-left absolute top-7 pl-1">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" class="bi bi-x-circle bg-red-600 hover:bg-red-500 text-white rounded-full" viewBox="0 0 16 16">
                                        <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
                                        <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/>
                                      </svg>
                                </a>
                            </div>
                            @endif
                            <input class="form-control" type="file" name="imagen" {{ $bloqueo == true ? 'disabled' : '' }} />
                            @error('image')
                                <small>Verifique el archivo que esta intentando subir</small>
                            @enderror
                        </div>
                    </div>
                    <div class="col-xs-12 col-sm-6 col-md-6">
                        <div class="form-group">

                            @if (count($convocatoria->bases )!= 0)
                                <a href="{{ route('detalle.convocatoria', $convocatoria->id) }}" target="_blank" class="bg-yellow text-black hover:text-white font-bold uppercase text-xs px-4 py-2 rounded shadow hover:shadow-md outline-none focus:outline-none mr-1 ease-linear transition-all duration-150">
                                    Se han cargado {{count($convocatoria->bases )}} de bases
                                </a>
                                <a href="{{ route('bases.remove', $convocatoria->id)}}" class="float-left absolute top-1 pl-1">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" class="bi bi-x-circle bg-red-600 hover:bg-red-500 text-white rounded-full" viewBox="0 0 16 16">
                                        <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
                                        <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/>
                                      </svg>
                                </a>
                            @else
                                <small><b>Bases</b></small>
                            @endif
                                <input class="form-control mt-2" type="file" name="bases[]" multiple {{ $bloqueo == true ? 'disabled' : '' }} >
                            @error('bases')
                                <small>Verifique el archivo que esta intentando subir</small>
                            @enderror
                        </div>
                    </div>
                    <div class="col-xs-12 col-sm-6 col-md-6">
                        <div class="form-group">

                            @if ($convocatoria->video != '')
                                    <small><b>Video subido</b></small>
                                    <a href="{{ route('video.remove', $convocatoria->id)}}" class="float-left absolute top-7 pl-1">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" class="bi bi-x-circle bg-red-600 hover:bg-red-500 text-white rounded-full" viewBox="0 0 16 16">
                                            <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
                                            <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/>
                                          </svg>
                                    </a>
                            @else
                                 <small><b>Video</b></small>
                            @endif

                                <input class="form-control" type="file" name="video" {{ $bloqueo == true ? 'disabled' : '' }} />
                            @error('video')
                                <small>Verifique el archivo que esta intentando subir</small>
                            @enderror
                        </div>
                    </div>

                    <div class="col-xs-12 col-sm-6 col-md-6 mt-3">
                        <div class="form-group">

                            @if (count($convocatoria->sponsors) != 0)
                            <a href="{{ route('detalle.convocatoria', $convocatoria->id) }}" target="_blank" class="bg-yellow text-black hover:text-white font-bold uppercase text-xs px-4 py-2 rounded shadow hover:shadow-md outline-none focus:outline-none mr-1 ease-linear transition-all duration-150">
                                 {{count($convocatoria->sponsors )}} imagenes de patrocinadores
                            </a>
                                    <a href="{{ route('sponsor.remove', $convocatoria->id)}}" class="float-left absolute top-7 pl-1">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" class="bi bi-x-circle bg-red-600 hover:bg-red-500 text-white rounded-full" viewBox="0 0 16 16">
                                            <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
                                            <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/>
                                          </svg>
                                    </a>
                            @else
                                 <small><b>Patrocinadores</b></small>
                            @endif

                                <input class="form-control" type="file" name="patrocinadores[]" multiple {{ $bloqueo == true ? 'disabled' : '' }} />
                            @error('patrocinadores')
                                <small>Verifique el archivo que esta intentando subir</small>
                            @enderror
                        </div>
                    </div>

                </div>
            </div>
            <div class="card-footer">
                <div class="row">
                    <div class="col-lg-12 margin-tb">
                        <div class="">
                            @if(!$bloqueo == true)
                                <a class="px-2 py-2 rounded bg-informativo text-white" href="{{ route('mis.postulaciones') }}"> Cancelar</a>
                            @else
                                <a class="px-2 py-2 rounded bg-informativo text-white" href="{{ route('listado.convocatorias') }}" > Volver</a>
                            @endif


                            @if(!$bloqueo == true)
                                <button type="submit" class="px-2 py-2 rounded bg-informativo text-white float-right">Continuar </button>
                            @endif
                        </div>
                    </div>
                </div>
            </div>
        {!! Form::close() !!}
    </div>

</div>

 <!--Modal Requisitos-->
 <div class="modal fade" id="agregarRequisito" tabindex="-1" aria-labelledby="agregarItem" aria-hidden="true">
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" id="agregarItem">Agregar requisito</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <form action="{{ route('agregar.etapa') }}" method="POST">
            @csrf
            <input type="hidden" name="convocatoria" value="{{ $convocatoria->id }}"/>
            <div class="modal-body">
            <p class="text-bold">Requisito</p>
            <input type="text" class="form-control mb-2" name="name" required/>
            </div>
            <div class="modal-footer">
            <button type="button" class="bg-gray rounded px-2 py-2 text-white float-left" data-bs-dismiss="modal">Cerrar</button>
            <button type="submit" class="bg-exito rounded px-2 py-2 text-white">Guardar cambio</button>
            </div>
        </form>
      </div>
    </div>
  </div>

@endsection
@section('scripts')
    <script src="{{ asset('vendor/jQuery-Plugin-stringToSlug-1.3/jquery.stringToSlug.min.js') }}"></script>

    <script>

            $(document).ready( function() {
                $("#name").stringToSlug({
                    setEvents: 'keyup keydown blur',
                    getPut: '#slug',
                    space: '-'
                });
            });

        ClassicEditor.create( document.querySelector( '#description' ) )
                .then( editor => {
                        console.log( editor );
                } )
                .catch( error => {
                        console.error( error );
                } );

        ClassicEditor.create( document.querySelector( '#caracteristicas' ) )
                .then( editor => {
                        console.log( editor );
                } )
                .catch( error => {
                        console.error( error );
                } );

    </script>
@endsection
