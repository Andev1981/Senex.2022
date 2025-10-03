import React, { useMemo, useState, useEffect } from "react";
import {
  Users,
  UserPlus,
  UserCog,
  Search,
  Filter,
  ChevronRight,
  ChevronLeft,
  Phone,
  Mail,
  Building2,
  Stethoscope,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Calendar,
  Percent,
  Edit,
  Power,
  Shield,
  Plus,
  UserMinus,
  Save,
} from "lucide-react";
import { Head } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";

/**
 * Gestión de Doctores / Kinesiólogos (JavaScript)
 * - Listado con filtros, KPIs, paginación
 * - Ficha lateral con: comisiones **por tratamiento** (monto fijo o %) + disponibilidad + roles + asignación de pacientes
 * - Datos mock listos para conectar con tu API
 */

// Helpers
const fmtCLP = (v) =>
  typeof v === "number"
    ? v.toLocaleString("es-CL", {
        style: "currency",
        currency: "CLP",
        maximumFractionDigits: 0,
      })
    : "-";

const statusPill = (status) =>
  status === "Activo"
    ? "bg-emerald-100 text-emerald-700"
    : status === "Suspendido"
    ? "bg-red-100 text-red-700"
    : "bg-gray-100 text-gray-700";

const avg = (arr) =>
  arr.length ? Math.round(arr.reduce((a, b) => a + b, 0) / arr.length) : 0;

// Catálogo de tratamientos (mock)
const TREATMENTS = [
  { id: 1, name: "Evaluación Inicial" },
  { id: 2, name: "Terapia Lumbar" },
  { id: 3, name: "Rehabilitación Hombro" },
  { id: 4, name: "Control Rodilla" },
  { id: 5, name: "Sesión Cervical" },
];

// MOCK DATA doctores con reglas por tratamiento
const MOCK_DOCTORS = [
  {
    id: 1,
    name: "Dr. Juan Pérez",
    rut: "12.345.678-9",
    phone: "+56 9 5555 1111",
    email: "juan.perez@clinica.cl",
    branch: "Providencia",
    specialty: "Traumatología",
    status: "Activo",
    // Mantengo un valor de resumen para mostrar en la tabla (opcional)
    commission: { type: "Porcentaje", value: 60 },
    // Reglas por tratamiento: Fijo (CLP) o Porcentaje (%)
    commissionRules: [
      { treatmentId: 1, type: "Fijo", value: 20000 },
      { treatmentId: 3, type: "Porcentaje", value: 55 },
    ],
    sessionsMonth: 48,
    revenueMonth: 2400000,
    availability: ["Lun", "Mar", "Jue"],
    roles: ["doctor", "prescriptor"],
  },
  {
    id: 2,
    name: "Kine Daniela Ríos",
    rut: "16.789.123-4",
    phone: "+56 9 2222 3333",
    email: "daniela.rios@clinica.cl",
    branch: "Providencia",
    specialty: "Kinesiología",
    status: "Activo",
    commission: { type: "Porcentaje", value: 50 },
    commissionRules: [
      { treatmentId: 2, type: "Fijo", value: 15000 },
      { treatmentId: 5, type: "Fijo", value: 12000 },
    ],
    sessionsMonth: 62,
    revenueMonth: 1860000,
    availability: ["Lun", "Mie", "Vie"],
    roles: ["kinesiologo"],
  },
  {
    id: 3,
    name: "Dra. Camila Soto",
    rut: "13.222.444-6",
    phone: "+56 9 9999 0000",
    email: "camila.soto@clinica.cl",
    branch: "Ñuñoa",
    specialty: "Fisiatría",
    status: "Inactivo",
    commission: { type: "Fijo", value: 15000 },
    commissionRules: [],
    sessionsMonth: 0,
    revenueMonth: 0,
    availability: ["Mar", "Jue"],
    roles: ["doctor"],
  },
  {
    id: 4,
    name: "Kine Rodrigo Mella",
    rut: "15.111.222-3",
    phone: "+56 9 1212 3434",
    email: "rodrigo.mella@clinica.cl",
    branch: "La Reina",
    specialty: "Kinesiología Deportiva",
    status: "Activo",
    commission: { type: "Porcentaje", value: 55 },
    commissionRules: [{ treatmentId: 4, type: "Porcentaje", value: 50 }],
    sessionsMonth: 37,
    revenueMonth: 1110000,
    availability: ["Mar", "Jue", "Sab"],
    roles: ["kinesiologo"],
  },
];

