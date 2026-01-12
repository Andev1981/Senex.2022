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
  Download,
  Eye,
  FileText,
  Printer,
  Search,
  Send,
  XCircle,
  RefreshCw,
  Copy,
  Calendar,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import TablePagination from "@/Components/TablePagination";
import { fmtDate, clp } from "@/utils/utils";
import { getDteStatusConfig } from "@/constants/dtesStatuses";
import Swal from "sweetalert2";
import axios from "axios";

export default function List({
  invoices = [],
  setSelectedDocument,
  DTES_TYPES = [],
  onRetrySII,
  onDuplicate
}) {
  const [sorting, setSorting] = useState([]);
  const [pagesize, setpagesize] = useState(10);
  const [globalFilter, setGlobalFilter] = useState("");
  const [columnFilters, setColumnFilters] = useState([]);
  const [pagination, setPagination] = useState({ pageIndex: 0, pagesize: 10 });

  const handleDownload = (invoice) => {
    if (invoice.dte_status !== 'accepted') {
        Swal.fire("Documento no listo", "Solo se pueden descargar PDFs de documentos ya aceptados por el SII.", "warning");
        return;
    }
    window.open(route("invoices.pdf", invoice.id), "_blank");
  };

  const handleSendEmail = async (invoice) => {
    if (invoice.dte_status !== 'accepted') {
        Swal.fire("Atención", "El documento debe estar aceptado para ser enviado oficialmente.", "warning");
        return;
    }

    Swal.fire({
        title: "Enviar Documento",
        text: `Se enviará a: ${invoice.patient?.email || 'el correo del paciente'}`,
        input: "email",
        inputValue: invoice.patient?.email || "",
        showCancelButton: true,
        confirmButtonText: "Enviar por Email",
        confirmButtonColor: "#3292b3",
        showLoaderOnConfirm: true,
        preConfirm: async (email) => {
            try {
                return await axios.post(route("invoices.send_email", invoice.id), { email });
            } catch (error) {
                Swal.showValidationMessage(`Error: ${error.response?.data?.message || 'Fallo en el servidor'}`);
            }
        }
    }).then((result) => {
        if (result.isConfirmed) Swal.fire("¡Éxito!", "Documento enviado correctamente.", "success");
    });
  };

  const columns = useMemo(() => [
    {
      accessorKey: "dte_type",
      header: "Documento",
      cell: ({ row }) => {
        const typeValue = row.original.dte_type;
        const docType = DTES_TYPES.find((dt) => dt.code === typeValue);
        const Icon = docType?.icon || FileText;
        const typeStyle = docType?.styles || { text: "text-gray-600", bg: "bg-gray-100" };
        return (
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl shadow-sm ${typeStyle.bg}`}>
              <Icon className={`w-4 h-4 ${typeStyle.text}`} />
            </div>
            <div className="flex flex-col">
                <span className="text-[10px] font-black text-gray-900 uppercase tracking-tight">{docType?.label || typeValue}</span>
                <span className="font-mono text-[9px] font-bold text-gray-400">Tipo {typeValue}</span>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "dte_folio",
      header: "Folio SII",
      cell: ({ getValue }) => (
        <div className="flex items-center gap-2">
            <span className={`font-mono text-sm font-black ${getValue() ? 'text-brand-primary' : 'text-gray-300 italic'}`}>
                {getValue() || "Pendiente"}
            </span>
        </div>
      ),
    },
    {
      accessorKey: "issue_date",
      header: "Emisión",
      cell: ({ getValue }) => (
        <div className="flex items-center gap-2 font-mono text-xs font-bold text-gray-500">
            <Calendar className="w-3 h-3 opacity-40" />
            {fmtDate(getValue())}
        </div>
      ),
    },
    {
      accessorKey: "patient.full_name",
      header: "Receptor",
      cell: ({ row }) => (
        <div className="flex flex-col min-w-[140px]">
            <span className="text-xs font-black text-gray-800 uppercase tracking-tight truncate">
                {row.original.patient?.full_name || 'Particular'}
            </span>
            <span className="text-[9px] font-bold text-brand-gray opacity-60 font-mono">
                {row.original.patient?.rut || '---'}
            </span>
        </div>
      ),
    },
    {
      accessorKey: "amount_total_clp",
      header: "Monto Total",
      cell: ({ getValue }) => (
        <div className="text-right font-black text-gray-900 font-mono text-sm">
            {clp.format(getValue() || 0)}
        </div>
      ),
    },
    {
      accessorKey: "dte_status",
      header: "Estado SII",
      cell: ({ getValue }) => {
          const config = getDteStatusConfig(getValue());
          return (
            <div className="text-center">
              <span className={`inline-flex items-center px-3 py-1 rounded-lg text-[8px] font-black uppercase tracking-[0.2em] shadow-sm border ${config.className}`}>
                {config.label}
              </span>
            </div>
          );
      },
    },
    {
      id: "actions",
      header: "Operaciones",
      cell: ({ row }) => {
        const inv = row.original;
        const isAccepted = inv.dte_status === 'accepted';
        const isRejected = inv.dte_status === 'rejected';
        const isSent = inv.dte_status === 'sent';

        return (
          <div className="flex items-center justify-end gap-1.5">
            <button 
                onClick={() => setSelectedDocument(inv)} 
                className="p-2 text-brand-primary bg-brand-secondary/5 border border-brand-secondary/10 rounded-xl hover:bg-brand-primary hover:text-white transition-all active:scale-90" 
                title="Detalles"
            >
              <Eye className="w-4 h-4" />
            </button>
            
            {isRejected && (
              <button onClick={() => onDuplicate(inv)} className="p-2 text-blue-600 bg-blue-50 border border-blue-100 rounded-xl hover:bg-blue-600 hover:text-white transition-all active:scale-90" title="Corregir">
                <Copy className="w-4 h-4" />
              </button>
            )}

            {!isAccepted && !isRejected && (
              <button onClick={() => onRetrySII(inv)} 
                className={`p-2 rounded-xl transition-all border active:scale-90 ${isSent ? 'text-purple-600 bg-purple-50 border-purple-100 hover:bg-purple-600 hover:text-white' : 'text-amber-600 bg-amber-50 border-amber-100 hover:bg-amber-600 hover:text-white'}`} 
                title={isSent ? "Consultar" : "Emitir"}
              >
                <RefreshCw className={`w-4 h-4 ${isSent ? 'animate-spin-slow' : ''}`} />
              </button>
            )}

            <button onClick={() => handleDownload(inv)} 
                className={`p-2 rounded-xl transition-all border active:scale-90 ${isAccepted ? 'text-gray-600 bg-gray-50 border-gray-100 hover:bg-gray-900 hover:text-white' : 'text-gray-200 bg-gray-50 border-gray-100 cursor-not-allowed'}`} 
                title="PDF"
            >
              <Printer className="w-4 h-4" />
            </button>
            
            <button onClick={() => handleSendEmail(inv)} 
                className={`p-2 rounded-xl transition-all border active:scale-90 ${isAccepted ? 'text-green-600 bg-green-50 border-green-100 hover:bg-green-600 hover:text-white' : 'text-gray-200 bg-gray-50 border-gray-100 cursor-not-allowed'}`} 
                title="Email"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        );
      },
    },
  ], [DTES_TYPES, setSelectedDocument, onRetrySII]);

  const table = useReactTable({
    data: invoices,
    columns,
    state: { sorting, globalFilter, columnFilters, pagination },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    onColumnFiltersChange: setColumnFilters,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      <div className="p-6 bg-white border border-gray-100 shadow-sm rounded-3xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-brand-primary/5 rounded-full -mr-16 -mt-16 blur-2xl"></div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-4 relative z-10">
          <div className="relative md:col-span-2 group">
            <Search className="absolute w-4 h-4 text-brand-gray transform -translate-y-1/2 left-4 top-1/2 group-focus-within:text-brand-primary transition-colors" />
            <input 
                type="text" 
                placeholder="Filtrar por receptor, RUT o folio..." 
                value={globalFilter ?? ""} 
                onChange={(e) => setGlobalFilter(e.target.value)} 
                className="w-full py-4 pl-12 pr-4 border-gray-100 bg-gray-50 rounded-2xl focus:bg-white focus:ring-4 focus:ring-brand-primary/5 focus:border-brand-primary text-sm font-bold transition-all outline-none shadow-inner" 
            />
          </div>
          <div className="space-y-1">
            <label className="enterprise-label ml-1 opacity-60">Tipo Doc</label>
            <select 
                onChange={(e) => table.getColumn("dte_type").setFilterValue(e.target.value === "todos" ? "" : e.target.value)} 
                className="w-full py-3 px-4 border-gray-100 bg-gray-50 rounded-xl text-[10px] font-black uppercase tracking-widest focus:ring-brand-primary"
            >
                <option value="todos">Todos los tipos</option>
                {DTES_TYPES.map((type) => <option key={type.code} value={type.code}>{type.label}</option>)}
            </select>
          </div>
          <div className="space-y-1">
            <label className="enterprise-label ml-1 opacity-60">Estatus SII</label>
            <select 
                onChange={(e) => table.getColumn("dte_status").setFilterValue(e.target.value === "todos" ? "" : e.target.value)} 
                className="w-full py-3 px-4 border-gray-100 bg-gray-50 rounded-xl text-[10px] font-black uppercase tracking-widest focus:ring-brand-primary"
            >
                <option value="todos">Todos los estados</option>
                <option value="pending">Pendiente</option>
                <option value="sent">Enviado</option>
                <option value="accepted">Aceptado</option>
                <option value="rejected">Rechazado</option>
            </select>
          </div>
        </div>
      </div>

      <div className="overflow-hidden bg-white border border-gray-100 shadow-xl rounded-enterprise-xl">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full border-collapse">
            <thead className="bg-gray-50/50 border-b border-gray-100">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th key={header.id} className="px-6 py-5 text-left select-none group cursor-pointer" onClick={header.column.getToggleSortingHandler()}>
                      <div className={`flex items-center gap-2 ${header.column.id === 'amount_total_clp' ? 'justify-end' : ''} ${header.column.id === 'dte_status' ? 'justify-center' : ''} ${header.column.id === 'actions' ? 'justify-end' : ''}`}>
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
              {table.getRowModel().rows.length > 0 ? (
                table.getRowModel().rows.map((row) => (
                  <tr key={row.id} className="hover:bg-brand-secondary/5 transition-all group">
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="px-6 py-3 whitespace-nowrap">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr>
                    <td colSpan="7" className="px-6 py-24 text-center">
                        <div className="flex flex-col items-center justify-center space-y-4">
                            <div className="p-6 bg-gray-50 rounded-[2rem] text-gray-200">
                                <FileText className="w-12 h-12" />
                            </div>
                            <p className="enterprise-label opacity-40">No se han detectado documentos registrados</p>
                        </div>
                    </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        <div className="bg-gray-50/30 border-t border-gray-100">
            <TablePagination 
                table={table} 
                total={table.getFilteredRowModel().rows.length} 
                pagesize={pagesize} 
                setpagesize={setpagesize} 
                pagesizeOptions={[5, 10, 20, 50]} 
            />
        </div>
      </div>
    </div>
  );
}