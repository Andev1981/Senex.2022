import React, { useState } from "react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, useForm, router } from "@inertiajs/react";
import TableAttendancesPatient from "./Partials/TableAttendancesPatient";
import { patientStatuses } from "@/utils/status";
import ModalCreateEditPatient from "./ModalCreateEditPatient";
import ModalCreateEditTreatment from "./Partials/ModalCreateEditTreatment";
import Modal from "@/Components/Modal";
import TableTreatments from "./Partials/TableTreatments";
import {
  User,
  Activity,
  DollarSign,
  FileText,
  ChevronLeft,
  Plus,
  Edit,
  CheckCircle,
  Clock,
  CreditCard,
  Clipboard,
  Target,
  TrendingUp,
  Award,
  Video,
  PlayCircle,
  Timer,
  Repeat,
  Download,
} from "lucide-react";
import IndexGeneral from "./General/IndexGeneral";
import IndexHistorial from "./Historial/IndexHistorial";
import { route } from "ziggy-js";
import PatientCard from "./Partials/PatientCard";

function DetailPatient({
  /* patient */
  sessions,
  session_types,
  treatments,
  treatment: defaultTreatment,
  doctors,
  communes,
  regions,
  provinces,
}) {
  const { get } = useForm();
  const [activeTab, setActiveTab] = useState("general");
  const [openModalPatient, setOpenModalPatient] = useState(false);
  const [openModalTreatment, setOpenModalTreatment] = useState(false);
  const [openModalTreatmentsList, setOpenModalTreatmentsList] = useState(false);
  const [treatment, setTreatment] = useState(defaultTreatment || null);

  const handleOpenModalOptions = () => {
    setOpenModalPatient(true);
  };

  const handleOpenModalTreatment = (data) => {
    setTreatment(data);
    setOpenModalTreatment(true);
  };

  const handleOpenModalTreatmentList = () => {
    setOpenModalTreatmentsList(true);
  };

  const patient = {
    id: 1,
    name: "Carlos Ramírez Soto",
    rut: "16.789.234-5",
    email: "carlos.ramirez@email.com",
    phone: "+56 9 8765 4321",
    birthDate: "1988-06-20",
    age: 36,
    address: "Av. Providencia 2240, Depto 802",
    city: "Providencia, Santiago",
    region: "Región Metropolitana",
    gender: "Masculino",
    bloodType: "A+",
    allergies: "Ninguna",
    chronicConditions: "Escoliosis leve",
    insurance: "Isapre Consalud - Plan 3000",
    occupation: "Ingeniero en Software",
    maritalStatus: "Soltero",
    emergencyContact: {
      name: "Andrea Ramírez Soto",
      relationship: "Hermana",
      phone: "+56 9 8765 9999",
      email: "andrea.ramirez@email.com",
    },
    physicalCondition: {
      height: 178,
      weight: 82,
      bmi: 25.9,
      bloodPressure: "120/80",
      dominantSide: "Derecha",
      activityLevel: "Moderado",
      occupation: "Trabajo de oficina - sedentario",
      sportsPractice: "Running 2 veces por semana",
    },
    medicalHistory: [
      {
        id: 1,
        date: "2024-09-25",
        type: "Evaluación",
        kinesiologist: "Klgo. Roberto Pérez",
        diagnosis: "Tendinitis rotador hombro derecho - Grado II",
        evaluation:
          "Dolor agudo al levantar brazo sobre 90°. ROM limitado. Fuerza 3/5.",
        treatment: "Plan de 12 sesiones - Terapia manual + Ejercicios",
        painLevel: 7,
        notes:
          "Paciente refiere dolor nocturno. Inicio hace 3 semanas por sobrecarga laboral.",
        recommendedSessions: 12,
      },
      {
        id: 2,
        date: "2024-07-15",
        type: "Control",
        kinesiologist: "Klgo. María Silva",
        diagnosis: "Lumbalgia mecánica",
        evaluation: "Mejoría significativa. ROM completo. Sin dolor en reposo.",
        treatment: "Alta médica. Ejercicios de mantención.",
        painLevel: 1,
        notes:
          "Paciente dado de alta. Indicaciones de ergonomía laboral y ejercicios domiciliarios.",
        recommendedSessions: 0,
      },
    ],
    treatments: [
      {
        id: 1,
        name: "Rehabilitación Hombro Derecho",
        diagnosis: "Tendinitis del Manguito Rotador",
        startDate: "2024-09-27",
        endDate: null,
        status: "Activo",
        kinesiologist: "Klgo. Roberto Pérez",
        description:
          "Tratamiento de rehabilitación para tendinitis del manguito rotador",
        totalSessions: 12,
        completedSessions: 5,
        frequency: "2 veces por semana",
        nextAppointment: "2024-10-15 15:00",
        objectives: [
          "Disminuir dolor e inflamación",
          "Recuperar rango de movimiento completo",
          "Fortalecer musculatura del hombro",
          "Retorno a actividades cotidianas",
        ],
        currentPhase: "Fase II - Movilización Activa",
        exercises: [
          {
            name: "Péndulos de Codman",
            sets: "3x15",
            frequency: "Diario",
            video: true,
          },
          {
            name: "Rotación externa con banda",
            sets: "3x12",
            frequency: "3 veces/semana",
            video: true,
          },
          {
            name: "Elevación escapular",
            sets: "3x15",
            frequency: "Diario",
            video: false,
          },
          {
            name: "Fortalecimiento rotadores",
            sets: "2x10",
            frequency: "3 veces/semana",
            video: true,
          },
        ],
        progress: {
          painReduction: 60,
          mobilityImprovement: 45,
          strengthGain: 30,
        },
      },
      {
        id: 2,
        name: "Rehabilitación Lumbar",
        diagnosis: "Lumbalgia Mecánica",
        startDate: "2024-06-10",
        endDate: "2024-07-22",
        status: "Completado",
        kinesiologist: "Klgo. María Silva",
        description: "Tratamiento para dolor lumbar crónico",
        totalSessions: 10,
        completedSessions: 10,
        frequency: "2 veces por semana",
        objectives: [
          "Alivio del dolor lumbar",
          "Mejora de flexibilidad",
          "Fortalecimiento core",
          "Educación postural",
        ],
        outcome:
          "Alta satisfactoria. Paciente sin dolor y retorno completo a actividades.",
      },
    ],
    sessions: [
      {
        id: 1,
        treatmentId: 1,
        sessionNumber: 5,
        date: "2024-10-10",
        time: "15:00",
        duration: 45,
        kinesiologist: "Klgo. Roberto Pérez",
        status: "Completada",
        painBefore: 6,
        painAfter: 3,
        techniques: [
          "Terapia manual - Movilización glenohumeral",
          "Ultrasonido terapéutico - 5 minutos",
          "Ejercicios de fortalecimiento",
          "Crioterapia - 10 minutos",
        ],
        exercises: [
          "Péndulos de Codman",
          "Rotación externa",
          "Elevación frontal",
        ],
        rom: {
          flexion: 145,
          abduction: 140,
          rotation: 60,
        },
        notes:
          "Paciente muestra mejoría evidente. Disminución significativa del dolor. Continuar con plan.",
        homework:
          "Realizar ejercicios 2 veces al día. Aplicar hielo si hay dolor post-actividad.",
        nextGoals: "Aumentar carga en ejercicios de fortalecimiento",
      },
      {
        id: 2,
        treatmentId: 1,
        sessionNumber: 4,
        date: "2024-10-07",
        time: "15:00",
        duration: 45,
        kinesiologist: "Klgo. Roberto Pérez",
        status: "Completada",
        painBefore: 7,
        painAfter: 4,
        techniques: [
          "Terapia manual - Liberación miofascial",
          "TENS - 15 minutos",
          "Ejercicios activo-asistidos",
          "Kinesiotaping",
        ],
        exercises: ["Péndulos de Codman", "Rotación externa asistida"],
        rom: {
          flexion: 135,
          abduction: 130,
          rotation: 55,
        },
        notes:
          "Buena adherencia al tratamiento. Paciente refiere menos dolor nocturno.",
        homework:
          "Ejercicios domiciliarios + aplicación de calor húmedo antes de ejercitar.",
      },
      {
        id: 3,
        treatmentId: 1,
        sessionNumber: 6,
        date: "2024-10-15",
        time: "15:00",
        duration: 45,
        kinesiologist: "Klgo. Roberto Pérez",
        status: "Programada",
        painBefore: null,
        painAfter: null,
      },
    ],
    payments: [
      {
        id: 1,
        date: "2024-10-10",
        concept: "Sesión Kinesiología 5/12",
        treatmentId: 1,
        sessionNumber: 5,
        amount: 20000,
        paymentMethod: "Tarjeta de Débito",
        status: "Pagado",
        invoice: "FK-2024-00243",
        copay: 8000,
        insuranceCovered: 12000,
      },
      {
        id: 2,
        date: "2024-10-07",
        concept: "Sesión Kinesiología 4/12",
        treatmentId: 1,
        sessionNumber: 4,
        amount: 20000,
        paymentMethod: "Transferencia",
        status: "Pagado",
        invoice: "FK-2024-00238",
        copay: 8000,
        insuranceCovered: 12000,
      },
      {
        id: 3,
        date: "2024-10-15",
        concept: "Sesión Kinesiología 6/12",
        treatmentId: 1,
        sessionNumber: 6,
        amount: 20000,
        paymentMethod: "Pendiente",
        status: "Pendiente",
        invoice: "FK-2024-00251",
        copay: 8000,
        insuranceCovered: 12000,
      },
    ],
    appointments: [
      {
        id: 1,
        date: "2024-10-15",
        time: "15:00",
        treatmentId: 1,
        sessionNumber: 6,
        kinesiologist: "Klgo. Roberto Pérez",
        status: "Confirmada",
        type: "Sesión Regular",
        duration: 45,
      },
      {
        id: 2,
        date: "2024-10-17",
        time: "15:00",
        treatmentId: 1,
        sessionNumber: 7,
        kinesiologist: "Klgo. Roberto Pérez",
        status: "Programada",
        type: "Sesión Regular",
        duration: 45,
      },
    ],
    documents: [
      {
        id: 1,
        name: "Evaluación Kinesiológica Inicial",
        type: "PDF",
        size: "320 KB",
        date: "2024-09-25",
        category: "Evaluaciones",
        treatmentId: 1,
      },
      {
        id: 2,
        name: "Plan de Tratamiento Hombro",
        type: "PDF",
        size: "185 KB",
        date: "2024-09-27",
        category: "Planes",
        treatmentId: 1,
      },
      {
        id: 3,
        name: "Evolución Sesiones 1-5",
        type: "PDF",
        size: "240 KB",
        date: "2024-10-10",
        category: "Evolución",
        treatmentId: 1,
      },
      {
        id: 4,
        name: "Pauta Ejercicios Domiciliarios",
        type: "PDF",
        size: "450 KB",
        date: "2024-09-27",
        category: "Ejercicios",
        treatmentId: 1,
      },
    ],
  };

  const totalPaid = patient.payments
    .filter((p) => p.status === "Pagado")
    .reduce((sum, p) => sum + p.amount, 0);
  const totalPending = patient.payments
    .filter((p) => p.status === "Pendiente")
    .reduce((sum, p) => sum + p.amount, 0);

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
    get(route("listado.pacientes"));
  };

  return (
    <AuthenticatedLayout>
      <div className="min-h-screen bg-gray-100">
        <div className="text-white bg-gradient-to-r from-teal-600 to-cyan-600">
          <div className="px-4 py-6 mx-auto max-w-7xl">
            <button
              onClick={() => handleBack()}
              className="flex items-center gap-2 mb-4 text-white hover:text-teal-100"
            >
              <ChevronLeft className="w-5 h-5" />
              Volver a pacientes
            </button>

            <PatientCard patient={patient} />
          </div>

          <div className="px-4 mx-auto max-w-7xl">
            <div className="flex gap-2 pb-0 -mb-px overflow-x-auto">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-4 py-3 font-medium whitespace-nowrap transition-all border-b-2 ${
                      activeTab === tab.id
                        ? "text-white border-white bg-white/10"
                        : "text-teal-100 border-transparent hover:text-white hover:bg-white/5"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="px-4 py-6 mx-auto max-w-7xl">
          {activeTab === "general" && <IndexGeneral patient={patient} />}

          {activeTab === "history" && <IndexHistorial patient={patient} />}

          {activeTab === "treatments" && (
            <div className="space-y-6">
              {patient.treatments
                .filter((t) => t.status === "Activo")
                .map((treatment) => (
                  <div
                    key={treatment.id}
                    className="p-6 bg-white shadow-lg rounded-xl"
                  >
                    <div className="flex items-start justify-between mb-6">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <h2 className="text-2xl font-bold text-gray-900">
                            {treatment.name}
                          </h2>
                          <span className="px-3 py-1 text-sm font-medium text-green-700 bg-green-100 rounded-full">
                            {treatment.status}
                          </span>
                        </div>
                        <p className="mb-1 text-gray-600">
                          {treatment.diagnosis}
                        </p>
                        <p className="text-sm text-gray-500">
                          {treatment.kinesiologist}
                        </p>
                      </div>
                      <button className="text-teal-600 hover:text-teal-700">
                        <Edit className="w-5 h-5" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 gap-4 mb-6 md:grid-cols-4">
                      <div className="p-4 text-white bg-gradient-to-br from-teal-500 to-teal-600 rounded-xl">
                        <p className="mb-1 text-sm opacity-90">Sesiones</p>
                        <p className="text-3xl font-bold">
                          {treatment.completedSessions}/
                          {treatment.totalSessions}
                        </p>
                        <div className="h-2 mt-2 rounded-full bg-white/20">
                          <div
                            className="h-2 transition-all bg-white rounded-full"
                            style={{
                              width: `${
                                (treatment.completedSessions /
                                  treatment.totalSessions) *
                                100
                              }%`,
                            }}
                          ></div>
                        </div>
                      </div>

                      <div className="p-4 text-white bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl">
                        <div className="flex items-center gap-2 mb-1">
                          <TrendingUp className="w-4 h-4" />
                          <p className="text-sm opacity-90">Reducción Dolor</p>
                        </div>
                        <p className="text-3xl font-bold">
                          {treatment.progress.painReduction}%
                        </p>
                      </div>

                      <div className="p-4 text-white bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl">
                        <div className="flex items-center gap-2 mb-1">
                          <Activity className="w-4 h-4" />
                          <p className="text-sm opacity-90">Movilidad</p>
                        </div>
                        <p className="text-3xl font-bold">
                          {treatment.progress.mobilityImprovement}%
                        </p>
                      </div>

                      <div className="p-4 text-white bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl">
                        <div className="flex items-center gap-2 mb-1">
                          <Award className="w-4 h-4" />
                          <p className="text-sm opacity-90">Fuerza</p>
                        </div>
                        <p className="text-3xl font-bold">
                          {treatment.progress.strengthGain}%
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-6 mb-6 lg:grid-cols-2">
                      <div>
                        <h3 className="flex items-center gap-2 mb-3 font-bold text-gray-900">
                          <Target className="w-5 h-5 text-teal-600" />
                          Objetivos del Tratamiento
                        </h3>
                        <div className="space-y-2">
                          {treatment.objectives.map((obj, idx) => (
                            <div
                              key={idx}
                              className="flex items-start gap-2 text-sm"
                            >
                              <CheckCircle className="w-4 h-4 text-teal-600 mt-0.5 flex-shrink-0" />
                              <span className="text-gray-700">{obj}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h3 className="mb-3 font-bold text-gray-900">
                          Información del Tratamiento
                        </h3>
                        <div className="space-y-3 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Inicio:</span>
                            <span className="font-semibold">
                              {new Date(treatment.startDate).toLocaleDateString(
                                "es-CL"
                              )}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Frecuencia:</span>
                            <span className="font-semibold">
                              {treatment.frequency}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Fase Actual:</span>
                            <span className="font-semibold text-teal-600">
                              {treatment.currentPhase}
                            </span>
                          </div>
                          {treatment.nextAppointment && (
                            <div className="flex justify-between">
                              <span className="text-gray-600">
                                Próxima Sesión:
                              </span>
                              <span className="font-semibold text-blue-600">
                                {new Date(
                                  treatment.nextAppointment
                                ).toLocaleDateString("es-CL")}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="flex items-center gap-2 mb-3 font-bold text-gray-900">
                        <Repeat className="w-5 h-5 text-teal-600" />
                        Ejercicios Asignados
                      </h3>
                      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                        {treatment.exercises.map((exercise, idx) => (
                          <div
                            key={idx}
                            className="p-3 border border-teal-200 rounded-lg bg-teal-50"
                          >
                            <div className="flex items-start justify-between mb-2">
                              <h4 className="text-sm font-semibold text-gray-900">
                                {exercise.name}
                              </h4>
                              {exercise.video && (
                                <PlayCircle className="w-4 h-4 text-teal-600" />
                              )}
                            </div>
                            <div className="flex gap-4 text-xs text-gray-600">
                              <span className="font-medium">
                                {exercise.sets}
                              </span>
                              <span>•</span>
                              <span>{exercise.frequency}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}

              {patient.treatments.filter((t) => t.status === "Completado")
                .length > 0 && (
                <div className="p-6 bg-white shadow-lg rounded-xl">
                  <h2 className="flex items-center gap-2 mb-4 text-xl font-bold text-gray-900">
                    <CheckCircle className="w-5 h-5 text-gray-600" />
                    Tratamientos Completados
                  </h2>
                  <div className="space-y-3">
                    {patient.treatments
                      .filter((t) => t.status === "Completado")
                      .map((treatment) => (
                        <div
                          key={treatment.id}
                          className="p-4 border-l-4 border-gray-400 rounded-r-lg bg-gray-50"
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h3 className="font-bold text-gray-900">
                                {treatment.name}
                              </h3>
                              <p className="text-sm text-gray-600">
                                {treatment.diagnosis}
                              </p>
                              <p className="text-sm text-gray-500">
                                {treatment.kinesiologist}
                              </p>
                            </div>
                            <span className="px-3 py-1 text-xs font-medium text-white bg-gray-600 rounded-full">
                              {treatment.status}
                            </span>
                          </div>
                          <div className="grid grid-cols-2 gap-2 mb-2 text-sm">
                            <div>
                              <p className="text-gray-600">Duración</p>
                              <p className="font-semibold">
                                {new Date(
                                  treatment.startDate
                                ).toLocaleDateString("es-CL")}{" "}
                                -{" "}
                                {new Date(treatment.endDate).toLocaleDateString(
                                  "es-CL"
                                )}
                              </p>
                            </div>
                            <div>
                              <p className="text-gray-600">Sesiones</p>
                              <p className="font-semibold">
                                {treatment.completedSessions}/
                                {treatment.totalSessions}
                              </p>
                            </div>
                          </div>
                          {treatment.outcome && (
                            <div className="p-3 mt-2 bg-white rounded-lg">
                              <p className="text-sm text-gray-700">
                                {treatment.outcome}
                              </p>
                            </div>
                          )}
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === "sessions" && (
            <div className="space-y-4">
              <div className="p-6 bg-white shadow-lg rounded-xl">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="flex items-center gap-2 text-2xl font-bold text-gray-900">
                    <Clipboard className="w-6 h-6 text-teal-600" />
                    Registro de Sesiones
                  </h2>
                  <button className="flex items-center gap-2 px-4 py-2 text-white bg-teal-600 rounded-lg hover:bg-teal-700">
                    <Plus className="w-4 h-4" />
                    Registrar Sesión
                  </button>
                </div>

                <div className="space-y-4">
                  {patient.sessions
                    .sort((a, b) => new Date(b.date) - new Date(a.date))
                    .map((session) => (
                      <div
                        key={session.id}
                        className={`border-l-4 ${
                          session.status === "Completada"
                            ? "border-teal-500 bg-gradient-to-r from-teal-50 to-transparent"
                            : "border-blue-500 bg-gradient-to-r from-blue-50 to-transparent"
                        } p-6 rounded-r-xl`}
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <div className="flex items-center gap-3 mb-2">
                              <span
                                className={`inline-block ${
                                  session.status === "Completada"
                                    ? "bg-teal-600"
                                    : "bg-blue-600"
                                } text-white text-sm px-3 py-1 rounded-full font-medium`}
                              >
                                Sesión #{session.sessionNumber}
                              </span>
                              <span
                                className={`text-sm px-3 py-1 rounded-full font-medium ${
                                  session.status === "Completada"
                                    ? "bg-green-100 text-green-700"
                                    : "bg-blue-100 text-blue-700"
                                }`}
                              >
                                {session.status}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600">
                              {session.kinesiologist}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-gray-900">
                              {new Date(session.date).toLocaleDateString(
                                "es-CL"
                              )}
                            </p>
                            <p className="text-sm text-gray-600">
                              {session.time}
                            </p>
                            <p className="flex items-center justify-end gap-1 mt-1 text-xs text-gray-500">
                              <Timer className="w-3 h-3" />
                              {session.duration} min
                            </p>
                          </div>
                        </div>

                        {session.status === "Completada" && (
                          <>
                            <div className="grid grid-cols-2 gap-4 mb-4 md:grid-cols-4">
                              <div className="p-3 bg-white rounded-lg">
                                <p className="mb-1 text-xs text-gray-600">
                                  Dolor Inicial
                                </p>
                                <p
                                  className={`text-2xl font-bold ${
                                    session.painBefore >= 7
                                      ? "text-red-600"
                                      : session.painBefore >= 4
                                      ? "text-orange-600"
                                      : "text-green-600"
                                  }`}
                                >
                                  {session.painBefore}/10
                                </p>
                              </div>
                              <div className="p-3 bg-white rounded-lg">
                                <p className="mb-1 text-xs text-gray-600">
                                  Dolor Final
                                </p>
                                <p
                                  className={`text-2xl font-bold ${
                                    session.painAfter >= 7
                                      ? "text-red-600"
                                      : session.painAfter >= 4
                                      ? "text-orange-600"
                                      : "text-green-600"
                                  }`}
                                >
                                  {session.painAfter}/10
                                </p>
                              </div>
                              <div className="p-3 bg-white rounded-lg">
                                <p className="mb-1 text-xs text-gray-600">
                                  Mejoría
                                </p>
                                <p className="text-2xl font-bold text-green-600">
                                  -{session.painBefore - session.painAfter}
                                </p>
                              </div>
                              <div className="p-3 bg-white rounded-lg">
                                <p className="mb-1 text-xs text-gray-600">
                                  Progreso
                                </p>
                                <p className="text-2xl font-bold text-teal-600">
                                  {Math.round(
                                    ((session.painBefore - session.painAfter) /
                                      session.painBefore) *
                                      100
                                  )}
                                  %
                                </p>
                              </div>
                            </div>

                            {session.rom && (
                              <div className="p-4 mb-4 bg-white rounded-lg">
                                <h4 className="mb-3 text-sm font-semibold text-gray-900">
                                  Rango de Movimiento (ROM)
                                </h4>
                                <div className="grid grid-cols-3 gap-4">
                                  <div>
                                    <p className="mb-1 text-xs text-gray-600">
                                      Flexión
                                    </p>
                                    <p className="font-bold text-gray-900">
                                      {session.rom.flexion}°
                                    </p>
                                  </div>
                                  <div>
                                    <p className="mb-1 text-xs text-gray-600">
                                      Abducción
                                    </p>
                                    <p className="font-bold text-gray-900">
                                      {session.rom.abduction}°
                                    </p>
                                  </div>
                                  <div>
                                    <p className="mb-1 text-xs text-gray-600">
                                      Rotación
                                    </p>
                                    <p className="font-bold text-gray-900">
                                      {session.rom.rotation}°
                                    </p>
                                  </div>
                                </div>
                              </div>
                            )}

                            <div className="mb-4">
                              <h4 className="mb-2 text-sm font-semibold text-gray-900">
                                Técnicas Aplicadas
                              </h4>
                              <div className="flex flex-wrap gap-2">
                                {session.techniques.map((technique, idx) => (
                                  <span
                                    key={idx}
                                    className="px-3 py-1 text-xs text-teal-700 bg-teal-100 rounded-full"
                                  >
                                    {technique}
                                  </span>
                                ))}
                              </div>
                            </div>

                            {session.exercises && (
                              <div className="mb-4">
                                <h4 className="mb-2 text-sm font-semibold text-gray-900">
                                  Ejercicios Realizados
                                </h4>
                                <div className="flex flex-wrap gap-2">
                                  {session.exercises.map((exercise, idx) => (
                                    <span
                                      key={idx}
                                      className="px-3 py-1 text-xs text-purple-700 bg-purple-100 rounded-full"
                                    >
                                      {exercise}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}

                            {session.notes && (
                              <div className="p-3 mb-3 bg-white rounded-lg">
                                <h4 className="mb-1 text-sm font-semibold text-gray-900">
                                  Notas de la Sesión
                                </h4>
                                <p className="text-sm text-gray-600">
                                  {session.notes}
                                </p>
                              </div>
                            )}

                            {session.homework && (
                              <div className="p-3 mb-3 border-l-4 border-blue-500 rounded-lg bg-blue-50">
                                <h4 className="mb-1 text-sm font-semibold text-gray-900">
                                  Indicaciones para Casa
                                </h4>
                                <p className="text-sm text-gray-700">
                                  {session.homework}
                                </p>
                              </div>
                            )}

                            {session.nextGoals && (
                              <div className="p-3 border-l-4 border-yellow-500 rounded-lg bg-yellow-50">
                                <h4 className="mb-1 text-sm font-semibold text-gray-900">
                                  Objetivos Próxima Sesión
                                </h4>
                                <p className="text-sm text-gray-700">
                                  {session.nextGoals}
                                </p>
                              </div>
                            )}
                          </>
                        )}

                        {session.status === "Programada" && (
                          <div className="py-4 text-center">
                            <p className="mb-3 text-gray-500">
                              Sesión programada - Pendiente de realizar
                            </p>
                            <button className="px-4 py-2 text-sm text-white bg-teal-600 rounded-lg hover:bg-teal-700">
                              Iniciar Sesión
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === "exercises" && (
            <div className="p-6 bg-white shadow-lg rounded-xl">
              <h2 className="flex items-center gap-2 mb-6 text-2xl font-bold text-gray-900">
                <Repeat className="w-6 h-6 text-teal-600" />
                Plan de Ejercicios
              </h2>

              {patient.treatments
                .filter((t) => t.status === "Activo")
                .map((treatment) => (
                  <div key={treatment.id} className="mb-8">
                    <div className="flex items-center justify-between pb-3 mb-4 border-b-2 border-teal-200">
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">
                          {treatment.name}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {treatment.currentPhase}
                        </p>
                      </div>
                      <button className="flex items-center gap-2 text-teal-600 hover:text-teal-700">
                        <Video className="w-4 h-4" />
                        <span className="text-sm font-medium">
                          Ver Todos los Videos
                        </span>
                      </button>
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      {treatment.exercises.map((exercise, idx) => (
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
                                <PlayCircle className="w-5 h-5" />
                              </button>
                            )}
                          </div>
                          <div className="p-3 text-sm text-gray-600 rounded-lg bg-gray-50">
                            <p>
                              Instrucciones detalladas del ejercicio irían
                              aquí...
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
            </div>
          )}

          {activeTab === "payments" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className="p-6 text-white bg-gradient-to-br from-green-500 to-green-600 rounded-xl">
                  <div className="flex items-center gap-3 mb-2">
                    <CheckCircle className="w-8 h-8" />
                    <h3 className="text-lg font-semibold">Total Pagado</h3>
                  </div>
                  <p className="text-3xl font-bold">
                    ${totalPaid.toLocaleString("es-CL")}
                  </p>
                </div>

                <div className="p-6 text-white bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl">
                  <div className="flex items-center gap-3 mb-2">
                    <Clock className="w-8 h-8" />
                    <h3 className="text-lg font-semibold">Pendiente</h3>
                  </div>
                  <p className="text-3xl font-bold">
                    ${totalPending.toLocaleString("es-CL")}
                  </p>
                </div>

                <div className="p-6 text-white bg-gradient-to-br from-teal-500 to-teal-600 rounded-xl">
                  <div className="flex items-center gap-3 mb-2">
                    <DollarSign className="w-8 h-8" />
                    <h3 className="text-lg font-semibold">Total</h3>
                  </div>
                  <p className="text-3xl font-bold">
                    ${(totalPaid + totalPending).toLocaleString("es-CL")}
                  </p>
                </div>
              </div>

              <div className="p-6 bg-white shadow-lg rounded-xl">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="flex items-center gap-2 text-2xl font-bold text-gray-900">
                    <CreditCard className="w-6 h-6 text-teal-600" />
                    Historial de Pagos
                  </h2>
                  <button className="flex items-center gap-2 px-4 py-2 text-white bg-teal-600 rounded-lg hover:bg-teal-700">
                    <Plus className="w-4 h-4" />
                    Registrar Pago
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-xs font-semibold text-left text-gray-600 uppercase">
                          Fecha
                        </th>
                        <th className="px-4 py-3 text-xs font-semibold text-left text-gray-600 uppercase">
                          Concepto
                        </th>
                        <th className="px-4 py-3 text-xs font-semibold text-left text-gray-600 uppercase">
                          Factura
                        </th>
                        <th className="px-4 py-3 text-xs font-semibold text-right text-gray-600 uppercase">
                          Copago
                        </th>
                        <th className="px-4 py-3 text-xs font-semibold text-right text-gray-600 uppercase">
                          Isapre
                        </th>
                        <th className="px-4 py-3 text-xs font-semibold text-right text-gray-600 uppercase">
                          Total
                        </th>
                        <th className="px-4 py-3 text-xs font-semibold text-left text-gray-600 uppercase">
                          Método
                        </th>
                        <th className="px-4 py-3 text-xs font-semibold text-center text-gray-600 uppercase">
                          Estado
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {patient.payments.map((payment) => (
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
                            ${payment.copay.toLocaleString("es-CL")}
                          </td>
                          <td className="px-4 py-3 text-sm text-right text-gray-900">
                            ${payment.insuranceCovered.toLocaleString("es-CL")}
                          </td>
                          <td className="px-4 py-3 text-sm font-semibold text-right text-gray-900">
                            ${payment.amount.toLocaleString("es-CL")}
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
                  <FileText className="w-6 h-6 text-teal-600" />
                  Documentos Clínicos
                </h2>
                <button className="flex items-center gap-2 px-4 py-2 text-white bg-teal-600 rounded-lg hover:bg-teal-700">
                  <Plus className="w-4 h-4" />
                  Subir Documento
                </button>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {patient.documents.map((doc) => (
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
                      <button className="flex items-center justify-center flex-1 gap-1 py-2 text-sm font-medium text-teal-600 rounded-lg bg-teal-50 hover:bg-teal-100">
                        <Download className="w-4 h-4" />
                        Descargar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </AuthenticatedLayout>
  );
}

export default DetailPatient;
