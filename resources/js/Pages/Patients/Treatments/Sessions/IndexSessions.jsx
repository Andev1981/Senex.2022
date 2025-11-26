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
      <div className="p-6 bg-white shadow-lg rounded-xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="flex items-center gap-2 text-2xl font-bold text-gray-900">
            <Clipboard className="w-6 h-6 text-teal-600" /> Sesiones
          </h2>
          {sessions.length > 0 && treatment.status === "InProgress" && (
            <button
              onClick={() => handleOpenModalSession([], treatment)}
              className="flex items-center gap-2 px-4 py-2 text-white bg-teal-600 rounded-lg hover:bg-teal-700"
            >
              <Plus className="w-4 h-4" /> Registrar Sesión
            </button>
          )}
        </div>

        <div className="space-y-4">
          {sessions.length == 0 && treatment.status === "InProgress" ? (
            <button
              onClick={() => handleOpenModalSession([], treatment)}
              className="flex items-center gap-2 px-4 py-2 text-white bg-teal-600 rounded-lg hover:bg-teal-700"
            >
              <Plus className="w-4 h-4" /> Registrar Sesión
            </button>
          ) : (
            (sessions.length === 0 && (
              <div className="p-6 border border-dashed bg-gray-50 rounded-xl">
                <p className="text-gray-500">
                  No hay sesiones registradas para este tratamiento.
                </p>
              </div>
            )) || (
              <TableSessions
                sessions={sessions}
                treatment={treatment}
                setIsDuplicate={setIsDuplicate}
                handleOpenModalSession={handleOpenModalSession}
                handleOpenModalSessionShow={handleOpenModalSessionShow}
              />
            )
          )}
        </div>
      </div>
    </div>
  );
}
