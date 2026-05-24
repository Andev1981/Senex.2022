import React, { useState, useMemo, useEffect } from "react";
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
  ChevronRight as ChevronRightIcon,
  MapPin,
  Building,
  Coffee,
  UserCheck,
  Activity,
  AlertCircle,
  Globe
} from "lucide-react";
import { Head, router, Link } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import Swal from "sweetalert2";
import BoxMapModal from "./Partials/BoxMapModal";
import NewAppointmentModal from "./Partials/NewAppointmentModal";
import AppointmentDetailModal from "./Partials/AppointmentDetailModal";
import CheckInModal from "./Partials/CheckInModal";
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

// --- 🏷️ CONSTANTES ESTÁTICAS ---
const hours = Array.from({ length: 12 }, (_, i) => i + 8);

const getStatusColors = (status) => {
    switch (status?.toLowerCase()) {
        case 'scheduled':
        case 'programada':
            return { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-100', dot: 'bg-blue-400' };
        case 'confirmed':
        case 'confirmada':
            return { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-100', dot: 'bg-brand-primary' };
        case 'checked_in':
        case 'llegó':
            return { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-100', dot: 'bg-orange-400' };
        case 'in_progress':
        case 'en box':
            return { bg: 'bg-amber-50', text: 'text-amber-800', border: 'border-amber-200', dot: 'bg-amber-500' };
        case 'completed':
        case 'realizada':
            return { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-100', dot: 'bg-green-500' };
        case 'cancelled':
        case 'anulada':
            return { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-100', dot: 'bg-red-500' };
        case 'not_show':
        case 'not-show':
        case 'no asistió':
            return { bg: 'bg-gray-100', text: 'text-gray-600', border: 'border-gray-200', dot: 'bg-gray-400' };
        default:
            return { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-100', dot: 'bg-brand-primary' };
    }
};

export default function AgendaCalendar({ 
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
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState("month"); // month, week, day
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showNewAppointment, setShowNewAppointment] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showCheckInModal, setShowCheckInModal] = useState(false);
  const [showQuickPatientModal, setShowQuickPatientModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState("todos");
  const [searchTerm, setSearchTerm] = useState("");
  const [isDateLocked, setIsDateLocked] = useState(false);
  const [showBoxMap, setShowBoxMap] = useState(false);
  const [localPatients, setLocalPatients] = useState(patients);

  // --- 🎯 UTILIDADES DE TIEMPO Y FECHA ---
  const getAppointmentsForDate = (date) => {
    return getAppointmentsForDateHelper(date, appointments);
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

  // --- 📅 VISTAS DEL CALENDARIO ---

  const todayAppointments = appointments.filter(apt => apt.date === formatLocalDate(selectedDate));

  return (
    <AuthenticatedLayout>
      <Head title="Agenda" />
      <div className="min-h-screen p-4 bg-gray-50">
        <div className="p-6 mb-6 bg-white border shadow-sm rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-brand-primary rounded-xl flex items-center justify-center shadow-lg"><Calendar className="text-white w-6 h-6" /></div>
              <div><h1 className="text-2xl font-bold">Agenda</h1><p className="text-sm text-gray-500">Centro de Control</p></div>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => setShowQuickPatientModal(true)} className="px-6 py-2 bg-white border text-gray-700 font-bold rounded-lg shadow-sm hover:bg-gray-50 flex items-center gap-2"><User className="w-4 h-4" />Nuevo Paciente</button>
              <button onClick={() => { setIsDateLocked(false); setShowNewAppointment(true); }} className="px-6 py-2 bg-brand-primary text-white font-bold rounded-lg shadow-lg hover:brightness-110 flex items-center gap-2"><Plus className="w-4 h-4" />Nueva Cita</button>
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="p-5 bg-white border rounded-3xl flex items-center gap-4 shadow-sm">
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center"><Calendar /></div>
            <div><p className="text-[10px] font-black uppercase text-gray-400">Total Hoy</p><p className="text-2xl font-black">{todayAppointments.length}</p></div>
          </div>
          <div className="p-5 bg-white border rounded-3xl flex items-center gap-4 shadow-sm">
            <div className="w-12 h-12 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center"><CheckCircle /></div>
            <div><p className="text-[10px] font-black uppercase text-gray-400">Atendidos</p><p className="text-2xl font-black text-green-600">{todayAppointments.filter(a => a.status === 'completed' || a.status === 'checked_in').length}</p></div>
          </div>
          <div className="p-5 bg-white border rounded-3xl flex items-center gap-4 shadow-sm">
            <div className="w-12 h-12 bg-orange-50 text-orange-600 rounded-2xl flex items-center justify-center"><Clock /></div>
            <div><p className="text-[10px] font-black uppercase text-gray-400">Por Llegar</p><p className="text-2xl font-black text-orange-600">{todayAppointments.filter(a => a.status === 'scheduled' || a.status === 'confirmed').length}</p></div>
          </div>
          <div className="p-5 bg-white border rounded-3xl flex items-center gap-4 shadow-sm">
            <div className="w-12 h-12 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center"><XCircle /></div>
            <div><p className="text-[10px] font-black uppercase text-gray-400">Anulados</p><p className="text-2xl font-black text-red-600">{todayAppointments.filter(a => a.status === 'cancelled').length}</p></div>
          </div>
        </div>

        <div className="p-4 mb-6 bg-white border rounded-xl shadow-sm flex flex-col lg:flex-row items-center justify-between gap-4">
            <div className="flex gap-2 p-1 bg-gray-100 rounded-lg">
              {[{ id: 'month', label: 'MES' }, { id: 'week', label: 'SEMANA' }, { id: 'day', label: 'DÍA' }].map(m => (
                <button key={m.id} onClick={() => setViewMode(m.id)} className={`px-4 py-2 rounded-lg font-bold text-xs ${viewMode === m.id ? "bg-white text-brand-primary shadow-sm" : "text-gray-500"}`}>{m.label}</button>
              ))}
            </div>
            <div className="flex items-center gap-3"><button onClick={() => { if (viewMode === "month") setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth()-1))); else if (viewMode === "week") setSelectedDate(new Date(selectedDate.setDate(selectedDate.getDate()-7))); else setSelectedDate(new Date(selectedDate.setDate(selectedDate.getDate()-1))); }} className="p-2 hover:bg-gray-100 rounded-lg"><ChevronLeft /></button><h2 className="text-sm font-black uppercase tracking-widest min-w-[200px] text-center">{viewMode === "month" ? `${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}` : viewMode === "week" ? `Semana ${selectedDate.getDate()} ${monthNames[selectedDate.getMonth()]}` : `${selectedDate.getDate()} ${monthNames[selectedDate.getMonth()]}`}</h2><button onClick={() => { if (viewMode === "month") setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth()+1))); else if (viewMode === "week") setSelectedDate(new Date(selectedDate.setDate(selectedDate.getDate()+7))); else setSelectedDate(new Date(selectedDate.setDate(selectedDate.getDate()+1))); }} className="p-2 hover:bg-gray-100 rounded-lg"><ChevronRight /></button></div>
            <button onClick={() => setShowBoxMap(true)} className="px-4 py-2 text-[10px] font-black bg-white border rounded-lg hover:text-brand-primary flex items-center gap-2"><Layers className="w-4 h-4" />Boxes</button>
        </div>

        <div className="w-full">
            {viewMode === "month" && (
              <div className="bg-white border rounded-2xl overflow-hidden shadow-sm">
                <div className="grid grid-cols-7 border-b bg-gray-50">{dayNames.map(d => <div key={d} className="p-4 text-center text-[10px] font-black text-gray-400 uppercase">{d}</div>)}</div>
                <div className="grid grid-cols-7">
                    {getDaysInMonth(currentDate).map((day, idx) => {
                    const st = getDayCapacityStats(day.date), appts = getAppointmentsForDate(day.date);
                    const isClosed = !st.isOpen && !st.isHoliday;
                    return (
                      <div key={idx} onClick={() => { if (st.isHoliday || (isClosed && appts.length === 0)) return; setSelectedDate(day.date); setViewMode("day"); }} className={`min-h-[140px] p-3 border-b border-r cursor-pointer transition-all relative group ${!day.isCurrentMonth ? "opacity-30 bg-gray-50/50" : "bg-white"} ${isToday(day.date) ? "bg-brand-primary/5" : ""} ${(st.isHoliday || isClosed) && appts.length === 0 ? "cursor-not-allowed" : "hover:bg-gray-50/50"}`}>
                        {(st.isHoliday || isClosed) && (<div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'repeating-linear-gradient(45deg, #000, #000 10px, transparent 10px, transparent 20px)' }}></div>)}
                        <div className="flex justify-between items-start mb-2 relative z-10"><span className={`text-xs font-black w-7 h-7 flex items-center justify-center rounded-lg transition-all ${isToday(day.date) ? "bg-brand-primary text-white shadow-lg" : "text-gray-900"} ${st.isHoliday ? "text-red-500 font-bold" : ""}`}>{day.date.getDate()}</span>
                            {day.isCurrentMonth && !isDatePast(day.date) && st.isOpen && (<button onClick={(e) => { e.stopPropagation(); setSelectedDate(day.date); setIsDateLocked(true); setShowNewAppointment(true); }} className="p-1.5 bg-brand-primary text-white rounded-lg opacity-0 group-hover:opacity-100 transition-all shadow-md active:scale-90"><Plus className="w-3.5 h-3.5" /></button>)}
                        </div>
                        <div className="space-y-1 relative z-10">
                            {st.isHoliday && (<div className="py-1 px-2 rounded-lg bg-red-50 border border-red-100 mb-1"><p className="text-[8px] font-black text-red-600 uppercase truncate" title={st.holidayName}>🎉 {st.holidayName}</p></div>)}
                            {isClosed && appts.length === 0 && (<div className="py-1 px-2 rounded-lg bg-gray-100 border border-gray-200"><p className="text-[8px] font-black text-gray-400 uppercase">🚫 Cerrado</p></div>)}
                            {appts.slice(0, 2).map(a => {
                                const colors = getStatusColors(a.status);
                                return (
                                    <div key={a.id} className={`text-[8px] font-black uppercase p-1.5 rounded-lg ${colors.bg} ${colors.text} border ${colors.border} shadow-sm truncate flex items-center gap-1 group-hover:brightness-95 transition-all`}>
                                        <div className={`w-1.5 h-1.5 rounded-full ${colors.dot}`}></div>
                                        {a.patient?.name} {a.patient?.last_name}
                                    </div>
                                );
                            })}
                            {appts.length > 2 && (<p className="text-[7px] font-bold text-gray-400 uppercase text-center mt-1">+{appts.length - 2} más</p>)}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {viewMode === "week" && (
              <div className="bg-white border rounded-2xl overflow-hidden shadow-sm">
                <div className="p-6 border-b bg-gray-50/30 flex justify-between items-center"><h3 className="text-sm font-black text-gray-900 uppercase">Vista Semanal</h3><button onClick={() => { setIsDateLocked(false); setShowNewAppointment(true); }} className="px-6 py-3 bg-brand-primary text-white text-[10px] font-black uppercase rounded-2xl shadow-lg hover:brightness-110 flex items-center gap-2"><Plus className="w-4 h-4" />Agendar en esta semana</button></div>
                <div className="grid grid-cols-8 border-b bg-gray-50/50"><div className="p-3"></div>{getWeekDays(selectedDate).map((d, i) => <div key={i} className="p-4 text-center border-l"><div className="text-[10px] font-black text-gray-400 uppercase">{dayNames[(d.getDay()+6)%7]}</div><div className={`text-xl font-black mt-1 ${isToday(d) ? "text-brand-primary" : "text-gray-900"}`}>{d.getDate()}</div></div>)}</div>
                <div className="grid grid-cols-8">
                  {hours.map(h => (
                    <React.Fragment key={h}><div className="p-4 text-[10px] font-black text-right text-gray-400 border-b uppercase">{h}:00</div>
                    {getWeekDays(selectedDate).map((d, di) => {
                        const appts = appointments.filter(a => a.date === formatLocalDate(d) && parseInt(a.start_time.split(":")[0]) === h);
                        const dayStats = getDayCapacityStats(d);
                        const canSchedule = appts.length === 0 && !isDatePast(d) && dayStats.isOpen;
                        return (
                            <div key={di} onClick={() => { if (canSchedule) { setSelectedDate(d); setData(p => ({ ...p, date: formatLocalDate(d), start_time: `${String(h).padStart(2, '0')}:00` })); setIsDateLocked(true); setShowNewAppointment(true); } }} className={`min-h-[80px] p-1 border-b border-l border-gray-50 transition-all relative group ${canSchedule ? 'hover:bg-brand-primary/5 cursor-pointer' : 'bg-gray-50/30 cursor-not-allowed'}`}>
                                {canSchedule && (<div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"><Plus className="w-4 h-4 text-brand-primary/20" /></div>)}
                                {appts.map(a => {
                                    const colors = getStatusColors(a.status);
                                    return (
                                        <div key={a.id} onClick={(e) => { e.stopPropagation(); setSelectedAppointment(a); }} className={`p-2 rounded-xl text-[8px] font-black uppercase mb-1 ${colors.bg} ${colors.text} border ${colors.border} truncate shadow-sm hover:brightness-95 transition-all cursor-pointer flex items-center gap-1.5`}>
                                            <div className={`w-1.5 h-1.5 rounded-full ${colors.dot} flex-shrink-0`}></div>
                                            <span className="truncate">{a.patient?.name} {a.patient?.last_name}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        );
                    })}</React.Fragment>
                  ))}
                </div>
              </div>
            )}

            {viewMode === "day" && (
              <div className="bg-white border rounded-2xl overflow-hidden shadow-sm">
                <div className="p-8 border-b bg-gray-50/30 flex justify-between items-center"><div className="flex items-center gap-4"><div className="w-14 h-14 bg-brand-primary text-white rounded-2xl flex items-center justify-center text-xl font-black shadow-lg">{selectedDate.getDate()}</div><div><h3 className="text-lg font-black uppercase">{selectedDate.toLocaleDateString("es-CL", { weekday: "long", month: "long", day: "numeric" })}</h3><p className="text-[10px] font-bold text-brand-primary uppercase">{todayAppointments.length} citas</p></div></div>
                {getDayCapacityStats(selectedDate).isOpen && !isDatePast(selectedDate) && <button onClick={() => { setIsDateLocked(true); setShowNewAppointment(true); }} className="px-6 py-3 bg-brand-primary text-white text-[10px] font-black uppercase rounded-2xl shadow-lg hover:brightness-110 flex items-center gap-2"><Plus className="w-4 h-4" />Agendar en este día</button>}</div>
                <div className="p-8">
                  {todayAppointments.length === 0 ? <div className="py-20 text-center"><Calendar className="w-10 h-10 text-gray-200 mx-auto mb-4" /><p className="text-xs font-black text-gray-400 uppercase">Sin citas programadas</p></div> : <div className="space-y-4">{todayAppointments.sort((a,b) => a.start_time.localeCompare(b.start_time)).map(a => {
                    const colors = getStatusColors(a.status);
                    return (
                        <div key={a.id} onClick={() => setSelectedAppointment(a)} className={`flex items-center gap-6 p-6 border ${colors.border} cursor-pointer rounded-2xl ${colors.bg} hover:brightness-95 transition-all group shadow-sm`}>
                            <div className={`text-center min-w-[80px] border-r ${colors.border.replace('border', 'border-r')} pr-6`}>
                                <div className={`text-sm font-black ${colors.text}`}>{a.start_time.substring(0, 5)}</div>
                                <div className={`text-[10px] font-bold ${colors.text} opacity-50`}>{a.end_time.substring(0, 5)}</div>
                            </div>
                            <div className="flex-1">
                                <h4 className={`text-sm font-black uppercase ${colors.text}`}>{a.patient?.name} {a.patient?.last_name}</h4>
                                <p className="text-[10px] font-black text-brand-primary uppercase opacity-70">{a.item?.name}</p>
                            </div>
                            <ChevronRightIcon className={`${colors.text} opacity-30 group-hover:opacity-100 transition-opacity`} />
                        </div>
                    );
                  })}</div>}
                </div>
              </div>
            )}
        </div>

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
            Swal.fire({ title: "Paciente Creado", text: `${newPatient.name} ${newPatient.last_name} ha sido agregado.`, icon: "success", timer: 2000, showConfirmButton: false, toast: true, position: 'top-end' });
          }} 
        />
      </div>

      <BoxMapModal isOpen={showBoxMap} onClose={() => setShowBoxMap(false)} rooms={rooms} appointments={appointments} holidays={holidays} selectedDate={formatLocalDate(selectedDate)} regions={regions} communes={communes} doctors={doctors} items={items} patients={localPatients} onDateChange={(newDate) => { const dateObj = new Date(newDate + 'T00:00:00'); setSelectedDate(dateObj); setCurrentDate(dateObj); }} />
    </AuthenticatedLayout>
  );
}
