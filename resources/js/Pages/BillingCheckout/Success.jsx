import React, { useState } from "react";
import { Head, Link } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import {
  CheckCircle2,
  Printer,
  ArrowLeft,
  Plus,
  Calendar,
  User,
  Building2,
  CreditCard,
  Receipt,
} from "lucide-react";

const Success = ({ payment, invoice, is_dte_pending }) => {
  const [email, setEmail] = useState(payment?.patient?.email || "");
  const [sending, setSending] = useState(false);
  const formatMoney = (amount) => {
    return new Intl.NumberFormat("es-CL", {
      style: "currency",
      currency: "CLP",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString("es-CL", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const sendVoucher = async () => {
    setSending(true);
    try {
      await axios.post(route("payments.send-receipt", props.payment.uuid), {
        email,
      });
      toast.success("Copia enviada a " + email);
    } catch (e) {
      toast.error("No se pudo enviar el correo");
    } finally {
      setSending(false);
    }
  };

  return (
    <AuthenticatedLayout>
      <Head title={`Pago Exitoso - ${payment.uuid.substring(0, 8)}`} />

      <div className="max-w-4xl px-4 py-8 mx-auto sm:px-6">
        {/* Botón Volver (Oculto en impresión) */}
        <div className="mb-6 print:hidden">
          <Link
            href={route("payments.index")}
            className="inline-flex items-center text-sm font-bold text-gray-500 transition hover:text-indigo-600"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Volver a la Caja
          </Link>
        </div>

        <div className="overflow-hidden bg-white border border-gray-100 shadow-xl rounded-3xl print:shadow-none print:border-none">
          {/* Header de Éxito */}
          <div className="p-8 text-center border-b border-green-100 bg-gradient-to-b from-green-50 to-white print:bg-white">
            <div className="flex justify-center mb-4 print:hidden">
              <div className="p-3 bg-green-500 rounded-full shadow-lg shadow-green-200">
                <CheckCircle2 className="w-12 h-12 text-white" />
              </div>
            </div>
            <h1 className="text-3xl font-black text-gray-900 print:text-2xl">
              ¡Pago Recibido!
            </h1>
            <p className="mt-2 font-medium text-gray-500 print:text-sm">
              Comprobante de Transacción #
              {payment.uuid.substring(0, 8).toUpperCase()}
            </p>
          </div>

          <div className="p-8 space-y-8">
            {/* 1. Información de Cabecera */}
            <div className="grid grid-cols-1 gap-8 pb-8 border-b border-gray-100 md:grid-cols-3">
              <div className="space-y-1">
                <span className="block text-[10px] font-black text-gray-400 uppercase tracking-wider">
                  Paciente
                </span>
                <div className="flex items-center font-bold text-gray-700">
                  <User className="w-4 h-4 mr-2 text-indigo-500" />
                  {payment.patient.full_name ||
                    `${payment.patient.name} ${payment.patient.last_name}`}
                </div>
                <span className="block ml-6 text-xs text-gray-500">
                  RUT: {payment.patient.rut}
                </span>
              </div>

              <div className="space-y-1">
                <span className="block text-[10px] font-black text-gray-400 uppercase tracking-wider">
                  Sucursal
                </span>
                <div className="flex items-center font-bold text-gray-700">
                  <Building2 className="w-4 h-4 mr-2 text-indigo-500" />
                  {payment.branch?.name || "Casa Central"}
                </div>
                <span className="block ml-6 text-xs text-gray-500">
                  {formatDate(payment.paid_at || payment.created_at)}
                </span>
              </div>

              <div className="space-y-1">
                <span className="block text-[10px] font-black text-gray-400 uppercase tracking-wider">
                  Método de Pago
                </span>
                <div className="flex items-center font-bold text-gray-700 capitalize">
                  <CreditCard className="w-4 h-4 mr-2 text-indigo-500" />
                  {payment.payment_method.replace("_", " ")}
                </div>
                {payment.transaction_reference && (
                  <span className="block ml-6 text-xs text-gray-500 uppercase">
                    Ref: {payment.transaction_reference}
                  </span>
                )}
              </div>
            </div>

            {/* 2. Detalle de Sesiones Pagadas */}
            <div>
              <h3 className="mb-4 text-xs font-black tracking-wider text-gray-400 uppercase">
                Detalle de Prestaciones
              </h3>
              <div className="overflow-hidden border border-gray-100 rounded-2xl">
                <table className="min-w-full divide-y divide-gray-100">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-[10px] font-black text-gray-500 uppercase">
                        Servicio
                      </th>
                      <th className="px-6 py-3 text-right text-[10px] font-black text-gray-500 uppercase">
                        Monto Bruto
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-50">
                    {payment?.payment_allocation?.map((alloc) => (
                      <tr key={alloc.id}>
                        <td className="px-6 py-4">
                          <div className="text-sm font-bold text-gray-800">
                            {alloc.treatment_session?.session_type?.name ||
                              "Atención Médica"}
                          </div>
                          <div className="text-[10px] text-gray-400 font-bold uppercase">
                            Sesión ID: {alloc.treatment_session_id} | Cod:{" "}
                            {alloc.treatment_session?.session_type.code}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm font-bold text-right text-gray-700">
                          {formatMoney(alloc.amount_clp)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* 3. Desglose Financiero Final */}
            <div className="flex justify-end">
              <div className="w-full p-6 space-y-3 border border-gray-100 md:w-80 bg-gray-50 rounded-2xl">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Total Bruto Atenciones</span>
                  <span className="font-medium">
                    {formatMoney(payment.amount_gross_clp)}
                  </span>
                </div>

                {payment.receivables.map((rec) => (
                  <div
                    key={rec.id}
                    className="flex justify-between text-sm italic font-bold text-green-600"
                  >
                    <span>Cobertura {rec.insurance?.name}</span>
                    <span>-{formatMoney(rec.amount_clp)}</span>
                  </div>
                ))}

                {payment.discount_clp > 0 && (
                  <div className="flex justify-between text-sm font-bold text-orange-600">
                    <span>Descuento Aplicado</span>
                    <span>-{formatMoney(payment.discount_clp)}</span>
                  </div>
                )}

                <div className="flex justify-between pt-4 border-t-2 border-gray-200 border-dashed">
                  <span className="text-lg font-black text-gray-900">
                    COPAGO PAGADO
                  </span>
                  <span className="text-lg font-black text-indigo-600">
                    {formatMoney(payment.amount_clp)}
                  </span>
                </div>
              </div>
            </div>

            {/* 4. Estado de la Boleta (DTE) */}
            {invoice && (
              <div
                className={`p-4 rounded-xl border flex items-center justify-between ${
                  is_dte_pending
                    ? "bg-amber-50 border-amber-100"
                    : "bg-blue-50 border-blue-100"
                }`}
              >
                <div className="flex items-center">
                  <Receipt
                    className={`w-5 h-5 mr-3 ${
                      is_dte_pending ? "text-amber-500" : "text-blue-500"
                    }`}
                  />
                  <div>
                    <p className="text-sm font-bold text-gray-800">
                      {is_dte_pending
                        ? "Boleta Electrónica en Proceso"
                        : `Boleta Generada: Folio #${
                            invoice.dte_folio || "S/N"
                          }`}
                    </p>
                    <p className="text-xs text-gray-500">
                      {is_dte_pending
                        ? "El documento se está firmando y enviando al SII."
                        : "El documento tributario ya fue emitido correctamente."}
                    </p>
                  </div>
                </div>
                {!is_dte_pending && (
                  <a
                    /*  href={route("invoices.download", invoice.id)} */
                    className="text-xs font-black tracking-tighter text-blue-600 uppercase hover:underline"
                  >
                    Descargar PDF
                  </a>
                )}
              </div>
            )}

            <div className="p-4 mt-6 bg-gray-50 rounded-2xl">
              <label className="block mb-2 text-sm font-bold text-gray-700">
                Enviar comprobante por email:
              </label>
              <div className="flex gap-2">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1 border-gray-200 rounded-xl"
                />
                <button
                  onClick={sendVoucher}
                  disabled={sending}
                  className="px-4 py-2 text-white bg-indigo-600 rounded-xl"
                >
                  {sending ? "Enviando..." : "Enviar"}
                </button>
              </div>
            </div>

            {/* Acciones Finales (Ocultas en impresión) */}
            <div className="flex flex-col gap-4 pt-6 md:flex-row print:hidden">
              <button
                onClick={() => window.print()}
                className="flex items-center justify-center flex-1 px-8 py-4 font-black text-gray-700 transition-all border-2 border-gray-200 rounded-2xl hover:bg-gray-50 active:scale-95"
              >
                <Printer className="w-5 h-5 mr-2" />
                Imprimir Comprobante
              </button>

              <Link
                href={route("payments.index")}
                className="flex items-center justify-center flex-1 px-8 py-4 font-black text-white transition-all bg-indigo-600 shadow-lg rounded-2xl hover:bg-indigo-700 shadow-indigo-100 active:scale-95"
              >
                <Plus className="w-5 h-5 mr-2" />
                Nueva Venta
              </Link>
            </div>
          </div>
        </div>

        {/* Footer del recibo (Solo impresión) */}
        <div className="hidden print:block mt-12 text-center text-[10px] text-gray-400">
          <p>Este documento es un comprobante interno de pago.</p>
          <p>
            Gracias por confiar en {payment.company?.name || "nuestra clínica"}.
          </p>
        </div>
      </div>
    </AuthenticatedLayout>
  );
};

export default Success;
