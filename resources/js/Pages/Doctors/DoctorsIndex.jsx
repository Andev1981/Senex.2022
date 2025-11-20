import { useMemo, useState } from "react";
import {
  Users,
  Stethoscope,
  AlertCircle,
  CheckCircle2,
  Percent,
  Plus,
} from "lucide-react";
import { Head } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import SideModal from "@/Components/SideModal";
import DoctorModalForm from "./DoctorModalForm";
import TableDoctors from "./TableDoctors";
import DoctorDetailModal from "./DoctorDetailModal";
import DoctorAttendances from "./DoctorAttendances";
import Kpis from "./Partials/Kpis";
import { HeaderDoctors } from "./Partials/HeaderDoctor";

export default function DoctorsIndex({
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

  return (
    <AuthenticatedLayout>
      <Head title="Pacientes" />

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
            (s) => s.status === "Completada"
          )}
          setIsModalOpenAttendences={setIsModalOpenAttendences}
        />
      </SideModal>
    </AuthenticatedLayout>
  );
}
