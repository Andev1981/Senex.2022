import { useState, useMemo } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  getFilteredRowModel,
  flexRender,
} from "@tanstack/react-table";
import {
  ChevronDown,
  ChevronUp,
  Pencil,
  Trash2,
  Search,
  BrickWallShield,
  Plus,
  ListCheck,
  Layers,
  Database,
  CheckCircle2,
  XCircle,
  Users,
  DollarSign
} from "lucide-react";
import PrimaryButton from "@/Components/PrimaryButton";
import TablePagination from "@/Components/TablePagination";
import { fmtCLP } from "@/utils/utils";

export default function TablePlans({
  plans,
  insurance,
  handleOpenModalPlanEdit,
  handleOpenModalPlanDelete,
}) {
  const [sorting, setSorting] = useState([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [pageSize, setPageSize] = useState(10);
  const [pageIndex, setPageIndex] = useState(0);

  const data = useMemo(() => plans || [], [plans]);

  const columns = useMemo(() => [
    {
        accessorKey: "name",
        header: "Nombre del Plan",
        cell: ({ getValue, row }) => (
            <div className="flex items-center gap-3">
                <div className="p-2 bg-brand-primary/10 text-brand-primary rounded-xl">
                    <Database className="w-4 h-4" />
                </div>
                <div>
                    <p className="text-[11px] font-black text-gray-900 uppercase tracking-tight leading-none mb-1">{getValue()}</p>
                    <p className="font-mono text-[9px] font-bold text-gray-400 uppercase">Ref: {row.original.code || 'S/C'}</p>
                </div>
            </div>
        )
    },
    {
        accessorKey: "billing_type",
        header: "Facturación",
        cell: ({ getValue }) => (
            <div className="px-3 py-1 bg-gray-50 rounded-lg border border-gray-100 w-fit">
                <span className="text-[9px] font-black text-gray-600 uppercase tracking-widest">{getValue() || 'Estándar'}</span>
            </div>
        )
    },
    {
        accessorKey: "is_family",
        header: "Alcance",
        cell: ({ getValue }) => (
            <div className={`flex items-center gap-2 px-2.5 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest border w-fit ${getValue() ? 'bg-purple-50 text-purple-600 border-purple-100' : 'bg-gray-50 text-gray-400 border-gray-100'}`}>
                <Users className="w-3 h-3" />
                {getValue() ? 'Familiar' : 'Individual'}
            </div>
        )
    },
    {
        accessorKey: "coverage_percentage",
        header: "Cobertura",
        cell: ({ getValue }) => (
            <div className="text-center font-mono font-black text-xs text-brand-primary">
                {getValue()}%
            </div>
        )
    },
    {
        accessorKey: "is_active",
        header: "Estado",
        cell: ({ getValue }) => (
            <div className="text-center">
                <span className={`inline-flex items-center px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest border ${
                    getValue() ? 'bg-green-50 text-green-600 border-green-100' : 'bg-red-50 text-red-600 border-red-100'
                }`}>
                    {getValue() ? 'Activo' : 'Baja'}
                </span>
            </div>
        )
    },
    {
        id: "actions",
        header: "Acciones",
        cell: ({ row }) => (
          <div className="flex items-center justify-end gap-1">
            <button
              className="p-2 text-gray-400 hover:text-brand-primary hover:bg-brand-secondary/10 rounded-xl transition-all active:scale-90"
              onClick={() => handleOpenModalPlanEdit(row.original)}
            >
              <Pencil className="w-4 h-4" />
            </button>
            <button
              className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all active:scale-90"
              onClick={() => handleOpenModalPlanDelete(row.original)}
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ),
        enableSorting: false,
    }
  ], [handleOpenModalPlanEdit, handleOpenModalPlanDelete]);

  const table = useReactTable({
    data,
    columns,
    state: { sorting, globalFilter, pagination: { pageSize, pageIndex } },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    onPaginationChange: (updater) => {
      const newState = typeof updater === "function" ? updater({ pageIndex, pageSize }) : updater;
      setPageIndex(newState.pageIndex);
      setPageSize(newState.pageSize);
    },
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    globalFilterFn: "includesString",
  });

  return (
    <div className="flex flex-col h-full bg-white animate-in fade-in duration-500">
      {/* HEADER HERO INTERNO */}
      <div className="p-8 bg-gray-50/50 border-b border-gray-100 flex items-center justify-between gap-6 shrink-0 rounded-t-[2rem]">
        <div className="flex items-center gap-4">
            <div className="p-3 bg-brand-primary text-white rounded-2xl shadow-xl shadow-brand-primary/20 transform rotate-3">
                <ListCheck className="w-6 h-6" />
            </div>
            <div>
                <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight leading-none mb-1">Portafolio de Planes</h2>
                <p className="text-[10px] font-black text-brand-gray uppercase tracking-[0.2em] flex items-center gap-2">
                    <BrickWallShield className="w-3.5 h-3.5 opacity-40" /> {insurance?.name}
                </p>
            </div>
        </div>
        <button
            onClick={() => handleOpenModalPlanEdit()}
            className="flex items-center gap-3 px-6 py-3 font-black uppercase tracking-widest text-[9px] text-white transition-all bg-brand-primary rounded-xl shadow-lg shadow-brand-primary/20 hover:brightness-110 active:scale-95"
        >
            <Plus className="w-4 h-4" /> Nuevo Plan
        </button>
      </div>

      <div className="flex-1 p-8 space-y-6 overflow-y-auto custom-scrollbar">
        {/* FILTRO RÁPIDO */}
        <div className="relative group max-w-md">
          <Search className="absolute w-4 h-4 text-brand-gray transform -translate-y-1/2 left-4 top-1/2 group-focus-within:text-brand-primary transition-colors" />
          <input
            value={globalFilter ?? ""}
            onChange={(e) => setGlobalFilter(e.target.value)}
            placeholder="Buscar por nombre o código..."
            className="w-full py-3.5 pl-12 pr-4 border-gray-100 bg-gray-50 rounded-2xl focus:bg-white focus:ring-4 focus:ring-brand-primary/5 focus:border-brand-primary text-xs font-bold transition-all outline-none"
          />
        </div>

        {/* TABLA TANSTACK COMPACTA */}
        <div className="bg-white border border-gray-100 shadow-xl rounded-[2rem] overflow-hidden">
            <div className="overflow-x-auto custom-scrollbar">
                <table className="w-full border-collapse">
                    <thead>
                        {table.getHeaderGroups().map(headerGroup => (
                            <tr key={headerGroup.id} className="bg-gray-50/50 border-b border-gray-100">
                                {headerGroup.headers.map(header => (
                                    <th key={header.id} className="px-6 py-4 text-left select-none group cursor-pointer" onClick={header.column.getToggleSortingHandler()}>
                                        <div className={`flex items-center gap-2 ${header.column.id === 'actions' ? 'justify-end' : ''} ${['is_active', 'coverage_percentage'].includes(header.column.id) ? 'justify-center' : ''}`}>
                                            <span className="enterprise-label !mb-0 text-gray-900 group-hover:text-brand-primary transition-colors">
                                                {flexRender(header.column.columnDef.header, header.getContext())}
                                            </span>
                                            {header.column.getCanSort() && (
                                                header.column.getIsSorted() === "asc" ? <ChevronUp className="w-3 h-3 text-brand-primary" /> : <ChevronDown className="w-3 h-3 text-brand-primary" />
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
                                        <td key={cell.id} className="px-6 py-3 whitespace-nowrap">
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </td>
                                    ))}
                                </tr>
                            ))
                        ) : (
                            <tr><td colSpan="6" className="py-20 text-center opacity-30 enterprise-label italic">Sin planes configurados para esta entidad</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
            <div className="bg-gray-50/30 border-t border-gray-100">
                <TablePagination table={table} total={plans.length} pageSize={pageSize} setPageSize={setPageSize} pageSizeOptions={[5, 10, 20]} />
            </div>
        </div>
      </div>
    </div>
  );
}