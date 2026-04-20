import { useState } from "react";
import { Head } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import SideModal from "@/components/SideModal";
import TableDoctors from "./TableDoctors";
import DoctorDetailModal from "./DoctorDetailModal"; // Solo para CREACIÓN
import { UserPlus } from "lucide-react";

export default function Index(props) {
  const { doctors, regions, provinces, communes } = props;
  const [isModalOpenCreate, setIsModalOpenCreate] = useState(false);

  return (
    <AuthenticatedLayout>
      <Head title="Gestión de Profesionales" />

      <div className="max-w-full p-4 mx-auto sm:p-6 lg:p-8">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between mb-10">
          <div>
            <h2 className="text-3xl font-black text-gray-900 uppercase tracking-tight">
              Especialistas
            </h2>
            <p className="text-sm font-bold text-brand-gray uppercase tracking-widest opacity-60">
              Administración de personal y honorarios
            </p>
          </div>

          <button
            onClick={() => setIsModalOpenCreate(true)}
            className="inline-flex items-center justify-center px-8 py-4 bg-brand-primary text-white text-[10px] font-black uppercase tracking-widest rounded-2xl hover:brightness-110 transition-all shadow-xl shadow-brand-primary/20 active:scale-95"
          >
            <UserPlus className="w-4 h-4 mr-3" />
            Registrar Especialista
          </button>
        </div>

        <TableDoctors {...props} />
      </div>

      {/* Modal solo para registrar uno NUEVO */}
      <SideModal
        open={isModalOpenCreate}
        onClose={() => setIsModalOpenCreate(false)}
        title="Nuevo Profesional"
        subtitle="Registro de cuenta y datos básicos"
      >
        <DoctorDetailModal
          onClose={() => setIsModalOpenCreate(false)}
          regions={regions}
          provinces={provinces}
          communes={communes}
        />
      </SideModal>
    </AuthenticatedLayout>
  );
}
