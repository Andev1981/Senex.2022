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
  Calendar,
  PencilLine,
  Trash2,
} from "lucide-react";
import PrimaryButton from "@/Components/PrimaryButton";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

export default function TablePatients({
  pacientes,
  handleOpenModalOptions,
  handleOpenModalDelete,
  comunas,
}) {
  const [sorting, setSorting] = useState([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [pageSize, setPageSize] = useState(10);
  const [columnFilters, setColumnFilters] = useState([]);
  const [pageIndex, setPageIndex] = useState(0);

  // Filtro global
  const filteredData = useMemo(() => {
    if (!globalFilter) return pacientes || [];
    const filter = globalFilter.toLowerCase();
    return pacientes.filter((row) =>
      Object.values(row).some(
        (val) => val && val.toString().toLowerCase().includes(filter)
      )
    );
  }, [globalFilter, pacientes]);

  // Obtener comunas únicas
  /* const comunas = useMemo(() => {
    const set = new Set(pacientes.map((p) => p.comuna).filter(Boolean));
    return Array.from(set);
  }, [pacientes]); */

  // Definición de columnas
  const columns = useMemo(
    () => [
      {
        id: "actions",
        header: "",
        cell: ({ row }) => (
          <div className="flex">
            <PrimaryButton
              type="button"
              className="mr-1 btn"
              onClick={() => handleOpenModalOptions(row?.original)}
            >
              <PencilLine className="w-4 h-4 mr-1" />
            </PrimaryButton>
            <PrimaryButton
              type="button"
              className="mr-1 btn bg-red-600"
              onClick={() => handleOpenModalDelete(row?.original)}
            >
              <Trash2 className="w-4 h-4" />
            </PrimaryButton>
          </div>
        ),
        enableSorting: false,
      },
      {
        header: "NOMBRE",
        accessorFn: (row) => row?.name,
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
        header: "APELLIDO",
        accessorFn: (row) => row?.last_name,
        cell: ({ getValue }) => (
          <span className="overflow-hidden uppercase runcate whitespace-nowrap">
            {getValue()}
          </span>
        ),
      },
      {
        header: "FECHA NACIMIENTO",
        accessorFn: (row) => row?.birth,
        id: "birth",
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

      {
        header: "EDAD",
        accessorFn: (row) => {
          if (!row?.birth) return null;
          const birthDate = new Date(row.birth);
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
        id: "age",
        filterFn: {
          betweenDates: (row, columnId, filterValue) => {
            const [from, to] = filterValue || [];
            const value = row.getValue(columnId);
            if (!value) return false;

            const rowDate = new Date(value);

            let fromDate = from ? parseDateString(from) : null;
            let toDate = to ? parseDateString(to) : null;

            if (fromDate && rowDate < fromDate) return false;
            if (toDate && rowDate > toDate) return false;
            return true;
          },
        },
      },
      {
        header: "RUT",
        accessorFn: (row) => row?.rut,
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
        header: "COMUNA",
        accessorFn: (row) => row?.comuna_nombre,
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
        header: "DIRECCIÓN",
        accessorFn: (row) => row?.direccion,
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
        header: "CORREO",
        accessorFn: (row) => row?.email,
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
        header: "TELÉFONO",
        accessorFn: (row) => row?.phone,
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
        header: "ÚLTIMA ATENCIÓN",
        accessorFn: (row) => row?.doctor_nombre,
        cell: ({ getValue }) => (
          <div
            className="overflow-hidden uppercase truncate whitespace-nowrap"
            title={getValue()}
          >
            {getValue()}
          </div>
        ),
      },
    ],
    [handleOpenModalOptions]
  );

  const meses = [
    { name: "Enero", value: 1 },
    { name: "Febrero", value: 2 },
    { name: "Marzo", value: 3 },
    { name: "Abril", value: 4 },
    { name: "Mayo", value: 5 },
    { name: "Junio", value: 6 },
    { name: "Julio", value: 7 },
    { name: "Agosto", value: 8 },
    { name: "Septiembre", value: 9 },
    { name: "Octubre", value: 10 },
    { name: "Noviembre", value: 11 },
    { name: "Diciembre", value: 12 },
  ];

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

  return (
    <div className="max-w-full">
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
                            className="w-full py-1 px-2 text-sm border border-gray-300 rounded-md"
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
                              className="w-20 py-1 px-1 text-sm border border-gray-300 rounded-md"
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
                              className="w-20 py-1 px-1 text-sm border border-gray-300 rounded-md"
                            />
                          </div>
                        ) : header.column.columnDef.header === "COMUNA" ? (
                          <select
                            value={header.column.getFilterValue() ?? ""}
                            onChange={(e) =>
                              header.column.setFilterValue(
                                e.target.value || undefined
                              )
                            }
                            className="w-full py-1 px-2 text-sm border border-gray-300 rounded-md"
                          >
                            <option value="">Todas</option>
                            {comunas.map((c) => (
                              <option key={c.id} value={c.id}>
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
                            className="w-full py-1 px-2 text-sm border border-gray-300 rounded-md"
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
      <div className="flex flex-col items-center justify-between gap-2 mt-4 sm:flex-row">
        <div className="text-sm text-gray-700">
          Página {table.getState().pagination.pageIndex + 1} de{" "}
          {table.getPageCount()}
        </div>
        <div className="flex items-center gap-2">
          <button
            className="px-3 py-1 border border-gray-300 rounded-md hover:bg-gray-100 disabled:opacity-50"
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
          >
            {"<<"}
          </button>
          <button
            className="px-3 py-1 border border-gray-300 rounded-md hover:bg-gray-100 disabled:opacity-50"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            {"<"}
          </button>
          <button
            className="px-3 py-1 border border-gray-300 rounded-md hover:bg-gray-100 disabled:opacity-50"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            {">"}
          </button>
          <button
            className="px-3 py-1 border border-gray-300 rounded-md hover:bg-gray-100 disabled:opacity-50"
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            disabled={!table.getCanNextPage()}
          >
            {">>"}
          </button>
        </div>

        <select
          value={pageSize}
          onChange={(e) => {
            setPageSize(Number(e.target.value));
            table.setPageSize(Number(e.target.value));
          }}
          className="px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {[5, 10, 15, 20, 30, 40, 50].map((size) => (
            <option key={size} value={size}>
              Mostrar {size}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
