import React, { useState } from "react";
import { useForm } from "@inertiajs/react";
import { User, Users, X, CheckCircle, Search } from "lucide-react";
import axios from "axios"; // 💡 Importamos Axios

export default function AgreementFamilyAssignModal({ plan, isOpen, onClose }) {
  // Estado para el formulario de Inertia
  const { data, setData, post, processing, errors, reset } = useForm({
    holder_id: null,
    beneficiary_ids: [],
    holder_info: null, // Objeto para mostrar la info del titular
    beneficiaries_info: [], // Array de objetos para mostrar beneficiarios
  });

  // Estado para manejar la búsqueda de pacientes (simulado)
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);

  // Función de búsqueda de pacientes (¡AJUSTADA A AXIOS!)
  const handleSearch = async (query) => {
    if (query.length < 3) return setSearchResults([]);

    const url = route("api.patients.search", { q: query });

    try {
      // 💡 Usamos axios.get
      const response = await axios.get(url);

      // Axios devuelve los datos parseados directamente en response.data
      const patientData = response.data;

      // Filtramos resultados para excluir a los ya seleccionados (titular y beneficiarios)
      // Es importante convertir los IDs a string si vienen como número y viceversa para la comparación
      const selectedIds = [data.holder_id, ...data.beneficiary_ids]
        .filter(Boolean)
        .map((id) => id.toString());

      const filtered = patientData.filter(
        (p) => !selectedIds.includes(p.id.toString())
      );

      setSearchResults(filtered);
    } catch (error) {
      // Axios maneja 404/500 aquí
      console.error(
        "Error al buscar pacientes:",
        error.response ? error.response.data : error.message
      );
      // Puedes mostrar una alerta de error al usuario aquí si lo deseas
      setSearchResults([]);
    }
  };

  // --- Lógica de Asignación ---

  const handleSelectPatient = (patient, role) => {
    setSearchTerm("");
    setSearchResults([]);

    if (role === "holder") {
      setData({
        ...data,
        holder_id: patient.id,
        holder_info: patient,
      });
    } else if (
      role === "beneficiary" &&
      !data.beneficiary_ids.includes(patient.id)
    ) {
      setData({
        ...data,
        beneficiary_ids: [...data.beneficiary_ids, patient.id],
        beneficiaries_info: [...data.beneficiaries_info, patient],
      });
    }
  };

  const handleRemoveBeneficiary = (patientId) => {
    setData({
      ...data,
      beneficiary_ids: data.beneficiary_ids.filter((id) => id !== patientId),
      beneficiaries_info: data.beneficiaries_info.filter(
        (p) => p.id !== patientId
      ),
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!data.holder_id) {
      alert("Debe seleccionar un Titular para el plan familiar.");
      return;
    }

    // Envía el POST al endpoint de asignación que creamos antes
    // Asumiendo que la ruta se llama 'plans.assign.family'
    post(route("plans.assign.family", plan.id), {
      onSuccess: () => {
        alert(`Plan Familiar ${plan.name} asignado con éxito.`);
        onClose();
        reset();
      },
      preserveScroll: true,
    });
  };

  // Solo renderizar si el modal está abierto
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-75 overflow-y-auto h-full w-full z-50">
      <div className="relative top-10 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-2/3 shadow-lg rounded-md bg-white">
        {/* Cabecera del Modal */}
        <div className="flex justify-between items-center pb-3 border-b">
          <h3 className="text-2xl font-bold text-indigo-700 flex items-center">
            <Users className="w-6 h-6 mr-2" /> Asignar Plan Familiar:{" "}
            {plan.name}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Cuerpo del Formulario */}
        <form onSubmit={handleSubmit} className="mt-4 space-y-6">
          {/* Sección 1: Búsqueda y Selección de Pacientes */}
          <div className="p-4 border rounded-lg bg-gray-50">
            <label className="block mb-2">
              <span className="text-sm font-medium text-gray-700 flex items-center">
                <Search className="w-4 h-4 mr-1" /> Buscar Paciente (RUN o
                Nombre)
              </span>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  handleSearch(e.target.value);
                }}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                placeholder="Escribe al menos 3 caracteres..."
              />
            </label>

            {/* Resultados de Búsqueda */}
            {searchResults.length > 0 && (
              <div className="mt-3 max-h-40 overflow-y-auto border border-indigo-200 rounded-md bg-white">
                {searchResults.map((patient) => (
                  <div
                    key={patient.id}
                    className="p-2 border-b last:border-b-0 flex justify-between items-center hover:bg-indigo-50"
                  >
                    <span>
                      {patient.name} ({patient.run})
                    </span>
                    <div className="space-x-2">
                      <button
                        type="button"
                        onClick={() => handleSelectPatient(patient, "holder")}
                        className="px-3 py-1 text-xs bg-indigo-500 text-white rounded hover:bg-indigo-600"
                      >
                        Asignar Titular
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          handleSelectPatient(patient, "beneficiary")
                        }
                        className="px-3 py-1 text-xs bg-green-500 text-white rounded hover:bg-green-600"
                      >
                        Asignar Beneficiario
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Sección 2: Miembros Seleccionados */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* A. Titular (Holder) */}
            <div>
              <h4 className="font-semibold text-lg border-b pb-1 text-indigo-600 flex items-center">
                <User className="w-5 h-5 mr-1" /> Titular del Contrato
                (Requerido)
              </h4>
              <div
                className={`mt-2 p-3 rounded-lg border-2 ${
                  data.holder_info
                    ? "border-green-400 bg-green-50"
                    : "border-red-400 bg-red-50"
                }`}
              >
                {data.holder_info ? (
                  <span className="font-bold flex items-center">
                    <CheckCircle className="w-5 h-5 mr-2 text-green-600" />{" "}
                    {data.holder_info.name} ({data.holder_info.run})
                  </span>
                ) : (
                  <span className="text-red-700">Aún no seleccionado.</span>
                )}
              </div>
            </div>

            {/* B. Beneficiarios */}
            <div>
              <h4 className="font-semibold text-lg border-b pb-1 text-green-600 flex items-center">
                <Users className="w-5 h-5 mr-1" /> Beneficiarios (
                {data.beneficiaries_info.length})
              </h4>
              <div className="mt-2 p-3 h-32 overflow-y-auto border rounded-lg">
                {data.beneficiaries_info.length === 0 ? (
                  <span className="text-gray-500">
                    Ningún beneficiario añadido.
                  </span>
                ) : (
                  <ul className="space-y-1">
                    {data.beneficiaries_info.map((patient) => (
                      <li
                        key={patient.id}
                        className="flex justify-between items-center text-sm p-1 border-b last:border-b-0"
                      >
                        <span>{patient.name}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveBeneficiary(patient.id)}
                          className="text-red-500 hover:text-red-700 text-xs ml-2"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>

          {/* Mensajes de Error de Backend (ej: Unicidad) */}
          {errors.assignment_error && (
            <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
              {errors.assignment_error}
            </div>
          )}

          {/* Footer del Modal */}
          <div className="flex justify-end pt-4 border-t">
            <button
              type="submit"
              disabled={processing || !data.holder_id}
              className="px-6 py-2 text-sm font-medium rounded-md bg-indigo-600 text-white hover:bg-indigo-700 disabled:bg-gray-400 transition"
            >
              {processing ? "Asignando Contrato..." : "Asignar Plan Familiar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
