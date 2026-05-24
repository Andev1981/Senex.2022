import React, { useEffect, useState, useMemo } from "react";
import { useForm, router } from "@inertiajs/react";
import moment from "moment";
import {
  Activity,
  User,
  UserCheck,
  ClipboardList,
  Target,
  Plus,
  X,
  Edit3,
  Ruler,
  Dumbbell, 
  Clock,
  Calendar,
  Timer,
  MapPin,
  FileText,
  ShieldCheck
} from "lucide-react";
import SearchSelect from "@/components/SearchSelect";
import PainMapCard from "@/components/Body/PainMapCard";
import GenericModal from "@/components/Body/GenericModal";
import HandSelector from "@/components/Body/HandSelector";
import InputError from "@/components/InputError";
import Switch from "@/components/Switch";
import Swal from "sweetalert2";

const STATUS_OPTIONS = [
  { value: "scheduled", label: "📅 Programada" },
  { value: "in_progress", label: "🟡 En Curso" },
  { value: "completed", label: "✅ Completada" },
  { value: "attended", label: "✅ Asistida (Legacy)" },
  { value: "missed", label: "🚫 Faltó (Missed)" },
  { value: "cancelled", label: "❌ Cancelada" },
];

export default function SessionFormModal({
  setShowModal,
  sessionData = null,
  patients = [],
  doctors = [],
  session_types = [],
  preselectedPatient = null,
  diagnostics = [], // Recibimos el catálogo CIE-10
  isDuplicate = false,
}) {
  // --- ESTADOS LOCALES ---
  const [isHandModalOpen, setIsHandModalOpen] = useState(false);
  const [activeHandSide, setActiveHandSide] = useState('left');
  const [techniqueInput, setTechniqueInput] = useState("");
  const [newRomName, setNewRomName] = useState(""); 
  const [currentDiagnosisName, setCurrentDiagnosisName] = useState(null);

  const isEditing = !!(sessionData?.session_id || sessionData?.id) && !isDuplicate;
  const currentStatus = sessionData?.status || "scheduled";

  const formattedDoctors = useMemo(() => {
    return doctors.map((d) => ({
      ...d,
      full_name: d.full_name || `${d.name} ${d.last_name || ""}`.trim(),
    }));
  }, [doctors]);

  // Lógica para preseleccionar tratamiento activo si es una nueva sesión
  const defaultTreatmentId = useMemo(() => {
      if (sessionData?.treatment_id) return sessionData.treatment_id;
      if (sessionData?.id) return ""; // Si es edición y no tiene tratamiento, es raro pero respetamos

      // Buscar tratamiento activo en el paciente
      const patientTreatments = preselectedPatient?.active_treatments || preselectedPatient?.treatments || [];
      const active = patientTreatments.find(t => ['in_progress', 'evaluation'].includes(t.status));
      return active ? active.id : "";
  }, [sessionData, preselectedPatient]);

  // --- CONFIGURACIÓN DEL FORMULARIO ---
  const { data, setData, post, patch, processing, reset, errors } = useForm({
    id: sessionData?.session_id || sessionData?.id || "",
    treatment_id: defaultTreatmentId, 
    patient_id: sessionData?.patient_id || preselectedPatient?.id || "",
    doctor_id: sessionData?.doctor_id || "",
    item_id: sessionData?.session_type_id || sessionData?.item_id || "",
    
    // CAMPOS DE SESIÓN
    date: sessionData?.date ? moment.utc(sessionData.date).format("YYYY-MM-DD") : moment().format("YYYY-MM-DD"),
    time: sessionData?.time || "",
    duration: sessionData?.duration || 45,
    status: sessionData?.status || "scheduled",
    consumes_plan: !!sessionData?.consumes_plan,
    
    // CAMPOS PUENTE (Para crear Tratamiento Nuevo)
    diagnostic_code: "",
    referral_doctor_name: "", 
    referral_diagnosis: "",   
    total_sessions: 20,
    is_indefinite: false, // Nueva bandera
    body_part: sessionData?.body_part || "", // Nuevo campo
    laterality: sessionData?.laterality || "", // Nuevo campo

    // Mapear datos de dolor de la sesión a los iniciales del tratamiento
    initial_pain_level: sessionData?.pain_level || 0,
    initial_pain_map: sessionData?.session_pain_map || [],

    // SOAP
    pain_before: sessionData?.pain_before || sessionData?.pain_level || 0,
    pain_after: sessionData?.pain_after || 0,
    informed_consent_confirmed: !!sessionData?.informed_consent_confirmed,
    subjective: sessionData?.subjective || "",
    objective: sessionData?.objective || "",
    assessment: sessionData?.assessment || "",
    plan: sessionData?.plan || "",
    
    evaluation_data: sessionData?.evaluation_data || { rom: {} },
    
    activities_data: sessionData?.activities_data || {
      techniques: [],
      exercises: [],
    },
    session_pain_map: sessionData?.session_pain_map || [], 
    
    patient_amount_clp: sessionData?.patient_amount_clp || 0,
    patient_plan_id: sessionData?.patient_plan_id || "",
    confirm_defaults: false,
  });

  // --- SINCRONIZACIÓN DE EDICIÓN ---
  useEffect(() => {
    if (sessionData && isEditing) {
        setData(prev => ({
            ...prev,
            ...sessionData,
            id: sessionData.session_id || sessionData.id,
            status: sessionData.status,
            date: sessionData.date ? moment.utc(sessionData.date).format("YYYY-MM-DD") : prev.date,
            subjective: sessionData.subjective || "",
            objective: sessionData.objective || "",
            assessment: sessionData.assessment || "",
            plan: sessionData.plan || "",
            pain_level: sessionData.pain_level || 0,
            body_part: sessionData.body_part || "",
            laterality: sessionData.laterality || "",
        }));
    }
  }, [sessionData, isEditing]);

  // --- LÓGICA BOTÓN ---
  const submitLabel = useMemo(() => {
      if (processing) return "Procesando...";
      if (isEditing) {
          return data.status === 'completed' ? "Actualizar Registro" : "Guardar Cambios";
      }
      return "Agendar Sesión";
  }, [data.status, isEditing, processing]);

  // --- MANEJADORES ---
  const handleAddRomMetric = () => {
    if (!newRomName.trim()) return;
    const currentRom = data.evaluation_data.rom || {};
    if (currentRom[newRomName]) return; 

    setData("evaluation_data", {
        ...data.evaluation_data,
        rom: { ...currentRom, [newRomName]: { before: 0, after: 0 } }
    });
    setNewRomName(""); 
  };

  const handleDeleteRomMetric = (romName) => {
    const currentRom = { ...data.evaluation_data.rom };
    delete currentRom[romName];
    setData("evaluation_data", { ...data.evaluation_data, rom: currentRom });
  };

  const handleRomChange = (romName, moment, value) => {
    const currentRom = data.evaluation_data.rom || {};
    setData("evaluation_data", {
      ...data.evaluation_data,
      rom: {
        ...currentRom,
        [romName]: { ...currentRom[romName], [moment]: parseInt(value) || 0 },
      },
    });
  };

  const handleActivityChange = (category, item, action) => {
    const currentList = data.activities_data[category] || [];
    const newList = action === "add"
        ? [...new Set([...currentList, item])]
        : currentList.filter((i) => i !== item);
    setData("activities_data", {
      ...data.activities_data,
      [category]: newList,
    });
  };

  const handleBodyPartClick = (partId) => {
    /* 
    if (partId === 'hand_left' || partId === 'wrist_left' || partId === 'hand_L') {
        setActiveHandSide('left');
        setIsHandModalOpen(true);
    } else if (partId === 'hand_right' || partId === 'wrist_right' || partId === 'hand_R') {
        setActiveHandSide('right');
        setIsHandModalOpen(true);
    }
    */
  };

  const handleFingerSelection = (fingerId) => {
    const newPoint = { part: fingerId, x: 0, y: 0, notes: 'Detalle Dedo' };
    setData("session_pain_map", [...data.session_pain_map, newPoint]);
    setIsHandModalOpen(false);
  };

  const isClinicalTabLocked = useMemo(() => {
    if (data.status === 'scheduled') return true;
    return false;
  }, [data.status]);

  const isFieldEditable = (fieldType) => {
    if (!isEditing) return true;
    if (currentStatus === "cancelled" || currentStatus === "missed") return false;
    
    // Si la sesión está programada, solo permitimos editar campos administrativos
    if (currentStatus === "scheduled") {
        return fieldType === "admin";
    }

    if (currentStatus === "attended") return fieldType === "clinical"; 
    return true;
  };

  useEffect(() => {
    const selectedPatient = patients.find((p) => p.id === parseInt(data.patient_id)) || preselectedPatient;
    if (!selectedPatient) {
      setCurrentDiagnosisName(null);
      return;
    }
    
    // Auto-seleccionar tratamiento activo si estamos creando una nueva sesión y cambiamos de paciente
    if (!sessionData?.id) {
        const treatmentsList = selectedPatient.active_treatments || selectedPatient.treatments || [];
        const activeTreatment = treatmentsList.find(t => ['in_progress', 'evaluation'].includes(t.status));
        
        if (activeTreatment) {
            setData("treatment_id", activeTreatment.id);
        } else {
            setData("treatment_id", "");
        }
    }

  }, [data.patient_id, patients, preselectedPatient]);

   const selectedPatientFinal = useMemo(() => {
    return preselectedPatient || patients.find((p) => p.id === parseInt(data.patient_id));
  }, [preselectedPatient, data.patient_id, patients]);

  const activePlans = useMemo(() => {
    if (!selectedPatientFinal) return [];
    return selectedPatientFinal.active_plans || [];
  }, [selectedPatientFinal]);

   // Obtener el tratamiento activo seleccionado para mostrar su info
  const selectedTreatmentInfo = useMemo(() => {
      if (!data.treatment_id || !selectedPatientFinal) return null;
      const treatments = selectedPatientFinal.active_treatments || selectedPatientFinal.treatments || [];
      return treatments.find(t => t.id === parseInt(data.treatment_id));
  }, [data.treatment_id, selectedPatientFinal]);


  // Sincronizar datos cuando cambia el tratamiento seleccionado
  // Solo disparamos el efecto si el ID cambia realmente
  const treatmentIdKey = data.treatment_id;

  useEffect(() => {
      if (treatmentIdKey && selectedTreatmentInfo) {
          // Usamos una función de actualización para evitar dependencias circulares con 'data'
          setData(prev => {
              // Si ya estamos editando una sesión existente, no sobreescribimos los datos con los de la sesión anterior
              // a menos que el usuario esté cambiando de tratamiento deliberadamente (opcional, pero por ahora protegemos edición)
              const isChangingTreatment = prev.treatment_id !== sessionData?.treatment_id;
              
              const baseUpdate = {
                ...prev,
                diagnostic_code: selectedTreatmentInfo.diagnostic?.code || selectedTreatmentInfo.diagnostic_code || "",
                referral_diagnosis: selectedTreatmentInfo.referral_diagnosis || "",
                referral_doctor_name: selectedTreatmentInfo.referral_doctor_name || "",
                body_part: prev.body_part || selectedTreatmentInfo.body_part || "",
                laterality: prev.laterality || selectedTreatmentInfo.laterality || ""
              };

              // Si hay una sesión anterior, cargamos los datos clínicos para dar continuidad (Evolución)
              if (selectedTreatmentInfo.last_session && !isEditing) {
                  const last = selectedTreatmentInfo.last_session;
                  return {
                      ...baseUpdate,
                      subjective: last.subjective || "",
                      objective: last.objective || "",
                      assessment: last.assessment || "",
                      plan: last.plan || "",
                      pain_level: last.pain_level || 0,
                      session_pain_map: last.session_pain_map || [],
                      evaluation_data: last.evaluation_data || { rom: {} },
                      activities_data: last.activities_data || { techniques: [], exercises: [] },
                  };
              }

              return baseUpdate;
          });
      } else if (!treatmentIdKey && !isEditing) {
          // Si selecciona "Nuevo Tratamiento", limpiamos los campos clínicos
          setData(prev => ({
              ...prev,
              diagnostic_code: "",
              referral_diagnosis: "",
              referral_doctor_name: "",
              subjective: "",
              objective: "",
              assessment: "",
              plan: "",
              pain_level: 0,
              session_pain_map: [],
              evaluation_data: { rom: {} },
              activities_data: { techniques: [], exercises: [] },
          }));
      }
  }, [treatmentIdKey]); // Solo dependemos del ID

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!data.patient_id) return Swal.fire("Atención", "Selecciona un paciente", "warning");
    
    // Validación adicional: Si es tratamiento nuevo, el diagnóstico es obligatorio
    if (!data.treatment_id && !data.diagnostic_code) {
        return Swal.fire("Campo Requerido", "Para crear un nuevo tratamiento debes seleccionar un diagnóstico CIE-10", "error");
    }
    
    const submitOptions = {
      onSuccess: () => { 
          reset(); 
          setShowModal(false); 
      }, 
      onError: (errors) => {
          if (errors.commission_alert) {
              Swal.fire({
                  title: '⚠️ Atención: Comisión',
                  text: errors.commission_alert,
                  icon: 'warning',
                  showCancelButton: true,
                  confirmButtonColor: '#4f46e5', // brand-primary (indigo-600)
                  cancelButtonColor: '#d1d5db',
                  confirmButtonText: 'Sí, crear igualmente',
                  cancelButtonText: 'Cancelar'
              }).then((result) => {
                  if (result.isConfirmed) {
                      // Reenviar usando router.post directamente para asegurar que el payload se envía correctamente
                      router.post(route("sessions.store"), {
                          ...data,
                          confirm_defaults: true
                      }, submitOptions);
                  }
              });
          }
      },
      preserveScroll: true,
    };

    isEditing 
        ? patch(route("sessions.update", data.id), submitOptions) 
        : post(route("sessions.store"), submitOptions);
  };

 

 


  return (
    <>
    <div className="relative flex flex-col h-full bg-white">
      <form onSubmit={handleSubmit} className="flex flex-col h-full">
        
        {/* --- HEADER --- */}
        <div className={`flex flex-col justify-between gap-4 px-8 py-4 border-b border-gray-100 md:flex-row md:items-center shrink-0 transition-colors duration-500 ${isEditing ? "bg-indigo-50/50" : "bg-gray-50/50"}`}>
          <div className="flex items-center gap-4">
            <div className={`flex items-center justify-center text-white transform shadow-lg w-12 h-12 rounded-xl rotate-3 transition-colors ${isEditing ? "bg-indigo-600 shadow-indigo-200" : "bg-brand-primary shadow-brand-primary/20"}`}>
              {isEditing ? <Edit3 className="w-6 h-6" /> : <Plus className="w-6 h-6" />}
            </div>
            <div>
              <h1 className="mb-1 text-xl font-black leading-none tracking-tight text-gray-900 uppercase">
                {isEditing ? "Editar Sesión" : "Nueva Sesión"}
              </h1>
              <p className="text-[10px] font-black text-brand-gray uppercase tracking-[0.2em]">
                {isEditing ? `ID: #${data.id}` : "Ingreso de Atención"}
              </p>
            </div>
          </div>

          <div className="flex flex-col w-full gap-1 md:w-56">
            <label className="ml-1 enterprise-label opacity-60">Estado Actual</label>
            <select
              value={data.status}
              onChange={(e) => setData("status", e.target.value)}
              className="w-full text-[10px] font-black uppercase tracking-widest border-gray-100 rounded-xl bg-white focus:ring-brand-primary transition-all py-2.5 shadow-sm cursor-pointer"
            >
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* --- CUERPO --- */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-8 space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                {/* === COLUMNA IZQUIERDA (7/12) === */}
                <div className="lg:col-span-7 space-y-8">
                    
                    {/* 1. DATOS ADMINISTRATIVOS */}
                    <div className="bg-white border border-gray-100 rounded-[2rem] p-8 shadow-xl shadow-gray-500/5 group hover:border-brand-primary/20 transition-all space-y-6">
                        <div className="flex items-center gap-3">
                            <UserCheck className="w-5 h-5 text-brand-primary"/>
                            <h3 className="enterprise-label text-brand-primary!">Datos Administrativos</h3>
                        </div>

                        {/* A) SELECCIÓN DE PACIENTE */}
                        {!selectedPatientFinal ? (
                            <SearchSelect
                                label="Paciente *"
                                options={patients.map((p) => ({ value: p.id, label: `${p.full_name || `${p.name} ${p.last_name}`} (${p.rut})` }))}
                                value={data.patient_id}
                                onChange={(val) => {
                                    setData(prev => ({ ...prev, patient_id: val, treatment_id: "" })); // Reset tratamiento
                                }}
                                placeholder="Buscar Paciente..."
                                className="rounded-2xl!"
                            />
                        ) : (
                            <div className="space-y-3">
                                <div className="flex items-center justify-between py-2 px-6 bg-gray-50/50 rounded-2xl border border-gray-100 shadow-inner">
                                    <div>
                                        <p className="text-sm font-black text-gray-800 uppercase tracking-wide">{selectedPatientFinal.full_name || `${selectedPatientFinal.name} ${selectedPatientFinal.last_name}`}</p>
                                        <p className="text-[11px] font-black uppercase tracking-wide mt-1 text-gray-400">{selectedPatientFinal.rut}</p>
                                    </div>
                                    {!preselectedPatient && !isEditing && (
                                        <button type="button" onClick={() => setData("patient_id", "")} className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"><X className="w-5 h-5"/></button>
                                    )}
                                </div>

                                {/* Alerta de Tratamiento Activo en Modal de Inicio */}
                                {selectedPatientFinal?.active_treatments?.length > 0 && (
                                    <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-2xl flex items-start gap-3 animate-in fade-in">
                                        <Activity className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" />
                                        <div>
                                            <p className="text-[10px] font-black text-indigo-700 uppercase tracking-widest leading-tight mb-1">
                                                Paciente con Tratamiento en Curso
                                            </p>
                                            <ul className="text-[9px] font-bold text-indigo-600/80 list-disc list-inside">
                                                {selectedPatientFinal.active_treatments.map(t => (
                                                    <li key={t.id}>{t.description || 'Kinesiología'}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                        <InputError message={errors.patient_id} className="mt-1" />

                        {/* B) CONTEXTO CLÍNICO (SELECTOR DE TRATAMIENTO + DATOS) */}
                        {selectedPatientFinal && (
                            <div className="space-y-2 pt-2 border-t border-gray-50 animate-in fade-in slide-in-from-top-2">
                                
                                <div className="space-y-1">
                                    <label className="ml-1 flex-1 enterprise-label flex items-center gap-1">
                                        <Activity className="w-3 h-3"/> Contexto / Tratamiento
                                    </label>
                                    <select
                                        value={data.treatment_id}
                                        onChange={(e) => setData("treatment_id", e.target.value)}
                                        className="w-full px-4 py-3 font-mono text-xs font-bold text-gray-700 border-purple-100 bg-purple-50/10 rounded-xl focus:ring-purple-200 cursor-pointer"
                                        disabled={!isFieldEditable("context")} 
                                    >
                                        <option value="">✨ Nuevo Tratamiento / Evaluación Inicial</option>
                                        {(selectedPatientFinal.active_treatments || selectedPatientFinal.treatments || []).map((t) => (
                                            <option key={t.id} value={t.id}>
                                                {t.status === 'completed' ? '🏁 (CERRADO) ' : ''}
                                                {t.diagnostic?.code ? `[${t.diagnostic.code}] ` : ''} 
                                                {t.diagnostic?.description || t.referral_diagnosis || "Tratamiento sin nombre"} 
                                                {' '} — (Sesión {t.completed_sessions}/{t.is_indefinite ? '∞' : t.total_sessions})
                                            </option>
                                        ))}
                                    </select>
                                    <InputError message={errors.treatment_id} className="mt-1" />
                                </div>

                                {/* CASO 1: NUEVO TRATAMIENTO (INPUTS HABILITADOS) */}
                                {!data.treatment_id && (
                                    <div className="p-5 bg-purple-50 rounded-2xl border border-purple-100 animate-in zoom-in duration-200 relative overflow-hidden">
                                        <div className="relative z-10">
                                            <div className="flex items-center gap-2 mb-3">
                                                <div className="p-1.5 bg-white text-purple-600 rounded-lg shadow-sm"><ClipboardList className="w-4 h-4" /></div>
                                                <h4 className="text-xs font-black text-purple-800 uppercase tracking-wide">Apertura de Expediente</h4>
                                            </div>
                                            <div className="space-y-4">
                                                <div>
                                                    <SearchSelect
                                                        label="Diagnóstico Kinésico (CIE-10) *"
                                                        placeholder="Buscar patología (Ej: M54.5 Lumbago)..."
                                                        options={diagnostics.map(d => ({ value: d.code, label: `${d.code} - ${d.description}` }))}
                                                        value={data.diagnostic_code}
                                                        onChange={(val) => setData("diagnostic_code", val)}
                                                        className="bg-white!"
                                                    />
                                                    <InputError message={errors.diagnostic_code} className="mt-1" />
                                                </div>
                                                <div className="grid grid-cols-4 gap-3">
                                                    <div className="col-span-2 space-y-1">
                                                        <label className="ml-1 enterprise-label text-purple-700 text-[10px]">Médico Derivante</label>
                                                        <input type="text" placeholder="Ej: Dr. Juan Pérez" value={data.referral_doctor_name} onChange={(e) => setData("referral_doctor_name", e.target.value)} className="w-full px-3 py-2.5 text-xs font-bold border-purple-100 bg-white rounded-xl focus:ring-purple-200 transition-all"/>
                                                        <InputError message={errors.referral_doctor_name} className="mt-1" />
                                                    </div>
                                                    <div className="space-y-1">
                                                        <label className="ml-1 enterprise-label text-purple-700 text-[10px]">Nº Sesiones</label>
                                                        <input 
                                                            type={data.is_indefinite ? "text" : "number"} 
                                                            placeholder="10" 
                                                            disabled={data.is_indefinite}
                                                            value={data.is_indefinite ? "∞" : data.total_sessions} 
                                                            onChange={(e) => setData("total_sessions", e.target.value)} 
                                                            className={`w-full px-3 py-2.5 text-xs font-bold border-purple-100 rounded-xl focus:ring-purple-200 transition-all text-center ${data.is_indefinite ? 'bg-purple-50 text-purple-600 text-lg leading-none' : 'bg-white'}`}
                                                        />
                                                        <InputError message={errors.total_sessions} className="mt-1" />
                                                    </div>
                                                    <div className="space-y-1 flex flex-col justify-center items-center">
                                                        <label className="enterprise-label text-purple-700 text-[8px] uppercase mb-1">Indefinido</label>
                                                        <Switch 
                                                            checked={data.is_indefinite} 
                                                            onChange={(e) => setData("is_indefinite", e.target.checked)} 
                                                        />
                                                    </div>
                                                    <div className="col-span-3 space-y-1">
                                                        <label className="ml-1 enterprise-label text-purple-700 text-[10px]">Diagnóstico Médico (Texto Orden)</label>
                                                        <input type="text" placeholder="Lo que dice el papel..." value={data.referral_diagnosis} onChange={(e) => setData("referral_diagnosis", e.target.value)} className="w-full px-3 py-2.5 text-xs font-medium border-purple-100 bg-white rounded-xl focus:ring-purple-200 transition-all"/>
                                                        <InputError message={errors.referral_diagnosis} className="mt-1" />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* CASO 2: TRATAMIENTO EXISTENTE (INFO DE SOLO LECTURA) */}
                                {selectedTreatmentInfo && (
                                    <div className="p-5 bg-blue-50/50 rounded-2xl border border-blue-100 animate-in zoom-in duration-200">
                                        <div className="flex items-center gap-2 mb-3">
                                            <div className="p-1.5 bg-white text-blue-600 rounded-lg shadow-sm"><FileText className="w-4 h-4" /></div>
                                            <h4 className="text-xs font-black text-blue-800 uppercase tracking-wide">Información de la Orden</h4>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4 text-xs">
                                            <div>
                                                <p className="text-[9px] font-bold text-blue-400 uppercase">Médico Derivante</p>
                                                <p className="font-bold text-gray-700">{selectedTreatmentInfo.referral_doctor_name || "No registrado"}</p>
                                            </div>
                                            <div>
                                                <p className="text-[9px] font-bold text-blue-400 uppercase">Progreso</p>
                                                <div className="flex flex-col gap-1">
                                                    <p className={`font-bold ${!selectedTreatmentInfo.is_indefinite && selectedTreatmentInfo.completed_sessions >= selectedTreatmentInfo.total_sessions ? 'text-red-600' : 'text-gray-700'}`}>
                                                        Sesión {selectedTreatmentInfo.completed_sessions} de {selectedTreatmentInfo.is_indefinite ? '∞' : selectedTreatmentInfo.total_sessions}
                                                    </p>
                                                    
                                                    {/* Mostrar alerta y botón si no es indefinido y hay sobrecupo */}
                                                    {!selectedTreatmentInfo.is_indefinite && selectedTreatmentInfo.completed_sessions >= selectedTreatmentInfo.total_sessions && (
                                                        <div className="flex items-center gap-2 mt-1">
                                                            <span className="text-[8px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded font-black uppercase animate-pulse">Cupo Agotado</span>
                                                            <button 
                                                                type="button"
                                                                onClick={() => {
                                                                    const newTotal = Number(selectedTreatmentInfo.total_sessions) + 5;
                                                                    router.patch(route('treatments.update', selectedTreatmentInfo.id), {
                                                                        total_sessions: newTotal,
                                                                        status: 'in_progress'
                                                                    }, {
                                                                        preserveScroll: true,
                                                                        onSuccess: () => Swal.fire('¡Cupo Ampliado!', `El tratamiento ahora permite ${newTotal} sesiones.`, 'success')
                                                                    });
                                                                }}
                                                                className="text-[8px] bg-brand-primary text-white px-2 py-1 rounded-md font-black uppercase hover:brightness-110 transition-all shadow-sm active:scale-95"
                                                            >
                                                                +5 Sesiones
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="col-span-2">
                                                <p className="text-[9px] font-bold text-blue-400 uppercase">Diagnóstico Médico</p>
                                                <p className="font-medium text-gray-600 italic bg-white px-2 py-1 rounded border border-blue-50 mt-1">
                                                    "{selectedTreatmentInfo.referral_diagnosis || "Sin detalle"}"
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* C) DATOS DE AGENDA (Kine, Servicio, Fecha...) */}
                        <div className="space-y-6 pt-6 border-t border-gray-50">
                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <SearchSelect
                                        label="Kinesiólogo *"
                                        options={formattedDoctors.map((d) => ({ value: d.id, label: d.full_name }))}
                                        value={data.doctor_id}
                                        onChange={(val) => setData("doctor_id", val)}
                                        disabled={!isFieldEditable("doctor_id")}
                                        className="rounded-2xl!"
                                    />
                                    <InputError message={errors.doctor_id} className="mt-1" />
                                </div>
                                <div className="space-y-1">
                                        <label className="ml-1 enterprise-label opacity-60 text-[10px]">Tipo de Servicio</label>
                                        <SearchSelect
                                            options={session_types.map((st) => ({ value: st.id, label: st.name }))}
                                            value={data.item_id}
                                            onChange={(val) => {
                                                const type = session_types.find((t) => t.id === val);
                                                setData((prev) => ({
                                                    ...prev,
                                                    item_id: val,
                                                    patient_amount_clp: type ? Number(type.base_price_clp) : 0,
                                                }));
                                            }}
                                            disabled={!isFieldEditable("context")}
                                            placeholder="Seleccionar..."
                                            className="rounded-xl!"
                                        />
                                        <InputError message={errors.item_id} className="mt-1" />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-1">
                                    <label className="ml-1 enterprise-label opacity-60 text-[10px]">Modalidad de Cobro</label>
                                    <select
                                        value={data.consumes_plan ? "yes" : "no"}
                                        onChange={(e) => setData("consumes_plan", e.target.value === "yes")}
                                        className="w-full px-5 py-4 font-black uppercase tracking-widest text-[10px] text-gray-700 border-gray-100 shadow-sm rounded-2xl bg-white focus:ring-brand-primary transition-all cursor-pointer"
                                        disabled={!isFieldEditable("context")}
                                    >
                                        <option value="no">💵 Pago Directo / Caja</option>
                                        <option value="yes" disabled={activePlans.length === 0}>
                                            🎫 Consumir Plan ({activePlans.length > 0 ? "Disponible" : "Sin Saldo"})
                                        </option>
                                    </select>
                                </div>

                                {data.consumes_plan && activePlans.length > 0 && (
                                    <div className="space-y-1 animate-in slide-in-from-left-2">
                                        <label className="ml-1 enterprise-label text-brand-primary! text-[10px]">Plan a Descontar</label>
                                        <select
                                            value={data.patient_plan_id}
                                            onChange={(e) => setData("patient_plan_id", e.target.value)}
                                            className="w-full px-5 py-4 font-mono text-[10px] font-black text-brand-primary border-brand-primary/20 bg-brand-primary/5 rounded-2xl focus:ring-brand-primary transition-all"
                                        >
                                            <option value="">-- Seleccionar Plan --</option>
                                            {activePlans.map(p => (
                                                <option key={p.id} value={p.id}>
                                                    {p.plan_name} ({p.sessions_remaining} disp.)
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                )}
                            </div>
                          

                            <div className="grid grid-cols-3 gap-6 p-8 bg-gray-50/50 rounded-[2.5rem] border-2 border-dashed border-gray-100">
                                <div className="space-y-2">
                                    <label className="ml-1 enterprise-label text-gray-400 text-[10px] flex items-center gap-2">
                                        <Calendar className="w-3 h-3"/> Fecha de Atención
                                    </label>
                                    <input 
                                        type="date" 
                                        value={data.date} 
                                        onChange={(e) => setData("date", e.target.value)} 
                                        disabled={!isFieldEditable("date")} 
                                        className="w-full font-mono text-sm font-black py-4! px-6! rounded-2xl border-none shadow-sm focus:ring-4 focus:ring-brand-primary/10 transition-all"
                                    />
                                    <InputError message={errors.date} className="mt-1" />
                                </div>
                                <div className="space-y-2">
                                    <label className="ml-1 enterprise-label text-gray-400 text-[10px] flex items-center gap-2">
                                        <Clock className="w-3 h-3"/> Hora Inicio
                                    </label>
                                    <input 
                                        type="time" 
                                        value={data.time} 
                                        onChange={(e) => setData("time", e.target.value)} 
                                        disabled={!isFieldEditable("time")} 
                                        className="w-full font-mono text-sm font-black py-4! px-6! rounded-2xl border-none shadow-sm focus:ring-4 focus:ring-brand-primary/10 transition-all"
                                    />
                                    <InputError message={errors.time} className="mt-1" />
                                </div>
                                
                                <div className="space-y-2">
                                    <label className="ml-1 enterprise-label text-gray-400 text-[10px] flex items-center gap-2">
                                        <Timer className="w-3 h-3"/> Duración
                                    </label>
                                    <div className="relative">
                                        <input 
                                            type="number" 
                                            value={data.duration} 
                                            onChange={(e) => setData("duration", e.target.value)} 
                                            disabled={!isFieldEditable("time")} 
                                            className="w-full font-mono text-sm font-black py-4! px-6! pr-12! rounded-2xl border-none shadow-sm focus:ring-4 focus:ring-brand-primary/10 transition-all"
                                            placeholder="45"
                                        />
                                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-gray-300 uppercase">Min</span>
                                    </div>
                                    <InputError message={errors.duration} className="mt-1" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 2. SOAP */}
                    {["attended", "scheduled", "completed", "in_progress"].includes(data.status) && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            
                            {/* Biometría & Rangos (ROM) - Movido arriba */}
                            <div className="bg-white border border-gray-100 rounded-[2rem] p-8 shadow-xl shadow-gray-500/5 group hover:border-brand-primary/20 transition-all">
                                <h3 className="enterprise-label text-slate-500! flex gap-2 mb-6"><Ruler className="w-4 h-4"/> Biometría & Rangos (ROM)</h3>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mb-6">
                                    {data.evaluation_data.rom && Object.keys(data.evaluation_data.rom).length > 0 ? (
                                        Object.keys(data.evaluation_data.rom).map((romName) => (
                                            <div key={romName} className="bg-gray-50 p-4 rounded-2xl border border-gray-100 text-center relative group hover:bg-white hover:shadow-lg hover:border-gray-200 transition-all">
                                                <button type="button" onClick={() => handleDeleteRomMetric(romName)} className="absolute -top-2 -right-2 bg-white text-gray-300 hover:text-red-500 p-1 rounded-full shadow-sm border border-gray-100 opacity-0 group-hover:opacity-100 transition-all"><X className="w-3 h-3" /></button>
                                                <p className="text-[10px] font-black uppercase text-gray-600 mb-3 truncate px-2 tracking-wide">{romName}</p>
                                                <div className="flex justify-center items-center gap-3">
                                                    <div className="flex flex-col gap-1"><span className="text-[8px] font-black text-gray-400 uppercase">INI</span><input type="number" className="w-14 h-10 text-center text-sm font-black border-none bg-white rounded-xl shadow-sm focus:ring-2 focus:ring-brand-primary/20" placeholder="0°" value={data.evaluation_data.rom[romName]?.before || ""} onChange={(e) => handleRomChange(romName, "before", e.target.value)}/></div>
                                                    <span className="text-gray-300 text-lg">›</span>
                                                    <div className="flex flex-col gap-1"><span className="text-[8px] font-black text-brand-primary uppercase">FIN</span><input type="number" className="w-14 h-10 text-center text-sm font-black border border-brand-primary/20 bg-brand-primary/5 text-brand-primary rounded-xl shadow-sm focus:ring-2 focus:ring-brand-primary/20" placeholder="0°" value={data.evaluation_data.rom[romName]?.after || ""} onChange={(e) => handleRomChange(romName, "after", e.target.value)}/></div>
                                                </div>
                                            </div>
                                        ))
                                    ) : (<div className="col-span-full text-center py-8 text-xs text-gray-400 font-medium italic bg-gray-50/30 rounded-2xl border border-dashed border-gray-200">No hay mediciones registradas aún</div>)}
                                </div>
                                <div className="flex gap-4 pt-6 border-t border-gray-50">
                                    <input type="text" value={newRomName} onChange={(e) => setNewRomName(e.target.value)} onKeyDown={(e) => { if(e.key === 'Enter') { e.preventDefault(); handleAddRomMetric(); } }} className="w-full px-5 py-3 text-xs font-bold border-gray-100 bg-gray-50 rounded-2xl focus:bg-white focus:ring-brand-primary transition-all shadow-inner" placeholder="Nueva medición (ej: Flexión Hombro, Rot. Ext)..." />
                                    <button type="button" onClick={handleAddRomMetric} className="bg-slate-800 text-white px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-wider hover:bg-slate-700 transition-all shadow-lg shadow-slate-200 hover:shadow-xl active:scale-95">+ Agregar</button>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="bg-white border border-gray-100 rounded-[2rem] p-8 shadow-xl shadow-gray-500/5 group hover:border-blue-200 transition-all flex flex-col">
                                    <h3 className="enterprise-label text-blue-600! flex gap-2 mb-4"><User className="w-4 h-4"/> [S] Subjetivo</h3>
                                    <textarea 
                                        value={data.subjective} 
                                        onChange={(e) => setData("subjective", e.target.value)} 
                                        rows={4}
                                        className="w-full flex-1 text-sm font-medium border-blue-100 bg-blue-50/10 rounded-2xl py-4 px-5 focus:bg-white focus:ring-blue-500 transition-all shadow-inner resize-none"
                                        placeholder="Relato del paciente..."
                                    />
                                </div>
                                <div className="bg-white border border-gray-100 rounded-[2rem] p-8 shadow-xl shadow-gray-500/5 group hover:border-purple-200 transition-all flex flex-col">
                                    <h3 className="enterprise-label text-purple-600! flex gap-2 mb-4"><Activity className="w-4 h-4"/> [O] Examen Físico</h3>
                                    <textarea 
                                        value={data.objective} 
                                        onChange={(e) => setData("objective", e.target.value)} 
                                        rows={4}
                                        className="w-full flex-1 text-sm font-medium border-purple-100 bg-purple-50/10 rounded-2xl py-4 px-5 focus:bg-white focus:ring-purple-500 transition-all shadow-inner resize-none"
                                        placeholder="Palpación, observación..."
                                    />
                                </div>
                            </div>

                            <div className="bg-white border border-gray-100 rounded-[2rem] p-8 shadow-xl shadow-gray-500/5 group hover:border-brand-primary/20 transition-all space-y-8">
                                <div>
                                    <h3 className="enterprise-label text-orange-600! flex gap-2 mb-4"><ClipboardList className="w-4 h-4"/> [A] Análisis / Evaluación</h3>
                                    <textarea value={data.assessment} onChange={(e) => setData("assessment", e.target.value)} rows={3} className="w-full text-sm font-medium border-orange-100 bg-orange-50/10 rounded-2xl py-4 px-5 focus:bg-white focus:ring-orange-200 transition-all shadow-inner resize-none" placeholder="Interpretación profesional de la evolución..." />
                                </div>
                                <div className="pt-8 border-t border-gray-50">
                                    <h3 className="enterprise-label text-green-600! flex gap-2 mb-6"><Target className="w-4 h-4"/> [P] Plan de Tratamiento</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="bg-gray-50 p-6 rounded-[1.5rem] border border-gray-100">
                                            <label className="enterprise-label text-gray-500 mb-4 flex items-center gap-2"><Dumbbell className="w-3 h-3"/> Procedimientos / Técnicas</label>
                                            <div className="flex gap-2 mb-4">
                                                <input type="text" value={techniqueInput} onChange={(e) => setTechniqueInput(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleActivityChange("techniques", techniqueInput, "add"); setTechniqueInput(""); }}} className="w-full px-4 py-3 text-xs font-bold border-gray-200 bg-white rounded-xl focus:ring-brand-primary transition-all shadow-sm" placeholder="Ej: Masaje, TENS..." />
                                                <button type="button" onClick={() => { handleActivityChange("techniques", techniqueInput, "add"); setTechniqueInput(""); }} className="bg-green-100 text-green-700 px-4 rounded-xl hover:bg-green-200 hover:shadow-md transition-all"><Plus className="w-5 h-5"/></button>
                                            </div>
                                            <div className="flex flex-wrap gap-2">
                                                {data.activities_data.techniques?.map((t, i) => (
                                                    <span key={i} className="bg-green-50 text-green-700 text-[10px] px-3 py-1.5 rounded-xl border border-green-100 flex items-center gap-2 font-bold shadow-sm uppercase tracking-wide group hover:bg-green-100 transition-colors">
                                                        {t} 
                                                        <button 
                                                            type="button" 
                                                            onClick={() => handleActivityChange("techniques", t, "remove")}
                                                            className="p-0.5 rounded-full hover:bg-green-200 text-green-400 hover:text-green-800 transition-all"
                                                        >
                                                            <X className="w-3 h-3"/>
                                                        </button>
                                                    </span>
                                                ))}
                                                {(!data.activities_data.techniques || data.activities_data.techniques.length === 0) && <span className="text-[10px] text-gray-400 italic font-medium">Sin procedimientos registrados</span>}
                                            </div>
                                        </div>
                                        <div className="flex flex-col">
                                            <label className="enterprise-label text-gray-500 mb-4 block">Indicaciones / Tareas Hogar</label>
                                            <textarea value={data.plan} onChange={(e) => setData("plan", e.target.value)} rows={5} className="w-full flex-1 text-sm font-medium border-green-100 bg-green-50/10 rounded-2xl py-4 px-5 focus:bg-white focus:ring-green-500 transition-all shadow-inner resize-none" placeholder="Ej: Realizar 3 series de 10 repeticiones..." />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* === COLUMNA DERECHA (5/12) === */}
                <div className="lg:col-span-5 space-y-6">
                    <div className="sticky top-0 space-y-6">
                        <PainMapCard
                            points={data.session_pain_map}
                            painLevel={data.pain_level}
                            painBefore={data.pain_before}
                            painAfter={data.pain_after}
                            bodyPart={data.body_part} 
                            laterality={data.laterality} 
                            isLocked={!isFieldEditable("clinical")} 
                            title="Evolución de Dolor"
                            onPointsChange={(val) => {
                                setData(prev => ({ 
                                    ...prev, 
                                    session_pain_map: val,
                                    initial_pain_map: !prev.treatment_id ? val : prev.initial_pain_map
                                }));
                            }}
                            onPainBeforeChange={(val) => setData("pain_before", val)}
                            onPainAfterChange={(val) => setData("pain_after", val)}
                            onPainLevelChange={(val) => {
                                setData(prev => ({ 
                                    ...prev, 
                                    pain_level: val,
                                    pain_before: val, // Sync for legacy
                                    initial_pain_level: !prev.treatment_id ? val : prev.initial_pain_level
                                }));
                            }}
                            onBodyPartChange={(val) => setData("body_part", val)} 
                            onLateralityChange={(val) => setData("laterality", val)} 
                            onBodyPartClick={handleBodyPartClick}
                        />

                        {/* CONSENTIMIENTO INFORMADO */}
                        <div className={`p-6 rounded-[2rem] border transition-all ${data.informed_consent_confirmed ? 'bg-green-50 border-green-200' : 'bg-orange-50 border-orange-200'}`}>
                            <div className="flex items-center justify-between gap-4">
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-xl ${data.informed_consent_confirmed ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                                        <ShieldCheck className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black uppercase text-gray-900 tracking-widest">Consentimiento Informado</p>
                                        <p className="text-[8px] font-bold text-gray-500 uppercase">Validación legal de la atención</p>
                                    </div>
                                </div>
                                <Switch 
                                    checked={data.informed_consent_confirmed} 
                                    onChange={(e) => setData("informed_consent_confirmed", e.target.checked)} 
                                    disabled={!isFieldEditable("clinical")}
                                />
                            </div>
                            {errors.informed_consent_confirmed && <p className="text-[9px] text-red-500 font-bold mt-2 uppercase">{errors.informed_consent_confirmed}</p>}
                        </div>
                    </div>
                </div>

            </div>
        </div>

        {/* --- FOOTER UNIFICADO --- */}
        <div className="flex justify-end gap-3 px-8 py-4 border-t border-gray-100 bg-white z-20 shrink-0">
            <button type="button" onClick={() => setShowModal(false)} className="cursor-pointer px-6 py-3 text-[10px] font-black uppercase tracking-widest text-brand-gray hover:bg-gray-50 rounded-xl transition-all" disabled={processing}>Cancelar</button>
            <button type="submit" className="px-10 py-3 text-[10px] font-black uppercase tracking-[0.2em] text-white bg-brand-primary rounded-xl shadow-lg shadow-brand-primary/20 hover:brightness-110 disabled:opacity-50 transition-all active:scale-95 transform cursor-pointer" disabled={processing}>{submitLabel}</button>
        </div>

      </form>
    </div>

    <GenericModal isOpen={isHandModalOpen} onClose={() => setIsHandModalOpen(false)}>
        <HandSelector side={activeHandSide} onChange={handleFingerSelection} onClose={() => setIsHandModalOpen(false)} />
    </GenericModal>
    </>
  );
}