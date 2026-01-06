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
  Search,
  Settings,
  ArrowRight,
  User,
  Calendar,
  DollarSign,
  FileText,
  Trash2,
  CheckCircle2,
  Clock
} from "lucide-react";
import TablePagination from "@/Components/TablePagination";
import { router } from "@inertiajs/react";

export default function PayrollTable({ payrolls, onReview }) {
  const [sorting, setSorting] = useState([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [pageSize, setPageSize] = useState(10);
  const [pageIndex, setPageIndex] = useState(0);

  const data = useMemo(() => payrolls || [], [payrolls]);

  const columns = useMemo(() => [
    {
        accessorKey: "doctor.full_name",
        header: "Profesional",
        cell: ({ row }) => (
            <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-gray-100 text-gray-400 flex items-center justify-center border border-gray-200 shrink-0 transform rotate-2">
                    <User className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                    <p className="text-sm font-black text-gray-900 uppercase tracking-tight truncate leading-none mb-1">
                        {row.original.doctor?.name} {row.original.doctor?.last_name}
                    </p>
                    <p className="text-[9px] font-black text-brand-gray opacity-60 uppercase tracking-widest font-mono">ID #{row.original.id}</p>
                </div>
            </div>
        )
    },
    {
        id: "period",
        header: "Período Auditado",
        cell: ({ row }) => {
            const start = new Date(row.original.period_start).toLocaleDateString("es-CL");
            const end = new Date(row.original.period_end).toLocaleDateString("es-CL");
            return (
                <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-brand-primary opacity-40" />
                    <span className="text-[10px] font-black text-gray-700 uppercase tracking-tight">
                        {start} → {end}
                    </span>
                </div>
            );
        }
    },
    {
        accessorKey: "total_sessions",
        header: "Sesiones",
        cell: ({ getValue }) => (
            <div className="flex items-center justify-center w-full">
                <span className="font-mono text-xs font-bold text-gray-600 bg-gray-100 px-2 py-1 rounded-md">
                    {getValue() || 0}
                </span>
            </div>
        )
    },
    {
        accessorKey: "total_commission_amount_clp",
        header: "Retención Clínica",
        cell: ({ getValue }) => {
            const value = getValue();
            const amount = value ? parseInt(value) : 0;
            return (
                <div className="font-mono text-[11px] font-black text-red-500 bg-red-50 px-3 py-1.5 rounded-lg border border-red-100 w-fit">
                    ${amount.toLocaleString("es-CL")}
                </div>
            );
        }
    },
    {
        accessorKey: "total_payable_clp",
        header: "Honorarios (CLP)",
        cell: ({ getValue }) => {
            const value = getValue();
            const amount = value ? parseInt(value) : 0;
            return (
                <div className="font-mono text-[11px] font-black text-brand-primary bg-brand-secondary/5 px-3 py-1.5 rounded-lg border border-brand-secondary/10 w-fit">
                    ${amount.toLocaleString("es-CL")}
                </div>
            );
        }
    },
    {
        accessorKey: "status",
        header: "Estado",
        cell: ({ getValue }) => {
            const status = getValue();
            const config = {
                draft: { label: 'Borrador', class: 'bg-gray-50 text-gray-500 border-gray-100', icon: Clock },
                approved: { label: 'Aprobada', class: 'bg-blue-50 text-blue-600 border-blue-100', icon: CheckCircle2 },
                paid: { label: 'Pagada', class: 'bg-green-50 text-green-600 border-green-100', icon: CheckCircle2 }
            }[status] || { label: status, class: 'bg-gray-50 text-gray-500 border-gray-100', icon: Clock };
            
            const Icon = config.icon;
            
            return (
                <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[8px] font-black uppercase tracking-[0.2em] shadow-sm border ${config.class}`}>
                    <Icon className="w-3 h-3" />
                    {config.label}
                </div>
            );
        }
    },
    {
        id: "actions",
        header: "Operaciones",
        cell: ({ row }) => (
          <div className="flex items-center justify-end gap-1.5">
            <button 
                onClick={() => onReview(row.original.id)}
                className="p-2 text-brand-primary bg-brand-secondary/5 border border-brand-secondary/10 rounded-xl hover:bg-brand-primary hover:text-white transition-all active:scale-90 flex items-center gap-2 px-4"
            >
                <span className="text-[9px] font-black uppercase tracking-widest">Revisar</span>
                <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <div className="w-px h-6 bg-gray-100 mx-1"></div>
            <button 
                onClick={() => {
                    if(confirm('¿Desea eliminar esta liquidación?')) {
                        router.delete(route('payrolls.destroy', row.original.id));
                    }
                }}
                className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all active:scale-90"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ),
    }
  ], []);

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
    <div className="space-y-6 animate-in fade-in duration-700">
      {/* BUSCADOR PREMIUM */}
      <div className="p-6 bg-white border border-gray-100 shadow-sm rounded-3xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-brand-primary/5 rounded-full -mr-16 -mt-16 blur-2xl"></div>
        <div className="relative group max-w-xl z-10">
          <Search className="absolute w-4 h-4 text-brand-gray transform -translate-y-1/2 left-4 top-1/2 group-focus-within:text-brand-primary transition-colors" />
          <input
            value={globalFilter ?? ""}
            onChange={(e) => setGlobalFilter(e.target.value)}
            placeholder="Buscador inteligente de liquidaciones..."
            className="w-full py-4 pl-12 pr-4 border-gray-100 bg-gray-50 rounded-2xl focus:bg-white focus:ring-4 focus:ring-brand-primary/5 focus:border-brand-primary text-sm font-bold transition-all outline-none shadow-inner"
          />
        </div>
      </div>

      <div className="bg-white border border-gray-100 shadow-xl rounded-enterprise-xl overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-50 bg-gray-50/30">
          <h2 className="flex items-center gap-3 text-sm font-black text-gray-900 uppercase tracking-tight">
            <Settings className="w-5 h-5 text-brand-primary" /> Maestro de Liquidaciones
          </h2>
          <span className="text-[9px] font-black text-brand-gray uppercase tracking-[0.2em] bg-white px-4 py-1.5 rounded-xl shadow-sm border border-gray-100">
            {table.getFilteredRowModel().rows.length} Documentos
          </span>
        </div>

        <div className="w-full overflow-x-auto custom-scrollbar">
          <table className="w-full border-collapse">
            <thead>
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id} className="bg-gray-50/50">
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      onClick={header.column.getToggleSortingHandler()}
                      className="px-8 py-5 text-left select-none group cursor-pointer"
                    >
                      <div className={`flex items-center gap-2 ${header.column.id === 'actions' ? 'justify-end' : ''}`}>
                        <span className="enterprise-label !mb-0 text-gray-900 group-hover:text-brand-primary transition-colors">
                          {flexRender(header.column.columnDef.header, header.getContext())}
                        </span>
                        {header.column.getCanSort() && (
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity">
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
              {table.getRowModel().rows.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="px-8 py-24 text-center">
                    <div className="flex flex-col items-center justify-center space-y-4">
                        <div className="p-6 bg-gray-50 rounded-[2rem] text-gray-200">
                            <FileText className="w-12 h-12" />
                        </div>
                        <p className="enterprise-label opacity-40">No hay liquidaciones generadas</p>
                    </div>
                  </td>
                </tr>
              ) : (
                table.getRowModel().rows.map((row) => (
                  <tr key={row.id} className="hover:bg-brand-secondary/5 transition-all group">
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="px-8 py-3 whitespace-nowrap">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="p-6 border-t border-gray-100 bg-gray-50/30">
          <TablePagination
            table={table}
            total={payrolls.length}
            pageSize={pageSize}
            setPageSize={setPageSize}
            pageSizeOptions={[5, 10, 20]}
          />
        </div>
      </div>
    </div>
  );
}
