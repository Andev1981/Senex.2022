import React from "react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, usePage } from "@inertiajs/react";
import { FileText, ShieldCheck, Building } from "lucide-react";

// IMPORTA TUS COMPONENTES (Los que te di en el prompt anterior)
import DteConfigurationForm from "./Components/DteConfigurationForm"; // El form de RUT, PFX, Pass
import CafUploader from "./Components/CafUploader"; // El uploader de XML

export default function Edit({ company, dteConfig, folios, logo }) {
  return (
    <AuthenticatedLayout>
      <Head title={`Configurar ${company.business_name}`} />

      <div className="py-12">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">
          {/* 1. CONFIGURACIÓN DTE (Certificado y Ambiente) */}
          <div className="p-4 sm:p-8 bg-white shadow sm:rounded-lg">
            <section>
              <header className="flex items-center gap-2 mb-4">
                <ShieldCheck className="w-6 h-6 text-indigo-600" />
                <h2 className="text-lg font-medium text-gray-900">
                  Certificado Digital & Ambiente
                </h2>
              </header>
              <p className="mt-1 text-sm text-gray-600 mb-6">
                Configura aquí el certificado .pfx para firmar documentos y el
                ambiente (Certificación/Producción).
              </p>

              {/* Componente del Formulario */}
              <DteConfigurationForm
                company={company}
                dteConfig={dteConfig}
                logo={logo}
              />
            </section>
          </div>

          {/* 2. GESTIÓN DE FOLIOS (CAF) */}
          <div className="p-4 sm:p-8 bg-white shadow sm:rounded-lg">
            <section>
              <header className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <FileText className="w-6 h-6 text-green-600" />
                  <h2 className="text-lg font-medium text-gray-900">
                    Folios Autorizados (CAF)
                  </h2>
                </div>
                {/* Componente Uploader */}
                <CafUploader company={company} />
              </header>

              {/* TABLA DE FOLIOS CARGADOS */}
              <div className="mt-6 overflow-x-auto border rounded-lg">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Tipo DTE
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Rango
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Último Usado
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Vencimiento
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                        Estado
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {folios.map((folio) => (
                      <tr key={folio.id}>
                        <td className="px-4 py-3 text-sm font-bold text-gray-700">
                          {folio.tipo_dte === 39
                            ? "Boleta Electrónica (39)"
                            : folio.tipo_dte === 33
                            ? "Factura Electrónica (33)"
                            : folio.tipo_dte}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {folio.folio_desde} - {folio.folio_hasta}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {folio.ultimo_folio_usado}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {folio.fecha_vencimiento || "Indefinido"}
                        </td>
                        <td className="px-4 py-3 text-center">
                          {folio.ultimo_folio_usado >= folio.folio_hasta ? (
                            <span className="px-2 py-1 text-xs text-red-700 bg-red-100 rounded-full">
                              Agotado
                            </span>
                          ) : (
                            <span className="px-2 py-1 text-xs text-green-700 bg-green-100 rounded-full">
                              Activo
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                    {folios.length === 0 && (
                      <tr>
                        <td
                          colSpan="5"
                          className="px-4 py-6 text-center text-gray-400 text-sm"
                        >
                          No has cargado ningún archivo CAF todavía.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
