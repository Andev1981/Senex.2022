// resources/js/pages/kine-mobile/my-sessions.jsx
import React, { useState } from "react";
import { Head, router } from "@inertiajs/react";
import {
  Calendar,
  Filter,
  TrendingUp,
  CheckCircle2,
  Clock,
  XCircle,
  Wallet
} from "lucide-react";
import KineLayout from "@/Layouts/KineLayout";
import SessionCard from "./Partials/SessionCard";
import StatsBadge from "./Partials/StatsBadge";

export default function MySessions({ sessions, stats, filters }) {
  const [showFilters, setShowFilters] = useState(false);
  
  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const [y, m, d] = dateStr.split("-");
    const months = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];
    return `${d} ${months[parseInt(m) - 1]}`;
  };

  const periodLabel = `${formatDate(filters.start_date)} - ${formatDate(filters.end_date)}`;

  const [localFilters, setLocalFilters] = useState({
    start_date: filters.start_date,
    end_date: filters.end_date,
    status: filters.status || "",
  });

  const handleApplyFilters = () => {
    router.get(route("kine.my-sessions"), localFilters, {
      preserveState: true,
      preserveScroll: true,
    });
    setShowFilters(false);
  };

  const handleClearFilters = () => {
    const defaultFilters = {
      start_date: new Date().toISOString().split("T")[0].slice(0, 8) + "01",
      end_date: new Date().toISOString().split("T")[0],
      status: "",
    };
    setLocalFilters(defaultFilters);
    router.get(route("kine.my-sessions"), defaultFilters, {
      preserveState: true,
      preserveScroll: true,
    });
    setShowFilters(false);
  };

  return (
    <KineLayout>
      <Head title="Mis Sesiones" />

      <div className="min-h-screen pb-24 bg-[#FDFDFD]">
        {/* Content Header */}
        <div className="px-6 py-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-black text-slate-900 tracking-tight">Mi Agenda</h1>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                  {periodLabel}
                </p>
              </div>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`w-10 h-10 flex items-center justify-center rounded-2xl shadow-sm transition-all ${showFilters ? 'bg-brand-primary text-white' : 'bg-white border border-slate-100 text-slate-400'}`}
              >
                <Filter className="w-4 h-4" />
              </button>
            </div>

            {/* Stats Grid - Fijo 4 Columnas al 100% */}
            <div className="grid grid-cols-4 gap-2 mb-6">
              <StatsBadge
                icon={Calendar}
                label="Total"
                value={stats.total}
                color="gray"
              />
              <StatsBadge
                icon={CheckCircle2}
                label="Hechas"
                value={stats.completed}
                color="green"
              />
              <StatsBadge
                icon={Clock}
                label="Pend."
                value={stats.pending}
                color="brand"
              />
              <StatsBadge
                icon={XCircle}
                label="Anul."
                value={stats.cancelled}
                color="red"
              />
            </div>
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="px-6 pb-6 space-y-4 border-b border-slate-100 animate-in slide-in-from-top duration-300">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block mb-1.5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Desde</label>
                <input type="date" value={localFilters.start_date} onChange={(e) => setLocalFilters({ ...localFilters, start_date: e.target.value })} className="w-full px-4 py-3 bg-slate-50 border-transparent rounded-2xl text-sm font-bold focus:ring-4 focus:ring-brand-primary/5 focus:bg-white transition-all" />
              </div>
              <div>
                <label className="block mb-1.5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Hasta</label>
                <input type="date" value={localFilters.end_date} onChange={(e) => setLocalFilters({ ...localFilters, end_date: e.target.value })} className="w-full px-4 py-3 bg-slate-50 border-transparent rounded-2xl text-sm font-bold focus:ring-4 focus:ring-brand-primary/5 focus:bg-white transition-all" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
                <button onClick={handleClearFilters} className="py-4 text-[10px] font-black uppercase tracking-widest text-slate-500 bg-slate-100 rounded-2xl">Limpiar</button>
                <button onClick={handleApplyFilters} className="py-4 text-[10px] font-black uppercase tracking-widest text-white bg-brand-primary rounded-2xl shadow-lg shadow-brand-primary/20">Aplicar</button>
            </div>
          </div>
        )}

        {/* List Section */}
        <div className="px-6 py-4 space-y-4">
          {sessions.length === 0 ? (
            <div className="p-12 text-center bg-white border border-slate-100 rounded-[32px]">
              <Calendar className="w-12 h-12 mx-auto mb-4 text-slate-200" />
              <p className="text-slate-400 font-bold text-sm">No hay sesiones en este rango</p>
            </div>
          ) : (
            <div className="space-y-4">
              {sessions.map((session) => (
                <SessionCard key={session.id} session={session} />
              ))}
            </div>
          )}
        </div>
      </div>
    </KineLayout>
  );
}
