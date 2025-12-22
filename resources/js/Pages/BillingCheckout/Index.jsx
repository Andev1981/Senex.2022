import React, { useState, useEffect } from "react";
import { Head, useForm } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import SearchSelect from "@/Components/SearchSelect";
import { CheckCircle2, Plus, Trash2, UserPlus } from "lucide-react";
import axios from "axios";
import PaymentBlockingModal from "./PaymentBlockingModal";
import Swal from "sweetalert2";

const Index = ({
  patients,
  sessionTypes,
  insurances,
  plans,
  paymentMethods,
  agreements,
  doctors,
}) => {
  const [modalState, setModalState] = useState({
    isOpen: false,
    message: "",
    isAbortable: true,
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [localPatients, setLocalPatients] = useState(patients);
  const [isPatientModalOpen, setIsPatientModalOpen] = useState(false);
  const [quickPatient, setQuickPatient] = useState({
    rut: "",
    name: "",
    last_name: "",
    email: "",
    phone: "",
  });
  const [isImedMode, setIsImedMode] = useState(false);
  const [isManualAdjustmentMode, setIsManualAdjustmentMode] = useState(false);
  const [hasSecondaryInsurance, setHasSecondaryInsurance] = useState(false);
  const [patientExtras, setPatientExtras] = useState({
    debts: [],
    active_plans: [],
  });

  const { data, setData, post, processing, errors } = useForm({
    patient_id: "",
    user_id: null,
    company_id: null,
    branch_id: null,
    coverage_details: {
      insurance_id: "",
      plan_id: "",
      secondary_insurance_id: "",
      secondary_plan_id: "",
      external_transaction_code: "",
      affiliate_rut: "",
    },
    services_to_bill: [],
    payment_details: {
      payment_method: "cash",
      amount_paid: 0,
      payment_date: new Date().toISOString().split("T")[0],
    },
    final_shares: {
      amount_gross: 0,
      amount_insurance_primary: 0,
      amount_insurance_secondary: 0,
      amount_patient: 0,
      amount_neto: 0,
      amount_iva: 0,
      discount: 0,
    },
  });

  // 1. Cargar extras del paciente
  useEffect(() => {
    if (data.patient_id) {
      axios
        .get(route("patients.status", data.patient_id))
        .then((res) => setPatientExtras(res.data));
    }
  }, [data.patient_id]);

  // 2. Función para añadir deudas
  const addDebtToBill = (debt) => {
    if (data.services_to_bill.some((s) => s.debt_id === debt.id)) return;

    const newItem = {
      session_type_id: debt.treatment_session.session_type_id,
      doctor_id: debt.treatment_session.doctor_id,
      quantity: 1,
      unit_price: debt.original_amount,
      name: debt.treatment_session.session_type.name,
      debt_id: debt.id,
      treatment_id: debt.treatment_id,
      session_id: debt.treatment_session_id,
      is_debt: true,
      date_label: debt.treatment_session.date,
      unit_insurance_primary: 0,
      unit_insurance_secondary: 0,
      unit_patient: debt.original_amount,
    };

    setData("services_to_bill", [...data.services_to_bill, newItem]);
  };

  // 3. MOTOR DE CÁLCULO CORE (Sincronizado y Reactivo)
  useEffect(() => {
    if (isManualAdjustmentMode) return;

    let totalGross = 0;
    let totalPrimary = 0;
    let totalSecondary = 0;

    // Calculamos los totales recorriendo los servicios actuales
    const calculatedServices = data.services_to_bill.map((s) => {
      const service = sessionTypes.find((t) => t.id == s.session_type_id);
      const basePrice = s.unit_price || service?.base_price_clp || 0;
      const subtotal = basePrice * s.quantity;
      totalGross += subtotal;

      let primaryAmount = 0;
      let secondaryAmount = 0;

      // Cálculo Seguro Primario
      if (data.coverage_details.insurance_id && data.coverage_details.plan_id) {
        let primaryRule = null;
        agreements.forEach((ag) => {
          const r = ag.items?.find(
            (i) =>
              i.plan_id == data.coverage_details.plan_id &&
              i.session_type_id == s.session_type_id
          );
          if (r) primaryRule = r;
        });

        if (primaryRule) {
          const primaryPct =
            primaryRule.insurance_percentage ||
            100 - primaryRule.patient_percentage;
          primaryAmount = Math.round(subtotal * (primaryPct / 100));
        }
      }
      totalPrimary += primaryAmount;

      // Cálculo Seguro Complementario
      if (hasSecondaryInsurance && data.coverage_details.secondary_plan_id) {
        let secondaryRule = null;
        const remainingAfterPrimary = subtotal - primaryAmount;

        agreements.forEach((ag) => {
          const r = ag.items?.find(
            (i) =>
              i.plan_id == data.coverage_details.secondary_plan_id &&
              i.session_type_id == s.session_type_id
          );
          if (r) secondaryRule = r;
        });

        if (secondaryRule) {
          const secondaryPct =
            secondaryRule.insurance_percentage ||
            100 - secondaryRule.patient_percentage;
          secondaryAmount = Math.round(
            remainingAfterPrimary * (secondaryPct / 100)
          );
        }
      }
      totalSecondary += secondaryAmount;

      // Retornamos el objeto con sus valores de share calculados para que el Backend los reciba
      return {
        ...s,
        unit_price: basePrice,
        unit_insurance_primary: Math.round(primaryAmount / (s.quantity || 1)),
        unit_insurance_secondary: Math.round(
          secondaryAmount / (s.quantity || 1)
        ),
        unit_patient: Math.round(
          (subtotal - primaryAmount - secondaryAmount) / (s.quantity || 1)
        ),
      };
    });

    const finalPatientShare = Math.max(
      0,
      totalGross - data.final_shares.discount - totalPrimary - totalSecondary
    );

    // Comparamos si el total realmente cambió antes de actualizar para evitar renders innecesarios
    if (
      totalGross !== data.final_shares.amount_gross ||
      totalPrimary !== data.final_shares.amount_insurance_primary ||
      finalPatientShare !== data.final_shares.amount_patient
    ) {
      setData((prev) => ({
        ...prev,
        services_to_bill: calculatedServices,
        final_shares: {
          ...prev.final_shares,
          amount_gross: totalGross,
          amount_insurance_primary: totalPrimary,
          amount_insurance_secondary: totalSecondary,
          amount_patient: finalPatientShare,
          amount_neto: finalPatientShare,
        },
        payment_details: {
          ...prev.payment_details,
          amount_paid: finalPatientShare,
        },
      }));
    }
  }, [
    // 💡 LA CLAVE: JSON.stringify permite detectar cambios DENTRO de los objetos del array
    JSON.stringify(data.services_to_bill),
    data.coverage_details.plan_id,
    data.coverage_details.secondary_plan_id,
    data.final_shares.discount,
    hasSecondaryInsurance,
    isManualAdjustmentMode,
  ]);

  // 4. Limpieza si es Particular
  useEffect(() => {
    if (!data.coverage_details.insurance_id) {
      setData((prev) => ({
        ...prev,
        coverage_details: {
          ...prev.coverage_details,
          plan_id: "",
          secondary_insurance_id: "",
          secondary_plan_id: "",
          external_transaction_code: "",
        },
        final_shares: {
          ...prev.final_shares,
          amount_insurance_primary: 0,
          amount_insurance_secondary: 0,
        },
      }));
      setHasSecondaryInsurance(false);
      setIsImedMode(false);
    }
  }, [data.coverage_details.insurance_id]);

  // 5. Limpieza si cambia el paciente
  useEffect(() => {
    if (!data.patient_id) {
      setData((prev) => ({
        ...prev,
        coverage_details: {
          insurance_id: "",
          plan_id: "",
          secondary_insurance_id: "",
          secondary_plan_id: "",
          external_transaction_code: "",
        },
        services_to_bill: [],
        payment_details: {
          payment_method: "cash",
          amount_paid: 0,
          payment_date: new Date().toISOString().split("T")[0],
        },
        final_shares: {
          amount_gross: 0,
          amount_insurance_primary: 0,
          amount_insurance_secondary: 0,
          amount_patient: 0,
          amount_neto: 0,
          amount_iva: 0,
          discount: 0,
        },
      }));
      setHasSecondaryInsurance(false);
      setIsImedMode(false);
      setIsManualAdjustmentMode(false);
      setPatientExtras({ debts: [], active_plans: [] });
    }
  }, [data.patient_id]);

  // 6. Manejo de ajuste manual
  const handleManualChange = (field, value) => {
    const val = parseInt(value) || 0;
    const current = data.final_shares;
    let newShares = { ...current };

    if (field === "amount_patient") {
      newShares.amount_patient = val;
      newShares.amount_insurance_primary = Math.max(
        0,
        current.amount_gross -
          current.discount -
          val -
          current.amount_insurance_secondary
      );
    } else if (field === "amount_insurance_primary") {
      newShares.amount_insurance_primary = val;
      newShares.amount_patient = Math.max(
        0,
        current.amount_gross -
          current.discount -
          val -
          current.amount_insurance_secondary
      );
    } else if (field === "amount_insurance_secondary") {
      newShares.amount_insurance_secondary = val;
      newShares.amount_patient = Math.max(
        0,
        current.amount_gross -
          current.discount -
          current.amount_insurance_primary -
          val
      );
    }

    setData((prev) => ({
      ...prev,
      final_shares: newShares,
      payment_details: {
        ...prev.payment_details,
        amount_paid: newShares.amount_patient,
      },
    }));
  };

  const updateService = (index, field, value) => {
    const newServices = [...data.services_to_bill];
    if (field === "session_type_id") {
      const service = sessionTypes.find((t) => t.id == value);
      newServices[index].unit_price = service ? service.base_price_clp : 0;
    }
    newServices[index][field] = value;
    setData("services_to_bill", newServices);
  };

  const handleQuickPatientSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        route("patients.quick_store"),
        quickPatient
      );
      setLocalPatients((prev) => [...prev, response.data]);
      setData("patient_id", response.data.id);
      setIsPatientModalOpen(false);
      setQuickPatient({
        rut: "",
        name: "",
        last_name: "",
        email: "",
        phone: "",
      });
    } catch (error) {
      alert("Error al procesar la solicitud.");
    }
  };

  const [currentPaymentUuid, setCurrentPaymentUuid] = useState(null);

  const handleAbortTransaction = async () => {
    // Cerramos el modal inmediatamente para dar feedback visual
    setModalState((prev) => ({ ...prev, isOpen: false }));

    try {
      const response = await axios.post(route("payments.pos.abort"), {
        uuid: currentPaymentUuid,
      });

      if (response.data.status === "success") {
        alert("Cobro cancelado en el terminal.");
      }
      setCurrentPaymentUuid(null);
    } catch (error) {
      alert("Error al abortar:", error);
      alert(
        "El terminal no respondió al aborto. Por favor, cancela manualmente en la máquina."
      );
    }
  };

  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (isProcessing) {
        e.preventDefault();
        e.returnValue = ""; // Esto gatilla el diálogo estándar del navegador
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isProcessing]);

  const submit = async (e) => {
    e.preventDefault();

    const method = data.payment_details.payment_method;

    // 1. Configuración del Modal según el método
    if (method === "pos_integrado") {
      setModalState({
        isOpen: true,
        message: "Esperando confirmación en terminal POS...",
        isAbortable: method === "pos_integrado", // Solo abortable si es el terminal físico
      });
    }

    // 1. Ejecución de la lógica de pago
    try {
      // Para Webpay y POS usamos Axios porque esperamos un JSON de respuesta
      if (method === "pos_integrado") {
        const response = await axios.post(route("payments.store"), data);

        if (response.data.status === "success") {
          // Cerramos el modal de bloqueo para que el usuario pueda corregir
          setModalState({ isOpen: false, message: "", isAbortable: true });
          Swal.fire({
            title: "¡Pago Completado!",
            text: "Redirigiendo al comprobante...",
            icon: "success",
            timer: 1500,
            showConfirmButton: false,
          }).then(() => {
            // Guardamos el UUID que devuelve el controlador
            if (response.data.uuid) {
              setCurrentPaymentUuid(response.data.uuid);
            }

            if (response.data.url) {
              // Redirección externa (Webpay) o interna (Success tras POS)
              window.location.href = response.data.url;
            }
          });
        }
      }
      // Para Cash y Transfer usamos Inertia post (comportamiento estándar de formulario)
      else {
        post(route("payments.store"), {
          onStart: () => {
            // Opcional: un pequeño loading de botón, pero no el modal gigante
          },
          onError: (errors) => {
            // Inertia maneja los errores automáticamente en page.props.errors
            // pero cerramos cualquier estado de carga si existiera
          },
        });
      }
    } catch (error) {
      // 2. Manejo de errores para peticiones Axios
      console.log("Error procesando pago:", error);

      // Cerramos el modal de bloqueo para que el usuario pueda corregir
      setModalState({ isOpen: false, message: "", isAbortable: true });

      Swal.fire({
        title: "Error en la transacción",
        text: error.response?.data?.message || "Ocurrió un error inesperado",
        icon: "error",
        confirmButtonText: "Reintentar",
        confirmButtonColor: "#d33",
      });
    }
  };

  return (
    <AuthenticatedLayout>
      <Head title="Caja - POS" />
      <div className="max-w-full p-4 mx-auto sm:p-6 lg:p-8">
        <form
          onSubmit={submit}
          className="grid grid-cols-1 gap-6 lg:grid-cols-3"
        >
          {/* COLUMNA 1: IDENTIFICACIÓN */}
          <div className="p-6 space-y-4 bg-white border border-gray-100 shadow-sm rounded-xl">
            <h2 className="flex items-center text-xl font-black text-gray-800">
              <span className="flex items-center justify-center w-8 h-8 mr-2 text-sm text-indigo-600 bg-indigo-100 rounded-full">
                1
              </span>
              Identificación
            </h2>
            <div className="flex items-end gap-2">
              <div className="flex-1">
                <label className="block mb-4 text-xs font-black text-gray-500 uppercase">
                  Buscar Paciente
                </label>
                <SearchSelect
                  items={localPatients}
                  value={data.patient_id}
                  onChange={(value) => setData("patient_id", value)}
                  config={{
                    valueKey: "id",
                    displayKey: "full_name",
                    secondaryKeys: ["rut", "email", "phone"],
                    searchKeys: [
                      "name",
                      "last_name",
                      "email",
                      "full_name",
                      "rut",
                    ],
                  }}
                  placeholder="Buscar paciente..."
                  error={errors.patient_id}
                />
              </div>
              <button
                type="button"
                onClick={() => setIsPatientModalOpen(true)}
                className="p-2 text-indigo-600 transition rounded-lg bg-indigo-50 hover:bg-indigo-100"
              >
                <UserPlus className="w-6 h-6" />
              </button>
            </div>

            <div className="pt-4 space-y-4 border-t">
              <label className="block mb-1 text-xs font-black text-gray-500 uppercase">
                Previsión / Seguro
              </label>
              <select
                className="w-full text-sm border-gray-200 rounded-lg"
                value={data.coverage_details.insurance_id}
                onChange={(e) =>
                  setData("coverage_details", {
                    ...data.coverage_details,
                    insurance_id: e.target.value,
                  })
                }
              >
                <option value="">Particular (Sin Seguro)</option>
                {insurances.map((i) => (
                  <option key={i.id} value={i.id}>
                    {i.name}
                  </option>
                ))}
              </select>

              {data.coverage_details.insurance_id && (
                <div className="space-y-4 duration-300 animate-in fade-in">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-gray-700">
                      Plan de Salud
                    </span>
                    <div className="flex items-center px-2 py-1 rounded bg-green-50">
                      <input
                        type="checkbox"
                        id="imed"
                        className="text-green-600 rounded"
                        checked={isImedMode}
                        onChange={() => setIsImedMode(!isImedMode)}
                      />
                      <label
                        htmlFor="imed"
                        className="ml-1 text-[10px] font-black text-green-700 uppercase"
                      >
                        I-Med
                      </label>
                    </div>
                  </div>
                  <select
                    className="w-full text-sm border-gray-200 rounded-lg"
                    value={data.coverage_details.plan_id}
                    onChange={(e) =>
                      setData("coverage_details", {
                        ...data.coverage_details,
                        plan_id: e.target.value,
                      })
                    }
                  >
                    <option value="">Seleccionar Plan...</option>
                    {plans
                      .filter(
                        (p) =>
                          p.insurance_id == data.coverage_details.insurance_id
                      )
                      .map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name}
                        </option>
                      ))}
                  </select>

                  {isImedMode && (
                    <input
                      type="text"
                      className="w-full text-sm border-green-200 rounded-lg bg-green-50"
                      placeholder="Código de Transacción I-Med"
                      value={data.coverage_details.external_transaction_code}
                      onChange={(e) =>
                        setData("coverage_details", {
                          ...data.coverage_details,
                          external_transaction_code: e.target.value,
                        })
                      }
                      required={isImedMode}
                    />
                  )}

                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() =>
                        setHasSecondaryInsurance(!hasSecondaryInsurance)
                      }
                      className="text-xs font-bold text-indigo-600 hover:underline"
                    >
                      {hasSecondaryInsurance
                        ? "- Quitar Complementario"
                        : "+ Añadir Seguro Complementario"}
                    </button>
                    {hasSecondaryInsurance && (
                      <div className="p-3 mt-3 space-y-2 border border-indigo-100 rounded-lg bg-indigo-50">
                        <select
                          className="w-full text-xs border-indigo-200 rounded"
                          value={data.coverage_details.secondary_insurance_id}
                          onChange={(e) =>
                            setData("coverage_details", {
                              ...data.coverage_details,
                              secondary_insurance_id: e.target.value,
                            })
                          }
                        >
                          <option value="">Compañía Complementaria...</option>
                          {insurances.map((i) => (
                            <option key={i.id} value={i.id}>
                              {i.name}
                            </option>
                          ))}
                        </select>
                        <select
                          className="w-full text-xs border-indigo-200 rounded"
                          value={data.coverage_details.secondary_plan_id}
                          onChange={(e) =>
                            setData("coverage_details", {
                              ...data.coverage_details,
                              secondary_plan_id: e.target.value,
                            })
                          }
                        >
                          <option value="">Seleccionar Plan...</option>
                          {plans
                            .filter(
                              (p) =>
                                p.insurance_id ==
                                data.coverage_details.secondary_insurance_id
                            )
                            .map((p) => (
                              <option key={p.id} value={p.id}>
                                {p.name}
                              </option>
                            ))}
                        </select>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* COLUMNA 2: SERVICIOS */}
          <div className="p-6 bg-white border border-gray-100 shadow-sm rounded-xl">
            <h2 className="flex items-center mb-6 text-xl font-black text-gray-800">
              <span className="flex items-center justify-center w-8 h-8 mr-2 text-sm text-indigo-600 bg-indigo-100 rounded-full">
                2
              </span>
              Servicios
            </h2>
            {patientExtras.debts.length > 0 && (
              <div className="p-4 mb-6 border-l-4 border-orange-500 rounded-r-lg shadow-sm bg-orange-50">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-orange-800">
                      Deudas Pendientes
                    </h3>
                    <p className="text-xs text-orange-700">
                      Sesiones realizadas sin pagar.
                    </p>
                  </div>
                  <span className="font-black text-orange-600">
                    {patientExtras.debts.length}
                  </span>
                </div>
                <div className="mt-3 space-y-2">
                  {patientExtras.debts.map((debt) => {
                    const isAdded = data.services_to_bill.some(
                      (s) => s.debt_id === debt.id
                    );
                    return (
                      <button
                        key={debt.id}
                        type="button"
                        disabled={isAdded}
                        onClick={() => addDebtToBill(debt)}
                        className={`w-full flex justify-between items-center p-2 border rounded text-xs transition ${
                          isAdded
                            ? "bg-green-100 border-green-200 text-green-700"
                            : "bg-white border-orange-200 hover:bg-orange-100 text-orange-800"
                        }`}
                      >
                        <div className="flex items-center">
                          {isAdded ? (
                            <CheckCircle2 className="w-3 h-3 mr-2" />
                          ) : (
                            <Plus className="w-3 h-3 mr-2" />
                          )}
                          <span>
                            {debt.treatment_session.session_type.name} (
                            {debt.treatment_session.date})
                          </span>
                        </div>
                        <span className="font-bold">
                          {isAdded
                            ? "AGREGADO"
                            : `+ $${debt.original_amount.toLocaleString()}`}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
            <div className="space-y-3">
              {data.services_to_bill.map((s, index) => (
                <div
                  key={index}
                  className={`p-3 rounded-lg border ${
                    s.is_debt
                      ? "bg-orange-50 border-orange-200"
                      : "bg-gray-50 border-gray-200"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <div className="flex-1">
                      {s.is_debt ? (
                        <div className="flex flex-col">
                          <span className="text-[10px] font-black text-orange-600 uppercase">
                            Deuda ({s.date_label})
                          </span>
                          <span className="text-sm font-bold text-gray-700">
                            {s.name}
                          </span>
                        </div>
                      ) : (
                        <select
                          className="w-full text-sm border-gray-200 rounded"
                          value={s.session_type_id}
                          onChange={(e) =>
                            updateService(
                              index,
                              "session_type_id",
                              e.target.value
                            )
                          }
                        >
                          <option value="">Seleccionar prestación...</option>
                          {sessionTypes.map((st) => (
                            <option key={st.id} value={st.id}>
                              {st.name}
                            </option>
                          ))}
                        </select>
                      )}
                    </div>
                    <input
                      type="number"
                      disabled
                      className={`w-16 text-sm text-center rounded border-gray-200 ${
                        s.is_debt ? "bg-orange-100 font-bold" : ""
                      }`}
                      value={s.quantity}
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setData(
                          "services_to_bill",
                          data.services_to_bill.filter((_, i) => i !== index)
                        )
                      }
                      className="text-red-400 hover:text-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <select
                    disabled={s.is_debt}
                    className="w-full mt-2 text-xs border-gray-200 rounded"
                    value={s.doctor_id}
                    onChange={(e) =>
                      updateService(index, "doctor_id", e.target.value)
                    }
                  >
                    <option value="">Asignar Profesional...</option>
                    {doctors.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
              <button
                type="button"
                className="w-full py-2 text-xs font-bold text-gray-400 transition border-2 border-gray-200 border-dashed rounded-lg hover:bg-gray-50"
                onClick={() =>
                  setData("services_to_bill", [
                    ...data.services_to_bill,
                    {
                      session_type_id: "",
                      doctor_id: "",
                      quantity: 1,
                      unit_price: 0,
                    },
                  ])
                }
              >
                + Añadir Prestación
              </button>
            </div>
          </div>

          {/* COLUMNA 3: TOTALES */}
          <div className="p-6 space-y-6 bg-white border border-gray-100 shadow-sm rounded-xl">
            <div className="flex items-center justify-between pb-4 border-b">
              <h2 className="text-xl font-black text-gray-800">Caja</h2>
              <button
                type="button"
                onClick={() =>
                  setIsManualAdjustmentMode(!isManualAdjustmentMode)
                }
                className={`text-[10px] px-2 py-1 rounded font-bold uppercase ${
                  isManualAdjustmentMode
                    ? "bg-red-600 text-white"
                    : "bg-gray-100 text-gray-500"
                }`}
              >
                {isManualAdjustmentMode
                  ? "Ajuste Manual Activo"
                  : "Activar Ajuste"}
              </button>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Total Bruto:</span>
                <span className="font-bold">
                  ${data.final_shares.amount_gross.toLocaleString("es-CL")}
                </span>
              </div>

              {(!data.coverage_details.insurance_id ||
                isManualAdjustmentMode) && (
                <div className="flex items-center justify-between text-sm font-bold text-orange-600">
                  <span>Descuento Particular:</span>
                  <div className="flex items-center">
                    <span className="mr-1">-$</span>
                    <input
                      type="number"
                      className="w-24 h-8 p-1 text-sm text-right border-orange-200 rounded bg-orange-50"
                      value={data.final_shares.discount}
                      onChange={(e) =>
                        setData("final_shares", {
                          ...data.final_shares,
                          discount: parseInt(e.target.value) || 0,
                        })
                      }
                    />
                  </div>
                </div>
              )}

              {data.coverage_details.insurance_id && (
                <>
                  <div className="flex items-center justify-between text-sm font-bold text-green-600">
                    <span>Aporte Isapre/Fonasa:</span>
                    {isManualAdjustmentMode ? (
                      <input
                        type="number"
                        className="w-24 h-8 p-1 text-sm text-right border-green-200 rounded"
                        value={data.final_shares.amount_insurance_primary}
                        onChange={(e) =>
                          handleManualChange(
                            "amount_insurance_primary",
                            e.target.value
                          )
                        }
                      />
                    ) : (
                      <span>
                        -$
                        {data.final_shares.amount_insurance_primary.toLocaleString(
                          "es-CL"
                        )}
                      </span>
                    )}
                  </div>
                  {hasSecondaryInsurance && (
                    <div className="flex items-center justify-between text-sm italic font-bold text-indigo-600">
                      <span>Seguro Complementario:</span>
                      {isManualAdjustmentMode ? (
                        <input
                          type="number"
                          className="w-24 h-8 p-1 text-sm text-right border-indigo-200 rounded"
                          value={data.final_shares.amount_insurance_secondary}
                          onChange={(e) =>
                            handleManualChange(
                              "amount_insurance_secondary",
                              e.target.value
                            )
                          }
                        />
                      ) : (
                        <span>
                          -$
                          {data.final_shares.amount_insurance_secondary.toLocaleString(
                            "es-CL"
                          )}
                        </span>
                      )}
                    </div>
                  )}
                </>
              )}

              <div className="pt-4 border-t border-gray-200 border-double">
                <div className="flex items-center justify-between text-2xl font-black text-red-600">
                  <span>COPAGO</span>
                  {isManualAdjustmentMode ? (
                    <input
                      type="number"
                      className="w-32 p-1 text-xl text-right border-red-300 rounded-lg"
                      value={data.final_shares.amount_patient}
                      onChange={(e) =>
                        handleManualChange("amount_patient", e.target.value)
                      }
                    />
                  ) : (
                    <span>
                      $
                      {data.final_shares.amount_patient.toLocaleString("es-CL")}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="pt-4 space-y-4 border-t">
              <label className="text-xs font-bold text-gray-500 uppercase">
                Forma de Pago
              </label>
              <select
                className="w-full mt-1 border-gray-200 rounded-lg"
                value={data.payment_details.payment_method}
                onChange={(e) =>
                  setData("payment_details", {
                    ...data.payment_details,
                    payment_method: e.target.value,
                  })
                }
              >
                {paymentMethods.map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.label}
                  </option>
                ))}
              </select>
              <button
                type="submit"
                disabled={processing || data.services_to_bill.length === 0}
                className="w-full py-4 text-lg font-black text-white bg-indigo-600 rounded-xl disabled:bg-gray-200"
              >
                {processing ? "Procesando..." : "Finalizar Venta"}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Modal de Registro Rápido */}
      {isPatientModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-md overflow-hidden bg-white shadow-2xl rounded-xl">
            <div className="flex items-center justify-between p-4 text-white bg-indigo-600">
              <h3 className="font-bold">Registro Rápido de Paciente</h3>
              <button onClick={() => setIsPatientModalOpen(false)}>✕</button>
            </div>
            <form onSubmit={handleQuickPatientSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase">
                  RUT / DNI
                </label>
                <input
                  type="text"
                  required
                  className="w-full mt-1 border-gray-200 rounded-lg"
                  value={quickPatient.rut}
                  onChange={(e) =>
                    setQuickPatient({ ...quickPatient, rut: e.target.value })
                  }
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase">
                    Nombre
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full mt-1 border-gray-200 rounded-lg"
                    value={quickPatient.name}
                    onChange={(e) =>
                      setQuickPatient({ ...quickPatient, name: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase">
                    Apellido
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full mt-1 border-gray-200 rounded-lg"
                    value={quickPatient.last_name}
                    onChange={(e) =>
                      setQuickPatient({
                        ...quickPatient,
                        last_name: e.target.value,
                      })
                    }
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase">
                  Email
                </label>
                <input
                  type="email"
                  required
                  className="w-full mt-1 border-gray-200 rounded-lg"
                  value={quickPatient.email}
                  onChange={(e) =>
                    setQuickPatient({ ...quickPatient, email: e.target.value })
                  }
                />
              </div>
              <div className="flex gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setIsPatientModalOpen(false)}
                  className="flex-1 py-2 font-bold text-gray-500"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 font-bold text-white bg-indigo-600 rounded-lg shadow-lg"
                >
                  Guardar y Cobrar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      <PaymentBlockingModal
        isOpen={modalState.isOpen}
        message={modalState.message}
        isAbortable={modalState.isAbortable}
        onAbort={handleAbortTransaction}
      />
    </AuthenticatedLayout>
  );
};

export default Index;
