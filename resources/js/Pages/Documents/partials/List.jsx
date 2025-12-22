import {
  CheckCircle,
  DollarSign,
  Download,
  Eye,
  FileText,
  Printer,
  Search,
  Send,
  XCircle,
} from "lucide-react";
import React from "react";

export default function List({
  invoices,
  searchTerm,
  setSearchTerm,
  filterType,
  setFilterType,
  filterStatus,
  setFilterStatus,
  filteredDocuments,
  setSelectedDocument,
  DTES_TYPES,
  DTES_STATUSES,
}) {
  const totalEmitidos = invoices.filter((d) => d.status === "Emitido").length;
  const totalAceptados = invoices.filter((d) => d.status === "Aceptado").length;
  const totalRechazados = invoices.filter(
    (d) => d.status === "Rechazado"
  ).length;
  const totalMonto = invoices.reduce((sum, d) => sum + d.total, 0);

  return (
    <div>
      {/* Dashboard Cards */}
      <div className="grid grid-cols-1 gap-4 mb-6 md:grid-cols-4">
        <div className="p-6 text-white shadow-sm rounded-xl bg-gradient-to-br from-blue-500 to-blue-600">
          <div className="flex items-center gap-3 mb-2">
            <FileText className="w-8 h-8" />
            <h3 className="text-lg font-semibold">Emitidos</h3>
          </div>
          <p className="text-3xl font-bold">{totalEmitidos}</p>
        </div>
        <div className="p-6 text-white shadow-sm rounded-xl bg-gradient-to-br from-green-500 to-green-600">
          <div className="flex items-center gap-3 mb-2">
            <CheckCircle className="w-8 h-8" />
            <h3 className="text-lg font-semibold">Aceptados</h3>
          </div>
          <p className="text-3xl font-bold">{totalAceptados}</p>
        </div>
        <div className="p-6 text-white shadow-sm rounded-xl bg-gradient-to-br from-red-500 to-red-600">
          <div className="flex items-center gap-3 mb-2">
            <XCircle className="w-8 h-8" />
            <h3 className="text-lg font-semibold">Rechazados</h3>
          </div>
          <p className="text-3xl font-bold">{totalRechazados}</p>
        </div>
        <div className="p-6 text-white shadow-sm rounded-xl bg-gradient-to-br from-purple-500 to-purple-600">
          <div className="flex items-center gap-3 mb-2">
            <DollarSign className="w-8 h-8" />
            <h3 className="text-lg font-semibold">Total Facturado</h3>
          </div>
          <p className="text-2xl font-bold">
            ${totalMonto.toLocaleString("es-CL")}
          </p>
        </div>
      </div>
      <div className="space-y-4">
        {/* Filtros */}
        <div className="p-4 bg-white border border-gray-200 shadow-sm rounded-xl">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            <div className="relative md:col-span-2">
              <Search className="absolute w-5 h-5 text-gray-400 left-3 top-3" />
              <input
                type="text"
                placeholder="Buscar por razón social, RUT o folio..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full py-2 pl-10 pr-4 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
              />
            </div>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
            >
              <option value="todos">Todos los tipos</option>
              {DTES_TYPES.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
            >
              <option value="todos">Todos los estados</option>
              <option value="Emitido">Emitido</option>
              <option value="Aceptado">Aceptado</option>
              <option value="Rechazado">Rechazado</option>
              <option value="Anulado">Anulado</option>
            </select>
          </div>
        </div>

        {/* Tabla */}
        <div className="overflow-hidden bg-white border border-gray-200 shadow-sm rounded-xl">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-xs font-bold text-left text-gray-600 uppercase">
                    Tipo
                  </th>
                  <th className="px-4 py-3 text-xs font-bold text-left text-gray-600 uppercase">
                    Folio
                  </th>
                  <th className="px-4 py-3 text-xs font-bold text-left text-gray-600 uppercase">
                    Fecha
                  </th>
                  <th className="px-4 py-3 text-xs font-bold text-left text-gray-600 uppercase">
                    Cliente
                  </th>
                  <th className="px-4 py-3 text-xs font-bold text-left text-gray-600 uppercase">
                    RUT
                  </th>
                  <th className="px-4 py-3 text-xs font-bold text-right text-gray-600 uppercase">
                    Total
                  </th>
                  <th className="px-4 py-3 text-xs font-bold text-center text-gray-600 uppercase">
                    Pago
                  </th>
                  <th className="px-4 py-3 text-xs font-bold text-center text-gray-600 uppercase">
                    Envío SII
                  </th>
                  <th className="px-4 py-3 text-xs font-bold text-center text-gray-600 uppercase">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredDocuments.map((doc) => {
                  const docType = DTES_TYPES.find(
                    (dt) => dt.value === doc.dte_type
                  );
                  const Icon = docType?.icon || FileText;
                  const typeStyle = DTES_TYPES[doc.dte_type] || {
                    text: "text-gray-600",
                  };
                  return (
                    <tr key={doc.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Icon
                            className={`w-5 h-5 ${typeStyle?.styles?.text}`}
                          />
                          <span className="text-sm font-medium text-gray-900">
                            {doc.dte_type}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 font-mono text-sm text-gray-900">
                        {doc.dte_folio || "Sin Folio"}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {new Date(doc.date).toLocaleDateString("es-CL")}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {doc.patient.full_name}
                      </td>
                      <td className="px-4 py-3 font-mono text-sm text-gray-600">
                        {doc.patient.rut}
                      </td>
                      <td className="px-4 py-3 text-sm font-semibold text-right text-gray-900">
                        ${doc.amount_gross.toLocaleString("es-CL")}
                      </td>
                      <td>{doc.payment_status}</td>
                      <td className="px-4 py-3 text-center">
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                            DTES_STATUSES[doc.dte_status] ||
                            "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {doc.dte_status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => setSelectedDocument(doc)}
                            className="p-2 text-blue-600 rounded-lg hover:bg-blue-50"
                            title="Ver detalle"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            className="p-2 text-gray-600 rounded-lg hover:bg-gray-100"
                            title="Descargar PDF"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                          <button
                            className="p-2 text-gray-600 rounded-lg hover:bg-gray-100"
                            title="Imprimir"
                          >
                            <Printer className="w-4 h-4" />
                          </button>
                          <button
                            className="p-2 text-gray-600 rounded-lg hover:bg-gray-100"
                            title="Enviar por email"
                          >
                            <Send className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
