import { useMemo, useState } from "react";
import TablePagination from "@/Components/TablePagination";
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
} from "@tanstack/react-table";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  Calendar,
  CheckCircle2,
  Clipboard,
  Clock,
  DollarSign,
  Filter,
  MoreVertical,
  Search,
  Stethoscope,
  Timer,
  Users,
  XCircle,
} from "lucide-react";
import { router } from "@inertiajs/react";
import { fmtCLP, fmtDate } from "@/utils/utils";
import { estadoClass, estadoTexto } from "@/helpers/status";

const Chip = ({ color, text }) => (
  <span
    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${color}`}
  >
    {text}
  </span>
);

const getMonthRange = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();

  // 1. Primer día del mes (Start Date):
  // Crea la fecha usando UTC para evitar el desfase de zona horaria.
  const firstDay = new Date(Date.UTC(year, month, 1));

  // 2. Último día del mes (End Date):
  // Crea el primer día del *siguiente* mes y resta un milisegundo (el día 0).
  const lastDay = new Date(Date.UTC(year, month + 1, 1, 0, 0, 0, -1));

  // 3. Formateo: Usamos toISOString().split("T")[0]
  // Esto es seguro porque las fechas ya fueron creadas en UTC.
  const fechaInicio = firstDay.toISOString().split("T")[0];
  const fechaFin = lastDay.toISOString().split("T")[0];

  return { fechaInicio, fechaFin };
};

export default function AttendacesTable({
  atenciones,
  kpis,
  openCreateUpdateSessionModal,
  openStartModal,
  openAbsentModal,
  openCompletedModal,
  openCancelModal,
  openDTEModal,
  openResumenModal,
  filtros,
}) {
  const [query, setQuery] = useState(filtros.query || "");
  const [estado, setEstado] = useState(filtros.estado || "all");
  const [fechaInicio, setFechaInicio] = useState(
    filtros.fecha_inicio || new Date().toISOString().split("T")[0]
  );
  const [fechaFin, setFechaFin] = useState(
    filtros.fecha_fin || new Date().toISOString().split("T")[0]
  );

  const { fechaInicio: defaultFechaInicio, fechaFin: defaultFechaFin } =
    getMonthRange();

  const [sorting, setSorting] = useState([]);
  const [columnFilters, setColumnFilters] = useState([]);
  const [pageSize, setPageSize] = useState(10);
  const [selected, setSelected] = useState(null);

  // Aplicar filtros del servidor
  const applyFilters = () => {
    router.get(
      route("attendances.index"),
      {
        fecha_inicio: fechaInicio,
        fecha_fin: fechaFin,
        estado: estado === "all" ? "all" : estado,
        query,
      },
      { preserveState: true, preserveScroll: true }
    );
  };

  // Limpiar filtros y volver al día actual
  const clearFilters = () => {
    setFechaInicio(defaultFechaInicio);
    setFechaFin(defaultFechaFin);
    setEstado("all");
    setQuery("");

    router.get(
      route("attendances.index"),
      {
        fecha_inicio: defaultFechaInicio,
        fecha_fin: defaultFechaFin,
        estado: "all",
        query: "",
      },
      { preserveState: false, preserveScroll: true }
    );
  };

  // Definición de columnas para TanStack Table
  const columns = useMemo(
    () => [
      {
        accessorKey: "patient_full_name",
        header: "Paciente",
        cell: ({ row }) => {
          const { patient_full_name, session_type_name } = row.original;
          const initials = patient_full_name
            .split(" ")
            .map((n) => n[0])
            .join("");
          return (
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center font-bold text-white rounded-lg w-9 h-9 bg-gradient-to-br from-blue-500 to-blue-600">
                {initials}
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-gray-900 truncate">
                  {patient_full_name}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {session_type_name}
                </p>
              </div>
            </div>
          );
        },
        size: 250,
      },
      {
        accessorKey: "month_session_number",
        header: "#",
        cell: ({ getValue }) => (
          <span className="text-sm text-gray-700">#{getValue()}</span>
        ),
        size: 180,
      },
      {
        accessorKey: "date",
        header: "Fecha",
        cell: ({ row }) => {
          const { date } = row.original;
          return (
            <div className="flex text-sm text-gray-500 whitespace-nowrap">
              <Calendar className="w-4 h-4 pt-1 pr-1 " />
              <span className="text-gray-500">{fmtDate(date)}</span>
            </div>
          );
        },
        size: 150,
      },
      {
        accessorKey: "time",
        header: "Hora",
        cell: ({ getValue }) => (
          <span className="flex font-semibold text-gray-600">
            <Clock className="w-4 h-4 pt-1 pr-1 " />
            {getValue()}
          </span>
        ),
        size: 80,
      },
      {
        accessorKey: "doctor_full_name",
        header: "Profesional",
        cell: ({ getValue }) => (
          <span className="flex text-sm text-gray-700">
            {" "}
            <Stethoscope className="w-4 h-4 pt-1 pr-1 " />
            {getValue()}
          </span>
        ),
        size: 180,
      },

      {
        accessorKey: "name_session_type",
        header: "TIPO",
        cell: ({ getValue }) => (
          <span className="text-sm text-gray-700">{getValue()}</span>
        ),
        size: 180,
      },

      {
        accessorKey: "status",
        header: "Estado",
        cell: ({ getValue }) => (
          <Chip
            color={estadoClass(getValue())}
            text={estadoTexto(getValue())}
          />
        ),
        size: 120,
      },
      {
        accessorKey: "total",
        header: "Pago",
        cell: ({ row }) => {
          const { payment_total, patient_amount_clp } = row.original;
          const saldo = Math.max(
            0,
            (patient_amount_clp || 0) - (payment_total || 0)
          );
          return (
            <div className="text-sm text-gray-700 whitespace-nowrap">
              {fmtCLP(payment_total)}{" "}
              <span className="text-gray-400">
                / {fmtCLP(patient_amount_clp)}
              </span>
              {saldo > 0 && (
                <div className="text-xs font-semibold text-amber-600">
                  Saldo: {fmtCLP(saldo)}
                </div>
              )}
            </div>
          );
        },
        size: 150,
      },
      {
        id: "acciones",
        header: () => <div className="text-center">Acciones</div>,
        cell: ({ row }) => {
          const a = row.original;
          return (
            <div className="flex items-center justify-center gap-1">
              <button
                onClick={() => openCreateUpdateSessionModal(a)}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold border-2 border-yellow-200 text-yellow-700 hover:bg-yellow-50"
                title="Editar"
              >
                Editar
              </button>
              {a.status === "scheduled" && (
                <>
                  <button
                    onClick={() => openStartModal(a)}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold border-2 border-blue-200 text-blue-700 hover:bg-blue-50"
                  >
                    Iniciar
                  </button>
                  <button
                    onClick={() => openCancelModal(a)}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold border-2 border-gray-200 text-gray-700 hover:bg-gray-50"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={() => openAbsentModal(a)}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold border-2 border-red-200 text-red-700 hover:bg-red-50"
                  >
                    Ausente
                  </button>
                </>
              )}
              {a.status === "in_progress" && (
                <>
                  <button
                    onClick={() => openCompletedModal(a)}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold border-2 border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                  >
                    Completar
                  </button>
                  <button
                    onClick={() => openCancelModal(a)}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold border-2 border-gray-200 text-gray-700 hover:bg-gray-50"
                  >
                    Cancelar
                  </button>
                </>
              )}
              {(a.status === "completed" ||
                a.status === "scheduled" ||
                a.status === "in_progress") && (
                <button
                  onClick={() => openDTEModal(a)}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold border-2 border-purple-200 text-purple-700 hover:bg-purple-50"
                >
                  Emitir DTE
                </button>
              )}
              <button
                onClick={() => openResumenModal(a)}
                className="p-2 rounded-lg hover:bg-gray-100"
                title="Más"
              >
                <MoreVertical className="w-4 h-4 text-gray-400" />
              </button>
            </div>
          );
        },
        size: 400,
        enableSorting: false,
      },
    ],
    []
  );

  // Inicializar TanStack Table
  const table = useReactTable({
    data: atenciones,
    columns,
    state: {
      sorting,
      columnFilters,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  });

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      {/* Tabla con TanStack Table */}
      <div className="bg-white border border-gray-200 shadow-sm lg:col-span-2 rounded-xl">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="flex items-center gap-2 text-lg font-bold text-gray-900">
            <Clipboard className="w-5 h-5 text-blue-600" />
            Listado de Atenciones
          </h2>
          <span className="text-sm text-gray-600">
            {table.getFilteredRowModel().rows.length} resultados
          </span>
        </div>

        {/* Filtros */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex flex-col gap-3">
            {/* Primera fila: Búsqueda */}
            <div className="flex items-center gap-2 px-3 py-2 border-2 border-gray-200 rounded-lg focus-within:border-blue-500">
              <Search className="w-4 h-4 text-gray-400" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar por paciente, tratamiento o profesional..."
                className="w-full text-sm outline-none"
              />
            </div>

            {/* Segunda fila: Filtros de fecha, estado y acciones */}
            <div className="flex flex-col items-stretch gap-3 lg:flex-row lg:items-center">
              {/* Rango de fechas */}
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 px-3 py-2 border-2 border-gray-200 rounded-lg">
                  <label className="text-xs font-semibold text-gray-600 whitespace-nowrap">
                    Desde:
                  </label>
                  <input
                    type="date"
                    value={fechaInicio}
                    onChange={(e) => setFechaInicio(e.target.value)}
                    className="text-sm outline-none"
                  />
                </div>
                <div className="flex items-center gap-2 px-3 py-2 border-2 border-gray-200 rounded-lg">
                  <label className="text-xs font-semibold text-gray-600 whitespace-nowrap">
                    Hasta:
                  </label>
                  <input
                    type="date"
                    value={fechaFin}
                    onChange={(e) => setFechaFin(e.target.value)}
                    className="text-sm outline-none"
                  />
                </div>
              </div>

              {/* Estado */}
              <select
                value={estado}
                onChange={(e) => setEstado(e.target.value)}
                className="px-3 py-2 text-sm font-medium border-2 border-gray-200 rounded-lg"
              >
                <option value="all">Todos los estados</option>
                <option value="scheduled">Programada</option>
                <option value="completed">Completada</option>
                <option value="cancelled">Cancelada</option>
                <option value="absent">Ausente</option>
              </select>

              {/* Botones de acción */}
              <div className="flex gap-2 lg:ml-auto">
                <button
                  onClick={applyFilters}
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                >
                  <Filter className="w-4 h-4" /> Aplicar
                </button>
                <button
                  onClick={clearFilters}
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 border-2 border-gray-200 rounded-lg hover:bg-gray-50"
                >
                  <XCircle className="w-4 h-4" /> Limpiar
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Tabla */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              {table.getHeaderGroups().map((headerGroup) => (
                <tr
                  key={headerGroup.id}
                  className="text-left border-b-2 border-gray-200"
                >
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      className="px-4 py-3 text-xs font-bold text-gray-600 uppercase"
                      style={{ width: header.getSize() }}
                    >
                      {header.isPlaceholder ? null : (
                        <div
                          className={
                            header.column.getCanSort()
                              ? "cursor-pointer select-none flex items-center gap-2"
                              : ""
                          }
                          onClick={header.column.getToggleSortingHandler()}
                        >
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                          {header.column.getCanSort() && (
                            <span>
                              {header.column.getIsSorted() === "asc" ? (
                                <ArrowUp className="w-4 h-4" />
                              ) : header.column.getIsSorted() === "desc" ? (
                                <ArrowDown className="w-4 h-4" />
                              ) : (
                                <ArrowUpDown className="w-4 h-4 text-gray-400" />
                              )}
                            </span>
                          )}
                        </div>
                      )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="divide-y divide-gray-100">
              {table.getRowModel().rows.length === 0 ? (
                <tr>
                  <td
                    colSpan={columns.length}
                    className="px-4 py-8 text-center text-gray-500"
                  >
                    No hay atenciones para mostrar
                  </td>
                </tr>
              ) : (
                table.getRowModel().rows.map((row) => (
                  <tr
                    key={row.id}
                    className="transition-colors hover:bg-gray-50"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td
                        key={cell.id}
                        className="px-4 py-3 text-sm text-ellipsis truncate"
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
        <TablePagination
          table={table}
          total={table.getFilteredRowModel().rows.length}
          pageSize={pageSize}
          setPageSize={setPageSize}
          pageSizeOptions={[5, 10, 15, 20, 30, 40, 50]}
        />
      </div>

      {/* Panel lateral (sin cambios) */}
      <div className="p-5 bg-white border border-gray-200 shadow-sm rounded-xl">
        <h3 className="flex items-center gap-2 mb-4 text-lg font-bold text-gray-900">
          <Users className="w-5 h-5 text-blue-600" />
          {fechaInicio === fechaFin ? "Resumen del Día" : "Resumen del Período"}
        </h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg bg-gray-50">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <span className="text-sm">Completadas</span>
            </div>
            <span className="font-bold">{kpis.completadas || 0}</span>
          </div>
          <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg bg-gray-50">
            <div className="flex items-center gap-3">
              <Timer className="w-5 h-5 text-amber-600" />
              <span className="text-sm">Pendientes</span>
            </div>
            <span className="font-bold">{kpis.pendientes || 0}</span>
          </div>
          <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg bg-gray-50">
            <div className="flex items-center gap-3">
              <XCircle className="w-5 h-5 text-gray-600" />
              <span className="text-sm">Canceladas</span>
            </div>
            <span className="font-bold">{kpis.canceladas || 0}</span>
          </div>
          <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg bg-gray-50">
            <div className="flex items-center gap-3">
              <DollarSign className="w-5 h-5 text-purple-600" />
              <span className="text-sm">Cobrado</span>
            </div>
            <span className="font-bold">{fmtCLP(kpis.totalCobrado || 0)}</span>
          </div>
          <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg bg-gray-50">
            <div className="flex items-center gap-3">
              <DollarSign className="w-5 h-5 text-orange-600" />
              <span className="text-sm">Por cobrar</span>
            </div>
            <span className="font-bold">
              {fmtCLP(kpis.totalPorCobrar || 0)}
            </span>
          </div>
        </div>

        <div className="mt-6">
          <h4 className="mb-3 text-sm font-bold text-gray-700">
            Acciones Rápidas
          </h4>
          <div className="grid grid-cols-1 gap-2">
            <button
              onClick={() => openCreateUpdateSessionModal({})}
              className="w-full px-4 py-2 font-semibold text-white rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 hover:shadow"
            >
              Registrar sesión
            </button>
            {/*   <button className="w-full px-4 py-2 font-semibold text-gray-700 border-2 border-gray-200 rounded-lg hover:bg-gray-50">
                  Agendar próxima cita
                </button>
                <button className="w-full px-4 py-2 font-semibold text-purple-700 border-2 border-purple-200 rounded-lg hover:bg-purple-50">
                  Emitir boleta (DTE)
                </button> */}
          </div>
        </div>

        {selected && (
          <div className="pt-6 mt-6 border-t border-gray-200">
            <div className="flex items-start justify-between mb-2">
              <h4 className="text-sm font-bold text-gray-900">
                Detalle de la atención
              </h4>
              <button
                className="p-2 -mr-2 rounded-lg hover:bg-gray-100"
                onClick={() => setSelected(null)}
              >
                <XCircle className="w-4 h-4 text-gray-400" />
              </button>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Paciente</span>
                <span className="font-semibold">{selected.paciente}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Hora</span>
                <span className="font-semibold">{selected.hora}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Profesional</span>
                <span className="font-semibold">{selected.doctor}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Tipo</span>
                <span className="font-semibold capitalize">
                  {selected.tipo}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Estado</span>
                <span className="font-semibold">
                  {estadoTexto(selected.estado)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Pago</span>
                <span className="font-semibold">
                  {fmtCLP(selected.pagado)}{" "}
                  <span className="font-normal text-gray-400">
                    / {fmtCLP(selected.total)}
                  </span>
                </span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-4">
              {selected.estado === "scheduled" && (
                <>
                  <button
                    onClick={() => startSession(selected)}
                    className="px-3 py-2 text-xs font-semibold text-blue-700 border-2 border-blue-200 rounded-lg hover:bg-blue-50"
                  >
                    Iniciar
                  </button>
                  <button
                    onClick={() => openCancelModal(selected)}
                    className="px-3 py-2 text-xs font-semibold text-gray-700 border-2 border-gray-200 rounded-lg hover:bg-gray-50"
                  >
                    Cancelar
                  </button>
                </>
              )}
              {selected.estado === "in_progress" && (
                <button
                  onClick={() => openCompletedModal(selected)}
                  className="col-span-2 px-3 py-2 text-xs font-semibold border-2 rounded-lg border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                >
                  Completar
                </button>
              )}
              <button
                onClick={() => issueDTE(selected)}
                className="col-span-2 px-3 py-2 text-xs font-semibold text-purple-700 border-2 border-purple-200 rounded-lg hover:bg-purple-50"
              >
                Emitir DTE
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
