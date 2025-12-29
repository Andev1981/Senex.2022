import React, { useMemo } from 'react';
import { useReactTable, getCoreRowModel, getPaginationRowModel, flexRender } from '@tanstack/react-table';

export default function ReceivablesTable({ receivables }) {
    const data = useMemo(() => receivables, [receivables]);

    const columns = useMemo(() => [
        {
            accessorKey: 'payable.name',
            header: 'Nombre',
        },
        {
            accessorKey: 'amount',
            header: 'Monto Adeudado',
            cell: info => `$${info.getValue().toLocaleString('es-CL')}`
        },
        {
            accessorKey: 'due_date',
            header: 'Fecha Vencimiento',
        },
        {
            id: 'actions',
            cell: ({ row }) => (
                <button className="text-brand-primary hover:underline">Registrar Pago</button>
            ),
        },
    ], []);

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
