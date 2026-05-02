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
          Swal.fire({
            title: "¡Eliminado!",
            text: "El plan ha sido removido del sistema.",
            icon: "success",
            timer: 2000,
            showConfirmButton: false,
          });
        },
      });
    }
  };

  return (
    <div className="p-8 flex flex-col items-center text-center space-y-6">
      <div className="w-20 h-20 bg-red-50 rounded-[2rem] flex items-center justify-center text-red-500 mb-2">
        <Trash2 className="w-10 h-10" />
      </div>
      
      <div>
        <h2 className="text-xl font-black text-gray-900 uppercase tracking-tighter mb-2">
            Confirmar Eliminación
        </h2>
        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest leading-relaxed">
            ¿Estás seguro de eliminar el plan <span className="text-red-500 font-black">{plan?.name}</span>? <br />
            Esta acción es irreversible y podría afectar facturaciones pendientes.
        </p>
      </div>

      <div className="flex gap-3 w-full pt-4">
        <button
            disabled={processing}
            onClick={() => setOpenModalDelete(false)}
            className="flex-1 py-4 font-black uppercase tracking-widest text-[10px] text-gray-400 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-all"
        >
            No, Mantener
        </button>
        <button
            disabled={processing}
            onClick={handleDelete}
            className="flex-1 py-4 font-black uppercase tracking-widest text-[10px] text-white bg-red-600 rounded-2xl shadow-xl shadow-red-600/20 hover:bg-red-700 active:scale-95 transition-all"
        >
            {processing ? 'Eliminando...' : 'Sí, Eliminar Plan'}
        </button>
      </div>
    </div>
  );
}

export default PlanModalDelete;
