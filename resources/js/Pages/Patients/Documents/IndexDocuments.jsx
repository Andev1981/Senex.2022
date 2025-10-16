import { FileText, Plus } from "lucide-react";
import React from "react";

function IndexDocuments({ patient }) {
  return (
    <div className="p-6 bg-white shadow-lg rounded-xl">
      <div className="flex items-center justify-between mb-6">
        <h2 className="flex items-center gap-2 text-2xl font-bold text-gray-900">
          <FileText className="w-6 h-6 text-teal-600" /> Documentos Clínicos
        </h2>
        <button
          onClick={() => setOpenDocumentModal(true)}
          className="flex items-center gap-2 px-4 py-2 text-white bg-teal-600 rounded-lg hover:bg-teal-700"
        >
          <Plus className="w-4 h-4" /> Subir Documento
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {(patient.documents || []).map((doc) => (
          <div
            key={doc.id}
            className="p-4 transition-all border-2 border-gray-200 rounded-xl hover:border-teal-300 hover:shadow-md"
          >
            <div className="flex items-start gap-3">
              <div className="flex items-center justify-center flex-shrink-0 w-12 h-12 bg-red-100 rounded-lg">
                <FileText className="w-6 h-6 text-red-600" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="mb-1 font-semibold text-gray-900 truncate">
                  {doc.name}
                </h3>
                <div className="flex items-center gap-2 mb-2 text-xs text-gray-500">
                  <span className="px-2 py-1 bg-gray-100 rounded">
                    {doc.category}
                  </span>
                  <span>{doc.size}</span>
                </div>
                <p className="text-xs text-gray-600">
                  {new Date(doc.date).toLocaleDateString("es-CL")}
                </p>
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <a
                href={doc.url || "#"}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center flex-1 gap-1 py-2 text-sm font-medium text-teal-600 rounded-lg bg-teal-50 hover:bg-teal-100"
              >
                Descargar
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default IndexDocuments;
