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
  PencilLine,
  Trash2,
} from "lucide-react";
import PrimaryButton from "@/Components/PrimaryButton";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

const clp = new Intl.NumberFormat("es-CL", {
  style: "currency",
  currency: "CLP",
});

export default function TableSessionTypes({
  sessionTypes = [],
  handleOpenModalOptions,
  handleOpenModalDelete,
}) {
  const [sorting, setSorting] = useState([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [pageSize, setPageSize] = useState(10);
  const [pageIndex, setPageIndex] = useState(0);

  // Columnas
  const columns = useMemo(
    () => [
      {
        id: "actions",
        header: "",
        enableSorting: false,
        cell: ({ row }) => (
          <div className="flex">
            <PrimaryButton
              type="button"
              className="mr-1 btn"
              onClick={() => handleOpenModalOptions?.(row.original)}
              title="Editar"
            >
              <PencilLine className="w-4 h-4 mr-1" />
            </PrimaryButton>
            <PrimaryButton
              type="button"
              className="mr-1 btn bg-red-600 hover:bg-red-700"
              onClick={() => handleOpenModalDelete?.(row.original)}
              title="Eliminar"
            >
              <Trash2 className="w-4 h-4" />
            </PrimaryButton>
          </div>
        ),
      },
      {
        header: "NOMBRE",
        accessorKey: "name",
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
        header: "PRECIO BASE",
        accessorKey: "base_price",
        sortingFn: "alphanumeric",
        cell: ({ getValue }) => {
          const v = Number(getValue() ?? 0);
          return <span>{clp.format(isNaN(v) ? 0 : v)}</span>;
        },
      },
      {
        header: "DURACIÓN (MIN)",
        accessorKey: "duration_minutes",
        sortingFn: "basic",
        cell: ({ getValue }) => {
          const v = getValue();
          return v ? `${v} min` : "-";
        },
      },
      {
        header: "CANTIDAD SESIONES",
        accessorKey: "plan_session_value",
        sortingFn: "basic",
        cell: ({ getValue }) => {
          const v = getValue();
          return v ?? "-";
        },
      },
      {
        header: "PLAN",
        accessorKey: "plan_eligible",
        enableSorting: true,
        cell: ({ getValue }) => {
          const ok = !!getValue();
          return (
            <span
              className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${
                ok ? "bg-blue-100 text-blue-800" : "bg-gray-200 text-gray-700"
              }`}
            >
              {ok ? "ELEGIBLE" : "NO"}
            </span>
          );
        },
      },
      {
        header: "ACTIVO",
        accessorKey: "is_active",
        enableSorting: true,
        cell: ({ getValue }) => {
          const active = !!getValue();
          return (
            <span
              className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${
                active
                  ? "bg-green-100 text-green-800"
                  : "bg-red-100 text-red-800"
              }`}
            >
              {active ? "ACTIVO" : "INACTIVO"}
            </span>
          );
        },
      },
    ],
    [handleOpenModalDelete, handleOpenModalOptions]
  );

  // Tabla (sin prefiltrar fuera de react-table)
  const table = useReactTable({
    data: sessionTypes,
    columns,
    state: {
      sorting,
      globalFilter,
      pagination: { pageIndex, pageSize },
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    onPaginationChange: (updater) => {
      const next =
        typeof updater === "function"
          ? updater({ pageIndex, pageSize })
          : updater;
      setPageIndex(next.pageIndex);
      setPageSize(next.pageSize);
    },
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    globalFilterFn: "includesString",
  });

  return (
    <div className="max-w-full">
      {/* Filtro global + Export */}
      <div className="flex flex-col gap-3 mb-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="absolute w-4 h-4 text-gray-400 top-2 left-2" />
          <input
            value={globalFilter ?? ""}
            onChange={(e) => {
              setPageIndex(0); // reset a primera página al filtrar
              setGlobalFilter(e.target.value);
            }}
            placeholder="Buscar tipos de sesión…"
            className="w-full py-2 pl-8 pr-3 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
        <div className="flex justify-end mb-2">
          <PrimaryButton type="button" onClick={() => handleOpenModalOptions()}>
            Sesión +
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
                    onClick={header.column.getToggleSortingHandler?.()}
                    className="px-2 py-1 text-sm font-semibold text-left text-gray-700 transition border border-gray-200 cursor-pointer select-none hover:bg-gray-200"
                    scope="col"
                  >
                    <div className="flex items-center">
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
            {table.getRowModel().rows.length === 0 && (
              <tr>
                <td
                  colSpan={columns.length}
                  className="p-4 text-center text-sm text-gray-500"
                >
                  Sin resultados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Paginación */}
      <div className="flex flex-col items-center justify-between gap-2 mt-4 sm:flex-row">
        <div className="text-sm text-gray-700">
          Página {table.getState().pagination.pageIndex + 1} de{" "}
          {table.getPageCount() || 1}
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
            const size = Number(e.target.value);
            setPageSize(size);
            table.setPageSize(size);
            setPageIndex(0);
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
