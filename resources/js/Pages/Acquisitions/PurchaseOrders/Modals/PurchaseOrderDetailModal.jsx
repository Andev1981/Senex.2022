import React from 'react';
import PrimaryButton from '@/components/PrimaryButton';
import SecondaryButton from '@/components/SecondaryButton';

export default function PurchaseOrderDetailModal({ order, closeModal }) {
    const renderActionButtons = () => {
        if (!order) return null;

        switch (order.status) {
            case 'draft':
                return <PrimaryButton>Enviar a Aprobación</PrimaryButton>;
            case 'pending_approval':
                return (
                    <>
                        <PrimaryButton>Aprobar Orden</PrimaryButton>
                        <SecondaryButton>Rechazar</SecondaryButton>
                    </>
                );
            case 'approved':
                return <PrimaryButton>Marcar como Recepcionada</PrimaryButton>;
            default:
                return null;
        }
    };

    return (
        <div className="p-6">
            <h2 className="text-2xl font-black text-gray-900">{order ? `Orden de Compra #${order.folio}` : 'Nueva Orden de Compra'}</h2>

            <div className="mt-6">
                <p><strong>Proveedor:</strong> {order?.supplier.name}</p>
                <p><strong>Monto Total:</strong> ${order?.total_amount.toLocaleString('es-CL')}</p>
                <p><strong>Estado:</strong> {order?.status}</p>
            </div>

            <div className="mt-6">
                <h3 className="text-lg font-bold">Ítems</h3>
                {/* Aquí va el listado de ítems */}
            </div>

            <div className="flex justify-end mt-6 space-x-4">
                <SecondaryButton onClick={closeModal}>Cerrar</SecondaryButton>
                {renderActionButtons()}
            </div>
        </div>
    );
}
