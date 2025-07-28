import { Head } from "@inertiajs/inertia-react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import TablePacientes from "@/Pages/TablePacientes";
export default function Dashboard({ user, pacientes }) {
  const handleOpenModalOptions = () => {};
  const handleOpenModalContactPersons = () => {};

  return (
    <AuthenticatedLayout user={user}>
      <Head title="Dashboard" />
      <div className="py-6">
        <div className="mx-auto sm:px-2 lg:px-4">
          <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg dark:bg-gray-800">
            <div className="p-6 text-gray-900 dark:text-gray-100">
              <div className="flex items-center justify-between mb-6"></div>
              <TablePacientes
                pacientes={pacientes}
                handleOpenModalOptions={handleOpenModalOptions}
                handleOpenModalContactPersons={handleOpenModalContactPersons}
              />
            </div>
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
