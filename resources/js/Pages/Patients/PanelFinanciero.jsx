const PanelFinanciero = ({
  deudaTotal,
  saldoPlanSesiones,
  saldoFavorCCP,
  onCobrarDeuda,
}) => {
  // Función de formato de moneda (ajusta al formato de Chile, CLP)
  const formatCLP = (amount_clp) =>
    new Intl.NumberFormat("es-CL", {
      style: "currency",
      currency: "CLP",
    }).format(amount_clp);

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 space-y-4 h-fit">
      <h3 className="text-xl font-semibold text-gray-700 mb-4">
        Cuenta Corriente del Paciente
      </h3>

      {/* Tarjeta 1: Saldo de Planes (Unidades) */}
      <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
        <p className="text-sm text-green-700 font-medium">
          SESIONES DE PLAN DISPONIBLES
        </p>
        <p className="text-3xl font-bold text-green-800 mt-1">
          {saldoPlanSesiones} Unidades
        </p>
      </div>

      {/* Tarjeta 2: Saldo a Favor (Dinero) */}
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-blue-700 font-medium">
          SALDO A FAVOR (ABONOS)
        </p>
        <p className="text-3xl font-bold text-blue-800 mt-1">
          {formatCLP(saldoFavorCCP)}
        </p>
        <button className="mt-2 text-sm text-blue-600 font-medium hover:underline">
          + Registrar Abono
        </button>
      </div>

      {/* Tarjeta 3: Deuda Pendiente */}
      <div
        className={`p-4 rounded-lg ${
          deudaTotal > 0
            ? "bg-red-50 border border-red-200"
            : "bg-gray-50 border border-gray-200"
        }`}
      >
        <p className="text-sm text-gray-700 font-medium">DEUDA PENDIENTE</p>
        <p
          className={`text-3xl font-bold mt-1 ${
            deudaTotal > 0 ? "text-red-800" : "text-gray-500"
          }`}
        >
          {formatCLP(deudaTotal)}
        </p>
        {deudaTotal > 0 && (
          <button
            onClick={onCobrarDeuda}
            className="mt-3 w-full bg-red-500 text-white py-2 rounded-lg font-medium hover:bg-red-600 transition duration-150"
          >
            Ir a Cobrar Deuda
          </button>
        )}
      </div>
    </div>
  );
};

export default PanelFinanciero;
