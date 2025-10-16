import { CheckCircle, Clock, CreditCard, DollarSign, Plus } from "lucide-react";
import { clp } from "@/utils/utils";
import React, { useMemo } from "react";

export default function IndexPayments({ payments }) {
  const totalPaid = useMemo(
    () =>
      payments
        .filter((p) => p.status === "Pagado")
        .reduce((s, p) => s + (p.amount || 0), 0),
    [payments]
  );
  const totalPending = useMemo(
    () =>
      payments
        .filter((p) => p.status === "Pendiente")
        .reduce((s, p) => s + (p.amount || 0), 0),
    [payments]
  );

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <StatCard
          title="Total Pagado"
          icon={CheckCircle}
          className="from-green-500 to-green-600"
          value={clp.format(totalPaid)}
        />
        <StatCard
          title="Pendiente"
          icon={Clock}
          className="from-orange-500 to-orange-600"
          value={clp.format(totalPending)}
        />
        <StatCard
          title="Total"
          icon={DollarSign}
          className="from-teal-500 to-teal-600"
          value={clp.format(totalPaid + totalPending)}
        />
      </div>

      <div className="p-6 bg-white shadow-lg rounded-xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="flex items-center gap-2 text-2xl font-bold text-gray-900">
            <CreditCard className="w-6 h-6 text-teal-600" /> Historial de Pagos
          </h2>
          <button
            onClick={() => setOpenPaymentModal(true)}
            className="flex items-center gap-2 px-4 py-2 text-white bg-teal-600 rounded-lg hover:bg-teal-700"
          >
            <Plus className="w-4 h-4" /> Registrar Pago
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                {[
                  "Fecha",
                  "Concepto",
                  "Documento",
                  "Copago",
                  "Isapre",
                  "Total",
                  "Método",
                  "Estado",
                ].map((th) => (
                  <th
                    key={th}
                    className={`px-4 py-3 text-xs font-semibold uppercase ${
                      ["Copago", "Isapre", "Total"].includes(th)
                        ? "text-right text-gray-600"
                        : "text-left text-gray-600"
                    }`}
                  >
                    {th}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {payments?.map((payment) => (
                <tr key={payment.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-900">
                    {new Date(payment.date).toLocaleDateString("es-CL")}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    {payment.concept}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {payment.invoice}
                  </td>
                  <td className="px-4 py-3 text-sm text-right text-gray-900">
                    {clp.format(payment.copay || 0)}
                  </td>
                  <td className="px-4 py-3 text-sm text-right text-gray-900">
                    {clp.format(payment.insuranceCovered || 0)}
                  </td>
                  <td className="px-4 py-3 text-sm font-semibold text-right text-gray-900">
                    {clp.format(payment.amount || 0)}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {payment.paymentMethod}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                        payment.status === "Pagado"
                          ? "bg-green-100 text-green-700"
                          : "bg-orange-100 text-orange-700"
                      }`}
                    >
                      {payment.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  title,
  icon: Icon,
  value,
  className = "from-teal-500 to-teal-600",
}) {
  return (
    <div className={`p-6 text-white bg-gradient-to-br ${className} rounded-xl`}>
      <div className="flex items-center gap-3 mb-2">
        <Icon className="w-8 h-8" />
        <h3 className="text-lg font-semibold">{title}</h3>
      </div>
      <p className="text-3xl font-bold">{value}</p>
    </div>
  );
}
