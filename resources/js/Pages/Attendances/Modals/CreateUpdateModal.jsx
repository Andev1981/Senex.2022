import { useForm, usePage } from "@inertiajs/react";
import { fmtCLP, fmtDateISO } from "@/utils/utils";
import { estadoTexto } from "@/helpers/status";
import SearchSelect from "@/Components/SearchSelect";
import {
  AVAILABLE_TECHNIQUES,
  AVAILABLE_EXERCISES,
} from "@/Constants/clinicalData";
import InputError from "@/Components/InputError";

export default function CreateUpdateModal({
  setShowCreateSessionModal,
  patients,
  doctors,
  session_types,
  sessionData,
  setSessionData,
}) {
  const isEditing = !!sessionData?.session_id;
  const currentStatus = sessionData?.status;
  const { current_company_id } = usePage().props;
  const { data, setData, errors, post, patch, reset, processing } = useForm({
    id: sessionData?.session_id || "",
    company_id: current_company_id,
    treatment_id: sessionData?.treatment_id || "",
    doctor_id: sessionData?.doctor_id || "",
    patient_id: sessionData?.patient_id || "",
    session_type_id: sessionData?.session_type_id || "",
    month_session_number: sessionData?.month_session_number || 0,
    date: sessionData?.date || "",
    time: sessionData?.time || "",
    duration: sessionData?.duration || 45,
    status: sessionData?.status || "scheduled",
    pain_before: sessionData?.pain_before || 0,
    pain_after: sessionData?.pain_after || 0,
    rom_flexion: sessionData?.rom_flexion || 0,
    rom_rotation: sessionData?.rom_rotation || 0,
    rom_abduction: sessionData?.rom_abduction || 0,

    techniques: sessionData?.techniques || [],
    exercises: sessionData?.exercises || [],
    meta: sessionData?.meta || [],
    notes: sessionData?.notes || "",
    homework: sessionData?.homework || "",
    next_goals: sessionData?.next_goals || "",
    cancellation_note: sessionData?.cancellation_note || "",

    patient_amount: sessionData?.patient_amount || 0,
    doctor_amount: sessionData?.doctor_amount || 0,
    clinic_amount: sessionData?.clinic_amount || 0,

    patient_plan_id: sessionData?.patient_plan_id || "",
    consume_plan: sessionData?.consume_plan || false,
    base_price_clp: sessionData?.base_price_clp || "",
  });

  // ✅ Helper mejorado para verificar si un campo es editable
  const isFieldEditable = (fieldType) => {
    if (!isEditing) return true; // Al crear, todos los campos son editables

    // Sesiones canceladas o ausentes: NO se pueden editar
    if (currentStatus === "cancelled" || currentStatus === "absent") {
      return false;
    }

    // Sesiones programadas: todo editable EXCEPTO datos clínicos
    if (currentStatus === "scheduled") {
      return fieldType !== "clinical";
    }

    // Sesiones en progreso: solo duración, tipo y datos clínicos
    if (currentStatus === "in_progress") {
      return [
        "duration",
        "session_type_id",
        "patient_amount",
        "clinical",
      ].includes(fieldType);
    }

    // Sesiones completadas: solo datos clínicos
    if (currentStatus === "completed") {
      return fieldType === "clinical";
    }

    return false;
  };

  // ✅ Helper para saber si ALGÚN campo básico es editable
  const canEditBasicFields = () => {
    if (!isEditing) return true;
    return currentStatus === "scheduled" || currentStatus === "in_progress";
  };

  // ✅ Helper para saber si se pueden editar datos clínicos
  const canEditClinicalFields = () => {
    if (!isEditing) {
      // Al crear, solo si se marca como "completed"
      return sessionData.status === "completed";
    }
    // Al editar, según la lógica de permisos
    return isFieldEditable("clinical");
  };

  // ✅ Helper para saber si se pueden editar datos del plan
  const canEditPlanFields = () => {
    if (!isEditing) return true;
    return currentStatus === "scheduled";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!data.patient_id) {
      alert("Debes seleccionar un paciente");
      return;
    }
    if (!data.doctor_id) {
      alert("Debes seleccionar un doctor");
      return;
    }
    if (!data.session_type_id) {
      alert("Debes seleccionar un tipo de sesión");
      return;
    }
    if (!data.time) {
      alert("Debes ingresar una hora");
      return;
    }

    const opts = {
      preserveState: (page) => Object.keys(page.props.errors || {}).length > 0,
      preserveScroll: true,
      onSuccess: () => {
        reset();
        setShowCreateSessionModal(false);
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

    // 1. Clonar data si es necesario y eliminar el ID del payload (Buena práctica)
    const treatmentSessionId = data.id;
    const payload = { ...data };
    if (payload.id) {
      delete payload.id; // El ID ya va en la URL para el update
    }

    if (isEditing) {
      // usa PUT/PATCH si tu ruta es resourceful
      // put(route('treatment.sessions.update', data.id), opts);
      patch(route("treatment.sessions.update", treatmentSessionId), opts);
    } else {
      post(route("treatment.sessions.store"), opts);
    }
  };

  return (
    <div className="bg-white rounded-xl">
      <form onSubmit={handleSubmit}>
        {/* ✅ Advertencias según status (solo en edición) */}
        {isEditing && (
          <>
            {(currentStatus === "cancelled" || currentStatus === "absent") && (
              <div className="p-3 mx-2 mt-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm font-semibold text-red-800">
                  ⚠️ Esta sesión no puede editarse. Estado:{" "}
                  {estadoTexto(currentStatus)}
                </p>
              </div>
            )}

            {currentStatus === "in_progress" && (
              <div className="p-3 mx-2 mt-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm font-semibold text-yellow-800">
                  ⚠️ Solo puedes editar: duración, tipo de sesión, valor y datos
                  clínicos
                </p>
              </div>
            )}

            {currentStatus === "completed" && (
              <div className="p-3 mx-2 mt-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm font-semibold text-blue-800">
                  ℹ️ Solo puedes editar datos clínicos
                </p>
              </div>
            )}
          </>
        )}

        <div className="p-2 space-y-2">
          {/* ✅ SECCIÓN 1: Información Básica */}
          {canEditBasicFields() && (
            <div className="p-4 border-2 border-gray-200 rounded-lg">
              <h4 className="mb-4 text-lg font-semibold text-gray-800">
                📋 Información de la Sesión
              </h4>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {/* Selección de Paciente */}
                <div>
                  <SearchSelect
                    items={patients}
                    value={data?.patient_id}
                    onChange={(value) => setData("patient_id", value)}
                    config={{
                      valueKey: "id",
                      displayKey: "full_name",
                      secondaryKeys: ["rut"],
                      searchKeys: ["full_name", "rut"],
                      renderItem: (item) => (
                        <div>
                          <p className="font-medium text-gray-900">
                            {item.full_name}
                          </p>
                          <p className="text-xs text-gray-500">
                            RUT: {item.rut}
                          </p>
                          {item.active_treatments?.length > 0 && (
                            <p className="text-xs font-semibold text-blue-600">
                              ✓ Tiene tratamiento activo
                            </p>
                          )}
                        </div>
                      ),
                    }}
                    label="Paciente *"
                    placeholder="Buscar paciente por nombre o RUT..."
                    disabled={!isFieldEditable("patient_id")}
                    error={errors.patient_id}
                  />
                </div>

                {/* Selección de Doctor */}
                <div>
                  <SearchSelect
                    items={doctors}
                    value={data?.doctor_id}
                    onChange={(value) => setData("doctor_id", value)}
                    config={{
                      valueKey: "id",
                      displayKey: "full_name",
                      searchKeys: ["full_name"],
                      renderItem: (item) => (
                        <p className="font-medium text-gray-900">
                          {item.full_name}
                        </p>
                      ),
                    }}
                    label="Kinesiólogo/a *"
                    placeholder="Buscar profesional..."
                    disabled={!isFieldEditable("doctor_id")}
                    error={errors.doctor_id}
                  />
                </div>

                {/* Tipo de Sesión */}
                <div>
                  <SearchSelect
                    items={session_types}
                    value={data?.session_type_id}
                    onChange={(value) => {
                      const selectedType = session_types.find(
                        (st) => st.id === value
                      );
                      setData({
                        ...data,
                        session_type_id: value,
                        patient_amount:
                          Number(selectedType?.base_price_clp) ?? 0,
                      });
                    }}
                    config={{
                      valueKey: "id",
                      displayKey: "name",
                      searchKeys: ["name"],
                      renderItem: (item) => (
                        <div>
                          <p className="font-medium text-gray-900">
                            {item.name}
                          </p>
                          <p className="text-sm text-gray-500">
                            {fmtCLP(item.base_price_clp)}
                          </p>
                        </div>
                      ),
                    }}
                    label="Tipo de Sesión *"
                    placeholder="Buscar tipo..."
                    disabled={!isFieldEditable("session_type_id")}
                    error={errors.session_type_id}
                  />
                </div>

                {/* Valor Sesión */}
                <div>
                  <label className="block mb-1 text-sm font-bold text-gray-700">
                    Valor Sesión (CLP) *
                  </label>
                  <input
                    type="text"
                    value={fmtCLP(data.patient_amount || 0)}
                    onChange={(e) => {
                      setData("patient_amount", e.target.value);
                    }}
                    className={`w-full px-3 py-2 border-2 rounded-lg focus:border-blue-500 focus:outline-none disabled:bg-gray-100 ${
                      errors.patient_amount
                        ? "border-red-500"
                        : "border-gray-200"
                    }`}
                    placeholder="$0"
                    disabled={!isFieldEditable("patient_amount")}
                    required
                  />
                  <InputError message={errors.patient_amount} />
                  <p className="mt-1 text-xs text-gray-500">
                    Puedes modificar el valor si es necesario
                  </p>
                </div>

                {/* Fecha */}
                <div>
                  <label className="block mb-2 text-sm font-bold text-gray-700">
                    Fecha *
                  </label>
                  <input
                    type="date"
                    value={fmtDateISO(data.date) || ""}
                    onChange={(e) => {
                      setData("date", e.target.value);
                    }}
                    className={`w-full px-3 py-2 border-2 rounded-lg focus:border-blue-500 focus:outline-none disabled:bg-gray-100 ${
                      errors.date ? "border-red-500" : "border-gray-200"
                    }`}
                    disabled={!isFieldEditable("date")}
                    required
                  />
                  <InputError message={errors.date} />
                </div>

                {/* Hora */}
                <div>
                  <label className="block mb-2 text-sm font-bold text-gray-700">
                    Hora *
                  </label>
                  <input
                    type="time"
                    value={data?.time || ""}
                    onChange={(e) => {
                      setData("time", e.target.value);
                    }}
                    className={`w-full px-3 py-2 border-2 rounded-lg focus:border-blue-500 focus:outline-none disabled:bg-gray-100 ${
                      errors.time ? "border-red-500" : "border-gray-200"
                    }`}
                    disabled={!isFieldEditable("time")}
                    required
                  />
                  <InputError message={errors.time} />
                </div>

                {/* Duración */}
                <div>
                  <label className="block mb-2 text-sm font-bold text-gray-700">
                    Duración (minutos) *
                  </label>
                  <select
                    value={data.duration || 45}
                    onChange={(e) => {
                      setSessionData("duration", parseInt(e.target.value));
                    }}
                    className={`w-full px-3 py-2 border-2 rounded-lg focus:border-blue-500 focus:outline-none disabled:bg-gray-100 ${
                      errors.duration ? "border-red-500" : "border-gray-200"
                    }`}
                    disabled={!isFieldEditable("duration")}
                  >
                    <option value={30}>30 minutos</option>
                    <option value={45}>45 minutos</option>
                    <option value={60}>60 minutos</option>
                    {/* <option value={90}>90 minutos</option>
                    <option value={120}>120 minutos</option> */}
                  </select>
                  <InputError message={errors.duration} />
                </div>

                {/* Estado (solo al crear o si está en scheduled) */}
                {!isEditing && (
                  <div>
                    <label className="block mb-2 text-sm font-bold text-gray-700">
                      Estado *
                    </label>
                    <select
                      value={data.status || "scheduled"}
                      onChange={(e) => {
                        setData("status", e.target.value);
                      }}
                      className={`w-full px-3 py-2 border-2 rounded-lg focus:border-blue-500 focus:outline-none ${
                        errors.status ? "border-red-500" : "border-gray-200"
                      }`}
                    >
                      <option value="scheduled">Programada</option>
                      <option value="completed">Completada</option>
                    </select>
                    <InputError message={errors.status} />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ✅ SECCIÓN 2: Información del Plan */}
          {canEditPlanFields() && (
            <>
              {!isEditing &&
                data.patient_id &&
                (() => {
                  const patient = patients.find(
                    (p) => p.id === data.patient_id
                  );
                  const plans = patient?.active_plans || [];

                  if (plans.length === 0) {
                    return (
                      <div className="p-4 bg-gray-50 border-2 border-gray-200 rounded-lg">
                        <div className="flex items-start gap-3">
                          <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center bg-gray-200 rounded-lg">
                            <span className="text-xl">💳</span>
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-gray-700">
                              Este paciente no tiene planes activos
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              La sesión se cobrará individualmente
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  }

                  const selectedPlan = plans.find(
                    (p) => p.id === data.patient_plan_id
                  );

                  return (
                    <div className="space-y-3">
                      {plans.length > 1 ? (
                        <div>
                          <label className="block mb-2 text-sm font-bold text-gray-700">
                            Plan a utilizar (opcional)
                          </label>
                          <select
                            value={data.patient_plan_id || ""}
                            onChange={(e) => {
                              const planId = e.target.value
                                ? parseInt(e.target.value)
                                : null;
                              setData({
                                ...data,
                                patient_plan_id: planId,
                                consume_plan: !!planId,
                              });
                            }}
                            className={`w-full px-3 py-2 border-2 rounded-lg focus:border-blue-500 focus:outline-none ${
                              errors.patient_plan_id
                                ? "border-red-500"
                                : "border-gray-200"
                            }`}
                          >
                            <option value="">
                              No usar plan (pago individual)
                            </option>
                            {plans.map((plan) => (
                              <option key={plan.id} value={plan.id}>
                                {plan.plan_name} - {plan.sessions_remaining}/
                                {plan.sessions_included} sesiones disponibles
                                {plan.expiry_date &&
                                  ` (vence: ${plan.expiry_date})`}
                              </option>
                            ))}
                          </select>
                          <InputError message={errors.patient_plan_id} />

                          {selectedPlan && (
                            <div className="mt-3 p-3 bg-blue-50 border-2 border-blue-200 rounded-lg">
                              <div className="flex items-start gap-3">
                                <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-blue-500 text-white rounded-lg font-bold text-sm">
                                  ✓
                                </div>
                                <div className="flex-1">
                                  <p className="text-sm font-bold text-blue-900">
                                    {selectedPlan.plan_name}
                                  </p>
                                  {selectedPlan.plan_description && (
                                    <p className="text-xs text-blue-700 mt-1">
                                      {selectedPlan.plan_description}
                                    </p>
                                  )}
                                  <div className="flex items-center gap-4 mt-2 text-xs">
                                    <div>
                                      <span className="text-blue-600">
                                        Usadas:
                                      </span>
                                      <span className="ml-1 font-semibold text-blue-900">
                                        {selectedPlan.sessions_used}
                                      </span>
                                    </div>
                                    <div>
                                      <span className="text-blue-600">
                                        Disponibles:
                                      </span>
                                      <span className="ml-1 font-semibold text-green-700">
                                        {selectedPlan.sessions_remaining}
                                      </span>
                                    </div>
                                    <div>
                                      <span className="text-blue-600">
                                        Total:
                                      </span>
                                      <span className="ml-1 font-semibold text-blue-900">
                                        {selectedPlan.sessions_included}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div
                          className={`p-4 rounded-lg border-2 ${
                            plans[0].sessions_remaining > 0
                              ? "bg-green-50 border-green-200"
                              : "bg-red-50 border-red-200"
                          }`}
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-lg font-bold">
                                💳
                              </div>
                              <div>
                                <h4 className="text-sm font-bold text-gray-900">
                                  {plans[0].plan_name}
                                </h4>
                                <p className="text-xs text-gray-600">
                                  Código: {plans[0].plan_code}
                                </p>
                              </div>
                            </div>
                            {plans[0].is_exhausted && (
                              <span className="px-2 py-1 text-xs font-semibold text-red-700 bg-red-100 rounded-full">
                                Agotado
                              </span>
                            )}
                          </div>

                          <div className="grid grid-cols-3 gap-3 mb-3">
                            <div className="p-2 bg-white rounded-lg border border-gray-200">
                              <p className="text-xs text-gray-600">Incluidas</p>
                              <p className="text-lg font-bold text-gray-900">
                                {plans[0].sessions_included}
                              </p>
                            </div>
                            <div className="p-2 bg-white rounded-lg border border-gray-200">
                              <p className="text-xs text-gray-600">Usadas</p>
                              <p className="text-lg font-bold text-gray-600">
                                {plans[0].sessions_used}
                              </p>
                            </div>
                            <div
                              className={`p-2 rounded-lg border-2 ${
                                plans[0].sessions_remaining > 0
                                  ? "bg-green-100 border-green-300"
                                  : "bg-red-100 border-red-300"
                              }`}
                            >
                              <p className="text-xs text-gray-700">
                                Disponibles
                              </p>
                              <p
                                className={`text-lg font-bold ${
                                  plans[0].sessions_remaining > 0
                                    ? "text-green-700"
                                    : "text-red-700"
                                }`}
                              >
                                {plans[0].sessions_remaining}
                              </p>
                            </div>
                          </div>

                          {plans[0].expiry_date && (
                            <div className="mb-3 p-2 bg-white rounded-lg border border-gray-200">
                              <div className="flex items-center justify-between text-xs">
                                <span className="text-gray-600">
                                  📅 Fecha de vencimiento:
                                </span>
                                <span
                                  className={`font-semibold ${
                                    plans[0].is_expired
                                      ? "text-red-600"
                                      : "text-gray-900"
                                  }`}
                                >
                                  {plans[0].expiry_date}
                                  {plans[0].is_expired && " (Vencido)"}
                                </span>
                              </div>
                            </div>
                          )}

                          {plans[0].plan_description && (
                            <div className="mb-3 p-2 bg-white rounded-lg border border-gray-200">
                              <p className="text-xs text-gray-700">
                                {plans[0].plan_description}
                              </p>
                            </div>
                          )}

                          <div
                            className={`flex items-start gap-3 p-3 rounded-lg border-2 ${
                              plans[0].sessions_remaining > 0
                                ? "bg-white border-green-400"
                                : "bg-gray-100 border-gray-300"
                            }`}
                          >
                            <input
                              type="checkbox"
                              id="consume_plan"
                              checked={data.consume_plan === true}
                              onChange={(e) => {
                                setData({
                                  ...data,
                                  consume_plan: e.target.checked,
                                  patient_plan_id: e.target.checked
                                    ? plans[0].id
                                    : null,
                                });
                              }}
                              disabled={plans[0].sessions_remaining === 0}
                              className="w-5 h-5 mt-0.5 text-green-600 border-gray-300 rounded focus:ring-green-500 focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            />
                            <div className="flex-1">
                              <label
                                htmlFor="consume_plan"
                                className={`text-sm font-semibold cursor-pointer block ${
                                  plans[0].sessions_remaining > 0
                                    ? "text-gray-900"
                                    : "text-gray-500"
                                }`}
                              >
                                Usar sesión de este plan
                              </label>
                              <p className="text-xs mt-1 text-gray-600">
                                {plans[0].sessions_remaining > 0 ? (
                                  <>
                                    Se marcará 1 sesión como usada. Quedarían{" "}
                                    <span className="font-bold text-green-700">
                                      {plans[0].sessions_remaining - 1} sesiones
                                      disponibles
                                    </span>
                                    {plans[0].sessions_remaining - 1 === 0 && (
                                      <span className="block mt-1 text-orange-600 font-semibold">
                                        ⚠️ Esta será la última sesión del plan
                                      </span>
                                    )}
                                  </>
                                ) : (
                                  <span className="text-red-600 font-semibold">
                                    ⚠️ Plan agotado. Esta sesión se cobrará
                                    individualmente.
                                  </span>
                                )}
                              </p>
                            </div>
                          </div>

                          {plans[0].expiry_date &&
                            !plans[0].is_expired &&
                            (() => {
                              const daysUntilExpiry = Math.ceil(
                                (new Date(plans[0].expiry_date) - new Date()) /
                                  (1000 * 60 * 60 * 24)
                              );
                              if (daysUntilExpiry <= 7 && daysUntilExpiry > 0) {
                                return (
                                  <div className="mt-3 p-2 bg-orange-50 border border-orange-200 rounded-lg">
                                    <p className="text-xs text-orange-800">
                                      ⏰{" "}
                                      <strong>
                                        El plan vence en {daysUntilExpiry} días
                                      </strong>
                                    </p>
                                  </div>
                                );
                              }
                              return null;
                            })()}
                        </div>
                      )}

                      {!data.consume_plan && plans.length > 0 && (
                        <div className="p-3 bg-yellow-50 border-2 border-yellow-200 rounded-lg">
                          <div className="flex items-start gap-2">
                            <span className="text-yellow-600 text-lg">💰</span>
                            <div>
                              <p className="text-sm font-semibold text-yellow-900">
                                Sesión de pago individual
                              </p>
                              <p className="text-xs text-yellow-700 mt-1">
                                Esta sesión NO consumirá ningún plan y se
                                cobrará por separado
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })()}

              {isEditing && data.consume_plan && (
                <div className="p-4 border-2 border-indigo-200 rounded-lg bg-indigo-50">
                  <h4 className="mb-4 text-lg font-semibold text-indigo-900">
                    📦 Configuración de Plan
                  </h4>

                  <div className="space-y-4">
                    <label className="flex items-center gap-3 p-3 bg-white border-2 border-indigo-200 rounded-lg cursor-pointer hover:border-indigo-400">
                      <input
                        type="checkbox"
                        checked={data.consume_plan || false}
                        onChange={(e) =>
                          setData({
                            ...data,
                            consume_plan: e.target.checked,
                            patient_plan_id: e.target.checked
                              ? data.patient_plan_id
                              : null,
                          })
                        }
                        className="w-5 h-5 text-indigo-600"
                      />
                      <div>
                        <span className="font-semibold text-gray-900">
                          Esta sesión consume un plan del paciente
                        </span>
                        <p className="text-sm text-gray-600">
                          Se descontará una sesión del plan seleccionado
                        </p>
                      </div>
                    </label>
                    <InputError message={errors.consume_plan} />

                    {data.consume_plan && (
                      <div>
                        <label className="block mb-2 text-sm font-bold text-gray-700">
                          Seleccionar Plan *
                        </label>
                        <select
                          value={data.patient_plan_id || ""}
                          onChange={(e) =>
                            setData({
                              ...data,
                              patient_plan_id: Number(e.target.value) || null,
                            })
                          }
                          className={`w-full px-3 py-2 border-2 rounded-lg focus:border-indigo-500 focus:outline-none ${
                            errors.patient_plan_id
                              ? "border-red-500"
                              : "border-gray-200"
                          }`}
                        >
                          <option value="">Seleccionar plan...</option>
                          {patients
                            .find((p) => p.id === data.patient_id)
                            ?.active_plans?.map((plan) => (
                              <option key={plan.id} value={plan.id}>
                                {plan.plan_name} - {plan.sessions_remaining}{" "}
                                sesiones disponibles
                              </option>
                            ))}
                        </select>
                        <InputError message={errors.patient_plan_id} />

                        {data.patient_plan_id && (
                          <div className="p-3 mt-2 bg-blue-50 border border-blue-200 rounded-lg">
                            <p className="text-sm text-blue-800">
                              ℹ️ Cambiar de plan ajustará automáticamente las
                              sesiones usadas
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </>
          )}

          {/* ✅ SECCIÓN 3: Datos Clínicos */}
          {canEditClinicalFields() && (
            <>
              {/* Evaluación del Dolor */}
              <div className="p-4 border-2 border-blue-200 rounded-lg bg-blue-50">
                <h4 className="mb-4 text-lg font-semibold text-blue-900">
                  🩺 Evaluación del Dolor (Escala 0-10)
                </h4>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  {/* Dolor Antes */}
                  <div>
                    <label className="block mb-2 text-sm font-bold text-gray-700">
                      Dolor Antes de la Sesión *
                    </label>
                    <div className="flex items-center gap-3">
                      <input
                        type="range"
                        min="0"
                        max="10"
                        value={data.pain_before || 0}
                        onChange={(e) => {
                          const value = Number(e.target.value);
                          setData({
                            ...data,
                            pain_before: value,
                          });
                        }}
                        className="flex-1"
                      />
                      <span className="w-16 text-3xl font-bold text-center text-blue-600">
                        {data.pain_before || 0}
                      </span>
                    </div>
                    <div className="flex justify-between mt-1 text-xs text-gray-500">
                      <span>Sin dolor</span>
                      <span>Dolor máximo</span>
                    </div>
                    <InputError message={errors.pain_before} />
                  </div>

                  {/* Dolor Después */}
                  <div>
                    <label className="block mb-2 text-sm font-bold text-gray-700">
                      Dolor Después de la Sesión *
                    </label>
                    <div className="flex items-center gap-3">
                      <input
                        type="range"
                        min="0"
                        max="10"
                        value={data.pain_after || 0}
                        onChange={(e) => {
                          const value = Number(e.target.value);
                          setData({
                            ...data,
                            pain_after: value,
                          });
                        }}
                        className="flex-1"
                      />
                      <span className="w-16 text-3xl font-bold text-center text-green-600">
                        {data.pain_after || 0}
                      </span>
                    </div>
                    <div className="flex justify-between mt-1 text-xs text-gray-500">
                      <span>Sin dolor</span>
                      <span>Dolor máximo</span>
                    </div>
                    <InputError message={errors.pain_after} />
                  </div>
                </div>
              </div>

              {/* Rango de Movimiento */}
              <div className="p-4 border-2 border-purple-200 rounded-lg bg-purple-50 mt-4">
                <h4 className="mb-4 text-lg font-semibold text-purple-900">
                  📐 Rango de Movimiento
                </h4>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <label className="block mb-2 text-sm font-bold text-gray-700">
                      ROM Antes (grados)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="180"
                      value={data.rom_before || ""}
                      onChange={(e) => {
                        setData({
                          ...data,
                          rom_before: e.target.value
                            ? Number(e.target.value)
                            : null,
                        });
                      }}
                      className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none"
                      placeholder="0-180"
                    />
                    <InputError message={errors.rom_before} />
                  </div>

                  <div>
                    <label className="block mb-2 text-sm font-bold text-gray-700">
                      ROM Después (grados)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="180"
                      value={data.rom_after || ""}
                      onChange={(e) => {
                        setData({
                          ...data,
                          rom_after: e.target.value
                            ? Number(e.target.value)
                            : null,
                        });
                      }}
                      className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none"
                      placeholder="0-180"
                    />
                    <InputError message={errors.rom_after} />
                  </div>
                </div>
              </div>

              {/* Técnicas Aplicadas */}
              <div className="p-4 border-2 border-green-200 rounded-lg bg-green-50">
                <h4 className="mb-4 text-lg font-semibold text-green-900">
                  🔧 Técnicas Aplicadas
                </h4>

                {/* Opciones predefinidas (checkboxes) */}
                <div className="mb-3">
                  <p className="text-xs font-semibold text-gray-700 mb-2">
                    Selecciona técnicas aplicadas:
                  </p>
                  <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
                    {AVAILABLE_TECHNIQUES.map((technique) => {
                      const currentTechniques = data.techniques || [];
                      const isSelected = currentTechniques.includes(technique);

                      return (
                        <label
                          key={technique}
                          className={`flex items-center gap-2 p-2 bg-white border-2 rounded-lg cursor-pointer transition-all ${
                            isSelected
                              ? "border-green-500 bg-green-50"
                              : "border-gray-200 hover:border-green-300"
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setData({
                                  ...data,
                                  techniques: [
                                    ...(data.techniques || []),
                                    technique,
                                  ],
                                });
                              } else {
                                setData({
                                  ...data,
                                  techniques: (data.techniques || []).filter(
                                    (t) => t !== technique
                                  ),
                                });
                              }
                            }}
                            className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                          />
                          <span className="text-sm font-medium text-gray-700">
                            {technique}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                {/* Input para agregar técnicas personalizadas */}
                <div>
                  <p className="text-xs font-semibold text-gray-700 mb-2">
                    O agrega una técnica personalizada:
                  </p>
                  <input
                    type="text"
                    placeholder="Escribe una técnica y presiona Enter..."
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && e.target.value.trim()) {
                        e.preventDefault();
                        const newTechnique = e.target.value.trim();
                        const currentTechniques = data.techniques || [];

                        if (!currentTechniques.includes(newTechnique)) {
                          setData({
                            ...data,
                            techniques: [...currentTechniques, newTechnique],
                          });
                        }
                        e.target.value = "";
                      }
                    }}
                    className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:outline-none"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Presiona Enter para agregar técnicas no listadas
                  </p>
                </div>

                {/* Técnicas seleccionadas (chips) */}
                {data.techniques?.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-3 p-3 bg-white rounded-lg border-2 border-green-300">
                    {data.techniques.map((technique, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium bg-green-600 text-white rounded-full shadow-sm"
                      >
                        {technique}
                        <button
                          type="button"
                          onClick={() => {
                            setData({
                              ...data,
                              techniques: data.techniques.filter(
                                (_, i) => i !== idx
                              ),
                            });
                          }}
                          className="ml-1 hover:bg-green-700 rounded-full p-0.5"
                        >
                          <svg
                            className="w-3 h-3"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Ejercicios Realizados */}
              <div className="p-4 border-2 border-orange-200 rounded-lg bg-orange-50">
                <h4 className="mb-4 text-lg font-semibold text-orange-900">
                  💪 Ejercicios Realizados
                </h4>

                {/* Opciones predefinidas (checkboxes) */}
                <div className="mb-3">
                  <p className="text-xs font-semibold text-gray-700 mb-2">
                    Selecciona ejercicios realizados:
                  </p>
                  <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
                    {AVAILABLE_EXERCISES.map((exercise) => {
                      const currentExercises = data.exercises || [];
                      const isSelected = currentExercises.includes(exercise);

                      return (
                        <label
                          key={exercise}
                          className={`flex items-center gap-2 p-2 bg-white border-2 rounded-lg cursor-pointer transition-all ${
                            isSelected
                              ? "border-orange-500 bg-orange-50"
                              : "border-gray-200 hover:border-orange-300"
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setData({
                                  ...data,
                                  exercises: [
                                    ...(data.exercises || []),
                                    exercise,
                                  ],
                                });
                              } else {
                                setData({
                                  ...data,
                                  exercises: (data.exercises || []).filter(
                                    (ex) => ex !== exercise
                                  ),
                                });
                              }
                            }}
                            className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                          />
                          <span className="text-sm font-medium text-gray-700">
                            {exercise}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                {/* Input para agregar ejercicios personalizados */}
                <div>
                  <p className="text-xs font-semibold text-gray-700 mb-2">
                    O agrega un ejercicio personalizado:
                  </p>
                  <input
                    type="text"
                    placeholder="Escribe un ejercicio y presiona Enter..."
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && e.target.value.trim()) {
                        e.preventDefault();
                        const newExercise = e.target.value.trim();
                        const currentExercises = data.exercises || [];

                        if (!currentExercises.includes(newExercise)) {
                          setData({
                            ...data,
                            exercises: [...currentExercises, newExercise],
                          });
                        }
                        e.target.value = "";
                      }
                    }}
                    className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-orange-500 focus:outline-none"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Presiona Enter para agregar ejercicios no listados
                  </p>
                </div>

                {/* Ejercicios seleccionados (chips) */}
                {data.exercises?.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-3 p-3 bg-white rounded-lg border-2 border-orange-300">
                    {data.exercises.map((exercise, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium bg-orange-600 text-white rounded-full shadow-sm"
                      >
                        {exercise}
                        <button
                          type="button"
                          onClick={() => {
                            setData({
                              ...data,
                              exercises: data.exercises.filter(
                                (_, i) => i !== idx
                              ),
                            });
                          }}
                          className="ml-1 hover:bg-orange-700 rounded-full p-0.5"
                        >
                          <svg
                            className="w-3 h-3"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Observaciones Clínicas */}
              <div className="p-4 border-2 border-gray-200 rounded-lg mt-4">
                <h4 className="mb-4 text-lg font-semibold text-gray-800">
                  📝 Observaciones Clínicas
                </h4>

                <div className="space-y-4">
                  <div>
                    <label className="block mb-2 text-sm font-bold text-gray-700">
                      Hallazgos durante la sesión
                    </label>
                    <textarea
                      value={data.findings || ""}
                      onChange={(e) => {
                        setData({
                          ...data,
                          findings: e.target.value,
                        });
                      }}
                      className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
                      rows="3"
                      placeholder="Describe los hallazgos objetivos durante la evaluación..."
                    />
                    <InputError message={errors.findings} />
                  </div>

                  <div>
                    <label className="block mb-2 text-sm font-bold text-gray-700">
                      Notas adicionales
                    </label>
                    <textarea
                      value={data.notes || ""}
                      onChange={(e) => {
                        setData({
                          ...data,
                          notes: e.target.value,
                        });
                      }}
                      className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
                      rows="3"
                      placeholder="Notas generales, recomendaciones, evolución..."
                    />
                    <InputError message={errors.notes} />
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* ✅ Botones de acción */}
        <div className="flex justify-end gap-2 p-4 border-t">
          <button
            type="button"
            onClick={() => {
              reset();
              setShowCreateSessionModal(false);
            }}
            className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300"
            disabled={processing}
          >
            Cancelar
          </button>
          <button
            type="submit"
            /* onClick={handleSubmit} */
            className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700"
            disabled={processing}
          >
            {isEditing ? "Actualizar Sesión" : "Crear Sesión"}
          </button>
        </div>
      </form>
    </div>
  );
}
