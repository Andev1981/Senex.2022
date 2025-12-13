import React from "react";
import { usePage } from "@inertiajs/react";
import { FileText, Plus } from "lucide-react";

export default function HeaderDocuments({ setActiveTab, tabs, activeTab }) {
  const { props } = usePage();
  const currentCompany = props?.current_company;
  return (
    <div className="mb-4 text-white shadow-sm bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl">
      <div className="px-4 py-6 mx-auto">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">
                Documentos Tributarios Electrónicos
              </h1>
              <p className="text-blue-100">
                Sistema de Facturación Electrónica - Chile
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="mr-4 text-right">
              <p className="text-sm text-blue-100">RUT Empresa</p>
              <p className="font-bold">{currentCompany?.rut}</p>
            </div>
            <button
              onClick={() => setActiveTab("create")}
              className="flex items-center gap-2 px-6 py-3 font-bold text-blue-600 transition-colors bg-white rounded-lg hover:bg-blue-50"
            >
              <Plus className="w-5 h-5" />
              Nuevo Documento
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="px-4 mx-auto">
        <div className="flex gap-2 pb-0 -mb-px overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 font-medium whitespace-nowrap transition-all border-b-2 rounded-t-xl ${
                  activeTab === tab.id
                    ? "text-blue-600 border-white bg-white"
                    : "text-blue-100 border-transparent hover:text-white hover:bg-white/5"
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
