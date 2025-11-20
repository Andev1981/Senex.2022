import React, { useState } from "react";
import { Inertia } from "@inertiajs/inertia";

// Badge de Status simple
const StatusBadge = ({ status }) => {
  const statusConfig = {
    Programada: { className: "bg-blue-100 text-blue-800" },
    Completada: { className: "bg-green-100 text-green-800" },
    Cancelada: { className: "bg-red-100 text-red-800" },
    "No Asistió": { className: "bg-gray-100 text-gray-800" },
  };

  const config = statusConfig[status] || statusConfig["Programada"];

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.className}`}
    >
      {status}
    </span>
  );
};

// Celdas editables simples
const EditableCell = ({
  value,
  type = "text",
  options = [],
  onSave,
  field,
  disabled = false,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);

  const handleSave = () => {
    onSave(field, editValue);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditValue(value);
    setIsEditing(false);
  };

  if (disabled) {
    return <span className="text-gray-400">{value || "-"}</span>;
  }

  if (isEditing) {
    if (type === "select") {
      return (
        <select
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={handleSave}
          className="w-full px-2 py-1 text-sm border border-blue-300 rounded focus:ring-2 focus:ring-blue-500"
          autoFocus
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      );
    }

    return (
      <input
        type="text"
        value={editValue}
        onChange={(e) => setEditValue(e.target.value)}
        onBlur={handleSave}
        className="w-full px-2 py-1 text-sm border border-blue-300 rounded focus:ring-2 focus:ring-blue-500"
        autoFocus
      />
    );
  }

  return (
    <div
      onClick={() => setIsEditing(true)}
      className="cursor-pointer hover:bg-blue-50 p-1 rounded transition-colors min-h-[2rem] flex items-center"
    >
      {value || <span className="text-gray-400 italic">Click para editar</span>}
    </div>
  );
};

const TableSesiones = ({
  sessions,
  selectedSessions,
  onSelectionChange,
  onEdit,
  sessionTypes = [],
  rooms = [],
  branches = [],
  doctors = [],
}) => {
  // Manejar selección simple
  const handleSelectSession = (sessionId) => {
    if (selectedSessions.includes(sessionId)) {
      onSelectionChange(selectedSessions.filter((id) => id !== sessionId));
    } else {
      onSelectionChange([...selectedSessions, sessionId]);
    }
  };

  const handleSelectAll = () => {
    if (selectedSessions.length === sessions.length) {
      onSelectionChange([]);
    } else {
      onSelectionChange(sessions.map((s) => s.id));
    }
  };

  // Manejar edición inline simple
  const handleCellSave = async (sessionId, field, value) => {
    try {
      await Inertia.put(
        `/treatment-sessions/${sessionId}`,
        {
          [field]: value,
        },
        {
          preserveScroll: true,
          onSuccess: () => {
            window.location.reload();
          },
        }
      );
    } catch (error) {
      console.error("Error al actualizar:", error);
    }
  };

  // Opciones para selects
  const statusOptions = [
    { value: "Programada", label: "Programada" },
    { value: "Completada", label: "Completada" },
    { value: "Cancelada", label: "Cancelada" },
    { value: "No Asistió", label: "No Asistió" },
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm border">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">
          Lista de Sesiones ({sessions.length})
        </h2>
      </div>

      {/* Tabla */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="w-12 px-4 py-3 text-left">
                <input
                  type="checkbox"
                  checked={
                    selectedSessions.length === sessions.length &&
                    sessions.length > 0
                  }
                  onChange={handleSelectAll}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
              </th>

              {[
                { key: "appointment_id", label: "Cita", width: "w-16" },
                { key: "session_type", label: "Tipo", width: "w-28" },
                { key: "patient", label: "Paciente", width: "w-32" },
                { key: "doctor", label: "Doctor", width: "w-28" },
                { key: "date", label: "Fecha", width: "w-24" },
                { key: "time", label: "Hora", width: "w-20" },
                { key: "status", label: "Estado", width: "w-28" },
                { key: "actions", label: "Acciones", width: "w-20" },
              ].map((column) => (
                <th
                  key={column.key}
                  className={`${column.width} px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase`}
                >
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="bg-white divide-y divide-gray-200">
            {sessions.map((session) => (
              <tr
                key={session.id}
                className={`hover:bg-gray-50 ${
                  selectedSessions.includes(session.id) ? "bg-blue-50" : ""
                }`}
              >
                <td className="px-4 py-4 whitespace-nowrap">
                  <input
                    type="checkbox"
                    checked={selectedSessions.includes(session.id)}
                    onChange={() => handleSelectSession(session.id)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </td>

                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                  #{session.appointment_id}
                </td>

                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                  {session.session_type || "-"}
                </td>

                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                  {session.patient_name || "-"}
                </td>

                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                  {session.doctor_name || "-"}
                </td>

                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                  {session.session_date || "-"}
                </td>

                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                  {session.session_time || "-"}
                </td>

                <td className="px-4 py-4 whitespace-nowrap text-sm">
                  <EditableCell
                    value={<StatusBadge status={session.status} />}
                    type="select"
                    options={statusOptions}
                    onSave={(field, value) =>
                      handleCellSave(session.id, "status", value)
                    }
                    field="status"
                  />
                </td>

                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                  <button
                    onClick={() => onEdit(session)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    ✏️
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {sessions.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 text-lg mb-2">📭</div>
          <p className="text-gray-500">No se encontraron sesiones</p>
        </div>
      )}
    </div>
  );
};

export default TableSesiones;
