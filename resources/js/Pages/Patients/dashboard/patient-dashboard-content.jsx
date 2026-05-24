import React from 'react';
import PatientHistoryTable from '@/components/PatientHistoryTable';
import { Activity, Calendar, Wallet, TrendingUp, LineChart as ChartIcon } from 'lucide-react';
import ClinicalTrendChart from '@/components/clinical/ClinicalTrendChart';

export default function PatientDashboard({ 
    patient, 
    history = [], 
    treatments = [], 
    sessions = [],
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
    const nextSession = history
        .filter(h => h.type === 'session' && h.status === 'scheduled' && new Date(h.date) >= new Date().setHours(0,0,0,0))
        .sort((a, b) => new Date(a.date) - new Date(b.date))[0];

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            
            {/* === SECCIÓN 1: TARJETAS DE RESUMEN (KPIs) === */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* CARD 1: Próxima Atención */}
                <div className="bg-gradient-to-br from-brand-primary to-brand-primary/80 rounded-[2rem] p-8 text-white shadow-xl shadow-brand-primary/20 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl group-hover:scale-110 transition-transform"></div>
                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-6 opacity-90">
                            <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm"><Calendar className="w-5 h-5"/></div>
                            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Próxima Sesión</span>
                        </div>
                        {nextSession ? (
                            <div>
                                <p className="text-3xl font-black tracking-tight">{new Date(nextSession.date + 'T00:00:00').toLocaleDateString('es-CL', {day: 'numeric', month: 'long'})}</p>
                                <p className="text-sm opacity-90 font-bold mt-2 uppercase tracking-widest">{nextSession.time?.slice(0, 5)} hrs • {nextSession.subtitle}</p>
                            </div>
                        ) : (
                            <div>
                                <p className="text-xl font-black opacity-90">No hay citas agendadas</p>
                                <p className="text-[10px] opacity-75 mt-2 font-black uppercase tracking-[0.2em]">Disponible para agendamiento</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* CARD 2: Estado Financiero */}
                <div className="bg-white border border-gray-100 rounded-[2rem] p-8 shadow-sm hover:shadow-xl transition-all group">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-green-50 text-green-600 rounded-xl group-hover:bg-green-100 transition-colors"><Wallet className="w-5 h-5"/></div>
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Saldo Pendiente</span>
                    </div>
                    <div>
                        <p className={`text-3xl font-black tracking-tight ${totalDebt > 0 ? 'text-gray-900' : 'text-green-500'}`}>
                            ${totalDebt.toLocaleString('es-CL')}
                        </p>
                        <p className="text-[10px] text-gray-400 mt-3 font-black uppercase tracking-widest">
                            {totalDebt > 0 ? 'Liquidaciones Pendientes' : 'Cuenta al día'}
                        </p>
                    </div>
                </div>

                {/* CARD 3: Estado Clínico */}
                <div className="bg-white border border-gray-100 rounded-[2rem] p-8 shadow-sm hover:shadow-xl transition-all group">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-purple-50 text-purple-600 rounded-xl group-hover:bg-purple-100 transition-colors"><Activity className="w-5 h-5"/></div>
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Tratamientos Activos</span>
                    </div>
                    <div className="flex items-end justify-between">
                        <div>
                            <p className="text-3xl font-black text-gray-900 tracking-tight">{activeTreatmentsCount}</p>
                            <p className="text-[10px] text-gray-400 mt-3 font-black uppercase tracking-widest">En curso</p>
                        </div>
                        {activeTreatmentsCount > 0 && <TrendingUp className="w-10 h-10 text-purple-100 mb-1" />}
                    </div>
                </div>
            </div>

            {/* === SECCIÓN 2: EVOLUCIÓN CLÍNICA (GRÁFICO) === */}
            <div className="bg-white border border-gray-100 rounded-[2.5rem] p-8 shadow-xl shadow-gray-500/5">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h3 className="text-xs font-black text-gray-900 uppercase tracking-[0.2em] flex items-center gap-2">
                            <ChartIcon className="w-4 h-4 text-brand-primary" />
                            Evolución del Dolor (Trend)
                        </h3>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Histórico de sesiones recientes</p>
                    </div>
                </div>
                <ClinicalTrendChart sessions={sessions} />
            </div>

            {/* === SECCIÓN 3: HISTORIAL UNIFICADO === */}
            <div className="h-[600px] min-h-[500px] bg-white border border-gray-100 rounded-[2.5rem] p-8 shadow-xl shadow-gray-500/5 overflow-hidden">
                <div className="flex items-center gap-2 mb-8">
                    <Activity className="w-4 h-4 text-brand-primary" />
                    <h3 className="text-xs font-black text-gray-900 uppercase tracking-[0.2em]">Cronología de Eventos</h3>
                </div>
                <div className="h-full pb-10">
                    <PatientHistoryTable events={history} />
                </div>
            </div>
        </div>
    );
}
