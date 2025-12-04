import { useState, useMemo } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  getFilteredRowModel,
  flexRender,
} from "@tanstack/react-table";
import { ChevronDown, ChevronUp } from "lucide-react";
import { STATUS_MAP, meses } from "@/helpers/status";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import TablePagination from "@/Components/TablePagination";

export default function TableAttendancesPatient({
  sessions,
  handleOpenModalTreatment,
  handleOpenModalTreatmentList,
  treatment,
}) {
  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();

  const [sorting, setSorting] = useState([]);
  const [globalFilter, setGlobalFilter] = useState("");

  // set pageSize to all rows by default to show everything
  const [pageSize, setPageSize] = useState(
    sessions?.length > 0 ? sessions?.length : 1
  );

  // default filter to the current month on load
  const [columnFilters, setColumnFilters] = useState([
    { id: "attended_at", value: currentMonth },
  ]);
  const [pageIndex, setPageIndex] = useState(0);

  // Helpers
  const toNumber = (v) => {
    if (v == null) return 0;
    if (typeof v === "number") return v;
    if (typeof v === "string") {
      // handle "1.234,56" or "1234,56" -> 1234.56
      const s = v.replace(/\./g, "").replace(",", ".");
      const n = Number(s);
      return Number.isNaN(n) ? 0 : n;
    }
    return 0;
  };
  const clp = (n) =>
    (Number(n) || 0).toLocaleString("es-CL", {
      style: "currency",
      currency: "CLP",
      maximumFractionDigits: 0,
    });
  const fmtDate = (val) =>
    val ? new Date(val).toLocaleDateString("es-CL") : "-";

  // Filtrado global simple (busca en todas las columnas del dataset original)
  const filteredData = useMemo(() => {
    if (!globalFilter) return sessions || [];
    const filter = globalFilter.toLowerCase();
    return (sessions || []).filter((row) =>
      Object.values(row).some(
        (val) => val && val.toString().toLowerCase().includes(filter)
      )
    );
  }, [globalFilter, sessions]);

  const currencyFormatter = new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    minimumFractionDigits: 0, // pesos normalmente sin decimales
  });

  const norm = (s) =>
    String(s)
      .normalize("NFD")
      .replace(/\p{Diacritic}/gu, "")
      .toLowerCase()
      .trim();

  const columns = useMemo(
    () => [
      {
        header: "FECHA ATENCIÓN (MES)",
        accessorFn: (row) => row?.attended_at,
        id: "attended_at",
        cell: ({ getValue }) => (getValue() ? fmtDate(getValue()) : "-"),
        filterFn: (row, columnId, filterValue) => {
          if (!filterValue) return true; // si no hay filtro, mostrar todo
          const value = row.getValue(columnId);
          if (!value) return false;
          const date = new Date(value);
          const month = date.getMonth() + 1; // enero = 0 → sumamos 1
          return month === Number(filterValue);
        },
        Filter: ({ column }) => {
          const meses = [
            "Enero",
            "Febrero",
            "Marzo",
            "Abril",
            "Mayo",
            "Junio",
            "Julio",
            "Agosto",
            "Septiembre",
            "Octubre",
            "Noviembre",
            "Diciembre",
          ];

          return (
            <select
              value={column.getFilterValue() ?? ""}
              onChange={(e) =>
                column.setFilterValue(
                  e.target.value ? Number(e.target.value) : undefined
                )
              }
              className="overflow-hidden uppercase truncate whitespace-nowrap"
            >
              <option value="">Todos</option>
              {meses.map((mes, i) => (
                <option key={i} value={i + 1}>
                  {mes}
                </option>
              ))}
            </select>
          );
        },
      },
      { accessorKey: "doctor_full", header: "Doctor" },
      { accessorKey: "session_type_name", header: "Tipo" },
      {
        accessorKey: "status",
        header: "Estado",
        cell: ({ getValue }) => {
          const v = String(getValue()); // viene como "completed", "cancelled", etc.
          const meta = STATUS_MAP[v] || {
            label: "Desconocido",
            chip: "bg-gray-100 text-gray-700",
          };

          return (
            <span
              className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${meta.chip}`}
            >
              {meta.label}
            </span>
          );
        },
        filterFn: (row, columnId, filterValue) => {
          if (
            filterValue == null ||
            (Array.isArray(filterValue) && filterValue.length === 0)
          )
            return true;

          const raw = String(row.getValue(columnId)); // "completed"
          const label = STATUS_MAP[raw]?.label ?? raw;

          if (Array.isArray(filterValue)) {
            const set = new Set(filterValue.map((v) => norm(v)));
            return set.has(norm(label));
          }
          return norm(label) === norm(filterValue);
        },
        // puedes generar opciones dinámicamente desde STATUS_MAP
        meta: {
          options: Object.values(STATUS_MAP).map((s) => s.label),
        },
      },
    ],
    [handleOpenModalTreatment, handleOpenModalTreatmentList, sessions]
  );

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
  });

  return (
    <div className="max-w-full">
      <div className="flex flex-col w-full gap-3 p-4 mb-4 text-white rounded-md sm:flex-row sm:items-center sm:justify-between bg-slate-500">
        <div href="#" className="text-lg font-semibold text-white">
          {treatment
            ? treatment?.default_session_type?.name
            : "No hay tratamientos activos"}{" "}
          / ({sessions?.length ? sessions.length : 0} sesiones)
        </div>
        <div className="flex flex-col gap-2 text-white sm:flex-row sm:items-center sm:gap-4">
          <a
            href="#"
            onClick={handleOpenModalTreatment}
            className="text-sm text-white hover:underline"
          >
            Crear Tratamiento
          </a>
          <a
            href="#"
            onClick={handleOpenModalTreatmentList}
            className="text-sm text-white hover:underline"
          >
            Cambiar
          </a>
        </div>
      </div>
      <div className="w-full overflow-x-auto border border-gray-200 rounded-md">
        <table className="min-w-[900px] w-full border-collapse border border-gray-200 shadow-sm rounded-md overflow-hidden">
          <thead className="bg-gray-100">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    onClick={header.column.getToggleSortingHandler()}
                    className="px-4 py-3 text-sm font-semibold text-left text-gray-700 transition border border-gray-200 cursor-pointer select-none hover:bg-gray-200"
                    scope="col"
                  >
                    <div className="flex">
                      <div className="overflow-hidden uppercase truncate whitespace-nowrap">
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                      </div>
                      <span>
                        {header.column.getIsSorted() === "asc" ? (
                          <ChevronUp className="inline w-4 h-4 ml-1" />
                        ) : header.column.getIsSorted() === "desc" ? (
                          <ChevronDown className="inline w-4 h-4 ml-1" />
                        ) : null}
                      </span>
                    </div>
                    {/* Filtros por columna */}
                    {header.column.getCanFilter() && (
                      <div className="flex gap-1 mt-1">
                        {/* Filtro atención (mes) */}
                        {["FECHA ATENCIÓN (MES)"].includes(
                          header.column.columnDef.header
                        ) ? (
                          <select
                            value={header.column.getFilterValue() ?? ""}
                            onChange={(e) =>
                              header.column.setFilterValue(
                                e.target.value || undefined
                              )
                            }
                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md"
                          >
                            <option value="">Todos</option>
                            {meses.map((c) => (
                              <option key={c.value} value={c.value}>
                                {c.name}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <input
                            value={header.column.getFilterValue() ?? ""}
                            onChange={(e) =>
                              header.column.setFilterValue(e.target.value)
                            }
                            placeholder="Filtrar..."
                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md"
                          />
                        )}
                        {header.column.getCanFilter() &&
                          header.column.columnDef.meta?.filterComponent?.({
                            column: header.column,
                          })}
                      </div>
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>

          <tbody>
            {table.getRowModel().rows.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="py-6 text-center text-gray-500"
                >
                  No se han encontrado datos
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  className="transition border-b border-gray-200 hover:bg-gray-50"
                >
                  {row.getVisibleCells().map((cell) => (
                    <td
                      key={cell.id}
                      className="px-4 py-3 text-gray-800 whitespace-nowrap"
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <TablePagination
        table={table}
        total={sessions.length}
        pageSize={pageSize}
        setPageSize={setPageSize}
        pageSizeOptions={[5, 10, 15, 20, 30, 40, 50]}
      />
    </div>
  );
}
