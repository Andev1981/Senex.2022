import React, { useState } from 'react';
import { 
    Calendar, 
    CreditCard, 
    Stethoscope, 
    FileText, 
    CheckCircle2, 
    Clock, 
    XCircle,
    Activity,
    Filter,
    Map
} from 'lucide-react';
import moment from 'moment'; // O tu util de fechas
import Modal from '@/components/Modal';
import BodySelector from '@/components/BodySelector';

export default function PatientHistoryTable({ events = [] }) {
    const [filter, setFilter] = useState('all'); // all, clinical, administrative
    const [selectedPainMap, setSelectedPainMap] = useState(null);

    // Filtrado local
    const filteredEvents = events.filter(e => {
        if (filter === 'all') return true;
        if (filter === 'clinical') return ['session', 'treatment'].includes(e.type);
        if (filter === 'financial') return ['payment'].includes(e.type);
        return true;
    });

    // Configuración visual según tipo de evento
    const getTypeConfig = (type) => {
        switch(type) {
            case 'session':
                return { icon: <Activity className="w-5 h-5 text-blue-600"/>, bg: 'bg-blue-50', border: 'border-blue-100' };
            case 'treatment':
                return { icon: <Stethoscope className="w-5 h-5 text-purple-600"/>, bg: 'bg-purple-50', border: 'border-purple-100' };
            case 'payment':
                return { icon: <CreditCard className="w-5 h-5 text-green-600"/>, bg: 'bg-green-50', border: 'border-green-100' };
            default:
                return { icon: <FileText className="w-5 h-5 text-gray-600"/>, bg: 'bg-gray-50', border: 'border-gray-100' };
        }
    };

    // Configuración de Badges de estado
    const getStatusBadge = (status) => {
        const styles = {
            attended: "bg-green-100 text-green-700",
            completed: "bg-green-100 text-green-700",
            scheduled: "bg-blue-100 text-blue-700",
            in_progress: "bg-blue-100 text-blue-700",
            missed: "bg-red-100 text-red-700",
            cancelled: "bg-gray-100 text-gray-500",
        };
        const label = {
            attended: "Asistida",
            completed: "Alta",
            scheduled: "Agendada",
            in_progress: "En Curso",
            missed: "Inasistencia",
            cancelled: "Cancelada",
        };
        return (
            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wide ${styles[status] || 'bg-gray-100'}`}>
                {label[status] || status}
            </span>
        );
    };

    return (
        <>
            <div className="bg-white border border-gray-100 rounded-[2.5rem] p-8 shadow-xl shadow-gray-500/5 h-full flex flex-col">
                
                {/* HEADER CON FILTROS */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                    <div>
                        <h3 className="enterprise-label !text-brand-primary flex items-center gap-2 text-lg">
                            <Calendar className="w-5 h-5" /> Historial Unificado
                        </h3>
                        <p className="text-xs text-gray-400 mt-1">Línea de tiempo de eventos del paciente</p>
                    </div>

                    {/* TABS DE FILTRO */}
                    <div className="flex p-1 bg-gray-50 rounded-xl border border-gray-100">
                        {['all', 'clinical', 'financial'].map((f) => (
                            <button
                                key={f}
                                onClick={() => setFilter(f)}
                                className={`px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${
                                    filter === f 
                                    ? 'bg-white text-brand-primary shadow-sm' 
                                    : 'text-gray-400 hover:text-gray-600'
                                }`}
                            >
                                {f === 'all' ? 'Todos' : f === 'clinical' ? 'Clínico' : 'Pagos'}
                            </button>
                        ))}
                    </div>
                </div>

                {/* TABLA / LISTA */}
                <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
                    {filteredEvents.length > 0 ? (
                        <div className="space-y-4">
                            {filteredEvents.map((event, index) => {
                                const style = getTypeConfig(event.type);
                                return (
                                    <div key={`${event.type}-${event.id}`} className="group flex items-center gap-4 p-4 rounded-2xl hover:bg-gray-50 border border-transparent hover:border-gray-100 transition-all">
                                        
                                        {/* FECHA */}
                                        <div className="w-16 text-center shrink-0">
                                            <p className="text-xs font-bold text-gray-400 uppercase">{moment(event.date).format('MMM')}</p>
                                            <p className="text-xl font-black text-gray-800">{moment(event.date).format('DD')}</p>
                                            <p className="text-[10px] text-gray-300">{moment(event.date).format('YYYY')}</p>
                                        </div>

                                        {/* ICONO TIPO */}
                                        <div className={`p-3 rounded-xl ${style.bg} ${style.border} border shrink-0`}>
                                            {style.icon}
                                        </div>

                                        {/* DETALLE PRINCIPAL */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-start">
                                                <h4 className="font-bold text-gray-800 text-sm truncate">{event.title}</h4>
                                                {event.amount > 0 && (
                                                    <span className="text-xs font-mono font-bold text-gray-500">
                                                        ${Number(event.amount).toLocaleString('es-CL')}
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-xs text-gray-500 truncate">{event.subtitle}</p>
                                            
                                            {/* METADATA EXTRA (Ej: Nivel de Dolor en Sesión) */}
                                            <div className="flex items-center gap-2 mt-1">
                                                {event.type === 'session' && event.meta?.pain_level !== undefined && (
                                                    <span className="text-[9px] font-bold text-brand-primary bg-brand-primary/5 px-2 py-0.5 rounded">
                                                        EVA: {event.meta.pain_level}/10
                                                    </span>
                                                )}
                                                
                                                {/* BOTÓN VER MAPA DE DOLOR */}
                                                {event.meta?.pain_map && event.meta.pain_map.length > 0 && (
                                                    <button 
                                                        onClick={() => setSelectedPainMap(event.meta.pain_map)}
                                                        className="flex items-center gap-1 text-[9px] font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded hover:bg-purple-100 hover:text-purple-600 transition-colors"
                                                    >
                                                        <Map className="w-3 h-3" /> Ver Mapa
                                                    </button>
                                                )}
                                            </div>
                                        </div>

                                        {/* ESTADO */}
                                        <div className="shrink-0 text-right">
                                            {getStatusBadge(event.status)}
                                            <p className="text-[10px] text-gray-300 mt-1 font-mono">
                                                {moment(event.date).format('HH:mm')}
                                            </p>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    ) : (
                        <div className="h-40 flex flex-col items-center justify-center text-gray-300 border-2 border-dashed border-gray-100 rounded-3xl">
                            <Filter className="w-8 h-8 mb-2 opacity-50"/>
                            <p className="text-xs font-bold uppercase tracking-widest">Sin eventos registrados</p>
                        </div>
                    )}
                </div>
            </div>

            {/* MODAL PARA VER MAPA DE DOLOR HISTÓRICO */}
            <Modal
                open={!!selectedPainMap}
                onClose={() => setSelectedPainMap(null)}
                title="Mapa de Dolor Histórico"
                subtitle="Registro visual del paciente"
                icon={Activity}
                maxWidth="2xl"
            >
                <div className="p-4 flex justify-center bg-gray-50/50 rounded-3xl border border-gray-100">
                   <BodySelector initialData={selectedPainMap} mode="read" />
                </div>
                
                <div className="mt-6 flex justify-end">
                    <button 
                        onClick={() => setSelectedPainMap(null)}
                        className="px-6 py-2 bg-gray-100 text-gray-600 font-bold rounded-xl text-xs uppercase tracking-widest hover:bg-gray-200 transition-colors"
                    >
                        Cerrar
                    </button>
                </div>
            </Modal>
        </>
    );
}