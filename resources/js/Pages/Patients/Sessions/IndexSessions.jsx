import { Clipboard, Plus } from "lucide-react";
import React from "react";

export default function IndexSessions({ patient }) {
  return (
    <div className="space-y-4">
      <div className="p-6 bg-white shadow-lg rounded-xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="flex items-center gap-2 text-2xl font-bold text-gray-900">
            <Clipboard className="w-6 h-6 text-teal-600" /> Registro de Sesiones
          </h2>
          <button
            onClick={() => setOpenSessionModal(true)}
            className="flex items-center gap-2 px-4 py-2 text-white bg-teal-600 rounded-lg hover:bg-teal-700"
          >
            <Plus className="w-4 h-4" /> Registrar Sesión
          </button>
        </div>

        <div className="space-y-4">
          {[...(patient.sessions || [])]
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .map((session) => (
              <SessionCard key={session.id} session={session} />
            ))}
        </div>
      </div>
    </div>
  );
}

function SessionCard({ session }) {
  const completed = session.status === "Completada";
  return (
    <div
      className={`border-l-4 ${
        completed
          ? "border-teal-500 bg-gradient-to-r from-teal-50 to-transparent"
          : "border-blue-500 bg-gradient-to-r from-blue-50 to-transparent"
      } p-6 rounded-r-xl`}
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span
              className={`inline-block ${
                completed ? "bg-teal-600" : "bg-blue-600"
              } text-white text-sm px-3 py-1 rounded-full font-medium`}
            >
              Sesión #{session.sessionNumber}
            </span>
            <span
              className={`text-sm px-3 py-1 rounded-full font-medium ${
                completed
                  ? "bg-green-100 text-green-700"
                  : "bg-blue-100 text-blue-700"
              }`}
            >
              {session.status}
            </span>
          </div>
          <p className="text-sm text-gray-600">{session.kinesiologist}</p>
        </div>
        <div className="text-right">
          <p className="font-semibold text-gray-900">
            {new Date(session.date).toLocaleDateString("es-CL")}
          </p>
          <p className="text-sm text-gray-600">{session.time}</p>
          <p className="flex items-center justify-end gap-1 mt-1 text-xs text-gray-500">
            {session.duration} min
          </p>
        </div>
      </div>

      {completed && (
        <>
          <div className="grid grid-cols-2 gap-4 mb-4 md:grid-cols-4">
            <MiniStat
              label="Dolor Inicial"
              value={`${session.painBefore}/10`}
              tone={session.painBefore}
            />
            <MiniStat
              label="Dolor Final"
              value={`${session.painAfter}/10`}
              tone={session.painAfter}
            />
            <MiniStat
              label="Mejoría"
              value={`-${(session.painBefore ?? 0) - (session.painAfter ?? 0)}`}
              tone={0}
            />
            <MiniStat
              label="Progreso"
              value={`${
                session.painBefore
                  ? Math.round(
                      ((session.painBefore - (session.painAfter || 0)) /
                        session.painBefore) *
                        100
                    )
                  : 0
              }%`}
              tone={0}
            />
          </div>

          {session.rom && (
            <div className="p-4 mb-4 bg-white rounded-lg">
              <h4 className="mb-3 text-sm font-semibold text-gray-900">
                Rango de Movimiento (ROM)
              </h4>
              <div className="grid grid-cols-3 gap-4">
                <ROMItem label="Flexión" value={session.rom.flexion} />
                <ROMItem label="Abducción" value={session.rom.abduction} />
                <ROMItem label="Rotación" value={session.rom.rotation} />
              </div>
            </div>
          )}

          {Array.isArray(session.techniques) &&
            session.techniques.length > 0 && (
              <TagGroup
                title="Técnicas Aplicadas"
                items={session.techniques}
                color="teal"
              />
            )}

          {Array.isArray(session.exercises) && session.exercises.length > 0 && (
            <TagGroup
              title="Ejercicios Realizados"
              items={session.exercises}
              color="purple"
            />
          )}

          {session.notes && (
            <div className="p-3 mb-3 bg-white rounded-lg">
              <h4 className="mb-1 text-sm font-semibold text-gray-900">
                Notas de la Sesión
              </h4>
              <p className="text-sm text-gray-600">{session.notes}</p>
            </div>
          )}

          {session.homework && (
            <Callout
              title="Indicaciones para Casa"
              tone="blue"
              text={session.homework}
            />
          )}

          {session.nextGoals && (
            <Callout
              title="Objetivos Próxima Sesión"
              tone="yellow"
              text={session.nextGoals}
            />
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
  );
}
