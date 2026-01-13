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
  Copy,
  Calendar,
  Edit,
  Trash2,
  Timer,
  Stethoscope,
  DollarSign,
  Search,
  Filter
} from "lucide-react";
import TablePagination from "@/Components/TablePagination";
import { getSessionStatusConfig } from "@/constants/sessionStatuses";
import { getPaymentStatusConfig } from "@/constants/paymentStatuses";
import { SESSION_STATUS_OPTIONS } from "@/constants/sessionStatuses";
import moment from "moment";

export default function TableSessions({
  sessions = [],
  handleOpenModalDelete,
  treatment,
  handleOpenModalSession,
  handleOpenModalSessionShow,
  setIsDuplicate,
}) {
  const [sorting, setSorting] = useState([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [pageSize, setPageSize] = useState(10); // Corregido: pageSize (camelCase)
  const [columnFilters, setColumnFilters] = useState([]);
  const [pageIndex, setPageIndex] = useState(0);

  // --- 1. FILTRADO GLOBAL ---
  const filteredData = useMemo(() => {
    if (!globalFilter) return sessions;
    const filter = globalFilter.toLowerCase();
    return sessions.filter((row) =>
      Object.values(row).some(
        (val) => val && val.toString().toLowerCase().includes(filter)
      )
    );
  }, [globalFilter, sessions]);


  // --- 2. COLUMNAS ---
  const columns = useMemo(
    () => [
      // COLUMNA: ESTADO
      {
        accessorKey: "status",
        header: "ESTADO",
        cell: ({ getValue }) => {
          const status = getValue() || "";
          const config = getSessionStatusConfig(status);
          return (
            <span
              className={`px-2.5 py-1 flex flex-1 text-[10px] font-black uppercase tracking-widest rounded-lg border ${config.className}`}
            >
              {config.label}
            </span>
          );
        },
        filterFn: "includesString",
      },
      
      // COLUMNA: FECHA
      {
        accessorFn: (row) => row.date,
        id: "date",
        header: "FECHA",
        cell: ({ getValue }) => (
          <div className="flex flex-1 truncate items-center gap-2 text-sm font-medium text-gray-700">
            <Calendar className="w-3.5 h-3.5 text-gray-400" />
            {getValue() ? new Date(getValue()).toLocaleDateString("es-CL") : "-"}
          </div>
        ),
      },

      // COLUMNA: HORA
      {
        accessorFn: (row) => row.time,
        id: "time",
        header: "HORA",
        cell: ({ getValue }) => {
            const val = getValue();
            let displayTime = "--:--";
            
            if (val) {
                // Intentar parsear como ISO o Time string
                const m = moment(val, [moment.ISO_8601, "HH:mm:ss", "HH:mm"]);
                if (m.isValid()) {
                    displayTime = m.format("HH:mm");
                }
            }

            return (
              <div className="flex flex-1 truncate  items-center gap-2 text-sm text-gray-600 font-mono">
                <Timer className="w-3.5 h-3.5 text-gray-400" />
                {displayTime}
              </div>
            );
        },
      },

      // COLUMNA: SESIÓN #
      {
        header: "Nº SESIÓN",
        accessorFn: (row) => row.month_session_number,
        cell: ({ getValue }) => {
          const num = getValue() || 0;
          return (
            <span className={`flex flex-1 truncate text-xs font-bold px-2 py-1 rounded ${num === 0 ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-700'}`}>
               {num === 0 ? "Eval" : `#${num}`}
            </span>
          );
        },
      },

      // COLUMNA: KINESIÓLOGO
      {
        header: "PROFESIONAL",
        accessorFn: (row) => row.doctor ? `${row.doctor.name} ${row.doctor.last_name}` : "",
        cell: ({ getValue }) => (
          <div className="flex items-center gap-2 text-xs font-bold text-gray-600 uppercase">
            <div className="p-1 bg-gray-100 rounded-full"><Stethoscope className="w-3 h-3 text-gray-500" /></div>
            {getValue()}
          </div>
        ),
      },

      // COLUMNA: PAGO (DEUDA)
      {
        header: "PAGO",
        accessorFn: (row) => row.debt?.status,
        cell: ({ getValue }) => {
          const status = getValue() || "pending";
          const config = getPaymentStatusConfig(status);
          return (
            <div className={`flex flex-1 truncate items-center gap-1.5 px-2 py-0.5 rounded border text-[9px] font-black uppercase w-fit ${config.className}`}>
               <DollarSign className="w-3 h-3" />
               {config.label}
            </div>
          );
        },
      },

      // COLUMNA: ACCIONES
      {
        id: "actions",
        header: "",
        cell: ({ row }) => {
            const isEditable = treatment.status === "in_progress" || treatment.status === "evaluation";
            const isScheduled = ["scheduled", "in_progress"].includes(row.original.status);

            return (
                <div className="flex justify-end gap-2">
                    {isEditable && (
                        <button
                            onClick={() => { handleOpenModalSession(row.original, treatment); setIsDuplicate(false); }}
                            className="p-1.5 text-gray-400 hover:text-brand-primary hover:bg-brand-primary/10 rounded-lg transition-colors"
                            title="Editar"
                        >
                            <Edit className="w-4 h-4" />
                        </button>
                    )}
                    
                    {isEditable && isScheduled && (
                        <>
                            <button
                                onClick={() => { handleOpenModalSession(row.original, treatment); setIsDuplicate(true); }}
                                className="p-1.5 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                                title="Duplicar"
                            >
                                <Copy className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => handleOpenModalSessionShow(row.original)}
                                className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                title="Eliminar"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </>
                    )}
                </div>
            );
        },
      },
    ],
    [handleOpenModalDelete, sessions, treatment.status]
  );

  const table = useReactTable({
    data: filteredData,
    columns,
    state: {
      sorting,
      globalFilter,
      columnFilters,
      pagination: { pageSize, pageIndex }, // Corregido: pageSize
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    onColumnFiltersChange: setColumnFilters,
    onPaginationChange: (updater) => {
        // TanStack devuelve { pageIndex, pageSize }
        const newState = typeof updater === "function" ? updater({ pageIndex, pageSize }) : updater;
        setPageIndex(newState.pageIndex);
        setPageSize(newState.pageSize); // Corregido: newState.pageSize
    },
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  return (
    <div className="w-full px-4 hover:shadow-xl">
        
      {/* 1. BARRA DE HERRAMIENTAS (Buscador) */}
      <div className="flex justify-between items-center mb-4 px-1">
         <div className="relative w-full max-w-sm">
            <Search className="absolute w-4 h-4 text-gray-400 top-2.5 left-3" />
            <input
                value={globalFilter ?? ""}
                onChange={(e) => setGlobalFilter(e.target.value)}
                placeholder="Buscar en sesiones..."
                className="w-full py-2 pl-9 pr-3 text-xs font-medium border-gray-200 rounded-xl focus:ring-brand-primary focus:border-brand-primary transition-all shadow-sm bg-gray-50/50 focus:bg-white"
            />
         </div>
         {/* Aquí podrías poner filtros adicionales si quisieras */}
      </div>

      {/* 2. TABLA */}
      <div className="rounded-xl border border-gray-200 overflow-hidden bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50/50 border-b border-gray-100">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      className="px-4 py-3 text-[10px] font-black text-gray-400 uppercase tracking-widest select-none group"
                    >
                      <div className="flex flex-col gap-1">
                          {/* Título y Ordenación */}
                          <div 
                            className="flex items-center gap-1 cursor-pointer hover:text-gray-600"
                            onClick={header.column.getToggleSortingHandler()}
                          >
                            {flexRender(header.column.columnDef.header, header.getContext())}
                            {header.column.getIsSorted() === "asc" ? <ChevronUp className="w-3 h-3 text-brand-primary"/> : header.column.getIsSorted() === "desc" ? <ChevronDown className="w-3 h-3 text-brand-primary"/> : null}
                          </div>

                          {/* Filtro por Columna (Solo para Estado) */}
                          {header.column.id === "status" && (
                             <select
                                value={header.column.getFilterValue() ?? ""}
                                onChange={(e) => header.column.setFilterValue(e.target.value)}
                                onClick={(e) => e.stopPropagation()} // Evitar ordenar al clicar select
                                className="mt-1 w-full text-[9px] py-1 pl-1 pr-4 border-gray-200 rounded bg-white focus:ring-0 focus:border-brand-primary font-medium text-gray-500"
                             >
                                <option value="">Todos</option>
                                {SESSION_STATUS_OPTIONS.map(opt => (
                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                ))}
                             </select>
                          )}
                      </div>
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="divide-y divide-gray-50">
              {table.getRowModel().rows.length > 0 ? (
                table.getRowModel().rows.map((row) => (
                  <tr key={row.id} className="hover:bg-blue-50/30 transition-colors">
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="px-4 py-3 align-middle">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={columns.length} className="p-8 text-center text-gray-400 text-xs italic">
                    No se encontraron sesiones que coincidan con la búsqueda.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 3. PAGINACIÓN */}
      <div className="mt-4 px-1">
        <TablePagination
            table={table}
            total={sessions.length}
            pagesize={pageSize} // Corregido: pageSize
            setpagesize={setPageSize} // Corregido: setPageSize
        />
      </div>
    </div>
  );
}