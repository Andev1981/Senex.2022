import { useState } from "react";
import { Head } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import SideModal from "@/Components/SideModal";
import TableDoctors from "./TableDoctors";
import DoctorDetailModal from "./DoctorDetailModal";
import DoctorCommissions from "./Partials/DoctorCommissions";
import DoctorPatients from "./Partials/DoctorPatients";
import Kpis from "./Partials/Kpis";
import { HeaderDoctors } from "./Partials/HeaderDoctor";
import { Smartphone, ShieldBan, ShieldCheck, AlertCircle, XCircle, UserCog } from "lucide-react";

export default function Index({

  doctors,

  sessionTypes,

  patients,

  communes,

  provinces,

  regions,

  user,

}) {

  const [isModalOpenDetail, setIsModalOpenDetail] = useState(false);

  const [isModalOpenCommissions, setIsModalOpenCommissions] = useState(false);

  const [isModalOpenPatients, setIsModalOpenPatients] = useState(false);

  const [selectedDoctor, setSelectedDoctor] = useState(null);



  const getStatusBadge = (statusObj) => {

    const status = typeof statusObj === 'object' ? statusObj?.status : statusObj;

    switch (status) {

      case "active":

        return (

          <span className="inline-flex items-center px-3 py-1 rounded-lg text-[8px] font-black uppercase tracking-[0.2em] bg-green-50 text-green-600 border border-green-100 shadow-sm shadow-green-500/5">

            <span className="w-1.5 h-1.5 mr-2 bg-green-500 rounded-full animate-pulse"></span>

            Operativo

          </span>

        );

      case "suspended":

        return (

          <span className="inline-flex items-center px-3 py-1 rounded-lg text-[8px] font-black uppercase tracking-[0.2em] bg-amber-50 text-amber-600 border border-amber-100 shadow-sm">

            <AlertCircle className="w-3 h-3 mr-1.5" />

            Suspendido

          </span>

        );

      case "cancelled":

        return (

          <span className="inline-flex items-center px-3 py-1 rounded-lg text-[8px] font-black uppercase tracking-[0.2em] bg-red-50 text-red-600 border border-red-100 shadow-sm">

            <XCircle className="w-3 h-3 mr-1.5" />

            Inactivo

          </span>

        );

      default:

        return (

          <span className="inline-flex items-center px-3 py-1 rounded-lg text-[8px] font-black uppercase tracking-[0.2em] bg-gray-50 text-gray-400 border border-gray-100">

            Desconocido

          </span>

        );

    }

  };



  const getMobileBadge = (mobile_app_access) => {

    return (

        <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-lg text-[8px] font-black uppercase tracking-[0.2em] border shadow-sm transition-all ${

            mobile_app_access 

            ? "bg-brand-secondary/10 text-brand-primary border-brand-secondary/20" 

            : "bg-gray-50 text-gray-300 border-gray-100 opacity-60"

        }`}>

            {mobile_app_access ? <Smartphone className="w-3 h-3" /> : <ShieldBan className="w-3 h-3" />}

            {mobile_app_access ? 'Mobile Link' : 'No App'}

        </div>

    );

  };



  return (

    <AuthenticatedLayout>

      <Head title="Especialistas Médicos" />



      <div className="min-h-screen p-6 md:p-10 bg-gray-50/50 space-y-10">

        <HeaderDoctors

          setSelectedDoctor={setSelectedDoctor}

          setIsModalOpenDetail={setIsModalOpenDetail}

        />



        <Kpis doctors={doctors} />



        <TableDoctors

          doctors={doctors}

          setSelectedDoctor={setSelectedDoctor}

          setIsModalOpenCommissions={setIsModalOpenCommissions}

          setIsModalOpenPatients={setIsModalOpenPatients}

          setIsModalOpenDetail={setIsModalOpenDetail}

          getStatusBadge={getStatusBadge}

          getMobileBadge={getMobileBadge}

          user={user}

        />

      </div>



      {/* MODAL: TARIFARIO & COMISIONES */}

      <SideModal open={isModalOpenCommissions} onClose={() => setIsModalOpenCommissions(false)} width="4xl">

        <DoctorCommissions

          doctor={selectedDoctor}

          sessionTypes={sessionTypes}

        />

      </SideModal>



      {/* MODAL: CARTERA DE PACIENTES */}

      <SideModal open={isModalOpenPatients} onClose={() => setIsModalOpenPatients(false)} width="4xl">

        <DoctorPatients

          doctor={selectedDoctor}

          patients={patients}

        />

      </SideModal>



      {/* MODAL: REGISTRO & DIRECCIÓN */}

      <SideModal open={isModalOpenDetail} onClose={() => setIsModalOpenDetail(false)} width="4xl">

        <DoctorDetailModal

          doctor={selectedDoctor}

          provinces={provinces}

          regions={regions}

          communes={communes}

          setIsModalOpenDetail={setIsModalOpenDetail}

        />

      </SideModal>

    </AuthenticatedLayout>

  );

}
