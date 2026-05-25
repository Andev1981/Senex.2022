import React, { useState, useMemo, useEffect } from "react";
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
  ChevronRight as ChevronRightIcon
} from "lucide-react";
import KineLayout from "@/Layouts/KineLayout";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import Swal from "sweetalert2";

// Importación de componentes de agendas existentes
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

export default function MyScheduleNew({
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
  agreements = [],
  loggedInDoctor = null
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
  const [viewMode, setViewMode] = useState("month"); // month, week, day
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showNewAppointment, setShowNewAppointment] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showCheckInModal, setShowCheckInModal] = useState(false);
  const [showQuickPatientModal, setShowQuickPatientModal] = useState(false);
  const [isDateLocked, setIsDateLocked] = useState(false);
  const [localPatients, setLocalPatients] = useState(patients);

  // --- 🎯 FILTRO: El kinesiólogo solo ve visualmente sus propias citas en la agenda ---
  const myAppointments = useMemo(() => {
    return appointments.filter(apt => apt.doctor_id === loggedInDoctor?.id);
  }, [appointments, loggedInDoctor]);

  const getAppointmentsForDate = (date) => {
    return getAppointmentsForDateHelper(date, myAppointments);
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

  const handlePatientCreated = (newPatient) => {
    if (newPatient) {
        const formatted = { ...newPatient, full_name: `${newPatient.name} ${newPatient.last_name}` };
        setLocalPatients(prev => [...prev, formatted]);
    }
  };

  const todayAppointments = useMemo(() => {
    return myAppointments.filter(apt => apt.date === formatLocalDate(selectedDate));
  }, [myAppointments, selectedDate]);

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

  const Content = (
    <div className={`min-h-screen ${isDesktop ? 'p-8' : 'px-4 pb-28 pt-4'} bg-[#FDFDFD]`}>
      <Head title="Mi Agenda Calendario" />

      {/* --- BANNER DE COMPARACIÓN / VISTA DE PRUEBA --- */}
      <div className="bg-gradient-to-r from-brand-primary/10 to-indigo-50 border border-brand-primary/20 rounded-[32px] p-6 mb-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-white rounded-2xl shadow-sm text-brand-primary">
            <Sparkles className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h4 className="text-sm font-black text-slate-900 uppercase tracking-tight">Estás probando la Nueva Agenda Calendario</h4>
            <p className="text-[10px] font-bold text-slate-500 uppercase mt-0.5">Diseño interactivo premium con opción de agendar directamente</p>
          </div>
        </div>
        <Link 
          href={route('kine.my-schedule')} 
          className="px-5 py-3 bg-white border border-slate-100 text-slate-700 hover:text-brand-primary font-black text-[10px] uppercase rounded-2xl shadow-sm transition-all active:scale-95 flex items-center gap-2"
        >
          Alternar a Vista Clásica <ChevronRight className="w-4 h-4 text-slate-400" />
        </Link>
      </div>

      {/* Header Principal */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight uppercase">Mi Agenda</h1>
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mt-1">Planificador y Control de Turnos</p>
        </div>
        <div className="flex items-center gap-2">
          {canCreate && (
            <>
              <button 
                onClick={() => setShowQuickPatientModal(true)} 
                className="px-5 py-3 bg-white border border-slate-100 text-slate-700 font-black text-[10px] uppercase rounded-2xl shadow-sm hover:bg-slate-50 flex items-center gap-2"
              >
                <User className="w-4 h-4" /> Nuevo Paciente
              </button>
              <button 
                onClick={() => { setIsDateLocked(false); setShowNewAppointment(true); }} 
                className="px-5 py-3 bg-brand-primary text-white font-black text-[10px] uppercase rounded-2xl shadow-lg hover:brightness-110 flex items-center gap-2"
              >
                <Plus className="w-4 h-4" /> Nueva Cita
              </button>
            </>
          )}
        </div>
      </div>

      {/* KPI GRID */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="p-5 bg-white border border-slate-100 rounded-[32px] flex items-center gap-4 shadow-sm">
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center"><Calendar className="w-5 h-5"/></div>
          <div><p className="text-[9px] font-black uppercase text-slate-400">Total Hoy</p><p className="text-xl font-black text-slate-900">{todayAppointments.length}</p></div>
        </div>
        <div className="p-5 bg-white border border-slate-100 rounded-[32px] flex items-center gap-4 shadow-sm">
          <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center"><CheckCircle className="w-5 h-5"/></div>
          <div><p className="text-[9px] font-black uppercase text-slate-400">Atendidos</p><p className="text-xl font-black text-emerald-600">{todayAppointments.filter(a => a.status === 'completed' || a.status === 'checked_in').length}</p></div>
        </div>
        <div className="p-5 bg-white border border-slate-100 rounded-[32px] flex items-center gap-4 shadow-sm">
          <div className="w-12 h-12 bg-orange-50 text-orange-600 rounded-2xl flex items-center justify-center"><Clock className="w-5 h-5"/></div>
          <div><p className="text-[9px] font-black uppercase text-slate-400">Por Llegar</p><p className="text-xl font-black text-orange-600">{todayAppointments.filter(a => a.status === 'scheduled' || a.status === 'confirmed').length}</p></div>
        </div>
        <div className="p-5 bg-white border border-slate-100 rounded-[32px] flex items-center gap-4 shadow-sm">
          <div className="w-12 h-12 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center"><XCircle className="w-5 h-5"/></div>
          <div><p className="text-[9px] font-black uppercase text-slate-400">Anulados</p><p className="text-xl font-black text-red-600">{todayAppointments.filter(a => a.status === 'cancelled').length}</p></div>
        </div>
      </div>

      {/* Controles de Calendario */}
      <div className="p-4 mb-6 bg-white border border-slate-100 rounded-[28px] shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex gap-2 p-1 bg-slate-50 border border-slate-100 rounded-xl w-full md:w-auto">
          {[{ id: 'month', label: 'MES' }, { id: 'week', label: 'SEMANA' }, { id: 'day', label: 'DÍA' }].map(m => (
            <button 
              key={m.id} 
              onClick={() => setViewMode(m.id)} 
              className={`flex-1 md:flex-none px-5 py-2.5 rounded-lg font-black text-[10px] uppercase transition-all duration-300 ${viewMode === m.id ? "bg-white text-brand-primary shadow-sm" : "text-slate-400 hover:text-slate-600"}`}
            >
              {m.label}
            </button>
          ))}
        </div>
        <div className="flex items-center justify-between md:justify-center gap-4 w-full md:w-auto">
          <button 
            onClick={() => { 
              if (viewMode === "month") setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth()-1))); 
              else if (viewMode === "week") setSelectedDate(new Date(selectedDate.setDate(selectedDate.getDate()-7))); 
              else setSelectedDate(new Date(selectedDate.setDate(selectedDate.getDate()-1))); 
            }} 
            className="p-2 hover:bg-slate-50 border border-transparent hover:border-slate-100 rounded-xl transition-all"
          >
            <ChevronLeft className="w-5 h-5 text-slate-600" />
          </button>
          <h2 className="text-xs font-black uppercase tracking-widest min-w-[200px] text-center text-slate-800">
            {viewMode === "month" 
              ? `${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}` 
              : viewMode === "week" 
                ? `Semana ${selectedDate.getDate()} ${monthNames[selectedDate.getMonth()]}` 
                : `${selectedDate.getDate()} ${monthNames[selectedDate.getMonth()]}`}
          </h2>
          <button 
            onClick={() => { 
              if (viewMode === "month") setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth()+1))); 
              else if (viewMode === "week") setSelectedDate(new Date(selectedDate.setDate(selectedDate.getDate()+7))); 
              else setSelectedDate(new Date(selectedDate.setDate(selectedDate.getDate()+1))); 
            }} 
            className="p-2 hover:bg-slate-50 border border-transparent hover:border-slate-100 rounded-xl transition-all"
          >
            <ChevronRight className="w-5 h-5 text-slate-600" />
          </button>
        </div>
      </div>

      {/* VISTAS DE CALENDARIO */}
      <div className="w-full">
        {viewMode === "month" && (
          <div className="bg-white border border-slate-100 rounded-[32px] overflow-hidden shadow-sm">
            <div className="grid grid-cols-7 border-b border-slate-100 bg-slate-50/50">
              {dayNames.map(d => (
                <div key={d} className="p-4 text-center text-[10px] font-black text-slate-400 uppercase tracking-wider">{d}</div>
              ))}
            </div>
            <div className="grid grid-cols-7">
              {getDaysInMonth(currentDate).map((day, idx) => {
                const st = getDayCapacityStats(day.date);
                const appts = getAppointmentsForDate(day.date);
                const isClosed = !st.isOpen && !st.isHoliday;
                return (
                  <div 
                    key={idx} 
                    onClick={() => { 
                      if (st.isHoliday || (isClosed && appts.length === 0)) return; 
                      setSelectedDate(day.date); 
                      setViewMode("day"); 
                    }} 
                    className={`min-h-[140px] p-3 border-b border-r border-slate-100 cursor-pointer transition-all relative group ${!day.isCurrentMonth ? "opacity-30 bg-slate-50/50" : "bg-white"} ${isToday(day.date) ? "bg-brand-primary/5" : ""} ${(st.isHoliday || isClosed) && appts.length === 0 ? "cursor-not-allowed" : "hover:bg-slate-50/30"}`}
                  >
                    {(st.isHoliday || isClosed) && (
                      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'repeating-linear-gradient(45deg, #000, #000 10px, transparent 10px, transparent 20px)' }}></div>
                    )}
                    <div className="flex justify-between items-start mb-2 relative z-10">
                      <span className={`text-[10px] font-black w-7 h-7 flex items-center justify-center rounded-lg transition-all ${isToday(day.date) ? "bg-brand-primary text-white shadow-lg" : "text-slate-800"} ${st.isHoliday ? "text-red-500 font-bold" : ""}`}>
                        {day.date.getDate()}
                      </span>
                      {day.isCurrentMonth && !isDatePast(day.date) && st.isOpen && (
                        <button 
                          onClick={(e) => { 
                            e.stopPropagation(); 
                            setSelectedDate(day.date); 
                            setIsDateLocked(true); 
                            setShowNewAppointment(true); 
                          }} 
                          className="p-1.5 bg-brand-primary text-white rounded-lg opacity-0 group-hover:opacity-100 transition-all shadow-md active:scale-90"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                    <div className="space-y-1 relative z-10">
                      {st.isHoliday && (
                        <div className="py-1 px-2 rounded-lg bg-red-50 border border-red-100 mb-1">
                          <p className="text-[8px] font-black text-red-600 uppercase truncate" title={st.holidayName}>🎉 {st.holidayName}</p>
                        </div>
                      )}
                      {isClosed && appts.length === 0 && (
                        <div className="py-1 px-2 rounded-lg bg-slate-100 border border-slate-200">
                          <p className="text-[8px] font-black text-slate-400 uppercase">🚫 Libre</p>
                        </div>
                      )}
                      {appts.slice(0, 3).map(a => (
                        <div key={a.id} className="text-[8px] font-black uppercase p-1.5 rounded-lg bg-white border border-slate-100 shadow-sm truncate text-slate-700 flex items-center gap-1.5">
                          <div className={`w-1.5 h-1.5 rounded-full ${a.status === 'completed' ? 'bg-slate-400' : 'bg-brand-primary'}`}></div>
                          {a.patient?.name || 'Paciente'}
                        </div>
                      ))}
                      {appts.length > 3 && (
                        <p className="text-[8px] font-black text-slate-400 uppercase text-center mt-1">+{appts.length - 3} más</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {viewMode === "week" && (
          <div className="bg-white border border-slate-100 rounded-[32px] overflow-hidden shadow-sm">
            <div className="p-6 border-b border-slate-100 bg-slate-50/20 flex justify-between items-center">
              <h3 className="text-xs font-black text-slate-900 uppercase">Vista Semanal</h3>
              <button 
                onClick={() => { setIsDateLocked(false); setShowNewAppointment(true); }} 
                className="px-5 py-3 bg-brand-primary text-white text-[10px] font-black uppercase rounded-2xl shadow-lg hover:brightness-110 flex items-center gap-2"
              >
                <Plus className="w-4 h-4" /> Reservar esta Semana
              </button>
            </div>
            <div className="grid grid-cols-8 border-b border-slate-100 bg-slate-50/50">
              <div className="p-3"></div>
              {getWeekDays(selectedDate).map((d, i) => (
                <div key={i} className="p-4 text-center border-l border-slate-100">
                  <div className="text-[9px] font-black text-slate-400 uppercase tracking-wider">{dayNames[(d.getDay()+6)%7]}</div>
                  <div className={`text-lg font-black mt-1 ${isToday(d) ? "text-brand-primary" : "text-slate-900"}`}>{d.getDate()}</div>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-8">
              {hours.map(h => (
                <React.Fragment key={h}>
                  <div className="p-4 text-[9px] font-black text-right text-slate-400 border-b border-slate-100 uppercase">{h}:00</div>
                  {getWeekDays(selectedDate).map((d, di) => {
                    const appts = myAppointments.filter(a => a.date === formatLocalDate(d) && parseInt(a.start_time.split(":")[0]) === h);
                    const dayStats = getDayCapacityStats(d);
                    const canSchedule = !isDatePast(d) && dayStats.isOpen;
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
                        className={`min-h-[90px] p-1.5 border-b border-l border-slate-100 transition-all relative group ${canSchedule ? 'hover:bg-brand-primary/5 cursor-pointer bg-white' : 'bg-slate-50/50 cursor-not-allowed'}`}
                      >
                        {canSchedule && (
                          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <Plus className="w-4 h-4 text-brand-primary/30" />
                          </div>
                        )}
                        {appts.map(a => (
                          <div 
                            key={a.id} 
                            onClick={(e) => { 
                              e.stopPropagation(); 
                              setSelectedAppointment(a); 
                            }} 
                            className={`p-2 rounded-xl text-[8px] font-black uppercase mb-1.5 truncate shadow-sm transition-all hover:scale-95 ${getStatusStyles(a.status)}`}
                          >
                            <div className="flex justify-between items-center gap-1">
                              <span className="truncate">{a.patient?.name || 'S/N'}</span>
                              <span className="font-bold shrink-0">{a.start_time.substring(0, 5)}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    );
                  })}
                </React.Fragment>
              ))}
            </div>
          </div>
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
