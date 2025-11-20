import { useForm } from "@inertiajs/react";
import React from "react";

function PlanModalDelete({ plan, setOpenModalDelete }) {
  const {
    data,
    reset,
    processing,
    delete: destroy,
  } = useForm({
    id: plan?.id ? plan?.id : null,
  });

  const handleDelete = (e) => {
    e.preventDefault();

    if (data?.id !== null) {
      destroy(route("plans.destroy", data.id), {
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
        ¿Eliminar este plan?
      </h2>
      <p className="mx-6 text-xs font-medium text-center text-gray-500 dark:text-gray-200">
        ¿Estás seguro de eliminar este plan? <br /> No puedes deshacer esta
        acción.
      </p>

      <div className="flex-row items-center py-4 mx-auto text-center md:justify-between">
        <div className="space-y-2 sm:space-x-2">
          <button
            disabled={processing}
            onClick={() => setOpenModalDelete(false)}
            className="px-3 py-1 font-semibold text-gray-200 bg-gray-500 rounded-full modal-close hover:bg-gray-800 dark:hover:bg-gray-600 hover:text-gray-100 focus:outline-none"
          >
            No, Cancelar
          </button>
          <button
            disabled={processing}
            onClick={handleDelete}
            className="px-3 py-1 font-semibold text-gray-200 bg-red-500 rounded-full modal-close dark:bg-gray-100 dark:text-gray-700 hover:bg-red-600 dark:hover:bg-white hover:text-gray-100 dark:hover:text-gray-800 focus:outline-none"
          >
            Sí, Eliminar plan!
          </button>
        </div>
      </div>
    </div>
  );
}

export default PlanModalDelete;
