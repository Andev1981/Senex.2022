import { useState } from "react";
import { Head, useForm } from "@inertiajs/react";
import { CreditCard, DollarSign, Loader2, AlertCircle } from "lucide-react";
import axios from "axios";

/**
 * Componente de PRUEBA para iniciar pagos con Webpay
 *
 * Este componente permite probar la integración de Webpay
 * ingresando diferentes montos y escenarios.
 *
 * Ubicación sugerida: resources/js/Pages/Payments/WebpayTest.jsx
 * Ruta sugerida: /test/webpay (solo para desarrollo)
 */
export default function WebpayTest({
  patients = [],
  sessions = [],
  debts = [],
}) {
  const [paymentType, setPaymentType] = useState("session"); // 'session', 'multiple', 'debts', 'plan'
  const [processing, setProcessing] = useState(false);
  const { data, setData, post, errors } = useForm({
    patient_id: "",
    amount: "",
    session_id: "",
    session_ids: [],
    debt_ids: [],
    plan_id: "",
    notes: "Pago de prueba desde WebpayTest.jsx",
  });

  // Formatear monto en CLP
  const formatCLP = (amount) => {
    return new Intl.NumberFormat("es-CL", {
      style: "currency",
      currency: "CLP",
    }).format(amount || 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validar monto
    if (!data.amount || data.amount < 50) {
      alert("El monto debe ser al menos $50 CLP");
      return;
    }

    // Validar paciente
    if (!data.patient_id) {
      alert("Debes seleccionar un paciente");
      return;
    }

    let route = "";
    let payload = {
      patient_id: data.patient_id,
      amount: parseInt(data.amount),
      notes: data.notes,
    };

    switch (paymentType) {
      case "session":
        if (!data.session_id) {
          alert("Debes seleccionar una sesión");
          return;
        }
        route = `/payments/webpay/session/${data.session_id}`;
        break;

      case "multiple":
        if (data.session_ids.length === 0) {
          alert("Debes seleccionar al menos una sesión");
          return;
        }
        route = "/payments/webpay/sessions/multiple";
        payload.session_ids = data.session_ids;
        break;

      case "debts":
        if (data.debt_ids.length === 0) {
          alert("Debes seleccionar al menos una deuda");
          return;
        }
        route = "/payments/webpay/debts";
        payload.debt_ids = data.debt_ids;
        break;

      case "plan":
        if (!data.plan_id) {
          alert("Debes ingresar un plan_id");
          return;
        }
        route = `/payments/webpay/plan/${data.plan_id}`;
        break;

      default:
        alert("Tipo de pago no válido");
        return;
    }

    console.log("Enviando pago a:", route, payload);
    setProcessing(true);

    try {
      // 🚀 Enviar solicitud usando axios (NO Inertia)
      const response = await axios.post(route, payload);

      console.log("Webpay response:", response.data);

      if (!response.data.url || !response.data.token) {
        alert("Error: Webpay no devolvió URL o Token");
        return;
      }

      // -------------------------------------------------------
      // 🔥 Crear form dinámico para enviar token a Webpay
      // -------------------------------------------------------
      const form = document.createElement("form");
      form.method = "POST";
      form.action = response.data.url;

      const input = document.createElement("input");
      input.type = "hidden";
      input.name = "token_ws";
      input.value = response.data.token;

      form.appendChild(input);
      document.body.appendChild(form);

      // Enviar formulario automáticamente
      form.submit();
    } catch (error) {
      console.error("Error conectando a Webpay:", error);
      alert("Hubo un error iniciando el pago.");
    } finally {
      setProcessing(false);
    }
  };

  // Montos predefinidos para pruebas rápidas
  const quickAmounts = [
    { label: "$1.000", value: 1000 },
    { label: "$5.000", value: 5000 },
    { label: "$10.000", value: 10000 },
    { label: "$30.000", value: 30000 },
    { label: "$50.000", value: 50000 },
    { label: "$100.000", value: 100000 },
  ];

  return (
    <>
      <Head title="Prueba de Webpay" />

      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg shadow-lg p-6 mb-6 text-white">
            <div className="flex items-center gap-3">
              <CreditCard className="w-8 h-8" />
              <div>
                <h1 className="text-2xl font-bold">Prueba de Webpay Plus</h1>
                <p className="text-blue-100 text-sm">
                  Ambiente:{" "}
                  {import.meta.env.VITE_WEBPAY_ENVIRONMENT || "integration"}
                </p>
              </div>
            </div>
          </div>

          {/* Alertas de desarrollo */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
              <div className="text-sm text-yellow-800">
                <p className="font-semibold mb-1">⚠️ Componente de Prueba</p>
                <p>
                  Este componente es solo para desarrollo. NO usar en
                  producción.
                </p>
                <p className="mt-2 font-mono text-xs">
                  Ruta: GET /test/webpay (proteger con middleware auth)
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Card Principal */}
            <div className="bg-white rounded-lg shadow-lg p-6 space-y-6">
              {/* Tipo de Pago */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de Pago
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { value: "session", label: "Sesión Individual" },
                    { value: "multiple", label: "Múltiples Sesiones" },
                    { value: "debts", label: "Deudas" },
                    { value: "plan", label: "Plan" },
                  ].map((type) => (
                    <button
                      key={type.value}
                      type="button"
                      onClick={() => setPaymentType(type.value)}
                      className={`px-4 py-3 rounded-lg border-2 transition-colors ${
                        paymentType === type.value
                          ? "border-blue-500 bg-blue-50 text-blue-700 font-semibold"
                          : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
                      }`}
                    >
                      {type.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Paciente */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Paciente *
                </label>
                <select
                  value={data.patient_id}
                  onChange={(e) => setData("patient_id", e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Seleccionar paciente...</option>
                  {patients.length > 0 ? (
                    patients.map((patient) => (
                      <option key={patient.id} value={patient.id}>
                        {patient.full_name} - RUT: {patient.rut}
                      </option>
                    ))
                  ) : (
                    <>
                      <option value="1">Juan Pérez - 12.345.678-9</option>
                      <option value="2">María González - 98.765.432-1</option>
                      <option value="3">Pedro Rodríguez - 11.222.333-4</option>
                    </>
                  )}
                </select>
                {errors.patient_id && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.patient_id}
                  </p>
                )}
              </div>

              {/* Campos específicos según tipo de pago */}
              {paymentType === "session" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sesión *
                  </label>
                  <select
                    value={data.session_id}
                    onChange={(e) => setData("session_id", e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Seleccionar sesión...</option>
                    {sessions.length > 0 ? (
                      sessions.map((session) => (
                        <option key={session.id} value={session.id}>
                          Sesión #{session.session_number} -{" "}
                          {formatCLP(session.patient_amount_clp)}
                        </option>
                      ))
                    ) : (
                      <>
                        <option value="1">Sesión #1 - $30.000</option>
                        <option value="2">Sesión #2 - $25.000</option>
                        <option value="3">Sesión #3 - $30.000</option>
                      </>
                    )}
                  </select>
                </div>
              )}

              {paymentType === "multiple" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sesiones (separar con coma) *
                  </label>
                  <input
                    type="text"
                    placeholder="Ej: 1,2,3"
                    value={data.session_ids.join(",")}
                    onChange={(e) =>
                      setData(
                        "session_ids",
                        e.target.value
                          .split(",")
                          .map((id) => id.trim())
                          .filter(Boolean)
                      )
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    Ingresa los IDs de las sesiones separados por coma
                  </p>
                </div>
              )}

              {paymentType === "debts" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Deudas (separar con coma) *
                  </label>
                  <input
                    type="text"
                    placeholder="Ej: 1,2,3"
                    value={data.debt_ids.join(",")}
                    onChange={(e) =>
                      setData(
                        "debt_ids",
                        e.target.value
                          .split(",")
                          .map((id) => id.trim())
                          .filter(Boolean)
                      )
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    Ingresa los IDs de las deudas separados por coma
                  </p>
                </div>
              )}

              {paymentType === "plan" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Plan ID *
                  </label>
                  <input
                    type="number"
                    placeholder="Ej: 1"
                    value={data.plan_id}
                    onChange={(e) => setData("plan_id", e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              )}

              {/* Monto */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Monto (CLP) *
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="number"
                    value={data.amount}
                    onChange={(e) => setData("amount", e.target.value)}
                    placeholder="Ingresa el monto en pesos chilenos"
                    min="50"
                    step="1"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg font-semibold"
                  />
                </div>
                {data.amount && (
                  <p className="mt-2 text-sm text-gray-600">
                    = {formatCLP(data.amount)}
                  </p>
                )}
                {errors.amount && (
                  <p className="mt-1 text-sm text-red-600">{errors.amount}</p>
                )}

                {/* Montos rápidos */}
                <div className="mt-3">
                  <p className="text-xs text-gray-500 mb-2">Montos rápidos:</p>
                  <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                    {quickAmounts.map((quick) => (
                      <button
                        key={quick.value}
                        type="button"
                        onClick={() => setData("amount", quick.value)}
                        className="px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded border border-gray-300 transition-colors"
                      >
                        {quick.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Notas */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notas
                </label>
                <textarea
                  value={data.notes}
                  onChange={(e) => setData("notes", e.target.value)}
                  rows={2}
                  placeholder="Notas adicionales..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Botón de envío */}
            <button
              type="submit"
              disabled={processing}
              className={`w-full py-4 px-6 rounded-lg font-semibold text-white transition-all flex items-center justify-center gap-2 ${
                processing
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700 shadow-lg hover:shadow-xl"
              }`}
            >
              {processing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Redirigiendo a Webpay...
                </>
              ) : (
                <>
                  <CreditCard className="w-5 h-5" />
                  Pagar con Webpay Plus
                </>
              )}
            </button>

            {/* Información de prueba */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900 mb-2">
                🧪 Tarjetas de Prueba (Ambiente Integration)
              </h3>
              <div className="space-y-2 text-sm text-blue-800">
                <div>
                  <span className="font-semibold">Visa Exitosa:</span>
                  <code className="ml-2 bg-white px-2 py-1 rounded">
                    4051885600446623
                  </code>
                  <span className="ml-2">CVV: 123</span>
                </div>
                <div>
                  <span className="font-semibold">Mastercard Exitosa:</span>
                  <code className="ml-2 bg-white px-2 py-1 rounded">
                    5186059559590568
                  </code>
                  <span className="ml-2">CVV: 123</span>
                </div>
                <div>
                  <span className="font-semibold">Rechazo por Saldo:</span>
                  <code className="ml-2 bg-white px-2 py-1 rounded">
                    4051886000056590
                  </code>
                  <span className="ml-2">CVV: 123</span>
                </div>
                <p className="mt-2 text-xs">
                  * Cualquier fecha de vencimiento futura y RUT válido chileno
                </p>
              </div>
            </div>
          </form>

          {/* Debug info */}
          {import.meta.env.DEV && (
            <div className="mt-6 bg-gray-100 border border-gray-300 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-2">Debug Info</h3>
              <pre className="text-xs text-gray-700 overflow-auto">
                {JSON.stringify(
                  {
                    paymentType,
                    data,
                    errors,
                  },
                  null,
                  2
                )}
              </pre>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
