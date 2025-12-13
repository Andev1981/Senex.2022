import { useState, useMemo, useEffect, useCallback } from "react";
import { Head, useForm } from "@inertiajs/react";
import {
  CreditCard,
  DollarSign,
  Loader2,
  AlertCircle,
  User,
  Calendar,
  CheckCircle2,
  XCircle,
  FileText,
} from "lucide-react";
import axios from "axios";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
/**
 * Componente de PRUEBA para iniciar pagos con Webpay
 *
 * Este componente permite probar la integración de Webpay
 * ingresando diferentes montos y escenarios.
 *
 * Ubicación: resources/js/Pages/Payments/WebpayTest.jsx
 * Ruta: /test/webpay (solo para desarrollo)
 */
export default function WebpayTest({
  patients = [],
  sessions = [],
  debts = [],
  plans = [],
}) {
  const [paymentType, setPaymentType] = useState("session"); // 'session', 'multiple', 'debts', 'plan'
  const [processing, setProcessing] = useState(false);
  const [selectedSessions, setSelectedSessions] = useState([]);
  const [selectedDebts, setSelectedDebts] = useState([]);
  const [selectedPlans, setSelectedPlans] = useState([]);

  const { data, setData, post, errors } = useForm({
    patient_id: "",
    amount_clp: "",
    session_id: "",
    session_ids: [],
    debt_ids: [],
    plan_ids: [],
    notes: "Pago de prueba desde WebpayTest.jsx",
  });

  // Filtrar sesiones del paciente seleccionado
  const patientSessions = useMemo(() => {
    if (!data.patient_id) return [];
    return sessions.filter((s) => s.patient_id === parseInt(data.patient_id));
  }, [data.patient_id, sessions]);

  // Filtrar deudas del paciente seleccionado
  const patientDebts = useMemo(() => {
    if (!data.patient_id) return [];
    return debts.filter((d) => d.patient_id === parseInt(data.patient_id));
  }, [data.patient_id, debts]);

  // Filtrar planes del paciente seleccionado
  const patientPlans = useMemo(() => {
    if (!data.patient_id) return [];
    return plans.filter((p) => p.patient_id === parseInt(data.patient_id));
  }, [data.patient_id, plans]);

  const shouldShowSummary =
    data.patient_id &&
    data.amount_clp &&
    ((data.payment_type === "session" && selectedSessions.length > 0) ||
      (data.payment_type === "debt" && selectedDebts.length > 0) ||
      (data.payment_type === "plan" && selectedPlans.length > 0) ||
      (data.payment_type === "payment_plan" && data.amount_clp > 0));

  // Calcular monto total de sesiones seleccionadas
  const calculateSessionsTotal = () => {
    return selectedSessions.reduce((sum, sessionId) => {
      const session = patientSessions.find((s) => s.id === sessionId);
      return sum + (session?.patient_amount || 0);
    }, 0);
  };

  // Calcular monto total de deudas seleccionadas
  const calculateDebtsTotal = () => {
    return selectedDebts.reduce((sum, debtId) => {
      const debt = patientDebts.find((d) => d.id === debtId);
      return sum + (debt?.original_amount || 0);
    }, 0);
  };

  // Calcular total de planes seleccionados
  const calculatePlansTotal = useCallback(() => {
    return selectedPlans.reduce((sum, plan) => {
      return sum + (plan.price_per_session_clp || 0);
    }, 0);
  }, [selectedPlans]);

  // Obtener información del paciente seleccionado
  const selectedPatient = useMemo(() => {
    if (!data.patient_id) return null;
    return patients.find((p) => p.id === parseInt(data.patient_id));
  }, [data.patient_id, patients]);

  // Manejar cambio de paciente - resetear todo
  const handlePatientChange = (patientId) => {
    setData({
      ...data,
      patient_id: patientId,
      session_id: "",
      session_ids: [],
      debt_ids: [],
      plan_ids: [],
      amount_clp: "",
    });
    setSelectedSessions([]);
    setSelectedDebts([]);
    setSelectedPlans([]);
  };

  // Toggle sesión para pago múltiple
  const toggleSession = (sessionId) => {
    const newSelected = selectedSessions.includes(sessionId)
      ? selectedSessions.filter((id) => id !== sessionId)
      : [...selectedSessions, sessionId];

    setSelectedSessions(newSelected);
    setData("session_ids", newSelected);

    // Actualizar monto automáticamente
    const total = newSelected.reduce((sum, id) => {
      const session = patientSessions.find((s) => s.id === id);
      return sum + (session?.patient_amount || 0);
    }, 0);
    setData("amount_clp", total);
  };

  // Toggle deuda para pago múltiple
  const toggleDebt = (debtId) => {
    const newSelected = selectedDebts.includes(debtId)
      ? selectedDebts.filter((id) => id !== debtId)
      : [...selectedDebts, debtId];

    setSelectedDebts(newSelected);
    setData("debt_ids", newSelected);

    // Actualizar monto automáticamente
    const total = newSelected.reduce((sum, id) => {
      const debt = patientDebts.find((d) => d.id === id);
      return sum + (debt?.original_amount || 0);
    }, 0);
    setData("amount_clp", total);
  };

  // Toggle selección de plan individual
  const togglePlan = (plan) => {
    setSelectedPlans((prev) => {
      const exists = prev.find((p) => p.id === plan.id);
      if (exists) {
        return prev.filter((p) => p.id !== plan.id);
      } else {
        return [...prev, plan];
      }
    });
  };

  // Actualizar monto cuando se selecciona una sesión individual
  const handleSessionChange = (sessionId) => {
    setData("session_id", sessionId);
    const session = patientSessions.find((s) => s.id === parseInt(sessionId));
    if (session) {
      setData("amount_clp", session.patient_amount);
    }
  };

  // Formatear monto en CLP
  const formatCLP = (amount_clp) => {
    return new Intl.NumberFormat("es-CL", {
      style: "currency",
      currency: "CLP",
    }).format(amount_clp || 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validar monto
    if (!data.amount_clp || data.amount_clp < 50) {
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
      amount_clp: parseInt(data.amount_clp),
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
        if (selectedSessions.length === 0) {
          alert("Debes seleccionar al menos una sesión");
          return;
        }
        route = "/payments/webpay/sessions/multiple";
        payload.session_ids = selectedSessions;
        break;

      case "debts":
        if (selectedDebts.length === 0) {
          alert("Debes seleccionar al menos una deuda");
          return;
        }
        route = "/payments/webpay/debts";
        payload.debt_ids = selectedDebts;
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
        setProcessing(false);
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

      let errorMessage = "Hubo un error iniciando el pago.";
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }

      alert(errorMessage);
      setProcessing(false);
    }
  };

  useEffect(() => {
    if (data.payment_type === "session" && selectedSessions.length > 0) {
      const total = calculateSessionsTotal();
      setData((prev) => ({ ...prev, amount_clp: total }));
    } else if (data.payment_type === "debt" && selectedDebts.length > 0) {
      const total = calculateDebtsTotal();
      setData((prev) => ({ ...prev, amount_clp: total }));
    } else if (data.payment_type === "plan" && selectedPlans.length > 0) {
      // ⭐ NUEVO
      const total = calculatePlansTotal();
      setData((prev) => ({ ...prev, amount_clp: total }));
    }
  }, [
    selectedSessions,
    selectedDebts,
    selectedPlans, // ⭐ NUEVO
    data.payment_type,
    calculateSessionsTotal,
    calculateDebtsTotal,
    calculatePlansTotal, // ⭐ NUEVO
  ]);

  // Montos predefinidos para pruebas rápidas
  const quickAmounts = [
    { label: "$1.000", value: 1000 },
    { label: "$5.000", value: 5000 },
    { label: "$10.000", value: 10000 },
    { label: "$30.000", value: 30000 },
    { label: "$50.000", value: 50000 },
    { label: "$100.000", value: 100000 },
  ];

  const paymentTypes = [
    { value: "session", label: "Sesión", icon: FileText },
    { value: "payment_plan", label: "Plan de Pago", icon: Calendar },
    { value: "debt", label: "Deuda", icon: AlertCircle },
    { value: "plan", label: "Plan", icon: CheckCircle2 }, // ⭐ NUEVO
  ];

  return (
    <AuthenticatedLayout>
      <Head title="Prueba de Webpay" />

      <div className="min-h-screen px-4 py-8 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="p-6 mb-6 text-white rounded-lg shadow-lg bg-gradient-to-r from-blue-600 to-blue-800">
            <div className="flex items-center gap-3">
              <CreditCard className="w-8 h-8" />
              <div>
                <h1 className="text-2xl font-bold">Prueba de Webpay Plus</h1>
                <p className="text-sm text-blue-100">
                  Ambiente:{" "}
                  {import.meta.env.VITE_WEBPAY_ENVIRONMENT || "integration"}
                </p>
              </div>
            </div>
          </div>

          {/* Alertas de desarrollo */}
          <div className="p-4 mb-6 border border-yellow-200 rounded-lg bg-yellow-50">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
              <div className="text-sm text-yellow-800">
                <p className="mb-1 font-semibold">⚠️ Componente de Prueba</p>
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
            <div className="overflow-hidden bg-white rounded-lg shadow-lg">
              {/* Header del form */}
              <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100">
                <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-800">
                  <User className="w-5 h-5 text-blue-600" />
                  Configuración del Pago
                </h2>
              </div>

              <div className="p-6 space-y-6">
                {/* Tipo de Pago */}
                <div>
                  <label className="block mb-3 text-sm font-medium text-gray-700">
                    Tipo de Pago
                  </label>
                  <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                    {[
                      {
                        value: "session",
                        label: "Sesión Individual",
                        icon: FileText,
                      },
                      {
                        value: "multiple",
                        label: "Múltiples Sesiones",
                        icon: CheckCircle2,
                      },
                      { value: "debts", label: "Deudas", icon: AlertCircle },
                      { value: "plan", label: "Plan", icon: Calendar },
                    ].map((type) => {
                      const Icon = type.icon;
                      return (
                        <button
                          key={type.value}
                          type="button"
                          onClick={() => {
                            setPaymentType(type.value);
                            setData({
                              ...data,
                              session_id: "",
                              session_ids: [],
                              debt_ids: [],
                              amount_clp: "",
                            });
                            setSelectedSessions([]);
                            setSelectedDebts([]);
                          }}
                          className={`px-4 py-4 rounded-lg border-2 transition-all ${
                            paymentType === type.value
                              ? "border-blue-500 bg-blue-50 text-blue-700 font-semibold shadow-md"
                              : "border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:shadow"
                          }`}
                        >
                          <Icon className="w-5 h-5 mx-auto mb-1" />
                          <div className="text-sm">{type.label}</div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Selección de Paciente */}
                <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                  <label className="block mb-2 text-sm font-medium text-gray-700">
                    Paciente *
                  </label>
                  <select
                    value={data.patient_id}
                    onChange={(e) => handlePatientChange(e.target.value)}
                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                        <option value="3">
                          Pedro Rodríguez - 11.222.333-4
                        </option>
                      </>
                    )}
                  </select>

                  {/* Información del paciente seleccionado */}
                  {selectedPatient && (
                    <div className="flex items-center gap-2 px-3 py-2 mt-3 text-sm text-blue-700 rounded-lg bg-blue-50">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>
                        Paciente seleccionado:{" "}
                        <strong>{selectedPatient.full_name}</strong>
                      </span>
                    </div>
                  )}

                  {errors.patient_id && (
                    <p className="flex items-center gap-1 mt-2 text-sm text-red-600">
                      <XCircle className="w-4 h-4" />
                      {errors.patient_id}
                    </p>
                  )}
                </div>

                {/* Campos específicos según tipo de pago */}
                {paymentType === "session" && (
                  <div className="p-4 bg-white border border-gray-200 rounded-lg">
                    <label className="block mb-3 text-sm font-medium text-gray-700">
                      Sesión a Pagar *
                    </label>

                    {!data.patient_id ? (
                      <div className="py-8 text-center text-gray-500">
                        <Calendar className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                        <p>Primero selecciona un paciente</p>
                      </div>
                    ) : patientSessions.length === 0 ? (
                      <div className="py-8 text-center text-gray-500">
                        <XCircle className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                        <p>Este paciente no tiene sesiones disponibles</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {patientSessions.map((session) => (
                          <label
                            key={session.id}
                            className={`flex items-center justify-between p-3 border-2 rounded-lg cursor-pointer transition-all ${
                              data.session_id === session.id.toString()
                                ? "border-blue-500 bg-blue-50"
                                : "border-gray-200 hover:border-blue-300 hover:bg-gray-50"
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <input
                                type="radio"
                                name="session"
                                value={session.id}
                                checked={
                                  data.session_id === session.id.toString()
                                }
                                onChange={(e) =>
                                  handleSessionChange(e.target.value)
                                }
                                className="w-4 h-4 text-blue-600"
                              />
                              <div>
                                <p className="font-medium text-gray-900">
                                  Sesión #{session.month_session_number}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {new Date(session.date).toLocaleDateString(
                                    "es-CL"
                                  )}{" "}
                                  - {session.status}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-blue-600">
                                {formatCLP(session.patient_amount)}
                              </p>
                            </div>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {paymentType === "multiple" && (
                  <div className="p-4 bg-white border border-gray-200 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <label className="text-sm font-medium text-gray-700">
                        Seleccionar Sesiones *
                      </label>
                      {selectedSessions.length > 0 && (
                        <span className="px-2 py-1 text-xs text-blue-700 bg-blue-100 rounded-full">
                          {selectedSessions.length} seleccionada(s)
                        </span>
                      )}
                    </div>

                    {!data.patient_id ? (
                      <div className="py-8 text-center text-gray-500">
                        <Calendar className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                        <p>Primero selecciona un paciente</p>
                      </div>
                    ) : patientSessions.length === 0 ? (
                      <div className="py-8 text-center text-gray-500">
                        <XCircle className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                        <p>Este paciente no tiene sesiones disponibles</p>
                      </div>
                    ) : (
                      <div className="space-y-2 overflow-y-auto max-h-64">
                        {patientSessions.map((session) => (
                          <label
                            key={session.id}
                            className={`flex items-center justify-between p-3 border-2 rounded-lg cursor-pointer transition-all ${
                              selectedSessions.includes(session.id)
                                ? "border-blue-500 bg-blue-50"
                                : "border-gray-200 hover:border-blue-300 hover:bg-gray-50"
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <input
                                type="checkbox"
                                checked={selectedSessions.includes(session.id)}
                                onChange={() => toggleSession(session.id)}
                                className="w-4 h-4 text-blue-600 rounded"
                              />
                              <div>
                                <p className="font-medium text-gray-900">
                                  Sesión #{session.month_session_number}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {new Date(session.date).toLocaleDateString(
                                    "es-CL"
                                  )}{" "}
                                  - {session.status}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-gray-700">
                                {formatCLP(session.patient_amount)}
                              </p>
                            </div>
                          </label>
                        ))}
                      </div>
                    )}

                    {selectedSessions.length > 0 && (
                      <div className="pt-3 mt-3 border-t border-gray-200">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Total a pagar:</span>
                          <span className="text-lg font-bold text-blue-600">
                            {formatCLP(calculateSessionsTotal())}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {paymentType === "debts" && (
                  <div className="p-4 bg-white border border-gray-200 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <label className="text-sm font-medium text-gray-700">
                        Seleccionar Deudas *
                      </label>
                      {selectedDebts.length > 0 && (
                        <span className="px-2 py-1 text-xs text-red-700 bg-red-100 rounded-full">
                          {selectedDebts.length} seleccionada(s)
                        </span>
                      )}
                    </div>

                    {!data.patient_id ? (
                      <div className="py-8 text-center text-gray-500">
                        <AlertCircle className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                        <p>Primero selecciona un paciente</p>
                      </div>
                    ) : patientDebts.length === 0 ? (
                      <div className="py-8 text-center text-green-500">
                        <CheckCircle2 className="w-12 h-12 mx-auto mb-3 text-green-400" />
                        <p className="font-medium">¡Sin deudas pendientes!</p>
                        <p className="text-sm text-gray-500">
                          Este paciente no tiene deudas
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-2 overflow-y-auto max-h-64">
                        {patientDebts.map((debt) => (
                          <label
                            key={debt.id}
                            className={`flex items-center justify-between p-3 border-2 rounded-lg cursor-pointer transition-all ${
                              selectedDebts.includes(debt.id)
                                ? "border-red-500 bg-red-50"
                                : "border-gray-200 hover:border-red-300 hover:bg-gray-50"
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <input
                                type="checkbox"
                                checked={selectedDebts.includes(debt.id)}
                                onChange={() => toggleDebt(debt.id)}
                                className="w-4 h-4 text-red-600 rounded"
                              />
                              <div>
                                <p className="font-medium text-gray-900">
                                  Deuda #{debt.id}
                                </p>
                                <p className="text-xs text-gray-500">
                                  Vence:{" "}
                                  {new Date(debt.due_date).toLocaleDateString(
                                    "es-CL"
                                  )}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-red-600">
                                {formatCLP(debt.original_amount)}
                              </p>
                            </div>
                          </label>
                        ))}
                      </div>
                    )}

                    {selectedDebts.length > 0 && (
                      <div className="pt-3 mt-3 border-t border-gray-200">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Total a pagar:</span>
                          <span className="text-lg font-bold text-red-600">
                            {formatCLP(calculateDebtsTotal())}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {paymentType === "plan" && (
                  <div className="p-6 bg-white rounded-lg shadow">
                    <h3 className="mb-4 text-lg font-semibold text-gray-900">
                      Seleccionar Plan
                    </h3>

                    {!data.patient_id ? (
                      <div className="py-12 text-center">
                        <Calendar className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                        <p className="text-gray-500">
                          Primero selecciona un paciente
                        </p>
                      </div>
                    ) : patientPlans.length === 0 ? (
                      <div className="py-12 text-center">
                        <XCircle className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                        <p className="text-gray-500">
                          Este paciente no tiene planes activos
                        </p>
                      </div>
                    ) : (
                      <div>
                        <div className="mb-4 text-sm text-gray-600">
                          {selectedPlans.length === 0
                            ? "Selecciona un plan para pagar"
                            : `${selectedPlans.length} plan(es) seleccionado(s)`}
                        </div>

                        <div className="space-y-3 overflow-y-auto max-h-64">
                          {patientPlans.map((plan) => {
                            const isSelected = selectedPlans.some(
                              (p) => p.id === plan.id
                            );

                            return (
                              <div
                                key={plan.id}
                                onClick={() => togglePlan(plan)}
                                className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                                  isSelected
                                    ? "border-purple-500 bg-purple-50 shadow-md"
                                    : "border-gray-200 hover:border-purple-300 hover:bg-purple-25"
                                }`}
                              >
                                <div className="flex items-start justify-between">
                                  <div className="flex items-start flex-1 gap-3">
                                    <input
                                      type="checkbox"
                                      checked={isSelected}
                                      onChange={() => togglePlan(plan)}
                                      onClick={(e) => e.stopPropagation()}
                                      className="w-5 h-5 mt-1 text-purple-600 rounded focus:ring-purple-500"
                                    />

                                    <div className="flex-1">
                                      <div className="flex items-center gap-2 mb-1">
                                        <span className="font-semibold text-gray-900">
                                          {plan.plan_name}
                                        </span>
                                        <span
                                          className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                                            plan.status === "active"
                                              ? "bg-green-100 text-green-800"
                                              : "bg-gray-100 text-gray-800"
                                          }`}
                                        >
                                          {plan.status}
                                        </span>
                                      </div>

                                      <div className="space-y-1 text-sm text-gray-600">
                                        <div>
                                          Sesiones: {plan.sessions_used} /{" "}
                                          {plan.total_sessions} usadas (
                                          {plan.remaining_sessions} restantes)
                                        </div>
                                        <div>
                                          Vigencia:{" "}
                                          {new Date(
                                            plan.start_date
                                          ).toLocaleDateString("es-CL")}
                                          {plan.end_date &&
                                            ` - ${new Date(
                                              plan.end_date
                                            ).toLocaleDateString("es-CL")}`}
                                        </div>
                                      </div>
                                    </div>
                                  </div>

                                  <div className="ml-4 text-right">
                                    <div className="font-bold text-purple-600">
                                      {formatCLP(plan.price_per_session_clp)}
                                    </div>
                                    <div className="text-xs text-gray-500">
                                      por sesión
                                    </div>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Monto */}
                <div className="p-5 border-2 border-green-200 rounded-lg bg-gradient-to-br from-green-50 to-emerald-50">
                  <label className="flex items-center block gap-2 mb-3 text-sm font-medium text-gray-800">
                    <DollarSign className="w-5 h-5 text-green-600" />
                    Monto a Pagar (CLP) *
                  </label>

                  <div className="relative">
                    <span className="absolute text-2xl font-bold text-gray-500 -translate-y-1/2 left-4 top-1/2">
                      $
                    </span>
                    <input
                      type="number"
                      value={data.amount_clp}
                      onChange={(e) => setData("amount_clp", e.target.value)}
                      placeholder="0"
                      min="50"
                      step="1"
                      disabled={
                        (paymentType === "multiple" &&
                          selectedSessions.length > 0) ||
                        (paymentType === "debts" && selectedDebts.length > 0)
                      }
                      className={`w-full pl-10 pr-4 py-4 border-2 rounded-lg text-2xl font-bold text-center transition-all ${
                        data.amount_clp
                          ? "border-green-400 bg-white text-green-700 focus:ring-4 focus:ring-green-200"
                          : "border-gray-300 bg-white focus:border-green-400 focus:ring-2 focus:ring-green-200"
                      } disabled:bg-gray-100 disabled:cursor-not-allowed`}
                    />
                  </div>

                  {data.amount_clp && (
                    <div className="mt-3 text-center">
                      <p className="text-sm text-gray-600">Equivalente a:</p>
                      <p className="text-lg font-bold text-green-700">
                        {formatCLP(data.amount_clp)}
                      </p>
                    </div>
                  )}

                  {errors.amount_clp && (
                    <p className="flex items-center gap-1 mt-2 text-sm text-red-600">
                      <XCircle className="w-4 h-4" />
                      {errors.amount_clp}
                    </p>
                  )}

                  {/* Montos rápidos */}
                  <div className="mt-4">
                    <p className="mb-2 text-xs font-medium text-gray-600">
                      ⚡ Montos rápidos:
                    </p>
                    <div className="grid grid-cols-3 gap-2 md:grid-cols-6">
                      {quickAmounts.map((quick) => (
                        <button
                          key={quick.value}
                          type="button"
                          onClick={() => setData("amount_clp", quick.value)}
                          disabled={
                            (paymentType === "multiple" &&
                              selectedSessions.length > 0) ||
                            (paymentType === "debts" &&
                              selectedDebts.length > 0)
                          }
                          className="px-3 py-2 text-sm font-medium text-gray-700 transition-all bg-white border border-gray-300 rounded-lg hover:bg-green-50 hover:text-green-700 hover:border-green-400 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {quick.label}
                        </button>
                      ))}
                    </div>
                    {((paymentType === "multiple" &&
                      selectedSessions.length > 0) ||
                      (paymentType === "debts" &&
                        selectedDebts.length > 0)) && (
                      <p className="mt-2 text-xs italic text-gray-500">
                        El monto se calcula automáticamente según tu selección
                      </p>
                    )}
                  </div>
                </div>

                {/* Notas */}
                <div className="p-4 bg-white border border-gray-200 rounded-lg">
                  <label className="block mb-2 text-sm font-medium text-gray-700">
                    Notas Adicionales
                  </label>
                  <textarea
                    value={data.notes}
                    onChange={(e) => setData("notes", e.target.value)}
                    rows={3}
                    placeholder="Agrega cualquier observación sobre este pago..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {shouldShowSummary && (
              <div className="p-6 rounded-lg shadow-lg bg-gradient-to-r from-blue-50 to-indigo-50">
                <h3 className="mb-4 text-lg font-semibold text-gray-900">
                  Resumen del Pago
                </h3>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700">Paciente:</span>
                    <span className="font-semibold text-gray-900">
                      {selectedPatient?.name} {selectedPatient?.last_name}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-gray-700">Tipo de pago:</span>
                    <span className="font-semibold text-gray-900">
                      {data.payment_type === "session" &&
                        `${selectedSessions.length} sesión(es)`}
                      {data.payment_type === "payment_plan" && "Plan de Pago"}
                      {data.payment_type === "debt" &&
                        `${selectedDebts.length} deuda(s)`}
                      {data.payment_type === "plan" &&
                        `${selectedPlans.length} plan(es)`}{" "}
                      {/* ⭐ NUEVO */}
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-blue-200">
                    <span className="text-gray-700">Monto Total:</span>
                    <span className="text-2xl font-bold text-blue-600">
                      {formatCLP(data.amount_clp)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-gray-700">Método de pago:</span>
                    <span className="font-medium text-gray-900">
                      Webpay Plus
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Botón de envío */}
            <button
              type="submit"
              disabled={processing || !data.patient_id || !data.amount_clp}
              className={`w-full py-5 px-6 rounded-xl font-bold text-lg text-white transition-all flex items-center justify-center gap-3 shadow-xl ${
                processing || !data.patient_id || !data.amount_clp
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 transform hover:scale-[1.02] active:scale-[0.98]"
              }`}
            >
              {processing ? (
                <>
                  <Loader2 className="w-6 h-6 animate-spin" />
                  Redirigiendo a Webpay...
                </>
              ) : (
                <>
                  <CreditCard className="w-6 h-6" />
                  Pagar {data.amount_clp ? formatCLP(data.amount_clp) : ""} con
                  Webpay
                </>
              )}
            </button>

            {(!data.patient_id || !data.amount_clp) && (
              <p className="-mt-2 text-sm text-center text-gray-500">
                {!data.patient_id && "Selecciona un paciente para continuar"}
                {data.patient_id &&
                  !data.amount_clp &&
                  "Ingresa un monto para continuar"}
              </p>
            )}

            {/* Información de prueba */}
            <div className="p-4 border border-blue-200 rounded-lg bg-blue-50">
              <h3 className="mb-2 font-semibold text-blue-900">
                🧪 Tarjetas de Prueba (Ambiente Integration)
              </h3>
              <div className="space-y-2 text-sm text-blue-800">
                <div>
                  <span className="font-semibold">Visa Exitosa:</span>
                  <code className="px-2 py-1 ml-2 bg-white rounded">
                    4051885600446623
                  </code>
                  <span className="ml-2">CVV: 123</span>
                </div>
                <div>
                  <span className="font-semibold">Mastercard Exitosa:</span>
                  <code className="px-2 py-1 ml-2 bg-white rounded">
                    5186059559590568
                  </code>
                  <span className="ml-2">CVV: 123</span>
                </div>
                <div>
                  <span className="font-semibold">Rechazo por Saldo:</span>
                  <code className="px-2 py-1 ml-2 bg-white rounded">
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

          {/* Panel de Debug */}
          {import.meta.env.DEV && (
            <div className="p-6 font-mono text-sm text-gray-100 bg-gray-900 rounded-lg">
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
                  <pre className="mt-1 overflow-x-auto text-xs">
                    {JSON.stringify(data, null, 2)}
                  </pre>
                </div>

                <div>
                  <span className="text-blue-400">
                    Sesiones del paciente disponibles:
                  </span>
                  <span className="ml-2 text-white">
                    {patientSessions.length}
                  </span>
                </div>

                <div>
                  <span className="text-red-400">
                    Deudas del paciente disponibles:
                  </span>
                  <span className="ml-2 text-white">{patientDebts.length}</span>
                </div>

                {/* ⭐ NUEVO */}
                <div>
                  <span className="text-purple-400">
                    Planes del paciente disponibles:
                  </span>
                  <span className="ml-2 text-white">{patientPlans.length}</span>
                </div>

                <div>
                  <span className="text-yellow-400">
                    Sesiones seleccionadas:
                  </span>
                  <pre className="mt-1 overflow-x-auto text-xs">
                    {JSON.stringify(
                      selectedSessions.map((s) => s.id),
                      null,
                      2
                    )}
                  </pre>
                </div>

                <div>
                  <span className="text-red-400">Deudas seleccionadas:</span>
                  <pre className="mt-1 overflow-x-auto text-xs">
                    {JSON.stringify(
                      selectedDebts.map((d) => d.id),
                      null,
                      2
                    )}
                  </pre>
                </div>

                {/* ⭐ NUEVO */}
                <div>
                  <span className="text-purple-400">Planes seleccionados:</span>
                  <pre className="mt-1 overflow-x-auto text-xs">
                    {JSON.stringify(
                      selectedPlans.map((p) => p.id),
                      null,
                      2
                    )}
                  </pre>
                </div>

                {errors && Object.keys(errors).length > 0 && (
                  <div>
                    <span className="text-red-400">Errores de validación:</span>
                    <pre className="mt-1 overflow-x-auto text-xs text-red-300">
                      {JSON.stringify(errors, null, 2)}
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
