import React, { useMemo, useState } from "react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, usePage, Link, useForm } from "@inertiajs/react";
import TablePagination from "@/Components/TablePagination";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  getFilteredRowModel,
  flexRender,
} from "@tanstack/react-table";
import {
  FileText,
  ShieldCheck,
  Building,
  Calendar,
  Clock,
  AlertCircle,
  CheckCircle2,
  Activity,
  History,
  ArrowRightLeft,
  Key,
  ArrowLeft,
  Save,
  Image as ImageIcon,
  ChevronUp,
  ChevronDown,
  Settings,
  UploadCloud,
  Edit3,
  Layers,
  Settings2,
  MapPin,
  Plus,
  Trash2,
  Pencil
} from "lucide-react";

import Modal from "@/Components/Modal";
import DteConfigurationForm from "./Components/DteConfigurationForm";
import CafUploader from "./Components/CafUploader";
import ChilePhoneInput from "@/Components/ChilePhoneInput";
import { router } from "@inertiajs/react";
import Swal from "sweetalert2";

export default function Edit({ company, dteConfig, folios, logo, branches = [], regions = [] }) {
  // --- ESTADOS DE MODALES ---
  const [isCorpModalOpen, setIsCorpModalOpen] = useState(false);
  const [isDteModalOpen, setIsDteModalOpen] = useState(false);
  const [isBranchModalOpen, setIsBranchModalOpen] = useState(false);
  
  const [editingBranch, setEditingBranch] = useState(null);

  // --- FORMULARIO SUCURSALES ---
  const {
      data: branchData,
      setData: setBranchData,
      post: storeBranch,
      put: updateBranch,
      processing: branchProcessing,
      reset: resetBranch,
      errors: branchErrors,
      clearErrors: clearBranchErrors,
  } = useForm({
      name: "",
      codigo_sucursal_sii: "",
      email: "",
      phone: "",
      street: "",
      number: "",
      region_id: "",
      commune_id: "",
      is_main: false,
  });

  const openNewBranchModal = () => {
      setEditingBranch(null);
      setBranchData({
          name: "",
          codigo_sucursal_sii: "",
          email: "",
          phone: "",
          street: "",
          number: "",
          region_id: "",
          commune_id: "",
          is_main: false,
      });
      clearBranchErrors();
      setIsBranchModalOpen(true);
  };

  const openEditBranchModal = (branch) => {
      setEditingBranch(branch);
      clearBranchErrors();
      
      // Extraer dirección principal si existe
      const address = branch.addresses && branch.addresses.length > 0 
        ? branch.addresses.find(a => a.is_primary) || branch.addresses[0] 
        : null;

      setBranchData({
          name: branch.name,
          codigo_sucursal_sii: branch.codigo_sucursal_sii,
          email: branch.email || "",
          phone: branch.phone || "",
          street: address?.street || "",
          number: address?.number || "",
          region_id: address?.region_id || "",
          commune_id: address?.commune_id || "",
          is_main: Boolean(branch.is_main),
      });
      setIsBranchModalOpen(true);
  };

  const submitBranch = (e) => {
      e.preventDefault();
      
      if (editingBranch) {
          updateBranch(route('companies.branches.update', [company.id, editingBranch.id]), {
              onSuccess: () => {
                  setIsBranchModalOpen(false);
                  resetBranch();
                  setEditingBranch(null);
              }
          });
      } else {
          storeBranch(route('companies.branches.store', company.id), {
              onSuccess: () => {
                  setIsBranchModalOpen(false);
                  resetBranch();
              }
          });
      }
  };

  // Filtrar comunas según región seleccionada
  const availableCommunes = useMemo(() => {
      if (!branchData.region_id) return [];
      const region = regions.find(r => r.id == branchData.region_id);
      return region ? region.communes : [];
  }, [branchData.region_id, regions]);

  const deleteBranch = (branchId) => {
      Swal.fire({
          title: '¿Eliminar Sucursal?',
          text: "Esta acción no se puede deshacer y podría afectar registros históricos asociados.",
          icon: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#d33',
          cancelButtonColor: '#3085d6',
          confirmButtonText: 'Sí, eliminar',
          cancelButtonText: 'Cancelar'
      }).then((result) => {
          if (result.isConfirmed) {
              router.delete(route('companies.branches.destroy', [company.id, branchId]), {
                  onSuccess: () => {
                      Swal.fire(
                          '¡Eliminada!',
                          'La sucursal ha sido removida correctamente.',
                          'success'
                      );
                  }
              });
          }
      });
  };

  // --- FORMULARIO DATOS CORPORATIVOS ---
  const {
    data: companyData,
    setData: setCompanyData,
    post: updateCompany,
    processing: companyProcessing,
    errors: companyErrors,
  } = useForm({
    _method: "PATCH",
    rut: company.rut,
    business_name: company.business_name,
    giro: company.giro || "",
    email: company.email || "",
    phone: company.phone || "",
    logo: null,
  });

  const [logoPreview, setLogoPreview] = useState(logo?.url || null);

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCompanyData("logo", file);
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  const submitCompany = (e) => {
    e.preventDefault();
    updateCompany(route("companies.update", company.id), {
      onSuccess: () => setIsCorpModalOpen(false),
    });
  };

  // --- LÓGICA TANSTACK PARA CAF ---
  const [sorting, setSorting] = useState([]);
  const [pageSize, setPageSize] = useState(10);
  const [pageIndex, setPageIndex] = useState(0);

  const cafColumns = useMemo(
    () => [
      {
        id: "dte",
        header: "Documento",
        cell: ({ row }) => {
          const f = row.original;
          return (
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gray-50 rounded-xl text-brand-primary">
                <FileText className="w-4 h-4" />
              </div>
              <div>
                <div className="text-[10px] font-black text-gray-900 uppercase tracking-tight">
                  {f.tipo_dte === 39
                    ? "Boleta Electrónica"
                    : f.tipo_dte === 33
                    ? "Factura Electrónica"
                    : f.tipo_dte === 41
                    ? "Boleta Exenta"
                    : f.tipo_dte}
                </div>
                <p className="text-[8px] font-bold text-gray-400 uppercase">
                  SII Tipo {f.tipo_dte}
                </p>
              </div>
            </div>
          );
        },
      },
      {
        id: "rango",
        header: "Rango",
        cell: ({ row }) => (
          <span className="font-mono text-[10px] font-black text-gray-600 bg-gray-50 px-2 py-1 rounded-lg">
            {row.original.folio_desde} - {row.original.folio_hasta}
          </span>
        ),
      },
      {
        id: "progreso",
        header: "Uso",
        cell: ({ row }) => {
          const f = row.original;
          const total = f.folio_hasta - f.folio_desde + 1;
          const used = Math.max(0, f.ultimo_folio_usado - f.folio_desde + 1);
          const percentage = Math.min(100, (used / total) * 100);
          return (
            <div className="flex items-center gap-3 min-w-[120px]">
              <div className="flex-1 h-1 overflow-hidden bg-gray-100 rounded-full">
                <div
                  className="h-full bg-brand-primary"
                  style={{ width: `${percentage}%` }}
                ></div>
              </div>
              <span className="text-[9px] font-black text-gray-500 font-mono">
                {used}/{total}
              </span>
            </div>
          );
        },
      },
      {
        id: "estado",
        header: "Estatus",
        cell: ({ row }) => {
          const isExhausted =
            row.original.ultimo_folio_usado >= row.original.folio_hasta;
          return (
            <span
              className={`px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-widest ${
                isExhausted
                  ? "bg-red-50 text-red-600"
                  : "bg-green-50 text-green-600"
              }`}
            >
              {isExhausted ? "Agotado" : "Activo"}
            </span>
          );
        },
      },
    ],
    []
  );

  const cafTable = useReactTable({
    data: folios,
    columns: cafColumns,
    state: { sorting, pagination: { pageSize, pageIndex } },
    onSortingChange: setSorting,
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

  const certStats = useMemo(() => {
    if (!dteConfig?.fecha_caducidad) return null;
    const expiry = new Date(dteConfig.fecha_caducidad);
    const today = new Date();
    const diffDays = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));
    return {
      daysLeft: diffDays,
      isExpired: diffDays <= 0,
      isWarning: diffDays > 0 && diffDays <= 30,
      formattedDate: expiry.toLocaleDateString("es-CL", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }),
    };
  }, [dteConfig]);

  return (
    <AuthenticatedLayout>
      <Head title={`Empresa: ${company.business_name}`} />

      <div className="min-h-screen p-6 space-y-10 md:p-10 bg-gray-50/50">
        {/* HEADER HERO COMPACTO */}
        <div className="relative p-8 overflow-hidden bg-white border border-gray-100 shadow-sm rounded-enterprise">
          <div className="absolute top-0 right-0 w-64 h-64 -mt-32 -mr-32 rounded-full opacity-50 bg-brand-primary/5 blur-3xl"></div>
          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center gap-5">
              <div className="flex items-center justify-center text-white transform shadow-xl w-14 h-14 bg-brand-primary rounded-2xl shadow-brand-primary/20 rotate-3">
                <Building className="w-7 h-7" />
              </div>
              <div>
                <h1 className="mb-1 text-2xl font-black leading-none tracking-tight text-gray-900 uppercase">
                  {company.business_name}
                </h1>
                <p className="text-[10px] font-black text-brand-gray uppercase tracking-[0.2em]">
                  Configuración Corporativa & SII
                </p>
              </div>
            </div>
            <Link
              href={route("companies.index")}
              className="flex items-center gap-2 px-4 py-2 bg-gray-50 text-[10px] font-black uppercase tracking-widest text-brand-gray hover:text-brand-primary rounded-xl transition-all border border-gray-100"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Volver
            </Link>
          </div>
        </div>

        {/* DASHBOARD DE ESTADO SUAVE */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {/* Certificado */}
          <div
            className={`p-6 bg-white border border-gray-100 shadow-sm rounded-[2rem] relative overflow-hidden ${
              certStats?.isWarning
                ? "border-b-4 border-b-amber-400"
                : certStats?.isExpired
                ? "border-b-4 border-b-red-500"
                : "border-b-4 border-b-green-500"
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <div
                className={`p-2.5 rounded-xl ${
                  certStats?.isExpired
                    ? "bg-red-50 text-red-600"
                    : "bg-green-50 text-green-600"
                }`}
              >
                <Key className="w-5 h-5" />
              </div>
              <span className="text-[9px] font-black uppercase tracking-widest opacity-40">
                {dteConfig ? "Certificado" : "No detectado"}
              </span>
            </div>
            <p className="enterprise-label !text-[8px] opacity-60 mb-1">
              Caducidad de Firma
            </p>
            <p className="text-xl font-black tracking-tight text-gray-900">
              {certStats
                ? `${certStats.daysLeft} días restantes`
                : "Pendiente carga"}
            </p>
          </div>

          {/* Ambiente */}
          <div className="p-6 bg-white border border-gray-100 shadow-sm rounded-[2rem] border-b-4 border-b-brand-primary">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2.5 bg-brand-secondary/10 text-brand-primary rounded-xl">
                <Activity className="w-5 h-5" />
              </div>
              <span
                className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest ${
                  dteConfig?.ambiente === "produccion"
                    ? "bg-green-100 text-green-700"
                    : "bg-blue-100 text-blue-700"
                }`}
              >
                {dteConfig?.ambiente || "Manual"}
              </span>
            </div>
            <p className="enterprise-label !text-[8px] opacity-60 mb-1">
              Entorno de Emisión
            </p>
            <p className="text-xl font-black tracking-tight text-gray-900 uppercase">
              {dteConfig?.ambiente === "produccion"
                ? "Producción SII"
                : "Certificación"}
            </p>
          </div>

          {/* Monitor CAF (Substituído bg-gray-900 por algo suave) */}
          <div className="p-6 bg-white border border-gray-100 shadow-sm rounded-[2rem] border-b-4 border-b-brand-secondary">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2.5 bg-brand-secondary/10 text-brand-primary rounded-xl">
                <Layers className="w-5 h-5" />
              </div>
              <span className="text-[9px] font-black uppercase tracking-widest opacity-40">
                Folios CAF
              </span>
            </div>
            <p className="enterprise-label !text-[8px] opacity-60 mb-1">
              Capacidad Operativa
            </p>
            <p className="text-xl font-black tracking-tight text-gray-900">
              {
                folios.filter((f) => f.ultimo_folio_usado < f.folio_hasta)
                  .length
              }{" "}
              Tipos Activos
            </p>
          </div>
        </div>

        {/* ACCIONES RÁPIDAS (NUEVO) */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <button
            onClick={() => setIsCorpModalOpen(true)}
            className="p-8 bg-white border border-gray-100 rounded-[2.5rem] shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all group text-left relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-24 h-24 -mt-12 -mr-12 transition-colors rounded-full bg-gray-50 group-hover:bg-brand-secondary/10"></div>
            <div className="relative z-10 flex items-center gap-5">
              <div className="p-4 text-gray-400 transition-all bg-gray-50 group-hover:bg-brand-primary group-hover:text-white rounded-2xl">
                <Edit3 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-black tracking-tight text-gray-900 uppercase">
                  Datos Corporativos
                </h3>
                <p className="mt-1 text-xs font-bold tracking-widest text-gray-400 uppercase">
                  Razón social, RUT, Giro y Logo
                </p>
              </div>
            </div>
          </button>

          <button
            onClick={() => setIsDteModalOpen(true)}
            className="p-8 bg-white border border-gray-100 rounded-[2.5rem] shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all group text-left relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-24 h-24 -mt-12 -mr-12 transition-colors rounded-full bg-gray-50 group-hover:bg-brand-secondary/10"></div>
            <div className="relative z-10 flex items-center gap-5">
              <div className="p-4 text-gray-400 transition-all bg-gray-50 group-hover:bg-brand-primary group-hover:text-white rounded-2xl">
                <Settings2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-black tracking-tight text-gray-900 uppercase">
                  Motor de Emisión
                </h3>
                <p className="mt-1 text-xs font-bold tracking-widest text-gray-400 uppercase">
                  Simulación, Certificado y SII
                </p>
              </div>
            </div>
          </button>
        </div>

        {/* SUCURSALES (NUEVO) */}
        <div className="p-10 bg-white border border-gray-100 shadow-xl rounded-[3rem]">
            <header className="flex items-center justify-between mb-10">
                <div className="flex items-center gap-4">
                    <div className="p-3 text-blue-600 shadow-sm bg-blue-50 rounded-2xl">
                        <MapPin className="w-6 h-6" />
                    </div>
                    <div>
                        <h2 className="mb-1 text-xl font-black leading-none tracking-tight text-gray-900 uppercase">
                            Red de Sucursales
                        </h2>
                        <p className="text-[10px] font-black text-brand-gray uppercase tracking-widest opacity-60">
                            Gestión de sedes y puntos de emisión
                        </p>
                    </div>
                </div>
                <button
                    onClick={openNewBranchModal}
                    className="flex items-center gap-2 px-6 py-3 font-black text-[10px] text-white uppercase tracking-widest bg-gray-900 rounded-2xl shadow-lg hover:bg-black transition-all active:scale-95"
                >
                    <Plus className="w-4 h-4" /> Nueva Sucursal
                </button>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {branches.map((branch) => (
                    <div key={branch.id} className="p-6 border border-gray-100 bg-gray-50/30 rounded-[2rem] relative group hover:bg-white hover:shadow-lg transition-all duration-300">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-3 bg-white rounded-xl shadow-sm border border-gray-50 text-brand-primary">
                                <Building className="w-5 h-5" />
                            </div>
                            <div className="flex gap-2">
                                <button 
                                    onClick={() => openEditBranchModal(branch)}
                                    className="p-2 text-gray-300 hover:text-brand-primary hover:bg-brand-primary/5 rounded-xl transition-all"
                                    title="Editar Sucursal"
                                >
                                    <Pencil className="w-4 h-4" />
                                </button>
                                {branch.is_main ? (
                                    <span className="px-3 py-1 bg-brand-primary/10 text-brand-primary text-[9px] font-black uppercase tracking-widest rounded-lg border border-brand-primary/20 flex items-center">
                                        Casa Matriz
                                    </span>
                                ) : (
                                    <button 
                                        onClick={() => deleteBranch(branch.id)}
                                        className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                                        title="Eliminar Sucursal"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                )}
                            </div>
                        </div>
                        <h3 className="text-sm font-black text-gray-900 uppercase tracking-tight mb-1">{branch.name}</h3>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-4">Código SII: {branch.codigo_sucursal_sii}</p>
                        
                        <div className="space-y-2 border-t border-gray-100 pt-4">
                            {branch.email && (
                                <div className="flex items-center gap-2 text-[10px] text-gray-500 font-medium">
                                    <span className="w-1.5 h-1.5 bg-gray-300 rounded-full"></span>
                                    {branch.email}
                                </div>
                            )}
                            {branch.phone && (
                                <div className="flex items-center gap-2 text-[10px] text-gray-500 font-medium">
                                    <span className="w-1.5 h-1.5 bg-gray-300 rounded-full"></span>
                                    {branch.phone}
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>

        {/* HISTORIAL CAF (REFINADO Y MÁS COMPACTO) */}
        <div className="p-10 bg-white border border-gray-100 shadow-xl rounded-[3rem]">
          <header className="flex items-center justify-between mb-10">
            <div className="flex items-center gap-4">
              <div className="p-3 text-green-600 shadow-sm bg-green-50 rounded-2xl">
                <History className="w-6 h-6" />
              </div>
              <div>
                <h2 className="mb-1 text-xl font-black leading-none tracking-tight text-gray-900 uppercase">
                  Registro de Folios
                </h2>
                <p className="text-[10px] font-black text-brand-gray uppercase tracking-widest opacity-60">
                  Historial acumulado de autorizaciones CAF
                </p>
              </div>
            </div>
            <CafUploader company={company} />
          </header>

          <div className="bg-gray-50/30 border border-gray-100 rounded-[2rem] overflow-hidden shadow-inner">
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full border-collapse">
                <thead>
                  {cafTable.getHeaderGroups().map((headerGroup) => (
                    <tr
                      key={headerGroup.id}
                      className="border-b border-gray-100 bg-gray-100/50"
                    >
                      {headerGroup.headers.map((header) => (
                        <th
                          key={header.id}
                          className="px-8 py-5 text-left cursor-pointer select-none group"
                          onClick={header.column.getToggleSortingHandler()}
                        >
                          <div className="flex items-center gap-2">
                            <span className="enterprise-label !mb-0 text-gray-900 group-hover:text-brand-primary transition-colors">
                              {flexRender(
                                header.column.columnDef.header,
                                header.getContext()
                              )}
                            </span>
                            {header.column.getIsSorted() &&
                              (header.column.getIsSorted() === "asc" ? (
                                <ChevronUp className="w-3 h-3 text-brand-primary" />
                              ) : (
                                <ChevronDown className="w-3 h-3 text-brand-primary" />
                              ))}
                          </div>
                        </th>
                      ))}
                    </tr>
                  ))}
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {cafTable.getRowModel().rows.length > 0 ? (
                    cafTable.getRowModel().rows.map((row) => (
                      <tr
                        key={row.id}
                        className="transition-all bg-white hover:bg-brand-secondary/5"
                      >
                        {row.getVisibleCells().map((cell) => (
                          <td
                            key={cell.id}
                            className="px-8 py-4 whitespace-nowrap"
                          >
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext()
                            )}
                          </td>
                        ))}
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan="4"
                        className="p-20 italic text-center enterprise-label opacity-40"
                      >
                        No hay registros de folios disponibles
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="border-t border-gray-100 bg-gray-50/50">
              <TablePagination
                table={cafTable}
                total={folios.length}
                pageSize={pageSize}
                setPageSize={setPageSize}
                pageSizeOptions={[5, 10, 20]}
              />
            </div>
          </div>
        </div>

        {/* MODAL: NUEVA/EDITAR SUCURSAL */}
        <Modal
            open={isBranchModalOpen}
            onClose={() => setIsBranchModalOpen(false)}
            title={editingBranch ? "Editar Sucursal" : "Registrar Nueva Sucursal"}
            maxWidth="2xl"
        >
            <form onSubmit={submitBranch} className="p-8 space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-1">
                        <label className="ml-1 enterprise-label">Nombre Sucursal / Fantasía</label>
                        <input
                            type="text"
                            value={branchData.name}
                            onChange={(e) => setBranchData("name", e.target.value)}
                            className="w-full px-5 py-4 text-sm font-bold transition-all border-gray-100 rounded-2xl bg-gray-50 focus:bg-white focus:ring-brand-primary"
                            placeholder="Ej: Sucursal Centro"
                            required
                        />
                        {branchErrors.name && <p className="text-red-500 text-[10px] font-black uppercase mt-1 ml-1">{branchErrors.name}</p>}
                    </div>

                    <div className="space-y-1">
                        <label className="ml-1 enterprise-label">Código Sucursal SII</label>
                        <input
                            type="text"
                            value={branchData.codigo_sucursal_sii}
                            onChange={(e) => setBranchData("codigo_sucursal_sii", e.target.value)}
                            className="w-full px-5 py-4 text-sm font-bold transition-all border-gray-100 rounded-2xl bg-gray-50 focus:bg-white focus:ring-brand-primary"
                            placeholder="0 para Casa Matriz"
                            required
                        />
                        {branchErrors.codigo_sucursal_sii && <p className="text-red-500 text-[10px] font-black uppercase mt-1 ml-1">{branchErrors.codigo_sucursal_sii}</p>}
                    </div>
                </div>

                {editingBranch && !branchData.is_main && (
                    <div className="p-4 bg-yellow-50 border border-yellow-100 rounded-2xl flex items-center gap-3">
                        <input
                            type="checkbox"
                            checked={branchData.is_main}
                            onChange={(e) => setBranchData("is_main", e.target.checked)}
                            className="w-5 h-5 text-brand-primary border-gray-300 rounded focus:ring-brand-primary cursor-pointer"
                            id="is_main_check"
                        />
                        <label htmlFor="is_main_check" className="text-xs font-bold text-yellow-700 cursor-pointer select-none">
                            Establecer como Casa Matriz Principal
                        </label>
                    </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-1">
                        <label className="ml-1 enterprise-label">Email Contacto</label>
                        <input
                            type="email"
                            value={branchData.email}
                            onChange={(e) => setBranchData("email", e.target.value)}
                            className="w-full px-5 py-4 text-sm font-bold transition-all border-gray-100 rounded-2xl bg-gray-50 focus:bg-white focus:ring-brand-primary"
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="ml-1 enterprise-label">Teléfono</label>
                        <ChilePhoneInput
                            value={branchData.phone}
                            onChange={(val) => setBranchData("phone", val)}
                            error={branchErrors.phone}
                        />
                    </div>
                </div>
                
                <div className="pt-4 border-t border-gray-100">
                    <h4 className="text-xs font-black uppercase tracking-widest text-gray-900 mb-4">Dirección Física</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-4">
                        <div className="space-y-1">
                            <label className="ml-1 enterprise-label">Región</label>
                            <select
                                value={branchData.region_id}
                                onChange={(e) => setBranchData("region_id", e.target.value)}
                                className="w-full px-5 py-4 text-sm font-bold transition-all border-gray-100 rounded-2xl bg-gray-50 focus:bg-white focus:ring-brand-primary"
                            >
                                <option value="">-- Seleccionar --</option>
                                {regions.map(r => (
                                    <option key={r.id} value={r.id}>{r.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="space-y-1">
                            <label className="ml-1 enterprise-label">Comuna</label>
                            <select
                                value={branchData.commune_id}
                                onChange={(e) => setBranchData("commune_id", e.target.value)}
                                className="w-full px-5 py-4 text-sm font-bold transition-all border-gray-100 rounded-2xl bg-gray-50 focus:bg-white focus:ring-brand-primary"
                                disabled={!branchData.region_id}
                            >
                                <option value="">-- Seleccionar --</option>
                                {availableCommunes.map(c => (
                                    <option key={c.id} value={c.id}>{c.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <div className="grid grid-cols-[1fr_100px] gap-6">
                        <div className="space-y-1">
                            <label className="ml-1 enterprise-label">Calle / Avenida</label>
                            <input
                                type="text"
                                value={branchData.street}
                                onChange={(e) => setBranchData("street", e.target.value)}
                                className="w-full px-5 py-4 text-sm font-bold transition-all border-gray-100 rounded-2xl bg-gray-50 focus:bg-white focus:ring-brand-primary"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="ml-1 enterprise-label">Número</label>
                            <input
                                type="text"
                                value={branchData.number}
                                onChange={(e) => setBranchData("number", e.target.value)}
                                className="w-full px-5 py-4 text-sm font-bold transition-all border-gray-100 rounded-2xl bg-gray-50 focus:bg-white focus:ring-brand-primary"
                            />
                        </div>
                    </div>
                </div>

                <div className="flex justify-end gap-4 pt-6 border-t border-gray-100">
                    <button
                        type="button"
                        onClick={() => setIsBranchModalOpen(false)}
                        className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-brand-gray hover:bg-gray-50 rounded-2xl transition-all"
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        disabled={branchProcessing}
                        className="px-12 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-white bg-brand-primary rounded-2xl shadow-xl shadow-brand-primary/20 hover:brightness-110 transition-all active:scale-95 disabled:opacity-50"
                    >
                        {branchProcessing ? "Guardando..." : (editingBranch ? "Actualizar Sucursal" : "Crear Sucursal")}
                    </button>
                </div>
            </form>
        </Modal>

        {/* MODAL: DATOS CORPORATIVOS */}
        <Modal
          open={isCorpModalOpen}
          onClose={() => setIsCorpModalOpen(false)}
          title="Actualizar Perfil Corporativo"
          maxWidth="2xl"
        >
          <form onSubmit={submitCompany} className="p-10 space-y-8">
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
              <div className="space-y-1">
                <label className="ml-1 enterprise-label">RUT Fiscal</label>
                <input
                  type="text"
                  value={companyData.rut}
                  onChange={(e) => setCompanyData("rut", e.target.value)}
                  className="w-full px-5 py-4 text-sm font-bold transition-all border-gray-100 rounded-2xl bg-gray-50 focus:bg-white focus:ring-brand-primary"
                />
              </div>
              <div className="space-y-1">
                <label className="ml-1 enterprise-label">Razón Social</label>
                <input
                  type="text"
                  value={companyData.business_name}
                  onChange={(e) =>
                    setCompanyData("business_name", e.target.value)
                  }
                  className="w-full px-5 py-4 text-sm font-bold transition-all border-gray-100 rounded-2xl bg-gray-50 focus:bg-white focus:ring-brand-primary"
                />
              </div>
            </div>
            <div className="space-y-1">
              <label className="ml-1 enterprise-label">Giro Comercial</label>
              <input
                type="text"
                value={companyData.giro}
                onChange={(e) => setCompanyData("giro", e.target.value)}
                className="w-full px-5 py-4 text-sm font-bold transition-all border-gray-100 rounded-2xl bg-gray-50 focus:bg-white focus:ring-brand-primary"
              />
            </div>
            <div className="space-y-1">
              <label className="ml-1 enterprise-label">
                Logo Institucional
              </label>
              <div className="flex items-center gap-6 p-6 bg-gray-50 rounded-[2rem] border border-gray-100 shadow-inner">
                <div className="flex items-center justify-center w-24 h-24 overflow-hidden bg-white border border-gray-100 shadow-sm rounded-2xl shrink-0">
                  {logoPreview ? (
                    <img
                      src={logoPreview}
                      className="object-cover w-full h-full"
                    />
                  ) : (
                    <ImageIcon className="w-10 h-10 text-gray-200" />
                  )}
                </div>
                <div className="flex-1">
                  <input
                    type="file"
                    onChange={handleLogoChange}
                    className="text-[10px] font-black uppercase text-brand-gray file:mr-4 file:py-2.5 file:px-6 file:rounded-xl file:border-0 file:text-[10px] file:font-black file:bg-brand-primary file:text-white cursor-pointer hover:file:brightness-110 transition-all"
                  />
                  <p className="mt-3 text-[9px] font-bold text-gray-400 uppercase tracking-widest italic">
                    Formatos: PNG, JPG, SVG (Max 2MB)
                  </p>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-4 pt-6 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setIsCorpModalOpen(false)}
                className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-brand-gray hover:bg-gray-50 rounded-2xl transition-all"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={companyProcessing}
                className="px-12 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-white bg-gray-900 rounded-2xl shadow-xl hover:bg-black transition-all active:scale-95 disabled:opacity-50"
              >
                {companyProcessing
                  ? "Procesando..."
                  : "Guardar Cambios Corporativos"}
              </button>
            </div>
          </form>
        </Modal>

        {/* MODAL: CONFIGURACIÓN DTE */}
        <Modal
          open={isDteModalOpen}
          onClose={() => setIsDteModalOpen(false)}
          title="Centro de Control SII / DTE"
          maxWidth="2xl"
        >
          <div className="p-10">
            <DteConfigurationForm company={company} dteConfig={dteConfig} />
          </div>
        </Modal>
      </div>
    </AuthenticatedLayout>
  );
}
