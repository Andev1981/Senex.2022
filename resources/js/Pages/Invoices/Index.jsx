import { Link } from "@inertiajs/react";

export default function Index({ invoices, filters }) {
  return (
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
          {invoices.data.map((inv) => (
            <tr key={inv.id} className="border-t">
              <td className="p-2">{inv.document_number ?? inv.id}</td>
              <td className="p-2">{inv.type}</td>
              <td className="p-2">
                {inv.patient?.name} {inv.patient?.last_name}
              </td>
              <td className="p-2 text-right">
                {Number(inv.total_amount ?? 0).toLocaleString("es-CL")}
              </td>
              <td className="p-2">{inv.sii_status}</td>
              <td className="p-2">{inv.status}</td>
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
          {invoices.data.length === 0 && (
            <tr>
              <td className="p-3 text-center text-gray-500" colSpan={7}>
                Sin documentos
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
