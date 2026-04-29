// resources/js/pages/kine-mobile/dashboard.jsx
import React, { useState } from "react";
import { Head, router } from "@inertiajs/react";
import {
  Calendar,
  Users,
  TrendingUp,
  Clock,
  CheckCircle2,
  XCircle,
  ChevronRight,
  RefreshCw,
  Wallet
} from "lucide-react";
import KineLayout from "@/Layouts/KineLayout";
import KPICard from "./Partials/KPICard";
import SessionCard from "./Partials/SessionCard";
import QuickActions from "./Partials/QuickActions";
import StatsBadge from "./Partials/StatsBadge";

export default function Dashboard({
  doctor,
  kpis,
  agenda,
  upcomingSessions,
  activePatientsCount,
}) {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = () => {
    setIsRefreshing(true);
    router.reload({
      only: ["kpis", "agenda"],
      onFinish: () => {
        setTimeout(() => setIsRefreshing(false), 500);
      },
    });
  };

  const handleCompleteSession = (session) => {
    router.visit(route('kine.sessions.form', session.id));
  };

  return (
    <KineLayout>
      <Head title="Mi Dashboard" />

      <div className="min-h-screen pb-24 bg-[#FDFDFD]">
        
        {/* Welcome Section */}
        <div className="px-6 py-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                        Hola, {doctor.name.split(" ")[0]} 👋
                    </h1>
                    <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mt-1">
                        {doctor.speciality || 'Kinesiólogo'}
                    </p>
                </div>
                <button
                    onClick={handleRefresh}
                    disabled={isRefreshing}
                    className="w-10 h-10 flex items-center justify-center bg-white border border-slate-100 rounded-2xl shadow-sm active:scale-90 transition-all"
                >
                    <RefreshCw
                        className={`w-4 h-4 text-brand-primary ${isRefreshing ? "animate-spin" : ""}`}
                    />
                </button>
            </div>
        </div>

        {/* Stats Grid - Fijo 4 Columnas al 100% */}
        <div className="px-6 grid grid-cols-4 gap-2 mb-6">
            <StatsBadge
                icon={Calendar}
                label="Hoy"
                value={kpis.sessions_today}
                color="brand"
            />
            <StatsBadge
                icon={CheckCircle2}
                label="Hechas"
                value={kpis.completed_today}
                color="green"
            />
            <StatsBadge
                icon={Clock}
                label="Pen."
                value={kpis.pending_today}
                color="blue"
            />
            <StatsBadge
                icon={TrendingUp}
                label="Próx."
                value={upcomingSessions}
                color="gray"
            />
        </div>

        {/* Wallet Highlight */}
        <div className="px-6 mb-8">
            <div className="bg-slate-900 p-5 rounded-[32px] shadow-xl shadow-slate-200">
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="bg-brand-primary/20 p-2.5 rounded-xl">
                            <Wallet className="w-5 h-5 text-brand-primary" />
                        </div>
                        <div>
                            <p className="text-slate-400 text-[9px] font-black uppercase tracking-widest leading-none mb-1">Ganancias del Mes</p>
                            <h2 className="text-white text-2xl font-black tracking-tighter leading-none">
                                ${kpis.month_earnings.toLocaleString("es-CL")}
                            </h2>
                        </div>
                    </div>
                    <div className="flex flex-col items-end">
                         <span className="text-[10px] font-black text-brand-primary uppercase tracking-widest">{kpis.month_sessions}</span>
                         <span className="text-[8px] font-bold text-slate-500 uppercase">Atenciones</span>
                    </div>
                </div>
            </div>
        </div>

        {/* Agenda Section */}
        <div className="px-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-black text-slate-900 tracking-tight">
              Mi agenda de hoy
            </h2>
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
              {new Date().toLocaleDateString("es-CL", { weekday: 'short', day: 'numeric', month: 'short' })}
            </span>
          </div>

          {agenda.length === 0 ? (
            <div className="p-12 text-center bg-white border border-slate-100 rounded-[32px]">
              <Calendar className="w-12 h-12 mx-auto mb-4 text-slate-200" />
              <p className="text-slate-400 font-bold text-sm">No tienes citas programadas hoy</p>
            </div>
          ) : (
            <div className="space-y-4">
              {agenda.map((session) => (
                <SessionCard
                  key={session.id}
                  session={session}
                  onComplete={() => handleCompleteSession(session)}
                />
              ))}
            </div>
          )}
        </div>

        <QuickActions />
      </div>
    </KineLayout>
  );
}
