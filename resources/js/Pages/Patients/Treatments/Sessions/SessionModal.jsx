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
}) {
  const isEditing = !!session?.id;
  const [techniqueInput, setTechniqueInput] = useState("");
  const [exerciseInput, setExerciseInput] = useState("");
  const { data, setData, patch, post, processing, errors, reset } = useForm({
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
      patch(route("sessions.update", session.id), {
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
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Título Principal */}
        <header className="flex items-center gap-3 pb-4 border-b border-gray-200 dark:border-gray-700">
          <ListChecks className="w-8 h-8 text-blue-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Registro de Sesión de Kinesiología
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {isDuplicate
                ? "Duplicando Sesión"
                : `Sesión Mensual #${data.month_session_number || "N/A"}`}
            </p>
          </div>
        </header>

        {/* Información General y Programación */}
        <div className="p-6 bg-white border border-gray-200 rounded-lg dark:border-gray-700 dark:bg-gray-800">
          <h2 className="flex items-center gap-2 mb-4 text-xl font-semibold text-gray-900 dark:text-white">
            <Calendar className="w-6 h-6 text-blue-600" />
            Información de Programación
          </h2>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* Kinesiólogo */}
            <SearchSelect
              items={doctors}
              value={data.doctor_id}
              onChange={(value) => setData("doctor_id", value)}
              config={{
                valueKey: "id",
                displayKey: "name",
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
              placeholder="Seleccionar Kinesiólogo..."
            />

            {/* Tipo de Sesión */}
            <SearchSelect
              items={session_types}
              value={data.session_type_id}
              onChange={(value) => setData("session_type_id", value)}
              config={{
                valueKey: "id",
                displayKey: "name",
                secondaryKeys: [],
                searchKeys: ["name"],
                renderItem: (item) => (
                  <p className="font-medium text-gray-900 dark:text-white">
                    {item.name}
                  </p>
                ),
              }}
              label="Tipo de Sesión *"
              placeholder="Seleccionar Tipo..."
            />

            {/* Fecha, Hora y Duración (Agrupados) */}
            <div className="grid grid-cols-3 col-span-2 gap-4 p-4 border border-blue-100 rounded-lg bg-blue-50 dark:border-blue-700 dark:bg-blue-900/10">
              {/* Fecha */}
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
              {/* Hora */}
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
              {/* Duración */}
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                  Duración (min) *
                </label>
                <input
                  type="number"
                  min="15"
                  step="15"
                  value={data.duration}
                  onChange={(e) =>
                    setData("duration", parseInt(e.target.value) || 0)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  required
                />
                {errors.duration && (
                  <p className="mt-1 text-sm text-red-600">{errors.duration}</p>
                )}
              </div>
            </div>

            {/* Estado (al final para dejarlo claro) */}
            <div className="col-span-2">
              <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                Estado *
              </label>
              <select
                value={data.status}
                onChange={(e) => setData("status", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                required
              >
                <option value="scheduled">Programada 📅</option>
                <option value="completed">Completada ✅</option>
                <option value="cancelled">Cancelada ❌</option>
              </select>
              {errors.status && (
                <p className="mt-1 text-sm text-red-600">{errors.status}</p>
              )}
            </div>

            {/* Campo condicional para CANCELADA - Sugerencia de Lógica */}
            {data.status === "cancelled" && (
              <div className="col-span-2 p-3 border border-red-300 rounded-lg bg-red-50 dark:border-red-700 dark:bg-red-900/10">
                <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                  Motivo de Cancelación *
                </label>
                <textarea
                  value={data.cancellation_note} // Asumiendo que tienes este campo en `data`
                  onChange={(e) => setData("cancellation_note", e.target.value)}
                  rows="2"
                  placeholder="Detalles sobre por qué se canceló la sesión."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  required
                />
              </div>
            )}
          </div>
        </div>

        {/* Sección de Resultados: Métrica de Dolor, ROM, Técnicas, Notas (SOLO SI COMPLETADA) */}
        {data.status === "completed" && (
          <>
            {/* Evaluación del Dolor */}
            <div className="p-6 bg-white border border-gray-200 rounded-lg dark:border-gray-700 dark:bg-gray-800">
              <h2 className="flex items-center gap-2 mb-6 text-xl font-semibold text-gray-900 dark:text-white">
                <TrendingDown className="w-6 h-6 text-red-600" />
                Evaluación del Dolor (Escala Visual Analógica - EVA)
              </h2>

              {/* Preview Stats - Mantenemos tus cards por ser muy visuales */}
              <div className="grid grid-cols-2 gap-4 mb-6 md:grid-cols-4">
                <div className="p-3 border-l-4 border-red-500 rounded-lg bg-red-50 dark:bg-red-900/10">
                  <p className="mb-1 text-xs font-medium text-gray-600 dark:text-gray-400">
                    Dolor Inicial
                  </p>
                  <p className="text-2xl font-bold text-red-600">
                    {data.pain_before || 0}/10
                  </p>
                </div>
                <div className="p-3 border-l-4 border-green-500 rounded-lg bg-green-50 dark:bg-green-900/10">
                  <p className="mb-1 text-xs font-medium text-gray-600 dark:text-gray-400">
                    Dolor Final
                  </p>
                  <p className="text-2xl font-bold text-green-600">
                    {data.pain_after || 0}/10
                  </p>
                </div>
                <div className="p-3 border-l-4 border-blue-500 rounded-lg bg-blue-50 dark:bg-blue-900/10">
                  <p className="mb-1 text-xs font-medium text-gray-600 dark:text-gray-400">
                    Mejoría
                  </p>
                  <p className="text-2xl font-bold text-blue-600">
                    {data.pain_before - data.pain_after} Puntos
                  </p>
                </div>
                <div className="p-3 border-l-4 border-teal-500 rounded-lg bg-teal-50 dark:bg-teal-900/10">
                  <p className="mb-1 text-xs font-medium text-gray-600 dark:text-gray-400">
                    Progreso
                  </p>
                  <p className="text-2xl font-bold text-teal-600">
                    {painImprovement}%
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {/* Dolor Inicial */}
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
                  {/* Slider con etiquetas de referencia para mejor UX */}
                  <div className="relative mt-2">
                    <input
                      type="range"
                      min="0"
                      max="10"
                      value={data.pain_before}
                      onChange={(e) =>
                        setData("pain_before", parseInt(e.target.value))
                      }
                      className="w-full"
                    />
                    <div className="flex justify-between mt-1 text-xs text-gray-500 dark:text-gray-400">
                      <span>0 - Sin Dolor</span>
                      <span>10 - Peor Dolor Posible</span>
                    </div>
                  </div>
                </div>

                {/* Dolor Final */}
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
                  <div className="relative mt-2">
                    <input
                      type="range"
                      min="0"
                      max="10"
                      value={data.pain_after}
                      onChange={(e) =>
                        setData("pain_after", parseInt(e.target.value))
                      }
                      className="w-full"
                    />
                    <div className="flex justify-between mt-1 text-xs text-gray-500 dark:text-gray-400">
                      <span>0 - Sin Dolor</span>
                      <span>10 - Peor Dolor Posible</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Rango de Movimiento (ROM) */}
            <div className="p-6 bg-white border border-gray-200 rounded-lg dark:border-gray-700 dark:bg-gray-800">
              <h2 className="flex items-center gap-2 mb-6 text-xl font-semibold text-gray-900 dark:text-white">
                <Activity className="w-6 h-6 text-purple-600" />
                Rango de Movimiento (ROM) - Ángulos en Grados (°)
              </h2>

              <div className="space-y-4">
                {/* Flexión */}
                <div className="grid grid-cols-1 gap-4 p-4 rounded-lg shadow-sm md:grid-cols-2 bg-red-50 dark:bg-red-900/10">
                  <p className="col-span-2 text-sm font-semibold text-red-700 dark:text-red-300">
                    Flexión (Ej: Hombro/Rodilla)
                  </p>
                  <div>
                    <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                      Pre-Sesión (°)
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
                      Post-Sesión (°)
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

                {/* Abducción */}
                <div className="grid grid-cols-1 gap-4 p-4 rounded-lg shadow-sm md:grid-cols-2 bg-blue-50 dark:bg-blue-900/10">
                  <p className="col-span-2 text-sm font-semibold text-blue-700 dark:text-blue-300">
                    Abducción (Ej: Hombro/Cadera)
                  </p>
                  <div>
                    <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                      Pre-Sesión (°)
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
                      Post-Sesión (°)
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

                {/* Rotación */}
                <div className="grid grid-cols-1 gap-4 p-4 rounded-lg shadow-sm md:grid-cols-2 bg-gray-50 dark:bg-gray-700/50">
                  <p className="col-span-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Rotación (Ej: Hombro/Columna)
                  </p>
                  <div>
                    <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                      Pre-Sesión (°)
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
                      Post-Sesión (°)
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

            {/* Técnicas y Ejercicios (Agrupados en una fila) */}
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
              {/* Técnicas Aplicadas */}
              <div className="p-6 bg-white border border-gray-200 rounded-lg dark:border-gray-700 dark:bg-gray-800">
                <h2 className="flex items-center gap-2 mb-4 text-xl font-semibold text-gray-900 dark:text-white">
                  <Dumbbell className="w-6 h-6 text-teal-600" />
                  Técnicas Aplicadas
                </h2>

                <div className="flex gap-2 mb-4">
                  <input
                    type="text"
                    value={techniqueInput}
                    onChange={(e) => setTechniqueInput(e.target.value)}
                    onKeyPress={(e) =>
                      e.key === "Enter" && (e.preventDefault(), addTechnique())
                    }
                    placeholder="Ej: Masaje profundo, Movilización..."
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                  <button
                    type="button"
                    onClick={addTechnique}
                    className="px-4 py-2 text-sm font-medium text-white bg-teal-600 rounded-lg hover:bg-teal-700 disabled:opacity-50"
                    disabled={!techniqueInput.trim()} // Deshabilitar si está vacío
                  >
                    Agregar
                  </button>
                </div>

                <div className="flex flex-wrap gap-2 min-h-[40px] p-2 border border-dashed border-teal-300 rounded-lg bg-teal-50 dark:bg-teal-900/10">
                  {data.techniques.length === 0 && (
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Aún no hay técnicas aplicadas.
                    </p>
                  )}
                  {data.techniques.map((technique, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center gap-2 px-3 py-1 text-sm font-medium text-teal-700 bg-teal-100 rounded-full dark:bg-teal-900 dark:text-teal-300"
                    >
                      {technique}
                      <button
                        type="button"
                        onClick={() => removeTechnique(index)}
                        className="text-teal-600 hover:text-teal-800 dark:text-teal-400 dark:hover:text-teal-200"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Ejercicios Realizados */}
              <div className="p-6 bg-white border border-gray-200 rounded-lg dark:border-gray-700 dark:bg-gray-800">
                <h2 className="flex items-center gap-2 mb-4 text-xl font-semibold text-gray-900 dark:text-white">
                  <Activity className="w-6 h-6 text-purple-600" />
                  Ejercicios Realizados
                </h2>

                <div className="flex gap-2 mb-4">
                  <input
                    type="text"
                    value={exerciseInput}
                    onChange={(e) => setExerciseInput(e.target.value)}
                    onKeyPress={(e) =>
                      e.key === "Enter" && (e.preventDefault(), addExercise())
                    }
                    placeholder="Ej: Estiramiento, Fortalecimiento..."
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                  <button
                    type="button"
                    onClick={addExercise}
                    className="px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700 disabled:opacity-50"
                    disabled={!exerciseInput.trim()} // Deshabilitar si está vacío
                  >
                    Agregar
                  </button>
                </div>

                <div className="flex flex-wrap gap-2 min-h-[40px] p-2 border border-dashed border-purple-300 rounded-lg bg-purple-50 dark:bg-purple-900/10">
                  {data.exercises.length === 0 && (
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Aún no hay ejercicios registrados.
                    </p>
                  )}
                  {data.exercises.map((exercise, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center gap-2 px-3 py-1 text-sm font-medium text-purple-700 bg-purple-100 rounded-full dark:bg-purple-900 dark:text-purple-300"
                    >
                      {exercise}
                      <button
                        type="button"
                        onClick={() => removeExercise(index)}
                        className="text-purple-600 hover:text-purple-800 dark:text-purple-400 dark:hover:text-purple-200"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Notas y Objetivos (Grilla 2x2 para ahorrar espacio) */}
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
              {/* Notas de la Sesión */}
              <div className="p-6 bg-white border border-gray-200 rounded-lg dark:border-gray-700 dark:bg-gray-800">
                <h2 className="flex items-center gap-2 mb-4 text-xl font-semibold text-gray-900 dark:text-white">
                  <FileText className="w-6 h-6 text-gray-600" />
                  Notas y Observaciones
                </h2>

                <textarea
                  value={data.notes}
                  onChange={(e) => setData("notes", e.target.value)}
                  rows="5"
                  placeholder="Observaciones generales de la sesión, respuesta del paciente, etc."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>

              {/* Indicaciones para Casa */}
              <div className="p-6 border border-blue-300 rounded-lg bg-blue-50 dark:border-blue-700 dark:bg-blue-900/10">
                <h2 className="flex items-center gap-2 mb-4 text-xl font-semibold text-gray-900 dark:text-white">
                  <Home className="w-6 h-6 text-blue-600" />
                  Indicaciones para Casa (Tarea)
                </h2>

                <textarea
                  value={data.homework}
                  onChange={(e) => setData("homework", e.target.value)}
                  rows="5"
                  placeholder="Ejercicios o recomendaciones específicas para realizar en casa."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>

              {/* Objetivos Próxima Sesión (Destacado) */}
              <div className="col-span-1 p-6 border border-yellow-300 rounded-lg md:col-span-2 bg-yellow-50 dark:border-yellow-700 dark:bg-yellow-900/10">
                <h2 className="flex items-center gap-2 mb-4 text-xl font-semibold text-gray-900 dark:text-white">
                  <Target className="w-6 h-6 text-yellow-600" />
                  Objetivos Próxima Sesión
                </h2>

                <textarea
                  value={data.next_goals}
                  onChange={(e) => setData("next_goals", e.target.value)}
                  rows="3"
                  placeholder="Metas y objetivos a trabajar en la siguiente sesión."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
            </div>
          </>
        )}

        {/* Botones de Acción */}
        <div className="flex justify-end gap-3 pt-6">
          <button
            type="button"
            onClick={handleCancel}
            className="px-6 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600"
            disabled={processing}
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={processing}
          >
            {processing
              ? isDuplicate
                ? "Duplicando..."
                : isEditing
                ? "Guardando..."
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
