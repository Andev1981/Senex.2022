import React, { useState } from "react";
import { Plus, Users, Shield, UserPlus, Search, Lock, Settings, LayoutGrid } from "lucide-react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, usePage } from "@inertiajs/react";
import UserTable from "./UserTable";
import UserModal from "./UserModal";
import RolePermissionsManager from "./RolePermissionsManager";
import ModuleReleaseManager from "./ModuleReleaseManager";
import SideModal from "@/components/SideModal";

export default function UsersIndex({ users, roles, companies, branches, permissions }) {
  const { auth } = usePage().props;
  const isSuperAdmin = auth.roles.includes("superadmin");
  const [activeTab, setActiveTab] = useState("users"); // "users", "roles" o "modules"
  const [openModal, setOpenModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  const handleEditUser = (user) => {
    setSelectedUser(user);
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setTimeout(() => setSelectedUser(null), 300);
  };

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <AuthenticatedLayout>
      <Head title="Gestión de Usuarios y Permisos" />

      <div className="min-h-screen p-6 md:p-10 bg-gray-50/50 space-y-8">
        
        {/* HEADER HERO */}
        <div className="p-8 bg-white border border-gray-100 shadow-sm rounded-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-brand-primary/5 rounded-full -mr-32 -mt-32 blur-3xl opacity-50"></div>
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
            <div className="flex items-center gap-5">
              <div className="flex items-center justify-center w-16 h-16 bg-brand-primary text-white rounded-2xl shadow-xl shadow-brand-primary/20 transform -rotate-2">
                <Shield className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-3xl font-black text-gray-900 uppercase tracking-tight leading-none mb-2">
                    Sistema de Accesos
                </h1>
                <p className="text-[10px] font-black text-brand-gray uppercase tracking-[0.2em]">
                  Control de Seguridad • Usuarios, Roles y Permisos
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 p-1.5 bg-gray-100 rounded-2xl">
                <button 
                  onClick={() => setActiveTab("users")}
                  className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'users' ? 'bg-white text-brand-primary shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                >
                  <Users className="w-3.5 h-3.5" /> Usuarios
                </button>
                <button 
                   onClick={() => setActiveTab("roles")}
                   className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'roles' ? 'bg-white text-brand-primary shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                >
                  <Lock className="w-3.5 h-3.5" /> Roles y Permisos
                </button>
                {isSuperAdmin && (
                    <button 
                    onClick={() => setActiveTab("modules")}
                    className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'modules' ? 'bg-white text-brand-primary shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                    >
                    <LayoutGrid className="w-3.5 h-3.5" /> Liberación Módulos
                    </button>
                )}
            </div>
          </div>
        </div>

        {/* BARRA DE ACCIONES (Solo para Usuarios) */}
        {activeTab === "users" && (
            <div className="flex items-center justify-between bg-white p-4 border border-gray-100 rounded-2xl shadow-sm">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input 
                        type="text" 
                        placeholder="Buscar por nombre o email..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-11 pr-6 py-3 bg-gray-50 border-none rounded-xl text-xs focus:ring-2 focus:ring-brand-primary/20 transition-all font-bold"
                    />
                </div>
                <button
                    onClick={() => {
                        setSelectedUser(null);
                        setOpenModal(true);
                    }}
                    className="flex items-center gap-3 px-8 py-3.5 font-black uppercase tracking-widest text-[10px] text-white transition-all bg-brand-primary rounded-xl shadow-lg shadow-brand-primary/20 hover:brightness-110 active:scale-95 ml-4"
                >
                    <Plus className="w-4 h-4" /> Registrar Usuario
                </button>
            </div>
        )}

        {/* CONTENIDO PRINCIPAL */}
        <div className="bg-white border border-gray-100 shadow-sm rounded-2xl overflow-hidden min-h-[400px]">
          {activeTab === "users" && (
            <UserTable 
              users={filteredUsers} 
              onEdit={handleEditUser} 
            />
          )}
          {activeTab === "roles" && (
            <RolePermissionsManager 
              roles={roles} 
              permissions={permissions} 
            />
          )}
          {activeTab === "modules" && (
            <ModuleReleaseManager 
              companies={companies} 
              branches={branches} 
            />
          )}
        </div>
      </div>

      <SideModal
        open={openModal}
        onClose={handleCloseModal}
        width="2xl"
      >
        <UserModal
          user={selectedUser}
          roles={roles}
          companies={companies}
          branches={branches}
          permissions={permissions}
          onClose={handleCloseModal}
        />
      </SideModal>
    </AuthenticatedLayout>
  );
}
