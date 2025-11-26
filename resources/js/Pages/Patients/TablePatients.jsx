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
  Search,
  Calendar,
  Trash2,
  Eye,
  MapPin,
  Map,
  Mail,
  Phone,
  Stethoscope,
  CreditCard,
  Download,
  Filter,
  X,
} from "lucide-react";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import TablePagination from "@/Components/TablePagination";
import { route } from "ziggy-js";
import { useForm } from "@inertiajs/react";
import { meses, patientStatuses, debtStatuses } from "@/utils/status";

export default function TablePatients({
  patients,
  handleOpenModalDelete,
  communes,
}) {
  // --- ESTADOS DEL BUSCADOR Y FILTROS ---
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  // valores controlados del panel
  const [filterEstado, setFilterEstado] = useState(""); // "Activo", "Inactivo" o "" (Todos)
  const [filterEstadoPago, setFilterEstadoPago] = useState(""); // "Al día", "Con deuda" o "" (Todos)
  const [filterComuna, setFilterComuna] = useState(""); // nombre exacto o "" (Todas)
  const [edadMin, setEdadMin] = useState("");
  const [edadMax, setEdadMax] = useState("");

  const { get } = useForm();
  const [sorting, setSorting] = useState([]);
  const [pageSize, setPageSize] = useState(10);
  const [columnFilters, setColumnFilters] = useState([]);
  const [pageIndex, setPageIndex] = useState(0);

  const comunasPresentes = useMemo(() => {
    if (!patients || patients.length === 0) return [];

    // Extraer comunas únicas de los pacientes
    const comunasUnicas = [
      ...new Set(
        patients.map((p) => p.comuna_name).filter(Boolean) // Eliminar valores null/undefined
      ),
    ];

    // Ordenar alfabéticamente
    return comunasUnicas.sort((a, b) => a.localeCompare(b));
  }, [patients]);

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
    setSearchTerm("");
    setColumnFilters([]);
  };

  // --- SYNC PANEL -> COLUMN FILTERS TANSTACK ---
  // Mapea los labels visibles a los valores guardados en tus filas.
  const mapEstado = (label) => {
    if (!label) return undefined;
    if (label.toLowerCase() === "activo") return "active";
    if (label.toLowerCase() === "inactivo") return "inactive";
    return label;
  };

  const mapEstadoPago = (label) => {
    if (!label) return undefined;
    const l = label.toLowerCase();
    if (l.includes("día")) return "ok";
    if (l.includes("deuda")) return "due";
    return label;
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

    // Mantén también los otros filtros que ya existan
    setColumnFilters((prev) => {
      const keep = prev.filter(
        (f) =>
          !["status", "payment_status", "comuna_name", "age"].includes(f.id)
      );
      return [...keep, ...next];
    });
  }, [filterEstado, filterEstadoPago, filterComuna, edadMin, edadMax]);

  // Definición de columnas
  const columns = useMemo(
    () => [
      {
        id: "actions",
        header: "",
        cell: ({ row }) => (
          <div
            type="button"
            className="flex gap-2 mr-1 hover:cursor-pointer btn"
            onClick={() => detailPatient(row?.original)}
          >
            <Eye className="w-5 h-5 text-green-600" />

            <a
              type="button"
              className="mr-1 hover:cursor-pointer btn"
              onClick={() => handleOpenModalDelete(row?.original)}
            >
              <Trash2 className="w-5 h-5 text-red-700" />
            </a>
          </div>
        ),
        enableSorting: false,
      },
      {
        id: "status",
        accessorKey: "status",
        header: "ESTADO",
        cell: ({ getValue }) => {
          const v = String(getValue() ?? "");
          const cfg = patientStatuses[v] ?? {
            label: v,
            className: "bg-gray-400 text-white",
          };
          return (
            <span
              className={`px-2 py-0.5 text-xs rounded-xl border text-white ${cfg.className}`}
            >
              {cfg.label}
            </span>
          );
        },
        filterFn: (row, id, filterValue) => {
          if (!filterValue) return true;
          return String(row.getValue(id) ?? "") === String(filterValue);
        },
      },
      {
        id: "payment_status",
        accessorKey: "payment_status",
        header: "ESTADO DE PAGO",
        filterFn: (row, id, filterValue) => {
          if (!filterValue) return true;
          const cell = row.getValue(id);
          return String(cell) === String(filterValue);
        },
        cell: ({ getValue }) => {
          const v = String(getValue() ?? "");
          const cfg = debtStatuses[v] ?? {
            label: v,
            className: "bg-gray-400 text-white",
          };
          return (
            <span
              className={`px-2 py-0.5 text-xs rounded-xl border truncate whitespace-nowrap ${cfg.className}`}
            >
              {cfg.label}
            </span>
          );
        },
      },
      {
        header: "NOMBRE",
        accessorFn: (row) => row?.full_name,
        cell: ({ getValue }) => (
          <div
            className="flex items-center gap-3 overflow-hidden uppercase truncate whitespace-nowrap"
            title={getValue()}
          >
            <div className="flex items-center justify-center w-6 h-6 text-xs font-semibold text-white rounded-lg bg-gradient-to-br from-blue-500 to-blue-600">
              {getValue().charAt(0)}
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-900">
                {getValue()}
              </p>
            </div>
          </div>
        ),
      },
      {
        header: "FECHA NACIMIENTO",
        accessorFn: (row) => row?.birth_date,
        id: "birth_date",
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
        filterFn: (row, columnId, filterValue) => {
          if (!filterValue) return true;
          const value = row.getValue(columnId);
          if (!value) return false;
          const date = new Date(value);
          const month = date.getMonth() + 1;
          return month === Number(filterValue);
        },
        Filter: ({ column }) => {
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
      {
        header: "EDAD",
        id: "age",
        accessorFn: (row) => {
          if (!row?.birth_date) return null;
          const birthDate = new Date(row.birth_date);
          const today = new Date();
          let age = today.getFullYear() - birthDate.getFullYear();
          const monthDiff = today.getMonth() - birthDate.getMonth();
          if (
            monthDiff < 0 ||
            (monthDiff === 0 && today.getDate() < birthDate.getDate())
          ) {
            age--;
          }
          return age;
        },
        cell: ({ getValue }) => {
          return (
            <div className="flex items-center gap-2 text-sm text-gray-700 uppercase truncate whitespace-nowrap">
              {getValue()} años
            </div>
          );
        },
        filterFn: "betweenNumbers",
      },
      {
        header: "RUT",
        accessorFn: (row) => row?.rut,
        cell: ({ getValue }) => (
          <div
            className="flex items-center gap-2 overflow-hidden text-sm text-gray-700 uppercase truncate whitespace-nowrap"
            title={getValue()}
          >
            <CreditCard className="w-4 h-4 text-gray-400" />
            {getValue()}
          </div>
        ),
      },
      {
        header: "COMUNA",
        id: "comuna_name",
        accessorFn: (row) => row?.comuna_name,
        cell: ({ getValue }) => (
          <div
            className="flex items-center gap-2 overflow-hidden text-sm text-gray-700 uppercase truncate whitespace-nowrap"
            title={getValue()}
          >
            <MapPin className="w-4 h-4 text-gray-400" />
            {getValue()}
          </div>
        ),
        filterFn: (row, columnId, filterValue) => {
          if (!filterValue) return true;
          return (
            String(row.getValue(columnId) ?? "").toLowerCase() ===
            String(filterValue).toLowerCase()
          );
        },
      },
      {
        header: "DIRECCIÓN",
        accessorFn: (row) => row?.full_address,
        cell: ({ getValue }) => (
          <div
            className="flex items-center gap-2 overflow-hidden text-sm text-gray-700 uppercase truncate whitespace-nowrap"
            title={getValue()}
          >
            <Map className="w-4 h-4 text-gray-400" />
            {getValue()}
          </div>
        ),
      },
      {
        header: "CORREO",
        accessorFn: (row) => row?.email,
        cell: ({ getValue }) => (
          <div
            className="flex items-center gap-2 overflow-hidden text-sm text-gray-700 uppercase truncate whitespace-nowrap"
            title={getValue()}
          >
            <Mail className="w-4 h-4 text-gray-400" />
            {getValue()}
          </div>
        ),
      },
      {
        header: "TELÉFONO",
        accessorFn: (row) => row?.phone,
        cell: ({ getValue }) => (
          <div
            className="flex items-center gap-2 overflow-hidden text-sm text-gray-700 uppercase truncate whitespace-nowrap"
            title={getValue()}
          >
            <Phone className="w-4 h-4 text-gray-400" />
            {getValue()}
          </div>
        ),
      },
      {
        header: "ÚLTIMA ATENCIÓN",
        accessorFn: (row) => row?.last_doctor_name,
        cell: ({ getValue }) => (
          <div
            className="flex items-center gap-2 overflow-hidden text-sm text-gray-700 uppercase truncate whitespace-nowrap"
            title={getValue()}
          >
            <Stethoscope className="w-4 h-4 text-gray-400" />
            {getValue()}
          </div>
        ),
      },
    ],
    [handleOpenModalDelete, communes]
  );

  // Configuración de la tabla
  const table = useReactTable({
    data: patients,
    columns,
    state: {
      sorting,
      globalFilter: searchTerm,
      columnFilters,
      pagination: { pageSize, pageIndex },
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: setSearchTerm,
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
        if (value === null || value === undefined) return false;
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

  const exportToExcel = () => {
    const dataToExport = table.getPrePaginationRowModel().rows.map((row) => {
      const obj = {};
      row.getVisibleCells().forEach((cell) => {
        const header = cell.column.columnDef.header;
        if (header) {
          obj[header] = cell.getValue();
        }
      });
      return obj;
    });

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Pacientes");

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });
    const data = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(data, "pacientes.xlsx");
  };

  const detailPatient = ({ id }) => {
    get(route("patients.treatments.index", { id: id }));
  };

  return (
    <div className="max-w-full">
      {/* Filtro global */}
      <div className="p-4 bg-white border border-gray-200 shadow-sm rounded-xl">
        <div className="flex flex-col gap-4">
          {/* Search Bar */}
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute w-5 h-5 text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
              <input
                type="text"
                placeholder="Buscar por nombre, apellido, RUT o correo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none transition-colors"
              />
            </div>

            <button
              onClick={() => setShowFilters((s) => !s)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-colors ${
                showFilters
                  ? "bg-blue-50 text-blue-600 border-2 border-blue-200"
                  : "bg-gray-50 text-gray-700 border-2 border-gray-200 hover:bg-gray-100"
              }`}
            >
              <Filter className="w-4 h-4" />
              Filtros
              {hasActiveFilters && (
                <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
              )}
            </button>

            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-2 px-4 py-2.5 bg-gray-50 text-gray-700 border-2 border-gray-200 rounded-lg hover:bg-gray-100 transition-colors font-medium"
              >
                <X className="w-4 h-4" />
                Limpiar
              </button>
            )}
            <div className="flex justify-end mb-2">
              <button
                onClick={exportToExcel}
                className="flex items-center gap-2 px-4 py-2 font-medium text-gray-700 transition-colors bg-white border-2 border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300"
              >
                <Download className="w-4 h-4" />
                Exportar a Excel
              </button>
            </div>
          </div>

          {/* Filter Panel */}
          {showFilters && (
            <div className="grid grid-cols-1 gap-3 pt-3 border-t border-gray-200 md:grid-cols-5">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                  Estado
                </label>
                <select
                  value={filterEstado}
                  onChange={(e) =>
                    setFilterEstado(
                      e.target.value === "Todos" ? "" : e.target.value
                    )
                  }
                  className="w-full px-3 py-2 text-sm border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
                >
                  <option>Todos</option>
                  <option>Activo</option>
                  <option>Inactivo</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                  Estado de Pago
                </label>
                <select
                  value={filterEstadoPago}
                  onChange={(e) =>
                    setFilterEstadoPago(
                      e.target.value === "Todos" ? "" : e.target.value
                    )
                  }
                  className="w-full px-3 py-2 text-sm border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
                >
                  <option>Todos</option>
                  <option>Al día</option>
                  <option>Con deuda</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                  Comuna
                </label>
                <select
                  value={filterComuna}
                  onChange={(e) =>
                    setFilterComuna(
                      e.target.value === "Todas" ? "" : e.target.value
                    )
                  }
                  className="w-full px-3 py-2 text-sm border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
                >
                  <option>Todas</option>
                  {comunasPresentes.map((comuna) => (
                    <option key={comuna} value={comuna}>
                      {comuna}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                  Edad Mínima
                </label>
                <input
                  type="number"
                  value={edadMin}
                  onChange={(e) => setEdadMin(e.target.value)}
                  placeholder="0"
                  className="w-full px-3 py-2 text-sm border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                  Edad Máxima
                </label>
                <input
                  type="number"
                  value={edadMax}
                  onChange={(e) => setEdadMax(e.target.value)}
                  placeholder="100"
                  className="w-full px-3 py-2 text-sm border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>
          )}
        </div>

        {/* Tabla */}
        <div className="pt-4 overflow-hidden rounded-xl">
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
            total={table.getFilteredRowModel().rows.length}
            pageSize={pageSize}
            setPageSize={setPageSize}
            pageSizeOptions={[5, 10, 15, 20, 30, 40, 50]}
          />
        </div>
      </div>
    </div>
  );
}
