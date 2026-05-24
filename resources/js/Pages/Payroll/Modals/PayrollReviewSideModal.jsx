import React, { useEffect, useState } from "react";
import SideModal from "@/components/SideModal";
import { 
    FileText, 
    Download, 
    Calendar, 
    User, 
    DollarSign,
    Activity,
    AlertCircle,
    CheckCircle
} from "lucide-react";
import axios from "axios";
import { router } from "@inertiajs/react";
import Swal from 'sweetalert2';

export default function PayrollReviewSideModal({ show, onClose, payrollId }) {
    const [loading, setLoading] = useState(false);
    const [payroll, setPayroll] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (show && payrollId) {
            fetchDetails();
        } else {
            setPayroll(null);
            setError(null);
        }
    }, [show, payrollId]);

    const fetchDetails = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.get(route('payrolls.show', payrollId));
            setPayroll(response.data);
        } catch (err) {
            console.error("Error fetching payroll details:", err);
            setError("No se pudo cargar la información de la liquidación.");
        } finally {
            setLoading(false);
        }
    };

    const handleDownloadPdf = () => {
        if (!payroll) return;
        window.open(route('payrolls.pdf', payroll.id), '_blank');
    };

    const handleApprove = () => {
        Swal.fire({
            title: '¿Aprobar Liquidación?',
            text: "Al aprobar, se confirmarán los montos y el documento pasará a estado pendiente de pago. No se podrán hacer cambios posteriores.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#0ea5e9', // brand-primary
            cancelButtonColor: '#d33',
            confirmButtonText: 'Sí, Aprobar',
            cancelButtonText: 'Cancelar'
        }).then((result) => {
            if (result.isConfirmed) {
                router.post(route('payrolls.approve', payroll.id), {}, {
                    onSuccess: () => {
                        onClose();
                        Swal.fire(
                            '¡Aprobada!',
                            'La liquidación ha sido validada exitosamente.',
                            'success'
                        );
                    }
                });
            }
        });
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(amount);
    };

    const formatDate = (dateString) => {
        if (!dateString) return "-";
        return new Date(dateString).toLocaleDateString('es-CL');
    };

    return (
        <SideModal
            open={show}
            onClose={onClose}
            title="Detalle Liquidación"
            subtitle={`Folio #${payrollId}`}
            icon={FileText}
            width="4xl"
            footer={
                <div className="flex justify-between w-full">
                    <div className="text-xs text-gray-400 self-center">
                        {payroll ? `Generado: ${new Date(payroll.created_at).toLocaleString()}` : ''}
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={onClose}
                            className="px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider hover:bg-gray-100 rounded-xl transition-colors"
                        >
                            Cerrar
                        </button>
                        
                        {payroll && (
                            <>
                                <button
                                    onClick={handleDownloadPdf}
                                    className="px-6 py-3 text-xs font-bold text-brand-primary border border-brand-primary/20 uppercase tracking-wider bg-brand-primary/5 rounded-xl hover:bg-brand-primary/10 flex items-center gap-2 transition-colors"
                                >
                                    <Download className="w-4 h-4" />
                                    PDF
                                </button>

                                {payroll.status === 'draft' && (
                                    <button
                                        onClick={handleApprove}
                                        className="px-6 py-3 text-xs font-bold text-white uppercase tracking-wider bg-green-600 rounded-xl shadow-lg shadow-green-600/20 hover:brightness-110 flex items-center gap-2 transition-transform active:scale-95"
                                    >
                                        <CheckCircle className="w-4 h-4" />
                                        Aprobar
                                    </button>
                                )}
                            </>
                        )}
                    </div>
                </div>
            }
        >
            {loading ? (
                <div className="flex flex-col items-center justify-center h-64 space-y-4">
                    <div className="w-10 h-10 border-4 border-brand-primary/30 border-t-brand-primary rounded-full animate-spin"></div>
                    <p className="text-xs font-bold text-brand-gray uppercase tracking-widest">Cargando detalles...</p>
                </div>
            ) : error ? (
                <div className="flex flex-col items-center justify-center h-64 space-y-4 text-center">
                    <div className="p-4 bg-red-50 rounded-full text-red-400">
                        <AlertCircle className="w-8 h-8" />
                    </div>
                    <p className="text-sm font-bold text-gray-600">{error}</p>
                </div>
            ) : payroll ? (
                <div className="space-y-8">
                    {/* RESUMEN HEADER */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 bg-white rounded-lg shadow-sm">
                                    <User className="w-4 h-4 text-brand-primary" />
                                </div>
                                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Profesional</span>
                            </div>
                            <p className="text-lg font-black text-gray-900">{payroll.doctor?.full_name}</p>
                            <p className="text-xs font-mono text-gray-500 mt-1">{payroll.doctor?.rut}</p>
                        </div>
                        <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 bg-white rounded-lg shadow-sm">
                                    <Calendar className="w-4 h-4 text-brand-primary" />
                                </div>
                                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Período</span>
                            </div>
                            <p className="text-lg font-black text-gray-900">
                                {formatDate(payroll.period_start)} - {formatDate(payroll.period_end)}
                            </p>
                            <div className="flex items-center gap-2 mt-2">
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                                    payroll.status === 'paid' ? 'bg-green-100 text-green-700' : 
                                    payroll.status === 'approved' ? 'bg-blue-100 text-blue-700' : 
                                    'bg-gray-200 text-gray-600'
                                }`}>
                                    {payroll.status === 'draft' ? 'Borrador' : 
                                     payroll.status === 'approved' ? 'Aprobada' : 
                                     payroll.status === 'paid' ? 'Pagada' : payroll.status}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* TABLA DETALLES */}
                    <div className="border border-gray-100 rounded-2xl overflow-hidden">
                        <div className="bg-gray-50/50 px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                            <h3 className="text-xs font-black text-gray-900 uppercase tracking-widest flex items-center gap-2">
                                <Activity className="w-4 h-4 text-brand-primary" />
                                Detalle de Atenciones
                            </h3>
                            <span className="text-[10px] font-bold text-gray-400 bg-white px-2 py-1 rounded border border-gray-100">
                                {payroll.details?.length || 0} Registros
                            </span>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-gray-50 text-gray-500 text-[10px] uppercase font-bold tracking-wider">
                                    <tr>
                                        <th className="px-6 py-3">Fecha</th>
                                        <th className="px-6 py-3">Paciente / Diagnóstico</th>
                                        <th className="px-6 py-3">Servicio</th>
                                        <th className="px-6 py-3 text-right">Valor Total</th>
                                        <th className="px-6 py-3 text-right">Comisión Clínica</th>
                                        <th className="px-6 py-3 text-right">Pago Profesional</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50 text-xs text-gray-600">
                                    {payroll.details?.map((detail) => (
                                        <tr key={detail.id} className="hover:bg-brand-primary/5 transition-colors">
                                            <td className="px-6 py-3 font-medium">{formatDate(detail.service_date)}</td>
                                            <td className="px-6 py-3">
                                                <div className="font-bold text-gray-900">{detail.patient?.full_name || 'N/A'}</div>
                                                <div className="text-[9px] text-brand-primary uppercase font-medium truncate max-w-[150px]">
                                                    {detail.treatment_session?.diagnostic?.name || 'Sin Diagnóstico'}
                                                </div>
                                            </td>
                                            <td className="px-6 py-3">
                                                <span className="px-2 py-1 bg-gray-100 rounded text-[9px] font-bold uppercase text-gray-500">
                                                    {detail.item?.name || 'Consulta'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-3 text-right font-mono text-gray-500">
                                                {formatCurrency(detail.patient_amount_clp)}
                                            </td>
                                            <td className="px-6 py-3 text-right font-mono text-red-400">
                                                - {formatCurrency(detail.commission_amount_clp)}
                                            </td>
                                            <td className="px-6 py-3 text-right font-mono font-bold text-brand-primary bg-brand-primary/5">
                                                {formatCurrency(detail.subtotal_clp)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* TOTALES */}
                    <div className="flex justify-end">
                        <div className="w-full max-w-sm bg-gray-50 p-6 rounded-2xl border border-gray-100 space-y-3">
                            <div className="flex justify-between text-xs text-gray-500">
                                <span>Total Atenciones</span>
                                <span className="font-mono font-bold">{formatCurrency(payroll.total_patient_amount_clp)}</span>
                            </div>
                            <div className="flex justify-between text-xs text-red-500">
                                <span>Total Comisiones (Retención)</span>
                                <span className="font-mono font-bold">- {formatCurrency(payroll.total_commission_amount_clp)}</span>
                            </div>
                            {Number(payroll.total_adjustments_clp) !== 0 && (
                                <div className="flex justify-between text-xs text-orange-500">
                                    <span>Ajustes</span>
                                    <span className="font-mono font-bold">- {formatCurrency(payroll.total_adjustments_clp)}</span>
                                </div>
                            )}
                            <div className="pt-4 mt-4 border-t border-gray-200 flex justify-between items-center">
                                <span className="text-sm font-black text-gray-900 uppercase tracking-tight">Total a Pagar</span>
                                <span className="text-xl font-black text-brand-primary font-mono">
                                    {formatCurrency(payroll.total_payable_clp)}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            ) : null}
        </SideModal>
    );
}
