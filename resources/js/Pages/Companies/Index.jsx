import React from "react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, Link } from "@inertiajs/react";
import {
  Building2,
  Plus,
  Settings,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";

export default function Index({ companies }) {
  return (
    <AuthenticatedLayout>
      <Head title="Empresas" />

      <div className="py-12">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">
              Mis Empresas / Sucursales
            </h2>
            <Link
              href={route("companies.create")}
              className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition"
            >
              <Plus className="w-5 h-5" /> Nueva Empresa
            </Link>
          </div>

          {/* Grid de Empresas */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {companies.map((company) => (
              <div
                key={company.id}
                className="bg-white overflow-hidden shadow-sm sm:rounded-xl border border-gray-100 hover:shadow-md transition"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                      {/* Logo o Placeholder */}
                      <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden border">
                        {company.logo_url ? (
                          <img
                            src={company.logo_url}
                            alt="Logo"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Building2 className="w-6 h-6 text-gray-400" />
                        )}
                      </div>
                      <div>
                        <h3 className="font-bold text-lg text-gray-900">
                          {company.business_name}
                        </h3>
                        <p className="text-sm text-gray-500 font-mono">
                          {company.rut}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Estado DTE */}
                  <div className="mt-4 flex items-center gap-2 text-sm">
                    {company.is_configured ? (
                      <span className="flex items-center text-green-600 bg-green-50 px-2 py-1 rounded-full text-xs font-bold">
                        <CheckCircle className="w-3 h-3 mr-1" /> DTE Activo
                      </span>
                    ) : (
                      <span className="flex items-center text-amber-600 bg-amber-50 px-2 py-1 rounded-full text-xs font-bold">
                        <AlertTriangle className="w-3 h-3 mr-1" /> Sin
                        Configurar
                      </span>
                    )}
                  </div>

                  {/* Acciones */}
                  <div className="mt-6 pt-4 border-t border-gray-100 flex justify-end">
                    <Link
                      href={route("companies.edit", company.id)}
                      className="flex items-center gap-2 text-sm font-medium text-indigo-600 hover:text-indigo-800"
                    >
                      <Settings className="w-4 h-4" /> Configurar Facturación
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {companies.length === 0 && (
            <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-300">
              <Building2 className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No tienes empresas registradas.</p>
            </div>
          )}
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
