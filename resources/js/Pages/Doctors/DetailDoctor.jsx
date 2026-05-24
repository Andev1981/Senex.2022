import React, { useState, useMemo } from "react";
import { Head, Link } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import SideModal from "@/components/SideModal";
import DoctorDetailModal from "./DoctorDetailModal";
import { 
    LayoutDashboard, 
    Stethoscope, 
    ClipboardList, 
    NotebookText, 
    Users, 
    Settings, 
    ChevronRight,
    User,
    Calendar,
    DollarSign,
    ArrowLeft,
    Mail,
    Phone,
    MapPin,
    Clock,
} from "lucide-react";

// Partials (Podemos reusar componentes existentes o crear nuevos)
import DoctorDashboard from "./Partials/DoctorDashboard";
import DoctorSessions from "./Partials/DoctorSessions";
import DoctorPayrolls from "./Partials/DoctorPayrolls";
import DoctorPatients from "./Partials/DoctorPatients";
import DoctorConfig from "./Partials/DoctorConfig";
import DoctorAvailability from "./Partials/DoctorAvailability";

export default function DetailDoctor(props) {
    const { doctor, stats, sessions, payrolls, session_types, regions, communes, branches, availabilities, all_availabilities, rooms } = props;
    const [activeTab, setActiveTab] = useState("dashboard");
    const [isModalOpenEdit, setIsModalOpenEdit] = useState(false);

    const tabs = [
        { id: "dashboard", label: "Resumen", icon: LayoutDashboard },
        { id: "sessions", label: "Sesiones", icon: Calendar },
        { id: "availability", label: "Disponibilidad", icon: Clock },
        { id: "payrolls", label: "Liquidaciones", icon: NotebookText },
        { id: "patients", label: "Cartera", icon: Users },
        { id: "config", label: "Tarifas", icon: Settings },
    ];

    return (
        <AuthenticatedLayout>
            <Head title={`Perfil: ${doctor.name} ${doctor.last_name}`} />

            <div className="max-w-full p-4 mx-auto sm:p-6 lg:p-8">
                {/* Cabecera / Breadcrumb */}
                <div className="flex items-center justify-between mb-8">
                    <Link
                        href={route("doctors.index")}
                        className="flex items-center text-xs font-black text-brand-gray uppercase tracking-widest hover:text-brand-primary transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Volver al Listado
                    </Link>

                    <button
                        onClick={() => setIsModalOpenEdit(true)}
                        className="inline-flex items-center px-6 py-3 bg-white border border-gray-100 text-brand-primary text-[10px] font-black uppercase tracking-widest rounded-2xl hover:bg-brand-primary hover:text-white transition-all shadow-sm active:scale-95 gap-2"
                    >
                        <Settings className="w-4 h-4" />
                        Editar Perfil
                    </button>
                </div>

                <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
                    {/* COLUMNA IZQUIERDA: PERFIL */}
                    <div className="lg:col-span-1 space-y-6">
                        <div className="bg-white border border-gray-100 shadow-xl rounded-[2.5rem] overflow-hidden">
                            <div className="h-24 bg-brand-primary relative">
                                <div className="absolute -bottom-12 left-1/2 -translate-x-1/2">
                                    <div className="w-24 h-24 bg-white rounded-3xl shadow-xl flex items-center justify-center border-4 border-white p-1">
                                        <div className="w-full h-full bg-brand-secondary/30 rounded-2xl flex items-center justify-center text-brand-primary">
                                            <User className="w-12 h-12" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="pt-16 pb-8 px-8 text-center space-y-4">
                                <div>
                                    <h1 className="text-xl font-black text-gray-900 uppercase tracking-tight">
                                        {doctor.name} {doctor.last_name}
                                    </h1>
                                    <p className="text-[10px] font-black text-brand-primary uppercase tracking-[0.2em]">
                                        {doctor.speciality || 'Especialista'}
                                    </p>
                                </div>

                                <div className="pt-6 space-y-3 border-t border-gray-50">
                                    <div className="flex items-center gap-3 text-left">
                                        <div className="p-2 bg-gray-50 rounded-xl text-gray-400">
                                            <Mail className="w-4 h-4" />
                                        </div>
                                        <span className="text-xs font-bold text-gray-600 truncate">{doctor.email}</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-left">
                                        <div className="p-2 bg-gray-50 rounded-xl text-gray-400">
                                            <Phone className="w-4 h-4" />
                                        </div>
                                        <span className="text-xs font-bold text-gray-600">{doctor.phone || 'S/N'}</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-left">
                                        <div className="p-2 bg-gray-50 rounded-xl text-gray-400">
                                            <MapPin className="w-4 h-4" />
                                        </div>
                                        <span className="text-xs font-bold text-gray-600 truncate">
                                            {doctor.comuna_name || 'Sin dirección'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* MENU DE PESTAÑAS (Vertical) */}
                        <div className="bg-white border border-gray-100 shadow-lg rounded-[2rem] p-3 space-y-1">
                            {tabs.map((tab) => {
                                const Icon = tab.icon;
                                const isActive = activeTab === tab.id;
                                return (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`w-full flex items-center justify-between px-5 py-4 rounded-2xl transition-all group ${
                                            isActive 
                                            ? "bg-brand-primary text-white shadow-lg shadow-brand-primary/20" 
                                            : "text-gray-500 hover:bg-gray-50 hover:text-brand-primary"
                                        }`}
                                    >
                                        <div className="flex items-center gap-4">
                                            <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-brand-primary'}`} />
                                            <span className="text-[11px] font-black uppercase tracking-widest">{tab.label}</span>
                                        </div>
                                        <ChevronRight className={`w-4 h-4 opacity-30 ${isActive ? 'block' : 'hidden'}`} />
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* COLUMNA DERECHA: CONTENIDO */}
                    <div className="lg:col-span-3">
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                            {activeTab === "dashboard" && <DoctorDashboard {...props} />}
                            {activeTab === "sessions" && <DoctorSessions {...props} />}
                            {activeTab === "availability" && <DoctorAvailability {...props} />}
                            {activeTab === "payrolls" && <DoctorPayrolls {...props} />}
                            {activeTab === "patients" && <DoctorPatients {...props} />}
                            {activeTab === "config" && <DoctorConfig {...props} />}
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal para EDITAR existente */}
            <SideModal
                open={isModalOpenEdit}
                onClose={() => setIsModalOpenEdit(false)}
                width="4xl"
                hideDefaultHeader={true}
            >
                <DoctorDetailModal
                    doctor={doctor}
                    setIsModalOpenDetail={() => setIsModalOpenEdit(false)}
                    regions={regions}
                    communes={communes}
                    branches={branches}
                />
            </SideModal>
        </AuthenticatedLayout>
    );
}
