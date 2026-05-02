import React, { useState, useMemo, useEffect } from "react";
import { useForm, router } from "@inertiajs/react";
import { 
    Clock, 
    Plus, 
    Trash2, 
    Calendar as CalendarIcon, 
    Layers,
    AlertTriangle,
    CheckCircle2,
    Pencil,
    Building,
    Coffee,
    User,
    MapPin,
    X
} from "lucide-react";
import PrimaryButton from "@/components/PrimaryButton";
import SideModal from "@/components/SideModal";
import InputError from "@/components/InputError";
import TextInput from "@/components/TextInput";
import Swal from "sweetalert2";

const dayLabels = {
    "MO": "Lun",
    "TU": "Mar",
    "WE": "Mié",
    "TH": "Jue",
    "FR": "Vie",
    "SA": "Sáb",
    "SU": "Dom"
};

export default function DoctorAvailability({ doctor, availabilities = [], all_availabilities = [], rooms = [], branches = [] }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingAvailability, setEditingAvailability] = useState(null);

    const avForm = useForm({
        doctor_id: doctor.id,
        branch_id: "",
        room_id: "",
        modality: "onsite",
        rrule: "", 
        start_time: "09:00",
        end_time: "18:00",
        lunch_start_time: "13:00",
        lunch_end_time: "14:00",
        valid_from: new Date().toISOString().split('T')[0],
        valid_until: "",
        days: [], 
    });

    // Sincronizar edición
    useEffect(() => {
        if (editingAvailability) {
            const days = editingAvailability.rrule.split('BYDAY=')[1]?.split(',') || [];
            avForm.setData({
                doctor_id: doctor.id,
                branch_id: editingAvailability.branch_id,
                room_id: editingAvailability.room_id || "",
                modality: editingAvailability.modality || "onsite",
                rrule: editingAvailability.rrule,
                start_time: editingAvailability.start_time.substring(0, 5),
                end_time: editingAvailability.end_time.substring(0, 5),
                lunch_start_time: editingAvailability.lunch_start_time?.substring(0, 5) || "",
                lunch_end_time: editingAvailability.lunch_end_time?.substring(0, 5) || "",
                valid_from: editingAvailability.valid_from,
                valid_until: editingAvailability.valid_until || "",
                days: days,
            });
        } else {
            avForm.reset();
        }
    }, [editingAvailability]);

    const daysOfWeek = [
        { label: "Lunes", value: "MO" },
        { label: "Martes", value: "TU" },
        { label: "Miércoles", value: "WE" },
        { label: "Jueves", value: "TH" },
        { label: "Viernes", value: "FR" },
        { label: "Sábado", value: "SA" },
        { label: "Domingo", value: "SU" },
    ];

    const toggleDay = (day) => {
        const newDays = avForm.data.days.includes(day)
            ? avForm.data.days.filter(d => d !== day)
            : [...avForm.data.days, day];
        
        avForm.setData({
            ...avForm.data,
            days: newDays,
            rrule: `FREQ=WEEKLY;BYDAY=${newDays.join(",")}`
        });
    };

    const submit = (e) => {
        e.preventDefault();
        if (avForm.data.days.length === 0) return Swal.fire("Error", "Selecciona al menos un día", "error");
        
        if (editingAvailability) {
            avForm.put(route('availabilities.update', editingAvailability.id), {
                onSuccess: () => {
                    setIsModalOpen(false);
                    setEditingAvailability(null);
                    Swal.fire({ title: "¡Actualizado!", icon: "success", toast: true, position: 'top-end', showConfirmButton: false, timer: 3000 });
                }
            });
        } else {
            avForm.post(route('availabilities.store'), {
                onSuccess: () => {
                    setIsModalOpen(false);
                    avForm.reset();
                    Swal.fire({ title: "¡Creado!", icon: "success", toast: true, position: 'top-end', showConfirmButton: false, timer: 3000 });
                }
            });
        }
    };

    const deleteAvailability = (id) => {
        Swal.fire({
            title: '¿Eliminar disponibilidad?',
            text: "El profesional ya no aparecerá como disponible en estos horarios",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Sí, eliminar',
            confirmButtonColor: '#ef4444',
        }).then((result) => {
            if (result.isConfirmed) {
                router.delete(route('availabilities.destroy', id));
            }
        });
    };

    const roomOptions = useMemo(() => {
        if (!avForm.data.branch_id) return [];
        return rooms.filter(r => r.branch_id == avForm.data.branch_id);
    }, [rooms, avForm.data.branch_id]);

    // --- 🚨 DETECCIÓN DE CONFLICTOS EN TIEMPO REAL ---
    const conflicts = useMemo(() => {
        if (avForm.data.modality === 'home' || !avForm.data.room_id || avForm.data.days.length === 0) return [];
        
        return all_availabilities.filter(av => {
            if (editingAvailability && av.id === editingAvailability.id) return false;
            if (av.branch_id != avForm.data.branch_id || av.room_id != avForm.data.room_id) return false;

            const avDays = av.rrule.split('BYDAY=')[1]?.split(',') || [];
            const hasCommonDay = avForm.data.days.some(d => avDays.includes(d));
            if (!hasCommonDay) return false;

            const startA = avForm.data.start_time;
            const endA = avForm.data.end_time;
            const startB = av.start_time.substring(0, 5);
            const endB = av.end_time.substring(0, 5);

            return (startA < endB && endA > startB);
        });
    }, [avForm.data.modality, avForm.data.room_id, avForm.data.days, avForm.data.start_time, avForm.data.end_time, all_availabilities, editingAvailability]);

    return (
        <div className="space-y-6">
            {/* Header de Sección */}
            <div className="flex justify-between items-center bg-white p-8 border border-gray-100 rounded-[2.5rem] shadow-sm">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-brand-primary/10 text-brand-primary rounded-2xl">
                        <Clock className="w-6 h-6" />
                    </div>
                    <div>
                        <h2 className="text-lg font-black text-gray-900 uppercase tracking-widest">Horarios de Atención</h2>
                        <p className="text-[10px] font-bold text-gray-400 uppercase">Configura los bloques y sedes de {doctor.name}</p>
                    </div>
                </div>
                <PrimaryButton 
                    onClick={() => {
                        setEditingAvailability(null);
                        avForm.reset();
                        setIsModalOpen(true);
                    }} 
                    className="!px-6 !py-3"
                >
                    <Plus className="w-4 h-4 mr-2" />
                    Añadir Bloque
                </PrimaryButton>
            </div>

            {/* Parrilla de Disponibilidad */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {availabilities.length === 0 ? (
                    <div className="col-span-full py-24 text-center bg-white rounded-[2.5rem] border-2 border-dashed border-gray-100 flex flex-col items-center justify-center">
                        <CalendarIcon className="w-12 h-12 text-gray-100 mb-4" />
                        <p className="text-xs font-black text-gray-400 uppercase tracking-widest">No hay horarios configurados</p>
                    </div>
                ) : availabilities.map((av) => (
                    <div key={av.id} className="bg-white border border-gray-100 rounded-[2.5rem] p-8 shadow-sm hover:shadow-2xl transition-all group relative overflow-hidden">
                        <div className="flex justify-between items-start mb-6">
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-brand-primary/5 text-brand-primary rounded-xl">
                                    {av.modality === 'home' ? <MapPin className="w-5 h-5" /> : <Building className="w-5 h-5" />}
                                </div>
                                <div>
                                    <p className="text-xs font-black text-gray-900 uppercase tracking-tight">{av.branch?.name}</p>
                                    <p className="text-[9px] font-black text-brand-primary uppercase tracking-widest">
                                        {av.modality === 'home' ? 'Atención a Domicilio' : (av.room?.name || "Box por asignar")}
                                    </p>
                                </div>
                            </div>
                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                                <button 
                                    onClick={() => {
                                        setEditingAvailability(av);
                                        setIsModalOpen(true);
                                    }} 
                                    className="p-2.5 text-gray-300 hover:text-brand-primary hover:bg-brand-primary/5 rounded-xl transition-all"
                                >
                                    <Pencil className="w-4 h-4" />
                                </button>
                                <button 
                                    onClick={() => deleteAvailability(av.id)} 
                                    className="p-2.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        <div className="space-y-3 mb-6">
                            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                <Clock className="w-5 h-5 text-brand-primary opacity-60" />
                                <span className="text-sm font-black text-gray-900 tracking-tight">
                                    {av.start_time.substring(0, 5)} — {av.end_time.substring(0, 5)}
                                </span>
                            </div>

                            {av.lunch_start_time && (
                                <div className="flex items-center gap-4 p-4 bg-amber-50/30 rounded-2xl border border-amber-100/50">
                                    <Coffee className="w-4 h-4 text-amber-500 opacity-60" />
                                    <div>
                                        <p className="text-[8px] font-black text-amber-600 uppercase tracking-widest mb-0.5">Horario de Colación</p>
                                        <span className="text-xs font-black text-amber-700 tracking-tight">
                                            {av.lunch_start_time.substring(0, 5)} — {av.lunch_end_time.substring(0, 5)}
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="flex flex-wrap gap-1.5 pt-6 border-t border-gray-100">
                            {av.rrule.split('BYDAY=')[1]?.split(',').map(day => (
                                <span key={day} className="px-3 py-1.5 bg-brand-primary/5 text-brand-primary text-[9px] font-black rounded-xl uppercase tracking-widest border border-brand-primary/10">
                                    {dayLabels[day] || day}
                                </span>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            {/* Modal de Configuración */}
            <SideModal open={isModalOpen} onClose={() => { setIsModalOpen(false); setEditingAvailability(null); }} title={editingAvailability ? "Editar Disponibilidad" : "Nueva Disponibilidad"} icon={Clock} width="xl">
                <form onSubmit={submit} className="flex flex-col h-full -m-10">
                    <div className="flex-1 overflow-y-auto p-10 space-y-10">
                        {conflicts.length > 0 && (
                            <div className="p-6 bg-red-50 border border-red-100 rounded-[2rem] flex items-start gap-4 animate-pulse">
                                <AlertTriangle className="w-6 h-6 text-red-500 shrink-0" />
                                <div>
                                    <p className="text-[10px] font-black text-red-600 uppercase tracking-widest leading-none mb-1">¡Conflicto de Box Detectado!</p>
                                    <p className="text-[10px] font-bold text-red-400 uppercase leading-relaxed">
                                        Este Box ya está ocupado en el mismo horario por: {conflicts.map(c => c.doctor?.name).join(', ')}.
                                    </p>
                                </div>
                            </div>
                        )}

                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Kinesiólogo Responsable</label>
                            <div className="w-full px-5 py-4 bg-gray-100 rounded-2xl font-bold text-sm text-gray-500 border-none flex items-center gap-3">
                                <User className="w-4 h-4 opacity-40" />
                                {doctor.name} {doctor.last_name}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Sucursal</label>
                                <select
                                    value={avForm.data.branch_id}
                                    onChange={e => avForm.setData(prev => ({ ...prev, branch_id: e.target.value, room_id: "" }))}
                                    className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl font-bold text-sm focus:bg-white focus:ring-2 focus:ring-brand-primary/20 transition-all"
                                    required
                                >
                                    <option value="">Seleccione Sucursal</option>
                                    {branches.map(b => (
                                        <option key={b.id} value={b.id}>{b.name}</option>
                                    ))}
                                </select>
                                <InputError message={avForm.errors.branch_id} />
                            </div>
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Modalidad de Atención</label>
                                <div className="flex bg-gray-50 p-1 rounded-2xl gap-1">
                                    <button 
                                        type="button" 
                                        onClick={() => avForm.setData("modality", "onsite")}
                                        className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[10px] font-black uppercase transition-all ${avForm.data.modality === 'onsite' ? "bg-white text-brand-primary shadow-sm" : "text-gray-400 hover:text-gray-600"}`}
                                    >
                                        <Building className="w-3 h-3" /> En Clínica
                                    </button>
                                    <button 
                                        type="button" 
                                        onClick={() => avForm.setData("modality", "home")}
                                        className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[10px] font-black uppercase transition-all ${avForm.data.modality === 'home' ? "bg-white text-brand-primary shadow-sm" : "text-gray-400 hover:text-gray-600"}`}
                                    >
                                        <MapPin className="w-3 h-3" /> Domicilio
                                    </button>
                                </div>
                            </div>
                        </div>

                        {avForm.data.modality === 'onsite' && (
                            <div className="space-y-3 animate-in fade-in zoom-in-95 duration-200">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Box / Sala Asignada</label>
                                <select
                                    value={avForm.data.room_id}
                                    onChange={e => avForm.setData("room_id", e.target.value)}
                                    className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl font-bold text-sm focus:bg-white focus:ring-2 focus:ring-brand-primary/20 transition-all"
                                    disabled={!avForm.data.branch_id}
                                    required={avForm.data.modality === 'onsite'}
                                >
                                    <option value="">Seleccionar Box...</option>
                                    {roomOptions.map(r => (
                                        <option key={r.id} value={r.id}>{r.name}</option>
                                    ))}
                                </select>
                                <InputError message={avForm.errors.room_id} />
                            </div>
                        )}

                        <div className="space-y-4">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Días de Atención Semanal</label>
                            <div className="grid grid-cols-4 gap-2">
                                {daysOfWeek.map(day => (
                                    <button 
                                        key={day.value} 
                                        type="button" 
                                        onClick={() => toggleDay(day.value)} 
                                        className={`py-4 rounded-2xl text-[10px] font-black uppercase transition-all border-2 ${
                                            avForm.data.days.includes(day.value) 
                                            ? "bg-brand-primary border-brand-primary text-white" 
                                            : "bg-gray-50 border-gray-50 text-gray-400 hover:border-brand-primary/20"
                                        }`}
                                    >
                                        {day.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-gray-400 uppercase ml-1">Hora Inicio</label>
                                <TextInput type="time" value={avForm.data.start_time} onChange={e => avForm.setData("start_time", e.target.value)} required />
                            </div>
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-gray-400 uppercase ml-1">Hora Término</label>
                                <TextInput type="time" value={avForm.data.end_time} onChange={e => avForm.setData("end_time", e.target.value)} required />
                            </div>
                        </div>

                        <div className="p-6 bg-amber-50/50 rounded-[2rem] border border-amber-100/50 space-y-4">
                            <div className="flex justify-between items-center">
                                <p className="text-[9px] font-black text-amber-600 uppercase tracking-widest flex items-center gap-2">
                                    <Coffee className="w-3 h-3" /> Bloque de Colación / Break (Opcional)
                                </p>
                                {(avForm.data.lunch_start_time || avForm.data.lunch_end_time) && (
                                    <button 
                                        type="button" 
                                        onClick={() => {
                                            avForm.setData(prev => ({ ...prev, lunch_start_time: "", lunch_end_time: "" }));
                                        }}
                                        className="text-[8px] font-black text-amber-400 uppercase tracking-widest hover:text-red-500 transition-colors flex items-center gap-1"
                                    >
                                        <X className="w-2.5 h-2.5" /> Borrar
                                    </button>
                                )}
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-[8px] font-black text-gray-400 uppercase ml-1">Inicio Colación</label>
                                    <TextInput type="time" value={avForm.data.lunch_start_time} onChange={e => avForm.setData("lunch_start_time", e.target.value)} className="!bg-white" />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[8px] font-black text-gray-400 uppercase ml-1">Fin Colación</label>
                                    <TextInput type="time" value={avForm.data.lunch_end_time} onChange={e => avForm.setData("lunch_end_time", e.target.value)} className="!bg-white" />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="p-10 bg-gray-50 border-t border-gray-100 flex justify-end gap-4 shrink-0">
                        <button 
                            type="button" 
                            onClick={() => {
                                setIsModalOpen(false);
                                setEditingAvailability(null);
                            }} 
                            className="px-10 py-5 font-black uppercase tracking-widest text-[11px] text-gray-400 hover:text-gray-900 transition-colors"
                        >
                            Cancelar
                        </button>
                        <PrimaryButton disabled={avForm.processing} className="!px-16 !py-5 shadow-2xl shadow-brand-primary/30">
                            {avForm.processing ? '...' : (editingAvailability ? "Actualizar" : "Confirmar")}
                        </PrimaryButton>
                    </div>
                </form>
            </SideModal>
        </div>
    );
}
