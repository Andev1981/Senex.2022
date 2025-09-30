import React from "react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head } from "@inertiajs/react";

function IndexInformes() {
  return (
    <AuthenticatedLayout>
      {" "}
      <Head title="Informes" />
      <div className="py-6">
        <div className="mx-auto">
          <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg dark:bg-gray-800">
            IndexInformes
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}

export default IndexInformes;
