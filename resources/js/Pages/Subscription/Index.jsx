import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import { Gem, CheckCircle } from 'lucide-react';
import Modal from '@/components/Modal';
import PrimaryButton from '@/components/PrimaryButton';
import SecondaryButton from '@/components/SecondaryButton';

export default function Index({ saasPlans, subscription }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState(null);
    const { post, processing } = useForm();

    const openModal = (plan) => {
        setSelectedPlan(plan);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedPlan(null);
    };

    const handleSubmit = () => {
        post(route('subscription.store', { saas_plan_id: selectedPlan.id }), {
            onSuccess: () => closeModal(),
        });
    };

    return (
        <AuthenticatedLayout>
            <Head title="Mi Suscripción" />
            <div className="min-h-screen p-6 bg-gray-50/50 space-y-8">
                <div className="p-8 bg-white border border-gray-100 shadow-sm rounded-xl">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center justify-center w-14 h-14 bg-brand-primary rounded-2xl">
                            <Gem className="w-7 h-7 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-black text-gray-900">Mi Suscripción</h1>
                            <p className="enterprise-label text-brand-gray">
                                {subscription ? `Plan actual: ${subscription.saas_plan.name}` : 'No tienes un plan activo'}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {saasPlans.map((plan) => (
                        <div key={plan.id} className={`p-8 bg-white border-2 rounded-xl-xl ${subscription?.saas_plan_id === plan.id ? 'border-brand-primary' : 'border-gray-100'}`}>
                            <h2 className="text-2xl font-black text-gray-900">{plan.name}</h2>
                            <p className="mt-2 text-4xl font-black text-gray-900">${plan.price_monthly.toLocaleString('es-CL')} <span className="text-base font-medium text-gray-500">/ mes</span></p>
                            <ul className="mt-6 space-y-4">
                                {plan.features.map((feature, index) => (
                                    <li key={index} className="flex items-center gap-3">
                                        <CheckCircle className="w-5 h-5 text-green-500" />
                                        <span>{feature}</span>
                                    </li>
                                ))}
                            </ul>
                            <button
                                onClick={() => openModal(plan)}
                                disabled={subscription?.saas_plan_id === plan.id}
                                className="w-full mt-8 px-6 py-3 text-white bg-brand-primary rounded-lg disabled:bg-gray-300"
                            >
                                {subscription?.saas_plan_id === plan.id ? 'Plan Actual' : 'Seleccionar Plan'}
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            <Modal open={isModalOpen} onClose={closeModal}>
                <div className="p-6">
                    <h2 className="text-2xl font-black text-gray-900">Confirmar Suscripción</h2>
                    {selectedPlan && (
                        <>
                            <p className="mt-4">Estás a punto de suscribirte al plan <strong>{selectedPlan.name}</strong> por <strong>${selectedPlan.price_monthly.toLocaleString('es-CL')} / mes</strong>.</p>
                            <div className="mt-6 space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Número de Tarjeta</label>
                                    <input type="text" className="w-full mt-1 border-gray-300 rounded-md shadow-sm" placeholder="**** **** **** 1234" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Expiración</label>
                                        <input type="text" className="w-full mt-1 border-gray-300 rounded-md shadow-sm" placeholder="MM/YY" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">CVC</label>
                                        <input type="text" className="w-full mt-1 border-gray-300 rounded-md shadow-sm" placeholder="123" />
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                    <div className="flex justify-end mt-6 space-x-4">
                        <SecondaryButton onClick={closeModal}>Cancelar</SecondaryButton>
                        <PrimaryButton onClick={handleSubmit} disabled={processing}>Confirmar y Pagar</PrimaryButton>
                    </div>
                </div>
            </Modal>
        </AuthenticatedLayout>
    );
}
