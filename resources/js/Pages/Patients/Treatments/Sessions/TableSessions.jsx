import { useState, useMemo, useEffect } from "react";
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
  Eye,
  Trash2,
  Timer,
  Stethoscope,
} from "lucide-react";
import TablePagination from "@/Components/TablePagination";
import { useForm } from "@inertiajs/react";
import { t } from "@/constants/translations";
import { getSessionStatusConfig } from "@/constants/sessionStatuses";
import { getPaymentStatusConfig } from "@/constants/paymentStatuses";
import { SESSION_STATUS_OPTIONS } from "@/constants/sessionStatuses";

export default function TableSessions({
  sessions = [],
  handleOpenModalDelete,
  treatment,
  handleOpenModalSession,
  handleOpenModalSessionShow,
  setIsDuplicate,
}) {
  // --- ESTADOS DEL BUSCADOR Y FILTROS ---

  const [sorting, setSorting] = useState([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [pageSize, setPageSize] = useState(10);
  const [columnFilters, setColumnFilters] = useState([]);
  const [pageIndex, setPageIndex] = useState(0);

  // Filtro global
  const filteredData = useMemo(() => {
    if (!globalFilter) return sessions || [];
    const filter = globalFilter.toLowerCase();
    return sessions.filter((row) =>
      Object.values(row).some(
        (val) => val && val.toString().toLowerCase().includes(filter)
      )
    );
  }, [globalFilter, sessions]);

  // Definición de columnas
  const columns = useMemo(
    () => [
      {
        id: "actions",
        header: "",
        cell: ({ row }) => (
          <div className="flex gap-4">
            {treatment.status === "in_progress" && (
              <p
                className="text-green-500 cursor-pointer"
                onClick={() => (
                  handleOpenModalSession(row.original, treatment),
                  setIsDuplicate(false)
                )}
              >
                <Edit className="w-5 h-5 text-green-500" />
              </p>
            )}

            {treatment.status === "in_progress" &&
              (row.original.status === "scheduled" ||
                row.original.status === "in_progress") && (
                <>
                  <p
                    className="text-gray-500 cursor-pointer"
                    onClick={() => (
                      handleOpenModalSession(row.original, treatment),
                      setIsDuplicate(true)
                    )}
                  >
                    <Copy className="w-5 h-5 text-gray-500" />
                  </p>
                  <p
                    className="text-red-500 cursor-pointer"
                    onClick={() => handleOpenModalSessionShow(row?.original)}
                  >
                    <Trash2 className="w-5 h-5 text-red-500" />
                  </p>
                </>
              )}
          </div>
        ),
        enableSorting: false,
      },
      {
        id: "status", // si usas accessorFn, deja este id
        accessorKey: "status", // recomendado
        header: "ESTADO",
        cell: ({ getValue }) => {
          const cfg = String(getValue() ?? "");
          return (
            <span
              className={`px-2 py-0.5 text-xs rounded-xl border block flex-1 w-32 uppercase ${
                getSessionStatusConfig(cfg).className
              }`}
            >
              {getSessionStatusConfig(cfg).label}
            </span>
          );
        },
        filterFn: "includesString",
      },
      {
        header: "# Mensual",
        accessorFn: (row) => row?.month_session_number,
        cell: ({ getValue }) => {
          const number = getValue() ?? 0; // Si es null o undefined, usa 0
          // Normalizamos el valor para la visualización
          const displayValue = number === 0 ? "-*-" : "# " + number;
          const displayClass =
            number === 0 ? " bg-yellow-400" : " bg-green-500";

          return (
            <div className="flex items-center gap-3 overflow-hidden uppercase truncate whitespace-nowrap">
              <div
                className={`flex items-center justify-center  px-2 py-1 w-1/3 text-xs font-semibold text-white rounded-lg bg-gradient-to-br ${displayClass}`}
              >
                {displayValue}
              </div>
            </div>
          );
        },
        filterFn: "includesString",
      },
      {
        header: "$Pago",
        accessorFn: (row) => row?.debt?.status,
        cell: ({ getValue }) => {
          const v = String(getValue() ?? "");
          return (
            <span
              className={`px-2 py-0.5 text-xs rounded-xl border bg-blue-600 text-white uppercase ${
                getPaymentStatusConfig(v).className
              }`}
              title={v}
            >
              {getPaymentStatusConfig(v).label}
            </span>
          );
        },
        filterFn: "includesString",
      },
      {
        header: "FECHA DE SESIÓN",
        accessorFn: (row) => row?.date,
        id: "date",
        cell: ({ getValue }) => {
          return (
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <Calendar className="w-4 h-4 text-gray-400" />
              {getValue()
                ? new Date(getValue()).toLocaleDateString("es-CL")
                : "-"}
            </div>
          );
        },
        filterFn: "includesString",
      },
      {
        header: "HORA",
        accessorFn: (row) => row?.time,
        id: "time",
        cell: ({ getValue }) => {
          return (
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <Timer className="w-4 h-4 text-gray-400" />
              {getValue()}
            </div>
          );
        },
        filterFn: "includesString",
      },
      {
        header: "Kine",
        accessorFn: (row) => row?.doctor.name + " " + row?.doctor.last_name,
        cell: ({ getValue }) => (
          <div
            className="flex items-center gap-2 overflow-hidden text-sm text-gray-700 uppercase truncate whitespace-nowrap"
            title={getValue()}
          >
            <Stethoscope className="w-4 h-4 text-gray-400" />
            {getValue()}
          </div>
        ),
        filterFn: "includesString",
      },
    ],
    [handleOpenModalDelete, sessions]
  );

  // Configuración de la tabla
  const table = useReactTable({
    data: filteredData,
    columns,
    state: {
      sorting,
      globalFilter,
      columnFilters,
      pagination: { pageSize, pageIndex },
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    onColumnFiltersChange: setColumnFilters,
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
    globalFilterFn: "includesString",
    filterFns: {
      betweenNumbers: (row, columnId, filterValue) => {
        const [min, max] = filterValue || [];
        const value = row.getValue(columnId);
        if (min !== undefined && value < min) return false;
        if (max !== undefined && value > max) return false;
        return true;
      },
      betweenDates: (row, columnId, filterValue) => {
        const [from, to] = filterValue || [];
        const value = row.getValue(columnId);
        if (!value) return false;
        const date = new Date(value);
        if (from && date < new Date(from)) return false;
        if (to && date > new Date(to)) return false;
        return true;
      },
    },
  });

  // Necesitas este componente para gestionar el estado del filtro de la columna
  function ColumnFilter({ column }) {
    const columnFilterValue = column.getFilterValue();
    const isSelect = column.id === "status"; // Define qué columna usa select (status)
    const statusOptions = [
      { value: "", label: "Todos" },
      ...SESSION_STATUS_OPTIONS,
    ]; // Asume que tienes esta constante disponible

    if (isSelect) {
      return (
        <select
          value={columnFilterValue ?? ""}
          onChange={(e) => column.setFilterValue(e.target.value)}
          className="w-full mt-1 px-1 py-0.5 text-xs border border-gray-300 rounded-lg focus:ring-blue-500"
        >
          {statusOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      );
    }

    // Filtro de texto simple para las demás columnas
    return (
      <input
        type="text"
        value={columnFilterValue ?? ""}
        onChange={(e) => column.setFilterValue(e.target.value)}
        placeholder={`Buscar...`}
        className="w-full mt-1 px-2 py-0.5 text-xs border border-gray-300 rounded-lg focus:ring-blue-500"
      />
    );
  }

  return (
    <div className="max-w-full">
      {/* Filtro global */}
      <div className="p-4 bg-white border border-gray-200 shadow-sm rounded-xl">
        {/* Tabla */}
        <div className="overflow-hidden rounded-xl">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-100">
                {table.getHeaderGroups().map((headerGroup) => (
                  <tr
                    key={headerGroup.id}
                    className="border-b-2 border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100"
                  >
                    {headerGroup.headers.map((header) => (
                      <th
                        key={header.id}
                        // ... (resto de las clases th)
                      >
                        {/* Contenido principal del encabezado (Nombre y flechas de ordenación) */}
                        <div
                          onClick={header.column.getToggleSortingHandler()}
                          className="flex items-center justify-between cursor-pointer select-none"
                        >
                          <div className="overflow-hidden font-semibold uppercase truncate whitespace-nowrap">
                            {flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                          </div>
                          {/* Indicadores de Ordenación */}
                          {/* ... (ChevronUp / ChevronDown) ... */}
                        </div>

                        {/* --- ZONA DE FILTRO --- */}
                        {header.column.getCanFilter() ? (
                          <div>
                            {/* Renderiza el componente de filtro para la columna */}
                            <ColumnFilter column={header.column} />
                          </div>
                        ) : null}
                        {/* -------------------- */}
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody className="divide-y divide-gray-200">
                {table.getRowModel().rows.map((row) => (
                  <tr
                    key={row.id}
                    className="transition-colors hover:bg-blue-50/50"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="px-3 py-2">
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {/* Paginación */}
          <TablePagination
            table={table}
            total={sessions.length}
            pageSize={pageSize}
            setPageSize={setPageSize}
            pageSizeOptions={[5, 10, 15, 20, 30, 40, 50]} // Opcional
          />
        </div>
      </div>
    </div>
  );
}
