import React from "react";
import { Edit2, Trash2, Mail, Building2, MapPin, ShieldCheck, Key } from "lucide-react";
import { router, usePage } from "@inertiajs/react";
import Swal from "sweetalert2";

export default function UserTable({ users, onEdit }) {
  const { auth } = usePage().props;

  const handleDelete = (user) => {
    if (user.id === auth.user.id) {
      Swal.fire("Error", "No puedes eliminar tu propia cuenta.", "error");
      return;
    }

    Swal.fire({
      title: "¿Estás seguro?",
      text: `Vas a eliminar al usuario ${user.name}. Esta acción no se puede deshacer.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    }).then((result) => {
      if (result.isConfirmed) {
        router.delete(route("admin.users-management.destroy", user.id));
      }
    });
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-gray-50/50 border-b border-gray-100">
            <th className="px-6 py-5 text-[10px] font-black text-brand-gray uppercase tracking-widest">Usuario</th>
            <th className="px-6 py-5 text-[10px] font-black text-brand-gray uppercase tracking-widest">Empresa / Sucursales</th>
            <th className="px-6 py-5 text-[10px] font-black text-brand-gray uppercase tracking-widest">Roles</th>
            <th className="px-6 py-5 text-[10px] font-black text-brand-gray uppercase tracking-widest text-center">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {users.length > 0 ? (
            users.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50/30 transition-colors group">
                <td className="px-6 py-5">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-brand-primary/10 text-brand-primary flex items-center justify-center font-bold">
                      {user.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-900 leading-none mb-1">{user.name}</p>
                      <div className="flex items-center gap-1.5 text-xs text-gray-400">
                        <Mail className="w-3 h-3" /> {user.email}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-5">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-gray-600">
                      <Building2 className="w-3.5 h-3.5 text-brand-primary" />
                      {user.company?.business_name || "Sin Empresa"}
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {user.branches?.map(branch => (
                        <span key={branch.id} className="px-2 py-0.5 bg-gray-100 text-gray-500 rounded text-[9px] font-bold uppercase tracking-wider">
                          {branch.name}
                        </span>
                      ))}
                      {user.branches?.length === 0 && <span className="text-[9px] text-gray-300 italic uppercase">Sin Sucursales</span>}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-5">
                  <div className="flex flex-wrap gap-1.5">
                    {user.roles?.map(role => (
                      <div key={role.id} className="flex items-center gap-1 px-3 py-1 bg-brand-primary/10 text-brand-primary rounded-lg border border-brand-primary/20">
                        <ShieldCheck className="w-3 h-3" />
                        <span className="text-[10px] font-black uppercase tracking-tight">{role.name}</span>
                      </div>
                    ))}
                  </div>
                </td>
                <td className="px-6 py-5">
                  <div className="flex items-center justify-center gap-2">
                    <button 
                      onClick={() => onEdit(user)}
                      className="p-2.5 text-gray-400 hover:text-brand-primary hover:bg-brand-primary/5 rounded-xl transition-all"
                      title="Editar Usuario"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleDelete(user)}
                      className="p-2.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                      title="Eliminar Usuario"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="4" className="px-6 py-20 text-center">
                <div className="flex flex-col items-center justify-center opacity-30">
                  <Users className="w-12 h-12 mb-4" />
                  <p className="text-sm font-black uppercase tracking-widest">No se encontraron usuarios</p>
                </div>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
