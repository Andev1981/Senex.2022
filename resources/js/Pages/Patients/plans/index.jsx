import React, { useState } from 'react';
import { usePage } from '@inertiajs/react';
import { Plus } from 'lucide-react';
import PlanPurchaseModal from './plan-purchase-modal'; // Vamos a crear este componente

const PatientPlansIndex = ({ patient }) => {
  const { auth } = usePage().props;
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);

  // Helper para formatear fechas
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg border border-gray-100">
        <div className="p-6 text-gray-900">
          <h3 className="text-lg font-bold text-gray-900 mb-4">
            Planes Contratados
          </h3>
          {patient.patient_plans && patient.patient_plans.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Plan
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Sesiones
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Estado
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Expira
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {patient.patient_plans.map((pp) => (
                    <tr key={pp.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{pp.plan?.name || 'Plan Desconocido'}</div>
                        <div className="text-xs text-gray-500">{pp.plan?.code}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {pp.sessions_used} / {pp.sessions_included || 'Ilimitadas'}
                        </div>
                        <div className="text-xs text-gray-500">
                          Restantes: {pp.sessions_included ? (pp.sessions_included - pp.sessions_used) : 'Ilimitadas'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          pp.status === 'active' ? 'bg-green-100 text-green-800' :
                          pp.status === 'exhausted' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {pp.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(pp.expiry_date)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        {/* Aquí irán las acciones como ver detalles, pausar, etc. */}
                        <a href="#" className="text-indigo-600 hover:text-indigo-900">Ver</a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-600">Este paciente no tiene planes contratados.</p>
          )}
        </div>
      </div>

      <div className="p-6 border-t border-gray-200 bg-white shadow-sm sm:rounded-lg flex justify-end">
        <button
          onClick={() => setShowPurchaseModal(true)}
          className="group flex items-center gap-2 px-4 py-2 bg-brand-primary text-white rounded-md text-sm font-medium hover:brightness-110 shadow-lg shadow-brand-primary/20 transition-all active:scale-95 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Comprar Nuevo Plan
        </button>
      </div>

      <PlanPurchaseModal
        show={showPurchaseModal}
        onClose={() => setShowPurchaseModal(false)}
        patient={patient}
      />
    </div>
  );
};

export default PatientPlansIndex;
