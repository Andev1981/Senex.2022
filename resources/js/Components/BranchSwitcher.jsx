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

  // 💡 Si el usuario solo tiene 1 sucursal, no mostramos el selector
  if (availableBranches.length <= 1) return null;

  return (
    <div className="flex items-center gap-2 p-2 text-sm bg-blue-50 rounded-lg border border-blue-100">
      <MapPin className="w-4 h-4 text-blue-600" />

      <select
        value={data.selected_branch_id}
        onChange={handleChange}
        disabled={processing}
        className="py-1 pr-8 text-blue-800 bg-transparent border-none focus:ring-0 focus:outline-none font-medium cursor-pointer"
      >
        {availableBranches.map((branch) => (
          <option key={branch.id} value={branch.id}>
            {branch.name}
          </option>
        ))}
      </select>

      {processing && (
        <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600"></div>
      )}
    </div>
  );
}
