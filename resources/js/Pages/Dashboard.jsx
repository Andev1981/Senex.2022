import React, { useState } from "react";
import {
  Users,
  Calendar,
  DollarSign,
  Activity,
  AlertCircle,
  ArrowUp,
  Clipboard,
  FileText,
  PieChart as PieChartIcon,
  Eye,
  MoreVertical,
  Home,
  List,
} from "lucide-react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, usePage, Link } from "@inertiajs/react";
import { usePermission } from "@/hooks/usePermission";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

export default function Dashboard({ dte_stats }) {
  const user = usePage().props.auth.user;
  const { hasPermission } = usePermission();
  const [selectedPeriod, setSelectedPeriod] = useState("hoy");

  const COLORS = [
    "#3b82f6",
    "#10b981",
    "#f59e0b",
    "#ef4444",
    "#8b5cf6",
    "#6366f1",
  ];

  // Datos reales desde dte_stats
  const stats = {
    pacientesTotal: dte_stats?.pacientesTotal || 0,
    pacientesHoy: dte_stats?.pacientesHoy || 0,
    pacientesChange: 0, // Podrías calcular esto comparando con ayer si fuera necesario
    sesionesTotal: dte_stats?.sesionesTotal || 0,
    sesionesHoy: dte_stats?.sesionesHoy || 0,
    sesionesChange: 0,
    ingresosMes: dte_stats?.ingresosMes || 0,
    ingresosHoy: dte_stats?.ingresosHoy || 0,
    ingresosChange: 0,
    tratamientosActivos: dte_stats?.tratamientosActivos || 0,
    tratamientosChange: 0,
  };

  const todayAppointments = dte_stats?.todayAppointments || [];
  const recentPatients = dte_stats?.recentPatients || [];
  const pendingPayments = dte_stats?.pendingPayments || [];

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
          <div className="absolute top-0 right-0 w-64 h-64 -mt-32 -mr-32 rounded-full bg-brand-primary/5 blur-3xl"></div>
          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center justify-center transform shadow-xl w-14 h-14 shadow-brand-primary/20 bg-brand-primary rounded-2xl rotate-3">
                <Home className="text-white w-7 h-7" />
              </div>
              <div>
                <h1 className="mb-1 text-3xl font-black leading-none tracking-tight text-gray-900">
                  Panel de Control
                </h1>
                <p className="text-[10px] font-black text-brand-gray uppercase tracking-[0.2em]">
                  Bienvenid@, {user?.name} • Senex Enterprise
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="px-6 py-3 text-xs font-bold tracking-widest text-gray-600 uppercase transition-all border-gray-100 cursor-pointer rounded-2xl focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/5 bg-gray-50/50"
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
              <div className="flex items-center justify-center w-12 h-12 transition-all duration-500 bg-brand-secondary/10 text-brand-primary rounded-2xl group-hover:bg-brand-primary group-hover:text-white">
                <Users className="w-6 h-6" />
              </div>
              <span className="px-3 py-1 bg-green-50 text-green-600 rounded-xl text-[10px] font-black flex items-center gap-1">
                <ArrowUp className="w-3 h-3" />
                {stats.pacientesChange}%
              </span>
            </div>
            <p className="enterprise-label opacity-60">Pacientes Atendidos</p>
            <div className="flex items-baseline gap-2">
              <p className="text-4xl font-black leading-none tracking-tighter text-gray-900">
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
              <div className="flex items-center justify-center w-12 h-12 transition-all duration-500 bg-brand-secondary/10 text-brand-primary rounded-2xl group-hover:bg-brand-primary group-hover:text-white">
                <Clipboard className="w-6 h-6" />
              </div>
              <span className="px-3 py-1 bg-green-50 text-green-600 rounded-xl text-[10px] font-black flex items-center gap-1">
                <ArrowUp className="w-3 h-3" />
                {stats.sesionesChange}%
              </span>
            </div>
            <p className="enterprise-label opacity-60">Sesiones del Mes</p>
            <div className="flex items-baseline gap-2">
              <p className="text-4xl font-black leading-none tracking-tighter text-gray-900">
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
              <div className="flex items-center justify-center w-12 h-12 text-white shadow-lg bg-brand-primary rounded-2xl shadow-brand-primary/20">
                <DollarSign className="w-6 h-6" />
              </div>
              <span className="px-3 py-1 bg-green-50 text-green-600 rounded-xl text-[10px] font-black flex items-center gap-1">
                <ArrowUp className="w-3 h-3" />
                {stats.ingresosChange}%
              </span>
            </div>
            <p className="enterprise-label opacity-60 text-brand-primary">
              Recaudación Total
            </p>
            <div className="flex items-baseline gap-2">
              <p className="font-mono text-4xl font-black leading-none tracking-tighter text-brand-primary">
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
              <div className="flex items-center justify-center w-12 h-12 transition-all duration-500 bg-brand-secondary/10 text-brand-primary rounded-2xl group-hover:bg-brand-primary group-hover:text-white">
                <Activity className="w-6 h-6" />
              </div>
              <span className="px-3 py-1 bg-green-50 text-green-600 rounded-xl text-[10px] font-black flex items-center gap-1">
                <ArrowUp className="w-3 h-3" />
                {stats.tratamientosChange}%
              </span>
            </div>
            <p className="enterprise-label opacity-60">Casos en Curso</p>
            <p className="text-4xl font-black leading-none tracking-tighter text-gray-900">
              {stats.tratamientosActivos}
            </p>
          </div>
        </div>

        {/* Quick Actions - Acceso Directo */}
        <div className="grid grid-cols-2 gap-4 mb-8 md:grid-cols-3 lg:grid-cols-5">
          {[
            {
              id: "patients.index",
              icon: Users,
              label: "Pacientes",
              color: "bg-brand-primary",
              desc: "Gestionar ingresos",
              href: route("patients.index"),
            },
            {
              id: "agendas.index",
              icon: Calendar,
              label: "Agenda",
              color: "bg-indigo-600",
              desc: "Citas del día",
              href: route("agendas.index"),
            },
            {
              id: "treatment-sessions.index",
              icon: List,
              label: "Atención",
              color: "bg-green-600",
              desc: "Nueva sesión",
              href: route("treatment-sessions.index"),
            },
            {
              id: "payments.index",
              icon: DollarSign,
              label: "Caja / POS",
              color: "bg-orange-600",
              desc: "Registrar pago",
              href: route("payments.index"),
            },
            {
              id: "documents",
              icon: FileText,
              label: "Documentos",
              color: "bg-gray-900",
              desc: "Facturas y DTE",
              href: route("documents"),
            },
          ].filter(action => hasPermission(action.id)).map((action, i) => (
            <Link
              key={i}
              href={action.href}
              className={`p-6 text-left text-white transition-all ${action.color} rounded-[2rem] hover:scale-[1.05] hover:shadow-2xl group relative overflow-hidden`}
            >
              <div className="absolute top-0 right-0 w-24 h-24 -mt-12 -mr-12 transition-all duration-700 rounded-full bg-white/10 group-hover:scale-150"></div>
              <action.icon className="relative z-10 w-8 h-8 mb-4 transition-transform group-hover:scale-110" />
              <h3 className="relative z-10 mb-1 text-[11px] font-black tracking-widest uppercase">
                {action.label}
              </h3>
              <p className="text-[9px] font-bold uppercase opacity-60 tracking-widest relative z-10">
                {action.desc}
              </p>
            </Link>
          ))}
        </div>

        {/* Analisis Visual */}
        <div className="grid grid-cols-1 gap-8 mb-8 lg:grid-cols-2">
          {hasPermission("documents") && (
            <div className="p-10 bg-white border border-gray-100 shadow-xl rounded-[2.5rem]">
              <h2 className="flex items-center gap-3 mb-8 enterprise-label">
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
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                          className="focus:outline-none"
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        borderRadius: "16px",
                        border: "none",
                        boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)",
                        fontWeight: "bold",
                      }}
                      formatter={(value) => [`${value} emitidos`, "Cantidad"]}
                    />
                    <Legend
                      verticalAlign="bottom"
                      height={36}
                      iconType="circle"
                      wrapperStyle={{
                        fontSize: "10px",
                        fontWeight: "900",
                        textTransform: "uppercase",
                        letterSpacing: "1px",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {hasPermission("payments.index") && (
            <div className="p-10 bg-white border border-gray-100 shadow-xl rounded-[2.5rem]">
              <h2 className="flex items-center gap-3 mb-8 enterprise-label">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                Flujo por Medio de Pago
              </h2>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={dte_stats?.payment_distribution || []}
                    layout="vertical"
                    margin={{ left: 20 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      horizontal={false}
                      stroke="#f1f5f9"
                    />
                    <XAxis type="number" hide />
                    <YAxis
                      dataKey="name"
                      type="category"
                      width={120}
                      axisLine={false}
                      tickLine={false}
                      style={{
                        fontSize: "9px",
                        fontWeight: "900",
                        textTransform: "uppercase",
                        fill: "#858793",
                      }}
                    />
                    <Tooltip
                      contentStyle={{
                        borderRadius: "16px",
                        border: "none",
                        boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)",
                        fontWeight: "bold",
                      }}
                      formatter={(value) => [
                        `$${value.toLocaleString("es-CL")}`,
                        "Recaudado",
                      ]}
                    />
                    <Bar
                      dataKey="value"
                      fill="#3292b3"
                      radius={[0, 12, 12, 0]}
                      barSize={24}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 gap-8 mb-8 lg:grid-cols-3">
          {/* Agenda de Hoy */}
          <div className="p-8 bg-white border border-gray-100 shadow-sm lg:col-span-2 rounded-[2.5rem]">
            <div className="flex items-center justify-between mb-8">
              <h2 className="flex items-center gap-3 text-xl font-black tracking-tight text-gray-900 uppercase">
                <Calendar className="w-6 h-6 text-brand-primary" />
                Planificación del Día
              </h2>
              {hasPermission("treatment-sessions.index") && (
                <Link 
                  href={route("treatment-sessions.index")}
                  className="px-4 py-2 bg-gray-50 text-brand-primary rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-brand-primary hover:text-white transition-all shadow-sm"
                >
                  Ver Todo
                </Link>
              )}
            </div>

            <div className="space-y-4">
              {todayAppointments.map((appointment) => (
                <div
                  key={appointment.id}
                  className="flex items-center gap-6 p-5 transition-all border shadow-sm cursor-pointer border-gray-50 hover:border-brand-primary/20 rounded-3xl hover:bg-brand-secondary/5 group hover:shadow-md"
                >
                  <div className="flex-shrink-0">
                    <div className="w-20 py-2 transition-all bg-gray-50 rounded-2xl group-hover:bg-brand-primary group-hover:text-white">
                      <p className="font-mono text-sm font-black">
                        {appointment.time}
                      </p>
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <p className="text-sm font-black tracking-tight text-gray-900 uppercase">
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
                    <p className="text-xs font-bold tracking-tight uppercase text-brand-gray opacity-70">
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

                  {hasPermission("treatment-sessions.index") && (
                    <button className="flex-shrink-0 p-3 transition-colors border border-transparent shadow-sm hover:bg-white rounded-2xl hover:border-gray-100">
                      <MoreVertical className="w-4 h-4 text-brand-gray" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Pagos Pendientes */}
          <div className="p-8 bg-white border border-gray-100 shadow-sm rounded-[2.5rem]">
            <div className="flex items-center justify-between mb-8">
              <h2 className="flex items-center gap-3 text-xl font-black tracking-tight text-gray-900 uppercase">
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
                    <p className="text-xs font-black tracking-tight text-gray-900 uppercase">
                      {payment.patient}
                    </p>
                    {payment.overdue && (
                      <span className="text-[8px] bg-red-500 text-white px-2 py-1 rounded-lg font-black uppercase tracking-widest animate-pulse">
                        Vencido
                      </span>
                    )}
                  </div>
                  <p className="mb-1 font-mono text-2xl font-black leading-none tracking-tighter text-gray-900">
                    ${payment.amount_clp.toLocaleString("es-CL")}
                  </p>
                  <p className="text-[9px] font-black text-brand-gray uppercase tracking-widest opacity-60">
                    Límite:{" "}
                    {new Date(payment.dueDate).toLocaleDateString("es-CL")}
                  </p>
                </div>
              ))}
            </div>

            {hasPermission("payments.index") && (
              <Link 
                href={route("payments.index")}
                className="w-full py-5 mt-6 text-center text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 transition-all border-2 border-gray-50 rounded-[1.5rem] hover:bg-gray-50 hover:text-brand-primary active:scale-95 block"
              >
                Gestionar Deudas
              </Link>
            )}
          </div>
        </div>

        {/* Pacientes Recientes - Rediseño Visual */}
        <div className="bg-white border border-gray-100 shadow-sm rounded-[2rem] overflow-hidden">
          <div className="flex items-center justify-between p-8 border-b border-gray-50">
            <div>
              <h2 className="flex items-center gap-3 text-xl font-black tracking-tight text-gray-900 uppercase">
                <Users className="w-6 h-6 text-brand-primary" />
                Ingresos Recientes
              </h2>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">
                Últimos pacientes registrados en el sistema
              </p>
            </div>
            {hasPermission("patients.index") && (
              <Link 
                href={route("patients.index")}
                className="px-5 py-2.5 bg-gray-50 text-brand-primary rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-brand-primary hover:text-white transition-all shadow-sm"
              >
                Ver Listado Completo
              </Link>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50/50">
                  <th className="px-8 py-4 text-left text-[10px] font-black text-brand-gray uppercase tracking-widest">
                    Paciente
                  </th>
                  <th className="px-8 py-4 text-left text-[10px] font-black text-brand-gray uppercase tracking-widest">
                    Última Visita
                  </th>
                  <th className="px-8 py-4 text-left text-[10px] font-black text-brand-gray uppercase tracking-widest">
                    Próxima Cita
                  </th>
                  <th className="px-8 py-4 text-left text-[10px] font-black text-brand-gray uppercase tracking-widest">
                    Estado
                  </th>
                  <th className="px-8 py-4 text-left text-[10px] font-black text-brand-gray uppercase tracking-widest">
                    Progreso
                  </th>
                  <th className="px-8 py-4 text-center text-[10px] font-black text-brand-gray uppercase tracking-widest">
                    Ficha
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {recentPatients.map((patient) => (
                  <tr
                    key={patient.id}
                    className="transition-all hover:bg-brand-secondary/5 group"
                  >
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center justify-center w-10 h-10 text-[10px] font-black text-brand-primary bg-brand-secondary/20 rounded-xl group-hover:scale-110 transition-transform">
                          {patient.name
                            .split(" ")
                            .slice(0, 2)
                            .map((n) => n[0])
                            .join("")}
                        </div>
                        <span className="text-sm font-black tracking-tight text-gray-900 uppercase">
                          {patient.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <p className="font-mono text-xs font-bold text-gray-500">
                        {patient.lastVisit && patient.lastVisit !== "-" 
                          ? new Date(patient.lastVisit).toLocaleDateString("es-CL") 
                          : "Sin visitas"}
                      </p>
                    </td>
                    <td className="px-8 py-5">
                      <p className="font-mono text-xs font-bold text-brand-primary">
                        {patient.nextAppointment 
                          ? new Date(patient.nextAppointment).toLocaleDateString("es-CL") 
                          : "--"}
                      </p>
                    </td>
                    <td className="px-8 py-5">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${
                          patient.status === "Activo"
                            ? "bg-green-50 text-green-600"
                            : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        {patient.status}
                      </span>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-3">
                        <div className="flex-1 h-1.5 overflow-hidden bg-gray-100 rounded-full w-24">
                          <div
                            className="h-full bg-brand-primary transition-all duration-1000"
                            style={{ width: `${patient.progress}%` }}
                          ></div>
                        </div>
                        <span className="text-[10px] font-black text-gray-900 w-8">
                          {Math.round(patient.progress)}%
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-center justify-center gap-2">
                        {hasPermission("patients.show") && (
                          <Link 
                            href={route("patients.show", patient.id)}
                            className="p-2.5 text-brand-primary hover:bg-brand-primary hover:text-white rounded-xl transition-all border border-transparent hover:shadow-md"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
