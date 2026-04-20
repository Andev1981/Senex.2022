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
  Mail,
  Phone,
  Stethoscope,
  Download,
  Filter,
  X,
  Cake,
  ExternalLink,
  Pencil,
  Users,
} from "lucide-react";
import * as XLSX from "xlsx";
import TablePagination from "@/components/TablePagination";
import { route } from "ziggy-js";
import { useForm, router } from "@inertiajs/react";
import { patientStatuses, debtStatuses } from "@/helpers/status";

export default function TablePatients({ 
  patients, 
  handleOpenModalDelete, 
  communes, 
  user, 
  handleEditPatient,
  business_type = 'clinical'
}) {
  const isClinical = business_type === 'clinical';
  const entityLabel = isClinical ? 'Paciente' : 'Cliente';

  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [filterEstado, setFilterEstado] = useState("");
  const [filterEstadoPago, setFilterEstadoPago] = useState("");
  const [filterComuna, setFilterComuna] = useState("");
  const [edadMin, setEdadMin] = useState("");
  const [edadMax, setEdadMax] = useState("");
  const [globalFilter, setGlobalFilter] = useState("");

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

  // --- 1. FILTRADO GLOBAL ---
  const filteredData = useMemo(() => {
    let data = patients;
    if (globalFilter) {
      const filter = globalFilter.toLowerCase();
      data = data.filter((row) =>
        Object.values(row).some(
          (val) => val && val.toString().toLowerCase().includes(filter)
        )
      );
    }
    return data;
  }, [globalFilter, patients]);

  const hasActiveFilters = !!(filterEstado || filterEstadoPago || filterComuna || edadMin || edadMax);

  const clearFilters = () => {
    setFilterEstado("");
    setFilterEstadoPago("");
    setFilterComuna("");
    setEdadMin("");
    setEdadMax("");
    setSearchTerm("");
    setColumnFilters([]);
  };

  const columns = useMemo(
    () => {
      const baseColumns = [
        {
          id: "entidad",
          header: `Identidad del ${entityLabel}`,
          accessorFn: (row) => row.full_name,
          cell: ({ row }) => (
            <div className="flex items-center gap-4">
              <div className="flex items-center justify-center font-black text-brand-primary rounded-[1.2rem] w-11 h-11 bg-brand-secondary/10 border-2 border-brand-secondary/20 shadow-sm shadow-brand-primary/5 shrink-0 uppercase text-xs">
                {row.original.name?.[0] || '?'}{row.original.last_name?.[0] || '?'}
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
          id: "contacto",
          header: "Contacto & Ubicación",
          cell: ({ row }) => (
            <div className="flex flex-col gap-1 min-w-[160px]">
              {row.original.email && (
                <div className="flex items-center gap-2 text-[10px] font-bold text-brand-primary truncate">
                    <Mail className="w-3 h-3 opacity-60" /> {row.original.email}
                </div>
              )}
              <div className="flex items-center gap-2 text-[10px] font-bold text-gray-600">
                <Phone className="w-3 h-3 text-brand-primary opacity-40" />{" "}
                {row.original.phone || "Sin Teléfono"}
              </div>
              <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 truncate italic">
                <MapPin className="w-3 h-3 opacity-40" />{" "}
                {row.original.comuna_name || "Sin Comuna"}
              </div>
            </div>
          ),
        }
      ];

      if (isClinical) {
        baseColumns.push({
          id: "status",
          header: "Estado Clínico",
          accessorKey: "status",
          cell: ({ getValue }) => {
            const v = String(getValue() ?? "active");
            const cfg = patientStatuses[v] || { label: v, className: "bg-gray-100 text-gray-500" };
            return (
              <div className="text-center">
                <span className={`inline-flex items-center px-3 py-1 rounded-lg text-[8px] font-black uppercase tracking-[0.2em] shadow-sm border ${cfg.className}`}>
                  {cfg.label}
                </span>
              </div>
            );
          },
        });

        baseColumns.push({
          header: "Seguimiento Médico",
          cell: ({ row }) => (
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2 text-[9px] font-black text-brand-gray uppercase tracking-widest">
                <Stethoscope className="w-3 h-3 opacity-40" />{" "}
                {row.original.last_doctor_name ? `Dr. ${row.original.last_doctor_name.split(" ")[0]}` : "Sin Atenciones"}
              </div>
              {row.original.age && (
                <div className="flex items-center gap-2 text-[9px] font-bold text-gray-400 font-mono">
                  <Cake className="w-3 h-3 opacity-30" /> {row.original.age} Años
                </div>
              )}
            </div>
          ),
        });
      }

      baseColumns.push({
        id: "payment_status",
        header: "Finanzas",
        accessorKey: "due_amount",
        cell: ({ getValue }) => {
          const due = Number(getValue() || 0);
          return (
            <div className="text-center">
              <span className={`inline-flex items-center px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest shadow-sm border ${
                due > 0 ? 'bg-red-50 text-red-600 border-red-100' : 'bg-green-50 text-green-600 border-green-100'
              }`}>
                {due > 0 ? `$${due.toLocaleString()}` : "Al Día"}
              </span>
            </div>
          );
        },
      });

      baseColumns.push({
        id: "actions",
        header: "Gestión",
        cell: ({ row }) => (
          <div className="flex items-center justify-end gap-1.5">
            <button
              onClick={() => router.get(route("patients.show", row.original.id))}
              className="flex items-center gap-2 p-2 px-4 transition-all border text-brand-primary bg-brand-secondary/5 border-brand-secondary/10 rounded-xl hover:bg-brand-primary hover:text-white active:scale-90"
            >
              <span className="text-[9px] font-black uppercase tracking-widest">
                {isClinical ? "Ficha" : "Perfil"}
              </span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
            <div className="w-px h-6 mx-1 bg-gray-100"></div>
            <button onClick={() => handleEditPatient(row.original)} className="p-2 text-gray-400 hover:text-brand-primary hover:bg-brand-secondary/10 rounded-xl transition-all">
              <Pencil className="w-4 h-4" />
            </button>
            <button onClick={() => handleOpenModalDelete(row.original)} className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ),
        enableSorting: false,
      });

      if (user?.roles?.some(role => role.name === 'superadmin')) {
        baseColumns.splice(1, 0, { accessorKey: "company_id", header: "Company ID" });
      }
      return baseColumns;
    },
    [handleOpenModalDelete, user, patients, business_type, isClinical, entityLabel]
  );

  const table = useReactTable({
    data: filteredData,
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
      const newState = typeof updater === "function" ? updater({ pageIndex, pageSize }) : updater;
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
      {/* BARRA DE BÚSQUEDA Y FILTROS */}
      <div className="relative p-6 overflow-hidden bg-white border border-gray-100 shadow-sm rounded-3xl">
        <div className="relative z-10 flex flex-col justify-between gap-6 md:flex-row md:items-center">
          <div className="relative flex-1 max-w-xl group">
            <Search className="absolute w-4 h-4 text-brand-gray left-4 top-1/2 -translate-y-1/2 group-focus-within:text-brand-primary" />
            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={`Buscar ${entityLabel.toLowerCase()}...`}
              className="w-full py-4 pl-12 pr-4 text-sm font-bold transition-all border-gray-100 shadow-inner outline-none bg-gray-50 rounded-2xl focus:bg-white focus:ring-4 focus:ring-brand-primary/5 focus:border-brand-primary"
            />
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-3 px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
                showFilters ? "bg-brand-primary text-white" : "bg-gray-50 text-brand-gray"
              }`}
            >
              <Filter className="w-4 h-4" /> {showFilters ? "Ocultar Filtros" : "Filtros"}
            </button>
          </div>
        </div>
      </div>

      {/* TABLA */}
      <div className="overflow-hidden bg-white border border-gray-100 shadow-xl rounded-3xl">
        <div className="flex items-center justify-between p-6 border-b border-gray-50 bg-gray-50/30">
          <h2 className="flex items-center gap-3 text-sm font-black tracking-tight text-gray-900 uppercase">
            <Users className="w-5 h-5 text-brand-primary" /> Directorio de {isClinical ? 'Pacientes' : 'Clientes'}
          </h2>
        </div>
        <div className="w-full overflow-x-auto custom-scrollbar">
          <table className="w-full border-collapse">
            <thead>
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id} className="bg-gray-50/50">
                  {headerGroup.headers.map((header) => (
                    <th key={header.id} className="px-8 py-5 text-left cursor-pointer select-none group">
                      <div className="flex items-center gap-2">
                        <span className="enterprise-label !mb-0 text-gray-900">
                          {flexRender(header.column.columnDef.header, header.getContext())}
                        </span>
                      </div>
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="divide-y divide-gray-50">
              {table.getRowModel().rows.map((row) => (
                <tr key={row.id} className="transition-all hover:bg-brand-secondary/5 group">
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-8 py-3 whitespace-nowrap">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="p-6 border-t border-gray-100 bg-gray-50/30">
          <TablePagination table={table} total={patients.length} pageSize={pageSize} setPageSize={setPageSize} />
        </div>
      </div>
    </div>
  );
}
