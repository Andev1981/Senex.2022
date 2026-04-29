// resources/js/pages/KineMobile/SessionForm.jsx
import React, { useState, useEffect } from "react";
import { Head, router } from "@inertiajs/react";
import {
  ArrowLeft,
  Calendar,
  Clock,
  User,
  FileText,
  Save,
  Trash2,
  Search,
  Stethoscope,
  DollarSign,
  Percent,
  Activity,
  TrendingUp,
  TrendingDown,
  Clipboard,
  Target,
  Home,
  CheckCircle,
} from "lucide-react";
import KineLayout from "@/Layouts/KineLayout";
import moment from "moment";
import SignatureCanvas from "@/Components/SignatureCanvas";

export default function SessionForm({
  session = null,
  patients = [],
  sessionTypes = [],
  treatments = [],
  doctor,
  availableTechniques = [],
  availableExercises = [],
}) {
  const isEditMode = !!session;
  const canEdit = !isEditMode || session.status === "Programada";
  const [showSignatureModal, setShowSignatureModal] = useState(false);

  // Estado del formulario
  const [formData, setFormData] = useState({
    treatment_id: session?.treatment_id || "",
    month_session_number: session?.month_session_number || "",
    date: session?.date
      ? moment.utc(session.date).format("YYYY-MM-DD")
      : moment.utc(Date.now()).format("YYYY-MM-DD"),
    time: session?.time ? moment(session.time, "HH:mm:ss").format("HH:mm") : "",
    duration: session?.duration || 60,
    status: session?.status || "scheduled",
    doctor_id: doctor?.id || session?.doctor_id || "",
    patient_id: session?.patient_id || "",
    item_id: session?.item_id || "",

    pain_before: session?.pain_before || 0,
    pain_after: session?.pain_after || 0,

    rom_flexion_before: session?.rom_flexion_before || 0,
    rom_flexion_after: session?.rom_flexion_after || 0,
    rom_abduction_before: session?.rom_abduction_before || 0,
    rom_abduction_after: session?.rom_abduction_after || 0,
    rom_rotation_before: session?.rom_rotation_before || 0,
    rom_rotation_after: session?.rom_rotation_after || 0,

    techniques: session?.techniques || [],
    exercises: session?.exercises || [],

    notes: session?.notes || "",
    homework: session?.homework || "",
    next_goals: session?.next_goals || "",

    patient_amount_clp: session?.patient_amount_clp || 0,
    doctor_amount_clp: session?.doctor_amount_clp || 0,
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchPatient, setSearchPatient] = useState(session?.patient?.name || "");
  const [showPatientList, setShowPatientList] = useState(false);
  const [activeTab, setActiveTab] = useState("basic");

  const selectedSessionType = sessionTypes.find(st => st.id === parseInt(formData.item_id));

  useEffect(() => {
    if (selectedSessionType && !isEditMode) {
      setFormData(prev => ({
        ...prev,
        patient_amount_clp: selectedSessionType.price,
        duration: selectedSessionType.duration || 60,
      }));
    }
  }, [formData.item_id]);

  const filteredPatients = !isEditMode
    ? patients.filter(p => p.name.toLowerCase().includes(searchPatient.toLowerCase()) || (p.rut && p.rut.includes(searchPatient)))
    : [];

  const patientTreatments = formData.patient_id
    ? treatments.filter(t => t.patient_id === parseInt(formData.patient_id))
    : [];

  const handleSelectPatient = (patient) => {
    setFormData({ ...formData, patient_id: patient.id, treatment_id: "", item_id: "" });
    setSearchPatient(patient.name);
    setShowPatientList(false);
  };

  const handleFinishSession = () => {
    if (!isFormValid()) {
      alert("Por favor completa los datos básicos antes de finalizar.");
      return;
    }
    setShowSignatureModal(true);
  };

  const onSaveSignature = (signatureBase64) => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => sendCompletion(signatureBase64, false, `${pos.coords.latitude},${pos.coords.longitude}`),
        () => sendCompletion(signatureBase64, false, null)
      );
    } else {
      sendCompletion(signatureBase64, false, null);
    }
  };

  const onSkipSignature = () => {
    const reason = prompt("Motivo de omisión:", "Paciente de confianza");
    if (reason !== null) sendCompletion(null, true, null, reason);
  };

  const sendCompletion = (signatureBase64, skipped, coords, skipReason = "") => {
    setIsSubmitting(true);
    router.post(route("kine.sessions.complete", session.id), {
      ...formData,
      signature_skipped: skipped,
      signature_base64: signatureBase64,
      gps_coords: coords,
      skip_reason: skipReason,
    }, {
      onSuccess: () => router.visit(route("kine.dashboard")),
      onError: (err) => { setErrors(err); setIsSubmitting(false); setShowSignatureModal(false); },
      onFinish: () => setIsSubmitting(false)
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const url = isEditMode ? route("sessions.update", session.id) : route("sessions.store");
    router[isEditMode ? "put" : "post"](url, formData, {
      onSuccess: () => router.visit(isEditMode ? route("kine.dashboard") : route("kine.dashboard")),
      onError: (err) => { setErrors(err); setIsSubmitting(false); },
      onFinish: () => setIsSubmitting(false)
    });
  };

  const isFormValid = () => formData.patient_id && formData.treatment_id && formData.item_id && formData.date && formData.time;

  const tabs = [
    { id: "basic", label: "Básico", icon: Calendar },
    { id: "clinical", label: "Clínico", icon: Activity },
    { id: "notes", label: "Notas", icon: FileText },
  ];

  return (
    <KineLayout>
      <Head title={isEditMode ? "Editar Sesión" : "Nueva Sesión"} />
      <div className="min-h-screen pb-24 bg-gray-50">
        <div className="sticky top-0 z-10 bg-white border-b shadow-sm">
          <div className="px-4 py-4 flex items-center gap-3">
            <button onClick={() => window.history.back()} className="p-2 text-gray-600 rounded-lg hover:bg-gray-100">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-lg font-bold flex-1">{isEditMode ? "Sesión" : "Nueva Sesión"}</h1>
          </div>
          <div className="flex border-t">
            {tabs.map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 ${activeTab === tab.id ? "text-teal-600 border-b-2 border-teal-600 bg-teal-50" : "text-gray-600"}`}>
                <tab.icon className="w-4 h-4" /> {tab.label}
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="px-4 py-4 space-y-4">
          {activeTab === "basic" && (
            <div className="space-y-4">
              {!isEditMode ? (
                <div className="p-4 bg-white rounded-xl shadow-sm border border-gray-100">
                  <label className="block text-sm font-bold text-gray-700 mb-2">Paciente</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input type="text" value={searchPatient} onChange={(e) => { setSearchPatient(e.target.value); setShowPatientList(true); }} placeholder="Buscar paciente..." className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg" />
                  </div>
                  {showPatientList && searchPatient && (
                    <div className="mt-2 bg-white border rounded-lg shadow-lg max-h-40 overflow-y-auto">
                      {filteredPatients.map(p => (
                        <button key={p.id} type="button" onClick={() => handleSelectPatient(p)} className="w-full px-4 py-3 text-left hover:bg-teal-50 border-b last:border-0">{p.name}</button>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-4 bg-gray-100 rounded-xl border border-gray-200">
                  <label className="text-xs font-bold text-gray-500 uppercase">Paciente</label>
                  <p className="font-bold text-gray-900">{session.patient?.name}</p>
                </div>
              )}

              <div className="p-4 bg-white rounded-xl shadow-sm border border-gray-100">
                <label className="block text-sm font-bold text-gray-700 mb-2">Tratamiento / Servicio</label>
                <select value={formData.treatment_id} onChange={(e) => setFormData({...formData, treatment_id: e.target.value})} className="w-full py-3 border-gray-200 rounded-lg mb-3">
                  <option value="">Seleccionar tratamiento...</option>
                  {patientTreatments.map(t => <option key={t.id} value={t.id}>{t.diagnosis || t.session_type_name}</option>)}
                </select>
                <select value={formData.item_id} onChange={(e) => setFormData({...formData, item_id: e.target.value})} className="w-full py-3 border-gray-200 rounded-lg">
                  <option value="">Seleccionar servicio...</option>
                  {sessionTypes.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-4 bg-white rounded-xl shadow-sm border border-gray-100">
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Fecha</label>
                  <input type="date" value={formData.date} onChange={(e) => setFormData({...formData, date: e.target.value})} className="w-full border-0 p-0 focus:ring-0 font-bold" />
                </div>
                <div className="p-4 bg-white rounded-xl shadow-sm border border-gray-100">
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Hora</label>
                  <input type="time" value={formData.time} onChange={(e) => setFormData({...formData, time: e.target.value})} className="w-full border-0 p-0 focus:ring-0 font-bold" />
                </div>
              </div>
            </div>
          )}

          {activeTab === "clinical" && (
            <div className="space-y-4">
              <div className="p-4 bg-white rounded-xl shadow-sm border border-gray-100">
                <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2"><Activity className="w-4 h-4 text-red-500" /> Dolor (EVA 0-10)</h3>
                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between text-xs font-bold text-gray-500 mb-2"><span>INICIAL</span> <span className="text-teal-600">{formData.pain_before}</span></div>
                    <input type="range" min="0" max="10" value={formData.pain_before} onChange={(e) => setFormData({...formData, pain_before: e.target.value})} className="w-full accent-teal-600" />
                  </div>
                  <div>
                    <div className="flex justify-between text-xs font-bold text-gray-500 mb-2"><span>FINAL</span> <span className="text-teal-600">{formData.pain_after}</span></div>
                    <input type="range" min="0" max="10" value={formData.pain_after} onChange={(e) => setFormData({...formData, pain_after: e.target.value})} className="w-full accent-teal-600" />
                  </div>
                </div>
              </div>
              <div className="p-4 bg-white rounded-xl shadow-sm border border-gray-100">
                 <h3 className="font-bold text-gray-900 mb-4">Técnicas y Ejercicios</h3>
                 <textarea value={formData.techniques.join(", ")} onChange={(e) => setFormData({...formData, techniques: e.target.value.split(",").map(t => t.trim())})} placeholder="Técnicas (separadas por coma)" className="w-full border-gray-200 rounded-lg mb-3" rows={2} />
                 <textarea value={formData.exercises.join(", ")} onChange={(e) => setFormData({...formData, exercises: e.target.value.split(",").map(t => t.trim())})} placeholder="Ejercicios (separados por coma)" className="w-full border-gray-200 rounded-lg" rows={2} />
              </div>
            </div>
          )}

          {activeTab === "notes" && (
            <div className="space-y-4">
              <textarea value={formData.notes} onChange={(e) => setFormData({...formData, notes: e.target.value})} placeholder="Evolución de la sesión..." className="w-full border-gray-200 rounded-xl p-4" rows={6} />
              <textarea value={formData.homework} onChange={(e) => setFormData({...formData, homework: e.target.value})} placeholder="Tareas para el hogar..." className="w-full border-gray-200 rounded-xl p-4" rows={3} />
            </div>
          )}

          <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t flex gap-3 z-20">
            {isEditMode && canEdit && (
              <button type="button" onClick={handleFinishSession} disabled={isSubmitting} className="flex-1 bg-teal-600 text-white font-bold py-4 rounded-xl shadow-lg flex items-center justify-center gap-2 active:scale-95 transition-transform">
                <CheckCircle className="w-5 h-5" /> Finalizar y Firmar
              </button>
            )}
            <button type="submit" disabled={isSubmitting} className={`${isEditMode ? 'w-20 bg-gray-100 text-gray-600' : 'flex-1 bg-blue-600 text-white'} font-bold py-4 rounded-xl flex items-center justify-center`}>
              <Save className="w-5 h-5" /> {!isEditMode && " Guardar"}
            </button>
          </div>
        </form>

        {showSignatureModal && (
          <SignatureCanvas
            onSave={onSaveSignature}
            onCancel={() => setShowSignatureModal(false)}
            onSkip={onSkipSignature}
          />
        )}
      </div>
    </KineLayout>
  );
}
