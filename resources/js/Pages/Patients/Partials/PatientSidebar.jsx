import React from 'react';
import { 
    LayoutDashboard, 
    User, 
    ClipboardList, // Usaremos este icono para Ficha Clínica/Historial
    Stethoscope,   // Para Tratamientos
    CreditCard     // Para Pagos
} from 'lucide-react';

export default function PatientSidebar({ activeTab, setActiveTab, handleEditPatient, patient }) {
    
    // ESTA ES LA CLAVE: Los 'id' deben ser idénticos a los de DetailPatient.jsx
    const menuItems = [
        { 
            id: "dashboard", 
            label: "Dashboard / Resumen", 
            icon: LayoutDashboard 
        },
        { 
            id: "general", 
            label: "Información General", 
            icon: User 
        },
        { 
            id: "history",  // <--- IMPORTANTE: Debe coincidir con {activeTab === "history" && ...}
            label: "Ficha Clínica", 
            icon: ClipboardList 
        },
        { 
            id: "treatments", 
            label: "Tratamientos", 
            icon: Stethoscope 
        },
        { 
            id: "payments", 
            label: "Pagos y Bonos", 
            icon: CreditCard 
        },
    ];

    return (
        <aside className="h-full bg-white border-r border-gray-100 p-6 flex flex-col">
            
            {/* Tarjeta Resumen del Paciente (Arriba) */}
            <div className="mb-8 text-center">
                <div className="w-20 h-20 bg-brand-primary/10 text-brand-primary rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-black">
                    {patient.name.charAt(0)}{patient.last_name.charAt(0)}
                </div>
                <h2 className="text-lg font-black text-gray-800 leading-tight">
                    {patient.name} {patient.last_name}
                </h2>
                <p className="text-xs font-bold text-gray-400 mt-1">{patient.rut}</p>
                
                <button 
                    onClick={handleEditPatient}
                    className="mt-4 text-[10px] font-black uppercase tracking-widest text-brand-primary hover:underline"
                >
                    Editar Datos
                </button>
            </div>

            {/* Menú de Navegación */}
            <nav className="space-y-2 flex-1">
                {menuItems.map((item) => {
                    const isActive = activeTab === item.id;
                    return (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id)}
                            className={`w-full flex items-center gap-4 px-4 py-4 rounded-xl transition-all duration-300 group ${
                                isActive 
                                ? 'bg-brand-primary text-white shadow-lg shadow-brand-primary/30 translate-x-1' 
                                : 'text-gray-500 hover:bg-gray-50 hover:text-brand-primary'
                            }`}
                        >
                            <item.icon className={`w-5 h-5 transition-transform ${isActive ? 'scale-110' : 'group-hover:scale-110'}`} />
                            <span className="text-[11px] font-black uppercase tracking-wider">
                                {item.label}
                            </span>
                        </button>
                    );
                })}
            </nav>

            <div className="mt-auto pt-6 border-t border-gray-50 text-center">
                <p className="text-[9px] text-gray-300 uppercase font-bold">KineSoft Pro v2.0</p>
            </div>
        </aside>
    );
}