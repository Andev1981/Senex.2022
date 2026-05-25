import { Copy, Edit } from "lucide-react";
import { estadoTexto } from "@/helpers/status";

export default function SessionCard({
  session,
  handleOpenModalSession,
  treatment,
  setIsDuplicate,
}) {
  const completed = session?.status === "completed";
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
              Sesión Mensual #{session?.month_session_number}
            </span>

            <span
              className={`text-sm px-3 py-1 rounded-full font-medium ${
                completed
                  ? "bg-green-100 text-green-700"
                  : "bg-blue-100 text-blue-700"
              }`}
            >
              {estadoTexto(session?.status)}
            </span>
            <p
              className="text-gray-500 cursor-pointer"
              onClick={() => (
                handleOpenModalSession(session, treatment),
                setIsDuplicate(false)
              )}
            >
              <Edit className="w-4 h-4 text-gray-500" />
            </p>
            <p
              className="text-gray-500 cursor-pointer"
              onClick={() => (
                handleOpenModalSession(session, treatment), setIsDuplicate(true)
              )}
            >
              <Copy className="w-4 h-4 text-gray-500" />
            </p>
          </div>
          <p className="text-sm text-gray-600">{session?.doctor?.name}</p>
        </div>
        <div className="text-right">
          <p className="font-semibold text-gray-900">
            {new Date(session?.date).toLocaleDateString("es-CL")}
          </p>
          <p className="text-sm text-gray-600">{session?.time}</p>
          <p className="flex items-center justify-end gap-1 mt-1 text-xs text-gray-500">
            {session?.duration} min
          </p>
        </div>
      </div>

      {completed && (
        <>
          <div className="grid grid-cols-2 gap-4 mb-4 md:grid-cols-4">
            <MiniStat
              label="Dolor Inicial"
              value={`${session?.pain_before}/10`}
              tone={session?.pain_before}
            />
            <MiniStat
              label="Dolor Final"
              value={`${session?.pain_after}/10`}
              tone={session?.pain_after}
            />
            <MiniStat
              label="Mejoría"
              value={`${
                (session?.pain_before ?? 0) - (session?.pain_after ?? 0)
              }`}
              tone={0}
            />
            <MiniStat
              label="Progreso"
              value={`${
                session?.pain_before
                  ? Math.round(
                      ((session?.pain_before - (session?.pain_after || 0)) /
                        session?.pain_before) *
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

          {session.next_goals && (
            <Callout
              title="Objetivos Próxima Sesión"
              tone="yellow"
              text={session.next_goals}
            />
          )}
        </>
      )}

      {session.status === "Programada" && (
        <div className="py-4 text-center">
          <p className="mb-3 text-gray-500">
            Sesión programada - Pendiente de realizar
          </p>
          <button
            onClick={() => handleOpenModalSession(session, treatment)}
            className="px-4 py-2 text-sm text-white bg-teal-600 rounded-lg hover:bg-teal-700"
          >
            Iniciar Sesión
          </button>
        </div>
      )}
    </div>
  );
}

function MiniStat({ label, value, tone = 0 }) {
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
}
