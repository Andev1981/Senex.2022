import { Link } from "@inertiajs/react";

export default function Show({ invoice }) {
  return (
    <div className="p-6 space-y-3">
      <h1 className="text-xl font-semibold">
        Documento #{invoice.document_number ?? invoice.id} — {invoice.type}
      </h1>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <div className="p-3 border rounded">
          <div className="text-xs text-gray-500">Paciente</div>
          <div>
            {invoice.patient?.name} {invoice.patient?.last_name}
          </div>
        </div>
        <div className="p-3 border rounded">
          <div className="text-xs text-gray-500">Total</div>
          <div>${Number(invoice.total_amount).toLocaleString("es-CL")}</div>
        </div>
        <div className="p-3 border rounded">
          <div className="text-xs text-gray-500">SII</div>
          <div>{invoice.sii_status}</div>
        </div>
      </div>

      <div className="p-3 border rounded">
        <div className="mb-2 text-sm font-semibold">Ítems</div>
        <table className="w-full text-sm">
          <thead>
            <tr>
              <th className="text-left">Descripción</th>
              <th>Cant.</th>
              <th className="text-right">Precio</th>
              <th className="text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            {invoice.items?.map((it) => (
              <tr key={it.id}>
                <td className="py-1">{it.description}</td>
                <td className="py-1 text-center">{it.quantity}</td>
                <td className="py-1 text-right">
                  {Number(it.unit_price).toLocaleString("es-CL")}
                </td>
                <td className="py-1 text-right">
                  {Number(it.line_total).toLocaleString("es-CL")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center gap-3">
        {invoice.pdf_path && (
          <a
            className="px-3 py-2 text-sm text-white bg-blue-600 rounded"
            href={route("invoices.pdf", invoice.id)}
          >
            Descargar PDF
          </a>
        )}
        <Link
          className="px-3 py-2 text-sm border rounded"
          href={route("invoices.index")}
        >
          Volver
        </Link>
      </div>
    </div>
  );
}
