import React, { useEffect } from "react";
import { useForm, router, usePage } from "@inertiajs/react";
import { Building2 } from "lucide-react";

export default function CompanySwitcher() {
  const { props } = usePage();

  // 1. Desestructurar con valores por defecto para evitar errores de renderizado
  const allCompanies = props.all_companies || [];
  const currentCompanyId = props.current_company_id || "";

  // 2. Usamos useForm
  const { data, setData, processing } = useForm({
    selected_company_id: currentCompanyId,
  });

  // 3. 💡 EFECTO CLAVE: Si el currentCompanyId cambia desde el servidor
  // (por ejemplo, al loguearse), actualizamos el estado local del select.
  useEffect(() => {
    setData("selected_company_id", currentCompanyId);
  }, [currentCompanyId]);

  const handleChange = (e) => {
    const newCompanyId = e.target.value;

    // Actualizamos el select visualmente de inmediato
    setData("selected_company_id", newCompanyId);

    router.post(
      route("admin.switch-company"),
      { company_id: newCompanyId },
      {
        preserveScroll: true,
        replace: true,
        onSuccess: () => {
          // Aquí podrías disparar un toast o notificación
        },
      }
    );
  };

  // 4. Si el usuario no tiene acceso a múltiples empresas (ej: Kine normal),
  // ocultamos el switcher por completo.
  if (allCompanies.length <= 1) return null;

  return (
    <div className="flex items-center gap-2 p-2 text-sm bg-gray-100 rounded-lg mb-2 border border-gray-200 shadow-sm">
      <Building2 className="w-4 h-4 text-gray-500" />

      <select
        value={data.selected_company_id}
        onChange={handleChange}
        disabled={processing}
        className="py-1 pr-8 text-gray-800 bg-transparent border-none focus:ring-0 focus:outline-none font-medium cursor-pointer"
      >
        {/* Opción por defecto si eres Superadmin y no has elegido nada */}
        {data.selected_company_id === "" && (
          <option value="">Seleccione Empresa...</option>
        )}

        {allCompanies.map((company) => (
          <option key={company.id} value={company.id}>
            {company.business_name}
          </option>
        ))}
      </select>

      {processing && (
        <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-gray-600"></div>
      )}
    </div>
  );
}
