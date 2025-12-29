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
  PieChart as PieChartIcon,
  Timer,
  Award,
  Zap,
  Eye,
  MoreVertical,
  Home,
} from "lucide-react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, usePage, Link } from "@inertiajs/react";
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid
} from 'recharts';

export default function Dashboard({ dte_stats }) {
  const user = usePage().props.auth.user;
  const [selectedPeriod, setSelectedPeriod] = useState("hoy");

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#6366f1'];

  // Datos de ejemplo
  const stats = {
    pacientesTotal: 156,
    pacientesHoy: 12,
    pacientesChange: 8.2,
    sesionesTotal: 48,
    sesionesHoy: 8,
    sesionesChange: 12.5,
    ingresosMes: dte_stats?.total_facturado || 0,
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
      amount_clp: 45000,
      dueDate: "2024-10-15",
      overdue: false,
    },
    {
      id: 2,
      patient: "Elena Vargas",
      amount_clp: 32000,
      dueDate: "2024-10-10",
      overdue: true,
    },
    {
      id: 3,
      patient: "Francisco Muñoz",
      amount_clp: 28000,
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
      <div className="min-h-screen p-6 bg-gray-50/50">
        {/* Header */}
        <div className="p-8 mb-8 bg-white border border-gray-100 shadow-sm rounded-[2rem] relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-brand-primary/5 rounded-full -mr-32 -mt-32 blur-3xl"></div>
          <div className="flex items-center justify-between relative z-10">
            <div className="flex items-center gap-4">
              <div className="flex items-center justify-center w-14 h-14 shadow-xl shadow-brand-primary/20 bg-brand-primary rounded-2xl transform rotate-3">
                <Home className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-black text-gray-900 tracking-tight leading-none mb-1">Panel de Control</h1>
                <p className="text-[10px] font-black text-brand-gray uppercase tracking-[0.2em]">
                  Bienvenid@, {user?.name} • Senex Enterprise
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="px-6 py-3 font-bold text-xs uppercase tracking-widest text-gray-600 border-gray-100 rounded-2xl focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/5 bg-gray-50/50 transition-all cursor-pointer"
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
        <div className="grid grid-cols-1 gap-6 mb-8 md:grid-cols-2 lg:grid-cols-4">
          {/* Pacientes */}
          <div className="p-8 bg-white border border-gray-100 shadow-sm rounded-[2rem] hover:scale-[1.02] transition-all duration-300 group">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center justify-center w-12 h-12 bg-brand-secondary/10 text-brand-primary rounded-2xl group-hover:bg-brand-primary group-hover:text-white transition-all duration-500">
                <Users className="w-6 h-6" />
              </div>
              <span className="px-3 py-1 bg-green-50 text-green-600 rounded-xl text-[10px] font-black flex items-center gap-1">
                <ArrowUp className="w-3 h-3" />
                {stats.pacientesChange}%
              </span>
            </div>
            <p className="enterprise-label opacity-60">Pacientes Atendidos</p>
            <div className="flex items-baseline gap-2">
              <p className="text-4xl font-black text-gray-900 tracking-tighter leading-none">
                {stats.pacientesHoy}
              </p>
              <span className="text-[10px] font-black text-brand-gray uppercase tracking-widest">
                / {stats.pacientesTotal} total
              </span>
            </div>
          </div>

          {/* Sesiones */}
          <div className="p-8 bg-white border border-gray-100 shadow-sm rounded-[2rem] hover:scale-[1.02] transition-all duration-300 group">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center justify-center w-12 h-12 bg-brand-secondary/10 text-brand-primary rounded-2xl group-hover:bg-brand-primary group-hover:text-white transition-all duration-500">
                <Clipboard className="w-6 h-6" />
              </div>
              <span className="px-3 py-1 bg-green-50 text-green-600 rounded-xl text-[10px] font-black flex items-center gap-1">
                <ArrowUp className="w-3 h-3" />
                {stats.sesionesChange}%
              </span>
            </div>
            <p className="enterprise-label opacity-60">Sesiones del Mes</p>
            <div className="flex items-baseline gap-2">
              <p className="text-4xl font-black text-gray-900 tracking-tighter leading-none">
                {stats.sesionesHoy}
              </p>
              <span className="text-[10px] font-black text-brand-gray uppercase tracking-widest">
                / {stats.sesionesTotal} plan.
              </span>
            </div>
          </div>

          {/* Ingresos */}
          <div className="p-8 bg-white border border-gray-100 shadow-sm rounded-[2rem] hover:scale-[1.02] transition-all duration-300 group border-b-4 border-b-brand-primary">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center justify-center w-12 h-12 bg-brand-primary text-white rounded-2xl shadow-lg shadow-brand-primary/20">
                <DollarSign className="w-6 h-6" />
              </div>
              <span className="px-3 py-1 bg-green-50 text-green-600 rounded-xl text-[10px] font-black flex items-center gap-1">
                <ArrowUp className="w-3 h-3" />
                {stats.ingresosChange}%
              </span>
            </div>
            <p className="enterprise-label opacity-60 text-brand-primary">Recaudación Total</p>
            <div className="flex items-baseline gap-2">
              <p className="text-4xl font-black text-brand-primary tracking-tighter leading-none font-mono">
                ${(stats.ingresosHoy / 1000).toFixed(0)}k
              </p>
              <span className="text-[10px] font-black text-brand-gray uppercase tracking-widest">
                / ${(stats.ingresosMes / 1000).toFixed(0)}k mes
              </span>
            </div>
          </div>

          {/* Tratamientos Activos */}
          <div className="p-8 bg-white border border-gray-100 shadow-sm rounded-[2rem] hover:scale-[1.02] transition-all duration-300 group">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center justify-center w-12 h-12 bg-brand-secondary/10 text-brand-primary rounded-2xl group-hover:bg-brand-primary group-hover:text-white transition-all duration-500">
                <Activity className="w-6 h-6" />
              </div>
              <span className="px-3 py-1 bg-green-50 text-green-600 rounded-xl text-[10px] font-black flex items-center gap-1">
                <ArrowUp className="w-3 h-3" />
                {stats.tratamientosChange}%
              </span>
            </div>
            <p className="enterprise-label opacity-60">Casos en Curso</p>
            <p className="text-4xl font-black text-gray-900 tracking-tighter leading-none">
              {stats.tratamientosActivos}
            </p>
          </div>
        </div>

        {/* Analisis Visual */}
        <div className="grid grid-cols-1 gap-8 mb-8 lg:grid-cols-2">
            <div className="p-10 bg-white border border-gray-100 shadow-xl rounded-[2.5rem]">
                <h2 className="enterprise-label mb-8 flex items-center gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                    Distribución Documentos (DTE)
                </h2>
                <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={dte_stats?.dte_distribution || []}
                                cx="50%"
                                cy="50%"
                                innerRadius={70}
                                outerRadius={100}
                                paddingAngle={8}
                                dataKey="value"
                                stroke="none"
                            >
                                {(dte_stats?.dte_distribution || []).map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} className="focus:outline-none" />
                                ))}
                            </Pie>
                            <Tooltip 
                                contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', fontWeight: 'bold' }} 
                                formatter={(value) => [`${value} emitidos`, 'Cantidad']} 
                            />
                            <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '10px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '1px' }}/>
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="p-10 bg-white border border-gray-100 shadow-xl rounded-[2.5rem]">
                <h2 className="enterprise-label mb-8 flex items-center gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    Flujo por Medio de Pago
                </h2>
                <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={dte_stats?.payment_distribution || []} layout="vertical" margin={{ left: 20 }}>
                            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                            <XAxis type="number" hide />
                            <YAxis 
                                dataKey="name" 
                                type="category" 
                                width={120} 
                                axisLine={false} 
                                tickLine={false} 
                                style={{ fontSize: '9px', fontWeight: '900', textTransform: 'uppercase', fill: '#858793' }} 
                            />
                            <Tooltip 
                                contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', fontWeight: 'bold' }} 
                                formatter={(value) => [`$${value.toLocaleString('es-CL')}`, 'Recaudado']} 
                            />
                            <Bar dataKey="value" fill="#3292b3" radius={[0, 12, 12, 0]} barSize={24} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>

        <div className="grid grid-cols-1 gap-8 mb-8 lg:grid-cols-3">
          {/* Agenda de Hoy */}
          <div className="p-8 bg-white border border-gray-100 shadow-sm lg:col-span-2 rounded-[2.5rem]">
            <div className="flex items-center justify-between mb-8">
              <h2 className="flex items-center gap-3 text-xl font-black text-gray-900 uppercase tracking-tight">
                <Calendar className="w-6 h-6 text-brand-primary" />
                Planificación del Día
              </h2>
              <button className="px-4 py-2 bg-gray-50 text-brand-primary rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-brand-primary hover:text-white transition-all shadow-sm">
                Ver Todo
              </button>
            </div>

            <div className="space-y-4">
              {todayAppointments.map((appointment) => (
                <div
                  key={appointment.id}
                  className="flex items-center gap-6 p-5 transition-all border border-gray-50 hover:border-brand-primary/20 cursor-pointer rounded-3xl hover:bg-brand-secondary/5 group shadow-sm hover:shadow-md"
                >
                  <div className="flex-shrink-0">
                    <div className="w-20 py-2 bg-gray-50 rounded-2xl group-hover:bg-brand-primary group-hover:text-white transition-all">
                      <p className="text-sm font-black font-mono">
                        {appointment.time}
                      </p>
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <p className="font-black text-gray-900 uppercase text-sm tracking-tight">
                        {appointment.patient}
                      </p>
                      <span
                        className={`text-[9px] px-2 py-0.5 rounded-lg font-black uppercase tracking-widest ${
                          appointment.type === "evaluacion"
                            ? "bg-purple-50 text-purple-600"
                            : appointment.type === "control"
                            ? "bg-blue-50 text-blue-600"
                            : "bg-green-50 text-green-600"
                        }`}
                      >
                        {appointment.type}
                      </span>
                    </div>
                    <p className="text-xs font-bold text-brand-gray uppercase tracking-tight opacity-70">
                      {appointment.treatment}
                    </p>
                  </div>

                  <div className="flex-shrink-0">
                    <span
                      className={`inline-flex items-center gap-2 px-4 py-2 rounded-2xl text-[9px] font-black uppercase tracking-widest ${
                        appointment.status === "Completada"
                          ? "bg-green-50 text-green-600"
                          : appointment.status === "En Curso"
                          ? "bg-blue-50 text-blue-600 animate-pulse"
                          : "bg-orange-50 text-orange-600"
                      }`}
                    >
                      {appointment.status}
                    </span>
                  </div>

                  <button className="flex-shrink-0 p-3 hover:bg-white rounded-2xl transition-colors shadow-sm border border-transparent hover:border-gray-100">
                    <MoreVertical className="w-4 h-4 text-brand-gray" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Pagos Pendientes */}
          <div className="p-8 bg-white border border-gray-100 shadow-sm rounded-[2.5rem]">
            <div className="flex items-center justify-between mb-8">
              <h2 className="flex items-center gap-3 text-xl font-black text-gray-900 uppercase tracking-tight">
                <AlertCircle className="w-6 h-6 text-orange-500" />
                Por Cobrar
              </h2>
            </div>

            <div className="space-y-4">
              {pendingPayments.map((payment) => (
                <div
                  key={payment.id}
                  className={`p-6 rounded-[2rem] border-2 transition-all cursor-pointer ${
                    payment.overdue
                      ? "border-red-100 bg-red-50/30"
                      : "border-gray-50 hover:border-orange-200 bg-white shadow-sm hover:shadow-md"
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <p className="text-xs font-black text-gray-900 uppercase tracking-tight">
                      {payment.patient}
                    </p>
                    {payment.overdue && (
                      <span className="text-[8px] bg-red-500 text-white px-2 py-1 rounded-lg font-black uppercase tracking-widest animate-pulse">
                        Vencido
                      </span>
                    )}
                  </div>
                  <p className="mb-1 text-2xl font-black text-gray-900 font-mono tracking-tighter leading-none">
                    ${payment.amount_clp.toLocaleString("es-CL")}
                  </p>
                  <p className="text-[9px] font-black text-brand-gray uppercase tracking-widest opacity-60">
                    Límite: {new Date(payment.dueDate).toLocaleDateString("es-CL")}
                  </p>
                </div>
              ))}
            </div>

            <button className="w-full py-5 mt-6 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 transition-all border-2 border-gray-50 rounded-[1.5rem] hover:bg-gray-50 hover:text-brand-primary active:scale-95">
              Gestionar Deudas
            </button>
          </div>
        </div>

        {/* Pacientes Recientes */}
        <div className="p-10 bg-white border border-gray-100 shadow-xl rounded-[3rem] overflow-hidden relative">
          <div className="flex items-center justify-between mb-10">
            <h2 className="flex items-center gap-4 text-2xl font-black text-gray-900 tracking-tight">
              <Users className="w-8 h-8 text-brand-primary" />
              Ingresos Recientes
            </h2>
            <button className="px-6 py-3 bg-brand-primary text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:brightness-110 transition-all shadow-lg shadow-brand-primary/20 active:scale-95">
              Ficha Clínica Global
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-50">
                  <th className="px-6 py-5 enterprise-label text-left">Paciente</th>
                  <th className="px-6 py-5 enterprise-label text-left">Última Visita</th>
                  <th className="px-6 py-5 enterprise-label text-left">Próxima Cita</th>
                  <th className="px-6 py-5 enterprise-label text-left">Estado</th>
                  <th className="px-6 py-5 enterprise-label text-left">Progreso Clínico</th>
                  <th className="px-6 py-5 enterprise-label text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {recentPatients.map((patient) => (
                  <tr
                    key={patient.id}
                    className="transition-all hover:bg-gray-50 group"
                  >
                    <td className="px-6 py-6">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center justify-center w-12 h-12 font-black text-xs text-white rounded-2xl bg-brand-primary shadow-lg shadow-brand-primary/10 group-hover:rotate-6 transition-all">
                          {patient.name.split(" ").map((n) => n[0]).join("")}
                        </div>
                        <span className="font-black text-gray-900 uppercase tracking-tight text-sm">
                          {patient.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-6 text-sm font-bold text-gray-500 font-mono">
                      {new Date(patient.lastVisit).toLocaleDateString("es-CL")}
                    </td>
                    <td className="px-6 py-6 text-sm font-bold text-gray-500 font-mono">
                      {patient.nextAppointment ? new Date(patient.nextAppointment).toLocaleDateString("es-CL") : "-"}
                    </td>
                    <td className="px-6 py-6">
                      <span className={`inline-flex items-center px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest ${
                          patient.status === "Activo" ? "bg-green-50 text-green-600" : "bg-gray-50 text-gray-500"
                        }`}
                      >
                        {patient.status}
                      </span>
                    </td>
                    <td className="px-6 py-6">
                      <div className="flex items-center gap-4">
                        <div className="flex-1 h-2.5 overflow-hidden bg-gray-100 rounded-full">
                          <div className="h-full bg-brand-primary shadow-sm" style={{ width: `${patient.progress}%` }}></div>
                        </div>
                        <span className="w-12 text-xs font-black text-right text-gray-900">
                          {patient.progress}%
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-6">
                      <div className="flex items-center justify-center gap-3">
                        <button className="p-3 text-brand-primary hover:bg-brand-secondary/10 transition-all rounded-2xl border border-transparent hover:border-brand-secondary/20">
                          <Eye className="w-5 h-5" />
                        </button>
                        <button className="p-3 text-brand-gray hover:bg-gray-50 transition-all rounded-2xl border border-transparent hover:border-gray-100">
                          <FileText className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Actions Footer */}
        <div className="grid grid-cols-1 gap-6 mt-10 md:grid-cols-5">
          {[
            { icon: Users, label: 'Nuevo Paciente', color: 'bg-brand-primary', desc: 'Registrar ingreso' },
            { icon: Calendar, label: 'Agendar Cita', color: 'bg-indigo-600', desc: 'Programar sesión' },
            { icon: Clipboard, label: 'Nueva Sesión', color: 'bg-green-600', desc: 'Ficha clínica' },
            { icon: DollarSign, label: 'Registrar Pago', color: 'bg-orange-600', desc: 'Caja presencial' },
            { icon: FileText, label: 'Emitir DTE', color: 'bg-gray-900', desc: 'Factura/Boleta', link: 'documents' }
          ].map((action, i) => (
            <button key={i} className={`p-8 text-left text-white transition-all ${action.color} rounded-[2rem] hover:scale-[1.05] hover:shadow-2xl group relative overflow-hidden`}>
              <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-12 -mt-12 group-hover:scale-150 transition-all duration-700"></div>
              <action.icon className="w-10 h-10 mb-4 transition-transform group-hover:scale-110 relative z-10" />
              <h3 className="mb-1 text-sm font-black uppercase tracking-widest relative z-10">{action.label}</h3>
              <p className="text-[10px] font-bold uppercase opacity-60 tracking-widest relative z-10">{action.desc}</p>
            </button>
          ))}
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
