import React from "react";
import { useForm, router, usePage } from "@inertiajs/react";
import { MapPin } from "lucide-react"; // Cambiamos el icono a uno de ubicación

export default function BranchSwitcher() {
  const { props } = usePage();

  // 🎯 Obtenemos los datos inyectados por el Middleware
  // Nota: ajusta la ruta según cómo los envíes (ej: props.auth.available_branches)
  const availableBranches = props.available_branches || [];
  const currentBranch = props.current_branch;

  const { data, setData, processing } = useForm({
    selected_branch_id: currentBranch?.id || "",
  });

  const handleChange = (e) => {
    const newBranchId = e.target.value;
    setData("selected_branch_id", newBranchId);

    // 🚀 Enviamos la solicitud al backend para cambiar la sucursal activa
    router.post(
      route("admin.switch-branch"), // Asegúrate de tener esta ruta en Laravel
      { branch_id: newBranchId },
      {
        preserveScroll: true,
        replace: true,
      }
    );
  };

  // 💡 Si el usuario solo tiene 1 sucursal, mostramos el nombre en modo lectura (estilo badge)

      return (
        <div className="flex items-center gap-1.5 px-2 py-1 text-sm bg-gray-50 rounded-lg border border-gray-100 w-full">
            <MapPin className="w-3 h-3 text-brand-primary" />
            <span className="font-bold text-gray-700 truncate text-[9px] uppercase tracking-wide">
                {currentBranch?.name || "Sucursal Única"}
            </span>
        </div>
      );


}
