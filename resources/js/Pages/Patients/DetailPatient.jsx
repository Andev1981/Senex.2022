import React, { useEffect, useMemo, useState, lazy, Suspense } from "react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, useForm, router, useRemember } from "@inertiajs/react";
import { route } from "ziggy-js";
import {
  User,
  Activity,
  DollarSign,
  FileText,
  ChevronLeft,
  Plus,
  Clipboard,
  Target,
  Repeat,
  CreditCard,
  CheckCircle,
  Clock,
} from "lucide-react";
import Modal from "@/Components/Modal";
import PatientCard from "./Partials/PatientCard";
import { clp } from "@/utils/utils";
import { PATIENT_STATUS_TRANSITIONS } from "@/utils/status";
import ResourceFormModal from "../../Components/ResourceFormModal";
import IndexSessions from "./Sessions/IndexSessions";

// 👉 Lazy load por pestaña (mejor TTI)
const IndexGeneral = lazy(() => import("./General/IndexGeneral"));
const IndexHistorial = lazy(() => import("./Historial/IndexHistorial"));
const IndexTreatments = lazy(() => import("./Treatments/IndexTreatments"));

const canTransition = (from, to) =>
  PATIENT_STATUS_TRANSITIONS[from]?.includes(to);

/** Hook: sincroniza pestaña con ?tab= y recuerda entre visitas */
function useSyncedTab(defaultTab = "general") {
  const initial =
    new URLSearchParams(window.location.search).get("tab") || defaultTab;
  const [activeTab, setActiveTab] = useRemember(initial, "patient.activeTab");

  useEffect(() => {
    const sp = new URLSearchParams(window.location.search);
    sp.set("tab", activeTab);
    window.history.replaceState({}, "", `?${sp.toString()}`);
  }, [activeTab]);

  return [activeTab, setActiveTab];
}

/**
 * Componente principal: DetailPatient (refactor dinámico)
 */
