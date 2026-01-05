<?php

namespace App\Http\Controllers\Admin\Patients;

use App\Http\Controllers\Controller;
use App\Models\PatientContact;
use App\Http\Requests\StorePatientContactRequest;
use App\Http\Requests\UpdatePatientContactRequest;
use App\Models\Patient;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Arr;


class PatientContactController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        //
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
     * @param  \App\Http\Requests\StorePatientContactRequest  $request
     * @return \Illuminate\Http\Response
     */
    public function store(StorePatientContactRequest $request, Patient $patient)
    {
        $validated = $request->validated();

        DB::beginTransaction();
        try {
            // Normalizamos el booleano (viene de checkbox/switch)
            $incomingIsPrimary = filter_var($validated['is_primary'] ?? false, FILTER_VALIDATE_BOOLEAN);

            // ¿Es actualización? (si envías un id en el form)
            $isUpdate = $request->filled('id');

            if ($isUpdate) {
                // UPDATE
                $contact = $patient->contacts()->lockForUpdate()->findOrFail($request->input('id'));
                // Si este se marcará como primary, desmarcamos los demás ANTES de guardar
                if ($incomingIsPrimary) {
                    $patient->contacts()
                        ->where('id', '<>', $contact->id)
                        ->where('is_primary', true)
                        ->update(['is_primary' => false]);
                }

                $contact->fill($validated);
                $contact->save();

                // Garantía: si nadie quedó como primary, dejamos este como primary
                $hasPrimary = $patient->contacts()->where('is_primary', true)->exists();
                if (!$hasPrimary) {
                    $contact->forceFill(['is_primary' => true])->save();
                }
            } else {
                // CREATE
                // Si entra como primary, desmarcamos los demás ANTES de insertar
                if ($incomingIsPrimary) {
                    $patient->contacts()
                        ->where('is_primary', true)
                        ->update(['is_primary' => false]);
                    $validated['is_primary'] = true;
                }

                $contact = $patient->contacts()->create($validated);

                // Garantía: si nadie quedó como primary (por ej. entró false y no existía otro), este pasa a ser primary
                $hasPrimary = $patient->contacts()->where('is_primary', true)->exists();
                if (!$hasPrimary) {
                    $contact->forceFill(['is_primary' => true])->save();
                }
            }

            DB::commit();
            session()->flash('message', 'Contacto de paciente guardado correctamente.');
            session()->flash('type', 'success');
        } catch (\Throwable $e) {
            DB::rollBack();
            report($e);
            session()->flash('message', 'No se pudo guardar correctamente');
            session()->flash('type', 'error');
        }

        return back();
    }


    /**
     * Display the specified resource.
     *
     * @param  \App\Models\PatientContact  $patientContact
     * @return \Illuminate\Http\Response
     */
    public function show(PatientContact $patientContact)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     *
     * @param  \App\Models\PatientContact  $patientContact
     * @return \Illuminate\Http\Response
     */
    public function edit(PatientContact $patientContact)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \App\Http\Requests\UpdatePatientContactRequest  $request
     * @param  \App\Models\PatientContact  $patientContact
     * @return \Illuminate\Http\Response
     */
    public function update(UpdatePatientContactRequest $request, PatientContact $patientContact)
    {
        $validated = $request->validated();

        /* dd($validated, $patientContact); */

        DB::beginTransaction();
        try {
            // Normaliza booleano explícitamente
            $incomingIsPrimary = filter_var($validated['is_primary'] ?? false, FILTER_VALIDATE_BOOLEAN);
            $validated['is_primary'] = $incomingIsPrimary ? 1 : 0;

            // Filtra atributos permitidos (ajusta a tu tabla)
            $allowed = [
                'name',
                'phone',
                'email',
                'relationship',
                'type',
                'is_primary',
                'patient_id',
            ];
            $data = Arr::only($validated, $allowed);

            // Asegura consistencia de pertenencia
            $patientId = (int) $patientContact->patient_id;
            if (!empty($data['patient_id']) && (int) $data['patient_id'] !== $patientId) {
                unset($data['patient_id']); // evita mover el contacto por accidente
            }

            // Si este se marcará como primario, desmarcamos a los demás PRIMERO
            if ($incomingIsPrimary) {
                PatientContact::where('patient_id', $patientId)
                    ->where('id', '<>', $patientContact->id)
                    ->where('is_primary', 1)
                    ->update(['is_primary' => 0]);
            }

            // Guardar este contacto
            $patientContact->forceFill($data)->saveOrFail();

            // ——— Garantía: asegurar que exista EXACTAMENTE uno primario ———

            // 1) Recontar primarios de este paciente con lock duro
            //    (evita carreras y evita caches de Eloquent)
            $anyPrimaryRow = PatientContact::where('patient_id', $patientId)
                ->where('is_primary', 1)
                ->select('id')
                ->lockForUpdate()      // <- importante dentro de la transacción
                ->first();

            if (!$anyPrimaryRow) {
                // Si no hay ninguno, marcamos ESTE como primario
                PatientContact::whereKey($patientContact->id)->update(['is_primary' => 1]);
                $patientContact->is_primary = true; // sincroniza en memoria (opcional)
            } else {
                // (opcional) si quieres asegurarte de que SOLO haya uno:
                PatientContact::where('patient_id', $patientId)
                    ->where('id', '<>', $anyPrimaryRow->id)
                    ->where('is_primary', 1)
                    ->update(['is_primary' => 0]);
            }

            DB::commit();
            session()->flash('message', 'Contacto de paciente actualizado correctamente.');
            session()->flash('type', 'success');
        } catch (\Throwable $e) {
            DB::rollBack();
            report($e);
            session()->flash('message', 'No se pudo actualizar el contacto.');
            session()->flash('type', 'error');
        }

        return back();
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  \App\Models\PatientContact  $patientContact
     * @return \Illuminate\Http\Response
     */
    public function destroy(PatientContact $patientContact)
    {
        //
    }
}
