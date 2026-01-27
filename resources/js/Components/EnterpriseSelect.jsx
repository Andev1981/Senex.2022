import React from 'react';
import { usePage } from '@inertiajs/react';
import { Building2, MapPin } from 'lucide-react';

const EnterpriseSelect = ({ className = "" }) => {
  const { props } = usePage();
  const { current_company, current_branch } = props;

  return (
    <div className={`flex items-center gap-2 p-3 bg-white border border-gray-100 rounded-2xl shadow-sm ${className}`}>
      <Building2 className="w-5 h-5 text-brand-primary" />
      <div className="flex flex-col min-w-0">
        <span className="text-[10px] font-black uppercase tracking-widest text-brand-gray truncate">
          {current_company?.business_name || "Cargando Empresa..."}
        </span>
        <div className="flex items-center gap-1">
          <MapPin className="w-3 h-3 text-gray-400" />
          <span className="text-xs font-bold text-gray-700 truncate">
            {current_branch?.name || "Cargando Sucursal..."}
          </span>
        </div>
      </div>
    </div>
  );
};

export default EnterpriseSelect;