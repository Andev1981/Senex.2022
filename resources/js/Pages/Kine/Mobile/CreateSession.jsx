import React, { useState } from "react";
import { Head, router } from "@inertiajs/react";
import { ArrowLeft, Check } from "lucide-react";

export default function CreateSession({
  doctor,
  patients,
  sessionTypes,
  selectedPatient,
}) {
  const [form, setForm] = useState({
    patient_id: selectedPatient?.id || "",
    session_type_id: "",
    date: new Date().toISOString().split("T")[0],
    patient_amount: "",
    doctor_amount: "",
    notes: "",
    session_number: "",
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Auto-fill prices cuando se selecciona tipo de sesión
  const handleSessionTypeChange = (sessionTypeId) => {
    const sessionType = sessionTypes.find(
      (st) => st.id === parseInt(sessionTypeId)
    );

    setForm((prev) => ({
      ...prev,
      session_type_id: sessionTypeId,
      patient_amount: sessionType?.default_patient_price || "",
      doctor_amount: sessionType?.default_doctor_price || "",
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    try {
      const response = await fetch(route("kine.sessions.store"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-TOKEN": document.querySelector('meta[name="csrf-token"]')
            .content,
        },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.errors) {
          setErrors(data.errors);
        } else {
          throw new Error(data.error || "Error al crear sesión");
        }
        return;
      }

      // Éxito - mostrar mensaje y redirigir
      alert("✅ " + data.message);
      router.visit(route("kine.dashboard"));
    } catch (error) {
      console.error("Error:", error);
      alert("❌ " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head title="Crear Sesión" />

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="flex items-center gap-3 p-4 text-white bg-blue-600 shadow">
          <button
            onClick={() => router.visit(route("kine.dashboard"))}
            className="transition active:scale-95"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-xl font-bold">Nueva Sesión</h1>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 pb-24 space-y-4">
          {/* Paciente */}
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700">
              Paciente *
            </label>
            <select
              value={form.patient_id}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, patient_id: e.target.value }))
              }
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Seleccionar paciente...</option>
              {patients.map((patient) => (
                <option key={patient.id} value={patient.id}>
                  {patient.full_name} {patient.rut && `(${patient.rut})`}
                </option>
              ))}
            </select>
            {errors.patient_id && (
              <p className="mt-1 text-sm text-red-600">
                {errors.patient_id[0]}
              </p>
            )}
          </div>

          {/* Tipo de Sesión */}
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700">
              Tipo de Sesión *
            </label>
            <select
              value={form.session_type_id}
              onChange={(e) => handleSessionTypeChange(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Seleccionar tipo...</option>
              {sessionTypes.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.name} ({type.duration_minutes} min)
                </option>
              ))}
            </select>
            {errors.session_type_id && (
              <p className="mt-1 text-sm text-red-600">
                {errors.session_type_id[0]}
              </p>
            )}
          </div>

          {/* Fecha */}
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700">
              Fecha *
            </label>
            <input
              type="date"
              value={form.date}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, date: e.target.value }))
              }
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
            {errors.date && (
              <p className="mt-1 text-sm text-red-600">{errors.date[0]}</p>
            )}
          </div>

          {/* Montos */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Valor Paciente *
              </label>
              <input
                type="number"
                value={form.patient_amount}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    patient_amount: e.target.value,
                  }))
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="$"
                required
              />
              {errors.patient_amount && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.patient_amount[0]}
                </p>
              )}
            </div>

            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Tu Comisión *
              </label>
              <input
                type="number"
                value={form.doctor_amount}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    doctor_amount: e.target.value,
                  }))
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="$"
                required
              />
              {errors.doctor_amount && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.doctor_amount[0]}
                </p>
              )}
            </div>
          </div>

          {/* Número de Sesión */}
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700">
              Número de Sesión (opcional)
            </label>
            <input
              type="number"
              value={form.session_number}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, session_number: e.target.value }))
              }
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Ej: 1"
            />
          </div>

          {/* Notas */}
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700">
              Notas (opcional)
            </label>
            <textarea
              value={form.notes}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, notes: e.target.value }))
              }
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              rows="3"
              placeholder="Observaciones sobre la sesión..."
            />
          </div>

          {/* Botón Submit */}
          <button
            type="submit"
            disabled={loading}
            className="flex items-center justify-center w-full gap-2 py-4 font-semibold text-white transition bg-blue-600 rounded-lg shadow-lg active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white rounded-full border-t-transparent animate-spin" />
                Guardando...
              </>
            ) : (
              <>
                <Check className="w-5 h-5" />
                Registrar Sesión
              </>
            )}
          </button>
        </form>
      </div>
    </>
  );
}
