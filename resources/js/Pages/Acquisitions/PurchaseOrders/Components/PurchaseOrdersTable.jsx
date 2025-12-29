import React, { useMemo } from 'react';
import { useReactTable, getCoreRowModel, getPaginationRowModel, flexRender } from '@tanstack/react-table';

export default function PurchaseOrdersTable({ purchaseOrders, openModal }) {
    const data = useMemo(() => purchaseOrders, [purchaseOrders]);

    const columns = useMemo(() => [
        {
            accessorKey: 'folio',
            header: 'Folio',
        },
        {
            accessorKey: 'supplier.name',
            header: 'Proveedor',
        },
        {
            accessorKey: 'total_amount',
            header: 'Monto Total',
            cell: info => `$${info.getValue().toLocaleString('es-CL')}`
        },
        {
            accessorKey: 'status',
            header: 'Estado',
            cell: ({ getValue }) => {
                const status = getValue();
                const config = {
                    draft: { label: 'Borrador', class: 'bg-gray-200 text-gray-800' },
                    pending_approval: { label: 'Pendiente Aprobación', class: 'bg-yellow-200 text-yellow-800' },
                    approved: { label: 'Aprobada', class: 'bg-blue-200 text-blue-800' },
                    received: { label: 'Recepcionada', class: 'bg-green-200 text-green-800' },
                    cancelled: { label: 'Cancelada', class: 'bg-red-200 text-red-800' },
                }[status] || { label: status, class: 'bg-gray-200 text-gray-800' };

                return <span className={`px-2 py-1 text-xs font-bold rounded-full ${config.class}`}>{config.label}</span>
            }
        },
        {
            id: 'actions',
            cell: ({ row }) => (
                <button onClick={() => openModal(row.original)} className="text-brand-primary hover:underline">Revisar</button>
            ),
        },
    ], [openModal]);

    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
    });

    return (
        <div className="overflow-x-auto">
            <table className="w-full">
                <thead>
                    {table.getHeaderGroups().map(headerGroup => (
                        <tr key={headerGroup.id}>
                            {headerGroup.headers.map(header => (
                                <th key={header.id} className="p-4 text-left enterprise-label">
                                    {flexRender(header.column.columnDef.header, header.getContext())}
                                </th>
                            ))}
                        </tr>
                    ))}
                </thead>
                <tbody>
                    {table.getRowModel().rows.map(row => (
                        <tr key={row.id} className="border-b">
                            {row.getVisibleCells().map(cell => (
                                <td key={cell.id} className="p-4">
                                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
