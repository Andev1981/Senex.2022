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
  List,
  Building,
  PlusCircleIcon,
  Plus,
} from "lucide-react";
import PrimaryButton from "@/Components/PrimaryButton";
import TablePagination from "@/Components/TablePagination";

export default function AgreementsTable({
  agreements,
  handleOpenAgreementForm,
  handleOpenListRules,
  handleOpenRuleForm,
  handleOpenModalDelete,
}) {
  const [sorting, setSorting] = useState([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [pageSize, setPageSize] = useState(10);
  const [columnFilters, setColumnFilters] = useState([]);
  const [pageIndex, setPageIndex] = useState(0);

  const data = useMemo(() => agreements || [], [agreements]);

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
        accessorKey: "name",
        header: "CONVENIO",
        cell: ({ getValue }) => (
          <div className="font-medium uppercase flex items-center">
            {" "}
            <Building className="w-5 h-5 mr-2 text-indigo-500" />
            {getValue()}
          </div>
        ),
      },
      {
        accessorKey: "insurance.name",
        header: "ASEGURADORA",
        cell: ({ getValue }) => (
          <div className="text-gray-600">{getValue()}</div>
        ),
      },
      {
        accessorKey: "version",
        header: "VERSIÓN",
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
      {
        id: "actions",
        header: "",
        cell: ({ row }) => (
          <div className="flex gap-4">
            <PrimaryButton
              type="button"
              className="p-1 btn hover:scale-105"
              onClick={() => handleOpenAgreementForm(row?.original)}
            >
              <Pencil className="w-4 h-4" />
            </PrimaryButton>
            <PrimaryButton
              type="button"
              className="p-1 bg-red-600 btn hover:scale-105"
              onClick={() => handleOpenModalDelete(row?.original)}
            >
              <Trash2 className="w-4 h-4" />
            </PrimaryButton>

            <PrimaryButton
              type="button"
              className={
                row?.original?.rules?.length > 0
                  ? "p-1 bg-sky-400 btn gap-2 shadow-md hover:scale-105"
                  : "p-1 bg-gray-400 btn gap-2 shadow-md hover:scale-105"
              }
              onClick={() => handleOpenRuleForm(row?.original)}
            >
              <Plus className="w-4 h-4" /> Reglas
            </PrimaryButton>
            <PrimaryButton
              type="button"
              className="p-1 bg-green-600 btn gap-2 shadow-md hover:scale-105"
              onClick={() => handleOpenListRules(row?.original)}
            >
              <Search className="w-4 h-4" /> Ver Reglas (
              {row.original.rules.length})
            </PrimaryButton>
          </div>
        ),
      },
    ],
    [handleOpenModalDelete, handleOpenRuleForm, handleOpenAgreementForm]
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
    <div className="max-w-full p-6 mt-6 overflow-hidden bg-white rounded-lg shadow-xl">
      {/* Global Filter */}
      <div className="flex flex-col gap-3 mb-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:w-72">
          <Search className="absolute w-4 h-4 text-gray-400 top-2 left-2" />
          <input
            value={globalFilter ?? ""}
            onChange={(e) => setGlobalFilter(e.target.value)}
            placeholder="Buscar de convenios..."
            className="w-full py-2 pl-8 pr-3 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="w-full overflow-x-auto rounded-lg">
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
                  No se han creado convenios...
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
      <TablePagination
        table={table}
        total={agreements.length}
        pageSize={pageSize}
        setPageSize={setPageSize}
        pageSizeOptions={[5, 10, 15, 20, 30, 40, 50]} // Opcional
      />
    </div>
  );
}
