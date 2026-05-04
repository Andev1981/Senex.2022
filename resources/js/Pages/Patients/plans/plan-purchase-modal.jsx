import React from 'react';
import SideModal from '@/components/SideModal';
import PlanPurchaseForm from './plan-purchase-form'; // Vamos a crear este componente

import { Layers } from 'lucide-react';

const PlanPurchaseModal = ({ show, onClose, patient }) => {
  return (
    <SideModal 
        open={show} 
        onClose={onClose} 
        width="4xl"
        title={`Venta de Pack: ${patient.name}`}
        subtitle="Asignación de programa de tratamiento y registro de pago"
        icon={Layers}
    >
        <PlanPurchaseForm patient={patient} onClose={onClose} />
    </SideModal>
  );
};

export default PlanPurchaseModal;
