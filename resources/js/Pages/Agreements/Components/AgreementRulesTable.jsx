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
    Shield,
    DollarSign,
    Activity,
    Percent,
    ArrowRight
} from "lucide-react";
import TablePagination from "@/Components/TablePagination";

export default function AgreementRulesTable({
  rules,
  handleOpenModalDelete,
  setRuleToEdit,
}) {
  const [sorting, setSorting] = useState([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [pageSize, setPageSize] = useState(10);
  const [pageIndex, setPageIndex] = useState(0);

  const data = useMemo(() => rules || [], [rules]);

  const columns = useMemo(
    () => [
      {
        accessorKey: "plan.name",
        header: "Plan / Programa",
        cell: ({ getValue }) => (
          <div className="flex items-center gap-3">
              <div className="p-1.5 bg-gray-50 rounded-lg border border-gray-100">
                  <Shield className="w-3.5 h-3.5 text-brand-primary opacity-50" />
              </div>
              <span className="text-[10px] font-black text-gray-700 uppercase tracking-tight truncate max-w-[150px]">
                {getValue() || "REGLA GENERAL"}
              </span>
          </div>
        ),
      },
      {
        accessorKey: "session_type.name",
        header: "Prestación",
        cell: ({ getValue }) => (
          <div className="flex flex-col">
              <span className="text-[10px] font-black text-gray-900 uppercase tracking-tight leading-none mb-1">{getValue()}</span>
              <span className="text-[8px] font-bold text-brand-gray opacity-60 uppercase tracking-widest">Servicio Clínico</span>
          </div>
        ),
      },
      {
        accessorKey: "gross_price_clp",
        header: "Valor Bruto",
        cell: ({ getValue }) => (
          <div className="font-mono text-[11px] font-black text-gray-900 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100 w-fit">
              ${parseInt(getValue()).toLocaleString("es-CL")}
          </div>
        ),
      },
      {
        id: "coverage",
        header: "Estructura Cobertura",
        cell: ({ row }) => {
            const rule = row.original;
            return (
                <div className="flex items-center gap-4">
                    <div className="flex flex-col items-end">
                        <span className="text-[8px] font-black text-red-500 uppercase tracking-widest mb-0.5">Copago</span>
                        <span className="text-[10px] font-black text-red-700 font-mono">${parseInt(rule.patient_share_clp).toLocaleString("es-CL")} ({rule.patient_percentage}%)</span>
                    </div>
                    <div className="h-6 w-px bg-gray-100"></div>
                    <div className="flex flex-col items-start">
                        <span className="text-[8px] font-black text-brand-primary uppercase tracking-widest mb-0.5">Institución</span>
                        <span className="text-[10px] font-black text-brand-primary font-mono">${parseInt(rule.insurance_share_clp).toLocaleString("es-CL")} ({rule.insurance_percentage}%)</span>
                    </div>
                </div>
            )
        }
      },
      {
        id: "actions",
        header: "Operaciones",
        cell: ({ row }) => (
          <div className="flex items-center justify-end gap-1.5">
            <button
              onClick={() => setRuleToEdit(row?.original)}
              className="p-2 text-brand-primary hover:bg-brand-secondary/5 rounded-xl transition-all active:scale-90"
              title="Editar Tarifa"
            >
              <Pencil className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleOpenModalDelete(row?.original)}
              className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all active:scale-90"
              title="Eliminar"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ),
      },
    ],
    [handleOpenModalDelete, setRuleToEdit]
  );

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      globalFilter,
      pagination: { pageSize, pageIndex },
    },
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
    <div className="space-y-0">
      {/* BUSCADOR COMPACTO */}
      <div className="p-4 bg-gray-50/50 border-b border-gray-100 flex items-center justify-between gap-6">
        <div className="relative group flex-1 max-w-md">
          <Search className="absolute w-3.5 h-3.5 text-brand-gray transform -translate-y-1/2 left-4 top-1/2 group-focus-within:text-brand-primary transition-colors" />
          <input
            value={globalFilter ?? ""}
            onChange={(e) => setGlobalFilter(e.target.value)}
            placeholder="Filtrar por plan o prestación..."
            className="w-full py-2.5 pl-10 pr-4 border-gray-100 bg-white rounded-xl focus:ring-4 focus:ring-brand-primary/5 focus:border-brand-primary text-[11px] font-bold transition-all outline-none shadow-sm"
          />
        </div>
        <div className="flex items-center gap-2">
            <span className="text-[9px] font-black text-brand-gray uppercase tracking-widest bg-white px-3 py-1 rounded-lg border border-gray-100">
                {table.getFilteredRowModel().rows.length} Resultados
            </span>
        </div>
      </div>

      <div className="w-full overflow-x-auto custom-scrollbar">
        <table className="w-full border-collapse">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id} className="bg-gray-50/30">
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    onClick={header.column.getToggleSortingHandler()}
                    className="px-6 py-4 text-left select-none group cursor-pointer border-b border-gray-50"
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
                <td colSpan={columns.length} className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center justify-center space-y-3">
                        <div className="p-4 bg-gray-50 rounded-2xl text-gray-200">
                            <Activity className="w-8 h-8" />
                        </div>
                        <p className="enterprise-label opacity-40">No hay tarifas configuradas</p>
                    </div>
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row) => (
                <tr key={row.id} className="hover:bg-brand-secondary/5 transition-all group">
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-6 py-3 whitespace-nowrap">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="p-4 border-t border-gray-50 bg-gray-50/30">
        <TablePagination
          table={table}
          total={data.length}
          pageSize={pageSize}
          setPageSize={setPageSize}
          pagesizeOptions={[5, 10, 20]}
        />
      </div>
    </div>
  );
}
