@extends('layouts.admin')


@section('content')

        <div class="container-fluid">
            <!-- DataTales Example -->
            <div class="card shadow mb-4">
                <div class="card-header py-3">
                    <h5 class="mb-2 text-gray-800">Etapas de la convocatoria</h5>
                    {{$convocatoria->name}}
                    <button class="bg-informativo text-white rounded px-2 float-right" type="button" data-bs-toggle="modal" data-bs-target="#agregarItem">Agregar + </button>
                </div>
                    <div class="card-body">
                        <div class="row">
                            @if(count($etapas) != 0)
                                    <table class="table table-bordered" width="100%" cellSpacing="0">
                                        <thead>
                                            <tr>
                                                <th colspan="2">Nombre</th>
                                                <th>Descripcion</th>
                                                <th>Fecha&nbsp;y&nbsp;hora&nbsp;de&nbsp;Inicio</th>
                                                <th>Fecha&nbsp;y&nbsp;hora&nbsp;de&nbsp;Termino</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            @foreach ($etapas as $etapa)
                                                <tr>
                                                    <td>
                                                        <a type="button" class="bg-error rounded-full px-1 py-1 text-white" href="{{ route('borrar.etapa', $etapa->id) }}">
                                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-trash" viewBox="0 0 16 16">
                                                            <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"/>
                                                            <path fill-rule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"/>
                                                          </svg>
                                                        </a>
                                                        <button class="bg-yellow rounded-full px-1 py-1 text-white" type="button" data-bs-toggle="modal" data-bs-target="#editarEtapa-{{$etapa->id}}">
                                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-pencil-square text-gray" viewBox="0 0 16 16">
                                                                <path d="M15.502 1.94a.5.5 0 0 1 0 .706L14.459 3.69l-2-2L13.502.646a.5.5 0 0 1 .707 0l1.293 1.293zm-1.75 2.456-2-2L4.939 9.21a.5.5 0 0 0-.121.196l-.805 2.414a.25.25 0 0 0 .316.316l2.414-.805a.5.5 0 0 0 .196-.12l6.813-6.814z"/>
                                                                <path fill-rule="evenodd" d="M1 13.5A1.5 1.5 0 0 0 2.5 15h11a1.5 1.5 0 0 0 1.5-1.5v-6a.5.5 0 0 0-1 0v6a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5H9a.5.5 0 0 0 0-1H2.5A1.5 1.5 0 0 0 1 2.5v11z"/>
                                                              </svg>
                                                        </button>
                                                    </td>
                                                    <td class="text-sm">
                                                        {{ $etapa->name}}
                                                    </td>
                                                    <td class="text-sm">
                                                        {{ $etapa->detail}}
                                                    </td>
                                                    <td class="text-sm">
                                                        @if ($etapa->fecha_inicio !== null)
                                                        {{ \Carbon\Carbon::parse($etapa->fecha_inicio)->format('d-m-Y H:i')}}
                                                       @endif
                                                    </td>
                                                    <td class="text-sm">
                                                       @if ($etapa->fecha_termino !== null)
                                                        {{ \Carbon\Carbon::parse($etapa->fecha_termino)->format('d-m-Y H:i')}}
                                                       @endif
                                                    </td>
                                                    <td>
                                                       @if ($etapa->state == 0)
                                                        <span class="inline-block px-2 mr-2 bg-gray text-sm text-white rounded-full">realizada</span>
                                                       @elseif ($etapa->state == 1)
                                                        <span class="inline-block px-2 mr-2 bg-exito text-sm text-white rounded-full">activa</span>
                                                       @elseif($etapa->state == 2)
                                                       <span class="inline-block px-2 mr-2 bg-error text-sm text-white rounded-full">futura</span>
                                                       @endif
                                                    </td>
                                                </tr>
                                                <hr class="w-full text-gray line"/>
                                            @endforeach
                                        </tbody>
                                    </table>

                            @else
                                <div class="col-xs-12 col-sm-12 col-md-12 text-center">
                                    <b>No se han ingresado etapas</b>
                                </div>
                            @endif
                        </div>
                    </div>
                    <div class="card-footer">
                        <div class="row">
                            <div class="col-lg-12 margin-tb">
                                <div class="">
                                    <a class="px-2 py-2 rounded bg-informativo text-white" href="{{ route('users.index') }}"> Cancelar</a>
                                    @if(count($etapas) != 0)
                                        <button type="submit" class="px-2 py-2 rounded bg-informativo text-white float-right" data-bs-toggle="modal" data-bs-target="#publicar">Continuar </button>
                                      @else
                                        <button class="px-2 rounded bg-gris text-white float-right" readonly disabled>Continuar </button>
                                    @endif
                                </div>
                            </div>
                        </div>
                    </div>
            </div>

        </div>

         <!--Modal Preguntas-->
         <div class="modal fade" id="publicar" tabindex="-1" aria-labelledby="publicar" aria-hidden="true">
            <div class="modal-dialog">
              <div class="modal-content">
                <div class="modal-header">
                  <h5 class="modal-title" id="publicar">Publicar</h5>
                  <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>

                    <div class="modal-body text-center">
                        <a type="button" href="{{ route('publicar',[0,$convocatoria]) }}" class="bg-informativo rounded px-2 py-2 text-white mr-3">Guardar</a>
                        <a type="button" href="{{ route('publicar',[1,$convocatoria]) }}" class="bg-exito rounded px-2 py-2 text-white ml-3">Guardar y publicar</a>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="bg-gray rounded px-2 py-2 text-white float-left" data-bs-dismiss="modal">Cerrar</button>
                    </div>
              </div>
            </div>
          </div>

        <!--Modal Preguntas-->
        <div class="modal fade" id="agregarItem" tabindex="-1" aria-labelledby="agregarItem" aria-hidden="true">
            <div class="modal-dialog">
              <div class="modal-content">
                <div class="modal-header">
                  <h5 class="modal-title" id="agregarItem">Agregar etapa</h5>
                  <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <form action="{{ route('agregar.etapa') }}" method="POST">
                    @csrf
                    <input type="hidden" name="convocatoria" value="{{ $convocatoria->id }}"/>
                    <div class="modal-body">
                    <p class="text-bold">Nombre de la etapa</p>
                    <input type="text" class="form-control mb-2" name="name" required/>
                    <p>Detalle</p>
                    <input type="text" class="form-control mb-2" name="detail" required/>
                    <p>Fecha inicio</p>
                    <input type="datetime-local" class="form-control mb-2" name="fecha_inicio"/>
                    <p>Fecha término</p>
                    <input type="datetime-local" class="form-control" name="fecha_termino"/>

                    <p class="pt-2">Estado</p>
                    <select class="form-control" name="estado" required >
                            <option class="bg-gray text-sm text-white" value="0">realizada</option>
                            <option class="bg-exito text-sm text-white" value="1">activa</option>
                            <option class="bg-error text-sm text-white" value="2">futura</option>
                    </select>

                    <p class="mt-2">Sin fechas</p>
                    <input type="checkbox" name="sinFechas"/>

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
        @foreach ($etapas as $etapa)
            <div class="modal fade" id="editarEtapa-{{$etapa->id}}" tabindex="-1" aria-labelledby="editarEtapa-{{$etapa->id}}" aria-hidden="true">
                <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                    <h5 class="modal-title" id="agregarDetalle">Editar etapa</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <form action="{{ route('update.etapa') }}" method="POST">
                        @csrf
                        <input type="hidden" name="convocatoria" value="{{ $convocatoria->id }}"/>
                        <input type="hidden" name="etapa" value="{{ $etapa->id }}"/>
                        <div class="modal-body">
                        <p class="text-bold">Nombre de la etapa</p>
                        <input type="text" class="form-control mb-2" name="name" required value="{{$etapa->name}}"/>
                        <p>Detalle</p>
                        <input type="text" class="form-control mb-2" name="detail" required value="{{$etapa->detail}}"/>
                        <p>Fecha inicio <span class="text-xs"> @if ($etapa->fecha_inicio != null)
                            ({{ \Carbon\Carbon::parse( $etapa->fecha_inicio)->format('d-m-Y H:i') }})
                        @endif</span></p>
                        <input type="datetime-local" class="form-control mb-2" name="fecha_inicio" value="{{$etapa->fecha_inicio}}"/>
                        <input type="hidden" class="form-control mb-2" name="fecha_inicio_hidden" value="{{$etapa->fecha_inicio}}"/>

                        <p>Fecha término <span class="text-xs"> @if ($etapa->fecha_termino != null)
                            ({{ \Carbon\Carbon::parse( $etapa->fecha_termino)->format('d-m-Y H:i') }})
                        @endif</span></p>
                        <input  value="{{$etapa->fecha_termino}}" type="datetime-local" class="form-control" name="fecha_termino"/>
                        <input type="hidden" class="form-control mb-2" name="fecha_termino_hidden" value="{{$etapa->fecha_termino}}"/>
                        <p class="pt-2">Estado</p>
                        <select class="form-control" name="estado" required >
                            @if ($etapa->state == 0)
                                <option class="bg-gray text-sm text-white" value="0">realizada</option>
                                <option class="bg-exito text-sm text-white" value="1">activa</option>
                                <option class="bg-error text-sm text-white" value="2">futura</option>
                            @elseif ($etapa->state == 1)
                            <option class="bg-exito text-sm text-white" value="1">activa</option>
                            <option class="bg-gray text-sm text-white" value="0">realizada</option>
                            <option class="bg-error text-sm text-white" value="2">futura</option>
                            @elseif($etapa->state == 2)
                            <option class="bg-error text-sm text-white" value="2">futura</option>
                            <option class="bg-gray text-sm text-white" value="0">realizada</option>
                            <option class="bg-exito text-sm text-white" value="1">activa</option>
                            @endif
                        </select>

                        <p class="mt-2">Sin fechas</p>
                        @if ($etapa->fecha_inicio == null)
                                <input type="checkbox" checked name="sinFechas"/>
                            @else
                                <input type="checkbox" name="sinFechas"/>
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
        @endforeach


@endsection
