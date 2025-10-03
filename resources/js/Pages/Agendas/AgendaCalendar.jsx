import React, { useState } from "react";
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock,
  User,
  MapPin,
  Phone,
  Mail,
  Edit,
  Trash2,
  X,
  Check,
  AlertCircle,
  Filter,
  Search,
  Download,
  Grid,
  List,
  Video,
  MessageSquare,
  CheckCircle,
  XCircle,
  MoreVertical,
  ChevronDown,
  Repeat,
} from "lucide-react";
import { Head } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";

export default function AgendaCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date(2024, 9, 15)); // Octubre 15, 2024
  const [viewMode, setViewMode] = useState("month"); // month, week, day
  const [selectedDate, setSelectedDate] = useState(new Date(2024, 9, 15));
  const [showNewAppointment, setShowNewAppointment] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [filterStatus, setFilterStatus] = useState("todos");
  const [filterType, setFilterType] = useState("todos");
  const [searchTerm, setSearchTerm] = useState("");

  const appointments = [
    {
      id: 1,
      date: "2024-10-15",
      startTime: "09:00",
      endTime: "10:00",
      patient: {
        name: "María González",
        phone: "+56 9 8765 4321",
        email: "maria@email.com",
      },
      treatment: "Rehabilitación Hombro Derecho",
      type: "Sesión Regular",
      status: "Confirmada",
      notes: "Paciente con buena evolución",
      kinesiologist: "Dr. Juan Pérez",
      sessionNumber: 5,
      totalSessions: 12,
      color: "blue",
    },
    {
      id: 2,
      date: "2024-10-15",
      startTime: "10:30",
      endTime: "11:30",
      patient: {
        name: "Carlos Ramírez",
        phone: "+56 9 1234 5678",
        email: "carlos@email.com",
      },
      treatment: "Evaluación Inicial Lumbar",
      type: "Evaluación",
      status: "Confirmada",
      notes: "Primera evaluación",
      kinesiologist: "Dr. Juan Pérez",
      sessionNumber: 1,
      totalSessions: 1,
      color: "purple",
    },
    {
      id: 3,
      date: "2024-10-15",
      startTime: "12:00",
      endTime: "13:00",
      patient: {
        name: "Ana Martínez",
        phone: "+56 9 5555 6666",
        email: "ana@email.com",
      },
      treatment: "Control Post-Operatorio",
      type: "Control",
      status: "Pendiente",
      notes: "Control después de cirugía de rodilla",
      kinesiologist: "Dr. Juan Pérez",
      sessionNumber: 3,
      totalSessions: 6,
      color: "green",
    },
    {
      id: 4,
      date: "2024-10-15",
      startTime: "15:00",
      endTime: "16:00",
      patient: {
        name: "Pedro Soto",
        phone: "+56 9 7777 8888",
        email: "pedro@email.com",
      },
      treatment: "Terapia Cervical",
      type: "Sesión Regular",
      status: "Confirmada",
      notes: "Dolor cervical crónico",
      kinesiologist: "Dr. Juan Pérez",
      sessionNumber: 8,
      totalSessions: 10,
      color: "blue",
    },
    {
      id: 5,
      date: "2024-10-15",
      startTime: "16:30",
      endTime: "17:30",
      patient: {
        name: "Laura Díaz",
        phone: "+56 9 9999 0000",
        email: "laura@email.com",
      },
      treatment: "Rehabilitación Tobillo",
      type: "Sesión Regular",
      status: "Cancelada",
      notes: "Paciente canceló por motivos personales",
      kinesiologist: "Dr. Juan Pérez",
      sessionNumber: 4,
      totalSessions: 8,
      color: "blue",
    },
    {
      id: 6,
      date: "2024-10-16",
      startTime: "09:00",
      endTime: "10:00",
      patient: {
        name: "Roberto Vega",
        phone: "+56 9 1111 2222",
        email: "roberto@email.com",
      },
      treatment: "Evaluación Deportiva",
      type: "Evaluación",
      status: "Confirmada",
      notes: "Deportista profesional",
      kinesiologist: "Dr. Juan Pérez",
      sessionNumber: 1,
      totalSessions: 1,
      color: "purple",
    },
    {
      id: 7,
      date: "2024-10-17",
      startTime: "11:00",
      endTime: "12:00",
      patient: {
        name: "Sofía López",
        phone: "+56 9 3333 4444",
        email: "sofia@email.com",
      },
      treatment: "Terapia Manual Espalda",
      type: "Sesión Regular",
      status: "Pendiente",
      notes: "",
      kinesiologist: "Dr. Juan Pérez",
      sessionNumber: 2,
      totalSessions: 12,
      color: "blue",
    },
  ];

  const [formData, setFormData] = useState({
    date: "",
    startTime: "",
    endTime: "",
    patientName: "",
    patientPhone: "",
    patientEmail: "",
    treatment: "",
    type: "Sesión Regular",
    notes: "",
    sessionNumber: 1,
    totalSessions: 1,
  });

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

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
    startOfWeek.setDate(selectedDate.getDate() - selectedDate.getDay());

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

  const isToday = (date) => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  const monthNames = [
    "Enero",
    "Febrero",
    "Marzo",
    "Abril",
    "Mayo",
    "Junio",
    "Julio",
    "Agosto",
    "Septiembre",
    "Octubre",
    "Noviembre",
    "Diciembre",
  ];
  const dayNames = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

  const hours = Array.from({ length: 12 }, (_, i) => i + 8); // 8:00 - 19:00

  const filteredAppointments = appointments.filter((apt) => {
    const matchesSearch =
      apt.patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      apt.treatment.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      filterStatus === "todos" || apt.status === filterStatus;
    const matchesType = filterType === "todos" || apt.type === filterType;
    return matchesSearch && matchesStatus && matchesType;
  });

  const todayAppointments = appointments.filter(
    (apt) => apt.date === selectedDate.toISOString().split("T")[0]
  );

  const appointmentStats = {
    total: appointments.length,
    confirmadas: appointments.filter((a) => a.status === "Confirmada").length,
    pendientes: appointments.filter((a) => a.status === "Pendiente").length,
    canceladas: appointments.filter((a) => a.status === "Cancelada").length,
  };

  return (
    <AuthenticatedLayout>
      <Head title="Pacientes" />
      <div className="min-h-screen p-4 bg-gray-50">
        {/* Header */}
        <div className="p-6 mb-6 bg-white border border-gray-200 shadow-sm rounded-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-12 h-12 shadow-lg bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl">
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
                onClick={() => alert("Nuevo paciente")}
                className="flex items-center gap-2 px-6 py-2 font-semibold text-white transition-colors bg-blue-600 rounded-lg shadow-lg hover:bg-blue-700 shadow-blue-500/30"
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
                <p className="mb-1 text-sm text-gray-600">Total Citas</p>
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
                <p className="mb-1 text-sm text-gray-600">Confirmadas</p>
                <p className="text-3xl font-bold text-green-600">
                  {appointmentStats.confirmadas}
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
                <p className="mb-1 text-sm text-gray-600">Pendientes</p>
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
                <p className="mb-1 text-sm text-gray-600">Canceladas</p>
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
                    ? "bg-white text-blue-600 shadow-sm"
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
                    ? "bg-white text-blue-600 shadow-sm"
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
                    ? "bg-white text-blue-600 shadow-sm"
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
                <h2 className="text-xl font-bold text-gray-900">
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
                className="px-4 py-2 ml-2 font-medium text-blue-600 transition-colors rounded-lg bg-blue-50 hover:bg-blue-100"
              >
                Hoy
              </button>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-2">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 text-sm border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
              >
                <option value="todos">Todos los estados</option>
                <option value="Confirmada">Confirmada</option>
                <option value="Pendiente">Pendiente</option>
                <option value="Cancelada">Cancelada</option>
              </select>

              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-3 py-2 text-sm border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
              >
                <option value="todos">Todos los tipos</option>
                <option value="Sesión Regular">Sesión Regular</option>
                <option value="Evaluación">Evaluación</option>
                <option value="Control">Control</option>
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
              <div className="overflow-hidden bg-white border border-gray-200 shadow-sm rounded-xl">
                {/* Day Headers */}
                <div className="grid grid-cols-7 border-b border-gray-200 bg-gray-50">
                  {dayNames.map((day) => (
                    <div key={day} className="p-3 text-center">
                      <span className="text-xs font-bold text-gray-600 uppercase">
                        {day}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Calendar Grid */}
                <div className="grid grid-cols-7">
                  {getDaysInMonth(currentDate).map((day, index) => {
                    const dayAppointments = getAppointmentsForDate(day.date);
                    const isSelected =
                      selectedDate.toDateString() === day.date.toDateString();
                    const isTodayDate = isToday(day.date);

                    return (
                      <div
                        key={index}
                        onClick={() => {
                          setSelectedDate(day.date);
                          setViewMode("day");
                        }}
                        className={`min-h-[120px] p-2 border-b border-r border-gray-200 cursor-pointer transition-colors ${
                          !day.isCurrentMonth
                            ? "bg-gray-50"
                            : "hover:bg-blue-50"
                        } ${
                          isSelected
                            ? "bg-blue-50 ring-2 ring-blue-500 ring-inset"
                            : ""
                        }`}
                      >
                        <div className="flex items-start justify-between mb-1">
                          <span
                            className={`text-sm font-semibold ${
                              !day.isCurrentMonth
                                ? "text-gray-400"
                                : isTodayDate
                                ? "bg-blue-600 text-white w-7 h-7 rounded-full flex items-center justify-center"
                                : "text-gray-900"
                            }`}
                          >
                            {day.date.getDate()}
                          </span>
                        </div>

                        <div className="space-y-1">
                          {dayAppointments.slice(0, 2).map((apt) => (
                            <div
                              key={apt.id}
                              className={`text-xs p-1.5 rounded truncate ${
                                apt.color === "blue"
                                  ? "bg-blue-100 text-blue-700"
                                  : apt.color === "purple"
                                  ? "bg-purple-100 text-purple-700"
                                  : "bg-green-100 text-green-700"
                              }`}
                            >
                              <span className="font-medium">
                                {apt.startTime}
                              </span>{" "}
                              {apt.patient.name}
                            </div>
                          ))}
                          {dayAppointments.length > 2 && (
                            <div className="text-xs font-medium text-gray-600">
                              +{dayAppointments.length - 2} más
                            </div>
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
              <div className="overflow-hidden bg-white border border-gray-200 shadow-sm rounded-xl">
                {/* Day Headers */}
                <div className="grid grid-cols-8 border-b border-gray-200 bg-gray-50">
                  <div className="p-3"></div>
                  {getWeekDays().map((day, index) => (
                    <div
                      key={index}
                      className="p-3 text-center border-l border-gray-200"
                    >
                      <div className="text-xs font-bold text-gray-600 uppercase">
                        {dayNames[day.getDay()]}
                      </div>
                      <div
                        className={`text-lg font-bold mt-1 ${
                          isToday(day) ? "text-blue-600" : "text-gray-900"
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
                      <div className="p-3 text-sm font-medium text-right text-gray-600 border-b border-gray-200">
                        {hour}:00
                      </div>
                      {getWeekDays().map((day, dayIndex) => {
                        const dateStr = day.toISOString().split("T")[0];
                        const dayAppts = appointments.filter(
                          (apt) =>
                            apt.date === dateStr &&
                            parseInt(apt.startTime.split(":")[0]) === hour
                        );

                        return (
                          <div
                            key={dayIndex}
                            className="min-h-[60px] p-1 border-b border-l border-gray-200 hover:bg-blue-50 cursor-pointer transition-colors"
                          >
                            {dayAppts.map((apt) => (
                              <div
                                key={apt.id}
                                onClick={() => setSelectedAppointment(apt)}
                                className={`p-2 rounded text-xs mb-1 ${
                                  apt.color === "blue"
                                    ? "bg-blue-100 text-blue-700 border-l-2 border-blue-500"
                                    : apt.color === "purple"
                                    ? "bg-purple-100 text-purple-700 border-l-2 border-purple-500"
                                    : "bg-green-100 text-green-700 border-l-2 border-green-500"
                                }`}
                              >
                                <div className="font-semibold truncate">
                                  {apt.patient.name}
                                </div>
                                <div className="text-xs truncate opacity-75">
                                  {apt.treatment}
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
              <div className="bg-white border border-gray-200 shadow-sm rounded-xl">
                <div className="p-6 border-b border-gray-200">
                  <h3 className="text-lg font-bold text-gray-900">
                    {selectedDate.toLocaleDateString("es-CL", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </h3>
                  <p className="mt-1 text-sm text-gray-600">
                    {todayAppointments.length} citas programadas
                  </p>
                </div>

                <div className="p-6">
                  {todayAppointments.length === 0 ? (
                    <div className="py-12 text-center">
                      <Calendar className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                      <p className="text-gray-500">
                        No hay citas programadas para este día
                      </p>
                      <button
                        onClick={() => setShowNewAppointment(true)}
                        className="mt-4 font-medium text-blue-600 hover:text-blue-700"
                      >
                        Agregar nueva cita
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {todayAppointments
                        .sort((a, b) => a.startTime.localeCompare(b.startTime))
                        .map((apt) => (
                          <div
                            key={apt.id}
                            onClick={() => setSelectedAppointment(apt)}
                            className="flex items-start gap-4 p-4 transition-all border-2 border-gray-200 cursor-pointer rounded-xl hover:border-blue-300 hover:bg-blue-50/50"
                          >
                            <div className="flex-shrink-0 text-center min-w-[80px]">
                              <div className="text-sm font-bold text-gray-900">
                                {apt.startTime}
                              </div>
                              <div className="text-xs text-gray-500">
                                {apt.endTime}
                              </div>
                            </div>

                            <div
                              className={`flex-shrink-0 w-1 h-full rounded-full ${
                                apt.color === "blue"
                                  ? "bg-blue-500"
                                  : apt.color === "purple"
                                  ? "bg-purple-500"
                                  : "bg-green-500"
                              }`}
                            ></div>

                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-2">
                                <h4 className="font-bold text-gray-900">
                                  {apt.patient.name}
                                </h4>
                                <span
                                  className={`text-xs px-2 py-1 rounded-full font-semibold ${
                                    apt.status === "Confirmada"
                                      ? "bg-green-100 text-green-700"
                                      : apt.status === "Pendiente"
                                      ? "bg-orange-100 text-orange-700"
                                      : "bg-red-100 text-red-700"
                                  }`}
                                >
                                  {apt.status}
                                </span>
                                <span
                                  className={`text-xs px-2 py-1 rounded-full font-semibold ${
                                    apt.type === "Evaluación"
                                      ? "bg-purple-100 text-purple-700"
                                      : apt.type === "Control"
                                      ? "bg-blue-100 text-blue-700"
                                      : "bg-gray-100 text-gray-700"
                                  }`}
                                >
                                  {apt.type}
                                </span>
                              </div>

                              <p className="mb-2 text-sm font-medium text-gray-700">
                                {apt.treatment}
                              </p>

                              <div className="flex items-center gap-4 text-xs text-gray-600">
                                <span className="flex items-center gap-1">
                                  <User className="w-3 h-3" />
                                  {apt.kinesiologist}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Repeat className="w-3 h-3" />
                                  Sesión {apt.sessionNumber}/{apt.totalSessions}
                                </span>
                              </div>

                              {apt.notes && (
                                <p className="p-2 mt-2 text-xs text-gray-600 rounded bg-gray-50">
                                  {apt.notes}
                                </p>
                              )}
                            </div>

                            <button className="flex-shrink-0 p-2 transition-colors rounded-lg hover:bg-gray-100">
                              <MoreVertical className="w-4 h-4 text-gray-400" />
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
            <div className="p-6 text-white bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl">
              <Calendar className="w-8 h-8 mb-3" />
              <h3 className="mb-2 text-lg font-bold">Citas de Hoy</h3>
              <p className="mb-1 text-3xl font-bold">
                {todayAppointments.length}
              </p>
              <p className="text-sm text-blue-100">
                {
                  todayAppointments.filter((a) => a.status === "Confirmada")
                    .length
                }{" "}
                confirmadas
              </p>
            </div>

            {/* Mini Calendar */}
            <div className="p-4 bg-white border border-gray-200 shadow-sm rounded-xl">
              <h3 className="mb-4 font-bold text-gray-900">
                Calendario Rápido
              </h3>
              <div className="space-y-2">
                {getDaysInMonth(currentDate)
                  .filter((d) => d.isCurrentMonth)
                  .slice(0, 14)
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
                        className={`w-full flex items-center justify-between p-2 rounded-lg transition-colors ${
                          isTodayDate
                            ? "bg-blue-100 border-2 border-blue-500"
                            : "hover:bg-gray-50"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`text-center min-w-[40px] ${
                              isTodayDate
                                ? "text-blue-600 font-bold"
                                : "text-gray-900"
                            }`}
                          >
                            <div className="text-xs text-gray-500">
                              {dayNames[day.date.getDay()]}
                            </div>
                            <div className="text-lg font-bold">
                              {day.date.getDate()}
                            </div>
                          </div>
                          <div className="text-left">
                            <p className="text-sm font-medium text-gray-900">
                              {dayAppts.length}{" "}
                              {dayAppts.length === 1 ? "cita" : "citas"}
                            </p>
                          </div>
                        </div>
                        {dayAppts.length > 0 && (
                          <div className="flex gap-1">
                            {dayAppts.slice(0, 3).map((apt, i) => (
                              <div
                                key={i}
                                className={`w-2 h-2 rounded-full ${
                                  apt.color === "blue"
                                    ? "bg-blue-500"
                                    : apt.color === "purple"
                                    ? "bg-purple-500"
                                    : "bg-green-500"
                                }`}
                              ></div>
                            ))}
                          </div>
                        )}
                      </button>
                    );
                  })}
              </div>
            </div>

            {/* Legend */}
            <div className="p-4 bg-white border border-gray-200 shadow-sm rounded-xl">
              <h3 className="mb-4 font-bold text-gray-900">Leyenda</h3>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span className="text-sm text-gray-700">Sesión Regular</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                  <span className="text-sm text-gray-700">Evaluación</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-gray-700">Control</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Nueva Cita */}
        {showNewAppointment && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 text-white bg-gradient-to-r from-blue-600 to-blue-700 rounded-t-2xl">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-2xl font-bold">Nueva Cita</h2>
                    <p className="mt-1 text-blue-100">Agendar nueva sesión</p>
                  </div>
                  <button
                    onClick={() => setShowNewAppointment(false)}
                    className="p-2 text-white transition-colors rounded-lg hover:bg-white/10"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>

              <div className="p-6">
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block mb-2 text-sm font-semibold text-gray-700">
                        Fecha
                      </label>
                      <input
                        type="date"
                        value={formData.date}
                        onChange={(e) =>
                          setFormData({ ...formData, date: e.target.value })
                        }
                        className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block mb-2 text-sm font-semibold text-gray-700">
                          Hora Inicio
                        </label>
                        <input
                          type="time"
                          value={formData.startTime}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              startTime: e.target.value,
                            })
                          }
                          className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block mb-2 text-sm font-semibold text-gray-700">
                          Hora Fin
                        </label>
                        <input
                          type="time"
                          value={formData.endTime}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              endTime: e.target.value,
                            })
                          }
                          className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block mb-2 text-sm font-semibold text-gray-700">
                      Paciente
                    </label>
                    <input
                      type="text"
                      value={formData.patientName}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          patientName: e.target.value,
                        })
                      }
                      placeholder="Nombre del paciente"
                      className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block mb-2 text-sm font-semibold text-gray-700">
                        Teléfono
                      </label>
                      <input
                        type="tel"
                        value={formData.patientPhone}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            patientPhone: e.target.value,
                          })
                        }
                        placeholder="+56 9 XXXX XXXX"
                        className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block mb-2 text-sm font-semibold text-gray-700">
                        Email
                      </label>
                      <input
                        type="email"
                        value={formData.patientEmail}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            patientEmail: e.target.value,
                          })
                        }
                        placeholder="correo@ejemplo.com"
                        className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block mb-2 text-sm font-semibold text-gray-700">
                      Tratamiento
                    </label>
                    <input
                      type="text"
                      value={formData.treatment}
                      onChange={(e) =>
                        setFormData({ ...formData, treatment: e.target.value })
                      }
                      placeholder="Ej: Rehabilitación de Hombro"
                      className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block mb-2 text-sm font-semibold text-gray-700">
                      Tipo de Cita
                    </label>
                    <select
                      value={formData.type}
                      onChange={(e) =>
                        setFormData({ ...formData, type: e.target.value })
                      }
                      className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
                    >
                      <option>Sesión Regular</option>
                      <option>Evaluación</option>
                      <option>Control</option>
                      <option>Seguimiento</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block mb-2 text-sm font-semibold text-gray-700">
                        Número de Sesión
                      </label>
                      <input
                        type="number"
                        value={formData.sessionNumber}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            sessionNumber: parseInt(e.target.value),
                          })
                        }
                        min="1"
                        className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block mb-2 text-sm font-semibold text-gray-700">
                        Total Sesiones
                      </label>
                      <input
                        type="number"
                        value={formData.totalSessions}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            totalSessions: parseInt(e.target.value),
                          })
                        }
                        min="1"
                        className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block mb-2 text-sm font-semibold text-gray-700">
                      Notas
                    </label>
                    <textarea
                      value={formData.notes}
                      onChange={(e) =>
                        setFormData({ ...formData, notes: e.target.value })
                      }
                      rows="3"
                      placeholder="Observaciones o indicaciones especiales"
                      className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
                    ></textarea>
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    onClick={() => {
                      alert("Cita creada exitosamente");
                      setShowNewAppointment(false);
                    }}
                    className="flex-1 py-3 font-semibold text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700"
                  >
                    Crear Cita
                  </button>
                  <button
                    onClick={() => setShowNewAppointment(false)}
                    className="px-6 py-3 font-semibold text-gray-700 transition-colors bg-gray-200 rounded-lg hover:bg-gray-300"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal Detalle Cita */}
        {selectedAppointment && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 text-white bg-gradient-to-r from-blue-600 to-blue-700 rounded-t-2xl">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-2xl font-bold">
                      {selectedAppointment.patient.name}
                    </h2>
                    <p className="mt-1 text-blue-100">
                      {selectedAppointment.treatment}
                    </p>
                  </div>
                  <button
                    onClick={() => setSelectedAppointment(null)}
                    className="p-2 text-white transition-colors rounded-lg hover:bg-white/10"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-2 gap-6 mb-6">
                  <div>
                    <p className="mb-1 text-sm text-gray-600">Fecha y Hora</p>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <p className="font-semibold text-gray-900">
                        {new Date(selectedAppointment.date).toLocaleDateString(
                          "es-CL"
                        )}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <p className="font-semibold text-gray-900">
                        {selectedAppointment.startTime} -{" "}
                        {selectedAppointment.endTime}
                      </p>
                    </div>
                  </div>

                  <div>
                    <p className="mb-1 text-sm text-gray-600">Estado</p>
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold ${
                        selectedAppointment.status === "Confirmada"
                          ? "bg-green-100 text-green-700"
                          : selectedAppointment.status === "Pendiente"
                          ? "bg-orange-100 text-orange-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {selectedAppointment.status === "Confirmada" && (
                        <CheckCircle className="w-4 h-4" />
                      )}
                      {selectedAppointment.status === "Pendiente" && (
                        <Clock className="w-4 h-4" />
                      )}
                      {selectedAppointment.status === "Cancelada" && (
                        <XCircle className="w-4 h-4" />
                      )}
                      {selectedAppointment.status}
                    </span>
                  </div>

                  <div>
                    <p className="mb-1 text-sm text-gray-600">Tipo de Cita</p>
                    <span
                      className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-semibold ${
                        selectedAppointment.type === "Evaluación"
                          ? "bg-purple-100 text-purple-700"
                          : selectedAppointment.type === "Control"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {selectedAppointment.type}
                    </span>
                  </div>

                  <div>
                    <p className="mb-1 text-sm text-gray-600">Progreso</p>
                    <p className="font-semibold text-gray-900">
                      Sesión {selectedAppointment.sessionNumber} de{" "}
                      {selectedAppointment.totalSessions}
                    </p>
                    <div className="h-2 mt-2 overflow-hidden bg-gray-200 rounded-full">
                      <div
                        className="h-full bg-blue-600"
                        style={{
                          width: `${
                            (selectedAppointment.sessionNumber /
                              selectedAppointment.totalSessions) *
                            100
                          }%`,
                        }}
                      ></div>
                    </div>
                  </div>
                </div>

                <div className="pb-6 mb-6 border-b border-gray-200">
                  <h3 className="mb-3 font-bold text-gray-900">
                    Información del Paciente
                  </h3>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-700">
                        {selectedAppointment.patient.phone}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-700">
                        {selectedAppointment.patient.email}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <User className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-700">
                        Atendido por: {selectedAppointment.kinesiologist}
                      </span>
                    </div>
                  </div>
                </div>

                {selectedAppointment.notes && (
                  <div className="mb-6">
                    <h3 className="mb-2 font-bold text-gray-900">Notas</h3>
                    <div className="p-3 rounded-lg bg-gray-50">
                      <p className="text-sm text-gray-700">
                        {selectedAppointment.notes}
                      </p>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => alert("Editar cita")}
                    className="flex items-center justify-center gap-2 py-3 font-semibold text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700"
                  >
                    <Edit className="w-4 h-4" />
                    Editar
                  </button>
                  <button
                    onClick={() => {
                      if (confirm("¿Cancelar esta cita?")) {
                        setSelectedAppointment(null);
                      }
                    }}
                    className="flex items-center justify-center gap-2 py-3 font-semibold text-white transition-colors bg-red-600 rounded-lg hover:bg-red-700"
                  >
                    <XCircle className="w-4 h-4" />
                    Cancelar Cita
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-2 mt-3">
                  <button className="flex items-center justify-center gap-2 py-2 text-sm font-medium text-gray-700 transition-colors bg-gray-100 rounded-lg hover:bg-gray-200">
                    <MessageSquare className="w-4 h-4" />
                    SMS
                  </button>
                  <button className="flex items-center justify-center gap-2 py-2 text-sm font-medium text-gray-700 transition-colors bg-gray-100 rounded-lg hover:bg-gray-200">
                    <Mail className="w-4 h-4" />
                    Email
                  </button>
                  <button className="flex items-center justify-center gap-2 py-2 text-sm font-medium text-gray-700 transition-colors bg-gray-100 rounded-lg hover:bg-gray-200">
                    <Video className="w-4 h-4" />
                    Videollamada
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AuthenticatedLayout>
  );
}
