// resources/js/pages/kine-mobile/my-patients.jsx
import React, { useState, useMemo } from "react";
import { Head, router } from "@inertiajs/react";
import {
    Search, Users, XCircle, Activity, CheckCircle,
    Clock, AlertCircle, SlidersHorizontal, X, TrendingUp, ChevronRight
} from "lucide-react";
import KineLayout from "@/Layouts/KineLayout";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import PatientCard from "./Partials/PatientCard";
import { useMediaQuery } from "@/hooks/useMediaQuery";

const FILTERS = [
    { key: "all",      label: "Todos",        icon: Users,        color: "text-slate-600",  bg: "bg-slate-100",       activeBg: "bg-slate-700",    activeText: "text-white" },
    { key: "active",   label: "Con tratamiento", icon: Activity,  color: "text-teal-600",   bg: "bg-teal-50",         activeBg: "bg-teal-600",     activeText: "text-white" },
    { key: "inactive", label: "Sin tratamiento", icon: Clock,     color: "text-slate-400",  bg: "bg-slate-50",        activeBg: "bg-slate-500",    activeText: "text-white" },
    { key: "progress", label: "+50% avance",   icon: TrendingUp,  color: "text-violet-600", bg: "bg-violet-50",       activeBg: "bg-violet-600",   activeText: "text-white" },
];

function StatPill({ icon: Icon, value, label, color }) {
    return (
        <div className="flex flex-col items-center justify-center bg-white rounded-2xl p-3 border border-slate-100 shadow-sm flex-1">
            <Icon className={`w-4 h-4 mb-1 ${color}`} />
            <span className="text-lg font-black text-slate-900">{value}</span>
            <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wide leading-tight text-center">{label}</span>
        </div>
    );
}

