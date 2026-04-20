import React from 'react';
import PatientHistoryTable from '@/components/PatientHistoryTable'; // Asegúrate de la ruta correcta
import { Activity, Calendar, Wallet, TrendingUp } from 'lucide-react';

export default function PatientDashboard({ 
    patient, 
    history = [], // Recibimos el historial unificado del Controller
    treatments = [], 
    payments = [],
    openSessionModal 
}) {

    // --- CÁLCULOS RÁPIDOS PARA LAS TARJETAS (KPIs) ---
    
    // 1. Deuda Total (Sumar saldo de Facturas/Boletas no pagadas)
    const totalDebt = (patient.invoices || []).reduce((acc, invoice) => {
        const status = typeof invoice.payment_status === 'object' 
            ? invoice.payment_status.value 
            : invoice.payment_status;

        if (status === 'unpaid' || status === 'partial') {
            return acc + (Number(invoice.total_amount_clp) || 0);
        }
        return acc;
    }, 0);

    // 2. Tratamientos Activos
    const activeTreatmentsCount = treatments.filter(t => t.status === 'active' || t.status === 'in_progress').length;

    // 3. Próxima Cita (Buscar la primera 'scheduled' en el futuro)
    // Como 'history' viene ordenado descendente, buscamos en reverso o filtramos
    const nextSession = history
        .filter(h => h.type === 'session' && h.status === 'scheduled' && new Date(h.date) >= new Date().setHours(0,0,0,0))
        .sort((a, b) => new Date(a.date) - new Date(b.date))[0];

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            
            {/* === SECCIÓN 1: TARJETAS DE RESUMEN (KPIs) === */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* CARD 1: Próxima Atención */}
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-3xl p-6 text-white shadow-lg shadow-blue-500/20 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-8 -mt-8 blur-xl group-hover:scale-110 transition-transform"></div>
                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-4 opacity-90">
                            <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm"><Calendar className="w-5 h-5"/></div>
                            <span className="text-[10px] font-black uppercase tracking-widest">Próxima Sesión</span>
                        </div>
                        {nextSession ? (
                            <div>
                                <p className="text-2xl font-black">{new Date(nextSession.date).toLocaleDateString('es-CL', {day: 'numeric', month: 'long'})}</p>
                                <p className="text-sm opacity-90 font-medium mt-1">{nextSession.time?.slice(0, 5)} hrs • {nextSession.subtitle}</p>
                            </div>
                        ) : (
                            <div>
                                <p className="text-xl font-bold opacity-90">No hay citas</p>
                                <button onClick={openSessionModal} className="mt-3 text-[10px] bg-white text-blue-600 px-3 py-1.5 rounded-lg font-black uppercase tracking-wide hover:bg-blue-50 transition-colors">
                                    + Agendar Ahora
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* CARD 2: Estado Financiero */}
                <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all group">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-green-50 text-green-600 rounded-xl group-hover:bg-green-100 transition-colors"><Wallet className="w-5 h-5"/></div>
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Deuda Pendiente</span>
                    </div>
                    <div>
                        <p className={`text-3xl font-black ${totalDebt > 0 ? 'text-gray-800' : 'text-green-500'}`}>
                            ${totalDebt.toLocaleString('es-CL')}
                        </p>
                        <p className="text-[10px] text-gray-400 mt-2 font-medium">
                            {totalDebt > 0 ? 'Requiere gestión de cobranza' : '¡Paciente al día! 🎉'}
                        </p>
                    </div>
                </div>

                {/* CARD 3: Estado Clínico */}
                <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all group">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-purple-50 text-purple-600 rounded-xl group-hover:bg-purple-100 transition-colors"><Activity className="w-5 h-5"/></div>
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Tratamientos Activos</span>
                    </div>
                    <div className="flex items-end justify-between">
                        <div>
                            <p className="text-3xl font-black text-gray-800">{activeTreatmentsCount}</p>
                            <p className="text-[10px] text-gray-400 mt-2 font-medium">Planes en curso</p>
                        </div>
                        {activeTreatmentsCount > 0 && <TrendingUp className="w-8 h-8 text-purple-200 mb-1" />}
                    </div>
                </div>

            </div>

            {/* === SECCIÓN 2: HISTORIAL UNIFICADO === */}
            {/* Aquí integramos el componente que creamos antes */}
            <div className="h-[600px] min-h-[500px]">
                <PatientHistoryTable events={history} />
            </div>

        </div>
    );
}