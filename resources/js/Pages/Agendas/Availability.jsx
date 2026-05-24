import React, { useState, useMemo } from "react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, useForm, router } from "@inertiajs/react";
import { 
    Clock, 
    Plus, 
    Trash2, 
    Calendar as CalendarIcon, 
    User, 
    Building, 
    Layers,
    X,
    CheckCircle2,
    Pencil,
    ChevronRight,
    MapPin,
    AlertTriangle,
    Coffee,
    CalendarOff,
    Settings2,
    CalendarCheck,
    History,
    Smartphone,
    Ban,
    Save,
} from "lucide-react";
import SearchSelect from "@/components/SearchSelect";
import PrimaryButton from "@/components/PrimaryButton";
import SideModal from "@/components/SideModal";
import EnterpriseSelect from "@/components/EnterpriseSelect";
import TextInput from "@/components/TextInput";
import InputError from "@/components/InputError";
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

const fullDayLabels = {
    "MO": "Lunes",
    "TU": "Martes",
    "WE": "Miércoles",
    "TH": "Jueves",
    "FR": "Viernes",
    "SA": "Sábado",
    "SU": "Domingo"
};

export default function Availability({ 
    availabilities = [], 
    exceptions = [], 
    holidays = [], 
    appointments = [],
    doctors = [], 
    rooms = [], 
    branches = [],
    filters = {}
}) {
    const [activeTab, setActiveTab] = useState("horarios"); // horarios, excepciones, feriados, sucursal
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingAvailability, setEditingAvailability] = useState(null);
    const [selectedDate, setSelectedDate] = useState(filters.date || new Date().toISOString().split('T')[0]);

    // --- MANEJO DE FECHA ---
    const handleDateChange = (date) => {
        setSelectedDate(date);
        router.get(route('availabilities.index'), { date }, { 
            preserveState: true, 
            only: ['appointments', 'filters'] 
        });
    };

    const initialBranchId = filters.active_branch_id || (branches.length > 0 ? branches[0].id : "");
    const activeBranch = branches.find(b => b.id == initialBranchId);
    
    let initialModality = "onsite";
    if (activeBranch) {
        if (activeBranch.allows_onsite) initialModality = "onsite";
        else if (activeBranch.allows_home) initialModality = "home";
        else if (activeBranch.allows_online) initialModality = "online";
    }

    // --- FORMULARIO DISPONIBILIDAD (RECURRENTE) ---
    const avForm = useForm({
        doctor_id: "",
        branch_id: initialBranchId,
        room_id: "",
        modality: initialModality,
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
    React.useEffect(() => {
        if (editingAvailability) {
            const days = editingAvailability.rrule.split('BYDAY=')[1]?.split(',') || [];
            avForm.setData({
                doctor_id: editingAvailability.doctor_id,
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

    const groupedAvailabilities = useMemo(() => {
        return availabilities.reduce((acc, av) => {
            const doctorId = av.doctor_id;
            if (!acc[doctorId]) acc[doctorId] = { doctor: av.doctor, items: [] };
            acc[doctorId].items.push(av);
            return acc;
        }, {});
    }, [availabilities]);

    // --- FORMULARIO EXCEPCIONES (PROFESIONAL) ---
    const exForm = useForm({
        doctor_id: "",
        date: new Date().toISOString().split('T')[0],
        end_date: "",
        action: "cancel",
        override_start_time: "",
        override_end_time: "",
        room_id: "",
        modality: "",
        reason: "",
    });

    // --- FORMULARIO FERIADOS (EMPRESA/SUCURSAL) ---
    const holForm = useForm({
        name: "",
        date: new Date().toISOString().split('T')[0],
        end_date: "",
        start_time: "",
        end_time: "",
        branch_id: "",
        room_id: "",
        is_recurring: false,
    });

    // --- FORMULARIO HORARIO SUCURSAL ---
    const branchForm = useForm({
        schedule: activeBranch?.schedule || {
            "MO": { open: "08:00", close: "20:00" },
            "TU": { open: "08:00", close: "20:00" },
            "WE": { open: "08:00", close: "20:00" },
            "TH": { open: "08:00", close: "20:00" },
            "FR": { open: "08:00", close: "20:00" },
            "SA": { open: "09:00", close: "14:00" },
            "SU": { open: "", close: "" },
        }
    });

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

    const submitAv = (e) => {
        e.preventDefault();
        if (avForm.data.days.length === 0) return Swal.fire("Error", "Selecciona al menos un día", "error");
        
        if (editingAvailability) {
            avForm.put(route('availabilities.update', editingAvailability.id), {
                onSuccess: () => {
                    setIsModalOpen(false);
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

    const submitException = (e) => {
        e.preventDefault();
        exForm.post(route('availabilities.exceptions.store'), {
            onSuccess: () => {
                setIsModalOpen(false);
                exForm.reset();
                Swal.fire({ title: "Excepción Registrada", icon: "success", toast: true, position: 'top-end', showConfirmButton: false, timer: 3000 });
            }
        });
    };

    const submitHoliday = (e) => {
        e.preventDefault();
        holForm.post(route('availabilities.holidays.store'), {
            onSuccess: () => {
                setIsModalOpen(false);
                holForm.reset();
                Swal.fire({ title: "Feriado Guardado", icon: "success", toast: true, position: 'top-end', showConfirmButton: false, timer: 3000 });
            }
        });
    };

    const submitBranchSchedule = (e) => {
        e.preventDefault();
        branchForm.put(route('branches.schedule.update', activeBranch.id), {
            onSuccess: () => {
                Swal.fire({ title: "Horario Clínica Actualizado", icon: "success", toast: true, position: 'top-end', showConfirmButton: false, timer: 3000 });
            }
        });
    };

    const deleteItem = (type, id) => {
        Swal.fire({
            title: '¿Confirmar eliminación?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
        }).then((result) => {
            if (result.isConfirmed) {
                const routes = {
                    av: 'availabilities.destroy',
                    ex: 'availabilities.exceptions.destroy',
                    hol: 'availabilities.holidays.destroy'
                };
                router.delete(route(routes[type], id));
            }
        });
    };

    const branchOptions = useMemo(() => branches.map(b => ({ label: b.name, value: b.id })), [branches]);
    const doctorOptions = useMemo(() => doctors.map(d => ({ label: d.name, value: d.id })), [doctors]);
    
    // roomOptions para avForm
    const roomOptionsAv = useMemo(() => {
        if (!avForm.data.branch_id) return [];
        return rooms.filter(r => r.branch_id == avForm.data.branch_id).map(r => ({ label: r.name, value: r.id }));
    }, [rooms, avForm.data.branch_id]);

    // roomOptions para holForm
    const roomOptionsHol = useMemo(() => {
        if (!holForm.data.branch_id) return [];
        return rooms.filter(r => r.branch_id == holForm.data.branch_id).map(r => ({ label: r.name, value: r.id }));
    }, [rooms, holForm.data.branch_id]);

    // roomOptions para exForm (Usa la sucursal activa por defecto)
    const roomOptionsEx = useMemo(() => {
        const bId = initialBranchId;
        if (!bId) return [];
        return rooms.filter(r => r.branch_id == bId).map(r => ({ label: r.name, value: r.id }));
    }, [rooms, initialBranchId]);

    return (
        <AuthenticatedLayout>
            <Head title="Gestión de Disponibilidad" />
            
            <div className="p-8 bg-gray-50 min-h-screen">
                <div className="max-w-7xl mx-auto">
                    {/* Header Premium con Tabs */}
                    <div className="bg-white border border-gray-100 shadow-sm rounded-[3rem] p-4 mb-10">
                        <div className="flex flex-col lg:flex-row justify-between items-center gap-6 px-6 py-4">
                            <div className="flex items-center gap-6">
                                <div className="w-16 h-16 bg-brand-primary text-white rounded-2xl flex items-center justify-center shadow-2xl shadow-brand-primary/30">
                                    <Clock className="w-8 h-8" />
                                </div>
                                <div>
                                    <h1 className="text-2xl font-black text-gray-900 uppercase tracking-tighter">Gestión de Tiempos</h1>
                                    <div className="flex items-center gap-4 mt-1">
                                        <button onClick={() => setActiveTab("horarios")} className={`text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'horarios' ? 'text-brand-primary border-b-2 border-brand-primary' : 'text-gray-400 hover:text-gray-600'}`}>Horarios Kine</button>
                                        <button onClick={() => setActiveTab("excepciones")} className={`text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'excepciones' ? 'text-brand-primary border-b-2 border-brand-primary' : 'text-gray-400 hover:text-gray-600'}`}>Excepciones</button>
                                        <button onClick={() => setActiveTab("feriados")} className={`text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'feriados' ? 'text-brand-primary border-b-2 border-brand-primary' : 'text-gray-400 hover:text-gray-600'}`}>Feriados / Cierres</button>
                                        <button onClick={() => setActiveTab("sucursal")} className={`text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'sucursal' ? 'text-brand-primary border-b-2 border-brand-primary' : 'text-gray-400 hover:text-gray-600'}`}>Horario Clínica</button>
                                    </div>
                                </div>
                            </div>
                            {activeTab !== 'sucursal' && (
                                <button 
                                    onClick={() => {
                                        setEditingAvailability(null);
                                        avForm.reset();
                                        exForm.reset();
                                        holForm.reset();
                                        setIsModalOpen(true);
                                    }} 
                                    className="flex items-center gap-3 px-10 py-5 bg-gray-900 text-white rounded-3xl font-black text-[11px] uppercase tracking-[0.1em] hover:bg-black hover:scale-105 transition-all shadow-xl shadow-gray-200"
                                >
                                    <Plus className="w-5 h-5" />
                                    {activeTab === 'horarios' ? 'Definir Horario' : activeTab === 'excepciones' ? 'Añadir Excepción' : 'Añadir Feriado'}
                                </button>
                            )}
                        </div>
                    </div>

                    {/* CONTENIDO SEGÚN TAB */}
                    <div className="space-y-12">
                        {activeTab === 'horarios' && (
                            Object.keys(groupedAvailabilities).length === 0 ? <EmptyState icon={Clock} title="Sin horarios configurados" /> : 
                            Object.values(groupedAvailabilities).map(group => (
                                <div key={group.doctor.id} className="space-y-6">
                                    <div className="flex items-center gap-4 px-4">
                                        <div className="w-10 h-10 bg-white border border-gray-100 rounded-xl flex items-center justify-center text-brand-primary shadow-sm"><User className="w-5 h-5" /></div>
                                        <div>
                                            <h2 className="text-lg font-black text-gray-900 uppercase tracking-tight">{group.doctor.name}</h2>
                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{group.items.length} Horarios de atención</p>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {group.items.map(av => (
                                            <AvailabilityCard key={av.id} av={av} onEdit={() => { setEditingAvailability(av); setIsModalOpen(true); }} onDelete={() => deleteItem('av', av.id)} />
                                        ))}
                                    </div>
                                </div>
                            ))
                        )}

                        {activeTab === 'excepciones' && (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {exceptions.length === 0 ? <EmptyState icon={CalendarOff} title="Sin excepciones registradas" /> : 
                                exceptions.map(ex => <ExceptionCard key={ex.id} ex={ex} onDelete={() => deleteItem('ex', ex.id)} />)}
                            </div>
                        )}

                        {activeTab === 'feriados' && (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {holidays.length === 0 ? <EmptyState icon={Coffee} title="Sin feriados configurados" /> : 
                                holidays.map(hol => <HolidayCard key={hol.id} hol={hol} onDelete={() => deleteItem('hol', hol.id)} />)}
                            </div>
                        )}

                        {activeTab === 'sucursal' && (
                            <div className="max-w-4xl">
                                <div className="bg-white border border-gray-100 rounded-[3rem] p-10 shadow-sm relative overflow-hidden">
                                    <div className="absolute top-0 right-0 p-8 opacity-5"><Building className="w-32 h-32" /></div>
                                    <div className="relative z-10">
                                        <div className="flex items-center gap-4 mb-8">
                                            <div className="w-12 h-12 bg-brand-primary/10 text-brand-primary rounded-2xl flex items-center justify-center"><Building className="w-6 h-6" /></div>
                                            <div>
                                                <h2 className="text-xl font-black text-gray-900 uppercase tracking-tighter">Horario de Operación</h2>
                                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Límites físicos de la sucursal: {activeBranch?.name}</p>
                                            </div>
                                        </div>

                                        <form onSubmit={submitBranchSchedule} className="space-y-6">
                                            <div className="grid grid-cols-1 gap-4">
                                                {daysOfWeek.map(day => (
                                                    <div key={day.value} className="flex items-center justify-between p-6 bg-gray-50 rounded-3xl border border-gray-100 group hover:bg-white hover:shadow-xl transition-all duration-300">
                                                        <div className="w-32">
                                                            <p className="text-sm font-black text-gray-900 uppercase tracking-tight">{day.label}</p>
                                                            <p className={`text-[8px] font-black uppercase tracking-widest ${branchForm.data.schedule[day.value]?.open ? 'text-green-500' : 'text-red-400'}`}>
                                                                {branchForm.data.schedule[day.value]?.open ? 'Abierto' : 'Cerrado'}
                                                            </p>
                                                        </div>
                                                        <div className="flex items-center gap-6">
                                                            <div className="flex items-center gap-3">
                                                                <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Apertura</label>
                                                                <TextInput 
                                                                    type="time" 
                                                                    className="!bg-white !py-2 !px-4 !text-xs !rounded-xl"
                                                                    value={branchForm.data.schedule[day.value]?.open || ""} 
                                                                    onChange={e => branchForm.setData("schedule", {
                                                                        ...branchForm.data.schedule,
                                                                        [day.value]: { ...branchForm.data.schedule[day.value], open: e.target.value }
                                                                    })}
                                                                />
                                                            </div>
                                                            <div className="flex items-center gap-3">
                                                                <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Cierre</label>
                                                                <TextInput 
                                                                    type="time" 
                                                                    className="!bg-white !py-2 !px-4 !text-xs !rounded-xl"
                                                                    value={branchForm.data.schedule[day.value]?.close || ""} 
                                                                    onChange={e => branchForm.setData("schedule", {
                                                                        ...branchForm.data.schedule,
                                                                        [day.value]: { ...branchForm.data.schedule[day.value], close: e.target.value }
                                                                    })}
                                                                />
                                                            </div>
                                                            <button 
                                                                type="button" 
                                                                onClick={() => branchForm.setData("schedule", {
                                                                    ...branchForm.data.schedule,
                                                                    [day.value]: { open: "", close: "" }
                                                                })}
                                                                className="p-2 text-gray-300 hover:text-red-500 transition-colors"
                                                            >
                                                                <X className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>

                                            <div className="flex justify-end pt-6">
                                                <PrimaryButton disabled={branchForm.processing} className="!px-12 !py-4 shadow-xl shadow-brand-primary/20">
                                                    <Save className="w-4 h-4 mr-2" />
                                                    {branchForm.processing ? 'Guardando...' : 'Guardar Horario General'}
                                                </PrimaryButton>
                                            </div>
                                        </form>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* MODAL MULTIPROPÓSITO */}
                <SideModal 
                    open={isModalOpen} 
                    onClose={() => { setIsModalOpen(false); setEditingAvailability(null); }} 
                    title={activeTab === 'horarios' ? (editingAvailability ? "Editar Horario" : "Definir Horario") : activeTab === 'excepciones' ? "Excepción de Agenda" : "Feriado / Cierre"} 
                    icon={activeTab === 'horarios' ? Clock : activeTab === 'excepciones' ? CalendarOff : Coffee} 
                    width="xl"
                >
                    <div className="flex-1 flex flex-col min-h-0">
                        {activeTab === 'horarios' && <HorarioForm form={avForm} onSubmit={submitAv} editing={editingAvailability} doctorOptions={doctorOptions} branchOptions={branchOptions} branches={branches} roomOptions={roomOptionsAv} daysOfWeek={daysOfWeek} toggleDay={toggleDay} onCancel={() => { setIsModalOpen(false); setEditingAvailability(null); }} availabilities={availabilities} />}
                        {activeTab === 'excepciones' && <ExceptionForm form={exForm} onSubmit={submitException} doctorOptions={doctorOptions} branchOptions={branchOptions} roomOptions={roomOptionsEx} onCancel={() => setIsModalOpen(false)} />}
                        {activeTab === 'feriados' && <HolidayForm form={holForm} onSubmit={submitHoliday} branchOptions={branchOptions} roomOptions={roomOptionsHol} onCancel={() => setIsModalOpen(false)} />}
                    </div>
                </SideModal>
            </div>
        </AuthenticatedLayout>
    );
}

// --- SUBCOMPONENTES ---

const EmptyState = ({ icon: Icon, title }) => (
    <div className="col-span-full py-32 text-center bg-white rounded-[3rem] border-2 border-dashed border-gray-100 flex flex-col items-center justify-center w-full">
        <div className="w-24 h-24 bg-gray-50 rounded-[2rem] flex items-center justify-center mb-6"><Icon className="w-10 h-10 text-gray-200" /></div>
        <h3 className="text-xl font-black text-gray-900 uppercase tracking-tight mb-2">{title}</h3>
    </div>
);

const AvailabilityCard = ({ av, onEdit, onDelete }) => (
    <div className="bg-white border border-gray-100 rounded-[2.5rem] p-8 shadow-sm hover:shadow-2xl transition-all group overflow-hidden relative">
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
                <button onClick={onEdit} className="p-2.5 text-gray-300 hover:text-brand-primary hover:bg-brand-primary/5 rounded-xl transition-all"><Pencil className="w-4 h-4" /></button>
                <button onDelete={onDelete} className="p-2.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"><Trash2 className="w-4 h-4" /></button>
            </div>
        </div>
        <div className="space-y-3 mb-6">
            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                <Clock className="w-5 h-5 text-brand-primary opacity-60" />
                <span className="text-sm font-black text-gray-900 tracking-tight">{av.start_time.substring(0, 5)} — {av.end_time.substring(0, 5)}</span>
            </div>
            
            {av.lunch_start_time && (
                <div className="flex items-center gap-4 p-4 bg-amber-50/30 rounded-2xl border border-amber-100/50">
                    <Coffee className="w-4 h-4 text-amber-500 opacity-60" />
                    <div>
                        <p className="text-[8px] font-black text-amber-600 uppercase tracking-widest mb-0.5">Horario de Colación</p>
                        <span className="text-xs font-black text-amber-700 tracking-tight">{av.lunch_start_time.substring(0, 5)} — {av.lunch_end_time.substring(0, 5)}</span>
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
);

const ExceptionCard = ({ ex, onDelete }) => (
    <div className="bg-white border border-red-50 rounded-[2.5rem] p-8 shadow-sm hover:shadow-2xl transition-all group overflow-hidden relative">
        <div className="absolute top-0 right-0 p-4">
            {ex.action === 'open' ? <CalendarCheck className="w-5 h-5 text-green-100" /> : <AlertTriangle className="w-5 h-5 text-red-100" />}
        </div>
        <div className="flex justify-between items-start mb-6">
            <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center border ${ex.action === 'open' ? 'bg-green-50 text-green-500 border-green-100' : 'bg-red-50 text-red-500 border-red-100'}`}>
                    {ex.action === 'open' ? <CalendarCheck className="w-6 h-6" /> : <CalendarOff className="w-6 h-6" />}
                </div>
                <div>
                    <p className="text-sm font-black text-gray-900 uppercase tracking-tight leading-none mb-1">{ex.doctor?.name}</p>
                    <p className={`text-[9px] font-black uppercase tracking-widest ${ex.action === 'open' ? 'text-green-500' : 'text-red-400'}`}>
                        {ex.action === 'open' ? 'Apertura Especial' : (ex.action === 'cancel' ? 'Turno Cancelado' : 'Turno Modificado')}
                    </p>
                </div>
            </div>
            <button onClick={onDelete} className="p-2.5 text-gray-300 hover:text-red-500 rounded-xl transition-all opacity-0 group-hover:opacity-100"><Trash2 className="w-4 h-4" /></button>
        </div>
        <div className={`p-4 rounded-2xl border mb-4 ${ex.action === 'open' ? 'bg-green-50/50 border-green-100/50' : 'bg-red-50/50 border-red-100/50'}`}>
            <p className={`text-[10px] font-black uppercase tracking-widest mb-1 ${ex.action === 'open' ? 'text-green-600' : 'text-red-600'}`}>
                {new Date(ex.date).toLocaleDateString('es-CL', { weekday: 'long', day: 'numeric', month: 'long' })}
            </p>
            {ex.action === 'open' && (
                <p className="text-[10px] font-black text-green-700 uppercase tracking-tight mb-1">
                    {ex.override_start_time.substring(0, 5)} — {ex.override_end_time.substring(0, 5)}
                </p>
            )}
            {ex.reason && <p className="text-[10px] font-bold text-gray-500 uppercase italic">"{ex.reason}"</p>}
        </div>
    </div>
);

const HolidayCard = ({ hol, onDelete }) => (
    <div className="bg-white border border-amber-50 rounded-[2.5rem] p-8 shadow-sm hover:shadow-2xl transition-all group overflow-hidden relative">
        <div className="absolute top-0 right-0 p-4"><Coffee className="w-5 h-5 text-amber-100" /></div>
        <div className="flex justify-between items-start mb-6">
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center text-amber-600 border border-amber-100"><CalendarIcon className="w-6 h-6" /></div>
                <div>
                    <p className="text-sm font-black text-gray-900 uppercase tracking-tight leading-none mb-1">{hol.name}</p>
                    <p className="text-[9px] font-black text-amber-500 uppercase tracking-widest">{hol.branch?.name || 'Toda la Empresa'}</p>
                </div>
            </div>
            <button onClick={onDelete} className="p-2.5 text-gray-300 hover:text-red-500 rounded-xl transition-all opacity-0 group-hover:opacity-100"><Trash2 className="w-4 h-4" /></button>
        </div>
        <div className="p-4 bg-amber-50/50 rounded-2xl border border-amber-100/50">
            <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest">{new Date(hol.date).toLocaleDateString('es-CL', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
            {hol.is_recurring && <span className="text-[8px] font-black text-amber-400 uppercase tracking-widest mt-1 block">↺ Recurrente Anual</span>}
        </div>
    </div>
);

// --- FORMULARIOS ---

const HorarioForm = ({ form, onSubmit, editing, doctorOptions, branchOptions, branches = [], roomOptions, daysOfWeek, toggleDay, onCancel, availabilities = [] }) => {
    // --- 🚨 DETECCIÓN DE CONFLICTOS EN TIEMPO REAL ---
    const conflicts = useMemo(() => {
        if (form.data.modality === 'home' || !form.data.room_id || form.data.days.length === 0) return [];
        
        return availabilities.filter(av => {
            // No compararse consigo mismo si estamos editando
            if (editing && av.id === editing.id) return false;
            
            // Misma sucursal y mismo box
            if (av.branch_id != form.data.branch_id || av.room_id != form.data.room_id) return false;

            // Mismos días
            const avDays = av.rrule.split('BYDAY=')[1]?.split(',') || [];
            const hasCommonDay = form.data.days.some(d => avDays.includes(d));
            if (!hasCommonDay) return false;

            // Traslape de horas
            const startA = form.data.start_time;
            const endA = form.data.end_time;
            const startB = av.start_time.substring(0, 5);
            const endB = av.end_time.substring(0, 5);

            return (startA < endB && endA > startB);
        });
    }, [form.data.modality, form.data.room_id, form.data.days, form.data.start_time, form.data.end_time, availabilities, editing]);

    React.useEffect(() => {
        const branch = branches.find(b => b.id == form.data.branch_id);
        if (branch) {
            const validModalities = [];
            if (branch.allows_onsite) validModalities.push('onsite');
            if (branch.allows_home) validModalities.push('home');
            if (branch.allows_online) validModalities.push('online');
            
            if (!validModalities.includes(form.data.modality) && validModalities.length > 0) {
                form.setData("modality", validModalities[0]);
            }
        }
    }, [form.data.branch_id]);

    return (
        <form onSubmit={onSubmit} className="flex flex-col h-full">
            <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
                {conflicts.length > 0 && (
                    <div className="p-5 bg-red-50 border border-red-100 rounded-[2rem] flex items-start gap-4 animate-pulse">
                        <AlertTriangle className="w-5 h-5 text-red-500 shrink-0" />
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
                    <EnterpriseSelect options={doctorOptions} value={form.data.doctor_id} onChange={val => form.setData("doctor_id", val)} placeholder="Seleccionar profesional..." icon={User} required />
                    <InputError message={form.errors.doctor_id} />
                </div>
                
                <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-3">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Sucursal</label>
                        <div className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl font-bold text-sm text-gray-500 cursor-not-allowed flex items-center gap-3">
                            <Building className="w-4 h-4 text-brand-primary" />
                            {branches.find(b => b.id == form.data.branch_id)?.name || "Sucursal Actual"}
                        </div>
                    </div>
                    {(() => {
                        const branch = branches.find(b => b.id == form.data.branch_id);
                        const modalities = [];
                        if (branch?.allows_onsite) modalities.push({ label: 'Atención en Clínica', value: 'onsite' });
                        if (branch?.allows_home) modalities.push({ label: 'Atención a Domicilio', value: 'home' });
                        if (branch?.allows_online) modalities.push({ label: 'Telemedicina / Online', value: 'online' });

                        if (modalities.length > 1) {
                            return (
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Modalidad de Atención</label>
                                    <EnterpriseSelect 
                                        options={modalities} 
                                        value={form.data.modality} 
                                        onChange={val => form.setData("modality", val)} 
                                        icon={Smartphone} 
                                        required 
                                    />
                                </div>
                            );
                        }
                        
                        return (
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Modalidad</label>
                                <div className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl font-bold text-sm text-gray-500 cursor-not-allowed flex items-center gap-3">
                                    <Building className="w-4 h-4 text-brand-primary" />
                                    {modalities[0]?.label || "Atención en Clínica"}
                                </div>
                            </div>
                        );
                    })()}
                </div>

                    <div className="space-y-3 animate-in fade-in zoom-in-95 duration-200">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Box / Sala Preferente</label>
                        <EnterpriseSelect 
                            icon={Layers} 
                            value={form.data.room_id} 
                            onChange={val => form.setData("room_id", val)} 
                            options={roomOptions} 
                            placeholder={form.data.modality === 'onsite' ? "Libre de Box (Supervisión Múltiple)" : "No aplica (Remoto)"} 
                            disabled={!form.data.branch_id || form.data.modality !== 'onsite'} 
                        />
                        {form.data.modality === 'onsite' && !form.data.room_id && (
                            <p className="text-[8px] text-brand-primary font-black uppercase tracking-tight ml-1 animate-pulse">
                                ✨ Modo Libre: Podrás supervisar hasta 3 pacientes en distintos boxes.
                            </p>
                        )}
                    </div>
                <div className="space-y-4">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Días de Atención Semanal</label>
                    <div className="grid grid-cols-4 gap-2">
                        {daysOfWeek.map(day => (
                            <button key={day.value} type="button" onClick={() => toggleDay(day.value)} className={`py-3.5 rounded-2xl text-[10px] font-black uppercase transition-all border-2 ${form.data.days.includes(day.value) ? "bg-brand-primary border-brand-primary text-white" : "bg-gray-50 border-gray-50 text-gray-400 hover:border-brand-primary/20"}`}>{day.label}</button>
                        ))}
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-3"><label className="text-[10px] font-black text-gray-400 uppercase ml-1">Hora Inicio</label><TextInput type="time" value={form.data.start_time} onChange={e => form.setData("start_time", e.target.value)} required /></div>
                    <div className="space-y-3"><label className="text-[10px] font-black text-gray-400 uppercase ml-1">Hora Término</label><TextInput type="time" value={form.data.end_time} onChange={e => form.setData("end_time", e.target.value)} required /></div>
                </div>

                <div className="p-5 bg-amber-50/50 rounded-[2rem] border border-amber-100/50 space-y-4">
                    <div className="flex justify-between items-center">
                        <p className="text-[9px] font-black text-amber-600 uppercase tracking-widest flex items-center gap-2">
                            <Coffee className="w-3 h-3" /> Bloque de Colación / Break (Opcional)
                        </p>
                        {(form.data.lunch_start_time || form.data.lunch_end_time) && (
                            <button 
                                type="button" 
                                onClick={() => {
                                    form.setData(prev => ({ ...prev, lunch_start_time: "", lunch_end_time: "" }));
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
                            <TextInput type="time" value={form.data.lunch_start_time} onChange={e => form.setData("lunch_start_time", e.target.value)} className="!bg-white" />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[8px] font-black text-gray-400 uppercase ml-1">Fin Colación</label>
                            <TextInput type="time" value={form.data.lunch_end_time} onChange={e => form.setData("lunch_end_time", e.target.value)} className="!bg-white" />
                        </div>
                    </div>
                </div>
            </div>
            <FormFooter processing={form.processing} onCancel={onCancel} confirmText={editing ? "Actualizar" : "Confirmar"} />
        </form>
    );
};

const ExceptionForm = ({ form, onSubmit, doctorOptions, branchOptions, roomOptions, onCancel }) => (
    <form onSubmit={onSubmit} className="flex flex-col h-full">
        <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
            <EnterpriseSelect label="Kinesiólogo" options={doctorOptions} value={form.data.doctor_id} onChange={val => form.setData("doctor_id", val)} icon={User} required />
            
            <div className="p-6 bg-gray-50 rounded-[2rem] border border-gray-100 space-y-4">
                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Periodo de la Excepción</p>
                <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-3">
                        <label className="text-[10px] font-black text-gray-500 uppercase ml-1">Fecha Inicio</label>
                        <TextInput type="date" value={form.data.date} onChange={e => form.setData("date", e.target.value)} required />
                    </div>
                    <div className="space-y-3">
                        <label className="text-[10px] font-black text-gray-500 uppercase ml-1">Fecha Término (Opcional)</label>
                        <TextInput type="date" value={form.data.end_date} onChange={e => form.setData("end_date", e.target.value)} />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6">
                <EnterpriseSelect 
                    label="Tipo de Acción" 
                    value={form.data.action} 
                    onChange={val => {
                        form.setData("action", val);
                        if (val === 'open') {
                            form.setData(prev => ({ ...prev, override_start_time: "09:00", override_end_time: "14:00" }));
                        }
                    }} 
                    options={[
                        { label: "Bloqueo Total (Día Completo)", value: "cancel" }, 
                        { label: "Bloqueo Parcial (Rango de Horas)", value: "override" },
                        { label: "Apertura Especial (Día No Laboral)", value: "open" }
                    ]} 
                    required 
                />
            </div>

            {(form.data.action === 'override' || form.data.action === 'open') && (
                <div className={`grid grid-cols-2 gap-6 p-6 rounded-[2rem] border ${form.data.action === 'open' ? 'bg-green-50 border-green-100' : 'bg-blue-50 border-blue-100'}`}>
                    <div className="space-y-1">
                        <label className={`text-[8px] font-black uppercase ml-1 ${form.data.action === 'open' ? 'text-green-600' : 'text-blue-600'}`}>Hora Inicio</label>
                        <TextInput type="time" value={form.data.override_start_time} onChange={e => form.setData("override_start_time", e.target.value)} />
                    </div>
                    <div className="space-y-1">
                        <label className={`text-[8px] font-black uppercase ml-1 ${form.data.action === 'open' ? 'text-green-600' : 'text-blue-600'}`}>Hora Término</label>
                        <TextInput type="time" value={form.data.override_end_time} onChange={e => form.setData("override_end_time", e.target.value)} />
                    </div>
                </div>
            )}

            {form.data.action === 'open' && (
                <div className="space-y-6 p-6 bg-gray-50 rounded-[2rem] border border-gray-100 animate-in fade-in slide-in-from-top-4 duration-300">
                    <div className="space-y-3">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Box / Sala (Opcional)</label>
                        <EnterpriseSelect 
                            icon={Layers} 
                            value={form.data.room_id} 
                            onChange={val => form.setData("room_id", val)} 
                            options={roomOptions} 
                            placeholder="Libertad de Box (Supervisión)" 
                        />
                    </div>
                </div>
            )}

            <div className="space-y-3"><label className="text-[10px] font-black text-gray-400 uppercase ml-1">Motivo (Interno)</label><TextInput value={form.data.reason} onChange={e => form.setData("reason", e.target.value)} placeholder="Ej: Médico, Vacaciones, Capacitación..." /></div>
        </div>
        <FormFooter processing={form.processing} onCancel={onCancel} confirmText="Registrar" />
    </form>
);

const HolidayForm = ({ form, onSubmit, branchOptions, roomOptions, onCancel }) => (
    <form onSubmit={onSubmit} className="flex flex-col h-full">
        <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
            <div className="space-y-3"><label className="text-[10px] font-black text-gray-400 uppercase ml-1">Nombre del Evento / Cierre</label><TextInput value={form.data.name} onChange={e => form.setData("name", e.target.value)} placeholder="Ej: Navidad, Vacaciones Invierno, Capacitación..." required /></div>
            
            <div className="p-6 bg-amber-50/30 rounded-[2rem] border border-amber-100/50 space-y-4">
                <p className="text-[9px] font-black text-amber-600 uppercase tracking-widest ml-1">Rango de Fechas (Opcional para un solo día)</p>
                <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-3">
                        <label className="text-[10px] font-black text-gray-500 uppercase ml-1">Inicio</label>
                        <TextInput type="date" value={form.data.date} onChange={e => form.setData("date", e.target.value)} required />
                    </div>
                    <div className="space-y-3">
                        <label className="text-[10px] font-black text-gray-500 uppercase ml-1">Término</label>
                        <TextInput type="date" value={form.data.end_date} onChange={e => form.setData("end_date", e.target.value)} />
                    </div>
                </div>
            </div>

            <div className="p-6 bg-gray-50 rounded-[2rem] border border-gray-100 space-y-4">
                <div className="flex justify-between items-center">
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1 text-xs">Cierre Parcial (Por Horas)</p>
                    {(form.data.start_time || form.data.end_time) && (
                        <button type="button" onClick={() => form.setData({ ...form.data, start_time: "", end_time: "" })} className="text-[8px] font-black text-red-400 uppercase tracking-widest hover:text-red-600 transition-colors">Limpiar Horas</button>
                    )}
                </div>
                <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-3">
                        <label className="text-[10px] font-black text-gray-500 uppercase ml-1">Desde las</label>
                        <TextInput type="time" value={form.data.start_time} onChange={e => form.setData("start_time", e.target.value)} />
                    </div>
                    <div className="space-y-3">
                        <label className="text-[10px] font-black text-gray-500 uppercase ml-1">Hasta las</label>
                        <TextInput type="time" value={form.data.end_time} onChange={e => form.setData("end_time", e.target.value)} />
                    </div>
                </div>
                <p className="text-[9px] text-gray-400 italic px-1">Si dejas las horas vacías, el cierre será por el día completo.</p>
            </div>

            <div className="grid grid-cols-1 gap-6">
                <EnterpriseSelect label="Sucursal Afectada" value={form.data.branch_id} onChange={val => form.setData("branch_id", val)} options={[{ label: "Toda la Empresa", value: "" }, ...branchOptions]} icon={Building} />
            </div>

            <div className="grid grid-cols-1 gap-6">
                <EnterpriseSelect 
                    label="Box Específico (Opcional)" 
                    value={form.data.room_id} 
                    onChange={val => form.setData("room_id", val)} 
                    options={[{ label: "Toda la Sucursal", value: "" }, ...roomOptions]} 
                    icon={Layers} 
                    disabled={!form.data.branch_id}
                />
                <p className="text-[8px] text-gray-400 font-bold uppercase tracking-widest ml-1">Si seleccionas un box, solo ese espacio quedará inhabilitado.</p>
            </div>

            <div className="flex items-center gap-4 p-5 bg-gray-50 rounded-[2rem] border border-gray-100">
                <input type="checkbox" checked={form.data.is_recurring} onChange={e => form.setData("is_recurring", e.target.checked)} className="w-5 h-5 rounded-lg border-gray-300 text-brand-primary focus:ring-brand-primary" />
                <div>
                    <p className="text-[10px] font-black text-gray-900 uppercase tracking-tight leading-none">Repetir anualmente</p>
                    <p className="text-[9px] font-bold text-gray-400 uppercase mt-1">Se aplicará automáticamente cada año en la misma fecha.</p>
                </div>
            </div>
        </div>
        <FormFooter processing={form.processing} onCancel={onCancel} confirmText="Guardar Feriado" />
    </form>
);

const FormFooter = ({ processing, onCancel, confirmText }) => (
    <div className="px-8 py-5 bg-gray-50 border-t border-gray-100 flex justify-end gap-3 shrink-0">
        <button type="button" onClick={onCancel} className="px-8 py-3.5 font-black uppercase tracking-widest text-[10px] text-gray-400 hover:text-gray-900 transition-colors">Cancelar</button>
        <PrimaryButton disabled={processing} className="!px-12 !py-3.5 shadow-xl shadow-brand-primary/20 text-[10px] uppercase tracking-widest">{processing ? '...' : confirmText}</PrimaryButton>
    </div>
);
