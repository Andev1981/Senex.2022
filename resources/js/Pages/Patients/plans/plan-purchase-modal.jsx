import React from 'react';
import SideModal from '@/components/SideModal';
import PlanPurchaseForm from './plan-purchase-form'; // Vamos a crear este componente

const PlanPurchaseModal = ({ show, onClose, patient }) => {
  return (
    <SideModal open={show} onClose={onClose} width="5xl">
      <div className="p-6">
        <h2 className="text-2xl font-black text-gray-900 mb-6">Comprar Plan para {patient.name} {patient.last_name}</h2>
        <PlanPurchaseForm patient={patient} onClose={onClose} />
      </div>
    </SideModal>
  );
};

export default PlanPurchaseModal;
