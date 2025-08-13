<?php

namespace App\Http\Controllers;

use App\Models\Sesion;
use App\Http\Requests\StoreSesionRequest;
use App\Http\Requests\UpdateSesionRequest;
use App\Models\Solicitud;
use Illuminate\Http\Request;

class SesionController extends Controller
{

    public function sesiones()
    {
        $sesiones = Sesion::with('solicitud')->get();

        return inertia('Sesiones/TableSesiones', [
            'sesiones' => $sesiones,
        ]);
    }
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function crearSesion(Request $request)
    {

        $sesion = Sesion::create([
            'comentario' => $request->get('comentario'),
            'solicitud_id' => $request->get('solicitud_id'),
            'fecha_session' => $request->get('fecha_atencion'),
        ]);

        $solicitudes = Sesion::where('solicitud_id', $sesion->solicitud_id)->count();
        $solicitud = Solicitud::find($sesion->solicitud_id);
        $solicitud->sessions_count = $solicitudes;
        $solicitud->save();



        return back();
    }

    /**
     * Show the form for creating a new resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \App\Http\Requests\StoreSesionRequest  $request
     * @return \Illuminate\Http\Response
     */
    public function store(StoreSesionRequest $request)
    {
        //
    }

    /**
     * Display the specified resource.
     *
     * @param  \App\Models\Sesion  $session
     * @return \Illuminate\Http\Response
     */
    public function show(Sesion $sesion)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     *
     * @param  \App\Models\Sesion  $session
     * @return \Illuminate\Http\Response
     */
    public function edit(Sesion $sesion)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \App\Http\Requests\UpdateSesionRequest  $request
     * @param  \App\Models\Sesion  $session
     * @return \Illuminate\Http\Response
     */
    public function update(UpdateSesionRequest $request, Sesion $sesion)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  \App\Models\Sesion  $session
     * @return \Illuminate\Http\Response
     */
    public function destroy(Sesion $sesion)
    {
        //
    }
}
