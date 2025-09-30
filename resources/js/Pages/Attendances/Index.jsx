import { useForm, Link, Head } from "@inertiajs/react";
import { useState } from "react";
import PrimaryButton from "@/Components/PrimaryButton";
import InputError from "@/Components/InputError";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import TableAttendances from "./TableAttendances";

export default function Index({ sessions }) {
  const handleOpenModalOptions = (attendance) => {
    console.log("Open Modal Options for attendance:", attendance);
    // Aquí puedes agregar la lógica para abrir el modal y pasar los datos necesarios
  };

  const handleOpenModalContactPersons = (attendance) => {
    console.log("Open Modal Contact Persons for attendance:", attendance);
    // Aquí puedes agregar la lógica para abrir el modal y pasar los datos necesarios
  };

  return (
    <AuthenticatedLayout>
      <Head title="Atenciones" />
      <div className="py-6">
        <div className="mx-auto sm:px-2 lg:px-4">
          <div className="overflow-hidden bg-white shadow-xl sm:rounded-lg dark:bg-gray-800">
            <div className="p-6 text-gray-900 dark:text-gray-100">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center">
                  <img src={"/icons/controlar.gif"} className="w-10 h-10" />

                  <label className="text-lg font-semibold">
                    Resumen Mensual Atenciones
                  </label>
                </div>
              </div>
              <TableAttendances
                sessions={sessions}
                handleOpenModalOptions={handleOpenModalOptions}
                logoUrl={"/img/logo-cabecera.png"} //
                handleOpenModalContactPersons={handleOpenModalContactPersons}
              />
            </div>
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
