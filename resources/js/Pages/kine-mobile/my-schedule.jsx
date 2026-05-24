// resources/js/pages/kine-mobile/my-schedule.jsx
import React, { useState } from "react";
import { Head, router, useForm } from "@inertiajs/react";
import {
    Clock, Calendar, ChevronRight, Plus,
    Trash2, Lock, Info, Ban, CalendarOff,
    AlertTriangle, Coffee,
} from "lucide-react";
import KineLayout from "@/Layouts/KineLayout";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import Modal from "@/components/Modal";

const DAYS = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
const DAYS_SHORT = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

const MODALITY_OPTS = [
    { value: "onsite",  label: "Presencial", color: "bg-teal-100 text-teal-700" },
    { value: "online",  label: "Online",     color: "bg-blue-100 text-blue-700" },
    { value: "home",    label: "Domicilio",  color: "bg-violet-100 text-violet-700" },
];

function modalityStyle(val) {
    return MODALITY_OPTS.find((m) => m.value === val)?.color ?? "bg-slate-100 text-slate-600";
}
function modalityLabel(val) {
    return MODALITY_OPTS.find((m) => m.value === val)?.label ?? val;
}

function AddBlockForm({ onSubmit, loading, currentBranch, onClose }) {
    const activeModalities = React.useMemo(() => {
        const list = [];
        const allowsOnsite = currentBranch ? !!currentBranch.allows_onsite : true;
        const allowsOnline = currentBranch ? !!currentBranch.allows_online : true;
        const allowsHome = currentBranch ? !!currentBranch.allows_home : true;

        if (allowsOnsite) {
            list.push({ value: "onsite", label: "Presencial", color: "bg-teal-100 text-teal-700" });
        }
        if (allowsOnline) {
            list.push({ value: "online", label: "Online", color: "bg-blue-100 text-blue-700" });
        }
        if (allowsHome) {
            list.push({ value: "home", label: "Domicilio", color: "bg-violet-100 text-violet-700" });
        }

        if (list.length === 0) {
            list.push({ value: "onsite", label: "Presencial", color: "bg-teal-100 text-teal-700" });
        }
        return list;
    }, [currentBranch]);

    const { data, setData, reset } = useForm({
        day_of_week: 1,
        start_time: "09:00",
        end_time: "18:00",
        modality: activeModalities[0]?.value ?? "onsite",
    });

    React.useEffect(() => {
        if (!activeModalities.some(m => m.value === data.modality)) {
            setData("modality", activeModalities[0]?.value ?? "onsite");
        }
    }, [activeModalities]);

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(data, reset);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Day */}
            <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block ml-1">Día de la Semana</label>
                <div className="grid grid-cols-7 gap-1">
                    {DAYS_SHORT.map((d, i) => (
                        <button
                            key={i}
                            type="button"
                            onClick={() => setData("day_of_week", i)}
                            className={`py-3 rounded-xl text-[10px] font-black uppercase transition-all ${
                                data.day_of_week === i
                                    ? "bg-teal-600 text-white shadow-sm"
                                    : "bg-slate-50 text-slate-500 border border-slate-100 hover:border-teal-300"
                            }`}
                        >
                            {d}
                        </button>
                    ))}
                </div>
            </div>

            {/* Times */}
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2 ml-1">Hora Inicio</label>
                    <input
                        type="time"
                        value={data.start_time}
                        onChange={(e) => setData("start_time", e.target.value)}
                        className="w-full py-3 px-4 bg-slate-50 border-none rounded-2xl text-sm font-bold text-slate-800 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-400"
                    />
                </div>
                <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2 ml-1">Hora Fin</label>
                    <input
                        type="time"
                        value={data.end_time}
                        onChange={(e) => setData("end_time", e.target.value)}
                        className="w-full py-3 px-4 bg-slate-50 border-none rounded-2xl text-sm font-bold text-slate-800 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-400"
                    />
                </div>
            </div>

            {/* Modality */}
            {activeModalities.length > 1 && (
                <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block ml-1">Modalidad de Atención</label>
                    <div className="flex gap-2">
                        {activeModalities.map((m) => (
                            <button
                                key={m.value}
                                type="button"
                                onClick={() => setData("modality", m.value)}
                                className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase transition-all border ${
                                    data.modality === m.value
                                        ? `${m.color} border-transparent shadow-sm`
                                        : "bg-slate-50 text-slate-400 border-slate-100 hover:border-slate-200"
                                }`}
                            >
                                {m.label}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            <div className="flex gap-3 pt-4">
                <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 py-4 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-2xl font-black text-xs uppercase tracking-wide transition-all"
                >
                    Cancelar
                </button>
                <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 py-4 bg-teal-600 text-white rounded-2xl font-black text-xs uppercase tracking-wide hover:bg-teal-700 active:scale-95 transition-all disabled:opacity-60"
                >
                    {loading ? "Guardando..." : "Agregar bloque"}
                </button>
            </div>
        </form>
    );
}

function AddExceptionForm({ onSubmit, loading, onClose }) {
    const { data, setData, reset } = useForm({
        date: new Date().toISOString().split('T')[0],
        end_date: "",
        action: "cancel",
        override_start_time: "09:00",
        override_end_time: "18:00",
        reason: "",
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(data, reset);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Fechas */}
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2 ml-1">Fecha Inicio</label>
                    <input
                        type="date"
                        value={data.date}
                        onChange={(e) => setData("date", e.target.value)}
                        required
                        className="w-full py-3 px-4 bg-slate-50 border-none rounded-2xl text-xs font-bold text-slate-800 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-400"
                    />
                </div>
                <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2 ml-1">Fecha Fin (Opcional)</label>
                    <input
                        type="date"
                        value={data.end_date}
                        onChange={(e) => setData("end_date", e.target.value)}
                        className="w-full py-3 px-4 bg-slate-50 border-none rounded-2xl text-xs font-bold text-slate-800 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-400"
                    />
                </div>
            </div>

            {/* Tipo de Acción */}
            <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block ml-1">Tipo de Bloqueo</label>
                <div className="flex gap-2">
                    {[
                        { val: "cancel", label: "Día Completo" },
                        { val: "override", label: "Rango Horario" }
                    ].map((opt) => (
                        <button
                            key={opt.val}
                            type="button"
                            onClick={() => setData("action", opt.val)}
                            className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase transition-all border ${
                                data.action === opt.val
                                    ? "bg-red-50 text-red-700 border-red-200 shadow-sm"
                                    : "bg-slate-50 text-slate-400 border-slate-100 hover:border-slate-200"
                            }`}
                        >
                            {opt.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Rango de Horas (Solo si es parcial) */}
            {data.action === "override" && (
                <div className="grid grid-cols-2 gap-4 p-4 bg-red-50/30 border border-red-100/50 rounded-2xl">
                    <div>
                        <label className="text-[8px] font-black text-red-600 block mb-1">Hora Inicio</label>
                        <input
                            type="time"
                            value={data.override_start_time}
                            onChange={(e) => setData("override_start_time", e.target.value)}
                            className="w-full py-2 px-3 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:ring-2 focus:ring-red-500/20 focus:border-red-400"
                        />
                    </div>
                    <div>
                        <label className="text-[8px] font-black text-red-600 block mb-1">Hora Fin</label>
                        <input
                            type="time"
                            value={data.override_end_time}
                            onChange={(e) => setData("override_end_time", e.target.value)}
                            className="w-full py-2 px-3 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:ring-2 focus:ring-red-500/20 focus:border-red-400"
                        />
                    </div>
                </div>
            )}

            {/* Motivo */}
            <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block ml-1">Motivo (Interno)</label>
                <input
                    type="text"
                    value={data.reason}
                    onChange={(e) => setData("reason", e.target.value)}
                    placeholder="Ej: Médico, Vacaciones, Día Libre..."
                    className="w-full py-3 px-4 bg-slate-50 border-none rounded-2xl text-xs font-bold text-slate-800 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-400 placeholder:text-slate-300"
                />
            </div>

            <div className="flex gap-3 pt-4">
                <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 py-4 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-2xl font-black text-xs uppercase tracking-wide transition-all"
                >
                    Cancelar
                </button>
                <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 py-4 bg-red-600 text-white rounded-2xl font-black text-xs uppercase tracking-wide hover:bg-red-700 active:scale-95 transition-all disabled:opacity-60"
                >
                    {loading ? "Guardando..." : "Agregar bloqueo"}
                </button>
            </div>
        </form>
    );
}

export default function MySchedule({ availabilities = [], exceptions = [], permissions = {}, currentBranch = null }) {
    const isDesktop = useMediaQuery("(min-width: 1024px)");
    const [activeTab, setActiveTab] = useState("availabilities"); // availabilities, exceptions
    const [showAddBlockModal, setShowAddBlockModal] = useState(false);
    const [showAddExceptionModal, setShowAddExceptionModal] = useState(false);
    const [deletingId, setDeletingId]   = useState(null);
    const [saving, setSaving]           = useState(false);

    const canManage = permissions.can_manage_schedule !== false;

    // Group availabilities by day
    const byDay = DAYS.reduce((acc, _, i) => {
        acc[i] = availabilities.filter((a) => a.day_of_week === i);
        return acc;
    }, {});

    const handleAddBlock = (data, reset) => {
        setSaving(true);
        router.post(route("kine.my-schedule.availability.store"), data, {
            preserveScroll: true,
            onSuccess: () => { 
                reset(); 
                setShowAddBlockModal(false); 
                setSaving(false); 
            },
            onError: () => setSaving(false),
        });
    };

    const handleDeleteBlock = (id) => {
        if (!confirm("¿Deseas eliminar este bloque de horario?")) return;
        setDeletingId(id);
        router.delete(route("kine.my-schedule.availability.destroy", id), {
            preserveScroll: true,
            onFinish: () => setDeletingId(null),
        });
    };

    const handleAddException = (data, reset) => {
        setSaving(true);
        router.post(route("kine.my-schedule.exception.store"), data, {
            preserveScroll: true,
            onSuccess: () => { 
                reset(); 
                setShowAddExceptionModal(false); 
                setSaving(false); 
            },
            onError: () => setSaving(false),
        });
    };

    const handleDeleteException = (id) => {
        if (!confirm("¿Deseas eliminar este bloqueo de agenda?")) return;
        setDeletingId(id);
        router.delete(route("kine.my-schedule.exception.destroy", id), {
            preserveScroll: true,
            onFinish: () => setDeletingId(null),
        });
    };

    const Content = (
        <div className={`min-h-screen ${isDesktop ? "p-8" : "pb-24"} bg-gradient-to-br from-slate-50 via-white to-teal-50/20`}>
            <Head title="Mi Horario" />

            {/* ── Header Premium ── */}
            <div className={`${isDesktop ? "mb-8 bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm" : "px-5 pt-6 pb-4 bg-white border-b border-slate-100 rounded-b-[2rem] shadow-sm mb-6"}`}>
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className={`${isDesktop ? "text-3xl" : "text-2xl"} font-black text-slate-900 tracking-tight uppercase`}>
                            Mi Horario
                        </h1>
                        <div className="flex items-center gap-4 mt-2">
                            <button 
                                onClick={() => { setActiveTab("availabilities"); }} 
                                className={`text-[10px] font-black uppercase tracking-widest transition-all pb-1 ${
                                    activeTab === "availabilities" 
                                        ? "text-teal-600 border-b-2 border-teal-600" 
                                        : "text-slate-400 hover:text-slate-600"
                                }`}
                            >
                                Disponibilidad Semanal
                            </button>
                            <button 
                                onClick={() => { setActiveTab("exceptions"); }} 
                                className={`text-[10px] font-black uppercase tracking-widest transition-all pb-1 ${
                                    activeTab === "exceptions" 
                                        ? "text-red-500 border-b-2 border-red-500" 
                                        : "text-slate-400 hover:text-slate-600"
                                }`}
                            >
                                Excepciones / Días Bloqueados
                            </button>
                        </div>
                    </div>

                    {canManage ? (
                        <button
                            onClick={() => {
                                if (activeTab === "availabilities") {
                                    setShowAddBlockModal(true);
                                } else {
                                    setShowAddExceptionModal(true);
                                }
                            }}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl font-black text-xs uppercase transition-all active:scale-95 ${
                                activeTab === "availabilities"
                                    ? "bg-teal-600 text-white shadow-sm hover:bg-teal-700"
                                    : "bg-red-600 text-white shadow-sm hover:bg-red-700"
                            }`}
                        >
                            <Plus className="w-3.5 h-3.5" /> Agregar
                        </button>
                    ) : (
                        <div className="flex items-center gap-2 px-3 py-2 bg-slate-100 rounded-2xl">
                            <Lock className="w-3.5 h-3.5 text-slate-400" />
                            <span className="text-[10px] font-bold text-slate-500 uppercase">Solo lectura</span>
                        </div>
                    )}
                </div>
            </div>

            {/* ── Main Layout Grid ── */}
            <div className={`${isDesktop ? "grid grid-cols-12 gap-8" : "px-5 space-y-5"}`}>
                
                {/* ── Left / Full Col: Forms and Management ── */}
                <div className="lg:col-span-12 space-y-4">
                    
                    {/* Permission Notice if cannot manage */}
                    {!canManage && (
                        <div className="flex items-center gap-3 p-4 bg-amber-50 border border-amber-100 rounded-2xl">
                            <Info className="w-4 h-4 text-amber-500 flex-shrink-0" />
                            <p className="text-[10px] font-bold text-amber-700 uppercase tracking-wide">
                                Tu administrador gestiona tu disponibilidad. Contacta al centro si necesitas cambios.
                            </p>
                        </div>
                    )}

                    {/* ──────────────── TAB: AVAILABILITIES ──────────────── */}
                    {activeTab === "availabilities" && (
                        <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-6">
                            <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-5">
                                <Clock className="w-3.5 h-3.5 text-teal-500" />
                                Disponibilidad Semanal Recurrente
                            </h2>

                            {availabilities.length === 0 ? (
                                <div className="py-16 flex flex-col items-center justify-center text-center">
                                    <Clock className="w-12 h-12 text-slate-100 mb-3" />
                                    <h3 className="text-sm font-black text-slate-800 uppercase">Sin disponibilidad horaria</h3>
                                    <p className="text-slate-400 text-[10px] font-medium uppercase tracking-wider mt-1">Define las horas en las que atiendes recurrentemente</p>
                                    {canManage && (
                                        <button
                                            onClick={() => setShowAddBlockModal(true)}
                                            className="mt-6 px-4 py-2 bg-teal-50 hover:bg-teal-100 text-teal-700 font-black rounded-xl text-xs uppercase tracking-wide transition-all"
                                        >
                                            Definir Primer Horario
                                        </button>
                                    )}
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {DAYS.map((dayName, idx) => {
                                        const blocks = byDay[idx];
                                        if (blocks.length === 0) return null;
                                        return (
                                            <div key={idx} className="p-5 bg-slate-50/50 border border-slate-100 rounded-[2rem]">
                                                <p className="text-[9px] font-black text-teal-600 uppercase tracking-widest mb-3 border-b border-slate-100 pb-1.5">{dayName}</p>
                                                <div className="space-y-2">
                                                    {blocks.map((blk) => (
                                                        <div
                                                            key={blk.id}
                                                            className="flex items-center justify-between p-3 bg-white rounded-xl border border-slate-100 shadow-sm group"
                                                        >
                                                            <div className="min-w-0">
                                                                <div className="flex items-center gap-2">
                                                                    <span className="text-xs font-black text-slate-800">
                                                                        {blk.start_time} — {blk.end_time}
                                                                    </span>
                                                                    <span className={`px-1.5 py-0.5 rounded-md text-[8px] font-black uppercase ${modalityStyle(blk.modality)}`}>
                                                                        {modalityLabel(blk.modality)}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                            {canManage && (
                                                                <button
                                                                    onClick={() => handleDeleteBlock(blk.id)}
                                                                    disabled={deletingId === blk.id}
                                                                    className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all disabled:opacity-50"
                                                                >
                                                                    <Trash2 className="w-3.5 h-3.5" />
                                                                </button>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    )}

                    {/* ──────────────── TAB: EXCEPTIONS ──────────────── */}
                    {activeTab === "exceptions" && (
                        <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-6">
                            <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-5">
                                <CalendarOff className="w-3.5 h-3.5 text-red-500" />
                                Excepciones y Días Inhabilitados
                            </h2>

                            {exceptions.length === 0 ? (
                                <div className="py-16 flex flex-col items-center justify-center text-center">
                                    <CalendarOff className="w-12 h-12 text-slate-100 mb-3" />
                                    <h3 className="text-sm font-black text-slate-800 uppercase">Sin excepciones ni bloqueos</h3>
                                    <p className="text-slate-400 text-[10px] font-medium uppercase tracking-wider mt-1">Registra días de vacaciones, licencias o bloqueos de horas</p>
                                    {canManage && (
                                        <button
                                            onClick={() => setShowAddExceptionModal(true)}
                                            className="mt-6 px-4 py-2 bg-red-50 hover:bg-red-100 text-red-700 font-black rounded-xl text-xs uppercase tracking-wide transition-all"
                                        >
                                            Agregar Excepción
                                        </button>
                                    )}
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {exceptions.map((ex) => {
                                        const formattedDate = new Date(ex.date).toLocaleDateString("es-CL", {
                                            weekday: "short", day: "numeric", month: "short", year: "numeric"
                                        });
                                        const formattedEndDate = ex.end_date ? new Date(ex.end_date).toLocaleDateString("es-CL", {
                                            weekday: "short", day: "numeric", month: "short", year: "numeric"
                                        }) : null;

                                        return (
                                            <div key={ex.id} className="flex items-start gap-4 p-5 bg-red-50/20 border border-red-100 rounded-3xl group hover:shadow-md transition-all">
                                                <div className="w-10 h-10 bg-red-50 border border-red-100 rounded-2xl flex items-center justify-center text-red-500 shrink-0">
                                                    <Ban className="w-5 h-5" />
                                                </div>

                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-start justify-between">
                                                        <p className="text-xs font-black text-slate-800 uppercase tracking-tight">
                                                            {ex.action === "cancel" ? "Bloqueo Completo" : "Bloqueo Parcial"}
                                                        </p>
                                                        {canManage && (
                                                            <button
                                                                onClick={() => handleDeleteException(ex.id)}
                                                                disabled={deletingId === ex.id}
                                                                className="p-1.5 text-red-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-all disabled:opacity-50"
                                                            >
                                                                <Trash2 className="w-3.5 h-3.5" />
                                                            </button>
                                                        )}
                                                    </div>

                                                    <p className="text-[10px] font-bold text-red-600 uppercase mt-0.5 tracking-tight">
                                                        {formattedDate} {formattedEndDate ? `— ${formattedEndDate}` : ""}
                                                    </p>

                                                    {ex.action === "override" && (
                                                        <p className="text-[9px] font-black text-slate-500 uppercase mt-1.5 flex items-center gap-1.5">
                                                            <Clock className="w-3.5 h-3.5 text-red-400" />
                                                            {ex.override_start_time} — {ex.override_end_time}
                                                        </p>
                                                    )}

                                                    {ex.reason && (
                                                        <p className="text-[10px] text-slate-500 italic mt-2 border-t border-slate-100 pt-2 font-medium">
                                                            "{ex.reason}"
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Modal: Agregar Bloque Horario */}
            <Modal
                open={showAddBlockModal}
                onClose={() => setShowAddBlockModal(false)}
                title="Agregar Bloque Horario"
                subtitle="Establece tus horas de atención recurrente semanal"
                icon={Clock}
                maxWidth="lg"
            >
                <AddBlockForm 
                    onSubmit={handleAddBlock} 
                    loading={saving} 
                    currentBranch={currentBranch}
                    onClose={() => setShowAddBlockModal(false)}
                />
            </Modal>

            {/* Modal: Agregar Excepción de Bloqueo */}
            <Modal
                open={showAddExceptionModal}
                onClose={() => setShowAddExceptionModal(false)}
                title="Agregar Excepción / Bloqueo"
                subtitle="Registra periodos específicos en los que no atenderás"
                icon={CalendarOff}
                maxWidth="lg"
            >
                <AddExceptionForm 
                    onSubmit={handleAddException} 
                    loading={saving} 
                    onClose={() => setShowAddExceptionModal(false)}
                />
            </Modal>
        </div>
    );

    return isDesktop ? (
        <AuthenticatedLayout>{Content}</AuthenticatedLayout>
    ) : (
        <KineLayout>{Content}</KineLayout>
    );
}
