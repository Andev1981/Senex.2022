// resources/js/pages/KineMobile/MySessions.jsx
import React, { useState } from "react";
import { Head, router } from "@inertiajs/react";
import {
  Calendar,
  Filter,
  TrendingUp,
  CheckCircle2,
  Clock,
  XCircle,
} from "lucide-react";
import KineLayout from "@/Layouts/KineLayout";
import SessionCard from "./Partials/SessionCard";
import StatsBadge from "./Partials/StatsBadge";

export default function MySessions({ sessions, stats, filters }) {
  const [showFilters, setShowFilters] = useState(false);
  const [localFilters, setLocalFilters] = useState({
    start_date: filters.start_date,
    end_date: filters.end_date,
    status: filters.status || "",
  });

  const handleApplyFilters = () => {
    router.get(route("kine.my-sessions"), localFilters, {
      preserveState: true,
      preserveScroll: true,
    });
    setShowFilters(false);
  };

  const handleClearFilters = () => {
    const defaultFilters = {
      start_date: new Date().toISOString().split("T")[0].slice(0, 8) + "01",
      end_date: new Date().toISOString().split("T")[0],
      status: "",
    };
    setLocalFilters(defaultFilters);
    router.get(route("kine.my-sessions"), defaultFilters, {
      preserveState: true,
      preserveScroll: true,
    });
    setShowFilters(false);
  };

  return (
    <KineLayout>
      <Head title="Mis Sesiones" />

      <div className="min-h-screen pb-20 bg-gray-50">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-white border-b border-gray-200 shadow-sm">
          <div className="px-4 py-4">
            <div className="flex items-center justify-between mb-3">
              <h1 className="text-xl font-bold text-gray-900">Mis Sesiones</h1>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="p-2 text-teal-600 transition-colors rounded-lg hover:bg-teal-50"
              >
                <Filter className="w-5 h-5" />
              </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-4 gap-2">
              <StatsBadge
                icon={Calendar}
                label="Total"
                value={stats.total}
                color="gray"
              />
              <StatsBadge
                icon={CheckCircle2}
                label="Completadas"
                value={stats.completed}
                color="green"
              />
              <StatsBadge
                icon={Clock}
                label="Pendientes"
                value={stats.pending}
                color="blue"
              />
              <StatsBadge
                icon={XCircle}
                label="Canceladas"
                value={stats.cancelled}
                color="red"
              />
            </div>

            {/* Revenue */}
            <div className="p-3 mt-3 rounded-lg bg-gradient-to-r from-teal-500 to-blue-500">
              <div className="flex items-center justify-between text-white">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  <span className="text-sm font-medium">
                    Ingresos del período
                  </span>
                </div>
                <span className="text-xl font-bold">
                  ${stats.revenue.toLocaleString("es-CL")}
                </span>
              </div>
            </div>
          </div>

          {/* Filtros */}
          {showFilters && (
            <div className="px-4 pb-4 space-y-3 border-t border-gray-200">
              <div className="grid grid-cols-2 gap-3 pt-3">
                <div>
                  <label className="block mb-1 text-xs font-medium text-gray-700">
                    Desde
                  </label>
                  <input
                    type="date"
                    value={localFilters.start_date}
                    onChange={(e) =>
                      setLocalFilters({
                        ...localFilters,
                        start_date: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                  />
                </div>
                <div>
                  <label className="block mb-1 text-xs font-medium text-gray-700">
                    Hasta
                  </label>
                  <input
                    type="date"
                    value={localFilters.end_date}
                    onChange={(e) =>
                      setLocalFilters({
                        ...localFilters,
                        end_date: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>

              <div>
                <label className="block mb-1 text-xs font-medium text-gray-700">
                  Estado
                </label>
                <select
                  value={localFilters.status}
                  onChange={(e) =>
                    setLocalFilters({ ...localFilters, status: e.target.value })
                  }
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                >
                  <option value="">Todos</option>
                  <option value="Programada">Programada</option>
                  <option value="Completada">Completada</option>
                  <option value="Cancelada">Cancelada</option>
                </select>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleApplyFilters}
                  className="flex-1 py-2 text-sm font-medium text-white bg-teal-600 rounded-lg hover:bg-teal-700"
                >
                  Aplicar filtros
                </button>
                <button
                  onClick={handleClearFilters}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300"
                >
                  Limpiar
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Lista de sesiones */}
        <div className="px-4 py-4">
          {sessions.length === 0 ? (
            <div className="p-8 text-center bg-white rounded-lg shadow-sm">
              <Calendar className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p className="text-gray-600">No hay sesiones en este período</p>
            </div>
          ) : (
            <div className="space-y-3">
              {sessions.map((session) => (
                <SessionCard key={session.id} session={session} showDate />
              ))}
            </div>
          )}
        </div>
      </div>
    </KineLayout>
  );
}
