import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { DollarSign, Users, Shield } from 'lucide-react';
import ReceivablesTable from './components/ReceivablesTable';

export default function Index({ totalDebt, patientReceivables, insurerReceivables }) {
    return (
        <AuthenticatedLayout>
            <Head title="Cuentas por Cobrar" />
            <div className="min-h-screen p-8 bg-gray-50/50 space-y-12">
                {/* HEADER PREMIUM */}
                <div className="bg-white border border-gray-100 shadow-sm rounded-[3rem] p-4">
                    <div className="flex flex-col lg:flex-row justify-between items-center gap-6 px-6 py-4">
                        <div className="flex items-center gap-6">
                            <div className="w-16 h-16 bg-brand-primary text-white rounded-2xl flex items-center justify-center shadow-2xl shadow-brand-primary/30 transform rotate-3">
                                <DollarSign className="w-8 h-8" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-black text-gray-900 uppercase tracking-tighter">Cuentas por Cobrar</h1>
                                <div className="flex items-center gap-3 mt-1">
                                    <span className="text-[10px] font-black text-brand-primary uppercase tracking-widest opacity-70">
                                        Deuda Total Consolidada:
                                    </span>
                                    <span className="text-sm font-black text-brand-primary font-mono bg-brand-secondary/10 px-3 py-0.5 rounded-lg border border-brand-secondary/20">
                                        ${totalDebt.toLocaleString('es-CL')}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-12 max-w-7xl mx-auto">
                    {/* SECCIÓN PACIENTES */}
                    <ReceivablesTable 
                        receivables={patientReceivables} 
                        title="Copagos de Pacientes"
                        subtitle="Cobros directos en Recepción / Caja"
                        icon={Users}
                    />

                    {/* SECCIÓN ASEGURADORAS */}
                    <ReceivablesTable 
                        receivables={insurerReceivables} 
                        title="Cobranza a Aseguradoras"
                        subtitle="Bonificaciones pendientes (Isapres / Fonasa / Seguros)"
                        icon={Shield}
                    />
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
