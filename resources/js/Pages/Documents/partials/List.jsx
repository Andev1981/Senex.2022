import React, { useMemo, useState } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
} from "@tanstack/react-table";
import {
  CheckCircle,
  DollarSign,
  Download,
  Eye,
  FileText,
  Printer,
  Search,
  Send,
  XCircle,
  ArrowUpDown,
} from "lucide-react";
import TablePagination from "@/Components/TablePagination";
import { fmtDateISO, fmtDate } from "@/utils/utils";

export default function List({
  invoices = [], // Data completa
  setSelectedDocument,
  DTES_TYPES = [],
  DTES_STATUSES = {},
}) {
  // --- Estados de TanStack Table ---
  const [sorting, setSorting] = useState([]);
  const [pageSize, setPageSize] = useState(10);
  const [globalFilter, setGlobalFilter] = useState("");
  const [columnFilters, setColumnFilters] = useState([]);
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });

  // --- Cálculos para Dashboard (basados en toda la data) ---
  const dashboardStats = useMemo(() => {
    return {
      emitidos: invoices.filter((d) => d.status === "Emitido").length,
      aceptados: invoices.filter((d) => d.status === "Aceptado").length,
      rechazados: invoices.filter((d) => d.status === "Rechazado").length,
      totalMonto: invoices.reduce((sum, d) => sum + d.total, 0),
    };
  }, [invoices]);

  // --- Definición de Columnas ---
  const columns = useMemo(
    () => [
      {
        accessorKey: "dte_type",
        header: ({ column }) => {
          return (
            <button
              className="flex items-center gap-1 hover:text-gray-900"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
            >
              Tipo Doc.
              <ArrowUpDown className="w-3 h-3" />
            </button>
          );
        },
        cell: ({ getValue }) => {
          const typeValue = getValue();
          const docType = DTES_TYPES.find((dt) => dt.value === typeValue);
          const Icon = docType?.icon || FileText;
          const typeStyle = DTES_TYPES[typeValue] || { text: "text-gray-600" };

          return (
            <div className="flex items-center gap-2">
              <Icon className={`w-5 h-5 ${typeStyle?.styles?.text}`} />
              <span className="text-sm font-medium text-gray-900">
                {typeValue}
              </span>
            </div>
          );
        },
      },
      {
        accessorKey: "dte_folio",
        header: ({ column }) => {
          return (
            <button
              className="flex items-center gap-1 hover:text-gray-900"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
            >
              Folio
              <ArrowUpDown className="w-3 h-3" />
            </button>
          );
        },
        cell: ({ getValue }) => (
          <span className="font-mono text-sm text-gray-900">
            {getValue() || "Sin Folio"}
          </span>
        ),
      },
      {
        header: "Fecha",
        accessorKey: "date",
        header: ({ column }) => {
          return (
            <button
              className="flex items-center gap-1 hover:text-gray-900"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
            >
              Fecha
              <ArrowUpDown className="w-3 h-3" />
            </button>
          );
        },
        cell: ({ getValue }) => (
          <span className="text-sm text-gray-900">{fmtDate(getValue())}</span>
        ),
      },
      {
        accessorKey: "patient.full_name", // Accessor anidado para filtrado global automático
        header: ({ column }) => {
          return (
            <button
              className="flex items-center gap-1 hover:text-gray-900"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
            >
              Cliente
              <ArrowUpDown className="w-3 h-3" />
            </button>
          );
        },
        cell: ({ getValue }) => (
          <span className="text-sm text-gray-900">{getValue()}</span>
        ),
      },
      {
        accessorKey: "patient.rut",
        header: ({ column }) => {
          return (
            <button
              className="flex items-center gap-1 hover:text-gray-900"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
            >
              RUT
              <ArrowUpDown className="w-3 h-3" />
            </button>
          );
        },
        cell: ({ getValue }) => (
          <span className="font-mono text-sm text-gray-600">{getValue()}</span>
        ),
      },
      {
        accessorKey: "amount_gross_clp",
        header: ({ column }) => {
          return (
            <button
              className="flex items-center gap-1 hover:text-gray-900"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
            >
              Total
              <ArrowUpDown className="w-3 h-3" />
            </button>
          );
        },
        cell: ({ getValue }) => (
          <div className="text-sm font-semibold text-right text-gray-900">
            ${getValue().toLocaleString("es-CL")}
          </div>
        ),
      },
      {
        header: ({ column }) => <div className="text-center">Pago</div>,
        accessorKey: "payment_status",
        header: ({ column }) => {
          return (
            <button
              className="flex items-center gap-1 hover:text-gray-900"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
            >
              Pago
              <ArrowUpDown className="w-3 h-3" />
            </button>
          );
        },
        cell: ({ getValue }) => (
          <div className="text-center text-sm">{getValue()}</div>
        ),
      },
      {
        accessorKey: "dte_status", // Usamos esto para el filtro
        header: ({ column }) => {
          return (
            <button
              className="flex text-center items-center gap-1 hover:text-gray-900"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
            >
              Envío SII
              <ArrowUpDown className="w-3 h-3" />
            </button>
          );
        },
        cell: ({ getValue }) => (
          <div className="text-center">
            <span
              className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                DTES_STATUSES[getValue()] || "bg-gray-100 text-gray-700"
              }`}
            >
              {getValue()}
            </span>
          </div>
        ),
      },
      {
        id: "actions",
        header: () => <div className="text-center">Acciones</div>,
        cell: ({ row }) => (
          <div className="flex items-center justify-center gap-2">
            <button
              onClick={() => setSelectedDocument(row.original)}
              className="p-2 text-blue-600 rounded-lg hover:bg-blue-50"
              title="Ver detalle"
            >
              <Eye className="w-4 h-4" />
            </button>
            <button
              className="p-2 text-gray-600 rounded-lg hover:bg-gray-100"
              title="Descargar PDF"
            >
              <Download className="w-4 h-4" />
            </button>
            <button
              className="p-2 text-gray-600 rounded-lg hover:bg-gray-100"
              title="Imprimir"
            >
              <Printer className="w-4 h-4" />
            </button>
            <button
              className="p-2 text-gray-600 rounded-lg hover:bg-gray-100"
              title="Enviar por email"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        ),
      },
    ],
    [DTES_TYPES, DTES_STATUSES, setSelectedDocument]
  );

  // --- Inicialización de la Tabla ---
  const table = useReactTable({
    data: invoices,
    columns,
    state: {
      sorting,
      globalFilter,
      columnFilters,
      pagination,
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    onColumnFiltersChange: setColumnFilters,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  // --- Helpers para manejar filtros externos ---
  const handleTypeFilter = (e) => {
    const value = e.target.value;
    table.getColumn("dte_type").setFilterValue(value === "todos" ? "" : value);
  };

  const handleStatusFilter = (e) => {
    const value = e.target.value;
    table
      .getColumn("dte_status")
      .setFilterValue(value === "todos" ? "" : value);
  };

  return (
    <div>
      {/* Dashboard Cards (Estadísticas Globales) */}
      <div className="grid grid-cols-1 gap-4 mb-6 md:grid-cols-4">
        <div className="p-6 text-white shadow-sm rounded-xl bg-gradient-to-br from-blue-500 to-blue-600">
          <div className="flex items-center gap-3 mb-2">
            <FileText className="w-8 h-8" />
            <h3 className="text-lg font-semibold">Emitidos</h3>
          </div>
          <p className="text-3xl font-bold">{dashboardStats.emitidos}</p>
        </div>
        <div className="p-6 text-white shadow-sm rounded-xl bg-gradient-to-br from-green-500 to-green-600">
          <div className="flex items-center gap-3 mb-2">
            <CheckCircle className="w-8 h-8" />
            <h3 className="text-lg font-semibold">Aceptados</h3>
          </div>
          <p className="text-3xl font-bold">{dashboardStats.aceptados}</p>
        </div>
        <div className="p-6 text-white shadow-sm rounded-xl bg-gradient-to-br from-red-500 to-red-600">
          <div className="flex items-center gap-3 mb-2">
            <XCircle className="w-8 h-8" />
            <h3 className="text-lg font-semibold">Rechazados</h3>
          </div>
          <p className="text-3xl font-bold">{dashboardStats.rechazados}</p>
        </div>
        <div className="p-6 text-white shadow-sm rounded-xl bg-gradient-to-br from-purple-500 to-purple-600">
          <div className="flex items-center gap-3 mb-2">
            <DollarSign className="w-8 h-8" />
            <h3 className="text-lg font-semibold">Total Facturado</h3>
          </div>
          <p className="text-2xl font-bold">
            ${dashboardStats.totalMonto.toLocaleString("es-CL")}
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {/* Barra de Filtros */}
        <div className="p-4 bg-white border border-gray-200 shadow-sm rounded-xl">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            {/* Buscador Global */}
            <div className="relative md:col-span-2">
              <Search className="absolute w-5 h-5 text-gray-400 left-3 top-3" />
              <input
                type="text"
                placeholder="Buscar por cliente, RUT o folio..."
                value={globalFilter ?? ""}
                onChange={(e) => setGlobalFilter(e.target.value)}
                className="w-full py-2 pl-10 pr-4 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
              />
            </div>

            {/* Filtro Tipo */}
            <select
              onChange={handleTypeFilter}
              className="px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
            >
              <option value="todos">Todos los tipos</option>
              {DTES_TYPES.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>

            {/* Filtro Estado */}
            <select
              onChange={handleStatusFilter}
              className="px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
            >
              <option value="todos">Todos los estados</option>
              <option value="Emitido">Emitido</option>
              <option value="Aceptado">Aceptado</option>
              <option value="Rechazado">Rechazado</option>
              <option value="Anulado">Anulado</option>
            </select>
          </div>
        </div>

        {/* Tabla TanStack */}
        <div className="overflow-hidden bg-white border border-gray-200 shadow-sm rounded-xl">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                {table.getHeaderGroups().map((headerGroup) => (
                  <tr key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <th
                        key={header.id}
                        className="px-4 py-3 text-xs font-bold text-left text-gray-600 uppercase"
                      >
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody className="divide-y divide-gray-200">
                {table.getRowModel().rows.length > 0 ? (
                  table.getRowModel().rows.map((row) => (
                    <tr key={row.id} className="hover:bg-gray-50">
                      {row.getVisibleCells().map((cell) => (
                        <td key={cell.id} className="px-4 py-3">
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </td>
                      ))}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={columns.length}
                      className="px-4 py-8 text-center text-gray-500"
                    >
                      No se encontraron documentos
                    </td>
                  </tr>
                )}
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
