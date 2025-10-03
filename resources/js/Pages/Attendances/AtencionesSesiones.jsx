import React, { useMemo, useState } from "react";
import {
  Calendar,
  Clipboard,
  Users,
  DollarSign,
  Search,
  Filter,
  ChevronRight,
  ChevronLeft,
  MoreVertical,
  CheckCircle2,
  Clock,
  Timer,
  XCircle,
  Plus,
  Download,
  ArrowUpRight,
  ArrowDownRight,
  User,
  List,
} from "lucide-react";
import { Head } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";

// Helpers
const fmtCLP = (v) =>
  typeof v === "number"
    ? v.toLocaleString("es-CL", {
        style: "currency",
        currency: "CLP",
        maximumFractionDigits: 0,
      })
    : "-";

const fmtShortDate = (iso) =>
  new Date(iso).toLocaleDateString("es-CL", {
    day: "2-digit",
    month: "2-digit",
  });

const Chip = ({ color, text }) => (
  <span
    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${color}`}
  >
    {text}
  </span>
);

const estadoClass = (estado) => {
  switch (estado) {
    case "Completada":
      return "bg-green-100 text-green-700";
    case "En Curso":
      return "bg-blue-100 text-blue-700";
    case "Pendiente":
      return "bg-amber-100 text-amber-700";
    case "Cancelada":
      return "bg-gray-200 text-gray-700";
    case "Ausente":
      return "bg-red-100 text-red-700";
    default:
      return "bg-gray-100 text-gray-700";
  }
};

const tipoClass = (tipo) => {
  switch (tipo) {
    case "evaluacion":
      return "bg-purple-100 text-purple-700";
    case "control":
      return "bg-cyan-100 text-cyan-700";
    case "sesion":
      return "bg-emerald-100 text-emerald-700";
    default:
      return "bg-gray-100 text-gray-700";
  }
};

// Datos de ejemplo
const MOCK = [
  {
    id: 101,
    fecha: "2025-10-01",
    hora: "09:00",
    paciente: "María González",
    rutPaciente: "12.345.678-9",
    telefono: "+56 9 8765 4321",
    tratamiento: "Rehabilitación Hombro",
    tipo: "control",
    estado: "Completada",
    doctor: "Dr. Juan Pérez",
    sucursal: "Providencia",
    sala: "Box 2",
    copago: 15000,
    total: 25000,
    pagado: 25000,
    sessionNumber: 4,
  },
  {
    id: 102,
    fecha: "2025-10-01",
    hora: "10:00",
    paciente: "Carlos Ramírez",
    rutPaciente: "11.222.333-4",
    telefono: "+56 9 1111 2222",
    tratamiento: "Terapia Lumbar",
    tipo: "sesion",
    estado: "Completada",
    doctor: "Kine Daniela Ríos",
    sucursal: "Providencia",
    sala: "Box 1",
    copago: 10000,
    total: 20000,
    pagado: 20000,
    sessionNumber: 6,
  },
  {
    id: 103,
    fecha: "2025-10-01",
    hora: "11:30",
    paciente: "Ana Martínez",
    tratamiento: "Evaluación Inicial",
    tipo: "evaluacion",
    estado: "En Curso",
    doctor: "Kine Daniela Ríos",
    sucursal: "Providencia",
    sala: "Box 3",
    copago: 0,
    total: 25000,
    pagado: 0,
  },
  {
    id: 104,
    fecha: "2025-10-01",
    hora: "14:00",
    paciente: "Pedro Soto",
    tratamiento: "Control Rodilla",
    tipo: "control",
    estado: "Pendiente",
    doctor: "Dr. Juan Pérez",
    sucursal: "Providencia",
    sala: "Box 1",
    copago: 10000,
    total: 20000,
    pagado: 0,
    sessionNumber: 3,
  },
  {
    id: 105,
    fecha: "2025-10-01",
    hora: "15:30",
    paciente: "Laura Díaz",
    tratamiento: "Sesión Cervical",
    tipo: "sesion",
    estado: "Pendiente",
    doctor: "Kine Daniela Ríos",
    sucursal: "Providencia",
    sala: "Box 2",
    copago: 12000,
    total: 24000,
    pagado: 0,
    sessionNumber: 1,
  },
];

export default function AtencionesSesiones() {
  const [tab, setTab] = useState("atenciones");
  const [query, setQuery] = useState("");
  const [estado, setEstado] = useState("Todos");
  const [fecha, setFecha] = useState("2025-10-01"); // por defecto hoy
  const [page, setPage] = useState(1);
  const pageSize = 5;
  const [selected, setSelected] = useState(null);

  // Derivados
  const filtrados = useMemo(() => {
    return MOCK.filter(
      (a) =>
        (estado === "Todos" || a.estado === estado) &&
        (!fecha || a.fecha === fecha) &&
        (query.trim().length === 0 ||
          [a.paciente, a.tratamiento, a.doctor].some((v) =>
            v.toLowerCase().includes(query.toLowerCase())
          ))
    );
  }, [estado, fecha, query]);

  const totalPages = Math.max(1, Math.ceil(filtrados.length / pageSize));
  const paged = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filtrados.slice(start, start + pageSize);
  }, [filtrados, page]);

  const kpis = useMemo(() => {
    const hoy = filtrados.filter((a) => a.fecha === fecha);
    const completadas = hoy.filter((a) => a.estado === "Completada").length;
    const pendientes = hoy.filter((a) => a.estado === "Pendiente").length;
    const enCurso = hoy.filter((a) => a.estado === "En Curso").length;
    const totalCobrado = hoy.reduce((acc, a) => acc + (a.pagado || 0), 0);
    const totalPorCobrar = hoy.reduce(
      (acc, a) => acc + Math.max(0, (a.total || 0) - (a.pagado || 0)),
      0
    );
    return {
      total: hoy.length,
      completadas,
      pendientes,
      enCurso,
      totalCobrado,
      totalPorCobrar,
    };
  }, [filtrados, fecha]);

  // Acciones (placeholder: aquí integras tu lógica / API)
  const startSession = (a) => {
    setSelected({ ...a, estado: "En Curso" });
  };
  const completeSession = (a) => {
    setSelected({ ...a, estado: "Completada", pagado: a.pagado ?? 0 });
  };
  const cancelSession = (a) => {
    setSelected({ ...a, estado: "Cancelada" });
  };
  const issueDTE = (a) => {
    alert(
      `Emitir DTE para ${a.paciente}: total ${fmtCLP(a.total)} (placeholder)`
    );
  };

  return (
    <AuthenticatedLayout>
      <Head title="Atenciones" />
      <div className="min-h-screen p-4 bg-gray-50">
        {/* Header */}
        <div className="p-6 mb-6 bg-white border border-gray-200 shadow-sm rounded-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-12 h-12 shadow-lg bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl">
                <List className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {" "}
                  Atenciones & Sesiones
                </h1>
                <p className="text-sm text-gray-600">
                  Gestiona la agenda clínica, registra sesiones y cobra al
                  instante
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => alert("Nuevo paciente")}
                className="flex items-center gap-2 px-6 py-2 font-semibold text-white transition-colors bg-blue-600 rounded-lg shadow-lg hover:bg-blue-700 shadow-blue-500/30"
              >
                <Plus className="w-4 h-4" />
                Nueva Atención
              </button>
            </div>
          </div>
        </div>

        {/* Filtros */}
        <div className="p-4 mb-6 bg-white border border-gray-200 shadow-sm rounded-xl">
          <div className="flex flex-col items-stretch gap-3 lg:flex-row">
            <div className="flex items-center flex-1 gap-2 px-3 py-2 border-2 border-gray-200 rounded-lg focus-within:border-blue-500">
              <Search className="w-4 h-4 text-gray-400" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar por paciente, tratamiento o profesional..."
                className="w-full text-sm outline-none"
              />
            </div>
            <div className="flex items-center gap-2">
              <div className="px-3 py-2 border-2 border-gray-200 rounded-lg">
                <input
                  type="date"
                  value={fecha}
                  onChange={(e) => setFecha(e.target.value)}
                  className="text-sm outline-none"
                />
              </div>
              <select
                value={estado}
                onChange={(e) => setEstado(e.target.value)}
                className="px-3 py-2 text-sm font-medium border-2 border-gray-200 rounded-lg"
              >
                <option value="Todos">Todos los estados</option>
                <option value="Pendiente">Pendiente</option>
                <option value="En Curso">En Curso</option>
                <option value="Completada">Completada</option>
                <option value="Cancelada">Cancelada</option>
                <option value="Ausente">Ausente</option>
              </select>
              <button className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium border-2 border-gray-200 rounded-lg hover:bg-gray-50">
                <Filter className="w-4 h-4" /> Más filtros
              </button>
            </div>
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 gap-4 mb-6 md:grid-cols-2 lg:grid-cols-4">
          <div className="p-5 bg-white border border-gray-200 shadow-sm rounded-xl">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600">
                <Calendar className="w-5 h-5 text-white" />
              </div>
              <span className="text-xs font-semibold text-gray-500">
                {fmtShortDate(fecha)}
              </span>
            </div>
            <p className="text-sm text-gray-600">Atenciones del día</p>
            <p className="text-3xl font-bold text-gray-900">{kpis.total}</p>
          </div>
          <div className="p-5 bg-white border border-gray-200 shadow-sm rounded-xl">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600">
                <CheckCircle2 className="w-5 h-5 text-white" />
              </div>
              <span className="inline-flex items-center text-xs font-semibold text-emerald-600">
                <ArrowUpRight className="w-4 h-4" />
                ok
              </span>
            </div>
            <p className="text-sm text-gray-600">Completadas</p>
            <p className="text-3xl font-bold text-gray-900">
              {kpis.completadas}
            </p>
          </div>
          <div className="p-5 bg-white border border-gray-200 shadow-sm rounded-xl">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600">
                <Timer className="w-5 h-5 text-white" />
              </div>
              <span className="inline-flex items-center text-xs font-semibold text-amber-600">
                <ArrowDownRight className="w-4 h-4" />
                pend
              </span>
            </div>
            <p className="text-sm text-gray-600">Pendientes</p>
            <p className="text-3xl font-bold text-gray-900">
              {kpis.pendientes}
            </p>
          </div>
          <div className="p-5 bg-white border border-gray-200 shadow-sm rounded-xl">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600">
                <DollarSign className="w-5 h-5 text-white" />
              </div>
            </div>
            <p className="text-sm text-gray-600">Cobrado / Por cobrar</p>
            <p className="text-xl font-bold text-gray-900">
              {fmtCLP(kpis.totalCobrado)}{" "}
              <span className="font-medium text-gray-400">
                / {fmtCLP(kpis.totalPorCobrar)}
              </span>
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-2 mb-4">
          <button
            onClick={() => setTab("atenciones")}
            className={`px-4 py-2 rounded-xl text-sm font-semibold border-2 ${
              tab === "atenciones"
                ? "border-blue-600 text-blue-700 bg-blue-50"
                : "border-gray-200 text-gray-700 hover:bg-gray-50"
            }`}
          >
            Atenciones
          </button>
          <button
            onClick={() => setTab("sesiones")}
            className={`px-4 py-2 rounded-xl text-sm font-semibold border-2 ${
              tab === "sesiones"
                ? "border-blue-600 text-blue-700 bg-blue-50"
                : "border-gray-200 text-gray-700 hover:bg-gray-50"
            }`}
          >
            Sesiones
          </button>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Tabla principal */}
          <div className="bg-white border border-gray-200 shadow-sm lg:col-span-2 rounded-xl">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h2 className="flex items-center gap-2 text-lg font-bold text-gray-900">
                <Clipboard className="w-5 h-5 text-blue-600" />
                {tab === "atenciones"
                  ? "Listado de Atenciones"
                  : "Sesiones del Día"}
              </h2>
              <span className="text-sm text-gray-600">
                {filtrados.length} resultados
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left border-b-2 border-gray-200">
                    <th className="px-4 py-3 text-xs font-bold text-gray-600 uppercase">
                      Hora
                    </th>
                    <th className="px-4 py-3 text-xs font-bold text-gray-600 uppercase">
                      Paciente
                    </th>
                    <th className="px-4 py-3 text-xs font-bold text-gray-600 uppercase">
                      Tipo
                    </th>
                    <th className="px-4 py-3 text-xs font-bold text-gray-600 uppercase">
                      Profesional
                    </th>
                    <th className="px-4 py-3 text-xs font-bold text-gray-600 uppercase">
                      Estado
                    </th>
                    <th className="px-4 py-3 text-xs font-bold text-gray-600 uppercase">
                      Pago
                    </th>
                    <th className="px-4 py-3 text-xs font-bold text-center text-gray-600 uppercase">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {paged.map((a) => {
                    const saldo = Math.max(0, (a.total || 0) - (a.pagado || 0));
                    return (
                      <tr
                        key={a.id}
                        className="transition-colors hover:bg-gray-50"
                      >
                        <td className="px-4 py-3 text-sm font-semibold text-gray-900 whitespace-nowrap">
                          {a.hora}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-700">
                          <div className="flex items-center gap-3">
                            <div className="flex items-center justify-center font-bold text-white rounded-lg w-9 h-9 bg-gradient-to-br from-blue-500 to-blue-600">
                              {a.paciente
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </div>
                            <div className="min-w-0">
                              <p className="font-semibold text-gray-900 truncate">
                                {a.paciente}
                              </p>
                              <p className="text-xs text-gray-500 truncate">
                                {a.tratamiento}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <Chip
                            color={tipoClass(a.tipo)}
                            text={
                              a.tipo === "sesion"
                                ? `Sesión${
                                    a.sessionNumber
                                      ? ` #${a.sessionNumber}`
                                      : ""
                                  }`
                                : a.tipo === "control"
                                ? "Control"
                                : "Evaluación"
                            }
                          />
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-700">
                          {a.doctor}
                        </td>
                        <td className="px-4 py-3">
                          <Chip color={estadoClass(a.estado)} text={a.estado} />
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap">
                          {fmtCLP(a.pagado)}{" "}
                          <span className="text-gray-400">
                            / {fmtCLP(a.total)}
                          </span>
                          {saldo > 0 && (
                            <div className="text-xs font-semibold text-amber-600">
                              Saldo: {fmtCLP(saldo)}
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-2">
                          <div className="flex items-center justify-center gap-1">
                            {a.estado === "Pendiente" && (
                              <button
                                onClick={() => startSession(a)}
                                className="px-3 py-1.5 rounded-lg text-xs font-semibold border-2 border-blue-200 text-blue-700 hover:bg-blue-50"
                              >
                                Iniciar
                              </button>
                            )}
                            {a.estado === "En Curso" && (
                              <button
                                onClick={() => completeSession(a)}
                                className="px-3 py-1.5 rounded-lg text-xs font-semibold border-2 border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                              >
                                Completar
                              </button>
                            )}
                            {a.estado !== "Cancelada" && (
                              <button
                                onClick={() => cancelSession(a)}
                                className="px-3 py-1.5 rounded-lg text-xs font-semibold border-2 border-gray-200 text-gray-700 hover:bg-gray-50"
                              >
                                Cancelar
                              </button>
                            )}
                            <button
                              onClick={() => issueDTE(a)}
                              className="px-3 py-1.5 rounded-lg text-xs font-semibold border-2 border-purple-200 text-purple-700 hover:bg-purple-50"
                            >
                              Emitir DTE
                            </button>
                            <button
                              onClick={() => setSelected(a)}
                              className="p-2 rounded-lg hover:bg-gray-100"
                              title="Más"
                            >
                              <MoreVertical className="w-4 h-4 text-gray-400" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Paginación */}
            <div className="flex items-center justify-between p-4 border-t border-gray-200">
              <div className="text-sm text-gray-600">
                Página {page} de {totalPages}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="inline-flex items-center gap-1 px-3 py-2 text-sm border-2 border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40"
                  disabled={page === 1}
                >
                  <ChevronLeft className="w-4 h-4" /> Anterior
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  className="inline-flex items-center gap-1 px-3 py-2 text-sm border-2 border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40"
                  disabled={page === totalPages}
                >
                  Siguiente <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Panel lateral */}
          <div className="p-5 bg-white border border-gray-200 shadow-sm rounded-xl">
            <h3 className="flex items-center gap-2 mb-4 text-lg font-bold text-gray-900">
              <Users className="w-5 h-5 text-blue-600" />
              Resumen del Día
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg bg-gray-50">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  <span className="text-sm">Completadas</span>
                </div>
                <span className="font-bold">{kpis.completadas}</span>
              </div>
              <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg bg-gray-50">
                <div className="flex items-center gap-3">
                  <Timer className="w-5 h-5 text-amber-600" />
                  <span className="text-sm">Pendientes</span>
                </div>
                <span className="font-bold">{kpis.pendientes}</span>
              </div>
              <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg bg-gray-50">
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-blue-600" />
                  <span className="text-sm">En curso</span>
                </div>
                <span className="font-bold">{kpis.enCurso}</span>
              </div>
              <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg bg-gray-50">
                <div className="flex items-center gap-3">
                  <DollarSign className="w-5 h-5 text-purple-600" />
                  <span className="text-sm">Cobrado</span>
                </div>
                <span className="font-bold">{fmtCLP(kpis.totalCobrado)}</span>
              </div>
              <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg bg-gray-50">
                <div className="flex items-center gap-3">
                  <DollarSign className="w-5 h-5 text-orange-600" />
                  <span className="text-sm">Por cobrar</span>
                </div>
                <span className="font-bold">{fmtCLP(kpis.totalPorCobrar)}</span>
              </div>
            </div>

            <div className="mt-6">
              <h4 className="mb-3 text-sm font-bold text-gray-700">
                Acciones Rápidas
              </h4>
              <div className="grid grid-cols-1 gap-2">
                <button className="w-full px-4 py-2 font-semibold text-white rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 hover:shadow">
                  Registrar sesión
                </button>
                <button className="w-full px-4 py-2 font-semibold text-gray-700 border-2 border-gray-200 rounded-lg hover:bg-gray-50">
                  Agendar próxima cita
                </button>
                <button className="w-full px-4 py-2 font-semibold text-purple-700 border-2 border-purple-200 rounded-lg hover:bg-purple-50">
                  Emitir boleta (DTE)
                </button>
              </div>
            </div>

            {selected && (
              <div className="pt-6 mt-6 border-t border-gray-200">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="text-sm font-bold text-gray-900">
                    Detalle de la atención
                  </h4>
                  <button
                    className="p-2 -mr-2 rounded-lg hover:bg-gray-100"
                    onClick={() => setSelected(null)}
                  >
                    <XCircle className="w-4 h-4 text-gray-400" />
                  </button>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Paciente</span>
                    <span className="font-semibold">{selected.paciente}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Hora</span>
                    <span className="font-semibold">{selected.hora}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Profesional</span>
                    <span className="font-semibold">{selected.doctor}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Tipo</span>
                    <span className="font-semibold capitalize">
                      {selected.tipo}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Estado</span>
                    <span className="font-semibold">{selected.estado}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Pago</span>
                    <span className="font-semibold">
                      {fmtCLP(selected.pagado)}{" "}
                      <span className="font-normal text-gray-400">
                        / {fmtCLP(selected.total)}
                      </span>
                    </span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 mt-4">
                  {selected.estado === "Pendiente" && (
                    <button
                      onClick={() => startSession(selected)}
                      className="px-3 py-2 text-xs font-semibold text-blue-700 border-2 border-blue-200 rounded-lg hover:bg-blue-50"
                    >
                      Iniciar
                    </button>
                  )}
                  {selected.estado === "En Curso" && (
                    <button
                      onClick={() => completeSession(selected)}
                      className="px-3 py-2 text-xs font-semibold border-2 rounded-lg border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                    >
                      Completar
                    </button>
                  )}
                  <button
                    onClick={() => issueDTE(selected)}
                    className="col-span-2 px-3 py-2 text-xs font-semibold text-purple-700 border-2 border-purple-200 rounded-lg hover:bg-purple-50"
                  >
                    Emitir DTE
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
