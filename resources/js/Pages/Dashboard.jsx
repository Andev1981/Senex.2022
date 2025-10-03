import React, { useState } from "react";
import {
  Users,
  Calendar,
  DollarSign,
  TrendingUp,
  Activity,
  Clock,
  CheckCircle,
  AlertCircle,
  ArrowUp,
  ArrowDown,
  ChevronRight,
  User,
  Phone,
  MapPin,
  Clipboard,
  FileText,
  Package,
  Target,
  BarChart3,
  PieChart,
  Timer,
  Award,
  Zap,
  Eye,
  MoreVertical,
  Home,
} from "lucide-react";
import AuthenticatedLayout from "../Layouts/AuthenticatedLayout";
import { Head, usePage } from "@inertiajs/react";

export default function Dashboard() {
  const user = usePage().props.auth.user;
  const [selectedPeriod, setSelectedPeriod] = useState("hoy");

  // Datos de ejemplo
  const stats = {
    pacientesTotal: 156,
    pacientesHoy: 12,
    pacientesChange: 8.2,
    sesionesTotal: 48,
    sesionesHoy: 8,
    sesionesChange: 12.5,
    ingresosMes: 3420000,
    ingresosHoy: 240000,
    ingresosChange: 15.3,
    tratamientosActivos: 34,
    tratamientosChange: 5.1,
  };

  const todayAppointments = [
    {
      id: 1,
      time: "09:00",
      patient: "María González",
      treatment: "Rehabilitación Hombro",
      status: "Completada",
      type: "control",
    },
    {
      id: 2,
      time: "10:00",
      patient: "Carlos Ramírez",
      treatment: "Terapia Lumbar",
      status: "Completada",
      type: "sesion",
    },
    {
      id: 3,
      time: "11:30",
      patient: "Ana Martínez",
      treatment: "Evaluación Inicial",
      status: "En Curso",
      type: "evaluacion",
    },
    {
      id: 4,
      time: "14:00",
      patient: "Pedro Soto",
      treatment: "Control Rodilla",
      status: "Pendiente",
      type: "control",
    },
    {
      id: 5,
      time: "15:30",
      patient: "Laura Díaz",
      treatment: "Sesión Cervical",
      status: "Pendiente",
      type: "sesion",
    },
  ];

  const recentPatients = [
    {
      id: 1,
      name: "Juan Pérez",
      lastVisit: "2024-10-10",
      nextAppointment: "2024-10-15",
      status: "Activo",
      progress: 75,
    },
    {
      id: 2,
      name: "Sofía López",
      lastVisit: "2024-10-09",
      nextAppointment: "2024-10-16",
      status: "Activo",
      progress: 45,
    },
    {
      id: 3,
      name: "Diego Torres",
      lastVisit: "2024-10-08",
      nextAppointment: null,
      status: "Finalizado",
      progress: 100,
    },
    {
      id: 4,
      name: "Carmen Silva",
      lastVisit: "2024-10-07",
      nextAppointment: "2024-10-14",
      status: "Activo",
      progress: 60,
    },
  ];

  const pendingPayments = [
    {
      id: 1,
      patient: "Roberto Gómez",
      amount: 45000,
      dueDate: "2024-10-15",
      overdue: false,
    },
    {
      id: 2,
      patient: "Elena Vargas",
      amount: 32000,
      dueDate: "2024-10-10",
      overdue: true,
    },
    {
      id: 3,
      patient: "Francisco Muñoz",
      amount: 28000,
      dueDate: "2024-10-18",
      overdue: false,
    },
  ];

  const monthlyStats = [
    { month: "Jun", sessions: 142, revenue: 2840 },
    { month: "Jul", sessions: 158, revenue: 3160 },
    { month: "Ago", sessions: 165, revenue: 3300 },
    { month: "Sep", sessions: 171, revenue: 3420 },
    { month: "Oct", sessions: 48, revenue: 960 },
  ];

  const treatmentTypes = [
    { name: "Rehabilitación", value: 45, color: "from-blue-500 to-blue-600" },
    { name: "Terapia Manual", value: 30, color: "from-green-500 to-green-600" },
    { name: "Evaluaciones", value: 15, color: "from-purple-500 to-purple-600" },
    { name: "Otros", value: 10, color: "from-orange-500 to-orange-600" },
  ];

  return (
    <AuthenticatedLayout>
      <Head title={"Dashboard"} />
      <div className="min-h-screen p-4 bg-gray-50">
        {/* Header */}
        <div className="p-6 mb-6 bg-white border border-gray-200 shadow-sm rounded-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-12 h-12 shadow-lg bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl">
                <Home className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
                <p className="text-sm text-gray-600">
                  Bienvenid@, {user?.name + " " + user?.last_name}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="px-4 py-2 font-medium border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
              >
                <option value="hoy">Hoy</option>
                <option value="semana">Esta Semana</option>
                <option value="mes">Este Mes</option>
                <option value="año">Este Año</option>
              </select>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 gap-6 mb-6 md:grid-cols-2 lg:grid-cols-4">
          {/* Pacientes */}
          <div className="p-6 bg-white border border-gray-200 shadow-sm rounded-xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl">
                <Users className="w-6 h-6 text-white" />
              </div>
              <span className="flex items-center gap-1 text-sm font-semibold text-green-600">
                <ArrowUp className="w-4 h-4" />
                {stats.pacientesChange}%
              </span>
            </div>
            <h3 className="mb-1 text-sm font-medium text-gray-600">
              Pacientes
            </h3>
            <div className="flex items-baseline gap-2">
              <p className="text-3xl font-bold text-gray-900">
                {stats.pacientesHoy}
              </p>
              <span className="text-sm text-gray-500">
                / {stats.pacientesTotal} total
              </span>
            </div>
            <p className="mt-2 text-xs text-gray-500">
              Pacientes atendidos hoy
            </p>
          </div>

          {/* Sesiones */}
          <div className="p-6 bg-white border border-gray-200 shadow-sm rounded-xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl">
                <Clipboard className="w-6 h-6 text-white" />
              </div>
              <span className="flex items-center gap-1 text-sm font-semibold text-green-600">
                <ArrowUp className="w-4 h-4" />
                {stats.sesionesChange}%
              </span>
            </div>
            <h3 className="mb-1 text-sm font-medium text-gray-600">Sesiones</h3>
            <div className="flex items-baseline gap-2">
              <p className="text-3xl font-bold text-gray-900">
                {stats.sesionesHoy}
              </p>
              <span className="text-sm text-gray-500">
                / {stats.sesionesTotal} mes
              </span>
            </div>
            <p className="mt-2 text-xs text-gray-500">
              Sesiones programadas hoy
            </p>
          </div>

          {/* Ingresos */}
          <div className="p-6 bg-white border border-gray-200 shadow-sm rounded-xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl">
                <DollarSign className="w-6 h-6 text-white" />
              </div>
              <span className="flex items-center gap-1 text-sm font-semibold text-green-600">
                <ArrowUp className="w-4 h-4" />
                {stats.ingresosChange}%
              </span>
            </div>
            <h3 className="mb-1 text-sm font-medium text-gray-600">Ingresos</h3>
            <div className="flex items-baseline gap-2">
              <p className="text-3xl font-bold text-gray-900">
                ${(stats.ingresosHoy / 1000).toFixed(0)}k
              </p>
              <span className="text-sm text-gray-500">
                / ${(stats.ingresosMes / 1000).toFixed(0)}k mes
              </span>
            </div>
            <p className="mt-2 text-xs text-gray-500">Ingresos de hoy</p>
          </div>

          {/* Tratamientos Activos */}
          <div className="p-6 bg-white border border-gray-200 shadow-sm rounded-xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl">
                <Activity className="w-6 h-6 text-white" />
              </div>
              <span className="flex items-center gap-1 text-sm font-semibold text-green-600">
                <ArrowUp className="w-4 h-4" />
                {stats.tratamientosChange}%
              </span>
            </div>
            <h3 className="mb-1 text-sm font-medium text-gray-600">
              Tratamientos
            </h3>
            <p className="text-3xl font-bold text-gray-900">
              {stats.tratamientosActivos}
            </p>
            <p className="mt-2 text-xs text-gray-500">Tratamientos activos</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 mb-6 lg:grid-cols-3">
          {/* Agenda de Hoy */}
          <div className="p-6 bg-white border border-gray-200 shadow-sm lg:col-span-2 rounded-xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="flex items-center gap-2 text-xl font-bold text-gray-900">
                <Calendar className="w-5 h-5 text-blue-600" />
                Agenda de Hoy
              </h2>
              <button className="flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700">
                Ver todas
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              {todayAppointments.map((appointment) => (
                <div
                  key={appointment.id}
                  className="flex items-center gap-4 p-4 transition-all border-2 border-gray-100 cursor-pointer rounded-xl hover:border-blue-200 hover:bg-blue-50/50"
                >
                  <div className="flex-shrink-0">
                    <div className="w-16 text-center">
                      <p className="text-sm font-bold text-gray-900">
                        {appointment.time}
                      </p>
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-semibold text-gray-900 truncate">
                        {appointment.patient}
                      </p>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          appointment.type === "evaluacion"
                            ? "bg-purple-100 text-purple-700"
                            : appointment.type === "control"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-green-100 text-green-700"
                        }`}
                      >
                        {appointment.type === "evaluacion"
                          ? "Evaluación"
                          : appointment.type === "control"
                          ? "Control"
                          : "Sesión"}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 truncate">
                      {appointment.treatment}
                    </p>
                  </div>

                  <div className="flex-shrink-0">
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${
                        appointment.status === "Completada"
                          ? "bg-green-100 text-green-700"
                          : appointment.status === "En Curso"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-orange-100 text-orange-700"
                      }`}
                    >
                      {appointment.status === "Completada" && (
                        <CheckCircle className="w-3 h-3" />
                      )}
                      {appointment.status === "En Curso" && (
                        <Clock className="w-3 h-3" />
                      )}
                      {appointment.status === "Pendiente" && (
                        <Timer className="w-3 h-3" />
                      )}
                      {appointment.status}
                    </span>
                  </div>

                  <button className="flex-shrink-0 p-2 transition-colors rounded-lg hover:bg-gray-100">
                    <MoreVertical className="w-4 h-4 text-gray-400" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Pagos Pendientes */}
          <div className="p-6 bg-white border border-gray-200 shadow-sm rounded-xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="flex items-center gap-2 text-xl font-bold text-gray-900">
                <AlertCircle className="w-5 h-5 text-orange-600" />
                Pagos Pendientes
              </h2>
            </div>

            <div className="space-y-3">
              {pendingPayments.map((payment) => (
                <div
                  key={payment.id}
                  className={`p-4 rounded-xl border-2 ${
                    payment.overdue
                      ? "border-red-200 bg-red-50"
                      : "border-gray-100 hover:border-orange-200 hover:bg-orange-50/50"
                  } transition-all cursor-pointer`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <p className="text-sm font-semibold text-gray-900">
                      {payment.patient}
                    </p>
                    {payment.overdue && (
                      <span className="text-xs bg-red-600 text-white px-2 py-0.5 rounded-full font-semibold">
                        Vencido
                      </span>
                    )}
                  </div>
                  <p className="mb-2 text-2xl font-bold text-gray-900">
                    ${payment.amount.toLocaleString("es-CL")}
                  </p>
                  <p className="text-xs text-gray-600">
                    Vence:{" "}
                    {new Date(payment.dueDate).toLocaleDateString("es-CL")}
                  </p>
                </div>
              ))}
            </div>

            <button className="w-full py-2 mt-4 text-sm font-medium text-gray-700 transition-colors border-2 border-gray-200 rounded-lg hover:bg-gray-50">
              Ver todos los pagos
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 mb-6 lg:grid-cols-3">
          {/* Gráfico de Sesiones */}
          <div className="p-6 bg-white border border-gray-200 shadow-sm lg:col-span-2 rounded-xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="flex items-center gap-2 text-xl font-bold text-gray-900">
                <BarChart3 className="w-5 h-5 text-blue-600" />
                Sesiones e Ingresos Mensuales
              </h2>
              <button className="text-sm font-medium text-gray-600 hover:text-gray-900">
                Ver reporte
              </button>
            </div>

            <div className="space-y-4">
              {monthlyStats.map((stat, index) => {
                const maxSessions = Math.max(
                  ...monthlyStats.map((s) => s.sessions)
                );
                const sessionsPercentage = (stat.sessions / maxSessions) * 100;

                return (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium text-gray-700">
                        {stat.month}
                      </span>
                      <div className="flex items-center gap-4">
                        <span className="text-gray-600">
                          {stat.sessions} sesiones
                        </span>
                        <span className="font-semibold text-gray-900">
                          ${stat.revenue}k
                        </span>
                      </div>
                    </div>
                    <div className="relative h-8 overflow-hidden bg-gray-100 rounded-lg">
                      <div
                        className="absolute inset-y-0 left-0 transition-all rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500"
                        style={{ width: `${sessionsPercentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Tipos de Tratamiento */}
          <div className="p-6 bg-white border border-gray-200 shadow-sm rounded-xl">
            <h2 className="flex items-center gap-2 mb-6 text-xl font-bold text-gray-900">
              <PieChart className="w-5 h-5 text-purple-600" />
              Tipos de Tratamiento
            </h2>

            <div className="space-y-4">
              {treatmentTypes.map((type, index) => (
                <div key={index}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">
                      {type.name}
                    </span>
                    <span className="text-sm font-bold text-gray-900">
                      {type.value}%
                    </span>
                  </div>
                  <div className="h-3 overflow-hidden bg-gray-100 rounded-full">
                    <div
                      className={`h-full bg-gradient-to-r ${type.color} transition-all`}
                      style={{ width: `${type.value}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-6 mt-6 border-t border-gray-200">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">
                  Total tratamientos activos
                </span>
                <span className="text-2xl font-bold text-gray-900">
                  {stats.tratamientosActivos}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Pacientes Recientes */}
        <div className="p-6 bg-white border border-gray-200 shadow-sm rounded-xl">
          <div className="flex items-center justify-between mb-6">
            <h2 className="flex items-center gap-2 text-xl font-bold text-gray-900">
              <Users className="w-5 h-5 text-blue-600" />
              Pacientes Recientes
            </h2>
            <button className="flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700">
              Ver todos
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className="px-4 py-3 text-xs font-bold text-left text-gray-600 uppercase">
                    Paciente
                  </th>
                  <th className="px-4 py-3 text-xs font-bold text-left text-gray-600 uppercase">
                    Última Visita
                  </th>
                  <th className="px-4 py-3 text-xs font-bold text-left text-gray-600 uppercase">
                    Próxima Cita
                  </th>
                  <th className="px-4 py-3 text-xs font-bold text-left text-gray-600 uppercase">
                    Estado
                  </th>
                  <th className="px-4 py-3 text-xs font-bold text-left text-gray-600 uppercase">
                    Progreso
                  </th>
                  <th className="px-4 py-3 text-xs font-bold text-center text-gray-600 uppercase">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {recentPatients.map((patient) => (
                  <tr
                    key={patient.id}
                    className="transition-colors hover:bg-gray-50"
                  >
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-10 h-10 font-semibold text-white rounded-lg bg-gradient-to-br from-blue-500 to-blue-600">
                          {patient.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </div>
                        <span className="font-semibold text-gray-900">
                          {patient.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-600">
                      {new Date(patient.lastVisit).toLocaleDateString("es-CL")}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-600">
                      {patient.nextAppointment
                        ? new Date(patient.nextAppointment).toLocaleDateString(
                            "es-CL"
                          )
                        : "-"}
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                          patient.status === "Activo"
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {patient.status}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex-1 h-2 overflow-hidden bg-gray-200 rounded-full">
                          <div
                            className="h-full bg-gradient-to-r from-blue-500 to-cyan-500"
                            style={{ width: `${patient.progress}%` }}
                          ></div>
                        </div>
                        <span className="w-12 text-sm font-semibold text-right text-gray-700">
                          {patient.progress}%
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button className="p-2 text-blue-600 transition-colors rounded-lg hover:bg-blue-50">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button className="p-2 text-gray-600 transition-colors rounded-lg hover:bg-gray-100">
                          <FileText className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 gap-4 mt-6 md:grid-cols-4">
          <button className="p-6 text-left text-white transition-all bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl hover:shadow-lg group">
            <Users className="w-8 h-8 mb-3 transition-transform group-hover:scale-110" />
            <h3 className="mb-1 text-lg font-bold">Nuevo Paciente</h3>
            <p className="text-sm text-blue-100">Registrar nuevo paciente</p>
          </button>

          <button className="p-6 text-left text-white transition-all bg-gradient-to-br from-green-500 to-green-600 rounded-xl hover:shadow-lg group">
            <Calendar className="w-8 h-8 mb-3 transition-transform group-hover:scale-110" />
            <h3 className="mb-1 text-lg font-bold">Agendar Cita</h3>
            <p className="text-sm text-green-100">Programar nueva sesión</p>
          </button>

          <button className="p-6 text-left text-white transition-all bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl hover:shadow-lg group">
            <Clipboard className="w-8 h-8 mb-3 transition-transform group-hover:scale-110" />
            <h3 className="mb-1 text-lg font-bold">Nueva Sesión</h3>
            <p className="text-sm text-purple-100">Registrar sesión de hoy</p>
          </button>

          <button className="p-6 text-left text-white transition-all bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl hover:shadow-lg group">
            <DollarSign className="w-8 h-8 mb-3 transition-transform group-hover:scale-110" />
            <h3 className="mb-1 text-lg font-bold">Registrar Pago</h3>
            <p className="text-sm text-orange-100">Ingresar nuevo pago</p>
          </button>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
