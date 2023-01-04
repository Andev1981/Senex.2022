<?php

namespace App\Http\Controllers;

use App\Models\Resumen;
use App\Http\Requests\StoreResumenRequest;
use App\Http\Requests\UpdateResumenRequest;
use App\Models\Prescription;
use App\Models\Solicitud;
use Symfony\Component\HttpFoundation\Request;

class ResumenController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        $solicitudes = Solicitud::where('status',1)->paginate(10);

        return view('admin.resumen.index', compact('solicitudes'));
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

    public function crearReceta(Request $request){


        if($request->repeat == 'on'){
            $repeat = 1;
            $range = $request->range;
        }else{
            $repeat = 0;
            $range = null;
        }

        $success = Prescription::create([
            'message' => $request->mensaje,
            'solicitud_id' => $request->solicitud_id,
            'repeat' => $repeat,
            'range' => $range,
            'solicitud_id' => $request->solicitud_id
        ]);

        if($success){
            return back();
        }else{
            return back();
        }
    }

    public function receta(){
        return view('admin.receta.index');
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \App\Http\Requests\StoreResumenRequest  $request
     * @return \Illuminate\Http\Response
     */
    public function store(StoreResumenRequest $request)
    {
        //
    }

    /**
     * Display the specified resource.
     *
     * @param  \App\Models\Resumen  $resumen
     * @return \Illuminate\Http\Response
     */
    public function show(Resumen $resumen, $res)
    {

        $solicitud = Solicitud::find($res);
        return view('admin.resumen.show', compact('solicitud'));

    }

    /**
     * Show the form for editing the specified resource.
     *
     * @param  \App\Models\Resumen  $resumen
     * @return \Illuminate\Http\Response
     */
    public function edit(Resumen $resumen)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \App\Http\Requests\UpdateResumenRequest  $request
     * @param  \App\Models\Resumen  $resumen
     * @return \Illuminate\Http\Response
     */
    public function update(UpdateResumenRequest $request, Resumen $resumen)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  \App\Models\Resumen  $resumen
     * @return \Illuminate\Http\Response
     */
    public function destroy(Resumen $resumen)
    {
        //
    }
}
