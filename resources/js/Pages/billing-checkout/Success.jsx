import React, { useState } from "react";
import { Head, Link, usePage } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import axios from "axios";
import Swal from "sweetalert2";
import {
  CheckCircle2,
  Printer,
  Download,
  ArrowLeft,
  Plus,
  Calendar,
  User,
  Building2,
  CreditCard,
  Receipt,
  FileText,
} from "lucide-react";

const Success = ({ payment, invoice, is_dte_pending }) => {
  const { auth, current_company } = usePage().props;
  const userIsSuperAdmin = auth.roles.includes("superadmin");
  const isDteOperational = current_company?.dte_configuration?.environment === 'production' && !current_company?.dte_configuration?.simulation_mode;

  const [email, setEmail] = useState(payment?.patient?.email || "");
  const [sending, setSending] = useState(false);
  const [showVoucherModal, setShowVoucherModal] = useState(false);

  const paymentMethodsMap = {
    'cash': 'Efectivo',
    'pos_integrado': 'Tarjeta (POS)',
    'transfer': 'Transferencia',
    'clinic_plan': 'Plan Clínica',
    'webpay': 'Webpay Online'
  };

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
    if (!invoice) {
        Swal.fire("Aviso", "No hay una boleta generada para enviar.", "info");
        return;
    }
    
    setSending(true);
    try {
      await axios.post(route("invoices.send_email", invoice.id), {
        email,
      });
      Swal.fire("¡Éxito!", "Boleta enviada correctamente a " + email, "success");
    } catch (e) {
      Swal.fire("Error", "No se pudo enviar el correo: " + (e.response?.data?.message || "Fallo técnico"), "error");
    } finally {
      setSending(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <AuthenticatedLayout>
      <Head title={`Pago Exitoso - ${payment.uuid.substring(0, 8)}`} />

      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          nav, aside, header, footer, .print\\:hidden { display: none !important; }
          body { background: white !important; margin: 0 !important; padding: 0 !important; }
          .AuthenticatedLayout_main { padding: 0 !important; margin: 0 !important; }
          .print\\:no-shadow { shadow: none !important; border: none !important; }
          .print\\:center { display: flex !important; justify-content: center !important; width: 100% !important; }
          @page { margin: 1cm; }
        }
      `}} />

      <div className="max-w-4xl px-4 py-8 mx-auto sm:px-6 print:max-w-none print:p-0">
        {/* Botón Volver (Oculto en impresión) */}
        <div className="mb-6 print:hidden">
          <Link
            href={route("payments.index")}
            className="inline-flex items-center text-xs font-black text-brand-gray uppercase tracking-widest transition hover:text-brand-primary"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver a la Caja
          </Link>
        </div>

        <div className="overflow-hidden bg-white border border-gray-100 shadow-xl rounded-[2rem] print:shadow-none print:border-none print:m-0">
          {/* Header de Éxito */}
          <div className="p-10 text-center border-b border-gray-50 bg-gradient-to-b from-gray-50/50 to-white print:bg-white print:pt-0">
            <div className="flex justify-center mb-6 print:hidden">
              <div className="p-4 bg-brand-primary rounded-3xl shadow-xl shadow-brand-primary/20 transform rotate-12">
                <CheckCircle2 className="w-12 h-12 text-white" />
              </div>
            </div>
            <h1 className="text-3xl font-black text-gray-900 print:text-2xl tracking-tight">
              ¡Pago Recibido!
            </h1>
            <p className="mt-2 font-mono text-[10px] font-black uppercase tracking-[0.2em] text-brand-gray">
              Transacción #
              {payment.uuid.substring(0, 8).toUpperCase()}
            </p>
          </div>

          <div className="p-10 space-y-10 print:p-0 print:mt-8">
            {/* 1. Información de Cabecera */}
            <div className="grid grid-cols-1 gap-8 pb-10 border-b border-gray-50 md:grid-cols-3 print:grid-cols-3 print:gap-4">
              <div className="space-y-2">
                <span className="enterprise-label">
                  Paciente
                </span>
                <div className="flex items-center font-black text-gray-900 uppercase text-sm tracking-tight">
                  <User className="w-4 h-4 mr-2 text-brand-primary" />
                  {payment.patient.full_name ||
                    `${payment.patient.name} ${payment.patient.last_name}`}
                </div>
                <span className="block ml-6 font-mono text-[11px] font-bold text-brand-gray">
                  RUT: {payment.patient.rut}
                </span>
              </div>

              <div className="space-y-2">
                <span className="enterprise-label">
                  Sucursal
                </span>
                <div className="flex items-center font-black text-gray-900 uppercase text-sm tracking-tight">
                  <Building2 className="w-4 h-4 mr-2 text-brand-primary" />
                  {payment.branch?.name || "Casa Central"}
                </div>
                <span className="block ml-6 font-mono text-[11px] font-bold text-brand-gray uppercase">
                  {formatDate(payment.paid_at || payment.created_at)}
                </span>
              </div>

              <div className="space-y-2">
                <span className="enterprise-label">
                  Método de Pago
                </span>
                <div className="flex items-center font-black text-gray-900 uppercase text-sm tracking-tight">
                  <CreditCard className="w-4 h-4 mr-2 text-brand-primary" />
                  {paymentMethodsMap[payment.payment_method] || payment.payment_method}
                </div>
                {payment.transaction_reference && (
                  <span className="block ml-6 font-mono text-[11px] font-bold text-brand-gray uppercase tracking-widest">
                    Ref: {payment.transaction_reference}
                  </span>
                )}
              </div>
            </div>

            {/* 2. Detalle de Sesiones Pagadas */}
            <div>
              <h3 className="mb-6 enterprise-label">
                Detalle de Prestaciones
              </h3>
              <div className="overflow-hidden border border-gray-100 rounded-2xl shadow-sm">
                <table className="min-w-full divide-y divide-gray-50">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest text-brand-gray/80">
                        Servicio
                      </th>
                      <th className="px-6 py-4 text-right text-[10px] font-black uppercase tracking-widest text-brand-gray/80">
                        Monto Bruto
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-50">
                    {payment?.payment_allocations?.map((alloc) => {
                      // Determinamos el nombre del servicio
                      let serviceName = "Atención Médica / Servicio";
                      let serviceDetails = "";
                      let extraInfo = null;

                      if (alloc.treatment_session?.session_type?.name) {
                        serviceName = alloc.treatment_session.session_type.name;
                        serviceDetails = `Sesión ID: ${alloc.treatment_session_id} | Cod: ${alloc.treatment_session.session_type?.code}`;
                      } else if (alloc.invoice?.items?.length > 0) {
                        // Si no es sesión, buscamos en los ítems de la factura (ej. Planes)
                        const items = alloc.invoice.items;
                        serviceName = items.map(i => i.description).join(', ');
                        
                        // Si detectamos que es un Plan, extraemos info detallada
                        const planItem = items.find(i => i.sellable_type === 'Plan');
                        if (planItem && planItem.sellable) {
                          const plan = planItem.sellable;
                          serviceName = `Plan: ${plan.name}`;
                          serviceDetails = `Vigencia: ${plan.valid_months} meses | Tipo: ${plan.type}`;
                        } else {
                          serviceDetails = `Ref: ${alloc.invoice.type_name || 'Doc'} #${alloc.invoice.dte_folio || 'S/N'}`;
                        }
                      }

                      return (
                        <tr key={alloc.id} className="hover:bg-gray-50/50 transition-colors">
                          <td className="px-6 py-5">
                            <div className="text-sm font-black text-gray-900 uppercase tracking-tight">
                              {serviceName}
                            </div>
                            <div className="mt-1 font-mono text-[10px] font-bold text-brand-gray uppercase tracking-widest">
                              {serviceDetails}
                            </div>
                          </td>
                          <td className="px-6 py-5 text-sm font-black text-right text-gray-900 font-mono">
                            {formatMoney(alloc.amount_clp)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* 3. Desglose Financiero Final */}
            <div className="flex justify-end">
              <div className="w-full p-8 space-y-4 border border-gray-100 md:w-96 bg-gray-50/50 rounded-3xl shadow-inner">
                <div className="flex justify-between items-center">
                  <span className="enterprise-label !mb-0 text-brand-gray">Total Bruto</span>
                  <span className="font-mono font-bold text-gray-700">
                    {formatMoney(payment.amount_gross_clp)}
                  </span>
                </div>

                {payment.receivables?.map((rec) => (
                  <div
                    key={rec.id}
                    className="flex justify-between items-center"
                  >
                    <span className="enterprise-label !mb-0 text-green-600">Cobertura {rec.insurance?.name}</span>
                    <span className="font-mono font-black text-green-600">-{formatMoney(rec.amount_clp)}</span>
                  </div>
                ))}

                {payment.discount_clp > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="enterprise-label !mb-0 text-orange-600">Descuento</span>
                    <span className="font-mono font-black text-orange-600">-{formatMoney(payment.discount_clp)}</span>
                  </div>
                )}

                <div className="flex justify-between pt-6 border-t-2 border-gray-200 border-dashed items-center">
                  <span className="text-lg font-black text-gray-900 uppercase tracking-tighter">
                    Copago Pagado
                  </span>
                  <span className="text-3xl font-black text-brand-primary font-mono tracking-tighter">
                    {formatMoney(payment.amount_clp)}
                  </span>
                </div>
              </div>
            </div>

            {/* 4. Estado de la Boleta (DTE) / Comprobante Digital */}
            {invoice && (
              <>
                {(isDteOperational || userIsSuperAdmin) ? (
                    <div
                        className={`p-8 rounded-[2rem] border-2 flex flex-col md:flex-row items-center justify-between gap-6 transition-all ${
                        is_dte_pending
                            ? "bg-amber-50/50 border-amber-100"
                            : "bg-blue-50/50 border-blue-100 shadow-lg shadow-blue-500/5"
                        }`}
                    >
                        <div className="flex items-center text-center md:text-left">
                        <div className={`p-4 rounded-2xl mr-6 transform -rotate-6 shadow-sm ${is_dte_pending ? 'bg-amber-100 text-amber-600' : 'bg-blue-100 text-blue-600'}`}>
                            <Receipt className="w-8 h-8" />
                        </div>
                        <div>
                            <p className={`text-[10px] font-black uppercase tracking-[0.2em] mb-1 ${is_dte_pending ? 'text-amber-700' : 'text-blue-700'}`}>
                            Documento SII
                            </p>
                            <p className="text-lg font-black text-gray-900 tracking-tight leading-none mb-1">
                            {is_dte_pending
                                ? "Generación en proceso"
                                : `${invoice.type_name || 'Boleta Electrónica'} Folio #${
                                    invoice.dte_folio || "S/N"
                                }`}
                            </p>
                            <p className="text-xs text-gray-500 font-bold uppercase tracking-tight opacity-70">
                            {is_dte_pending
                                ? "Validando con los servidores del SII..."
                                : "Emitida y validada correctamente"}
                            </p>
                        </div>
                        </div>
                        {!is_dte_pending && (
                        <a
                            href={route("invoices.pdf", invoice.id)}
                            target="_blank"
                            className="w-full md:w-auto px-8 py-4 bg-white border-2 border-blue-100 text-blue-600 rounded-2xl text-[10px] font-black uppercase tracking-[0.15em] hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all flex items-center justify-center gap-3 shadow-sm active:scale-95"
                        >
                            <Printer className="w-4 h-4" /> Ver Boleta SII
                        </a>
                        )}
                    </div>
                ) : (
                    /* Vista simplificada cuando NO es operacional (Modo Recibo Digital) */
                    <div className="p-8 rounded-[2rem] border-2 border-brand-secondary/20 bg-brand-secondary/5 flex flex-col md:flex-row items-center justify-between gap-6 print:hidden">
                         <div className="flex items-center text-center md:text-left">
                            <div className="p-4 rounded-2xl mr-6 bg-brand-secondary/20 text-brand-primary transform -rotate-3 shadow-sm">
                                <FileText className="w-8 h-8" />
                            </div>
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] mb-1 text-brand-primary">
                                Comprobante Digital
                                </p>
                                <p className="text-lg font-black text-gray-900 tracking-tight leading-none mb-1">
                                Recibo Interno de Pago
                                </p>
                                <p className="text-xs text-gray-500 font-bold uppercase tracking-tight opacity-70">
                                Documento listo para descarga y envío
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={() => setShowVoucherModal(true)}
                            className="w-full md:w-auto px-8 py-4 bg-white border-2 border-brand-secondary/30 text-brand-primary rounded-2xl text-[10px] font-black uppercase tracking-[0.15em] hover:bg-brand-primary hover:text-white hover:border-brand-primary transition-all flex items-center justify-center gap-3 shadow-sm active:scale-95"
                        >
                            <Download className="w-4 h-4" /> Descargar Recibo
                        </button>
                    </div>
                )}
              </>
            )}

            <div className="p-8 mt-10 bg-gray-50/50 border border-gray-100 rounded-[2rem] print:hidden">
              <label className="enterprise-label mb-4 block">
                Enviar por Correo Electrónico
              </label>
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-gray" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="correo@ejemplo.cl"
                    className="w-full pl-12 pr-4 py-4 border-gray-100 rounded-2xl bg-white focus:ring-brand-primary focus:border-brand-primary transition-all text-sm font-bold"
                  />
                </div>
                <button
                  onClick={sendVoucher}
                  disabled={sending}
                  className="px-10 py-4 text-[10px] font-black uppercase tracking-widest text-white bg-brand-primary rounded-2xl hover:brightness-110 transition-all shadow-lg shadow-brand-primary/20 disabled:opacity-50 active:scale-95"
                >
                  {sending ? "Enviando..." : "Enviar Comprobante"}
                </button>
              </div>
            </div>

            {/* Acciones Finales (Ocultas en impresión) */}
            <div className="flex flex-col gap-4 pt-10 md:flex-row print:hidden">
              <button
                onClick={() => setShowVoucherModal(true)}
                className="flex items-center justify-center flex-1 px-8 py-5 font-black text-brand-gray uppercase tracking-widest text-[10px] transition-all border-2 border-gray-100 rounded-2xl hover:bg-white hover:border-brand-primary hover:text-brand-primary active:scale-95 shadow-sm"
              >
                <Printer className="w-5 h-5 mr-3" />
                Ver Comprobante
              </button>

              <Link
                href={route("payments.index")}
                className="flex items-center justify-center flex-1 px-8 py-5 font-black text-brand-gray uppercase tracking-widest text-[10px] transition-all bg-white border-2 border-gray-100 rounded-2xl hover:bg-gray-50 active:scale-95 shadow-sm"
              >
                <Plus className="w-5 h-5 mr-3 text-brand-primary" />
                Nueva Venta
              </Link>
            </div>
          </div>
        </div>

        {/* --- MODAL DE VISUALIZACIÓN DE COMPROBANTE --- */}
        {showVoucherModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 backdrop-blur-sm p-4 md:p-10 animate-in fade-in duration-300">
            <div className="w-full max-w-5xl bg-white shadow-2xl rounded-[2.5rem] overflow-hidden flex flex-col h-[90vh]">
                <div className="bg-brand-primary p-6 flex justify-between items-center text-white shrink-0">
                    <div className="flex items-center gap-4">
                        <div className="bg-white/20 p-2 rounded-xl">
                            <Receipt className="w-5 h-5" />
                        </div>
                        <h3 className="font-black uppercase tracking-widest text-sm">Comprobante de Pago</h3>
                    </div>
                    <button 
                        onClick={() => setShowVoucherModal(false)}
                        className="p-2 hover:bg-white/10 rounded-xl transition-colors font-black"
                    >
                        ✕
                    </button>
                </div>
                <div className="flex-1 bg-gray-100">
                    <iframe 
                        src={route("payments.pdf", { uuid: payment.uuid })} 
                        className="w-full h-full border-none"
                        title="Comprobante de Pago"
                    />
                </div>
                <div className="p-4 bg-white border-t border-gray-50 flex justify-center shrink-0">
                    <button 
                        onClick={() => setShowVoucherModal(false)}
                        className="w-full md:w-48 py-4 text-[10px] font-black uppercase tracking-widest text-brand-gray hover:bg-gray-50 rounded-2xl transition-all border border-gray-100"
                    >
                        Cerrar Visor
                    </button>
                </div>
            </div>
          </div>
        )}

        {/* Footer del recibo (Solo impresión) */}
        <div className="hidden print:block mt-16 text-center text-[10px] font-black uppercase tracking-[0.2em] text-brand-gray opacity-50">
          <p>Este documento es un comprobante interno de recepción de pago.</p>
          <p className="mt-2">
            Gracias por confiar en {payment.company?.business_name || "nuestra clínica"}.
          </p>
        </div>
      </div>
    </AuthenticatedLayout>
  );
};

export default Success;