export default function DetailPatient({
  patient,
  payments = [],
  sessions = [],
  session_types = [],
  treatments = [],
  treatment: defaultTreatment,
  doctors = [],
  communes = [],
  regions = [],
  provinces = [],
}) {
  const { get } = useForm();
  const [activeTab, setActiveTab] = useSyncedTab("general");

  // Modales genéricos (creación/edición)
  const [openTreatmentModal, setOpenTreatmentModal] = useState(false);
  const [editingTreatment, setEditingTreatment] = useState(null);

  const [openSessionModal, setOpenSessionModal] = useState(false);
  const [openPaymentModal, setOpenPaymentModal] = useState(false);
  const [openDocumentModal, setOpenDocumentModal] = useState(false);
  const [openPatientModal, setOpenPatientModal] = useState(false);

  const totalPaid = useMemo(
    () =>
      payments
        .filter((p) => p.status === "Pagado")
        .reduce((s, p) => s + (p.amount || 0), 0),
    [payments]
  );
  const totalPending = useMemo(
    () =>
      payments
        .filter((p) => p.status === "Pendiente")
        .reduce((s, p) => s + (p.amount || 0), 0),
    [payments]
  );

  const tabs = [
    { id: "general", label: "Información General", icon: User },
    { id: "history", label: "Historial Clínico", icon: Activity },
    { id: "treatments", label: "Tratamientos", icon: Target },
    { id: "sessions", label: "Sesiones", icon: Clipboard },
    { id: "exercises", label: "Ejercicios", icon: Repeat },
    { id: "payments", label: "Pagos", icon: DollarSign },
    { id: "documents", label: "Documentos", icon: FileText },
  ];

  const handleBack = () => {
    get(route("pacientes"));
  };

  /** Acciones: estado del paciente */
  const changePatientStatus = (to) => {
    if (!canTransition(patient.status, to)) return;
    const reason =
      window.prompt(`Motivo para cambiar a "${to}" (opcional):`) || null;
    router.patch(
      route("patients.status", patient.id),
      { status: to, reason },
      {
        preserveScroll: true,
        onSuccess: () =>
          router.reload({ only: ["patient"], preserveScroll: true }),
      }
    );
  };

  /** Esquemas para formularios genéricos */
  const treatmentSchema = useMemo(
    () => [
      { name: "name", label: "Nombre", type: "text", required: true },
      {
        name: "doctor_id",
        label: "Kinesiólogo",
        type: "select",
        options: doctors.map((d) => ({ value: d.id, label: d.name })),
      },
      { name: "start_date", label: "Inicio", type: "date" },
      {
        name: "goal",
        label: "Objetivo",
        type: "textarea",
        rows: 3,
        colSpan: 2,
      },
    ],
    [doctors]
  );

  const patientSchema = useMemo(
    () => [
      { name: "name", label: "Nombre", type: "text", required: true },
      { name: "last_name", label: "Apellido", type: "text", required: true },

      {
        name: "rut",
        label: "RUT",
        type: "rut",
        help: "Sin puntos, con guion y DV. Ej: 12345678-9",
        required: true,
      },

      {
        name: "email",
        label: "Email",
        type: "email",
        placeholder: "persona@correo.cl",
        required: true,
      },
      {
        name: "phone",
        label: "Teléfono",
        type: "tel",
        placeholder: "+56 9 1234 5678",
        help: "Ej: +56 9 1234 5678",
      },
      {
        name: "birth_date",
        label: "Fecha de nacimiento",
        type: "date",
        min: "1900-01-01",
        max: "today",
      },
      {
        name: "gender",
        label: "Género",
        type: "select",
        options: [
          { value: "male", label: "Masculino" },
          { value: "female", label: "Femenino" },
          { value: "other", label: "Otro" },
          { value: "unknown", label: "No especifica" },
        ],
      },

      { name: "occupation", label: "Ocupación", type: "text" },

      {
        name: "marital_status",
        label: "Estado civil",
        type: "select",
        options: [
          { value: "", label: "—" },
          { value: "single", label: "Soltero/a" },
          { value: "married", label: "Casado/a" },
          { value: "divorced", label: "Divorciado/a" },
          { value: "widowed", label: "Viudo/a" },
          { value: "cohabiting", label: "Conviviente" },
        ],
      },

      {
        name: "status",
        label: "Estado",
        type: "select",
        options: [
          { value: "active", label: "Activo" },
          { value: "suspended", label: "Suspendido" },
          { value: "cancelled", label: "Cancelado" },
        ],
      },
      {
        name: "status_reason",
        label: "Motivo del estado",
        type: "textarea",
        rows: 3,
        colSpan: 2,
        visibleIf: (data) => ["suspended", "cancelled"].includes(data.status),
        help: "Se guardará en auditoría de cambios.",
      },

      { name: "notes", label: "Notas", type: "textarea", rows: 4, colSpan: 3 },
    ],
    [patient]
  );

  const sessionSchema = useMemo(
    () => [
      {
        name: "treatment_id",
        label: "Tratamiento",
        type: "select",
        required: true,
        options: treatments.map((t) => ({ value: t.id, label: t.name })),
      },
      {
        name: "doctor_id",
        label: "Kinesiólogo",
        type: "select",
        options: doctors.map((d) => ({ value: d.id, label: d.name })),
      },
      {
        name: "session_type_id",
        label: "Tipo de Sesión",
        type: "select",
        options: session_types.map((s) => ({ value: s.id, label: s.name })),
      },
      { name: "date", label: "Fecha", type: "date", required: true },
      { name: "time", label: "Hora", type: "time" },
      { name: "duration", label: "Duración (min)", type: "number" },
      {
        name: "status",
        label: "Estado",
        type: "select",
        options: [
          { value: "Programada", label: "Programada" },
          { value: "Completada", label: "Completada" },
        ],
      },
      { name: "pain_before", label: "Dolor Inicial (0-10)", type: "number" },
      { name: "pain_after", label: "Dolor Final (0-10)", type: "number" },
      { name: "notes", label: "Notas", type: "textarea", rows: 3 },
    ],
    [doctors, treatments, session_types]
  );

  const paymentSchema = useMemo(
    () => [
      { name: "date", label: "Fecha", type: "date", required: true },
      { name: "concept", label: "Concepto", type: "text", required: true },
      { name: "invoice", label: "Documento (boleta/factura)", type: "text" },
      { name: "copay", label: "Copago", type: "number" },
      { name: "insuranceCovered", label: "Isapre/Fonasa", type: "number" },
      { name: "amount", label: "Total", type: "number", required: true },
      {
        name: "paymentMethod",
        label: "Método",
        type: "select",
        options: [
          { value: "Efectivo", label: "Efectivo" },
          { value: "Débito", label: "Débito" },
          { value: "Crédito", label: "Crédito" },
          { value: "Transferencia", label: "Transferencia" },
          { value: "WebPay", label: "WebPay" },
        ],
      },
      {
        name: "status",
        label: "Estado",
        type: "select",
        options: [
          { value: "Pagado", label: "Pagado" },
          { value: "Pendiente", label: "Pendiente" },
        ],
      },
    ],
    []
  );

  const documentSchema = useMemo(
    () => [
      { name: "name", label: "Nombre", type: "text", required: true },
      {
        name: "category",
        label: "Categoría",
        type: "select",
        options: [
          { value: "Evolución", label: "Evolución" },
          { value: "Examen", label: "Examen" },
          { value: "Derivación", label: "Derivación" },
          { value: "Otro", label: "Otro" },
        ],
      },
      { name: "file", label: "Archivo", type: "file", required: true },
    ],
    []
  );

  // Helpers de recarga parcial
  const reload = (only) => router.reload({ only, preserveScroll: true });

  return (
    <AuthenticatedLayout>
      <Head title={`Paciente: ${patient.name} ${patient.last_name || ""}`} />
      <div className="min-h-screen p-4 bg-gray-100">
        {/* Header / barra superior */}
        <div className="text-white bg-gradient-to-r from-blue-600 to-cyan-600 rounded-xl">
          <div className="px-4 py-6 mx-auto max-w-7xl">
            <button
              onClick={handleBack}
              className="flex items-center gap-2 mb-4 text-white hover:text-teal-100"
            >
              <ChevronLeft className="w-5 h-5" /> Volver a pacientes
            </button>
            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
              <PatientCard
                patient={patient}
                setOpenPatientModal={setOpenPatientModal}
              />
              {/* Acciones de estado */}
              <div className="flex self-start gap-2 pb-2">
                {canTransition(patient.status, "suspended") && (
                  <button
                    onClick={() => changePatientStatus("suspended")}
                    className="px-3 py-2 text-yellow-900 bg-yellow-100 rounded-lg hover:bg-yellow-200"
                  >
                    Suspender
                  </button>
                )}
                {canTransition(patient.status, "active") && (
                  <button
                    onClick={() => changePatientStatus("active")}
                    className="px-3 py-2 text-green-900 bg-green-100 rounded-lg hover:bg-green-200"
                  >
                    Activar
                  </button>
                )}
                {canTransition(patient.status, "cancelled") && (
                  <button
                    onClick={() => changePatientStatus("cancelled")}
                    className="px-3 py-2 text-red-900 bg-red-100 rounded-lg hover:bg-red-200"
                  >
                    Cancelar
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="px-4 mx-auto max-w-7xl">
            <div className="flex gap-2 pb-0 -mb-px overflow-x-auto">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-4 py-3 font-medium whitespace-nowrap transition-all border-b-2 ${
                      isActive
                        ? "text-cyan-600 border-white bg-white rounded-t-xl"
                        : "text-teal-100 border-transparent hover:text-white hover:bg-white/5"
                    }`}
                  >
                    <Icon className="w-4 h-4" /> {tab.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Contenido por pestaña */}
        <div className="py-6 mx-auto max-w-7xl">
          <Suspense fallback={<div className="p-6">Cargando…</div>}>
            {activeTab === "general" && <IndexGeneral patient={patient} />}
            {activeTab === "history" && <IndexHistorial patient={patient} />}
            {activeTab === "treatments" && (
              <IndexTreatments
                patient={patient}
                treatments={treatments}
                onCreate={() => {
                  setEditingTreatment(null);
                  setOpenTreatmentModal(true);
                }}
                onEdit={(t) => {
                  setEditingTreatment(t);
                  setOpenTreatmentModal(true);
                }}
              />
            )}

            {activeTab === "sessions" && <IndexSessions patient={patient} />}
          </Suspense>

          {activeTab === "exercises" && (
            <div className="p-6 bg-white shadow-lg rounded-xl">
              <h2 className="flex items-center gap-2 mb-6 text-2xl font-bold text-gray-900">
                <Repeat className="w-6 h-6 text-teal-600" /> Plan de Ejercicios
              </h2>
              {(patient.treatments || [])
                .filter((t) => t.status === "Activo")
                .map((treatment) => (
                  <ExerciseBlock key={treatment.id} treatment={treatment} />
                ))}
            </div>
          )}

          {activeTab === "payments" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <StatCard
                  title="Total Pagado"
                  icon={CheckCircle}
                  className="from-green-500 to-green-600"
                  value={clp.format(totalPaid)}
                />
                <StatCard
                  title="Pendiente"
                  icon={Clock}
                  className="from-orange-500 to-orange-600"
                  value={clp.format(totalPending)}
                />
                <StatCard
                  title="Total"
                  icon={DollarSign}
                  className="from-teal-500 to-teal-600"
                  value={clp.format(totalPaid + totalPending)}
                />
              </div>

              <div className="p-6 bg-white shadow-lg rounded-xl">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="flex items-center gap-2 text-2xl font-bold text-gray-900">
                    <CreditCard className="w-6 h-6 text-teal-600" /> Historial
                    de Pagos
                  </h2>
                  <button
                    onClick={() => setOpenPaymentModal(true)}
                    className="flex items-center gap-2 px-4 py-2 text-white bg-teal-600 rounded-lg hover:bg-teal-700"
                  >
                    <Plus className="w-4 h-4" /> Registrar Pago
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        {[
                          "Fecha",
                          "Concepto",
                          "Documento",
                          "Copago",
                          "Isapre",
                          "Total",
                          "Método",
                          "Estado",
                        ].map((th) => (
                          <th
                            key={th}
                            className={`px-4 py-3 text-xs font-semibold uppercase ${
                              ["Copago", "Isapre", "Total"].includes(th)
                                ? "text-right text-gray-600"
                                : "text-left text-gray-600"
                            }`}
                          >
                            {th}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {payments?.map((payment) => (
                        <tr key={payment.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm text-gray-900">
                            {new Date(payment.date).toLocaleDateString("es-CL")}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900">
                            {payment.concept}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600">
                            {payment.invoice}
                          </td>
                          <td className="px-4 py-3 text-sm text-right text-gray-900">
                            {clp.format(payment.copay || 0)}
                          </td>
                          <td className="px-4 py-3 text-sm text-right text-gray-900">
                            {clp.format(payment.insuranceCovered || 0)}
                          </td>
                          <td className="px-4 py-3 text-sm font-semibold text-right text-gray-900">
                            {clp.format(payment.amount || 0)}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600">
                            {payment.paymentMethod}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span
                              className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                                payment.status === "Pagado"
                                  ? "bg-green-100 text-green-700"
                                  : "bg-orange-100 text-orange-700"
                              }`}
                            >
                              {payment.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === "documents" && (
            <div className="p-6 bg-white shadow-lg rounded-xl">
              <div className="flex items-center justify-between mb-6">
                <h2 className="flex items-center gap-2 text-2xl font-bold text-gray-900">
                  <FileText className="w-6 h-6 text-teal-600" /> Documentos
                  Clínicos
                </h2>
                <button
                  onClick={() => setOpenDocumentModal(true)}
                  className="flex items-center gap-2 px-4 py-2 text-white bg-teal-600 rounded-lg hover:bg-teal-700"
                >
                  <Plus className="w-4 h-4" /> Subir Documento
                </button>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {(patient.documents || []).map((doc) => (
                  <div
                    key={doc.id}
                    className="p-4 transition-all border-2 border-gray-200 rounded-xl hover:border-teal-300 hover:shadow-md"
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex items-center justify-center flex-shrink-0 w-12 h-12 bg-red-100 rounded-lg">
                        <FileText className="w-6 h-6 text-red-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="mb-1 font-semibold text-gray-900 truncate">
                          {doc.name}
                        </h3>
                        <div className="flex items-center gap-2 mb-2 text-xs text-gray-500">
                          <span className="px-2 py-1 bg-gray-100 rounded">
                            {doc.category}
                          </span>
                          <span>{doc.size}</span>
                        </div>
                        <p className="text-xs text-gray-600">
                          {new Date(doc.date).toLocaleDateString("es-CL")}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-4">
                      <a
                        href={doc.url || "#"}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center justify-center flex-1 gap-1 py-2 text-sm font-medium text-teal-600 rounded-lg bg-teal-50 hover:bg-teal-100"
                      >
                        Descargar
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* MODALES genéricos */}
      <ResourceFormModal
        open={openTreatmentModal}
        onClose={() => setOpenTreatmentModal(false)}
        title={editingTreatment ? "Editar Tratamiento" : "Nuevo Tratamiento"}
        description="Para subir documentos"
        schema={treatmentSchema}
        submitRoute={
          editingTreatment
            ? route("treatment_sessions.update", editingTreatment.id)
            : route("treatment_sessions.store", patient.id)
        }
        method={editingTreatment ? "patch" : "post"}
        initialValues={editingTreatment || { patient_id: patient.id }}
        afterSubmitReloadOnly={["treatments"]}
      />

      <ResourceFormModal
        open={openSessionModal}
        onClose={() => setOpenSessionModal(false)}
        title="Registrar Sesión"
        description="Para subir documentos"
        schema={sessionSchema}
        submitRoute={route("treatment_sessions.store", patient.id)}
        method="post"
        initialValues={{ patient_id: patient.id }}
        afterSubmitReloadOnly={["sessions", "patient"]}
      />

      <ResourceFormModal
        open={openPaymentModal}
        onClose={() => setOpenPaymentModal(false)}
        title="Registrar Pago"
        description="Para subir documentos"
        schema={paymentSchema}
        submitRoute={route("payments.store", patient.id)}
        method="post"
        initialValues={{ patient_id: patient.id, status: "Pagado" }}
        afterSubmitReloadOnly={["payments"]}
      />

      <ResourceFormModal
        open={openDocumentModal}
        onClose={() => setOpenDocumentModal(false)}
        title="Subir Documento"
        description="Para subir documentos"
        schema={documentSchema}
        submitRoute={route("patient.documents.store", patient.id)}
        method="post"
        initialValues={{ patient_id: patient.id }}
        afterSubmitReloadOnly={["patient", "documents"]}
      />

      <ResourceFormModal
        open={openPatientModal}
        onClose={() => setOpenPatientModal(false)}
        title="Editar Paciente"
        description="Para subir documentos"
        schema={patientSchema}
        submitRoute={
          patient
            ? route("patients.update", patient.id)
            : route("patients.store")
        }
        method={"patch"}
        initialValues={patient ? patient : {}}
        afterSubmitReloadOnly={["patient", "documents"]}
        columns={3}
        maxWidth={"3xl"}
      />
    </AuthenticatedLayout>
  );
}

/*** UI AUX: tarjetas y bloques ***/
function StatCard({
  title,
  icon: Icon,
  value,
  className = "from-teal-500 to-teal-600",
}) {
  return (
    <div className={`p-6 text-white bg-gradient-to-br ${className} rounded-xl`}>
      <div className="flex items-center gap-3 mb-2">
        <Icon className="w-8 h-8" />
        <h3 className="text-lg font-semibold">{title}</h3>
      </div>
      <p className="text-3xl font-bold">{value}</p>
    </div>
  );
}

function ExerciseBlock({ treatment }) {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between pb-3 mb-4 border-b-2 border-teal-200">
        <div>
          <h3 className="text-lg font-bold text-gray-900">{treatment.name}</h3>
          <p className="text-sm text-gray-600">{treatment.currentPhase}</p>
        </div>
        <button className="flex items-center gap-2 text-teal-600 hover:text-teal-700">
          Ver Todos los Videos
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {(treatment.exercises || []).map((exercise, idx) => (
          <div
            key={idx}
            className="p-4 transition-all border-2 border-gray-200 rounded-xl hover:border-teal-300"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <h4 className="mb-1 font-bold text-gray-900">
                  {exercise.name}
                </h4>
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2 py-1 text-xs font-medium text-teal-700 bg-teal-100 rounded">
                    {exercise.sets}
                  </span>
                  <span className="text-xs text-gray-600">
                    {exercise.frequency}
                  </span>
                </div>
              </div>
              {exercise.video && (
                <button className="p-2 text-teal-600 bg-teal-100 rounded-lg hover:bg-teal-200">
                  ▶
                </button>
              )}
            </div>
            <div className="p-3 text-sm text-gray-600 rounded-lg bg-gray-50">
              <p>Instrucciones detalladas del ejercicio…</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* function MiniStat({ label, value, tone = 0 }) {
  const color =
    tone >= 7
      ? "text-red-600"
      : tone >= 4
      ? "text-orange-600"
      : "text-green-600";
  return (
    <div className="p-3 bg-white rounded-lg">
      <p className="mb-1 text-xs text-gray-600">{label}</p>
      <p className={`text-2xl font-bold ${tone ? color : "text-teal-600"}`}>
        {value}
      </p>
    </div>
  );
}
function ROMItem({ label, value }) {
  return (
    <div>
      <p className="mb-1 text-xs text-gray-600">{label}</p>
      <p className="font-bold text-gray-900">{value}°</p>
    </div>
  );
}
function TagGroup({ title, items, color = "teal" }) {
  const tone =
    color === "purple"
      ? "text-purple-700 bg-purple-100"
      : "text-teal-700 bg-teal-100";
  return (
    <div className="mb-4">
      <h4 className="mb-2 text-sm font-semibold text-gray-900">{title}</h4>
      <div className="flex flex-wrap gap-2">
        {items.map((t, i) => (
          <span
            key={`${t}-${i}`}
            className={`px-3 py-1 text-xs rounded-full ${tone}`}
          >
            {t}
          </span>
        ))}
      </div>
    </div>
  );
}
function Callout({ title, text, tone = "blue" }) {
  const map = {
    blue: "border-blue-500 bg-blue-50",
    yellow: "border-yellow-500 bg-yellow-50",
  };
  return (
    <div className={`p-3 mb-3 border-l-4 rounded-lg ${map[tone]}`}>
      <h4 className="mb-1 text-sm font-semibold text-gray-900">{title}</h4>
      <p className="text-sm text-gray-700">{text}</p>
    </div>
  );
} */
