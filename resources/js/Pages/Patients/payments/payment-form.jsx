import { useState, useEffect } from "react";
import { useForm, usePage } from "@inertiajs/react";
import {
  DollarSign,
  Calendar,
  CreditCard,
  FileText,
  Receipt,
  CheckCircle,
  AlertCircle,
  Check,
} from "lucide-react";
import moment from "moment";
import { paymentMethods } from "@/helpers/status";
import PrimaryButton from "@/components/PrimaryButton";
import SecondaryButton from "@/components/SecondaryButton";

export default function PaymentForm({
  setOpenPaymentModal,
  payment = null,
  sessions = [], // <-- ahora usamos sessions
  isEditing = false,
  patient,
  treatment,
}) {
  const [selectedSessions, setSelectedSessions] = useState([]);
  const { current_company_id } = usePage().props;

  // Filtramos solo sesiones con deuda pendiente (vía Invoice)
  const pendingSessions = sessions.filter((s) => {
    // Buscamos si algún ítem de factura asociado a esta sesión está impago
    const invoice = s.invoice_items?.[0]?.invoice || s.invoice_item?.invoice;
    if (!invoice) return false;
    const status = typeof invoice.payment_status === 'object' ? invoice.payment_status.value : invoice.payment_status;
    return status === "unpaid" || status === "partial";
  });

  // Totales
  const totalPending = pendingSessions.reduce((sum, s) => {
    const invoice = s.invoice_items?.[0]?.invoice || s.invoice_item?.invoice;
    return sum + (parseFloat(invoice?.total_amount_clp) || 0);
  }, 0);

  const selectedTotal = selectedSessions.reduce((sum, sessId) => {
    const session = pendingSessions.find((s) => s.id === sessId);
    const invoice = session?.invoice_items?.[0]?.invoice || session?.invoice_item?.invoice;
    return sum + (parseFloat(invoice?.total_amount_clp) || 0);
  }, 0);

  const { data, setData, post, put, processing, errors, reset } = useForm({
    id: payment?.id || "",
    company_id: current_company_id || "",
    patient_id: payment?.patient_id || patient?.id || "",
    payment_date:
      payment?.payment_date || new Date().toISOString().split("T")[0],
    transaction_reference: "Pago sesiones kinesiológicas",
    amount_clp: payment?.amount_clp || "",
    payment_method: payment?.payment_method || "cash",
    status: payment?.status || "completed",
    paid_at: payment?.paid_at || new Date().toISOString().split("T")[0],
    session_ids: [],
  });

  useEffect(() => {
    if (payment && payment.id) {
      setSelectedSessions(payment.allocations?.map((a) => a.treatment_session_id).filter(Boolean) || []);
    } else {
      if (sessions.length > 0 && selectedSessions.length === 0) {
        // Sugerir pagar todas las sesiones impagas por defecto
        setSelectedSessions(pendingSessions.map((s) => s.id));
      }
    }
  }, [payment, sessions.length]);

  useEffect(() => {
    const total = selectedSessions.reduce((sum, id) => {
      const s = sessions.find((s) => s.id === id);
      const invoice = s?.invoice_items?.[0]?.invoice || s?.invoice_item?.invoice;
      return sum + (Number(invoice?.total_amount_clp) || 0);
    }, 0);
    setData("amount_clp", total.toString());
    setData("session_ids", selectedSessions);
  }, [selectedSessions]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (selectedSessions.length === 0) return alert("Seleccione al menos una sesión");

    const opts = {
      preserveState: (page) => Object.keys(page.props.errors || {}).length > 0,
      preserveScroll: true,
      onSuccess: () => {
        reset();
        setOpenPaymentModal(false);
      },
    };

    data.id ? put(route("payments.update", data.id), opts) : post(route("payments.store"), opts);
  };

  const handleCancel = () => {
    reset();
    setSelectedSessions([]);
    setOpenPaymentModal(false);
  };

  const toggleSession = (sessionId) => {
    setSelectedSessions((prev) => 
      prev.includes(sessionId) ? prev.filter((id) => id !== sessionId) : [...prev, sessionId]
    );
  };

  return (
    <div className="flex flex-col h-full bg-white relative">
      <form onSubmit={handleSubmit} className="flex flex-col h-full">
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 p-8 bg-gray-50/50 border-b border-gray-100 shrink-0">
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center w-12 h-12 bg-brand-primary text-white rounded-2xl shadow-xl shadow-brand-primary/20 transform rotate-3">
              <DollarSign className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-black text-gray-900 uppercase tracking-tight leading-none mb-1">
                {isEditing ? "Optimizar Pago" : "Registrar Recaudación"}
              </h1>
              <p className="text-[9px] font-black text-brand-gray uppercase tracking-[0.2em]">
                Balance de Paciente • Senex Enterprise
              </p>
            </div>
          </div>
        </div>

        {/* CONTENIDO SCROLLABLE */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-8 space-y-10">
          
          {/* KPIs DE SELECCIÓN */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-5 bg-white border border-gray-100 rounded-2xl shadow-sm">
                <p className="enterprise-label !text-[8px] opacity-60">Total Pendiente</p>
                <p className="text-xl font-black text-orange-600 font-mono tracking-tighter">${totalPending.toLocaleString("es-CL")}</p>
            </div>
            <div className="p-5 bg-brand-primary text-white rounded-2xl shadow-lg shadow-brand-primary/20">
                <p className="text-[8px] font-black uppercase tracking-widest opacity-60 mb-1">A Recaudar</p>
                <p className="text-xl font-black font-mono tracking-tighter">${selectedTotal.toLocaleString("es-CL")}</p>
            </div>
            <div className="p-5 bg-gray-900 text-white rounded-2xl shadow-xl">
                <p className="text-[8px] font-black uppercase tracking-widest opacity-40 mb-1">Sesiones</p>
                <p className="text-xl font-black font-mono tracking-tighter">{selectedSessions.length} <span className="text-[10px] opacity-30">Elegidas</span></p>
            </div>
          </div>

          {/* LISTADO DE SESIONES */}
          <div className="space-y-6">
            <h2 className="enterprise-label !text-brand-primary flex items-center gap-2 ml-1">
              <FileText className="w-4 h-4" /> Selección de Sesiones con Deuda
            </h2>
            
            {pendingSessions.length === 0 ? (
              <div className="py-16 text-center border-2 border-dashed border-gray-100 rounded-[2rem] bg-gray-50/30">
                <CheckCircle className="w-10 h-10 text-gray-200 mx-auto mb-4" />
                <p className="enterprise-label opacity-40">No hay deudas pendientes</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3">
                {pendingSessions.map((session) => {
                  const isSelected = selectedSessions.includes(session.id);
                  return (
                    <button
                      key={session.id}
                      type="button"
                      onClick={() => toggleSession(session.id)}
                      className={`w-full flex items-center justify-between p-5 rounded-2xl transition-all border-2 text-left group ${
                        isSelected 
                        ? "border-brand-primary bg-brand-primary/5 shadow-md" 
                        : "border-gray-50 bg-white hover:border-gray-200 text-gray-600"
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-colors ${isSelected ? 'bg-brand-primary border-brand-primary text-white' : 'border-gray-200'}`}>
                            {isSelected && <Check className="w-4 h-4" />}
                        </div>
                        <div>
                            <p className="text-xs font-black text-gray-900 uppercase tracking-tight">Sesión #{session.month_session_number} · {session.session_type?.name}</p>
                            <p className="text-[10px] font-bold text-brand-gray uppercase mt-0.5">{moment(session.date).format("DD/MM/YYYY")}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-black font-mono text-sm ${isSelected ? 'text-brand-primary' : 'text-gray-400'}`}>
                          ${(Number(session.invoice_items?.[0]?.invoice?.total_amount_clp || session.invoice_item?.invoice?.total_amount_clp || 0)).toLocaleString("es-CL")}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* INFORMACIÓN DE PAGO */}
          <div className="p-8 border border-gray-100 rounded-[2.5rem] bg-gray-50/30 space-y-8">
            <h2 className="enterprise-label !text-brand-primary flex items-center gap-2 ml-1">
              <CreditCard className="w-4 h-4" /> Detalles de Transacción
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-1">
                    <label className="enterprise-label ml-1">Monto a Recibir</label>
                    <div className="flex items-center w-full px-4 py-4 rounded-2xl border border-gray-100 bg-white shadow-inner focus-within:ring-2 focus-within:ring-brand-primary transition-all">
                        <span className="font-black text-brand-primary mr-2">$</span>
                        <input
                            type="number"
                            value={data.amount_clp}
                            onChange={(e) => setData("amount_clp", e.target.value)}
                            className="w-full p-0 border-none font-black text-gray-900 focus:ring-0 bg-transparent"
                            required
                        />
                    </div>
                </div>

                <div className="space-y-1">
                    <label className="enterprise-label ml-1">Fecha de Pago</label>
                    <input
                        type="date"
                        value={data.payment_date}
                        onChange={(e) => setData("payment_date", e.target.value)}
                        className="w-full px-5 py-4 rounded-2xl border-gray-100 font-black text-gray-700 focus:ring-brand-primary bg-white shadow-inner font-mono text-sm"
                        required
                    />
                </div>

                <div className="md:col-span-2 space-y-4">
                    <label className="enterprise-label ml-1">Medio de Pago</label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {paymentMethods.map((method) => (
                            <button
                                key={method.value}
                                type="button"
                                onClick={() => setData("payment_method", method.value)}
                                className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${
                                    data.payment_method === method.value 
                                    ? "border-brand-primary bg-brand-primary text-white shadow-lg shadow-brand-primary/20" 
                                    : "border-white bg-white hover:border-gray-100 text-gray-500"
                                }`}
                            >
                                <span className="text-xl">{method.icon}</span>
                                <span className="text-[9px] font-black uppercase tracking-widest">{method.label}</span>
                            </button>
                        ))}
                    </div>
                </div>

                <div className="md:col-span-2 space-y-1">
                    <label className="enterprise-label ml-1">Notas / Referencia</label>
                    <textarea
                        value={data.notes}
                        onChange={(e) => setData("notes", e.target.value)}
                        rows="3"
                        placeholder="Observaciones internas..."
                        className="w-full rounded-2xl border-gray-100 py-4 px-5 font-medium text-sm text-gray-700 bg-white focus:ring-brand-primary transition-all resize-none shadow-inner"
                    />
                </div>
            </div>
          </div>
        </div>

        {/* FOOTER FIJO */}
        <div className="sticky bottom-0 z-30 flex justify-end gap-4 p-8 bg-white/90 backdrop-blur-md border-t border-gray-100 shrink-0">
          <SecondaryButton onClick={handleCancel} className="!px-10 !py-4">
            Cancelar
          </SecondaryButton>
          <PrimaryButton
            type="submit"
            disabled={processing || selectedSessions.length === 0}
            className="!px-14 !py-4 shadow-2xl shadow-brand-primary/20"
          >
            {processing ? "Sincronizando..." : isEditing ? "Actualizar Pago" : "Confirmar Recaudación"}
          </PrimaryButton>
        </div>
      </form>
    </div>
  );
}

{
  /* Preview del nuevo saldo */
}
{
  /*  {!isEditing && data.amount_clp && selectedSessions.length > 0 && (
              <div className="p-2 mt-2 rounded-lg bg-blue-50 dark:bg-blue-900/20">
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  Nuevo saldo pendiente:{" "}
                  <span
                    className={`font-bold ${
                      shouldShowBalance <= 0
                        ? "text-green-600"
                        : "text-orange-600"
                    }`}
                  >
                    ${shouldShowBalance.toLocaleString("es-CL")}
                  </span>
                </p>
              </div>
            )} */
}

{
  /* Estado del Pago */
}
{
  /* <div>
            <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
              Estado del Pago *
            </label>
            <div className="grid grid-cols-3 gap-2">
              {statusOptions.map((option) => {
                const Icon = option.icon;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setData("status", option.value)}
                    className={`p-3 border-2 rounded-lg transition-all ${
                      data.status === option.value
                        ? getStatusColor(option.label) + " border-current"
                        : "border-gray-200 bg-white hover:bg-gray-50 dark:bg-gray-700 dark:border-gray-600"
                    }`}
                  >
                    <Icon
                      className={`w-5 h-5 mx-auto mb-1 ${
                        data.status === option.value
                          ? "text-current"
                          : "text-gray-400"
                      }`}
                    />
                    <span className="text-xs font-medium">{option.label}</span>
                  </button>
                );
              })}
            </div>
            {errors.status && (
              <p className="mt-1 text-sm text-red-600">{errors.status}</p>
            )}
          </div> */
}
