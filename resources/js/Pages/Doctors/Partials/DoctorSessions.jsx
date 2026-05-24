import React, { useMemo, useState } from "react";
import { 
    Search, 
    Calendar as CalendarIcon, 
    Clock, 
    User, 
    CheckCircle2, 
    XCircle,
    ChevronDown,
    Filter
} from "lucide-react";
import moment from "moment";

export default function DoctorSessions({ sessions }) {
    const [filter, setFilter] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");

    const formatMoney = (amount) => {
        return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(amount);
    };

    const filteredSessions = useMemo(() => {
        return sessions.filter(s => {
            const matchesSearch = s.patient?.full_name?.toLowerCase().includes(filter.toLowerCase()) || 
                                 s.session_type?.name?.toLowerCase().includes(filter.toLowerCase());
            const matchesStatus = statusFilter === 'all' || s.status === statusFilter;
            return matchesSearch && matchesStatus;
        });
    }, [sessions, filter, statusFilter]);

    return (
        <div className="space-y-6">
            {/* BARRA DE FILTROS */}
            <div className="bg-white p-6 border border-gray-100 shadow-sm rounded-[2rem] flex flex-col md:flex-row gap-4 items-center">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input 
                        type="text"
                        placeholder="Buscar por paciente o servicio..."
                        className="w-full pl-12 pr-4 py-3 bg-gray-50 border-none rounded-2xl text-xs font-bold focus:ring-brand-primary transition-all"
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                    />
                </div>
                <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-brand-primary" />
                    <select 
                        className="bg-gray-50 border-none rounded-2xl text-xs font-black uppercase tracking-widest py-3 px-8 focus:ring-brand-primary cursor-pointer"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                    >
                        <option value="all">Todos los Estados</option>
                        <option value="completed">Completadas</option>
                        <option value="scheduled">Programadas</option>
                        <option value="cancelled">Canceladas</option>
                    </select>
                </div>
            </div>

            {/* TABLA DE SESIONES */}
            <div className="bg-white border border-gray-100 shadow-xl rounded-[2.5rem] overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="bg-gray-50/50 border-b border-gray-50">
                                <th className="px-8 py-5 text-left text-[10px] font-black text-brand-gray uppercase tracking-widest">Atención / Paciente</th>
                                <th className="px-8 py-5 text-left text-[10px] font-black text-brand-gray uppercase tracking-widest">Fecha & Hora</th>
                                <th className="px-8 py-5 text-center text-[10px] font-black text-brand-gray uppercase tracking-widest">Estado</th>
                                <th className="px-8 py-5 text-right text-[10px] font-black text-brand-gray uppercase tracking-widest">Monto Profesional</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filteredSessions.map((s) => (
                                <tr key={s.id} className="hover:bg-gray-50/30 transition-colors group">
                                    <td className="px-8 py-5">
                                        <div className="flex flex-col">
                                            <span className="text-sm font-black text-gray-900 uppercase tracking-tight">
                                                {s.session_type?.name || 'Consulta Médica'}
                                            </span>
                                            <div className="flex items-center gap-2 mt-1 text-[10px] font-bold text-gray-400">
                                                <User className="w-3 h-3 text-brand-primary" />
                                                <span className="uppercase">{s.patient?.name} {s.patient?.last_name}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5">
                                        <div className="flex flex-col">
                                            <div className="flex items-center gap-2 text-xs font-black text-gray-700">
                                                <CalendarIcon className="w-3 h-3 text-brand-primary" />
                                                {moment(s.date).format('DD/MM/YYYY')}
                                            </div>
                                            <div className="flex items-center gap-2 mt-1 text-[10px] font-bold text-gray-400 font-mono">
                                                <Clock className="w-3 h-3" />
                                                {moment(s.time, 'HH:mm:ss').format('HH:mm')}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5 text-center">
                                        <StatusBadge status={s.status} />
                                    </td>
                                    <td className="px-8 py-5 text-right">
                                        <span className="text-sm font-black text-gray-900 font-mono">
                                            {formatMoney(s.doctor_amount_clp)}
                                        </span>
                                        {s.payroll_id && (
                                            <p className="text-[9px] font-black text-green-600 uppercase tracking-widest mt-1">Liquidado</p>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            {filteredSessions.length === 0 && (
                                <tr>
                                    <td colSpan="4" className="px-8 py-20 text-center">
                                        <div className="space-y-3 opacity-20">
                                            <CalendarIcon className="w-12 h-12 mx-auto" />
                                            <p className="text-xs font-black uppercase tracking-widest">No se encontraron atenciones</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

function StatusBadge({ status }) {
    const config = {
        completed: { label: 'Completada', class: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
        scheduled: { label: 'Programada', class: 'bg-blue-100 text-blue-700 border-blue-200' },
        confirmed: { label: 'Confirmada', class: 'bg-indigo-100 text-indigo-700 border-indigo-200' },
        checked_in: { label: 'En Espera', class: 'bg-orange-100 text-orange-700 border-orange-200' },
        cancelled: { label: 'Cancelada', class: 'bg-red-100 text-red-700 border-red-200' },
        in_progress: { label: 'En Box', class: 'bg-amber-100 text-amber-700 border-amber-200' },
    };

    const current = config[status] || { label: status, class: 'bg-gray-100 text-gray-700 border-gray-200' };

    return (
        <span className={`px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border shadow-sm ${current.class}`}>
            {current.label}
        </span>
    );
}
