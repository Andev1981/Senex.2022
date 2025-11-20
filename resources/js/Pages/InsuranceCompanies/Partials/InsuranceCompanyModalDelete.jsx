import { useForm } from "@inertiajs/react";
import React from "react";

function InsuranceCompanyModalDelete({ insuranceCompany, setOpenModalDelete }) {
  const {
    data,
    reset,
    processing,
    delete: destroy,
  } = useForm({
    id: insuranceCompany?.id ? insuranceCompany?.id : null,
  });

  const handleDelete = (e) => {
    e.preventDefault();

    if (data?.id !== null) {
      destroy(route("insurance-companies.destroy", data.id), {
        onSuccess: () => {
          setOpenModalDelete(false);
          reset();
        },
      });
    }
  };

  return (
    <div className="px-4">
      <h2 className="mb-2 text-xl font-bold text-center text-gray-600 dark:text-gray-100">
        Delete this insurance company?
      </h2>
      <p className="mx-6 text-xs font-medium text-center text-gray-500 dark:text-gray-200">
        Are you sure you want to delete this insurance company? <br /> You
        cannot undo this action.
      </p>

      <div className="flex-row items-center py-4 mx-auto text-center md:justify-between">
        <div className="space-y-2 sm:space-x-2">
          <button
            disabled={processing}
            onClick={() => setOpenModalDelete(false)}
            className="px-3 py-1 font-semibold text-gray-200 bg-gray-500 rounded-full modal-close hover:bg-gray-800 dark:hover:bg-gray-600 hover:text-gray-100 focus:outline-none"
          >
            No, Cancel
          </button>
          <button
            disabled={processing}
            onClick={handleDelete}
            className="px-3 py-1 font-semibold text-gray-200 bg-red-500 rounded-full modal-close dark:bg-gray-100 dark:text-gray-700 hover:bg-red-600 dark:hover:bg-white hover:text-gray-100 dark:hover:text-gray-800 focus:outline-none"
          >
            Yes, Delete insurance company!
          </button>
        </div>
      </div>
    </div>
  );
}

export default InsuranceCompanyModalDelete;
