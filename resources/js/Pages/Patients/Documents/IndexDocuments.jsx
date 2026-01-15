import React, { useState, useMemo } from "react";
import { 
  FileText, 
  Plus, 
  Download, 
  ExternalLink, 
  History, 
  FileCheck, 
  UploadCloud,
  X,
  Search,
  ChevronUp,
  ChevronDown,
  Database,
  Cloud
} from "lucide-react";
import { useForm, usePage } from "@inertiajs/react";
import Modal from "@/Components/Modal";
import PrimaryButton from "@/Components/PrimaryButton";
import SecondaryButton from "@/Components/SecondaryButton";
import TablePagination from "@/Components/TablePagination";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  getFilteredRowModel,
  flexRender,
} from "@tanstack/react-table";
import { fmtCLP, fmtDate } from "@/utils/utils";

export default function IndexDocuments({ patient, treatments = [] }) {
  const [activeTab, setActiveTab] = useState("clinical");
  const [isUploadModalOpen, setIsContextModalOpen] = useState(false);

  // --- TAB 1: ARCHIVOS CLÍNICOS ---
  const attachments = patient.attachments || [];

  // --- TAB 2: DTEs (SII) ---
  const dteInvoices = useMemo(() => {
    return (patient.invoices || [])
      .filter(inv => inv.current_dte)
      .map(inv => ({
        id: inv.id,
        date: inv.issue_date,
        type: inv.type_name,
        folio: inv.dte_folio,
        amount: inv.amount_total_clp,
        status: inv.dte_status,
        pdf_url: route('invoices.pdf.stream', inv.id)
      }));
  }, [patient.invoices]);

  const [sorting, setSorting] = useState([]);
  const [pageSize, setPageSize] = useState(10);
  const [pageIndex, setPageIndex] = useState(0);

  const dteColumns = useMemo(() => [
    {
      accessorKey: "date",
      header: "Fecha",
      cell: ({ getValue }) => <span className="font-mono text-xs">{fmtDate(getValue())}</span>
    },
    {
      accessorKey: "type",
      header: "Tipo Documento",
      cell: ({ getValue }) => <span className="text-[10px] font-black uppercase tracking-tight">{getValue()}</span>
    },
    {
      accessorKey: "folio",
      header: "Folio",
      cell: ({ getValue }) => <span className="font-mono font-black text-brand-primary">{getValue() || 'S/N'}</span>
    },
    {
      accessorKey: "amount",
      header: "Monto",
      cell: ({ getValue }) => <span className="font-mono font-black">{fmtCLP(getValue())}</span>
    },
    {
      id: "actions",
      header: "Acciones",
      cell: ({ row }) => (
        <a 
          href={row.original.pdf_url} 
          target="_blank"
          className="p-2 text-brand-primary hover:bg-brand-secondary/10 rounded-xl transition-all inline-flex items-center gap-2 text-[10px] font-black uppercase"
        >
          <Download className="w-4 h-4" /> PDF
        </a>
      )
    }
  ], []);

  const table = useReactTable({
    data: dteInvoices,
    columns: dteColumns,
    state: { sorting, pagination: { pageSize, pageIndex } },
    onSortingChange: setSorting,
    onPaginationChange: (updater) => {
        const newState = typeof updater === "function" ? updater({ pageIndex, pageSize }) : updater;
        setPageIndex(newState.pageIndex);
        setPageSize(newState.pageSize);
    },
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  return (
    <div className="space-y-8 duration-500 animate-in fade-in">
      {/* 1. Selector de Sub-Módulo */}
      <div className="flex p-1.5 bg-gray-100 rounded-2xl w-fit">
        <button
          onClick={() => setActiveTab("clinical")}
          className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center gap-2 ${
            activeTab === "clinical" ? "bg-white text-brand-primary shadow-sm" : "text-brand-gray hover:text-gray-600"
          }`}
        >
          <Database className="w-4 h-4" /> Archivo Clínico
        </button>
        <button
          onClick={() => setActiveTab("dte")}
          className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center gap-2 ${
            activeTab === "dte" ? "bg-white text-brand-primary shadow-sm" : "text-brand-gray hover:text-gray-600"
          }`}
        >
          <FileCheck className="w-4 h-4" /> Facturación SII
        </button>
      </div>

      {/* 2. Área de Contenido */}
      {activeTab === "clinical" ? (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="enterprise-label !mb-0 flex items-center gap-3">
                <History className="w-5 h-5 text-brand-primary" /> Historial de Adjuntos Externos
            </h3>
            <button
              onClick={() => setIsContextModalOpen(true)}
              className="flex items-center gap-2 px-6 py-3 bg-brand-primary text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:brightness-110 shadow-lg shadow-brand-primary/20 transition-all active:scale-95"
            >
              <UploadCloud className="w-4 h-4" /> Subir Documento
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {attachments.length > 0 ? (
              attachments.map((doc) => (
                <div
                  key={doc.id}
                  className="group bg-white border border-gray-100 rounded-[2rem] p-6 hover:shadow-xl hover:scale-[1.02] transition-all duration-300 relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-24 h-24 bg-brand-primary/5 rounded-full -mr-12 -mt-12 blur-2xl group-hover:bg-brand-primary/10 transition-colors"></div>
                  
                  <div className="flex items-start gap-4 relative z-10">
                    <div className="p-4 bg-brand-secondary/10 text-brand-primary rounded-2xl group-hover:rotate-6 transition-transform">
                      <FileText className="w-8 h-8" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-black text-gray-900 uppercase text-xs tracking-tight truncate mb-1">
                        {doc.title}
                      </h4>
                      <p className="text-[9px] font-black text-brand-gray uppercase tracking-widest opacity-60">
                        Tratamiento: {doc.treatment?.diagnostic?.description || 'General'}
                      </p>
                      <div className="mt-4 flex items-center gap-3">
                        <span className="text-[10px] font-bold text-gray-400 font-mono">
                          {(doc.size_bytes / 1024 / 1024).toFixed(2)} MB
                        </span>
                        <div className="w-1 h-1 rounded-full bg-gray-200"></div>
                        <span className="text-[10px] font-bold text-gray-400">
                          {new Date(doc.created_at).toLocaleDateString("es-CL")}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-gray-50 flex gap-2 relative z-10">
                    <a
                      href={doc.url}
                      target="_blank"
                      className="flex-1 flex items-center justify-center gap-2 py-3 bg-gray-50 text-brand-primary text-[9px] font-black uppercase tracking-widest rounded-xl hover:bg-brand-primary hover:text-white transition-all shadow-sm"
                    >
                      <ExternalLink className="w-3 h-3" /> Ver Archivo
                    </a>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full py-20 text-center border-2 border-dashed border-gray-100 rounded-[3rem] bg-gray-50/30">
                <Cloud className="w-16 h-16 text-gray-200 mx-auto mb-4" />
                <p className="enterprise-label opacity-40">No hay documentos clínicos cargados</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
          <div className="flex items-center justify-between mb-2">
            <h3 className="enterprise-label !mb-0 flex items-center gap-3">
                <FileCheck className="w-5 h-5 text-brand-primary" /> Historial de Documentos SII
            </h3>
          </div>

          <div className="bg-white border border-gray-100 shadow-xl rounded-[2rem] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  {table.getHeaderGroups().map((headerGroup) => (
                    <tr key={headerGroup.id} className="bg-gray-50/50 border-b border-gray-100">
                      {headerGroup.headers.map((header) => (
                        <th key={header.id} className="px-6 py-4 text-left">
                          <span className="enterprise-label !mb-0 text-gray-900">
                            {flexRender(header.column.columnDef.header, header.getContext())}
                          </span>
                        </th>
                      ))}
                    </tr>
                  ))}
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {table.getRowModel().rows.length > 0 ? (
                    table.getRowModel().rows.map((row) => (
                      <tr key={row.id} className="hover:bg-brand-secondary/5 transition-all">
                        {row.getVisibleCells().map((cell) => (
                          <td key={cell.id} className="px-6 py-3">
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                          </td>
                        ))}
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="p-20 text-center enterprise-label opacity-40">
                        Sin facturación detectada para este paciente
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <TablePagination
              table={table}
              total={dteInvoices.length}
              pageSize={pageSize}
              setPageSize={setPageSize}
              pagesizeOptions={[5, 10]}
            />
          </div>
        </div>
      )}

      {/* MODAL DE CARGA DE ARCHIVOS */}
      <UploadModal 
        isOpen={isUploadModalOpen} 
        onClose={() => setIsContextModalOpen(false)} 
        patient={patient}
        treatments={treatments}
      />
    </div>
  );
}

function UploadModal({ isOpen, onClose, patient, treatments }) {
  const { data, setData, post, processing, errors, reset } = useForm({
    patient_id: patient.id,
    treatment_id: "",
    title: "",
    file: null,
  });

  const submit = (e) => {
    e.preventDefault();
    post(route("patient.documents.store"), {
      onSuccess: () => {
        reset();
        onClose();
      },
    });
  };

  return (
    <Modal open={isOpen} onClose={onClose} title="Cargar Documentación Clínica" maxWidth="lg">
      <form onSubmit={submit} className="p-8 space-y-6">
        <div className="space-y-1">
            <label className="enterprise-label ml-1">Nombre del Documento</label>
            <input 
                type="text"
                placeholder="Ej: Resonancia Rodilla Izquierda"
                className="w-full px-5 py-4 border-gray-100 rounded-2xl bg-gray-50 focus:bg-white focus:ring-brand-primary font-bold text-sm"
                value={data.title}
                onChange={e => setData('title', e.target.value)}
                required
            />
            {errors.title && <p className="text-red-500 text-[10px] font-black uppercase mt-1">{errors.title}</p>}
        </div>

        <div className="space-y-1">
            <label className="enterprise-label ml-1">Vincular a Tratamiento</label>
            <select
                className="w-full px-5 py-4 border-gray-100 rounded-2xl bg-gray-50 focus:bg-white focus:ring-brand-primary font-bold text-sm cursor-pointer"
                value={data.treatment_id}
                onChange={e => setData('treatment_id', e.target.value)}
            >
                <option value="">-- Documento General (Sin Tratamiento) --</option>
                {treatments.map(t => (
                    <option key={t.id} value={t.id}>
                        {t.diagnostic?.description || t.name} ({fmtDate(t.start_date)})
                    </option>
                ))}
            </select>
        </div>

        <div className="space-y-1">
            <label className="enterprise-label ml-1">Archivo Digital</label>
            <div className={`relative border-2 border-dashed rounded-[2rem] p-10 transition-all flex flex-col items-center justify-center gap-4 ${
                data.file ? 'border-brand-primary bg-brand-primary/5' : 'border-gray-100 bg-gray-50/50 hover:bg-white hover:border-brand-primary/30'
            }`}>
                <input 
                    type="file" 
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    onChange={e => setData('file', e.target.files[0])}
                    required
                />
                <UploadCloud className={`w-12 h-12 ${data.file ? 'text-brand-primary' : 'text-gray-300'}`} />
                <div className="text-center">
                    <p className="text-xs font-black text-gray-900 uppercase tracking-tight">
                        {data.file ? data.file.name : 'Click para subir archivo'}
                    </p>
                    <p className="text-[9px] font-bold text-brand-gray uppercase tracking-widest mt-1 opacity-60">PDF, Imágenes o Informes (Max 10MB)</p>
                </div>
            </div>
            {errors.file && <p className="text-red-500 text-[10px] font-black uppercase mt-1">{errors.file}</p>}
        </div>

        <div className="pt-6 flex justify-end gap-4">
            <SecondaryButton onClick={onClose} type="button" className="!px-8 !py-4">Cancelar</SecondaryButton>
            <PrimaryButton disabled={processing} className="!px-10 !py-4 shadow-xl shadow-brand-primary/20">
                {processing ? 'Cargando...' : 'Guardar en Expediente'}
            </PrimaryButton>
        </div>
      </form>
    </Modal>
  );
}