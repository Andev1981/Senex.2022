// resources/js/pages/kine-mobile/session-form.jsx
import React, { useState, useEffect, useMemo } from "react";
import { Head, router } from "@inertiajs/react";
import {
  ArrowLeft,
  Calendar,
  Clock,
  User,
  FileText,
  Save,
  Search,
  Stethoscope,
  Activity,
  Clipboard,
  Target,
  CheckCircle,
  Eye,
  Zap,
  BookOpen,
  Info,
  DollarSign,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  History,
  RotateCcw,
  MoveUp,
  MoveDiagonal,
  Dumbbell,
  Ruler,
  MapPin,
  ShieldCheck,
  Smartphone,
  X
} from "lucide-react";
import KineLayout from "@/Layouts/KineLayout";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import moment from "moment";
import SignatureCanvas from "@/components/SignatureCanvas";
import { fmtCLP } from "@/utils/utils";
import PainMapCard from "@/components/Body/PainMapCard";
import EnterpriseSelect from "@/components/EnterpriseSelect";
import TextInput from "@/components/TextInput";
import Switch from "@/components/Switch";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import Swal from "sweetalert2";

const ROMGauge = ({ label, value, onChange, min = 0, max = 180, icon: Icon, colorClass = "text-amber-500", bgClass = "bg-amber-50" }) => {
    const percentage = ((value - min) / (max - min)) * 100;
    
    return (
        <div className={`p-5 bg-white rounded-[32px] border border-slate-100 shadow-sm transition-all active:bg-slate-50`}>
            <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-3">
                    <div className={`p-2 ${bgClass} rounded-xl`}>
                        <Icon className={`w-4 h-4 ${colorClass}`} />
                    </div>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</span>
                </div>
                <div className={`px-3 py-1 ${bgClass} rounded-full`}>
                    <span className={`text-sm font-black ${colorClass}`}>{value}°</span>
                </div>
            </div>
            
            <div className="relative h-12 flex items-center">
                <div className="absolute inset-0 flex items-center">
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div 
                            className={`h-full transition-all duration-500 rounded-full ${colorClass.replace('text', 'bg')}`}
                            style={{ width: `${percentage}%` }}
                        />
                    </div>
                </div>
                <input 
                    type="range" min={min} max={max} 
                    value={value} 
                    onChange={(e) => onChange(parseInt(e.target.value))} 
                    className="absolute inset-0 w-full h-12 opacity-0 cursor-pointer z-10" 
                />
                <div 
                    className={`absolute w-6 h-6 bg-white border-4 rounded-full shadow-md z-0 pointer-events-none transition-all duration-500 ${colorClass.replace('text', 'border')}`}
                    style={{ left: `calc(${percentage}% - 12px)` }}
                />
            </div>
            <div className="flex justify-between mt-1 px-1">
                <span className="text-[8px] font-bold text-slate-300">{min}°</span>
                <span className="text-[8px] font-bold text-slate-300">{max}°</span>
            </div>
        </div>
    );
};

