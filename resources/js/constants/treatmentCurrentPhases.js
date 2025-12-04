export const treatmentCurrentPhases = {
  // 1. Fase Inicial: Recolección de datos y diagnóstico funcional.
  evaluation: {
    label: "Evaluación/Diagnóstico 📝",
    className: "bg-blue-50 text-blue-700 border border-blue-300",
  }, // 2. Fase Activa/Aguda: Enfocada en reducir síntomas y dolor.
  acute_symptomatic: {
    label: "Fase Aguda/Sintomática 🩹",
    className: "bg-red-50 text-red-700 border border-red-300", // Rojo o naranja suave para atención inmediata
  }, // 3. Fase Intermedia: Ganar fuerza, ROM y función. El corazón del tratamiento.
  functional_restoration: {
    label: "Restauración Funcional 💪",
    className: "bg-green-50 text-green-700 border border-green-300",
  }, // 4. Fase de Transición/Control: Preparación para el alta, reeducación deportiva, prevención.
  maintenance_prevention: {
    label: "Mantenimiento/Prevención 🏃",
    className: "bg-teal-100 text-teal-800 border border-teal-400 font-semibold",
  }, // 5. Fase Final: Proceso terminado.
  discharge: {
    label: "Alta Clínica 🌟",
    className: "bg-indigo-50 text-indigo-700 border border-indigo-300",
  },
};

export const TREATMENT_CURRENT_PHASE_OPTIONS = Object.entries(
  treatmentCurrentPhases
).map(([value, cfg]) => ({ value, label: cfg.label }));

// Función "Helper" de búsqueda, exportada desde el mismo archivo de Constantes.
export const getCurrentPhaseConfig = (value) => {
  return (
    treatmentCurrentPhases[value] || {
      label: "Desconocido",
      className: "bg-gray-100 text-gray-500",
    }
  );
};
