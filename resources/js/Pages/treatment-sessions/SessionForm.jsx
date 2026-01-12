import React, { useState, useEffect } from "react";
import { router } from "@inertiajs/react";

const SessionForm = ({
  session = null,
  isEdit = false,
  appointments = [],
  sessionTypes = [],
  rooms = [],
  branches = [],
  doctors = [],
  onSave = null,
  onCancel = null,
}) => {
  // Estados del formulario básicos
  const [formData, setFormData] = useState({
    // Datos básicos
    appointment_id: "",
    session_date: new Date().toISOString().split("T")[0],
    session_time: new Date().toTimeString().split(" ")[0].substring(0, 5),
    session_type_id: "",
    room_id: "",
    branch_id: "",
    doctor_id: "",
    status: "Programada",

    // Campos básicos
    pain_level_before: 0,
    pain_level_after: 0,
    notes: "",
    observations: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // Cargar datos existentes si es edición
  useEffect(() => {
    if (session) {
      setFormData({
        ...formData,
        ...session,
      });
    }
  }, [session]);

  // Validación básica
  const validateForm = () => {
    const newErrors = {};

    if (!formData.appointment_id)
      newErrors.appointment_id = "Debe seleccionar una cita";
    if (!formData.session_date)
      newErrors.session_date = "La fecha es requerida";
    if (!formData.session_type_id)
      newErrors.session_type_id = "Debe seleccionar un tipo de sesión";
    if (!formData.room_id) newErrors.room_id = "Debe seleccionar una sala";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Guardar
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);
    try {
      const route = isEdit
        ? "treatment.sessions.update"
        : "treatment.sessions.store";
      const method = isEdit ? "put" : "post";

      await router[method](
        route,
        {
          ...formData,
          id: session?.id,
        },
        {
          preserveScroll: true,
          onSuccess: () => {
            if (onSave) onSave();
          },
          onError: (error) => {
            if (error[419]) {
              window.location.reload();
            } else {
              setErrors(error);
            }
          },
        }
      );
    } catch (error) {
      console.error("Error al guardar:", error);
    } finally {
      setLoading(false);
    }
  };

  // Manejar cambios
  const handleFormChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {isEdit
                ? "Editar Sesión de Tratamiento"
                : "Nueva Sesión de Tratamiento"}
            </h1>
            <p className="text-gray-600 mt-1">
              Sesión del {formData.session_date} a las {formData.session_time}
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Datos Básicos */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            📋 Información Básica
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cita *
              </label>
              <select
                value={formData.appointment_id}
                onChange={(e) =>
                  handleFormChange("appointment_id", e.target.value)
                }
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                  errors.appointment_id ? "border-red-300" : "border-gray-300"
                }`}
                required
              >
                <option value="">Seleccionar cita</option>
                {appointments.map((apt) => (
                  <option key={apt.id} value={apt.id}>
                    #{apt.id} - {apt.patient_name || "Paciente"}
                  </option>
                ))}
              </select>
              {errors.appointment_id && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.appointment_id}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo de Sesión *
              </label>
              <select
                value={formData.session_type_id}
                onChange={(e) =>
                  handleFormChange("session_type_id", e.target.value)
                }
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                  errors.session_type_id ? "border-red-300" : "border-gray-300"
                }`}
                required
              >
                <option value="">Seleccionar tipo</option>
                {sessionTypes.map((type) => (
                  <option key={type.id} value={type.id}>
                    {type.name}
                  </option>
                ))}
              </select>
              {errors.session_type_id && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.session_type_id}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fecha de Sesión *
              </label>
              <input
                type="date"
                value={formData.session_date}
                onChange={(e) =>
                  handleFormChange("session_date", e.target.value)
                }
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                  errors.session_date ? "border-red-300" : "border-gray-300"
                }`}
                required
              />
              {errors.session_date && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.session_date}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Hora de Sesión
              </label>
              <input
                type="time"
                value={formData.session_time}
                onChange={(e) =>
                  handleFormChange("session_time", e.target.value)
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sala *
              </label>
              <select
                value={formData.room_id}
                onChange={(e) => handleFormChange("room_id", e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                  errors.room_id ? "border-red-300" : "border-gray-300"
                }`}
                required
              >
                <option value="">Seleccionar sala</option>
                {rooms.map((room) => (
                  <option key={room.id} value={room.id}>
                    {room.name}
                  </option>
                ))}
              </select>
              {errors.room_id && (
                <p className="mt-1 text-sm text-red-600">{errors.room_id}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Estado
              </label>
              <select
                value={formData.status}
                onChange={(e) => handleFormChange("status", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="Programada">Programada</option>
                <option value="Completada">Completada</option>
                <option value="Cancelada">Cancelada</option>
                <option value="No Asistió">No Asistió</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sucursal
              </label>
              <select
                value={formData.branch_id}
                onChange={(e) => handleFormChange("branch_id", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Seleccionar sucursal</option>
                {branches.map((branch) => (
                  <option key={branch.id} value={branch.id}>
                    {branch.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Doctor
              </label>
              <select
                value={formData.doctor_id}
                onChange={(e) => handleFormChange("doctor_id", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Seleccionar doctor</option>
                {doctors.map((doctor) => (
                  <option key={doctor.id} value={doctor.id}>
                    {doctor.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Escalas de Dolor Básicas */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            😣 Escalas de Dolor
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Dolor Antes (0-10)
              </label>
              <input
                type="number"
                value={formData.pain_level_before}
                onChange={(e) =>
                  handleFormChange("pain_level_before", e.target.value)
                }
                min="0"
                max="10"
                step="0.1"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Dolor Después (0-10)
              </label>
              <input
                type="number"
                value={formData.pain_level_after}
                onChange={(e) =>
                  handleFormChange("pain_level_after", e.target.value)
                }
                min="0"
                max="10"
                step="0.1"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Observaciones */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            📝 Observaciones
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notas de la Sesión
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => handleFormChange("notes", e.target.value)}
                rows={4}
                placeholder="Notas sobre el progreso, limitaciones encontradas..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Observaciones Adicionales
              </label>
              <textarea
                value={formData.observations}
                onChange={(e) =>
                  handleFormChange("observations", e.target.value)
                }
                rows={4}
                placeholder="Observaciones clínicas detalladas..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Botones */}
        <div className="flex justify-between items-center bg-white rounded-lg shadow-sm border p-6">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
          >
            Cancelar
          </button>

          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {loading
              ? "🔄 Guardando..."
              : isEdit
              ? "✅ Actualizar Sesión"
              : "➕ Crear Sesión"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default SessionForm;
