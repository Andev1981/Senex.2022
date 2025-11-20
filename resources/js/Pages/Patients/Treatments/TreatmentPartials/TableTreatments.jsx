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
} from "lucide-react";
import TablePagination from "@/Components/TablePagination";
import { useForm } from "@inertiajs/react";
import { patientStatuses } from "@/utils/status";

export default function TableTreatments({
  treatments = [],
  handleTreatmentModal,
  setOpenTreatmentModal,
}) {
  // --- ESTADOS DEL BUSCADOR Y FILTROS ---
  const [searchTerm, setSearchTerm] = useState("");

  // valores controlados del panel
  const [filterEstado, setFilterEstado] = useState(""); // "Activo", "Inactivo" o "" (Todos)
  const [filterEstadoPago, setFilterEstadoPago] = useState(""); // "Al día", "Con deuda" o "" (Todos)
  const [filterComuna, setFilterComuna] = useState(""); // nombre exacto o "" (Todas)
  const [edadMin, setEdadMin] = useState("");
  const [edadMax, setEdadMax] = useState("");

  const { get } = useForm();
  const [sorting, setSorting] = useState([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [pageSize, setPageSize] = useState(10);
  const [columnFilters, setColumnFilters] = useState([]);
  const [pageIndex, setPageIndex] = useState(0);

  // ¿Hay filtros activos?
  const hasActiveFilters = !!(
    filterEstado ||
    filterEstadoPago ||
    filterComuna ||
    edadMin ||
    edadMax
  );

  // Limpia todos los filtros del panel (y los de TanStack)
  const clearFilters = () => {
    setFilterEstado("");
    setFilterEstadoPago("");
    setFilterComuna("");
    setEdadMin("");
    setEdadMax("");
    // Limpia column filters en TanStack
    table.setColumnFilters((prev) =>
      prev.filter(
        (f) =>
          !["status", "payment_status", "comuna_name", "age"].includes(f.id)
      )
    );
  };

  // --- SYNC PANEL -> COLUMN FILTERS TANSTACK ---
  // Mapea los labels visibles a los valores guardados en tus filas.
  // Ajusta según tus códigos reales (ejemplo: "Activo" -> "active").
  const mapEstado = (label) => {
    if (!label) return undefined;
    if (label.toLowerCase() === "activo") return "active";
    if (label.toLowerCase() === "inactivo") return "inactive";
    return label; // fallback
  };

  const mapEstadoPago = (label) => {
    if (!label) return undefined;
    const l = label.toLowerCase();
    if (l.includes("día")) return "ok";
    if (l.includes("deuda")) return "due"; // o "overdue" si usas ese
    return label; // fallback
  };

  useEffect(() => {
    const next = [];

    // status (igualdad)
    if (filterEstado) {
      next.push({ id: "status", value: mapEstado(filterEstado) });
    }

    // payment_status (igualdad)
    if (filterEstadoPago) {
      next.push({
        id: "payment_status",
        value: mapEstadoPago(filterEstadoPago),
      });
    }

    // comuna exacta
    if (filterComuna) {
      next.push({ id: "comuna_name", value: filterComuna });
    }

    // edad min/max (numérico)
    if (edadMin || edadMax) {
      const min = edadMin ? Number(edadMin) : undefined;
      const max = edadMax ? Number(edadMax) : undefined;
      next.push({ id: "age", value: [min, max] });
    }

    // Mantén también los otros filtros que ya existan (como el de birth_month si lo usas)
    setColumnFilters((prev) => {
      const keep = prev.filter(
        (f) =>
          !["status", "payment_status", "comuna_name", "age"].includes(f.id)
      );
      return [...keep, ...next];
    });
  }, [treatments, handleTreatmentModal]);

  // --- DEBOUNCE DEL GLOBAL SEARCH ---
  useEffect(() => {
    const id = setTimeout(() => {
      setGlobalFilter(searchTerm);
    }, 250);
    return () => clearTimeout(id);
  }, [searchTerm]);

  // Filtro global
  const filteredData = useMemo(() => {
    if (!globalFilter) return treatments || [];
    const filter = globalFilter.toLowerCase();
    return treatments.filter((row) =>
      Object.values(row).some(
        (val) => val && val.toString().toLowerCase().includes(filter)
      )
    );
  }, [globalFilter, treatments]);

  console.log("Sesion: ", treatments[0]);

  // Definición de columnas
  const columns = useMemo(
    () => [
      {
        id: "actions",
        header: "",
        cell: ({ row }) => (
          <div className="flex gap-2">
            <p
              className="text-gray-500 cursor-pointer"
              onClick={() => (
                handleTreatmentModal(row.original), setOpenTreatmentModal(false)
              )}
            >
              <Edit className="w-4 h-4 text-gray-500" />
            </p>
          </div>
        ),
        enableSorting: false,
      },
      {
        id: "status", // si usas accessorFn, deja este id
        accessorKey: "status", // recomendado
        header: "ESTADO",
        cell: ({ getValue }) => {
          const v = String(getValue() ?? "");
          const cfg = patientStatuses[v] ?? {
            label: v,
            className: "bg-blue-600 text-white",
          };
          return (
            <span
              className={`px-2 py-0.5 text-xs rounded-xl border text-white ${cfg.className}`}
            >
              {cfg.label}
            </span>
          );
        },
        // filtro: acepta múltiples estados (array de strings)
        filterFn: (row, id, filterValue) => {
          if (!filterValue) return true; // sin filtro
          return String(row.getValue(id) ?? "") === String(filterValue);
        },
      },
      {
        header: "# Mensual",
        accessorFn: (row) => row?.month_session_number,
        cell: ({ getValue }) => (
          <div
            className="flex items-center gap-3 overflow-hidden uppercase truncate whitespace-nowrap"
            title={getValue()}
          >
            <div className="flex items-center justify-center w-6 h-6 text-xs font-semibold text-white rounded-lg bg-gradient-to-br from-green-500 to-green-600">
              #{getValue()}
            </div>
          </div>
        ),
      },
      {
        header: "# Global",
        accessorFn: (row) => row?.session_number,
        cell: ({ getValue }) => (
          <div
            className="flex items-center gap-3 overflow-hidden uppercase truncate whitespace-nowrap"
            title={getValue()}
          >
            <div className="flex items-center justify-center w-6 h-6 text-xs font-semibold text-white rounded-lg bg-gradient-to-br from-blue-500 to-blue-600">
              #{getValue()}
            </div>
          </div>
        ),
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
      },
      {
        header: "Kine",
        accessorFn: (row) => row?.doctor.name + " " + row?.doctor.last_name,
        cell: ({ getValue }) => (
          <div
            className="flex items-center gap-2 overflow-hidden text-sm text-gray-700 uppercase truncate whitespace-nowrap"
            title={getValue()}
          >
            {getValue()}
          </div>
        ),
      },
    ],
    [treatments, handleTreatmentModal]
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
                        onClick={header.column.getToggleSortingHandler()}
                        className="px-2 py-1 text-sm font-semibold tracking-wider text-left text-gray-700 uppercase transition border border-gray-200 cursor-pointer select-none hover:bg-gray-200"
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
            total={treatments.length}
            pageSize={pageSize}
            setPageSize={setPageSize}
            pageSizeOptions={[5, 10, 15, 20, 30, 40, 50]} // Opcional
          />
        </div>
      </div>
    </div>
  );
}
