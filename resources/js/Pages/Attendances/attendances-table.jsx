import { useMemo, useState } from "react";
import TablePagination from "@/components/TablePagination";
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
import { router, usePage } from "@inertiajs/react";
import { fmtCLP, fmtDate, fmtTime } from "@/utils/utils";
import { estadoClass, estadoTexto } from "@/helpers/status";
import SecondaryButton from "@/components/SecondaryButton";
import PrimaryButton from "@/components/PrimaryButton";

export default function AttendancesTable({
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
  const { auth } = usePage().props;
  const roles = auth?.roles || [];
  const userIsSuperAdmin = roles.includes("superadmin");

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
      route("treatment-sessions.index"),
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
    () => {
      const baseColumns = [];

      // Solo mostramos selector si es Superadmin (para DTE Masivo)
      if (userIsSuperAdmin) {
        baseColumns.push({
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
                disabled={!row.getCanSelect() || row.original.status !== 'completed' || !!row.original.dte_generated || row.original.is_locked}
                onChange={row.getToggleSelectedHandler()}
              />
            </div>
          ),
        });
      }

      baseColumns.push(
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
        header: "Estatus",
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
        header: "Balance(CLP)",
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

              {/* Auditoría / DTE - SOLO SUPERADMIN */}
              {userIsSuperAdmin && a.status === "completed" && (
                <>
                  {!a.dte_generated ? (
                    <button
                      onClick={() => openDTEModal(a)}
                      disabled={a.is_locked && a.billing_info?.dte_status === 'pending'}
                      className={`p-2 transition-all border shadow-sm rounded-xl active:scale-90 ${
                        a.is_locked && a.billing_info?.dte_status === 'pending'
                          ? "text-gray-400 border-gray-100 bg-gray-50 cursor-not-allowed"
                          : "text-purple-600 border-purple-100 bg-purple-50 hover:bg-purple-600 hover:text-white"
                      }`}
                      title={a.is_locked && a.billing_info?.dte_status === 'pending' ? "DTE en proceso..." : "Emitir DTE"}
                    >
                      <Receipt className="w-4 h-4" />
                    </button>
                  ) : (
                    a.billing_info?.folio && (
                    <a
                      href={route("dte.lookup", a.billing_info.folio)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 text-teal-600 transition-all border border-teal-100 shadow-sm bg-teal-50 rounded-xl hover:bg-teal-600 hover:text-white active:scale-90"
                      title={`Ver DTE #${a.billing_info.folio}`}
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
      );

      return baseColumns;
    },
    [atenciones, userIsSuperAdmin]
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
    <div className="flex flex-col gap-8 duration-700 animate-in fade-in">
      {/* Tabla Maestro */}
      <div className="bg-white border border-gray-100 shadow-xl rounded-[2rem] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-gray-50 bg-gray-50/30">
          <div className="flex items-center gap-4">
            <h2 className="flex items-center gap-3 text-sm font-black tracking-tight text-gray-900 uppercase">
              <ClipboardList className="w-5 h-5 text-brand-primary" /> Nómina de
              Atenciones
            </h2>
            {userIsSuperAdmin && selectedCount > 0 && (
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
                className="py-3! px-6! text-[9px]! shadow-lg shadow-brand-primary/20"
              >
                Filtrar
              </PrimaryButton>
              <SecondaryButton
                onClick={() => router.get(route("treatment-sessions.index"))}
                className="py-3! px-6! text-[9px]!"
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
                        <span className="enterprise-label mb-0! text-gray-900 group-hover:text-brand-primary transition-colors">
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
            pagesizeOptions={[10, 20, 50]}
          />
        </div>
      </div>
    </div>
  );
}
