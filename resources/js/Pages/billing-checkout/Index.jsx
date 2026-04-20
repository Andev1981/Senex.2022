import React, { useState, useEffect } from "react";
import { Head, useForm } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import axios from "axios";
import Swal from "sweetalert2";

// --- IMPORTACIÓN DE COMPONENTES LOCALES ---
import PatientCard from "./components/PatientCard"; // <--- NUEVO
import PaymentSummary from "./components/PaymentSummary";
import ServiceItem from "./components/ServiceItem";
import ServicesCard from "./components/ServicesCard";
import PaymentBlockingModal from "./PaymentBlockingModal";
import PlansCard from "./components/PlansCard"; // <-- 1. Importar PlansCard

export default function PosIndex({
  patients = [],
  sessionTypes = [],
  products = [],
  insurances = [],
  plans = [],
  paymentMethods = [],
  agreements = [],
  doctors = [],
  business_type = "clinical"
}) {
  const isClinical = business_type === "clinical";
  const entityLabel = isClinical ? "Paciente" : "Cliente";

  // ... (TUS ESTADOS MANTIENEN IGUAL) ...
  const [modalState, setModalState] = useState({
    isOpen: false,
    message: "",
    isAbortable: true,
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [localPatients, setLocalPatients] = useState(patients);
  const [isPatientModalOpen, setIsPatientModalOpen] = useState(false);

  const [isImedMode, setIsImedMode] = useState(false);
  const [isManualAdjustmentMode, setIsManualAdjustmentMode] = useState(false);
  const [hasSecondaryInsurance, setHasSecondaryInsurance] = useState(false);
  const [currentPaymentUuid, setCurrentPaymentUuid] = useState(null);
  const [patientExtras, setPatientExtras] = useState({
    debts: [],
    active_plans: [],
  });

  const [quickPatient, setQuickPatient] = useState({
    rut: "",
    name: "",
    last_name: "",
    email: "",
    phone: "",
  });

  const { data, setData, errors } = useForm({
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
      payment_method: "pos_integrado",
      amount_paid: 0,
      payment_date: new Date().toISOString().split("T")[0],
    },
    final_shares: {
      amount_gross_clp: 0,
      amount_insurance_primary_clp: 0,
      amount_insurance_secondary_clp: 0,
      amount_patient_clp: 0,
      amount_neto_clp: 0,
      amount_iva_clp: 0,
      discount_clp: 0,
    },
  });

  // 1. Cargar extras del paciente al seleccionarlo
  useEffect(() => {
    if (data.patient_id) {
      axios
        .get(route("patients.status", data.patient_id))
        .then((res) => {
          setPatientExtras(res.data);
          
          // Si el paciente tiene seguro activo, lo inyectamos automáticamente (SOLO CLÍNICO)
          if (isClinical && res.data.insurance) {
            setData((prev) => ({
              ...prev,
              coverage_details: {
                ...prev.coverage_details,
                insurance_id: res.data.insurance.id,
                plan_id: res.data.insurance.plan_id,
              }
            }));
          }
        })
        .catch((err) => console.error("Error cargando paciente:", err));
    }
  }, [data.patient_id, isClinical]);

  // 2. Función para añadir deudas (CORREGIDA PARA _clp)
  const addDebtToBill = (debt) => {
    if (data.services_to_bill.some((s) => s.debt_id === debt.id)) return;

    // Usar el monto que efectivamente debe pagar el paciente
    const debtAmount = debt.amount_patient_clp || debt.total_amount_clp || 0;

    const newItem = {
      session_type_id: debt.treatment_session?.session_type_id,
      doctor_id: debt.treatment_session?.doctor_id,
      quantity: 1,
      unit_price_clp: debtAmount, // Precio fijo histórico
      name:
        debt.treatment_session?.session_type?.name || "Cargo Histórico",
      debt_id: debt.id,
      treatment_id: debt.treatment_session?.treatment_id,
      treatment_session_id: debt.treatment_session_id,
      is_debt: true,
      date_label: debt.treatment_session?.date || "S/F",
      // Las deudas históricas suelen ser montos fijos ya calculados para el paciente
      unit_insurance_primary_clp: 0,
      unit_insurance_secondary_clp: 0,
      unit_patient_clp: debtAmount,
    };

    setData("services_to_bill", [...data.services_to_bill, newItem]);
  };

  // 3. 🧠 MOTOR DE CÁLCULO CORE (Refactorizado para Planes)
  useEffect(() => {
    if (isManualAdjustmentMode) return;

    let totalGross = 0;
    let totalPrimary = 0;
    let totalSecondary = 0;

    const planItems = data.services_to_bill.filter(s => s.is_plan);
    const serviceItems = data.services_to_bill.filter(s => !s.is_plan);

    // A. Calcular el total de los planes (precio final)
    const totalFromPlans = planItems.reduce((acc, plan) => acc + (plan.unit_price_clp || 0), 0);
    totalGross += totalFromPlans;

    // B. Calcular el total y cobertura de las sesiones
    const calculatedServices = serviceItems.map((s) => {
      const service = sessionTypes.find((t) => t.id == s.session_type_id);
      
      let basePrice = s.is_debt ? s.unit_price_clp : (service?.price || service?.base_price_clp || 0);
      const subtotal_clp = Math.round(basePrice * (s.quantity || 1));
      totalGross += subtotal_clp;

      let primaryAmount = 0;
      let secondaryAmount = 0;

      // SOLO CLÍNICO APLICA COBERTURAS
      if (isClinical && !s.is_debt && !s.use_plan_id) {
        if (data.coverage_details.insurance_id && data.coverage_details.plan_id) {
          let primaryRule = null;
          if (Array.isArray(agreements)) {
            agreements.forEach((ag) => {
              const rulesList = ag.agreement_rules || ag.rules || ag.items || [];
              if (Array.isArray(rulesList)) {
                const r = rulesList.find((i) => i.plan_id == data.coverage_details.plan_id && i.session_type_id == s.session_type_id);
                if (r) primaryRule = r;
              }
            });
          }
          if (primaryRule) {
            primaryAmount = (primaryRule.insurance_share_clp > 0)
              ? primaryRule.insurance_share_clp * (s.quantity || 1)
              : Math.round(subtotal_clp * ((100 - primaryRule.patient_percentage) / 100));
          }
        }
      }

      totalPrimary += primaryAmount;
      totalSecondary += secondaryAmount;

      const unitPatientClp = s.use_plan_id ? 0 : Math.round((subtotal_clp - primaryAmount - secondaryAmount) / (s.quantity || 1));
      
      return { ...s, unit_price_clp: basePrice, unit_insurance_primary_clp: Math.round(primaryAmount / (s.quantity || 1)), unit_insurance_secondary_clp: Math.round(secondaryAmount / (s.quantity || 1)), unit_patient_clp: unitPatientClp };
    });

    const finalPatientShare = Math.max(0, totalGross - (data.final_shares.discount_clp || 0) - totalPrimary - totalSecondary);

    if (
      totalGross !== data.final_shares.amount_gross_clp ||
      totalPrimary !== data.final_shares.amount_insurance_primary_clp ||
      finalPatientShare !== data.final_shares.amount_patient_clp
    ) {
      setData((prev) => ({
        ...prev,
        services_to_bill: [...planItems, ...calculatedServices], // Re-unir los ítems
        final_shares: {
          ...prev.final_shares,
          amount_gross_clp: totalGross,
          amount_insurance_primary_clp: totalPrimary,
          amount_insurance_secondary_clp: totalSecondary,
          amount_patient_clp: finalPatientShare,
          amount_neto_clp: finalPatientShare,
          amount_iva_clp: 0,
        },
        payment_details: {
          ...prev.payment_details,
          amount_paid: finalPatientShare,
        },
      }));
    }
  }, [
    JSON.stringify(data.services_to_bill.map((s) => ({ id: s.session_type_id || s.plan_id, q: s.quantity }))),
    data.coverage_details.plan_id,
    data.coverage_details.secondary_plan_id,
    data.final_shares.discount_clp,
    hasSecondaryInsurance,
    isManualAdjustmentMode,
    JSON.stringify(agreements),
    isClinical
  ]);

  // 4. Limpieza si se selecciona "Particular"
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
          amount_insurance_primary_clp: 0,
          amount_insurance_secondary_clp: 0,
        },
      }));
      setHasSecondaryInsurance(false);
      setIsImedMode(false);
    }
  }, [data.coverage_details.insurance_id]);

  // 5. Gestión del Paciente (Selección y Reset)
  useEffect(() => {
    if (!data.patient_id) {
      // RESET COMPLETO (Tu código original)
      setData((prev) => ({
        ...prev,
        coverage_details: {
          insurance_id: "",
          plan_id: "",
          secondary_insurance_id: "",
          secondary_plan_id: "",
          external_transaction_code: "",
          affiliate_rut: "", // Aseguramos resetear esto también
        },
        services_to_bill: [],
        payment_details: {
          payment_method: "pos_integrado",
          amount_paid: 0,
          payment_date: new Date().toISOString().split("T")[0],
        },
        final_shares: {
          amount_gross_clp: 0,
          amount_insurance_primary_clp: 0,
          amount_insurance_secondary_clp: 0,
          amount_patient_clp: 0,
          amount_neto_clp: 0,
          amount_iva_clp: 0,
          discount_clp: 0,
        },
      }));
      setHasSecondaryInsurance(false);
      setIsImedMode(false);
      setIsManualAdjustmentMode(false);
      setPatientExtras({ debts: [], active_plans: [] });
    } else {
      // ✨ NUEVO: Si hay paciente, inyectamos su RUT automáticamente como Afiliado
      const selectedPatient = localPatients.find(
        (p) => p.id === data.patient_id
      );
      if (selectedPatient) {
        setData((prev) => ({
          ...prev,
          coverage_details: {
            ...prev.coverage_details,
            affiliate_rut: selectedPatient.rut,
          },
        }));
      }
    }
  }, [data.patient_id]); // Dependencia

  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (isProcessing) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isProcessing]);

  // 6. Manejador de Ajuste Manual
  const handleManualChange = (field, value) => {
    const val = parseInt(value) || 0;
    const current = data.final_shares;
    let newShares = { ...current };

    const calcPatientShare = (gross, discount, primary, secondary) =>
      Math.max(0, gross - discount - primary - secondary);

    if (field === "discount_clp") {
        newShares.discount_clp = val;
        newShares.amount_patient_clp = calcPatientShare(
            current.amount_gross_clp,
            val,
            current.amount_insurance_primary_clp,
            current.amount_insurance_secondary_clp
        );
    } else if (field === "amount_patient_clp") {
      newShares.amount_patient_clp = val;
      newShares.amount_insurance_primary_clp = Math.max(
        0,
        current.amount_gross_clp -
          current.discount_clp -
          val -
          current.amount_insurance_secondary_clp
      );
    } else if (field === "amount_insurance_primary_clp") {
      newShares.amount_insurance_primary_clp = val;
      newShares.amount_patient_clp = calcPatientShare(
        current.amount_gross_clp,
        current.discount_clp,
        val,
        current.amount_insurance_secondary_clp
      );
    } else if (field === "amount_insurance_secondary_clp") {
      newShares.amount_insurance_secondary_clp = val;
      newShares.amount_patient_clp = calcPatientShare(
        current.amount_gross_clp,
        current.discount_clp,
        current.amount_insurance_primary_clp,
        val
      );
    }

    newShares.amount_neto_clp = newShares.amount_patient_clp;

    setData((prev) => ({
      ...prev,
      final_shares: newShares,
      payment_details: {
        ...prev.payment_details,
        amount_paid: newShares.amount_patient_clp,
      },
    }));
  };

  // --- HANDLER: AGREGAR NUEVA PRESTACIÓN VACÍA ---
  const handleAddService = () => {
    setData("services_to_bill", [
      ...data.services_to_bill, // Mantenemos los que ya están
      {
        session_type_id: "", // Vacío para que el select muestre "Seleccionar..."
        treatment_id: null,
        treatment_session_id: null,
        doctor_id: isClinical ? "" : 1, // Si no es clínico, asignamos un ID genérico o nulificamos
        quantity: 1, // Cantidad inicial 1
        unit_price_clp: 0, // Precio 0 hasta que elija el tipo
        name: "", // Nombre vacío
        is_debt: false, // Importante: Marcamos que NO es deuda histórica

        // Inicializamos los montos de copago en 0
        unit_insurance_primary_clp: 0,
        unit_insurance_secondary_clp: 0,
        unit_patient_clp: 0,
      },
    ]);
  };

    // <-- 2. Añadir función para agregar el plan al carrito -->
    const handleAddPlan = (plan) => {
        if (data.services_to_bill.some((s) => s.plan_id === plan.id)) return;
        setData("services_to_bill", [...data.services_to_bill, plan]);
    };

  // --- HANDLER: ACTUALIZAR UNA FILA DE PRESTACIÓN ---
  const handleUpdateService = (index, field, value) => {
    // 1. Creamos una copia del array actual
    const newServices = [...data.services_to_bill];

    // 2. Lógica especial si cambiamos el tipo de sesión (actualizar metadatos)
    if (field === "session_type_id") {
      const service = sessionTypes.find((t) => t.id == value);

      newServices[index].unit_price_clp = service ? (service.price || service.base_price_clp || 0) : 0;
      newServices[index].name = service ? service.name : "";
      newServices[index].sellable_type = service ? (service.sellable_type || 'Product') : 'Product';
      newServices[index].is_exempt = service ? (!!service.is_exempt) : true;
    }

    // 3. Actualizamos el campo específico
    newServices[index][field] = value;

    // 4. Guardamos en el estado
    setData("services_to_bill", newServices);
  };

  // --- HANDLER: QUITAR UNA PRESTACIÓN ---
  const handleRemoveService = (index) => {
    // Filtramos el array dejando fuera el elemento que coincide con el índice
    const newServices = data.services_to_bill.filter((_, i) => i !== index);

    setData("services_to_bill", newServices);
  };

  // --- LOGICA PACIENTE RÁPIDO ---
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
      Swal.fire({
        icon: "success",
        title: `${entityLabel} creado`,
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: `No se pudo crear el ${entityLabel.toLowerCase()}.`,
      });
    }
  };

  // --- LOGICA POS / PAGO ---
  const handleAbortTransaction = async () => {
    setModalState((prev) => ({ ...prev, isOpen: false }));
    try {
      const response = await axios.post(route("payments.pos.abort"), {
        uuid: currentPaymentUuid,
      });
      if (response.data.status === "success") {
        Swal.fire("Cancelado", "Operación cancelada en POS", "info");
      }
      setCurrentPaymentUuid(null);
    } catch (error) {
      Swal.fire("Atención", "Cancela manualmente en el POS.", "warning");
    }
  };

  const handleCoverageChange = (field, value) => {
    setData("coverage_details", {
      ...data.coverage_details,
      [field]: value,
    });
  };

  // --- VALIDACIÓN LOCAL DEL FORMULARIO ---
  const validateForm = () => {
    const errorList = [];

    // 1. Validar Paciente
    if (!data.patient_id) {
      errorList.push(`Debes seleccionar un <b>${entityLabel}</b>.`);
    }

    // 2. Validar que existan servicios
    if (data.services_to_bill.length === 0) {
      errorList.push("La venta debe tener al menos un <b>ítem o servicio</b>.");
    }

    // 3. Validar fila por fila (Prestación, Doctor, Cantidad)
    data.services_to_bill.forEach((s, index) => {
      const rowNum = index + 1;

      // Si es deuda histórica o un plan, lo saltamos. Si es nueva (!is_debt):
      if (!s.is_debt && !s.is_plan) {
        if (!s.session_type_id) {
          errorList.push(
            `Fila ${rowNum}: Falta seleccionar el <b>Ítem/Servicio</b>.`
          );
        }
        if (isClinical && !s.doctor_id) {
          errorList.push(
            `Fila ${rowNum}: Falta asignar al <b>Profesional</b>.`
          );
        }
      }

      if (s.quantity < 1) {
        errorList.push(`Fila ${rowNum}: La cantidad debe ser mayor a 0.`);
      }
    });

    // 4. Validar Montos Negativos
    if (data.final_shares.amount_patient_clp < 0) {
      errorList.push("El <b>monto a pagar</b> no puede ser negativo.");
    }

    return errorList;
  };

  // --- SUBMIT MEJORADO CON VALIDACIÓN DETALLADA ---
  const submit = async (e) => {
    e.preventDefault();

    // 1. EJECUTAR VALIDACIÓN PREVIA
    const validationErrors = validateForm();

    if (validationErrors.length > 0) {
      // Si hay errores, mostramos una lista HTML en el SweetAlert
      return Swal.fire({
        title: "Faltan datos",
        icon: "warning",
        html: `
          <ul style="text-align: left; font-size: 0.9em; line-height: 1.5;">
            ${validationErrors
              .map((err) => `<li style="margin-bottom: 4px;">• ${err}</li>`)
              .join("")}
          </ul>
        `,
        confirmButtonText: "Revisar",
        confirmButtonColor: "#f59e0b", // Color naranja de advertencia
      });
    }

    // 2. PREPARAR ESTADO DE CARGA
    if (data.payment_details.payment_method === "pos_integrado") {
      setModalState({
        isOpen: true,
        message: "Esperando tarjeta en terminal POS...",
        isAbortable: true,
      });
    } else {
      setIsProcessing(true);
    }

    try {
      // --- REFUERZO DE DATOS ANTES DE ENVIAR ---
      const payload = {
          ...data,
          services_to_bill: data.services_to_bill.map(item => ({
              ...item,
              quantity: item.quantity || 1, // Aseguramos que siempre viaje
              unit_price_clp: item.unit_price_clp || 0,
              sellable_type: item.sellable_type || 'Product'
          }))
      };

      // 3. ENVIAR DATOS
      const response = await axios.post(route("payments.store"), payload);

      if (response.data.status === "success") {
        setModalState({ isOpen: false, message: "", isAbortable: true });
        setIsProcessing(false);

        Swal.fire({
          title: "¡Pago Aprobado!",
          text: "Generando comprobante...",
          icon: "success",
          timer: 2000,
          showConfirmButton: false,
        }).then(() => {
          if (response.data.url) window.location.href = response.data.url;
        });
      } else {
        // Caso raro donde backend responde success: false pero sin lanzar excepción
        throw new Error(
          response.data.message || "La transacción no fue aprobada."
        );
      }
    } catch (error) {
      console.error("Error en pago:", error);

      // Limpiar estados de carga
      setModalState({ isOpen: false, message: "", isAbortable: true });
      setIsProcessing(false);

      // 4. MANEJO INTELIGENTE DE ERRORES DEL SERVIDOR
      let errorTitle = "Error en transacción";
      let errorHtml = error.message || "Ocurrió un error inesperado.";

      // Si es error de validación de Laravel (422) que se pasó de nuestra validación local
      if (error.response?.status === 422) {
        errorTitle = "Datos Inválidos (Servidor)";
        const serverErrors = error.response.data.errors || {};
        // Convertimos el objeto de errores de Laravel en lista HTML
        const messages = Object.values(serverErrors).flat();

        errorHtml = `
            <ul style="text-align: left; font-size: 0.9em;">
              ${messages.map((msg) => `<li>• ${msg}</li>`).join("")}
            </ul>
         `;
      }
      // Si el backend envió un mensaje específico (ej: POS rechazado)
      else if (error.response?.data?.message) {
        errorHtml = error.response.data.message;
      }

      Swal.fire({
        title: errorTitle,
        html: errorHtml, // Usamos HTML para poder poner listas
        icon: "error",
        confirmButtonText: "Entendido",
        confirmButtonColor: "#d33",
      });
    }
  };


  return (
    <AuthenticatedLayout>
      <Head title={`Caja - Nueva Venta (${isClinical ? 'Clínica' : 'Comercial'})`} />
      <div className="max-w-full p-4 mx-auto sm:p-6 lg:p-8">
        <form
          onSubmit={submit}
          className="grid grid-cols-1 gap-6 lg:grid-cols-3"
        >
          {/* COLUMNA 1: IDENTIFICACIÓN (REFACTORIZADA) */}
          <PatientCard
            // Datos
            patients={localPatients}
            insurances={insurances}
            plans={plans}
            selectedPatientId={data.patient_id}
            coverageDetails={data.coverage_details}
            errors={errors}
            business_type={business_type}
            // Estados UI
            isImedMode={isImedMode}
            hasSecondaryInsurance={hasSecondaryInsurance}
            // Handlers
            onPatientChange={(val) => setData("patient_id", val)}
            onCoverageChange={handleCoverageChange}
            onToggleImed={() => setIsImedMode(!isImedMode)}
            onToggleSecondary={() =>
              setHasSecondaryInsurance(!hasSecondaryInsurance)
            }
            onOpenNewPatient={() => setIsPatientModalOpen(true)}
          />

          {/* COLUMNA 2: PRESTACIONES */}
            <div className="lg:col-span-1 space-y-6">
                <ServicesCard
                    servicesToBill={data.services_to_bill}
                    patientExtras={patientExtras}
                    sessionTypes={sessionTypes}
                    doctors={doctors}
                    business_type={business_type}
                    onAddDebt={addDebtToBill}
                    onAddService={handleAddService}
                    onUpdateService={handleUpdateService}
                    onRemoveService={handleRemoveService}
                />
                {/* Solo clínico: Planes Médicos */}
                {isClinical && <PlansCard onAddPlan={handleAddPlan} />}
            </div>

          {/* COLUMNA 3: CAJA */}
          <PaymentSummary
            finalShares={data.final_shares}
            paymentDetails={data.payment_details}
            coverageDetails={data.coverage_details}
            isManualAdjustmentMode={isManualAdjustmentMode}
            hasSecondaryInsurance={hasSecondaryInsurance}
            paymentMethods={paymentMethods}
            isProcessing={isProcessing}
            business_type={business_type}
            canSubmit={data.services_to_bill.length > 0}
            onToggleManualMode={() =>
              setIsManualAdjustmentMode(!isManualAdjustmentMode)
            }
            onManualChange={handleManualChange}
            onPaymentMethodChange={(val) =>
              setData("payment_details", {
                ...data.payment_details,
                payment_method: val,
              })
            }
          />
        </form>
      </div>

      {/* --- MODAL CLIENTE/PACIENTE RÁPIDO --- */}
      {isPatientModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 backdrop-blur-md p-4">
          <div className="w-full max-w-lg bg-white shadow-2xl rounded-[2.5rem] overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="bg-brand-primary p-8 flex justify-between items-center relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
              <h3 className="font-black text-white uppercase tracking-widest text-sm relative z-10">Registro Rápido de {entityLabel}</h3>
              <button
                onClick={() => setIsPatientModalOpen(false)}
                className="text-white/80 hover:text-white transition-colors relative z-10 bg-white/10 p-2 rounded-xl"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleQuickPatientSubmit} className="p-10 space-y-6">
              <div className="space-y-1">
                <label className="enterprise-label ml-1">
                  RUT / DNI
                </label>
                <input
                  type="text"
                  required
                  placeholder="12.345.678-9"
                  className="w-full border-gray-100 rounded-2xl py-4 px-5 font-bold text-gray-700 focus:ring-brand-primary transition-all"
                  value={quickPatient.rut}
                  onChange={(e) =>
                    setQuickPatient({ ...quickPatient, rut: e.target.value })
                  }
                />
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-1">
                  <label className="enterprise-label ml-1">
                    Nombre
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Juan"
                    className="w-full border-gray-100 rounded-2xl py-4 px-5 font-bold text-gray-700 focus:ring-brand-primary transition-all"
                    value={quickPatient.name}
                    onChange={(e) =>
                      setQuickPatient({ ...quickPatient, name: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-1">
                  <label className="enterprise-label ml-1">
                    Apellido
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Pérez"
                    className="w-full border-gray-100 rounded-2xl py-4 px-5 font-bold text-gray-700 focus:ring-brand-primary transition-all"
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
              <div className="space-y-1">
                <label className="enterprise-label ml-1">
                  Email
                </label>
                <input
                  type="email"
                  required
                  placeholder="juan.perez@ejemplo.com"
                  className="w-full border-gray-100 rounded-2xl py-4 px-5 font-bold text-gray-700 focus:ring-brand-primary transition-all"
                  value={quickPatient.email}
                  onChange={(e) =>
                    setQuickPatient({ ...quickPatient, email: e.target.value })
                  }
                />
              </div>
              <div className="pt-4 flex gap-4">
                <button
                  type="button"
                  onClick={() => setIsPatientModalOpen(false)}
                  className="flex-1 py-4 text-[10px] font-black uppercase tracking-widest text-brand-gray hover:bg-gray-50 rounded-2xl transition-all border-2 border-transparent"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-4 bg-brand-primary text-white text-[10px] font-black uppercase tracking-widest rounded-2xl hover:brightness-110 transition-all shadow-lg shadow-brand-primary/20 active:scale-95"
                >
                  Guardar {entityLabel}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL POS --- */}
      <PaymentBlockingModal
        isOpen={modalState.isOpen}
        message={modalState.message}
        isAbortable={modalState.isAbortable}
        onAbort={handleAbortTransaction}
      />
    </AuthenticatedLayout>
  );
}
