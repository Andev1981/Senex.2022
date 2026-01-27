import { useForm } from "@inertiajs/react";
import {
  Save,
  X,
  ShieldCheck,
  Database,
  DollarSign,
  Calendar,
  Percent,
  ArrowRight,
  ClipboardList,
  Info,
  ChevronRight,
} from "lucide-react";
import SideModal from "@/components/SideModal";
import { useEffect, useState } from "react";
import PrimaryButton from "@/components/PrimaryButton";
import SecondaryButton from "@/components/SecondaryButton";
import InputPesoChileno from "@/components/InputPesoChileno";

export default function AgreementRuleFormModal({
  show,
  onClose,
  agreement,
  rule,
  plans,
  sessionTypes,
}) {
  const isEdit = !!rule;
  const [plansList, setPlansList] = useState([]);

  const { data, setData, post, put, processing, errors, reset, clearErrors } =
    useForm({
      agreement_id: "",
      id: "",
      session_type_id: "",
      plan_id: "",
      gross_price_clp: 0,
      patient_share_clp: 0,
      insurance_share_clp: 0,
      patient_percentage: 0,
      insurance_percentage: 0,
      start_date: new Date().toISOString().slice(0, 10),
      end_date: "",
      notes: "",
    });

  useEffect(() => {
    // Filtrar los planes por la aseguradora del convenio actual
    if (agreement && plans) {
      const filteredPlans = plans.filter(p => p.insurance_id === agreement.insurance_id);
      setPlansList(filteredPlans);
    }
    
    if (show) {
      if (rule) {
        setData({
          id: rule?.id,
          agreement_id: agreement?.id,
          session_type_id: rule?.session_type_id || "",
          plan_id: rule?.plan_id ? String(rule.plan_id) : "",
          gross_price_clp: rule?.gross_price_clp || 0,
          patient_share_clp: rule?.patient_share_clp || 0,
          insurance_share_clp: rule?.insurance_share_clp || 0,
          patient_percentage: rule?.patient_percentage || 0,
          insurance_percentage: rule?.insurance_percentage || 0,
          start_date: rule?.start_date || new Date().toISOString().slice(0, 10),
          end_date: rule?.end_date || "",
          notes: rule?.notes || "",
        });
      } else {
        reset();
        clearErrors();
        setData("agreement_id", agreement?.id || "");
      }
    }
  }, [agreement, show, rule, plans]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const routeName = isEdit
      ? "agreement.rules.update"
      : "agreement.rules.store";
    const routeParams = isEdit ? rule.id : undefined;
    const method = isEdit ? put : post;

    method(route(routeName, routeParams), {
      onSuccess: () => {
        reset();
        onClose(true); // Indicar éxito para recargar
      },
      preserveScroll: true,
    });
  };

  const handlePriceChange = (field, value) => {
    const newValue = parseInt(value) || 0;
    let updates = { [field]: newValue };
    let gross = field === "gross_price_clp" ? newValue : data.gross_price_clp;
    let patient =
      field === "patient_share_clp" ? newValue : data.patient_share_clp;

    const insuranceShare = Math.max(0, gross - patient);
    updates.insurance_share_clp = insuranceShare;

    let insurancePct = 0;
    let patientPct = 0;
    if (gross > 0) {
      insurancePct = Math.round((insuranceShare / gross) * 100);
      patientPct = 100 - insurancePct;
    }
    updates.insurance_percentage = insurancePct;
    updates.patient_percentage = patientPct;

    setData((prev) => ({ ...prev, ...updates }));
  };

  return (
    <SideModal
      open={show}
      onClose={() => onClose()}
      width="4xl"
      title={isEdit ? "Optimizar Regla" : "Nueva Regla de Cobro"}
      subtitle="Configuración de Tarifas & Porcentajes"
      icon={ShieldCheck}
      footer={
        <>
          <SecondaryButton
            onClick={onClose}
            type="button"
            className="!px-10 !py-4"
          >
            Descartar
          </SecondaryButton>
          <PrimaryButton
            disabled={processing}
            onClick={handleSubmit}
            type="button"
            className="!px-14 !py-4 shadow-xl shadow-brand-primary/20"
          >
            {processing
              ? "Sincronizando..."
              : isEdit
              ? "Actualizar Regla"
              : "Confirmar Tarifa"}
          </PrimaryButton>
        </>
      }
    >
      <div className="space-y-10">
        {/* BLOQUE 1: VÍNCULOS */}
        <div className="space-y-6">
          <h3 className="enterprise-label !text-brand-primary flex items-center gap-2">
            <Database className="w-4 h-4" /> Definición de Cobertura
          </h3>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            <div className="space-y-1">
              <label className="ml-1 enterprise-label opacity-60">
                Servicio / Prestación
              </label>
              <select
                value={data.session_type_id}
                onChange={(e) => setData("session_type_id", e.target.value)}
                className="w-full px-5 py-4 text-sm font-bold transition-all border-gray-100 rounded-2xl focus:ring-brand-primary bg-gray-50/50"
                required
              >
                <option value="">-- Seleccionar Servicio --</option>
                {sessionTypes.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
              {errors.session_type_id && (
                <p className="text-red-500 text-[10px] font-black uppercase mt-1">
                  {errors.session_type_id}
                </p>
              )}
            </div>

            <div className="space-y-1">
              <label className="ml-1 enterprise-label opacity-60">
                Plan Específico (Opcional)
              </label>
              <select
                value={data.plan_id}
                onChange={(e) => setData("plan_id", e.target.value)}
                className="w-full px-5 py-4 text-sm font-bold transition-all border-gray-100 rounded-2xl focus:ring-brand-primary bg-gray-50/50"
              >
                <option value="">-- Regla General (Aplica a toda la aseguradora) --</option>
                {plansList.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.code || 'Sin código'})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* BLOQUE 2: TARIFARIO */}
        <div className="p-8 bg-brand-primary/5 border border-brand-primary/10 rounded-[2.5rem] space-y-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 -mt-16 -mr-16 rounded-full bg-brand-primary/5 blur-2xl"></div>
          <h3 className="enterprise-label !text-brand-primary flex items-center gap-2 relative z-10">
            <DollarSign className="w-4 h-4" /> Estructura de Valores (CLP)
          </h3>

          <div className="relative z-10 grid grid-cols-1 gap-8 md:grid-cols-2">
            <div className="space-y-1">
              <label className="ml-1 enterprise-label">
                Precio Bruto (SII/Convenio)
              </label>
              <InputPesoChileno
                price={data.gross_price_clp}
                onChange={(e) =>
                  handlePriceChange("gross_price_clp", e.target.value)
                }
                className="!rounded-2xl !py-4 !px-5 font-black text-lg bg-white shadow-sm border-gray-100"
              />
            </div>
            <div className="space-y-1">
              <label className="enterprise-label !text-red-600 ml-1">
                Copago Paciente
              </label>
              <InputPesoChileno
                price={data.patient_share_clp}
                onChange={(e) =>
                  handlePriceChange("patient_share_clp", e.target.value)
                }
                className="!rounded-2xl !py-4 !px-5 font-black text-lg bg-white shadow-sm border-red-100 text-red-700"
              />
            </div>
          </div>

          <div className="relative z-10 grid grid-cols-1 gap-6 pt-4 md:grid-cols-3">
            <div className="p-5 bg-white border border-gray-100 shadow-sm rounded-2xl">
              <p className="enterprise-label !text-[8px] opacity-60 mb-1">
                Aporte Isapre/Fonasa
              </p>
              <p className="font-mono text-sm font-black text-green-600">
                ${data.insurance_share_clp.toLocaleString("es-CL")}
              </p>
            </div>
            <div className="p-5 border border-red-100 shadow-sm bg-red-50 rounded-2xl">
              <p className="enterprise-label !text-[8px] text-red-600 mb-1">
                Copago (%)
              </p>
              <p className="font-mono text-sm font-black text-red-700">
                {data.patient_percentage}%
              </p>
            </div>
            <div className="p-5 border shadow-sm bg-brand-secondary/10 rounded-2xl border-brand-secondary/20">
              <p className="enterprise-label !text-[8px] text-brand-primary mb-1">
                Cobertura (%)
              </p>
              <p className="font-mono text-sm font-black text-brand-primary">
                {data.insurance_percentage}%
              </p>
            </div>
          </div>
        </div>

        {/* BLOQUE 3: CRONOLOGÍA & NOTAS */}
        <div className="space-y-6">
          <h3 className="enterprise-label !text-brand-primary flex items-center gap-2">
            <Calendar className="w-4 h-4" /> Vigencia Operativa
          </h3>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            <div className="space-y-1">
              <label className="ml-1 enterprise-label opacity-60">
                Inicio Vigencia
              </label>
              <input
                type="date"
                value={data.start_date}
                onChange={(e) => setData("start_date", e.target.value)}
                className="w-full px-5 py-4 font-mono text-sm font-black border-gray-100 rounded-2xl bg-gray-50 focus:bg-white"
                required
              />
            </div>
            <div className="space-y-1">
              <label className="ml-1 enterprise-label opacity-60">
                Término (Opcional)
              </label>
              <input
                type="date"
                value={data.end_date}
                onChange={(e) => setData("end_date", e.target.value)}
                className="w-full px-5 py-4 font-mono text-sm font-black border-gray-100 rounded-2xl bg-gray-50 focus:bg-white"
              />
            </div>
            <div className="space-y-1 md:col-span-2">
              <label className="ml-1 enterprise-label opacity-60">
                Observaciones de Aplicación
              </label>
              <textarea
                rows="3"
                value={data.notes}
                onChange={(e) => setData("notes", e.target.value)}
                className="w-full px-5 py-4 text-xs font-medium transition-all border-gray-100 shadow-inner resize-none rounded-2xl bg-gray-50/30 focus:bg-white focus:ring-brand-primary"
                placeholder="Glosa interna sobre esta tarifa..."
              />
            </div>
          </div>
        </div>
      </div>
    </SideModal>
  );
}
