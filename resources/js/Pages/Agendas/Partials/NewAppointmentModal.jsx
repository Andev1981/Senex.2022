import React, { useState, useMemo, useEffect } from "react";
import { useForm, router } from "@inertiajs/react";
import { Plus, Clock, User, CheckCircle, XCircle, X, Activity, AlertCircle, MessageSquare, Mail } from "lucide-react";
import Swal from "sweetalert2";
import SearchSelect from "@/components/SearchSelect";
import QuickPatientModal from "@/components/clinical/QuickPatientModal";
import { formatLocalDate, getNextHourTimes, isToday, formatLongDate } from "@/helpers/agenda";

export default function NewAppointmentModal({ 
  isOpen, 
  onClose, 
  selectedDate, 
  patients, 
  doctors, 
  items, 
  rooms, 
  availabilities, 
  holidays, 
  exceptions, 
  currentBranch, 
  agreements, 
  appointments, 
  onPatientCreated, 
  regions, 
  communes,
  appointment = null // 👈 Prop para modo edición
}) {
  if (!isOpen) return null;

  const isEditing = !!appointment;
  const [showQuickPatient, setShowQuickPatient] = useState(false);
  const [hoveredSlot, setHoveredSlot] = useState(null);
  
  const defaultTimes = getNextHourTimes();

  const { data, setData, post, patch, processing, reset, errors, clearErrors } = useForm({
    date: appointment?.date || formatLocalDate(selectedDate || new Date()),
    start_time: appointment?.start_time || (isToday(selectedDate) ? defaultTimes.start : ""),
    end_time: appointment?.end_time || (isToday(selectedDate) ? defaultTimes.end : ""),
    patient_id: appointment?.patient_id || "",
    doctor_id: appointment?.doctor_id || "",
    item_id: appointment?.item_id || "",
    room_id: appointment?.room_id ? String(appointment.room_id) : "",
    modality: appointment?.modality || "onsite",
    notes: appointment?.notes || "",
    is_direct: false,
    send_mail: false,
    send_whatsapp: false,
  });

  const longDate = useMemo(() => formatLongDate(data.date), [data.date]);
  const wildcardPatient = useMemo(() => patients.find(p => p.is_wildcard === true), [patients]);

  const patientAgenda = useMemo(() => {
    if (!data.patient_id || !data.date) return [];
    return appointments.filter(a => 
        a.date === data.date && 
        a.patient_id == data.patient_id && 
        a.status !== 'cancelled'
    );
  }, [appointments, data.patient_id, data.date]);

  const doctorAgenda = useMemo(() => {
    if (!data.doctor_id || !data.date) return [];
    return appointments.filter(a => 
        a.date === data.date && 
        a.doctor_id == data.doctor_id && 
        !['cancelled', 'not_show'].includes(a.status)
    );
  }, [appointments, data.doctor_id, data.date]);

  const handleCloseModal = () => { reset(); clearErrors(); onClose(); };

  useEffect(() => {
    if (Object.keys(errors).length > 0) {
      const errorMessages = Object.values(errors).join('\n');
      Swal.fire({ title: "Error de Validación", text: errorMessages, icon: "error", confirmButtonText: "Entendido", confirmButtonColor: "#EF4444" });
      clearErrors();
    }
  }, [errors]);

  // Sincronizar datos si cambia el appointment (edición)
  useEffect(() => {
    if (appointment) {
        setData({
            date: appointment.date,
            start_time: appointment.start_time.substring(0, 5),
            end_time: appointment.end_time.substring(0, 5),
            patient_id: appointment.patient_id,
            doctor_id: appointment.doctor_id,
            item_id: appointment.item_id,
            room_id: appointment.room_id ? String(appointment.room_id) : "",
            modality: appointment.modality || "onsite",
            notes: appointment.notes || "",
            is_direct: false,
            send_mail: false,
            send_whatsapp: false,
        });
    } else {
        setData(prev => ({ 
            ...prev, 
            date: formatLocalDate(selectedDate), 
            ...(isToday(selectedDate) && !prev.start_time ? getNextHourTimes() : {}) 
        }));
    }
  }, [appointment, isOpen, selectedDate]);

  useEffect(() => {
    if (isOpen && !isEditing && doctors.length === 1 && !data.doctor_id) {
      setData("doctor_id", doctors[0].id);
    }
  }, [isOpen, doctors, isEditing]);

  useEffect(() => {
    if (!data.doctor_id || isEditing) return; // No auto-asignar box en edición si ya tiene uno
    const dateStr = data.date;
    const dateObj = new Date(dateStr + 'T00:00:00');
    const dayOfWeek = ["SU", "MO", "TU", "WE", "TH", "FR", "SA"][dateObj.getDay()];

    const shift = availabilities.find(av => {
      if (av.doctor_id !== Number(data.doctor_id)) return false;
      if (currentBranch && av.branch_id !== currentBranch.id) return false;
      const rrule = av.rrule || "";
      if (!rrule.includes(`BYDAY=`)) return false;
      const byDayPart = rrule.split('BYDAY=')[1].split(';')[0];
      return byDayPart.split(',').includes(dayOfWeek);
    });

    if (shift && shift.room_id) setData(prev => ({ ...prev, room_id: String(shift.room_id) }));
  }, [data.doctor_id, data.date, isEditing]);

  // Limpiar horas si cambia doctor/servicio/fecha (solo en creación)
  useEffect(() => {
    if (!isEditing) {
        setData(prev => ({ ...prev, start_time: "", end_time: "" }));
    }
  }, [data.doctor_id, data.item_id, data.date, isEditing]);

  const allowedModalities = useMemo(() => {
    let onsite = currentBranch ? currentBranch.allows_onsite : true;
    let home = currentBranch ? currentBranch.allows_home : false;
    let online = currentBranch ? currentBranch.allows_online : false;
    if (data.item_id) {
      const selectedItem = items.find(i => i.id === Number(data.item_id));
      if (selectedItem?.service_detail) {
        onsite = onsite && selectedItem.service_detail.allows_onsite;
        home = home && selectedItem.service_detail.allows_home;
        online = online && selectedItem.service_detail.allows_online;
      }
    }
    return { onsite, home, online };
  }, [currentBranch, data.item_id, items]);

  useEffect(() => {
    if (!allowedModalities[data.modality]) {
      if (allowedModalities.onsite) setData("modality", "onsite");
      else if (allowedModalities.home) setData("modality", "home");
      else if (allowedModalities.online) setData("modality", "online");
    }
  }, [allowedModalities]);

  const enrichedItems = useMemo(() => {
    const patientPlanId = patients.find(p => p.id === Number(data.patient_id))?.insurance?.plan_id;
    return items.map(item => {
      let convLabel = "";
      if (patientPlanId && Array.isArray(agreements)) {
        const rules = agreements.flatMap(a => a.rules || []);
        let rule = rules.find(r => r.plan_id == patientPlanId && r.item_id == item.id);
        if (!rule) rule = rules.find(r => !r.plan_id && r.item_id == item.id);
        if (rule) convLabel = ` ➜ Conv: $${rule.patient_share_clp.toLocaleString('es-CL')}`;
      }
      return { ...item, name_with_price: `${item.name} [$${Number(item.price).toLocaleString('es-CL')}]${convLabel}` };
    });
  }, [items, agreements, data.patient_id, patients]);

  const timeSlots = useMemo(() => {
    const slots = [];
    let curr = new Date(); curr.setHours(8, 0, 0, 0);
    const end = new Date(); end.setHours(21, 30, 0, 0);
    while (curr <= end) { slots.push(curr.toTimeString().substring(0, 5)); curr.setMinutes(curr.getMinutes() + 30); }
    return slots;
  }, []);

  const getSlotStatus = (time) => {
    const dateStr = data.date;
    const [h, m] = time.split(':').map(Number);
    const slotStart = new Date(dateStr + 'T' + time + ':00');
    const slotEnd = new Date(slotStart.getTime() + 30 * 60000);
    const now = new Date();
    if (slotStart < now && !isEditing) return 'past'; // En edición permitimos el bloque actual
    
    const dayOfWeek = ["SU", "MO", "TU", "WE", "TH", "FR", "SA"][slotStart.getDay()];
    const branchSched = currentBranch?.schedule?.[dayOfWeek];
    if (branchSched && branchSched.open && branchSched.close) {
      const [oH, oM] = branchSched.open.split(':').map(Number);
      const [cH, cM] = branchSched.close.split(':').map(Number);
      const startMin = h * 60 + m, openMin = oH * 60 + oM, closeMin = cH * 60 + cM;
      if (startMin < openMin || startMin >= closeMin) return 'outside';
    }

    const isHoliday = holidays.some(hol => {
        const hDate = hol.date;
        if (hol.is_recurring) return hDate.substring(5) === dateStr.substring(5);
        return hDate === dateStr;
    });
    if (isHoliday) return 'outside';

    const slotMins = h * 60 + m;
    const activeInSlot = appointments.filter(apt => {
        // Excluir la cita actual si estamos editando
        if (isEditing && apt.id === appointment.id) return false;
        
        if (apt.date !== dateStr || apt.doctor_id !== Number(data.doctor_id) || ['cancelled', 'not_show'].includes(apt.status)) return false;
        const [asH, asM] = apt.start_time.split(':').map(Number);
        const [aeH, aeM] = apt.end_time.split(':').map(Number);
        return slotMins >= (asH*60+asM) && slotMins < (aeH*60+aeM);
    });

    if (activeInSlot.length >= 3) return 'doctor_full';

    const patientConflict = appointments.find(apt => {
        if (isEditing && apt.id === appointment.id) return false;
        if (apt.date !== dateStr || apt.patient_id !== Number(data.patient_id) || apt.status === 'cancelled') return false;
        const [asH, asM] = apt.start_time.split(':').map(Number);
        const [aeH, aeM] = apt.end_time.split(':').map(Number);
        return slotMins >= (asH*60+asM) && slotMins < (aeH*60+aeM);
    });
    if (patientConflict && Number(data.patient_id) !== wildcardPatient?.id) return 'patient_conflict';

    return 'free';
  };

  const getDurationBlocks = (startTime) => {
    if (!startTime) return [];
    const duration = items.find(i => i.id === Number(data.item_id))?.service_detail?.duration_minutes || 60;
    const blocks = Math.ceil(duration / 30);
    const result = [];
    let [h, m] = startTime.split(':').map(Number);
    for (let i = 0; i < blocks; i++) {
      const timeStr = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
      result.push(timeStr);
      m += 30; if (m >= 60) { m = 0; h++; }
    }
    return result;
  };

  const isFormValid = data.patient_id && data.doctor_id && data.item_id && data.start_time && data.end_time;

  const handleSlotClick = (time) => {
    const st = getSlotStatus(time);
    if (st === 'patient_conflict' && Number(data.patient_id) !== wildcardPatient?.id) {
      const [h, m] = time.split(':').map(Number), slotMins = h * 60 + m;
      const overlap = appointments.find(apt => {
        if (apt.date !== data.date || apt.patient_id !== Number(data.patient_id) || apt.status === 'cancelled') return false;
        const [asH, asM] = apt.start_time.split(':').map(Number);
        const [aeH, aeM] = apt.end_time.split(':').map(Number);
        return slotMins >= (asH*60+asM) && slotMins < (aeH*60+aeM);
      });
      Swal.fire({
        title: "Conflicto de Paciente",
        html: `<div class="text-left space-y-2"><p>El paciente <b>${patients.find(p => p.id === Number(data.patient_id))?.full_name}</b> ya tiene una cita agendada en este bloque:</p><div class="p-3 bg-red-50 rounded-xl border border-red-100"><p class="text-xs"><b>Servicio:</b> ${overlap?.item?.name}</p><p class="text-xs"><b>Kine:</b> ${overlap?.doctor?.name}</p><p class="text-xs"><b>Horario:</b> ${overlap?.start_time.substring(0, 5)} - ${overlap?.end_time.substring(0, 5)}</p></div></div>`,
        icon: "error", confirmButtonText: "Entendido", confirmButtonColor: "#EF4444"
      });
      return;
    }
    if (st === 'past' || st === 'occupied' || st === 'doctor_full' || st === 'room_full' || st === 'outside') return;
    const neededSlots = getDurationBlocks(time);
    const blocksNeeded = Math.ceil((items.find(i => i.id === Number(data.item_id))?.service_detail?.duration_minutes || 60) / 30);
    if (neededSlots.length < blocksNeeded) { Swal.fire({ title: "Horario insuficiente", text: "El servicio dura más que el tiempo disponible hasta el cierre.", icon: "warning", toast: true, position: 'top-end', showConfirmButton: false, timer: 3000 }); return; }
    const conflictSlot = neededSlots.find(t => getSlotStatus(t) !== 'free');
    if (conflictSlot) { 
      const status = getSlotStatus(conflictSlot);
      const reasons = { 'doctor_full': 'El Kinesiólogo ya tiene 3 pacientes en uno de los bloques requeridos.', 'room_full': 'El Box seleccionado está lleno en uno de los bloques requeridos.', 'patient_conflict': 'El paciente tiene un cruce de horario con otra cita.', 'past': 'Parte del servicio caería en un horario que ya pasó.' };
      Swal.fire({ title: "Conflicto de Horario", text: reasons[status] || "Uno de los bloques necesarios no está disponible.", icon: "warning", toast: true, position: 'top-end', showConfirmButton: false, timer: 4000 }); return; 
    }
    const lastSlot = neededSlots[neededSlots.length - 1];
    const [h, m] = lastSlot.split(':').map(Number);
    const endObj = new Date(); endObj.setHours(h, m + 30);
    setData(prev => ({ ...prev, start_time: time, end_time: endObj.toTimeString().substring(0, 5) }));
  };
  
  const handleCreateAppointment = (e) => { 
    e?.preventDefault(); 
    submitWithDirectFlag(false); 
  };
  
  const submitWithDirectFlag = (isDirectValue) => {
    const url = isEditing ? route('agendas.update', appointment.id) : route('agendas.store');
    const method = isEditing ? 'patch' : 'post';

    router[method](url, { ...data, is_direct: isDirectValue }, {
        onSuccess: () => {
            handleCloseModal();
        },
        onError: (errs) => {
            const errorMsg = Object.values(errs)[0] || "Ocurrió un error al procesar la cita.";
            Swal.fire({
                title: isEditing ? "No se pudo actualizar" : "No se pudo agendar",
                text: errorMsg,
                icon: "error",
                confirmButtonColor: "#EF4444"
            });
        }
    });
  };

  return (
    <>
      <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-300">
        <div className="bg-white rounded-[2.5rem] shadow-2xl max-w-5xl w-full max-h-[95vh] flex flex-col overflow-hidden animate-in zoom-in-95">
          <div className="p-6 border-b flex justify-between items-center shrink-0">
            <div>
                <h2 className="text-lg font-black uppercase">{isEditing ? 'Actualizar Cita' : 'Nueva Cita'}</h2>
                <p className="text-[9px] font-black text-brand-primary uppercase mt-0.5">
                    {isEditing ? `Modificando cita del ${longDate}` : `Está agendando cita para el ${longDate}`}
                </p>
            </div>
            <button onClick={handleCloseModal} className="p-2 hover:bg-gray-100 rounded-xl transition-colors"><X /></button>
          </div>
          <form onSubmit={handleCreateAppointment} className="flex flex-col flex-1 overflow-hidden">
            <div className="p-6 space-y-8 overflow-y-auto flex-1 bg-gray-50/20">
              <div className="max-w-4xl mx-auto space-y-8">
                <div className="space-y-6">
                    <div className="space-y-1">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">1. Seleccione Paciente</label>
                        <div className="flex gap-2">
                            <SearchSelect 
                                options={patients} 
                                value={data.patient_id} 
                                onChange={v => setData("patient_id", v)} 
                                className="flex-1" 
                                config={{ valueKey:'id', displayKey:'full_name', secondaryKeys:['rut'], searchKeys:['full_name','rut'] }} 
                                disabled={isEditing} // No permitir cambiar de paciente en edición para evitar inconsistencias
                            />
                            {!isEditing && (
                                <button type="button" onClick={() => setShowQuickPatient(true)} className="p-4 bg-brand-primary/10 text-brand-primary rounded-2xl h-[52px] flex items-center justify-center transition-all hover:bg-brand-primary hover:text-white"><Plus /></button>
                            )}
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6"><div className="space-y-1"><label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">2. Servicio Solicitado</label><SearchSelect options={enrichedItems} value={data.item_id} onChange={v => setData("item_id", v)} config={{ valueKey:'id', displayKey:'name_with_price', secondaryKeys:['sku'], searchKeys:['name','sku'] }} /></div><div className="space-y-1"><label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">3. Kinesiólogo / Profesional</label><SearchSelect options={doctors} value={data.doctor_id} onChange={v => setData("doctor_id", v)} config={{ valueKey:'id', displayKey:'full_name', secondaryKeys:['speciality'], searchKeys:['full_name', 'name', 'last_name'] }} /></div></div>
                    {(data.patient_id || data.doctor_id) && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in zoom-in-95">
                            {data.patient_id && (
                                <div className="p-4 bg-blue-50/50 border border-blue-100 rounded-3xl space-y-2 shadow-sm">
                                    <p className="text-[9px] font-black uppercase text-blue-600 flex items-center gap-1.5"><User className="w-3 h-3"/> Agenda del Paciente</p>
                                    <div className="space-y-1">
                                        {patientAgenda.length > 0 ? (
                                            patientAgenda.map(a => (
                                                <div key={a.id} className="text-[10px] font-bold text-blue-800 bg-white px-2 py-1.5 rounded-xl border border-blue-100 flex justify-between shadow-sm">
                                                    <span>{a.item?.name}</span>
                                                    <span className="font-black">{a.start_time.substring(0, 5)}</span>
                                                </div>
                                            ))
                                        ) : (
                                            <p className="text-[9px] font-bold text-blue-400 uppercase italic">Sin otras citas para hoy</p>
                                        )}
                                    </div>
                                </div>
                            )}
                            {data.doctor_id && (
                                <div className="p-4 bg-indigo-50/50 border border-indigo-100 rounded-3xl space-y-2 shadow-sm">
                                    <p className="text-[9px] font-black uppercase text-indigo-600 flex items-center gap-1.5"><Activity className="w-3 h-3"/> Carga de {doctors.find(d => d.id == data.doctor_id)?.full_name}</p>
                                    <div className="flex justify-between items-end">
                                        <p className="text-[10px] font-black text-indigo-900">{doctorAgenda.length} Atenciones hoy</p>
                                        <span className="text-[9px] font-bold text-indigo-400 uppercase">Límite: 15 / día</span>
                                    </div>
                                    <div className="w-full bg-indigo-100 h-2 rounded-full overflow-hidden">
                                        <div className="bg-indigo-500 h-full transition-all" style={{ width: `${Math.min(100, (doctorAgenda.length / 15) * 100)}%` }}></div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
                {data.doctor_id && (
                    <div className="space-y-5 pt-8 border-t animate-in fade-in slide-in-from-top-4">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4"><div><label className="text-[11px] font-black text-gray-500 uppercase tracking-widest">4. Disponibilidad Horaria</label><p className="text-[9px] text-gray-400 font-medium">Bloques de 30 minutos. Se reservarán los espacios necesarios según la duración.</p></div><div className="flex flex-wrap gap-2">{[{c:'emerald',l:'Libre', icon: <CheckCircle className="w-3 h-3 text-emerald-500"/>},{c:'orange',l:'Lleno / Exclusivo', icon: <AlertCircle className="w-3 h-3 text-orange-500"/>, t: '3 pacientes o Servicio Exclusivo'},{c:'red',l:'Conflicto Paciente', icon: <XCircle className="w-3 h-3 text-red-500"/>},{c:'gray-200',l:'Cerrado/Pasado', icon: <Clock className="w-3 h-3 text-gray-300"/>}].map((item) => (<div key={item.l} title={item.t} className="flex items-center gap-1.5 px-3 py-1.5 bg-white border rounded-2xl shadow-sm">{item.icon}<span className="text-[8px] font-black uppercase text-gray-500">{item.l}</span></div>))}</div></div>
                        <div className="grid grid-cols-4 md:grid-cols-8 lg:grid-cols-10 gap-3 p-8 bg-white rounded-[3rem] border border-gray-200 shadow-sm overflow-hidden">
                            {timeSlots.map(t => { 
                                const st = getSlotStatus(t), durationBlocks = getDurationBlocks(data.start_time), isSelected = durationBlocks.includes(t), hoverBlocks = hoveredSlot ? getDurationBlocks(hoveredSlot) : [], isHoveredGhost = hoverBlocks.includes(t);
                                const [h, m] = t.split(':').map(Number), slotMins = h * 60 + m;
                                const activeInSlot = appointments.filter(apt => {
                                    if (isEditing && apt.id === appointment.id) return false;
                                    return apt.date === data.date && apt.doctor_id === Number(data.doctor_id) && !['cancelled', 'not_show'].includes(apt.status) && slotMins >= (parseInt(apt.start_time.split(':')[0])*60+parseInt(apt.start_time.split(':')[1])) && slotMins < (parseInt(apt.end_time.split(':')[0])*60+parseInt(apt.end_time.split(':')[1]));
                                });
                                const patientCount = activeInSlot.length;
                                const isCompatible = patientCount < 3;
                                
                                const styles = { 
                                    'free': isCompatible ? "bg-white border-gray-100 text-gray-700 hover:border-emerald-400 hover:bg-emerald-50/30" : "bg-orange-50/50 border-orange-200 text-orange-400 cursor-not-allowed opacity-70", 
                                    'past': "bg-gray-100 border-gray-100 text-gray-400 cursor-not-allowed opacity-60", 
                                    'outside': "bg-gray-200/40 border-gray-200 text-gray-300 cursor-not-allowed", 
                                    'occupied': "bg-orange-50 border-orange-200 text-orange-600 cursor-not-allowed", 
                                    'doctor_full': "bg-orange-50 border-orange-200 text-orange-600 cursor-not-allowed", 
                                    'room_full': "bg-purple-50 border-purple-200 text-purple-600 cursor-not-allowed", 
                                    'patient_conflict': "bg-red-50 border-red-200 text-red-600 cursor-not-allowed animate-pulse" 
                                };

                                return (
                                    <button 
                                        key={t} 
                                        type="button" 
                                        onMouseEnter={() => setHoveredSlot(t)} 
                                        onMouseLeave={() => setHoveredSlot(null)} 
                                        onClick={() => handleSlotClick(t)} 
                                        className={`group relative py-5 rounded-3xl text-xs font-black transition-all border-2 flex flex-col items-center justify-center gap-1 ${isSelected ? "bg-brand-primary border-brand-primary text-white shadow-2xl scale-105 z-10" : isHoveredGhost && st === 'free' && isCompatible ? "bg-brand-primary/10 border-brand-primary/30 text-brand-primary" : styles[st]}`}
                                    >
                                        <span>{t}</span>
                                        {(patientCount > 0 || st === 'doctor_full' || st === 'room_full' || isSelected) && (
                                            <div className="flex flex-col items-center gap-0.5">
                                                <span className={`text-[7px] px-2 py-0.5 rounded-full ${isSelected ? 'bg-white/20 text-white' : patientCount >= 3 ? 'bg-orange-100 text-orange-600' : 'bg-gray-100 text-gray-500'}`}>
                                                    {patientCount}/3 pacientes
                                                </span>
                                                {st === 'room_full' && <span className="text-[6px] font-black uppercase text-purple-500">Box Lleno</span>}
                                                {st === 'doctor_full' && patientCount >= 3 && <span className="text-[6px] font-black uppercase text-orange-500">Cupos Agotados</span>}
                                            </div>
                                        )}
                                        {!isCompatible && st === 'free' && <span className="text-[6px] font-black uppercase text-orange-400">Sin Cupo</span>}
                                    </button>
                                );
                            })}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                            <div className="p-6 bg-brand-primary/5 rounded-[2.5rem] border border-brand-primary/10 flex justify-between items-center shadow-inner"><div className="flex items-center gap-4"><div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-brand-primary shadow-sm border border-brand-primary/10"><Clock className="w-8 h-8"/></div><div><p className="text-[10px] font-black text-brand-primary uppercase tracking-widest">Horario de Reserva</p><p className="text-2xl font-black text-gray-900 tracking-tighter">{data.start_time || '--:--'} <span className="text-brand-primary/30 mx-2">➜</span> {data.end_time || '--:--'}</p></div></div><div className="text-right px-4 border-l border-brand-primary/10"><p className="text-[9px] font-black text-gray-400 uppercase">Duración</p><p className="text-lg font-black text-gray-700">{items.find(i => i.id === Number(data.item_id))?.service_detail?.duration_minutes || '--'} min</p></div></div>
                            <div className="p-6 bg-gray-100/50 rounded-[2.5rem] border border-gray-200 space-y-4"><div className="grid grid-cols-2 gap-4">{data.modality === 'onsite' && <div className="space-y-1"><label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Box / Sala</label><select value={data.room_id} onChange={e => setData("room_id", e.target.value)} className="w-full px-5 py-4 bg-white border-none rounded-2xl font-bold text-sm shadow-sm"><option value="">Libre / Flotante</option>{rooms.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}</select></div>}<div className="space-y-1"><label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Notificaciones</label><div className="flex gap-2"><button type="button" onClick={() => setData("send_whatsapp", !data.send_whatsapp)} className={`flex-1 flex items-center justify-center gap-2 py-4 px-3 rounded-2xl border-2 font-black text-[10px] uppercase tracking-wider transition-all duration-300 active:scale-95 shadow-sm ${data.send_whatsapp ? "bg-emerald-50 border-emerald-200 text-emerald-700 shadow-emerald-50/50" : "bg-white border-white text-gray-400 hover:border-gray-100 hover:bg-gray-50/50"}`}><MessageSquare className={`w-4 h-4 transition-transform duration-300 ${data.send_whatsapp ? 'scale-110 text-emerald-600' : 'text-gray-300'}`} /><span>WhatsApp</span></button><button type="button" onClick={() => setData("send_mail", !data.send_mail)} className={`flex-1 flex items-center justify-center gap-2 py-4 px-3 rounded-2xl border-2 font-black text-[10px] uppercase tracking-wider transition-all duration-300 active:scale-95 shadow-sm ${data.send_mail ? "bg-indigo-50 border-indigo-200 text-indigo-700 shadow-indigo-50/50" : "bg-white border-white text-gray-400 hover:border-gray-100 hover:bg-gray-50/50"}`}><Mail className={`w-4 h-4 transition-transform duration-300 ${data.send_mail ? 'scale-110 text-indigo-600' : 'text-gray-300'}`} /><span>Email</span></button></div></div></div></div>
                        </div>
                    </div>
                )}
                <div className="space-y-2 pt-4 border-t"><label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Observaciones / Notas Internas</label><textarea value={data.notes} onChange={e => setData("notes", e.target.value)} rows="3" placeholder="Información relevante para el profesional..." className="w-full px-6 py-5 bg-white border-2 border-gray-100 rounded-[2rem] font-medium text-sm focus:border-brand-primary outline-none transition-all shadow-sm"></textarea></div>
              </div>
            </div>
            <div className="p-8 bg-gray-100 border-t flex flex-col gap-3 shrink-0">
                <div className="flex gap-4">
                    {!isEditing && (
                        <button type="button" onClick={() => submitWithDirectFlag(true)} disabled={processing || !isFormValid} className="flex-1 py-4 bg-orange-600 text-white font-black uppercase text-[10px] rounded-2xl shadow-xl hover:brightness-110 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed">Confirmar y Recibir (Check-in)</button>
                    )}
                    <button type="button" onClick={() => submitWithDirectFlag(false)} disabled={processing || !isFormValid} className="flex-1 py-4 bg-brand-primary text-white font-black uppercase text-[10px] rounded-2xl shadow-xl hover:brightness-110 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed">
                        {isEditing ? 'Guardar Cambios' : 'Solo Agendar Reserva'}
                    </button>
                </div>
                <button type="button" onClick={handleCloseModal} className="w-full py-3 bg-white text-gray-400 font-black uppercase text-[10px] border rounded-xl hover:bg-gray-50">Cancelar y Cerrar</button>
            </div>
          </form>
        </div>
      </div>
      <QuickPatientModal isOpen={showQuickPatient} onClose={() => setShowQuickPatient(false)} regions={regions} communes={communes} onSuccess={(newPatient) => { 
        if (newPatient) { 
          onPatientCreated(newPatient);
          setData("patient_id", newPatient.id); 
        } 
      }} />
    </>
  );
}
