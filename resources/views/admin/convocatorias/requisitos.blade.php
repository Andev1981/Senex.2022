@extends('layouts.admin')


@section('content')

        <div class="container-fluid">
            <!-- DataTales Example -->
            <div class="card shadow mb-4">
                <div class="card-header py-3">
                    <h5 class="mb-2 text-gray-800">Requisitos de la convocatoria</h5>
                    {{$convocatoria->name}}
                    <button class="bg-informativo text-white rounded px-2 float-right" type="button" data-bs-toggle="modal" data-bs-target="#agregarItem">Agregar + </button>
                </div>
                    <div class="card-body">
                        <div class="row">
                            @if(count($requisitos) != 0)
                                    <table class="table table-bordered" width="100%" cellSpacing="0">
                                        <thead>
                                            <tr>
                                                <th width=10></th>
                                                <th>Nombre</th>
                                                <th>Descripcion</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            @foreach ($requisitos as $requisito)
                                                <tr>
                                                    <td>
                                                        <a type="button" class="bg-error rounded-full px-1 py-1 text-white" href="{{ route('delete.requisito', $requisito->id) }}">
                                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-trash" viewBox="0 0 16 16">
                                                            <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"/>
                                                            <path fill-rule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"/>
                                                          </svg>
                                                        </a>
                                                        <button class="bg-yellow rounded-full px-1 py-1 text-white" type="button" data-bs-toggle="modal" data-bs-target="#editarItem-{{$requisito->id}}">
                                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-pencil-square text-gray" viewBox="0 0 16 16">
                                                                <path d="M15.502 1.94a.5.5 0 0 1 0 .706L14.459 3.69l-2-2L13.502.646a.5.5 0 0 1 .707 0l1.293 1.293zm-1.75 2.456-2-2L4.939 9.21a.5.5 0 0 0-.121.196l-.805 2.414a.25.25 0 0 0 .316.316l2.414-.805a.5.5 0 0 0 .196-.12l6.813-6.814z"/>
                                                                <path fill-rule="evenodd" d="M1 13.5A1.5 1.5 0 0 0 2.5 15h11a1.5 1.5 0 0 0 1.5-1.5v-6a.5.5 0 0 0-1 0v6a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5H9a.5.5 0 0 0 0-1H2.5A1.5 1.5 0 0 0 1 2.5v11z"/>
                                                              </svg>
                                                        </button>
                                                    </td>
                                                    <td class="text-sm">
                                                        {{ $requisito->name}}
                                                    </td>
                                                    <td class="text-sm">
                                                        {{ $requisito->description}}
                                                    </td>
                                                </tr>
                                                <hr class="w-full text-gray line"/>
                                            @endforeach
                                        </tbody>
                                    </table>

                            @else
                                <div class="col-xs-12 col-sm-12 col-md-12 text-center">
                                    <b>No se han ingresado requisitos</b>
                                </div>
                            @endif
                        </div>
                    </div>
                    <div class="card-footer">
                        <div class="row">
                            <div class="col-lg-12 margin-tb">
                                <div class="">
                                    <a class="px-2 py-2 rounded bg-informativo text-white" href="{{ route('users.index') }}"> Cancelar</a>
                                    @if(count($requisitos) != 0)
                                        <a type="button" class="px-2 py-2 rounded bg-informativo text-white float-right" href="{{route('continuar.preguntas', $convocatoria->id)}}">Continuar </a>
                                      @else
                                        <button class="px-2 rounded bg-gris text-white float-right" readonly disabled>Continuar </button>
                                    @endif
                                </div>
                            </div>
                        </div>
                    </div>
            </div>

        </div>


            <!--Modal Crear Requisitos-->
            <div class="modal fade" id="agregarItem" tabindex="-1" aria-labelledby="agregarItem" aria-hidden="true">
                <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                    <h5 class="modal-title" id="agregarItem">Agregar requisito</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <form action="{{ route('agregar.requisito') }}" method="POST">
                        @csrf
                        <input type="hidden" name="convocatoria_id" value="{{ $convocatoria->id }}"/>
                        <div class="modal-body">
                        <p class="text-bold">Nombre o titulo del requisito</p>
                        <input type="text" class="form-control mb-2" name="name" required/>
                        <p>Descripcion</p>
                        <input type="text" class="form-control mb-2" name="description" required/>

                        </div>
                        <div class="modal-footer">
                        <button type="button" class="bg-gray rounded px-2 py-2 text-white float-left" data-bs-dismiss="modal">Cerrar</button>
                        <button type="submit" class="bg-exito rounded px-2 py-2 text-white">Guardar cambio</button>
                        </div>
                    </form>
                </div>
                </div>
            </div>
          @foreach ($requisitos as $requisito)
            <!--Modal Crear Requisitos-->
                <div class="modal fade" id="editarItem-{{$requisito->id}}" tabindex="-1" aria-labelledby="editarItem" aria-hidden="true">
                    <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                        <h5 class="modal-title" id="agregarItem">Agregar requisito</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <form action="{{ route('update.requisito') }}" method="POST">
                            @csrf
                            <input type="hidden" name="convocatoria_id" value="{{ $convocatoria->id }}"/>
                            <input type="hidden" name="requisito_id" value="{{ $requisito->id }}"/>
                            <div class="modal-body">
                            <p class="text-bold">Nombre o titulo del requisito</p>
                            <input type="text" class="form-control mb-2" name="name" value="{{$requisito->name}}" required/>
                            <p>Descripcion</p>
                            <input type="text" class="form-control mb-2" name="description" value="{{$requisito->description}}" required/>

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