const MOCK_PATIENTS = [
  {
    id: 101,
    name: "María González",
    rut: "12.345.678-9",
    phone: "+56 9 8765 4321",
    status: "Activo",
  },
  {
    id: 102,
    name: "Carlos Ramírez",
    rut: "11.222.333-4",
    phone: "+56 9 1111 2222",
    status: "Activo",
  },
  {
    id: 103,
    name: "Ana Martínez",
    rut: "9.876.543-2",
    phone: "+56 9 2222 1111",
    status: "Activo",
  },
  {
    id: 104,
    name: "Pedro Soto",
    rut: "7.654.321-0",
    phone: "+56 9 4444 5555",
    status: "Activo",
  },
  {
    id: 105,
    name: "Laura Díaz",
    rut: "8.765.432-1",
    phone: "+56 9 3333 2222",
    status: "Activo",
  },
  {
    id: 106,
    name: "Diego Torres",
    rut: "18.567.890-1",
    phone: "+56 9 1234 5678",
    status: "Finalizado",
  },
  {
    id: 107,
    name: "Carmen Silva",
    rut: "16.789.012-3",
    phone: "+56 9 8765 0000",
    status: "Activo",
  },
];

export default function GestionDoctores() {
  // Estado principal de doctores (para poder editar)
  const [doctors, setDoctors] = useState(MOCK_DOCTORS);

  const [query, setQuery] = useState("");
  const [branch, setBranch] = useState("Todas");
  const [specialty, setSpecialty] = useState("Todas");
  const [status, setStatus] = useState("Todos");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState(null);
  const pageSize = 5;
  const branches = ["Todas", "Providencia", "Ñuñoa", "La Reina"];
  const specialties = [
    "Todas",
    "Kinesiología",
    "Kinesiología Deportiva",
    "Fisiatría",
    "Traumatología",
  ];

  // Asignación de pacientes: estado por doctor
  const [assignedByDoctor, setAssignedByDoctor] = useState({
    1: [101, 104],
    2: [102, 105],
    3: [],
    4: [107],
  });
  const [patientQuery, setPatientQuery] = useState("");

  // Editor de comisiones por tratamiento
  const [isEditingCommission, setIsEditingCommission] = useState(false);
  const [commissionDraft, setCommissionDraft] = useState({}); // { [treatmentId]: { type, value } }

  // Inicializa draft cuando entro a editar o cambio de seleccionado
  useEffect(() => {
    if (!selected) return;
    const map = {};
    (selected.commissionRules || []).forEach((r) => {
      map[r.treatmentId] = { type: r.type, value: String(r.value) };
    });
    setCommissionDraft(map);
    setIsEditingCommission(false);
  }, [selected]);

  const setDraft = (treatmentId, field, value) => {
    setCommissionDraft((prev) => ({
      ...prev,
      [treatmentId]: {
        ...(prev[treatmentId] || { type: "Fijo", value: "" }),
        [field]: value,
      },
    }));
  };

  const saveCommissionRules = () => {
    if (!selected) return;
    // Normaliza valores a número entero
    const rules = Object.entries(commissionDraft)
      .filter(([_, v]) => v && v.value !== "")
      .map(([treatmentId, v]) => ({
        treatmentId: Number(treatmentId),
        type: v.type === "Porcentaje" ? "Porcentaje" : "Fijo",
        value: Math.max(
          0,
          Math.round(Number(String(v.value).replace(/[^0-9]/g, "")))
        ),
      }));

    // Actualiza en lista de doctores
    setDoctors((prev) =>
      prev.map((d) =>
        d.id === selected.id ? { ...d, commissionRules: rules } : d
      )
    );
    // Actualiza en seleccionado
    setSelected((prev) => ({ ...prev, commissionRules: rules }));
    setIsEditingCommission(false);
    // TODO: POST/PUT a tu API: /doctors/{id}/commission-rules
  };

  // Derivados y KPIs
  const filtrados = useMemo(() => {
    return doctors.filter(
      (d) =>
        (branch === "Todas" || d.branch === branch) &&
        (specialty === "Todas" || d.specialty === specialty) &&
        (status === "Todos" || d.status === status) &&
        (query.trim().length === 0 ||
          [d.name, d.email, d.phone, d.rut, d.specialty, d.branch]
            .join(" ")
            .toLowerCase()
            .includes(query.toLowerCase()))
    );
  }, [doctors, branch, specialty, status, query]);

  const totalPages = Math.max(1, Math.ceil(filtrados.length / pageSize));
  const paged = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filtrados.slice(start, start + pageSize);
  }, [filtrados, page]);

  const kpis = useMemo(() => {
    const actives = filtrados.filter((d) => d.status === "Activo");
    const inactives = filtrados.filter((d) => d.status !== "Activo");
    const commissions = actives.map((d) =>
      d.commission?.type === "Porcentaje" ? d.commission.value : 0
    );
    const avgCommission = avg(commissions);
    const sessions = filtrados.reduce((a, d) => a + d.sessionsMonth, 0);
    const revenue = filtrados.reduce((a, d) => a + d.revenueMonth, 0);
    return {
      total: filtrados.length,
      actives: actives.length,
      inactives: inactives.length,
      avgCommission,
      sessions,
      revenue,
    };
  }, [filtrados]);

  // Derivados de asignación
  const assignedPatientsFor = (doctorId) => {
    const ids = assignedByDoctor[doctorId] || [];
    return ids
      .map((id) => MOCK_PATIENTS.find((p) => p.id === id))
      .filter(Boolean);
  };

  const availablePatients = useMemo(() => {
    if (!selected) return [];
    const assignedIds = new Set(assignedByDoctor[selected.id] || []);
    return MOCK_PATIENTS.filter(
      (p) =>
        !assignedIds.has(p.id) &&
        (patientQuery.trim().length === 0 ||
          [p.name, p.rut, p.phone, p.status]
            .join(" ")
            .toLowerCase()
            .includes(patientQuery.toLowerCase()))
    );
  }, [selected, patientQuery, assignedByDoctor]);

  // Acciones (placeholder para integrar con tu backend)
  const createDoctor = () => alert("Crear/Invitar doctor (placeholder)");
  const editDoctor = (d) => alert(`Editar ${d.name} (placeholder)`);
  const toggleActive = (d) =>
    alert(
      `${d.status === "Activo" ? "Suspender" : "Activar"} ${
        d.name
      } (placeholder)`
    );
  const setCommission = (d) => {
    setSelected(d);
    setIsEditingCommission(true);
  };
  const assignRole = (d) =>
    alert(`Asignar rol/permisos a ${d.name} (placeholder)`);

  const assignPatient = (doctorId, patientId) => {
    setAssignedByDoctor((prev) => {
      const list = new Set([...(prev[doctorId] || []), patientId]);
      // TODO: llamar API POST /doctors/{id}/patients
      return { ...prev, [doctorId]: Array.from(list) };
    });
  };

  const unassignPatient = (doctorId, patientId) => {
    setAssignedByDoctor((prev) => {
      const list = (prev[doctorId] || []).filter((id) => id !== patientId);
      // TODO: llamar API DELETE /doctors/{id}/patients/{patientId}
      return { ...prev, [doctorId]: list };
    });
  };

  // Utils comisión: obtiene draft o valor actual para una fila
  const getRuleFor = (treatmentId) => {
    const fromDraft = commissionDraft[treatmentId];
    if (fromDraft) return fromDraft;
    const existing = (selected?.commissionRules || []).find(
      (r) => r.treatmentId === treatmentId
    );
    if (existing) return { type: existing.type, value: String(existing.value) };
    return { type: "Fijo", value: "" };
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
                <Stethoscope className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Kinesiólogos
                </h1>
                <p className="text-sm text-gray-600">
                  Gestión de kinesiólogos registrados
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => alert("Nuevo paciente")}
                className="flex items-center gap-2 px-6 py-2 font-semibold text-white transition-colors bg-blue-600 rounded-lg shadow-lg hover:bg-blue-700 shadow-blue-500/30"
              >
                <Plus className="w-4 h-4" />
                Nuevo Paciente
              </button>
            </div>
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 gap-4 mb-6 md:grid-cols-2 lg:grid-cols-4">
          <div className="p-5 bg-white border border-gray-200 shadow-sm rounded-xl">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600">
                <Users className="w-5 h-5 text-white" />
              </div>
            </div>
            <p className="text-sm text-gray-600">Profesionales</p>
            <p className="text-3xl font-bold text-gray-900">{kpis.total}</p>
          </div>
          <div className="p-5 bg-white border border-gray-200 shadow-sm rounded-xl">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600">
                <CheckCircle2 className="w-5 h-5 text-white" />
              </div>
            </div>
            <p className="text-sm text-gray-600">Activos</p>
            <p className="text-3xl font-bold text-gray-900">{kpis.actives}</p>
          </div>
          <div className="p-5 bg-white border border-gray-200 shadow-sm rounded-xl">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-gray-400 to-gray-500">
                <AlertCircle className="w-5 h-5 text-white" />
              </div>
            </div>
            <p className="text-sm text-gray-600">Inactivos/Suspendidos</p>
            <p className="text-3xl font-bold text-gray-900">{kpis.inactives}</p>
          </div>
          <div className="p-5 bg-white border border-gray-200 shadow-sm rounded-xl">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600">
                <Percent className="w-5 h-5 text-white" />
              </div>
            </div>
            <p className="text-sm text-gray-600">Comisión promedio</p>
            <p className="text-3xl font-bold text-gray-900">
              {kpis.avgCommission}%
            </p>
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
                placeholder="Buscar por nombre, RUT, correo, fono, especialidad..."
                className="w-full text-sm outline-none"
              />
            </div>
            <div className="flex items-center gap-2">
              <select
                value={branch}
                onChange={(e) => setBranch(e.target.value)}
                className="px-3 py-2 text-sm font-medium border-2 border-gray-200 rounded-lg"
              >
                {[
                  "Todas",
                  ...Array.from(new Set(doctors.map((d) => d.branch))),
                ].map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
              <select
                value={specialty}
                onChange={(e) => setSpecialty(e.target.value)}
                className="px-3 py-2 text-sm font-medium border-2 border-gray-200 rounded-lg"
              >
                {[
                  "Todas",
                  ...Array.from(new Set(doctors.map((d) => d.specialty))),
                ].map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="px-3 py-2 text-sm font-medium border-2 border-gray-200 rounded-lg"
              >
                <option>Todos</option>
                <option>Activo</option>
                <option>Inactivo</option>
                <option>Suspendido</option>
              </select>
              <button className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium border-2 border-gray-200 rounded-lg hover:bg-gray-50">
                <Filter className="w-4 h-4" /> Más filtros
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Tabla */}
          <div className="bg-white border border-gray-200 shadow-sm lg:col-span-2 rounded-xl">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h2 className="flex items-center gap-2 text-lg font-bold text-gray-900">
                <UserCog className="w-5 h-5 text-blue-600" /> Doctores/Kines
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
                      Profesional
                    </th>
                    <th className="px-4 py-3 text-xs font-bold text-gray-600 uppercase">
                      Sucursal
                    </th>
                    <th className="px-4 py-3 text-xs font-bold text-gray-600 uppercase">
                      Especialidad
                    </th>
                    <th className="px-4 py-3 text-xs font-bold text-gray-600 uppercase">
                      Estado
                    </th>
                    <th className="px-4 py-3 text-xs font-bold text-gray-600 uppercase">
                      Comisión
                    </th>
                    <th className="px-4 py-3 text-xs font-bold text-gray-600 uppercase">
                      Sesiones (mes)
                    </th>
                    <th className="px-4 py-3 text-xs font-bold text-gray-600 uppercase">
                      Ingresos (mes)
                    </th>
                    <th className="px-4 py-3 text-xs font-bold text-center text-gray-600 uppercase">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {paged.map((d) => (
                    <tr
                      key={d.id}
                      className="transition-colors hover:bg-gray-50"
                    >
                      <td className="px-4 py-3 text-sm text-gray-700">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center justify-center font-bold text-white rounded-lg w-9 h-9 bg-gradient-to-br from-blue-500 to-blue-600">
                            {d.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-gray-900 truncate">
                              {d.name}
                            </p>
                            <p className="flex items-center gap-3 text-xs text-gray-500 truncate">
                              <span className="inline-flex items-center gap-1">
                                <Phone className="w-3 h-3" />
                                {d.phone}
                              </span>
                              <span className="inline-flex items-center gap-1">
                                <Mail className="w-3 h-3" />
                                {d.email}
                              </span>
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        <span className="inline-flex items-center gap-1">
                          <Building2 className="w-4 h-4 text-gray-400" />
                          {d.branch}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        <span className="inline-flex items-center gap-1">
                          <Stethoscope className="w-4 h-4 text-gray-400" />
                          {d.specialty}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${statusPill(
                            d.status
                          )}`}
                        >
                          {d.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap">
                        {d.commission?.type === "Porcentaje"
                          ? `${d.commission.value}%`
                          : fmtCLP(d.commission?.value)}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        {d.sessionsMonth}
                      </td>
                      <td className="px-4 py-3 text-sm font-semibold text-gray-900">
                        {fmtCLP(d.revenueMonth)}
                      </td>
                      <td className="px-4 py-2">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => setSelected(d)}
                            className="px-3 py-1.5 rounded-lg text-xs font-semibold border-2 border-blue-200 text-blue-700 hover:bg-blue-50"
                          >
                            Ficha
                          </button>
                          <button
                            onClick={() => setCommission(d)}
                            className="px-3 py-1.5 rounded-lg text-xs font-semibold border-2 border-purple-200 text-purple-700 hover:bg-purple-50"
                          >
                            Comisión
                          </button>
                          <button
                            onClick={() => assignRole(d)}
                            className="px-3 py-1.5 rounded-lg text-xs font-semibold border-2 border-amber-200 text-amber-700 hover:bg-amber-50"
                          >
                            Roles
                          </button>
                          <button
                            onClick={() => editDoctor(d)}
                            className="p-2 rounded-lg hover:bg-gray-100"
                            title="Editar"
                          >
                            <Edit className="w-4 h-4 text-gray-400" />
                          </button>
                          <button
                            onClick={() => toggleActive(d)}
                            className="p-2 rounded-lg hover:bg-gray-100"
                            title="(Des)activar"
                          >
                            <Power className="w-4 h-4 text-gray-400" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
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

          {/* Panel lateral: Ficha del profesional */}
          <div className="p-5 bg-white border border-gray-200 shadow-sm rounded-xl">
            <h3 className="flex items-center gap-2 mb-4 text-lg font-bold text-gray-900">
              <UserCog className="w-5 h-5 text-blue-600" /> Ficha del
              Profesional
            </h3>

            {!selected ? (
              <div className="p-6 text-center text-gray-500 border-2 border-gray-200 border-dashed rounded-lg">
                Selecciona un profesional para ver su detalle.
              </div>
            ) : (
              <div>
                <div className="flex items-start gap-3">
                  <div className="flex items-center justify-center w-12 h-12 font-bold text-white rounded-xl bg-gradient-to-br from-blue-500 to-blue-600">
                    {selected.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-bold text-gray-900">
                          {selected.name}
                        </p>
                        <p className="text-sm text-gray-500">
                          {selected.specialty} — {selected.branch}
                        </p>
                      </div>
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${statusPill(
                          selected.status
                        )}`}
                      >
                        {selected.status}
                      </span>
                    </div>
                    <div className="grid grid-cols-1 gap-1 mt-2 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-gray-400" />
                        {selected.phone}
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-gray-400" />
                        {selected.email}
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        Disponibilidad: {selected.availability.join(", ")}
                      </div>
                    </div>
                  </div>
                </div>

                {/* KPIs personales */}
                <div className="grid grid-cols-3 gap-3 mt-4">
                  <div className="p-3 text-center border border-gray-200 rounded-lg bg-gray-50">
                    <p className="text-xs text-gray-600">Sesiones mes</p>
                    <p className="text-xl font-bold">
                      {selected.sessionsMonth}
                    </p>
                  </div>
                  <div className="p-3 text-center border border-gray-200 rounded-lg bg-gray-50">
                    <p className="text-xs text-gray-600">Ingresos mes</p>
                    <p className="text-xl font-bold">
                      {fmtCLP(selected.revenueMonth)}
                    </p>
                  </div>
                  <div className="p-3 text-center border border-gray-200 rounded-lg bg-gray-50">
                    <p className="text-xs text-gray-600">Reglas comisión</p>
                    <p className="text-xl font-bold">
                      {selected.commissionRules?.length || 0}
                    </p>
                  </div>
                </div>

                {/* Comisiones por tratamiento */}
                <div className="mt-6 border border-gray-200 rounded-lg">
                  <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200">
                    <div className="flex items-center gap-2 font-semibold text-gray-900">
                      <Percent className="w-4 h-4 text-purple-600" /> Estructura
                      de comisión por tratamiento
                    </div>
                    {!isEditingCommission ? (
                      <button
                        onClick={() => setIsEditingCommission(true)}
                        className="text-sm px-3 py-1.5 rounded-lg border-2 border-purple-200 text-purple-700 hover:bg-purple-50"
                      >
                        Editar
                      </button>
                    ) : (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={saveCommissionRules}
                          className="inline-flex items-center gap-2 text-sm px-3 py-1.5 rounded-lg border-2 border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                        >
                          <Save className="w-4 h-4" />
                          Guardar
                        </button>
                        <button
                          onClick={() => {
                            setIsEditingCommission(false);
                            setCommissionDraft({});
                          }}
                          className="text-sm px-3 py-1.5 rounded-lg border-2 border-gray-200 text-gray-700 hover:bg-gray-50"
                        >
                          Cancelar
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="p-4">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="text-left border-b-2 border-gray-200">
                            <th className="px-3 py-2 text-xs font-bold text-gray-600 uppercase">
                              Tratamiento
                            </th>
                            <th className="px-3 py-2 text-xs font-bold text-gray-600 uppercase">
                              Tipo
                            </th>
                            <th className="px-3 py-2 text-xs font-bold text-gray-600 uppercase">
                              Valor
                            </th>
                            <th className="px-3 py-2 text-xs font-bold text-gray-600 uppercase">
                              Ejemplo
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {TREATMENTS.map((t) => {
                            const rule = getRuleFor(t.id);
                            const example =
                              rule.type === "Porcentaje"
                                ? `${rule.value || 0}% de $25.000`
                                : fmtCLP(Number(rule.value || 0));
                            return (
                              <tr key={t.id}>
                                <td className="px-3 py-2 text-sm text-gray-800">
                                  {t.name}
                                </td>
                                <td className="px-3 py-2 text-sm">
                                  {isEditingCommission ? (
                                    <select
                                      value={rule.type}
                                      onChange={(e) =>
                                        setDraft(t.id, "type", e.target.value)
                                      }
                                      className="px-2 py-1 text-sm border-2 border-gray-200 rounded-lg"
                                    >
                                      <option value="Fijo">Fijo</option>
                                      <option value="Porcentaje">
                                        Porcentaje
                                      </option>
                                    </select>
                                  ) : (
                                    <span className="text-gray-700">
                                      {rule.type}
                                    </span>
                                  )}
                                </td>
                                <td className="px-3 py-2 text-sm">
                                  {isEditingCommission ? (
                                    <input
                                      value={rule.value}
                                      onChange={(e) =>
                                        setDraft(t.id, "value", e.target.value)
                                      }
                                      placeholder={
                                        rule.type === "Porcentaje" ? "%" : "$"
                                      }
                                      className="w-32 px-2 py-1 text-sm border-2 border-gray-200 rounded-lg"
                                    />
                                  ) : (
                                    <span className="text-gray-800">
                                      {rule.type === "Porcentaje"
                                        ? `${rule.value || 0}%`
                                        : fmtCLP(Number(rule.value || 0))}
                                    </span>
                                  )}
                                </td>
                                <td className="px-3 py-2 text-xs text-gray-500">
                                  {example}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                    <p className="mt-3 text-xs text-gray-500">
                      * Valor fijo en CLP por sesión del tratamiento; porcentaje
                      aplicado sobre el ingreso bruto de la sesión.
                    </p>
                  </div>
                </div>

                {/* Roles & permisos */}
                <div className="mt-6 border border-gray-200 rounded-lg">
                  <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200">
                    <div className="flex items-center gap-2 font-semibold text-gray-900">
                      <Shield className="w-4 h-4 text-amber-600" /> Roles &
                      permisos
                    </div>
                    <button
                      onClick={() => assignRole(selected)}
                      className="text-sm px-3 py-1.5 rounded-lg border-2 border-amber-200 text-amber-700 hover:bg-amber-50"
                    >
                      Gestionar
                    </button>
                  </div>
                  <div className="p-4 text-sm text-gray-700">
                    <p className="mb-1">
                      <strong>Roles:</strong> {selected.roles.join(", ")}
                    </p>
                    <p className="text-xs text-gray-500">
                      Integra tu módulo de **roles y permisos**
                      (spatie/laravel-permission). Desde aquí puedes
                      asignar/retirar roles.
                    </p>
                  </div>
                </div>

                {/* Asignación de Pacientes */}
                <div className="mt-6 border border-gray-200 rounded-lg">
                  <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200">
                    <div className="flex items-center gap-2 font-semibold text-gray-900">
                      <Users className="w-4 h-4 text-blue-600" /> Pacientes
                      asignados
                    </div>
                  </div>

                  <div className="p-4 space-y-3">
                    {assignedPatientsFor(selected.id).length === 0 ? (
                      <div className="text-sm text-gray-500">
                        Aún no hay pacientes asignados a este profesional.
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {assignedPatientsFor(selected.id).map((p) => (
                          <div
                            key={p.id}
                            className="flex items-center justify-between gap-2 p-2 border border-gray-200 rounded-lg"
                          >
                            <div className="min-w-0">
                              <p className="text-sm font-semibold text-gray-900 truncate">
                                {p.name}
                              </p>
                              <p className="text-xs text-gray-500 truncate">
                                {p.rut} · {p.phone}
                              </p>
                            </div>
                            <button
                              onClick={() => unassignPatient(selected.id, p.id)}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold border-2 border-red-200 text-red-700 hover:bg-red-50"
                            >
                              <UserMinus className="w-3.5 h-3.5" /> Quitar
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Buscador para asignar */}
                    <div className="mt-4">
                      <label className="text-xs font-bold text-gray-700">
                        Asignar nuevo paciente
                      </label>
                      <div className="flex items-center gap-2 px-3 py-2 mt-2 border-2 border-gray-200 rounded-lg focus-within:border-blue-500">
                        <Search className="w-4 h-4 text-gray-400" />
                        <input
                          value={patientQuery}
                          onChange={(e) => setPatientQuery(e.target.value)}
                          placeholder="Buscar por nombre, RUT, fono..."
                          className="w-full text-sm outline-none"
                        />
                      </div>
                      <div className="mt-3 space-y-2 overflow-auto max-h-48">
                        {availablePatients.length === 0 ? (
                          <div className="text-xs text-gray-500">
                            Sin resultados disponibles.
                          </div>
                        ) : (
                          availablePatients.map((p) => (
                            <div
                              key={p.id}
                              className="flex items-center justify-between gap-2 p-2 border border-gray-200 rounded-lg"
                            >
                              <div className="min-w-0">
                                <p className="text-sm font-semibold text-gray-900 truncate">
                                  {p.name}
                                </p>
                                <p className="text-xs text-gray-500 truncate">
                                  {p.rut} · {p.phone}
                                </p>
                              </div>
                              <button
                                onClick={() => assignPatient(selected.id, p.id)}
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold border-2 border-blue-200 text-blue-700 hover:bg-blue-50"
                              >
                                <UserPlus className="w-3.5 h-3.5" /> Asignar
                              </button>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Acciones */}
                <div className="grid grid-cols-2 gap-2 mt-6">
                  <button
                    onClick={() => editDoctor(selected)}
                    className="px-3 py-2 text-xs font-semibold text-gray-700 border-2 border-gray-200 rounded-lg hover:bg-gray-50"
                  >
                    Editar datos
                  </button>
                  <button
                    onClick={() => toggleActive(selected)}
                    className="px-3 py-2 text-xs font-semibold text-red-700 border-2 border-red-200 rounded-lg hover:bg-red-50"
                  >
                    {selected.status === "Activo" ? "Suspender" : "Activar"}
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
