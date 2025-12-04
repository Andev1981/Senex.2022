// resources/js/Pages/KineMobile/SessionForm.jsx
import React, { useState, useEffect } from "react";
import { Head, router } from "@inertiajs/react";
import {
  ArrowLeft,
  Calendar,
  Clock,
  User,
  FileText,
  Save,
  Trash2,
  Search,
  Stethoscope,
  DollarSign,
  Percent,
  Activity,
  TrendingUp,
  TrendingDown,
  Clipboard,
  Target,
  Home,
} from "lucide-react";
import KineLayout from "@/Layouts/KineLayout";
import moment from "moment";

export default function SessionForm({
  session = null,
  patients = [],
  sessionTypes = [],
  treatments = [],
  doctor,
  availableTechniques = [], // Lista de técnicas disponibles
  availableExercises = [], // Lista de ejercicios disponibles
}) {
  const isEditMode = !!session;
  const canEdit = !isEditMode || session.status === "Programada";

  // Estado del formulario con TODOS los campos
  const [formData, setFormData] = useState({
    // Datos básicos
    treatment_id: session?.treatment_id || "",
    month_session_number: session?.month_session_number || "",
    date: session?.date
      ? moment.utc(session.date).format("YYYY-MM-DD")
      : moment.utc(Date.now()).format("YYYY-MM-DD"),
    time: session?.time || "",
    duration: session?.duration || 60,
    status: session?.status || "Programada",
    doctor_id: doctor?.id || session?.doctor?.id || "",
    patient_id: session?.patient?.id || "",
    session_type_id: session?.session_type_id || "",

    // Métricas de dolor (escala 0-10)
    pain_before: session?.pain_before || 0,
    pain_after: session?.pain_after || 0,

    // ROM (Rango de Movimiento) en grados
    rom_flexion_before: session?.rom_flexion_before || 0,
    rom_flexion_after: session?.rom_flexion_after || 0,
    rom_abduction_before: session?.rom_abduction_before || 0,
    rom_abduction_after: session?.rom_abduction_after || 0,
    rom_rotation_before: session?.rom_rotation_before || 0,
    rom_rotation_after: session?.rom_rotation_after || 0,

    // Arrays
    techniques: session?.techniques || [],
    exercises: session?.exercises || [],

    // Notas
    notes: session?.notes || "",
    homework: session?.homework || "",
    next_goals: session?.next_goals || "",

    // Pagos
    patient_amount: session?.payment?.patient_amount || 0,
    doctor_amount: session?.payment?.doctor_amount || 0,
    commission_rate: session?.payment?.commission_rate || 0,
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchPatient, setSearchPatient] = useState(
    session?.patient?.name || ""
  );
  const [showPatientList, setShowPatientList] = useState(false);
  const [activeTab, setActiveTab] = useState("basic"); // basic, clinical, notes

  // Obtener el tipo de sesión seleccionado
  const selectedSessionType = sessionTypes.find(
    (st) => st.id === parseInt(formData.session_type_id)
  );

  // Obtener comisión del doctor
  const doctorCommission = doctor?.commission_rates?.find(
    (cr) => cr.session_type_id === parseInt(formData.session_type_id)
  );

  // Calcular montos automáticamente
  useEffect(() => {
    if (selectedSessionType && !isEditMode) {
      const basePrice = selectedSessionType.base_price;
      let doctorAmount = 0;

      if (doctorCommission) {
        if (doctorCommission.commission_type === "percentage") {
          doctorAmount = (basePrice * doctorCommission.commission_value) / 100;
        } else {
          doctorAmount = doctorCommission.commission_value;
        }
      }

      setFormData((prev) => ({
        ...prev,
        patient_amount: basePrice,
        doctor_amount: Math.round(doctorAmount),
        commission_rate: doctorCommission?.commission_value || 0,
        duration: selectedSessionType.duration_minutes || 60,
      }));
    }
  }, [formData.session_type_id, selectedSessionType, doctorCommission]);

  const filteredPatients = !isEditMode
    ? patients.filter(
        (patient) =>
          patient.name.toLowerCase().includes(searchPatient.toLowerCase()) ||
          (patient.rut && patient.rut.includes(searchPatient))
      )
    : [];

  const patientTreatments = formData.patient_id
    ? treatments.filter((t) => t.patient_id === parseInt(formData.patient_id))
    : [];

  const selectedPatient = isEditMode
    ? session.patient
    : patients.find((p) => p.id === parseInt(formData.patient_id));

  const selectedTreatment = patientTreatments.find(
    (t) => t.id === parseInt(formData.treatment_id)
  );

  const handleBack = () => {
    if (isSubmitting) return;

    if (confirm("¿Deseas salir? Los cambios no guardados se perderán.")) {
      if (isEditMode) {
        router.visit(route("kine.sessions.show", session.id));
      } else {
        router.visit(route("kine.dashboard"));
      }
    }
  };

  const handleSelectPatient = (patient) => {
    setFormData({
      ...formData,
      patient_id: patient.id,
      treatment_id: "",
      session_type_id: "",
      patient_amount: 0,
      doctor_amount: 0,
      commission_rate: 0,
    });
    setSearchPatient(patient.name);
    setShowPatientList(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors({});

    const url = isEditMode
      ? route("sessions.update", session.id)
      : route("sessions.store");

    const method = isEditMode ? "put" : "post";

    router[method](url, formData, {
      onSuccess: () => {
        if (isEditMode) {
          router.visit(route("kine.sessions.show", session.id));
        } else {
          router.visit(route("kine.dashboard"));
        }
      },
      onError: (errors) => {
        setErrors(errors);
        setIsSubmitting(false);
      },
      onFinish: () => {
        setIsSubmitting(false);
      },
    });
  };

  const handleDelete = () => {
    if (
      !confirm(
        "¿Estás seguro de eliminar esta sesión? Esta acción no se puede deshacer."
      )
    ) {
      return;
    }

    router.delete(route("sessions.destroy", session.id), {
      onSuccess: () => {
        router.visit(route("kine.my-sessions"));
      },
    });
  };

  const isFormValid = () => {
    return (
      formData.patient_id &&
      formData.treatment_id &&
      formData.session_type_id &&
      formData.date &&
      formData.time
    );
  };

  // Auto-seleccionar session_type cuando se selecciona tratamiento
  useEffect(() => {
    if (formData.treatment_id && !isEditMode) {
      const treatment = patientTreatments.find(
        (t) => t.id === parseInt(formData.treatment_id)
      );
      if (treatment && treatment.session_type_id) {
        setFormData((prev) => ({
          ...prev,
          session_type_id: treatment.session_type_id,
        }));
      }
    }
  }, [formData.treatment_id]);

  // Tabs para organizar el formulario
  const tabs = [
    { id: "basic", label: "Datos Básicos", icon: Calendar },
    { id: "clinical", label: "Datos Clínicos", icon: Activity },
    { id: "notes", label: "Notas", icon: FileText },
  ];

  return (
    <KineLayout>
      <Head title={isEditMode ? "Editar Sesión" : "Nueva Sesión"} />

      <div className="min-h-screen pb-20 bg-gray-50">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-white border-b border-gray-200 shadow-sm">
          <div className="px-4 py-4">
            <div className="flex items-center gap-3">
              <button
                onClick={handleBack}
                disabled={isSubmitting}
                className="p-2 text-gray-600 transition-colors rounded-lg hover:bg-gray-100 disabled:opacity-50"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="flex-1">
                <h1 className="text-lg font-bold text-gray-900">
                  {isEditMode ? "Editar Sesión" : "Nueva Sesión"}
                </h1>
                <p className="text-sm text-gray-600">
                  {isEditMode
                    ? `${session.patient.name}`
                    : "Completa los datos de la sesión"}
                </p>
              </div>
              {isEditMode && (
                <span
                  className={`px-2 py-1 text-xs font-semibold rounded-full ${
                    session.status === "Programada"
                      ? "bg-blue-100 text-blue-700"
                      : session.status === "Completada"
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {session.status}
                </span>
              )}
            </div>
          </div>

          {/* Tabs Navigation */}
          <div className="flex border-t border-gray-200">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-colors ${
                    activeTab === tab.id
                      ? "text-teal-600 border-b-2 border-teal-600 bg-teal-50"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Alerta si no se puede editar */}
        {isEditMode && !canEdit && (
          <div className="px-4 pt-4">
            <div className="p-4 border-2 border-orange-200 rounded-lg bg-orange-50">
              <p className="text-sm font-semibold text-orange-900">
                ⚠️ Solo puedes editar sesiones programadas
              </p>
              <p className="mt-1 text-xs text-orange-700">
                Esta sesión está {session.status.toLowerCase()} y no puede ser
                modificada.
              </p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="px-4 py-4 space-y-4">
          {/* ========================================= */}
          {/* TAB: DATOS BÁSICOS                        */}
          {/* ========================================= */}
          {activeTab === "basic" && (
            <>
              {/* Seleccionar paciente (solo creación) */}
              {!isEditMode && (
                <div className="p-4 bg-white rounded-lg shadow-sm">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="flex items-center justify-center w-8 h-8 text-sm font-bold text-white bg-teal-600 rounded-full">
                      1
                    </div>
                    <h3 className="text-base font-semibold text-gray-900">
                      Seleccionar Paciente
                    </h3>
                  </div>

                  <div className="relative">
                    <Search className="absolute w-5 h-5 text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
                    <input
                      type="text"
                      value={searchPatient}
                      onChange={(e) => {
                        setSearchPatient(e.target.value);
                        setShowPatientList(true);
                      }}
                      onFocus={() => setShowPatientList(true)}
                      placeholder="Buscar por nombre o RUT..."
                      className="w-full py-3 pl-10 pr-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    />
                  </div>

                  {errors.patient_id && (
                    <p className="mt-2 text-xs text-red-600">
                      {errors.patient_id}
                    </p>
                  )}

                  {/* Dropdown de pacientes */}
                  {showPatientList && searchPatient && (
                    <div className="relative z-20 mt-2">
                      <div className="absolute w-full overflow-hidden bg-white border border-gray-200 rounded-lg shadow-lg max-h-60">
                        <div className="overflow-y-auto max-h-60">
                          {filteredPatients.length === 0 ? (
                            <div className="p-4 text-center text-gray-500">
                              No se encontraron pacientes
                            </div>
                          ) : (
                            filteredPatients.map((patient) => (
                              <button
                                key={patient.id}
                                type="button"
                                onClick={() => handleSelectPatient(patient)}
                                className="flex items-center w-full gap-3 px-4 py-3 text-left transition-colors hover:bg-teal-50"
                              >
                                <div className="flex items-center justify-center flex-shrink-0 w-10 h-10 text-sm font-bold text-white rounded-full bg-gradient-to-br from-teal-400 to-blue-500">
                                  {patient.name
                                    .split(" ")
                                    .map((n) => n[0])
                                    .join("")
                                    .slice(0, 2)}
                                </div>
                                <div>
                                  <p className="font-medium text-gray-900">
                                    {patient.name}
                                  </p>
                                  {patient.rut && (
                                    <p className="text-xs text-gray-600">
                                      {patient.rut}
                                    </p>
                                  )}
                                </div>
                              </button>
                            ))
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Paciente seleccionado */}
                  {selectedPatient && (
                    <div className="flex items-center gap-3 p-3 mt-3 border-2 border-teal-200 rounded-lg bg-teal-50">
                      <div className="flex items-center justify-center flex-shrink-0 w-10 h-10 text-sm font-bold text-white rounded-full bg-gradient-to-br from-teal-400 to-blue-500">
                        {selectedPatient.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .slice(0, 2)}
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900">
                          {selectedPatient.name}
                        </p>
                        {selectedPatient.rut && (
                          <p className="text-xs text-gray-600">
                            {selectedPatient.rut}
                          </p>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setFormData({
                            ...formData,
                            patient_id: "",
                            treatment_id: "",
                            session_type_id: "",
                            patient_amount: 0,
                            doctor_amount: 0,
                            commission_rate: 0,
                          });
                          setSearchPatient("");
                        }}
                        className="p-1 text-red-600 transition-colors rounded hover:bg-red-100"
                      >
                        ✕
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Modo edición: Mostrar paciente */}
              {isEditMode && (
                <div className="p-4 bg-white rounded-lg shadow-sm">
                  <label className="block mb-2 text-sm font-semibold text-gray-700">
                    <User className="inline w-4 h-4 mr-1" />
                    Paciente
                  </label>
                  <div className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg bg-gray-50">
                    <div className="flex items-center justify-center flex-shrink-0 w-10 h-10 text-sm font-bold text-white rounded-full bg-gradient-to-br from-teal-400 to-blue-500">
                      {session.patient.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .slice(0, 2)}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">
                        {session.patient.name}
                      </p>
                      {session.patient.rut && (
                        <p className="text-xs text-gray-600">
                          {session.patient.rut}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Seleccionar tratamiento */}
              {formData.patient_id && !isEditMode && (
                <div className="p-4 bg-white rounded-lg shadow-sm">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="flex items-center justify-center w-8 h-8 text-sm font-bold text-white bg-teal-600 rounded-full">
                      2
                    </div>
                    <h3 className="text-base font-semibold text-gray-900">
                      Tratamiento Activo
                    </h3>
                  </div>

                  {patientTreatments.length === 0 ? (
                    <div className="p-4 text-center border border-orange-200 rounded-lg bg-orange-50">
                      <p className="text-sm font-medium text-orange-800">
                        ⚠️ Este paciente no tiene tratamientos activos
                      </p>
                    </div>
                  ) : (
                    <select
                      value={formData.treatment_id}
                      onChange={(e) => {
                        const treatment = patientTreatments.find(
                          (t) => t.id === parseInt(e.target.value)
                        );
                        setFormData({
                          ...formData,
                          treatment_id: e.target.value,
                          session_type_id: treatment?.session_type_id || "",
                        });
                      }}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    >
                      <option value="">Seleccionar tratamiento...</option>
                      {patientTreatments.map((treatment) => (
                        <option key={treatment.id} value={treatment.id}>
                          {treatment.diagnosis || "Sin diagnóstico"} -{" "}
                          {treatment.session_type_name}
                        </option>
                      ))}
                    </select>
                  )}

                  {errors.treatment_id && (
                    <p className="mt-2 text-xs text-red-600">
                      {errors.treatment_id}
                    </p>
                  )}

                  {/* Info del tratamiento seleccionado */}
                  {selectedTreatment && (
                    <div className="p-3 mt-3 border border-blue-200 rounded-lg bg-blue-50">
                      <div className="flex items-start gap-2">
                        <Stethoscope className="w-4 h-4 mt-0.5 text-blue-600" />
                        <div className="flex-1">
                          <p className="text-xs font-semibold text-blue-900">
                            Diagnóstico:
                          </p>
                          <p className="text-sm text-blue-800">
                            {selectedTreatment.diagnosis ||
                              "Sin diagnóstico registrado"}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {isEditMode && (
                <div className="p-4 bg-white rounded-lg shadow-sm">
                  <label className="block mb-2 text-sm font-semibold text-gray-700">
                    <FileText className="inline w-4 h-4 mr-1" />
                    Tratamiento
                  </label>
                  <div className="p-3 border border-gray-200 rounded-lg bg-gray-50">
                    <p className="text-sm font-medium text-gray-900">
                      {session.treatment.diagnosis || "Sin diagnóstico"}
                    </p>
                  </div>
                </div>
              )}

              {/* Tipo de sesión y montos */}
              {(formData.treatment_id || isEditMode) && (
                <div className="p-4 bg-white rounded-lg shadow-sm">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="flex items-center justify-center w-8 h-8 text-sm font-bold text-white bg-teal-600 rounded-full">
                      {isEditMode ? "1" : "3"}
                    </div>
                    <h3 className="text-base font-semibold text-gray-900">
                      Tipo de Sesión
                    </h3>
                  </div>

                  <select
                    value={formData.session_type_id}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        session_type_id: e.target.value,
                      })
                    }
                    disabled={!canEdit}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                  >
                    <option value="">Seleccionar tipo...</option>
                    {sessionTypes.map((type) => (
                      <option key={type.id} value={type.id}>
                        {type.name} ({type.duration_minutes} min)
                      </option>
                    ))}
                  </select>

                  {errors.session_type_id && (
                    <p className="mt-2 text-xs text-red-600">
                      {errors.session_type_id}
                    </p>
                  )}

                  {/* Resumen de montos */}
                  {selectedSessionType && (
                    <div className="mt-3 space-y-2">
                      <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg bg-gray-50">
                        <div className="flex items-center gap-2">
                          <DollarSign className="w-4 h-4 text-gray-600" />
                          <span className="text-sm text-gray-700">
                            Precio paciente
                          </span>
                        </div>
                        <span className="font-semibold text-gray-900">
                          ${formData.patient_amount.toLocaleString("es-CL")}
                        </span>
                      </div>

                      <div className="flex items-center justify-between p-3 border-2 border-teal-200 rounded-lg bg-teal-50">
                        <div className="flex items-center gap-2">
                          <Percent className="w-4 h-4 text-teal-600" />
                          <div>
                            <span className="text-sm font-medium text-teal-900">
                              Tu comisión
                            </span>
                            {doctorCommission && (
                              <p className="text-xs text-teal-700">
                                {doctorCommission.commission_type ===
                                "percentage"
                                  ? `${doctorCommission.commission_value}%`
                                  : "Monto fijo"}
                              </p>
                            )}
                          </div>
                        </div>
                        <span className="text-lg font-bold text-teal-600">
                          ${formData.doctor_amount.toLocaleString("es-CL")}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Fecha y hora */}
              {(formData.session_type_id || isEditMode) && (
                <div className="p-4 bg-white rounded-lg shadow-sm">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="flex items-center justify-center w-8 h-8 text-sm font-bold text-white bg-teal-600 rounded-full">
                      {isEditMode ? "2" : "4"}
                    </div>
                    <h3 className="text-base font-semibold text-gray-900">
                      Fecha y Hora
                    </h3>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="block mb-2 text-sm font-medium text-gray-700">
                        <Calendar className="inline w-4 h-4 mr-1" />
                        Fecha
                      </label>
                      <input
                        type="date"
                        value={formData.date}
                        onChange={(e) =>
                          setFormData({ ...formData, date: e.target.value })
                        }
                        min={new Date().toISOString().split("T")[0]}
                        disabled={!canEdit}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                      />
                      {errors.date && (
                        <p className="mt-1 text-xs text-red-600">
                          {errors.date}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block mb-2 text-sm font-medium text-gray-700">
                        <Clock className="inline w-4 h-4 mr-1" />
                        Hora
                      </label>
                      <input
                        type="time"
                        value={formData.time}
                        onChange={(e) =>
                          setFormData({ ...formData, time: e.target.value })
                        }
                        disabled={!canEdit}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                      />
                      {errors.time && (
                        <p className="mt-1 text-xs text-red-600">
                          {errors.time}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block mb-2 text-sm font-medium text-gray-700">
                        <Clock className="inline w-4 h-4 mr-1" />
                        Duración (minutos)
                      </label>
                      <input
                        type="number"
                        value={formData.duration}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            duration: parseInt(e.target.value),
                          })
                        }
                        min="15"
                        max="180"
                        step="15"
                        disabled={!canEdit}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                      />
                      {errors.duration && (
                        <p className="mt-1 text-xs text-red-600">
                          {errors.duration}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {/* ========================================= */}
          {/* TAB: DATOS CLÍNICOS                       */}
          {/* ========================================= */}
          {activeTab === "clinical" && (
            <>
              {/* Métricas de Dolor */}
              <div className="p-4 bg-white rounded-lg shadow-sm">
                <h3 className="flex items-center gap-2 mb-4 text-base font-semibold text-gray-900">
                  <Activity className="w-5 h-5 text-red-600" />
                  Escala de Dolor (0-10)
                </h3>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block mb-2 text-sm font-medium text-gray-700">
                      <TrendingUp className="inline w-4 h-4 mr-1 text-red-500" />
                      Dolor Inicial
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="10"
                      value={formData.pain_before}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          pain_before: parseInt(e.target.value),
                        })
                      }
                      disabled={!canEdit}
                      className="w-full"
                    />
                    <div className="flex justify-between mt-1 text-xs text-gray-600">
                      <span>Sin dolor</span>
                      <span className="font-bold text-red-600">
                        {formData.pain_before}
                      </span>
                      <span>Máximo</span>
                    </div>
                  </div>

                  <div>
                    <label className="block mb-2 text-sm font-medium text-gray-700">
                      <TrendingDown className="inline w-4 h-4 mr-1 text-green-500" />
                      Dolor Final
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="10"
                      value={formData.pain_after}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          pain_after: parseInt(e.target.value),
                        })
                      }
                      disabled={!canEdit}
                      className="w-full"
                    />
                    <div className="flex justify-between mt-1 text-xs text-gray-600">
                      <span>Sin dolor</span>
                      <span className="font-bold text-green-600">
                        {formData.pain_after}
                      </span>
                      <span>Máximo</span>
                    </div>
                  </div>
                </div>

                {/* Mejora del dolor */}
                {formData.pain_before > 0 && (
                  <div className="p-3 mt-3 border border-blue-200 rounded-lg bg-blue-50">
                    <p className="text-sm font-medium text-blue-900">
                      Mejora:{" "}
                      {formData.pain_before - formData.pain_after > 0
                        ? `↓ ${
                            formData.pain_before - formData.pain_after
                          } puntos`
                        : formData.pain_before - formData.pain_after < 0
                        ? `↑ ${Math.abs(
                            formData.pain_before - formData.pain_after
                          )} puntos (empeoró)`
                        : "Sin cambios"}
                    </p>
                  </div>
                )}
              </div>

              {/* ROM - Rango de Movimiento */}
              <div className="p-4 bg-white rounded-lg shadow-sm">
                <h3 className="flex items-center gap-2 mb-4 text-base font-semibold text-gray-900">
                  <Activity className="w-5 h-5 text-purple-600" />
                  Rango de Movimiento (ROM) - Grados
                </h3>

                {/* Flexión */}
                <div className="pb-4 mb-4 border-b border-gray-200">
                  <p className="mb-2 text-sm font-semibold text-gray-700">
                    Flexión
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block mb-1 text-xs text-gray-600">
                        Antes
                      </label>
                      <input
                        type="number"
                        value={formData.rom_flexion_before}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            rom_flexion_before: parseInt(e.target.value) || 0,
                          })
                        }
                        min="0"
                        max="180"
                        placeholder="0°"
                        disabled={!canEdit}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 disabled:bg-gray-100"
                      />
                    </div>
                    <div>
                      <label className="block mb-1 text-xs text-gray-600">
                        Después
                      </label>
                      <input
                        type="number"
                        value={formData.rom_flexion_after}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            rom_flexion_after: parseInt(e.target.value) || 0,
                          })
                        }
                        min="0"
                        max="180"
                        placeholder="0°"
                        disabled={!canEdit}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 disabled:bg-gray-100"
                      />
                    </div>
                  </div>
                </div>

                {/* Abducción */}
                <div className="pb-4 mb-4 border-b border-gray-200">
                  <p className="mb-2 text-sm font-semibold text-gray-700">
                    Abducción
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block mb-1 text-xs text-gray-600">
                        Antes
                      </label>
                      <input
                        type="number"
                        value={formData.rom_abduction_before}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            rom_abduction_before: parseInt(e.target.value) || 0,
                          })
                        }
                        min="0"
                        max="180"
                        placeholder="0°"
                        disabled={!canEdit}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 disabled:bg-gray-100"
                      />
                    </div>
                    <div>
                      <label className="block mb-1 text-xs text-gray-600">
                        Después
                      </label>
                      <input
                        type="number"
                        value={formData.rom_abduction_after}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            rom_abduction_after: parseInt(e.target.value) || 0,
                          })
                        }
                        min="0"
                        max="180"
                        placeholder="0°"
                        disabled={!canEdit}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 disabled:bg-gray-100"
                      />
                    </div>
                  </div>
                </div>

                {/* Rotación */}
                <div>
                  <p className="mb-2 text-sm font-semibold text-gray-700">
                    Rotación
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block mb-1 text-xs text-gray-600">
                        Antes
                      </label>
                      <input
                        type="number"
                        value={formData.rom_rotation_before}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            rom_rotation_before: parseInt(e.target.value) || 0,
                          })
                        }
                        min="0"
                        max="180"
                        placeholder="0°"
                        disabled={!canEdit}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 disabled:bg-gray-100"
                      />
                    </div>
                    <div>
                      <label className="block mb-1 text-xs text-gray-600">
                        Después
                      </label>
                      <input
                        type="number"
                        value={formData.rom_rotation_after}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            rom_rotation_after: parseInt(e.target.value) || 0,
                          })
                        }
                        min="0"
                        max="180"
                        placeholder="0°"
                        disabled={!canEdit}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 disabled:bg-gray-100"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Técnicas Aplicadas */}
              <div className="p-4 bg-white rounded-lg shadow-sm">
                <h3 className="flex items-center gap-2 mb-3 text-base font-semibold text-gray-900">
                  <Clipboard className="w-5 h-5 text-indigo-600" />
                  Técnicas Aplicadas
                </h3>

                <textarea
                  value={formData.techniques.join(", ")}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      techniques: e.target.value
                        .split(",")
                        .map((t) => t.trim())
                        .filter(Boolean),
                    })
                  }
                  placeholder="Ej: Masoterapia, Ultrasonido, Electroestimulación (separadas por coma)"
                  rows={3}
                  disabled={!canEdit}
                  className="w-full px-4 py-3 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 disabled:bg-gray-100"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Separa cada técnica con una coma
                </p>
              </div>

              {/* Ejercicios Realizados */}
              <div className="p-4 bg-white rounded-lg shadow-sm">
                <h3 className="flex items-center gap-2 mb-3 text-base font-semibold text-gray-900">
                  <Activity className="w-5 h-5 text-orange-600" />
                  Ejercicios Realizados
                </h3>

                <textarea
                  value={formData.exercises.join(", ")}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      exercises: e.target.value
                        .split(",")
                        .map((t) => t.trim())
                        .filter(Boolean),
                    })
                  }
                  placeholder="Ej: Fortalecimiento cuádriceps, Estiramiento isquiotibiales (separados por coma)"
                  rows={3}
                  disabled={!canEdit}
                  className="w-full px-4 py-3 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 disabled:bg-gray-100"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Separa cada ejercicio con una coma
                </p>
              </div>
            </>
          )}

          {/* ========================================= */}
          {/* TAB: NOTAS                                */}
          {/* ========================================= */}
          {activeTab === "notes" && (
            <>
              {/* Notas de la sesión */}
              <div className="p-4 bg-white rounded-lg shadow-sm">
                <h3 className="flex items-center gap-2 mb-3 text-base font-semibold text-gray-900">
                  <FileText className="w-5 h-5 text-blue-600" />
                  Notas de la Sesión
                </h3>

                <textarea
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
                  placeholder="Observaciones generales, respuesta del paciente, eventos relevantes..."
                  rows={5}
                  disabled={!canEdit}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 disabled:bg-gray-100"
                />
                {errors.notes && (
                  <p className="mt-2 text-xs text-red-600">{errors.notes}</p>
                )}
              </div>

              {/* Tareas para el hogar */}
              <div className="p-4 bg-white rounded-lg shadow-sm">
                <h3 className="flex items-center gap-2 mb-3 text-base font-semibold text-gray-900">
                  <Home className="w-5 h-5 text-green-600" />
                  Tareas para el Hogar
                </h3>

                <textarea
                  value={formData.homework}
                  onChange={(e) =>
                    setFormData({ ...formData, homework: e.target.value })
                  }
                  placeholder="Ejercicios, recomendaciones o cuidados que debe realizar en casa..."
                  rows={4}
                  disabled={!canEdit}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 disabled:bg-gray-100"
                />
                {errors.homework && (
                  <p className="mt-2 text-xs text-red-600">{errors.homework}</p>
                )}
              </div>

              {/* Objetivos próxima sesión */}
              <div className="p-4 bg-white rounded-lg shadow-sm">
                <h3 className="flex items-center gap-2 mb-3 text-base font-semibold text-gray-900">
                  <Target className="w-5 h-5 text-purple-600" />
                  Objetivos Próxima Sesión
                </h3>

                <textarea
                  value={formData.next_goals}
                  onChange={(e) =>
                    setFormData({ ...formData, next_goals: e.target.value })
                  }
                  placeholder="Metas y objetivos para la siguiente sesión..."
                  rows={4}
                  disabled={!canEdit}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 disabled:bg-gray-100"
                />
                {errors.next_goals && (
                  <p className="mt-2 text-xs text-red-600">
                    {errors.next_goals}
                  </p>
                )}
              </div>
            </>
          )}

          {/* ========================================= */}
          {/* BOTONES DE ACCIÓN (FIJOS EN TODAS LAS TABS) */}
          {/* ========================================= */}
          <div className="pt-2 space-y-3">
            {canEdit && (
              <button
                type="submit"
                disabled={!isFormValid() || isSubmitting}
                className="flex items-center justify-center w-full gap-2 py-3.5 text-base font-bold text-white transition-all shadow-lg bg-gradient-to-r from-teal-500 to-blue-500 rounded-xl hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:from-gray-400 disabled:to-gray-500"
              >
                <Save className="w-5 h-5" />
                {isSubmitting
                  ? isEditMode
                    ? "Guardando..."
                    : "Creando..."
                  : isEditMode
                  ? "Guardar Cambios"
                  : "Crear Sesión"}
              </button>
            )}

            <button
              type="button"
              onClick={handleBack}
              disabled={isSubmitting}
              className="w-full py-3 text-base font-semibold text-gray-700 transition-colors bg-gray-200 rounded-xl hover:bg-gray-300 disabled:opacity-50"
            >
              {canEdit ? "Cancelar" : "Volver"}
            </button>

            {isEditMode && canEdit && (
              <button
                type="button"
                onClick={handleDelete}
                disabled={isSubmitting}
                className="flex items-center justify-center w-full gap-2 py-3 text-base font-semibold text-white transition-colors bg-red-600 rounded-xl hover:bg-red-700 disabled:opacity-50"
              >
                <Trash2 className="w-5 h-5" />
                Eliminar Sesión
              </button>
            )}
          </div>
        </form>
      </div>
    </KineLayout>
  );
}
