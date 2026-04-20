import { useState, useMemo } from "react";
import axios from "axios";
import {
  Users,
  Search,
  UserMinus,
  UserCog,
  Plus,
  User,
  CheckCircle2,
  XCircle,
  AlertCircle
} from "lucide-react";
import Swal from "sweetalert2";

export default function DoctorPatients({ doctor, patients = [] }) {
  const [patientQuery, setPatientQuery] = useState("");
  const [localPatients, setLocalPatients] = useState(doctor.patients || []);
  const [isProcessing, setIsProcessing] = useState(false);

  // Mapeo rápido para saber quiénes ya están asignados
  const assignedIds = useMemo(() => new Set(localPatients.map(p => p.id)), [localPatients]);

  // Buscador que muestra a TODOS
  const searchResults = useMemo(() => {
    if (!patientQuery.trim()) return [];
    const query = patientQuery.toLowerCase();
    return patients.filter(p => 
        (p.name?.toLowerCase().includes(query)) || 
        (p.last_name?.toLowerCase().includes(query)) || 
        (p.rut?.toLowerCase().includes(query))
    ).slice(0, 10);
  }, [patientQuery, patients]);

  const handleAssign = async (patient) => {
    setIsProcessing(true);
    try {
      const resp = await axios.post(route("doctors.patients.assign", doctor.id), { patient_id: patient.id });
      if (resp.data.success) {
        setLocalPatients(prev => [...prev, patient]);
        // No limpiamos el query para que el usuario pueda seguir asignando otros si quiere
        Swal.fire({
          toast: true,
          position: 'top-end',
          icon: 'success',
          title: 'Paciente vinculado',
          showConfirmButton: false,
          timer: 1500,
        });
      }
    } catch (e) {
      Swal.fire('Error', 'No se pudo vincular al paciente', 'error');
    } finally { setIsProcessing(false); }
  };

  const handleUnassign = (pId, pName) => {
    Swal.fire({
      title: '¿Desvincular Paciente?',
      text: `¿Estás seguro de quitar a ${pName} de la cartera de este profesional?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3292b3',
      cancelButtonColor: '#f3f4f6',
      confirmButtonText: '<span className="font-black uppercase text-[10px]">Sí, desvincular</span>',
      cancelButtonText: '<span className="font-black uppercase text-[10px] text-gray-400">Cancelar</span>',
      customClass: {
        confirmButton: '!rounded-xl !px-6 !py-3',
        cancelButton: '!rounded-xl !px-6 !py-3'
      }
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const resp = await axios.delete(route("doctors.patients.unassign", [doctor.id, pId]));
          if (resp.data.success) {
            setLocalPatients(prev => prev.filter(p => p.id !== pId));
            Swal.fire({
              toast: true,
              position: 'top-end',
              icon: 'info',
              title: 'Vínculo eliminado',
              showConfirmButton: false,
              timer: 1500,
            });
          }
        } catch (e) { Swal.fire('Error', 'No se pudo realizar la acción', 'error'); }
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* 1. BUSCADOR UNIVERSAL */}
      <div className="bg-white p-8 border border-gray-100 shadow-sm rounded-[2.5rem] relative">
        <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-brand-secondary/30 rounded-xl text-brand-primary">
                <Search className="w-5 h-5" />
            </div>
            <div>
                <h3 className="text-xl font-black text-gray-900 uppercase tracking-tight leading-none">Gestión de Cartera</h3>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Busca y vincula pacientes a este especialista</p>
            </div>
        </div>

        <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300 group-focus-within:text-brand-primary transition-colors" />
            <input 
                type="text"
                placeholder="Escribe el nombre o RUT del paciente..."
                className="w-full pl-12 pr-4 py-4 bg-gray-50 border-none rounded-2xl text-sm font-bold focus:ring-4 focus:ring-brand-primary/5 focus:bg-white transition-all outline-none"
                value={patientQuery}
                onChange={(e) => setPatientQuery(e.target.value)}
            />
        </div>

        {/* LISTADO DE RESULTADOS (DROP-DOWN) */}
        {patientQuery && (
            <div className="absolute top-full mt-2 left-8 right-8 bg-white border border-gray-100 rounded-[2rem] shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-300">
                {searchResults.length > 0 ? (
                    <div className="divide-y divide-gray-50">
                        {searchResults.map(p => {
                            const isAssigned = assignedIds.has(p.id);
                            return (
                                <div key={p.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors group">
                                    <div className="flex items-center gap-4">
                                        <div className={`p-2 rounded-xl ${isAssigned ? 'bg-brand-primary/10 text-brand-primary' : 'bg-gray-100 text-gray-400'}`}>
                                            <User className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <p className="text-xs font-black text-gray-900 uppercase tracking-tight">{p.name} {p.last_name}</p>
                                            <p className="text-[9px] font-bold text-gray-400 font-mono uppercase tracking-widest">{p.rut}</p>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-center">
                                        {isAssigned ? (
                                            <button 
                                                onClick={() => handleUnassign(p.id, `${p.name} ${p.last_name}`)}
                                                className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 text-[8px] font-black uppercase rounded-lg border border-red-100 hover:bg-red-600 hover:text-white transition-all"
                                            >
                                                <UserMinus className="w-3 h-3" /> Quitar de Cartera
                                            </button>
                                        ) : (
                                            <button 
                                                onClick={() => handleAssign(p)}
                                                disabled={isProcessing}
                                                className="px-4 py-2 bg-brand-primary text-white text-[9px] font-black uppercase tracking-widest rounded-xl shadow-lg shadow-brand-primary/20 hover:brightness-110 active:scale-95 transition-all flex items-center gap-2"
                                            >
                                                <Plus className="w-3.5 h-3.5" /> Vincular Especialista
                                            </button>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="p-10 text-center text-gray-400">
                        <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-20" />
                        <p className="text-[10px] font-black uppercase tracking-widest">No se encontraron coincidencias</p>
                    </div>
                )}
            </div>
        )}
      </div>

      {/* 2. GRILLA DE CARTERA COMPACTA (TARJETAS AJUSTADAS) */}
      <div className="bg-white p-8 border border-gray-100 shadow-xl rounded-[2.5rem] relative overflow-hidden min-h-[400px]">
        <div className="absolute top-0 right-0 w-32 h-32 bg-brand-primary/5 rounded-full -mr-16 -mt-16 blur-2xl"></div>
        
        <div className="flex items-center justify-between mb-8 relative z-10">
            <div className="flex items-center gap-3">
                <div className="p-2 bg-brand-secondary/30 rounded-xl text-brand-primary">
                    <Users className="w-5 h-5" />
                </div>
                <div>
                    <h3 className="text-xl font-black text-gray-900 uppercase tracking-tight leading-none">Pacientes Vinculados</h3>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">{localPatients.length} personas en seguimiento</p>
                </div>
            </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4 relative z-10">
          {localPatients.map((p) => (
            <div key={p.id} className="p-4 bg-gray-50/30 border border-gray-100 rounded-2xl flex items-center justify-between group hover:border-brand-primary/30 hover:bg-white hover:shadow-xl hover:shadow-brand-primary/5 transition-all duration-300">
                <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-white border border-gray-100 flex items-center justify-center text-brand-primary shadow-sm group-hover:scale-110 transition-transform shrink-0">
                        <UserCog className="w-5 h-5" />
                    </div>
                    <div className="min-w-0 truncate">
                        <p className="text-xs font-black text-gray-900 uppercase tracking-tight truncate">{p.name} {p.last_name}</p>
                        <p className="text-[9px] font-bold text-gray-400 opacity-60 font-mono tracking-tighter truncate">{p.rut}</p>
                    </div>
                </div>
                <button 
                    onClick={() => handleUnassign(p.id, `${p.name} ${p.last_name}`)}
                    className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all active:scale-90 border border-transparent hover:border-red-100 shrink-0"
                    title="Desvincular"
                >
                    <UserMinus className="w-4 h-4" />
                </button>
            </div>
          ))}
          
          {localPatients.length === 0 && (
            <div className="col-span-full py-20 text-center opacity-30">
              <Users className="w-16 h-16 mx-auto mb-4" />
              <p className="enterprise-label">La cartera está vacía</p>
              <p className="text-[10px] font-medium uppercase tracking-widest mt-1">Utiliza el buscador superior para asignar pacientes</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
