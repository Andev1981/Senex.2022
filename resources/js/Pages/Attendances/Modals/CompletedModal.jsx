import React, { useState, useEffect } from "react";
import { fmtDate } from "@/utils/utils";
import { router, usePage } from "@inertiajs/react";
import {
  AVAILABLE_TECHNIQUES,
  AVAILABLE_EXERCISES,
} from "@/Constants/clinicalData";
import SearchSelect from "@/Components/SearchSelect";
import InputError from "@/Components/InputError";

export default function CompletedModal({
  sessionData,
  setShowCompletedModal,
  setSessionData,
}) {
  const { errors } = usePage().props;

  // ✅ Inicializar técnicas y ejercicios como arrays vacíos si no existen
  useEffect(() => {
    if (!sessionData.techniques) {
      setSessionData((prev) => ({
        ...prev,
        techniques: [],
      }));
    }
    if (!sessionData.exercises) {
      setSessionData((prev) => ({
        ...prev,
        exercises: [],
      }));
    }
    // Inicializar valores numéricos por defecto
    if (
      sessionData.pain_before === undefined ||
      sessionData.pain_before === null
    ) {
      setSessionData((prev) => ({
        ...prev,
        pain_before: 0,
      }));
    }
    if (
      sessionData.pain_after === undefined ||
      sessionData.pain_after === null
    ) {
      setSessionData((prev) => ({
        ...prev,
        pain_after: 0,
      }));
    }
  }, []);

  // Opciones para técnicas y ejercicios
  const [availableTechniques] = useState([
    "Masaje terapéutico",
    "Movilización articular",
    "Estiramientos",
    "Fortalecimiento",
    "Terapia manual",
    "Electroterapia",
    "Ultrasonido",
    "Crioterapia",
    "Termoterapia",
  ]);

  const [availableExercises] = useState([
    "Ejercicios de rango de movimiento",
    "Fortalecimiento muscular",
    "Estabilización",
    "Propiocepción",
    "Ejercicios de equilibrio",
    "Ejercicios aeróbicos",
    "Ejercicios de flexibilidad",
  ]);

  // ✅ Helpers para manejar arrays de forma segura
  const getTechniques = () => {
    return Array.isArray(sessionData.techniques) ? sessionData.techniques : [];
  };

  const getExercises = () => {
    return Array.isArray(sessionData.exercises) ? sessionData.exercises : [];
  };

  // Marcar como completado
  const markCompleted = () => {
    /* if (!sessionData.pain_level) {
      alert(`⚠️ Debes ingresar el nivel de dolor ${sessionData.pain_level}`);
      return;
    } */

    // ✅ Asegurar que techniques y exercises sean arrays antes de enviar
    const dataToSend = {
      ...sessionData,
      techniques: getTechniques(),
      exercises: getExercises(),
    };

    router.patch(
      `/attendances/${sessionData.session_id}/complete`,
      dataToSend,
      {
        onSuccess: () => {
          alert(`✅ Sesión completada: ${sessionData.patient_full_name}`);
          setShowCompletedModal(false);
          setSessionData({});
        },
        onError: (errors) => {
          console.error("❌ Error al completar la sesión:", errors);
          alert("❌ Error al completar la sesión");
        },
      }
    );
  };

  return (
    <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-white rounded-xl">
      <div className="sticky top-0 z-10 p-6 bg-white border-b border-gray-200">
        <h3 className="text-2xl font-bold text-gray-900">
          ✅ Completar Sesión Kinesiológica
        </h3>
        <p className="mt-1 text-sm text-gray-600">
          Paciente: <strong>{sessionData?.patient_full_name}</strong> | Sesión #
          {sessionData.session_number}
        </p>
      </div>

      <div className="p-6 space-y-6">
        {/* SECCIÓN 1: Información Básica (Solo lectura) */}
        <div className="p-4 bg-gray-50 rounded-lg">
          <h4 className="mb-3 text-lg font-semibold text-gray-800">
            📋 Información de la Sesión
          </h4>
          <div className="grid grid-cols-2 gap-4 text-sm md:grid-cols-4">
            <div>
              <span className="font-medium text-gray-600">Fecha:</span>
              <p className="font-semibold text-gray-900">
                {fmtDate(sessionData.date)}
              </p>
            </div>
            <div>
              <span className="font-medium text-gray-600">Hora:</span>
              <p className="font-semibold text-gray-900">{sessionData.time}</p>
            </div>
            <div>
              <span className="font-medium text-gray-600">Duración:</span>
              <p className="font-semibold text-gray-900">
                {sessionData.duration} min
              </p>
            </div>
            <div>
              <span className="font-medium text-gray-600">Sesión del mes:</span>
              <p className="font-semibold text-gray-900">
                #{sessionData.month_session_number}
              </p>
            </div>
          </div>
        </div>

        {/* SECCIÓN 2: Evaluación del Dolor */}
        <div className="p-4 border-2 border-blue-200 rounded-lg bg-blue-50">
          <h4 className="mb-4 text-lg font-semibold text-blue-900">
            🩺 Evaluación del Dolor (Escala 0-10)
          </h4>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* Dolor Antes */}
            <div>
              <label className="block mb-2 text-sm font-bold text-gray-700">
                Dolor Antes de la Sesión *
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="0"
                  max="10"
                  value={sessionData.pain_before || 0}
                  onChange={(e) =>
                    setSessionData({
                      ...sessionData,
                      pain_before: Number(e.target.value),
                    })
                  }
                  className="flex-1"
                />
                <span className="w-16 text-3xl font-bold text-center text-blue-600">
                  {sessionData.pain_before || 0}
                </span>
              </div>
              <div className="flex justify-between mt-1 text-xs text-gray-500">
                <span>Sin dolor</span>
                <span>Dolor máximo</span>
              </div>
            </div>

            {/* Dolor Después */}
            <div>
              <label className="block mb-2 text-sm font-bold text-gray-700">
                Dolor Después de la Sesión *
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="0"
                  max="10"
                  value={sessionData.pain_after || 0}
                  onChange={(e) =>
                    setSessionData({
                      ...sessionData,
                      pain_after: Number(e.target.value),
                    })
                  }
                  className="flex-1"
                />
                <span className="w-16 text-3xl font-bold text-center text-green-600">
                  {sessionData.pain_after || 0}
                </span>
              </div>
              <div className="flex justify-between mt-1 text-xs text-gray-500">
                <span>Sin dolor</span>
                <span>Dolor máximo</span>
              </div>
            </div>
          </div>

          {/* Indicador de Mejora */}
          {(sessionData.pain_before || 0) > 0 && (
            <div className="p-3 mt-4 bg-white rounded-lg">
              <p className="text-sm font-semibold text-gray-700">
                Reducción del dolor:{" "}
                <span
                  className={`text-lg ${
                    (sessionData.pain_before || 0) -
                      (sessionData.pain_after || 0) >
                    0
                      ? "text-green-600"
                      : (sessionData.pain_before || 0) -
                          (sessionData.pain_after || 0) <
                        0
                      ? "text-red-600"
                      : "text-gray-600"
                  }`}
                >
                  {(sessionData.pain_before || 0) -
                    (sessionData.pain_after || 0) >
                    0 && "↓ "}
                  {(sessionData.pain_before || 0) -
                    (sessionData.pain_after || 0) <
                    0 && "↑ "}
                  {Math.abs(
                    (sessionData.pain_before || 0) -
                      (sessionData.pain_after || 0)
                  )}{" "}
                  puntos
                </span>
              </p>
            </div>
          )}
        </div>

        {/* SECCIÓN 3: Rango de Movimiento (ROM) */}
        <div className="p-4 border-2 border-purple-200 rounded-lg bg-purple-50">
          <h4 className="mb-4 text-lg font-semibold text-purple-900">
            🔄 Rango de Movimiento (ROM)
          </h4>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {/* Flexión */}
            <div>
              <label className="block mb-2 text-sm font-bold text-gray-700">
                Flexión (grados)
              </label>
              <input
                type="number"
                value={sessionData.rom_flexion || ""}
                onChange={(e) =>
                  setSessionData({
                    ...sessionData,
                    rom_flexion: e.target.value,
                  })
                }
                placeholder="Ej: 90"
                className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none"
                min="0"
                max="180"
              />
            </div>

            {/* Abducción */}
            <div>
              <label className="block mb-2 text-sm font-bold text-gray-700">
                Abducción (grados)
              </label>
              <input
                type="number"
                value={sessionData.rom_abduction || ""}
                onChange={(e) =>
                  setSessionData({
                    ...sessionData,
                    rom_abduction: e.target.value,
                  })
                }
                placeholder="Ej: 90"
                className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none"
                min="0"
                max="180"
              />
            </div>

            {/* Rotación */}
            <div>
              <label className="block mb-2 text-sm font-bold text-gray-700">
                Rotación (grados)
              </label>
              <input
                type="number"
                value={sessionData.rom_rotation || ""}
                onChange={(e) =>
                  setSessionData({
                    ...sessionData,
                    rom_rotation: e.target.value,
                  })
                }
                placeholder="Ej: 45"
                className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none"
                min="0"
                max="180"
              />
            </div>
          </div>
        </div>

        {/* Técnicas Aplicadas */}
        <div className="p-4 border-2 border-green-200 rounded-lg bg-green-50">
          <h4 className="mb-4 text-lg font-semibold text-green-900">
            🔧 Técnicas Aplicadas
          </h4>

          {/* Opciones predefinidas (checkboxes) */}
          <div className="mb-3">
            <p className="text-xs font-semibold text-gray-700 mb-2">
              Selecciona técnicas aplicadas:
            </p>
            <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
              {AVAILABLE_TECHNIQUES.map((technique) => {
                const currentTechniques = sessionData.techniques || [];
                const isSelected = currentTechniques.includes(technique);

                return (
                  <label
                    key={technique}
                    className={`flex items-center gap-2 p-2 bg-white border-2 rounded-lg cursor-pointer transition-all ${
                      isSelected
                        ? "border-green-500 bg-green-50"
                        : "border-gray-200 hover:border-green-300"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSessionData({
                            ...sessionData,
                            techniques: [
                              ...(sessionData.techniques || []),
                              technique,
                            ],
                          });
                        } else {
                          setSessionData({
                            ...sessionData,
                            techniques: (sessionData.techniques || []).filter(
                              (t) => t !== technique
                            ),
                          });
                        }
                      }}
                      className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                    />
                    <span className="text-sm font-medium text-gray-700">
                      {technique}
                    </span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Input para agregar técnicas personalizadas */}
          <div>
            <p className="text-xs font-semibold text-gray-700 mb-2">
              O agrega una técnica personalizada:
            </p>
            <input
              type="text"
              placeholder="Escribe una técnica y presiona Enter..."
              onKeyDown={(e) => {
                if (e.key === "Enter" && e.target.value.trim()) {
                  e.preventDefault();
                  const newTechnique = e.target.value.trim();
                  const currentTechniques = sessionData.techniques || [];

                  if (!currentTechniques.includes(newTechnique)) {
                    setSessionData({
                      ...sessionData,
                      techniques: [...currentTechniques, newTechnique],
                    });
                  }
                  e.target.value = "";
                }
              }}
              className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:outline-none"
            />
            <p className="mt-1 text-xs text-gray-500">
              Presiona Enter para agregar técnicas no listadas
            </p>
          </div>

          {/* Técnicas seleccionadas (chips) */}
          {sessionData.techniques?.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3 p-3 bg-white rounded-lg border-2 border-green-300">
              {sessionData.techniques.map((technique, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium bg-green-600 text-white rounded-full shadow-sm"
                >
                  {technique}
                  <button
                    type="button"
                    onClick={() => {
                      setSessionData({
                        ...sessionData,
                        techniques: sessionData.techniques.filter(
                          (_, i) => i !== idx
                        ),
                      });
                    }}
                    className="ml-1 hover:bg-green-700 rounded-full p-0.5"
                  >
                    <svg
                      className="w-3 h-3"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Ejercicios Realizados */}
        <div className="p-4 border-2 border-orange-200 rounded-lg bg-orange-50">
          <h4 className="mb-4 text-lg font-semibold text-orange-900">
            💪 Ejercicios Realizados
          </h4>

          {/* Opciones predefinidas (checkboxes) */}
          <div className="mb-3">
            <p className="text-xs font-semibold text-gray-700 mb-2">
              Selecciona ejercicios realizados:
            </p>
            <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
              {AVAILABLE_EXERCISES.map((exercise) => {
                const currentExercises = sessionData.exercises || [];
                const isSelected = currentExercises.includes(exercise);

                return (
                  <label
                    key={exercise}
                    className={`flex items-center gap-2 p-2 bg-white border-2 rounded-lg cursor-pointer transition-all ${
                      isSelected
                        ? "border-orange-500 bg-orange-50"
                        : "border-gray-200 hover:border-orange-300"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSessionData({
                            ...sessionData,
                            exercises: [
                              ...(sessionData.exercises || []),
                              exercise,
                            ],
                          });
                        } else {
                          setSessionData({
                            ...sessionData,
                            exercises: (sessionData.exercises || []).filter(
                              (ex) => ex !== exercise
                            ),
                          });
                        }
                      }}
                      className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                    />
                    <span className="text-sm font-medium text-gray-700">
                      {exercise}
                    </span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Input para agregar ejercicios personalizados */}
          <div>
            <p className="text-xs font-semibold text-gray-700 mb-2">
              O agrega un ejercicio personalizado:
            </p>
            <input
              type="text"
              placeholder="Escribe un ejercicio y presiona Enter..."
              onKeyDown={(e) => {
                if (e.key === "Enter" && e.target.value.trim()) {
                  e.preventDefault();
                  const newExercise = e.target.value.trim();
                  const currentExercises = sessionData.exercises || [];

                  if (!currentExercises.includes(newExercise)) {
                    setSessionData({
                      ...sessionData,
                      exercises: [...currentExercises, newExercise],
                    });
                  }
                  e.target.value = "";
                }
              }}
              className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-orange-500 focus:outline-none"
            />
            <p className="mt-1 text-xs text-gray-500">
              Presiona Enter para agregar ejercicios no listados
            </p>
          </div>

          {/* Ejercicios seleccionados (chips) */}
          {sessionData.exercises?.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3 p-3 bg-white rounded-lg border-2 border-orange-300">
              {sessionData.exercises.map((exercise, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium bg-orange-600 text-white rounded-full shadow-sm"
                >
                  {exercise}
                  <button
                    type="button"
                    onClick={() => {
                      setSessionData({
                        ...sessionData,
                        exercises: sessionData.exercises.filter(
                          (_, i) => i !== idx
                        ),
                      });
                    }}
                    className="ml-1 hover:bg-orange-700 rounded-full p-0.5"
                  >
                    <svg
                      className="w-3 h-3"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* SECCIÓN 6: Notas Clínicas */}
        <div>
          <label className="block mb-2 text-sm font-bold text-gray-700">
            📝 Notas Clínicas
          </label>
          <textarea
            value={sessionData.notes || ""}
            onChange={(e) =>
              setSessionData({
                ...sessionData,
                notes: e.target.value,
              })
            }
            placeholder="Observaciones sobre la sesión, evolución del paciente, hallazgos relevantes..."
            className="w-full p-3 border-2 border-gray-200 rounded-lg resize-none h-28 focus:border-blue-500 focus:outline-none"
          />
        </div>

        {/* SECCIÓN 7: Tarea para Casa */}
        <div>
          <label className="block mb-2 text-sm font-bold text-gray-700">
            🏠 Tarea para Casa
          </label>
          <textarea
            value={sessionData.homework || ""}
            onChange={(e) =>
              setSessionData({
                ...sessionData,
                homework: e.target.value,
              })
            }
            placeholder="Ejercicios o recomendaciones para realizar en casa..."
            className="w-full p-3 border-2 border-gray-200 rounded-lg resize-none h-24 focus:border-blue-500 focus:outline-none"
          />
        </div>

        {/* SECCIÓN 8: Próximos Objetivos */}
        <div>
          <label className="block mb-2 text-sm font-bold text-gray-700">
            🎯 Próximos Objetivos
          </label>
          <textarea
            value={sessionData.next_goals || ""}
            onChange={(e) =>
              setSessionData({
                ...sessionData,
                next_goals: e.target.value,
              })
            }
            placeholder="Metas para la próxima sesión o el tratamiento..."
            className="w-full p-3 border-2 border-gray-200 rounded-lg resize-none h-24 focus:border-blue-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Footer con botones */}
      <div className="sticky bottom-0 flex gap-3 p-6 bg-white border-t border-gray-200">
        <button
          onClick={() => {
            setShowCompletedModal(false);
            setSessionData({});
          }}
          className="flex-1 px-4 py-3 font-semibold text-gray-700 border-2 border-gray-200 rounded-lg hover:bg-gray-50"
        >
          Cancelar
        </button>
        <button
          onClick={markCompleted}
          className="flex-1 px-4 py-3 font-semibold text-white bg-green-600 rounded-lg hover:bg-green-700"
        >
          ✅ Guardar y Completar Sesión
        </button>
      </div>
    </div>
  );
}
