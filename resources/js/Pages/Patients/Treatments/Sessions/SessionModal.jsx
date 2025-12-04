import React, { useState, useEffect } from "react";
import { useForm } from "@inertiajs/react";
import {
  Calendar,
  Activity,
  TrendingDown,
  Dumbbell,
  FileText,
  Home,
  Target,
  ListChecks,
} from "lucide-react";
import moment from "moment";
import SearchSelect from "@/Components/SearchSelect";

export default function SessionModal({
  session,
  setOpenSessionModal,
  doctors,
  treatment,
  session_types,
  patient,
  isDuplicate = false,
  afterSubmitReloadOnly = [],
}) {
  const isEditing = !!session?.id;
  const [techniqueInput, setTechniqueInput] = useState("");
  const [exerciseInput, setExerciseInput] = useState("");
  const { data, setData, put, post, processing, errors, reset } = useForm({
    treatment_id: session?.treatment_id || "",
    month_session_number: session?.month_session_number || "",
    date: session?.date
      ? moment.utc(session.date).format("YYYY-MM-DD")
      : moment.utc(Date.now()).format("YYYY-MM-DD"),
    time: session?.time || "",
    duration: session?.duration || 60,
    status: session?.status || "scheduled",
    doctor_id: session?.doctor?.id || "",
    patient_id: patient?.id || "",
    session_type_id: session?.session_type_id || "",
    // Métricas de dolor
    pain_before: session?.pain_before || 0,
    pain_after: session?.pain_after || 0,
    // ROM (Rango de Movimiento)
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
  });

  useEffect(() => {
    if (session) {
      setData({
        treatment_id: treatment?.id || "",
        month_session_number: session.month_session_number || "",
        date: session?.date
          ? moment.utc(session.date).format("YYYY-MM-DD")
          : moment.utc(Date.now()).format("YYYY-MM-DD"),
        time: session.time || "",
        duration: session.duration || 60,
        status: session.status || "scheduled",
        doctor_id: session.doctor?.id || "",
        patient_id: patient?.id || "",
        session_type_id: session.session_type_id || "",
        pain_before: session.pain_before || 0,
        pain_after: session.pain_after || 0,
        rom_flexion: session.rom?.rom_flexion || "",
        rom_abduction: session.rom?.rom_abduction || "",
        rom_rotation: session.rom?.rom_rotation || "",
        techniques: session.techniques || [],
        exercises: session.exercises || [],
        notes: session.notes || "",
        homework: session.homework || "",
        next_goals: session.next_goals || "",
      });
    }
  }, [session]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isDuplicate) {
      post(route("sessions.store"), {
        onSuccess: () => {
          setOpenSessionModal(false);
          reset();
        },
        onError: () => {
          alert(errors.general || "Ocurrió un error al guardar la sesión.");
        },
      });
    } else if (session?.id) {
      put(route("sessions.update", session.id), {
        onSuccess: () => {
          setOpenSessionModal(false);
          reset();
        },
        onError: () => {
          alert(errors.general || "Ocurrió un error al guardar la sesión.");
        },
      });
    } else {
      post(route("sessions.store"), {
        onSuccess: () => {
          setOpenSessionModal(false);
          reset();
        },
        onError: () => {
          alert(errors.general || "Ocurrió un error al guardar la sesión.");
        },
      });
    }
  };

  const handleCancel = () => {
    reset();
    setOpenSessionModal(false);
  };

  const addTechnique = () => {
    if (techniqueInput.trim()) {
      setData("techniques", [...data.techniques, techniqueInput.trim()]);
      setTechniqueInput("");
    }
  };

  const removeTechnique = (index) => {
    setData(
      "techniques",
      data.techniques.filter((_, i) => i !== index)
    );
  };

  const addExercise = () => {
    if (exerciseInput.trim()) {
      setData("exercises", [...data.exercises, exerciseInput.trim()]);
      setExerciseInput("");
    }
  };

  const removeExercise = (index) => {
    setData(
      "exercises",
      data.exercises.filter((_, i) => i !== index)
    );
  };

  const painImprovement =
    data.pain_before > 0
      ? Math.round(
          ((data.pain_before - data.pain_after) / data.pain_before) * 100
        )
      : 0;

  return (
    <div>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Información Básica */}
        <div className="p-4 border border-gray-200 rounded-lg dark:border-gray-700">
          <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
            <Calendar className="w-5 h-5 text-blue-600" />
            Información Básica{" "}
          </h3>
          <h3 className="flex items-center gap-2 mb-4 text-lg font-semibold text-gray-900 dark:text-white">
            <ListChecks className="w-5 h-5 text-blue-600" />
            {isDuplicate ? (
              "Duplicando Sesión"
            ) : (
              <div>
                {data.month_session_number &&
                  ` / Sesión Mensual #${data.month_session_number}`}
              </div>
            )}
          </h3>
          <hr className="my-4" />
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <SearchSelect
              items={doctors}
              value={data.doctor_id}
              onChange={(value) => setData("doctor_id", value)}
              config={{
                valueKey: "id",
                displayKey: "name", // Dejamos uno solo
                secondaryKeys: ["email"],
                searchKeys: ["name", "last_name", "email"],
                renderItem: (item) => (
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {item.name} {item.last_name}
                    </p>
                    <div className="flex gap-3 mt-1 text-xs text-gray-500">
                      <span>📧 {item.email}</span>
                    </div>
                  </div>
                ),
              }}
              label="Kinesiolog@ *"
              placeholder="Buscar..."
            />
            <SearchSelect
              items={session_types}
              value={data.session_type_id}
              onChange={(value) => setData("session_type_id", value)}
              config={{
                valueKey: "id",
                displayKey: "name", // Dejamos uno solo
                secondaryKeys: [],
                searchKeys: ["name"],
                renderItem: (item) => (
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {item.name}
                    </p>
                  </div>
                ),
              }}
              label="Tipo de Sesión *"
              placeholder="Buscar..."
            />
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                Estado *
              </label>
              <select
                value={data.status}
                onChange={(e) => setData("status", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                required
              >
                <option value="scheduled">Programada</option>
                <option value="completed">Completada</option>
                <option value="cancelled">Cancelada</option>
              </select>
              {errors.status && (
                <p className="mt-1 text-sm text-red-600">{errors.status}</p>
              )}
            </div>

            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                Fecha *
              </label>
              <input
                type="date"
                value={data.date}
                onChange={(e) => setData("date", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                required
              />
              {errors.date && (
                <p className="mt-1 text-sm text-red-600">{errors.date}</p>
              )}
            </div>

            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                Hora *
              </label>
              <input
                type="time"
                value={data.time}
                onChange={(e) => setData("time", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                required
              />
              {errors.time && (
                <p className="mt-1 text-sm text-red-600">{errors.time}</p>
              )}
            </div>

            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                Duración (minutos) *
              </label>
              <input
                type="number"
                min="15"
                step="15"
                value={data.duration}
                onChange={(e) => setData("duration", parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                required
              />
              {errors.duration && (
                <p className="mt-1 text-sm text-red-600">{errors.duration}</p>
              )}
            </div>
          </div>
        </div>

        {/* Métricas de Dolor */}
        {data.status === "Completada" && (
          <>
            <div className="p-4 border border-gray-200 rounded-lg dark:border-gray-700">
              <h3 className="flex items-center gap-2 mb-4 text-lg font-semibold text-gray-900 dark:text-white">
                <TrendingDown className="w-5 h-5 text-red-600" />
                Evaluación del Dolor
              </h3>

              {/* Preview Stats */}
              <div className="grid grid-cols-2 gap-4 mb-4 md:grid-cols-4">
                <div className="p-3 border-l-4 border-red-500 rounded-lg bg-gradient-to-br from-red-50 to-transparent">
                  <p className="mb-1 text-xs text-gray-600">Dolor Inicial</p>
                  <p className="text-2xl font-bold text-red-600">
                    {data.pain_before}/10
                  </p>
                </div>
                <div className="p-3 border-l-4 border-green-500 rounded-lg bg-gradient-to-br from-green-50 to-transparent">
                  <p className="mb-1 text-xs text-gray-600">Dolor Final</p>
                  <p className="text-2xl font-bold text-green-600">
                    {data.pain_after}/10
                  </p>
                </div>
                <div className="p-3 border-l-4 border-blue-500 rounded-lg bg-gradient-to-br from-blue-50 to-transparent">
                  <p className="mb-1 text-xs text-gray-600">Mejoría</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {data.pain_before - data.pain_after}
                  </p>
                </div>
                <div className="p-3 border-l-4 border-teal-500 rounded-lg bg-gradient-to-br from-teal-50 to-transparent">
                  <p className="mb-1 text-xs text-gray-600">Progreso</p>
                  <p className="text-2xl font-bold text-teal-600">
                    {painImprovement}%
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                    Dolor Inicial (0-10)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="10"
                    value={data.pain_before}
                    onChange={(e) =>
                      setData("pain_before", parseInt(e.target.value) || 0)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                  <input
                    type="range"
                    min="0"
                    max="10"
                    value={data.pain_before}
                    onChange={(e) =>
                      setData("pain_before", parseInt(e.target.value))
                    }
                    className="w-full mt-2"
                  />
                </div>

                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                    Dolor Final (0-10)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="10"
                    value={data.pain_after}
                    onChange={(e) =>
                      setData("pain_after", parseInt(e.target.value) || 0)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                  <input
                    type="range"
                    min="0"
                    max="10"
                    value={data.pain_after}
                    onChange={(e) =>
                      setData("pain_after", parseInt(e.target.value))
                    }
                    className="w-full mt-2"
                  />
                </div>
              </div>
            </div>

            {/* ROM (Rango de Movimiento) */}
            <div className="p-2 border border-gray-200 rounded-lg dark:border-gray-700">
              <h3 className="flex items-center gap-2 mb-4 text-lg font-semibold text-gray-900 dark:text-white">
                <Activity className="w-5 h-5 text-purple-600" />
                Rango de Movimiento (ROM)
              </h3>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-1">
                <div className="grid grid-cols-1 gap-4 p-2 bg-red-100 rounded-lg shadow-sm md:grid-cols-2">
                  <div>
                    <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                      Flexión Inicial (°)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="180"
                      value={data.rom_flexion_before}
                      onChange={(e) =>
                        setData(
                          "rom_flexion_before",
                          parseInt(e.target.value) || 0
                        )
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                    <input
                      type="range"
                      min="0"
                      max="180"
                      value={data.rom_flexion_before}
                      onChange={(e) =>
                        setData("rom_flexion_before", parseInt(e.target.value))
                      }
                      className="w-full mt-2"
                    />
                  </div>

                  <div>
                    <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                      Flexión Final (°)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="180"
                      value={data.rom_flexion_after}
                      onChange={(e) =>
                        setData(
                          "rom_flexion_after",
                          parseInt(e.target.value) || 0
                        )
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                    <input
                      type="range"
                      min="0"
                      max="180"
                      value={data.rom_flexion_after}
                      onChange={(e) =>
                        setData("rom_flexion_after", parseInt(e.target.value))
                      }
                      className="w-full mt-2"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-4 p-2 bg-blue-100 rounded-lg shadow-sm md:grid-cols-2">
                  <div>
                    <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                      Abducción Inicial (°)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="180"
                      value={data.rom_abduction_before}
                      onChange={(e) =>
                        setData(
                          "rom_abduction_before",
                          parseInt(e.target.value) || 0
                        )
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                    <input
                      type="range"
                      min="0"
                      max="180"
                      value={data.rom_abduction_before}
                      onChange={(e) =>
                        setData(
                          "rom_abduction_before",
                          parseInt(e.target.value)
                        )
                      }
                      className="w-full mt-2"
                    />
                  </div>

                  <div>
                    <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                      Abducción Final (°)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="180"
                      value={data.rom_abduction_after}
                      onChange={(e) =>
                        setData(
                          "rom_abduction_after",
                          parseInt(e.target.value) || 0
                        )
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                    <input
                      type="range"
                      min="0"
                      max="180"
                      value={data.rom_abduction_after}
                      onChange={(e) =>
                        setData("rom_abduction_after", parseInt(e.target.value))
                      }
                      className="w-full mt-2"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 p-2 rounded-lg shadow-sm md:grid-cols-2 bg-black/5">
                  <div>
                    <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                      Rotación Inicial (°)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="180"
                      value={data.rom_rotation_before}
                      onChange={(e) =>
                        setData(
                          "rom_rotation_before",
                          parseInt(e.target.value) || 0
                        )
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                    <input
                      type="range"
                      min="0"
                      max="180"
                      value={data.rom_rotation_before}
                      onChange={(e) =>
                        setData("rom_rotation_before", parseInt(e.target.value))
                      }
                      className="w-full mt-2"
                    />
                  </div>

                  <div>
                    <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                      Rotación Final (°)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="180"
                      value={data.rom_rotation_after}
                      onChange={(e) =>
                        setData(
                          "rom_rotation_after",
                          parseInt(e.target.value) || 0
                        )
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                    <input
                      type="range"
                      min="0"
                      max="180"
                      value={data.rom_rotation_after}
                      onChange={(e) =>
                        setData("rom_rotation_after", parseInt(e.target.value))
                      }
                      className="w-full mt-2"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Técnicas Aplicadas */}
            <div className="p-4 border border-gray-200 rounded-lg dark:border-gray-700">
              <h3 className="flex items-center gap-2 mb-4 text-lg font-semibold text-gray-900 dark:text-white">
                <Dumbbell className="w-5 h-5 text-teal-600" />
                Técnicas Aplicadas
              </h3>

              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={techniqueInput}
                  onChange={(e) => setTechniqueInput(e.target.value)}
                  onKeyPress={(e) =>
                    e.key === "Enter" && (e.preventDefault(), addTechnique())
                  }
                  placeholder="Ej: Masaje profundo, Movilización articular..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
                <button
                  type="button"
                  onClick={addTechnique}
                  className="px-4 py-2 text-sm font-medium text-white bg-teal-600 rounded-lg hover:bg-teal-700"
                >
                  Agregar
                </button>
              </div>

              <div className="flex flex-wrap gap-2">
                {data.techniques.map((technique, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-2 px-3 py-1 text-sm font-medium text-teal-700 bg-teal-100 rounded-full"
                  >
                    {technique}
                    <button
                      type="button"
                      onClick={() => removeTechnique(index)}
                      className="text-teal-600 hover:text-teal-800"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Ejercicios Realizados */}
            <div className="p-4 border border-gray-200 rounded-lg dark:border-gray-700">
              <h3 className="flex items-center gap-2 mb-4 text-lg font-semibold text-gray-900 dark:text-white">
                <Activity className="w-5 h-5 text-purple-600" />
                Ejercicios Realizados
              </h3>

              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={exerciseInput}
                  onChange={(e) => setExerciseInput(e.target.value)}
                  onKeyPress={(e) =>
                    e.key === "Enter" && (e.preventDefault(), addExercise())
                  }
                  placeholder="Ej: Estiramiento de cuádriceps, Fortalecimiento..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
                <button
                  type="button"
                  onClick={addExercise}
                  className="px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700"
                >
                  Agregar
                </button>
              </div>

              <div className="flex flex-wrap gap-2">
                {data.exercises.map((exercise, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-2 px-3 py-1 text-sm font-medium text-purple-700 bg-purple-100 rounded-full"
                  >
                    {exercise}
                    <button
                      type="button"
                      onClick={() => removeExercise(index)}
                      className="text-purple-600 hover:text-purple-800"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Notas y Observaciones */}
            <div className="p-4 border border-gray-200 rounded-lg dark:border-gray-700">
              <h3 className="flex items-center gap-2 mb-4 text-lg font-semibold text-gray-900 dark:text-white">
                <FileText className="w-5 h-5 text-gray-600" />
                Notas de la Sesión
              </h3>

              <textarea
                value={data.notes}
                onChange={(e) => setData("notes", e.target.value)}
                rows="4"
                placeholder="Observaciones generales de la sesión..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>

            {/* Indicaciones para Casa */}
            <div className="p-4 border border-blue-200 rounded-lg bg-blue-50 dark:border-blue-700 dark:bg-blue-900/20">
              <h3 className="flex items-center gap-2 mb-4 text-lg font-semibold text-gray-900 dark:text-white">
                <Home className="w-5 h-5 text-blue-600" />
                Indicaciones para Casa
              </h3>

              <textarea
                value={data.homework}
                onChange={(e) => setData("homework", e.target.value)}
                rows="3"
                placeholder="Ejercicios o recomendaciones para realizar en casa..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>

            {/* Objetivos Próxima Sesión */}
            <div className="p-4 border border-yellow-200 rounded-lg bg-yellow-50 dark:border-yellow-700 dark:bg-yellow-900/20">
              <h3 className="flex items-center gap-2 mb-4 text-lg font-semibold text-gray-900 dark:text-white">
                <Target className="w-5 h-5 text-yellow-600" />
                Objetivos Próxima Sesión
              </h3>

              <textarea
                value={data.next_goals}
                onChange={(e) => setData("next_goals", e.target.value)}
                rows="3"
                placeholder="Metas y objetivos a trabajar en la siguiente sesión..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
          </>
        )}

        {/* Buttons */}
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          <button
            type="button"
            onClick={handleCancel}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600"
            disabled={processing}
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={processing}
          >
            {processing
              ? isDuplicate
                ? "Duplicando..."
                : isEditing
                ? "Actualizando..."
                : "Creando..."
              : isDuplicate
              ? "Duplicar Sesión"
              : isEditing
              ? "Actualizar Sesión"
              : "Crear Sesión"}
          </button>
        </div>
      </form>
    </div>
  );
}
