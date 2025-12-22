import React, { useEffect, useState } from "react";
import { Head, useForm, router } from "@inertiajs/react";
import { Plus, Save, Trash2, Info, ListCheck } from "lucide-react";
import { v4 as uuidv4 } from "uuid"; // Para IDs temporales en el frontend

export default function PlanEditForm({ editingInsurance, plan, sessionTypes }) {
  const isEdit = !!plan;
  const [filteredSessionTypes, setFilteredSessionTypes] =
    useState(sessionTypes);

  const { data, setData, post, put, processing, errors, clearErrors } = useForm(
    {
      // Identificadores y Tipo
      name: plan?.name || "",
      code: plan?.code || "",
      type: plan?.type || "external", // internal o external
      insurance_id: plan?.insurance_id || editingInsurance?.id,

      // Reglas de Negocio
      billing_type: plan?.billing_type || "prepaid",
      insurance_policy_type: plan?.insurance_policy_type || "complementary",

      // Precios y Matrícula
      price: plan?.price || 0,
      initial_fee: plan?.initial_fee || 0,

      // Vigencia y Atributos
      valid_months: plan?.valid_months || 0,
      start_date: plan?.start_date || "",
      end_date: plan?.end_date || "",
      is_family: plan?.is_family || false,
      is_active: plan?.is_active ?? 1,
      description: plan?.description || "",
      coverage_percentage: plan?.coverage_percentage || 100,

      // Contenido del Plan (Pivot)
      content:
        plan?.session_types?.map((st) => ({
          id: uuidv4(),
          session_type_id: st.id.toString(),
          max_sessions: st.pivot.max_sessions,
          coverage_percentage: st.pivot.coverage_percentage || 100,
        })) || [],
    }
  );

  const [showInitialFeeInput, setShowInitialFeeInput] = useState(
    data.initial_fee > 0
  );
  // Filtrado para evitar servicios duplicados
  useEffect(() => {
    const selectedIds = data.content
      .map((item) => item.session_type_id)
      .filter((id) => id !== "");
    const newFilteredList = sessionTypes.filter(
      (s) => !selectedIds.includes(s.id.toString())
    );
    setFilteredSessionTypes(newFilteredList);
  }, [data.content, sessionTypes]);

  const addContentItem = () => {
    setData("content", [
      ...data.content,
      {
        id: uuidv4(),
        session_type_id: "",
        max_sessions: 1,
        coverage_percentage: 100,
      },
    ]);
    clearErrors("content");
  };

  const updateContentItem = (index, field, value) => {
    const newContent = [...data.content];
    newContent[index][field] = value;
    setData("content", newContent);
  };

  const removeContentItem = (id) => {
    setData(
      "content",
      data.content.filter((item) => item.id !== id)
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (
      data.type === "internal" &&
      data.billing_type === "prepaid" &&
      data.content.length === 0
    ) {
      alert("Un Plan Prepago debe incluir al menos un servicio.");
      return;
    }
    const method = isEdit ? put : post;
    method(
      route(
        isEdit ? "plans.update" : "plans.store",
        isEdit ? plan.id : undefined
      )
    );
  };

  return (
    <div>
      <div className="flex items-center justify-between p-6 bg-white rounded-lg shadow mb-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-12 h-12 shadow-lg bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl">
            <ListCheck className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {editingInsurance && "Planes: " + editingInsurance?.name}
            </h1>
            <p className="text-sm text-gray-600">Gestión de planes</p>
          </div>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="px-6 py-4 space-y-6 bg-white border border-gray-100 rounded-lg shadow-sm"
      >
        {/* SECCIÓN 1: DEFINICIÓN ESTRATÉGICA */}
        <div className="grid grid-cols-2 gap-6 p-4 bg-gray-100 rounded-xl">
          <label className="block">
            <span className="text-sm font-bold text-gray-700">
              Tipo de Plan
            </span>
            <select
              value={data.type}
              onChange={(e) => setData("type", e.target.value)}
              className="block w-full mt-1 border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="external">Externo (Aseguradora/Fonasa)</option>
              <option value="internal">Interno (Producto de la Clínica)</option>
            </select>
          </label>

          <label className="block">
            <span className="text-sm font-bold text-gray-700">
              Modelo de Cobro
            </span>
            <select
              value={data.billing_type}
              onChange={(e) => setData("billing_type", e.target.value)}
              className="block w-full mt-1 border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="prepaid">Prepago (Se paga pack al inicio)</option>
              <option value="membership">Membresía (Cuota + Descuento)</option>
              <option value="postpaid">Convenio (Pago por Empresa)</option>
            </select>
          </label>
        </div>

        {/* SECCIÓN 2: INTEGRACIÓN CON SEGUROS */}
        <div className="grid grid-cols-2 gap-6 p-4 bg-gray-100 rounded-xl">
          <label className="block">
            <span className="flex items-center text-sm font-medium text-gray-700">
              Relación con Seguros Primarios{" "}
              <Info className="w-3 h-3 ml-1 text-gray-400" />
            </span>
            <select
              value={data.insurance_policy_type}
              onChange={(e) => setData("insurance_policy_type", e.target.value)}
              className="block w-full mt-1 border-gray-300 rounded-md shadow-sm"
            >
              <option value="complementary">
                Complementario (Cubre Copago Fonasa)
              </option>
              <option value="standalone">
                Precio Fijo (Independiente del Seguro)
              </option>
            </select>
          </label>

          <div className="flex items-center pt-6 space-x-3">
            <input
              type="checkbox"
              id="is_family"
              checked={data.is_family}
              onChange={(e) => setData("is_family", e.target.checked)}
              className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
            />
            <label
              htmlFor="is_family"
              className="text-sm font-medium text-gray-700"
            >
              ¿Es un Plan Familiar / Multiusuario?
            </label>
          </div>
        </div>

        {/* SECCIÓN 3: PRECIOS Y MATRÍCULA (SÓLO INTERNOS) */}
        {data.type === "internal" && (
          <div className="grid grid-cols-3 gap-4 p-4 border border-indigo-100 rounded-md bg-indigo-50">
            <label className="block">
              <span className="text-xs font-bold text-indigo-800 uppercase">
                Precio del Plan (CLP)
              </span>
              <input
                type="number"
                value={data.price}
                onChange={(e) => setData("price", e.target.value)}
                className="block w-full mt-1 border-indigo-200 rounded-md shadow-sm focus:ring-indigo-500"
              />
            </label>

            <label className="block">
              <span className="text-xs font-bold text-indigo-800 uppercase">
                Vigencia (Meses)
              </span>
              <input
                type="number"
                value={data.valid_months}
                onChange={(e) => setData("valid_months", e.target.value)}
                className="block w-full mt-1 border-indigo-200 rounded-md shadow-sm focus:ring-indigo-500"
              />
            </label>

            <div className="space-y-1">
              <div className="flex items-center space-x-4">
                <label className="flex items-center text-sm font-medium text-gray-700">
                  <input
                    type="checkbox"
                    checked={showInitialFeeInput}
                    onChange={(e) => {
                      const checked = e.target.checked;
                      setShowInitialFeeInput(checked);
                      if (!checked) setData("initial_fee", 0); // Si desmarca, reseteamos a 0
                    }}
                    className="mr-2 border-gray-300 rounded"
                  />
                  ¿Aplica cobro de incorporación/matrícula?
                </label>

                {showInitialFeeInput && (
                  <input
                    type="number"
                    placeholder="Monto $"
                    value={data.initial_fee}
                    onChange={(e) => setData("initial_fee", e.target.value)}
                    className="w-32 text-sm border-gray-300 rounded-md shadow-sm focus:ring-indigo-500"
                  />
                )}
              </div>
            </div>
          </div>
        )}

        {/* SECCIÓN 4: CONTENIDO DEL PAQUETE */}
        {data.type === "internal" && data.billing_type === "prepaid" && (
          <div className="p-4 pt-4 space-y-4 bg-purple-100 border-t rounded-xl">
            <div className="flex items-center justify-between">
              <h3 className="flex items-center text-sm font-bold text-gray-800">
                Servicios Incluidos en el Pack
              </h3>
              <button
                type="button"
                onClick={addContentItem}
                className="flex items-center text-xs font-bold text-indigo-600 hover:text-indigo-800"
              >
                <Plus className="w-4 h-4 mr-1" /> AGREGAR PRESTACIÓN
              </button>
            </div>

            <div className="space-y-2">
              {data.content.map((item, index) => (
                <div
                  key={item.id}
                  className="grid items-end grid-cols-12 gap-3 p-3 bg-white border border-gray-200 rounded-md"
                >
                  <div className="col-span-6">
                    <span className="text-[10px] font-bold text-gray-500 uppercase">
                      Servicio
                    </span>
                    <select
                      value={item.session_type_id}
                      onChange={(e) =>
                        updateContentItem(
                          index,
                          "session_type_id",
                          e.target.value
                        )
                      }
                      className="block w-full mt-1 text-sm border-gray-300 rounded-md"
                    >
                      <option value="">Seleccione...</option>
                      {filteredSessionTypes.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name}
                        </option>
                      ))}
                      {/* Opción seleccionada por si ya no está en la lista filtrada */}
                      {item.session_type_id &&
                        !filteredSessionTypes.find(
                          (s) => s.id.toString() === item.session_type_id
                        ) && (
                          <option value={item.session_type_id}>
                            {
                              sessionTypes.find(
                                (s) => s.id.toString() === item.session_type_id
                              )?.name
                            }
                          </option>
                        )}
                    </select>
                  </div>
                  <div className="col-span-2">
                    <span className="text-[10px] font-bold text-gray-500 uppercase text-center block">
                      Cant.
                    </span>
                    <input
                      type="number"
                      value={item.max_sessions}
                      onChange={(e) =>
                        updateContentItem(index, "max_sessions", e.target.value)
                      }
                      className="block w-full mt-1 text-sm text-center border-gray-300 rounded-md"
                    />
                  </div>
                  <div className="col-span-3">
                    <span className="text-[10px] font-bold text-gray-500 uppercase text-center block">
                      Cobertura (%)
                    </span>
                    <input
                      type="number"
                      value={item.coverage_percentage}
                      onChange={(e) =>
                        updateContentItem(
                          index,
                          "coverage_percentage",
                          e.target.value
                        )
                      }
                      className="block w-full mt-1 text-sm text-center border-gray-300 rounded-md"
                    />
                  </div>
                  <div className="col-span-1 text-center">
                    <button
                      type="button"
                      onClick={() => removeContentItem(item.id)}
                      className="text-red-400 transition-colors hover:text-red-600"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SECCIÓN 5: INFORMACIÓN TÉCNICA (NOMBRE, CÓDIGO, DESCRIPCIÓN) */}
        <div className="grid grid-cols-3 gap-4 pt-4 border-t">
          <div className="col-span-2 space-y-4">
            <label className="block">
              <span className="text-sm font-medium text-gray-700">
                Nombre Público del Plan
              </span>
              <input
                type="text"
                value={data.name}
                onChange={(e) => setData("name", e.target.value)}
                className="block w-full mt-1 border-gray-300 rounded-md shadow-sm focus:ring-indigo-500"
                required
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-gray-700">
                Descripción / Notas Internas
              </span>
              <textarea
                rows="2"
                value={data.description}
                onChange={(e) => setData("description", e.target.value)}
                className="block w-full mt-1 text-sm border-gray-300 rounded-md shadow-sm"
                placeholder="Ej: Solo aplicable para pacientes Fonasa B y C..."
              ></textarea>
            </label>
          </div>
          <div className="col-span-1 space-y-4">
            <label className="block">
              <span className="text-sm font-medium text-gray-700">
                Código Interno
              </span>
              <input
                type="text"
                value={data.code}
                onChange={(e) => setData("code", e.target.value)}
                className="block w-full mt-1 border-gray-300 rounded-md shadow-sm"
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-gray-700">Estado</span>
              <select
                value={data.is_active}
                onChange={(e) => setData("is_active", e.target.value)}
                className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm font-bold ${
                  data.is_active ? "text-green-600" : "text-red-600"
                }`}
              >
                <option value={1}>ACTIVO</option>
                <option value={0}>INACTIVO</option>
              </select>
            </label>
          </div>
        </div>

        {/* SECCIÓN 6: VENTANA DE DISPONIBILIDAD (OFERTA TEMPORAL) */}
        <div className="p-4 border rounded-md bg-amber-50 border-amber-100">
          <div className="flex items-center mb-3">
            <h3 className="flex items-center text-sm font-bold uppercase text-amber-800">
              Vigencia de la Oferta / Disponibilidad en Catálogo
            </h3>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <label className="block">
              <span className="text-xs font-semibold text-amber-900">
                Disponible desde:
              </span>
              <input
                type="date"
                value={data.start_date}
                onChange={(e) => setData("start_date", e.target.value)}
                className="block w-full mt-1 text-sm rounded-md shadow-sm border-amber-200 focus:ring-amber-500 focus:border-amber-500"
              />
              <p className="mt-1 text-[10px] text-amber-700">
                Si se deja vacío, el plan estará disponible de inmediato.
              </p>
            </label>

            <label className="block">
              <span className="text-xs font-semibold text-amber-900">
                Disponible hasta (Vencimiento de oferta):
              </span>
              <input
                type="date"
                value={data.end_date}
                onChange={(e) => setData("end_date", e.target.value)}
                className="block w-full mt-1 text-sm rounded-md shadow-sm border-amber-200 focus:ring-amber-500 focus:border-amber-500"
              />
              <p className="mt-1 text-[10px] text-amber-700">
                Después de esta fecha, el plan desaparecerá del catálogo de
                ventas.
              </p>
            </label>
          </div>
        </div>

        {/* FOOTER: ACCIONES */}
        <div className="flex justify-end pt-6 mt-4 border-t">
          <button
            type="submit"
            disabled={processing}
            className="flex items-center px-10 py-3 text-base font-bold text-white transition-all bg-indigo-600 rounded-lg shadow-md hover:bg-indigo-700 active:scale-95 disabled:bg-gray-400"
          >
            {processing ? (
              "Guardando..."
            ) : (
              <>
                <Save className="w-5 h-5 mr-2" />
                {isEdit ? "ACTUALIZAR PLAN" : "CONFIRMAR Y CREAR PLAN"}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
