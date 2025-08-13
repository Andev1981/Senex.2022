import React, { useState, useMemo } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  flexRender,
} from "@tanstack/react-table";
import * as XLSX from "xlsx";
import { ChevronDown, ChevronUp, PencilLine } from "lucide-react";
import PrimaryButton from "@/Components/PrimaryButton";

export default function TableSesiones({
  sesiones,
  handleOpenModalOptions,
  handleOpenModalContactPersons,
}) {
  const [sorting, setSorting] = useState([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [pageSize, setPageSize] = useState(10);

  // Filtrado global simple (busca en todas las columnas)
  const filteredData = useMemo(() => {
    if (!globalFilter) return sesiones || [];
    const filter = globalFilter.toLowerCase();
    return sesiones.filter((row) =>
      Object.values(row).some(
        (val) => val && val.toString().toLowerCase().includes(filter)
      )
    );
  }, [globalFilter, sesiones]);

  const columns = useMemo(
    () => [
      {
        id: "actions",
        header: "",
        cell: ({ row }) => (
          <div className="flex">
            <PrimaryButton
              type="button"
              className="btn"
              onClick={() => handleOpenModalOptions(row?.original)}
            >
              <PencilLine className="w-4 h-4" />
            </PrimaryButton>
          </div>
        ),
        enableSorting: false,
      },
      { accessorKey: "numero_sesion", header: "#" },
      {
        accessorKey: "fecha_atencion",
        header: "Fecha de Atención",
        cell: ({ getValue }) => new Date(getValue()).toLocaleDateString(),
        enableSorting: true,
      },
      {
        header: "PACIENTE",
        accessorFn: (row) => row?.patient?.name + " " + row?.patient?.last_name,
      },
      {
        header: "KINE",
        accessorFn: (row) => row?.doctor?.name + " " + row?.doctor?.last_name,
      },
      /*    { accessorKey: "tipo", header: "TIPO" }, */
      { accessorKey: "price", header: "VALOR PACIENTE" },
      { accessorKey: "status", header: "ESTADO" },
    ],
    [handleOpenModalOptions, handleOpenModalContactPersons]
  );

  const table = useReactTable({
    data: filteredData,
    columns,
    state: { sorting, globalFilter },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: "includesString",
  });

  const exportToExcel = () => {
    const exportData = filteredData.map((item) => ({
      Nombre: item?.name,
      Apellido: item?.last_name,
      Edad: item?.birth
        ? new Date().getFullYear() - new Date(item.birth).getFullYear()
        : "N/A",
      Email: item?.email,
      Direccion: item?.direccion,
      Comuna: item?.comuna_nombre,
      Ultima_atencion: item?.doctor_nombre,
      Teléfono: item?.phone,
      Rut: item?.rut,
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sesiones");
    XLSX.writeFile(workbook, "sesiones.xlsx");
  };

  return (
    <div className="max-w-full p-4">
      <div className="flex flex-col gap-3 mb-4 sm:flex-row sm:items-center sm:justify-between">
        <input
          value={globalFilter ?? ""}
          onChange={(e) => setGlobalFilter(e.target.value)}
          placeholder="Buscar sesiones..."
          className="w-full px-3 py-2 transition border border-gray-300 rounded-md sm:w-72 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={exportToExcel}
          className="px-4 py-2 text-white transition bg-green-600 rounded-md hover:bg-green-700"
        >
          Exportar Excel
        </button>
      </div>
      <div className="w-full overflow-x-auto ">
        <table className="min-w-[700px] w-full border-collapse border border-gray-200 shadow-sm rounded-md overflow-hidden">
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
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
                    {{
                      asc: <ChevronDown className="inline w-4 h-4 ml-1" />,
                      desc: <ChevronUp className="inline ml-1" />,
                    }[header.column.getIsSorted()] ?? null}
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
