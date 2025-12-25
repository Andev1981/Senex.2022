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
    <aside className="fixed top-0 left-0 z-10 flex flex-col w-full h-full min-h-screen overflow-y-auto bg-white border-r border-gray-200 md:w-80">
      {/* 1. Botón Volver */}
      <div className="p-4 border-b border-gray-100">
        <Link
          href={route("patients.index")}
          className="flex items-center gap-2 text-sm text-gray-500 transition-colors hover:text-blue-600"
        >
          <ArrowLeft className="w-4 h-4" /> Volver al listado
        </Link>
      </div>

      {/* 2. Perfil del Paciente */}
      <div className="flex flex-col items-center p-6 text-center border-b border-gray-100">
        <div className="flex items-center justify-center w-24 h-24 mb-4 overflow-hidden text-blue-600 bg-blue-100 rounded-full shadow-sm">
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

        <h2 className="text-xl font-bold leading-tight text-gray-900">
          {patient.name} {patient.last_name}
        </h2>
        <p className="mt-1 text-sm text-gray-500">{fmtRUT(patient.rut)}</p>

        {/* Badges de Estado */}
        <div className="flex gap-2 mt-3">
          <span
            className={`px-2 py-1 text-xs rounded-full font-medium ${
              patient.status === "active"
                ? "bg-green-100 text-green-700"
                : "bg-gray-100 text-gray-600"
            }`}
          >
            {patient.status === "active" ? "Activo" : "Inactivo"}
          </span>
          <span
            className={`px-2 py-1 text-xs rounded-full font-medium ${
              patient.payment_status === "due"
                ? "bg-red-100 text-red-700"
                : "bg-blue-50 text-blue-600"
            }`}
          >
            {patient.payment_status === "due" ? "Con Deuda" : "Al día"}
          </span>
        </div>

        <button className="flex items-center gap-1 mt-4 text-xs font-medium text-blue-600 hover:underline">
          <Edit className="w-3 h-3" /> Editar Datos Personales
        </button>
      </div>

      {/* 3. Datos Rápidos de Contacto */}
      <div className="p-6 space-y-3 border-b border-gray-100">
        <div className="flex items-center gap-3 text-sm text-gray-600">
          <Phone className="w-4 h-4 text-gray-400" />
          <span>{patient.phone || "--"}</span>
        </div>
        <div className="flex items-center gap-3 text-sm text-gray-600">
          <Mail className="w-4 h-4 text-gray-400" />
          <span className="truncate" title={patient.email}>
            {patient.email || "--"}
          </span>
        </div>
        <div className="flex items-start gap-3 text-sm text-gray-600">
          <MapPin className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
          {/* AQUÍ ESTABA EL ERROR: Ahora usamos la función que devuelve string */}
          <span className="leading-tight text-left whitespace-pre-line">
            {getFormattedAddress()}
          </span>
        </div>
      </div>

      {/* 4. Menú de Navegación (Tabs Verticales) */}
      <nav className="flex-1 p-4 space-y-1 bg-gray-50/50">
        <p className="px-3 mb-2 text-xs font-semibold tracking-wider text-gray-400 uppercase">
          Menú
        </p>
        {menuItems.map((item) => {
          const Icon = item.icon;
          const active = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-all ${
                active
                  ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                  : "text-gray-600 hover:bg-white hover:text-gray-900"
              }`}
            >
              <Icon
                className={`w-5 h-5 ${active ? "text-white" : "text-gray-400"}`}
              />
              {item.label}
            </button>
          );
        })}
      </nav>
    </aside>
  );
}
