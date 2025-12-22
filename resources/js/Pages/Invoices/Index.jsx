import { Head, Link } from "@inertiajs/react";
import { BrickWallShield, Plus } from "lucide-react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";

export default function Index({ invoices, filters }) {
  return (
    <AuthenticatedLayout>
      <Head title="Aseguradoras" />
      <div className="p-4">
        <div className="flex items-center justify-between p-6 bg-white rounded-lg shadow">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-12 h-12 shadow-lg bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl">
              <BrickWallShield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Aseguradoras</h1>
              <p className="text-sm text-gray-600">Gestión de aseguradoras</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => handleOpenModalEdit(null)}
              className="flex items-center gap-2 px-6 py-2 font-semibold text-white transition-colors bg-blue-600 rounded-lg shadow-lg hover:bg-blue-700 shadow-blue-500/30"
            >
              <Plus className="w-4 h-4" />
              Nueva Aseguradora
            </button>
          </div>
        </div>
        <div className="p-6 space-y-4">
          <h1 className="text-xl font-semibold">Documentos Tributarios</h1>

          <table className="w-full text-sm border">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-2 text-left">#</th>
                <th className="p-2 text-left">Tipo</th>
                <th className="p-2 text-left">Paciente</th>
                <th className="p-2 text-right">Total</th>
                <th className="p-2 text-left">SII</th>
                <th className="p-2 text-left">Estado</th>
                <th className="p-2 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((inv) => (
                <tr key={inv.id} className="border-t">
                  <td className="p-2">{inv.document_number ?? inv.id}</td>
                  <td className="p-2">{inv.dte_type}</td>
                  <td className="p-2">
                    {inv.patient?.name} {inv.patient?.last_name}
                  </td>
                  <td className="p-2 text-right">
                    {Number(inv.total_clp ?? 0).toLocaleString("es-CL")}
                  </td>
                  <td className="p-2">{inv.dte_status}</td>
                  <td className="p-2">{inv.dte_status}</td>
                  <td className="p-2 text-center">
                    <Link
                      className="text-blue-600 hover:underline"
                      href={route("invoices.show", inv.id)}
                    >
                      Ver
                    </Link>
                  </td>
                </tr>
              ))}
              {invoices.length === 0 && (
                <tr>
                  <td className="p-3 text-center text-gray-500" colSpan={7}>
                    Sin documentos
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
