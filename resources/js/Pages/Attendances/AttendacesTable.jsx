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
  Clock,
  DollarSign,
  Filter,
  MoreVertical,
  Search,
  Stethoscope,
  Timer,
  Users,
  XCircle,
  Play,
  CheckCircle,
  UserX,
  FileText,
  ChevronUp,
  ChevronDown,
  Receipt,
  ClipboardList,
  Activity,
  CheckSquare,
} from "lucide-react";
import { router } from "@inertiajs/react";
import { fmtCLP, fmtDate, fmtTime } from "@/utils/utils";
import { estadoClass, estadoTexto } from "@/helpers/status";
import SecondaryButton from "@/Components/SecondaryButton";
import PrimaryButton from "@/Components/PrimaryButton";

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

  const [sorting, setSorting] = useState([]);
  const [pageSize, setPageSize] = useState(10);
  const [pageIndex, setPageIndex] = useState(0);
  const [rowSelection, setRowSelection] = useState({});

  const applyFilters = () => {
    router.get(
      route("attendances.index"),
      { fecha_inicio: fechaInicio, fecha_fin: fechaFin, estado, query },
      { preserveState: true, preserveScroll: true }
    );
  };

  const handleBulkDTE = () => {
    const selectedRows = table.getSelectedRowModel().rows;
    const selectedSessions = selectedRows.map((row) => row.original);
    
    if (selectedSessions.length === 0) return;

    // VALIDACIÓN: Todos deben ser del mismo paciente
    const patientIds = new Set(selectedSessions.map(s => s.patient_id));
    if (patientIds.size > 1) {
      alert("Para emitir un DTE masivo, todas las sesiones deben pertenecer al mismo paciente.");
      return;
    }

    // Si solo hay una, usamos el modal individual
    if (selectedSessions.length === 1) {
      openDTEModal(selectedSessions[0]);
      return;
    }

    // Abrir modal con múltiples sesiones
    openDTEModal(selectedSessions);
  };

  const columns = useMemo(
    () => [
      {
        id: "select",
        header: ({ table }) => (
          <div className="px-1">
            <input
              type="checkbox"
              className="w-4 h-4 border-gray-300 rounded text-brand-primary focus:ring-brand-primary"
              checked={table.getIsAllPageRowsSelected()}
              onChange={table.getToggleAllPageRowsSelectedHandler()}
            />
          </div>
        ),
        cell: ({ row }) => (
          <div className="px-1">
            <input
              type="checkbox"
              className="w-4 h-4 border-gray-300 rounded text-brand-primary focus:ring-brand-primary disabled:opacity-30"
              checked={row.getIsSelected()}
              disabled={!row.getCanSelect() || row.original.status !== 'completed' || !!row.original.dte_generated}
              onChange={row.getToggleSelectedHandler()}
            />
          </div>
        ),
      },
      {
        id: "paciente",
        header: "Identidad & Servicio",
        accessorFn: (row) => row.patient_full_name,
        cell: ({ row }) => (
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center w-10 h-10 text-xs font-black uppercase border shadow-sm text-brand-primary rounded-xl bg-brand-secondary/10 border-brand-secondary/20 shrink-0">
              {row.original.patient_full_name[0]}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-black text-gray-900 uppercase tracking-tight truncate leading-none mb-1.5">
                {row.original.patient_full_name}
              </p>
              <div className="flex items-center gap-2">
                <span className="text-[9px] font-black text-brand-primary uppercase tracking-widest">
                  {row.original.name_session_type}
                </span>
                <div className="w-1 h-1 bg-gray-200 rounded-full"></div>
                <span className="font-mono text-[10px] font-bold text-gray-400">
                  #{row.original.month_session_number}
                </span>
              </div>
            </div>
          </div>
        ),
      },
      {
        accessorKey: "date",
        header: "Cronología",
        cell: ({ row }) => (
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2 font-mono text-[11px] font-black text-gray-700">
              <Calendar className="w-3 h-3 text-brand-primary opacity-40" />{" "}
              {fmtDate(row.original.date)}
            </div>
            <div className="flex items-center gap-2 font-mono text-[10px] font-bold text-gray-400 uppercase tracking-widest">
              <Clock className="w-3 h-3 opacity-30" />{" "}
              {fmtTime(row.original.time)}
            </div>
          </div>
        ),
      },
      {
        accessorKey: "doctor_full_name",
        header: "Especialista",
        cell: ({ getValue }) => (
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-gray-50 rounded-lg">
              <Stethoscope className="w-3.5 h-3.5 text-brand-primary opacity-40" />
            </div>
            <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest">
              {getValue()}
            </span>
          </div>
        ),
      },
      {
        accessorKey: "status",
        header: "Estatus Clínico",
        cell: ({ getValue }) => (
          <div className="text-center">
            <span
              className={`inline-flex items-center px-3 py-1 rounded-lg text-[8px] font-black uppercase tracking-[0.2em] shadow-sm border ${estadoClass(
                getValue()
              )}`}
            >
              {estadoTexto(getValue())}
            </span>
          </div>
        ),
      },
      {
        id: "pago",
        header: "Balance (CLP)",
        cell: ({ row }) => {
          const { payment_total, patient_amount_clp } = row.original;
          const saldo = Math.max(
            0,
            (patient_amount_clp || 0) - (payment_total || 0)
          );
          return (
            <div className="flex flex-col items-end gap-1 text-right">
              <p className="font-mono text-xs font-black tracking-tighter text-gray-900">
                {fmtCLP(payment_total)}{" "}
                <span className="text-[10px] opacity-20">/</span>{" "}
                {fmtCLP(patient_amount_clp)}
              </p>
              {saldo > 0 && (
                <span className="text-[8px] font-black text-orange-600 bg-orange-50 px-1.5 py-0.5 rounded-md border border-orange-100 uppercase tracking-widest">
                  Deuda: {fmtCLP(saldo)}
                </span>
              )}
            </div>
          );
        },
      },
      {
        id: "acciones",
        header: "Gestión",
        cell: ({ row }) => {
          const a = row.original;
          return (
            <div className="flex items-center justify-end gap-1.5">
              {/* Acciones de Flujo */}
              {a.status === "scheduled" && (
                <>
                  <button
                    onClick={() => openStartModal(a)}
                    className="p-2 text-blue-600 transition-all border border-blue-100 shadow-sm bg-blue-50 rounded-xl hover:bg-blue-600 hover:text-white active:scale-90"
                    title="Iniciar"
                  >
                    <Play className="w-4 h-4 fill-current" />
                  </button>
                  <button
                    onClick={() => openAbsentModal(a)}
                    className="p-2 text-orange-600 transition-all border border-orange-100 shadow-sm bg-orange-50 rounded-xl hover:bg-orange-600 hover:text-white active:scale-90"
                    title="Marcar Ausente"
                  >
                    <UserX className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => openCancelModal(a)}
                    className="p-2 text-red-600 transition-all border border-red-100 shadow-sm bg-red-50 rounded-xl hover:bg-red-600 hover:text-white active:scale-90"
                    title="Cancelar"
                  >
                    <XCircle className="w-4 h-4" />
                  </button>
                </>
              )}
              {a.status === "in_progress" && (
                <button
                  onClick={() => openCompletedModal(a)}
                  className="p-2 text-green-600 transition-all border border-green-100 shadow-sm bg-green-50 rounded-xl hover:bg-green-600 hover:text-white active:scale-90"
                  title="Finalizar"
                >
                  <CheckCircle className="w-4 h-4" />
                </button>
              )}

              {/* Auditoría / DTE */}
              {a.status === "completed" && (
                <>
                  {!a.dte_generated ? (
                    <button
                      onClick={() => openDTEModal(a)}
                      className="p-2 text-purple-600 transition-all border border-purple-100 shadow-sm bg-purple-50 rounded-xl hover:bg-purple-600 hover:text-white active:scale-90"
                      title="Emitir DTE"
                    >
                      <Receipt className="w-4 h-4" />
                    </button>
                  ) : (
                    a.dte && (
                    <a
                      href={route("dte.lookup", a.dte.folio)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 text-teal-600 transition-all border border-teal-100 shadow-sm bg-teal-50 rounded-xl hover:bg-teal-600 hover:text-white active:scale-90"
                      title={`Ver DTE #${a.dte.folio}`}
                    >
                      <Receipt className="w-4 h-4" />
                    </a>
                    )
                  )}
                </>
              )}

              {/* Menú Maestro */}
              <button
                onClick={() => openResumenModal(a)}
                className="p-2 text-gray-400 transition-all border border-gray-100 bg-gray-50 rounded-xl hover:bg-gray-900 hover:text-white active:scale-90"
                title="Resumen"
              >
                <FileText className="w-4 h-4" />
              </button>

              <div className="w-px h-6 mx-1 bg-gray-100"></div>

              {/* Edición Principal */}
              <button
                onClick={() => openCreateUpdateSessionModal(a)}
                className="p-2 transition-all border text-brand-primary bg-brand-secondary/10 border-brand-secondary/20 rounded-xl hover:bg-brand-primary hover:text-white active:scale-90"
                title="Editar Parámetros"
              >
                <MoreVertical className="w-4 h-4" />
              </button>
            </div>
          );
        },
        enableSorting: false,
      },
    ],
    [atenciones]
  );

  const table = useReactTable({
    data: atenciones,
    columns,
    state: { sorting, pagination: { pageSize, pageIndex }, rowSelection },
    onSortingChange: setSorting,
    onRowSelectionChange: setRowSelection,
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
  });

  const selectedCount = Object.keys(rowSelection).length;

  return (
    <div className="grid grid-cols-1 gap-8 duration-700 lg:grid-cols-12 animate-in fade-in">
      {/* Tabla Maestro */}
      <div className="bg-white border border-gray-100 shadow-xl lg:col-span-9 rounded-[2rem] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-gray-50 bg-gray-50/30">
          <div className="flex items-center gap-4">
            <h2 className="flex items-center gap-3 text-sm font-black tracking-tight text-gray-900 uppercase">
              <ClipboardList className="w-5 h-5 text-brand-primary" /> Nómina de
              Atenciones
            </h2>
            {selectedCount > 0 && (
              <div className="flex items-center gap-2 px-4 py-1.5 bg-brand-primary text-white rounded-full text-[9px] font-black uppercase tracking-widest animate-in zoom-in">
                <CheckSquare className="w-3.5 h-3.5" />
                {selectedCount} Seleccionadas
                <button
                  onClick={handleBulkDTE}
                  className="ml-2 px-3 py-1 bg-white text-brand-primary rounded-lg hover:bg-brand-secondary transition-colors"
                >
                  Emitir DTE Masivo
                </button>
              </div>
            )}
          </div>
          <span className="text-[9px] font-black text-brand-gray uppercase tracking-[0.2em] bg-white px-4 py-1.5 rounded-xl shadow-sm border border-gray-100">
            {atenciones.length} Sesiones Detectadas
          </span>
        </div>

        {/* Barra de Filtros Inteligente */}
        <div className="flex flex-col gap-6 p-6 bg-white border-b border-gray-50">
          <div className="relative max-w-2xl group">
            <Search className="absolute w-4 h-4 transition-colors transform -translate-y-1/2 text-brand-gray left-4 top-1/2 group-focus-within:text-brand-primary" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscador global: Paciente, RUT, Especialista o Diagnóstico..."
              className="w-full py-4 pl-12 pr-4 text-sm font-bold transition-all shadow-inner outline-none border-gray-50 bg-gray-50/50 rounded-2xl focus:bg-white focus:ring-4 focus:ring-brand-primary/5 focus:border-brand-primary"
            />
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-3 px-4 py-2 border border-gray-100 bg-gray-50 rounded-xl">
                <label className="text-[8px] font-black text-gray-400 uppercase tracking-widest">
                  Desde
                </label>
                <input
                  type="date"
                  value={fechaInicio}
                  onChange={(e) => setFechaInicio(e.target.value)}
                  className="p-0 font-mono text-xs font-black text-gray-700 bg-transparent border-none focus:ring-0"
                />
              </div>
              <div className="flex items-center gap-3 px-4 py-2 border border-gray-100 bg-gray-50 rounded-xl">
                <label className="text-[8px] font-black text-gray-400 uppercase tracking-widest">
                  Hasta
                </label>
                <input
                  type="date"
                  value={fechaFin}
                  onChange={(e) => setFechaFin(e.target.value)}
                  className="p-0 font-mono text-xs font-black text-gray-700 bg-transparent border-none focus:ring-0"
                />
              </div>
            </div>

            <select
              value={estado}
              onChange={(e) => setEstado(e.target.value)}
              className="px-4 py-2 text-[10px] font-black uppercase text-brand-gray border-gray-100 bg-gray-50 rounded-xl focus:ring-brand-primary"
            >
              <option value="all">Todos los Estados</option>
              <option value="scheduled">Programada</option>
              <option value="in_progress">En Curso</option>
              <option value="completed">Completada</option>
              <option value="absent">Ausente</option>
            </select>

            <div className="flex gap-2 ml-auto">
              <PrimaryButton
                onClick={applyFilters}
                className="!py-3 !px-6 !text-[9px] shadow-lg shadow-brand-primary/20"
              >
                Filtrar
              </PrimaryButton>
              <SecondaryButton
                onClick={() => router.get(route("attendances.index"))}
                className="!py-3 !px-6 !text-[9px]"
              >
                Reiniciar
              </SecondaryButton>
            </div>
          </div>
        </div>

        <div className="flex-1 w-full overflow-x-auto custom-scrollbar">
          <table className="w-full border-collapse">
            <thead>
              {table.getHeaderGroups().map((headerGroup) => (
                <tr
                  key={headerGroup.id}
                  className="border-b border-gray-100 bg-gray-50/50"
                >
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      className="px-8 py-5 text-left cursor-pointer select-none group"
                      onClick={header.column.getToggleSortingHandler()}
                    >
                      <div
                        className={`flex items-center gap-2 ${
                          header.column.id === "pago" ? "justify-end" : ""
                        } ${
                          header.column.id === "status" ? "justify-center" : ""
                        } ${
                          header.column.id === "acciones" ? "justify-end" : ""
                        }`}
                      >
                        <span className="enterprise-label !mb-0 text-gray-900 group-hover:text-brand-primary transition-colors">
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                        </span>
                        {header.column.getCanSort() && (
                          <div className="transition-opacity opacity-0 group-hover:opacity-100">
                            {header.column.getIsSorted() === "asc" ? (
                              <ChevronUp className="w-3 h-3 text-brand-primary" />
                            ) : (
                              <ChevronDown className="w-3 h-3 text-brand-primary" />
                            )}
                          </div>
                        )}
                      </div>
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="divide-y divide-gray-50">
              {table.getRowModel().rows.length === 0 ? (
                <tr>
                  <td
                    colSpan={columns.length}
                    className="px-8 py-24 text-center"
                  >
                    <div className="flex flex-col items-center justify-center space-y-4 opacity-30">
                      <div className="p-6 bg-gray-50 rounded-[2.5rem]">
                        <Calendar className="w-12 h-12" />
                      </div>
                      <p className="enterprise-label">
                        Sin atenciones registradas en el período
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                table.getRowModel().rows.map((row) => (
                  <tr
                    key={row.id}
                    className="transition-all hover:bg-brand-secondary/5 group"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td
                        key={cell.id}
                        className="px-8 py-3.5 whitespace-nowrap"
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

        <div className="border-t border-gray-100 bg-gray-50/30">
          <TablePagination
            table={table}
            total={atenciones.length}
            pageSize={pageSize}
            setPageSize={setPageSize}
            pageSizeOptions={[10, 20, 50]}
          />
        </div>
      </div>

      {/* Panel de Control Lateral */}
      <div className="space-y-6 lg:col-span-3">
        <div className="p-8 bg-white border border-gray-100 shadow-xl rounded-[2.5rem] relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 -mt-16 -mr-16 rounded-full bg-brand-primary/5 blur-2xl"></div>
          <h3 className="enterprise-label !text-brand-primary flex items-center gap-3 mb-8 relative z-10">
            <Activity className="w-5 h-5" /> Productividad
          </h3>
          <div className="relative z-10 space-y-4">
            <div className="flex items-center justify-between p-5 transition-all border border-green-100 bg-green-50 rounded-2xl group hover:bg-green-600">
              <span className="text-[10px] font-black uppercase tracking-widest text-green-700 group-hover:text-white">
                Asistidas
              </span>
              <span className="font-mono text-xl font-black text-green-900 group-hover:text-white">
                {kpis.completadas || 0}
              </span>
            </div>
            <div className="flex items-center justify-between p-5 transition-all border bg-amber-50 rounded-2xl border-amber-100 group hover:bg-amber-600">
              <span className="text-[10px] font-black uppercase tracking-widest text-amber-700 group-hover:text-white">
                Pendientes
              </span>
              <span className="font-mono text-xl font-black text-amber-900 group-hover:text-white">
                {kpis.pendientes || 0}
              </span>
            </div>
            <div className="flex flex-col gap-1 p-5 border bg-brand-primary/5 rounded-2xl border-brand-primary/10">
              <span className="text-[10px] font-black uppercase tracking-widest text-brand-primary opacity-60">
                Recaudación Validada
              </span>
              <span className="font-mono text-lg font-black tracking-tighter text-brand-primary">
                {fmtCLP(kpis.totalCobrado || 0)}
              </span>
            </div>
            <div className="flex flex-col gap-1 p-5 text-white bg-gray-900 shadow-xl rounded-2xl">
              <span className="text-[10px] font-black uppercase tracking-widest opacity-40">
                Saldo en Cartera
              </span>
              <span className="font-mono text-lg font-black tracking-tighter text-brand-secondary">
                {fmtCLP(kpis.totalPorCobrar || 0)}
              </span>
            </div>
          </div>
        </div>

        <div className="p-8 bg-brand-primary text-white shadow-2xl rounded-[2.5rem] relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 -mt-16 -mr-16 transition-transform duration-1000 rounded-full bg-white/10 blur-2xl group-hover:scale-150"></div>
          <div className="relative z-10">
            <CheckCircle2 className="w-10 h-10 mb-6 opacity-40" />
            <h4 className="mb-2 text-xl font-black leading-tight tracking-tight uppercase">
              Acción Directa
            </h4>
            <p className="mb-8 text-xs font-bold tracking-widest uppercase text-white/60">
              Gestión de Citas
            </p>
            <button
              onClick={() => openCreateUpdateSessionModal({})}
              className="w-full py-4 bg-white text-brand-primary font-black uppercase tracking-widest text-[10px] rounded-xl hover:bg-brand-secondary transition-all active:scale-95 shadow-xl"
            >
              Agendar Atención
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
