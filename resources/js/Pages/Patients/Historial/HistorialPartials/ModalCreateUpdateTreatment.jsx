import React, { useState } from "react";
import {
  Stethoscope,
  ClipboardList,
  AlertCircle,
  MapPin,
  Activity,
  FileText,
  Target,
  Calendar,
  Clock
} from "lucide-react";
import SearchSelect from "@/Components/SearchSelect";
import PainMapCard from "@/Components/Body/PainMapCard";
import { useForm } from "@inertiajs/react";
import { fmtDateISO } from "@/utils/utils";
import { TREATMENT_CURRENT_PHASE_OPTIONS } from "@/constants/treatmentCurrentPhases"; // Asegúrate de tener esto importado

export default function ModalCreateUpdateTreatment({
  patient,
  selectedTreatment,
  doctors,
  setOpenTreatmentModal,
  diagnostics,
}) {
  // --- ESTADOS PARA EL MODAL DE MANOS ---
  const [isHandModalOpen, setIsHandModalOpen] = useState(false);
  const [activeHandSide, setActiveHandSide] = useState('left');

  const isEditing = !!selectedTreatment?.id;

  // --- FORMULARIO COMPLETO (TODOS LOS CAMPOS RESTAURADOS) ---
  const { data, setData, errors, post, patch, reset, processing } = useForm({
    id: selectedTreatment?.id ?? null,
    session_type_id: 1,
    patient_id: patient?.id ?? null,
    doctor_id: selectedTreatment?.doctor_id ?? null,
    diagnostic_code: selectedTreatment?.diagnostic_code ?? null,
    additional_diagnoses: selectedTreatment?.additional_diagnoses ?? [],

    // Derivación
    referral_doctor_name: selectedTreatment?.referral_doctor_name ?? "",
    referral_diagnosis: selectedTreatment?.referral_diagnosis ?? "",
    referral_date: selectedTreatment?.referral_date ?? null,

    // Datos Clínicos
    body_part: selectedTreatment?.body_part ?? "",
    laterality: selectedTreatment?.laterality ?? "",
    initial_pain_level: selectedTreatment?.initial_pain_level ?? "",
    initial_pain_map: selectedTreatment?.initial_pain_map || [], 

    description: selectedTreatment?.description ?? "",
    start_date: selectedTreatment?.start_date ?? null,
    end_date: selectedTreatment?.end_date ?? null, // Restaurado
    status: selectedTreatment?.status ?? "evaluation",

    // Planificación
    total_sessions: selectedTreatment?.total_sessions ?? "",
    completed_sessions: selectedTreatment?.completed_sessions ?? 0, // Restaurado (informativo)
    frequency: selectedTreatment?.frequency ?? "", // Restaurado
    frequency_time: selectedTreatment?.frequency_time ?? "week", // Restaurado (default week)
    is_indefinite: selectedTreatment?.is_indefinite ?? false,
    
    current_phase: selectedTreatment?.current_phase ?? "evaluation", // Restaurado
    
    objectives: Array.isArray(selectedTreatment?.objectives)
      ? (selectedTreatment?.objectives).join(", ")
      : selectedTreatment?.objectives ?? "",

    // Resultados (Outcome)
    outcome: selectedTreatment?.outcome ?? "",
    pain_reduction: selectedTreatment?.pain_reduction ?? "",
    mobility_improvement: selectedTreatment?.mobility_improvement ?? "",
    strength_gain: selectedTreatment?.strength_gain ?? "", // Restaurado
  });

  const statusOptions = [
    { value: "evaluation", label: "Evaluación Inicial 📝" },
    { value: "in_progress", label: "En Progreso ⏳" },
    { value: "completed", label: "Completado ✅" },
    { value: "paused", label: "Pausado ⏸️" },
    { value: "cancelled", label: "Cancelado 🛑" },
  ];

  const frequencyTimeOptions = [
      { value: 'week', label: 'Veces por Semana' },
      { value: 'month', label: 'Veces por Mes' },
      { value: 'total', label: 'Total en el ciclo' },
  ];

  const fixedStates = ["completed", "cancelled", "paused"];
  const isLocked = isEditing && fixedStates.includes(data.status);

  // --- MANEJADORES ---
  const handleBodyPartClick = (partId) => {
      // Mapeo de IDs del SVG a la lógica de manos
      // Asegúrate que tu SVG use 'wrist_L', 'hand_L' etc. o ajusta estos strings
      if (partId === 'hand_L' || partId === 'wrist_L' || partId === 'hand_left') {
          setActiveHandSide('left');
          setIsHandModalOpen(true);
      } else if (partId === 'hand_R' || partId === 'wrist_R' || partId === 'hand_right') {
          setActiveHandSide('right');
          setIsHandModalOpen(true);
      }
  };

  const handleFingerSelection = (fingerId) => {
      // Aquí agregas lógica si quieres guardar el dedo específico
      console.log("Dedo seleccionado:", fingerId);
      // Podrías agregar notas al mapa de dolor o al texto de la zona
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const opts = {
      preserveScroll: true,
      onSuccess: () => { reset(); setOpenTreatmentModal(false); },
      onError: () => {
        // Foco en el primer error (opcional)
        const firstError = Object.keys(errors)[0];
        const element = document.getElementsByName(firstError)[0];
        if (element) element.focus();
      }
    };
    if (isEditing) patch(route("treatments.update", selectedTreatment.id), opts);
    else post(route("treatments.store", patient.id), opts);
  };

  return (
    <div className="relative flex flex-col h-full bg-white">
    <form
      onSubmit={handleSubmit}
      className="flex flex-col h-full"
    >
      {/* HEADER HERO DISTINTIVO */}
      <div className={`flex flex-col justify-between gap-6 p-10 border-b border-gray-100 md:flex-row md:items-center shrink-0 transition-colors duration-500 ${isEditing ? "bg-indigo-50/50" : "bg-gray-50/50"}`}>
        <div className="flex items-center gap-4">
            <div className={`flex items-center justify-center text-white transform shadow-xl w-14 h-14 rounded-2xl rotate-3 transition-colors ${isEditing ? "bg-indigo-600 shadow-indigo-200" : "bg-brand-primary shadow-brand-primary/20"}`}>
                {isEditing ? <Activity className="w-7 h-7" /> : <ClipboardList className="w-7 h-7" />}
            </div>
            <div>
            <h1 className="mb-1 text-2xl font-black leading-none tracking-tight text-gray-900 uppercase">
                {isEditing ? "Gestión de Tratamiento" : "Nuevo Ingreso Clínico"}
            </h1>
            <p className="text-[10px] font-black text-brand-gray uppercase tracking-[0.2em]">
                Paciente: <span className="text-brand-primary">{patient?.name} {patient?.last_name}</span>
            </p>
            </div>
        </div>
        <div className="flex flex-col w-full gap-1 md:w-64">
             <label className="ml-1 enterprise-label opacity-60">Estado Actual</label>
             <select
                value={data.status}
                onChange={(e) => setData("status", e.target.value)}
                className={`w-full text-[10px] font-black uppercase tracking-widest border-gray-100 rounded-xl focus:ring-brand-primary transition-all py-3 shadow-sm cursor-pointer ${isLocked ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'}`}
             >
                {statusOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
             </select>
        </div>
      </div>

      {/* --- CONTENT SCROLLABLE --- */}
      <div className="flex-1 p-10 space-y-8 overflow-y-auto custom-scrollbar">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* === COLUMNA IZQUIERDA (7/12) === */}
            <div className="lg:col-span-7 space-y-8">
                
                {/* 1. Panel de Planificación */}
                <div className="p-8 bg-white border border-gray-100 rounded-[2rem] shadow-xl shadow-gray-500/5 group hover:border-brand-primary/20 transition-all">
                    <h3 className="enterprise-label !text-brand-primary flex items-center gap-2 mb-6">
                        <Calendar className="w-4 h-4"/> Planificación del Tratamiento
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Especialista */}
                        <div className="md:col-span-2">
                            <SearchSelect
                                label="Especialista Responsable"
                                options={doctors.map(d => ({ value: d.id, label: `${d.name} ${d.last_name}` }))}
                                value={data?.doctor_id}
                                onChange={(value) => setData("doctor_id", value)}
                                placeholder="Seleccionar Kinesiólogo..."
                                className="!rounded-2xl"
                                disabled={isLocked}
                                error={errors.doctor_id}
                            />
                        </div>

                        {/* Fechas */}
                        <div className="space-y-1">
                            <label className="ml-1 enterprise-label opacity-60">Fecha Inicio</label>
                            <input 
                                type="date" 
                                value={fmtDateISO(data.start_date)} 
                                onChange={e => setData('start_date', e.target.value)} 
                                className="w-full px-5 py-4 font-mono text-sm font-black text-gray-700 border-gray-100 shadow-sm rounded-2xl bg-gray-50/50 focus:bg-white focus:ring-brand-primary transition-all" 
                                disabled={isLocked} 
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="ml-1 enterprise-label opacity-60">Fecha Derivación</label>
                            <input 
                                type="date" 
                                value={fmtDateISO(data.referral_date)} 
                                onChange={e => setData('referral_date', e.target.value)} 
                                className="w-full px-5 py-4 font-mono text-sm font-black text-gray-700 border-gray-100 shadow-sm rounded-2xl bg-gray-50/50 focus:bg-white focus:ring-brand-primary transition-all" 
                                disabled={isLocked} 
                            />
                        </div>

                        {/* Frecuencia y Sesiones */}
                        <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-6 bg-gray-50/30 p-6 rounded-[1.5rem] border border-gray-100">
                            <div className="col-span-1 space-y-1">
                                <label className="ml-1 enterprise-label opacity-60">Frecuencia</label>
                                <input 
                                    type="number" 
                                    placeholder="Ej: 3" 
                                    value={data.frequency} 
                                    onChange={e => setData('frequency', e.target.value)} 
                                    className="w-full px-5 py-4 font-black text-center text-gray-700 border-gray-100 shadow-sm rounded-2xl bg-white focus:ring-brand-primary transition-all" 
                                    disabled={isLocked} 
                                />
                            </div>
                            <div className="col-span-2 space-y-1">
                                <label className="ml-1 enterprise-label opacity-60">Periodo</label>
                                <select 
                                    value={data.frequency_time} 
                                    onChange={e => setData('frequency_time', e.target.value)} 
                                    className="w-full px-5 py-4 font-bold text-gray-700 border-gray-100 shadow-sm rounded-2xl bg-white focus:ring-brand-primary transition-all"
                                    disabled={isLocked}
                                >
                                    {frequencyTimeOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                                </select>
                            </div>
                            <div className="col-span-1 space-y-1">
                                <label className="ml-1 enterprise-label opacity-60">Total Sesiones</label>
                                <input 
                                    type="number" 
                                    value={data.total_sessions} 
                                    onChange={e => setData('total_sessions', e.target.value)} 
                                    className="w-full px-5 py-4 font-black text-center text-gray-700 border-gray-100 shadow-sm rounded-2xl bg-white focus:ring-brand-primary transition-all" 
                                    disabled={data.is_indefinite || isLocked} 
                                />
                            </div>
                            <div className="col-span-2 flex items-center justify-between pt-6">
                                 <label className="flex items-center gap-3 cursor-pointer bg-white px-4 py-2 rounded-xl border border-gray-100 shadow-sm hover:border-brand-primary/30 transition-all">
                                    <input 
                                        type="checkbox" 
                                        checked={data.is_indefinite} 
                                        onChange={e => setData('is_indefinite', e.target.checked)} 
                                        className="w-5 h-5 rounded text-brand-primary focus:ring-brand-primary border-gray-300" 
                                        disabled={isLocked} 
                                    />
                                    <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Indefinido</span>
                                </label>
                                {isEditing && (
                                    <span className="text-[10px] font-black text-green-600 uppercase tracking-widest bg-green-50 px-4 py-2 rounded-xl border border-green-100">
                                        {data.completed_sessions} Realizadas
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* 2. Datos Clínicos y Derivación */}
                <div className="p-8 bg-white border border-gray-100 rounded-[2rem] shadow-xl shadow-gray-500/5 group hover:border-brand-primary/20 transition-all space-y-6">
                    <h3 className="enterprise-label !text-brand-primary flex items-center gap-2 mb-2">
                         <Stethoscope className="w-4 h-4" /> Antecedentes Clínicos
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="md:col-span-2">
                            <SearchSelect
                                label="Diagnóstico Kinésico (CIE-10) *"
                                options={diagnostics.map(d => ({ value: d.code, label: `${d.code} - ${d.description}` }))}
                                value={data?.diagnostic_code}
                                onChange={(value) => setData("diagnostic_code", value)}
                                disabled={isLocked}
                                error={errors.diagnostic_code}
                                className="!rounded-2xl"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="ml-1 enterprise-label opacity-60">Médico Derivante</label>
                            <input 
                                type="text" 
                                value={data.referral_doctor_name} 
                                onChange={e => setData('referral_doctor_name', e.target.value)} 
                                className="w-full px-5 py-4 font-bold text-sm text-gray-700 border-gray-100 shadow-sm rounded-2xl bg-gray-50/50 focus:bg-white focus:ring-brand-primary transition-all" 
                                placeholder="Dr. Externo" 
                                disabled={isLocked} 
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="ml-1 enterprise-label opacity-60">Diag. Médico</label>
                            <input 
                                type="text" 
                                value={data.referral_diagnosis} 
                                onChange={e => setData('referral_diagnosis', e.target.value)} 
                                className="w-full px-5 py-4 font-bold text-sm text-gray-700 border-gray-100 shadow-sm rounded-2xl bg-gray-50/50 focus:bg-white focus:ring-brand-primary transition-all" 
                                placeholder="En la orden..." 
                                disabled={isLocked} 
                            />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="ml-1 enterprise-label flex items-center gap-2 text-purple-600"><Activity className="w-3 h-3"/> Fase Actual del Tratamiento</label>
                        <select 
                            value={data.current_phase} 
                            onChange={e => setData('current_phase', e.target.value)}
                            className="w-full px-5 py-4 font-bold text-sm text-purple-700 border-purple-100 shadow-sm rounded-2xl bg-purple-50/30 focus:bg-white focus:ring-purple-500 transition-all cursor-pointer"
                        >
                            {TREATMENT_CURRENT_PHASE_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                        </select>
                    </div>

                    <div className="space-y-1">
                        <label className="ml-1 enterprise-label opacity-60 flex items-center gap-2"><FileText className="w-3 h-3"/> Anamnesis / Evolución</label>
                        <textarea 
                            value={data.description} 
                            onChange={e => setData('description', e.target.value)} 
                            rows={4} 
                            className="w-full flex-1 text-sm font-medium border-gray-100 bg-gray-50/30 rounded-2xl py-4 px-5 focus:bg-white focus:ring-brand-primary transition-all shadow-inner resize-none" 
                            placeholder="Descripción clínica detallada..."
                            disabled={isLocked}
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="ml-1 enterprise-label opacity-60 flex items-center gap-2 text-orange-600"><Target className="w-3 h-3"/> Objetivos Terapéuticos</label>
                        <textarea 
                            value={data.objectives} 
                            onChange={e => setData('objectives', e.target.value)} 
                            rows={3} 
                            className="w-full flex-1 text-sm font-medium border-orange-100 bg-orange-50/10 rounded-2xl py-4 px-5 focus:bg-white focus:ring-orange-200 transition-all shadow-inner resize-none placeholder-orange-300" 
                            placeholder="Metas a corto y largo plazo..."
                            disabled={isLocked}
                        />
                    </div>
                </div>

                {/* --- SECCIÓN RESULTADOS (Condicional) --- */}
                {isEditing && (
                    <div className="p-8 border border-green-100 bg-green-50/20 rounded-[2rem] shadow-xl shadow-green-500/5 group hover:border-green-200 transition-all">
                        <h3 className="enterprise-label !text-green-700 flex items-center gap-2 mb-6">
                            <Activity className="w-4 h-4" /> Resultados y Evaluación Final
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="space-y-1">
                                <label className="ml-1 enterprise-label opacity-60 text-green-800">Reducción EVA</label>
                                <input 
                                    type="number" min="0" max="10" 
                                    value={data.pain_reduction} 
                                    onChange={e => setData('pain_reduction', e.target.value)} 
                                    className="w-full px-5 py-4 font-black text-center text-green-700 border-green-100 shadow-sm rounded-2xl bg-white focus:ring-green-500 transition-all" 
                                    placeholder="0-10" 
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="ml-1 enterprise-label opacity-60 text-green-800">Movilidad (%)</label>
                                <input 
                                    type="number" min="0" max="100" 
                                    value={data.mobility_improvement} 
                                    onChange={e => setData('mobility_improvement', e.target.value)} 
                                    className="w-full px-5 py-4 font-black text-center text-green-700 border-green-100 shadow-sm rounded-2xl bg-white focus:ring-green-500 transition-all" 
                                    placeholder="%" 
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="ml-1 enterprise-label opacity-60 text-green-800">Fuerza (%)</label>
                                <input 
                                    type="number" min="0" max="100" 
                                    value={data.strength_gain} 
                                    onChange={e => setData('strength_gain', e.target.value)} 
                                    className="w-full px-5 py-4 font-black text-center text-green-700 border-green-100 shadow-sm rounded-2xl bg-white focus:ring-green-500 transition-all" 
                                    placeholder="%" 
                                />
                            </div>
                            <div className="md:col-span-3 space-y-1">
                                <label className="ml-1 enterprise-label opacity-60 text-green-800">Outcome / Epicrisis</label>
                                <textarea 
                                    value={data.outcome} 
                                    onChange={e => setData('outcome', e.target.value)} 
                                    rows={3} 
                                    className="w-full flex-1 text-sm font-medium border-green-100 bg-white rounded-2xl py-4 px-5 focus:ring-green-500 transition-all shadow-inner resize-none" 
                                    placeholder="Conclusiones finales..." 
                                />
                            </div>
                        </div>
                    </div>
                )}
            </div>

           {/* === COLUMNA DERECHA (5/12) === */}
            <div className="lg:col-span-5 space-y-6">
                
                <div className="sticky top-4">
                    <PainMapCard
                        // 1. Datos (Tratamiento usa 'initial_')
                        points={data.initial_pain_map}
                        painLevel={data.initial_pain_level}
                        bodyPart={data.body_part}
                        laterality={data.laterality}
                        isLocked={isLocked}
                        title="Evaluación de Ingreso"

                        // 2. Actualizadores
                        onPointsChange={(val) => setData("initial_pain_map", val)}
                        onPainLevelChange={(val) => setData("initial_pain_level", val)}
                        onBodyPartChange={(val) => setData("body_part", val)}
                        onLateralityChange={(val) => setData("laterality", val)}
                        
                        // 3. Evento Manos
                        onBodyPartClick={handleBodyPartClick}
                    />
                </div>

            </div>
        </div>
      </div>

      {/* FOOTER ACCIONES */}
      <div className="sticky bottom-0 z-30 flex justify-end gap-4 p-10 border-t border-gray-100 bg-white/90 backdrop-blur-md shrink-0">
        <button 
            type="button" 
            onClick={() => setOpenTreatmentModal(false)} 
            className="px-10 py-4 text-xs font-black text-gray-500 uppercase tracking-widest hover:bg-gray-50 rounded-2xl transition-all"
        >
          Cancelar
        </button>
        <button 
            type="submit" 
            disabled={processing}
            className={`px-14 py-4 text-xs font-black text-white uppercase tracking-widest rounded-2xl shadow-xl hover:brightness-110 transition-all ${isEditing ? 'bg-indigo-600 shadow-indigo-200' : 'bg-brand-primary shadow-brand-primary/20'}`}
        >
            {processing ? "Guardando..." : (isEditing ? "Guardar Cambios" : "Crear Ficha")}
        </button>
      </div>
    </form>
    </div>
  );
}