export default function MyPatients({ patients, search, totalPatients, upcomingAppointments = [] }) {
    const [searchTerm, setSearchTerm]       = useState(search || "");
    const [localSearch, setLocalSearch]     = useState("");
    const [activeFilter, setActiveFilter]   = useState("all");
    const isDesktop = useMediaQuery("(min-width: 1024px)");

    // Server-side search
    const handleSearch = (e) => {
        e.preventDefault();
        router.get(route("kine.my-patients"), { search: searchTerm }, {
            preserveState: true, preserveScroll: true,
        });
    };

    const handleClearSearch = () => {
        setSearchTerm("");
        router.get(route("kine.my-patients"), {}, {
            preserveState: true, preserveScroll: true,
        });
    };

    const handlePatientClick = (patientId) => {
        router.visit(route("kine.patient.show", patientId));
    };

    // Client-side filter + local search
    const filtered = useMemo(() => {
        let list = patients;

        // Local text filter
        if (localSearch.trim()) {
            const q = localSearch.toLowerCase();
            list = list.filter(
                (p) =>
                    p.name?.toLowerCase().includes(q) ||
                    p.rut?.toLowerCase().includes(q) ||
                    p.phone?.toLowerCase().includes(q)
            );
        }

        // Status filter
        if (activeFilter === "active")   list = list.filter((p) => p.active_treatment);
        if (activeFilter === "inactive") list = list.filter((p) => !p.active_treatment);
        if (activeFilter === "progress") {
            list = list.filter((p) => {
                if (!p.active_treatment) return false;
                const prog = p.active_treatment.progress ?? "";
                if (prog.includes("∞")) return true;
                const [done, total] = prog.split("/").map(Number);
                return total > 0 && done / total >= 0.5;
            });
        }

        return list;
    }, [patients, localSearch, activeFilter]);

    // KPIs
    const kpis = useMemo(() => ({
        total:    patients.length,
        active:   patients.filter((p) => p.active_treatment).length,
        inactive: patients.filter((p) => !p.active_treatment).length,
        progress: patients.filter((p) => {
            if (!p.active_treatment) return false;
            const prog = p.active_treatment.progress ?? "";
            if (prog.includes("∞")) return true;
            const [done, total] = prog.split("/").map(Number);
            return total > 0 && done / total >= 0.5;
        }).length,
    }), [patients]);

    const filterCounts = {
        all:      kpis.total,
        active:   kpis.active,
        inactive: kpis.inactive,
        progress: kpis.progress,
    };

    const Content = (
        <div className={`min-h-screen ${isDesktop ? "p-8" : "pb-24"} bg-gradient-to-br from-slate-50 via-white to-teal-50/30`}>
            <Head title="Mis Pacientes" />

            {/* ── Header ── */}
            <div className={`${isDesktop ? "mb-8" : "px-5 pt-6 pb-4"}`}>
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className={`${isDesktop ? "text-3xl" : "text-2xl"} font-black text-slate-900 tracking-tight`}>
                            Mis Pacientes
                        </h1>
                        <p className="text-xs text-slate-400 font-medium mt-0.5">
                            {kpis.active} con tratamiento activo · {kpis.total} total
                        </p>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-teal-600 rounded-full shadow-sm">
                        <Users className="w-3.5 h-3.5 text-white" />
                        <span className="text-[11px] font-black text-white uppercase tracking-widest">
                            {totalPatients}
                        </span>
                    </div>
                </div>
            </div>

            {/* ── Próximas Citas Carousel ── */}
            {upcomingAppointments.length > 0 && (
                <div className={`${isDesktop ? "mb-8" : "px-5 mb-6"}`}>
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-teal-600 animate-pulse" /> Próximas Citas Programadas
                    </h3>
                    <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar scroll-smooth">
                        {upcomingAppointments.map((apt) => (
                            <div 
                                key={apt.id} 
                                onClick={() => router.visit(route("kine.patient.show", apt.patient_id))}
                                className="flex-shrink-0 w-64 p-4 bg-white border border-slate-100 rounded-[24px] shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group active:scale-[0.98]"
                            >
                                <div>
                                    <div className="flex items-center justify-between mb-3">
                                        <span className="text-[8px] font-black text-teal-600 bg-teal-50 px-2 py-1 rounded-lg uppercase tracking-wider">
                                            {apt.time}
                                        </span>
                                        <span className={`text-[8px] font-black px-2 py-0.5 rounded-lg uppercase tracking-wider ${
                                            apt.status === 'checked_in' ? 'bg-orange-50 text-orange-600 border border-orange-100' :
                                            apt.status === 'in_progress' ? 'bg-purple-50 text-purple-600 border border-purple-100' :
                                            'bg-blue-50 text-blue-600 border border-blue-100'
                                        }`}>
                                            {apt.status === 'checked_in' ? 'Llegó' : apt.status === 'in_progress' ? 'En box' : 'Programada'}
                                        </span>
                                    </div>
                                    <h4 className="text-xs font-black text-slate-800 uppercase truncate mb-0.5 group-hover:text-teal-600 transition-colors">
                                        {apt.patient_name}
                                    </h4>
                                    <p className="text-[9px] font-bold text-slate-400 uppercase truncate">
                                        {apt.service_name}
                                    </p>
                                </div>
                                <div className="mt-3 flex items-center justify-between border-t border-slate-50 pt-2 text-[9px] font-bold text-slate-400 uppercase">
                                    <span>{apt.date}</span>
                                    <span className="text-teal-600 font-black flex items-center gap-0.5 group-hover:underline">
                                        Ficha <ChevronRight className="w-3.5 h-3.5 text-teal-600 transition-transform group-hover:translate-x-0.5" />
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* ── KPI Strip ── */}
            <div className={`${isDesktop ? "mb-8" : "px-5 mb-5"}`}>
                <div className="flex gap-3">
                    <StatPill icon={Users}       value={kpis.total}    label="Total"     color="text-slate-500" />
                    <StatPill icon={Activity}    value={kpis.active}   label="Activos"   color="text-teal-500" />
                    <StatPill icon={Clock}       value={kpis.inactive} label="Sin tto."  color="text-slate-400" />
                    <StatPill icon={TrendingUp}  value={kpis.progress} label="+50% av."  color="text-violet-500" />
                </div>
            </div>

            {/* ── Search ── */}
            <div className={`${isDesktop ? "mb-6 max-w-2xl" : "px-5 mb-4"}`}>
                <form onSubmit={handleSearch} className="relative group">
                    <Search className="absolute w-4 h-4 text-slate-400 transition-colors group-focus-within:text-teal-600 transform -translate-y-1/2 left-4 top-1/2" />
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => {
                            setSearchTerm(e.target.value);
                            setLocalSearch(e.target.value);
                        }}
                        placeholder="Nombre, RUT o teléfono..."
                        className="w-full py-3.5 pl-11 pr-12 bg-white border border-slate-100 rounded-2xl shadow-sm focus:ring-4 focus:ring-teal-500/10 focus:border-teal-400/40 transition-all text-sm font-semibold placeholder:text-slate-300"
                    />
                    {(searchTerm || localSearch) && (
                        <button
                            type="button"
                            onClick={() => { setSearchTerm(""); setLocalSearch(""); }}
                            className="absolute text-slate-300 w-8 h-8 flex items-center justify-center transform -translate-y-1/2 right-3 top-1/2 hover:text-slate-500 transition-colors"
                        >
                            <XCircle className="w-4 h-4" />
                        </button>
                    )}
                </form>
            </div>

            {/* ── Filter Pills ── */}
            <div className={`${isDesktop ? "mb-8" : "px-5 mb-5"}`}>
                <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
                    {FILTERS.map((f) => {
                        const Icon = f.icon;
                        const isActive = activeFilter === f.key;
                        return (
                            <button
                                key={f.key}
                                onClick={() => setActiveFilter(f.key)}
                                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-200 border ${
                                    isActive
                                        ? `${f.activeBg} ${f.activeText} border-transparent shadow-md`
                                        : `${f.bg} ${f.color} border-slate-100 hover:border-slate-200`
                                }`}
                            >
                                <Icon className="w-3.5 h-3.5" />
                                {f.label}
                                <span className={`ml-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-black ${
                                    isActive ? "bg-white/20 text-white" : "bg-white text-slate-500"
                                }`}>
                                    {filterCounts[f.key]}
                                </span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* ── Patient Grid ── */}
            <div className={isDesktop ? "" : "px-5"}>
                {filtered.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 bg-white rounded-3xl border border-slate-100 shadow-sm">
                        <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mb-4">
                            <Users className="w-8 h-8 text-slate-300" />
                        </div>
                        <p className="text-slate-400 font-bold text-sm mb-1">
                            {localSearch || searchTerm ? "Sin resultados para tu búsqueda" : "Sin pacientes en este filtro"}
                        </p>
                        <p className="text-slate-300 text-xs font-medium">
                            {activeFilter !== "all" ? "Intenta con otro filtro" : "No tienes pacientes asignados aún"}
                        </p>
                        {activeFilter !== "all" && (
                            <button
                                onClick={() => setActiveFilter("all")}
                                className="mt-4 flex items-center gap-1.5 text-xs text-teal-600 font-bold hover:underline"
                            >
                                <X className="w-3.5 h-3.5" />
                                Ver todos
                            </button>
                        )}
                    </div>
                ) : (
                    <>
                        <p className="text-[11px] text-slate-400 font-semibold mb-3">
                            Mostrando <span className="font-black text-slate-700">{filtered.length}</span> de {kpis.total} pacientes
                        </p>
                        <div className={`grid grid-cols-1 ${isDesktop ? "md:grid-cols-2 lg:grid-cols-3" : ""} gap-4`}>
                            {filtered.map((patient) => (
                                <PatientCard
                                    key={patient.id}
                                    patient={patient}
                                    onClick={() => handlePatientClick(patient.id)}
                                />
                            ))}
                        </div>
                    </>
                )}
            </div>
        </div>
    );

    return isDesktop ? (
        <AuthenticatedLayout>{Content}</AuthenticatedLayout>
    ) : (
        <KineLayout>{Content}</KineLayout>
    );
}
