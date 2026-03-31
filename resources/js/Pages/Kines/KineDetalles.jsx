import { Head } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import TableAtenciones from "@/Pages/Kines/TableAtenciones";
export default function KineDetalles({ user, doctor, atenciones }) {
  const handleOpenModalOptions = () => {};
  const handleOpenModalContactPersons = () => {};

  return (
    <AuthenticatedLayout user={user}>
      <Head title="Dashboard" />
      <div className="py-6">
        <div className="mx-auto sm:px-2 lg:px-4">
          <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg dark:bg-gray-800">
            <div className="p-6 text-gray-900 dark:text-gray-100">
              <div className="flex items-center justify-between mb-6">
                Detalle de Kine: {doctor.name} {doctor.last_name}
              </div>
              <TableAtenciones
                atenciones={atenciones}
                handleOpenModalOptions={handleOpenModalOptions}
                logoUrl={"/img/logo-cabecera.png"} //
                kineName={`${doctor.name} ${doctor.last_name}`}
                handleOpenModalContactPersons={handleOpenModalContactPersons}
              />
            </div>
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
