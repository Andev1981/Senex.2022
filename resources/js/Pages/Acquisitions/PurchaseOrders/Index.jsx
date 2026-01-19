import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { ShoppingCart, Plus } from 'lucide-react';
import SideModal from '@/components/SideModal';
import PurchaseOrdersTable from './components/PurchaseOrdersTable';
import PurchaseOrderDetailModal from './Modals/PurchaseOrderDetailModal';

import Tabs from '../Tabs';

export default function Index({ purchaseOrders = [] }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);

    const openModal = (order) => {
        setSelectedOrder(order);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedOrder(null);
    };

    return (
        <AuthenticatedLayout>
            <Head title="Órdenes de Compra" />
            <div className="min-h-screen p-6 bg-gray-50/50 space-y-8">
                {/* HEADER HERO */}
                <div className="p-8 bg-white border border-gray-100 shadow-sm rounded-xl">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="flex items-center justify-center w-14 h-14 bg-brand-primary rounded-2xl">
                                <ShoppingCart className="w-7 h-7 text-white" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-black text-gray-900">Central de Adquisiciones</h1>
                                <p className="enterprise-label text-brand-gray">Gestión de Proveedores y Órdenes de Compra</p>
                            </div>
                        </div>
                        <button onClick={() => openModal(null)} className="flex items-center gap-2 px-4 py-2 text-white bg-brand-primary rounded-lg">
                            <Plus className="w-5 h-5" />
                            Nueva Orden de Compra
                        </button>
                    </div>
                </div>

                <Tabs />

                <div className="bg-white border border-gray-100 shadow-sm rounded-xl">
                    <div className="p-6 border-b border-gray-100">
                        <h2 className="text-xl font-black text-gray-900">Órdenes de Compra</h2>
                    </div>
                    <PurchaseOrdersTable purchaseOrders={purchaseOrders} openModal={openModal} />
                </div>
            </div>

            {/* DETAIL MODAL */}
            <SideModal open={isModalOpen} onClose={closeModal} width="5xl">
                <PurchaseOrderDetailModal order={selectedOrder} closeModal={closeModal} />
            </SideModal>
        </AuthenticatedLayout>
    );
}
