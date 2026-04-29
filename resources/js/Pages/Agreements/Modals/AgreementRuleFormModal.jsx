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
      item_id: "",
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
          item_id: rule?.item_id || "",
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
    let pat = field === "patient_share_clp" ? newValue : data.patient_share_clp;
    let ins = field === "insurance_share_clp" ? newValue : data.insurance_share_clp;

    if (field === "gross_price_clp") {
        ins = newValue - pat;
        updates.insurance_share_clp = ins;
    } else if (field === "patient_share_clp") {
        ins = gross - newValue;
        updates.insurance_share_clp = ins;
    } else if (field === "insurance_share_clp") {
        pat = gross - newValue;
        updates.patient_share_clp = pat;
    }

    if (gross > 0) {
        updates.patient_percentage = (pat / gross) * 100;
        updates.insurance_percentage = (ins / gross) * 100;
    }

    setData(prev => ({...prev, ...updates}));
  };

  return (
    <SideModal
      open={show}
      onClose={() => onClose()}
      title={isEdit ? "Editar Regla de Cobertura" : "Nueva Regla de Tarifa"}
      width="3xl"
      footer={
        <div className="flex justify-end gap-3">
          <SecondaryButton onClick={() => onClose()}>Cancelar</SecondaryButton>
          <PrimaryButton onClick={handleSubmit} disabled={processing}>
            <Save className="w-4 h-4 mr-2" />
            {isEdit ? "Guardar Cambios" : "Crear Regla"}
          </PrimaryButton>
        </div>
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
                value={data.item_id}
                onChange={(e) => setData("item_id", e.target.value)}
                className="w-full px-5 py-4 text-sm font-bold transition-all border-gray-100 rounded-2xl focus:ring-brand-primary bg-gray-50/50"
                required
              >
                <option value="">-- Seleccionar Servicio --</option>
                {sessionTypes && sessionTypes.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
              {errors.item_id && (
                <p className="text-red-500 text-[10px] font-black uppercase mt-1">
                  {errors.item_id}
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
                <option value="">Regla General (Aplica a todos los planes)</option>
                {plansList.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} {p.code ? `(${p.code})` : ""}
                  </option>
                ))}
              </select>
              {errors.plan_id && (
                <p className="text-red-500 text-[10px] font-black uppercase mt-1">
                  {errors.plan_id}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* BLOQUE 2: VALORES ECONÓMICOS */}
        <div className="p-8 bg-brand-secondary/5 border border-brand-secondary/10 rounded-[2.5rem] space-y-8">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-brand-primary/10 rounded-xl text-brand-primary">
              <DollarSign className="w-4 h-4" />
            </div>
            <h3 className="enterprise-label !text-brand-primary !mb-0 font-black uppercase tracking-widest">
              Acuerdo Económico
            </h3>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            <div className="space-y-1">
              <label className="ml-1 enterprise-label !text-gray-900">
                Tarifa Bruta Acordada
              </label>
              <InputPesoChileno
                price={data.gross_price_clp}
                onChange={(e) => handlePriceChange("gross_price_clp", e.target.value)}
                className="!rounded-xl !py-3 !px-4 font-black text-sm bg-white shadow-sm border-gray-100"
              />
              <p className="text-[9px] text-gray-400 mt-1 uppercase font-bold italic ml-1">Monto total facturable</p>
            </div>

            <div className="space-y-1">
              <label className="ml-1 enterprise-label !text-brand-primary">
                Aporte Paciente (Copago)
              </label>
              <InputPesoChileno
                price={data.patient_share_clp}
                onChange={(e) => handlePriceChange("patient_share_clp", e.target.value)}
                className="!rounded-xl !py-3 !px-4 font-black text-sm bg-white shadow-sm border-brand-primary/10 text-brand-primary"
              />
              <div className="flex justify-between items-center px-1 mt-1">
                <span className="text-[9px] font-black text-brand-primary uppercase tracking-tighter">Participación</span>
                <span className="text-[10px] font-mono font-black text-brand-primary bg-brand-primary/5 px-1.5 rounded">{Math.round(data.patient_percentage)}%</span>
              </div>
            </div>

            <div className="space-y-1">
              <label className="ml-1 enterprise-label !text-orange-600">
                Aporte Aseguradora
              </label>
              <InputPesoChileno
                price={data.insurance_share_clp}
                onChange={(e) => handlePriceChange("insurance_share_clp", e.target.value)}
                className="!rounded-xl !py-3 !px-4 font-black text-sm bg-white shadow-sm border-orange-100 text-orange-600"
              />
              <div className="flex justify-between items-center px-1 mt-1">
                <span className="text-[9px] font-black text-orange-600 uppercase tracking-tighter">Cobertura</span>
                <span className="text-[10px] font-mono font-black text-orange-600 bg-orange-50 px-1.5 rounded">{Math.round(data.insurance_percentage)}%</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 p-5 bg-white border border-gray-100 shadow-sm rounded-2xl">
            <div className="p-2 text-white bg-green-500 rounded-lg">
                <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
                <p className="text-[10px] font-black uppercase text-gray-900 leading-none mb-1">Cálculo de Proporciones</p>
                <p className="text-[10px] font-bold text-gray-500 italic">
                    El sistema ajusta automáticamente los montos para mantener la integridad de la tarifa bruta.
                </p>
            </div>
          </div>
        </div>

        {/* BLOQUE 3: METADATA */}
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gray-100 rounded-xl text-gray-500">
              <Info className="w-4 h-4" />
            </div>
            <h3 className="enterprise-label !mb-0 text-gray-700 font-black uppercase tracking-widest">
              Información Adicional
            </h3>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-12">
            <div className="md:col-span-12 space-y-1">
              <label className="ml-1 enterprise-label opacity-60">Notas / Comentarios Internos</label>
              <textarea
                value={data.notes}
                onChange={(e) => setData("notes", e.target.value)}
                className="w-full px-5 py-4 text-sm font-medium transition-all border-gray-100 rounded-2xl focus:ring-brand-primary bg-gray-50/50 min-h-[100px] resize-none shadow-inner"
                placeholder="Ej: Tarifa vigente para convenio suscrito en 2024..."
              />
            </div>
          </div>
        </div>
      </div>
    </SideModal>
  );
}
