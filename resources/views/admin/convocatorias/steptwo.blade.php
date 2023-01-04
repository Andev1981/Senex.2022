@extends('layouts.admin')


@section('content')

        <div class="container-fluid">
            <!-- DataTales Example -->
            <div class="card shadow mb-4">
                <div class="card-header py-3">
                    <h5 class="mb-2 text-gray-800">Editar formulario de postulacion ultima</h5>
                    {{$convocatoria->name}}
                    <button class="bg-informativo text-white rounded px-2 float-right" type="button" data-bs-toggle="modal" data-bs-target="#agregarItem">Agregar + </button>
                </div>
                    <div class="card-body">
                        <div class="row">
                            @isset($convocatoria->apply_details)

                                    <table class="table table-bordered" width="100%" cellSpacing="0">
                                        <thead>
                                            <tr>
                                                <th colspan="2">Pregunta / Item / Sección</th>
                                                <th colspan="2">Tipo</th>
                                                <th class="text-center">Detalles / Opciones</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            @foreach ($convocatoria->apply_details as $apply_detail)
                                                <tr>

                                                    <td width='10'>
                                                        <a type="button" class="bg-error rounded-full px-2 py-0 text-white" href="{{ route('borrar.pregunta', $apply_detail->id) }}">x</a>
                                                    </td>
                                                    <td>
                                                       @if ($apply_detail->type == 8)
                                                            <b>{{$apply_detail->question}}</b>
                                                       @else
                                                            {{$apply_detail->question}}
                                                       @endif</td>
                                                    <td>

                                                        @if ($apply_detail->type == 0)
                                                            <span class="inline-block px-2 mr-2 bg-exito text-sm text-white rounded-full">texto&nbsp;simple</span>
                                                        @elseif ($apply_detail->type == 1)
                                                            <span class="inline-block px-2 mr-2 bg-segundo text-sm text-black rounded-full">texto&nbsp;largo</span>
                                                        @elseif ($apply_detail->type == 2)
                                                            <span class="inline-block px-2 mr-2 bg-cuarto text-sm text-white rounded-full">campo&nbsp;numérico</span>
                                                        @elseif ($apply_detail->type == 3)
                                                            <span class="inline-block px-2 mr-2 bg-informativo text-white text-sm rounded-full">campo&nbsp;de&nbsp;selección</span>
                                                        @elseif ($apply_detail->type == 4)
                                                            <span class="inline-block px-2 mr-2 bg-informativo text-white text-sm rounded-full">campo&nbsp;de&nbsp;selección&nbsp;multiple</span>
                                                        @elseif ($apply_detail->type == 5)
                                                            <span class="inline-block px-2 mr-2 bg-informativo text-white text-sm rounded-full">subir&nbsp;archivo</span>
                                                        @elseif ($apply_detail->type == 7)
                                                            <span class="inline-block px-2 mr-2 bg-informativo text-white text-sm rounded-full">campo&nbsp;de&nbsp;selección&nbsp;+&nbsp;texto&nbsp;simple</span>
                                                        @elseif ($apply_detail->type == 8)
                                                            <span class="inline-block px-2 mr-2 bg-informativo text-white text-sm rounded-full">sección</span>
                                                        @endif

                                                    </td>
                                                    <td width='10'>
                                                        @if ($apply_detail->type ==  3 || $apply_detail->type ==  4 || $apply_detail->type ==  7)
                                                            <button type="button" class="bg-exito text-white rounded-full px-2" data-bs-toggle="modal" data-bs-target="#agregarDetalle-{{$apply_detail->id}}">+</button>
                                                        @endif
                                                    </td>
                                                    <td class="text-center">
                                                        @if ($apply_detail->type ==  3 || $apply_detail->type ==  4 || $apply_detail->type ==  7)
                                                            @foreach ($apply_detail->apply_detail_options as $option)

                                                                <ul class="mb-2"><span>{{$option->name}} </span><a type="button" class="bg-error rounded-full px-2 text-white float-right" href="{{ route('borrar.option', $option->id) }}">x</a></ul>

                                                            @endforeach
                                                        @endif
                                                    </td>
                                                </tr>
                                                <hr class="w-full text-gray line"/>
                                            @endforeach
                                        </tbody>
                                    </table>

                            @else
                                <div class="col-xs-12 col-sm-12 col-md-12 text-center">
                                    <b>No se han ingresado items</b>
                                </div>
                            @endisset
                        </div>
                    </div>
                    <div class="card-footer">
                        <div class="row">
                            <div class="col-lg-12 margin-tb">
                                <div class="">
                                    <a class="px-2 py-2 rounded bg-informativo text-white" href="{{ route('users.index') }}"> Cancelar</a>
                                    @isset($convocatoria->apply_details)
                                        <a type="button" href="{{ route('continuar.etapas',$convocatoria) }}" class="px-2 py-2 rounded bg-informativo text-white float-right">Continuar </a>
                                      @else
                                        <button class="px-2 rounded bg-gris text-white float-right" readonly disabled>Continuar </button>
                                    @endisset
                                </div>
                            </div>
                        </div>
                    </div>
            </div>

        </div>

        <!--Modal Preguntas-->
        <div class="modal fade" id="agregarItem" tabindex="-1" aria-labelledby="agregarItem" aria-hidden="true">
            <div class="modal-dialog">
              <div class="modal-content">
                <div class="modal-header">
                  <h5 class="modal-title" id="agregarItem">Agregar Pregunta - Item</h5>
                  <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <form action="{{ route('agregar.detalle') }}" method="POST">
                    @csrf
                    <input type="hidden" name="convocatoria" value="{{ $convocatoria->id }}"/>
                    <div class="modal-body">
                    <p>Ingrese una pregunta o item</p>
                    <input class="form-control" name="pregunta" required/>
                    <hr/>
                    <p class="mt-2">Tipo</p>
                    <select class="form-control" name="type" required>
                        <option value="">----</option>
                        <option value="0">Texto simple</option>
                        <option value="1">Texto largo</option>
                        <option value="2">Campo numérico</option>
                        <option value="3">Campo de selección</option>
                        <option value="4">Campo de selección multiple</option>
                        <option value="5">Subir archivo</option>
                        <option value="7">Campo de selección + texto simple</option>
                        <option value="8">Título de sección</option>
                    </select>

                    <hr/>
                    <p class="mt-2">Tipo de indice</p>
                    <select class="form-control" name="general" required>
                        <option value="1">Indice preguntas</option>
                        <option value="0">Indice datos generales</option>
                    </select>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="bg-gray rounded px-2 py-2 text-white float-left" data-bs-dismiss="modal">Cerrar</button>
                        <button type="submit" class="bg-exito rounded px-2 py-2 text-white">Guardar cambio</button>
                    </div>
                </form>
              </div>
            </div>
          </div>

        <!--Modal Opciones de Preguntas-->
        @foreach ($convocatoria->apply_details as $apply_detail)
         @if ($apply_detail->type ==  3 || $apply_detail->type ==  4 || $apply_detail->type ==  7)
            <div class="modal fade" id="agregarDetalle-{{$apply_detail->id}}" tabindex="-1" aria-labelledby="agregarDetalle-{{$apply_detail->id}}" aria-hidden="true">
                <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                    <h5 class="modal-title" id="agregarDetalle">Agregar Detalles - Opciones</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <form action="{{ route('agregar.opcion') }}" method="POST">
                        @csrf
                        <input type="hidden" name="apply" value="{{ $apply_detail->id }}"/>
                        <input type="hidden" name="convocatoria" value="{{ $convocatoria->id }}"/>
                        <div class="modal-body">
                        <p>Ingrese Opcion</p>
                            <input type="text" class="form-control" name="opcion" required/>
                        <hr/>
                        @if ($apply_detail->type == 7)
                            <p class="mt-2">Tipo</p>
                            <select class="form-control" name="type" required>
                                <option value="">----</option>
                                <option value="0">Opcion</option>
                                <option value="1">Texto</option>
                            </select>
                         @endif
                        </div>


                        <div class="modal-footer">
                        <button type="button" class="bg-gray rounded px-2 py-2 text-white float-left" data-bs-dismiss="modal">Cerrar</button>
                        <button type="submit" class="bg-exito rounded px-2 py-2 text-white">Guardar cambio</button>
                        </div>
                    </form>
                </div>
                </div>
            </div>
         @endif
        @endforeach


@endsection
