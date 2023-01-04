@extends('layouts.admin')


@section('content')

        <div class="container">
            <!-- DataTales Example -->
            <div class="card shadow mb-4">
                <div class="card-header py-3">
                    <h5 class="mb-2 text-gray-800">Editar formulario de postulacion</h5>
                    {{$convocatoria->name}}
                </div>
                    <div class="card-body">
                            @isset($convocatoria->apply_details)

                                    <table class="table table-bordered" width="100%" cellSpacing="0">
                                        <thead>
                                            <tr>
                                                <th colspan="2">Pregunta / Item / Sección
                                                    <button class="bg-informativo text-white rounded px-2 float-right" type="button" data-bs-toggle="modal" data-bs-target="#agregarItem">Agregar&nbsp;+</button>
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            @foreach ($convocatoria->apply_details as $apply_detail)
                                                <tr>

                                                    <td width='10'>
                                                        <a type="button" class="bg-error rounded-full px-1 py-1 text-white" href="{{ route('borrar.pregunta', $apply_detail->id) }}"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-trash" viewBox="0 0 16 16">
                                                            <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"/>
                                                            <path fill-rule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"/>
                                                          </svg>
                                                        </a>
                                                          <button type="button" class="bg-yellow rounded-full px-1 py-1 text-white" data-bs-toggle="modal" data-bs-target="#editarItem-{{$apply_detail->id}}">
                                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-pencil-square text-gray" viewBox="0 0 16 16">
                                                                <path d="M15.502 1.94a.5.5 0 0 1 0 .706L14.459 3.69l-2-2L13.502.646a.5.5 0 0 1 .707 0l1.293 1.293zm-1.75 2.456-2-2L4.939 9.21a.5.5 0 0 0-.121.196l-.805 2.414a.25.25 0 0 0 .316.316l2.414-.805a.5.5 0 0 0 .196-.12l6.813-6.814z"/>
                                                                <path fill-rule="evenodd" d="M1 13.5A1.5 1.5 0 0 0 2.5 15h11a1.5 1.5 0 0 0 1.5-1.5v-6a.5.5 0 0 0-1 0v6a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5H9a.5.5 0 0 0 0-1H2.5A1.5 1.5 0 0 0 1 2.5v11z"/>
                                                              </svg>
                                                          </button>

                                                        {{-- Modal editar item --}}
                                                            <div class="modal fade" id="editarItem-{{$apply_detail->id}}" tabindex="-1" aria-labelledby="agregarDetalle-{{$apply_detail->id}}" aria-hidden="true">
                                                                <div class="modal-dialog">
                                                                <div class="modal-content">
                                                                    <div class="modal-header">
                                                                    <h5 class="modal-title" id="agregarDetalle">Editar</h5>
                                                                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                                                                    </div>
                                                                    <form action="{{ route('update.pregunta') }}" method="POST">
                                                                        @csrf
                                                                        <input type="hidden" name="apply" value="{{ $apply_detail->id }}"/>
                                                                        <input type="hidden" name="convocatoria" value="{{ $convocatoria->id }}"/>
                                                                        <div class="modal-body">
                                                                        <p class="text-xs text-gray text-bold mb-1">Ingrese Pregunta</p>
                                                                            <input type="text" class="form-control text-xs" name="pregunta" required value="{{$apply_detail->question}}"/>
                                                                        <hr/>

                                                                            <p class="text-xs text-gray text-bold mb-1 mt-2">Ingrese placeholder del campo (Texto visible dentro del campo, sirev como referencia)</p>
                                                                            <input class="form-control" name="placeholder" value="{{$apply_detail->placeholder}}"/>
                                                                            <hr/>

                                                                            <p  class="text-xs text-gray text-bold mb-1 mt-2">Tipo</p>
                                                                            <select class="form-control" name="type" required>
                                                                            @if ($apply_detail->type == 8)
                                                                                <option value="{{$apply_detail->type}}"  class="text-gris text-xs">*sección</option>
                                                                            @elseif ($apply_detail->type == 9)
                                                                                <option value="{{$apply_detail->type}}"  class="text-gris text-xs">*item de seccion</option>
                                                                            @else
                                                                                @if ($apply_detail->type == 0)
                                                                                    <option value="{{$apply_detail->type}}" class="text-gris text-xs">*texto&nbsp;simple</option>
                                                                                @elseif ($apply_detail->type == 1)
                                                                                    <option value="{{$apply_detail->type}}" class="text-gris text-xs">*texto&nbsp;largo</option>
                                                                                @elseif ($apply_detail->type == 2)
                                                                                    <option value="{{$apply_detail->type}}" class="text-gris text-xs">*campo&nbsp;numérico</option>
                                                                                @elseif ($apply_detail->type == 3)
                                                                                    <option value="{{$apply_detail->type}}" class="text-gris text-xs">*campo&nbsp;de&nbsp;selección</option>
                                                                                {{-- @elseif ($apply_detail->type == 4)
                                                                                    <option value="{{$apply_detail->type}}" class="text-gris text-xs">*campo&nbsp;de&nbsp;selección&nbsp;multiple</option> --}}
                                                                                @elseif ($apply_detail->type == 5)
                                                                                    <option value="{{$apply_detail->type}}" class="text-gris text-xs">*subir&nbsp;archivo</option>
                                                                                @elseif ($apply_detail->type ==6)
                                                                                    <option value="{{$apply_detail->type}}" class="text-gris text-xs">*campo&nbsp;rut-chileno</option>
                                                                               {{--  @elseif ($apply_detail->type == 7)
                                                                                    <option value="{{$apply_detail->type}}" class="text-gris text-xs">*campo&nbsp;de&nbsp;selección&nbsp;+&nbsp;texto&nbsp;simple</option> --}}
                                                                                @elseif ($apply_detail->type == 10)
                                                                                    <option value="{{$apply_detail->type}}" class="text-gris text-xs">*campo&nbsp;telefono</option>
                                                                                 @endif
                                                                            @endif
                                                                                <option value="0">Texto simple</option>
                                                                                <option value="1">Texto largo</option>
                                                                                <option value="2">Campo numérico</option>
                                                                                <option value="3">Campo de selección</option>
                                                                                <option value="4">Campo de selección multiple</option>
                                                                                <option value="5">Subir archivo</option>
                                                                                <option value="6">Rut</option>
                                                                                <option value="7">Campo de selección + campo relacionado</option>
                                                                                <option value="8">Título de sección</option>
                                                                                <option value="9">Título item de sección</option>
                                                                                <option value="10">Campos de selección + relacionados</option>
                                                                            </select>
                                                                            <p class="mt-2">Campo obligatorio</p>
                                                                            @if ($apply_detail->obligatorio ==1)
                                                                                    <input type="checkbox" checked name="obligatorio"/>
                                                                                    @else
                                                                                    <input type="checkbox" name="obligatorio"/>
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
                                                        {{-- Fin Modal editar item --}}
                                                    </td>
                                                    <td>
                                                            @if ($apply_detail->type == 8)
                                                                <b>{{$apply_detail->question}}</b><br/>
                                                                <div class="inline-block"><span class="text-bold text-gray text-sm"></span><span class="text-white rounded-full px-1 text-xs bg-slate-600">sección</span>
                                                            @elseif ($apply_detail->type == 9)
                                                                <b>{{$apply_detail->question}}</b><br/>
                                                                <div class="inline-block"><span class="text-bold text-gray text-sm"></span><span class="text-white rounded-full px-1 text-xs bg-slate-600">item de seccion</span>
                                                            @else
                                                                {{$apply_detail->question}}<br/>
                                                                @if ($apply_detail->type == 0)
                                                                <div class="inline-block"><span class="text-bold text-gray text-sm"></span><span class="text-white rounded-full px-1 text-xs bg-orange-400">texto&nbsp;simple</span></div>
                                                                @elseif ($apply_detail->type == 1)
                                                                <div class="inline-block"><span class="text-bold text-gray text-sm"></span><span class="text-white rounded-full px-1 text-xs bg-orange-400">texto&nbsp;largo</span></div>
                                                                @elseif ($apply_detail->type == 2)
                                                                <div class="inline-block"><span class="text-bold text-gray text-sm"></span><span class="text-white rounded-full px-1 text-xs bg-orange-400">campo&nbsp;numérico</span></div>
                                                                @elseif ($apply_detail->type == 3)
                                                                <div class="inline-block"><span class="text-bold text-gray text-sm"</span><span class="text-white rounded-full px-1 text-xs bg-orange-400"> campo&nbsp;de&nbsp;selección</span></div>
                                                                {{-- @elseif ($apply_detail->type == 4)
                                                                <div class="inline-block"><span class="text-bold text-gray text-sm"></span><span class="text-white rounded-full px-1 text-xs bg-orange-400">campo&nbsp;de&nbsp;selección&nbsp;multiple</span></div> --}}
                                                                @elseif ($apply_detail->type == 5)
                                                                <div class="inline-block"><span class="text-bold text-gray text-sm"></span><span class="text-white rounded-full px-1 text-xs bg-orange-400">subir&nbsp;archivo</span></div>
                                                                @elseif ($apply_detail->type ==6)
                                                                <div class="inline-block"><span class="text-bold text-gray text-sm"></span><span class="text-white rounded-full px-1 text-xs bg-orange-400">campo&nbsp;rut-chileno</span></div>
                                                                {{-- @elseif ($apply_detail->type == 7)
                                                                <div class="inline-block"><span class="text-bold text-gray text-sm"></span><span class="text-white rounded-full px-1 text-xs bg-orange-400">campo&nbsp;de&nbsp;selección&nbsp;+&nbsp;texto&nbsp;simple</span></div> --}}
                                                                @elseif ($apply_detail->type == 10)
                                                                <div class="inline-block"><span class="text-bold text-gray text-sm"></span><span class="text-white rounded-full px-1 text-xs bg-orange-400">campo&nbsp;telefono</span></div>
                                                            @endif
                                                       @endif
                                                          @if($apply_detail->placeholder != '')
                                                                <div class="inline-block"><span class="text-bold text-gray text-sm boder border-gris border-l-2 pl-2 ml-2"></span><span class="text-white rounded-full px-1 text-xs bg-green-400">{{$apply_detail->placeholder}}</span></div>
                                                            @endif

                                                            @if($apply_detail->obligatorio == 1)
                                                                <div class="inline-block"><span class="text-bold text-gray text-sm boder border-gris border-l-2 pl-2 ml-2 "></span><span class="text-white rounded-full px-1 text-xs bg-teal-500">Obligatorio</span></div>
                                                                @elseif ($apply_detail->obligatorio ==0)
                                                            @endif
                                                       <br>
                                                       @if ($apply_detail->type ==  3 || $apply_detail->type ==  4 || $apply_detail->type ==  7)

                                                         <div class="text-gris text-xs"><button type="button" class="bg-exito text-white rounded-full px-1 py-1" data-bs-toggle="modal" data-bs-target="#agregarDetalle-{{$apply_detail->id}}">
                                                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="currentColor" class="bi bi-plus-lg" viewBox="0 0 16 16">
                                                                <path fill-rule="evenodd" d="M8 2a.5.5 0 0 1 .5.5v5h5a.5.5 0 0 1 0 1h-5v5a.5.5 0 0 1-1 0v-5h-5a.5.5 0 0 1 0-1h5v-5A.5.5 0 0 1 8 2Z"/>
                                                              </svg>
                                                        </button> agregar&nbsp;opciones</div>

                                                        <br>
                                                        @if ($apply_detail->type ==  3 || $apply_detail->type ==  4 || $apply_detail->type ==  7)
                                                        <table class="table table-bordered">
                                                            <tbody>
                                                                <tr>
                                                                    <td>
                                                                        <select class="form-control text-xs">
                                                                            @foreach ($apply_detail->apply_detail_options as $option)
                                                                                <option >{{$option->name}}</option>
                                                                            @endforeach
                                                                        </select>
                                                                    </td>
                                                                    <td width='10px'> <button type="button" class="bg-exito text-white rounded px-1  py-1" data-bs-toggle="modal" data-bs-target="#verDetalle-{{$apply_detail->id}}"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-eye" viewBox="0 0 16 16">
                                                                        <path d="M16 8s-3-5.5-8-5.5S0 8 0 8s3 5.5 8 5.5S16 8 16 8zM1.173 8a13.133 13.133 0 0 1 1.66-2.043C4.12 4.668 5.88 3.5 8 3.5c2.12 0 3.879 1.168 5.168 2.457A13.133 13.133 0 0 1 14.828 8c-.058.087-.122.183-.195.288-.335.48-.83 1.12-1.465 1.755C11.879 11.332 10.119 12.5 8 12.5c-2.12 0-3.879-1.168-5.168-2.457A13.134 13.134 0 0 1 1.172 8z"/>
                                                                        <path d="M8 5.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5zM4.5 8a3.5 3.5 0 1 1 7 0 3.5 3.5 0 0 1-7 0z"/>
                                                                      </svg></button></td>
                                                                </tr>
                                                            </tbody>
                                                        </table>
                                                        @endif
                                                        @foreach ($apply_detail->apply_detail_options as $option)
                                                            @if ($option->relation)
                                                            <div class="border radius py-2 px-2">Opcion de selector <b>"{{$option->relation->apply_detail_option->name}}"</b> enlazada con <b>"{{$option->relation->apply_detail->question}}"</b> <a type="button" class="bg-error rounded px-1 py-1 text-white text-xs float-right" href="{{ route('borrar.relacion', $option->relation->id) }}"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-trash" viewBox="0 0 16 16">
                                                                <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"/>
                                                                <path fill-rule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"/>
                                                              </svg></a> </div>

                                                            @endif

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
                    <p>Ingrese campo</p>
                    <input class="form-control" name="pregunta" required/>
                    <hr/>
                    <p class="mt-2">Ingrese placeholder del campo</p>
                    <input class="form-control" name="placeholder"/>
                    <hr/>
                    <p class="mt-2">Tipo de campo</p>
                    <select class="form-control" name="type" required>
                        <option value="">----</option>
                        <option value="0">Texto simple</option>
                        <option value="1">Texto largo</option>
                        <option value="2">Campo numérico</option>
                        <option value="3">Campo de selección</option>
                        {{--  <option value="4">Campo de selección multiple</option> --}}
                        <option value="5">Subir archivo</option>
                        <option value="6">Rut</option>
                        {{-- <option value="7">Campo de selección + campo relacionado</option> --}}
                        <option value="8">Título de sección</option>
                        <option value="9">Título item de sección</option>
                        {{-- <option value="10">Campos de selección + relacionados</option> --}}
                    </select>
                    <hr/>
                    <p class="mt-2">Campo obligatorio</p>
                    <input type="checkbox" name="obligatorio"/>

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
        @foreach ($convocatoria->apply_details as $apply_detailModal)

            <div class="modal fade" id="agregarDetalle-{{$apply_detailModal->id}}" tabindex="-1" aria-labelledby="agregarDetalle-{{$apply_detailModal->id}}" aria-hidden="true">
                <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                    <h5 class="modal-title" id="agregarDetalle">Agregar Detalles - Opciones</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <form action="{{ route('agregar.opcion') }}" method="POST">
                        @csrf
                        <input type="hidden" name="apply" value="{{ $apply_detailModal->id }}"/>
                        <input type="hidden" name="convocatoria" value="{{ $convocatoria->id }}"/>
                        <div class="modal-body">
                        <p>Ingrese Opcion</p>
                            <input type="text" class="form-control" name="opcion" required/>
                        <hr/>
                        @if ($apply_detailModal->type == 7)
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


                <div class="modal fade" id="verDetalle-{{$apply_detailModal->id}}" tabindex="-1" aria-labelledby="verDetalle-{{$apply_detailModal->id}}" aria-hidden="true">
                    <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                        <h5 class="modal-title" id="verDetalle">Estas viendo el detalle de opciones del campo <b>"{{$apply_detailModal->question}}"</b></h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <form action="{{ route('agregar.opcion') }}" method="POST">
                            @csrf
                            <input type="hidden" name="apply" value="{{ $apply_detailModal->id }}"/>
                            <input type="hidden" name="convocatoria" value="{{ $convocatoria->id }}"/>
                            <div class="modal-body">
                                <table class="table table-bordered" width="100%" cellSpacing="0">
                                    <thead>
                                        <tr>
                                            <th>Opciones del campo</th>
                                            <th></th>
                                            <th></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        @foreach ($apply_detailModal->apply_detail_options as $option)
                                        <tr>
                                            <td>{{$option->name}}</td>
                                            <td width="10px"><a type="button" class="bg-error rounded px-1 py-1 text-white text-xs float-right" href="{{ route('borrar.option', $option->id) }}"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-trash" viewBox="0 0 16 16">
                                                <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"/>
                                                <path fill-rule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"/>
                                              </svg></a></td>
                                            <td width="10px"><a type="button" class="bg-exito rounded px-1 py-1 text-white text-xs float-right" data-bs-toggle="modal" data-bs-target="#optionEditar-{{$option->id}}"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-pencil-square" viewBox="0 0 16 16">
                                                <path d="M15.502 1.94a.5.5 0 0 1 0 .706L14.459 3.69l-2-2L13.502.646a.5.5 0 0 1 .707 0l1.293 1.293zm-1.75 2.456-2-2L4.939 9.21a.5.5 0 0 0-.121.196l-.805 2.414a.25.25 0 0 0 .316.316l2.414-.805a.5.5 0 0 0 .196-.12l6.813-6.814z"/>
                                                <path fill-rule="evenodd" d="M1 13.5A1.5 1.5 0 0 0 2.5 15h11a1.5 1.5 0 0 0 1.5-1.5v-6a.5.5 0 0 0-1 0v6a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5H9a.5.5 0 0 0 0-1H2.5A1.5 1.5 0 0 0 1 2.5v11z"/>
                                              </svg></a></td>
                                        </tr>
                                        @endforeach
                                    </tbody>
                                </table>
                            </div>


                            <div class="modal-footer">
                            <button type="button" class="bg-gray rounded px-2 py-2 text-white float-left" data-bs-dismiss="modal">Cerrar</button>
                            <button type="submit" class="bg-exito rounded px-2 py-2 text-white">Guardar cambio</button>
                            </div>
                        </form>
                    </div>
                    </div>
                </div>
                @foreach ($apply_detailModal->apply_detail_options as $option)
                    <div class="modal fade" id="optionEditar-{{$option->id}}" tabindex="-1" aria-labelledby="optionEditar-{{$option->id}}" aria-hidden="true">
                        <div class="modal-dialog">
                        <div class="modal-content">
                            <div class="modal-header">
                            <h5 class="modal-title" id="optionEditar">Editando la opcion <b>"{{$option->name}}"</b> del selector <b>"{{$option->apply_detail->question}}"</b></h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                            </div>
                            <form action="{{ route('editar.opcion') }}" method="POST">
                                @csrf
                                <input type="hidden" name="apply" value="{{ $option->apply_detail->id }}"/>
                                <input type="hidden" name="convocatoria" value="{{ $convocatoria->id }}"/>
                                <div class="modal-body">
                                <p>Nombre</p>
                                    <input type="text" class="form-control" required value="{{ $option->name }}"/>
                                    <input type="hidden" name="opcion" value="{{$option->id}}"/>
                                <br>
                                <p>Desea relacionar con otro campo?</p>
                                    <select class="form-control" name="question">
                                        <option value="">--seleccione---</option>
                                        @foreach ($convocatoria->apply_details as $apply_detailModal)
                                            <option value="{{$apply_detailModal->id}}">{{$apply_detailModal->question}}</option>
                                        @endforeach
                                    </select>

                                    <hr/>
                                <p class="mt-2">El campo asociado debe quedar visible?</p>
                                <input type="checkbox" name="visible"/>
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


        @endforeach


@endsection
