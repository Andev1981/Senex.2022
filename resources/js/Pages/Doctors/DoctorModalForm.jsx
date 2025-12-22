import { useState, useMemo, useEffect } from "react";
import { router } from "@inertiajs/react";
import {
  Calendar,
  Mail,
  Percent,
  Phone,
  Save,
  Search,
  UserCog,
  UserMinus,
  UserPlus,
  Users,
} from "lucide-react";
import { t } from "@/constants/translations";
import { fmtCLP } from "@/utils/utils";

export default function DoctorModalForm({
  selectedDoctor,
  setIsModalOpen,
  sessionTypes = [],
  patients = [],
}) {
  const [isEditingCommission, setIsEditingCommission] = useState(false);
  const [commissionDraft, setCommissionDraft] = useState({});
  const [patientQuery, setPatientQuery] = useState("");

  // Sincronizar commission_rates cuando cambia selectedDoctor
  useEffect(() => {
    if (selectedDoctor && !isEditingCommission) {
      setCommissionDraft({});
    }
    setPatientsDraft(selectedDoctor?.patients || []);
  }, [
    selectedDoctor?.id,
    selectedDoctor?.commission_rates,
    selectedDoctor?.patients,
  ]);

  const [patientsDraft, setPatientsDraft] = useState(
    selectedDoctor?.patients || []
  );

  // Obtener pacientes asignados del doctor seleccionado
  const assignedPatientIds = new Set(patientsDraft.map((p) => p.id));

  const statusPill = (isActive) =>
    isActive ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700";

  const availablePatients = useMemo(() => {
    if (!selectedDoctor) return [];
    return patients.filter(
      (p) =>
        !assignedPatientIds.has(p.id) &&
        (patientQuery.trim().length === 0 ||
          [p.name, p.rut, p.phone]
            .join(" ")
            .toLowerCase()
            .includes(patientQuery.toLowerCase()))
    );
  }, [selectedDoctor, patientQuery, patients, patientsDraft]);

  const saveCommissionRules = () => {
    if (!selectedDoctor) return;

    // Normaliza valores a número entero
    const rules = Object.entries(commissionDraft)
      .filter(([_, v]) => v && v.value !== "")
      .map(([sessionTypeId, v]) => ({
        session_type_id: Number(sessionTypeId),
        type: v.label || (v.type === "Fijo" ? "fixed_amount" : "percentage"),
        value: Math.max(0, Number(String(v.value).replace(/[^0-9.]/g, ""))),
      }));

    // Enviar al backend
    router.post(
      route("doctors.commission-rules.update", selectedDoctor.id),
      { rules },
      {
        onSuccess: () => {
          setIsEditingCommission(false);
          // No limpiamos el draft aquí para que se vea el cambio inmediatamente
        },
        preserveScroll: true,
        preserveState: true,
      }
    );
  };

  // Utils comisión: obtiene draft o valor actual para una fila
  const getRuleFor = (sessionTypeId) => {
    // 1) ¿Existe borrador para este tipo?
    if (commissionDraft[sessionTypeId]) {
      return commissionDraft[sessionTypeId];
    }

    // 2) Si no hay borrador, caemos en la regla original
    const rate = selectedDoctor?.commission_rates?.find(
      (r) => r.session_type_id === sessionTypeId
    );

    if (rate) {
      // Mapear correctamente el tipo
      const isPercentage = rate.commission_type === "percentage";
      return {
        type: isPercentage ? "percentage" : "fixed_amount",
        label: rate.commission_type,
        value: String(rate.commission_value || 0),
      };
    }

    // 3) Nunca hubo regla → valores por defecto
    return { type: "fixed_amount", label: "fixed_amount", value: "" };
  };

  const setDraft = (sessionTypeId, field, value) => {
    setCommissionDraft((prev) => {
      const currentRule = prev[sessionTypeId] || getRuleFor(sessionTypeId);

      // Si cambiamos el tipo, actualizar también el label
      if (field === "type") {
        return {
          ...prev,
          [sessionTypeId]: {
            ...currentRule,
            type: value,
            label: value === "fixed_amount" ? "fixed_amount" : "percentage",
          },
        };
      }

      return {
        ...prev,
        [sessionTypeId]: {
          ...currentRule,
          [field]: value,
        },
      };
    });
  };

  const assignPatient = (patientId) => {
    if (!selectedDoctor) return;

    const patient = patients.find((p) => p.id === patientId);
    if (!patient) return;

    router.post(
      route("doctors.patients.assign", selectedDoctor.id),
      { patient_id: patientId },
      {
        preserveScroll: true,
        preserveState: true,
        onSuccess: () => {
          setPatientsDraft((prev) => [...prev, patient]), setPatientQuery("");
        },
        onError: () => {
          // Rollback si falla
          setPatientsDraft((prev) => prev.filter((p) => p.id !== patientId));
        },
      }
    );
  };

  const unassignPatient = (patientId) => {
    if (!selectedDoctor) return;

    router.delete(
      route("doctors.patients.unassign", [selectedDoctor.id, patientId]),
      {
        preserveScroll: true,
        preserveState: true,
        onSuccess: () => {
          setPatientsDraft((prev) => prev.filter((p) => p.id !== patientId));
        },
        onError: () => {
          // Rollback: re-agregamos
          const patient = patients.find((p) => p.id === patientId);
          if (patient) {
            setPatientsDraft((prev) => [...prev, patient]);
          }
        },
      }
    );
  };

  const toggleActive = () => {
    if (!selectedDoctor) return;

    router.patch(
      route("doctors.toggle-active", selectedDoctor.id),
      { is_active: !selectedDoctor.is_active },
      {
        preserveScroll: true,
        preserveState: true,
      }
    );
  };

  const editDoctor = () => {
    if (!selectedDoctor) return;
    // Abrir modal de edición
    setIsModalOpen(true);
  };

  return (
    <div className="p-5 bg-white border border-gray-200 shadow-sm rounded-xl">
      {!selectedDoctor ? (
        <div>
          <h3 className="flex items-center gap-2 mb-4 text-lg font-bold text-gray-900">
            <UserCog className="w-5 h-5 text-blue-600" /> Ficha del Profesional
          </h3>
          <div className="p-6 text-center text-gray-500 border-2 border-gray-200 border-dashed rounded-lg">
            Selecciona un profesional para ver su detalle.
          </div>
        </div>
      ) : (
        <div>
          <h3 className="flex items-center gap-2 mb-4 text-lg font-bold text-gray-900">
            <UserCog className="w-5 h-5 text-blue-600" /> Ficha del Profesional
            <span
              className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${statusPill(
                selectedDoctor.status === "active"
              )}`}
            >
              {t("doctorStatus", selectedDoctor.status)}
            </span>
          </h3>
          <div className="flex items-start gap-3">
            <div className="flex items-center justify-center w-12 h-12 font-bold text-white rounded-xl bg-gradient-to-br from-blue-500 to-blue-600">
              {selectedDoctor?.name
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold text-gray-900">
                    {selectedDoctor?.name} {selectedDoctor?.last_name}
                  </p>
                  <p className="text-sm text-gray-600">{selectedDoctor?.rut}</p>
                  <p className="text-sm text-gray-500">
                    {selectedDoctor?.speciality}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-1 gap-1 mt-2 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-gray-400" />
                  {selectedDoctor?.phone}
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-gray-400" />
                  {selectedDoctor?.user?.email || selectedDoctor?.email}
                </div>
                {selectedDoctor?.availability && (
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    Disponibilidad: {selectedDoctor?.availability.join(", ")}
                  </div>
                )}
              </div>
            </div>
            {/* KPIs personales */}
            <div className="grid grid-cols-3 gap-2">
              <div className="p-3 text-center border border-gray-200 rounded-lg bg-gray-50">
                <p className="text-xs text-gray-600">Sesiones mes</p>
                <p className="text-xl font-bold">
                  {selectedDoctor?.sessions_month || 0}
                </p>
              </div>
              <div className="p-3 text-center border border-gray-200 rounded-lg bg-gray-50">
                <p className="text-xs text-gray-600">Ingresos mes</p>
                <p className="text-xl font-bold">
                  {fmtCLP(selectedDoctor?.revenue_month || 0)}
                </p>
              </div>
              <div className="p-3 text-center border border-gray-200 rounded-lg bg-gray-50">
                <p className="text-xs text-gray-600">Pacientes</p>
                <p className="text-xl font-bold">
                  {selectedDoctor?.sessions?.length || 0}
                </p>
              </div>
            </div>
          </div>

          {/* Comisiones por tratamiento */}
          <div className="mt-6 border border-gray-200 rounded-lg">
            <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200">
              <div className="flex items-center gap-2 font-semibold text-gray-900">
                <Percent className="w-4 h-4 text-purple-600" /> Estructura de
                comisión por tratamiento
              </div>
              {!isEditingCommission ? (
                <button
                  onClick={() => setIsEditingCommission(true)}
                  className="text-sm px-3 py-1.5 rounded-lg border-2 border-purple-200 text-purple-700 hover:bg-purple-50"
                >
                  Editar
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    onClick={saveCommissionRules}
                    className="inline-flex items-center gap-2 text-sm px-3 py-1.5 rounded-lg border-2 border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                  >
                    <Save className="w-4 h-4" />
                    Guardar
                  </button>
                  <button
                    onClick={() => {
                      setIsEditingCommission(false);
                      setCommissionDraft({});
                    }}
                    className="text-sm px-3 py-1.5 rounded-lg border-2 border-gray-200 text-gray-700 hover:bg-gray-50"
                  >
                    Cancelar
                  </button>
                </div>
              )}
            </div>

            <div className="p-4">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left border-b-2 border-gray-200">
                      <th className="px-3 py-2 text-xs font-bold text-gray-600 uppercase">
                        Tipo de Sesión
                      </th>
                      <th className="px-3 py-2 text-xs font-bold text-gray-600 uppercase">
                        Tipo
                      </th>
                      <th className="px-3 py-2 text-xs font-bold text-gray-600 uppercase">
                        Valor
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {sessionTypes?.map((sty) => {
                      const rule = getRuleFor(sty.id);
                      return (
                        <tr key={sty.id}>
                          <td className="flex px-3 py-2 text-sm text-gray-800">
                            {sty.name}{" "}
                            <p className="pl-2 italic text-gray-600">
                              ({fmtCLP(sty.base_price_clp)})
                            </p>
                          </td>
                          <td className="px-3 py-2 text-sm">
                            {isEditingCommission ? (
                              <select
                                value={rule.type}
                                onChange={(e) =>
                                  setDraft(sty.id, "type", e.target.value)
                                }
                                className="px-2 py-1 text-sm border-2 border-gray-200 rounded-lg"
                              >
                                <option value="fixed_amount">
                                  {t("fichaKine", "fixed_amount")}
                                </option>
                                <option value="percentage">
                                  {t("fichaKine", "percentage")}
                                </option>
                              </select>
                            ) : (
                              <span className="text-gray-700">
                                {t("fichaKine", rule.label)}
                              </span>
                            )}
                          </td>
                          <td className="px-3 py-2 text-sm">
                            {isEditingCommission ? (
                              <input
                                type="number"
                                value={Number(rule.value) || 0}
                                onChange={(e) =>
                                  setDraft(sty.id, "value", e.target.value)
                                }
                                placeholder={
                                  rule.type === "percentage" ? "%" : "$"
                                }
                                className="w-32 px-2 py-1 text-sm border-2 border-gray-200 rounded-lg"
                              />
                            ) : (
                              <span className="text-gray-800">
                                {rule.type === "percentage"
                                  ? `${rule.value || 0}%`
                                  : fmtCLP(Number(rule.value || 0))}
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <p className="mt-3 text-xs text-gray-500">
                * Valor fijo en CLP por sesión; porcentaje aplicado sobre el
                ingreso bruto de la sesión.
              </p>
            </div>
          </div>

          {/* Asignación de Pacientes */}
          <div className="mt-6 border border-gray-200 rounded-lg">
            <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200">
              <div className="flex items-center gap-2 font-semibold text-gray-900">
                <Users className="w-4 h-4 text-blue-600" /> Pacientes asignados
              </div>
            </div>

            <div className="p-4 space-y-3">
              {patientsDraft?.length === 0 ? (
                <div className="text-sm text-gray-500">
                  Aún no hay pacientes asignados a este profesional.
                </div>
              ) : (
                <div className="space-y-2">
                  {patientsDraft?.map((asp) => (
                    <div
                      key={asp.id}
                      className="flex items-center justify-between gap-2 p-2 border border-gray-200 rounded-lg"
                    >
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">
                          {asp.full_name}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          {asp.rut} · {asp.phone}
                        </p>
                      </div>
                      <button
                        onClick={() => unassignPatient(asp.id)}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold border-2 border-red-200 text-red-700 hover:bg-red-50"
                      >
                        <UserMinus className="w-3.5 h-3.5" /> Quitar
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Buscador para asignar */}
              <div className="mt-4">
                <label className="text-xs font-bold text-gray-700">
                  Asignar nuevo paciente
                </label>
                <div className="flex items-center gap-2 px-3 py-2 mt-2 border-2 border-gray-200 rounded-lg focus-within:border-blue-500">
                  <Search className="w-4 h-4 text-gray-400" />
                  <input
                    value={patientQuery}
                    onChange={(e) => setPatientQuery(e.target.value)}
                    placeholder="Buscar por nombre, RUT, fono..."
                    className="w-full text-sm outline-none"
                  />
                </div>
                <div className="mt-3 space-y-2 overflow-auto max-h-48">
                  {availablePatients?.length === 0 ? (
                    <div className="text-xs text-gray-500">
                      {patientQuery
                        ? "Sin resultados disponibles."
                        : "Busca un paciente para asignar"}
                    </div>
                  ) : (
                    availablePatients?.map((avp) => (
                      <div
                        key={avp.id}
                        className="flex items-center justify-between gap-2 p-2 border border-gray-200 rounded-lg"
                      >
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-gray-900 truncate">
                            {avp.full_name}
                          </p>
                          <p className="text-xs text-gray-500 truncate">
                            {avp.rut} · {avp.phone}
                          </p>
                        </div>
                        <button
                          onClick={() => assignPatient(avp.id)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold border-2 border-blue-200 text-blue-700 hover:bg-blue-50"
                        >
                          <UserPlus className="w-3.5 h-3.5" /> Asignar
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
