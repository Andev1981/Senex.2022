import React, { useState, useMemo } from "react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, Link } from "@inertiajs/react";
import TablePagination from "@/components/TablePagination";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  getFilteredRowModel,
  flexRender,
} from "@tanstack/react-table";
import {
  Building2,
  Plus,
  Settings,
  AlertTriangle,
  CheckCircle,
  Search,
  ChevronUp,
  ChevronDown,
} from "lucide-react";

export default function Index({ companies }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [sorting, setSorting] = useState([]);
  const [pageSize, setPageSize] = useState(10);
  const [pageIndex, setPageIndex] = useState(0);

  const columns = useMemo(
    () => [
      {
        id: "entidad",
        header: "Entidad Corporativa",
        accessorFn: (row) => row.business_name,
        cell: ({ row }) => {
          const company = row.original;
          return (
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center overflow-hidden border border-gray-100 shadow-sm shrink-0">
                {company.logo_url ? (
                  <img
                    src={company.logo_url}
                    alt="Logo"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Building2 className="w-6 h-6 text-brand-primary opacity-40" />
                )}
              </div>
              <div>
                <h3 className="font-black text-sm text-gray-900 uppercase tracking-tight">
                  {company.business_name}
                </h3>
                <p className="text-[10px] font-black text-brand-gray uppercase tracking-widest mt-0.5">
                  RUT: {company.rut}
                </p>
              </div>
            </div>
          );
        },
      },
      {
        id: "estado_dte",
        header: "Certificación SII",
        accessorFn: (row) => (row.is_configured ? "Activo" : "Pendiente"),
        cell: ({ getValue }) => (
          <div className="text-center">
            {getValue() === "Activo" ? (
              <span className="inline-flex items-center px-4 py-1.5 rounded-xl text-[9px] font-black bg-green-50 text-green-600 uppercase tracking-widest border border-green-100">
                <CheckCircle className="w-3 h-3 mr-2" /> DTE Activo
              </span>
            ) : (
              <span className="inline-flex items-center px-4 py-1.5 rounded-xl text-[9px] font-black bg-amber-50 text-amber-600 uppercase tracking-widest border border-amber-100">
                <AlertTriangle className="w-3 h-3 mr-2" /> No Configurado
              </span>
            )}
          </div>
        ),
      },
      {
        id: "actions",
        header: "Configuración",
        cell: ({ row }) => (
          <div className="flex justify-end">
            <Link
              href={route("companies.edit", row.original.id)}
              className="flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.15em] text-brand-primary hover:text-white hover:bg-brand-primary transition-all bg-brand-secondary/5 px-4 py-2 rounded-xl border border-brand-secondary/10"
            >
              <Settings className="w-4 h-4" /> Administrar
            </Link>
          </div>
        ),
      },
    ],
    []
  );

  const table = useReactTable({
    data: companies,
    columns,
    state: {
      sorting,
      globalFilter: searchTerm,
      pagination: { pageSize, pageIndex },
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: setSearchTerm,
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
  });

  return (
    <AuthenticatedLayout>
      <Head title="Empresas" />

      <div className="min-h-screen p-6 bg-gray-50/50 space-y-8">
        {/* Header Hero */}
        <div className="p-8 bg-white border border-gray-100 shadow-sm rounded-[2rem] relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-brand-primary/5 rounded-full -mr-32 -mt-32 blur-3xl"></div>
          <div className="flex items-center justify-between relative z-10">
            <div className="flex items-center gap-4">
              <div className="flex items-center justify-center w-14 h-14 shadow-xl shadow-brand-primary/20 bg-brand-primary rounded-2xl transform rotate-3">
                <Building2 className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-black text-gray-900 tracking-tight leading-none mb-1">Estructura Corporativa</h1>
                <p className="text-[10px] font-black text-brand-gray uppercase tracking-[0.2em]">
                  Gestión de Holdings & Sucursales SII
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Link
                href={route("companies.create")}
                className="flex items-center gap-3 px-8 py-4 font-black uppercase tracking-widest text-[10px] text-white transition-all bg-brand-primary rounded-2xl shadow-lg shadow-brand-primary/20 hover:brightness-110 active:scale-95"
              >
                <Plus className="w-4 h-4" />
                Registrar Nueva Entidad
              </Link>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="p-6 bg-white border border-gray-100 shadow-sm rounded-3xl">
          <div className="relative group max-w-md">
            <Search className="absolute w-4 h-4 text-brand-gray transform -translate-y-1/2 left-4 top-1/2 group-focus-within:text-brand-primary transition-colors" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por RUT o Razón Social..."
              className="w-full pl-12 pr-4 py-4 border-gray-50 bg-gray-50/50 rounded-2xl focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/5 focus:bg-white text-sm font-bold outline-none"
            />
          </div>
        </div>

        {/* Table de Empresas */}
        <div className="bg-white border border-gray-100 shadow-xl rounded-[2.5rem] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                {table.getHeaderGroups().map((headerGroup) => (
                  <tr key={headerGroup.id} className="bg-gray-50/50 border-b border-gray-100">
                    {headerGroup.headers.map((header) => (
                      <th
                        key={header.id}
                        onClick={header.column.getToggleSortingHandler()}
                        className="px-6 py-3 text-left transition-colors cursor-pointer select-none hover:bg-gray-100 group"
                      >
                        <div className={`flex items-center gap-2 ${header.id === 'actions' ? 'justify-end' : ''} ${header.id === 'estado_dte' ? 'justify-center' : ''}`}>
                          <span className="enterprise-label !mb-0 text-gray-900 group-hover:text-brand-primary transition-colors">
                            {flexRender(header.column.columnDef.header, header.getContext())}
                          </span>
                          {header.column.getCanSort() && (
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                              {header.column.getIsSorted() === "asc" ? (
                                <ChevronUp className="w-3 h-3 text-brand-primary" />
                              ) : header.column.getIsSorted() === "desc" ? (
                                <ChevronDown className="w-3 h-3 text-brand-primary" />
                              ) : (
                                <div className="w-3 h-3 border-2 border-brand-primary/20 rounded-full"></div>
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
                {table.getRowModel().rows.length > 0 ? (
                  table.getRowModel().rows.map((row) => (
                    <tr
                      key={row.id}
                      className="transition-all hover:bg-brand-secondary/5 group"
                    >
                      {row.getVisibleCells().map((cell) => (
                        <td key={cell.id} className="px-6 py-2.5">
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </td>
                      ))}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="3" className="p-20 text-center enterprise-label opacity-40">
                        No se han detectado entidades registradas
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="p-6 bg-gray-50/30 border-t border-gray-100">
            <TablePagination
                table={table}
                total={companies.length}
                pageSize={pageSize}
                setPageSize={setPageSize}
                pagesizeOptions={[5, 10, 15, 20, 30, 40, 50]}
            />
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}