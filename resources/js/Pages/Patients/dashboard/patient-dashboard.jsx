import React from 'react';
import { Head } from '@inertiajs/react';
import AuthenticatedLayoutClient from '@/Layouts/AuthenticatedLayoutClient';
import PatientDashboardContent from './patient-dashboard-content';

export default function PatientPortalIndex(props) {
    const { patient } = props;
    
    return (
        <AuthenticatedLayoutClient>
            <Head title="Mi Portal de Paciente" />
            
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* SALUDO (Solo para el portal) */}
                <div className="mb-8">
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight">Hola, {patient.name} 👋</h1>
                    <p className="text-gray-500 font-medium">Bienvenido a tu resumen clínico y financiero.</p>
                </div>
                
                <PatientDashboardContent {...props} />
            </div>
        </AuthenticatedLayoutClient>
    );
}
