import React from "react";
import { usePage } from "@inertiajs/react";
import { FileText, Plus, ShieldCheck, Building2, Globe } from "lucide-react";
import PrimaryButton from "@/Components/PrimaryButton";

export default function HeaderDocuments({ setActiveTab, tabs, activeTab }) {
  const { props } = usePage();
  const currentCompany = props?.current_company;
  const environment = props?.dte_environment || 'Certificación';

  return (
    <div className="bg-white border border-gray-200 shadow-sm rounded-2xl overflow-hidden mb-6">
      {/* Top Bar: Company Info & Action */}
      <div className="px-6 py-4 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center justify-center w-10 h-10 bg-brand-secondary/10 text-brand-primary rounded-xl">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-black text-gray-900 tracking-tight leading-none mb-1">
              Documentos Tributarios
            </h1>
            <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5 bg-green-50 px-2 py-0.5 rounded-md border border-green-100">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
                    <span className="text-[9px] font-black text-green-700 uppercase tracking-wider">SII Online</span>
                </div>
                <div className="flex items-center gap-1 text-gray-400">
                    <Globe className="w-3 h-3" />
                    <span className="text-[9px] font-bold uppercase tracking-widest">{environment}</span>
                </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="hidden lg:flex items-center gap-3 border-l border-gray-100 pl-6">
            <Building2 className="w-4 h-4 text-gray-300" />
            <div>
              <p className="enterprise-label !mb-0">{currentCompany?.business_name || 'Empresa'}</p>
              <p className="text-[11px] font-mono font-bold text-gray-500">{currentCompany?.rut}</p>
            </div>
          </div>
          
          <PrimaryButton
            onClick={() => setActiveTab("create")}
            className="!px-6 !py-3 !rounded-xl !text-[10px] shadow-lg shadow-brand-primary/20 active:scale-95"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nueva Emisión
          </PrimaryButton>
        </div>
      </div>

      {/* Tabs Bar */}
      <div className="px-6 bg-gray-50/50 flex items-center justify-between">
        <nav className="flex gap-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`group flex items-center gap-2 py-4 relative transition-all ${
                  active ? "text-brand-primary" : "text-gray-400 hover:text-gray-600"
                }`}
              >
                <Icon className={`w-4 h-4 ${active ? "text-brand-primary" : "text-gray-300 group-hover:text-gray-400"}`} />
                <span className={`text-[11px] font-black uppercase tracking-widest`}>
                  {tab.label}
                </span>
                {active && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-primary rounded-t-full shadow-[0_-2px_8px_rgba(50,146,179,0.4)]"></div>
                )}
              </button>
            );
          })}
        </nav>
        
        <div className="hidden sm:flex items-center gap-2 text-gray-400">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span className="text-[10px] font-bold uppercase tracking-widest">Transacción Segura</span>
        </div>
      </div>
    </div>
  );
}
