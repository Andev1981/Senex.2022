import { Link } from "@inertiajs/react";
import {
  User,
  Activity,
  FileText,
  DollarSign,
  Phone,
  Mail,
  MapPin,
  Edit,
  ArrowLeft,
} from "lucide-react";
import { fmtRUT } from "@/utils/utils";

export default function PatientSidebar({ patient, activeTab, setActiveTab }) {
  // Función auxiliar para formatear la dirección y evitar el error de Objeto
  const getFormattedAddress = () => {
    if (!patient.address) return "Sin dirección registrada";

    // Accedemos a las propiedades del objeto address
    const { street, number, details, commune } = patient.address;

    let addressStr = `${street} #${number}`;
    if (details) addressStr += `, ${details}`;
    if (commune && commune.name) addressStr += `\n${commune.name}`;

    return addressStr;
  };

  const menuItems = [
    { id: "dashboard", label: "Resumen / Dashboard", icon: Activity },
    { id: "general", label: "Información General", icon: User },
    { id: "history", label: "Ficha Clínica", icon: FileText },
    { id: "payments", label: "Pagos y Bonos", icon: DollarSign },
    { id: "documents", label: "Documentos", icon: FileText },
  ];

  return (
    <aside className="flex flex-col w-full h-full min-h-screen overflow-y-auto bg-slate-50/80 border-r border-gray-200 md:w-80 custom-scrollbar backdrop-blur-sm">
      {/* 1. Perfil del Paciente (Estilo Ficha Técnica) */}
      <div className="flex flex-col items-center p-8 text-center border-b border-gray-200 relative overflow-hidden bg-white">
        <div className="absolute top-0 right-0 w-32 h-32 bg-brand-primary/5 rounded-full -mr-16 -mt-16 blur-2xl"></div>
        
        <div className="relative mb-6">
            <div className="flex items-center justify-center w-24 h-24 overflow-hidden text-brand-primary bg-slate-50 rounded-[2rem] shadow-inner transform -rotate-3 transition-transform duration-500 border-2 border-white ring-4 ring-slate-50">
            {patient.photo_url ? (
                <img
                src={patient.photo_url}
                alt=""
                className="object-cover w-full h-full"
                />
            ) : (
                <User className="w-10 h-10" />
            )}
            </div>
            <div className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-xl border-4 border-white shadow-sm ${patient.status === 'active' ? 'bg-green-500' : 'bg-gray-300'}`}></div>
        </div>

        <h2 className="text-xl font-black leading-tight text-gray-900 uppercase tracking-tight">
          {patient.name} <span className="block text-brand-primary">{patient.last_name}</span>
        </h2>
        <p className="mt-2 font-mono text-[10px] font-black text-brand-gray uppercase tracking-[0.2em]">{fmtRUT(patient.rut)}</p>
      </div>

      {/* 2. Datos Rápidos (Diseño Compacto) */}
      <div className="p-6 space-y-3 border-b border-gray-200">
        <div className="flex items-center gap-3 text-[11px] font-bold text-gray-500">
          <Phone className="w-3.5 h-3.5 text-brand-primary opacity-60" />
          <span>{patient.phone || "--"}</span>
        </div>
        <div className="flex items-center gap-3 text-[11px] font-bold text-gray-500">
          <Mail className="w-3.5 h-3.5 text-brand-primary opacity-60" />
          <span className="truncate">{patient.email || "--"}</span>
        </div>
      </div>

      {/* 3. Menú de Ficha (Estilo Tabs Integrados) */}
      <nav className="flex-1 p-4 space-y-1">
        <p className="enterprise-label px-4 mb-4 opacity-40">Navegación Ficha</p>
        {menuItems.map((item) => {
          const Icon = item.icon;
          const active = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-4 px-5 py-3.5 text-[10px] font-black uppercase tracking-[0.15em] rounded-2xl transition-all duration-300 ${
                active
                  ? "bg-white text-brand-primary shadow-lg shadow-gray-200/50 border-l-4 border-brand-primary scale-[1.02]"
                  : "text-brand-gray hover:bg-white/50 hover:text-brand-primary"
              }`}
            >
              <Icon
                className={`w-4 h-4 ${active ? "text-brand-primary" : "text-gray-400"}`}
              />
              {item.label}
            </button>
          );
        })}
      </nav>

      {/* 4. Footer Sidebar */}
      <div className="p-6 bg-white border-t border-gray-100">
        <button className="w-full flex items-center justify-center gap-2 py-3 text-[9px] font-black uppercase tracking-widest text-brand-primary bg-brand-secondary/10 rounded-xl border border-brand-secondary/20 hover:bg-brand-primary hover:text-white transition-all duration-300">
          <Edit className="w-3.5 h-3.5" /> Editar Datos
        </button>
      </div>
    </aside>
  );
}
