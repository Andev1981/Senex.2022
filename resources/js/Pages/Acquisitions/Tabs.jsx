import React from 'react';
import { Link, usePage } from '@inertiajs/react';

export default function Tabs() {
    const { component } = usePage();

    const tabs = [
        { name: 'Órdenes de Compra', href: route('acquisitions.purchase-orders.index'), current: component === 'Acquisitions/PurchaseOrders/Index' },
        { name: 'Proveedores', href: route('acquisitions.suppliers.index'), current: component === 'Acquisitions/Suppliers/Index' },
    ];

    return (
        <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                {tabs.map((tab) => (
                    <Link
                        key={tab.name}
                        href={tab.href}
                        className={`${
                            tab.current
                                ? 'border-brand-primary text-brand-primary'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                        aria-current={tab.current ? 'page' : undefined}
                    >
                        {tab.name}
                    </Link>
                ))}
            </nav>
        </div>
    );
}
