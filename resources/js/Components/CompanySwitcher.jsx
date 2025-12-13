import React from "react";
import { useForm, router, usePage } from "@inertiajs/react";
import { Building2 } from "lucide-react";

// Asumimos que recibe la lista de todas las empresas disponibles
export default function CompanySwitcher() {
  // Acceder a los props globales
  const { props } = usePage();

  // 🎯 Desestructurar all_companies del objeto props
  const allCompanies = props.all_companies || [];

  // También puedes acceder al ID activo si no lo pasas como prop
  const currentCompanyId = props.current_company_id;

  // Usamos useForm para manejar el cambio de estado y el envío
  const { data, setData, processing } = useForm({
    // Inicializar con el ID de la empresa actual (inyectado globalmente)
    selected_company_id: currentCompanyId || "",
  });

  const handleChange = (e) => {
    const newCompanyId = e.target.value;

    // 1. Actualizar el estado local
    setData("selected_company_id", newCompanyId);

    // 2. Enviar la solicitud al backend para cambiar la sesión
    router.post(
      route("admin.switch-company"),
      {
        company_id: newCompanyId,
      },
      {
        preserveScroll: true,
        // Reemplazamos la historia del navegador (replace) para que el botón 'Atrás' no recargue el switch
        replace: true,
        onSuccess: () => {
          // Opcional: Mostrar una notificación de éxito
        },
      }
    );
  };

  return (
    <div className="flex items-center gap-2 p-2 text-sm bg-gray-100 rounded-lg">
      <Building2 className="w-4 h-4 text-gray-600" />

      <select
        value={data.selected_company_id}
        onChange={handleChange}
        disabled={processing}
        className="py-1 text-gray-800 bg-transparent border-none focus:ring-0 focus:outline-none"
      >
        {allCompanies.map((company) => (
          <option key={company.id} value={company.id}>
            {company.business_name} ({company.id})
          </option>
        ))}
      </select>
      {processing && (
        <span className="text-xs text-gray-500">Cambiando...</span>
      )}
    </div>
  );
}
