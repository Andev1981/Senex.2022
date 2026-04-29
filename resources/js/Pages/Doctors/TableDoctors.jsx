import React, { useState, useMemo, useEffect } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  getFilteredRowModel,
  flexRender,
} from "@tanstack/react-table";
import * as XLSX from "xlsx";
import {
  ChevronDown,
  ChevronUp,
  FileDown,
  Filter,
  Mail,
  Phone,
  Search,
  Stethoscope,
  UserCog,
  X,
  Eye,
  Activity,
  Users,
} from "lucide-react";
import TablePagination from "@/components/TablePagination";
import { fmtCLP } from "@/utils/utils";

import { Link, router } from "@inertiajs/react";

export default function TableDoctors({
  doctors,
  filters,
  user,
  onEdit,
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [sorting, setSorting] = useState([]);
  const [pageSize, setPageSize] = useState(10);
  const [pageIndex, setPageIndex] = useState(0);
  const [columnFilters, setColumnFilters] = useState([]);

  // Definición de insignias locales para evitar errores de prop faltante
  const getStatusBadge = (status) => {
    const config = {
        active: { label: 'Operativo', class: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
        suspended: { label: 'Suspendido', class: 'bg-amber-100 text-amber-700 border-amber-200' },
        cancelled: { label: 'Inactivo', class: 'bg-gray-100 text-gray-400 border-gray-200' },
    };
    const current = config[status] || config.active;
    return (
        <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border shadow-sm ${current.class}`}>
            {current.label}
        </span>
    );
  };

  const getMobileBadge = (hasAccess) => {
    return hasAccess ? (
        <span className="px-3 py-1 bg-blue-50 text-blue-600 text-[8px] font-black uppercase rounded-lg border border-blue-100 shadow-sm flex items-center gap-1.5 w-fit mx-auto">
            <div className="w-1 h-1 bg-blue-600 rounded-full animate-pulse" /> Mobile OK
        </span>
    ) : (
        <span className="px-3 py-1 bg-gray-50 text-gray-400 text-[8px] font-black uppercase rounded-lg border border-gray-100 opacity-60 w-fit mx-auto block">Sin Acceso</span>
    );
  };

  // Estados para los filtros locales
  const [filterspeciality, setFilterspeciality] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  // Estados para filtros de fecha (Server-side)
  const [month, setMonth] = useState(filters?.month || new Date().getMonth() + 1);
  const [year, setYear] = useState(filters?.year || new Date().getFullYear());

  const handleDateChange = (newMonth, newYear) => {
    setMonth(newMonth);
    setYear(newYear);
    router.visit(route("doctors.index"), {
      data: { month: newMonth, year: newYear },
      preserveState: true,
      only: ["doctors", "filters"],
    });
  };

  const months = [
    { value: 1, label: "Enero" }, { value: 2, label: "Febrero" }, { value: 3, label: "Marzo" },
    { value: 4, label: "Abril" }, { value: 5, label: "Mayo" }, { value: 6, label: "Junio" },
    { value: 7, label: "Julio" }, { value: 8, label: "Agosto" }, { value: 9, label: "Septiembre" },
    { value: 10, label: "Octubre" }, { value: 11, label: "Noviembre" }, { value: 12, label: "Diciembre" }
  ];

  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i);

  const hasActiveFilters = !!(filterspeciality || filterStatus || searchTerm);

  const clearFilters = () => {
    setFilterspeciality("");
    setFilterStatus("");
    setSearchTerm("");
    setColumnFilters([]);
  };

  useEffect(() => {
    const next = [];
    if (filterspeciality && filterspeciality !== "Todas")
      next.push({ id: "speciality", value: filterspeciality });
    if (filterStatus)
      next.push({ id: "branch_status", value: filterStatus });
    setColumnFilters(next);
  }, [filterspeciality, filterStatus]);

  const specialtiesPresentes = useMemo(() => {
    if (!doctors || doctors.length === 0) return [];
    const uniqueSpecialties = [
      ...new Set(doctors.map((d) => d.speciality).filter(Boolean)),
    ];
    return uniqueSpecialties.sort((a, b) => a.localeCompare(b));
  }, [doctors]);

  const columns = useMemo(
    () => {
      const baseColumns = [
        {
          id: "profesional",
          header: "Profesionales",
          accessorFn: (row) => row.full_name,
          cell: ({ row }) => {
            const { phone, email, full_name, last_name, name } = row.original;
            return (
              <div className="flex items-center gap-4">
                <div className="flex items-center justify-center font-black text-brand-primary rounded-[1.2rem] w-11 h-11 bg-brand-secondary/10 border-2 border-brand-secondary/20 shadow-sm shadow-brand-primary/5 shrink-0 uppercase text-xs">
                  {name[0]}
                  {last_name[0]}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-black text-gray-900 uppercase tracking-tight truncate leading-none mb-1.5">
                    {full_name}
                  </p>
                  <div className="flex items-center gap-3 text-[10px] font-bold text-brand-gray opacity-60 uppercase tracking-widest">
                    <span className="flex items-center gap-1.5">
                      <Mail className="w-3 h-3" /> {email}
                    </span>
                  </div>
                </div>
              </div>
            );
          },
        },
        {
          accessorKey: "rut",
          header: "RUT / Fiscal",
          cell: ({ getValue }) => (
            <span className="font-mono text-[11px] font-black text-gray-600">
              {getValue()}
            </span>
          ),
        },
        {
          id: "speciality",
          accessorKey: "speciality",
          header: "Especialidad",
          cell: ({ getValue }) => (
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-gray-50 rounded-lg">
                <Stethoscope className="w-3.5 h-3.5 text-brand-primary" />
              </div>
              <span className="text-[10px] font-black text-gray-700 uppercase tracking-tight">
                {getValue() || "General"}
              </span>
            </div>
          ),
        },
        {
          id: "branch_status",
          header: "Estatus",
          cell: ({ row }) => getStatusBadge(row.original.branch_status),
        },
        {
          id: "mobile_app_access",
          header: "Conectividad",
          cell: ({ row }) => getMobileBadge(row.original.mobile_app_access),
        },
        {
          accessorKey: "sessions_month",
          header: "Atenciones (Mes)",
          cell: ({ row, getValue }) => (
            <span className="flex items-center gap-1">
                 <span className="text-[8px] font-black text-green-600 uppercase tracking-widest bg-amber-50 px-1.5 py-0.5 rounded-md border border-amber-100 shadow-sm"
                title="Sesiones Completadas"
              >
                {getValue() || 0} Compl.
              </span>
              {row.original.pending_sessions_count > 0 && (
                <span className="text-[8px] font-black text-amber-600 uppercase tracking-widest bg-amber-50 px-1.5 py-0.5 rounded-md border border-amber-100 shadow-sm">
                  {row.original.pending_sessions_count} Pend.
                </span>
              )}
            </span>
          ),
        },
        {
          id: "revenue_month",
          accessorKey: "revenue_month",
          header: "Ingresos (Mes)",
          cell: ({ getValue }) => (
            <div className="font-mono text-sm font-black tracking-tighter text-right text-brand-primary">
              {fmtCLP(getValue() || 0)}
            </div>
          ),
        },
        {
          id: "actions",
          header: "Gestión",
          cell: ({ row }) => (
            <div className="flex items-center justify-end gap-1.5">
              <Link
                href={route("doctors.show", row.original.id)}
                className="p-2 cursor-pointer transition-all border text-brand-primary bg-brand-secondary/5 border-brand-secondary/10 rounded-xl hover:bg-brand-primary hover:text-white active:scale-90"
                title="Ver Ficha Detallada"
              >
                <Eye className="w-4 h-4" />
              </Link>
              <button
                onClick={() => onEdit(row.original)}
                className="p-2 cursor-pointer transition-all border text-brand-primary bg-brand-secondary/5 border-brand-secondary/10 rounded-xl hover:bg-brand-primary hover:text-white active:scale-90"
                title="Editar Datos Básicos"
              >
                <UserCog className="w-4 h-4" />
              </button>
            </div>
          ),
          enableSorting: false,
        },
      ];

      return baseColumns;
    },
    [
      doctors,
      user,
    ]
  );

  const table = useReactTable({
    data: doctors,
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
  });

  const exportToExcel = () => {
    const exportData = table.getFilteredRowModel().rows.map((row) => {
      const item = row.original;
      return {
        Profesional: item.full_name,
        Email: item.email,
        Rut: item.rut,
        Teléfono: item.phone,
        Especialidad: item.speciality,
        Estado: item.branch_status || "active",
        "Sesiones Mes": item.sessions_month || 0,
        "Ingresos Mes": item.revenue_month || 0,
      };
    });
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Staff");
    XLSX.writeFile(wb, "staff_clinico.xlsx");
  };

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
              placeholder="Buscar en el staff clínico por nombre o RUT..."
              className="w-full py-4 pl-12 pr-4 text-sm font-bold transition-all border-gray-100 shadow-inner outline-none bg-gray-50 rounded-2xl focus:bg-white focus:ring-4 focus:ring-brand-primary/5 focus:border-brand-primary"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="space-y-1">
              <label className="ml-1 enterprise-label opacity-60">Periodo</label>
              <div className="flex gap-2">
                <select
                  value={month}
                  onChange={(e) => handleDateChange(e.target.value, year)}
                  className="py-2.5 px-4 border-gray-100 bg-gray-50 rounded-xl text-[10px] font-black uppercase tracking-widest focus:ring-brand-primary cursor-pointer min-w-[120px]"
                >
                  {months.map((m) => (
                    <option key={m.value} value={m.value}>{m.label}</option>
                  ))}
                </select>
                <select
                  value={year}
                  onChange={(e) => handleDateChange(month, e.target.value)}
                  className="py-2.5 px-4 border-gray-100 bg-gray-50 rounded-xl text-[10px] font-black uppercase tracking-widest focus:ring-brand-primary cursor-pointer min-w-[100px]"
                >
                  {years.map((y) => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="ml-1 enterprise-label opacity-60">
                Especialidad
              </label>
              <select
                value={filterspeciality}
                onChange={(e) => setFilterspeciality(e.target.value)}
                className="w-full py-2.5 px-4 border-gray-100 bg-gray-50 rounded-xl text-[10px] font-black uppercase tracking-widest focus:ring-brand-primary cursor-pointer min-w-[160px]"
              >
                <option value="">Todas</option>
                {specialtiesPresentes.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="ml-1 enterprise-label opacity-60">Estado</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full py-2.5 px-4 border-gray-100 bg-gray-50 rounded-xl text-[10px] font-black uppercase tracking-widest focus:ring-brand-primary cursor-pointer min-w-[140px]"
              >
                <option value="">Todos</option>
                <option value="active">Operativo</option>
                <option value="suspended">Suspendido</option>
                <option value="cancelled">Inactivo</option>
              </select>
            </div>

            <div className="flex gap-2 pt-5">
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="p-3 text-red-600 transition-all border border-red-100 shadow-sm bg-red-50 rounded-xl hover:bg-red-100 active:scale-90"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={exportToExcel}
                className="p-3 transition-all border shadow-sm bg-brand-secondary/10 text-brand-primary rounded-xl border-brand-secondary/20 hover:bg-brand-primary hover:text-white active:scale-90"
                title="Descargar Reporte Excel"
              >
                <FileDown className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* TABLA DE STAFF */}
      <div className="overflow-hidden bg-white border border-gray-100 shadow-xl rounded-xl-xl">
        <div className="flex items-center justify-between p-6 border-b border-gray-50 bg-gray-50/30">
          <h2 className="flex items-center gap-3 text-sm font-black tracking-tight text-gray-900 uppercase">
            <UserCog className="w-5 h-5 text-brand-primary" /> Nómina de
            Profesionales
          </h2>
          <span className="text-[9px] font-black text-brand-gray uppercase tracking-[0.2em] bg-white px-4 py-1.5 rounded-xl shadow-sm border border-gray-100">
            {table.getFilteredRowModel().rows.length} Profesionales Activos
          </span>
        </div>

        <div className="w-full overflow-x-auto custom-scrollbar">
          <table className="w-full border-collapse">
            <thead className="border-b border-gray-100 bg-gray-50/50">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      className="px-4 py-3 text-left cursor-pointer select-none group"
                      onClick={header.column.getToggleSortingHandler()}
                    >
                      <div
                        className={`flex items-center gap-2 ${
                          [
                            "sessions_month",
                            "revenue_month",
                            "actions",
                          ].includes(header.column.id)
                            ? "justify-end"
                            : ""
                        } ${
                          ["branch_status", "mobile_app_access"].includes(
                            header.column.id
                          )
                            ? "justify-center"
                            : ""
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
                  <td colSpan={columns.length} className="py-24 text-center">
                    <div className="flex flex-col items-center justify-center space-y-4">
                      <div className="p-6 bg-gray-50 rounded-[2rem] text-gray-200">
                        <Users className="w-12 h-12" />
                      </div>
                      <p className="enterprise-label opacity-40">
                        No se encontraron profesionales con los criterios de
                        búsqueda
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
                      <td key={cell.id} className="px-4 py-2 whitespace-nowrap">
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
            total={table.getFilteredRowModel().rows.length}
            pageSize={pageSize}
            setPageSize={setPageSize}
            pagesizeOptions={[5, 10, 20, 50]}
          />
        </div>
      </div>
    </div>
  );
}
