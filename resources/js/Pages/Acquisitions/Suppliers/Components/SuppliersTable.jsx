import React, { useMemo } from 'react';
import { useReactTable, getCoreRowModel, getPaginationRowModel, flexRender } from '@tanstack/react-table';

export default function SuppliersTable({ suppliers, openModal }) {
    const data = useMemo(() => suppliers, [suppliers]);

    const columns = useMemo(() => [
        {
            accessorKey: 'name',
            header: 'Nombre',
        },
        {
            accessorKey: 'rut',
            header: 'RUT',
        },
        {
            accessorKey: 'contact_person',
            header: 'Contacto',
        },
        {
            accessorKey: 'email',
            header: 'Email',
        },
        {
            accessorKey: 'phone',
            header: 'Teléfono',
        },
        {
            id: 'actions',
            cell: ({ row }) => (
                <button onClick={() => openModal(row.original)} className="text-brand-primary hover:underline">Editar</button>
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
