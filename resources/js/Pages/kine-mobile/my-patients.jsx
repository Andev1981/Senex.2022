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

export default function MyPatients({ patients, search, totalPatients, upcomingAppointments = [] }) {
    const defaultFilter = patients.some(p => p.has_appointment_today) ? "today" : "all";
    const [searchTerm, setSearchTerm]       = useState(search || "");
    const [localSearch, setLocalSearch]     = useState("");
    const [activeFilter, setActiveFilter]   = useState(defaultFilter);
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
        if (activeFilter === "today")    list = list.filter((p) => p.has_appointment_today);
        if (activeFilter === "active")   list = list.filter((p) => p.active_treatment);

        return list;
    }, [patients, localSearch, activeFilter]);

    // KPIs
    const kpis = useMemo(() => ({
        today:    patients.filter((p) => p.has_appointment_today).length,
        active:   patients.filter((p) => p.active_treatment).length,
        total:    patients.length,
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



            {/* ── KPI Strip ── */}
            <div className={`${isDesktop ? "mb-8" : "px-5 mb-5"}`}>
                <div className="flex gap-3">
                    <button
                        type="button"
                        onClick={() => setActiveFilter("today")}
                        className={`flex flex-col items-center justify-center rounded-2xl p-3 border flex-1 transition-all duration-300 active:scale-95 ${
                            activeFilter === "today"
                                ? "bg-slate-900 border-slate-900 text-white shadow-lg"
                                : "bg-white border-slate-100 text-slate-700 hover:bg-slate-50"
                        }`}
                    >
                        <Clock className={`w-4 h-4 mb-1 ${activeFilter === "today" ? "text-white" : "text-blue-500"}`} />
                        <span className={`text-lg font-black leading-none ${activeFilter === "today" ? "text-white" : "text-slate-900"}`}>{kpis.today}</span>
                        <span className={`text-[9px] font-black uppercase tracking-wider mt-1 ${activeFilter === "today" ? "text-slate-300" : "text-slate-400"}`}>Hoy</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => setActiveFilter("active")}
                        className={`flex flex-col items-center justify-center rounded-2xl p-3 border flex-1 transition-all duration-300 active:scale-95 ${
                            activeFilter === "active"
                                ? "bg-slate-900 border-slate-900 text-white shadow-lg"
                                : "bg-white border-slate-100 text-slate-700 hover:bg-slate-50"
                        }`}
                    >
                        <Activity className={`w-4 h-4 mb-1 ${activeFilter === "active" ? "text-white" : "text-teal-500"}`} />
                        <span className={`text-lg font-black leading-none ${activeFilter === "active" ? "text-white" : "text-slate-900"}`}>{kpis.active}</span>
                        <span className={`text-[9px] font-black uppercase tracking-wider mt-1 ${activeFilter === "active" ? "text-slate-300" : "text-slate-400"}`}>Activos</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => setActiveFilter("all")}
                        className={`flex flex-col items-center justify-center rounded-2xl p-3 border flex-1 transition-all duration-300 active:scale-95 ${
                            activeFilter === "all"
                                ? "bg-slate-900 border-slate-900 text-white shadow-lg"
                                : "bg-white border-slate-100 text-slate-700 hover:bg-slate-50"
                        }`}
                    >
                        <Users className={`w-4 h-4 mb-1 ${activeFilter === "all" ? "text-white" : "text-slate-500"}`} />
                        <span className={`text-lg font-black leading-none ${activeFilter === "all" ? "text-white" : "text-slate-900"}`}>{kpis.total}</span>
                        <span className={`text-[9px] font-black uppercase tracking-wider mt-1 ${activeFilter === "all" ? "text-slate-300" : "text-slate-400"}`}>Todos</span>
                    </button>
                </div>
            </div>

            {/* ── Search ── */}
            <div className={`${isDesktop ? "mb-6 max-w-2xl" : "px-5 mb-6"}`}>
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
