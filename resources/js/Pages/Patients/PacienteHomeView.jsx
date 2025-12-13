import React from "react";
import PanelAcciones from "./PanelAcciones";
import PanelFinanciero from "./PanelFinanciero";
import PanelSesionesRecientes from "./PanelSesionesRecientes";

const PacienteHomeView = ({
  pacienteData,
  onIniciarSesion,
  onFinalizarSesion,
  onCobrarDeuda,
}) => {
  // Simulación de datos
  const {
    name,
    kinesAsignados,
    deudaTotal,
    saldoPlanSesiones,
    saldoFavorCCP,
    sesionEnCurso,
    sesionesRecientes,
  } = pacienteData;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Encabezado General del Paciente */}
      <header className="mb-6 pb-4 border-b border-gray-200">
        <h1 className="text-3xl font-bold text-gray-800">{name}</h1>
        <p className="text-sm text-gray-500 mt-1">
          Kinesiólogo(s) Asignado(s):{/*  {kinesAsignados.join(", ")} */}
        </p>
      </header>

      {/* Contenedor de las 3 Columnas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Columna 1: Acciones (Prioridad) */}
        {/*  <PanelAcciones
          sesionEnCurso={sesionEnCurso}
          onIniciar={onIniciarSesion}
          onFinalizar={onFinalizarSesion}
        /> */}

        {/* Columna 2: Financiero (Estatus Crítico) */}
        {/* <PanelFinanciero
          deudaTotal={deudaTotal}
          saldoPlanSesiones={saldoPlanSesiones}
          saldoFavorCCP={saldoFavorCCP}
          onCobrarDeuda={onCobrarDeuda}
        /> */}

        {/* Columna 3: Contexto (Recientes) */}
        {/*  <PanelSesionesRecientes sesionesRecientes={sesionesRecientes} /> */}
      </div>
    </div>
  );
};

export default PacienteHomeView;
