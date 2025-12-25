import { useState } from "react";
import { Head } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import SideModal from "@/Components/SideModal";
import DoctorModalForm from "./DoctorModalForm";
import TableDoctors from "./TableDoctors";
import DoctorDetailModal from "./DoctorDetailModal";
import DoctorAttendances from "./DoctorAttendances";
import Kpis from "./Partials/Kpis";
import { HeaderDoctors } from "./Partials/HeaderDoctor";
import { Smartphone, ShieldBan } from "lucide-react";

export default function Index({
  doctors,
  sessionTypes,
  patients,
  communes,
  provinces,
  regions,
}) {
  // Estado principal de doctores (para poder editar)

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isModalOpenDetail, setIsModalOpenDetail] = useState(false);
  const [isModalOpenAttendences, setIsModalOpenAttendences] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState(null);

  const getStatusBadge = (status) => {
    switch (status) {
      case "active":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800 border border-green-200">
            <span className="w-1.5 h-1.5 mr-1.5 bg-green-600 rounded-full"></span>
            Activo
          </span>
        );
      case "suspended":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800 border border-yellow-200">
            Suspendido
          </span>
        );
      case "cancelled": // o inactivo
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800 border border-red-200">
            Cancelado
          </span>
        );
      default: // unassigned
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800 border border-gray-200">
            Sin Asignar
          </span>
        );
    }
  };

  const getMobileBadge = (mobile_app_access) => {
    if (mobile_app_access) {
      return (
        <div
          className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-200"
          title="Tiene acceso a la App Móvil"
        >
          <Smartphone className="w-3.5 h-3.5" strokeWidth={2.5} />
          <span>App Móvil</span>
        </div>
      );
    }

    return (
      <div
        className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-50 text-gray-400 border border-gray-200 opacity-80"
        title="No tiene acceso a la App"
      >
        <ShieldBan className="w-3.5 h-3.5" />
        <span>Sin App</span>
      </div>
    );
  };

  return (
    <AuthenticatedLayout>
      <Head title="Kinesiólogos" />

      <div className="min-h-screen p-4 bg-gray-50">
        {/* Header */}
        <HeaderDoctors
          setSelectedDoctor={setSelectedDoctor}
          setIsModalOpenDetail={setIsModalOpenDetail}
        />

        {/* KPIs */}
        <Kpis doctors={doctors} />

        {/* TableDoctor */}
        <TableDoctors
          doctors={doctors}
          setSelectedDoctor={setSelectedDoctor}
          setIsModalOpen={setIsModalOpen}
          setIsModalOpenDetail={setIsModalOpenDetail}
          setIsModalOpenAttendences={setIsModalOpenAttendences}
          getStatusBadge={getStatusBadge}
          getMobileBadge={getMobileBadge}
        />
      </div>
      {/* Modal */}
      <SideModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={"Ficha de Kine"}
        width="4xl" // sm, md, lg, xl, 2xl, 3xl, full
      >
        <DoctorModalForm
          selectedDoctor={selectedDoctor}
          setIsModalOpen={setIsModalOpen}
          sessionTypes={sessionTypes}
          patients={patients}
          getStatusBadge={getStatusBadge}
        />
      </SideModal>

      <SideModal
        open={isModalOpenDetail}
        onClose={() => setIsModalOpenDetail(false)}
        title={"Detalle Kine"}
        width="4xl" // sm, md, lg, xl, 2xl, 3xl, full
      >
        <DoctorDetailModal
          doctor={selectedDoctor}
          provinces={provinces}
          regions={regions}
          communes={communes}
          setIsModalOpenDetail={setIsModalOpenDetail}
        />
      </SideModal>

      <SideModal
        open={isModalOpenAttendences}
        onClose={() => setIsModalOpenAttendences(false)}
        title={"Atenciones Kine"}
        width="5xl" // sm, md, lg, xl, 2xl, 3xl, full
      >
        <DoctorAttendances
          doctor={selectedDoctor}
          sessions={selectedDoctor?.sessions?.filter(
            (s) => s.status === "completed"
          )}
          setIsModalOpenAttendences={setIsModalOpenAttendences}
        />
      </SideModal>
    </AuthenticatedLayout>
  );
}
