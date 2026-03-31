import { Head } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import TableKines from "@/Pages/Kines/TableKines";
export default function KinesIndex({ user, doctors }) {
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
              <TableKines
                doctors={doctors}
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
