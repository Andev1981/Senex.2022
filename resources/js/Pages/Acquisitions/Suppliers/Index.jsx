import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { Truck, Plus } from 'lucide-react';
import SideModal from '@/Components/SideModal';
import SuppliersTable from './Components/SuppliersTable';
import SupplierFormModal from './Modals/SupplierFormModal';
import Tabs from '../Tabs';

export default function Index({ suppliers = [] }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedSupplier, setSelectedSupplier] = useState(null);

    const openModal = (supplier) => {
        setSelectedSupplier(supplier);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedSupplier(null);
    };

    return (
        <AuthenticatedLayout>
            <Head title="Proveedores" />
            <div className="min-h-screen p-6 bg-gray-50/50 space-y-8">
                {/* HEADER HERO */}
                <div className="p-8 bg-white border border-gray-100 shadow-sm rounded-enterprise">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="flex items-center justify-center w-14 h-14 bg-brand-primary rounded-2xl">
                                <Truck className="w-7 h-7 text-white" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-black text-gray-900">Gestión de Proveedores</h1>
                                <p className="enterprise-label text-brand-gray">Maestro de Proveedores y Contactos</p>
                            </div>
                        </div>
                        <button onClick={() => openModal(null)} className="flex items-center gap-2 px-4 py-2 text-white bg-brand-primary rounded-lg">
                            <Plus className="w-5 h-5" />
                            Nuevo Proveedor
                        </button>
                    </div>
                </div>

                <Tabs />

                <div className="bg-white border border-gray-100 shadow-sm rounded-enterprise">
                    <div className="p-6 border-b border-gray-100">
                        <h2 className="text-xl font-black text-gray-900">Proveedores</h2>
                    </div>
                    <SuppliersTable suppliers={suppliers} openModal={openModal} />
                </div>
            </div>

            {/* FORM MODAL */}
            <SideModal open={isModalOpen} onClose={closeModal} width="3xl">
                <SupplierFormModal supplier={selectedSupplier} closeModal={closeModal} />
            </SideModal>
        </AuthenticatedLayout>
    );
}
