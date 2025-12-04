import { Clipboard, Plus } from "lucide-react";
import TableSessions from "./TableSessions";

export default function IndexSessions({
  sessions,
  handleOpenModalSession,
  handleOpenModalSessionShow,
  treatment,
  setIsDuplicate,
}) {
  return (
    <div className="space-y-4">
      <div className="px-6 pt-2 pb-6 bg-white shadow-lg rounded-xl dark:bg-gray-800">
        <div className="flex items-center justify-between mb-6">
          <h2 className="flex items-center gap-2 my-2 text-2xl font-bold text-gray-900 dark:text-white">
            <Clipboard className="w-6 h-6 text-teal-600" /> Sesiones
          </h2>
          {/* --- Definición del Botón Condicional --- */}
          {/* El botón se muestra si el tratamiento está en curso, independientemente del número de sesiones. */}
          {treatment.status === "in_progress" && sessions.length > 0 && (
            <button
              onClick={() => handleOpenModalSession([], treatment)}
              className="flex items-center gap-2 px-4 py-2 text-white transition-colors bg-teal-600 rounded-lg hover:bg-teal-700 dark:bg-teal-500 dark:hover:bg-teal-600"
            >
              <Plus className="w-4 h-4" /> Registrar Sesión
            </button>
          )}
        </div>

        {/* --- Contenido de la Lista de Sesiones (Table o Empty State) --- */}
        <div className="space-y-4">
          {sessions.length === 0 ? (
            // Caso 1: No hay sesiones registradas
            <div className="p-6 border border-gray-300 border-dashed bg-gray-50 rounded-xl dark:border-gray-700 dark:bg-gray-700/50">
              <p className="text-gray-500 dark:text-gray-300">
                No hay sesiones registradas para este tratamiento.
              </p>
              {treatment.status !== "in_progress" && (
                <p className="mt-2 text-sm text-gray-400 dark:text-gray-500">
                  El tratamiento no está en progreso (Estado: {treatment.status}
                  ).
                </p>
              )}
            </div>
          ) : (
            // Caso 2: Hay sesiones registradas, mostramos la tabla
            <TableSessions
              sessions={sessions}
              treatment={treatment}
              setIsDuplicate={setIsDuplicate}
              handleOpenModalSession={handleOpenModalSession}
              handleOpenModalSessionShow={handleOpenModalSessionShow}
            />
          )}
        </div>
      </div>
    </div>
  );
}
