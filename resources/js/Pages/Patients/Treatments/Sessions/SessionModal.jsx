import React, { useEffect, useState, useMemo } from "react";
import { useForm } from "@inertiajs/react";
import moment from "moment";
import {
  Calendar,
  Activity,
  User,
  ListChecks,
  Stethoscope, // Icono visual
  ClipboardList,
  Target,
  Info, // Icono de información
} from "lucide-react";
import SearchSelect from "@/Components/SearchSelect";

const STATUS_OPTIONS = [
  { value: "scheduled", label: "📅 Programada" },
  { value: "attended", label: "✅ Asistida / Completada" },
  { value: "missed", label: "🚫 Faltó (Missed)" },
  { value: "cancelled", label: "❌ Cancelada" },
];

export default function SessionFormModal({
  setShowModal,
  sessionData = null,
  patients = [],
  doctors = [],
  // diagnoses = [], // YA NO ES NECESARIO PASAR LA LISTA COMPLETA
  session_types = [],
  preselectedPatient = null,
  isDuplicate = false,
}) {
  const isEditing = !!sessionData?.id && !isDuplicate;
  const currentStatus = sessionData?.status || "scheduled";

  // Formatear doctores
  const formattedDoctors = useMemo(() => {
    return doctors.map((d) => ({
      ...d,
      full_name: d.full_name || `${d.name} ${d.last_name || ""}`.trim(),
    }));
  }, [doctors]);

  const { data, setData, post, patch, processing, errors, reset } = useForm({
    id: sessionData?.id || "",
    // Eliminamos diagnosis_id del formulario porque pertenece al treatment
    treatment_id:
      sessionData?.treatment_id ||
      preselectedPatient?.active_treatments?.[0]?.id ||
      "",
    patient_id: sessionData?.patient_id || preselectedPatient?.id || "",
    doctor_id: sessionData?.doctor_id || "",
    session_type_id: sessionData?.session_type_id || "",

    // Control
    date: sessionData?.date
      ? moment.utc(sessionData.date).format("YYYY-MM-DD")
      : moment().format("YYYY-MM-DD"),
    time: sessionData?.time || "",
    duration: sessionData?.duration || 45,
    status: sessionData?.status || "scheduled",
    consumes_plan: sessionData?.consumes_plan || false,

    // SOAP
    pain_level: sessionData?.pain_level || 0,
    subjective: sessionData?.subjective || "",
    objective: sessionData?.objective || "",
    assessment: sessionData?.assessment || "",
    plan: sessionData?.plan || "",

    // JSONs
    evaluation_data: sessionData?.evaluation_data || {
      rom: {
        flexion: { before: 0, after: 0 },
        extension: { before: 0, after: 0 },
        abduction: { before: 0, after: 0 },
        rotation: { before: 0, after: 0 },
      },
    },
    activities_data: sessionData?.activities_data || {
      techniques: [],
      exercises: [],
    },

    // Finanzas
    patient_amount_clp: sessionData?.patient_amount_clp || 0,
    patient_plan_id: sessionData?.patient_plan_id || "",
  });

  // Estado local para MOSTRAR el diagnóstico actual (solo lectura)
  const [currentDiagnosisName, setCurrentDiagnosisName] = useState(null);

  const [techniqueInput, setTechniqueInput] = useState("");

  // ... Helpers de ROM y Activities (Igual que antes) ...
  const handleRomChange = (type, moment, value) => {
    const currentRom = data.evaluation_data.rom || {};
    setData("evaluation_data", {
      ...data.evaluation_data,
      rom: {
        ...currentRom,
        [type]: { ...currentRom[type], [moment]: parseInt(value) || 0 },
      },
    });
  };
  const handleActivityChange = (category, item, action) => {
    const currentList = data.activities_data[category] || [];
    const newList =
      action === "add"
        ? [...new Set([...currentList, item])]
        : currentList.filter((i) => i !== item);
    setData("activities_data", {
      ...data.activities_data,
      [category]: newList,
    });
  };
  const isFieldEditable = (fieldType) => {
    if (!isEditing && !isDuplicate) return true;
    if (isDuplicate) return true;
    if (currentStatus === "cancelled" || currentStatus === "missed")
      return false;
    if (currentStatus === "attended") return fieldType === "clinical";
    return true;
  };

  // ... imports y setup inicial

  // 1. Obtener el objeto del paciente seleccionado actualmente
  const selectedPatientObj = useMemo(() => {
    const currentId = parseInt(data.patient_id);
    if (!currentId) return null;
    // Buscar en lista o usar preseleccionado
    if (preselectedPatient && preselectedPatient.id === currentId)
      return preselectedPatient;
    return patients.find((p) => p.id === currentId);
  }, [data.patient_id, patients, preselectedPatient]);

  // 2. Obtener sus tratamientos activos
  const patientTreatments = useMemo(() => {
    if (!selectedPatientObj) return [];
    return (
      selectedPatientObj.active_treatments ||
      selectedPatientObj.treatments ||
      []
    );
  }, [selectedPatientObj]);

  // 3. Obtener el Diagnóstico ACTUAL basado en el treatment_id seleccionado en el form
  const currentDiagnosisDisplay = useMemo(() => {
    if (!data.treatment_id || patientTreatments.length === 0) return null;

    const treatment = patientTreatments.find(
      (t) => String(t.id) === String(data.treatment_id)
    );
    if (!treatment) return null;

    const d = treatment.diagnostic || treatment.diagnosis;
    return d
      ? `${d.code || ""} - ${d.description || ""}`
      : "Sin diagnóstico especificado";
  }, [data.treatment_id, patientTreatments]);

  // --- LÓGICA CLAVE CORREGIDA Y ROBUSTA ---
  // --- EFECTO: AUTO-SELECCIÓN POR DEFECTO ---
  useEffect(() => {
    // Si no hay tratamientos, no hacemos nada
    if (patientTreatments.length === 0) return;

    // Si ya hay un tratamiento seleccionado Y ese tratamiento pertenece al paciente actual, NO lo tocamos
    const currentIsValid = patientTreatments.some(
      (t) => String(t.id) === String(data.treatment_id)
    );

    if (isEditing) return; // En edición nunca tocamos nada automáticamente

    if (!data.treatment_id || !currentIsValid) {
      // Seleccionamos el más reciente (el primero de la lista) por defecto
      setData((prev) => ({ ...prev, treatment_id: patientTreatments[0].id }));
    }
  }, [patientTreatments, data.treatment_id, isEditing]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!data.patient_id) return alert("Selecciona un paciente");
    if (!data.doctor_id) return alert("Selecciona un kinesiólogo");
    // if (!data.treatment_id) return alert("El paciente no tiene un tratamiento activo."); // Opcional, buena validación

    const opts = {
      onSuccess: () => {
        reset();
        setShowModal(false);
      },
      onError: () => alert("Revisa los errores."),
    };
    isEditing
      ? patch(route("sessions.update", data.id), opts)
      : post(route("sessions.store"), opts);
  };

  const activePlans = (() => {
    const pId = data.patient_id;
    if (!pId) return [];
    const patientObj = patients.find((p) => p.id === pId) || preselectedPatient;
    return patientObj?.active_plans || [];
  })();

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl max-h-[90vh] overflow-y-auto">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* HEADER */}
        <header className="sticky top-0 z-10 flex items-center justify-between pt-2 pb-4 bg-white border-b border-gray-200 dark:bg-gray-800">
          <div className="flex items-center gap-3">
            <ListChecks className="w-8 h-8 text-blue-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {isEditing ? "Editar Sesión" : "Nueva Sesión"}
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Ficha Clínica SOAP + Gestión
              </p>
            </div>
          </div>
          <div className="w-48">
            <label className="block mb-1 text-xs font-bold text-gray-500 uppercase">
              Estado
            </label>
            <select
              value={data.status}
              onChange={(e) => setData("status", e.target.value)}
              className="w-full text-sm border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </header>

        <div className="px-6 pb-6 space-y-8">
          {/* 1. DATOS ADMINISTRATIVOS */}
          <div className="p-5 border border-gray-200 rounded-lg bg-gray-50 dark:bg-gray-900/50 dark:border-gray-700">
            <h2 className="flex items-center gap-2 mb-4 text-lg font-semibold text-gray-900 dark:text-white">
              <Calendar className="w-5 h-5 text-blue-600" />
              Datos Generales
            </h2>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {/* Paciente */}
              {preselectedPatient ? (
                <div className="p-3 bg-white border border-gray-300 rounded-lg dark:bg-gray-800 dark:border-gray-600">
                  <label className="block text-xs font-bold text-gray-500 uppercase">
                    Paciente
                  </label>
                  <div className="flex items-center gap-2 mt-1">
                    <User className="w-5 h-5 text-gray-400" />
                    <span className="font-medium text-gray-900 dark:text-white">
                      {preselectedPatient.full_name}
                    </span>
                  </div>
                </div>
              ) : (
                <SearchSelect
                  label="Paciente *"
                  options={patients.map(p => ({ value: p.id, label: `${p.full_name || `${p.name} ${p.last_name}`} ${p.rut ? `(${p.rut})` : ''}` }))}
                  value={data.patient_id}
                  onChange={(val) => setData("patient_id", val)}
                  disabled={!isFieldEditable("patient_id")}
                />
              )}

              {/* Kinesiólogo */}
              <SearchSelect
                label="Kinesiólogo/a *"
                options={formattedDoctors.map(d => ({ value: d.id, label: d.full_name }))}
                value={data.doctor_id}
                onChange={(val) => setData("doctor_id", val)}
                disabled={!isFieldEditable("doctor_id")}
              />

              {/* --- SELECCIÓN DE TRATAMIENTO / DIAGNÓSTICO --- */}
              <div className="md:col-span-2">
                <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                  Tratamiento / Diagnóstico a tratar *
                </label>

                {patientTreatments.length > 1 ? (
                  // CASO A: Múltiples tratamientos -> Mostramos un SELECT
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <Stethoscope className="w-5 h-5 text-teal-600" />
                    </div>
                    <select
                      value={data.treatment_id}
                      onChange={(e) => setData("treatment_id", e.target.value)}
                      disabled={!isFieldEditable("clinical")}
                      className="w-full pl-10 border-gray-300 rounded-lg focus:ring-teal-500 focus:border-teal-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    >
                      {patientTreatments.map((t) => {
                        const d = t.diagnostic || t.diagnosis;
                        const name = d
                          ? `${d.code} - ${d.description}`
                          : "Sin diagnóstico";
                        // Formatear fecha para ayudar a distinguir
                        const date = t.created_at
                          ? moment(t.created_at).format("DD/MM/YYYY")
                          : "";
                        return (
                          <option key={t.id} value={t.id}>
                            {name} (Inicio: {date})
                          </option>
                        );
                      })}
                    </select>
                    <p className="mt-1 text-xs text-teal-600">
                      ℹ️ Este paciente tiene {patientTreatments.length}{" "}
                      tratamientos activos. Selecciona uno.
                    </p>
                  </div>
                ) : (
                  // CASO B: 1 o 0 Tratamientos -> Mostramos la TARJETA SOLO LECTURA (Más elegante)
                  <div
                    className={`flex items-start gap-3 p-3 rounded-lg border ${
                      currentDiagnosisDisplay
                        ? "bg-teal-50 border-teal-200"
                        : "bg-gray-100 border-gray-200"
                    }`}
                  >
                    <div className="mt-1">
                      <Stethoscope
                        className={`w-5 h-5 ${
                          currentDiagnosisDisplay
                            ? "text-teal-600"
                            : "text-gray-400"
                        }`}
                      />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-gray-700 dark:text-gray-300">
                        Diagnóstico Activo
                      </h4>
                      {currentDiagnosisDisplay ? (
                        <p className="text-sm font-medium text-teal-800 dark:text-teal-300">
                          {currentDiagnosisDisplay}
                        </p>
                      ) : (
                        <p className="text-xs text-gray-500 italic">
                          {data.patient_id
                            ? "El paciente no tiene tratamientos activos."
                            : "Selecciona un paciente."}
                        </p>
                      )}
                    </div>
                    {/* Input oculto para que viaje el ID */}
                    <input
                      type="hidden"
                      name="treatment_id"
                      value={data.treatment_id}
                    />
                  </div>
                )}
              </div>

              {/* Fechas y Horas */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                    Fecha
                  </label>
                  <input
                    type="date"
                    value={data.date}
                    onChange={(e) => setData("date", e.target.value)}
                    disabled={!isFieldEditable("date")}
                    className="w-full border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                    Hora
                  </label>
                  <input
                    type="time"
                    value={data.time}
                    onChange={(e) => setData("time", e.target.value)}
                    disabled={!isFieldEditable("time")}
                    className="w-full border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>
              </div>

              {/* Finanzas */}
              <div className="grid grid-cols-2 gap-4">
                <SearchSelect
                  label="Tipo Sesión"
                  options={session_types.map(st => ({ value: st.id, label: st.name }))}
                  value={data.session_type_id}
                  onChange={(val) => {
                    const type = session_types.find((t) => t.id === val);
                    setData((prev) => ({
                      ...prev,
                      session_type_id: val,
                      patient_amount_clp: type
                        ? Number(type.base_price_clp)
                        : 0,
                    }));
                  }}
                />
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                    Plan
                  </label>
                  <select
                    value={data.consumes_plan ? "yes" : "no"}
                    onChange={(e) =>
                      setData("consumes_plan", e.target.value === "yes")
                    }
                    className="w-full border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600"
                  >
                    <option value="no">Pago Individual</option>
                    <option value="yes" disabled={activePlans.length === 0}>
                      Descontar de Pack (
                      {activePlans.length > 0 ? "Disponible" : "Sin planes"})
                    </option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* --- 2. EVOLUCIÓN CLÍNICA (SOAP) --- */}
          {["attended", "scheduled"].includes(data.status) && (
            <div className="space-y-6">
              <div className="flex items-center gap-2 pb-2 border-b border-gray-200">
                <ClipboardList className="w-6 h-6 text-teal-600" />
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Evolución Clínica (SOAP)
                </h2>
              </div>

              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                {/* S: SUBJECTIVE */}
                <div className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm dark:bg-gray-800 dark:border-gray-700">
                  <h3 className="flex items-center gap-2 mb-3 text-lg font-semibold text-teal-700 dark:text-teal-400">
                    <User className="w-5 h-5" /> Subjetivo (S)
                  </h3>
                  <div className="mb-4">
                    <div className="flex justify-between mb-1">
                      <label className="text-sm font-medium text-gray-700">
                        Nivel de Dolor (EVA)
                      </label>
                      <span
                        className={`font-bold text-lg ${
                          data.pain_level > 7 ? "text-red-600" : "text-blue-600"
                        }`}
                      >
                        {data.pain_level}/10
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="10"
                      value={data.pain_level}
                      onChange={(e) =>
                        setData("pain_level", parseInt(e.target.value))
                      }
                      className="w-full accent-teal-600"
                    />
                  </div>
                  <textarea
                    value={data.subjective}
                    onChange={(e) => setData("subjective", e.target.value)}
                    className="w-full text-sm border-gray-300 rounded-lg"
                    rows="3"
                    placeholder="Paciente refiere..."
                  />
                </div>

                {/* O: OBJECTIVE */}
                <div className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm dark:bg-gray-800 dark:border-gray-700">
                  <h3 className="flex items-center gap-2 mb-3 text-lg font-semibold text-blue-700 dark:text-blue-400">
                    <Activity className="w-5 h-5" /> Objetivo (O)
                  </h3>
                  <div className="mb-4 p-3 bg-blue-50 rounded-lg dark:bg-blue-900/20">
                    <p className="text-xs font-bold text-blue-800 uppercase mb-2">
                      ROM (Grados)
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                      {["flexion", "abduction"].map((romType) => (
                        <div key={romType}>
                          <label className="text-xs text-gray-600 capitalize">
                            {romType}
                          </label>
                          <div className="flex gap-1">
                            <input
                              type="number"
                              placeholder="Pre"
                              className="w-1/2 px-2 py-1 text-xs border rounded"
                              value={
                                data.evaluation_data.rom?.[romType]?.before ||
                                ""
                              }
                              onChange={(e) =>
                                handleRomChange(
                                  romType,
                                  "before",
                                  e.target.value
                                )
                              }
                            />
                            <input
                              type="number"
                              placeholder="Post"
                              className="w-1/2 px-2 py-1 text-xs border rounded"
                              value={
                                data.evaluation_data.rom?.[romType]?.after || ""
                              }
                              onChange={(e) =>
                                handleRomChange(
                                  romType,
                                  "after",
                                  e.target.value
                                )
                              }
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <textarea
                    value={data.objective}
                    onChange={(e) => setData("objective", e.target.value)}
                    className="w-full text-sm border-gray-300 rounded-lg"
                    rows="2"
                    placeholder="Se observa..."
                  />
                </div>

                {/* A: ASSESSMENT */}
                <div className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm dark:bg-gray-800 dark:border-gray-700">
                  <h3 className="flex items-center gap-2 mb-3 text-lg font-semibold text-purple-700 dark:text-purple-400">
                    <ClipboardList className="w-5 h-5" /> Análisis (A)
                  </h3>
                  <textarea
                    value={data.assessment}
                    onChange={(e) => setData("assessment", e.target.value)}
                    className="w-full text-sm border-gray-300 rounded-lg"
                    rows="3"
                    placeholder="Evolución positiva..."
                  />
                </div>

                {/* P: PLAN */}
                <div className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm dark:bg-gray-800 dark:border-gray-700">
                  <h3 className="flex items-center gap-2 mb-3 text-lg font-semibold text-green-700 dark:text-green-400">
                    <Target className="w-5 h-5" /> Plan (P)
                  </h3>
                  <div className="mb-3">
                    <div className="flex gap-2 mb-2">
                      <input
                        type="text"
                        value={techniqueInput}
                        onChange={(e) => setTechniqueInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleActivityChange(
                              "techniques",
                              techniqueInput,
                              "add"
                            );
                            setTechniqueInput("");
                          }
                        }}
                        className="flex-1 text-xs border-gray-300 rounded"
                        placeholder="Técnica/Ejercicio..."
                      />
                      <button
                        type="button"
                        onClick={() => {
                          handleActivityChange(
                            "techniques",
                            techniqueInput,
                            "add"
                          );
                          setTechniqueInput("");
                        }}
                        className="bg-green-600 text-white px-2 rounded"
                      >
                        +
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {data.activities_data.techniques?.map((t, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 text-xs bg-green-100 text-green-800 rounded-full flex items-center gap-1"
                        >
                          {t}{" "}
                          <button
                            type="button"
                            onClick={() =>
                              handleActivityChange("techniques", t, "remove")
                            }
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                  <textarea
                    value={data.plan}
                    onChange={(e) => setData("plan", e.target.value)}
                    className="w-full text-sm border-gray-300 rounded-lg"
                    rows="2"
                    placeholder="Próxima sesión..."
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* FOOTER */}
        <div className="sticky bottom-0 flex justify-end gap-3 p-4 bg-gray-50 border-t border-gray-200 dark:bg-gray-800 dark:border-gray-700">
          <button
            type="button"
            onClick={() => setShowModal(false)}
            className="px-4 py-2 text-sm text-gray-700 bg-white border rounded-lg hover:bg-gray-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="px-6 py-2 text-sm text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
            disabled={processing}
          >
            {processing ? "Guardando..." : isEditing ? "Actualizar" : "Crear"}
          </button>
        </div>
      </form>
    </div>
  );
}
