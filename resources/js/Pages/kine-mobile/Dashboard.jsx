// resources/js/pages/kine-mobile/dashboard.jsx
import React, { useState, useMemo, useRef, useEffect } from "react";
import { Head, Link, router, usePage } from "@inertiajs/react";
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock,
  User,
  CheckCircle,
  XCircle,
  MoreVertical,
  ChevronDown,
  Repeat,
  X,
  Grid,
  List,
  Layers,
  Activity,
  Sparkles,
  CalendarDays,
  MapPin,
  Coffee,
  UserCheck,
  ChevronRight as ChevronRightIcon,
  AlertCircle,
  RefreshCw,
  Users,
  TrendingUp,
  FileText,
  FilterX
} from "lucide-react";
import KineLayout from "@/Layouts/KineLayout";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import Swal from "sweetalert2";

// Importación de componentes de agendas
import NewAppointmentModal from "../agendas/Partials/NewAppointmentModal";
import AppointmentDetailModal from "../agendas/Partials/AppointmentDetailModal";
import CheckInModal from "../agendas/Partials/CheckInModal";
import QuickPatientModal from "@/components/clinical/QuickPatientModal";

import {
  formatLocalDate,
  isToday,
  isDatePast,
  getAppointmentsForDate as getAppointmentsForDateHelper,
  getNextHourTimes,
  getStatusLabel,
  getStatusColors,
  getDaysInMonth,
  getWeekDays,
  monthNames,
  dayNames,
} from "@/helpers/agenda";

const hours = Array.from({ length: 12 }, (_, i) => i + 8);

