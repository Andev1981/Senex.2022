import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { DollarSign } from 'lucide-react';
import ReceivablesTable from './Components/ReceivablesTable';

export default function Index({ totalDebt, patientReceivables, insurerReceivables }) {
    return (
        <AuthenticatedLayout>
            <Head title="Cuentas por Cobrar" />
            <div className="min-h-screen p-6 bg-gray-50/50 space-y-8">
                {/* HEADER HERO */}
                <div className="p-8 bg-white border border-gray-100 shadow-sm rounded-enterprise">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center justify-center w-14 h-14 bg-brand-primary rounded-2xl">
                            <DollarSign className="w-7 h-7 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-black text-gray-900">Cuentas por Cobrar</h1>
                            <p className="enterprise-label text-brand-gray">Deuda Total: ${totalDebt.toLocaleString('es-CL')}</p>
                        </div>
                    </div>
                </div>

                {/* PACIENTES */}
                <div className="bg-white border border-gray-100 shadow-sm rounded-enterprise">
                    <div className="p-6 border-b border-gray-100">
                        <h2 className="text-xl font-black text-gray-900">Copagos de Pacientes</h2>
                    </div>
                    <ReceivablesTable receivables={patientReceivables} />
                </div>

                {/* ASEGURADORAS */}
                <div className="bg-white border border-gray-100 shadow-sm rounded-enterprise">
                    <div className="p-6 border-b border-gray-100">
                        <h2 className="text-xl font-black text-gray-900">Cobranza a Aseguradoras</h2>
                    </div>
                    <ReceivablesTable receivables={insurerReceivables} />
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
