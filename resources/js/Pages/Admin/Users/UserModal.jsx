import React, { useEffect } from "react";
import { useForm } from "@inertiajs/react";
import InputLabel from "@/Components/InputLabel";
import TextInput from "@/Components/TextInput";
import InputError from "@/Components/InputError";
import PrimaryButton from "@/Components/PrimaryButton";
import SecondaryButton from "@/Components/SecondaryButton";
import Checkbox from "@/Components/Checkbox";
import { Shield, Building, MapPin, Key, User as UserIcon } from "lucide-react";

export default function UserModal({ user, roles, companies, branches, permissions = [], onClose }) {
  const { data, setData, post, put, processing, errors, reset } = useForm({
    name: user?.name || "",
    email: user?.email || "",
    password: "",
    company_id: user?.company_id || "",
    roles: user?.roles?.map(r => r.name) || [],
    permissions: user?.permissions?.map(p => p.name) || [], // Permisos directos
    branches: user?.branches?.map(b => b.id) || [],
  });

  useEffect(() => {
    if (user) {
      setData({
        name: user.name,
        email: user.email,
        password: "",
        company_id: user.company_id,
        roles: user.roles?.map(r => r.name) || [],
        permissions: user.permissions?.map(p => p.name) || [],
        branches: user.branches?.map(b => b.id) || [],
      });
    } else {
        reset();
    }
  }, [user]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (user) {
      put(route("admin.users-management.update", user.id), {
        onSuccess: () => onClose(),
      });
    } else {
      post(route("admin.users-management.store"), {
        onSuccess: () => onClose(),
      });
    }
  };

  const toggleRole = (roleName) => {
    const newRoles = data.roles.includes(roleName)
      ? data.roles.filter(r => r !== roleName)
      : [...data.roles, roleName];
    setData("roles", newRoles);
  };

  const togglePermission = (permName) => {
    const newPerms = data.permissions.includes(permName)
      ? data.permissions.filter(p => p !== permName)
      : [...data.permissions, permName];
    setData("permissions", newPerms);
  };

  const toggleBranch = (branchId) => {
    const newBranches = data.branches.includes(branchId)
      ? data.branches.filter(id => id !== branchId)
      : [...data.branches, branchId];
    setData("branches", newBranches);
  };

  const filteredBranches = branches.filter(b => b.company_id == data.company_id);

  return (
    <form onSubmit={handleSubmit} className="p-8 space-y-8 bg-white">
      <div className="flex items-center gap-4 mb-8">
        <div className="p-3 bg-brand-primary/10 text-brand-primary rounded-xl">
          <UserIcon className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight">
            {user ? "Editar Usuario" : "Nuevo Registro de Usuario"}
          </h2>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
            {user ? `Modificando acceso de ${user.name}` : "Crea una nueva cuenta administrativa"}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Información Básica */}
        <div className="space-y-4">
          <div>
            <InputLabel htmlFor="name" value="Nombre Completo" className="text-[10px] uppercase font-black tracking-widest text-gray-400 mb-2" />
            <TextInput
              id="name"
              value={data.name}
              onChange={(e) => setData("name", e.target.value)}
              className="w-full bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-brand-primary/20 transition-all font-bold text-sm"
              required
            />
            <InputError message={errors.name} className="mt-2" />
          </div>

          <div>
            <InputLabel htmlFor="email" value="Correo Electrónico" className="text-[10px] uppercase font-black tracking-widest text-gray-400 mb-2" />
            <TextInput
              id="email"
              type="email"
              value={data.email}
              onChange={(e) => setData("email", e.target.value)}
              className="w-full bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-brand-primary/20 transition-all font-bold text-sm"
              required
            />
            <InputError message={errors.email} className="mt-2" />
          </div>

          <div>
            <InputLabel htmlFor="password" value={user ? "Nueva Contraseña (Opcional)" : "Contraseña"} className="text-[10px] uppercase font-black tracking-widest text-gray-400 mb-2" />
            <div className="relative">
                <Key className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <TextInput
                id="password"
                type="password"
                value={data.password}
                onChange={(e) => setData("password", e.target.value)}
                className="w-full pl-11 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-brand-primary/20 transition-all font-bold text-sm"
                required={!user}
                />
            </div>
            <InputError message={errors.password} className="mt-2" />
          </div>

          <div>
            <InputLabel htmlFor="company_id" value="Empresa Principal" className="text-[10px] uppercase font-black tracking-widest text-gray-400 mb-2" />
            <select
              id="company_id"
              value={data.company_id}
              onChange={(e) => setData("company_id", e.target.value)}
              className="w-full bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-brand-primary/20 transition-all font-bold text-sm"
              required
            >
              <option value="">Seleccionar Empresa</option>
              {companies.map((company) => (
                <option key={company.id} value={company.id}>
                  {company.business_name}
                </option>
              ))}
            </select>
            <InputError message={errors.company_id} className="mt-2" />
          </div>
        </div>

        {/* Roles y Sucursales */}
        <div className="space-y-6">
          {/* Roles */}
          <div>
            <h3 className="flex items-center gap-2 text-[10px] uppercase font-black tracking-widest text-gray-400 mb-4">
              <Shield className="w-3.5 h-3.5" /> Roles Asignados
            </h3>
            <div className="grid grid-cols-1 gap-2">
              {roles.map((role) => (
                <label key={role.id} className="flex items-center p-3 bg-gray-50 rounded-xl cursor-pointer hover:bg-brand-primary/5 transition-colors group">
                  <Checkbox
                    checked={data.roles.includes(role.name)}
                    onChange={() => toggleRole(role.name)}
                    className="rounded-lg border-gray-300 text-brand-primary focus:ring-brand-primary"
                  />
                  <span className="ml-3 text-xs font-bold text-gray-700 uppercase group-hover:text-brand-primary transition-colors">
                    {role.name}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Sucursales */}
          <div>
            <h3 className="flex items-center gap-2 text-[10px] uppercase font-black tracking-widest text-gray-400 mb-4">
              <MapPin className="w-3.5 h-3.5" /> Sucursales con Acceso
            </h3>
            <div className="max-h-48 overflow-y-auto pr-2 space-y-2 scrollbar-thin scrollbar-thumb-gray-200">
              {filteredBranches.map((branch) => (
                <label key={branch.id} className="flex items-center p-3 border border-gray-100 rounded-xl cursor-pointer hover:border-brand-primary/30 hover:bg-brand-primary/5 transition-all group">
                   <Checkbox
                    checked={data.branches.includes(branch.id)}
                    onChange={() => toggleBranch(branch.id)}
                    className="rounded-lg border-gray-300 text-brand-primary focus:ring-brand-primary"
                  />
                  <span className="ml-3 text-[11px] font-bold text-gray-600 uppercase group-hover:text-brand-primary transition-colors">
                    {branch.name}
                  </span>
                </label>
              ))}
              {data.company_id && filteredBranches.length === 0 && (
                <p className="text-[10px] text-orange-500 font-bold uppercase italic p-4 bg-orange-50 rounded-xl">
                  No hay sucursales registradas para esta empresa.
                </p>
              )}
              {!data.company_id && (
                <p className="text-[10px] text-gray-300 font-bold uppercase italic p-4 bg-gray-50 rounded-xl">
                  Selecciona una empresa para ver sus sucursales.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Permisos Especiales (Directos) */}
      <div className="pt-6 border-t border-gray-100">
        <h3 className="flex items-center gap-2 text-[10px] uppercase font-black tracking-widest text-gray-400 mb-4">
          <Key className="w-3.5 h-3.5" /> Permisos Especiales (Asignación Directa)
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {permissions.map((perm) => (
            <label key={perm.id} className="flex items-center p-3 bg-white border border-slate-100 rounded-xl cursor-pointer hover:bg-brand-primary/5 transition-all group">
              <Checkbox
                checked={data.permissions.includes(perm.name)}
                onChange={() => togglePermission(perm.name)}
                className="rounded-lg border-gray-300 text-brand-primary focus:ring-brand-primary"
              />
              <div className="ml-3 flex flex-col">
                <span className="text-[10px] font-black text-gray-700 uppercase leading-none group-hover:text-brand-primary transition-colors">
                  {perm.name.replace('.', ' ')}
                </span>
                <span className="text-[8px] font-bold text-gray-400 mt-1 uppercase tracking-tighter">Acceso Directo</span>
              </div>
            </label>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-end gap-4 pt-6 border-t border-gray-50">
        <SecondaryButton onClick={onClose} type="button" className="px-8 py-3 rounded-xl uppercase text-[10px] font-black tracking-widest">
          Cancelar
        </SecondaryButton>
        <PrimaryButton disabled={processing} className="px-8 py-3 bg-brand-primary rounded-xl uppercase text-[10px] font-black tracking-widest shadow-lg shadow-brand-primary/20">
          {user ? "Actualizar Cambios" : "Guardar Usuario"}
        </PrimaryButton>
      </div>
    </form>
  );
}
