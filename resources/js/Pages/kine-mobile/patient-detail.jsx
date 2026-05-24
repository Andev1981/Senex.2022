// resources/js/pages/kine-mobile/patient-detail.jsx
import React, { useState } from "react";
import { Head, router } from "@inertiajs/react";
import moment from "moment";
import "moment/dist/locale/es";
import {
    ArrowLeft, Phone, Mail, Calendar, User, Activity,
    FileText, ChevronLeft, ChevronRight, Zap, Bone, Baby,
    AlertCircle, ShieldCheck, Stethoscope, History, Lock,
    Eye, Plus, TrendingUp, CheckCircle2, Clock3, ClipboardList,
} from "lucide-react";
import KineLayout from "@/Layouts/KineLayout";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { useMediaQuery } from "@/hooks/useMediaQuery";

moment.locale("es");

const AVATAR_COLORS = [
    "from-violet-500 to-purple-600",
    "from-teal-400 to-cyan-600",
    "from-rose-400 to-pink-600",
    "from-amber-400 to-orange-500",
    "from-blue-500 to-indigo-600",
    "from-emerald-400 to-green-600",
];
function avatarColor(name = "") {
    return AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length] ?? AVATAR_COLORS[0];
}
function initials(name = "") {
    return name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
}

function SectionHeader({ icon: Icon, label, color = "text-brand-primary" }) {
    return (
        <h2 className={`mb-5 text-[10px] font-black uppercase tracking-widest flex items-center gap-2 ${color}`}>
            <Icon className="w-3.5 h-3.5" />
            {label}
        </h2>
    );
}

function InfoRow({ icon: Icon, value, color = "text-slate-400" }) {
    if (!value) return null;
    return (
        <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center flex-shrink-0">
                <Icon className={`w-3.5 h-3.5 ${color}`} />
            </div>
            <span className="text-xs font-semibold text-slate-700">{value}</span>
        </div>
    );
}

function StatusBadge({ status }) {
    const map = {
        InProgress:  { label: "En Curso",     cls: "bg-blue-50 text-blue-600 border-blue-100" },
        Completed:   { label: "Finalizado",   cls: "bg-green-50 text-green-700 border-green-100" },
        Suspended:   { label: "Suspendido",   cls: "bg-amber-50 text-amber-700 border-amber-100" },
        Cancelled:   { label: "Cancelado",    cls: "bg-red-50 text-red-600 border-red-100" },
    };
    const s = map[status] ?? { label: status, cls: "bg-slate-50 text-slate-500 border-slate-100" };
    return (
        <span className={`px-2 py-0.5 text-[9px] font-black uppercase rounded-lg border ${s.cls}`}>
            {s.label}
        </span>
    );
}

function SessionStatusBadge({ status }) {
    const s = String(status).toLowerCase();
    if (s === "completed" || s === "completada")
        return <span className="flex items-center gap-1 px-2 py-0.5 text-[9px] font-black uppercase rounded-lg bg-green-50 text-green-700 border border-green-100"><CheckCircle2 className="w-3 h-3" />Completada</span>;
    if (s === "scheduled" || s === "programada")
        return <span className="flex items-center gap-1 px-2 py-0.5 text-[9px] font-black uppercase rounded-lg bg-blue-50 text-blue-600 border border-blue-100"><Clock3 className="w-3 h-3" />Programada</span>;
    return <span className="px-2 py-0.5 text-[9px] font-black uppercase rounded-lg bg-slate-50 text-slate-500 border border-slate-100">{status}</span>;
}

function AlertFlag({ icon: Icon, label, color }) {
    return (
        <div className={`p-3 rounded-2xl flex flex-col items-center gap-1.5 border ${color}`}>
            <Icon className="w-4 h-4" />
            <span className="text-[8px] font-black uppercase text-center leading-tight">{label}</span>
        </div>
    );
}

function LockedAction({ label }) {
    return (
        <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 border border-dashed border-slate-200 rounded-xl">
            <Lock className="w-3.5 h-3.5 text-slate-300" />
            <span className="text-[10px] font-bold text-slate-400">{label}</span>
        </div>
    );
}

