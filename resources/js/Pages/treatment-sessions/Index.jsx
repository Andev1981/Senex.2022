import React, { useState } from "react";
import { router } from "@inertiajs/react";

const Index = ({ sessions, pagination, filters }) => {
  const [searchTerm, setSearchTerm] = useState(filters?.search || "");
  const [statusFilter, setStatusFilter] = useState(filters?.status || "");
  const [showCreateForm, setShowCreateForm] = useState(false);

  const handleSearch = (e) => {
    e.preventDefault();
    router.get("/sesiones", {
      search: searchTerm,
      status: statusFilter,
    });
  };

  const handleEdit = (session) => {
    router.visit(`/sesiones/${session.id}`);
  };

  const handleDelete = (session) => {
    if (confirm("¿Estás seguro de eliminar esta sesión?")) {
      router.delete(`/sesiones/${session.id}`);
    }
  };

  const handleStatusChange = (session, newStatus) => {
    router.put(`/sesiones/${session.id}`, {
      status: newStatus,
    });
  };

  return (
    <>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Sesiones de Tratamiento</h1>
          <button
            onClick={() => setShowCreateForm(true)}
            className="px-4 py-2 text-white bg-blue-600 rounded hover:bg-blue-700"
          >
            Nueva Sesión
          </button>
        </div>

        {/* Filtros */}
        <form onSubmit={handleSearch} className="p-4 mb-6 rounded bg-gray-50">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <input
              type="text"
              placeholder="Buscar..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-3 py-2 border rounded"
            />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border rounded"
            >
              <option value="">Todos los estados</option>
              <option value="Programada">Programada</option>
              <option value="Completada">Completada</option>
              <option value="Cancelada">Cancelada</option>
              <option value="No Asistió">No Asistió</option>
            </select>
            <button
              type="submit"
              className="px-4 py-2 text-white bg-green-600 rounded hover:bg-green-700"
            >
              Filtrar
            </button>
          </div>
        </form>

        {/* Tabla de sesiones */}
        <div className="overflow-hidden bg-white shadow sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {sessions.map((session) => (
              <li key={session.id}>
                <div className="flex items-center justify-between px-4 py-4">
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-indigo-600 truncate">
                          Sesión #{session.id}
                        </p>
                        <p className="text-sm text-gray-500">
                          Paciente ID: {session.patient_id}
                        </p>
                        <p className="text-sm text-gray-500">
                          Fecha:{" "}
                          {new Date(session.session_date).toLocaleDateString(
                            "es-CL"
                          )}
                        </p>
                      </div>
                      <div className="flex items-center ml-4 space-x-2">
                        <select
                          value={session.status}
                          onChange={(e) =>
                            handleStatusChange(session, e.target.value)
                          }
                          className="px-2 py-1 text-sm border rounded"
                        >
                          <option value="Programada">Programada</option>
                          <option value="Completada">Completada</option>
                          <option value="Cancelada">Cancelada</option>
                          <option value="No Asistió">No Asistió</option>
                        </select>
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            session.status === "Completada"
                              ? "bg-green-100 text-green-800"
                              : session.status === "Programada"
                              ? "bg-blue-100 text-blue-800"
                              : session.status === "Cancelada"
                              ? "bg-red-100 text-red-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {session.status}
                        </span>
                      </div>
                    </div>
                    <div className="flex justify-between mt-2">
                      <div className="flex space-x-2">
                        <button
                          onClick={() =>
                            router.visit(`/sesiones/${session.id}`)
                          }
                          className="text-sm text-indigo-600 hover:text-indigo-900"
                        >
                          Ver detalles
                        </button>
                        <button
                          onClick={() => handleEdit(session)}
                          className="text-sm text-green-600 hover:text-green-900"
                        >
                          Editar
                        </button>
                      </div>
                      <button
                        onClick={() => handleDelete(session)}
                        className="text-sm text-red-600 hover:text-red-900"
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Paginación */}
        {pagination && (
          <div className="flex justify-center mt-6">
            <nav className="relative z-0 inline-flex -space-x-px rounded-md shadow-sm">
              {pagination.links &&
                pagination.links.map((link, index) => (
                  <button
                    key={index}
                    onClick={() => link.url && router.visit(link.url)}
                    disabled={!link.url}
                    className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                      link.active
                        ? "z-10 bg-indigo-50 border-indigo-500 text-indigo-600"
                        : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                    } ${
                      index === 0
                        ? "rounded-l-md"
                        : index === pagination.links.length - 1
                        ? "rounded-r-md"
                        : ""
                    }`}
                    dangerouslySetInnerHTML={{ __html: link.label }}
                  />
                ))}
            </nav>
          </div>
        )}

        {/* Formulario de creación (modal) */}
        {showCreateForm && (
          <CreateSessionForm
            onClose={() => setShowCreateForm(false)}
            onSubmit={(formData) => {
              router.post("/sesiones", formData, {
                onSuccess: () => {
                  setShowCreateForm(false);
                  router.reload();
                },
                onError: (errors) => {
                  console.error("Errores:", errors);
                  alert(
                    "Error al crear la sesión. Por favor, revisa los datos."
                  );
                },
              });
            }}
          />
        )}
      </div>
    </>
  );
};

// Componente para crear nueva sesión
const CreateSessionForm = ({ onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    patient_id: "",
    session_date: "",
    start_time: "",
    end_time: "",
    treatment_type: "",
    session_cost_amount_clp: "",
    notes: "",
    status: "Programada",
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 z-50 w-full h-full overflow-y-auto bg-gray-600 bg-opacity-50">
      <div className="relative p-5 mx-auto bg-white border rounded-md shadow-lg top-20 w-96">
        <div className="mt-3">
          <h3 className="mb-4 text-lg font-medium text-gray-900">
            Nueva Sesión de Tratamiento
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="number"
              placeholder="ID del Paciente"
              value={formData.patient_id}
              onChange={(e) =>
                setFormData({ ...formData, patient_id: e.target.value })
              }
              className="w-full px-3 py-2 border rounded"
              required
            />
            <input
              type="date"
              value={formData.session_date}
              onChange={(e) =>
                setFormData({ ...formData, session_date: e.target.value })
              }
              className="w-full px-3 py-2 border rounded"
              required
            />
            <input
              type="time"
              value={formData.start_time}
              onChange={(e) =>
                setFormData({ ...formData, start_time: e.target.value })
              }
              className="w-full px-3 py-2 border rounded"
              required
            />
            <input
              type="time"
              value={formData.end_time}
              onChange={(e) =>
                setFormData({ ...formData, end_time: e.target.value })
              }
              className="w-full px-3 py-2 border rounded"
              required
            />
            <input
              type="text"
              placeholder="Tipo de Tratamiento"
              value={formData.treatment_type}
              onChange={(e) =>
                setFormData({ ...formData, treatment_type: e.target.value })
              }
              className="w-full px-3 py-2 border rounded"
              required
            />
            <input
              type="number"
              placeholder="Costo (CLP)"
              value={formData.session_cost_amount_clp}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  session_cost_amount_clp: e.target.value,
                })
              }
              className="w-full px-3 py-2 border rounded"
              required
            />
            <textarea
              placeholder="Notas"
              value={formData.notes}
              onChange={(e) =>
                setFormData({ ...formData, notes: e.target.value })
              }
              className="w-full px-3 py-2 border rounded"
              rows="3"
            />
            <select
              value={formData.status}
              onChange={(e) =>
                setFormData({ ...formData, status: e.target.value })
              }
              className="w-full px-3 py-2 border rounded"
            >
              <option value="Programada">Programada</option>
              <option value="Completada">Completada</option>
              <option value="Cancelada">Cancelada</option>
              <option value="No Asistió">No Asistió</option>
            </select>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded hover:bg-gray-300"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded hover:bg-blue-700"
              >
                Crear Sesión
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Index;
