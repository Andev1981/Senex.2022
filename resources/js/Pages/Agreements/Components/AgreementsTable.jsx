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
  List,
  Building,
  Plus,
  Handshake,
  Settings,
  Eye,
  ArrowRight,
  Database,
  Layers
} from "lucide-react";
import TablePagination from "@/Components/TablePagination";

export default function AgreementsTable({
  agreements,
  handleOpenAgreementForm,
  handleOpenListRules,
  handleOpenRuleForm,
  handleOpenModalDelete,
  user,
}) {
  const [sorting, setSorting] = useState([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [pagesize, setpagesize] = useState(10);
  const [pageIndex, setPageIndex] = useState(0);

  const data = useMemo(() => agreements || [], [agreements]);

  const columns = useMemo(() => {
    const baseColumns = [
      {
          accessorKey: "name",
          header: "Contrato / Convenio",
          cell: ({ getValue, row }) => (
              <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-brand-primary text-white flex items-center justify-center shadow-lg shadow-brand-primary/20 shrink-0 transform rotate-2">
                      <Handshake className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                      <p className="text-sm font-black text-gray-900 uppercase tracking-tight truncate leading-none mb-1">{getValue()}</p>
                      <p className="text-[9px] font-black text-brand-gray opacity-60 uppercase tracking-widest font-mono">Versión {row.original.version}</p>
                  </div>
              </div>
          )
      },
      {
          accessorKey: "insurance.name",
          header: "Aseguradora",
          cell: ({ getValue }) => (
              <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-gray-50 rounded-lg">
                      <Building className="w-3.5 h-3.5 text-brand-primary opacity-40" />
                  </div>
                  <span className="text-[10px] font-black text-gray-700 uppercase tracking-tight">{getValue()?.replace(/^\d+\s-\s/, '')}</span>
              </div>
          )
      },
      {
          accessorKey: "is_active",
          header: "Estado",
          cell: ({ getValue }) => (
              <div className="text-center">
                  <span className={`inline-flex items-center px-3 py-1 rounded-lg text-[8px] font-black uppercase tracking-[0.2em] shadow-sm border ${
                      getValue() ? 'bg-green-50 text-green-600 border-green-100' : 'bg-red-50 text-red-600 border-red-100'
                  }`}>
                      {getValue() ? 'Vigente' : 'Suspendido'}
                  </span>
              </div>
          )
      },
      {
          id: "reglas",
          header: "Tarifario",
          cell: ({ row }) => {
              const count = row.original.rules?.length || 0;
              return (
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-xl border border-gray-100 w-fit">
                      <Database className="w-3.5 h-3.5 text-brand-primary opacity-50" />
                      <span className="text-[10px] font-black text-gray-700 uppercase tracking-widest">{count} Precios</span>
                  </div>
              );
          }
      },
      {
          id: "actions",
          header: "Operaciones",
          cell: ({ row }) => (
            <div className="flex items-center justify-end gap-1.5">
              <button 
                  onClick={() => handleOpenListRules(row.original)}
                  className="p-2 text-brand-primary bg-brand-secondary/5 border border-brand-secondary/10 rounded-xl hover:bg-brand-primary hover:text-white transition-all active:scale-90 flex items-center gap-2 px-4"
                  title="Administrar Tarifas"
              >
                  <span className="text-[9px] font-black uppercase tracking-widest">Auditar</span>
                  <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <div className="w-px h-6 bg-gray-100 mx-1"></div>
              <button 
                  onClick={() => handleOpenRuleForm(row.original)}
                  className="p-2 text-purple-600 bg-purple-50 border border-purple-100 rounded-xl hover:bg-purple-600 hover:text-white transition-all active:scale-90"
                  title="Añadir Nueva Regla"
              >
                <Plus className="w-4 h-4" />
              </button>
              <button 
                  onClick={() => handleOpenAgreementForm(row.original)}
                  className="p-2 text-gray-400 hover:text-brand-primary hover:bg-gray-50 rounded-xl transition-all active:scale-90"
                  title="Editar Convenio"
              >
                <Pencil className="w-4 h-4" />
              </button>
              <button 
                  onClick={() => handleOpenModalDelete(row.original)}
                  className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all active:scale-90"
                  title="Eliminar"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ),
      }
    ];

    if (user && user.roles.some(role => role.name === 'superadmin')) {
      baseColumns.splice(1, 0, {
        accessorKey: "company_id",
        header: "Company ID",
      });
    }

    return baseColumns;
  }, [handleOpenListRules, handleOpenRuleForm, handleOpenAgreementForm, handleOpenModalDelete, user]);

  const table = useReactTable({
    data,
    columns,
    state: { sorting, globalFilter, pagination: { pagesize, pageIndex } },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    onPaginationChange: (updater) => {
      const newState = typeof updater === "function" ? updater({ pageIndex, pagesize }) : updater;
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
    <div className="space-y-6 animate-in fade-in duration-700">
      {/* BUSCADOR PREMIUM */}
      <div className="p-6 bg-white border border-gray-100 shadow-sm rounded-3xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-brand-primary/5 rounded-full -mr-16 -mt-16 blur-2xl"></div>
        <div className="relative group max-w-xl z-10">
          <Search className="absolute w-4 h-4 text-brand-gray transform -translate-y-1/2 left-4 top-1/2 group-focus-within:text-brand-primary transition-colors" />
          <input
            value={globalFilter ?? ""}
            onChange={(e) => setGlobalFilter(e.target.value)}
            placeholder="Buscador inteligente de convenios..."
            className="w-full py-4 pl-12 pr-4 border-gray-100 bg-gray-50 rounded-2xl focus:bg-white focus:ring-4 focus:ring-brand-primary/5 focus:border-brand-primary text-sm font-bold transition-all outline-none shadow-inner"
          />
        </div>
      </div>

      {/* TABLA ENTERPRISE */}
      <div className="bg-white border border-gray-100 shadow-xl rounded-xl-xl overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-50 bg-gray-50/30">
          <h2 className="flex items-center gap-3 text-sm font-black text-gray-900 uppercase tracking-tight">
            <Settings className="w-5 h-5 text-brand-primary" /> Maestro de Tarifarios
          </h2>
          <span className="text-[9px] font-black text-brand-gray uppercase tracking-[0.2em] bg-white px-4 py-1.5 rounded-xl shadow-sm border border-gray-100">
            {table.getFilteredRowModel().rows.length} Convenios Configurados
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
                      className="px-8 py-5 text-left select-none group cursor-pointer"
                    >
                      <div className={`flex items-center gap-2 ${header.column.id === 'actions' ? 'justify-end' : ''} ${header.column.id === 'is_active' ? 'justify-center' : ''}`}>
                        <span className="enterprise-label !mb-0 text-gray-900 group-hover:text-brand-primary transition-colors">
                          {flexRender(header.column.columnDef.header, header.getContext())}
                        </span>
                        {header.column.getCanSort() && (
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                {header.column.getIsSorted() === "asc" ? <ChevronUp className="w-3 h-3 text-brand-primary" /> : <ChevronDown className="w-3 h-3 text-brand-primary" />}
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
                  <td colSpan={columns.length} className="px-8 py-24 text-center">
                    <div className="flex flex-col items-center justify-center space-y-4">
                        <div className="p-6 bg-gray-50 rounded-[2rem] text-gray-200">
                            <Handshake className="w-12 h-12" />
                        </div>
                        <p className="enterprise-label opacity-40">Sin convenios detectados</p>
                    </div>
                  </td>
                </tr>
              ) : (
                table.getRowModel().rows.map((row) => (
                  <tr key={row.id} className="hover:bg-brand-secondary/5 transition-all group">
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="px-8 py-3 whitespace-nowrap">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
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
            total={agreements.length}
            pagesize={pagesize}
            setpagesize={setpagesize}
            pagesizeOptions={[5, 10, 20]}
          />
        </div>
      </div>
    </div>
  );
}