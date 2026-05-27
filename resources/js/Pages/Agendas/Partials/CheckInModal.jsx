import React, { useState, useEffect } from 'react';
import { router } from '@inertiajs/react';
import Swal from 'sweetalert2';
import { X, AlertCircle } from 'lucide-react';

export default function CheckInModal({ isOpen, onClose, onSuccess, appointment, doctors = [], rooms = [] }) {
  const [checkInData, setCheckInData] = useState({ doctor_id: "", room_id: "" });

  useEffect(() => {
    if (appointment) {
      setCheckInData({
        doctor_id: appointment.doctor_id || "",
        room_id: appointment.room_id || "",
      });
    }
  }, [appointment]);

  if (!isOpen || !appointment) return null;
  
  const handleConfirm = () => {
    router.post(route('agendas.checkin', appointment.id), checkInData, {
      onSuccess: () => {
        if (onSuccess) onSuccess();
        Swal.fire({
          title: "¡Llegó el paciente!",
          text: "Sesión habilitada en el dashboard clínico.",
          icon: "success",
          toast: true,
          position: 'top-end',
          showConfirmButton: false,
          timer: 4000
        });
      },
      onError: (errors) => {
        const errorMsg = errors.doctor_id || errors.room_id || "Ocurrió un error al procesar la llegada.";
        Swal.fire({
          title: "Error de Recepción",
          text: errorMsg,
          icon: "error",
          confirmButtonColor: "#4f46e5"
        });
      }
    });
  };

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-in zoom-in-95">
      <div className="bg-white rounded-[2.5rem] shadow-2xl max-w-lg w-full flex flex-col overflow-hidden">
        <div className="p-6 border-b flex justify-between items-start bg-brand-primary text-white">
          <div>
            <h2 className="text-lg font-black uppercase tracking-tight">Recepción de Paciente</h2>
            <p className="text-[9px] font-bold uppercase mt-0.5 opacity-80">Confirmar profesional y box para la atención</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-xl transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>
        <div className="p-8 space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-gray-400 ml-1">Kinesiólogo que atenderá</label>
            <select value={checkInData.doctor_id} onChange={e => setCheckInData({...checkInData, doctor_id: e.target.value})} className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl font-bold text-sm shadow-sm">
              {doctors.map(d => <option key={d.id} value={d.id}>{d.full_name || d.name}</option>)}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-gray-400 ml-1">Box / Sala de atención</label>
            <select value={checkInData.room_id} onChange={e => setCheckInData({...checkInData, room_id: e.target.value})} className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl font-bold text-sm shadow-sm">
              <option value="">Libre (Supervisión)</option>
              {rooms.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
            </select>
          </div>
          <div className="p-5 bg-brand-primary/5 rounded-3xl border border-brand-primary/10 flex items-start gap-4">
            <AlertCircle className="w-5 h-5 text-brand-primary shrink-0 mt-1" />
            <p className="text-[10px] text-brand-primary font-bold leading-relaxed uppercase">Al realizar el check-in, se habilitará la sesión clínica para el profesional y se marcará la llegada del paciente.</p>
          </div>
        </div>
        <div className="p-8 bg-gray-50 border-t flex gap-3">
          <button onClick={handleConfirm} className="flex-1 py-4 bg-brand-primary text-white font-black uppercase text-[10px] rounded-2xl shadow-xl shadow-brand-primary/20 hover:brightness-110 active:scale-95 transition-all">Confirmar Llegada</button>
          <button onClick={onClose} className="px-8 py-4 bg-white text-gray-400 font-black uppercase text-[10px] border border-gray-200 rounded-2xl hover:bg-gray-100 transition-all">Volver</button>
        </div>
      </div>
    </div>
  );
}
