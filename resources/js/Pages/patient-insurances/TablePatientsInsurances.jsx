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
  ScanEye,
} from "lucide-react";
import PrimaryButton from "@/Components/PrimaryButton";
import TablePagination from "@/Components/TablePagination";
import { useForm } from "@inertiajs/react";
import { fmtDate } from "@/utils/utils";

export default function TablePatientsInsurances({
  patientsInsurances,
  handleOpenModalCreateEdit,
  handleOpenModalDelete,
}) {
  const [sorting, setSorting] = useState([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [pagesize, setpagesize] = useState(10);
  const [columnFilters, setColumnFilters] = useState([]);
  const [pageIndex, setPageIndex] = useState(0);
  const { get, reset } = useForm();

  const data = useMemo(() => patientsInsurances || [], [patientsInsurances]);

  const filteredData = useMemo(() => {
    if (!globalFilter) return data;
    const filter = globalFilter.toLowerCase();
    return data.filter((row) =>
      Object.values(row).some(
        (val) => val && val.toString().toLowerCase().includes(filter)
      )
    );
  }, [globalFilter, data]);

  const handleInsurancePlans = (insurance) => {
    if (insurance) {
      get(route("patientsInsurances.plans", insurance), {
        onSuccess: () => {
          reset();
        },
      });
    }
  };

  const columns = useMemo(
    () => [
      {
        id: "actions",
        header: "",
        cell: ({ row }) => (
          <div className="flex gap-4">
            <PrimaryButton
              type="button"
              className="p-1 btn"
              onClick={() => handleOpenModalCreateEdit(row?.original)}
            >
              <Pencil className="w-4 h-4" />
            </PrimaryButton>
            <PrimaryButton
              type="button"
              className="p-1 bg-red-600 btn"
              onClick={() => handleOpenModalDelete(row?.original)}
            >
              <Trash2 className="w-4 h-4" />
            </PrimaryButton>
          </div>
        ),
      },
      {
        accessorKey: "insurance.name",
        header: "ASEGURADORA",
        cell: ({ getValue }) => (
          <div className="font-medium uppercase">{getValue()}</div>
        ),
      },
      {
        accessorKey: "patient.full_name",
        header: "PACIENTE",
        cell: ({ getValue }) => (
          <div className="text-gray-600">{getValue()}</div>
        ),
      },
      {
        accessorKey: "plan.code",
        header: "CODIGO",
        cell: ({ getValue }) => (
          <div className="text-gray-600">{getValue() || "-"}</div>
        ),
      },
      {
        accessorKey: "start_date",
        header: "FECHA INICIO",
        cell: ({ getValue }) => (
          <div className="text-gray-600">{fmtDate(getValue()) || "-"}</div>
        ),
      },
      {
        accessorKey: "end_date",
        header: "FECHA TÉRMINO",
        cell: ({ getValue }) => (
          <div className="text-gray-600">{fmtDate(getValue()) || "-"}</div>
        ),
      },
      {
        accessorKey: "status",
        header: "ESTADO",
        cell: ({ getValue }) => (
          <div className="text-gray-600">{getValue() || "-"}</div>
        ),
        filterFn: "equals",
      },
      /*   {
        accessorKey: "is_active",
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
      }, */
    ],
    [handleOpenModalCreateEdit, handleOpenModalDelete]
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
  });

  return (
    <div className="max-w-full p-6 mt-6 bg-white rounded-lg shadow">
      {/* Global Filter */}
      <div className="flex flex-col gap-3 mb-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:w-72">
          <Search className="absolute w-4 h-4 text-gray-400 top-2 left-2" />
          <input
            value={globalFilter ?? ""}
            onChange={(e) => setGlobalFilter(e.target.value)}
            placeholder="Buscar aseguradoras..."
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
                  Sin convenios agregados
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
        total={patientsInsurances?.length}
        pagesize={pagesize}
        setpagesize={setpagesize}
        pagesizeOptions={[5, 10, 15, 20, 30, 40, 50]} // Opcional
      />
    </div>
  );
}
