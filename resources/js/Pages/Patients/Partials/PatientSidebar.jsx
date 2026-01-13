import React from 'react';
import { 
    LayoutDashboard, 
    User, 
    ClipboardList,
    Stethoscope,   
    CreditCard,
    Edit2
} from 'lucide-react';

export default function PatientSidebar({ activeTab, setActiveTab, handleEditPatient, patient }) {
    
    const menuItems = [
        { id: "dashboard", label: "Dashboard Clínico", icon: LayoutDashboard },
        { id: "general", label: "Expediente General", icon: User },
        { id: "history", label: "Ficha Clínica / SOAP", icon: ClipboardList },
        { id: "treatments", label: "Planes Kinésicos", icon: Stethoscope },
        { id: "payments", label: "Cuentas & Pagos", icon: CreditCard },
    ];

    return (
        <aside className="h-full bg-white border-r border-gray-100 flex flex-col overflow-hidden">
            
            {/* --- PERFIL DEL PACIENTE (Header Premium) --- */}
            <div className="relative p-8 pb-10">
                {/* Fondo Decorativo */}
                <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-gray-50 to-white -z-10"></div>
                
                <div className="relative flex flex-col items-center">
                    {/* Avatar con Anillo de Estado */}
                    <div className="relative group">
                        <div className="w-24 h-24 bg-white border-4 border-white shadow-2xl rounded-[2.5rem] flex items-center justify-center text-3xl font-black text-brand-primary transform transition-transform group-hover:scale-105 duration-500">
                            <span className="relative z-10">{patient.name.charAt(0)}{patient.last_name.charAt(0)}</span>
                            <div className="absolute inset-0 bg-brand-primary/5 rounded-[2.5rem]"></div>
                        </div>
                        {/* Botón Flotante Editar */}
                        <button 
                            onClick={handleEditPatient}
                            className="absolute -bottom-1 -right-1 p-2.5 bg-white text-gray-400 hover:text-brand-primary rounded-2xl shadow-xl border border-gray-50 transition-all hover:scale-110 active:scale-90 cursor-pointer"
                            title="Editar Perfil"
                        >
                            <Edit2 className="w-3.5 h-3.5" />
                        </button>
                    </div>

                    <div className="mt-6 text-center">
                        <h2 className="text-xl font-black text-gray-900 leading-tight tracking-tight uppercase">
                            {patient.name} <br/>
                            <span className="text-brand-primary">{patient.last_name}</span>
                        </h2>
                        <div className="mt-3 flex items-center justify-center gap-2">
                            <span className="px-3 py-1 bg-gray-100 text-gray-500 text-[10px] font-black rounded-lg uppercase tracking-widest">
                                {patient.rut}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* --- NAVEGACIÓN (Menú Moderno) --- */}
            <nav className="flex-1 px-4 space-y-1.5 overflow-y-auto custom-scrollbar">
                {menuItems.map((item) => {
                    const isActive = activeTab === item.id;
                    return (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id)}
                            className={`w-full group flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-300 cursor-pointer relative ${
                                isActive 
                                ? 'bg-brand-primary text-white shadow-xl shadow-brand-primary/20 translate-x-1' 
                                : 'text-slate-500 hover:bg-slate-50 hover:text-brand-primary hover:translate-x-1'
                            }`}
                        >
                            {/* Indicador Vertical Activo */}
                            {isActive && (
                                <div className="absolute left-0 w-1 h-6 bg-white rounded-full -ml-1"></div>
                            )}

                            <item.icon className={`w-5 h-5 transition-all duration-500 ${
                                isActive ? 'scale-110' : 'group-hover:scale-110 group-hover:rotate-3'
                            }`} />
                            
                            <span className={`text-[11px] font-black uppercase tracking-wider transition-colors ${
                                isActive ? 'text-white' : 'text-slate-600'
                            }`}>
                                {item.label}
                            </span>
                        </button>
                    );
                })}
            </nav>

            {/* --- FOOTER --- */}
            <div className="p-8 border-t border-gray-50 bg-gray-50/30">
                <div className="flex flex-col items-center gap-1">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Senex Clinical</p>
                    <div className="w-1 h-1 bg-brand-primary rounded-full animate-pulse"></div>
                </div>
            </div>
        </aside>
    );
}