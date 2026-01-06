import { useForm } from "@inertiajs/react";
import Modal from "@/Components/Modal";
import { 
  Calendar, 
  User, 
  Clock, 
  AlertCircle,
  Briefcase,
  NotebookText,
  Calculator,
  ArrowRight
} from "lucide-react";
import PrimaryButton from "@/Components/PrimaryButton";
import SecondaryButton from "@/Components/SecondaryButton";
import { useEffect, useState } from "react";
import axios from "axios";

export default function PayrollFormModal({ show, onClose, doctors }) {
  const { data, setData, post, processing, errors, reset, setError } = useForm({
    doctor_id: "",
    period_start: "",
    period_end: "",
  });

  const [step, setStep] = useState(1); // 1: Input, 2: Preview
  const [simulation, setSimulation] = useState(null);
  const [simulating, setSimulating] = useState(false);

  useEffect(() => {
    if (!show) {
      reset();
      setStep(1);
      setSimulation(null);
    }
  }, [show]);

  const handleSimulate = async (e) => {
    e.preventDefault();
    if (!data.doctor_id || !data.period_start || !data.period_end) {
        // Basic validation triggers browser defaults or manual set
        return; 
    }

    setSimulating(true);
    try {
        const response = await axios.post(route('payrolls.preview'), data);
        setSimulation(response.data);
        setStep(2);
    } catch (err) {
        console.error(err);
        if (err.response && err.response.data && err.response.data.errors) {
            // Map validation errors to useForm errors
            Object.keys(err.response.data.errors).forEach(key => {
                setError(key, err.response.data.errors[key][0]);
            });
        }
    } finally {
        setSimulating(false);
    }
  };

  const handleConfirm = () => {
    post(route("payrolls.store"), {
      onSuccess: () => onClose(),
      preserveScroll: true,
    });
  };

  const formatCurrency = (val) => new Intl.NumberFormat('es-CL', {style: 'currency', currency: 'CLP'}).format(val);

  return (
    <Modal
      open={show}
      onClose={onClose}
      maxWidth={step === 2 ? "lg" : "2xl"} // Narrower for summary
      title={step === 1 ? "Nuevo Corte de Honorarios" : "Confirmar Liquidación"}
      subtitle={step === 1 ? "Generación masiva de liquidación por período" : "Resumen preliminar de atenciones"}
      icon={step === 1 ? NotebookText : Calculator}
      footer={
        step === 1 ? (
            <>
              <SecondaryButton onClick={onClose} className="!px-10 !py-4">Cancelar</SecondaryButton>
              <PrimaryButton disabled={simulating} onClick={handleSimulate} className="!px-14 !py-4 shadow-xl shadow-brand-primary/20 flex items-center gap-2">
                {simulating ? 'Calculando...' : 'Simular Corte'} <ArrowRight className="w-4 h-4 opacity-50" />
              </PrimaryButton>
            </>
        ) : (
            <>
              <SecondaryButton onClick={() => setStep(1)} className="!px-10 !py-4">
                {simulation?.total_sessions > 0 ? 'Volver' : 'Editar Búsqueda'}
              </SecondaryButton>
              {simulation?.total_sessions > 0 && (
                  <PrimaryButton disabled={processing} onClick={handleConfirm} className="!px-14 !py-4 shadow-xl shadow-brand-primary/20 bg-green-600 hover:bg-green-700 focus:ring-green-500">
                    {processing ? 'Generando...' : 'Confirmar y Generar'}
                  </PrimaryButton>
              )}
            </>
        )
      }
    >
        {step === 1 && (
            <div className="space-y-10">
                <div className="p-6 bg-blue-50 border border-blue-100 rounded-2xl flex items-start gap-4">
                    <div className="p-2 bg-white rounded-xl text-blue-500 shadow-sm shrink-0">
                        <AlertCircle className="w-5 h-5" />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-blue-700 uppercase tracking-widest leading-none mb-1">Nota Importante</p>
                        <p className="text-[11px] font-medium text-blue-600 leading-relaxed">
                            Este proceso auditará todas las sesiones finalizadas en el rango seleccionado que no hayan sido liquidadas previamente.
                        </p>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="space-y-2">
                        <label className="enterprise-label ml-1 opacity-60 flex items-center gap-2">
                            <User className="w-3.5 h-3.5" /> Profesional a Liquidar
                        </label>
                        <select
                            value={data.doctor_id}
                            onChange={(e) => setData("doctor_id", e.target.value)}
                            className="w-full px-5 py-4 rounded-2xl border-gray-100 bg-gray-50 focus:bg-white focus:ring-brand-primary font-black text-sm uppercase shadow-inner transition-all"
                            required
                        >
                            <option value="">-- SELECCIONAR KINESIÓLOGO --</option>
                            {doctors.map((d) => (
                                <option key={d.id} value={d.id}>{d.name} {d.last_name}</option>
                            ))}
                        </select>
                        {errors.doctor_id && <p className="text-red-500 text-[10px] font-black uppercase mt-1 ml-1">{errors.doctor_id}</p>}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4 border-t border-gray-50 mt-4">
                        <div className="space-y-2">
                            <label className="enterprise-label ml-1 opacity-60 flex items-center gap-2">
                                <Calendar className="w-3.5 h-3.5" /> Desde (Inicio)
                            </label>
                            <input
                                type="date"
                                value={data.period_start}
                                onChange={(e) => setData("period_start", e.target.value)}
                                className="w-full rounded-2xl border-gray-100 py-4 px-5 font-mono font-black text-gray-700 bg-white shadow-sm focus:ring-brand-primary transition-all"
                                required
                            />
                            {errors.period_start && <p className="text-red-500 text-[10px] font-black uppercase mt-1 ml-1">{errors.period_start}</p>}
                        </div>

                        <div className="space-y-2">
                            <label className="enterprise-label ml-1 opacity-60 flex items-center gap-2">
                                <Clock className="w-3.5 h-3.5" /> Hasta (Cierre)
                            </label>
                            <input
                                type="date"
                                value={data.period_end}
                                onChange={(e) => setData("period_end", e.target.value)}
                                className="w-full rounded-2xl border-gray-100 py-4 px-5 font-mono font-black text-gray-700 bg-white shadow-sm focus:ring-brand-primary transition-all"
                                required
                            />
                            {errors.period_end && <p className="text-red-500 text-[10px] font-black uppercase mt-1 ml-1">{errors.period_end}</p>}
                        </div>
                    </div>
                </div>
            </div>
        )}

        {step === 2 && simulation && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-300">
                {simulation.total_sessions > 0 ? (
                    <>
                        <div className="bg-gray-50 p-6 rounded-3xl border border-gray-100 text-center space-y-2">
                            <p className="text-[10px] font-black text-brand-gray uppercase tracking-[0.2em]">Sesiones Encontradas</p>
                            <p className="text-4xl font-black text-gray-900">{simulation.total_sessions}</p>
                        </div>

                        <div className="space-y-3">
                            <div className="flex justify-between items-center p-4 bg-white border border-gray-100 rounded-2xl">
                                <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">Producción Total</span>
                                <span className="font-mono font-bold text-gray-900">{formatCurrency(simulation.total_patient_amount_clp)}</span>
                            </div>
                            <div className="flex justify-between items-center p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600">
                                <span className="text-xs font-bold uppercase tracking-wide">Retención Clínica</span>
                                <span className="font-mono font-bold">- {formatCurrency(simulation.total_commission_amount_clp)}</span>
                            </div>
                            <div className="flex justify-between items-center p-6 bg-brand-primary text-white shadow-xl shadow-brand-primary/20 rounded-2xl transform scale-105">
                                <span className="text-sm font-black uppercase tracking-widest">Total a Pagar</span>
                                <span className="font-mono text-xl font-black">{formatCurrency(simulation.total_payable_clp)}</span>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="py-12 flex flex-col items-center justify-center text-center space-y-6">
                        <div className="w-20 h-20 bg-gray-50 rounded-[2.5rem] flex items-center justify-center text-gray-300">
                            <AlertCircle className="w-10 h-10" />
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-lg font-black text-gray-900 uppercase tracking-tight">Sin Atenciones</h3>
                            <p className="text-xs font-medium text-gray-500 max-w-[250px] leading-relaxed">
                                No se encontraron sesiones completadas y pendientes de pago para este profesional en las fechas seleccionadas.
                            </p>
                        </div>
                    </div>
                )}
            </div>
        )}
    </Modal>
  );
}
