import React from 'react';
import { router } from '@inertiajs/react';
import { X, Clock, Activity, Layers, User, MoreVertical } from 'lucide-react';
import { getStatusLabel } from '@/helpers/agenda';

export default function AppointmentDetailModal({ isOpen, onClose, appointment, onCheckIn, canCreate = true }) {
  if (!isOpen || !appointment) return null;

  const handleCancel = () => {
    if (confirm('¿Desea anular esta cita?')) {
      router.post(route('agendas.cancel', appointment.id), {}, {
        onSuccess: () => onClose(),
      });
    }
  };

  const handleStartSession = () => {
    router.post(route('kine.sessions.start', appointment.id), {}, {
      onSuccess: () => onClose(),
    });
  };

  const handleViewSession = () => {
    if (appointment.treatment_session_id) {
      router.visit(route('kine.sessions.show', appointment.treatment_session_id));
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-[2rem] shadow-2xl max-w-xl w-full flex flex-col overflow-hidden">
        <div className="p-6 border-b flex justify-between items-start">
          <div>
            <span className="text-[9px] font-black uppercase text-brand-primary">Detalle de Cita</span>
            <h2 className="text-xl font-black uppercase tracking-tight">{appointment.patient?.name}</h2>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-900 transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>
        <div className="p-8 space-y-8 overflow-y-auto max-h-[70vh] custom-scrollbar">
          <div className="grid grid-cols-2 gap-4">
            <div className="p-5 bg-gray-50 rounded-3xl border border-gray-100">
              <p className="text-[9px] font-black uppercase text-gray-400 mb-2 flex items-center gap-1.5"><Clock className="w-3 h-3"/> Horario</p>
              <p className="text-sm font-black text-gray-900">{appointment.start_time.substring(0, 5)} — {appointment.end_time.substring(0, 5)}</p>
            </div>
            <div className="p-5 bg-gray-50 rounded-3xl border border-gray-100">
              <p className="text-[9px] font-black uppercase text-gray-400 mb-2 flex items-center gap-1.5"><Activity className="w-3 h-3"/> Estado</p>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${['completed','checked_in'].includes(appointment.status) ? 'bg-green-500' : appointment.status === 'cancelled' ? 'bg-red-500' : 'bg-blue-500 animate-pulse'}`}></div>
                <p className="text-[10px] font-black uppercase text-gray-700">{getStatusLabel(appointment.status)}</p>
              </div>
            </div>
          </div>
          <div className="space-y-4">
            <div className="flex items-start gap-4 p-5 bg-brand-primary/5 rounded-[2rem] border border-brand-primary/10">
              <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-brand-primary shadow-sm border border-brand-primary/10 shrink-0"><User className="w-6 h-6"/></div>
              <div>
                <p className="text-[9px] font-black uppercase text-brand-primary opacity-60 mb-1">Profesional Asignado</p>
                <p className="text-sm font-black text-gray-900 uppercase">{appointment.doctor?.name}</p>
              </div>
            </div>
            <div className="flex items-start gap-4 p-5 bg-indigo-50/50 rounded-[2rem] border border-indigo-100">
              <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-indigo-600 shadow-sm border border-indigo-100 shrink-0"><Layers className="w-6 h-6"/></div>
              <div>
                <p className="text-[9px] font-black uppercase text-indigo-400 mb-1">Servicio Solicitado</p>
                <p className="text-sm font-black text-gray-900 uppercase">{appointment.item?.name}</p>
                <p className="text-[9px] font-bold text-indigo-400 uppercase mt-1 tracking-widest">{appointment.modality === 'onsite' ? 'Atención en Clínica' : appointment.modality === 'home' ? 'Atención Domiciliaria' : 'Telemedicina'}</p>
              </div>
            </div>
          </div>
          {appointment.notes && (
            <div className="p-6 bg-amber-50/30 rounded-3xl border border-amber-100/50 italic">
              <p className="text-[9px] font-black uppercase text-amber-600 mb-2 flex items-center gap-1.5"><MoreVertical className="w-3 h-3"/> Notas Internas</p>
              <p className="text-xs text-amber-800 leading-relaxed font-medium">"{appointment.notes}"</p>
            </div>
          )}
        </div>
        <div className="p-8 bg-gray-50 border-t flex flex-wrap gap-3">
          {['scheduled', 'confirmed'].includes(appointment.status) && canCreate && (
            <>
              <button onClick={handleCancel} className="flex-1 min-w-[140px] py-4 bg-white text-red-600 font-black uppercase text-[10px] rounded-2xl hover:bg-red-50 border border-red-200 shadow-sm transition-all active:scale-95">Anular Cita</button>
              <button onClick={onCheckIn} className="flex-1 min-w-[140px] py-4 bg-brand-primary text-white font-black uppercase text-[10px] rounded-2xl shadow-xl shadow-brand-primary/20 hover:brightness-110 active:scale-95 transition-all">Realizar Check-in</button>
            </>
          )}
          {appointment.status === 'checked_in' && (
            <button onClick={handleStartSession} className="flex-1 min-w-[140px] py-4 bg-emerald-600 text-white font-black uppercase text-[10px] rounded-2xl shadow-xl shadow-emerald-600/20 hover:brightness-110 active:scale-95 transition-all">Comenzar Atención</button>
          )}
          {['completed', 'realizada'].includes(String(appointment.status).toLowerCase()) && appointment.treatment_session_id && (
            <button onClick={handleViewSession} className="flex-1 min-w-[140px] py-4 bg-brand-primary text-white font-black uppercase text-[10px] rounded-2xl shadow-xl shadow-brand-primary/20 hover:brightness-110 active:scale-95 transition-all">Ver Ficha Clínica</button>
          )}
          <button onClick={onClose} className="w-full py-3 bg-gray-200/50 text-gray-500 font-black uppercase text-[9px] rounded-xl hover:bg-gray-200 transition-colors mt-2">Cerrar Detalle</button>
        </div>
      </div>
    </div>
  );
}
