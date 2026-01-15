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
  Trash2,
  LucideHand,
  Eye,
} from "lucide-react";
import PrimaryButton from "@/Components/PrimaryButton";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import TablePagination from "@/Components/TablePagination";
import { route } from "ziggy-js";
import { useForm } from "@inertiajs/react";
import {
  meses,
  patientStatuses,
  debtStatuses,
  DEBT_STATUS_OPTIONS,
  PATIENT_STATUS_OPTIONS,
} from "@/helpers/status";
import SecondaryButton from "@/Components/SecondaryButton";

export default function TableTreatments({
  treatment,
  setOpenModalTreatmentsList,
  treatments,
}) {
  const { get, processing } = useForm();
  const [sorting, setSorting] = useState([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [pageSize, setPageSize] = useState(10);
  const [columnFilters, setColumnFilters] = useState([]);
  const [pageIndex, setPageIndex] = useState(0);

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

  // Definición de columnas
  const columns = useMemo(
    () => [
      {
        id: "actions",
        header: "",
        cell: ({ row }) => (
          <div className="flex">
            <a
              type="button"
              className="mr-1 hover:cursor-pointer btn"
              /*  onClick={() => detailPatient(row?.original)} */
            >
              <Eye className="w-4 h-4 text-green-600" />
            </a>
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
        // filtro: acepta múltiples estados (array de strings)
        filterFn: (row, id, filterValue) => {
          if (!filterValue) return true; // sin filtro
          return String(row.getValue(id) ?? "") === String(filterValue);
        },
      },
      {
        header: "NOMBRE",
        accessorFn: (row) => row?.default_session_type?.name,
        cell: ({ getValue }) => (
          <div
            className="overflow-hidden uppercase truncate whitespace-nowrap"
            title={getValue()}
          >
            {getValue()}
          </div>
        ),
      },
      {
        header: "FECHA INICIO",
        accessorFn: (row) => row?.start_date,
        id: "start_date",
        cell: ({ getValue }) =>
          getValue() ? new Date(getValue()).toLocaleDateString("es-CL") : "-",
        filterFn: (row, columnId, filterValue) => {
          if (!filterValue) return true; // si no hay filtro, mostrar todo
          const value = row.getValue(columnId);
          if (!value) return false;
          const date = new Date(value);
          const month = date.getMonth() + 1; // enero = 0 → sumamos 1
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
        header: "FECHA TERMINO",
        accessorFn: (row) => row?.end_date,
        id: "end_date",
        cell: ({ getValue }) =>
          getValue() ? new Date(getValue()).toLocaleDateString("es-CL") : "-",
        filterFn: (row, columnId, filterValue) => {
          if (!filterValue) return true; // si no hay filtro, mostrar todo
          const value = row.getValue(columnId);
          if (!value) return false;
          const date = new Date(value);
          const month = date.getMonth() + 1; // enero = 0 → sumamos 1
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
    ],
    []
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

  // Función auxiliar
  function parseDateString(dateString) {
    if (!dateString) return null;
    const [year, month, day] = dateString.split("-").map(Number);
    return new Date(year, month - 1, day); // mes es 0-indexed
  }

  const exportToExcel = () => {
    // Solo exportar filas visibles (filtradas y paginadas)
    const dataToExport = table.getPrePaginationRowModel().rows.map((row) => {
      const obj = {};
      row.getVisibleCells().forEach((cell) => {
        const header = cell.column.columnDef.header;
        obj[header] = cell.getValue();
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
    // Lógica para mostrar los detalles del paciente

    get(route("pacientes.show", { id: id }));
  };

  return (
    <div className="max-w-full mx-6">
      {/* Filtro global */}
      <div className="flex flex-col gap-3 mb-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:w-72">
          <Search className="absolute w-4 h-4 text-gray-400 top-2 left-2" />
          <input
            value={globalFilter ?? ""}
            onChange={(e) => setGlobalFilter(e.target.value)}
            placeholder="Buscar pacientes..."
            className="w-full py-2 pl-8 pr-3 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
        <div className="flex justify-end mb-2">
          <PrimaryButton type="button" onClick={exportToExcel}>
            Exportar a Excel
          </PrimaryButton>
        </div>
      </div>

      {/* Tabla */}
      <div className="w-full overflow-x-auto">
        <table className="min-w-[900px] w-full border-collapse border border-gray-200 shadow-sm rounded-md overflow-hidden">
          <thead className="bg-gray-100">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    onClick={header.column.getToggleSortingHandler()}
                    className="px-2 py-1 text-sm font-semibold text-left text-gray-700 transition border border-gray-200 cursor-pointer select-none hover:bg-gray-200"
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
                        {/* Filtro rango de fechas */}
                        {["FECHA NACIMIENTO"].includes(
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
                        ) : header.column.columnDef.header === "EDAD" ? (
                          <div className="flex gap-2">
                            <input
                              type="number"
                              placeholder="Min"
                              value={header.column.getFilterValue()?.[0] ?? ""}
                              onChange={(e) =>
                                header.column.setFilterValue([
                                  e.target.value
                                    ? Number(e.target.value)
                                    : undefined,
                                  header.column.getFilterValue()?.[1],
                                ])
                              }
                              className="w-20 px-1 py-1 text-sm border border-gray-300 rounded-md"
                            />
                            <input
                              type="number"
                              placeholder="Max"
                              value={header.column.getFilterValue()?.[1] ?? ""}
                              onChange={(e) =>
                                header.column.setFilterValue([
                                  header.column.getFilterValue()?.[0],
                                  e.target.value
                                    ? Number(e.target.value)
                                    : undefined,
                                ])
                              }
                              className="w-20 px-1 py-1 text-sm border border-gray-300 rounded-md"
                            />
                          </div>
                        ) : header.column.columnDef.header ===
                          "ESTADO DE PAGO" ? (
                          <select
                            value={header.column.getFilterValue() ?? ""}
                            onChange={(e) =>
                              header.column.setFilterValue(
                                e.target.value || undefined
                              )
                            }
                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md"
                          >
                            <option value="">Todas</option>
                            {DEBT_STATUS_OPTIONS.map((opt) => (
                              <option key={opt.value} value={opt.value}>
                                {opt.label}
                              </option>
                            ))}
                          </select>
                        ) : header.column.columnDef.header === "ESTADO" ? (
                          <select
                            value={header.column.getFilterValue() ?? ""}
                            onChange={(e) =>
                              header.column.setFilterValue(
                                e.target.value || undefined
                              )
                            }
                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md"
                          >
                            <option value="">Todas</option>
                            {PATIENT_STATUS_OPTIONS.map((opt) => (
                              <option key={opt.value} value={opt.value}>
                                {opt.label}
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
            {table.getRowModel().rows.map((row) => (
              <tr
                key={row.id}
                className="transition even:bg-gray-50 hover:bg-gray-100"
              >
                {row.getVisibleCells().map((cell) => (
                  <td
                    key={cell.id}
                    className="px-2 py-1 text-sm border border-gray-200"
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
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
        pagesizeOptions={[5, 10, 15, 20, 30, 40, 50]} // Opcional
      />
      <hr className="my-4" />

      <div className="flex justify-end gap-3 px-4 pb-4 my-4">
        <SecondaryButton
          type="button"
          variant="outline"
          onClick={() => setOpenModalTreatmentsList(false)}
          disabled={processing}
        >
          Cancelar
        </SecondaryButton>
      </div>
    </div>
  );
}
