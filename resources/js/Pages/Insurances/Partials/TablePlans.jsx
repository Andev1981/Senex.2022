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
  Pencil,
  Trash2,
  Search,
  BrickWallShield,
  Plus,
  ListCheck,
} from "lucide-react";
import PrimaryButton from "@/Components/PrimaryButton";

export default function TablePlans({
  plans,
  insurance,
  handleOpenModalPlanEdit,
  handleOpenModalPlanDelete,
}) {
  const [sorting, setSorting] = useState([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [pageSize, setPageSize] = useState(10);
  const [columnFilters, setColumnFilters] = useState([]);
  const [pageIndex, setPageIndex] = useState(0);

  const data = useMemo(() => plans || [], [plans]);

  const filteredData = useMemo(() => {
    if (!globalFilter) return data;
    const filter = globalFilter.toLowerCase();
    return data.filter((row) =>
      Object.values(row).some(
        (val) => val && val.toString().toLowerCase().includes(filter)
      )
    );
  }, [globalFilter, data]);

  const columns = useMemo(
    () => [
      {
        id: "actions",
        header: "",
        cell: ({ row }) => (
          <div className="flex gap-1">
            <PrimaryButton
              type="button"
              className="p-1 btn"
              onClick={() => handleOpenModalPlanEdit(row?.original)}
            >
              <Pencil className="w-4 h-4" />
            </PrimaryButton>
            <PrimaryButton
              type="button"
              className="p-1 bg-red-600 btn"
              onClick={() => handleOpenModalPlanDelete(row?.original)}
            >
              <Trash2 className="w-4 h-4" />
            </PrimaryButton>
          </div>
        ),
        enableSorting: false,
      },
      {
        accessorKey: "name",
        header: "NOMBRE",
        cell: ({ getValue }) => (
          <div className="font-medium uppercase">{getValue()}</div>
        ),
      },
      {
        accessorKey: "code",
        header: "CÓDIGO",
        cell: ({ getValue }) => (
          <div className="text-gray-600">{getValue()}</div>
        ),
      },
      {
        accessorKey: "billing_type",
        header: "TIPO DE PAGO",
        cell: ({ getValue }) => (
          <div className="text-gray-600">{getValue() || "-"}</div>
        ),
      },
      {
        accessorKey: "is_family",
        header: "PLAN FAMILIAR",
        cell: ({ getValue }) => {
          const isActive = getValue();
          return (
            <span
              className={`px-2 py-1 rounded-full text-xs font-medium ${
                isActive
                  ? "bg-green-100 text-green-800"
                  : "bg-red-100 text-red-800"
              }`}
            >
              {isActive ? "Activo" : "Inactivo"}
            </span>
          );
        },
      },
      {
        accessorKey: "price",
        header: "PRECIO",
        cell: ({ getValue }) => (
          <div className="text-gray-600">{getValue() || "-"}</div>
        ),
      },
      {
        accessorKey: "coverage_percentage",
        header: "COVERTURA %",
        cell: ({ getValue }) => (
          <div className="text-gray-600">{getValue() || "-"}</div>
        ),
      },
      {
        accessorKey: "is_active",
        header: "ESTADO",
        cell: ({ getValue }) => {
          const isActive = getValue();
          return (
            <span
              className={`px-2 py-1 rounded-full text-xs font-medium ${
                isActive
                  ? "bg-green-100 text-green-800"
                  : "bg-red-100 text-red-800"
              }`}
            >
              {isActive ? "Activo" : "Inactivo"}
            </span>
          );
        },
        filterFn: "equals",
      },
    ],
    [handleOpenModalPlanEdit, handleOpenModalPlanDelete]
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
    <div>
      <div className="flex items-center justify-between p-6 bg-white rounded-lg shadow mb-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-12 h-12 shadow-lg bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl">
            <ListCheck className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {insurance && "Planes: " + insurance?.name}
            </h1>
            <p className="text-sm text-gray-600">Gestión de planes</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => handleOpenModalPlanEdit()}
            className="flex items-center gap-2 px-6 py-2 font-semibold text-white transition-colors bg-blue-600 rounded-lg shadow-lg hover:bg-blue-700 shadow-blue-500/30"
          >
            <Plus className="w-4 h-4" />
            Nuevo Plan
          </button>
        </div>
      </div>

      {/* Global Filter */}
      <div className="flex items-center justify-between p-6 bg-white rounded-lg shadow mb-4">
        <div className="relative w-full sm:w-72">
          <Search className="absolute w-4 h-4 text-gray-400 top-2 left-2" />
          <input
            value={globalFilter ?? ""}
            onChange={(e) => setGlobalFilter(e.target.value)}
            placeholder="Buscar plan..."
            className="w-full py-2 pl-8 pr-3 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="flex items-center justify-between p-6 bg-white rounded-lg shadow mb-4">
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

                    {header.column.getCanFilter() &&
                      header.column.id === "is_active" && (
                        <div className="mt-1">
                          <select
                            value={header.column.getFilterValue() ?? ""}
                            onChange={(e) =>
                              header.column.setFilterValue(
                                e.target.value !== ""
                                  ? e.target.value === "true"
                                  : undefined
                              )
                            }
                            className="w-full p-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                          >
                            <option value="">All</option>
                            <option value="true">Active</option>
                            <option value="false">Inactive</option>
                          </select>
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
                  No se han creado planes
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  className="transition even:bg-gray-50 hover:bg-gray-100"
                >
                  {row.getVisibleCells().map((cell) => (
                    <td
                      key={cell.id}
                      className="px-2 py-1 text-sm border border-gray-200"
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

      {/* Pagination */}
      {/* <TablePagination
        table={table}
        total={plans.length}
        pageSize={pageSize}
        setPageSize={setPageSize}
        pageSizeOptions={[5, 10, 15, 20, 30, 40, 50]}
      /> */}
    </div>
  );
}
