import { useState, useMemo } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  getFilteredRowModel,
  flexRender,
} from "@tanstack/react-table";
import { ChevronDown, ChevronUp, Pencil, Trash2, Search,Box, Shield, ShieldCheck, Database,Clock  } from "lucide-react";
import PrimaryButton from "@/components/PrimaryButton";
import TablePagination from "@/components/TablePagination";

export default function TablePlans({
  plans,
  handleOpenModalEdit,
  handleOpenModalDelete,
}) {
  const [sorting, setSorting] = useState([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [pageSize, setPageSize] = useState(10);
  const [pageIndex, setPageIndex] = useState(0);

  const data = useMemo(() => plans || [], [plans]);

  const filteredData = useMemo(() => {
    if (!globalFilter) return data;
    const filter = globalFilter.toLowerCase();
    return data.filter((row) =>
      Object.values(row).some(
        (val) => val && val.toString().toLowerCase().includes(filter)
      )
    );
  }, [globalFilter, data]);

  const typeLabels = {
    internal: "Pack Interno",
    external: "Convenio Externo",
  };

  const columns = useMemo(
    () => [
      {
        accessorKey: "name",
        header: "Nombre del Programa / Pack",
        cell: ({ row }) => (
            <div className="flex items-center gap-4">
              <div className="flex items-center justify-center w-10 h-10 text-xs font-black uppercase border shadow-sm text-brand-primary rounded-xl bg-brand-secondary/10 border-brand-secondary/20 shrink-0">
                <Box className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-black text-gray-900 uppercase tracking-tight truncate leading-none mb-1.5">
                  {row.original.name}
                </p>
                <div className="flex items-center gap-2">
                  <span className="text-[9px] font-black text-brand-primary uppercase tracking-widest">
                    {row.original.code}
                  </span>
                </div>
              </div>
            </div>
          ),
      },
      {
        id: "parametros",
        header: "Contenido del Pack",
        cell: ({ row }) => (
            <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2 text-[10px] font-black text-gray-600 uppercase">
                    <Database className="w-3 h-3 text-brand-primary opacity-40" />
                    {row.original.sessions_included || '-'} Sesiones
                </div>
                <div className="flex items-center gap-2 text-[9px] font-bold text-gray-400 uppercase">
                    <Clock className="w-3 h-3 opacity-30" />
                    Validez: {row.original.valid_months ? `${row.original.valid_months} meses` : 'Indefinida'}
                </div>
            </div>
        )
      },
      {
        accessorKey: "price",
        header: "Precio Venta (Pack)",
        cell: ({ getValue }) => {
          const value = getValue();
          return (
            <div className="text-right">
                <p className="font-mono text-sm font-black tracking-tighter text-brand-primary">
                    {value ? value.toLocaleString("es-CL", { style: "currency", currency: "CLP", maximumFractionDigits: 0 }) : "-"}
                </p>
            </div>
          );
        },
      },
      {
        accessorKey: "is_active",
        header: "Disponibilidad",
        cell: ({ getValue }) => {
          const isActive = getValue();
          return (
            <div className="text-center">
                <span className={`inline-flex items-center px-3 py-1 rounded-lg text-[8px] font-black uppercase tracking-[0.2em] shadow-sm border ${
                    isActive ? "bg-green-50 border-green-100 text-green-600" : "bg-red-50 border-red-100 text-red-600"
                }`}>
                {isActive ? "En Catálogo" : "Fuera de Oferta"}
                </span>
            </div>
          );
        },
      },
      {
        id: "actions",
        header: "Gestión",
        cell: ({ row }) => (
          <div className="flex items-center justify-end gap-1.5">
            <button
              onClick={() => handleOpenModalEdit(row?.original)}
              className="p-2 transition-all border text-brand-primary bg-brand-secondary/10 border-brand-secondary/20 rounded-xl hover:bg-brand-primary hover:text-white active:scale-90"
              title="Editar Programa"
            >
              <Pencil className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleOpenModalDelete(row?.original)}
              className="p-2 text-red-600 transition-all border border-red-100 shadow-sm bg-red-50 rounded-xl hover:bg-red-600 hover:text-white active:scale-90"
              title="Eliminar del Sistema"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ),
        enableSorting: false,
      },
    ],
    [handleOpenModalEdit, handleOpenModalDelete]
  );

  const table = useReactTable({
    data: filteredData,
    columns,
    state: {
      sorting,
      globalFilter,
      pagination: { pageSize, pageIndex },
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    onPaginationChange: (updater) => {
      const newState =
        typeof updater === "function"
          ? updater({ pageIndex, pageSize })
          : updater;
      setPageIndex(newState.pageIndex);
      setPageSize(newState.pageSize);
    },
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  return (
    <div className="flex flex-col gap-8 duration-700 animate-in fade-in">
      <div className="bg-white border border-gray-100 shadow-xl rounded-[2rem] overflow-hidden flex flex-col">
        {/* Toolbar */}
        <div className="flex flex-col gap-6 p-6 bg-white border-b border-gray-50">
            <div className="relative max-w-2xl group">
                <Search className="absolute w-4 h-4 transition-colors transform -translate-y-1/2 text-brand-gray left-4 top-1/2 group-focus-within:text-brand-primary" />
                <input
                    value={globalFilter ?? ""}
                    onChange={(e) => setGlobalFilter(e.target.value)}
                    placeholder="Buscar planes por nombre, código o institución..."
                    className="w-full py-4 pl-12 pr-4 text-sm font-bold transition-all shadow-inner outline-none border-gray-50 bg-gray-50/50 rounded-2xl focus:bg-white focus:ring-4 focus:ring-brand-primary/5 focus:border-brand-primary"
                />
            </div>
        </div>

        <div className="flex-1 w-full overflow-x-auto custom-scrollbar">
          <table className="w-full border-collapse">
            <thead>
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id} className="border-b border-gray-100 bg-gray-50/50">
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      onClick={header.column.getToggleSortingHandler()}
                      className="px-8 py-5 text-left cursor-pointer select-none group"
                    >
                      <div className={`flex items-center gap-2 ${
                          header.column.id === "price" ? "justify-end" : ""
                        } ${
                          header.column.id === "type" || header.column.id === "is_active" ? "justify-center" : ""
                        } ${
                          header.column.id === "actions" ? "justify-end" : ""
                        }`}>
                        <span className="enterprise-label mb-0! text-gray-900 group-hover:text-brand-primary transition-colors">
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
              {table.getRowModel().rows.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="px-8 py-24 text-center">
                    <div className="flex flex-col items-center justify-center space-y-4 opacity-30">
                        <div className="p-6 bg-gray-50 rounded-[2.5rem]">
                            <NotebookText className="w-12 h-12" />
                        </div>
                        <p className="enterprise-label">No se encontraron planes registrados</p>
                    </div>
                  </td>
                </tr>
              ) : (
                table.getRowModel().rows.map((row) => (
                  <tr key={row.id} className="transition-all hover:bg-brand-secondary/5 group">
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="px-8 py-3.5 whitespace-nowrap">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="border-t border-gray-100 bg-gray-50/30">
            <TablePagination
                table={table}
                total={plans.length}
                pageSize={pageSize}
                setPageSize={setPageSize}
                pagesizeOptions={[10, 20, 50]}
            />
        </div>
      </div>
    </div>
  );
}
