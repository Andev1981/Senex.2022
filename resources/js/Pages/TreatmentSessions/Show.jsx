import React, { useState } from "react";
import { router } from "@inertiajs/react";

const Show = ({ session }) => {
  const [showEditForm, setShowEditForm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleStatusChange = (newStatus) => {
    if (confirm(`¿Cambiar estado a "${newStatus}"?`)) {
      setIsLoading(true);
      router.put(
        `/sesiones/${session.id}`,
        {
          status: newStatus,
        },
        {
          onSuccess: () => setIsLoading(false),
          onError: () => {
            setIsLoading(false);
            alert("Error al cambiar el estado");
          },
        }
      );
    }
  };

  const handleDelete = () => {
    if (
      confirm(
        "¿Estás seguro de eliminar esta sesión? Esta acción no se puede deshacer."
      )
    ) {
      setIsLoading(true);
      router.delete(`/sesiones/${session.id}`, {
        onSuccess: () => router.visit("/sesiones"),
        onError: () => {
          setIsLoading(false);
          alert("Error al eliminar la sesión");
        },
      });
    }
  };

  const handleUpdateSession = (updatedData) => {
    setIsLoading(true);
    router.put(`/sesiones/${session.id}`, updatedData, {
      onSuccess: () => {
        setShowEditForm(false);
        setIsLoading(false);
      },
      onError: () => {
        setIsLoading(false);
        alert("Error al actualizar la sesión");
      },
    });
  };

  return (
    <>
      <div className="p-6">
        <div className="mb-6">
          <button
            onClick={() => router.visit("/sesiones")}
            className="flex items-center text-indigo-600 hover:text-indigo-800"
          >
            ← Volver a Sesiones
          </button>
        </div>

        <div className="overflow-hidden bg-white shadow sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium leading-6 text-gray-900">
                  Sesión de Tratamiento #{session.id}
                </h3>
                <p className="max-w-2xl mt-1 text-sm text-gray-500">
                  Detalles de la sesión
                </p>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setShowEditForm(true)}
                  disabled={isLoading}
                  className="px-4 py-2 text-white bg-blue-600 rounded hover:bg-blue-700 disabled:opacity-50"
                >
                  Editar
                </button>
                <button
                  onClick={handleDelete}
                  disabled={isLoading}
                  className="px-4 py-2 text-white bg-red-600 rounded hover:bg-red-700 disabled:opacity-50"
                >
                  Eliminar
                </button>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-200">
            <dl>
              <div className="px-4 py-5 bg-gray-50 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">
                  Paciente ID
                </dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {session.patient_id}
                </dd>
              </div>

              <div className="px-4 py-5 bg-white sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">
                  Fecha de Sesión
                </dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {new Date(session.session_date).toLocaleDateString("es-CL")}
                </dd>
              </div>

              <div className="px-4 py-5 bg-gray-50 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Horario</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {session.start_time} - {session.end_time}
                </dd>
              </div>

              <div className="px-4 py-5 bg-white sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">
                  Tipo de Tratamiento
                </dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {session.treatment_type}
                </dd>
              </div>

              <div className="px-4 py-5 bg-gray-50 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Estado</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
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
                  <div className="mt-2">
                    <select
                      value={session.status}
                      onChange={(e) => handleStatusChange(e.target.value)}
                      disabled={isLoading}
                      className="px-2 py-1 text-sm border rounded"
                    >
                      <option value="Programada">Programada</option>
                      <option value="Completada">Completada</option>
                      <option value="Cancelada">Cancelada</option>
                      <option value="No Asistió">No Asistió</option>
                    </select>
                  </div>
                </dd>
              </div>

              <div className="px-4 py-5 bg-white sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Costo</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {session.session_cost_amount_clp
                    ? `$${parseInt(
                        session.session_cost_amount_clp
                      ).toLocaleString("es-CL")}`
                    : "No especificado"}{" "}
                  CLP
                </dd>
              </div>

              <div className="px-4 py-5 bg-gray-50 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Notas</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {session.notes || "Sin notas"}
                </dd>
              </div>

              <div className="px-4 py-5 bg-white sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">
                  Fecha de Creación
                </dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {new Date(session.created_at).toLocaleDateString("es-CL", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </dd>
              </div>

              {session.updated_at && (
                <div className="px-4 py-5 bg-gray-50 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">
                    Última Actualización
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {new Date(session.updated_at).toLocaleDateString("es-CL", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </dd>
                </div>
              )}
            </dl>
          </div>
        </div>
      </div>

      {/* Formulario de edición */}
      {showEditForm && (
        <EditSessionForm
          session={session}
          onClose={() => setShowEditForm(false)}
          onUpdate={handleUpdateSession}
        />
      )}

      {isLoading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-600 bg-opacity-50">
          <div className="p-6 bg-white rounded-lg">
            <div className="flex items-center">
              <div className="w-6 h-6 border-b-2 border-blue-600 rounded-full animate-spin"></div>
              <span className="ml-2">Procesando...</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

// Componente para editar sesión
const EditSessionForm = ({ session, onClose, onUpdate }) => {
  const [formData, setFormData] = useState({
    patient_id: session.patient_id,
    session_date: session.session_date,
    start_time: session.start_time,
    end_time: session.end_time,
    treatment_type: session.treatment_type,
    session_cost_amount_clp: session.session_cost_amount_clp || "",
    notes: session.notes || "",
    status: session.status,
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onUpdate(formData);
  };

  return (
    <div className="fixed inset-0 z-50 w-full h-full overflow-y-auto bg-gray-600 bg-opacity-50">
      <div className="relative p-5 mx-auto bg-white border rounded-md shadow-lg top-20 w-96">
        <div className="mt-3">
          <h3 className="mb-4 text-lg font-medium text-gray-900">
            Editar Sesión #{session.id}
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
                Actualizar Sesión
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Show;
