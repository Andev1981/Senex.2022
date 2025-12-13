const PanelAcciones = ({ sesionEnCurso, onIniciar, onFinalizar }) => {
  const estadoSesion = sesionEnCurso ? "Sesión en Curso" : "Esperando Atención";

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 h-fit">
      <h3 className="text-xl font-semibold text-gray-700 mb-4 flex items-center">
        <span
          className={`w-3 h-3 rounded-full mr-2 ${
            sesionEnCurso ? "bg-yellow-500" : "bg-green-500"
          }`}
        ></span>
        {estadoSesion}
      </h3>

      {sesionEnCurso ? (
        // --- Bloque Sesión en Curso ---
        <div className="mt-4 border-t pt-4">
          <p className="text-sm text-gray-600 mb-4">
            <span className="font-medium">Tipo:</span> {sesionEnCurso.tipo}
          </p>
          <p className="text-sm text-gray-600 mb-4">
            <span className="font-medium">Iniciada:</span>{" "}
            {sesionEnCurso.horaInicio}
          </p>
          <button
            onClick={onFinalizar}
            className="w-full bg-red-600 text-white py-3 rounded-lg font-bold hover:bg-red-700 transition duration-150 shadow-md"
          >
            Finalizar Sesión y Registrar
          </button>
          {/* Botón de Pausa opcional */}
          <button className="w-full mt-2 bg-gray-200 text-gray-700 py-3 rounded-lg font-bold hover:bg-gray-300 transition duration-150">
            Pausar Sesión
          </button>
        </div>
      ) : (
        // --- Bloque Iniciar Sesión ---
        <div>
          <p className="text-gray-500 mb-6">
            Listo para comenzar una nueva atención.
          </p>
          <button
            onClick={onIniciar}
            className="w-full bg-indigo-600 text-white py-3 rounded-lg font-bold hover:bg-indigo-700 transition duration-150 shadow-md"
          >
            Iniciar Sesión (Nueva Atención)
          </button>
          <button className="w-full mt-2 bg-gray-100 text-indigo-600 py-3 rounded-lg font-medium hover:bg-gray-200 transition duration-150">
            Agendar Próxima Sesión
          </button>
        </div>
      )}
    </div>
  );
};

export default PanelAcciones;
