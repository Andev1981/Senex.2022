import { useState, useMemo } from "react";
import { Head, useForm } from "@inertiajs/react";
import {
  Mail,
  DollarSign,
  Loader2,
  AlertCircle,
  User,
  Calendar,
  CheckCircle2,
  XCircle,
  FileText,
  Copy,
  ExternalLink,
  Link as LinkIcon,
  CreditCard,
  Clock,
} from "lucide-react";
import axios from "axios";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";

/**
 * Componente de PRUEBA para crear y probar Payment Links
 *
 * Este componente permite probar la creación de payment links
 * y simular el flujo completo de pago.
 *
 * Ubicación: resources/js/Pages/Payments/PaymentLinkTest.jsx
 * Ruta: /test/payment-links (solo para desarrollo)
 */
export default function PaymentLinks({ patients = [] }) {
  const [processing, setProcessing] = useState(false);
  const [createdLink, setCreatedLink] = useState(null);
  const [error, setError] = useState(null);

  const { data, setData, reset } = useForm({
    patient_id: "",
    description: "",
    amount: "",
    allow_partial_payment: false,
    minimum_amount: "",
    expires_in_days: 30,
    send_email: true,
    notes: "Payment link de prueba",
  });

  /**
   * Obtener información del paciente seleccionado
   */
  const selectedPatient = useMemo(() => {
    if (!data.patient_id) return null;
    return patients.find((p) => p.id === parseInt(data.patient_id));
  }, [data.patient_id, patients]);

  /**
   * Formatear monto en CLP
   */
  const formatCLP = (amount) => {
    return new Intl.NumberFormat("es-CL", {
      style: "currency",
      currency: "CLP",
      minimumFractionDigits: 0,
    }).format(amount || 0);
  };

  /**
   * Copiar URL al portapapeles
   */
  const copyToClipboard = (url) => {
    navigator.clipboard.writeText(url);
    alert("URL copiada al portapapeles! ✓");
  };

  /**
   * Abrir payment link en nueva pestaña
   */
  const openPaymentLink = (url) => {
    window.open(url, "_blank");
  };

  /**
   * Crear payment link
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setCreatedLink(null);

    // Validaciones
    if (!data.patient_id) {
      setError("Debes seleccionar un paciente");
      return;
    }

    if (!data.description) {
      setError("Debes ingresar una descripción");
      return;
    }

    if (!data.amount || data.amount < 50) {
      setError("El monto debe ser al menos $50 CLP");
      return;
    }

    if (
      data.allow_partial_payment &&
      (!data.minimum_amount || data.minimum_amount < 50)
    ) {
      setError("El monto mínimo debe ser al menos $50 CLP");
      return;
    }

    setProcessing(true);

    try {
      const payload = {
        patient_id: data.patient_id,
        description: data.description,
        amount: parseInt(data.amount),
        allow_partial_payment: data.allow_partial_payment,
        minimum_amount: data.allow_partial_payment
          ? parseInt(data.minimum_amount)
          : null,
        expires_in_days: parseInt(data.expires_in_days),
        send_email: data.send_email,
        notes: data.notes,
      };

      console.log("Creando payment link:", payload);

      const response = await axios.post("/admin/payment-links", payload);

      console.log("Payment link creado:", response.data);

      if (response.data.success) {
        setCreatedLink({
          ...response.data.payment_link,
          url: response.data.url,
        });

        // Limpiar formulario
        reset();
      } else {
        setError(response.data.message || "Error al crear payment link");
      }
    } catch (err) {
      console.error("Error creando payment link:", err);

      let errorMessage = "Hubo un error al crear el payment link.";
      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.response?.data?.errors) {
        errorMessage = Object.values(err.response.data.errors)
          .flat()
          .join(", ");
      } else if (err.message) {
        errorMessage = err.message;
      }

      setError(errorMessage);
    } finally {
      setProcessing(false);
    }
  };

  // Montos predefinidos para pruebas rápidas
  const quickAmounts = [
    { label: "$1.000", value: 1000 },
    { label: "$5.000", value: 5000 },
    { label: "$10.000", value: 10000 },
    { label: "$25.000", value: 25000 },
    { label: "$50.000", value: 50000 },
    { label: "$100.000", value: 100000 },
  ];

  // Descripciones de ejemplo
  const exampleDescriptions = [
    "Pago sesiones de kinesiología - Mes de Noviembre",
    "Deuda pendiente - Tratamiento",
    "Plan mensual 10 sesiones",
    "Sesión individual",
    "Pago completo tratamiento",
  ];

  return (
    <AuthenticatedLayout>
      <Head title="Prueba de Payment Links" />

      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg shadow-lg p-6 mb-6 text-white">
            <div className="flex items-center gap-3">
              <LinkIcon className="w-8 h-8" />
              <div>
                <h1 className="text-2xl font-bold">Prueba de Payment Links</h1>
                <p className="text-indigo-100 text-sm">
                  Crea y prueba enlaces de pago en ambiente de desarrollo
                </p>
              </div>
            </div>
          </div>

          {/* Alerta de desarrollo */}
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
                  Ruta: GET /test/payment-links (proteger con middleware auth)
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Formulario de Creación */}
            <div className="lg:col-span-2">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Card Principal */}
                <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                  {/* Header del form */}
                  <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                      <FileText className="w-5 h-5 text-indigo-600" />
                      Crear Payment Link
                    </h2>
                  </div>

                  <div className="p-6 space-y-6">
                    {/* Selección de Paciente */}
                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Paciente *
                      </label>
                      <select
                        value={data.patient_id}
                        onChange={(e) => setData("patient_id", e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white"
                      >
                        <option value="">Seleccionar paciente...</option>
                        {patients.length > 0 ? (
                          patients.map((patient) => (
                            <option key={patient.id} value={patient.id}>
                              {patient.name} {patient.last_name} - RUT:{" "}
                              {patient.rut}
                            </option>
                          ))
                        ) : (
                          <>
                            <option value="1">Juan Pérez - 12.345.678-9</option>
                            <option value="2">
                              María González - 98.765.432-1
                            </option>
                            <option value="3">
                              Pedro Rodríguez - 11.222.333-4
                            </option>
                          </>
                        )}
                      </select>

                      {selectedPatient && (
                        <div className="mt-3 flex items-center gap-2 text-sm bg-indigo-50 text-indigo-700 px-3 py-2 rounded-lg">
                          <CheckCircle2 className="w-4 h-4" />
                          <span>
                            Email: <strong>{selectedPatient.email}</strong>
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Descripción */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Descripción *
                      </label>
                      <textarea
                        value={data.description}
                        onChange={(e) => setData("description", e.target.value)}
                        placeholder="Ej: Pago sesiones de kinesiología - Mes de Noviembre"
                        rows={3}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                      />

                      {/* Ejemplos rápidos */}
                      <div className="mt-2">
                        <p className="text-xs text-gray-600 mb-2">
                          ⚡ Ejemplos rápidos:
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {exampleDescriptions.map((desc, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => setData("description", desc)}
                              className="px-2 py-1 text-xs bg-gray-100 hover:bg-indigo-50 text-gray-700 hover:text-indigo-700 rounded border border-gray-300 hover:border-indigo-400 transition-all"
                            >
                              {desc}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Monto */}
                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-lg p-5">
                      <label className="block text-sm font-medium text-gray-800 mb-3 flex items-center gap-2">
                        <DollarSign className="w-5 h-5 text-green-600" />
                        Monto Total (CLP) *
                      </label>

                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-bold text-gray-500">
                          $
                        </span>
                        <input
                          type="number"
                          value={data.amount}
                          onChange={(e) => setData("amount", e.target.value)}
                          placeholder="0"
                          min="50"
                          step="1"
                          className={`w-full pl-10 pr-4 py-4 border-2 rounded-lg text-2xl font-bold text-center transition-all ${
                            data.amount
                              ? "border-green-400 bg-white text-green-700 focus:ring-4 focus:ring-green-200"
                              : "border-gray-300 bg-white focus:border-green-400 focus:ring-2 focus:ring-green-200"
                          }`}
                        />
                      </div>

                      {data.amount && (
                        <div className="mt-3 text-center">
                          <p className="text-sm text-gray-600">
                            Equivalente a:
                          </p>
                          <p className="text-lg font-bold text-green-700">
                            {formatCLP(data.amount)}
                          </p>
                        </div>
                      )}

                      {/* Montos rápidos */}
                      <div className="mt-4">
                        <p className="text-xs text-gray-600 mb-2 font-medium">
                          ⚡ Montos rápidos:
                        </p>
                        <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                          {quickAmounts.map((quick) => (
                            <button
                              key={quick.value}
                              type="button"
                              onClick={() => setData("amount", quick.value)}
                              className="px-3 py-2 text-sm font-medium bg-white hover:bg-green-50 text-gray-700 hover:text-green-700 rounded-lg border border-gray-300 hover:border-green-400 transition-all"
                            >
                              {quick.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Pagos Parciales */}
                    <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                      <label className="flex items-start gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={data.allow_partial_payment}
                          onChange={(e) =>
                            setData("allow_partial_payment", e.target.checked)
                          }
                          className="mt-1 w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <div>
                          <div className="font-medium text-gray-900">
                            Permitir pagos parciales
                          </div>
                          <div className="text-sm text-gray-600">
                            El paciente podrá pagar en cuotas o abonos
                          </div>
                        </div>
                      </label>

                      {data.allow_partial_payment && (
                        <div className="mt-4">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Monto Mínimo por Pago *
                          </label>
                          <div className="relative">
                            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                              type="number"
                              value={data.minimum_amount}
                              onChange={(e) =>
                                setData("minimum_amount", e.target.value)
                              }
                              placeholder="5000"
                              min="50"
                              className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                          </div>
                          <p className="mt-2 text-xs text-gray-500">
                            El paciente podrá pagar desde este monto hasta el
                            total
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Expiración */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                        <Clock className="w-4 h-4 text-gray-600" />
                        Expira en (días)
                      </label>
                      <select
                        value={data.expires_in_days}
                        onChange={(e) =>
                          setData("expires_in_days", e.target.value)
                        }
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      >
                        <option value="1">1 día</option>
                        <option value="3">3 días</option>
                        <option value="7">7 días (1 semana)</option>
                        <option value="15">15 días</option>
                        <option value="30">30 días (1 mes)</option>
                        <option value="60">60 días (2 meses)</option>
                        <option value="90">90 días (3 meses)</option>
                      </select>
                    </div>

                    {/* Enviar Email */}
                    <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                      <label className="flex items-start gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={data.send_email}
                          onChange={(e) =>
                            setData("send_email", e.target.checked)
                          }
                          className="mt-1 w-5 h-5 text-green-600 border-gray-300 rounded focus:ring-green-500"
                        />
                        <div>
                          <div className="flex items-center gap-2 font-medium text-gray-900">
                            <Mail className="w-4 h-4 text-green-600" />
                            Enviar email automáticamente
                          </div>
                          <div className="text-sm text-gray-600">
                            Se enviará el payment link al email del paciente
                          </div>
                        </div>
                      </label>
                    </div>

                    {/* Notas */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Notas Internas (opcional)
                      </label>
                      <textarea
                        value={data.notes}
                        onChange={(e) => setData("notes", e.target.value)}
                        rows={2}
                        placeholder="Notas privadas para uso interno..."
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Botón de envío */}
                <button
                  type="submit"
                  disabled={
                    processing ||
                    !data.patient_id ||
                    !data.amount ||
                    !data.description
                  }
                  className={`w-full py-5 px-6 rounded-xl font-bold text-lg text-white transition-all flex items-center justify-center gap-3 shadow-xl ${
                    processing ||
                    !data.patient_id ||
                    !data.amount ||
                    !data.description
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 transform hover:scale-[1.02] active:scale-[0.98]"
                  }`}
                >
                  {processing ? (
                    <>
                      <Loader2 className="w-6 h-6 animate-spin" />
                      Creando Payment Link...
                    </>
                  ) : (
                    <>
                      <LinkIcon className="w-6 h-6" />
                      Crear Payment Link
                    </>
                  )}
                </button>

                {(!data.patient_id || !data.amount || !data.description) && (
                  <p className="text-center text-sm text-gray-500 -mt-2">
                    {!data.patient_id &&
                      "Selecciona un paciente para continuar"}
                    {data.patient_id &&
                      !data.description &&
                      "Ingresa una descripción para continuar"}
                    {data.patient_id &&
                      data.description &&
                      !data.amount &&
                      "Ingresa un monto para continuar"}
                  </p>
                )}

                {/* Error Message */}
                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <XCircle className="w-5 h-5 text-red-600 mt-0.5" />
                      <div>
                        <p className="font-semibold text-red-900">Error</p>
                        <p className="text-sm text-red-700">{error}</p>
                      </div>
                    </div>
                  </div>
                )}
              </form>
            </div>

            {/* Panel Lateral - Resultado */}
            <div className="lg:col-span-1">
              {createdLink ? (
                <div className="bg-white rounded-lg shadow-lg overflow-hidden sticky top-6">
                  <div className="bg-gradient-to-r from-green-500 to-emerald-500 px-6 py-4 text-white">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-6 h-6" />
                      <h3 className="text-lg font-bold">¡Link Creado!</h3>
                    </div>
                  </div>

                  <div className="p-6 space-y-4">
                    {/* Información del Link */}
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Descripción</p>
                      <p className="font-medium text-gray-900">
                        {createdLink.description}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-gray-600 mb-1">Monto</p>
                      <p className="text-2xl font-bold text-green-600">
                        {formatCLP(createdLink.amount)}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-gray-600 mb-1">Estado</p>
                      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                        Pendiente
                      </span>
                    </div>

                    {/* URL */}
                    <div>
                      <p className="text-sm text-gray-600 mb-2">
                        URL del Payment Link
                      </p>
                      <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                        <p className="text-xs font-mono text-gray-700 break-all mb-3">
                          {createdLink.url}
                        </p>

                        <div className="flex gap-2">
                          <button
                            onClick={() => copyToClipboard(createdLink.url)}
                            className="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
                          >
                            <Copy className="w-4 h-4" />
                            Copiar
                          </button>

                          <button
                            onClick={() => openPaymentLink(createdLink.url)}
                            className="flex-1 px-3 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
                          >
                            <ExternalLink className="w-4 h-4" />
                            Abrir
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Email Info */}
                    {data.send_email && (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                        <div className="flex items-start gap-2">
                          <Mail className="w-4 h-4 text-green-600 mt-0.5" />
                          <div className="text-sm text-green-800">
                            <p className="font-medium">Email enviado</p>
                            <p className="text-xs">
                              El paciente recibirá el link por email
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Botón para crear otro */}
                    <button
                      onClick={() => {
                        setCreatedLink(null);
                        setError(null);
                      }}
                      className="w-full px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors"
                    >
                      Crear otro Payment Link
                    </button>
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-lg shadow-lg p-6">
                  <div className="text-center py-8 text-gray-400">
                    <LinkIcon className="w-16 h-16 mx-auto mb-4" />
                    <p className="text-gray-600">
                      Crea un payment link para ver los detalles aquí
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Información de prueba */}
          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="font-semibold text-blue-900 mb-4 flex items-center gap-2">
              <CreditCard className="w-5 h-5" />
              🧪 Tarjetas de Prueba (Ambiente Integration)
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2 text-sm text-blue-800">
                <div className="font-semibold mb-2">
                  ✅ Transacciones Exitosas:
                </div>
                <div>
                  <span className="font-semibold">Visa:</span>
                  <code className="ml-2 bg-white px-2 py-1 rounded text-xs">
                    4051885600446623
                  </code>
                </div>
                <div>
                  <span className="font-semibold">Mastercard:</span>
                  <code className="ml-2 bg-white px-2 py-1 rounded text-xs">
                    5186059559590568
                  </code>
                </div>
              </div>

              <div className="space-y-2 text-sm text-blue-800">
                <div className="font-semibold mb-2">
                  ❌ Transacciones Rechazadas:
                </div>
                <div>
                  <span className="font-semibold">Sin fondos:</span>
                  <code className="ml-2 bg-white px-2 py-1 rounded text-xs">
                    4051886000056590
                  </code>
                </div>
                <div className="text-xs mt-2">
                  * CVV: <code className="bg-white px-1 rounded">123</code>
                  <br />
                  * Fecha: Cualquier fecha futura
                  <br />* RUT: Cualquier RUT válido chileno
                </div>
              </div>
            </div>
          </div>

          {/* Panel de Debug */}
          {import.meta.env.DEV && (
            <div className="mt-6 bg-gray-900 text-gray-100 rounded-lg p-6 font-mono text-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">
                  Estado del Formulario (Debug)
                </h3>
                <span className="text-xs text-gray-400">
                  Solo visible en desarrollo
                </span>
              </div>

              <div className="space-y-4">
                <div>
                  <span className="text-green-400">Form Data:</span>
                  <pre className="mt-1 text-xs overflow-x-auto">
                    {JSON.stringify(data, null, 2)}
                  </pre>
                </div>

                {createdLink && (
                  <div>
                    <span className="text-blue-400">Created Link:</span>
                    <pre className="mt-1 text-xs overflow-x-auto">
                      {JSON.stringify(createdLink, null, 2)}
                    </pre>
                  </div>
                )}

                {error && (
                  <div>
                    <span className="text-red-400">Error:</span>
                    <pre className="mt-1 text-xs overflow-x-auto text-red-300">
                      {error}
                    </pre>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
