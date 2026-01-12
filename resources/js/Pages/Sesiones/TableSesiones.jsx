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
  Clock,
  CheckCircle2,
  XCircle,
  CalendarClock,
  ChevronDown,
  ChevronUp,
  PencilLine,
  Trash2,
  Search,
  DollarSign,
  Calendar,
} from "lucide-react";
import PrimaryButton from "@/Components/PrimaryButton";

export default function TableSesiones({
  sesiones,
  handleOpenModalOptions,
  handleOpenModalDelete,
}) {
  const [sorting, setSorting] = useState([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [pagesize, setpagesize] = useState(10);
  const [columnFilters, setColumnFilters] = useState([]);
  const [pageIndex, setPageIndex] = useState(0);

  const filteredData = useMemo(() => {
    if (!globalFilter) return sesiones || [];
    const filter = globalFilter.toLowerCase();
    return sesiones.filter((row) =>
      Object.values(row).some(
        (val) => val && val.toString().toLowerCase().includes(filter)
      )
    );
  }, [globalFilter, sesiones]);

  const betweenDatesFilterFn = (row, columnId, filterValue) => {
    const rowDate = new Date(row.getValue(columnId));
    const [start, end] = filterValue || [];
    if (!start && !end) return true;
    if (start && rowDate < new Date(start)) return false;
    if (end && rowDate > new Date(end)) return false;
    return true;
  };

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
              <PencilLine className="w-4 h-4" />
            </PrimaryButton>
          </div>
        ),
        enableSorting: false,
      },
      {
        accessorKey: "status",
        header: "ESTADO",
        cell: ({ getValue, row }) => {
          const statusMap = {
            0: {
              text: "Pendiente",
              color: "bg-yellow-100 text-yellow-800",
              icon: <Clock className="w-4 h-4" />,
              action: (
                <PrimaryButton
                  type="button"
                  className="p-1 bg-red-600 btn"
                  onClick={() => handleOpenModalDelete(row?.original)}
                >
                  <Trash2 className="w-4 h-4" />
                </PrimaryButton>
              ),
            },
            1: {
              text: "Atendido",
              color: "bg-green-100 text-green-800",
              icon: <CheckCircle2 className="w-4 h-4" />,
            },
            2: {
              text: "Cancelado",
              color: "bg-red-100 text-red-800",
              icon: <XCircle className="w-4 h-4" />,
              action: (
                <PrimaryButton
                  type="button"
                  className="p-1 bg-red-600 btn"
                  onClick={() => handleOpenModalDelete(row?.original)}
                >
                  <Trash2 className="w-4 h-4" />
                </PrimaryButton>
              ),
            },
            3: {
              text: "Reagendado",
              color: "bg-blue-100 text-blue-800",
              icon: <CalendarClock className="w-4 h-4" />,
            },
          };
          const status = statusMap[getValue()] ?? {
            text: "Desconocido",
            color: "bg-gray-100 text-gray-800",
            icon: null,
            action: (
              <PrimaryButton
                type="button"
                className="p-1 bg-red-600 btn"
                onClick={() => handleOpenModalDelete(row?.original)}
              >
                <Trash2 className="w-4 h-4" />
              </PrimaryButton>
            ),
          };
          return (
            <span
              className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${status.color}`}
            >
              {status.icon} {status.text} {status.action}
            </span>
          );
        },
        filterFn: "equals",
      },
      { accessorKey: "numero_sesion", header: "#" },
      {
        accessorKey: "fecha_atencion",
        header: "FECHA_ATENCIÓN",
        cell: ({ getValue }) => new Date(getValue()).toLocaleDateString(),
        enableSorting: true,
        filterFn: "betweenDates",
      },
      {
        header: "PACIENTE",
        accessorFn: (row) => row?.patient_full_name,
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
        header: "KINE",
        accessorFn: (row) => row?.doctor_full_name,
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
        header: "VALOR_PACIENTE",
        accessorFn: (row) => Number(row?.price) || 0,
        cell: (info) => {
          const value = info.getValue();
          return value.toLocaleString("es-CL", {
            style: "currency",
            currency: "CLP",
            maximumFractionDigits: 0,
          });
        },
        filterFn: "betweenNumbers",
      },
      {
        header: "TIPO",
        accessorFn: (row) => row?.type_name,
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

  const table = useReactTable({
    data: filteredData,
    columns,
    state: {
      sorting,
      globalFilter,
      columnFilters,
      pagination: { pagesize, pageIndex },
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    onColumnFiltersChange: setColumnFilters,
    onPaginationChange: (updater) => {
      const newState =
        typeof updater === "function"
          ? updater({ pageIndex, pagesize })
          : updater;
      setPageIndex(newState.pageIndex);
      setpagesize(newState.pagesize);
    },
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    globalFilterFn: "includesString",
    filterFns: {
      betweenDates: betweenDatesFilterFn,
      betweenNumbers: (row, columnId, filterValue) => {
        const [min, max] = filterValue || [];
        const value = row.getValue(columnId);
        if (min !== undefined && value < min) return false;
        if (max !== undefined && value > max) return false;
        return true;
      },
    },
  });

  return (
    <div className="max-w-full">
      {/* Filtro global */}
      <div className="flex flex-col gap-3 mb-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:w-72">
          <Search className="absolute w-4 h-4 text-gray-400 top-2 left-2" />
          <input
            value={globalFilter ?? ""}
            onChange={(e) => setGlobalFilter(e.target.value)}
            placeholder="Buscar sesiones..."
            className="w-full py-2 pl-8 pr-3 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="w-full overflow-x-auto">
        <table className="min-w-[700px] w-full border-collapse border border-gray-200 shadow-sm rounded-md overflow-hidden">
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
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
                    <span>
                      {header.column.getIsSorted() === "asc" ? (
                        <ChevronUp className="inline w-4 h-4 ml-1" />
                      ) : header.column.getIsSorted() === "desc" ? (
                        <ChevronDown className="inline w-4 h-4 ml-1" />
                      ) : null}
                    </span>

                    {header.column.getCanFilter() && (
                      <div className="flex flex-col gap-1 mt-1">
                        {header.column.id === "status" ? (
                          <select
                            value={header.column.getFilterValue() ?? ""}
                            onChange={(e) =>
                              header.column.setFilterValue(
                                e.target.value !== ""
                                  ? Number(e.target.value)
                                  : undefined
                              )
                            }
                            className="p-2 text-sm uppercase border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                          >
                            <option value="" className="text-gray-500">
                              Todos
                            </option>
                            <option value="0">Pendiente</option>
                            <option value="1">Atendido</option>
                            <option value="2">Cancelado</option>
                            <option value="3">Reagendado</option>
                          </select>
                        ) : header.column.id === "fecha_atencion" ? (
                          <div className="flex gap-2">
                            <div className="relative w-32">
                              <Calendar className="absolute w-4 h-4 text-gray-400 top-2 left-2" />
                              <input
                                type="date"
                                value={
                                  header.column.getFilterValue()?.[0] ?? ""
                                }
                                onChange={(e) =>
                                  header.column.setFilterValue([
                                    e.target.value,
                                    header.column.getFilterValue()?.[1],
                                  ])
                                }
                                className="w-full py-1 pl-8 pr-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                              />
                            </div>
                            <div className="relative w-32">
                              <Calendar className="absolute w-4 h-4 text-gray-400 top-2 left-2" />
                              <input
                                type="date"
                                value={
                                  header.column.getFilterValue()?.[1] ?? ""
                                }
                                onChange={(e) =>
                                  header.column.setFilterValue([
                                    header.column.getFilterValue()?.[0],
                                    e.target.value,
                                  ])
                                }
                                className="w-full py-1 pl-8 pr-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                              />
                            </div>
                          </div>
                        ) : header.column.id === "VALOR_PACIENTE" ? (
                          <div className="flex gap-2">
                            <div className="relative w-24">
                              <DollarSign className="absolute w-4 h-4 text-gray-400 top-2 left-2" />
                              <input
                                type="number"
                                placeholder="Min"
                                value={
                                  header.column.getFilterValue()?.[0] ?? ""
                                }
                                onChange={(e) =>
                                  header.column.setFilterValue([
                                    e.target.value
                                      ? Number(e.target.value)
                                      : undefined,
                                    header.column.getFilterValue()?.[1],
                                  ])
                                }
                                className="w-full py-1 pl-8 pr-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                              />
                            </div>
                            <div className="relative w-24">
                              <DollarSign className="absolute w-4 h-4 text-gray-400 top-2 left-2" />
                              <input
                                type="number"
                                placeholder="Max"
                                value={
                                  header.column.getFilterValue()?.[1] ?? ""
                                }
                                onChange={(e) =>
                                  header.column.setFilterValue([
                                    header.column.getFilterValue()?.[0],
                                    e.target.value
                                      ? Number(e.target.value)
                                      : undefined,
                                  ])
                                }
                                className="w-full py-1 pl-8 pr-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                              />
                            </div>
                          </div>
                        ) : (
                          <div className="relative">
                            <Search className="absolute w-4 h-4 text-gray-400 top-2 left-2" />
                            <input
                              value={header.column.getFilterValue() ?? ""}
                              onChange={(e) =>
                                header.column.setFilterValue(e.target.value)
                              }
                              placeholder="Filtrar..."
                              className="w-full py-1 pl-8 pr-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                            />
                          </div>
                        )}
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
          value={pagesize}
          onChange={(e) => {
            setpagesize(Number(e.target.value));
            table.setpagesize(Number(e.target.value));
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
