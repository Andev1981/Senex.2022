import { useState, useMemo, useEffect } from "react";
import axios from "axios"; // 1. Importar Axios
import {
  Mail,
  Percent,
  Phone,
  Save,
  Search,
  UserCog,
  UserMinus,
  Users,
  ChevronDown,
  Loader2, // Icono de carga
} from "lucide-react";
import { fmtCLP } from "@/utils/utils";
import Swal from "sweetalert2"; // Para alertas bonitas
import InputPesoChileno from "@/Components/InputPesoChileno";

export default function DoctorModalForm({
  selectedDoctor,
  setIsModalOpen,
  patients = [],
  getStatusBadge,
}) {
  // ESTADO LOCAL: Copia del doctor para manipularlo instantáneamente
  const [localDoctor, setLocalDoctor] = useState(selectedDoctor);

  const [isEditingCommission, setIsEditingCommission] = useState(false);
  const [isSaving, setIsSaving] = useState(false); // Estado de carga
  const [commissionDraft, setCommissionDraft] = useState({});
  const [patientQuery, setPatientQuery] = useState("");
  const [patientsDraft, setPatientsDraft] = useState([]);

  const [openSection, setOpenSection] = useState("commissions");

  // Sincronizar estado local cuando cambia la prop (al abrir otro doctor)
  useEffect(() => {
    if (selectedDoctor) {
      setLocalDoctor(selectedDoctor); // Actualizamos la copia local
      setPatientsDraft(selectedDoctor.patients || []);
      if (!isEditingCommission) {
        setCommissionDraft({});
      }
    }
  }, [selectedDoctor?.id]); // Solo si cambia el ID del doctor

  // --- LÓGICA DE COMISIONES (Actualizada) ---
  const getRuleDisplay = (summaryItem) => {
    const sessionTypeId = summaryItem.session_type_id;

    // Si estamos editando esa celda, mostramos el borrador
    if (commissionDraft[sessionTypeId]) {
      return { ...commissionDraft[sessionTypeId], is_dirty: true };
    }

    return {
      type: "fixed_amount",
      value: summaryItem.is_customized ? summaryItem.current_value : "",
      price_to_patient: summaryItem.price_to_patient,
      is_customized: summaryItem.is_customized,
      current_value: summaryItem.current_value,
      default_value: summaryItem.default_value,
    };
  };

  const setDraft = (sessionTypeId, value) => {
    setCommissionDraft((prev) => {
      // Nota: Usamos localDoctor.rates_summary para tener siempre la data más fresca
      const originalSummary = localDoctor.rates_summary.find(
        (r) => r.session_type_id === sessionTypeId
      );
      const currentDraft = prev[sessionTypeId] || {
        type: "fixed_amount",
        value: originalSummary.is_customized
          ? originalSummary.current_value
          : "",
      };
      return { ...prev, [sessionTypeId]: { ...currentDraft, value: value } };
    });
  };

  const saveCommissionRules = async () => {
    if (!localDoctor) return;

    setIsSaving(true); // Activar spinner

    const rules = Object.entries(commissionDraft).map(([stId, draft]) => {
      const rawValue = String(draft.value).replace(/[^0-9.]/g, "");
      // Enviamos null si está vacío para que el backend borre el registro
      const numValue = rawValue === "" ? null : Number(rawValue);

      // SOLUCIÓN AL BUG VISUAL (Linea 309): Enviamos el precio base por si acaso el backend lo necesita
      const original = localDoctor.rates_summary.find(
        (r) => r.session_type_id === Number(stId)
      );

      return {
        session_type_id: Number(stId),
        type: "fixed_amount",
        value: numValue,
        base_price_clp: original?.price_to_patient || 0, // Enviamos dato extra
      };
    });

    if (rules.length === 0) {
      setIsEditingCommission(false);
      setIsSaving(false);
      return;
    }

    try {
      // USO DE AXIOS
      const response = await axios.post(
        route("doctors.commission-rules.update", localDoctor.id),
        { rules }
      );

      if (response.data.success) {
        // ACTUALIZACIÓN DE ESTADO LOCAL (Instantánea)
        // Reemplazamos el summary viejo con el nuevo que calculó el backend
        setLocalDoctor((prev) => ({
          ...prev,
          rates_summary: response.data.updated_summary,
        }));

        setIsEditingCommission(false);
        setCommissionDraft({});

        Swal.fire({
          icon: "success",
          title: "Actualizado",
          text: "Las tarifas se han guardado correctamente.",
          timer: 1500,
          showConfirmButton: false,
        });
      }
    } catch (error) {
      console.error(error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudieron guardar los cambios.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  // --- LÓGICA DE PACIENTES (Sin cambios mayores, solo referencias a localDoctor) ---
  const assignedPatientIds = new Set(patientsDraft.map((p) => p.id));
  const availablePatients = useMemo(() => {
    if (!localDoctor) return [];
    return patients.filter(
      (p) =>
        !assignedPatientIds.has(p.id) &&
        (patientQuery.trim().length === 0 ||
          [p.name, p.rut, p.phone]
            .join(" ")
            .toLowerCase()
            .includes(patientQuery.toLowerCase()))
    );
  }, [localDoctor, patientQuery, patients, patientsDraft]);

  // --- LÓGICA DE PACIENTES CON AXIOS ---

  const assignPatient = async (patientId) => {
    if (!localDoctor) return;

    // 1. Buscamos el objeto paciente completo en la lista global (props)
    //    para poder agregarlo visualmente a la lista local.
    const patientObj = patients.find((p) => p.id === patientId);
    if (!patientObj) return;

    try {
      // 2. Llamada asíncrona al Backend
      const response = await axios.post(
        route("doctors.patients.assign", localDoctor.id),
        {
          patient_id: patientId,
        }
      );

      // 3. Si el backend dice OK...
      if (response.data.success) {
        // Actualizamos la lista visualmente al instante
        setPatientsDraft((prev) => [...prev, patientObj]);
        setPatientQuery(""); // Limpiamos el buscador

        // Feedback visual suave (Toast)
        const Toast = Swal.mixin({
          toast: true,
          position: "top-end",
          showConfirmButton: false,
          timer: 2000,
          timerProgressBar: true,
          didOpen: (toast) => {
            toast.onmouseenter = Swal.stopTimer;
            toast.onmouseleave = Swal.resumeTimer;
          },
        });
        Toast.fire({
          icon: "success",
          title: "Paciente asignado",
        });
      }
    } catch (error) {
      console.error(error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudo asignar el paciente. Intenta nuevamente.",
      });
    }
  };

  const unassignPatient = async (patientId) => {
    if (!localDoctor) return;

    try {
      // 1. Llamada DELETE al backend
      const response = await axios.delete(
        route("doctors.patients.unassign", [localDoctor.id, patientId])
      );

      // 2. Si el backend dice OK...
      if (response.data.success) {
        // Filtramos la lista local para quitar al paciente eliminado
        setPatientsDraft((prev) => prev.filter((p) => p.id !== patientId));

        // Feedback visual suave
        const Toast = Swal.mixin({
          toast: true,
          position: "top-end",
          showConfirmButton: false,
          timer: 2000,
        });
        Toast.fire({
          icon: "success",
          title: "Paciente desvinculado",
        });
      }
    } catch (error) {
      console.error(error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudo desvincular al paciente.",
      });
    }
  };

  const getAccordionClasses = (sectionName) => {
    const isActive = openSection === sectionName;
    return `
      border rounded-xl transition-all duration-300 ease-in-out overflow-hidden flex flex-col
      ${
        isActive
          ? "border-blue-400 ring-4 ring-blue-50 shadow-lg flex-1 min-h-0 z-10"
          : "border-gray-200 bg-white flex-none opacity-90 hover:opacity-100 hover:border-gray-300"
      }
    `;
  };

  return (
    <div className="p-5 bg-white border border-gray-200 shadow-sm rounded-xl h-full flex flex-col overflow-hidden">
      {!localDoctor ? (
        <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
          <UserCog className="w-12 h-12 mb-3 text-gray-200" />
          <p>Selecciona un profesional de la lista</p>
        </div>
      ) : (
        <>
          {/* HEADER */}
          <div className="mb-5 flex-none">
            <h3 className="flex items-center gap-2 mb-4 text-lg font-bold text-gray-900">
              <UserCog className="w-5 h-5 text-blue-600" /> Ficha del
              Profesional
              {getStatusBadge(localDoctor.branch_status)}
            </h3>

            <div className="flex items-start gap-3">
              <div className="flex items-center justify-center w-14 h-14 text-xl font-bold text-white rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-sm">
                {localDoctor.name.charAt(0)}
                {localDoctor.last_name.charAt(0)}
              </div>
              <div>
                <h4 className="font-bold text-gray-900 text-lg leading-tight">
                  {localDoctor.name} {localDoctor.last_name}
                </h4>
                <p className="text-sm text-gray-500 font-medium">
                  {localDoctor.speciality}
                </p>
                <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-sm text-gray-500">
                  <span className="flex items-center gap-1">
                    <Mail className="w-3 h-3" /> {localDoctor.email}
                  </span>
                  <span className="flex items-center gap-1">
                    <Phone className="w-3 h-3" /> {localDoctor.phone}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex-1 flex flex-col gap-3 min-h-0 pb-1">
            {/* ACORDEÓN COMISIONES */}
            <div className={getAccordionClasses("commissions")}>
              <button
                onClick={() => setOpenSection("commissions")}
                className={`w-full flex items-center justify-between px-4 py-3 transition-colors flex-none
                        ${
                          openSection === "commissions"
                            ? "bg-blue-50/50 text-blue-800"
                            : "bg-gray-50 hover:bg-gray-100 text-gray-700"
                        }`}
              >
                <div className="flex items-center gap-2 font-semibold text-sm">
                  <Percent
                    className={`w-4 h-4 ${
                      openSection === "commissions"
                        ? "text-blue-600"
                        : "text-gray-400"
                    }`}
                  />
                  Estructura de Comisiones
                </div>
                <ChevronDown
                  className={`w-5 h-5 transition-transform duration-300 ${
                    openSection === "commissions"
                      ? "rotate-180 text-blue-500"
                      : "text-gray-400"
                  }`}
                />
              </button>

              {openSection === "commissions" && (
                <div className="flex-1 flex flex-col min-h-0 bg-white animate-in slide-in-from-top-2 duration-200">
                  <div className="flex justify-end px-4 py-2 border-b border-gray-100 bg-white/50 backdrop-blur-sm flex-none">
                    {!isEditingCommission ? (
                      <button
                        onClick={() => setIsEditingCommission(true)}
                        className="text-xs font-medium px-3 py-1.5 rounded-lg border border-indigo-200 text-indigo-700 bg-indigo-50 hover:bg-indigo-100 transition-colors"
                      >
                        Editar Tarifas
                      </button>
                    ) : (
                      <div className="flex items-center gap-2">
                        <button
                          disabled={isSaving}
                          onClick={() => {
                            setIsEditingCommission(false);
                            setCommissionDraft({});
                          }}
                          className="text-xs font-medium px-3 py-1.5 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
                        >
                          Cancelar
                        </button>
                        <button
                          disabled={isSaving}
                          onClick={saveCommissionRules}
                          className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm transition-colors disabled:opacity-50"
                        >
                          {isSaving ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Save className="w-3.5 h-3.5" />
                          )}
                          {isSaving ? "Guardando..." : "Guardar"}
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="flex-1 overflow-y-auto">
                    <table className="w-full text-sm text-left">
                      <thead className="text-xs text-gray-500 uppercase bg-gray-50 sticky top-0 z-10 shadow-sm">
                        <tr>
                          <th className="px-4 py-3 font-semibold bg-gray-50">
                            Prestación
                          </th>
                          <th className="px-4 py-3 font-semibold text-center w-28 bg-gray-50">
                            Tipo
                          </th>
                          <th className="px-4 py-3 font-semibold text-right w-36 bg-gray-50">
                            {isEditingCommission
                              ? "Tarifa Personal"
                              : "Valor Pago"}
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {/* USAMOS localDoctor PARA RENDERIZAR */}
                        {localDoctor.rates_summary?.map((summaryItem) => {
                          const rule = getRuleDisplay(summaryItem);

                          // CORRECCIÓN VISUAL: price_to_patient a veces viene como string '20000' o numero.
                          // Aseguramos que fmtCLP reciba número.
                          const basePrice = Number(
                            summaryItem.price_to_patient ||
                              summaryItem.base_price_clp ||
                              0
                          );

                          return (
                            <tr
                              key={summaryItem.session_type_id}
                              className="hover:bg-gray-50 group"
                            >
                              <td className="px-4 py-2.5">
                                <div className="font-medium text-gray-900">
                                  {summaryItem.name}
                                </div>
                                {/* Aquí estaba el error visual (309-311): Ahora usamos basePrice seguro */}
                                <div className="flex flex-wrap gap-x-2 gap-y-0.5 text-xs mt-0.5">
                                  {/* 1. Lo que paga el paciente */}
                                  <span
                                    className="text-gray-500"
                                    title="Precio Cobrado al Paciente"
                                  >
                                    Cobro: {fmtCLP(basePrice)}
                                  </span>

                                  <span className="text-gray-300 hidden sm:inline">
                                    |
                                  </span>

                                  {/* 2. Lo que paga la empresa normalmente (TU NUEVO DATO) */}
                                  <span
                                    className="text-indigo-400 font-medium"
                                    title="Pago Estándar definido en la Ficha del Servicio"
                                  >
                                    Base Kine:{" "}
                                    {fmtCLP(summaryItem.default_value)}
                                  </span>
                                </div>
                              </td>

                              <td className="px-4 py-2.5 text-center">
                                <span className="text-[10px] uppercase font-bold text-gray-500 bg-gray-100 px-2 py-1 rounded border border-gray-200">
                                  Monto Fijo
                                </span>
                              </td>
                              <td className="px-4 py-2.5 text-right align-top">
                                {isEditingCommission ? (
                                  <div className="flex flex-col items-end relative group">
                                    {/* COMPONENTE DE PESO CHILENO INTEGRADO */}
                                    <InputPesoChileno
                                      // Usamos 'price' porque así se llama la prop en tu componente
                                      price={rule.value}
                                      // Manejador de cambios (tu componente devuelve {target: {value: rawValue}})
                                      onChange={(e) =>
                                        setDraft(
                                          summaryItem.session_type_id,
                                          e.target.value
                                        )
                                      }
                                      // El placeholder muestra la herencia
                                      placeholder={
                                        summaryItem.default_value > 0
                                          ? fmtCLP(summaryItem.default_value)
                                          : "$0"
                                      }
                                      // Mismos estilos dinámicos que tenías, adaptados
                                      className={`w-32 text-right text-sm border transition-all duration-200 rounded-md py-1.5 px-2.5 outline-none focus:ring-2 
          ${
            rule.value
              ? "border-blue-300 bg-blue-50 text-blue-700 font-bold focus:ring-blue-200"
              : "border-gray-200 bg-white text-gray-900 focus:border-blue-400 focus:ring-blue-100 placeholder:text-gray-400"
          }`}
                                    />

                                    <div className="mt-1 mr-1">
                                      {rule.value ? (
                                        <span className="flex items-center gap-1 text-[10px] font-semibold text-blue-600 bg-blue-100 px-1.5 py-0.5 rounded-full animate-in fade-in zoom-in duration-200">
                                          Personalizado
                                        </span>
                                      ) : (
                                        <span className="text-[10px] text-gray-400 italic flex items-center gap-1">
                                          {summaryItem.default_value > 0
                                            ? `Hereda: ${fmtCLP(
                                                summaryItem.default_value
                                              )}`
                                            : "Sin comisión base"}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                ) : (
                                  /* MODO LECTURA (Se mantiene igual) */
                                  <div className="flex flex-col items-end justify-center h-full">
                                    {!rule.is_customized &&
                                    (!summaryItem.default_value ||
                                      summaryItem.default_value === 0) ? (
                                      <span className="text-sm text-gray-400 italic">
                                        Sin valor definido
                                      </span>
                                    ) : (
                                      <span
                                        className={`text-sm font-medium tracking-tight ${
                                          rule.is_customized
                                            ? "text-blue-700"
                                            : "text-gray-600"
                                        }`}
                                      >
                                        {fmtCLP(
                                          rule.is_customized
                                            ? rule.current_value
                                            : summaryItem.default_value
                                        )}
                                      </span>
                                    )}

                                    <div className="mt-0.5">
                                      {rule.is_customized ? (
                                        <span className="text-[10px] font-bold text-blue-500 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100">
                                          Personalizado
                                        </span>
                                      ) : summaryItem.default_value > 0 ? (
                                        <span className="text-[10px] text-gray-400 bg-gray-50 px-1.5 py-0.5 rounded border border-gray-100">
                                          Estándar
                                        </span>
                                      ) : (
                                        <span className="text-[10px] text-orange-600 bg-orange-50 px-1.5 py-0.5 rounded border border-orange-100 font-medium">
                                          Configurar
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            {/* ACORDEÓN PACIENTES */}
            <div className={getAccordionClasses("patients")}>
              {/* ... (Tu código de pacientes se mantiene igual, usando patientsDraft) ... */}
              {/* Copia el bloque de pacientes del código anterior, ya funciona bien */}
              <button
                onClick={() => setOpenSection("patients")}
                className={`w-full flex items-center justify-between px-4 py-3 transition-colors flex-none border-b border-gray-100
                    ${
                      openSection === "patients"
                        ? "bg-blue-50/50 text-blue-800"
                        : "bg-gray-50 hover:bg-gray-100 text-gray-700"
                    }`}
              >
                <div className="flex items-center gap-2 font-semibold text-sm">
                  <Users
                    className={`w-4 h-4 ${
                      openSection === "patients"
                        ? "text-blue-600"
                        : "text-gray-400"
                    }`}
                  />
                  Pacientes Asignados
                  <span className="ml-2 bg-gray-200 text-gray-600 text-xs py-0.5 px-2 rounded-full">
                    {patientsDraft.length}
                  </span>
                </div>
                <ChevronDown
                  className={`w-5 h-5 transition-transform duration-300 ${
                    openSection === "patients"
                      ? "rotate-180 text-blue-500"
                      : "text-gray-400"
                  }`}
                />
              </button>
              {openSection === "patients" && (
                <div className="flex-1 flex flex-col min-h-0 bg-white p-4 animate-in slide-in-from-bottom-2 duration-200">
                  {/* Reutiliza tu lógica de renderizado de pacientes aquí */}
                  {/* Buscador + Lista */}
                  <div className="relative mb-3 flex-none">
                    <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                    <input
                      className="w-full pl-9 pr-4 py-2 text-sm border-gray-200 rounded-xl focus:ring-blue-500 focus:border-blue-500 bg-gray-50 focus:bg-white transition-colors"
                      placeholder="Buscar paciente para asignar..."
                      value={patientQuery}
                      onChange={(e) => setPatientQuery(e.target.value)}
                    />
                    {patientQuery && availablePatients.length > 0 && (
                      <div className="absolute top-full mt-1 left-0 right-0 bg-white border border-gray-200 rounded-xl shadow-xl max-h-48 overflow-y-auto z-20">
                        {availablePatients.map((p) => (
                          <button
                            key={p.id}
                            onClick={() => assignPatient(p.id)}
                            className="w-full text-left px-4 py-2.5 hover:bg-blue-50 text-sm flex justify-between items-center group border-b border-gray-50 last:border-0"
                          >
                            <div>
                              <p className="font-medium text-gray-800">
                                {p.full_name}
                              </p>
                              <p className="text-xs text-gray-500">{p.rut}</p>
                            </div>
                            <span className="text-xs text-blue-600 font-bold opacity-0 group-hover:opacity-100 transition-opacity bg-blue-100 px-2 py-1 rounded">
                              Asignar
                            </span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 overflow-y-auto border border-gray-100 rounded-xl bg-gray-50/50 p-2 space-y-2">
                    {patientsDraft.map((p) => (
                      <div
                        key={p.id}
                        className="flex items-center justify-between p-3 bg-white border border-gray-200 shadow-sm rounded-lg group hover:border-blue-300 transition-all"
                      >
                        <div>
                          <p className="text-sm font-semibold text-gray-900">
                            {p.full_name}
                          </p>
                          <p className="text-xs text-gray-500">{p.rut}</p>
                        </div>
                        <button
                          onClick={() => unassignPatient(p.id)}
                          className="opacity-0 group-hover:opacity-100 p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-all"
                        >
                          <UserMinus className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
