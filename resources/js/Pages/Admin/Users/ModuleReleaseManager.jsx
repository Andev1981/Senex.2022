import React, { useState } from "react";
import { useForm } from "@inertiajs/react";
import { Save, Building2, MapPin, CheckSquare, Square, LayoutGrid, Info } from "lucide-react";
import PrimaryButton from "@/Components/PrimaryButton";
import Checkbox from "@/Components/Checkbox";

export default function ModuleReleaseManager({ companies, branches }) {
  const [selectedEntity, setSelectedEntity] = useState({ type: 'company', id: companies[0]?.id });

  const entityData = selectedEntity.type === 'company' 
    ? companies.find(c => c.id === selectedEntity.id)
    : branches.find(b => b.id === selectedEntity.id);

  const { data, setData, put, processing } = useForm({
    enabled_modules: entityData?.enabled_modules || ['clinical_management', 'commercial_management', 'finance_admin']
  });

  // Al cambiar de empresa/sucursal, refrescar los módulos habilitados en el form
  const handleEntityChange = (type, id) => {
    const newEntity = type === 'company' 
      ? companies.find(c => c.id === id)
      : branches.find(b => b.id === id);
    
    setSelectedEntity({ type, id });
    setData("enabled_modules", newEntity?.enabled_modules || ['clinical_management', 'commercial_management', 'finance_admin']);
  };

  const toggleModule = (moduleKey) => {
    const newModules = data.enabled_modules.includes(moduleKey)
      ? data.enabled_modules.filter(m => m !== moduleKey)
      : [...data.enabled_modules, moduleKey];
    setData("enabled_modules", newModules);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const routeName = selectedEntity.type === 'company' 
        ? "admin.users-management.companies.modules.update" 
        : "admin.users-management.branches.modules.update";
    
    put(route(routeName, selectedEntity.id), {
      preserveScroll: true,
    });
  };

  const modules = [
    { key: 'clinical_management', label: 'Gestión Clínica', description: 'Habilita Pacientes, Kines, Atenciones y Tipos de Sesión.' },
    { key: 'commercial_management', label: 'Gestión Comercial', description: 'Habilita Clientes, Catálogo de Productos y Categorías.' },
    { key: 'finance_admin', label: 'Administración y Finanzas', description: 'Habilita Facturación SII, Pagos, DTE, Convenios y Payroll.' },
    { key: 'system_config', label: 'Configuración del Sistema', description: 'Habilita gestión de Compañías, Usuarios y Suscripciones.' },
  ];

  return (
    <div className="flex h-[calc(100vh-350px)]">
      {/* Sidebar de Selección */}
      <div className="w-80 border-r border-gray-100 p-6 space-y-6 overflow-y-auto bg-gray-50/30">
        <div>
            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                <Building2 className="w-3 h-3" /> Empresas
            </h3>
            <div className="space-y-1">
                {companies.map((company) => (
                <button
                    key={company.id}
                    onClick={() => handleEntityChange('company', company.id)}
                    className={`w-full text-left px-4 py-2.5 rounded-xl transition-all flex items-center justify-between group ${
                    selectedEntity.type === 'company' && selectedEntity.id === company.id 
                        ? "bg-brand-primary text-white shadow-lg shadow-brand-primary/20" 
                        : "text-gray-500 hover:bg-white hover:text-brand-primary"
                    }`}
                >
                    <span className="text-[11px] font-bold uppercase tracking-tight truncate">{company.business_name}</span>
                </button>
                ))}
            </div>
        </div>

        <div>
            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                <MapPin className="w-3 h-3" /> Sucursales
            </h3>
            <div className="space-y-1">
                {branches.filter(b => b.company_id === (selectedEntity.type === 'company' ? selectedEntity.id : branches.find(x => x.id === selectedEntity.id)?.company_id)).map((branch) => (
                <button
                    key={branch.id}
                    onClick={() => handleEntityChange('branch', branch.id)}
                    className={`w-full text-left px-4 py-2.5 rounded-xl transition-all flex items-center justify-between group ${
                    selectedEntity.type === 'branch' && selectedEntity.id === branch.id 
                        ? "bg-brand-primary text-white shadow-lg shadow-brand-primary/20" 
                        : "text-gray-500 hover:bg-white hover:text-brand-primary"
                    }`}
                >
                    <span className="text-[11px] font-bold uppercase tracking-tight truncate">{branch.name}</span>
                </button>
                ))}
            </div>
        </div>
      </div>

      {/* Panel de Configuración */}
      <div className="flex-1 flex flex-col min-w-0 bg-white">
        <div className="p-8 border-b border-gray-50 flex items-center justify-between bg-white/80 backdrop-blur sticky top-0 z-10">
          <div>
            <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight flex items-center gap-3">
               Módulos Habilitados para <span className="text-brand-primary">{entityData?.business_name || entityData?.name}</span>
            </h2>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">
                Controla la liberación incremental de funcionalidades
            </p>
          </div>
          <PrimaryButton 
            onClick={handleSubmit} 
            disabled={processing}
            className="px-8 py-3 bg-brand-primary rounded-xl flex items-center gap-2 shadow-lg shadow-brand-primary/20 uppercase text-[10px] font-black tracking-widest"
          >
            <Save className="w-4 h-4" /> Guardar Configuración
          </PrimaryButton>
        </div>

        <div className="flex-1 overflow-y-auto p-8 space-y-6">
          <div className="grid grid-cols-1 gap-4 max-w-3xl">
            {modules.map((module) => (
              <label 
                key={module.key} 
                className={`flex items-start p-6 rounded-2xl cursor-pointer transition-all border-2 group ${
                  data.enabled_modules.includes(module.key)
                    ? "bg-brand-primary/5 border-brand-primary/20 text-brand-primary"
                    : "bg-white border-gray-50 hover:border-gray-100 text-gray-500"
                }`}
              >
                <Checkbox
                  checked={data.enabled_modules.includes(module.key)}
                  onChange={() => toggleModule(module.key)}
                  className="rounded-lg border-gray-300 text-brand-primary focus:ring-brand-primary mt-1"
                />
                <div className="ml-5 flex-1">
                    <div className="flex items-center justify-between">
                        <span className="text-sm font-black uppercase tracking-tight">{module.label}</span>
                        {data.enabled_modules.includes(module.key) ? (
                            <CheckSquare className="w-5 h-5 text-brand-primary/50" />
                        ) : (
                            <Square className="w-5 h-5 text-gray-100" />
                        )}
                    </div>
                    <p className={`text-[11px] mt-1 font-medium leading-relaxed ${data.enabled_modules.includes(module.key) ? "text-brand-primary/70" : "text-gray-400"}`}>
                        {module.description}
                    </p>
                </div>
              </label>
            ))}
          </div>

          <div className="p-6 bg-amber-50 border border-amber-100 rounded-2xl flex items-start gap-4 max-w-3xl mt-12">
            <div className="p-2 bg-amber-100 text-amber-600 rounded-lg">
                <Info className="w-5 h-5" />
            </div>
            <div>
                <h5 className="text-xs font-black text-amber-900 uppercase tracking-tight mb-1">Impacto de la Configuración</h5>
                <p className="text-[11px] text-amber-800/70 leading-relaxed font-medium">
                    Deshabilitar un módulo lo ocultará del menú lateral para <span className="font-black">TODOS</span> los usuarios de esta entidad, incluso si tienen permisos asignados. 
                    Si configuras una sucursal, prevalecerá sobre la configuración de la empresa.
                </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
