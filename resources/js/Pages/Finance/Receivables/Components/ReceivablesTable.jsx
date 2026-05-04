import React, { useMemo, useState } from 'react';
import { 
    useReactTable, 
    getCoreRowModel, 
    getPaginationRowModel, 
    getSortedRowModel,
    flexRender 
} from '@tanstack/react-table';
import { 
    ChevronDown, 
    ChevronUp, 
    DollarSign, 
    Calendar, 
    AlertCircle,
    CheckCircle2
} from 'lucide-react';
import { router } from '@inertiajs/react';
import TablePagination from '@/components/TablePagination';
import Swal from 'sweetalert2';

export default function ReceivablesTable({ receivables = [], title, subtitle, icon: Icon }) {
    const [sorting, setSorting] = useState([]);
    const [pageSize, setPageSize] = useState(10);
    const [pageIndex, setPageIndex] = useState(0);

    const handleAction = (r) => {
        if (r.insurance_id) {
            // Caso Aseguradora: Liquidación Manual
            Swal.fire({
                title: '¿Confirmar Cobro de Aseguradora?',
                text: `Se marcará como liquidado el monto de $${r.amount_clp.toLocaleString('es-CL')} de ${r.insurance.name}.`,
                icon: 'question',
                showCancelButton: true,
                confirmButtonText: 'Sí, registrar pago',
                cancelButtonText: 'Cancelar',
                confirmButtonColor: '#21235b'
            }).then((result) => {
                if (result.isConfirmed) {
                    router.post(route('finance.receivables.settle', r.id), {}, {
                        onSuccess: () => Swal.fire('¡Éxito!', 'Pago de aseguradora registrado.', 'success')
                    });
                }
            });
        } else {
            // Caso Paciente: Ir a Caja (POS)
            router.get(route('payments.index'), { patient_id: `person_${r.patient_id}` });
        }
    };

    const data = useMemo(() => receivables, [receivables]);

    const columns = useMemo(() => [
// ... (rest of columns)
        {
            header: 'Deudor / Concepto',
            cell: ({ row }) => {
                const r = row.original;
                const name = r.insurance?.name || r.patient?.full_name || r.patient?.name || 'S/N';
                const type = r.insurance_id ? 'Previsión' : 'Copago Paciente';
                return (
                    <div className="flex items-center gap-4">
                        <div className={`flex items-center justify-center w-10 h-10 text-xs font-black uppercase border shadow-sm rounded-xl shrink-0 ${
                            r.insurance_id ? 'text-purple-600 bg-purple-50 border-purple-100' : 'text-brand-primary bg-brand-secondary/10 border-brand-secondary/20'
                        }`}>
                            {name[0]}
                        </div>
                        <div className="flex flex-col min-w-0">
                            <span className="text-sm font-black text-gray-900 uppercase tracking-tight truncate leading-none mb-1.5">{name}</span>
                            <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">{type}</span>
                        </div>
                    </div>
                );
            }
        },
        {
            accessorKey: 'amount_clp',
            header: 'Monto Adeudado',
            cell: info => {
                const val = info.getValue();
                return (
                    <div className="text-right">
                        <span className="font-mono text-sm font-black text-brand-primary">
                            {typeof val === 'number' ? `$${val.toLocaleString('es-CL')}` : '$0'}
                        </span>
                    </div>
                );
            }
        },
        {
            accessorKey: 'due_date',
            header: 'Vencimiento',
            cell: info => {
                const date = info.getValue();
                const isOverdue = date && new Date(date) < new Date();
                return (
                    <div className="flex items-center gap-2">
                        <Calendar className={`w-3.5 h-3.5 ${isOverdue ? 'text-red-400' : 'text-gray-300'}`} />
                        <span className={`text-[10px] font-black uppercase tracking-widest ${isOverdue ? 'text-red-600' : 'text-gray-600'}`}>
                            {date ? new Date(date).toLocaleDateString('es-CL', { day: 'numeric', month: 'short' }) : 'Inmediato'}
                        </span>
                    </div>
                );
            }
        },
        {
            accessorKey: 'status',
            header: 'Estado',
            cell: ({ getValue }) => {
                const status = getValue();
                return (
                    <div className="text-center">
                        <span className={`inline-flex items-center px-3 py-1 rounded-lg text-[8px] font-black uppercase tracking-[0.2em] shadow-sm border ${
                            status === 'pending' ? 'bg-amber-50 border-amber-100 text-amber-600' : 'bg-red-50 border-red-100 text-red-600'
                        }`}>
                            {status === 'pending' ? 'Pendiente' : status}
                        </span>
                    </div>
                );
            }
        },
        {
            id: 'actions',
            header: 'Gestión',
            cell: ({ row }) => (
                <div className="flex justify-end">
                    <button 
                        onClick={() => handleAction(row.original)}
                        className="flex items-center gap-2 px-5 py-2.5 bg-gray-900 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-black hover:scale-105 active:scale-95 transition-all shadow-lg shadow-gray-200"
                    >
                        <DollarSign className="w-3 h-3" />
                        Registrar Cobro
                    </button>
                </div>
            ),
            enableSorting: false,
        },
    ], []);

    const table = useReactTable({
        data,
        columns,
        state: {
            sorting,
            pagination: { pageSize, pageIndex },
        },
        onSortingChange: setSorting,
        onPaginationChange: (updater) => {
            const newState = typeof updater === "function" ? updater({ pageIndex, pageSize }) : updater;
            setPageIndex(newState.pageIndex);
            setPageSize(newState.pageSize);
        },
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
    });

    return (
        <div className="bg-white border border-gray-100 shadow-xl rounded-[2.5rem] overflow-hidden flex flex-col duration-700 animate-in fade-in">
            {/* Header Integrado */}
            <div className="flex items-center justify-between p-6 border-b border-gray-50 bg-gray-50/30">
                <div className="flex items-center gap-4">
                    {Icon && (
                        <div className="w-10 h-10 bg-white border border-gray-100 rounded-xl flex items-center justify-center text-brand-primary shadow-sm">
                            <Icon className="w-5 h-5" />
                        </div>
                    )}
                    <div>
                        <h2 className="text-sm font-black text-gray-900 uppercase tracking-tight leading-none mb-1">{title}</h2>
                        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">{subtitle}</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <span className="text-[9px] font-black text-brand-gray uppercase tracking-[0.2em] bg-white px-4 py-1.5 rounded-xl shadow-sm border border-gray-100">
                        {receivables.length} Registros Pendientes
                    </span>
                </div>
            </div>

            <div className="w-full overflow-x-auto custom-scrollbar">
                <table className="w-full border-collapse">
                    <thead>
                        {table.getHeaderGroups().map(headerGroup => (
                            <tr key={headerGroup.id} className="bg-gray-50/50 border-b border-gray-100">
                                {headerGroup.headers.map(header => (
                                    <th 
                                        key={header.id} 
                                        onClick={header.column.getToggleSortingHandler()}
                                        className="px-8 py-5 text-left cursor-pointer select-none group"
                                    >
                                        <div className={`flex items-center gap-2 ${
                                            header.column.id === 'amount_clp' ? 'justify-end' : ''
                                        } ${
                                            ['status'].includes(header.column.id) ? 'justify-center' : ''
                                        } ${
                                            header.column.id === 'actions' ? 'justify-end' : ''
                                        }`}>
                                            <span className="enterprise-label !mb-0 text-gray-900 group-hover:text-brand-primary transition-colors">
                                                {flexRender(header.column.columnDef.header, header.getContext())}
                                            </span>
                                            {header.column.getCanSort() && (
                                                <div className="transition-opacity opacity-0 group-hover:opacity-100">
                                                    {header.column.getIsSorted() === "asc" ? <ChevronUp className="w-3 h-3 text-brand-primary" /> : <ChevronDown className="w-3 h-3 text-brand-primary" />}
                                                </div>
                                            )}
                                        </div>
                                    </th>
                                ))}
                            </tr>
                        ))}
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {table.getRowModel().rows.length > 0 ? (
                            table.getRowModel().rows.map(row => (
                                <tr key={row.id} className="hover:bg-brand-secondary/5 transition-all group">
                                    {row.getVisibleCells().map(cell => (
                                        <td key={cell.id} className="px-8 py-4 whitespace-nowrap">
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </td>
                                    ))}
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={columns.length} className="py-24 text-center">
                                    <div className="flex flex-col items-center justify-center space-y-4 opacity-30">
                                        <div className="p-6 bg-gray-50 rounded-[2.5rem]">
                                            <AlertCircle className="w-12 h-12 text-gray-400" />
                                        </div>
                                        <p className="enterprise-label">No hay cuentas pendientes en esta categoría</p>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
            {data.length > pageSize && (
                <div className="bg-gray-50/30 border-t border-gray-100">
                    <TablePagination 
                        table={table} 
                        total={data.length} 
                        pageSize={pageSize} 
                        setPageSize={setPageSize} 
                        pagesizeOptions={[5, 10, 20]} 
                    />
                </div>
            )}
        </div>
    );
}
