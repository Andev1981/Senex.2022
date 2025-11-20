import React, { useState, useEffect } from "react";
import { Inertia } from "@inertiajs/inertia";
import TableSesiones from "./TableSesiones";
import SessionForm from "./SessionForm";

const StatCard = ({ title, value, color = "blue" }) => {
  const colorClasses = {
    blue: "bg-blue-50 border-blue-200 text-blue-900",
    green: "bg-green-50 border-green-200 text-green-900",
    yellow: "bg-yellow-50 border-yellow-200 text-yellow-900",
  };

  return (
    <div
      className={`rounded-lg border p-4 ${
        colorClasses[color] || colorClasses.blue
      }`}
    >
      <p className="text-sm font-medium opacity-75">{title}</p>
      <p className="text-2xl font-bold mt-1">{value}</p>
    </div>
  );
};

const SesionesIndex = ({
  sessions = [],
  appointments = [],
  sessionTypes = [],
  rooms = [],
  branches = [],
  doctors = [],
}) => {
  // Estados principales
  const [selectedSessions, setSelectedSessions] = useState([]);
  const [showSessionForm, setShowSessionForm] = useState(false);
  const [editingSession, setEditingSession] = useState(null);

  // Estados de filtros SIMPLIFICADOS
  const [filters, setFilters] = useState({
    status: "",
    session_type_id: "",
  });

  const [filteredSessions, setFilteredSessions] = useState(sessions);

  // Aplicar filtros básicos
  useEffect(() => {
    let filtered = [...sessions];

    if (filters.status) {
      filtered = filtered.filter((s) => s.status === filters.status);
    }

    if (filters.session_type_id) {
      filtered = filtered.filter(
        (s) => s.session_type_id === parseInt(filters.session_type_id)
      );
    }

    setFilteredSessions(filtered);
  }, [filters, sessions]);

  // Manejar filtros
  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const clearFilters = () => {
    setFilters({
      status: "",
      session_type_id: "",
    });
  };

  // Acciones básicas
  const handleCreateSession = () => {
    setEditingSession(null);
    setShowSessionForm(true);
  };

  const handleEditSession = (session) => {
    setEditingSession(session);
    setShowSessionForm(true);
  };

  const handleCloseForm = () => {
    setShowSessionForm(false);
    setEditingSession(null);
  };

  const handleSessionSaved = () => {
    setShowSessionForm(false);
    setEditingSession(null);
    window.location.reload();
  };

  // Estadísticas simples
  const stats = {
    total: filteredSessions.length,
    completadas: filteredSessions.filter((s) => s.status === "Completada")
      .length,
    programadas: filteredSessions.filter((s) => s.status === "Programada")
      .length,
  };

  if (showSessionForm) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="mx-auto py-6 px-4">
          <div className="mb-6">
            <button
              onClick={handleCloseForm}
              className="flex items-center text-blue-600 hover:text-blue-800"
            >
              ← Volver a la lista
            </button>
          </div>

          <SessionForm
            session={editingSession}
            isEdit={!!editingSession}
            appointments={appointments}
            sessionTypes={sessionTypes}
            rooms={rooms}
            branches={branches}
            doctors={doctors}
            onSave={handleSessionSaved}
            onCancel={handleCloseForm}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto py-6 px-4">
        {/* Header */}
        <div className="mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Sesiones de Tratamiento
              </h1>
              <p className="mt-2 text-gray-600">
                Gestiona las sesiones de tratamiento
              </p>
            </div>
            <button
              onClick={handleCreateSession}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              ➕ Nueva Sesión
            </button>
          </div>
        </div>

        {/* Estadísticas simples */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <StatCard title="Total Sesiones" value={stats.total} color="blue" />
          <StatCard
            title="Completadas"
            value={stats.completadas}
            color="green"
          />
          <StatCard
            title="Programadas"
            value={stats.programadas}
            color="yellow"
          />
        </div>

        {/* Filtros básicos */}
        <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Filtros</h2>
            <button
              onClick={clearFilters}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              Limpiar
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Estado
              </label>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange("status", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Todos los estados</option>
                <option value="Programada">Programada</option>
                <option value="Completada">Completada</option>
                <option value="Cancelada">Cancelada</option>
                <option value="No Asistió">No Asistió</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tipo de Sesión
              </label>
              <select
                value={filters.session_type_id}
                onChange={(e) =>
                  handleFilterChange("session_type_id", e.target.value)
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Todos los tipos</option>
                {sessionTypes.map((type) => (
                  <option key={type.id} value={type.id}>
                    {type.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Tabla simplificada */}
        <TableSesiones
          sessions={filteredSessions}
          selectedSessions={selectedSessions}
          onSelectionChange={setSelectedSessions}
          onEdit={handleEditSession}
          sessionTypes={sessionTypes}
          rooms={rooms}
          branches={branches}
          doctors={doctors}
        />
      </div>
    </div>
  );
};

export default SesionesIndex;
