import React, { useEffect, useState, useMemo } from "react";
import { useForm } from "@inertiajs/react";
import moment from "moment";
import {
  Calendar,
  Activity,
  User,
  CheckCircle2,
  Stethoscope,
  ClipboardList,
  Target,
  Info,
  ChevronRight,
  Plus,
  XCircle,
  Database,
  Search,
  UserCheck,
  Edit3,
} from "lucide-react";
import SearchSelect from "@/Components/SearchSelect";
import PrimaryButton from "@/Components/PrimaryButton";
import SecondaryButton from "@/Components/SecondaryButton";

const STATUS_OPTIONS = [
  { value: "scheduled", label: "📅 Programada" },
  { value: "attended", label: "✅ Asistida / Completada" },
  { value: "missed", label: "🚫 Faltó (Missed)" },
  { value: "cancelled", label: "❌ Cancelada" },
];

export default function SessionFormModal({
  setShowModal, // Función para cerrar
  sessionData = null,
  patients = [],
  doctors = [],
  session_types = [],
  preselectedPatient = null,
  isDuplicate = false,
}) {
  // 🎯 Determinar si es Edición o Creación Real
  const isEditing =
    !!(sessionData?.session_id || sessionData?.id) && !isDuplicate;
  const currentStatus = sessionData?.status || "scheduled";

  const formattedDoctors = useMemo(() => {
    return doctors.map((d) => ({
      ...d,
      full_name: d.full_name || `${d.name} ${d.last_name || ""}`.trim(),
    }));
  }, [doctors]);

  const { data, setData, post, patch, processing, errors, reset } = useForm({
    id: sessionData?.session_id || sessionData?.id || "",
    treatment_id:
      sessionData?.treatment_id ||
      preselectedPatient?.active_treatments?.[0]?.id ||
      "",
    patient_id: sessionData?.patient_id || preselectedPatient?.id || "",
    doctor_id: sessionData?.doctor_id || "",
    session_type_id: sessionData?.session_type_id || "",
    date: sessionData?.date
      ? moment.utc(sessionData.date).format("YYYY-MM-DD")
      : moment().format("YYYY-MM-DD"),
    time: sessionData?.time || "",
    duration: sessionData?.duration || 45,
    status: sessionData?.status || "scheduled",
    consumes_plan: !!sessionData?.consumes_plan,
    pain_level: sessionData?.pain_level || 0,
    subjective: sessionData?.subjective || "",
    objective: sessionData?.objective || "",
    assessment: sessionData?.assessment || "",
    plan: sessionData?.plan || "",
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
    patient_amount_clp: sessionData?.patient_amount_clp || 0,
    patient_plan_id: sessionData?.patient_plan_id || "",
  });

  const [currentDiagnosisName, setCurrentDiagnosisName] = useState(null);
  const [techniqueInput, setTechniqueInput] = useState("");

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
    if (!isEditing) return true;
    if (currentStatus === "cancelled" || currentStatus === "missed")
      return false;
    if (currentStatus === "attended") return fieldType === "clinical";
    return true;
  };

  useEffect(() => {
    const selectedPatient =
      patients.find((p) => p.id === parseInt(data.patient_id)) ||
      preselectedPatient;
    if (!selectedPatient) {
      setCurrentDiagnosisName(null);
      return;
    }
    const treatmentsList =
      selectedPatient.active_treatments || selectedPatient.treatments || [];
    const activeTreatment =
      treatmentsList.length > 0 ? treatmentsList[0] : null;

    if (activeTreatment) {
      if (
        !isEditing &&
        String(data.treatment_id) !== String(activeTreatment.id)
      ) {
        setData((prev) => ({ ...prev, treatment_id: activeTreatment.id }));
      }
      const diagnosticObj =
        activeTreatment.diagnostic || activeTreatment.diagnosis;
      setCurrentDiagnosisName(
        diagnosticObj
          ? `${diagnosticObj.code || ""} ${
              diagnosticObj.description || ""
            }`.trim()
          : "Sin diagnóstico registrado"
      );
    } else {
      setCurrentDiagnosisName(null);
    }
  }, [data.patient_id, patients, preselectedPatient]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!data.patient_id) return alert("Selecciona un paciente");
    const opts = {
      onSuccess: () => {
        reset();
        setShowModal();
      },
      preserveScroll: true,
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

  const selectedPatientFinal = useMemo(() => {
    return (
      preselectedPatient ||
      patients.find((p) => p.id === parseInt(data.patient_id))
    );
  }, [preselectedPatient, data.patient_id, patients]);

  return (
    <div className="relative flex flex-col h-full bg-white">
      <form onSubmit={handleSubmit} className="flex flex-col h-full">
        {/* HEADER HERO DISTINTIVO */}
        <div
          className={`flex flex-col justify-between gap-6 p-10 border-b border-gray-100 md:flex-row md:items-center shrink-0 transition-colors duration-500 ${
            isEditing ? "bg-indigo-50/50" : "bg-gray-50/50"
          }`}
        >
          <div className="flex items-center gap-4">
            <div
              className={`flex items-center justify-center text-white transform shadow-xl w-14 h-14 rounded-2xl rotate-3 transition-colors ${
                isEditing
                  ? "bg-indigo-600 shadow-indigo-200"
                  : "bg-brand-primary shadow-brand-primary/20"
              }`}
            >
              {isEditing ? (
                <Edit3 className="w-7 h-7" />
              ) : (
                <Plus className="w-7 h-7" />
              )}
            </div>
            <div>
              <h1 className="mb-1 text-2xl font-black leading-none tracking-tight text-gray-900 uppercase">
                {isEditing ? "Actualizar Atención" : "Nueva Atención Clínica"}
              </h1>
              <p className="text-[10px] font-black text-brand-gray uppercase tracking-[0.2em]">
                {isEditing
                  ? `Modificando Registro #${data.id}`
                  : "Apertura de Protocolo SOAP"}
              </p>
            </div>
          </div>

          <div className="flex flex-col w-full gap-1 md:w-64">
            <label className="ml-1 enterprise-label opacity-60">
              Estado de Sesión
            </label>
            <select
              value={data.status}
              onChange={(e) => setData("status", e.target.value)}
              className="w-full text-[10px] font-black uppercase tracking-widest border-gray-100 rounded-xl bg-white focus:ring-brand-primary transition-all py-3 shadow-sm"
            >
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex-1 p-10 space-y-12 overflow-y-auto custom-scrollbar">
          {/* PACIENTE */}
          <div className="space-y-6">
            <h2 className="enterprise-label !text-brand-primary flex items-center gap-3 ml-1">
              <UserCheck className="w-4 h-4" /> Sujeto de Atención
            </h2>
            {selectedPatientFinal ? (
              <div className="flex items-center justify-between p-6 bg-white border border-gray-100 rounded-[2rem] shadow-xl shadow-gray-500/5 group relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 -mt-16 -mr-16 rounded-full opacity-50 bg-brand-primary/5 blur-3xl"></div>
                <div className="relative z-10 flex items-center gap-6">
                  <div className="flex items-center justify-center w-16 h-16 transition-transform shadow-inner bg-brand-secondary/10 text-brand-primary rounded-2xl group-hover:rotate-3">
                    <User className="w-8 h-8" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[9px] font-black text-brand-gray uppercase tracking-[0.2em] mb-1 opacity-60">
                      Identidad Confirmada
                    </p>
                    <p className="mb-2 text-xl font-black leading-none tracking-tight text-gray-900 uppercase">
                      {selectedPatientFinal.full_name ||
                        `${selectedPatientFinal.name} ${selectedPatientFinal.last_name}`}
                    </p>
                    <span className="font-mono text-[10px] font-bold text-brand-gray opacity-60 uppercase tracking-widest">
                      {selectedPatientFinal.rut}
                    </span>
                  </div>
                </div>
                {!preselectedPatient && !isEditing && (
                  <button
                    type="button"
                    onClick={() => setData("patient_id", "")}
                    className="relative z-10 p-3 text-gray-300 transition-all hover:text-red-500 rounded-xl active:scale-90"
                  >
                    <XCircle className="w-5 h-5" />
                  </button>
                )}
              </div>
            ) : (
              <SearchSelect
                label="Buscar Paciente *"
                options={patients.map((p) => ({
                  value: p.id,
                  label: `${p.full_name || `${p.name} ${p.last_name}`} ${
                    p.rut ? `(${p.rut})` : ""
                  }`,
                }))}
                value={data.patient_id}
                onChange={(val) => setData("patient_id", val)}
                className="!rounded-[1.5rem] !py-6 !px-8 shadow-xl shadow-gray-500/5"
                placeholder="Buscar Paciente..."
              />
            )}
          </div>

          {/* SESIÓN */}
          <div className="space-y-8">
            <h2 className="enterprise-label !text-brand-primary flex items-center gap-3 ml-1">
              <Calendar className="w-4 h-4" /> Parámetros de la Cita
            </h2>
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
              <SearchSelect
                label="Profesional Tratante *"
                options={formattedDoctors.map((d) => ({
                  value: d.id,
                  label: d.full_name,
                }))}
                value={data.doctor_id}
                onChange={(val) => setData("doctor_id", val)}
                disabled={!isFieldEditable("doctor_id")}
                className="!rounded-2xl"
                placeholder="Profesional Tratante *"
              />
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-1">
                  <label className="ml-1 enterprise-label opacity-60">
                    Fecha
                  </label>
                  <input
                    type="date"
                    value={data.date}
                    onChange={(e) => setData("date", e.target.value)}
                    disabled={!isFieldEditable("date")}
                    className="w-full px-5 py-4 font-mono text-sm font-black text-gray-700 border-gray-100 shadow-sm rounded-2xl bg-gray-50/50 focus:bg-white focus:ring-brand-primary"
                  />
                </div>
                <div className="space-y-1">
                  <label className="ml-1 enterprise-label opacity-60">
                    Hora
                  </label>
                  <input
                    type="time"
                    value={data.time}
                    onChange={(e) => setData("time", e.target.value)}
                    disabled={!isFieldEditable("time")}
                    className="w-full px-5 py-4 font-mono text-sm font-black text-gray-700 border-gray-100 shadow-sm rounded-2xl bg-gray-50/50 focus:bg-white focus:ring-brand-primary"
                  />
                </div>
              </div>
              <div className="md:col-span-2">
                <div
                  className={`p-6 rounded-[1.5rem] border-2 flex items-start gap-5 transition-all ${
                    currentDiagnosisName
                      ? "bg-green-50/30 border-green-100"
                      : "bg-gray-50 border-gray-100 opacity-60"
                  }`}
                >
                  <div
                    className={`p-3 rounded-xl shadow-sm ${
                      currentDiagnosisName
                        ? "bg-white text-green-600"
                        : "bg-white text-gray-300"
                    }`}
                  >
                    <Stethoscope className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <p className="enterprise-label !text-gray-400 !mb-1">
                      Protocolo Activo
                    </p>
                    <p
                      className={`text-sm font-black uppercase tracking-tight ${
                        currentDiagnosisName ? "text-gray-900" : "text-gray-400"
                      }`}
                    >
                      {currentDiagnosisName || "Sin tratamiento activo"}
                    </p>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-1">
                  <label className="ml-1 enterprise-label opacity-60">
                    Servicio
                  </label>
                  <SearchSelect
                    options={session_types.map((st) => ({
                      value: st.id,
                      label: st.name,
                    }))}
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
                    className="!rounded-2xl"
                    placeholder="Seleccionar Servicio..."
                  />
                </div>
                <div className="space-y-1">
                  <label className="ml-1 enterprise-label opacity-60">
                    Modalidad de Cobro
                  </label>
                  <select
                    value={data.consumes_plan ? "yes" : "no"}
                    onChange={(e) =>
                      setData("consumes_plan", e.target.value === "yes")
                    }
                    className="w-full px-5 py-4 text-[10px] font-black uppercase tracking-widest text-gray-700 border-gray-100 rounded-2xl bg-gray-50/50 focus:bg-white focus:ring-brand-primary"
                  >
                    <option value="no">Recaudación Directa</option>
                    <option value="yes" disabled={activePlans.length === 0}>
                      Usar Plan Activo (
                      {activePlans.length > 0 ? "Disponible" : "Sin Cupos"})
                    </option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* SOAP */}
          {["attended", "scheduled"].includes(data.status) && (
            <div className="space-y-8 duration-500 animate-in slide-in-from-bottom-4">
              <div className="flex items-center gap-3 px-1 pb-4 border-b border-gray-100">
                <div className="p-2.5 bg-green-50 rounded-xl text-green-600">
                  <ClipboardList className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-black tracking-tight text-gray-900 uppercase">
                    Evolución Clínica (SOAP)
                  </h2>
                  <p className="text-[10px] font-black text-brand-gray uppercase tracking-widest opacity-60">
                    Documentación obligatoria
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
                {/* S: SUBJECTIVE */}
                <div className="p-8 bg-white border border-gray-100 rounded-[2rem] shadow-xl shadow-gray-500/5 group hover:border-brand-primary/20 transition-all">
                  <h3 className="enterprise-label !text-brand-primary flex items-center gap-3 mb-6">
                    <User className="w-4 h-4" /> Subjetivo (S)
                  </h3>
                  <div className="p-6 mb-8 border shadow-inner bg-gray-50/50 rounded-3xl border-gray-50">
                    <div className="flex items-end justify-between px-1 mb-4">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                        Dolor (EVA)
                      </label>
                      <span
                        className={`text-2xl font-mono font-black ${
                          data.pain_level > 7
                            ? "text-red-600"
                            : "text-brand-primary"
                        }`}
                      >
                        {data.pain_level}{" "}
                        <span className="text-[10px] opacity-30 tracking-widest">
                          / 10
                        </span>
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
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-brand-primary"
                    />
                  </div>
                  <textarea
                    value={data.subjective}
                    onChange={(e) => setData("subjective", e.target.value)}
                    className="w-full text-sm font-medium border-gray-100 bg-gray-50/30 rounded-2xl py-4 px-5 focus:bg-white focus:ring-brand-primary transition-all shadow-inner min-h-[120px]"
                    placeholder="Refiere el paciente..."
                  />
                </div>
                {/* O: OBJECTIVE */}
                <div className="p-8 bg-white border border-gray-100 rounded-[2rem] shadow-xl shadow-gray-500/5 group hover:border-brand-primary/20 transition-all">
                  <h3 className="enterprise-label !text-blue-600 flex items-center gap-3 mb-6">
                    <Activity className="w-4 h-4" /> Objetivo (O)
                  </h3>
                  <div className="grid grid-cols-2 gap-4 mb-8">
                    {["flexion", "abduction"].map((romType) => (
                      <div
                        key={romType}
                        className="p-5 bg-blue-50/30 rounded-[1.5rem] border border-blue-50 shadow-inner"
                      >
                        <label className="text-[9px] font-black text-blue-600 uppercase tracking-[0.2em] block mb-4 text-center">
                          ROM: {romType}
                        </label>
                        <div className="flex items-center justify-center gap-3">
                          <input
                            type="number"
                            className="w-16 text-center font-mono font-black text-sm border-none bg-white rounded-xl py-2.5 shadow-sm focus:ring-blue-500"
                            value={
                              data.evaluation_data.rom?.[romType]?.before || ""
                            }
                            onChange={(e) =>
                              handleRomChange(romType, "before", e.target.value)
                            }
                          />
                          <ChevronRight className="w-4 h-4 text-blue-200" />
                          <input
                            type="number"
                            className="w-16 text-center font-mono font-black text-sm border-none bg-white rounded-xl py-2.5 shadow-sm focus:ring-blue-500"
                            value={
                              data.evaluation_data.rom?.[romType]?.after || ""
                            }
                            onChange={(e) =>
                              handleRomChange(romType, "after", e.target.value)
                            }
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                  <textarea
                    value={data.objective}
                    onChange={(e) => setData("objective", e.target.value)}
                    className="w-full text-sm font-medium border-gray-100 bg-gray-50/30 rounded-2xl py-4 px-5 focus:bg-white focus:ring-brand-primary transition-all shadow-inner min-h-[100px]"
                    placeholder="Hallazgos físicos..."
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* FOOTER PREMIUM */}
        <div className="sticky bottom-0 z-30 flex justify-end gap-4 p-10 border-t border-gray-100 bg-white/90 backdrop-blur-md shrink-0">
          <SecondaryButton
            onClick={() => setShowModal(false)}
            className="!px-10 !py-4"
          >
            Descartar Cambios
          </SecondaryButton>
          <PrimaryButton
            type="submit"
            disabled={processing}
            className={`!px-14 !py-4 shadow-xl ${
              isEditing
                ? "bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200"
                : "shadow-brand-primary/20"
            }`}
          >
            {processing
              ? "Sincronizando..."
              : isEditing
              ? "Actualizar Registro"
              : "Confirmar Atención"}
          </PrimaryButton>
        </div>
      </form>
    </div>
  );
}