export default function PatientDetail({ patient, permissions = {} }) {
    const isDesktop = useMediaQuery("(min-width: 1024px)");
    const [activeTab, setActiveTab] = useState("sessions");

    const canCreate = permissions.can_create_sessions !== false;
    const canView   = permissions.can_view_sessions !== false;

    const hasAlerts =
        patient.medical_history?.has_pacemaker ||
        patient.medical_history?.has_metal_implants ||
        patient.medical_history?.is_pregnant ||
        patient.medical_history?.cancer_history;

    const handleSessionClick = (sessionId) => {
        if (!canView) return;
        router.visit(route("kine.sessions.show", sessionId));
    };

    const Content = (
        <div className={`min-h-screen ${isDesktop ? "p-8" : "pb-24"} bg-gradient-to-br from-slate-50 via-white to-teal-50/20`}>
            <Head title={patient.name} />

            {/* ── Hero Header ── */}
            <div className={`${isDesktop ? "mb-8 bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm" : "px-5 pt-6 pb-5"}`}>
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => router.visit(route("kine.my-patients"))}
                        className="p-2.5 bg-slate-100 rounded-2xl hover:bg-slate-200 active:scale-95 transition-all flex-shrink-0"
                    >
                        {isDesktop ? <ArrowLeft className="w-5 h-5 text-slate-600" /> : <ChevronLeft className="w-5 h-5 text-slate-600" />}
                    </button>

                    {/* Avatar */}
                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${avatarColor(patient.name)} flex items-center justify-center text-white font-black text-lg shadow-sm flex-shrink-0`}>
                        {initials(patient.name)}
                    </div>

                    <div className="flex-1 min-w-0">
                        <h1 className={`${isDesktop ? "text-3xl" : "text-xl"} font-black text-slate-900 tracking-tight leading-none uppercase`}>
                            {patient.name}
                        </h1>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                            {patient.rut}
                        </p>
                        {hasAlerts && (
                            <div className="flex items-center gap-1 mt-2">
                                <AlertCircle className="w-3.5 h-3.5 text-red-500" />
                                <span className="text-[9px] font-black text-red-600 uppercase tracking-widest">Alertas clínicas activas</span>
                            </div>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                        {patient.phone && (
                            <a
                                href={`tel:${patient.phone}`}
                                className="p-3 bg-teal-600 text-white rounded-2xl shadow-sm hover:bg-teal-700 active:scale-95 transition-all"
                            >
                                <Phone className="w-4 h-4" />
                            </a>
                        )}
                        {canCreate ? (
                            <button
                                onClick={() => router.visit(route("kine.sessions.create", { patient_id: patient.id }))}
                                className="flex items-center gap-2 px-4 py-2.5 bg-violet-600 text-white rounded-2xl shadow-sm hover:bg-violet-700 active:scale-95 transition-all text-xs font-black uppercase"
                            >
                                <Plus className="w-3.5 h-3.5" />
                                {isDesktop ? "Nueva sesión" : ""}
                            </button>
                        ) : (
                            <div className="flex items-center gap-1.5 px-3 py-2.5 bg-slate-100 text-slate-400 rounded-2xl text-xs font-bold">
                                <Lock className="w-3.5 h-3.5" />
                                {isDesktop && <span className="uppercase">Sin permiso</span>}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* ── Content grid ── */}
            <div className={`${isDesktop ? "grid grid-cols-12 gap-8" : "px-5 space-y-5"}`}>

                {/* ── Left col ── */}
                <div className="lg:col-span-4 space-y-5">

                    {/* Datos personales */}
                    <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-6">
                        <SectionHeader icon={User} label="Datos del paciente" />
                        <div className="space-y-3">
                            <InfoRow icon={Phone} value={patient.phone} color="text-teal-500" />
                            <InfoRow icon={Mail}  value={patient.email} color="text-blue-500" />
                            <InfoRow
                                icon={Calendar}
                                value={patient.birth_date ? moment(patient.birth_date).format("DD/MM/YYYY") : null}
                                color="text-violet-500"
                            />
                        </div>
                        {patient.emergency_contact && (
                            <div className="mt-5 pt-5 border-t border-slate-50">
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Contacto de emergencia</p>
                                <p className="text-sm font-black text-slate-900 uppercase">{patient.emergency_contact.name}</p>
                                <p className="text-xs font-bold text-slate-500 mt-0.5">{patient.emergency_contact.phone}</p>
                            </div>
                        )}
                    </div>

                    {/* Alertas clínicas */}
                    <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-6">
                        <SectionHeader icon={Stethoscope} label="Antecedentes & Alertas" color="text-red-500" />

                        {hasAlerts ? (
                            <div className="grid grid-cols-2 gap-2 mb-5">
                                {patient.medical_history?.has_pacemaker    && <AlertFlag icon={Zap}         label="Marcapasos" color="bg-red-50 border-red-100 text-red-600 animate-pulse" />}
                                {patient.medical_history?.has_metal_implants && <AlertFlag icon={Bone}      label="Implantes"  color="bg-orange-50 border-orange-100 text-orange-600" />}
                                {patient.medical_history?.is_pregnant       && <AlertFlag icon={Baby}       label="Embarazo"   color="bg-purple-50 border-purple-100 text-purple-600" />}
                                {patient.medical_history?.cancer_history    && <AlertFlag icon={AlertCircle} label="Cáncer"    color="bg-amber-50 border-amber-100 text-amber-600" />}
                            </div>
                        ) : (
                            <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-100 rounded-2xl mb-5">
                                <ShieldCheck className="w-4 h-4 text-green-600" />
                                <span className="text-[9px] font-black text-green-700 uppercase tracking-widest">Sin alertas críticas</span>
                            </div>
                        )}

                        <div className="space-y-4">
                            {[
                                { key: "pathologies",    label: "Patologías",             cls: "bg-slate-100 text-slate-600" },
                                { key: "medications",    label: "Medicamentos",           cls: "bg-blue-50 text-blue-600" },
                                { key: "fractures",      label: "Fracturas / Lesiones",   cls: "bg-orange-50 text-orange-600" },
                                { key: "family_history", label: "Antecedentes familiares", cls: "bg-violet-50 text-violet-600" },
                            ].map(({ key, label, cls }) =>
                                patient.medical_history?.[key]?.length > 0 ? (
                                    <div key={key}>
                                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1.5">{label}</p>
                                        <div className="flex flex-wrap gap-1">
                                            {patient.medical_history[key].map((item, i) => (
                                                <span key={i} className={`px-2 py-0.5 text-[9px] font-bold rounded-md uppercase ${cls}`}>{item}</span>
                                            ))}
                                        </div>
                                    </div>
                                ) : null
                            )}
                        </div>
                    </div>

                    {/* Tratamientos */}
                    <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-6">
                        <SectionHeader icon={Activity} label="Tratamientos" />
                        {patient.treatments.length === 0 ? (
                            <div className="py-8 text-center">
                                <ClipboardList className="w-10 h-10 mx-auto mb-3 text-slate-100" />
                                <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">Sin tratamientos</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {patient.treatments.map((treatment) => (
                                    <div key={treatment.id} className="p-4 bg-slate-50/50 border border-slate-100 rounded-2xl">
                                        <div className="flex items-start justify-between mb-3">
                                            <div className="min-w-0">
                                                <p className="text-xs font-black text-slate-900 uppercase truncate">{treatment.session_type}</p>
                                                {treatment.diagnosis && (
                                                    <p className="text-[10px] font-semibold text-slate-500 mt-0.5 truncate">{treatment.diagnosis}</p>
                                                )}
                                            </div>
                                            <StatusBadge status={treatment.status} />
                                        </div>
                                        {treatment.progress.total > 0 && (
                                            <>
                                                <div className="flex justify-between text-[9px] font-black text-slate-400 uppercase mb-1.5">
                                                    <span>Progreso</span>
                                                    <span>{treatment.progress.completed}/{treatment.progress.total} · {treatment.progress.percentage}%</span>
                                                </div>
                                                <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-gradient-to-r from-teal-400 to-cyan-400 rounded-full transition-all duration-700"
                                                        style={{ width: `${treatment.progress.percentage}%` }}
                                                    />
                                                </div>
                                            </>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* ── Right col: Historial de Sesiones ── */}
                <div className="lg:col-span-8">
                    <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-6 h-full">
                        <div className="flex items-center justify-between mb-6">
                            <SectionHeader icon={History} label="Historial de atenciones" />
                            {/* Permission badge */}
                            {!canView && (
                                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 rounded-xl">
                                    <Lock className="w-3 h-3 text-slate-400" />
                                    <span className="text-[9px] font-black text-slate-500 uppercase">Solo consulta restringida</span>
                                </div>
                            )}
                        </div>

                        {patient.recent_sessions.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-20">
                                <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-4">
                                    <FileText className="w-8 h-8 text-slate-200" />
                                </div>
                                <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">Sin sesiones registradas</p>
                            </div>
                        ) : (
                            <div className={`grid grid-cols-1 ${isDesktop ? "md:grid-cols-2" : ""} gap-3`}>
                                {patient.recent_sessions.map((session) => (
                                    <div
                                        key={session.id}
                                        onClick={() => handleSessionClick(session.id)}
                                        className={`group flex items-center gap-4 p-4 border rounded-2xl transition-all ${
                                            canView
                                                ? "border-slate-100 bg-slate-50/50 hover:bg-white hover:border-teal-200 hover:shadow-md cursor-pointer"
                                                : "border-slate-100 bg-slate-50/30 cursor-not-allowed opacity-75"
                                        }`}
                                    >
                                        {/* Icon */}
                                        <div className={`w-11 h-11 rounded-xl flex-shrink-0 flex items-center justify-center shadow-sm transition-colors ${
                                            canView
                                                ? "bg-white text-teal-600 group-hover:bg-teal-600 group-hover:text-white"
                                                : "bg-slate-100 text-slate-300"
                                        }`}>
                                            {canView ? <Eye className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                                        </div>

                                        {/* Info */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between mb-1">
                                                <p className="text-xs font-black text-slate-900 uppercase truncate pr-2">
                                                    {session.session_type}
                                                </p>
                                                <SessionStatusBadge status={session.status} />
                                            </div>
                                            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-tight">
                                                {moment(session.date).format("DD/MM/YYYY")} · {session.time}
                                            </p>
                                            {session.notes && canView && (
                                                <p className="mt-1.5 text-[9px] text-slate-500 italic line-clamp-2 leading-relaxed">
                                                    {session.notes}
                                                </p>
                                            )}
                                            {!canView && (
                                                <p className="mt-1 text-[9px] text-slate-400 font-bold uppercase tracking-widest flex items-center gap-1">
                                                    <Lock className="w-2.5 h-2.5" /> Detalle restringido
                                                </p>
                                            )}
                                        </div>

                                        {canView && (
                                            <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-teal-500 group-hover:translate-x-0.5 transition-all flex-shrink-0" />
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );

    return isDesktop ? (
        <AuthenticatedLayout>{Content}</AuthenticatedLayout>
    ) : (
        <KineLayout>{Content}</KineLayout>
    );
}
