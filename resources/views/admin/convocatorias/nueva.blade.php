@extends('layouts.admin')


@section('content')
<div class="container-fluid">
    <!-- DataTales Example -->
    <div class="card shadow mb-4">
        <div class="card-header py-3">
            <h5 class="mb-2 text-gray-800">Nueva Convocatoria</h5>
        </div>
        {!! Form::open(['method' => 'POST','route' => ['announcement.store'],'enctype'=>'multipart/form-data','autocomplete' => 'off']) !!}
            <div class="card-body">
                <div class="row">
                    <div class="col-xs-12 col-sm-12 col-md-12">
                        <div class="form-group">
                            <small><b>Nombre</b> (*Obligatorio)</small>
                            <input type="text" class="form-control" id="name" name="name" required/>
                        </div>
                    </div>
                    <div class="col-xs-12 col-sm-12 col-md-12">
                        <div class="form-group">
                            <small><b>Slug</b></small>
                            <input readonly type="text" class="form-control" id="slug" name="slug" required/>
                        </div>
                        @error('slug')
                            <span>{{$error}}</span>
                        @enderror
                    </div>

                    <div class="col-xs-6 col-sm-6 col-md-6">
                        <div class="form-group">
                            <small><b>Categoria</b> (*Obligatorio)</small>
                            <select type="text" class="form-control" name="category" required>
                                    <option value="">--Selecciona--</option>
                                @foreach ($categories as $category)
                                    <option value="{{$category->id}}">{{$category->name}}</option>
                                @endforeach
                            </select>
                        </div>
                    </div>
                    <div class="col-xs-12 col-sm-12 col-md-12">
                        <div class="form-group">
                            <small><b>Presentacion</b> (*presentacion para tarjeta principal)</small>
                            <input type="text" class="form-control" name="presentacion" required />
                        </div>
                    </div>
                    <div class="col-xs-12 col-sm-12 col-md-12">
                        <div class="form-group">
                            <small><b>Bienvenida</b> (*texto de bienvenida en detalle de la postulacion)</small>
                            <input type="text" class="form-control" name="bienvenida" required />
                        </div>
                    </div>
                    <div class="col-xs-12 col-sm-12 col-md-12">
                        <div class="form-group">
                            <small><b>Descripción</b> (*Obligatorio)</small>
                            <textarea name="description" id="description" class="form-control"></textarea>
                        </div>
                    </div>
                    <div class="col-xs-12 col-sm-12 col-md-12">
                        <div class="form-group">
                            <small><b>Caracteristicas</b> (*Obligatorio)</small>
                            <textarea name="caracteristicas" id="caracteristicas" class="form-control"></textarea>
                        </div>
                    </div>
                    <div class="col-xs-12 col-sm-12 col-md-12">
                        <div class="form-group">
                            <small><b>Premios</b></small>
                            <textarea name="price" class="form-control"></textarea>
                        </div>
                    </div>
                    <div class="col-xs-12 col-sm-3 col-md-3">
                        <div class="form-group">
                            <small><b>Correo para postulacion</b> (*Obligatorio)</small>
                            <input type="email" class="form-control" name="correo" required/>
                        </div>
                    </div>
                    <div class="col-xs-12 col-sm-3 col-md-3">
                        <div class="form-group">
                            <small><b>Puntaje maximo</b> (*Obligatorio)</small>
                            <input type="number" class="form-control" name="puntaje_maximo" required/>
                        </div>
                    </div>
                    <div class="col-xs-12 col-sm-3 col-md-3">
                        <div class="form-group">
                            <small><b>Fecha Inicio</b> (*Obligatorio)</small>
                            <input type="date" class="form-control" name="fecha_inicio" required/>
                        </div>
                    </div>
                    <div class="col-xs-12 col-sm-3 col-md-3">
                        <div class="form-group">
                            <small><b>Fecha Termino</b> (*Obligatorio)</small>
                            <input type="date" class="form-control" name="fecha_termino" required/>
                        </div>
                    </div>
                    <div class="col-xs-12 col-sm-6 col-md-6">
                        <div class="form-group">
                            <small><b>Banner</b></small>
                            <input class="form-control" type="file" name="banner">
                        </div>
                    </div>

                    <div class="col-xs-12 col-sm-6 col-md-6">
                        <div class="form-group">
                            <small><b>Imagen principal</b></small>
                            <input class="form-control" type="file" name="imagen">
                        </div>
                    </div>

                    <div class="col-xs-12 col-sm-6 col-md-6">
                        <div class="form-group">
                            <small><b>Video</b></small>
                            <input class="form-control" type="file" name="video">
                        </div>
                    </div>

                    <div class="col-xs-12 col-sm-6 col-md-6">
                        <div class="form-group">
                            <small><b>Bases</b></small>
                            <input class="form-control" type="file" name="bases[]" multiple>
                        </div>
                    </div>

                    <div class="col-xs-12 col-sm-6 col-md-6">
                        <div class="form-group">
                            <small><b>Patrocinadores</b></small>
                            <input class="form-control" type="file" name="patrocinadores[]" multiple>
                        </div>
                    </div>


                </div>
            </div>
            <div class="card-footer">
                <div class="row">
                    <div class="col-lg-12 margin-tb flex">
                        <div class="">
                            <a class="btn btn-primary" href="{{ route('users.index') }}"> Cancelar</a>
                            <button type="submit" class="btn btn-primary float-end bg-exito">Continuar </button>
                        </div>
                    </div>
                </div>
            </div>
        {!! Form::close() !!}
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
