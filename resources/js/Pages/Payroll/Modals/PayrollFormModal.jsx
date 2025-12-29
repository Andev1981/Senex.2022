import { useForm } from "@inertiajs/react";
import Modal from "@/Components/Modal";
import { 
  Calendar, 
  User, 
  Clock, 
  AlertCircle,
  Briefcase,
  NotebookText
} from "lucide-react";
import PrimaryButton from "@/Components/PrimaryButton";
import SecondaryButton from "@/Components/SecondaryButton";
import { useEffect } from "react";

export default function PayrollFormModal({ show, onClose, doctors }) {
  const { data, setData, post, processing, errors, reset } = useForm({
    doctor_id: "",
    period_start: "",
    period_end: "",
  });

  useEffect(() => {
    if (!show) {
      reset();
    }
  }, [show]);

  const handleSubmit = (e) => {
    e.preventDefault();
    post(route("payrolls.store"), {
      onSuccess: () => onClose(),
      preserveScroll: true,
    });
  };

  return (
    <Modal
      open={show}
      onClose={onClose}
      maxWidth="2xl"
      title="Nuevo Corte de Honorarios"
      subtitle="Generación masiva de liquidación por período"
      icon={NotebookText}
      footer={
        <>
          <SecondaryButton onClick={onClose} className="!px-10 !py-4">Descartar</SecondaryButton>
          <PrimaryButton disabled={processing} onClick={handleSubmit} className="!px-14 !py-4 shadow-xl shadow-brand-primary/20">
            {processing ? 'Procesando...' : 'Generar Liquidación'}
          </PrimaryButton>
        </>
      }
    >
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
    </Modal>
  );
}
