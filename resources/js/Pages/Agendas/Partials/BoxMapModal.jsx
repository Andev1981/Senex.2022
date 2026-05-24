import React, { useState } from "react";
import { 
    Calendar as CalendarIcon, 
    Layers, 
    Plus, 
    Ban, 
    AlertTriangle,
    X,
    User,
    Clock,
    Activity,
    ChevronRight,
    Search
} from "lucide-react";
import { router, useForm } from "@inertiajs/react";
import Swal from "sweetalert2";
import SideModal from "@/components/SideModal";
import TextInput from "@/components/TextInput";
import SearchSelect from "@/components/SearchSelect";
import QuickPatientModal from "@/components/clinical/QuickPatientModal";

export default function BoxMapModal({ 
    isOpen, 
    onClose, 
    rooms = [], 
    appointments = [], 
    holidays = [], 
    selectedDate, 
    onDateChange,
    doctors = [],
    items = [],
    patients = [],
    regions = [],
    communes = []
}) {
    const [selectedSlot, setSelectedSlot] = useState(null);
    const [showQuickPatient, setShowQuickPatient] = useState(false);
    const [localPatients, setLocalPatients] = useState(patients);

    const { data, setData, post, processing, reset, errors } = useForm({
        date: selectedDate,
        start_time: "",
        end_time: "",
        patient_id: "",
        doctor_id: "",
        item_id: "",
        room_id: "",
        modality: "onsite",
        send_whatsapp: true,
        send_mail: true,
        notes: "",
        is_direct: false
    });

    const handleSlotClick = (room, time) => {
        const dateObj = new Date();
        const [h, m] = time.split(':').map(Number);
        const endObj = new Date();
        endObj.setHours(h, m + 30);
        const endTime = endObj.toTimeString().substring(0, 5);

        setData({
            ...data,
            date: selectedDate,
            start_time: time,
            end_time: endTime,
            room_id: room.id,
            modality: "onsite"
        });
        setSelectedSlot({ room, time });
    };

    const handleCreateAppointment = (isDirect = false) => {
        post(route('agendas.store'), {
            onSuccess: () => {
                Swal.fire({
                    title: "¡Cita agendada!",
                    text: isDirect ? "El paciente ha sido recibido." : "La reserva se ha guardado.",
                    icon: "success",
                    timer: 2000,
                    showConfirmButton: false
                });
                setSelectedSlot(null);
                reset();
            }
        });
    };

    const getStatusLabel = (status) => {
        const labels = {
            'scheduled': 'Programada',
            'confirmed': 'Confirmada',
            'checked_in': 'En Espera',
            'in_progress': 'En Sesión',
            'completed': 'Finalizada',
            'cancelled': 'Anulada',
            'no_show': 'No asistió'
        };
        return labels[status] || status;
    };

    return (
        <>
            <SideModal open={isOpen} onClose={onClose} width="5xl">
                <div className="flex flex-col h-full bg-gray-50/50">
                    {/* Header */}
                    <div className="p-8 bg-white border-b border-gray-100 flex justify-between items-center shrink-0">
                        <div className="flex items-center gap-5">
                            <div className="w-14 h-14 bg-brand-primary text-white rounded-2xl flex items-center justify-center shadow-xl shadow-brand-primary/20">
                                <Layers className="w-7 h-7" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tighter">Monitor de Boxes</h2>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1 flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div> Estado físico de la sucursal en tiempo real
                                </p>
                            </div>
                        </div>
                        <button onClick={onClose} className="p-3 bg-gray-50 text-gray-400 rounded-2xl hover:text-gray-900 transition-colors">
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    {/* Sub-Header: Filtros y Leyenda */}
                    <div className="p-6 space-y-6 shrink-0">
                        <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-gray-50 rounded-xl"><CalendarIcon className="w-5 h-5 text-gray-400" /></div>
                                <div>
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Visualizando Día</p>
                                    <TextInput type="date" value={selectedDate} onChange={e => onDateChange(e.target.value)} className="!border-none !p-0 !bg-transparent font-black uppercase text-sm focus:ring-0" />
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-600 rounded-xl text-[10px] font-black uppercase tracking-widest border border-green-100"><div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div> Libre</div>
                                <div className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-xl text-[10px] font-black uppercase tracking-widest border border-red-100"><div className="w-1.5 h-1.5 bg-red-500 rounded-full"></div> Saturado</div>
                                <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-500 rounded-xl text-[10px] font-black uppercase tracking-widest border border-gray-200"><div className="w-1.5 h-1.5 bg-gray-400 rounded-full"></div> Cierre / Falla</div>
                            </div>
                        </div>
                    </div>

                    {/* Grid de Boxes */}
                    <div className="flex-1 overflow-auto p-6 pt-0 custom-scrollbar">
                        {rooms.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-20 opacity-20">
                                <Layers className="w-20 h-20 mb-4" />
                                <p className="text-xl font-black uppercase">No hay boxes activos</p>
                            </div>
                        ) : (
                            <div className="min-w-[1000px] space-y-4">
                                {/* Cabecera de Boxes */}
                                <div className="flex gap-4 sticky top-0 z-20 bg-gray-50/80 backdrop-blur-sm pb-4">
                                    <div className="w-24 shrink-0"></div> 
                                    {rooms.map(room => (
                                        <div key={room.id} className="flex-1 min-w-[200px] bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm text-center relative group">
                                            <p className="text-xs font-black text-gray-900 uppercase tracking-tight">{room.name}</p>
                                            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-1">Capacidad: {room.capacity} pac.</p>
                                            
                                            <button 
                                                onClick={() => {
                                                    Swal.fire({
                                                        title: `Cierre de Emergencia: ${room.name}`,
                                                        text: 'Indique el motivo del bloqueo temporal para hoy',
                                                        input: 'text',
                                                        inputPlaceholder: 'Ej: Limpieza, Falla técnica...',
                                                        showCancelButton: true,
                                                        confirmButtonText: 'Bloquear Box',
                                                        confirmButtonColor: '#ef4444',
                                                        preConfirm: (reason) => {
                                                            if (!reason) return Swal.showValidationMessage('El motivo es obligatorio');
                                                            router.post(route('availabilities.holidays.store'), {
                                                                name: `BLOQUEO: ${reason}`,
                                                                date: selectedDate,
                                                                branch_id: room.branch_id,
                                                                room_id: room.id,
                                                                is_recurring: false
                                                            }, { preserveScroll: true });
                                                        }
                                                    });
                                                }}
                                                className="absolute top-4 right-4 p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                                                title="Bloquear Box para hoy"
                                            >
                                                <Ban className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                                
                                {/* Filas de Tiempo (08:00 a 20:00) */}
                                {Array.from({ length: 25 }, (_, i) => {
                                    const hour = Math.floor(i / 2) + 8;
                                    const minutes = (i % 2) * 30;
                                    const time = `${String(hour).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
                                    
                                    return (
                                        <div key={time} className="flex gap-4 group">
                                            <div className="w-24 shrink-0 flex items-center justify-center">
                                                <span className="text-[10px] font-black text-gray-400 group-hover:text-brand-primary transition-colors">{time}</span>
                                            </div>
                                            {rooms.map(room => {
                                                const block = holidays.find(h => {
                                                    if (h.room_id !== room.id) return false;
                                                    const hStart = h.start_time || "00:00";
                                                    const hEnd = h.end_time || "23:59";
                                                    return time >= hStart && time < hEnd;
                                                });

                                                if (block) {
                                                    return (
                                                        <div 
                                                            key={`${room.id}-${time}`} 
                                                            className="flex-1 min-w-[200px] h-14 rounded-2xl border border-gray-200 bg-gray-50 flex items-center justify-center px-4 relative overflow-hidden group cursor-not-allowed"
                                                            title={`BLOQUEADO: ${block.name}`}
                                                        >
                                                            <div className="absolute inset-0 opacity-[0.05] pointer-events-none" style={{ backgroundImage: 'linear-gradient(45deg, #000 25%, transparent 25%, transparent 50%, #000 50%, #000 75%, transparent 75%, transparent)' , backgroundSize: '8px 8px' }}></div>
                                                            <div className="flex items-center gap-2 opacity-40">
                                                                <Ban className="w-3 h-3 text-red-600" />
                                                                <span className="text-[7px] font-black uppercase text-gray-500 truncate max-w-[120px]">{block.name}</span>
                                                            </div>
                                                        </div>
                                                    );
                                                }

                                                const occupancy = appointments.filter(apt => {
                                                    const aptStart = apt.start_time || apt.start_at?.substring(11, 16);
                                                    const aptEnd = apt.end_time || apt.end_at?.substring(11, 16);
                                                    return apt.room_id === room.id && time >= aptStart && time < aptEnd;
                                                });

                                                const isFull = occupancy.length >= room.capacity;
                                                const percent = (occupancy.length / room.capacity) * 100;

                                                return (
                                                    <div 
                                                        key={`${room.id}-${time}`} 
                                                        onClick={() => !isFull && handleSlotClick(room, time)}
                                                        className={`flex-1 min-w-[200px] h-14 rounded-2xl border transition-all flex flex-col justify-center px-4 relative overflow-hidden group cursor-pointer ${
                                                            occupancy.length > 0 
                                                                ? (isFull ? 'bg-red-50 border-red-100' : 'bg-green-50 border-green-100 shadow-inner') 
                                                                : 'bg-white border-gray-50 border-dashed opacity-40 hover:opacity-100 hover:border-brand-primary/30'
                                                        }`}
                                                    >
                                                        {occupancy.length > 0 ? (
                                                            <>
                                                                <div className="flex items-center justify-between relative z-10">
                                                                    <div className="flex -space-x-2">
                                                                        {Array.from(new Set(occupancy.map(o => o.doctor?.id))).map((docId, idx) => {
                                                                            const doc = occupancy.find(o => o.doctor?.id === docId)?.doctor;
                                                                            return (
                                                                                <div key={docId} title={doc?.name} className="w-7 h-7 rounded-lg bg-white border border-gray-100 flex items-center justify-center text-[10px] font-black text-brand-primary shadow-sm hover:z-20 transition-all transform hover:scale-110">
                                                                                    {doc?.name[0]}
                                                                                </div>
                                                                            );
                                                                        })}
                                                                    </div>
                                                                    <span className={`text-[10px] font-black ${isFull ? 'text-red-600' : 'text-green-600'}`}>
                                                                        {occupancy.length}/{room.capacity}
                                                                    </span>
                                                                </div>
                                                                <div className="absolute bottom-0 left-0 h-1 bg-current opacity-20" style={{ width: `${percent}%` }}></div>
                                                            </>
                                                        ) : (
                                                            <div className="flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                                <Plus className="w-4 h-4 text-brand-primary/40" />
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </SideModal>

            {/* Modal de Agendamiento Rápido */}
            {selectedSlot && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-in zoom-in-95">
                    <div className="bg-white rounded-[2.5rem] shadow-2xl max-w-2xl w-full flex flex-col overflow-hidden">
                        <div className="p-6 border-b flex justify-between items-center bg-brand-primary text-white shrink-0">
                            <div>
                                <h2 className="text-lg font-black uppercase">Agendar en {selectedSlot.room.name}</h2>
                                <p className="text-[9px] font-bold uppercase opacity-80">{selectedDate} @ {selectedSlot.time}</p>
                            </div>
                            <button onClick={() => setSelectedSlot(null)} className="p-2 hover:bg-white/10 rounded-xl transition-colors"><X /></button>
                        </div>
                        
                        <div className="p-8 space-y-6 overflow-y-auto max-h-[70vh] bg-gray-50/20">
                            <div className="space-y-4">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-gray-400 uppercase">Paciente</label>
                                    <div className="flex gap-2">
                                        <SearchSelect 
                                            options={localPatients} 
                                            value={data.patient_id} 
                                            onChange={v => setData("patient_id", v)} 
                                            className="flex-1" 
                                            config={{ valueKey:'id', displayKey:'full_name', secondaryKeys:['rut'], searchKeys:['full_name','rut'] }} 
                                        />
                                        <button type="button" onClick={() => setShowQuickPatient(true)} className="p-4 bg-brand-primary/10 text-brand-primary rounded-2xl h-[52px] flex items-center justify-center"><Plus /></button>
                                    </div>
                                    {errors.patient_id && <p className="text-red-500 text-[10px] font-bold uppercase mt-1">{errors.patient_id}</p>}
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black text-gray-400 uppercase">Servicio</label>
                                        <SearchSelect 
                                            options={items} 
                                            value={data.item_id} 
                                            onChange={v => setData("item_id", v)} 
                                            config={{ valueKey:'id', displayKey:'name', searchKeys:['name'] }} 
                                        />
                                        {errors.item_id && <p className="text-red-500 text-[10px] font-bold uppercase mt-1">{errors.item_id}</p>}
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black text-gray-400 uppercase">Especialista</label>
                                        <SearchSelect 
                                            options={doctors} 
                                            value={data.doctor_id} 
                                            onChange={v => setData("doctor_id", v)} 
                                            config={{ valueKey:'id', displayKey:'name', searchKeys:['name'] }} 
                                        />
                                        {errors.doctor_id && <p className="text-red-500 text-[10px] font-bold uppercase mt-1">{errors.doctor_id}</p>}
                                    </div>
                                </div>

                                <div className="p-5 bg-brand-primary/5 rounded-3xl border border-brand-primary/10 flex justify-between items-center">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-white rounded-xl shadow-sm"><Clock className="w-4 h-4 text-brand-primary"/></div>
                                        <div>
                                            <p className="text-[9px] font-black text-brand-primary uppercase opacity-60">Horario Sugerido</p>
                                            <p className="text-sm font-black text-gray-900">{data.start_time} — {data.end_time}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[9px] font-black text-gray-400 uppercase">Duración</p>
                                        <p className="text-sm font-black text-gray-900">30 min</p>
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-gray-400 uppercase">Notas adicionales</label>
                                    <textarea 
                                        value={data.notes} 
                                        onChange={e => setData("notes", e.target.value)} 
                                        rows="2" 
                                        placeholder="Ej: Trae orden médica..." 
                                        className="w-full px-5 py-4 bg-white border-2 border-gray-100 rounded-2xl font-bold text-sm focus:border-brand-primary transition-all"
                                    ></textarea>
                                </div>
                            </div>
                        </div>

                        <div className="p-8 bg-gray-50 border-t flex flex-col gap-3 shrink-0">
                            <div className="flex gap-4">
                                <button 
                                    type="button" 
                                    onClick={() => handleCreateAppointment(true)} 
                                    disabled={processing} 
                                    className="flex-1 py-4 bg-orange-600 text-white font-black uppercase text-[10px] rounded-2xl shadow-xl hover:brightness-110 active:scale-95 disabled:opacity-50"
                                >
                                    Confirmar y Recibir
                                </button>
                                <button 
                                    type="button" 
                                    onClick={() => handleCreateAppointment(false)} 
                                    disabled={processing} 
                                    className="flex-1 py-4 bg-brand-primary text-white font-black uppercase text-[10px] rounded-2xl shadow-xl hover:brightness-110 active:scale-95 disabled:opacity-50"
                                >
                                    Agendar Reserva
                                </button>
                            </div>
                            <button type="button" onClick={() => setSelectedSlot(null)} className="w-full py-3 bg-white text-gray-400 font-black uppercase text-[10px] border rounded-xl hover:bg-gray-50">Cancelar</button>
                        </div>
                    </div>
                </div>
            )}

            <QuickPatientModal 
                isOpen={showQuickPatient} 
                onClose={() => setShowQuickPatient(false)}
                regions={regions}
                communes={communes}
                onSuccess={(newPatient) => {
                    if (newPatient) {
                        const formatted = {
                            ...newPatient,
                            full_name: `${newPatient.name} ${newPatient.last_name}`
                        };
                        setLocalPatients(prev => [...prev, formatted]);
                        setData("patient_id", newPatient.id);
                        setShowQuickPatient(false);
                    }
                }}
            />
        </>
    );
}
