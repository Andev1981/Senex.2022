import React, { useState } from "react";
import {
  Activity,
  Calendar,
  Pill,
  FileText,
  User,
  Bell,
  Menu,
  X,
  ChevronRight,
  Clock,
  LogOut,
  Stethoscope,
} from "lucide-react";

// NOTA: En tu proyecto real de Inertia, importarías Link así:
// import { Link } from '@inertiajs/react';
// Aquí usaremos botones simples para la demo visual.

const Index = () => {
  // --- Simulación de Datos que vendrían de Laravel (Inertia Props) ---
  const auth = {
    user: {
      name: "Carlos Rodríguez",
      email: "carlos@ejemplo.com",
      avatar: null,
    },
  };

  const stats = [
    {
      label: "Presión Arterial",
      value: "120/80",
      unit: "mmHg",
      status: "normal",
      icon: Activity,
      color: "text-blue-600",
      bg: "bg-blue-100",
    },
    {
      label: "Peso",
      value: "78.5",
      unit: "kg",
      status: "warning",
      icon: User,
      color: "text-orange-600",
      bg: "bg-orange-100",
    },
    {
      label: "Glucosa",
      value: "95",
      unit: "mg/dL",
      status: "normal",
      icon: Activity,
      color: "text-green-600",
      bg: "bg-green-100",
    },
  ];

  const appointments = [
    {
      id: 1,
      doctor: "Dr. Ana Martínez",
      speciality: "Cardiología",
      date: "28 Nov, 2025",
      time: "10:00 AM",
      location: "Consultorio 304",
    },
    {
      id: 2,
      doctor: "Dr. Luis Vega",
      speciality: "Nutrición",
      date: "05 Dic, 2025",
      time: "15:30 PM",
      location: "Consultorio 102",
    },
  ];

  const medications = [
    {
      id: 1,
      name: "Losartán",
      dosage: "50mg",
      frequency: "Cada 12 horas",
      remaining: 14,
    },
    {
      id: 2,
      name: "Metformina",
      dosage: "850mg",
      frequency: "Con alimentos",
      remaining: 5,
    },
  ];

  const recentDocs = [
    {
      id: 101,
      title: "Análisis de Sangre Completo",
      date: "15 Nov, 2025",
      type: "PDF",
    },
    {
      id: 102,
      title: "Radiografía de Tórax",
      date: "10 Oct, 2025",
      type: "IMG",
    },
  ];

  // --- Estado Local para UI ---
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("dashboard");

  // --- Componentes Auxiliares ---

  const StatCard = ({ stat }) => (
    <div className="flex items-center justify-between p-6 transition-shadow bg-white border shadow-sm rounded-2xl border-slate-100 hover:shadow-md">
      <div>
        <p className="mb-1 text-sm font-medium text-slate-500">{stat.label}</p>
        <div className="flex items-baseline gap-2">
          <h3 className="text-2xl font-bold text-slate-800">{stat.value}</h3>
          <span className="text-xs font-medium text-slate-400">
            {stat.unit}
          </span>
        </div>
        <div
          className={`mt-2 text-xs inline-flex items-center px-2 py-0.5 rounded-full ${
            stat.status === "normal"
              ? "bg-green-100 text-green-700"
              : "bg-yellow-100 text-yellow-700"
          }`}
        >
          {stat.status === "normal" ? "Normal" : "Requiere Atención"}
        </div>
      </div>
      <div className={`p-3 rounded-xl ${stat.bg}`}>
        <stat.icon size={24} className={stat.color} />
      </div>
    </div>
  );

  const NavigationItem = ({ id, label, icon: Icon }) => (
    <button
      onClick={() => {
        setActiveTab(id);
        setSidebarOpen(false);
      }}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
        activeTab === id
          ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200"
          : "text-slate-500 hover:bg-slate-50 hover:text-indigo-600"
      }`}
    >
      <Icon size={20} />
      <span className="font-medium">{label}</span>
      {activeTab === id && (
        <ChevronRight size={16} className="ml-auto opacity-50" />
      )}
    </button>
  );

  return (
    <div className="flex min-h-screen font-sans bg-slate-50 text-slate-800">
      {/* Overlay Móvil */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/20 md:hidden backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar de Navegación */}
      <aside
        className={`
        fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-slate-100 shadow-xl md:shadow-none transform transition-transform duration-300 ease-in-out md:translate-x-0 md:static
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
      `}
      >
        <div className="flex items-center justify-between p-6">
          <div className="flex items-center gap-2 text-2xl font-bold text-indigo-600">
            <div className="bg-indigo-600 text-white p-1.5 rounded-lg">
              <Stethoscope size={24} />
            </div>
            <span>MediApp</span>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="md:hidden text-slate-400"
          >
            <X size={24} />
          </button>
        </div>

        <div className="px-4 py-2 space-y-2">
          <div className="px-4 mb-2 text-xs font-bold tracking-wider uppercase text-slate-400">
            Menú Principal
          </div>
          <NavigationItem
            id="dashboard"
            label="Resumen General"
            icon={Activity}
          />
          <NavigationItem id="citas" label="Mis Citas" icon={Calendar} />
          <NavigationItem id="tratamientos" label="Tratamientos" icon={Pill} />
          <NavigationItem
            id="historial"
            label="Historial Médico"
            icon={FileText}
          />
        </div>

        <div className="absolute bottom-0 w-full p-6 border-t border-slate-100">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center justify-center w-10 h-10 font-bold text-indigo-700 bg-indigo-100 rounded-full">
              {auth.user.name.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold truncate text-slate-800">
                {auth.user.name}
              </p>
              <p className="text-xs truncate text-slate-500">
                {auth.user.email}
              </p>
            </div>
          </div>
          <button className="flex items-center w-full gap-2 p-2 text-sm font-medium text-red-500 transition-colors rounded-lg hover:bg-red-50">
            <LogOut size={16} />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </aside>

      {/* Área Principal */}
      <main className="flex-1 min-w-0 overflow-auto">
        {/* Header Superior */}
        <header className="sticky top-0 z-30 flex items-center justify-between px-6 py-4 border-b bg-white/80 backdrop-blur-md border-slate-100">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 -ml-2 rounded-lg md:hidden text-slate-600 hover:bg-slate-100"
            >
              <Menu size={24} />
            </button>
            <h1 className="text-xl font-bold text-slate-800">
              {activeTab === "dashboard"
                ? "Resumen de Salud"
                : activeTab === "citas"
                ? "Mis Citas"
                : activeTab === "tratamientos"
                ? "Medicamentos"
                : "Historial"}
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <button className="relative p-2 transition-colors rounded-full text-slate-400 hover:text-indigo-600 hover:bg-indigo-50">
              <Bell size={20} />
              <span className="absolute w-2 h-2 bg-red-500 border-2 border-white rounded-full top-2 right-2"></span>
            </button>
          </div>
        </header>

        {/* Contenido Dinámico */}
        <div className="p-6 mx-auto space-y-6 max-w-7xl">
          {/* Mensaje de Bienvenida */}
          <div className="p-6 text-white shadow-lg bg-gradient-to-r from-indigo-600 to-blue-500 rounded-2xl shadow-indigo-200">
            <h2 className="mb-2 text-2xl font-bold">
              ¡Hola, {auth.user.name.split(" ")[0]}!
            </h2>
            <p className="text-indigo-100">
              Tienes{" "}
              <span className="font-bold bg-white/20 px-2 py-0.5 rounded-md">
                2 citas pendientes
              </span>{" "}
              y tu tratamiento está al día. ¡Sigue así!
            </p>
          </div>

          {/* Estadísticas Rápidas */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {stats.map((stat, idx) => (
              <StatCard key={idx} stat={stat} />
            ))}
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Columna Izquierda (2/3) */}
            <div className="space-y-6 lg:col-span-2">
              {/* Próxima Cita - Card Destacada */}
              <div className="overflow-hidden bg-white border shadow-sm rounded-2xl border-slate-100">
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-50">
                  <h3 className="flex items-center gap-2 font-bold text-slate-800">
                    <Calendar size={18} className="text-indigo-500" />
                    Próximas Citas
                  </h3>
                  <button className="text-sm font-medium text-indigo-600 hover:underline">
                    Ver calendario
                  </button>
                </div>
                <div className="divide-y divide-slate-50">
                  {appointments.map((apt) => (
                    <div
                      key={apt.id}
                      className="flex flex-col gap-4 p-6 transition-colors hover:bg-slate-50 sm:flex-row sm:items-center"
                    >
                      <div className="flex flex-col items-center justify-center flex-shrink-0 w-16 h-16 text-indigo-700 bg-indigo-50 rounded-xl">
                        <span className="text-xs font-bold uppercase">
                          {apt.date.split(" ")[0]}
                        </span>
                        <span className="text-xl font-bold">
                          {apt.date.split(" ")[1].replace(",", "")}
                        </span>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-slate-800">
                          {apt.doctor}
                        </h4>
                        <p className="text-sm text-slate-500">
                          {apt.speciality} • {apt.location}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 text-sm font-medium text-slate-600 bg-slate-100 px-3 py-1.5 rounded-lg self-start sm:self-center">
                        <Clock size={16} />
                        {apt.time}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Resultados Recientes */}
              <div className="p-6 bg-white border shadow-sm rounded-2xl border-slate-100">
                <h3 className="flex items-center gap-2 mb-4 font-bold text-slate-800">
                  <FileText size={18} className="text-indigo-500" />
                  Resultados Recientes
                </h3>
                <div className="space-y-3">
                  {recentDocs.map((doc) => (
                    <div
                      key={doc.id}
                      className="flex items-center justify-between p-3 transition-all border cursor-pointer rounded-xl border-slate-100 hover:border-indigo-200 hover:bg-indigo-50/50 group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 text-orange-600 transition-colors bg-orange-100 rounded-lg group-hover:bg-white">
                          <FileText size={20} />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-700">
                            {doc.title}
                          </p>
                          <p className="text-xs text-slate-400">{doc.date}</p>
                        </div>
                      </div>
                      <span className="px-2 py-1 text-xs font-bold rounded-md bg-slate-100 text-slate-600 group-hover:bg-white">
                        {doc.type}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Columna Derecha (1/3) */}
            <div className="space-y-6">
              {/* Medicamentos - Card Compacta */}
              <div className="p-6 bg-white border shadow-sm rounded-2xl border-slate-100">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="flex items-center gap-2 font-bold text-slate-800">
                    <Pill size={18} className="text-indigo-500" />
                    Tratamiento
                  </h3>
                </div>
                <div className="space-y-4">
                  {medications.map((med) => (
                    <div
                      key={med.id}
                      className="relative p-4 overflow-hidden bg-slate-50 rounded-xl"
                    >
                      <div className="absolute top-0 right-0 w-16 h-16 -mt-4 -mr-4 rounded-bl-full bg-gradient-to-br from-white/0 to-indigo-100/50"></div>
                      <div className="relative z-10">
                        <div className="flex items-start justify-between mb-2">
                          <span className="font-bold text-slate-800">
                            {med.name}
                          </span>
                          <span className="text-xs font-bold bg-white border border-slate-200 px-2 py-0.5 rounded-full text-slate-500">
                            {med.dosage}
                          </span>
                        </div>
                        <p className="mb-3 text-xs text-slate-500">
                          {med.frequency}
                        </p>
                        <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              med.remaining < 7 ? "bg-red-400" : "bg-green-400"
                            }`}
                            style={{ width: `${(med.remaining / 30) * 100}%` }}
                          ></div>
                        </div>
                        <p className="text-[10px] text-slate-400 mt-1 text-right">
                          Quedan {med.remaining} días
                        </p>
                      </div>
                    </div>
                  ))}
                  <button className="w-full py-2 text-sm font-medium text-indigo-600 transition-colors border border-indigo-200 border-dashed rounded-xl hover:bg-indigo-50">
                    + Solicitar Receta
                  </button>
                </div>
              </div>

              {/* Banner Promocional / Ayuda */}
              <div className="p-6 border border-teal-100 bg-teal-50 rounded-2xl">
                <h4 className="mb-2 font-bold text-teal-800">
                  ¿Necesitas ayuda?
                </h4>
                <p className="mb-4 text-sm text-teal-600">
                  Nuestro equipo de soporte está disponible 24/7 para
                  emergencias médicas.
                </p>
                <button className="w-full py-2 text-sm font-bold text-white transition-colors bg-teal-600 rounded-lg shadow-sm hover:bg-teal-700 shadow-teal-200">
                  Contactar Soporte
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
