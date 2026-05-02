import React from "react";
import { useForm } from "@inertiajs/react";
import { 
  Play, 
  XCircle, 
  UserX, 
  MessageSquare, 
  AlertTriangle,
  CheckCircle2,
  Clock,
  Calendar
} from "lucide-react";
import PrimaryButton from "@/components/PrimaryButton";
import SecondaryButton from "@/components/SecondaryButton";
import { fmtDate } from "@/utils/utils";

/**
 * Modal Unificado para Acciones de Sesión (Iniciar, Cancelar, Ausente)
 */
export default function AttendanceActionModal({ 
  session, 
  action, // 'start', 'cancel', 'absent'
  onClose 
}) {
  const { data, setData, patch, post, processing, errors } = useForm({
    notes: "",
    reason: "",
  });

  const config = {
    start: {
      title: "Iniciar Atención",
      subtitle: "Confirmar apertura de sesión clínica",
      icon: Play,
      color: "text-brand-primary",
      bg: "bg-brand-secondary/10",
      buttonText: "Comenzar Sesión",
      route: route("treatment-sessions.start", session?.session_id),
      method: "post"
    },
    cancel: {
      title: "Anular Sesión",
      subtitle: "Registrar motivo de cancelación",
      icon: XCircle,
      color: "text-red-600",
      bg: "bg-red-50",
      buttonText: "Confirmar Anulación",
      route: route("treatment-sessions.cancel", session?.session_id),
      method: "post"
    },
    absent: {
      title: "Marcar Ausencia",
      subtitle: "Paciente no se presentó a la cita",
      icon: UserX,
      color: "text-orange-600",
      bg: "bg-orange-50",
      buttonText: "Confirmar Inasistencia",
      route: route("treatment-sessions.absent", session?.session_id),
      method: "post"
    }
  }[action];

  const Icon = config.icon;

  const submit = (e) => {
    e.preventDefault();
    const payload = action === 'cancel' ? { session_cancellation_notes: data.notes } : { reason: data.notes };
    
    const options = {
        onSuccess: () => onClose(),
        preserveScroll: true
    };

    if (config.method === 'patch') patch(config.route, options);
    else post(config.route, options);
  };

  return (
    <div className="bg-white flex flex-col h-full animate-in fade-in duration-300">
      {/* HEADER HERO INTERNO */}
      <div className="px-8 py-5 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between shrink-0 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-brand-primary/5 rounded-full -mr-16 -mt-16 blur-3xl opacity-50"></div>
        <div className="flex items-center gap-4 relative z-10">
            <div className={`p-2.5 ${config.bg} ${config.color} rounded-xl shadow-sm transform rotate-3`}>
                <Icon className="w-5 h-5" />
            </div>
            <div>
                <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight leading-none mb-1">{config.title}</h2>
                <p className="text-[10px] font-black text-brand-gray uppercase tracking-[0.2em]">{session?.patient_full_name}</p>
            </div>
        </div>
      </div>

      <form onSubmit={submit} className="flex-1 p-8 space-y-6 overflow-y-auto custom-scrollbar">
        {/* INFO CARD */}
        <div className="p-5 bg-white border border-gray-100 rounded-[2rem] shadow-xl shadow-gray-500/5 grid grid-cols-2 gap-6 items-center">
            <div className="flex items-center gap-3">
                <Calendar className="w-4 h-4 text-brand-primary opacity-40" />
                <div>
                    <p className="text-[8px] font-black text-brand-gray uppercase tracking-widest leading-none mb-1">Fecha</p>
                    <p className="text-xs font-black text-gray-900 font-mono">{fmtDate(session?.date)}</p>
                </div>
            </div>
            <div className="flex items-center gap-3">
                <Clock className="w-4 h-4 text-brand-primary opacity-40" />
                <div>
                    <p className="text-[8px] font-black text-brand-gray uppercase tracking-widest leading-none mb-1">Hora</p>
                    <p className="text-xs font-black text-gray-900 font-mono">{session?.time}</p>
                </div>
            </div>
        </div>

        {/* INPUT DE NOTAS / MOTIVO */}
        <div className="space-y-3">
            <div className="flex items-center gap-2 ml-1">
                <MessageSquare className={`w-4 h-4 ${config.color}`} />
                <label className="enterprise-label mb-0!">Observaciones del Estatus</label>
            </div>
            
            {action === 'absent' ? (
                <select 
                    value={data.notes} 
                    onChange={e => setData('notes', e.target.value)}
                    className="w-full px-5 py-4 rounded-2xl border-gray-100 bg-gray-50 font-bold text-sm focus:bg-white focus:ring-brand-primary transition-all"
                    required
                >
                    <option value="">-- Seleccionar Motivo --</option>
                    <option value="no_show">No se presentó</option>
                    <option value="late_cancellation">Cancelación tardía</option>
                    <option value="emergency">Emergencia personal</option>
                    <option value="other">Otro motivo</option>
                </select>
            ) : (
                <textarea 
                    value={data.notes}
                    onChange={e => setData('notes', e.target.value)}
                    rows="4"
                    placeholder={action === 'cancel' ? "Indique por qué se anula la sesión (mínimo 10 caracteres)..." : "Notas iniciales para la atención..."}
                    className="w-full rounded-[1.5rem] border-gray-100 bg-gray-50/50 py-4 px-5 text-sm font-medium focus:bg-white focus:ring-brand-primary transition-all resize-none shadow-inner"
                    required={action === 'cancel'}
                />
            )}
        </div>

        {action === 'absent' && (
            <div className="p-4 bg-amber-50 border-2 border-amber-100 rounded-2xl flex items-start gap-4">
                <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <p className="text-[10px] font-bold text-amber-800 leading-relaxed uppercase tracking-tight">
                    Importante: Al marcar como ausente, la sesión se registrará como no realizada pero mantendrá el vínculo contable si pertenece a un plan.
                </p>
            </div>
        )}
      </form>

      {/* FOOTER FIJO */}
      <div className="px-8 py-6 bg-gray-50 border-t border-gray-100 flex justify-end gap-3 shrink-0 rounded-b-[2rem]">
        <SecondaryButton onClick={onClose} type="button" className="px-8! py-3!">Cerrar</SecondaryButton>
        <PrimaryButton 
            disabled={processing || (action === 'cancel' && data.notes.length < 10)} 
            type="submit" 
            onClick={submit}
            className={`px-10! py-3! shadow-xl ${action === 'cancel' ? 'bg-red-600 hover:bg-red-700 shadow-red-200' : action === 'absent' ? 'bg-orange-600 hover:bg-orange-700 shadow-orange-200' : 'shadow-brand-primary/20'}`}
        >
            {processing ? 'Procesando...' : config.buttonText}
        </PrimaryButton>
      </div>
    </div>
  );
}
