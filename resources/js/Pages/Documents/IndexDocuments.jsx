import { useState, useMemo } from "react";
import {
  FileText,
  Plus,
  Users,
  Printer,
  CheckCircle,
  XCircle,
  FileCheck,
  Trash2,
  AlertTriangle,
  Layers,
  Wallet,
  Calculator,
  UploadCloud,
  RefreshCw,
  ShieldCheck,
  Receipt,
} from "lucide-react";
import { Head, useForm } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { DTES_TYPES, getDtesConfigByCode } from "@/constants/dtesTypes";
import List from "./partials/List";
import CafUploadModal from "./partials/CafUploadModal";
import DteConfigModal from "./partials/DteConfigModal";
import RutInput from "@/components/RutInput";
import SearchSelect from "@/components/SearchSelect";
import EnterpriseSelect from "@/components/EnterpriseSelect";
import Checkbox from "@/components/Checkbox";
import Switch from "@/components/Switch";
import Modal from "@/components/Modal";
import PrimaryButton from "@/components/PrimaryButton";
import SecondaryButton from "@/components/SecondaryButton";
import Swal from "sweetalert2";
import axios from "axios";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { fmtDate } from "@/utils/utils";

export default function IndexDocuments({
  company,
  dte_config,
  is_configured,
  invoices,
  communes,
  patients,
  sellables,
  caf_stats,
}) {
  const [activeTab, setActiveTab] = useState("list");
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [isCafModalOpen, setIsCafModalOpen] = useState(false);
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [isChangingType, setIsChangingType] = useState(false);
  const [isLoadingRut, setIsLoadingRut] = useState(false);

  const COLORS = ["#3292b3", "#79d0ec", "#858793", "#ef4444", "#f59e0b"];

  const tabs = [
    { id: "list", label: "Registro de Ventas", icon: FileText },
    { id: "create", label: "Nueva Emisión", icon: Plus },
  ];

  const active_caf = caf_stats || [];

  const { data, setData, post, processing, errors, reset } = useForm({
    dte_type: "",
    issue_date: new Date().toISOString().split("T")[0],
    expiration_date: "",
    client: {
      rut: "",
      razonSocial: "",
      giro: "",
      direccion: "",
      comuna: "",
      ciudad: "Santiago",
    },
    patient_id: null,
    items: [],
    global_discount: 0,
    payment_method: "Efectivo",
    transaction_number: "",
    transaction_date: "",
    observations: "",
    reference_doc: "",
    ref_code: "1",
    reason: "",
    simulate: true,
  });

  const dashboardStats = useMemo(() => {
    const netos = invoices.reduce(
      (sum, d) => sum + (d.net_amount_clp || 0),
      0
    );
    const exentos = invoices.reduce(
      (sum, d) => sum + (d.exempt_amount_clp || 0),
      0
    );
    const ivas = invoices.reduce((sum, d) => sum + (d.vat_amount_clp || 0), 0);
    const total = netos + exentos + ivas;
    const pendientes_pago = invoices
      .filter((d) => d.payment_status !== "paid")
      .reduce((sum, d) => sum + (d.total_amount_clp || 0), 0);
    return {
      totalMonto: total,
      ticketPromedio:
        invoices.length > 0 ? Math.round(total / invoices.length) : 0,
      deudaPendiente: pendientes_pago,
      rechazados: invoices.filter((d) => d.dte_status === "rejected").length,
      aceptados: invoices.filter((d) => d.dte_status === "accepted").length,
      incomeData: [
        { name: "Neto", value: netos },
        { name: "Exento", value: exentos },
        { name: "IVA", value: ivas },
      ],
    };
  }, [invoices]);

  const esRutEmpresa = (rut) => {
    if (!rut) return false;
    const num = parseInt(rut.replace(/\./g, "").split("-")[0]);
    return num > 50000000;
  };

  const calculateItemTotal = (item) => {
    const subtotal =
      (Number(item.quantity) || 0) * (Number(item.unitPrice) || 0);
    const discount = subtotal * ((Number(item.discount_clp) || 0) / 100);
    return Math.max(0, subtotal - discount);
  };

  const calculateTotals = () => {
    let net_subtotal = 0;
    let exempt_subtotal = 0;
    data.items.forEach((item) => {
      const lineTotal = calculateItemTotal(item);
      if (item.is_exempt) exempt_subtotal += lineTotal;
      else net_subtotal += lineTotal;
    });
    let remainingDiscount = Number(data.global_discount) || 0;
    if (net_subtotal >= remainingDiscount) net_subtotal -= remainingDiscount;
    else {
      remainingDiscount -= net_subtotal;
      net_subtotal = 0;
      exempt_subtotal = Math.max(0, exempt_subtotal - remainingDiscount);
    }
    const iva = Math.round(net_subtotal * 0.19);
    const total = net_subtotal + exempt_subtotal + iva;

    let suggestedType = null;
    if (data.items.length > 0 && data.client.rut) {
      const isExemptOnly = data.items.every((i) => i.is_exempt);
      const isB2B =
        esRutEmpresa(data.client.rut) ||
        (data.client.giro && data.client.giro !== "Particular");
      suggestedType = isB2B ? (isExemptOnly ? 34 : 33) : isExemptOnly ? 41 : 39;
    }

    return {
      subtotal_items: data.items.reduce(
        (sum, i) => sum + calculateItemTotal(i),
        0
      ),
      subtotal_clp: net_subtotal,
      exempt_subtotal,
      iva,
      total,
      suggestedType,
    };
  };

  const addItem = (sellable = null) => {
    let description = "";
    if (sellable) {
      // Lógica para construir descripción detallada
      if (sellable.type === 'Producto') {
        description = `${sellable.name}${sellable.sku ? ` (SKU: ${sellable.sku})` : ''}`;
      } else if (sellable.type === 'Servicio') {
        description = `${sellable.name}${sellable.code ? ` (Cod: ${sellable.code})` : ''}`;
      } else if (sellable.type === 'Plan') {
        const details = sellable.details ? ` [Incluye: ${sellable.details}]` : '';
        const validity = sellable.valid_months ? ` - Vigencia ${sellable.valid_months} meses` : '';
        description = `Plan ${sellable.name}${details}${validity}`;
      } else {
        description = sellable.name;
      }
    }

    setData("items", [
      ...data.items,
      {
        description: description,
        quantity: 1,
        unitPrice: sellable ? sellable.price : 0,
        discount_clp: 0,
        comment: "",
        is_exempt: sellable ? !!sellable.is_exempt : false,
        sellable_id: sellable ? sellable.id : undefined,
        sellable_type: sellable ? sellable.sellable_type : undefined,
      },
    ]);
  };

  const updateItem = (index, field, value) => {
    const newItems = [...data.items];
    newItems[index][field] = value;
    setData("items", newItems);
  };

  const handleTypeChange = (newType) => {
    if (newType === data.dte_type) return;
    const performChange = () => {
      setIsChangingType(true);
      setData((current) => ({
        ...current,
        dte_type: newType,
        patient_id: null,
        client: {
          rut: "",
          razonSocial: "",
          giro: "",
          direccion: "",
          comuna: "",
          ciudad: "Santiago",
        },
        items: [],
        reference_doc: "",
        reason: "",
        observations: "",
      }));
      setTimeout(() => setIsChangingType(false), 400);
    };
    if (data.items.length > 0 || data.client.rut) {
      Swal.fire({
        title: "¿Cambiar Tipo?",
        text: "Se perderán los datos actuales del borrador.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3292b3",
      }).then((result) => result.isConfirmed && performChange());
    } else performChange();
  };

  const handleCreateDocument = (e) => {
    e.preventDefault();
    const totals = calculateTotals();
    const emitirDTE = (finalType = data.dte_type) => {
      post(route("documents.store"), {
        onBefore: () => {
          data.dte_type = finalType;
        },
        onSuccess: () => {
          setActiveTab("list");
          reset();
          Swal.fire("¡Éxito!", "Documento generado correctamente.", "success");
        },
      });
    };
    if (
      ![61, 56].includes(data.dte_type) &&
      totals.suggestedType !== data.dte_type
    ) {
      const configSugerida = getDtesConfigByCode(totals.suggestedType);
      Swal.fire({
        title: "DTE Sugerido",
        text: `Según los datos, el documento debería ser: ${configSugerida.label}. ¿Desea corregir y emitir?`,
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Sí, corregir",
        cancelButtonText: "Mantener actual",
      }).then((result) =>
        result.isConfirmed ? emitirDTE(totals.suggestedType) : emitirDTE()
      );
      return;
    }
    Swal.fire({
      title: "¿Confirmar Emisión?",
      text: "El documento será procesado oficialmente ante el SII.",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#3292b3",
    }).then((result) => result.isConfirmed && emitirDTE());
  };

  const handleRetrySII = async (invoice) => {
    const isSent = invoice.dte_status === "sent";
    const identifier = invoice.dte_folio
      ? `folio ${invoice.dte_folio}`
      : `documento #${invoice.id}`;

    Swal.fire({
      title: isSent ? "Sincronizar con SII" : "¿Emitir al SII?",
      text: isSent
        ? `Se consultará el estado del ${identifier} en el SII.`
        : `Se intentará emitir el ${identifier} oficialmente.`,
      icon: "info",
      showCancelButton: true,
      confirmButtonText: isSent ? "Consultar" : "Sí, emitir",
      showLoaderOnConfirm: true,
      preConfirm: async () => {
        try {
          const endpoint = isSent
            ? route("dte.status", invoice.id)
            : route("dte.issue", invoice.id);
          const response = await axios[isSent ? "get" : "post"](endpoint);
          return response.data;
        } catch (error) {
          Swal.showValidationMessage(
            `Error: ${error.response?.data?.message || "Fallo"}`
          );
        }
      },
      allowOutsideClick: () => !Swal.isLoading(),
    }).then((result) => {
      if (result.isConfirmed && result.value?.success) {
        Swal.fire("Éxito", result.value.message, "success").then(() =>
          window.location.reload()
        );
      }
    });
  };

  const handleDuplicate = (invoice) => {
    setData({
      ...data,
      dte_type: invoice.dte_type,
      patient_id: invoice.patient_id,
      client: {
        rut: invoice.patient?.rut || "",
        razonSocial: invoice.patient?.full_name || "",
        giro: invoice.metadata?.client?.giro || "Particular",
        direccion: invoice.metadata?.client?.direccion || "",
        comuna: invoice.metadata?.client?.comuna || "",
        ciudad: invoice.metadata?.client?.ciudad || "Santiago",
      },
      items: (invoice.items || []).map((item) => ({
        description: item.description,
        quantity: item.quantity,
        unitPrice: item.unit_price_clp,
        discount_clp: item.discount_percentage || 0,
        comment: item.comment || "",
        is_exempt: !!item.is_exento,
        sellable_id: item.sellable_id,
        sellable_type: item.sellable_type,
      })),
      global_discount: invoice.global_discount_clp || 0,
      payment_method: invoice.metadata?.payment_method || "Efectivo",
      observations: invoice.observations || "",
      reference_doc: "",
      reason: "",
    });
    setActiveTab("create");
    Swal.fire({
      toast: true,
      position: "top-end",
      icon: "info",
      title: "Documento cargado",
      text: "Puede editar y generar una nueva versión.",
      showConfirmButton: false,
      timer: 4000,
    });
  };

  const handleRutBlur = async () => {
    if (!data.client.rut || data.client.rut.length < 8 || data.dte_type === 61)
      return;
    setIsLoadingRut(true);
    try {
      const response = await axios.get(
        route("external-data.company", data.client.rut)
      );
      const res = response.data;
      if (res.success) {
        setData((d) => ({
          ...d,
          client: {
            ...d.client,
            razonSocial: res.data.razon_social,
            giro: res.data.giro,
            direccion: res.data.direccion || d.client.direccion,
            comuna: res.data.comuna || d.client.comuna,
          },
        }));
        Swal.fire({
          toast: true,
          position: "top-end",
          icon: "success",
          title: "Datos de empresa cargados",
          showConfirmButton: false,
          timer: 3000,
        });
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoadingRut(false);
    }
  };

  const handleReferenceBlur = async () => {
    if (!data.reference_doc) return;
    try {
      const response = await axios.get(route("dte.lookup", data.reference_doc));
      const doc = response.data;
      if (doc.found) {
        setData((d) => ({
          ...d,
          patient_id: doc.patient_id,
          client: doc.client,
          global_discount: doc.global_discount || 0,
          observations: doc.observations || "",
          items: (doc.items || []).map((item) => ({
            description: item.description,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            discount_clp: item.discount_clp || 0,
            comment: item.comment || "",
            is_exempt: item.is_exempt || false,
            sellable_id: item.sellable_id,
            sellable_type: item.sellable_type,
          })),
          reason:
            d.reason || `Referencia a ${doc.type_name} del ${doc.issue_date}`,
        }));
      }
    } catch (error) {
      if (error.response?.status === 404)
        Swal.fire({ icon: "warning", title: "No encontrado" });
    }
  };

  const selectedDte = getDtesConfigByCode(data.dte_type);
  const docStyles = selectedDte.styles || {};
  const esNotaCredito = data.dte_type === 61;

  return (
    <AuthenticatedLayout>
      <Head title="Centro de Facturación SII" />
      <div className="min-h-screen p-6 md:p-10 bg-gray-50/50">
        <div className="max-w-400 mx-auto space-y-10">
          {/* HEADER HERO ENTERPRISE */}
          <div className="relative p-8 overflow-hidden bg-white border border-gray-100 shadow-sm rounded-xl">
            <div className="absolute top-0 right-0 w-64 h-64 -mt-32 -mr-32 rounded-full opacity-50 bg-brand-primary/5 blur-3xl"></div>

            <div className="relative z-10 flex flex-col justify-between gap-8 md:flex-row md:items-center">
              <div className="flex items-center gap-5">
                <div className="flex items-center justify-center w-16 h-16 text-white transform shadow-xl bg-brand-primary rounded-2xl shadow-brand-primary/20 rotate-3">
                  <Receipt className="w-8 h-8" />
                </div>
                <div>
                  <h1 className="mb-2 text-3xl font-black leading-none tracking-tight text-gray-900 uppercase">
                    Facturación Electrónica
                  </h1>
                  <p className="text-[10px] font-black text-brand-gray uppercase tracking-[0.2em] flex items-center gap-2">
                    <ShieldCheck className="w-3.5 h-3.5 text-green-500" />
                    Conexión Directa con SII • {company.business_name}
                  </p>
                </div>
              </div>

              <div className="flex p-1.5 bg-gray-100 rounded-2xl w-fit shrink-0">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center gap-2 ${
                      activeTab === tab.id
                        ? "bg-white text-brand-primary shadow-sm"
                        : "text-brand-gray hover:text-gray-600"
                    }`}
                  >
                    <tab.icon className="w-4 h-4" /> {tab.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="duration-500 animate-in fade-in">
            {activeTab === "list" && (
              <div className="space-y-10">
                {/* DASHBOARD STATS */}
                <div className="grid grid-cols-1 gap-6 md:grid-cols-4 lg:grid-cols-12">
                  <div className="flex items-center p-6 bg-white border border-gray-100 shadow-sm rounded-xl lg:col-span-3 group hover:scale-[1.02] transition-all">
                    <div className="shrink-0 w-24 h-24">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={dashboardStats.incomeData}
                            innerRadius={20}
                            outerRadius={32}
                            paddingAngle={5}
                            dataKey="value"
                          >
                            {dashboardStats.incomeData.map((entry, index) => (
                              <Cell
                                key={index}
                                fill={COLORS[index % COLORS.length]}
                              />
                            ))}
                          </Pie>
                          <Tooltip
                            formatter={(val) => `$${(val / 1000).toFixed(0)}k`}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="ml-4">
                      <p className="enterprise-label text-[8px]! opacity-60 mb-1">
                        Ventas Mes
                      </p>
                      <p className="font-mono text-2xl font-black leading-none text-gray-900">
                        ${(dashboardStats.totalMonto / 1000).toFixed(0)}k
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col justify-center p-6 bg-white border border-gray-100 shadow-sm rounded-xl lg:col-span-2 hover:scale-[1.02] transition-all">
                    <p className="enterprise-label text-[8px]! opacity-60 mb-2 flex items-center gap-2">
                      <Calculator className="w-3 h-3 text-purple-400" /> Ticket
                      Promedio
                    </p>
                    <p className="font-mono text-xl font-black text-gray-900">
                      ${(dashboardStats.ticketPromedio / 1000).toFixed(0)}k
                    </p>
                  </div>

                  <div className="flex flex-col justify-center p-6 bg-white border-b-4 border-orange-400 shadow-sm rounded-xl lg:col-span-2 hover:scale-[1.02] transition-all">
                    <p className="enterprise-label text-[8px]! text-orange-600 mb-2 flex items-center gap-2">
                      <Wallet className="w-3 h-3" /> Por Cobrar
                    </p>
                    <p className="font-mono text-xl font-black text-gray-900">
                      ${(dashboardStats.deudaPendiente / 1000).toFixed(0)}k
                    </p>
                  </div>

                  <div className="flex flex-col justify-center p-6 bg-white border-b-4 border-green-500 shadow-sm rounded-xl lg:col-span-2 hover:scale-[1.02] transition-all">
                    <p className="enterprise-label text-[8px]! text-green-600 mb-2 flex items-center gap-2">
                      <CheckCircle className="w-3 h-3" /> Aceptados
                    </p>
                    <p className="font-mono text-xl font-black text-gray-900">
                      {dashboardStats.aceptados}
                    </p>
                  </div>

                  <div
                    className={`p-6 bg-white border-b-4 border-gray-100 shadow-sm rounded-xl flex flex-col justify-center lg:col-span-3 transition-all hover:scale-[1.02] ${
                      dashboardStats.rechazados > 0
                        ? "border-red-500 bg-red-50/10"
                        : ""
                    }`}
                  >
                    <p
                      className={`enterprise-label text-[8px]! mb-2 flex items-center gap-2 ${
                        dashboardStats.rechazados > 0
                          ? "text-red-600"
                          : "opacity-60"
                      }`}
                    >
                      <XCircle
                        className={`w-3 h-3 ${
                          dashboardStats.rechazados > 0 ? "text-red-500" : ""
                        }`}
                      />{" "}
                      Rechazos SII
                    </p>
                    <p
                      className={`text-xl font-black font-mono ${
                        dashboardStats.rechazados > 0
                          ? "text-red-700"
                          : "text-gray-900"
                      }`}
                    >
                      {dashboardStats.rechazados}
                    </p>
                  </div>
                </div>

                <div className="grid items-start grid-cols-1 gap-8 lg:grid-cols-12">
                  <div className="lg:col-span-9">
                    <List
                      invoices={invoices}
                      setSelectedDocument={setSelectedDocument}
                      DTES_TYPES={DTES_TYPES}
                      onRetrySII={handleRetrySII}
                      onDuplicate={handleDuplicate}
                    />
                  </div>

                  <div className="space-y-6 lg:col-span-3 lg:sticky lg:top-10">
                    {/* CAF WIDGET */}
                    <div className="p-8 bg-white border border-gray-100 shadow-xl rounded-[2.5rem] relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-32 h-32 -mt-16 -mr-16 rounded-full bg-brand-primary/5 blur-2xl"></div>
                      <div className="relative z-10 flex items-center gap-3 mb-8">
                        <div className="p-2 bg-brand-secondary/10 text-brand-primary rounded-xl">
                          <Layers className="w-5 h-5" />
                        </div>
                        <p className="text-gray-900 enterprise-label mb-0!">
                          Folios Autorizados
                        </p>
                      </div>

                      <div className="relative z-10 space-y-6">
                        {active_caf.length > 0 ? (
                          active_caf.map((caf, idx) => {
                            const dteConfig = getDtesConfigByCode(caf.type);
                            const progress = Math.min(
                              100,
                              (caf.used / caf.total) * 100
                            );
                            return (
                              <div key={idx} className="space-y-3">
                                <div className="flex items-end justify-between">
                                  <div>
                                    <p className="text-[10px] font-black text-gray-700 uppercase tracking-tight mb-1">
                                      {dteConfig.label}
                                    </p>
                                    <p className="text-[9px] font-bold text-gray-400 uppercase font-mono">
                                      Rango: {caf.from}-{caf.to}
                                    </p>
                                  </div>
                                  <div className="text-right">
                                    <span
                                      className={`font-mono font-black text-base ${
                                        caf.available < 10
                                          ? "text-red-600 animate-pulse"
                                          : "text-brand-primary"
                                      }`}
                                    >
                                      {caf.available}
                                    </span>
                                    <p className="text-[8px] font-bold text-gray-400 uppercase">
                                      Libres
                                    </p>
                                  </div>
                                </div>
                                <div className="w-full h-2 overflow-hidden border border-gray-100 rounded-full bg-gray-50">
                                  <div
                                    className={`h-full transition-all duration-1000 ${
                                      caf.available < 10
                                        ? "bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.4)]"
                                        : "bg-brand-secondary"
                                    }`}
                                    style={{ width: `${progress}%` }}
                                  ></div>
                                </div>
                              </div>
                            );
                          })
                        ) : (
                          <div className="py-10 text-center opacity-30">
                            <AlertTriangle className="w-10 h-10 mx-auto mb-3" />
                            <p className="text-[9px] font-black uppercase tracking-widest">
                              Sin folios activos
                            </p>
                          </div>
                        )}
                      </div>

                      <button
                        onClick={() => setIsCafModalOpen(true)}
                        className="w-full mt-8 py-4 bg-brand-primary text-white rounded-2xl font-black uppercase tracking-widest text-[9px] shadow-lg shadow-brand-primary/20 hover:brightness-110 transition-all flex items-center justify-center gap-2 active:scale-95"
                      >
                        <UploadCloud className="w-4 h-4" /> Cargar Nuevo CAF
                      </button>
                    </div>

                    {/* CONFIG SII WIDGET */}
                    <div className="p-8 bg-gray-900 text-white shadow-2xl rounded-[2.5rem] relative overflow-hidden group">
                      <div className="absolute top-0 right-0 w-32 h-32 -mt-16 -mr-16 transition-transform duration-700 rounded-full bg-white/5 blur-2xl group-hover:scale-150"></div>
                      <div className="relative z-10 flex items-center gap-3 mb-6">
                        <ShieldCheck
                          className={`w-5 h-5 ${
                            is_configured ? "text-green-400" : "text-orange-400"
                          }`}
                        />
                        <p className="text-white/80 enterprise-label mb-0!">
                          Configuración SII
                        </p>
                      </div>
                      <div className="relative z-10">
                        <p className="mb-6 text-xl font-black tracking-tight">
                          {is_configured
                            ? "Certificado Activo"
                            : "Pendiente Configurar"}
                        </p>
                        <button
                          onClick={() => setIsConfigModalOpen(true)}
                          className="w-full py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl font-black uppercase tracking-widest text-[9px] transition-all border border-white/10"
                        >
                          Gestionar Credenciales
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "create" && (
              <div className="flex flex-col gap-10">
                {!is_configured && (
                  <div className="p-8 border-2 border-orange-100 bg-orange-50/50 rounded-[2.5rem] flex items-center justify-between gap-6 animate-pulse">
                    <div className="flex items-center gap-5">
                      <div className="p-4 text-orange-500 bg-white shadow-sm rounded-2xl">
                        <AlertTriangle className="w-8 h-8" />
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-orange-800 uppercase tracking-widest mb-1">
                          Configuración Requerida
                        </p>
                        <p className="text-sm font-bold text-orange-700/70">
                          Debe vincular su Certificado Digital para realizar
                          emisiones reales.
                        </p>
                      </div>
                    </div>
                    <SecondaryButton
                      onClick={() => setIsConfigModalOpen(true)}
                      className="border-orange-200! text-orange-700!"
                    >
                      Configurar Ahora
                    </SecondaryButton>
                  </div>
                )}

                {/* SELECTOR TIPO DTE PREMIUM */}
                <div className="flex flex-wrap justify-center gap-3 p-2 bg-white border border-gray-100 shadow-xl rounded-3xl">
                  {DTES_TYPES.map((type) => (
                    <button
                      key={type.code}
                      type="button"
                      onClick={() => handleTypeChange(type.code)}
                      className={`px-6 py-3 rounded-2xl border-2 flex items-center gap-3 transition-all text-[10px] font-black uppercase tracking-widest ${
                        data.dte_type === type.code
                          ? `${type.styles.border} ${type.styles.bg} ${type.styles.text} shadow-lg scale-105`
                          : "border-transparent bg-white text-gray-400 hover:bg-gray-50"
                      }`}
                    >
                      <type.icon className="w-4 h-4" /> {type.label}
                    </button>
                  ))}
                </div>

                {data.dte_type ? (
                  <div
                    className={`grid grid-cols-1 lg:grid-cols-12 gap-8 items-start transition-all duration-500 ${
                      isChangingType
                        ? "opacity-30 blur-sm scale-95"
                        : "opacity-100"
                    }`}
                  >
                    <div className="space-y-10 lg:col-span-8">
                      {/* FORMULARIO PRINCIPAL */}
                      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                        {/* RECEPTOR */}
                        <div className="bg-white border border-gray-100 shadow-xl rounded-[2.5rem] overflow-hidden">
                          <div className="flex items-center gap-3 p-6 border-b border-gray-100 bg-gray-50/50">
                            <Users className="w-4 h-4 text-brand-primary" />
                            <h3 className="enterprise-label mb-0!">
                              Identificación del Receptor
                            </h3>
                          </div>
                          <div className="p-8 space-y-6">
                            <SearchSelect
                              label="Buscar Paciente"
                              options={patients.map(p => ({ value: p.id, label: `${p.full_name || `${p.name} ${p.last_name}`} ${p.rut ? `(${p.rut})` : ''}` }))}
                              value={data.patient_id || ''}
                              onChange={(val) => {
                                const patient = patients.find(p => p.id === val);
                                if (patient) {
                                  setData((d) => ({
                                    ...d,
                                    patient_id: patient.id,
                                    client: {
                                      rut: patient.rut,
                                      razonSocial: patient.full_name,
                                      giro: "Particular",
                                      direccion: patient.address
                                        ? `${patient.address.street} ${patient.address.number || ""}`
                                        : "",
                                      comuna: patient.address?.commune_name || "",
                                      ciudad: patient.address?.region_name || "Santiago",
                                    },
                                  }));
                                } else {
                                  setData((d) => ({
                                      ...d,
                                      patient_id: null,
                                      client: { ...d.client, rut: "", razonSocial: "", giro: "", direccion: "", comuna: "", ciudad: "" },
                                  }));
                                }
                              }}
                              placeholder="Buscar en base de datos..."
                            />
                            <div className="grid grid-cols-2 gap-6">
                              <div className="space-y-1">
                                <label className="ml-1 enterprise-label opacity-60">
                                  RUT Fiscal
                                </label>
                                <div className="relative">
                                  <RutInput
                                    value={data.client.rut}
                                    onChange={(v) =>
                                      setData((d) => ({
                                        ...d,
                                        client: { ...d.client, rut: v },
                                      }))
                                    }
                                    onBlur={handleRutBlur}
                                    disabled={esNotaCredito || isLoadingRut}
                                    className="w-full rounded-2xl! py-4! font-mono font-black"
                                  />
                                  {isLoadingRut && (
                                    <RefreshCw className="absolute w-4 h-4 right-4 top-4 text-brand-primary animate-spin" />
                                  )}
                                </div>
                              </div>
                              <div className="space-y-1">
                                <label className="ml-1 enterprise-label opacity-60">
                                  Giro Actividad
                                </label>
                                <input
                                  type="text"
                                  value={data.client.giro}
                                  onChange={(e) =>
                                    setData((d) => ({
                                      ...d,
                                      client: {
                                        ...d.client,
                                        giro: e.target.value,
                                      },
                                    }))
                                  }
                                  readOnly={esNotaCredito}
                                  className="w-full px-5 py-4 text-sm font-bold border-gray-100 rounded-2xl bg-gray-50/30"
                                />
                              </div>
                            </div>
                            <div className="space-y-1">
                              <label className="ml-1 enterprise-label opacity-60">
                                Razón Social / Nombre
                              </label>
                              <input
                                type="text"
                                value={data.client.razonSocial}
                                onChange={(e) =>
                                  setData((d) => ({
                                    ...d,
                                    client: {
                                      ...d.client,
                                      razonSocial: e.target.value,
                                    },
                                  }))
                                }
                                readOnly={esNotaCredito}
                                className="w-full px-5 py-4 text-sm font-black uppercase border-gray-100 rounded-2xl"
                              />
                            </div>
                          </div>
                        </div>

                        {/* CONFIGURACIÓN */}
                        <div className="bg-white border border-gray-100 shadow-xl rounded-[2.5rem] overflow-hidden">
                          <div className="flex items-center gap-3 p-6 border-b border-gray-100 bg-gray-50/50">
                            <FileText className="w-4 h-4 text-brand-primary" />
                            <h3 className="enterprise-label mb-0!">
                              Parámetros del Documento
                            </h3>
                          </div>
                          <div className="p-8 space-y-6">
                            <div className="grid grid-cols-2 gap-6">
                              <div className="space-y-1">
                                <label className="ml-1 enterprise-label opacity-60">
                                  Fecha Emisión
                                </label>
                                <input
                                  type="date"
                                  value={data.issue_date}
                                  onChange={(e) =>
                                    setData("issue_date", e.target.value)
                                  }
                                  className="w-full px-5 py-4 font-mono text-sm font-black border-gray-100 rounded-2xl"
                                />
                              </div>
                              <div className="space-y-1">
                                <EnterpriseSelect
                                  label="Medio de Pago"
                                  value={data.payment_method}
                                  onChange={(val) => setData("payment_method", val)}
                                  options={[
                                    { value: 'Efectivo', label: 'Efectivo' },
                                    { value: 'Transferencia', label: 'Transferencia' },
                                    { value: 'Tarjeta de Débito', label: 'Tarjeta de Débito' },
                                    { value: 'Tarjeta de Crédito', label: 'Tarjeta de Crédito' },
                                  ]}
                                />
                              </div>
                            </div>
                            {esNotaCredito && (
                              <div className="p-6 bg-orange-50 border border-orange-100 rounded-[1.5rem] space-y-4 animate-in slide-in-from-top-4">
                                <div className="space-y-1">
                                  <label className="enterprise-label text-orange-700! ml-1">
                                    Folio a Anular/Corregir
                                  </label>
                                  <input
                                    type="text"
                                    value={data.reference_doc}
                                    onBlur={handleReferenceBlur}
                                    onChange={(e) =>
                                      setData("reference_doc", e.target.value)
                                    }
                                    className="w-full px-4 py-3 font-mono font-black text-orange-900 border-orange-200 rounded-xl"
                                  />
                                </div>
                                <div className="space-y-1">
                                  <EnterpriseSelect
                                    label="Tipo de Corrección"
                                    value={data.ref_code}
                                    onChange={(val) => setData("ref_code", val)}
                                    options={[
                                      { value: '1', label: '1: Anular Documento' },
                                      { value: '2', label: '2: Corregir Texto' },
                                      { value: '3', label: '3: Corregir Monto' },
                                    ]}
                                    className="border-orange-200!" // Custom style passing
                                  />
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* DETALLE DE ÍTEMS */}
                      <div className="bg-white border border-gray-100 shadow-xl rounded-[2.5rem] overflow-hidden">
                        <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gray-50/50">
                          <div className="flex-1 max-w-sm">
                            {!esNotaCredito && (
                              <SearchSelect
                                label="Añadir Producto, Servicio o Plan..."
                                options={sellables.map(s => ({ 
                                  value: s.unique_id, 
                                  label: s.name, 
                                  searchLabel: `${s.type} ${s.name} ${s.price}`,
                                  type: s.type,
                                  price: s.price,
                                  details: s.details, // Para planes
                                  sku: s.sku, // Para productos
                                  code: s.code, // Para servicios
                                  original: s
                                }))}
                                config={{ 
                                  valueKey: 'value', 
                                  displayKey: 'label', 
                                  searchKeys: ['label', 'searchLabel'] 
                                }}
                                onChange={(val) => {
                                  const option = sellables.find(s => s.unique_id === val);
                                  if (option) {
                                    addItem(option);
                                  }
                                }}
                                renderOption={(option) => {
                                  let typeColor = "bg-gray-100 text-gray-600";
                                  let Icon = Layers;
                                  
                                  if (option.type === 'Plan') { typeColor = "bg-blue-100 text-blue-700"; }
                                  else if (option.type === 'Servicio') { typeColor = "bg-purple-100 text-purple-700"; }
                                  else if (option.type === 'Producto') { typeColor = "bg-emerald-100 text-emerald-700"; }

                                  return (
                                    <div className="px-4 py-3 flex items-center justify-between gap-4">
                                      <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                          <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider ${typeColor}`}>
                                            {option.type}
                                          </span>
                                          {option.sku && <span className="text-[9px] font-mono text-gray-400">SKU: {option.sku}</span>}
                                          {option.code && <span className="text-[9px] font-mono text-gray-400">COD: {option.code}</span>}
                                        </div>
                                        <p className="font-bold text-gray-900 text-xs truncate">{option.label}</p>
                                        {option.details && (
                                          <p className="text-[9px] text-gray-500 truncate mt-0.5">{option.details}</p>
                                        )}
                                      </div>
                                      <div className="text-right whitespace-nowrap">
                                        <span className="font-mono font-black text-sm text-brand-primary">
                                          ${option.price.toLocaleString('es-CL')}
                                        </span>
                                      </div>
                                    </div>
                                  );
                                }}
                                placeholder="Buscar..."
                              />
                            )}
                          </div>
                          {!esNotaCredito && (
                            <button
                              onClick={() => addItem(null)}
                              className="px-6 py-2 bg-white border border-brand-primary/20 text-brand-primary rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-brand-primary hover:text-white transition-all"
                            >
                              + Manual
                            </button>
                          )}
                        </div>
                        <div className="overflow-x-auto">
                          <table className="w-full">
                            <thead className="border-b border-gray-100 bg-gray-50/30">
                              <tr className="enterprise-label">
                                <th className="px-8 py-4 text-left">
                                  Detalle de la Prestación
                                </th>
                                <th className="w-24 px-4 py-4 text-center">
                                  Cant
                                </th>
                                <th className="w-32 px-4 py-4 text-right">
                                  Precio Unit.
                                </th>
                                <th className="w-24 px-4 py-4 text-center">
                                  Exento
                                </th>
                                <th className="w-40 px-8 py-4 text-right">
                                  Total Línea
                                </th>
                                {!esNotaCredito && <th className="w-16"></th>}
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                              {data.items.map((item, index) => (
                                <tr
                                  key={index}
                                  className="transition-colors hover:bg-gray-50/50"
                                >
                                  <td className="px-8 py-4">
                                    <input
                                      type="text"
                                      value={item.description}
                                      onChange={(e) =>
                                        updateItem(
                                          index,
                                          "description",
                                          e.target.value
                                        )
                                      }
                                      readOnly={esNotaCredito}
                                      className="w-full p-0 text-xs font-black text-gray-800 uppercase bg-transparent border-none focus:ring-0"
                                    />
                                    <input
                                      type="text"
                                      value={item.comment || ""}
                                      onChange={(e) =>
                                        updateItem(
                                          index,
                                          "comment",
                                          e.target.value
                                        )
                                      }
                                      placeholder="Nota adicional..."
                                      className="w-full border-none p-0 focus:ring-0 text-[10px] text-gray-400 font-bold bg-transparent italic"
                                    />
                                  </td>
                                  <td className="px-4 py-4">
                                    <input
                                      type="number"
                                      value={item.quantity}
                                      onChange={(e) =>
                                        updateItem(
                                          index,
                                          "quantity",
                                          e.target.value
                                        )
                                      }
                                      className="w-full p-0 text-sm font-black text-center border-none focus:ring-0"
                                    />
                                  </td>
                                  <td className="px-4 py-4">
                                    <input
                                      type="number"
                                      value={item.unitPrice}
                                      onChange={(e) =>
                                        updateItem(
                                          index,
                                          "unitPrice",
                                          e.target.value
                                        )
                                      }
                                      className="w-full p-0 font-mono text-sm font-black text-right border-none focus:ring-0"
                                    />
                                  </td>
                                  <td className="px-4 py-4 text-center">
                                    <Checkbox
                                      checked={item.is_exempt}
                                      onChange={(e) =>
                                        updateItem(
                                          index,
                                          "is_exempt",
                                          e.target.checked
                                        )
                                      }
                                    />
                                  </td>
                                  <td className="px-8 py-4 font-mono text-sm font-black text-right text-brand-primary">
                                    $
                                    {calculateItemTotal(item).toLocaleString(
                                      "es-CL"
                                    )}
                                  </td>
                                  {!esNotaCredito && (
                                    <td className="px-4 text-center">
                                      <button
                                        onClick={() =>
                                          setData(
                                            "items",
                                            data.items.filter(
                                              (_, i) => i !== index
                                            )
                                          )
                                        }
                                        className="p-2 text-gray-300 transition-all rounded-lg hover:text-red-500 hover:bg-red-50"
                                      >
                                        <Trash2 className="w-4 h-4" />
                                      </button>
                                    </td>
                                  )}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>

                    {/* RESUMEN LATERAL */}
                    <div className="space-y-8 lg:col-span-4 lg:sticky lg:top-10">
                      <div className="bg-white border border-gray-100 shadow-2xl rounded-[2.5rem] overflow-hidden">
                        <div
                          className={`p-6 text-white text-center font-black uppercase tracking-[0.3em] text-[11px] ${docStyles.bg_cover}`}
                        >
                          Resumen de Emisión
                        </div>
                        <div className="p-8 space-y-8">
                          <div className="space-y-4 enterprise-label text-gray-400! border-b border-gray-50 pb-6">
                            <div className="flex items-center justify-between">
                              <span>Subtotal Bruto</span>
                              <span className="font-mono font-black text-gray-900">
                                $
                                {calculateTotals().subtotal_items.toLocaleString(
                                  "es-CL"
                                )}
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span>Descuento Global</span>
                              <input
                                type="number"
                                value={data.global_discount}
                                onChange={(e) =>
                                  setData("global_discount", e.target.value)
                                }
                                className="w-24 px-2 py-1 font-mono font-black text-right text-gray-900 border-gray-100 rounded-lg"
                              />
                            </div>
                          </div>
                          <div className="space-y-4 enterprise-label text-gray-400!">
                            <div className="flex items-center justify-between">
                              <span>Monto Neto</span>
                              <span className="font-mono font-black text-gray-900">
                                $
                                {calculateTotals().subtotal_clp.toLocaleString(
                                  "es-CL"
                                )}
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span>Monto Exento</span>
                              <span className="font-mono font-black text-gray-900">
                                $
                                {calculateTotals().exempt_subtotal.toLocaleString(
                                  "es-CL"
                                )}
                              </span>
                            </div>
                            {!selectedDte.exento && (
                              <div className="flex items-center justify-between text-brand-primary">
                                <span>IVA (19%)</span>
                                <span className="font-mono font-black">
                                  $
                                  {calculateTotals().iva.toLocaleString(
                                    "es-CL"
                                  )}
                                </span>
                              </div>
                            )}
                          </div>
                          <div
                            className={`p-8 rounded-[2rem] flex flex-col items-center gap-2 ${docStyles.bg}`}
                          >
                            <span
                              className={`enterprise-label mb-0! opacity-60 ${docStyles.text}`}
                            >
                              Total a Facturar
                            </span>
                            <span
                              className={`text-4xl font-black font-mono tracking-tighter ${docStyles.text}`}
                            >
                              ${calculateTotals().total.toLocaleString("es-CL")}
                            </span>
                          </div>
                          <PrimaryButton
                            onClick={handleCreateDocument}
                            disabled={
                              data.items.length === 0 ||
                              !data.client.rut ||
                              processing
                            }
                            className={`w-full py-6! rounded-[1.5rem]! text-[11px]! font-black uppercase tracking-widest shadow-2xl transition-all ${
                              data.items.length === 0 ||
                              !data.client.rut ||
                              processing
                                ? "bg-gray-100 text-gray-300"
                                : `${docStyles.bg_cover} text-white hover:brightness-110 shadow-brand-primary/20`
                            }`}
                          >
                            {processing ? (
                              <RefreshCw className="w-6 h-6 animate-spin" />
                            ) : (
                              <>
                                <FileCheck className="w-5 h-5" /> Emitir
                                Documento SII
                              </>
                            )}
                          </PrimaryButton>
                        </div>
                      </div>

                      <div className="p-8 bg-white border border-gray-100 shadow-xl rounded-[2.5rem] space-y-6">
                        <div className="space-y-2">
                          <label className="ml-1 enterprise-label opacity-60">
                            Observaciones Públicas
                          </label>
                          <textarea
                            value={data.observations}
                            onChange={(e) =>
                              setData("observations", e.target.value)
                            }
                            rows="3"
                            placeholder="Estas notas aparecerán en el PDF..."
                            className="w-full p-4 text-xs font-medium transition-all resize-none border-gray-50 bg-gray-50/50 rounded-2xl focus:bg-white focus:ring-brand-primary"
                          />
                        </div>
                        <div className="p-4 bg-gray-50/50 border border-gray-100 rounded-2xl">
                          <Switch
                            label="Modo Simulación (Sin SII)"
                            checked={data.simulate}
                            onChange={(e) =>
                              setData("simulate", e.target.checked)
                            }
                            className="w-full justify-between"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-white border-2 border-dashed border-gray-100 rounded-[3rem] p-32 text-center flex flex-col items-center justify-center space-y-6">
                    <div className="w-24 h-24 bg-gray-50 rounded-[2rem] flex items-center justify-center text-gray-200 transform rotate-12 group-hover:rotate-0 transition-transform">
                      <FileText className="w-12 h-12" />
                    </div>
                    <div>
                      <h3 className="mb-2 text-2xl font-black tracking-tight text-gray-900 uppercase">
                        Generador de Documentos
                      </h3>
                      <p className="text-[10px] font-black text-brand-gray uppercase tracking-[0.2em] opacity-60">
                        Seleccione un tipo de DTE para comenzar la emisión
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* DETALLE DOCUMENTO MODAL */}
          <Modal
            open={!!selectedDocument}
            onClose={() => setSelectedDocument(null)}
            title="Visor de Documento Fiscal"
            maxWidth="4xl"
          >
            {selectedDocument && (
              <div className="flex flex-col">
                <div
                  className={`p-8 text-white flex justify-between items-center ${
                    getDtesConfigByCode(selectedDocument.dte_type).styles
                      ?.bg_cover || "bg-brand-primary"
                  }`}
                >
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-60 mb-1">
                      Estatus SII
                    </p>
                    <span className="px-3 py-1 text-xs font-black tracking-widest uppercase rounded-lg bg-white/20">
                      {selectedDocument.dte_status}
                    </span>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-60 mb-1">
                      Folio Oficial
                    </p>
                    <p className="font-mono text-2xl font-black">
                      {selectedDocument.dte_folio || "S/N"}
                    </p>
                  </div>
                </div>
                <div className="p-10 space-y-10">
                  <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
                    <div className="space-y-1">
                      <p className="enterprise-label opacity-60">Emisión</p>
                      <p className="font-black text-gray-900">
                        {fmtDate(selectedDocument.issue_date)}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="enterprise-label opacity-60">Tipo</p>
                      <p className="text-xs font-black uppercase text-brand-primary">
                        {selectedDocument.type_name}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="enterprise-label opacity-60">Pago</p>
                      <p className="text-xs font-black text-gray-900 uppercase">
                        {selectedDocument.metadata?.payment_method || "---"}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="enterprise-label opacity-60">
                        Total Recaudado
                      </p>
                      <p className="font-mono text-xl font-black text-brand-primary">
                        $
                        {(
                          selectedDocument.amount_total_clp || 0
                        ).toLocaleString("es-CL")}
                      </p>
                    </div>
                  </div>

                  <div className="p-8 bg-gray-50 border border-gray-100 rounded-[2rem] grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                      <p className="mb-2 enterprise-label opacity-40">
                        Receptor
                      </p>
                      <p className="font-black text-gray-800 uppercase">
                        {selectedDocument.patient?.full_name || "Particular"}
                      </p>
                    </div>
                    <div>
                      <p className="mb-2 enterprise-label opacity-40">RUT</p>
                      <p className="font-mono font-black text-brand-gray">
                        {selectedDocument.patient?.rut || "---"}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <p className="enterprise-label text-brand-primary!">
                      Detalle de Cobro
                    </p>
                    <div className="overflow-hidden border border-gray-100 shadow-sm rounded-3xl">
                      <table className="w-full text-sm">
                        <thead className="border-b border-gray-100 bg-gray-50">
                          <tr className="enterprise-label text-[9px]">
                            <th className="px-6 py-4 text-left">Descripción</th>
                            <th className="w-20 px-4 py-4 text-center">Cant</th>
                            <th className="w-32 px-4 py-4 text-right">
                              Precio
                            </th>
                            <th className="w-32 px-6 py-4 text-right">Total</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                          {(selectedDocument.items || []).map((item, idx) => (
                            <tr
                              key={idx}
                              className="transition-colors hover:bg-gray-50"
                            >
                              <td className="px-6 py-4 text-xs font-bold text-gray-700 uppercase">
                                {item.description}
                              </td>
                              <td className="px-4 py-4 font-black text-center">
                                {item.quantity}
                              </td>
                              <td className="px-4 py-4 font-mono text-right text-gray-500">
                                $
                                {(item.unit_price_clp || 0).toLocaleString(
                                  "es-CL"
                                )}
                              </td>
                              <td className="px-6 py-4 font-mono font-black text-right text-brand-primary">
                                $
                                {(item.total_gross_clp || 0).toLocaleString(
                                  "es-CL"
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
                <div className="flex justify-end gap-4 p-10 border-t border-gray-100 bg-gray-50/50">
                  <SecondaryButton
                    onClick={() =>
                      window.open(
                        route("invoices.pdf", selectedDocument.id),
                        "_blank"
                      )
                    }
                    className="px-8! py-4! flex items-center gap-2"
                  >
                    <Printer className="w-4 h-4" /> Imprimir
                  </SecondaryButton>
                  <PrimaryButton
                    onClick={() => setSelectedDocument(null)}
                    className="px-10! py-4! shadow-xl shadow-brand-primary/20"
                  >
                    Cerrar Visor
                  </PrimaryButton>
                </div>
              </div>
            )}
          </Modal>

          <CafUploadModal
            isOpen={isCafModalOpen}
            onClose={() => setIsCafModalOpen(false)}
            company={company}
          />
          <DteConfigModal
            isOpen={isConfigModalOpen}
            onClose={() => setIsConfigModalOpen(false)}
            company={company}
            dteConfig={dte_config}
          />
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
