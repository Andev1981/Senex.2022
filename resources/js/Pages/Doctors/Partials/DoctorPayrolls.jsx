import React, { useState } from "react";
import { 
    FileText, 
    Download, 
    CheckCircle2, 
    Clock, 
    Plus,
    Calendar,
    ArrowRight
} from "lucide-react";
import moment from "moment";
import { router } from "@inertiajs/react";
import Swal from "sweetalert2";

export default function DoctorPayrolls({ doctor, payrolls, stats }) {
    const [isGenerating, setIsGenerating] = useState(false);

    const formatMoney = (amount) => {
        return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(amount);
    };

    const handleGeneratePayroll = () => {
        if (stats.pending_earnings <= 0) {
            Swal.fire({
                title: 'Sin montos pendientes',
                text: 'No hay sesiones completadas pendientes de liquidar para este profesional.',
                icon: 'info',
                confirmButtonColor: '#3292b3'
            });
            return;
        }

        Swal.fire({
            title: 'Generar Liquidación',
            text: `¿Deseas generar la liquidación por el monto acumulado de ${formatMoney(stats.pending_earnings)}?`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Sí, generar',
            cancelButtonText: 'Cancelar',
            confirmButtonColor: '#3292b3',
        }).then((result) => {
            if (result.isConfirmed) {
                router.post(route('payrolls.store'), {
                    doctor_id: doctor.id,
                    period_start: moment().startOfMonth().format('Y-m-d'),
                    period_end: moment().format('Y-m-d'),
                }, {
                    onStart: () => setIsGenerating(true),
                    onFinish: () => setIsGenerating(false),
                    onSuccess: () => {
                        Swal.fire('¡Éxito!', 'La liquidación ha sido generada correctamente.', 'success');
                    }
                });
            }
        });
    };

    return (
        <div className="space-y-8">
            {/* CTA: GENERAR NUEVA */}
            <div className="bg-brand-primary p-10 rounded-[2.5rem] shadow-xl shadow-brand-primary/20 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8">
                <div className="absolute top-0 left-0 w-64 h-64 bg-white/10 rounded-full -ml-32 -mt-32 blur-3xl"></div>
                <div className="relative z-10 text-center md:text-left space-y-2">
                    <h3 className="text-2xl font-black text-white uppercase tracking-tight">Liquidación de Honorarios</h3>
                    <p className="text-white/80 text-sm font-medium">
                        Tienes un saldo pendiente de <span className="text-white font-black underline underline-offset-4">{formatMoney(stats.pending_earnings)}</span> por atenciones realizadas.
                    </p>
                </div>
                <button 
                    onClick={handleGeneratePayroll}
                    disabled={isGenerating}
                    className="relative z-10 px-10 py-5 bg-white text-brand-primary font-black uppercase tracking-widest text-xs rounded-2xl shadow-xl hover:scale-105 active:scale-95 transition-all disabled:opacity-50 flex items-center gap-3"
                >
                    {isGenerating ? (
                        "Procesando..."
                    ) : (
                        <>
                            <Plus className="w-5 h-5" /> Generar Pago Ahora
                        </>
                    )}
                </button>
            </div>

            {/* HISTORIAL */}
            <div className="space-y-6">
                <h4 className="enterprise-label opacity-60 flex items-center gap-2">
                    <FileText className="w-4 h-4" /> Historial de Pagos
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {payrolls.map((p) => (
                        <div key={p.id} className="bg-white border border-gray-100 p-6 rounded-[2rem] shadow-sm hover:shadow-md transition-all group">
                            <div className="flex justify-between items-start mb-6">
                                <div className={`p-3 rounded-2xl ${p.status === 'paid' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                                    <NotebookText className="w-6 h-6" />
                                </div>
                                <span className={`px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border ${
                                    p.status === 'paid' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 'bg-amber-100 text-amber-700 border-amber-200'
                                }`}>
                                    {p.status === 'paid' ? 'Pagada' : 'Pendiente'}
                                </span>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <p className="text-lg font-black text-gray-900 tracking-tight leading-none mb-1">
                                        {formatMoney(p.total_amount)}
                                    </p>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                        <Calendar className="w-3 h-3" />
                                        {moment(p.period_start).format('DD MMM')} al {moment(p.period_end).format('DD MMM, YYYY')}
                                    </p>
                                </div>

                                <div className="pt-4 border-t border-gray-50 flex items-center justify-between">
                                    <a 
                                        href={route('payrolls.pdf', p.id)}
                                        className="flex items-center gap-2 text-[10px] font-black text-brand-primary uppercase tracking-widest hover:underline"
                                    >
                                        <Download className="w-4 h-4" /> Detalle PDF
                                    </a>
                                    <div className="text-[10px] font-bold text-gray-400">
                                        Ref: #{p.id}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                    {payrolls.length === 0 && (
                        <div className="col-span-2 py-20 text-center bg-gray-50/50 rounded-[2rem] border-2 border-dashed border-gray-100">
                            <p className="text-xs font-black text-gray-400 uppercase tracking-widest">No hay liquidaciones registradas</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function NotebookText({ className }) {
    return (
        <svg xmlns="http://www.w3.org/2001/XMLSchema-instance" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className={className}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
        </svg>
    );
}
