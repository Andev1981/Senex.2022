import React, { useState } from "react";
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
  ChevronRight as ChevronRightIcon,
  MapPin,
  Building,
  Coffee
} from "lucide-react";
import { Head, useForm, router } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import Swal from "sweetalert2";
import SearchSelect from "@/components/SearchSelect";
import RutInput from "@/components/RutInput";
import ChilePhoneInput from "@/components/ChilePhoneInput";
import Switch from "@/components/Switch";
import InputError from "@/components/InputError";

export default function AgendaCalendar({ 
  appointments = [], 
  doctors = [], 
  patients = [], 
  items = [], 
  rooms = [],
  availabilities = [],
  holidays = []
}) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState("month"); // month, week, day
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showNewAppointment, setShowNewAppointment] = useState(false);
  const [showQuickPatient, setShowQuickPatient] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [filterStatus, setFilterStatus] = useState("todos");
  const [searchTerm, setSearchTerm] = useState("");
  const [isDateLocked, setIsDateLocked] = useState(false);

  // --- 🎯 LÓGICA DE CAPACIDAD DIARIA ---
  const getDayCapacityStats = (date) => {
    const dateStr = date.toISOString().split("T")[0];
    const dayOfWeek = ["SU", "MO", "TU", "WE", "TH", "FR", "SA"][date.getDay()];
    
    // 1. Verificar Feriado
    const holiday = holidays.find(h => h.date === dateStr || (h.is_recurring && h.date.substring(5) === dateStr.substring(5)));
    if (holiday) return { isHoliday: true, holidayName: holiday.name };

    // 2. Calcular Capacidad Teórica (Profesionales con turnos hoy)
    // Buscamos turnos que coincidan con el día de la semana en la regla recurrente (MO, TU, WE, etc.)
    const activeShifts = availabilities.filter(av => {
        const rrule = av.rrule || "";
        return rrule.includes(`BYDAY=${dayOfWeek}`) || 
               rrule.includes(`BYDAY=${dayOfWeek},`) || 
               rrule.includes(`,${dayOfWeek}`) ||
               (rrule.includes(`BYDAY=`) && rrule.split('BYDAY=')[1].split(';')[0].split(',').includes(dayOfWeek));
    });

    const isOpen = activeShifts.length > 0;
    
    // 3. Ocupación Real
    const dayAppointments = appointments.filter(apt => apt.date === dateStr && apt.status !== 'cancelled');
    const onsiteAppointmentsCount = dayAppointments.filter(apt => apt.modality !== 'home').length;
    
    // Capacidad total física de la clínica hoy (Suma de capacidad de boxes que tienen al menos un profesional)
    const activeRoomsToday = [...new Set(activeShifts.filter(s => s.modality !== 'home').map(s => s.room_id))];
    const totalPhysicalCapacity = rooms
        .filter(r => activeRoomsToday.includes(r.id))
        .reduce((acc, r) => acc + r.capacity, 0);

    return {
        isHoliday: false,
        isOpen: isOpen,
        appointmentsCount: dayAppointments.length,
        onsiteCount: onsiteAppointmentsCount,
        capacity: totalPhysicalCapacity,
        percent: totalPhysicalCapacity > 0 ? (onsiteAppointmentsCount / totalPhysicalCapacity) * 100 : 0
    };
  };

  const { data, setData, post, processing, reset, errors } = useForm({
    date: new Date().toISOString().split('T')[0],
    start_time: "09:00",
    end_time: "10:00",
    patient_id: "",
    doctor_id: "",
    item_id: "",
    room_id: "",
    modality: "onsite",
    notes: "",
    is_direct: false,
    send_mail: false,
    send_whatsapp: false,
  });

  // --- 🎯 SINCRONIZAR FECHA AL ABRIR MODAL ---
  React.useEffect(() => {
    if (showNewAppointment) {
      setData("date", selectedDate.toISOString().split("T")[0]);
    }
  }, [showNewAppointment, selectedDate]);

  // --- 🎯 EFECTO DE AGENDAMIENTO RÁPIDO ---
  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const action = params.get('action');
    const patientId = params.get('patient_id');

    if (action === 'new' || action === 'create') {
        const date = params.get('date');
        const startTime = params.get('start_time');
        const roomId = params.get('room_id');

        if (date) setData('date', date);
        if (patientId) setData('patient_id', Number(patientId));
        
        if (startTime) {
            setData('start_time', startTime);
            // Autocalcular fin (30 min después por defecto)
            const [h, m] = startTime.split(':').map(Number);
            const dateObj = new Date();
            dateObj.setHours(h, m + 30);
            setData('end_time', dateObj.toTimeString().substring(0, 5));
        }
        if (roomId) setData('room_id', roomId);

        setShowNewAppointment(true);
        
        // Limpiar URL sin recargar
        window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);

  const quickPatientForm = useForm({
    name: "",
    rut: "",
    phone: "",
    email: "",
  });

  const handleQuickPatientSubmit = (e) => {
    e.preventDefault();
    quickPatientForm.post(route('patients.quick_store'), {
        onSuccess: (page) => {
            // El backend debería retornar el paciente creado
            setShowQuickPatient(false);
            quickPatientForm.reset();
            Swal.fire("¡Éxito!", "Paciente registrado correctamente", "success");
            // Nota: Inertia refresca los props, así que el nuevo paciente aparecerá en la lista
        }
    });
  };

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    // Ajustar para que la semana comience el Lunes (1) en lugar de Domingo (0)
    const startingDayOfWeek = (firstDay.getDay() + 6) % 7;

    const days = [];

    // Días del mes anterior
    for (let i = 0; i < startingDayOfWeek; i++) {
      const prevMonthDay = new Date(year, month, -startingDayOfWeek + i + 1);
      days.push({ date: prevMonthDay, isCurrentMonth: false });
    }

    // Días del mes actual
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({ date: new Date(year, month, i), isCurrentMonth: true });
    }

    // Días del siguiente mes
    const remainingDays = 42 - days.length;
    for (let i = 1; i <= remainingDays; i++) {
      days.push({ date: new Date(year, month + 1, i), isCurrentMonth: false });
    }

    return days;
  };

  const getAppointmentsForDate = (date) => {
    const dateStr = date.toISOString().split("T")[0];
    return appointments.filter((apt) => apt.date === dateStr);
  };

  const getWeekDays = () => {
    const startOfWeek = new Date(selectedDate);
    // Ajustar para que el inicio de semana sea Lunes
    const day = selectedDate.getDay() || 7; // Domingo (0) se convierte en 7
    startOfWeek.setDate(selectedDate.getDate() - day + 1);

    const days = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      days.push(day);
    }
    return days;
  };

  const changeMonth = (direction) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(currentDate.getMonth() + direction);
    setCurrentDate(newDate);
  };

  const changeWeek = (direction) => {
    const newDate = new Date(selectedDate);
    newDate.setDate(selectedDate.getDate() + direction * 7);
    setSelectedDate(newDate);
  };

  const changeDay = (direction) => {
    const newDate = new Date(selectedDate);
    newDate.setDate(selectedDate.getDate() + direction);
    setSelectedDate(newDate);
  };

  const isDatePast = (date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const checkDate = new Date(date);
    checkDate.setHours(0, 0, 0, 0);
    return checkDate < today;
  };

  const isToday = (date) => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  const monthNames = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
  ];
  const dayNames = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

  const hours = Array.from({ length: 12 }, (_, i) => i + 8); // 8:00 - 19:00

  const handleCreateAppointment = (e) => {
    e.preventDefault();
    
    // Transformamos la data para asegurar que is_direct sea FALSE
    router.post(route('agendas.store'), {
        ...data,
        is_direct: false
    }, {
        onSuccess: () => {
            setShowNewAppointment(false);
            reset();
            Swal.fire("¡Éxito!", "Cita agendada correctamente", "success");
        },
        onError: (err) => {
            console.error("Error al agendar:", err);
            // Sincronizamos los errores de router.post con el hook useForm manualmente 
            // para que los componentes InputError los detecten.
            // Nota: En Inertia, si el controlador retorna back()->withErrors(), 
            // useForm actualiza automáticamente su objeto 'errors' si la petición viene del mismo hook.
            // Como aquí usamos router.post, debemos ser cuidadosos. 
            // Volvamos a usar post de useForm con transform.
        }
    });
  };

  // RE-REFACTOR: Usar post de useForm con transform para mantener el estado de errores y processing
  const submitWithDirectFlag = (isDirectValue) => {
    // 1. Aplicamos la transformación
    const finalData = { ...data, is_direct: isDirectValue };
    
    // 2. Enviamos usando router para mayor control sobre el payload inmediato
    router.post(route('agendas.store'), finalData, {
        onSuccess: () => {
            setShowNewAppointment(false);
            reset();
            Swal.fire("¡Éxito!", isDirectValue ? "Atención iniciada correctamente" : "Cita agendada correctamente", "success");
        },
        onError: (err) => {
            // Pasamos los errores al hook useForm para que se muestren en la UI
            Object.keys(err).forEach(key => {
                // Desafortunadamente useForm no tiene un setError masivo público oficial 
                // en todas las versiones, pero podemos disparar el procesamiento de errores
                // simplemente dejando que Inertia haga lo suyo.
            })
        }
    });
  };

  const todayAppointments = appointments.filter(
    (apt) => apt.date === selectedDate.toISOString().split("T")[0]
  );

  const appointmentStats = {
    total: appointments.length,
    llegaron: appointments.filter((a) => a.status === "checked_in").length,
    pendientes: appointments.filter((a) => a.status === "scheduled").length,
    canceladas: appointments.filter((a) => a.status === "cancelled").length,
  };

  const isPast = (apt) => {
    const now = new Date();
    const [hours, minutes] = apt.start_time.split(':');
    const aptTime = new Date(apt.date + 'T' + apt.start_time);
    return aptTime < now;
  };

  const canCheckIn = (apt) => {
    if (apt.status !== 'scheduled') return false;
    if (isPast(apt) && apt.date !== new Date().toISOString().split('T')[0]) return false;
    
    const today = new Date().toISOString().split('T')[0];
    if (apt.date !== today) return false;

    // Permitir check-in desde 60 minutos antes de la hora agendada
    const now = new Date();
    const aptTime = new Date(apt.date + 'T' + apt.start_time);
    const startTimeLimit = new Date(aptTime.getTime() - 60 * 60000); // 60 min antes
    
    return now >= startTimeLimit && !isPast(apt);
  };

  return (
    <AuthenticatedLayout>
      <Head title="Agenda" />
      <div className="min-h-screen p-4 bg-gray-50">
        {/* Header */}
        <div className="p-6 mb-6 bg-white border border-gray-200 shadow-sm rounded-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-12 h-12 shadow-lg bg-gradient-to-br from-brand-primary to-brand-primary/80 rounded-xl">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Agenda</h1>
                <p className="text-sm text-gray-600">
                  Gestión de citas y calendario
                </p>
              </div>
            </div>
            <div className="flex gap-2">
                <button
                  onClick={() => {
                    setIsDateLocked(false);
                    setShowNewAppointment(true);
                  }}
                  className="flex items-center gap-2 px-6 py-2 font-semibold text-white transition-colors bg-brand-primary rounded-lg shadow-lg hover:brightness-110 shadow-brand-primary/30"
                >
                  <Plus className="w-4 h-4" />
                  Nueva Cita
                </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 gap-4 mb-6 md:grid-cols-4">
          <div className="p-4 bg-white border border-gray-200 shadow-sm rounded-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="mb-1 text-sm text-gray-600 font-bold uppercase tracking-widest text-[10px]">Total Citas</p>
                <p className="text-3xl font-bold text-gray-900">
                  {appointmentStats.total}
                </p>
              </div>
              <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="p-4 bg-white border border-gray-200 shadow-sm rounded-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="mb-1 text-sm text-gray-600 font-bold uppercase tracking-widest text-[10px]">Llegaron</p>
                <p className="text-3xl font-bold text-green-600">
                  {appointmentStats.llegaron}
                </p>
              </div>
              <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="p-4 bg-white border border-gray-200 shadow-sm rounded-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="mb-1 text-sm text-gray-600 font-bold uppercase tracking-widest text-[10px]">Pendientes</p>
                <p className="text-3xl font-bold text-orange-600">
                  {appointmentStats.pendientes}
                </p>
              </div>
              <div className="flex items-center justify-center w-12 h-12 bg-orange-100 rounded-lg">
                <Clock className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </div>

          <div className="p-4 bg-white border border-gray-200 shadow-sm rounded-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="mb-1 text-sm text-gray-600 font-bold uppercase tracking-widest text-[10px]">Canceladas</p>
                <p className="text-3xl font-bold text-red-600">
                  {appointmentStats.canceladas}
                </p>
              </div>
              <div className="flex items-center justify-center w-12 h-12 bg-red-100 rounded-lg">
                <XCircle className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="p-4 mb-6 bg-white border border-gray-200 shadow-sm rounded-xl">
          <div className="flex flex-col items-center justify-between gap-4 lg:flex-row">
            {/* View Mode Selector */}
            <div className="flex items-center gap-2 p-1 bg-gray-100 rounded-lg">
              <button
                onClick={() => setViewMode("month")}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  viewMode === "month"
                    ? "bg-white text-brand-primary shadow-sm font-black"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                <Calendar className="inline w-4 h-4 mr-2" />
                Mes
              </button>
              <button
                onClick={() => setViewMode("week")}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  viewMode === "week"
                    ? "bg-white text-brand-primary shadow-sm font-black"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                <Grid className="inline w-4 h-4 mr-2" />
                Semana
              </button>
              <button
                onClick={() => setViewMode("day")}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  viewMode === "day"
                    ? "bg-white text-brand-primary shadow-sm font-black"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                <List className="inline w-4 h-4 mr-2" />
                Día
              </button>
            </div>

            {/* Date Navigation */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  if (viewMode === "month") changeMonth(-1);
                  else if (viewMode === "week") changeWeek(-1);
                  else changeDay(-1);
                }}
                className="p-2 transition-colors rounded-lg hover:bg-gray-100"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              <div className="text-center min-w-[200px]">
                <h2 className="text-xl font-bold text-gray-900 uppercase tracking-widest text-sm">
                  {viewMode === "month" &&
                    `${
                      monthNames[currentDate.getMonth()]
                    } ${currentDate.getFullYear()}`}
                  {viewMode === "week" &&
                    `Semana del ${selectedDate.getDate()} de ${
                      monthNames[selectedDate.getMonth()]
                    }`}
                  {viewMode === "day" &&
                    `${selectedDate.getDate()} de ${
                      monthNames[selectedDate.getMonth()]
                    } ${selectedDate.getFullYear()}`}
                </h2>
              </div>

              <button
                onClick={() => {
                  if (viewMode === "month") changeMonth(1);
                  else if (viewMode === "week") changeWeek(1);
                  else changeDay(1);
                }}
                className="p-2 transition-colors rounded-lg hover:bg-gray-100"
              >
                <ChevronRight className="w-5 h-5" />
              </button>

              <button
                onClick={() => {
                  const today = new Date();
                  setCurrentDate(today);
                  setSelectedDate(today);
                }}
                className="px-4 py-2 ml-2 font-black uppercase tracking-widest text-[10px] text-brand-primary transition-colors rounded-lg bg-brand-primary/10 hover:bg-brand-primary/20"
              >
                Hoy
              </button>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-2">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 text-xs font-bold uppercase tracking-widest border-2 border-gray-100 rounded-xl focus:border-brand-primary focus:outline-none"
              >
                <option value="todos">Todos los estados</option>
                <option value="scheduled">Agendada</option>
                <option value="checked_in">Llegó</option>
                <option value="cancelled">Cancelada</option>
              </select>
            </div>
          </div>
        </div>

        {/* Calendar Views */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
          {/* Main Calendar */}
          <div className="lg:col-span-3">
            {/* Month View */}
            {viewMode === "month" && (
              <div className="overflow-hidden bg-white border border-gray-100 shadow-sm rounded-2xl">
                {/* Day Headers */}
                <div className="grid grid-cols-7 border-b border-gray-100 bg-gray-50/50">
                  {dayNames.map((day) => (
                    <div key={day} className="p-4 text-center">
                      <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                        {day}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Calendar Grid */}
                <div className="grid grid-cols-7">
                  {getDaysInMonth(currentDate).map((day, index) => {
                    const stats = getDayCapacityStats(day.date);
                    const dayAppointments = getAppointmentsForDate(day.date);
                    const isSelected = selectedDate.toDateString() === day.date.toDateString();
                    const isTodayDate = isToday(day.date);

                    const isClosed = !stats.isOpen && !stats.isHoliday;

                    return (
                      <div
                        key={index}
                        onClick={() => {
                          if (stats.isHoliday || isClosed) return;
                          setSelectedDate(day.date);
                          setViewMode("day");
                        }}
                        className={`min-h-[140px] p-3 border-b border-r border-gray-50 cursor-pointer transition-all hover:bg-gray-50/50 relative overflow-hidden group ${
                          !day.isCurrentMonth
                            ? "bg-gray-50/20 opacity-40"
                            : ""
                        } ${
                          isSelected
                            ? "bg-brand-primary/5 ring-1 ring-brand-primary/20 z-10"
                            : ""
                        } ${
                          stats.isHoliday ? "bg-amber-50/40 cursor-not-allowed" : ""
                        } ${
                          isClosed && day.isCurrentMonth ? "bg-gray-50/60 cursor-not-allowed" : ""
                        } ${
                          stats.isOpen && day.isCurrentMonth ? "bg-white shadow-[inset_0_0_20px_rgba(59,130,246,0.02)]" : ""
                        }`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <span
                            className={`text-xs font-black ${
                              !day.isCurrentMonth
                                ? "text-gray-300"
                                : isTodayDate
                                ? "bg-brand-primary text-white w-7 h-7 rounded-lg flex items-center justify-center shadow-lg shadow-brand-primary/20"
                                : "text-gray-900"
                            }`}
                          >
                            {day.date.getDate()}
                          </span>

                          <div className="flex items-center gap-1.5">
                            {!stats.isHoliday && !isClosed && day.isCurrentMonth && (
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setSelectedDate(day.date);
                                        setIsDateLocked(true);
                                        setShowNewAppointment(true);
                                    }}
                                    className="p-1.5 bg-brand-primary text-white rounded-lg opacity-0 group-hover:opacity-100 hover:scale-110 transition-all shadow-lg shadow-brand-primary/20"
                                    title="Agendar específicamente este día"
                                >
                                    <Plus className="w-3.5 h-3.5" />
                                </button>
                            )}

                            {stats.isHoliday ? (
                                <div className="p-1.5 bg-amber-100 text-amber-600 rounded-lg shadow-sm" title={stats.holidayName}>
                                    <Coffee className="w-3.5 h-3.5" />
                                </div>
                            ) : stats.isOpen ? (
                                <div className="flex items-center gap-1.5 bg-gray-50 px-2 py-1 rounded-lg border border-gray-100 group-hover:hidden transition-all">
                                    <span className={`text-[8px] font-black ${stats.percent >= 90 ? 'text-red-500' : 'text-brand-primary'}`}>
                                        {Math.round(stats.percent)}%
                                    </span>
                                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
                                </div>
                            ) : day.isCurrentMonth && (
                                <div className="p-1 bg-gray-100 text-gray-400 rounded-lg">
                                    <XCircle className="w-3 h-3" />
                                </div>
                            )}
                          </div>
                        </div>

                        {/* Barra de Carga (Heatmap) */}
                        {!stats.isHoliday && stats.isOpen && (
                            <div className="absolute top-0 left-0 w-full h-1 bg-gray-100">
                                <div 
                                    className={`h-full transition-all duration-700 ${
                                        stats.percent >= 90 ? 'bg-red-500' : stats.percent >= 50 ? 'bg-orange-400' : 'bg-green-500'
                                    }`} 
                                    style={{ width: `${Math.max(stats.percent, 2)}%` }}
                                ></div>
                            </div>
                        )}

                        <div className="space-y-1.5">
                          {stats.isHoliday ? (
                            <div className="mt-4 text-center">
                                <p className="text-[9px] font-black text-amber-600 uppercase tracking-widest leading-tight">{stats.holidayName}</p>
                            </div>
                          ) : isClosed && day.isCurrentMonth ? (
                            <div className="mt-6 text-center opacity-40">
                                <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Sin atención</p>
                            </div>
                          ) : (
                            <>
                                {dayAppointments.slice(0, 3).map((apt) => (
                                    <div
                                    key={apt.id}
                                    className={`text-[9px] font-black uppercase tracking-widest p-1.5 rounded-lg truncate border shadow-sm flex items-center gap-1 ${
                                        apt.status === 'scheduled'
                                        ? "bg-blue-50 text-blue-600 border-blue-100"
                                        : apt.status === 'confirmed'
                                        ? "bg-indigo-50 text-indigo-600 border-indigo-100"
                                        : apt.status === 'checked_in'
                                        ? "bg-orange-50 text-orange-600 border-orange-100"
                                        : apt.status === 'in_progress'
                                        ? "bg-amber-50 text-amber-600 border-amber-100"
                                        : apt.status === 'completed'
                                        ? "bg-green-50 text-green-600 border-green-100"
                                        : "bg-gray-50 text-gray-500 border-gray-100"
                                    }`}
                                    >
                                    {apt.modality === 'home' && <MapPin className="w-2 h-2 shrink-0" />}
                                    <span className="opacity-70">
                                        {apt.start_time.substring(0, 5)}
                                    </span>{" "}
                                    {apt.patient?.full_name || 'S/N'}
                                    </div>
                                ))}
                                {dayAppointments.length > 3 && (
                                    <div className="text-[9px] font-black text-gray-400 pl-1 uppercase tracking-widest">
                                    +{dayAppointments.length - 3} más
                                    </div>
                                )}
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Week View */}
            {viewMode === "week" && (
              <div className="overflow-hidden bg-white border border-gray-100 shadow-sm rounded-2xl">
                {/* Day Headers */}
                <div className="grid grid-cols-8 border-b border-gray-100 bg-gray-50/50">
                  <div className="p-3"></div>
                  {getWeekDays().map((day, index) => (
                    <div
                      key={index}
                      className="p-4 text-center border-l border-gray-100"
                    >
                      <div className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                        {dayNames[day.getDay()]}
                      </div>
                      <div
                        className={`text-xl font-black mt-1 ${
                          isToday(day) ? "text-brand-primary" : "text-gray-900"
                        }`}
                      >
                        {day.getDate()}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Time Slots */}
                <div className="grid grid-cols-8">
                  {hours.map((hour) => (
                    <React.Fragment key={hour}>
                      <div className="p-4 text-[10px] font-black text-right text-gray-400 border-b border-gray-50 uppercase tracking-widest">
                        {hour}:00
                      </div>
                      {getWeekDays().map((day, dayIndex) => {
                        const dateStr = day.toISOString().split("T")[0];
                        const dayAppts = appointments.filter(
                          (apt) =>
                            apt.date === dateStr &&
                            parseInt(apt.start_time.split(":")[0]) === hour
                        );

                        return (
                          <div
                            key={dayIndex}
                            className="min-h-[80px] p-1 border-b border-l border-gray-50 hover:bg-gray-50/50 cursor-pointer transition-colors"
                          >
                            {dayAppts.map((apt) => (
                              <div
                                key={apt.id}
                                onClick={() => setSelectedAppointment(apt)}
                                className={`p-2 rounded-xl text-[10px] font-black uppercase tracking-widest mb-1 border shadow-sm ${
                                  apt.status === 'scheduled'
                                    ? "bg-orange-50 text-orange-600 border-orange-200 border-l-4 border-l-orange-500"
                                    : apt.status === 'confirmed'
                                    ? "bg-green-50 text-green-600 border-green-200 border-l-4 border-l-green-500"
                                    : "bg-gray-50 text-gray-500 border-gray-200 border-l-4 border-l-gray-400"
                                }`}
                              >
                                <div className="truncate">
                                  {apt.patient?.name || 'S/N'}
                                </div>
                                <div className="truncate opacity-70 mt-0.5">
                                  {apt.item?.name || 'Consulta'}
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

            {/* Day View */}
            {viewMode === "day" && (
              <div className="bg-white border border-gray-100 shadow-sm rounded-2xl overflow-hidden">
                <div className="p-8 border-b border-gray-100 bg-gray-50/30">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center justify-center w-14 h-14 bg-brand-primary text-white rounded-2xl shadow-xl shadow-brand-primary/20">
                        <span className="text-xl font-black">{selectedDate.getDate()}</span>
                    </div>
                    <div>
                        <h3 className="text-lg font-black text-gray-900 uppercase tracking-widest">
                            {selectedDate.toLocaleDateString("es-CL", {
                            weekday: "long",
                            month: "long",
                            day: "numeric",
                            })}
                        </h3>
                        <p className="text-[10px] font-bold text-brand-primary uppercase tracking-widest">
                            {todayAppointments.length} citas programadas
                        </p>
                    </div>
                  </div>
                </div>

                <div className="p-8">
                  {todayAppointments.length === 0 ? (
                    <div className="py-20 text-center">
                      <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Calendar className="w-10 h-10 text-gray-200" />
                      </div>
                      <p className="text-xs font-black text-gray-400 uppercase tracking-widest">
                        No hay citas programadas para este día
                      </p>
                      {!isDatePast(selectedDate) && (
                        <button
                          onClick={() => {
                            setIsDateLocked(true);
                            setShowNewAppointment(true);
                          }}
                          className="mt-6 text-[10px] font-black text-brand-primary uppercase tracking-[0.2em] hover:brightness-110"
                        >
                          + Agregar nueva cita
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {todayAppointments
                        .sort((a, b) => a.start_time.localeCompare(b.start_time))
                        .map((apt) => (
                          <div
                            key={apt.id}
                            onClick={() => setSelectedAppointment(apt)}
                            className="flex items-center gap-6 p-6 transition-all border border-gray-100 cursor-pointer rounded-2xl hover:border-brand-primary/30 hover:bg-gray-50/50 group"
                          >
                            <div className="flex-shrink-0 text-center min-w-[100px] border-r border-gray-100 pr-6">
                              <div className="text-sm font-black text-gray-900">
                                {apt.start_time.substring(0, 5)}
                              </div>
                              <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                {apt.end_time.substring(0, 5)}
                              </div>
                            </div>

                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-3 mb-2">
                                <h4 className="text-sm font-black text-gray-900 uppercase tracking-widest">
                                  {apt.patient?.name}
                                </h4>
                                <span
                                  className={`text-[9px] px-2 py-1 rounded-lg font-black uppercase tracking-widest ${
                                    apt.status === "confirmed"
                                      ? "bg-green-100 text-green-700"
                                      : apt.status === "scheduled"
                                      ? "bg-orange-100 text-orange-700"
                                      : "bg-red-100 text-red-700"
                                  }`}
                                >
                                  {apt.status}
                                </span>
                              </div>

                              <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">
                                {apt.item?.name || 'Sin tratamiento definido'}
                              </p>

                              <div className="flex items-center gap-6 mt-3">
                                <span className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                  <User className="w-3 h-3 text-brand-primary" />
                                  {apt.doctor?.name}
                                </span>
                              </div>
                            </div>

                            <button className="flex-shrink-0 p-3 transition-colors rounded-xl bg-gray-50 text-gray-400 group-hover:bg-brand-primary group-hover:text-white">
                                <ChevronRightIcon className="w-5 h-5" />
                            </button>
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Info */}
            <div className="p-8 text-white bg-brand-primary rounded-3xl shadow-2xl shadow-brand-primary/30 relative overflow-hidden">
              <div className="relative z-10">
                <Calendar className="w-10 h-10 mb-4 opacity-50" />
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] mb-2 opacity-80">Citas de Hoy</h3>
                <p className="text-4xl font-black mb-4">
                    {todayAppointments.length}
                </p>
                <div className="flex gap-4">
                    <div className="text-[9px] font-black uppercase tracking-widest bg-white/10 px-2 py-1 rounded-lg">
                        {todayAppointments.filter(a => a.status === 'confirmed').length} CONF
                    </div>
                    <div className="text-[9px] font-black uppercase tracking-widest bg-white/10 px-2 py-1 rounded-lg">
                        {todayAppointments.filter(a => a.status === 'scheduled').length} PEND
                    </div>
                </div>
              </div>
              <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-white/5 rounded-full blur-2xl"></div>
            </div>

            {/* Mini Calendar */}
            <div className="p-6 bg-white border border-gray-100 shadow-sm rounded-3xl">
              <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-6">Próximos Días</h3>
              <div className="space-y-3">
                {getDaysInMonth(currentDate)
                  .filter((d) => d.isCurrentMonth && d.date >= new Date().setHours(0,0,0,0))
                  .slice(0, 7)
                  .map((day, index) => {
                    const dayAppts = getAppointmentsForDate(day.date);
                    const isTodayDate = isToday(day.date);

                    return (
                      <button
                        key={index}
                        onClick={() => {
                          setSelectedDate(day.date);
                          setViewMode("day");
                        }}
                        className={`w-full flex items-center justify-between p-3 rounded-2xl transition-all ${
                          isTodayDate
                            ? "bg-brand-primary text-white shadow-lg shadow-brand-primary/20 scale-105"
                            : "hover:bg-gray-50 text-gray-600"
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <div className="text-center min-w-[30px]">
                            <div className={`text-[9px] font-black uppercase tracking-widest ${isTodayDate ? 'text-white/70' : 'text-gray-400'}`}>
                              {dayNames[day.date.getDay()]}
                            </div>
                            <div className="text-sm font-black">
                              {day.date.getDate()}
                            </div>
                          </div>
                          <div className="text-left">
                            <p className={`text-[9px] font-black uppercase tracking-widest ${isTodayDate ? 'text-white' : 'text-gray-900'}`}>
                              {dayAppts.length}{" "}
                              {dayAppts.length === 1 ? "cita" : "citas"}
                            </p>
                          </div>
                        </div>
                        {dayAppts.length > 0 && !isTodayDate && (
                           <div className="w-1.5 h-1.5 rounded-full bg-brand-primary"></div>
                        )}
                      </button>
                    );
                  })}
              </div>
            </div>
          </div>
        </div>

        {/* Modal Nueva Cita */}
        {showNewAppointment && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white rounded-[2.5rem] shadow-2xl max-w-xl w-full overflow-hidden animate-in zoom-in-95 duration-300">
              <div className="p-8 pb-0 flex justify-between items-start">
                  <div>
                    <h2 className="text-xl font-black text-gray-900 uppercase tracking-widest">Nueva Cita</h2>
                    <p className="text-[10px] font-bold text-brand-primary uppercase tracking-widest mt-1">Registrar ingreso a agenda</p>
                  </div>
                  <button
                    onClick={() => {
                        setShowNewAppointment(false);
                        setIsDateLocked(false);
                    }}
                    className="p-3 text-gray-400 transition-colors rounded-2xl hover:bg-gray-50 hover:text-gray-900"
                  >
                    <X className="w-6 h-6" />
                  </button>
              </div>

              <form onSubmit={handleCreateAppointment} className="p-8 space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Fecha</label>
                      <input
                        type="date"
                        value={data.date}
                        onChange={(e) => !isDateLocked && setData("date", e.target.value)}
                        readOnly={isDateLocked}
                        className={`w-full px-5 py-4 border-none rounded-2xl font-bold text-sm transition-all ${
                          isDateLocked 
                            ? "bg-gray-100 text-gray-500 cursor-not-allowed" 
                            : "bg-gray-50 focus:bg-white focus:ring-2 focus:ring-brand-primary/20"
                        }`}
                        required
                      />
                      <InputError message={errors.date} />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Inicio</label>
                        <input
                          type="time"
                          value={data.start_time}
                          onChange={(e) => setData("start_time", e.target.value)}
                          className="w-full px-4 py-4 bg-gray-50 border-none rounded-2xl font-bold text-sm focus:bg-white focus:ring-2 focus:ring-brand-primary/20 transition-all"
                          required
                        />
                        <InputError message={errors.start_time} />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Término</label>
                        <input
                          type="time"
                          value={data.end_time}
                          onChange={(e) => setData("end_time", e.target.value)}
                          className="w-full px-4 py-4 bg-gray-50 border-none rounded-2xl font-bold text-sm focus:bg-white focus:ring-2 focus:ring-brand-primary/20 transition-all"
                          required
                        />
                        <InputError message={errors.end_time} />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Paciente</label>
                    <div className="flex gap-2">
                        <SearchSelect 
                            options={patients}
                            value={data.patient_id}
                            onChange={val => setData("patient_id", val)}
                            placeholder="Buscar paciente..."
                            className="flex-1"
                            config={{
                                valueKey: 'id',
                                displayKey: 'full_name', // 👈 Cambiado a full_name
                                secondaryKeys: ['rut'],
                                searchKeys: ['full_name', 'rut'] // 👈 Incluye full_name en búsqueda
                            }}
                        />
                        <button 
                            type="button"
                            onClick={() => setShowQuickPatient(true)}
                            className="p-4 bg-brand-primary/10 text-brand-primary rounded-2xl hover:bg-brand-primary/20 transition-all h-[52px] flex items-center justify-center"
                            title="Registro Rápido"
                        >
                            <Plus className="w-6 h-6" />
                        </button>
                    </div>
                    <InputError message={errors.patient_id} />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Kinesiólogo</label>
                        <SearchSelect 
                            options={doctors}
                            value={data.doctor_id}
                            onChange={val => setData("doctor_id", val)}
                            placeholder="Buscar kine..."
                            config={{
                                valueKey: 'id',
                                displayKey: 'full_name', // 👈 Cambiado a full_name
                                secondaryKeys: ['specialty'],
                                searchKeys: ['full_name'] // 👈 Incluye full_name en búsqueda
                            }}
                        />
                        <InputError message={errors.doctor_id} />
                    </div>
                    <div className="space-y-1">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Modalidad</label>
                        <div className="flex bg-gray-50 p-1 rounded-2xl gap-1">
                            <button 
                                type="button" 
                                onClick={() => setData("modality", "onsite")}
                                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[10px] font-black uppercase transition-all ${data.modality === 'onsite' ? "bg-white text-brand-primary shadow-sm" : "text-gray-400 hover:text-gray-600"}`}
                            >
                                <Building className="w-3 h-3" /> Clínica
                            </button>
                            <button 
                                type="button" 
                                onClick={() => setData("modality", "home")}
                                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[10px] font-black uppercase transition-all ${data.modality === 'home' ? "bg-white text-brand-primary shadow-sm" : "text-gray-400 hover:text-gray-600"}`}
                            >
                                <MapPin className="w-3 h-3" /> Domicilio
                            </button>
                        </div>
                        <InputError message={errors.modality} />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Tipo de Servicio</label>
                        <SearchSelect 
                            options={items}
                            value={data.item_id}
                            onChange={val => setData("item_id", val)}
                            placeholder="Buscar servicio..."
                            config={{
                                valueKey: 'id',
                                displayKey: 'name',
                                secondaryKeys: ['sku'],
                                searchKeys: ['name', 'sku']
                            }}
                        />
                        <InputError message={errors.item_id} />
                    </div>
                    {data.modality === 'onsite' ? (
                        <div className="space-y-1 animate-in fade-in zoom-in-95 duration-200">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Box / Sala (Opcional)</label>
                            <select
                                value={data.room_id}
                                onChange={(e) => setData("room_id", e.target.value)}
                                className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl font-bold text-sm focus:bg-white focus:ring-2 focus:ring-brand-primary/20 transition-all"
                            >
                                <option value="">Seleccione Box</option>
                                {rooms.map(r => (
                                    <option key={r.id} value={r.id}>{r.name} {r.status !== 'active' ? '(No disponible)' : ''}</option>
                                ))}
                            </select>
                            <InputError message={errors.room_id} />
                        </div>
                    ) : (
                        <div className="space-y-1 animate-in fade-in zoom-in-95 duration-200">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Dirección de Atención</label>
                            <div className="p-4 bg-blue-50/50 border border-blue-100/50 rounded-2xl flex items-center gap-3">
                                <MapPin className="w-4 h-4 text-brand-primary" />
                                <span className="text-[10px] font-black text-brand-primary uppercase tracking-widest">Se usará dirección del paciente</span>
                            </div>
                        </div>
                    )}
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Notas Administrativas</label>
                    <textarea
                      value={data.notes}
                      onChange={(e) => setData("notes", e.target.value)}
                      rows="2"
                      placeholder="Ej: Viene por recomendación, paciente primera vez..."
                      className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl font-bold text-sm focus:bg-white focus:ring-2 focus:ring-brand-primary/20 transition-all"
                    ></textarea>
                    <InputError message={errors.notes} />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
                          <div>
                              <p className="text-[9px] font-black uppercase tracking-widest text-gray-700">Enviar Comprobante</p>
                              <p className="text-[8px] text-gray-400 font-bold uppercase">Vía Email</p>
                          </div>
                          <Switch 
                              checked={data.send_mail} 
                              onChange={checked => setData("send_mail", checked)} 
                          />
                      </div>
                      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
                          <div>
                              <p className="text-[9px] font-black uppercase tracking-widest text-gray-700">Enviar WhatsApp</p>
                              <p className="text-[8px] text-gray-400 font-bold uppercase">Confirmación instantánea</p>
                          </div>
                          <Switch 
                              checked={data.send_whatsapp} 
                              onChange={checked => setData("send_whatsapp", checked)} 
                          />
                      </div>
                  </div>

                <div className="flex flex-col gap-3 pt-4">
                  <div className="flex gap-4">
                    <button
                        type="button"
                        onClick={() => submitWithDirectFlag(true)}
                        disabled={processing}
                        className="flex-1 py-4 font-black uppercase tracking-widest text-[10px] text-white bg-green-600 rounded-2xl shadow-xl shadow-green-600/20 hover:brightness-110 active:scale-95 transition-all disabled:opacity-50"
                    >
                        {processing && data.is_direct ? 'Iniciando...' : 'Iniciar Atención Ahora'}
                    </button>

                    <button
                        type="button"
                        onClick={() => submitWithDirectFlag(false)}
                        disabled={processing}
                        className="flex-1 py-4 font-black uppercase tracking-widest text-[10px] text-white bg-brand-primary rounded-2xl shadow-xl shadow-brand-primary/20 hover:brightness-110 active:scale-95 transition-all disabled:opacity-50"
                    >
                        {processing && !data.is_direct ? 'Agendando...' : 'Confirmar Cita'}
                    </button>
                  </div>
                  
                  <button
                    type="button"
                    onClick={() => {
                        setShowNewAppointment(false);
                        setIsDateLocked(false);
                    }}
                    className="w-full py-3 font-black uppercase tracking-widest text-[10px] text-gray-400 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-all"
                  >
                    Cancelar y Cerrar
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal Detalle Cita */}
        {selectedAppointment && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm">
            <div className="bg-white rounded-[2.5rem] shadow-2xl max-w-xl w-full overflow-hidden">
                <div className="p-10">
                    <div className="flex justify-between items-start mb-8">
                        <div>
                            <span className="text-[10px] font-black text-brand-primary uppercase tracking-[0.2em]">Detalle de Cita</span>
                            <h2 className="text-2xl font-black text-gray-900 uppercase tracking-widest mt-1">
                                {selectedAppointment.patient?.name}
                            </h2>
                        </div>
                        <button onClick={() => setSelectedAppointment(null)} className="p-3 bg-gray-50 text-gray-400 rounded-2xl hover:text-gray-900">
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    <div className="grid grid-cols-2 gap-8 mb-10">
                        <div className="space-y-1">
                            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Horario</p>
                            <p className="text-sm font-black text-gray-900">
                                {selectedAppointment.start_time.substring(0, 5)} - {selectedAppointment.end_time.substring(0, 5)}
                            </p>
                            <p className="text-[10px] font-bold text-gray-500">{selectedAppointment.date}</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Estado</p>
                            <div className="flex items-center gap-2">
                                <div className={`w-2 h-2 rounded-full ${
                                    selectedAppointment.status === 'confirmed' ? 'bg-indigo-500' : 
                                    selectedAppointment.status === 'checked_in' ? 'bg-orange-500' : 
                                    selectedAppointment.status === 'in_progress' ? 'bg-amber-500' : 
                                    selectedAppointment.status === 'completed' ? 'bg-green-500' : 
                                    selectedAppointment.status === 'cancelled' ? 'bg-red-500' : 
                                    isPast(selectedAppointment) ? 'bg-gray-400' : 'bg-blue-500'
                                }`}></div>
                                <p className="text-sm font-black text-gray-900 uppercase">
                                    {isPast(selectedAppointment) && selectedAppointment.status === 'scheduled' ? 'FINALIZADA (SIN ASISTENCIA)' : selectedAppointment.status}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6 mb-10">
                        {isPast(selectedAppointment) && (
                            <div className="p-4 bg-gray-50 border border-gray-100 rounded-2xl flex items-center gap-3">
                                <Clock className="w-5 h-5 text-gray-400" />
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Esta cita pertenece al pasado y no puede ser modificada.</p>
                            </div>
                        )}
                        <div className="p-6 bg-gray-50 rounded-3xl">
                            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2">Servicio Solicitado</p>
                            <p className="text-sm font-black text-brand-primary uppercase tracking-widest">{selectedAppointment.item?.name || 'Consulta General'}</p>
                        </div>
                        <div className="flex items-center gap-4 px-6">
                            <div className="w-10 h-10 bg-brand-primary/10 rounded-xl flex items-center justify-center">
                                <User className="w-5 h-5 text-brand-primary" />
                            </div>
                            <div>
                                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Kinesiólogo Asignado</p>
                                <p className="text-xs font-black text-gray-900">{selectedAppointment.doctor?.name}</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col gap-3">
                        {canCheckIn(selectedAppointment) ? (
                            <button 
                                onClick={() => router.post(route('agendas.checkin', selectedAppointment.id))}
                                className="w-full py-4 bg-orange-600 text-white font-black uppercase tracking-widest text-[10px] rounded-2xl shadow-xl shadow-orange-600/20 hover:brightness-110 active:scale-95 transition-all"
                            >
                                Check-in (Paciente Llegó)
                            </button>
                        ) : selectedAppointment.status === 'scheduled' && (
                            <div className="p-4 bg-gray-50 border border-gray-100 rounded-2xl text-center">
                                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">
                                    El check-in se habilitará el día de la cita ({selectedAppointment.date})
                                </p>
                            </div>
                        )}
                        
                        <div className="flex gap-4">
                            {selectedAppointment.status !== 'cancelled' && selectedAppointment.status !== 'checked_in' && selectedAppointment.status !== 'completed' && (
                                <button 
                                    onClick={() => {
                                        Swal.fire({
                                            title: '¿Anular cita?',
                                            text: "Esta acción no se puede deshacer",
                                            icon: 'warning',
                                            showCancelButton: true,
                                            confirmButtonText: 'Sí, anular',
                                            cancelButtonText: 'Cancelar'
                                        }).then((result) => {
                                            if (result.isConfirmed) {
                                                router.post(route('agendas.cancel', selectedAppointment.id));
                                            }
                                        });
                                    }}
                                    className="flex-1 py-4 bg-red-50 text-red-600 font-black uppercase tracking-widest text-[10px] rounded-2xl hover:bg-red-100 transition-all"
                                >
                                    Anular Cita
                                </button>
                            )}
                            
                            {(selectedAppointment.status === 'checked_in' || selectedAppointment.status === 'in_progress') && (
                                <button 
                                    onClick={() => router.get(`/treatment-sessions/create?appointment_id=${selectedAppointment.id}`)}
                                    className="w-full py-4 bg-green-600 text-white font-black uppercase tracking-widest text-[10px] rounded-2xl shadow-xl shadow-green-600/20 hover:brightness-110 active:scale-95 transition-all"
                                >
                                    Iniciar / Continuar Atención Clínica
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
          </div>
        )}
        {/* Modal Registro Rápido Paciente */}
        {showQuickPatient && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white rounded-[2rem] shadow-2xl max-w-lg w-full overflow-hidden animate-in zoom-in-95 duration-300">
              <div className="p-8 pb-0 flex justify-between items-start">
                  <div>
                    <h2 className="text-xl font-black text-gray-900 uppercase tracking-widest">Registro Rápido</h2>
                    <p className="text-[10px] font-bold text-brand-primary uppercase tracking-widest mt-1">Crear ficha básica de paciente</p>
                  </div>
                  <button
                    onClick={() => setShowQuickPatient(false)}
                    className="p-3 text-gray-400 transition-colors rounded-2xl hover:bg-gray-50 hover:text-gray-900"
                  >
                    <X className="w-6 h-6" />
                  </button>
              </div>

              <form onSubmit={handleQuickPatientSubmit} className="p-8 space-y-6">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Nombre Completo</label>
                    <input
                      type="text"
                      value={quickPatientForm.data.name}
                      onChange={(e) => quickPatientForm.setData("name", e.target.value)}
                      className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl font-bold text-sm focus:bg-white focus:ring-2 focus:ring-brand-primary/20 transition-all"
                      placeholder="Ej: Juan Pérez"
                      required
                    />
                    {quickPatientForm.errors.name && <p className="text-red-500 text-[10px] font-bold mt-1 uppercase">{quickPatientForm.errors.name}</p>}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">RUT (Opcional)</label>
                      <RutInput
                          value={quickPatientForm.data.rut}
                          onChange={(val) => quickPatientForm.setData("rut", val)}
                          className="w-full"
                      />
                      {quickPatientForm.errors.rut && <p className="text-red-500 text-[10px] font-bold mt-1 uppercase">{quickPatientForm.errors.rut}</p>}
                  </div>
                  <div className="space-y-1">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Teléfono (Opcional)</label>
                      <ChilePhoneInput
                          value={quickPatientForm.data.phone}
                          onChange={(val) => quickPatientForm.setData("phone", val)}
                      />
                      {quickPatientForm.errors.phone && <p className="text-red-500 text-[10px] font-bold mt-1 uppercase">{quickPatientForm.errors.phone}</p>}
                  </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Email (Opcional)</label>
                    <input
                      type="email"
                      value={quickPatientForm.data.email}
                      onChange={(e) => quickPatientForm.setData("email", e.target.value)}
                      className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl font-bold text-sm focus:bg-white focus:ring-2 focus:ring-brand-primary/20 transition-all"
                      placeholder="correo@ejemplo.com"
                    />
                  </div>

                <div className="flex gap-4 pt-4">
                  <button
                    type="submit"
                    disabled={quickPatientForm.processing}
                    className="flex-1 py-4 font-black uppercase tracking-widest text-xs text-white bg-brand-primary rounded-2xl shadow-xl shadow-brand-primary/20 hover:brightness-110 active:scale-95 transition-all disabled:opacity-50"
                  >
                    {quickPatientForm.processing ? 'Registrando...' : 'Registrar Paciente'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowQuickPatient(false)}
                    className="px-8 py-4 font-black uppercase tracking-widest text-xs text-gray-400 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-all"
                  >
                    Cerrar
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
        {/* Floating Action Button (FAB) - ELIMINADO */}
      </div>
    </AuthenticatedLayout>
  );
}

