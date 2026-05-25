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
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showCheckInModal, setShowCheckInModal] = useState(false);
  const [showQuickPatientModal, setShowQuickPatientModal] = useState(false);
  const [isDateLocked, setIsDateLocked] = useState(false);
  const [localPatients, setLocalPatients] = useState(patients);
  const [isRefreshing, setIsRefreshing] = useState(false);

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

  const getStatusStyles = (status) => {
    switch (status) {
        case 'scheduled': return 'bg-blue-50 text-blue-600 border border-blue-100';
        case 'confirmed': return 'bg-emerald-50 text-emerald-600 border border-emerald-100';
        case 'checked_in': return 'bg-orange-50 text-orange-600 border border-orange-100';
        case 'in_progress': return 'bg-purple-50 text-purple-600 border border-purple-100';
        case 'completed': return 'bg-gray-100 text-gray-600 border border-gray-200';
        case 'cancelled': return 'bg-red-50 text-red-600 border border-red-100';
        default: return 'bg-slate-50 text-slate-600 border border-slate-100';
    }
  };

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
    <div className={`min-h-screen ${isDesktop ? 'p-8' : 'px-4 pb-28 pt-4'} bg-[#FDFDFD]`}>
      <Head title="Panel Clínico" />

      {/* Welcome Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Hola, {doctor.name.split(" ")[0]} 👋
          </h1>
          <div className="flex items-center gap-3 mt-2">
            <span className="px-3 py-1 bg-brand-primary/10 text-brand-primary text-[9px] font-black uppercase tracking-widest rounded-lg">
              {doctor.speciality || 'Kinesiólogo'}
            </span>
            <span className="text-slate-400 text-[9px] font-bold uppercase tracking-widest flex items-center gap-1.5">
              <Users className="w-3 h-3" /> {activePatientsCount} Pacientes Activos
            </span>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-2 px-5 py-3 bg-white border border-slate-100 rounded-2xl shadow-sm hover:shadow-md transition-all active:scale-95 text-[9px] font-black uppercase tracking-widest text-slate-600"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-brand-primary ${isRefreshing ? "animate-spin" : ""}`} />
            {isRefreshing ? 'Sincronizando...' : 'Actualizar'}
          </button>
          {canCreate && (
            <button 
              onClick={() => { setIsDateLocked(false); setShowNewAppointment(true); }} 
              className="px-5 py-3 bg-brand-primary text-white font-black text-[9px] uppercase tracking-widest rounded-2xl shadow-lg hover:brightness-110 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" /> Nueva Cita
            </button>
          )}
        </div>
      </div>

      {/* --- 📊 INTERACTIVE DYNAMIC KPI GRID --- */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-6">
        {/* KPI Total */}
        <button
          onClick={() => handleKpiClick("todos")}
          className={`px-3.5 py-3 rounded-2xl border text-left flex items-center justify-between transition-all active:scale-95 shadow-sm ${
            statusFilter === "todos"
              ? "bg-slate-900 border-slate-900 text-white"
              : "bg-white border-slate-100 text-slate-700 hover:bg-slate-50/50"
          }`}
        >
          <div className="flex items-center gap-2 min-w-0">
            <Calendar className="w-3.5 h-3.5 shrink-0 opacity-70" />
            <span className="text-[9px] font-black uppercase tracking-wider truncate">Total</span>
          </div>
          <span className="text-xs font-black ml-2 shrink-0">{dynamicKpis.total}</span>
        </button>

        {/* KPI Finalizadas */}
        <button
          onClick={() => handleKpiClick("completed")}
          className={`px-3.5 py-3 rounded-2xl border text-left flex items-center justify-between transition-all active:scale-95 shadow-sm ${
            statusFilter === "completed"
              ? "bg-emerald-600 border-emerald-600 text-white shadow-md shadow-emerald-600/10"
              : "bg-white border-slate-100 text-slate-700 hover:bg-slate-50/50"
          }`}
        >
          <div className="flex items-center gap-2 min-w-0">
            <CheckCircle className="w-3.5 h-3.5 shrink-0 opacity-80" />
            <span className="text-[9px] font-black uppercase tracking-wider truncate">Hechas</span>
          </div>
          <span className="text-xs font-black ml-2 shrink-0">{dynamicKpis.completed}</span>
        </button>

        {/* KPI Por Llegar / Pendientes */}
        <button
          onClick={() => handleKpiClick("pending")}
          className={`px-3.5 py-3 rounded-2xl border text-left flex items-center justify-between transition-all active:scale-95 shadow-sm ${
            statusFilter === "pending"
              ? "bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-600/10"
              : "bg-white border-slate-100 text-slate-700 hover:bg-slate-50/50"
          }`}
        >
          <div className="flex items-center gap-2 min-w-0">
            <Clock className="w-3.5 h-3.5 shrink-0 opacity-80" />
            <span className="text-[9px] font-black uppercase tracking-wider truncate">Por Llegar</span>
          </div>
          <span className="text-xs font-black ml-2 shrink-0">{dynamicKpis.pending}</span>
        </button>

        {/* KPI En Box / Espera */}
        <button
          onClick={() => handleKpiClick("in_box")}
          className={`px-3.5 py-3 rounded-2xl border text-left flex items-center justify-between transition-all active:scale-95 shadow-sm ${
            statusFilter === "in_box"
              ? "bg-purple-600 border-purple-600 text-white shadow-md shadow-purple-600/10"
              : "bg-white border-slate-100 text-slate-750 hover:bg-slate-50/50"
          }`}
        >
          <div className="flex items-center gap-2 min-w-0">
            <Activity className="w-3.5 h-3.5 shrink-0 opacity-80" />
            <span className="text-[9px] font-black uppercase tracking-wider truncate">En Espera</span>
          </div>
          <span className="text-xs font-black ml-2 shrink-0">{dynamicKpis.inBox}</span>
        </button>

      </div>

      {/* --- 🛠️ CONTROLES Y NAVEGACIÓN --- */}
      <div className="p-3 mb-6 bg-white border border-slate-100 rounded-2xl shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Toggle de Vistas */}
        <div className="flex gap-1.5 p-1 bg-slate-50 border border-slate-100 rounded-xl w-full sm:w-auto">
          {[{ id: 'week', label: 'SEMANA' }, { id: 'day', label: 'DÍA' }].map(m => (
            <button 
              key={m.id} 
              onClick={() => {
                setViewMode(m.id);
                setStatusFilter("todos");
              }} 
              className={`flex-1 sm:flex-none px-4 py-2 rounded-lg font-black text-[9px] uppercase tracking-wider transition-all duration-300 ${viewMode === m.id ? "bg-white text-brand-primary shadow-sm" : "text-slate-400 hover:text-slate-600"}`}
            >
              {m.label}
            </button>
          ))}
        </div>

        {/* Selector de Navegación */}
        <div className="flex items-center justify-between sm:justify-center gap-4 w-full sm:w-auto">
          <button 
            onClick={() => { 
              if (viewMode === "week") setSelectedDate(new Date(selectedDate.setDate(selectedDate.getDate()-7))); 
              else setSelectedDate(new Date(selectedDate.setDate(selectedDate.getDate()-1))); 
            }} 
            className="p-1.5 hover:bg-slate-50 border border-transparent hover:border-slate-100 rounded-xl transition-all"
          >
            <ChevronLeft className="w-4.5 h-4.5 text-slate-600" />
          </button>
          <h2 className="text-[10px] font-black uppercase tracking-widest min-w-[200px] text-center text-slate-800">
            {viewMode === "week" ? (() => {
              const weekDays = getWeekDays(selectedDate);
              const startDay = weekDays[0];
              const endDay = weekDays[6];
              if (startDay.getMonth() === endDay.getMonth()) {
                return `Semana del ${startDay.getDate()} al ${endDay.getDate()} de ${monthNames[startDay.getMonth()]}`;
              } else {
                return `Semana del ${startDay.getDate()} de ${monthNames[startDay.getMonth()]} al ${endDay.getDate()} de ${monthNames[endDay.getMonth()]}`;
              }
            })() : `${selectedDate.getDate()} de ${monthNames[selectedDate.getMonth()]}`}
          </h2>
          <button 
            onClick={() => { 
              if (viewMode === "week") setSelectedDate(new Date(selectedDate.setDate(selectedDate.getDate()+7))); 
              else setSelectedDate(new Date(selectedDate.setDate(selectedDate.getDate()+1))); 
            }} 
            className="p-1.5 hover:bg-slate-50 border border-transparent hover:border-slate-100 rounded-xl transition-all"
          >
            <ChevronRight className="w-4.5 h-4.5 text-slate-600" />
          </button>
        </div>
      </div>

      {/* --- 🏷️ ACTIVE FILTERS ALERTS (PILLS) --- */}
      {statusFilter !== "todos" && (
        <div className="mb-6 flex flex-wrap gap-2 animate-in fade-in duration-300">
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center">Filtros Activos:</span>
            <span className="px-3 py-1.5 bg-brand-primary/10 border border-brand-primary/20 text-brand-primary text-[8px] font-black uppercase rounded-lg flex items-center gap-1.5">
                Estatus: {statusFilter === 'completed' ? 'Finalizadas' : statusFilter === 'pending' ? 'Por Llegar' : 'En Espera'}
                <button onClick={() => setStatusFilter("todos")} className="p-0.5 hover:bg-brand-primary/20 rounded-md transition-colors">
                    <X className="w-3 h-3 text-brand-primary" />
                </button>
            </span>
            <button 
                onClick={() => setStatusFilter("todos")} 
                className="px-3 py-1.5 text-red-600 hover:bg-red-50 text-[8px] font-black uppercase rounded-lg flex items-center gap-1"
            >
                <FilterX className="w-3.5 h-3.5" /> Limpiar Todo
            </button>
        </div>
      )}

      {/* VISTAS DEL CALENDARIO */}
      <div className="w-full">
        {viewMode === "week" && (
          isDesktop ? (
            <div className="bg-white border border-slate-100 rounded-[32px] overflow-hidden shadow-sm">
              <div className="p-6 border-b border-slate-100 bg-slate-50/20 flex justify-between items-center">
                <h3 className="text-sm font-black text-slate-900 uppercase">Vista Semanal</h3>
                <button
                  onClick={() => {
                    setIsDateLocked(false);
                    setShowNewAppointment(true);
                  }}
                  className="px-6 py-3 bg-brand-primary text-white text-[10px] font-black uppercase rounded-2xl shadow-lg hover:brightness-110 flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" /> Agendar en esta semana
                </button>
              </div>
              <div className="grid grid-cols-8 border-b border-slate-100 bg-slate-50/50">
                <div className="p-3"></div>
                {getWeekDays(selectedDate).map((d, i) => (
                  <div key={i} className="p-4 text-center border-l border-slate-100">
                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
                      {dayNames[(d.getDay() + 6) % 7]}
                    </div>
                    <div className={`text-xl font-black mt-1 ${isToday(d) ? "text-brand-primary" : "text-slate-900"}`}>
                      {d.getDate()}
                    </div>
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-8">
                {hours.map(h => (
                  <React.Fragment key={h}>
                    <div className="p-4 text-[10px] font-black text-right text-slate-400 border-b border-slate-100 uppercase">{h}:00</div>
                    {getWeekDays(selectedDate).map((d, di) => {
                      const dayAppts = getAppointmentsForDate(d).filter(a => parseInt(a.start_time.split(":")[0]) === h);
                      const dayStats = getDayCapacityStats(d);
                      const canSchedule = dayAppts.length === 0 && !isDatePast(d) && dayStats.isOpen;
                      const isClosed = !dayStats.isOpen && dayAppts.length === 0;

                      return (
                        <div
                          key={di}
                          onClick={() => {
                            if (canSchedule) {
                              setSelectedDate(d);
                              setIsDateLocked(true);
                              setShowNewAppointment(true);
                            }
                          }}
                          className={`min-h-[80px] p-2 border-b border-l border-slate-100 transition-all relative group ${
                            isClosed
                              ? "bg-slate-50/40 opacity-60 cursor-not-allowed"
                              : canSchedule
                              ? "hover:bg-brand-primary/[0.02] cursor-pointer bg-white"
                              : "bg-white"
                          }`}
                        >
                          {canSchedule && (
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                              <Plus className="w-4 h-4 text-brand-primary/20" />
                            </div>
                          )}
                          {dayAppts.map(a => (
                            <div
                              key={a.id}
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedAppointment(a);
                              }}
                              className={`p-2.5 rounded-xl text-[8px] font-black uppercase mb-1 truncate shadow-sm hover:brightness-95 transition-all cursor-pointer flex items-center gap-1.5 ${getStatusStyles(a.status)}`}
                            >
                              <div className={`w-1.5 h-1.5 rounded-full ${
                                a.status === 'completed' ? 'bg-gray-400' :
                                a.status === 'cancelled' ? 'bg-red-400' :
                                a.status === 'in_progress' ? 'bg-purple-400' :
                                a.status === 'checked_in' ? 'bg-orange-400' :
                                a.status === 'confirmed' ? 'bg-emerald-400' : 'bg-blue-400'
                              } flex-shrink-0`}></div>
                              <span className="truncate">{a.patient?.full_name || a.patient_name || 'Paciente'}</span>
                            </div>
                          ))}
                        </div>
                      );
                    })}
                  </React.Fragment>
                ))}
              </div>
            </div>
          ) : (
            /* Mobile Vertical Week List */
            <div className="space-y-4">
              {getWeekDays(selectedDate).map((d, di) => {
                const dayAppts = getAppointmentsForDate(d).filter(a => a.status !== 'cancelled');
                const dayStats = getDayCapacityStats(d);
                const isInactive = !dayStats.isOpen && dayAppts.length === 0;
                const isTodayDay = isToday(d);

                if (isInactive) {
                  return (
                    <div
                      key={di}
                      className="min-h-[44px] flex items-center justify-between px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl opacity-60 shadow-sm transition-all"
                    >
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        {dayNames[(d.getDay() + 6) % 7]} {d.getDate()}
                      </span>
                      <span className="text-[8px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                        <Coffee className="w-3.5 h-3.5 text-slate-350" /> Sin Atención
                      </span>
                    </div>
                  );
                }

                return (
                  <div
                    key={di}
                    className={`p-4 bg-white border ${
                      isTodayDay ? "border-brand-primary ring-1 ring-brand-primary/10 shadow-md shadow-brand-primary/5" : "border-slate-100 shadow-sm"
                    } rounded-3xl space-y-3 transition-all`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-black uppercase tracking-wider ${isTodayDay ? "text-brand-primary" : "text-slate-800"}`}>
                          {dayNames[(d.getDay() + 6) % 7]} {d.getDate()}
                        </span>
                        {isTodayDay && (
                          <span className="px-2.5 py-0.5 bg-brand-primary/10 text-brand-primary text-[7px] font-black uppercase tracking-wider rounded-md">
                            Hoy
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[8px] font-black text-slate-400 uppercase tracking-wider">
                          {dayAppts.length === 1 ? "1 Cita" : `${dayAppts.length} Citas`}
                        </span>
                        {dayStats.isOpen && !isDatePast(d) && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedDate(d);
                              setIsDateLocked(true);
                              setShowNewAppointment(true);
                            }}
                            className="p-1.5 bg-brand-primary/10 hover:bg-brand-primary text-brand-primary hover:text-white rounded-lg transition-all shadow-sm active:scale-95"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>

                    {dayAppts.length === 0 ? (
                      <div className="py-5 text-center border border-dashed border-slate-100 rounded-2xl bg-slate-50/20">
                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-wider">Sin citas programadas</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {dayAppts
                          .sort((a, b) => a.start_time.localeCompare(b.start_time))
                          .map(apt => (
                            <div
                              key={apt.id}
                              onClick={() => setSelectedAppointment(apt)}
                              className="flex items-center justify-between p-3.5 bg-slate-50/30 hover:bg-slate-50 border border-slate-100/70 hover:border-brand-primary/20 rounded-2xl transition-all cursor-pointer group"
                            >
                              <div className="flex items-center gap-3 min-w-0">
                                <div className="text-left shrink-0">
                                  <span className="text-[9px] font-black text-slate-800 block">{apt.start_time.substring(0, 5)}</span>
                                  <span className="text-[7px] font-bold text-slate-400 block">{apt.end_time.substring(0, 5)}</span>
                                </div>
                                <div className="min-w-0">
                                  <span className="text-[10px] font-black text-slate-700 block truncate uppercase">{apt.patient?.full_name || apt.patient_name || "Paciente"}</span>
                                  <span className="text-[7.5px] font-bold text-slate-400 block truncate uppercase mt-0.5">{apt.item?.name || "Servicio"}</span>
                                </div>
                              </div>

                              <div className="flex items-center gap-2">
                                <span className={`text-[7px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider ${getStatusStyles(apt.status)}`}>
                                  {getStatusLabel(apt.status)}
                                </span>
                                <ChevronRightIcon className="w-3.5 h-3.5 text-slate-350 group-hover:text-brand-primary transition-colors shrink-0" />
                              </div>
                            </div>
                          ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )
        )}


        {viewMode === "day" && (
          <div className="bg-white border border-slate-100 rounded-[32px] overflow-hidden shadow-sm">
            <div className="p-6 md:p-8 border-b border-slate-100 bg-slate-50/20 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-brand-primary text-white rounded-2xl flex items-center justify-center text-xl font-black shadow-lg">
                  {selectedDate.getDate()}
                </div>
                <div>
                  <h3 className="text-lg font-black uppercase text-slate-900 leading-tight">
                    {selectedDate.toLocaleDateString("es-CL", { weekday: "long", month: "long", day: "numeric" })}
                  </h3>
                  <p className="text-[10px] font-black text-brand-primary uppercase mt-1 tracking-wider">
                    {todayAppointments.length} atenciones programadas
                  </p>
                </div>
              </div>
              {getDayCapacityStats(selectedDate).isOpen && !isDatePast(selectedDate) && (
                <button 
                  onClick={() => { setIsDateLocked(true); setShowNewAppointment(true); }} 
                  className="px-5 py-3 bg-brand-primary text-white text-[10px] font-black uppercase rounded-2xl shadow-lg hover:brightness-110 flex items-center gap-2 w-full sm:w-auto justify-center"
                >
                  <Plus className="w-4 h-4" /> Reservar en este Día
                </button>
              )}
            </div>
            <div className="p-6 md:p-8">
              {todayAppointments.length === 0 ? (
                <div className="py-20 text-center border border-dashed border-slate-200 rounded-[24px]">
                  <Calendar className="w-10 h-10 text-slate-200 mx-auto mb-4" />
                  <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Sin citas programadas para hoy</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {todayAppointments.sort((a,b) => a.start_time.localeCompare(b.start_time)).map(a => (
                    <div 
                      key={a.id} 
                      onClick={() => setSelectedAppointment(a)} 
                      className="flex items-center gap-6 p-6 bg-white border border-slate-100 cursor-pointer rounded-3xl hover:border-brand-primary/30 shadow-sm hover:shadow-md transition-all group"
                    >
                      <div className="text-center min-w-[80px] border-r border-slate-100 pr-6">
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
                          <span className={`text-[8px] font-black px-2.5 py-1 rounded-lg uppercase tracking-wider ${getStatusStyles(a.status)}`}>
                            {getStatusLabel(a.status)}
                          </span>
                        </div>
                      </div>
                      <ChevronRightIcon className="text-slate-300 group-hover:text-brand-primary transition-colors shrink-0" />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* MODALS INTEGRADOS */}
      <NewAppointmentModal
        isOpen={showNewAppointment}
        onClose={() => { setShowNewAppointment(false); setIsDateLocked(false); }}
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
      />

      <AppointmentDetailModal
        isOpen={!!selectedAppointment}
        appointment={selectedAppointment}
        onClose={() => setSelectedAppointment(null)}
        onCheckIn={() => setShowCheckInModal(true)}
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
