import { useState, useMemo } from "react";
import axios from "axios";
import {
  Users,
  Search,
  UserMinus,
  ChevronRight,
  UserCog,
  Database,
  XCircle,
  Plus,
  User,
} from "lucide-react";
import Swal from "sweetalert2";

export default function DoctorPatients({ doctor, patients = [] }) {
  const [patientQuery, setPatientQuery] = useState("");
  const [patientsDraft, setPatientsDraft] = useState(doctor?.patients || []);

  const assignedPatientIds = new Set(patientsDraft.map((p) => p.id));

  const availablePatients = useMemo(() => {
    return patients.filter(
      (p) =>
        !assignedPatientIds.has(p.id) &&
        (patientQuery.trim().length === 0 ||
          [p.name, p.rut]
            .join(" ")
            .toLowerCase()
            .includes(patientQuery.toLowerCase()))
    );
  }, [patientQuery, patients, patientsDraft]);

  const assignPatient = async (patientId) => {
    const pObj = patients.find((p) => p.id === patientId);
    try {
      const res = await axios.post(
        route("doctors.patients.assign", doctor.id),
        { patient_id: patientId }
      );
      if (res.data.success) {
        setPatientsDraft((prev) => [...prev, pObj]);
        setPatientQuery("");
        Swal.fire({
          toast: true,
          position: "top-end",
          icon: "success",
          title: "Paciente vinculado",
          showConfirmButton: false,
          timer: 2000,
        });
      }
    } catch (e) {
      Swal.fire({ icon: "error", title: "Error" });
    }
  };

  const unassignPatient = async (pId) => {
    try {
      const res = await axios.delete(
        route("doctors.patients.unassign", [doctor.id, pId])
      );
      if (res.data.success) {
        setPatientsDraft((prev) => prev.filter((p) => p.id !== pId));
        Swal.fire({
          toast: true,
          position: "top-end",
          icon: "info",
          title: "Vínculo removido",
          showConfirmButton: false,
          timer: 2000,
        });
      }
    } catch (e) {
      Swal.fire({ icon: "error", title: "Error" });
    }
  };

  return (
    <div className="flex flex-col h-full duration-500 bg-white animate-in fade-in">
      <div className="flex items-center justify-between p-8 border-b border-gray-100 bg-gray-50/50 shrink-0">
        <div className="flex items-center gap-4">
          <div className="p-3 text-white transform shadow-xl bg-brand-primary rounded-2xl shadow-brand-primary/20 rotate-3">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <h2 className="mb-1 text-xl font-black leading-none tracking-tight text-gray-900 uppercase">
              Cartera de Pacientes
            </h2>
            <p className="text-[10px] font-black text-brand-gray uppercase tracking-[0.2em]">
              {doctor.full_name} • Especialista Preferente
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 px-4 py-2 mr-16 bg-white border border-gray-100 shadow-sm rounded-xl">
          <span className="text-[10px] font-black text-brand-gray uppercase tracking-widest">
            {patientsDraft.length} Vinculados
          </span>
        </div>
      </div>

      <div className="flex-1 p-8 space-y-8 overflow-y-auto custom-scrollbar">
        {/* BUSCADOR */}
        <div className="relative max-w-2xl mx-auto group">
          <Search className="absolute w-4 h-4 transition-colors -translate-y-1/2 left-4 top-1/2 text-brand-gray group-focus-within:text-brand-primary" />
          <input
            className="w-full py-4 pl-12 pr-4 text-sm font-bold transition-all border-gray-100 shadow-inner outline-none bg-gray-50 focus:bg-white focus:ring-4 focus:ring-brand-primary/5 focus:border-brand-primary rounded-2xl"
            placeholder="Vincular nuevo paciente por RUT o Nombre..."
            value={patientQuery}
            onChange={(e) => setPatientQuery(e.target.value)}
          />
          {patientQuery && availablePatients.length > 0 && (
            <div className="absolute top-full mt-2 left-0 right-0 bg-white border border-gray-100 rounded-[2rem] shadow-2xl z-50 overflow-hidden border-t-brand-primary border-t-4">
              {availablePatients.map((p) => (
                <button
                  key={p.id}
                  onClick={() => assignPatient(p.id)}
                  className="flex items-center justify-between w-full px-6 py-4 text-left transition-all border-b hover:bg-brand-secondary/5 group border-gray-50 last:border-0"
                >
                  <div>
                    <p className="text-sm font-black tracking-tight text-gray-800 uppercase">
                      {p.full_name}
                    </p>
                    <p className="text-[10px] font-bold text-brand-gray font-mono">
                      {p.rut}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 transition-all transform translate-x-2 opacity-0 text-brand-primary group-hover:opacity-100 group-hover:translate-x-0">
                    <span className="text-[9px] font-black uppercase tracking-widest">
                      Asignar
                    </span>
                    <Plus className="w-4 h-4" />
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* GRID DE PACIENTES */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {patientsDraft.map((p) => (
            <div
              key={p.id}
              className="p-6 bg-white border border-gray-100 rounded-[2rem] shadow-lg shadow-gray-500/5 group hover:border-brand-primary/30 transition-all relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-20 h-20 -mt-10 -mr-10 transition-colors rounded-full bg-brand-primary/5 blur-xl group-hover:bg-brand-primary/10"></div>
              <div className="relative z-10 flex items-center gap-4">
                <div className="flex items-center justify-center w-12 h-12 transition-transform border border-gray-100 rounded-xl bg-gray-50 text-brand-primary group-hover:rotate-3">
                  <User className="w-6 h-6" />
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] font-black text-gray-900 uppercase tracking-tight truncate leading-none mb-1.5">
                    {p.full_name}
                  </p>
                  <p className="text-[9px] font-bold text-brand-gray opacity-60 font-mono tracking-widest">
                    {p.rut}
                  </p>
                </div>
              </div>
              <div className="relative z-10 flex justify-end pt-4 mt-6 border-t border-gray-50">
                <button
                  onClick={() => unassignPatient(p.id)}
                  className="p-2 text-gray-300 transition-all hover:text-red-500 hover:bg-red-50 rounded-xl active:scale-90"
                >
                  <UserMinus className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
          {patientsDraft.length === 0 && (
            <div className="py-24 text-center col-span-full opacity-30">
              <Users className="w-16 h-16 mx-auto mb-4" />
              <p className="enterprise-label">Sin pacientes en cartera</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
