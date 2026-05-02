import React, { useMemo, useState } from "react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, usePage, Link, useForm, router } from "@inertiajs/react";
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
  Pencil,
  X
} from "lucide-react";
import axios from "axios";
import Modal from "@/components/Modal";
import ChilePhoneInput from "@/components/ChilePhoneInput";
import TextInput from "@/components/TextInput";
import InputError from "@/components/InputError";
import PrimaryButton from "@/components/PrimaryButton";
import SideModal from "@/components/SideModal";
import Swal from "sweetalert2";
import DteConfigurationForm from "./components/DteConfigurationForm";
import CafUploader from "./components/CafUploader";
import EnterpriseSelect from "@/components/EnterpriseSelect";

export default function Edit({ company, dteConfig, folios, logo, branches = [], regions = [] }) {
  // --- ESTADOS DE MODALES ---
  const [isCorpModalOpen, setIsCorpModalOpen] = useState(false);
  const [isDteModalOpen, setIsDteModalOpen] = useState(false);
  const [isBranchModalOpen, setIsBranchModalOpen] = useState(false);
  const [isRoomModalOpen, setIsRoomModalOpen] = useState(false);
  
  const [editingBranch, setEditingBranch] = useState(null);
  const [editingRoom, setEditingRoom] = useState(null);
  const [activeBranchForRooms, setActiveBranchForRooms] = useState(null);

  // --- FORMULARIO BOXES (ROOMS) ---
  const {
      data: roomData,
      setData: setRoomData,
      post: storeRoom,
      put: updateRoom,
      processing: roomProcessing,
      reset: resetRoom,
      errors: roomErrors,
      clearErrors: clearRoomErrors,
  } = useForm({
      name: "",
      capacity: 1,
      status: "active",
  });

  const openRoomModal = (branch) => {
      setActiveBranchForRooms(branch);
      setEditingRoom(null);
      resetRoom();
      clearRoomErrors();
      setIsRoomModalOpen(true);
  };

  const openEditRoomModal = (room) => {
      setEditingRoom(room);
      setRoomData({
          name: room.name,
          capacity: room.capacity || 1,
          status: room.status || "active",
      });
      clearRoomErrors();
  };

  const submitRoom = (e) => {
      e.preventDefault();
      
      if (editingRoom) {
          updateRoom(route('rooms.update', [editingRoom.id]), {
              onSuccess: () => {
                  setEditingRoom(null);
                  resetRoom();
                  Swal.fire({
                      title: "¡Éxito!",
                      text: "Box actualizado correctamente",
                      icon: "success",
                      toast: true,
                      position: 'top-end',
                      showConfirmButton: false,
                      timer: 3000
                  });
              }
          });
      } else {
          storeRoom(route('branches.rooms.store', [activeBranchForRooms.id]), {
              onSuccess: () => {
                  resetRoom();
                  Swal.fire({
                      title: "¡Éxito!",
                      text: "Box creado correctamente",
                      icon: "success",
                      toast: true,
                      position: 'top-end',
                      showConfirmButton: false,
                      timer: 3000
                  });
              }
          });
      }
  };

  const deleteRoom = (roomId) => {
      Swal.fire({
          title: '¿Eliminar Box?',
          text: "Esta acción no se puede deshacer.",
          icon: 'warning',
          showCancelButton: true,
          confirmButtonText: 'Sí, eliminar',
          confirmButtonColor: '#ef4444',
          cancelButtonText: 'Cancelar',
          borderRadius: '1.5rem'
      }).then((result) => {
          if (result.isConfirmed) {
              router.delete(route('rooms.destroy', [roomId]), {
                  onSuccess: () => {
                      Swal.fire("¡Eliminado!", "Box borrado", "success");
                  }
              });
          }
      });
  };

  // Ayudante para obtener la sucursal activa actualizada desde los props
  const currentBranchWithRooms = useMemo(() => {
      return branches.find(b => b.id === activeBranchForRooms?.id);
  }, [branches, activeBranchForRooms]);

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
      company_id: company?.id || null,
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
          company_id: company?.id || null,
      });
      clearBranchErrors();
      setIsBranchModalOpen(true);
  };

  const openEditBranchModal = (branch) => {
      setEditingBranch(branch);
      clearBranchErrors();
      
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
          company_id: company?.id || null,
      });
      setIsBranchModalOpen(true);
  };

  const submitBranch = (e) => {
      e.preventDefault();
      
      if (editingBranch) {
          updateBranch(route('branches.update', [editingBranch.id]), {
              onSuccess: () => {
                  setIsBranchModalOpen(false);
                  resetBranch();
                  setEditingBranch(null);
              }
          });
      } else {
          storeBranch(route('branches.store'), {
              onSuccess: () => {
                  setIsBranchModalOpen(false);
                  resetBranch();
              }
          });
      }
  };

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
              router.delete(route('branches.destroy', [branchId]), {
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
    business_type: company.business_type || "clinical",
    logo: null,
  });

  const [logoPreview, setLogoPreview] = useState(logo?.url || null);

  const handleRutBlur = async () => {
    if (!companyData.rut || companyData.rut.length < 8) return;
    try {
      const response = await axios.get(route("external-data.company", { rut: companyData.rut }));
      if (response.data.success) {
        const { razon_social, giro } = response.data.data;
        setCompanyData((prevData) => ({
          ...prevData,
          business_name: razon_social || prevData.business_name,
          giro: giro || prevData.giro,
        }));
      }
    } catch (error) {
      console.warn("No se pudo obtener la información de la empresa automáticamente.");
    }
  };

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

  // --- TABLA CAF ---
  const [sorting, setSorting] = useState([]);
  const [pageSize, setPageSize] = useState(10);
  const [pageIndex, setPageIndex] = useState(0);

  const cafColumns = useMemo(() => [
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
                  {f.tipo_dte === 39 ? "Boleta Electrónica" : f.tipo_dte === 33 ? "Factura Electrónica" : f.tipo_dte === 34 ? "Factura Exenta" : f.tipo_dte === 41 ? "Boleta Exenta" : f.tipo_dte === 61 ? "Nota de Crédito" : f.tipo_dte}
                </div>
                <p className="text-[8px] font-bold text-gray-400 uppercase">SII Tipo {f.tipo_dte}</p>
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
                <div className="h-full bg-brand-primary" style={{ width: `${percentage}%` }}></div>
              </div>
              <span className="text-[9px] font-black text-gray-500 font-mono">{used}/{total}</span>
            </div>
          );
        },
      },
      {
        id: "estado",
        header: "Estatus",
        cell: ({ row }) => {
          const isExhausted = row.original.ultimo_folio_usado >= row.original.folio_hasta;
          return (
            <span className={`px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-widest ${isExhausted ? "bg-red-50 text-red-600" : "bg-green-50 text-green-600"}`}>
              {isExhausted ? "Agotado" : "Activo"}
            </span>
          );
        },
      },
  ], []);

  const cafTable = useReactTable({
    data: folios,
    columns: cafColumns,
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

  const certStats = useMemo(() => {
    if (!dteConfig?.expiration_date) return null;
    const expiry = new Date(dteConfig.expiration_date);
    const today = new Date();
    const diffDays = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));
    return {
      daysLeft: diffDays,
      isExpired: diffDays <= 0,
      isWarning: diffDays > 0 && diffDays <= 30,
      formattedDate: expiry.toLocaleDateString("es-CL", { day: "2-digit", month: "short", year: "numeric" }),
    };
  }, [dteConfig]);

  return (
    <AuthenticatedLayout>
      <Head title={`Empresa: ${company.business_name}`} />

      <div className="min-h-screen p-3 space-y-5 md:p-5 bg-gray-50/50">
        {/* HEADER */}
        <div className="relative p-8 overflow-hidden bg-white border border-gray-100 shadow-sm rounded-xl">
          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center gap-5">
              <div className="flex items-center justify-center text-white transform shadow-xl w-14 h-14 bg-brand-primary rounded-2xl rotate-3">
                <Building className="w-7 h-7" />
              </div>
              <div>
                <h1 className="mb-1 text-2xl font-black leading-none tracking-tight text-gray-900 uppercase">{company.business_name}</h1>
                <p className="text-[10px] font-black text-brand-gray uppercase tracking-[0.2em]">Configuración Corporativa & SII</p>
              </div>
            </div>
            <Link href={route("companies.index")} className="flex items-center gap-2 px-4 py-2 bg-gray-50 text-[10px] font-black uppercase text-brand-gray hover:text-brand-primary rounded-xl transition-all border border-gray-100">
              <ArrowLeft className="w-3.5 h-3.5" /> Volver
            </Link>
          </div>
        </div>

        {/* DASHBOARD STATS */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {/* Firma SII */}
          <div className={`p-6 bg-white border border-gray-100 shadow-sm rounded-[2rem] border-b-4 ${certStats?.isExpired ? "border-b-red-500" : "border-b-green-500"}`}>
            <div className="flex items-center justify-between mb-4">
              <div className={`p-2.5 rounded-xl ${certStats?.isExpired ? "bg-red-50 text-red-600" : "bg-green-50 text-green-600"}`}><Key className="w-5 h-5" /></div>
              <span className="text-[9px] font-black uppercase tracking-widest opacity-40">Firma SII</span>
            </div>
            <div className="space-y-1">
              <p className="text-[8px] font-black opacity-60 mb-0 uppercase">{dteConfig?.signer_rut || 'Pendiente'}</p>
              <p className="text-xl font-black tracking-tight text-gray-900">{certStats ? `${certStats.daysLeft} días ${certStats.isExpired ? 'vencido' : 'vence'}` : "Sin Firma"}</p>
              {certStats && <p className="text-[9px] font-bold text-gray-400 uppercase">Expiración: {certStats.formattedDate}</p>}
            </div>
          </div>

          {/* Motor */}
          <div className="p-6 bg-white border border-gray-100 shadow-sm rounded-[2rem] border-b-4 border-b-brand-primary">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2.5 bg-brand-secondary/10 text-brand-primary rounded-xl"><Activity className="w-5 h-5" /></div>
              <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${dteConfig?.environment === "production" ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700"}`}>{dteConfig?.environment || "No Config"}</span>
            </div>
            <p className="text-[8px] font-black opacity-60 mb-1 uppercase tracking-widest">Motor de Emisión</p>
            <p className="text-xl font-black text-gray-900 uppercase">{dteConfig?.environment === "production" ? "Producción" : "Certificación"}</p>
            <p className="text-[9px] font-bold text-gray-400 uppercase mt-1 italic">{dteConfig?.simulation_mode ? "⚠️ Modo Entrenamiento" : "✅ Operación Oficial"}</p>
          </div>

          {/* Folios */}
          <div className="p-6 bg-white border border-gray-100 shadow-sm rounded-[2rem] border-b-4 border-b-brand-secondary">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2.5 bg-brand-secondary/10 text-brand-primary rounded-xl"><Layers className="w-5 h-5" /></div>
              <span className="text-[9px] font-black uppercase tracking-widest opacity-40">Folios CAF</span>
            </div>
            <p className="text-[8px] font-black opacity-60 mb-1 uppercase">Capacidad Operativa</p>
            <p className="text-xl font-black text-gray-900">{folios.filter((f) => f.ultimo_folio_usado < f.folio_hasta).length} Tipos Activos</p>
          </div>
        </div>

        {/* ACCIONES */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <button onClick={() => setIsCorpModalOpen(true)} className="p-8 bg-white border border-gray-100 rounded-[2.5rem] shadow-lg hover:shadow-xl transition-all group text-left relative overflow-hidden">
            <div className="relative z-10 flex items-center gap-5">
              <div className="p-4 text-gray-400 bg-gray-50 group-hover:bg-brand-primary group-hover:text-white rounded-2xl transition-all"><Edit3 className="w-6 h-6" /></div>
              <div>
                <h3 className="text-lg font-black text-gray-900 uppercase">Datos Corporativos</h3>
                <p className="mt-1 text-xs font-bold text-gray-400 uppercase">Razón social, RUT, Giro y Logo</p>
              </div>
            </div>
          </button>
          <button onClick={() => setIsDteModalOpen(true)} className="p-8 bg-white border border-gray-100 rounded-[2.5rem] shadow-lg hover:shadow-xl transition-all group text-left relative overflow-hidden">
            <div className="relative z-10 flex items-center gap-5">
              <div className="p-4 text-gray-400 bg-gray-50 group-hover:bg-brand-primary group-hover:text-white rounded-2xl transition-all"><Settings2 className="w-6 h-6" /></div>
              <div>
                <h3 className="text-lg font-black text-gray-900 uppercase">Motor de Emisión</h3>
                <p className="mt-1 text-xs font-bold text-gray-400 uppercase">Simulación, Certificado y SII</p>
              </div>
            </div>
          </button>
        </div>

        {/* SUCURSALES */}
        <div className="p-10 bg-white border border-gray-100 shadow-xl rounded-[3rem]">
            <header className="flex items-center justify-between mb-10">
                <div className="flex items-center gap-4">
                    <div className="p-3 text-blue-600 bg-blue-50 rounded-2xl"><MapPin className="w-6 h-6" /></div>
                    <div>
                        <h2 className="text-xl font-black text-gray-900 uppercase">Red de Sucursales</h2>
                        <p className="text-[10px] font-black text-brand-gray uppercase tracking-widest opacity-60">Gestión de sedes</p>
                    </div>
                </div>
                <button onClick={openNewBranchModal} className="flex items-center gap-2 px-6 py-3 font-black text-[10px] text-white uppercase bg-gray-900 rounded-2xl shadow-lg hover:bg-black transition-all"><Plus className="w-4 h-4" /> Nueva Sucursal</button>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {branches.map((branch) => (
                    <div key={branch.id} className="p-6 border border-gray-100 bg-gray-50/30 rounded-[2rem] group hover:bg-white hover:shadow-lg transition-all">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-3 bg-white rounded-xl shadow-sm border border-gray-50 text-brand-primary"><Building className="w-5 h-5" /></div>
                            <div className="flex gap-1">
                                <button onClick={() => openRoomModal(branch)} className="p-2 text-gray-300 hover:text-brand-primary hover:bg-brand-primary/5 rounded-xl transition-all" title="Gestionar Boxes / Salas"><Layers className="w-4 h-4" /></button>
                                <button onClick={() => openEditBranchModal(branch)} className="p-2 text-gray-300 hover:text-brand-primary hover:bg-brand-primary/5 rounded-xl transition-all" title="Editar Sucursal"><Pencil className="w-4 h-4" /></button>
                                {branch.is_main ? <span className="px-3 py-1 bg-brand-primary/10 text-brand-primary text-[9px] font-black uppercase rounded-lg border border-brand-primary/20 ml-2">Matriz</span> : <button onClick={() => deleteBranch(branch.id)} className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"><Trash2 className="w-4 h-4" /></button>}
                            </div>
                        </div>
                        <h3 className="text-sm font-black text-gray-900 uppercase mb-1">{branch.name}</h3>
                        <p className="text-[10px] font-bold text-gray-400 uppercase mb-4">SII: {branch.codigo_sucursal_sii}</p>
                        <div className="space-y-2 border-t border-gray-100 pt-4">
                            {branch.email && <div className="text-[10px] text-gray-500 font-medium truncate">{branch.email}</div>}
                            {branch.phone && <div className="text-[10px] text-gray-500 font-medium">{branch.phone}</div>}
                        </div>
                    </div>
                ))}
            </div>
        </div>

        {/* MODALES */}
        <Modal open={isBranchModalOpen} onClose={() => setIsBranchModalOpen(false)} title={editingBranch ? "Editar Sucursal" : "Nueva Sucursal"} maxWidth="2xl">
            <form onSubmit={submitBranch} className="p-8 space-y-6">
                <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-1">
                        <label className="enterprise-label">Nombre</label>
                        <TextInput value={branchData.name} onChange={(e) => setBranchData("name", e.target.value)} required />
                        <InputError message={branchErrors.name} />
                    </div>
                    <div className="space-y-1">
                        <label className="enterprise-label">Código SII</label>
                        <TextInput value={branchData.codigo_sucursal_sii} onChange={(e) => setBranchData("codigo_sucursal_sii", e.target.value)} required />
                        <InputError message={branchErrors.codigo_sucursal_sii} />
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-1">
                        <label className="enterprise-label">Email</label>
                        <TextInput type="email" value={branchData.email} onChange={(e) => setBranchData("email", e.target.value)} />
                    </div>
                    <div className="space-y-1">
                        <label className="enterprise-label">Teléfono</label>
                        <ChilePhoneInput value={branchData.phone} onChange={(val) => setBranchData("phone", val)} />
                    </div>
                </div>
                <div className="flex justify-end gap-4 pt-6 border-t border-gray-100">
                    <PrimaryButton disabled={branchProcessing} type="submit">{branchProcessing ? "Guardando..." : "Confirmar"}</PrimaryButton>
                </div>
            </form>
        </Modal>

        <Modal open={isCorpModalOpen} onClose={() => setIsCorpModalOpen(false)} title="Datos Corporativos" maxWidth="2xl">
          <form onSubmit={submitCompany} className="p-10 space-y-8">
            <div className="grid grid-cols-2 gap-8">
              <div className="space-y-1"><label className="enterprise-label">RUT</label><TextInput value={companyData.rut} onChange={(e) => setCompanyData("rut", e.target.value)} onBlur={handleRutBlur} /></div>
              <div className="space-y-1"><label className="enterprise-label">Razón Social</label><TextInput value={companyData.business_name} onChange={(e) => setCompanyData("business_name", e.target.value)} /></div>
            </div>
            <div className="flex justify-end gap-4 pt-6 border-t border-gray-100"><PrimaryButton disabled={companyProcessing} type="submit">Guardar</PrimaryButton></div>
          </form>
        </Modal>

        <Modal open={isDteModalOpen} onClose={() => setIsDteModalOpen(false)} title="Motor DTE" maxWidth="2xl">
          <DteConfigurationForm company={company} dteConfig={dteConfig} onSuccess={() => setIsDteModalOpen(false)} />
        </Modal>

        <SideModal open={isRoomModalOpen} onClose={() => setIsRoomModalOpen(false)} title={`Boxes: ${currentBranchWithRooms?.name || 'Cargando...'}`} subtitle="Gestión de salas de atención" icon={Layers} width="xl">
            <div className="flex flex-col h-full -m-10">
                <div className="p-8 border-b border-gray-100 bg-gray-50/30">
                    <h3 className="text-[10px] font-black uppercase text-brand-primary mb-4">{editingRoom ? `Editando: ${editingRoom.name}` : 'Añadir Nuevo Box'}</h3>
                    <form onSubmit={submitRoom} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-[10px] font-black uppercase text-gray-400 ml-1">Nombre Box</label>
                                <TextInput value={roomData.name} onChange={e => setRoomData("name", e.target.value)} placeholder="Ej: Box 1" required className="w-full" />
                                <InputError message={roomErrors.name} />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-black uppercase text-gray-400 ml-1">Capacidad Simultánea</label>
                                <TextInput type="number" min="1" value={roomData.capacity} onChange={e => setRoomData("capacity", e.target.value)} required className="w-full" />
                                <InputError message={roomErrors.capacity} />
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                            <div className="col-span-2">
                                <EnterpriseSelect
                                    label="Estado Operativo"
                                    value={roomData.status}
                                    onChange={val => setRoomData("status", val)}
                                    options={[
                                        { label: "Activo / Disponible", value: "active" },
                                        { label: "Inactivo / Cerrado", value: "inactive" },
                                        { label: "Mantenimiento", value: "maintenance" },
                                    ]}
                                />
                                <InputError message={roomErrors.status} />
                            </div>
                            <div className="flex items-end">
                                <PrimaryButton disabled={roomProcessing} type="submit" className="w-full h-[52px] justify-center text-[10px] uppercase font-black tracking-widest shadow-lg shadow-brand-primary/20">
                                    {roomProcessing ? '...' : (editingRoom ? 'Actualizar' : 'Añadir')}
                                </PrimaryButton>
                            </div>
                        </div>

                        {editingRoom && (
                            <div className="flex justify-center">
                                <button type="button" onClick={() => { setEditingRoom(null); resetRoom(); }} className="text-[9px] font-black uppercase text-brand-gray hover:text-red-500 transition-all py-2">✕ Cancelar Edición</button>
                            </div>
                        )}
                    </form>
                </div>
                
                <div className="flex-1 overflow-y-auto p-8 space-y-6">
                    <div className="flex items-center justify-between">
                        <h3 className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Salas Configuradas</h3>
                        <span className="px-2 py-0.5 bg-gray-100 text-[9px] font-black text-gray-500 rounded-lg">{(currentBranchWithRooms?.rooms || []).length} TOTAL</span>
                    </div>

                    {(currentBranchWithRooms?.rooms || []).length === 0 ? (
                        <div className="text-center py-16 bg-gray-50/50 rounded-[2rem] border-2 border-dashed border-gray-100 flex flex-col items-center gap-3">
                            <Layers className="w-8 h-8 text-gray-200" />
                            <p className="text-[10px] font-black uppercase text-gray-300 tracking-tighter">No hay boxes registrados en esta sucursal</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-3">
                            {currentBranchWithRooms.rooms.map(room => (
                                <div key={room.id} className="group flex items-center justify-between p-5 bg-white border border-gray-100 rounded-[1.8rem] hover:shadow-xl hover:shadow-gray-100/50 hover:border-brand-primary/20 transition-all duration-300">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${
                                            room.status === 'active' ? 'bg-green-50 text-green-600' : 
                                            room.status === 'maintenance' ? 'bg-amber-50 text-amber-600' : 
                                            'bg-gray-50 text-gray-400'
                                        }`}>
                                            <Layers className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <p className="text-xs font-black uppercase text-gray-900 tracking-tight">{room.name}</p>
                                                <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-lg border ${
                                                    room.status === 'active' ? 'bg-green-50 text-green-600 border-green-100' : 
                                                    room.status === 'maintenance' ? 'bg-amber-50 text-amber-600 border-amber-100' : 
                                                    'bg-gray-50 text-gray-400 border-gray-100'
                                                }`}>
                                                    {room.status === 'active' ? 'Disponible' : room.status === 'maintenance' ? 'Mantenimiento' : 'Inactivo'}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-3 mt-1">
                                                <div className="flex items-center gap-1 text-[9px] font-bold text-gray-400 uppercase">
                                                    <Clock className="w-3 h-3" /> Capacidad: {room.capacity} ses.
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button onClick={() => openEditRoomModal(room)} className="p-2.5 text-gray-300 hover:text-brand-primary hover:bg-brand-primary/5 rounded-xl transition-all"><Pencil className="w-4 h-4" /></button>
                                        <button onClick={() => deleteRoom(room.id)} className="p-2.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"><Trash2 className="w-4 h-4" /></button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </SideModal>
      </div>
    </AuthenticatedLayout>
  );
}