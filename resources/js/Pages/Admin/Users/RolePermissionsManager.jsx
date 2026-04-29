import React, { useState } from "react";
import { useForm } from "@inertiajs/react";
import { Save, ShieldCheck, CheckSquare, Square, Info } from "lucide-react";
import PrimaryButton from "@/Components/PrimaryButton";
import Checkbox from "@/Components/Checkbox";

export default function RolePermissionsManager({ roles, permissions }) {
  // Inicializar el formulario con los permisos actuales de cada rol
  const { data, setData, post, processing } = useForm({
    roles: roles.map(role => ({
      id: role.id,
      name: role.name,
      permissions: role.permissions.map(p => p.name)
    }))
  });

  const [selectedRoleId, setSelectedRoleId] = useState(roles[0]?.id || null);

  const togglePermission = (roleId, permissionName) => {
    const updatedRoles = data.roles.map(role => {
      if (role.id === roleId) {
        const hasPermission = role.permissions.includes(permissionName);
        return {
          ...role,
          permissions: hasPermission
            ? role.permissions.filter(p => p !== permissionName)
            : [...role.permissions, permissionName]
        };
      }
      return role;
    });
    setData("roles", updatedRoles);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    post(route("admin.users-management.roles.update-permissions"), {
      preserveScroll: true,
      onSuccess: () => {
        // Podrías mostrar un toast aquí si no se muestra automáticamente
      }
    });
  };

  const selectedRole = data.roles.find(r => r.id === selectedRoleId);

  // Agrupar permisos por prefijo para mejor visualización (ej: "patients.view" -> "patients")
  const groupedPermissions = permissions.reduce((acc, p) => {
    const group = p.name.split('.')[0] || 'otros';
    if (!acc[group]) acc[group] = [];
    acc[group].push(p);
    return acc;
  }, {});

  return (
    <div className="flex h-[calc(100vh-350px)]">
      {/* Sidebar de Roles */}
      <div className="w-64 border-r border-gray-100 p-6 space-y-2 overflow-y-auto bg-gray-50/30">
        <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Roles del Sistema</h3>
        {data.roles.map((role) => (
          <button
            key={role.id}
            onClick={() => setSelectedRoleId(role.id)}
            className={`w-full text-left px-5 py-3.5 rounded-xl transition-all flex items-center justify-between group ${
              selectedRoleId === role.id 
                ? "bg-brand-primary text-white shadow-lg shadow-brand-primary/20 scale-[1.02]" 
                : "text-gray-500 hover:bg-white hover:text-brand-primary hover:shadow-sm"
            }`}
          >
            <span className={`text-xs font-black uppercase tracking-tight ${selectedRoleId === role.id ? "text-white" : ""}`}>
              {role.name}
            </span>
            <ShieldCheck className={`w-4 h-4 ${selectedRoleId === role.id ? "text-white/50" : "text-gray-300 group-hover:text-brand-primary/50"}`} />
          </button>
        ))}
      </div>

      {/* Panel de Permisos */}
      <div className="flex-1 flex flex-col min-w-0 bg-white">
        <div className="p-8 border-b border-gray-50 flex items-center justify-between bg-white/80 backdrop-blur sticky top-0 z-10">
          <div>
            <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight flex items-center gap-3">
               Permisos para <span className="text-brand-primary">{selectedRole?.name}</span>
            </h2>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">
                Configura las capacidades específicas de este rol
            </p>
          </div>
          <PrimaryButton 
            onClick={handleSubmit} 
            disabled={processing}
            className="px-8 py-3 bg-brand-primary rounded-xl flex items-center gap-2 shadow-lg shadow-brand-primary/20 uppercase text-[10px] font-black tracking-widest"
          >
            <Save className="w-4 h-4" /> Guardar Permisos
          </PrimaryButton>
        </div>

        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {Object.entries(groupedPermissions).map(([group, groupPermissions]) => (
              <div key={group} className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
                    <div className="w-2 h-2 rounded-full bg-brand-primary"></div>
                    <h4 className="text-[10px] font-black text-gray-900 uppercase tracking-widest">{group}</h4>
                </div>
                <div className="space-y-2">
                  {groupPermissions.map((permission) => (
                    <label 
                      key={permission.id} 
                      className={`flex items-center p-3 rounded-xl cursor-pointer transition-all border group ${
                        selectedRole?.permissions.includes(permission.name)
                          ? "bg-brand-primary/5 border-brand-primary/20 text-brand-primary"
                          : "bg-white border-transparent hover:bg-gray-50 text-gray-500"
                      }`}
                    >
                      <Checkbox
                        checked={selectedRole?.permissions.includes(permission.name)}
                        onChange={() => togglePermission(selectedRoleId, permission.name)}
                        className="rounded-lg border-gray-300 text-brand-primary focus:ring-brand-primary"
                      />
                      <span className="ml-3 text-[11px] font-bold uppercase tracking-tight flex-1">
                        {permission.name.replace(`${group}.`, "").replace("_", " ")}
                      </span>
                      {selectedRole?.permissions.includes(permission.name) ? (
                        <CheckSquare className="w-3.5 h-3.5 text-brand-primary/50" />
                      ) : (
                        <Square className="w-3.5 h-3.5 text-gray-200 group-hover:text-gray-300" />
                      )}
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Info Box */}
          <div className="mt-12 p-6 bg-blue-50 border border-blue-100 rounded-2xl flex items-start gap-4">
            <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                <Info className="w-5 h-5" />
            </div>
            <div>
                <h5 className="text-xs font-black text-blue-900 uppercase tracking-tight mb-1">Nota sobre los Permisos</h5>
                <p className="text-[11px] text-blue-800/70 leading-relaxed font-medium">
                    Los cambios realizados aquí afectarán a todos los usuarios asignados a este rol de forma inmediata. 
                    El rol <span className="font-black">superadmin</span> posee todos los permisos por defecto y no puede ser restringido.
                </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
