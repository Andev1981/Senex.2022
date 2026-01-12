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
  Edit,
  Stethoscope,
  FileText,
  Calendar
} from "lucide-react";
import TablePagination from "@/Components/TablePagination";
import { patientStatuses, PATIENT_STATUS_OPTIONS } from "@/helpers/status"; // Ajusta imports si usas treatmentStatuses

export default function TableTreatments({
  treatments = [],
  handleTreatmentModal,
  setOpenTreatmentModal,
}) {
  const [sorting, setSorting] = useState([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [pagesize, setpagesize] = useState(10);
  const [pageIndex, setPageIndex] = useState(0);

  // --- 1. FILTRADO GLOBAL ---
  const filteredData = useMemo(() => {
    if (!globalFilter) return treatments;
    const filter = globalFilter.toLowerCase();
    return treatments.filter((row) => {
        // Buscar en Diagnóstico, Doctor, Estado
        const diag = row.diagnostic?.description || row.referral_diagnosis || "";
        const doc = row.doctor ? `${row.doctor.name} ${row.doctor.last_name}` : "";
        const status = row.status || "";
        return (
            diag.toLowerCase().includes(filter) ||
            doc.toLowerCase().includes(filter) ||
            status.toLowerCase().includes(filter)
        );
    });
  }, [globalFilter, treatments]);

  // --- 2. COLUMNAS ---
  const columns = useMemo(
    () => [
      // ESTADO
      {
        accessorKey: "status",
        header: "ESTADO",
        cell: ({ getValue }) => {
          const val = getValue() || "active";
          // Mapeo simple de colores si patientStatuses no tiene todos los de tratamientos
          const styles = {
             active: "bg-green-100 text-green-700 border-green-200",
             evaluation: "bg-blue-100 text-blue-700 border-blue-200",
             in_progress: "bg-teal-100 text-teal-700 border-teal-200",
             completed: "bg-gray-100 text-gray-600 border-gray-200",
             cancelled: "bg-red-50 text-red-600 border-red-100"
          };
          const label = patientStatuses[val]?.label || val; // Fallback al valor crudo si no hay label
          
          return (
            <span className={`px-2.5 py-1 text-[10px] font-black uppercase tracking-widest rounded-lg border ${styles[val] || styles.active}`}>
              {label}
            </span>
          );
        },
      },

      // # MENSUAL / ID
      {
        header: "ID", // O "# MENSUAL" si usas esa lógica
        accessorFn: (row) => row.id, // O row.month_session_number si aplica
        cell: ({ getValue }) => (
            <span className="text-xs font-mono font-bold text-gray-400">#{getValue()}</span>
        ),
      },

      // DIAGNÓSTICO
      {
        header: "DIAGNÓSTICO",
        accessorFn: (row) => row.diagnostic?.description || row.referral_diagnosis || "Sin diagnóstico",
        cell: ({ getValue }) => (
            <div className="flex items-center gap-2">
                <FileText className="w-3.5 h-3.5 text-purple-400" />
                <span className="text-xs font-bold text-gray-700 uppercase truncate max-w-[200px]" title={getValue()}>
                    {getValue()}
                </span>
            </div>
        ),
      },

      // FECHA
      {
        header: "FECHA INICIO",
        accessorFn: (row) => row.start_date || row.created_at,
        cell: ({ getValue }) => (
            <div className="flex items-center gap-2 text-sm text-gray-600">
                <Calendar className="w-3.5 h-3.5 text-gray-400" />
                {getValue() ? new Date(getValue()).toLocaleDateString("es-CL") : "-"}
            </div>
        ),
      },

      // KINESIÓLOGO
      {
        header: "PROFESIONAL",
        accessorFn: (row) => row.doctor ? `${row.doctor.name} ${row.doctor.last_name}` : "",
        cell: ({ getValue }) => (
            <div className="flex items-center gap-2 text-xs font-bold text-gray-600 uppercase">
                <Stethoscope className="w-3.5 h-3.5 text-gray-400" />
                {getValue() || "Sin asignar"}
            </div>
        ),
      },

      // ACCIONES
      {
        id: "actions",
        header: "",
        cell: ({ row }) => (
          <div className="flex justify-end gap-2">
            <button
              onClick={() => { handleTreatmentModal(row.original); if(setOpenTreatmentModal) setOpenTreatmentModal(false); }}
              className="p-1.5 text-gray-400 hover:text-brand-primary hover:bg-brand-primary/10 rounded-lg transition-colors"
              title="Editar Tratamiento"
            >
              <Edit className="w-4 h-4" />
            </button>
          </div>
        ),
      },
    ],
    [handleTreatmentModal, setOpenTreatmentModal]
  );

  const table = useReactTable({
    data: filteredData,
    columns,
    state: {
      sorting,
      globalFilter,
      pagination: { pagesize, pageIndex },
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    onPaginationChange: (updater) => {
        const newState = typeof updater === "function" ? updater({ pageIndex, pagesize }) : updater;
        setPageIndex(newState.pageIndex);
        setpagesize(newState.pagesize);
    },
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  return (
    <div className="w-full p-4">
      
      {/* 1. BARRA DE HERRAMIENTAS */}
      <div className="flex justify-between items-center mb-4 px-1">
         <div className="relative w-full max-w-sm">
            <Search className="absolute w-4 h-4 text-gray-400 top-2.5 left-3" />
            <input
                value={globalFilter ?? ""}
                onChange={(e) => setGlobalFilter(e.target.value)}
                placeholder="Buscar tratamiento..."
                className="w-full py-2 pl-9 pr-3 text-xs font-medium border-gray-200 rounded-xl focus:ring-brand-primary focus:border-brand-primary transition-all shadow-sm bg-gray-50/50 focus:bg-white"
            />
         </div>
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
                      <div 
                        className="flex items-center gap-1 cursor-pointer hover:text-gray-600"
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {header.column.getIsSorted() === "asc" ? <ChevronUp className="w-3 h-3 text-brand-primary"/> : header.column.getIsSorted() === "desc" ? <ChevronDown className="w-3 h-3 text-brand-primary"/> : null}
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
                    No se encontraron tratamientos.
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
            total={treatments.length}
            pagesize={pagesize}
            setpagesize={setpagesize}
        />
      </div>
    </div>
  );
}