export default function Dashboard({
  doctor,
  kpis: initialKpis, // Conservamos por compatibilidad de props, pero calcularemos dinámicamente
  pendingClosure = [],
  activePatientsCount,
  appointments = [],
  doctors = [],
  patients = [],
  items = [],
  rooms = [],
  availabilities = [],
  holidays = [],
  exceptions = [],
  regions = [],
  communes = [],
  currentBranch = null,
  agreements = []
}) {
  const isDesktop = useMediaQuery("(min-width: 1024px)");
  const { props: pageProps } = usePage();
  const auth = pageProps?.auth ?? {};
  const doctorBranch = auth?.doctor_branch ?? {};
  const userPermissions = auth?.permissions ?? [];
  const userRoles = auth?.roles ?? [];
  const hasSpecialPermission = userRoles.includes("superadmin") || 
                               userRoles.includes("admin") || 
                               userPermissions.includes("treatment-sessions.manage") || 
                               userPermissions.includes("sessions.manage");
                               
  const canCreate = (doctorBranch?.can_create_sessions !== false) || hasSpecialPermission;
  const canView = (doctorBranch?.can_view_sessions !== false) || hasSpecialPermission;
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState("week"); // week, day
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showNewAppointment, setShowNewAppointment] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState(null);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showCheckInModal, setShowCheckInModal] = useState(false);
  const [showQuickPatientModal, setShowQuickPatientModal] = useState(false);
  const [isDateLocked, setIsDateLocked] = useState(false);
  const [localPatients, setLocalPatients] = useState(patients);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // --- 🎯 UTILIDADES DE TIEMPO Y FECHA ---
  const isAppointmentStale = (apt) => {
    if (['completed', 'cancelled', 'not_show'].includes(apt.status)) return false;
    const endDateTime = new Date(`${apt.date}T${apt.end_time}`);
    return endDateTime < new Date();
  };

  const handlePatientCreated = (newPatient) => {
    if (newPatient) {
        const formatted = { ...newPatient, full_name: `${newPatient.name} ${newPatient.last_name}` };
        setLocalPatients(prev => [...prev, formatted]);
    }
  };
  
  // Referencia para scroll suave al bloque de SOAP pendientes
  const soapAlertRef = useRef(null);

  // --- 🔍 FILTROS DINÁMICOS ---
  const [statusFilter, setStatusFilter] = useState("todos"); // Filtro por KPI de Estatus ("todos", "completed", "pending", "in_box")

  // --- 📅 DETERMINAR ATENCIONES SEGÚN RANGO VISIBLE DEL CALENDARIO ---
  const rangeAppointments = useMemo(() => {
    // Filtrar citas únicamente de este kinesiólogo (excluyendo canceladas si se prefiere)
    const myAppts = appointments.filter(apt => apt.doctor_id === doctor.id);

    if (viewMode === "week") {
      const weekDays = getWeekDays(selectedDate);
      const startStr = formatLocalDate(weekDays[0]);
      const endStr = formatLocalDate(weekDays[6]);
      return myAppts.filter(apt => apt.date >= startStr && apt.date <= endStr);
    } else {
      // viewMode === "day"
      const dayStr = formatLocalDate(selectedDate);
      return myAppts.filter(apt => apt.date === dayStr);
    }
  }, [appointments, doctor.id, viewMode, selectedDate]);

  // --- 📊 CALCULAR KPIs DINÁMICOS EN BASE AL RANGO VISIBLE ---
  const dynamicKpis = useMemo(() => {
    const activeAppts = rangeAppointments.filter(a => a.status !== 'cancelled');
    return {
      total: activeAppts.length,
      completed: activeAppts.filter(a => a.status === 'completed').length,
      pending: activeAppts.filter(a => ['scheduled', 'confirmed'].includes(a.status)).length,
      inBox: activeAppts.filter(a => ['checked_in', 'in_progress'].includes(a.status)).length,
      soapPending: pendingClosure.length
    };
  }, [rangeAppointments, pendingClosure]);

  // Etiqueta dinámica de rango temporal para los KPIs
  const rangeLabel = useMemo(() => {
    if (viewMode === "week") return "Sem.";
    return "Hoy";
  }, [viewMode]);

  // --- 🎯 FILTRAR CITAS VISIBLES EN EL CALENDARIO (KPI Estatus) ---
  const filteredAppointments = useMemo(() => {
    let filtered = appointments.filter(apt => apt.doctor_id === doctor.id);
    
    // Filtrar por estatus clínico (KPI clickeable)
    if (statusFilter === "completed") {
      filtered = filtered.filter(apt => apt.status === "completed");
    } else if (statusFilter === "pending") {
      filtered = filtered.filter(apt => ["scheduled", "confirmed"].includes(apt.status));
    } else if (statusFilter === "in_box") {
      filtered = filtered.filter(apt => ["checked_in", "in_progress"].includes(apt.status));
    }

    return filtered;
  }, [appointments, doctor.id, statusFilter]);

  const getAppointmentsForDate = (date) => {
    return getAppointmentsForDateHelper(date, filteredAppointments);
  };

  const getDayCapacityStats = (date) => {
    const dateStr = formatLocalDate(date);
    const dayOfWeek = ["SU", "MO", "TU", "WE", "TH", "FR", "SA"][date.getDay()];
    
    const holiday = holidays.find(h => h.date === dateStr || (h.is_recurring && h.date.substring(5) === dateStr.substring(5)));
    const hasSpecialOpening = Array.isArray(exceptions) && exceptions.some(ex => ex.date === dateStr && ex.action === 'open');
    const branchSchedule = currentBranch?.schedule?.[dayOfWeek];
    const isBranchOpen = branchSchedule && branchSchedule.open && branchSchedule.close;

    const activeShifts = availabilities.filter(av => {
        if (currentBranch && av.branch_id !== currentBranch.id) return false;
        const rrule = av.rrule || "";
        if (!rrule.includes("BYDAY=")) return false;
        const byDayPart = rrule.split('BYDAY=')[1].split(';')[0];
        return byDayPart.split(',').includes(dayOfWeek);
    });

    let isOpen = false;
    let isHolidayState = false;

    if (hasSpecialOpening) isOpen = true;
    else if (holiday) { isHolidayState = true; isOpen = false; }
    else if (isBranchOpen) isOpen = true;

    if (isHolidayState) return { isHoliday: true, holidayName: holiday.name };

    const dayAppts = getAppointmentsForDate(date).filter(a => a.status !== 'cancelled');
    const onsiteCount = dayAppts.filter(a => a.modality !== 'home').length;
    const activeRoomsToday = isOpen ? [...new Set(activeShifts.filter(s => s.modality !== 'home').map(s => s.room_id))] : [];
    const totalPhysicalCapacity = rooms.filter(r => activeRoomsToday.includes(r.id)).reduce((acc, r) => acc + r.capacity, 0);

    return {
        isHoliday: false, isOpen, appointmentsCount: dayAppts.length, onsiteCount,
        capacity: totalPhysicalCapacity, percent: totalPhysicalCapacity > 0 ? (onsiteCount / totalPhysicalCapacity) * 100 : 0
    };
  };

  const todayAppointments = useMemo(() => {
    return filteredAppointments.filter(apt => apt.date === formatLocalDate(selectedDate));
  }, [filteredAppointments, selectedDate]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    router.reload({
      onFinish: () => {
        setTimeout(() => setIsRefreshing(false), 500);
      },
    });
  };

  // Manejo de clicks en los KPI dinámicos
  const handleKpiClick = (type) => {
    if (type === "soapPending") {
      soapAlertRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    setStatusFilter(prev => prev === type ? "todos" : type);
  };

  const Content = (
    <div className={`min-h-screen ${isDesktop ? 'p-8' : 'px-4 pb-28 pt-2'} bg-[#FDFDFD]`}>
      <Head title="Panel Clínico" />

      {/* Welcome Section */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="min-w-0 text-left">
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-black text-slate-900 tracking-tight truncate">
                {doctor.name.split(" ")[0]} 👋
            </h1>
            <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="flex items-center justify-center p-1 bg-white border border-slate-100 rounded-lg transition-all active:scale-95"
            >
                <RefreshCw className={`w-3 h-3 text-brand-primary ${isRefreshing ? "animate-spin" : ""}`} />
            </button>
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="px-1.5 py-0.5 bg-brand-primary/10 text-brand-primary text-[7px] font-black uppercase rounded">
              {doctor.speciality?.substring(0,10) || 'Kine'}
            </span>
            <span className="text-slate-400 text-[7px] font-bold uppercase tracking-widest flex items-center gap-1">
              <Users className="w-2 h-2" /> {activePatientsCount} P.
            </span>
          </div>
        </div>
      </div>

      {/* --- 📊 KPI GRID (Nano Scale) --- */}
      <div className="grid grid-cols-4 gap-0.5 mb-2">
        <button
          onClick={() => handleKpiClick("todos")}
          className={`h-7 rounded border text-center flex flex-col items-center justify-center transition-all ${statusFilter === "todos" ? "bg-slate-900 border-slate-900 text-white" : "bg-white border-slate-100 text-slate-700"}`}
        >
          <span className="text-[4px] font-black uppercase opacity-60 leading-none">Total</span>
          <span className="text-[7.5px] font-black leading-none mt-0.5">{dynamicKpis.total}</span>
        </button>

        <button
          onClick={() => handleKpiClick("completed")}
          className={`h-7 rounded border text-center flex flex-col items-center justify-center transition-all ${statusFilter === "completed" ? "bg-emerald-600 border-emerald-600 text-white" : "bg-white border-slate-100 text-slate-700"}`}
        >
          <span className="text-[4px] font-black uppercase opacity-60 leading-none">REALIZADAS</span>
          <span className="text-[7.5px] font-black leading-none mt-0.5">{dynamicKpis.completed}</span>
        </button>

        <button
          onClick={() => handleKpiClick("pending")}
          className={`h-7 rounded border text-center flex flex-col items-center justify-center transition-all ${statusFilter === "pending" ? "bg-blue-600 border-blue-600 text-white" : "bg-white border-slate-100 text-slate-700"}`}
        >
          <span className="text-[4px] font-black uppercase opacity-60 leading-none">Pend.</span>
          <span className="text-[7.5px] font-black leading-none mt-0.5">{dynamicKpis.pending}</span>
        </button>

        <button
          onClick={() => handleKpiClick("in_box")}
          className={`h-7 rounded border text-center flex flex-col items-center justify-center transition-all ${statusFilter === "in_box" ? "bg-purple-600 border-purple-600 text-white" : "bg-white border-slate-100 text-slate-700"}`}
        >
          <span className="text-[4px] font-black uppercase opacity-60 leading-none">En Box</span>
          <span className="text-[7.5px] font-black leading-none mt-0.5">{dynamicKpis.inBox}</span>
        </button>
      </div>

      {/* --- 🛠️ CONTROLES Y NAVEGACIÓN (Ultra Compacto) --- */}
      <div className="mb-4">
          <div className="p-0.5 bg-white border border-slate-100 rounded-xl shadow-sm flex flex-row items-center gap-1 h-9 overflow-hidden">
            {/* Toggle de Vistas */}
            <div className="flex gap-0.5 p-0.5 bg-slate-50 border border-slate-100 rounded-lg shrink-0">
            {[{ id: 'week', label: 'SEM' }, { id: 'day', label: 'DÍA' }].map(m => (
                <button 
                key={m.id} 
                onClick={() => {
                    setViewMode(m.id);
                    setStatusFilter("todos");
                }} 
                className={`px-1.5 py-1 rounded-md font-black text-[6px] uppercase tracking-tighter transition-all duration-300 ${viewMode === m.id ? "bg-white text-brand-primary shadow-sm" : "text-slate-400"}`}
                >
                {m.label}
                </button>
            ))}
            </div>

            {/* Selector de Navegación */}
            <div className="flex items-center justify-between gap-0.5 flex-1 min-w-0 pr-1">
                <button 
                    onClick={() => { 
                        if (viewMode === "week") setSelectedDate(prev => { const d = new Date(prev); d.setDate(d.getDate() - 7); return d; }); 
                        else setSelectedDate(prev => { const d = new Date(prev); d.setDate(d.getDate() - 1); return d; }); 
                    }} 
                    className="p-1 hover:bg-slate-50 text-slate-400 shrink-0"
                >
                    <ChevronLeft className="w-3 h-3" />
                </button>
                <h2 className="text-[7.5px] font-black uppercase tracking-tighter text-slate-700 truncate text-center flex-1">
                    {viewMode === "week" ? (() => {
                    const weekDays = getWeekDays(selectedDate);
                    const startDay = weekDays[0];
                    const endDay = weekDays[6];
                    return `${startDay.getDate()}-${endDay.getDate()} ${monthNames[startDay.getMonth()].substring(0,3)}`;
                    })() : `${selectedDate.getDate()} ${monthNames[selectedDate.getMonth()].substring(0,3)}`}
                </h2>
                <button 
                    onClick={() => { 
                        if (viewMode === "week") setSelectedDate(prev => { const d = new Date(prev); d.setDate(d.getDate() + 7); return d; }); 
                        else setSelectedDate(prev => { const d = new Date(prev); d.setDate(d.getDate() + 1); return d; }); 
                    }} 
                    className="p-1 hover:bg-slate-50 text-slate-400 shrink-0"
                >
                    <ChevronRight className="w-3 h-3" />
                </button>
            </div>
          </div>
      </div>

      {/* --- 🏷️ ACTIVE FILTERS ALERTS (PILLS) --- */}
      {statusFilter !== "todos" && (
        <div className="mb-4 flex flex-wrap gap-2 animate-in fade-in duration-300">
            <span className="px-2 py-1 bg-brand-primary/10 border border-brand-primary/20 text-brand-primary text-[7px] font-black uppercase rounded-lg flex items-center gap-1.5">
                {statusFilter === 'completed' ? 'REALIZADAS' : statusFilter === 'pending' ? 'Pend.' : 'En Box'}
                <button onClick={() => setStatusFilter("todos")} className="p-0.5 hover:bg-brand-primary/20 rounded-md transition-colors">
                    <X className="w-2.5 h-3 text-brand-primary" />
                </button>
            </span>
        </div>
      )}

      {/* VISTAS DEL CALENDARIO */}
      <div className="w-full">
        {viewMode === "week" && (
            <div className="bg-white border border-slate-100 rounded-[2rem] overflow-hidden shadow-sm">
                <div className="p-4 border-b border-slate-100 bg-slate-50/20 flex justify-between items-center">
                    <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Matriz Semanal</h3>
                </div>
                
                <div className="overflow-x-auto custom-scrollbar bg-white">
                    <div className="min-w-[380px]">
                        {/* Header de Días */}
                        <div className="grid grid-cols-[18px_repeat(7,1fr)] border-b border-slate-100 bg-slate-50/50">
                            <div className="p-0.5"></div>
                            {getWeekDays(selectedDate).map((d, i) => {
                                const dayStats = getDayCapacityStats(d);
                                let canScheduleThisDay = canCreate && !isDatePast(d) && dayStats.isOpen;

                                if (canScheduleThisDay && isToday(d)) {
                                    const dayOfWeek = ["SU", "MO", "TU", "WE", "TH", "FR", "SA"][d.getDay()];
                                    const branchSchedule = currentBranch?.schedule?.[dayOfWeek];
                                    if (branchSchedule?.close) {
                                        const [closeH, closeM] = branchSchedule.close.split(':').map(Number);
                                        const closeTime = new Date();
                                        closeTime.setHours(closeH, closeM, 0, 0);
                                        if (new Date() >= closeTime) canScheduleThisDay = false;
                                    }
                                }

                                return (
                                    <div key={i} className="p-0.5 text-center border-l border-slate-100 group relative bg-white">
                                        <div className="text-[6px] font-black text-slate-400 uppercase tracking-tight">
                                            {dayNames[(d.getDay() + 6) % 7].substring(0,1)}
                                        </div>
                                        <div>
                                            <div className={`text-[10px] font-black ${isToday(d) ? "text-brand-primary" : "text-slate-900"}`}>
                                                {d.getDate()}
                                            </div>
                                            {canScheduleThisDay && (
                                                <button 
                                                    onClick={(e) => { e.stopPropagation(); setSelectedDate(d); setIsDateLocked(true); setShowNewAppointment(true); }} 
                                                    className="p-1 bg-brand-primary/10 text-brand-primary rounded-md active:scale-90 w-full flex items-center justify-center mt-0.5"
                                                >
                                                    <Plus className="w-2 h-2" />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Cuerpo de la Grilla (Horas) */}
                        <div className="grid grid-cols-[18px_repeat(7,1fr)]">
                            {hours.map(h => (
                                <React.Fragment key={h}>
                                    <div className="p-0.5 text-[7px] font-black text-right text-slate-300 border-b border-slate-100 uppercase bg-slate-50/5 flex items-center justify-end">{h}</div>
                                    {getWeekDays(selectedDate).map((d, di) => {
                                        const dayAppts = getAppointmentsForDate(d).filter(a => parseInt(a.start_time.split(":")[0]) === h);
                                        const dayStats = getDayCapacityStats(d);
                                        const canSchedule = dayAppts.length === 0 && !isDatePast(d) && dayStats.isOpen;

                                        return (
                                            <div
                                                key={di}
                                                onClick={() => { if (canSchedule && canCreate) { setSelectedDate(d); setIsDateLocked(true); setShowNewAppointment(true); } }}
                                                className={`min-h-[60px] p-0.5 border-b border-l border-slate-100 transition-all relative group ${canSchedule && canCreate ? "hover:bg-brand-primary/[0.02] cursor-pointer bg-white" : "bg-white"}`}
                                            >
                                                {dayAppts.map(a => {
                                                    const stale = isAppointmentStale(a);
                                                    const colors = getStatusColors(a.status, stale);
                                                    return (
                                                        <div
                                                            key={a.id}
                                                            onClick={(e) => { e.stopPropagation(); setSelectedAppointment(a); }}
                                                            className={`p-[1px] rounded-sm text-[5px] font-black uppercase mb-0.5 truncate shadow-sm hover:brightness-95 transition-all cursor-pointer flex flex-col gap-0 ${colors.bg} ${colors.text} border ${colors.border}`}
                                                        >
                                                            <div className="flex items-center gap-0.5 min-w-0">
                                                                {stale ? <AlertCircle className="w-1 h-1 text-amber-600 shrink-0" /> : <div className={`w-1 h-1 rounded-full ${colors.dot} shrink-0`}></div>}
                                                                <span className="truncate">{a.patient?.name?.charAt(0)}. {a.patient?.last_name?.split(' ')[0]}</span>
                                                            </div>
                                                            <span className="text-[3.5px] opacity-70 border-t border-current/10 pt-0.5 truncate leading-none">
                                                                {stale ? "ACCIÓN" : getStatusLabel(a.status).substring(0,4)}
                                                            </span>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        );
                                    })}
                                </React.Fragment>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        )}

        {viewMode === "day" && (
          <div className="bg-white border border-slate-100 rounded-[1.5rem] overflow-hidden shadow-sm">
            <div className="p-2 border-b border-slate-100 bg-slate-50/20 flex flex-row justify-between items-center gap-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-brand-primary text-white rounded-lg flex items-center justify-center text-xs font-black shadow-lg">
                  {selectedDate.getDate()}
                </div>
                <div>
                  <h3 className="text-[9px] font-black uppercase text-slate-900 leading-tight">
                    {selectedDate.toLocaleDateString("es-CL", { weekday: "short", month: "short", day: "numeric" })}
                  </h3>
                  <p className="text-[7px] font-black text-brand-primary uppercase mt-0.5 tracking-wider">
                    {todayAppointments.length} atenciones
                  </p>
                </div>
              </div>

              {(() => {
                const dayStats = getDayCapacityStats(selectedDate);
                let canSchedule = canCreate && !isDatePast(selectedDate) && dayStats.isOpen;

                // Lógica de cierre para hoy
                if (canSchedule && isToday(selectedDate)) {
                    const dayOfWeek = ["SU", "MO", "TU", "WE", "TH", "FR", "SA"][selectedDate.getDay()];
                    const branchSchedule = currentBranch?.schedule?.[dayOfWeek];
                    if (branchSchedule?.close) {
                        const [closeH, closeM] = branchSchedule.close.split(':').map(Number);
                        const closeTime = new Date();
                        closeTime.setHours(closeH, closeM, 0, 0);
                        if (new Date() >= closeTime) canSchedule = false;
                    }
                }

                return canSchedule ? (
                    <button 
                        onClick={() => { setIsDateLocked(true); setShowNewAppointment(true); }} 
                        className="shrink-0 w-7 h-7 bg-brand-primary text-white rounded-lg shadow-lg hover:brightness-110 active:scale-95 transition-all flex items-center justify-center shadow-brand-primary/20"
                        title="Agendar para este día"
                    >
                        <Plus className="w-4 h-4" />
                    </button>
                ) : (
                    canCreate && (
                        <div className="shrink-0 w-7 h-7 flex items-center justify-center opacity-20 grayscale border border-slate-100 rounded-lg">
                            <Plus className="w-4 h-4 text-gray-400" />
                        </div>
                    )
                );
              })()}
            </div>
            <div className="p-2">
              {todayAppointments.length === 0 ? (
                <div className="py-20 text-center border border-dashed border-slate-200 rounded-[24px]">
                  <Calendar className="w-10 h-10 text-slate-200 mx-auto mb-4" />
                  <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Sin citas programadas para hoy</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {todayAppointments.sort((a,b) => a.start_time.localeCompare(b.start_time)).map(a => {
                    const stale = isAppointmentStale(a);
                    const colors = getStatusColors(a.status, stale);
                    return (
                        <div 
                        key={a.id} 
                        onClick={() => setSelectedAppointment(a)} 
                        className="flex items-center gap-6 p-6 bg-white border border-slate-100 cursor-pointer rounded-3xl hover:border-brand-primary/30 shadow-sm hover:shadow-md transition-all group"
                        >
                        <div className="text-center min-w-[80px] border-r border-slate-100 pr-6 flex flex-col items-center justify-center">
                            {stale && <AlertCircle className="w-4 h-4 text-amber-600 mb-1 animate-pulse" />}
                            <div className="text-sm font-black text-slate-900">{a.start_time.substring(0, 5)}</div>
                            <div className="text-[9px] font-bold text-slate-400 mt-1">{a.end_time.substring(0, 5)}</div>
                        </div>
                        <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-black uppercase text-slate-800 truncate">{a.patient?.full_name || a.patient_name || 'Paciente'}</h4>
                            <div className="flex flex-wrap items-center gap-2 mt-2">
                            <span className="text-[8px] font-black text-brand-primary bg-brand-primary/5 px-2.5 py-1 rounded-lg uppercase tracking-wider">
                                {a.item?.name || 'Servicio'}
                            </span>
                            {a.room && (
                                <span className="text-[8px] font-black text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-lg uppercase tracking-wider flex items-center gap-1">
                                <MapPin className="w-2.5 h-2.5"/> {a.room.name}
                                </span>
                            )}
                            <span className={`text-[8px] font-black px-2.5 py-1 rounded-lg uppercase tracking-wider ${colors.bg} ${colors.text} border ${colors.border}`}>
                                {stale ? "SIN ACCIÓN PROF." : getStatusLabel(a.status)}
                            </span>
                            </div>
                        </div>
                        <ChevronRightIcon className="text-slate-300 group-hover:text-brand-primary transition-colors shrink-0" />
                        </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* MODALS INTEGRADOS */}
      <NewAppointmentModal
        isOpen={showNewAppointment || !!editingAppointment}
        onClose={() => { setShowNewAppointment(false); setEditingAppointment(null); setIsDateLocked(false); }}
        selectedDate={selectedDate}
        patients={localPatients}
        doctors={doctors}
        items={items}
        rooms={rooms}
        availabilities={availabilities}
        holidays={holidays}
        exceptions={exceptions}
        currentBranch={currentBranch}
        agreements={agreements}
        appointments={appointments}
        onPatientCreated={handlePatientCreated}
        regions={regions}
        communes={communes}
        appointment={editingAppointment}
      />

      <AppointmentDetailModal
        isOpen={!!selectedAppointment}
        appointment={selectedAppointment}
        onClose={() => setSelectedAppointment(null)}
        onCheckIn={() => setShowCheckInModal(true)}
        onEdit={() => {
            setEditingAppointment(selectedAppointment);
            setSelectedAppointment(null);
        }}
        canCreate={canCreate}
        isKine={true}
      />

      <CheckInModal
        isOpen={showCheckInModal}
        onClose={() => setShowCheckInModal(false)}
        onSuccess={() => {
          setShowCheckInModal(false);
          setSelectedAppointment(null);
        }}
        appointment={selectedAppointment}
        doctors={doctors}
        rooms={rooms}
      />

      <QuickPatientModal 
        isOpen={showQuickPatientModal} 
        onClose={() => setShowQuickPatientModal(false)} 
        regions={regions} 
        communes={communes} 
        onSuccess={(newPatient) => { 
          handlePatientCreated(newPatient);
          setShowQuickPatientModal(false);
          Swal.fire({ 
            title: "Paciente Creado", 
            text: `${newPatient.name} ${newPatient.last_name} ha sido agregado.`, 
            icon: "success", 
            timer: 2000, 
            showConfirmButton: false, 
            toast: true, 
            position: 'top-end' 
          });
        }} 
      />
    </div>
  );

  return isDesktop ? (
    <AuthenticatedLayout>{Content}</AuthenticatedLayout>
  ) : (
    <KineLayout>{Content}</KineLayout>
  );
}
