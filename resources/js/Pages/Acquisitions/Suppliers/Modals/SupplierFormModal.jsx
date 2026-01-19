import React from 'react';
import { useForm } from '@inertiajs/react';
import PrimaryButton from '@/components/PrimaryButton';
import SecondaryButton from '@/components/SecondaryButton';

export default function SupplierFormModal({ supplier, closeModal }) {
    const { data, setData, post, put, processing, errors } = useForm({
        name: supplier?.name || '',
        rut: supplier?.rut || '',
        contact_person: supplier?.contact_person || '',
        email: supplier?.email || '',
        phone: supplier?.phone || '',
        address: supplier?.address || '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        if (supplier) {
            put(route('acquisitions.suppliers.update', supplier.id), {
                onSuccess: () => closeModal(),
            });
        } else {
            post(route('acquisitions.suppliers.store'), {
                onSuccess: () => closeModal(),
            });
        }
    };

    return (
        <form onSubmit={handleSubmit} className="p-6">
            <h2 className="text-2xl font-black text-gray-900">{supplier ? 'Editar Proveedor' : 'Nuevo Proveedor'}</h2>
            <div className="mt-6 space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Nombre</label>
                    <input type="text" value={data.name} onChange={e => setData('name', e.target.value)} className="w-full mt-1 border-gray-300 rounded-md shadow-sm" />
                    {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
                </div>
                {/* ... other fields ... */}
            </div>
            <div className="flex justify-end mt-6 space-x-4">
                <SecondaryButton onClick={closeModal}>Cancelar</SecondaryButton>
                <PrimaryButton type="submit" disabled={processing}>{supplier ? 'Guardar Cambios' : 'Crear Proveedor'}</PrimaryButton>
            </div>
        </form>
    );
}
