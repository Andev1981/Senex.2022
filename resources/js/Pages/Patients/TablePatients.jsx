import { useState, useMemo, useEffect } from "react";
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
  Calendar,
  Trash2,
  Eye,
  MapPin,
  Map,
  Mail,
  Phone,
  Stethoscope,
  CreditCard,
  Download,
  Filter,
  X,
  Cake,
  User,
  ExternalLink,
  ShieldCheck,
  AlertCircle,
  FileText,
  Users,
} from "lucide-react";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import TablePagination from "@/Components/TablePagination";
import { route } from "ziggy-js";
import { useForm, router } from "@inertiajs/react";
import { patientStatuses, debtStatuses } from "@/helpers/status";
import usePatientStore from "@/Stores/usePatientStore";

export default function TablePatients({ handleOpenModalDelete, communes, user }) {
  const patients = usePatientStore((state) => state.patients);

  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [filterEstado, setFilterEstado] = useState("");
  const [filterEstadoPago, setFilterEstadoPago] = useState("");
  const [filterComuna, setFilterComuna] = useState("");
  const [edadMin, setEdadMin] = useState("");
  const [edadMax, setEdadMax] = useState("");

  const { get } = useForm();
  const [sorting, setSorting] = useState([]);
  const [pageSize, setPageSize] = useState(10);
  const [columnFilters, setColumnFilters] = useState([]);
  const [pageIndex, setPageIndex] = useState(0);

  const comunasPresentes = useMemo(() => {
    if (!patients || patients.length === 0) return [];
    return [
      ...new Set(patients.map((p) => p.comuna_name).filter(Boolean)),
    ].sort();
  }, [patients]);

  const hasActiveFilters = !!(
    filterEstado ||
    filterEstadoPago ||
    filterComuna ||
    edadMin ||
    edadMax
  );

  const clearFilters = () => {
    setFilterEstado("");
    setFilterEstadoPago("");
    setFilterComuna("");
    setEdadMin("");
    setEdadMax("");
    setSearchTerm("");
    setColumnFilters([]);
  };

  const mapEstado = (label) => {
    if (!label || label === "Todos") return undefined;
    const entry = Object.entries(patientStatuses).find(
      ([_, cfg]) => cfg.label === label
    );
    return entry ? entry[0] : undefined;
  };

  const mapEstadoPago = (label) => {
    if (!label || label === "Todos") return undefined;
    const entry = Object.entries(debtStatuses).find(
      ([_, cfg]) => cfg.label === label
    );
    return entry ? entry[0] : undefined;
  };

  useEffect(() => {
    const next = [];
    const valEstado = mapEstado(filterEstado);
    if (valEstado) next.push({ id: "status", value: valEstado });
    const valPago = mapEstadoPago(filterEstadoPago);
    if (valPago) next.push({ id: "payment_status", value: valPago });
    if (filterComuna && filterComuna !== "Todas")
      next.push({ id: "comuna_name", value: filterComuna });
    if (edadMin || edadMax)
      next.push({
        id: "age",
        value: [
          edadMin ? Number(edadMin) : undefined,
          edadMax ? Number(edadMax) : undefined,
        ],
      });
    setColumnFilters(next);
  }, [filterEstado, filterEstadoPago, filterComuna, edadMin, edadMax]);

  const columns = useMemo(
    () => {
      const baseColumns = [
        {
          id: "paciente",
          header: "Identidad del Paciente",
          accessorFn: (row) => row.full_name,
          cell: ({ row }) => (
            <div className="flex items-center gap-4">
              <div className="flex items-center justify-center font-black text-brand-primary rounded-[1.2rem] w-11 h-11 bg-brand-secondary/10 border-2 border-brand-secondary/20 shadow-sm shadow-brand-primary/5 shrink-0 uppercase text-xs">
                {row.original.name[0]}
                {row.original.last_name[0]}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-black text-gray-900 uppercase tracking-tight truncate leading-none mb-1.5">
                  {row.original.full_name}
                </p>
                <div className="flex items-center gap-2 font-mono text-[10px] font-bold text-brand-gray opacity-60">
                  {row.original.rut}
                  <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
                  <span>ID {row.original.id}</span>
                </div>
              </div>
            </div>
          ),
        },
        {
          id: "status",
          header: "Estado Clínico",
          accessorKey: "status",
          cell: ({ getValue }) => {
            const v = String(getValue() ?? "active");
            const cfg = patientStatuses[v] || {
              label: v,
              className: "bg-gray-100 text-gray-500",
            };
            return (
              <div className="text-center">
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-lg text-[8px] font-black uppercase tracking-[0.2em] shadow-sm border ${cfg.className}`}
                >
                  {cfg.label}
                </span>
              </div>
            );
          },
        },
        {
          id: "payment_status",
          header: "Finanzas",
          accessorKey: "payment_status",
          cell: ({ getValue }) => {
            const v = String(getValue() ?? "ok");
            const cfg = debtStatuses[v] || {
              label: v,
              className: "bg-gray-100 text-gray-500",
            };
            return (
              <div className="text-center">
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-lg text-[8px] font-black uppercase tracking-[0.2em] shadow-sm border ${cfg.className}`}
                >
                  {cfg.label}
                </span>
              </div>
            );
          },
        },
        {
          id: "contacto",
          header: "Localización & Contacto",
          cell: ({ row }) => (
            <div className="flex flex-col gap-1 min-w-[160px]">
              <div className="flex items-center gap-2 text-[10px] font-bold text-gray-600 truncate">
                <MapPin className="w-3 h-3 text-brand-primary opacity-40" />{" "}
                {row.original.comuna_name || "Sin Comuna"}
              </div>
              <div className="flex items-center gap-2 text-[10px] font-bold text-gray-600">
                <Phone className="w-3 h-3 text-brand-primary opacity-40" />{" "}
                {row.original.phone || "---"}
              </div>
            </div>
          ),
        },
        {
          header: "Cronología",
          cell: ({ row }) => (
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2 text-[9px] font-black text-brand-gray uppercase tracking-widest">
                <Stethoscope className="w-3 h-3 opacity-40" />{" "}
                {row.original.last_doctor_name
                  ? `Dr. ${row.original.last_doctor_name.split(" ")[0]}`
                  : "Sin Atenciones"}
              </div>
              {row.original.birth_date && (
                <div className="flex items-center gap-2 text-[9px] font-bold text-gray-400 font-mono">
                  <Cake className="w-3 h-3 opacity-30" /> {row.original.age} Años
                </div>
              )}
            </div>
          ),
        },
        {
          id: "actions",
          header: "Gestión",
          cell: ({ row }) => (
            <div className="flex items-center justify-end gap-1.5">
              <button
                onClick={() =>
                  router.get(route("patients.show", row.original.id))
                }
                className="flex items-center gap-2 p-2 px-4 transition-all border text-brand-primary bg-brand-secondary/5 border-brand-secondary/10 rounded-xl hover:bg-brand-primary hover:text-white active:scale-90"
                title="Abrir Ficha Clínica"
              >
                <span className="text-[9px] font-black uppercase tracking-widest">
                  Ficha
                </span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
              <div className="w-px h-6 mx-1 bg-gray-100"></div>
              <button
                onClick={() => handleOpenModalDelete(row.original)}
                className="p-2 text-gray-300 transition-all hover:text-red-500 hover:bg-red-50 rounded-xl active:scale-90"
                title="Eliminar Registro"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ),
          enableSorting: false,
        },
      ];
      if (user && user.roles.some(role => role.name === 'superadmin')) {
        baseColumns.splice(1, 0, {
          accessorKey: "company_id",
          header: "Company ID",
        });
      }
      return baseColumns;
    },
    [handleOpenModalDelete, user]
  );

  const table = useReactTable({
    data: patients,
    columns,
    state: {
      sorting,
      globalFilter: searchTerm,
      columnFilters,
      pagination: { pageSize, pageIndex },
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: setSearchTerm,
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
    autoResetPageIndex: false,
  });

  return (
    <div className="space-y-6 duration-700 animate-in fade-in">
      {/* BARRA DE BÚSQUEDA Y FILTROS PREMIUM */}
      <div className="relative p-6 overflow-hidden bg-white border border-gray-100 shadow-sm rounded-3xl">
        <div className="absolute top-0 right-0 w-32 h-32 -mt-16 -mr-16 rounded-full bg-brand-primary/5 blur-2xl"></div>
        <div className="relative z-10 flex flex-col justify-between gap-6 md:flex-row md:items-center">
          <div className="relative flex-1 max-w-xl group">
            <Search className="absolute w-4 h-4 transition-colors transform -translate-y-1/2 text-brand-gray left-4 top-1/2 group-focus-within:text-brand-primary" />
            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar paciente por nombre, RUT o ID..."
              className="w-full py-4 pl-12 pr-4 text-sm font-bold transition-all border-gray-100 shadow-inner outline-none bg-gray-50 rounded-2xl focus:bg-white focus:ring-4 focus:ring-brand-primary/5 focus:border-brand-primary"
            />
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-3 px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
                showFilters
                  ? "bg-brand-primary text-white shadow-lg shadow-brand-primary/20"
                  : "bg-gray-50 text-brand-gray hover:bg-gray-100 border border-gray-100"
              }`}
            >
              <Filter className="w-4 h-4" />{" "}
              {showFilters ? "Ocultar Filtros" : "Filtros"}
            </button>
            <button
              onClick={() => {
                const worksheet = XLSX.utils.json_to_sheet(
                  patients.map((p) => ({
                    Nombre: p.full_name,
                    RUT: p.rut,
                    Comuna: p.comuna_name,
                    Estado: p.status,
                  }))
                );
                const workbook = XLSX.utils.book_new();
                XLSX.utils.book_append_sheet(workbook, worksheet, "Pacientes");
                XLSX.writeFile(workbook, "nomina_pacientes.xlsx");
              }}
              className="p-4 transition-all border shadow-sm bg-brand-secondary/10 text-brand-primary rounded-xl border-brand-secondary/20 hover:bg-brand-primary hover:text-white active:scale-90"
            >
              <Download className="w-4 h-4" />
            </button>
          </div>
        </div>

        {showFilters && (
          <div className="grid grid-cols-1 gap-6 pt-8 mt-6 duration-300 border-t md:grid-cols-5 border-gray-50 animate-in slide-in-from-top-4">
            <div className="space-y-1">
              <label className="ml-1 enterprise-label opacity-60">
                Estatus Clínico
              </label>
              <select
                value={filterEstado}
                onChange={(e) =>
                  setFilterEstado(
                    e.target.value === "Todos" ? "" : e.target.value
                  )
                }
                className="w-full px-4 py-3 text-xs font-black text-gray-700 border-gray-100 bg-gray-50 rounded-xl focus:ring-brand-primary"
              >
                <option>Todos</option>
                <option>Activo</option>
                <option>Inactivo</option>
                <option>Suspendido</option>
                <option>Cancelado</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="ml-1 enterprise-label opacity-60">
                Estado Financiero
              </label>
              <select
                value={filterEstadoPago}
                onChange={(e) =>
                  setFilterEstadoPago(
                    e.target.value === "Todos" ? "" : e.target.value
                  )
                }
                className="w-full px-4 py-3 text-xs font-black text-gray-700 border-gray-100 bg-gray-50 rounded-xl focus:ring-brand-primary"
              >
                <option>Todos</option>
                <option>Al día</option>
                <option>Con deuda</option>
                <option>Vencida</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="ml-1 enterprise-label opacity-60">
                Residencia
              </label>
              <select
                value={filterComuna}
                onChange={(e) =>
                  setFilterComuna(
                    e.target.value === "Todas" ? "" : e.target.value
                  )
                }
                className="w-full px-4 py-3 text-xs font-black text-gray-700 border-gray-100 bg-gray-50 rounded-xl focus:ring-brand-primary"
              >
                <option>Todas</option>
                {comunasPresentes.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <label className="ml-1 enterprise-label opacity-60">
                Rango Etario
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={edadMin}
                  onChange={(e) => setEdadMin(e.target.value)}
                  placeholder="Mín"
                  className="w-full px-3 py-3 text-xs font-black border-gray-100 bg-gray-50 rounded-xl"
                />
                <input
                  type="number"
                  value={edadMax}
                  onChange={(e) => setEdadMax(e.target.value)}
                  placeholder="Máx"
                  className="w-full px-3 py-3 text-xs font-black border-gray-100 bg-gray-50 rounded-xl"
                />
              </div>
            </div>
            <div className="pt-5">
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="w-full py-3 bg-red-50 text-red-600 rounded-xl font-black uppercase text-[9px] tracking-widest border border-red-100 hover:bg-red-100 transition-all flex items-center justify-center gap-2"
                >
                  <X className="w-3.5 h-3.5" /> Limpiar
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* TABLA ENTERPRISE */}
      <div className="overflow-hidden bg-white border border-gray-100 shadow-xl rounded-enterprise-xl">
        <div className="flex items-center justify-between p-6 border-b border-gray-50 bg-gray-50/30">
          <h2 className="flex items-center gap-3 text-sm font-black tracking-tight text-gray-900 uppercase">
            <Users className="w-5 h-5 text-brand-primary" /> Base de Datos de
            Pacientes
          </h2>
          <span className="text-[9px] font-black text-brand-gray uppercase tracking-[0.2em] bg-white px-4 py-1.5 rounded-xl shadow-sm border border-gray-100">
            {table.getFilteredRowModel().rows.length} Registros Activos
          </span>
        </div>

        <div className="w-full overflow-x-auto custom-scrollbar">
          <table className="w-full border-collapse">
            <thead>
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id} className="bg-gray-50/50">
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      onClick={header.column.getToggleSortingHandler()}
                      className="px-8 py-5 text-left cursor-pointer select-none group"
                    >
                      <div
                        className={`flex items-center gap-2 ${
                          ["status", "payment_status"].includes(
                            header.column.id
                          )
                            ? "justify-center"
                            : ""
                        } ${
                          header.column.id === "actions" ? "justify-end" : ""
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
                    <div className="flex flex-col items-center justify-center space-y-4">
                      <div className="p-6 bg-gray-50 rounded-[2rem] text-gray-200">
                        <Users className="w-12 h-12" />
                      </div>
                      <p className="enterprise-label opacity-40">
                        No se encontraron pacientes registrados
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
                      <td key={cell.id} className="px-8 py-3 whitespace-nowrap">
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

        <div className="p-6 border-t border-gray-100 bg-gray-50/30">
          <TablePagination
            table={table}
            total={patients.length}
            pageSize={pageSize}
            setPageSize={setPageSize}
            pageSizeOptions={[5, 10, 20, 50]}
          />
        </div>
      </div>
    </div>
  );
}
