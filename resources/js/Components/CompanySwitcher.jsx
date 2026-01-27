import React from "react";
import { usePage } from "@inertiajs/react";
import { Building2 } from "lucide-react";

export default function CompanySwitcher() {
  const { props } = usePage();

  // Get the current company directly from Inertia props
  const currentCompany = props.current_company;

  // Render a display-only component for the current company
  return (
    <div className="flex items-center gap-2 p-2 text-sm bg-gray-100 rounded-lg mb-2 border border-gray-200 shadow-sm">
      <Building2 className="w-4 h-4 text-gray-500" />
      <span className="font-medium text-gray-800 truncate">
        {currentCompany?.business_name || "Cargando Empresa..."}
      </span>
    </div>
  );
}