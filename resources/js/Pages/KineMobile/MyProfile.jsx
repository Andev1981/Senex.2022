// resources/js/Pages/KineMobile/MyProfile.jsx
import React, { useState } from "react";
import { Head, router } from "@inertiajs/react";
import {
  User,
  Phone,
  Mail,
  Lock,
  TrendingUp,
  Calendar,
  Award,
  ChevronRight,
} from "lucide-react";
import KineLayout from "@/Layouts/KineLayout";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function MyProfile({ doctor, user, stats, monthlyData }) {
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordData, setPasswordData] = useState({
    current_password: "",
    password: "",
    password_confirmation: "",
  });

  const handleUpdatePassword = (e) => {
    e.preventDefault();
    router.put(route("kine.profile.password"), passwordData, {
      onSuccess: () => {
        setShowPasswordModal(false);
        setPasswordData({
          current_password: "",
          password: "",
          password_confirmation: "",
        });
      },
    });
  };

  return (
    <KineLayout>
      <Head title="Mi Perfil" />

      <div className="min-h-screen pb-20 bg-gray-50">
        {/* Header */}
        <div className="bg-gradient-to-br from-teal-500 to-blue-600">
          <div className="px-4 py-6 text-white">
            <div className="flex items-center gap-4 mb-4">
              <div className="flex items-center justify-center w-16 h-16 text-2xl font-bold text-teal-600 bg-white rounded-full">
                {doctor.name[0]}
                {doctor.last_name[0]}
              </div>
              <div>
                <h1 className="text-xl font-bold">
                  {doctor.name} {doctor.last_name}
                </h1>
                <p className="text-sm opacity-90">{doctor.specialty}</p>
                <p className="text-xs opacity-75">{doctor.branch}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats del mes */}
        <div className="px-4 py-4 space-y-4">
          <div className="p-4 bg-white rounded-lg shadow-sm">
            <h2 className="mb-3 font-semibold text-gray-900">
              Rendimiento del mes
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1 text-gray-600">
                  <Calendar className="w-4 h-4" />
                  <span className="text-xs">Sesiones</span>
                </div>
                <p className="text-2xl font-bold text-teal-600">
                  {stats.sessions_month}
                </p>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1 text-gray-600">
                  <User className="w-4 h-4" />
                  <span className="text-xs">Pacientes</span>
                </div>
                <p className="text-2xl font-bold text-teal-600">
                  {stats.patients_month}
                </p>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1 text-gray-600">
                  <TrendingUp className="w-4 h-4" />
                  <span className="text-xs">Comisiones</span>
                </div>
                <p className="text-xl font-bold text-gray-900">
                  ${stats.commission_month.toLocaleString("es-CL")}
                </p>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1 text-gray-600">
                  <Award className="w-4 h-4" />
                  <span className="text-xs">Ranking</span>
                </div>
                <p className="text-xl font-bold text-gray-900">
                  #{stats.ranking}{" "}
                  <span className="text-sm text-gray-500">
                    de {stats.total_kines}
                  </span>
                </p>
              </div>
            </div>
          </div>

          {/* Gráfico de tendencia */}
          <div className="p-4 bg-white rounded-lg shadow-sm">
            <h3 className="mb-3 text-sm font-semibold text-gray-900">
              Sesiones últimos 6 meses
            </h3>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="sessions"
                  stroke="#14b8a6"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Información personal */}
          <div className="p-4 bg-white rounded-lg shadow-sm">
            <h2 className="mb-3 font-semibold text-gray-900">
              Información personal
            </h2>
            <div className="space-y-3">
              <div className="flex items-center gap-3 pb-3 border-b border-gray-200">
                <User className="w-5 h-5 text-gray-400" />
                <div className="flex-1">
                  <p className="text-xs text-gray-500">RUT</p>
                  <p className="text-sm font-medium text-gray-900">
                    {doctor.rut || "No registrado"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 pb-3 border-b border-gray-200">
                <Mail className="w-5 h-5 text-gray-400" />
                <div className="flex-1">
                  <p className="text-xs text-gray-500">Email</p>
                  <p className="text-sm font-medium text-gray-900">
                    {doctor.email}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 pb-3 border-b border-gray-200">
                <Phone className="w-5 h-5 text-gray-400" />
                <div className="flex-1">
                  <p className="text-xs text-gray-500">Teléfono</p>
                  <p className="text-sm font-medium text-gray-900">
                    {doctor.phone || "No registrado"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Estructura de comisiones */}
          <div className="p-4 bg-white rounded-lg shadow-sm">
            <h2 className="mb-3 font-semibold text-gray-900">
              Estructura de comisiones
            </h2>
            {doctor.commission_rates.length === 0 ? (
              <p className="text-sm text-gray-500">
                No hay comisiones configuradas
              </p>
            ) : (
              <div className="space-y-2">
                {doctor.commission_rates.map((rate, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 border border-gray-200 rounded-lg"
                  >
                    <span className="text-sm font-medium text-gray-900">
                      {rate.session_type}
                    </span>
                    <span className="text-sm font-bold text-teal-600">
                      {rate.type === "percentage"
                        ? `${rate.value}%`
                        : `$${rate.value.toLocaleString("es-CL")}`}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Acciones */}
          <div className="space-y-2">
            <button
              onClick={() => setShowPasswordModal(true)}
              className="flex items-center justify-between w-full p-4 bg-white rounded-lg shadow-sm hover:bg-gray-50"
            >
              <div className="flex items-center gap-3">
                <Lock className="w-5 h-5 text-gray-400" />
                <span className="font-medium text-gray-900">
                  Cambiar contraseña
                </span>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </button>
          </div>
        </div>
      </div>

      {/* Modal cambiar contraseña */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-xl">
            <h3 className="mb-4 text-lg font-bold text-gray-900">
              Cambiar contraseña
            </h3>
            <form onSubmit={handleUpdatePassword} className="space-y-4">
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">
                  Contraseña actual
                </label>
                <input
                  type="password"
                  value={passwordData.current_password}
                  onChange={(e) =>
                    setPasswordData({
                      ...passwordData,
                      current_password: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                  required
                />
              </div>
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">
                  Nueva contraseña
                </label>
                <input
                  type="password"
                  value={passwordData.password}
                  onChange={(e) =>
                    setPasswordData({
                      ...passwordData,
                      password: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                  required
                />
              </div>
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">
                  Confirmar contraseña
                </label>
                <input
                  type="password"
                  value={passwordData.password_confirmation}
                  onChange={(e) =>
                    setPasswordData({
                      ...passwordData,
                      password_confirmation: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                  required
                />
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPasswordModal(false)}
                  className="flex-1 px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 text-white bg-teal-600 rounded-lg hover:bg-teal-700"
                >
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </KineLayout>
  );
}
