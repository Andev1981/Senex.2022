import React, { useState } from 'react';
import { router, usePage } from "@inertiajs/react";
import { Building2, MapPin, ChevronRight, Search, CheckCircle2, Globe } from "lucide-react";
import Modal from "@/components/Modal";

export default function ContextSelectorModal({ isOpen, onClose }) {
  const { props } = usePage();
  
  // Datos inyectados por el sistema
  const allCompanies = props.all_companies || [];
  const initialAvailableBranches = props.available_branches || [];
  const currentCompany = props.current_company;
  const currentBranch = props.current_branch;
  const userIsSuperAdmin = props.auth?.roles?.includes("superadmin");

  // Estados locales para la navegación interna del modal
  const [searchTerm, setSearchTerm] = useState("");
  const [viewingCompany, setViewingCompany] = useState(currentCompany);
  const [branchesOfCompany, setBranchesOfCompany] = useState(initialAvailableBranches);
  const [isLoadingBranches, setIsLoadingBranches] = useState(false);

  // Al hacer clic en una empresa (Solo Superadmin)
  const handleSelectCompany = async (company) => {
    if (company.id === viewingCompany?.id) return;
    
    setViewingCompany(company);
    setIsLoadingBranches(true);
    
    try {
        // En un entorno real podrías llamar a una API aquí. 
        // Si ya tienes los datos en las props, solo filtramos o recargamos.
        // Como el Superadmin necesita ver sucursales de OTRAS empresas, 
        // usaremos router.reload o una petición manual.
        router.post(route("admin.switch-company"), { 
            company_id: company.id,
            stay_in_modal: true // Flag opcional para tu controlador si quieres
        }, {
            preserveScroll: true,
            preserveState: true,
            onSuccess: (page) => {
                setBranchesOfCompany(page.props.available_branches || []);
                setIsLoadingBranches(false);
            }
        });
    } catch (e) {
        setIsLoadingBranches(false);
    }
  };

  const handleSwitchBranch = (branchId) => {
    router.post(route("admin.switch-branch"), { branch_id: branchId }, {
      onSuccess: () => onClose(),
      preserveScroll: true
    });
  };

  const filteredCompanies = allCompanies.filter(c => 
    c.business_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.rut.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Modal open={isOpen} onClose={onClose} title="Selector de Contexto Maestro" maxWidth="5xl">
      <div className="flex flex-col md:flex-row h-[650px] overflow-hidden">
        
        {/* LADO IZQUIERDO: EMPRESAS (Estrictamente Superadmin) */}
        {userIsSuperAdmin ? (
          <div className="w-full md:w-5/12 border-r border-gray-100 flex flex-col bg-gray-50/30">
            <div className="p-8 border-b border-gray-100 bg-white">
              <label className="enterprise-label mb-4 block">1. Directorio de Empresas</label>
              <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-gray group-focus-within:text-brand-primary transition-colors" />
                <input 
                  type="text"
                  placeholder="Buscar por RUT o Nombre..."
                  className="w-full pl-12 pr-4 py-4 rounded-2xl border-gray-100 bg-gray-50 focus:bg-white focus:ring-brand-primary transition-all text-sm font-bold"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 space-y-3 custom-scrollbar">
              {filteredCompanies.map((company) => {
                const isViewing = company.id === viewingCompany?.id;
                const isCurrentlyActive = company.id === currentCompany?.id;

                return (
                  <button
                    key={company.id}
                    onClick={() => handleSelectCompany(company)}
                    className={`w-full flex items-center justify-between p-5 rounded-3xl transition-all border-2 group ${
                      isViewing 
                      ? "border-brand-primary bg-brand-primary/5 text-brand-primary shadow-md" 
                      : "border-transparent hover:border-gray-200 hover:bg-white text-gray-600"
                    }`}
                  >
                    <div className="flex items-center gap-4 text-left">
                      <div className={`p-3 rounded-2xl transition-all duration-500 ${isViewing ? 'bg-brand-primary text-white scale-110 shadow-lg' : 'bg-white border border-gray-100 group-hover:bg-gray-50'}`}>
                        <Building2 className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-black uppercase text-xs tracking-tight truncate">{company.business_name}</p>
                        <div className="flex items-center gap-2 mt-1">
                            <p className="text-[9px] font-bold opacity-60 uppercase tracking-widest">{company.rut}</p>
                            {isCurrentlyActive && (
                                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                            )}
                        </div>
                      </div>
                    </div>
                    {isViewing && <ChevronRight className="w-4 h-4" />}
                  </button>
                );
              })}
            </div>
          </div>
        ) : null}

        {/* LADO DERECHO: SUCURSALES (Abierto para todos los usuarios con su empresa actual) */}
        <div className={`flex flex-col bg-white ${userIsSuperAdmin ? 'w-full md:w-7/12' : 'w-full'}`}>
          <div className="p-8 border-b border-gray-100 relative">
            {isLoadingBranches && (
                <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] z-10 flex items-center justify-center">
                    <div className="w-8 h-8 border-4 border-brand-secondary/20 border-t-brand-primary rounded-full animate-spin"></div>
                </div>
            )}
            <div className="flex items-center justify-between mb-4">
                <label className="enterprise-label !mb-0">2. Selección de Sucursal</label>
                <div className="px-4 py-1.5 bg-brand-primary rounded-xl shadow-lg shadow-brand-primary/20">
                    <span className="text-[10px] font-black text-white uppercase tracking-[0.2em]">
                        {viewingCompany?.business_name || currentCompany?.business_name}
                    </span>
                </div>
            </div>
            <p className="text-sm text-gray-500 font-medium">Configure su sede de trabajo para las operaciones actuales.</p>
          </div>

          <div className="flex-1 overflow-y-auto p-8 space-y-4 custom-scrollbar relative">
            {isLoadingBranches && (
                <div className="absolute inset-0 bg-white/20 z-10"></div>
            )}
            
            {branchesOfCompany.map((branch) => {
              const isActive = branch.id === currentBranch?.id && viewingCompany?.id === currentCompany?.id;
              return (
                <button
                  key={branch.id}
                  onClick={() => handleSwitchBranch(branch.id)}
                  className={`w-full flex items-center justify-between p-6 rounded-[2rem] transition-all border-2 group ${
                    isActive 
                    ? "border-green-500 bg-green-50 text-green-700 shadow-xl scale-[1.02]" 
                    : "border-gray-50 hover:border-brand-secondary/30 hover:bg-brand-secondary/5 text-gray-600 hover:scale-[1.01]"
                  }`}
                >
                  <div className="flex items-center gap-5 text-left">
                    <div className={`p-4 rounded-2xl transition-all duration-500 ${isActive ? 'bg-green-500 text-white rotate-6 shadow-lg shadow-green-200' : 'bg-gray-50 group-hover:bg-white'}`}>
                      <MapPin className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="font-black uppercase text-base tracking-tight">{branch.name}</p>
                      <div className="flex items-center gap-3 mt-1.5">
                        <div className="flex items-center gap-1.5 text-[10px] font-bold opacity-60 uppercase tracking-widest">
                            <Globe className="w-3 h-3" />
                            {branch.codigo_sucursal_sii || 'Sin Código SII'}
                        </div>
                        <div className="w-1.5 h-1.5 rounded-full bg-gray-200"></div>
                        <span className="text-[10px] font-black text-brand-primary uppercase tracking-widest">
                            {isActive ? 'Sesión Actual' : 'Disponible'}
                        </span>
                      </div>
                    </div>
                  </div>
                  {isActive ? (
                    <div className="bg-green-500 p-1.5 rounded-full text-white shadow-lg">
                        <CheckCircle2 className="w-5 h-5" />
                    </div>
                  ) : (
                    <ChevronRight className="w-5 h-5 opacity-20 group-hover:opacity-100 transition-all group-hover:translate-x-2 text-brand-primary" />
                  )}
                </button>
              );
            })}

            {branchesOfCompany.length === 0 && (
                <div className="text-center py-32 opacity-30">
                    <div className="w-20 h-20 bg-gray-100 rounded-[2rem] flex items-center justify-center mx-auto mb-6">
                        <Globe className="w-10 h-10 text-brand-gray" />
                    </div>
                    <p className="enterprise-label">No hay sucursales detectadas</p>
                </div>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
}