export default function SessionForm({
  session = null,
  patients = [],
  items = [],
  treatments = [],
  doctor,
  previousSession = null,
  appointment = null,
  permissions = { can_create_sessions: true, can_view_sessions: true }
}) {
  const isDesktop = useMediaQuery("(min-width: 1024px)");
  const isEditMode = !!session;
  const currentStatus = (session?.status || "scheduled")?.toLowerCase();
  
  // No puede editar si la sesión ya está completada O si no tiene permiso de creación
  const canEdit = permissions.can_create_sessions && (!isEditMode || ["scheduled", "in_progress", "checked_in", "programada"].includes(currentStatus));
  
  const [showSignatureModal, setShowSignatureModal] = useState(false);
  const [showDetails, setShowDetails] = useState(true);

  // Estado del formulario siguiendo estructura SOAP
  const [formData, setFormData] = useState({
    treatment_id: session?.treatment_id || "",
    date: session?.date
      ? moment.utc(session.date).format("YYYY-MM-DD")
      : moment.utc(Date.now()).format("YYYY-MM-DD"),
    time: session?.time ? moment(session.time, "HH:mm:ss").format("HH:mm") : moment().format("HH:mm"),
    duration: session?.duration || 60,
    status: session?.status || (appointment ? "checked_in" : "scheduled"),
    doctor_id: doctor?.id || session?.doctor_id || "",
    patient_id: session?.patient_id || appointment?.patient_id || "",
    item_id: session?.item_id || appointment?.item_id || "",

    // S - Subjetivo
    pain_before: session?.pain_before || 0,
    subjective: session?.subjective || "",

    // O - Objetivo (Biometría y ROM)
    evaluation_data: session?.evaluation_data || { rom: {} },
    objective: session?.objective || "",
    
    // A - Evaluación (Pain After)
    pain_after: session?.pain_after || 0,
    assessment: session?.assessment || "",

    // P - Plan
    activities_data: session?.activities_data || { techniques: [], exercises: [] },
    plan: session?.plan || "",
    homework: session?.homework || "",
    next_goals: session?.next_goals || "",
    objectives: session?.treatment?.objectives || "", // Línea Base

    // Pain Map & Localization
    session_pain_map: session?.session_pain_map || [],
    body_part: session?.body_part || "",
    laterality: session?.laterality || "",
    informed_consent_confirmed: !!session?.informed_consent_confirmed,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState("subjetivo");
  const [newRomName, setNewRomName] = useState("");
  const [techniqueInput, setTechniqueInput] = useState("");
  const [exerciseInput, setExerciseInput] = useState("");

  const handleAddRomMetric = () => {
    if (!newRomName.trim()) return;
    const currentRom = formData.evaluation_data.rom || {};
    if (currentRom[newRomName]) return; 

    setFormData(prev => ({
        ...prev,
        evaluation_data: {
            ...prev.evaluation_data,
            rom: { ...currentRom, [newRomName]: { before: 0, after: 0 } }
        }
    }));
    setNewRomName(""); 
  };

  const handleDeleteRomMetric = (romName) => {
    const currentRom = { ...formData.evaluation_data.rom };
    delete currentRom[romName];
    setFormData(prev => ({
        ...prev,
        evaluation_data: { ...prev.evaluation_data, rom: currentRom }
    }));
  };

  const handleRomChange = (romName, moment, value) => {
    const currentRom = formData.evaluation_data.rom || {};
    setFormData(prev => ({
      ...prev,
      evaluation_data: {
        ...prev.evaluation_data,
        rom: {
          ...currentRom,
          [romName]: { ...currentRom[romName], [moment]: parseInt(value) || 0 },
        },
      },
    }));
  };

  const handleActivityChange = (category, item, action) => {
    const currentList = formData.activities_data[category] || [];
    const newList = action === "add"
        ? [...new Set([...currentList, item])]
        : currentList.filter((i) => i !== item);
    setFormData(prev => ({
      ...prev,
      activities_data: {
        ...prev.activities_data,
        [category]: newList,
      },
    }));
  };

  const tabs = [
    { id: "subjetivo", label: "Relato", icon: User, color: "text-blue-500" },
    { id: "objetivo", label: "Biometría", icon: Ruler, color: "text-amber-500" },
    { id: "plan", label: "Ejecución", icon: Dumbbell, color: "text-green-500" },
    { id: "analisis", label: "Cierre", icon: Target, color: "text-teal-500" },
  ];

  const handleNextTab = () => {
    const currentIndex = tabs.findIndex(t => t.id === activeTab);
    if (currentIndex < tabs.length - 1) {
        setActiveTab(tabs[currentIndex + 1].id);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
        handleFinishSession();
    }
  };

  const handleFinishSession = () => {
    console.log("Iniciando cierre de sesión...");
    if (!formData.informed_consent_confirmed) {
        Swal.fire({
            title: "Atención",
            text: "Debe confirmar el consentimiento informado antes de finalizar.",
            icon: "warning",
            confirmButtonColor: "#1e293b"
        });
        return;
    }
    
    // Finalizamos directamente omitiendo firma en este flujo rápido
    sendCompletion(null, true, null, "Omisión por flujo operativo");
  };

  const sendCompletion = (signatureBase64, skipped, coords, skipReason = "") => {
    const sessionId = session?.id;
    if (!sessionId) {
        Swal.fire("Error", "No se puede finalizar una sesión sin ID.", "error");
        return;
    }

    setIsSubmitting(true);
    
    const payload = {
      ...formData,
      signature_skipped: skipped,
      signature_base64: signatureBase64,
      gps_coords: coords,
      skip_reason: skipReason,
    };

    router.post(route("kine.sessions.complete", sessionId), payload, {
      onSuccess: () => {
          Swal.fire({ title: "¡Sesión Finalizada!", icon: "success", toast: true, position: 'top-end', showConfirmButton: false, timer: 3000 });
          router.visit(route("kine.dashboard"));
      },
      onFinish: () => setIsSubmitting(false),
      onError: (err) => {
          console.error("Error al finalizar sesión:", err);
          Swal.fire("Error", "No se pudo cerrar la sesión. Revise los datos e intente nuevamente.", "error");
      }
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const sessionId = session?.id;
    if (!sessionId) return;

    setIsSubmitting(true);
    
    router.put(route("kine.sessions.update-notes", sessionId), formData, {
      onSuccess: () => {
          Swal.fire({ title: "Borrador Guardado", icon: "success", toast: true, position: 'top-end', showConfirmButton: false, timer: 2000 });
          router.visit(route("kine.dashboard"));
      },
      onFinish: () => setIsSubmitting(false)
    });
  };

  const patientName = useMemo(() => {
    if (session?.patient) return session.patient.name;
    const p = patients.find(p => p.id === formData.patient_id);
    return p ? `${p.name} ${p.last_name}` : "Paciente";
  }, [session, patients, formData.patient_id]);

  const PageContent = (
    <div className={`min-h-screen ${isDesktop ? 'bg-gray-50/50' : 'bg-white pb-40'}`}>
        <Head title={`Ficha SOAP - ${patientName}`} />
        
        {/* Header Hero */}
        <div className={`sticky top-0 z-20 bg-white border-b shadow-sm ${isDesktop ? 'px-8 py-6' : 'px-6 py-4'}`}>
          <div className="flex items-center justify-between max-w-7xl mx-auto">
            <div className="flex items-center gap-4">
                <button onClick={() => window.history.back()} className="p-2.5 bg-slate-50 text-slate-400 rounded-2xl hover:bg-slate-100 transition-colors">
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <div>
                    <h1 className={`${isDesktop ? 'text-2xl' : 'text-sm'} font-black text-slate-900 uppercase tracking-tight`}>Registro SOAP</h1>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{patientName}</p>
                </div>
            </div>
            
            <div className="flex items-center gap-4">
                {isDesktop && (
                    <div className="hidden lg:flex items-center gap-6 px-6 py-2 bg-slate-50 rounded-2xl border border-slate-100 mr-4">
                        <div className="text-right border-r border-slate-200 pr-6">
                            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Estado</p>
                            <p className="text-[10px] font-black text-brand-primary uppercase">{formData.status}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Especialista</p>
                            <p className="text-[10px] font-black text-slate-700 uppercase">{doctor.name}</p>
                        </div>
                    </div>
                )}
                <button 
                    onClick={() => setShowDetails(!showDetails)}
                    className={`p-2.5 rounded-xl transition-all ${showDetails ? 'bg-brand-primary text-white shadow-lg shadow-brand-primary/20' : 'bg-slate-50 text-slate-400'}`}
                >
                    {showDetails ? <ChevronUp className="w-5 h-5" /> : <Info className="w-5 h-5" />}
                </button>
            </div>
          </div>

          {/* Información Detallada del Tratamiento (Colapsable) */}
          {showDetails && (
              <div className="max-w-7xl mx-auto mt-4 px-2">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6 bg-slate-50 rounded-[2.5rem] border border-slate-100 animate-in slide-in-from-top duration-300">
                      <div className="md:col-span-2 p-5 bg-white rounded-3xl border border-slate-100 shadow-sm flex items-start gap-4">
                          <div className="p-3 bg-brand-primary/10 rounded-2xl">
                              <Stethoscope className="w-5 h-5 text-brand-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Plan Maestro / Diagnóstico</p>
                              <p className="text-sm font-black text-slate-700 leading-tight">{session?.treatment?.diagnosis || 'Ingreso por Agenda / Sin diagnóstico previo'}</p>
                          </div>
                      </div>

                      <div className="space-y-4">
                        <div className="flex items-center gap-3 p-4 bg-white rounded-2xl border border-slate-100">
                            <Activity className="w-4 h-4 text-brand-primary opacity-50" />
                            <div>
                                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Servicio</p>
                                <p className="text-[10px] font-bold text-slate-600 truncate">{session?.session_type_name || 'Kinesiología'}</p>
                            </div>
                        </div>
                        {formData.status === 'in_progress' && (
                             <button
                                type="button"
                                className="w-full py-3 px-4 bg-indigo-50 border border-indigo-100 rounded-2xl flex items-center justify-center gap-3 active:scale-95 transition-all group"
                            >
                                <Dumbbell className="w-4 h-4 text-indigo-500 group-hover:animate-bounce" />
                                <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Liberar Box</span>
                            </button>
                        )}
                      </div>
                  </div>
              </div>
          )}
          
          {/* Tabs Navigation (Solo visible en Mobile) */}
          {!isDesktop && (
            <div className="flex px-2 overflow-x-auto no-scrollbar bg-white border-t border-slate-50 mt-4">
                {tabs.map(tab => (
                <button 
                    key={tab.id} 
                    onClick={() => setActiveTab(tab.id)} 
                    className={`flex-1 min-w-[80px] py-4 text-[10px] font-black uppercase tracking-widest flex flex-col items-center gap-1.5 transition-all border-b-2 ${activeTab === tab.id ? `text-slate-900 border-brand-primary bg-slate-50 shadow-inner` : "text-slate-400 border-transparent"}`}
                >
                    <tab.icon className={`w-4 h-4 ${activeTab === tab.id ? tab.color : 'text-slate-300'}`} /> 
                    {tab.label}
                </button>
                ))}
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className={`max-w-7xl mx-auto ${isDesktop ? 'p-8' : 'p-6 pb-32'}`}>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                
                {/* === COLUMNA IZQUIERDA: CAMPOS SOAP === */}
                <div className="lg:col-span-7 space-y-8">
                    {isDesktop ? (
                        /* Vista Desktop: Todos los campos visibles o en acordeones premium */
                        <div className="space-y-10">
                            {/* [S] SUBJETIVO */}
                            <section className="bg-white border border-slate-100 rounded-[3rem] p-10 shadow-xl shadow-slate-200/50 space-y-8 animate-in fade-in slide-in-from-left duration-500">
                                <div className="flex items-center gap-4 mb-2">
                                    <div className="w-12 h-12 bg-blue-50 text-blue-500 rounded-2xl flex items-center justify-center shadow-inner"><User className="w-6 h-6"/></div>
                                    <h2 className="text-xl font-black text-slate-900 uppercase tracking-tighter">[S] Relato Subjetivo</h2>
                                </div>
                                <div className="space-y-6">
                                    <textarea 
                                        value={formData.subjective} 
                                        onChange={(e) => setFormData({...formData, subjective: e.target.value})} 
                                        placeholder="¿Cómo se siente hoy? ¿Hubo cambios desde la última sesión?" 
                                        className="w-full bg-slate-50 border-none rounded-[2rem] p-8 text-sm font-medium focus:ring-4 focus:ring-blue-500/5 focus:bg-white transition-all shadow-inner min-h-[200px]" 
                                    />

                                    {session?.item?.service_detail?.is_evaluation && (
                                        <div className="p-8 bg-brand-primary/5 rounded-[2rem] border border-brand-primary/10 animate-in zoom-in-95 duration-500">
                                            <div className="flex items-center gap-3 mb-4">
                                                <div className="p-2 bg-brand-primary text-white rounded-xl shadow-lg shadow-brand-primary/20">
                                                    <Target className="w-4 h-4" />
                                                </div>
                                                <h3 className="text-sm font-black text-brand-primary uppercase tracking-widest">Objetivos de Línea Base</h3>
                                            </div>
                                            <textarea 
                                                value={formData.objectives} 
                                                onChange={(e) => setFormData({...formData, objectives: e.target.value})} 
                                                placeholder="Defina los objetivos a largo plazo para este tratamiento (ej: Recuperar marcha, ROM 100%, etc)..." 
                                                className="w-full bg-white border-transparent rounded-2xl p-6 text-sm font-bold shadow-sm focus:ring-brand-primary/20 transition-all" 
                                                rows={4} 
                                            />
                                            <p className="text-[9px] font-bold text-slate-400 uppercase mt-3">Nota: Esta información se anclará como la "Foto Inicial" del tratamiento.</p>
                                        </div>
                                    )}
                                </div>
                            </section>

                            {/* [O] OBJETIVO - BIOMETRÍA Y ROM */}
                            <section className="bg-white border border-slate-100 rounded-[3rem] p-10 shadow-xl shadow-slate-200/50 space-y-10 animate-in fade-in slide-in-from-left duration-700">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-amber-50 text-amber-500 rounded-2xl flex items-center justify-center shadow-inner"><Ruler className="w-6 h-6"/></div>
                                        <h2 className="text-xl font-black text-slate-900 uppercase tracking-tighter">[O] Biometría & ROM</h2>
                                    </div>
                                    <div className="flex gap-2">
                                        <input 
                                            type="text" 
                                            value={newRomName} 
                                            onChange={(e) => setNewRomName(e.target.value)} 
                                            className="px-4 py-2 text-xs font-bold border-slate-100 bg-slate-50 rounded-xl focus:bg-white transition-all shadow-inner w-64" 
                                            placeholder="Nueva medición (ej: Flexión Hombro)..." 
                                        />
                                        <button type="button" onClick={handleAddRomMetric} className="bg-slate-900 text-white px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all active:scale-95">+ Añadir</button>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {Object.entries(formData.evaluation_data.rom || {}).map(([name, vals]) => (
                                        <div key={name} className="relative group">
                                            <ROMGauge 
                                                label={name} 
                                                value={vals.before || 0} 
                                                onChange={(val) => handleRomChange(name, 'before', val)} 
                                                icon={MoveUp} 
                                            />
                                            <button 
                                                type="button" 
                                                onClick={() => handleDeleteRomMetric(name)}
                                                className="absolute -top-2 -right-2 p-1.5 bg-white text-red-400 border border-red-50 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity hover:text-red-600"
                                            >
                                                <X className="w-3 h-3" />
                                            </button>
                                        </div>
                                    ))}
                                    {Object.keys(formData.evaluation_data.rom || {}).length === 0 && (
                                        <div className="col-span-full py-12 text-center bg-slate-50/50 rounded-[2rem] border-2 border-dashed border-slate-100">
                                            <Ruler className="w-8 h-8 text-slate-200 mx-auto mb-3" />
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Sin mediciones ROM registradas</p>
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-4">
                                    <label className="enterprise-label opacity-60 ml-2">Hallazgos Físicos & Palpación</label>
                                    <textarea 
                                        value={formData.objective} 
                                        onChange={(e) => setFormData({...formData, objective: e.target.value})} 
                                        placeholder="Descripción detallada del examen físico..." 
                                        className="w-full bg-slate-50 border-none rounded-[2rem] p-8 text-sm font-medium focus:ring-4 focus:ring-amber-500/5 focus:bg-white transition-all shadow-inner min-h-[150px]" 
                                    />
                                </div>
                            </section>

                            {/* [P] PLAN DE TRABAJO */}
                            <section className="bg-white border border-slate-100 rounded-[3rem] p-10 shadow-xl shadow-slate-200/50 space-y-10 animate-in fade-in slide-in-from-left duration-1000">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-green-50 text-green-500 rounded-2xl flex items-center justify-center shadow-inner"><Dumbbell className="w-6 h-6"/></div>
                                    <h2 className="text-xl font-black text-slate-900 uppercase tracking-tighter">[P] Ejecución & Plan</h2>
                                </div>

                                <div className="grid grid-cols-2 gap-8">
                                    {/* Técnicas / Procedimientos */}
                                    <div className="p-8 bg-slate-50 rounded-[2rem] border border-slate-100 shadow-inner space-y-6">
                                        <div className="flex items-center gap-3">
                                            <Activity className="w-5 h-5 text-green-600" />
                                            <h3 className="text-sm font-black text-green-800 uppercase tracking-widest">Procedimientos</h3>
                                        </div>
                                        <div className="flex gap-2">
                                            <input 
                                                type="text" 
                                                value={techniqueInput} 
                                                onChange={(e) => setTechniqueInput(e.target.value)} 
                                                onKeyDown={(e) => { if(e.key==='Enter'){ e.preventDefault(); handleActivityChange('techniques', techniqueInput, 'add'); setTechniqueInput(''); }}}
                                                className="flex-1 px-5 py-3 text-xs font-bold border-white bg-white rounded-xl focus:ring-green-200 transition-all shadow-sm" 
                                                placeholder="Ej: TENS, Masaje..." 
                                            />
                                            <button type="button" onClick={() => { handleActivityChange('techniques', techniqueInput, 'add'); setTechniqueInput(''); }} className="p-3 bg-green-600 text-white rounded-xl shadow-lg shadow-green-200 active:scale-90 transition-all"><Plus className="w-5 h-5"/></button>
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            {formData.activities_data.techniques?.map((t, i) => (
                                                <span key={i} className="bg-white text-green-700 text-[10px] px-4 py-2 rounded-xl border border-green-100 flex items-center gap-2 font-black shadow-sm uppercase tracking-wider group hover:bg-green-50 transition-colors">
                                                    {t} <button type="button" onClick={() => handleActivityChange('techniques', t, 'remove')} className="p-0.5 rounded-full hover:bg-red-50 text-slate-300 hover:text-red-500"><X className="w-3 h-3"/></button>
                                                </span>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Ejercicios */}
                                    <div className="p-8 bg-slate-50 rounded-[2rem] border border-slate-100 shadow-inner space-y-6">
                                        <div className="flex items-center gap-3">
                                            <Zap className="w-5 h-5 text-blue-600" />
                                            <h3 className="text-sm font-black text-blue-800 uppercase tracking-widest">Ejercicios Realizados</h3>
                                        </div>
                                        <div className="flex gap-2">
                                            <input 
                                                type="text" 
                                                value={exerciseInput} 
                                                onChange={(e) => setExerciseInput(e.target.value)} 
                                                onKeyDown={(e) => { if(e.key==='Enter'){ e.preventDefault(); handleActivityChange('exercises', exerciseInput, 'add'); setExerciseInput(''); }}}
                                                className="flex-1 px-5 py-3 text-xs font-bold border-white bg-white rounded-xl focus:ring-blue-200 transition-all shadow-sm" 
                                                placeholder="Ej: Sentadillas, Elástico..." 
                                            />
                                            <button type="button" onClick={() => { handleActivityChange('exercises', exerciseInput, 'add'); setExerciseInput(''); }} className="p-3 bg-blue-600 text-white rounded-xl shadow-lg shadow-blue-200 active:scale-90 transition-all"><Plus className="w-5 h-5"/></button>
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            {formData.activities_data.exercises?.map((t, i) => (
                                                <span key={i} className="bg-white text-blue-700 text-[10px] px-4 py-2 rounded-xl border border-blue-100 flex items-center gap-2 font-black shadow-sm uppercase tracking-wider group hover:bg-blue-50 transition-colors">
                                                    {t} <button type="button" onClick={() => handleActivityChange('exercises', t, 'remove')} className="p-0.5 rounded-full hover:bg-red-50 text-slate-300 hover:text-red-500"><X className="w-3 h-3"/></button>
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <label className="enterprise-label opacity-60 ml-2">Indicaciones para el Hogar</label>
                                    <textarea value={formData.plan} onChange={(e) => setFormData({...formData, plan: e.target.value})} rows={6} className="w-full bg-slate-50 border-none rounded-3xl p-8 text-sm font-medium shadow-inner focus:bg-white focus:ring-green-500/5 transition-all" placeholder="Ej: Realizar 3 series de 10 repeticiones diariamente..."/>
                                </div>
                            </section>

                            {/* [A] EVALUACION */}
                            <section className="bg-white border border-slate-100 rounded-[3rem] p-10 shadow-xl shadow-slate-200/50 space-y-8 animate-in fade-in slide-in-from-left duration-1000">
                                <div className="flex items-center gap-4 mb-2">
                                    <div className="w-12 h-12 bg-teal-50 text-teal-500 rounded-2xl flex items-center justify-center shadow-inner"><Target className="w-6 h-6"/></div>
                                    <h2 className="text-xl font-black text-slate-900 uppercase tracking-tighter">[A] Interpretación Clínica</h2>
                                </div>
                                <textarea value={formData.assessment} onChange={(e) => setFormData({...formData, assessment: e.target.value})} rows={6} className="w-full bg-slate-50 border-none rounded-3xl p-8 text-sm font-medium shadow-inner focus:bg-white focus:ring-teal-500/5 transition-all" placeholder="Juicio profesional sobre la evolución del paciente..."/>
                            </section>
                        </div>
                    ) : (
                        /* Vista Mobile: Sistema de Tabs Unificado */
                        <div className="space-y-6">
                             {activeTab === "subjetivo" && (
                                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
                                    {/* MAPA CORPORAL INTEGRADO */}
                                    <PainMapCard
                                        points={formData.session_pain_map}
                                        painBefore={formData.pain_before}
                                        painAfter={formData.pain_after}
                                        bodyPart={formData.body_part} 
                                        laterality={formData.laterality} 
                                        isLocked={!canEdit} 
                                        title="Mapa de Dolor"
                                        onPointsChange={(val) => setFormData(prev => ({ ...prev, session_pain_map: val }))}
                                        onPainBeforeChange={(val) => setFormData(prev => ({ ...prev, pain_before: val }))}
                                        onPainAfterChange={(val) => setFormData(prev => ({ ...prev, pain_after: val }))}
                                        onBodyPartChange={(val) => setFormData(prev => ({ ...prev, body_part: val }))} 
                                        onLateralityChange={(val) => setFormData(prev => ({ ...prev, laterality: val }))} 
                                    />

                                    <div className="p-6 bg-white rounded-[32px] border border-slate-100 shadow-sm">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block">Relato del Paciente</label>
                                        <textarea 
                                            value={formData.subjective} 
                                            onChange={(e) => setFormData({...formData, subjective: e.target.value})} 
                                            placeholder="¿Cómo se siente hoy?..." 
                                            className="w-full bg-slate-50 border-transparent rounded-2xl p-5 text-sm font-bold focus:ring-4 focus:ring-blue-500/5 focus:bg-white transition-all shadow-inner" 
                                            rows={8} 
                                        />
                                    </div>

                                    {session?.item?.service_detail?.is_evaluation && (
                                        <div className="p-8 bg-brand-primary/5 rounded-[32px] border border-brand-primary/10">
                                            <div className="flex items-center gap-3 mb-4">
                                                <Target className="w-5 h-5 text-brand-primary" />
                                                <span className="text-[10px] font-black text-brand-primary uppercase tracking-widest">Objetivos Línea Base</span>
                                            </div>
                                            <textarea 
                                                value={formData.objectives} 
                                                onChange={(e) => setFormData({...formData, objectives: e.target.value})} 
                                                placeholder="Defina metas a largo plazo..." 
                                                className="w-full bg-white border-transparent rounded-2xl p-5 text-sm font-bold shadow-sm focus:ring-brand-primary/20 transition-all" 
                                                rows={5} 
                                            />
                                        </div>
                                    )}
                                </div>
                            )}

                            {activeTab === "objetivo" && (
                                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
                                    <div className="p-6 bg-white rounded-[32px] border border-slate-100 shadow-sm space-y-6">
                                        <div className="flex items-center justify-between">
                                            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Rangos Articulares (ROM)</h3>
                                            <button type="button" onClick={() => {
                                                Swal.fire({
                                                    title: 'Nueva Medición',
                                                    input: 'text',
                                                    inputPlaceholder: 'Ej: Flexión Cadera...',
                                                    showCancelButton: true,
                                                    confirmButtonText: 'Añadir',
                                                    confirmButtonColor: '#4f46e5'
                                                }).then(res => {
                                                    if(res.isConfirmed && res.value) {
                                                        const name = res.value;
                                                        const currentRom = formData.evaluation_data.rom || {};
                                                        setFormData(prev => ({
                                                            ...prev,
                                                            evaluation_data: {
                                                                ...prev.evaluation_data,
                                                                rom: { ...currentRom, [name]: { before: 0, after: 0 } }
                                                            }
                                                        }));
                                                    }
                                                });
                                            }} className="text-[10px] font-black text-brand-primary uppercase tracking-widest border border-brand-primary/20 px-3 py-1.5 rounded-xl hover:bg-brand-primary/5">+ Añadir</button>
                                        </div>
                                        
                                        <div className="grid grid-cols-1 gap-4">
                                            {Object.entries(formData.evaluation_data.rom || {}).map(([name, vals]) => (
                                                <ROMGauge 
                                                    key={name}
                                                    label={name} 
                                                    value={vals.before || 0} 
                                                    onChange={(val) => handleRomChange(name, 'before', val)} 
                                                    icon={Ruler} 
                                                />
                                            ))}
                                            {Object.keys(formData.evaluation_data.rom || {}).length === 0 && (
                                                <div className="py-12 text-center bg-slate-50/50 rounded-3xl border-2 border-dashed border-slate-100">
                                                    <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Sin mediciones ROM</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="p-6 bg-white rounded-[32px] border border-slate-100 shadow-sm">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block">Hallazgos Físicos</label>
                                        <textarea 
                                            value={formData.objective} 
                                            onChange={(e) => setFormData({...formData, objective: e.target.value})} 
                                            placeholder="Descripción del examen físico..." 
                                            className="w-full bg-slate-50 border-transparent rounded-2xl p-5 text-sm font-bold shadow-inner" 
                                            rows={6} 
                                        />
                                    </div>
                                </div>
                            )}

                            {activeTab === "plan" && (
                                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
                                    {/* Técnicas en Mobile */}
                                    <div className="p-6 bg-slate-50 rounded-[32px] border border-slate-100 space-y-4">
                                        <h3 className="text-[10px] font-black text-green-700 uppercase tracking-widest flex gap-2"><Activity className="w-3 h-3"/> Procedimientos</h3>
                                        <div className="flex gap-2">
                                            <input type="text" value={techniqueInput} onChange={(e) => setTechniqueInput(e.target.value)} className="flex-1 px-4 py-3 text-xs font-bold bg-white rounded-xl border-none shadow-sm" placeholder="TENS, Ultrasonido..." />
                                            <button type="button" onClick={() => { handleActivityChange('techniques', techniqueInput, 'add'); setTechniqueInput(''); }} className="p-3 bg-green-600 text-white rounded-xl shadow-lg active:scale-90"><Plus className="w-4 h-4"/></button>
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            {formData.activities_data.techniques?.map((t, i) => (
                                                <span key={i} className="bg-white text-green-700 text-[10px] px-3 py-1.5 rounded-xl border border-green-100 flex items-center gap-2 font-black shadow-sm uppercase">
                                                    {t} <X className="ml-2 w-3 h-3 text-slate-300 inline cursor-pointer" onClick={() => handleActivityChange('techniques', t, 'remove')} />
                                                </span>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Ejercicios en Mobile */}
                                    <div className="p-6 bg-slate-50 rounded-[32px] border border-slate-100 space-y-4">
                                        <h3 className="text-[10px] font-black text-blue-700 uppercase tracking-widest flex gap-2"><Dumbbell className="w-3 h-3"/> Ejercicios</h3>
                                        <div className="flex gap-2">
                                            <input type="text" value={exerciseInput} onChange={(e) => setExerciseInput(e.target.value)} className="flex-1 px-4 py-3 text-xs font-bold bg-white rounded-xl border-none shadow-sm" placeholder="Sentadillas, Pesas..." />
                                            <button type="button" onClick={() => { handleActivityChange('exercises', exerciseInput, 'add'); setExerciseInput(''); }} className="p-3 bg-blue-600 text-white rounded-xl shadow-lg active:scale-90"><Plus className="w-4 h-4"/></button>
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            {formData.activities_data.exercises?.map((t, i) => (
                                                <span key={i} className="bg-white text-blue-700 text-[10px] px-3 py-1.5 rounded-xl border border-blue-100 flex items-center gap-2 font-black shadow-sm uppercase">
                                                    {t} <X className="ml-2 w-3 h-3 text-slate-300 inline cursor-pointer" onClick={() => handleActivityChange('exercises', t, 'remove')} />
                                                </span>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="p-6 bg-white rounded-[32px] border border-slate-100 shadow-sm">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block">Tareas Hogar</label>
                                        <textarea 
                                            value={formData.plan} 
                                            onChange={(e) => setFormData({...formData, plan: e.target.value})} 
                                            placeholder="Indicaciones para el paciente..." 
                                            className="w-full bg-slate-50 border-transparent rounded-2xl p-5 text-sm font-bold shadow-inner" 
                                            rows={6} 
                                        />
                                    </div>
                                </div>
                            )}

                            {activeTab === "analisis" && (
                                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
                                    <div className="p-6 bg-white rounded-[32px] border border-slate-100 shadow-sm">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block">Interpretación Clínica</label>
                                        <textarea 
                                            value={formData.assessment} 
                                            onChange={(e) => setFormData({...formData, assessment: e.target.value})} 
                                            placeholder="Juicio profesional..." 
                                            className="w-full bg-slate-50 border-transparent rounded-2xl p-5 text-sm font-bold shadow-inner" 
                                            rows={8} 
                                        />
                                    </div>

                                    {/* CONSENTIMIENTO INFORMADO */}
                                    <div className={`p-8 rounded-[32px] border transition-all ${formData.informed_consent_confirmed ? 'bg-green-50 border-green-200' : 'bg-orange-50 border-orange-200 shadow-lg shadow-orange-100'}`}>
                                        <div className="flex items-center justify-between gap-6">
                                            <div className="flex items-center gap-4">
                                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${formData.informed_consent_confirmed ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                                                    <ShieldCheck className="w-6 h-6" />
                                                </div>
                                                <div>
                                                    <p className="text-xs font-black uppercase text-slate-900 tracking-widest">Legal</p>
                                                    <p className="text-[10px] font-bold text-slate-500 uppercase">Consentimiento</p>
                                                </div>
                                            </div>
                                            <Switch 
                                                checked={formData.informed_consent_confirmed} 
                                                onChange={(e) => setFormData(p => ({...p, informed_consent_confirmed: e.target.checked}))} 
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* === COLUMNA DERECHA: PAIN MAP & CONTEXTO (Solo Desktop) === */}
                {isDesktop && (
                    <div className="lg:col-span-5 space-y-8">
                        <div className="sticky top-32 space-y-8">
                            
                            {/* MAPA CORPORAL INTEGRADO (Estructura Admin) */}
                            <PainMapCard
                                points={formData.session_pain_map}
                                painBefore={formData.pain_before}
                                painAfter={formData.pain_after}
                                bodyPart={formData.body_part} 
                                laterality={formData.laterality} 
                                isLocked={!canEdit} 
                                title="Localización de Dolor"
                                onPointsChange={(val) => setFormData(prev => ({ ...prev, session_pain_map: val }))}
                                onPainBeforeChange={(val) => setFormData(prev => ({ ...prev, pain_before: val }))}
                                onPainAfterChange={(val) => setFormData(prev => ({ ...prev, pain_after: val }))}
                                onBodyPartChange={(val) => setFormData(prev => ({ ...prev, body_part: val }))} 
                                onLateralityChange={(val) => setFormData(prev => ({ ...prev, laterality: val }))} 
                            />

                            {/* CONSENTIMIENTO INFORMADO */}
                            <div className={`p-8 rounded-[2.5rem] border transition-all ${formData.informed_consent_confirmed ? 'bg-green-50 border-green-200' : 'bg-orange-50 border-orange-200 shadow-lg shadow-orange-100'}`}>
                                <div className="flex items-center justify-between gap-6">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${formData.informed_consent_confirmed ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                                            <ShieldCheck className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <p className="text-xs font-black uppercase text-slate-900 tracking-widest">Consentimiento</p>
                                            <p className="text-[10px] font-bold text-slate-500 uppercase">Validación legal de atención</p>
                                        </div>
                                    </div>
                                    <Switch 
                                        checked={formData.informed_consent_confirmed} 
                                        onChange={(e) => setFormData(p => ({...p, informed_consent_confirmed: e.target.checked}))} 
                                    />
                                </div>
                            </div>

                            {/* ACCIONES FINALES (Solo Desktop) */}
                            <div className="grid grid-cols-2 gap-4">
                                <button 
                                    type="submit" 
                                    disabled={isSubmitting} 
                                    className="flex items-center justify-center gap-3 bg-slate-900 text-white font-black uppercase text-xs py-5 rounded-[2rem] hover:bg-black transition-all shadow-xl active:scale-95"
                                >
                                    <Save className="w-5 h-5" /> GUARDAR BORRADOR
                                </button>
                                <button 
                                    type="button" 
                                    onClick={handleFinishSession} 
                                    disabled={isSubmitting} 
                                    className="flex items-center justify-center gap-3 bg-brand-primary text-white font-black uppercase text-xs py-5 rounded-[2rem] hover:brightness-110 transition-all shadow-xl shadow-brand-primary/20 active:scale-95"
                                >
                                    <CheckCircle className="w-5 h-5" /> FINALIZAR ATENCIÓN
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* BARRA DE ACCIÓN FLOTANTE (Solo Mobile) */}
            {!isDesktop && (
                <div className="fixed bottom-0 left-0 right-0 p-6 bg-white/95 backdrop-blur-xl border-t border-slate-100 flex gap-3 z-[100] shadow-[0_-10px_40px_rgba(0,0,0,0.1)]">
                    <button 
                        type="button" 
                        onClick={handleNextTab} 
                        disabled={isSubmitting} 
                        className="flex-[3] bg-brand-primary text-white font-black uppercase text-xs tracking-[0.2em] py-6 rounded-[32px] shadow-2xl shadow-brand-primary/40 flex items-center justify-center gap-3 active:scale-95 transition-all"
                    >
                        {activeTab === 'analisis' ? <CheckCircle className="w-6 h-6" /> : <ChevronRight className="w-6 h-6" />}
                        {activeTab === 'analisis' ? 'FINALIZAR' : 'SIGUIENTE PASO'}
                    </button>
                    <button 
                        type="submit" 
                        disabled={isSubmitting} 
                        title="Guardar Borrador"
                        className="w-20 bg-slate-900 text-white font-black uppercase text-[10px] tracking-widest py-6 rounded-[32px] flex items-center justify-center active:scale-95 transition-all"
                    >
                        {isSubmitting ? "..." : <Save className="w-6 h-6" />}
                    </button>
                </div>
            )}
        </form>
    </div>
  );

  return isDesktop ? (
    <AuthenticatedLayout>{PageContent}</AuthenticatedLayout>
  ) : (
    <KineLayout>{PageContent}</KineLayout>
  );
}