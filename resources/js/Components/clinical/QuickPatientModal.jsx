import React, { useEffect, useState } from "react";
import { 
    X, 
    User, 
    UserCheck, 
    Mail, 
    Phone, 
    IdCard, 
    Calendar as CalendarIcon,
    MapPin,
    Home,
    AlertCircle
} from "lucide-react";
import { useForm, usePage } from "@inertiajs/react";
import axios from "axios";
import RutInput from "@/components/RutInput";
import ChilePhoneInput from "@/components/ChilePhoneInput";
import Switch from "@/components/Switch";
import InputError from "@/components/InputError";
import SearchSelect from "@/Components/SearchSelect";
import { RELATIONSHIP_OPTIONS } from "@/constants/relationshipOptions";

export default function QuickPatientModal({ 
    isOpen, 
    onClose, 
    regions = [], 
    communes = [], 
    onSuccess 
}) {
    const { current_branch } = usePage().props;
    const isHomeCareOnlyBranch = current_branch && !current_branch.allows_onsite;
    const isOnsiteOnlyBranch = current_branch && !current_branch.allows_home;
    const isHybridBranch = current_branch?.allows_onsite && current_branch?.allows_home;

    const { data, setData, post, processing, reset, errors } = useForm({
        name: "",
        last_name: "",
        rut: "",
        no_rut: false,
        phone: "",
        email: "",
        birth_date: "2000-01-01",
        require_tutor: false,
        tutor_name: "",
        tutor_phone: "",
        tutor_email: "",
        tutor_relationship: "",
        street: "",
        number: "",
        region_id: "13",
        commune_id: "13114",
        is_home_care: isHomeCareOnlyBranch
    });

    const [emailDuplicateWarning, setEmailDuplicateWarning] = useState(null);

    // Resetear formulario al cerrar el modal
    useEffect(() => {
        if (!isOpen) {
            reset();
            setLocalErrors({});
            setEmailDuplicateWarning(null);
        }
    }, [isOpen]);

    // Lógica para forzar is_home_care según capacidades de la sucursal
    useEffect(() => {
        if (isHomeCareOnlyBranch) setData("is_home_care", true);
        else if (isOnsiteOnlyBranch) setData("is_home_care", false);
    }, [isHomeCareOnlyBranch, isOnsiteOnlyBranch]);

    // Efecto para manejar el RUT cuando no se tiene
    useEffect(() => {
        const isPlaceholder = data.rut?.replace(/[.-]/g, '').startsWith('666666666');
        if (data.no_rut) {
            setData("rut", "66666666-6");
        } else if (isPlaceholder) {
            setData("rut", "");
        }
    }, [data.no_rut]);

    const handleEmailBlur = async (e) => {
        const email = e.target.value;
        if (!email || email.length < 5) {
            setEmailDuplicateWarning(null);
            return;
        }

        try {
            const response = await axios.post(route("patients.check-existing"), {
                email: email,
            });

            if (response.data.status === "duplicate_email") {
                setEmailDuplicateWarning(response.data.owner_name);
            } else {
                setEmailDuplicateWarning(null);
            }
        } catch (e) {
            console.error(e);
        }
    };

    // Asegurar que regions y communes sean arrays (por si llegan como objetos de PHP/Cache)
    const regionsList = Array.isArray(regions) ? regions : Object.values(regions);
    const communesList = Array.isArray(communes) ? communes : Object.values(communes);

    // Filtrar comunas por región seleccionada
    const filteredCommunes = React.useMemo(() => {
        if (!data.region_id) return [];
        return communesList.filter(c => Number(c.region_id) === Number(data.region_id));
    }, [data.region_id, communesList]);

    // Resetear comuna si cambia la región y la comuna actual ya no pertenece a la nueva región
    useEffect(() => {
        if (data.region_id) {
            const currentCommuneValid = filteredCommunes.some(c => Number(c.id) === Number(data.commune_id));
            if (!currentCommuneValid && filteredCommunes.length > 0) {
                // Si la comuna actual no es válida para la región, pero hay comunas disponibles
                setData("commune_id", String(filteredCommunes[0].id));
            } else if (filteredCommunes.length === 0) {
                setData("commune_id", "");
            }
        }
    }, [data.region_id, filteredCommunes]);

    // Auto-detección de tutor por edad
    useEffect(() => {
        if (data.birth_date) {
            const birth = new Date(data.birth_date);
            const today = new Date();
            let age = today.getFullYear() - birth.getFullYear();
            if ((today.getMonth() - birth.getMonth() < 0) || 
                (today.getMonth() === birth.getMonth() && today.getDate() < birth.getDate())) {
                age--;
            }
            setData("require_tutor", age < 18 || age > 80);
        }
    }, [data.birth_date]);

    const relationshipOptions = RELATIONSHIP_OPTIONS;

    const [localErrors, setLocalErrors] = React.useState({});
    const [localProcessing, setLocalProcessing] = React.useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLocalProcessing(true);
        setLocalErrors({});

        try {
            const response = await axios.post(route('patients.quick_store'), data);
            
            // Si llegamos aquí, fue exitoso (axios lanza error para 4xx/5xx)
            if (response.data) {
                reset();
                onSuccess(response.data); // Pasamos el objeto paciente completo
                onClose();
            }
        } catch (error) {
            if (error.response?.status === 422) {
                setLocalErrors(error.response.data.errors || {});
            } else {
                console.error("Error en registro rápido:", error);
            }
        } finally {
            setLocalProcessing(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-[2.5rem] shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="p-8 border-b border-gray-100 flex justify-between items-start shrink-0 bg-white">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-brand-primary/10 text-brand-primary rounded-2xl flex items-center justify-center">
                            <User className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight">Registro Maestro de Paciente</h2>
                            <p className="text-[9px] font-bold text-brand-primary uppercase mt-0.5 tracking-widest leading-none">
                                Creación de ficha clínica básica para atención inmediata
                            </p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-900 transition-colors">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
                    <div className="p-8 space-y-6 overflow-y-auto flex-1 bg-gray-50/10 custom-scrollbar">
                        
                        {/* 1. Datos de Identidad */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div className="space-y-1.5">
                                <div className="flex items-center justify-between pr-2">
                                    <label className="text-[10px] font-black uppercase ml-1 text-gray-400 tracking-widest flex items-center gap-2">
                                        <IdCard className="w-3 h-3" /> RUT / Documento
                                    </label>
                                    {(!data.rut || data.rut?.replace(/[.-]/g, '').startsWith('66666666')) && (
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className={`text-[8px] font-black uppercase ${data.no_rut ? 'text-brand-primary' : 'text-gray-300'}`}>Sin RUT</span>
                                            <Switch checked={data.no_rut} onChange={e => setData("no_rut", e.target.checked)} />
                                        </div>
                                    )}
                                </div>
                                <RutInput 
                                    value={data.rut} 
                                    onChange={v => setData("rut", v)} 
                                    className="w-full !py-4 !px-6 border-gray-100 rounded-2xl font-bold text-sm shadow-sm focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10 transition-all" 
                                    required={!data.no_rut}
                                    disabled={data.no_rut}
                                />
                                <InputError message={localErrors.rut} />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black uppercase ml-1 text-gray-400 tracking-widest flex items-center gap-2">
                                    <CalendarIcon className="w-3 h-3" /> Fecha de Nacimiento
                                </label>
                                <div className="flex gap-4 items-center">
                                    <input 
                                        type="date" 
                                        value={data.birth_date} 
                                        onChange={e => setData("birth_date", e.target.value)} 
                                        className="flex-1 px-6 py-4 bg-white border border-gray-100 rounded-2xl font-bold text-sm shadow-sm focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10 transition-all" 
                                        required
                                    />
                                    {isHybridBranch && (
                                        <label className="flex items-center gap-3 px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl cursor-pointer hover:bg-white transition-all shadow-sm group">
                                            <div className="flex flex-col">
                                                <span className={`text-[7px] font-black uppercase leading-none ${data.is_home_care ? 'text-blue-600' : 'text-gray-400'}`}>Atención</span>
                                                <span className={`text-[9px] font-black uppercase ${data.is_home_care ? 'text-blue-600' : 'text-brand-gray'}`}>Domicilio</span>
                                            </div>
                                            <Switch checked={data.is_home_care} onChange={e => setData("is_home_care", e.target.checked)} />
                                        </label>
                                    )}
                                </div>
                                <InputError message={localErrors.birth_date} />
                            </div>
                        </div>

                        {/* 2. Nombres */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black uppercase ml-1 text-gray-400 tracking-widest flex items-center gap-2">
                                    <User className="w-3 h-3" /> Nombres
                                </label>
                                <input 
                                    type="text" 
                                    value={data.name} 
                                    onChange={e => setData("name", e.target.value)} 
                                    placeholder="Ej: Juan Antonio"
                                    className="w-full px-6 py-4 bg-white border border-gray-100 rounded-2xl font-bold text-sm shadow-sm focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10 transition-all" 
                                    required
                                />
                                <InputError message={localErrors.name} />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black uppercase ml-1 text-gray-400 tracking-widest flex items-center gap-2">
                                    <User className="w-3 h-3" /> Apellidos
                                </label>
                                <input 
                                    type="text" 
                                    value={data.last_name} 
                                    onChange={e => setData("last_name", e.target.value)} 
                                    placeholder="Ej: Pérez González"
                                    className="w-full px-6 py-4 bg-white border border-gray-100 rounded-2xl font-bold text-sm shadow-sm focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10 transition-all" 
                                    required
                                />
                                <InputError message={localErrors.last_name} />
                            </div>
                        </div>

                        {/* 3. Contacto */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black uppercase ml-1 text-gray-400 tracking-widest flex items-center gap-2">
                                    <Phone className="w-3 h-3" /> Teléfono WhatsApp
                                </label>
                                <ChilePhoneInput 
                                    value={data.phone} 
                                    onChange={v => setData("phone", v)} 
                                    required={false}
                                />
                                <InputError message={localErrors.phone} />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black uppercase ml-1 text-gray-400 tracking-widest flex items-center gap-2">
                                    <Mail className="w-3 h-3" /> Correo Electrónico
                                </label>
                                <input 
                                    type="email" 
                                    value={data.email} 
                                    onChange={e => setData("email", e.target.value)} 
                                    onBlur={handleEmailBlur}
                                    placeholder="ejemplo@correo.cl"
                                    className={`w-full px-6 py-4 bg-white border rounded-2xl font-bold text-sm shadow-sm focus:ring-4 focus:ring-brand-primary/10 transition-all ${emailDuplicateWarning ? 'border-orange-300 ring-1 ring-orange-200' : 'border-gray-100 focus:border-brand-primary'}`} 
                                />
                                {emailDuplicateWarning && (
                                    <p className="text-[9px] font-black text-orange-600 uppercase mt-1 ml-1 flex items-center gap-1">
                                        <AlertCircle className="w-3 h-3" /> En uso por: {emailDuplicateWarning} (Uso familiar permitido)
                                    </p>
                                )}
                                <InputError message={localErrors.email} />
                            </div>
                        </div>

                        {/* 4. Localización */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-4 border-t border-gray-100">
                            <div className="md:col-span-2 space-y-1.5">
                                <label className="text-[10px] font-black uppercase ml-1 text-gray-400 tracking-widest flex items-center gap-2">
                                    <Home className="w-3 h-3" /> Calle / Dirección
                                </label>
                                <input 
                                    type="text" 
                                    value={data.street} 
                                    onChange={e => setData("street", e.target.value)} 
                                    className="w-full px-6 py-4 bg-white border border-gray-100 rounded-2xl font-bold text-sm shadow-sm focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10 transition-all" 
                                    placeholder="Ej: Av. Las Condes" 
                                    required={data.is_home_care}
                                />
                                <InputError message={localErrors.street} />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black uppercase ml-1 text-gray-400 tracking-widest">N°</label>
                                <input 
                                    type="text" 
                                    value={data.number} 
                                    onChange={e => setData("number", e.target.value)} 
                                    className="w-full px-6 py-4 bg-white border border-gray-100 rounded-2xl font-bold text-sm shadow-sm focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10 transition-all" 
                                    placeholder="123" 
                                    required={data.is_home_care}
                                />
                                <InputError message={localErrors.number} />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div className="space-y-1.5">
                                <SearchSelect
                                    label="Región"
                                    value={data.region_id}
                                    onChange={v => setData(d => ({ ...d, region_id: v, commune_id: "" }))}
                                    options={regionsList.map(r => ({ value: String(r.id), label: r.name }))}
                                    placeholder="-- Seleccione Región --"
                                    error={localErrors.region_id}
                                />
                            </div>
                            <div className="space-y-1.5">
                                <SearchSelect
                                    label="Comuna"
                                    value={data.commune_id}
                                    onChange={v => setData("commune_id", v)}
                                    options={filteredCommunes.map(c => ({ value: String(c.id), label: c.name }))}
                                    placeholder="-- Seleccione Comuna --"
                                    error={localErrors.commune_id}
                                    disabled={!data.region_id}
                                />
                            </div>
                        </div>

                        {/* 5. Tutor Legal */}
                        <div className={`p-6 rounded-[2.5rem] transition-all border ${data.require_tutor ? 'bg-brand-primary/5 border-brand-primary/20 shadow-sm' : 'bg-gray-50/50 border-gray-100 opacity-60'}`}>
                            <div className="flex items-center justify-between mb-5">
                                <div className="flex items-center gap-4">
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${data.require_tutor ? 'bg-brand-primary text-white shadow-lg shadow-brand-primary/20' : 'bg-gray-100 text-gray-400'}`}>
                                        <UserCheck className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className={`text-xs font-black uppercase tracking-tight ${data.require_tutor ? 'text-brand-primary' : 'text-gray-500'}`}>Tutor / Apoderado Responsable</p>
                                        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">Obligatorio para menores de 18 y mayores de 80 años</p>
                                    </div>
                                </div>
                                <Switch checked={data.require_tutor} onChange={e => setData("require_tutor", e.target.checked)} />
                            </div>
                            
                            {data.require_tutor && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 animate-in slide-in-from-top-2 duration-300">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-brand-primary uppercase ml-1 tracking-widest">Nombre Completo Tutor</label>
                                        <input 
                                            type="text" 
                                            value={data.tutor_name} 
                                            onChange={e => setData("tutor_name", e.target.value)} 
                                            className="w-full px-6 py-4 bg-white border border-brand-primary/10 rounded-2xl font-bold text-sm shadow-sm focus:ring-4 focus:ring-brand-primary/10" 
                                            placeholder="Nombre del apoderado" 
                                            required={data.require_tutor}
                                        />
                                        <InputError message={localErrors.tutor_name} />
                                    </div>
                                    <div className="space-y-1.5">
                                        <SearchSelect
                                            label="Vínculo con el Paciente"
                                            value={data.tutor_relationship}
                                            onChange={val => setData("tutor_relationship", val)}
                                            options={relationshipOptions}
                                            placeholder="-- Seleccione Parentesco --"
                                            error={localErrors.tutor_relationship}
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-brand-primary uppercase ml-1 tracking-widest">Teléfono de Emergencia</label>
                                        <ChilePhoneInput 
                                            value={data.tutor_phone} 
                                            onChange={v => setData("tutor_phone", v)} 
                                            required={false}
                                        />
                                        <InputError message={localErrors.tutor_phone} />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-brand-primary uppercase ml-1 tracking-widest">Correo del Tutor</label>
                                        <input 
                                            type="email" 
                                            value={data.tutor_email} 
                                            onChange={e => setData("tutor_email", e.target.value)} 
                                            className="w-full px-6 py-4 bg-white border border-brand-primary/10 rounded-2xl font-bold text-sm shadow-sm focus:ring-4 focus:ring-brand-primary/10" 
                                            placeholder="tutor@correo.cl" 
                                            required={false}
                                        />
                                        <InputError message={localErrors.tutor_email} />
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="p-8 bg-gray-50 border-t border-gray-100 flex gap-4 shrink-0">
                        <button 
                            type="submit" 
                            disabled={localProcessing} 
                            className="flex-1 py-4 bg-brand-primary text-white font-black uppercase text-xs rounded-2xl shadow-xl shadow-brand-primary/20 hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-50"
                        >
                            {localProcessing ? 'Procesando Registro...' : 'Finalizar y Crear Ficha'}
                        </button>
                        <button 
                            type="button" 
                            onClick={onClose} 
                            className="px-10 py-4 bg-white text-gray-400 font-black uppercase text-xs border border-gray-200 rounded-2xl hover:bg-gray-100 hover:text-gray-600 transition-all"
                        >
                            Cancelar
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
