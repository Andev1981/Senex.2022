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

  // Filtramos solo sesiones con deuda pendiente
  const pendingSessions = sessions.filter(
    (s) => s.debt && s.debt.status === "pending"
  );

  // Totales
  const totalPending = pendingSessions.reduce(
    (sum, s) => sum + (parseFloat(s.debt.original_amount) || 0),
    0
  );

  const selectedTotal = selectedSessions.reduce((sum, sessId) => {
    const session = pendingSessions.find((s) => s.id === sessId);
    return sum + (parseFloat(session?.debt.original_amount) || 0);
  }, 0);

  const { data, setData, post, put, processing, errors, reset } = useForm({
    id: payment?.id || "",
    company_id: current_company_id || "",
    patient_id: payment?.patient_id || patient?.id || "",
    payment_date:
      payment?.payment_date || new Date().toISOString().split("T")[0],
    transaction_reference: "Pago sesiónes kinesiológicas",
    amount_clp: payment?.amount_clp || "",
    payment_method: payment?.payment_method || "cash",
    status: payment?.status || "completed",
    paid_at: payment?.paid_at || new Date().toISOString().split("T")[0],
    session_ids: [],
  });

  useEffect(() => {
    if (payment) {
      // Pre-seleccionar las deudas que ya tenía el pago (editar)
      setSelectedSessions(payment.debts?.map((d) => d.session_id) || []);
      setData({
        id: payment?.id || "",
        company_id: current_company_id || "",
        patient_id: payment?.patient_id || patient?.id || "",
        payment_date:
          payment?.payment_date || new Date().toISOString().split("T")[0],
        transaction_reference: "Pago sesiónes kinesiológicas",
        amount_clp: payment?.amount_clp || "",
        payment_method: payment?.payment_method || "cash",
        status: payment?.status || "completed",
        paid_at: payment?.paid_at || new Date().toISOString().split("T")[0],
        session_ids: selectedSessions,
      });
    } else {
      // Nuevo: seleccionar todo solo la primera vez que haya sesiones
      if (sessions.length > 0 && selectedSessions.length === 0) {
        const payable = sessions.filter(
          (s) =>
            s.status === "completed" && s.debt && s.debt.status === "pending"
        );
        setSelectedSessions(payable.map((s) => s.id));
        setData(
          "amount_clp",
          payable
            .reduce((sum, s) => sum + parseFloat(s.debt.original_amount), 0)
            .toString()
        );
      }
    }
  }, [payment]);

  // 1. Actualizar monto
  useEffect(() => {
    const total = selectedSessions.reduce((sum, id) => {
      const s = sessions.find((s) => s.id === id);
      return sum + (s?.debt?.original_amount || 0);
    }, 0);
    setData("amount_clp", total.toString());
  }, [selectedSessions]);

  // 2. Sincronizar IDs
  useEffect(() => {
    setData("session_ids", selectedSessions);
  }, [selectedSessions]);

  // Actualizar monto cuando cambian selecciones
  useEffect(() => {
    setData("amount_clp", selectedTotal.toString());
  }, [selectedSessions]);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (selectedSessions.length === 0) {
      alert("Seleccione al menos una sesión a pagar");
      return;
    }

    // Armamos el payload con los IDs de sesión
    const payload = {
      ...data,
      session_ids: selectedSessions, // solo los IDs
    };

    const opts = {
      data: payload,
      preserveState: (page) => Object.keys(page.props.errors || {}).length > 0,
      preserveScroll: true,
      onSuccess: () => {
        reset();
        setOpenPaymentModal(false);
      },
      onError: () => {
        // Mantener modal abierto (no lo cierres aquí)
        // Opcional: enfocar el primer campo con error
        const firstErrorName = Object.keys(errors || {})[0];
        if (firstErrorName) {
          const el = document.querySelector(`[name="${firstErrorName}"]`);
          el?.focus?.();
        }
      },
    };

    if (data.id) {
      // usa PUT/PATCH si tu ruta es resourceful
      // put(route('pacientes.update', data.id), opts);
      put(route("payments.update", data.id), opts); // si tu ruta acepta POST con _method
    } else {
      post(route("payments.store"), opts);
    }
  };

  const handleCancel = () => {
    reset();
    setSelectedSessions([]);
    setOpenPaymentModal(false);
  };

  const toggleSession = (sessionId) => {
    setSelectedSessions((prev) => {
      if (prev.includes(sessionId)) {
        return prev.filter((id) => id !== sessionId);
      } else {
        return [...prev, sessionId];
      }
    });
  };

  const selectAllSessions = () => {
    setSelectedSessions(pendingSessions.map((s) => s.id));
  };

  const clearAllSessions = () => {
    setSelectedSessions([]);
  };

  const getStatusColor = (status) => {
    const colors = {
      completed: "bg-green-100 text-green-700 border-green-200",
      pending: "bg-yellow-100 text-yellow-700 border-yellow-200",
      failed: "bg-red-100 text-red-700 border-red-200",
      refunded: "bg-blue-100 text-blue-700 border-blue-200",
    };
    return colors[status] || colors.completed;
  };

  // Dentro de tu componente, antes del return:
  const amountInput = parseFloat(data?.amount_clp) || 0;
  const totalSelected = parseFloat(selectedTotal) || 0;

  // Calculamos el balance asegurando que no baje de 0 si es un pago
  // o permitiendo negativos si es un abono.
  const newBalance = totalSelected - amountInput;

  // Variable de control para mostrar el div solo si hay datos válidos
  const shouldShowBalance =
    !isEditing && amountInput > 0 && selectedSessions.length > 0;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Resumen Financiero */}
      {!isEditing && (
        <div className="grid grid-cols-1 gap-4 p-4 border border-gray-200 rounded-lg md:grid-cols-3 bg-gradient-to-br from-blue-50 to-transparent dark:border-gray-700 dark:from-blue-900/20">
          <div className="p-3 bg-white rounded-lg shadow-sm dark:bg-gray-800">
            <p className="mb-1 text-xs text-gray-600 dark:text-gray-400">
              Total Pendiente
            </p>
            <p className="text-2xl font-bold text-orange-600">
              ${totalPending.toLocaleString("es-CL")}
            </p>
          </div>

          <div className="p-3 bg-white rounded-lg shadow-sm dark:bg-gray-800">
            <p className="mb-1 text-xs text-gray-600 dark:text-gray-400">
              Sesiones Seleccionadas
            </p>
            <p className="text-2xl font-bold text-blue-600">
              {selectedSessions.length}
            </p>
          </div>

          <div className="p-3 bg-white rounded-lg shadow-sm dark:bg-gray-800">
            <p className="mb-1 text-xs text-gray-600 dark:text-gray-400">
              Total Seleccionado
            </p>
            <p className="text-2xl font-bold text-teal-600">
              ${selectedTotal.toLocaleString("es-CL")}
            </p>
          </div>
        </div>
      )}

      {/* Selección de Sesiones */}
      <div className="p-4 border border-gray-200 rounded-lg dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
            <FileText className="w-5 h-5 text-blue-600" />
            Sesiones a Pagar
          </h3>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={selectAllSessions}
              className="px-3 py-1 text-xs font-medium text-blue-700 bg-blue-100 rounded-lg hover:bg-blue-200"
            >
              Seleccionar Todas
            </button>
            <button
              type="button"
              onClick={clearAllSessions}
              className="px-3 py-1 text-xs font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
            >
              Limpiar
            </button>
          </div>
        </div>

        {pendingSessions.length === 0 ? (
          <div className="py-8 text-center text-gray-500">
            No hay sesiones pendientes de pago
          </div>
        ) : (
          <div className="space-y-3 overflow-y-auto max-h-96">
            {pendingSessions
              .slice() // evita mutar el array original
              /* .sort((a, b) => a?.id - b?.id) */
              .map((session) => {
                const isSelected = selectedSessions.includes(session.id);
                return (
                  <div
                    key={session.id}
                    onClick={() => toggleSession(session.id)}
                    className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      isSelected
                        ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                        : "border-gray-200 bg-white hover:border-gray-300 dark:bg-gray-800 dark:border-gray-600"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`mt-1 w-5 h-5 rounded border-2 flex items-center justify-center ${
                          isSelected
                            ? "bg-blue-600 border-blue-600"
                            : "border-gray-300 bg-white"
                        }`}
                      >
                        {isSelected && <Check className="w-3 h-3 text-white" />}
                      </div>

                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-semibold text-gray-900 dark:text-white">
                              Sesión #{session.month_session_number} ·{" "}
                              {session.session_type?.name}
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {moment(session.date).format("DD/MM/YYYY")}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-bold text-orange-600">
                              $
                              {parseFloat(
                                session.debt.original_amount
                              ).toLocaleString("es-CL")}
                            </p>
                            <p className="text-xs text-gray-500">Pendiente</p>
                          </div>
                        </div>

                        {/* Barra de progreso */}
                        <div className="mb-2">
                          <div className="flex justify-between mb-1 text-xs text-gray-600 dark:text-gray-400">
                            <span>
                              Pagado: $
                              {parseFloat(
                                session.debt.paid_amount || 0
                              ).toLocaleString("es-CL")}
                            </span>
                            <span>
                              Total: $
                              {parseFloat(
                                session.debt.original_amount
                              ).toLocaleString("es-CL")}
                            </span>
                          </div>
                          <div className="w-full h-2 bg-gray-200 rounded-full dark:bg-gray-700">
                            <div
                              className="h-2 transition-all bg-green-500 rounded-full"
                              style={{
                                width: `${
                                  (parseFloat(session.debt.paid_amount || 0) /
                                    parseFloat(session.debt.original_amount)) *
                                  100
                                }%`,
                              }}
                            ></div>
                          </div>
                        </div>

                        {session.debt.due_date && (
                          <p className="text-xs text-gray-500">
                            Vence:{" "}
                            {moment(session.debt.due_date).format("DD/MM/YYYY")}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        )}

        {errors.session_ids && (
          <p className="mt-2 text-sm text-red-600">{errors.session_ids}</p>
        )}
      </div>

      {/* Información del Pago */}
      <div className="p-4 border border-gray-200 rounded-lg dark:border-gray-700">
        <h3 className="flex items-center gap-2 mb-4 text-lg font-semibold text-gray-900 dark:text-white">
          <DollarSign className="w-5 h-5 text-green-600" />
          Información del Pago
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            {/* Monto */}
            <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
              Monto a Pagar *
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                $
              </span>
              <input
                type="number"
                /* min="0"
                step="0.01" */
                value={data.amount_clp}
                onChange={(e) => setData("amount_clp", e.target.value)}
                className="w-full py-2 pl-8 pr-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="0"
                required
              />
            </div>
            {errors.amount_clp && (
              <p className="mt-1 text-sm text-red-600">{errors.amount_clp}</p>
            )}

            {/* Botones de monto rápido */}
            <div className="flex gap-2 mt-2">
              <button
                type="button"
                onClick={() => setData("amount_clp", selectedTotal.toString())}
                className="px-3 py-1 text-xs font-medium text-green-700 bg-green-100 rounded-lg hover:bg-green-200"
                disabled={selectedSessions.length === 0}
              >
                Pagar Total Seleccionado
              </button>
            </div>
          </div>

          <div>
            {/* Fecha del Pago */}
            <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
              Fecha del Pago *
            </label>
            <div className="relative">
              <Calendar className="absolute w-5 h-5 text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
              <input
                type="date"
                value={data.payment_date}
                onChange={(e) => setData("payment_date", e.target.value)}
                className="w-full py-2 pl-10 pr-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                required
              />
            </div>
            {errors.payment_date && (
              <p className="mt-1 text-sm text-red-600">{errors.payment_date}</p>
            )}
          </div>
        </div>
      </div>

      {/* Método de Pago */}
      <div className="p-4 border border-gray-200 rounded-lg dark:border-gray-700">
        <h3 className="flex items-center gap-2 mb-4 text-lg font-semibold text-gray-900 dark:text-white">
          <CreditCard className="w-5 h-5 text-blue-600" />
          Método de Pago
        </h3>

        <div className="grid grid-cols-2 gap-3 mb-4 md:grid-cols-3">
          {paymentMethods.map((method) => (
            <button
              key={method.value}
              type="button"
              onClick={() => setData("payment_method", method.value)}
              className={`p-3 border-2 rounded-lg transition-all ${
                data.payment_method === method.value
                  ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                  : "border-gray-200 bg-white hover:bg-gray-50 dark:bg-gray-700 dark:border-gray-600"
              }`}
            >
              <div className="mb-1 text-2xl">{method.icon}</div>
              <div
                className={`text-xs font-medium ${
                  data.payment_method === method.value
                    ? "text-blue-700 dark:text-blue-400"
                    : "text-gray-700 dark:text-gray-300"
                }`}
              >
                {method.label}
              </div>
            </button>
          ))}
        </div>

        {/* Referencia/Comprobante */}
        {data.payment_method !== "cash" && (
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
              Número de Referencia / Comprobante
            </label>
            <div className="relative">
              <Receipt className="absolute w-5 h-5 text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
              <input
                type="text"
                value={data.transaction_reference}
                onChange={(e) =>
                  setData("transaction_reference", e.target.value)
                }
                className="w-full py-2 pl-10 pr-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="Ej: 123456789, Cheque N° 001"
              />
            </div>
            {errors.transaction_reference && (
              <p className="mt-1 text-sm text-red-600">
                {errors.transaction_reference}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Notas Adicionales */}
      <div className="p-4 border border-gray-200 rounded-lg dark:border-gray-700">
        <h3 className="flex items-center gap-2 mb-4 text-lg font-semibold text-gray-900 dark:text-white">
          <FileText className="w-5 h-5 text-gray-600" />
          Notas Adicionales
        </h3>

        <textarea
          value={data.notes}
          onChange={(e) => setData("notes", e.target.value)}
          rows="4"
          placeholder="Observaciones o detalles adicionales del pago..."
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        />
        {errors.notes && (
          <p className="mt-1 text-sm text-red-600">{errors.notes}</p>
        )}
      </div>

      {/* Buttons */}
      <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
        <button
          type="button"
          onClick={handleCancel}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600"
          disabled={processing}
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={processing || selectedSessions.length === 0}
        >
          <DollarSign className="w-4 h-4" />
          {processing
            ? "Guardando..."
            : isEditing
            ? "Actualizar Pago"
            : "Registrar Pago"}
        </button>
      </div>
    </form>
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
