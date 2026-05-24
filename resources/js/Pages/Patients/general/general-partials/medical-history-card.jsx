import React, { useState } from "react";
import { 
    Activity, 
    Stethoscope, 
    Zap, 
    Baby, 
    AlertCircle, 
    Plus, 
    ChevronRight,
    Edit2,
    Heart,
    Bone,
    Thermometer,
    Users
} from "lucide-react";
import { useForm } from "@inertiajs/react";
import Modal from "@/components/Modal";
import PrimaryButton from "@/components/PrimaryButton";
import SecondaryButton from "@/components/SecondaryButton";
import TextInput from "@/components/TextInput";
import InputLabel from "@/components/InputLabel";
import Switch from "@/components/Switch";

export default function MedicalHistoryCard({ patient }) {
    const [isOpen, setIsOpen] = useState(false);
    const history = patient.medical_history || {};

    const { data, setData, patch, processing } = useForm({
        blood_type: history.blood_type || "",
        handedness: history.handedness || "",
        pathologies: history.pathologies || [],
        surgeries: history.surgeries || [],
        fractures: history.fractures || [],
        medications: history.medications || [],
        family_history: history.family_history || [],
        has_pacemaker: !!history.has_pacemaker,
        has_metal_implants: !!history.has_metal_implants,
        is_pregnant: !!history.is_pregnant,
        cancer_history: !!history.cancer_history,
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        patch(route("patients.update", patient.id), {
            onSuccess: () => {
                setIsOpen(false);
                Swal.fire({
                    title: "¡Actualizado!",
                    text: "Los antecedentes clínicos se han guardado correctamente.",
                    icon: "success",
                    timer: 2000,
                    showConfirmButton: false,
                    toast: true,
                    position: 'top-end'
                });
            },
            onError: (errors) => {
                console.error(errors);
                Swal.fire({
                    title: "Error",
                    text: "No se pudieron guardar los cambios. Revise los datos.",
                    icon: "error",
                    confirmButtonColor: "#3292b3"
                });
            }
        });
    };

    const ListSection = ({ title, icon: Icon, items = [], field }) => {
        const [newItem, setNewItem] = useState("");
        
        const addItem = () => {
            if (!newItem.trim()) return;
            setData(field, [...data[field], newItem.trim()]);
            setNewItem("");
        };

        const removeItem = (index) => {
            setData(field, data[field].filter((_, i) => i !== index));
        };

        return (
            <div className="space-y-3">
                <label className="flex items-center gap-2 text-[10px] font-black text-brand-gray uppercase tracking-widest">
                    <Icon className="w-3.5 h-3.5" /> {title}
                </label>
                <div className="flex gap-2">
                    <TextInput 
                        value={newItem} 
                        onChange={(e) => setNewItem(e.target.value)} 
                        className="flex-1 !py-2 !text-xs" 
                        placeholder={`Agregar ${title.toLowerCase()}...`}
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addItem())}
                    />
                    <button type="button" onClick={addItem} className="p-2 bg-brand-primary text-white rounded-lg hover:brightness-110">
                        <Plus className="w-4 h-4" />
                    </button>
                </div>
                <div className="flex flex-wrap gap-2">
                    {data[field].map((item, i) => (
                        <span key={i} className="inline-flex items-center gap-2 px-3 py-1 bg-gray-100 text-[10px] font-bold text-gray-700 rounded-full border border-gray-200">
                            {item}
                            <button type="button" onClick={() => removeItem(i)} className="text-gray-400 hover:text-red-500">×</button>
                        </span>
                    ))}
                </div>
            </div>
        );
    };

    return (
        <>
            <div className="p-8 bg-white border border-gray-100 shadow-xl rounded-[2.5rem] relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-6 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => setIsOpen(true)} className="p-2 bg-gray-900 text-white rounded-xl shadow-lg hover:scale-110 transition-transform">
                        <Edit2 className="w-4 h-4" />
                    </button>
                </div>

                <div className="flex items-center gap-4 mb-8">
                    <div className="p-3 bg-brand-primary/10 text-brand-primary rounded-2xl">
                        <Stethoscope className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="text-lg font-black text-gray-900 uppercase tracking-tight leading-none">Antecedentes Clínicos</h3>
                        <p className="text-[9px] font-bold text-brand-gray uppercase tracking-widest mt-1 opacity-60">Historial médico y banderas rojas</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* BANDERAS ROJAS */}
                    <div className="space-y-4">
                        <h4 className="text-[10px] font-black text-brand-gray uppercase tracking-widest border-b border-gray-50 pb-2">Banderas Rojas</h4>
                        <div className="grid grid-cols-2 gap-3">
                            <div className={`p-3 rounded-xl border flex flex-col gap-1 ${history.has_pacemaker ? "bg-red-50 border-red-100 text-red-700" : "bg-gray-50 border-gray-100 text-gray-400"}`}>
                                <Zap className="w-4 h-4" />
                                <span className="text-[9px] font-black uppercase">Marcapasos</span>
                                <span className="text-[8px] font-bold">{history.has_pacemaker ? "PRESENTE" : "NEGATIVO"}</span>
                            </div>
                            <div className={`p-3 rounded-xl border flex flex-col gap-1 ${history.has_metal_implants ? "bg-orange-50 border-orange-100 text-orange-700" : "bg-gray-50 border-gray-100 text-gray-400"}`}>
                                <Bone className="w-4 h-4" />
                                <span className="text-[9px] font-black uppercase">Implantes</span>
                                <span className="text-[8px] font-bold">{history.has_metal_implants ? "SÍ" : "NO"}</span>
                            </div>
                            <div className={`p-3 rounded-xl border flex flex-col gap-1 ${history.is_pregnant ? "bg-purple-50 border-purple-100 text-purple-700" : "bg-gray-50 border-gray-100 text-gray-400"}`}>
                                <Baby className="w-4 h-4" />
                                <span className="text-[9px] font-black uppercase">Embarazo</span>
                                <span className="text-[8px] font-bold">{history.is_pregnant ? "ACTIVO" : "NO"}</span>
                            </div>
                            <div className={`p-3 rounded-xl border flex flex-col gap-1 ${history.cancer_history ? "bg-amber-50 border-amber-100 text-amber-700" : "bg-gray-50 border-gray-100 text-gray-400"}`}>
                                <AlertCircle className="w-4 h-4" />
                                <span className="text-[9px] font-black uppercase">Cáncer</span>
                                <span className="text-[8px] font-bold">{history.cancer_history ? "SÍ" : "NO"}</span>
                            </div>
                        </div>
                    </div>

                    {/* DATOS CLAVE */}
                    <div className="space-y-4">
                        <h4 className="text-[10px] font-black text-brand-gray uppercase tracking-widest border-b border-gray-50 pb-2">Parámetros</h4>
                        <div className="space-y-3">
                            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl border border-gray-100">
                                <span className="text-[10px] font-black text-brand-gray uppercase">Tipo de Sangre</span>
                                <span className="text-xs font-bold text-brand-primary">{history.blood_type || "N/A"}</span>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl border border-gray-100">
                                <span className="text-[10px] font-black text-brand-gray uppercase">Lateralidad</span>
                                <span className="text-xs font-bold text-gray-900">{history.handedness === 'right' ? 'Diestro' : history.handedness === 'left' ? 'Zurdo' : 'Ambidiestro'}</span>
                            </div>
                        </div>
                    </div>

                    {/* LISTADOS RESUMIDOS */}
                    <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pt-6 border-t border-gray-50">
                        {/* Fila 1 */}
                        <div>
                            <p className="text-[9px] font-black text-brand-gray uppercase tracking-widest mb-3 flex items-center gap-2">
                                <Activity className="w-3.5 h-3.5 text-blue-500" /> Patologías
                            </p>
                            <div className="flex flex-wrap gap-1.5">
                                {history.pathologies?.length > 0 ? history.pathologies.map((p, i) => (
                                    <span key={i} className="px-2 py-1 bg-blue-50 text-[9px] font-bold text-blue-600 rounded-lg border border-blue-100">{p}</span>
                                )) : <span className="text-[10px] text-gray-300 italic uppercase">Sin registros</span>}
                            </div>
                        </div>

                        <div>
                            <p className="text-[9px] font-black text-brand-gray uppercase tracking-widest mb-3 flex items-center gap-2">
                                <Thermometer className="w-3.5 h-3.5 text-emerald-500" /> Medicamentos
                            </p>
                            <div className="flex flex-wrap gap-1.5">
                                {history.medications?.length > 0 ? history.medications.map((m, i) => (
                                    <span key={i} className="px-2 py-1 bg-emerald-50 text-[9px] font-bold text-emerald-600 rounded-lg border border-emerald-100">{m}</span>
                                )) : <span className="text-[10px] text-gray-300 italic uppercase">Sin registros</span>}
                            </div>
                        </div>

                        <div>
                            <p className="text-[9px] font-black text-brand-gray uppercase tracking-widest mb-3 flex items-center gap-2">
                                <Plus className="w-3.5 h-3.5 text-slate-500" /> Cirugías
                            </p>
                            <div className="flex flex-wrap gap-1.5">
                                {history.surgeries?.length > 0 ? history.surgeries.map((s, i) => (
                                    <span key={i} className="px-2 py-1 bg-gray-50 text-[9px] font-bold text-gray-600 rounded-lg border border-gray-200">{s}</span>
                                )) : <span className="text-[10px] text-gray-300 italic uppercase">Sin registros</span>}
                            </div>
                        </div>

                        {/* Fila 2 (Nuevos campos visibles) */}
                        <div>
                            <p className="text-[9px] font-black text-brand-gray uppercase tracking-widest mb-3 flex items-center gap-2">
                                <Bone className="w-3.5 h-3.5 text-orange-500" /> Fracturas / Lesiones
                            </p>
                            <div className="flex flex-wrap gap-1.5">
                                {history.fractures?.length > 0 ? history.fractures.map((f, i) => (
                                    <span key={i} className="px-2 py-1 bg-orange-50 text-[9px] font-bold text-orange-600 rounded-lg border border-orange-100">{f}</span>
                                )) : <span className="text-[10px] text-gray-300 italic uppercase">Sin registros</span>}
                            </div>
                        </div>

                        <div className="lg:col-span-2">
                            <p className="text-[9px] font-black text-brand-gray uppercase tracking-widest mb-3 flex items-center gap-2">
                                <Users className="w-3.5 h-3.5 text-brand-primary" /> Antecedentes Familiares
                            </p>
                            <div className="flex flex-wrap gap-1.5">
                                {history.family_history?.length > 0 ? history.family_history.map((fh, i) => (
                                    <span key={i} className="px-2 py-1 bg-brand-primary/5 text-[9px] font-bold text-brand-primary rounded-lg border border-brand-primary/10">{fh}</span>
                                )) : <span className="text-[10px] text-gray-300 italic uppercase">Sin registros</span>}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* MODAL DE EDICIÓN CLÍNICA */}
            <Modal open={isOpen} onClose={() => setIsOpen(false)} maxWidth="4xl">
                <form onSubmit={handleSubmit} className="p-8">
                    <div className="flex items-center gap-4 mb-10 pb-6 border-b border-gray-100">
                        <div className="p-3.5 bg-gray-900 text-white rounded-2xl shadow-xl">
                            <Stethoscope className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tight">Actualizar Antecedentes</h2>
                            <p className="text-[10px] font-black text-brand-gray uppercase tracking-[0.2em] mt-1">Gestión de historial médico de {patient.name}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        {/* Parámetros Básicos */}
                        <div className="space-y-6">
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-1">
                                    <InputLabel value="Grupo Sanguíneo" className="enterprise-label" />
                                    <select 
                                        value={data.blood_type} 
                                        onChange={(e) => setData("blood_type", e.target.value)}
                                        className="w-full rounded-2xl border-gray-200 text-sm font-bold bg-gray-50 focus:border-brand-primary focus:ring-brand-primary"
                                    >
                                        <option value="">Seleccionar...</option>
                                        {['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'].map(t => <option key={t} value={t}>{t}</option>)}
                                    </select>
                                </div>
                                <div className="space-y-1">
                                    <InputLabel value="Lateralidad" className="enterprise-label" />
                                    <select 
                                        value={data.handedness} 
                                        onChange={(e) => setData("handedness", e.target.value)}
                                        className="w-full rounded-2xl border-gray-200 text-sm font-bold bg-gray-50 focus:border-brand-primary focus:ring-brand-primary"
                                    >
                                        <option value="">Seleccionar...</option>
                                        <option value="right">Diestro</option>
                                        <option value="left">Zurdo</option>
                                        <option value="both">Ambidiestro</option>
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-4 pt-4">
                                <h4 className="text-[10px] font-black text-brand-primary uppercase tracking-widest">Banderas Rojas (Alertas)</h4>
                                <div className="grid grid-cols-1 gap-4 bg-gray-50 p-6 rounded-[2rem] border border-gray-100">
                                    <div className="flex justify-between items-center">
                                        <div className="flex items-center gap-3">
                                            <Zap className={`w-4 h-4 ${data.has_pacemaker ? "text-red-600" : "text-gray-300"}`} />
                                            <span className="text-[10px] font-black uppercase text-gray-700">Marcapasos</span>
                                        </div>
                                        <Switch checked={data.has_pacemaker} onChange={(e) => setData("has_pacemaker", e.target.checked)} />
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <div className="flex items-center gap-3">
                                            <Bone className={`w-4 h-4 ${data.has_metal_implants ? "text-orange-600" : "text-gray-300"}`} />
                                            <span className="text-[10px] font-black uppercase text-gray-700">Implantes Metálicos</span>
                                        </div>
                                        <Switch checked={data.has_metal_implants} onChange={(e) => setData("has_metal_implants", e.target.checked)} />
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <div className="flex items-center gap-3">
                                            <Baby className={`w-4 h-4 ${data.is_pregnant ? "text-purple-600" : "text-gray-300"}`} />
                                            <span className="text-[10px] font-black uppercase text-gray-700">Estado de Embarazo</span>
                                        </div>
                                        <Switch checked={data.is_pregnant} onChange={(e) => setData("is_pregnant", e.target.checked)} />
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <div className="flex items-center gap-3">
                                            <AlertCircle className={`w-4 h-4 ${data.cancer_history ? "text-amber-600" : "text-gray-300"}`} />
                                            <span className="text-[10px] font-black uppercase text-gray-700">Antecedentes de Cáncer</span>
                                        </div>
                                        <Switch checked={data.cancer_history} onChange={(e) => setData("cancer_history", e.target.checked)} />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Listados Dinámicos */}
                        <div className="space-y-8 h-[500px] overflow-y-auto pr-4 custom-scrollbar">
                            <ListSection title="Patologías / Enfermedades" icon={Activity} items={data.pathologies} field="pathologies" />
                            <ListSection title="Cirugías Anteriores" icon={Plus} items={data.surgeries} field="surgeries" />
                            <ListSection title="Fracturas / Lesiones" icon={Bone} items={data.fractures} field="fractures" />
                            <ListSection title="Medicamentos Actuales" icon={Thermometer} items={data.medications} field="medications" />
                            <ListSection title="Antecedentes Familiares" icon={Users} items={data.family_history} field="family_history" />
                        </div>
                    </div>

                    <div className="mt-12 flex justify-end gap-4 pt-8 border-t border-gray-100">
                        <SecondaryButton onClick={() => setIsOpen(false)} type="button">Cancelar</SecondaryButton>
                        <PrimaryButton disabled={processing} type="submit" className="!px-10">Guardar Ficha Clínica</PrimaryButton>
                    </div>
                </form>
            </Modal>
        </>
    );
}
