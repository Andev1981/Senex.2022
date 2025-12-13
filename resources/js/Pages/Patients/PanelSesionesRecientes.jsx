const PanelSesionesRecientes = ({ sesionesRecientes }) => {
  const getStatusColor = (estado) => {
    switch (estado) {
      case "Finalizada":
        return "bg-green-100 text-green-800";
      case "Impaga":
        return "bg-yellow-100 text-yellow-800";
      case "Cancelada":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
      <h3 className="text-xl font-semibold text-gray-700 mb-4">
        Últimas 5 Sesiones
      </h3>

      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Fecha
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Tipo
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Pago
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"></th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {sesionesRecientes.length > 0 ? (
            sesionesRecientes.slice(0, 5).map((sesion) => (
              <tr key={sesion.id}>
                <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                  {sesion.fecha}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                  {sesion.tipo}
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
                      sesion.estadoPago
                    )}`}
                  >
                    {sesion.estadoPago}
                  </span>
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                  <button className="text-indigo-600 hover:text-indigo-900">
                    Ver
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="4" className="px-4 py-4 text-center text-gray-500">
                No hay sesiones registradas.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      <div className="mt-4 text-center border-t pt-4">
        <a
          href="#historial-clinico"
          className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
        >
          Ir a Historial Clínico completo →
        </a>
      </div>
    </div>
  );
};

export default PanelSesionesRecientes;
